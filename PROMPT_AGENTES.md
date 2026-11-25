# PROMPT_AGENTES — ALIVIA

Documento operativo para los agentes de código de los 6 integrantes del equipo.
Léelo completo una vez. Después cada integrante copia **solo su bloque** (Sección 23) a su agente.

- Producto: **ALIVIA** — control de vencimientos y stock para farmacia de mostrador.
- Materia: IHC · UMSS · Fase 5.
- Repositorio: `alivia-mobile` (Expo SDK 58 + React Native 0.88 + expo-router).
- Verdad visual: Figma `Trabajo IHC 4` (file key `kIp1kNoNNVro8kUdHhOuih`), congelado en `design/figma/`.
- Verdad de tokens: `src/constants/theme.ts`.
- Dispositivo de demo: **Samsung Galaxy A56 5G**, portrait, navegación por gestos.

---

## 1. Cómo usar este documento

| Rol | Qué hace |
|---|---|
| **Lead** | Ejecuta la Fase 0 (Sección 2), reparte bloques, integra, verifica `tsc`/`eslint`, prueba en el A56. |
| **Integrante** | Copia su bloque completo a su agente. No recorta reglas. Revisa el resultado contra el spec y el PNG. |
| **Agente** | Implementa **solo** los archivos de su bloque. Si algo falta, se detiene y avisa; no inventa. |

Orden obligatorio:

1. Lead ejecuta Fase 0 y confirma que `npx tsc --noEmit` pasa.
2. Cada integrante implementa su bloque en su rama local (sin commit propio).
3. Integrante verifica su pantalla con el checklist de la Sección 20.
4. Lead integra y corre la verificación global.
5. Lead prueba en el Galaxy A56 físico.

> Si el agente no puede cumplir una regla, **no la reinterpreta**: escribe el bloqueo en su entrega.

---

## 2. Fase 0 — Contratos compartidos (solo lead)

Antes de repartir bloques hay que instalar la base compartida. **Ya está escrita y verificada**
en `design/fase0/`; el lead no la programa, solo la copia:

```bash
bash design/fase0/instalar.sh     # copia los 7 archivos a src/
npx tsc --noEmit                  # debe dar 0 errores
npx eslint src                    # debe dar 0 warnings
```

El instalador copia archivos `.txt` a su nombre real (así `tsc` no los compila mientras viven
en `design/`). Detalle completo en `design/fase0/README.md`. Los integrantes **no editan**
estos archivos; solo los importan.

| Archivo | Qué expone | Para qué |
|---|---|---|
| `src/components/ui/AppHeader.tsx` | `<AppHeader back? onBack? right? />` | Barra superior idéntica a Figma: marca + farmacia + ajustes. |
| `src/components/ui/Screen.tsx` | nueva prop `header?: React.ReactNode` | Header full-bleed fijo, fuera del scroll. |
| `src/components/ui/SuccessDialog.tsx` | nuevas props `summary` y `note` | Popups de venta/descarte con resumen y nota. |
| `src/components/ui/index.ts` | exporta `AppHeader` | Un solo punto de importación. |
| `src/lib/demo-data.ts` | `DEMO_LOTS`, `DEMO_MOVEMENTS`, `APP`, tipos y helpers | Dataset único y coherente. |
| `src/lib/format.ts` | `formatBs`, `formatQty`, `daysLabel`, `formatDate`, `normalizeSearch` | Copy numérico y fechas relativas. |
| `src/lib/repository.ts` | hooks y acciones de stock/movimientos | Estado compartido entre pantallas. |

Código exacto de cada archivo: `design/fase0/`. No se transcribe acá para que no haya dos
versiones. Si el lead necesita cambiar algo, lo cambia en `design/fase0/`, reinstala y avisa.

### 2.1 Contrato de `AppHeader`

```tsx
type AppHeaderProps = {
  back?: boolean;                    // muestra ← 44×44
  onBack?: () => void;               // default: router.back()
  right?: React.ReactNode;           // default: botón Ajustes → /configuracion
};
```

Especificación visual (Figma: `Top App Bar`):

- Alto 69 dp + `insets.top`.
- Fondo `Colors.surface`, borde inferior 1 `Colors.border`.
- Marca: 44×44, `Colors.primary`, radio 14, icono `Syringe` blanco 20 + punto verde 6 (`success.accent`).
- Texto: «Alivia» 18 / `fontFamilyBold` / `Colors.text`; «Farmacia San Martín» 11 / `fontFamilySemiBold` / `Colors.textSecondary`.
- Botones laterales: 44×44, fondo `Colors.canvasAlt`, radio 14, icono 20 `Colors.text`.
- Área táctil mínima 48×48 (`hitSlop`).
- `AppHeader` aplica `paddingTop: insets.top` y borde inferior; va **fuera** del scroll.

### 2.1.1 Extensión de `Screen`

```tsx
type ScreenProps = {
  // ...props actuales
  header?: React.ReactNode;   // full-bleed, fijo arriba, no scrollea
};
```

Cuando `header` está presente:

- Se renderiza en un `View` propio arriba del `ScrollView`.
- El contenido **no** suma `insets.top` (ya lo aplicó el header).
- El `ScrollView` conserva el gutter y el `bottomInset`.

Uso estándar en toda pantalla con barra superior:

```tsx
<Screen header={<AppHeader back />}>
  {/* contenido con gutter automático */}
</Screen>
```

Las pantallas sin barra (sheets y popups) siguen usando `Screen` como hoy.

### 2.2 Contrato de `demo-data.ts`

```ts
export type Lot = {
  id: string;                 // 'ib-449'
  name: string;               // 'Ibuprofeno 400 mg'
  description: string;        // 'Antiinflamatorio y analgésico oral'
  form: string;               // 'Comprimidos'
  presentation: string;       // 'Comprimidos caja'
  laboratory: string;         // 'Lab. Bagó'
  lot: string;                // 'IB-449'
  stock: number;              // 200
  unit: Unit;                 // 'comprimidos' | 'frascos' | 'cajas' | 'unidades' | 'viales' | 'ampollas'
  price: number;              // 1.50
  daysToExpire: number;       // 15 | 0 | -3
  expiryDate: string;         // ISO calculada al iniciar: '2026-12-10'
  shelf: string;              // 'Estante C'
  level: string;              // 'N2'
};

export type Movement = {
  id: string;
  type: 'SALE' | 'DISCARD' | 'ENTRY';
  batchId: string;
  productName: string;
  lotCode: string;
  quantity: number;           // siempre positivo; el signo lo pone la UI
  unit: Unit;
  date: string;               // ISO
  user: string;
  reason?: string;            // solo DISCARD
};

export type DiscardReason = 'EXPIRED' | 'DAMAGED_DETERIORATED' | 'RETURN_TO_SUPPLIER';

export const APP = {
  name: 'Alivia', version: 'v1.2', city: 'Cochabamba, Bolivia',
  pharmacy: 'Farmacia San Martín', user: 'Doña Elena', role: 'Encargada de turno',
  totalProducts: 148, totalLots: 18,
} as const;
```

Helpers obligatorios:

```ts
export function toneForDays(days: number): 'critical' | 'attention' | 'regular';
// <=15 critical · 16..30 attention · 31..60 regular
export function bandForDays(days: number): '15' | '30' | '60' | 'expired' | null;
// <=15 → '15' · 16..30 → '30' · 31..60 → '60' · >60 → null · <0 → 'expired'

export const DISCARD_REASONS: { value: DiscardReason; label: string }[];
export function reasonLabel(reason: DiscardReason | string): string;
export const STOCK_LOCATIONS: readonly string[];
export const STOCK_FORMS: readonly string[];
export const HISTORY_USERS: readonly string[];
export const DEMO_LOTS: Lot[];
export const DEMO_MOVEMENTS: Movement[];
```

### 2.3 Contrato de `repository.ts`

```ts
export function useLots(): Lot[];                 // orden FEFO
export function useLot(id: string): Lot | undefined;
export function useMovements(): Movement[];
export function useMetrics(): {
  expired: number; near: number; critical: number; attention: number;
  regular: number; total: number; lots: number;
};
export function useExpiringLots(): Lot[];         // 0..60 días, orden FEFO
export function useHydrated(): boolean;
export function searchLots(lots: Lot[], query: string): Lot[];
export function sellBatch(id: string, qty: number): Promise<void>;
export function discardBatch(id: string, qty: number, reason: DiscardReason): Promise<void>;
export function undoLast(): boolean;              // revierte la última mutación (5 s)
```

Reglas:

- Persistencia local con el SQLite ya inicializado (`src/lib/sqlite.ts`). No agregar dependencias.
- En web, `sqlite.web.ts` ya provee el shim; la UI no cambia.
- Toda mutación descuenta stock, crea `inventory_movements` y deja la operación en `sync_outbox`.
- `sellBatch`/`discardBatch` rechazan cantidad `<= 0`, `> stock` o lote vencido (venta).
- `undoLast` restaura stock y borra el movimiento creado por la última operación, solo dentro de 5 s.

### 2.4 Contrato de `format.ts`

```ts
formatBs(15)                // 'Bs. 15.00'
formatQty(5, 'comprimidos') // '5 comprimidos'   (1 → '1 comprimido')
formatQtyShort(10, 'comprimidos') // '10 comp.'
daysLabel(15)               // 'Vence en 15 días'
daysLabel(-3)               // 'Venció hace 3 días'
formatDate(new Date())      // 'Hoy, 19:42' | 'Ayer, 11:30' | '15 Nov'
formatLongDate(new Date())  // '10 de diciembre'
daysUntil('2026-12-10')     // 15
normalizeSearch('Amoxicilina') // 'amoxicilina' (sin acentos, minúsculas)
```

### 2.5 Cambio en `SuccessDialog` (ya incluido en `design/fase0`)

Dos props opcionales, sin romper las existentes:

```tsx
summary?: { label: string; value: string }[];  // 2 columnas (qty / total)
note?: string;                                  // 'Stock restante en estante: 150 unidades'
```

`summary` se renderiza en una caja `Colors.field`, radio `Radius.lg`, columnas flexibles con
label 11 `fontFamilySemiBold` `textSecondary` y valor 18 `fontFamilyBold` `text`.
`note` se renderiza debajo, 12 `fontFamilyMedium` `textSecondary`.

---

## 3. Reglas no negociables

Si el agente hace cualquiera de estas cosas, **rompe el proyecto**.

1. **No ejecutar** `npm install`, `npm i`, `npx expo install`, `npm update`, `npm audit fix`, `expo prebuild`, `pod install`.
2. **No modificar** `package.json` ni `package-lock.json`. Versionado congelado.
3. **No modificar** `src/constants/theme.ts`, `src/components/ui/*`, `src/lib/sqlite*`, `src/lib/supabase.ts`, `src/types/*`, `app.json`, `tsconfig.json`, `eslint.config.js`, `.env`, `ios/`, `android/`.
4. **No modificar** `src/app/_layout.tsx` ni `src/app/(tabs)/_layout.tsx`. Todas las rutas ya existen.
5. **No usar Git** para commit, branch, stash, reset, clean ni checkout. El lead integra.
6. **No agregar** librerías, fuentes, iconos ni assets. Todo sale de lo instalado.
7. **No escribir** hex, tamaños, radios, sombras ni espaciados sueltos. Todo sale de `theme.ts` o de un componente compartido.
8. **No duplicar** botones, cards, badges, chips, sheets, diálogos ni headers. Si falta una variante, se pide al lead.
9. **No inventar** pantallas, rutas, estados ni textos. El copy está en la Sección 15 y en `design/figma/specs/`.
10. **No usar** `Alert.alert`, `console.log` en entrega, `any`, `@ts-ignore`, `eslint-disable` ni `style={{ ... }}` con valores mágicos.
11. **No escalar** la UI para “que entre”. La regla 390→384 está en la Sección 6.
12. **No tocar** archivos de otro integrante. Cada archivo tiene un solo dueño (Sección 16).
13. **No dejar** `TODO`, `FIXME`, `lorem ipsum`, datos de ejemplo nuevos ni botones sin acción.
14. **No usar** `Text` de React Native sin `fontFamily` explícita de `Typography`.
15. **No usar** colores fuera del semáforo FEFO para estados de vencimiento.
16. **No hardcodear** conteos ni fechas. Se calculan desde `repository.ts`.
17. **No romper** el modo claro ni el portrait. No hay dark mode ni landscape.
18. **No usar** gestos horizontales pegados a los bordes (chocan con el gesto “atrás” de Android).
19. **No poner** contenido crítico en los últimos 24 dp de la pantalla (zona de gestos).
20. **No entregar** sin `npx tsc --noEmit` y `npx eslint src` limpios.

---

## 4. Producto y usuario

**Alivia** es una app móvil para el personal de mostrador de una farmacia. No es una app para
clientes: no hay catálogo público, carrito, delivery, recetas ni pagos.

| Dato | Valor |
|---|---|
| Usuaria | **Doña Elena**, 52 años, encargada de turno |
| Contexto | Mostrador, de pie, luz variable, guantes, interrupciones constantes |
| Tarea principal | Detectar lotes vencidos o próximos a vencer y resolverlos (vender FEFO o descartar) |
| Tarea secundaria | Consultar stock y auditar movimientos |
| Éxito | En ≤ 3 toques sabe qué retirar hoy y registra la salida sin errores |
| Fracaso | Vender un lote vencido, descartar el lote equivocado, perder el hilo por un modal |

Consecuencias de diseño:

- Botones grandes, texto legible, una decisión por pantalla.
- El estado de vencimiento nunca depende solo del color: siempre lleva texto («Vence en 15 días»).
- Las acciones destructivas piden confirmación y ofrecen deshacer 5 s.
- La app debe funcionar **sin conexión** para leer y registrar; sincroniza después.

---

## 5. Entorno congelado y versionado

| Elemento | Valor |
|---|---|
| Node actual | `v20.18.1` (Expo 58 pide ≥ 22.13; el proyecto ya corre así: no cambiar) |
| Expo | `~58.0.26` (CLI 58.1.21) |
| React Native | `0.88.1` |
| React | `19.3.0` |
| Router | `expo-router ~58.0.32` |
| Tipografía | `@expo-google-fonts/plus-jakarta-sans ^0.4.2` |
| Iconos | `lucide-react-native ^1.78.0` |
| Estado servidor | `@tanstack/react-query ^5.108.4` |
| Persistencia | `expo-sqlite ~58.0.18` |
| Backend | Supabase (BaaS). **Sin API propia.** |

### Candado de versionado

```
package.json        sha256 9b1b638ea825eb371860eb474d7c8a1eb62aa34630c45123ec397e3a64c67f8e
package-lock.json   sha256 11198a6e8ca63e76e3d103603a510985f7a3ce778183a5d71fa25862c0f90c19
```

Verificación obligatoria antes de entregar:

```bash
git diff --name-only | grep -E 'package(-lock)?\.json' && echo 'ROMPISTE EL CANDADO' || echo 'OK'
```

