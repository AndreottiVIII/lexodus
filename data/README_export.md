# Dati per il sito — esportazione JSON (mandato 05, parte B)

Prodotti da `script/esporta_sito.py` (`python -I -X utf8 script/esporta_sito.py risultati`) a partire dai file di `risultati/`. Tutti i file sono UTF-8, JSON compatto. **Fonte di tutto**: Wiktionary inglese (`raw-wiktextract-data.jsonl.gz`, estrazione Wiktextract del dump del 2026-09-02, scaricato da kaikki.org il **18/10/2026**) passato da `script/estrai_lingue.py`.

## Cosa c'è

| File | Contenuto | Da dove viene |
|---|---|---|
| `lingue.json` | `lingue_di_arrivo`: le 33 lingue di arrivo (codice, `nome_it`, `nome_en`, `lemmi`, `lemmi_con_etimologia`, `percentuale_con_etimologia`, `parole_con_legami`, `archi_in_entrata`, `archi_in_uscita`, `parole_prese_in_prestito`, `parole_date_in_prestito`, `copertura` = buona / media / scarsa). `altre_lingue_origine`: le 1401 altre lingue che compaiono come origine (codice, `nome_en`, `nome_it` se noto, `tipo_lingua`). | `rete_copertura.csv`, `rete_archi.csv`, `lingue_codici.csv`, `script/lingue_nomi_it.csv` |
| `archi.json` | 6.719 archi diretti tra lingue (origine, arrivo, categoria, `n_parole`, `n_incerte`, `tipo_lingua_origine`, fino a 12 `esempi`). Solo catene (parole senza alternative), tutte le categorie tranne `stadio_stessa_lingua`. Gli esempi sono le parole «riconoscibili» più corte (almeno 3 lettere, solo lettere, senza maiuscole, senza trattini né cifre), mostrate in ordine alfabetico. | `rete_archi.csv` (numeri), `rete_parole.csv` (esempi) |
| `parole/<codice>.json` | Per ciascuna delle 33 lingue di arrivo, l'elenco delle parole con almeno un legame vero (non quelle di sola formazione interna, né di soli stadi): `parola`, `pos`, `n_etimologia`, `categoria`, `diretta` (codice della lingua diretta; `null` se la parola ha alternative), `lontana` (origine lontana; `null` se alternative), `catena` (lista di coppie `[codice, termine]` dalla lingua diretta all'ultima tappa), `incerta` (true/false), `motivo_incerta`, `alternative` (lista di `{codice, termine, categoria}`), `scartate` (ipotesi che il testo dice improbabili: non sono nella catena), `via` (lingue intermedie citate nel testo come «via X», solo se riconosciute; la lingua diretta non cambia), `ambiti` (gruppi), `testo` (primi 300 caratteri dell'etimologia). Se un file supera 15 MB è diviso per lettera iniziale in `parole/<codice>/<lettera>.json` con un `indice.json` (nell'elenco sotto: lingue divise). | `rete_parole.csv`, `rete_relazioni.csv` |
| `livello2.json` | Il secondo passo delle catene, in due versioni. `da_chi_ha_preso`: chiave `arrivo\|diretta` (es. `it\|ota` = parole italiane la cui lingua diretta è il turco ottomano) → lista di `{codice, n, esempi}` con le lingue da cui la lingua diretta aveva preso quelle parole (fino a 8 esempi). `da_dove_la_origine_l_aveva_presa`: chiave `origine\|arrivo` con l'origine tra le 33 lingue (es. `fr\|en`: le parole inglesi prese dal francese, e da dove il francese le aveva prese); sono gli stessi dati, con la chiave rovesciata, per comodità del sito. `totali`: per ogni `arrivo\|diretta`, parole con catena e quante arrivano al livello 2 (le altre si fermano al primo passo). Stadi della stessa lingua e ipotesi scartate non contano come tappe. 2.491 coppie in avanti, 528 indietro. | `rete_relazioni.csv` |
| `storie.json` | Le 10 storie della sezione 10 di `COSE_INTERESSANTI.md`: `titolo`, `parola`, `lingua_arrivo`, `etimologie` (catene lette dai dati), `parole_collegate` (le altre parole citate nel testo, con le loro catene) e `testo` (il paragrafo). | `COSE_INTERESSANTI.md`, `rete_relazioni.csv` |

Dimensioni dei file delle parole (parole con legami, MB, numero di file):

