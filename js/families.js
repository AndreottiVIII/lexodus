/* lexodus — families.html: the most widespread word families (famiglie.json, mandate 11). Each family opens
   onto its words, language by language (transliteration and meaning), with a link to the tree of its example. */
(function () {
  "use strict";
  var L = window.Lex;
  var SHOW = 50;
  function el(id) { return document.getElementById(id); }
  function pick(o) { for (var i = 1; i < arguments.length; i++) if (o && o[arguments[i]] !== undefined && o[arguments[i]] !== null) return o[arguments[i]]; return undefined; }
  var nm, fams = [], shown = SHOW;

  function root(f) {
    var r = pick(f, "radice", "origine") || {};
    return L.esc(L.langName(nm, r.codice || r.lingua, r.nome_en || r.nome)) + " <i>" + L.esc(r.termine || r.parola || "") + "</i>" + L.tr(r.traslitterazione, r.termine || r.parola);
  }
  function words(f) { return pick(f, "parole", "elenco") || []; }
  function head(f, i) {
    var ex = f.esempio;
    return '<span class="rank">' + (i + 1) + "</span>" +
      '<span class="fam-root">' + root(f) + "</span>" +
      (ex ? ' <span class="note">· ' + L.esc(L.langName(nm, ex.lingua)) + " " + L.esc(ex.parola) + "</span>" : "") +
      '<span class="num">' + L.n(pick(f, "n_lingue") || 0) + " languages · " + L.n(pick(f, "n_parole") || words(f).length) + " words</span>";
  }
  function body(f) {
    var by = {}, order = [];
    words(f).forEach(function (w) {
      var l = w.lingua || w.l;
      if (!by[l]) { by[l] = []; order.push(l); }
      by[l].push(w);
    });
    order.sort(function (a, b) { return L.langName(nm, a).localeCompare(L.langName(nm, b), "en"); });
    var ex = f.esempio;
    return (ex ? '<p><a href="' + L.esc(L.treeUrl(ex.lingua, ex.parola, ex.n_etimologia || 1, ex.traslitterazione)) + '">See the tree of ' + L.esc(L.langName(nm, ex.lingua)) + " " + L.esc(ex.parola) + "</a></p>" : "") +
      '<dl class="fam-words">' + order.map(function (l) {
        return "<dt>" + L.langLink(nm, l) + "</dt><dd>" + by[l].map(function (w) {
          return L.wordPage(w, l) + (w.significato ? ' <span class="note">' + L.esc(w.significato) + "</span>" : "");
        }).join("<br>") + "</dd>";
      }).join("") + "</dl>";
  }
  function visible() {
    var q = L.fold(el("q").value.trim());
    if (!q) return fams;
    return fams.filter(function (f) {
      var r = pick(f, "radice", "origine") || {};
      return L.fold(r.termine).indexOf(q) >= 0 || L.fold(r.traslitterazione).indexOf(q) >= 0 ||
        words(f).some(function (w) { return L.fold(w.parola).indexOf(q) >= 0 || L.fold(w.traslitterazione).indexOf(q) >= 0; });
    });
  }
  function draw() {
    var list = visible();
    el("list").innerHTML = list.slice(0, shown).map(function (f) {
      var i = fams.indexOf(f);
      return '<li><details data-i="' + i + '"><summary>' + head(f, i) + '</summary><div class="fam-body"></div></details></li>';
    }).join("") || '<li class="note">No family with this word.</li>';
    el("more").hidden = list.length <= shown;
    el("more").textContent = "Show all " + L.n(list.length);
  }

  Promise.all([L.names(), L.fetchJson("data/famiglie.json")]).then(function (res) {
    nm = res[0];
    var d = res[1];
    L.footer();
    var t = L.noteText(d, "families");
    el("note").textContent = t; el("note").hidden = !t;
    // Families that end in a reconstructed language (Proto-Indo-European…) stay hidden, as everywhere on the site.
    var all = L.listOf(pick(d, "famiglie", "elenco") || d);
    fams = all.filter(function (f) { var r = pick(f, "radice", "origine") || {}; return L.isLanguage(r.tipo_lingua); })
      .sort(function (a, b) { return (b.n_lingue || 0) - (a.n_lingue || 0) || (b.n_parole || 0) - (a.n_parole || 0); });
    if (fams.length < all.length) {
      el("hidden-note").textContent = (all.length - fams.length) + " of the " + all.length + " families end in a reconstructed language (Proto-Indo-European…) and are not shown.";
      el("hidden-note").hidden = false;
    }
    // the words of a family are drawn when it is opened
    el("list").addEventListener("toggle", function (e) {
      var det = e.target;
      if (!det.open || !det.dataset || det.dataset.i === undefined) return;
      var box = det.querySelector(".fam-body");
      if (!box.innerHTML) box.innerHTML = body(fams[+det.dataset.i]);
    }, true);
    el("q").value = L.param("q") || "";
    el("q").addEventListener("input", function () { shown = SHOW; draw(); });
    el("more").addEventListener("click", function () { shown = Infinity; draw(); });
    draw();
    el("loading").hidden = true; el("app").hidden = false;
  }).catch(function (e) {
    el("loading").textContent = L.fetchFail(e);
    if (location.protocol !== "file:") console.warn(e.message);
  });
})();
