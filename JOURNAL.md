# JOURNAL — sito lexodus

## 2026-10-18 — mandato 06: impostazione del sito

### Cosa è stato fatto
- Cartella `lexodus/` nuova con git, `.gitignore`, `.nojekyll`, `README.md` (in inglese, come il sito).
- Tre pagine statiche: `index.html` (scelta lingua + rete), `language.html?code=xx` (scheda lingua), `about.html` (metodo). Menu con «Words» e «Stories» segnati «soon», non fatti.
- Dati: `rete-prestiti/risultati/export/` **non esisteva** né all'inizio né alla fine del lavoro (controllato due volte). Ho fatto un campione con `scripts/campione_da_csv.py` (sola lettura di `rete_archi.csv`, `rete_copertura.csv`, `lingue_codici.csv`, `script/lingue_nomi_it.csv`, `rete_parole.csv`): tutti i 6.719 archi diretti (tutte le categorie tranne lo stadio della stessa lingua), 1.216 lingue (33 di arrivo + 1.183 di origine), fino a 12 parole di esempio per arco (5.882 archi con esempi). Il caricamento dei JSON veri è pronto: `scripts/aggiorna_dati.py` copia dall'export e il codice accetta più nomi di campo.
- Nulla toccato dentro `rete-prestiti/`. Aggiunta una voce «lexodus» (porta 8790) in `ClaudeTower/.claude/launch.json` per l'anteprima nel browser integrato.
- Verifica nel browser integrato (server locale): index e scheda lingua per italiano e francese, scheda del latino (lingua fuori dalle 33), telefono (375 px), tema scuro, Romania. Console senza errori né avvisi. Nessuno scorrimento orizzontale su telefono. Prova anche da file locale (Edge senza finestra, `file:///…/index.html?lang=fr`): la pagina si riempie. Screenshot in `docs/screenshots/` (index-italian, index-french, language-italian, language-french, index-italian-phone).
- GitHub: `gh` **non è autenticato** («You are not logged into any GitHub hosts»). Fermato lì come da mandato: primo commit fatto in locale, i comandi da lanciare sono nel README (sezione «Publish on GitHub Pages»). L'account di destinazione è quello di capodanno-28 (`AndreottiVIII`), quindi l'indirizzo sarà https://andreottiviii.github.io/lexodus/.

### Scelte fatte da me (da confermare con Davide)
1. **Grafico**: diagramma a flussi in tre colonne (da chi ha preso | lingua | a chi ha dato), disegnato con D3 7.9.0 (cdnjs) senza il modulo Sankey. Ogni banda è una coppia (lingua, categoria) colorata per categoria. **Stessa scala** a sinistra e a destra, così le due parti si confrontano (per il romeno la destra diventa sottilissima). Prime 15 lingue per lato più una voce «N others»; si può scegliere 10/15/30/tutte.
2. **Categorie e colori** (uguali in tutte le pagine): borrowed blu, learned Latin ocra, inherited verde, calque viola, unspecified grigio. Tutte accese all'inizio. Le scelte dei filtri restano nel browser di chi guarda.
3. **Interruttore** «Hide families, proto-languages and non-languages» acceso di default (nasconde `famiglia`, `protolingua`, `non lingua`, `sostrato`).
4. **Copertura**: tre pallini (pieni = buona/good, ≥70%; due = media/fair, 30-70%; uno = scarsa/poor, <30%), senza colori per non confondersi con le categorie. In ogni pagina un avviso «A snapshot of English Wiktionary, not a measure of the vocabulary», più una nota breve per romeno, maltese, arabo, inglese, finlandese e «Translingual» (prese da `COSE_INTERESSANTI.md`, sezioni 5-6).
5. **Latino**: le varietà (Latin, Late Latin, Vulgar Latin, Medieval Latin, New Latin…) restano lingue separate, come nei dati.
6. **Lingue fuori dalle 33** (latino, greco antico…): hanno una scheda con la sola tabella «Gave to». Cliccando nella rete una delle 33 si cambia il centro; una lingua fuori si apre nella sua scheda.
7. **Caratteri**: Literata per i titoli (un carattere da dizionario), IBM Plex Sans per il testo, IBM Plex Mono per i codici lingua (Google Fonts). Tema chiaro e scuro automatico.
8. **Parole di esempio nel campione**: prima le sicure, poi quelle con il testo etimologico più lungo (segno grossolano di parola comune e ben documentata), poi in ordine alfabetico. L'export vero avrà le sue regole (mandato 05, parte B, punto 2).
9. **Dati anche come `.js`**: oltre ai `.json` ci sono `data/*.js` che mettono gli stessi dati in `window.LEXODUS`, così il sito si apre anche con doppio clic (il browser blocca `fetch()` sui file locali). Se mancano, il codice prova `fetch` dei `.json`.
10. Ordine delle lingue nella scelta: alfabetico per nome inglese; l'italiano è selezionato all'inizio.

