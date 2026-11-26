import { useSyncExternalStore } from 'react';
import { AppState } from 'react-native';
import type { SQLiteDatabase } from 'expo-sqlite';
import { getLocalDatabase } from './sqlite';
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
  supabase,
} from './supabase';
import { newUuid } from './uuid';

/**
 * Motor de sincronización real (outbox -> Supabase).
 *
 * - Offline-first: la mutación ya está en SQLite; si Supabase no responde,
 *   la fila queda PENDING y se reintenta.
 * - Espera 5 s antes de empujar: así el usuario puede deshacer sin que la
 *   operación llegue al servidor.
 * - IDs remotos UUID estables en el payload: un reintento no duplica.
 * - `SYNCED` solo se marca cuando Supabase confirmó TODAS las escrituras.
 */

export type SyncPhase = 'idle' | 'offline' | 'syncing' | 'done';

type Snapshot = { phase: SyncPhase; pending: number; progress: number };

type OutboxRow = {
  id: string;
  operation_type: 'SALE' | 'DISCARD';
  entity_name: string;
  payload: string;
  status: string;
  created_at: string;
};

type SalePayload = {
  saleId: string;
  batchId: string;
  quantity: number;
  total: number;
  unitPrice: number;
  saleNumber: string;
  saleDate: string;
  movementId: string;
  previousStock: number;
  resultingStock: number;
  remoteSaleId?: string;
  remoteItemId?: string;
  remoteMovementId?: string;
};

type DiscardPayload = {
  discardId: string;
  batchId: string;
  quantity: number;
  reason: string;
  discardDate: string;
  movementId: string;
  previousStock: number;
  resultingStock: number;
  remoteDiscardId?: string;
  remoteMovementId?: string;
};

const UNDO_GUARD_MS = 5000;
const POLL_MS = 8000;
const PROBE_TIMEOUT_MS = 4000;

let snapshot: Snapshot = { phase: 'idle', pending: 0, progress: 0 };
const listeners = new Set<() => void>();
let ticking = false;
let notifyTimer: ReturnType<typeof setTimeout> | null = null;
let doneTimer: ReturnType<typeof setTimeout> | null = null;
let guardTimer: ReturnType<typeof setTimeout> | null = null;
let watchers = 0;
let interval: ReturnType<typeof setInterval> | null = null;
let appStateSubscription: { remove: () => void } | null = null;

const batchCache = new Map<string, string>();
let contextPromise: Promise<{ pharmacyId: string | null; userId: string | null }> | null = null;

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function setSnapshot(next: Snapshot): void {
  if (
    next.phase === snapshot.phase &&
    next.pending === snapshot.pending &&
    next.progress === snapshot.progress
  ) {
    return;
  }
  snapshot = next;
  listeners.forEach((listener) => listener());
}

export function useSync(): Snapshot {
  return useSyncExternalStore(subscribe, () => snapshot, () => snapshot);
}

/** Re-cuenta pendientes y dispara el envío. La llama repository.ts. */
export function notifyLocalChange(): void {
  void tick();
  if (notifyTimer) clearTimeout(notifyTimer);
  notifyTimer = setTimeout(() => {
    notifyTimer = null;
    void tick();
  }, 600);
}

/**
 * Arranca el watcher. Es idempotente con refcount: repository.ts deja uno
 * permanente y el SyncBanner puede sumar/restar el suyo.
 */
export function startSyncWatcher(): () => void {
  watchers += 1;
  if (watchers === 1) {
    void tick();
    interval = setInterval(() => {
      void tick();
    }, POLL_MS);
    appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void tick();
    });
  }

  let stopped = false;
  return () => {
    if (stopped) return;
    stopped = true;
    watchers = Math.max(0, watchers - 1);
    if (watchers === 0) {
      if (interval) clearInterval(interval);
      interval = null;
      appStateSubscription?.remove();
      appStateSubscription = null;
    }
  };
}

async function database(): Promise<SQLiteDatabase | null> {
  try {
    return await getLocalDatabase();
  } catch {
    return null;
  }
}

async function countPending(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) AS count FROM sync_outbox WHERE status = 'PENDING'"
  );
  return row?.count ?? 0;
}

