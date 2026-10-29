/* lexodus, draft "svizzera" (International Typographic Style): the table of the 33 as a poster, the language and
   the word as posters with the name at the bottom left, the lists as Swiss railway timetables. */
(function () {
  "use strict";
  var B = window.B;
  function el(id) { return document.getElementById(id); }
  var page = document.body.dataset.page;
  var app = el("app");
  function fail(e) { el("loading").innerHTML = "<span>The data could not be loaded (" + B.esc(e.message) + ").</span>"; console.error(e); }
  function done(html) { app.innerHTML = html; el("loading").hidden = true; app.hidden = false; document.body.dataset.ready = "1"; }
  function famName(id) { return (B.FAM_BY_ID[id] || {}).name || ""; }
  function sec(no, label, sum, body, cls) {
    return '<section class="sec g"><p class="no">' + no + '</p><div class="lab"><h2>' + label + '</h2><span class="sum">' + sum + "</span></div>" +
      '<div class="body' + (cls ? " " + cls : "") + '">' + body + "</div></section>";
  }
  function form(term, tr) { return B.esc(term || "–"); }

  // ============ the table (home) ============
  function size(v) { return v >= 10000 ? 5 : v >= 1000 ? 4 : v >= 100 ? 3 : v >= 10 ? 2 : v >= 1 ? 1 : 0; }
  function home() {
    B.grid().then(function (G) {
      var rows = G.rows.slice().sort(function (a, b) { return a.name.localeCompare(b.name, "en"); });
      var cols = rows.concat([{ code: "LATINO", name: "Latin" }, { code: "altre", name: "other languages" }]);
      var h = '<div class="r"></div>';
      cols.forEach(function (c) {
        var href = c.code === "LATINO" ? "language.html?code=la" : c.code === "altre" ? "" : B.langUrl(c.code);
        var red = c.code === "it" ? " red" : "";
        h += '<div class="h' + red + '">' + (href ? '<a href="' + href + '">' + B.esc(c.name) + "</a>" : B.esc(c.name)) + "</div>";
      });
      rows.forEach(function (r, i) {
        if (i % 5 === 0) h += '<div class="rule"></div>';
        var red = r.code === "it";
        h += '<div class="r' + (red ? " red" : "") + '"><a href="' + B.langUrl(r.code) + '">' + B.esc(r.name) + "</a></div>";
        var line = G.one[r.code] || {};
        cols.forEach(function (c) {
          var v = line[c.code] || 0, s = c.code === r.code ? 0 : size(v);
          var cl = "c" + ((red || c.code === "it") && s ? " red" : "");
          h += '<div class="' + cl + '"' + (s ? ' title="' + B.esc(r.name + " took " + B.n(v) + (v === 1 ? " word" : " words") + " from " + c.name) + '"' : "") + ">" +
            (s ? '<i class="s' + s + '"></i>' : "") + "</div>";
        });
      });
      var it = G.one.it || {};
      var html = '<div class="plate-grid g"><p class="scrollnote">The table is wider than the screen: slide it sideways.</p><div class="mx">' + h + "</div></div>" +
        '<div class="poster home g"><h1 class="title">lexodus</h1><div class="text">' +
        "<p>Each row is a language; each square, the words it took from the language of the column. Italian, in red, took " +
        B.n(it.en || 0) + " words from English and " + B.n(it.fr || 0) + " from French.</p>" +
        '<div class="key"><span><i class="s1"></i>1–9</span><span><i class="s2"></i>10–99</span><span><i class="s3"></i>100–999</span>' +
        '<span><i class="s4"></i>1,000–9,999</span><span><i class="s5"></i>10,000 and more</span></div>' +
        "<p>Borrowings, learned Latin and calques, counted on the direct source of each word.</p></div></div>";
      done(html);
    }).catch(fail);
  }

  // ============ the language ============
  function catCell(r, k) { var v = r.cats[k] || 0; return '<td class="num hide-s">' + (v ? B.n(v) : "–") + "</td>"; }
  function table(rows, code, dir) {
    var max = rows.reduce(function (m, r) { return Math.max(m, r.n); }, 1);
    var t = '<table><thead><tr><th>Language</th><th class="num">Words</th><th class="bar"></th>' +
      '<th class="num hide-s">Borr.</th><th class="num hide-s">Latin</th><th class="num hide-s">Calque</th><th class="hide-s">Examples</th></tr></thead><tbody>';
    var few = rows.filter(function (r) { return r.n < 5; });
    rows.filter(function (r) { return r.n >= 5; }).forEach(function (r) {
      var ex = r.ex.slice(0, 2).map(function (w) {
        var u = dir === "from" ? B.wordUrl(code, w, 1, r.code) : B.wordUrl(r.code, w, 1, code);
        return '<a href="' + B.esc(u) + '">' + B.esc(w) + "</a>";
      }).join(" ");
      t += '<tr><td class="lang' + (r.target ? "" : " out") + '">' + (r.target || r.code === "la" ? '<a href="' + B.langUrl(r.code) + '">' + B.esc(r.name) + "</a>" : B.esc(r.name)) + "</td>" +
        '<td class="num">' + B.n(r.n) + '</td><td class="bar"><span style="width:' + (100 * r.n / max).toFixed(2) + '%"></span></td>' +
        catCell(r, "prestito") + catCell(r, "latinismo_dotto") + catCell(r, "calco") + '<td class="ex hide-s">' + ex + "</td></tr>";
    });
    if (few.length) t += '<tr><td colspan="7" class="few">' + few.length + " more with fewer than five words: " +
      few.map(function (r) { return B.esc(r.name) + " " + r.n; }).join(", ") + ".</td></tr>";
    return t + "</tbody></table>";
  }
  function language() {
    var code = B.param("code") || "it";
    B.language(code).then(function (d) {
      var l = d.lang;
      document.title = l.name + " — lexodus (Swiss draft)";
      var html = '<div class="poster g">' +
        '<p class="i1"><span class="k">Language</span>' + B.esc(l.name) + ", code " + B.esc(code) + "</p>" +
        '<p class="i2"><span class="k">Family</span>' + B.esc(famName(l.fam) || "–") + "</p>" +
        (l.target ? '<p class="i3"><span class="k">Wiktionary</span>' + B.n(l.lemmas) + " entries, " + Math.round(l.pct) + "% with an etymology</p>" +
          '<p class="i4"><span class="k">Coverage</span>' + B.esc(l.coverage || "–") + "</p>" : '<p class="i3"><span class="k">Outside the 33</span>Only the words it gave are counted.</p>') +
        '<h1 class="title">' + B.esc(l.name) + "</h1></div>";
      var no = 1;
      if (l.target) html += sec(no++, "Took from", B.n(d.fromTotal) + " words from " + d.from.length + " languages", table(d.from, code, "from"));
      html += sec(no++, "Gave to", B.n(d.toTotal) + " words to " + d.to.length + " of the 33", table(d.to, code, "to"));
      html += '<div id="far"></div>';
      done(html);
      if (!l.target) return;
      return B.extra(code).then(function (x) {
        var lst = x && x.piu_viaggiate ? x.piu_viaggiate.lista || [] : [];
        if (!lst.length) return;
        var t = '<table><thead><tr><th>Word</th><th class="num">Steps</th><th>Route, from the farthest source</th></tr></thead><tbody>';
        lst.forEach(function (w) {
          var cat = w.catena || [];
          var route = cat.slice().reverse().map(function (c) { return B.esc(B.nameOf(d.L, c.codice)) + (c.termine ? " " + B.esc(c.termine) : ""); }).join(" → ");
          t += '<tr><td class="lang"><a href="' + B.esc(B.wordUrl(code, w.parola, w.n_etimologia, cat[0] && cat[0].codice)) + '">' + B.esc(w.parola) + "</a></td>" +
            '<td class="num">' + cat.length + "</td><td>" + route + "</td></tr>";
        });
        t += "</tbody></table>";
        el("far").outerHTML = sec(no, "Travelled furthest", "the " + lst.length + " words that passed through most languages", t);
      });
    }).catch(fail);
  }

  // ============ the word ============
  function word() {
    var lang = B.param("lang") || "it", w = B.param("w") || "caffè", ne = +B.param("n") || 1, from = B.param("from") || "";
    B.word(lang, w, ne, from).then(function (r) {
      var L = r.L, p = r.p;
      if (!p) { el("loading").innerHTML = '<span>“' + B.esc(w) + '” is not in the data. <a href="' + B.wiktUrl(w, B.nameOf(L, lang)) + '">Wiktionary</a></span>'; document.body.dataset.ready = "1"; return; }
      document.title = p.parola + " — lexodus (Swiss draft)";
      var stops = B.journey(L, lang, p), first = stops[0], prev = stops[stops.length - 2];
      var T = r.tree ? B.fullTree(L, lang, r.tree) : null, onward = [];
      if (T) (function walk(nd) { nd.kids.forEach(function (k) { onward.push(k); walk(k); }); })(T.me);
      var langsOn = {}; onward.forEach(function (o) { langsOn[o.code] = 1; });
      var html = '<div class="poster g">' +
        '<p class="i1"><span class="k">Word</span>' + B.esc(B.nameOf(L, lang)) + (p.pos ? ", " + B.esc(p.pos) : "") + "</p>" +
        '<p class="i2"><span class="k">Meaning</span>' + B.esc(p.significato || "–") + "</p>" +
        '<p class="i3"><span class="k">Arrived</span>' + (prev ? B.esc(prev.how || "came") + " from " + B.esc(prev.name) : "no source in the data") + "</p>" +
        '<p class="i4"><span class="k">Onward</span>' + (onward.length ? B.n(onward.length) + " words in " + Object.keys(langsOn).length + " languages" : "none in the data") + "</p>" +
        '<h1 class="title">' + B.esc(p.parola) + "</h1></div>";
      var t = '<table><thead><tr><th class="num">Stop</th><th>Language</th><th>Form</th><th class="hide-s">Transliteration</th><th class="num">Words of the pair</th><th class="hide-s">Passed on</th></tr></thead><tbody>';
      stops.forEach(function (s, i) {
        var script = !B.isLatinScript(s.term);
        t += "<tr" + (s.here ? ' class="me"' : "") + '><td class="num">' + (i + 1) + '</td><td class="lang">' + B.esc(s.name) + "</td>" +
          "<td" + (script ? ' class="ar"' : "") + "><bdi>" + form(s.term) + '</bdi></td><td class="hide-s">' + B.esc(s.tr && s.tr !== s.term ? s.tr : "–") + "</td>" +
          '<td class="num" id="pc' + i + '">' + (i ? "…" : "–") + '</td><td class="hide-s">' + B.esc(s.how || (s.here ? "–" : "")) + "</td></tr>";
      });
      t += "</tbody></table>";
      html += sec(1, "Route", stops.length + " stops, from the farthest source", t);
      var note = "The column “Words of the pair” counts every word the language of the row took from the one above; “–” where that language is not one of the 33.";
      html = html.replace("</table></div></section>", '</table><p class="ety" style="margin-top:24px">' + note + "</p></div></section>");
      html += sec(2, "Etymology", "as written in the Wiktionary",
        (r.text ? '<p class="ety">“' + B.esc(r.text) + "”</p>" : "") +
        '<p class="ety"><a href="' + B.wiktUrl(p.parola, B.nameOf(L, lang)) + '">' + B.esc(p.parola) + " in the English Wiktionary</a></p>", "narrow");
      if (onward.length) {
        var o = '<table><thead><tr><th class="num">Step</th><th>Language</th><th>Form</th><th class="hide-s">Transliteration</th><th>From</th><th class="hide-s">How</th></tr></thead><tbody>';
        onward.forEach(function (k) {
          var script = !B.isLatinScript(k.word);
          var href = B.wordUrl(k.code, k.word, k.ne, k.parent);
          o += '<tr><td class="num">' + (k.d - T.me.d) + '</td><td class="lang">' + B.esc(k.name) + "</td>" +
            "<td" + (script ? ' class="ar"' : "") + '><a href="' + B.esc(href) + '"><bdi>' + B.esc(k.word) + '</bdi></a></td><td class="hide-s">' + B.esc(k.tr || "–") + "</td>" +
            "<td>" + B.esc(B.nameOf(L, k.parent)) + '</td><td class="hide-s">' + B.esc(k.how || "–") + "</td></tr>";
        });
        o += "</tbody></table>";
        html += sec(3, "Onward", "the languages that took it from " + B.esc(B.nameOf(L, lang)) + " and from each other", o);
      }
      return Promise.all(stops.map(function (s, i) { return i ? B.pairCount(stops[i - 1].code, s.code) : null; })).then(function (pc) {
        pc.forEach(function (c, i) { if (i) html = html.replace('id="pc' + i + '">…', 'id="pc' + i + '">' + (c == null ? "–" : B.n(c))); });
        done(html);
      });
    }).catch(fail);
  }

  if (page === "index.html") home(); else if (page === "language.html") language(); else word();
})();
