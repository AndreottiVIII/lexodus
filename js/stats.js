/* lexodus — stats.html: the four statistics of data/statistiche.json (mandate 09), in Davide's order:
   hidden donors, bridge languages, given and received, most travelled words. Each section shows the "nota" of its block. */
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
    var t = block && pick(block, "nota");
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
  function wordLink(r) {
    var l = pick(r, "lingua", "l"), w = pick(r, "parola", "p"), ne = pick(r, "n_etimologia", "ne") || 1;
    return '<a class="w" href="' + L.esc(L.treeUrl(l, w, ne, pick(r, "traslitterazione", "t"))) + '">' + L.esc(w) + "</a>" + L.tr(pick(r, "traslitterazione", "t"), w);
  }

  // 1. Hidden donors, for the language chosen in the menu.
  function hidden(block) {
    var rows = rowsOf((block && block.per_arrivo) || block, ["righe", "coppie", "elenco"]).map(function (r) {
      if (r.nome_en && !names[r.codice]) names[r.codice] = r.nome_en;
      if (r.tipo_lingua) types[r.codice] = r.tipo_lingua;
      return {
        to: pick(r, "arrivo", "lingua_arrivo"), from: pick(r, "codice", "lingua", "donatore", "origine"),
        direct: pick(r, "diretto") || 0, second: pick(r, "secondo_livello") || 0, via: pairsOf(pick(r, "via")),
        ratio: pick(r, "rapporto")
      };
    }).filter(function (r) { return isLang(r.from); });
    var langs = names._targets.filter(function (c) { return rows.some(function (r) { return r.to === c; }); })
      .sort(function (a, b) { return name(a).localeCompare(name(b), "en"); });
    var sel = el("hidden-lang"), start = L.param("lang");
    if (langs.indexOf(start) < 0) start = langs.indexOf("it") >= 0 ? "it" : langs[0];
    sel.innerHTML = langs.map(function (c) { return '<option value="' + L.esc(c) + '"' + (c === start ? " selected" : "") + ">" + L.esc(name(c)) + "</option>"; }).join("");
    function draw() {
      var to = sel.value;
      var mine = rows.filter(function (r) { return r.to === to; })
        .sort(function (a, b) { return (b.ratio !== undefined ? b.ratio - a.ratio : 0) || b.second / (b.direct + 1) - a.second / (a.direct + 1); });
      var max = Math.max.apply(null, mine.map(function (r) { return r.second; }).concat([1]));
      el("hidden-list").innerHTML = mine.length ? mine.map(function (r) {
        var sec = L.n(r.second);
        if (L.hasGridFile(pairs, to, "_via", r.from)) sec = '<a href="' + L.esc(L.viaUrl(to, r.from)) + '">' + sec + "</a>";
        return '<li class="row"><div class="line"><span class="name">' + langLink(r.from) + "</span>" +
          '<span class="num">' + sec + ' <span class="note">one step before</span> · ' + L.n(r.direct) + ' <span class="note">directly</span></span></div>' +
          bar(r.second, max) +
          (r.via.length ? '<p class="ex">via ' + r.via.map(function (v) { return L.esc(name(v.code)) + " " + L.n(v.n); }).join(", ") + "</p>" : "") + "</li>";
      }).join("") : '<li class="note">No hidden donor for this language (at least 20 words one step before).</li>';
      try { history.replaceState(null, "", "?lang=" + encodeURIComponent(to) + location.hash); } catch (e) { /* ignore */ }
    }
    sel.addEventListener("change", draw);
    draw();
  }

  // 2. Bridge languages.
  function bridges(block) {
    var rows = rowsOf(block, ["righe", "lingue", "elenco"]).map(function (r) {
      if (r.nome_en && r.codice && !names[r.codice]) names[r.codice] = r.nome_en;
      if (r.tipo_lingua) types[r.codice] = r.tipo_lingua;
      return { code: pick(r, "codice", "lingua"), n: pick(r, "n_parole", "n", "parole") || 0, to: pairsOf(pick(r, "per_arrivo", "arrivi")) };
    }).filter(function (r) { return isLang(r.code); }).sort(function (a, b) { return b.n - a.n; });
    var max = rows.length ? rows[0].n : 1;
    more(el("bridges-list"), el("bridges-more"), rows, function (r) {
      return '<li class="row"><div class="line"><span class="name">' + langLink(r.code) + '</span><span class="num">' + L.n(r.n) + "</span></div>" + bar(r.n, max) +
        (r.to.length ? '<p class="ex">for ' + r.to.slice(0, 8).map(function (t) { return L.esc(name(t.code)) + " " + L.n(t.n); }).join(", ") + "</p>" : "") + "</li>";
    });
  }

  // 3. Given and received.
  function balance(block) {
    var cov = { buona: "good", media: "fair", scarsa: "poor" };
    var rows = rowsOf(block, ["righe", "lingue", "elenco"]);
    // The warning about coverage is in the "nota" of the block; a separate "avviso" is shown too when present.
    el("balance-warn").textContent = pick(block, "avviso") || "";
    el("balance-warn").hidden = !pick(block, "avviso");
    el("balance-list").innerHTML = rows.map(function (r) {
      var gave = pick(r, "date", "dato", "uscita") || 0, got = pick(r, "ricevute", "ricevuto", "entrata") || 0;
      var ratio = pick(r, "rapporto");
      if (ratio === undefined) ratio = got ? gave / got : null;
      var c = pick(r, "copertura"), pct = pick(r, "percentuale_con_etimologia");
      return "<tr><td>" + langLink(pick(r, "lingua", "codice")) + "</td><td>" + L.n(gave) + "</td><td>" + L.n(got) + "</td><td>" +
        (ratio === null ? "—" : ratio.toFixed(2)) + '</td><td class="note">' + L.esc((cov[c] || c || "") + (pct !== undefined ? ", " + Math.round(pct) + "%" : "")) + "</td></tr>";
    }).join("");
  }

  // 4. Most travelled words.
  function travel(block) {
    var long = (block && pick(block, "catena_piu_lunga", "catene_lunghe")) || [];
    var taken = (block && pick(block, "prese_da_piu_lingue")) || [];
    function item(numKey, label) {
      return function (r) {
        var v = pick.apply(null, [r].concat(numKey)) || 0;
        return '<li><div class="line">' + wordLink(r) + ' <span class="note">' + L.esc(name(pick(r, "lingua", "l"))) + '</span><span class="num">' + L.n(v) + " " + label(v) + "</span></div>" +
          (pick(r, "significato", "s") ? '<p class="mean">' + L.esc(pick(r, "significato", "s")) + "</p>" : "") + "</li>";
      };
    }
    more(el("long-list"), el("long-more"), long, item(["n_tappe", "tappe"], function (v) { return v === 1 ? "step" : "steps"; }));
    more(el("taken-list"), el("taken-more"), taken, item(["n_lingue", "n_discendenti_diretti"], function (v) { return v === 1 ? "language" : "languages"; }));
  }

  Promise.all([L.names(), L.fetchJson("data/statistiche.json"), L.extra("coppie_elenco"), L.getRaw("lingue")]).then(function (res) {
    names = res[0]; pairs = res[2] || {};
    res[3].altre_lingue_origine.forEach(function (o) { types[o.codice] = o.tipo_lingua; });
    var s = res[1];
    L.footer();
    note("hidden-note", s.donatori_nascosti); hidden(s.donatori_nascosti);
    note("bridges-note", s.lingue_di_passaggio); bridges(s.lingue_di_passaggio);
    note("balance-note", s.bilancio); balance(s.bilancio);
    note("travel-note", s.parole_viaggiate); travel(s.parole_viaggiate);
    el("loading").hidden = true; el("app").hidden = false;
  }).catch(function (e) {
    el("loading").textContent = L.fetchFail(e);
    if (location.protocol !== "file:") console.warn(e.message);
  });
})();
