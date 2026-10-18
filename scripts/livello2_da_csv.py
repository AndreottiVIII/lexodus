"""Second level of the chains, from rete-prestiti/risultati/rete_relazioni.csv (read only).

    python -I -X utf8 scripts/livello2_da_csv.py ../rete-prestiti/risultati data

For every word of the 33 languages, the "direct" language is the row with tipo_legame = diretta;
the "next step" is the first later row with tipo_legame = tappa whose language is different
(rows tipo_legame = stadio, steps inside the same language, are skipped).
Alternatives (tipo_legame = alternativa) are ignored.

Output (key "arrivo|diretta", e.g. "it|ota" = Italian words taken directly from Ottoman Turkish):
  data/livello2.json               {key: [{codice, nome, tipo_lingua, categoria, n, esempi}, ...]}
                                   categoria = category of the direct link (borrowed, ...), so the
                                   site can show the next step of the words of one row only.
  data/livello2_latino_unito.json  same, with all Latin varieties merged into "la" (both as direct
                                   language and as next step; Latin -> Latin steps are skipped).
  and the .js twins for opening the site from a local file.
"""
import csv
import hashlib
import json
import os
import re
import sys

csv.field_size_limit(10**9)
OLD_LATIN = {"L.", "LL.", "VL.", "ML.", "NL.", "EL.", "itc-ola"}
BUONA = re.compile(r"^[^\W\d_]{3,10}$")


def latino(c):
    return c == "la" or c.startswith("la-") or c in OLD_LATIN


def scrivi(cartella, nome, dati):
    testo = json.dumps(dati, ensure_ascii=False, separators=(",", ":"))
    with open(os.path.join(cartella, nome + ".json"), "w", encoding="utf-8") as f:
        f.write(testo)
    with open(os.path.join(cartella, nome + ".js"), "w", encoding="utf-8") as f:
        f.write("window.LEXODUS=window.LEXODUS||{};window.LEXODUS[%s]=%s;\n" % (json.dumps(nome), testo))
    return len(testo)


def main(ris, out):
    arrivo_ok = set()
    with open(os.path.join(ris, "rete_copertura.csv"), encoding="utf-8") as f:
        for r in csv.DictReader(f):
            arrivo_ok.add(r["lingua_arrivo"])
    # words already chosen as examples for the direct arcs: a hint of "recognisable"
    noti = set()
    try:
        with open(os.path.join(out, "archi.json"), encoding="utf-8") as f:
            for a in json.load(f):
                for w in a.get("esempi", []):
                    noti.add((a["arrivo"], w))
    except OSError:
        pass

    nomi, tipi = {}, {}
    agg = {False: {}, True: {}}  # merged Latin? -> {(key, next, cat): [n, candidates]}

    def conta(unito, arr, diretta, cat, nxt, parola, incerta):
        d = latino(diretta) and unito and "la" or diretta
        k = (arr + "|" + d, nxt, cat)
        e = agg[unito].setdefault(k, [0, []])
        e[0] += 1
        if BUONA.match(parola) and parola == parola.lower():
            # shortest first (Davide, 18/10/2026); ties: already an arc example, sure, fixed hash
            voto = (len(parola), 0 if (arr, parola) in noti else 1, 1 if incerta else 0,
                    hashlib.md5(parola.encode("utf-8")).hexdigest())
            e[1].append((voto, parola))
            if len(e[1]) > 60:
                e[1].sort()
                del e[1][15:]

    def chiudi(righe):
        if not righe:
            return
        dirette = [r for r in righe if r["tipo_legame"] == "diretta"]
        if len(dirette) != 1:
            return
        dr = dirette[0]
        arr = dr["lingua_arrivo"]
        if arr not in arrivo_ok or dr["categoria"] == "stadio_stessa_lingua":
            return
        dc = dr["lingua_codice"]
        liv = int(dr["livello"])
        dopo = sorted((r for r in righe if r["tipo_legame"] == "tappa" and int(r["livello"]) > liv),
                      key=lambda r: int(r["livello"]))
        incerta = dr["incerta"] == "sì"
        for unito in (False, True):
            base = "la" if unito and latino(dc) else dc
            nxt = None
            for r in dopo:
                c = r["lingua_codice"]
                ck = "la" if unito and latino(c) else c
                if ck != base:
                    nxt = ck
                    break
            if nxt is None:
                continue  # no earlier step recorded: the site shows the remainder
            conta(unito, arr, dc, dr["categoria"], nxt, dr["parola"], incerta)

    with open(os.path.join(ris, "rete_relazioni.csv"), encoding="utf-8", newline="") as f:
        corrente, righe = None, []
        for r in csv.DictReader(f):
            c = r["lingua_codice"]
            if c and c not in nomi:
                nomi[c] = r["lingua_nome"]
                tipi[c] = r["tipo_lingua"]
            k = (r["lingua_arrivo"], r["parola"], r["n_etimologia"])
            if k != corrente:
                chiudi(righe)
                corrente, righe = k, []
            righe.append(r)
        chiudi(righe)

    nomi["la"] = "Latin"
    tipi["la"] = "lingua"
    for unito, nome in ((False, "livello2"), (True, "livello2_latino_unito")):
        res = {}
        for (key, nxt, cat), (n, cand) in agg[unito].items():
            cand.sort()
            es = []
            for _, w in cand:
                if w not in es:
                    es.append(w)
                if len(es) == 5:
                    break
            res.setdefault(key, []).append({"codice": nxt, "nome": nomi.get(nxt, nxt),
                                            "tipo_lingua": tipi.get(nxt, "lingua"),
                                            "categoria": cat, "n": n, "esempi": sorted(es)})
        for key in res:
            res[key].sort(key=lambda x: (-x["n"], x["codice"]))
        size = scrivi(out, nome, res)
        print(nome, len(res), "keys", size // 1024, "KB")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
