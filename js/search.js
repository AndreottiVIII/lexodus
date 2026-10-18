/* lexodus — search.html?q=caffè: a word in all 33 languages (data/indice/<letter>.json, mandate 09).
   Only the file of the letter typed is read; results are grouped by language and open tree.html. */
(function () {
  "use strict";
  var L = window.Lex;
  var PER_LANG = 12;
  function el(id) { return document.getElementById(id); }
  var meta = null, names = null;

  function getMeta() {
    if (!meta) meta = L.fetchJson("data/indice/_meta.json");
    return meta;
  }
  // Paths as in _meta.json ("indice/c.json"). A word not in Latin letters can be in two files (its own script
  // and its transliteration): keep it once.
  function loadFiles(list) {
    return Promise.all(list.map(function (f) { return L.fetchJson("data/" + f); })).then(function (parts) {
      var seen = {}, out = [];
      parts.forEach(function (d) {
        L.indexRows(d).forEach(function (r) {
          var k = r.l + "|" + r.p + "|" + r.ne;
          if (!seen[k]) { seen[k] = 1; out.push(r); }
        });
      });
      return out;
    });
  }

  // 0 = same word (or transliteration), 1 = starts with it, 2 = the meaning has it as a word.
  function rank(r, qs, qn) {
    var keys = [L.squash(r.p), L.squash(r.n), L.squash(r.t)];
    if (keys.indexOf(qs) >= 0) return 0;
    for (var i = 0; i < keys.length; i++) if (keys[i] && keys[i].indexOf(qs) === 0) return 1;
    var s = " " + L.norm(r.s).replace(/[^\p{L}\p{N}]+/gu, " ") + " ";
    if (qn.length >= 3 && s.indexOf(" " + qn + " ") >= 0) return 2;
    return -1;
  }

  function rowHtml(r) {
    var from = String(r.o || "").split("|").filter(Boolean).map(function (c) { return L.esc(names[c] || c); }).join(" or ");
    var unc = r.i || r.a ? ' <abbr class="unc" title="' + (r.a ? "more than one possible origin" : "uncertain etymology") + '">?</abbr>' : "";
    return '<li><div class="line"><a class="w" href="' + L.esc(L.treeUrl(r.l, r.p, r.ne, r.t)) + '">' + L.esc(r.p) + "</a>" + L.tr(r.t, r.p) + unc +
      ' <span class="note">' + L.esc(L.catLabel(r.c)) + (from ? " from " + from : "") + "</span></div>" +
      (r.s ? '<p class="mean">' + L.esc(r.s) + "</p>" : "") + "</li>";
  }

  function show(q, rows, note) {
    var qs = L.squash(q), qn = L.norm(q).trim();
    var hits = [];
    rows.forEach(function (r) { var k = rank(r, qs, qn); if (k >= 0) { r._k = k; hits.push(r); } });
    var by = {}, order = [];
    hits.forEach(function (r) { if (!by[r.l]) { by[r.l] = []; order.push(r.l); } by[r.l].push(r); });
    order.forEach(function (l) {
      by[l].sort(function (a, b) { return a._k - b._k || a.p.length - b.p.length || a.p.localeCompare(b.p) || a.ne - b.ne; });
    });
    order.sort(function (a, b) { return by[a][0]._k - by[b][0]._k || (names[a] || a).localeCompare(names[b] || b, "en"); });
    el("status").textContent = hits.length
      ? L.n(hits.length) + (hits.length === 1 ? " word" : " words") + " in " + order.length + (order.length === 1 ? " language" : " languages") + "." + (note || "")
      : "No word found for “" + q + "”." + (note || "");
    el("results").innerHTML = order.map(function (l) {
      var list = by[l];
      return '<section class="result-lang"><h2><a href="language.html?code=' + encodeURIComponent(l) + '">' + L.esc(names[l] || l) + "</a> " +
        '<span class="note">' + L.n(list.length) + "</span></h2><ul>" + list.slice(0, PER_LANG).map(rowHtml).join("") + "</ul>" +
        (list.length > PER_LANG ? '<button type="button" class="more" data-l="' + L.esc(l) + '">Show all ' + L.n(list.length) + "</button>" : "") + "</section>";
    }).join("");
    el("results").onclick = function (e) {
      var b = e.target.closest("button[data-l]");
      if (!b) return;
      b.previousElementSibling.innerHTML = by[b.dataset.l].map(rowHtml).join("");
      b.remove();
    };
  }

  function search(q) {
    q = q.trim();
    el("results").innerHTML = ""; el("all-line").hidden = true;
    if (!q) { el("status").textContent = ""; return; }
    el("status").textContent = "Searching…";
    getMeta().then(function (m) {
      L.setLetterTable(m.tabella_lettere);
      var files = (m.file || []).map(function (x) { return x.file; }), want = L.indexFiles(L.norm(q).trim(), m);
      return loadFiles(want).then(function (rows) {
        show(q, rows);
        // Meanings are only searched in the file of the letter typed; the whole index on request.
        if (L.norm(q).trim().length >= 3 && files.length > want.length) {
          el("all").textContent = "Also look for “" + q + "” in the meanings of all words (reads the whole index, " + files.length + " files)";
          el("all-line").hidden = false;
          el("all").onclick = function () {
            el("all-line").hidden = true; el("status").textContent = "Reading the whole index…";
            loadFiles(files).then(function (all) { show(q, all, " Meanings searched in the whole index."); });
          };
        }
      });
    }).catch(function (e) {
      el("status").textContent = L.fetchFail(e);
      if (location.protocol !== "file:") console.warn(e.message);
    });
  }

  L.names().then(function (n) {
    names = n;
    L.footer();
    var q = L.param("q") || "";
    el("q").value = q;
    el("form").addEventListener("submit", function (e) {
      e.preventDefault();
      var v = el("q").value.trim();
      history.replaceState(null, "", v ? "?q=" + encodeURIComponent(v) : location.pathname);
      document.title = (v ? v + " — " : "") + "Search — lexodus";
      search(v);
    });
    if (q) { document.title = q + " — Search — lexodus"; search(q); }
    else el("q").focus();
  }).catch(function (e) {
    el("status").textContent = "The data could not be loaded (" + e.message + ").";
    console.error(e);
  });
})();
