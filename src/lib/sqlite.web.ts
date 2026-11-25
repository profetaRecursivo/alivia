/**
 * Versión WEB de la capa local.
 *
 * expo-sqlite necesita un WASM que Metro no empaqueta tal cual en web
 * (error: "Unable to resolve ./wa-sqlite/wa-sqlite.wasm").
 * Para que la app se pueda PREVISUALIZAR en el navegador sin teléfono,
 * en web no se abre SQLite; se usa el mock en memoria de las pantallas.
 *
 * En Android/iOS se usa `sqlite.ts` (offline real).
 */
export async function getLocalDatabase(): Promise<never> {
  throw new Error(
    'SQLite local no está disponible en web. Previsualiza con Expo Go en tu teléfono.'
  );
}

export async function initLocalDb(): Promise<void> {
  // No-op intencional en web.
}
