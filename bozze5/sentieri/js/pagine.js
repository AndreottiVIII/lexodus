/* lexodus, draft "sentieri" (bozze5): the garden plans, generated from the data in SVG.
   The plan is drawn on a grid of 26 px cells: hedges are the ground (dark green), paths are cut through them (lime
   and gravel), corners are square, as in a clipped garden seen from above.
   Language page: six gates on the west, one for each of the languages it took most words from, six on the east for
   those it gave most to; each path turns once and reaches the court in the middle (the language) without crossing
   another. Where two paths of the same gate part and meet again, the pair is a doublet (data/doppioni: two words of
   the language from the same ancestor by different roads). Where a path splits in two along its way down, the words
   have two proposed origins in the same language; a dotted line between two gates is a fork between two languages
   (data/coppie/<lang>/_alternative.json). Discarded hypotheses (dead ends) are not in the data of the site.
   Word page: the labyrinth of one word, drawn as a comb: from the gate of its farthest origin through the clearings of
   each stop to the word, then a corridor for every word that took it, generation after generation. */
(function () {
  "use strict";
  var app = document.getElementById("app"), page = document.body.getAttribute("data-page");
  var esc = B.esc, n = B.n, r1 = B.r1;
  var GREEN = "#1d3b26", LIME = "#f4f1e6", INK = "#121a14", LEAF = "#2e5437";
  var U = 26;

  function fail(e) { app.innerHTML = '<p class="loading">The data could not be read: ' + esc(e && e.message) + "</p>"; if (window.console) console.error(e); }
  function defs() {
    return "<defs>" +
      // the hedge: clipped leaves, short strokes in two greens
      '<pattern id="hedge" patternUnits="userSpaceOnUse" width="9" height="9"><rect width="9" height="9" fill="' + GREEN + '"/>' +
      '<path d="M1 3 l2 -2 M5 8 l2 -2 M6 2 l1 2 M1 7 l1 1" stroke="' + LEAF + '" stroke-width="1.3"/></pattern>' +
      // gravel: sparse dots on lime
      '<pattern id="gravel" patternUnits="userSpaceOnUse" width="7" height="7"><rect width="7" height="7" fill="' + LIME + '"/>' +
      '<circle cx="2" cy="2" r="0.7" fill="#8f8a78"/><circle cx="5.5" cy="5" r="0.6" fill="#8f8a78"/></pattern></defs>';
  }
  // a path cut through the hedge: the clipped edge in dark ink, then the gravel
  function path(points, w, extra) {
    var pp = points.map(function (p) { return r1(p[0]) + "," + r1(p[1]); }).join(" "), ww = w || 18;
    return '<polyline points="' + pp + '" fill="none" stroke="' + INK + '" stroke-width="' + (ww + 3) + '" stroke-linecap="square" stroke-linejoin="miter"/>' +
      '<polyline points="' + pp + '" fill="none" stroke="url(#gravel)" stroke-width="' + ww + '" stroke-linecap="square" stroke-linejoin="miter"' + (extra || "") + "/>";
  }
  function text(x, y, t, o) {
    o = o || {};
    return '<text x="' + r1(x) + '" y="' + r1(y) + '" text-anchor="' + (o.anchor || "start") + '" font-size="' + (o.size || 16) + '"' +
      (o.italic ? ' font-style="italic"' : "") + (o.bold ? ' font-weight="700"' : "") + (o.fill ? ' style="fill:' + o.fill + '"' : "") + ">" + t + "</text>";
  }
  function marker(x, y, num) {
    return '<rect x="' + r1(x - 11) + '" y="' + r1(y - 11) + '" width="22" height="22" fill="' + LIME + '" stroke="' + INK + '" stroke-width="1.4"/>' +
      text(x, y + 5.5, String(num), { anchor: "middle", size: 15, bold: true });
  }

  // =================== language page ===================
  function garden(D, alts, dbl) {
    var COLS = 32, ROWS = 27, X0 = 150, W = 1120, H = ROWS * U + 4, o = [], key = [];
    function P(c, r) { return [X0 + (c + 0.5) * U, (r + 0.5) * U + 2]; }
    o.push('<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Garden plan">' + defs());
    o.push('<rect x="' + X0 + '" y="2" width="' + COLS * U + '" height="' + ROWS * U + '" fill="url(#hedge)"/>');
    var westRows = [1, 5, 9, 25, 21, 17], drops = [10, 8, 6, 10, 8, 6], entries = [6, 8, 10, 20, 18, 16];
    var west = D.from.slice(0, 6), east = D.to.slice(0, 6), lanes = [];
    function lane(rowsSide, k, mirror) {
      var c = function (x) { return mirror ? COLS - 1 - x : x; };
      var g = rowsSide[k], d = drops[k], e = entries[k];
      return { gate: P(c(0), g), pts: [P(c(-0.5), g), P(c(d), g), P(c(d), e), P(c(13), e)], g: g, d: d, e: e, up: k < 3, mirror: mirror, c: c };
    }
    west.forEach(function (r, k) { var l = lane(westRows, k, false); l.row = r; lanes.push(l); });
    east.forEach(function (r, k) { var l = lane(westRows, k, true); l.row = r; lanes.push(l); });
    var paths = [], marks = [], num = 0;
    lanes.forEach(function (l) { paths.push(path(l.pts)); });
    // the court: the language itself
    var c0 = P(13, 6), c1 = P(18, 20);
    paths.push('<rect x="' + r1(c0[0] - U / 2 + 4) + '" y="' + r1(c0[1] - U / 2 + 4) + '" width="' + (6 * U - 8) + '" height="' + (15 * U - 8) + '" fill="url(#gravel)" stroke="' + INK + '" stroke-width="1.5"/>');
    var fc = [(c0[0] + c1[0]) / 2, (c0[1] + c1[1]) / 2];
    paths.push('<circle cx="' + r1(fc[0]) + '" cy="' + r1(fc[1]) + '" r="44" fill="none" stroke="' + INK + '" stroke-width="1.4"/><circle cx="' + r1(fc[0]) + '" cy="' + r1(fc[1]) + '" r="36" fill="none" stroke="' + INK + '" stroke-width="0.8"/>');
    // doublets: a loop beside the gate path of the language they come from
    var westByCode = {};
    lanes.forEach(function (l) { if (!l.mirror) westByCode[B.merged(l.row.code)] = l; });
    dbl.forEach(function (g) {
      var l = westByCode[g.code];
      if (!l) { key.push({ n: null, t: g.n + " doublets from " + g.name + " (no gate of its own on this plan): " + g.ex }); return; }
      var s = l.up ? 1 : -1, r = l.g;
      var pts = [P(1, r), P(1, r + s * 2), P(4, r + s * 2), P(4, r)];
      paths.push(path(pts));
      num++;
      var mk = P(2.5, r + s * 2);
      marks.push(marker(mk[0], mk[1], num));
      key.push({ n: num, t: "<b>" + n(g.n) + "</b> pairs of doublets from " + esc(g.name) + ": two paths that part and meet again (e.g. " + g.ex + ")" });
    });
    // forks within one language: the path splits on its way down and joins again
    var forks2 = [];
    alts.forEach(function (a) {
      if (a.langs.length === 1) {
        var l = westByCode[a.langs[0]];
        if (!l) return;
        var s = l.up ? 1 : -1, cc = l.d + 2, ra = l.g + s, rb = l.g + s * 3;
        if (Math.abs(l.e - l.g) < 4) { cc = l.d - 2; }
        paths.push(path([P(l.d, ra), P(cc, ra), P(cc, rb), P(l.d, rb)]));
        num++;
        var mk = P(cc, (ra + rb) / 2);
        marks.push(marker(mk[0], mk[1], num));
        key.push({ n: num, t: "<b>" + n(a.n) + "</b> words with two proposed origins, both in " + esc(a.label) + ": the path splits and joins again (e.g. " + esc(a.ex) + ")" });
      } else forks2.push(a);
    });
    // forks between languages: a dotted line between two gates
    forks2.forEach(function (a, i) {
      var la = westByCode[a.langs[0]], lb = westByCode[a.langs[1]];
      if (!la || !lb || a.langs.length > 2) { key.push({ n: null, t: n(a.n) + " words at a fork between " + esc(a.label) + " (e.g. " + esc(a.ex) + ")" }); return; }
      var ca = 2 + (i % 2), pa = P(ca, la.g), pb = P(ca, lb.g);
      marks.push('<line x1="' + r1(pa[0]) + '" y1="' + r1(pa[1]) + '" x2="' + r1(pb[0] + 0) + '" y2="' + r1(pb[1]) + '" stroke="' + LIME + '" stroke-width="3" stroke-dasharray="3 5"/>');
      num++;
      var mk = [(pa[0] + pb[0]) / 2 + 2, (pa[1] + pb[1]) / 2];
      marks.push(marker(mk[0], mk[1], num));
      key.push({ n: num, t: "<b>" + n(a.n) + "</b> words at a fork between " + esc(a.label) + " (e.g. " + esc(a.ex) + ")" });
    });
    o.push(paths.join(""), marks.join(""));
    // the names of the gates, outside the hedge
    lanes.forEach(function (l) {
      var gp = l.gate, x = l.mirror ? X0 + COLS * U + 22 : X0 - 22;
      o.push(text(x, gp[1] - 2, esc(l.row.name), { anchor: l.mirror ? "start" : "end", size: 17, bold: true }));
      o.push(text(x, gp[1] + 17, n(l.row.n) + (l.mirror ? " given" : " taken"), { anchor: l.mirror ? "start" : "end", size: 15, italic: true }));
    });
    o.push(text(fc[0], fc[1] - 4, esc(D.lang.name), { anchor: "middle", size: 20, italic: true }));
    o.push(text(fc[0], fc[1] + 70, "the court", { anchor: "middle", size: 15, italic: true }));
    o.push(text(X0, H - 0, "", {}));
    o.push("</svg>");
    return { svg: o.join(""), key: key };
  }

  function languagePage(code) {
    Promise.all([B.language(code), B.alternatives(code), B.doublets(code)]).then(function (res) {
      var D = res[0], ALT = res[1], DB = res[2], l = D.lang;
      // forks: group the uncertain words by the set of languages proposed
      var groups = {};
      (ALT.parole || []).forEach(function (w) {
        var cs = [], names = [];
        (w.alternative || []).forEach(function (a) { var c = B.merged(a.codice); if (cs.indexOf(c) < 0) { cs.push(c); names.push(B.isLatin(a.codice) ? "Latin" : a.nome); } });
        var k = cs.slice().sort().join("|"), g = groups[k] || (groups[k] = { langs: cs.slice().sort(), label: names.slice().sort().join(" and "), n: 0, ex: w.parola });
        g.n++;
        if (w.parola.length < g.ex.length && /^[a-zà-ù]+$/.test(w.parola)) g.ex = w.parola;
      });
      var alts = Object.keys(groups).map(function (k) { return groups[k]; }).sort(function (a, b) { return b.n - a.n; }).slice(0, 5);
      // doublets: group by the common origin (Latin merged)
      var dg = {};
      (DB.coppie || []).forEach(function (p) {
        var oc = p.origine_comune; if (!oc) return;
        var c = B.merged(oc.codice), g = dg[c] || (dg[c] = { code: c, name: B.isLatin(oc.codice) ? "Latin" : oc.nome_en, n: 0, ex: "" });
        g.n++;
        if (!g.ex) g.ex = "<i>" + esc(p.a.parola) + "</i> and <i>" + esc(p.b.parola) + "</i>";
      });
      var dbl = Object.keys(dg).map(function (k) { return dg[k]; }).sort(function (a, b) { return b.n - a.n; }).slice(0, 4);
      var G = garden(D, alts, dbl);
      document.title = l.name + " — lexodus (Borges garden draft)";
      var h = ['<div class="sheet">'];
      h.push('<div class="title"><p class="over">The garden of forking paths of</p><h1>' + esc(l.name) + "</h1></div>");
      h.push('<div class="lede"><p>Words came in by ' + D.from.length + " gates and went out by " + D.to.length + "; here the six widest on each side. " +
        n((ALT.parole || []).length) + " words stand at a fork, because Wiktionary proposes more than one origin; " + n((DB.coppie || []).length) + " pairs are doublets, two roads from one ancestor.</p></div>");
      h.push('<figure class="plan"><div class="box">' + G.svg + "</div></figure>");
      h.push('<div class="key"><section><h2>Key to the plan</h2><ol>' + G.key.map(function (k) { return "<li><span>" + (k.n || "·") + "</span><span>" + k.t + "</span></li>"; }).join("") + "</ol></section>" +
        '<section class="r"><h2>What is not drawn</h2><p>Dead ends. A dead end would be an origin that Wiktionary proposes and then rejects (“not from Arabic, as once thought”); the site’s data keep only the hypotheses it accepts, so there are none to draw.</p></section></div>');
      h.push("</div>");
      app.innerHTML = h.join("");
    }).catch(fail);
  }

  // =================== word page ===================
  function labyrinth(full) {
    var root = full.root, leaves = 0, maxD = 0;
    (function walk(nd) { maxD = Math.max(maxD, nd.d); if (!nd.kids.length) nd.leafRow = leaves++; nd.kids.forEach(walk); })(root);
    (function rows(nd) { if (nd.kids.length) { nd.kids.forEach(rows); nd.row = nd.kids[0].row; } else nd.row = nd.leafRow; })(root);
    var COLW = 7, ROWH = 2, X0 = 20, W = 1120;
    var colU = Math.min(U, Math.floor((W - X0 - 130) / ((maxD + 1) * COLW)));
    var H = (leaves * ROWH + 1) * U + 18;
    function P(c, r) { return [X0 + c * colU + colU / 2, (r * ROWH + 1) * U + 8]; }
    var o = ['<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="The labyrinth of the word">' + defs()];
    o.push('<rect width="' + W + '" height="' + H + '" fill="url(#hedge)"/>');
    var paths = [], road = [], labels = [], clearings = [];
    (function walk(nd) {
      var a = P(nd.d * COLW, nd.row);
      nd.kids.forEach(function (k) {
        var b = P(k.d * COLW, k.row), mid = P(nd.d * COLW + 2, nd.row);
        var pts = [a, mid, [mid[0], b[1]], b];
        paths.push(path(pts, 20));
        if (k.up || k.here) road.push(pts);
        walk(k);
      });
      // a clearing at every word, wide enough for its name
      var t = B.readable(nd.word, nd.tr), wdt = Math.max(t.length * 8.6, nd.name.length * 7.6) + 20;
      clearings.push('<rect x="' + r1(a[0] - 12) + '" y="' + r1(a[1] - 23) + '" width="' + r1(wdt) + '" height="46" fill="url(#gravel)" stroke="' + INK + '" stroke-width="1.5"/>');
      labels.push(text(a[0] - 2, a[1] - 3, esc(t), { size: nd.here ? 19 : 17, italic: true, bold: !!nd.here }));
      labels.push(text(a[0] - 2, a[1] + 16, esc(nd.name), { size: 15 }));
    })(root);
    // the entrance, from the west edge to the farthest origin
    var r0 = P(0, root.row);
    paths.unshift(path([[0, r0[1]], r0], 20));
    road.unshift([[0, r0[1]], r0]);
    o.push(paths.join(""));
    road.forEach(function (pts) { o.push('<polyline points="' + pts.map(function (p) { return r1(p[0]) + "," + r1(p[1]); }).join(" ") + '" fill="none" stroke="' + INK + '" stroke-width="3" stroke-dasharray="7 5"/>'); });
    o.push(clearings.join(""));
    o.push(labels.join(""));
    o.push("</svg>");
    return o.join("");
  }

  function wordPage() {
    var lang = B.param("lang") || "it", w = B.param("w") || "caffè", ne = +(B.param("n") || 1), from = B.param("from");
    Promise.all([B.word(lang, w, ne, from), B.alternatives(lang)]).then(function (res) {
      var R = res[0], ALT = res[1], L = R.L;
      if (!R.tree) throw new Error("No tree for this word.");
      var full = B.fullTree(L, lang, R.tree);
      var alt = (ALT.parole || []).filter(function (x) { return x.parola === w && +x.n_etimologia === ne; })[0];
      var su = R.tree.e.su || [];
      document.title = w + " — lexodus (Borges garden draft)";
      var h = ['<div class="sheet">'];
      h.push('<div class="title"><p class="over">The labyrinth of</p><h1>' + esc(w) + "</h1></div>");
      h.push('<div class="lede"><p>' + esc(full.me.mean) + ". " + (alt ? "Wiktionary proposes " + alt.alternative.length + " origins: the path forks at the gate." :
        "One gate only: Wiktionary proposes a single road, so there is no fork before the word.") + " After it, " + n(full.count) + " words in other languages, each at the end of its own path.</p>" +
        (R.text ? "<p><i>“" + esc(R.text) + "”</i></p>" : "") + "</div>");
      h.push('<figure class="plan"><div class="box">' + labyrinth(full) + "</div></figure>");
      h.push('<p class="note">The dashed line is the road of ' + esc(w) + ": from the gate of " + esc(su.length ? su[su.length - 1].nome : "") + " through " +
        su.slice(0, -1).reverse().map(function (s) { return esc(s.nome); }).concat([esc(L.by[lang].name)]).join(", then ") +
        ". Every other path leads to a word that took it, and stops there: none of them leads back.</p>");
      h.push("</div>");
      app.innerHTML = h.join("");
    }).catch(fail);
  }

  if (page === "language") languagePage(B.param("code") || "it");
  else wordPage();
})();
