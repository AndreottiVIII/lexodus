/* lexodus, draft "limite-cerchio" (bozze6): M. C. Escher's "Circle Limit IV" (1960), drawn in SVG from the data.
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

  // ================= drawing =================
  function hatchDefs() {
    return '<defs><pattern id="xh" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">' +
      '<rect width="4" height="4" fill="#fff"/><line x1="0" y1="0.5" x2="4" y2="0.5" stroke="' + INK + '" stroke-width="1"/><line x1="0.5" y1="0" x2="0.5" y2="4" stroke="' + INK + '" stroke-width="1"/></pattern></defs>';
  }
  function pathOf(list) { return "M" + list.map(function (p) { return r1(p[0]) + " " + r1(p[1]); }).join("L"); }
  function label(x, y, txt, o) {
    o = o || {};
    var col = o.white ? PAPER : INK, halo = o.white ? INK : PAPER;
    return '<text x="' + r1(x) + '" y="' + r1(y) + '" text-anchor="middle" font-size="' + (o.size || 17) + '"' + (o.italic ? ' font-style="italic"' : "") +
      ' fill="' + col + '" style="fill:' + col + '" stroke="' + halo + '" stroke-width="' + (o.halo || 4) + '" stroke-linejoin="miter" paint-order="stroke">' + txt + "</text>";
  }
  function textW(str, size) { return String(str).length * (size || 17) * 0.5; }
  // how a tile shows its data: its name inside, a number, or nothing (too small)
  function mode(t) {
    var d = t.data;
    if (t.size * 0.62 > textW(d.name, 17) && t.size > 60) return "name";
    return t.size > 22 ? "no" : "hidden";
  }
  function numberTiles(T, odd, from) {
    var k = from || 0;
    T.tiles.filter(function (t) { return t.data && t.odd === odd && t.layer > 0; }).sort(function (a, b) { return a.layer - b.layer || b.size - a.size; })
      .forEach(function (t) { t.data.mode = mode(t); t.data.no = t.data.mode === "no" ? ++k : ""; });
  }
  // draw the disc; tiles carry .data = {name, sub, no} when they stand for something; centreTile is hatched
  function disc(T, centreTile, aria) {
    var R = T.R, W = 2 * R + 2;
    var o = ['<svg width="' + W + '" height="' + W + '" viewBox="-1 -1 ' + W + " " + W + '" role="img" aria-label="' + esc(aria) + '">', hatchDefs()];
    o.push('<circle cx="' + R + '" cy="' + R + '" r="' + R + '" fill="' + INK + '"/>');   // the devils are what is left
    var detail = [];
    T.tiles.forEach(function (t) {
      if (t.odd) {
        if (t.size > 9) {
          var sw = Math.max(0.35, Math.min(1.6, t.size / 110));
          DEVIL_LINES.forEach(function (l) { detail.push('<path d="' + pathOf(l.map(function (z) { return T.F(apply(t.g, z)); })) + '" fill="none" stroke="' + PAPER + '" stroke-width="' + r1(sw * 10) / 10 + '"/>'); });
          if (t.size > 26) EYES.forEach(function (z) { var p = T.F(apply(t.g, z)); detail.push('<circle cx="' + r1(p[0]) + '" cy="' + r1(p[1]) + '" r="' + r1(Math.max(1, t.size / 70)) + '" fill="' + PAPER + '"/>'); });
        }
        return;
      }
      var pts = ANGEL.map(function (z) { return T.F(apply(t.g, z)); });
      var sw0 = Math.max(0.25, Math.min(1.4, t.size / 120));
      o.push('<path d="' + pathOf(pts) + 'Z" fill="' + (t === centreTile ? "url(#xh)" : PAPER) + '" stroke="' + INK + '" stroke-width="' + r1(sw0 * 10) / 10 + '"/>');
      if (t.size > 9 && t !== centreTile) {
        ANGEL_LINES.forEach(function (l) { detail.push('<path d="' + pathOf(l.map(function (z) { return T.F(apply(t.g, z)); })) + '" fill="none" stroke="' + INK + '" stroke-width="' + r1(Math.max(0.3, sw0) * 10) / 10 + '"/>'); });
        if (t.size > 26) EYES.forEach(function (z) { var p = T.F(apply(t.g, z)); detail.push('<circle cx="' + r1(p[0]) + '" cy="' + r1(p[1]) + '" r="' + r1(Math.max(1, t.size / 70)) + '" fill="' + INK + '"/>'); });
      }
    });
    o.push(detail.join(""));
    // names and numbers
    T.tiles.forEach(function (t) {
      if (!t.data && t !== centreTile) return;
      var c = centre(t), d = t.data || {}, white = t.odd;
      if (t === centreTile) {
        o.push(label(c[0], c[1] - 2, esc(d.name), { size: 22, italic: true }));
        if (d.sub) o.push(label(c[0], c[1] + 18, esc(d.sub), { size: 15 }));
        return;
      }
      var room = t.size * 0.62;
      if (d.mode === "name") {
        o.push(label(c[0], c[1] + (d.sub ? -3 : 5), esc(d.name), { white: white, italic: !!d.italic }));
        if (d.sub && room > textW(d.sub, 15)) o.push(label(c[0], c[1] + 15, esc(d.sub), { white: white, size: 15 }));
        d.named = true;
      } else if (d.mode === "no") {
        o.push(label(c[0], c[1] + 5, String(d.no), { white: white, size: 15, halo: 3 }));
      }
    });
    o.push('<circle cx="' + R + '" cy="' + R + '" r="' + R + '" fill="none" stroke="' + INK + '" stroke-width="1.5"/>');
    o.push("</svg>");
    return o.join("");
  }

  // spread the first ring round the circle, starting at the top, clockwise
  function byAngle(list, R) {
    return list.slice().sort(function (a, b) {
      var ca = centre(a), cb = centre(b);
      var ta = (Math.atan2(ca[0] - R, -(ca[1] - R)) + 2 * Math.PI) % (2 * Math.PI), tb = (Math.atan2(cb[0] - R, -(cb[1] - R)) + 2 * Math.PI) % (2 * Math.PI);
      return ta - tb;
    });
  }
  // the key beside the disc: one paragraph per branch, the figures grouped by what they are, in ring order;
  // what is too small to carry a number is named without one
  function keyHtml(branches, devil) {
    function k(d) { return d.no === "" ? "" : (devil ? '<span class="dv">' + d.no + "</span>" : "<b>" + d.no + "</b>") + " "; }
    function nm(d) { return d.italic ? "<i>" + esc(d.name) + "</i>" : esc(d.name); }
    return branches.map(function (b) {
      var head = b.tile.data, groups = [], by = {};
      b.rest.forEach(function (t) { var g = t.data.note || ""; if (!by[g]) { by[g] = []; groups.push(g); } by[g].push(t); });
      return '<p class="kb"><b>' + esc(head.name) + "</b> " + esc(head.sub || "") + (b.lead ? ", " + esc(b.lead) : "") + ". " +
        groups.map(function (g) {
          return (g ? "<i>" + esc(g) + ":</i> " : "") + by[g].map(function (t) { return k(t.data) + nm(t.data) + " " + esc(t.data.sub || ""); }).join(" · ");
        }).join("; ") + (b.left ? "; not drawn, the figures under it ran out: " + esc(b.left) : "") + ".</p>";
    }).join("");
  }

  // =================== language page ===================
  function languagePage(code) {
    Promise.all([B.language(code), B.extra(code), B.level2()]).then(function (res) {
      var D = res[0], X = res[1] || {}, L2 = res[2], l = D.lang, Lg = D.L;
      document.title = l.name + " — lexodus (Circle Limit draft)";
      var R = 320, T = tiling(R, 3.2);
      var me = T.tiles[0];
      // first rings: angels and devils touching the centre figure
      var touch = {};
      me.ck.forEach(function (c) { (T.at[c] || []).forEach(function (u) { if (u !== me) touch[u.id] = u; }); });
      var ring1 = Object.keys(touch).map(function (k) { return touch[k]; });
      var angels1 = byAngle(ring1.filter(function (t) { return !t.odd; }), R), devils1 = byAngle(ring1.filter(function (t) { return t.odd; }), R);
      me.layer = 0;
      rings(T, angels1, false);
      rings(T, devils1, true);
      var nm = function (c) { return c === "LATINO" ? "Latin" : B.nameOf(Lg, c); };
      var skip = function (c) { return B.isLatin(c) && c !== "LATINO"; };
      var far = (X.origini_lontane && X.origini_lontane.lista) || [], proto = (X.origini_ricostruite && X.origini_ricostruite.lista) || [];
      // took from: one branch per angel of the first ring
      var noA = 0, noD = 0, branchesA = [], branchesD = [];
      angels1.forEach(function (t, i) {
        var src = D.from[i];
        if (!src) return;
        var key = (src.code === "la" ? "LATINO" : src.code);
        t.data = { name: src.name, sub: n(src.n) };
        var items = [];
        (L2.da_chi_ha_preso[code + "|" + key] || []).forEach(function (x) { if (!skip(x.codice) && B.merged(x.codice) !== B.merged(key)) items.push({ name: nm(x.codice), sub: n(x.n), note: "the stop before" }); });
        var shown = {};
        items.forEach(function (x) { shown[x.name] = 1; });
        far.forEach(function (f) {
          if (f.tipo_lingua !== "lingua" || B.merged(f.codice) === B.merged(key)) return;
          (f.strade || []).forEach(function (s) { if (s.codice === key && !shown[nm(f.codice)]) { items.push({ name: nm(f.codice), sub: n(s.n), note: "farthest origins" }); shown[nm(f.codice)] = 1; } });
        });
        proto.forEach(function (f) {
          (f.strade || []).forEach(function (s) { if (s.codice === key) items.push({ name: f.nome_en, sub: n(s.n), note: "proto-languages", italic: true }); });
        });
        var slots = under(t), rest = [];
        items.forEach(function (x, k) { if (slots[k]) { slots[k].data = x; rest.push(slots[k]); } });
        branchesA.push({ tile: t, rest: rest, lead: "took directly", left: items.slice(slots.length).map(function (x) { return x.name + " " + x.sub; }).join(", ") });
      });
      devils1.forEach(function (t, i) {
        var dst = D.to[i];
        if (!dst) return;
        t.data = { name: dst.name, sub: n(dst.n) };
        var items = [];
        Object.keys(L2.da_chi_ha_preso).forEach(function (k) {
          var parts = k.split("|");
          if (parts[1] !== dst.code) return;
          (L2.da_chi_ha_preso[k] || []).forEach(function (x) { if (x.codice === code && !skip(parts[0])) items.push({ name: nm(parts[0]), sub: n(x.n), note: parts[0] === code ? "back home" : "had Italian words through it", nn: x.n }); });
        });
        items.sort(function (a, b) { return b.nn - a.nn; });
        var slots = under(t), rest = [];
        items.forEach(function (x, k) { if (slots[k]) { slots[k].data = x; rest.push(slots[k]); } });
        branchesD.push({ tile: t, rest: rest, lead: "took directly", left: items.slice(slots.length).map(function (x) { return x.name + " " + x.sub; }).join(", ") });
      });
      // numbers, ring by ring
      numberTiles(T, false);
      numberTiles(T, true);
      function ord(x, y) { return x.layer - y.layer || y.size - x.size; }
      branchesA.forEach(function (b) { b.rest.sort(ord); });
      branchesD.forEach(function (b) { b.rest.sort(ord); });
      me.data = { name: l.name, sub: "" };
      var svg = disc(T, me, "Circle Limit: " + l.name + " at the centre, angels for the languages it took from, devils for those it gave to");
      var h = [];
      h.push('<div class="sheet">');
      h.push('<div class="title"><h1>' + esc(l.name) + " <i>to the limit of the circle</i></h1></div>");
      h.push('<div class="lede"><p>' + esc(l.name) + " took <b>" + n(D.fromTotal) + "</b> words from " + D.from.length + " languages and gave <b>" + n(D.toTotal) + "</b> to " + D.to.length +
        ".</p><p>In the hyperbolic plane every figure is the same size; drawn in a disc they shrink towards the rim and never reach it. The farther a language is from " + esc(l.name) +
        " along the roads of its words, the nearer the rim it stands.</p></div>");
      var tilesN = T.tiles.length;
      h.push('<figure class="plate disc"><div class="cap"><span class="no">Plate I</span><h2>Heaven and hell</h2></div><div class="box">' + svg + "</div>" +
        '<p class="note">' + esc(l.name) + " is the hatched angel at the centre. White angels: the languages it took words from; the five largest touch it, and behind each, going out, the languages it had those words from (the stop before), then the farthest origins and the reconstructed proto-languages of the same road. " +
        "Black devils: the languages it gave words to; the five largest touch it, and behind each, the languages that had " + esc(l.name) + " words through it. The size of every figure is computed with hyperbolic geometry (" + n(tilesN) +
        " figures drawn, down to 3 px); the empty ones carry on to the rim, where the data stop and the plane does not.</p></figure>");
      h.push('<section class="plate key"><div class="cap"><span class="no">Key</span><h2>The angels: what it took</h2></div>' + keyHtml(branchesA, false) + "</section>");
      h.push('<section class="plate disc key2"><div class="cap"><span class="no">Key</span><h2>The devils: what it gave</h2></div>' + keyHtml(branchesD, true) + "</section>");
      function table(cls, no, title, rows) {
        return '<section class="plate ' + cls + '"><div class="cap"><span class="no">' + no + "</span><h2>" + title + '</h2></div><table class="tbl"><tr><th>language</th><th class="n">words</th><th>for example</th></tr>' +
          rows.slice(0, 12).map(function (r) { return "<tr><td>" + esc(r.name) + '</td><td class="n">' + n(r.n) + '</td><td class="ex">' + esc(r.ex.slice(0, 3).join(", ")) + "</td></tr>"; }).join("") +
          "<tr><td>" + (rows.length - 12) + ' more</td><td class="n">' + n(rows.slice(12).reduce(function (s, r) { return s + r.n; }, 0)) + "</td><td></td></tr></table></section>";
      }
      h.push(table("half", "Angels", "Every language it took from, first 12", D.from));
      h.push(table("half2", "Devils", "Every language it gave to, first 12", D.to));
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
      document.title = w + " — lexodus (Circle Limit draft)";
      var R = 320, T = tiling(R, 3.2), me = T.tiles[0];
      var touch = {};
      me.ck.forEach(function (c) { (T.at[c] || []).forEach(function (u) { if (u !== me) touch[u.id] = u; }); });
      var ring1 = Object.keys(touch).map(function (k) { return touch[k]; });
      var angels1 = byAngle(ring1.filter(function (t) { return !t.odd; }), R), devils1 = byAngle(ring1.filter(function (t) { return t.odd; }), R);
      rings(T, angels1, false);
      rings(T, devils1, true);
      var noA = 0, noD = 0;
      // the road: from the word back to the farthest origin, a row of angels going out on the left
      var back = stops.slice(0, -1).reverse(), cur = angels1.slice().sort(function (a, b) { return centre(a)[0] - centre(b)[0]; })[0], roadTiles = [];
      back.forEach(function (st, i) {
        if (!cur) return;
        cur.data = { name: B.readable(st.term, st.tr), sub: st.name, italic: true, note: i === back.length - 1 ? "the farthest origin in the data" : "" };
        roadTiles.push(cur);
        var kids = (cur.kids || []).slice().sort(function (a, b) { return b.size - a.size; });
        cur = kids[0];
      });
      // the words after it: devils, each word beyond the one it came from
      var gens = [];
      function place(nodes, tile0, depth) {
        // nodes go to the tiles under tile0 (or to the first ring), nearest first
        var slots = tile0 ? under(tile0) : devils1.slice();
        nodes.forEach(function (nd, k) {
          var t = slots.filter(function (s) { return !s.data; })[0];
          (gens[depth] = gens[depth] || []).push(nd);
          if (!t) return;
          t.data = { name: B.readable(nd.word, nd.tr), sub: nd.name, italic: true, gen: depth + 1, nd: nd };
          nd.tile = t;
          place(nd.kids, t, depth + 1);
        });
      }
      place(full.me.kids, null, 0);
      numberTiles(T, false);
      numberTiles(T, true);
      me.data = { name: w, sub: L.by[lang] ? L.by[lang].name : lang };
      var svg = disc(T, me, "Circle Limit: " + w + " at the centre, its road as angels and the words that took it as devils");
      var h = [];
      h.push('<div class="sheet">');
      h.push('<div class="title"><h1>' + esc(w) + " <i>to the limit of the circle</i></h1></div>");
      h.push('<div class="lede"><p>' + esc(full.me.mean || p.significato || "") + ". " + esc(L.by[lang] ? L.by[lang].name : lang) + " word; its road goes back " + (stops.length - 1) +
        " stops, to " + esc(stops[0].name) + ", and " + n(full.count) + " words in other languages came after it, in " + gens.length + " generations.</p>" +
        (Rw.text ? '<p class="quote">“' + esc(Rw.text) + "” (Wiktionary)</p>" : "") + "</div>");
      h.push('<figure class="plate disc"><div class="cap"><span class="no">Plate I</span><h2>The disc of ' + esc(w) + "</h2></div><div class=\"box\">" + svg + "</div>" +
        '<p class="note">' + esc(w) + " is the hatched angel at the centre. Angels, to the left: its road, one stop per ring, as far as the data go (" + esc(stops[0].name) + "); the angels beyond are empty, because no older stop is recorded. " +
        "Devils: the words that took it; the first generation touches the centre, and every later word stands beyond the one it came from, so the rings are generations.</p></figure>");
      var keyA = '<ol><li class="br"><span class="k"></span><b>' + esc(w) + "</b> " + esc(L.by[lang] ? L.by[lang].name : lang) + ", the centre</li>" +
        roadTiles.map(function (t) { return '<li><span class="k">' + t.data.no + "</span><i>" + esc(t.data.name) + "</i> " + esc(t.data.sub) + (t.data.note ? ", " + esc(t.data.note) : "") + "</li>"; }).join("") + "</ol>";
      var keyD = "<ol>" + gens.map(function (g, gi) {
        return '<li class="br"><span class="k"></span><b>generation ' + (gi + 1) + "</b> · " + g.length + (g.length === 1 ? " word" : " words") + "</li>" +
          g.map(function (nd) {
            var d = nd.tile ? nd.tile.data : null;
            return '<li><span class="k">' + (d && d.no !== "" ? '<span class="dv">' + d.no + "</span>" : "") + "</span><i>" + esc(B.readable(nd.word, nd.tr)) + "</i> " + esc(nd.name) +
              (gi ? ", from " + esc(nd.parent ? B.nameOf(L, nd.parent) : "") : "") + (d && d.mode === "hidden" ? " (near the rim, too small to number)" : !d ? " (not drawn)" : "") + "</li>";
          }).join("");
      }).join("") + "</ol>";
      h.push('<section class="plate key"><div class="cap"><span class="no">Key</span><h2>The angels: its road</h2></div>' + keyA +
        '<div class="cap" style="margin-top:26px"><span class="no">Key</span><h2>The devils: the words after it</h2></div>' + keyD + "</section>");
      h.push("</div>");
      app.innerHTML = h.join("");
    }).catch(fail);
  }

  if (page === "language") languagePage(B.param("code") || "it");
  else wordPage();
})();
