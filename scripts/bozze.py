"""Build the three style drafts in bozze/ (mandate 15): copies of index.html and language.html for each style.

    python -I -X utf8 scripts/bozze.py

The real site is not touched. For each style in STILI it writes bozze/<style>/index.html and
bozze/<style>/language.html from the pages at the root, with:
- the style's own bozze/<style>/style.css and its Google Fonts link (display=swap) instead of css/style.css;
- data/*.js read from ../../data/;
- copies of js/common.js, js/home.js and js/language.js in bozze/js/ (common.js reads every data file from
  ../../ and sends lists of words, word pages, trees and About to the real pages at the root);
- menu links to the other pages pointing to the real pages (../../), while index.html and language.html stay in
  the draft, so moving between languages keeps the style.
bozze/<style>/style.css and bozze/index.html are written by hand and are not touched here.
"""
import os
import re
import shutil

RADICE = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
BOZZE = os.path.join(RADICE, "bozze")

STILI = {
    "tipografico": "family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,600;1,7..72,400&display=swap",
    "moderno": "family=Manrope:wght@300;400;500;600;700&display=swap",
    "cartografico": "family=Alegreya+SC:wght@500;700&family=Alegreya+Sans:ital,wght@0,400;0,500;0,700;1,400&display=swap",
}
NOMI = {"tipografico": "typographic", "moderno": "modern", "cartografico": "cartographic"}
LOCALI = {"index.html", "language.html"}


def copia_js():
    os.makedirs(os.path.join(BOZZE, "js"), exist_ok=True)
    for nome in ("home.js", "language.js"):
        shutil.copyfile(os.path.join(RADICE, "js", nome), os.path.join(BOZZE, "js", nome))
    testo = open(os.path.join(RADICE, "js", "common.js"), encoding="utf-8").read()
    testo = testo.replace(
        'function withVersion(path) { return path +',
        'var ROOT = "../../"; // draft (bozze/<style>/): data and the other pages are those of the real site\n'
        '  function withVersion(path) { return ROOT + path +')
    for pagina in ("words.html?", "word.html?", "tree.html?"):
        testo = testo.replace('"' + pagina, 'ROOT + "' + pagina)
    testo = testo.replace('href="about.html', 'href="../../about.html')
    testo = testo.replace('var RO_LINK = "about.html', 'var RO_LINK = "../../about.html')
    if testo.count("ROOT") < 6:
        raise SystemExit("common.js: patch did not apply")
    testo = testo.replace("/* lexodus — shared code:", "/* lexodus (draft copy, built by scripts/bozze.py) — shared code:", 1)
    open(os.path.join(BOZZE, "js", "common.js"), "w", encoding="utf-8", newline="").write(testo)


def link(m):
    attr, url = m.group(1), m.group(2)
    if re.match(r"(https?:|#|data:|mailto:)", url):
        return m.group(0)
    base = url.split("?")[0].split("#")[0]
    if base == "css/style.css":
        return '%s="style.css"' % attr
    if base.startswith("data/"):
        return '%s="../../%s"' % (attr, url)
    if base.startswith("js/"):
        return '%s="../%s"' % (attr, url.split("?")[0])
    if base in LOCALI:
        return m.group(0)
    return '%s="../../%s"' % (attr, url)


def pagina(stile, nome):
    testo = open(os.path.join(RADICE, nome), encoding="utf-8").read()
    testo = re.sub(r'(href|src)="([^"]*)"', link, testo)
    fonts = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
             '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
             '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?%s">\n' % STILI[stile])
    testo = testo.replace('<link rel="stylesheet" href="style.css">', fonts + '<link rel="stylesheet" href="style.css">')
    testo = testo.replace('<meta name="description"', '<meta name="robots" content="noindex">\n<meta name="description"', 1)
    testo = testo.replace("<body>", '<body class="draft-%s">' % stile, 1)
    testo = testo.replace(
        "<title>lexodus</title>", "<title>lexodus (%s draft)</title>" % NOMI[stile])
    testo = testo.replace(
        "<title>Language — lexodus</title>", "<title>Language — lexodus (%s draft)</title>" % NOMI[stile])
    os.makedirs(os.path.join(BOZZE, stile), exist_ok=True)
    open(os.path.join(BOZZE, stile, nome), "w", encoding="utf-8", newline="").write(testo)


if __name__ == "__main__":
    copia_js()
    for s in STILI:
        for n in sorted(LOCALI):
            pagina(s, n)
    print("drafts written in", BOZZE)
