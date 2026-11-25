# TOKENS AUDIT — Figma vs `theme.ts`

Generado automáticamente desde los 26 frames `(COLOR)`. Sirve para que ningún agente invente un hex o un tamaño.

## Regla

**Figma (Color) > `theme.ts` > guía de diseño > prompts viejos.**
Si un valor de Figma no existe en `theme.ts`, se agrega al token central (lo hace el lead). Nunca se escribe suelto en una pantalla.

## Tipografías

| Familia | Apariciones | Decisión |
|---|---:|---|
| Plus Jakarta Sans | 495 | ✅ usar (`Typography.fontFamily*`) |
| Inter | 154 | ❌ residuo de migración → normalizar a Plus Jakarta Sans |
| FreeSans | 25 | ❌ residuo de migración → normalizar a Plus Jakarta Sans |
| Liberation Sans | 16 | ❌ residuo de migración → normalizar a Plus Jakarta Sans |
| Nimbus Sans | 12 | ❌ residuo de migración → normalizar a Plus Jakarta Sans |

## Tamaños de fuente

| px | Apariciones | Token `Typography.scale` |
|---:|---:|---|
| 10 | 23 | micro |
| 11 | 114 | label |
| 12 | 242 | metadata |
| 13 | 68 | body |
| 14 | 94 | button |
| 15 | 37 | price / cta |
| 16 | 43 | h2 |
| 17 | 3 | — (one-off) |
| 18 | 26 | brand |
| 19 | 1 | — (one-off popup) |
| 20 | 17 | modalTitle |
| 22 | 16 | h1 |
| 24 | 8 | — (título de pantalla en Figma; canónico = h1 22) |
| 26 | 1 | — (one-off Autocompletado) |
| 28 | 4 | display |
| 32 | 1 | — (solo glifo ✓ gigante) |
| 36 | 4 | hero |

## Pesos

| Peso | Apariciones | Token |
|---:|---:|---|
| 400 | 134 | fontFamilyRegular |
| 500 | 67 | fontFamilyMedium |
| 600 | 101 | fontFamilySemiBold |
| 700 | 382 | fontFamilyBold |
| 800 | 18 | fontFamilyBold (no usar 800; normalizar a 700) |

## Colores

