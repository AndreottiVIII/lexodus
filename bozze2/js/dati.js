/* lexodus, divergent drafts (bozze2/, mandate 16): shared data code for the six drafts.
   A trimmed copy of js/common.js plus the data parts of js/language.js, js/word.js and js/tree.js: it only reads
   data and hands plain objects to each draft, which draws them its own way. Data are the real ones, read from
   ../../data/. Fixed settings (the defaults of the real site): borrowed + learned Latin + calque, Latin varieties
   merged, families / proto-languages / non-languages hidden. */
(function () {
  "use strict";
  var ROOT = "../../";
  var VERSION = "202610291437";
  function withVersion(p) { return ROOT + p + (p.indexOf("?") < 0 ? "?" : "&") + "v=" + VERSION; }
  var CATS = { prestito: "borrowed", latinismo_dotto: "learned Latin", ereditato: "inherited", calco: "calque", non_precisato: "unspecified" };
  var LOAN = ["prestito", "latinismo_dotto", "calco"];

  // ---- families (used for colours, lines, groups) ----
  var FAMILIES = [
    { id: "romance", name: "Romance", short: "Rom" },
    { id: "germanic", name: "Germanic", short: "Ger" },
    { id: "slavic", name: "Slavic", short: "Sla" },
    { id: "baltic", name: "Baltic", short: "Bal" },
    { id: "uralic", name: "Finno-Ugric", short: "Ura" },
    { id: "semitic", name: "Semitic", short: "Sem" },
    { id: "turkic", name: "Turkic", short: "Tur" },
    { id: "other", name: "Greek, Albanian, Iranian", short: "Oth" },
    { id: "world", name: "Rest of the world", short: "Wld" }
  ];
  var FAM_BY_ID = {};
  FAMILIES.forEach(function (f) { FAM_BY_ID[f.id] = f; });
  var EXPLICIT = {
    romance: "it fr es pt ca ro la fro frm pro vec scn nap lmo osp roa gl oc an ast rm fur lld sc co lij pms egl rgn dlm wa pcd nrf frp xno ofr ruo rup ist mxi lad LATINO",
    germanic: "lng en enm ang de gmh goh nl dum odt sv da nb nn no is fo non gml nds yi fy ofs frk got sco lb gsw bar af osx sxu vls pdc",
    slavic: "pl cs sk ru uk be bg mk sh sl cu orv hsb dsb csb szl rue sr hr bs",
    baltic: "lt lv olt prg sgs ltg",
    uralic: "hu fi et fit krl vep vot liv se sme smn kv mhr mdf myv ohu sma izh fkv",
    semitic: "mt ar he arc syc akk hbo ajp apc arz aeb ary acm phn gez am sqr xaa",
    turkic: "tr ota az tt ba kk ky uz chg otk crh cv tk ug sah kum krc nog qwm",
    other: "el grc gkm gmy sq aln als fa pal peo ae ku ps os xpr ckb kmr xmn sog"
  };
  var PREFIX = [["la-", "romance"], ["roa-", "romance"], ["itc-", "romance"], ["gem-", "germanic"], ["gmw-", "germanic"],
    ["gmq-", "germanic"], ["sla-", "slavic"], ["zle-", "slavic"], ["zlw-", "slavic"], ["zls-", "slavic"], ["bat-", "baltic"],
    ["urj-", "uralic"], ["fiu-", "uralic"], ["sem-", "semitic"], ["trk-", "turkic"], ["ira-", "other"], ["grk-", "other"],
    ["sqj-", "other"], ["xme-", "other"], ["ar-", "semitic"], ["he-", "semitic"], ["el-", "other"], ["fa-", "other"]];
  var FAM_OF = {};
  Object.keys(EXPLICIT).forEach(function (f) { EXPLICIT[f].split(" ").forEach(function (c) { FAM_OF[c] = f; }); });
  ["L.", "LL.", "VL.", "ML.", "NL.", "EL."].forEach(function (c) { FAM_OF[c] = "romance"; });
  function family(code) {
    if (FAM_OF[code]) return FAM_OF[code];
    for (var i = 0; i < PREFIX.length; i++) if (String(code).indexOf(PREFIX[i][0]) === 0) return PREFIX[i][1];
    return "world";
  }

  // ---- helpers ----
  var fmt = new Intl.NumberFormat("en-GB");
  function n(v) { return fmt.format(v); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }
  function param(k) { return new URLSearchParams(location.search).get(k); }
  var OLD_LATIN = ["L.", "LL.", "VL.", "ML.", "NL.", "EL.", "itc-ola"];
  function isLatin(c) { return c === "la" || c === "LATINO" || /^la-/.test(c) || OLD_LATIN.indexOf(c) >= 0; }
  function merged(c) { return isLatin(c) ? "la" : c; }
  // a chemical-style symbol: the 33 languages in capitals (IT), the others capitalised (Ota, Grc, La)
  function sym(code, targets) {
    code = merged(code);
    if (targets && targets.indexOf(code) >= 0) return code.toUpperCase();
    var c = String(code).split("-")[0];
    return c.charAt(0).toUpperCase() + c.slice(1);
  }
  var jsonCache = {};
  function fetchJson(path) {
    if (!jsonCache[path]) jsonCache[path] = fetch(withVersion(path)).then(function (r) {
      if (!r.ok) throw new Error(path + ": " + r.status);
      return r.json();
    });
    return jsonCache[path];
  }
  function getRaw(name) {
    var g = window.LEXODUS || {};
    if (g[name] !== undefined) return Promise.resolve(g[name]);
    return fetchJson("data/" + name + ".json");
  }
  function fileCode(code) {
    var g = window.LEXODUS || {}, ex = (g.coppie_elenco && g.coppie_elenco._eccezioni) || {};
    return ex[code] || String(code).replace(/[^A-Za-z0-9_-]/g, "_");
  }

  // ---- languages ----
  var langsP = null;
  function langs() {
    if (langsP) return langsP;
    langsP = getRaw("lingue").then(function (raw) {
      var by = {}, targets = [];
      raw.altre_lingue_origine.forEach(function (o) {
        by[o.codice] = { code: o.codice, name: o.nome_en || o.codice, type: o.tipo_lingua || "lingua", target: false, fam: family(o.codice) };
      });
      raw.lingue_di_arrivo.forEach(function (o) {
        by[o.codice] = {
          code: o.codice, name: o.nome_en, type: "lingua", target: true, fam: family(o.codice),
          lemmas: o.lemmi, withEty: o.lemmi_con_etimologia, pct: o.percentuale_con_etimologia, linked: o.parole_con_legami,
          took: o.parole_prese_in_prestito, gave: o.parole_date_in_prestito, arcsIn: o.archi_in_entrata, arcsOut: o.archi_in_uscita,
          coverage: { buona: "good", media: "fair", scarsa: "poor" }[o.copertura] || ""
        };
        targets.push(o.codice);
      });
      by.la = by.la || { code: "la", name: "Latin", type: "lingua", target: false, fam: "romance" };
      by.la.name = "Latin";
      by.LATINO = by.la;
      return { by: by, targets: targets, list: targets.map(function (c) { return by[c]; }) };
    });
    return langsP;
  }
  function nameOf(L, code) { var l = L.by[merged(code)] || L.by[code]; return l ? l.name : code; }

  // ---- the language page: one row per language on the other side (all loan categories together) ----
  function side(L, arcs, code, s) {
    var by = {};
    arcs.forEach(function (a) {
      if (LOAN.indexOf(a.categoria) < 0 || !(a.n_parole > 0)) return;
      var mine = s === "from" ? a.arrivo : a.origine, other = s === "from" ? a.origine : a.arrivo;
      if (merged(mine) !== code) return;
      other = merged(other);
      if (other === code) return;
      var l = L.by[other];
      var type = l ? l.type : a.tipo_lingua_origine;
      if (type && type !== "lingua") return;
      var r = by[other] || (by[other] = { code: other, name: nameOf(L, other), fam: family(other), target: !!(l && l.target), n: 0, cats: {}, ex: [] });
      r.n += a.n_parole;
      r.cats[a.categoria] = (r.cats[a.categoria] || 0) + a.n_parole;
      (a.esempi || []).forEach(function (w) { if (r.ex.indexOf(w) < 0) r.ex.push(w); });
    });
    return Object.keys(by).map(function (k) {
      var r = by[k];
      r.ex = r.ex.slice().sort(function (a, b) { return a.length - b.length || a.localeCompare(b); }).slice(0, 6)
        .sort(function (a, b) { return a.localeCompare(b); });
      return r;
    }).sort(function (a, b) { return b.n - a.n || a.name.localeCompare(b.name); });
  }
  function language(code) {
    return Promise.all([langs(), getRaw("archi")]).then(function (res) {
      var L = res[0], arcs = res[1].archi, l = L.by[code];
      if (!l) throw new Error("There is no language with the code " + code + " in the data.");
      var from = l.target ? side(L, arcs, code, "from") : [], to = side(L, arcs, code, "to");
      function sum(list) { return list.reduce(function (s, r) { return s + r.n; }, 0); }
      return { L: L, lang: l, from: from, to: to, fromTotal: sum(from), toTotal: sum(to) };
    });
  }
  function extra(code) { return fetchJson("data/lingua_extra/" + fileCode(code) + ".json").catch(function () { return null; }); }

  // ---- words and trees ----
  var LETTERS = { "đ": "d", "ð": "d", "ł": "l", "ø": "o", "æ": "ae", "œ": "oe", "ß": "ss", "þ": "th", "ħ": "h", "ı": "i", "ŋ": "n", "ĸ": "k", "ə": "e", "ɛ": "e", "ɔ": "o", "ʃ": "sh", "ʒ": "zh", "'": "", "’": "", "‘": "", "ʻ": "", "ʼ": "", "ʾ": "", "ʿ": "", "ʹ": "", "ʺ": "", "`": "" };
  function norm(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/\p{Mn}/gu, "")
      .replace(/./gu, function (c) { return LETTERS[c] !== undefined ? LETTERS[c] : c; });
  }
  function letterOf(x) { var c = String(x || "").charAt(0); return /[a-z]/.test(c) ? c : "_"; }
  function isLatinScript(s) {
    var letters = String(s || "").match(/\p{L}/gu) || [];
    return letters.every(function (c) { return /\p{Script=Latin}/u.test(c); });
  }
  function treeLetter(lang, w, t) {
    if (t && !isLatinScript(w)) return Promise.resolve(letterOf(norm(t)));
    var own = letterOf(norm(w));
    if (own !== "_" || isLatinScript(w)) return Promise.resolve(own);
    return fetchJson("data/indice/_meta.json").then(function (m) {
      var x = (m.file || []).filter(function (o) { return o.lettera === "_" && o.lingua === lang; })[0];
      return x ? fetchJson("data/" + x.file) : [];
    }).then(function (d) {
      var rows = Array.isArray(d) ? d : (d && (d.righe || d.parole)) || [];
      var r = rows.filter(function (x) { return x.l === lang && x.p === w; })[0];
      return (r && r.f) || (r && r.t ? letterOf(norm(r.t)) : own);
    }).catch(function () { return own; });
  }
  function keyWord(k) { return k.slice(0, k.lastIndexOf("|")); }
  function keyN(k) { return +k.slice(k.lastIndexOf("|") + 1) || 1; }
  // tree(lang, w, n): {key, n, e (the entry: su, giu, significato...)} or null
  function tree(lang, w, ne, t) {
    return treeLetter(lang, w, t).then(function (x) {
      return fetchJson("data/alberi/" + fileCode(lang) + "/" + encodeURIComponent(x) + ".json").catch(function () { return null; });
    }).then(function (d) {
      if (!d) return null;
      var k = d[w + "|" + (ne || 1)] ? w + "|" + (ne || 1) : Object.keys(d).filter(function (k) { return keyWord(k) === w; })[0];
      return k ? { key: k, n: keyN(k), e: d[k], file: d } : null;
    });
  }
  function findIn(d, w, ne) {
    var list = (d && d.parole) || [];
    for (var i = 0; i < list.length; i++) if (list[i].parola === w && (!ne || +list[i].n_etimologia === ne)) return list[i];
    return null;
  }
  function pairFile(lang, code) {
    return fetchJson("data/coppie/" + fileCode(lang) + "/" + code + ".json").catch(function () { return null; });
  }
  // word(lang, w, n, from): {L, p (the entry of the pair file), text, tree ({key, n, e}) or null}
  function word(lang, w, ne, from) {
    var L0;
    return langs().then(function (L) {
      L0 = L;
      return tree(lang, w, ne);
    }).then(function (t) {
      if (t) ne = t.n;
      var tries = [];
      if (from) tries.push(fileCode(from));
      if (t && t.e.su && t.e.su.length) tries.push(fileCode(t.e.su[0].codice));
      tries.push("_alternative");
      function next(i) {
        if (i >= tries.length) return Promise.resolve(null);
        return pairFile(lang, tries[i]).then(function (d) {
          var p = findIn(d, w, ne);
          return p ? { p: p, file: tries[i], pair: d } : next(i + 1);
        });
      }
      return next(0).then(function (found) {
        if (!found) return { L: L0, p: null, tree: t };
        var p = found.p, cat = p.catena || [];
        var text = p.testo !== undefined || !cat.length ? Promise.resolve(p.testo || "")
          : pairFile(lang, fileCode(cat[0].codice)).then(function (d) { var q = findIn(d, w, ne); return (q && q.testo) || ""; });
        return text.then(function (tx) { return { L: L0, p: p, text: tx, tree: t, file: found.file }; });
      });
    });
  }
  // The way of a word, from the furthest origin down to the word itself:
  // [{code, name, term, tr, fam, how}] where "how" is the way the word passed on to the next stop.
  function journey(L, lang, p) {
    var su = (p.catena || p.su || []).slice();
    var stops = [];
    for (var i = su.length - 1; i >= 0; i--) {
      stops.push({ code: su[i].codice, name: nameOf(L, su[i].codice), term: su[i].termine || "", tr: su[i].traslitterazione || "",
        fam: family(su[i].codice), how: CATS[su[i].categoria] || "" });
    }
    stops.push({ code: lang, name: nameOf(L, lang), term: p.parola, tr: p.traslitterazione || "", fam: family(lang), how: "", here: true });
    return stops;
  }
  function count(list) { return (list || []).reduce(function (s, g) { return s + 1 + count(g.giu); }, 0); }

  // ---- links inside a draft ----
  function langUrl(code) { return "language.html?code=" + encodeURIComponent(merged(code)); }
  function wordUrl(lang, w, ne, from) {
    return "word.html?lang=" + encodeURIComponent(lang) + "&w=" + encodeURIComponent(w) + "&n=" + encodeURIComponent(ne || 1) +
      (from ? "&from=" + encodeURIComponent(isLatin(from) ? "LATINO" : fileCode(from)) : "");
  }
  function treeUrl(lang, w, ne) {
    return "tree.html?lang=" + encodeURIComponent(lang) + "&w=" + encodeURIComponent(w) + "&n=" + encodeURIComponent(ne || 1);
  }
  function wiktUrl(w, langName) {
    return "https://en.wiktionary.org/wiki/" + encodeURIComponent(String(w).replace(/ /g, "_")) + "#" + encodeURIComponent(String(langName).replace(/ /g, "_"));
  }
  function trSpan(t, w, cls) { return t && t !== w ? ' <span class="' + (cls || "tr") + '">(' + esc(t) + ")</span>" : ""; }

  window.B = {
    ROOT: ROOT, CATS: CATS, FAMILIES: FAMILIES, FAM_BY_ID: FAM_BY_ID, family: family, n: n, esc: esc, param: param,
    isLatin: isLatin, merged: merged, sym: sym, fetchJson: fetchJson, fileCode: fileCode, langs: langs, nameOf: nameOf,
    language: language, extra: extra, tree: tree, word: word, journey: journey, count: count,
    langUrl: langUrl, wordUrl: wordUrl, treeUrl: treeUrl, wiktUrl: wiktUrl, trSpan: trSpan, isLatinScript: isLatinScript
  };
})();
