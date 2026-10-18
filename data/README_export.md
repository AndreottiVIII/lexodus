# Dati per il sito — esportazione JSON (mandati 05 e 07)

Prodotti da `script/esporta_sito.py` (`python -I -X utf8 script/esporta_sito.py risultati`) a partire dai file di `risultati/`. Tutti i file sono UTF-8, JSON compatto. **Fonte di tutto**: Wiktionary inglese (`raw-wiktextract-data.jsonl.gz`, estrazione Wiktextract del dump del 2026-09-02, scaricato da kaikki.org il **18/10/2026**) passato da `script/estrai_lingue.py`.

## Cosa c'è

| File | Contenuto | Da dove viene |
|---|---|---|
| `lingue.json` | `lingue_di_arrivo`: le 33 lingue di arrivo (codice, `nome_it`, `nome_en`, `lemmi`, `lemmi_con_etimologia`, `percentuale_con_etimologia`, `parole_con_legami`, `archi_in_entrata`, `archi_in_uscita`, `parole_prese_in_prestito`, `parole_date_in_prestito`, `copertura` = buona / media / scarsa, `n_alternative` e `file_indice_coppie` dal mandato 07). `altre_lingue_origine`: le 1401 altre lingue che compaiono come origine (codice, `nome_en`, `nome_it` se noto, `tipo_lingua`). | `rete_copertura.csv`, `rete_archi.csv`, `lingue_codici.csv`, `script/lingue_nomi_it.csv` |
| `archi.json` | 6.719 archi diretti tra lingue (origine, arrivo, categoria, `n_parole`, `n_incerte`, `tipo_lingua_origine`, fino a 12 `esempi`). Solo catene (parole senza alternative), tutte le categorie tranne `stadio_stessa_lingua`. Gli esempi sono le parole «riconoscibili» più corte (almeno 3 lettere, solo lettere, senza maiuscole, senza trattini né cifre), mostrate in ordine alfabetico. | `rete_archi.csv` (numeri), `rete_parole.csv` (esempi) |
| `parole/<codice>.json` | Per ciascuna delle 33 lingue di arrivo, l'elenco delle parole con almeno un legame vero (non quelle di sola formazione interna, né di soli stadi): `parola`, `pos`, `significato` (mandato 07), `n_etimologia`, `categoria`, `diretta` (codice della lingua diretta; `null` se la parola ha alternative), `lontana` (origine lontana; `null` se alternative), `catena` (lista di coppie `[codice, termine]` dalla lingua diretta all'ultima tappa), `incerta` (true/false), `motivo_incerta`, `alternative` (lista di `{codice, termine, categoria}`), `scartate` (ipotesi che il testo dice improbabili: non sono nella catena), `via` (lingue intermedie citate nel testo come «via X», solo se riconosciute; la lingua diretta non cambia), `ambiti` (gruppi), `testo` (primi 300 caratteri dell'etimologia). Se un file supera 15 MB è diviso per lettera iniziale in `parole/<codice>/<lettera>.json` con un `indice.json` (nell'elenco sotto: lingue divise). | `rete_parole.csv`, `rete_relazioni.csv` |
| `livello2.json` | Il secondo passo delle catene, in due versioni. `da_chi_ha_preso`: chiave `arrivo\|diretta` (es. `it\|ota` = parole italiane la cui lingua diretta è il turco ottomano) → lista di `{codice, n, esempi}` con le lingue da cui la lingua diretta aveva preso quelle parole (fino a 8 esempi). `da_dove_la_origine_l_aveva_presa`: chiave `origine\|arrivo` con l'origine tra le 33 lingue (es. `fr\|en`: le parole inglesi prese dal francese, e da dove il francese le aveva prese); sono gli stessi dati, con la chiave rovesciata, per comodità del sito. `totali`: per ogni `arrivo\|diretta`, parole con catena e quante arrivano al livello 2 (le altre si fermano al primo passo). Stadi della stessa lingua e ipotesi scartate non contano come tappe. Dal mandato 07 ogni voce ha anche `file` (percorso del file con l'elenco delle parole) e `per_categoria`, e ci sono le chiavi e le voci `LATINO` (latino unito). 2.524 coppie in avanti, 528 indietro. | `rete_relazioni.csv` |
| `storie.json` | Le 10 storie della sezione 10 di `COSE_INTERESSANTI.md`: `titolo`, `parola`, `lingua_arrivo`, `etimologie` (catene lette dai dati), `parole_collegate` (le altre parole citate nel testo, con le loro catene) e `testo` (il paragrafo). | `COSE_INTERESSANTI.md`, `rete_relazioni.csv` |
| `coppie/<arrivo>/<origine>.json` e altri (vedi sotto) | **Mandato 07.** Le parole di ogni coppia (lingua di arrivo, lingua diretta) con significato, catena completa e testo; i secondi livelli; il latino unito; le parole con etimologia dubbia; un indice per lingua. 17.994 file in tutto, 300 MB. | `rete_parole.csv`, `rete_relazioni.csv`, `dati/filtrato/glosse.jsonl` |
| `griglia.json` | **Mandato 07.** La griglia della home: 33 lingue di arrivo × lingue di origine (le 33, più `LATINO` e `altre`), primo e secondo livello, solo prestiti (+ calchi e latinismi) e tutte le categorie. | gli stessi dati delle coppie |

