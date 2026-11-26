import { useMemo, useSyncExternalStore } from 'react';
import type { SQLiteDatabase } from 'expo-sqlite';
import { getLocalDatabase } from './sqlite';
import {
  APP,
  DEMO_LOTS,
  DEMO_MOVEMENTS,
  type DiscardReason,
  type Lot,
  type Movement,
  reasonLabel,
} from './demo-data';
import { daysUntil, normalizeSearch } from './format';
import { notifyLocalChange, startSyncWatcher } from './sync';

/**
 * Repositorio único de la app.
 *
 * - Mantiene el estado en memoria y notifica a las pantallas con
 *   `useSyncExternalStore` (sin providers extra ni tocar `_layout.tsx`).
 * - Persiste en SQLite local (Android/iOS) y cae a memoria en web.
 * - Toda mutación descuenta stock, crea un `inventory_movement` y encola
 *   la operación en `sync_outbox`.
 * - `undoLast()` solo funciona dentro de los 5 s posteriores a la mutación.
 */

const UNDO_WINDOW_MS = 5000;

type State = {
  lots: Lot[];
  movements: Movement[];
  hydrated: boolean;
};

type UndoEntry = {
  kind: 'sale' | 'discard';
  movementId: string;
  saleId?: string;
  discardId?: string;
  batchId: string;
  quantity: number;
  previousStock: number;
  at: number;
};

let state: State = {
  lots: sortFefo(DEMO_LOTS),
  movements: [...DEMO_MOVEMENTS].sort(byDateDesc),
  hydrated: false,
};

let undoEntry: UndoEntry | null = null;
let userMutated = false;
let sequence = 0;

const listeners = new Set<() => void>();

function emit(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function byDateDesc(a: Movement, b: Movement): number {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

function sortFefo(lots: Lot[]): Lot[] {
  return [...lots].sort((a, b) => a.daysToExpire - b.daysToExpire);
}

/* ------------------------------------------------------------------ */
/* Hooks                                                              */
/* ------------------------------------------------------------------ */

export function useLots(): Lot[] {
  return useSyncExternalStore(subscribe, () => state.lots, () => state.lots);
}

export function useLot(id: string | undefined): Lot | undefined {
  return useSyncExternalStore(
    subscribe,
    () => resolveLot(id),
    () => resolveLot(id)
  );
}

/**
 * Resuelve el parámetro de ruta contra el dataset canónico.
 *
 * Las pantallas nuevas pasan el id local (`ib-449`), pero las viejas todavía
 * pasan índices (`1`, `2`, `3`) o el código de lote (`IB-449`). Aceptar los
 * tres formatos evita "Lote no encontrado" durante la migración.
 */
function resolveLot(id: string | undefined): Lot | undefined {
  if (!id) return undefined;
  const value = String(id);

  const exact = state.lots.find((lot) => lot.id === value);
  if (exact) return exact;

  const byCode = state.lots.find(
    (lot) => lot.lot.toLowerCase() === value.toLowerCase()
  );
  if (byCode) return byCode;

  const byName = state.lots.find(
    (lot) => normalizeSearch(lot.name) === normalizeSearch(value)
  );
  if (byName) return byName;

  const numeric = Number(value);
  if (Number.isInteger(numeric) && numeric >= 1 && numeric <= DEMO_LOTS.length) {
    const fallbackId = DEMO_LOTS[numeric - 1].id;
    return state.lots.find((lot) => lot.id === fallbackId);
  }

  return undefined;
}

export function useMovements(): Movement[] {
  return useSyncExternalStore(subscribe, () => state.movements, () => state.movements);
}

export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => state.hydrated, () => state.hydrated);
}

export function useMetrics() {
  const lots = useLots();
  return useMemo(() => {
    const expired = lots.filter((lot) => lot.daysToExpire < 0).length;
    const near = lots.filter((lot) => lot.daysToExpire >= 0 && lot.daysToExpire <= 60).length;
    const critical = lots.filter((lot) => lot.daysToExpire >= 0 && lot.daysToExpire <= 15).length;
    const attention = lots.filter((lot) => lot.daysToExpire > 15 && lot.daysToExpire <= 30).length;
    const regular = lots.filter((lot) => lot.daysToExpire > 60).length;
    return {
      expired,
      near,
      critical,
      attention,
      regular,
      total: APP.totalProducts,
      lots: lots.length,
    };
  }, [lots]);
}

