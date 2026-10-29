/* lexodus, draft "metro": home (network map), language (station panels), word (line diagram), tree (network of one
   word). Every drawing is SVG built here by hand: straight lines and 45-degree bends, no library. */
(function () {
  "use strict";
  var B = window.B;
  function el(id) { return document.getElementById(id); }
  var page = document.body.dataset.page;
  var COLOR = { romance: "#dc241f", germanic: "#0019a8", slavic: "#00782a", baltic: "#f2c200", uralic: "#9b0056",
    semitic: "#b36305", turkic: "#e86a9a", other: "#00a4a7", world: "#868f98" };
  var DARK_TEXT = { baltic: 1, turkic: 1 };
  function lineName(f) { return (B.FAM_BY_ID[f] || B.FAM_BY_ID.world).name + " line"; }
  function fail(e) { el("loading").textContent = "The data could not be loaded (" + e.message + ")."; console.error(e); }
  function ready() { document.body.dataset.ready = "1"; }
  function cut(s, k) { s = String(s || ""); return Array.from(s).length > k ? Array.from(s).slice(0, k - 1).join("") + "…" : s; }

  // ===================== home: the network map =====================
  // grid units (x, y) and where the name goes (r, l, t, b); lines: families, as lists of points (stations or bends)
  var U = 56;
  var ST = {
    is: [1, 1, "b"], nb: [4, 1, "t"], sv: [7, 1, "t"], da: [8, 2, "r"], de: [8, 5, "r"], nl: [7, 6, "b"], en: [4, 6, "t"],
    fi: [10, 1, "t"], et: [12, 1, "t"], hu: [13, 7, "r"],
    lv: [10, 3, "l"], lt: [10, 4, "l"],
    ru: [19, 2, "t"], uk: [17, 4, "b"], pl: [12, 4, "t"], cs: [11, 5, "l"], sk: [12, 6, "l"], sl: [12, 8, "l"], sh: [13, 9, "b"], bg: [16, 9, "t"],
    pt: [1, 10, "b"], es: [3, 10, "b"], ca: [5, 10, "b"], fr: [7, 8, "l"], it: [10, 8, "t"], ro: [17, 10, "b"],
    sq: [13, 11, "b"], el: [15, 11, "t"], fa: [20, 12, "b"],
    mt: [10, 11, "l"], he: [15, 13, "b"], ar: [18, 13, "b"],
    tr: [19, 11, "t"]
  };
  var LINES = {
    germanic: ["is", "nb", "sv", "da", "de", "nl", "en"],
    uralic: ["fi", "et", [13, 2], "hu"],
    baltic: ["lv", "lt"],
    slavic: ["ru", "uk", "pl", "cs", "sk", "sl", "sh", "bg"],
    romance: ["pt", "es", "ca", "fr", "it", [12, 10], "ro"],
    other: ["sq", "el", [16, 12], "fa"],
    semitic: ["mt", [12, 13], "he", "ar"],
    turkic: [[18, 11], "tr", [20, 11]]
  };
  function pt(p) { var q = typeof p === "string" ? ST[p] : p; return [q[0] * U, q[1] * U]; }
  function home() {
    B.langs().then(function (L) {
      var W = 21 * U, H = 14 * U, svg = "";
      Object.keys(LINES).forEach(function (f) {
        var d = LINES[f].map(function (p, i) { var q = pt(p); return (i ? "L" : "M") + q[0] + " " + q[1]; }).join(" ");
        svg += '<path d="' + d + '" fill="none" stroke="' + COLOR[f] + '" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"/>';
      });
      Object.keys(ST).forEach(function (c) {
        var l = L.by[c], q = pt(c), side = ST[c][2], x = q[0], y = q[1], a = "middle";
        if (side === "r") { x += 18; y += 6; a = "start"; } else if (side === "l") { x -= 18; y += 6; a = "end"; }
        else if (side === "t") y -= 18; else y += 32;
        svg += '<a href="' + B.langUrl(c) + '"><title>' + B.esc(l.name + ": " + B.n(l.took) + " words taken, " + B.n(l.gave) + " given") + "</title>" +
          '<circle class="st" cx="' + q[0] + '" cy="' + q[1] + '" r="11" fill="#fff" stroke="#10131a" stroke-width="5"/>' +
          '<text x="' + x + '" y="' + y + '" text-anchor="' + a + '" font-size="19" font-weight="500" fill="#0b2a6f" paint-order="stroke" stroke="#fff" stroke-width="5">' + B.esc(l.name) + "</text></a>";
      });
      el("map").innerHTML = '<svg class="map" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Map of the 33 languages as stations on lines by family">' + svg + "</svg>";
      el("key").innerHTML = Object.keys(LINES).map(function (f) { return '<li><i style="--c:' + COLOR[f] + '"></i>' + lineName(f) + "</li>"; }).join("");
      el("loading").hidden = true; el("app").hidden = false;
      ready();
    }).catch(fail);
  }

  // ===================== language: the station =====================
  var LIMIT = 14;
  function language() {
    var code = B.param("code") || "it";
    B.language(code).then(function (d) {
      var l = d.lang, L = d.L;
      document.title = l.name + " — station — lexodus (metro draft)";
      el("plate").innerHTML = '<i style="--c:' + COLOR[l.fam] + '"></i><b>' + B.esc(l.name) + "</b>";
      el("facts").innerHTML = "<b>" + B.esc(lineName(l.fam)) + "</b>. " + (l.target
        ? B.n(l.lemmas) + " entries in English Wiktionary, " + Math.round(l.pct) + "% with an etymology. Numbers are a snapshot of Wiktionary, not of the whole vocabulary."
        : "Not one of the 33 languages read here: only departures are known.");
      el("jump").innerHTML = '<option value="">Go to another station…</option>' + L.list.slice().sort(function (a, b) { return a.name.localeCompare(b.name); })
        .map(function (t) { return '<option value="' + t.code + '"' + (t.code === code ? " selected" : "") + ">" + B.esc(t.name) + "</option>"; }).join("");
      el("jump").onchange = function () { if (this.value) location.href = B.langUrl(this.value); };
      function board(side, rows, total) {
        el(side + "-sum").textContent = B.n(total) + " words";
        function html(k) {
          return rows.slice(0, k).map(function (r) {
            var ex = r.ex.slice(0, 5).map(function (w) {
              var href = side === "from" ? B.wordUrl(code, w, 1, r.code) : B.wordUrl(r.code, w, 1, code);
              return '<a href="' + B.esc(href) + '">' + B.esc(w) + "</a>";
            }).join(", ");
            return '<li style="--c:' + COLOR[r.fam] + '"><span><a class="dest" href="' + B.langUrl(r.code) + '">' + (side === "from" ? "from " : "to ") + B.esc(r.name) + '</a> <span class="line">' + B.esc(lineName(r.fam)) + '</span></span><span class="cnt">' + B.n(r.n) + '</span><span class="ex">calling at: ' + ex + "</span></li>";
          }).join("");
        }
        el(side + "-list").innerHTML = html(LIMIT);
        var b = el(side + "-more");
        b.hidden = rows.length <= LIMIT;
        b.textContent = "All " + rows.length + (side === "from" ? " arrivals" : " departures");
        b.onclick = function () { el(side + "-list").innerHTML = html(rows.length); b.hidden = true; };
      }
      el("from-panel").hidden = !l.target;
      if (l.target) board("from", d.from, d.fromTotal);
      board("to", d.to, d.toTotal);
      el("loading").hidden = true; el("app").hidden = false;
      ready();
    }).catch(fail);
  }

  // ===================== word: the line diagram =====================
  function strip(stops) {
    var gap = 270, x0 = 110, W = x0 * 2 + gap * (stops.length - 1), y = 96, svg = "";
    for (var i = 1; i < stops.length; i++) {
      var f = stops[i].fam, xa = x0 + gap * (i - 1), xb = x0 + gap * i;
      svg += '<line x1="' + xa + '" y1="' + y + '" x2="' + xb + '" y2="' + y + '" stroke="' + COLOR[f] + '" stroke-width="14"/>' +
        '<text x="' + ((xa + xb) / 2) + '" y="' + (y + 40) + '" text-anchor="middle" font-size="16" fill="#4a5160" font-style="italic">' + B.esc(stops[i - 1].how || "") + "</text>";
    }
    stops.forEach(function (s, i) {
      var x = x0 + gap * i, change = i > 0 && i < stops.length - 1 && stops[i].fam !== stops[i + 1].fam;
      var r = s.here ? 17 : change ? 15 : 12;
      svg += '<a href="' + B.langUrl(s.code) + '"><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#fff" stroke="' + (change || s.here ? "#10131a" : COLOR[s.fam]) + '" stroke-width="' + (change ? 7 : 6) + '"/>' +
        '<text x="' + x + '" y="' + (y - 34) + '" text-anchor="middle" font-size="20" font-weight="600" fill="#10131a">' + B.esc(s.name) + "</text></a>" +
        '<text x="' + x + '" y="' + (y + 74) + '" text-anchor="middle" font-size="' + (s.here ? 28 : 24) + '" font-weight="' + (s.here ? 600 : 400) + '" fill="#10131a">' + B.esc(s.term || "—") + "</text>" +
        (s.tr && s.tr !== s.term ? '<text x="' + x + '" y="' + (y + 100) + '" text-anchor="middle" font-size="18" font-style="italic" fill="#4a5160">' + B.esc(s.tr) + "</text>" : "") +
        (change ? '<text x="' + x + '" y="' + (y - 60) + '" text-anchor="middle" font-size="15" font-weight="600" fill="#10131a">CHANGE</text>' : "") +
        (i === 0 ? '<text x="' + x + '" y="' + (y - 60) + '" text-anchor="middle" font-size="15" font-weight="600" fill="#4a5160">START</text>' : "") +
        (s.here ? '<text x="' + x + '" y="' + (y - 60) + '" text-anchor="middle" font-size="15" font-weight="600" fill="#dc241f">YOU ARE HERE</text>' : "");
    });
    return '<svg viewBox="0 0 ' + W + ' 215" role="img" aria-label="The way of the word, station by station">' + svg + "</svg>";
  }

  // on a phone the line runs down the screen, names on the right
  function stripV(stops) {
    var gap = 150, y0 = 40, x = 34, H = y0 * 2 + gap * (stops.length - 1), svg = "";
    for (var i = 1; i < stops.length; i++) {
      var ya = y0 + gap * (i - 1), yb = y0 + gap * i;
      svg += '<line x1="' + x + '" y1="' + ya + '" x2="' + x + '" y2="' + yb + '" stroke="' + COLOR[stops[i].fam] + '" stroke-width="12"/>' +
        '<text x="' + (x + 30) + '" y="' + ((ya + yb) / 2 + 18) + '" font-size="15" fill="#4a5160" font-style="italic">' + B.esc(stops[i - 1].how || "") + " ↓</text>";
    }
    stops.forEach(function (s, i) {
      var y = y0 + gap * i, change = i > 0 && i < stops.length - 1 && stops[i].fam !== stops[i + 1].fam;
      var tag = i === 0 ? "START · " : change ? "CHANGE · " : s.here ? "YOU ARE HERE · " : "";
      svg += '<circle cx="' + x + '" cy="' + y + '" r="' + (s.here ? 15 : 12) + '" fill="#fff" stroke="' + (change || s.here ? "#10131a" : COLOR[s.fam]) + '" stroke-width="6"/>' +
        '<a href="' + B.langUrl(s.code) + '"><text x="' + (x + 30) + '" y="' + (y - 4) + '" font-size="17" font-weight="600" fill="#10131a">' + tag + B.esc(s.name) + "</text></a>" +
        '<text x="' + (x + 30) + '" y="' + (y + 24) + '" font-size="' + (s.here ? 24 : 21) + '" font-weight="' + (s.here ? 600 : 400) + '" fill="#10131a">' + B.esc(s.term || "—") +
        (s.tr && s.tr !== s.term ? ' <tspan font-size="17" font-style="italic" fill="#4a5160">' + B.esc(s.tr) + "</tspan>" : "") + "</text>";
    });
    return '<svg viewBox="0 0 330 ' + H + '" style="min-width:0" role="img" aria-label="The way of the word, station by station">' + svg + "</svg>";
  }
  function word() {
    var lang = B.param("lang") || "it", w = B.param("w") || "caffè", ne = +B.param("n") || 1, from = B.param("from") || "";
    B.word(lang, w, ne, from).then(function (r) {
      var L = r.L, p = r.p;
      if (!p) {
        el("loading").innerHTML = "No journey found for “" + B.esc(w) + "”. <a href=\"" + B.wiktUrl(w, B.nameOf(L, lang)) + "\">Wiktionary</a>.";
        return ready();
      }
      var stops = B.journey(L, lang, p);
      document.title = p.parola + " — line diagram — lexodus (metro draft)";
      el("w").textContent = p.parola;
      var changes = 0;
      for (var i = 1; i < stops.length - 1; i++) if (stops[i].fam !== stops[i + 1].fam) changes++;
      el("meta").innerHTML = '<a href="' + B.langUrl(lang) + '">' + B.esc(B.nameOf(L, lang)) + "</a>" + (p.pos ? " · " + B.esc(p.pos) : "") +
        (p.significato ? " · “" + B.esc(p.significato) + "”" : "") + " · " + stops.length + " stations, " + changes + (changes === 1 ? " change" : " changes");
      el("strip").innerHTML = window.innerWidth < 600 ? stripV(stops) : strip(stops);
      el("ety").textContent = (r.text || "No etymology text.") + (r.text && r.text.length >= 300 ? "…" : "");
      el("wikt").href = B.wiktUrl(p.parola, B.nameOf(L, lang));
      el("tree").href = B.treeUrl(lang, p.parola, p.n_etimologia);
      var giu = r.tree && r.tree.e ? r.tree.e.giu || [] : [];
      el("conn").innerHTML = giu.length ? giu.map(function (g) {
        var f = B.family(g.lingua);
        return '<li><span class="bullet' + (DARK_TEXT[f] ? " dark" : "") + '" style="--c:' + COLOR[f] + '">' + B.esc(g.lingua.toUpperCase()) + "</span>" +
          '<a href="' + B.esc(B.wordUrl(g.lingua, g.parola, g.n_etimologia, lang)) + '">' + B.esc(g.parola) + "</a>" + B.trSpan(g.traslitterazione, g.parola, "note") +
          ' <span class="note">' + B.esc(B.nameOf(L, g.lingua)) + ", " + B.esc(B.CATS[g.categoria] || "") + ((g.giu || []).length ? ", then " + B.count(g.giu) + " more" : "") + "</span></li>";
      }).join("") : '<li class="note">No connections: no word of the 33 languages took it, as far as Wiktionary says.</li>';
      el("conn-sum").textContent = giu.length ? B.count(giu) + " words further down the line, " + giu.length + " taken directly." : "";
      el("loading").hidden = true; el("app").hidden = false;
      ready();
    }).catch(fail);
  }

  // ===================== tree: the network of one word =====================
  function tree() {
    var lang = B.param("lang") || "it", w = B.param("w") || "caffè", ne = +B.param("n") || 1;
    Promise.all([B.langs(), B.tree(lang, w, ne)]).then(function (res) {
      var L = res[0], t = res[1];
      if (!t) {
        el("loading").innerHTML = "No network for “" + B.esc(w) + "”. <a href=\"" + B.wiktUrl(w, B.nameOf(L, lang)) + "\">Wiktionary</a>.";
        return ready();
      }
      var e = t.e, word = t.key.slice(0, t.key.lastIndexOf("|"));
      document.title = word + " — network — lexodus (metro draft)";
      el("w").textContent = word;
      el("word-link").href = B.wordUrl(lang, word, t.n, e.su && e.su[0] ? e.su[0].codice : "");
      // one tree: the chain from the furthest origin down to the word, then the words that took it
      var su = e.su || [], root = null, cur = null;
      for (var i = su.length - 1; i >= 0; i--) {
        var n = { code: su[i].codice, word: su[i].termine, tr: su[i].traslitterazione, kids: [] };
        if (cur) cur.kids.push(n); else root = n;
        cur = n;
      }
      function conv(g, parent) { var n = { code: g.lingua, word: g.parola, tr: g.traslitterazione, ne: g.n_etimologia, parent: parent, how: B.CATS[g.categoria], kids: [] }; n.kids = (g.giu || []).map(function (k) { return conv(k, g.lingua); }); return n; }
      var me = { code: lang, word: word, tr: e.traslitterazione, here: true, kids: (e.giu || []).map(function (g) { return conv(g, lang); }) };
      if (cur) cur.kids.push(me); else root = me;
      // layout: depth on x, leaves on y; a node sits on the row of its first child, so the trunk stays straight
      var CW = 215, RH = 64, X0 = 30, Y0 = 60, row = 0, maxD = 0;
      (function place(n, d) {
        n.d = d; maxD = Math.max(maxD, d); n.fam = B.family(n.code);
        if (!n.kids.length) { n.row = row++; return; }
        n.kids.forEach(function (k) { place(k, d + 1); });
        n.row = n.kids[0].row;
      })(root, 0);
      var W = X0 * 2 + maxD * CW + 190, H = Y0 + row * RH + 10, lines = "", dots = "";
      function xy(n) { return [X0 + n.d * CW, Y0 + n.row * RH]; }
      (function draw(n) {
        var p = xy(n);
        n.kids.forEach(function (k) {
          var c = xy(k), dy = c[1] - p[1], jx = c[0] - 48, b = Math.min(16, Math.abs(dy) / 2), s = dy > 0 ? 1 : -1;
          var d = dy === 0 ? "M" + p[0] + " " + p[1] + " H" + c[0]
            : "M" + p[0] + " " + p[1] + " H" + jx + " L" + (jx + b) + " " + (p[1] + s * b) + " V" + (c[1] - s * b) + " L" + (jx + 2 * b) + " " + c[1] + " H" + c[0];
          lines = '<path d="' + d + '" fill="none" stroke="' + COLOR[k.fam] + '" stroke-width="8" stroke-linejoin="round"/>' + lines;
          draw(k);
        });
        var change = n.kids.some(function (k) { return k.fam !== n.fam; }) && n.d > 0;
        var name = B.nameOf(L, n.code), target = L.targets.indexOf(n.code) >= 0;
        var href = n.here ? "" : target && n.word ? B.wordUrl(n.code, n.word, n.ne || 1, n.parent || "") : B.langUrl(n.code);
        dots += (href ? '<a href="' + B.esc(href) + '">' : "") + "<title>" + B.esc(name + " " + (n.word || "") + (n.how ? ", " + n.how : "")) + "</title>" +
          '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (n.here ? 13 : 9) + '" fill="#fff" stroke="' + (change || n.here ? "#10131a" : COLOR[n.fam]) + '" stroke-width="' + (change || n.here ? 6 : 5) + '"/>' +
          '<text x="' + (p[0] + 4) + '" y="' + (p[1] - 30) + '" font-size="15" fill="#4a5160">' + B.esc(cut(name, 20)) + "</text>" +
          '<text x="' + (p[0] + 4) + '" y="' + (p[1] - 13) + '" font-size="' + (n.here ? 20 : 17) + '" font-weight="' + (n.here ? 600 : 500) + '" fill="#10131a">' + B.esc(cut(n.word || "—", 17)) + "</text>" + (href ? "</a>" : "");
      })(root);
      el("net").innerHTML = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Network of the word">' + lines + dots + "</svg>";
      el("net-sum").textContent = (su.length ? su.length + " stations before " + word + ", " : "") + B.count(e.giu) + " words after it. Line colour = family of the language the word reaches; a black ring = change of line.";
      el("loading").hidden = true; el("app").hidden = false;
      ready();
    }).catch(fail);
  }

  if (page === "home") home();
  else if (page === "language") language();
  else if (page === "word") word();
  else tree();
})();
