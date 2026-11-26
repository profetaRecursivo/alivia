/**
 * UUID v4 sin dependencias.
 *
 * Supabase usa columnas uuid; los IDs locales de la demo son slugs
 * (`ib-449`, `sale-...`). El sync genera un UUID una sola vez y lo guarda
 * en el payload del outbox para que un reintento use el mismo ID.
 */
export function newUuid(): string {
  const cryptoObject = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;

  if (cryptoObject && typeof cryptoObject.randomUUID === 'function') {
    return cryptoObject.randomUUID();
  }

  const bytes = new Uint8Array(16);
  if (cryptoObject && typeof cryptoObject.getRandomValues === 'function') {
    cryptoObject.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join('-');
}
