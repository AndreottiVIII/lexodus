# lexodus

A static website that shows, for 33 languages of Europe and its neighbours, which languages each one **took words from** and which languages **took words from it**, based on the etymologies written in English Wiktionary. Any of the 33 languages can be put at the centre (Italian is the default).

Pages:
- `index.html` — the 33 languages, each with its Wiktionary coverage in words.
- `language.html?code=it` — one language: two lists, "Took from" and "Gave to". Each row: language, number of words, a thin bar, category, 5 example words. Clicking a row opens the step before for the same words (e.g. Italian words from Ottoman Turkish: where Ottoman Turkish had them from). Works for any code in the data (for languages outside the 33 only "Gave to").
- `about.html` — method, categories, limits.
- "Words" and "Stories" are in the menu but not built yet.

No build step and no libraries: plain HTML, CSS and JavaScript with system fonts. The site opens both from GitHub Pages and by double-clicking `index.html` (the data is also shipped as `data/*.js`, because browsers block `fetch()` on local files).

## Data

- Source: English Wiktionary, extracted by [Wiktextract](https://github.com/tatuylonen/wiktextract) and published on [kaikki.org](https://kaikki.org/) (`raw-wiktextract-data.jsonl.gz`, Wiktionary dump of 2026-09-02), **downloaded on 18 October 2026**. Processing is done in the separate project folder `rete-prestiti/` (scripts, JOURNAL, reports).
- Licence: Wiktionary content is available under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The tables in `data/` are derived from it and are shared under the same licence, with attribution to the Wiktionary contributors.
- The numbers are a snapshot of Wiktionary, not a measure of the vocabulary: each page shows how many entries of the language have an etymology at all. No dates are used.

### What is in `data/`

The official export of `rete-prestiti` (mandate 05, part B), copied on 18/10/2026 by `scripts/aggiorna_dati.py`. Field names are described in `data/README_export.md` (a copy of the export README).

- `lingue.json`: `lingue_di_arrivo` (the 33 languages, with `lemmi`, `lemmi_con_etimologia`, `percentuale_con_etimologia`, `copertura` = buona / media / scarsa) and `altre_lingue_origine` (every other source language, with `tipo_lingua`).
- `archi.json`: `archi`, 6,719 direct arcs (`origine`, `arrivo`, `categoria`, `n_parole`, `n_incerte`, `tipo_lingua_origine`, up to 12 shortest `esempi`).
- `livello2.json`: `da_chi_ha_preso` (key `arrivo|diretta`, e.g. `it|ota` → list of `{codice, n, esempi}`: where the direct language had those words from) and `totali` (per key: words with a chain, and how many reach the second step). It has no category, so the second level on the site covers all categories of a language pair. Latin varieties are merged by the site.
- `storie.json`: the 10 stories (not used yet).
- `fonte.json`: says the data is the export. Every file also exists as `.js`.

`parole/<codice>.json` (127 MB in all) is **not** copied: it is for the future word pages. To copy it later (only if under 100 MB): `python -I -X utf8 scripts/aggiorna_dati.py --parole`.

### How to update the data

When the export changes:

```
cd lexodus
python -I -X utf8 scripts/aggiorna_dati.py
git add data && git commit -m "Update data from export" && git push
```

## Publish on GitHub Pages

The repository is online at https://github.com/AndreottiVIII/lexodus and GitHub Pages serves it from `main` (root) at https://andreottiviii.github.io/lexodus/. It was set up with:

```
gh auth login
cd C:\Users\davide\Desktop\ClaudeTower\lexodus
gh repo create lexodus --public --source=. --remote=origin --push
gh api -X POST repos/AndreottiVIII/lexodus/pages -f "source[branch]=main" -f "source[path]=/"
```

After that, every `git push` to `main` updates the site within a minute or two.

## Work locally

```
python -m http.server 8790 --directory lexodus
```

then http://localhost:8790. Or just open `index.html`.

## Files

- `index.html`, `language.html`, `about.html` — pages.
- `css/style.css` — the only stylesheet: black on white, one dark blue for bars and links.
- `js/common.js` — data loading and normalisation, categories, Latin merging, filters, footer. `js/language.js` — language page.
- `scripts/aggiorna_dati.py` — copy the export into `data/`. (The scripts that built the first sample from the CSV tables were removed; they are in the git history.)
- `docs/screenshots/` — screenshots from the check of 18/10/2026.
- `JOURNAL.md` — choices made and what is missing.