| Hex | Apariciones | ¿Existe en `theme.ts`? |
|---|---:|---|
| `#FFFFFF` | 404 | ✅ |
| `#0F172A` | 269 | ✅ |
| `#E2E8F0` | 208 | ✅ |
| `#1B5E7B` | 200 | ✅ |
| `#5F6B7A` | 153 | ✅ |
| `#1A1D21` | 144 | ✅ |
| `#64748B` | 122 | ✅ |
| `#F8FAFC` | 59 | ✅ |
| `#D32F2F` | 58 | ✅ |
| `#A3A3A3` | 43 | ⚠️ no |
| `#000000` | 41 | ✅ |
| `#E65100` | 35 | ✅ |
| `#F1F5F9` | 34 | ✅ |
| `#B91C1C` | 33 | ✅ |
| `#1E293B` | 27 | ✅ |
| `#F7F9FB` | 24 | ✅ |
| `#E5E5E5` | 23 | ✅ |
| `#94A3B8` | 22 | ✅ |
| `#262626` | 21 | ⚠️ no |
| `#404040` | 21 | ⚠️ no |
| `#334155` | 21 | ✅ |
| `#18181B` | 20 | ⚠️ no |
| `#16A34A` | 19 | ✅ |
| `#CBD5E1` | 18 | ✅ |
| `#475569` | 17 | ⚠️ no |
| `#171717` | 15 | ⚠️ no |
| `#FEE2E2` | 15 | ✅ |
| `#E0F2F7` | 14 | ✅ |
| `#FEF2F2` | 12 | ⚠️ no |
| `#0E3A4D` | 9 | ✅ |
| `#166534` | 8 | ✅ |
| `#4B5563` | 8 | ⚠️ no |
| `#D4D4D4` | 8 | ⚠️ no |
| `#0369A1` | 8 | ✅ |
| `#525252` | 7 | ⚠️ no |
| `#FFE4E6` | 7 | ⚠️ no |
| `#FFEBEE` | 7 | ⚠️ no |
| `#FECACA` | 7 | ⚠️ no |
| `#F3F4F6` | 6 | ⚠️ no |
| `#0288D1` | 6 | ⚠️ no |
| `#FFCDD2` | 6 | ⚠️ no |
| `#991B1B` | 6 | ⚠️ no |
| `#FEF3C7` | 5 | ✅ |
| `#737373` | 5 | ⚠️ no |
| `#DCFCE7` | 5 | ✅ |
| `#E4E4E7` | 5 | ⚠️ no |
| `#020617` | 5 | ⚠️ no |
| `#D1D5DB` | 5 | ⚠️ no |
| `#C62828` | 5 | ⚠️ no |
| `#D1D9E0` | 5 | ⚠️ no |
| `#E0F2FE` | 5 | ✅ |
| `#27272A` | 4 | ⚠️ no |
| `#F1F3F5` | 4 | ⚠️ no |
| `#10B981` | 4 | ⚠️ no |
| `#BE123C` | 4 | ⚠️ no |
| `#065F46` | 4 | ⚠️ no |
| `#EF4444` | 4 | ✅ |
| `#D97706` | 3 | ✅ |
| `#1E1E1E` | 3 | ⚠️ no |
| `#2E7D32` | 3 | ⚠️ no |
| `#71717A` | 3 | ⚠️ no |
| `#ECFDF5` | 3 | ⚠️ no |
| `#D1FAE5` | 3 | ⚠️ no |
| `#6B7280` | 3 | ⚠️ no |
| `#0B1320` | 2 | ⚠️ no |
| `#E11D48` | 2 | ⚠️ no |
| `#B45309` | 2 | ⚠️ no |
| `#E5E7EB` | 2 | ⚠️ no |
| `#E8F4F8` | 2 | ✅ |
| `#B5B9B7` | 1 | ⚠️ no |
| `#515D56` | 1 | ⚠️ no |
| `#F7F8FA` | 1 | ⚠️ no |
| `#D2D6DC` | 1 | ⚠️ no |
| `#23272A` | 1 | ⚠️ no |
| `#A1A1AA` | 1 | ⚠️ no |
| `#52525B` | 1 | ⚠️ no |
| `#3F3F46` | 1 | ⚠️ no |
| `#F9FAFB` | 1 | ⚠️ no |
| `#1F2937` | 1 | ⚠️ no |
| `#FEF1F0` | 1 | ⚠️ no |
| `#CDE5EE` | 1 | ⚠️ no |
| `#BCE0ED` | 1 | ⚠️ no |
| `#F43F5E` | 1 | ⚠️ no |
| `#FAFAFA` | 1 | ⚠️ no |
| `#F5F5F5` | 1 | ⚠️ no |

## Radios

| Radio | Apariciones | Token |
|---:|---:|---|
| 9999 | 136 | Radius.pill |
| 12 | 61 | Radius.lg |
| 14 | 61 | — (≈ lg; normalizar a 12) |
| 16 | 57 | Radius.xl |
| 15 | 37 | — (≈ lg; normalizar a 12) |
| 8 | 23 | Radius.md |
| 13 | 22 | — (≈ lg; normalizar a 12) |
| 2 | 15 | Spacing.half / detalles |
| 44 | 10 | — (círculo de icono) |
| 4 | 10 | — |
| 32 | 7 | — (marco de pantalla, no se usa) |
| 24 | 6 | — (one-off) |
| 36 | 4 | — (one-off) |
| 6 | 3 | Radius.sm |
| 28 | 2 | — (one-off) |
| 1 | 2 | — |
| 40 | 1 | — |
| 10 | 1 | — |

## Decisiones de normalización (obligatorias)

1. **Fuente:** toda la app usa Plus Jakarta Sans. `Inter`, `FreeSans`, `Liberation Sans` y `Nimbus Sans` de Figma son basura de migración: no se replican.
2. **Títulos de pantalla:** Figma alterna 20/22/24/26 para el mismo rol. Canónico: `Typography.scale.h1` (22) + `fontFamilyBold`.
3. **Títulos de sheet/modal/popup:** Figma alterna 18/19/20. Canónico: `Typography.scale.modalTitle` (20).
4. **Peso 800:** no existe en el sistema. Se normaliza a 700 (`fontFamilyBold`).
5. **Radios 13/14/15:** son el mismo radio de tarjeta dibujado a mano. Canónico: `Radius.lg` (12) para tarjetas y `Radius.md` (8) para botones/inputs.
6. **Colores no tokenizados:** ver tabla. Se agregan a `theme.ts` solo si son semánticos (no decorativos).
7. **Verde `#2E7D32` / `#065F46`:** aparecen en detalles de éxito; el token oficial es `success.text` `#166534`.
