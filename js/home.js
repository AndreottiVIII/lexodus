/* lexodus — home: the 33×33 grid (who took from whom). The list of the languages is languages.html. */
(function () {
  "use strict";
  var L = window.Lex;
  // Five tones of blue on a log scale from 1 to the 95th percentile of the squares of the grid (Davide, 18/10/2026):
  // the few squares above it (Romanian ← French, 28,664) stay in the darkest tone and do not flatten the others.
  var STEPS = [1, 10, 100, 1000, 10000];
  function nice(v) {
    if (v <= 1) return 1;
    var e = Math.pow(10, Math.floor(Math.log10(v))), m = v / e;
    return (m < 1.5 ? 1 : m < 2.5 ? 2 : m < 4 ? 3 : m < 7.5 ? 5 : 10) * e;
  }
  function scale(data) {
    var vals = [];
    Object.keys(data).forEach(function (r) { Object.keys(data[r]).forEach(function (c) { if (c !== r && data[r][c] > 0) vals.push(data[r][c]); }); });
    vals.sort(function (a, b) { return a - b; });
    var p95 = vals.length ? vals[Math.floor(0.95 * (vals.length - 1))] : 10000;
    var out = [1];
    for (var i = 1; i < 5; i++) out.push(Math.max(out[i - 1] + 1, nice(Math.pow(p95, i / 5))));
    return { steps: out, p95: p95 };
  }
  function tone(v) { var t = 0; STEPS.forEach(function (s, i) { if (v >= s) t = i + 1; }); return t; }
  function compact(v) { return v >= 1000 ? Math.round(v / 1000) + "k" : String(v); }
  function el(id) { return document.getElementById(id); }

  Promise.all([L.load(), L.extra("griglia"), L.extra("coppie_elenco")]).then(function (res) {
    var d = res[0], g = res[1], pairs = res[2] || {};
    L.footer(d.source);
    el("loading").hidden = true;
    if (!g) throw new Error("data/griglia.json");

    var rows = g.lingue.map(function (l) { return { code: l.codice, name: (d.langs[l.codice] || {}).name || l.nome_en || l.codice }; })
      .sort(function (a, b) { return a.name.localeCompare(b.name, "en"); });
    var cols = rows.concat([{ code: "LATINO", name: "Latin", extra: true }, { code: "altre", name: "other", extra: true }]);
    var level = "1";

    function headCell(c) {
      var href = c.code === "LATINO" ? "language.html?code=la" : c.code === "altre" ? "" : "language.html?code=" + encodeURIComponent(c.code);
      var inner = '<span>' + L.esc(c.name) + "</span>";
      return '<th scope="col" class="col' + (c.extra ? " extra" : "") + '">' + (href ? '<a href="' + href + '">' + inner + "</a>" : inner) + "</th>";
    }
    // "other": the three biggest languages inside it (griglia.json, altre_dettaglio).
    function others(r) {
      var det = g.altre_dettaglio && g.altre_dettaglio[level === "1" ? "primo_livello" : "secondo_livello"];
      var m = (det && det[r.code]) || {};
      var top = Object.keys(m).sort(function (a, b) { return m[b] - m[a]; }).slice(0, 3);
      return top.length ? " (" + top.map(function (k) { return ((d.langs[k] || {}).name || k) + " " + L.n(m[k]); }).join(", ") + "…)" : "";
    }
    function caption(r, c, v) {
      var words = L.n(v) + (v === 1 ? " word" : " words");
      if (level === "1") {
        return c.code === "altre"
          ? r.name + " took " + words + " from other languages" + others(r)
          : r.name + " took " + words + " from " + c.name;
      }
      return words + " of " + r.name + " came from " + (c.code === "altre" ? "other languages" + others(r) : c.name) + " one step before the direct one";
    }

    function draw() {
      var data = (level === "1" ? g.primo_livello : g.secondo_livello) || {};
      var sc = scale(data);
      STEPS = sc.steps;
      legend(sc);
      var html = '<thead><tr><th scope="col" class="corner"><span>took ↓ from →</span></th>' + cols.map(headCell).join("") + "</tr></thead><tbody>";
      rows.forEach(function (r) {
        var line = data[r.code] || {};
        html += '<tr><th scope="row" class="rowname"><a href="language.html?code=' + encodeURIComponent(r.code) + '">' + L.esc(r.name) + "</a></th>";
        cols.forEach(function (c) {
          var x = c.extra ? " x" : "";
          if (c.code === r.code) { html += '<td class="self" aria-hidden="true"></td>'; return; }
          var v = line[c.code] || 0;
          if (!v) { html += '<td class="zero' + x + '"></td>'; return; }
          var t = tone(v), cap = caption(r, c, v);
          // A square opens its list of words when the file exists (mandate 09: second level = coppie/<row>/__via_<col>.json,
          // "other" = coppie/<row>/__altre.json); otherwise the page of the language of the row.
          var href = "language.html?code=" + encodeURIComponent(r.code);
          if (level === "1" && c.code === "altre") { if (L.hasGridFile(pairs, r.code, "_altre")) href = L.wordsUrl(r.code, "other"); }
          else if (level === "1") { if (L.hasPair(pairs, r.code, c.code)) href = L.wordsUrl(r.code, c.code); }
          else if (L.hasGridFile(pairs, r.code, "_via", c.code)) href = L.viaUrl(r.code, c.code);
          html += '<td class="t' + t + x + '"><a href="' + href + '" title="' + L.esc(cap) + '" data-cap="' + L.esc(cap) + '">' +
            (v >= 1000 ? compact(v) : '<span class="visually-hidden">' + L.n(v) + "</span>") + "</a></td>";
        });
        html += "</tr>";
      });
      el("grid").innerHTML = html + "</tbody>";
      el("grid-explain").innerHTML = (level === "1"
        ? "Rows: the language that took the words. Columns: the language it took them from directly. Borrowed, learned Latin and calque only. Click a square for the list of words, a name for its page."
        : "Second level: the language the words had come from one step before the direct one, whatever the direct one was (Italian caffè: Ottoman Turkish first, Arabic second). Click a square for the list of words, a name for its page.") +
        ' Romanian is a case apart: its editors credit French with almost every learned word (<a href="' + L.RO_LINK + '">see the note</a>).';
    }

    el("grid").addEventListener("mouseover", show);
    el("grid").addEventListener("focusin", show);
    function show(e) {
      var a = e.target.closest("a[data-cap]");
      el("grid-status").textContent = a ? a.dataset.cap + "." : " ";
    }
    function legend(sc) {
      var st = sc.steps, labels = [];
      for (var i = 0; i < 5; i++) {
        labels.push(i < 4 ? (st[i + 1] - 1 > st[i] ? L.n(st[i]) + "–" + L.n(st[i + 1] - 1) : L.n(st[i])) : L.n(st[4]) + " or more");
      }
      el("grid-legend").innerHTML = "Words: " + labels.map(function (t, i) {
        return '<span class="key"><i class="t' + (i + 1) + '"></i>' + t + "</span>";
      }).join("") + " The tones go up to the 95th percentile of the squares (" + L.n(sc.p95) + "); the few above it stay in the darkest tone." +
        " “Other” = every language outside the 33 except Latin (Ancient Greek, Old French, Ottoman Turkish…). Numbers are those of English Wiktionary.";
    }
    el("level-switch").addEventListener("change", function (e) { level = e.target.value; draw(); });
    draw();
    el("grid-block").hidden = false;
  }).catch(function (e) {
    el("loading").textContent = "The data could not be loaded (" + e.message + ").";
    console.error(e);
  });
})();