Si el candado se rompe, el lead rechaza la entrega completa.

> Nota conocida: `package.json` contiene una dependencia basura `"22": "^0.0.0"`. **No se toca**:
> cambiarla obliga a regenerar el lockfile. Se documenta y se ignora.

### Comandos permitidos

```bash
npx tsc --noEmit
npx eslint src
npx expo start          # solo lead
npx expo start --web    # solo lead, vista previa
```

### Comandos prohibidos

```bash
npm install · npm i · npm ci · npm update · npm audit fix
npx expo install · npx expo prebuild · npx expo run:android
git commit · git checkout · git reset --hard · git clean -fd · git stash
```

---

## 6. Dispositivo objetivo: Galaxy A56 5G

Se diseña para **un solo dispositivo**. No hay responsive, tablet, landscape ni desktop.

| Dato | Valor |
|---|---|
| Pantalla | 6.7" Super AMOLED FHD+ |
| Resolución física | **1080 × 2340 px** |
| Proporción | 19.5:9 · 385 ppi |
| Densidad reportada | ~450 dpi → factor **2.8125** |
| Viewport lógico | **384 × 832 dp** |
| Canvas Figma | 390 × 844 dp (referencia, no destino) |
| Ancho útil con gutter 16 | **352 dp** |
| Barra de estado | ~24–32 dp (usar `useSafeAreaInsets`) |
| Zona de gestos | ~24 dp (usar `useSafeAreaInsets`) |
| Navegación | **Solo gestos**; botones 3-button deshabilitados |
| Modo | Claro, portrait |

### Reglas de adaptación 390 → 384

| Elemento | Regla |
|---|---|
| Márgenes laterales | Siempre `Spacing.gutter` (16). |
| Ancho de tarjeta | `width: '100%'` dentro del gutter; nunca 353 fijo. |
| Alturas | Se conservan (102, 113, 61, 48…). |
| Tipografía | Se conserva el token; **no se escala**. |
| Radios | Se conserva el token; **no se escala**. |
| Iconos | 18/20/22/24 según Figma. |
| Full-bleed | `width: '100%'`, sin gutter. |
| Listas | `FlatList` con `contentContainerStyle` y `gap`, no posiciones absolutas. |
| Tolerancia | ≤ 6 dp de ancho. Todo lo demás debe coincidir. |

### Safe areas (obligatorio)

- Toda pantalla usa `useSafeAreaInsets()`.
- `Screen` ya aplica `paddingTop: insets.top`; no sumar otro.
- Tab bar: alto `60 + insets.bottom`; los labels no quedan tapados por la barra de gestos.
- Sheets: `paddingBottom: insets.bottom + 24`.
- Popups centrados: `paddingBottom: insets.bottom` para no chocar con la barra.
- Prohibido hardcodear `paddingTop: 44` o `paddingBottom: 24` como reemplazo del inset.

### Gestos

- La flecha ← visible se mantiene siempre (Ley de Jakob), aunque el gesto “atrás” funcione.
- No usar `Swipeable` en los bordes izquierdo/derecho.
- El gesto de arrastre del sheet es vertical y no compite con el sistema.
- `predictiveBackGestureEnabled` queda en `false` (ya configurado). No cambiarlo.

### Prueba obligatoria

- A56 físico, tamaño de letra **por defecto**, pantalla completa.
- Navegación por gestos activada.
- Probar con la barra de gestos visible y con la app en primer plano.
- Prohibido validar solo en web o en el emulador de escritorio.

---

## 7. Fidelidad Figma (regla principal)

**Figma es la verdad visual. La implementación es una transcripción, no una interpretación.**

Se copia exacto:

1. Orden vertical y jerarquía de bloques.
2. Copy (con las correcciones de la Sección 15).
3. Colores (siempre vía `theme.ts`).
4. Tamaños y pesos tipográficos (vía `Typography.scale`).
5. Radios, bordes, paddings, gaps y alturas.
6. Iconos (equivalente Lucide más cercano, mismo tamaño).
7. Distribución de columnas y énfasis (qué es primario y qué es secundario).

No se copia:

- El marco de 390 × 844 con status bar y tab bar dibujadas: la app usa las nativas.
- Fuentes `Inter`, `FreeSans`, `Liberation Sans`, `Nimbus Sans`: residuos de migración.
- Títulos de 24/26 px: se normalizan a `h1` (22).
- Sombras exactas: se usan `Shadows.card/modal/sheet`.
- Frames duplicados o de referencia (`519:3715`, que es un estado de Descartar, no una pantalla).

### Cómo trabajar con el congelado

1. Abrí `design/figma/MANIFEST.md` y ubicá tu pantalla por frame ID.
2. Leé `design/figma/specs/<id>.md`: ahí están todas las medidas y textos.
3. Compará con el PNG `design/figma/png/<id>-<slug>.png` cuando exista.
4. Implementá.
5. Capturá en el A56 y compará lado a lado.
6. Declará desviaciones: `ninguna` o lista concreta.

### Prohibiciones de fidelidad

- “Aproximar” un color, un radio o un tamaño “porque se ve mejor”.
- Inventar un componente que ya existe en `src/components/ui`.
- Usar hex de la guía vieja (`#2E8B9A`, `#0D9488`, `#F8FAFC`) si `theme.ts` dice otro.
- Cambiar el copy “para que suene mejor”.
- Reordenar bloques “para que respire”.
- Reemplazar un icono por otro “parecido” sin justificarlo.
- Escalar la pantalla completa para que entre en 384 dp.

---

## 8. Sistema de diseño

Fuente única: `src/constants/theme.ts`. Si un valor no está ahí, **no se usa**.

### 8.1 Colores

| Token | Hex | Uso |
|---|---|---|
| `Colors.primary` | `#1B5E7B` | CTA principal, marca, tab activa |
| `Colors.primaryHover` | `#13465D` | Pressed |
| `Colors.primaryPressed` | `#0E3A4D` | Pressed profundo |
| `Colors.primaryContainer` | `#E0F2F7` | Chips, atajos, footer link |
| `Colors.primaryContainerText` | `#0E3A4D` | Texto sobre container |
| `Colors.secondary` | `#3F7890` | Apoyo |
| `Colors.canvas` | `#F7F9FB` | Fondo de pantalla |
| `Colors.canvasAlt` | `#F8FAFC` | Top bar, botones de icono |
| `Colors.surface` | `#FFFFFF` | Tarjetas, sheets |
| `Colors.field` | `#F1F5F9` | Inputs, cajas neutras |
| `Colors.border` | `#E2E8F0` | Borde por defecto |
| `Colors.borderStrong` | `#CBD5E1` | Borde de chips/outline |
| `Colors.text` | `#0F172A` | Texto principal |
| `Colors.textAlt` | `#1A1D21` | Texto alterno |
| `Colors.textSecondary` | `#64748B` | Texto secundario |
| `Colors.textMuted` | `#5F6B7A` | Texto terciario |
| `Colors.textTertiary` | `#94A3B8` | Placeholder, inactivo |
| `Colors.critical.text` | `#B91C1C` | ≤ 15 días |
| `Colors.critical.strong` | `#D32F2F` | Cifras/íconos críticos |
| `Colors.critical.bg` | `#FEE2E2` | Fondo crítico |
| `Colors.critical.border` | `#EF4444` | Borde crítico |
| `Colors.attention.text` | `#E65100` | 16–30 días |
| `Colors.attention.strong` | `#D97706` | Cifras atención |
| `Colors.attention.bg` | `#FEF3C7` | Fondo atención |
| `Colors.attention.border` | `#F59E0B` | Borde atención |
| `Colors.regular.text` | `#0369A1` | 31–60 días |
| `Colors.regular.bg` | `#E0F2FE` | Fondo regular |
| `Colors.regular.border` | `#7DD3FC` | Borde regular |
| `Colors.success.text` | `#166534` | Éxito, ingreso |
| `Colors.success.accent` | `#16A34A` | Icono check |
| `Colors.success.bg` | `#DCFCE7` | Fondo éxito |
| `Colors.danger` | `#D32F2F` | Error / eliminar |
| `Colors.scrim` | `rgba(0,0,0,0.45)` | Fondo de modal/sheet |
| `Colors.disabledBg` | `#E2E8F0` | Botón deshabilitado |
| `Colors.textDisabled` | `#94A3B8` | Texto deshabilitado |

### 8.2 Tipografía

Plus Jakarta Sans, cuatro pesos: 400, 500, 600, 700.
**Prohibido 800** (Figma lo usa por accidente; se normaliza a 700).

| Token | px | Uso |
|---|---:|---|
| `Typography.scale.hero` | 36 | Input de cantidad |
| `Typography.scale.display` | 28 | Métricas KPI |
| `Typography.scale.h1` | 22 | Título de pantalla, nombre en detalle |
| `Typography.scale.modalTitle` | 20 | Título de sheet/modal/popup |
| `Typography.scale.brand` | 18 | «Alivia» |
| `Typography.scale.h2` | 16 | Nombre de medicamento en tarjeta |
| `Typography.scale.price` | 15 | Precio, CTA, nombre en lista |
| `Typography.scale.cta` | 15 | Label de botón |
| `Typography.scale.button` | 14 | Botón chico/chip |
| `Typography.scale.body` | 13 | Texto explicativo |
| `Typography.scale.metadata` | 12 | Lotes, fechas, estantes |
| `Typography.scale.label` | 11 | Chips, badges, tabs |
| `Typography.scale.micro` | 10 | Unidades, notas |

Pesos:

| Token | Uso |
|---|---|
| `fontFamilyRegular` | Cuerpo |
| `fontFamilyMedium` | Chips, metadata enfática |
| `fontFamilySemiBold` | Subtítulos, valores |
| `fontFamilyBold` | Títulos, CTA, cifras |

Line-height: Figma usa `~1.26`. En RN, para títulos usar `lineHeight = fontSize * 1.25`; para
cuerpo, `fontSize * 1.45`.

### 8.3 Espaciado

| Token | dp |
|---|---:|
| `Spacing.half` | 2 |
| `Spacing.one` / `xs` | 4 |
| `Spacing.two` / `sm` | 8 |
| `Spacing.three` / `md` | 12 |
| `Spacing.four` / `lg` | 16 |
| `Spacing.five` / `xl` | 20 |
| `Spacing.six` / `xxl` | 24 |
| `Spacing.gutter` | 16 |
| `Spacing.cardGap` | 12 |
| `Spacing.touchTarget` | 48 |

Prohibido `padding: 13`, `gap: 10`, `marginTop: 18`. Si no está en la escala, no existe.

### 8.4 Radios y sombras

| Token | dp | Uso |
|---|---:|---|
| `Radius.sm` | 6 | Detalles |
| `Radius.md` | 8 | Botones, inputs |
| `Radius.lg` | 12 | Tarjetas |
| `Radius.xl` | 16 | Modales y cards de configuración |
| `Radius.sheet` | 20 | Esquinas superiores del BottomSheet |
| `Radius.pill` | 9999 | Chips, badges, círculos |

Sombras: `Shadows.card`, `Shadows.modal`, `Shadows.sheet`. No inventar `elevation`.

### 8.5 Iconografía

| Concepto | Icono Lucide | Tamaño |
|---|---|---|
| Vencimientos (tab) | `AlarmClock` | 24 |
| Stock (tab) | `Package` | 24 |
| Ajustes | `Settings` | 20 |
| Volver | `ArrowLeft` | 22 |
| Vender | `Check` | 16 |
| Descartar | `X` | 16 |
| Historial | `History` | 20 |
| Buscar | `Search` | 18 |
| Filtros | `SlidersHorizontal` | 20 |
| Ver detalle | `ChevronRight` | 14 |
| Crítico | `CircleAlert` | 18/20 |
| Vencido | `CalendarX2` | 20 |
| Sin stock | `PackageX` | 20 |
| Éxito | `CheckCircle2` | 40 |
| Sin conexión | `WifiOff` | 40 |
| Venta | `ArrowDownRight` | 20 |
| Ingreso | `ArrowUpRight` | 20 |
| Descarte | `TriangleAlert` | 20 |
| Dinero | `Banknote` | 16 |

Todos los iconos llevan `color` de token y `strokeWidth={2}`. No usar emojis en la UI final
(«✓», «✕», «⚠️», «↺» del copy de Figma se reemplazan por iconos Lucide o por texto limpio).

### 8.6 Conflictos resueltos (no volver a discutirlos)

| Dato | Guía vieja | Usar |
|---|---|---|
| Canvas | `#F8FAFC` | `Colors.canvas` `#F7F9FB` |
| Secondary | `#2E8B9A` | `Colors.secondary` `#3F7890` |
| Regular 60d | `#0D9488` / `#CCFBF1` | `#0369A1` / `#E0F2FE` |
| Tipografía | Inter / Roboto | Plus Jakarta Sans |
| Touch target | 44 | 48 |
| Título de modal | 20–22 | 20 |
| Título de pantalla | 24 | 22 |

Regla: **Figma (Color) > `theme.ts` > guía > prompts viejos.** Si Figma y `theme.ts` chocan en
un token, gana `theme.ts` porque es el código; se reporta al lead.

---

## 9. Catálogo de componentes compartidos

Todos los de la tabla viven en `src/components/ui` y se importan desde `@/components/ui`.
**No se editan.** Si falta una variante, se pide al lead.

| Componente | Props principales | Cuándo usarlo | Cuándo NO |
|---|---|---|---|
| `Screen` | `scroll`, `bleed`, `bottomInset` | Contenedor de toda pantalla | Dentro de sheets |
| `AppHeader` | `back`, `onBack`, `right` | Barra superior de toda pantalla | Dentro de modales |
| `ScreenHeader` | `title`, `subtitle`, `back`, `right` | Título de pantalla cuando **no** se usa `AppHeader` | No combinar ambos |
| `Card` | `accent`, `onPress`, `style` | Tarjetas blancas con borde y sombra | Contenedores de sheet |
| `Button` | `label`, `variant`, `icon`, `disabled`, `loading`, `fullWidth` | Toda acción | Texto clickeable (usar `Pressable`) |
| `Badge` | `label`, `tone`, `solid` | Semáforo FEFO, estados | Etiquetas de formulario |
| `Chip` | `label`, `selected`, `onPress`, `error` | Filtros y motivos | Tabs segmentadas |
| `Sheet` | `title`, `subtitle`, `footer` | Cuerpo de bottom sheet | Modal centrado |
| `ConfirmDialog` | `title`, `subtitle`, `rows`, `primaryLabel`, `secondaryLabel`, handlers | Confirmación de acciones | Éxito |
| `SuccessDialog` | `title`, `message`, `detail`, `summary`, `note`, `primaryLabel`, `secondaryLabel` | Venta/descarte exitoso | Errores |
| `EmptyState` | `icon`, `title`, `description`, `actionLabel`, `onAction` | Listas vacías, sin resultados | Sin conexión |
| `UndoSnackbar` | `message`, `actionLabel`, `onAction` | Deshacer 5 s en listas | Confirmación de modal |

