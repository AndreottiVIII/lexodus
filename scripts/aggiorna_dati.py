"""Copy the site data from rete-prestiti/risultati/export/ into data/.

    python -I -X utf8 scripts/aggiorna_dati.py                 # everything the site uses
    python -I -X utf8 scripts/aggiorna_dati.py --parole        # also parole/ (not used by the site; 155 MB on 18/10/2026)
    python -I -X utf8 scripts/aggiorna_dati.py C:/path/to/export
    python -I -X utf8 scripts/aggiorna_dati.py --solo-indici   # only rebuild the index below

It copies lingue.json, archi.json, livello2.json, storie.json, griglia.json, the folder coppie/
(one file per pair of languages, mandate 07; with __via_*.json and __altre.json, mandate 09), the search
index indice/, the trees alberi/, statistiche.json (mandate 09), the files of the Explore pages and of the
language page (mandate 11: lingua_extra/, doppioni/, andate_tornate/, confronto/, famiglie.json) and the
export README (as data/README_export.md),
and writes the .js twins of the small files so the home and the language pages also open from a
local file (browsers block fetch() on file://). Then it builds one index from data/coppie/:

- data/coppie_elenco.json (+ .js): which pair files exist, {arrivo: {origine: [livello2, ...]}} (file names
  without .json; "_via": [livello2, ...] for the files __via_<livello2>.json, "_altre": [] when __altre.json
  exists, "_alternative": [] when _alternative.json exists), plus "_eccezioni" (code -> file name, from coppie/_eccezioni_nomi.json), so the site
  only turns a number into a link when its list of words exists;
(data/dati_a/ is no longer built: the word page reads "Then taken by" from the trees, alberi/, field "giu".)

Nothing is copied if what the site uses (the export without parole/ and dati_a/) is over 800 MB (authorised
18/10/2026); parole/ only with --parole and under 100 MB.
At the end it sets a new version number on the pages (scripts/versione.py).
Nothing in rete-prestiti changes.
"""
import json
import os
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import versione  # noqa: E402

QUI = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.normpath(os.path.join(QUI, "..", "data"))
EXPORT = os.path.normpath(os.path.join(QUI, "..", "..", "rete-prestiti", "risultati", "export"))
FILES = ("lingue", "archi", "livello2", "storie", "griglia")
MAX_PAROLE = 100 * 1024 * 1024
MAX_TOTALE = 800 * 1024 * 1024
FOLDERS = ("indice", "alberi", "lingua_extra", "doppioni", "andate_tornate", "confronto")
SINGLE = ("statistiche", "famiglie")
NOT_COPIED = ("parole", "dati_a")


def gemello_js(nome, testo, data=None):
    with open(os.path.join(data or DATA, nome + ".js"), "w", encoding="utf-8") as f:
        f.write("window.LEXODUS=window.LEXODUS||{};window.LEXODUS[%s]=%s;\n" % (json.dumps(nome), testo))


def scrivi(nome, obj, js=False, data=None):
    testo = json.dumps(obj, ensure_ascii=False, separators=(",", ":"))
    with open(os.path.join(data or DATA, nome + ".json"), "w", encoding="utf-8") as f:
        f.write(testo)
    if js:
        gemello_js(nome, testo, data)


def peso(cartella):
    return sum(os.path.getsize(os.path.join(r, f)) for r, _, fs in os.walk(cartella) for f in fs)


def costruisci_indici(data=DATA):
    """Build data/coppie_elenco.* from data/coppie/ (and remove the old data/dati_a/)."""
    coppie = os.path.join(data, "coppie")
    elenco = {}
    for arrivo in sorted(os.listdir(coppie)) if os.path.isdir(coppie) else []:
        cartella = os.path.join(coppie, arrivo)
        if not os.path.isdir(cartella):
            continue
        nomi = sorted(f[:-5] for f in os.listdir(cartella) if f.endswith(".json") and not f.startswith("_"))
        primo = [n for n in nomi if "__" not in n]
        voce = {o: [] for o in primo}
        for n in nomi:
            if "__" not in n:
                continue
            # the origin is the longest level-1 name that prefixes "<origin>__"
            o = max((p for p in primo if n.startswith(p + "__")), key=len, default=None)
            if o is None:
                o, _, v = n.partition("__")
                voce.setdefault(o, [])
            else:
                v = n[len(o) + 2:]
            voce[o].append(v)
        if os.path.isfile(os.path.join(cartella, "_alternative.json")):
            voce["_alternative"] = []
        # grid files (mandate 09): __via_<livello2>.json and __altre.json
        via = sorted(f[len("__via_"):-5] for f in os.listdir(cartella) if f.startswith("__via_") and f.endswith(".json"))
        if via:
            voce["_via"] = via
        if os.path.isfile(os.path.join(cartella, "__altre.json")):
            voce["_altre"] = []
        elenco[arrivo] = voce
    ecc = os.path.join(coppie, "_eccezioni_nomi.json")
    if os.path.isfile(ecc):
        # codes whose file name is not the plain rule (Windows reserved names, codes that differ only by case)
        elenco["_eccezioni"] = json.load(open(ecc, encoding="utf-8")).get("eccezioni", {})
    scrivi("coppie_elenco", elenco, js=True, data=data)
    vecchio = os.path.join(data, "dati_a")
    if os.path.isdir(vecchio):
        shutil.rmtree(vecchio)
    n_file = sum(len(v) + sum(len(x) for x in v.values()) for v in elenco.values())
    print("index: coppie_elenco (%d files listed)" % n_file)


