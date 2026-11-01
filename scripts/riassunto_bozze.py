# Genera bozze/tutte.html: tutte le bozze di veste grafica fatte finora, con foto e una riga ciascuna.
# Uso: python -I -X utf8 scripts/riassunto_bozze.py
import html, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "bozze" / "tutte.html"

SERIE = [
    ("bozze", "Serie 1 (29 ottobre): tre stili sullo stesso impianto", [
        ("tipografico", "Tipografico", "Carta avorio, serif, rosso mattone, filetti: aria da dizionario stampato.", "1280"),
        ("moderno", "Moderno", "Bianco, Manrope, un blu acceso, titoli grandi e leggeri: strumento web. «Il meno peggio» (Davide).", "1280"),
        ("cartografico", "Cartografico", "Banda blu notte, fondo sabbia, maiuscoletto, percorsi tratteggiati in ocra.", "1280"),
    ]),
    ("bozze2", "Serie 2 (29 ottobre): oggetti del mondo reale", [
        ("passaporto", "Passaporto", "La parola è un viaggiatore: un timbro per lingua; la pagina lingua è il registro della dogana.", "lingua"),
        ("tavola", "Tavola degli elementi", "Lingue come elementi per famiglia; una parola è una formula Ar → Ota → It. «La meno peggio» (Davide).", "lingua"),
        ("schedario", "Schedario", "Cassetti e schede a macchina, note a penna per i percorsi.", "lingua"),
        ("metro", "Metro", "Lingue come stazioni, famiglie come linee a 45°, l'albero come schema di linea.", "lingua"),
        ("mercato", "Mercato", "Casse a stencil, cartellini da/a/via, timbri IMPORT/EXPORT.", "lingua"),
        ("pixel", "Pixel", "Videogioco anni '80: mappa a tessere, barre HP, albero delle abilità.", "lingua"),
    ]),
    ("bozze3", "Serie 3 (29 ottobre): carta, lettere, libri", [
        ("amanuense", "Amanuense", "Pergamena, iniziali miniate, i percorsi come glosse a margine, l'albero come stemma di un codice.", "lingua"),
        ("babele", "Biblioteca di Babele", "Sale esagonali, scaffali con i dorsi alti quanto le parole, caffè è un libro aperto.", "lingua"),
        ("specimen", "Specimen di stamperia", "Ogni lingua composta nel suo alfabeto in corpo proporzionale; caffè in naskh, ruq'a, Bodoni.", "lingua"),
        ("vocabolario", "Vocabolario storico", "Frontespizio con indice; ITALIAN e CAFFÈ come voci di dizionario tra le voci vicine.", "lingua"),
        ("gazzetta", "Gazzetta", "Prima pagina dell'Ottocento, «Course of the Loans» come listino di borsa, caffè a telegrammi.", "lingua"),
        ("partitura", "Partitura", "La lingua è una sonata, le note alte quanto le parole, caffè passa di rigo in rigo sotto le legature.", "lingua"),
    ]),
    ("bozze4", "Serie 4 (29 ottobre): tradizioni grafiche vere, con divieti anti-AI", [
        ("svizzera", "Stile svizzero", "Müller-Brockmann: griglia a 12 colonne, un rosso, nome enorme in basso a sinistra, tabelle come orari FFS.", "lingua"),
        ("brutalista", "Web brutalista", "Primo web: Times, solo il blu dei link, tabelle a 1 px, liste di definizioni, ordine ferreo.", "lingua"),
        ("risografia", "Risografia", "Fanzine a due inchiostri (blu e rosa fluo) fuori registro, retino, titoli storti.", "lingua"),
        ("isotype", "Isotype", "Neurath e Arntz: pittogrammi ripetuti a gruppi di cinque, «i numeri si contano, non si misurano».", "lingua"),
        ("orario", "Orario ferroviario", "Orario generale FS: quadri numerati, arrivi su bianco e partenze sul giallo, note ◆ † ✱ con legenda.", "lingua"),
        ("tufte", "Tufte", "Monografia: EB Garamond, note a margine, sparkline nel testo, 33 small multiples in home.", "lingua"),
    ]),
    ("bozze5", "Serie 5 (1 novembre): mondi che fanno quello che fanno le parole (solo italiano e caffè)", [
        ("escher", "Escher", "Tre gravità per preso/dato/origini, scale di Penrose per le parole andate e tornate, caffè come Metamorfosi lettera per lettera.", "lingua"),
        ("piranesi", "Piranesi", "Carceri: un arco per origine lontana, passerelle per le lingue di passaggio, catene per le etimologie incerte; caffè scende nel buio.", "lingua"),
        ("celeste", "Carta celeste", "Cellarius: le parole sono stelle tirate dalle lingue che le hanno prese; caffè è una carta con l'arabo al polo.", "lingua"),
        ("isolario", "Isolario", "Bordone: ogni lingua un'isola, un porto per lingua di provenienza, rotte punteggiate; il portolano di caffè.", "lingua"),
        ("sentieri", "Sentieri che si biforcano", "Borges: un giardino di siepi, porte d'ingresso e d'uscita, doppioni che si ricongiungono, bivi per le origini incerte.", "lingua"),
        ("babele", "Torre di Babele", "Bruegel: 33 piani per famiglia, la roccia delle lingue antiche, caffè sale e scende lungo la rampa.", "lingua"),
    ]),
    ("bozze6", "Serie 6 (1 novembre): tre stampe di Escher eseguite con i dati (solo italiano e caffè)", [
        ("giorno-notte", "Giorno e notte", "I campi delle lingue diventano uccelli bianchi e neri: entrano sulla notte quelle da cui ha preso, escono sul giorno quelle a cui ha dato.", "lingua"),
        ("limite-cerchio", "Limite del cerchio", "Disco di Poincaré: angeli per le lingue da cui ha preso, diavoli per quelle a cui ha dato, le tappe lontane verso il bordo.", "lingua"),
        ("metamorfosi", "Metamorfosi", "Striscia di quadrati: le parole diventano uccelli, pesci e lucertole e tornano parole lungo la strada di caffè.", "lingua"),
    ]),
]

