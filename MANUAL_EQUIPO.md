# 💊 MANUAL DE DESARROLLO Y GUÍA PASO A PASO — PROYECTO ALIVIA

> **Para:** Equipo de Desarrollo StackOverflow (Integrantes 1, 2, 3, 4, 5 y 6)  
> **Proyecto:** ALIVIA — Asistente de Gestión Farmacéutica y Vencimientos  
> **Materia:** Interacción Humano-Computador (IHC) — UMSS  
> **Usuario Objetivo:** Doña Elena (Farmacéutica / Encargada de Mostrador)  

---

## 🛑 1. ARQUITECTURA DEL PROYECTO (¡LEER ANTES DE TOCAR UNA SOLA LÍNEA!)

### ❓ "¿Tenemos que programar un backend en Express/Node y subirlo a Render?"
**NO. Terminantemente prohibido perder tiempo haciendo un backend en Render.**  
En la materia de IHC lo que se evalúa y califica con rigor es el **Frontend, la Usabilidad, el Diseño de Figma y las Heurísticas de Nielsen**.

La arquitectura de Alivia ya está resuelta con una solución profesional de la industria:
1. **Backend Central (Supabase / PostgreSQL):**
   - La base de datos ya está en la nube de Supabase.
   - Las tablas (`products`, `batches`, `inventory_movements`) y los datos de prueba ya existen.
   - Supabase genera automáticamente la API REST. Ustedes no tienen que crear endpoints, ni controladores, ni configurar servidores.
2. **Persistencia Local (Offline-First con SQLite):**
   - Dentro del celular corre **Expo SQLite** (`alivia_local.db`).
   - Si a Doña Elena se le corta el internet en la farmacia, la app sigue funcionando, vendiendo y alertando sin trabarse.
3. **Conexión Directa en 1 Minuto:**
   - En su archivo `.env` solo colocan las dos credenciales del proyecto:
     ```env
     EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
     EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
     ```
   - Y en su código consultan los datos directamente:
     ```typescript
     import { supabase } from '@/lib/supabase';
     const { data } = await supabase.from('products').select('*');
     ```

---

## ⚠️ 2. REGLA FUNDAMENTAL DE DISEÑO: FONDOS EN BOTTOMSHEETS Y POPUPS

> [!CAUTION]
> **MUCHA ATENCIÓN CON ESTO (ERROR COMÚN EN FIGMA):**
> En Figma, en varias pantallas de **BottomSheets** (como *Registrar Venta*, *Descartar*) y **PopUps** (como *Confirmar Venta*, *Retirar de Estante*), de fondo se ve una pantalla estática dibujada como referencia visual.
> 
> **ESA PANTALLA DE FONDO ES SÓLO UN MOCK VISUAL Y NO DEBEN INTENTAR MAQUETARLA NI PROGRAMARLA.**
> 
> En React Native, un BottomSheet o PopUp es un componente flotante interactivo (`<Modal>` o BottomSheet) con un fondo oscurecido semitransparente (`rgba(0,0,0,0.5)`). Lo **ÚNICO** que deben programar y diseñar es la **tarjeta/panel interactivo** que sube o aparece en el centro.

---

## 🎨 3. TOKENS DE DISEÑO OFICIALES (COLORES Y TIPOGRAFÍA)

No inventen colores hexadecimales ni tipografías. En el archivo `src/constants/theme.ts` ya están registrados todos los tokens oficiales extraídos de Figma:

### 🌈 Paleta Oficial de Colores
- **Color Primario de Marca:** `#1B5E7B` (Deep Slate Teal — botones principales, tabs activas, cabeceras).
- **Semáforo Semántico de Vencimientos:**
  - 🔴 **Crítico (≤ 15 días o Vencido):** Texto `#B91C1C` | Fondo `#FEE2E2` | Borde `#EF4444`
  - 🟡 **Atención (≤ 30 días):** Texto `#D97706` | Fondo `#FEF3C7` | Borde `#F59E0B`
  - 🟢 **Control Clínico (≤ 60 días):** Texto `#0D9488` | Fondo `#CCFBF1` | Borde `#14B8A6`
  - ❇️ **Éxito / Stock al Día:** Texto `#166534` | Fondo `#DCFCE7` | Borde `#22C55E`
- **Superficies y Neutros:**
  - Fondo general (Canvas): `#F8FAFC`
  - Tarjetas y Modales (Surface): `#FFFFFF`
  - Texto Principal (Títulos, cifras): `#0F172A`
  - Texto Secundario (Lotes, fechas): `#64748B`
  - Bordes divisores: `#E2E8F0`

