/* lexodus — compare.html?a=fr&b=it: two languages side by side (confronto/<A>__<B>.json, A before B in
   alphabetical order of the codes, mandate 11): what each took from the other, shared origins, words through each other.
   Mandate 14: three more blocks, closed by default (andate_tornate_tra, cugine, falsi_prestiti_tra of mandate 13):
   round trips between the two, cousin words, false loans between the two. Each says its total; "Show all" over 20. */
(function () {
  "use strict";
  var L = window.Lex;
  function el(id) { return document.getElementById(id); }
  function pick(o) { for (var i = 1; i < arguments.length; i++) if (o && o[arguments[i]] !== undefined && o[arguments[i]] !== null) return o[arguments[i]]; return undefined; }
  var nm, pairs;
  var SHOW = 20, extraBlocks = {}, openAll = {};

  // ---- Mandate 14: round trips between the two, cousin words, false loans between the two ----
  function moreBtn(id, total) {
    return !openAll[id] && total > SHOW ? '<button type="button" class="more" data-more="' + id + '">Show all ' + L.n(total) + "</button>" : "";
  }
  function cap(id, list) { return openAll[id] ? list : list.slice(0, SHOW); }
  function nOf(side) { return (side && (side.n || L.listOf(side).length)) || 0; }
  function treeOrPlain(w, lang) {
    return w.file_albero ? L.wordTree(w, lang) : '<span class="w">' + L.esc(w.parola) + "</span>" + L.tr(w.traslitterazione, w.parola);
  }

  // One round trip: the chain in one line, the language highlighted twice (the word and the stage it left from).
  function tripItem(r) {
    var lang = r.lingua, depCode = L.codeOf(pick(r, "partenza")) || null;
    var mark = function (c) { return c === lang || (depCode && c === depCode); };
    var back = L.codeOf(pick(r, "rientro_da")), out = L.codeOf(pick(r, "uscita_verso")), how = [];
    if (out) how.push("left for " + L.langName(nm, out));
    if (back) how.push("came back from " + L.langName(nm, back));
    return '<li><div class="line">' + L.wordTree(r, lang) + (r.significato ? ' <span class="note">' + L.esc(r.significato) + "</span>" : "") + "</div>" +
      '<p class="way">' + L.chainLine(r.catena || [], nm, { lang: lang, word: r.parola, t: r.traslitterazione }, mark) + "</p>" +
      (how.length ? '<p class="note">' + L.esc(how.join(", ")) + "</p>" : "") + "</li>";
  }
  function tripsBlock(a, b, sa, sb) {
    var total = nOf(sa) + nOf(sb), listA = L.listOf(sa), listB = L.listOf(sb);
    el("rt-title").textContent = "Round trips between the two (" + L.n(total) + ")";
    function part(to, via, side, list) {
      var n = nOf(side);
      return "<h3>" + L.esc(L.langName(nm, to)) + " words that went through " + L.esc(L.langName(nm, via)) + " and came back (" + L.n(n) + ")</h3>" +
        (n > list.length ? '<p class="note">The ' + L.n(list.length) + " longest trips.</p>" : "") +
        (list.length ? '<ol class="ranked trips">' + cap("rt", list).map(tripItem).join("") + "</ol>" : '<p class="note">None.</p>');
    }
    el("rt-body").innerHTML = total
      ? part(a, b, sa, listA) + part(b, a, sb, listB) + moreBtn("rt", Math.max(listA.length, listB.length) > SHOW ? listA.length + listB.length : 0)
      : '<p class="note">No word went from one to the other and back.</p>';
  }

  // Cousin words: the two words side by side, the common origin in the middle, links to the word pages.
  function cousinSide(w, lang, direct) {
    var dc = L.codeOf(direct);
    var href = L.wordUrl(lang, w.parola, w.n_etimologia || 1, dc && dc !== lang ? L.fileCode(dc) : "");
    return '<div class="half"><span class="note">' + L.esc(L.langName(nm, lang)) + "</span>" +
      '<p class="big"><a class="w" href="' + L.esc(href) + '">' + L.esc(w.parola) + "</a>" + L.tr(w.traslitterazione, w.parola) + "</p>" +
      (w.significato ? '<p class="mean">' + L.esc(w.significato) + "</p>" : "") +
      '<p class="note">' + (dc && dc !== lang ? "from " + L.esc(L.langName(nm, dc, direct.nome_en)) + " · " : "") +
      (w.file_albero ? '<a href="' + L.esc(L.treeOf(w, lang)) + '">tree</a>' : "") + "</p></div>";
  }
  function cousinItem(c, a, b) {
    var r = c.radice || {};
    var root = L.esc(L.langName(nm, r.codice, r.nome_en)) + (r.termine ? " <i>" + L.esc(r.termine) + "</i>" + L.tr(r.traslitterazione, r.termine) : "");
    return '<li class="pair"><div class="trio">' + cousinSide(c.a || {}, a, c.lingua_diretta_a) +
      '<div class="root"><span class="note">common origin</span><p>' + root + "</p></div>" +
      cousinSide(c.b || {}, b, c.lingua_diretta_b) + "</div></li>";
  }
  function cousinsBlock(a, b, block) {
    var list = L.listOf(block), total = (block && block.n_totale) || list.length;
    el("cous-title").textContent = "Cousin words (" + L.n(total) + ")";
    el("cous-count").textContent = !list.length ? "" : total > list.length
      ? "The " + L.n(list.length) + " best-known pairs of " + L.n(total) + ": short, common words first."
      : "Short, common words first.";
    el("cous-list").innerHTML = cap("cous", list).map(function (c) { return cousinItem(c, a, b); }).join("") ||
      '<li class="note">No cousin words.</li>';
    var old = el("cous-block").querySelector("button[data-more]");
    if (old) old.parentNode.removeChild(old);
    el("cous-list").insertAdjacentHTML("afterend", moreBtn("cous", list.length));
  }

  // False loans: words of one language that imitate the other.
  function falseItem(w, lang) {
    return '<li><div class="line">' + treeOrPlain(w, lang) + (w.significato ? ' <span class="note">' + L.esc(w.significato) + "</span>" : "") + "</div>" +
      (w.testo ? '<p class="mean">' + L.esc(w.testo) + "</p>" : "") + "</li>";
  }
  function falseBlock(a, b, sa, sb) {
    var total = nOf(sa) + nOf(sb), listA = L.listOf(sa), listB = L.listOf(sb);
    el("false-title").textContent = "False loans between the two (" + L.n(total) + ")";
    function part(lang, other, side, list) {
      return "<h3>" + L.esc(L.langName(nm, lang)) + " words that look " + L.esc(L.langName(nm, other)) + " (" + L.n(nOf(side)) + ")</h3>" +
        (list.length ? '<ol class="ranked">' + cap("false", list).map(function (w) { return falseItem(w, lang); }).join("") + "</ol>" : '<p class="note">None.</p>');
    }
    el("false-body").innerHTML = total
      ? part(a, b, sa, listA) + part(b, a, sb, listB) + moreBtn("false", Math.max(listA.length, listB.length) > SHOW ? listA.length + listB.length : 0)
      : '<p class="note">No false loans between the two in Wiktionary.</p>';
  }
  // The keys A_via_B, A_imita_B, a / b of the file belong to x, the first language of the file name.
  function extraBlocksShow(d, a, b, x) {
    var swap = a !== x;
    var rt = pick(d, "andate_tornate_tra") || {}, fl = pick(d, "falsi_prestiti_tra") || {}, cu = pick(d, "cugine");
    var rA = pick(rt, "A_via_B"), rB = pick(rt, "B_via_A"), fA = pick(fl, "A_imita_B"), fB = pick(fl, "B_imita_A");
    tripsBlock(a, b, swap ? rB : rA, swap ? rA : rB);
    falseBlock(a, b, swap ? fB : fA, swap ? fA : fB);
    if (cu && swap) {
      cu = Object.assign({}, cu, { lista: L.listOf(cu).map(function (c) {
        return Object.assign({}, c, { a: c.b, b: c.a, lingua_diretta_a: c.lingua_diretta_b, lingua_diretta_b: c.lingua_diretta_a });
      }) });
    }
    cousinsBlock(a, b, cu);
    extraBlocks = { d: d, a: a, b: b, x: x };
  }

  function catLine(per) {
    return L.CATS.filter(function (c) { return per && per[c.key]; })
      .map(function (c) { return L.n(per[c.key]) + " " + c.label; }).join(" · ");
  }
  function exList(list, lang, from) {
    return (list || []).map(function (w) { return L.wordPage(w, lang, from); }).join(", ");
  }
  // took: {n, per_categoria, esempi}; "to" took the words from "from".
  function tookBlock(id, to, from, took) {
    var nTo = L.langName(nm, to), nFrom = L.langName(nm, from);
    el(id + "-title").textContent = nTo + " took from " + nFrom;
    var box = el(id).querySelector(".body");
    var n = (took && pick(took, "n", "n_parole")) || 0;
    if (!n) { box.innerHTML = '<p class="note">No words in Wiktionary.</p>'; return; }
    var fc = L.fileCode(from);
    var all = L.hasPair(pairs, to, fc) ? ' <a href="' + L.esc(L.wordsUrl(to, fc)) + '">See the words</a>' : "";
    box.innerHTML = '<p class="big-num">' + L.n(n) + ' <span class="note">words</span></p>' +
      '<p class="note">' + L.esc(catLine(pick(took, "per_categoria", "categorie"))) + "</p>" +
      '<p class="ex plain-ex">' + exList(pick(took, "esempi"), to, from) + "</p>" + (all ? "<p>" + all + "</p>" : "");
  }
  function sharedRows(list, a, b) {
    el("sh-a").textContent = L.langName(nm, a);
    el("sh-b").textContent = L.langName(nm, b);
    el("shared-list").innerHTML = (list || []).map(function (o) {
      var c = pick(o, "codice", "origine");
      return '<tr><td class="w">' + L.langLink(nm, c, o.nome_en) + (o.termine ? " <i>" + L.esc(o.termine) + "</i>" + L.tr(o.traslitterazione, o.termine) : "") + "</td>" +
        "<td><strong>" + L.n(pick(o, "n_a", "n_A") || 0) + '</strong><p class="mean">' + exList(pick(o, "esempi_a", "esempi_A"), a) + "</p></td>" +
        "<td><strong>" + L.n(pick(o, "n_b", "n_B") || 0) + '</strong><p class="mean">' + exList(pick(o, "esempi_b", "esempi_B"), b) + "</p></td></tr>";
    }).join("") || '<tr><td colspan="3" class="note">No shared origins.</td></tr>';
  }
  function throughLine(to, from, list) {
    var fc = L.fileCode(from);
    list = L.listOf(list);
    if (!list || !list.length) return "";
    return "<p>Of the words " + L.esc(L.langName(nm, to)) + " took from " + L.esc(L.langName(nm, from)) + ", " + L.esc(L.langName(nm, from)) + " had taken " +
      list.map(function (v) {
        var vc = L.fileCode(v.codice), num = L.n(v.n);
        if (L.hasPair(pairs, to, fc, vc)) num = '<a href="' + L.esc(L.wordsUrl(to, fc, vc)) + '">' + num + "</a>";
        return num + " from " + L.esc(L.langName(nm, v.codice, v.nome_en));
      }).join(", ") + ".</p>";
  }

  function show() {
    var a = el("a").value, b = el("b").value;
    L.setParams({ a: a, b: b });
    var roOut = a === "ro" || b === "ro";
    if (roOut) L.exclusionNote(el("ro-note"), null); else el("ro-note").hidden = true;
    if (a === b) {
      el("app").hidden = true; el("loading").hidden = false;
      el("loading").textContent = "Choose two different languages.";
      return;
    }
    var x = a < b ? a : b, y = a < b ? b : a;
    el("loading").hidden = false; el("loading").textContent = "Loading…";
    L.fetchJson("data/confronto/" + L.fileCode(x) + "__" + L.fileCode(y) + ".json").then(function (d) {
      var xy = pick(d, "A_da_B", x + "_da_" + y), yx = pick(d, "B_da_A", y + "_da_" + x);
      var tookA = a === x ? xy : yx, tookB = a === x ? yx : xy; // tookA: words a took from b
      tookBlock("ab", a, b, tookA);
      tookBlock("ba", b, a, tookB);
      var shared = (pick(d, "origini_comuni") || []).map(function (o) {
        // n_a / esempi_a belong to the first language of the file name
        return a === x ? o : Object.assign({}, o, { n_a: pick(o, "n_b", "n_B"), n_b: pick(o, "n_a", "n_A"), esempi_a: pick(o, "esempi_b", "esempi_B"), esempi_b: pick(o, "esempi_a", "esempi_A") });
      });
      sharedRows(shared, a, b);
      var p = pick(d, "passaggi") || {};
      var pxy = pick(p, "A_da_B", x + "_da_" + y), pyx = pick(p, "B_da_A", y + "_da_" + x);
      var html = throughLine(a, b, a === x ? pxy : pyx) + throughLine(b, a, a === x ? pyx : pxy);
      el("through-body").innerHTML = html || '<p class="note">None.</p>';
      openAll = {};
      extraBlocksShow(d, a, b, x);
      el("loading").hidden = true; el("app").hidden = false;
    }).catch(function (e) {
      el("app").hidden = true;
      el("loading").textContent = L.fetchFail(e);
    });
  }

  Promise.all([L.names(), L.extra("coppie_elenco")]).then(function (res) {
    nm = res[0]; pairs = res[1] || {};
    L.footer();
    var codes = L.targetCodes(nm);
    var a = L.param("a"), b = L.param("b");
    if (codes.indexOf(a) < 0) a = "fr";
    if (codes.indexOf(b) < 0) b = a === "it" ? "fr" : "it";
    L.langOptions(el("a"), codes, nm, a);
    L.langOptions(el("b"), codes, nm, b);
    el("pick").addEventListener("change", show);
    // "Show all" of the three closed blocks
    el("app").addEventListener("click", function (e) {
      var t = e.target.closest ? e.target.closest("button[data-more]") : null;
      if (!t || !extraBlocks.d) return;
      openAll[t.dataset.more] = true;
      extraBlocksShow(extraBlocks.d, extraBlocks.a, extraBlocks.b, extraBlocks.x);
    });
    el("pick").addEventListener("submit", function (e) { e.preventDefault(); show(); });
    show();
  }).catch(function (e) {
    el("loading").textContent = L.fetchFail(e);
    if (location.protocol !== "file:") console.warn(e.message);
  });
})();