css = """
body{font:16px/1.4 Georgia,serif;margin:24px;color:#111;background:#fff;max-width:1200px}
h1{font-size:28px;margin:0 0 4px} h2{font-size:20px;margin:36px 0 10px;border-top:1px solid #999;padding-top:12px}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:18px}
figure{margin:0} img{width:100%;aspect-ratio:1/1;object-fit:cover;object-position:top;border:1px solid #ccc;display:block}
figcaption{margin-top:6px} b{display:block} small{color:#555} a{color:#1a3e8a}
p.note{color:#444;margin:4px 0 0}
"""
parts = [f"<!doctype html><html lang='it'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><meta name='robots' content='noindex'><title>lexodus — tutte le bozze</title><style>{css}</style></head><body>",
         "<h1>lexodus — tutte le bozze di veste grafica</h1><p class='note'>30 bozze in sei serie. Ogni foto è la pagina dell'italiano; i link aprono la bozza online con la scheda parola (e, fino alla serie 4, il telefono). Le serie 5 e 6 hanno un indice proprio: <a href='../bozze5/index.html'>bozze 5</a>, <a href='../bozze6/index.html'>bozze 6</a>. Nessuna è ancora scelta.</p>"]
n = 0
for cartella, titolo, voci in SERIE:
    parts.append(f"<h2>{html.escape(titolo)}</h2><div class='g'>")
    for nome, etichetta, riga, suff in voci:
        n += 1
        img = f"../docs/screenshots/{cartella}/{nome}-{suff}.png"
        link = f"../{cartella}/{nome}/language.html?code=it"
        parts.append(f"<figure><a href='{link}'><img src='{img}' alt='{html.escape(etichetta)}' loading='lazy'></a>"
                     f"<figcaption><b>{n}. {html.escape(etichetta)}</b>{html.escape(riga)}<br><small><a href='{link}'>apri la bozza</a></small></figcaption></figure>")
    parts.append("</div>")
parts.append("</body></html>")
OUT.write_text("\n".join(parts), encoding="utf-8")
print("scritto", OUT, "bozze:", n)