### Cosa manca / problemi
1. **Il campione non ha le correzioni del mandato 05** (ipotesi scartate lette come tappe, `oc-pro` protolingua, ecc.): i numeri cambieranno un poco quando arriva l'export. Lanciare `python -I -X utf8 scripts/aggiorna_dati.py` e controllare che le pagine si riempiano (i nomi dei campi dell'export non erano ancora noti; il codice ne accetta diversi, in `js/common.js`).
2. **Sito non online** finché Davide non fa `gh auth login` e lancia i comandi del README.
3. Su telefono il passaggio del dito apre subito la lingua toccata: la finestrella con numeri ed esempi si vede bene solo col mouse. Sul telefono servono le tabelle della scheda lingua.
4. I nomi molto lunghi nella rete sono tagliati con «…» (nome intero al passaggio del mouse).
5. Non fatti: schede parola, storie (`storie.json` verrà copiato da `aggiorna_dati.py` ma non è ancora usato), file `parole/<codice>.json` (copiati ma non usati).

## 2026-10-18 — risposte di Davide alle tre domande (applicate)
1. Latino unito in una sola voce «Latin» (la, la-*, itc-ola Old Latin, codici vecchio stile L. LL. VL. ML. NL. EL.), con interruttore «Split Latin varieties»; la scheda `language.html?code=la` somma le varietà.
2. Categorie accese all'apertura: borrowed, learned Latin, calque (chiave di memoria nuova `lexodus.filters.v2`, così valgono i nuovi default).
3. Stessa scala sui due lati, con una nota quando un lato è meno di un quinto dell'altro (es. francese, romeno).
Verificato nel browser integrato per italiano, francese e romeno, console pulita. Subito dopo è arrivata la richiesta di rifare il sito senza diagramma (sezione seguente): gli screenshot di questa versione non sono stati rifatti.

## 2026-10-18 — sito rifatto semplice, con il secondo livello

### Perché
Davide ha visto il prototipo: il diagramma a flussi non gli piace e non mostra il secondo livello (da dove venivano le parole prima della lingua diretta). Richiesta: il sito più semplice possibile.

