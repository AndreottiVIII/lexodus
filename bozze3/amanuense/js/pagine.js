/* lexodus, draft "amanuense" (manuscript page): home (illuminated table of tongues), language (a chapter in two
   columns with marginal glosses), word (the word written out, its journey glossed in the margin), tree (stemma). */
(function () {
  "use strict";
  var B = window.B;
  function el(id) { return document.getElementById(id); }
  var page = document.body.dataset.page;
  var FAM_ORDER = ["romance", "germanic", "slavic", "baltic", "uralic", "semitic", "turkic", "other"];
  var FAM_RUBRIC = {
    romance: "the Romance tongues", germanic: "the Germanic tongues", slavic: "the Slavic tongues", baltic: "the Baltic tongues",
    uralic: "the Finno-Ugric tongues", semitic: "the Semitic tongues", turkic: "the Turkic tongues", other: "the Greek, Albanian and Iranian tongues"
  };
  function roman(v) {
    var m = [[1000, "m"], [900, "cm"], [500, "d"], [400, "cd"], [100, "c"], [90, "xc"], [50, "l"], [40, "xl"], [10, "x"], [9, "ix"], [5, "v"], [4, "iv"], [1, "i"]], s = "";
    m.forEach(function (p) { while (v >= p[0]) { s += p[1]; v -= p[0]; } });
    // the last i of a medieval numeral is written as j
    return s.replace(/i$/, s.length > 1 ? "j" : "i");
  }
  var MARKS = "abcdefghiklmnopqrstuxyz".split("");
  function mark(i) { return MARKS[i % MARKS.length] + (i >= MARKS.length ? MARKS[Math.floor(i / MARKS.length) - 1] : ""); }
  function fail(e) { el("loading").textContent = "The ink has run: the data could not be loaded (" + e.message + ")."; console.error(e); }
  function ready() { document.body.dataset.ready = "1"; }
  function show() { el("loading").hidden = true; el("app").hidden = false; }
  // the term as written, with its transliteration in italics when the script is not Latin
  function term(t, tr) { return '<span class="term">' + B.esc(t || "—") + "</span>" + (tr && tr !== t ? ' <i class="tr">' + B.esc(tr) + "</i>" : ""); }
  function abbr(code) { return '<span class="ab">' + B.esc(B.merged(code)) + ".</span>"; }
  function folios(L) {
    var f = {};
    L.list.slice().sort(function (a, b) { return a.name.localeCompare(b.name); }).forEach(function (l, i) { f[l.code] = i + 1; });
    return f;
  }
  // a glossed paragraph: [gloss, text] as two cells of the grid; the gloss sits in the outer margin
  function glossed(gloss, text, cls) {
    return '<div class="pair"><div class="gl' + (cls ? " " + cls : "") + '">' + (gloss || "") + '</div><div class="tx' + (cls ? " " + cls : "") + '">' + text + "</div></div>";
  }

  // ===================== home: illuminated table =====================
  function home() {
    B.langs().then(function (L) {
      var f = folios(L), k = 0;
      el("table").innerHTML = FAM_ORDER.map(function (fam) {
        var list = L.list.filter(function (l) { return l.fam === fam; }).sort(function (a, b) { return b.lemmas - a.lemmas; });
        if (!list.length) return "";
        return '<section class="fam"><h2 class="rubric">Here begin ' + FAM_RUBRIC[fam] + "</h2><ul>" + list.map(function (l) {
          var color = (k++ % 2) ? "blue" : "red";
          return '<li><a href="' + B.langUrl(l.code) + '"><span class="cap ' + color + '" aria-hidden="true">' + B.esc(l.name.charAt(0)) + "</span>" +
            '<span class="nm"><span class="visually-hidden">' + B.esc(l.name.charAt(0)) + "</span>" + B.esc(l.name.slice(1)) + "</span>" +
            '<span class="fo">fol. ' + roman(f[l.code]) + "</span>" +
            '<span class="tk">took ' + B.n(l.took) + " · gave " + B.n(l.gave) + "</span></a></li>";
        }).join("") + "</ul></section>";
      }).join("");
      show(); ready();
    }).catch(fail);
  }

  // ===================== language: a chapter =====================
  var SHOWN = 12;
  function language() {
    var code = B.param("code") || "it";
    B.language(code).then(function (d) {
      var l = d.lang, L = d.L, f = folios(L);
      document.title = "The chapter of " + l.name + " — lexodus (manuscript draft)";
      el("folio").textContent = f[code] ? "fol. " + roman(f[code]) + " r" : "appendix";
      el("runtitle").textContent = l.name;
      el("rubric").innerHTML = "Here begins the chapter of the " + B.esc(l.name) + " tongue";
      el("jump").innerHTML = '<option value="">Turn to another folio…</option>' + L.list.slice().sort(function (a, b) { return a.name.localeCompare(b.name); })
        .map(function (t) { return '<option value="' + t.code + '"' + (t.code === code ? " selected" : "") + ">fol. " + roman(f[t.code]) + " · " + B.esc(t.name) + "</option>"; }).join("");
      el("jump").onchange = function () { if (this.value) location.href = B.langUrl(this.value); };
      var first = l.name.charAt(0);
      el("opening").innerHTML = '<span class="illum" aria-hidden="true">' + B.esc(first) + '</span><span class="visually-hidden">' + B.esc(first) + "</span>" +
        (l.target
          ? B.esc(l.name.slice(1)) + " has " + B.n(l.lemmas) + " entries in the Wiktionary, and " + Math.round(l.pct) + " in every hundred tell whence they came. It took " +
            B.n(l.took) + " words from " + B.n(d.from.length) + " tongues and gave " + B.n(l.gave) + " to " + B.n(d.to.length) + " of the thirty-three. Here they are written, the greatest first."
          : B.esc(l.name.slice(1)) + " is not one of the thirty-three, but " + B.n(d.to.length) + " of them took words from it: " + B.n(d.toTotal) + " in all.");
      function cats(r) {
        return Object.keys(r.cats).sort(function (a, b) { return r.cats[b] - r.cats[a]; })
          .map(function (c) { return '<span class="gc">' + B.esc(B.CATS[c]) + " " + B.n(r.cats[c]) + "</span>"; }).join("");
      }
      function chapter(id, side, rows) {
        var html = rows.slice(0, SHOWN).map(function (r, i) {
          var ex = r.ex.map(function (w) {
            var href = side === "from" ? B.wordUrl(code, w, 1, r.code) : B.wordUrl(r.code, w, 1, code);
            return '<a href="' + B.esc(href) + '"><i>' + B.esc(w) + "</i></a>";
          }).join(", ");
          var lead = side === "from" ? "From " : "To ";
          return glossed('<span class="mk">' + mark(i) + "</span>" + cats(r),
            '<p><span class="pil" aria-hidden="true">¶</span><a class="lname" href="' + B.langUrl(r.code) + '">' + lead + B.esc(r.name) + "</a>" +
            '<sup class="mk">' + mark(i) + "</sup>, " + B.n(r.n) + (r.n === 1 ? " word" : " words") + (ex ? ", as " + ex : "") + ".</p>");
        }).join("");
        var rest = rows.slice(SHOWN);
        if (rest.length) {
          html += glossed('<span class="gc">' + rest.length + " tongues</span>",
            '<p class="run"><span class="pil" aria-hidden="true">¶</span><span class="red">' + (side === "from" ? "And from" : "And to") + " these besides:</span> " +
            rest.map(function (r) { return '<a href="' + B.langUrl(r.code) + '">' + B.esc(r.name) + "</a> " + B.n(r.n); }).join(", ") + ".</p>");
        }
        if (!rows.length) html = glossed("", "<p>Nothing is written here.</p>");
        el(id).innerHTML = html;
      }
      if (l.target) chapter("from", "from", d.from); else el("from").innerHTML = glossed("", "<p>This tongue is not among the thirty-three: what it took is not written in this book.</p>");
      chapter("to", "to", d.to);
      show();
      return l.target ? B.extra(code).then(function (x) { return [x, L]; }) : null;
    }).then(function (res) {
      var x = res && res[0], L = res && res[1];
      var lst = x && x.piu_viaggiate ? x.piu_viaggiate.lista || [] : [];
      if (lst.length) {
        el("far").innerHTML = lst.map(function (w, i) {
          var cat = w.catena || [];
          var chain = cat.slice().reverse().map(function (c) { return abbr(c.codice) + " " + B.esc(c.termine || "—"); }).join(" &gt; ") + " &gt; " + abbr(code) + " " + B.esc(w.parola);
          return glossed('<span class="mk">' + mark(i) + "</span>" + chain,
            '<p><span class="pil" aria-hidden="true">¶</span><a class="lname" href="' + B.esc(B.wordUrl(code, w.parola, w.n_etimologia, cat[0] && cat[0].codice)) + '"><i>' + B.esc(w.parola) + "</i></a>" +
            '<sup class="mk">' + mark(i) + "</sup>" + (w.significato ? ", that is “" + B.esc(w.significato) + "”," : "") + " passed through " + B.n(cat.length + 1) + " tongues.</p>");
        }).join("");
        el("far-block").hidden = false;
      }
      ready();
    }).catch(fail);
  }

  // ===================== word: the word written out =====================
  function word() {
    var lang = B.param("lang") || "it", w = B.param("w") || "caffè", ne = +B.param("n") || 1, from = B.param("from") || "";
    B.word(lang, w, ne, from).then(function (r) {
      var L = r.L, p = r.p;
      if (!p) {
        el("loading").innerHTML = "“" + B.esc(w) + "” is not written in this book. <a href=\"" + B.wiktUrl(w, B.nameOf(L, lang)) + "\">Wiktionary</a>.";
        return ready();
      }
      var f = folios(L), stops = B.journey(L, lang, p), name = B.nameOf(L, lang);
      document.title = p.parola + " — lexodus (manuscript draft)";
      el("folio").textContent = f[lang] ? "fol. " + roman(f[lang]) + " v" : "";
      el("runtitle").textContent = name;
      el("rubric").innerHTML = "Of the word <i>" + B.esc(p.parola) + "</i>, and of its journey";
      el("stemma-link").href = B.treeUrl(lang, p.parola, p.n_etimologia);
      el("stemma-link").textContent = "stemma";
      var first = p.parola.charAt(0), rest = p.parola.slice(1);
      var left = glossed('<span class="mk">a</span>' + (p.pos ? B.esc(p.pos) + ", " : "") + B.esc(name.toLowerCase()) + ".",
        '<p class="opening"><span class="illum huge" aria-hidden="true">' + B.esc(first.toUpperCase()) + '</span><span class="visually-hidden">' + B.esc(first) + "</span>" +
        '<span class="word-title">' + B.esc(rest) + "</span><sup class=\"mk\">a</sup>, a word of the " + B.esc(name) + " tongue" +
        (p.significato ? ", that signifies “" + B.esc(p.significato) + "”" : "") + ". It passed through " + B.n(stops.length) + " tongues before it was written here.</p>");
      // the journey told in prose; the chain in the margin
      var prose = stops.map(function (s, i) {
        var t = '<a class="lname" href="' + B.langUrl(s.code) + '">' + B.esc(s.name) + "</a> " + term(s.term, s.tr);
        if (i === 0) return "It began in " + t;
        return (i === stops.length - 1 ? "and at last" : "thence") + ", " + B.esc(stops[i - 1].how || "taken") + ", into " + t;
      }).join("; ") + ".";
      var chain = stops.map(function (s) { return abbr(s.code) + " " + B.esc(s.tr && s.tr !== s.term ? s.tr : s.term); }).join("<br>&gt; ");
      left += glossed('<span class="mk">b</span>' + chain, '<p><span class="pil" aria-hidden="true">¶</span><span class="red">The way.</span><sup class="mk">b</sup> ' + prose + "</p>");
      if (r.text) {
        left += glossed('<span class="mk">c</span>so says the Wiktionary',
          '<p><span class="pil" aria-hidden="true">¶</span><span class="red">The old note.</span><sup class="mk">c</sup> <q>' + B.esc(r.text) + (r.text.length >= 300 ? "…" : "") +
          '</q> <a href="' + B.wiktUrl(p.parola, name) + '">Read the entry</a>.</p>');
      }
      left += glossed('<span class="mk">d</span>the way, drawn', '<figure class="way" aria-label="The way, oldest first">' + stops.map(function (s, i) {
        return (i ? '<div class="how">' + B.esc(stops[i - 1].how || "taken") + "</div>" : "") +
          '<div class="stop' + (s.here ? " here" : "") + '"><span class="orb">' + B.esc(B.merged(s.code)) + '</span><span class="sw">' + term(s.term, s.tr) +
          '</span><a class="lname" href="' + B.langUrl(s.code) + '">' + B.esc(s.name) + "</a></div>";
      }).join("") + "</figure>");
      el("left").innerHTML = left;
      // those that took it after: one paragraph per branch, the chains in the margin
      var giu = r.tree && r.tree.e ? r.tree.e.giu || [] : [];
      if (!giu.length) {
        el("right").innerHTML = glossed("", "<p>No tongue of the thirty-three took it after, as far as the Wiktionary says.</p>");
      } else {
        var k = 3;
        el("right").innerHTML = giu.map(function (g) {
          var m = mark(k++), chains = [];
          function one(x, parent) {
            return '<a class="lname" href="' + B.langUrl(x.lingua) + '">' + B.esc(B.nameOf(L, x.lingua)) + '</a> <a href="' +
              B.esc(B.wordUrl(x.lingua, x.parola, x.n_etimologia, parent)) + '">' + term(x.parola, x.traslitterazione) + "</a>";
          }
          // whence: the words taken in turn, nested as the scribe would write them
          function phrase(x, parent) {
            var kids = x.giu || [];
            return one(x, parent) + (kids.length ? " (whence " + kids.map(function (y) { return phrase(y, x.lingua); }).join(", ") + ")" : "");
          }
          (function walk(list, path) {
            list.forEach(function (x) {
              var here = path.concat([abbr(x.lingua) + " " + B.esc(x.traslitterazione && x.traslitterazione !== x.parola ? x.traslitterazione : x.parola)]);
              if ((x.giu || []).length) walk(x.giu, here); else if (path.length) chains.push(here.join(" &gt; "));
            });
          })([g], []);
          var kids = g.giu || [];
          var gloss = '<span class="mk">' + m + "</span>" + (chains.length ? chains.slice(0, 5).join("<br>") + (chains.length > 5 ? "<br>&amp;c., " + chains.length + " in all" : "") : B.esc(B.CATS[g.categoria] || ""));
          return glossed(gloss, '<p><span class="pil" aria-hidden="true">¶</span>' + one(g, lang) + '<sup class="mk">' + m + "</sup>" +
            (kids.length ? '; <span class="red">and from ' + B.esc(B.nameOf(L, g.lingua)) + ":</span> " + kids.map(function (y) { return phrase(y, g.lingua); }).join(", ") : "") + ".</p>");
        }).join("");
      }
      el("b-title").textContent = giu.length ? "Of those that took it after (" + B.count(giu) + ")" : "Of those that took it after";
      show(); ready();
    }).catch(fail);
  }

  // ===================== tree: stemma =====================
  function tree() {
    var lang = B.param("lang") || "it", w = B.param("w") || "caffè", ne = +B.param("n") || 1;
    Promise.all([B.langs(), B.tree(lang, w, ne)]).then(function (res) {
      var L = res[0], t = res[1];
      if (!t) {
        el("loading").innerHTML = "No stemma for “" + B.esc(w) + "”. <a href=\"" + B.wiktUrl(w, B.nameOf(L, lang)) + "\">Wiktionary</a>.";
        return ready();
      }
      var T = B.fullTree(L, lang, t);
      document.title = "Stemma of " + T.word + " — lexodus (manuscript draft)";
      el("runtitle").textContent = T.word;
      el("rubric").innerHTML = "The stemma of <i>" + B.esc(T.word) + "</i>, with its lost exemplars and its copies";
      el("note").textContent = "As the philologists draw the descent of manuscripts: Greek letters for the older forms, from which the word came; Latin capitals for the word itself and the copies made from it, " + T.count + " in all. Each copy hangs from the tongue it was taken from.";
      el("word-link").href = B.wordUrl(lang, T.word, T.n, T.me.parent);
      el("word-link").textContent = "the word";
      // sigla: Greek for the ancestors, Latin capitals in reading order for the rest
      var GREEK = "αβγδεζηθικλμνξοπρστυφχψω".split(""), LAT = "ABCDEFGHKLMNOPQRSTVXYZabcdefghklmnopqrstvxyz".split(""), gi = 0, li = 0, all = [];
      // sigla are given in the order the stemma is read: each node, then its stacked copies, then its branches
      function sig(n) { n.sig = n.up ? GREEK[gi++ % GREEK.length] : LAT[li % LAT.length] + (li >= LAT.length ? Math.floor(li / LAT.length) : ""); if (!n.up) li++; all.push(n); }
      // layout: inner children side by side, leaf children stacked in one column under a bracket
      var U = 164, RH = 96, LH = 30, PAD = 24;
      function width(n) {
        var leaves = n.kids.filter(function (k) { return !k.kids.length; }), inner = n.kids.filter(function (k) { return k.kids.length; });
        n.leaves = leaves; n.inner = inner;
        var wsum = (leaves.length ? 1 : 0) + inner.reduce(function (s, k) { return s + width(k); }, 0);
        n.w = Math.max(1, wsum);
        return n.w;
      }
      width(T.root);
      var maxY = 0, lines = "", labels = "";
      function lab(n, x, y, anchor) {
        var wd = n.tr && n.tr !== n.word ? n.word + " (" + n.tr + ")" : n.word;
        var cls = n.here ? "here" : n.up ? "lost" : "copy";
        return '<g class="node ' + cls + '"><text x="' + x + '" y="' + y + '" text-anchor="' + anchor + '"><tspan class="sg">' + B.esc(n.sig) + '</tspan><tspan class="ln" dx="6">' +
          B.esc(n.name) + '</tspan><tspan class="wd" dx="6">' + B.esc(wd) + "</tspan></text></g>";
      }
      function place(n, x0, y) {
        var cx = x0 + n.w * U / 2;
        n.x = cx; n.y = y;
        if (!n.sig) sig(n);
        n.leaves.forEach(sig);
        labels += lab(n, cx, y, "middle");
        var gx = x0, kidsTop = y + RH, tops = [];
        if (n.leaves.length) {
          // a bracket: a line down from the node, ticks to each leaf
          var bx = gx + 26, ly = kidsTop - 6;
          n.leaves.forEach(function (k, i) {
            var yy = ly + i * LH;
            k.x = bx + 12; k.y = yy;
            labels += lab(k, bx + 14, yy + 5, "start");
            lines += '<path d="M' + bx + " " + yy + " H" + (bx + 10) + '"/>';
            maxY = Math.max(maxY, yy);
          });
          tops.push({ x: bx, y: ly, bottom: ly + (n.leaves.length - 1) * LH });
          gx += U;
        }
        n.inner.forEach(function (k) { place(k, gx, kidsTop); tops.push({ x: k.x, y: kidsTop - 22, bottom: kidsTop - 22 }); gx += k.w * U; });
        if (tops.length) {
          var midY = y + 18 + (RH - 40) / 2;
          lines += '<path d="M' + cx + " " + (y + 12) + " V" + midY + '"/>';
          var xs = tops.map(function (o) { return o.x; }).concat([cx]);
          lines += '<path d="M' + Math.min.apply(null, xs) + " " + midY + " H" + Math.max.apply(null, xs) + '"/>';
          tops.forEach(function (o) { lines += '<path d="M' + o.x + " " + midY + " V" + o.bottom + '"/>'; });
        }
        maxY = Math.max(maxY, y);
      }
      place(T.root, PAD, 40);
      var W = T.root.w * U + PAD * 2 + 96, H = maxY + 40;
      el("stemma").innerHTML = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Stemma of ' + B.esc(T.word) + '"><g class="lines">' + lines + "</g>" + labels + "</svg>";
      el("sigla").innerHTML = all.map(function (n) {
        var href = n.up ? B.langUrl(n.code) : B.wordUrl(n.code, n.word, n.ne || 1, n.parent);
        return '<li><span class="sg ' + (n.up ? "lost" : n.here ? "here" : "copy") + '">' + B.esc(n.sig) + '</span> <a href="' + B.esc(href) + '">' + B.esc(n.name) + " " + term(n.word, n.tr) + "</a>" +
          (n.how ? ' <span class="how">' + B.esc(n.how) + "</span>" : "") + "</li>";
      }).join("");
      show(); ready();
    }).catch(fail);
  }

  if (page === "index") home();
  else if (page === "language") language();
  else if (page === "word") word();
  else tree();
})();