async function probe(): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id&limit=1`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      signal: controller.signal,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

async function remoteBatchId(lotCode: string): Promise<string> {
  const cached = batchCache.get(lotCode);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('batches')
    .select('id')
    .eq('batch_code', lotCode)
    .maybeSingle();

  if (error) throw new Error(`No se pudo leer el lote ${lotCode}: ${error.message}`);
  if (!data?.id) {
    throw new Error(
      `El lote ${lotCode} no existe en Supabase. Corré: node scripts/seed-supabase.cjs`
    );
  }
  batchCache.set(lotCode, data.id);
  return data.id;
}

async function getContext(): Promise<{ pharmacyId: string | null; userId: string | null }> {
  if (!contextPromise) {
    contextPromise = (async () => {
      const [pharmacy, user] = await Promise.all([
        supabase.from('pharmacies').select('id').limit(1).maybeSingle(),
        supabase.from('users').select('id').limit(1).maybeSingle(),
      ]);
      if (pharmacy.error) throw new Error(`pharmacies: ${pharmacy.error.message}`);
      if (user.error) throw new Error(`users: ${user.error.message}`);
      return {
        pharmacyId: pharmacy.data?.id ?? null,
        userId: user.data?.id ?? null,
      };
    })().catch((error) => {
      contextPromise = null;
      throw error;
    });
  }
  return contextPromise;
}

async function lotCodeFor(db: SQLiteDatabase, batchId: string): Promise<string> {
  const row = await db.getFirstAsync<{ batch_code: string }>(
    'SELECT batch_code FROM batches WHERE id = ?',
    [batchId]
  );
  if (!row?.batch_code) throw new Error(`No se encontró el lote local ${batchId}`);
  return row.batch_code;
}

async function savePayload(
  db: SQLiteDatabase,
  outboxId: string,
  payload: SalePayload | DiscardPayload
): Promise<void> {
  await db.runAsync('UPDATE sync_outbox SET payload = ? WHERE id = ?', [
    JSON.stringify(payload),
    outboxId,
  ]);
}

function throwIfError(label: string, error: { message: string } | null): void {
  if (error) throw new Error(`${label}: ${error.message}`);
}

async function pushSale(db: SQLiteDatabase, row: OutboxRow, payload: SalePayload): Promise<void> {
  const lotCode = await lotCodeFor(db, payload.batchId);
  const batchId = await remoteBatchId(lotCode);
  const { pharmacyId, userId } = await getContext();

  const remoteSaleId = payload.remoteSaleId ?? newUuid();
  const remoteItemId = payload.remoteItemId ?? newUuid();
  const remoteMovementId = payload.remoteMovementId ?? newUuid();
  if (
    !payload.remoteSaleId ||
    !payload.remoteItemId ||
    !payload.remoteMovementId
  ) {
    payload.remoteSaleId = remoteSaleId;
    payload.remoteItemId = remoteItemId;
    payload.remoteMovementId = remoteMovementId;
    await savePayload(db, row.id, payload);
  }

  const createdAt = new Date().toISOString();

  const sale = await supabase.from('sales').upsert(
    {
      id: remoteSaleId,
      pharmacy_id: pharmacyId,
      user_id: userId,
      sale_number: `${payload.saleNumber}-${remoteSaleId.slice(0, 8)}`,
      total_amount: payload.total,
      status: 'COMPLETED',
      sale_date: payload.saleDate,
      created_at: createdAt,
    },
    { onConflict: 'id' }
  );
  throwIfError('sales', sale.error);

  const item = await supabase.from('sale_items').upsert(
    {
      id: remoteItemId,
      sale_id: remoteSaleId,
      batch_id: batchId,
      quantity: payload.quantity,
      unit_price: payload.unitPrice,
      subtotal: payload.total,
      created_at: createdAt,
    },
    { onConflict: 'id' }
  );
  throwIfError('sale_items', item.error);

  const movement = await supabase.from('inventory_movements').upsert(
    {
      id: remoteMovementId,
      batch_id: batchId,
      user_id: userId,
      movement_type: 'SALE',
      quantity: -Math.abs(payload.quantity),
      previous_stock: payload.previousStock,
      resulting_stock: payload.resultingStock,
      reference_type: 'SALE',
      reference_id: remoteSaleId,
      movement_date: payload.saleDate,
      created_at: createdAt,
    },
    { onConflict: 'id' }
  );
  throwIfError('inventory_movements', movement.error);

  const batch = await supabase
    .from('batches')
    .update({ current_stock: payload.resultingStock, updated_at: createdAt })
    .eq('id', batchId);
  throwIfError('batches', batch.error);
}

async function pushDiscard(
  db: SQLiteDatabase,
  row: OutboxRow,
  payload: DiscardPayload
): Promise<void> {
  const lotCode = await lotCodeFor(db, payload.batchId);
  const batchId = await remoteBatchId(lotCode);
  const { pharmacyId, userId } = await getContext();

  const remoteDiscardId = payload.remoteDiscardId ?? newUuid();
  const remoteMovementId = payload.remoteMovementId ?? newUuid();
  if (!payload.remoteDiscardId || !payload.remoteMovementId) {
    payload.remoteDiscardId = remoteDiscardId;
    payload.remoteMovementId = remoteMovementId;
    await savePayload(db, row.id, payload);
  }

  const createdAt = new Date().toISOString();

  const discard = await supabase.from('discards').upsert(
    {
      id: remoteDiscardId,
      pharmacy_id: pharmacyId,
      user_id: userId,
      batch_id: batchId,
      quantity: payload.quantity,
      reason: payload.reason,
      notes: null,
      discard_date: payload.discardDate,
      created_at: createdAt,
    },
    { onConflict: 'id' }
  );
  throwIfError('discards', discard.error);

  const movement = await supabase.from('inventory_movements').upsert(
    {
      id: remoteMovementId,
      batch_id: batchId,
      user_id: userId,
      movement_type: 'DISCARD',
      quantity: -Math.abs(payload.quantity),
      previous_stock: payload.previousStock,
      resulting_stock: payload.resultingStock,
      reference_type: 'DISCARD',
      reference_id: remoteDiscardId,
      reason: payload.reason,
      movement_date: payload.discardDate,
      created_at: createdAt,
    },
    { onConflict: 'id' }
  );
  throwIfError('inventory_movements', movement.error);

  const batch = await supabase
    .from('batches')
    .update({ current_stock: payload.resultingStock, updated_at: createdAt })
    .eq('id', batchId);
  throwIfError('batches', batch.error);
}

async function pushOutbox(db: SQLiteDatabase, row: OutboxRow): Promise<void> {
  const payload = JSON.parse(row.payload) as SalePayload | DiscardPayload;
  if (row.operation_type === 'SALE') {
    await pushSale(db, row, payload as SalePayload);
    return;
  }
  if (row.operation_type === 'DISCARD') {
    await pushDiscard(db, row, payload as DiscardPayload);
    return;
  }
  throw new Error(`Operación de sync desconocida: ${row.operation_type}`);
}

async function tick(): Promise<void> {
  if (ticking) return;
  ticking = true;

  try {
    const db = await database();
    if (!db) {
      setSnapshot({ phase: 'idle', pending: 0, progress: 0 });
      return;
    }

    let pending = await countPending(db);
    if (pending === 0) {
      if (snapshot.phase !== 'done') {
        setSnapshot({ phase: 'idle', pending: 0, progress: 0 });
      }
      return;
    }

    if (doneTimer) {
      clearTimeout(doneTimer);
      doneTimer = null;
    }

    if (!isSupabaseConfigured) {
      setSnapshot({ phase: 'offline', pending, progress: 0 });
      return;
    }

    const online = await probe();
    if (!online) {
      setSnapshot({ phase: 'offline', pending, progress: 0 });
      return;
    }

    const initialPending = pending;
    setSnapshot({ phase: 'syncing', pending, progress: 0 });

    const cutoff = new Date(Date.now() - UNDO_GUARD_MS).toISOString();
    const rows = await db.getAllAsync<OutboxRow>(
      `SELECT id, operation_type, entity_name, payload, status, created_at
         FROM sync_outbox
        WHERE status = 'PENDING' AND created_at <= ?
        ORDER BY created_at ASC`,
      [cutoff]
    );

    if (rows.length === 0) {
      const oldest = await db.getFirstAsync<{ created_at: string }>(
        "SELECT created_at FROM sync_outbox WHERE status = 'PENDING' ORDER BY created_at ASC LIMIT 1"
      );
      if (oldest?.created_at) {
        const readyAt = new Date(oldest.created_at).getTime() + UNDO_GUARD_MS + 200;
        const delay = Math.max(0, Math.min(POLL_MS, readyAt - Date.now()));
        if (guardTimer) clearTimeout(guardTimer);
        guardTimer = setTimeout(() => {
          guardTimer = null;
          void tick();
        }, delay);
      }
    }

    for (const row of rows) {
      await pushOutbox(db, row);
      await db.runAsync("UPDATE sync_outbox SET status = 'SYNCED' WHERE id = ?", [row.id]);
      pending = await countPending(db);
      const progress = initialPending > 0 ? (initialPending - pending) / initialPending : 1;
      setSnapshot({ phase: 'syncing', pending, progress });
    }

    pending = await countPending(db);
    if (pending === 0) {
      setSnapshot({ phase: 'done', pending: 0, progress: 1 });
      doneTimer = setTimeout(() => {
        doneTimer = null;
        if (snapshot.phase === 'done') {
          setSnapshot({ phase: 'idle', pending: 0, progress: 0 });
        }
      }, 2500);
    } else {
      const progress = initialPending > 0 ? (initialPending - pending) / initialPending : 0;
      setSnapshot({ phase: 'syncing', pending, progress });
    }
  } catch {
    const db = await database();
    const pending = db ? await countPending(db).catch(() => snapshot.pending) : snapshot.pending;
    setSnapshot({ phase: 'offline', pending, progress: 0 });
  } finally {
    ticking = false;
  }
}
