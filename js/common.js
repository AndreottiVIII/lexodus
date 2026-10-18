/* lexodus — shared code: data loading, normalisation, categories, small UI helpers. */
(function () {
  "use strict";

  // One colour per category, defined in css/style.css as --cat-<id>.
  var CATS = [
    { id: "borrowed", key: "prestito", label: "Borrowed", hint: "taken from another language" },
    { id: "learned", key: "latinismo_dotto", label: "Learned Latin", hint: "taken from written Latin" },
    { id: "inherited", key: "ereditato", label: "Inherited", hint: "passed down from an older form of the language" },
    { id: "calque", key: "calco", label: "Calque", hint: "translated piece by piece" },
    { id: "unspecified", key: "non_precisato", label: "Unspecified", hint: "“from X”, without saying how" }
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

  var COVERAGE = {
    good: { label: "good", dots: 3, text: "70% or more of its entries have an etymology" },
    fair: { label: "fair", dots: 2, text: "30–70% of its entries have an etymology" },
    poor: { label: "poor", dots: 1, text: "less than 30% of its entries have an etymology" }
  };
  var COVERAGE_ALIAS = { buona: "good", media: "fair", scarsa: "poor", good: "good", fair: "fair", medium: "fair", poor: "poor" };

  var TYPE_LABEL = {
    lingua: "language", protolingua: "proto-language", famiglia: "language family",
    "non lingua": "not a language", sostrato: "substrate", "non_lingua": "not a language"
  };

  // Short notes for languages whose numbers need a word of caution (from COSE_INTERESSANTI.md, sec. 5-6).
  var NOTES = {
    ro: "Romanian Wiktionary editors almost always write “borrowed” and rarely “from X”, so its borrowed counts look larger than in other languages.",
    mt: "Maltese is the least covered language here: only about 1 entry in 10 has an etymology. Real numbers are probably much higher.",
    ar: "Arabic is poorly covered: only about 1 entry in 5 has an etymology.",
    en: "English Wiktionary documents English best of all, especially recent loans.",
    fi: "Finnish is the best covered language, but most of its etymologies are word formation inside Finnish.",
    mul: "“Translingual” is not a language: these are scientific names of plants and animals."
  };

  function pick(o, keys) {
    for (var i = 0; i < keys.length; i++) {
      if (o[keys[i]] !== undefined && o[keys[i]] !== null && o[keys[i]] !== "") return o[keys[i]];
    }
    return undefined;
  }
  function num(v) { var n = Number(v); return isFinite(n) ? n : 0; }
  function asList(raw) {
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === "object") {
      var out = [];
      Object.keys(raw).forEach(function (k) { if (Array.isArray(raw[k])) out = out.concat(raw[k]); });
      return out;
    }
    return [];
  }

  function normLanguage(o) {
    var code = pick(o, ["codice", "code", "lingua", "lang", "id"]);
    if (!code) return null;
    var pct = pick(o, ["percentuale", "percentuale_con_etimologia", "pct", "percent"]);
    var lemmas = pick(o, ["lemmi", "lemmas", "n_lemmi"]);
    var cov = pick(o, ["copertura", "giudizio", "giudizio_copertura", "coverage"]);
    var target = pick(o, ["arrivo", "di_arrivo", "lingua_arrivo", "target", "is_target"]);
    if (target === undefined) target = lemmas !== undefined;
    if (target === "sì" || target === "si" || target === "true") target = true;
    if (target === "no" || target === "false") target = false;
    var p = pct === undefined ? null : num(pct);
    if (!cov && p !== null) cov = p >= 70 ? "good" : p >= 30 ? "fair" : "poor";
    return {
      code: String(code),
      name: String(pick(o, ["nome_en", "nome_inglese", "name_en", "nome_eng", "name", "nome"]) || code),
      nameIt: pick(o, ["nome_it", "nome_italiano", "name_it"]) || "",
      target: !!target,
      type: pick(o, ["tipo_lingua", "tipo", "type"]) || "lingua",
      lemmas: lemmas === undefined ? null : num(lemmas),
      withEty: pick(o, ["lemmi_con_etimologia", "con_etimologia", "lemmas_with_etymology"]) !== undefined
        ? num(pick(o, ["lemmi_con_etimologia", "con_etimologia", "lemmas_with_etymology"])) : null,
      pct: p,
      linked: pick(o, ["parole_con_legami", "words_with_links"]) !== undefined ? num(pick(o, ["parole_con_legami", "words_with_links"])) : null,
      coverage: COVERAGE_ALIAS[String(cov || "").toLowerCase()] || null
    };
  }

  function normArc(o) {
    var from = pick(o, ["origine", "lingua_origine", "origine_codice", "lingua_origine_codice", "da", "from", "source"]);
    var to = pick(o, ["arrivo", "lingua_arrivo", "arrivo_codice", "lingua_arrivo_codice", "a", "to", "target"]);
    var cat = CAT_BY_KEY[String(pick(o, ["categoria", "category", "cat"]) || "").toLowerCase()];
    if (!from || !to || !cat) return null;
    var ex = pick(o, ["esempi", "parole_esempio", "esempio", "parole", "examples"]) || [];
    if (typeof ex === "string") ex = ex.split(/[|;,]\s*/).filter(Boolean);
    return {
      from: String(from), to: String(to), cat: cat.id,
      n: num(pick(o, ["n_parole", "parole_n", "n", "count", "words"])),
      unc: num(pick(o, ["n_incerte", "incerte", "uncertain"])),
      type: pick(o, ["tipo_lingua_origine", "tipo_origine", "source_type"]) || null,
      ex: ex.slice(0, 12)
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
    cache = Promise.all([getRaw("lingue"), getRaw("archi"), getRaw("fonte").catch(function () { return {}; })])
      .then(function (res) {
        var langs = {};
        asList(res[0]).forEach(function (o) {
          var l = normLanguage(o);
          if (l && (!langs[l.code] || l.target)) langs[l.code] = l;
        });
        var arcs = [];
        asList(res[1]).forEach(function (o) {
          var a = normArc(o);
          if (!a || a.n <= 0) return;
          arcs.push(a);
          if (!langs[a.from]) langs[a.from] = { code: a.from, name: a.from, nameIt: "", target: false, type: a.type || "lingua" };
          if (a.type && !langs[a.from].target) langs[a.from].type = a.type;
          if (!langs[a.to]) langs[a.to] = { code: a.to, name: a.to, nameIt: "", target: true, type: "lingua" };
        });
        var targets = Object.keys(langs).map(function (k) { return langs[k]; })
          .filter(function (l) { return l.target; })
          .sort(function (a, b) { return a.name.localeCompare(b.name, "en"); });
        return { langs: langs, arcs: arcs, targets: targets, source: res[2] || {} };
      });
    return cache;
  }

  function isLanguage(type) { return !type || type === "lingua"; }

  // Group arcs by the language on the other side, keeping one entry per category.
  function aggregate(arcs, side, filters, langs) {
    var by = {};
    arcs.forEach(function (a) {
      if (filters.cats.indexOf(a.cat) < 0) return;
      var code = side === "from" ? a.from : a.to;
      var l = langs[code];
      if (filters.hideOther && l && !isLanguage(l.type)) return;
      var g = by[code] || (by[code] = { code: code, total: 0, unc: 0, byCat: {} });
      g.total += a.n; g.unc += a.unc;
      var c = g.byCat[a.cat] || (g.byCat[a.cat] = { n: 0, unc: 0, ex: [] });
      c.n += a.n; c.unc += a.unc;
      a.ex.forEach(function (w) { if (c.ex.length < 12 && c.ex.indexOf(w) < 0) c.ex.push(w); });
    });
    return Object.keys(by).map(function (k) { return by[k]; }).sort(function (a, b) { return b.total - a.total || a.code.localeCompare(b.code); });
  }

  var fmt = new Intl.NumberFormat("en-GB");
  function n(v) { return fmt.format(v); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }
  function param(name) { return new URLSearchParams(location.search).get(name); }
  function setParam(name, value) {
    var u = new URL(location.href);
    u.searchParams.set(name, value);
    history.replaceState(null, "", u.pathname.split("/").pop() + u.search);
  }

  function coverageBadge(cov) {
    var c = COVERAGE[cov];
    if (!c) return "";
    var dots = "";
    for (var i = 0; i < 3; i++) dots += '<i class="' + (i < c.dots ? "on" : "") + '"></i>';
    return '<span class="cov cov-' + cov + '" title="Wiktionary coverage: ' + c.label + " (" + c.text + ')"><span class="dots" aria-hidden="true">' + dots + "</span>" + c.label + "</span>";
  }

  // Category chips + "hide families" switch. Calls onChange(filters).
  var STORE = "lexodus.filters";
  function readFilters() {
    var f = { cats: CATS.map(function (c) { return c.id; }), hideOther: true };
    try {
      var s = JSON.parse(localStorage.getItem(STORE) || "null");
      if (s && Array.isArray(s.cats)) f.cats = s.cats.filter(function (c) { return CAT_BY_KEY[c]; });
      if (s && typeof s.hideOther === "boolean") f.hideOther = s.hideOther;
    } catch (e) { /* storage blocked: keep defaults */ }
    return f;
  }
  function saveFilters(f) { try { localStorage.setItem(STORE, JSON.stringify(f)); } catch (e) { /* ignore */ } }

  function filterBar(el, onChange) {
    var f = readFilters();
    var html = '<div class="chips" role="group" aria-label="Categories">';
    CATS.forEach(function (c) {
      html += '<button type="button" class="chip" id="cat-' + c.id + '" data-cat="' + c.id + '" aria-pressed="' + (f.cats.indexOf(c.id) >= 0) + '" title="' + esc(c.hint) + '">' +
        '<span class="sw sw-' + c.id + '" aria-hidden="true"></span>' + c.label + "</button>";
    });
    html += '</div><label class="switch"><input type="checkbox" id="hide-other"' + (f.hideOther ? " checked" : "") + '> Hide families, proto-languages and non-languages</label>';
    el.innerHTML = html;
    el.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-cat]");
      if (!b) return;
      var on = b.getAttribute("aria-pressed") !== "true";
      b.setAttribute("aria-pressed", on);
      f.cats = Array.prototype.map.call(el.querySelectorAll('button[aria-pressed="true"]'), function (x) { return x.dataset.cat; });
      saveFilters(f); onChange(f);
    });
    el.querySelector("#hide-other").addEventListener("change", function (e) {
      f.hideOther = e.target.checked; saveFilters(f); onChange(f);
    });
    return f;
  }

  function footer(source) {
    var el = document.getElementById("site-footer");
    if (!el) return;
    var sample = source && source.tipo === "campione";
    el.innerHTML = '<p>Data: English Wiktionary, extracted by <a href="https://kaikki.org/">Wiktextract / kaikki.org</a>, downloaded 18 October 2026. ' +
      'Wiktionary content is available under <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.' +
      (sample ? " This version uses a sample built from the project tables; the final export will replace it." : "") +
      ' <a href="about.html">How it was made</a>.</p>';
  }

  window.Lex = {
    CATS: CATS, CAT_BY_KEY: CAT_BY_KEY, COVERAGE: COVERAGE, TYPE_LABEL: TYPE_LABEL, NOTES: NOTES,
    load: load, aggregate: aggregate, isLanguage: isLanguage, n: n, esc: esc, param: param, setParam: setParam,
    coverageBadge: coverageBadge, filterBar: filterBar, footer: footer
  };
})();
