/* lexodus, draft "mercato": home (warehouse of crates), language (IMPORT / EXPORT), word (shipping tag and bill of lading). */
(function () {
  "use strict";
  var B = window.B;
  function el(id) { return document.getElementById(id); }
  var page = document.body.dataset.page;
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; }
  function rot(key, k) { return ((hash(key) - 0.5) * (k || 8)).toFixed(1) + "deg"; }
  function fail(e) { el("loading").textContent = "The data could not be loaded (" + e.message + ")."; console.error(e); }
  function ready() { document.body.dataset.ready = "1"; }
  function tag(href, word, fields, key) {
    return '<div class="hang"><span class="string"></span><a class="tag" href="' + B.esc(href) + '" style="--r:' + rot(key || word) + '">' +
      '<span class="w">' + B.esc(word) + "</span>" + fields.map(function (f) { return '<span class="f">' + f[0] + ": <b>" + B.esc(f[1]) + "</b></span>"; }).join("") + "</a></div>";
  }

  // ===================== home: the warehouse =====================
  function home() {
    B.langs().then(function (L) {
      var list = L.list.slice().sort(function (a, b) { return (b.took + b.gave) - (a.took + a.gave); });
      el("warehouse").innerHTML = list.map(function (l) {
        var vol = l.took + l.gave, size = vol > 30000 ? "big" : vol > 12000 ? "mid" : "";
        return '<li class="' + size + '"><a class="crate ' + size + '" href="' + B.langUrl(l.code) + '">' +
          '<span class="code">' + B.esc(l.code.toUpperCase()) + '</span><span class="nm">' + B.esc(l.name) + "</span>" +
          '<span class="qty">IN ' + B.n(l.took) + " · OUT " + B.n(l.gave) + "</span>" +
          (l.code === "ro" ? '<span class="fragile">Handle with care</span>' : "") + "</a></li>";
      }).join("");
      el("loading").hidden = true; el("app").hidden = false;
      ready();
    }).catch(fail);
  }

  // ===================== language: import / export =====================
  var LIMIT = 10;
  function language() {
    var code = B.param("code") || "it";
    B.language(code).then(function (d) {
      var l = d.lang, L = d.L;
      document.title = l.name + " — import / export — lexodus (market draft)";
      el("lang").textContent = l.name;
      el("facts").textContent = l.target
        ? B.n(l.lemmas) + " entries in English Wiktionary, " + Math.round(l.pct) + "% with an etymology. Prices are numbers of words, as recorded in Wiktionary."
        : "Not one of the 33 languages read here: only its exports are known.";
      el("jump").innerHTML = '<option value="">Another market…</option>' + L.list.slice().sort(function (a, b) { return a.name.localeCompare(b.name); })
        .map(function (t) { return '<option value="' + t.code + '"' + (t.code === code ? " selected" : "") + ">" + B.esc(t.name) + "</option>"; }).join("");
      el("jump").onchange = function () { if (this.value) location.href = B.langUrl(this.value); };
      function side(s, rows, total) {
        el(s + "-sum").textContent = B.n(total) + " words, " + rows.length + " partners";
        function html(k) {
          return rows.slice(0, k).map(function (r) {
            var tags = r.ex.slice(0, 4).map(function (w) {
              var href = s === "from" ? B.wordUrl(code, w, 1, r.code) : B.wordUrl(r.code, w, 1, code);
              return tag(href, w, s === "from" ? [["from", r.name]] : [["to", r.name]], r.code + w);
            }).join("");
            return '<li class="lot"><a class="crate" href="' + B.langUrl(r.code) + '"><span class="nm">' + (s === "from" ? "from " : "to ") + B.esc(r.name) + "</span>" +
              '<span class="price">' + B.n(r.n) + "<small>words</small></span></a>" + '<div class="tags">' + tags + "</div></li>";
          }).join("");
        }
        el(s + "-list").innerHTML = html(LIMIT);
        var b = el(s + "-more");
        b.hidden = rows.length <= LIMIT;
        b.textContent = "Unload all " + rows.length;
        b.onclick = function () { el(s + "-list").innerHTML = html(rows.length); b.hidden = true; };
      }
      el("from-side").hidden = !l.target;
      if (l.target) side("from", d.from, d.fromTotal);
      side("to", d.to, d.toTotal);
      el("loading").hidden = true; el("app").hidden = false;
      ready();
    }).catch(fail);
  }

  // ===================== word: the tag and the bill of lading =====================
  function word() {
    var lang = B.param("lang") || "it", w = B.param("w") || "caffè", ne = +B.param("n") || 1, from = B.param("from") || "";
    B.word(lang, w, ne, from).then(function (r) {
      var L = r.L, p = r.p;
      if (!p) {
        el("loading").innerHTML = "No shipment found for “" + B.esc(w) + "”. <a href=\"" + B.wiktUrl(w, B.nameOf(L, lang)) + "\">Wiktionary</a>.";
        return ready();
      }
      var stops = B.journey(L, lang, p), origin = stops[0], via = stops.slice(1, -1);
      document.title = p.parola + " — shipping tag — lexodus (market draft)";
      el("bigtag").innerHTML = '<span class="string"></span><div class="tag"><span class="w">' + B.esc(p.parola) + "</span>" +
        '<span class="f">from: <b>' + (stops.length > 1 ? B.esc(origin.name) : "unknown") + "</b>" + (stops.length > 1 ? '<span class="tr">' + B.esc(origin.term) + (origin.tr ? " · " + B.esc(origin.tr) : "") + "</span>" : "") + "</span>" +
        '<span class="f">to: <b>' + B.esc(B.nameOf(L, lang)) + "</b></span>" +
        '<span class="f">via: <b>' + (via.length ? via.map(function (s) { return B.esc(s.name); }).join(", ") : "direct") + "</b>" +
        (via.length ? '<span class="tr">' + via.map(function (s) { return B.esc(s.term) + (s.tr ? " · " + B.esc(s.tr) : ""); }).join(", ") + "</span>" : "") + "</span>" +
        '<span class="f">contents: <b>' + (p.significato ? B.esc(p.significato) : "not declared") + "</b></span></div>";
      var legs = "";
      for (var i = 1; i < stops.length; i++) {
        var a = stops[i - 1], b = stops[i];
        legs += "<tr><td>" + i + '</td><td><a href="' + B.langUrl(a.code) + '">' + B.esc(a.name) + '</a></td><td><a href="' + B.langUrl(b.code) + '">' + B.esc(b.name) + "</a></td>" +
          '<td class="m">' + B.esc(b.term) + (b.tr && b.tr !== b.term ? " (" + B.esc(b.tr) + ")" : "") + "</td><td>" + B.esc(a.how || "") + "</td></tr>";
      }
      el("legs").innerHTML = legs || '<tr><td colspan="5">No earlier leg recorded.</td></tr>';
      el("ety").textContent = "Remarks (Wiktionary): " + (r.text || "none.") + (r.text && r.text.length >= 300 ? "…" : "");
      el("wikt").href = B.wiktUrl(p.parola, B.nameOf(L, lang));
      var giu = r.tree && r.tree.e ? r.tree.e.giu || [] : [];
      var flat = [];
      (function walk(list, parent) { list.forEach(function (g) { flat.push({ g: g, parent: parent }); walk(g.giu || [], g.lingua); }); })(giu, lang);
      var cap = 24;
      el("clothes").innerHTML = flat.slice(0, cap).map(function (x) {
        var g = x.g;
        return tag(B.wordUrl(g.lingua, g.parola, g.n_etimologia, x.parent), g.parola + (g.traslitterazione && g.traslitterazione !== g.parola ? " · " + g.traslitterazione : ""),
          [["to", B.nameOf(L, g.lingua)], ["from", B.nameOf(L, x.parent)]], g.lingua + g.parola);
      }).join("");
      el("re-sum").textContent = flat.length ? B.n(flat.length) + " parcels re-exported to other languages" + (flat.length > cap ? " (first " + cap + " on the line)" : "") + "." : "Not re-exported: no word of the 33 languages took it, as far as Wiktionary says.";
      el("loading").hidden = true; el("app").hidden = false;
      ready();
    }).catch(fail);
  }

  if (page === "home") home();
  else if (page === "language") language();
  else word();
})();
