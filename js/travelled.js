/* lexodus — travelled.html: most travelled words (statistiche.json, parole_viaggiate, mandate 11):
   the 10 of one language, the 100 longest ways, the 100 words taken by the most languages. */
(function () {
  "use strict";
  var L = window.Lex;
  var SHOW = 20;
  function el(id) { return document.getElementById(id); }
  function pick(o) { for (var i = 1; i < arguments.length; i++) if (o && o[arguments[i]] !== undefined && o[arguments[i]] !== null) return o[arguments[i]]; return undefined; }
  var nm;

  function steps(r) {
    var v = pick(r, "n_tappe", "tappe");
    if (v === undefined && r.catena) v = r.catena.length;
    return v || 0;
  }
  function longItem(r) {
    var lang = pick(r, "lingua", "l"), v = steps(r);
    return '<li><div class="line">' + L.wordTree(r) + ' <span class="note">' + L.esc(L.langName(nm, lang)) + '</span><span class="num">' + L.n(v) + (v === 1 ? " step" : " steps") + "</span></div>" +
      (r.catena ? '<p class="mean">' + L.chainLine(r.catena, nm, { lang: lang, word: r.parola, t: r.traslitterazione }) + "</p>" : "") +
      (r.significato ? '<p class="mean">' + L.esc(r.significato) + "</p>" : "") + "</li>";
  }
  function takenItem(r) {
    var lang = pick(r, "lingua", "l"), v = pick(r, "n_lingue", "n_discendenti_diretti") || 0;
    var who = (r.lingue || []).map(function (x) { return L.langName(nm, x.codice || x[0]); });
    return '<li><div class="line">' + L.wordTree(r) + ' <span class="note">' + L.esc(L.langName(nm, lang)) + '</span><span class="num">' + L.n(v) + (v === 1 ? " language" : " languages") + "</span></div>" +
      (r.significato ? '<p class="mean">' + L.esc(r.significato) + "</p>" : "") +
      (who.length ? '<p class="mean">' + L.esc(who.join(", ")) + "</p>" : "") + "</li>";
  }
  function more(list, btn, items, html) {
    function draw(all) { list.innerHTML = (all ? items : items.slice(0, SHOW)).map(html).join(""); }
    draw(false);
    btn.hidden = items.length <= SHOW;
    btn.textContent = "Show all " + items.length;
    btn.onclick = function () { draw(true); btn.hidden = true; };
  }

  Promise.all([L.names(), L.fetchJson("data/statistiche.json")]).then(function (res) {
    nm = res[0];
    var b = res[1].parole_viaggiate || {};
    L.footer();
    var excl = b.escluse || L.EXCLUDED;
    var t = L.noteText(b);
    el("note").textContent = t; el("note").hidden = !t;
    L.exclusionNote(el("ro-note"), b);
    function notExcl(r) { return excl.indexOf(pick(r, "lingua", "l")) < 0; }
    var long = (pick(b, "catena_piu_lunga", "catene_lunghe") || []).filter(notExcl);
    var taken = (pick(b, "prese_da_piu_lingue") || []).filter(notExcl);
    more(el("long-list"), el("long-more"), long, longItem);
    more(el("taken-list"), el("taken-more"), taken, takenItem);

    // The 10 of one language: per_lingua[code] is a list, or {catena_piu_lunga, prese_da_piu_lingue}.
    var per = pick(b, "per_lingua", "per_arrivo") || {};
    var codes = L.targetCodes(nm, true).filter(function (c) { return excl.indexOf(c) < 0 && per[c]; });
    var start = L.param("lang");
    if (codes.indexOf(start) < 0) start = codes.indexOf("it") >= 0 ? "it" : codes[0];
    L.langOptions(el("lang"), codes, nm, start);
    function draw() {
      var c = el("lang").value, p = per[c] || [];
      var list = Array.isArray(p) ? p : pick(p, "catena_piu_lunga", "catene_lunghe") || [];
      el("one-list").innerHTML = list.slice(0, 10).map(function (r) { return longItem(Object.assign({ lingua: c }, r)); }).join("") ||
        '<li class="note">No words for this language.</li>';
      L.setParams({ lang: c });
    }
    el("lang").addEventListener("change", draw);
    if (codes.length) draw(); else el("one-list").closest("section").hidden = true;
    el("loading").hidden = true; el("app").hidden = false;
  }).catch(function (e) {
    el("loading").textContent = L.fetchFail(e);
    if (location.protocol !== "file:") console.warn(e.message);
  });
})();
