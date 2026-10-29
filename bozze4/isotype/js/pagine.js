/* lexodus, draft "isotype" (picture statistics after Neurath and Arntz): plates with a title, a key that states
   the value of one sign, and rows of repeated signs. No number stands without its signs. */
(function () {
  "use strict";
  var B = window.B, E = B.esc;
  function el(id) { return document.getElementById(id); }
  var page = document.body.dataset.page;
  function fail(e) { el("loading").textContent = "The data could not be loaded (" + e.message + ")."; console.error(e); }
  function done(html) { el("app").innerHTML = html; el("loading").hidden = true; el("app").hidden = false; document.body.dataset.ready = "1"; }
  var KINDS = [["prestito", "", "borrowed"], ["latinismo_dotto", "lat", "learned Latin"], ["calco", "cal", "calque"]];
  var CLS = { prestito: "", latinismo_dotto: "lat", calco: "cal", ereditato: "oth", non_precisato: "oth" };
  function sign(cls, frac, label) {
    var clip = frac && frac < 1 ? ' style="clip-path:inset(0 ' + ((1 - frac) * 100).toFixed(0) + '% 0 0)"' : "";
    return '<span class="s' + (cls ? " " + cls : "") + '"' + clip + (label ? ' title="' + E(label) + '"' : "") + "></span>";
  }
  // signs for a set of categories, in quarters of a sign. The signs are laid one after the other; each takes the
  // colour of the kind that fills most of the words it stands for, so only the last sign of a row is ever cut.
  function signs(cats, unit, wide) {
    var total = 0, bounds = [];
    KINDS.forEach(function (k) { var v = cats[k[0]] || 0; total += v; bounds.push([total, k[1], k[0]]); });
    var q = Math.round(total / unit * 4) / 4, h = "";
    function kindAt(a, b) {
      var best = null, bestV = -1, lo = 0;
      bounds.forEach(function (x) { var ov = Math.max(0, Math.min(b, x[0]) - Math.max(a, lo)); if (ov > bestV) { bestV = ov; best = x[1]; } lo = x[0]; });
      return best;
    }
    for (var i = 0; i < Math.ceil(q); i++) {
      var fr = Math.min(1, q - i);
      h += sign(kindAt(i * unit, Math.min(total, (i + fr) * unit)), fr);
    }
    if (!h) return '<span class="under">under ¼ sign</span>';
    return '<span class="signs' + (wide ? " w40" : "") + '" role="img" aria-label="' + B.n(total) + ' words">' + h + "</span>";
  }
  function sumCats(rows) {
    var c = {};
    rows.forEach(function (r) { Object.keys(r.cats).forEach(function (k) { c[k] = (c[k] || 0) + r.cats[k]; }); });
    return c;
  }
  function used(c) { return KINDS.filter(function (k) { return c[k[0]] > 0; }); }
  function key(unit, kinds, extra) {
    return '<div class="key"><p class="val">' + sign("") + "= " + (unit === 1 ? "1 word" : B.n(unit) + " words") + "</p>" +
      kinds.map(function (k) { return '<p class="k">' + sign(k[1]) + E(k[2]) + "</p>"; }).join("") +
      (unit > 1 ? '<p class="k" style="margin-top:8px">A cut sign is a part: ¼, ½, ¾.</p>' : "") + (extra || "") + "</div>";
  }

  // ============ plate 1: the 33 ============
  function home() {
    B.allSides().then(function (A) {
      var L = A.L, unit = 1000, allT = {}, allG = {};
      var field = '<div class="field big"><span class="lab"></span><div class="row"><b class="bw">Taken from the others</b><b>Given to the others</b></div>';
      B.FAMILIES.forEach(function (f) {
        var list = L.list.filter(function (l) { return l.fam === f.id; }).sort(function (a, b) { return a.name.localeCompare(b.name, "en"); });
        if (!list.length) return;
        field += '<p class="grp">' + E(f.name) + "</p>";
        list.forEach(function (l) {
          var s = A.sides[l.code], t = sumCats(s.from), g = sumCats(s.to);
          Object.keys(t).forEach(function (k) { allT[k] = 1; }); Object.keys(g).forEach(function (k) { allG[k] = 1; });
          var tt = s.from.reduce(function (a, r) { return a + r.n; }, 0), gg = s.to.reduce(function (a, r) { return a + r.n; }, 0);
          field += '<p class="lab"><a href="' + B.langUrl(l.code) + '">' + E(l.name) + '</a><span class="num">' + B.n(tt) + " taken, " + B.n(gg) + " given</span></p>" +
            '<div class="row"><span class="block bw">' + signs(t, unit) + '</span><span class="block">' + signs(g, unit) + "</span></div>";
        });
      });
      field += "</div>";
      var html = '<section class="plate"><h1>Words taken and given by thirty-three languages</h1>' +
        '<p class="sub">Each language in a row, grouped by family. On the left, the words it took from the others; on the right, the words the others took from it. French gives the most, Romanian takes the most.</p>' +
        key(unit, KINDS.filter(function (k) { return allT[k[0]] || allG[k[0]]; })) + field + "</section>";
      done(html);
    }).catch(fail);
  }

  // ============ plate 2: one language ============
  function plateRows(rows, unit, minN, otherLabel) {
    var big = rows.filter(function (r) { return r.n >= minN; }), small = rows.filter(function (r) { return r.n < minN; });
    var f = '<div class="field">';
    big.forEach(function (r) {
      f += '<p class="lab">' + (r.target || r.code === "la" ? '<a href="' + B.langUrl(r.code) + '">' + E(r.name) + "</a>" : E(r.name)) + '<span class="num">' + B.n(r.n) + "</span></p>" +
        '<div class="row">' + signs(r.cats, unit, true) + "</div>";
    });
    if (small.length) {
      var c = sumCats(small), n = small.reduce(function (a, r) { return a + r.n; }, 0);
      f += '<p class="lab">' + small.length + " " + otherLabel + '<span class="num">' + B.n(n) + "</span></p>" +
        '<div class="row">' + signs(c, unit, true) + "</div>";
    }
    return f + "</div>";
  }
  function language() {
    var code = B.param("code") || "it";
    B.language(code).then(function (d) {
      var l = d.lang, unit = 50, html = "";
      document.title = l.name + " — lexodus (Isotype draft)";
      if (l.target) {
        var c = sumCats(d.from), top = d.from[0];
        html += '<section class="plate"><h1>' + E(l.name) + " took " + B.n(d.fromTotal) + " words from " + d.from.length + " languages</h1>" +
          '<p class="sub">' + (top ? "Most of them from " + E(top.name) + ". " : "") + "One row for each language that gave at least a quarter of a sign; the others are counted together in the last row.</p>" +
          key(unit, used(c)) + plateRows(d.from, unit, unit / 4, "other languages") + "</section>";
      }
      var g = sumCats(d.to);
      html += '<section class="plate"><h2>' + E(l.name) + " gave " + B.n(d.toTotal) + " words to " + d.to.length + " of the thirty-three</h2>" +
        '<p class="sub">The words each language took from ' + E(l.name) + ", with the same sign.</p>" +
        key(unit, used(g)) + plateRows(d.to, unit, unit / 4, "other languages") + "</section>";
      done(html);
    }).catch(fail);
  }

  // ============ plate 3: one word ============
  var ARROW = '<svg viewBox="0 0 56 28" aria-hidden="true"><path d="M0 9H38V1L56 14L38 27V19H0Z" fill="#111"/></svg>';
  function word() {
    var lang = B.param("lang") || "it", w = B.param("w") || "caffè", ne = +B.param("n") || 1, from = B.param("from") || "";
    B.word(lang, w, ne, from).then(function (r) {
      var L = r.L, p = r.p;
      if (!p) { el("loading").innerHTML = "“" + E(w) + "” is not in the data. <a href=\"" + B.wiktUrl(w, B.nameOf(L, lang)) + "\">Wiktionary</a>"; document.body.dataset.ready = "1"; return; }
      document.title = p.parola + " — lexodus (Isotype draft)";
      var stops = B.journey(L, lang, p), first = stops[0], prev = stops[stops.length - 2];
      var catOf = {};
      (p.catena || []).forEach(function (c, i) { catOf[i] = c.categoria; });
      var title = p.parola + " came to " + B.nameOf(L, lang) + (first && !first.here ? " from " + first.name : "") +
        (stops.length > 3 ? ", by way of " + stops.slice(1, -1).map(function (s) { return s.name; }).join(" and ") : stops.length === 3 ? ", by way of " + stops[1].name : "");
      var places = '<div class="places">' + stops.map(function (s, i) {
        var cat = i < stops.length - 1 ? (p.catena || [])[stops.length - 2 - i] : null;
        var arrow = i ? '<div class="arrowp">' + ARROW + "<span>" + E(stops[i - 1].how) + "</span></div>" : "";
        var script = s.term && !B.isLatinScript(s.term);
        return arrow + '<div class="place' + (s.here ? " here" : "") + '"><span class="ln">' + E(s.name) + '</span><span class="wd"><bdi>' + E(s.term) + "</bdi></span>" +
          (s.tr && s.tr !== s.term ? '<span class="tr">' + E(s.tr) + "</span>" : script ? "" : "") + sign("", 1, s.name + " " + s.term) + "</div>";
      }).join("") + "</div>";
      var html = '<section class="plate"><h1>' + E(title) + "</h1><p class=\"sub\">" + E(p.significato || "") + ".</p>" +
        key(1, [KINDS[0]]) + places +
        (r.text ? '<p class="etym">In the Wiktionary: “' + E(r.text) + '” <a href="' + B.wiktUrl(p.parola, B.nameOf(L, lang)) + '">Source</a>.</p>' : "") + "</section>";
      var T = r.tree ? B.fullTree(L, lang, r.tree) : null;
      if (T && T.count) {
        var gens = [], kinds = {};
        (function walk(nd, depth) { nd.kids.forEach(function (k) { (gens[depth] = gens[depth] || []).push(k); walk(k, depth + 1); }); })(T.me, 0);
        var f = '<div class="field">';
        gens.forEach(function (g, i) {
          f += '<p class="lab">' + (i === 0 ? "Straight from " + E(B.nameOf(L, lang)) : (i === 1 ? "One hand further" : i + " hands further")) + '<span class="num">' + g.length + (g.length === 1 ? " word" : " words") + "</span></p>" +
            '<div class="row"><div class="gen">' + g.map(function (k) {
              var cls = k.how === "borrowed" ? "" : k.how === "learned Latin" ? "lat" : k.how === "calque" ? "cal" : "oth";
              kinds[cls] = k.how === "borrowed" || k.how === "learned Latin" || k.how === "calque" ? k.how : "other ways (unspecified, inherited)";
              return '<span class="one">' + sign(cls, 1) + E(k.name) + '<br><a href="' + E(B.wordUrl(k.code, k.word, k.ne, k.parent)) + '"><bdi>' + E(k.word) + "</bdi></a>" +
                (i ? "<br>from " + E(B.nameOf(L, k.parent)) : "") + "</span>";
            }).join("") + "</div></div>";
        });
        f += "</div>";
        var ks = Object.keys(kinds).map(function (c) { return [c, c, kinds[c]]; });
        html += '<section class="plate"><h2>' + T.count + " words in other languages came from " + E(p.parola) + "</h2>" +
          '<p class="sub">Row by row, as the word passed from hand to hand.</p>' + key(1, ks) + f + "</section>";
      }
      done(html);
    }).catch(fail);
  }

  if (page === "index.html") home(); else if (page === "language.html") language(); else word();
})();
