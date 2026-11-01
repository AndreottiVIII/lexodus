/* lexodus, draft "piranesi" (bozze5): the drawings, generated from the data in SVG.
   Tone is made only by layers of etched lines crossing (patterns); the deeper, the more layers.
   Language page: the hall. One arch per farthest origin of the language's words (height of the arch: square root of
   the words, so that area follows the number), walkways across the arches for the roads the words took (the
   direct language, when it is not the origin itself), chains hanging from pulleys for the words with more than one
   proposed origin. Word page: the staircase. The word on its landing; below, one flight for each stop of its road,
   down to the farthest origin in the dark; above, the languages that took it, gallery after gallery towards the light. */
(function () {
  "use strict";
  var app = document.getElementById("app"), page = document.body.getAttribute("data-page");
  var esc = B.esc, n = B.n, r1 = B.r1;
  var INK = "#24170d", PAPER = "#efe5cf";
  var ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX",
    "XXI", "XXII", "XXIII", "XXIV", "XXV", "XXVI", "XXVII", "XXVIII", "XXIX", "XXX", "XXXI", "XXXII", "XXXIII"];

  function fail(e) { app.innerHTML = '<p class="loading">The data could not be read: ' + esc(e && e.message) + "</p>"; if (window.console) console.error(e); }
  function pts(list) { return list.map(function (p) { return r1(p[0]) + "," + r1(p[1]); }).join(" "); }

  // five layers of etched lines; each one is transparent between its lines, so they add up
  var LAYERS = [[7, 45, 0.8], [6, -45, 0.8], [5, 0, 0.75], [4.2, 90, 0.8], [3.4, 30, 0.9]];
  function defs(pre) {
    return "<defs>" + LAYERS.map(function (l, i) {
      return '<pattern id="' + pre + "l" + i + '" patternUnits="userSpaceOnUse" width="' + l[0] + '" height="' + l[0] + '" patternTransform="rotate(' + l[1] + ')">' +
        '<line x1="0.5" y1="0" x2="0.5" y2="' + l[0] + '" stroke="' + INK + '" stroke-width="' + l[2] + '"/></pattern>';
    }).join("") + "</defs>";
  }
  function shade(pre, shapeAttr, level) {
    var o = "";
    for (var i = 0; i < Math.min(level, LAYERS.length); i++) o += shapeAttr.replace("FILL", "url(#" + pre + "l" + i + ")");
    return o;
  }
  // a band of darkness from y down to the bottom, with a ragged upper edge as if bitten by acid
  function band(pre, W, H, y, level, seed) {
    var rnd = B.rng(seed), p = [[0, H], [0, y]];
    for (var x = 0; x <= W; x += 40) p.push([x, y + (rnd() - 0.5) * 30]);
    p.push([W, H]);
    return '<polygon points="' + pts(p) + '" fill="url(#' + pre + "l" + level + ')"/>';
  }
  function label(x, y, txt, o) {
    o = o || {};
    return '<text x="' + r1(x) + '" y="' + r1(y) + '" text-anchor="' + (o.anchor || "middle") + '" font-size="' + (o.size || 16) + '"' +
      (o.italic ? ' font-style="italic"' : "") + (o.cls ? ' class="' + o.cls + '"' : "") + (o.weight ? ' font-weight="' + o.weight + '"' : "") +
      ' stroke="' + PAPER + '" stroke-width="5" stroke-linejoin="round" paint-order="stroke">' + txt + "</text>";
  }
  function tablet(x, y, lines, o) {
    o = o || {};
    var size = o.size || 15, lh = size + 4, wdt = 0;
    lines.forEach(function (t) { wdt = Math.max(wdt, String(t.replace(/<[^>]+>/g, "")).length * size * 0.5 + 14); });
    var x0 = o.anchor === "start" ? x : x - wdt / 2, hgt = lines.length * lh + 8;
    var s = '<rect x="' + r1(x0) + '" y="' + r1(y) + '" width="' + r1(wdt) + '" height="' + hgt + '" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1"/>';
    lines.forEach(function (t, i) {
      s += '<text x="' + r1(x0 + wdt / 2) + '" y="' + r1(y + 4 + (i + 1) * lh - 5) + '" text-anchor="middle" font-size="' + size + '"' + (o.italic ? ' font-style="italic"' : "") + ">" + t + "</text>";
    });
    return { svg: s, w: wdt, h: hgt };
  }
  // an arch opening: piers to the floor, a round head; returns the path of the opening
  function archPath(x, w, top, floor) {
    var ys = top + w / 2;
    return "M" + r1(x) + " " + r1(floor) + " L" + r1(x) + " " + r1(ys) + " A" + r1(w / 2) + " " + r1(w / 2) + " 0 0 1 " + r1(x + w) + " " + r1(ys) + " L" + r1(x + w) + " " + r1(floor) + " Z";
  }
  function voussoirs(x, w, top, ring) {
    var cx = x + w / 2, cy = top + w / 2, R = w / 2, o = [];
    o.push('<path d="M' + r1(x - ring) + " " + r1(cy) + " A" + r1(R + ring) + " " + r1(R + ring) + " 0 0 1 " + r1(x + w + ring) + " " + r1(cy) + '" fill="none" stroke="' + INK + '" stroke-width="1.4"/>');
    for (var a = 0; a <= 180; a += 12) {
      var t = Math.PI + a * Math.PI / 180;
      o.push('<line x1="' + r1(cx + R * Math.cos(t)) + '" y1="' + r1(cy + R * Math.sin(t)) + '" x2="' + r1(cx + (R + ring) * Math.cos(t)) + '" y2="' + r1(cy + (R + ring) * Math.sin(t)) + '" stroke="' + INK + '" stroke-width="' + (a === 84 || a === 96 ? 2 : 1) + '"/>');
    }
    return o.join("");
  }
  function masonry(W, H, seed) {
    var o = [], rnd = B.rng(seed);
    for (var y = 20, row = 0; y < H; y += 22, row++) {
      o.push('<line x1="0" y1="' + y + '" x2="' + W + '" y2="' + y + '" stroke="' + INK + '" stroke-width="0.45"/>');
      for (var x = (row % 2) * 30 + rnd() * 10; x < W; x += 60) o.push('<line x1="' + r1(x) + '" y1="' + (y - 22) + '" x2="' + r1(x) + '" y2="' + y + '" stroke="' + INK + '" stroke-width="0.45"/>');
    }
    return o.join("");
  }
  function chain(x, y0, len, pre) {
    var o = [], k = 0;
    // the pulley
    o.push('<circle cx="' + x + '" cy="' + (y0 + 16) + '" r="15" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/>');
    for (var s = 0; s < 6; s++) { var t = s * Math.PI / 3; o.push('<line x1="' + x + '" y1="' + (y0 + 16) + '" x2="' + r1(x + 15 * Math.cos(t)) + '" y2="' + r1(y0 + 16 + 15 * Math.sin(t)) + '" stroke="' + INK + '"/>'); }
    for (var y = y0 + 32; y < y0 + 32 + len; y += 9, k++) {
      o.push(k % 2 ? '<line x1="' + x + '" y1="' + (y - 2) + '" x2="' + x + '" y2="' + (y + 11) + '" stroke="' + INK + '" stroke-width="3"/>'
        : '<ellipse cx="' + x + '" cy="' + (y + 4) + '" rx="4" ry="7" fill="none" stroke="' + INK + '" stroke-width="1.8"/>');
    }
    var yb = y0 + 32 + len;
    o.push('<path d="M' + x + " " + yb + " q0 14 -9 14 q-8 0 -8 -8" + '" fill="none" stroke="' + INK + '" stroke-width="2.5"/>');
    void pre;
    return { svg: o.join(""), bottom: yb + 16 };
  }

  // =================== language page: the hall ===================
  function hall(far, chains, langName) {
    var W = 1120, H = 760, floor = 668, pre = "h", o = [];
    o.push('<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="The hall of ' + esc(langName) + '">' + defs(pre));
    o.push('<rect width="' + W + '" height="' + H + '" fill="' + PAPER + '"/>');
    // darkness grows downwards: light comes from above
    [150, 300, 430, 560, 655].forEach(function (y, i) { o.push(band(pre, W, H, y, i, "hall" + i)); });
    var max = far[0].n, slot = (W - 60) / far.length, arches = [];
    far.forEach(function (f, i) {
      var h = 130 + 440 * Math.sqrt(f.n / max), w = Math.min(slot - 40, 0.5 * h + 30), x = 30 + i * slot + (slot - w) / 2, top = floor - h;
      arches.push({ f: f, x: x, w: w, top: top, h: h });
    });
    // the openings: light beyond, a single layer of lines
    arches.forEach(function (a) {
      var d = archPath(a.x, a.w, a.top, floor);
      o.push('<path d="' + d + '" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.6"/>');
      o.push('<path d="' + d + '" fill="url(#' + pre + 'l0)"/>');
      // the piers: heavy masonry, cross-hatched, with courses
      [a.x - 26, a.x + a.w].forEach(function (px) {
        o.push('<rect x="' + r1(px) + '" y="' + r1(a.top + a.w / 2) + '" width="26" height="' + r1(floor - a.top - a.w / 2) + '" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.4"/>');
        o.push(shade(pre, '<rect x="' + r1(px) + '" y="' + r1(a.top + a.w / 2) + '" width="26" height="' + r1(floor - a.top - a.w / 2) + '" fill="FILL"/>', 4));
        for (var cy = floor - 18; cy > a.top + a.w / 2; cy -= 18) o.push('<line x1="' + r1(px) + '" y1="' + r1(cy) + '" x2="' + r1(px + 26) + '" y2="' + r1(cy) + '" stroke="' + PAPER + '" stroke-width="1.2"/>');
      });
      o.push(voussoirs(a.x, a.w, a.top, 16));
    });
    // walkways: the roads by which the words of each origin came, across the arch and on to the next
    arches.forEach(function (a, i) {
      var roads = (a.f.roads || []).filter(function (r) { return r.code !== a.f.code && r.n >= 5 && !/^(mul|und)/.test(r.code); }).slice(0, 2);
      roads.forEach(function (r, k) {
        var y = floor - 70 - k * 80 - (i % 2) * 40, th = 5 + Math.log2(r.n + 1) * 1.6;
        var x0 = a.x - 10, x1 = a.x + a.w + slot * 0.55;
        if (x1 > W - 10) x1 = W - 10;
        o.push('<rect x="' + r1(x0) + '" y="' + r1(y) + '" width="' + r1(x1 - x0) + '" height="' + r1(th) + '" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.2"/>');
        o.push(shade(pre, '<rect x="' + r1(x0) + '" y="' + r1(y) + '" width="' + r1(x1 - x0) + '" height="' + r1(th) + '" fill="FILL"/>', 2));
        o.push('<line x1="' + r1(x0) + '" y1="' + r1(y - 16) + '" x2="' + r1(x1) + '" y2="' + r1(y - 16) + '" stroke="' + INK + '" stroke-width="1.4"/>');
        for (var px = x0 + 4; px < x1; px += 13) o.push('<line x1="' + r1(px) + '" y1="' + r1(y - 16) + '" x2="' + r1(px) + '" y2="' + r1(y) + '" stroke="' + INK + '"/>');
        o.push(tablet(x0 + 6, y - 46, ["via " + esc(r.name) + " · " + n(r.n)], { anchor: "start", italic: true, size: 15 }).svg);
      });
    });
    // chains from the vault: words with more than one origin proposed
    chains.forEach(function (c, i) {
      var x = r1(80 + i * (W - 160) / Math.max(1, chains.length - 1)), len = Math.min(300, 30 + c.n * 2.6);
      var ch = chain(x, 0, len, pre);
      o.push(ch.svg);
      var parts = c.key.split(" or "), lines = [n(c.n) + (c.n === 1 ? " word" : " words")];
      if (parts.length > 2) { lines.push(parts.slice(0, 2).join(" or ") + " or"); lines.push(parts.slice(2).join(" or ")); } else lines.push(c.key);
      lines.push("e.g. <tspan font-style=\"italic\">" + esc(c.ex) + "</tspan>");
      o.push(tablet(x, ch.bottom + 4, lines, { size: 15 }).svg);
    });
    // the names of the arches, cut on tablets at their feet
    arches.forEach(function (a) {
      var cxa = a.x + a.w / 2, ty = floor + 10;
      o.push('<rect x="' + r1(cxa - 66) + '" y="' + ty + '" width="132" height="50" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.4"/>');
      o.push('<text x="' + r1(cxa) + '" y="' + (ty + 21) + '" text-anchor="middle" font-size="' + (a.f.name.length > 11 ? 15 : 17) + '" class="cz">' + esc(a.f.name.toUpperCase()) + "</text>");
      o.push('<text x="' + r1(cxa) + '" y="' + (ty + 42) + '" text-anchor="middle" font-size="17">' + n(a.f.n) + "</text>");
    });
    o.push("</svg>");
    return o.join("");
  }

  function languagePage(code) {
    Promise.all([B.language(code), B.extra(code), B.alternatives(code), B.langs()]).then(function (res) {
      var D = res[0], X = res[1], ALT = res[2], L = res[3], l = D.lang;
      var lista = ((X && X.origini_lontane && X.origini_lontane.lista) || []).filter(function (o) { return o.tipo_lingua === "lingua"; });
      var far = lista.slice(0, 7).map(function (o) {
        return { code: o.codice, name: o.codice === "LATINO" ? "Latin" : o.nome_en, n: o.n,
          roads: (o.strade || []).map(function (s) { return { code: s.codice, name: s.codice === "LATINO" ? "Latin" : s.nome_en, n: s.n }; }) };
      });
      var groups = {};
      (ALT.parole || []).forEach(function (w) {
        var names = [];
        (w.alternative || []).forEach(function (a) { var nm = B.isLatin(a.codice) ? "Latin" : a.nome; if (names.indexOf(nm) < 0) names.push(nm); });
        names.sort();
        var key = names.length === 1 ? "two " + names[0] + " forms" : names.join(" or ");
        var g = groups[key] || (groups[key] = { key: key, n: 0, ex: w.parola });
        g.n++;
        if (w.parola.length < g.ex.length && /^[a-zà-ù]+$/.test(w.parola)) g.ex = w.parola;
      });
      var chains = Object.keys(groups).map(function (k) { return groups[k]; }).sort(function (a, b) { return b.n - a.n; }).slice(0, 6);
      var idx = L.targets.indexOf(code) + 1;
      document.title = l.name + " — lexodus (Piranesi draft)";
      var h = ['<div class="sheet">'];
      h.push('<div class="title"><p class="over">Carcere ' + (ROMAN[idx] || idx) + " of " + ROMAN[L.targets.length] + "</p><h1>" + esc(l.name.toUpperCase()) + "</h1></div>");
      h.push('<div class="lede"><p>Its words came in under ' + lista.length + " arches: these are the seven widest. " + n(X.origini_lontane.n_parole_prese) +
        " words taken; " + n((ALT.parole || []).length) + " more hang on chains, because Wiktionary proposes more than one origin for them.</p></div>");
      h.push('<figure class="plate"><div class="box">' + hall(far, chains, l.name) + "</div>" +
        '<figcaption class="cap"><p><span class="no">Tav. I.</span> Each arch is the farthest origin of a group of ' + esc(l.name) + " words: the higher the arch, the more words (height grows with the square root). " +
        "The walkways are the roads: the language the words passed through on their way, when it is not the origin itself.</p>" +
        '<p class="r">The chains hang from the vault: one for each set of origins proposed together, with the number of words and the shortest example. Light comes from above; the lower, the more lines cross.</p></figcaption></figure>');
      // the rest in columns, as the explanation of the plates
      function list(title, rows, fmt) {
        return "<section><h2>" + title + "</h2><ol>" + rows.map(function (r) { return "<li><span>" + fmt(r) + "</span><span>" + n(r.n) + "</span></li>"; }).join("") + "</ol></section>";
      }
      h.push('<div class="cols">' +
        list("Arches", lista.slice(0, 14).map(function (o) { return { name: o.codice === "LATINO" ? "Latin" : o.nome_en, n: o.n }; }), function (r) { return esc(r.name); }) +
        list("Gates: taken directly from", D.from.slice(0, 14), function (r) { return esc(r.name); }) +
        list("Exits: given to", D.to.slice(0, 14), function (r) { return esc(r.name); }) + "</div>");
      h.push("</div>");
      app.innerHTML = h.join("");
    }).catch(fail);
  }

  // =================== word page: the staircase ===================
  function staircase(full, ups) {
    var W = 1120, rowH = 102, pre = "s", o = [], GUT = 120;
    var gens = [];
    (function walk(nd, g) { if (g > 0) (gens[g - 1] = gens[g - 1] || []).push(nd); nd.kids.forEach(function (k) { walk(k, g + 1); }); })(full.me, 0);
    var rows = [];
    for (var g = gens.length - 1; g >= 0; g--) {
      var list = gens[g], per = 9;
      var parts = Math.ceil(list.length / per);
      for (var p = parts - 1; p >= 0; p--) rows.push({ kind: "up", g: g + 1, list: list.slice(p * per, p * per + per) });
    }
    rows.push({ kind: "me", list: [full.me] });
    ups.forEach(function (nd) { rows.push({ kind: "down", list: [nd] }); });
    var H = rows.length * rowH + 40;
    o.push('<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="The staircase of the word">' + defs(pre));
    o.push('<rect width="' + W + '" height="' + H + '" fill="' + PAPER + '"/>');
    o.push(masonry(W, H, 7));
    // the darkness: nothing at the top, five layers at the bottom
    var meRow = rows.length - 1 - ups.length;
    var lastUp = meRow - 1;
    for (var lv = 0; lv < 5; lv++) {
      var y = lv === 0 ? Math.max(20, (lastUp - 1) * rowH) : (meRow + (lv - 1) * Math.max(1, ups.length) / 4 + 0.5) * rowH;
      o.push(band(pre, W, H, y, lv, "st" + lv));
    }
    // place every node
    var pos = new Map();
    rows.forEach(function (row, ri) {
      var cnt = row.list.length, aw = row.kind === "up" ? Math.min(96, (W - GUT - 20) / Math.max(cnt, 1) - 16) : 170;
      var span = cnt * (aw + 16), x0 = row.kind === "up" ? GUT + (W - GUT - span) / 2 + 8 : row.kind === "me" ? GUT + 60 : (ri % 2 ? 680 : GUT + 140);
      row.list.forEach(function (nd, i) { pos.set(nd, { x: x0 + i * (aw + 16), w: aw, top: 20 + ri * rowH, floor: 20 + ri * rowH + rowH - 22, row: row }); });
    });
    // flights of stairs: from each node to the one it came from
    function flight(a, b) {
      var x1 = a.x + a.w / 2, y1 = a.floor, x2 = b.x + b.w / 2, y2 = b.top + 8;
      if (y2 < y1) { var t = [x1, y1]; x1 = x2; y1 = y2; x2 = t[0]; y2 = t[1]; }
      var nSteps = Math.max(4, Math.round((y2 - y1) / 9)), s = [];
      for (var k = 0; k <= nSteps; k++) {
        var xx = x1 + (x2 - x1) * k / nSteps, yy = y1 + (y2 - y1) * k / nSteps;
        s.push([xx, yy]);
        if (k < nSteps) s.push([xx + (x2 - x1) / nSteps, yy]);
      }
      var lower = s.map(function (q) { return [q[0], q[1] + 10]; }).reverse();
      return '<polygon points="' + pts(s.concat(lower)) + '" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="1.2"/>' +
        shade(pre, '<polygon points="' + pts(s.concat(lower)) + '" fill="FILL"/>', 1);
    }
    pos.forEach(function (pp, nd) {
      var parent = null;
      (function find(x) { x.kids.forEach(function (k) { if (k === nd) parent = x; else find(k); }); })(full.root);
      if (parent && pos.has(parent)) o.push(flight(pos.get(parent), pp));
    });
    // the doorways
    pos.forEach(function (pp, nd) {
      var d = archPath(pp.x, pp.w, pp.top + 8, pp.floor);
      o.push('<path d="' + d + '" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="' + (nd.here ? 2.6 : 1.4) + '"/>');
      o.push(voussoirs(pp.x, pp.w, pp.top + 8, nd.here ? 12 : 7));
      var word = B.readable(nd.word, nd.tr);
      var big = nd.here || pp.row.kind === "down";
      o.push(label(pp.x + pp.w / 2, pp.floor - (big ? 38 : 30), esc(word), { size: big ? 24 : 17, italic: true }));
      if (big && word !== nd.word) o.push(label(pp.x + pp.w + 16, pp.floor - 34, esc(nd.word), { size: 24, anchor: "start" }));
      o.push(label(pp.x + pp.w / 2, pp.floor - (big ? 14 : 10), esc(nd.name), { size: 15, cls: "cz" }));
      o.push('<line x1="' + r1(pp.x - 9) + '" y1="' + pp.floor + '" x2="' + r1(pp.x + pp.w + 9) + '" y2="' + pp.floor + '" stroke="' + INK + '" stroke-width="3"/>');
    });
    // the names of the floors, on the left edge
    rows.forEach(function (row, ri) {
      var txt = row.kind === "me" ? "the landing" : row.kind === "down" ? "down " + (ri - meRow) : "generation " + row.g;
      if (row.kind === "up" && rows[ri + 1] && rows[ri + 1].kind === "up" && rows[ri + 1].g === row.g) return;
      o.push(tablet(8, 20 + ri * rowH + rowH - 58, [txt], { anchor: "start", size: 15, italic: true }).svg);
    });
    o.push("</svg>");
    return o.join("");
  }

  function wordPage() {
    var lang = B.param("lang") || "it", w = B.param("w") || "caffè", ne = +(B.param("n") || 1), from = B.param("from");
    B.word(lang, w, ne, from).then(function (R) {
      if (!R.tree) throw new Error("No tree for this word.");
      var L = R.L, full = B.fullTree(L, lang, R.tree);
      // the road down: from the word's parent to the root
      var ups = [], cur = full.root, chainNodes = [];
      while (cur && !cur.here) { chainNodes.push(cur); cur = cur.kids.filter(function (k) { return k.here || k.up; })[0]; }
      ups = chainNodes.reverse();
      document.title = w + " — lexodus (Piranesi draft)";
      var h = ['<div class="sheet">'];
      h.push('<div class="title"><p class="over">The staircase of</p><h1>' + esc(w.toUpperCase()) + "</h1></div>");
      h.push('<div class="lede"><p>' + esc(full.me.mean) + ". Down " + ups.length + (ups.length === 1 ? " flight" : " flights") + " to " + esc(ups.length ? ups[ups.length - 1].name : "") +
        "; up, " + n(full.count) + " words in other languages.</p>" + (R.text ? "<p>“" + esc(R.text) + "”</p>" : "") + "</div>");
      h.push('<figure class="plate"><div class="box">' + staircase(full, ups) + "</div>" +
        '<figcaption class="cap"><p><span class="no">Tav. II.</span> The word stands on the landing. Each flight down is one stop of its road, as Wiktionary gives it: ' +
        ups.map(function (u) { return esc(u.name) + " <i>" + esc(B.readable(u.word, u.tr)) + "</i>"; }).join(", then ") + ".</p>" +
        '<p class="r">Above, gallery after gallery, the languages that took it and those that took it from them; each stair joins a word to the one it came from.</p></figcaption></figure>');
      h.push("</div>");
      app.innerHTML = h.join("");
    }).catch(fail);
  }

  if (page === "language") languagePage(B.param("code") || "it");
  else wordPage();
})();
