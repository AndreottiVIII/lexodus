/* lexodus — words.html?to=sq&from=LATINO[&via=grc][&cat=borrowed]: the words of one pair of languages. */
(function () {
  "use strict";
  var L = window.Lex;
  var PER_PAGE = 50;
  var to = L.param("to") || "", from = L.param("from") || "", via = L.param("via") || "";
  var state = { all: [], cats: [], q: "", page: 0 };
  function el(id) { return document.getElementById(id); }
  function isLat(c) { return c === "LATINO" || L.isLatin(c); }

  // The step of the chain that matches "via" (for LATINO: the first non-Latin step after the direct one).
  function viaStep(p) {
    if (!via) return null;
    var c = p.catena || [];
    for (var i = 1; i < c.length; i++) {
      if (via === "LATINO" ? isLat(c[i].codice) : L.fileCode(c[i].codice) === via) return c[i];
      if (from === "LATINO" && !isLat(c[i].codice)) break;
    }
    return c[1] || null;
  }
  function step(t, names) {
    if (!t) return "";
    return L.esc(t.nome || names[t.codice] || t.codice) + (t.termine ? " <i>" + L.esc(t.termine) + "</i>" : "");
  }

  function render(names) {
    var q = L.fold(state.q.trim());
    var shown = state.all.filter(function (p) {
      if (state.cats.indexOf(p.categoria) < 0) return false;
      return !q || p._s.indexOf(q) >= 0;
    });
    var pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
    state.page = Math.min(state.page, pages - 1);
    var start = state.page * PER_PAGE, slice = shown.slice(start, start + PER_PAGE);
    el("count").textContent = shown.length
      ? (shown.length === state.all.length ? "" : L.n(shown.length) + " of " + L.n(state.all.length) + " words shown. ") +
        (pages > 1 ? "Words " + L.n(start + 1) + "–" + L.n(start + slice.length) + "." : "")
      : "No words with these settings.";
    el("list").innerHTML = slice.map(function (p) {
      var c = (p.catena || [])[0];
      var unc = p.incerta && p.incerta !== "no" ? ' <abbr class="unc" title="uncertain etymology">?</abbr>' : "";
      var v = viaStep(p);
      return "<tr><td class=\"w\"><a href=\"" + L.esc(L.wordUrl(to, p.parola, p.n_etimologia, from)) + "\">" + L.esc(p.parola) + "</a>" + unc +
        (p.pos ? ' <span class="note">' + L.esc(p.pos.replace(/\|/g, ", ")) + "</span>" : "") + "</td>" +
        "<td>" + (p.significato ? L.esc(p.significato) : '<span class="note">—</span>') + "</td>" +
        "<td>" + step(c, names) + (v ? ' <span class="note">←</span> ' + step(v, names) : "") + "</td>" +
        '<td class="note">' + L.esc(L.catLabel(p.categoria)) + "</td></tr>";
    }).join("");
    el("pager").hidden = pages < 2;
    el("page").textContent = "page " + (state.page + 1) + " of " + pages;
    el("prev").disabled = state.page === 0;
    el("next").disabled = state.page >= pages - 1;
  }

  L.names().then(function (names) {
    L.footer();
    if (!to || !from) throw new Error("missing ?to= or ?from=");
    var title = (names[to] || to) + " ← " + (names[from] || from) + (via ? " ← " + (names[via] || via) : "");
    document.title = title + " — lexodus";
    return L.fetchJson(L.pairPath(to, from, via)).then(function (d) {
      var nameFrom = from === "LATINO" ? "Latin" : d.origine_nome || names[from] || from;
      var nameVia = via === "LATINO" ? "Latin" : via ? (d.livello2_nome || names[via] || via) : "";
      title = (names[to] || to) + " ← " + nameFrom + (via ? " ← " + nameVia : "");
      document.title = title + " — lexodus";
      el("title").textContent = title + ": " + L.n(d.n || d.parole.length) + ((d.n || d.parole.length) === 1 ? " word" : " words");
      var back = '<a href="language.html?code=' + encodeURIComponent(to) + '">' + L.esc(names[to] || to) + "</a>";
      var fromCode = from === "LATINO" ? "la" : from;
      el("sub").innerHTML = (via
        ? "Words that " + back + " took from " + L.esc(nameFrom) + ", which had them from " + L.esc(nameVia) + " one step before."
        : "Words that " + back + " took directly from " + '<a href="language.html?code=' + encodeURIComponent(fromCode) + '">' + L.esc(nameFrom) + "</a>.") +
        (from === "LATINO" ? " All varieties of Latin together." : "") + " Alphabetical order.";
      state.all = d.parole.map(function (p) {
        p._s = L.fold([p.parola, p.significato, p.termine_origine].join(" "));
        return p;
      });
      var counts = {};
      state.all.forEach(function (p) { counts[p.categoria] = (counts[p.categoria] || 0) + 1; });
      var present = L.CATS.filter(function (c) { return counts[c.key]; });
      var wanted = L.CAT_BY_KEY[L.param("cat") || ""];
      state.cats = wanted && counts[wanted.key] ? [wanted.key] : present.map(function (c) { return c.key; });
      if (state.cats.length > 1 || !wanted) Object.keys(counts).forEach(function (k) { if (!L.CAT_BY_KEY[k]) state.cats.push(k); });
      el("cats").insertAdjacentHTML("beforeend", present.map(function (c) {
        return '<label><input type="checkbox" data-cat="' + c.key + '"' + (state.cats.indexOf(c.key) >= 0 ? " checked" : "") + "> " +
          c.label + ' <span class="note">' + L.n(counts[c.key]) + "</span></label>";
      }).join(""));
      el("cats").addEventListener("change", function () {
        state.cats = Array.prototype.map.call(el("cats").querySelectorAll("input:checked"), function (x) { return x.dataset.cat; });
        state.page = 0; render(names);
      });
      el("q").addEventListener("input", function (e) { state.q = e.target.value; state.page = 0; render(names); });
      el("prev").addEventListener("click", function () { state.page--; render(names); window.scrollTo(0, 0); });
      el("next").addEventListener("click", function () { state.page++; render(names); window.scrollTo(0, 0); });
      el("loading").hidden = true; el("app").hidden = false;
      render(names);
    });
  }).catch(function (e) {
    el("loading").textContent = L.fetchFail(e);
    if (location.protocol !== "file:") console.warn(e.message);
  });
})();
