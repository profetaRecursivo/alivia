# Fase 0 — Base compartida (lista para copiar)

Estos archivos son los **contratos compartidos** que necesitan los 6 bloques de
`PROMPT_AGENTES.md`. Ya están escritos, verificados con `tsc` y `eslint`, y son la única
implementación permitida de cada contrato.

**Ya están instalados en `src/`**. Esta carpeta es la copia fuente para reinstalar/verificar.
Ningún integrante debe editarlos después.

## Qué incluye

> Los archivos están guardados con extensión `.txt` para que `tsc` no los compile
> mientras viven en `design/`. El instalador los copia con su nombre real.

| Archivo (origen) | Qué resuelve |
|---|---|
| `src/lib/format.ts` | `formatBs`, `formatQty`, `formatQtyShort`, `daysLabel`, `formatDate`, `formatLongDate`, `daysUntil`, `normalizeSearch`. |
| `src/lib/demo-data.ts` | Los 18 lotes, los 5 movimientos, `APP`, `DISCARD_REASONS`, `toneForDays`, `bandForDays`, ubicaciones/formas. |
| `src/lib/repository.ts` | Estado único con `useLots`, `useLot`, `useMovements`, `useMetrics`, `useHydrated`; mutaciones `sellBatch`, `discardBatch`, `undoLast` (5 s); persistencia SQLite + fallback web; encola el outbox y avisa al sync. |
| `src/lib/supabase.ts` | Cliente Supabase real + `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `isSupabaseConfigured`. |
| `src/lib/sync.ts` | Motor outbox → Supabase: `useSync()`, `notifyLocalChange()`, `startSyncWatcher()`; 5.5 s de gracia; reintentos idempotentes. |
| `src/lib/uuid.ts` | `newUuid()` sin dependencias nuevas. |
| `src/components/ui/AppHeader.tsx` | Barra superior (marca + farmacia + ajustes / volver). |
| `src/components/ui/Screen.tsx` | Extensión con prop `header` (barra fija fuera del scroll). |
| `src/components/ui/SuccessDialog.tsx` | Props nuevas `summary` y `note` para los popups de éxito. |
| `src/components/ui/index.ts` | Exporta `AppHeader`. |

`src/lib/preferences.ts` **no** está acá: pertenece al Integrante 1 (Sección 23.1).

## Instalación (una sola vez, lead)

Desde la raíz del repo:

```bash
bash design/fase0/instalar.sh
```

Equivale a copiar los 10 archivos (origen `.txt` → destino real):

```text
design/fase0/src/lib/format.ts.txt             → src/lib/format.ts
design/fase0/src/lib/demo-data.ts.txt          → src/lib/demo-data.ts
design/fase0/src/lib/repository.ts.txt         → src/lib/repository.ts
design/fase0/src/lib/supabase.ts.txt           → src/lib/supabase.ts
design/fase0/src/lib/sync.ts.txt               → src/lib/sync.ts
design/fase0/src/lib/uuid.ts.txt               → src/lib/uuid.ts
design/fase0/src/components/ui/AppHeader.tsx.txt    → src/components/ui/AppHeader.tsx
design/fase0/src/components/ui/Screen.tsx.txt       → src/components/ui/Screen.tsx
design/fase0/src/components/ui/SuccessDialog.tsx.txt → src/components/ui/SuccessDialog.tsx
design/fase0/src/components/ui/index.ts.txt         → src/components/ui/index.ts
```

Verificación obligatoria después de copiar:

```bash
npx tsc --noEmit
npx eslint src
git diff --name-only
```

Debe quedar limpio y solo con esos 10 archivos tocados. Si algo falla, **no** se reparte nada:
se avisa y se corrige acá.

## Comportamiento esperado

- **Android/iOS:** hidrata desde SQLite (`alivia_local_v2.db`), siembra los 18 lotes y los
  5 movimientos la primera vez, y persiste cada venta/descarte en `sales`, `sale_items`,
  `discards`, `inventory_movements` y `sync_outbox`.
- **Web:** `sqlite.web.ts` lanza error a propósito; el repositorio lo captura y trabaja en
  memoria. La vista previa web sirve para layout, no para validar persistencia.
- **Undo:** `undoLast()` solo revierte si pasaron ≤ 5 s; restaura stock, borra el movimiento y
  elimina la fila `PENDING` de `sync_outbox` (`saleId`/`discardId` del payload).
- **Sync real:** `lib/sync.ts` espera 5.5 s (la ventana de undo es 5 s), empuja `sales`/`sale_items`/
  `discards`/`inventory_movements` a Supabase y actualiza `batches.current_stock`. Marca
  `SYNCED` solo si todo salió bien; si no, queda `PENDING` y el banner muestra `offline`.
- **Backend:** `.env` con URL + publishable key; los 18 lotes se siembran con
  `scripts/seed-supabase.cjs` (secret key solo por env, nunca en la app).
- **Conteos:** siempre derivados de los lotes; nunca hardcodeados. `total` = 148 productos.
- **Fechas:** relativas a hoy; el dataset nunca contiene un año fijo.

## Reglas para los integrantes

1. Importar desde `@/lib/repository`, `@/lib/format`, `@/lib/demo-data` y `@/components/ui`.
2. No editar estos archivos: si falta un dato o una función, se pide al lead.
3. No crear arrays de lotes ni movimientos propios.
4. No duplicar `AppHeader`, `Card`, `Badge`, `Button`, `Sheet`, `ConfirmDialog`, `SuccessDialog`.
