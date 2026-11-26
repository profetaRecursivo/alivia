# design/figma — Congelado visual de ALIVIA

Esta carpeta es **solo lectura** para los integrantes. Contiene la verdad visual del proyecto
exportada directamente desde Figma (`Trabajo IHC 4`, file key `kIp1kNoNNVro8kUdHhOuih`).

| Carpeta / archivo | Qué es |
|---|---|
| `MANIFEST.md` | Tabla maestra: frame ID → pantalla → ruta → dueño → spec → PNG esperado. |
| `TOKENS_AUDIT.md` | Todo color, tamaño, peso y radio que aparece en Figma, comparado con `theme.ts`. |
| `specs/<id>.md` | Medidas y copy exactos de cada frame (árbol, textos, colores). |
| `json/<id>.json` | Nodo crudo de la API de Figma (geometría, fills, estilos, efectos). |
| `png/` | Capturas 1x. **Pendientes de export manual** (ver abajo). |

---

## 1. Regla de fidelidad

Figma es la verdad **visual**. La implementación es una transcripción, no una interpretación.

Se copia exacto:

- orden vertical y jerarquía de bloques;
- copy (con las correcciones de `PROMPT_AGENTES.md`);
- colores (siempre vía `theme.ts`);
- tamaños y pesos tipográficos (vía `Typography.scale`);
- radios, bordes, paddings, gaps y alturas;
- iconos (equivalente Lucide más cercano);
- distribución de columnas y énfasis.

No se copia:

- el marco de 390 × 844 con barra de estado y tab bar dibujadas (la app usa las nativas);
- las fuentes `Inter`, `FreeSans`, `Liberation Sans`, `Nimbus Sans` (basura de migración);
- los títulos de 24/26 px (se normalizan a `h1` 22);
- los frames con nombre duplicado o roto.

### Adaptación 390 → 384 dp

| | Figma | Galaxy A56 (objetivo) |
|---|---|---|
| Ancho | 390 dp | **384 dp** |
| Alto | 844 dp | **832 dp** |
| Gutter | 16–20 dp | **16 dp** (`Spacing.gutter`) |
| Ancho útil | 358 dp | **352 dp** |

El layout es flexible: absorbe los 6 dp en el contenido. **Prohibido escalar** fuentes, radios,
iconos o áreas táctiles. Tolerancia aceptada: ≤ 6 dp de ancho. Todo lo demás debe coincidir.

---

## 2. Cómo leer un `spec`

Cada spec trae:

1. **Metadatos:** frame ID, tamaño, ruta destino, dueño, estado.
2. **Secciones de primer nivel:** tipo, nombre, `x`, `y`, `w`, `h`, fill y radio.
3. **Árbol de capas:** coordenadas relativas al frame, tamaño y color.
4. **Inventario de texto:** cada string con `x`, `y`, tamaño, peso, line-height y color.
5. **Colores y tipografías** usados.
6. **Advertencias** de copy o estructura.
7. **Cómo implementar** el frame.

Las coordenadas son referencia, no CSS. En React Native se traducen a `flexDirection`, `gap`,
`padding` y anchos relativos. Ejemplo: una tarjeta en `y=274`, `353×102`, `r=13` se implementa
como `Card` con `borderRadius: Radius.lg`, `minHeight: 102`, `marginTop: Spacing.lg` y
`padding: Spacing.md`.

Los `VECTOR` de Figma son iconos dibujados a mano. No se replican: se sustituyen por el icono
Lucide indicado en `PROMPT_AGENTES.md`.

---

## 3. PNG: por qué faltan y cómo completarlos

La API de Figma devolvió `429` con `x-figma-rate-limit-type: low` y
`retry-after: 399448` para `GET /v1/images`. El plan del archivo es **Starter** y la
exportación de imágenes por API está bloqueada (`api_paywall`). El JSON de los 26 frames
originales se descargó completo; el de los 3 frames de sync se reconstruyó del árbol de capas
porque la API quedó limitada. Ambos son la fuente de los specs.

### Export manual (5 minutos, una sola vez)

