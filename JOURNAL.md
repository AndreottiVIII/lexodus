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
