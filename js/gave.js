/* lexodus — gave.html?lang=it: what one language gave to the world (dato_al_mondo/<code>.json, mandate 13).
   Its words taken by the most other languages (at every level of the trees, only sure links), with the local
   forms, closed per row; "Italian had it from …" when the word was itself a loan. Words with senza_albero: true
   are ancestors without an entry of their own: shown, but without a link to a tree. Romanian counts like any
   other language here (Davide, 18/10/2026). */
(function () {
  "use strict";
  var L = window.Lex;
  var SHOW = 50;
  function el(id) { return document.getElementById(id); }
  function pick(o) { for (var i = 1; i < arguments.length; i++) if (o && o[arguments[i]] !== undefined && o[arguments[i]] !== null) return o[arguments[i]]; return undefined; }
  var nm, words = [], shown = SHOW, lang;

  function wordHtml(w) {
    return w.senza_albero || !w.file_albero
      ? '<span class="w plain" title="No tree: Wiktionary gives this word no etymology of its own">' + L.esc(w.parola) + "</span>" + L.tr(w.traslitterazione, w.parola)
      : L.wordTree(w, lang);
  }
  function head(w, i) {
    var n = w.n_lingue || 0;
    return '<span class="rank">' + (i + 1) + "</span>" + wordHtml(w) +
      (w.significato ? ' <span class="note">' + L.esc(w.significato) + "</span>" : "") +
      '<span class="num">' + L.n(n) + (n === 1 ? " language" : " languages") + "</span>";
  }
  function forms(list) {
    return list.slice().sort(function (x, y) { return L.langName(nm, x.codice, x.nome_en).localeCompare(L.langName(nm, y.codice, y.nome_en), "en"); })
      .map(function (o) {
        return '<span class="ln">' + L.esc(L.langName(nm, o.codice, o.nome_en)) + "</span> <i>" + L.esc(o.parola || "") + "</i>" + L.tr(o.traslitterazione, o.parola);
      }).join(", ");
  }
  function body(w) {
    var o = w.origine_X, list = w.lingue || [], html = "";
    if (o && (o.codice || o.termine)) {
      html += '<p class="from">' + L.esc(L.langName(nm, lang)) + " had it from " + L.langLink(nm, o.codice, o.nome_en) +
        (o.termine ? " <i>" + L.esc(o.termine) + "</i>" + L.tr(o.traslitterazione, o.termine) : "") + ".</p>";
    }
    var direct = list.filter(function (x) { return (x.livello || 1) === 1; }), later = list.filter(function (x) { return (x.livello || 1) > 1; });
    if (direct.length) html += '<p class="gave-langs"><strong>Directly:</strong> ' + forms(direct) + "</p>";
    if (later.length) html += '<p class="gave-langs"><strong>Through another language:</strong> ' + forms(later) + "</p>";
    if (!list.length) html += '<p class="note">No language listed.</p>';
    return html;
  }
  function visible() {
    var q = L.fold(el("q").value.trim());
    if (!q) return words;
    return words.filter(function (w) {
      return [w.parola, w.traslitterazione, w.significato].some(function (s) { return L.fold(s).indexOf(q) >= 0; }) ||
        (w.lingue || []).some(function (x) { return L.fold(x.parola).indexOf(q) >= 0 || L.fold(x.traslitterazione).indexOf(q) >= 0; });
    });
  }
  function draw() {
    var list = visible();
    el("list").innerHTML = list.slice(0, shown).map(function (w) {
      var i = words.indexOf(w);
      return '<li><details data-i="' + i + '"><summary>' + head(w, i) + '</summary><div class="gave-body"></div></details></li>';
    }).join("") || '<li class="note">No word like this in the list.</li>';
    el("more").hidden = list.length <= shown;
    el("more").textContent = "Show all " + L.n(list.length);
  }
  function load(code) {
    lang = code;
    L.setParams({ lang: code });
    var name = L.langName(nm, code);
    el("title").textContent = "What " + name + " gave to the world";
    document.title = "What " + name + " gave to the world — lexodus";
    el("count").textContent = "Loading…";
    L.fetchJson("data/dato_al_mondo/" + L.fileCode(code) + ".json").then(function (d) {
      words = L.listOf(pick(d, "parole") || d);
      shown = SHOW;
      var all = pick(d, "n_parole_con_discendenti"), orphans = words.some(function (w) { return w.senza_albero; });
      el("count").textContent = words.length
        ? "The " + L.n(words.length) + " " + name + " words taken by the most languages" +
          (all > words.length ? " (of " + L.n(all) + " taken by at least one)." : ".") +
          (orphans ? " Words not underlined have no tree of their own." : "")
        : "No word of " + name + " was taken by another of the 33 languages, as far as Wiktionary says.";
      draw();
    }).catch(function (e) {
      words = []; draw();
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
    var q0 = L.param("q");
    if (q0) el("q").value = q0;
    el("lang").addEventListener("change", function () { load(el("lang").value); });
    el("q").addEventListener("input", function () { shown = SHOW; L.setParams({ q: el("q").value.trim() }); draw(); });
    el("more").addEventListener("click", function () { shown = Infinity; draw(); });
    // the languages of a row are drawn when it is opened
    el("list").addEventListener("toggle", function (e) {
      var d = e.target;
      if (!d.open || d.dataset.done) return;
      d.querySelector(".gave-body").innerHTML = body(words[+d.dataset.i]);
      d.dataset.done = "1";
    }, true);
    el("loading").hidden = true; el("app").hidden = false;
    load(start);
  }).catch(function (e) {
    el("loading").textContent = L.fetchFail(e);
    if (location.protocol !== "file:") console.warn(e.message);
  });
})();
