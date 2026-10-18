/* lexodus — doublets.html: pairs of doublets of one language (doppioni/<code>.json, mandate 11):
   the two words side by side (transliteration, meaning, the way each came), the common origin, links to word pages and trees. */
(function () {
  "use strict";
  var L = window.Lex;
  var SHOW = 30;
  function el(id) { return document.getElementById(id); }
  function pick(o) { for (var i = 1; i < arguments.length; i++) if (o && o[arguments[i]] !== undefined && o[arguments[i]] !== null) return o[arguments[i]]; return undefined; }
  var nm, shown = SHOW, pairs = [], lang;

  function side(w, road) {
    var chain = w.catena || [];
    return '<div class="half">' +
      '<p class="big">' + L.wordPage(w, lang) + (w.categoria ? ' <span class="note">' + L.esc(L.catLabel(w.categoria)) + "</span>" : "") + "</p>" +
      (w.significato ? '<p class="mean">' + L.esc(w.significato) + "</p>" : "") +
      (chain.length ? '<p class="way">' + L.chainLine(chain, nm, { lang: lang, word: w.parola, t: w.traslitterazione }) + "</p>" :
        road ? '<p class="way note">from ' + L.esc(L.langName(nm, road)) + "</p>" : "") +
      '<p class="note"><a href="' + L.esc(L.treeUrl(lang, w.parola, w.n_etimologia || 1, w.traslitterazione)) + '">tree</a></p></div>';
  }
  function item(p) {
    var a = pick(p, "a", "parola_a") || {}, b = pick(p, "b", "parola_b") || {};
    var roads = pick(p, "strade") || [];
    var com = pick(p, "origine_comune");
    var c = com ? (typeof com === "string" ? L.esc(com) : L.esc(L.langName(nm, com.codice, com.nome_en || com.nome)) + (com.termine ? " <i>" + L.esc(com.termine) + "</i>" + L.tr(com.traslitterazione, com.termine) : "")) : "";
    return '<li class="pair"><div class="halves">' + side(a, roads[0]) + side(b, roads[1]) + "</div>" +
      (c ? '<p class="common">Common origin: ' + c + "</p>" : '<p class="common note">No common step written in Wiktionary.</p>') + "</li>";
  }
  // Best-known pairs first (Davide, 18/10/2026): both words short (at most 9 letters), without hyphens, with a
  // meaning, borrowed / learned Latin / calque, and two ways through different languages; then by number of
  // languages. Pairs where one way is an Italian dialect or regional language go to the end.
  var DIALECTS = ["scn", "nap", "vec", "lmo", "pms", "lij", "sc", "fur"];
  var TAKEN = ["prestito", "latinismo_dotto", "calco"];
  function dialect(c) { return DIALECTS.indexOf(c) >= 0 || /^roa-/.test(c || ""); }
  function known(w) {
    var p = String(w.parola || "");
    return p.length <= 9 && !/[-\s]/.test(p) && !!String(w.significato || "").trim() && TAKEN.indexOf(w.categoria) >= 0;
  }
  function langsOf(w) { return (w.catena || []).map(function (s) { return s.codice; }).sort().join("|"); }
  function rank(p) {
    var a = p.a || {}, b = p.b || {};
    var dial = (p.strade || []).some(dialect) ? 1 : 0;
    var top = known(a) && known(b) && langsOf(a) !== langsOf(b) ? 0 : 1;
    return [dial, top, -(p.n_lingue || 0)];
  }
  function sortPairs(list) {
    var r = list.map(function (p, i) { return { p: p, k: rank(p).concat([i]) }; });
    r.sort(function (x, y) { for (var i = 0; i < x.k.length; i++) if (x.k[i] !== y.k[i]) return x.k[i] - y.k[i]; return 0; });
    return r.map(function (x) { return x.p; });
  }
  function visible() {
    var q = L.fold(el("q").value.trim());
    if (!q) return pairs;
    return pairs.filter(function (p) {
      return [p.a, p.b].some(function (w) { return w && (L.fold(w.parola).indexOf(q) >= 0 || L.fold(w.traslitterazione).indexOf(q) >= 0 || L.fold(w.significato).indexOf(q) >= 0); });
    });
  }
  function draw() {
    var pairs = visible();
    el("list").innerHTML = pairs.slice(0, shown).map(item).join("") || '<li class="note">No doublets for this language.</li>';
    el("more").hidden = pairs.length <= shown;
    el("more").textContent = "Show all " + L.n(pairs.length);
  }
  function load(code) {
    lang = code;
    L.setParams({ lang: code });
    el("count").textContent = "Loading…";
    L.fetchJson("data/doppioni/" + L.fileCode(code) + ".json").then(function (d) {
      pairs = sortPairs(L.listOf(pick(d, "coppie", "doppioni") || d));
      shown = SHOW;
      var n = pick(d, "n_coppie", "n") || pairs.length;
      el("count").textContent = L.n(n) + (n === 1 ? " pair" : " pairs") + " of doublets in " + L.langName(nm, code) + ", the best-known words first.";
      draw();
    }).catch(function (e) {
      pairs = []; draw();
      el("count").textContent = L.fetchFail(e);
    });
  }

  L.names().then(function (res) {
    nm = res;
    L.footer();
    var codes = L.targetCodes(nm);
    var start = L.param("lang");
    if (codes.indexOf(start) < 0) start = "it";
    L.langOptions(el("lang"), codes, nm, start);
    el("lang").addEventListener("change", function () { load(el("lang").value); });
    el("q").value = L.param("q") || "";
    el("q").addEventListener("input", function () { shown = SHOW; draw(); });
    el("more").addEventListener("click", function () { shown = Infinity; draw(); });
    el("loading").hidden = true; el("app").hidden = false;
    load(start);
  }).catch(function (e) {
    el("loading").textContent = L.fetchFail(e);
    if (location.protocol !== "file:") console.warn(e.message);
  });
})();
