# Fuentes IBM Plex (self-host)

Fuentes web self-host del design system Elohim SGE. Se cargan vía
`../tokens/fonts.css` (bloques `@font-face`), sin request a Google Fonts.

## Procedencia

- **Origen:** [Fontsource](https://fontsource.org) (CDN jsDelivr).
- **Familias:** IBM Plex Sans (UI/texto) e IBM Plex Mono (cifras: DNI, dinero, notas, fechas).
- **Subset:** `latin`.
- **Pesos:** Sans 400/500/600/700 · Mono 400/500/600.
- **Formato:** `woff2`.

## Comando de descarga

```bash
mkdir -p packages/ui/src/fonts && cd packages/ui/src/fonts
for w in 400 500 600 700; do
  curl -fL -o "ibm-plex-sans-latin-$w.woff2" \
    "https://cdn.jsdelivr.net/fontsource/fonts/ibm-plex-sans@latest/latin-$w-normal.woff2"
done
for w in 400 500 600; do
  curl -fL -o "ibm-plex-mono-latin-$w.woff2" \
    "https://cdn.jsdelivr.net/fontsource/fonts/ibm-plex-mono@latest/latin-$w-normal.woff2"
done
```

Fallback (si el CDN falla): `npm pack @fontsource/ibm-plex-sans` (ídem mono) en
un directorio temporal, extraer el `.tgz` y copiar de `package/files/` los
`ibm-plex-sans-latin-{peso}-normal.woff2`.

## Licencia

IBM Plex se distribuye bajo la SIL Open Font License 1.1.
