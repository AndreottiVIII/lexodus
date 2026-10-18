/* lexodus — compare.html?a=fr&b=it: two languages side by side (confronto/<A>__<B>.json, A before B in
   alphabetical order of the codes, mandate 11): what each took from the other, shared origins, words through each other. */
(function () {
  "use strict";
  var L = window.Lex;
  function el(id) { return document.getElementById(id); }
  function pick(o) { for (var i = 1; i < arguments.length; i++) if (o && o[arguments[i]] !== undefined && o[arguments[i]] !== null) return o[arguments[i]]; return undefined; }
  var nm, pairs;

  function catLine(per) {
    return L.CATS.filter(function (c) { return per && per[c.key]; })
      .map(function (c) { return L.n(per[c.key]) + " " + c.label; }).join(" · ");
  }
  function exList(list, lang) {
    return (list || []).map(function (w) { return L.wordPage(w, lang); }).join(", ");
  }
  // took: {n, per_categoria, esempi}; "to" took the words from "from".
  function tookBlock(id, to, from, took) {
    var nTo = L.langName(nm, to), nFrom = L.langName(nm, from);
    el(id + "-title").textContent = nTo + " took from " + nFrom;
    var box = el(id).querySelector(".body");
    var n = (took && pick(took, "n", "n_parole")) || 0;
    if (!n) { box.innerHTML = '<p class="note">No words in Wiktionary.</p>'; return; }
    var fc = L.fileCode(from);
    var all = L.hasPair(pairs, to, fc) ? ' <a href="' + L.esc(L.wordsUrl(to, fc)) + '">See the words</a>' : "";
    box.innerHTML = '<p class="big-num">' + L.n(n) + ' <span class="note">words</span></p>' +
      '<p class="note">' + L.esc(catLine(pick(took, "per_categoria", "categorie"))) + "</p>" +
      '<p class="ex plain-ex">' + exList(pick(took, "esempi"), to) + "</p>" + (all ? "<p>" + all + "</p>" : "");
  }
  function sharedRows(list, a, b) {
    el("sh-a").textContent = L.langName(nm, a);
    el("sh-b").textContent = L.langName(nm, b);
    el("shared-list").innerHTML = (list || []).map(function (o) {
      var c = pick(o, "codice", "origine");
      return '<tr><td class="w">' + L.langLink(nm, c, o.nome_en) + (o.termine ? " <i>" + L.esc(o.termine) + "</i>" + L.tr(o.traslitterazione, o.termine) : "") + "</td>" +
        "<td><strong>" + L.n(pick(o, "n_a", "n_A") || 0) + '</strong><p class="mean">' + exList(pick(o, "esempi_a", "esempi_A"), a) + "</p></td>" +
        "<td><strong>" + L.n(pick(o, "n_b", "n_B") || 0) + '</strong><p class="mean">' + exList(pick(o, "esempi_b", "esempi_B"), b) + "</p></td></tr>";
    }).join("") || '<tr><td colspan="3" class="note">No shared origins.</td></tr>';
  }
  function throughLine(to, from, list) {
    var fc = L.fileCode(from);
    list = L.listOf(list);
    if (!list || !list.length) return "";
    return "<p>Of the words " + L.esc(L.langName(nm, to)) + " took from " + L.esc(L.langName(nm, from)) + ", " + L.esc(L.langName(nm, from)) + " had taken " +
      list.map(function (v) {
        var vc = L.fileCode(v.codice), num = L.n(v.n);
        if (L.hasPair(pairs, to, fc, vc)) num = '<a href="' + L.esc(L.wordsUrl(to, fc, vc)) + '">' + num + "</a>";
        return num + " from " + L.esc(L.langName(nm, v.codice, v.nome_en));
      }).join(", ") + ".</p>";
  }

  function show() {
    var a = el("a").value, b = el("b").value;
    L.setParams({ a: a, b: b });
    var roOut = a === "ro" || b === "ro";
    if (roOut) L.exclusionNote(el("ro-note"), null); else el("ro-note").hidden = true;
    if (a === b) {
      el("app").hidden = true; el("loading").hidden = false;
      el("loading").textContent = "Choose two different languages.";
      return;
    }
    var x = a < b ? a : b, y = a < b ? b : a;
    el("loading").hidden = false; el("loading").textContent = "Loading…";
    L.fetchJson("data/confronto/" + L.fileCode(x) + "__" + L.fileCode(y) + ".json").then(function (d) {
      var xy = pick(d, "A_da_B", x + "_da_" + y), yx = pick(d, "B_da_A", y + "_da_" + x);
      var tookA = a === x ? xy : yx, tookB = a === x ? yx : xy; // tookA: words a took from b
      tookBlock("ab", a, b, tookA);
      tookBlock("ba", b, a, tookB);
      var shared = (pick(d, "origini_comuni") || []).map(function (o) {
        // n_a / esempi_a belong to the first language of the file name
        return a === x ? o : Object.assign({}, o, { n_a: pick(o, "n_b", "n_B"), n_b: pick(o, "n_a", "n_A"), esempi_a: pick(o, "esempi_b", "esempi_B"), esempi_b: pick(o, "esempi_a", "esempi_A") });
      });
      sharedRows(shared, a, b);
      var p = pick(d, "passaggi") || {};
      var pxy = pick(p, "A_da_B", x + "_da_" + y), pyx = pick(p, "B_da_A", y + "_da_" + x);
      var html = throughLine(a, b, a === x ? pxy : pyx) + throughLine(b, a, a === x ? pyx : pxy);
      el("through-body").innerHTML = html || '<p class="note">None.</p>';
      el("loading").hidden = true; el("app").hidden = false;
    }).catch(function (e) {
      el("app").hidden = true;
      el("loading").textContent = L.fetchFail(e);
    });
  }

  Promise.all([L.names(), L.extra("coppie_elenco")]).then(function (res) {
    nm = res[0]; pairs = res[1] || {};
    L.footer();
    var codes = L.targetCodes(nm);
    var a = L.param("a"), b = L.param("b");
    if (codes.indexOf(a) < 0) a = "fr";
    if (codes.indexOf(b) < 0) b = a === "it" ? "fr" : "it";
    L.langOptions(el("a"), codes, nm, a);
    L.langOptions(el("b"), codes, nm, b);
    el("pick").addEventListener("change", show);
    el("pick").addEventListener("submit", function (e) { e.preventDefault(); show(); });
    show();
  }).catch(function (e) {
    el("loading").textContent = L.fetchFail(e);
    if (location.protocol !== "file:") console.warn(e.message);
  });
})();