Fuera de `ui/`, pero compartido: `SinConexionDialog` (`src/components/SinConexionDialog.tsx`,
dueño Int 1) con props `visible`, `onRetry`, `onCancel`, `message`. Se usa ante falla de
escritura / modo offline. No se usa para errores de validación.

### Reglas de composición

- Un `Button` primario por pantalla. El resto es `secondary` o `ghost`.
- Un `Badge` por tarjeta como máximo (el semáforo).
- Nunca anidar `Card` dentro de `Card`.
- Nunca poner `Button` dentro de `Button`.
- Los sheets usan `Sheet`; los popups centrados usan `ConfirmDialog`/`SuccessDialog`.
- Los estados vacíos usan `EmptyState`; no se arma uno nuevo.
- El scrim siempre es `Colors.scrim`; no usar `rgba` suelto.

---

## 10. Navegación y contratos de ruta

```
/                         → (tabs)/index.tsx      Dashboard        Int 1
/stock                    → (tabs)/stock.tsx      Stock            Int 5
/por-vencer               → por-vencer.tsx        Por Vencer       Int 2
/historial                → historial.tsx         Historial        Int 6
/detalle/[id]             → detalle/[id].tsx      Detalle          Int 3
/configuracion            → configuracion.tsx     Configuración    Int 1
/venta/[id]               → venta/[id].tsx        Registrar venta  Int 4  (transparentModal)
/descartar/[id]           → descartar/[id].tsx    Descartar        Int 4  (transparentModal)
/venta-exitosa            → venta-exitosa.tsx     Venta exitosa    Int 2  (transparentModal)
/descarte-exitoso         → descarte-exitoso.tsx  Descarte exitoso Int 6  (transparentModal)
```

### Params

`detalle/[id]`, `venta/[id]`, `descartar/[id]` reciben el **id del lote**:
`ib-449`, `p-500`, `amx-12`, `omp-88`, `los-102`, `cet-05`, `amx-08`, `amx-14`, `amx-22`.

Si el id no existe: mostrar `EmptyState` «Lote no encontrado» + botón «Volver al listado».
No romper, no redirigir en silencio.

`venta-exitosa` recibe:

```ts
{ name: string; lot: string; qty: number; unit: string; total: number; remaining: number }
```

`descarte-exitoso` recibe:

```ts
{ name: string; lot: string; qty: number; unit: string; total: number; remaining: number; reason: string }
```

Los params se leen con `useLocalSearchParams<{ ... }>()` y se normalizan a número con `Number()`.
Si falta un param, usar valores seguros y no mostrar `undefined`.

### Flujos

```
Dashboard ──Ver alertas──▶ Por Vencer ──Vender────▶ Venta ──Confirmar──▶ Venta exitosa ──▶ Por Vencer
    │                          │                     └─Cancelar──▶ Por Vencer
    ├──KPIs──▶ Por Vencer      └──Descartar──▶ Descartar ──Confirmar──▶ Descarte exitoso ──▶ Por Vencer
    ├──Ajustes──▶ Configuración
    └──Historial──▶ Historial
Stock ──Ver detalle──▶ Detalle ──Vender──▶ Venta
                            └──Descartar──▶ Descartar / ConfirmDialog
```

Regla de cierre:

- «Continuar atendiendo» → `router.dismissAll()` y volver a `/por-vencer` (o `/stock` si vino de ahí).
- «Cancelar» en sheet → `router.back()`.
- Nunca dejar el stack con dos copias de la misma pantalla.

### Navegación visible

- 2 tabs: **Vencimientos** y **Stock**. Nada más.
- Historial, Por Vencer, Detalle, Venta, Descarte y Configuración son pantallas apiladas.
- La flecha ← siempre visible en pantallas apiladas.
- El tab activo usa `Colors.primary`; el inactivo `Colors.textTertiary`.
- Tab bar: alto `60 + insets.bottom`, fondo `surface`, borde superior `border`, label 11 semibold.

---

## 11. Datos canónicos

Un solo dataset para toda la app. Vive en `src/lib/demo-data.ts` (Fase 0).
**Prohibido** que cada pantalla invente su propio array.

### 11.1 Reglas

- Fechas **relativas a hoy**, calculadas al inicializar. Nunca `2025` hardcodeado.
- 18 lotes en total, 3 vencidos, 12 próximos a vencer (≤ 60 días), 3 regulares.
- 148 productos registrados (catálogo), independiente de los 18 lotes.
- Precios en `Bs.` con dos decimales y punto: `Bs. 1.50`.
- Unidades en singular/plural correcto: `1 comprimido`, `5 comprimidos`.
- Nombres de lote en mayúsculas con guion: `IB-449`.
- La usuario de la sesión es **Doña Elena**; el historial puede tener otros responsables.

### 11.2 Lotes visibles en Figma (obligatorios)

| ID | Producto | Presentación | Lote | Stock | Precio | Días | Ubicación |
|---|---|---|---|---:|---:|---:|---|
| `ib-449` | Ibuprofeno 400 mg | Comprimidos caja | IB-449 | 200 comp. | 1.50 | +15 | Estante C · N2 |
| `p-500` | Paracetamol 500 mg | Jarabe infantil | P-500 | 3 frascos | 8.00 | +12 | Estante B · N3 |
| `amx-12` | Amoxicilina 250 mg / 5 ml | Suspensión 60 ml | AMX-12 | 2 frascos | 18.00 | +8 | Estante B · N2 |
| `omp-88` | Omeprazol 20 mg | Cápsulas frasco | OMP-88 | 5 unidades | 2.50 | +28 | Estante A · N1 |
| `los-102` | Losartán Potásico 50 mg | Blíster caja | LOS-102 | 3 cajas | 3.20 | +24 | Estante A · N2 |
| `cet-05` | Cetirizina 10 mg | Comprimidos | CET-05 | 2 cajas | 1.80 | +19 | Estante A · N3 |
| `amx-08` | Amoxicilina 500 mg | Suspensión oral 60 ml | AMX-08 | 12 frascos | 14.50 | +12 | Estante C · N2 |
| `amx-14` | Amoxicilina + Ác. Clavulánico 875/125 | Comprimidos recubiertos | AMX-14 | 60 comp. | 4.00 | +24 | Estante C · N1 |
| `amx-22` | Amoxicilina 250 mg / 5 ml | Jarabe pediátrico 100 ml | AMX-22 | 8 frascos | 18.00 | +30 | Estante B · N3 |

> El id canónico es `omp-88`; el código de lote visible es `OMP-88`. No confundir.

### 11.3 Lotes de relleno (completan los 18)

| ID | Producto | Stock | Días | Banda |
|---|---|---:|---:|---|
| `dic-11` | Diclofenaco 50 mg | 4 comp. | −3 | vencido |
| `sal-04` | Salbutamol aerosol 100 mcg | 1 u. | −8 | vencido |
| `ins-07` | Insulina NPH 100 UI/ml | 2 viales | −12 | vencido |
| `dic-75` | Diclofenaco 75 mg | 6 amp. | +14 | 15 |
| `ibu-600` | Ibuprofeno 600 mg | 30 comp. | +38 | 60 |
| `lor-10` | Loratadina 10 mg | 10 cajas | +41 | 60 |
| `met-500` | Metformina 500 mg | 40 comp. | +75 | regular |
| `vit-c` | Vitamina C 500 mg | 20 cajas | +90 | regular |
| `omep-40` | Omeprazol 40 mg | 12 cajas | +120 | regular |

### 11.4 Movimientos del historial (5)

| # | Tipo | Producto | Cantidad | Fecha | Responsable | Motivo |
|---|---|---|---:|---|---|---|
| 1 | SALE | Amoxicilina 500 mg | −10 comp. | Hoy 19:42 | Carlos M. | — |
| 2 | DISCARD | Ibuprofeno 400 mg | −5 comp. | Hoy 16:15 | Laura G. | Fecha vencida |
| 3 | ENTRY | Amoxicilina + Ác. Clavulánico | +20 cajas | Ayer 11:30 | Roberto S. | — |
| 4 | SALE | Paracetamol 500 mg | −1 frasco | Ayer 09:10 | Doña Elena | — |
| 5 | DISCARD | Cetirizina 10 mg | −2 cajas | 15 Nov | Doña Elena | Empaque deteriorado |

### 11.5 Métricas del Dashboard

Se calculan con `useMetrics()`:

- **Vencidos** = lotes con `daysToExpire < 0` → 3.
- **Próximos a vencer** = `0 <= daysToExpire <= 60` → 12.
- **Medicamentos registrados** = `APP.totalProducts` → 148.

Los números de Figma (3/4/12/148) son muestras. **Nunca hardcodear**: se derivan.
Los badges («N críticos», «N en atención», «N lotes») también se calculan.

---

## 12. Matriz de estados por pantalla

Toda pantalla debe cubrir, como mínimo, los estados que le corresponden:

| Pantalla | default | loading | empty | error | success | pressed |
|---|---|---|---|---|---|---|
| Dashboard | sí | skeleton | sin alertas | banner offline | — | sí |
| Por Vencer | sí | skeleton | pestaña vacía | banner offline | undo | sí |
| Detalle | normal | — | sin stock | vencido | — | sí |
| Venta | sí | confirmando | — | cantidad inválida / offline | — | sí |
| Descartar | sí | confirmando | — | sin motivo / cantidad inválida | — | sí |
| Stock | sí | skeleton | sin resultados | banner offline | — | sí |
| Filtro Stock | sí | aplicando | 0 resultados | — | — | sí |
| Historial | sí | skeleton | sin movimientos | banner offline | — | sí |
| Filtro Historial | sí | aplicando | 0 resultados | rango inválido | — | sí |
| Configuración | sí | guardando | — | error de guardado | toast | sí |
| Popups | confirm | procesando | — | error | éxito | sí |

Reglas de estado:

- **Loading:** `ActivityIndicator` con `Colors.primary`; nunca spinner de pantalla completa si ya hay datos.
- **Empty:** `EmptyState` con icono, título y descripción; acción si aporta.
- **Error:** mensaje concreto + acción de recuperación. Nunca «Algo salió mal».
- **Success:** `SuccessDialog` con resumen de lo ocurrido y «Continuar atendiendo».
- **Pressed:** `activeOpacity={0.85}`; cambio de color en botones primarios.
- **Disabled:** `Colors.disabledBg` + `textDisabled`; `accessibilityState={{ disabled: true }}`.
- **Focus (web/teclado):** borde `Colors.primary` de 2 dp en inputs.

Microinteracciones: 150–250 ms. Nada de animaciones de más de 300 ms ni rebotes.

---

## 13. Accesibilidad (WCAG 2.1 AA)

### Contraste

- Texto normal ≥ 4.5:1; texto grande (≥ 18.66 bold / 24 regular) ≥ 3:1.
- `Colors.text` sobre `surface` = 15.9:1 ✅
- `Colors.textSecondary` sobre `surface` = 4.76:1 ✅
- `Colors.textTertiary` sobre `surface` = 2.56:1 ❌ → solo placeholder/íconos decorativos.
- Texto blanco sobre `Colors.primary` = 7.0:1 ✅
- `critical.text` sobre `critical.bg` = 5.9:1 ✅
- `attention.text` sobre `attention.bg` = 4.6:1 ✅
- `regular.text` sobre `regular.bg` = 5.1:1 ✅

### Área táctil

- Mínimo **48 × 48 dp** (`Spacing.touchTarget`), aunque el dibujo sea 44.
- `hitSlop={8}` en iconos de 20–24.
- Separación mínima entre acciones: 8 dp.

### Semántica

- Todo `TouchableOpacity`/`Pressable` lleva `accessibilityRole="button"`.
- Iconos sin texto: `accessibilityLabel` explícito.
- Imágenes decorativas: `accessibilityElementsHidden` o `importantForAccessibility="no"`.
- Estados: `accessibilityState={{ disabled, selected, busy }}`.
- Inputs: `accessibilityLabel`, `accessibilityHint`, `keyboardType`, `returnKeyType`.
- Títulos de pantalla: `accessibilityRole="header"`.
- El estado de vencimiento se anuncia con texto, no solo color.

### Anuncios dinámicos

- En éxito/confirmación: `AccessibilityInfo.announceForAccessibility('Venta registrada')`.
- En error de validación: anunciar el mensaje y mover el foco al campo.
- El snackbar de undo se anuncia una vez, sin repetir cada segundo.

### Movimiento

- Respetar `AccessibilityInfo.isReduceMotionEnabled()`.
- Si está activo: sin slide, solo fade de 150 ms.
- Prohibido parallax, auto-play o animaciones infinitas.

### Fuente del sistema

- No bloquear el escalado.
- Probar con «Fuente grande» del A56: si una tarjeta se rompe, se arregla el layout (flex, `numberOfLines`), no se capa la fuente.
- Los textos de una línea usan `numberOfLines={1}` + `ellipsizeMode="tail"` solo cuando el contenido es corto por diseño.

### Teclado

- `KeyboardAvoidingView` con `behavior="padding"` en Android.
- El CTA del sheet queda visible con el teclado abierto.
- `keyboardShouldPersistTaps="handled"` en listas.
- `TextInput` numérico: `keyboardType="number-pad"`, `maxLength={6}`, `selectTextOnFocus`.

---

## 14. Leyes UX aplicadas

| Ley / heurística | Cómo se cumple en Alivia |
|---|---|
| **Fitts** | CTA de 48–56 dp de alto, ancho completo; acciones destructivas separadas; iconos con `hitSlop`. |
| **Hick** | 2 tabs; una decisión por pantalla; máximo 3 motivos de descarte; filtros agrupados por categoría. |
| **Gestalt (proximidad)** | Tarjetas con `gap` 12; labels pegados a su valor; secciones con 24 de separación. |
| **Gestalt (similitud)** | Mismo `Card`, mismo `Badge`, mismo `Button` en toda la app; semáforo consistente. |
| **Gestalt (figura/fondo)** | Scrim 45 % detrás de sheets; superficie blanca sobre canvas; borde sutil. |
| **Jakob** | Patrón Android: flecha ←, tabs abajo, sheet desde abajo, FAB-like CTA. |
| **Nielsen 1: visibilidad** | Contadores en vivo, stock restante, «Quedarán 190», estado de conexión. |
| **Nielsen 2: mundo real** | «Vence en 15 días», «Retirar del estante», «Mostrador», no jerga técnica. |
| **Nielsen 3: control y libertad** | Cancelar en todo sheet; ← siempre; deshacer 5 s; «Volver a editar cantidad». |
| **Nielsen 4: consistencia** | Un solo sistema de tokens y componentes; mismo copy en todas las pantallas. |
| **Nielsen 5: prevención** | Validación antes de confirmar; venta bloqueada si vencido o sin stock; motivo obligatorio. |
| **Nielsen 6: reconocer > recordar** | Chips de filtros activos visibles; resumen en el popup de confirmación. |
| **Nielsen 7: flexibilidad** | «Vender todo el lote», «Ajustar al máximo», autocompletado, filtros rápidos. |
| **Nielsen 8: estética minimalista** | Sin decoración; solo datos y acciones; máximo 3 KPIs. |
| **Nielsen 9: errores** | Mensajes concretos con la solución («Ingresa un número entre 1 y 200»). |
| **Nielsen 10: ayuda** | Subtítulos explicativos, placeholders, hints accesibles. |

