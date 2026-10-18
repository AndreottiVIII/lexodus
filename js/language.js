/* lexodus — language page: coverage, "took from" and "gave to" tables. */
(function () {
  "use strict";
  var L = window.Lex;
  var state = { code: "it", data: null, filters: null, show: { from: 40, to: 40 } };
  function el(id) { return document.getElementById(id); }

  // One row per (language on the other side, category); Latin varieties merged unless split.
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
      var r = by[k] || (by[k] = { other: other, a: { cat: a.cat, n: 0, unc: 0, ex: [] } });
      r.a.n += a.n; r.a.unc += a.unc;
      a.ex.forEach(function (w) { if (r.a.ex.length < 12 && r.a.ex.indexOf(w) < 0) r.a.ex.push(w); });
    });
    return Object.keys(by).map(function (k) { return by[k]; })
      .sort(function (x, y) { return y.a.n - x.a.n || x.other.localeCompare(y.other); });
  }

  function table(side) {
    var list = rows(side);
    var langsCount = {}, total = 0, unc = 0;
    list.forEach(function (r) { langsCount[r.other] = 1; total += r.a.n; unc += r.a.unc; });
    var nl = Object.keys(langsCount).length;
    el(side + "-sum").textContent = list.length
      ? L.n(total) + (side === "from" ? " words from " : " words to ") + nl + (nl === 1 ? " language" : " languages") + (unc ? ", " + L.n(unc) + " of them uncertain" : "") + "."
      : "No words with these filters.";
    var shown = list.slice(0, state.show[side]);
    var html = '<table><thead><tr><th scope="col">Language</th><th scope="col">Category</th><th scope="col" class="num">Words</th><th scope="col" class="num">Uncertain</th><th scope="col">Examples</th></tr></thead><tbody>';
    shown.forEach(function (r) {
      var l = state.data.langs[r.other] || { name: r.other, type: "lingua" };
      var cat = L.CAT_BY_KEY[r.a.cat];
      var typ = !L.isLanguage(l.type) ? ' <span class="code">' + (L.TYPE_LABEL[l.type] || l.type) + "</span>" : "";
      html += '<tr><td class="lang"><a href="language.html?code=' + encodeURIComponent(r.other) + '">' + L.esc(l.name) + '</a><span class="code">' + L.esc(r.other) + "</span>" + typ + "</td>" +
        '<td class="cat"><span class="sw sw-' + cat.id + '" aria-hidden="true"></span>' + cat.label + "</td>" +
        '<td class="num">' + L.n(r.a.n) + '</td><td class="num">' + (r.a.unc ? L.n(r.a.unc) : "–") + "</td>" +
        '<td class="ex">' + (r.a.ex.length ? r.a.ex.map(L.esc).join(", ") : '<span class="ex-none">no short example</span>') + "</td></tr>";
    });
    html += "</tbody></table>";
    el(side + "-table").innerHTML = list.length ? html : "";
    var more = el(side + "-more");
    more.hidden = list.length <= state.show[side];
    more.textContent = "Show all " + list.length + " rows";
  }

  function render() {
    var l = state.data.langs[state.code];
    document.title = l.name + " — lexodus";
    el("lang-title").textContent = l.name;
    var sub = '<span class="code">' + L.esc(l.code) + "</span>";
    if (l.nameIt) sub += "<span>Italian name: " + L.esc(l.nameIt) + "</span>";
    if (!L.isLanguage(l.type)) sub += "<span>" + (L.TYPE_LABEL[l.type] || l.type) + "</span>";
    if (l.code === "la" && !state.filters.splitLatin) sub += "<span>All varieties together: " + L.esc(L.latinVarieties(state.data.langs).join(", ")) + "</span>";
    else if (L.isLatin(l.code) && l.code !== "la" && !state.filters.splitLatin) sub += '<span>Counted inside <a href="language.html?code=la">Latin</a> in the network</span>';
    if (l.target) sub += L.coverageBadge(l.coverage) + '<a href="index.html?lang=' + encodeURIComponent(l.code) + '">See it in the network</a>';
    el("lang-sub").innerHTML = sub;

    if (l.target) {
      var cov = L.COVERAGE[l.coverage];
      el("facts").hidden = false;
      el("facts").innerHTML =
        "<div><dt>Entries</dt><dd>" + (l.lemmas !== null ? L.n(l.lemmas) : "–") + " <small>lemmas</small></dd></div>" +
        "<div><dt>With an etymology</dt><dd>" + (l.withEty !== null ? L.n(l.withEty) : "–") + (l.pct !== null ? " <small>" + l.pct.toLocaleString("en-GB") + "%</small>" : "") + "</dd></div>" +
        "<div><dt>Linked to another language</dt><dd>" + (l.linked !== null ? L.n(l.linked) : "–") + " <small>words</small></dd></div>" +
        "<div><dt>Coverage</dt><dd>" + (cov ? cov.label : "–") + (cov ? " <small>" + cov.text + "</small>" : "") + "</dd></div>";
      el("notice").innerHTML = "<strong>A snapshot of English Wiktionary, not a measure of the vocabulary.</strong> Half-empty dictionaries give small numbers; a language with few links did not necessarily borrow little." +
        (L.NOTES[l.code] ? " " + L.esc(L.NOTES[l.code]) : "");
      el("from-block").hidden = false;
    } else {
      el("facts").hidden = true;
      el("notice").innerHTML = "<strong>Not one of the 33 languages studied.</strong> lexodus only reads the etymologies of 33 European and nearby languages, so for " + L.esc(l.name) +
        " it can only show which of them took words from it." + (L.NOTES[l.code] ? " " + L.esc(L.NOTES[l.code]) : "");
      el("from-block").hidden = true;
    }
    if (l.target) table("from");
    table("to");
    el("jump").value = l.target ? l.code : "";
  }

  L.load().then(function (data) {
    state.data = data;
    L.footer(data.source);
    var code = L.param("code") || "it";
    if (!data.langs[code]) {
      el("loading").className = "error";
      el("loading").innerHTML = "There is no language with the code “" + L.esc(code) + "” in the data. <a href=\"language.html?code=it\">Open Italian</a>.";
      return;
    }
    state.code = code;
    el("loading").hidden = true; el("app").hidden = false;
    el("jump").innerHTML = '<option value="">Choose a language</option>' + data.targets.map(function (t) {
      return '<option value="' + t.code + '">' + L.esc(t.name) + "</option>";
    }).join("");
    el("jump").addEventListener("change", function (e) { if (e.target.value) location.href = "language.html?code=" + encodeURIComponent(e.target.value); });
    state.filters = L.filterBar(el("filters"), function (f) { state.filters = f; render(); });
    ["from", "to"].forEach(function (side) {
      el(side + "-more").addEventListener("click", function () { state.show[side] = Infinity; table(side); });
    });
    render();
  }).catch(function (err) {
    el("loading").className = "error";
    el("loading").textContent = "The data could not be loaded (" + err.message + ").";
    console.error(err);
  });
})();
