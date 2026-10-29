/* lexodus, draft "brutalista" (the early web: craigslist, Berkshire Hathaway, Hacker News). Plain HTML elements
   in a strict order: h1, a definition list of facts, numbered sections, tables with 1 px rules, real lists. */
(function () {
  "use strict";
  var B = window.B;
  function el(id) { return document.getElementById(id); }
  var page = document.body.dataset.page;
  function fail(e) { el("loading").textContent = "Error: the data could not be loaded (" + e.message + ")."; console.error(e); }
  function done(html) { el("app").innerHTML = html; el("loading").hidden = true; el("app").hidden = false; document.body.dataset.ready = "1"; }
  function famName(id) { return (B.FAM_BY_ID[id] || {}).name || ""; }
  function a(href, text) { return '<a href="' + B.esc(href) + '">' + text + "</a>"; }

  // ---- home: the 33 as craigslist columns, then the whole table in numbers ----
  function home() {
    Promise.all([B.grid(), B.langs()]).then(function (res) {
      var G = res[0], L = res[1];
      document.title = "lexodus — loanwords between 33 languages";
      var h = "<h1>lexodus</h1><p>Words borrowed between 33 languages, from the etymologies of the English Wiktionary. " +
        "For each language: the words it took from the others, and the words it gave them. Borrowings, learned Latin and calques only.</p>" +
        '<p>Contents: <a href="#languages">1. The 33 languages</a> | <a href="#table">2. Who took from whom</a></p>';
      h += '<h2 id="languages">1. The 33 languages</h2><p>Words taken / words given.</p><div class="cols">';
      B.FAMILIES.forEach(function (f) {
        var list = L.list.filter(function (l) { return l.fam === f.id; }).sort(function (x, y) { return x.name.localeCompare(y.name, "en"); });
        if (!list.length) return;
        h += "<div><h3>" + B.esc(f.name) + "</h3><ul>" + list.map(function (l) {
          return "<li>" + a(B.langUrl(l.code), B.esc(l.name)) + " (" + B.n(l.took) + " / " + B.n(l.gave) + ")</li>";
        }).join("") + "</ul></div>";
      });
      h += "</div>";
      var rows = G.rows.slice().sort(function (x, y) { return x.name.localeCompare(y.name, "en"); });
      var cols = rows.map(function (r) { return r.code; }).concat(["LATINO", "altre"]);
      h += '<h2 id="table">2. Who took from whom</h2><p>Rows took from columns: Italian took ' + B.n((G.one.it || {}).en || 0) +
        " words from English (row Italian, column en). Columns are language codes; la = Latin of all periods, other = every other language.</p>";
      h += '<div class="wide"><table><tr><th>took \\ from</th>' + cols.map(function (c) {
        return "<th>" + (c === "LATINO" ? "la" : c === "altre" ? "other" : a(B.langUrl(c), B.esc(c))) + "</th>";
      }).join("") + "</tr>";
      rows.forEach(function (r) {
        var line = G.one[r.code] || {};
        h += "<tr><th>" + a(B.langUrl(r.code), B.esc(r.name)) + "</th>" + cols.map(function (c) {
          var v = c === r.code ? "" : line[c] || "";
          return '<td class="n">' + (v ? B.n(v) : "") + "</td>";
        }).join("") + "</tr>";
      });
      h += "</table></div>";
      done(h);
    }).catch(fail);
  }

  // ---- language ----
  function table(rows, code, dir) {
    var t = "<table><tr><th>#</th><th>Language</th><th>Words</th><th>Borrowed</th><th>Learned Latin</th><th>Calque</th><th>Examples</th></tr>";
    rows.forEach(function (r, i) {
      var ex = r.ex.slice(0, 4).map(function (w) {
        return a(dir === "from" ? B.wordUrl(code, w, 1, r.code) : B.wordUrl(r.code, w, 1, code), B.esc(w));
      }).join(", ");
      t += '<tr><td class="n">' + (i + 1) + "</td><td>" + (r.target || r.code === "la" ? a(B.langUrl(r.code), B.esc(r.name)) : B.esc(r.name)) + "</td>" +
        '<td class="n">' + B.n(r.n) + "</td>" + ["prestito", "latinismo_dotto", "calco"].map(function (k) { return '<td class="n">' + (r.cats[k] ? B.n(r.cats[k]) : "") + "</td>"; }).join("") +
        "<td>" + ex + "</td></tr>";
    });
    return '<div class="wide">' + t + "</table></div>";
  }
  function language() {
    var code = B.param("code") || "it";
    B.language(code).then(function (d) {
      var l = d.lang;
      document.title = l.name + " — lexodus";
      var h = "<h1>" + B.esc(l.name) + "</h1><dl>" +
        "<dt>Code</dt><dd>" + B.esc(code) + "</dd><dt>Family</dt><dd>" + B.esc(famName(l.fam) || "—") + "</dd>";
      if (l.target) h += "<dt>Wiktionary entries</dt><dd>" + B.n(l.lemmas) + "</dd><dt>With an etymology</dt><dd>" + B.n(l.withEty) + " (" + Math.round(l.pct) + "%)</dd>" +
        "<dt>Coverage</dt><dd>" + B.esc(l.coverage || "—") + "</dd><dt>Words taken</dt><dd>" + B.n(d.fromTotal) + " from " + d.from.length + " languages</dd>";
      h += "<dt>Words given</dt><dd>" + B.n(d.toTotal) + " to " + d.to.length + " of the 33</dd></dl>";
      h += "<p>Contents: " + (l.target ? '<a href="#took">1. Took from</a> | <a href="#gave">2. Gave to</a> | <a href="#far">3. Travelled furthest</a>' : '<a href="#gave">1. Gave to</a>') + "</p>";
      if (l.target) h += '<h2 id="took">1. Took from</h2><p>' + d.from.length + " languages, by number of words. Examples are " + B.esc(l.name) + " words; follow one for its page.</p>" + table(d.from, code, "from");
      h += '<h2 id="gave">' + (l.target ? 2 : 1) + ". Gave to</h2><p>" + d.to.length + " languages. Examples are words of the language that took them.</p>" + table(d.to, code, "to");
      h += '<div id="farbox"></div>';
      if (!l.target) return done(h);
      return B.extra(code).then(function (x) {
        var lst = x && x.piu_viaggiate ? x.piu_viaggiate.lista || [] : [];
        if (lst.length) {
          h += '<h2 id="far">3. Travelled furthest</h2><p>The ' + lst.length + " words that passed through the most languages before " + B.esc(l.name) + ", farthest source first.</p><ol>" +
            lst.map(function (w) {
              var cat = w.catena || [];
              return "<li>" + a(B.wordUrl(code, w.parola, w.n_etimologia, cat[0] && cat[0].codice), "<b>" + B.esc(w.parola) + "</b>") + " (" + cat.length + " steps): " +
                cat.slice().reverse().map(function (c) { return B.esc(B.nameOf(d.L, c.codice)) + (c.termine ? " <i>" + B.esc(c.termine) + "</i>" : ""); }).join(" &gt; ") + "</li>";
            }).join("") + "</ol>";
        }
        done(h);
      });
    }).catch(fail);
  }

  // ---- word ----
  function word() {
    var lang = B.param("lang") || "it", w = B.param("w") || "caffè", ne = +B.param("n") || 1, from = B.param("from") || "";
    B.word(lang, w, ne, from).then(function (r) {
      var L = r.L, p = r.p;
      if (!p) { el("loading").innerHTML = "Not found: “" + B.esc(w) + "”. " + a(B.wiktUrl(w, B.nameOf(L, lang)), "Look it up in the Wiktionary") + "."; document.body.dataset.ready = "1"; return; }
      document.title = p.parola + " — lexodus";
      var stops = B.journey(L, lang, p), prev = stops[stops.length - 2], first = stops[0];
      var T = r.tree ? B.fullTree(L, lang, r.tree) : null;
      var h = "<h1>" + B.esc(p.parola) + "</h1><dl><dt>Language</dt><dd>" + a(B.langUrl(lang), B.esc(B.nameOf(L, lang))) + "</dd>" +
        (p.pos ? "<dt>Part of speech</dt><dd>" + B.esc(p.pos) + "</dd>" : "") +
        "<dt>Meaning</dt><dd>" + B.esc(p.significato || "—") + "</dd>" +
        (prev ? "<dt>Came from</dt><dd>" + B.esc(prev.name) + " <i>" + B.esc(prev.term) + "</i>" + B.trSpan(prev.tr, prev.term) + ", " + B.esc(prev.how) + "</dd>" : "") +
        (first && !first.here ? "<dt>Farthest source</dt><dd>" + B.esc(first.name) + "</dd>" : "") +
        "<dt>Taken onward</dt><dd>" + (T ? T.count : 0) + " words</dd></dl>";
      h += '<p>Contents: <a href="#route">1. Route</a> | <a href="#ety">2. Etymology</a>' + (T && T.count ? ' | <a href="#onward">3. Taken onward</a>' : "") + "</p>";
      h += '<h2 id="route">1. Route</h2><ol>' + stops.map(function (s) {
        return "<li>" + (s.here ? "<b>" : "") + B.esc(s.name) + " <i>" + B.esc(s.term) + "</i>" + B.trSpan(s.tr, s.term) + (s.here ? "</b>" : "") + (s.how ? ", " + B.esc(s.how) + " by" : "") + "</li>";
      }).join("") + "</ol>";
      h += '<h2 id="ety">2. Etymology</h2>' + (r.text ? "<blockquote>“" + B.esc(r.text) + "”</blockquote>" : "") +
        "<p>Source: " + a(B.wiktUrl(p.parola, B.nameOf(L, lang)), B.esc(p.parola) + ", English Wiktionary") + ".</p>";
      if (T && T.count) {
        var ul = function (kids) {
          return "<ul>" + kids.map(function (k) {
            return "<li>" + B.esc(k.name) + " " + a(B.wordUrl(k.code, k.word, k.ne, k.parent), "<i>" + B.esc(k.word) + "</i>") + B.trSpan(k.tr, k.word) +
              (k.how ? ", " + B.esc(k.how) : "") + (k.kids.length ? ul(k.kids) : "") + "</li>";
          }).join("") + "</ul>";
        };
        h += '<h2 id="onward">3. Taken onward</h2><p>' + T.count + " words: the languages that took it from " + B.esc(B.nameOf(L, lang)) + ", and those that took it from them.</p>" + ul(T.me.kids);
      }
      done(h);
    }).catch(fail);
  }

  if (page === "index.html") home(); else if (page === "language.html") language(); else word();
})();
