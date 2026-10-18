"""Build a SAMPLE of the site data from the CSV tables of rete-prestiti (read only).

Use it only while rete-prestiti/risultati/export/ does not exist yet.
When the real export is there, use scripts/aggiorna_dati.py instead.

    python -I -X utf8 scripts/campione_da_csv.py ../rete-prestiti/risultati data

Reads: rete_copertura.csv, rete_archi.csv, lingue_codici.csv, ../script/lingue_nomi_it.csv,
and streams rete_parole.csv once (about 1 minute) to pick up to 12 example words per arc.
Writes: data/lingue.json, data/archi.json and the .js twins (data/lingue.js, data/archi.js)
that let the site open from a local file without a web server.
"""
import csv
import hashlib
import json
import os
import re
import sys

csv.field_size_limit(10**9)

NOMI_IT = {
    "it": "italiano", "fr": "francese", "es": "spagnolo", "pt": "portoghese", "ca": "catalano",
    "ro": "romeno", "en": "inglese", "de": "tedesco", "nl": "olandese", "sv": "svedese",
    "da": "danese", "nb": "norvegese (bokmål)", "is": "islandese", "pl": "polacco", "cs": "ceco",
    "sk": "slovacco", "ru": "russo", "uk": "ucraino", "bg": "bulgaro", "sh": "serbo-croato",
    "sl": "sloveno", "el": "greco", "hu": "ungherese", "fi": "finlandese", "et": "estone",
    "lt": "lituano", "lv": "lettone", "sq": "albanese", "mt": "maltese", "tr": "turco",
    "ar": "arabo", "fa": "persiano", "he": "ebraico",
}
CATEGORIE = {"prestito", "latinismo_dotto", "ereditato", "calco", "non_precisato"}
BUONA_PAROLA = re.compile(r"^[^\W\d_]{3,10}$")


def giudizio(pct):
    if pct >= 70:
        return "buona"
    if pct >= 30:
        return "media"
    return "scarsa"


def scrivi(cartella, nome, dati):
    testo = json.dumps(dati, ensure_ascii=False, separators=(",", ":"))
    with open(os.path.join(cartella, nome + ".json"), "w", encoding="utf-8") as f:
        f.write(testo)
    with open(os.path.join(cartella, nome + ".js"), "w", encoding="utf-8") as f:
        f.write("window.LEXODUS=window.LEXODUS||{};window.LEXODUS[%s]=%s;\n" % (json.dumps(nome), testo))


def main(ris, out):
    os.makedirs(out, exist_ok=True)
    codici = {}
    with open(os.path.join(ris, "lingue_codici.csv"), encoding="utf-8") as f:
        for r in csv.DictReader(f):
            codici[r["codice"]] = (r["nome"], r["tipo_lingua"])
    nomi_it = {}
    with open(os.path.join(ris, "..", "script", "lingue_nomi_it.csv"), encoding="utf-8") as f:
        for r in csv.DictReader(f):
            nomi_it.setdefault(r["codice"], r["nome_it"])

    archi = []
    with open(os.path.join(ris, "rete_archi.csv"), encoding="utf-8") as f:
        for r in csv.DictReader(f):
            if r["categoria"] not in CATEGORIE or r["livello"] != "diretta":
                continue
            archi.append({
                "origine": r["lingua_origine_codice"], "arrivo": r["lingua_arrivo"],
                "categoria": r["categoria"], "n_parole": int(r["n_parole"]),
                "n_incerte": int(r["n_incerte"]), "tipo_lingua_origine": r["tipo_lingua_origine"],
                "esempi": [],
            })
            codici.setdefault(r["lingua_origine_codice"], (r["lingua_origine_nome"], r["tipo_lingua_origine"]))
    chiavi = {(a["origine"], a["arrivo"], a["categoria"]) for a in archi}

    # Example words: sure words first, then the ones with the longest etymology text
    # (a rough sign of a common, well documented word), then a fixed hash; shown alphabetically.
    cand = {}
    with open(os.path.join(ris, "rete_parole.csv"), encoding="utf-8", newline="") as f:
        for r in csv.DictReader(f):
            k = (r["lingua_diretta_codice"], r["lingua_arrivo"], r["categoria_principale"])
            if k not in chiavi:
                continue
            w = r["parola"]
            if not BUONA_PAROLA.match(w) or w != w.lower():
                continue
            h = hashlib.md5(w.encode("utf-8")).hexdigest()
            voto = (1 if r["incerta"] == "sì" else 0, -len(r["testo_etimologia"]), h)
            lista = cand.setdefault(k, [])
            lista.append((voto, w))
            if len(lista) > 200:
                lista.sort()
                del lista[40:]
    for a in archi:
        lista = sorted(cand.get((a["origine"], a["arrivo"], a["categoria"]), []))
        scelte = []
        for _, w in lista:
            if w not in scelte:
                scelte.append(w)
            if len(scelte) == 12:
                break
        a["esempi"] = sorted(scelte)

    entrata, uscita = {}, {}
    for a in archi:
        if a["categoria"] in ("prestito", "calco", "latinismo_dotto"):
            entrata[a["arrivo"]] = entrata.get(a["arrivo"], 0) + 1
            uscita[a["origine"]] = uscita.get(a["origine"], 0) + 1

    lingue, arrivo = [], set()
    with open(os.path.join(ris, "rete_copertura.csv"), encoding="utf-8") as f:
        for r in csv.DictReader(f):
            c = r["lingua_arrivo"]
            arrivo.add(c)
            pct = float(r["percentuale_con_etimologia"])
            lingue.append({
                "codice": c, "nome_it": NOMI_IT.get(c, ""), "nome_en": r["lingua_nome"],
                "arrivo": True, "lemmi": int(r["lemmi"]),
                "lemmi_con_etimologia": int(r["lemmi_con_etimologia"]), "percentuale": pct,
                "parole_con_legami": int(r["parole_con_legami"]),
                "archi_entrata": entrata.get(c, 0), "archi_uscita": uscita.get(c, 0),
                "copertura": giudizio(pct), "tipo_lingua": "lingua",
            })
    altre = sorted({a["origine"] for a in archi} - arrivo)
    for c in altre:
        nome, tipo = codici.get(c, (c, "lingua"))
        lingue.append({"codice": c, "nome_en": nome or c, "nome_it": nomi_it.get(c, ""),
                       "arrivo": False, "tipo_lingua": tipo or "lingua"})

    scrivi(out, "lingue", lingue)
    scrivi(out, "archi", archi)
    with open(os.path.join(out, "fonte.json"), "w", encoding="utf-8") as f:
        json.dump({"tipo": "campione", "da": "rete_archi.csv, rete_copertura.csv, rete_parole.csv",
                   "scarico": "2026-10-18"}, f, ensure_ascii=False)
    with open(os.path.join(out, "fonte.js"), "w", encoding="utf-8") as f:
        f.write('window.LEXODUS=window.LEXODUS||{};window.LEXODUS["fonte"]={"tipo":"campione","scarico":"2026-10-18"};\n')
    print("lingue", len(lingue), "archi", len(archi), "con esempi", sum(1 for a in archi if a["esempi"]))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