/** Lotes próximos a vencer (0..60) ordenados FEFO. */
export function useExpiringLots(): Lot[] {
  const lots = useLots();
  return useMemo(() => lots.filter((lot) => lot.daysToExpire >= 0 && lot.daysToExpire <= 60), [lots]);
}

/** Búsqueda por nombre, lote, laboratorio y descripción (sin acentos). */
export function searchLots(lots: Lot[], query: string): Lot[] {
  const needle = normalizeSearch(query);
  if (!needle) return lots;
  return lots.filter((lot) =>
    normalizeSearch(`${lot.name} ${lot.lot} ${lot.laboratory} ${lot.description}`).includes(needle)
  );
}

/* ------------------------------------------------------------------ */
/* Mutaciones                                                         */
/* ------------------------------------------------------------------ */

export async function sellBatch(id: string, quantity: number): Promise<void> {
  const lot = state.lots.find((item) => item.id === id);
  if (!lot) throw new Error('Lote no encontrado');
  if (!Number.isInteger(quantity) || quantity < 1) throw new Error('Cantidad no válida');
  if (lot.daysToExpire < 0) throw new Error('El lote está vencido');
  if (quantity > lot.stock) throw new Error('La cantidad supera el stock disponible');

  const previousStock = lot.stock;
  const resultingStock = previousStock - quantity;
  const movementId = nextId('mv');
  const saleId = nextId('sale');
  const saleNumber = `V-${sequence}`;
  const now = new Date().toISOString();

  const movement: Movement = {
    id: movementId,
    type: 'SALE',
    batchId: lot.id,
    productName: lot.name,
    lotCode: lot.lot,
    quantity,
    unit: lot.unit,
    date: now,
    user: APP.user,
  };

  applyMutation(lot.id, resultingStock, movement, {
    kind: 'sale',
    movementId,
    saleId,
    batchId: lot.id,
    quantity,
    previousStock,
    at: Date.now(),
  });

  const db = await database();
  if (!db) return;

  const total = quantity * lot.price;
  await db.withTransactionAsync(async () => {
    await db.runAsync('UPDATE batches SET current_stock = ?, updated_at = ? WHERE id = ?', [
      resultingStock,
      now,
      lot.id,
    ]);
    await db.runAsync(
      'INSERT INTO sales (id, pharmacy_id, user_id, sale_number, total_amount, status, sale_date, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [saleId, null, null, saleNumber, total, 'COMPLETED', now, now]
    );
    await db.runAsync(
      'INSERT INTO sale_items (id, sale_id, batch_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
      [nextId('item'), saleId, lot.id, quantity, lot.price, total]
    );
    await db.runAsync(
      'INSERT INTO inventory_movements (id, batch_id, movement_type, quantity, previous_stock, resulting_stock, reason, movement_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [movementId, lot.id, 'SALE', quantity, previousStock, resultingStock, null, now]
    );
    await enqueue(
      db,
      'SALE',
      'sale',
      {
        saleId,
        batchId: lot.id,
        quantity,
        total,
        unitPrice: lot.price,
        saleNumber,
        saleDate: now,
        movementId,
        previousStock,
        resultingStock,
      },
      now
    );
  });
  notifyLocalChange();
}

export async function discardBatch(
  id: string,
  quantity: number,
  reason: DiscardReason
): Promise<void> {
  const lot = state.lots.find((item) => item.id === id);
  if (!lot) throw new Error('Lote no encontrado');
  if (!Number.isInteger(quantity) || quantity < 1) throw new Error('Cantidad no válida');
  if (quantity > lot.stock) throw new Error('La cantidad supera el stock disponible');

  const previousStock = lot.stock;
  const resultingStock = previousStock - quantity;
  const movementId = nextId('mv');
  const discardId = nextId('discard');
  const now = new Date().toISOString();
  const label = reasonLabel(reason);

  const movement: Movement = {
    id: movementId,
    type: 'DISCARD',
    batchId: lot.id,
    productName: lot.name,
    lotCode: lot.lot,
    quantity,
    unit: lot.unit,
    date: now,
    user: APP.user,
    reason: label,
  };

  applyMutation(lot.id, resultingStock, movement, {
    kind: 'discard',
    movementId,
    discardId,
    batchId: lot.id,
    quantity,
    previousStock,
    at: Date.now(),
  });

  const db = await database();
  if (!db) return;

  await db.withTransactionAsync(async () => {
    await db.runAsync('UPDATE batches SET current_stock = ?, updated_at = ? WHERE id = ?', [
      resultingStock,
      now,
      lot.id,
    ]);
    await db.runAsync(
      'INSERT INTO discards (id, pharmacy_id, user_id, batch_id, quantity, reason, notes, discard_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [discardId, null, null, lot.id, quantity, reason, null, now]
    );
    await db.runAsync(
      'INSERT INTO inventory_movements (id, batch_id, movement_type, quantity, previous_stock, resulting_stock, reason, movement_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [movementId, lot.id, 'DISCARD', quantity, previousStock, resultingStock, label, now]
    );
    await enqueue(
      db,
      'DISCARD',
      'discard',
      {
        discardId,
        batchId: lot.id,
        quantity,
        reason,
        discardDate: now,
        movementId,
        previousStock,
        resultingStock,
      },
      now
    );
  });
  notifyLocalChange();
}

