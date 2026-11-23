import * as SQLite from 'expo-sqlite';

// Inicialización de la base de datos local SQLite para el funcionamiento Offline
let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getLocalDatabase() {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('alivia_local.db');
    await initLocalTables(dbInstance);
  }
  return dbInstance;
}

export const initLocalDb = getLocalDatabase;

// Crea las tablas locales equivalentes a Supabase en el dispositivo móvil
async function initLocalTables(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    -- Catálogo de productos local
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      commercial_name TEXT NOT NULL,
      generic_name TEXT,
      concentration TEXT,
      dosage_form TEXT,
      laboratory TEXT,
      min_stock_alert INTEGER DEFAULT 5
    );

    -- Lotes y saldos locales (FEFO)
    CREATE TABLE IF NOT EXISTS batches (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      batch_code TEXT NOT NULL,
      expiration_date TEXT NOT NULL,
      current_stock INTEGER DEFAULT 0,
      unit_price REAL DEFAULT 0.0,
      location_name TEXT,
      FOREIGN KEY (product_id) REFERENCES products(id)
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
  `);
}
