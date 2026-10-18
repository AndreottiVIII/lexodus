/* lexodus — tree.html?lang=it&w=caffè&n=1[&f=c]: the tree of one word (data/alberi/<lang>/<letter>.json, mandate 09).
   su = the chain up to the furthest origin (shown at the top), giu = the languages that took the word, recursively.
   radici_altre = the same spelling with another etymology in the same language: one more tree each. */
(function () {
  "use strict";
  var L = window.Lex;
  var lang = L.param("lang") || "", w = L.param("w") || "", n = parseInt(L.param("n") || "1", 10) || 1, f = L.param("f") || "";
  function el(id) { return document.getElementById(id); }
  var names, targets;
  function keyWord(k) { return k.slice(0, k.lastIndexOf("|")); }
  function keyN(k) { return +k.slice(k.lastIndexOf("|") + 1) || 1; }

  // The tree file: alberi/<lang>/<letter>.json, letter of the normalised word (of its transliteration when it is
  // not in Latin letters). Links carry it as &f= when it differs from the word's own; without it, a word in
  // another script is looked up in the "_" index file of its language to find its transliteration.
  function letter() {
    if (f) return Promise.resolve(f);
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
  function locate() {
    return letter().then(function (x) {
      return L.fetchJson("data/alberi/" + L.fileCode(lang) + "/" + encodeURIComponent(x) + ".json").catch(function () { return null; });
    }).then(function (d) {
      if (!d) return null;
      if (d[w + "|" + n]) return { file: d, key: w + "|" + n };
      var any = Object.keys(d).filter(function (k) { return keyWord(k) === w; })[0];
      return any ? { file: d, key: any } : null;
    });
  }

  function langLink(code) {
    var nm = names[code] || code;
    return names[code] ? '<a href="language.html?code=' + encodeURIComponent(code) + '">' + L.esc(nm) + "</a>" : L.esc(nm);
  }
  // One node: language, word (transliteration), how it got there, link to the word page, meaning in small.
  function node(o) {
    var word = o.word ? '<i class="tw">' + L.esc(o.word) + "</i>" + L.tr(o.tr, o.word) : '<span class="note">no word given</span>';
    var page = o.word && !o.here && targets.indexOf(o.lang) >= 0
      ? ' <a class="page" href="' + L.esc(L.wordUrl(o.lang, o.word, o.n || 1, o.from && o.from !== o.lang ? L.fileCode(o.from) : "")) + '">word page</a>' : "";
    return '<div class="node' + (o.here ? " here" : "") + '"><span class="lang">' + langLink(o.lang) + "</span> " + word +
      (o.how ? ' <span class="how">' + L.esc(o.how) + "</span>" : "") +
      (o.amb ? ' <span class="amb" title="The word above has more than one etymology with the same spelling and Wiktionary does not say which one this word came from: it is shown under each of them.">' +
        (o.amb > 1 ? "one of " + o.amb + " origins of this spelling" : "one of several origins of this spelling") + "</span>" : "") + page +
      (o.mean ? '<span class="mean">' + L.esc(o.mean) + "</span>" : "") + "</div>";
  }
  // homographs: how many etymologies the spelling of the parent has (n_omografi_antenato + 1), when known.
  // parent: the language of the word above, which is the direct language of these words (for the word page link).
  function branches(list, homographs, parent) {
    if (!list || !list.length) return "";
    return '<ul class="branches">' + list.map(function (g) {
      return "<li>" + node({ lang: g.lingua, from: parent, word: g.parola, tr: g.traslitterazione, n: g.n_etimologia, mean: g.significato, how: L.catLabel(g.categoria), amb: g.ambiguo ? homographs || 1 : 0 }) +
        branches(g.giu, g.n_omografi_antenato ? g.n_omografi_antenato + 1 : 0, g.lingua) + (g.troncato ? '<p class="note cut">… more not shown</p>' : "") + "</li>";
    }).join("") + "</ul>";
  }
  function count(list) { return (list || []).reduce(function (s, g) { return s + 1 + count(g.giu); }, 0); }

  function treeHtml(key, e) {
    var word = keyWord(key), ne = keyN(key), su = e.su || [];
    // su goes from the direct language up; it is shown from the furthest origin down.
    // The "categoria" of a step says how the word passed from that language to the one below it.
    var html = '<ol class="trunk">';
    for (var i = su.length - 1; i >= 0; i--) {
      var t = su[i];
      html += "<li>" + node({ lang: t.codice, from: su[i + 1] && su[i + 1].codice, word: t.termine, tr: t.traslitterazione,
        how: i === su.length - 1 ? "furthest origin" : L.catLabel(su[i + 1].categoria) }) + "</li>";
    }
    var alts = e.alternative || [];
    var how = su.length ? L.catLabel(su[0].categoria)
      : alts.length ? "more than one possible origin: " + alts.map(function (a) {
        return (a.nome || names[a.codice] || a.codice) + (a.termine ? " " + a.termine + (a.traslitterazione ? " (" + a.traslitterazione + ")" : "") : "");
      }).join(" or ")
      : "no earlier step in Wiktionary";
    html += '<li class="here-li">' + node({ here: true, lang: lang, word: word, n: ne, tr: e.traslitterazione, mean: e.significato, how: how }) +
      branches(e.giu, e.n_omografi_antenato ? e.n_omografi_antenato + 1 : 0, lang) + "</li></ol>";
    var kids = (e.giu || []).length, all = count(e.giu);
    html += '<p class="note">' + (kids
      ? "Taken directly by " + kids + (kids === 1 ? " word" : " words") + " of the 33 languages" + (all > kids ? ", " + all + " words in all." : ".")
      : "No word of the 33 languages took it, as far as Wiktionary says.") +
      (e.troncato ? " The tree is cut here (at most 4 levels down and 60 words)." : "") +
      (/"ambiguo":true/.test(JSON.stringify(e.giu || [])) ? " “One of N origins of this spelling”: the same spelling has more than one etymology and Wiktionary does not say which one the word came from, so it is shown under each." : "") + "</p>";
    return html;
  }

  L.names().then(function (res) {
    names = res; targets = names._targets;
    L.footer();
    if (!lang || !w) throw new Error("missing ?lang= or ?w=");
    document.title = w + " (" + (names[lang] || lang) + ") — tree — lexodus";
    return locate().then(function (found) {
      if (!found) {
        el("loading").innerHTML = "There is no tree for “" + L.esc(w) + "” (" + L.esc(names[lang] || lang) + ") in the data. " +
          '<a href="search.html?q=' + encodeURIComponent(w) + '">Search it</a> or <a href="' + L.esc(L.wiktUrl(w, names[lang] || lang)) + '">look it up on Wiktionary</a>.';
        return;
      }
      var e = found.file[found.key];
      el("title").innerHTML = L.esc(w) + L.tr(e.traslitterazione, w);
      el("sub").innerHTML = [langLink(lang), '<a href="' + L.esc(L.wordUrl(lang, w, keyN(found.key), e.su && e.su[0] ? L.fileCode(e.su[0].codice) : "")) + '">word page</a>',
        '<a href="' + L.esc(L.wiktUrl(w, names[lang] || lang)) + '">Wiktionary</a>'].join(" · ");
      var html = '<section class="tree" aria-label="Tree">' + treeHtml(found.key, e) + "</section>";
      (e.radici_altre || []).forEach(function (k) {
        var o = found.file[k];
        if (!o) return;
        html += '<section class="tree"><h2>Another origin of the same spelling</h2>' + treeHtml(k, o) + "</section>";
      });
      el("trees").innerHTML = html;
      el("search-again").href = "search.html?q=" + encodeURIComponent(w);
      el("loading").hidden = true; el("app").hidden = false;
    });
  }).catch(function (e) {
    el("loading").textContent = L.fetchFail(e);
    if (location.protocol !== "file:") console.warn(e.message);
  });
})();
