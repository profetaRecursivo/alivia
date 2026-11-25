import { isoDaysFromToday } from './format';

/**
 * Dataset ÚNICO de la demo de ALIVIA.
 * Reglas:
 *  - 18 lotes: 3 vencidos, 12 próximos a vencer (0..60 días) y 3 regulares (> 60).
 *  - Fechas relativas a hoy: nunca hay un año hardcodeado.
 *  - Los precios y cantidades son los que muestra Figma.
 * Ninguna pantalla debe crear su propio array: todo sale de acá.
 */

export type Unit = 'comprimidos' | 'frascos' | 'cajas' | 'unidades' | 'viales' | 'ampollas';

export type Lot = {
  id: string;
  name: string;
  description: string;
  form: string;
  presentation: string;
  laboratory: string;
  lot: string;
  stock: number;
  unit: Unit;
  price: number;
  /** Días de calendario hasta el vencimiento (negativo = ya venció). */
  daysToExpire: number;
  /** Fecha ISO corta calculada al iniciar la app. */
  expiryDate: string;
  shelf: string;
  level: string;
};

export type MovementType = 'SALE' | 'DISCARD' | 'ENTRY';

export type Movement = {
  id: string;
  type: MovementType;
  batchId: string;
  productName: string;
  lotCode: string;
  /** Siempre positivo; el signo lo pone la UI según el tipo. */
  quantity: number;
  unit: Unit;
  date: string;
  user: string;
  /** Solo para DISCARD. */
  reason?: string;
};

export type DiscardReason = 'EXPIRED' | 'DAMAGED_DETERIORATED' | 'RETURN_TO_SUPPLIER';

export const APP = {
  name: 'Alivia',
  version: 'v1.2',
  city: 'Cochabamba, Bolivia',
  pharmacy: 'Farmacia San Martín',
  user: 'Doña Elena',
  role: 'Encargada de turno',
  totalProducts: 148,
  totalLots: 18,
} as const;

export const UNIT_SINGULAR: Record<Unit, string> = {
  comprimidos: 'comprimido',
  frascos: 'frasco',
  cajas: 'caja',
  unidades: 'unidad',
  viales: 'vial',
  ampollas: 'ampolla',
};

export const DISCARD_REASONS: { value: DiscardReason; label: string }[] = [
  { value: 'EXPIRED', label: 'Vencido' },
  { value: 'DAMAGED_DETERIORATED', label: 'Dañado / Deteriorado' },
  { value: 'RETURN_TO_SUPPLIER', label: 'Devolución a droguería' },
];

export function reasonLabel(reason: DiscardReason | string): string {
  return DISCARD_REASONS.find((item) => item.value === reason)?.label ?? String(reason);
}

function lot(input: Omit<Lot, 'expiryDate'>): Lot {
  return { ...input, expiryDate: isoDaysFromToday(input.daysToExpire) };
}

