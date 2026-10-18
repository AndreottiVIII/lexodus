/* lexodus — index page: language picker and the flow chart (took from | language | gave to). */
(function () {
  "use strict";
  var L = window.Lex;
  var state = { code: "it", filters: null, top: "15", data: null };
  var tip = null;

  function el(id) { return document.getElementById(id); }

  function showTip(html, ev) {
    if (!tip) { tip = document.createElement("div"); tip.className = "tip"; tip.setAttribute("role", "status"); document.body.appendChild(tip); }
    tip.innerHTML = html; tip.hidden = false;
    var x = ev.clientX + 14, y = ev.clientY + 14;
    var r = tip.getBoundingClientRect();
    if (x + r.width > window.innerWidth - 8) x = Math.max(8, ev.clientX - r.width - 14);
    if (y + r.height > window.innerHeight - 8) y = Math.max(8, ev.clientY - r.height - 14);
    tip.style.left = x + "px"; tip.style.top = y + "px";
  }
  function hideTip() { if (tip) tip.hidden = true; }

  function langName(code) { var l = state.data.langs[code]; return l ? l.name : code; }

  function catLine(catId, c) {
    var cat = L.CAT_BY_KEY[catId];
    return '<div class="t-row"><span class="sw sw-' + catId + '"></span><span>' + cat.label + ": <b>" + L.n(c.n) + "</b> " + (c.n === 1 ? "word" : "words") +
      (c.unc ? " (" + L.n(c.unc) + " uncertain)" : "") + "</span></div>" +
      (c.ex && c.ex.length ? '<div class="ex">' + c.ex.slice(0, 8).map(L.esc).join(", ") + "</div>" : "");
  }

  function renderPicker() {
    var box = el("langs");
    box.innerHTML = state.data.targets.map(function (l) {
      return '<button type="button" id="pick-' + l.code + '" data-code="' + l.code + '" aria-pressed="' + (l.code === state.code) + '">' +
        "<span>" + L.esc(l.name) + "</span>" + L.coverageBadge(l.coverage) + "</button>";
    }).join("");
  }

  function renderHead() {
    var l = state.data.langs[state.code];
    var cov = L.COVERAGE[l.coverage];
    el("lang-title").textContent = l.name;
    el("lang-sub").innerHTML = '<span class="code">' + L.esc(l.code) + "</span>" + (l.coverage ? L.coverageBadge(l.coverage) : "") +
      '<a href="language.html?code=' + encodeURIComponent(l.code) + '">Open the ' + L.esc(l.name) + " page</a>";
    var txt = "<strong>A snapshot of English Wiktionary, not a measure of the vocabulary.</strong> ";
    if (l.pct !== null && l.lemmas !== null) {
      txt += "Only " + l.pct.toLocaleString("en-GB") + "% of the " + L.n(l.lemmas) + " " + L.esc(l.name) + " entries have an etymology there" +
        (cov ? " (coverage: " + cov.label + ")" : "") + ". ";
    }
    txt += "Two languages with similar numbers are not directly comparable.";
    if (L.NOTES[l.code]) txt += " " + L.esc(L.NOTES[l.code]);
    el("lang-notice").innerHTML = txt;
  }

  function sideNodes(side) {
    var arcs = state.data.arcs.filter(function (a) { return side === "from" ? a.to === state.code : a.from === state.code; });
    var groups = L.aggregate(arcs, side, state.filters, state.data.langs);
    var total = groups.reduce(function (s, g) { return s + g.total; }, 0);
    var count = groups.length;
    var limit = state.top === "all" ? Infinity : Number(state.top);
    if (groups.length > limit) {
      var rest = groups.slice(limit);
      var other = { code: null, total: 0, unc: 0, byCat: {}, count: rest.length };
      rest.forEach(function (g) {
        other.total += g.total; other.unc += g.unc;
        Object.keys(g.byCat).forEach(function (k) {
          var c = other.byCat[k] || (other.byCat[k] = { n: 0, unc: 0, ex: [] });
          c.n += g.byCat[k].n; c.unc += g.byCat[k].unc;
        });
      });
      groups = groups.slice(0, limit).concat([other]);
    }
    return { nodes: groups, total: total, count: count };
  }

  function bandPath(x0, y0, x1, y1, t) {
    var xm = (x0 + x1) / 2;
    return "M" + x0 + "," + y0 + "C" + xm + "," + y0 + " " + xm + "," + y1 + " " + x1 + "," + y1 +
      "L" + x1 + "," + (y1 + t) + "C" + xm + "," + (y1 + t) + " " + xm + "," + (y0 + t) + " " + x0 + "," + (y0 + t) + "Z";
  }

  function renderFlow() {
    var left = sideNodes("from"), right = sideNodes("to");
    var me = state.data.langs[state.code];
    el("took-sum").textContent = left.count ? L.n(left.total) + " words from " + left.count + (left.count === 1 ? " source" : " sources") : "nothing with these filters";
    el("gave-sum").textContent = right.count ? L.n(right.total) + " words to " + right.count + (right.count === 1 ? " language" : " languages") : "nothing with these filters";
    // Same scale on both sides: say so when one side is less than a fifth of the other.
    var big = Math.max(left.total, right.total), small = Math.min(left.total, right.total);
    var note = el("scale-note");
    if (big > 0 && small * 5 < big) {
      var smallName = left.total < right.total ? "Took from" : "Gave to";
      note.textContent = smallName + " is drawn to the same scale: " + L.n(small) + " words vs " + L.n(big) + ".";
      note.hidden = false;
    } else note.hidden = true;

    var box = el("flow");
    var W = Math.max(320, box.clientWidth || 900);
    var narrow = W < 600;
    var labelW = narrow ? 96 : 170, barW = narrow ? 6 : 8, centerW = narrow ? 10 : 14, gap = 5, minSlot = narrow ? 14 : 16;
    var maxN = Math.max(left.nodes.length, right.nodes.length, 1);
    var Hb = Math.max(220, Math.min(560, maxN * 24));
    var T = Math.max(left.total, right.total, 1);
    var k = Hb / T;
    var top = 34;

    function place(nodes) {
      var y = 0;
      nodes.forEach(function (g) { g.h = Math.max(g.total * k, 1); g.slot = Math.max(g.h, minSlot); g.y = y; y += g.slot + gap; });
      return Math.max(0, y - gap);
    }
    var hl = place(left.nodes), hr = place(right.nodes);
    var H = Math.max(hl, hr, Hb) + top + 12;
    var off = function (h) { return top + (H - top - 12 - h) / 2; };
    var ol = off(hl), or = off(hr);
    left.nodes.forEach(function (g) { g.y += ol; });
    right.nodes.forEach(function (g) { g.y += or; });

    var xL = labelW, xC = W / 2 - centerW / 2, xR = W - labelW - barW;
    var cH = Math.max(left.total, right.total) * k;
    var cy = top + (H - top - 12 - cH) / 2;

    var svg = d3.select(box).selectAll("svg").data([0]).join("svg");
    svg.attr("viewBox", "0 0 " + W + " " + H).attr("role", "img")
      .attr("aria-label", me.name + ": took " + L.n(left.total) + " words from " + left.count + " sources and gave " + L.n(right.total) + " words to " + right.count + " languages.");
    svg.selectAll("*").remove();
    var gBands = svg.append("g"), gNodes = svg.append("g");

    var catOrder = L.CATS.map(function (c) { return c.id; });
    var bands = [];
    function addBands(nodes, side, total) {
      var cOff = cy + (cH - total * k) / 2;
      nodes.forEach(function (g) {
        var inner = g.y + (g.slot - g.h) / 2;
        catOrder.forEach(function (cat) {
          var c = g.byCat[cat];
          if (!c || !c.n) return;
          var t = c.n * k;
          bands.push({ g: g, cat: cat, c: c, side: side, t: t, yn: inner, yc: cOff });
          inner += t; cOff += t;
        });
      });
    }
    addBands(left.nodes, "from", left.total);
    addBands(right.nodes, "to", right.total);

    function bandTip(b) {
      var other = b.g.code ? langName(b.g.code) : b.g.count + " other languages";
      var head = b.side === "from" ? other + " → " + me.name : me.name + " → " + other;
      return "<b>" + L.esc(head) + "</b>" + catLine(b.cat, b.c);
    }
    function nodeTip(g, side) {
      var other = g.code ? langName(g.code) : g.count + " other languages";
      var head = side === "from" ? other + " → " + me.name : me.name + " → " + other;
      var html = "<b>" + L.esc(head) + "</b>: " + L.n(g.total) + (g.total === 1 ? " word" : " words");
      var l = g.code && state.data.langs[g.code];
      if (l && !L.isLanguage(l.type)) html += " <i>(" + (L.TYPE_LABEL[l.type] || l.type) + ")</i>";
      if (g.code === "la" && !state.filters.splitLatin) html += '<div class="ex">All Latin varieties together.</div>';
      catOrder.forEach(function (cat) { if (g.byCat[cat]) html += catLine(cat, g.byCat[cat]); });
      if (g.code && state.data.langs[g.code] && state.data.langs[g.code].target) html += '<div class="ex">Click to put it at the centre.</div>';
      else if (g.code) html += '<div class="ex">Click to open its page.</div>';
      else html += '<div class="ex">Click to show all languages.</div>';
      return html;
    }

    function hot(match) {
      box.classList.add("hovering");
      gBands.selectAll("path").classed("hot", match);
    }
    function cool() { box.classList.remove("hovering"); gBands.selectAll("path").classed("hot", false); hideTip(); }

    gBands.selectAll("path").data(bands).join("path")
      .attr("class", function (b) { return "band c-" + b.cat; })
      .attr("d", function (b) {
        return b.side === "from" ? bandPath(xL + barW, b.yn, xC, b.yc, b.t) : bandPath(xC + centerW, b.yc, xR, b.yn, b.t);
      })
      .on("pointermove", function (ev, b) { hot(function (d) { return d === b; }); showTip(bandTip(b), ev); })
      .on("pointerleave", cool);

    function drawSide(nodes, side) {
      var xb = side === "from" ? xL : xR;
      var gs = gNodes.selectAll("g." + side).data(nodes).join("g").attr("class", side);
      gs.append("rect").attr("class", "node-bar").attr("x", xb).attr("width", barW)
        .attr("y", function (g) { return g.y + (g.slot - g.h) / 2; }).attr("height", function (g) { return g.h; });
      var maxChars = narrow ? 12 : 22;
      var t = gs.append("text")
        .attr("class", function (g) {
          var l = g.code && state.data.langs[g.code];
          return "node-label" + (l && !L.isLanguage(l.type) ? " other-type" : "");
        })
        .attr("x", side === "from" ? xb - 6 : xb + barW + 6)
        .attr("y", function (g) { return g.y + g.slot / 2; })
        .attr("dominant-baseline", "middle")
        .attr("text-anchor", side === "from" ? "end" : "start")
        .attr("tabindex", 0).attr("role", "link");
      t.append("tspan").text(function (g) {
        var name = g.code ? langName(g.code) : g.count + " others";
        return name.length > maxChars ? name.slice(0, maxChars - 1) + "…" : name;
      });
      t.append("tspan").attr("class", "num").attr("dx", 5).text(function (g) { return L.n(g.total); });
      t.append("title").text(function (g) { return g.code ? langName(g.code) + " (" + g.code + ")" : g.count + " other languages"; });
      gs.on("pointermove", function (ev, g) { hot(function (b) { return b.g === g; }); showTip(nodeTip(g, side), ev); })
        .on("pointerleave", cool)
        .on("click", function (ev, g) { choose(g); })
        .on("keydown", function (ev, g) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); choose(g); } });
      if (!nodes.length) {
        gNodes.append("text").attr("class", "empty").attr("x", side === "from" ? xC - 12 : xC + centerW + 12).attr("y", H / 2)
          .attr("text-anchor", side === "from" ? "end" : "start").text("No words with these filters");
      }
    }
    drawSide(left.nodes, "from");
    drawSide(right.nodes, "to");

    gNodes.append("rect").attr("class", "center-bar").attr("x", xC).attr("width", centerW).attr("y", cy).attr("height", Math.max(cH, 2));
    gNodes.append("text").attr("class", "center-label").attr("x", W / 2).attr("y", Math.max(16, cy - 10)).attr("text-anchor", "middle").text(me.name);
  }

  function choose(g) {
    hideTip();
    if (!g.code) { state.top = "all"; el("top-n").value = "all"; renderFlow(); return; }
    var l = state.data.langs[g.code];
    if (l && l.target) setCenter(g.code, true);
    else location.href = "language.html?code=" + encodeURIComponent(g.code);
  }

  function setCenter(code, push) {
    if (!state.data.langs[code] || !state.data.langs[code].target) code = "it";
    state.code = code;
    if (push) {
      var u = new URL(location.href); u.searchParams.set("lang", code);
      try { history.pushState({ lang: code }, "", u.href); } catch (e) { /* file:// in some browsers */ }
    }
    document.title = state.data.langs[code].name + " — lexodus";
    renderPicker(); renderHead(); renderFlow();
  }

  L.load().then(function (data) {
    state.data = data;
    L.footer(data.source);
    el("app").hidden = false; el("loading").hidden = true;
    state.filters = L.filterBar(el("filters"), function (f) { state.filters = f; renderFlow(); });
    el("top-n").addEventListener("change", function (e) { state.top = e.target.value; renderFlow(); });
    el("langs").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-code]"); if (b) setCenter(b.dataset.code, true);
    });
    window.addEventListener("popstate", function () { setCenter(L.param("lang") || "it", false); });
    var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(renderFlow, 120); });
    setCenter(L.param("lang") || "it", false);
  }).catch(function (err) {
    el("loading").className = "error";
    el("loading").textContent = "The data could not be loaded (" + err.message + "). If you opened the file directly, check that the data/*.js files are next to this page.";
    console.error(err);
  });
})();