---

## 15. Diccionario de copy

Español Bolivia. Tono directo, profesional, sin diminutivos ni humor.
Moneda: `Bs.` con dos decimales (`Bs. 15.00`). Fechas relativas (`Hoy, 19:42`).

### 15.1 Términos canónicos

| Usar | No usar |
|---|---|
| Vencimientos | Caducidades, Expiración |
| Por Vencer | Próximos a caducar |
| Vencido | Caducado, Expirado |
| Lote | Batch |
| Estante | Góndola, Repisa |
| Mostrador | Counter |
| Retirar del estante | Dar de baja |
| Descartar | Eliminar, Borrar |
| Descarte | Baja, Merma (solo en filtros como sinónimo) |
| Venta | Salida (solo en filtros) |
| Ingreso | Entrada, Reposición (solo en filtros) |
| Stock | Inventario (solo en filtros/título) |
| Medicamento | Producto (en UI), SKU |
| Doña Elena | Elena, la usuaria |

### 15.2 Etiquetas fijas

- `MOSTRADOR ACTIVO`
- `ATENCIÓN INMEDIATA` (corregido; Figma dice «ATÉNCION»)
- `VENCEN ESTE MES`
- `STOCK VIGILADO`
- `ALERTA CRÍTICA`
- `CADUCADO` (badge de detalle vencido)
- `STOCK AGOTADO`
- `CANTIDAD A VENDER *`
- `CANTIDAD A DESCARTAR *`
- `MOTIVO DEL RETIRO *`
- `ACCIÓN SUGERIDA`
- `MEDICAMENTO`
- `Cantidad en estante`
- `Número de lote`
- `Estado de venta:`
- `Pendiente de salida`
- `Venta bloqueada (Vencido)`
- `Orden FEFO`
- `Stock total (N lotes)`
- `Movimientos recientes`
- `Orden cronológico`
- `Venta en mostrador`
- `Baja / Merma`
- `Ingreso / Reposición`

### 15.3 Botones

| Acción | Copy |
|---|---|
| Ver alertas | `Ver alertas` + icono `ArrowRight` |
| Consultar stock | `Consultar stock general` + `ArrowRight` |
| Vender | `Vender` + `Check` |
| Descartar | `Descartar` + `X` |
| Confirmar venta | `Confirmar venta (N comprimidos)` |
| Confirmar descarte | `Confirmar descarte (N comprimidos)` |
| Confirmar popup venta | `Sí, registrar venta` |
| Volver atrás | `Volver a editar cantidad` |
| Cancelar sheet | `Cancelar y mantener en lista` |
| Cancelar descarte | `Cancelar y conservar en lista` |
| Éxito | `Continuar atendiendo` |
| Deshacer | `Deshacer (5 s)` |
| Filtros | `Aplicar filtros` / `Restablecer` / `Cancelar` |
| Sin conexión | `Reintentar` / `Cancelar` |
| Vacío | `Limpiar búsqueda y filtros` |

### 15.4 Mensajes

| Contexto | Copy exacto |
|---|---|
| Dashboard título | `Hola, esto necesita tu atención hoy` |
| Dashboard subtítulo | `Revisa los medicamentos antes de atender al siguiente cliente.` |
| Vencidos | `Retirar del estante hoy` |
| Próximos | `Ofrecer primero al cliente (FEFO)` |
| Registrados | `En control continuo` |
| Stock al día | `¡Stock al día!` |
| Stock al día detalle | `No hay medicamentos vencidos ni próximos a vencer en los estantes.` |
| Por Vencer subtítulo | `Revisa y marca según lo que vendas o retires` |
| Pestaña vacía | `Sin medicamentos en este rango` |
| Pestaña vacía detalle | `No se encontraron lotes críticos para la ventana de días seleccionada.` |
| Detalle subtítulo | `Ficha de decisión rápida` |
| Detalle vencido banner | `LOTE VENCIDO: Venta bloqueada por seguridad.` / `Debe ser retirado y descartado del estante.` |
| Detalle sin stock banner | `STOCK AGOTADO: 0 unidades en estante.` |
| Detalle acción normal | `Vender primero este lote (FEFO) o retirar del estante antes del vencimiento.` |
| Detalle acción vencido | `Venta bloqueada (Vencido)` / `Retirar del estante y descartar el lote.` |
| Popup descartar | `¿Descartar unidades de estante?` / `Se registrará en el Historial` |
| Popup venta | `¿Confirmar venta?` / `Se actualizará el stock de mostrador en tiempo real` |
| Venta exitosa | `¡Venta registrada!` / `La salida ha sido descontada del inventario del mostrador.` |
| Descarte exitoso | `¡Descarte registrado!` / `La salida ha sido descontada del inventario del mostrador.` |
| Sin conexión | `Sin conexión al servidor` / `No se pudo guardar la operación. El stock no cambió. Revisa la conexión y vuelve a intentarlo.` |
| Cantidad inválida | `Cantidad no válida.` / `Ingresa un número entre 1 y N unidades disponibles en el estante.` |
| Sin motivo | `Debes seleccionar un motivo obligatorio para la baja.` |
| Sin resultados | `Sin resultados para “{query}”` / `Ningún lote coincide con la búsqueda y los filtros activos. Toca × en un filtro o en el buscador para ampliar la búsqueda.` |
| Historial vacío | `No hay movimientos registrados` / `No se encontraron ventas ni descartes de estante en el período seleccionado.` |
| Configuración | `Avisos automático` / `Control de avisos` / `Alivia v1.2 · Cochabamba, Bolivia.` |
| Toggle guardado | `Preferencias de avisos actualizadas automáticamente` |

### 15.5 Correcciones obligatorias respecto de Figma

| Figma | Canónico |
|---|---|
| `ATÉNCION INMEDIATA` | `ATENCIÓN INMEDIATA` |
| `Hisotial` | `Historial` |
| Filtro Stock con header `Historial` | `Stock` |
| `Fecha límite: 29 de Mayo, 2025` | fecha relativa (`Vence en 15 días` + `Vence el 10 de diciembre`) |
| `Ajustar al mínimo disponible (200 unidades)` | `Usar 1 unidad` (para cantidad 0) |
| `Ajustar al máximo disponible (200 unidades)` | se mantiene solo para cantidad > stock |
| `CANTIDAD A Descartar` | `CANTIDAD A DESCARTAR *` |
| `¿Descartar unidades de estante?` | se mantiene |
| `Descartar` como título de sheet en frame de venta | `Registrar venta` |
| `Ver historial completo de productos` | `Ver historial completo de productos retirados` |
| `Asistente` / `cliente` | no existen en la app |

### 15.6 Prohibido

- Lorem ipsum, «Texto de ejemplo», «Producto 1».
- «Algo salió mal», «Error inesperado», «Oops».
- Emojis en la UI final.
- Signos `!!`, mayúsculas sostenidas fuera de las etiquetas definidas.
- Fechas de 2025 hardcodeadas.
- Mezclar «medicamento» y «producto» en la misma pantalla.

---

## 16. Propiedad de archivos

Un archivo, un dueño. Si necesitás algo de otro, lo pedís; no lo editás.

| Archivo | Dueño |
|---|---|
| `src/app/(tabs)/index.tsx` | Integrante 1 |
| `src/app/configuracion.tsx` | Integrante 1 |
| `src/components/SinConexionDialog.tsx` | Integrante 1 |
| `src/lib/preferences.ts` | Integrante 1 |
| `src/app/por-vencer.tsx` | Integrante 2 |
| `src/app/venta-exitosa.tsx` | Integrante 2 |
| `src/app/detalle/[id].tsx` | Integrante 3 |
| `src/app/venta/[id].tsx` | Integrante 4 |
| `src/app/descartar/[id].tsx` | Integrante 4 |
| `src/app/(tabs)/stock.tsx` | Integrante 5 |
| `src/components/FiltroStockSheet.tsx` | Integrante 5 |
| `src/app/historial.tsx` | Integrante 6 |
| `src/components/FiltroHistorialSheet.tsx` | Integrante 6 |
| `src/app/descarte-exitoso.tsx` | Integrante 6 |
| `src/app/_layout.tsx`, `(tabs)/_layout.tsx` | Lead |
| `src/components/ui/*` | Lead |
| `src/constants/theme.ts` | Lead |
| `src/lib/demo-data.ts`, `format.ts`, `repository.ts`, `sqlite*`, `supabase.ts` | Lead |
| `src/types/*` | Lead |
| `app.json`, `package*.json`, `tsconfig.json`, `eslint.config.js` | Lead |
| `design/figma/*` | Solo lectura |

---

## 17. Definition of Done (global)

Una entrega se acepta solo si cumple **todo**:

```bash
npx tsc --noEmit          # 0 errores
npx eslint src            # 0 warnings, 0 errores
git diff --name-only      # solo archivos de tu bloque
```

Además:

- [ ] La pantalla coincide con el spec y el PNG (o con las desviaciones declaradas).
- [ ] Funciona en el Galaxy A56 físico, portrait, gestos.
- [ ] No hay scroll horizontal ni contenido cortado.
- [ ] No hay texto tapado por la barra de gestos ni por el teclado.
- [ ] Todos los estados de la matriz están implementados.
- [ ] Todos los targets son ≥ 48×48.
- [ ] Todos los textos salen del diccionario canónico.
- [ ] No hay `any`, `@ts-ignore`, `eslint-disable`, `console.log`, `TODO`.
- [ ] No se tocó ningún archivo del lead ni de otro integrante.
- [ ] No se tocó `package.json` ni `package-lock.json`.
- [ ] Se adjunta captura antes/después y comparación con Figma.

---

## 18. Anti-patrones y errores conocidos

| Anti-patrón | Por qué está prohibido |
|---|---|
| `style={{ color: '#1B5E7B' }}` | Rompe la fuente única de tokens. |
| `fontSize: 24` “porque Figma lo tiene” | El canónico es `h1` 22. |
| Copiar `Inter` de Figma | La app usa Plus Jakarta Sans. |
| `width: 353` fijo | En 384 dp se desborda. Usar `100%` + gutter. |
| `position: 'absolute'` para layout | Se rompe con fuente grande y safe areas. |
| `Alert.alert` | No es el patrón visual de la app. |
| Modal sin scrim | Rompe figura/fondo y accesibilidad. |
| Botón de 44 sin `hitSlop` | No cumple Fitts ni WCAG. |
| Estado solo por color | Daltonismo; siempre texto + icono. |
| Fechas `2025` | Quedan vencidas y rompen la demo. |
| Contadores hardcodeados | Inconsistentes entre pantallas. |
| Duplicar un `Card` o `Button` | Frankenstein visual. |
| Editar `theme.ts` para “probar” | Rompe a los otros 5. |
| `npm install` para un icono | Rompe el candado de versionado. |
| Commit propio | El lead pierde el control de la integración. |
| “Ya se ve bien en web” | La demo es en el A56. |

Errores de Figma que **no** se copian:

- `ATÉNCION` → `ATENCIÓN`.
- `Hisotial` → `Historial`.
- Filtro Stock con header `Historial` → `Stock`.
- Fechas 2025 → relativas.
- Conteos 3/4/12 inconsistentes → calculados.
- `519:3715` no es una pantalla: es el estado de error del sheet Descartar.
- Títulos 24/26 → 22.
- Pesos 800 → 700.
- `Inter`/`FreeSans`/`Liberation Sans`/`Nimbus Sans` → Plus Jakarta Sans.
- Iconos vectoriales a mano → Lucide.

---

## 19. Anexo A — Inventario del repo

```
src/
  app/
    _layout.tsx              Stack + fuentes + SQLite + QueryClient
    (tabs)/
      _layout.tsx            2 tabs
      index.tsx              Dashboard
      stock.tsx              Stock
    por-vencer.tsx
    historial.tsx
    configuracion.tsx
    detalle/[id].tsx
    venta/[id].tsx
    descartar/[id].tsx
    venta-exitosa.tsx
    descarte-exitoso.tsx
  components/ui/
    Screen.tsx  AppHeader.tsx  ScreenHeader.tsx  Card.tsx  Badge.tsx  Button.tsx
    Chip.tsx  Sheet.tsx  ConfirmDialog.tsx  SuccessDialog.tsx
    UndoSnackbar.tsx  EmptyState.tsx  index.ts
  components/SinConexionDialog.tsx      (Int 1)
  components/FiltroStockSheet.tsx       (Int 5)
  components/FiltroHistorialSheet.tsx   (Int 6)
  constants/theme.ts
  hooks/use-color-scheme.ts  use-undo-snackbar.ts
  lib/sqlite.ts  sqlite.web.ts  supabase.ts
  lib/format.ts  demo-data.ts  repository.ts  preferences.ts
  types/database.ts
design/figma/                 congelado de Figma (solo lectura)
design/fase0/                 base compartida lista para copiar (solo lead)
```

Rutas ya registradas: no hace falta tocar `_layout.tsx`.

---

## 20. Anexo B — Checklist de fidelidad por pantalla

Copiar esta tabla en la entrega de cada integrante:

| Punto | ✔ |
|---|---|
| Frame ID correcto y spec leído | |
| Orden de bloques idéntico | |
| Copy exacto (sin typos de Figma) | |
| Colores solo desde `theme.ts` | |
| Tipografía solo desde `Typography.scale` | |
| Radios solo desde `Radius` | |
| Espaciados solo desde `Spacing` | |
| Iconos Lucide del mapeo | |
| Ancho útil 352 dp, sin desborde | |
| Safe areas respetadas | |
| Targets ≥ 48×48 | |
| Estados default/loading/empty/error/success | |
| Teclado no tapa el CTA | |
| Lector de pantalla anuncia lo importante | |
| Captura en A56 + comparación con Figma | |
| `tsc` y `eslint` limpios | |
| Sin archivos ajenos modificados | |

---

## 21. Anexo C — Fuentes del dispositivo

- Samsung Galaxy A56 5G: 6.7" Super AMOLED, 1080 × 2340 px, 385 ppi, 19.5:9.
- Densidad reportada por Samsung A-series: ~450 dpi (factor 2.8125) → 384 dp de ancho.
- Viewport de referencia: 384 × 832 dp.
- Safe area superior: 24–32 dp; inferior por gestos: ~24 dp.
- Fuente: especificaciones oficiales de Samsung + reportes de DeviceAtlas para la serie A.

---

## 22. Anexo D — Plantilla para pegarle al agente

