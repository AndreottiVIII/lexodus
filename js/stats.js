/* lexodus — stats.html: two statistics of data/statistiche.json (mandate 11): given and received, bridge languages.
   Each section shows the one-sentence "nota" of its block; Romanian is left out as a language that took words
   (hidden donors and most travelled words have their own pages: hidden.html, travelled.html). */
(function () {
  "use strict";
  var L = window.Lex;
  var SHOW = 20;
  function el(id) { return document.getElementById(id); }
  var names, pairs, types = {};
  // As on the language pages (default switch): families, proto-languages and non-languages are left out.
  function isLang(c) { return c === "LATINO" || c === "altre" || L.isLanguage(types[c]); }

  // Field names follow the contract of mandate 09; a few alternatives are accepted so a small change in the export does not break the page.
  function pick(o) { for (var i = 1; i < arguments.length; i++) if (o && o[arguments[i]] !== undefined && o[arguments[i]] !== null) return o[arguments[i]]; return undefined; }
  function rowsOf(block, keys) {
    if (!block) return [];
    if (Array.isArray(block)) return block;
    for (var i = 0; i < keys.length; i++) if (Array.isArray(block[keys[i]])) return block[keys[i]];
    // {code: [rows]} keyed by language
    var out = [];
    Object.keys(block).forEach(function (k) {
      if (Array.isArray(block[k])) block[k].forEach(function (r) { out.push(Object.assign({ arrivo: k }, r)); });
    });
    return out;
  }
  // [{codice, n}], [[codice, n]] or {codice: n} -> [{code, n}]
  function pairsOf(v) {
    if (!v) return [];
    if (Array.isArray(v)) return v.map(function (x) {
      return Array.isArray(x) ? { code: x[0], n: x[1] } : { code: pick(x, "codice", "lingua", "arrivo", "via"), n: pick(x, "n", "parole", "numero") || 0 };
    });
    return Object.keys(v).map(function (k) { return { code: k, n: v[k] }; }).sort(function (a, b) { return b.n - a.n; });
  }
  function name(c) { return c === "LATINO" ? "Latin" : c === "altre" ? "other languages" : names[c] || c; }
  function langLink(c) {
    var code = c === "LATINO" ? "la" : c;
    return names[code] || c === "LATINO" ? '<a href="language.html?code=' + encodeURIComponent(code) + '">' + L.esc(name(c)) + "</a>" : L.esc(name(c));
  }
  function bar(v, max) { return '<div class="bar"><span style="width:' + (max ? Math.max(0.5, 100 * v / max) : 0).toFixed(1) + '%"></span></div>'; }
  function note(id, block) {
    var t = L.noteText(block);
    el(id).textContent = t || "";
    el(id).hidden = !t;
  }
  function more(list, btn, items, html) {
    function draw(all) { list.innerHTML = (all ? items : items.slice(0, SHOW)).map(html).join(""); }
    draw(false);
    btn.hidden = items.length <= SHOW;
    btn.textContent = "Show all " + items.length;
    btn.onclick = function () { draw(true); btn.hidden = true; };
  }
  // Bridge languages.
  function bridges(block) {
    var rows = rowsOf(block, ["righe", "lingue", "elenco"]).map(function (r) {
      if (r.nome_en && r.codice && !names[r.codice]) names[r.codice] = r.nome_en;
      if (r.tipo_lingua) types[r.codice] = r.tipo_lingua;
      return { code: pick(r, "codice", "lingua"), n: pick(r, "n_parole", "n", "parole") || 0, to: pairsOf(pick(r, "per_arrivo", "arrivi")) };
    }).filter(function (r) { return isLang(r.code); }).sort(function (a, b) { return b.n - a.n; });
    var excl = (block && block.escluse) || L.EXCLUDED;
    rows.forEach(function (r) { r.to = r.to.filter(function (t) { return excl.indexOf(t.code) < 0; }); });
    var max = rows.length ? rows[0].n : 1;
    more(el("bridges-list"), el("bridges-more"), rows, function (r) {
      return '<li class="row"><div class="line"><span class="name">' + langLink(r.code) + '</span><span class="num">' + L.n(r.n) + "</span></div>" + bar(r.n, max) +
        (r.to.length ? '<p class="ex">for ' + r.to.slice(0, 8).map(function (t) { return L.esc(name(t.code)) + " " + L.n(t.n); }).join(", ") + "</p>" : "") + "</li>";
    });
  }

  // Given and received.
  function balance(block) {
    var cov = { buona: "good", media: "fair", scarsa: "poor" };
    var rows = rowsOf(block, ["righe", "lingue", "elenco"]);
    var excl = (block && block.escluse) || L.EXCLUDED;
    rows = rows.filter(function (r) { return excl.indexOf(pick(r, "lingua", "codice")) < 0; });
    el("balance-list").innerHTML = rows.map(function (r) {
      var gave = pick(r, "date", "dato", "uscita") || 0, got = pick(r, "ricevute", "ricevuto", "entrata") || 0;
      var ratio = pick(r, "rapporto");
      if (ratio === undefined) ratio = got ? gave / got : null;
      var c = pick(r, "copertura"), pct = pick(r, "percentuale_con_etimologia");
      return "<tr><td>" + langLink(pick(r, "lingua", "codice")) + "</td><td>" + L.n(gave) + "</td><td>" + L.n(got) + "</td><td>" +
        (ratio === null ? "—" : ratio.toFixed(2)) + '</td><td class="note">' + L.esc((cov[c] || c || "") + (pct !== undefined ? ", " + Math.round(pct) + "%" : "")) + "</td></tr>";
    }).join("");
  }

  Promise.all([L.names(), L.fetchJson("data/statistiche.json"), L.extra("coppie_elenco"), L.getRaw("lingue")]).then(function (res) {
    names = res[0]; pairs = res[2] || {};
    res[3].altre_lingue_origine.forEach(function (o) { types[o.codice] = o.tipo_lingua; });
    var s = res[1];
    L.footer();
    L.exclusionNote(el("ro-note"), s.bilancio || s.lingue_di_passaggio);
    note("balance-note", s.bilancio); balance(s.bilancio);
    note("bridges-note", s.lingue_di_passaggio); bridges(s.lingue_di_passaggio);
    el("loading").hidden = true; el("app").hidden = false;
  }).catch(function (e) {
    el("loading").textContent = L.fetchFail(e);
    if (location.protocol !== "file:") console.warn(e.message);
  });
})();
