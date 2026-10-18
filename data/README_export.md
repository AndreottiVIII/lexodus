# Dati per il sito — esportazione JSON (mandati 05, 07 e 09)

Prodotti da `script/esporta_sito.py` (`python -I -X utf8 script/esporta_sito.py risultati`) a partire dai file di `risultati/`. Tutti i file sono UTF-8, JSON compatto. **Fonte di tutto**: Wiktionary inglese (`raw-wiktextract-data.jsonl.gz`, estrazione Wiktextract del dump del 2026-09-02, scaricato da kaikki.org il **18/10/2026**) passato da `script/estrai_lingue.py`. Versione dell'export: **3** (mandato 09, 18/10/2026).

## Cosa c'è

| File o cartella | Contenuto | Da dove viene |
|---|---|---|
| `lingue.json` | `lingue_di_arrivo`: le 33 lingue di arrivo (codice, `nome_it`, `nome_en`, `lemmi`, `lemmi_con_etimologia`, `percentuale_con_etimologia`, `parole_con_legami`, `archi_in_entrata`, `archi_in_uscita`, `parole_prese_in_prestito`, `parole_date_in_prestito`, `copertura` = buona / media / scarsa, `n_alternative` e `file_indice_coppie`). `altre_lingue_origine`: le 1401 altre lingue che compaiono come origine (codice, `nome_en`, `nome_it` se noto, `tipo_lingua`). | `rete_copertura.csv`, `rete_archi.csv`, `lingue_codici.csv`, `script/lingue_nomi_it.csv` |
| `archi.json` | 6.719 archi diretti tra lingue (origine, arrivo, categoria, `n_parole`, `n_incerte`, `tipo_lingua_origine`, fino a 12 `esempi`). Solo catene (parole senza alternative), tutte le categorie tranne `stadio_stessa_lingua`. Gli esempi sono le parole «riconoscibili» più corte (almeno 3 lettere, solo lettere, senza maiuscole, senza trattini né cifre), mostrate in ordine alfabetico. | `rete_archi.csv` (numeri), `rete_parole.csv` (esempi) |
| `parole/<codice>.json` | Per ciascuna delle 33 lingue di arrivo, l'elenco delle parole con almeno un legame vero (non quelle di sola formazione interna, né di soli stadi): `parola`, `traslitterazione` (solo se c'è), `pos`, `significato`, `n_etimologia`, `categoria`, `diretta` (codice della lingua diretta; `null` se la parola ha alternative), `lontana` (origine lontana; `null` se alternative), `catena` (lista di coppie `[codice, termine]` dalla lingua diretta all'ultima tappa), `traslitterazioni` (solo se almeno una tappa ne ha una: lista dello stesso numero di elementi di `catena`, stringa vuota dove manca), `incerta` (true/false), `motivo_incerta`, `alternative` (lista di `{codice, termine, [traslitterazione], categoria}`), `scartate` (ipotesi che il testo dice improbabili: non sono nella catena), `via` (lingue intermedie citate nel testo come «via X», solo se riconosciute; la lingua diretta non cambia), `ambiti` (gruppi), `testo` (primi 300 caratteri dell'etimologia). Se un file supera 15 MB è diviso per lettera iniziale in `parole/<codice>/<lettera>.json` con un `indice.json`. Il sito di oggi non lo legge più (usa `coppie/`), ma resta come secondo formato. | `rete_parole.csv`, `rete_relazioni.csv` |
| `livello2.json` | Il secondo passo delle catene, in due versioni. `da_chi_ha_preso`: chiave `arrivo\|diretta` (es. `it\|ota` = parole italiane la cui lingua diretta è il turco ottomano) → lista di `{codice, n, esempi}` con le lingue da cui la lingua diretta aveva preso quelle parole (fino a 8 esempi). `da_dove_la_origine_l_aveva_presa`: chiave `origine\|arrivo` con l'origine tra le 33 lingue (es. `fr\|en`: le parole inglesi prese dal francese, e da dove il francese le aveva prese); sono gli stessi dati, con la chiave rovesciata, per comodità del sito. `totali`: per ogni `arrivo\|diretta`, parole con catena e quante arrivano al livello 2 (le altre si fermano al primo passo). Stadi della stessa lingua e ipotesi scartate non contano come tappe. Ogni voce ha `file` (percorso del file con l'elenco delle parole) e `per_categoria`, e ci sono le chiavi e le voci `LATINO` (latino unito). 2.524 coppie in avanti, 528 indietro. **Mandato 09: la voce `LATINO` ora compare una sola volta per lista** (nella versione 2 era doppia, perché le due versioni condividevano gli stessi oggetti; controllo: voci con codice ripetuto in tutte le liste = 0). | `rete_relazioni.csv` |
| `storie.json` | Le 10 storie della sezione 10 di `COSE_INTERESSANTI.md`: `titolo`, `parola`, `lingua_arrivo`, `etimologie` (catene lette dai dati), `parole_collegate` (le altre parole citate nel testo, con le loro catene) e `testo` (il paragrafo). | `COSE_INTERESSANTI.md`, `rete_relazioni.csv` |
| `coppie/<arrivo>/…` | Le parole di ogni coppia (lingua di arrivo, lingua diretta) con significato, catena completa e traslitterazioni; i secondi livelli; il latino unito; **(mandato 09)** un file per ogni casella della griglia (`__via_<lingua>.json`, `__altre.json`); le parole con etimologia dubbia anche in coda agli elenchi; un indice per lingua. 22.623 file in tutto, 426 MB (di cui 13.513 di secondo livello, 4.333 `__via_*` e 33 `__altre`). | `rete_parole.csv`, `rete_relazioni.csv`, `dati/filtrato/glosse.jsonl` |
| `griglia.json` | La griglia della home: 33 lingue di arrivo × lingue di origine (le 33, più `LATINO` e `altre`), primo e secondo livello, solo prestiti (+ calchi e latinismi) e tutte le categorie. | gli stessi dati delle coppie |
| `indice/` | **Mandato 09.** Indice di ricerca «cerca una parola in tutte le lingue»: 385.453 parole (+ 48.083 righe per la ricerca nell'alfabeto originale) in 59 file, 53 MB, il più grande 4.66 MB. `indice/_meta.json` elenca i file. | `rete_parole.csv`, `rete_relazioni.csv`, `glosse.jsonl` |
| `alberi/<lingua>/<lettera>.json` | **Mandato 09.** Un albero per parola: l'origine più lontana in cima, le tappe, la parola, poi le lingue che l'hanno presa (ricorsivo). 845 file per 385.453 parole, 115 MB, il più grande 2.5 MB (`alberi/en/s.json`); 28.831 parole hanno almeno un discendente. | come le coppie |
| `statistiche.json` | **Mandato 09.** Le quattro statistiche scelte da Davide (`donatori_nascosti`, `lingue_di_passaggio`, `bilancio`, `parole_viaggiate`), 518 KB. | come le coppie |

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
`p` parola come scritta; `n` forma normalizzata; `l` lingua; `ne` numero di etimologia; `s` significato (glossa inglese, come nelle coppie); `t` traslitterazione (stringa vuota se manca o se la parola è in alfabeto latino); `c` categoria; `o` lingua diretta (per le parole con alternative i codici delle ipotesi separati da `|`). In più, solo quando valgono: `i: 1` (etimologia incerta) e `a: 1` (la parola ha alternative). Le righe di ogni file sono in ordine di `n`, poi `p`, `l`, `ne`.

**Normalizzazione** (la stessa va applicata al testo cercato): `n` = parola (oppure, se la parola è in alfabeto non latino e ha la traslitterazione, la traslitterazione) in minuscolo (`str.lower`), scomposta in Unicode NFD, senza i segni combinati (categoria `Mn`: accenti, vocali brevi dell'arabo, punti dell'ebraico…), con le lettere speciali della tabella `tabella_lettere` di `_meta.json` (`đ→d`, `ł→l`, `ø→o`, `æ→ae`, `ß→ss`, `þ→th`…) e **senza apostrofi** (`'`, `’`, `ʿ`, `ʾ`…). Esempi: «caffè» → `caffe`, «قهوة» con traslitterazione «qahwa» → `qahwa`, «šakar» → `sakar`.

**Come si sceglie il file.** `lettera` = primo carattere di `n` se è `a-z`, altrimenti `_`. `_meta.json` ha `lettere` (lettera → lista di file) e `file` (per ogni file `file`, `lettera`, `prefisso`, `n_righe`, `byte`):
- se la lettera ha un solo file, è quello;
- se la lettera è stata divisa (file sopra 5 MB; lettere divise: nessuna), ogni file ha un `prefisso` di 2-4 caratteri (`ca`, `co_`, `con`…, con `_` al posto di ciò che non è `a-z` o manca): si carica il file il cui prefisso è l'inizio della chiave di `n` costruita allo stesso modo (primi caratteri di `n`, `_` per i non `a-z`, riempita con `_`). I prefissi non si sovrappongono;
- per `_` (alfabeti non latini e simboli) si caricano **tutti** i file della lista: sono uno per lingua (`indice/_ar.json`, `_ru.json`…). Lì le parole in alfabeto non latino hanno `n` = **forma originale normalizzata** (così si trovano scrivendo nell'alfabeto originale, es. «кафе» o «قهوة»); se hanno la traslitterazione compaiono anche nel file della lettera della traslitterazione, con `n` = traslitterazione normalizzata (sono le righe «in più» del conteggio sopra).

`_meta.json` ha anche `n_righe`, `n_righe_alfabeto_originale_in_piu`, `n_file`, `byte_massimo`. Nessun file supera 5 MB.

## `alberi/`: l'albero di una parola (mandato 09, parte C)

`alberi/<lingua>/<lettera>.json` è un oggetto `{ "parola|n_etimologia": voce, … }` (chiave per esempio `"caffè|1"`). La `lettera` è calcolata come per l'indice (primo carattere di `n` se `a-z`, altrimenti `_`; per `n` si usa la traslitterazione se la parola è in alfabeto non latino e ce l'ha). Per trovare l'albero di una riga dell'indice: `alberi/<l>/<lettera di n>.json`, chiave `p|ne`. Voce:

```
{"traslitterazione":"","significato":"coffee (plant and drink)","categoria":"prestito",
 "su":[{"codice":"ota","nome":"Ottoman Turkish","termine":"قهوه","traslitterazione":"kahve","categoria":"prestito"},{"codice":"ar","nome":"Arabic","termine":"قَهْوَة","traslitterazione":"qahwa","categoria":"prestito"}],
 "giu":[{"lingua":"nl","parola":"koffie","n_etimologia":1,"traslitterazione":"","significato":"…","categoria":"prestito","giu":[…]}],
 "radici_altre":["caffè|2"]}
```
- `su`: la catena verso l'alto, dalla lingua diretta all'origine lontana (come `catena` nei file di coppia: `codice`, `nome`, `termine`, `traslitterazione` se c'è, `categoria`). Per disegnare l'albero si legge al contrario: in cima l'ultimo elemento, poi gli altri, poi la parola. Vuoto per le parole con alternative.
- `giu`: i discendenti, ricorsivi: parole delle altre lingue tra le 33 il cui **primo termine di origine** (`termine_origine`, confronto con la stessa normalizzazione dell'indice) e la cui **lingua diretta** sono questa parola e questa lingua. Ogni nodo: `{lingua, parola, n_etimologia, traslitterazione, significato, categoria, giu}` (`categoria` = categoria del legame con la parola da cui discende). Si scende per **al massimo 4 livelli** e **60 nodi per albero** (in ordine di livello, poi lingua e parola); se si taglia, la voce ha `troncato: true` e i nodi i cui figli sono stati tagliati hanno `troncato: true` (6 alberi tagliati). Tutte le categorie, anche `ereditato` e `non_precisato`.
- **Ambiguità**: se la stessa grafia ha più etimologie nella stessa lingua, i discendenti non si possono assegnare a una sola (Wiktionary non lo dice): compaiono sotto **tutte** le etimologie di quella grafia.
- `radici_altre`: le altre chiavi `parola|n` della stessa grafia nella stessa lingua (altre etimologie, es. `piano` inglese ha due). Vuota se non ce ne sono.
- In più, solo quando valgono: `troncato`, `incerta: "sì"`, `alternative` (per le parole con alternative: lista di `{codice, nome, termine, traslitterazione, categoria}`, e `su` è vuoto).

## `statistiche.json` (mandato 09, parte D)

Le quattro scelte di Davide, ciascuna con un campo `nota` (inglese semplice, cosa misura e il limite). Tutte contano solo le parole con catena. Dove non è detto altro, «prestiti» = prima tappa `prestito`, `latinismo_dotto` o `calco` (come le celle della griglia). Tutte le varietà del latino sono sommate nel codice `LATINO` (nome «Latin (all varieties)»).
- `donatori_nascosti.per_arrivo[A]`: lista di `{codice, nome_it, nome_en, tipo_lingua, diretto, secondo_livello, rapporto, via:[{codice, nome_it, nome_en, n}]}`. `diretto` = parole che A ha preso direttamente da quella lingua; `secondo_livello` = parole di A la cui tappa 2 è quella lingua; `rapporto = secondo_livello / (diretto + 1)`; solo coppie con `secondo_livello` ≥ 20, in ordine di rapporto decrescente; `via` = le lingue dirette intermedie (prime 10) con i numeri.
- `lingue_di_passaggio.lingue`: lista (ordine decrescente di `n_parole`) di `{codice, nome_it, nome_en, tipo_lingua, n_parole, n_tutte_le_categorie, n_lingue_di_arrivo, per_arrivo:[{arrivo, nome_it, nome_en, n}]}` (prime 8 lingue di arrivo). `n_parole` = parole delle 33 lingue che hanno quella lingua come lingua diretta e hanno una tappa 2 dopo; `n_tutte_le_categorie` = lo stesso senza il filtro sulla categoria.
- `bilancio.lingue`: per ogni lingua `{codice, nome_it, nome_en, date, ricevute, rapporto, archi_in_uscita, archi_in_entrata, percentuale_con_etimologia, copertura}` (`date` e `ricevute` sono `parole_date_in_prestito` e `parole_prese_in_prestito` di `lingue.json`; `rapporto = date / ricevute`, `null` se non ha ricevuto nulla). Il rapporto dipende dalla copertura di Wiktionary: va sempre mostrato con `copertura`.
- `parole_viaggiate.catena_piu_lunga`: le 100 parole con più tappe tra lingue diverse (stadi esclusi; le protolingue contano come tappe, `n_tappe_lingue_vere` conta solo le lingue vere), tra le parole la cui prima tappa è un prestito; una per grafia e lingua. `parole_viaggiate.prese_da_piu_lingue`: le 100 parole con più lingue diverse tra i discendenti diretti (`n_lingue`, `n_discendenti_diretti`, `lingue:[{codice, n}]`). In tutte e due: `lingua`, `nome_it`, `parola`, `n_etimologia`, `traslitterazione`, `significato`, `categoria`, `file_albero` (es. `alberi/it/z.json`) e `chiave_albero` (es. `zucchero|1`); la prima lista ha anche `catena` (codice, nome, termine, traslitterazione).

## `griglia.json`

`lingue` (33 con `codice`, `nome_it`, `nome_en`), `colonne_extra` (`LATINO` = tutte le varietà del latino sommate, `altre` = ogni altra lingua, protolingua o famiglia), `primo_livello[arrivo][origine]` = parole la cui lingua diretta è l'origine e il cui primo legame è prestito, latinismo dotto o calco; `secondo_livello[arrivo][lingua]` = parole (stessa regola sul primo legame) la cui **tappa 2** è quella lingua, qualunque sia la lingua diretta; `primo_livello_tutte` e `secondo_livello_tutte` = lo stesso con tutte e cinque le categorie. Solo celle diverse da zero. Per ogni lingua di arrivo `parole_con_catena` e `parole_con_alternative` (le parole con alternative non sono contate nelle celle). Una cella di primo livello è uguale alla somma delle categorie prestito + latinismo_dotto + calco di `_indice.json` per quell'origine. **File delle caselle (mandato 09)**: primo livello `coppie/arrivo/origine.json` (colonna `altre`: `coppie/arrivo/__altre.json`), secondo livello `coppie/arrivo/__via_lingua.json` (colonna `altre`: `__via_altre.json`).

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
13. **Discendenti negli alberi**: sono letti dal primo termine di origine delle parole (confronto di forme normalizzate): una grafia uguale in due significati può dare discendenti che appartengono a un'altra parola (vedi «Ambiguità»), e i prestiti che Wiktionary non lega alla parola con un modello non compaiono.
