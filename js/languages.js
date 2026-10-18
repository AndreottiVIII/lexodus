/* lexodus — languages.html: the 33 languages, coverage in words, the 3 languages each took most from, search by name. */
(function () {
  "use strict";
  var L = window.Lex;
  // Same rule as the grid: borrowed, learned Latin and calque; Latin varieties merged; families and non-languages left out.
  var CATS = ["borrowed", "learned", "calque"];
  var MERGED = { cats: CATS, hideOther: true, splitLatin: false };
  function el(id) { return document.getElementById(id); }

  L.load().then(function (d) {
    L.footer(d.source);
    var top = {};
    d.arcs.forEach(function (a) {
      if (CATS.indexOf(a.cat) < 0) return;
      var from = L.key(a.from, MERGED), l = d.langs[from];
      if (from === a.to || (l && !L.isLanguage(l.type))) return;
      var t = top[a.to] || (top[a.to] = {});
      t[from] = (t[from] || 0) + a.n;
    });
    el("langs").innerHTML = d.targets.map(function (l) {
      var t = top[l.code] || {};
      var best = Object.keys(t).sort(function (a, b) { return t[b] - t[a]; }).slice(0, 3);
      return '<li data-s="' + L.esc(L.fold(l.name + " " + l.nameIt + " " + l.code)) + '"><div class="line"><a class="name" href="language.html?code=' + encodeURIComponent(l.code) + '">' + L.esc(l.name) + "</a>" +
        ' <span class="note">' + L.esc(L.coverageText(l)) + "</span></div>" +
        (best.length ? '<p class="took">Took most from: ' + best.map(function (c) {
          var href = L.wordsUrl(l.code, L.pairCode(c, MERGED));
          return '<a href="' + L.esc(href) + '">' + L.esc((d.langs[c] || {}).name || c) + "</a> " + L.n(t[c]);
        }).join(" · ") + "</p>" : "") + "</li>";
    }).join("");
    el("q").addEventListener("input", function (e) {
      var q = L.fold(e.target.value.trim()), shown = 0;
      Array.prototype.forEach.call(el("langs").children, function (li) {
        var ok = !q || li.dataset.s.indexOf(q) >= 0;
        li.hidden = !ok; if (ok) shown++;
      });
      el("none").hidden = shown > 0;
    });
    el("loading").hidden = true; el("app").hidden = false;
  }).catch(function (e) {
    el("loading").textContent = "The data could not be loaded (" + e.message + ").";
    console.error(e);
  });
})();
