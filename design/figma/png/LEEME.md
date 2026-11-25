# PNG de Figma

**Estado: 26/26 exportados y renombrados.**

Los nombres siguen el patrón `<frame-id>-<slug>.png` y coinciden con la columna
«PNG esperado» de `../MANIFEST.md`.

## Si hay que re-exportar

1. Abrí `Trabajo IHC 4` en Figma.
2. Exportá cada frame `(COLOR)` como PNG (escala 1x).
3. Descomprimí acá.
4. Renombrá con:

```bash
python3 design/figma/tools/renombrar_png.py design/figma/png
```

> Los tres frames «Registrar Venta - Cantidad No Valida» se llaman igual en Figma. El script
> los detecta y pide renombrarlos a mano. Ya se separaron por contenido:
> - `519-3397-venta-cantidad-excedida.png` → venta, cantidad 250 de 200.
> - `519-3556-venta-cantidad-cero.png` → venta, cantidad 0.
> - `519-3715-venta-variante-rota.png` → descarte, cantidad 0 (referencia del estado de error).

Las imágenes incluyen el marco decorativo del dispositivo y su sombra, por eso miden más que
390×844. Para medidas y tokens mandan `../specs/<id>.md`, no el tamaño del PNG.