```text
Sos un ingeniero frontend senior en Expo SDK 58 + React Native 0.88 + expo-router.
Trabajás en el repo /home/profeta/Proyectos/alivia-mobile.

Leé y obedecé PROMPT_AGENTES.md completo. Después implementá SOLO el bloque
del Integrante N (Sección 23.N), y solo los archivos listados ahí.

Reglas que no podés romper:
- No ejecutes npm/npx install, no toques package.json ni package-lock.json.
- No toques theme.ts, components/ui, lib/sqlite*, types, app.json, _layout.tsx.
- No uses Git.
- No inventes datos, colores, tamaños ni copy: usá design/figma/specs/<id>.md y demo-data.ts.
- No dupliques componentes: importá desde @/components/ui.
- Entregá con `npx tsc --noEmit` y `npx eslint src` limpios.

Antes de escribir código:
1. Listá los archivos que vas a tocar.
2. Citá el frame ID y el spec que vas a implementar.
3. Señalá cualquier bloqueo o dato faltante.

Al terminar, entregá:
- resumen de cambios por archivo;
- estados implementados;
- desviaciones de Figma (o "ninguna");
- resultado de tsc/eslint;
- checklist de fidelidad completo.
```

---

## 23. Bloques por integrante

Cada bloque es autosuficiente: si el integrante copia solo su sección, su agente igual recibe
las reglas críticas, el frame, el copy, los estados y los criterios de aceptación.

> Recordatorio para los 6: **no** tocar `theme.ts`, `components/ui/*` (salvo importar),
> `lib/sqlite*`, `types/*`, `app.json`, `_layout.tsx`, `package*.json`. **No** usar Git.
> **No** inventar datos ni copy. **No** duplicar componentes.

---

### 23.1 Integrante 1 — Dashboard, Configuración y Sin conexión

#### Misión

Que Doña Elena entienda en 3 segundos qué necesita atención hoy, ajuste sus avisos y reciba un
mensaje claro cuando una operación no se pudo guardar.

#### Archivos que posee

| Archivo | Acción |
|---|---|
| `src/app/(tabs)/index.tsx` | Reescribir completo |
| `src/app/configuracion.tsx` | Reescribir completo |
| `src/components/SinConexionDialog.tsx` | Crear |
| `src/lib/preferences.ts` | Crear |

No tocar ningún otro.

#### Referencias Figma

| Pantalla | Frame ID | Spec | PNG |
|---|---|---|---|
| Dashboard | `519:4861` | `design/figma/specs/519-4861.md` | `design/figma/png/519-4861-dashboard.png` |
| Dashboard sin alertas | `519:5091` | `design/figma/specs/519-5091.md` | `design/figma/png/519-5091-dashboard-sin-alertas.png` |
| Configuración | `519:4932` | `design/figma/specs/519-4932.md` | `design/figma/png/519-4932-configuracion.png` |
| Sin conexión | `519:5018` | `design/figma/specs/519-5018.md` | `design/figma/png/519-5018-sin-conexion.png` |

#### 23.1.1 Dashboard — estructura

```tsx
<Screen header={<AppHeader />}>
  {/* 1. Banner mostrador */}
  {/* 2. KPI Vencidos */}
  {/* 3. KPI Próximos a vencer */}
  {/* 4. KPI Medicamentos registrados */}
  {/* 5. CTA Ver alertas */}
  {/* 6. Link Historial */}
</Screen>
```

Medidas y tokens:

| Bloque | Medida Figma | Implementación |
|---|---|---|
| Banner | 353×143, r13, blanco | `Card` `minHeight: 143`, `padding: Spacing.lg`, `gap: Spacing.sm` |
| Tag banner | 11 bold, primary, tracking 0.5 | `Typography.scale.label` + `fontFamilyBold` + `letterSpacing: 0.5` |
| Título banner | 22 bold, `#171717` | `Typography.scale.h1` + `fontFamilyBold` + `Colors.text` |
| Subtítulo banner | 12 regular, muted | `Typography.scale.metadata` + `fontFamilyRegular` + `Colors.textMuted` |
| KPI card | 353×102, r13, blanco | `Card` `minHeight: 102`, `padding: Spacing.md`, `row`, `gap: Spacing.md` |
| Icono KPI | 18×18 | `CircleAlert` 18 con color del tono |
| Caja cifra | 45×45, r13, fondo del tono | `View` 45×45 `borderRadius: Radius.lg`, `center` |
| Cifra | 28 bold | `Typography.scale.display` + `fontFamilyBold` |
| Label KPI | 18 bold | `fontSize: Typography.scale.brand` + `fontFamilyBold` |
| Desc KPI | 12 regular | `Typography.scale.metadata` + `fontFamilyRegular` |
| CTA alertas | 352×61, r15, primary | `Button` `fullWidth`, `style={{ minHeight: 61 }}`, label 20 bold |
| Link historial | 354×36, r15, `primaryContainer` | `Pressable` con `backgroundColor: Colors.primaryContainer` |

Contenido:

1. Tag: `MOSTRADOR ACTIVO`.
2. Título: `Hola, esto necesita tu atención hoy`.
3. Subtítulo: `Revisa los medicamentos antes de atender al siguiente cliente.`
4. KPI vencidos: tono `critical`, cifra `metrics.expired`, label `Vencidos`, desc `Retirar del estante hoy`.
5. KPI próximos: tono `attention`, cifra `metrics.near`, label `Próximos a vencer`, desc `Ofrecer primero al cliente (FEFO)`.
6. KPI registrados: tono `neutral`, cifra `APP.totalProducts`, label `Medicamentos registrados`, desc `En control continuo`.
7. CTA: `Ver alertas` + `ArrowRight` 18.
8. Link: `Ver historial completo de productos retirados` + `History` 16.

Interacciones:

| Elemento | Acción |
|---|---|
| KPI Vencidos | `router.push('/por-vencer?tab=15')` |
| KPI Próximos | `router.push('/por-vencer?tab=30')` |
| KPI Registrados | `router.push('/stock')` |
| CTA | `router.push('/por-vencer')` |
| Link | `router.push('/historial')` |
| Ajustes (header) | `router.push('/configuracion')` |

`por-vencer` debe leer `tab` con `useLocalSearchParams` (lo implementa Int 2). Si no viene, `15`.

Estado vacío (`519:5091`), cuando `metrics.expired === 0 && metrics.near === 0`:

- Reemplaza banner + 3 KPIs + CTA por `EmptyState`:
  - icono `CheckCircle2` 32 verde,
  - título `¡Stock al día!`,
  - descripción `No hay medicamentos vencidos ni próximos a vencer en los estantes.`,
  - acción primaria `Consultar stock general` + `ArrowRight` → `/stock`,
  - nota debajo: `Ver los 148 medicamentos en control regular`.
- Mantener el link de historial.

Estados obligatorios:

- **Loading:** 3 `Skeleton` simples (bloques `Colors.field`, r12) mientras `useLots()` hidrata. No spinner de pantalla completa.
- **Error de datos:** banner discreto con `WifiOff` y `Reintentar`.
- **Pressed:** `activeOpacity 0.85` en KPIs, CTA y link.

Accesibilidad:

- Cada KPI: `accessibilityRole="button"` y label `"{label}: {cifra}. {descripción}"`.
- CTA: label `Ver alertas, 12 productos próximos a vencer`.
- El link de historial: `accessibilityRole="link"`.

#### 23.1.2 Configuración — estructura

```tsx
<Screen header={<AppHeader back />}>
  {/* Título Configuración */}
  {/* Card: Control de avisos + descripción */}
  {/* 3 filas con Switch: 60 / 30 / 15 días */}
  {/* Footer versión + términos */}
</Screen>
```

Medidas:

| Bloque | Medida Figma | Implementación |
|---|---|---|
| Título | 20 regular | `Typography.scale.h1` + `fontFamilyBold` (canónico) |
| Sección | 12 regular muted | `Typography.scale.metadata` + `fontFamilyMedium` |
| Card control | 330×90, r16 | `Card` `borderRadius: Radius.xl`, `padding: Spacing.lg` |
| Fila aviso | 330×75, r16 | `Card` `minHeight: 75`, `row`, `justifyContent: 'space-between'` |
| Título fila | 14 semibold | `Typography.scale.button` + `fontFamilySemiBold` |
| Desc fila | 11/12 regular | `Typography.scale.label` + `fontFamilyRegular` + `textSecondary` |
| Switch | 48×32 aprox. | `Switch` `trackColor`, `thumbColor`, `ios_backgroundColor` |

Contenido:

1. Título: `Configuración`.
2. Sección: `Avisos automático` (así en Figma; corregir a `Avisos automáticos`).
3. Card:
   - Título: `Control de avisos`.
   - Descripción: `Elige con cuánto tiempo de anticipación quieres que Alivia te avise al celular para que no pierdas ningún producto.`
4. Filas:
   - `Notificar 60 días antes (Regular)` / `Aviso temprano para coordinar cambios o devoluciones con el distribuidor.`
   - `Notificar 30 días antes (Atención)` / `Prioriza este producto al frente del mostrador para venta oportuna.`
   - `Notificar 15 días antes (Crítico)` / `Alerta prioritaria para retirar del estante los productos próximos a vencer.`
5. Footer: `Alivia v1.2 · Cochabamba, Bolivia.` y `Términos y condiciones`.

Interacciones:

- Cambiar un `Switch` → guarda en `preferences.ts` (`setPreference('notify60', value)`) → muestra toast `Preferencias de avisos actualizadas automáticamente` durante 3 s. No usar `Alert`.
- `Términos y condiciones` → abre un `Modal` simple (RN `Modal`, `transparent`, `animationType="fade"`) con título `Términos y condiciones`, 2 párrafos cortos y botón `Entendido`. No es una ruta nueva.
- Los 3 avisos arrancan en `true`.

Persistencia (`src/lib/preferences.ts`):

```ts
import { getLocalDatabase } from '@/lib/sqlite';

export async function getPreference(key: string, fallback: boolean): Promise<boolean>;
export async function setPreference(key: string, value: boolean): Promise<void>;
```

Crea su propia tabla con `CREATE TABLE IF NOT EXISTS preferences (key TEXT PRIMARY KEY, value TEXT NOT NULL)`.
No modifica `src/lib/sqlite.ts`. En web, el shim existente resuelve.

Accesibilidad:

- Cada `Switch`: `accessibilityLabel` con el texto de la fila, `accessibilityRole="switch"`, `accessibilityState={{ checked }}`.
- La fila completa es tocable y togglea (target ≥ 48).
- El toast se anuncia con `AccessibilityInfo.announceForAccessibility`.

#### 23.1.3 `SinConexionDialog`

API:

```tsx
type Props = {
  visible: boolean;
  onRetry: () => void;
  onCancel: () => void;
  message?: string;   // default canónico
};
```

Visual:

- `Modal` transparente + scrim `Colors.scrim`.
- Tarjeta 326×353 (máx. `340`), `Colors.surface`, `Radius.xl`, `padding: Spacing.xxl`, centrada.
- Icono `WifiOff` 40 en círculo 72 `Colors.critical.bg`.
- Título 20 bold: `Sin conexión al servidor`.
- Cuerpo 14 regular: `No se pudo guardar la operación. El stock no cambió. Revisa la conexión y vuelve a intentarlo.`
- `Button` primario `Reintentar`; `Button` secundario `Cancelar`.
- `accessibilityViewIsModal`, foco inicial en el título.

Se usa desde Venta y Descarte (Int 4). No bloquea la app completa: solo la operación.

#### 23.1.4 Criterios de aceptación

- [ ] Dashboard reproduce el orden y las medidas del spec.
- [ ] Los 3 contadores salen de `useMetrics()`; ninguno está hardcodeado.
- [ ] El estado sin alertas aparece con 0 vencidos y 0 próximos.
- [ ] Los KPIs navegan con el tab correcto.
- [ ] Configuración persiste los 3 switches y muestra el toast.
- [ ] `SinConexionDialog` se abre, reintenta y cancela.
- [ ] Nada queda tapado por la tab bar ni por los gestos.
- [ ] `tsc` y `eslint` limpios.

#### 23.1.5 Prohibiciones locales

- No usar `ScrollView` con `paddingTop` manual.
- No reemplazar `AppHeader` por un `View` propio.
- No guardar preferencias en memoria solamente.
- No mostrar `Alert.alert` para términos ni para el toast.
- No tocar `por-vencer.tsx` para “arreglar” el tab; se lo pide a Int 2.

#### 23.1.6 Handoff

Entregar: captura del Dashboard normal y vacío, captura de Configuración, captura del modal,
lista de archivos tocados, resultado de `tsc`/`eslint`, desviaciones.

---

### 23.2 Integrante 2 — Por Vencer y Venta exitosa

#### Misión

Que Doña Elena vea los lotes por vencer en bandas de 15/30/60 días, venda o descarte en un toque,
y reciba una confirmación inequívoca con la posibilidad de deshacer.

#### Archivos que posee

| Archivo | Acción |
|---|---|
| `src/app/por-vencer.tsx` | Reescribir completo |
| `src/app/venta-exitosa.tsx` | Reescribir completo |

#### Referencias Figma

| Pantalla | Frame ID | Spec | PNG |
|---|---|---|---|
| Por Vencer 15 días | `519:5706` | `design/figma/specs/519-5706.md` | `design/figma/png/519-5706-por-vencer.png` |
| Por Vencer 30 días | `519:6029` | `design/figma/specs/519-6029.md` | `design/figma/png/519-6029-por-vencer-30.png` |
| Por Vencer vacío | `519:5833` | `design/figma/specs/519-5833.md` | `design/figma/png/519-5833-por-vencer-vacio.png` |
| Venta exitosa | `521:32` | `design/figma/specs/521-32.md` | `design/figma/png/521-32-venta-exitosa.png` |

#### 23.2.1 Por Vencer — estructura

```tsx
<Screen header={<AppHeader back />}>
  {/* Título + badge críticos */}
  {/* Subtítulo */}
  {/* Tabs 15 / 30 / 60 */}
  {/* UndoSnackbar (si aplica) */}
  {/* Lista de tarjetas */}
  {/* EmptyState (si la banda está vacía) */}
  {/* Link historial */}
</Screen>
```

Medidas:

| Bloque | Medida Figma | Implementación |
|---|---|---|
| Título | 24 bold (Figma) | `Typography.scale.h1` 22 + `fontFamilyBold` |
| Badge críticos | 80×26, r15 | `Badge` tono de la banda |
| Subtítulo | 14 regular | `Typography.scale.body` + `fontFamilyRegular` + `textSecondary` |
| Tabs contenedor | 332×41, r13, `#E2E8F0` | `View` `row`, `padding: 4`, `borderRadius: Radius.lg`, `backgroundColor: Colors.border` |
| Tab activa | 103×33, r13, blanca | `Pressable` `minHeight: 33`, `borderRadius: Radius.lg`, fondo `surface` |
| Tab label | 14 | `Typography.scale.button`; activa bold primary, inactiva regular secondary |
| Tarjeta | 335×113, r13 | `Card` `minHeight: 113`, `padding: Spacing.md`, `gap: Spacing.sm` |
| Badge vencimiento | 133×26, r15 | `Badge` con icono `CircleAlert` + `Vence en N días` |
| Nombre | 16 bold | `Typography.scale.h2` + `fontFamilyBold` |
| Lote + presentación | 13 regular muted | `Typography.scale.body` + `fontFamilyRegular` + `textMuted` |
| Cantidad | 14 bold | `Typography.scale.button` + `fontFamilyBold` |
| Botón Vender | 91×33, r15 | `Button` primario compacto (`minHeight: 36`) |
| Botón Descartar | 91×33, r15 | `Button` secundario compacto |
| Link historial | 354×36, r15 | `Pressable` `backgroundColor: primaryContainer` |

