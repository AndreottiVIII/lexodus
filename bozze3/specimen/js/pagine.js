/* lexodus, draft "specimen" (a printer's specimen sheet): home (the founts of the 33 tongues in a waterfall), language
   (a sheet with the tongue set in a body proportional to what it took and gave), word (a proof of caffè, one fount
   per script, and the words recast from it). */
(function () {
  "use strict";
  var B = window.B;
  function el(id) { return document.getElementById(id); }
  var page = document.body.dataset.page;
  // the scale of bodies, in points, and the size each is set at on screen (never under 15 px)
  var BODIES = [6, 8, 10, 12, 14, 18, 24, 36, 48, 72];
  var PX = { 6: 15, 8: 17, 10: 20, 12: 24, 14: 28, 18: 34, 24: 44, 36: 60, 48: 80, 72: 112 };
  function body(v, max) {
    if (!(v > 0)) return 6;
    var i = Math.round(9 * Math.log(v) / Math.log(Math.max(max, 2)));
    return BODIES[Math.max(0, Math.min(9, i))];
  }
  // the threshold of each body for a given maximum: the smallest number of words that is set in it
  function threshold(k, max) { return k === 0 ? 1 : Math.ceil(Math.exp((k - 0.5) / 9 * Math.log(max))); }
  var ENDONYM = {
    it: "Italiano", es: "Español", fr: "Français", ro: "Română", pt: "Português", ca: "Català", en: "English", de: "Deutsch",
    nl: "Nederlands", sv: "Svenska", da: "Dansk", nb: "Norsk bokmål", is: "Íslenska", pl: "Polski", sh: "Srpskohrvatski",
    ru: "Русский", cs: "Čeština", uk: "Українська", bg: "Български", sk: "Slovenčina", sl: "Slovenščina", lv: "Latviešu",
    lt: "Lietuvių", fi: "Suomi", hu: "Magyar", et: "Eesti", mt: "Malti", ar: "العربية", he: "עברית", tr: "Türkçe",
    el: "Ελληνικά", fa: "فارسی", sq: "Shqip"
  };
  var FACE_NAME = { bodoni: "Bodoni", caslon: "Caslon", oldstd: "Old Standard", fat: "Fat Face", "bodoni-i": "Bodoni Italic",
    naskh: "Amiri Naskh", ruqaa: "Ruqʿa", hebrew: "Frank Rühl", greek: "Didot Greek", cyr: "Old Standard Cyrillic", other: "System" };
  var LATIN = ["bodoni", "caslon", "oldstd", "bodoni-i", "fat"];
  // one fount per script: the Ottoman word is set in Ruqʿa, the hand of the Ottoman chancery
  function face(text, code, i) {
    var t = String(text || "");
    if (/\p{Script=Arabic}/u.test(t)) return code === "ota" ? "ruqaa" : "naskh";
    if (/\p{Script=Hebrew}/u.test(t)) return "hebrew";
    if (/\p{Script=Greek}/u.test(t)) return "greek";
    if (/\p{Script=Cyrillic}/u.test(t)) return "cyr";
    if (!B.isLatinScript(t)) return "other";
    return LATIN[(i || 0) % LATIN.length];
  }
  function dir(t) { return /[\p{Script=Arabic}\p{Script=Hebrew}]/u.test(String(t)) ? ' dir="rtl"' : ""; }
  function fail(e) { el("loading").textContent = "The forme fell apart: the data could not be loaded (" + e.message + ")."; console.error(e); }
  function ready() { document.body.dataset.ready = "1"; }
  function show() { el("loading").hidden = true; el("app").hidden = false; }
  function scale(max, unit) {
    el("scale").innerHTML = '<p class="scale-title">Scale of bodies <span>· ' + B.esc(unit) + "</span></p><ol>" + BODIES.map(function (b, k) {
      return '<li><span class="sz" style="--px:' + PX[b] + '">Aa</span><span class="pt">' + b + ' pt</span><span class="th">from ' + B.n(threshold(k, max)) + "</span></li>";
    }).join("") + "</ol>";
  }

  // ===================== home: the specimen book =====================
  function home() {
    B.langs().then(function (L) {
      var list = L.list.slice().sort(function (a, b) { return (b.took + b.gave) - (a.took + a.gave); });
      var max = list[0].took + list[0].gave;
      el("founts").innerHTML = list.map(function (l, i) {
        var b = body(l.took + l.gave, max), endo = ENDONYM[l.code] || l.name, f = face(endo, l.code, i);
        return '<li><span class="no">' + (i + 1) + '</span><a class="line" href="' + B.langUrl(l.code) + '"><span class="sz f-' + f + '" style="--px:' + PX[b] + '"' + dir(endo) + ">" + B.esc(endo) + "</span></a>" +
          '<span class="spec"><span class="pt red">' + b + " pt</span> " + B.esc(FACE_NAME[f]) + "<br>" + B.esc(l.name) + " · " + B.n(l.took + l.gave) + " words</span></li>";
      }).join("");
      scale(max, "words taken and given");
      el("slug-r").textContent = "Specimen book of 33 founts";
      show(); ready();
    }).catch(fail);
  }

  // ===================== language: the sheet of a tongue =====================
  var LINES = 16;
  function language() {
    var code = B.param("code") || "it";
    Promise.all([B.language(code), B.langs()]).then(function (res) {
      var d = res[0], l = d.lang, L = res[1];
      var order = L.list.slice().sort(function (a, b) { return a.name.localeCompare(b.name); });
      var num = order.map(function (t) { return t.code; }).indexOf(code) + 1;
      document.title = "Sheet of " + l.name + " — lexodus (specimen draft)";
      el("slug-l").textContent = "lexodus · specimen n. " + (num || "—");
      el("slug-r").textContent = "Sheet of the " + l.name + " tongue";
      el("name").textContent = l.name;
      var endo = ENDONYM[code];
      el("endo").innerHTML = endo && endo !== l.name ? '<span class="f-' + face(endo, code, 1) + '"' + dir(endo) + ">" + B.esc(endo) + "</span>" : "";
      // took and gave set on the scale of the 33 tongues
      var maxAll = Math.max.apply(null, L.list.map(function (t) { return Math.max(t.took, t.gave); }));
      if (l.target) {
        var bt = body(l.took, maxAll), bg = body(l.gave, maxAll);
        el("took-line").innerHTML = '<span class="sz f-bodoni" style="--px:' + PX[bt] + '">took ' + B.n(l.took) + '</span><span class="pt">' + bt + " pt</span>";
        el("gave-line").innerHTML = '<span class="sz f-bodoni-i" style="--px:' + PX[bg] + '">gave ' + B.n(l.gave) + '</span><span class="pt">' + bg + " pt</span>";
      } else {
        var bo = body(d.toTotal, maxAll);
        el("gave-line").innerHTML = '<span class="sz f-bodoni-i" style="--px:' + PX[bo] + '">gave ' + B.n(d.toTotal) + '</span><span class="pt">' + bo + " pt</span>";
      }
      var max = Math.max(d.from.length ? d.from[0].n : 1, d.to.length ? d.to[0].n : 1);
      function fall(id, rows, side) {
        el(id).innerHTML = rows.slice(0, LINES).map(function (r, i) {
          var b = body(r.n, max), f = LATIN[i % LATIN.length];
          var ex = r.ex.slice(0, 4).map(function (w) {
            var href = side === "from" ? B.wordUrl(code, w, 1, r.code) : B.wordUrl(r.code, w, 1, code);
            return '<a href="' + B.esc(href) + '">' + B.esc(w) + "</a>";
          }).join(" ");
          return '<li><span class="pt red">' + b + '</span><a class="line" href="' + B.langUrl(r.code) + '"><span class="sz f-' + f + '" style="--px:' + PX[b] + '">' + B.esc(r.name) + "</span></a>" +
            '<span class="spec">' + B.n(r.n) + (r.n === 1 ? " word" : " words") + " · " + ex + "</span></li>";
        }).join("") || '<li class="rest">None.</li>';
        var rest = rows.slice(LINES);
        el(id + "-rest").innerHTML = rest.length ? '<span class="pt red">6 pt</span> and ' + rest.length + " more: " +
          rest.map(function (r) { return '<a href="' + B.langUrl(r.code) + '">' + B.esc(r.name) + "</a> " + B.n(r.n); }).join(", ") + "." : "";
      }
      if (l.target) fall("from", d.from, "from"); else el("from").innerHTML = '<li class="rest">Not one of the thirty-three: what it took is not set here.</li>';
      fall("to", d.to, "to");
      scale(max, "words, on this sheet");
      el("jump").innerHTML = order.map(function (t, i) { return '<option value="' + t.code + '"' + (t.code === code ? " selected" : "") + ">n. " + (i + 1) + " · " + B.esc(t.name) + "</option>"; }).join("");
      el("jump").onchange = function () { if (this.value) location.href = B.langUrl(this.value); };
      show(); ready();
    }).catch(fail);
  }

  // ===================== word: the proof =====================
  function word() {
    var lang = B.param("lang") || "it", w = B.param("w") || "caffè", ne = +B.param("n") || 1, from = B.param("from") || "";
    B.word(lang, w, ne, from).then(function (r) {
      var L = r.L, p = r.p;
      if (!p) {
        el("loading").innerHTML = "No type was cast for “" + B.esc(w) + "”. <a href=\"" + B.wiktUrl(w, B.nameOf(L, lang)) + "\">Wiktionary</a>.";
        return ready();
      }
      var stops = B.journey(L, lang, p);
      document.title = "Proof of " + p.parola + " — lexodus (specimen draft)";
      el("slug-r").textContent = "Proof of “" + p.parola + "”" + (p.significato ? ", " + p.significato : "");
      // the stops, oldest first: the word itself in the biggest body, the older forms a step smaller each
      el("proof").innerHTML = stops.map(function (s, i) {
        var b = s.here ? 72 : BODIES[Math.max(6, 9 - (stops.length - 1 - i))], f = s.here ? "bodoni-i" : face(s.term, s.code, i);
        var sample = s.term || "—";
        return '<div class="stop' + (s.here ? " here" : "") + '"><p class="spec-l"><span class="no red">No. ' + (i + 1) + '</span><a href="' + B.langUrl(s.code) + '">' + B.esc(s.name) + "</a>" +
          "<span>" + B.esc(FACE_NAME[f]) + ", " + b + " pt</span>" + (s.tr && s.tr !== s.term ? '<span class="tr">' + B.esc(s.tr) + "</span>" : "") + "</p>" +
          '<p class="sample sz f-' + f + '" style="--px:' + (s.here ? 190 : PX[b] * 1.25) + '"' + dir(sample) + ">" + B.esc(sample) + "</p>" +
          (i < stops.length - 1 ? '<p class="how red">' + B.esc(s.how || "taken") + " ↓</p>" : "") + "</div>";
      }).join("");
      el("ety").textContent = (r.text || "No note.") + (r.text && r.text.length >= 300 ? "…" : "");
      el("wikt").href = B.wiktUrl(p.parola, B.nameOf(L, lang));
      // recast afterwards: every later word in its own fount, a smaller body at every step away
      var giu = r.tree && r.tree.e ? r.tree.e.giu || [] : [], items = [];
      (function walk(list, parent, depth) {
        list.forEach(function (g) { items.push({ g: g, parent: parent, depth: depth }); walk(g.giu || [], g.lingua, depth + 1); });
      })(giu, lang, 0);
      el("desc-sum").textContent = items.length ? items.length + " words, each in the fount of its script; the body drops one step for every tongue in between." : "Nothing was recast from it, as far as the Wiktionary says.";
      el("desc").innerHTML = items.map(function (it, i) {
        var g = it.g, b = BODIES[Math.max(3, 7 - it.depth)], f = face(g.parola, g.lingua, i);
        return '<a class="cast" href="' + B.esc(B.wordUrl(g.lingua, g.parola, g.n_etimologia, it.parent)) + '" title="' + B.esc(B.nameOf(L, g.lingua) + ", from " + B.nameOf(L, it.parent)) + '">' +
          '<span class="sz f-' + f + '" style="--px:' + PX[b] + '"' + dir(g.parola) + ">" + B.esc(g.parola) + '</span><span class="cap">' + B.esc(B.merged(g.lingua)) + " · " + b + "</span></a>";
      }).join("");
      show(); ready();
    }).catch(fail);
  }

  if (page === "index") home();
  else if (page === "language") language();
  else word();
})();