1. Abrir el archivo en Figma Desktop o web.
2. En el panel de capas, seleccionar los 29 frames listados en `MANIFEST.md`
   (todos los que terminan en `(COLOR)`).
3. Panel derecho → **Export** → `+` → **PNG**, escala **1x** → **Export 29 layers**.
4. Descomprimir el `.zip` dentro de `design/figma/png/`.
5. Renombrar con el script:

```bash
python3 design/figma/tools/renombrar_png.py design/figma/png
```

El script usa el nombre de capa de Figma y lo mapea al nombre esperado
(`<id>-<slug>.png`). Acepta el sufijo ` (COLOR)` / ` (Color)` / ` (Alivia)`, los acentos y
espacios extra.

> Los tres frames de sincronización (`534:592`, `545:1646`, `545:2170`) se exportan también;
son estados del banner, no pantallas. Si no se exportan, los specs ya tienen todo lo necesario.

> Los tres frames «Registrar Venta - Cantidad No Valida» (`519:3397`, `519:3556`, `519:3715`)
> se llaman igual en Figma. El script **no adivina**: los detecta, los deja con su nombre y te
> pide renombrarlos a mano según `MANIFEST.md`. Son la única excepción.

> Si preferís no exportar: los `specs/*.md` ya contienen el 100 % de textos, colores, tamaños y
> posiciones. El PNG es para la comparación visual final, no para implementar.

### Actualizar el congelado cuando Figma cambie

```bash
FIGMA_TOKEN=$(cat ~/.config/alivia/figma_token) \
  python3 design/figma/tools/exportar_figma.py
```

El script no agrega dependencias al proyecto (solo `urllib` de Python 3). Vuelve a generar
`json/`, `specs/`, `MANIFEST.md` y `TOKENS_AUDIT.md`. Los PNG siguen siendo manuales.

> ⚠️ El `MANIFEST.md` actual tiene secciones escritas a mano (frames descartados, notas de
> sync). El generador las reemplaza por una tabla plana: si lo volvés a correr, restaurá esas
> secciones desde Git o a mano. Los `specs/` de los 3 frames de sync también se regenerarían
> sin las notas de implementación; conservá las actuales.

---

## 4. Comparación visual (Definition of Done)

Cada integrante entrega, junto con su pantalla:

1. Captura en el Galaxy A56 físico (o en Expo Go sobre el A56).
2. Comparación lado a lado con el PNG de Figma.
3. Declaración de desviaciones: `ninguna` o lista concreta con justificación.

Sin ese par de capturas, la pantalla no se acepta.

---

## 5. Advertencias conocidas de Figma

- `519:5135` mide 358 × 830 y `519:5597` 390 × 830: medidas equivocadas. El canvas canónico es
  **390 × 844**; la app renderiza **384 × 832**.
- `519:3715` es el estado «cantidad inválida» del sheet Descartar (no una pantalla aparte).
  Se usa como referencia para `descartar/[id].tsx`; corregir «CANTIDAD A Descartar» y
  «Ajustar al maximo disponible» con cantidad 0.
- `519:5314` (Filtro Stock) muestra el header «Historial»: error de copy.
- `519:4861` dice «ATÉNCION INMEDIATA»: error de copy.
- Fechas «29 de Mayo, 2025»: reemplazadas por fechas relativas.
- Conteos 3/4/12 inconsistentes: se calculan en runtime desde los datos.
- `519:5018` (Modal sin conexión) quedó **descartado** por el offline-first. No se implementa
  como modal; el aviso es el banner `SyncBanner` (Int 4). Se conserva el spec por trazabilidad.
- `534:592`, `545:1646`, `545:2170`: son **estados del aviso de sincronización**, no pantallas.
  - `534:592` = `syncing`; `545:1646` = `offline` (aunque su capa se llame «Sincronizando»);
    `545:2170` = `done` (duplica Por Vencer solo para mostrar el pill verde).
  - El banner está dibujado a `y=241`, sobre la barra DESHACER. En la app va fijo debajo de
    `AppHeader`; no se replica esa posición.
  - El botón X de los frames **se omite**: el aviso no tiene botones ni cierre manual.