/** Revierte la última venta/descarte si pasaron ≤ 5 s. */
export function undoLast(): boolean {
  const entry = undoEntry;
  if (!entry) return false;
  if (Date.now() - entry.at > UNDO_WINDOW_MS) {
    undoEntry = null;
    return false;
  }

  const lots = state.lots.map((lot) =>
    lot.id === entry.batchId ? { ...lot, stock: entry.previousStock } : lot
  );
  const movements = state.movements.filter((movement) => movement.id !== entry.movementId);
  undoEntry = null;
  emit({ lots, movements });

  void persistUndo(entry).finally(() => notifyLocalChange());
  return true;
}

/* ------------------------------------------------------------------ */
/* Internos                                                           */
/* ------------------------------------------------------------------ */

function nextId(prefix: string): string {
  sequence += 1;
  return `${prefix}-${Date.now()}-${sequence}`;
}

function applyMutation(
  batchId: string,
  resultingStock: number,
  movement: Movement,
  undo: Omit<UndoEntry, 'previousStock'> & { previousStock: number }
) {
  userMutated = true;
  const lots = state.lots.map((lot) =>
    lot.id === batchId ? { ...lot, stock: resultingStock } : lot
  );
  emit({ lots, movements: [movement, ...state.movements].sort(byDateDesc) });
  undoEntry = undo;
}

async function persistUndo(entry: UndoEntry) {
  const db = await database();
  if (!db) return;
  const now = new Date().toISOString();
  try {
    await db.withTransactionAsync(async () => {
      await db.runAsync('UPDATE batches SET current_stock = ?, updated_at = ? WHERE id = ?', [
        entry.previousStock,
        now,
        entry.batchId,
      ]);
      await db.runAsync('DELETE FROM inventory_movements WHERE id = ?', [entry.movementId]);
      if (entry.saleId) {
        await db.runAsync('DELETE FROM sale_items WHERE sale_id = ?', [entry.saleId]);
        await db.runAsync('DELETE FROM sales WHERE id = ?', [entry.saleId]);
      }
      if (entry.discardId) {
        await db.runAsync('DELETE FROM discards WHERE id = ?', [entry.discardId]);
      }
    });

    // Si la operación todavía no se empujó, se cancela también en el outbox.
    // El sync espera 5 s, así que dentro de la ventana de undo sigue PENDING.
    // Va fuera de la transacción: si falla, el undo local ya quedó bien.
    try {
      await db.runAsync(
        `DELETE FROM sync_outbox
          WHERE status = 'PENDING'
            AND (json_extract(payload, '$.saleId') = ? OR json_extract(payload, '$.discardId') = ?)`,
        [entry.saleId ?? '', entry.discardId ?? '']
      );
    } catch {
      // El sync lo reintentará; no se revierte el undo local.
    }
  } catch {
    // La UI ya revirtió el estado; si SQLite falla, se reconcilia al reabrir.
  }
}

async function enqueue(
  db: SQLiteDatabase,
  operation: string,
  entity: string,
  payload: Record<string, unknown>,
  now: string
) {
  await db.runAsync(
    'INSERT INTO sync_outbox (id, operation_type, entity_name, payload, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [nextId('outbox'), operation, entity, JSON.stringify(payload), 'PENDING', now]
  );
}

