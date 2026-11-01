/* lexodus, draft "giorno-notte" (bozze6): M. C. Escher's "Day and Night" (1938), drawn in SVG from the data.
   The bird is one shape. It is a lozenge of the chequerboard whose four sides are bent: the upper-right side carries
   the same curve as the lower-left one and the upper-left the same as the lower-right, so a bird moved by half a
   lozenge fits its neighbour exactly and white and black birds fill the plane together. The bending is scaled by
   t, from 0 (a plain field of the chequerboard) to 1 (a bird); the rows of the print go from 0 to 1 as they rise.
   Language page: the fields at the bottom are the languages Italian exchanged words with (area = words, sources on
   the left, takers on the right); above them the white flock (the languages Italian took from) flies in against
   the night on the left and the black flock (the languages it gave to) flies out against the day on the right,
   one bird for every N words.
   Word page: caffè leaves Arabic as a black bird on the day side with the other words of the same crossing,
   becomes a field of the chequerboard in Ottoman Turkish and comes out white on the night side in Italian; then
   the flock of the words that took it, generation by generation. */
(function () {
  "use strict";
  var app = document.getElementById("app"), page = document.body.getAttribute("data-page");
  var esc = B.esc, n = B.n, r1 = B.r1;
  var INK = "#111", PAPER = "#fff";

  function fail(e) {
    app.innerHTML = '<p class="loading">The data could not be read: ' + esc(e && e.message) + "</p>";
    if (window.console) console.error(e);
  }

  // ================= the bird =================
  // The tile is a parallelogram E (beak), N (tip of the raised wing), W (tail), S (belly). Its sides are bent:
  // the lower-left side W-S carries the same curve as the upper-right side E-N, moved by S-E, and the lower-right
  // side E-S the same curve as the upper-left N-W, moved by E-N. So the tile moved by p = S-E or q = N-E fits its
  // neighbour exactly, and colouring the tiles by the parity of i + j gives white and black birds of one shape.
  // Profiles: [u along the side, offset across it in units of s, positive = outwards]; offsets are scaled by t.
  var GEO = { E: [0.6, -0.05], N: [-0.15, -0.5], S: [0.0, 0.4], eye: [0.4, -0.1],
    EN: [[0, 0], [0.04, -0.04], [0.1, 0.04], [0.2, 0.07], [0.3, 0.0], [0.42, -0.05], [0.65, 0.1], [0.88, 0.1], [1, 0]],
    NW: [[0, 0], [0.05, 0.05], [0.12, 0.0], [0.3, -0.17], [0.52, -0.2], [0.72, -0.08], [0.88, 0.06], [1, 0]] };
  // Catmull-Rom through the profile points, k samples per span
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
  var SM_EN = smooth(GEO.EN, 6), SM_NW = smooth(GEO.NW, 6);
  function bend(a, b, sm, s, t) {
    var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
    return sm.map(function (q) { return [a[0] + dx * q[0] + nx * q[1] * s * t, a[1] + dy * q[0] + ny * q[1] * s * t]; });
  }
  function move(list, v) { return list.map(function (p) { return [p[0] + v[0], p[1] + v[1]]; }); }
  var shapeCache = {};
  // the bird of size s and bending t, centred on 0,0: {pts, p, q (the two moves of the lattice), eye, box}
  function bird(s, t) {
    var key = s + "|" + Math.round(t * 100);
    if (shapeCache[key]) return shapeCache[key];
    var E = [GEO.E[0] * s, GEO.E[1] * s], N = [GEO.N[0] * s, GEO.N[1] * s], S = [GEO.S[0] * s, GEO.S[1] * s];
    var W = [N[0] + S[0] - E[0], N[1] + S[1] - E[1]], c = [(E[0] + N[0] + S[0] + W[0]) / 4, (E[1] + N[1] + S[1] + W[1]) / 4];
    var en = bend(E, N, SM_EN, s, t), nw = bend(N, W, SM_NW, s, t);
    var sw = move(en, [S[0] - E[0], S[1] - E[1]]), es = move(nw, [E[0] - N[0], E[1] - N[1]]);
    var pts = move(en.concat(nw.slice(1)).concat(sw.slice().reverse().slice(1)).concat(es.slice().reverse().slice(1, -1)), [-c[0], -c[1]]);
    var xs = pts.map(function (q) { return q[0]; }), ys = pts.map(function (q) { return q[1]; });
    var g = { pts: pts, p: [S[0] - E[0], S[1] - E[1]], q: [N[0] - E[0], N[1] - E[1]], eye: [GEO.eye[0] * s - c[0], GEO.eye[1] * s - c[1]],
      box: [Math.min.apply(null, xs), Math.min.apply(null, ys), Math.max.apply(null, xs), Math.max.apply(null, ys)] };
    shapeCache[key] = g;
    return g;
  }
  function birdPath(cx, cy, s, t) {
    var p = bird(s, t).pts;
    return "M" + p.map(function (q) { return r1(cx + q[0]) + " " + r1(cy + q[1]); }).join("L") + "Z";
  }
  function eye(cx, cy, s, fill) {
    var e = bird(s, 1).eye;
    return '<circle cx="' + r1(cx + e[0]) + '" cy="' + r1(cy + e[1]) + '" r="' + r1(Math.max(1.8, 0.045 * s)) + '" fill="' + fill + '"/>';
  }
  // the lattice: every tile whose centre falls inside the box, with its parity (white when i + j is even)
  function lattice(s, ox, oy, x0, y0, x1, y1) {
    var g = bird(s, 1), out = [];
    for (var i = -60; i <= 60; i++) for (var j = -60; j <= 60; j++) {
      var x = ox + i * g.p[0] + j * g.q[0], y = oy + i * g.p[1] + j * g.q[1];
      if (x < x0 || x > x1 || y < y0 || y > y1) continue;
      out.push({ x: x, y: y, white: ((i + j) % 2 + 2) % 2 === 0, i: i, j: j });
    }
    return out;
  }

  // ---- tone: furrows (lines) for the fields, never a flat grey ----
  function furrows(id, ang, dark) {
    var g = 6, bg = dark ? INK : PAPER, fg = dark ? PAPER : INK;
    return '<pattern id="' + id + '" patternUnits="userSpaceOnUse" width="' + g + '" height="' + g + '" patternTransform="rotate(' + ang + ')">' +
      '<rect width="' + g + '" height="' + g + '" fill="' + bg + '"/><line x1="0" y1="1" x2="' + g + '" y2="1" stroke="' + fg + '" stroke-width="' + (dark ? 0.9 : 0.8) + '"/></pattern>';
  }
  var ANGLES = [0, 35, 90, -35, 15, 60, -60, -15];
  // text with a halo of the colour under it, so it stays readable over birds and furrows
  function label(x, y, txt, o) {
    o = o || {};
    var col = o.white ? PAPER : INK, halo = o.white ? INK : PAPER;
    return '<text x="' + r1(x) + '" y="' + r1(y) + '" text-anchor="' + (o.anchor || "start") + '" font-size="' + (o.size || 17) + '"' +
      (o.italic ? ' font-style="italic"' : "") + (o.cls ? ' class="' + o.cls + '"' : "") + ' fill="' + col + '" style="fill:' + col + '"' +
      ' stroke="' + halo + '" stroke-width="' + (o.halo || 5) + '" stroke-linejoin="miter" paint-order="stroke">' + txt + "</text>";
  }
  function textW(str, size) { return String(str).length * (size || 17) * 0.47; }

  // ---- the fields: an ordered strip map, columns from left to right in the order given ----
  function stripMap(items, x0, y0, W, H) {
    var total = items.reduce(function (s, it) { return s + it.v; }, 0), scale = W * H / total, cols = [], cur = [];
    function worst(list) {
      var sum = list.reduce(function (s, it) { return s + it.v; }, 0), w = sum * scale / H, m = 0;
      list.forEach(function (it) { var h = it.v * scale / w; m = Math.max(m, w / h, h / w); });
      return m;
    }
    items.forEach(function (it) {
      if (cur.length && worst(cur.concat([it])) > worst(cur)) { cols.push(cur); cur = []; }
      cur.push(it);
    });
    if (cur.length) cols.push(cur);
    var x = x0;
    cols.forEach(function (col, ci) {
      var sum = col.reduce(function (s, it) { return s + it.v; }, 0), w = sum * scale / H, y = y0;
      col.forEach(function (it, ri) {
        var h = it.v * scale / w;
        it.x = x; it.y = y; it.w = w; it.h = h; it.dark = (ci + ri) % 2 === 1;
        y += h;
      });
      x += w;
    });
    return items;
  }

  // =================== language page ===================
  // one bird for every N words; the languages with less than half a bird fly together as "the other languages"
  function flock(rows, N, total, otherName) {
    var own = [], rest = [], restN = 0;
    rows.forEach(function (r) { var b = Math.round(r.n / N); if (b >= 1) own.push({ name: r.name, code: r.code, n: r.n, birds: b }); else { rest.push(r); restN += r.n; } });
    if (rest.length) own.push({ name: rest.length + " " + otherName, n: restN, birds: Math.max(1, Math.round(restN / N)), other: true, count: rest.length });
    return own;
  }
  function cellsNeeded(f) { return f.reduce(function (s, r) { return s + r.birds; }, 0) + f.length - 1; }

  function dayAndNight(D) {
    var W = 1120, s = 56, seam = W / 2, g1 = bird(s, 1), bw = g1.box[2] - g1.box[0], step = Math.abs(g1.p[0] + g1.q[0]);
    var perRow = Math.floor((seam - bw + step) / step), rowH = Math.abs(g1.p[1] - g1.q[1]);
    var Ns = [50, 100, 200, 250, 500, 1000], N, fl, fr, R;
    for (var i = 0; i < Ns.length; i++) {
      N = Ns[i];
      fl = flock(D.from, N, D.fromTotal, "other languages");
      fr = flock(D.to, N, D.toTotal, "other languages");
      R = Math.max(Math.ceil(cellsNeeded(fl) / perRow), Math.ceil(cellsNeeded(fr) / perRow));
      if (R <= 8) break;
    }
    var top = 34, yF = top + (R + 0.5) * rowH + 2.6 * s, FH = 168, H = yF + FH;
    function tAt(y) { return Math.max(0, Math.min(1, (yF - y - s * 0.3) / (2.2 * s))); }
    var cells = lattice(s, seam, yF, -s * 2, -s * 2, W + s * 2, yF + s * 2);
    cells.forEach(function (c) { c.t = tAt(c.y); });
    // which cells carry the data: white ones on the left, black ones on the right, rows from the fields upwards,
    // each row from the middle outwards
    function slots(isWhite, leftSide) {
      return cells.filter(function (c) {
        return c.white === isWhite && c.t >= 1 && c.y + g1.box[1] >= top - 1 &&
          (leftSide ? c.x + g1.box[2] <= seam + 0.5 && c.x + g1.box[0] >= 0 : c.x + g1.box[0] >= seam - 0.5 && c.x + g1.box[2] <= W);
      }).sort(function (a, b) { return Math.round(b.y - a.y) || (leftSide ? b.x - a.x : a.x - b.x); });
    }
    function assign(list, fls) {
      var k = 0, runs = [];
      fls.forEach(function (f, fi) {
        var run = { f: f, cells: [] };
        for (var j = 0; j < f.birds && k < list.length; j++) { list[k].lang = f; run.cells.push(list[k]); k++; }
        runs.push(run);
        if (fi < fls.length - 1) k++;  // one empty cell between two languages
      });
      return runs;
    }
    var runsL = assign(slots(true, true), fl), runsR = assign(slots(false, false), fr);

    // fields: every language Italian took from or gave to, from the pure sources (left) to the pure takers (right)
    var by = {};
    D.from.forEach(function (r) { by[r.code] = { code: r.code, name: r.name, took: r.n, gave: 0 }; });
    D.to.forEach(function (r) { (by[r.code] = by[r.code] || { code: r.code, name: r.name, took: 0, gave: 0 }).gave = r.n; });
    var all = Object.keys(by).map(function (k) { var o = by[k]; o.v = o.took + o.gave; o.bal = (o.gave - o.took) / o.v; return o; });
    var big = all.filter(function (o) { return o.v >= 60; }), small = all.filter(function (o) { return o.v < 60; });
    var smallS = small.filter(function (o) { return o.bal <= 0; }), smallT = small.filter(function (o) { return o.bal > 0; });
    function lump(list, side) {
      var o = { name: list.length + " other languages", took: 0, gave: 0, other: true, side: side };
      list.forEach(function (x) { o.took += x.took; o.gave += x.gave; });
      o.v = o.took + o.gave;
      return o;
    }
    big.sort(function (a, b) { return a.bal - b.bal || b.v - a.v; });
    var fields = (smallS.length ? [lump(smallS, -1)] : []).concat(big).concat(smallT.length ? [lump(smallT, 1)] : []);
    stripMap(fields, 0, yF, W, FH);

    var o = ['<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Day and Night: the languages of Italian as fields that turn into two flocks of birds">'];
    o.push("<defs>" + ANGLES.map(function (a, i) { return furrows("fl" + i, a, false) + furrows("fd" + i, a, true); }).join("") +
      '<clipPath id="above"><rect x="0" y="0" width="' + W + '" height="' + yF + '"/></clipPath></defs>');
    // the sky: night on the left, where the white birds are seen; day on the right, where the black ones are
    o.push('<rect x="0" y="0" width="' + seam + '" height="' + yF + '" fill="' + INK + '"/>');
    o.push('<rect x="' + seam + '" y="0" width="' + seam + '" height="' + yF + '" fill="' + PAPER + '"/>');
    o.push('<g clip-path="url(#above)">');
    cells.forEach(function (c) {
      var left = c.x < seam, fill;
      if (c.t < 1) fill = c.white ? PAPER : INK;              // the chequerboard: both colours are seen
      else if (c.white) fill = left ? (c.lang ? PAPER : INK) : PAPER;  // on the left only the white birds of the flock
      else fill = left ? INK : (c.lang ? INK : PAPER);         // on the right only the black birds of the flock
      var seen = c.t < 1 || c.lang;
      o.push('<path d="' + birdPath(c.x, c.y, s, c.t) + '" fill="' + fill + '"' + (c.t < 1 ? ' stroke="' + INK + '" stroke-width="0.6"' : "") + "/>");
      if (seen && c.t > 0.6) o.push(eye(c.x, c.y, s, c.white ? INK : PAPER));
    });
    o.push("</g>");
    // names of the flocks: on the line of the other colour just under the row of the run, else above it
    var boxes = [];
    function free(b) { return !boxes.some(function (q) { return b[0] < q[2] && b[2] > q[0] && b[1] < q[3] && b[3] > q[1]; }); }
    function name(runs, leftSide) {
      runs.forEach(function (run) {
        if (!run.cells.length) return;
        var c = run.cells[0], txt = esc(run.f.name) + " " + n(run.f.n), w = textW(run.f.name + " " + n(run.f.n), 17);
        var xs = leftSide ? c.x + g1.box[2] - 2 : c.x + g1.box[0] + 2, anchor = leftSide ? "end" : "start";
        var tries = [c.y + rowH / 2 + 6, c.y - rowH / 2 + 6, c.y + 6];
        for (var k = 0; k < tries.length; k++) {
          var yy = tries[k], bx = leftSide ? [xs - w, yy - 14, xs, yy + 4] : [xs, yy - 14, xs + w, yy + 4];
          if ((free(bx) && bx[0] >= 2 && bx[2] <= W - 2 && yy - 14 > 2 && yy + 4 < yF) || k === tries.length - 1) {
            boxes.push(bx);
            o.push(label(xs, yy, txt, { anchor: anchor, white: leftSide, halo: 5 }));
            break;
          }
        }
      });
    }
    name(runsL, true);
    name(runsR, false);
    // the fields
    fields.forEach(function (f, i) {
      var pat = (f.dark ? "fd" : "fl") + (i % ANGLES.length);
      o.push('<rect x="' + r1(f.x) + '" y="' + r1(f.y) + '" width="' + r1(f.w) + '" height="' + r1(f.h) + '" fill="url(#' + pat + ')" stroke="' + INK + '" stroke-width="1"/>');
      var line2 = (f.took ? "took " + n(f.took) : "") + (f.took && f.gave ? " · " : "") + (f.gave ? "gave " + n(f.gave) : "");
      var cx = f.x + f.w / 2, cy = f.y + f.h / 2;
      if (f.w > textW(f.name, 17) + 10 && f.h > 52 && f.w > textW(line2, 15) + 10) {
        o.push(label(cx, cy - 4, esc(f.name), { anchor: "middle", white: f.dark, italic: true }));
        o.push(label(cx, cy + 16, line2, { anchor: "middle", white: f.dark, size: 15 }));
      } else if (f.w > textW(f.name, 15) + 8 && f.h > 24) {
        o.push(label(cx, cy + 5, esc(f.name), { anchor: "middle", white: f.dark, size: 15, italic: true }));
      }
    });
    o.push('<rect x="0.5" y="0.5" width="' + (W - 1) + '" height="' + (H - 1) + '" fill="none" stroke="' + INK + '" stroke-width="1"/>');
    o.push("</svg>");
    return { svg: o.join(""), N: N, fl: fl, fr: fr, fields: fields };
  }

  function languagePage(code) {
    B.language(code).then(function (D) {
      var l = D.lang;
      document.title = l.name + " — lexodus (Day and Night draft)";
      var P = dayAndNight(D);
      var h = [];
      h.push('<div class="sheet">');
      h.push('<div class="title"><h1>' + esc(l.name) + " <i>by day and by night</i></h1></div>");
      h.push('<div class="lede"><p>' + esc(l.name) + " took <b>" + n(D.fromTotal) + "</b> words from " + D.from.length + " languages and gave <b>" + n(D.toTotal) +
        "</b> to " + D.to.length + ".</p><p>Read the print from the bottom: each field is a language, as large as the words it exchanged with " + esc(l.name) +
        ". Rising, the fields turn into birds. On the left, against the night, the white flock flies in: the languages " + esc(l.name) +
        " took from. On the right, against the day, the black flock flies out: the languages it gave to.</p></div>");
      h.push('<figure class="plate wide"><div class="cap"><span class="no">Plate I</span><h2>Day and night: one bird for every ' + n(P.N) + " words</h2></div>" +
        '<div class="box">' + P.svg + "</div>" +
        '<p class="note">White and black birds are the same shape and fill the sky together; a bird is only seen against the sky of the other colour, as in the print. ' +
        "Each language has a bird for every " + n(P.N) + " words, rounded to the nearest bird, starting from the middle; an empty place separates one language from the next. " +
        "Languages worth less than half a bird fly together at the end of each flock. Fields: from the languages " + esc(l.name) + " only took from (left) to those it only gave to (right); light and dark alternate as on a chequerboard.</p></figure>");
      function table(cls, no, title, rows, fl) {
        var birds = {};
        fl.forEach(function (f) { if (!f.other) birds[f.code] = f.birds; });
        var other = fl.filter(function (f) { return f.other; })[0];
        return '<section class="plate ' + cls + '"><div class="cap"><span class="no">' + no + "</span><h2>" + title + '</h2></div><table class="tbl"><tr><th>language</th><th class="n">birds</th><th class="n">words</th><th>for example</th></tr>' +
          rows.slice(0, 16).map(function (r) {
            return "<tr><td>" + esc(r.name) + '</td><td class="n">' + (birds[r.code] || "–") + '</td><td class="n">' + n(r.n) + '</td><td class="ex">' + esc(r.ex.slice(0, 3).join(", ")) + "</td></tr>";
          }).join("") +
          (rows.length > 16 ? "<tr><td>" + (rows.length - 16) + ' more</td><td class="n"></td><td class="n">' + n(rows.slice(16).reduce(function (s, r) { return s + r.n; }, 0)) + "</td><td></td></tr>" : "") +
          "</table>" + (other ? '<p class="note">The last ' + other.birds + (other.birds === 1 ? " bird is" : " birds are") + " the " + n(other.n) + " words of " + other.count + " languages under " + n(P.N / 2) + " words each.</p>" : "") + "</section>";
      }
      h.push(table("half", "The white flock", "What " + esc(l.name) + " took", D.from, P.fl));
      h.push(table("half2", "The black flock", "What " + esc(l.name) + " gave", D.to, P.fr));
      h.push("</div>");
      app.innerHTML = h.join("");
    }).catch(fail);
  }

  // =================== word page ===================
  function crossingPlate(stops, crossing) {
    // stops: [Arabic, Ottoman Turkish, Italian]; crossing: the Italian words of the same crossing (from level 2)
    var W = 1120, s = 72, H = 400, seam = W / 2, midY = H / 2;
    var xA = 420, xB = 540, xC = 660, xD = 790;   // t: 1 before xA, down to 0 at xB, 0 until xC, up to 1 at xD
    function tAt(x) { return x <= xA ? 1 : x < xB ? (xB - x) / (xB - xA) : x <= xC ? 0 : x < xD ? (x - xC) / (xD - xC) : 1; }
    var cells = lattice(s, seam, midY, -s * 2, -s * 2, W + s * 2, H + s * 2), g1 = bird(s, 1);
    cells.forEach(function (c) { c.t = tAt(c.x); });
    // the traveller: the black bird nearest the fields on the middle row (day side), the white one on the night side
    function nearest(list, px, py) { return list.slice().sort(function (a, b) { return Math.hypot(a.x - px, a.y - py) - Math.hypot(b.x - px, b.y - py); })[0]; }
    var dayBirds = cells.filter(function (c) { return !c.white && c.t >= 1 && c.x < xA && c.x + g1.box[0] >= 0 && c.y + g1.box[1] >= 0 && c.y + g1.box[3] <= H; });
    var nightBirds = cells.filter(function (c) { return c.white && c.t >= 1 && c.x > xD && c.x + g1.box[2] <= W && c.y + g1.box[1] >= 0 && c.y + g1.box[3] <= H; });
    var from = nearest(dayBirds, xA - s / 2, midY), to = nearest(nightBirds, xD + s / 2, midY);
    from.role = "from"; to.role = "to";
    var field = nearest(cells.filter(function (c) { return c.t === 0; }), (xB + xC) / 2, midY);
    field.role = "field";
    // the other words of the crossing: black birds on the day side, nearest the traveller first
    var others = crossing.filter(function (w) { return w !== stops[2].term; });
    // each word goes to the nearest free black bird whose name, written to its left, does not touch another name
    var boxes = [[from.x + g1.box[0] - 30, from.y + g1.box[3] - 4, from.x + g1.box[2] + 60, from.y + g1.box[3] + 48]];
    var free = dayBirds.filter(function (c) { return c !== from; }).sort(function (a, b) {
      return Math.hypot(a.x - from.x, (a.y - from.y) * 1.6) - Math.hypot(b.x - from.x, (b.y - from.y) * 1.6);
    });
    others.forEach(function (w) {
      var wd = textW(w, 17) + 6;
      for (var k = 0; k < free.length; k++) {
        var c = free[k];
        if (c.role) continue;
        var bx = [c.x + g1.box[0] - 4 - wd, c.y - 12, c.x + g1.box[2], c.y + 10];
        if (bx[0] < 4) continue;
        if (boxes.some(function (q) { return bx[0] < q[2] && bx[2] > q[0] && bx[1] < q[3] && bx[3] > q[1]; })) continue;
        boxes.push(bx); c.role = "word"; c.word = w;
        return;
      }
    });

    var o = ['<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="caffè crossing from Arabic to Italian">'];
    o.push("<defs>" + furrows("cf", 35, false) + '<clipPath id="cl"><rect x="0" y="0" width="' + W + '" height="' + H + '"/></clipPath></defs>');
    o.push('<rect x="0" y="0" width="' + seam + '" height="' + H + '" fill="' + PAPER + '"/><rect x="' + seam + '" y="0" width="' + seam + '" height="' + H + '" fill="' + INK + '"/>');
    o.push('<g clip-path="url(#cl)">');
    cells.forEach(function (c) {
      var day = c.x < seam, fill;
      if (c.t < 1) fill = c.role === "field" ? "url(#cf)" : c.white ? PAPER : INK;
      else if (day) fill = c.white ? PAPER : (c.role ? INK : PAPER);
      else fill = c.white ? (c.role ? PAPER : INK) : INK;
      o.push('<path d="' + birdPath(c.x, c.y, s, c.t) + '" fill="' + fill + '"' + (c.t < 1 || c.role === "field" ? ' stroke="' + INK + '" stroke-width="0.8"' : "") + "/>");
      var stays = day ? !c.white : c.white;  // the colour that goes on as birds on this side
      if ((c.t < 1 && c.t > 0.6 && stays) || c.role === "from" || c.role === "to" || c.role === "word") o.push(eye(c.x, c.y, s, c.white ? INK : PAPER));
    });
    o.push("</g>");
    // labels
    others.forEach(function () {});
    cells.forEach(function (c) {
      if (c.role === "word") o.push(label(c.x + g1.box[0] - 4, c.y + 6, esc(c.word), { anchor: "end", italic: true }));
    });
    var a = stops[0], b = stops[1], it = stops[2];
    o.push(label(from.x, from.y + g1.box[3] + 24, esc(a.term), { anchor: "middle", size: 26 }));
    o.push(label(from.x, from.y + g1.box[3] + 44, '<tspan font-style="italic">' + esc(a.tr) + "</tspan> · " + esc(a.name), { anchor: "middle" }));
    o.push(label(field.x, field.y - 34, esc(b.term), { anchor: "middle", size: 26 }));
    o.push(label(field.x, field.y + 50, '<tspan font-style="italic">' + esc(b.tr) + "</tspan> · " + esc(b.name), { anchor: "middle" }));
    o.push(label(to.x, to.y + g1.box[3] + 26, esc(it.term), { anchor: "middle", size: 26, white: true, italic: true }));
    o.push(label(to.x, to.y + g1.box[3] + 46, esc(it.name), { anchor: "middle", white: true }));
    o.push('<rect x="0.5" y="0.5" width="' + (W - 1) + '" height="' + (H - 1) + '" fill="none" stroke="' + INK + '" stroke-width="1"/>');
    o.push("</svg>");
    return o.join("");
  }

  // the flock after the word: small white birds on the night, a column (or two) per generation
  function flockPlate(gens) {
    var W = 1120, s = 30, rowH = 30, pad = 26;
    var cols = [];
    gens.forEach(function (g, gi) {
      var per = 13, parts = Math.ceil(g.length / per);
      for (var p = 0; p < parts; p++) cols.push({ g: gi + 1, list: g.slice(p * per, (p + 1) * per), first: p === 0 });
    });
    var colW = Math.floor((W - pad) / cols.length), maxRows = Math.max.apply(null, cols.map(function (c) { return c.list.length; }));
    var H = pad * 2 + 30 + maxRows * rowH;
    var o = ['<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="The flock of the words that took caffè">'];
    o.push('<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="' + INK + '"/>');
    cols.forEach(function (c, ci) {
      var x = pad + ci * colW;
      if (c.first) o.push(label(x, pad + 8, "generation " + c.g, { white: true, cls: "scx" }));
      c.list.forEach(function (nd, ri) {
        var y = pad + 30 + ri * rowH + rowH / 2;
        o.push('<path d="' + birdPath(x + s / 2, y, s, 1) + '" fill="' + PAPER + '"/>' + eye(x + s / 2, y, s, INK));
        var wd = B.readable(nd.word, nd.tr);
        o.push(label(x + s + 8, y + 6, '<tspan font-style="italic">' + esc(wd) + "</tspan> " + esc(nd.name), { white: true, size: 16, halo: 4 }));
      });
    });
    o.push("</svg>");
    return o.join("");
  }

  function wordPage() {
    var lang = B.param("lang") || "it", w = B.param("w") || "caffè", ne = +(B.param("n") || 1), from = B.param("from");
    Promise.all([B.word(lang, w, ne, from), B.level2()]).then(function (res) {
      var R = res[0], L2 = res[1], L = R.L;
      if (!R.tree) throw new Error("No tree for this word.");
      var full = B.fullTree(L, lang, R.tree), p = R.p || {};
      var stops = B.journey(L, lang, p.catena ? p : { su: R.tree.e.su, parola: w, traslitterazione: R.tree.e.traslitterazione });
      document.title = w + " — lexodus (Day and Night draft)";
      // the crossing: the last three stops (origin, the language in between, Italian)
      var tri = stops.slice(-3);
      while (tri.length < 3) tri.unshift(tri[0]);
      var key = lang + "|" + tri[1].code, list = (L2.da_chi_ha_preso[key] || []).filter(function (x) { return x.codice === tri[0].code; })[0];
      var crossing = list ? list.esempi.slice() : [w];
      var crossN = list ? list.n : 1;
      if (crossing.indexOf(w) < 0) crossing.unshift(w);
      // generations after the word
      var gens = [];
      (function walk(nd, g) { if (g > 0) (gens[g - 1] = gens[g - 1] || []).push(nd); nd.kids.forEach(function (k) { walk(k, g + 1); }); })(full.me, 0);
      var h = [];
      h.push('<div class="sheet">');
      h.push('<div class="title"><h1>' + esc(w) + " <i>from day into night</i></h1></div>");
      h.push('<div class="lede"><p>' + esc(full.me.mean || p.significato || "") + ". " + esc(L.by[lang] ? L.by[lang].name : lang) + " word, taken from " + esc(tri[1].name) +
        ", which had it from " + esc(tri[0].name) + ". " + n(full.count) + " words in other languages came after it.</p>" +
        (R.text ? '<p class="quote">“' + esc(R.text) + "” (Wiktionary)</p>" : "") + "</div>");
      h.push('<figure class="plate wide"><div class="cap"><span class="no">Plate I</span><h2>The crossing: ' + tri.map(function (s) { return esc(B.readable(s.term, s.tr)); }).join(" → ") + "</h2></div>" +
        '<div class="box">' + crossingPlate(tri, crossing) + "</div>" +
        '<p class="note">' + esc(w) + " leaves " + esc(tri[0].name) + " as a black bird on the day side, becomes a field of the chequerboard in " + esc(tri[1].name) +
        " (the furrowed lozenge) and comes out as a white bird on the night side, in " + esc(L.by[lang] ? L.by[lang].name : lang) + ". The other black birds are the other " +
        (crossN - 1) + " " + esc(L.by[lang] ? L.by[lang].name : lang) + " words that made the same crossing, " + esc(tri[0].name) + " to " + esc(tri[1].name) + " to " + esc(L.by[lang] ? L.by[lang].name : lang) + ".</p></figure>");
      h.push('<figure class="plate wide"><div class="cap"><span class="no">Plate II</span><h2>The flock after ' + esc(w) + ": " + n(full.count) + " words in " + gens.length + " generations</h2></div>" +
        '<div class="box">' + flockPlate(gens) + "</div></figure>");
      h.push('<section class="plate half"><div class="cap"><span class="no">The road</span><h2>Stop by stop</h2></div><table class="tbl"><tr><th>language</th><th>word</th><th>read</th><th>how it passed on</th></tr>' +
        stops.map(function (st) { return "<tr><td>" + esc(st.name) + '</td><td class="ex">' + esc(st.term) + '</td><td class="ex">' + esc(B.readable(st.term, st.tr)) + "</td><td>" + esc(st.how || (st.here ? "this word" : "")) + "</td></tr>"; }).join("") +
        "</table>" + '<p class="note">The ' + crossN + " words of the crossing " + esc(tri[0].name) + " → " + esc(tri[1].name) + " → " + esc(L.by[lang] ? L.by[lang].name : lang) + ": <i>" + esc(crossing.join(", ")) + "</i>.</p></section>");
      h.push('<section class="plate half2"><div class="cap"><span class="no">The flock</span><h2>Generation by generation</h2></div><ul class="gens">' +
        gens.map(function (g, gi) {
          return '<li class="g">generation ' + (gi + 1) + " · " + g.length + (g.length === 1 ? " word" : " words") + "</li>" + g.map(function (nd) {
            return "<li><i>" + esc(B.readable(nd.word, nd.tr)) + "</i> " + esc(nd.name) + (nd.how ? ", " + esc(nd.how) : "") + "</li>";
          }).join("");
        }).join("") + "</ul></section>");
      h.push("</div>");
      app.innerHTML = h.join("");
    }).catch(fail);
  }

  if (page === "language") languagePage(B.param("code") || "it");
  else wordPage();
})();
