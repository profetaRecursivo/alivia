# MANIFEST — Figma ↔ Código (ALIVIA)

Archivo Figma: **Trabajo IHC 4** · `kIp1kNoNNVro8kUdHhOuih`

Frames fuente: los **29** nodos cuyo nombre termina en `(COLOR)` (case-insensitive). Los 26
originales se exportaron vía Figma REST API (`GET /v1/files/:key/nodes`). Los frames `534:592`,
`545:1646` y `545:2170` se agregaron el 25/11/2026 (la API ya estaba rate-limited: su JSON se
reconstruyó del árbol de capas) y son **estados del aviso de sincronización**, no pantallas nuevas.

> Los PNG **no** se pudieron bajar por API: el plan Figma es *Starter* y el endpoint de imágenes responde `429 / api_paywall`. Ver `README.md` para el export manual (1 clic por frame, sin tocar el proyecto).

| # | Frame ID | Nombre en Figma | Pantalla canónica | Ruta | Dueño | Estado | Tamaño | Textos | Spec | PNG esperado |
|---:|---|---|---|---|---:|---|---|---|---|---|
| 1 | `519:4861` | Dashboard (COLOR) | Dashboard | `src/app/(tabs)/index.tsx` | 1 | `default` | 390×844 | 25 | [`specs/519-4861.md`](specs/519-4861.md) | `png/519-4861-dashboard.png` |
| 2 | `519:5091` | Dashboard - Sin Alertas (Alivia) (COLOR) | Dashboard sin alertas | `src/app/(tabs)/index.tsx` | 1 | `empty` | 390×844 | 10 | [`specs/519-5091.md`](specs/519-5091.md) | `png/519-5091-dashboard-sin-alertas.png` |
| 3 | `519:4932` | Configuracion (COLOR) | Configuración | `src/app/configuracion.tsx` | 1 | `default` | 390×844 | 27 | [`specs/519-4932.md`](specs/519-4932.md) | `png/519-4932-configuracion.png` |
| 4 | `519:5018` | Modal - Sin Conexión al Servidor (Alivia) (COLOR) | **DESCARTADO** (offline-first) | `—` | — | `descartado` | 390×844 | 10 | [`specs/519-5018.md`](specs/519-5018.md) | `png/519-5018-sin-conexion.png` |
| 5 | `521:32` | PopUp: Venta Registrada con Éxito - Alivia (COLOR) | Venta registrada con éxito | `src/app/venta-exitosa.tsx` | 2 | `success` | 390×884 | 26 | [`specs/521-32.md`](specs/521-32.md) | `png/521-32-venta-exitosa.png` |
| 6 | `519:5706` | PorVencer (COLOR) | Por Vencer · 15 días | `src/app/por-vencer.tsx` | 2 | `default` | 390×844 | 39 | [`specs/519-5706.md`](specs/519-5706.md) | `png/519-5706-por-vencer.png` |
| 7 | `519:6029` | PorVencer - Pestaña 30 días (Alivia) (COLOR) | Por Vencer · 30 días | `src/app/por-vencer.tsx` | 2 | `default` | 390×844 | 39 | [`specs/519-6029.md`](specs/519-6029.md) | `png/519-6029-por-vencer-30.png` |
| 8 | `519:5833` | PorVencer - Pestaña Vacía (Alivia) (COLOR) | Por Vencer · pestaña vacía | `src/app/por-vencer.tsx` | 2 | `empty` | 390×844 | 26 | [`specs/519-5833.md`](specs/519-5833.md) | `png/519-5833-por-vencer-vacio.png` |
| 9 | `519:3884` | Detalles del producto (COLOR) | Detalle del producto | `src/app/detalle/[id].tsx` | 3 | `default` | 390×844 | 23 | [`specs/519-3884.md`](specs/519-3884.md) | `png/519-3884-detalle.png` |
| 10 | `519:3977` | Detalles del producto vencido (COLOR) | Detalle · vencido | `src/app/detalle/[id].tsx` | 3 | `error` | 390×844 | 25 | [`specs/519-3977.md`](specs/519-3977.md) | `png/519-3977-detalle-vencido.png` |
| 11 | `519:4075` | Detalles del producto sin stock (COLOR) | Detalle · sin stock | `src/app/detalle/[id].tsx` | 3 | `empty` | 390×844 | 24 | [`specs/519-4075.md`](specs/519-4075.md) | `png/519-4075-detalle-sin-stock.png` |
| 12 | `519:4175` | PopUp descartar de estante (COLOR) | PopUp · descartar de estante | `src/app/detalle/[id].tsx · ConfirmDialog` | 3 | `confirm` | 390×844 | 17 | [`specs/519-4175.md`](specs/519-4175.md) | `png/519-4175-popup-descartar.png` |
| 13 | `519:3251` | Registrar Venta Bottomsheet (Color) | Registrar venta | `src/app/venta/[id].tsx` | 4 | `default` | 390×844 | 34 | [`specs/519-3251.md`](specs/519-3251.md) | `png/519-3251-registrar-venta.png` |
| 14 | `519:3397` | Registrar Venta - Cantidad No Valida (Color) | Registrar venta · cantidad excedida | `src/app/venta/[id].tsx` | 4 | `error` | 390×844 | 37 | [`specs/519-3397.md`](specs/519-3397.md) | `png/519-3397-venta-cantidad-excedida.png` |
| 15 | `519:3556` | Registrar Venta - Cantidad No Valida (Color) | Registrar venta · cantidad cero | `src/app/venta/[id].tsx` | 4 | `error` | 390×844 | 37 | [`specs/519-3556.md`](specs/519-3556.md) | `png/519-3556-venta-cantidad-cero.png` |
| 16 | `519:3715` | Registrar Venta - Cantidad No Valida (Color) | Descartar · cantidad inválida (referencia) | `src/app/descartar/[id].tsx` | 4 | `error` | 390×844 | 42 | [`specs/519-3715.md`](specs/519-3715.md) | `png/519-3715-venta-variante-rota.png` |
| 17 | `519:4718` | Descartar (Color) | Descartar | `src/app/descartar/[id].tsx` | 4 | `default` | 390×884 | 31 | [`specs/519-4718.md`](specs/519-4718.md) | `png/519-4718-descartar.png` |
| 18 | `519:5930` | Confirmar Venta (Alivia) (COLOR) | PopUp · confirmar venta | `src/app/venta/[id].tsx · ConfirmDialog` | 4 | `confirm` | 390×844 | 17 | [`specs/519-5930.md`](specs/519-5930.md) | `png/519-5930-confirmar-venta.png` |
| 19 | `519:5135` | Stock (Color) | Stock | `src/app/(tabs)/stock.tsx` | 5 | `default` | 358×830 | 36 | [`specs/519-5135.md`](specs/519-5135.md) | `png/519-5135-stock.png` |
| 20 | `519:5314` | Filtro Stock (Color) | Filtro Stock | `src/components/FiltroStockSheet.tsx` | 5 | `default` | 390×844 | 40 | [`specs/519-5314.md`](specs/519-5314.md) | `png/519-5314-filtro-stock.png` |
| 21 | `519:5461` | Stock Autocompletado (Color) | Stock · autocompletado | `src/app/(tabs)/stock.tsx` | 5 | `default` | 390×844 | 19 | [`specs/519-5461.md`](specs/519-5461.md) | `png/519-5461-stock-autocompletado.png` |
| 22 | `519:5597` | Stock sin resultados (Color) | Stock · sin resultados | `src/app/(tabs)/stock.tsx` | 5 | `empty` | 390×830 | 10 | [`specs/519-5597.md`](specs/519-5597.md) | `png/519-5597-stock-sin-resultados.png` |
| 23 | `519:4343` | Hisotial (Color) | Historial | `src/app/historial.tsx` | 6 | `default` | 390×884 | 35 | [`specs/519-4343.md`](specs/519-4343.md) | `png/519-4343-historial.png` |
| 24 | `519:4523` | Filtro Historial (Color) | Filtro Historial | `src/components/FiltroHistorialSheet.tsx` | 6 | `default` | 390×884 | 39 | [`specs/519-4523.md`](specs/519-4523.md) | `png/519-4523-filtro-historial.png` |
| 25 | `519:4263` | Historial Sin movimientos (Color) | Historial · sin movimientos | `src/app/historial.tsx` | 6 | `empty` | 390×884 | 8 | [`specs/519-4263.md`](specs/519-4263.md) | `png/519-4263-historial-vacio.png` |
| 26 | `521:250` | PopUp: Descarte Registrada con Éxito - Alivia (COLOR) | Descarte registrado con éxito | `src/app/descarte-exitoso.tsx` | 6 | `success` | 390×884 | 26 | [`specs/521-250.md`](specs/521-250.md) | `png/521-250-descarte-exitoso.png` |
| 27 | `534:592` | Sincronizando Cambios (Color) | Aviso sync · **Syncing** | `src/components/SyncBanner.tsx` | 4 | `sync` | 390×844 | 41 | [`specs/534-592.md`](specs/534-592.md) | `png/534-592-sync-sincronizando.png` |
| 28 | `545:1646` | Sincronizando Cambios (Color) | Aviso sync · **Offline** | `src/components/SyncBanner.tsx` | 4 | `sync` | 390×844 | 41 | [`specs/545-1646.md`](specs/545-1646.md) | `png/545-1646-sync-offline.png` |
| 29 | `545:2170` | PorVencer (COLOR) | Aviso sync · **Done** (pill) | `src/components/SyncBanner.tsx` | 4 | `sync` | 390×844 | 40 | [`specs/545-2170.md`](specs/545-2170.md) | `png/545-2170-sync-completado.png` |

