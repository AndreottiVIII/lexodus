/* lexodus, draft "gazzetta" (front page of a 19th-century gazette): home (the lead story, the course of the loans as a
   stock table, dispatches from the 33 tongues), language (foreign intelligence of one tongue: arrivals, departures,
   shipping news), word (the caffè affair as a headed story, with telegrams and the route as a timetable). */
(function () {
  "use strict";
  var B = window.B;
  function el(id) { return document.getElementById(id); }
  var page = document.body.dataset.page;
  var LOAN = ["prestito", "latinismo_dotto", "calco"];
  var ONES = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen",
    "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  var TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  function words(n) {
    if (n < 20) return ONES[n];
    if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? "-" + ONES[n % 10] : "");
    return B.n(n);
  }
  // headline numbers, the way a sub-editor writes them
  function approx(n) {
    if (n < 100) return words(n);
    if (n < 1000) return B.n(n);
    var k = n / 1000, r = Math.round(k);
    return (Math.abs(k - r) < 0.15 ? "" : k < r ? "nearly " : "over ") + words(r) + " thousand";
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function fail(e) { el("loading").textContent = "The presses jammed: the data could not be loaded (" + e.message + ")."; console.error(e); }
  function ready() { document.body.dataset.ready = "1"; }
  function show() { el("loading").hidden = true; el("app").hidden = false; }
  function term(t, tr) { return "<i>" + B.esc(t || "—") + "</i>" + (tr && tr !== t ? " (" + B.esc(tr) + ")" : ""); }
  function headline(kicker, h1, decks) {
    return '<p class="kicker">' + kicker + "</p><h1 class=\"hl\">" + h1 + "</h1>" + decks.map(function (d, i) {
      return '<p class="deck d' + (i + 1) + '">' + d + "</p>";
    }).join('<hr class="dash">');
  }
  function table(rows, head) {
    return "<thead><tr>" + head.map(function (h, i) { return "<th" + (i ? ' class="num"' : "") + ">" + h + "</th>"; }).join("") + "</tr></thead><tbody>" + rows.join("") + "</tbody>";
  }
  // one pass over the arcs: for every tongue of the 33, its chief creditor and its chief debtor
  function ledgers(L, arcs) {
    var g = {};
    arcs.forEach(function (a) {
      if (LOAN.indexOf(a.categoria) < 0 || !(a.n_parole > 0)) return;
      var o = B.merged(a.origine), d = B.merged(a.arrivo);
      if (o === d) return;
      var lo = L.by[o];
      if ((lo ? lo.type : a.tipo_lingua_origine) !== "lingua" && !(lo && lo.target)) return;
      if (L.by[d] && L.by[d].target) { var x = g[d] || (g[d] = { from: {}, to: {} }); x.from[o] = (x.from[o] || 0) + a.n_parole; }
      if (L.by[o] && L.by[o].target) { var y = g[o] || (g[o] = { from: {}, to: {} }); y.to[d] = (y.to[d] || 0) + a.n_parole; }
    });
    function top(m) { var k = Object.keys(m).sort(function (a, b) { return m[b] - m[a]; })[0]; return k ? { code: k, n: m[k] } : null; }
    var out = {};
    Object.keys(g).forEach(function (c) { out[c] = { creditor: top(g[c].from), debtor: top(g[c].to), outside: g[c] }; });
    return out;
  }

  // ===================== home: the front page =====================
  function home() {
    B.langs().then(function (L) {
      var arcs = window.LEXODUS.archi.archi, led = ledgers(L, arcs);
      var byGave = L.list.slice().sort(function (a, b) { return b.gave - a.gave; }), byTook = L.list.slice().sort(function (a, b) { return b.took - a.took; });
      var g1 = byGave[0], t1 = byTook[0], en = L.by.en;
      var totT = L.list.reduce(function (s, l) { return s + l.took; }, 0), totG = L.list.reduce(function (s, l) { return s + l.gave; }, 0);
      // the great creditor outside the 33
      var outside = {};
      arcs.forEach(function (a) {
        if (LOAN.indexOf(a.categoria) < 0) return;
        var o = B.merged(a.origine);
        if (L.by[o] && L.by[o].target) return;
        if (a.tipo_lingua_origine && a.tipo_lingua_origine !== "lingua") return;
        outside[o] = (outside[o] || 0) + a.n_parole;
      });
      var o1 = Object.keys(outside).sort(function (a, b) { return outside[b] - outside[a]; })[0];
      el("lead").innerHTML = headline("The Great Exchange", B.esc(g1.name.toUpperCase()) + ", GREAT LENDER OF WORDS", [
        cap(approx(g1.gave)) + " words given to the other tongues",
        B.esc(t1.name) + " the first borrower with " + B.n(t1.took) + "; English lends " + B.n(en.gave) + " and takes " + B.n(en.took),
        B.esc(B.nameOf(L, o1)).toUpperCase() + ", FROM OUTSIDE THE THIRTY-THREE, THE OLD CREDITOR OF ALL"
      ]) + '<div class="body"><p><span class="dl">LEXODUS, this day.</span>—The thirty-three tongues of our survey, by the account of the English Wiktionary, have taken ' +
        B.n(totT) + " words from one another and from the tongues of the past, and have given " + B.n(totG) + " to one another. The figures, which we print in full in the adjoining column, admit of no doubt as to the first place: " +
        B.esc(g1.name) + " has sent abroad " + B.n(g1.gave) + " words, more than any other tongue, and its chief customer is " + B.esc(B.nameOf(L, led[g1.code].debtor.code)) + ", which took " + B.n(led[g1.code].debtor.n) + ".</p>" +
        "<p>Among the borrowers " + B.esc(t1.name) + " stands first, with " + B.n(t1.took) + " words received; our readers are warned that the Wiktionary records the loans of that tongue in unusual detail. " +
        "English is at once a great lender and a great borrower. Of the creditors who are not of the thirty-three, " + B.esc(B.nameOf(L, o1)) + " leads by far, with " + B.n(outside[o1]) + " words lent; " +
        Object.keys(outside).sort(function (a, b) { return outside[b] - outside[a]; }).slice(1, 4).map(function (c) { return B.esc(B.nameOf(L, c)) + " (" + B.n(outside[c]) + ")"; }).join(", ") + " follow at a distance.</p>" +
        "<p>The smallest lender is " + B.esc(byGave[byGave.length - 1].name) + ", with " + B.n(byGave[byGave.length - 1].gave) + " words given. Dispatches from every tongue will be found below.</p></div>";
      // the course of the loans, alphabetical as a stock table
      el("bourse").innerHTML = table(L.list.slice().sort(function (a, b) { return a.name.localeCompare(b.name); }).map(function (l) {
        var bal = l.gave - l.took;
        return '<tr><td><a href="' + B.langUrl(l.code) + '">' + B.esc(l.name) + '</a></td><td class="num">' + B.n(l.took) + '</td><td class="num">' + B.n(l.gave) + '</td><td class="num ' + (bal >= 0 ? "up" : "down") + '">' +
          (bal >= 0 ? "▲ " : "▼ ") + B.n(Math.abs(bal)) + "</td></tr>";
      }), ["Tongue", "Took", "Gave", "Bal."]);
      el("briefs").innerHTML = L.list.slice().sort(function (a, b) { return a.name.localeCompare(b.name); }).map(function (l) {
        var x = led[l.code] || {};
        return '<p class="brief"><a class="dl" href="' + B.langUrl(l.code) + '">' + B.esc(l.name.toUpperCase()) + ".</a>—Took " + B.n(l.took) + " words" +
          (x.creditor ? ", chiefly from " + B.esc(B.nameOf(L, x.creditor.code)) + " (" + B.n(x.creditor.n) + ")" : "") + "; gave " + B.n(l.gave) +
          (x.debtor ? ", chiefly to " + B.esc(B.nameOf(L, x.debtor.code)) + " (" + B.n(x.debtor.n) + ")" : "") + ".</p>";
      }).join("");
      el("advert").innerHTML = '<p class="ad-top">Just Published</p><p class="ad-big">THE AFFAIR<br>OF CAFFÈ</p><p class="ad-txt">A word that set out from Arabic and reached Italian by way of Ottoman Turkish; with the names of the twenty-eight tongues that took it after.</p>' +
        '<p class="ad-go"><a href="word.html?lang=it&amp;w=caff%C3%A8&amp;n=1&amp;from=ota">Read the whole account ☞</a></p>';
      show(); ready();
    }).catch(fail);
  }

  // ===================== language: foreign intelligence =====================
  function language() {
    var code = B.param("code") || "it";
    B.language(code).then(function (d) {
      var l = d.lang, L = d.L, name = l.name;
      document.title = name + " intelligence — lexodus (gazette draft)";
      el("sh-name").textContent = name;
      el("jump").innerHTML = L.list.slice().sort(function (a, b) { return a.name.localeCompare(b.name); })
        .map(function (t) { return '<option value="' + t.code + '"' + (t.code === code ? " selected" : "") + ">" + B.esc(t.name) + "</option>"; }).join("");
      el("jump").onchange = function () { if (this.value) location.href = B.langUrl(this.value); };
      var took = l.target ? l.took : 0, gave = l.target ? l.gave : d.toTotal;
      var f1 = d.from[0], t1 = d.to[0];
      el("lead").innerHTML = headline(B.esc(name) + " Intelligence", B.esc(name.toUpperCase()) + (gave >= took ? " GIVES MORE THAN IT TAKES" : " TAKES MORE THAN IT GIVES"), [
        cap(approx(gave)) + " words sent abroad against " + approx(took) + " received",
        (t1 ? B.esc(t1.name) + " the first customer" : "No customer") + (f1 ? "; " + B.esc(f1.name) + " the old creditor" : ""),
        (d.from.length ? words(Math.min(d.from.length, 99)).toUpperCase() + " TONGUES SEND WORDS, " : "") + words(Math.min(d.to.length, 99)).toUpperCase() + " RECEIVE THEM"
      ]) + '<div class="body"><p><span class="dl">' + B.esc(name.toUpperCase()) + ", this day.</span>—" +
        (l.target ? "The " + B.esc(name) + " tongue counts " + B.n(l.lemmas) + " entries in the Wiktionary, of which " + Math.round(l.pct) + " in the hundred give an account of their origin. " : "") +
        (f1 ? "The principal arrivals are from " + B.esc(f1.name) + ", with " + B.n(f1.n) + " words" + (d.from.length > 1 ? "; then " + d.from.slice(1, 4).map(function (r) { return B.esc(r.name) + " (" + B.n(r.n) + ")"; }).join(", ").replace(/, ([^,]*)$/, " and $1") : "") + ". " : "") +
        (t1 ? "Of departures, " + B.esc(t1.name) + " has taken " + B.n(t1.n) + " words, " + d.to.slice(1, 3).map(function (r) { return B.esc(r.name) + " " + B.n(r.n); }).join(" and ") + "." : "") + "</p></div>";
      // the course of the loans with every partner
      var part = {};
      d.from.forEach(function (r) { (part[r.code] = part[r.code] || { r: r, i: 0, o: 0 }).i = r.n; });
      d.to.forEach(function (r) { (part[r.code] = part[r.code] || { r: r, i: 0, o: 0 }).o = r.n; });
      var rows = Object.keys(part).map(function (k) { return part[k]; }).sort(function (a, b) { return (b.i + b.o) - (a.i + a.o); }).slice(0, 22);
      el("b-sub").textContent = "With " + B.esc(name) + ": words in, words out, and the balance. The " + rows.length + " busiest tongues.";
      el("bourse").innerHTML = table(rows.map(function (p) {
        var bal = p.o - p.i;
        return '<tr><td><a href="' + B.langUrl(p.r.code) + '">' + B.esc(p.r.name) + '</a></td><td class="num">' + (p.i ? B.n(p.i) : "—") + '</td><td class="num">' + (p.o ? B.n(p.o) : "—") +
          '</td><td class="num ' + (bal >= 0 ? "up" : "down") + '">' + (bal >= 0 ? "▲ " : "▼ ") + B.n(Math.abs(bal)) + "</td></tr>";
      }), ["Tongue", "In", "Out", "Bal."]);
      function dispatch(id, list, side) {
        var shown = list.slice(0, 12);
        el(id).innerHTML = shown.map(function (r) {
          var ex = r.ex.slice(0, 5).map(function (w) {
            var href = side === "from" ? B.wordUrl(code, w, 1, r.code) : B.wordUrl(r.code, w, 1, code);
            return '<a href="' + B.esc(href) + '"><i>' + B.esc(w) + "</i></a>";
          }).join(", ");
          var cats = Object.keys(r.cats).sort(function (a, b) { return r.cats[b] - r.cats[a]; }).map(function (c) { return B.CATS[c] + " " + B.n(r.cats[c]); }).join(", ");
          return '<p><a class="dl" href="' + B.langUrl(r.code) + '">' + (side === "from" ? "FROM " : "TO ") + B.esc(r.name.toUpperCase()) + ".</a>—" + B.n(r.n) + (r.n === 1 ? " word has " : " words have ") +
            (side === "from" ? "arrived" : "departed") + " (" + cats + ")" + (ex ? ", among them " + ex : "") + ".</p>";
        }).join("") + (list.length > 12 ? '<p><span class="dl">' + (side === "from" ? "OTHER ARRIVALS" : "OTHER DEPARTURES") + ".</span>—" +
          list.slice(12).map(function (r) { return '<a href="' + B.langUrl(r.code) + '">' + B.esc(r.name) + "</a> " + B.n(r.n); }).join(", ") + ".</p>" : "") ||
          "<p>No movement to report.</p>";
      }
      if (l.target) dispatch("from", d.from, "from"); else el("from").innerHTML = "<p>This tongue is not among the thirty-three: its arrivals are not reported.</p>";
      dispatch("to", d.to, "to");
      show();
      return l.target ? B.extra(code).then(function (x) {
        var lst = x && x.piu_viaggiate ? x.piu_viaggiate.lista || [] : [];
        if (lst.length) {
          el("ship").innerHTML = lst.map(function (w) {
            var cat = (w.catena || []).slice().reverse();
            return '<p><span class="dl">ARRIVED,</span> <a href="' + B.esc(B.wordUrl(code, w.parola, w.n_etimologia, w.catena && w.catena[0] && w.catena[0].codice)) + '"><b><i>' + B.esc(w.parola) + "</i></b></a>" +
              (w.significato ? ", “" + B.esc(w.significato) + "”," : "") + " from " + B.esc(cat.length ? B.nameOf(L, cat[0].codice) : "—") +
              (cat.length > 1 ? ", by way of " + cat.slice(1).map(function (c) { return B.esc(B.nameOf(L, c.codice)); }).join(", ") : "") + "; " + words(cat.length + 1) + " tongues touched.</p>";
          }).join("");
          el("ship-block").hidden = false;
        }
        ready();
      }) : ready();
    }).catch(fail);
  }

  // ===================== word: the affair =====================
  function word() {
    var lang = B.param("lang") || "it", w = B.param("w") || "caffè", ne = +B.param("n") || 1, from = B.param("from") || "";
    B.word(lang, w, ne, from).then(function (r) {
      var L = r.L, p = r.p;
      if (!p) {
        el("loading").innerHTML = "No news of “" + B.esc(w) + "”. <a href=\"" + B.wiktUrl(w, B.nameOf(L, lang)) + "\">Wiktionary</a>.";
        return ready();
      }
      var stops = B.journey(L, lang, p), name = B.nameOf(L, lang), W = p.parola.toUpperCase();
      document.title = "The " + p.parola + " affair — lexodus (gazette draft)";
      var giu = r.tree && r.tree.e ? r.tree.e.giu || [] : [], total = B.count(giu);
      var mid = stops.slice(1, -1);
      var h1 = stops.length < 2 ? W + ", A NATIVE OF " + name.toUpperCase()
        : W + " ARRIVES FROM " + stops[0].name.toUpperCase() + (mid.length ? ", BY WAY OF " + mid.map(function (s) { return s.name.toUpperCase(); }).join(" AND ") : "");
      var hows = stops.slice(0, -1).map(function (s) { return s.how || "taken"; });
      var same = hows.every(function (h) { return h === hows[0]; });
      var firsts = giu.slice().sort(function (a, b) { return B.count(b.giu) - B.count(a.giu); }).map(function (g) { return B.nameOf(L, g.lingua); })
        .filter(function (v, i, a) { return a.indexOf(v) === i; }).slice(0, 3);
      el("story").innerHTML = headline("Latest from the " + B.esc(name) + " tongue", B.esc(h1), [
        hows.length ? (same ? cap(hows[0]) + " at every stage" : cap(hows.join(", then "))) : "Of native stock",
        p.significato ? "The word signifies “" + B.esc(p.significato) + "”" : B.esc(p.pos || ""),
        total ? "SINCE TAKEN UP BY " + firsts.map(function (s) { return B.esc(s.toUpperCase()); }).join(", ") + (total > firsts.length ? " AND " + words(Math.min(total - firsts.length, 99)).toUpperCase() + " OTHERS" : "") : "NO TONGUE HAS TAKEN IT SINCE"
      ]) + '<div class="body"><p><span class="dl">' + B.esc(name.toUpperCase()) + ", this day.</span>—The word <i>" + B.esc(p.parola) + "</i>, " +
        (p.significato ? "which our readers know as " + B.esc(p.significato) + ", " : "") + "has reached the " + B.esc(name) + " tongue after a journey through " + words(stops.length) + " tongues. " +
        stops.map(function (s, i) {
          if (i === 0) return "It set out from " + B.esc(s.name) + " as " + term(s.term, s.tr);
          return (i === stops.length - 1 ? " and at length, " : "; passed, ") + B.esc(stops[i - 1].how || "taken") + ", into " + B.esc(s.name) + (s.here ? "" : " as " + term(s.term, s.tr));
        }).join("") + ".</p>" +
        (total ? "<p>It has not rested. No fewer than " + words(Math.min(total, 99)) + " words in other tongues descend from it" +
          (giu.length ? "; " + B.esc(firsts[0]) + " foremost" : "") + ". The particulars reach us by telegraph and are printed in the next column.</p>" : "") + "</div>";
      el("t-sub").textContent = total ? total + " words, in the order received." : "";
      var items = [];
      (function walk(list, parent) { list.forEach(function (g) { items.push({ g: g, parent: parent }); walk(g.giu || [], g.lingua); }); })(giu, lang);
      el("tele").innerHTML = items.length ? items.map(function (it) {
        var g = it.g;
        return '<p><a class="dl" href="' + B.langUrl(g.lingua) + '">' + B.esc(B.nameOf(L, g.lingua).toUpperCase()) + '.</a>—<a href="' + B.esc(B.wordUrl(g.lingua, g.parola, g.n_etimologia, it.parent)) + '">' +
          term(g.parola, g.traslitterazione) + "</a>, from " + B.esc(B.nameOf(L, it.parent)) + (B.CATS[g.categoria] ? "; " + B.esc(B.CATS[g.categoria]) : "") + ".</p>";
      }).join("") : "<p>No telegrams.</p>";
      el("ety").textContent = (r.text || "Our correspondent is silent.") + (r.text && r.text.length >= 300 ? "…" : "");
      el("wikt").href = B.wiktUrl(p.parola, name);
      el("route").innerHTML = '<h3 class="sect small">Route of the word</h3><table class="exchange timetable"><thead><tr><th>Stage</th><th>Form</th><th>Manner</th></tr></thead><tbody>' +
        stops.map(function (s, i) {
          return '<tr><td><a href="' + B.langUrl(s.code) + '">' + B.esc(s.name) + "</a></td><td>" + term(s.term, s.tr) + "</td><td>" + (i ? B.esc(stops[i - 1].how || "—") : "dep.") + "</td></tr>";
        }).join("") + "</tbody></table>";
      show(); ready();
    }).catch(fail);
  }

  if (page === "index") home();
  else if (page === "language") language();
  else word();
})();