def main(export, con_parole):
    mancanti = [n + ".json" for n in FILES if not os.path.isfile(os.path.join(export, n + ".json"))]
    if not os.path.isdir(os.path.join(export, "coppie")):
        mancanti.append("coppie/")
    if mancanti:
        sys.exit("Missing in %s: %s. Nothing copied." % (export, ", ".join(mancanti)))
    mb_coppie = peso(os.path.join(export, "coppie")) / 1024 / 1024
    totale = sum(peso(os.path.join(export, d)) if os.path.isdir(os.path.join(export, d)) else os.path.getsize(os.path.join(export, d))
                 for d in os.listdir(export) if d not in NOT_COPIED)
    if totale > MAX_TOTALE:
        sys.exit("the export without parole/ and dati_a/ is %.0f MB, over 800 MB: nothing copied. Write it in the JOURNAL." % (totale / 1024 / 1024))
    print("export without parole/ and dati_a/: %.0f MB" % (totale / 1024 / 1024))
    os.makedirs(DATA, exist_ok=True)
    for nome in FILES:
        src = os.path.join(export, nome + ".json")
        with open(src, encoding="utf-8") as f:
            testo = f.read().strip()
        json.loads(testo)  # stop here if the file is not valid JSON
        shutil.copyfile(src, os.path.join(DATA, nome + ".json"))
        gemello_js(nome, testo)
        print("copied", nome + ".json", len(testo) // 1024, "KB")
    dest = os.path.join(DATA, "coppie")
    if os.path.isdir(dest):
        shutil.rmtree(dest)
    shutil.copytree(os.path.join(export, "coppie"), dest)
    print("copied coppie/ (%.0f MB)" % mb_coppie)
    # mandates 09 and 11: search index, trees, Explore pages, language page (copied when they are in the export)
    for cartella in FOLDERS:
        src, d = os.path.join(export, cartella), os.path.join(DATA, cartella)
        if os.path.isdir(src):
            if os.path.isdir(d):
                shutil.rmtree(d)
            shutil.copytree(src, d)
            print("copied %s/ (%.0f MB)" % (cartella, peso(d) / 1024 / 1024))
        else:
            print("NOT in the export: %s/ (the site keeps what is in data/)" % cartella)
    for nome in SINGLE:
        src = os.path.join(export, nome + ".json")
        if os.path.isfile(src):
            json.load(open(src, encoding="utf-8"))
            shutil.copyfile(src, os.path.join(DATA, nome + ".json"))
            print("copied %s.json" % nome)
        else:
            print("NOT in the export: %s.json (the site keeps what is in data/)" % nome)
    if os.path.isfile(os.path.join(export, "README.md")):
        shutil.copyfile(os.path.join(export, "README.md"), os.path.join(DATA, "README_export.md"))
    parole = os.path.join(export, "parole")
    if con_parole and os.path.isdir(parole):
        mb = peso(parole) / 1024 / 1024
        if mb * 1024 * 1024 > MAX_PAROLE:
            print("parole/ is %.0f MB, over 100 MB: not copied" % mb)
        else:
            d = os.path.join(DATA, "parole")
            if os.path.isdir(d):
                shutil.rmtree(d)
            shutil.copytree(parole, d)
            print("copied parole/ (%.0f MB)" % mb)
    costruisci_indici()
    fonte = {"tipo": "export", "da": "rete-prestiti/risultati/export", "scarico": "2026-10-18"}
    scrivi("fonte", fonte, js=True)
    versione.segna()  # new "?v=" everywhere, so browsers load the new files
    print("done")


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if "--solo-indici" in sys.argv[1:]:
        costruisci_indici()
    else:
        main(args[0] if args else EXPORT, "--parole" in sys.argv[1:])