### 🔤 Tipografía Oficial
- Fuente: **`Plus Jakarta Sans`** (Ya viene instalada en el proyecto con Expo Google Fonts).
- Se usa `PlusJakartaSans_700Bold` para títulos y cifras métricas, `PlusJakartaSans_600SemiBold` para medicamentos y botones, y `PlusJakartaSans_400Regular` para textos y metadatos.

---

## 🌿 4. CÓMO TRABAJAR EN GIT (FLUJO POR INTEGRANTE)

Cada uno tiene **su propia rama de Git**. Nadie toca la rama de otro compañero para evitar conflictos:

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd alivia-mobile

# 2. Instalar librerías
npm install

# 3. Crear tu archivo de variables de entorno
cp .env.example .env

# 4. Cambiarte a tu rama asignada (ejemplo Integrante 3)
git checkout feature/integrante3-detalle-producto

# 5. Iniciar la app en tu máquina
npm start
```

---

## 📱 5. GUÍA ESPECÍFICA DETALLADA POR INTEGRANTE (4 PANTALLAS CADA UNO)

---

### 👤 INTEGRANTE 1: INICIO, MÉTRICAS Y CONFIGURACIÓN
* **Rama Git:** `feature/integrante1-dashboard-config`
* **Archivos asignados:** `src/app/(tabs)/index.tsx` y `src/app/configuracion.tsx`

#### 🖥️ Tus 4 Pantallas en Figma:
1. **`Dashboard (Color)`** (Pantalla principal con alertas activas):
   - **Tarjeta de Saludo:** Fondo `#FFFFFF`, borde `#E2E8F0`. "Hola, Doña Elena" y selector de farmacia.
   - **Métricas Gigantes:** 3 tarjetas con números display en Bold:
     - 🔴 `3` Vencidos / Críticos (Fondo `#FEE2E2`, Texto `#B91C1C`).
     - 🟡 `12` Por Vencer ≤ 30d (Fondo `#FEF3C7`, Texto `#D97706`).
     - 🔵 `148` En Stock Correcto (Fondo `#E0F2F7`, Texto `#1B5E7B`).
   - **Acceso Rápido:** Botón grande `Revisar Vencimientos` (`#1B5E7B`) que lleva al tab *Por Vencer*.
2. **`Dashboard - Sin Alertas (Alivia) (Color)`** (Estado vacío positivo):
   - Se muestra cuando no hay medicamentos por vencer.
   - Banner verde `#DCFCE7` con ícono de verificación y mensaje: *"¡Todo en orden! No hay productos próximos a vencer en los siguientes 30 días"*.
3. **`Configuracion (Color)`**:
   - Cabecera con título `Configuración de Alertas` (`#1B5E7B`).
   - Sliders o switches de umbrales: Alerta crítica (15 días), Alerta media (30 días), Alerta preventiva (60 días).
   - Switch de *Vibración y Notificaciones locales*.
4. **`Modal - Sin Conexión al Servidor (Alivia) (Color)`**:
   - PopUp con ícono de Wifi tachado (`#D97706`).
   - Título: *"Modo Sin Conexión Activo"*.
   - Mensaje tranquilizador: *"Puedes seguir registrando ventas y descartes normalmente. Los cambios se sincronizarán en cuanto vuelva la red"*.
   - Botón `Entendido / Continuar Offline` (`#1B5E7B`).

---

### 👤 INTEGRANTE 2: VENCIMIENTOS Y MONITOREO TEMPORAL
* **Rama Git:** `feature/integrante2-por-vencer`
* **Archivo asignado:** `src/app/(tabs)/por-vencer.tsx`

#### 🖥️ Tus 4 Pantallas en Figma:
1. **`PorVencer (Color)`** (Pestaña crítica 15 días activa):
   - Selector de pestañas horizontales superiores: `≤ 15 días (3)`, `≤ 30 días (12)`, `≤ 60 días (8)`.
   - Tarjetas de Medicamentos con borde semántico rojo `#EF4444`:
     - Badge superior: `🔴 VENCE EN 5 DÍAS` (Fondo `#FEE2E2`, Texto `#B91C1C`).
     - Medicamento: **Ibuprofeno 400 mg** - Tabletas.
     - Lote y stock: `Lote: L-2024-001` · `35 uds. disponibles`.
     - Botón directo: `✓ Vender` (Sólido `#1B5E7B`).
     - Botón secundario: `x Descartar` (Outline `#DC2626`).
