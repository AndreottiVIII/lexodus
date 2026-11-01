/* lexodus, draft "limite-cerchio-v2" (bozze6, second version: plain tiles, large names; see the drawing section).
   First version: M. C. Escher's "Circle Limit IV" (1960), drawn in SVG from the data.
   Geometry: the hyperbolic plane in Poincaré's disc. The tile is a kite of the {6,4} tiling: the centre C of a
   hexagon (angle 60°, six figures meet there with their feet), the middles M1, M2 of two of its sides (angle 90°,
   four wing tips) and the corner V between them (angle 90°, four heads). Every other kite is the first one reflected
   in its sides again and again (reflections in the diameters and in the circles at right angles to the rim), so its
   size in the disc is the true hyperbolic size, not a guess: the figures shrink towards the rim because the plane
   is drawn that way. Kites reached by an even number of reflections are angels (white), the others devils (black);
   the angel is the kite with its sides bent (the devils are what is left between the angels).
   The disc is then moved (a Möbius map) so that the centre of one angel is the centre of the page: that figure is
   Italian (or the word), cross-hatched.
   Language page: angels are the languages Italian took from (first ring: the five largest; going out, the
   languages they had those words from, then the farthest origins and the proto-languages of the same road), devils
   those it gave to (first ring: the five largest; going out, the languages that had Italian words through them).
   Word page: the road of the word (angels) from the centre out, and the words that took it (devils), generation
   after generation, each one placed beyond the one it came from. */
