# 💊 ALIVIA — Aplicación Móvil de Gestión Farmacéutica

> **Proyecto:** Interacción Humano-Computador (IHC) — UMSS
> **Equipo:** StackOverflow
> **Usuario Objetivo:** Doña Elena (Farmacéutica / Encargada de Mostrador)
> **Pregunta Clave:** *¿Cómo podríamos alertar próximos vencimientos para que la encargada detecte los productos críticos sin tener que revisar los estantes de forma manual?*

---

## 🚀 1. Stack Tecnológico

- **Framework:** React Native con **Expo SDK 58** + **Expo Router** (rutas por archivos).
- **Tipografía:** `Plus Jakarta Sans` (400/500/600/700) vía `@expo-google-fonts/plus-jakarta-sans`.
- **Paleta (Figma):** primario `#1B5E7B`; crítico `#B91C1C`/`#FEE2E2`; atención `#E65100`/`#FEF3C7`; 60 días `#0369A1`/`#E0F2FE`.
- **Iconos:** `lucide-react-native` (requiere `react-native-svg`, ya instalado).
- **Offline local:** `expo-sqlite` (`alivia_local_v2.db`, espejo de Supabase + cola `sync_outbox`).
- **Backend:** **Supabase** (PostgreSQL + API REST automática). **No hay backend propio.**
- **Datos remotos:** `@supabase/supabase-js` + `@tanstack/react-query`.

---

## 💻 2. Requisitos (léelo si nunca usaste React Native)

Solo necesitas:

1. **Node.js 22.13 o superior** (Expo SDK 58 no soporta Node 20).
2. Un navegador (para verlo rápido) **o** un teléfono con **Expo Go** (para la experiencia real).
3. No necesitas Android Studio, Xcode ni instalar un backend.

### Instalar Node 22 (recomendado con nvm)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 22
nvm alias default 22
node -v          # debe mostrar v22.x
```

Si ya tienes `nvm`, solo ejecuta `nvm install 22 && nvm use 22`.

---

## ▶️ 3. Cómo ver la app

Abre una terminal y entra al proyecto:

```bash
cd /home/profeta/Proyectos/alivia-mobile
npm install
```

### Opción A — En el navegador (la más rápida)

```bash
npx expo start --web
```

Se abre `http://localhost:8081`.
- Para detener: `Ctrl + C`.
- En web se puede navegar todo, pero **SQLite/offline solo funciona en el teléfono**.

### Opción B — En tu teléfono con Expo Go (recomendada)

1. Instala **Expo Go** desde Play Store (Android) o App Store (iPhone).
2. Conecta el teléfono y la computadora a **la misma red Wi-Fi**.
3. Ejecuta:

```bash
npx expo start
```

4. Escanea el QR:
   - **Android:** desde la app Expo Go.
   - **iPhone:** desde la cámara del teléfono.
5. Si iPhone pide cuenta: ejecuta `npx expo login` y usa la misma cuenta en Expo Go.

> **¿Redes distintas o Wi-Fi bloqueada?** `npx expo start --tunnel`

### Opción C — Emulador de Android (solo si ya lo tienes)

Instala Android Studio + un AVD y luego presiona **`a`** en la terminal de Expo.
Es la opción más pesada; no es necesaria para la demo.

### Atajos de la terminal de Expo

| Tecla | Acción |
|---|---|
| `w` | abrir en navegador |
| `a` | abrir en emulador Android |
| `r` | recargar la app |
| `j` | abrir el debugger |
| `Ctrl + C` | detener el servidor |

---

## 🧭 4. Recorrido para probar lo que ya está hecho

1. Abre la pestaña **Vencimientos** (Dashboard).
2. Toca **“Ver alertas →”**.
3. En **Por Vencer**, toca **“Vender”** en una tarjeta.
4. Prueba las validaciones:
   - Baja la cantidad a **0** → CTA gris y mensaje “La cantidad debe ser mayor a 0”.
   - Sube a **250** → borde rojo y “Ingresa un número entre 1 y 200…”.
   - Vuelve a **10** → “Confirmar venta (10 comprimidos)”.
