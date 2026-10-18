"""Copy the site data from rete-prestiti/risultati/export/ into data/.

    python -I -X utf8 scripts/aggiorna_dati.py                 # lingue, archi, livello2, storie
    python -I -X utf8 scripts/aggiorna_dati.py --parole        # also parole/ (127 MB on 18/10/2026)
    python -I -X utf8 scripts/aggiorna_dati.py C:/path/to/export

It copies lingue.json, archi.json, livello2.json, storie.json and the export README (as
data/README_export.md), and writes the .js twins so the site also opens from a local file
(browsers block fetch() on file://). parole/ is copied only with --parole and only if it stays
under 100 MB (GitHub Pages and the repository should stay light). Nothing in rete-prestiti changes.
"""
import json
import os
import shutil
import sys

QUI = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(QUI, "..", "data")
EXPORT = os.path.join(QUI, "..", "..", "rete-prestiti", "risultati", "export")
FILES = ("lingue", "archi", "livello2", "storie")
MAX_PAROLE = 100 * 1024 * 1024


def gemello_js(nome, testo):
    with open(os.path.join(DATA, nome + ".js"), "w", encoding="utf-8") as f:
        f.write("window.LEXODUS=window.LEXODUS||{};window.LEXODUS[%s]=%s;\n" % (json.dumps(nome), testo))


def peso(cartella):
    return sum(os.path.getsize(os.path.join(r, f)) for r, _, fs in os.walk(cartella) for f in fs)


def main(export, con_parole):
    mancanti = [n + ".json" for n in FILES if not os.path.isfile(os.path.join(export, n + ".json"))]
    if mancanti:
        sys.exit("Missing in %s: %s. Nothing copied." % (export, ", ".join(mancanti)))
    os.makedirs(DATA, exist_ok=True)
    for nome in FILES:
        src = os.path.join(export, nome + ".json")
        with open(src, encoding="utf-8") as f:
            testo = f.read().strip()
        json.loads(testo)  # stop here if the file is not valid JSON
        shutil.copyfile(src, os.path.join(DATA, nome + ".json"))
        gemello_js(nome, testo)
        print("copied", nome + ".json", len(testo) // 1024, "KB")
    if os.path.isfile(os.path.join(export, "README.md")):
        shutil.copyfile(os.path.join(export, "README.md"), os.path.join(DATA, "README_export.md"))
    parole = os.path.join(export, "parole")
    if con_parole and os.path.isdir(parole):
        mb = peso(parole) / 1024 / 1024
        if mb * 1024 * 1024 > MAX_PAROLE:
            print("parole/ is %.0f MB, over 100 MB: not copied" % mb)
        else:
            dest = os.path.join(DATA, "parole")
            if os.path.isdir(dest):
                shutil.rmtree(dest)
            shutil.copytree(parole, dest)
            print("copied parole/ (%.0f MB)" % mb)
    fonte = {"tipo": "export", "da": "rete-prestiti/risultati/export", "scarico": "2026-10-18"}
    with open(os.path.join(DATA, "fonte.json"), "w", encoding="utf-8") as f:
        json.dump(fonte, f)
    gemello_js("fonte", json.dumps(fonte))
    print("done")


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if a != "--parole"]
    main(args[0] if args else EXPORT, "--parole" in sys.argv[1:])