Contenido por tarjeta:

```
[badge Vence en N días]
[Nombre del medicamento]
[Lote XX-000 · Presentación]
Cantidad: N unidades
[✓ Vender] [✕ Descartar]
```

Reglas:

- Tocar la tarjeta (fuera de los botones) → `/detalle/{id}`.
- `Vender` → `/venta/{id}`.
- `Descartar` → `/descartar/{id}`.
- El semáforo y el badge usan `toneForDays(days)`:
  - ≤15 → `critical` / texto `Vence en N días`
  - 16–30 → `attention`
  - 31–60 → `regular`
- Si el lote está vencido (`days < 0`), no aparece en Por Vencer.

Tabs:

- `15 días` → `bandForDays(days) === '15'`
- `30 días` → `'30'`
- `60 días` → `'60'`
- El contador del header es `items.length` de la banda activa, con el sufijo correcto:
  - `1 crítico` / `N críticos` (banda 15)
  - `1 en atención` / `N en atención` (banda 30)
  - `1 regular` / `N regulares` (banda 60)
- Estado inicial: `tab` del query param (`15|30|60`) o `'15'`.
- Al cambiar de tab no se pierde el scroll del header.

Cabecera:

- Título `Por Vencer`.
- Badge a la derecha con el conteo.
- Subtítulo `Revisa y marca según lo que vendas o retires`.

Vacío:

- `EmptyState` con `PackageSearch` 32, título `Sin medicamentos en este rango`,
  descripción `No se encontraron lotes críticos para la ventana de días seleccionada.`
- Mantener tabs y link de historial.

Undo:

- Al volver de una venta o descarte con `?undo=1`, mostrar `UndoSnackbar` con
  `Listo, quitado de la lista` y `DESHACER` durante 5 s (`useUndoSnackbar`).
- `DESHACER` llama a `undoLast()` y restaura la tarjeta.
- El snackbar va sobre la tab bar (`bottom: insets.bottom + 68`).

Link historial:

- Texto `Ver historial completo de productos retirados` + icono `History`.
- Fondo `primaryContainer`, texto `primaryContainerText`.
- → `/historial`.

Estados:

- **Loading:** 3 skeletons de tarjeta (`minHeight: 113`, fondo `field`).
- **Empty:** el de la banda.
- **Error de datos:** `EmptyState` con `WifiOff` y `Reintentar`.
- **Pressed:** tarjeta `activeOpacity 0.9`; botones 0.85.

Accesibilidad:

- Tabs: `accessibilityRole="tab"`, `accessibilityState={{ selected }}`, label
  `15 días, 5 productos`.
- Tarjeta: `accessibilityRole="button"`, label
  `Ibuprofeno 400 mg, lote IB-449, vence en 15 días, 200 comprimidos`.
- Botones: labels `Vender Ibuprofeno 400 mg` y `Descartar Ibuprofeno 400 mg`.
- El badge no es foco independiente.

#### 23.2.2 Venta exitosa — estructura

Ruta `venta-exitosa` (`transparentModal`, `fade`). Recibe params:

```ts
{ name, lot, qty, unit, total, remaining }
```

Visual: `SuccessDialog` (Fase 0) con:

| Prop | Valor |
|---|---|
| `title` | `¡Venta registrada!` |
| `message` | `La salida ha sido descontada del inventario del mostrador.` |
| `summary` | `[{label:'CANTIDAD VENDIDA', value:'10 comprimidos'}, {label:'TOTAL COBRADO', value:'Bs. 15.00'}]` |
| `note` | `Stock restante en estante: 190 comprimidos` |
| `primaryLabel` | `Continuar atendiendo` |
| `secondaryLabel` | `Deshacer (5 s)` |
| `onPrimary` | cerrar stack y volver a `/por-vencer` |
| `onSecondary` | `undoLast()` y volver a `/por-vencer` |

Comportamiento:

- El botón secundario desaparece a los 5 s (timer). Pasado ese tiempo, la venta es definitiva.
- `onClose` (scrim) = `onPrimary`.
- Si faltan params, usar `name='Medicamento'`, `qty=0`, `total=0`, `remaining=0`; no mostrar `undefined`.
- Anunciar `Venta registrada` con `AccessibilityInfo`.

Cierre:

```ts
router.dismissAll();
router.replace('/por-vencer');
```

Si el usuario vino de Stock, usar `router.replace('/stock')` cuando `origin=stock` venga por param.
Agregar `origin?: 'vencer' | 'stock'` a los params de éxito.

#### 23.2.3 Criterios de aceptación

- [ ] Las 3 bandas filtran correctamente y los contadores son dinámicos.
- [ ] El tab inicial respeta el query param del Dashboard.
- [ ] Cada tarjeta muestra nombre, lote, presentación, cantidad y vencimiento reales.
- [ ] Vender y Descartar navegan al sheet correcto.
- [ ] El estado vacío conserva tabs y link.
- [ ] El snackbar de undo dura 5 s y restaura el lote.
- [ ] Venta exitosa muestra los 4 datos y permite deshacer 5 s.
- [ ] `tsc` y `eslint` limpios.

#### 23.2.4 Prohibiciones locales

- No hardcodear «4 críticos» ni «3 en atención».
- No usar `ScrollView` anidado con `FlatList`.
- No crear un `Card` propio; usar `Card`.
- No usar emojis `✓`/`✕` en los botones: usar `Check`/`X`.
- No duplicar el `SuccessDialog`: usar el compartido con `summary`/`note`.

#### 23.2.5 Handoff

Capturas de las 3 bandas + vacío + venta exitosa, lista de archivos, `tsc`/`eslint`, desviaciones.

---

### 23.3 Integrante 3 — Detalle del producto y popup de retiro

#### Misión

Que Doña Elena decida en una sola pantalla si vende, descarta o retira un lote, con contexto
suficiente (stock, lote, vencimiento, acción sugerida) y sin riesgo de vender algo vencido.

#### Archivos que posee

| Archivo | Acción |
|---|---|
| `src/app/detalle/[id].tsx` | Reescribir completo |

#### Referencias Figma

| Pantalla | Frame ID | Spec | PNG |
|---|---|---|---|
| Detalle normal | `519:3884` | `design/figma/specs/519-3884.md` | `design/figma/png/519-3884-detalle.png` |
| Detalle vencido | `519:3977` | `design/figma/specs/519-3977.md` | `design/figma/png/519-3977-detalle-vencido.png` |
| Detalle sin stock | `519:4075` | `design/figma/specs/519-4075.md` | `design/figma/png/519-4075-detalle-sin-stock.png` |
| Popup retirar | `519:4175` | `design/figma/specs/519-4175.md` | `design/figma/png/519-4175-popup-descartar.png` |

#### 23.3.1 Estructura

```tsx
<Screen header={<AppHeader back />}>
  {/* Banner de estado (normal / vencido / sin stock) */}
  {/* Título + badge Prioridad 1 + subtítulo */}
  {/* Card MEDICAMENTO */}
  {/* Card ACCIÓN SUGERIDA */}
  {/* Fila Estado de venta */}
  {/* CTA primario + secundario */}
  {/* ConfirmDialog (solo vencido) */}
</Screen>
```

Medidas:

| Bloque | Medida Figma | Implementación |
|---|---|---|
| Título | 20 bold | `Typography.scale.h1` + `fontFamilyBold` |
| Badge prioridad | 74×26, r15 | `Badge` tono del estado |
| Subtítulo | 12 regular | `Typography.scale.metadata` + `textSecondary` |
| Banner normal | 350×88 | `Card` con borde izquierdo 4 del tono, `padding: Spacing.lg` |
| Banner vencido | 350×54 | idem, tono `critical` |
| Banner sin stock | 350×42 | idem, tono `attention` |
| Card medicamento | 350×278, r16 | `Card` `borderRadius: Radius.xl`, `padding: Spacing.lg` |
| Nombre | 22 bold | `Typography.scale.h1` + `fontFamilyBold` |
| Descripción | 12 regular muted | `Typography.scale.metadata` + `textMuted` |
| Stat box | 155×58, r12, `canvas` | `View` `flex:1`, `backgroundColor: Colors.canvas`, `borderRadius: Radius.lg` |
| Stat label | 11 | `Typography.scale.label` + `textSecondary` |
| Stat valor | 16 bold | `Typography.scale.h2` + `fontFamilyBold` |
| Card acción | 318×84 | `Card` con borde izquierdo 4 `primary`/`critical` |
| Label acción | 11 bold | `Typography.scale.label` + `fontFamilyBold` |
| Texto acción | 12 regular | `Typography.scale.metadata` |
| Fila estado | 350×48, r12 | `View` `row`, `backgroundColor: surface`, `paddingHorizontal: Spacing.md` |
| CTA | 48–56 alto | `Button` primario; secundario `Button` outline |

Contenido normal:

1. Banner: `ALERTA CRÍTICA` / `Vence en 15 días` / `Vence el 10 de diciembre` (fecha calculada).
2. Título: `Detalle del producto`; badge `Prioridad 1`; subtítulo `Ficha de decisión rápida`.
3. Card:
   - `MEDICAMENTO`
   - `Ibuprofeno 400 mg`
   - `Antiinflamatorio y analgésico oral`
   - stat 1: `Cantidad en estante` / `200 comprimidos`
   - stat 2: `Número de lote` / `#IB-449`
4. Acción: `ACCIÓN SUGERIDA` / `Vender primero este lote (FEFO) o retirar del estante antes del vencimiento.`
5. Estado: `Estado de venta:` / badge `Pendiente de salida`.
6. CTA: `Vender (FEFO)` → `/venta/{id}`; `Descartar` → `/descartar/{id}`.

Contenido vencido (`days < 0`):

1. Banner rojo: `LOTE VENCIDO: Venta bloqueada por seguridad.` / `Debe ser retirado y descartado del estante.`
2. Badge: `Prioridad 1` tono `critical`.
3. Card con los mismos datos; stock real.
4. Acción: `Venta bloqueada (Vencido)` en `critical.text` + `Retirar del estante y descartar el lote.`
5. Estado: `Estado de venta:` / `Pendiente de salida`.
6. CTA primario `Retirar del estante` (tono `critical`, sin `Button variant` destructivo: usar `Button` con `style={{ backgroundColor: Colors.critical.text }}`) → abre `ConfirmDialog`.
7. Secundario `Cancelar` → `router.back()`.

Contenido sin stock (`stock === 0`):

1. Banner: `STOCK AGOTADO: 0 unidades en estante.`
2. Badge `Prioridad 2` tono `attention`.
3. Card con `0 unidades`.
4. Acción: `Vender primero este lote (FEFO) o retirar del estante antes del vencimiento.`
5. CTA `Sin stock` deshabilitado + `Volver al listado` secundario.

Popup de retiro (`519:4175`):

- `ConfirmDialog` montado sobre la pantalla, no ruta nueva.
- `title`: `¿Descartar unidades de estante?`
- `subtitle`: `Se registrará en el Historial`
- `rows`:
  - `{ label: 'Medicamento', value: name }`
  - `{ label: 'Lote', value: lot }`
  - `{ label: 'Cantidad a descartar', value: formatQty(stock, unit) }`
  - `{ label: 'Motivo', value: 'Vencido' }`
  - `{ label: 'Quedarán disponibles', value: '0 unidades' }`
- `primaryLabel`: `Confirmar descarte`
- `secondaryLabel`: `Cancelar y conservar en lista`
- `onPrimary`: `discardBatch(id, stock, 'EXPIRED')` → navegar a `/descarte-exitoso` con params
  (`qty`, `unit`, `total = price * stock`, `remaining = 0`, `reason = 'Vencido'`, `origin = 'detalle'`).
- `onSecondary`/`onClose`: cerrar el diálogo y quedarse en Detalle.

Reglas:

- Si `useLot(id)` no existe → `EmptyState` «Lote no encontrado» + `Volver al listado`.
- El detalle no ofrece vender si `days < 0` o `stock === 0`.
- Los CTA se deshabilitan durante la mutación (`loading`).
- Si la mutación falla → `SinConexionDialog` (Int 1) con `Reintentar`/`Cancelar`.

Accesibilidad:

- Banner con `accessibilityLiveRegion="polite"`.
- Badge de estado con texto completo; no solo color.
- `ConfirmDialog` con `accessibilityViewIsModal`.
- CTA destructivo con label `Retirar del estante, descartar 200 comprimidos`.

#### 23.3.2 Criterios de aceptación

- [ ] Las 3 variantes se renderizan con el copy y los tonos correctos.
- [ ] Vender/Descartar navegan al sheet correcto.
- [ ] Vencido y sin stock bloquean la venta.
- [ ] El popup muestra qty/motivo/restante reales y confirma el descarte.
- [ ] El descarte navega a `descarte-exitoso` con los params completos.
- [ ] `tsc` y `eslint` limpios.

#### 23.3.3 Prohibiciones locales

- No crear un `ConfirmDialog` nuevo.
- No usar `Alert.alert` para confirmar.
- No mostrar «Vence en 15 días» si el lote está vencido.
- No permitir vender con stock 0.
- No tocar `venta/[id].tsx` ni `descartar/[id].tsx`.

#### 23.3.4 Handoff

Capturas de las 3 variantes + popup, lista de archivos, `tsc`/`eslint`, desviaciones.

---

### 23.4 Integrante 4 — Registrar venta, Descartar y confirmaciones

#### Misión

Que Doña Elena registre una salida de stock sin errores: cantidad válida, motivo obligatorio,
confirmación clara y actualización inmediata del inventario local.

#### Archivos que posee

| Archivo | Acción |
|---|---|
| `src/app/venta/[id].tsx` | Reescribir completo |
| `src/app/descartar/[id].tsx` | Reescribir completo |

#### Referencias Figma

| Pantalla | Frame ID | Spec | PNG |
|---|---|---|---|
| Registrar venta | `519:3251` | `design/figma/specs/519-3251.md` | `design/figma/png/519-3251-registrar-venta.png` |
| Cantidad excedida | `519:3397` | `design/figma/specs/519-3397.md` | `design/figma/png/519-3397-venta-cantidad-excedida.png` |
| Cantidad cero | `519:3556` | `design/figma/specs/519-3556.md` | `design/figma/png/519-3556-venta-cantidad-cero.png` |
| Confirmar venta | `519:5930` | `design/figma/specs/519-5930.md` | `design/figma/png/519-5930-confirmar-venta.png` |
| Descartar | `519:4718` | `design/figma/specs/519-4718.md` | `design/figma/png/519-4718-descartar.png` |
| Descartar · cantidad inválida (referencia) | `519:3715` | `design/figma/specs/519-3715.md` | `design/figma/png/519-3715-venta-variante-rota.png` |

