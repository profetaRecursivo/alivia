import * as SQLite from 'expo-sqlite';

/**
 * Espejo local (offline) del esquema de Supabase.
 * Regla: los nombres de columnas son EXACTAMENTE los de Postgres para que
 * la sincronización sea un mapeo 1:1 y no haya "columnas fantasma".
 *
 * Las tablas de solo lectura del servidor (pharmacies, users) no se replican:
 * el MVP trabaja con una farmacia y una usuaria fija.
 */
const DB_NAME = 'alivia_local_v2.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getLocalDatabase() {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
    await initLocalTables(dbInstance);
  }
  return dbInstance;
}

export const initLocalDb = getLocalDatabase;

async function initLocalTables(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    -- products (espejo de Supabase)
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      pharmacy_id TEXT,
      barcode TEXT,
      commercial_name TEXT NOT NULL,
      generic_name TEXT,
      concentration TEXT,
      dosage_form TEXT NOT NULL,
      presentation TEXT,
      laboratory TEXT,
      min_stock_alert INTEGER NOT NULL DEFAULT 5,
      is_active INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT
    );

    -- storage_locations (espejo de Supabase)
    CREATE TABLE IF NOT EXISTS storage_locations (
      id TEXT PRIMARY KEY,
      pharmacy_id TEXT,
      name TEXT NOT NULL,
      section_code TEXT,
      requires_cold INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT
    );

    -- batches (espejo de Supabase, criterio FEFO por expiration_date)
    CREATE TABLE IF NOT EXISTS batches (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      storage_location_id TEXT REFERENCES storage_locations(id) ON DELETE SET NULL,
      batch_code TEXT NOT NULL,
      expiration_date TEXT NOT NULL,
      current_stock INTEGER NOT NULL DEFAULT 0,
      unit_price REAL NOT NULL DEFAULT 0,
      unit_measure TEXT NOT NULL DEFAULT 'unidades',
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      updated_at TEXT
    );

    -- sales (espejo de Supabase)
    CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY,
      pharmacy_id TEXT,
      user_id TEXT,
      sale_number TEXT,
      total_amount REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'COMPLETED',
      sale_date TEXT NOT NULL,
      updated_at TEXT
    );

    -- sale_items (espejo de Supabase)
    CREATE TABLE IF NOT EXISTS sale_items (
      id TEXT PRIMARY KEY,
      sale_id TEXT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
      batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      subtotal REAL NOT NULL
    );

    -- discards (espejo de Supabase)
    CREATE TABLE IF NOT EXISTS discards (
      id TEXT PRIMARY KEY,
      pharmacy_id TEXT,
      user_id TEXT,
      batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL,
      reason TEXT NOT NULL,
      notes TEXT,
      discard_date TEXT NOT NULL
    );

    -- inventory_movements (espejo de Supabase)
    CREATE TABLE IF NOT EXISTS inventory_movements (
      id TEXT PRIMARY KEY,
      batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
      movement_type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      previous_stock INTEGER NOT NULL,
      resulting_stock INTEGER NOT NULL,
      reason TEXT,
      movement_date TEXT NOT NULL
    );

    -- Cola de sincronización local (Outbox Pattern)
    CREATE TABLE IF NOT EXISTS sync_outbox (
      id TEXT PRIMARY KEY,
      operation_type TEXT NOT NULL,
      entity_name TEXT NOT NULL,
      payload TEXT NOT NULL,
      status TEXT DEFAULT 'PENDING',
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_batches_product ON batches(product_id);
    CREATE INDEX IF NOT EXISTS idx_batches_expiration ON batches(expiration_date);
    CREATE INDEX IF NOT EXISTS idx_movements_batch ON inventory_movements(batch_id);
    CREATE INDEX IF NOT EXISTS idx_movements_date ON inventory_movements(movement_date);
    CREATE INDEX IF NOT EXISTS idx_outbox_status ON sync_outbox(status);
  `);
}
