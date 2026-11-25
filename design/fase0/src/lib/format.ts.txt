/**
 * Formato único de números, cantidades y fechas de ALIVIA.
 * Ninguna pantalla debe concatenar "Bs." ni armar fechas a mano.
 */

const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MONTHS_LONG = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const SINGULAR: Record<string, string> = {
  comprimidos: 'comprimido',
  frascos: 'frasco',
  cajas: 'caja',
  unidades: 'unidad',
  viales: 'vial',
  ampollas: 'ampolla',
};

export function formatBs(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  return `Bs. ${safe.toFixed(2)}`;
}

/** "5 comprimidos" · "1 comprimido" · "3 frascos". */
export function formatQty(quantity: number, unit: string): string {
  const safe = Number.isFinite(quantity) ? Math.abs(quantity) : 0;
  const singular = SINGULAR[unit] ?? unit.replace(/s$/, '');
  return `${safe} ${safe === 1 ? singular : unit}`;
}

/** "5 comp." para tarjetas compactas. */
export function formatQtyShort(quantity: number, unit: string): string {
  const safe = Number.isFinite(quantity) ? Math.abs(quantity) : 0;
  const short = unit === 'unidades' ? 'u.' : unit === 'ampollas' ? 'amp.' : unit.slice(0, 4) + '.';
  return `${safe} ${short}`;
}

/** "Vence en 15 días" · "Vence hoy" · "Venció hace 3 días". */
export function daysLabel(days: number): string {
  if (!Number.isFinite(days)) return 'Sin fecha';
  if (days > 1) return `Vence en ${days} días`;
  if (days === 1) return 'Vence mañana';
  if (days === 0) return 'Vence hoy';
  const ago = Math.abs(days);
  return ago === 1 ? 'Venció ayer' : `Venció hace ${ago} días`;
}

function pad(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

function toDate(value: Date | string): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** "Hoy, 19:42" · "Ayer, 11:30" · "15 Nov". */
export function formatDate(value: Date | string): string {
  const date = toDate(value);
  if (!date) return '';
  const now = new Date();
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;

  if (isSameDay(date, now)) return `Hoy, ${time}`;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, yesterday)) return `Ayer, ${time}`;

  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
}

/** "10 de diciembre" para el detalle del lote. */
export function formatLongDate(value: Date | string): string {
  const date = toDate(value);
  if (!date) return '';
  return `${date.getDate()} de ${MONTHS_LONG[date.getMonth()]}`;
}

/** Fecha corta ISO para filtros y params: "2026-11-25". */
export function toISODate(value: Date | string): string {
  const date = toDate(value);
  if (!date) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Días de calendario entre hoy y la fecha (negativo si ya pasó). */
export function daysUntil(value: Date | string): number {
  const date = toDate(value);
  if (!date) return 0;
  const today = new Date();
  const a = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const b = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

/** Suma (o resta) días a hoy y devuelve ISO corto. */
export function isoDaysFromToday(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

/** Normaliza texto para búsquedas: minúsculas y sin acentos. */
export function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
