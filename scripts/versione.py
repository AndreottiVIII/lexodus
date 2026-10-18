"""Set one version number on every css, js and data file the pages load, so browsers do not keep old copies.

    python -I -X utf8 scripts/versione.py            # version = now, e.g. 202610181650
    python -I -X utf8 scripts/versione.py 20261018b  # a version of your choice

GitHub Pages lets browsers keep files for 10 minutes: run this before every publication
(scripts/aggiorna_dati.py runs it by itself). It rewrites, in one go:
- the "?v=..." after css/*.css, js/*.js and data/*.js in every .html page;
- the constant VERSION in js/common.js, which is added to every file read with fetch() (data/*.json, coppie/, dati_a/).
"""
import datetime
import glob
import os
import re
import sys

RADICE = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
TAG = re.compile(r'((?:src|href)="(?:css|js|data)/[^"?]+\.(?:css|js))(?:\?v=[^"]*)?"')
COSTANTE = re.compile(r'var VERSION = "[^"]*";')


def segna(versione=None):
    v = versione or datetime.datetime.now().strftime("%Y%m%d%H%M")
    if not re.fullmatch(r"[0-9A-Za-z._-]+", v):
        sys.exit("bad version: " + v)
    for p in glob.glob(os.path.join(RADICE, "*.html")):
        testo = open(p, encoding="utf-8").read()
        nuovo = TAG.sub(lambda m: '%s?v=%s"' % (m.group(1), v), testo)
        if nuovo != testo:
            open(p, "w", encoding="utf-8", newline="").write(nuovo)
    p = os.path.join(RADICE, "js", "common.js")
    testo = open(p, encoding="utf-8").read()
    if not COSTANTE.search(testo):
        sys.exit("VERSION not found in js/common.js")
    open(p, "w", encoding="utf-8", newline="").write(COSTANTE.sub('var VERSION = "%s";' % v, testo))
    print("version", v)
    return v


if __name__ == "__main__":
    segna(sys.argv[1] if len(sys.argv) > 1 else None)
