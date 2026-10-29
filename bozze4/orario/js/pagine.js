/* lexodus, draft "orario" (the Italian railway timetable): a general index of 33 tables (quadri), each language
   with its arrivals (white sheet) and departures (yellow sheet), the word as a train with its stops and its
   onward connections. Train numbers are word counts; the signs in the Note column are explained in the key. */
(function () {
  "use strict";
  var B = window.B, E = B.esc;
  function el(id) { return document.getElementById(id); }
  var page = document.body.dataset.page;
  function fail(e) { el("loading").textContent = "The tables could not be composed (" + e.message + ")."; console.error(e); }
  function done(html, legend) {
    el("app").innerHTML = html; el("loading").hidden = true; el("app").hidden = false;
    el("legend").innerHTML = legend || ""; document.body.dataset.ready = "1";
  }
  var HIST = "la LATINO ota sa pi got akk arc lng frk cu orv syc pal peo xno chg otk gez phn hbo grc gkm fro frm ang enm goh gmh osp pro non dum odt osx gml ofs sga mga xcl txb ltc och".split(" ");
  function hist(code, name) { return HIST.indexOf(code) >= 0 || /^(Old|Middle|Ancient|Classical|Biblical|Medieval|Late|Vulgar|Ecclesiastical|Byzantine|Proto)\b/.test(name || ""); }
  function order(L) { return L.list.slice().sort(function (a, b) { return a.name.localeCompare(b.name, "en"); }).map(function (x) { return x.code; }); }
  function quadro(L, code) { var i = order(L).indexOf(B.merged(code)); return i < 0 ? null : i + 1; }
  function pag(q) { return 100 + q * 4; }
  function sym(s) { return '<span class="sym">' + s + "</span>"; }
  function head(it, en) { return "<th><span class=\"it\">" + it + "</span>" + en + "</th>"; }
  function headN(it, en) { return '<th class="n"><span class="it">' + it + "</span>" + en + "</th>"; }
  function stName(L, code, name) {
    var q = quadro(L, code);
    return q ? '<a href="' + B.langUrl(code) + '">' + E(name) + "</a>" : E(name);
  }
  var KEY = {
    d: [sym("◆"), "one of the 33 languages: it has its own table (quadro)"],
    h: [sym("†"), "historical language, no longer spoken in this form"],
    s: [sym("✱"), "the words came by more than one road; the main roads are in the column Via"],
    c: [sym("‡"), "some of the words are calques or learned Latin"],
    x: ["–", "not counted: the words between two languages are counted only when the second is one of the 33"]
  };
  function legend(keys) {
    return "<h3>Key to the signs</h3>" + keys.map(function (k) { return "<p>" + KEY[k][0] + " " + KEY[k][1] + "</p>"; }).join("");
  }

  // ============ general index ============
  function home() {
    B.grid().then(function (G) {
      var L = G.L, codes = order(L);
      el("rq").textContent = "General index"; el("rp").textContent = "pag. 3";
      var html = '<section class="sheet"><div class="hd"><h1>lexodus</h1><span class="en">General timetable of the loanwords</span></div>' +
        '<p class="intro">Thirty-three languages, each in its own table. <b>Arrivals</b>: the words a language took from the others. <b>Departures</b>: the words it gave them. Valid from 18 October 2026, the day the English Wiktionary was read.</p>' +
        '<p class="stamp"><b>33</b>tables</p>' +
        '<div class="tbl"><table><thead><tr>' + headN("Quadro", "Table") + head("Lingua", "Language") + '<th class="hide-s"><span class="it">Famiglia</span>Family</th>' +
        headN("Arrivi", "Words taken") + headN("Partenze", "Words given") + '<th class="n hide-s"><span class="it">Pag.</span>Page</th></tr></thead><tbody>' +
        codes.map(function (c, i) {
          var l = L.by[c];
          return '<tr><td class="n">' + (i + 1) + '</td><td class="st"><a href="' + B.langUrl(c) + '">' + E(l.name) + '</a></td><td class="hide-s">' + E((B.FAM_BY_ID[l.fam] || {}).name || "") +
            '</td><td class="n">' + B.n(l.took) + '</td><td class="n">' + B.n(l.gave) + '</td><td class="n hide-s">' + pag(i + 1) + "</td></tr>";
        }).join("") + "</tbody></table></div></section>";
      var cols = codes.concat(["LATINO", "altre"]);
      html += '<section class="sheet mx"><div class="hd"><h2>Summary</h2><span class="en">Words from language to language</span></div>' +
        '<p class="intro">Read along the row: the language of the row took the words from the language of the column. Latin of every period is one column; the last column holds every other language.</p>' +
        '<div class="tbl"><table><thead><tr><th>From → <br>To ↓</th>' + cols.map(function (c) {
          return '<th class="v">' + E(c === "LATINO" ? "Latin" : c === "altre" ? "others" : L.by[c].name) + "</th>";
        }).join("") + "</tr></thead><tbody>" + codes.map(function (r) {
          var line = G.one[r] || {};
          return '<tr' + (r === "it" ? ' class="me"' : "") + '><td class="l"><a href="' + B.langUrl(r) + '">' + E(L.by[r].name) + "</a></td>" + cols.map(function (c) {
            return '<td class="n">' + (c === r ? "·" : line[c] ? B.n(line[c]) : "") + "</td>";
          }).join("") + "</tr>";
        }).join("") + "</tbody></table></div></section>";
      done(html, "<h3>Reading the tables</h3><p>Each quadro has two sheets: arrivals on white, departures on yellow, as in the stations. The number of a train is the number of words.</p>");
    }).catch(fail);
  }

  // ============ a language: arrivals and departures ============
  function language() {
    var code = B.param("code") || "it";
    Promise.all([B.language(code), B.extra(code)]).then(function (res) {
      var d = res[0], x = res[1], l = d.lang, L = d.L, q = quadro(L, code), used = {};
      document.title = l.name + " — lexodus (timetable draft)";
      el("rq").textContent = (q ? "Quadro " + q + " — " : "") + l.name; el("rp").textContent = q ? "pag. " + pag(q) : "";
      var html = "";
      var origins = x && x.origini_lontane ? x.origini_lontane.lista || [] : [];
      if (l.target && origins.length) {
        var total = origins.reduce(function (s, o) { return s + o.n; }, 0);
        html += '<section class="sheet"><div class="hd"><h1>Arrivi</h1><span class="en">Arrivals · ' + E(l.name) + "</span></div>" +
          '<p class="intro">The words that reached ' + E(l.name) + ", by the language they started from. <b>Via</b>: the language that handed them over, with its words; “direct” when they came straight.</p>" +
          '<p class="stamp"><b>' + B.n(total) + "</b>words from its first " + origins.length + " sources</p>" +
          '<div class="tbl"><table><thead><tr>' + headN("Treno", "Train") + head("Provenienza", "From") + head("Via", "By way of") + '<th class="n"><span class="it">Note</span>Notes</th></tr></thead><tbody>' +
          origins.map(function (o) {
            var c = B.merged(o.codice), nm = c === "la" ? "Latin" : o.nome_en || B.nameOf(L, c), notes = "";
            if (quadro(L, c)) { notes += sym("◆"); used.d = 1; }
            if (hist(c, nm)) { notes += sym("†"); used.h = 1; }
            var roads = (o.strade || []).slice(0, 4).map(function (s) {
              var sc = B.merged(s.codice);
              return (sc === c ? "direct" : E(s.codice === "LATINO" ? "Latin" : s.nome_en || B.nameOf(L, sc))) + " " + B.n(s.n);
            });
            if ((o.strade || []).length > 1) { notes += sym("✱"); used.s = 1; }
            var more = (o.strade || []).length > 4 ? " (+" + ((o.strade || []).length - 4) + ")" : "";
            return '<tr><td class="train">' + B.n(o.n) + '</td><td class="st">' + stName(L, c, nm) + '</td><td class="via">' + roads.join('<span class="sep">·</span>') + more +
              '</td><td class="note">' + notes + "</td></tr>";
          }).join("") + "</tbody></table></div></section>";
      }
      html += '<section class="sheet yellow"><div class="hd"><h' + (html ? 2 : 1) + ">Partenze</h" + (html ? 2 : 1) + '><span class="en">Departures · ' + E(l.name) + "</span></div>" +
        '<p class="intro">The words that left ' + E(l.name) + " for the other 32, by destination. <b>Stops</b>: some of the words as the destination writes them.</p>" +
        '<p class="stamp"><b>' + B.n(d.toTotal) + "</b>words to " + d.to.length + " languages</p>" +
        '<div class="tbl"><table><thead><tr>' + headN("Treno", "Train") + head("Destinazione", "To") + '<th class="hide-s"><span class="it">Fermate</span>Stops</th><th class="n"><span class="it">Note</span>Notes</th></tr></thead><tbody>' +
        d.to.map(function (r) {
          var notes = "";
          if (r.target) { notes += sym("◆"); used.d = 1; }
          if (r.cats.calco || r.cats.latinismo_dotto) { notes += sym("‡"); used.c = 1; }
          var stops = r.ex.slice(0, 6).map(function (w) { return '<a href="' + E(B.wordUrl(r.code, w, 1, code)) + '">' + E(w) + "</a>"; }).join(" – ");
          return '<tr><td class="train">' + B.n(r.n) + '</td><td class="st">' + stName(L, r.code, r.name) + '</td><td class="stops hide-s">' + stops + '</td><td class="note">' + notes + "</td></tr>";
        }).join("") + "</tbody></table></div></section>";
      done(html, legend(["d", "h", "s", "c"].filter(function (k) { return used[k]; })));
    }).catch(fail);
  }

  // ============ a word: the train and its connections ============
  function word() {
    var lang = B.param("lang") || "it", w = B.param("w") || "caffè", ne = +B.param("n") || 1, from = B.param("from") || "";
    B.word(lang, w, ne, from).then(function (r) {
      var L = r.L, p = r.p;
      if (!p) { el("loading").innerHTML = "“" + E(w) + "”: no such train. <a href=\"" + B.wiktUrl(w, B.nameOf(L, lang)) + "\">Wiktionary</a>"; document.body.dataset.ready = "1"; return; }
      document.title = p.parola + " — lexodus (timetable draft)";
      var q = quadro(L, lang);
      el("rq").textContent = (q ? "Quadro " + q + " — " : "") + B.nameOf(L, lang) + " · " + p.parola; el("rp").textContent = q ? "pag. " + (pag(q) + 2) : "";
      var stops = B.journey(L, lang, p), T = r.tree ? B.fullTree(L, lang, r.tree) : null, onward = [];
      if (T) (function walk(nd) { nd.kids.forEach(function (k) { onward.push(k); walk(k); }); })(T.me);
      var jobs = stops.map(function (s, i) { return i ? B.pairCount(stops[i - 1].code, s.code) : Promise.resolve(null); })
        .concat(onward.map(function (k) { return B.pairCount(k.parent, k.code); }));
      return Promise.all(jobs).then(function (pc) {
        var used = { x: 0 }, last = pc[stops.length - 1];
        var html = '<section class="sheet"><div class="hd"><h1>' + E(p.parola) + '</h1><span class="en">Train ' + (last == null ? "–" : B.n(last)) + " · " + E(stops[0].name) + " – " + E(B.nameOf(L, lang)) + "</span></div>" +
          '<p class="intro">' + E(p.significato || "") + ". " + (r.text ? "In the Wiktionary: “" + E(r.text) + "”" : "") + "</p>" +
          '<p class="stamp"><b>' + (stops.length - 1) + "</b>" + (stops.length - 1 === 1 ? "change" : "changes") + "</p>" +
          '<div class="tbl"><table><thead><tr>' + headN("Fermata", "Stop") + head("Stazione", "Station") + head("Forma", "Form") + '<th class="hide-s"><span class="it">Trascr.</span>Transliteration</th>' +
          headN("Parole", "Words") + head("Come", "How it went on") + '<th class="n"><span class="it">Note</span>Notes</th></tr></thead><tbody>' +
          stops.map(function (s, i) {
            var notes = "";
            if (quadro(L, s.code)) { notes += sym("◆"); used.d = 1; }
            if (hist(s.code, s.name)) { notes += sym("†"); used.h = 1; }
            var words = i === 0 ? "" : pc[i] == null ? "–" : B.n(pc[i]);
            if (i && pc[i] == null) used.x = 1;
            var script = s.term && !B.isLatinScript(s.term);
            return "<tr" + (s.here ? ' class="me"' : "") + '><td class="n">' + (i + 1) + '</td><td class="st">' + stName(L, s.code, s.name) + '</td><td class="form' + (script ? " ar" : "") + '"><bdi>' + E(s.term) + "</bdi></td>" +
              '<td class="hide-s">' + E(s.tr && s.tr !== s.term ? s.tr : "") + '</td><td class="n">' + words + "</td><td>" + E(s.how || (s.here ? "terminus" : "")) + '</td><td class="note">' + notes + "</td></tr>";
          }).join("") + "</tbody></table></div>" +
          '<p class="intro" style="grid-column:1/-1;margin-top:11px">Words: all the words the station took from the one before it, the number this train shares with the others on the same line.</p></section>';
        if (onward.length) {
          html += '<section class="sheet yellow"><div class="hd"><h2>Coincidenze</h2><span class="en">Connections from ' + E(B.nameOf(L, lang)) + "</span></div>" +
            '<p class="intro">The languages that took <i>' + E(p.parola) + "</i> on, and those that took it from them. <b>Train</b>: all the words the destination took from the station it leaves.</p>" +
            '<p class="stamp"><b>' + onward.length + "</b>connections</p>" +
            '<div class="tbl"><table><thead><tr>' + headN("Treno", "Train") + head("Destinazione", "To") + head("Forma", "Form") + head("Da", "From") + '<th class="n"><span class="it">Note</span>Notes</th></tr></thead><tbody>' +
            onward.map(function (k, j) {
              var c = pc[stops.length + j], notes = "";
              if (quadro(L, k.code)) { notes += sym("◆"); used.d = 1; }
              if (k.how && k.how !== "borrowed") { notes += sym("‡"); used.c = 1; }
              var script = !B.isLatinScript(k.word);
              return '<tr><td class="train">' + (c == null ? "–" : B.n(c)) + '</td><td class="st">' + stName(L, k.code, k.name) + '</td><td class="form' + (script ? " ar" : "") + '"><a href="' + E(B.wordUrl(k.code, k.word, k.ne, k.parent)) + '"><bdi>' + E(k.word) + "</bdi></a>" + (k.tr ? " " + E(k.tr) : "") +
                "</td><td>" + E(B.nameOf(L, k.parent)) + '</td><td class="note">' + notes + "</td></tr>";
            }).join("") + "</tbody></table></div></section>";
        }
        KEY.c[1] = "not plainly borrowed: unspecified, calque or learned Latin";
        done(html, legend(["d", "h", "c", "x"].filter(function (k) { return used[k]; })));
      });
    }).catch(fail);
  }

  if (page === "index.html") home(); else if (page === "language.html") language(); else word();
})();
