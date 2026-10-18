# lexodus

A static website that shows, for 33 languages of Europe and its neighbours, which languages each one **took words from** and which languages **took words from it**, based on the etymologies written in English Wiktionary. Any of the 33 languages can be put at the centre (Italian is the default).

Menu (same in every page): **Languages · Search · Explore ▾ · Statistics · About**. "Explore" is a drop-down made with a `<details>` element (no library; it also closes on a click outside or on Escape) with the seven pages below (in two columns on a wide screen); on a phone the menu is stacked.

Pages:
- `index.html` — a **Surprise me** button under the title (also in `search.html`): it reads `data/casuale.json` only on the click and opens the tree of one of its 5,000 words at random; the tree page has a small **Another one** button that picks another (never the word shown).
- `index.html` — a 33×33 grid (rows: the language that took the words; columns: the language it took them from, plus "Latin" and "other"), with a switch first level / second level. Every square opens its list of words. The five tones are on a log scale from 1 to the 95th percentile of the squares, so Romanian ← French (28,664) does not flatten the rest; the squares above stay in the darkest tone.
- `languages.html` — the 33 languages with their Wiktionary coverage, the 3 languages each took most words from, and a search by name.
- `search.html?q=caffè` — a word in all 33 languages (as written, transliterated or by English meaning), grouped by language; only the index file of the letter typed is read.
- `tree.html?lang=it&w=caffè&n=1` — the tree of a word: furthest origin at the top, the steps down to the word, then the languages that took it, recursively; one more tree for each other etymology of the same spelling.
- `stats.html` — two sections only: given and received, bridge languages.
- `language.html?code=it` — one language: two lists, "Took from" and "Gave to". Each row: language, number of words, a thin bar, category, 5 example words. Clicking a row opens the step before for the same words. Every number is a link to its list of words. Below, two blocks closed by default (from `lingua_extra/<code>.json`): "Farthest origins" (n, the languages it came through most, 5 examples; reconstructed origins in a list apart) and "Most travelled words in <language>" (10 words with the chain in one line, link to the tree). `language.html?code=ro#romanian-note` shows the note on Romanian.
- Explore: `hidden.html?lang=bg` (hidden donors of one language: origin, direct words, words through another language, share, the languages in between; every number opens its list), `travelled.html?lang=fi` (the 10 of one language, the 100 longest ways, the 100 words taken by the most languages), `doublets.html?lang=it` (pairs of doublets side by side, with a search box), `roundtrips.html?lang=it` (words that went out and came back, the language highlighted twice in the chain), `families.html` (the most widespread families (600, roots always attested languages; any ending in a proto-language would be hidden); a family opens onto its words language by language), `compare.html?a=fr&b=it` (what each took from the other, shared origins, words through each other; below, three blocks closed by default, each with its total in the title and "Show all" over 20: **Round trips between the two** (chain in one line, the language highlighted twice, link to the tree), **Cousin words** (same distant origin, two outcomes: the two words side by side with the root in the middle, links to the word pages and trees), **False loans between the two** (words of one that look taken from the other: word, meaning, short text)), `gave.html?lang=it` (**What a language gave to the world**: its 150 words taken by the most languages, a row per word with number of languages that opens onto the local forms, directly and through another language, and "Italian had it from …" when the word was a loan; a search box; Romanian counts like any language; words with `senza_albero` have no link to a tree).
- **Romanian** stays visible (page, grid, lists) but is left out of statistics and rankings as a language that took words, with a one-sentence note (`nota_esclusione` / `nota_romeno` of the export) linking to its page.
- `words.html?to=sq&from=LATINO[&via=grc][&cat=learned]` — the words of one pair of languages (optionally only those that had come from `via` one step before): word, meaning, where from, category, "?" when uncertain or with more than one possible origin. Category filters, search, 50 per page. Also `words.html?to=it&via=ar` (second level of the grid, whatever the direct language) and `words.html?to=it&from=other` (the "other" column).
- `word.html?lang=it&w=caffè&n=1[&from=ota]` — one word: meaning, the way it came step by step (one row per language, down to the furthest origin; possible origins side by side with "or"), the start of the Wiktionary etymology with a link to the entry, and the languages that took it afterwards.
- `about.html` — what this is, where the data comes from, how a word's path is read, what the numbers are, what is left out, known limits, how the site is built, credits (with an index at the top).