> `519:3715` **no** es una pantalla aparte: es el estado «cantidad inválida» del sheet
> Descartar (título «Descartar», chips de motivo, CTA «Confirmar descarte»). Se usa como
> referencia visual del estado de error. Sus bugs de copy se corrigen: `CANTIDAD A Descartar`
> → `CANTIDAD A DESCARTAR *` y `Ajustar al maximo disponible` con cantidad 0 → `Usar 1 unidad`.

#### 23.4.1 Estructura base de ambos sheets

```tsx
<View style={{ flex: 1 }}>
  <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: Colors.scrim }]} onPress={router.back} />
  <KeyboardAvoidingView
    behavior={Platform.OS === 'android' ? 'padding' : undefined}
    style={{ flex: 1, justifyContent: 'flex-end' }}
  >
    <Sheet title="..." footer={...}>
      {/* contenido */}
    </Sheet>
  </KeyboardAvoidingView>
</View>
```

Reglas del sheet:

- Ancho completo; esquinas superiores `Radius.sheet` (20).
- `paddingBottom: insets.bottom + Spacing.xxl` (ya lo hace `Sheet`).
- El scrim cubre toda la pantalla y cierra al tocar.
- El sheet **no** scrollea con el teclado; el CTA queda visible.
- `presentation: 'transparentModal'` ya está configurado en `_layout.tsx`.
- Prohibido usar `Modal` de RN aquí: la ruta ya es modal.

#### 23.4.2 Registrar venta

Contenido:

```
Nombre · badge vencimiento · Bs. X c/u
Registrar venta
Disponible: N unidades
[CANTIDAD A VENDER *]
[ 10 ]  Comprimidos
Quedarán: 190 en estante · Bs. 15.00 total
Vender todo el lote restante (200 unidades)
[Confirmar venta (10 comprimidos)]
Cancelar y mantener en lista
```

Medidas:

| Bloque | Medida Figma | Implementación |
|---|---|---|
| Nombre | 16 bold | `Typography.scale.h2` + `fontFamilyBold` |
| Precio unitario | 12 bold | `Typography.scale.metadata` + `fontFamilyBold` |
| Título sheet | 20 bold | `Typography.scale.modalTitle` + `fontFamilyBold` |
| Disponible | 12 regular | `Typography.scale.metadata` + `textSecondary` |
| Label cantidad | 11 bold | `Typography.scale.label` + `fontFamilyBold` + letterSpacing 0.4 |
| Input | 36 bold, alto 64 | `TextInput` `fontSize: Typography.scale.hero`, `textAlign: 'center'` |
| Unidad | 12 | `Typography.scale.metadata` + `textSecondary` |
| Resumen | 12 | `Typography.scale.metadata` |
| Link lote | 12 bold primary | `Pressable` texto |
| CTA | 48, r12 | `Button` primario |
| Cancelar | 13 | `Button` ghost |

Estado del formulario:

```ts
const [raw, setRaw] = useState('10');
const qty = Number(raw);
const max = lot?.stock ?? 0;
const invalid = !Number.isInteger(qty) || qty < 1 || qty > max;
const zero = qty === 0;
```

Reglas:

- `onChangeText`: quedarse solo con dígitos (`raw.replace(/\D/g, '').slice(0, 6)`).
- Si el campo queda vacío, mostrar `0` y estado inválido.
- `maxLength={6}`, `keyboardType="number-pad"`, `selectTextOnFocus`.
- `max` sale de `useLot(id)?.stock`.
- Si el lote está vencido, mostrar banner rojo y deshabilitar todo (no debería llegarse desde Detalle,
  pero puede entrarse por URL).
- Si `max === 0`, mostrar `Sin stock` y deshabilitar.

Mensajes de error (debajo del input, tono `critical`):

| Caso | Mensaje | Acción rápida |
|---|---|---|
| `qty === 0` | `Cantidad no válida.` + `Ingresa un número entre 1 y {max} {unidad} disponibles en el estante.` | `Usar 1 unidad` |
| `qty > max` | `Cantidad no válida.` + `Ingresa un número entre 1 y {max} {unidad} disponibles en el estante.` | `Ajustar al máximo disponible ({max} unidades)` |
| vacío/NaN | igual que 0 | `Usar 1 unidad` |

El texto secundario exacto:
`Ingresa un número entre 1 y {max} {unidad} disponibles en el estante.`
(concordancia singular: `1 unidad disponible`).

Resumen dinámico:

```
Quedarán: {max - qty} en estante · {formatBs(qty * price)} total
```

Solo si `!invalid`. Si es inválido, mostrar guion `—`.

Link `Vender todo el lote restante ({max} unidades)`:

- Setea `raw = String(max)`.
- `accessibilityRole="button"`.

Confirmación (`519:5930`):

- Al tocar `Confirmar venta ({qty} {unidad})`, abrir `ConfirmDialog` encima del sheet:
  - `title`: `¿Confirmar venta?`
  - `subtitle`: `Se actualizará el stock de mostrador en tiempo real`
  - `rows`:
    - `Medicamento` / `{name}`
    - `Cantidad a despachar` / `{formatQty(qty, unit)}`
    - `Importe calculado` / `{formatBs(qty * price)}`
    - `Quedarán en estante` / `{formatQty(max - qty, unit)}`
  - `primaryLabel`: `Sí, registrar venta`
  - `secondaryLabel`: `Volver a editar cantidad`
  - `onPrimary`: ejecutar la venta.
  - `onSecondary`/`onClose`: cerrar solo el diálogo.

Ejecución:

```ts
setSaving(true);
try {
  await sellBatch(id, qty);
  router.replace({
    pathname: '/venta-exitosa',
    params: { name, lot, qty, unit, total: qty * price, remaining: max - qty, origin },
  });
} catch {
  setOffline(true);
} finally {
  setSaving(false);
}
```

- `origin` se lee de `useLocalSearchParams` (`'stock' | 'vencer'`, default `'vencer'`).
- Mientras guarda: `Button loading` y `disabled`; el sheet no se cierra.
- Si falla: `SinConexionDialog` de Int 1, con `onRetry` = reintentar y `onCancel` = cerrar.
- Anunciar errores de validación con `AccessibilityInfo.announceForAccessibility`.

Cancelar:

- `Cancelar y mantener en lista` → `router.back()`.
- El gesto “atrás” de Android también cierra (ya configurado).

Accesibilidad:

- Input con `accessibilityLabel="Cantidad a vender"`, `accessibilityHint="Entre 1 y 200 comprimidos"`.
- Error con `accessibilityLiveRegion="polite"`.
- CTA con label completo `Confirmar venta de 10 comprimidos`.
- Diálogo con `accessibilityViewIsModal`.
- Targets ≥48.

#### 23.4.3 Descartar

Contenido:

```
Nombre · lote · vence en N días
Descartar
[CANTIDAD A DESCARTAR *]
[ 5 ]  COMPRIMIDOS
[MOTIVO DEL RETIRO *]
[Vencido] [Dañado / Deteriorado]
[Devolución a droguería]
[Confirmar descarte (5 comprimidos)]
Cancelar y conservar en lista
```

Medidas:

| Bloque | Medida Figma | Implementación |
|---|---|---|
| Nombre | 14 semibold | `Typography.scale.button` + `fontFamilySemiBold` |
| Lote | 12 regular | `Typography.scale.metadata` + `textSecondary` |
| Título sheet | 22/20 | `Typography.scale.modalTitle` + `fontFamilyBold` |
| Input | 28 bold | `Typography.scale.display` + `fontFamilyBold` |
| Motivo chips | 2 columnas, alto 48 | `Chip` `flexBasis: '48%'` |
| CTA | 48, r12 | `Button` primario |

Reglas:

- Cantidad: entero entre 1 y `stock`; mismos mensajes que venta. El estado visual de error
  replica `519:3715`: contenedor del campo con borde `critical.border`, caja de mensaje
  `critical.bg` y acción rápida debajo.
- Acción rápida del error: si la cantidad es 0 o está vacía → `Usar 1 unidad`; si supera el
  stock → `Ajustar al máximo disponible ({stock} unidades)`. **Nunca** repetir el bug de Figma
  («Ajustar al mínimo disponible (200 unidades)» con cantidad 0).
- Motivo obligatorio: uno de `EXPIRED`, `DAMAGED_DETERIORATED`, `RETURN_TO_SUPPLIER`.
  - Labels: `Vencido`, `Dañado / Deteriorado`, `Devolución a droguería`.
- Si no hay motivo al confirmar:
  - mostrar `Debes seleccionar un motivo obligatorio para la baja.`
  - borde de chips en `critical.border` (`Chip error`).
  - no abrir confirmación.
- Si el lote está vencido, preseleccionar `Vencido`.
- `Vencido` se muestra deshabilitado si `days >= 0`? No: se puede descartar un lote no vencido por daño.
  Mantener los 3 disponibles.

Confirmación:

- El frame `519:4718` no tiene popup: el CTA confirma directo.
- Al confirmar: `discardBatch(id, qty, reason)` → `router.replace('/descarte-exitoso', params)`.
- Params: `name`, `lot`, `qty`, `unit`, `total = qty * price`, `remaining = stock - qty`,
  `reason`, `origin`.
- Mismo manejo de `saving` y `SinConexionDialog`.

Accesibilidad:

- Chips con `accessibilityRole="radio"` dentro de un `View` con `accessibilityRole="radiogroup"`.
- Anunciar el motivo seleccionado.
- Input con label `Cantidad a descartar`.

#### 23.4.4 Criterios de aceptación

- [ ] Ambos sheets abren y cierran sin dejar el stack sucio.
- [ ] El input solo acepta dígitos y respeta el máximo del lote.
- [ ] Los 3 errores de cantidad muestran el mensaje y la acción correcta.
- [ ] El resumen «Quedarán / total» se actualiza en vivo.
- [ ] Confirmar venta muestra el popup con los 4 datos.
- [ ] El descarte exige motivo y muestra el error si falta.
- [ ] Las mutaciones actualizan stock y movimientos; se reflejan en Stock/Por Vencer/Historial.
- [ ] El fallo de red abre `SinConexionDialog` sin perder lo escrito.
- [ ] `tsc` y `eslint` limpios.

#### 23.4.5 Prohibiciones locales

- No usar `Alert.alert`.
- No navegar a éxito sin haber confirmado la mutación.
- No cerrar el sheet antes de que termine `sellBatch`/`discardBatch`.
- No usar `parseInt` sin validar `NaN`.
- No permitir `qty = 0` ni decimales.
- No tocar `detalle/[id].tsx` ni las pantallas de éxito.

#### 23.4.6 Handoff

Capturas: venta default, venta con cantidad excedida, venta con cero, confirmación, descarte default,
descarte sin motivo. Lista de archivos, `tsc`/`eslint`, desviaciones.

---

### 23.5 Integrante 5 — Stock, búsqueda y filtros

#### Misión

Que Doña Elena encuentre un lote en segundos por nombre o lote, lo filtre por vencimiento,
ubicación, forma o estado, y abra el detalle sin perder el contexto de búsqueda.

#### Archivos que posee

| Archivo | Acción |
|---|---|
| `src/app/(tabs)/stock.tsx` | Reescribir completo |
| `src/components/FiltroStockSheet.tsx` | Crear |

#### Referencias Figma

| Pantalla | Frame ID | Spec | PNG |
|---|---|---|---|
| Stock | `519:5135` | `design/figma/specs/519-5135.md` | `design/figma/png/519-5135-stock.png` |
| Filtro Stock | `519:5314` | `design/figma/specs/519-5314.md` | `design/figma/png/519-5314-filtro-stock.png` |
| Autocompletado | `519:5461` | `design/figma/specs/519-5461.md` | `design/figma/png/519-5461-stock-autocompletado.png` |
| Sin resultados | `519:5597` | `design/figma/specs/519-5597.md` | `design/figma/png/519-5597-stock-sin-resultados.png` |

#### 23.5.1 Stock — estructura

```tsx
<Screen header={<AppHeader />}>
  {/* Título Stock */}
  {/* Buscador + botón Filtros */}
  {/* Chips de filtros activos */}
  {/* Subheader: Stock total (N lotes) · Orden FEFO */}
  {/* Lista / autocompletado / vacío */}
</Screen>
```

Medidas:

| Bloque | Medida Figma | Implementación |
|---|---|---|
| Título | 22 bold | `Typography.scale.h1` + `fontFamilyBold` |
| Buscador | alto 44, r12 | `View` `row`, `backgroundColor: surface`, `borderWidth: 1`, `borderColor: border` |
| Botón Filtros | 44×44, r12, primary | `Pressable` con `SlidersHorizontal` blanco; badge de activos |
| Chips activos | alto 32 | `Chip` `selected` con `X` opcional |
| Subheader | 13 | `Typography.scale.body` + `textSecondary` |
| Tarjeta | r13, padding 16 | `Card` `gap: Spacing.sm` |
| Nombre | 15 bold | `Typography.scale.price` + `fontFamilyBold` |
| Precio | 16 bold | `Typography.scale.h2` + `fontFamilyBold` |
| Descripción | 12 | `Typography.scale.metadata` + `textSecondary` |
| Stock/ubicación | 12 | `Typography.scale.metadata` |
| Lote | 11 | `Typography.scale.label` + `textSecondary` |
| Ver detalle | 13 bold primary | `Pressable` con `ChevronRight` |

Contenido de tarjeta:

```
Amoxicilina 500 mg                      Bs. 14.50
Suspensión oral 60 ml · Lab. IFA
[Vence en 12 días]
12 frascos · Estante C · N2
Lote: AMX-08                 Ver detalle ›
```

Reglas:

- `useLots()` ya viene ordenado FEFO.
- Filtro por texto: `name`, `lot`, `laboratory` y `description` (case-insensitive, sin acentos).
  Normalizar con `.normalize('NFD').replace(/[\u0300-\u036f]/g, '')`.
- Debounce de 200 ms para el autocompletado.
- `onSubmitEditing` fija la búsqueda y oculta sugerencias.
- Al tocar una sugerencia: setea la búsqueda al nombre y muestra resultados.
- Limpiar búsqueda con `X` dentro del input.
- Chips activos: `≤ 15 días`, `≤ 30 días`, `≤ 60 días`, `Estante C`, etc., con `X` para quitarlos.
- `+ Añadir filtro` abre el sheet.
- El contador `Stock total (N lotes)` refleja el resultado filtrado, no el total absoluto.
- `Orden FEFO` es informativo (no un botón).
- Al volver del detalle, conservar búsqueda y filtros (estado en la pantalla, no remount).

Autocompletado (`519:5461`):

