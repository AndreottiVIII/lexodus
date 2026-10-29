/* lexodus, draft "schedario": home (cabinet), language (two drawers pulled out), word (catalogue card). */
(function () {
  "use strict";
  var B = window.B;
  function el(id) { return document.getElementById(id); }
  var page = document.body.dataset.page;
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; }
  function fail(e) { el("loading").textContent = "The data could not be loaded (" + e.message + ")."; console.error(e); }
  function ready() { document.body.dataset.ready = "1"; }
  var TABS = ["0%", "33%", "64%"];
  function lay(i, key) {
    var r = (hash(key) - 0.5) * 1.6, dx = Math.round((hash(key + "x") - 0.5) * 12);
    return "--rot:" + r.toFixed(2) + "deg;--dx:" + dx + "px";
  }
  function label(name, sub) {
    return '<span class="holder"><span class="lab"><b>' + B.esc(name) + "</b>" + (sub ? "<small>" + sub + "</small>" : "") + "</span></span>";
  }

  // ===================== home: the cabinet =====================
  function home() {
    B.langs().then(function (L) {
      var list = L.list.slice().sort(function (a, b) { return a.name.localeCompare(b.name); });
      var html = list.map(function (l) {
        return '<li><a class="drawer oak" href="' + B.langUrl(l.code) + '">' + label(l.name, B.n(l.took) + " in<br>" + B.n(l.gave) + " out") + '<span class="pull" aria-hidden="true"></span></a></li>';
      }).join("");
      for (var i = list.length; i % 6; i++) html += '<li aria-hidden="true"><span class="drawer oak blank">' + label("—", "&nbsp;<br>&nbsp;") + '<span class="pull"></span></span></li>';
      el("drawers").innerHTML = html;
      el("loading").hidden = true; el("app").hidden = false;
      ready();
    }).catch(fail);
  }

  // ===================== language: two drawers pulled out =====================
  var LIMIT = 16;
  function language() {
    var code = B.param("code") || "it";
    B.language(code).then(function (d) {
      var l = d.lang, L = d.L;
      document.title = l.name + " — drawer — lexodus (card catalogue draft)";
      el("lang").textContent = l.name;
      el("facts").textContent = l.target
        ? B.n(l.lemmas) + " entries in English Wiktionary, " + Math.round(l.pct) + "% with an etymology. One card per language; a snapshot of Wiktionary, not the whole vocabulary."
        : "Not one of the 33 languages read here: only the words it gave are filed.";
      el("jump").innerHTML = '<option value="">Open another drawer…</option>' + L.list.slice().sort(function (a, b) { return a.name.localeCompare(b.name); })
        .map(function (t) { return '<option value="' + t.code + '"' + (t.code === code ? " selected" : "") + ">" + B.esc(t.name) + "</option>"; }).join("");
      el("jump").onchange = function () { if (this.value) location.href = B.langUrl(this.value); };
      function drawer(side, rows, total) {
        el(side + "-front").innerHTML = label(side === "from" ? l.name + " ← took from" : l.name + " → gave to", B.n(total) + " words · " + rows.length + " cards") + '<span class="pull" aria-hidden="true"></span>';
        function cards(k) {
          return rows.slice(0, k).map(function (r, i) {
            var ex = r.ex.slice(0, 6).map(function (w) {
              var href = side === "from" ? B.wordUrl(code, w, 1, r.code) : B.wordUrl(r.code, w, 1, code);
              return '<a href="' + B.esc(href) + '">' + B.esc(w) + "</a>";
            }).join(", ");
            var cats = Object.keys(r.cats).sort(function (a, b) { return r.cats[b] - r.cats[a]; });
            var red = cats.length > 1 ? cats.map(function (c) { return B.n(r.cats[c]) + " " + B.CATS[c]; }).join(", ") : "all " + B.CATS[cats[0]];
            var blue = r.target ? '<a class="pen blue" href="' + B.langUrl(r.code) + '">see drawer ' + B.esc(r.name) + " →</a>" : "";
            return '<li style="' + lay(i, side + r.code) + '"><div class="card"><a class="tab" href="' + B.langUrl(r.code) + '" style="--tab-x:' + TABS[i % 3] + '">' + B.esc(r.name) + "</a>" +
              '<div class="head"><span class="who">' + (side === "from" ? B.esc(l.name) + " ← " + B.esc(r.name) : B.esc(r.name) + " ← " + B.esc(l.name)) + '</span><span class="cnt">' + B.n(r.n) + " w.</span></div>" +
              '<p class="typed">e.g. ' + ex + "</p>" +
              '<span class="note"><span class="pen red">' + B.esc(red) + "</span>" + (blue ? " &nbsp; " + blue : "") + "</span></div></li>";
          }).join("");
        }
        el(side + "-stack").innerHTML = cards(LIMIT);
        var b = el(side + "-more");
        b.hidden = rows.length <= LIMIT;
        b.textContent = "Pull out all " + rows.length + " cards";
        b.onclick = function () { el(side + "-stack").innerHTML = cards(rows.length); b.hidden = true; };
      }
      el("from-box").hidden = !l.target;
      if (l.target) drawer("from", d.from, d.fromTotal);
      drawer("to", d.to, d.toTotal);
      el("loading").hidden = true; el("app").hidden = false;
      ready();
    }).catch(fail);
  }

  // ===================== word: the catalogue card =====================
  function word() {
    var lang = B.param("lang") || "it", w = B.param("w") || "caffè", ne = +B.param("n") || 1, from = B.param("from") || "";
    B.word(lang, w, ne, from).then(function (r) {
      var L = r.L, p = r.p;
      if (!p) {
        el("loading").innerHTML = "No card for “" + B.esc(w) + "” in this catalogue. <a href=\"" + B.wiktUrl(w, B.nameOf(L, lang)) + "\">Wiktionary</a>.";
        return ready();
      }
      var stops = B.journey(L, lang, p);
      document.title = p.parola + " — catalogue card — lexodus (card catalogue draft)";
      el("callno").textContent = lang.toUpperCase() + " " + String(p.parola).charAt(0).toUpperCase() + " · " + p.parola + " | " + (p.n_etimologia || 1);
      el("entry").innerHTML = '<span class="circle">' + B.esc(p.parola) + "</span>" + B.trSpan(p.traslitterazione, p.parola) + (p.pos ? '<span class="pos">' + B.esc(p.pos) + ".</span>" : "");
      el("meaning").innerHTML = p.significato ? "“" + B.esc(p.significato) + "”" : "(no meaning given)";
      el("trace").innerHTML = stops.map(function (s, i) {
        var name = '<a href="' + B.langUrl(s.code) + '">' + B.esc(s.name) + "</a>";
        return "<li><span>" + (i + 1) + '.</span><span class="' + (s.here ? "here" : "") + '">' + name + " " + B.esc(s.term || "—") + (s.tr && s.tr !== s.term ? " (" + B.esc(s.tr) + ")" : "") + "</span>" +
          (s.how ? '<span class="how pen red">' + B.esc(s.how) + " ↓</span>" : '<span class="how pen red">today</span>') + "</li>";
      }).join("");
      el("ety").textContent = "Wiktionary: " + (r.text || "no etymology text.") + (r.text && r.text.length >= 300 ? "…" : "");
      el("wikt").href = B.wiktUrl(p.parola, B.nameOf(L, lang));
      el("margin").innerHTML = stops.length > 1
        ? stops.length + " languages!<br>" + stops.map(function (s) { return B.esc(s.name); }).join(" → ")
        : "no earlier step known";
      // see also: the words that came from this one
      var giu = r.tree && r.tree.e ? r.tree.e.giu || [] : [];
      var flat = [];
      (function walk(list, parent) { list.forEach(function (g) { flat.push({ g: g, parent: parent }); walk(g.giu || [], g.lingua); }); })(giu, lang);
      var cap = 24;
      el("see").innerHTML = flat.slice(0, cap).map(function (x, i) {
        var g = x.g;
        return '<li style="' + lay(i, g.lingua + g.parola) + '"><a class="card" style="display:block;text-decoration:none" href="' + B.esc(B.wordUrl(g.lingua, g.parola, g.n_etimologia, x.parent)) + '">' +
          '<span class="tab" style="--tab-x:' + TABS[i % 3] + '">' + B.esc(B.nameOf(L, g.lingua)) + "</span>" +
          '<span class="head"><span class="who">' + B.esc(g.parola) + (g.traslitterazione && g.traslitterazione !== g.parola ? " (" + B.esc(g.traslitterazione) + ")" : "") + '</span><span class="pen blue">from ' + B.esc(B.nameOf(L, x.parent)) + "</span></span>" +
          '<span class="typed small" style="display:block">' + B.esc(g.significato || "") + "</span></a></li>";
      }).join("");
      el("see-sum").innerHTML = flat.length
        ? B.n(flat.length) + " cards filed under other drawers" + (flat.length > cap ? " (first " + cap + ")" : "") + '<br><span class="pen blue">words that came from this one</span>'
        : '<span class="pen blue">No other language took it, as far as Wiktionary says.</span>';
      el("loading").hidden = true; el("app").hidden = false;
      ready();
    }).catch(fail);
  }

  if (page === "home") home();
  else if (page === "language") language();
  else word();
})();