### Cosa è cambiato
- **Niente diagramma, niente D3, niente Google Fonts.** Tolti `js/network.js` e tutta la grafica a colori. Testo nero su bianco, un solo blu scuro (#1f3a68) per barre e link, caratteri di sistema, nessuna ombra né badge, molto spazio bianco. Un solo tema (chiaro).
- `index.html` = elenco semplice delle 33 lingue con la copertura scritta in parole («coverage: fair, 51% of entries have an etymology»).
- `language.html` = la sola pagina per lingua: due elenchi affiancati (uno sotto l'altro su telefono), «Took from» e «Gave to». Ogni riga: lingua (link), numero di parole, barra sottile, categoria in parola, 5 esempi in corsivo. Prime 20 righe, poi «Show all».
- **Secondo livello**: cliccando una riga si apre sotto, rientrato, «Before X, these words came from:» con lingua, numero, barra (in proporzione alla riga madre) e 5 esempi; in fondo quante parole non hanno un passo precedente in Wiktionary e quante portano a famiglie/protolingue nascoste. Per «Took from» (italiano ← turco ottomano) è il passo dopo il turco ottomano nella catena; per «Gave to» (italiano → inglese) è il passo prima dell'italiano, cioè da dove l'italiano aveva quelle parole.
- Restano come deciso: latino unito con l'interruttore «split Latin varieties»; all'apertura solo borrowed, learned Latin, calque; interruttore «hide families, proto-languages and non-languages» acceso; stessa scala per le barre dei due elenchi con la nota quando un lato è meno di un quinto dell'altro. Le scelte restano memorizzate nel browser mentre si naviga.
- `about.html` accorciato, con un paragrafo «Two levels».

### Dati del secondo livello (`scripts/livello2_da_csv.py`, sola lettura di `rete_relazioni.csv`)
- Per ogni parola delle 33 lingue: la riga `tipo_legame = diretta` dà la lingua diretta; il passo dopo è la prima riga `tappa` successiva con lingua diversa. Le righe `stadio` (passaggi dentro la stessa lingua) si saltano. **Attenzione**: nel file `livello` conta anche gli stadi (es. *dictionary* inglese ha lo stadio medio inglese al livello 1 e la diretta al livello 2), quindi «livello 1 = diretta, livello 2 = tappa dopo» non vale alla lettera; ho seguito `tipo_legame`. Le alternative sono escluse; le parole con la diretta `stadio_stessa_lingua` sono escluse.
- `data/livello2.json`: chiave `arrivo|diretta` come chiesto, valore lista di `{codice, nome, tipo_lingua, categoria, n, esempi}`. **Campo in più `categoria`** (categoria del legame diretto), perché le righe del sito sono per lingua *e* categoria: senza, il secondo livello mescolerebbe prestiti ed ereditate. Se l'export ufficiale non lo avrà, il sito mostra tutte le categorie con la scritta «(all categories)».
- `data/livello2_latino_unito.json`: lo stesso con le varietà di latino unite in `la` (sia come diretta sia come passo dopo; il passo latino → latino si salta). Se l'export non lo avrà, il sito lo ricava da `livello2.json` (un po' meno preciso: non può saltare il passo latino → latino per trovare quello dopo).
- Esempi: prima le parole già scelte come esempi in `archi.json`, poi le sicure, poi un ordine fisso; 5 in ordine alfabetico.
- Controllo: italiano ← turco ottomano (27 prestiti): arabo 7 (*bricco, harem, iradè, macramè, zaptiè*), persiano 5, persiano classico 4, 1 a una protolingua (nascosta), 10 senza passo precedente: la somma torna (27). *caffè* è tra i 7 dell'arabo ma non tra i 5 esempi.

### Verifica
- Browser integrato (prima che Davide lo usasse per GitHub): pagina italiano, apertura di «Ottoman Turkish» con l'arabo che compare, pagina francese con «Gave to → Italian» aperto, filtri e interruttore del latino. Console senza errori. Screenshot: `language-italian.jpg`, `language-italian-ottoman-turkish.jpg`, `language-french-gave-to-italian.jpg`.
- Su richiesta del coordinatore ho smesso di usare il browser integrato (serve a Davide per accedere a GitHub; una mia `navigate` gli aveva cambiato pagina mentre era sulla pagina di attivazione del dispositivo: me ne scuso, non ho toccato nulla lì). Gli altri screenshot sono fatti con Edge senza finestra da file locale: `index.png`, `language-french.png`, `language-italian-phone.png` (pagina in un riquadro largo 375 px). Da rifare a vista nel browser integrato quando è libero: telefono vero e apertura delle righe su telefono.
- Tolti gli screenshot vecchi del diagramma.

### Cosa manca
1. Export ufficiale (lingue, archi, livello2) non ancora arrivato: il sito usa il campione.
2. Pubblicazione su GitHub Pages: comandi nel README, da lanciare quando `gh` è collegato.
3. Gli esempi del campione sono parole a volte poco note (*agiorita, alieutica*): l'export avrà le sue regole.

## 2026-10-18 — esempi più corti, pubblicazione
- Davide: restano 20 righe prima di «Show all»; esempi = le 5 parole più corte (almeno 3 lettere, senza trattini, maiuscole o numeri), mostrate in ordine alfabetico. Applicato in `scripts/campione_da_csv.py` e `scripts/livello2_da_csv.py` (a parità di lunghezza: sicure prima, poi testo etimologico più lungo / già esempio di un arco) e nel sito (`five()` in `js/language.js`, così vale anche per l'export ufficiale). Dati rigenerati: ora *caffè* compare tra gli esempi di italiano ← turco ottomano → arabo.
- Repo online: https://github.com/AndreottiVIII/lexodus, Pages su https://andreottiviii.github.io/lexodus/. Verifica fatta con Edge senza finestra (file locale), non con il browser integrato.

## 2026-10-18 — dati veri dall'export ufficiale
- Letto `rete-prestiti/risultati/export/README.md` (copiato in `data/README_export.md`). Lanciato `scripts/aggiorna_dati.py`: copiati `lingue.json`, `archi.json` (6.719 archi), `livello2.json`, `storie.json` e i gemelli `.js`. `fonte.json` ora dice «export»; tolta dal piè di pagina la frase sul campione.
- **`parole/` non copiata**: pesa 127 MB, sopra il limite di 100 MB. Serve alle pagine parola future. Per copiarla più avanti, quando sarà più leggera: `python -I -X utf8 scripts/aggiorna_dati.py --parole` (lo script la copia solo se resta sotto 100 MB). Alternative da decidere allora: caricare dal sito solo il file della lingua aperta, oppure alleggerire i file (testo dell'etimologia più corto, solo le 33 lingue senza l'inglese diviso).
- Sito adattato ai nomi veri dei campi (tolti i nomi alternativi): `lingue.json` → `lingue_di_arrivo` / `altre_lingue_origine` con `percentuale_con_etimologia` e `copertura` buona/media/scarsa; `archi.json` → `archi`; `livello2.json` → `da_chi_ha_preso` (chiave `arrivo|diretta`) e `totali`. La sezione `da_dove_la_origine_l_aveva_presa` non serve: sono gli stessi dati con la chiave rovesciata, e per «Gave to» il sito usa `da_chi_ha_preso` con chiave `altra lingua|lingua al centro`.
- **Il secondo livello ufficiale non ha la categoria**: la sotto-lista conta tutte le parole della coppia di lingue, qualunque categoria (es. italiano ← turco ottomano: riga «borrowed 27», sotto «the 31 Italian words in this pair (all categories)»). Quante non hanno un passo precedente viene da `totali` (parole − con_livello_2). Se si vuole il secondo livello per categoria, va aggiunto il campo all'export.
- Latino unito: il sito somma le chiavi delle varietà (`it|la`, `it|la-lat`…) e unisce le varietà anche tra le lingue del secondo livello.
- Tolti `scripts/campione_da_csv.py`, `scripts/livello2_da_csv.py` e `data/livello2_latino_unito.*` (servivano solo al campione; restano nella storia di git).
- Regola degli esempi corti: la applica già l'export; il sito sceglie comunque le 5 più corte e le mette in ordine alfabetico.

### Numeri di controllo, italiano (export = CSV)
- Copertura: 136.968 lemmi, 69.425 con etimologia, 50,7% («media» → «fair») in `rete_copertura.csv` e in `lingue.json`.
- Latinismi dotti dal latino unito: 4.377 in `rete_archi.csv` e in `archi.json`; sul sito «Latin · learned Latin · 4,377».
- Prestiti dall'inglese: 982 in entrambi; sul sito «English · borrowed · 982».
- Totale preso (prestiti + latinismi + calchi) 8.304 e dato 9.358 in entrambi. Sul sito «Took from» mostra 8.101 perché l'interruttore acceso nasconde le non-lingue (Translingual) e le famiglie (203 parole); «Gave to» 9.358.
- Sotto «Ottoman Turkish» si apre l'arabo con 7 parole tra cui *caffè* (poi persiano 5, persiano classico 4, una protolingua nascosta, 14 parole senza passo precedente su 31).
- Verifica con Edge senza finestra (file locale) per italiano e francese, nessun errore; screenshot `index.png`, `language-french.png`, `language-italian-phone.png` rifatti. `language-italian-ottoman-turkish.jpg` rifatto sulla pagina online (browser integrato, una volta, console pulita); gli altri due `.jpg` sono della versione con il campione (stessa grafica, esempi diversi).

## 2026-10-18 — mandato 08: griglia in home, elenco parole, scheda parola

### Cosa è stato fatto
- **Dati veri, non il campione.** All'inizio l'export del mandato 07 non c'era: ho costruito le pagine su un campione mio nello stesso formato (it/ota, it/LATINO, sq/LATINO, en/it e la griglia, da `rete_relazioni.csv` e `rete_parole.csv` in sola lettura). L'export è arrivato durante il lavoro (esito nel JOURNAL di rete-prestiti alle 16:12); ho aspettato che i file fossero fermi e l'ho copiato con `scripts/aggiorna_dati.py`. Lo script del campione è stato cancellato senza commit. `data/fonte.json` dice «export».
- `scripts/aggiorna_dati.py` ora copia anche `griglia.json` e la cartella `coppie/` (si ferma se supera 500 MB: sono 300 MB, 17.994 file) e costruisce due indici: `data/coppie_elenco.json/.js` (quali file di coppia esistono, più le 4 eccezioni di `_eccezioni_nomi.json`: un numero diventa link solo se il suo elenco esiste) e `data/dati_a/<codice>.json` (4,2 MB in tutto: le parole date da ognuna delle 33 lingue, per «Then taken by»). Controllo: per tutti i 17.927 percorsi scritti nel campo `file` degli `_indice.json`, la regola del sito (codice → nome del file, con le eccezioni) dà lo stesso percorso. `parole/` non viene più copiata.
- **Home** (`index.html`, `js/home.js`): griglia 33 × 35 (33 lingue + «Latin» + «other»), righe = chi prende, colonne = da chi, ordine alfabetico inglese; 5 toni di blu per ordine di grandezza (1-9, 10-99, 100-999, 1.000-9.999, 10.000+), numeri abbreviati («2k») dentro le caselle da 1.000 in su, numero intero e frase in alto al passaggio del mouse (per «other» le tre lingue più grandi dentro, da `altre_dettaglio`); interruttore first level / second level; i nomi di riga e colonna portano alla pagina della lingua; sotto, l'elenco delle 33 lingue come prima. Su telefono la griglia scorre in orizzontale con i nomi delle righe fermi a sinistra.
- **Pagina lingua**: ogni numero è un link a `words.html` (Took from: `to=lingua&from=altra`; Gave to: `to=altra&from=lingua`; con la categoria della riga preselezionata `&cat=`); anche i numeri del secondo livello (`&via=`). Latino unito → `LATINO`; con «split Latin varieties» i file delle singole varietà.
- **Elenco parole** (`words.html`, `js/words.js`): titolo «Albanian ← Latin: 750 words» (o «Italian ← Ottoman Turkish ← Arabic: 7 words»), caselle per categoria con il numero, ricerca (parola, significato, termine d'origine, senza badare agli accenti), tabella parola (link, con la parte del discorso) · significato · da dove (lingua e termine; con `via` anche la tappa dopo) · categoria · «?» se incerta; 50 per pagina.
- **Scheda parola** (`word.html`, `js/word.js`): parola, lingua, parte del discorso, categoria, link all'elenco della coppia, significato tra virgolette; percorso in colonna (la parola, poi una riga per tappa: lingua con link, termine, tipo di passaggio; pallino pieno in cima e sull'origine lontana); per le parole con più ipotesi (`_alternative.json`) le ipotesi affiancate con «or»; testo dell'etimologia (300 caratteri, «…» se tagliato) e link a `en.wiktionary.org/wiki/<parola>#<Lingua>`; «Then taken by other languages» da `dati_a` (es. *caffè* → Dutch *koffie*, English *caffè*, French *café*, Icelandic *kaffi*).
- Menu: tolte «Words (soon)» e «Stories (soon)»; restano Languages e About. About con un paragrafo «The grid and the words». README aggiornato. Favicon vuota in tutte le pagine (evita l'errore 404 in console).

### Verifica (Edge senza finestra, server locale, cache spenta; script CDP fuori dal repo)
Tutti i percorsi del mandato passano, console senza errori né avvisi in ogni pagina:
home → griglia (33 righe, 656 caselle con elenco) → «Albanian» → numero del latino → «Albanian ← Latin: 750 words» → prima parola (*-ar*) → scheda con tappe; italiano → «Ottoman Turkish» aperto → numero dell'arabo → «Italian ← Ottoman Turkish ← Arabic: 7 words» con *caffè* → scheda con tappe Italian, Ottoman Turkish, Arabic; inglese → «Took from Italian» → ricerca «piano» → scheda (Italian *pianoforte*); italiano → «Gave to English» (numero e secondo livello `via=LATINO`); scheda di *piano* italiano → «taken by» 15 lingue; scheda senza `&from=` (la trova cercando nei file); *abet* inglese con le ipotesi affiancate; telefono 375 px: la pagina non scorre di lato, la griglia sì. Ricerca e pagine (88 pagine per italiano ← latino, learned Latin). Controlli dei numeri: griglia it → mt 3.133; `coppie/en/it.json` 1.658 parole, *piano* due volte, *ghetto* no (Wiktionary non dà un legame).
Screenshot: `home-grid.png`, `home-grid-second-level.png`, `home-grid-phone.png`, `words-albanian-latin.png`, `word-caffe.png`. Tolto `index.png` (home vecchia).

### Scelte fatte da me (da confermare con Davide)
1. Caselle del **secondo livello** e della colonna **«other»**: portano alla pagina della lingua della riga, non a un elenco (non esiste un file «tutte le parole italiane la cui tappa 2 è l'arabo», qualunque sia la diretta).
2. Scala della griglia a ordini di grandezza (1-9 … 10.000+), numeri abbreviati in «k» solo nelle due classi più scure.
3. Il numero di una riga apre l'elenco **di tutta la coppia**, con spuntata solo la categoria della riga (si possono accendere le altre); il secondo livello resta «tutte le categorie» come prima (ora `livello2.json` ha `per_categoria`: si potrebbe usare).
4. Le parole con più ipotesi non stanno negli elenchi (come nell'export); si vedono solo aprendo la loro scheda (ci si arriva dal link diretto o da «taken by»).
5. `ambiti` (cucina, mare…) e `via` non sono mostrati (etichette in italiano, `via` rumoroso secondo l'export).

### Cosa manca / problemi
1. Elenchi e schede usano `fetch()`: da file locale (doppio clic) non si aprono, lo dicono con una frase; servono GitHub Pages o il server locale.
2. «Taken by» cerca la parola tra i `termine_origine`: per gli omografi (es. *piano* n. 1 e n. 2) mostra le stesse lingue su tutte e due le schede; e dove il termine d'origine è scritto in un'altra forma (es. latino con le lunghe) non trova nulla. Per le lingue fuori dalle 33 la sezione non c'è.
3. Peso del deposito: `data/` ~300 MB in 18.000 file piccoli; ogni nuovo export rinnova gran parte dei file nella storia di git.
- Online (dopo il push, GitHub Pages costruito sul commit f4cf738): nel browser integrato, una volta, pagina italiano → Ottoman Turkish aperto (Arabic, Persian, Classical Persian con i numeri-link) → elenco «Italian ← Ottoman Turkish ← Arabic» → clic su *caffè* → scheda con tappe, significato, etimologia e «taken by». Console vuota.

## 2026-10-18 — risposte di Davide alle tre domande del mandato 08 (applicate)
1. **Griglia**: una casella del primo livello apre l'elenco `words.html?to=X&from=Y` (colonna «Latin» = `LATINO`): era già così. Le caselle del secondo livello e della colonna «other» aprono per ora la pagina della lingua che riceve. **File che servirebbero dall'export** per farle aprire un elenco: `coppie/<arrivo>/__via_<livello2>.json` (tutte le parole di `<arrivo>` la cui tappa 2 è `<livello2>`, qualunque sia la lingua diretta: una per casella del secondo livello, anche `__via_LATINO.json` e `__via_altre.json`) e `coppie/<arrivo>/__altre.json` (tutte le parole di `<arrivo>` la cui lingua diretta è fuori dalle 33 e non è latino). Stesso formato dei file di coppia; per le celle principali solo prestito + latinismo_dotto + calco come in `griglia.json`, oppure tutte le categorie e il sito spunta quelle tre.
2. Il numero di una riga apre l'elenco con solo la categoria della riga spuntata: resta così.
3. **Secondo livello per categoria**: sotto una riga si contano solo le parole della categoria della riga (`per_categoria` di `livello2.json`); tolta la scritta «(all categories)», ora «Before Ottoman Turkish, these 27 Italian words came from:». Per il latino unito il sito usa le voci `LATINO` dell'export (e non le varietà); con «split Latin varieties» le varietà. Anche i numeri del secondo livello portano `&cat=`. About aggiornato.
   Controllo (Edge senza finestra, console pulita): la somma torna con il numero della riga in tutti i casi provati. Italiano ← turco ottomano, borrowed 27 = arabo 7 + persiano 5 + persiano classico 4 + 1 a una protolingua nascosta + 10 senza passo precedente. Italiano ← latino learned 4.377 (3.429 con le varietà divise), italiano ← francese borrowed 921, italiano → inglese borrowed 1.276 (uguale da tutti e due i lati), albanese ← latino learned 635. «Senza passo precedente» è calcolato come differenza (numero della riga − parole con un passo dopo in quella categoria), perché `totali` non è per categoria.
   **Problema nell'export**: in `livello2.json` la voce `LATINO` compare due volte nella lista `en|it` (stessi numeri): il sito ne conta una sola.

## 2026-10-18 — numero di versione contro la cache
Davide vedeva la home ferma su «Loading…» in Chrome: GitHub Pages fa tenere i file 10 minuti e il browser mescolava il vecchio `js/home.js` con i dati nuovi. Ora ogni css, js e `data/*.js` è caricato con `?v=<versione>` e la costante `VERSION` di `js/common.js` si aggiunge a ogni file letto con `fetch()` (dati, `coppie/`, `dati_a/`). Un solo punto: `scripts/versione.py` scrive la versione in tutte le pagine e in `common.js` (senza argomento usa data e ora); `aggiorna_dati.py` lo lancia da solo. Va lanciato a ogni pubblicazione (scritto nel README). Versione di oggi: `20261018b`. Le pagine HTML stesse possono restare in cache fino a 10 minuti: dopo una pubblicazione, al massimo un ricaricamento. Prove con Edge senza finestra rifatte, nessun errore.

## 2026-10-18 — menu «Languages»
«Languages» puntava alla home stessa e sembrava non fare nulla. Ora in tutte le pagine punta a `index.html#languages`: l'elenco delle 33 lingue sotto la griglia ha `id="languages"` e la home ci scorre anche dopo aver disegnato la griglia (il disegno spostava l'elenco più in basso). Il logo «lexodus» resta la home. Sopra la griglia c'è la riga «Jump to the list of languages», perché l'elenco sta sotto circa 1.300 px di griglia. Versione `20261018c`. Provato con Edge senza finestra: da una scheda parola, «Languages» porta all'elenco; anche la riga «Jump…» ci porta. Console pulita e prove complete rifatte senza errori.

## 2026-10-18 sera — mandato 10: pagina Languages, ricerca con albero, statistiche, traslitterazione

### Cosa è stato fatto
- **Dati veri (export v3 del mandato 09), non il campione.** All'inizio (16:35) l'export nuovo non c'era: ho costruito le pagine su un campione mio nello stesso formato (script nella cartella temporanea, mai nel repo). L'export è comparso alle 16:54; ho aspettato che fosse fermo (754 MB, 23.620 file, invariato per un minuto) e l'ho copiato con `scripts/aggiorna_dati.py` alle 16:59. Poi ho adattato il codice al formato vero (letto in `data/README_export.md`). Quando ho copiato, nel JOURNAL di rete-prestiti non c'era ancora «Mandato 09 — esito».
- `aggiorna_dati.py` copia anche `indice/`, `alberi/`, `statistiche.json` e mette in `coppie_elenco` i file `__via_*` (`_via`) e `__altre` (`_altre`). `data/` ora pesa 638 MB (coppie 406, alberi 109, indice 51), 23.577 file.
- **Menu nuovo** in tutte le pagine: Languages, Search, Statistics, About. La home tiene titolo, riga di spiegazione e griglia; tolti l'elenco delle lingue e la riga «Jump to the list».
- **`languages.html`**: le 33 lingue con la copertura in parole, le 3 lingue da cui hanno preso di più (prestito + latinismo + calco, latino unito, famiglie e protolingue escluse, come nella griglia; ogni nome apre l'elenco delle parole) e una casella per cercare per nome.
- **`search.html?q=`**: una casella; legge `_meta.json` e solo il file della lettera cercata (normalizzazione dell'export: minuscole, senza accenti, `tabella_lettere`, senza apostrofi). Parola scritta in alfabeto non latino → tutti i file `_` (uno per lingua, 6,9 MB in tutto). Cerca sulla parola, sulla traslitterazione e sul significato inglese (nel file caricato); in fondo un pulsante per cercare il significato in tutto l'indice (59 file, 51 MB: solo a richiesta). Risultati per lingua (prima le lingue con la parola identica), 12 per lingua con «Show all»: parola (traslitterazione), «?» se incerta o con più ipotesi, categoria, lingua diretta, significato.
- **`tree.html?lang=&w=&n=`** (più `&f=` quando la lettera del file viene dalla traslitterazione): in cima l'origine più lontana, le tappe in giù su una linea blu, la parola evidenziata, sotto i rami (righe rientrate con una linea grigia, un ramo per figlio, `giu` ricorsivo). Ogni nodo: lingua (link), parola (traslitterazione), come è arrivata in parola, «word page», significato in piccolo. `radici_altre` → un albero per ciascuna, titolo «Another origin of the same spelling». Senza librerie; su telefono i rami rientrano meno.
- **`stats.html`**: Hidden donors (menu della lingua di arrivo, si ricorda in `?lang=`; numero del secondo livello = link all'elenco `__via_`), Bridge languages (prime 20, «Show all»), Given and received (tabella con copertura), Most travelled words (catene più lunghe e parole prese da più lingue, link all'albero). Ogni sezione mostra la `nota` del file (in inglese, con i nomi dei campi come li scrive l'export).
- **Traslitterazione ovunque**: elenchi (parola e «From»), scheda parola (titolo e tappe), albero, ricerca, statistiche: «قهوه (kahve)». Se manca, solo l'originale.
- **Parole con più ipotesi** negli elenchi con «?» e nella colonna «From» le ipotesi unite da «or»; nella scheda come prima. Nota sotto gli elenchi e About aggiornati.
- **Griglia**: ogni casella del secondo livello apre `words.html?to=X&via=Y` (`__via_Y.json`), ogni casella «other» `words.html?to=X&from=other` (`__altre.json`). Controllo: 642 caselle di secondo livello e 689 di primo livello, tutte con il loro file.
- **Scheda parola**: legge `testo` dal file della coppia semplice (`catena[0].codice`) quando la parola arriva da LATINO, `__via_` o `__altre`; link «See the whole tree».
- About e README aggiornati. Versione `202610181703`.

### Verifica (Edge senza finestra, server locale, cache spenta; 53 controlli, console pulita in ogni pagina)
Menu Languages → pagina (33 righe; italiano «Latin 4,400 · English 1,106 · French 1,054») → italiano. Search «caffè» → 13 parole in 4 lingue → albero con Arabic in cima, poi Ottoman Turkish, Italian, e sotto English, French, Icelandic, Dutch (e i loro discendenti, 28 parole). «zucchero» → 7 tappe sopra. «piano» → inglese con due alberi. «кафе» → bulgaro, russo, ucraino, serbo-croato, albero di кафе (kafé) anche senza `&f=`; «qahwa» → arabo e persiano. Statistics → Bulgarian: Arabic 104 al secondo livello, 5 diretti, via Ottoman Turkish 94. Griglia → casella di secondo livello (Albanian ← … ← Arabic, 110 parole) → scheda con testo e albero; casella «other» (Albanian ← other languages, 2.405). Telefono 375 px: nessuno scorrimento di lato in languages, search, tree, stats, words. Screenshot nuovi: `languages.png`, `search.png`, `tree-caffe.png`, `tree-caffe-phone.png`, `stats.png`.

### Scelte fatte da me (da confermare con Davide)
1. «Le 3 lingue da cui prende di più» contano prestito + latinismo dotto + calco (come la griglia), non solo i prestiti.
2. Statistiche: famiglie e protolingue escluse (Proto-Slavic sarebbe il primo «donatore nascosto» del bulgaro), come l'interruttore acceso nelle pagine lingua.
3. Ricerca per significato: solo nel file della lettera cercata, il resto con un pulsante.
4. Nei rami dell'albero il link «word page» c'è per ogni parola delle 33 lingue; anche la tappa araba in cima ce l'ha, ma la forma con le vocali (قَهْوَة) spesso non è negli elenchi e la scheda dice «not in the lists».

### Cosa manca / problemi
1. Le note delle statistiche sono lunghe e citano i nomi dei campi (`diretto`, `secondo_livello`): vanno accorciate nell'export se Davide le vuole più semplici.
2. Peso: ogni nuovo export rinnova centinaia di MB nella storia di git (ora `data/` 638 MB).
3. Alberi: per le grafie con più etimologie i discendenti compaiono sotto tutte (lo dice l'export, «Ambiguità»).
