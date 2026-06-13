# Biotech Pixel Art Gallery

A curated online archive of biotech pixel-art **specimens**, generated in the Plasmae lab
(local ComfyUI → Z-Image / Illustrious). Visual identity: **Specimen Archive** — a clinical
bio-catalog rendered in a genuine 8-bit pixel aesthetic.

Static site, no build step.

## Run locally
```bash
python -m http.server 8200
# open http://127.0.0.1:8200/
```
(Must be served over http — `manifest.json` is fetched, so `file://` won't work.)

## Structure
- `index.html` — markup
- `style.css` — pixel-art identity (Press Start 2P / VT323, notched pixel frames, scanlines)
- `app.js` — loads `manifest.json`, renders specimen cards, filters, lightbox
- `manifest.json` — the catalogue (`specimens[]`); new art is appended automatically
- `images/` — specimen artwork

## Adding specimens
Append an entry to `manifest.json`:
```json
{ "id": "SPEC-0009", "name": "Latin binomial", "common": "Friendly name",
  "style": "pixel", "src": "images/your_file.png", "date": "2026-06-13" }
```
The Plasmae bot can do this automatically via the `/archive` endpoint in `scripts/input_service.py`.

## Deploy
Any static host. GitHub Pages: Settings → Pages → deploy from `main` / root.
Vercel/Netlify: import the repo, framework preset "Other", output dir = root.
