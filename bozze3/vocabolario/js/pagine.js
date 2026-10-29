/* lexodus, draft "vocabolario" (a page of a historical dictionary): home (title page, index of the tongues,
   abbreviations), language (the entry of the tongue among its neighbours), word (the full entry of caffè among the
   entries next to it in the same letter). */
(function () {
  "use strict";
  var B = window.B;
  function el(id) { return document.getElementById(id); }
  var page = document.body.dataset.page;
  var ABBR = {
    ar: "Ar.", ota: "Ott. Turk.", tr: "Turk.", fa: "Pers.", he: "Heb.", mt: "Malt.", it: "It.", fr: "F.", fro: "OF.", frm: "MF.",
    en: "E.", enm: "ME.", ang: "OE.", de: "G.", gmh: "MHG.", goh: "OHG.", nl: "Du.", dum: "MDu.", la: "L.", grc: "Gk.", el: "Mod. Gk.",
    gkm: "Byz. Gk.", es: "Sp.", osp: "OSp.", pt: "Pg.", ca: "Cat.", ro: "Rum.", pro: "Prov.", oc: "Occ.", vec: "Venet.", scn: "Sicil.",
    nap: "Neap.", lmo: "Lomb.", lij: "Lig.", pms: "Piedm.", lng: "Langob.", ru: "Russ.", uk: "Ukr.", pl: "Pol.", cs: "Cz.", sk: "Slovak",
    sl: "Slovene", sh: "Serbo-Cr.", bg: "Bulg.", sv: "Sw.", da: "Da.", nb: "Norw.", is: "Icel.", non: "ON.", fi: "Finn.", et: "Est.",
    hu: "Hung.", lv: "Latv.", lt: "Lith.", sq: "Alb.", ja: "Jap.", sa: "Skr.", hi: "Hindi", zh: "Chin.", cu: "OCS."
  };
  var HOW = { borrowed: "a.", "learned Latin": "ad.", calque: "transl.", inherited: "f.", unspecified: "cf." };
  var FAM_ADJ = { romance: "Romance", germanic: "Germanic", slavic: "Slavic", baltic: "Baltic", uralic: "Finno-Ugric",
    semitic: "Semitic", turkic: "Turkic", other: "Indo-European", world: "" };
  function ab(code) { var c = B.merged(code); return ABBR[c] || null; }
  function abName(L, code) { return ab(code) || B.nameOf(L, code); }
  function fail(e) { el("loading").textContent = "The page is torn: the data could not be loaded (" + e.message + ")."; console.error(e); }
  function ready() { document.body.dataset.ready = "1"; }
  function show() { el("loading").hidden = true; el("app").hidden = false; }
  function pages(L) {
    var f = {};
    L.list.slice().sort(function (a, b) { return a.name.localeCompare(b.name); }).forEach(function (l, i) { f[l.code] = 412 + i * 37; });
    return f;
  }
  function t(term, tr) { return "<i>" + B.esc(term || "—") + "</i>" + (tr && tr !== term ? " (" + B.esc(tr) + ")" : ""); }

  // ===================== home: title page, index, abbreviations =====================
  function home() {
    B.langs().then(function (L) {
      var p = pages(L);
      el("index").innerHTML = L.list.slice().sort(function (a, b) { return a.name.localeCompare(b.name); }).map(function (l) {
        return '<li><a href="' + B.langUrl(l.code) + '"><span class="lm">' + B.esc(l.name) + '</span><span class="dots"></span><span class="pg">' + p[l.code] + "</span></a></li>";
      }).join("");
      var used = {};
      Object.keys(ABBR).forEach(function (c) { used[ABBR[c]] = B.nameOf(L, c); });
      var rows = Object.keys(used).sort(function (a, b) { return a.localeCompare(b); }).map(function (k) { return "<div><dt>" + B.esc(k) + "</dt><dd>" + B.esc(used[k]) + "</dd></div>"; });
      rows = rows.concat([["a.", "adopted from (borrowed)"], ["ad.", "adapted from (learned Latin)"], ["transl.", "translated from (calque)"], ["cf.", "compare"], ["v.", "see"], ["§", "paragraph"]]
        .map(function (r) { return '<div class="gen"><dt>' + r[0] + "</dt><dd>" + r[1] + "</dd></div>"; }));
      el("abbr").innerHTML = rows.join("");
      show(); ready();
    }).catch(fail);
  }

  // ===================== language: the entry of the tongue =====================
  function language() {
    var code = B.param("code") || "it";
    Promise.all([B.language(code), B.langs()]).then(function (res) {
      var d = res[0], l = d.lang, L = res[1], p = pages(L);
      document.title = l.name.toUpperCase() + " — lexodus (dictionary draft)";
      var order = L.list.slice().sort(function (a, b) { return a.name.localeCompare(b.name); });
      var i = order.map(function (x) { return x.code; }).indexOf(code);
      var before = i >= 0 ? order.slice(Math.max(0, i - 2), i) : [], after = i >= 0 ? order.slice(i + 1, i + 3) : [];
      function short(x) {
        return '<p class="entry short"><a class="lemma" href="' + B.langUrl(x.code) + '">' + B.esc(x.name) + "</a> (" + B.esc(ab(x.code) || x.code) + "), <i>n.</i> A " +
          B.esc(FAM_ADJ[x.fam] || "") + " tongue, which took " + B.n(x.took) + " words and gave " + B.n(x.gave) + ". <span class=\"vv\">v.</span> p. " + p[x.code] + ".</p>";
      }
      function list(rows, k) {
        return rows.slice(0, k).map(function (r) {
          var ex = r.ex.slice(0, 3).map(function (w) { return "<i>" + B.esc(w) + "</i>"; }).join(", ");
          return '<a href="' + B.langUrl(r.code) + '">' + B.esc(abName(L, r.code)) + "</a> " + B.n(r.n) + (ex ? " (" + ex + ")" : "");
        }).join("; ");
      }
      function cats(rows) {
        var c = {};
        rows.forEach(function (r) { Object.keys(r.cats).forEach(function (k) { c[k] = (c[k] || 0) + r.cats[k]; }); });
        return Object.keys(c).sort(function (a, b) { return c[b] - c[a]; }).map(function (k) { return B.n(c[k]) + " " + B.CATS[k]; }).join(", ");
      }
      var html = before.map(short).join("");
      html += '<div class="entry full"><p><b class="lemma big">' + B.esc(l.name) + "</b> (" + B.esc(ab(code) || code) + "), <i>n.</i> " +
        (l.target ? "The " + B.esc(l.name) + " tongue, of the " + B.esc(FAM_ADJ[l.fam]) + " family; " + B.n(l.lemmas) + " entries in the Wiktionary, of which " + Math.round(l.pct) + " in the hundred bear an etymology. " : "A tongue outside the thirty-three. ") +
        '<span class="ety">[Name in the English Wiktionary; code <i>' + B.esc(code) + "</i>; coverage " + B.esc(l.coverage || "—") + ".]</span></p>";
      if (l.target) {
        html += '<p><span class="par">§ 1.</span> <i>Words taken.</i> ' + B.n(l.took) + " words from " + d.from.length + " tongues (" + cats(d.from) + "); chiefly from " + list(d.from, 14) +
          (d.from.length > 14 ? "; and from " + (d.from.length - 14) + " others, " + d.from.slice(14).map(function (r) { return '<a href="' + B.langUrl(r.code) + '">' + B.esc(abName(L, r.code)) + "</a> " + B.n(r.n); }).join(", ") : "") + ".</p>";
      }
      html += '<p><span class="par">§ ' + (l.target ? 2 : 1) + ".</span> <i>Words given.</i> " + B.n(l.target ? l.gave : d.toTotal) + " words to " + d.to.length + " of the thirty-three; " + list(d.to, d.to.length) + ".</p>";
      html += '<p id="far" class="far"></p>';
      html += '<p class="cfr"><i>Cf.</i> ' + d.from.slice(0, 4).concat(d.to.slice(0, 4)).filter(function (r, k, a) { return a.map(function (x) { return x.code; }).indexOf(r.code) === k; })
        .map(function (r) { return '<a class="sc" href="' + B.langUrl(r.code) + '">' + B.esc(r.name) + "</a>"; }).join(", ") + ".</p></div>";
      html += after.map(short).join("");
      el("entries").innerHTML = html;
      el("rh-l").textContent = (before[0] || l).name.toUpperCase();
      el("rh-c").textContent = p[code] || "";
      el("rh-r").textContent = (after[after.length - 1] || l).name.toUpperCase();
      el("jump").innerHTML = order.map(function (x) { return '<option value="' + x.code + '"' + (x.code === code ? " selected" : "") + ">" + B.esc(x.name) + ", p. " + p[x.code] + "</option>"; }).join("");
      el("jump").onchange = function () { if (this.value) location.href = B.langUrl(this.value); };
      show();
      return l.target ? B.extra(code).then(function (x) {
        var lst = x && x.piu_viaggiate ? x.piu_viaggiate.lista || [] : [];
        if (lst.length) el("far").innerHTML = '<span class="par">§ 3.</span> <i>Words that travelled furthest.</i> ' + lst.map(function (w) {
          var cat = w.catena || [];
          return '<a href="' + B.esc(B.wordUrl(code, w.parola, w.n_etimologia, cat[0] && cat[0].codice)) + '"><b>' + B.esc(w.parola) + "</b></a> " +
            '<span class="ety">[' + cat.map(function (c) { return B.esc(abName(L, c.codice)) + " <i>" + B.esc(c.termine || "") + "</i>"; }).join(", ") + "]</span>";
        }).join("; ") + ".";
        ready();
      }) : ready();
    }).catch(fail);
  }

  // ===================== word: the full entry =====================
  function bracket(L, su) {
    return (su || []).map(function (s, i) {
      var how = HOW[B.CATS[s.categoria]] || "f.";
      return (i ? ", " : "") + how + " " + B.esc(abName(L, s.codice)) + (s.termine ? " " + t(s.termine, s.traslitterazione) : "");
    }).join("").replace(/\.$/, "");
  }
  function word() {
    var lang = B.param("lang") || "it", w = B.param("w") || "caffè", ne = +B.param("n") || 1, from = B.param("from") || "";
    B.word(lang, w, ne, from).then(function (r) {
      var L = r.L, p = r.p;
      if (!p) {
        el("loading").innerHTML = "“" + B.esc(w) + "” is wanting in this dictionary. <a href=\"" + B.wiktUrl(w, B.nameOf(L, lang)) + "\">Wiktionary</a>.";
        return ready();
      }
      document.title = p.parola.toUpperCase() + " — lexodus (dictionary draft)";
      var su = p.catena || p.su || [], stops = B.journey(L, lang, p);
      var giu = r.tree && r.tree.e ? r.tree.e.giu || [] : [];
      // the entry
      var html = '<div class="entry full"><p><b class="lemma big">' + B.esc(p.parola) + "</b>" + (p.pos ? ", <i>" + B.esc(p.pos === "noun" ? "n." : p.pos === "verb" ? "v." : p.pos === "adj" ? "a." : p.pos) + "</i>" : "") +
        " (" + B.esc(abName(L, lang)) + ") " + (p.significato ? B.esc(p.significato) + ". " : "") + '<span class="ety">[' + bracket(L, su) + ".]</span></p>";
      html += '<p><span class="par">§ 1.</span> <i>Its journey.</i> ' + stops.map(function (s, i) {
        return (i ? " <span class=\"how\">" + B.esc(stops[i - 1].how || "") + "</span> → " : "") + '<a href="' + B.langUrl(s.code) + '">' + B.esc(abName(L, s.code)) + "</a> " + t(s.term, s.tr);
      }).join("") + "; " + stops.length + " tongues in all.</p>";
      if (r.text) html += '<p><span class="par">§ 2.</span> <i>The Wiktionary says:</i> “' + B.esc(r.text) + (r.text.length >= 300 ? "…" : "") + '” <a href="' + B.wiktUrl(p.parola, B.nameOf(L, lang)) + '">v. the entry</a>.</p>';
      if (giu.length) {
        var k = 0;
        var phrase = function (g, parent) {
          var kids = g.giu || [];
          return '<a href="' + B.esc(B.wordUrl(g.lingua, g.parola, g.n_etimologia, parent)) + '">' + B.esc(abName(L, g.lingua)) + " " + t(g.parola, g.traslitterazione) + "</a>" +
            (kids.length ? " (whence " + kids.map(function (y) { return phrase(y, g.lingua); }).join("; ") + ")" : "");
        };
        html += '<p><span class="par">§ ' + (r.text ? 3 : 2) + ".</span> <i>Taken by other tongues</i> (" + B.count(giu) + "): " + giu.map(function (g) {
          k++;
          return '<span class="num">' + k + ".</span> " + phrase(g, lang);
        }).join(" ") + ".</p>";
        var seen = {}, cf = [];
        (function walk(list, parent) { list.forEach(function (g) { var key = g.lingua + g.parola; if (!seen[key] && B.isLatinScript(g.parola) && g.parola !== p.parola) { seen[key] = 1; cf.push({ g: g, parent: parent }); } walk(g.giu || [], g.lingua); }); })(giu, lang);
        html += '<p class="cfr"><i>Cf.</i> ' + cf.slice(0, 6).map(function (c) { return '<a class="sc" href="' + B.esc(B.wordUrl(c.g.lingua, c.g.parola, c.g.n_etimologia, c.parent)) + '">' + B.esc(c.g.parola) + "</a>"; }).join(", ") + ".</p>";
      }
      html += "</div>";
      // neighbours: the entries before and after it in the same letter of the same tongue
      var before = "", after = "", first = p.parola, last = p.parola;
      if (r.tree && r.tree.file) {
        var keys = Object.keys(r.tree.file).sort(function (a, b) { return B.keyWord(a).localeCompare(B.keyWord(b), lang) || a.localeCompare(b); });
        var at = keys.indexOf(r.tree.key);
        var near = function (k) {
          var e = r.tree.file[k], word = B.keyWord(k);
          return '<p class="entry short"><a class="lemma" href="' + B.esc(B.wordUrl(lang, word, +k.slice(k.lastIndexOf("|") + 1), e.su && e.su[0] ? e.su[0].codice : "")) + '">' + B.esc(word) + "</a>" +
            (e.significato ? " " + B.esc(e.significato) + "." : "") + ((e.su || []).length ? ' <span class="ety">[' + bracket(L, e.su) + ".]</span>" : "") + "</p>";
        };
        if (at >= 0) {
          var bk = keys.slice(Math.max(0, at - 9), at), ak = keys.slice(at + 1, at + 23);
          before = bk.map(near).join(""); after = ak.map(near).join("");
          if (bk.length) first = B.keyWord(bk[0]);
          if (ak.length) last = B.keyWord(ak[ak.length - 1]);
        }
      }
      el("entries").innerHTML = before + html + after;
      el("rh-l").textContent = first.toUpperCase();
      el("rh-c").textContent = B.nameOf(L, lang).toUpperCase();
      el("rh-r").textContent = last.toUpperCase();
      show(); ready();
    }).catch(fail);
  }

  if (page === "index") home();
  else if (page === "language") language();
  else word();
})();
