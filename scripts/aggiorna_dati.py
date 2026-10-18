"""Copy the site data from rete-prestiti/risultati/export/ into data/.

    python -I -X utf8 scripts/aggiorna_dati.py                 # everything the site uses
    python -I -X utf8 scripts/aggiorna_dati.py --parole        # also parole/ (127 MB on 18/10/2026)
    python -I -X utf8 scripts/aggiorna_dati.py C:/path/to/export
    python -I -X utf8 scripts/aggiorna_dati.py --solo-indici   # only rebuild the two indexes below

It copies lingue.json, archi.json, livello2.json, storie.json, griglia.json, the folder coppie/
(one file per pair of languages, mandate 07) and the export README (as data/README_export.md),
and writes the .js twins of the small files so the home and the language pages also open from a
local file (browsers block fetch() on file://). Then it builds two indexes from data/coppie/:

- data/coppie_elenco.json (+ .js): which pair files exist, {arrivo: {origine: [livello2, ...]}} (file names
  without .json), plus "_eccezioni" (code -> file name, from coppie/_eccezioni_nomi.json), so the site
  only turns a number into a link when its list of words exists;
- data/dati_a/<codice>.json: for each of the 33 languages, the words it gave, keyed by the word as
  written in the language that took it ("termine_origine"): {termine: [[arrivo, parola, n_etimologia], ...]}.
  Used by the word page ("This word was then taken by").

coppie/ is copied only if it stays under 500 MB; parole/ only with --parole and under 100 MB.
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
MAX_COPPIE = 500 * 1024 * 1024


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
    """Build data/coppie_elenco.* and data/dati_a/ from data/coppie/."""
    coppie = os.path.join(data, "coppie")
    arrivi = [l["codice"] for l in json.load(open(os.path.join(data, "lingue.json"), encoding="utf-8"))["lingue_di_arrivo"]]
    elenco, dati_a = {}, {c: {} for c in arrivi}
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
        elenco[arrivo] = voce
        for o in primo:
            if o not in dati_a or o == arrivo:
                continue
            with open(os.path.join(cartella, o + ".json"), encoding="utf-8") as f:
                coppia = json.load(f)
            for p in coppia.get("parole", []):
                t = p.get("termine_origine") or ""
                if t:
                    dati_a[o].setdefault(t, []).append([arrivo, p["parola"], p.get("n_etimologia", 1)])
    ecc = os.path.join(coppie, "_eccezioni_nomi.json")
    if os.path.isfile(ecc):
        # codes whose file name is not the plain rule (Windows reserved names, codes that differ only by case)
        elenco["_eccezioni"] = json.load(open(ecc, encoding="utf-8")).get("eccezioni", {})
    scrivi("coppie_elenco", elenco, js=True, data=data)
    os.makedirs(os.path.join(data, "dati_a"), exist_ok=True)
    for c, idx in dati_a.items():
        with open(os.path.join(data, "dati_a", c + ".json"), "w", encoding="utf-8") as f:
            json.dump(idx, f, ensure_ascii=False, separators=(",", ":"))
    n_file = sum(len(v) + sum(len(x) for x in v.values()) for v in elenco.values())
    print("indexes: coppie_elenco (%d files listed), dati_a (%d languages, %.1f MB)" % (
        n_file, len(dati_a), peso(os.path.join(data, "dati_a")) / 1024 / 1024))


def main(export, con_parole):
    mancanti = [n + ".json" for n in FILES if not os.path.isfile(os.path.join(export, n + ".json"))]
    if not os.path.isdir(os.path.join(export, "coppie")):
        mancanti.append("coppie/")
    if mancanti:
        sys.exit("Missing in %s: %s. Nothing copied." % (export, ", ".join(mancanti)))
    mb_coppie = peso(os.path.join(export, "coppie")) / 1024 / 1024
    if mb_coppie * 1024 * 1024 > MAX_COPPIE:
        sys.exit("coppie/ is %.0f MB, over 500 MB: nothing copied. Write it in the JOURNAL." % mb_coppie)
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
