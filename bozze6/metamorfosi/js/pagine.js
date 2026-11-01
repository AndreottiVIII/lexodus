/* lexodus, draft "metamorfosi" (bozze6): M. C. Escher's "Metamorphosis II" (1939-40), drawn in SVG from the data.
   The strip is a grid of squares. Every square (tile) has an animal and a bending t from 0 (a square) to 1 (the
   animal). A side shared by two tiles of the same animal is bent with that animal's curve, scaled by the mean of
   their t; a side between two different animals stays straight. The upper and lower sides of every tile carry the
   same curve, and so do the left and right ones, so the bent tiles still fill the plane without gaps: the morph is
   an interpolation between the square and the animal, computed side by side, column by column.
   Word page: the longest road of the word's tree, word after word; each word is written one letter to a square,
   then the squares bend into an animal and back into the letters of the next word.
   Language page: from the left the languages Italian took from come in as bands of animals (one row of tiles for
   every N words), they straighten into the squares of the middle, where the example words are written, and on the
   right the bands of the languages it gave to bend back into animals. On a telephone the strip runs downwards. */
(function () {
  "use strict";
  var app = document.getElementById("app"), page = document.body.getAttribute("data-page");
  var esc = B.esc, n = B.n, r1 = B.r1;
  var INK = "#111", PAPER = "#fff";
  var PHONE = window.innerWidth < 760;

  function fail(e) {
    app.innerHTML = '<p class="loading">The data could not be read: ' + esc(e && e.message) + "</p>";
    if (window.console) console.error(e);
  }

  // ================= the animals =================
  // H: the curve of the upper (and lower) side, V: of the left (and right) side; [u along the side, offset in units
  // of the side, along the normal (-dy, dx)]. eye: where the eye is, in units of the tile (it may sit in the part of
  // the animal that reaches into the next square).
  var ANIMALS = [
    { name: "birds", H: [[0, 0], [0.15, -0.02], [0.3, -0.3], [0.42, -0.42], [0.55, -0.2], [0.75, 0.04], [1, 0]],
      V: [[0, 0], [0.12, -0.05], [0.25, -0.24], [0.33, -0.1], [0.5, -0.02], [0.75, 0.1], [1, 0]], eye: [1.06, 0.22] },
    { name: "fish", H: [[0, 0], [0.25, 0.1], [0.5, -0.15], [0.65, -0.22], [0.8, -0.05], [1, 0]],
      V: [[0, 0], [0.15, -0.05], [0.4, -0.36], [0.62, -0.42], [0.82, -0.16], [1, 0]], eye: [1.14, 0.5] },
    { name: "lizards", H: [[0, 0], [0.15, 0.08], [0.3, 0.26], [0.45, 0.1], [0.55, -0.1], [0.7, -0.26], [0.85, -0.08], [1, 0]],
      V: [[0, 0], [0.15, 0.08], [0.3, 0.26], [0.45, 0.1], [0.55, -0.1], [0.7, -0.26], [0.85, -0.08], [1, 0]], eye: [0.62, 0.3] }
  ];
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
  ANIMALS.forEach(function (a) { a.sH = smooth(a.H, 5); a.sV = smooth(a.V, 5); });
  function side(a, b, sm, t) {
    if (!sm || t <= 0) return [a, b];
    var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
    return sm.map(function (q) { return [a[0] + dx * q[0] + nx * q[1] * L * t, a[1] + dy * q[0] + ny * q[1] * L * t]; });
  }

  // ================= the strip =================
  // cells[i][j] = {a: animal index or -1, band: id, t, fill, letter} for column i, row j (null: nothing there).
  // u: size of a square. Returns the SVG body (paths, eyes, letters) in strip coordinates through map().
  function strip(cells, u, map) {
    var cols = cells.length, rows = cells[0].length, o = [], eyes = [], letters = [];
    function cell(i, j) { return i >= 0 && i < cols && j >= 0 && j < rows ? cells[i][j] : null; }
    function shared(c1, c2) {           // the curve and the bending of a side between two tiles
      var c = c1, d = c2;   // the outer border of the strip stays straight
      if (!c || !d || c.a < 0 || d.a < 0 || c.band !== d.band || c.a !== d.a) return { t: 0 };
      return { a: ANIMALS[c.a], t: (c.t + d.t) / 2 };
    }
    var cache = {};
    function hSide(i, j) {   // the side from corner (i, j) to (i + 1, j), between rows j - 1 and j
      var k = "h" + i + "," + j;
      if (!cache[k]) { var s = shared(cell(i, j - 1), cell(i, j)); cache[k] = side([i * u, j * u], [(i + 1) * u, j * u], s.a && s.a.sH, s.t); }
      return cache[k];
    }
    function vSide(i, j) {   // the side from corner (i, j) to (i, j + 1), between columns i - 1 and i
      var k = "v" + i + "," + j;
      if (!cache[k]) { var s = shared(cell(i - 1, j), cell(i, j)); cache[k] = side([i * u, j * u], [i * u, (j + 1) * u], s.a && s.a.sV, s.t); }
      return cache[k];
    }
    function P(p) { var q = map(p[0], p[1]); return r1(q[0]) + " " + r1(q[1]); }
    for (var i = 0; i < cols; i++) for (var j = 0; j < rows; j++) {
      var c = cells[i][j];
      if (!c) continue;
      var top = hSide(i, j), right = vSide(i + 1, j), bot = hSide(i, j + 1), left = vSide(i, j);
      var pts = top.concat(right.slice(1)).concat(bot.slice().reverse().slice(1)).concat(left.slice().reverse().slice(1, -1));
      var white = c.fill === "w";
      o.push('<path d="M' + pts.map(P).join("L") + 'Z" fill="' + (white ? PAPER : INK) + '"/>');
      if (c.a >= 0 && c.t > 0.7) {
        var e = ANIMALS[c.a].eye, q = map((i + e[0]) * u, (j + e[1]) * u);
        eyes.push('<circle cx="' + r1(q[0]) + '" cy="' + r1(q[1]) + '" r="' + r1(Math.max(1.5, u * 0.05)) + '" fill="' + (white ? INK : PAPER) + '"/>');
      }
      if (c.letter) {
        var m = map((i + 0.5) * u, (j + 0.5) * u), col = white ? INK : PAPER;
        letters.push('<text x="' + r1(m[0]) + '" y="' + r1(m[1] + u * 0.22) + '" text-anchor="middle" font-size="' + Math.round(u * 0.62) + '"' + ' style="fill:' + col + '"' + ' fill="' + col + '">' + esc(c.letter) + "</text>");
      }
    }
    return o.join("") + eyes.join("") + letters.join("");
  }
  function graphemes(w) {
    if (window.Intl && Intl.Segmenter) return Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(w)).map(function (s) { return s.segment; });
    return Array.from(w);
  }
  function rtl(w) { return /[֐-ࣿ]/.test(w); }
  function label(x, y, txt, o) {
    o = o || {};
    var col = o.white ? PAPER : INK, halo = o.white ? INK : PAPER;
    return '<text x="' + r1(x) + '" y="' + r1(y) + '" text-anchor="' + (o.anchor || "middle") + '" font-size="' + (o.size || 17) + '"' + (o.italic ? ' font-style="italic"' : "") +
      (o.cls ? ' class="' + o.cls + '"' : "") + ' fill="' + col + '" style="fill:' + col + '"' + (o.halo === 0 ? "" : ' stroke="' + halo + '" stroke-width="' + (o.halo || 4) + '" stroke-linejoin="miter" paint-order="stroke"') + ">" + txt + "</text>";
  }

  // =================== word page ===================
  function wordStrip(road, arcsList, L) {
    var u = 40, rows = 5, mid = 2, cap = PHONE ? 138 : 104;
    var cols = [], marks = [];   // marks: where each word is, and where each crossing is
    function col(a, t, letters) { cols.push({ a: a, t: t, letters: letters || {} }); }
    road.forEach(function (st, k) {
      var raw = st.word, g = graphemes(raw);
      if (rtl(raw) && !PHONE) g = g.reverse();   // across the page right to left; down the page, first letter on top
      var w0 = cols.length, width = Math.max(g.length, 3) + 2, start = Math.floor((width - g.length) / 2);
      for (var c = 0; c < width; c++) { var L = {}; if (c >= start && c < start + g.length) L[mid] = g[c - start]; col(-1, 0, L); }
      marks.push({ kind: "word", st: st, from: w0, to: cols.length, serif: !B.isLatinScript(raw) });
      if (k < road.length - 1) {
        var a = k % ANIMALS.length, c0 = cols.length;
        [0.35, 0.7, 1, 1, 1, 0.7, 0.35].forEach(function (t) { col(a, t); });
        marks.push({ kind: "cross", a: a, from: c0, to: cols.length, st: st, next: road[k + 1] });
      }
    });
    var cells = cols.map(function (c, i) {
      var out = [];
      for (var j = 0; j < rows; j++) {
        var serif = false;
        marks.forEach(function (m) { if (m.kind === "word" && i >= m.from && i < m.to) serif = m.serif; });
        out.push({ a: c.a, band: 0, t: c.t, fill: (i + j) % 2 === 0 ? "w" : "b", letter: c.letters[j], serif: serif });
      }
      return out;
    });
    var len = cols.length * u, wide = rows * u;
    // horizontal: x along the strip, captions above; vertical (telephone): y along the strip, captions on the left
    var W = PHONE ? cap + wide + 2 : len, H = PHONE ? len : cap + wide + 30;
    function map(x, y) { return PHONE ? [cap + y, x] : [x, cap + y]; }
    var o = ['<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Metamorphosis of the word along its longest road">'];
    o.push(strip(cells, u, map));
    marks.forEach(function (m) {
      var cu = (m.from + m.to) / 2 * u;
      if (m.kind === "word") {
        var rd = B.readable(m.st.word, m.st.tr);
        if (PHONE) {
          o.push(label(cap - 10, cu - 12, esc(m.st.word), { anchor: "end", size: 26, italic: B.isLatinScript(m.st.word) }));
          if (rd !== m.st.word) o.push(label(cap - 10, cu + 12, "<tspan font-style=\"italic\">" + esc(rd) + "</tspan>", { anchor: "end" }));
          o.push(label(cap - 10, cu + 32, esc(m.st.name), { anchor: "end", cls: "scx" }));
        } else {
          o.push(label(cu, cap - 62, esc(m.st.word), { size: 30, italic: B.isLatinScript(m.st.word), halo: 0 }));
          o.push(label(cu, cap - 36, (rd !== m.st.word ? "<tspan font-style=\"italic\">" + esc(rd) + "</tspan> · " : "") + esc(m.st.name), { halo: 0 }));
          if (m.st.here) o.push(label(cu, cap - 14, "this word", { cls: "scx", halo: 0 }));
        }
      } else {
        var pc = B.arcCount(arcsList, m.st.code, m.next.code), counted = L.by[m.next.code] && L.by[m.next.code].target;
        var t1 = esc(m.next.how || "passed on"), t3 = ANIMALS[m.a].name;
        var t2 = counted ? n(pc) + " words " + esc(m.st.name) + " → " + esc(m.next.name) : esc(m.next.name) + " is not one of the 33: not counted";
        if (PHONE) {
          o.push(label(cap - 10, cu - 10, t1, { anchor: "end", italic: true }));
          o.push(label(cap - 10, cu + 10, counted ? n(pc) + " words" : "not counted", { anchor: "end" }));
          o.push(label(cap - 10, cu + 30, t3, { anchor: "end", italic: true }));
        } else {
          o.push(label(cu, cap - 36, t1 + " · " + t3, { italic: true, halo: 0 }));
          o.push(label(cu, cap + wide + 22, t2, { halo: 0 }));
        }
      }
    });
    o.push("</svg>");
    return o.join("");
  }

  function wordPage() {
    var lang = B.param("lang") || "it", w = B.param("w") || "caffè", ne = +(B.param("n") || 1), from = B.param("from");
    Promise.all([B.word(lang, w, ne, from), B.arcs()]).then(function (res) {
      var R = res[0], arcsList = res[1], L = R.L;
      if (!R.tree) throw new Error("No tree for this word.");
      var full = B.fullTree(L, lang, R.tree), p = R.p || {};
      var road = B.longestRoad(full.root).map(function (nd) { return { word: nd.word, tr: nd.tr, name: nd.name, how: nd.how, here: !!nd.here, code: B.merged(nd.code) }; });
      document.title = w + " — lexodus (Metamorphosis draft)";
      var gens = [];
      (function walk(nd, g) { if (g > 0) (gens[g - 1] = gens[g - 1] || []).push(nd); nd.kids.forEach(function (k) { walk(k, g + 1); }); })(full.me, 0);
      var h = [];
      h.push('<div class="sheet">');
      h.push('<div class="title"><h1>' + esc(w) + " <i>a metamorphosis</i></h1></div>");
      h.push('<div class="lede"><p>' + esc(full.me.mean || p.significato || "") + ". " + esc(L.by[lang] ? L.by[lang].name : lang) + " word. Its tree has " + n(full.count) +
        " words after it; the longest road through it runs through " + road.length + " languages, from " + esc(road[0].name) + " to " + esc(road[road.length - 1].name) + ".</p>" +
        (R.text ? '<p class="quote">“' + esc(R.text) + "” (Wiktionary)</p>" : "") + "</div>");
      h.push('<figure class="plate wide"><div class="cap"><span class="no">Plate I</span><h2>' + road.map(function (s) { return esc(B.readable(s.word, s.tr)); }).join(" → ") + "</h2></div>" +
        '<div class="strip">' + wordStrip(road, arcsList, L) + "</div>" +
        '<p class="note">' + (PHONE ? "Read downwards. " : "Read from left to right; the strip scrolls sideways. ") +
        "Each word is written one letter to a square" + (PHONE ? "." : " (right to left for Arabic and Ottoman Turkish, as they are written).") + " Between two words the squares bend into birds, fish or lizards and straighten again into the next word; under each crossing, the number of words the second language took from the first.</p></figure>");
      h.push('<section class="plate half"><div class="cap"><span class="no">The road</span><h2>Stop by stop</h2></div><table class="tbl"><tr><th>language</th><th>word</th><th>how</th><th class="n">words of the pair</th></tr>' +
        road.map(function (st, k) {
          var pc = k && L.by[st.code] && L.by[st.code].target ? B.arcCount(arcsList, road[k - 1].code, st.code) : null;
          return "<tr><td>" + esc(st.name) + '</td><td class="ex">' + esc(st.word) + (B.readable(st.word, st.tr) !== st.word ? " (" + esc(st.tr) + ")" : "") + "</td><td>" + esc(st.how || (k ? "" : "the farthest origin")) +
            '</td><td class="n">' + (pc === null ? (k ? "not counted" : "") : n(pc)) + "</td></tr>";
        }).join("") + "</table></section>");
      h.push('<section class="plate half2"><div class="cap"><span class="no">The tree</span><h2>Every word after ' + esc(w) + "</h2></div><ul class=\"gens\">" +
        gens.map(function (g, gi) {
          return '<li class="g">generation ' + (gi + 1) + " · " + g.length + (g.length === 1 ? " word" : " words") + "</li>" + g.map(function (nd) {
            return "<li><i>" + esc(B.readable(nd.word, nd.tr)) + "</i> " + esc(nd.name) + "</li>";
          }).join("");
        }).join("") + "</ul></section>");
      h.push("</div>");
      app.innerHTML = h.join("");
    }).catch(fail);
  }

  // =================== language page ===================
  function bandsOf(rows, N) {
    var out = [], rest = [], restN = 0;
    rows.forEach(function (r) {
      var k = Math.round(r.n / N);
      if (k >= 1) out.push({ name: r.name, code: r.code, n: r.n, rows: k, ex: r.ex.slice() });
      else { rest.push(r); restN += r.n; }
    });
    if (rest.length) {
      var ex = [];
      rest.slice(0, 8).forEach(function (r) { if (r.ex[0]) ex.push(r.ex[0]); });
      out.push({ name: rest.length + " other languages", n: restN, rows: Math.max(1, Math.round(restN / N)), ex: ex, other: true, count: rest.length });
    }
    return out;
  }
  function langStrip(D, N, bl, br) {
    var u = 24, rowsL = bl.reduce(function (s, b) { return s + b.rows; }, 0), rowsR = br.reduce(function (s, b) { return s + b.rows; }, 0);
    var rows = Math.max(rowsL, rowsR), offL = Math.floor((rows - rowsL) / 2), offR = Math.floor((rows - rowsR) / 2);
    var animal = 11, turn = 6, middle = 11, cols = animal * 2 + turn * 2 + middle;
    var midRow = Math.floor(rows / 2);
    function owner(list, off, j) {   // which band a row belongs to on one side
      var k = off, idx = -1;
      list.forEach(function (b, bi) { if (j >= k && j < k + b.rows && idx < 0) idx = bi; k += b.rows; });
      return idx;
    }
    // example words written one letter to a square in the middle: words taken on the left half, given on the right
    function exampleWord(list, off, j, maxLen) {
      var bi = owner(list, off, j);
      if (bi < 0) return null;
      var b = list[bi], first = off + list.slice(0, bi).reduce(function (s, x) { return s + x.rows; }, 0);
      var pool = b.ex.filter(function (w) { return graphemes(w).length <= maxLen && B.isLatinScript(w); }).sort(function (x, y) { return y.length - x.length || x.localeCompare(y); });
      return pool.length ? pool[(j - first) % pool.length] : null;
    }
    var name = Array.from(D.lang.name.toUpperCase());
    var cells = [];
    for (var i = 0; i < cols; i++) {
      var column = [];
      for (var j = 0; j < rows; j++) {
        var left = i < animal + turn, right = i >= animal + turn + middle, t = 0, bi = -1, a = -1, band = "m";
        if (left) { bi = owner(bl, offL, j); t = i < animal ? 1 : 1 - (i - animal + 1) / (turn + 1); band = "L" + bi; a = bi % ANIMALS.length; }
        else if (right) { bi = owner(br, offR, j); var k = i - (animal + turn + middle); t = k >= turn ? 1 : (k + 1) / (turn + 1); band = "R" + bi; a = bi % ANIMALS.length; }
        if ((left || right) && bi < 0) { column.push(null); continue; }
        column.push({ a: t > 0 ? a : -1, band: band, t: t, fill: (i + j) % 2 === 0 ? "w" : "b" });
      }
      cells.push(column);
    }
    // the letters of the middle
    var m0 = animal + turn, half = Math.floor(middle / 2);
    for (var j = 0; j < rows; j++) {
      if (j === midRow) {
        var s0 = m0 + Math.floor((middle - name.length) / 2);
        name.forEach(function (ch, k) { if (cells[s0 + k] && cells[s0 + k][j]) cells[s0 + k][j].letter = ch; });
        continue;
      }
      var wl = exampleWord(bl, offL, j, half), wr = exampleWord(br, offR, j, half);
      if (wl) graphemes(wl).forEach(function (ch, k, arr) { var c = cells[m0 + half - arr.length + k]; if (c && c[j]) c[j].letter = ch; });
      if (wr) graphemes(wr).forEach(function (ch, k) { var c = cells[m0 + half + 1 + k]; if (c && c[j]) c[j].letter = ch; });
    }
    var len = cols * u, wide = rows * u, cap = PHONE ? 30 : 34;
    var W = PHONE ? wide + 2 : len, H = PHONE ? len + cap * 2 : wide + cap * 2;
    function map(x, y) { return PHONE ? [y + 1, x + cap] : [x, y + cap]; }
    var o = ['<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Metamorphosis of the words of ' + esc(D.lang.name) + '">'];
    o.push(strip(cells, u, map));
    // band names, on the animals at the outer ends
    function names(list, off, atLeft) {
      var k = off;
      list.forEach(function (b, bi) {
        var cy = (k + b.rows / 2) * u, x = atLeft ? 6 : len - 6;
        k += b.rows;
        var txt = esc(b.name) + " " + n(b.n);
        if (PHONE) {
          if (b.rows * u < 60) return;
          var q = map(atLeft ? 2 * u : len - 2 * u, cy);
          o.push(label(q[0], q[1] + 5, esc(b.name), { size: 15 }));
          return;
        }
        var q2 = map(x, cy);
        o.push(label(q2[0], q2[1] + 6, txt, { anchor: atLeft ? "start" : "end" }));
      });
    }
    names(bl, offL, true);
    names(br, offR, false);
    var c1 = map(animal * u / 2, -cap / 2), c2 = map(len - animal * u / 2, -cap / 2), c3 = map(len / 2, -cap / 2);
    if (!PHONE) {
      o.push(label(c1[0], c1[1] + 6, "what it took, coming in", { italic: true, halo: 0 }));
      o.push(label(c3[0], c3[1] + 6, esc(D.lang.name), { italic: true, halo: 0 }));
      o.push(label(c2[0], c2[1] + 6, "what it gave, going out", { italic: true, halo: 0 }));
      var c4 = map(len / 2, wide + cap / 2);
      o.push(label(c4[0], c4[1] + 6, "one row of squares for every " + n(N) + " words", { halo: 0 }));
    } else {
      o.push(label(W / 2, cap - 10, "what it took, coming in", { italic: true, halo: 0 }));
      o.push(label(W / 2, H - 10, "what it gave, going out", { italic: true, halo: 0 }));
    }
    o.push("</svg>");
    return o.join("");
  }

  function languagePage(code) {
    B.language(code).then(function (D) {
      var l = D.lang, N = 400;
      document.title = l.name + " — lexodus (Metamorphosis draft)";
      var bl = bandsOf(D.from, N), br = bandsOf(D.to, N);
      var h = [];
      h.push('<div class="sheet">');
      h.push('<div class="title"><h1>' + esc(l.name) + " <i>a metamorphosis</i></h1></div>");
      h.push('<div class="lede"><p>' + esc(l.name) + " took <b>" + n(D.fromTotal) + "</b> words from " + D.from.length + " languages and gave <b>" + n(D.toTotal) + "</b> to " + D.to.length +
        ".</p><p>The languages it took from come in from the left as bands of animals, as wide as their words; in the middle they straighten into the squares of " + esc(l.name) +
        ", where some of the words are written; on the right they bend again into the animals of the languages it gave to.</p></div>");
      h.push('<figure class="plate wide"><div class="cap"><span class="no">Plate I</span><h2>In and out of ' + esc(l.name) + "</h2></div>" +
        '<div class="strip">' + langStrip(D, N, bl, br) + "</div>" +
        '<p class="note">One row of squares for every ' + n(N) + " words, rounded; languages under " + n(N / 2) + " words go together in the last band of each side. Birds, fish and lizards take turns from band to band. In the middle, each row carries one of the words of its band (taken words on the left, given words on the right) and the middle row the name of the language.</p></figure>");
      function table(cls, no, title, rows, bands) {
        var by = {};
        bands.forEach(function (b) { if (!b.other) by[b.code] = b.rows; });
        var other = bands.filter(function (b) { return b.other; })[0];
        return '<section class="plate ' + cls + '"><div class="cap"><span class="no">' + no + "</span><h2>" + title + '</h2></div><table class="tbl"><tr><th>language</th><th class="n">rows</th><th class="n">words</th><th>for example</th></tr>' +
          rows.slice(0, 16).map(function (r) {
            return "<tr><td>" + esc(r.name) + '</td><td class="n">' + (by[r.code] || "–") + '</td><td class="n">' + n(r.n) + '</td><td class="ex">' + esc(r.ex.slice(0, 3).join(", ")) + "</td></tr>";
          }).join("") +
          (rows.length > 16 ? "<tr><td>" + (rows.length - 16) + ' more</td><td class="n"></td><td class="n">' + n(rows.slice(16).reduce(function (s, r) { return s + r.n; }, 0)) + "</td><td></td></tr>" : "") + "</table>" +
          (other ? '<p class="note">The last band (' + other.rows + (other.rows === 1 ? " row" : " rows") + ") holds the " + n(other.n) + " words of " + other.count + " languages under " + n(N / 2) + " words each.</p>" : "") + "</section>";
      }
      h.push(table("half", "Coming in", "What " + esc(l.name) + " took", D.from, bl));
      h.push(table("half2", "Going out", "What " + esc(l.name) + " gave", D.to, br));
      h.push("</div>");
      app.innerHTML = h.join("");
    }).catch(fail);
  }

  if (page === "language") languagePage(B.param("code") || "it");
  else wordPage();
})();