2. **`PorVencer - Pestaña 30 días (Alivia) (Color)`**:
   - Misma vista pero con la pestaña de 30 días activa y bordes ámbar `#F59E0B`.
   - Badge: `🟡 VENCE EN 22 DÍAS` (Fondo `#FEF3C7`, Texto `#D97706`).
   - Medicamento: **Paracetamol 500 mg** - Frasco Jarabe.
3. **`PorVencer - Pestaña Vacía (Alivia) (Color)`**:
   - Ilustración o ícono de botiquín vacío.
   - Mensaje: *"No hay medicamentos próximos a vencer en este rango temporal"*.
4. **`PopUp confirmar venta (Color)`**:
   - ⚠️ *Ignorar la pantalla de fondo.*
   - Modal centrado que pide confirmación rápida:
     - *"¿Confirmar venta de 2 unidades de Ibuprofeno 400mg?"*
     - Botón Cancelar (gris `#E2E8F0`) y Botón `Confirmar Venta` (`#1B5E7B`).

---

### 👤 INTEGRANTE 3: FICHA DETALLE DEL PRODUCTO Y REGLAS FEFO
* **Rama Git:** `feature/integrante3-detalle-producto`
* **Archivo asignado:** `src/app/detalle/[id].tsx`

#### 🖥️ Tus 4 Pantallas en Figma:
1. **`Detalle del Producto (Color)`** (Estado óptimo):
   - Nombre: **Amoxicilina 500 mg** (Cápsulas) - Lab. Bagó.
   - Stock total grande: `85 Unidades`.
   - **Desglose de Lotes en orden FEFO (First Expired, First Out):**
     - Lote 1 (Prioritario): `L-2024-089` | Vence: 28/11/2026 (Chip verde `SALIDA PRIORITARIA`).
     - Lote 2: `L-2025-012` | Vence: 15/03/2027.
   - Botón fijo inferior: `Registrar Operación / Venta` (`#1B5E7B`).
2. **`Detalle del Producto - Vencido (Alivia) (Color)`**:
   - **Regla de Negocio Crítica:** Si el lote ya expiró, el botón de venta se bloquea (`disabled`).
   - Banner rojo superior: `⚠️ PRODUCTO VENCIDO - NO APTO PARA LA VENTA`.
   - El único botón activo disponible es `Retirar de Estante / Descartar` (`#DC2626`).
3. **`Detalle del Producto - Sin Stock (Alivia) (Color)`**:
   - Stock total: `0 Unidades`.
   - Badge gris: `AGOTADO`.
   - Botón deshabilitado con mensaje: *"Sin existencias para operar"*.
4. **`PopUp retirar de estante (Color)`**:
   - ⚠️ *Ignorar la pantalla de fondo.*
   - Diálogo de advertencia: *"¿Deseas dar de baja este producto del estante físico?"*.
   - Botón `Retirar y Registrar Merma` (`#DC2626`).

---

### 👤 INTEGRANTE 4: OPERACIONES DE VENTA Y DESCARTE (BOTTOMSHEETS)
* **Rama Git:** `feature/integrante4-operaciones-venta`
* **Archivos asignados:** `src/app/venta/[id].tsx` y `src/app/descartar/[id].tsx`

#### 🖥️ Tus 4 Pantallas en Figma:
1. **`Registrar venta bottomsheet (Color)`**:
   - ⚠️ *Ignorar la pantalla de fondo.*
   - Tarjeta que emerge desde abajo (BottomSheet con `borderTopRadius: 20`).
   - Muestra medicamento y el lote FEFO asignado automáticamente.
   - **Control de Cantidad (Stepper):** Botones `[-]` y `[+]` y recuadro central con la cantidad (`1`, `2`, `3`).
   - Botón `Confirmar Venta` (`#1B5E7B`).
2. **`Registrar Venta - Cantidad No Válida (Alivia) (Color)`**:
   - Si Doña Elena intenta vender más unidades de las que tiene el lote disponible (ej. pide 40 y solo hay 35):
   - El recuadro se pone rojo `#EF4444`.
   - Mensaje de error inferior: `Stock insuficiente en este lote (Máximo disponible: 35)`.
3. **`Registrar Venta - Cantidad Cero (Alivia) (Color)`**:
   - Si la cantidad está en `0`:
   - Botón de confirmación desactivado (`opacity: 0.5`) y mensaje: `La cantidad debe ser mayor a 0`.