> Los PNG de los frames de sync ya están exportados y renombrados.

## Frames que NO se implementan como pantalla aparte

- `519:3715` — «Registrar Venta - Cantidad No Valida (Color)»: en realidad es el estado
  **cantidad inválida del sheet Descartar** (título «Descartar», chips de motivo, CTA
  «Confirmar descarte»). No es una ruta propia: Int 4 lo usa como referencia visual del estado
  de error dentro de `descartar/[id].tsx`. Tiene dos bugs de copy que se corrigen al implementar:
  «CANTIDAD A Descartar» y «Ajustar al maximo disponible (200 unidades)» con cantidad 0.
- `519:5018` — «Modal - Sin Conexión al Servidor»: **descartado**. Contradice el offline-first:
  la app nunca bloquea ni dice «El stock no cambió» porque la venta/descarte siempre se guarda
  local. Se conserva el JSON/PNG/spec solo para trazabilidad. **No crear
  `SinConexionDialog.tsx`**. El aviso de conexión es el banner no bloqueante `SyncBanner`
  (Int 4, §9.1 de `PROMPT_AGENTES.md`).
- `534:592`, `545:1646`, `545:2170` — **estados del aviso de sincronización**, no rutas:
  - `534:592` → `syncing`: «Sincronizando cambios…» + progreso.
  - `545:1646` → `offline`: «Sin conexión» + N cambios guardados.
  - `545:2170` → `done`: pill verde «Todo sincronizado».
  El frame `545:2170` se llama «PorVencer» porque el diseñador duplicó la pantalla, pero el
  único elemento nuevo es el pill. El banner de los otros dos frames está dibujado a `y=241`
  (sobre la barra DESHACER); en la app va **fijo debajo de `AppHeader`**. El botón X de los
  frames **se descarta**: el aviso no tiene botones.

## Duplicados aparentes

- `519:3397`, `519:3556` y `519:3715` comparten nombre en Figma. Ya se separaron comparando el
  contenido: 3397 = venta con 250 de 200 (excedida), 3556 = venta con 0, 3715 = descarte con 0.
- `534:592` y `545:1646` se llaman igual («Sincronizando Cambios») pero son estados distintos:
  syncing y offline. `545:2170` se llama «PorVencer» igual que `519:5706`; solo agrega el pill
  «Todo sincronizado». En el export manual, renombrar a mano (ver `png/LEEME.md`).
