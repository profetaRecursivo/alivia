#!/usr/bin/env python3
"""
Congela Figma -> repo. SOLO LECTURA sobre Figma.

Uso:
    FIGMA_TOKEN=figd_xxx python3 design/figma/tools/exportar_figma.py
    # o guardá el token en ~/.config/alivia/figma_token

Genera:
    design/figma/json/<id>.json
    design/figma/specs/<id>.md
    design/figma/MANIFEST.md
    design/figma/TOKENS_AUDIT.md

No toca package.json, node_modules ni el código de la app.
Los PNG se exportan a mano (ver design/figma/README.md).
"""
import collections
import glob
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

KEY = 'kIp1kNoNNVro8kUdHhOuih'
BASE = 'https://api.figma.com/v1'
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)                 # design/figma
REPO = os.path.dirname(os.path.dirname(ROOT))  # raíz del proyecto
JSON_DIR = os.path.join(ROOT, 'json')
SPEC_DIR = os.path.join(ROOT, 'specs')

ROWS = [
    ('519:4861', 'dashboard', 'Dashboard', 'src/app/(tabs)/index.tsx', '1', 'default'),
    ('519:5091', 'dashboard-sin-alertas', 'Dashboard sin alertas', 'src/app/(tabs)/index.tsx', '1', 'empty'),
    ('519:4932', 'configuracion', 'Configuración', 'src/app/configuracion.tsx', '1', 'default'),
    ('519:5018', 'sin-conexion', 'Modal sin conexión (DESCARTADO)', '—', '—', 'descartado'),
    ('521:32', 'venta-exitosa', 'Venta registrada con éxito', 'src/app/venta-exitosa.tsx', '2', 'success'),
    ('519:5706', 'por-vencer', 'Por Vencer · 15 días', 'src/app/por-vencer.tsx', '2', 'default'),
    ('519:6029', 'por-vencer-30', 'Por Vencer · 30 días', 'src/app/por-vencer.tsx', '2', 'default'),
    ('519:5833', 'por-vencer-vacio', 'Por Vencer · pestaña vacía', 'src/app/por-vencer.tsx', '2', 'empty'),
    ('519:3884', 'detalle', 'Detalle del producto', 'src/app/detalle/[id].tsx', '3', 'default'),
    ('519:3977', 'detalle-vencido', 'Detalle · vencido', 'src/app/detalle/[id].tsx', '3', 'error'),
    ('519:4075', 'detalle-sin-stock', 'Detalle · sin stock', 'src/app/detalle/[id].tsx', '3', 'empty'),
    ('519:4175', 'popup-descartar', 'PopUp · descartar de estante', 'src/app/detalle/[id].tsx · ConfirmDialog', '3', 'confirm'),
    ('519:3251', 'registrar-venta', 'Registrar venta', 'src/app/venta/[id].tsx', '4', 'default'),
    ('519:3397', 'venta-cantidad-excedida', 'Registrar venta · cantidad excedida', 'src/app/venta/[id].tsx', '4', 'error'),
    ('519:3556', 'venta-cantidad-cero', 'Registrar venta · cantidad cero', 'src/app/venta/[id].tsx', '4', 'error'),
    ('519:3715', 'descartar-cantidad-cero', 'Descartar · cantidad inválida (solo referencia)', 'src/app/descartar/[id].tsx', '4', 'error'),
    ('519:4718', 'descartar', 'Descartar', 'src/app/descartar/[id].tsx', '4', 'default'),
    ('519:5930', 'confirmar-venta', 'PopUp · confirmar venta', 'src/app/venta/[id].tsx · ConfirmDialog', '4', 'confirm'),
    ('519:5135', 'stock', 'Stock', 'src/app/(tabs)/stock.tsx', '5', 'default'),
    ('519:5314', 'filtro-stock', 'Filtro Stock', 'src/components/FiltroStockSheet.tsx', '5', 'default'),
    ('519:5461', 'stock-autocompletado', 'Stock · autocompletado', 'src/app/(tabs)/stock.tsx', '5', 'default'),
    ('519:5597', 'stock-sin-resultados', 'Stock · sin resultados', 'src/app/(tabs)/stock.tsx', '5', 'empty'),
    ('519:4343', 'historial', 'Historial', 'src/app/historial.tsx', '6', 'default'),
    ('519:4523', 'filtro-historial', 'Filtro Historial', 'src/components/FiltroHistorialSheet.tsx', '6', 'default'),
    ('519:4263', 'historial-vacio', 'Historial · sin movimientos', 'src/app/historial.tsx', '6', 'empty'),
    ('521:250', 'descarte-exitoso', 'Descarte registrado con éxito', 'src/app/descarte-exitoso.tsx', '6', 'success'),
    ('534:592', 'sync-sincronizando', 'Aviso sync · Syncing', 'src/components/SyncBanner.tsx', '4', 'sync'),
    ('545:1646', 'sync-offline', 'Aviso sync · Offline', 'src/components/SyncBanner.tsx', '4', 'sync'),
    ('545:2170', 'sync-completado', 'Aviso sync · Done (pill)', 'src/components/SyncBanner.tsx', '4', 'sync'),
]

