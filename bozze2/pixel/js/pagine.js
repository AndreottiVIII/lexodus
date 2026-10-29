/* lexodus, draft "pixel": home (world map of 33 kingdoms), language (kingdom screen), word (item card), tree
   (skill tree). Drawn with SVG rectangles only, 16 colours, no gradients. */
(function () {
  "use strict";
  var B = window.B;
  function el(id) { return document.getElementById(id); }
  var page = document.body.dataset.page;
  var P = ["#000000", "#1d2b53", "#7e2553", "#008751", "#ab5236", "#5f574f", "#c2c3c7", "#fff1e8", "#ff004d", "#ffa300", "#ffec27", "#00e436", "#29adff", "#83769c", "#ff77a8", "#ffccaa"];
  var FC = { romance: P[8], germanic: P[12], slavic: P[11], baltic: P[10], uralic: P[13], semitic: P[9], turkic: P[14], other: P[15], world: P[6] };
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; }
  function fail(e) { el("loading").textContent = "GAME OVER: " + e.message; console.error(e); }
  function ready() { document.body.dataset.ready = "1"; }
  function cut(s, k) { s = String(s || ""); return Array.from(s).length > k ? Array.from(s).slice(0, k - 1).join("") + "…" : s; }

  // the castle sprite, 5 x 5 cells: f flag, p pole, w wall, d shadow, g gate
  var CASTLE = ["..pff", "..pf.", "w.w.w", "wwwww", "wdgdw"];
  function sprite(x, y, cell, flag) {
    var col = { f: flag, p: P[7], w: P[6], d: P[5], g: P[0] }, out = "";
    CASTLE.forEach(function (row, j) {
      Array.prototype.forEach.call(row, function (ch, i) {
        if (col[ch]) out += '<rect x="' + (x + i * cell) + '" y="' + (y + j * cell) + '" width="' + cell + '" height="' + cell + '" fill="' + col[ch] + '"' + (ch === "f" ? ' class="flag"' : "") + "/>";
      });
    });
    return out;
  }

  // ===================== home: the world map =====================
  // kingdoms on the same layout as the metro draft (units), roads between kingdoms of one family
  var K = {
    is: [1, 1, "b"], nb: [4, 1, "t"], sv: [7, 1, "t"], da: [8, 2, "r"], de: [8, 5, "l"], nl: [7, 6, "b"], en: [4, 6, "t"],
    fi: [10, 1, "t"], et: [12, 1, "t"], hu: [13, 7, "r"], lv: [10, 3, "l"], lt: [10, 4, "l"],
    ru: [19, 2, "t"], uk: [17, 4, "b"], pl: [12, 4, "t"], cs: [11, 5, "l"], sk: [12, 6, "l"], sl: [12, 8, "r"], sh: [13, 9, "b"], bg: [16, 9, "t"],
    pt: [1, 10, "b"], es: [3, 10, "b"], ca: [5, 10, "b"], fr: [7, 8, "l"], it: [10, 8, "t"], ro: [17, 10, "b"],
    sq: [13, 11, "b"], el: [15, 11, "t"], fa: [20, 12, "b"], mt: [10, 11, "l"], he: [15, 13, "b"], ar: [18, 13, "b"], tr: [19, 11, "t"]
  };
  var ROADS = {
    germanic: ["is", "nb", "sv", "da", "de", "nl", "en"], uralic: ["fi", "et", [13, 2], "hu"], baltic: ["lv", "lt"],
    slavic: ["ru", "uk", "pl", "cs", "sk", "sl", "sh", "bg"], romance: ["pt", "es", "ca", "fr", "it", [12, 10], "ro"],
    other: ["sq", "el", [16, 12], "fa"], semitic: ["mt", [12, 13], "he", "ar"], turkic: ["tr"]
  };
  var CELL = 8, PER = 6; // one unit = 6 cells of 8
  function home() {
    B.langs().then(function (L) {
      var GW = 21 * PER + 6, GH = 14 * PER + 6, land = {}, road = {};
      function key(i, j) { return i + "," + j; }
      function cellOf(p) { var q = typeof p === "string" ? K[p] : p; return [q[0] * PER + 3, q[1] * PER + 3]; }
      // land around every kingdom and every road
      Object.keys(K).forEach(function (c) {
        var q = cellOf(c);
        for (var j = -9; j <= 9; j++) for (var i = -9; i <= 9; i++) {
          var r = Math.sqrt(i * i + j * j) + (hash(c + i + "," + j) - 0.5) * 3;
          if (r < 7.2) land[key(q[0] + i, q[1] + j)] = 1;
        }
      });
      Object.keys(ROADS).forEach(function (f) {
        var pts = ROADS[f].map(cellOf);
        for (var k = 1; k < pts.length; k++) {
          var a = pts[k - 1], b = pts[k], n = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]));
          for (var s = 0; s <= n; s++) {
            var x = Math.round(a[0] + (b[0] - a[0]) * s / n), y = Math.round(a[1] + (b[1] - a[1]) * s / n);
            if (s % 2 === 0) road[key(x, y)] = 1;
            for (var dj = -2; dj <= 2; dj++) for (var di = -2; di <= 2; di++) land[key(x + di, y + dj)] = 1;
          }
        }
      });
      var svg = '<rect width="' + GW * CELL + '" height="' + GH * CELL + '" fill="' + P[1] + '"/>';
      for (var j = 0; j < GH; j++) for (var i = 0; i < GW; i++) {
        var k2 = key(i, j), x = i * CELL, y = j * CELL, h = hash("t" + k2);
        if (land[k2]) {
          var coast = !land[key(i + 1, j)] || !land[key(i - 1, j)] || !land[key(i, j + 1)] || !land[key(i, j - 1)];
          var col = coast ? P[15] : road[k2] ? P[15] : h < 0.07 ? P[11] : h < 0.11 ? P[4] : h < 0.13 ? P[5] : P[3];
          if (road[k2]) col = P[7];
          svg += '<rect x="' + x + '" y="' + y + '" width="' + CELL + '" height="' + CELL + '" fill="' + col + '"/>';
        } else if (h < 0.035) {
          svg += '<rect x="' + x + '" y="' + y + '" width="' + (CELL * 2) + '" height="' + (CELL / 2) + '" fill="' + P[12] + '"/>';
        }
      }
      Object.keys(K).forEach(function (c) {
        var l = L.by[c], q = cellOf(c), cx = q[0] * CELL + CELL / 2, cy = q[1] * CELL + CELL / 2, side = K[c][2];
        var name = l.name, w = Array.from(name).length * 10 + 12, tx, ty;
        if (side === "t") { tx = cx - w / 2; ty = cy - 52; } else if (side === "b") { tx = cx - w / 2; ty = cy + 26; }
        else if (side === "r") { tx = cx + 26; ty = cy - 13; } else { tx = cx - 26 - w; ty = cy - 13; }
        svg += '<a class="k" href="' + B.langUrl(c) + '"><title>' + B.esc(name + ": " + B.n(l.took) + " words taken, " + B.n(l.gave) + " given") + "</title>" +
          sprite(cx - 20, cy - 22, 8, FC[l.fam]) +
          '<rect x="' + tx + '" y="' + ty + '" width="' + w + '" height="26" fill="' + P[0] + '"/>' +
          '<text x="' + (tx + w / 2) + '" y="' + (ty + 20) + '" text-anchor="middle" font-size="24" fill="' + P[7] + '">' + B.esc(name) + "</text></a>";
      });
      el("world").innerHTML = '<svg viewBox="0 0 ' + GW * CELL + " " + GH * CELL + '" role="img" aria-label="World map of the 33 language kingdoms">' + svg + "</svg>";
      el("legend").innerHTML = B.FAMILIES.filter(function (f) { return f.id !== "world"; }).map(function (f) { return '<li><i style="--c:' + FC[f.id] + '"></i>' + B.esc(f.name) + "</li>"; }).join("");
      el("loading").hidden = true; el("app").hidden = false;
      ready();
    }).catch(fail);
  }

  // ===================== language: the kingdom screen =====================
  var LIMIT = 12, SEG = 20;
  function bar(v, max, color) {
    var on = Math.max(1, Math.round(SEG * v / max)), s = "";
    for (var i = 0; i < SEG; i++) s += "<i" + (i < on ? ' class="on"' : "") + "></i>";
    return '<span class="bar" style="--bc:' + color + '">' + s + "</span>";
  }
  function language() {
    var code = B.param("code") || "it";
    B.language(code).then(function (d) {
      var l = d.lang, L = d.L;
      document.title = l.name + " — kingdom — lexodus (pixel draft)";
      el("stats").style.setProperty("--c", FC[l.fam]);
      el("kname").textContent = l.name.toUpperCase();
      el("sprite").innerHTML = '<svg viewBox="0 0 40 40" class="sprite" aria-hidden="true" shape-rendering="crispEdges">' + sprite(0, 0, 8, FC[l.fam]) + "</svg>";
      var rows = l.target ? [["CLAN", (B.FAM_BY_ID[l.fam] || {}).name], ["XP (entries)", B.n(l.lemmas)], ["ETYMOLOGY", Math.round(l.pct) + "%"],
        ["TAKEN", B.n(l.took)], ["GIVEN", B.n(l.gave)], ["ALLIES IN", d.from.length], ["ALLIES OUT", d.to.length], ["MAP", l.coverage]]
        : [["CLAN", (B.FAM_BY_ID[l.fam] || {}).name], ["GIVEN", B.n(d.toTotal)], ["ALLIES OUT", d.to.length]];
      el("dl").innerHTML = rows.map(function (r) { return "<dt>" + r[0] + "</dt><dd>" + B.esc(r[1]) + "</dd>"; }).join("");
      el("jump").innerHTML = '<option value="">WARP TO…</option>' + L.list.slice().sort(function (a, b) { return a.name.localeCompare(b.name); })
        .map(function (t) { return '<option value="' + t.code + '"' + (t.code === code ? " selected" : "") + ">" + B.esc(t.name) + "</option>"; }).join("");
      el("jump").onchange = function () { if (this.value) location.href = B.langUrl(this.value); };
      function meter(s, list, total) {
        var max = list.length ? list[0].n : 1;
        el(s + "-sum").textContent = B.n(total) + " words · " + list.length + " kingdoms";
        function html(k) {
          return list.slice(0, k).map(function (r) {
            var ex = r.ex.slice(0, 5).map(function (w) {
              var href = s === "from" ? B.wordUrl(code, w, 1, r.code) : B.wordUrl(r.code, w, 1, code);
              return '<a href="' + B.esc(href) + '">' + B.esc(w) + "</a>";
            }).join(" · ");
            return '<li><div class="top"><a href="' + B.langUrl(r.code) + '" style="--fc:' + FC[r.fam] + '">' + B.esc(r.name) + '</a><span class="num">' + B.n(r.n) + "</span></div>" +
              bar(r.n, max, s === "from" ? P[11] : P[9]) + '<div class="ex">' + ex + "</div></li>";
          }).join("");
        }
        el(s + "-list").innerHTML = html(LIMIT);
        var b = el(s + "-more");
        b.hidden = list.length <= LIMIT;
        b.textContent = "SHOW ALL " + list.length;
        b.onclick = function () { el(s + "-list").innerHTML = html(list.length); b.hidden = true; };
      }
      el("from-col").hidden = !l.target;
      if (l.target) meter("from", d.from, d.fromTotal);
      meter("to", d.to, d.toTotal);
      el("loading").hidden = true; el("app").hidden = false;
      ready();
    }).catch(fail);
  }

  // ===================== word: the item card =====================
  var RARITY = [[5, "LEGENDARY", P[9]], [4, "EPIC", P[14]], [3, "RARE", P[12]], [2, "UNCOMMON", P[11]], [0, "COMMON", P[6]]];
  function word() {
    var lang = B.param("lang") || "it", w = B.param("w") || "caffè", ne = +B.param("n") || 1, from = B.param("from") || "";
    B.word(lang, w, ne, from).then(function (r) {
      var L = r.L, p = r.p;
      if (!p) {
        el("loading").innerHTML = "ITEM NOT FOUND: “" + B.esc(w) + "”. <a href=\"" + B.wiktUrl(w, B.nameOf(L, lang)) + "\">Wiktionary</a>";
        return ready();
      }
      var stops = B.journey(L, lang, p), rar = RARITY.filter(function (x) { return stops.length >= x[0]; })[0];
      var giu = r.tree && r.tree.e ? r.tree.e.giu || [] : [];
      document.title = p.parola + " — item — lexodus (pixel draft)";
      el("name").textContent = p.parola.toUpperCase();
      el("rar").textContent = rar[1];
      el("rar").style.setProperty("--rc", rar[2]);
      el("desc").textContent = p.significato ? "“" + p.significato + "”" : "No description.";
      el("dl").innerHTML = [["TYPE", p.pos || "—"], ["KINGDOM", B.nameOf(L, lang)], ["ORIGIN", stops.length > 1 ? stops[0].name : "unknown"],
        ["LEVELS", stops.length], ["OBTAINED", B.CATS[p.categoria] || "—"], ["UNLOCKS", B.count(giu) + " words"]]
        .map(function (x) { return "<dt>" + x[0] + "</dt><dd>" + B.esc(x[1]) + "</dd>"; }).join("") +
        '<dt>LORE</dt><dd>' + B.esc(r.text || "—") + (r.text && r.text.length >= 300 ? "…" : "") + ' <a href="' + B.wiktUrl(p.parola, B.nameOf(L, lang)) + '">wiki</a></dd>';
      el("levels").innerHTML = stops.map(function (s, i) {
        return (i ? '<li class="step" aria-hidden="true"><span></span><span>' + B.esc(stops[i - 1].how || "") + "</span></li>" : "") +
          '<li class="' + (s.here ? "here" : "") + '" style="--fc:' + FC[s.fam] + '"><span class="lv">LV' + (i + 1) + '</span><span class="what"><a href="' + B.langUrl(s.code) + '">' + B.esc(s.name) + "</a> <b>" + B.esc(s.term || "—") + "</b>" +
          (s.tr && s.tr !== s.term ? "<small>" + B.esc(s.tr) + "</small>" : "") + "</span></li>";
      }).join("");
      el("tree").href = B.treeUrl(lang, p.parola, p.n_etimologia);
      var flat = [];
      (function walk(list, parent) { list.forEach(function (g) { flat.push({ g: g, parent: parent }); walk(g.giu || [], g.lingua); }); })(giu, lang);
      el("chips").innerHTML = flat.slice(0, 30).map(function (x) {
        var g = x.g;
        return '<li><a style="--fc:' + FC[B.family(g.lingua)] + '" href="' + B.esc(B.wordUrl(g.lingua, g.parola, g.n_etimologia, x.parent)) + '">' + B.esc(g.parola) + " <small>" + B.esc(g.lingua.toUpperCase()) + "</small></a></li>";
      }).join("") || "<li>Nothing unlocked: no word of the 33 languages took it.</li>";
      el("loading").hidden = true; el("app").hidden = false;
      ready();
    }).catch(fail);
  }

  // ===================== tree: the skill tree =====================
  function tree() {
    var lang = B.param("lang") || "it", w = B.param("w") || "caffè", ne = +B.param("n") || 1;
    Promise.all([B.langs(), B.tree(lang, w, ne)]).then(function (res) {
      var L = res[0], t = res[1];
      if (!t) { el("loading").textContent = "NO SKILL TREE FOR " + w.toUpperCase(); return ready(); }
      var e = t.e, word = t.key.slice(0, t.key.lastIndexOf("|"));
      document.title = word + " — skill tree — lexodus (pixel draft)";
      el("w").textContent = word.toUpperCase();
      el("item-link").href = B.wordUrl(lang, word, t.n, e.su && e.su[0] ? e.su[0].codice : "");
      var su = e.su || [], root = null, cur = null;
      for (var i = su.length - 1; i >= 0; i--) {
        var n = { code: su[i].codice, word: su[i].termine, kids: [] };
        if (cur) cur.kids.push(n); else root = n;
        cur = n;
      }
      function conv(g, parent) { return { code: g.lingua, word: g.parola, ne: g.n_etimologia, parent: parent, kids: (g.giu || []).map(function (k) { return conv(k, g.lingua); }) }; }
      var me = { code: lang, word: word, here: true, kids: (e.giu || []).map(function (g) { return conv(g, lang); }) };
      if (cur) cur.kids.push(me); else root = me;
      var CW = 200, RH = 64, BW = 160, BH = 50, row = 0, maxD = 0;
      (function place(n, d) {
        n.d = d; maxD = Math.max(maxD, d);
        if (!n.kids.length) { n.row = row++; return; }
        n.kids.forEach(function (k) { place(k, d + 1); });
        n.row = Math.round((n.kids[0].row + n.kids[n.kids.length - 1].row) / 2);
      })(root, 0);
      var W = 20 + (maxD + 1) * CW, H = 20 + row * RH, lines = "", boxes = "";
      function xy(n) { return [10 + n.d * CW, 10 + n.row * RH]; }
      (function draw(n) {
        var p = xy(n);
        n.kids.forEach(function (k) {
          var c = xy(k), mx = p[0] + BW + (CW - BW) / 2, y1 = p[1] + BH / 2, y2 = c[1] + BH / 2;
          lines += '<rect x="' + (p[0] + BW) + '" y="' + (y1 - 2) + '" width="' + (mx - p[0] - BW + 2) + '" height="4" fill="' + P[7] + '"/>' +
            '<rect x="' + (mx - 2) + '" y="' + (Math.min(y1, y2) - 2) + '" width="4" height="' + (Math.abs(y2 - y1) + 4) + '" fill="' + P[7] + '"/>' +
            '<rect x="' + mx + '" y="' + (y2 - 2) + '" width="' + (c[0] - mx) + '" height="4" fill="' + P[7] + '"/>';
          draw(k);
        });
        var fc = FC[B.family(n.code)], target = L.targets.indexOf(n.code) >= 0;
        var href = n.here ? "" : target && n.word ? B.wordUrl(n.code, n.word, n.ne || 1, n.parent || "") : B.langUrl(n.code);
        boxes += (href ? '<a href="' + B.esc(href) + '">' : "") + "<title>" + B.esc(B.nameOf(L, n.code) + " " + (n.word || "")) + "</title>" +
          '<rect x="' + p[0] + '" y="' + p[1] + '" width="' + BW + '" height="' + BH + '" fill="' + (n.here ? P[2] : P[0]) + '" stroke="' + (n.here ? P[10] : fc) + '" stroke-width="4"/>' +
          '<rect x="' + (p[0] + 4) + '" y="' + (p[1] + 4) + '" width="10" height="' + (BH - 8) + '" fill="' + fc + '"/>' +
          '<text x="' + (p[0] + 20) + '" y="' + (p[1] + 20) + '" font-size="18" fill="' + P[6] + '">' + B.esc(cut(B.nameOf(L, n.code), 16)) + "</text>" +
          '<text x="' + (p[0] + 20) + '" y="' + (p[1] + 41) + '" font-size="23" fill="' + (n.here ? P[10] : P[7]) + '">' + B.esc(cut(n.word || "—", 14)) + "</text>" + (href ? "</a>" : "");
      })(root);
      el("skill").innerHTML = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Skill tree of the word">' + lines + boxes + "</svg>";
      el("sum").textContent = su.length + " levels before, " + B.count(e.giu) + " skills unlocked after. Each box opens that word.";
      el("loading").hidden = true; el("app").hidden = false;
      ready();
    }).catch(fail);
  }

  if (page === "home") home();
  else if (page === "language") language();
  else if (page === "word") word();
  else tree();
})();
