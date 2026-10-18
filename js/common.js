/* lexodus — shared code: data loading and normalisation, categories, Latin merging, filters. */
(function () {
  "use strict";

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
    return fetch("data/" + name + ".json").then(function (r) {
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
      jsonCache[path] = fetch(path).then(function (r) {
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
    fetchJson: fetchJson, extra: extra, getRaw: getRaw, names: names, catLabel: catLabel, fold: fold, wiktUrl: wiktUrl, fetchFail: fetchFail,
    n: n, esc: esc, param: param, coverageText: coverageText, filterBar: filterBar, footer: footer
  };
})();
