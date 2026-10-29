/* lexodus, draft "risografia" (a two-colour riso fanzine): spreads of two pages, cut-out titles, typed lists with
   dot leaders, a halftone table on the cover, page numbers written by hand (stroked SVG, not a font). */
(function () {
  "use strict";
  var B = window.B;
  function el(id) { return document.getElementById(id); }
  var page = document.body.dataset.page;
  function fail(e) { el("loading").textContent = "the drum jammed: the data could not be loaded (" + e.message + ")."; console.error(e); }
  function done(html) { el("app").innerHTML = html; el("loading").hidden = true; el("app").hidden = false; document.body.dataset.ready = "1"; }
  var E = B.esc;

  // ---- hand-written digits: one stroke path each, in a 10 x 14 box ----
  var DIG = {
    0: "M5 1 C1 1 1 13 5 13 C9 13 9 1 5 1",
    1: "M2.5 3.5 L6 1 L6 13.2",
    2: "M1.5 4 C2 0 9 0 8.5 4.5 C8 7 3 10 1.5 13 L9 12.8",
    3: "M1.5 2.2 C4 0 9 1 7.5 4.5 C6.8 6.2 4 6.8 4 6.8 C9 7 9.5 12 5 13 C3 13.4 1.6 12.6 1 11.6",
    4: "M7 13.2 L7 1 L1 9.5 L9.6 9.3",
    5: "M8.6 1 L2.6 1.2 L2 6.2 C5 4.6 9 6 8.8 9.5 C8.5 13 3.5 14 1.5 11.6",
    6: "M7.6 1.4 C3 1 1 6 1.5 9.5 C2 13.5 8.5 13.5 8.5 9.5 C8.5 6 3 6 1.8 9",
    7: "M1 1.6 L9 1 L4 13.2",
    8: "M5 7 C1 5.5 1.5 1 5 1 C8.5 1 9 5.5 5 7 C0.5 8.5 1.5 13 5 13 C8.5 13 9.5 8.5 5 7",
    9: "M8.2 5 C7 8 1.5 7.5 1.5 4.5 C1.5 0.5 8.5 0.5 8.5 4.5 L7.6 13.2"
  };
  function rnd(seed) { var s = seed * 9301 + 49297; return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
  function hand(num, seed) {
    var r = rnd(seed), d = String(num).split(""), w = d.length * 17 + 4, g = "";
    d.forEach(function (c, i) {
      var rot = (r() - 0.5) * 18, dy = (r() - 0.5) * 5, sc = 1.7 + (r() - 0.5) * 0.15;
      g += '<path transform="translate(' + (2 + i * 17) + "," + (3 + dy).toFixed(1) + ") rotate(" + rot.toFixed(1) + " 5 7) scale(" + sc.toFixed(2) + ' 1.7)" d="' + DIG[c] + '"/>';
    });
    return '<svg width="' + (w + 6) + '" height="32" viewBox="0 0 ' + (w + 6) + ' 32" role="img" aria-label="page ' + num + '">' + g + "</svg>";
  }
  function folio(n) { return '<span class="folio">' + hand(n, n * 7 + 3) + "</span>"; }
  function reg(left) { var l = left ? " l" : ""; return '<span class="reg' + l + '" aria-hidden="true"><i></i></span><span class="reg p' + l + '" aria-hidden="true"><i></i></span>'; }
  function pg(n, inner, regLeft) { return '<section class="pg">' + reg(regLeft) + inner + folio(n) + "</section>"; }
  function spread(a, b) { return '<div class="spread">' + a + b + "</div>"; }
  function mis(tag, cls, text) { return "<" + tag + ' class="mis ' + cls + '" data-t="' + E(text) + '">' + E(text) + "</" + tag + ">"; }
  function cut(text, cls) { return '<h2 class="cut' + (cls ? " " + cls : "") + '">' + E(text) + "</h2>"; }
  // a typed line with a dot leader, W characters wide
  function lead(name, num, W, href) {
    var dots = Math.max(2, W - name.length - num.length - 2);
    var nm = name.length > W - num.length - 4 ? name.slice(0, W - num.length - 5) + "." : name;
    dots = Math.max(2, W - nm.length - num.length - 2);
    return (href ? '<a href="' + E(href) + '">' + E(nm) + "</a>" : E(nm)) + " " + new Array(dots + 1).join(".") + " " + num;
  }
  // every language has six pages: four for itself, two for one of its words
  function folioOf(L, code) {
    var order = L.list.slice().sort(function (a, b) { return a.name.localeCompare(b.name, "en"); }).map(function (x) { return x.code; });
    var i = order.indexOf(B.merged(code));
    return i < 0 ? 201 : 3 + i * 6;
  }
  function rows(list, max, code, dir, k) {
    return '<div class="rows">' + list.slice(0, k).map(function (r) {
      var nm = r.target || r.code === "la" ? '<a href="' + B.langUrl(r.code) + '">' + E(r.name.toLowerCase()) + "</a>" : E(r.name.toLowerCase());
      return '<span class="nm">' + nm + '</span><span class="bar" style="width:' + Math.max(0.6, 100 * r.n / max).toFixed(2) + '%"></span><span class="v">' + B.n(r.n) + "</span>";
    }).join("") + "</div>";
  }
  function copy(list, W) {
    return '<div class="copy">' + list.map(function (r) {
      return lead(r.name.toLowerCase(), B.n(r.n), W, r.target || r.code === "la" ? B.langUrl(r.code) : "");
    }).join("\n") + "</div>";
  }

  // ============ cover ============
  function size(v) { return v >= 10000 ? 5 : v >= 1000 ? 4 : v >= 100 ? 3 : v >= 10 ? 2 : v >= 1 ? 1 : 0; }
  function home() {
    B.grid().then(function (G) {
      var rows33 = G.rows.slice().sort(function (a, b) { return a.name.localeCompare(b.name, "en"); });
      var cols = rows33.map(function (r) { return r.code; }).concat(["LATINO", "altre"]);
      var index = rows33.map(function (l, i) { return lead(l.name.toLowerCase(), "p." + (3 + i * 6), 26, B.langUrl(l.code)); }).join("\n");
      var left = '<p class="kicker">issue 4 · borrowed words</p>' + mis("h1", "mega cover", "lexodus") +
        '<p class="typed">Thirty-three languages, and the words they took from each other, read out of the etymologies of the English Wiktionary. Every language has its page; the numbers are counts of words.</p>' +
        cut("in this issue") + '<div class="copy">' + index + "</div>";
      var ht = '<div class="ht" role="img" aria-label="Halftone table: dots for the words each of the 33 languages took from the others"><span class="r"></span>' +
        cols.map(function () { return "<span></span>"; }).join("");
      rows33.forEach(function (r) {
        var me = r.code === "it", line = G.one[r.code] || {};
        ht += '<span class="r' + (me ? " me" : "") + '">' + E(r.code) + "</span>" + cols.map(function (c) {
          var s = c === r.code ? 0 : size(line[c] || 0);
          return '<span class="c' + (me ? " me" : "") + '">' + (s ? '<i class="d' + s + '"></i>' : "") + "</span>";
        }).join("");
      });
      ht += "</div>";
      var px = [3, 5, 8, 11, 14];
      var right = cut("who took from whom", "r") +
        '<p class="typed">One line per language, one column per source (the same 33 in the same order, then Latin, then the rest). The bigger the dot, the more words. The blue line is Italian.</p>' + ht +
        '<p class="dotkey">' + ["1–9", "10–99", "100–999", "1,000–9,999", "10,000+"].map(function (t, i) {
          return '<span><i style="width:' + px[i] + "px;height:" + px[i] + 'px"></i>' + t + "</span>";
        }).join("") + "</p>";
      done(spread(pg(1, left), pg(2, right)));
    }).catch(fail);
  }

  // ============ the language ============
  function language() {
    var code = B.param("code") || "it";
    Promise.all([B.language(code), B.langs()]).then(function (res) {
      var d = res[0], l = d.lang, L = res[1];
      document.title = l.name + " — lexodus (riso zine draft)";
      var base = folioOf(L, code);
      var fam = (B.FAM_BY_ID[l.fam] || {}).name || "";
      var p1 = '<p class="kicker">language · ' + E(code) + "</p>" + mis("h1", "mega", l.name.toLowerCase()) +
        (l.target ? '<p class="typed">' + E(fam) + " family. " + B.n(l.lemmas) + " entries in the Wiktionary, " + Math.round(l.pct) + "% of them with an etymology. Coverage: " + E(l.coverage) + ".</p>" : "") +
        (l.target ? '<p class="typed">' + mis("span", "big", B.n(d.fromTotal)) + "<br>words came in from " + d.from.length + " languages.</p>" : "") +
        '<p class="typed">' + mis("span", "big", B.n(d.toTotal)) + "<br>words went out to " + d.to.length + " of the 33.</p>";
      var p2 = "", p3 = "", p4 = "";
      if (l.target) {
        p2 = cut("came in from") + rows(d.from, d.from[0] ? d.from[0].n : 1, code, "from", 14) +
          (d.from.length > 14 ? '<p class="typed">and the other ' + (d.from.length - 14) + ":</p>" + copy(d.from.slice(14), 25) : "");
      }
      p3 = cut("went out to", "r") + rows(d.to, d.to[0] ? d.to[0].n : 1, code, "to", 14) +
        (d.to.length > 14 ? '<p class="typed">and the other ' + (d.to.length - 14) + ":</p>" + copy(d.to.slice(14), 25) : "");
      var html = l.target ? spread(pg(base, p1), pg(base + 1, p2)) : spread(pg(base, p1), pg(base + 1, p3));
      if (!l.target) return done(html);
      return B.extra(code).then(function (x) {
        var lst = x && x.piu_viaggiate ? x.piu_viaggiate.lista || [] : [];
        p4 = cut("the long way round") + '<p class="typed">The words that changed hands most often before they got here. Farthest first.</p>' +
          lst.map(function (w) {
            var cat = w.catena || [];
            return '<p class="typed"><a href="' + E(B.wordUrl(code, w.parola, w.n_etimologia, cat[0] && cat[0].codice)) + '"><b>' + E(w.parola) + "</b></a> (" + cat.length + " hands): " +
              cat.slice().reverse().map(function (c) { return E(B.nameOf(L, c.codice).toLowerCase()); }).join(" &gt; ") + "</p>";
          }).join("");
        done(html + spread(pg(base + 2, p3, true), pg(base + 3, p4, true)));
      });
    }).catch(fail);
  }

  // ============ the word ============
  function word() {
    var lang = B.param("lang") || "it", w = B.param("w") || "caffè", ne = +B.param("n") || 1, from = B.param("from") || "";
    B.word(lang, w, ne, from).then(function (r) {
      var L = r.L, p = r.p;
      if (!p) { el("loading").innerHTML = "“" + E(w) + "” is not in this issue. <a href=\"" + B.wiktUrl(w, B.nameOf(L, lang)) + "\">Wiktionary</a>"; document.body.dataset.ready = "1"; return; }
      document.title = p.parola + " — lexodus (riso zine draft)";
      var stops = B.journey(L, lang, p), T = r.tree ? B.fullTree(L, lang, r.tree) : null;
      var arrow = '<svg class="arrow" viewBox="0 0 40 39" aria-hidden="true"><path d="M14 2 C11 14 13 26 15 36 M7 28 L15 36 L22 27"/></svg>';
      var route = '<div class="route">' + stops.map(function (s, i) {
        var t = (s.term && !B.isLatinScript(s.term) ? '<bdi class="ar">' + E(s.term) + "</bdi> " : "") + (s.tr ? E(s.tr) : B.isLatinScript(s.term) && !s.here ? E(s.term) : "");
        return (i ? arrow : "") + '<div class="stop"><span class="cut' + (i % 2 ? " r" : "") + (s.here ? "" : " w") + '">' + E(s.name.toLowerCase()) + '</span><span class="t">' + t + (stops[i + 1] ? " <i>(" + E(stops[i].how) + ")</i>" : "") + "</span></div>";
      }).join("") + "</div>";
      var left = '<p class="kicker">word · ' + E(B.nameOf(L, lang).toLowerCase()) + (p.pos ? " · " + E(p.pos) : "") + "</p>" + mis("h1", "mega", p.parola) +
        '<p class="typed">' + E(p.significato || "") + ".</p>" + cut("how it got here") + route;
      var tree = "";
      if (T && T.count) {
        var lines = [];
        (function walk(kids, pre) {
          kids.forEach(function (k, i) {
            var last = i === kids.length - 1;
            lines.push(E(pre + (last ? "`-- " : "|-- ")) + E(k.name.toLowerCase()) + ' <a href="' + E(B.wordUrl(k.code, k.word, k.ne, k.parent)) + '">' + E(k.word) + "</a>" + (k.tr ? " " + E(k.tr) : ""));
            walk(k.kids, pre + (last ? "    " : "|   "));
          });
        })(T.me.kids, "");
        tree = cut("passed on: " + T.count, "r") + '<pre class="tree">' + E(p.parola) + "\n" + lines.join("\n") + "</pre>";
      }
      var right = cut("what the wiktionary says") + '<p class="box">“' + E(r.text || "—") + '”<br><a href="' + B.wiktUrl(p.parola, B.nameOf(L, lang)) + '">en.wiktionary.org</a></p>' + tree;
      var f = folioOf(L, lang) + 4;
      done(spread(pg(f, left), pg(f + 1, right)));
    }).catch(fail);
  }

  if (page === "index.html") home(); else if (page === "language.html") language(); else word();
})();
