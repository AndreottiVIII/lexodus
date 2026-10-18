/* lexodus — shared code: data loading and normalisation, categories, Latin merging, filters. */
(function () {
  "use strict";
  // Version of the site, added to every file read with fetch() so browsers do not keep old copies.
  // Set together with the "?v=" in the pages by scripts/versione.py (also run by aggiorna_dati.py).
  var VERSION = "202610181712";
  function withVersion(path) { return path + (path.indexOf("?") < 0 ? "?" : "&") + "v=" + VERSION; }

  var CATS = [
    { id: "borrowed", key: "prestito", label: "borrowed" },
    { id: "learned", key: "latinismo_dotto", label: "learned Latin" },
    { id: "inherited", key: "ereditato", label: "inherited" },
    { id: "calque", key: "calco", label: "calque" },
    { id: "unspecified", key: "non_precisato", label: "unspecified" }
  ];
  var CAT_BY_KEY = {};
  CATS.forEach(function (c) { CAT_BY_KEY[c.key] = c; CAT_BY_KEY[c.id] = c; });

  var COVERAGE = { buona: "good", media: "fair", scarsa: "poor" };
  var TYPE_LABEL = {
    lingua: "language", protolingua: "proto-language", famiglia: "language family",
    "non lingua": "not a language", non_lingua: "not a language", sostrato: "substrate"
  };

  // Short cautions for some languages (from COSE_INTERESSANTI.md, sections 5-6).
  var NOTES = {
    ro: "Romanian editors almost always write “borrowed” and rarely “from”, so its borrowings look larger than elsewhere.",
    mt: "Only about 1 Maltese entry in 10 has an etymology: real numbers are probably much higher.",
    ar: "Only about 1 Arabic entry in 5 has an etymology.",
    en: "Wiktionary documents English best of all, especially recent loans.",
    mul: "“Translingual” is not a language: these are scientific names of plants and animals."
  };

  // Field names: rete-prestiti/risultati/export/README.md (copied to data/README_export.md).
  function language(o, target) {
    return {
      code: o.codice, name: o.nome_en || o.codice, nameIt: o.nome_it || "", target: target,
      type: o.tipo_lingua || "lingua",
      lemmas: target ? o.lemmi : null, withEty: target ? o.lemmi_con_etimologia : null,
      pct: target ? o.percentuale_con_etimologia : null,
      coverage: target ? COVERAGE[o.copertura] || null : null
    };
  }

  function getRaw(name) {
    var g = window.LEXODUS || {};
    if (g[name] !== undefined) return Promise.resolve(g[name]);
    return fetch(withVersion("data/" + name + ".json")).then(function (r) {
      if (!r.ok) throw new Error("data/" + name + ".json: " + r.status);
      return r.json();
    });
  }

  var cache = null;
  function load() {
    if (cache) return cache;
    cache = Promise.all([getRaw("lingue"), getRaw("archi"), getRaw("livello2"), getRaw("fonte").catch(function () { return {}; })])
      .then(function (res) {
        var langs = {};
        res[0].altre_lingue_origine.forEach(function (o) { langs[o.codice] = language(o, false); });
        res[0].lingue_di_arrivo.forEach(function (o) { langs[o.codice] = language(o, true); });
        if (!langs.la) langs.la = { code: "la", name: "Latin", nameIt: "latino", target: false, type: "lingua" };
        var arcs = [];
        res[1].archi.forEach(function (o) {
          var cat = CAT_BY_KEY[o.categoria];
          if (!cat || !(o.n_parole > 0)) return;
          arcs.push({ from: o.origine, to: o.arrivo, cat: cat.id, n: o.n_parole, unc: o.n_incerte || 0, ex: o.esempi || [] });
          if (!langs[o.origine]) langs[o.origine] = { code: o.origine, name: o.origine, nameIt: "", target: false, type: o.tipo_lingua_origine || "lingua" };
        });
        var targets = Object.keys(langs).map(function (k) { return langs[k]; })
          .filter(function (l) { return l.target; })
          .sort(function (a, b) { return a.name.localeCompare(b.name, "en"); });
        return {
          langs: langs, arcs: arcs, targets: targets, source: res[3] || {},
          level2: res[2].da_chi_ha_preso || {}, level2Totals: res[2].totali || {}
        };
      });
    return cache;
  }

  // Pair files (mandate 07): data/coppie/<arrivo>/<origine>.json or <origine>__<livello2>.json.
  // Codes: "." and other odd characters become "_"; merged Latin is "LATINO".
  // A few codes have another file name (coppie/_eccezioni_nomi.json, copied into coppie_elenco._eccezioni).
  function fileCode(code) {
    var g = window.LEXODUS || {}, ex = (g.coppie_elenco && g.coppie_elenco._eccezioni) || {};
    return ex[code] || String(code).replace(/[^A-Za-z0-9_-]/g, "_");
  }
  function pairCode(code, filters) { return (!filters || !filters.splitLatin) && isLatin(code) ? "LATINO" : fileCode(code); }
  function pairPath(to, from, via) { return "data/coppie/" + fileCode(to) + "/" + from + (via ? "__" + via : "") + ".json"; }
  // data/coppie_elenco: {arrivo: {origine: [livello2, ...]}}, built by scripts/aggiorna_dati.py.
  function hasPair(list, to, from, via) {
    var t = list && list[fileCode(to)], o = t && t[from];
    if (!o) return false;
    return !via || o.indexOf(via) >= 0;
  }
  // Grid files (mandate 09): coppie/<arrivo>/__via_<livello2>.json and __altre.json, listed in
  // coppie_elenco[arrivo]._via (the livello2 file codes) and coppie_elenco[arrivo]._altre.
  function hasGridFile(list, to, kind, code) {
    var t = list && list[fileCode(to)];
    if (!t || !t[kind]) return false;
    return kind === "_altre" || t[kind].indexOf(fileCode(code)) >= 0;
  }
  function gridPath(to, from, via) {
    return "data/coppie/" + fileCode(to) + "/" + (from === "other" ? "__altre" : "__via_" + fileCode(via)) + ".json";
  }
  function viaUrl(to, via, cat) {
    return "words.html?to=" + encodeURIComponent(to) + "&via=" + encodeURIComponent(via) + (cat ? "&cat=" + encodeURIComponent(cat) : "");
  }
  function wordsUrl(to, from, via, cat) {
    return "words.html?to=" + encodeURIComponent(to) + "&from=" + encodeURIComponent(from) +
      (via ? "&via=" + encodeURIComponent(via) : "") + (cat ? "&cat=" + encodeURIComponent(cat) : "");
  }
  function wordUrl(lang, w, n, from) {
    return "word.html?lang=" + encodeURIComponent(lang) + "&w=" + encodeURIComponent(w) + "&n=" + encodeURIComponent(n || 1) +
      (from ? "&from=" + encodeURIComponent(from) : "");
  }
  var jsonCache = {};
  function fetchJson(path) {
    if (!jsonCache[path]) {
      jsonCache[path] = fetch(withVersion(path)).then(function (r) {
        if (!r.ok) throw new Error(path + ": " + r.status);
        return r.json();
      });
    }
    return jsonCache[path];
  }
  // Names only (words and word pages do not need the arcs): {code: English name}.
  function names() {
    return getRaw("lingue").then(function (raw) {
      var m = { LATINO: "Latin", altre: "other languages" };
      raw.altre_lingue_origine.concat(raw.lingue_di_arrivo).forEach(function (o) { if (!m[o.codice]) m[o.codice] = o.nome_en || o.codice; });
      m._targets = raw.lingue_di_arrivo.map(function (o) { return o.codice; });
      return m;
    });
  }
  function catLabel(key) {
    var c = CAT_BY_KEY[key];
    if (c) return c.label;
    if (key === "stadio_stessa_lingua") return "earlier stage";
    return String(key || "").replace(/_/g, " ");
  }
  function fold(s) { return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
  // Normalised form as in the search index (data/README_export.md, "Normalizzazione"): lower case, NFD, without
  // combining marks, special letters replaced (tabella_lettere of indice/_meta.json, copied here), no apostrophes.
  var LETTER_TABLE = {"\u0111": "d", "\u00f0": "d", "\u0142": "l", "\u00f8": "o", "\u00e6": "ae", "\u0153": "oe", "\u00df": "ss", "\u00fe": "th", "\u0127": "h", "\u0131": "i", "\u014b": "n", "\u0138": "k", "\u0259": "e", "\u025b": "e", "\u0254": "o", "\u0283": "sh", "\u0292": "zh", "'": "", "\u2019": "", "\u2018": "", "\u02bb": "", "\u02bc": "", "\u02be": "", "\u02bf": "", "\u02b9": "", "\u02ba": "", "`": ""};
  function setLetterTable(t) { if (t) LETTER_TABLE = t; }
  function norm(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/\p{Mn}/gu, "")
      .replace(/./gu, function (c) { return LETTER_TABLE[c] !== undefined ? LETTER_TABLE[c] : c; });
  }
  // squash() also drops spaces, hyphens and other non-letters, so "caffe latte" and "caffelatte" meet.
  function squash(s) { return norm(s).replace(/[^\p{L}\p{N}]/gu, ""); }

  // Transliteration next to a word in a non-Latin script: "qahwa" in brackets. Nothing when missing.
  function tr(t, word) {
    if (!t || t === word) return "";
    return ' <span class="tr">(' + esc(t) + ")</span>";
  }

  // Search index and trees (mandate 09, data/README_export.md): files are named after the "letter" of the
  // normalised word n = first character of n if a-z, otherwise "_". n uses the transliteration when the word
  // is not in Latin letters and has one. "_" is split into one file per language (indice/_ar.json, _ru.json…);
  // a letter over 5 MB would be split by "prefisso" (none on 18/10/2026, handled anyway).
  function letterOf(n) { var c = String(n || "").charAt(0); return /[a-z]/.test(c) ? c : "_"; }
  function isLatinScript(s) {
    var letters = String(s || "").match(/\p{L}/gu) || [];
    return letters.every(function (c) { return /\p{Script=Latin}/u.test(c); });
  }
  // The tree file letter of a word: from its transliteration when it is not in Latin letters.
  function treeLetter(w, t) { return letterOf(norm(!isLatinScript(w) && t ? t : w)); }
  // f: the tree letter when known (field "f" of the index rows in the original script), else from w and t.
  function treeUrl(lang, w, n, t, f) {
    f = f || treeLetter(w, t);
    return "tree.html?lang=" + encodeURIComponent(lang) + "&w=" + encodeURIComponent(w) + "&n=" + encodeURIComponent(n || 1) +
      (f !== letterOf(norm(w)) ? "&f=" + encodeURIComponent(f) : "");
  }
  // indice/_meta.json: "lettere" {letter: [paths]} and "file" [{file, lettera, prefisso, lingua}].
  function indexFiles(n, meta) {
    var L0 = letterOf(n), list = (meta.lettere && meta.lettere[L0]) || [];
    if (L0 === "_" || list.length < 2) return list;
    var byFile = {};
    (meta.file || []).forEach(function (x) { byFile[x.file] = x; });
    var hit = list.filter(function (p) {
      var pre = byFile[p] && byFile[p].prefisso;
      if (!pre) return false;
      var key = n.slice(0, pre.length).replace(/[^a-z]/g, "_");
      while (key.length < pre.length) key += "_";
      return key === pre;
    });
    return hit.length ? hit : list;
  }
  // The "_" file of one language.
  function indexFileOfLang(meta, lang) {
    var x = (meta.file || []).filter(function (o) { return o.lettera === "_" && o.lingua === lang; })[0];
    return x ? x.file : null;
  }
  function indexRows(d) { return Array.isArray(d) ? d : (d && (d.righe || d.parole)) || []; }
  function wiktUrl(word, langName) {
    return "https://en.wiktionary.org/wiki/" + encodeURIComponent(String(word).replace(/ /g, "_")) + "#" + encodeURIComponent(String(langName).replace(/ /g, "_"));
  }
  function fetchFail(e) {
    return location.protocol === "file:"
      ? "Lists of words need the site to be opened from a web server (for example GitHub Pages), not from a local file."
      : "This list is not in the data (" + e.message + ").";
  }
  function extra(name) { return getRaw(name).catch(function () { return null; }); }

  function isLanguage(type) { return !type || type === "lingua"; }

  // Latin varieties are merged into one "Latin" (code "la") unless the viewer splits them.
  var OLD_LATIN_CODES = ["L.", "LL.", "VL.", "ML.", "NL.", "EL.", "itc-ola"];
  function isLatin(code) { return code === "la" || /^la-/.test(code) || OLD_LATIN_CODES.indexOf(code) >= 0; }
  function key(code, filters) { return filters && !filters.splitLatin && isLatin(code) ? "la" : code; }
  function latinVarieties(langs) {
    return Object.keys(langs).filter(function (c) { return c !== "la" && isLatin(c); })
      .map(function (c) { return langs[c].name; }).sort();
  }

  var fmt = new Intl.NumberFormat("en-GB");
  function n(v) { return fmt.format(v); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }
  function param(name) { return new URLSearchParams(location.search).get(name); }

  function coverageText(l) {
    if (!l.coverage && l.pct === null) return "";
    var t = "coverage: " + (l.coverage || "unknown");
    if (l.pct !== null) t += ", " + Math.round(l.pct) + "% of entries have an etymology";
    return t;
  }

  // Filters, remembered in the browser while moving between pages.
  // Defaults chosen by Davide (18/10/2026): borrowed, learned Latin and calque on; Latin merged.
  var STORE = "lexodus.filters.v2";
  function readFilters() {
    var f = { cats: ["borrowed", "learned", "calque"], hideOther: true, splitLatin: false };
    try {
      var s = JSON.parse(localStorage.getItem(STORE) || "null");
      if (s && Array.isArray(s.cats)) f.cats = s.cats.filter(function (c) { return CAT_BY_KEY[c]; });
      if (s && typeof s.hideOther === "boolean") f.hideOther = s.hideOther;
      if (s && typeof s.splitLatin === "boolean") f.splitLatin = s.splitLatin;
    } catch (e) { /* storage blocked: keep defaults */ }
    return f;
  }
  function saveFilters(f) { try { localStorage.setItem(STORE, JSON.stringify(f)); } catch (e) { /* ignore */ } }

  function filterBar(el, onChange) {
    var f = readFilters();
    var html = '<fieldset><legend>Show</legend>';
    CATS.forEach(function (c) {
      html += '<label><input type="checkbox" id="cat-' + c.id + '" data-cat="' + c.id + '"' + (f.cats.indexOf(c.id) >= 0 ? " checked" : "") + "> " + c.label + "</label>";
    });
    html += '</fieldset><fieldset><legend>Options</legend>' +
      '<label><input type="checkbox" id="split-latin"' + (f.splitLatin ? " checked" : "") + "> split Latin varieties</label>" +
      '<label><input type="checkbox" id="hide-other"' + (f.hideOther ? " checked" : "") + "> hide families, proto-languages and non-languages</label></fieldset>";
    el.innerHTML = html;
    el.addEventListener("change", function (e) {
      var t = e.target;
      if (t.dataset.cat) {
        f.cats = Array.prototype.map.call(el.querySelectorAll("input[data-cat]:checked"), function (x) { return x.dataset.cat; });
      } else if (t.id === "split-latin") f.splitLatin = t.checked;
      else if (t.id === "hide-other") f.hideOther = t.checked;
      saveFilters(f); onChange(f);
    });
    return f;
  }

  function footer(source) {
    var el = document.getElementById("site-footer");
    if (!el) return;
    el.innerHTML = 'Data: English Wiktionary, extracted by <a href="https://kaikki.org/">Wiktextract / kaikki.org</a>, downloaded 18 October 2026, ' +
      'licence <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.' +
 ' <a href="about.html">How it was made</a>.';
  }

  window.Lex = {
    CATS: CATS, CAT_BY_KEY: CAT_BY_KEY, TYPE_LABEL: TYPE_LABEL, NOTES: NOTES,
    load: load, isLanguage: isLanguage, isLatin: isLatin, key: key, latinVarieties: latinVarieties,
    fileCode: fileCode, pairCode: pairCode, pairPath: pairPath, hasPair: hasPair, wordsUrl: wordsUrl, wordUrl: wordUrl,
    hasGridFile: hasGridFile, gridPath: gridPath, viaUrl: viaUrl,
    fetchJson: fetchJson, extra: extra, getRaw: getRaw, names: names, catLabel: catLabel, fold: fold, wiktUrl: wiktUrl, fetchFail: fetchFail,
    n: n, esc: esc, param: param, coverageText: coverageText, filterBar: filterBar, footer: footer,
    norm: norm, squash: squash, setLetterTable: setLetterTable, tr: tr, letterOf: letterOf, isLatinScript: isLatinScript, treeLetter: treeLetter,
    treeUrl: treeUrl, indexFiles: indexFiles, indexFileOfLang: indexFileOfLang, indexRows: indexRows
  };
})();
