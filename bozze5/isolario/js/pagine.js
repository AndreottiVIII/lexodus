/* lexodus, draft "isolario" (bozze5): the island plates, generated from the data in SVG.
   Every language is an island, placed by family round the island of the page (Germanic north, Slavic and Baltic
   north-east, Finno-Ugric north, Turkic east, Semitic south-east, Greek, Albanian and Iranian south, Romance west,
   the rest of the world south-west); the coast is drawn from a seeded shape, so an island keeps its outline.
   Size: for the 33 languages, the square root of their lemmas in Wiktionary; the others are small.
   Language page: routes in (black dots) from the islands it took words from, each landing at its own port; the
   legs before (thin dots) from a farthest origin to the island the words passed through; routes out (red) to the
   islands it gave words to. A wind rose whose eight arms are as long as the words exchanged with each quarter.
   Word page: the islands of the word's tree, its road in red, and the portolano of the road leg by leg, where the
   miles are replaced by the number of words that made the same crossing. */
(function () {
  "use strict";
  var app = document.getElementById("app"), page = document.body.getAttribute("data-page");
  var esc = B.esc, n = B.n, r1 = B.r1;
  var INK = "#221b14", PAPER = "#f3ead3", RED = "#a3301c";
  // compass bearing of each family, degrees clockwise from east (y grows downwards)
  var BEARING = { germanic: -95, uralic: -60, baltic: -40, slavic: -20, turkic: 10, semitic: 45, other: 80, world: 130, romance: 180 };

  function fail(e) { app.innerHTML = '<p class="loading">The data could not be read: ' + esc(e && e.message) + "</p>"; if (window.console) console.error(e); }
  function pts(list) { return list.map(function (p) { return r1(p[0]) + "," + r1(p[1]); }).join(" "); }
  function defs() {
    // the sea, cut in rows of small waves
    return '<defs><pattern id="waves" patternUnits="userSpaceOnUse" width="22" height="11">' +
      '<path d="M0 8 q5.5 -6 11 0 q5.5 6 11 0" fill="none" stroke="' + INK + '" stroke-width="0.7"/></pattern>' +
      '<pattern id="hatch" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)"><line x1="0.5" y1="0" x2="0.5" y2="4" stroke="' + INK + '" stroke-width="0.8"/></pattern></defs>';
  }
  function text(x, y, t, o) {
    o = o || {};
    return '<text x="' + r1(x) + '" y="' + r1(y) + '" text-anchor="' + (o.anchor || "middle") + '" font-size="' + (o.size || 16) + '"' +
      (o.italic ? ' font-style="italic"' : "") + (o.bold ? ' font-weight="700"' : "") + (o.fill ? ' style="fill:' + o.fill + '"' : "") + (o.ls ? ' letter-spacing="' + o.ls + '"' : "") +
      ' stroke="' + PAPER + '" stroke-width="5" stroke-linejoin="round" paint-order="stroke">' + t + "</text>";
  }
  // a coast: a closed seeded shape, then two thinner rings outside it, as the woodcutters drew shallow water
  function coast(cx, cy, r, seed) {
    var rnd = B.rng("coast" + seed), ph = [rnd() * 6.28, rnd() * 6.28, rnd() * 6.28, rnd() * 6.28], am = [0.16, 0.1, 0.07, 0.05];
    function shape(scale) {
      var p = [];
      for (var i = 0; i < 64; i++) {
        var t = i / 64 * 2 * Math.PI, k = 1 + am[0] * Math.sin(2 * t + ph[0]) + am[1] * Math.sin(3 * t + ph[1]) + am[2] * Math.sin(5 * t + ph[2]) + am[3] * Math.sin(8 * t + ph[3]);
        p.push([cx + r * scale * k * Math.cos(t), cy + r * scale * k * 0.82 * Math.sin(t)]);
      }
      return p;
    }
    var o = '<polygon points="' + pts(shape(1.16)) + '" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="0.6" stroke-dasharray="2 3"/>' +
      '<polygon points="' + pts(shape(1.07)) + '" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="0.6"/>' +
      '<polygon points="' + pts(shape(1)) + '" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.8"/>';
    // the coast in shadow on the south-east, as lit from the north-west
    var sh = shape(1).filter(function (q, i) { return i > 4 && i < 26; });
    o += '<polyline points="' + pts(sh) + '" fill="none" stroke="' + INK + '" stroke-width="3.2"/>';
    return { svg: o, at: function (ang, scale) {
      var t = ang, k = 1 + am[0] * Math.sin(2 * t + ph[0]) + am[1] * Math.sin(3 * t + ph[1]) + am[2] * Math.sin(5 * t + ph[2]) + am[3] * Math.sin(8 * t + ph[3]);
      return [cx + r * (scale || 1) * k * Math.cos(t), cy + r * (scale || 1) * k * 0.82 * Math.sin(t)];
    } };
  }
  // where the island of a language lies on the plate, round a centre
  function layout(codes, L, cx, cy, ringR, W, H, extra) {
    var byFam = {};
    codes.forEach(function (c) { var f = B.family(c); (byFam[f] = byFam[f] || []).push(c); });
    var pos = {};
    Object.keys(byFam).forEach(function (f) {
      var list = byFam[f].sort(function (a, b) { return B.hash(a) - B.hash(b); });
      list.forEach(function (c, i) {
        var spread = (i - (list.length - 1) / 2) * 17, a = (BEARING[f] + spread) * Math.PI / 180, rr = ringR + (i % 2) * 70;
        var l = L.by[c], size = l && l.lemmas ? 16 + 26 * Math.sqrt(l.lemmas / 1300000) : 14 + 2.2 * Math.log2(((extra || {})[c] || 0) + 1);
        pos[c] = { x: cx + rr * Math.cos(a), y: cy + rr * Math.sin(a) * 0.86, r: Math.min(size, 40), a: a };
      });
    });
    // keep islands apart (the centre stays put)
    var all = Object.keys(pos).map(function (k) { return pos[k]; });
    for (var it = 0; it < 80; it++) for (var i = 0; i < all.length; i++) for (var j = i + 1; j < all.length; j++) {
      var p = all[i], q = all[j], dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy) || 0.1, min = p.r + q.r + 70;
      if (d < min) { var m = (min - d) / 2; p.x -= dx / d * m; p.y -= dy / d * m; q.x += dx / d * m; q.y += dy / d * m; }
      // stay on the plate, with room for the name under the island
      all.forEach(function (z) { z.x = Math.max(z.r + 70, Math.min(W - z.r - 70, z.x)); z.y = Math.max(z.r + 16, Math.min(H - z.r - 44, z.y)); });
    }
    return pos;
  }
  function route(a, b, bend, o) {
    var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
    var c = [mx - dy * bend, my + dx * bend];
    return { d: "M" + r1(a[0]) + " " + r1(a[1]) + " Q" + r1(c[0]) + " " + r1(c[1]) + " " + r1(b[0]) + " " + r1(b[1]), mid: [(a[0] + 2 * c[0] + b[0]) / 4, (a[1] + 2 * c[1] + b[1]) / 4] };
    void o;
  }
  // the wind rose: eight arms, each as long as the words exchanged with the islands in that quarter
  function rose(x, y, sums) {
    var names = ["E", "SE", "S", "SW", "W", "NW", "N", "NE"], max = Math.max.apply(null, sums.concat([1])), o = [];
    o.push('<circle cx="' + x + '" cy="' + y + '" r="20" fill="' + PAPER + '" stroke="' + INK + '"/>');
    sums.forEach(function (v, i) {
      var a = i * Math.PI / 4, len = 26 + 64 * Math.sqrt(v / max), w = 8;
      var tip = [x + len * Math.cos(a), y + len * Math.sin(a)], l1 = [x + w * Math.cos(a - Math.PI / 2), y + w * Math.sin(a - Math.PI / 2)], l2 = [x + w * Math.cos(a + Math.PI / 2), y + w * Math.sin(a + Math.PI / 2)];
      o.push('<polygon points="' + pts([l1, tip, [x, y]]) + '" fill="' + INK + '" stroke="' + INK + '"/>');
      o.push('<polygon points="' + pts([l2, tip, [x, y]]) + '" fill="' + PAPER + '" stroke="' + INK + '"/>');
      o.push(text(x + (len + 13) * Math.cos(a), y + (len + 13) * Math.sin(a) + 5, names[i] + (v ? " " + n(v) : ""), { size: 15, anchor: Math.cos(a) > 0.3 ? "start" : Math.cos(a) < -0.3 ? "end" : "middle" }));
    });
    o.push('<circle cx="' + x + '" cy="' + y + '" r="4" fill="' + RED + '"/>');
    return o.join("");
  }

  // =================== language page ===================
  function plate(D, X, L, code) {
    var W = 736, H = 780, cx = 360, cy = 400, o = [];
    var from = D.from.filter(function (r) { return r.code !== code; }).slice(0, 9);
    var to = D.to.slice(0, 8);
    var far = ((X && X.origini_lontane && X.origini_lontane.lista) || []).filter(function (f) { return f.tipo_lingua === "lingua"; }).slice(0, 8);
    var codes = [];
    function add(c) { c = c === "LATINO" ? "la" : B.merged(c); if (c !== code && codes.indexOf(c) < 0) codes.push(c); }
    from.forEach(function (r) { add(r.code); });
    to.forEach(function (r) { add(r.code); });
    far.forEach(function (f) { add(f.codice); });
    var sizes = {};
    D.from.forEach(function (r) { sizes[B.merged(r.code)] = r.n; });
    far.forEach(function (f) { var c = f.codice === "LATINO" ? "la" : f.codice; sizes[c] = Math.max(sizes[c] || 0, f.n); });
    var pos = layout(codes, L, cx, cy, 245, W, H, sizes);
    o.push('<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="The island plate">' + defs());
    o.push('<rect width="' + W + '" height="' + H + '" fill="' + PAPER + '"/><rect width="' + W + '" height="' + H + '" fill="url(#waves)"/>');
    var mainR = 105, main = coast(cx, cy, mainR, code);
    var routes = [], labels = [];
    // legs before: from a farthest origin to the island its words passed through
    far.forEach(function (f) {
      var fc = f.codice === "LATINO" ? "la" : f.codice;
      (f.strade || []).forEach(function (s) {
        var sc = s.codice === "LATINO" ? "la" : B.merged(s.codice);
        if (sc === fc || s.n < 5 || !pos[sc] || !pos[fc]) return;
        var rt = route([pos[fc].x, pos[fc].y], [pos[sc].x, pos[sc].y], 0.18);
        routes.push('<path d="' + rt.d + '" fill="none" stroke="' + INK + '" stroke-width="1" stroke-dasharray="1 4"/>');
        labels.push(text(rt.mid[0], rt.mid[1] - 4, n(s.n), { size: 15, italic: true }));
      });
    });
    // routes in, each to its own port on the coast
    var ports = [];
    from.forEach(function (r, i) {
      var p = pos[B.merged(r.code)]; if (!p) return;
      var ang = Math.atan2((p.y - cy) / 0.82, p.x - cx), port = main.at(ang, 1), sea = [p.x - (p.x - cx) * p.r / Math.hypot(p.x - cx, p.y - cy), p.y - (p.y - cy) * p.r / Math.hypot(p.x - cx, p.y - cy)];
      var rt = route(sea, port, i % 2 ? 0.12 : -0.12), w = 1 + Math.log2(r.n + 1) * 0.45;
      routes.push('<path d="' + rt.d + '" fill="none" stroke="' + INK + '" stroke-width="' + r1(w) + '" stroke-dasharray="' + r1(w * 1.2) + " " + r1(w * 2.2) + '"/>');
      labels.push(text(rt.mid[0], rt.mid[1] - 5, n(r.n), { size: 16, bold: true }));
      ports.push({ at: port, ang: ang, name: r.name });
    });
    // routes out, red
    to.forEach(function (r, i) {
      var p = pos[B.merged(r.code)]; if (!p) return;
      var ang = Math.atan2((p.y - cy) / 0.82, p.x - cx), port = main.at(ang + 0.12, 1.05);
      var end = [p.x - (p.x - cx) * (p.r + 8) / Math.hypot(p.x - cx, p.y - cy), p.y - (p.y - cy) * (p.r + 8) / Math.hypot(p.x - cx, p.y - cy)];
      var rt = route(port, end, i % 2 ? -0.16 : 0.16), w = 1 + Math.log2(r.n + 1) * 0.45;
      routes.push('<path d="' + rt.d + '" fill="none" stroke="' + RED + '" stroke-width="' + r1(w) + '" stroke-dasharray="' + r1(w * 1.2) + " " + r1(w * 2.2) + '"/>');
      // a small red arrowhead at the arrival
      var dx = end[0] - rt.mid[0], dy = end[1] - rt.mid[1], dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
      routes.push('<polygon points="' + pts([end, [end[0] - dx * 11 - dy * 5, end[1] - dy * 11 + dx * 5], [end[0] - dx * 11 + dy * 5, end[1] - dy * 11 - dx * 5]]) + '" fill="' + RED + '"/>');
      labels.push(text(rt.mid[0], rt.mid[1] + 15, n(r.n), { size: 16, bold: true, fill: RED }));
    });
    o.push(routes.join(""));
    // the islands
    Object.keys(pos).forEach(function (c) { var p = pos[c]; o.push(coast(p.x, p.y, p.r, c).svg); });
    o.push(main.svg);
    // ports: an anchor ring on the coast, the name inside the island
    ports.forEach(function (pt) {
      o.push('<circle cx="' + r1(pt.at[0]) + '" cy="' + r1(pt.at[1]) + '" r="4.5" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.6"/>');
    });
    o.push(labels.join(""));
    Object.keys(pos).forEach(function (c) { var p = pos[c]; o.push(text(p.x, p.y + p.r * 0.82 + 22, esc(B.nameOf(L, c).toUpperCase()), { size: 15, ls: "0.04em" })); });
    o.push(text(cx, cy - 6, esc(D.lang.name.toUpperCase()), { size: 26, bold: true, ls: "0.05em" }));
    o.push(text(cx, cy + 20, n(D.lang.lemmas) + " lemmas", { size: 16, italic: true }));
    // the rose: sums by quarter of all routes drawn
    var sums = [0, 0, 0, 0, 0, 0, 0, 0];
    from.concat(to).forEach(function (r) {
      var p = pos[B.merged(r.code)]; if (!p) return;
      var a = Math.atan2(p.y - cy, p.x - cx), k = ((Math.round(a / (Math.PI / 4)) % 8) + 8) % 8;
      sums[k] += r.n;
    });
    o.push(rose(W - 150, 118, sums));
    o.push("</svg>");
    return o.join("");
  }

  function languagePage(code) {
    Promise.all([B.language(code), B.extra(code), B.langs()]).then(function (res) {
      var D = res[0], X = res[1], L = res[2], l = D.lang;
      document.title = l.name + " — lexodus (isolario draft)";
      var h = ['<div class="sheet">'];
      h.push('<figure class="plate"><div class="box">' + plate(D, X, L, code) + "</div></figure>");
      var t = ['<div class="text"><h1>' + esc(l.name) + '</h1><p class="rub">The island of the ' + esc(l.name) + " tongue, with its harbours and the routes of its words.</p>"];
      t.push('<p class="ini">This island has ' + n(l.lemmas) + " lemmas in Wiktionary, and for " + n(l.withEty) + " of them it is told where they came from. Into its harbours came " +
        n(D.fromTotal) + " words, by ships of " + D.from.length + " languages; from its coast sailed " + n(D.toTotal) + " words to " + D.to.length + " languages.</p>");
      t.push("<h2>Harbours, and the words landed there</h2><ol>" + D.from.slice(0, 9).map(function (r) { return "<li><span>port of " + esc(r.name) + "</span><span>" + n(r.n) + "</span></li>"; }).join("") + "</ol>");
      t.push("<h2>Ships going out</h2><ol>" + D.to.slice(0, 8).map(function (r) { return "<li><span>to " + esc(r.name) + "</span><span>" + n(r.n) + "</span></li>"; }).join("") + "</ol>");
      t.push("</div>");
      h.push(t.join(""));
      h.push('<p class="under">Black dots: the words coming in, one harbour for each island they sailed from. Thin dots: the leg before, from the farthest origin to the island the words passed through. Red: the words going out. The thickness of a route grows with its words; the arms of the rose with the words exchanged in each quarter. The islands are invented and laid out by family; their size follows their lemmas (for the 33 languages) or the words they gave (for the others).</p>');
      h.push("</div>");
      app.innerHTML = h.join("");
    }).catch(fail);
  }

  // =================== word page ===================
  function wordPlate(full, L, road) {
    var W = 736, H = 700, cx = 380, cy = 340, o = [];
    var codes = [];
    (function walk(nd) { var c = B.merged(nd.code); if (c !== full.me.code && codes.indexOf(c) < 0) codes.push(c); nd.kids.forEach(walk); })(full.root);
    var pos = layout(codes, L, cx, cy, 225, W, H, {});
    pos[full.me.code] = { x: cx, y: cy, r: 60 };
    o.push('<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="The islands of the word">' + defs());
    o.push('<rect width="' + W + '" height="' + H + '" fill="' + PAPER + '"/><rect width="' + W + '" height="' + H + '" fill="url(#waves)"/>');
    var onRoad = {};
    for (var i = 1; i < road.length; i++) onRoad[B.merged(road[i - 1].code) + ">" + B.merged(road[i].code)] = 1;
    var seen = {}, routes = [];
    B.edges(full.root).forEach(function (e, k) {
      var a = B.merged(e[0].code), b = B.merged(e[1].code), key = a + ">" + b;
      if (a === b || seen[key] || !pos[a] || !pos[b]) return;
      seen[key] = 1;
      var main = onRoad[key], rt = route([pos[a].x, pos[a].y], [pos[b].x, pos[b].y], k % 2 ? 0.1 : -0.1);
      routes.push('<path d="' + rt.d + '" fill="none" stroke="' + (main ? RED : INK) + '" stroke-width="' + (main ? 3.4 : 1.2) + '" stroke-dasharray="' + (main ? "5 5" : "2 4") + '"/>');
    });
    o.push(routes.join(""));
    Object.keys(pos).forEach(function (c) { var p = pos[c]; o.push(coast(p.x, p.y, p.r, c).svg); });
    // on each island, the word as it is written there
    var words = {};
    (function walk(nd) { var c = B.merged(nd.code), w = B.readable(nd.word, nd.tr); (words[c] = words[c] || []); if (words[c].indexOf(w) < 0) words[c].push(w); nd.kids.forEach(walk); })(full.root);
    Object.keys(pos).forEach(function (c) {
      var p = pos[c], here = c === full.me.code;
      o.push(text(p.x, p.y + (here ? 2 : 5), "<tspan font-style=\"italic\">" + esc(words[c].slice(0, 2).join(", ") + (words[c].length > 2 ? "…" : "")) + "</tspan>", { size: here ? 24 : 16 }));
      o.push(text(p.x, p.y + p.r * 0.82 + 22, esc(B.nameOf(L, c).toUpperCase()), { size: 15, ls: "0.04em", fill: road.some(function (r) { return B.merged(r.code) === c; }) ? RED : INK }));
    });
    o.push("</svg>");
    return o.join("");
  }

  function wordPage() {
    var lang = B.param("lang") || "it", w = B.param("w") || "caffè", ne = +(B.param("n") || 1), from = B.param("from");
    Promise.all([B.word(lang, w, ne, from), B.arcs(), B.level2()]).then(function (res) {
      var R = res[0], arcsList = res[1], L2 = res[2], L = R.L;
      if (!R.tree) throw new Error("No tree for this word.");
      var full = B.fullTree(L, lang, R.tree), road = B.longestRoad(full.root);
      document.title = w + " — lexodus (isolario draft)";
      // the portolano: the legs of the road, with the words that made the same crossing
      var su = R.tree.e.su || [], direct = su[0] ? B.merged(su[0].codice) : null;
      var legs = [];
      for (var i = 1; i < road.length; i++) {
        var a = road[i - 1], b = road[i], ac = B.merged(a.code), bc = B.merged(b.code), cnt = null, how = "";
        var tgt = L.by[bc] && L.by[bc].target;
        if (tgt) { cnt = B.arcCount(arcsList, ac, bc); how = "words " + B.nameOf(L, bc) + " took from " + B.nameOf(L, ac); }
        else if (b.up && direct) {
          // a stop before the word: count the words of this language that came by the same two stops
          var lst = (L2.da_chi_ha_preso[lang + "|" + bc] || []).filter(function (x) { return B.merged(x.codice) === ac; })[0];
          if (lst) { cnt = lst.n; how = B.nameOf(L, lang) + " words that came by " + B.nameOf(L, bc) + " from " + B.nameOf(L, ac); }
        }
        legs.push({ a: a, b: b, n: cnt, how: how });
      }
      var h = ['<div class="sheet">'];
      h.push('<figure class="plate"><div class="box">' + wordPlate(full, L, road) + "</div></figure>");
      h.push('<div class="text"><h1>' + esc(w) + '</h1><p class="rub">How the word sailed, and to which islands it was carried after.</p>' +
        '<p class="ini">' + esc(full.me.mean) + ". Its road, in red on the plate, touches " + road.length + " islands; " + n(full.count) + " words in other languages descend from it.</p>" +
        (R.text ? "<p><i>“" + esc(R.text) + "”</i></p>" : "") + "</div>");
      h.push('<section class="port"><h2>Portolano <span>of ' + esc(w) + "</span></h2><table><tr><th>leg</th><th>from</th><th>to</th><th>how</th><th class=\"n\">words on the same crossing</th></tr>" +
        legs.map(function (g, i) {
          return "<tr><td>" + (i + 1) + "</td><td>" + esc(g.a.name) + " <i>" + esc(B.readable(g.a.word, g.a.tr)) + "</i></td><td>" + esc(g.b.name) + " <i>" + esc(B.readable(g.b.word, g.b.tr)) + "</i></td><td>" + esc(g.b.how || "") +
            '</td><td class="n">' + (g.n === null ? "—" : n(g.n)) + (g.how ? "<br><small>" + esc(g.how) + "</small>" : "") + "</td></tr>";
        }).join("") + "</table></section>");
      h.push('<p class="under">Instead of miles, each leg gives the number of words that made the same crossing. Black dots: the other routes of the tree. The islands are invented and laid out by family.</p>');
      h.push("</div>");
      app.innerHTML = h.join("");
    }).catch(fail);
  }

  if (page === "language") languagePage(B.param("code") || "it");
  else wordPage();
})();
