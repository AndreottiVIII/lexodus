/* lexodus, draft "partitura" (a music score; Italian gave the world the words of music). Everything is drawn by hand
   in SVG: staves, clefs (the Noto Music glyph), noteheads, stems, ledger lines, slurs, dynamics.
   Home: the full score, one staff per tongue, its notes the tongues that took words from it. Language: a sonata in two
   movements (Entrances, Exits), one note per tongue, height = number of words. Word: the theme of caffè, one staff per
   stage, the note passing from staff to staff under a slur. Tree: the variations, one staff per tongue reached. */
(function () {
  "use strict";
  var B = window.B;
  function el(id) { return document.getElementById(id); }
  var page = document.body.dataset.page;
  var LOAN = ["prestito", "latinismo_dotto", "calco"];
  var S = 10; // distance between staff lines
  var FAM_ORDER = ["romance", "germanic", "slavic", "baltic", "uralic", "semitic", "turkic", "other"];
  var FAM_NAME = { romance: "Romance", germanic: "Germanic", slavic: "Slavic", baltic: "Baltic", uralic: "Finno-Ugric", semitic: "Semitic", turkic: "Turkic", other: "Greek, Albanian, Iranian" };
  function fail(e) { el("loading").textContent = "A string broke: the data could not be loaded (" + e.message + ")."; console.error(e); }
  function ready() { document.body.dataset.ready = "1"; }
  function show() { el("loading").hidden = true; el("app").hidden = false; }
  function x(s) { return B.esc(s); }

  // ---- engraving ----
  // staff positions: 0 = bottom line, 8 = top line, one step = half a space
  function py(top, p) { return top + 4 * S - p * S / 2; }
  function staff(x1, x2, top) {
    var s = "";
    for (var i = 0; i < 5; i++) s += '<line class="sl" x1="' + x1 + '" x2="' + x2 + '" y1="' + (top + i * S) + '" y2="' + (top + i * S) + '"/>';
    return s;
  }
  function clef(xx, top) { return '<text class="clef" x="' + xx + '" y="' + (top + 3.1 * S) + '">𝄞</text>'; }
  function rest(xx, top) { return '<text class="rest" x="' + xx + '" y="' + (top + 2.6 * S) + '">𝄽</text>'; }
  function bar(xx, top, h, final) {
    return '<line class="bl" x1="' + xx + '" x2="' + xx + '" y1="' + top + '" y2="' + (top + h) + '"/>' +
      (final ? '<line class="bl" x1="' + (xx - 5) + '" x2="' + (xx - 5) + '" y1="' + top + '" y2="' + (top + h) + '"/><rect x="' + (xx - 1) + '" y="' + top + '" width="4" height="' + h + '"/>' : "");
  }
  function note(xx, top, p, cls) {
    var y = py(top, p), s = "";
    for (var l = -2; l >= p; l -= 2) s += '<line class="ledger" x1="' + (xx - 10) + '" x2="' + (xx + 10) + '" y1="' + py(top, l) + '" y2="' + py(top, l) + '"/>';
    for (var h = 10; h <= p; h += 2) s += '<line class="ledger" x1="' + (xx - 10) + '" x2="' + (xx + 10) + '" y1="' + py(top, h) + '" y2="' + py(top, h) + '"/>';
    s += '<ellipse class="nh' + (cls ? " " + cls : "") + '" cx="' + xx + '" cy="' + y + '" rx="6.3" ry="4.4" transform="rotate(-22 ' + xx + " " + y + ')"/>';
    s += p < 4 ? '<line class="stem" x1="' + (xx + 5.6) + '" x2="' + (xx + 5.6) + '" y1="' + (y - 1) + '" y2="' + (y - 3.4 * S) + '"/>'
      : '<line class="stem" x1="' + (xx - 5.6) + '" x2="' + (xx - 5.6) + '" y1="' + (y + 1) + '" y2="' + (y + 3.4 * S) + '"/>';
    return s;
  }
  function pitch(n, max) { return Math.round(-2 + 12 * Math.log(n + 1) / Math.log(max + 1)); }
  function dyn(n) { return n >= 1000 ? "ff" : n >= 300 ? "f" : n >= 100 ? "mf" : n >= 30 ? "mp" : n >= 10 ? "p" : "pp"; }
  function letterPitch(w) {
    var c = B.isLatinScript(w) ? String(w) : "";
    c = (c.normalize("NFD").replace(/\p{Mn}/gu, "").toLowerCase().match(/[a-z]/) || ["c"])[0];
    var name = "abcdefg".charAt((c.charCodeAt(0) - 97) % 7);
    return { name: name.toUpperCase(), p: { a: 3, b: 4, c: 5, d: 6, e: 7, f: 1, g: 2 }[name] };
  }
  function svg(w, h, body, label) { return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="' + x(label) + '">' + body + "</svg>"; }
  function onResize(f) { var t; window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(f, 150); }); }

  // ===================== home: the full score =====================
  function home() {
    B.langs().then(function (L) {
      var arcs = window.LEXODUS.archi.archi, to = {};
      arcs.forEach(function (a) {
        if (LOAN.indexOf(a.categoria) < 0 || !(a.n_parole > 0)) return;
        var o = B.merged(a.origine), d = B.merged(a.arrivo);
        if (o === d || !(L.by[o] && L.by[o].target)) return;
        var m = to[o] || (to[o] = {});
        m[d] = (m[d] || 0) + a.n_parole;
      });
      var max = 1;
      Object.keys(to).forEach(function (o) { Object.keys(to[o]).forEach(function (d) { max = Math.max(max, to[o][d]); }); });
      var groups = FAM_ORDER.map(function (f) { return { f: f, list: L.list.filter(function (l) { return l.fam === f; }).sort(function (a, b) { return b.gave - a.gave; }) }; }).filter(function (g) { return g.list.length; });
      el("mm").innerHTML = "♩ = " + B.n(L.list.reduce(function (s, l) { return s + l.gave; }, 0));
      function draw() {
        var W = el("score").clientWidth, small = W < 700, LBL = small ? 112 : 196, X0 = LBL + 22, GAP = small ? 34 : 50;
        var per = Math.max(3, Math.floor((W - X0 - 70) / GAP)), H = 0, body = "", top = 26;
        groups.forEach(function (g) {
          var gTop = top;
          g.list.forEach(function (l) {
            var m = to[l.code] || {}, ds = Object.keys(m).sort(function (a, b) { return m[b] - m[a]; }).slice(0, per);
            body += '<a href="' + B.langUrl(l.code) + '" class="stf"><text class="inst" x="' + (LBL - 6) + '" y="' + (top + 2.7 * S) + '" text-anchor="end">' + x(l.name) + "</text>" +
              '<rect class="hit" x="0" y="' + (top - 14) + '" width="' + W + '" height="' + (4 * S + 28) + '"/></a>' +
              staff(X0, W - 8, top) + clef(X0 + 2, top);
            ds.forEach(function (d, i) {
              body += '<g class="n"><title>' + x(l.name) + " → " + x(B.nameOf(L, d)) + ": " + B.n(m[d]) + " words</title>" + note(X0 + 54 + i * GAP, top, pitch(m[d], max)) + "</g>";
            });
            if (!ds.length) body += rest(X0 + 60, top);
            body += bar(W - 8, top, 4 * S);
            top += 4 * S + (small ? 30 : 34);
          });
          // the bracket of the family, as the sections of an orchestra
          var gEnd = top - (small ? 30 : 34);
          body += '<path class="bracket" d="M' + (X0 - 8) + " " + (gTop - 6) + " q-6 0 -6 -6 M" + (X0 - 8) + " " + (gTop - 6) + " V" + (gEnd + 6) + " M" + (X0 - 8) + " " + (gEnd + 6) + ' q-6 0 -6 6"/>' +
            '<line class="sysline" x1="' + X0 + '" x2="' + X0 + '" y1="' + gTop + '" y2="' + gEnd + '"/>' +
            '<text class="section" x="14" y="' + ((gTop + gEnd) / 2) + '" text-anchor="middle" transform="rotate(-90 14 ' + ((gTop + gEnd) / 2) + ')">' + (small ? "" : x(FAM_NAME[g.f])) + "</text>";
          top += 14;
        });
        H = top + 10;
        el("score").innerHTML = svg(W, H, body, "Full score of the 33 tongues");
      }
      show(); draw(); onResize(draw);
      el("legend").innerHTML = "Each staff is a tongue, grouped by family as the sections of an orchestra. Its notes are the tongues that took words from it, the biggest borrower first; the higher the note, the more words. Point at a note to read the figure; choose a staff to hear its sonata.";
      ready();
    }).catch(fail);
  }

  // ===================== language: a sonata in two movements =====================
  function language() {
    var code = B.param("code") || "it";
    B.language(code).then(function (d) {
      var l = d.lang, L = d.L;
      document.title = "Sonata for " + l.name + " — lexodus (score draft)";
      el("work").textContent = "Sonata in " + l.name;
      el("subtitle").textContent = l.target ? "for " + d.from.length + " voices entering and " + d.to.length + " leaving · " + B.n(l.lemmas) + " entries in the Wiktionary" : "for " + d.to.length + " voices leaving";
      el("t1").textContent = l.target ? "Andante · ♩ = " + B.n(l.took) : "tacet";
      el("t2").textContent = "Allegro · ♩ = " + B.n(l.target ? l.gave : d.toTotal);
      el("jump").innerHTML = L.list.slice().sort(function (a, b) { return a.name.localeCompare(b.name); })
        .map(function (t) { return '<option value="' + t.code + '"' + (t.code === code ? " selected" : "") + ">" + x(t.name) + "</option>"; }).join("");
      el("jump").onchange = function () { if (this.value) location.href = B.langUrl(this.value); };
      var max = Math.max(d.from.length ? d.from[0].n : 1, d.to.length ? d.to[0].n : 1);
      var SHOW = 24;
      function movement(id, rows, side) {
        var W = el(id).clientWidth, small = W < 700, GAP = small ? 58 : 74, X0 = small ? 40 : 56, per = Math.max(3, Math.floor((W - X0 - 60) / GAP));
        var list = rows.slice(0, SHOW), sys = [], body = "", top = 84, SYS_H = small ? 236 : 212;
        for (var i = 0; i < list.length; i += per) sys.push(list.slice(i, i + per));
        sys.forEach(function (notes, si) {
          var end = Math.min(W - 6, X0 + 52 + notes.length * GAP + 10);
          body += staff(X0, end, top) + clef(X0 + 2, top) + '<line class="sysline" x1="' + X0 + '" x2="' + X0 + '" y1="' + top + '" y2="' + (top + 4 * S) + '"/>';
          var lastX = -999, lift = 0;
          notes.forEach(function (r, k) {
            var xx = X0 + 58 + k * GAP, p = pitch(r.n, max), href = B.langUrl(r.code);
            var cats = Object.keys(r.cats).sort(function (a, b) { return r.cats[b] - r.cats[a]; });
            body += '<a href="' + x(href) + '" class="n"><title>' + x(r.name) + ": " + B.n(r.n) + " words</title>" + note(xx, top, p) +
              '<text class="fig" x="' + xx + '" y="' + (Math.min(py(top, p), top) - (p >= 4 ? 10 : 3.6 * S + 6)) + '" text-anchor="middle">' + B.n(r.n) + "</text>" +
              '<text class="dyn" x="' + xx + '" y="' + (Math.max(py(top, p) + (p < 4 ? 18 : 3.4 * S + 16), top + 4 * S + 22)) + '" text-anchor="middle">' + dyn(r.n) + "</text>" +
              '<text class="lyr" x="' + (xx + 4) + '" y="' + (top + 4 * S + 50) + '" transform="rotate(-38 ' + (xx + 4) + " " + (top + 4 * S + 50) + ')" text-anchor="end">' + x(r.name) + "</text>" +
              (k === 0 || cats[0] !== Object.keys(notes[k - 1].cats).sort(function (a, b) { return notes[k - 1].cats[b] - notes[k - 1].cats[a]; })[0]
                ? (lift = xx - lastX < 120 ? lift + 18 : 0, lastX = xx, '<text class="expr" x="' + (xx - 8) + '" y="' + (top - 58 - lift) + '">' + x(B.CATS[cats[0]]) + "</text>") : "") + "</a>";
          });
          body += bar(end, top, 4 * S, si === sys.length - 1);
          top += SYS_H;
        });
        el(id).innerHTML = list.length ? svg(W, top - SYS_H + 4 * S + 150, body, side === "from" ? "Entrances" : "Exits") : '<p class="tacet">Tacet.</p>';
        var rest = rows.slice(SHOW);
        el(id + "-rest").innerHTML = rest.length ? "<i>Tacent</i> (they rest in this movement, " + rest.length + " voices): " +
          rest.map(function (r) { return '<a href="' + B.langUrl(r.code) + '">' + x(r.name) + "</a> " + B.n(r.n); }).join(", ") + "." : "";
      }
      show();
      function draw() { if (l.target) movement("in", d.from, "from"); else el("in").innerHTML = '<p class="tacet">Tacet: this tongue is not among the thirty-three.</p>'; movement("out", d.to, "to"); }
      draw(); onResize(draw);
      ready();
    }).catch(fail);
  }

  // ===================== word: the theme =====================
  function word() {
    var lang = B.param("lang") || "it", w = B.param("w") || "caffè", ne = +B.param("n") || 1, from = B.param("from") || "";
    B.word(lang, w, ne, from).then(function (r) {
      var L = r.L, p = r.p;
      if (!p) {
        el("loading").innerHTML = "No theme for “" + x(w) + "”. <a href=\"" + B.wiktUrl(w, B.nameOf(L, lang)) + "\">Wiktionary</a>.";
        return ready();
      }
      var stops = B.journey(L, lang, p), name = B.nameOf(L, lang);
      document.title = "Theme: " + p.parola + " — lexodus (score draft)";
      el("work").innerHTML = "<i>" + x(p.parola) + "</i>";
      el("subtitle").textContent = "Theme in " + stops.length + " voices" + (p.significato ? " · “" + p.significato + "”" : "");
      el("composer").textContent = stops.map(function (s) { return s.name; }).join(", ");
      el("tempo").innerHTML = "<i>" + (stops.length > 3 ? "Andante, molto viaggiato" : "Andante cantabile") + "</i>";
      function draw() {
        var W = el("theme").clientWidth, small = W < 700, LBL = small ? 0 : 170, X0 = LBL + 16, top0 = small ? 60 : 70, GAP_Y = small ? 128 : 104;
        var beat = Math.min(small ? 96 : 230, (W - X0 - 110) / Math.max(1, stops.length));
        var body = "", pts = [];
        stops.forEach(function (s, i) {
          var top = top0 + i * GAP_Y;
          body += staff(X0, W - 8, top) + clef(X0 + 2, top) + bar(W - 8, top, 4 * S, true);
          body += small ? '<text class="inst small" x="' + (X0 + 2) + '" y="' + (top - 24) + '">' + x(s.name) + "</text>"
            : '<text class="inst" x="' + (LBL - 6) + '" y="' + (top + 2.7 * S) + '" text-anchor="end">' + x(s.name) + "</text>";
          for (var k = 0; k < stops.length; k++) {
            var xx = X0 + 70 + k * beat;
            if (k !== i) body += rest(xx - 4, top);
          }
          var lp = letterPitch(s.tr && s.tr !== s.term ? s.tr : s.term), nx = X0 + 70 + i * beat, ny = py(top, lp.p);
          pts.push({ x: nx, y: ny, top: top, p: lp.p });
          body += '<g class="' + (s.here ? "here" : "") + '">' + note(nx, top, lp.p, s.here ? "red" : "") + "</g>" +
            '<text class="pname" x="' + (nx + 12) + '" y="' + (ny - 8) + '">' + lp.name + "</text>" +
            '<text class="lyr big" x="' + nx + '" y="' + (top + 4 * S + 26) + '" text-anchor="middle">' + x(s.term || "—") + "</text>" +
            (s.tr && s.tr !== s.term ? '<text class="lyr tr" x="' + nx + '" y="' + (top + 4 * S + 46) + '" text-anchor="middle">' + x(s.tr) + "</text>" : "");
        });
        // the slurs: from each note to the next, crossing to the next staff
        pts.forEach(function (a, i) {
          if (i === pts.length - 1) return;
          var b = pts[i + 1], x1 = a.x + 9, y1 = a.y + 4, x2 = b.x - 9, y2 = b.y - 6;
          var c1x = x1 + (x2 - x1) * 0.55, c1y = y1 - 6, c2x = x2 - (x2 - x1) * 0.15, c2y = y2 - 46;
          body += '<path class="slur" d="M' + x1 + " " + y1 + " C" + c1x + " " + c1y + " " + c2x + " " + c2y + " " + x2 + " " + y2 + '"/>' +
            '<text class="expr" x="' + (x1 + (x2 - x1) * 0.3) + '" y="' + (Math.min(y1, a.top) - 14) + '">' + x(stops[i].how || "") + "</text>";
        });
        // the system bracket
        var last = top0 + (stops.length - 1) * GAP_Y + 4 * S;
        body += '<line class="sysline" x1="' + X0 + '" x2="' + X0 + '" y1="' + top0 + '" y2="' + last + '"/>' +
          '<path class="bracket" d="M' + (X0 - 8) + " " + (top0 - 6) + " q-6 0 -6 -6 M" + (X0 - 8) + " " + (top0 - 6) + " V" + (last + 6) + " M" + (X0 - 8) + " " + (last + 6) + ' q-6 0 -6 6"/>';
        el("theme").innerHTML = svg(W, last + 70, body, "Theme of " + p.parola);
      }
      show(); draw(); onResize(draw);
      el("ety").textContent = (r.text || "No programme note.") + (r.text && r.text.length >= 300 ? "…" : "");
      el("wikt").href = B.wiktUrl(p.parola, name);
      el("tree-link").href = B.treeUrl(lang, p.parola, p.n_etimologia);
      var giu = r.tree && r.tree.e ? r.tree.e.giu || [] : [], items = [];
      (function walk(list, parent, depth) { list.forEach(function (g) { items.push({ g: g, parent: parent, depth: depth }); walk(g.giu || [], g.lingua, depth + 1); }); })(giu, lang, 0);
      el("var-sum").textContent = items.length ? items.length + " variations by other tongues." : "No variations, as far as the Wiktionary says.";
      el("vars").innerHTML = items.slice(0, 16).map(function (it) {
        var g = it.g;
        return '<li style="--d:' + it.depth + '"><span class="nt">♪</span> <a href="' + x(B.wordUrl(g.lingua, g.parola, g.n_etimologia, it.parent)) + '"><i>' + x(g.parola) + "</i></a> " +
          '<span class="vl">' + x(B.nameOf(L, g.lingua)) + "</span></li>";
      }).join("") + (items.length > 16 ? '<li class="more">… and ' + (items.length - 16) + " more in the full score</li>" : "");
      el("tree-link").parentNode.hidden = !items.length;
      ready();
    }).catch(fail);
  }

  // ===================== tree: the variations, in full score =====================
  function tree() {
    var lang = B.param("lang") || "it", w = B.param("w") || "caffè", ne = +B.param("n") || 1;
    Promise.all([B.langs(), B.tree(lang, w, ne)]).then(function (res) {
      var L = res[0], t = res[1];
      if (!t) {
        el("loading").innerHTML = "No variations for “" + x(w) + "”. <a href=\"" + B.wiktUrl(w, B.nameOf(L, lang)) + "\">Wiktionary</a>.";
        return ready();
      }
      var T = B.fullTree(L, lang, t);
      document.title = "Variations on " + T.word + " — lexodus (score draft)";
      el("work").innerHTML = "Variations on <i>" + x(T.word) + "</i>";
      el("word-link").href = B.wordUrl(lang, T.word, T.n, T.me.parent);
      // staves in order of entrance (breadth first), beats = depth
      var order = [], nodes = [], q = [T.root], maxD = 0;
      while (q.length) { var n = q.shift(); nodes.push(n); if (order.indexOf(B.merged(n.code)) < 0) order.push(B.merged(n.code)); maxD = Math.max(maxD, n.d); q = q.concat(n.kids); }
      el("subtitle").textContent = "in full score, for " + order.length + " voices · " + T.count + " variations";
      // how many notes share a staff and a beat: they are written one under the other as lyric lines
      var slot = {}, lines = {};
      nodes.forEach(function (n) { var k = B.merged(n.code) + "|" + n.d; n.k = (slot[k] = (slot[k] || 0) + 1) - 1; lines[B.merged(n.code)] = Math.max(lines[B.merged(n.code)] || 1, slot[k]); });
      var LBL = 136, X0 = LBL + 16, BEAT = Math.max(110, Math.min(150, (el("full").clientWidth - X0 - 190) / (maxD + 0.5))), tops = {}, y = 50;
      order.forEach(function (c) { tops[c] = y; y += 4 * S + 30 + 22 * lines[c] + 10; });
      var W = X0 + 60 + (maxD + 1) * BEAT + 70, H = y + 10, body = "";
      order.forEach(function (c) {
        var top = tops[c];
        body += staff(X0, W - 10, top) + clef(X0 + 2, top) + bar(W - 10, top, 4 * S, true) +
          '<text class="inst" x="' + (LBL - 6) + '" y="' + (top + 2.7 * S) + '" text-anchor="end">' + x(B.nameOf(L, c)) + "</text>";
        for (var b = 1; b <= maxD + 1; b++) body += '<line class="bl thin" x1="' + (X0 + 30 + b * BEAT) + '" x2="' + (X0 + 30 + b * BEAT) + '" y1="' + top + '" y2="' + (top + 4 * S) + '"/>';
      });
      nodes.forEach(function (n) {
        var c = B.merged(n.code), top = tops[c], lp = letterPitch(n.tr && n.tr !== n.word ? n.tr : n.word);
        n.x = X0 + 90 + n.d * BEAT + n.k * 18; n.y = py(top, lp.p);
        var href = n.up ? B.langUrl(n.code) : B.wordUrl(n.code, n.word, n.ne || 1, n.parent);
        body += '<a href="' + x(href) + '" class="n"><title>' + x(B.nameOf(L, n.code) + " " + n.word) + "</title>" + note(n.x, top, lp.p, n.here ? "red" : "") +
          '<text class="lyr" x="' + (X0 + 90 + n.d * BEAT - 8) + '" y="' + (top + 4 * S + 24 + 22 * n.k) + '">' + x(n.word) + (n.tr && n.tr !== n.word ? " (" + x(n.tr) + ")" : "") + "</text></a>";
      });
      nodes.forEach(function (n) {
        n.kids.forEach(function (k) {
          var x1 = n.x + 8, y1 = n.y, x2 = k.x - 8, y2 = k.y;
          body += '<path class="slur" d="M' + x1 + " " + (y1 - 4) + " C" + (x1 + (x2 - x1) * 0.6) + " " + (y1 - 14) + " " + (x2 - (x2 - x1) * 0.6) + " " + (y2 - 14) + " " + x2 + " " + (y2 - 5) + '"/>';
        });
      });
      body += '<line class="sysline" x1="' + X0 + '" x2="' + X0 + '" y1="' + tops[order[0]] + '" y2="' + (tops[order[order.length - 1]] + 4 * S) + '"/>';
      el("full").innerHTML = svg(W, H, body, "Variations on " + T.word);
      show(); ready();
    }).catch(fail);
  }

  if (page === "index") home();
  else if (page === "language") language();
  else if (page === "word") word();
  else tree();
})();
