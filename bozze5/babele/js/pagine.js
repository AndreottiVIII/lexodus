/* lexodus, draft "babele" (bozze5): the tower, generated from the data in SVG.
   33 floors, one per language, from the bottom up by family (Romance, Germanic, Slavic, Baltic, Finno-Ugric; Greek,
   Albanian, Iranian; Semitic; Turkic), the larger first within a family. The width of a floor grows with the square
   root of the words its language took and gave. Languages outside the 33 are the rock under the tower when they are
   old written languages of the West (Latin, Ancient Greek, Old French…) and the scaffolding beside the floors of
   their family otherwise (Ottoman Turkish beside the Turkish floor).
   Brushwork: every surface is laid with short seeded strokes and the edges are roughened by an SVG displacement
   filter (feTurbulence + feDisplacementMap): no blur, no gradient. */
(function () {
  "use strict";
  var app = document.getElementById("app"), page = document.body.getAttribute("data-page");
  var esc = B.esc, n = B.n, r1 = B.r1;
  var INK = "#2b2118", SKY = "#e3e6da", OCHRE = "#c49a52", OCHRE_D = "#a97d3b", OCHRE_L = "#dcbb7c", BRICK = "#93432a", GREEN = "#74826a", GREEN_D = "#56634d";
  var ORDER = ["romance", "germanic", "slavic", "baltic", "uralic", "other", "semitic", "turkic", "world"];
  var ROCK = /^(la|LATINO|grc|fro|frm|ang|enm|goh|gmh|non|pro|osp|roa-|itc-|gkm|cu|orv|dum|odt|osx|ofs|got|frk|gem|ine|sla-|gmw|gmq|lng|vec|nap|scn|lmo|pms|lij|fur|sc|egl|rgn)/;

  function fail(e) { app.innerHTML = '<p class="loading">The data could not be read: ' + esc(e && e.message) + "</p>"; if (window.console) console.error(e); }
  function pts(list) { return list.map(function (p) { return r1(p[0]) + "," + r1(p[1]); }).join(" "); }
  function defs() {
    return '<defs><filter id="rough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="7"/>' +
      '<feDisplacementMap in="SourceGraphic" scale="4"/></filter></defs>';
  }
  function text(x, y, t, o) {
    o = o || {};
    return '<text x="' + r1(x) + '" y="' + r1(y) + '" text-anchor="' + (o.anchor || "middle") + '" font-size="' + (o.size || 15) + '"' +
      (o.italic ? ' font-style="italic"' : "") + (o.bold ? ' font-weight="700"' : "") + (o.fill ? ' style="fill:' + o.fill + '"' : "") +
      (o.halo ? ' stroke="' + o.halo + '" stroke-width="4" stroke-linejoin="round" paint-order="stroke"' : "") + ">" + t + "</text>";
  }
  // short brush strokes over a shape's box
  function strokes(x, y, w, h, color, seed, density) {
    var rnd = B.rng(seed), o = [], k = Math.round(w * h / (density || 160));
    for (var i = 0; i < k; i++) {
      var sx = x + rnd() * w, sy = y + rnd() * h, len = 4 + rnd() * 7, a = -0.25 + rnd() * 0.5;
      o.push("M" + r1(sx) + " " + r1(sy) + "l" + r1(len * Math.cos(a)) + " " + r1(len * Math.sin(a)));
    }
    return '<path d="' + o.join("") + '" stroke="' + color + '" stroke-width="1.6" stroke-linecap="round" fill="none"/>';
  }
  function floorsOf(L) {
    var list = L.list.slice().sort(function (a, b) { return ORDER.indexOf(a.fam) - ORDER.indexOf(b.fam) || (b.took + b.gave) - (a.took + a.gave); });
    var max = Math.max.apply(null, list.map(function (l) { return l.took + l.gave; }));
    return { list: list, max: max, index: function (c) { for (var i = 0; i < list.length; i++) if (list[i].code === c) return i; return -1; } };
  }

  // the whole tower: returns svg and the geometry of each floor
  function tower(L, o) {
    var F = floorsOf(L), W = o.W, fh = o.fh, base = o.H - 70, cx = W / 2 - (o.shift || 0), maxW = o.maxW, g = {}, s = [];
    s.push('<svg width="' + W + '" height="' + o.H + '" viewBox="0 0 ' + W + " " + o.H + '" role="img" aria-label="The tower of the 33 languages">' + defs());
    s.push('<rect width="' + W + '" height="' + o.H + '" fill="' + SKY + '"/>');
    // the rock and the ground
    var rnd = B.rng("rock"), rock = [[0, o.H], [0, base + 30]];
    for (var x = 0; x <= W; x += 24) rock.push([x, base + 8 + rnd() * 26 - (Math.abs(x - cx) < maxW / 2 ? 14 : 0)]);
    rock.push([W, o.H]);
    s.push('<g filter="url(#rough)"><polygon points="' + pts(rock) + '" fill="' + GREEN + '"/>' + strokes(0, base, W, 70, GREEN_D, "rock", 60) + "</g>");
    var floors = [];
    F.list.forEach(function (l, i) {
      var w = Math.max(o.minW, maxW * Math.sqrt((l.took + l.gave) / F.max)), y = base - (i + 1) * fh;
      floors.push({ l: l, i: i, w: w, y: y, x: cx - w / 2 });
      g[l.code] = floors[floors.length - 1];
    });
    var body = [];
    floors.forEach(function (f) {
      var hl = o.highlight === f.l.code;
      body.push('<polygon points="' + pts([[f.x, f.y + fh], [f.x + f.w, f.y + fh], [f.x + f.w - 3, f.y], [f.x + 3, f.y]]) + '" fill="' + (hl ? BRICK : OCHRE) + '" stroke="' + INK + '" stroke-width="0.8"/>');
      body.push(strokes(f.x, f.y, f.w, fh, hl ? "#7a3520" : OCHRE_D, "f" + f.l.code, 90));
      // the arcade: small dark arches along the floor
      var k = Math.max(2, Math.floor((f.w - 16) / 15)), step = (f.w - 16) / k;
      var arches = [];
      for (var a = 0; a < k; a++) {
        var ax = f.x + 8 + a * step + step / 2 - 3, ay = f.y + fh - 2;
        arches.push("M" + r1(ax) + " " + r1(ay) + "v" + r1(-(fh * 0.45)) + "a3 3 0 0 1 6 0v" + r1(fh * 0.45) + "z");
      }
      body.push('<path d="' + arches.join("") + '" fill="' + (hl ? "#4a1d10" : "#6b4a24") + '"/>');
      // the ramp: a lighter ledge running across the face, one way on even floors and back on odd ones
      var up = f.i % 2 === 0, x0 = f.x + 4, x1 = f.x + f.w - 4;
      body.push('<polygon points="' + pts(up ? [[x0, f.y + fh], [x0 + 10, f.y + fh], [x1, f.y + 2], [x1 - 10, f.y + 2]] : [[x1, f.y + fh], [x1 - 10, f.y + fh], [x0, f.y + 2], [x0 + 10, f.y + 2]]) + '" fill="' + OCHRE_L + '"/>');
    });
    s.push('<g filter="url(#rough)">' + body.join("") + "</g>");
    // names on the floors (returned apart, so that a drawing can go between the stone and the names)
    var names = [];
    floors.forEach(function (f) {
      var hl = o.highlight === f.l.code;
      names.push(text(f.x + f.w / 2, f.y + fh / 2 + 5, esc(f.l.name.replace(" Bokmål", "")), { size: 15, bold: hl, fill: hl ? "#fff7e6" : INK, halo: hl ? BRICK : OCHRE }));
    });
    return { head: s.join(""), names: names.join(""), floors: floors, g: g, F: F, base: base, cx: cx, fh: fh };
  }

  // =================== language page ===================
  function closeUp(D, T, code) {
    var W = 736, H = 600, me = T.g[code], o = [], fy = 200, fh = 150;
    o.push('<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="The floor close up">' + defs());
    o.push('<rect width="' + W + '" height="' + H + '" fill="' + SKY + '"/>');
    var body = [];
    // the floors above and below, cut by the frame
    var above = T.floors[me.i + 1], below = T.floors[me.i - 1];
    if (above) {
      body.push('<rect x="150" y="' + (fy - 110) + '" width="436" height="104" fill="' + OCHRE + '" stroke="' + INK + '"/>' + strokes(150, fy - 110, 436, 104, OCHRE_D, "ab", 80));
    }
    body.push('<rect x="110" y="' + fy + '" width="516" height="' + fh + '" fill="' + BRICK + '" stroke="' + INK + '" stroke-width="1.4"/>' + strokes(110, fy, 516, fh, "#7a3520", "me", 70));
    if (below) body.push('<rect x="70" y="' + (fy + fh + 6) + '" width="596" height="' + (H - fy - fh - 6) + '" fill="' + OCHRE + '" stroke="' + INK + '"/>' + strokes(70, fy + fh + 6, 596, H - fy - fh - 6, OCHRE_D, "be", 80));
    else body.push('<rect x="0" y="' + (fy + fh + 6) + '" width="' + W + '" height="' + (H - fy - fh - 6) + '" fill="' + GREEN + '"/>' + strokes(0, fy + fh + 6, W, H - fy - fh - 6, GREEN_D, "rk", 50));
    // the arcade of the floor: ten arches
    var arches = [];
    for (var a = 0; a < 10; a++) {
      var ax = 128 + a * 50, ay = fy + fh - 8;
      arches.push("M" + ax + " " + ay + "v-70a16 16 0 0 1 32 0v70z");
    }
    body.push('<path d="' + arches.join("") + '" fill="#4a1d10"/>');
    // flights of stairs: in from the left, out to the right
    function flight(fromX, fromY, toX, toY, w, color, seed) {
      var nSteps = Math.max(5, Math.round(Math.abs(toX - fromX) / 14)), p = [], q = [];
      for (var k = 0; k <= nSteps; k++) {
        var x = fromX + (toX - fromX) * k / nSteps, y = fromY + (toY - fromY) * k / nSteps;
        p.push([x, y]); if (k < nSteps) p.push([x + (toX - fromX) / nSteps, y]);
      }
      q = p.map(function (pp) { return [pp[0], pp[1] + w]; }).reverse();
      return '<polygon points="' + pts(p.concat(q)) + '" fill="' + color + '" stroke="' + INK + '" stroke-width="1"/>';
    }
    var labels = [];
    function side(rows, dir) {
      var items = rows.map(function (r, k) {
        var f = T.g[B.merged(r.code)], rel, where;
        if (f) { rel = f.i - me.i; where = rel === 0 ? "" : (Math.abs(rel) + (Math.abs(rel) === 1 ? " floor " : " floors ") + (rel > 0 ? "up" : "down")); }
        else { rel = ROCK.test(r.code) ? -6 : 3; where = ROCK.test(r.code) ? "the rock" : "the scaffolding"; }
        return { r: r, k: k, where: where, y: fy + fh / 2 - Math.max(-8, Math.min(8, rel)) * 26 };
      });
      // keep the names apart: sort by height, then push down where they would touch
      items.sort(function (x, y) { return x.y - y.y || x.k - y.k; });
      var last = -1e9;
      items.forEach(function (it) { it.y = Math.max(it.y, last + 64, 22); last = it.y; });
      var over = last - (H - 34);
      if (over > 0) items.forEach(function (it) { it.y -= over; });
      items.forEach(function (it, idx) {
        var r = it.r, k = it.k, y0 = it.y;
        var gateX = dir < 0 ? 128 + (idx % 5) * 50 + 16 : 128 + (9 - (idx % 5)) * 50 + 16, gateY = fy + fh - 40 - Math.floor(idx / 5) * 30;
        var edgeX = dir < 0 ? 6 : W - 6;
        var w = 6 + Math.log2(r.n + 1) * 1.3;
        body.push(flight(edgeX, y0, gateX, gateY, w, dir < 0 ? OCHRE_L : GREEN, "fl" + dir + k));
        labels.push(text(dir < 0 ? 8 : W - 8, y0 - 6, (dir < 0 ? "from " : "to ") + esc(r.name) + " · " + n(r.n), { anchor: dir < 0 ? "start" : "end", size: 15, halo: SKY, bold: true }));
        if (it.where) labels.push(text(dir < 0 ? 8 : W - 8, y0 + w + 16, esc(it.where), { anchor: dir < 0 ? "start" : "end", size: 15, italic: true, halo: SKY }));
      });
    }
    side(D.from.slice(0, 6), -1);
    side(D.to.slice(0, 6), 1);
    o.push('<g filter="url(#rough)">' + body.join("") + "</g>");
    o.push(labels.join(""));
    o.push(text(W / 2, fy + 26, esc(D.lang.name.toUpperCase()) + " · floor " + (me.i + 1) + " of " + T.floors.length, { size: 20, bold: true, fill: "#fff7e6", halo: BRICK }));
    if (above) o.push(text(W / 2, fy - 60, "floor " + (above.i + 1) + ": " + esc(above.l.name), { size: 16, italic: true, halo: OCHRE }));
    if (below) o.push(text(W / 2, fy + fh + 40, "floor " + (below.i + 1) + ": " + esc(below.l.name), { size: 16, italic: true, halo: OCHRE }));
    else o.push(text(W / 2, fy + fh + 44, "the rock under the tower", { size: 16, italic: true, halo: GREEN, fill: "#fff7e6" }));
    o.push("</svg>");
    return o.join("");
  }

  function languagePage(code) {
    Promise.all([B.language(code), B.langs()]).then(function (res) {
      var D = res[0], L = res[1], l = D.lang;
      var T = tower(L, { W: 357, H: 760, fh: 19, maxW: 340, minW: 92, highlight: code });
      var whole = T.head + T.names + "</svg>";
      document.title = l.name + " — lexodus (Bruegel tower draft)";
      var me = T.g[code];
      var h = ['<div class="sheet">'];
      h.push('<figure class="whole"><div class="box">' + whole + '</div><p class="cap">The tower: 33 floors by family, Romance at the bottom, Turkish at the top; the wider the floor, the more words its language exchanged. Under it, the rock.</p></figure>');
      h.push('<div class="title"><p class="over">The Tower of the 33 languages, floor ' + (me.i + 1) + "</p><h1>" + esc(l.name) + " <i>seen from close by</i></h1></div>");
      h.push('<p class="lede">Up the stairs on the left came the ' + n(D.fromTotal) + " words it took; down the stairs on the right went the " + n(D.toTotal) +
        " it gave. A stair starts as high or as low as the floor it comes from; the old languages are the rock, the others outside the 33 are the scaffolding.</p>");
      h.push('<figure class="close"><div class="box">' + closeUp(D, T, code) + "</div></figure>");
      h.push("</div>");
      app.innerHTML = h.join("");
    }).catch(fail);
  }

  // =================== word page ===================
  function wordPage() {
    var lang = B.param("lang") || "it", w = B.param("w") || "caffè", ne = +(B.param("n") || 1), from = B.param("from");
    Promise.all([B.word(lang, w, ne, from), B.langs()]).then(function (res) {
      var R = res[0], L = res[1];
      if (!R.tree) throw new Error("No tree for this word.");
      var full = B.fullTree(L, lang, R.tree), road = B.longestRoad(full.root);
      var T = tower(L, { W: 640, H: 860, fh: 22, maxW: 420, minW: 104, highlight: lang, shift: 60 });
      var s = [T.head];
      // where each word of the tree stands: on its floor, or on the rock, or on the scaffolding of its family
      var all = [], perFloor = {}, scaf = 0;
      (function walk(nd) { all.push(nd); nd.kids.forEach(walk); })(full.root);
      all.forEach(function (nd) {
        var c = B.merged(nd.code), f = T.g[c];
        if (f) { perFloor[c] = (perFloor[c] || 0) + 1; nd.slot = perFloor[c]; nd.f = f; }
      });
      all.forEach(function (nd) {
        var c = B.merged(nd.code);
        if (nd.f) { var k = perFloor[c]; nd.x = k === 1 ? nd.f.x + 24 : nd.f.x + nd.f.w * nd.slot / (k + 1); nd.y = nd.f.y + T.fh / 2; nd.where = "floor " + (nd.f.i + 1); }
        else if (ROCK.test(nd.code)) { nd.x = T.cx - 120 + (scaf++) * 60; nd.y = T.base + 34; nd.where = "the rock"; }
        else {
          var fam = B.family(nd.code), top = null;
          T.floors.forEach(function (f) { if (f.l.fam === fam) top = f; });
          nd.x = top ? top.x + top.w + 70 : 640; nd.y = top ? top.y + T.fh / 2 : T.base - 40; nd.where = "the scaffolding";
          s.push('<g filter="url(#rough)"><path d="M' + r1(nd.x - 20) + " " + r1(nd.y - 26) + "v60M" + r1(nd.x + 20) + " " + r1(nd.y - 26) + "v60M" + r1(nd.x - 26) + " " + r1(nd.y + 12) + "h52M" + r1(nd.x - 22) + " " + r1(nd.y - 20) + "l44 30" +
            '" stroke="#6b4a24" stroke-width="3" fill="none"/></g>');
        }
      });
      // the road climbs along the ramp: from floor to floor it passes the end of the ramp of every floor in between,
      // left and right in turn, as the ramp of the tower winds round it
      function rampPoint(f) { var left = f.i % 2 === 0, cx = f.x + f.w / 2, half = Math.min(f.w / 2 - 10, 60); return [left ? cx - half : cx + half, f.y + T.fh / 2]; }
      function climb(a, b) {
        var p = [[a.x, a.y]], fa = a.f ? a.f.i : null, fb = b.f ? b.f.i : null;
        if (fa !== null && fb !== null && Math.abs(fb - fa) > 1) {
          var st = fb > fa ? 1 : -1;
          for (var i = fa + st; i !== fb; i += st) p.push(rampPoint(T.floors[i]));
        }
        p.push([b.x, b.y]);
        return p;
      }
      var lines = [];
      for (var ri = 1; ri < road.length; ri++) {
        var pp = climb(road[ri - 1], road[ri]);
        lines.push('<polyline points="' + pts(pp) + '" stroke="' + BRICK + '" stroke-width="3.6" fill="none" stroke-linejoin="round" stroke-linecap="round"/>');
      }
      s.push('<g filter="url(#rough)">' + lines.join("") + "</g>");
      s.push(T.names);
      road.forEach(function (nd, i) {
        s.push('<rect x="' + r1(nd.x - 12) + '" y="' + r1(nd.y - 12) + '" width="24" height="24" fill="' + BRICK + '" stroke="#fff7e6" stroke-width="2"/>');
        s.push(text(nd.x, nd.y + 6, String(i + 1), { size: 16, bold: true, fill: "#fff7e6" }));
      });
      all.forEach(function (nd) { if (road.indexOf(nd) < 0) s.push('<rect x="' + r1(nd.x - 3) + '" y="' + r1(nd.y - 3) + '" width="6" height="6" fill="' + INK + '"/>'); });
      s.push("</svg>");
      document.title = w + " — lexodus (Bruegel tower draft)";
      var others = all.filter(function (nd) { return road.indexOf(nd) < 0; });
      var h = ['<div class="sheet">'];
      h.push('<figure class="tower"><div class="box">' + s.join("") + '</div><p class="cap">The red line is the longest road of the word: it goes up and down the tower along the ramp, which winds round the floors, so it passes every floor in between. Small dark squares: the other words that took it, on their floors.</p></figure>');
      h.push('<div class="climb"><p class="over" style="font-style:italic">The climb of</p><h1>' + esc(w) + "</h1><p>" + esc(full.me.mean) + ".</p>" +
        "<ol>" + road.map(function (nd, i) {
          return '<li><span class="k">' + (i + 1) + "</span><span><b><i>" + esc(B.readable(nd.word, nd.tr)) + "</i></b>, " + esc(nd.name) + " — " + esc(nd.where) + (nd.how && i ? " (" + esc(nd.how) + ")" : "") + "</span></li>";
        }).join("") + "</ol>" +
        '<p style="margin-top:13px">On the other floors: ' + others.filter(function (nd) { return !nd.up; }).map(function (nd) { return "<i>" + esc(B.readable(nd.word, nd.tr)) + "</i> (" + esc(nd.name) + ")"; }).join(", ") + ".</p></div>");
      h.push("</div>");
      app.innerHTML = h.join("");
    }).catch(fail);
  }

  if (page === "language") languagePage(B.param("code") || "it");
  else wordPage();
})();
