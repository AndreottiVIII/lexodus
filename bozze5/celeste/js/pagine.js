/* lexodus, draft "celeste" (bozze5): the star charts, generated from the data in SVG.
   Language page: the constellation of the language. Its stars are its words that other languages took (data/
   dato_al_mondo); the rim of the chart carries the other 32 languages, grouped by family; every star stands at the
   centre of gravity of the languages that took it, so a word taken everywhere sits near the pole and a word taken by
   a few sits near them on the rim. Magnitude = number of languages. The figure is drawn with the lines of the
   shortest tree joining the brightest stars.
   Word page: the chart of one star. The pole is its farthest origin; each circle of declination going out is one
   generation; the angle groups the languages by family. Gold lines are the road of the word; dotted ivory lines join
   the stars of the same language into its constellation. */
(function () {
  "use strict";
  var app = document.getElementById("app"), page = document.body.getAttribute("data-page");
  var esc = B.esc, n = B.n, r1 = B.r1;
  var NIGHT = "#0f1d38", GOLD = "#d6aa4c", IVORY = "#f2ead6";
  var FAM_ORDER = ["romance", "germanic", "slavic", "baltic", "uralic", "turkic", "semitic", "other", "world"];

  function fail(e) { app.innerHTML = '<p class="loading">The data could not be read: ' + esc(e && e.message) + "</p>"; if (window.console) console.error(e); }
  function pts(list) { return list.map(function (p) { return r1(p[0]) + "," + r1(p[1]); }).join(" "); }
  // an engraved star: points alternate long and short, gold with a night outline
  function star(x, y, r, pointsN) {
    var k = pointsN || (r > 7 ? 8 : 6), p = [];
    for (var i = 0; i < k * 2; i++) {
      var a = -Math.PI / 2 + i * Math.PI / k, rr = i % 2 ? r * 0.42 : r;
      p.push([x + rr * Math.cos(a), y + rr * Math.sin(a)]);
    }
    return '<polygon points="' + pts(p) + '" fill="' + GOLD + '" stroke="' + NIGHT + '" stroke-width="0.6"/>';
  }
  function text(x, y, t, o) {
    o = o || {};
    return '<text x="' + r1(x) + '" y="' + r1(y) + '" text-anchor="' + (o.anchor || "start") + '" font-size="' + (o.size || 16) + '"' +
      (o.italic ? ' font-style="italic"' : "") + (o.cls ? ' class="' + o.cls + '"' : "") + (o.fill ? ' style="fill:' + o.fill + '"' : "") +
      ' stroke="' + NIGHT + '" stroke-width="4" stroke-linejoin="round" paint-order="stroke">' + t + "</text>";
  }
  // the engraved net of the chart: circles of declination and hour lines, dotted
  function graticule(cx, cy, R, rings) {
    var o = [];
    for (var i = 1; i <= rings; i++) o.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + r1(R * i / rings) + '" fill="none" stroke="' + IVORY + '" stroke-width="0.5" stroke-dasharray="1 3"/>');
    for (var a = 0; a < 24; a++) {
      var t = a * Math.PI / 12;
      o.push('<line x1="' + cx + '" y1="' + cy + '" x2="' + r1(cx + R * Math.cos(t)) + '" y2="' + r1(cy + R * Math.sin(t)) + '" stroke="' + IVORY + '" stroke-width="0.5" stroke-dasharray="1 3"/>');
    }
    // the rim: a double ring with a tick every 5 degrees, longer every 15
    o.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="none" stroke="' + IVORY + '" stroke-width="1.4"/>');
    o.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + (R + 8) + '" fill="none" stroke="' + IVORY + '" stroke-width="0.8"/>');
    for (var d = 0; d < 360; d += 5) {
      var tt = d * Math.PI / 180, l = d % 15 ? 4 : 8;
      o.push('<line x1="' + r1(cx + R * Math.cos(tt)) + '" y1="' + r1(cy + R * Math.sin(tt)) + '" x2="' + r1(cx + (R + l) * Math.cos(tt)) + '" y2="' + r1(cy + (R + l) * Math.sin(tt)) + '" stroke="' + IVORY + '" stroke-width="0.8"/>');
    }
    return o.join("");
  }
  // label placement: try right, left, above, below; skip when all collide
  function placer() {
    var boxes = [];
    function hit(b) { return boxes.some(function (q) { return b[0] < q[2] && b[2] > q[0] && b[1] < q[3] && b[3] > q[1]; }); }
    return {
      block: function (b) { boxes.push(b); },
      place: function (x, y, r, w, h) {
        var opts = [[x + r + 4, y + 5, "start"], [x - r - 4, y + 5, "end"], [x, y - r - 5, "middle"], [x, y + r + 15, "middle"]];
        for (var i = 0; i < opts.length; i++) {
          var o = opts[i], x0 = o[2] === "start" ? o[0] : o[2] === "end" ? o[0] - w : o[0] - w / 2;
          var b = [x0, o[1] - h + 3, x0 + w, o[1] + 3];
          if (!hit(b)) { boxes.push(b); return o; }
        }
        return null;
      }
    };
  }
  function rimOrder(L, except) {
    return L.list.filter(function (l) { return l.code !== except; }).sort(function (a, b) {
      return FAM_ORDER.indexOf(a.fam) - FAM_ORDER.indexOf(b.fam) || a.name.localeCompare(b.name);
    });
  }

  // =================== language page ===================
  function constellation(L, code, words) {
    var W = 712, H = 712, cx = W / 2, cy = H / 2, R = 248, o = [];
    var rim = rimOrder(L, code), ang = {};
    rim.forEach(function (l, i) { ang[l.code] = -Math.PI / 2 + (i + 0.5) * 2 * Math.PI / rim.length; });
    o.push('<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Constellation">');
    o.push('<rect width="' + W + '" height="' + H + '" fill="' + NIGHT + '"/>');
    o.push(graticule(cx, cy, R, 4));
    // the rim: the languages, with the sector of each family marked
    var poleK = 0;
    rim.forEach(function (l, i) {
      var a = ang[l.code], pole = Math.abs(Math.sin(a)) > 0.85, rr = R + 16 + (pole && (poleK++) % 2 ? 28 : 0), x = cx + rr * Math.cos(a), y = cy + rr * Math.sin(a);
      var anchor = Math.abs(Math.cos(a)) < 0.04 ? "middle" : Math.cos(a) > 0 ? "start" : "end";
      o.push(text(x, y + (Math.sin(a) > 0.6 ? 12 : Math.sin(a) < -0.6 ? -2 : 5), esc(l.name.replace(" Bokmål", "")), { anchor: anchor, size: 15, cls: "scx" }));
      if (i > 0 && rim[i - 1].fam !== l.fam) {
        var b = a - Math.PI / rim.length;
        o.push('<line x1="' + r1(cx + (R - 6) * Math.cos(b)) + '" y1="' + r1(cy + (R - 6) * Math.sin(b)) + '" x2="' + r1(cx + (R + 14) * Math.cos(b)) + '" y2="' + r1(cy + (R + 14) * Math.sin(b)) + '" stroke="' + GOLD + '" stroke-width="1.6"/>');
      }
    });
    // stars at the centre of gravity of the languages that took them
    var stars = words.map(function (w) {
      var sx = 0, sy = 0, k = 0;
      (w.lingue || []).forEach(function (x) { if (ang[x.codice] !== undefined) { sx += Math.cos(ang[x.codice]); sy += Math.sin(ang[x.codice]); k++; } });
      if (!k) return null;
      return { w: w, vx: sx / k, vy: sy / k, r: 2 + Math.sqrt(w.n_lingue) * 1.4 };
    }).filter(Boolean);
    // the pull is small for words taken everywhere: stretch the distance from the pole so the farthest star reaches
    // the rim (square root of the pull, scaled to the largest); the direction is untouched
    var maxPull = Math.max.apply(null, stars.map(function (s) { return Math.hypot(s.vx, s.vy); }));
    stars.forEach(function (s) {
      var m = Math.hypot(s.vx, s.vy) || 1e-6, f = Math.sqrt(m / maxPull) * R * 0.9 / m;
      s.x = cx + s.vx * f; s.y = cy + s.vy * f;
    });
    // move overlapping stars apart a little, always the same way
    for (var it = 0; it < 60; it++) {
      for (var i = 0; i < stars.length; i++) for (var j = i + 1; j < stars.length; j++) {
        var a = stars[i], b = stars[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.01, min = a.r + b.r + 3;
        if (d < min) { var push = (min - d) / 2; dx /= d; dy /= d; a.x -= dx * push; a.y -= dy * push; b.x += dx * push; b.y += dy * push; }
      }
    }
    // the figure: the shortest tree joining the 24 brightest
    var bright = stars.slice(0, 24), inT = [bright[0]], lines = [];
    while (inT.length < bright.length) {
      var best = null;
      inT.forEach(function (a) { bright.forEach(function (b) { if (inT.indexOf(b) < 0) { var d = Math.hypot(a.x - b.x, a.y - b.y); if (!best || d < best[2]) best = [a, b, d]; } }); });
      inT.push(best[1]); lines.push(best);
    }
    lines.forEach(function (l) { o.push('<line x1="' + r1(l[0].x) + '" y1="' + r1(l[0].y) + '" x2="' + r1(l[1].x) + '" y2="' + r1(l[1].y) + '" stroke="' + GOLD + '" stroke-width="1.1"/>'); });
    stars.forEach(function (s) { o.push(star(s.x, s.y, s.r)); });
    var pl = placer();
    stars.forEach(function (s) { pl.block([s.x - s.r, s.y - s.r, s.x + s.r, s.y + s.r]); });
    var named = 0;
    stars.forEach(function (s, i) {
      if (i >= 40) return;
      var t = s.w.parola, wdt = t.length * 8 + 4, at = pl.place(s.x, s.y, s.r, wdt, 16);
      if (!at) return;
      named++;
      o.push(text(at[0], at[1], esc(t), { anchor: at[2], size: 17, italic: true }));
    });
    o.push("</svg>");
    return { svg: o.join(""), named: named, shown: stars.length };
  }

  function languagePage(code) {
    Promise.all([B.langs(), B.givenToWorld(code), B.language(code)]).then(function (res) {
      var L = res[0], G = res[1], D = res[2], l = L.by[code];
      var words = (G.parole || []).slice(0, 70);
      var c = constellation(L, code, words);
      document.title = l.name + " — lexodus (Cellarius draft)";
      var h = ['<div class="sheet">'];
      h.push('<figure class="plate"><div class="box">' + c.svg + "</div></figure>");
      h.push('<div class="side"><div class="cartouche"><p class="over">Constellatio</p><h1>' + esc(l.name) + "</h1>" +
        "<p>" + n(G.n_parole_con_discendenti || 0) + " of its words were taken by other languages; the " + c.shown + " brightest are charted here, " + c.named +
        " of them named. A star stands where the languages that took it pull it: towards the Germanic and Romance rim, where most of them went.</p>" +
        "<p>Gave " + n(D.toTotal) + " words, took " + n(D.fromTotal) + ".</p></div>");
      h.push('<table class="cat"><caption>Catalogue of the brightest stars</caption><tr><th>star</th><th class="n">mag.</th><th>origin</th></tr>' +
        words.slice(0, 14).map(function (w) {
          var orig = w.origine_X ? esc(w.origine_X.nome_en) + " <i>" + esc(B.readable(w.origine_X.termine, w.origine_X.traslitterazione)) + "</i>" : "—";
          return "<tr><td><i>" + esc(w.parola) + '</i></td><td class="n">' + w.n_lingue + "</td><td>" + orig + "</td></tr>";
        }).join("") + "</table>" +
        '<p style="margin-top:13px">Magnitude: the number of languages that have a word descended from it. Origin: where ' + esc(l.name) + " took the word from, when the tree says.</p></div>");
      h.push('<div class="under"><p>A star for every word that other languages took; its size: how many took it. The rim carries the other 32 languages, grouped by family (gold ticks mark where a family begins). The gold lines are the figure of the constellation: the shortest lines that join its 24 brightest stars.</p></div>');
      h.push("</div>");
      app.innerHTML = h.join("");
    }).catch(fail);
  }

  // =================== word page ===================
  function skyOfWord(full) {
    var W = 712, H = 712, cx = W / 2, cy = H / 2 - 4, o = [];
    var root = full.root, depth = 0, leaves = 0;
    (function walk(nd) { depth = Math.max(depth, nd.d); nd.kids.sort(function (a, b) { return FAM_ORDER.indexOf(a.fam) - FAM_ORDER.indexOf(b.fam) || a.name.localeCompare(b.name); }); nd.kids.forEach(walk); })(root);
    (function count(nd) { nd.leaves = nd.kids.length ? nd.kids.reduce(function (s, k) { return s + count(k); }, 0) : 1; return nd.leaves; })(root);
    leaves = root.leaves;
    var step = 300 / Math.max(1, depth), acc = 0;
    (function place(nd, a0) {
      if (!nd.kids.length) { nd.a = (a0 + 0.5) / leaves * 2 * Math.PI - Math.PI / 2; return; }
      var s = a0;
      nd.kids.forEach(function (k) { place(k, s); s += k.leaves; });
      nd.a = (nd.kids[0].a + nd.kids[nd.kids.length - 1].a) / 2;
    })(root, 0);
    void acc;
    var all = [];
    (function walk(nd) { var rr = nd.d * step; nd.x = cx + rr * Math.cos(nd.a); nd.y = cy + rr * Math.sin(nd.a); all.push(nd); nd.kids.forEach(walk); })(root);
    // magnitude: how many languages are under the star
    all.forEach(function (nd) { var s = {}; (function c(x) { x.kids.forEach(function (k) { s[k.code] = 1; c(k); }); })(nd); nd.mag = Object.keys(s).length; nd.r = 4 + Math.sqrt(nd.mag) * 2.2; });
    o.push('<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Star chart of the word">');
    o.push('<rect width="' + W + '" height="' + H + '" fill="' + NIGHT + '"/>');
    o.push(graticule(cx, cy, depth * step + 18, depth));
    // constellations: dotted lines joining the stars of the same language
    var byLang = {};
    all.forEach(function (nd) { (byLang[nd.code] = byLang[nd.code] || []).push(nd); });
    Object.keys(byLang).forEach(function (k) {
      var g = byLang[k].slice().sort(function (a, b) { return a.a - b.a; });
      for (var i = 1; i < g.length; i++) o.push('<line x1="' + r1(g[i - 1].x) + '" y1="' + r1(g[i - 1].y) + '" x2="' + r1(g[i].x) + '" y2="' + r1(g[i].y) + '" stroke="' + IVORY + '" stroke-width="1" stroke-dasharray="2 4"/>');
    });
    // the road: gold lines from star to star
    B.edges(root).forEach(function (e) {
      var main = (e[1].up || e[1].here) ? 2.6 : 1.2;
      o.push('<line x1="' + r1(e[0].x) + '" y1="' + r1(e[0].y) + '" x2="' + r1(e[1].x) + '" y2="' + r1(e[1].y) + '" stroke="' + GOLD + '" stroke-width="' + main + '"/>');
    });
    all.forEach(function (nd) { o.push(star(nd.x, nd.y, nd.r, nd.here ? 8 : undefined)); if (nd.here) o.push('<circle cx="' + r1(nd.x) + '" cy="' + r1(nd.y) + '" r="' + r1(nd.r + 6) + '" fill="none" stroke="' + GOLD + '" stroke-width="1.2"/>'); });
    var pl = placer();
    all.forEach(function (nd) { pl.block([nd.x - nd.r, nd.y - nd.r, nd.x + nd.r, nd.y + nd.r]); });
    all.slice().sort(function (a, b) { return b.mag - a.mag || a.d - b.d; }).forEach(function (nd) {
      var t = B.readable(nd.word, nd.tr), lab = t + " · " + nd.code, wdt = lab.length * 7.6 + 4;
      var at = pl.place(nd.x, nd.y, nd.r, wdt, 16);
      if (!at) return;
      o.push(text(at[0], at[1], '<tspan font-style="italic">' + esc(t) + "</tspan> · " + esc(nd.code), { anchor: at[2], size: nd.here || nd.up ? 18 : 16 }));
    });
    o.push("</svg>");
    return { svg: o.join(""), all: all, depth: depth, byLang: byLang };
  }

  function wordPage() {
    var lang = B.param("lang") || "it", w = B.param("w") || "caffè", ne = +(B.param("n") || 1), from = B.param("from");
    B.word(lang, w, ne, from).then(function (R) {
      if (!R.tree) throw new Error("No tree for this word.");
      var L = R.L, full = B.fullTree(L, lang, R.tree);
      var sky = skyOfWord(full), me = full.me;
      var su = R.tree.e.su || [], direct = su[0], far = su[su.length - 1];
      var langs = Object.keys(sky.byLang).length;
      document.title = w + " — lexodus (Cellarius draft)";
      var h = ['<div class="sheet">'];
      h.push('<figure class="plate"><div class="box">' + sky.svg + "</div></figure>");
      h.push('<div class="side"><div class="cartouche"><p class="over">Stella in ' + esc(L.by[lang].name) + "</p><h1><i>" + esc(w) + "</i></h1>" +
        "<p>" + esc(me.mean) + ".</p></div>" +
        '<table class="cat"><caption>Elements of the star</caption>' +
        "<tr><td>Magnitude</td><td>" + me.mag + " languages took it, " + n(full.count) + " words in all</td></tr>" +
        "<tr><td>Right ascension</td><td>" + (direct ? esc(direct.nome) + " <i>" + esc(B.readable(direct.termine, direct.traslitterazione)) + "</i>" : "—") + " (the language it came from)</td></tr>" +
        "<tr><td>Declination</td><td>" + (far ? esc(far.nome) + " <i>" + esc(B.readable(far.termine, far.traslitterazione)) + "</i>" : "—") + " (the farthest origin, at the pole)</td></tr>" +
        "<tr><td>Constellations crossed</td><td>" + langs + "</td></tr></table>" +
        (R.text ? '<p style="margin-top:13px"><i>“' + esc(R.text) + "”</i> (Wiktionary)</p>" : "") + "</div>");
      h.push('<div class="under"><p>The pole of the chart is the farthest origin; every circle further out is one more language on the road. Gold lines join a word to the one it came from (thicker: the road to ' + esc(w) +
        '). Dotted lines join the stars of one language into its constellation. Each star is labelled with its word and the code of its language; the size of a star is the number of languages that took it after.</p><p>Constellations: ' +
        Object.keys(sky.byLang).map(function (k) { return k + " " + esc(B.nameOf(L, k)); }).join(" · ") + ".</p></div>");
      h.push("</div>");
      app.innerHTML = h.join("");
    }).catch(fail);
  }

  if (page === "language") languagePage(B.param("code") || "it");
  else wordPage();
})();