ANOM = {
    '519:4861': ['«ATÉNCION INMEDIATA» → «ATENCIÓN INMEDIATA» (typo en Figma).'],
    '519:3884': ['«Fecha límite: 29 de Mayo, 2025» → fecha relativa canónica.'],
    '519:3977': ['«Fecha límite: 29 de Mayo, 2025» → fecha relativa canónica.'],
    '519:4075': ['«Fecha límite: 29 de Mayo, 2025» → fecha relativa canónica.'],
    '519:4343': ['Nombre de capa «Hisotial» (typo, no afecta UI).'],
    '519:4523': ['Header visible «Historial» + título de sheet «Filtros»: ver copy canónico.'],
    '519:5314': ['El header visible dice «Historial» dentro de Filtro Stock: error de copy. Usar «Stock».'],
    '519:3715': ['Referencia del estado «cantidad inválida» del sheet Descartar, no una pantalla aparte.',
                  'Copy a corregir: «CANTIDAD A Descartar» → «CANTIDAD A DESCARTAR *».',
                  'Copy a corregir: «Ajustar al maximo disponible (200 unidades)» con cantidad 0 → «Usar 1 unidad».'],
    '519:3556': ['«Ajustar al mínimo disponible (200 unidades)» es incorrecto para cantidad 0.'],
    '519:5018': ['DESCARTADO por offline-first: no crear SinConexionDialog ni modal de red.'],
    '534:592': ['Estado syncing del aviso global; el banner va debajo de AppHeader, no en y=241.',
                  'El botón X del frame se descarta: el aviso no tiene botones.'],
    '545:1646': ['El nombre del frame dice «Sincronizando», pero el contenido es el estado offline.',
                  'El botón X del frame se descarta: el aviso no tiene botones.'],
    '545:2170': ['Duplica PorVencer solo para mostrar el pill «Todo sincronizado»; no es una pantalla.'],
}

SCALE_MAP = {36: 'hero', 28: 'display', 24: '— (canónico: h1 22)', 22: 'h1', 20: 'modalTitle',
             18: 'brand', 16: 'h2', 15: 'price / cta', 14: 'button', 13: 'body', 12: 'metadata',
             11: 'label', 10: 'micro', 32: '— (glifo ✓)', 26: '— (one-off)', 19: '— (one-off)',
             17: '— (one-off)', 0: '—'}
RADIUS_MAP = {9999: 'Radius.pill', 20: 'Radius.sheet', 16: 'Radius.xl', 12: 'Radius.lg',
              8: 'Radius.md', 6: 'Radius.sm', 44: '— (círculo de icono)',
              15: '— (≈ lg; normalizar a 12)', 13: '— (≈ lg; normalizar a 12)',
              14: '— (≈ lg; normalizar a 12)', 32: '— (marco, no se usa)', 24: '— (one-off)',
              36: '— (one-off)', 28: '— (one-off)', 2: 'detalle', 1: '—', 4: '—', 10: '—', 40: '—'}


def token():
    t = os.environ.get('FIGMA_TOKEN')
    if not t:
        path = os.path.expanduser('~/.config/alivia/figma_token')
        if os.path.exists(path):
            t = open(path).read().strip()
    if not t:
        sys.exit('Falta FIGMA_TOKEN o ~/.config/alivia/figma_token')
    return t