| Lingua | Parole | MB | File |
|---|---|---|---|
| italiano (`it`) | 19.507 | 6.3 | 1 |
| francese (`fr`) | 16.786 | 5.8 | 1 |
| spagnolo (`es`) | 19.932 | 6.6 | 1 |
| portoghese (`pt`) | 17.090 | 5.7 | 1 |
| catalano (`ca`) | 11.792 | 3.7 | 1 |
| romeno (`ro`) | 42.153 | 12.5 | 1 |
| inglese (`en`) | 70.361 | 26.8 | 52 |
| tedesco (`de`) | 13.303 | 4.9 | 1 |
| olandese (`nl`) | 13.899 | 4.9 | 1 |
| svedese (`sv`) | 8.835 | 3.1 | 1 |
| danese (`da`) | 8.426 | 2.9 | 1 |
| norvegese (bokmål) (`nb`) | 7.913 | 2.7 | 1 |
| islandese (`is`) | 4.663 | 1.6 | 1 |
| polacco (`pl`) | 16.041 | 5.2 | 1 |
| ceco (`cs`) | 6.230 | 2.0 | 1 |
| slovacco (`sk`) | 2.546 | 0.8 | 1 |
| russo (`ru`) | 11.679 | 4.2 | 1 |
| ucraino (`uk`) | 7.558 | 2.8 | 1 |
| bulgaro (`bg`) | 6.971 | 2.5 | 1 |
| serbo-croato (`sh`) | 13.550 | 4.2 | 1 |
| sloveno (`sl`) | 1.811 | 0.6 | 1 |
| greco moderno (`el`) | 3.625 | 1.4 | 1 |
| ungherese (`hu`) | 5.793 | 2.1 | 1 |
| finlandese (`fi`) | 15.333 | 5.0 | 1 |
| estone (`et`) | 2.694 | 0.9 | 1 |
| lituano (`lt`) | 1.957 | 0.8 | 1 |
| lettone (`lv`) | 1.712 | 0.8 | 1 |
| albanese (`sq`) | 4.024 | 1.7 | 1 |
| maltese (`mt`) | 7.058 | 2.1 | 1 |
| turco (`tr`) | 9.913 | 3.6 | 1 |
| arabo (`ar`) | 3.082 | 1.3 | 1 |
| persiano (`fa`) | 7.207 | 2.6 | 1 |
| ebraico (`he`) | 2.009 | 0.7 | 1 |

## Significato dei campi

- **Categoria**: `ereditato` (la parola viene da quella lingua per via naturale, non è un prestito), `prestito`, `latinismo_dotto` (preso dal latino scritto: ogni prestito dal latino è un latinismo dotto), `calco`, `non_precisato` (Wiktionary dice solo «deriva da»). Per «prestiti» il sito conti `prestito`, `calco` e `latinismo_dotto`.
- **Lingua diretta** = da dove la parola è arrivata subito. **Origine lontana** = l'ultimo punto della catena che Wiktionary descrive (ai bivi «pezzo vero + affisso» si segue il pezzo vero).
- Gli **stadi della stessa lingua** (medio inglese → inglese, latino tardo → latino…) non sono passaggi tra lingue e non compaiono né negli archi né nelle catene.
- `tipo_lingua`: `lingua`, `protolingua`, `famiglia` (es. germanico), `non lingua` (es. «translingual»), `sostrato`. Il sito può nascondere le non lingue.
- I **codici** sono quelli di Wiktionary (es. `ota` turco ottomano, `fro` francese antico). Nomi in `lingue.json`.

## Avvertenze da mostrare sul sito

1. **È una fotografia di Wiktionary, non una misura del vocabolario.** I numeri dicono cosa i redattori di Wiktionary hanno scritto sull'origine delle parole, non quante parole una lingua abbia davvero prestato o preso.
2. **Copertura molto disuguale.** I più coperti: finlandese 97%, polacco 95%, ungherese 94% dei lemmi con etimologia; i meno coperti: lettone 36%, arabo 20%, maltese 10%. Una lingua con pochi legami non ha per forza prestato poco: il campo `copertura` (buona ≥ 70%, media 30-70%, scarsa < 30%) serve a dirlo. Per l'italiano ha etimologia il 51% dei lemmi.
3. **Le cifre sono minimi.** Etimologie scritte solo a parole (es. «dal nome del ghetto di Venezia») non entrano; catene interrotte ai bivi; il confine tra prestito, ereditato e «deriva da» dipende da come i redattori scelgono il modello.
4. **Le date non sono usate** (decisione del 18/10/2026): non ci sono date negli export.
5. **Etimologie dubbie**: `incerta = true` e `motivo_incerta` dicono perché; le `alternative` sono ipotesi che Wiktionary presenta alla pari (es. «ragazzo»); le `scartate` sono ipotesi che il testo giudica improbabili (es. «baita» dall'arabo). Non vanno mostrate come catena.
6. **Ambiti** (cucina, mare, musica…): coprono poco (circa un quinto dei lemmi) e sono letti dalle etichette dei sensi: da usare come esempi.
7. **Wiktionary italiano**: per l'italiano esiste un confronto con il Wiktionary italiano (`risultati/confronto_itwikt.csv` e `.md`, non esportato qui): dove le due fonti non concordano (es. «guerra») il sito può dirlo.
