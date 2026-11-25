// Alivia Design Tokens - Fuente de verdad: Figma (24 frames "(Color)")
// Regla del equipo: ninguna pantalla declara hex, tamaños ni radios fuera de este archivo.
//
// Semáforo FEFO oficial (Figma):
//   <= 15 días  rojo    #B91C1C / fondo #FEE2E2
//   16-30 días  ámbar   #E65100 / fondo #FEF3C7
//   31-60 días  azul    #0369A1 / fondo #E0F2FE
// Tipografía oficial: Plus Jakarta Sans (Inter en Figma es un error de migración).

const brandLight = {
  // Primarios de marca
  primary: '#1B5E7B', // Deep Slate Teal
  primaryHover: '#13465D',
  primaryPressed: '#0E3A4D',
  primaryContainer: '#E0F2F7', // Chips, badges, atajos
  primaryContainerText: '#0E3A4D',
  primarySoft: '#E8F4F8', // Atajo "Vender todo el lote"
  secondary: '#3F7890',

  // Semáforo semántico de urgencia (15 / 30 / 60 días)
  critical: {
    text: '#B91C1C',
    strong: '#D32F2F', // Iconos y cifras KPI
    bg: '#FEE2E2',
    border: '#EF4444',
  },
  attention: {
    text: '#E65100',
    strong: '#D97706',
    bg: '#FEF3C7',
    softBg: '#FFF1E6',
    border: '#F59E0B',
  },
  regular: {
    text: '#0369A1',
    bg: '#E0F2FE',
    border: '#7DD3FC',
  },
  success: {
    text: '#166534',
    accent: '#16A34A',
    bg: '#DCFCE7',
    border: '#22C55E',
  },
  info: {
    text: '#0369A1',
    bg: '#E0F2FE',
    border: '#7DD3FC',
  },
  danger: '#D32F2F',

  // Superficies y neutros
  canvas: '#F7F9FB', // Fondo general de la app móvil
  canvasAlt: '#F8FAFC', // Top bar, botones de icono
  surface: '#FFFFFF', // Tarjetas y sheets
  surfaceMuted: '#F8FAFC',
  field: '#F1F5F9',
  background: '#FFFFFF',
  backgroundElement: '#F1F5F9',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  borderSubtle: '#E5E5E5',

  // Textos (WCAG AA)
  text: '#0F172A',
  textAlt: '#1A1D21',
  textSecondary: '#64748B',
  textMuted: '#5F6B7A',
  textTertiary: '#94A3B8',
  textDisabled: '#94A3B8',
  disabledBg: '#E2E8F0',

  white: '#FFFFFF',
  scrim: 'rgba(0, 0, 0, 0.45)',
};

export const Colors = {
  ...brandLight,
  light: brandLight,
  dark: {
    ...brandLight,
    canvas: '#0B1120',
    surface: '#1E293B',
    background: '#0B1120',
    backgroundElement: '#1E293B',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
    border: '#334155',
  },
} as const;

export type ThemeColor = typeof Colors.light;

export const Typography = {
  fontFamily: 'PlusJakartaSans_400Regular',
  fontFamilyBold: 'PlusJakartaSans_700Bold',
  fontFamilySemiBold: 'PlusJakartaSans_600SemiBold',
  fontFamilyMedium: 'PlusJakartaSans_500Medium',
  fontFamilyRegular: 'PlusJakartaSans_400Regular',

  // Escala oficial (Figma)
  scale: {
    hero: 36, // Input de cantidad
    display: 28, // Métricas KPI (3, 12, 148)
    h1: 22, // Título de pantalla (Vencimientos, Stock, Historial)
    modalTitle: 20, // Título de sheet / modal / popup
    brand: 18, // "Alivia"
    h2: 16, // Nombre de medicamento en tarjeta
    price: 15, // Precio y CTA
    cta: 15,
    button: 14,
    body: 13, // Texto explicativo
    metadata: 12, // Lotes, fechas, estantes
    label: 11, // Chips, tabs, labels
    micro: 10, // Unidades
  },
} as const;

export const Fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  title: 'PlusJakartaSans_700Bold',
  body: 'PlusJakartaSans_400Regular',
  code: 'monospace',
};

// Radios oficiales (Figma / guía técnica ALIVIA)
export const Radius = {
  sm: 6,
  md: 8, // Botones e inputs
  lg: 12, // Tarjetas
  xl: 16, // Modales
  sheet: 20, // Esquinas superiores del BottomSheet
  pill: 9999, // Chips y badges
} as const;

// Sombras oficiales. En Android manda `elevation`; en iOS/web los shadow*.
export const Shadows = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  modal: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  sheet: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,

  // Alias semánticos
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  gutter: 16, // Margen lateral único de todas las pantallas
  cardGap: 12,
  touchTarget: 48, // Ley de Fitts (Figma usa 48x48)
} as const;

export const BottomTabInset = 60;
export const MaxContentWidth = 600;
