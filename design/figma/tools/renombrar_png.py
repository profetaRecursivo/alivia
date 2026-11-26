#!/usr/bin/env python3
"""
Renombra los PNG exportados a mano desde Figma al nombre canónico del MANIFEST.

Uso:
    python3 design/figma/tools/renombrar_png.py design/figma/png

Figma nombra cada archivo con el nombre de la capa, por ejemplo:
    "Dashboard (COLOR).png"
    "PopUp: Venta Registrada con Éxito - Alivia (COLOR).png"
    "Registrar Venta Bottomsheet (Color).png"
Este script los mapea a:
    "519-4861-dashboard.png"
    "521-32-venta-exitosa.png"
    "519-3251-registrar-venta.png"

No borra nada: si ya existe el destino, avisa y omite. Los archivos que no
reconoce quedan intactos y se listan al final.

Los nombres de Figma se comparan normalizados (minúsculas, sin acentos, sin
"(COLOR)", sin el sufijo "Alivia" y sin el número de duplicado que agrega el
sistema de archivos al exportar varias veces).
"""
import os
import re
import sys
import unicodedata

# frame id -> (nombre de capa en Figma, archivo destino)
MAP = {
    '519:4861': ('Dashboard', '519-4861-dashboard.png'),
    '519:5091': ('Dashboard - Sin Alertas', '519-5091-dashboard-sin-alertas.png'),
    '519:4932': ('Configuracion', '519-4932-configuracion.png'),
    '519:5018': ('Modal - Sin Conexión al Servidor', '519-5018-sin-conexion.png'),
    '521:32': ('PopUp: Venta Registrada con Éxito', '521-32-venta-exitosa.png'),
    '519:6029': ('PorVencer - Pestaña 30 días', '519-6029-por-vencer-30.png'),
    '519:5833': ('PorVencer - Pestaña Vacía', '519-5833-por-vencer-vacio.png'),
    '519:3884': ('Detalles del producto', '519-3884-detalle.png'),
    '519:3977': ('Detalles del producto vencido', '519-3977-detalle-vencido.png'),
    '519:4075': ('Detalles del producto sin stock', '519-4075-detalle-sin-stock.png'),
    '519:4175': ('PopUp descartar de estante', '519-4175-popup-descartar.png'),
    '519:3251': ('Registrar Venta Bottomsheet', '519-3251-registrar-venta.png'),
    '519:3397': ('Registrar Venta - Cantidad No Valida', '519-3397-venta-cantidad-excedida.png'),
    '519:4718': ('Descartar', '519-4718-descartar.png'),
    '519:5930': ('Confirmar Venta', '519-5930-confirmar-venta.png'),
    '519:5135': ('Stock', '519-5135-stock.png'),
    '519:5314': ('Filtro Stock', '519-5314-filtro-stock.png'),
    '519:5461': ('Stock Autocompletado', '519-5461-stock-autocompletado.png'),
    '519:5597': ('Stock sin resultados', '519-5597-stock-sin-resultados.png'),
    '519:4343': ('Hisotial', '519-4343-historial.png'),
    '519:4523': ('Filtro Historial', '519-4523-filtro-historial.png'),
    '519:4263': ('Historial Sin movimientos', '519-4263-historial-vacio.png'),
    '521:250': ('PopUp: Descarte Registrada con Éxito', '521-250-descarte-exitoso.png'),
}

# Frames que comparten el mismo nombre de capa en Figma. Al exportar se pisan
# o el sistema les agrega " 1", " 2", y no hay forma fiable de saber cuál es
# cuál. NO se renombran automáticamente: se avisa para hacerlo a mano.
#
# Nota: 519:3715 está roto (mezcla descarte con venta) y no se implementa;
# su PNG es solo referencia y también debe renombrarse a mano.
AMBIGUOS = {
    'registrar venta cantidad no valida': [
        ('519:3397', '519-3397-venta-cantidad-excedida.png'),
        ('519:3556', '519-3556-venta-cantidad-cero.png'),
        ('519:3715', '519-3715-venta-variante-rota.png'),
    ],
    'sincronizando cambios': [
        ('534:592', '534-592-sync-sincronizando.png'),
        ('545:1646', '545-1646-sync-offline.png'),
    ],
    'porvencer': [
        ('519:5706', '519-5706-por-vencer.png'),
        ('545:2170', '545-2170-sync-completado.png'),
    ],
}


def norm(s):
    """Normaliza un nombre de capa para compararlo de forma tolerante."""
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')  # sin acentos
    s = s.lower()
    s = re.sub(r'\((?:colou?r|alivia)\)', ' ', s)                 # (COLOR), (Color), (Alivia)
    s = re.sub(r'[-–—:]', ' ', s)
    s = re.sub(r'[^a-z0-9ñ ]', ' ', s)
    s = re.sub(r'\balivia\b', ' ', s)                             # sufijo de marca
    s = re.sub(r'\s+', ' ', s).strip()
    s = re.sub(r' \d+$', '', s)                                   # " 1", " 2" de duplicados
    return s


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    folder = sys.argv[1]
    if not os.path.isdir(folder):
        sys.exit('No existe la carpeta: ' + folder)

    # cola de destinos por nombre normalizado
    pendientes = {}
    for fid, (figma_name, target) in MAP.items():
        pendientes.setdefault(norm(figma_name), []).append((fid, target))

    renombrados, desconocidos, ambiguos = [], [], []
    for name in sorted(os.listdir(folder)):
        src = os.path.join(folder, name)
        if not name.lower().endswith('.png') or not os.path.isfile(src):
            continue
        clave = norm(os.path.splitext(name)[0])
        if clave in AMBIGUOS:
            ambiguos.append(name)
            continue
        cola = pendientes.get(clave)
        if not cola:
            desconocidos.append(name)
            continue
        fid, target = cola.pop(0)
        dst = os.path.join(folder, target)
        if os.path.exists(dst):
            print('Ya existe, omito:', target)
            continue
        os.rename(src, dst)
        renombrados.append((name, target))

    print(f'Renombrados: {len(renombrados)}')
    for a, b in renombrados:
        print('  ', a, '→', b)

    faltan = [t for cola in pendientes.values() for _, t in cola]
    if faltan:
        print('\nTodavía faltan estos PNG (exportalos desde Figma):')
        for t in faltan:
            print('  ', t)

    if ambiguos:
        print('\nATENCIÓN — nombres duplicados en Figma, renombrá a mano:')
        print('  Archivos encontrados:')
        for a in ambiguos:
            print('     ', a)
        print('  Destinos según MANIFEST.md:')
        for grupo, lista in AMBIGUOS.items():
            print(f'    · {grupo}:')
            for fid, t in lista:
                print(f'        {t}   (frame {fid})')
        print('  Los frames de cada grupo se llaman igual en Figma. Abrí cada uno y')
        print('  exportalo por separado, o compará contra specs/ antes de renombrar.')

    if desconocidos:
        print('\nNo reconocidos (quedan intactos):')
        for u in desconocidos:
            print('  ', u)
        print('\nRenombrá a mano según design/figma/MANIFEST.md.')


if __name__ == '__main__':
    main()
