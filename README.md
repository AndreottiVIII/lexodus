# lexodus

A static website that shows, for 33 languages of Europe and its neighbours, which languages each one **took words from** and which languages **took words from it**, based on the etymologies written in English Wiktionary. Any of the 33 languages can be put at the centre (Italian is the default).

Pages:
- `index.html` — a 33×33 grid (rows: the language that took the words; columns: the language it took them from, plus "Latin" and "other"), with a switch first level / second level; below it the 33 languages with their Wiktionary coverage.
- `language.html?code=it` — one language: two lists, "Took from" and "Gave to". Each row: language, number of words, a thin bar, category, 5 example words. Clicking a row opens the step before for the same words. Every number is a link to its list of words.
- `words.html?to=sq&from=LATINO[&via=grc][&cat=learned]` — the words of one pair of languages (optionally only those that had come from `via` one step before): word, meaning, where from, category, "?" when uncertain. Category filters, search, 50 per page.
- `word.html?lang=it&w=caffè&n=1[&from=ota]` — one word: meaning, the way it came step by step (one row per language, down to the furthest origin; possible origins side by side with "or"), the start of the Wiktionary etymology with a link to the entry, and the languages that took it afterwards.
- `about.html` — method, categories, limits.

No build step and no libraries: plain HTML, CSS and JavaScript with system fonts. The home and the language pages also open by double-clicking `index.html` (their data is also shipped as `data/*.js`, because browsers block `fetch()` on local files); the lists of words and the word pages read `data/coppie/` with `fetch()`, so they need a web server (GitHub Pages, or the local server below).

## Data

- Source: English Wiktionary, extracted by [Wiktextract](https://github.com/tatuylonen/wiktextract) and published on [kaikki.org](https://kaikki.org/) (`raw-wiktextract-data.jsonl.gz`, Wiktionary dump of 2026-09-02), **downloaded on 18 October 2026**. Processing is done in the separate project folder `rete-prestiti/` (scripts, JOURNAL, reports).
- Licence: Wiktionary content is available under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The tables in `data/` are derived from it and are shared under the same licence, with attribution to the Wiktionary contributors.
- The numbers are a snapshot of Wiktionary, not a measure of the vocabulary: each page shows how many entries of the language have an etymology at all. No dates are used.

### What is in `data/`

The official export of `rete-prestiti` (mandates 05 and 07), copied by `scripts/aggiorna_dati.py`. Field names are described in `data/README_export.md` (a copy of the export README).

- `lingue.json`: `lingue_di_arrivo` (the 33 languages, with coverage) and `altre_lingue_origine` (every other source language, with `tipo_lingua`).
- `archi.json`: `archi`, the direct arcs (`origine`, `arrivo`, `categoria`, `n_parole`, `n_incerte`, up to 12 shortest `esempi`).
- `livello2.json`: `da_chi_ha_preso` (key `arrivo|diretta` → list of `{codice, n, esempi, file, per_categoria}`) and `totali`.
- `griglia.json`: the grid of the home (`primo_livello`, `secondo_livello`, the same `_tutte` with all categories, `altre_dettaglio`).
- `coppie/<arrivo>/<origine>.json`, `<origine>__<livello2>.json`, `LATINO.json`, `_alternative.json`, `_indice.json`: the words of each pair of languages (mandate 07). File name = the code with every character outside `A-Za-z0-9_-` replaced by `_`, except the few codes in `coppie/_eccezioni_nomi.json`.
- Built by `aggiorna_dati.py` from `coppie/`: `coppie_elenco.json` (which pair files exist, so a number is a link only when its list exists) and `dati_a/<codice>.json` (for each of the 33 languages, the words it gave, keyed by the word as written in the giving language; used by "Then taken by other languages").
- `storie.json` (not used), `fonte.json`. The small files also exist as `.js`.

`parole/<codice>.json` is **not** copied (the pair files replace it).

### Version number (browser cache)

GitHub Pages lets browsers keep files for 10 minutes, so after a publication a browser can mix an old `js/home.js` with new data and stop on "Loading…". Every css, js and data file is therefore loaded with a version number (`js/home.js?v=20261018b`): the `?v=` in the pages and the constant `VERSION` in `js/common.js` (added to every file read with `fetch()`). **Change it at every publication**: `python -I -X utf8 scripts/versione.py` sets a new one (date and time) everywhere; `scripts/aggiorna_dati.py` runs it by itself.

### How to update the data

When the export changes:

```
cd lexodus
python -I -X utf8 scripts/aggiorna_dati.py     # also sets a new version number
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

- `index.html`, `language.html`, `words.html`, `word.html`, `about.html` — pages.
- `css/style.css` — the only stylesheet: black on white, one dark blue for bars and links.
- `js/common.js` — data loading and normalisation, categories, Latin merging, filters, footer. `js/home.js` — the grid. `js/language.js` — language page. `js/words.js` — list of words. `js/word.js` — word page.
- `scripts/versione.py` — new version number on every css, js and data file (run before every publication).
- `scripts/aggiorna_dati.py` — copy the export into `data/` and build the two indexes (`--solo-indici` only rebuilds the indexes). (The scripts that built the first sample from the CSV tables were removed; they are in the git history.)
- `docs/screenshots/` — screenshots from the check of 18/10/2026.
- `JOURNAL.md` — choices made and what is missing.