4. **`Descartar BottomSheet (Color)`**:
   - ⚠️ *Ignorar la pantalla de fondo.*
   - Formulario de baja por merma o vencimiento.
   - **Selector de Motivo Obligatorio:** Radio buttons con opciones:
     - 🔘 *Producto Vencido*
     - 🔘 *Empaque dañado / Frasco roto*
     - 🔘 *Pérdida de cadena de frío*
     - 🔘 *Otro motivo*
   - Botón rojo de peligro: `Confirmar Descarte` (`#DC2626`).

---

### 👤 INTEGRANTE 5: CATÁLOGO Y BÚSQUEDA DE STOCK
* **Rama Git:** `feature/integrante5-stock-fefo`
* **Archivo asignado:** `src/app/(tabs)/stock.tsx`

#### 🖥️ Tus 4 Pantallas en Figma:
1. **`Stock (Color)`** (Inventario general):
   - Barra de búsqueda superior: *"Buscar por nombre, principio activo o código..."*.
   - Botón de filtro rápido junto a la barra (`#1B5E7B`).
   - Lista scrolleable de todos los medicamentos con su stock actual y estado:
     - `Ibuprofeno 400mg` · 85 uds. · Normal
     - `Amoxicilina 500mg` · 12 uds. · Stock Bajo (Chip naranja)
     - `Omeprazol 20mg` · 120 uds. · Normal
2. **`FIltro Stock (Color)`**:
   - Modal o panel lateral de filtros:
     - Por Forma Farmacéutica: `Todas`, `Tabletas`, `Jarabes`, `Inyectables`.
     - Por Estado de Stock: `Con Stock`, `Bajo Stock (<5 uds)`, `Sin Stock`.
     - Por Laboratorio: `Bagó`, `Inti`, `Vita`, `Bayer`.
   - Botón `Aplicar Filtros` (`#1B5E7B`) y `Limpiar`.
3. **`Stock - Autocompletado (Alivia) (Color)`**:
   - Mientras Doña Elena escribe *"Ibu..."*, se despliega una lista desplegable flotante con sugerencias instantáneas.
4. **`Stock - Sin Resultados (Alivia) (Color)`**:
   - Se muestra cuando la búsqueda no coincide con ningún producto.
   - Mensaje: *"No se encontraron productos que coincidan con tu búsqueda"*. Botón para limpiar búsqueda.

---

### 👤 INTEGRANTE 6: HISTORIAL, AUDITORÍA Y BAJAS
* **Rama Git:** `feature/integrante6-historial-bajas`
* **Archivo asignado:** `src/app/(tabs)/historial.tsx`

#### 🖥️ Tus 4 Pantallas en Figma:
1. **`Historial (Color)`** (Movimientos registrados):
   - Filtros de tipo en chips superiores: `Todos`, `Ventas`, `Descartes / Bajas`.
   - Línea de tiempo o lista de auditoría con fecha y hora:
     - Tarjeta Verde: `Venta - 3 uds.` de Ibuprofeno 400mg · Lote L-2024-001 · *Hace 15 min*.
     - Tarjeta Roja: `Descarte - 12 uds.` de Amoxicilina 500mg · Motivo: Vencido · *Hoy 10:30*.
     - Tarjeta Amarilla: `Ajuste de inventario`.
2. **`filtro Historial (Color)`**:
   - Filtro por rango de fechas (Hoy, Esta semana, Este mes) y por tipo de operación.
3. **`Historial - Sin Movimientos (Alivia) (Color)`**:
   - Estado vacío cuando no hay transacciones en el periodo seleccionado.
   - Ícono de reloj/historial y texto: *"No hay movimientos registrados en este rango de fechas"*.
4. **`Descartar BottomSheet - Sin Motivo (Alivia) (Color)`**:
   - Validación de seguridad: Si se presiona *Confirmar Descarte* sin haber marcado un motivo:
   - Los radio buttons se marcan con borde rojo `#EF4444`.
   - Mensaje de alerta: `Debes seleccionar obligatoriamente un motivo para auditar la baja`.

---

## 🚀 6. CHECKLIST DE ENTREGA PARA EL EQUIPO

Antes de juntar las ramas o presentar la demo, cada integrante debe verificar:
- [ ] Tu pantalla usa los colores de `src/constants/theme.ts`.
- [ ] La tipografía es `Plus Jakarta Sans`.
- [ ] Los botones tienen buen tamaño táctil (mínimo 44px de alto para Doña Elena).
- [ ] Los modales/bottomsheets abren como overlays y NO tienen la pantalla vieja de fondo.
- [ ] Tu código no tira errores en terminal al correr `npm start`.
