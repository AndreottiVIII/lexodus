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
  // Other spellings the export might use.
  Object.assign(CAT_BY_KEY, {
    borrowing: CAT_BY_KEY.prestito, loan: CAT_BY_KEY.prestito, bor: CAT_BY_KEY.prestito,
    learned_latin: CAT_BY_KEY.latinismo_dotto, latinismo: CAT_BY_KEY.latinismo_dotto,
    inh: CAT_BY_KEY.ereditato, cal: CAT_BY_KEY.calco, non_specificato: CAT_BY_KEY.non_precisato,
    der: CAT_BY_KEY.non_precisato, derived: CAT_BY_KEY.non_precisato
  });
  function catOf(v) { return CAT_BY_KEY[String(v || "").toLowerCase()] || null; }

  var COVERAGE_ALIAS = { buona: "good", media: "fair", scarsa: "poor", good: "good", fair: "fair", medium: "fair", poor: "poor" };
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

  function pick(o, keys) {
    for (var i = 0; i < keys.length; i++) {
      var v = o[keys[i]];
      if (v !== undefined && v !== null && v !== "") return v;
    }
    return undefined;
  }
  function num(v) { var n = Number(v); return isFinite(n) ? n : 0; }
  function numOrNull(v) { return v === undefined ? null : num(v); }
  function asList(raw) {
    if (Array.isArray(raw)) return raw;
    var out = [];
    if (raw && typeof raw === "object") Object.keys(raw).forEach(function (k) { if (Array.isArray(raw[k])) out = out.concat(raw[k]); });
    return out;
  }
  function exList(v) {
    if (!v) return [];
    if (typeof v === "string") return v.split(/[|;,]\s*/).filter(Boolean);
    return v.slice();
  }

  function normLanguage(o) {
    var code = pick(o, ["codice", "code", "lingua", "lang", "id"]);
    if (!code) return null;
    var lemmas = pick(o, ["lemmi", "lemmas", "n_lemmi"]);
    var pct = numOrNull(pick(o, ["percentuale", "percentuale_con_etimologia", "pct", "percent"]));
    var cov = pick(o, ["copertura", "giudizio", "giudizio_copertura", "coverage"]);
    if (!cov && pct !== null) cov = pct >= 70 ? "good" : pct >= 30 ? "fair" : "poor";
    var target = pick(o, ["arrivo", "di_arrivo", "lingua_arrivo", "target", "is_target"]);
    if (target === undefined) target = lemmas !== undefined;
    if (target === "sì" || target === "si" || target === "true") target = true;
    if (target === "no" || target === "false") target = false;
    return {
      code: String(code),
      name: String(pick(o, ["nome_en", "nome_inglese", "name_en", "nome_eng", "name", "nome"]) || code),
      nameIt: pick(o, ["nome_it", "nome_italiano", "name_it"]) || "",
      target: !!target,
      type: pick(o, ["tipo_lingua", "tipo", "type"]) || "lingua",
      lemmas: numOrNull(lemmas),
      withEty: numOrNull(pick(o, ["lemmi_con_etimologia", "con_etimologia", "lemmas_with_etymology"])),
      pct: pct,
      coverage: COVERAGE_ALIAS[String(cov || "").toLowerCase()] || null
    };
  }

  function normArc(o) {
    var from = pick(o, ["origine", "lingua_origine", "origine_codice", "lingua_origine_codice", "da", "from", "source"]);
    var to = pick(o, ["arrivo", "lingua_arrivo", "arrivo_codice", "lingua_arrivo_codice", "a", "to", "target"]);
    var cat = catOf(pick(o, ["categoria", "category", "cat"]));
    if (!from || !to || !cat) return null;
    return {
      from: String(from), to: String(to), cat: cat.id,
      n: num(pick(o, ["n_parole", "parole_n", "n", "count", "words"])),
      unc: num(pick(o, ["n_incerte", "incerte", "uncertain"])),
      type: pick(o, ["tipo_lingua_origine", "tipo_origine", "source_type"]) || null,
      ex: exList(pick(o, ["esempi", "parole_esempio", "esempio", "parole", "examples"]))
    };
  }

  // Second level: {"arrivo|diretta": [{codice, n, esempi, categoria?, nome?, tipo_lingua?}]}
  function normLevel2(raw) {
    if (!raw || typeof raw !== "object") return null;
    var out = {};
    Object.keys(raw).forEach(function (k) {
      out[k] = asList(raw[k]).map(function (o) {
        var c = pick(o, ["codice", "code", "lingua", "lingua_codice"]);
        if (!c) return null;
        var cat = catOf(pick(o, ["categoria", "category"]));
        return {
          code: String(c), n: num(pick(o, ["n", "n_parole", "count"])),
          ex: exList(pick(o, ["esempi", "examples", "parole"])),
          cat: cat ? cat.id : null,
          name: pick(o, ["nome", "nome_en", "name"]) || null,
          type: pick(o, ["tipo_lingua", "tipo", "type"]) || null
        };
      }).filter(Boolean);
    });
    return out;
  }

  function getRaw(name, optional) {
    var g = window.LEXODUS || {};
    if (g[name] !== undefined) return Promise.resolve(g[name]);
    return fetch("data/" + name + ".json").then(function (r) {
      if (!r.ok) throw new Error("data/" + name + ".json: " + r.status);
      return r.json();
    }).catch(function (e) { if (optional) return null; throw e; });
  }

  var cache = null;
  function load() {
    if (cache) return cache;
    cache = Promise.all([getRaw("lingue"), getRaw("archi"), getRaw("fonte", true), getRaw("livello2", true), getRaw("livello2_latino_unito", true)])
      .then(function (res) {
        var langs = {};
        asList(res[0]).forEach(function (o) {
          var l = normLanguage(o);
          if (l && (!langs[l.code] || l.target)) langs[l.code] = l;
        });
        function ensure(code, type, name) {
          if (!langs[code]) langs[code] = { code: code, name: name || code, nameIt: "", target: false, type: type || "lingua" };
          return langs[code];
        }
        var arcs = [];
        asList(res[1]).forEach(function (o) {
          var a = normArc(o);
          if (!a || a.n <= 0) return;
          arcs.push(a);
          var l = ensure(a.from, a.type);
          if (a.type && !l.target) l.type = a.type;
          ensure(a.to).target = true;
        });
        var l2 = normLevel2(res[3]), l2m = normLevel2(res[4]);
        [l2, l2m].forEach(function (d) {
          if (d) Object.keys(d).forEach(function (k) { d[k].forEach(function (it) { ensure(it.code, it.type, it.name); }); });
        });
        ensure("la", "lingua", "Latin");
        var targets = Object.keys(langs).map(function (k) { return langs[k]; })
          .filter(function (l) { return l.target; })
          .sort(function (a, b) { return a.name.localeCompare(b.name, "en"); });
        return { langs: langs, arcs: arcs, targets: targets, source: res[2] || {}, level2: l2, level2Merged: l2m };
      });
    return cache;
  }

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
    var sample = source && source.tipo === "campione";
    el.innerHTML = 'Data: English Wiktionary, extracted by <a href="https://kaikki.org/">Wiktextract / kaikki.org</a>, downloaded 18 October 2026, ' +
      'licence <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.' +
      (sample ? " This version uses a sample built from the project tables." : "") + ' <a href="about.html">How it was made</a>.';
  }

  window.Lex = {
    CATS: CATS, CAT_BY_KEY: CAT_BY_KEY, TYPE_LABEL: TYPE_LABEL, NOTES: NOTES,
    load: load, isLanguage: isLanguage, isLatin: isLatin, key: key, latinVarieties: latinVarieties,
    n: n, esc: esc, param: param, coverageText: coverageText, filterBar: filterBar, footer: footer
  };
})();
