/* lexodus — hidden.html: hidden donors of one language (statistiche.json, donatori_nascosti, mandate 11):
   origin, words taken directly, words taken through another language, share, the languages in between. */
(function () {
  "use strict";
  var L = window.Lex;
  function el(id) { return document.getElementById(id); }
  function pick(o) { for (var i = 1; i < arguments.length; i++) if (o && o[arguments[i]] !== undefined && o[arguments[i]] !== null) return o[arguments[i]]; return undefined; }

  Promise.all([L.names(), L.fetchJson("data/statistiche.json"), L.extra("coppie_elenco")]).then(function (res) {
    var nm = res[0], block = res[1].donatori_nascosti || {}, pairs = res[2] || {};
    L.footer();
    var per = block.per_arrivo || {};
    var excl = block.escluse || L.EXCLUDED;
    var t = L.noteText(block, "hidden");
    el("note").textContent = t; el("note").hidden = !t;
    L.exclusionNote(el("ro-note"), block);
    var codes = L.targetCodes(nm).filter(function (c) { return excl.indexOf(c) < 0 && per[c] && per[c].length; });
    var start = L.param("lang");
    if (codes.indexOf(start) < 0) start = codes.indexOf("it") >= 0 ? "it" : codes[0];
    L.langOptions(el("lang"), codes, nm, start);

    function link(v, ok, url) { return ok ? '<a href="' + L.esc(url) + '">' + L.n(v) + "</a>" : L.n(v); }
    function draw() {
      var to = el("lang").value;
      var rows = (per[to] || []).map(function (r) {
        var d = pick(r, "diretto") || 0, s = pick(r, "secondo_livello") || 0;
        var q = pick(r, "quota");
        if (q === undefined) q = d + s ? s / (d + s) : 0;
        if (r.nome_en && !nm[r.codice]) nm[r.codice] = r.nome_en;
        return { from: pick(r, "codice", "origine"), name: r.nome_en, d: d, s: s, q: q, via: pick(r, "via") || [] };
      }).sort(function (a, b) { return b.q - a.q || b.s - a.s; });
      el("list").innerHTML = rows.map(function (r) {
        var fc = L.fileCode(r.from);
        var direct = link(r.d, r.d && L.hasPair(pairs, to, fc), L.wordsUrl(to, fc));
        var second = link(r.s, L.hasGridFile(pairs, to, "_via", r.from), L.viaUrl(to, r.from));
        var via = r.via.map(function (v) {
          var vc = L.fileCode(v.codice);
          return L.esc(L.langName(nm, v.codice, v.nome_en)) + " " + link(v.n, L.hasPair(pairs, to, vc, fc), L.wordsUrl(to, vc, fc));
        }).join(", ");
        return '<tr><td class="w">' + L.langLink(nm, r.from, r.name) + '</td><td class="r">' + direct + '</td><td class="r">' + second +
          '</td><td class="r share"><strong>' + L.pct(r.q) + '</strong><span class="minibar"><span style="width:' + (100 * r.q).toFixed(1) + '%"></span></span></td><td>' + via + "</td></tr>";
      }).join("") || '<tr><td colspan="5" class="note">No hidden donor for this language.</td></tr>';
      L.setParams({ lang: to });
    }
    el("lang").addEventListener("change", draw);
    draw();
    el("loading").hidden = true; el("app").hidden = false;
  }).catch(function (e) {
    el("loading").textContent = L.fetchFail(e);
    if (location.protocol !== "file:") console.warn(e.message);
  });
})();