Dimensioni dei file delle parole (parole con legami, MB, numero di file):

| Lingua | Parole | MB | File |
|---|---|---|---|
| italiano (`it`) | 19.507 | 7.0 | 1 |
| francese (`fr`) | 16.786 | 6.4 | 1 |
| spagnolo (`es`) | 19.932 | 7.3 | 1 |
| portoghese (`pt`) | 17.090 | 6.6 | 1 |
| catalano (`ca`) | 11.792 | 4.1 | 1 |
| romeno (`ro`) | 42.153 | 13.8 | 1 |
| inglese (`en`) | 70.361 | 32.3 | 52 |
| tedesco (`de`) | 13.303 | 5.5 | 1 |
| olandese (`nl`) | 13.899 | 5.5 | 1 |
| svedese (`sv`) | 8.835 | 3.5 | 1 |
| danese (`da`) | 8.426 | 3.2 | 1 |
| norvegese (bokmål) (`nb`) | 7.913 | 3.0 | 1 |
| islandese (`is`) | 4.663 | 1.8 | 1 |
| polacco (`pl`) | 16.041 | 6.1 | 1 |
| ceco (`cs`) | 6.230 | 2.3 | 1 |
| slovacco (`sk`) | 2.546 | 0.9 | 1 |
| russo (`ru`) | 11.679 | 4.7 | 1 |
| ucraino (`uk`) | 7.558 | 3.1 | 1 |
| bulgaro (`bg`) | 6.971 | 2.9 | 1 |
| serbo-croato (`sh`) | 13.550 | 4.7 | 1 |
| sloveno (`sl`) | 1.811 | 0.6 | 1 |
| greco moderno (`el`) | 3.625 | 1.5 | 1 |
| ungherese (`hu`) | 5.793 | 2.4 | 1 |
| finlandese (`fi`) | 15.333 | 5.8 | 1 |
| estone (`et`) | 2.694 | 1.0 | 1 |
| lituano (`lt`) | 1.957 | 0.9 | 1 |
| lettone (`lv`) | 1.712 | 0.9 | 1 |
| albanese (`sq`) | 4.024 | 1.8 | 1 |
| maltese (`mt`) | 7.058 | 2.4 | 1 |
| turco (`tr`) | 9.913 | 4.0 | 1 |
| arabo (`ar`) | 3.082 | 1.4 | 1 |
| persiano (`fa`) | 7.207 | 2.9 | 1 |
| ebraico (`he`) | 2.009 | 0.8 | 1 |

## Significato dei campi

- **Categoria**: `ereditato` (la parola viene da quella lingua per via naturale, non è un prestito), `prestito`, `latinismo_dotto` (preso dal latino scritto: ogni prestito dal latino è un latinismo dotto), `calco`, `non_precisato` (Wiktionary dice solo «deriva da»). Per «prestiti» il sito conti `prestito`, `calco` e `latinismo_dotto`.
- **Lingua diretta** = da dove la parola è arrivata subito. **Origine lontana** = l'ultimo punto della catena che Wiktionary descrive (ai bivi «pezzo vero + affisso» si segue il pezzo vero).
- Gli **stadi della stessa lingua** (medio inglese → inglese, latino tardo → latino…) non sono passaggi tra lingue e non compaiono né negli archi né nelle catene.
- `tipo_lingua`: `lingua`, `protolingua`, `famiglia` (es. germanico), `non lingua` (es. «translingual»), `sostrato`. Il sito può nascondere le non lingue.
- I **codici** sono quelli di Wiktionary (es. `ota` turco ottomano, `fro` francese antico). Nomi in `lingue.json`.

## Cartella `coppie/` (mandato 07): formato e percorsi

