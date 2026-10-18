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
  // With ?from= one file is enough. Without it (or if the word is not there): the file of the words with
  // more than one possible origin, then every pair file of the language, one after the other.
  function locate(pairs) {
    var tries = [];
    if (from) tries.push(from);
    var mine = pairs[L.fileCode(lang)] || {};
    if (mine._alternative && tries.indexOf("_alternative") < 0) tries.push("_alternative");
    Object.keys(mine).sort(function (a, b) { return (b === "LATINO") - (a === "LATINO"); }).forEach(function (o) {
      if (o !== "_alternative" && tries.indexOf(o) < 0) tries.push(o);
    });
    function next(i) {
      if (i >= tries.length) return Promise.resolve(null);
      return L.fetchJson("data/coppie/" + L.fileCode(lang) + "/" + tries[i] + ".json")
        .catch(function () { return null; })
        .then(function (d) {
          var p = find(d);
          return p ? { word: p, file: tries[i], pair: d } : next(i + 1);
        });
    }
    return next(0);
  }

  function langLink(code, names) {
    var name = names[code] || code;
    return names[code] ? '<a href="language.html?code=' + encodeURIComponent(code) + '">' + L.esc(name) + "</a>" : L.esc(name);
  }
  function stepHtml(t, names, how) {
    return '<div class="step"><span class="lang">' + langLink(t.codice, names) + "</span>" +
      '<span class="term">' + (t.termine ? L.esc(t.termine) : '<span class="note">no word given</span>') + "</span>" +
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
    el("word").textContent = p.parola;
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
    var rows = ['<li class="here">' + stepHtml({ codice: lang, termine: p.parola }, names, "this word") + "</li>"];
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

    el("ety").textContent = (p.testo || "No etymology text.") + (p.testo && p.testo.length >= 300 ? "…" : "");
    el("wikt").href = L.wiktUrl(p.parola, names[lang] || lang);
    el("loading").hidden = true; el("app").hidden = false;

    if (names._targets.indexOf(lang) < 0) return;
    L.fetchJson("data/dati_a/" + L.fileCode(lang) + ".json").then(function (idx) {
      var hits = idx[p.parola] || [];
      if (!hits.length) {
        var f = L.fold(p.parola);
        Object.keys(idx).forEach(function (k) { if (L.fold(k) === f) hits = hits.concat(idx[k]); });
      }
      if (!hits.length) return;
      var by = {}, order = [];
      hits.forEach(function (h) {
        if (!by[h[0]]) { by[h[0]] = []; order.push(h[0]); }
        by[h[0]].push(h);
      });
      order.sort(function (a, b) { return (names[a] || a).localeCompare(names[b] || b, "en"); });
      el("given-list").innerHTML = "This word was then taken by: " + order.map(function (c) {
        return langLink(c, names) + " (" + by[c].map(function (h) {
          return '<a href="' + L.esc(L.wordUrl(c, h[1], h[2], L.fileCode(lang))) + '"><i>' + L.esc(h[1]) + "</i></a>";
        }).join(", ") + ")";
      }).join(", ") + ".";
      el("given").hidden = false;
    }).catch(function (e) { console.warn(e.message); });
  }

  Promise.all([L.names(), L.extra("coppie_elenco")]).then(function (res) {
    var names = res[0], pairs = res[1] || {};
    L.footer();
    if (!lang || !w) throw new Error("missing ?lang= or ?w=");
    return locate(pairs).then(function (found) {
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
