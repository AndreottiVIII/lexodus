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

### What is in `data/` now

**A sample**, not the final export. It was built on 18/10/2026 by `scripts/campione_da_csv.py` from `rete-prestiti/risultati/rete_archi.csv`, `rete_copertura.csv`, `lingue_codici.csv` and `rete_parole.csv` (read only), because `rete-prestiti/risultati/export/` did not exist yet. It contains all 6,719 direct arcs (all categories except steps inside the same language) and up to 12 example words per arc. The sample does not yet include the clean-up of mandate 05 (e.g. rejected hypotheses read as steps, `oc-pro` as proto-language).

Files: `lingue.json` (33 target languages with coverage, plus every source language), `archi.json` (direct arcs with examples), `livello2.json` (second level, from `rete_relazioni.csv` by `scripts/livello2_da_csv.py`: key `arrivo|diretta`, e.g. `it|ota`, then a list of `{codice, nome, tipo_lingua, categoria, n, esempi}` for the next step of the chain of the same words; `categoria` is the category of the direct link), `livello2_latino_unito.json` (the same with all Latin varieties merged into `la`), `fonte.json` (sample or export), and the same content as `.js` files.

### How to update the data

When the export of mandate 05 (part B) is ready in `rete-prestiti/risultati/export/`:

```
cd lexodus
python -I -X utf8 scripts/aggiorna_dati.py
git add data && git commit -m "Update data from export" && git push
```

The script copies `lingue.json`, `archi.json`, `storie.json`, `livello2.json` (and `livello2_latino_unito.json` if the export has it), `README.md` and `parole/` into `data/` and writes the `.js` twins. Without a merged-Latin file the site merges Latin itself from `livello2.json`. The site reads field names flexibly (`js/common.js`, functions `normLanguage` and `normArc`): if the export uses different names, add them to the lists there. After the copy the footer no longer says "sample".

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
- `css/style.css` — the only stylesheet: black on white, one dark blue for bars and links.
- `js/common.js` — data loading and normalisation, categories, Latin merging, filters, footer. `js/language.js` — language page.
- `scripts/aggiorna_dati.py` — copy the real export. `scripts/campione_da_csv.py` and `scripts/livello2_da_csv.py` — rebuild the sample from the CSV tables (run `campione_da_csv.py` first: `livello2_da_csv.py` uses its examples).
- `docs/screenshots/` — screenshots from the check of 18/10/2026.
- `JOURNAL.md` — choices made and what is missing.
