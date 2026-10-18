# lexodus

A static website that shows, for 33 languages of Europe and its neighbours, which languages each one **took words from** and which languages **took words from it**, based on the etymologies written in English Wiktionary. Any of the 33 languages can be put at the centre (Italian is the default).

Pages:
- `index.html` — language picker and the network (took from | language | gave to), with category filters.
- `language.html?code=it` — one language: Wiktionary coverage, "took from" and "gave to" tables with example words. Works for any code that appears in the data (for languages outside the 33 it shows only "gave to").
- `about.html` — method, categories, limits.
- "Words" and "Stories" are in the menu but not built yet.

No build step: plain HTML, CSS and JavaScript. D3 7.9.0 is loaded from cdnjs. The site opens both from GitHub Pages and by double-clicking `index.html` (the data is also shipped as `data/*.js`, because browsers block `fetch()` on local files).

## Data

- Source: English Wiktionary, extracted by [Wiktextract](https://github.com/tatuylonen/wiktextract) and published on [kaikki.org](https://kaikki.org/) (`raw-wiktextract-data.jsonl.gz`, Wiktionary dump of 2026-09-02), **downloaded on 18 October 2026**. Processing is done in the separate project folder `rete-prestiti/` (scripts, JOURNAL, reports).
- Licence: Wiktionary content is available under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The tables in `data/` are derived from it and are shared under the same licence, with attribution to the Wiktionary contributors.
- The numbers are a snapshot of Wiktionary, not a measure of the vocabulary: each page shows how many entries of the language have an etymology at all. No dates are used.

### What is in `data/` now

**A sample**, not the final export. It was built on 18/10/2026 by `scripts/campione_da_csv.py` from `rete-prestiti/risultati/rete_archi.csv`, `rete_copertura.csv`, `lingue_codici.csv` and `rete_parole.csv` (read only), because `rete-prestiti/risultati/export/` did not exist yet. It contains all 6,719 direct arcs (all categories except steps inside the same language) and up to 12 example words per arc. The sample does not yet include the clean-up of mandate 05 (e.g. rejected hypotheses read as steps, `oc-pro` as proto-language).

Files: `lingue.json` (33 target languages with coverage, plus every source language), `archi.json` (arcs), `fonte.json` (says whether the data is the sample or the export), and the same content as `.js` files.

### How to update the data

When the export of mandate 05 (part B) is ready in `rete-prestiti/risultati/export/`:

```
cd lexodus
python -I -X utf8 scripts/aggiorna_dati.py
git add data && git commit -m "Update data from export" && git push
```

The script copies `lingue.json`, `archi.json`, `storie.json`, `README.md` and `parole/` into `data/` and writes the `.js` twins. The site reads field names flexibly (`js/common.js`, functions `normLanguage` and `normArc`): if the export uses different names, add them to the lists there. After the copy the footer no longer says "sample".

## Publish on GitHub Pages

`gh` was not logged in when the site was created (18/10/2026), so the repository is **not online yet**. The local repository is ready with a first commit. To publish:

```
gh auth login
cd C:\Users\davide\Desktop\ClaudeTower\lexodus
gh repo create lexodus --public --source=. --remote=origin --push
gh api -X POST repos/AndreottiVIII/lexodus/pages -f "source[branch]=main" -f "source[path]=/"
```

The site will then be at https://andreottiviii.github.io/lexodus/ (it takes a minute or two the first time).

## Work locally

```
python -m http.server 8790 --directory lexodus
```

then http://localhost:8790. Or just open `index.html`.

## Files

- `index.html`, `language.html`, `about.html` — pages.
- `css/style.css` — the only stylesheet; colours are tokens at the top (one per category, light and dark).
- `js/common.js` — data loading and normalisation, categories, filters, footer. `js/network.js` — picker and flow chart. `js/language.js` — language page.
- `scripts/aggiorna_dati.py` — copy the real export. `scripts/campione_da_csv.py` — rebuild the sample from the CSV tables.
- `docs/screenshots/` — screenshots from the check of 18/10/2026.
- `JOURNAL.md` — choices made and what is missing.