5. Aparece **“¿Confirmar venta?”** → “Sí, registrar venta” → popup **“Venta registrada”**.
6. Repite con **“Descartar”**: sin motivo el CTA está bloqueado; elige **Vencido**, cantidad **5** y confirma → popup **“Descarte registrado”**.
7. Toca **“Ver historial”** para ver la pantalla de auditoría.

Solo hay **2 pestañas**: **Vencimientos** y **Stock**. Configuración se abre con el engranaje del Dashboard.

---

## 📁 5. Estructura del proyecto

```text
src/
├── app/                    # Rutas (cada archivo es una pantalla)
│   ├── (tabs)/
│   │   ├── _layout.tsx     # Las 2 pestañas: Vencimientos y Stock
│   │   ├── index.tsx       # Dashboard / Vencimientos
│   │   └── stock.tsx       # Inventario
│   ├── _layout.tsx         # Stack raíz + fuentes + SQLite
│   ├── por-vencer.tsx      # Listado 15/30/60 días
│   ├── historial.tsx       # Auditoría de movimientos
│   ├── configuracion.tsx
│   ├── detalle/[id].tsx
│   ├── venta/[id].tsx      # BottomSheet de venta
│   ├── descartar/[id].tsx  # BottomSheet de descarte
│   ├── venta-exitosa.tsx   # Popup de éxito (venta)
│   └── descarte-exitoso.tsx# Popup de éxito (descarte)
├── components/ui/          # Botones, cards, badges, sheets, diálogos…
├── constants/theme.ts      # ÚNICA fuente de colores, tipografía y espaciados
├── hooks/
├── lib/
│   ├── sqlite.ts           # Offline nativo
│   ├── sqlite.web.ts       # Shims para previsualizar en navegador
│   └── supabase.ts
└── types/database.ts
```

**Regla de oro:** ninguna pantalla declara colores, tamaños ni radios propios. Todo sale de `src/constants/theme.ts` y de `src/components/ui`.

---

## 🎨 6. Tokens de diseño

```ts
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

backgroundColor: Colors.primary;          // '#1B5E7B'
fontFamily: Typography.fontFamilyBold;    // 'PlusJakartaSans_700Bold'
fontSize: Typography.scale.h1;            // 22 (título de pantalla)
fontSize: Typography.scale.modalTitle;    // 20 (sheet / popup)
padding: Spacing.gutter;                  // 16
borderRadius: Radius.lg;                  // 12
```

Escala oficial: 36 cantidad · 28 KPI · 22 pantalla · 20 sheet · 18 marca · 16 tarjeta · 15 precio/CTA · 13 cuerpo · 12 meta · 11 label · 10 micro.

---

## 🔐 7. Variables de entorno (Supabase)

Copia la plantilla y coloca tus credenciales reales:

```bash
cp .env.example .env
```

```env
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

> Sin credenciales la app **igualmente se ve** (las pantallas usan datos mock). Las credenciales solo se necesitan cuando conectemos las consultas reales.

---

## 🛡️ 8. Reglas de negocio esenciales

1. **FEFO obligatorio:** primero sale el lote con `expiration_date` más cercana.
2. **Vencidos bloqueados:** un lote vencido no se vende; solo se descarta.
3. **Motivo obligatorio:** el descarte exige un motivo (`Vencido`, `Dañado`, `Devolución a droguería`).
4. **Offline first:** se escribe primero en SQLite y `sync_outbox` sincroniza con Supabase al volver la red.
5. **Deshacer:** toda venta/descarte muestra un snackbar de 5 s con `DESHACER`.

---

## 🌿 9. Git por integrante

```bash
git checkout feature/integrante4-operaciones-venta
# desarrollar solo los archivos asignados
git add .
git commit -m "feat(venta): bottom sheet y confirmacion de venta"
```

Antes de subir, verifica que no rompiste nada:

```bash
npx tsc --noEmit
npx eslint src
npx expo-doctor
```