Un file per ogni coppia (lingua di arrivo, lingua diretta) tra le 33 lingue di arrivo e tutte le lingue dirette che compaiono nelle loro catene.
Dentro ci sono solo parole con una catena sicura (senza alternative), con categoria `ereditato`, `prestito`, `latinismo_dotto`, `calco` o `non_precisato`; niente stadi della stessa lingua, niente ipotesi scartate. Le parole sono in ordine alfabetico (senza maiuscole, poi forma esatta, poi numero di etimologia).

**Come si costruisce il percorso del file.** Tutti i percorsi sono relativi alla cartella `export/`.
- Coppia (arrivo `A`, diretta `X`): `coppie/A/X.json`. Quindi «inglese ← italiano» (quello che l'inglese ha preso dall'italiano, e anche quello che l'italiano ha dato all'inglese) è `coppie/en/it.json`; l'italiano ← turco ottomano è `coppie/it/ota.json`. Il lato «parole date» usa lo stesso file: ogni arco di `archi.json` (origine `O`, arrivo `A`) ha il file `coppie/A/O.json`.
- Nome del file = il codice Wiktionary con ogni carattere fuori da `A-Z a-z 0-9 _ -` sostituito da `_` (es. `pt-BR` resta `pt-BR`, un codice con il punto prende `_`). Eccezioni (nomi riservati di Windows come `con`, codici che differiscono solo per maiuscole): sono in `coppie/_eccezioni_nomi.json`; in ogni caso il percorso esatto è nel campo `file` di `coppie/A/_indice.json`, da usare al posto di costruirlo a mano.
- Secondo livello: `coppie/A/X__Y.json` = parole della coppia (A, X) la cui tappa successiva è la lingua `Y` (es. `coppie/it/ota__ar.json`: parole italiane arrivate dal turco ottomano, che a sua volta le aveva dall'arabo). Il percorso di ogni voce è anche nel campo `file` di `livello2.json` e nel campo `livello2` di `_indice.json`.
- Latino unito: `coppie/A/LATINO.json` somma tutte le varietà del latino (`la`, `la-*`, `itc-ola`, `itc-ala`); ogni parola ha in più il campo `origine_varieta` (il codice vero). Anche per il secondo livello: `LATINO__Y.json` (origine = latino unito, con `origine_varieta`) e `X__LATINO.json` (livello 2 = latino unito, con `livello2_varieta`). I file unici delle singole varietà (`la.json`, `la-lat.json`…) restano. **Le righe LATINO non vanno sommate alle altre.** Se origine e livello 2 sono tutte e due varietà del latino esiste solo il file con i codici veri.
- Parole con etimologia dubbia (più ipotesi alla pari): non stanno nei file delle coppie ma in `coppie/A/_alternative.json`, stesso formato con in più `alternative` e con `catena` vuota, `lontana` null, `termine_origine` vuoto; il loro numero è `n_alternative` in `lingue.json` (e in `_indice.json`).
- `coppie/A/_indice.json`: per ogni origine `{codice, nome, n, per_categoria:{ereditato, prestito, latinismo_dotto, calco, non_precisato}, file, unito, livello2:[{codice, nome, n, file}]}`, in ordine di numero di parole; la riga `LATINO` ha `unito: true`. In testa `n_parole` (parole con catena), `n_alternative`, `file_alternative`.

**Formato del file di una coppia.**
```
{"arrivo":"sq","origine":"la","origine_nome":"Latin","n":1230,"parole":[{"parola":"...","pos":"noun","n_etimologia":1,
 "categoria":"prestito","incerta":"no","significato":"...","termine_origine":"...",
 "catena":[{"codice":"la","nome":"Latin","termine":"...","categoria":"prestito"},{"codice":"grc","nome":"Ancient Greek","termine":"...","categoria":"non_precisato"}],
 "lontana":"grc","ambiti":["cucina"],"via":"","testo":"primi 300 caratteri dell'etimologia"}]}
```
- `categoria` (della parola) = categoria del primo legame (arrivo ← diretta). Nella `catena` ogni tappa ha la categoria del suo legame; la catena parte dalla lingua diretta e va verso l'origine lontana; `nome` è il nome inglese della lingua.
- `incerta`: `"sì"` o `"no"` (testo, con l'accento). Se è `"sì"` c'è anche `motivo_incerta` (campo in più rispetto all'accordo, presente solo in quel caso).
- `significato`: prima glossa inglese della voce che ha dato l'etimologia, al massimo 120 caratteri (con «…» se tagliata); vuoto se la voce non ha glosse (vedi avvertenze).
- `lontana`: codice dell'ultima tappa della `catena` (sempre coerente con la catena). `via`: testo, codici delle lingue citate nel testo come «via X» separati da `|`, solo se riconosciute e non già nella catena (spesso rumoroso: da usare con prudenza). `ambiti`: gruppi (cucina, mare…). `testo`: primi 300 caratteri dell'etimologia inglese.
- L'intestazione dei file del secondo livello ha in più `livello2` e `livello2_nome`.

## `griglia.json`

`lingue` (33 con `codice`, `nome_it`, `nome_en`), `colonne_extra` (`LATINO` = tutte le varietà del latino sommate, `altre` = ogni altra lingua, protolingua o famiglia), `primo_livello[arrivo][origine]` = parole la cui lingua diretta è l'origine e il cui primo legame è prestito, latinismo dotto o calco; `secondo_livello[arrivo][lingua]` = parole (stessa regola sul primo legame) la cui **tappa 2** è quella lingua, qualunque sia la lingua diretta; `primo_livello_tutte` e `secondo_livello_tutte` = lo stesso con tutte e cinque le categorie. Solo celle diverse da zero. Per ogni lingua di arrivo `parole_con_catena` e `parole_con_alternative` (le parole con alternative non sono contate nelle celle). Una cella di primo livello è uguale alla somma delle categorie prestito + latinismo_dotto + calco di `_indice.json` per quell'origine.

## Avvertenze da mostrare sul sito

1. **È una fotografia di Wiktionary, non una misura del vocabolario.** I numeri dicono cosa i redattori di Wiktionary hanno scritto sull'origine delle parole, non quante parole una lingua abbia davvero prestato o preso.
2. **Copertura molto disuguale.** I più coperti: finlandese 97%, polacco 95%, ungherese 94% dei lemmi con etimologia; i meno coperti: lettone 36%, arabo 20%, maltese 10%. Una lingua con pochi legami non ha per forza prestato poco: il campo `copertura` (buona ≥ 70%, media 30-70%, scarsa < 30%) serve a dirlo. Per l'italiano ha etimologia il 51% dei lemmi.
3. **Le cifre sono minimi.** Etimologie scritte solo a parole (es. «dal nome del ghetto di Venezia») non entrano; catene interrotte ai bivi; il confine tra prestito, ereditato e «deriva da» dipende da come i redattori scelgono il modello.
4. **Le date non sono usate** (decisione del 18/10/2026): non ci sono date negli export.
5. **Etimologie dubbie**: `incerta = true` e `motivo_incerta` dicono perché; le `alternative` sono ipotesi che Wiktionary presenta alla pari (es. «ragazzo»); le `scartate` sono ipotesi che il testo giudica improbabili (es. «baita» dall'arabo). Non vanno mostrate come catena.
6. **Ambiti** (cucina, mare, musica…): coprono poco (circa un quinto dei lemmi) e sono letti dalle etichette dei sensi: da usare come esempi.
7. **Wiktionary italiano**: per l'italiano esiste un confronto con il Wiktionary italiano (`risultati/confronto_itwikt.csv` e `.md`, non esportato qui): dove le due fonti non concordano (es. «guerra») il sito può dirlo.
8. **Significato** (mandato 07): è la prima glossa inglese della voce di Wiktionary che ha dato l'etimologia, tagliata a 120 caratteri; per le parole con più parti del discorso vale la prima voce. Manca per 234 parole su 385.453 (0.1%): sono voci senza nessuna glossa nei sensi. Per le parole omografe con più etimologie la glossa è quella della voce di quella etimologia. Non è una traduzione: è una definizione inglese.
9. **Peso della cartella `coppie/`**: 17.994 file, 300 MB; il file più grande è `coppie/ro/fr.json` (9.8 MB). Va bene per GitHub Pages ma ogni parola è ripetuta nel file della coppia, in `LATINO.json` e nei file del secondo livello: i file delle singole lingue in `parole/` restano come prima.
10. **Origine lontana e bivi**: nei file delle coppie `lontana` è l'ultima tappa della `catena` scritta nel file. Per circa il 5% delle parole il file `parole/<codice>.json` (campo `lontana`) e `rete_parole.csv` seguono invece la catena allungata oltre il bivio «pezzo vero + affisso» (la parte oltre il bivio non ha termini), quindi lì `lontana` può essere più lontana della catena.
11. **Parole con alternative**: non entrano né nelle coppie né nella griglia né nel secondo livello (stanno solo in `_alternative.json` e nei `parole/<codice>.json`).