(function () {
  "use strict";
  var app = document.getElementById("app"), page = document.body.getAttribute("data-page");
  var esc = B.esc, n = B.n, r1 = B.r1;
  var INK = "#111", PAPER = "#fff";

  function fail(e) {
    app.innerHTML = '<p class="loading">The data could not be read: ' + esc(e && e.message) + "</p>";
    if (window.console) console.error(e);
  }

  // ================= complex numbers and the disc =================
  function cx(a, b) { return [a, b]; }
  function add(a, b) { return [a[0] + b[0], a[1] + b[1]]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1]]; }
  function mul(a, b) { return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]; }
  function div(a, b) { var d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; }
  function conj(a) { return [a[0], -a[1]]; }
  function polar(r, t) { return [r * Math.cos(t), r * Math.sin(t)]; }
  function abs(a) { return Math.hypot(a[0], a[1]); }
  // a mirror is a diameter (angle th) or a circle at right angles to the rim (centre c, radius rho)
  function reflect(m, z) {
    if (m.line) { var e = polar(1, 2 * m.th); return mul(e, conj(z)); }
    var d = sub(z, m.c), dd = d[0] * d[0] + d[1] * d[1];
    return [m.c[0] + m.rho * m.rho * d[0] / dd, m.c[1] + m.rho * m.rho * d[1] / dd];
  }
  // the Möbius map that takes a to the centre, and its inverse
  function toCentre(a, z) { return div(sub(z, a), sub([1, 0], mul(conj(a), z))); }
  function fromCentre(a, w) { return div(add(w, a), add([1, 0], mul(conj(a), w))); }
  // points along the geodesic from a to b
  function geodesic(a, b, k) {
    var bb = toCentre(a, b), out = [];
    for (var i = 0; i <= k; i++) out.push(fromCentre(a, [bb[0] * i / k, bb[1] * i / k]));
    return out;
  }

  // ---- the first kite: hyperbolic right triangle C, M, V with angles 30° at C and 45° at V ----
  var dCM = Math.acosh(Math.cos(Math.PI / 4) / Math.sin(Math.PI / 6));   // cosh CM = cos 45° / sin 30°
  var dCV = Math.acosh(1 / (Math.tan(Math.PI / 6) * Math.tan(Math.PI / 4)));  // cosh CV = cot 30° cot 45°
  var rM = Math.tanh(dCM / 2), rV = Math.tanh(dCV / 2);
  var K = { C: [0, 0], M1: polar(rM, 0), V: polar(rV, Math.PI / 6), M2: polar(rM, Math.PI / 3) };
  var cc = (1 + rM * rM) / (2 * rM), rho = cc - rM;
  var MIRRORS = [
    { line: true, th: 0 },                                   // C-M1
    { c: polar(cc, 0), rho: rho },                            // M1-V (the side of the hexagon through M1)
    { c: polar(cc, Math.PI / 3), rho: rho },                  // V-M2
    { line: true, th: Math.PI / 3 }                           // M2-C
  ];
  function apply(g, z) { for (var k = g.length - 1; k >= 0; k--) z = reflect(MIRRORS[g[k]], z); return z; }

  // ---- the angel: the kite with bent sides, symmetrical about C-V ----
  // profiles: [u along the side, offset in units of the side's length, positive = out of the kite]
  var PROF_CM = [[0, 0], [0.18, -0.07], [0.42, 0.02], [0.68, 0.09], [0.88, 0.04], [1, 0]];
  var PROF_MV = [[0, 0], [0.22, 0.08], [0.48, 0.05], [0.7, -0.07], [0.86, -0.03], [1, 0]];
  function smooth(prof, k) {
    var out = [];
    for (var i = 0; i < prof.length - 1; i++) {
      var p0 = prof[Math.max(0, i - 1)], p1 = prof[i], p2 = prof[i + 1], p3 = prof[Math.min(prof.length - 1, i + 2)];
      for (var j = 0; j < k; j++) {
        var t = j / k, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map(function (c) {
          return 0.5 * ((2 * p1[c]) + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3);
        }));
      }
    }
    out.push(prof[prof.length - 1].slice());
    return out;
  }
  var KC = [(K.C[0] + K.M1[0] + K.V[0] + K.M2[0]) / 4, (K.C[1] + K.M1[1] + K.V[1] + K.M2[1]) / 4];
  // bend a geodesic side: sample it, then push each point along the normal that leaves the kite
  function bentSide(a, b, prof) {
    var base = geodesic(a, b, 40), L = abs(sub(b, a)), sm = smooth(prof, 5);
    return sm.map(function (q) {
      var f = q[0] * 40, i = Math.min(39, Math.floor(f)), t = f - i;
      var p = [base[i][0] + (base[i + 1][0] - base[i][0]) * t, base[i][1] + (base[i + 1][1] - base[i][1]) * t];
      var d = sub(base[i + 1], base[i]), nl = abs(d) || 1, nrm = [d[1] / nl, -d[0] / nl];
      if ((p[0] - KC[0]) * nrm[0] + (p[1] - KC[1]) * nrm[1] < 0) nrm = [-nrm[0], -nrm[1]];
      return [p[0] + nrm[0] * q[1] * L, p[1] + nrm[1] * q[1] * L];
    });
  }
  function mirrorAxis(z) { return mul(polar(1, Math.PI / 3), conj(z)); }   // the line C-V, at 30°
  var half = bentSide(K.C, K.M1, PROF_CM).concat(bentSide(K.M1, K.V, PROF_MV).slice(1));
  var ANGEL = half.concat(half.slice(0, -1).reverse().map(mirrorAxis).slice(0, -1));
  // the lines inside the figures, in the frame of the first kite (each a list of points)
  function axisPt(t, off) {   // a point at fraction t of C-V, moved off the axis by off (in units of rV)
    var d = polar(1, Math.PI / 6), nrm = polar(1, Math.PI / 6 + Math.PI / 2);
    return [d[0] * rV * t + nrm[0] * rV * off, d[1] * rV * t + nrm[1] * rV * off];
  }
  function sym(lines) { return lines.concat(lines.map(function (l) { return l.map(mirrorAxis); })); }
  function towards(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
  var SH = axisPt(0.62, 0);   // the shoulders
  var ANGEL_LINES = sym([
    [axisPt(0.6, -0.04), towards(SH, K.M1, 0.45), towards(SH, K.M1, 0.8)],
    [axisPt(0.5, -0.03), towards(axisPt(0.4, 0), K.M1, 0.45), towards(axisPt(0.35, 0), K.M1, 0.75)],
    [axisPt(0.12, -0.1), axisPt(0.3, -0.07), axisPt(0.55, -0.05)],
    [axisPt(0.78, -0.06), axisPt(0.86, -0.07), axisPt(0.93, -0.03)]
  ]);
  var DEVIL_LINES = sym([
    [axisPt(0.62, -0.03), towards(SH, K.M1, 0.5), towards(SH, K.M1, 0.82)],
    [axisPt(0.6, -0.03), towards(axisPt(0.42, 0), K.M1, 0.55)],
    [axisPt(0.58, -0.03), towards(axisPt(0.25, 0), K.M1, 0.5)],
    [axisPt(0.84, -0.04), axisPt(0.97, -0.09), axisPt(1.0, -0.05)],
    [axisPt(0.2, -0.05), axisPt(0.45, -0.04)]
  ]);
  var EYES = [axisPt(0.86, -0.025), axisPt(0.86, 0.025)];

  // ================= the tiling =================
  // R: radius of the disc in px. Returns tiles {g, odd, P (the kite's corners, in px), size, key}, the final map
  // F (disc point of the first frame -> px) and an index of the corners.
  function tiling(R, minPx) {
    // move the centre of the first angel (its middle between feet and head, hyperbolically) to the centre
    var mid = fromCentre([0, 0], polar(Math.tanh(dCV / 4), Math.PI / 6));
    var a0 = toCentre(mid, K.C), v0 = toCentre(mid, K.V), rot = Math.PI / 2 - Math.atan2(v0[1] - a0[1], v0[0] - a0[0]);
    var er = polar(1, rot);
    function F(z) { var w = mul(er, toCentre(mid, z)); return [R + w[0] * R, R - w[1] * R]; }
    var corners = [K.C, K.M1, K.V, K.M2];
    var tiles = [], seen = {}, queue = [[]];
    function keyOf(P) { var x = (P[0][0] + P[1][0] + P[2][0] + P[3][0]) / 4, y = (P[0][1] + P[1][1] + P[2][1] + P[3][1]) / 4; return Math.round(x * 20) + "," + Math.round(y * 20); }
    while (queue.length && tiles.length < 9000) {
      var g = queue.shift();
      var Pd = corners.map(function (z) { return apply(g, z); }), P = Pd.map(F);
      var k = keyOf(P);
      if (seen[k]) continue;
      seen[k] = 1;
      var size = Math.max(abs(sub(P[0], P[2])), abs(sub(P[1], P[3])));
      var t = { g: g, odd: g.length % 2 === 1, P: P, size: size, key: k, id: tiles.length };
      tiles.push(t);
      if (size < minPx) continue;
      for (var e = 0; e < 4; e++) if (g[g.length - 1] !== e) queue.push(g.concat([e]));
    }
    // corners shared by tiles: a key per corner point
    var at = {};
    tiles.forEach(function (t) {
      t.ck = t.P.map(function (p) { return Math.round(p[0] * 4) + "," + Math.round(p[1] * 4); });
      t.ck.forEach(function (c) { (at[c] = at[c] || []).push(t); });
    });
    return { tiles: tiles, F: F, at: at, R: R };
  }
  // the rings: breadth-first over the tiles of one colour that touch at a corner, from a set of starting tiles
  function rings(T, start, odd) {
    start.forEach(function (t) { t.layer = 1; t.parent = null; });
    var q = start.slice(), seen = {};
    seen[T.tiles[0].id] = 1;
    start.forEach(function (t) { seen[t.id] = 1; });
    while (q.length) {
      var t = q.shift();
      t.kids = t.kids || [];
      // neighbours in order of size (larger first): a child goes to the parent nearest the centre
      var nb = [];
      t.ck.forEach(function (c) { (T.at[c] || []).forEach(function (u) { if (u.odd === odd && !seen[u.id]) nb.push(u); }); });
      nb.sort(function (a, b) { return b.size - a.size; });
      nb.forEach(function (u) {
        if (seen[u.id]) return;
        seen[u.id] = 1; u.layer = t.layer + 1; u.parent = t; u.kids = []; t.kids.push(u); q.push(u);
      });
    }
  }
  // all the tiles under a tile, nearest first (breadth-first)
  function under(t) {
    var out = [], q = (t.kids || []).slice();
    while (q.length) { var u = q.shift(); out.push(u); q = q.concat(u.kids || []); }
    return out;
  }
  function centre(t) { return [(t.P[0][0] + t.P[2][0]) / 2, (t.P[0][1] + t.P[2][1]) / 2]; }


  // ================= drawing (v2: plain tiles, large names) =================
  // The tiles are the plain kites of the tiling, with straight hyperbolic sides: angels white with a thin outline,
  // devils with a light hatching. A figure that stands for something is filled solid (black) or outlined heavily
  // (white); the names never sit on the hatching: the first ring is named inside, on white or black, and the other
  // figures send a line out of the disc to a name in a column beside it.
  var PHONE = window.innerWidth < 760;
  var KITE = geodesic(K.C, K.M1, 10).concat(geodesic(K.M1, K.V, 10).slice(1)).concat(geodesic(K.V, K.M2, 10).slice(1)).concat(geodesic(K.M2, K.C, 10).slice(1, -1));
  function pathOf(list) { return "M" + list.map(function (p) { return r1(p[0]) + " " + r1(p[1]); }).join("L"); }
  function textW(str, size) { return String(str).length * (size || 17) * 0.52; }
  function txt(x, y, s, o) {
    o = o || {};
    var col = o.white ? PAPER : INK, halo = o.white ? INK : PAPER;
    return '<text x="' + r1(x) + '" y="' + r1(y) + '" text-anchor="' + (o.anchor || "middle") + '" font-size="' + (o.size || 17) + '"' +
      (o.bold ? ' font-weight="700"' : "") + (o.italic ? ' font-style="italic"' : "") + ' fill="' + col + '" style="fill:' + col + '"' +
      (o.halo === 0 ? "" : ' stroke="' + halo + '" stroke-width="' + (o.halo || 5) + '" stroke-linejoin="miter" paint-order="stroke"') + ">" + s + "</text>";
  }
  // tiles: T.tiles with .data {name, sub, label (text outside), look: "solid" | "outline" | "centre"}
  // out: [{tile, text}] to be named outside the disc
  function disc(T, out, aria) {
    var R = T.R, side = PHONE ? 0 : 560 - R, W = PHONE ? 2 * R + 2 : 2 * R + 2 * side, GAP = 22;
    // first decide where the names outside go, so that the drawing is tall enough for the longer column
    var count = { L: 0, R: 0 };
    if (!PHONE) out.forEach(function (e) { count[centre(e.tile)[0] < R ? "L" : "R"]++; });
    var H = Math.max(2 * R + 2, 30 + GAP * (Math.max(count.L, count.R) + 3)), oy = Math.round((H - 2 * R - 2) / 2) + 1;
    var ox = PHONE ? 1 : side;
    var o = ['<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(aria) + '">'];
    o.push('<defs><pattern id="lt" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)"><rect width="7" height="7" fill="#fff"/><line x1="0" y1="0.5" x2="7" y2="0.5" stroke="' + INK + '" stroke-width="0.7"/></pattern></defs>');
    o.push('<g transform="translate(' + ox + " " + oy + ')">');
    o.push('<circle cx="' + R + '" cy="' + R + '" r="' + R + '" fill="#fff"/>');
    T.tiles.forEach(function (t) {
      var d = t.data, look = d ? d.look : "";
      var fill = look === "solid" ? INK : look ? PAPER : t.odd ? "url(#lt)" : PAPER;
      var sw = look === "centre" ? 3 : look === "outline" ? Math.max(1, Math.min(2.5, t.size / 40)) : Math.max(0.25, Math.min(0.9, t.size / 120));
      o.push('<path d="' + pathOf(KITE.map(function (z) { return T.F(apply(t.g, z)); })) + 'Z" fill="' + fill + '" stroke="' + INK + '" stroke-width="' + r1(sw * 10) / 10 + '"/>');
    });
    o.push('<circle cx="' + R + '" cy="' + R + '" r="' + R + '" fill="none" stroke="' + INK + '" stroke-width="1.5"/>');
    // names inside: the centre and the first ring; a name that would touch another goes outside on a line
    var inBoxes = [];
    T.tiles.filter(function (t) { return t.data && t.data.inside; }).sort(function (a, b) { return (b.data.look === "centre") - (a.data.look === "centre") || b.size - a.size; }).forEach(function (t) {
      var d = t.data;
      if (!d || !d.inside) return;
      var c = centre(t), white = d.look === "solid", size = d.look === "centre" ? (PHONE ? 20 : 26) : (PHONE ? 16 : 18);
      var bw = Math.max(textW(d.name, size) * 1.2, textW(d.sub || "", 16) * 1.2) + 28, bx = [c[0] - bw / 2, c[1] - size - 2, c[0] + bw / 2, c[1] + (d.sub ? size + 4 : 8)];
      var clash = inBoxes.some(function (q) { return bx[0] < q[2] && bx[2] > q[0] && bx[1] < q[3] && bx[3] > q[1]; });
      if (d.look !== "centre" && (PHONE || clash || textW(d.name + " ", size) > t.size * 0.65)) { out.unshift({ tile: t, text: "<tspan font-weight=\"700\">" + esc(d.name) + "</tspan> " + esc(d.sub || "") }); return; }
      inBoxes.push(bx);
      o.push(txt(c[0], c[1] + (d.sub ? -2 : 6), esc(d.name), { size: size, bold: true, white: white, italic: d.italic }));
      if (d.sub) o.push(txt(c[0], c[1] + size - 1, esc(d.sub), { size: 16, white: white }));
    });
    o.push("</g>");
    // names outside, in two columns, each joined to its figure by a line
    if (!PHONE) {
      var cols = { L: [], R: [] };
      out.forEach(function (e) { var c = centre(e.tile); e.ax = c[0] + ox; e.ay = c[1] + oy; cols[c[0] < R ? "L" : "R"].push(e); });
      ["L", "R"].forEach(function (k) {
        var list = cols[k].sort(function (a, b) { return a.ay - b.ay; }), gap = GAP, top = 12, bot = H - 6;
        list.forEach(function (e) { e.y = e.ay + 6; });
        for (var it = 0; it < 60; it++) {   // spread them so that no two names touch, keeping them near their figure
          for (var i = 1; i < list.length; i++) if (list[i].y - list[i - 1].y < gap) { var m = (gap - (list[i].y - list[i - 1].y)) / 2; list[i].y += m; list[i - 1].y -= m; }
          list.forEach(function (e) { e.y = Math.max(top + 4, Math.min(bot, e.y)); });
        }
        for (var j = 1; j < list.length; j++) if (list[j].y - list[j - 1].y < gap) list[j].y = list[j - 1].y + gap;
        for (var b2 = list.length - 1; b2 >= 0; b2--) list[b2].y = Math.min(list[b2].y, b2 < list.length - 1 ? list[b2 + 1].y - gap : bot);
        list.forEach(function (e) {
          var lx = k === "L" ? side - 14 : side + 2 * R + 14, ex = k === "L" ? lx + 6 : lx - 6;
          o.push('<polyline points="' + r1(e.ax) + "," + r1(e.ay) + " " + r1(ex) + "," + r1(e.y - 5) + " " + r1(k === "L" ? ex - 4 : ex + 4) + "," + r1(e.y - 5) + '" fill="none" stroke="' + PAPER + '" stroke-width="3"/>');
          o.push('<polyline points="' + r1(e.ax) + "," + r1(e.ay) + " " + r1(ex) + "," + r1(e.y - 5) + " " + r1(k === "L" ? ex - 4 : ex + 4) + "," + r1(e.y - 5) + '" fill="none" stroke="' + INK + '" stroke-width="1"/>');
          o.push('<rect x="' + r1(e.ax - 2.5) + '" y="' + r1(e.ay - 2.5) + '" width="5" height="5" fill="' + (e.tile.data.look === "solid" ? PAPER : INK) + '" stroke="' + INK + '" stroke-width="0.8"/>');
          o.push(txt(k === "L" ? lx - 6 : lx + 6, e.y, e.text, { anchor: k === "L" ? "end" : "start", size: 16, halo: 0 }));
        });
      });
    } else {
      var nb = inBoxes.slice();
      out.forEach(function (e, i) {   // on a telephone: a number on the figure, the name in the key under the disc
        var c = centre(e.tile), b = [c[0] - 12, c[1] - 12, c[0] + 12, c[1] + 10];
        e.no = i + 1;
        e.drawn = e.tile.size > 14 && !nb.some(function (q) { return b[0] < q[2] && b[2] > q[0] && b[1] < q[3] && b[3] > q[1]; });
        if (!e.drawn) return;
        nb.push(b);
        o.push(txt(c[0] + ox, c[1] + oy + 6, String(e.no), { size: 16, bold: true, white: e.tile.data.look === "solid" }));
      });
    }
    o.push("</svg>");
    return o.join("");
  }
  function phoneKey(out) {
    if (!PHONE || !out.length) return "";
    return '<ol class="pkey">' + out.map(function (e) { return "<li><b>" + e.no + "</b> " + e.text.replace(/<tspan[^>]*>/g, "<i>").replace(/<\/tspan>/g, "</i>") + (e.drawn ? "" : " (near the rim, too small to number)") + "</li>"; }).join("") + "</ol>";
  }
  // the lists, as on the real site: name, category in words, number, a thin bar, examples
  var CATN = { prestito: "borrowed", latinismo_dotto: "learned Latin", calco: "calque" };
  function rowsHtml(rows, first) {
    var max = rows.length ? rows[0].n : 1;
    return '<ul class="rows">' + rows.slice(0, first).map(function (r) {
      var cats = Object.keys(r.cats).filter(function (k) { return r.cats[k] > 0; }).sort(function (a, b) { return r.cats[b] - r.cats[a]; })
        .map(function (k) { return (CATN[k] || k) + " " + n(r.cats[k]); }).join(" · ");
      return '<li class="row"><div class="line"><span class="name">' + esc(r.name) + '</span><span class="num">' + n(r.n) + "</span></div>" +
        '<div class="bar"><span style="width:' + Math.max(0.4, 100 * r.n / max).toFixed(2) + '%"></span></div>' +
        '<p class="cat">' + cats + "</p>" + (r.ex.length ? '<p class="ex">' + r.ex.slice(0, 5).map(esc).join(", ") + "</p>" : "") + "</li>";
    }).join("") + (rows.length > first ? '<li class="row more">' + (rows.length - first) + " more languages, " + n(rows.slice(first).reduce(function (s, r) { return s + r.n; }, 0)) + " words</li>" : "") + "</ul>";
  }
  function firstRings(T) {
    var me = T.tiles[0], touch = {};
    me.ck.forEach(function (c) { (T.at[c] || []).forEach(function (u) { if (u !== me) touch[u.id] = u; }); });
    var ring1 = Object.keys(touch).map(function (k) { return touch[k]; });
    var a = byAngle(ring1.filter(function (t) { return !t.odd; }), T.R), d = byAngle(ring1.filter(function (t) { return t.odd; }), T.R);
    rings(T, a, false);
    rings(T, d, true);
    return { me: me, angels: a, devils: d };
  }
  function byAngle(list, R) {
    return list.slice().sort(function (a, b) {
      var ca = centre(a), cb = centre(b);
      var ta = (Math.atan2(ca[0] - R, -(ca[1] - R)) + 2 * Math.PI) % (2 * Math.PI), tb = (Math.atan2(cb[0] - R, -(cb[1] - R)) + 2 * Math.PI) % (2 * Math.PI);
      return ta - tb;
    });
  }

  // =================== language page ===================
  function languagePage(code) {
    Promise.all([B.language(code), B.extra(code), B.level2()]).then(function (res) {
      var D = res[0], X = res[1] || {}, L2 = res[2], l = D.lang, Lg = D.L;
      document.title = l.name + " — lexodus (Circle Limit draft, v2)";
      var R = PHONE ? 168 : 245, T = tiling(R, 3), F = firstRings(T);
      var nm = function (c) { return c === "LATINO" ? "Latin" : B.nameOf(Lg, c); };
      var skip = function (c) { return B.isLatin(c) && c !== "LATINO"; };
      var out = [], PER = PHONE ? 2 : 4;
      F.me.data = { name: l.name, look: "centre", inside: true };
      // took from: white angels, outlined heavily where they stand for a language
      F.angels.forEach(function (t, i) {
        var src = D.from[i];
        if (!src) return;
        var key = src.code === "la" ? "LATINO" : src.code;
        t.data = { name: src.name, sub: n(src.n), look: "outline", inside: true };
        var items = [];
        (L2.da_chi_ha_preso[code + "|" + key] || []).forEach(function (x) {
          if (!skip(x.codice) && B.merged(x.codice) !== B.merged(key)) items.push({ text: esc(nm(x.codice)) + " " + n(x.n) + ' <tspan font-style="italic">via ' + esc(src.name) + "</tspan>" });
        });
        var slots = under(t);
        items.forEach(function (x, k) { if (slots[k]) { slots[k].data = { look: "outline" }; if (k < PER) out.push({ tile: slots[k], text: x.text }); } });
      });
      // gave to: devils, solid black where they stand for a language
      F.devils.forEach(function (t, i) {
        var dst = D.to[i];
        if (!dst) return;
        t.data = { name: dst.name, sub: n(dst.n), look: "solid", inside: true };
        var items = [];
        Object.keys(L2.da_chi_ha_preso).forEach(function (k) {
          var parts = k.split("|");
          if (parts[1] !== dst.code || skip(parts[0])) return;
          (L2.da_chi_ha_preso[k] || []).forEach(function (x) { if (x.codice === code) items.push({ nn: x.n, text: esc(nm(parts[0])) + " " + n(x.n) + ' <tspan font-style="italic">' + (parts[0] === code ? "back home via " + esc(dst.name) : "via " + esc(dst.name)) + "</tspan>" }); });
        });
        items.sort(function (a, b) { return b.nn - a.nn; });
        var slots = under(t);
        items.forEach(function (x, k) { if (slots[k]) { slots[k].data = { look: "solid" }; if (k < PER) out.push({ tile: slots[k], text: x.text }); } });
      });
      var svg = disc(T, out, "Circle Limit: " + l.name + " at the centre, white angels for the languages it took from, black devils for those it gave to");
      var h = [];
      h.push('<div class="sheet">');
      h.push('<div class="title"><h1>' + esc(l.name) + " <i>to the limit of the circle</i></h1></div>");
      h.push('<div class="lede"><p>' + esc(l.name) + " took <b>" + n(D.fromTotal) + "</b> words from " + D.from.length + " languages and gave <b>" + n(D.toTotal) + "</b> to " + D.to.length + ".</p>" +
        "<p>The disc shows, the lists say. In the disc every figure is a language; they shrink towards the rim because the plane is hyperbolic, and the farther a language stands from " + esc(l.name) + " along the roads of its words, the nearer the rim.</p></div>");
      h.push('<figure class="plate wide"><div class="cap"><span class="no">Plate I</span><h2>White angels took, black devils gave</h2></div><div class="box">' + svg + "</div>" + phoneKey(out) +
        '<p class="note">' + esc(l.name) + " is the figure at the centre. Touching it, the five languages it took most from (white, outlined) and the five it gave most to (black). " +
        "Behind each white one, going out, the languages it had those words from; behind each black one, the languages that had " + esc(l.name) + " words through it. The " + PER + " largest of each are named beside the disc; the other filled figures are smaller ones of the same kind; the plain figures carry the plane on to the rim.</p></figure>");
      h.push('<section class="plate half"><div class="cap"><span class="no">Took from</span><h2>' + D.from.length + " languages, " + n(D.fromTotal) + " words</h2></div>" + rowsHtml(D.from, 15) + "</section>");
      h.push('<section class="plate half2"><div class="cap"><span class="no">Gave to</span><h2>' + D.to.length + " languages, " + n(D.toTotal) + " words</h2></div>" + rowsHtml(D.to, 15) + "</section>");
      h.push("</div>");
      app.innerHTML = h.join("");
    }).catch(fail);
  }

  // =================== word page ===================
  function wordPage() {
    var lang = B.param("lang") || "it", w = B.param("w") || "caffè", ne = +(B.param("n") || 1), from = B.param("from");
    B.word(lang, w, ne, from).then(function (Rw) {
      var L = Rw.L;
      if (!Rw.tree) throw new Error("No tree for this word.");
      var full = B.fullTree(L, lang, Rw.tree), p = Rw.p || {};
      var stops = B.journey(L, lang, p.catena ? p : { su: Rw.tree.e.su, parola: w, traslitterazione: Rw.tree.e.traslitterazione });
      document.title = w + " — lexodus (Circle Limit draft, v2)";
      var R = PHONE ? 168 : 245, T = tiling(R, 3), F = firstRings(T), out = [];
      var langName = L.by[lang] ? L.by[lang].name : lang;
      F.me.data = { name: w, look: "centre", inside: true, italic: true };
      // the road: solid black figures from the centre out, on the left
      var back = stops.slice(0, -1).reverse(), cur = F.angels.slice().sort(function (a, b) { return centre(a)[0] - centre(b)[0]; })[0];
      back.forEach(function (st) {
        if (!cur) return;
        var rd = B.readable(st.term, st.tr);
        cur.data = { look: "solid", name: rd, sub: st.name, italic: true, inside: cur.layer === 1 };
        if (cur.layer !== 1) out.push({ tile: cur, text: '<tspan font-style="italic" font-weight="700">' + esc(rd) + "</tspan> " + esc(st.name) + " (the road)" });
        cur = (cur.kids || []).slice().sort(function (a, b) { return b.size - a.size; })[0];
      });
      // the words that took it: white figures, outlined, each beyond the one it came from
      var gens = [];
      function place(nodes, tile0, depth) {
        var slots = tile0 ? under(tile0) : F.devils.slice();
        nodes.forEach(function (nd) {
          var t = slots.filter(function (s) { return !s.data; })[0];
          (gens[depth] = gens[depth] || []).push(nd);
          if (!t) return;
          var rd = B.readable(nd.word, nd.tr);
          t.data = { look: "outline", name: rd, sub: nd.name, italic: true, inside: t.layer === 1 };
          if (t.layer !== 1) out.push({ tile: t, text: '<tspan font-style="italic">' + esc(rd) + "</tspan> " + esc(nd.name) });
          nd.tile = t;
          place(nd.kids, t, depth + 1);
        });
      }
      place(full.me.kids, null, 0);
      var svg = disc(T, out, "Circle Limit: " + w + " at the centre, its road in black, the words that took it outlined");
      var h = [];
      h.push('<div class="sheet">');
      h.push('<div class="title"><h1>' + esc(w) + " <i>to the limit of the circle</i></h1></div>");
      h.push('<div class="lede"><p>' + esc(full.me.mean || p.significato || "") + ". " + esc(langName) + " word; its road goes back " + (stops.length - 1) + " stops, to " + esc(stops[0].name) +
        ", and " + n(full.count) + " words in other languages came after it, in " + gens.length + " generations.</p>" + (Rw.text ? '<p class="quote">“' + esc(Rw.text) + "” (Wiktionary)</p>" : "") + "</div>");
      h.push('<figure class="plate wide"><div class="cap"><span class="no">Plate I</span><h2>The road in black, the words after it in white</h2></div><div class="box">' + svg + "</div>" + phoneKey(out) +
        '<p class="note">' + esc(w) + " is the figure at the centre. Its road goes out to the left in solid black figures, one stop per ring, as far as the data go; the words that took it are the outlined white figures, the first generation touching the centre and every later word beyond the one it came from.</p></figure>");
      // the road written stop by stop, as on the real site
      h.push('<section class="plate half"><div class="cap"><span class="no">The road</span><h2>Stop by stop</h2></div><ol class="path">' +
        stops.map(function (st, k) {
          var rd = B.readable(st.term, st.tr);
          return '<li class="' + (st.here ? "here" : k === 0 ? "origin" : "") + '"><div class="step"><span class="lang">' + esc(st.name) + '</span><span class="term">' + esc(st.term) +
            (rd !== st.term ? ' <span class="tr">(' + esc(rd) + ")</span>" : "") + '</span><span class="how">' + esc(st.here ? "this word" : stops[k + 1] ? stops[k + 1].how : "") + "</span></div></li>";
        }).join("") + "</ol>" + '<p class="note">Read from the farthest origin down to the word; on the right, how the word passed on to the next stop.</p></section>');
      h.push('<section class="plate half2"><div class="cap"><span class="no">After it</span><h2>' + n(full.count) + " words, generation by generation</h2></div>" +
        gens.map(function (g, gi) {
          return '<h3 class="gen">Generation ' + (gi + 1) + " · " + g.length + (g.length === 1 ? " word" : " words") + '</h3><ul class="words">' + g.map(function (nd) {
            return "<li><i>" + esc(B.readable(nd.word, nd.tr)) + "</i> <span>" + esc(nd.name) + (gi ? ", from " + esc(B.nameOf(L, nd.parent)) : "") + "</span></li>";
          }).join("") + "</ul>";
        }).join("") + "</section>");
      h.push("</div>");
      app.innerHTML = h.join("");
    }).catch(fail);
  }

  if (page === "language") languagePage(B.param("code") || "it");
  else wordPage();
})();
