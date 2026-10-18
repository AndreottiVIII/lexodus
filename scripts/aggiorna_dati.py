"""Copy the real site data from rete-prestiti/risultati/export/ into data/.

    python -I -X utf8 scripts/aggiorna_dati.py
    python -I -X utf8 scripts/aggiorna_dati.py C:/path/to/rete-prestiti/risultati/export

It copies lingue.json, archi.json, storie.json, README.md and the parole/ folder, and
writes the .js twins (lingue.js, archi.js, storie.js, fonte.js) so the site also opens
from a local file (browsers block fetch() on file://). Nothing in rete-prestiti is changed.
"""
import json
import os
import shutil
import sys

QUI = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(QUI, "..", "data")
EXPORT = os.path.join(QUI, "..", "..", "rete-prestiti", "risultati", "export")


def gemello_js(nome, testo):
    with open(os.path.join(DATA, nome + ".js"), "w", encoding="utf-8") as f:
        f.write("window.LEXODUS=window.LEXODUS||{};window.LEXODUS[%s]=%s;\n" % (json.dumps(nome), testo))


def main(export):
    if not os.path.isdir(export):
        sys.exit("Export folder not found: %s\nThe site keeps the sample now in data/." % export)
    mancanti = [n for n in ("lingue.json", "archi.json") if not os.path.isfile(os.path.join(export, n))]
    if mancanti:
        sys.exit("Missing in export: %s. Nothing copied." % ", ".join(mancanti))
    os.makedirs(DATA, exist_ok=True)
    for nome in ("lingue", "archi", "storie"):
        src = os.path.join(export, nome + ".json")
        if not os.path.isfile(src):
            print("skip", nome + ".json (not in export)")
            continue
        with open(src, encoding="utf-8") as f:
            testo = f.read().strip()
        json.loads(testo)  # stop here if the file is not valid JSON
        shutil.copyfile(src, os.path.join(DATA, nome + ".json"))
        gemello_js(nome, testo)
        print("copied", nome + ".json", len(testo) // 1024, "KB")
    if os.path.isfile(os.path.join(export, "README.md")):
        shutil.copyfile(os.path.join(export, "README.md"), os.path.join(DATA, "README_export.md"))
    parole = os.path.join(export, "parole")
    if os.path.isdir(parole):
        dest = os.path.join(DATA, "parole")
        if os.path.isdir(dest):
            shutil.rmtree(dest)
        shutil.copytree(parole, dest)
        print("copied parole/")
    fonte = {"tipo": "export", "da": "rete-prestiti/risultati/export", "scarico": "2026-10-18"}
    with open(os.path.join(DATA, "fonte.json"), "w", encoding="utf-8") as f:
        json.dump(fonte, f)
    gemello_js("fonte", json.dumps(fonte))
    print("done")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else EXPORT)
