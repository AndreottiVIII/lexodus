/* lexodus, draft "babele" (after Borges's Library of Babel): home (a honeycomb of 33 hexagonal halls), language (a
   hall with two walls of books, spines as tall as the number of words), word (an open volume with its shelfmarks),
   tree (the copies of a volume, hall to hall). */
(function () {
  "use strict";
  var B = window.B;
  function el(id) { return document.getElementById(id); }
  var page = document.body.dataset.page;
  // leather by family
  var LEATHER = { romance: "#74221b", germanic: "#1f4430", slavic: "#22335f", baltic: "#5a4318", uralic: "#45305a",
    semitic: "#6a4513", turkic: "#1d4a50", other: "#62233f", world: "#3b3631" };
  var FAM_ORDER = ["romance", "germanic", "slavic", "baltic", "uralic", "semitic", "turkic", "other"];
  function leather(code) { return LEATHER[B.family(code)] || LEATHER.world; }
  function famName(f) { return (B.FAM_BY_ID[f] || B.FAM_BY_ID.world).name; }
  function fail(e) { el("loading").textContent = "The lamp went out: the data could not be loaded (" + e.message + ")."; console.error(e); }
  function ready() { document.body.dataset.ready = "1"; }
  function show() { el("loading").hidden = true; el("app").hidden = false; }
  function halls(L) {
    var f = {};
    L.list.slice().sort(function (a, b) { return a.name.localeCompare(b.name); }).forEach(function (l, i) { f[l.code] = i + 1; });
    return f;
  }
  function term(t, tr) { return '<span class="term">' + B.esc(t || "—") + "</span>" + (tr && tr !== t ? ' <i class="tr">' + B.esc(tr) + "</i>" : ""); }

  // ===================== home: the honeycomb =====================
  function home() {
    B.langs().then(function (L) {
      var no = halls(L);
      var list = [];
      FAM_ORDER.forEach(function (f) {
        L.list.filter(function (l) { return l.fam === f; }).sort(function (a, b) { return b.lemmas - a.lemmas; }).forEach(function (l) { list.push(l); });
      });
      var hive = el("hive");
      hive.innerHTML = list.map(function (l) {
        return '<a role="listitem" class="hex" href="' + B.langUrl(l.code) + '" style="--leather:' + LEATHER[l.fam] + '"><span class="in">' +
          '<span class="no">Hall ' + no[l.code] + '</span><span class="nm">' + B.esc(l.name) + '</span><span class="tk">took ' + B.n(l.took) +
          '<br>lent ' + B.n(l.gave) + "</span></span></a>";
      }).join("");
      function lay() {
        var W = hive.clientWidth, gap = 6, w = W < 560 ? Math.min(160, Math.floor(W / 2.5 - gap)) : 176, h = Math.round(w * 1.1547);
        var cols = Math.max(2, Math.floor((W - (w + gap) / 2) / (w + gap)));
        var cells = hive.children, rows = Math.ceil(cells.length / cols);
        var used = cols * (w + gap) + (w + gap) / 2, x0 = Math.max(0, (W - used) / 2);
        for (var i = 0; i < cells.length; i++) {
          var r = Math.floor(i / cols), c = i % cols;
          cells[i].style.width = w + "px"; cells[i].style.height = h + "px";
          cells[i].style.left = (x0 + c * (w + gap) + (r % 2 ? (w + gap) / 2 : 0)) + "px";
          cells[i].style.top = (r * (h * 0.75 + gap * 0.87)) + "px";
        }
        hive.style.height = (rows - 1) * (h * 0.75 + gap * 0.87) + h + "px";
      }
      show();
      lay();
      window.addEventListener("resize", lay);
      el("legend").innerHTML = "The colour of the leather is the family: " + FAM_ORDER.map(function (f) {
        return '<span class="chip" style="--leather:' + LEATHER[f] + '"></span>' + B.esc(famName(f));
      }).join(" · ");
      ready();
    }).catch(fail);
  }

  // ===================== language: a hall with two walls of books =====================
  function spine(r, max, href, i) {
    var h = Math.round(92 + 128 * Math.log(r.n + 1) / Math.log(max + 1));
    var name = r.name.toUpperCase(), count = B.n(r.n);
    // Cinzel capitals at 15 px are about 11 px wide: if the name does not fit, the code goes on the spine
    var label = (name.length + count.length + 2) * 11 + 30 <= h ? name : B.merged(r.code).toUpperCase();
    var w = 38 + (i * 7) % 9;
    return '<a class="spine" href="' + B.esc(href) + '" title="' + B.esc(r.name + ": " + count + " words") + '" style="height:' + h + "px;width:" + w + "px;--leather:" + leather(r.code) + '">' +
      '<span class="t">' + B.esc(label) + '</span><span class="c">' + count + "</span></a>";
  }
  var ON_SHELVES = 32;
  function language() {
    var code = B.param("code") || "it";
    B.language(code).then(function (d) {
      var l = d.lang, L = d.L, no = halls(L);
      document.title = "Hall of " + l.name + " — lexodus (Library of Babel draft)";
      el("hall-name").textContent = l.name;
      el("hall-no").textContent = no[code] ? "Hexagon " + no[code] + " of 33 · " + famName(l.fam) + " gallery" : "A hall outside the thirty-three";
      var stats = l.target ? [
        ["Entries in the Wiktionary", B.n(l.lemmas)], ["With an etymology", Math.round(l.pct) + "%"],
        ["Books it took", B.n(l.took)], ["Books it lent", B.n(l.gave)],
        ["Halls it took from", B.n(d.from.length)], ["Halls that took from it", B.n(d.to.length)]
      ] : [["Books it lent", B.n(d.toTotal)], ["Halls that took from it", B.n(d.to.length)]];
      el("stats").innerHTML = stats.map(function (s) { return "<div><dt>" + s[0] + "</dt><dd>" + s[1] + "</dd></div>"; }).join("");
      el("jump").innerHTML = '<option value="">Choose a hall…</option>' + L.list.slice().sort(function (a, b) { return a.name.localeCompare(b.name); })
        .map(function (t) { return '<option value="' + t.code + '"' + (t.code === code ? " selected" : "") + ">" + no[t.code] + " · " + B.esc(t.name) + "</option>"; }).join("");
      el("jump").onchange = function () { if (this.value) location.href = B.langUrl(this.value); };
      function wall(id, rows) {
        var max = rows.length ? rows[0].n : 1;
        el(id).innerHTML = rows.slice(0, ON_SHELVES).map(function (r, i) { return '<span class="slot">' + spine(r, max, B.langUrl(r.code), i) + "</span>"; }).join("") ||
          '<p class="empty">The shelves are bare.</p>';
        var rest = rows.slice(ON_SHELVES);
        el(id + "-rest").innerHTML = rest.length ? "On the reading table, " + rest.length + " slimmer volumes: " +
          rest.map(function (r) { return '<a href="' + B.langUrl(r.code) + '">' + B.esc(r.name) + "</a> " + B.n(r.n); }).join(", ") + "." : "";
      }
      if (l.target) wall("left", d.from); else el("left").innerHTML = '<p class="empty">This hall is not among the thirty-three: its west wall is not catalogued.</p>';
      wall("right", d.to);
      function cat(id, rows, side) {
        el(id).innerHTML = rows.slice(0, 10).map(function (r, i) {
          var ex = r.ex.map(function (w) {
            var href = side === "from" ? B.wordUrl(code, w, 1, r.code) : B.wordUrl(r.code, w, 1, code);
            return '<a href="' + B.esc(href) + '"><i>' + B.esc(w) + "</i></a>";
          }).join(", ");
          return '<li><span class="mark">' + (side === "from" ? "W" : "E") + "·" + (i + 1) + '</span><span class="body"><a class="ln" href="' + B.langUrl(r.code) + '">' +
            B.esc(r.name) + '</a> <span class="cnt">' + B.n(r.n) + (r.n === 1 ? " book" : " books") + "</span><br>" + ex + "</span></li>";
        }).join("");
      }
      if (l.target) cat("cat-from", d.from, "from");
      cat("cat-to", d.to, "to");
      show(); ready();
    }).catch(fail);
  }

  // ===================== word: an open volume =====================
  function word() {
    var lang = B.param("lang") || "it", w = B.param("w") || "caffè", ne = +B.param("n") || 1, from = B.param("from") || "";
    B.word(lang, w, ne, from).then(function (r) {
      var L = r.L, p = r.p;
      if (!p) {
        el("loading").innerHTML = "No volume “" + B.esc(w) + "” on these shelves. <a href=\"" + B.wiktUrl(w, B.nameOf(L, lang)) + "\">Wiktionary</a>.";
        return ready();
      }
      var no = halls(L), stops = B.journey(L, lang, p), name = B.nameOf(L, lang);
      document.title = p.parola + " — a volume — lexodus (Library of Babel draft)";
      el("head-l").textContent = "Hall of " + name;
      el("head-r").textContent = p.parola;
      el("w").textContent = p.parola;
      el("meaning").innerHTML = (p.pos ? "<i>" + B.esc(p.pos) + "</i> · " : "") + (p.significato ? "“" + B.esc(p.significato) + "”" : "");
      // shelfmarks: hall, wall, shelf, volume, newest first (where it stands now), then back in time
      el("shelfmarks").innerHTML = stops.slice().reverse().map(function (s, i, arr) {
        var older = arr[i + 1];
        var hall = no[B.merged(s.code)] ? "Hexagon " + no[B.merged(s.code)] : "Outer hall";
        return '<li class="' + (s.here ? "here" : "") + '"><span class="sm">' + hall + " · " + B.esc(famName(s.fam)) + " wall · shelf " +
          B.esc(older ? (older.how || "taken") : "of origins") + '</span><span class="vol"><a href="' + B.langUrl(s.code) + '">' + B.esc(s.name) + "</a>, vol. " + term(s.term, s.tr) +
          (s.here ? ' <span class="youare">you are here</span>' : "") + "</span>" + (older ? '<span class="from">copied from the hall of ' + B.esc(older.name) + "</span>" : "") + "</li>";
      }).join("");
      el("ety").textContent = (r.text || "The flyleaf is blank.") + (r.text && r.text.length >= 300 ? "…" : "");
      el("wikt").href = B.wiktUrl(p.parola, name);
      el("tree-link").href = B.treeUrl(lang, p.parola, p.n_etimologia);
      var giu = r.tree && r.tree.e ? r.tree.e.giu || [] : [], items = [];
      (function walk(list, parent, depth) {
        list.forEach(function (g) {
          items.push({ g: g, parent: parent, depth: depth });
          walk(g.giu || [], g.lingua, depth + 1);
        });
      })(giu, lang, 0);
      el("copies-title").textContent = items.length ? "Copies in other halls (" + items.length + ")" : "Copies in other halls";
      var SHOW = 18;
      el("copies").innerHTML = items.length ? items.slice(0, SHOW).map(function (it) {
        var g = it.g;
        return '<li style="--d:' + it.depth + '"><span class="dot" style="--leather:' + leather(g.lingua) + '"></span><a href="' + B.esc(B.wordUrl(g.lingua, g.parola, g.n_etimologia, it.parent)) + '">' +
          term(g.parola, g.traslitterazione) + '</a> <span class="hl">hall of ' + B.esc(B.nameOf(L, g.lingua)) + "</span></li>";
      }).join("") + (items.length > SHOW ? '<li class="etc">… and ' + (items.length - SHOW) + " more</li>" : "")
        : '<li class="etc">No other hall holds a copy, as far as the Wiktionary says.</li>';
      el("tree-link").parentNode.hidden = !items.length;
      show(); ready();
    }).catch(fail);
  }

  // ===================== tree: the copies, hall to hall =====================
  function tree() {
    var lang = B.param("lang") || "it", w = B.param("w") || "caffè", ne = +B.param("n") || 1;
    Promise.all([B.langs(), B.tree(lang, w, ne)]).then(function (res) {
      var L = res[0], t = res[1];
      if (!t) {
        el("loading").innerHTML = "No copies of “" + B.esc(w) + "” are catalogued. <a href=\"" + B.wiktUrl(w, B.nameOf(L, lang)) + "\">Wiktionary</a>.";
        return ready();
      }
      var T = B.fullTree(L, lang, t);
      document.title = "Copies of " + T.word + " — lexodus (Library of Babel draft)";
      el("title").innerHTML = "The copies of <i>" + B.esc(T.word) + "</i>, hall to hall";
      el("sum").textContent = "From the oldest hall on the left, through passages, to every hall that holds a copy: " + T.count + " copies after the volume in the hall of " + B.nameOf(L, lang) + ".";
      el("word-link").href = B.wordUrl(lang, T.word, T.n, T.me.parent);
      // every hall on its own row; a passage goes down from the hall, then turns towards each copy
      var CW = 132, RH = 52, X0 = 40, Y0 = 36, row = 0, maxD = 0, R = 24;
      (function place(n) { maxD = Math.max(maxD, n.d); n.row = row++; n.kids.forEach(place); })(T.root);
      var W = X0 * 2 + maxD * CW + 240, H = Y0 + row * RH, pass = "", nodes = "";
      function xy(n) { return [X0 + n.d * CW, Y0 + n.row * RH]; }
      (function draw(n) {
        var p = xy(n);
        n.kids.forEach(function (k) {
          var c = xy(k);
          var d = "M" + p[0] + " " + p[1] + " V" + c[1] + " H" + c[0];
          pass += '<path class="pass-o" d="' + d + '"/><path class="pass-i" d="' + d + '"/>';
          draw(k);
        });
        var hx = [0, 1, 2, 3, 4, 5].map(function (i) { var a = Math.PI / 3 * i - Math.PI / 2; return (p[0] + R * Math.cos(a)).toFixed(1) + "," + (p[1] + R * Math.sin(a)).toFixed(1); }).join(" ");
        var href = n.up ? B.langUrl(n.code) : B.wordUrl(n.code, n.word, n.ne || 1, n.parent);
        var wd = n.tr && n.tr !== n.word ? n.word + " (" + n.tr + ")" : n.word;
        nodes += '<a href="' + B.esc(href) + '" class="room' + (n.here ? " here" : "") + '"><polygon points="' + hx + '" style="fill:' + leather(n.code) + '"/>' +
          '<text class="code" x="' + p[0] + '" y="' + (p[1] + 5) + '" text-anchor="middle">' + B.esc(B.merged(n.code)) + "</text>" +
          '<text class="lab" x="' + (p[0] + R + 9) + '" y="' + (p[1] - 4) + '">' + B.esc(n.name) + "</text>" +
          '<text class="wd" x="' + (p[0] + R + 9) + '" y="' + (p[1] + 16) + '">' + B.esc(wd) + "</text></a>";
      })(T.root);
      el("corridor").innerHTML = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Copies of ' + B.esc(T.word) + '">' + pass + nodes + "</svg>";
      show(); ready();
    }).catch(fail);
  }

  if (page === "index") home();
  else if (page === "language") language();
  else if (page === "word") word();
  else tree();
})();
