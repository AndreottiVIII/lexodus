/* lexodus — the language page: "Took from" and "Gave to", each row opening onto the step before. */
(function () {
  "use strict";
  var L = window.Lex;
  var LIMIT = 20;
  var state = { code: "it", data: null, filters: null, show: { from: LIMIT, to: LIMIT }, open: {} };
  function el(id) { return document.getElementById(id); }
  // The 5 shortest words, shown alphabetically (Davide, 18/10/2026).
  function five(list) {
    return list.slice().sort(function (a, b) { return a.length - b.length || a.localeCompare(b); })
      .slice(0, 5).sort(function (a, b) { return a.localeCompare(b); });
  }
  function name(code) { var l = state.data.langs[code]; return l ? l.name : code; }

  // One row per (language on the other side, category).
  function rows(side) {
    var f = state.filters, by = {};
    var arcs = state.data.arcs.slice().sort(function (x, y) { return y.n - x.n; });
    arcs.forEach(function (a) {
      var mine = side === "from" ? a.to : a.from;
      if (L.key(mine, f) !== state.code && mine !== state.code) return;
      if (f.cats.indexOf(a.cat) < 0) return;
      var other = L.key(side === "from" ? a.from : a.to, f);
      var l = state.data.langs[other];
      if (f.hideOther && l && !L.isLanguage(l.type)) return;
      var k = other + "|" + a.cat;
      var r = by[k] || (by[k] = { side: side, other: other, cat: a.cat, n: 0, unc: 0, ex: [] });
      r.n += a.n; r.unc += a.unc;
      a.ex.forEach(function (w) { if (r.ex.indexOf(w) < 0) r.ex.push(w); });
    });
    return Object.keys(by).map(function (k) { return by[k]; })
      .sort(function (x, y) { return y.n - x.n || x.other.localeCompare(y.other); });
  }

  // The step before the direct language, for the category of the row only (livello2.json, per_categoria;
  // Davide, 18/10/2026). Merged Latin uses the export's LATINO entries; the varieties are used when split.
  function level2(row) {
    var f = state.filters, d = state.data, catKey = L.CAT_BY_KEY[row.cat].key;
    var arr = row.side === "from" ? state.code : row.other;
    var direct = row.side === "from" ? row.other : state.code;
    var merged = !f.splitLatin && L.isLatin(direct);
    var keys = merged
      ? (d.level2[arr + "|LATINO"] ? [arr + "|LATINO"]
        : Object.keys(d.level2).filter(function (k) { var p = k.split("|"); return p[0] === arr && L.isLatin(p[1]); }))
      : [arr + "|" + direct];
    var by = {}, items = [], counted = 0, hidden = 0;
    keys.forEach(function (k) {
      var list = d.level2[k] || [], seen = {};
      var hasMerged = list.some(function (it) { return it.codice === "LATINO"; });
      list.forEach(function (it) {
        if (seen[it.codice]) return; // the same entry twice in a list (export of 18/10/2026: LATINO in en|it)
        seen[it.codice] = 1;
        if (it.codice === "LATINO" ? f.splitLatin || !hasMerged : !f.splitLatin && hasMerged && L.isLatin(it.codice)) return;
        var v = it.per_categoria ? it.per_categoria[catKey] || 0 : it.n;
        if (!v) return;
        var c = it.codice === "LATINO" ? "la" : L.key(it.codice, f);
        if (c === direct) return; // Latin to Latin: not a step between languages
        var l = d.langs[c];
        counted += v;
        if (f.hideOther && l && !L.isLanguage(l.type)) { hidden += v; return; }
        var m = by[c];
        if (!m) { m = by[c] = { code: c, n: 0, ex: [] }; items.push(m); }
        m.n += v;
        (it.esempi || []).forEach(function (w) { if (m.ex.indexOf(w) < 0) m.ex.push(w); });
      });
    });
    items.sort(function (a, b) { return b.n - a.n; });
    return { items: items, words: row.n, hidden: hidden, rest: Math.max(0, row.n - counted), direct: direct, arr: arr, cat: row.cat };
  }

  // The number opens the list of the words of that pair (words.html), when its file exists.
  function numLink(v, to, from, via, cat) {
    if (!L.hasPair(state.pairs, to, from, via)) return L.n(v);
    return '<a href="' + L.esc(L.wordsUrl(to, from, via, cat)) + '" title="See the words">' + L.n(v) + "</a>";
  }

  function subHtml(row) {
    var r = level2(row);
    if (!r.words) return '<p class="note">No chain recorded for these words.</p>';
    var html = '<p class="sub-head">Before ' + L.esc(name(r.direct)) + ", these " + L.n(r.words) + " " + L.esc(name(r.arr)) + " words came from:</p><ul>";
    r.items.forEach(function (it) {
      var l = state.data.langs[it.code];
      var typ = l && !L.isLanguage(l.type) ? ' <span class="note">' + (L.TYPE_LABEL[l.type] || l.type) + "</span>" : "";
      html += '<li><div class="line"><a class="name" href="language.html?code=' + encodeURIComponent(it.code) + '">' + L.esc(name(it.code)) + "</a>" + typ +
        '<span class="num">' + numLink(it.n, r.arr, L.pairCode(r.direct, state.filters), L.pairCode(it.code, state.filters), r.cat) + "</span></div>" +
        '<div class="bar"><span style="width:' + Math.max(0.5, Math.min(100, 100 * it.n / r.words)).toFixed(2) + '%"></span></div>' +
        (it.ex.length ? '<p class="ex">' + five(it.ex).map(L.esc).join(", ") + "</p>" : "") + "</li>";
    });
    html += "</ul>";
    var notes = [];
    if (r.hidden) notes.push(L.n(r.hidden) + " go back to families, proto-languages or non-languages (hidden by the option above)");
    if (r.rest) notes.push(L.n(r.rest) + (r.rest === 1 ? " word has" : " words have") + " no earlier step in Wiktionary");
    if (notes.length) html += '<p class="note">' + notes.join("; ") + ".</p>";
    return html;
  }

  function rowHtml(row, max) {
    var id = row.side + "|" + row.other + "|" + row.cat;
    var open = !!state.open[id];
    var l = state.data.langs[row.other] || { type: "lingua" };
    var typ = !L.isLanguage(l.type) ? ' <span class="note">' + (L.TYPE_LABEL[l.type] || l.type) + "</span>" : "";
    var cat = L.CAT_BY_KEY[row.cat];
    return '<li class="row' + (open ? " open" : "") + '" data-id="' + L.esc(id) + '">' +
      '<div class="line"><button type="button" class="toggle" aria-expanded="' + open + '" aria-label="Show the step before">' + (open ? "−" : "+") + "</button>" +
      '<a class="name" href="language.html?code=' + encodeURIComponent(row.other) + '">' + L.esc(name(row.other)) + "</a>" + typ +
      '<span class="cat">' + cat.label + "</span>" +
      '<span class="num">' + (row.side === "from"
        ? numLink(row.n, state.code, L.pairCode(row.other, state.filters), "", row.cat)
        : numLink(row.n, row.other, L.pairCode(state.code, state.filters), "", row.cat)) + "</span></div>" +
      '<div class="bar"><span style="width:' + Math.max(0.3, 100 * row.n / max).toFixed(2) + '%"></span></div>' +
      (row.ex.length ? '<p class="ex">' + five(row.ex).map(L.esc).join(", ") + "</p>" : "") +
      '<div class="sub"' + (open ? "" : " hidden") + ">" + (open ? subHtml(row) : "") + "</div></li>";
  }

  function render() {
    var l = state.data.langs[state.code];
    document.title = l.name + " — lexodus";
    el("lang-title").textContent = l.name;
    var sub = [];
    if (l.target) sub.push(L.esc(L.coverageText(l)));
    else sub.push("not one of the 33 languages read here, so only “gave to” is known");
    if (l.code === "la" && !state.filters.splitLatin) sub.push("all varieties together: " + L.esc(L.latinVarieties(state.data.langs).join(", ")));
    else if (L.isLatin(l.code) && l.code !== "la" && !state.filters.splitLatin) sub.push('counted inside <a href="language.html?code=la">Latin</a> elsewhere');
    if (!L.isLanguage(l.type)) sub.push(L.TYPE_LABEL[l.type] || l.type);
    el("lang-sub").innerHTML = sub.join(" · ");
    el("notice").textContent = "These numbers are a snapshot of English Wiktionary, not a measure of the vocabulary. Words without an etymology there are not counted." +
      (L.NOTES[l.code] ? " " + L.NOTES[l.code] : "");

    var from = l.target ? rows("from") : [], to = rows("to");
    var max = Math.max(1, from.reduce(function (m, r) { return Math.max(m, r.n); }, 0), to.reduce(function (m, r) { return Math.max(m, r.n); }, 0));
    var tf = from.reduce(function (s, r) { return s + r.n; }, 0), tt = to.reduce(function (s, r) { return s + r.n; }, 0);
    var big = Math.max(tf, tt), small = Math.min(tf, tt);
    var note = el("scale-note");
    note.hidden = !(l.target && big > 0 && small * 5 < big);
    if (!note.hidden) note.textContent = (tf < tt ? "Took from" : "Gave to") + " is drawn to the same scale: " + L.n(small) + " words vs " + L.n(big) + ".";

    el("from-block").hidden = !l.target;
    [["from", from, tf], ["to", to, tt]].forEach(function (s) {
      var side = s[0], list = s[1], total = s[2];
      var langs = {};
      list.forEach(function (r) { langs[r.other] = 1; });
      var nl = Object.keys(langs).length;
      el(side + "-sum").textContent = list.length
        ? L.n(total) + " words, " + nl + (nl === 1 ? " language" : " languages")
        : "No words with these settings.";
      el(side + "-list").innerHTML = list.slice(0, state.show[side]).map(function (r) { return rowHtml(r, max); }).join("");
      var more = el(side + "-more");
      more.hidden = list.length <= state.show[side];
      more.textContent = "Show all " + list.length;
      el(side + "-list")._rows = list;
    });
    el("jump").value = l.target ? l.code : "";
  }

  function toggleRow(li, side) {
    var id = li.dataset.id;
    var row = el(side + "-list")._rows.filter(function (r) { return r.side + "|" + r.other + "|" + r.cat === id; })[0];
    if (!row) return;
    var open = !state.open[id];
    if (open) state.open[id] = true; else delete state.open[id];
    li.classList.toggle("open", open);
    var b = li.querySelector(".toggle");
    b.setAttribute("aria-expanded", open); b.textContent = open ? "−" : "+";
    var sub = li.querySelector(".sub");
    sub.innerHTML = open ? subHtml(row) : "";
    sub.hidden = !open;
  }

  Promise.all([L.load(), L.extra("coppie_elenco")]).then(function (res) {
    var data = res[0];
    state.data = data;
    state.pairs = res[1] || {};
    L.footer(data.source);
    var code = L.param("code") || "it";
    if (!data.langs[code]) {
      el("loading").innerHTML = "There is no language with the code “" + L.esc(code) + "” in the data. <a href=\"index.html\">Choose a language</a>.";
      return;
    }
    state.code = code;
    el("loading").hidden = true; el("app").hidden = false;
    el("jump").innerHTML = '<option value="">other language…</option>' + data.targets.map(function (t) {
      return '<option value="' + t.code + '">' + L.esc(t.name) + "</option>";
    }).join("");
    el("jump").addEventListener("change", function (e) { if (e.target.value) location.href = "language.html?code=" + encodeURIComponent(e.target.value); });
    state.filters = L.filterBar(el("filters"), function (f) { state.filters = f; state.open = {}; render(); });
    ["from", "to"].forEach(function (side) {
      el(side + "-more").addEventListener("click", function () { state.show[side] = Infinity; render(); });
      el(side + "-list").addEventListener("click", function (e) {
        if (e.target.closest("a")) return;
        var li = e.target.closest("li.row");
        if (li && !e.target.closest(".sub")) toggleRow(li, side);
      });
    });
    render();
  }).catch(function (err) {
    el("loading").textContent = "The data could not be loaded (" + err.message + ").";
    console.error(err);
  });
})();