def api(path, params, tries=4):
    url = BASE + path + '?' + urllib.parse.urlencode(params)
    for attempt in range(tries):
        req = urllib.request.Request(url, headers={'X-Figma-Token': token()})
        try:
            with urllib.request.urlopen(req, timeout=240) as r:
                return json.loads(r.read().decode())
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503) and attempt < tries - 1:
                time.sleep(3 * (attempt + 1))
                continue
            raise
    raise RuntimeError('API falló: ' + path)


def hexc(c):
    if not c:
        return None
    return '#%02X%02X%02X' % (round(c.get('r', 0) * 255), round(c.get('g', 0) * 255), round(c.get('b', 0) * 255))


def paints(arr):
    out = []
    for p in arr or []:
        if p.get('visible') is False:
            continue
        t = p.get('type')
        if t == 'SOLID':
            out.append(hexc(p.get('color')))
        elif t and t.startswith('GRADIENT'):
            out.append('GRADIENTE')
        elif t == 'IMAGE':
            out.append('IMAGEN')
    return out


def walk(n):
    yield n
    for c in n.get('children', []):
        yield from walk(c)


def esc(s):
    return (s or '').replace('|', '\\|').replace('\n', ' ⏎ ')


def main():
    os.makedirs(JSON_DIR, exist_ok=True)
    os.makedirs(SPEC_DIR, exist_ok=True)

    listing = api('/files/%s' % KEY, {'depth': 2})
    frames = [n for n in walk(listing['document'])
              if isinstance(n.get('name'), str) and n['name'].strip().lower().endswith('(color)')]
    ids = [f['id'] for f in frames]
    print('frames (COLOR):', len(frames))
    nodes = api('/files/%s/nodes' % KEY, {'ids': ','.join(ids), 'geometry': 'paths'})['nodes']

    meta = []
    for f in frames:
        node = nodes.get(f['id'], {}).get('document')
        if not node:
            print('MISSING', f['id'])
            continue
        safe = f['id'].replace(':', '-')
        with open(os.path.join(JSON_DIR, safe + '.json'), 'w') as fh:
            json.dump(node, fh, ensure_ascii=False)
        bb = node.get('absoluteBoundingBox') or {}
        meta.append({'id': f['id'], 'safe': safe, 'w': round(bb.get('width', 0)), 'h': round(bb.get('height', 0))})

    rows_by_id = {r[0]: r for r in ROWS}
    allcolors = collections.Counter()
    allsizes = collections.Counter()
    allweights = collections.Counter()
    allradii = collections.Counter()
    allfonts = collections.Counter()
    manifest = []

    for m in meta:
        fid = m['id']
        row = rows_by_id.get(fid)
        node = json.load(open(os.path.join(JSON_DIR, m['safe'] + '.json')))
        fa = node['absoluteBoundingBox']
        W, H = m['w'], m['h']
        slug, canon, route, owner, state = (row[1], row[2], row[3], row[4], row[5]) if row else ('sin-asignar', node['name'], '—', '—', '—')

        nodes_list = list(walk(node))
        texts, colors, fonts, radii = [], collections.Counter(), collections.Counter(), collections.Counter()
        for x in nodes_list:
            for c in paints(x.get('fills')) + paints(x.get('strokes')):
                if c and c not in ('IMAGEN', 'GRADIENTE'):
                    colors[c] += 1
            r = x.get('cornerRadius')
            if isinstance(r, (int, float)) and r > 0:
                radii[round(r)] += 1
            if x.get('type') == 'TEXT':
                st = x.get('style') or {}
                fam, wt, fs = st.get('fontFamily'), st.get('fontWeight'), round(st.get('fontSize') or 0)
                if fam:
                    fonts[fam] += 1
                if wt:
                    allweights[wt] += 1
                if fs:
                    allsizes[fs] += 1
                bb = x.get('absoluteBoundingBox') or {}
                txt = (x.get('characters') or '').strip()
                if txt:
                    texts.append({'x': round(bb.get('x', 0) - fa['x']), 'y': round(bb.get('y', 0) - fa['y']),
                                  't': txt, 'fs': fs, 'wt': wt, 'lh': round(st.get('lineHeightPx') or 0),
                                  'color': (paints(x.get('fills')) or ['—'])[0]})
        allcolors.update(colors)
        allradii.update(radii)
        allfonts.update(fonts)

        L = [f'# {fid} — {canon}', '', f'- **Frame Figma:** `{node.get("name")}`',
             f'- **Tamaño del frame:** {W} × {H} dp', f'- **Ruta destino:** `{route}`',
             f'- **Dueño:** Integrante {owner}', f'- **Estado:** `{state}`',
             f'- **JSON:** [`../json/{m["safe"]}.json`](../json/{m["safe"]}.json)',
             f'- **PNG:** `../png/{fid.replace(":", "-")}-{slug}.png`', '',
             '> Coordenadas relativas al frame. Unidades = dp. Los vectores decorativos se omiten: '
             'se reemplazan por `lucide-react-native`.', '',
             '## Secciones de primer nivel', '', '| Tipo | Nombre | x | y | w | h | fill | radio |',
             '|---|---|---:|---:|---:|---:|---|---:|']
        for c in node.get('children', []):
            bb = c.get('absoluteBoundingBox') or {}
            fills = paints(c.get('fills'))
            L.append(f"| {c.get('type')} | {esc(c.get('name'))} | {round(bb.get('x', 0) - fa['x'])} | "
                     f"{round(bb.get('y', 0) - fa['y'])} | {round(bb.get('width', 0))} | {round(bb.get('height', 0))} | "
                     f"{fills[0] if fills else '—'} | {c.get('cornerRadius') or '—'} |")

        L += ['', '## Árbol de capas', '', '```']

        def emit(x, depth):
            if depth > 9:
                return
            bb = x.get('absoluteBoundingBox') or {}
            st = x.get('style') or {}
            fills = paints(x.get('fills'))
            extra = f" «{esc((x.get('characters') or '').strip())[:80]}» {round(st.get('fontSize') or 0)}/{st.get('fontWeight')} {fills[0] if fills else ''}" \
                if x.get('type') == 'TEXT' else (f" {fills[0]}" if fills else '')
            r = x.get('cornerRadius')
            if isinstance(r, (int, float)) and r > 0:
                extra += f' r={round(r)}'
            L.append('  ' * depth + f"{x.get('type')} {x.get('name')!r} "
                     f"[{round(bb.get('x', 0) - fa['x'])},{round(bb.get('y', 0) - fa['y'])}] "
                     f"{round(bb.get('width', 0))}×{round(bb.get('height', 0))}{extra}")
            for c in x.get('children', []):
                emit(c, depth + 1)

        emit(node, 0)
        L += ['```', '', f'## Inventario de texto ({len(texts)})', '',
              '| y | x | Texto | px | peso | lh | color |', '|---:|---:|---|---:|---:|---:|---|']
        for t in sorted(texts, key=lambda v: (v['y'], v['x'])):
            L.append(f"| {t['y']} | {t['x']} | {esc(t['t'])} | {t['fs']} | {t['wt']} | {t['lh']} | {t['color']} |")
        L += ['', '## Colores usados en el frame', '',
              ' '.join(f'`{c}`×{n}' for c, n in colors.most_common()), '',
              '## Tipografías detectadas', '',
              ', '.join(f'{f} ({n})' for f, n in fonts.most_common()), '']
        bad = [f for f in fonts if f != 'Plus Jakarta Sans']
        if bad:
            L += [f'> ⚠️ Fuentes distintas de Plus Jakarta Sans: {", ".join(bad)}. Normalizar.', '']
        if fid in ANOM:
            L += ['## Advertencias de este frame', ''] + [f'- {a}' for a in ANOM[fid]] + ['']
        L += ['## Cómo implementar este frame', '',
              '1. Replicar el orden vertical, la jerarquía y los textos exactos.',
              '2. Sustituir coordenadas absolutas por layout estándar conservando anchos, altos, radios y colores.',
              '3. Reemplazar iconos vectoriales por el equivalente Lucide.',
              '4. Aplicar la regla 390→384: ancho útil 352 dp; nada se escala.',
              '5. Verificar con el checklist de fidelidad de `PROMPT_AGENTES.md`.', '']
        open(os.path.join(SPEC_DIR, m['safe'] + '.md'), 'w').write('\n'.join(L))

        manifest.append(f"| `{fid}` | {esc(node.get('name'))} | {canon} | `{route}` | {owner} | `{state}` | "
                        f"{W}×{H} | {len(texts)} | [`specs/{m['safe']}.md`](specs/{m['safe']}.md) | "
                        f"`png/{fid.replace(':', '-')}-{slug}.png` |")

    head = ['# MANIFEST — Figma ↔ Código (ALIVIA)', '',
            f'Archivo Figma: **Trabajo IHC 4** · `{KEY}`', '',
            'Frames fuente: nodos terminados en `(COLOR)`. Exportado con `design/figma/tools/exportar_figma.py`.',
            '', '| Frame ID | Nombre en Figma | Pantalla canónica | Ruta | Dueño | Estado | Tamaño | Textos | Spec | PNG esperado |',
            '|---|---|---|---|---:|---|---|---|---|---|'] + manifest + ['']
    open(os.path.join(ROOT, 'MANIFEST.md'), 'w').write('\n'.join(head))

    theme = open(os.path.join(REPO, 'src/constants/theme.ts')).read() if os.path.exists(os.path.join(REPO, 'src/constants/theme.ts')) else ''
    theme_colors = {c.strip("'").upper() for c in re.findall(r"'#[0-9A-Fa-f]{6}'", theme)}

    T = ['# TOKENS AUDIT — Figma vs `theme.ts`', '',
         '**Figma (Color) > `theme.ts` > guía de diseño > prompts viejos.**', '',
         '## Tipografías', '', '| Familia | Apariciones | Decisión |', '|---|---:|---|']
    for f, n in allfonts.most_common():
        T.append(f'| {f} | {n} | {"✅ usar" if f == "Plus Jakarta Sans" else "❌ normalizar a Plus Jakarta Sans"} |')
    T += ['', '## Tamaños de fuente', '', '| px | Apariciones | Token |', '|---:|---:|---|']
    for s, n in sorted(allsizes.items()):
        T.append(f'| {s} | {n} | {SCALE_MAP.get(s, "—")} |')
    weight_map = {400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold', 800: 'Bold (normalizar a 700)'}
    T += ['', '## Pesos', '', '| Peso | Apariciones | Token |', '|---:|---:|---|']
    for w, n in sorted(allweights.items(), key=lambda kv: kv[0] or 0):
        T.append(f'| {w} | {n} | {weight_map.get(w, "—")} |')
    T += ['', '## Colores', '', '| Hex | Apariciones | ¿En `theme.ts`? |', '|---|---:|---|']
    for c, n in allcolors.most_common():
        T.append(f'| `{c}` | {n} | {"✅" if c.upper() in theme_colors else "⚠️ no"} |')
    T += ['', '## Radios', '', '| Radio | Apariciones | Token |', '|---:|---:|---|']
    for r, n in allradii.most_common():
        T.append(f'| {r} | {n} | {RADIUS_MAP.get(r, "—")} |')
    T += ['', '## Normalizaciones obligatorias', '',
          '1. Toda la app usa Plus Jakarta Sans.',
          '2. Títulos de pantalla: `Typography.scale.h1` (22).',
          '3. Títulos de sheet/modal/popup: `Typography.scale.modalTitle` (20).',
          '4. Peso 800 → 700.',
          '5. Radios 13/14/15 → `Radius.lg` (12); botones/inputs → `Radius.md` (8).',
          '6. Verde de éxito → `Colors.success.text` / `success.accent`.', '']
    open(os.path.join(ROOT, 'TOKENS_AUDIT.md'), 'w').write('\n'.join(T))

    print('OK. specs:', len(manifest))
    try:
        imgs = api('/images/%s' % KEY, {'ids': ','.join(ids), 'format': 'png', 'scale': 1})
        print('imágenes listas:', len(imgs.get('images', {})))
    except urllib.error.HTTPError as e:
        print(f'PNG por API no disponible (HTTP {e.code}). Export manual según README.md.')


if __name__ == '__main__':
    main()
