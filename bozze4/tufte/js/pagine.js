/* lexodus, draft "tufte" (a scientific monograph in the manner of Edward Tufte): chapters of prose with numbered
   side notes, sparklines inside sentences, tables ruled only above and below, numbered figures; the home is the
   first chapter with 33 small multiples. All sentences are written from the data. */
(function () {
  "use strict";
  var B = window.B, E = B.esc;
  function el(id) { return document.getElementById(id); }
  var page = document.body.dataset.page;
  function fail(e) { el("loading").textContent = "The chapter could not be set (" + e.message + ")."; console.error(e); }
  function done(html) { el("app").innerHTML = html; el("loading").hidden = true; el("app").hidden = false; document.body.dataset.ready = "1"; }
  function sn(text) { return '<label class="snref"></label><span class="sn">' + text + "</span>"; }
  function mn(text) { return '<span class="mn">' + text + "</span>"; }
  function pct(a, b) { return b ? Math.round(100 * a / b) : 0; }
  var WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
  function say(n) { return n < WORDS.length ? WORDS[n] : B.n(n); }
  // a sparkline of values as thin bars, one per value (log scale when asked), the first in full colour
  function spark(vals, opts) {
    opts = opts || {};
    var w = opts.w || 2, gap = opts.gap || 1, h = 14, max = Math.max.apply(null, vals.concat([1]));
    var f = opts.log ? function (v) { return v > 0 ? Math.max(1, h * Math.log(v + 1) / Math.log(max + 1)) : 0; } : function (v) { return Math.max(v > 0 ? 1 : 0, h * v / max); };
    var W = vals.length * (w + gap);
    return '<svg class="spark" width="' + W + '" height="' + h + '" viewBox="0 0 ' + W + " " + h + '" role="img" aria-label="' + E(opts.label || "") + '">' +
      vals.map(function (v, i) { var y = f(v); return '<rect x="' + i * (w + gap) + '" y="' + (h - y).toFixed(1) + '" width="' + w + '" height="' + y.toFixed(1) + '"/>'; }).join("") + "</svg>";
  }
  function famShares(rows) {
    var by = {}, tot = 0;
    rows.forEach(function (r) { by[r.fam] = (by[r.fam] || 0) + r.n; tot += r.n; });
    return B.FAMILIES.map(function (f) { return tot ? (by[f.id] || 0) / tot : 0; });
  }
  function chapterOf(L, code) {
    var order = L.list.slice().sort(function (a, b) { return a.name.localeCompare(b.name, "en"); }).map(function (x) { return x.code; });
    var i = order.indexOf(B.merged(code));
    return i < 0 ? null : i + 2;
  }

  // ============ chapter 1: thirty-three languages ============
  function home() {
    B.allSides().then(function (A) {
      var L = A.L, list = L.list.slice();
      el("rhl").textContent = "lexodus"; el("rhr").textContent = "Chapter 1 · page 1";
      var lem = list.reduce(function (s, l) { return s + l.lemmas; }, 0), ety = list.reduce(function (s, l) { return s + l.withEty; }, 0);
      var byGave = list.slice().sort(function (a, b) { return b.gave - a.gave; }), byTook = list.slice().sort(function (a, b) { return b.took - a.took; });
      var g1 = byGave[0], t1 = byTook[0], t1from = A.sides[t1.code].from[0];
      var html = "<h1>Thirty-three languages</h1>" +
        '<p class="subtitle">How words passed from one European language to another, read from the etymologies of the English Wiktionary</p>';
      html += '<p><span class="newthought">Thirty-three languages</span> are counted in this book, from Albanian to Ukrainian. For each of them the English Wiktionary records the origin of many words; from those records we read, word by word, the language a word came from and the way it came: borrowed, taken from Latin by the learned, or translated piece by piece as a calque.' +
        sn("The Wiktionary holds " + B.n(lem) + " entries in these languages, " + B.n(ety) + " of them with an etymology. Dump of 2 September 2026, read on 18 October 2026 through Wiktextract.") + "</p>";
      html += "<p>" + E(g1.name) + " gave " + B.n(g1.gave) + " words to the other thirty-two " + spark(byGave.map(function (l) { return l.gave; }), { log: true, label: "words given by each of the 33, from the most to the least" }) +
        ", more than any other; the line of bars puts the thirty-three in order, on a logarithmic scale, from " + E(g1.name) + " down to " + E(byGave[byGave.length - 1].name) + " (" + B.n(byGave[byGave.length - 1].gave) + "). " +
        E(t1.name) + " took the most, " + B.n(t1.took) + " words, " + B.n(t1from.n) + " of them from " + E(t1from.name) + "." +
        (t1.code === "ro" ? sn("Romanian is a special case: the Wiktionary credits French with a great many Romanian words. The count says what the Wiktionary says.") : "") + "</p>";
      html += "<p>Figure 1 shows where each language took its words from, family by family. Every panel has the same scale, so the panels can be compared at a glance: the long bar of Romance in the English panel, the Germanic bar of the Scandinavian languages, the Turkic and Semitic bars of the Balkans.</p>";
      // figure 1: small multiples
      var fams = B.FAMILIES, rowH = 21, W = 150;
      function panel(l) {
        var sh = famShares(A.sides[l.code].from), own = fams.map(function (f) { return f.id === l.fam; });
        var svg = '<svg viewBox="0 0 ' + W + " " + (fams.length * rowH) + '" preserveAspectRatio="none" style="height:' + (fams.length * rowH) + 'px" role="img" aria-label="' + E(l.name) + ': words taken, by family of the source">' +
          sh.map(function (v, i) { return '<rect class="' + (own[i] ? "own" : "") + '" x="0" y="' + (i * rowH + 9) + '" width="' + Math.max(v > 0 ? 0.8 : 0, v * W).toFixed(1) + '" height="4"/>'; }).join("") + "</svg>";
        var tot = A.sides[l.code].from.reduce(function (s, r) { return s + r.n; }, 0);
        return '<div class="panel"><p class="t"><a href="' + B.langUrl(l.code) + '">' + E(l.name) + "</a><i>" + B.n(tot) + "</i></p>" + svg + "</div>";
      }
      var key = '<div class="panel key"><p class="t">Family of the source</p>' + fams.map(function (f) { return '<p class="fk">' + E(f.name) + "</p>"; }).join("") + "</div>";
      var ordered = [];
      fams.forEach(function (f) { list.filter(function (l) { return l.fam === f.id; }).sort(function (a, b) { return a.name.localeCompare(b.name, "en"); }).forEach(function (l) { ordered.push(l); }); });
      html += '<figure class="full"><div class="mult">' + key + ordered.map(panel).join("") + "</div>" +
        '<p class="caption"><b>Figure 1.</b> Words each language took, as a share of all it took, by the family of the language it took them from. One bar per family, in the order of the key; the bar of the language’s own family is black. The number is the words taken. All panels on one scale, from 0 to 100 per cent of the panel’s width.</p></figure>';
      html += "<h2>The chapters that follow</h2><p>One chapter for each language, in alphabetical order: " +
        list.slice().sort(function (a, b) { return a.name.localeCompare(b.name, "en"); }).map(function (l) {
          return '<a href="' + B.langUrl(l.code) + '">' + E(l.name) + "</a> " + chapterOf(L, l.code);
        }).join(", ") + ".</p>";
      done(html);
    }).catch(fail);
  }

  // ============ a language ============
  function table(rows, k, no, caption, code, dir) {
    var tot = rows.reduce(function (s, r) { return s + r.n; }, 0), max = rows[0] ? rows[0].n : 1;
    return '<div class="tbl"><table><thead><tr><th>Language</th><th class="n">Words</th><th class="n">Share</th><th></th><th class="n hide-s">Borrowed</th><th class="n hide-s">Learned</th><th class="n hide-s">Calque</th></tr></thead><tbody>' +
      rows.slice(0, k).map(function (r) {
        return "<tr><td>" + (r.target || r.code === "la" ? '<a href="' + B.langUrl(r.code) + '">' + E(r.name) + "</a>" : E(r.name)) + '</td><td class="n">' + B.n(r.n) + '</td><td class="n">' + pct(r.n, tot) + '%</td><td class="bar"><span style="width:' + (100 * r.n / max).toFixed(1) + '%"></span></td>' +
          ["prestito", "latinismo_dotto", "calco"].map(function (c) { return '<td class="n hide-s">' + (r.cats[c] ? B.n(r.cats[c]) : "") + "</td>"; }).join("") + "</tr>";
      }).join("") + "</tbody></table>" +
      '<p class="caption"><b>Table ' + no + ".</b> " + caption + "</p></div>";
  }
  function language() {
    var code = B.param("code") || "it";
    Promise.all([B.language(code), B.extra(code)]).then(function (res) {
      var d = res[0], x = res[1], l = d.lang, L = d.L, ch = chapterOf(L, code);
      document.title = l.name + " — lexodus (monograph draft)";
      el("rhl").textContent = ch ? "Chapter " + ch + " · " + l.name : l.name; el("rhr").textContent = ch ? "page " + (ch * 14 - 11) : "";
      var fam = (B.FAM_BY_ID[l.fam] || {}).name || "";
      var html = "<h1>" + E(l.name) + "</h1>";
      if (!l.target) {
        html += '<p class="subtitle">A language outside the thirty-three: only the words it gave are counted.</p>';
      } else {
        var f0 = d.from[0], f1 = d.from[1], f2 = d.from[2], k = 15;
        var top3 = f0 && f1 && f2 ? f0.n + f1.n + f2.n : 0;
        html += '<p class="subtitle">' + E(fam) + " family · " + B.n(l.lemmas) + " entries in the Wiktionary</p>";
        html += '<p><span class="newthought">' + E(l.name) + " took " + B.n(d.fromTotal) + " words</span> from " + d.from.length + " languages " +
          spark(d.from.map(function (r) { return r.n; }), { log: true, w: 2, gap: 1, label: "words taken from each language, from the most to the least" }) +
          ", but most of them from very few: " + E(f0.name) + " alone gave " + B.n(f0.n) + ", and with " + E(f1.name) + " and " + E(f2.name) + " it makes " + pct(top3, d.fromTotal) + " per cent of the whole." +
          sn("The bars are the " + d.from.length + " languages in order, on a logarithmic scale; " + d.from.filter(function (r) { return r.n === 1; }).length + " of them gave a single word.") +
          " Table 1 gives the first " + k + "." +
          sn("Coverage of " + E(l.name) + " in the Wiktionary is " + E(l.coverage) + ": " + Math.round(l.pct) + " per cent of its entries carry an etymology. Words without one cannot be counted.") + "</p>";
        html += table(d.from, k, 1, "The languages " + E(l.name) + " took most words from. Share of all " + B.n(d.fromTotal) + " words taken; Latin includes every period of Latin.", code, "from");
      }
      var g0 = d.to[0], g1 = d.to[1];
      html += "<h2>What " + E(l.name) + " gave</h2>";
      html += "<p>" + (l.target ? "In the other direction, " : "") + E(l.name) + " gave " + B.n(d.toTotal) + " words to " + d.to.length + " of the thirty-three " +
        spark(d.to.map(function (r) { return r.n; }), { log: true, w: 3, gap: 1, label: "words given to each language" }) +
        (g0 ? ". The largest share went to " + E(g0.name) + " (" + B.n(g0.n) + ")" + (g1 ? ", then to " + E(g1.name) + " (" + B.n(g1.n) + ")" : "") : "") + "." +
        (g0 && g0.code === "mt" ? sn("Maltese is a Semitic language with a large Romance vocabulary, much of it from Italian and Sicilian.") : "") + "</p>";
      html += table(d.to, 15, l.target ? 2 : 1, "The languages that took most words from " + E(l.name) + ".", code, "to");
      var lst = x && x.piu_viaggiate ? x.piu_viaggiate.lista || [] : [];
      if (lst.length) {
        html += "<h2>The longest roads</h2><p>Some words reached " + E(l.name) + " after passing through many hands. " +
          lst.slice(0, 6).map(function (w, i) {
            var cat = w.catena || [];
            return '<a href="' + E(B.wordUrl(code, w.parola, w.n_etimologia, cat[0] && cat[0].codice)) + '"><i>' + E(w.parola) + "</i></a>" +
              sn(cat.slice().reverse().map(function (c) { return E(B.nameOf(L, c.codice)) + (c.termine ? " <i>" + E(c.termine) + "</i>" : ""); }).join(" → ") + " → " + E(l.name) + " <i>" + E(w.parola) + "</i>") +
              " passed through " + say(cat.length) + " languages" + (i < 5 ? "; " : ".");
          }).join("") + "</p>";
      }
      done(html);
    }).catch(fail);
  }

  // ============ a word ============
  function tree(T, L) {
    // a horizontal tree: x = step, y = order of the leaves; parents sit at the middle of their children
    var leaves = 0, nodes = [], rowH = 24, colW = 150, maxD = 0;
    (function place(nd) {
      nd.kids.forEach(place);
      if (!nd.kids.length) nd.y = leaves++ * rowH;
      else nd.y = (nd.kids[0].y + nd.kids[nd.kids.length - 1].y) / 2;
      maxD = Math.max(maxD, nd.d); nodes.push(nd);
    })(T.root);
    var H = leaves * rowH + 8, W = (maxD + 1) * colW + 40, p = "", t = "";
    nodes.forEach(function (nd) {
      var x = nd.d * colW;
      nd.kids.forEach(function (k) {
        var kx = k.d * colW;
        p += '<path d="M' + (x + 3) + " " + (nd.y + 10) + " H" + (kx - 14) + " V" + (k.y + 10) + " H" + (kx - 3) + '"/>';
      });
      var script = !B.isLatinScript(nd.word);
      t += '<circle cx="' + x + '" cy="' + (nd.y + 10) + '" r="2.5"/>' +
        '<text x="' + (x + 6) + '" y="' + (nd.y + 6) + '"' + (nd.here ? ' class="here"' : "") + ">" + E(nd.name) + ' <tspan class="it" font-style="' + (script ? "normal" : "italic") + '">' + E(nd.word) + "</tspan></text>";
    });
    return '<svg width="' + W + '" height="' + H + '" viewBox="-4 -6 ' + W + " " + H + '" role="img" aria-label="Tree of the word">' + p + t + "</svg>";
  }
  // on a narrow screen the same tree as an indented outline, each step a thin rule further in
  function outline(T) {
    function li(nd) {
      var sc = !B.isLatinScript(nd.word);
      return "<li" + (nd.here ? ' class="here"' : "") + ">" + E(nd.name) + " " + (sc ? "<bdi>" + E(nd.word) + "</bdi>" : "<i>" + E(nd.word) + "</i>") +
        (nd.kids.length ? "<ul>" + nd.kids.map(li).join("") + "</ul>" : "") + "</li>";
    }
    return '<ul class="outline">' + li(T.root) + "</ul>";
  }
  function word() {
    var lang = B.param("lang") || "it", w = B.param("w") || "caffè", ne = +B.param("n") || 1, from = B.param("from") || "";
    B.word(lang, w, ne, from).then(function (r) {
      var L = r.L, p = r.p;
      if (!p) { el("loading").innerHTML = "<i>" + E(w) + "</i> is not in the data. <a href=\"" + B.wiktUrl(w, B.nameOf(L, lang)) + "\">Wiktionary</a>."; document.body.dataset.ready = "1"; return; }
      document.title = p.parola + " — lexodus (monograph draft)";
      var ch = chapterOf(L, lang), ln = B.nameOf(L, lang);
      el("rhl").textContent = ch ? "Chapter " + ch + " · " + ln + " · " + p.parola : p.parola; el("rhr").textContent = ch ? "page " + (ch * 14 - 4) : "";
      var stops = B.journey(L, lang, p), T = r.tree ? B.fullTree(L, lang, r.tree) : null;
      var route = stops.slice(0, -1).reverse();
      var html = "<h1>" + E(p.parola) + '</h1><p class="subtitle">' + E(ln) + (p.pos ? " " + E(p.pos) : "") + ": " + E(p.significato || "") + "</p>";
      function form(s) { var sc = !B.isLatinScript(s.term); return (sc ? '<bdi class="ar">' + E(s.term) + "</bdi>" : "<i>" + E(s.term) + "</i>") + (s.tr && s.tr !== s.term ? " (" + E(s.tr) + ")" : ""); }
      html += '<p><span class="newthought">The ' + E(ln) + " " + E(p.parola) + "</span> " +
        (route.length ? "was " + E(route[0].how || "taken") + " from " + E(route[0].name) + " " + form(route[0]) +
          route.slice(1).map(function (s) { return ", which had it from " + E(s.name) + " " + form(s); }).join("") + "." : "has no recorded source.") +
        (r.text ? sn("The Wiktionary: “" + E(r.text) + "” <a href=\"" + B.wiktUrl(p.parola, ln) + "\">en.wiktionary.org</a>") : "") +
        (stops.some(function (s) { var x = L.by[B.merged(s.code)]; return !s.here && !(x && x.target); })
          ? sn("Not every language on the way is one of the thirty-three; for those that are not, the book counts the words they gave, not those they took.") : "") + "</p>";
      if (T && T.count) {
        var gens = [];
        (function walk(nd, dep) { nd.kids.forEach(function (k) { gens[dep] = (gens[dep] || 0) + 1; walk(k, dep + 1); }); })(T.me, 0);
        var langsOn = {}; (function walk(nd) { nd.kids.forEach(function (k) { langsOn[k.code] = 1; walk(k); }); })(T.me);
        html += "<p>From " + E(ln) + " the word went on. " + T.count + " words in " + Object.keys(langsOn).length + " languages descend from it " +
          spark(gens, { w: 6, gap: 2, label: "words at each step from " + ln }) + ": " + gens.map(function (g, i) {
            return say(g) + (i === 0 ? " taken straight from " + E(ln) : " at the " + ["", "second", "third", "fourth", "fifth", "sixth"][i] + " step");
          }).join(", ") + "." + sn("The bars count the words at each step away from " + E(ln) + ".") +
          " Figure 1 draws the whole tree, from the first source on the left to the last borrower on the right.</p>";
        html += '<figure class="full"><div class="tree">' + (window.innerWidth < 700 ? outline(T) : tree(T, L)) + "</div>" +
          '<p class="caption"><b>Figure 1.</b> The family of <i>' + E(p.parola) + "</i>: each language with its form of the word; a line joins a word to the words taken from it. Steps run from left to right; the word of this chapter is set in bold.</p></figure>";
      }
      done(html);
    }).catch(fail);
  }

  if (page === "index.html") home(); else if (page === "language.html") language(); else word();
})();