- Visible cuando el input tiene foco y `query.length >= 2` y no se envió.
- Panel flotante debajo del buscador, `Card` con sombra `Shadows.modal`, radio 12.
- Filas: nombre 14 bold + `Search` 16; separador 1 `border`.
- Texto inferior: `Presiona buscar en el teclado para ver todos`.
- Botón: `Ver N resultados para “{query}”` 15 primary.
- Sin resultados: no mostrar panel; al enviar, mostrar estado vacío.

Vacío (`519:5597`):

- Icono `SearchX` 32.
- Título: `Sin resultados para “{query}”` 24 bold.
- Descripción: `Ningún lote coincide con la búsqueda y los filtros activos. Toca × en un filtro o en el buscador para ampliar la búsqueda.`
- Acción: `Limpiar búsqueda y filtros` (secundario).
- Mantener el buscador visible.

Estados:

- **Loading:** 3 skeletons de tarjeta.
- **Empty:** el descrito.
- **Error de datos:** `EmptyState` con `WifiOff` y `Reintentar`.

Accesibilidad:

- Input: `accessibilityLabel="Buscar medicamento o lote"`, `returnKeyType="search"`.
- Botón filtros: label `Filtros, 2 activos`.
- Cada tarjeta: `accessibilityRole="button"`, label con nombre, lote, vencimiento y stock.
- Chips activos: label `Quitar filtro Estante C`.

#### 23.5.2 `FiltroStockSheet`

API:

```tsx
type FiltroStock = {
  expiry: '15' | '30' | '60' | null;
  locations: string[];
  forms: string[];
  stock: 'all' | 'withStock' | 'low';
};

type Props = {
  visible: boolean;
  value: FiltroStock;
  resultCount: number;
  onApply: (next: FiltroStock) => void;
  onClose: () => void;
};
```

Visual:

- `Modal` transparente `animationType="slide"` + scrim.
- Panel blanco, `maxHeight: '90%'`, esquinas superiores `Radius.sheet`, `padding: Spacing.gutter`.
- Header: `Filtros` 22 bold, `{n} activos` 11, `Restablecer` 13 primary a la derecha.
- Secciones con label 10 bold `textSecondary` y `letterSpacing 0.5`:
  1. `CRITERIO FEFO (VENCIMIENTO)` — chips `≤ 15 días` (Crítico), `≤ 30 días` (Atención), `≤ 60 días` (Regular). Selección única.
  2. `UBICACIÓN FÍSICA EN FARMACIA` — `Estante A (Genéricos)`, `Estante B (Jarabes)`, `Estante C (Antibióticos)`, `Vitrina Mostrador`, `Refrigerador (Vacunas/Colirios)`. Múltiple.
  3. `FORMA FARMACÉUTICA` — `Comprimidos`, `Cápsulas`, `Jarabes`, `Suspensiones`, `Inyectables / Ampollas`, `Pomadas / Cremas`. Múltiple.
  4. `ESTADO DEL STOCK` — `Todos`, `Solo con stock`, `Stock bajo (< 10)`. Única.
- Footer fijo: `Cancelar` (ghost) + `Aplicar filtros` (primario, 227×54) + contador `N resultados` 11.
- Scroll interno para las secciones; el footer no scrollea.
- `Restablecer` vuelve al estado vacío (`expiry: null`, arrays vacíos, `stock: 'all'`).

Lógica:

- `expiry` filtra por `daysToExpire <= N` y `>= 0` (los vencidos no entran en FEFO).
- `locations` matchea `lot.shelf`.
- `forms` matchea `lot.form`.
- `stock: 'withStock'` → `stock > 0`; `'low'` → `stock < 10`.
- Dentro de un grupo, OR; entre grupos, AND.
- `resultCount` se calcula en vivo y se muestra en el footer.
- `Aplicar` cierra el sheet y actualiza la lista.
- `Cancelar` descarta los cambios locales.

Accesibilidad:

- Modal con `accessibilityViewIsModal`.
- Chips con `accessibilityRole="checkbox"` / `"radio"` según grupo.
- Anunciar `N resultados` al aplicar.

#### 23.5.3 Criterios de aceptación

- [ ] La búsqueda encuentra por nombre, lote y laboratorio, ignorando acentos.
- [ ] El autocompletado aparece a partir de 2 caracteres y permite enviar.
- [ ] Los chips activos se muestran y se pueden quitar.
- [ ] El sheet aplica y restablece filtros; el contador coincide con la lista.
- [ ] El estado vacío muestra el query real.
- [ ] Al volver del detalle se conserva el estado.
- [ ] `tsc` y `eslint` limpios.

#### 23.5.4 Prohibiciones locales

- No crear un `SearchBar` nuevo si se puede componer con `View` + `TextInput` + tokens.
- No usar `FlatList` dentro de `ScrollView`.
- No filtrar con `startsWith` solamente: usar `includes` normalizado.
- No mostrar los 18 lotes de golpe si el diseño muestra 3 (usar `FlatList` con scroll normal).
- No tocar `FiltroHistorialSheet` (Int 6).

#### 23.5.5 Handoff

Capturas: Stock default, autocompletado, sin resultados, filtro abierto y aplicado. `tsc`/`eslint`,
desviaciones.

---

### 23.6 Integrante 6 — Historial, Filtro Historial y Descarte exitoso

#### Misión

Que Doña Elena audite qué pasó con el inventario (ventas, bajas, ingresos), filtre por período,
tipo y motivo, y confirme un descarte con su impacto económico.

#### Archivos que posee

| Archivo | Acción |
|---|---|
| `src/app/historial.tsx` | Reescribir completo |
| `src/components/FiltroHistorialSheet.tsx` | Crear |
| `src/app/descarte-exitoso.tsx` | Reescribir completo |

#### Referencias Figma

| Pantalla | Frame ID | Spec | PNG |
|---|---|---|---|
| Historial | `519:4343` | `design/figma/specs/519-4343.md` | `design/figma/png/519-4343-historial.png` |
| Filtro Historial | `519:4523` | `design/figma/specs/519-4523.md` | `design/figma/png/519-4523-filtro-historial.png` |
| Historial vacío | `519:4263` | `design/figma/specs/519-4263.md` | `design/figma/png/519-4263-historial-vacio.png` |
| Descarte exitoso | `521:250` | `design/figma/specs/521-250.md` | `design/figma/png/521-250-descarte-exitoso.png` |

#### 23.6.1 Historial — estructura

```tsx
<Screen header={<AppHeader back />}>
  {/* Título + botón Filtros */}
  {/* Buscador */}
  {/* Chips activos */}
  {/* Subheader Movimientos recientes · Orden cronológico */}
  {/* Lista de movimientos */}
  {/* EmptyState */}
</Screen>
```

Medidas:

| Bloque | Medida Figma | Implementación |
|---|---|---|
| Título | 22 bold | `Typography.scale.h1` + `fontFamilyBold` |
| Botón Filtros | 44 alto | `Pressable` texto `Filtros` + `SlidersHorizontal` |
| Buscador | 44, r12 | Igual que Stock |
| Chips | 32 | `Chip` |
| Subheader | 13 | `Typography.scale.body` + `textSecondary` |
| Tarjeta movimiento | r13, padding 16 | `Card` `gap: Spacing.xs` |
| Badge tipo | alto 24 | `Badge` tono según tipo |
| Cantidad | 16 bold | `Typography.scale.h2` + `fontFamilyBold` |
| Producto | 15 bold | `Typography.scale.price` + `fontFamilyBold` |
| Meta | 12 | `Typography.scale.metadata` + `textSecondary` |
| Motivo | 11 | `Typography.scale.label` + `textSecondary` |
| Ver detalle | 13 primary | `Pressable` |

Contenido:

```
[Venta en mostrador]                     -10 comp.
Amoxicilina 500 mg
Suspensión oral 60 ml · Lab. IFA
Lote: AMX-08
Hoy, 19:42 · Encargado de turno: Carlos M.    Ver detalle ›
```

Tipos y tonos:

| Tipo | Badge | Icono | Tono | Signo |
|---|---|---|---|---|
| `SALE` | `Venta en mostrador` | `ArrowDownRight` | `success` | `-` |
| `DISCARD` | `Baja / Merma` | `TriangleAlert` | `critical` | `-` |
| `ENTRY` | `Ingreso / Reposición` | `ArrowUpRight` | `info` | `+` |

Reglas:

- Orden: `movement_date` descendente.
- `useMovements()` ya entrega ordenado.
- El signo y la unidad salen del movimiento (`+20 frascos`, `-10 comp.`).
- Debajo de la cantidad, el tipo de unidad en 10 (`comp.`, `frascos`, `cajas`).
- Motivo solo en `DISCARD`: `Motivo: Fecha vencida`.
- Fecha con `formatDate`.
- Buscador por nombre de producto y lote.
- Chips activos: `Hoy`, `Todos los tipos`, `+ Añadir filtro`.
- Tocar `Ver detalle` → `/detalle/{batchId}` si el lote existe; si no, no navegar.
- La tarjeta completa no es tocable (evita ambigüedad); solo `Ver detalle`.

Vacío (`519:4263`):

- Icono `History` 32.
- Título `No hay movimientos registrados`.
- Descripción `No se encontraron ventas ni descartes de estante en el período seleccionado.`
- Acción `Limpiar filtros`.

Estados:

- **Loading:** 4 skeletons de tarjeta.
- **Error:** `EmptyState` con `WifiOff` y `Reintentar`.

Accesibilidad:

- Cada movimiento: label `Venta en mostrador, Amoxicilina 500 mg, menos 10 comprimidos, hoy 19:42`.
- El signo se anuncia como «menos»/«más», no como guion.
- Botón filtros con contador de activos.

#### 23.6.2 `FiltroHistorialSheet`

API:

```tsx
type FiltroHistorial = {
  period: 'today' | 'yesterday' | '7d' | 'month' | 'custom' | null;
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
  types: ('SALE' | 'DISCARD' | 'ENTRY')[];
  reasons: string[];
  users: string[];
};

type Props = {
  visible: boolean;
  value: FiltroHistorial;
  resultCount: number;
  onApply: (next: FiltroHistorial) => void;
  onClose: () => void;
};
```

Visual:

- Mismo patrón que `FiltroStockSheet`: `Modal` + scrim + panel `maxHeight: '90%'`, r20 arriba.
- Header: `Filtros` 22 bold, `{n} activos`, `Restablecer`.
- Secciones:
  1. `PERÍODO / FECHA DEL MOVIMIENTO` — `Hoy`, `Ayer`, `Últ. 7 d.`, `Este Mes`, `Rango personalizado` (abre dos `TextInput` DD/MM/AAAA + `Elegir fechas`).
  2. `TIPO DE MOVIMIENTO` — tarjetas seleccionables: `Ventas` (Salidas por mostrador · Salida), `Bajas / Merma` (Vencidos o rotos · Baja), `Ingresos` (Nuevos lotes y reposición · Ingreso). Múltiple.
  3. `MOTIVO ESPECÍFICO (EN CASO DE BAJA)` — `Todos los motivos`, `Fecha vencida (FEFO)`, `Empaque deteriorado / Roto`, `Retiro por laboratorio`. Múltiple.
  4. `REGISTRADO POR` — `Todos los responsables`, `Doña Elena`, `Farm. Carlos M.`, `Laura G.`, `Roberto S.`.
- Footer: `Cancelar`, `Aplicar filtros`, `{n} movimientos`.

Reglas:

- `period` es excluyente.
- `types`/`reasons`/`users`: OR dentro del grupo.
- Rango personalizado: validar `DD/MM/AAAA`, convertir a ISO, `from <= to`. Si es inválido, borde rojo y mensaje `Ingresa un rango válido (DD/MM/AAAA).` No aplicar.
- `reasons` solo aplica a `DISCARD`.
- `Restablecer` limpia todo.
- `resultCount` en vivo.
- Scroll interno; footer fijo.

Accesibilidad:

- `radiogroup` para período, `checkbox` para tipos/motivos/usuarios.
- Inputs de fecha con label y `keyboardType="numbers-and-punctuation"`.
- Anunciar `N movimientos` al aplicar.

#### 23.6.3 Descarte exitoso

Ruta `descarte-exitoso` (`transparentModal`, `fade`). Params:

```ts
{ name, lot, qty, unit, total, remaining, reason, origin }
```

`SuccessDialog` con:

| Prop | Valor |
|---|---|
| `title` | `¡Descarte registrado!` |
| `message` | `La salida ha sido descontada del inventario del mostrador.` |
| `summary` | `[{label:'CANTIDAD DESCARTADA', value:'5 comprimidos'}, {label:'TOTAL PÉRDIDA', value:'Bs. 7.50'}]` |
| `note` | `Motivo: Vencido · Stock restante: 195 comprimidos` |
| `primaryLabel` | `Continuar atendiendo` |
| `secondaryLabel` | `Deshacer (5 s)` |
| `onPrimary` | volver a `/por-vencer` (o `/stock` si `origin === 'stock'`) |
| `onSecondary` | `undoLast()` y volver |

Reglas:

- Mismo timer de 5 s que venta exitosa.
- Si faltan params, usar valores seguros y no mostrar `undefined`.
- Anunciar `Descarte registrado`.
- `TOTAL PÉRDIDA` = `formatBs(qty * price)`.

#### 23.6.4 Criterios de aceptación

- [ ] El historial muestra los 5 movimientos con tipo, cantidad, producto, lote, fecha y responsable.
- [ ] Los signos y unidades son correctos.
- [ ] El buscador y los chips filtran.
- [ ] El sheet aplica período, tipo, motivo y responsable; el contador coincide.
- [ ] El rango personalizado valida el formato.
- [ ] El estado vacío aparece y se puede limpiar.
- [ ] Descarte exitoso muestra resumen, motivo y stock restante; permite deshacer 5 s.
- [ ] `tsc` y `eslint` limpios.

#### 23.6.5 Prohibiciones locales

- No duplicar el `FiltroStockSheet`; son componentes distintos con la misma estética.
- No mostrar el motivo en ventas o ingresos.
- No usar emojis `↺`/`›`: usar `History`/`ChevronRight`.
- No hardcodear «5 movimientos».
- No tocar `por-vencer.tsx` ni `detalle/[id].tsx`.

#### 23.6.6 Handoff

Capturas: historial default, filtro abierto, vacío, descarte exitoso. `tsc`/`eslint`, desviaciones.

---

## 24. Cierre

Este documento se considera cumplido cuando:

1. Los 6 bloques están implementados y verificados.
2. El lead corrió `npx tsc --noEmit` y `npx eslint src` sin errores.
3. La app se probó en el Galaxy A56 físico, portrait, gestos, fuente por defecto.
4. Cada pantalla tiene su captura comparativa contra Figma.
5. `package.json` y `package-lock.json` conservan sus hashes.
6. No queda ningún `TODO`, `Alert.alert`, hex suelto ni componente duplicado.

Si algo de esto falla, **no se entrega**. Se corrige o se declara el bloqueo.
