/* lexodus — roundtrips.html: words of one language whose way goes back to the same language (or an older stage of it)
   after at least one other language (andate_tornate/<code>.json, mandate 11). The language is highlighted twice. */
(function () {
  "use strict";
  var L = window.Lex;
  var SHOW = 40;
  function el(id) { return document.getElementById(id); }
  function pick(o) { for (var i = 1; i < arguments.length; i++) if (o && o[arguments[i]] !== undefined && o[arguments[i]] !== null) return o[arguments[i]]; return undefined; }
  var nm, rows = [], shown = SHOW, lang;

  function item(r) {
    var chain = r.catena || [];
    var dep = pick(r, "partenza", "parola_di_partenza", "parola_partenza");
    var depCode = L.codeOf(dep) || null;
    // the steps of the same language: the language itself and the stage the word left from
    var mark = function (c) { return c === lang || (depCode && c === depCode); };
    var back = L.codeOf(pick(r, "rientro_da")), out = L.codeOf(pick(r, "uscita_verso"));
    var how = [];
    if (out) how.push("left for " + L.langName(nm, out));
    if (back) how.push("came back from " + L.langName(nm, back));
    return '<li><div class="line">' + L.wordTree(r, lang) + (r.significato ? ' <span class="note">' + L.esc(r.significato) + "</span>" : "") + "</div>" +
      '<p class="way">' + L.chainLine(chain, nm, { lang: lang, word: r.parola, t: r.traslitterazione }, mark) + "</p>" +
      (how.length ? '<p class="note">' + L.esc(how.join(", ")) + ' · <a href="' + L.esc(L.wordUrl(lang, r.parola, r.n_etimologia || 1)) + '">word page</a></p>' : "") + "</li>";
  }
  function draw() {
    el("list").innerHTML = rows.slice(0, shown).map(item).join("") || '<li class="note">No round trips for this language.</li>';
    el("more").hidden = rows.length <= shown;
    el("more").textContent = "Show all " + L.n(rows.length);
  }
  function load(code) {
    lang = code;
    L.setParams({ lang: code });
    el("count").textContent = "Loading…";
    L.fetchJson("data/andate_tornate/" + L.fileCode(code) + ".json").then(function (d) {
      rows = L.listOf(pick(d, "parole", "giri") || d);
      shown = SHOW;
      var n = pick(d, "n", "n_parole") || rows.length;
      el("count").textContent = L.n(n) + (n === 1 ? " word" : " words") + " of " + L.langName(nm, code) + " went out and came back, the longest trips first.";
      draw();
    }).catch(function (e) {
      rows = []; draw();
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
    el("more").addEventListener("click", function () { shown = Infinity; draw(); });
    el("loading").hidden = true; el("app").hidden = false;
    load(start);
  }).catch(function (e) {
    el("loading").textContent = L.fetchFail(e);
    if (location.protocol !== "file:") console.warn(e.message);
  });
})();
