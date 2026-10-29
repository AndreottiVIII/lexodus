/* lexodus, draft "tavola": home (periodic table), language (element sheet), word (formula). */
(function () {
  "use strict";
  var B = window.B;
  function el(id) { return document.getElementById(id); }
  var page = document.body.dataset.page;
  // groups of the table, left to right: tall columns at the sides, short ones in the middle, as on the wall chart
  var GROUPS = ["germanic", "romance", "baltic", "turkic", "uralic", "semitic", "other", "slavic"];
  var GROUP_NAME = { germanic: "Germanic", romance: "Romance", baltic: "Baltic", turkic: "Turkic", uralic: "Finno-Ugric",
    semitic: "Semitic", other: "Greek, Albanian, Iranian", slavic: "Slavic", world: "Rest of the world" };
  function famVar(f) { return "var(--f-" + (f || "world") + ")"; }
  // chemistry-style symbol: It, Fr, Ota, Grc; proto-languages get a star (Ine*)
  function sym(code) {
    code = B.merged(code);
    var parts = String(code).split("-"), s = parts[0];
    s = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    return s + (/-pro$/.test(code) ? "*" : "");
  }
  function mini(code, href, title) {
    return '<a class="mini" href="' + B.esc(href || B.langUrl(code)) + '" style="--fam:' + famVar(B.family(code)) + '" title="' + B.esc(title || "") + '">' + B.esc(sym(code)) + "</a>";
  }
  function tile(l, extra) {
    return '<a class="tile" href="' + B.langUrl(l.code) + '" style="--fam:' + famVar(l.fam) + '" title="' + B.esc(l.name) + '">' +
      '<span class="z">' + B.n(l.lemmas) + '</span><span class="s">' + B.esc(sym(l.code)) + '</span><span class="nm">' + B.esc(l.name) + "</span>" +
      '<span class="m">' + (extra || B.n(l.took) + " ← · → " + B.n(l.gave)) + "</span></a>";
  }
  function fail(e) { el("loading").textContent = "The data could not be loaded (" + e.message + ")."; console.error(e); }
  function ready() { document.body.dataset.ready = "1"; }

  // formula: tiles joined by arrows, words under the tiles
  function formula(stops, opts) {
    opts = opts || {};
    return stops.map(function (s, i) {
      var t = '<span class="fx" title="' + B.esc(s.name + (s.term ? " " + s.term : "")) + '">' + mini(s.code, s.href, s.name) + "</span>";
      return (i ? '<span class="arrow" aria-label="then">→</span>' : "") + t;
    }).join("");
  }

  // ===================== home =====================
  function home() {
    Promise.all([B.langs(), Promise.resolve(window.LEXODUS.archi)]).then(function (res) {
      var L = res[0];
      el("table").insertAdjacentHTML("afterbegin", GROUPS.map(function (g, gi) {
        var list = L.list.filter(function (l) { return l.fam === g; }).sort(function (a, b) { return b.lemmas - a.lemmas; });
        return '<section class="group" aria-label="' + GROUP_NAME[g] + '"><h2><span class="gno">' + (gi + 1) + "</span>" + GROUP_NAME[g] + "</h2>" +
          list.map(function (l) { return tile(l); }).join("") + "</section>";
      }).join(""));
      // the detached rows: donors that are not among the 33 (like the lanthanides under the chart)
      var tot = {};
      res[1].archi.forEach(function (a) {
        if (["prestito", "latinismo_dotto", "calco"].indexOf(a.categoria) < 0) return;
        var o = B.merged(a.origine);
        if (L.targets.indexOf(o) >= 0 || (a.tipo_lingua_origine && a.tipo_lingua_origine !== "lingua")) return;
        tot[o] = (tot[o] || 0) + a.n_parole;
      });
      var donors = Object.keys(tot).sort(function (a, b) { return tot[b] - tot[a]; }).slice(0, 18);
      el("donors").innerHTML = donors.map(function (c) {
        var l = { code: c, name: B.nameOf(L, c), fam: B.family(c), lemmas: tot[c] };
        return tile(l, "outside the 33");
      }).join("");
      el("loading").hidden = true; el("app").hidden = false;
      ready();
    }).catch(fail);
  }

  // ===================== language: element sheet =====================
  var LIMIT = 18;
  function language() {
    var code = B.param("code") || "it";
    B.language(code).then(function (d) {
      var l = d.lang, L = d.L;
      document.title = l.name + " — element sheet — lexodus (periodic table draft)";
      el("element-tile").outerHTML = l.target ? tile(l) : '<a class="tile" style="--fam:' + famVar(l.fam) + '"><span class="z">—</span><span class="s">' + B.esc(sym(code)) + '</span><span class="nm">' + B.esc(l.name) + '</span><span class="m">outside the 33</span></a>';
      var props = l.target ? [
        ["Group", GROUP_NAME[l.fam]],
        ["Entries in Wiktionary", B.n(l.lemmas)],
        ["With an etymology", Math.round(l.pct) + "%"],
        ["Words taken (←)", B.n(l.took)],
        ["Words given (→)", B.n(l.gave)],
        ["Languages it took from", B.n(d.from.length)],
        ["Languages that took from it", B.n(d.to.length)],
        ["Coverage", l.coverage]
      ] : [["Group", GROUP_NAME[l.fam] || "—"], ["Languages that took from it", B.n(d.to.length)], ["Words given (→)", B.n(d.toTotal)]];
      el("props").innerHTML = props.map(function (p) { return "<dt>" + p[0] + "</dt><dd>" + B.esc(p[1]) + "</dd>"; }).join("");
      el("jump").innerHTML = '<option value="">Another element…</option>' + L.list.slice().sort(function (a, b) { return a.name.localeCompare(b.name); })
        .map(function (t) { return '<option value="' + t.code + '"' + (t.code === code ? " selected" : "") + ">" + B.esc(sym(t.code) + " — " + t.name) + "</option>"; }).join("");
      el("jump").onchange = function () { if (this.value) location.href = B.langUrl(this.value); };
      function list(side, rows, total) {
        var max = rows.length ? rows[0].n : 1;
        function html(k) {
          return rows.slice(0, k).map(function (r) {
            var ex = r.ex.slice(0, 5).map(function (w) {
              var href = side === "from" ? B.wordUrl(code, w, 1, r.code) : B.wordUrl(r.code, w, 1, code);
              return '<a href="' + B.esc(href) + '">' + B.esc(w) + "</a>";
            }).join(", ");
            return "<li>" + mini(r.code, B.langUrl(r.code), r.name) + '<div><div class="top"><a href="' + B.langUrl(r.code) + '">' + B.esc(r.name) + '</a><span class="num">' + B.n(r.n) + "</span></div>" +
              '<div class="bar"><span style="width:' + Math.max(0.6, 100 * r.n / max).toFixed(1) + '%"></span></div><div class="ex">' + ex + "</div></div></li>";
          }).join("");
        }
        el(side + "-sum").textContent = rows.length ? B.n(total) + " words, " + rows.length + " languages" : "None recorded.";
        el(side + "-list").innerHTML = html(LIMIT);
        var b = el(side + "-more");
        b.hidden = rows.length <= LIMIT;
        b.textContent = "All " + rows.length;
        b.onclick = function () { el(side + "-list").innerHTML = html(rows.length); b.hidden = true; };
      }
      el("from-col").hidden = !l.target;
      if (l.target) list("from", d.from, d.fromTotal);
      list("to", d.to, d.toTotal);
      el("loading").hidden = true; el("app").hidden = false;
      return l.target ? Promise.all([B.extra(code), Promise.resolve(L)]) : null;
    }).then(function (res) {
      var x = res && res[0], L = res && res[1];
      var lst = x && x.piu_viaggiate ? x.piu_viaggiate.lista || [] : [];
      if (lst.length) {
        el("formulas").innerHTML = lst.map(function (w) {
          var cat = w.catena || [], stops = [];
          for (var i = cat.length - 1; i >= 0; i--) stops.push({ code: cat[i].codice, name: B.nameOf(L, cat[i].codice), term: cat[i].termine });
          stops.push({ code: code, name: B.nameOf(L, code), term: w.parola });
          return '<li><a class="wd" href="' + B.esc(B.wordUrl(code, w.parola, w.n_etimologia, cat[0] && cat[0].codice)) + '">' + B.esc(w.parola) + "</a> = " + formula(stops) + "</li>";
        }).join("");
        el("formula-block").hidden = false;
      }
      ready();
    }).catch(fail);
  }

  // ===================== word: the reaction =====================
  function word() {
    var lang = B.param("lang") || "it", w = B.param("w") || "caffè", ne = +B.param("n") || 1, from = B.param("from") || "";
    B.word(lang, w, ne, from).then(function (r) {
      var L = r.L, p = r.p;
      if (!p) {
        el("loading").innerHTML = "“" + B.esc(w) + "” is not in the lists of words. <a href=\"" + B.wiktUrl(w, B.nameOf(L, lang)) + "\">Wiktionary</a>.";
        return ready();
      }
      var stops = B.journey(L, lang, p);
      document.title = p.parola + " = " + stops.map(function (s) { return sym(s.code); }).join(" → ") + " — lexodus (periodic table draft)";
      el("w").innerHTML = B.esc(p.parola);
      el("compact").innerHTML = stops.map(function (s) { return B.esc(sym(s.code)); }).join(" → ");
      el("meta").innerHTML = '<a href="' + B.langUrl(lang) + '">' + B.esc(B.nameOf(L, lang)) + "</a>" + (p.pos ? " · " + B.esc(p.pos) : "") +
        (p.significato ? " · “" + B.esc(p.significato) + "”" : "") + " · " + stops.length + " languages";
      var html = "";
      stops.forEach(function (s, i) {
        var l = L.by[B.merged(s.code)] || { code: s.code, name: s.name, fam: s.fam };
        if (i) {
          var prev = stops[i - 1];
          html += '<div class="cond" aria-hidden="false"><span class="lab">' + B.esc(prev.how || "—") + '</span><span class="ar"></span><span class="under">' + B.esc(sym(prev.code)) + " → " + B.esc(sym(s.code)) + "</span></div>";
        }
        var t = l.target ? tile(l) : '<a class="tile" href="' + B.langUrl(s.code) + '" style="--fam:' + famVar(s.fam) + '"><span class="z">&nbsp;</span><span class="s">' + B.esc(sym(s.code)) + '</span><span class="nm">' + B.esc(s.name) + '</span><span class="m">outside the 33</span></a>';
        html += '<div class="reagent">' + t + '<span class="term">' + B.esc(s.term || "—") + (s.tr && s.tr !== s.term ? '<span class="tr">' + B.esc(s.tr) + "</span>" : "") + "</span></div>";
      });
      el("reaction").innerHTML = html;
      el("ety").textContent = (r.text || "No etymology text.") + (r.text && r.text.length >= 300 ? "…" : "");
      el("wikt").href = B.wiktUrl(p.parola, B.nameOf(L, lang));
      // products: every path down the tree, as a formula from this word
      var giu = r.tree && r.tree.e ? r.tree.e.giu || [] : [];
      var lines = [];
      (function walk(list, path) {
        list.forEach(function (g) {
          var here = path.concat([{ code: g.lingua, name: B.nameOf(L, g.lingua), term: g.parola, tr: g.traslitterazione, how: B.CATS[g.categoria], n: g.n_etimologia, parent: path[path.length - 1].code }]);
          if (!(g.giu || []).length) lines.push(here); else walk(g.giu, here);
        });
      })(giu, [{ code: lang, name: B.nameOf(L, lang), term: p.parola }]);
      el("products").innerHTML = lines.length ? lines.map(function (path) {
        return "<li>" + path.map(function (s, i) {
          var href = i ? B.wordUrl(s.code, s.term, s.n, s.parent) : "#";
          return (i ? '<span class="arrow" title="' + B.esc(s.how || "") + '">→</span>' : "") +
            '<a class="chip" href="' + B.esc(href) + '" title="' + B.esc(s.name + (s.how ? ", " + s.how : "")) + '"><span class="mini" style="--fam:' + famVar(B.family(s.code)) + '">' + B.esc(sym(s.code)) + '</span><span class="w">' + B.esc(s.term) + (s.tr && s.tr !== s.term ? " <i>" + B.esc(s.tr) + "</i>" : "") + "</span></a>";
        }).join("") + "</li>";
      }).join("") : '<li class="note">No word of the 33 languages took it afterwards, as far as Wiktionary says.</li>';
      el("products-sum").textContent = lines.length ? B.count(giu) + " words in " + lines.length + " chains" : "";
      el("loading").hidden = true; el("app").hidden = false;
      ready();
    }).catch(fail);
  }

  if (page === "home") home();
  else if (page === "language") language();
  else word();
})();
