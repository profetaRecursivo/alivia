# 💊 ALIVIA — Aplicación Móvil de Gestión Farmacéutica

> **Proyecto:** Interacción Humano-Computador (IHC) — UMSS  
> **Equipo:** StackOverflow  
> **Usuario Objetivo:** Doña Elena (Farmacéutica / Encargada de Mostrador)  
> **Pregunta Clave:** *¿Cómo podríamos alertar próximos vencimientos para que la encargada detecte los productos críticos sin tener que revisar los estantes de forma manual?*

---

## 🚀 1. Stack Tecnológico

- **Framework:** React Native con Expo SDK 58 (Expo Router v4).
- **Tipografía Oficial:** `Plus Jakarta Sans` (400, 500, 600, 700) cargada automáticamente vía `@expo-google-fonts/plus-jakarta-sans`.
- **Paleta Oficial:**
  - Primario de Marca: `#1B5E7B` (Deep Slate Teal).
  - Semáforo de Urgencia: Crítico `≤15 días` (`#B91C1C` / `#FEE2E2`), Atención `≤30 días` (`#D97706` / `#FEF3C7`), Regular `≤60 días` (`#0D9488` / `#CCFBF1`).
- **Iconografía:** `lucide-react-native`.
- **Persistencia Local (Offline-first):** `expo-sqlite` (Base de datos local `alivia_local.db` con tablas `products`, `batches` y cola `sync_outbox`).
- **Backend Central:** Supabase PostgreSQL (RLS deshabilitado para desarrollo ágil del MVP, conexión vía `anon_key`).
- **Estado y Sincronización:** `@tanstack/react-query` y `zustand`.

---

## 📋 2. Distribución de Trabajo del Equipo (4 Pantallas por Integrante)

| Integrante | Rol / Módulo | Rama Git Asignada | Pantallas Clave en `src/app/` |
|---|---|---|---|
| **Integrante 1** | Dashboard & Configuración | `feature/integrante1-dashboard-config` | `src/app/(tabs)/index.tsx`, `src/app/configuracion.tsx` |
| **Integrante 2** | Vencimientos & Filtros Temporales | `feature/integrante2-por-vencer` | `src/app/(tabs)/por-vencer.tsx` (Tabs 15d, 30d, 60d) |
| **Integrante 3** | Detalle de Producto & Lotes FEFO | `feature/integrante3-detalle-producto` | `src/app/detalle/[id].tsx` (Bloqueo de vencidos) |
| **Integrante 4** | Operaciones de Venta & Descarte | `feature/integrante4-operaciones-venta` | `src/app/venta/[id].tsx`, `src/app/descartar/[id].tsx` |
| **Integrante 5** | Inventario General & Búsqueda | `feature/integrante5-stock-fefo` | `src/app/(tabs)/stock.tsx` |
| **Integrante 6** | Historial de Movimientos & Bajas | `feature/integrante6-historial-bajas` | `src/app/(tabs)/historial.tsx` |

---

## ⚙️ 3. Configuración Inicial del Entorno

### 1. Clonar e Instalar Dependencias
```bash
git clone <url-del-repositorio>
cd alivia-mobile
npm install
```

### 2. Configurar Variables de Entorno
Copia el archivo de plantilla `.env.example` a `.env`:
```bash
cp .env.example .env
```
Edita `.env` con las credenciales de tu proyecto de Supabase:
```env
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### 3. Iniciar la Aplicación
```bash
npm start
```
- Presiona **`a`** para abrir en emulador de Android.
- O escanea el código QR desde la app **Expo Go** en tu teléfono físico.

---

## 🌿 4. Flujo de Trabajo con Git

Cada integrante debe trabajar en su rama correspondiente:

```bash
# Cambiar a tu rama asignada (ejemplo Integrante 2)
git checkout feature/integrante2-por-vencer

# Desarrollar tus pantallas y componentes asignados...
git add .
git commit -m "feat(por-vencer): implementacion de tarjetas de vencimiento y tabs temporales"

# Subir cambios
git push origin feature/integrante2-por-vencer
```

---

## 🎨 5. Tokens de Diseño y Componentes

Usa siempre los tokens oficiales definidos en `src/constants/theme.ts`:

```typescript
import { Colors, Typography, Spacing } from '@/constants/theme';

// Color primario
backgroundColor: Colors.primary // '#1B5E7B'

// Tipografía oficial
fontFamily: Typography.fontFamilyBold // 'PlusJakartaSans_700Bold'

// Espaciados
padding: Spacing.md // 12px
paddingHorizontal: Spacing.lg // 16px
```

---

## 🛡️ 6. Reglas de Negocio Esenciales

1. **Criterio FEFO Obligatorio:** En venta, el primer lote en salir debe ser siempre el más próximo a vencer (`expiration_date ASC`).
2. **Bloqueo de Vencidos:** Todo lote con fecha anterior a la fecha actual queda inhabilitado para la venta (`is_locked: true`). Únicamente se permite su descarte.
3. **Gestión de Descarte:** El descarte exige un motivo obligatorio (`Vencido`, `Daño físico`, `Rotura de empaque`, etc.) y registra auditoría.
4. **Offline First:** Todas las lecturas y escrituras van primero a SQLite (`alivia_local.db`); la cola `sync_outbox` sincroniza con Supabase al recuperar la red.