export const DEMO_LOTS: Lot[] = [
  lot({
    id: 'ib-449',
    name: 'Ibuprofeno 400 mg',
    description: 'Antiinflamatorio y analgésico oral',
    form: 'Comprimidos',
    presentation: 'Comprimidos caja',
    laboratory: 'Lab. Bagó',
    lot: 'IB-449',
    stock: 200,
    unit: 'comprimidos',
    price: 1.5,
    daysToExpire: 15,
    shelf: 'Estante C',
    level: 'N2',
  }),
  lot({
    id: 'p-500',
    name: 'Paracetamol 500 mg',
    description: 'Analgésico y antipirético de venta libre',
    form: 'Jarabes',
    presentation: 'Jarabe infantil',
    laboratory: 'Lab. IFA',
    lot: 'P-500',
    stock: 3,
    unit: 'frascos',
    price: 8,
    daysToExpire: 12,
    shelf: 'Estante B',
    level: 'N3',
  }),
  lot({
    id: 'amx-12',
    name: 'Amoxicilina 250 mg / 5 ml',
    description: 'Antibiótico de amplio espectro',
    form: 'Suspensiones',
    presentation: 'Suspensión 60 ml',
    laboratory: 'Lab. IFA',
    lot: 'AMX-12',
    stock: 2,
    unit: 'frascos',
    price: 18,
    daysToExpire: 8,
    shelf: 'Estante B',
    level: 'N2',
  }),
  lot({
    id: 'omp-88',
    name: 'Omeprazol 20 mg',
    description: 'Protector gástrico, inhibidor de bomba de protones',
    form: 'Cápsulas',
    presentation: 'Cápsulas frasco',
    laboratory: 'Lab. Bagó',
    lot: 'OMP-88',
    stock: 5,
    unit: 'unidades',
    price: 2.5,
    daysToExpire: 28,
    shelf: 'Estante A',
    level: 'N1',
  }),
  lot({
    id: 'los-102',
    name: 'Losartán Potásico 50 mg',
    description: 'Antihipertensivo oral',
    form: 'Comprimidos',
    presentation: 'Blíster caja',
    laboratory: 'Lab. Chile',
    lot: 'LOS-102',
    stock: 3,
    unit: 'cajas',
    price: 3.2,
    daysToExpire: 24,
    shelf: 'Estante A',
    level: 'N2',
  }),
  lot({
    id: 'cet-05',
    name: 'Cetirizina 10 mg',
    description: 'Antialérgico de segunda generación',
    form: 'Comprimidos',
    presentation: 'Comprimidos',
    laboratory: 'Lab. IFA',
    lot: 'CET-05',
    stock: 2,
    unit: 'cajas',
    price: 1.8,
    daysToExpire: 19,
    shelf: 'Estante A',
    level: 'N3',
  }),
  lot({
    id: 'amx-08',
    name: 'Amoxicilina 500 mg',
    description: 'Antibiótico de amplio espectro',
    form: 'Suspensiones',
    presentation: 'Suspensión oral 60 ml',
    laboratory: 'Lab. IFA',
    lot: 'AMX-08',
    stock: 12,
    unit: 'frascos',
    price: 14.5,
    daysToExpire: 12,
    shelf: 'Estante C',
    level: 'N2',
  }),
  lot({
    id: 'amx-14',
    name: 'Amoxicilina + Ác. Clavulánico 875/125',
    description: 'Antibiótico combinado de amplio espectro',
    form: 'Comprimidos',
    presentation: 'Comprimidos recubiertos',
    laboratory: 'Lab. Bagó',
    lot: 'AMX-14',
    stock: 60,
    unit: 'comprimidos',
    price: 4,
    daysToExpire: 24,
    shelf: 'Estante C',
    level: 'N1',
  }),
  lot({
    id: 'amx-22',
    name: 'Amoxicilina 250 mg / 5 ml',
    description: 'Antibiótico pediátrico',
    form: 'Jarabes',
    presentation: 'Jarabe pediátrico 100 ml',
    laboratory: 'Lab. IFA',
    lot: 'AMX-22',
    stock: 8,
    unit: 'frascos',
    price: 18,
    daysToExpire: 30,
    shelf: 'Estante B',
    level: 'N3',
  }),
  lot({
    id: 'dic-11',
    name: 'Diclofenaco 50 mg',
    description: 'Antiinflamatorio y analgésico',
    form: 'Comprimidos',
    presentation: 'Comprimidos caja',
    laboratory: 'Lab. Chile',
    lot: 'DIC-11',
    stock: 4,
    unit: 'comprimidos',
    price: 1.2,
    daysToExpire: -3,
    shelf: 'Estante A',
    level: 'N1',
  }),
  lot({
    id: 'sal-04',
    name: 'Salbutamol aerosol 100 mcg',
    description: 'Broncodilatador de rescate',
    form: 'Inhaladores',
    presentation: 'Inhalador 200 dosis',
    laboratory: 'Lab. Bagó',
    lot: 'SAL-04',
    stock: 1,
    unit: 'unidades',
    price: 22,
    daysToExpire: -8,
    shelf: 'Estante B',
    level: 'N1',
  }),
  lot({
    id: 'ins-07',
    name: 'Insulina NPH 100 UI/ml',
    description: 'Antidiabético de cadena intermedia',
    form: 'Inyectables / Ampollas',
    presentation: 'Vial 10 ml',
    laboratory: 'Lab. Chile',
    lot: 'INS-07',
    stock: 2,
    unit: 'viales',
    price: 45,
    daysToExpire: -12,
    shelf: 'Refrigerador',
    level: 'N1',
  }),
  lot({
    id: 'dic-75',
    name: 'Diclofenaco 75 mg',
    description: 'Antiinflamatorio inyectable',
    form: 'Inyectables / Ampollas',
    presentation: 'Ampolla 3 ml',
    laboratory: 'Lab. Chile',
    lot: 'DIC-75',
    stock: 6,
    unit: 'ampollas',
    price: 5.5,
    daysToExpire: 14,
    shelf: 'Estante A',
    level: 'N1',
  }),
  lot({
    id: 'ibu-600',
    name: 'Ibuprofeno 600 mg',
    description: 'Antiinflamatorio de dosis alta',
    form: 'Comprimidos',
    presentation: 'Comprimidos caja',
    laboratory: 'Lab. Bagó',
    lot: 'IBU-600',
    stock: 30,
    unit: 'comprimidos',
    price: 2.2,
    daysToExpire: 38,
    shelf: 'Estante C',
    level: 'N3',
  }),
  lot({
    id: 'lor-10',
    name: 'Loratadina 10 mg',
    description: 'Antialérgico de venta libre',
    form: 'Comprimidos',
    presentation: 'Comprimidos caja',
    laboratory: 'Lab. IFA',
    lot: 'LOR-10',
    stock: 10,
    unit: 'cajas',
    price: 2.8,
    daysToExpire: 41,
    shelf: 'Estante A',
    level: 'N3',
  }),
  lot({
    id: 'met-500',
    name: 'Metformina 500 mg',
    description: 'Antidiabético oral',
    form: 'Comprimidos',
    presentation: 'Comprimidos caja',
    laboratory: 'Lab. Chile',
    lot: 'MET-500',
    stock: 40,
    unit: 'comprimidos',
    price: 1.1,
    daysToExpire: 75,
    shelf: 'Estante A',
    level: 'N2',
  }),
  lot({
    id: 'vit-c',
    name: 'Vitamina C 500 mg',
    description: 'Suplemento vitamínico',
    form: 'Comprimidos',
    presentation: 'Comprimidos efervescentes',
    laboratory: 'Lab. Bagó',
    lot: 'VIT-C',
    stock: 20,
    unit: 'cajas',
    price: 3.6,
    daysToExpire: 90,
    shelf: 'Vitrina Mostrador',
    level: 'N1',
  }),
  lot({
    id: 'omep-40',
    name: 'Omeprazol 40 mg',
    description: 'Protector gástrico de dosis alta',
    form: 'Cápsulas',
    presentation: 'Cápsulas caja',
    laboratory: 'Lab. Bagó',
    lot: 'OMP-40',
    stock: 12,
    unit: 'cajas',
    price: 4.2,
    daysToExpire: 120,
    shelf: 'Estante A',
    level: 'N1',
  }),
];

