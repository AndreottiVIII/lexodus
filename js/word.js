/* lexodus — word.html?lang=it&w=caffè&n=1[&from=ota]: one word and the way it came, step by step. */
(function () {
  "use strict";
  var L = window.Lex;
  var lang = L.param("lang") || "", w = L.param("w") || "", n = parseInt(L.param("n") || "0", 10) || 0, from = L.param("from") || "";
  function el(id) { return document.getElementById(id); }

  function find(d) {
    var list = (d && d.parole) || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].parola === w && (!n || +list[i].n_etimologia === n)) return list[i];
    }
    return null;
  }
  // The direct language of the word when the link has no ?from= (fix of 18/10/2026: the page used to read every
  // pair file of the language one after the other, and stayed on "Loading…" for words like German Kreuzer).
  // 1. the tree, alberi/<lang>/<letter>.json, entry "word|n": the direct language is su[0].codice (for Latin the
  //    precise variety, whose own pair file exists); with no su but alternatives, the file _alternative;
  // 2. otherwise the search index, indice/<letter>.json: field o (codes joined by "|" = alternatives);
  // 3. otherwise nothing: "not in the lists", no scanning.
  function treeLetter() {
    var own = L.letterOf(L.norm(w));
    if (own !== "_" || L.isLatinScript(w)) return Promise.resolve(own);
    return L.fetchJson("data/indice/_meta.json").then(function (m) {
      var file = L.indexFileOfLang(m, lang);
      return file ? L.fetchJson("data/" + file) : [];
    }).then(function (d) {
      var r = L.indexRows(d).filter(function (x) { return x.l === lang && x.p === w; })[0];
      return (r && r.f) || L.treeLetter(w, r && r.t);
    }).catch(function () { return own; });
  }
  function fromCodes(o) {
    return String(o || "").split("|").length > 1 ? ["_alternative"] : o ? [L.fileCode(o)] : [];
  }
  function directFromTree() {
    return treeLetter().then(function (x) {
      return L.fetchJson("data/alberi/" + L.fileCode(lang) + "/" + encodeURIComponent(x) + ".json").catch(function () { return null; });
    }).then(function (d) {
      if (!d) return [];
      var e = d[w + "|" + (n || 1)];
      if (!e) {
        // no etymology with this number (a link with n=1 for German Kreuzer, which only has n=2): take the
        // word's own one, and show it
        var k = Object.keys(d).filter(function (k) { return k.slice(0, k.lastIndexOf("|")) === w; })[0];
        e = k && d[k];
        if (e) n = +k.slice(k.lastIndexOf("|") + 1) || n;
      }
      if (!e) return [];
      if (e.su && e.su.length) return [L.fileCode(e.su[0].codice)];
      return (e.alternative || []).length ? ["_alternative"] : [];
    });
  }
  function directFromIndex() {
    var nw = L.norm(w);
    return L.fetchJson("data/indice/_meta.json").then(function (meta) {
      if (meta.tabella_lettere) L.setLetterTable(meta.tabella_lettere);
      var files = L.letterOf(nw) === "_" ? [L.indexFileOfLang(meta, lang)].filter(Boolean) : L.indexFiles(nw, meta);
      return Promise.all(files.map(function (f) { return L.fetchJson("data/" + f).catch(function () { return []; }); }));
    }).then(function (all) {
      var rows = [].concat.apply([], all.map(L.indexRows)).filter(function (r) { return r.l === lang && r.p === w; });
      var r = rows.filter(function (r) { return !n || +r.ne === n; })[0] || rows[0];
      if (r && r.ne) n = +r.ne;
      return r ? fromCodes(r.o) : [];
    }).catch(function () { return []; });
  }
  function lookup() {
    return directFromTree().then(function (t) { return t.length ? t : directFromIndex(); }).then(function (tries) {
      if (tries.length && tries.indexOf("_alternative") < 0) tries.push("_alternative");
      return next(tries, 0);
    });
  }
  // With ?from= one file is enough; if the word is not there, the tree and the index say where it is.
  function locate() {
    if (!from || !L.hasPair(pairs, lang, from)) return lookup();
    return next([from], 0).then(function (found) { return found || lookup(); });
  }
  function next(tries, i) {
    if (i >= tries.length) return Promise.resolve(null);
    return L.fetchJson("data/coppie/" + L.fileCode(lang) + "/" + tries[i] + ".json")
      .catch(function () { return null; })
      .then(function (d) {
        var p = find(d);
        return p ? { word: p, file: tries[i], pair: d } : next(tries, i + 1);
      });
  }
  function langLink(code, names) {
    var name = names[code] || code;
    return names[code] ? '<a href="language.html?code=' + encodeURIComponent(code) + '">' + L.esc(name) + "</a>" : L.esc(name);
  }
  function stepHtml(t, names, how) {
    return '<div class="step"><span class="lang">' + langLink(t.codice, names) + "</span>" +
      '<span class="term">' + (t.termine ? L.esc(t.termine) + L.tr(t.traslitterazione, t.termine) : '<span class="note">no word given</span>') + "</span>" +
      '<span class="how note">' + L.esc(how) + "</span></div>";
  }

  function render(found, names) {
    var p = found.word, catena = p.catena || [], seen = {};
    var alts = (p.alternative || []).filter(function (a) {
      var k = a.codice + "|" + a.termine;
      if (seen[k]) return false;
      seen[k] = 1; return true;
    });
    document.title = p.parola + " (" + (names[lang] || lang) + ") — lexodus";
    el("word").innerHTML = L.esc(p.parola) + L.tr(p.traslitterazione, p.parola);
    var sub = [langLink(lang, names)];
    if (p.pos) sub.push(L.esc(p.pos.replace(/\|/g, ", ")));
    if (p.categoria) sub.push(L.esc(L.catLabel(p.categoria)));
    if (p.incerta && p.incerta !== "no") sub.push("uncertain etymology");
    if (found.file !== "_alternative") {
      sub.push('more words: <a href="' + L.esc(L.wordsUrl(lang, found.file)) + '">' + L.esc(names[lang] || lang) + " ← " + L.esc(found.pair.origine_nome || names[found.file] || found.file) + "</a>");
    }
    el("sub").innerHTML = sub.join(" · ");
    el("meaning").innerHTML = p.significato ? "“" + L.esc(p.significato) + "”" : '<span class="note">The meaning is not in the data yet.</span>';

    // The path: the word itself, then one row per step back to the furthest origin.
    var rows = ['<li class="here">' + stepHtml({ codice: lang, termine: p.parola, traslitterazione: p.traslitterazione }, names, "this word") + "</li>"];
    var rest = catena;
    if (alts.length) {
      var first = catena.length ? [catena[0]] : [];
      var options = first.concat(alts.filter(function (a) {
        return !first.length || a.codice !== first[0].codice || a.termine !== first[0].termine;
      }));
      rows.push('<li class="alts">' + options.map(function (t) { return stepHtml(t, names, L.catLabel(t.categoria)); })
        .join('<span class="or">or</span>') + "</li>");
      rest = catena.slice(1);
    }
    rest.forEach(function (t) { rows.push("<li>" + stepHtml(t, names, L.catLabel(t.categoria)) + "</li>"); });
    var codes = catena.concat(alts).map(function (t) { return t.codice; });
    if (p.lontana && p.lontana.indexOf("|") < 0 && codes.indexOf(p.lontana) < 0) {
      rows.push("<li>" + stepHtml({ codice: p.lontana, termine: "" }, names, "furthest origin") + "</li>");
    }
    el("path").innerHTML = rows.join("");
    var last = el("path").lastElementChild;
    if (last && rows.length > 1) last.classList.add("origin");
    el("path-note").textContent = (rows.length > 1
      ? "From the word down to its furthest origin. Each step says how the word passed from that language to the one above."
      : "Wiktionary gives no step for this word.") + (alts.length ? " Wiktionary gives more than one possible origin: they are side by side." : "");

    // The text is only in the simple pair file (mandate 09: not in LATINO.json nor in the second-level files).
    var text = p.testo !== undefined || !catena.length ? Promise.resolve(p.testo)
      : L.fetchJson("data/coppie/" + L.fileCode(lang) + "/" + L.fileCode(catena[0].codice) + ".json")
        .then(function (d) { var q = find(d); return q && q.testo; }).catch(function () { return ""; });
    text.then(function (t) { el("ety").textContent = (t || "No etymology text.") + (t && t.length >= 300 ? "…" : ""); });
    if (names._targets.indexOf(lang) >= 0) {
      el("tree-link").href = L.treeUrl(lang, p.parola, p.n_etimologia, p.traslitterazione);
      el("tree-line").hidden = false;
    }
    el("wikt").href = L.wiktUrl(p.parola, names[lang] || lang);
    el("loading").hidden = true; el("app").hidden = false;

    if (names._targets.indexOf(lang) < 0) return;
    // The first level of "giu" in the tree of the word (mandate 09; data/dati_a/ is gone).
    L.fetchJson("data/alberi/" + L.fileCode(lang) + "/" + encodeURIComponent(L.treeLetter(p.parola, p.traslitterazione)) + ".json").then(function (d) {
      var e = d[p.parola + "|" + (p.n_etimologia || 1)];
      var hits = ((e && e.giu) || []).map(function (g) { return [g.lingua, g.parola, g.n_etimologia, g.traslitterazione]; });
      if (!hits.length) return;
      var by = {}, order = [];
      hits.forEach(function (h) {
        if (!by[h[0]]) { by[h[0]] = []; order.push(h[0]); }
        by[h[0]].push(h);
      });
      order.sort(function (a, b) { return (names[a] || a).localeCompare(names[b] || b, "en"); });
      el("given-list").innerHTML = "This word was then taken by: " + order.map(function (c) {
        return langLink(c, names) + " (" + by[c].map(function (h) {
          return '<a href="' + L.esc(L.wordUrl(c, h[1], h[2], L.fileCode(lang))) + '"><i>' + L.esc(h[1]) + "</i></a>" + L.tr(h[3], h[1]);
        }).join(", ") + ")";
      }).join(", ") + ".";
      el("given").hidden = false;
    }).catch(function (e) { console.warn(e.message); });
  }

  var pairs = {};
  Promise.all([L.names(), L.extra("coppie_elenco")]).then(function (res) {
    var names = res[0];
    pairs = res[1] || {};
    L.footer();
    if (!lang || !w) throw new Error("missing ?lang= or ?w=");
    return locate().then(function (found) {
      if (!found) {
        el("loading").innerHTML = "“" + L.esc(w) + "” (" + L.esc(names[lang] || lang) + ") is not in the lists of words. " +
          '<a href="' + L.esc(L.wiktUrl(w, names[lang] || lang)) + '">Look it up on Wiktionary</a>.';
        return;
      }
      render(found, names);
    });
  }).catch(function (e) {
    el("loading").textContent = L.fetchFail(e);
    if (location.protocol !== "file:") console.warn(e.message);
  });
})();
