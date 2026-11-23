// Alivia Design Tokens - Oficiales
// Basados en la Guía de Diseño y Figma (IHC UMSS - StackOverflow)

const brandLight = {
  // Primarios de Marca
  primary: '#1B5E7B',           // Deep Slate Teal
  primaryHover: '#13465D',
  primaryContainer: '#E0F2F7',  // Fondo suave para chips y badges de marca
  primaryContainerText: '#0E3A4D',
  secondary: '#2E8B9A',

  // Semáforo Semántico de Urgencia (15 / 30 / 60 días)
  critical: {
    text: '#B91C1C',            // Rojo oscuro (≤ 15 días / Vencido)
    bg: '#FEE2E2',
    border: '#EF4444',
  },
  attention: {
    text: '#D97706',            // Ámbar (≤ 30 días / Prioridad mostrador)
    bg: '#FEF3C7',
    border: '#F59E0B',
  },
  regular: {
    text: '#0D9488',            // Teal clínico (≤ 60 días / Control)
    bg: '#CCFBF1',
    border: '#14B8A6',
  },
  success: {
    text: '#166534',            // Verde éxito (Stock al día / Deshacer)
    bg: '#DCFCE7',
    border: '#22C55E',
  },
  danger: '#DC2626',

  // Superficies y Neutros
  canvas: '#F8FAFC',            // Fondo general de la app móvil
  surface: '#FFFFFF',           // Tarjetas (Cards) y BottomSheets
  background: '#FFFFFF',
  backgroundElement: '#F1F5F9',
  border: '#E2E8F0',            // Divisores y bordes sutiles
  borderStrong: '#CBD5E1',

  // Textos y Contraste WCAG 2.1 AA
  text: '#0F172A',              // Títulos y cifras principales (> 12:1)
  textSecondary: '#64748B',     // Metadatos, lotes, subtítulos (> 4.5:1)
  textTertiary: '#94A3B8',
  textDisabled: '#9CA3AF',
  disabledBg: '#E5E7EB',
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
  fontFamily: 'PlusJakartaSans_600SemiBold',
  fontFamilyBold: 'PlusJakartaSans_700Bold',
  fontFamilyRegular: 'PlusJakartaSans_400Regular',
  fontFamilyMedium: 'PlusJakartaSans_500Medium',

  // Escala Tipográfica Oficial
  scale: {
    display: 30,      // Métricas gigantes (3, 12, 148, 250)
    h1: 22,           // Títulos de pantalla (Por Vencer, Stock)
    h2: 16,           // Nombre de medicamento (Ibuprofeno 400 mg)
    button: 14,       // Botones y pestañas (✓ Vender, Confirmar)
    body: 13,         // Textos explicativos
    metadata: 11,     // Lotes, precios, estantes
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
  touchTarget: 44, // Ley de Fitts: Mínimo táctil
} as const;

export const BottomTabInset = 60;
export const MaxContentWidth = 600;