function todayAt(hours: number, minutes: number, daysAgo = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60000).toISOString();
}

export const DEMO_MOVEMENTS: Movement[] = [
  {
    id: 'mv-1',
    type: 'SALE',
    batchId: 'amx-08',
    productName: 'Amoxicilina 500 mg',
    lotCode: 'AMX-08',
    quantity: 10,
    unit: 'comprimidos',
    date: minutesAgo(45),
    user: 'Carlos M.',
  },
  {
    id: 'mv-2',
    type: 'DISCARD',
    batchId: 'ib-449',
    productName: 'Ibuprofeno 400 mg',
    lotCode: 'IB-449',
    quantity: 5,
    unit: 'comprimidos',
    date: minutesAgo(180),
    user: 'Laura G.',
    reason: 'Fecha vencida',
  },
  {
    id: 'mv-3',
    type: 'ENTRY',
    batchId: 'amx-14',
    productName: 'Amoxicilina + Ác. Clavulánico 875/125',
    lotCode: 'AMX-14',
    quantity: 20,
    unit: 'cajas',
    date: todayAt(11, 30, 1),
    user: 'Roberto S.',
  },
  {
    id: 'mv-4',
    type: 'SALE',
    batchId: 'p-500',
    productName: 'Paracetamol 500 mg',
    lotCode: 'P-500',
    quantity: 1,
    unit: 'frascos',
    date: todayAt(9, 10, 1),
    user: 'Doña Elena',
  },
  {
    id: 'mv-5',
    type: 'DISCARD',
    batchId: 'cet-05',
    productName: 'Cetirizina 10 mg',
    lotCode: 'CET-05',
    quantity: 2,
    unit: 'cajas',
    date: todayAt(17, 20, 3),
    user: 'Doña Elena',
    reason: 'Empaque deteriorado',
  },
];

/** Semáforo FEFO: ≤15 crítico · 16..30 atención · 31..60 regular. */
export function toneForDays(days: number): 'critical' | 'attention' | 'regular' {
  if (days <= 15) return 'critical';
  if (days <= 30) return 'attention';
  return 'regular';
}

/** Banda de la pantalla Por Vencer. */
export function bandForDays(days: number): '15' | '30' | '60' | 'expired' | null {
  if (days < 0) return 'expired';
  if (days <= 15) return '15';
  if (days <= 30) return '30';
  if (days <= 60) return '60';
  return null;
}

/** Ubicaciones y formas para los filtros de Stock. */
export const STOCK_LOCATIONS = [
  'Estante A (Genéricos)',
  'Estante B (Jarabes)',
  'Estante C (Antibióticos)',
  'Vitrina Mostrador',
  'Refrigerador',
] as const;

export const STOCK_FORMS = [
  'Comprimidos',
  'Cápsulas',
  'Jarabes',
  'Suspensiones',
  'Inyectables / Ampollas',
  'Inhaladores',
] as const;

export const HISTORY_USERS = ['Doña Elena', 'Carlos M.', 'Laura G.', 'Roberto S.'] as const;
