# Dati per il sito — esportazione JSON (mandati 05, 07, 09 e 11)

Prodotti da `script/esporta_sito.py` (`python -I -X utf8 script/esporta_sito.py risultati`) a partire dai file di `risultati/`. Tutti i file sono UTF-8, JSON compatto. **Fonte di tutto**: Wiktionary inglese (`raw-wiktextract-data.jsonl.gz`, estrazione Wiktextract del dump del 2026-09-02, scaricato da kaikki.org il **18/10/2026**) passato da `script/estrai_lingue.py`. Versione dell'export: **4** (mandato 11, 18/10/2026). Novità della versione 4 nella sezione «Versione 4 (mandato 11)» qui sotto: il romeno è fuori dalle statistiche, `statistiche.json` rifatto, e nuovi `lingua_extra/`, `doppioni/`, `andate_tornate/`, `famiglie.json`, `confronto/`; gli alberi distinguono gli omografi.

## Cosa c'è

| File o cartella | Contenuto | Da dove viene |
|---|---|---|
| `lingue.json` | `lingue_di_arrivo`: le 33 lingue di arrivo (codice, `nome_it`, `nome_en`, `lemmi`, `lemmi_con_etimologia`, `percentuale_con_etimologia`, `parole_con_legami`, `archi_in_entrata`, `archi_in_uscita`, `parole_prese_in_prestito`, `parole_date_in_prestito`, `copertura` = buona / media / scarsa, `n_alternative` e `file_indice_coppie`; **(mandato 11)** `archi_in_uscita_senza_romeno`, `parole_date_in_prestito_senza_romeno`, `escluso_dalle_statistiche` = true per il romeno; in testa `escluse_dalle_statistiche` e `nota_esclusione`). `altre_lingue_origine`: le 1401 altre lingue che compaiono come origine (codice, `nome_en`, `nome_it` se noto, `tipo_lingua`). | `rete_copertura.csv`, `rete_archi.csv`, `lingue_codici.csv`, `script/lingue_nomi_it.csv` |
| `archi.json` | 6.719 archi diretti tra lingue (origine, arrivo, categoria, `n_parole`, `n_incerte`, `tipo_lingua_origine`, fino a 12 `esempi`). Solo catene (parole senza alternative), tutte le categorie tranne `stadio_stessa_lingua`. Gli esempi sono le parole «riconoscibili» più corte (almeno 3 lettere, solo lettere, senza maiuscole, senza trattini né cifre), mostrate in ordine alfabetico. | `rete_archi.csv` (numeri), `rete_parole.csv` (esempi) |
| `parole/<codice>.json` | Per ciascuna delle 33 lingue di arrivo, l'elenco delle parole con almeno un legame vero (non quelle di sola formazione interna, né di soli stadi): `parola`, `traslitterazione` (solo se c'è), `pos`, `significato`, `n_etimologia`, `categoria`, `diretta` (codice della lingua diretta; `null` se la parola ha alternative), `lontana` (origine lontana; `null` se alternative), `catena` (lista di coppie `[codice, termine]` dalla lingua diretta all'ultima tappa), `traslitterazioni` (solo se almeno una tappa ne ha una: lista dello stesso numero di elementi di `catena`, stringa vuota dove manca), `incerta` (true/false), `motivo_incerta`, `alternative` (lista di `{codice, termine, [traslitterazione], categoria}`), `scartate` (ipotesi che il testo dice improbabili: non sono nella catena), `via` (lingue intermedie citate nel testo come «via X», solo se riconosciute; la lingua diretta non cambia), `ambiti` (gruppi), `testo` (primi 300 caratteri dell'etimologia). Se un file supera 15 MB è diviso per lettera iniziale in `parole/<codice>/<lettera>.json` con un `indice.json`. Il sito di oggi non lo legge più (usa `coppie/`), ma resta come secondo formato. | `rete_parole.csv`, `rete_relazioni.csv` |
| `livello2.json` | Il secondo passo delle catene, in due versioni. `da_chi_ha_preso`: chiave `arrivo\|diretta` (es. `it\|ota` = parole italiane la cui lingua diretta è il turco ottomano) → lista di `{codice, n, esempi}` con le lingue da cui la lingua diretta aveva preso quelle parole (fino a 8 esempi). `da_dove_la_origine_l_aveva_presa`: chiave `origine\|arrivo` con l'origine tra le 33 lingue (es. `fr\|en`: le parole inglesi prese dal francese, e da dove il francese le aveva prese); sono gli stessi dati, con la chiave rovesciata, per comodità del sito. `totali`: per ogni `arrivo\|diretta`, parole con catena e quante arrivano al livello 2 (le altre si fermano al primo passo). Stadi della stessa lingua e ipotesi scartate non contano come tappe. Ogni voce ha `file` (percorso del file con l'elenco delle parole) e `per_categoria`, e ci sono le chiavi e le voci `LATINO` (latino unito). 2.524 coppie in avanti, 528 indietro. **Mandato 09: la voce `LATINO` ora compare una sola volta per lista** (nella versione 2 era doppia, perché le due versioni condividevano gli stessi oggetti; controllo: voci con codice ripetuto in tutte le liste = 0). | `rete_relazioni.csv` |
| `storie.json` | Le 10 storie della sezione 10 di `COSE_INTERESSANTI.md`: `titolo`, `parola`, `lingua_arrivo`, `etimologie` (catene lette dai dati), `parole_collegate` (le altre parole citate nel testo, con le loro catene) e `testo` (il paragrafo). | `COSE_INTERESSANTI.md`, `rete_relazioni.csv` |
| `coppie/<arrivo>/…` | Le parole di ogni coppia (lingua di arrivo, lingua diretta) con significato, catena completa e traslitterazioni; i secondi livelli; il latino unito; **(mandato 09)** un file per ogni casella della griglia (`__via_<lingua>.json`, `__altre.json`); le parole con etimologia dubbia anche in coda agli elenchi; un indice per lingua. 22.623 file in tutto, 426 MB (di cui 13.513 di secondo livello, 4.333 `__via_*` e 33 `__altre`). | `rete_parole.csv`, `rete_relazioni.csv`, `dati/filtrato/glosse.jsonl` |
| `griglia.json` | La griglia della home: 33 lingue di arrivo × lingue di origine (le 33, più `LATINO` e `altre`), primo e secondo livello, solo prestiti (+ calchi e latinismi) e tutte le categorie. | gli stessi dati delle coppie |
| `indice/` | **Mandato 09.** Indice di ricerca «cerca una parola in tutte le lingue»: 385.453 parole (+ 48.083 righe per la ricerca nell'alfabeto originale) in 59 file, 53 MB, il più grande 4.66 MB. `indice/_meta.json` elenca i file. | `rete_parole.csv`, `rete_relazioni.csv`, `glosse.jsonl` |
| `alberi/<lingua>/<lettera>.json` | **Mandato 09.** Un albero per parola: l'origine più lontana in cima, le tappe, la parola, poi le lingue che l'hanno presa (ricorsivo). 845 file per 385.453 parole, 115 MB, il più grande 2.5 MB (`alberi/en/s.json`); 28.370 parole hanno almeno un discendente. | come le coppie |
| `statistiche.json` | **Mandato 09, rifatto nel mandato 11.** Le quattro statistiche scelte da Davide (`donatori_nascosti` con la `quota`, `lingue_di_passaggio`, `bilancio`, `parole_viaggiate` con le 10 di ogni lingua), romeno escluso come lingua di arrivo, 682 KB. | come le coppie |
| `lingua_extra/<codice>.json` | **Mandato 11.** Per ciascuna delle 33 lingue (romeno compreso): classifica delle origini lontane e le 10 parole più viaggiate. 33 file, 2054 KB. | alberi e catene |
| `doppioni/<codice>.json` | **Mandato 11.** Per ciascuna delle 33 lingue: coppie di parole segnate da Wiktionary come doppioni. 12.657 coppie in 33 file, 10.4 MB. | `dati/filtrato/etim_extra.jsonl` |
| `andate_tornate/<codice>.json` | **Mandato 11.** Per ciascuna delle 33 lingue: parole la cui catena torna alla lingua di partenza. 1.181 parole, 865 KB. | catene |
| `famiglie.json` | **Mandato 11.** Le 600 famiglie di parole che arrivano in più lingue. 2.6 MB. | catene e alberi |
| `confronto/<A>__<B>.json` | **Mandato 11.** Confronto tra due lingue: 528 file (tutte le coppie delle 33 lingue, A < B in ordine alfabetico), 6.7 MB. | catene |

Dimensioni dei file delle parole (`parole/`, parole con legami, MB, numero di file):

| Lingua | Parole | MB | File |
|---|---|---|---|
| italiano (`it`) | 19.507 | 7.1 | 1 |
| francese (`fr`) | 16.786 | 6.5 | 1 |
| spagnolo (`es`) | 19.932 | 7.4 | 1 |
| portoghese (`pt`) | 17.090 | 6.6 | 1 |
| catalano (`ca`) | 11.792 | 4.2 | 1 |
| romeno (`ro`) | 42.153 | 14.0 | 1 |
| inglese (`en`) | 70.361 | 32.9 | 52 |
| tedesco (`de`) | 13.303 | 5.6 | 1 |
| olandese (`nl`) | 13.899 | 5.5 | 1 |
| svedese (`sv`) | 8.835 | 3.6 | 1 |
| danese (`da`) | 8.426 | 3.2 | 1 |
| norvegese (bokmål) (`nb`) | 7.913 | 3.0 | 1 |
| islandese (`is`) | 4.663 | 1.8 | 1 |
| polacco (`pl`) | 16.041 | 6.3 | 1 |
| ceco (`cs`) | 6.230 | 2.3 | 1 |
| slovacco (`sk`) | 2.546 | 0.9 | 1 |
| russo (`ru`) | 11.679 | 5.2 | 1 |
| ucraino (`uk`) | 7.558 | 3.4 | 1 |
| bulgaro (`bg`) | 6.971 | 3.2 | 1 |
| serbo-croato (`sh`) | 13.550 | 5.0 | 1 |
| sloveno (`sl`) | 1.811 | 0.6 | 1 |
| greco moderno (`el`) | 3.625 | 1.7 | 1 |
| ungherese (`hu`) | 5.793 | 2.4 | 1 |
| finlandese (`fi`) | 15.333 | 5.8 | 1 |
| estone (`et`) | 2.694 | 1.0 | 1 |
| lituano (`lt`) | 1.957 | 0.9 | 1 |
| lettone (`lv`) | 1.712 | 0.9 | 1 |
| albanese (`sq`) | 4.024 | 1.8 | 1 |
| maltese (`mt`) | 7.058 | 2.5 | 1 |
| turco (`tr`) | 9.913 | 4.2 | 1 |
| arabo (`ar`) | 3.082 | 1.6 | 1 |
| persiano (`fa`) | 7.207 | 3.2 | 1 |
| ebraico (`he`) | 2.009 | 0.9 | 1 |

## Significato dei campi

- **Categoria**: `ereditato` (la parola viene da quella lingua per via naturale, non è un prestito), `prestito`, `latinismo_dotto` (preso dal latino scritto: ogni prestito dal latino è un latinismo dotto), `calco`, `non_precisato` (Wiktionary dice solo «deriva da»). Per «prestiti» il sito conti `prestito`, `calco` e `latinismo_dotto`.
- **Lingua diretta** = da dove la parola è arrivata subito. **Origine lontana** = l'ultimo punto della catena che Wiktionary descrive (ai bivi «pezzo vero + affisso» si segue il pezzo vero).
- Gli **stadi della stessa lingua** (medio inglese → inglese, latino tardo → latino…) non sono passaggi tra lingue e non compaiono né negli archi né nelle catene.
- `tipo_lingua`: `lingua`, `protolingua`, `famiglia` (es. germanico), `non lingua` (es. «translingual»), `sostrato`. Il sito può nascondere le non lingue.
- I **codici** sono quelli di Wiktionary (es. `ota` turco ottomano, `fro` francese antico). Nomi in `lingue.json`.
- **Chiave di una parola** = (lingua, parola, `n_etimologia`). Dal mandato 09 è unica: le 50 chiavi che comparivano due volte (voci aggiunte in fondo al file di Wiktextract, o due voci senza numero di etimologia) hanno il primo numero libero in più; l'elenco è in `risultati/chiavi_rinumerate.csv`.

## Traslitterazione (mandato 09, parte A)

Per le parole scritte in alfabeti non latini (arabo, ebraico, persiano, cirillico, greco, armeno, georgiano…) l'export porta la traslitterazione che dà Wiktionary. **Quando manca, il campo non c'è (o è la stringa vuota nell'indice): il sito mostra solo l'originale.**

- Dove: `traslitterazione` accanto alla parola (file `coppie/`, `parole/`, `alberi/`); `termine_origine_traslitterazione` accanto a `termine_origine` (file `coppie/`); `traslitterazione` dentro ogni elemento di `catena` (file `coppie/` e `alberi/`, campo `su`) e dentro ogni elemento di `alternative`; `t` nell'indice di ricerca; `traslitterazione` in ogni nodo di `giu` e nelle liste di `statistiche.json`. Nei file `coppie/` e `alberi/` i campi vuoti si omettono.
- Fonti (in `script/estrai_lingue.py`, una sola rilettura del file grande, risultato salvato in `dati/filtrato/traslitterazioni.jsonl`): per la parola, `forms[]` con tag `romanization` o `transliteration` (la prima), altrimenti `head_templates[].expansion` («parola • (traslitterazione)»); per le tappe, nell'ordine l'argomento `tr=` del modello (o `<tr:…>` negli argomenti di `ety`/`etymon`), il campo `transliteration` dei nodi dell'albero, il testo «termine (traslitterazione, “glossa”)» dell'espansione del modello o del blocco «Etymology tree» e, per ultima, una ricerca dello stesso termine (anche con segni diversi) in tutte le espansioni della voce. Si usa solo per termini in alfabeto non latino (più della metà delle lettere non latine) e si scartano i segni invisibili e la parte tra barre («škʿ /šakar/» diventa «škʿ»).
- Per ogni lingua, quante parole non latine hanno la traslitterazione e quante no (tabella sotto; file completi in `risultati/traslitterazione_parole.csv` e, per i termini delle catene, `risultati/traslitterazione_tappe.csv`). «Con legami» = le parole esportate.

| Lingua | Lemmi in alfabeto non latino | Con traslitterazione | Senza | % con | Con legami (esportate) | di cui senza traslitterazione |
|---|---|---|---|---|---|---|
| `ar` | 59.086 | 59.069 | 17 | 100.0 | 3.082 | 2 |
| `ru` | 51.068 | 51.052 | 16 | 100.0 | 11.677 | 1 |
| `el` | 26.730 | 26.675 | 55 | 99.8 | 3.625 | 0 |
| `uk` | 26.196 | 26.153 | 43 | 99.8 | 7.555 | 20 |
| `sh` | 24.416 | 24.342 | 74 | 99.7 | 5.991 | 6 |
| `bg` | 17.841 | 17.826 | 15 | 99.9 | 6.971 | 0 |
| `fa` | 14.085 | 14.058 | 27 | 99.8 | 7.207 | 4 |
| `he` | 11.776 | 11.766 | 10 | 99.9 | 2.009 | 1 |
| `es` | 101 | 0 | 101 | 0.0 | 0 | 0 |
| `ro` | 65 | 55 | 10 | 84.6 | 0 | 0 |
| `en` | 51 | 44 | 7 | 86.3 | 1 | 1 |
| `sq` | 41 | 37 | 4 | 90.2 | 0 | 0 |

## Cartella `coppie/`: formato e percorsi

Un file per ogni coppia (lingua di arrivo, lingua diretta) tra le 33 lingue di arrivo e tutte le lingue dirette che compaiono nelle loro catene. Dentro ci sono le parole con una catena sicura (senza alternative) con categoria `ereditato`, `prestito`, `latinismo_dotto`, `calco` o `non_precisato`, e **(mandato 09)** in coda le parole con alternative (vedi sotto); niente stadi della stessa lingua, niente ipotesi scartate. Le parole con catena sono in ordine alfabetico (senza maiuscole, poi forma esatta, poi numero di etimologia), poi vengono quelle con alternative, nello stesso ordine.

**Come si costruisce il percorso del file.** Tutti i percorsi sono relativi alla cartella `export/`.
- Coppia (arrivo `A`, diretta `X`): `coppie/A/X.json`. Quindi «inglese ← italiano» (quello che l'inglese ha preso dall'italiano, e anche quello che l'italiano ha dato all'inglese) è `coppie/en/it.json`; l'italiano ← turco ottomano è `coppie/it/ota.json`. Il lato «parole date» usa lo stesso file: ogni arco di `archi.json` (origine `O`, arrivo `A`) ha il file `coppie/A/O.json`.
- Nome del file = il codice Wiktionary con ogni carattere fuori da `A-Z a-z 0-9 _ -` sostituito da `_` (es. `pt-BR` resta `pt-BR`, un codice con il punto prende `_`). Eccezioni (nomi riservati di Windows come `con`, codici che differiscono solo per maiuscole): sono in `coppie/_eccezioni_nomi.json`; in ogni caso il percorso esatto è nel campo `file` di `coppie/A/_indice.json`, da usare al posto di costruirlo a mano.
- Secondo livello: `coppie/A/X__Y.json` = parole della coppia (A, X) la cui tappa successiva è la lingua `Y` (es. `coppie/it/ota__ar.json`: parole italiane arrivate dal turco ottomano, che a sua volta le aveva dall'arabo). Il percorso di ogni voce è anche nel campo `file` di `livello2.json` e nel campo `livello2` di `_indice.json`.
- **Casella della griglia, secondo livello (mandato 09)**: `coppie/A/__via_Y.json` = parole di A la cui **tappa 2** è la lingua `Y`, qualunque sia la lingua diretta (es. `coppie/bg/__via_ar.json`: parole bulgare che dall'arabo sono passate per un'altra lingua, di solito il turco ottomano). `Y` può essere una delle 33, `LATINO` (somma di tutte le varietà del latino; le parole hanno il campo `livello2_varieta`), `altre` (`__via_altre.json`: la tappa 2 non è né una delle 33 né latino) o qualunque altro codice (`__via_grc.json`…). Intestazione: `{arrivo, origine: null, origine_nome: null, livello2, livello2_nome, tipo: "via", n}`. Contiene tutte le categorie del primo legame; la cella della griglia (`secondo_livello`) conta solo prestito + latinismo_dotto + calco (somma delle categorie di `per_categoria` nel campo `via` di `_indice.json`).
- **Casella «altre», primo livello (mandato 09)**: `coppie/A/__altre.json` = parole di A la cui lingua **diretta** non è né una delle 33 né il latino (greco antico, francese antico, turco ottomano, protolingue…). Intestazione `{arrivo, origine: "altre", origine_nome, tipo: "altre", n}`. Stessa regola della cella `primo_livello[A].altre`.
- Latino unito: `coppie/A/LATINO.json` somma tutte le varietà del latino (`la`, `la-*`, `itc-ola`, `itc-ala`); ogni parola ha in più il campo `origine_varieta` (il codice vero). Anche per il secondo livello: `LATINO__Y.json` (origine = latino unito, con `origine_varieta`) e `X__LATINO.json` (livello 2 = latino unito, con `livello2_varieta`). I file unici delle singole varietà (`la.json`, `la-lat.json`…) restano. **Le righe LATINO non vanno sommate alle altre.** Se origine e livello 2 sono tutte e due varietà del latino esiste solo il file con i codici veri.
- **Parole con etimologia dubbia (mandato 09)**: sono ancora tutte in `coppie/A/_alternative.json` (una volta sola, `catena` vuota, `lontana` null, `termine_origine` vuoto, `testo` e `alternative`), e in più **compaiono in coda al file di ciascuna origine delle loro ipotesi** (`coppie/A/<codice>.json` per ogni codice tra le `alternative`, e in `LATINO.json` se un'ipotesi è latina) con `incerta: "sì"`, `categoria` e `termine_origine` di quell'ipotesi, `catena` di un solo passo (quell'ipotesi), `lontana` = il codice dell'ipotesi e il campo `alternative` con tutte le ipotesi. Non stanno nei file di secondo livello, nei `__via_*` e in `__altre.json`, né nella griglia. Il loro numero è `n_alternative` in `lingue.json`, in `_indice.json` (in testa e per ogni origine) e nell'intestazione di ogni file.
- `coppie/A/_indice.json`: per ogni origine `{codice, nome, n, n_catena, n_alternative, per_categoria:{ereditato, prestito, latinismo_dotto, calco, non_precisato}, file, unito, livello2:[{codice, nome, n, file}]}`, in ordine di numero di parole; la riga `LATINO` ha `unito: true`. **`n` conta le parole del file (con catena + con alternative); `per_categoria` conta solo quelle con catena, quindi la somma è `n_catena`** e le celle della griglia restano uguali alla somma prestito + latinismo_dotto + calco. In testa `n_parole` (parole con catena), `n_alternative`, `file_alternative`; `via`: `[{codice, nome, n, per_categoria, file, unito}]` (le lingue della tappa 2); `altre`: `{file, n, per_categoria}` oppure `null`.

**Formato del file di una coppia.**
```
{"arrivo":"sq","origine":"la","origine_nome":"Latin","n":1230,"n_alternative":3,"parole":[{"parola":"...","pos":"noun","n_etimologia":1,
 "categoria":"prestito","incerta":"no","significato":"...","termine_origine":"...",
 "catena":[{"codice":"la","nome":"Latin","termine":"...","categoria":"prestito"},{"codice":"grc","nome":"Ancient Greek","termine":"...","traslitterazione":"...","categoria":"non_precisato"}],
 "lontana":"grc","ambiti":["cucina"],"via":"","testo":"primi 300 caratteri dell'etimologia"}]}
```
- `categoria` (della parola) = categoria del primo legame (arrivo ← diretta). Nella `catena` ogni tappa ha la categoria del suo legame; la catena parte dalla lingua diretta e va verso l'origine lontana; `nome` è il nome inglese della lingua.
- `traslitterazione` (se c'è), `termine_origine_traslitterazione` (se c'è): vedi sopra. Ordine dei campi: `parola`, `traslitterazione`, `pos`, `n_etimologia`, `categoria`, `incerta`, `motivo_incerta`, `significato`, `termine_origine`, `termine_origine_traslitterazione`, `catena`, `lontana`, `ambiti`, `via`, `testo`, `alternative` (l'ordine non è un contratto).
- `incerta`: `"sì"` o `"no"` (testo, con l'accento). Se è `"sì"` c'è anche `motivo_incerta`. Le parole con alternative sono sempre `"sì"` (se il motivo manca, vale «more than one origin proposed»).
- `significato`: prima glossa inglese della voce che ha dato l'etimologia, al massimo 120 caratteri (con «…» se tagliata); vuoto se la voce non ha glosse (vedi avvertenze).
- `lontana`: codice dell'ultima tappa della `catena` (sempre coerente con la catena). `via`: testo, codici delle lingue citate nel testo come «via X» separati da `|`, solo se riconosciute e non già nella catena (spesso rumoroso: da usare con prudenza). `ambiti`: gruppi (cucina, mare…).
- **`testo` (primi 300 caratteri dell'etimologia inglese) c'è solo nei file semplici `coppie/A/X.json` e in `_alternative.json`.** Non c'è più nei file di secondo livello (`X__Y.json`, `LATINO__Y.json`, `X__LATINO.json`), in `LATINO.json`, nei `__via_*` e in `__altre.json` (mandato 09, per dimezzare il peso): la scheda parola lo legge dal file semplice della sua lingua diretta (`catena[0].codice`).
- L'intestazione dei file del secondo livello ha in più `livello2` e `livello2_nome`.

## `indice/`: ricerca di una parola in tutte le lingue (mandato 09, parte B)

`indice/<lettera>.json` è una lista di righe, una per parola delle 33 lingue (anche quelle con alternative). Riga:

```
{"p":"caffè","n":"caffe","l":"it","ne":1,"s":"coffee (plant and drink)","t":"","c":"prestito","o":"ota"}
```
`p` parola come scritta; `n` forma normalizzata; `l` lingua; `ne` numero di etimologia; `s` significato (glossa inglese, come nelle coppie); `t` traslitterazione (stringa vuota se manca o se la parola è in alfabeto latino); `c` categoria; `o` lingua diretta (per le parole con alternative i codici delle ipotesi separati da `|`). In più, solo quando valgono: `i: 1` (etimologia incerta), `a: 1` (la parola ha alternative) e `f` (solo nelle righe «in più» dell'alfabeto originale dei file `_<lingua>.json`: la lettera del file dell'albero, che è quella della traslitterazione). Le righe di ogni file sono in ordine di `n`, poi `p`, `l`, `ne`.

**Normalizzazione** (la stessa va applicata al testo cercato): `n` = parola (oppure, se la parola è in alfabeto non latino e ha la traslitterazione, la traslitterazione) in minuscolo (`str.lower`), scomposta in Unicode NFD, senza i segni combinati (categoria `Mn`: accenti, vocali brevi dell'arabo, punti dell'ebraico…), con le lettere speciali della tabella `tabella_lettere` di `_meta.json` (`đ→d`, `ł→l`, `ø→o`, `æ→ae`, `ß→ss`, `þ→th`…) e **senza apostrofi** (`'`, `’`, `ʿ`, `ʾ`…). Esempi: «caffè» → `caffe`, «قهوة» con traslitterazione «qahwa» → `qahwa`, «šakar» → `sakar`.

**Come si sceglie il file.** `lettera` = primo carattere di `n` se è `a-z`, altrimenti `_`. `_meta.json` ha `lettere` (lettera → lista di file) e `file` (per ogni file `file`, `lettera`, `prefisso`, `n_righe`, `byte`):
- se la lettera ha un solo file, è quello;
- se la lettera è stata divisa (file sopra 5 MB; lettere divise: nessuna), ogni file ha un `prefisso` di 2-4 caratteri (`ca`, `co_`, `con`…, con `_` al posto di ciò che non è `a-z` o manca): si carica il file il cui prefisso è l'inizio della chiave di `n` costruita allo stesso modo (primi caratteri di `n`, `_` per i non `a-z`, riempita con `_`). I prefissi non si sovrappongono;
- per `_` (alfabeti non latini e simboli) si caricano **tutti** i file della lista: sono uno per lingua (`indice/_ar.json`, `_ru.json`…). Lì le parole in alfabeto non latino hanno `n` = **forma originale normalizzata** (così si trovano scrivendo nell'alfabeto originale, es. «кафе» o «قهوة»); se hanno la traslitterazione compaiono anche nel file della lettera della traslitterazione, con `n` = traslitterazione normalizzata (sono le righe «in più» del conteggio sopra).

`_meta.json` ha anche `n_righe`, `n_righe_alfabeto_originale_in_piu`, `n_file`, `byte_massimo`. Nessun file supera 5 MB.

## `alberi/`: l'albero di una parola (mandato 09, parte C)

`alberi/<lingua>/<lettera>.json` è un oggetto `{ "parola|n_etimologia": voce, … }` (chiave per esempio `"caffè|1"`). La `lettera` è calcolata come per l'indice (primo carattere di `n` se `a-z`, altrimenti `_`; per `n` si usa la traslitterazione se la parola è in alfabeto non latino e ce l'ha). Per trovare l'albero di una riga dell'indice: `alberi/<l>/<f>.json` se la riga ha il campo `f`, altrimenti `alberi/<l>/<lettera di n>.json`; chiave `p|ne`. Voce:

```
{"traslitterazione":"","significato":"coffee (plant and drink)","categoria":"prestito",
 "su":[{"codice":"ota","nome":"Ottoman Turkish","termine":"قهوه","traslitterazione":"kahve","categoria":"prestito"},{"codice":"ar","nome":"Arabic","termine":"قَهْوَة","traslitterazione":"qahwa","categoria":"prestito"}],
 "giu":[{"lingua":"nl","parola":"koffie","n_etimologia":1,"traslitterazione":"","significato":"…","categoria":"prestito","giu":[…]}],
 "radici_altre":["caffè|2"]}
```
- `su`: la catena verso l'alto, dalla lingua diretta all'origine lontana (come `catena` nei file di coppia: `codice`, `nome`, `termine`, `traslitterazione` se c'è, `categoria`). Per disegnare l'albero si legge al contrario: in cima l'ultimo elemento, poi gli altri, poi la parola. Vuoto per le parole con alternative.
- `giu`: i discendenti, ricorsivi: parole delle altre lingue tra le 33 il cui **primo termine di origine** (`termine_origine`, confronto con la stessa normalizzazione dell'indice) e la cui **lingua diretta** sono questa parola e questa lingua. Ogni nodo: `{lingua, parola, n_etimologia, traslitterazione, significato, categoria, giu}` (più `ambiguo: true` quando vale) (`categoria` = categoria del legame con la parola da cui discende). Si scende per **al massimo 4 livelli** e **60 nodi per albero** (in ordine di livello, poi lingua e parola); se si taglia, la voce ha `troncato: true` e i nodi i cui figli sono stati tagliati hanno `troncato: true` (4 alberi tagliati). Tutte le categorie, anche `ereditato` e `non_precisato`.
- **Ambiguità (mandato 11, parte G)**: se la stessa grafia ha più etimologie nella stessa lingua (omografi: *piano* italiano «piano» o «pianoforte»…), il discendente si collega a una sola quando si può scegliere, in quest'ordine: (1) a parità si preferisce la grafia identica (non quella che differisce solo per accenti o maiuscole); (2) l'`id` di etimologia scritto nel modello del discendente (`<id:…>` di `ety`/`etymon`, `id=` dei modelli classici) coincide con l'`id` di una sola voce dell'antenato (modello `etymid` o `id=` di `ety`/`etymon` in testa alla voce); (3) la glossa citata nel modello (`t=`, `gloss`, quinto argomento, `<t:…>`) assomiglia alle glosse di una sola voce dell'antenato (almeno metà delle parole della glossa del modello ritrovate nelle glosse della voce; a parità resta più di una). Se non c'è modo di scegliere, il discendente compare sotto **tutte** le etimologie di quella grafia con **`ambiguo: true`** nel nodo. Il sito può mostrarli con un «?» o in grigio. Nella voce dell'antenato **`n_omografi_antenato`** (solo se > 0) dice quante altre etimologie con la stessa grafia esistono (è la lunghezza di `radici_altre`): se è > 0, i nodi di `giu` con `ambiguo: true` possono appartenere a un'altra voce. Numeri nella sezione «Versione 4».
- `radici_altre`: le altre chiavi `parola|n` della stessa grafia nella stessa lingua (altre etimologie, es. `piano` inglese ha due). Vuota se non ce ne sono.
- In più, solo quando valgono: `troncato`, `n_omografi_antenato`, `incerta: "sì"`, `alternative` (per le parole con alternative: lista di `{codice, nome, termine, traslitterazione, categoria}`, e `su` è vuoto).

## `statistiche.json` (mandato 09, parte D; rifatto nel mandato 11, parte A)

Le quattro scelte di Davide, ciascuna con un campo `nota` (inglese semplice, una frase, cosa misura e il limite). Tutte contano solo le parole con catena. Dove non è detto altro, «prestiti» = prima tappa `prestito`, `latinismo_dotto` o `calco` (come le celle della griglia). Tutte le varietà del latino sono sommate nel codice `LATINO` (nome «Latin (all varieties)»).

**Romeno fuori (decisione di Davide, 18/10/2026).** Il romeno resta visibile (pagina, griglia, elenchi) ma non conta come lingua di arrivo in nessuna statistica o classifica: il Wiktionary romeno attribuisce al francese 28.409 parole (convenzione dei redattori: anche le parole colte internazionali sono «dal francese») e schiaccerebbe tutto. Ogni blocco ha `escluse: ["ro"]` e `nota_esclusione` (inglese semplice, una frase); lo stesso nel file e in `lingue.json`. Il romeno può comparire come lingua di origine o di passaggio (per esempio tra le lingue di passaggio) e ha le sue pagine in `lingua_extra/`, `doppioni/`, `andate_tornate/` e `confronto/` (con `nota_romeno`).
- `donatori_nascosti.per_arrivo[A]` (32 lingue, **non c'è `ro`**): lista di `{codice, nome_it, nome_en, tipo_lingua, diretto, secondo_livello, quota, via:[{codice, nome_it, nome_en, n}]}`. `diretto` = parole che A ha preso direttamente da quella lingua; `secondo_livello` = parole di A la cui tappa 2 è quella lingua; **`quota = secondo_livello / (diretto + secondo_livello)`** (0-1, tre decimali; il sito la mostra in %); si tengono le coppie con `secondo_livello` ≥ 20, **ordinate per quota** (poi per `secondo_livello`) e per ogni lingua **le prime 15**; `via` = le lingue dirette intermedie (prime 10) con i numeri. Niente protolingue, famiglie e non-lingue. Il campo `rapporto` della versione 3 non c'è più. Altri campi del blocco: `soglia_secondo_livello`, `prime_per_lingua`, `n_coppie` (tenute), `n_coppie_sopra_soglia`, `n_coppie_escluse` (protolingue e simili). Esempio: bulgaro ← arabo, diretto 5, secondo livello 104, quota 0,954, via turco ottomano 94.
- `lingue_di_passaggio.lingue`: come nella versione 3 (lista in ordine decrescente di `n_parole`, `{codice, nome_it, nome_en, tipo_lingua, n_parole, n_tutte_le_categorie, n_lingue_di_arrivo, per_arrivo:[{arrivo, nome_it, nome_en, n}]}`, prime 8 lingue di arrivo), ma **le parole romene non contano**.
- `bilancio.lingue`: per ogni lingua tranne `ro` `{codice, nome_it, nome_en, date, ricevute, rapporto, archi_in_uscita, archi_in_entrata, percentuale_con_etimologia, copertura}`. `ricevute` = `parole_prese_in_prestito`; **`date` = `parole_date_in_prestito_senza_romeno`** e `archi_in_uscita` = `archi_in_uscita_senza_romeno` di `lingue.json` (le parole date al romeno non contano); `rapporto = date / ricevute`. Il rapporto dipende dalla copertura di Wiktionary: va sempre mostrato con `copertura`.
- `parole_viaggiate.catena_piu_lunga` e `.prese_da_piu_lingue`: come nella versione 3 (le 100 parole con più tappe tra lingue diverse, stadi esclusi, protolingue contate come tappe, `n_tappe_lingue_vere`; le 100 con più lingue diverse tra i discendenti diretti), senza parole romene. Campi: `lingua`, `nome_it`, `parola`, `n_etimologia`, `traslitterazione`, `significato`, `categoria`, `file_albero` (es. `alberi/it/z.json`), `chiave_albero` (es. `zucchero|1`); la prima lista ha anche `catena`, la seconda `n_lingue`, `n_discendenti_diretti`, `lingue:[{codice, n}]`.
- **`parole_viaggiate.per_lingua[codice]` (mandato 11)**: per ciascuna lingua tranne `ro`, le 10 parole con più lingue diverse nella catena (stessa lista di `lingua_extra/<codice>.json` → `piu_viaggiate.lista`; vedi sotto), ognuna con `lingua` in più.
- Ogni blocco ha `escluse` e `nota_esclusione`; `parole_viaggiate` ha anche `nota_catena_piu_lunga`, `nota_prese_da_piu_lingue`, `nota_per_lingua`.

## `griglia.json`

`lingue` (33 con `codice`, `nome_it`, `nome_en`), `colonne_extra` (`LATINO` = tutte le varietà del latino sommate, `altre` = ogni altra lingua, protolingua o famiglia), `primo_livello[arrivo][origine]` = parole la cui lingua diretta è l'origine e il cui primo legame è prestito, latinismo dotto o calco; `secondo_livello[arrivo][lingua]` = parole (stessa regola sul primo legame) la cui **tappa 2** è quella lingua, qualunque sia la lingua diretta; `primo_livello_tutte` e `secondo_livello_tutte` = lo stesso con tutte e cinque le categorie. Solo celle diverse da zero. Per ogni lingua di arrivo `parole_con_catena` e `parole_con_alternative` (le parole con alternative non sono contate nelle celle). Una cella di primo livello è uguale alla somma delle categorie prestito + latinismo_dotto + calco di `_indice.json` per quell'origine. **File delle caselle (mandato 09)**: primo livello `coppie/arrivo/origine.json` (colonna `altre`: `coppie/arrivo/__altre.json`), secondo livello `coppie/arrivo/__via_lingua.json` (colonna `altre`: `__via_altre.json`).

## Versione 4 (mandato 11)

Tutti i file nuovi si leggono da soli (non dipendono da altri), hanno `lingua`/`A`/`B`, `nome_it`/`nome_en` e una `nota` in inglese semplice. Dove una voce è una parola di una lingua, i campi sono sempre gli stessi (`voce_parola`): `parola`, `traslitterazione` (solo se c'è), `n_etimologia`, `significato`, `categoria`, e per aprire l'albero `file_albero` (es. `alberi/it/c.json`) e `chiave_albero` (es. `caffè|1`); dove serve la catena: `catena` = lista di `{codice, nome, termine, traslitterazione (se c'è), categoria}` dalla lingua diretta all'origine lontana. Le lingue citate (`voce_lingua`) hanno `codice`, `nome_it`, `nome_en` (e altri campi sotto). Il codice `LATINO` somma tutte le varietà del latino. Ordine dei campi non è un contratto.

### `lingua_extra/<codice>.json` (parte B)

```
{"lingua":"it","nome_it":"italiano","nome_en":"Italian","escluso_dalle_statistiche":false,
 "origini_lontane":{"nota":"…","n_parole_prese":8304,"n_origini":134,"n_parole_con_origine_non_lingua":101,
   "lista":[{"codice":"LATINO","nome_it":"…","nome_en":"…","tipo_lingua":"lingua","n":4025,
             "strade":[{"codice":"LATINO","nome_it":"…","nome_en":"…","n":3722},…(3)],
             "esempi":[{parola, traslitterazione?, n_etimologia, significato, categoria, file_albero, chiave_albero}×5]}, …(40)]},
 "origini_ricostruite":{"nota":"…","n_origini":29,"lista":[…(40, stesso formato, con tipo_lingua protolingua/famiglia/sostrato)]},
 "piu_viaggiate":{"nota":"…","lista":[{parola, traslitterazione?, n_etimologia, significato, categoria, catena, n_lingue, n_lingue_vere, n_tappe, n_lingue_che_l_hanno_presa, file_albero, chiave_albero}×10]},
 "nota_romeno":"…"   (solo in ro.json)}
```
- `origini_lontane`: le parole **prese** (prima tappa `prestito`, `latinismo_dotto` o `calco`) di quella lingua, raggruppate per lingua dell'**ultima tappa della catena scritta** (`lontana` dei file di coppia; ai bivi «pezzo vero + affisso» la base). Prime 40 lingue vere per `n`; `strade` = le 3 lingue dirette più frequenti per quell'origine (con `n`); `esempi` = 5 parole con grafia diversa (prima le «riconoscibili», poi quelle con più discendenti, poi le più corte). Le varietà del latino sono sommate in `LATINO`. Le **protolingue, le famiglie e i sostrati** (`tipo_lingua` ≠ `lingua`) stanno a parte in `origini_ricostruite` (prime 40); le non-lingue (`mul`, `und`) non compaiono (le loro parole sono contate in `n_parole_con_origine_non_lingua`).
- `piu_viaggiate.lista`: le 10 parole della lingua con più **lingue diverse** nella catena (stadi della stessa lingua già esclusi; la stessa lingua conta una volta; le protolingue contano come lingue: `n_lingue_vere` le toglie); solo parole con prima tappa prestito/calco/latinismo; a parità più tappe, poi più lingue che l'hanno presa (`n_lingue_che_l_hanno_presa`, discendenti diretti nell'albero); una per grafia. `catena` = `{codice, nome, termine, traslitterazione?}`.
- Per `ro` c'è `nota_romeno` (la stessa di `nota_esclusione`).

### `doppioni/<codice>.json` (parte C)

```
{"lingua":"it","nome_it":"…","nome_en":"…","escluso_dalle_statistiche":false,"nota":"…","n_coppie":722,
 "coppie":[{"a":{voce_parola + catena},"b":{voce_parola + catena},
            "origine_comune":{"codice":"gem-pro","nome_it":"…","nome_en":"…","termine":"*bankiz","traslitterazione?":"…"}  |  null,
            "strade":["lng","lng"],"n_lingue":4}, …]}
```
- Fonte: i modelli `doublet` / `dbt` (e le relazioni `:doublet` di `ety`/`etymon`) letti nel file grande da `script/estrai_extra.py` (una sola rilettura, salvata in `dati/filtrato/etim_extra.jsonl`). Una coppia (a, b) è un doppione dichiarato da una delle due parole (o da tutte e due) fra parole **della stessa lingua**; compare una volta sola, nel file di quella lingua. Se il compagno ha più etimologie si sceglie quella con l'`id` indicato, poi quella con catena e un'origine in comune con l'altra, poi la prima.
- Entrano solo le coppie in cui **tutte e due le parole hanno una catena** nell'export (678 dichiarazioni scartate perché una delle due non ha catena, 3.786 perché il compagno non ha legami e non è nell'export, 6 dichiarate per un'altra lingua).
- `origine_comune` = la prima tappa della catena di `a` (dalla lingua diretta verso l'origine) che c'è anche nella catena di `b` con lo stesso codice e lo stesso termine (confronto di forme normalizzate; latino sommato); `null` se non c'è. `strade` = le due lingue dirette (`a.catena[0]`, `b.catena[0]`). `n_lingue` = lingue diverse nelle due catene insieme (latino sommato, stadi esclusi).
- **Ordine**: per `n_lingue` decrescente, poi prima quelle con `origine_comune`, poi alfabetico (le più «spettacolari» prima). Numero di coppie per lingua nella tabella sotto.

| Lingua | Coppie |
|---|---|
| italiano (`it`) | 722 |
| francese (`fr`) | 687 |
| spagnolo (`es`) | 990 |
| portoghese (`pt`) | 961 |
| catalano (`ca`) | 433 |
| romeno (`ro`) | 497 |
| inglese (`en`) | 5.257 |
| tedesco (`de`) | 419 |
| olandese (`nl`) | 323 |
| svedese (`sv`) | 364 |
| danese (`da`) | 114 |
| norvegese (bokmål) (`nb`) | 77 |
| islandese (`is`) | 14 |
| polacco (`pl`) | 571 |
| ceco (`cs`) | 43 |
| slovacco (`sk`) | 8 |
| russo (`ru`) | 313 |
| ucraino (`uk`) | 108 |
| bulgaro (`bg`) | 36 |
| serbo-croato (`sh`) | 63 |
| sloveno (`sl`) | 2 |
| greco moderno (`el`) | 20 |
| ungherese (`hu`) | 29 |
| finlandese (`fi`) | 111 |
| estone (`et`) | 10 |
| lituano (`lt`) | 5 |
| lettone (`lv`) | 1 |
| albanese (`sq`) | 61 |
| maltese (`mt`) | 37 |
| turco (`tr`) | 174 |
| arabo (`ar`) | 101 |
| persiano (`fa`) | 84 |
| ebraico (`he`) | 22 |

### `andate_tornate/<codice>.json` (parte D)

```
{"lingua":"it",…,"nota":"…","n":25,
 "parole":[{voce_parola, "catena":[…], "rientro_da":{codice,nome_it,nome_en}, "uscita_verso":{codice,nome_it,nome_en},
            "partenza":{codice,nome_it,nome_en,termine,traslitterazione?}, "lunghezza_giro":3}, …]}
```
- Una parola di L è «andata e tornata» se, nella sua catena (verso l'alto), compare di nuovo L **o un suo stadio** (tabella `script/stadi_lingua.csv`: italiano antico per `it`, medio francese per `fr`, medio inglese per `en`…) dopo almeno un'altra lingua. Esempio: *mohair* italiano ← francese ← inglese ← italiano *mocaiardo* ← arabo.
- Il giro è valido solo se le tappe prima del ritorno sono **lingue vere e tutte diverse** (se c'è una protolingua o una lingua ripetuta, la catena mette in fila rami diversi di una parola composta: scartata; 305 catene scartate così).
- `rientro_da` = la lingua diretta della parola (`catena[0]`); `uscita_verso` = la **prima lingua che ha preso la parola da L** andando avanti nel tempo (cioè la tappa subito prima del ritorno nella catena, che si legge dal presente al passato); `partenza` = la tappa di L (o del suo stadio) dove il viaggio è cominciato, con il suo termine; `lunghezza_giro` = tappe dalla partenza alla parola di oggi (numero di lingue in mezzo + 1). Ordine: `lunghezza_giro` decrescente, poi alfabetico. Se `uscita_verso` e `rientro_da` coincidono la parola è andata e tornata dalla stessa lingua.

| Lingua | Parole andate e tornate | Le più lunghe |
|---|---|---|
| italiano (`it`) | 25 | ussaro (4), amistà (3), magazine (3) |
| francese (`fr`) | 125 | aligot (3), blouse (3), caboche (3) |
| spagnolo (`es`) | 30 | martingala (4), aligátor (3), rial (3) |
| portoghese (`pt`) | 22 | krio (5), albatroz (3), carambola (3) |
| catalano (`ca`) | 5 | després (2), estramoni (2), garrafal (2) |
| romeno (`ro`) | 1 | cotor (2) |
| inglese (`en`) | 512 | aloe (5), jot (5), Lowe (5) |
| tedesco (`de`) | 89 | Schock (5), Dollar (4), Erpel (4) |
| olandese (`nl`) | 51 | cilindervormig (4), filibuster (4), piekfijn (3) |
| svedese (`sv`) | 15 | förbjuda (3), -a- (2), -ig (2) |
| danese (`da`) | 6 | herskab (3), -et (2), denne (2) |
| norvegese (bokmål) (`nb`) | 2 | krage (2), åkle (2) |
| islandese (`is`) | 0 | - |
| polacco (`pl`) | 5 | manat (3), manat (3), budowa (2) |
| ceco (`cs`) | 3 | luštit (3), pistole (3), vějíř (2) |
| slovacco (`sk`) | 0 | - |
| russo (`ru`) | 10 | манат (3), валах (2), далеба (2) |
| ucraino (`uk`) | 10 | бавити (2), банка (2), виноград (2) |
| bulgaro (`bg`) | 1 | шайка (3) |
| serbo-croato (`sh`) | 1 | kravata (3) |
| sloveno (`sl`) | 0 | - |
| greco moderno (`el`) | 210 | φλιτζάνι (6), μπουκάλι (5), τερπένιο (5) |
| ungherese (`hu`) | 0 | - |
| finlandese (`fi`) | 2 | jäämi (2), kolata (2) |
| estone (`et`) | 0 | - |
| lituano (`lt`) | 0 | - |
| lettone (`lv`) | 0 | - |
| albanese (`sq`) | 1 | arnaut (3) |
| maltese (`mt`) | 0 | - |
| turco (`tr`) | 6 | türban (3), avrat (2), boza (2) |
| arabo (`ar`) | 19 | أرضي شوكي (6), إيبيزا (4), شربات (4) |
| persiano (`fa`) | 26 | پیژامه (4), برنز (3), زرافه (3) |
| ebraico (`he`) | 4 | חברה (2), טוסיק (2), שלומיאל (2) |

### `famiglie.json` (parte E)

```
{"fonte":…,"escluse":["ro"],"nota_esclusione":"…","nota":"…","n_famiglie_totali":103800,
 "famiglie":[{"radice":{"codice":"ar","nome_it":"arabo","nome_en":"Arabic","tipo_lingua":"lingua","termine":"قَهْوَة","traslitterazione":"qahwa"},
              "n_lingue":29,"n_parole":62,
              "esempio":{"lingua":"it","parola":"caffè",n_etimologia, significato, categoria, file_albero, chiave_albero},
              "parole":[{"lingua":"bg","parola":"кафе","traslitterazione":"kafé","significato":"coffee","categoria":"prestito","n_etimologia":1}, …],
              "troncato":false}, …(600)]}
```
- **Radice** = l'ultima tappa della catena che è una **lingua attestata** (`tipo_lingua` = `lingua`: niente protolingue, famiglie, non-lingue) e ha un termine; se la catena arriva a una protolingua, la radice è l'ultima lingua vera prima della protolingua (lingua + termine normalizzato; latino sommato). Le radici sono quindi sempre lingue vere (caffè → arabo, tè → cinese, banca → longobardo). **Famiglia** = le parole delle 33 lingue la cui catena finisce in quella radice, più **tutti i loro discendenti negli alberi** (collegamenti non ambigui, senza limite di livelli). Una radice che è solo una tappa di catene che finiscono più lontano (per esempio il turco ottomano *kahve* prima dell'arabo) entra nella famiglia di quella radice più lontana, se il numero delle catene che ci passano è almeno la metà di quelle che ci finiscono (10.515 radici unite). Le famiglie con le stesse parole di un'altra più grande (8.026) sono la stessa famiglia vista da un'altra radice e si tengono una volta sola.
- **Scelta mia**: le parole **ereditate** (categoria `ereditato`) non entrano, né nel conteggio né nell'elenco; altrimenti la classifica la riempirebbero le famiglie ereditate dal protoindoeuropeo e dal latino. Restano prestiti, latinismi, calchi e «non precisato».
- `n_lingue` = lingue diverse **senza il romeno**; `n_parole` = parole senza il romeno. Le parole romene sono nell'elenco `parole` con `escluso_dal_conteggio: true`. L'elenco è ordinato per lingua (codice), poi parola, al massimo 200 voci (`troncato: true` se di più). `esempio` = la parola italiana se c'è (la più «riconoscibile»/con più discendenti), altrimenti l'inglese, altrimenti la prima.
- Le prime 600 per `n_lingue`, poi `n_parole` (correzione del 18/10/2026: prima erano 300 e le radici potevano essere anche protolingue; ora la radice è sempre una lingua attestata, così in testa ci sono parole viaggiate come caffè, zucchero, banca).

Le prime 20 famiglie (radice, lingue, parole, esempio):

| # | Radice | Lingue | Parole | Esempio |
|---|---|---|---|---|
| 1 | `grc` κιθάρα (kithára) | 30 | 51 | chitarra (`it`) |
| 2 | `LATINO` caementum | 30 | 35 | cemento (`it`) |
| 3 | `es` platina | 30 | 35 | platino (`it`) |
| 4 | `tpw` îagûara | 30 | 35 | giaguaro (`it`) |
| 5 | `gkm` πίτα (píta) | 30 | 32 | apizza (`en`) |
| 6 | `ar` قَهْوَة (qahwa) | 29 | 62 | caffè (`it`) |
| 7 | `sa` शर्क॑रा (śárkarā) | 29 | 48 | zucchero (`it`) |
| 8 | `LATINO` videō | 29 | 38 | video (`it`) |
| 9 | `peo` 𐏋 (XŠ) | 28 | 61 | scacco (`it`) |
| 10 | `de` Taler | 28 | 43 | dollaro (`it`) |
| 11 | `LATINO` prīnceps | 28 | 35 | principe (`it`) |
| 12 | `tpw` naná | 28 | 28 | ananas (`it`) |
| 13 | `grc` μορφή (morphḗ) | 27 | 71 | morfo (`it`) |
| 14 | `grc` ἰδέα (idéa) | 27 | 43 | idea (`it`) |
| 15 | `grc` ἐνέργεια (enérgeia) | 27 | 36 | energia (`it`) |
| 16 | `LATINO` universitas | 27 | 33 | università (`it`) |
| 17 | `en` film | 27 | 31 | film (`it`) |
| 18 | `lng` bizza | 27 | 29 | pizza (`it`) |
| 19 | `nci` chocolātl | 27 | 28 | cioccolato (`it`) |
| 20 | `grc` χάρτης (khártēs) | 26 | 75 | card (`it`) |

### `confronto/<A>__<B>.json` (parte F)

528 file, uno per ogni coppia delle 33 lingue (romeno compreso), con `A` < `B` in ordine alfabetico dei codici (es. `confronto/fr__it.json`). Le chiavi `A_da_B` e `B_da_A` sono letterali: «A» e «B» sono i codici del nome del file.
```
{"A":"fr","B":"it","nome_A_it":…,"nome_A_en":…,"nome_B_it":…,"nome_B_en":…,"nota":"…",
 "A_da_B":{"n":713,"prestiti":525,"per_categoria":{ereditato, prestito, latinismo_dotto, calco, non_precisato},"esempi":[{voce_parola}×12],"file":"coppie/fr/it.json"},
 "B_da_A":{…idem…},
 "origini_comuni":[{"codice":"LATINO","nome_it":…,"nome_en":…,"tipo_lingua":"lingua","termine":"radius","n_A":4,"n_B":6,"esempi_A":[{voce_parola}×3],"esempi_B":[{voce_parola}×3]}×10],
 "passaggi":{"A_da_B":{"n":223,"vie":[{"codice":"LATINO","nome_it":…,"nome_en":…,"n":142,"esempi":[{voce_parola + "catena_codici":["it","la-vul"]}×3]}×3]},"B_da_A":{…}},
 "nota_romeno":"…"   (solo nei file con ro)}
```
- `A_da_B` = parole che A ha preso **direttamente** da B (lingua diretta B): `n` tutte le categorie, `prestiti` = prestito + latinismo_dotto + calco, `per_categoria`, 12 esempi (prima i prestiti, poi le «riconoscibili», poi quelle con più discendenti), `file` = il file della coppia in `coppie/` (`null` se non ce n'è). `B_da_A` il contrario. Niente testi.
- `origini_comuni`: le 10 **origini lontane** (radice come in `famiglie.json`: ultima tappa con termine, lingua + termine normalizzato, latino sommato) che hanno **tutte e due** le lingue, in ordine di `min(n_A, n_B)` poi `n_A + n_B`; `n_A`, `n_B` = parole di A e B con quella radice (qualunque categoria), 3 esempi per lingua. Tolte le radici che sono affissi (termine che inizia o finisce con «-») e le famiglie di lingue.
- `passaggi.A_da_B`: parole che A ha preso da B e che B aveva a sua volta preso da altri (la catena ha una tappa 2): `n` e le **3 vie più frequenti** (`vie[]`: lingua della tappa 2 con `n` e 3 esempi con `catena_codici`); `passaggi.B_da_A` il contrario.
- Il romeno compare qui come tutte le altre lingue (non è una classifica), con `nota_romeno`.

### Omografi negli alberi (parte G): numeri

- Collegamenti discendente → antenato letti: **56.300** (prima del mandato 11 la stessa lettura dava 62.679 collegamenti perché un discendente finiva sotto ogni omografo).
- Discendenti con un antenato dalla grafia ripetuta (più etimologie nell'export): **4.992**.
  - ristretti dalla grafia identica: 821; scelti con l'`id` di etimologia: 251; scelti con la glossa del modello: 233 (più 3 ridotti ma ancora a più voci).
  - **discendenti ambigui** (`ambiguo: true`, sotto più voci perché non c'è modo di scegliere): **3.906** discendenti, in 8.769 collegamenti; nei file degli alberi i nodi `ambiguo` sono 10.054 su 68.518 nodi.
- Voci di albero con `n_omografi_antenato` (almeno un altro omografo nell'export): **20.527** su 385.453.
- Controllo: *café* francese (una sola etimologia): nessun discendente ambiguo, e *café* spagnolo («brown» è la prima glossa della voce aggettivo; il sostantivo «coffee» ha la stessa etimologia) è un discendente vero; *καφέ* greco: le due etimologie (colore, locale) hanno ciascuna il proprio albero e `radici_altre` l'altra, e discendono tutte e due da *café* francese; *piano* inglese: `piano|1` (pianoforte) e `piano|2` («softly», da *piano* italiano) con `n_omografi_antenato` = 1; *piano* italiano ha due voci con legami e i suoi discendenti sono distribuiti con `ambiguo` (salvo *πιάνο* greco 1 e 2, scelti con la glossa).

### Dimensioni (mandato 11)

| Cartella o file | File | MB |
|---|---|---|
| `coppie/` | 22.623 | 425.8 |
| `parole/` | 85 | 155.3 |
| `indice/` | 60 | 53.4 |
| `alberi/` | 845 | 115.0 |
| `lingua_extra/` | 33 | 2.1 |
| `doppioni/` | 33 | 10.4 |
| `andate_tornate/` | 33 | 0.9 |
| `confronto/` | 528 | 6.7 |
| `lingue.json` | 1 | 0.1 |
| `archi.json` | 1 | 1.1 |
| `livello2.json` | 1 | 3.7 |
| `storie.json` | 1 | 0.0 |
| `griglia.json` | 1 | 0.1 |
| `statistiche.json` | 1 | 0.7 |
| `famiglie.json` | 1 | 2.6 |
| **Tutto `export/`** (senza il README) | **24.247** | **777.7** |
| **Stima di ciò che copia il sito** (senza `parole/` e `dati_a/`; `dati_a/` non è in `export/`) | 24.162 | **622.4** |

## Avvertenze da mostrare sul sito

1. **È una fotografia di Wiktionary, non una misura del vocabolario.** I numeri dicono cosa i redattori di Wiktionary hanno scritto sull'origine delle parole, non quante parole una lingua abbia davvero prestato o preso.
2. **Copertura molto disuguale.** I più coperti: finlandese 97%, polacco 95%, ungherese 94% dei lemmi con etimologia; i meno coperti: lettone 36%, arabo 20%, maltese 10%. Una lingua con pochi legami non ha per forza prestato poco: il campo `copertura` (buona ≥ 70%, media 30-70%, scarsa < 30%) serve a dirlo. Per l'italiano ha etimologia il 51% dei lemmi.
3. **Le cifre sono minimi.** Etimologie scritte solo a parole (es. «dal nome del ghetto di Venezia») non entrano; catene interrotte ai bivi; il confine tra prestito, ereditato e «deriva da» dipende da come i redattori scelgono il modello.
4. **Le date non sono usate** (decisione del 18/10/2026): non ci sono date negli export.
5. **Etimologie dubbie**: `incerta` e `motivo_incerta` dicono perché; le `alternative` sono ipotesi che Wiktionary presenta alla pari (es. «ragazzo»); le `scartate` (solo in `parole/`) sono ipotesi che il testo giudica improbabili (es. «baita» dall'arabo). Non vanno mostrate come catena.
6. **Ambiti** (cucina, mare, musica…): coprono poco (circa un quinto dei lemmi) e sono letti dalle etichette dei sensi: da usare come esempi.
7. **Wiktionary italiano**: per l'italiano esiste un confronto con il Wiktionary italiano (`risultati/confronto_itwikt.csv` e `.md`, non esportato qui): dove le due fonti non concordano (es. «guerra») il sito può dirlo.
8. **Significato**: è la prima glossa inglese della voce di Wiktionary che ha dato l'etimologia, tagliata a 120 caratteri; per le parole con più parti del discorso vale la prima voce. Manca per 234 parole su 385.453 (0.1%): sono voci senza nessuna glossa nei sensi. Per le parole omografe con più etimologie la glossa è quella della voce di quella etimologia. Non è una traduzione: è una definizione inglese.
9. **Peso**: `coppie/` ha 22.623 file, 426 MB; il file più grande è `coppie/en/__altre.json` (14.0 MB). Ogni parola è ripetuta nel file della coppia, in `LATINO.json`, nel secondo livello e nei `__via_*` (ma solo il file semplice ha il testo dell'etimologia). `parole/`, `indice/` e `alberi/` ripetono le stesse parole in altri formati: il sito può copiare solo ciò che usa.
10. **Origine lontana e bivi**: nei file delle coppie `lontana` è l'ultima tappa della `catena` scritta nel file. Per circa il 5% delle parole il file `parole/<codice>.json` (campo `lontana`) e `rete_parole.csv` seguono invece la catena allungata oltre il bivio «pezzo vero + affisso» (la parte oltre il bivio non ha termini), quindi lì `lontana` può essere più lontana della catena.
11. **Parole con alternative**: non entrano nella griglia né nel secondo livello né nei `__via_*`/`__altre`; sono in `_alternative.json`, in coda ai file semplici di ogni ipotesi e in `parole/<codice>.json`.
12. **Traslitterazione**: è quella scritta da Wiktionary (in genere automatica per arabo, persiano, russo, greco, ucraino, bulgaro; a mano per l'ebraico) e può mancare: la tabella nella sezione «Traslitterazione» dice quanto. Per gli alfabeti antichi o rari (gandhari, pahlavi, ecc.) manca più spesso.
13. **Discendenti negli alberi**: sono letti dal primo termine di origine delle parole (confronto di forme normalizzate): una grafia uguale in due significati può dare discendenti che appartengono a un'altra parola. Dal mandato 11 si usano l'`id` e la glossa del modello, e quelli che restano incerti hanno `ambiguo: true` (vedi «Ambiguità»); i prestiti che Wiktionary non lega alla parola con un modello non compaiono.
14. **Romeno**: visibile ovunque ma fuori da statistiche e classifiche come lingua di arrivo (`escluse: ["ro"]`, `nota_esclusione`). Nella griglia i toni di colore conviene calcolarli sul 95° percentile delle caselle perché il romeno non schiacci la scala.
15. **Termini puliti**: 197 termini delle catene portavano ancora un modificatore del modello (`sugar<t:money>`); l'export li toglie (i CSV di `risultati/` no).
