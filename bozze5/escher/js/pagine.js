/* lexodus, draft "escher" (bozze5): the drawings, generated from the data in SVG.
   Language page: Plate I "Relativity" (the language is a block; on each of its three faces a different gravity:
   took from / gave to / farthest origins; one staircase per language, one step for every doubling of words) and
   Plate II "Ascending and descending" (the words that left and came back, each one a closed Penrose staircase).
   Word page: Plate I "Metamorphosis" (the written word turning, letter by letter, into the next language's word along
   the longest road of its tree), Plate II the rest of the tree as a tessellation, Plate III "Drawing hands" (two
   languages of the tree that each gave words to the other). Black and white only; tone is hatching. */
(function () {
  "use strict";
  var app = document.getElementById("app"), page = document.body.getAttribute("data-page");
  var esc = B.esc, n = B.n, r1 = B.r1;
  var C30 = Math.cos(Math.PI / 6);
  var INK = "#111";

  function fail(e) {
    app.innerHTML = '<p class="loading">The data could not be read: ' + esc(e && e.message) + "</p>";
    if (window.console) console.error(e);
  }
  function pts(list) { return list.map(function (p) { return r1(p[0]) + "," + r1(p[1]); }).join(" "); }
  function steps(v) { return Math.max(1, Math.ceil(Math.log2(v + 1))); }

  // ---- hatching: tone only with lines ----
  function hatch(id, gap, ang, w) {
    return '<pattern id="' + id + '" patternUnits="userSpaceOnUse" width="' + gap + '" height="' + gap + '" patternTransform="rotate(' + ang + ')">' +
      '<rect width="' + gap + '" height="' + gap + '" fill="#fff"/><line x1="0.5" y1="0" x2="0.5" y2="' + gap + '" stroke="' + INK + '" stroke-width="' + w + '"/></pattern>';
  }
  function cross(id, gap, ang, w) {
    return '<pattern id="' + id + '" patternUnits="userSpaceOnUse" width="' + gap + '" height="' + gap + '" patternTransform="rotate(' + ang + ')">' +
      '<rect width="' + gap + '" height="' + gap + '" fill="#fff"/><line x1="0.5" y1="0" x2="0.5" y2="' + gap + '" stroke="' + INK + '" stroke-width="' + w + '"/>' +
      '<line x1="0" y1="0.5" x2="' + gap + '" y2="0.5" stroke="' + INK + '" stroke-width="' + w + '"/></pattern>';
  }
  function defs(p) {
    return "<defs>" + hatch(p + "dk", 3, 60, 1.25) + hatch(p + "md", 4.4, -60, 0.9) + hatch(p + "lt", 6, 0, 0.6) +
      cross(p + "xx", 3.6, 45, 0.9) + hatch(p + "vl", 5, 90, 0.7) + "</defs>";
  }
  // a label that stays readable over hatching: white halo under black letters
  function label(x, y, txt, o) {
    o = o || {};
    return '<text x="' + r1(x) + '" y="' + r1(y) + '" text-anchor="' + (o.anchor || "start") + '" font-size="' + (o.size || 17) + '"' +
      (o.italic ? ' font-style="italic"' : "") + (o.cls ? ' class="' + o.cls + '"' : "") +
      ' stroke="#fff" stroke-width="5" stroke-linejoin="round" paint-order="stroke">' + txt + "</text>";
  }

  // =================== language page ===================
  // isometric projection; the view axis is (1,1,1), so x+y+z is the depth
  function projector(ox, oy) {
    return function (p) { return [ox + (p[0] - p[1]) * C30, oy + (p[0] + p[1]) * 0.5 - p[2]]; };
  }
  // the three gravities are the three cyclic turns of the axes
  function toWorld(g, p) { return g === 0 ? p : g === 1 ? [p[2], p[0], p[1]] : [p[1], p[2], p[0]]; }
  var SHADE_OF = [{ x: "dk", y: "md", z: "w" }, { x: "md", y: "w", z: "dk" }, { x: "w", y: "dk", z: "md" }];

  function boxFaces(b) {
    var x0 = b[0], x1 = b[1], y0 = b[2], y1 = b[3], z0 = b[4], z1 = b[5];
    return [
      { ax: "z", p: [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]] },
      { ax: "x", p: [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]] },
      { ax: "y", p: [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]] }
    ];
  }
  function drawBox(P, g, b, pre) {
    return boxFaces(b).map(function (f) {
      var shade = SHADE_OF[g][f.ax];
      var fill = shade === "w" ? "#fff" : "url(#" + pre + shade + ")";
      return '<polygon points="' + pts(f.p.map(function (q) { return P(toWorld(g, q)); })) + '" fill="' + fill + '" stroke="' + INK + '" stroke-width="1" stroke-linejoin="miter"/>';
    }).join("");
  }

  // place labels so that they do not cover one another: push each one away along y until it is free
  function placeLabels(list) {
    var placed = [];
    list.forEach(function (lb) {
      var wdt = lb.text.length * 9.6 + 8, tries = 0;
      function box() { var x0 = lb.anchor === "start" ? lb.x : lb.anchor === "end" ? lb.x - wdt : lb.x - wdt / 2; return [x0, lb.y - 15, x0 + wdt, lb.y + 5]; }
      while (tries++ < 40 && placed.some(function (q) { var a = box(), b = q.b; return a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1]; })) lb.y += lb.dir * 6;
      lb.b = box();
      placed.push(lb);
    });
    return list;
  }
  function relativity(groups) {
    var S = 205, d = 11, h = 11, w = 19, gap = 22, W = 736, pre = "rel";
    var P = projector(0, 0), body = [], all = [];
    function box(g, b) {
      boxFaces(b).forEach(function (f) { f.p.forEach(function (q) { all.push(P(toWorld(g, q))); }); });
      return drawBox(P, g, b, pre);
    }
    body.push(box(0, [0, S, 0, S, 0, S]));
    var labels = [], center = P([S / 2, S / 2, S / 2]);
    var NUM = ["I", "II", "III"];
    groups.forEach(function (gr) {
      gr.rows.forEach(function (row, j) {
        var k = steps(row.n), y0 = gap / 2 + j * (w + gap);
        for (var i = k - 1; i >= 0; i--) body.push(box(gr.g, [S - (i + 1) * d, S - i * d, y0, y0 + w, S, S + (i + 1) * h]));
        var top = P(toWorld(gr.g, [S - (k - 0.5) * d, y0 + w / 2, S + k * h]));
        var dx = top[0] - center[0], dy = top[1] - center[1], len = Math.hypot(dx, dy) || 1;
        var anchor = Math.abs(dx) < 40 ? "middle" : dx > 0 ? "start" : "end";
        labels.push({ ax: top[0], ay: top[1], x: top[0] + dx / len * 22 + (anchor === "start" ? 4 : anchor === "end" ? -4 : 0), y: top[1] + dy / len * 22 + (dy > 0 ? 12 : -2),
          anchor: anchor, dir: dy > 0 ? 1 : -1, text: row.name + " " + n(row.n), html: '<tspan font-style="italic">' + esc(row.name) + "</tspan> " + n(row.n) });
      });
    });
    placeLabels(labels);
    labels.forEach(function (lb) { all.push([lb.b[0], lb.b[1]]); all.push([lb.b[2], lb.b[3]]); });
    // the numbers of the gravities, on the free strip of each face
    var nums = groups.map(function (gr) { var m = P(toWorld(gr.g, [S * 0.92, S * 0.5, S])); return label(m[0], m[1] + 10, NUM[gr.g], { anchor: "middle", size: 30 }); });
    var minX = Math.min.apply(null, all.map(function (p) { return p[0]; })), maxX = Math.max.apply(null, all.map(function (p) { return p[0]; }));
    var minY = Math.min.apply(null, all.map(function (p) { return p[1]; })), maxY = Math.max.apply(null, all.map(function (p) { return p[1]; }));
    var tx = (W - (maxX - minX)) / 2 - minX, ty = 8 - minY, H = Math.ceil(maxY - minY + 16);
    var out = ['<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Relativity: a block with staircases in three gravities">', defs(pre),
      '<g transform="translate(' + r1(tx) + " " + r1(ty) + ')">', body.join(""), nums.join("")];
    labels.forEach(function (lb) {
      out.push('<line x1="' + r1(lb.ax) + '" y1="' + r1(lb.ay) + '" x2="' + r1(lb.x) + '" y2="' + r1(lb.y + (lb.dir > 0 ? -13 : 3)) + '" stroke="' + INK + '" stroke-width="0.8"/>');
      out.push(label(lb.x, lb.y, lb.html, { anchor: lb.anchor, size: 17 }));
    });
    out.push("</g></svg>");
    return out.join("");
  }

  // ---- Penrose stairs: a ring of 12 steps that climbs for ever ----
  // Four flights of 4, 4, 2 and 2 steps; every step is one rise higher than the last. In an isometric view a rise of
  // r looks like moving back by r along both ground axes, so with a rise of one sixth of a step the two long flights
  // coming forward and the two short ones going back close the ring on the page, although in space they cannot.
  function penrose(stops, idx) {
    var k = 30, r = k / 6, D = 30, W = 357, pre = "pr" + idx;
    var sides = [[1, 0, 4], [0, 1, 4], [-1, 0, 2], [0, -1, 2]], cells = [], u = 0, v = 0, i = 0;
    sides.forEach(function (sd) { for (var t = 0; t < sd[2]; t++) { cells.push({ u: u, v: v, z: i * r, i: i }); u += sd[0]; v += sd[1]; i++; } });
    var N = cells.length;
    function P(q, z) { return [(q[0] - q[1]) * C30 * k, (q[0] + q[1]) * 0.5 * k - z]; }
    var flights = stops.length - 1, per = [];
    for (var f = 0; f < flights; f++) per.push(Math.floor(N * (f + 1) / flights) - Math.floor(N * f / flights));
    var flightOf = [], ff = 0, cnt = 0;
    cells.forEach(function () { flightOf.push(ff); cnt++; if (cnt >= per[ff]) { ff++; cnt = 0; } });
    var polys = cells.map(function (c) {
      var x0 = c.u, y0 = c.v, x1 = x0 + 1, y1 = y0 + 1, z = c.z;
      var top = [P([x0, y0], z), P([x1, y0], z), P([x1, y1], z), P([x0, y1], z)];
      function down(p) { return [p[0], p[1] + D]; }
      return { c: c, top: top, fx: [top[1], top[2], down(top[2]), down(top[1])], fy: [top[3], top[2], down(top[2]), down(top[3])], cy: (top[0][1] + top[2][1]) / 2 };
    });
    // painter's order: what is higher on the page is farther away
    var order = polys.slice().sort(function (a, b) { return a.cy - b.cy; });
    var all = []; polys.forEach(function (p) { all = all.concat(p.top, p.fx, p.fy); });
    var minX = Math.min.apply(null, all.map(function (p) { return p[0]; })), maxX = Math.max.apply(null, all.map(function (p) { return p[0]; }));
    var minY = Math.min.apply(null, all.map(function (p) { return p[1]; })), maxY = Math.max.apply(null, all.map(function (p) { return p[1]; }));
    var tx = (W - (maxX - minX)) / 2 - minX, ty = 34 - minY, H = Math.ceil(maxY - minY + 68);
    var out = ['<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="A closed staircase">', defs(pre), '<g transform="translate(' + r1(tx) + " " + r1(ty) + ')">'];
    order.forEach(function (p) {
      out.push('<polygon points="' + pts(p.fx) + '" fill="url(#' + pre + 'dk)" stroke="' + INK + '"/>');
      out.push('<polygon points="' + pts(p.fy) + '" fill="url(#' + pre + 'md)" stroke="' + INK + '"/>');
      var first = p.c.i === 0 || flightOf[p.c.i] !== flightOf[p.c.i - 1];
      out.push('<polygon points="' + pts(p.top) + '" fill="' + (first ? "url(#" + pre + "lt)" : "#fff") + '" stroke="' + INK + '"' + (first ? ' stroke-width="2"' : "") + "/>");
    });
    // numbers of the flights, outside the ring, at the middle of each flight
    var start = 0, cx = (minX + maxX) / 2, cyy = (minY + maxY) / 2;
    per.forEach(function (kk, fi) {
      var p = polys[start + Math.floor(kk / 2)], pc = [(p.top[0][0] + p.top[2][0]) / 2, p.cy];
      var dx = pc[0] - cx, dy = pc[1] - cyy, len = Math.hypot(dx, dy) || 1;
      out.push(label(pc[0] + dx / len * 50, pc[1] + dy / len * 44 + 7, String(fi + 1), { anchor: "middle", size: 21 }));
      start += kk;
    });
    out.push("</g></svg>");
    return out.join("");
  }
  function loopStops(w) {
    var cat = w.catena || [], p = w.partenza || {}, idx = -1;
    for (var i = cat.length - 1; i >= 0; i--) if (cat[i].codice === p.codice && (cat[i].termine || "") === (p.termine || "")) { idx = i; break; }
    if (idx < 0) for (var j = 0; j < cat.length; j++) if (cat[j].codice === p.codice) { idx = j; break; }
    var stops = [];
    for (var k = idx; k >= 0; k--) stops.push({ name: cat[k].nome, word: B.readable(cat[k].termine, cat[k].traslitterazione) });
    stops.push({ name: "Italian", word: w.parola, here: true });
    return stops;
  }

  function languagePage(code) {
    Promise.all([B.language(code), B.extra(code), B.roundtrips(code)]).then(function (res) {
      var D = res[0], X = res[1], RT = res[2], l = D.lang;
      var far = ((X && X.origini_lontane && X.origini_lontane.lista) || []).filter(function (o) { return o.tipo_lingua === "lingua"; })
        .map(function (o) { return { code: o.codice, name: o.codice === "LATINO" ? "Latin" : o.nome_en, n: o.n }; });
      var groups = [
        { g: 0, rows: D.from.slice(0, 6) },
        { g: 1, rows: D.to.slice(0, 6) },
        { g: 2, rows: far.slice(0, 6) }
      ];
      document.title = l.name + " — lexodus (Escher draft)";
      var trips = (RT.parole || []);
      var h = [];
      h.push('<div class="sheet">');
      h.push('<div class="title"><h1>' + esc(l.name) + ' <i>in three gravities</i></h1></div>');
      h.push('<div class="lede"><p>' + esc(l.name) + " took <b>" + n(D.fromTotal) + "</b> words from " + D.from.length + " languages and gave <b>" + n(D.toTotal) +
        "</b> to " + D.to.length + ". " + trips.length + " of its words went abroad and came back.</p><p>Each staircase is a language; it has one step for every doubling of the words: " +
        "1 step for 1 word, 13 steps for 4,096 or more.</p></div>");
      h.push('<figure class="plate rel"><div class="cap"><span class="no">Plate I</span><h2>Relativity</h2></div><div class="box">' + relativity(groups) + "</div>" +
        '<p class="note">The block is ' + esc(l.name) + ". I, on top: the languages it took words from, standing upright. II, on the right face: the languages it gave words to, standing sideways. III, on the left face: the farthest origins of its words. What is a floor for one gravity is a wall for the other two. The step that starts a flight of the closed staircases is hatched.</p></figure>");
      // Plate II: Penrose stairs
      var shown = trips.slice(0, 3);
      var pen = ['<figure class="plate pen"><div class="cap"><span class="no">Plate II</span><h2>Ascending and descending</h2></div>',
        "<p>A word that leaves " + esc(l.name) + " and comes back walks a staircase that ends where it began. Here the " + shown.length + " longest of the " + trips.length + ".</p>"];
      shown.forEach(function (w, i) {
        var st = loopStops(w);
        pen.push('<div class="box">' + penrose(st, i) + "</div>");
        pen.push('<p class="note"><b class="quote">' + esc(w.parola) + "</b>, " + esc(w.significato || "") + ": " +
          st.map(function (s, k) { return (k ? "<span>" + k + "</span> " : "start: ") + "<i>" + esc(s.word) + "</i> (" + esc(s.name) + ")"; }).join(" → ") + ".</p>");
      });
      pen.push("</figure>");
      h.push(pen.join(""));
      // the rest of the round trips, and the three gravities in numbers
      var rest = trips.slice(shown.length).map(function (w) {
        var st = loopStops(w);
        return "<li><b>" + esc(w.parola) + "</b>: " + st.map(function (s) { return esc(s.word) + " <span class=\"sc\">" + esc(s.name) + "</span>"; }).join(" → ") + "</li>";
      });
      h.push('<section class="plate wide"><div class="cap"><span class="no">Plate II, continued</span><h2>The other ' + rest.length + " closed staircases</h2></div><ul class=\"list\">" + rest.join("") + "</ul></section>");
      function table(title, rows) {
        return '<section class="plate ' + title[0] + '"><div class="cap"><span class="no">' + title[1] + "</span><h2>" + title[2] + '</h2></div><table class="tbl"><tr><th>language</th><th>steps</th><th class="n">words</th></tr>' +
          rows.slice(0, 12).map(function (r) { return "<tr><td>" + esc(r.name) + "</td><td>" + steps(r.n) + '</td><td class="n">' + n(r.n) + "</td></tr>"; }).join("") + "</table></section>";
      }
      h.push(table(["half", "Gravity I", "What it took, first 12"], D.from));
      h.push(table(["half2", "Gravity II", "What it gave, first 12"], D.to));
      h.push("</div>");
      app.innerHTML = h.join("");
    }).catch(fail);
  }

  // =================== word page ===================
  // edit script between two written forms: the intermediate forms, one change at a time
  function morphs(a, b) {
    var A = Array.from(a), Bc = Array.from(b), m = A.length, k = Bc.length, Dm = [];
    for (var i = 0; i <= m; i++) { Dm.push([]); for (var j = 0; j <= k; j++) Dm[i].push(i === 0 ? j : j === 0 ? i : 0); }
    for (i = 1; i <= m; i++) for (j = 1; j <= k; j++)
      Dm[i][j] = Math.min(Dm[i - 1][j] + 1, Dm[i][j - 1] + 1, Dm[i - 1][j - 1] + (A[i - 1] === Bc[j - 1] ? 0 : 1));
    var ops = [];
    i = m; j = k;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && Dm[i][j] === Dm[i - 1][j - 1] + (A[i - 1] === Bc[j - 1] ? 0 : 1)) { if (A[i - 1] !== Bc[j - 1]) ops.push({ t: "s", i: i - 1, c: Bc[j - 1] }); i--; j--; }
      else if (i > 0 && Dm[i][j] === Dm[i - 1][j] + 1) { ops.push({ t: "d", i: i - 1 }); i--; }
      else { ops.push({ t: "i", i: i, c: Bc[j - 1] }); j--; }
    }
    ops.reverse();
    // apply from left to right on a working copy, keeping track of the shift
    var cur = A.slice(), shift = 0, out = [];
    ops.forEach(function (o) {
      var at = o.i + shift;
      if (o.t === "s") cur[at] = o.c;
      else if (o.t === "d") { cur.splice(at, 1); shift--; at = Math.min(at, cur.length - 1); }
      else { cur.splice(at, 0, o.c); shift++; }
      out.push({ s: cur.join(""), at: at, del: o.t === "d" });
    });
    return out;
  }
  function stageCell(x, y, w, h, st, pre) {
    var o = ['<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="url(#' + pre + 'vl)" stroke="' + INK + '" stroke-width="1.5"/>'];
    o.push('<rect x="' + (x + 12) + '" y="' + (y + 30) + '" width="' + (w - 24) + '" height="' + (h - 60) + '" fill="#fff" stroke="' + INK + '"/>');
    var big = st.word, rd = B.readable(st.word, st.tr);
    var fs = Math.min(40, Math.floor((w - 36) / Math.max(3, Array.from(big).length) * 1.7));
    o.push('<text x="' + (x + w / 2) + '" y="' + (y + h / 2 - (rd !== big ? 6 : -8)) + '" text-anchor="middle" font-size="' + Math.max(22, fs) + '"' + (B.isLatinScript(big) ? ' font-style="italic"' : ' style="font-family:serif"') + ">" + esc(big) + "</text>");
    if (rd !== big) o.push('<text x="' + (x + w / 2) + '" y="' + (y + h / 2 + 26) + '" text-anchor="middle" font-size="19" font-style="italic">' + esc(rd) + "</text>");
    o.push('<text x="' + (x + w / 2) + '" y="' + (y + h - 40) + '" text-anchor="middle" font-size="17" class="scx">' + esc(st.name) + "</text>");
    if (st.here) o.push('<text x="' + (x + w / 2) + '" y="' + (y + 21) + '" text-anchor="middle" font-size="16" class="scx" stroke="#fff" stroke-width="5" paint-order="stroke">this word</text>');
    return o.join("");
  }
  // the band between two stages: the intermediate forms stacked, their borders turning from straight to toothed
  function band(x, y, w, h, list, pre, seed) {
    var o = [], m = list.length, th = h / m;
    function edge(yy, amp, teeth) {
      var p = [];
      for (var t = 0; t <= teeth * 2; t++) p.push([x + w * t / (teeth * 2), yy + (t % 2 ? amp : -amp)]);
      return p;
    }
    for (var k = 0; k < m; k++) {
      var ampTop = k === 0 ? 0 : 4 + 8 * k / m, ampBot = k === m - 1 ? 0 : 4 + 8 * (k + 1) / m, teeth = 3 + k;
      var top = k === 0 ? [[x, y], [x + w, y]] : edge(y + k * th, ampTop, 2 + k);
      var bot = k === m - 1 ? [[x, y + h], [x + w, y + h]] : edge(y + (k + 1) * th, ampBot, 3 + k);
      var poly = top.concat(bot.slice().reverse());
      var dark = (k + seed) % 2 === 0;
      o.push('<polygon points="' + pts(poly) + '" fill="' + (dark ? INK : "#fff") + '" stroke="' + INK + '" stroke-width="1.2"/>');
      var s = Array.from(list[k].s), at = list[k].at, cy = y + k * th + th / 2 + 6;
      var spans = s.map(function (ch, ci) { return ci === at && !list[k].del ? '<tspan text-decoration="underline">' + esc(ch) + "</tspan>" : esc(ch); }).join("");
      o.push('<text x="' + (x + w / 2) + '" y="' + r1(cy) + '" text-anchor="middle" font-size="18" font-style="italic" fill="' + (dark ? "#fff" : INK) + '" style="fill:' + (dark ? "#fff" : INK) + '">' + spans + "</text>");
      void teeth;
    }
    return o.join("");
  }
  function metamorphosis(road) {
    var W = 1120, cellW = 160, H = 210, pre = "mt";
    var rows = [];
    for (var s = 0; s < road.length - 1; s += 3) rows.push(road.slice(s, Math.min(s + 4, road.length)));
    return rows.map(function (row, ri) {
      var gaps = row.length - 1, gw = gaps ? (W - row.length * cellW) / gaps : 0;
      var o = ['<svg width="' + W + '" height="' + (H + 2) + '" viewBox="0 0 ' + W + " " + (H + 2) + '" role="img" aria-label="Metamorphosis of the word">', defs(pre + ri)];
      row.forEach(function (st, i) {
        var x = i * (cellW + gw);
        o.push(stageCell(x + 1, 1, cellW - 2, H - 2, st, pre + ri));
        if (i < row.length - 1) {
          var a = B.readable(st.word, st.tr), b = B.readable(row[i + 1].word, row[i + 1].tr);
          var list = morphs(a, b);
          if (!list.length) list = [{ s: b, at: -1 }];
          o.push(band(x + cellW, 31, gw, H - 62, list, pre + ri, i));
          o.push('<line x1="' + (x + cellW) + '" y1="31" x2="' + (x + cellW + gw) + '" y2="31" stroke="' + INK + '" stroke-width="1.2"/>');
          o.push(label(x + cellW + gw / 2, 21, esc(row[i + 1].how || "") , { anchor: "middle", size: 16, italic: true }));
        }
      });
      o.push("</svg>");
      return '<div class="box">' + o.join("") + "</div>";
    }).join("");
  }
  // the rest of the tree: one interlocking tile per word, a row for each generation
  function tessellation(full, onRoad) {
    var gens = [];
    (function walk(nd, g) { if (g > 0) { (gens[g - 1] = gens[g - 1] || []).push(nd); } nd.kids.forEach(function (k) { walk(k, g + 1); }); })(full.me, 0);
    var W = 1120, tw = 140, th = 74, per = Math.floor(W / tw), out = [], y = 0, pre = "ts";
    var rows = [];
    gens.forEach(function (list, gi) {
      for (var s = 0; s < list.length; s += per) rows.push({ g: gi + 1, list: list.slice(s, s + per), first: s === 0 });
    });
    var H = 32;
    rows.forEach(function (row, ri) { H += th + (rows[ri + 1] && rows[ri + 1].first ? 30 : 4); });
    out.push('<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="The words that took caffè, generation by generation">' + defs(pre));
    rows.forEach(function (row, ri) {
      if (row.first) out.push('<text x="0" y="' + (y + 20) + '" font-size="17" class="scx">generation ' + row.g + " · " + gens[row.g - 1].length + (gens[row.g - 1].length === 1 ? " word" : " words") + "</text>");
      var ty = y + 28;
      row.list.forEach(function (nd, i) {
        var x = i * tw, a = 7;
        // left and right sides interlock: a notch out on the right, a notch in on the left
        var poly = [[x, ty], [x + tw, ty], [x + tw, ty + th / 2 - 10], [x + tw + a, ty + th / 2], [x + tw, ty + th / 2 + 10], [x + tw, ty + th], [x, ty + th],
          [x, ty + th / 2 + 10], [x + a, ty + th / 2], [x, ty + th / 2 - 10]];
        var dark = (i + ri) % 2 === 0, on = onRoad.indexOf(nd) >= 0;
        out.push('<polygon points="' + pts(poly) + '" fill="' + (on ? "url(#" + pre + "xx)" : dark ? INK : "#fff") + '" stroke="' + INK + '" stroke-width="1.2"/>');
        var col = on ? INK : dark ? "#fff" : INK, word = B.readable(nd.word, nd.tr);
        var fs = word.length > 13 ? 15 : 18;
        out.push('<text x="' + (x + tw / 2) + '" y="' + (ty + 30) + '" text-anchor="middle" font-size="' + fs + '" font-style="italic" style="fill:' + col + '"' + (on ? ' stroke="#fff" stroke-width="5" paint-order="stroke"' : "") + ">" + esc(word) + "</text>");
        out.push('<text x="' + (x + tw / 2) + '" y="' + (ty + 54) + '" text-anchor="middle" font-size="15" class="scx" style="fill:' + col + '"' + (on ? ' stroke="#fff" stroke-width="5" paint-order="stroke"' : "") + ">" + esc(nd.name) + "</text>");
      });
      y += th + (rows[ri + 1] && rows[ri + 1].first ? 30 : 4) + (row.first ? 0 : 0);
    });
    out.push("</svg>");
    return out.join("");
  }
  // Drawing hands: two spirals of words, each ending at the centre of the other
  function hands(pair, arcsList) {
    var W = 1120, H = 430, cA = [330, 215], cB = [790, 215];
    function spiral(c, dir, rot) {
      var p = [], turns = 2.4, r0 = 26, r1v = 175;
      for (var t = 0; t <= 1.0001; t += 0.01) {
        var th = rot + dir * t * turns * 2 * Math.PI, r = r0 + (r1v - r0) * t;
        p.push([c[0] + r * Math.cos(th), c[1] + r * Math.sin(th)]);
      }
      return p;
    }
    var sA = spiral(cA, 1, Math.PI), sB = spiral(cB, -1, 0);
    // the path starts at the centre of the other spiral (the hand that draws), sweeps out and winds in to its own centre
    function pathD(p, startAt) {
      var first = p[0];
      return "M" + r1(startAt[0]) + " " + r1(startAt[1]) + " Q" + r1((first[0] + startAt[0]) / 2) + " " + r1(first[1] < H / 2 ? 0 : H) + " " + r1(first[0]) + " " + r1(first[1]) +
        " L" + p.map(function (q) { return r1(q[0]) + " " + r1(q[1]); }).join(" L");
    }
    function examples(from, to) {
      var ex = [];
      arcsList.forEach(function (a) {
        if (B.LOAN.indexOf(a.categoria) >= 0 && B.merged(a.origine) === from && B.merged(a.arrivo) === to) (a.esempi || []).forEach(function (w) { if (ex.indexOf(w) < 0) ex.push(w); });
      });
      return ex;
    }
    var exAB = examples(pair.a.code, pair.b.code), exBA = examples(pair.b.code, pair.a.code);
    var tA = pair.b.name + " took " + n(pair.ab) + " words from " + pair.a.name + ": " + exAB.join(" · ") + " · ";
    var tB = pair.a.name + " took " + n(pair.ba) + " words from " + pair.b.name + ": " + exBA.join(" · ") + " · ";
    // the spiral path is read from the outside in: reverse it so the text starts at the outer end
    var dA = pathD(sA.slice().reverse(), cB), dB = pathD(sB.slice().reverse(), cA);
    var o = ['<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Drawing hands">', defs("dh")];
    o.push('<path id="dhA" d="' + dA + '" fill="none" stroke="' + INK + '" stroke-width="0.6"/>');
    o.push('<path id="dhB" d="' + dB + '" fill="none" stroke="' + INK + '" stroke-width="0.6"/>');
    // each hand: a hatched cuff at the outer end, a nib at the inner end touching the other's centre
    [[cA, "dhxx"], [cB, "dhdk"]].forEach(function (z) {
      var nib = z[0];
      o.push('<polygon points="' + pts([[nib[0] - 10, nib[1] - 26], [nib[0] + 10, nib[1] - 26], [nib[0], nib[1]]]) + '" fill="url(#' + z[1] + ')" stroke="' + INK + '"/>');
    });
    o.push('<text font-size="18"><textPath href="#dhA" startOffset="0">' + esc(tA + tA) + "</textPath></text>");
    o.push('<text font-size="18" font-style="italic"><textPath href="#dhB" startOffset="0">' + esc(tB + tB) + "</textPath></text>");
    o.push(label(cA[0], 22, esc(pair.a.name), { anchor: "middle", size: 22, cls: "scx" }));
    o.push(label(cB[0], 22, esc(pair.b.name), { anchor: "middle", size: 22, cls: "scx" }));
    o.push("</svg>");
    return o.join("");
  }

  function wordPage() {
    var lang = B.param("lang") || "it", w = B.param("w") || "caffè", ne = +(B.param("n") || 1), from = B.param("from");
    Promise.all([B.word(lang, w, ne, from), B.arcs()]).then(function (res) {
      var R = res[0], arcsList = res[1], L = R.L;
      if (!R.tree) throw new Error("No tree for this word.");
      var full = B.fullTree(L, lang, R.tree);
      var road = B.longestRoad(full.root);
      document.title = w + " — lexodus (Escher draft)";
      var stages = road.map(function (nd) { return { word: nd.word, tr: nd.tr, name: nd.name, how: nd.how, here: !!nd.here, code: nd.code }; });
      // reciprocity: pairs of languages joined in the tree where each gave words to the other
      var seen = {}, rec = [];
      B.edges(full.root).forEach(function (e) {
        var a = B.merged(e[0].code), b = B.merged(e[1].code), k = [a, b].sort().join("|");
        if (a === b || seen[k]) return;
        seen[k] = 1;
        var ab = B.arcCount(arcsList, a, b), ba = B.arcCount(arcsList, b, a);
        if (ab > 0 && ba > 0) rec.push({ a: { code: a, name: B.nameOf(L, a) }, b: { code: b, name: B.nameOf(L, b) }, ab: ab, ba: ba });
      });
      rec.sort(function (x, y) { return Math.min(y.ab, y.ba) - Math.min(x.ab, x.ba); });
      var p = R.p || {}, h = [];
      h.push('<div class="sheet">');
      h.push('<div class="title"><h1>' + esc(w) + " <i>a metamorphosis</i></h1></div>");
      h.push('<div class="lede"><p>' + esc(full.me.mean || p.significato || "") + ". " + esc(L.by[lang] ? L.by[lang].name : lang) + " word; its tree has " + n(full.count) +
        " words in other languages after it. The longest road runs through " + road.length + " languages.</p>" +
        (R.text ? '<p class="quote">“' + esc(R.text) + "” (Wiktionary)</p>" : "") + "</div>");
      h.push('<figure class="plate wide"><div class="cap"><span class="no">Plate I</span><h2>Metamorphosis: ' + stages.map(function (s) { return esc(B.readable(s.word, s.tr)); }).join(" → ") + "</h2></div>" +
        metamorphosis(stages) + '<p class="note">Between two languages the written word changes one letter at a time (the changed letter is underlined; a removed one leaves no mark). The forms in between are not words of any language: they only show the distance from one to the next.</p></figure>');
      h.push('<figure class="plate wide"><div class="cap"><span class="no">Plate II</span><h2>The whole tree after ' + esc(w) + ", generation by generation</h2></div><div class=\"box\">" +
        tessellation(full, road) + '</div><p class="note">The cross-hatched tiles are the ones on the road of Plate I.</p></figure>');
      if (rec.length) {
        var best = rec[0];
        h.push('<figure class="plate wide"><div class="cap"><span class="no">Plate III</span><h2>Drawing hands: ' + esc(best.a.name) + " and " + esc(best.b.name) + "</h2></div>" +
          "<p>On the road of " + esc(w) + ", " + esc(best.a.name) + " gave a word to " + esc(best.b.name) + "; but " + esc(best.b.name) + " had also given " + n(best.ba) +
          " words to " + esc(best.a.name) + ", and " + esc(best.a.name) + " " + n(best.ab) + " to " + esc(best.b.name) + ". Each draws the other.</p><div class=\"box\">" + hands(best, arcsList) + "</div>" +
          '<table class="tbl"><tr><th>pair in this tree</th><th class="n">first gave the second</th><th class="n">second gave the first</th></tr>' +
          rec.map(function (r) { return "<tr><td>" + esc(r.a.name) + " · " + esc(r.b.name) + '</td><td class="n">' + n(r.ab) + '</td><td class="n">' + n(r.ba) + "</td></tr>"; }).join("") + "</table></figure>");
      }
      h.push("</div>");
      app.innerHTML = h.join("");
    }).catch(fail);
  }

  if (page === "language") languagePage(B.param("code") || "it");
  else wordPage();
})();
