/* lexodus, draft "passaporto": home (passport office), language (customs register), word (passport with stamps). */
(function () {
  "use strict";
  var B = window.B;
  function el(id) { return document.getElementById(id); }
  var page = document.body.dataset.page;

  var COVER = { romance: "#6b1a26", germanic: "#1c2b4d", slavic: "#1f3f2e", baltic: "#174248", uralic: "#3d2449",
    semitic: "#2c2621", turkic: "#6a3711", other: "#2b323d", world: "#3a3a3a" };
  var INK = { prestito: "var(--ink-borrowed)", latinismo_dotto: "var(--ink-learned)", calco: "var(--ink-calque)",
    ereditato: "var(--ink-inherited)", non_precisato: "var(--ink-unspecified)", origin: "var(--ink-origin)" };
  var INK_NAME = { prestito: "borrowed", latinismo_dotto: "learned Latin", calco: "calque", ereditato: "inherited", non_precisato: "unspecified", origin: "furthest origin" };
  // shape of a stamp by family of the language
  var SHAPE = { romance: "circle", germanic: "rect", slavic: "oval", baltic: "octagon", uralic: "hexagon", semitic: "octagon",
    turkic: "shield", other: "rect2", world: "circle2" };

  // deterministic "randomness" from a string, so the stamps do not move at every reload
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; }

  // ---- guilloche paper: rose curves drawn once, used as a background tile ----
  (function guilloche() {
    var w = 520, h = 260, paths = [];
    for (var k = 0; k < 14; k++) {
      var d = "", ph = k * 0.45, amp = 34 + 6 * Math.sin(k);
      for (var x = 0; x <= w; x += 4) {
        var y = h / 2 + amp * Math.sin(x / w * Math.PI * 6 + ph) * Math.cos(x / w * Math.PI * 2 - ph / 2) + (k - 7) * 6;
        d += (x ? "L" : "M") + x + " " + y.toFixed(1);
      }
      paths.push('<path d="' + d + '" fill="none" stroke="%23b9b08f" stroke-width=".7" opacity=".55"/>');
    }
    var svg = "<svg xmlns='http://www.w3.org/2000/svg' width='" + w + "' height='" + h + "'>" + paths.join("").replace(/"/g, "'") + "</svg>";
    document.documentElement.style.setProperty("--guilloche", 'url("data:image/svg+xml,' + svg.replace(/#/g, "%23").replace(/</g, "%3C").replace(/>/g, "%3E") + '")');
  })();

  // ---- the ink filter (irregular edges, uneven ink), once per page ----
  function inkDefs() {
    var d = document.createElement("div");
    d.innerHTML = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
      '<filter id="ink" x="-8%" y="-8%" width="116%" height="116%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" result="n1"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n1" scale="2.4" xChannelSelector="R" yChannelSelector="G" result="d"/>' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed="11" result="n2"/>' +
      '<feColorMatrix in="n2" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 1.95" result="m"/>' +
      '<feComposite in="d" in2="m" operator="in"/></filter></defs></svg>';
    document.body.appendChild(d.firstChild);
  }

  // ---- a stamp: SVG, shape by family, ink by category ----
  var sid = 0;
  function fit(text, max, width) {
    var len = Math.max(1, Array.from(String(text)).length);
    return Math.max(15, Math.min(max, width / (len * 0.56)));
  }
  function stamp(o) {
    // o: {shape, ink, top, word, tr, bottom, size, href, title}
    var S = o.size || 210, c = S / 2, id = "s" + (++sid), ink = o.ink, sh = o.shape;
    var g = "", top = B.esc(String(o.top || "").toUpperCase()), bottom = B.esc(String(o.bottom || "").toUpperCase());
    var wsize = fit(o.word, S * 0.17, S * 0.66);
    function arcs(r) {
      return '<path id="' + id + 't" d="M ' + (c - r) + " " + c + " A " + r + " " + r + " 0 0 1 " + (c + r) + " " + c + '" fill="none"/>' +
        '<path id="' + id + 'b" d="M ' + (c - r) + " " + c + " A " + r + " " + r + " 0 0 0 " + (c + r) + " " + c + '" fill="none"/>';
    }
    function arcText(r, size) {
      return arcs(r) +
        '<text font-size="' + size + '" letter-spacing="2" fill="' + ink + '"><textPath href="#' + id + 't" startOffset="50%" text-anchor="middle">' + top + "</textPath></text>" +
        '<text font-size="' + Math.max(15, size * 0.82) + '" letter-spacing="1.5" fill="' + ink + '" dominant-baseline="hanging"><textPath href="#' + id + 'b" startOffset="50%" text-anchor="middle">' + bottom + "</textPath></text>";
    }
    function center(y) {
      return '<text class="w" x="' + c + '" y="' + y + '" text-anchor="middle" font-size="' + wsize.toFixed(1) + '" fill="' + ink + '">' + B.esc(o.word || "—") + "</text>" +
        (o.tr ? '<text class="w" x="' + c + '" y="' + (y + 22) + '" text-anchor="middle" font-size="16" font-style="italic" fill="' + ink + '">' + B.esc(o.tr) + "</text>" : "");
    }
    var sw = 'fill="none" stroke="' + ink + '"';
    if (sh === "circle" || sh === "circle2") {
      g += '<circle cx="' + c + '" cy="' + c + '" r="' + (c - 4) + '" ' + sw + ' stroke-width="4"' + (sh === "circle2" ? ' stroke-dasharray="3 3"' : "") + "/>" +
        '<circle cx="' + c + '" cy="' + c + '" r="' + (c - 12) + '" ' + sw + ' stroke-width="1.5"/>' +
        '<circle cx="' + c + '" cy="' + c + '" r="' + (c * 0.5) + '" ' + sw + ' stroke-width="1.2"/>' +
        arcText(c - 30, Math.max(15, S * 0.085)) + center(c + (o.tr ? -2 : 8));
    } else if (sh === "oval") {
      var rx = c - 4, ry = c * 0.72;
      g += '<ellipse cx="' + c + '" cy="' + c + '" rx="' + rx + '" ry="' + ry + '" ' + sw + ' stroke-width="4"/>' +
        '<ellipse cx="' + c + '" cy="' + c + '" rx="' + (rx - 9) + '" ry="' + (ry - 9) + '" ' + sw + ' stroke-width="1.5"/>' +
        '<text x="' + c + '" y="' + (c - ry * 0.45) + '" text-anchor="middle" font-size="' + Math.max(15, S * 0.085) + '" letter-spacing="2" fill="' + ink + '">' + top + "</text>" +
        '<line x1="' + (c - rx * 0.62) + '" x2="' + (c + rx * 0.62) + '" y1="' + (c - ry * 0.34) + '" y2="' + (c - ry * 0.34) + '" stroke="' + ink + '" stroke-width="1.5"/>' +
        center(c + 10 - (o.tr ? 8 : 0)) +
        '<text x="' + c + '" y="' + (c + ry * 0.66) + '" text-anchor="middle" font-size="15" letter-spacing="1.5" fill="' + ink + '">' + bottom + "</text>";
    } else {
      var pts;
      var m = 4, W = S - m, H = S * (sh === "rect" || sh === "rect2" ? 0.74 : 0.92), y0 = (S - H) / 2, y1 = y0 + H;
      if (sh === "hexagon") pts = [[c, m], [W, S * 0.27], [W, S * 0.73], [c, S - m], [m, S * 0.73], [m, S * 0.27]];
      else if (sh === "octagon") { var k = S * 0.29; pts = [[m + k, m], [W - k, m], [W, m + k], [W, S - m - k], [W - k, S - m], [m + k, S - m], [m, S - m - k], [m, m + k]]; }
      else if (sh === "shield") pts = [[m, y0], [W, y0], [W, c + 10], [c, S - m], [m, c + 10]];
      else if (sh === "rect2") { var q = 16; pts = [[m + q, y0], [W - q, y0], [W, y0 + q], [W, y1 - q], [W - q, y1], [m + q, y1], [m, y1 - q], [m, y0 + q]]; }
      else pts = [[m, y0], [W, y0], [W, y1], [m, y1]];
      var inset = pts.map(function (p) { return [c + (p[0] - c) * 0.92, c + (p[1] - c) * 0.92]; });
      function poly(ps, w) { return '<polygon points="' + ps.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ") + '" ' + sw + ' stroke-width="' + w + '"/>'; }
      var ty = sh === "shield" ? y0 + 30 : sh === "rect" || sh === "rect2" ? y0 + 32 : S * 0.3;
      var by = sh === "shield" ? ty + 28 : sh === "rect" || sh === "rect2" ? y1 - 16 : S * 0.78;
      g += poly(pts, 4) + poly(inset, 1.5) +
        '<text x="' + c + '" y="' + ty + '" text-anchor="middle" font-size="' + Math.max(15, S * 0.085) + '" letter-spacing="2" fill="' + ink + '">' + top + "</text>" +
        '<line x1="' + (S * 0.2) + '" x2="' + (S * 0.8) + '" y1="' + (ty + 8) + '" y2="' + (ty + 8) + '" stroke="' + ink + '" stroke-width="1.5"/>' +
        center((sh === "shield" ? c + 26 : c + 10) - (o.tr ? 8 : 0)) +
        '<text x="' + c + '" y="' + by + '" text-anchor="middle" font-size="15" letter-spacing="1.5" fill="' + ink + '">' + bottom + "</text>";
    }
    var r = (hash(o.top + o.word) - 0.5) * 22, mm = Math.round((hash(o.word + "m") - 0.5) * 18);
    var svg = '<svg width="' + S + '" height="' + S + '" viewBox="0 0 ' + S + " " + S + '" role="img" aria-label="' + B.esc(o.title || "") + '"><g filter="url(#ink)" opacity=".9">' + g + "</g></svg>";
    return '<a class="stamp" href="' + B.esc(o.href || "#") + '" style="--r:' + r.toFixed(1) + "deg;--m:" + mm + "px " + (-mm) + 'px" title="' + B.esc(o.title || "") + '">' + svg + "</a>";
  }

  function nav() {
    return "";
  }
  function fail(e) {
    el("loading").textContent = location.protocol === "file:" ? "Open the drafts from a web server, not from a file." : "The data could not be loaded (" + e.message + ").";
    console.error(e);
  }
  function ready() { document.body.dataset.ready = "1"; }

  // ===================== home =====================
  function home() {
    B.langs().then(function (L) {
      var order = B.FAMILIES.map(function (f) { return f.id; });
      var list = L.list.slice().sort(function (a, b) { return order.indexOf(a.fam) - order.indexOf(b.fam) || a.name.localeCompare(b.name); });
      el("rack").innerHTML = list.map(function (l) {
        var tilt = ((hash(l.code) - 0.5) * 5).toFixed(1);
        return '<li><a class="cover" href="' + B.langUrl(l.code) + '" style="--cover:' + COVER[l.fam] + ";--tilt:" + tilt + 'deg">' +
          '<span class="k">Passport of words</span>' + emblem(l.code) +
          '<span class="nat">' + B.esc(l.name) + "</span>" +
          '<span class="nums">' + B.n(l.took) + " in<br>" + B.n(l.gave) + " out</span></a></li>";
      }).join("");
      var seen = {};
      el("legend").innerHTML = list.filter(function (l) { if (seen[l.fam]) return false; seen[l.fam] = 1; return true; }).map(function (l) {
        return '<li><i style="--cover:' + COVER[l.fam] + '"></i>' + B.esc(B.FAM_BY_ID[l.fam].name) + "</li>";
      }).join("");
      el("loading").hidden = true; el("app").hidden = false;
      ready();
    }).catch(fail);
  }
  function emblem(code) {
    // a crest: rays, a ring, the two letters of the code
    var rays = "";
    for (var i = 0; i < 24; i++) {
      var a = i / 24 * Math.PI * 2, r1 = 30, r2 = i % 2 ? 38 : 44;
      rays += '<line x1="' + (50 + r1 * Math.cos(a)).toFixed(1) + '" y1="' + (50 + r1 * Math.sin(a)).toFixed(1) + '" x2="' + (50 + r2 * Math.cos(a)).toFixed(1) + '" y2="' + (50 + r2 * Math.sin(a)).toFixed(1) + '" stroke="currentColor" stroke-width="2"/>';
    }
    return '<svg viewBox="0 0 100 100" aria-hidden="true">' + rays + '<circle cx="50" cy="50" r="27" fill="none" stroke="currentColor" stroke-width="2.5"/>' +
      '<text x="50" y="59" text-anchor="middle" font-family="Staatliches, sans-serif" font-size="26" fill="currentColor" letter-spacing="2">' + B.esc(code.toUpperCase()) + "</text></svg>";
  }

  // ===================== language: the customs register =====================
  var LIMIT = 22;
  function language() {
    var code = B.param("code") || "it";
    B.language(code).then(function (d) {
      var l = d.lang, L = d.L;
      document.title = l.name + " — customs register — lexodus (passport draft)";
      el("lang").textContent = l.name;
      el("facts").innerHTML = l.target
        ? B.n(l.lemmas) + " entries in English Wiktionary, " + Math.round(l.pct) + "% with an etymology; coverage " + B.esc(l.coverage) + ". A snapshot of Wiktionary, not of the whole vocabulary."
        : "Not one of the 33 languages read here: only the words it gave are known.";
      el("jump").innerHTML = '<option value="">Another register…</option>' + L.list.slice().sort(function (a, b) { return a.name.localeCompare(b.name); })
        .map(function (t) { return '<option value="' + t.code + '"' + (t.code === code ? " selected" : "") + ">" + B.esc(t.name) + "</option>"; }).join("");
      el("jump").onchange = function () { if (this.value) location.href = B.langUrl(this.value); };
      el("officer").innerHTML = stamp({ shape: "circle", ink: "var(--red)", top: "Customs · " + l.name, word: "CHECKED", bottom: "lexodus · Wiktionary", size: 150, href: "#", title: "" })
        .replace(/^<a [^>]*>|<\/a>$/g, "");
      function folio(side, list, total) {
        var shown = list.length > LIMIT + 3 ? LIMIT : list.length;
        function rows(k) {
          return list.slice(0, k).map(function (r, i) {
            var goods = r.ex.slice(0, 4).map(function (w) {
              var href = side === "from" ? B.wordUrl(code, w, 1, r.code) : B.wordUrl(r.code, w, 1, code);
              return '<a href="' + B.esc(href) + '">' + B.esc(w) + "</a>";
            }).join(", ");
            return "<tr><td class=\"no\">" + (i + 1) + '</td><td class="who hand"><a href="' + B.langUrl(r.code) + '">' + B.esc(r.name) + "</a></td>" +
              '<td class="num hand">' + B.n(r.n) + '</td><td class="goods">' + goods + "</td></tr>";
          }).join("");
        }
        var body = el(side + "-body");
        body.innerHTML = rows(shown) + '<tr class="total"><td class="no"></td><td>Total, ' + list.length + " languages</td><td class=\"num\">" + B.n(total) + "</td><td></td></tr>";
        var btn = el(side + "-more");
        btn.hidden = shown >= list.length;
        btn.textContent = "Turn the page: all " + list.length;
        btn.onclick = function () { body.innerHTML = rows(list.length) + body.lastElementChild.outerHTML; btn.hidden = true; };
      }
      el("from-folio").hidden = !l.target;
      if (l.target) folio("from", d.from, d.fromTotal);
      folio("to", d.to, d.toTotal);
      el("loading").hidden = true; el("app").hidden = false;
      return l.target ? B.extra(code) : null;
    }).then(function (x) {
      var list = x && x.piu_viaggiate ? x.piu_viaggiate.lista || [] : [];
      if (list.length) {
        el("travellers").innerHTML = list.map(function (w) {
          var cat = w.catena || [];
          var route = cat.slice().reverse().map(function (s) { return B.esc(s.nome || s.codice); }).join(" → ");
          var href = B.wordUrl(code, w.parola, w.n_etimologia, cat[0] && cat[0].codice);
          return '<li><a class="hand" href="' + B.esc(href) + '">' + B.esc(w.parola) + '</a> <span class="goods">' + route + "</span></li>";
        }).join("");
        el("travel-block").hidden = false;
      }
      ready();
    }).catch(fail);
  }

  // ===================== word: the passport =====================
  function ascii(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, "<"); }
  function pad(s, k) { s = s.slice(0, k); while (s.length < k) s += "<"; return s; }
  function word() {
    var lang = B.param("lang") || "it", w = B.param("w") || "caffè", ne = +B.param("n") || 1, from = B.param("from") || "";
    B.word(lang, w, ne, from).then(function (r) {
      var L = r.L, p = r.p;
      if (!p) {
        el("loading").innerHTML = "No passport for “" + B.esc(w) + "”: it is not in the lists of words. <a href=\"" + B.wiktUrl(w, B.nameOf(L, lang)) + "\">Look it up on Wiktionary</a>.";
        return ready();
      }
      var stops = B.journey(L, lang, p), origin = stops[0], here = stops[stops.length - 1];
      document.title = p.parola + " — passport — lexodus (passport draft)";
      el("w-big").textContent = p.parola;
      el("w-ghost").textContent = Array.from(p.parola)[0] || "";
      function field(lab, val, normal) { return '<div class="field"><span class="lab">' + lab + '</span><span class="val' + (normal ? " normal" : "") + '">' + val + "</span></div>"; }
      var fields = [
        field("Name / Nom", B.esc(p.parola) + B.trSpan(p.traslitterazione, p.parola)),
        field("Nationality", '<a href="' + B.langUrl(lang) + '">' + B.esc(B.nameOf(L, lang)) + "</a>"),
        field("Occupation (meaning)", p.significato ? "“" + B.esc(p.significato) + "”" : "not given", true),
        field("Place of birth", stops.length > 1 ? B.esc(origin.name) + " <span class=\"normal\">" + B.esc(origin.term) + "</span>" + (origin.tr ? " (" + B.esc(origin.tr) + ")" : "") : "unknown"),
        field("Arrived from", (p.catena || []).length ? B.esc(B.nameOf(L, p.catena[0].codice)) + " · " + B.esc(B.CATS[p.categoria] || "") : "—"),
        field("Languages crossed", String(stops.length))
      ];
      el("fields").innerHTML = fields.join("");
      el("remarks").innerHTML = '<span class="lab">Remarks (Wiktionary)</span><p>' + B.esc(r.text || "No etymology text.") + (r.text && r.text.length >= 300 ? "…" : "") +
        ' <a href="' + B.wiktUrl(p.parola, B.nameOf(L, lang)) + '">entry</a></p>';
      el("passno").textContent = "No. " + lang.toUpperCase() + "-" + String(Math.floor(hash(p.parola) * 9e6) + 1e6);
      var l1 = pad("P<" + pad(lang.toUpperCase(), 3) + ascii(p.parola) + "<<" + ascii(p.significato || ""), 44);
      var l2 = pad(stops.map(function (s) { return ascii(s.code) + "<" + ascii(s.tr || s.term); }).join("<"), 44);
      el("mrz").textContent = l1 + "\n" + l2;

      // entry stamps: one per language crossed; ink = how the word entered that language
      var stampsHtml = stops.map(function (s, i) {
        var cat = i === 0 ? "origin" : (p.catena && stops[i - 1] ? catOfEntry(p, stops, i) : "prestito");
        return stamp({ shape: SHAPE[s.fam], ink: INK[cat], top: s.name, word: s.term || "—", tr: s.tr, size: i === stops.length - 1 ? 220 : 200,
          bottom: i === 0 ? "Origin" : "Entry · " + INK_NAME[cat], href: B.langUrl(s.code),
          title: s.name + (s.term ? " " + s.term : "") + (i === 0 ? ": furthest origin" : ": entered as " + INK_NAME[cat]) });
      });
      el("entry-stamps").innerHTML = stampsHtml.join("");

      // onward visas: the languages that took the word afterwards (the tree, all levels)
      var giu = r.tree && r.tree.e ? r.tree.e.giu || [] : [];
      var flat = [];
      (function walk(list, parent) {
        list.forEach(function (g) { flat.push({ g: g, parent: parent }); walk(g.giu || [], g); });
      })(giu, null);
      var cap = 30;
      el("visa-stamps").innerHTML = flat.slice(0, cap).map(function (x) {
        var g = x.g, via = x.parent ? B.nameOf(L, x.parent.lingua) : B.nameOf(L, lang);
        return stamp({ shape: SHAPE[B.family(g.lingua)], ink: INK[g.categoria] || INK.prestito, top: B.nameOf(L, g.lingua), word: g.parola,
          tr: g.traslitterazione, size: 160, bottom: "from " + via,
          href: B.wordUrl(g.lingua, g.parola, g.n_etimologia, x.parent ? x.parent.lingua : lang),
          title: B.nameOf(L, g.lingua) + " " + g.parola + ", " + (B.CATS[g.categoria] || "") + " from " + via + (g.significato ? ": " + g.significato : "") });
      }).join("");
      el("visa-note").textContent = flat.length
        ? flat.length + (flat.length === 1 ? " word" : " words") + " of the 33 languages took it afterwards" + (flat.length > cap ? " (the first " + cap + " shown)" : "") + ". Each stamp opens that word's own passport."
        : "No word of the 33 languages took it afterwards, as far as Wiktionary says.";
      el("visas").hidden = false;
      var used = {};
      stops.forEach(function (s, i) { used[i === 0 ? "origin" : catOfEntry(p, stops, i)] = 1; });
      flat.forEach(function (x) { used[x.g.categoria] = 1; });
      el("inks").innerHTML = Object.keys(INK).filter(function (k) { return used[k]; }).map(function (k) {
        return '<li><i style="background:' + INK[k] + '"></i>' + INK_NAME[k] + "</li>";
      }).join("") + "<li>shape of the stamp = family of the language</li>";
      el("loading").hidden = true; el("app").hidden = false;
      ready();
    }).catch(fail);
  }
  // category of the passage into stop i (i >= 1): the categoria of the step above it in the chain
  function catOfEntry(p, stops, i) {
    var cat = p.catena || [];
    // stops: [origin = cat[last], ..., cat[0], word]; stop i corresponds to cat[cat.length - i] for i < stops.length - 1
    var above = cat[cat.length - i];
    return (above && above.categoria) || p.categoria || "prestito";
  }

  inkDefs();
  if (page === "home") home();
  else if (page === "language") language();
  else if (page === "word") word();
})();