async function database(): Promise<SQLiteDatabase | null> {
  try {
    return await getLocalDatabase();
  } catch {
    // En web no hay SQLite: la demo funciona en memoria.
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Hidratación                                                        */
/* ------------------------------------------------------------------ */

let hydration: Promise<void> | null = null;

export function ensureRepositoryReady(): Promise<void> {
  if (!hydration) hydration = hydrate();
  return hydration;
}

async function hydrate(): Promise<void> {
  const db = await database();
  if (!db) {
    emit({ hydrated: true });
    return;
  }

  try {
    await seedBase(db);
    const rows = await db.getAllAsync<{ id: string; current_stock: number }>(
      'SELECT id, current_stock FROM batches'
    );
    const stockById = new Map(rows.map((row) => [row.id, row.current_stock]));

    const lots = sortFefo(
      DEMO_LOTS.map((lot) => {
        const stock = stockById.get(lot.id);
        return {
          ...lot,
          stock: typeof stock === 'number' ? stock : lot.stock,
          daysToExpire: daysUntil(lot.expiryDate),
        };
      })
    );

    const movements = await db.getAllAsync<{
      id: string;
      batch_id: string;
      movement_type: Movement['type'];
      quantity: number;
      reason: string | null;
      movement_date: string;
    }>('SELECT id, batch_id, movement_type, quantity, reason, movement_date FROM inventory_movements ORDER BY movement_date DESC');

    const mapped: Movement[] = movements.map((row) => {
      const seed = DEMO_MOVEMENTS.find((item) => item.id === row.id);
      if (seed) {
        // Los movimientos de demo conservan su responsable y motivo originales.
        return { ...seed, date: row.movement_date };
      }
      const lot = DEMO_LOTS.find((item) => item.id === row.batch_id);
      return {
        id: row.id,
        type: row.movement_type,
        batchId: row.batch_id,
        productName: lot?.name ?? 'Medicamento',
        lotCode: lot?.lot ?? row.batch_id.toUpperCase(),
        quantity: row.quantity,
        unit: lot?.unit ?? 'unidades',
        date: row.movement_date,
        user: APP.user,
        reason: row.reason ?? undefined,
      };
    });

    if (!userMutated) {
      emit({
        lots,
        movements: mapped.length > 0 ? mapped.sort(byDateDesc) : [...DEMO_MOVEMENTS].sort(byDateDesc),
        hydrated: true,
      });
    } else {
      emit({ hydrated: true });
    }
  } catch {
    emit({ hydrated: true });
  }
}

async function seedBase(db: SQLiteDatabase) {
  const now = new Date().toISOString();
  await db.withTransactionAsync(async () => {
    for (const lot of DEMO_LOTS) {
      await db.runAsync(
        'INSERT OR IGNORE INTO products (id, pharmacy_id, barcode, commercial_name, generic_name, concentration, dosage_form, presentation, laboratory, min_stock_alert, is_active, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          productId(lot),
          null,
          null,
          lot.name,
          lot.description,
          null,
          lot.form,
          lot.presentation,
          lot.laboratory,
          5,
          1,
          now,
        ]
      );
      await db.runAsync(
        'INSERT OR IGNORE INTO storage_locations (id, pharmacy_id, name, section_code, requires_cold, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [locationId(lot), null, lot.shelf, lot.level, lot.shelf === 'Refrigerador' ? 1 : 0, now]
      );
      await db.runAsync(
        'INSERT OR IGNORE INTO batches (id, product_id, storage_location_id, batch_code, expiration_date, current_stock, unit_price, unit_measure, status, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          lot.id,
          productId(lot),
          locationId(lot),
          lot.lot,
          lot.expiryDate,
          lot.stock,
          lot.price,
          lot.unit,
          lot.daysToExpire < 0 ? 'EXPIRED' : 'ACTIVE',
          now,
        ]
      );
    }

    for (const movement of DEMO_MOVEMENTS) {
      await db.runAsync(
        'INSERT OR IGNORE INTO inventory_movements (id, batch_id, movement_type, quantity, previous_stock, resulting_stock, reason, movement_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          movement.id,
          movement.batchId,
          movement.type,
          movement.quantity,
          movement.quantity,
          0,
          movement.reason ?? null,
          movement.date,
        ]
      );
    }
  });
}

function slug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function productId(lot: Lot): string {
  return `prod-${lot.id}`;
}

function locationId(lot: Lot): string {
  return `loc-${slug(lot.shelf)}`;
}

// Arranca la hidratación y el motor de sync apenas se importa el repositorio.
void ensureRepositoryReady();
startSyncWatcher();