No build step and no libraries: plain HTML, CSS and JavaScript with system fonts. The home, the languages and the language pages also open by double-clicking `index.html` (their data is also shipped as `data/*.js`, because browsers block `fetch()` on local files); lists of words, word pages, search, trees and statistics read their files with `fetch()`, so they need a web server (GitHub Pages, or the local server below).

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
- Built by `aggiorna_dati.py` from `coppie/`: `coppie_elenco.json` (which pair files exist, so a number is a link only when its list exists; `_via` and `_altre` for the grid files). "Then taken by other languages" on the word page reads the first level of `giu` in `alberi/` (the old `dati_a/` is gone).
- Mandate 09: `coppie/<arrivo>/__via_<livello2>.json` and `__altre.json` (the squares of the grid), `indice/<letter>.json` + `indice/_meta.json` (search index: `p` word, `n` normalised, `l` language, `ne` etymology number, `s` meaning, `t` transliteration, `c` category, `o` direct language), `alberi/<lang>/<letter>.json` (trees, key `word|n_etimologia`: `su`, `giu`, `radici_altre`, `troncato`), `statistiche.json` (`donatori_nascosti`, `lingue_di_passaggio`, `bilancio`, `parole_viaggiate`, each with a `nota`). Transliteration (`traslitterazione`) is in every word and chain step.
- Mandate 11: `statistiche.json` again (Romanian out: `escluse`, `nota_esclusione`; hidden donors with `quota`; `parole_viaggiate.per_lingua`), `lingua_extra/<code>.json` (`origini_lontane`, `origini_ricostruite`, `piu_viaggiate`, `nota_romeno`), `doppioni/<code>.json`, `andate_tornate/<code>.json`, `famiglie.json`, `confronto/<A>__<B>.json` (A before B alphabetically, 528 files). The pages accept a list either as it is or inside a block `{nota, lista}`.
- Mandate 13: `confronto/<A>__<B>.json` with three more blocks (`andate_tornate_tra` with `A_via_B`/`B_via_A`, `cugine` with `n_totale` and `lista` of up to 80 pairs `a`, `b`, `radice`, `lingua_diretta_a/b`, `falsi_prestiti_tra` with `A_imita_B`/`B_imita_A`), `dato_al_mondo/<code>.json` (150 words: `n_lingue`, `lingue` with the local `parola` and `livello`, `origine_X`, `file_albero`/`chiave_albero`, `senza_albero`), `casuale.json` (5,000 shuffled words with `file_albero`/`chiave_albero`), `pseudo/<code>.json` (copied, not used yet). Words with `file_albero` link to their tree with the file letter taken from it.
- `storie.json` (not used), `fonte.json`. The small files also exist as `.js`.

`parole/<codice>.json` and `dati_a/` are **not** copied (the pair files and the trees replace them). `aggiorna_dati.py` stops, copying nothing, if what the site uses (the export without `parole/` and `dati_a/`) goes over 800 MB (authorised 18/10/2026).

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

- `index.html`, `languages.html`, `language.html`, `words.html`, `word.html`, `search.html`, `tree.html`, `stats.html`, `about.html` — pages. The header with the menu is the same in every page (if a page is added, copy it from another one).
- `hidden.html`, `travelled.html`, `doublets.html`, `roundtrips.html`, `families.html`, `compare.html`, `gave.html` — the Explore pages, each with its `js/<name>.js`.
- `css/style.css` — the only stylesheet: black on white, one dark blue for bars and links.
- `js/common.js` — data loading and normalisation, categories, Latin merging, filters, footer, the Explore menu, the Romanian note, chains in one line. `js/home.js` — the grid. `js/language.js` — language page. `js/words.js` — list of words. `js/word.js` — word page. `js/languages.js`, `js/search.js`, `js/tree.js`, `js/stats.js` — the pages of the same name.
- `scripts/versione.py` — new version number on every css, js and data file (run before every publication).
- `scripts/aggiorna_dati.py` — copy the export into `data/` and build the index of pair files (`--solo-indici` only rebuilds it). (The scripts that built the first sample from the CSV tables were removed; they are in the git history.)
- `docs/screenshots/` — screenshots from the check of 18/10/2026.
- `JOURNAL.md` — choices made and what is missing.
