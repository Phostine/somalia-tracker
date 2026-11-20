/* Interactive visualisations (d3 v7). Each function renders into an element and wires its own interaction.
   H = helpers from app.js: { t, L, sec, esc, fmtDate, fmtNum, open, SECTORS, lang, reduced }. */
(() => {
  "use strict";
  const d3 = window.d3;
  const parse = (s) => {
    const [y, m = 1, d = 15] = String(s).split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  };
  const col = (s) => `var(--c-${s})`;
  const text = (m) => [m.title, m.summary, m.context, ...(m.tags || [])].join(" ");

  /* ---------- shared tooltip ---------- */
  function tipFor(host) {
    let tip = host.querySelector(":scope > .vtip");
    if (!tip) { tip = document.createElement("div"); tip.className = "vtip"; host.appendChild(tip); }
    return {
      show(html, x, y) {
        tip.innerHTML = html; tip.classList.add("on");
        const hw = host.clientWidth, tw = tip.offsetWidth;
        tip.style.left = `${Math.max(4, Math.min(hw - tw - 4, x - tw / 2))}px`;
        tip.style.top = `${y}px`;
      },
      hide() { tip.classList.remove("on"); }
    };
  }
  const tipHTML = (H, m) => `<div class="vtip-k"><span class="sq" style="--sc:${col(m.sector)}"></span>${H.esc(H.sec(m.sector, "short"))} · ${H.esc(H.fmtDate(m.date, m.date_precision))}</div><div class="vtip-t">${H.esc(H.L(m, "title"))}</div><div class="vtip-h">${H.t("viz.click")}</div>`;

  /* =========================================================
     1. PULSE: every milestone as a dot in five sector lanes over time.
     ========================================================= */
  function pulse(el, ms, H) {
    const START = Date.UTC(2022, 3, 20), END = Date.now() + 20 * 864e5;
    const active = new Set(H.SECTORS);
    let domain = [new Date(START), new Date(END)];
    el.innerHTML = `
      <div class="pulse-bar">
        <div class="pulse-keys" role="group" aria-label="${H.esc(H.t("viz.sectors"))}">${H.SECTORS.map((s) => `<button class="pkey" data-s="${s}" aria-pressed="true" style="--sc:${col(s)}"><i></i>${H.esc(H.sec(s, "short"))}<b>${ms.filter((m) => m.sector === s).length}</b></button>`).join("")}</div>
        <div class="pulse-ctl">
          <span class="pulse-legend"><i class="lg-f"></i>${H.t("ms.verified")}<i class="lg-o"></i>${H.t("ms.reported")}</span>
          <button class="pbtn" data-act="play"><svg viewBox="0 0 24 24" width="14" height="14"><path d="M7 4v16l13-8z" fill="currentColor"/></svg><span>${H.t("viz.play")}</span></button>
          <button class="pbtn" data-act="reset" hidden>${H.t("viz.reset")}</button>
        </div>
      </div>
      <div class="pulse-stage"><div class="pulse-clock" aria-hidden="true"></div><svg class="pulse-svg" role="img" aria-label="${H.esc(H.t("viz.pulse.aria", { n: ms.length }))}"></svg></div>
      <div class="pulse-brush"><svg></svg><span class="pulse-hint">${H.t("viz.brush")}</span></div>`;
    const stage = el.querySelector(".pulse-stage"), tip = tipFor(stage), clock = el.querySelector(".pulse-clock");
    const W = Math.max(300, el.clientWidth), narrow = W < 640;
    const ml = narrow ? 6 : 128, mr = 14, laneH = narrow ? 70 : 78, top = 26;
    const H5 = top + laneH * 5 + 8;
    const r = narrow ? 3.3 : 5.2;
    const svg = d3.select(el.querySelector(".pulse-svg")).attr("viewBox", `0 0 ${W} ${H5}`);
    const x = d3.scaleUtc().range([ml, W - mr]);
    const laneY = (s) => top + laneH * H.SECTORS.indexOf(s) + laneH / 2;

    const gBands = svg.append("g"), gLanes = svg.append("g"), gMarks = svg.append("g"), gDots = svg.append("g");
    // lane labels + guides
    H.SECTORS.forEach((s, i) => {
      const y0 = top + laneH * i;
      gLanes.append("line").attr("class", "lane-rule").attr("x1", 0).attr("x2", W).attr("y1", y0 + laneH).attr("y2", y0 + laneH);
      gLanes.append("text").attr("class", "lane-lbl").attr("x", narrow ? 6 : 0).attr("y", narrow ? y0 + 13 : y0 + laneH / 2 + 4).text(H.sec(s, "short"));
    });
    const nodes = ms.filter((m) => parse(m.date) >= START).map((m) => ({ m, t: parse(m.date), x: 0, y: laneY(m.sector) }));
    const dots = gDots.selectAll("circle").data(nodes).join("circle")
      .attr("class", (d) => `dot ${d.m.verification === "verified" ? "v" : "r"}`)
      .attr("r", r).style("--sc", (d) => col(d.m.sector))
      .on("mouseenter", function (ev, d) {
        d3.select(this).raise().transition().duration(120).attr("r", r * 1.8);
        tip.show(tipHTML(H, d.m), d.x * stage.clientWidth / W, d.y * stage.clientWidth / W - 12);
      })
      .on("mouseleave", function () { d3.select(this).transition().duration(160).attr("r", r); tip.hide(); })
      .on("click", (ev, d) => H.open(d.m));

    function layout(animate) {
      x.domain(domain);
      nodes.forEach((n) => { n.tx = x(n.t); n.ty = laneY(n.m.sector); n.x = n.tx; n.y = n.ty + (Math.random() - .5) * 4; n.in = n.t >= domain[0] && n.t <= domain[1]; });
      const sim = d3.forceSimulation(nodes.filter((n) => n.in))
        .force("x", d3.forceX((d) => d.tx).strength(1))
        .force("y", d3.forceY((d) => d.ty).strength(.12))
        .force("c", d3.forceCollide(r + .9)).stop();
      for (let i = 0; i < 160; i++) sim.tick();
      nodes.forEach((n) => { const lim = laneH / 2 - r - 2; n.y = Math.max(n.ty - lim, Math.min(n.ty + lim, n.y)); });
      // year bands
      const years = d3.utcYear.range(d3.utcYear.floor(domain[0]), d3.utcYear.offset(domain[1], 1));
      gBands.selectAll("rect").data(years, (d) => +d).join("rect").attr("class", (d, i) => `yband ${d.getUTCFullYear() % 2 ? "odd" : ""}`)
        .attr("y", top).attr("height", laneH * 5)
        .attr("x", (d) => Math.max(ml, x(d))).attr("width", (d) => Math.max(0, Math.min(W - mr, x(d3.utcYear.offset(d, 1))) - Math.max(ml, x(d))));
      const ticks = x.ticks(narrow ? 4 : (domain[1] - domain[0]) / 864e5 < 500 ? 10 : 6);
      gBands.selectAll("text").data(ticks, (d) => +d).join("text").attr("class", "yax").attr("y", 16).attr("x", (d) => x(d))
        .text((d) => (domain[1] - domain[0]) / 864e5 < 900 ? H.fmtDate(d.toISOString().slice(0, 7), "month") : d.getUTCFullYear());
      // term-end marker
      const te = parse("2026-05-15");
      gMarks.selectAll("*").remove();
      if (te > domain[0] && te < domain[1]) {
        gMarks.append("line").attr("class", "term-line").attr("x1", x(te)).attr("x2", x(te)).attr("y1", top - 4).attr("y2", top + laneH * 5);
        const flip = x(te) > W * .62;
        gMarks.append("text").attr("class", "term-lbl").attr("text-anchor", flip ? "end" : "start").attr("x", x(te) + (flip ? -6 : 6)).attr("y", top + laneH * 5 - 6).text(H.t("viz.termEnd"));
      }
      const sel = animate ? dots.transition().duration(700).ease(d3.easeCubicOut) : dots;
      sel.attr("cx", (d) => d.x).attr("cy", (d) => d.y).style("opacity", (d) => d.in ? (active.has(d.m.sector) ? 1 : .1) : 0)
        .style("pointer-events", (d) => d.in && active.has(d.m.sector) ? "auto" : "none");
    }
    layout(false);
    if (!H.reduced) {
      dots.attr("r", 0).transition().delay((d) => (d.x - ml) / (W - ml) * 900 + Math.random() * 150).duration(380).attr("r", r);
    }

    // sector keys
    el.querySelectorAll(".pkey").forEach((b) => b.addEventListener("click", () => {
      const s = b.dataset.s;
      if (active.size === H.SECTORS.length) { active.clear(); active.add(s); }
      else if (active.has(s)) { active.delete(s); if (!active.size) H.SECTORS.forEach((k) => active.add(k)); }
      else active.add(s);
      el.querySelectorAll(".pkey").forEach((k) => k.setAttribute("aria-pressed", active.has(k.dataset.s)));
      dots.transition().duration(300).style("opacity", (d) => d.in ? (active.has(d.m.sector) ? 1 : .1) : 0)
        .style("pointer-events", (d) => d.in && active.has(d.m.sector) ? "auto" : "none");
    }));

    // brush (mini timeline)
    const bw = W, bh = 46;
    const bsvg = d3.select(el.querySelector(".pulse-brush svg")).attr("viewBox", `0 0 ${bw} ${bh}`);
    const bx = d3.scaleUtc().domain([new Date(START), new Date(END)]).range([ml, bw - mr]);
    const months = d3.utcMonth.range(d3.utcMonth.floor(new Date(START)), new Date(END));
    const counts = months.map((mo) => [mo, nodes.filter((n) => +d3.utcMonth.floor(n.t) === +mo).length]);
    const by = d3.scaleLinear().domain([0, d3.max(counts, (d) => d[1]) || 1]).range([bh - 14, 4]);
    bsvg.append("path").attr("class", "spark").attr("d", d3.area().curve(d3.curveMonotoneX).x((d) => bx(d[0])).y0(bh - 14).y1((d) => by(d[1]))(counts));
    bsvg.append("g").attr("class", "bax").attr("transform", `translate(0,${bh - 12})`).call(d3.axisBottom(bx).ticks(narrow ? 4 : 8).tickSize(0).tickPadding(2));
    const brush = d3.brushX().extent([[ml, 0], [bw - mr, bh - 12]]).on("end", (ev) => {
      if (!ev.sourceEvent) return;
      if (!ev.selection) { domain = [new Date(START), new Date(END)]; resetBtn.hidden = true; }
      else { const [a, b] = ev.selection.map(bx.invert); if (b - a < 40 * 864e5) return; domain = [a, b]; resetBtn.hidden = false; }
      layout(true);
    });
    const gBrush = bsvg.append("g").attr("class", "brush").call(brush);
    const resetBtn = el.querySelector('[data-act="reset"]');
    resetBtn.addEventListener("click", () => { gBrush.call(brush.move, null); domain = [new Date(START), new Date(END)]; resetBtn.hidden = true; layout(true); });

    // play: reveal the record through time
    let timer = null;
    const playBtn = el.querySelector('[data-act="play"]');
    playBtn.addEventListener("click", () => {
      if (timer) { timer.stop(); timer = null; finish(); return; }
      const [a, b] = domain, dur = 9000;
      playBtn.classList.add("on"); playBtn.querySelector("span").textContent = H.t("viz.stop");
      dots.interrupt().attr("r", 0);
      const shown = new Set();
      timer = d3.timer((el2) => {
        const k = Math.min(1, el2 / dur), cur = new Date(+a + (b - a) * k);
        clock.classList.add("on");
        clock.innerHTML = `<b>${H.fmtDate(cur.toISOString().slice(0, 7), "month")}</b><span>${H.t("viz.count", { n: nodes.filter((n) => n.in && n.t <= cur).length })}</span>`;
        dots.each(function (d) {
          if (d.in && d.t <= cur && !shown.has(d)) { shown.add(d); d3.select(this).transition().duration(260).attr("r", r * 2.2).transition().duration(300).attr("r", r); }
        });
        if (k >= 1) { timer.stop(); timer = null; setTimeout(finish, 900); }
      });
    });
    function finish() {
      dots.interrupt().attr("r", r);
      clock.classList.remove("on");
      playBtn.classList.remove("on"); playBtn.querySelector("span").textContent = H.t("viz.play");
    }
  }

  /* =========================================================
     2. PLACES MAP + PARTNER NETWORK with a shared side panel.
     ========================================================= */
  const PLACES = [
    { k: "Mogadishu", so: "Muqdisho", re: /Mogadishu|Banadir/, ll: [45.318, 2.047], cap: 1 },
    { k: "Puntland", so: "Puntland", re: /Puntland|Garowe/, ll: [48.485, 8.405], cap: 1 },
    { k: "Somaliland", so: "Somaliland", re: /Somaliland|Hargeisa/, ll: [44.065, 9.56], cap: 1 },
    { k: "Jubaland", so: "Jubaland", re: /Jubaland|Kismayo/, ll: [42.545, -0.358], cap: 1 },
    { k: "South West", so: "Koonfur Galbeed", re: /South West|Baidoa/, ll: [43.65, 3.114], cap: 1 },
    { k: "Galmudug", so: "Galmudug", re: /Galmudug|Dhusamareb/, ll: [46.386, 5.535], cap: 1 },
    { k: "Hirshabelle", so: "Hirshabeelle", re: /Hirshabelle|Jowhar/, ll: [45.5, 2.781], cap: 1 },
    { k: "Northeast State", so: "Waqooyi Bari", re: /Northeast State|SSC-Khatumo|Las Anod|Laascaanood|\bSool\b/, ll: [47.36, 8.477], cap: 1 },
    { k: "Middle Shabelle", so: "Shabeellaha Dhexe", re: /Middle Shabelle|Balcad|Adale/, ll: [45.39, 2.6] },
    { k: "Lower Shabelle", so: "Shabeellaha Hoose", re: /Lower Shabelle|Afgooye|Afgoye|Marka|Barawe/, ll: [44.75, 1.75] },
    { k: "Hiraan", so: "Hiiraan", re: /Hiraan|Hiiraan|Beledweyne|Moqokori|Mahas/, ll: [45.3, 4.3] },
    { k: "Cal Miskaad", so: "Cal Miskaad", re: /Cal Miskaad|Al Miskaad|Calmiskaad/, ll: [49.6, 10.6] },
    { k: "Leego", so: "Leego", re: /Leego/, ll: [44.27, 3.0] },
    { k: "Bosaso", so: "Boosaaso", re: /Bosaso|Bosaaso/, ll: [49.182, 11.284] },
    { k: "Berbera", so: "Berbera", re: /Berbera/, ll: [45.014, 10.44] },
    { k: "Hobyo & Harardhere", so: "Hobyo & Xarardheere", re: /Hobyo|Harardhere/, ll: [48.2, 5.0] },
    { k: "Jilib", so: "Jilib", re: /Jilib/, ll: [42.786, 0.488] },
    { k: "Ras Kamboni", so: "Raas Kaambooni", re: /Ras Kamboni/, ll: [41.58, -1.64] },
    { k: "Eyl", so: "Eyl", re: /\bEyl\b/, ll: [49.82, 7.98] },
    { k: "Sanaag", so: "Sanaag", re: /Sanaag|Erigavo/, ll: [47.37, 10.62] }
  ];
  const PARTNERS = [
    { k: "Türkiye", so: "Turkiga", re: /Turkey|Türkiye|Turkish|TPAO|Ankara/, g: "c" },
    { k: "United States", so: "Mareykanka", re: /United States|\bUS\b|U\.S\.|Washington|AFRICOM|American/, g: "c" },
    { k: "Ethiopia", so: "Itoobiya", re: /Ethiopia/, g: "c" },
    { k: "Egypt", so: "Masar", re: /Egypt/, g: "c" },
    { k: "UAE", so: "Imaaraadka", re: /UAE|Emirat|Abu Dhabi/, g: "c" },
    { k: "Qatar", so: "Qadar", re: /Qatar|Doha/, g: "c" },
    { k: "Saudi Arabia", so: "Sacuudi Carabiya", re: /Saudi/, g: "c" },
    { k: "Kenya", so: "Kenya", re: /Kenya|Nairobi/, g: "c" },
    { k: "Eritrea", so: "Eritrea", re: /Eritrea|Asmara/, g: "c" },
    { k: "Djibouti", so: "Jabuuti", re: /Djibouti/, g: "c" },
    { k: "China", so: "Shiinaha", re: /China|Chinese|Beijing/, g: "c" },
    { k: "United Kingdom", so: "Boqortooyada Ingiriiska", re: /United Kingdom|\bUK\b|Britain|British|London/, g: "c" },
    { k: "Israel", so: "Israa'iil", re: /Israel/, g: "c" },
    { k: "Russia", so: "Ruushka", re: /Russia/, g: "c" },
    { k: "Japan", so: "Jabaan", re: /Japan/, g: "c" },
    { k: "Italy", so: "Talyaaniga", re: /Italy|Italian/, g: "c" },
    { k: "Uganda", so: "Uganda", re: /Uganda/, g: "c" },
    { k: "UN", so: "QM", re: /United Nations|\bUN\b|Security Council|UNTMIS|UNSOM|OCHA|UNICEF|WFP/, g: "i" },
    { k: "African Union", so: "Midowga Afrika", re: /African Union|\bAU\b|ATMIS|AUSSOM|AMISOM/, g: "i" },
    { k: "IMF", so: "IMF", re: /\bIMF\b|International Monetary Fund|ECF/, g: "i" },
    { k: "World Bank", so: "Bangiga Adduunka", re: /World Bank|\bIDA\b/, g: "i" },
    { k: "EAC", so: "EAC", re: /\bEAC\b|East African Community/, g: "i" },
    { k: "European Union", so: "Midowga Yurub", re: /European Union|\bEU\b/, g: "i" },
    { k: "IGAD", so: "IGAD", re: /IGAD/, g: "i" },
    { k: "Arab League", so: "Jaamacadda Carabta", re: /Arab League/, g: "i" },
    { k: "Paris Club", so: "Naadiga Paris", re: /Paris Club/, g: "i" },
    { k: "OIC", so: "OIC", re: /\bOIC\b|Organisation of Islamic Cooperation|Organization of Islamic Cooperation/, g: "i" }
  ];
  const tally = (ms, defs) => defs.map((p) => ({ ...p, items: ms.filter((m) => p.re.test(text(m))) })).filter((p) => p.items.length);
  const pname = (H, p) => H.lang === "so" ? p.so : p.k;
  const domSector = (items) => d3.greatest(d3.rollups(items, (v) => v.length, (m) => m.sector), (d) => d[1])?.[0] || "politics";

  function panelList(panel, H, title, sub, items) {
    panel.innerHTML = `<div class="wp-head"><div class="kicker">${H.esc(sub)}</div><h3>${H.esc(title)}</h3></div>
      <ol class="wp-list">${items.slice().sort((a, b) => b.date.localeCompare(a.date)).map((m, i) => `<li><button data-i="${i}" style="--sc:${col(m.sector)}"><span class="sq"></span><span><time>${H.esc(H.fmtDate(m.date, m.date_precision))}</time>${H.esc(H.L(m, "title"))}</span></button></li>`).join("")}</ol>`;
    const sorted = items.slice().sort((a, b) => b.date.localeCompare(a.date));
    panel.querySelectorAll("button[data-i]").forEach((b) => b.addEventListener("click", () => H.open(sorted[+b.dataset.i], sorted)));
    panel.scrollTop = 0;
  }
  function panelRank(panel, H, title, sub, list, onPick) {
    const max = d3.max(list, (p) => p.items.length);
    panel.innerHTML = `<div class="wp-head"><div class="kicker">${H.esc(sub)}</div><h3>${H.esc(title)}</h3></div>
      <ol class="wp-rank">${list.map((p, i) => `<li><button data-i="${i}" style="--sc:${col(domSector(p.items))}"><span class="nm">${H.esc(pname(H, p))}</span><span class="br"><i style="width:${(p.items.length / max * 100).toFixed(1)}%"></i></span><b>${p.items.length}</b></button></li>`).join("")}</ol>`;
    panel.querySelectorAll("button[data-i]").forEach((b) => b.addEventListener("click", () => onPick(list[+b.dataset.i])));
  }

  let geoCache = null;
  async function where(el, ms, H) {
    el.innerHTML = `
      <div class="where-tabs" role="tablist">
        <button role="tab" aria-selected="true" data-tab="map">${H.t("viz.tab.map")}</button>
        <button role="tab" aria-selected="false" data-tab="net">${H.t("viz.tab.net")}</button>
      </div>
      <div class="where-grid"><div class="where-stage"></div><aside class="where-panel" aria-live="polite"></aside></div>
      <p class="where-note">${H.t("viz.where.note")}</p>`;
    const stage = el.querySelector(".where-stage"), panel = el.querySelector(".where-panel");
    const tabs = el.querySelectorAll("[data-tab]");
    tabs.forEach((b) => b.addEventListener("click", () => { tabs.forEach((x) => x.setAttribute("aria-selected", x === b)); b.dataset.tab === "map" ? drawMap() : drawNet(); }));

    async function drawMap() {
      stage.innerHTML = ""; const tip = tipFor(stage);
      if (!geoCache) { try { geoCache = await (await fetch("data/geo/horn.json")).json(); } catch (e) { stage.textContent = "Map unavailable."; return; } }
      const places = tally(ms, PLACES).sort((a, b) => b.items.length - a.items.length);
      const W = Math.max(300, stage.clientWidth), Ht = Math.round(W * (W < 600 ? 1.25 : 1.05));
      const svg = d3.select(stage).append("svg").attr("viewBox", `0 0 ${W} ${Ht}`).attr("class", "map-svg").attr("role", "img").attr("aria-label", H.t("viz.tab.map"));
      const som = { type: "FeatureCollection", features: geoCache.features.filter((f) => f.properties.role === "somalia") };
      const proj = d3.geoMercator().fitExtent([[16, 16], [W - 16, Ht - 16]], som);
      const path = d3.geoPath(proj);
      const defs = svg.append("defs");
      defs.append("pattern").attr("id", "sea").attr("width", 8).attr("height", 8).attr("patternUnits", "userSpaceOnUse")
        .append("path").attr("d", "M0 8 L8 0").attr("class", "sea-hatch");
      svg.append("rect").attr("width", W).attr("height", Ht).attr("fill", "url(#sea)");
      svg.append("path").attr("class", "grat").attr("d", path(d3.geoGraticule().step([2, 2])()));
      svg.append("g").selectAll("path").data(geoCache.features.filter((f) => f.properties.role === "context")).join("path").attr("class", "land-ctx").attr("d", path);
      // Draw Somalia (incl. Somaliland) as one shape: outline layer underneath, borderless fill on top hides the internal line.
      svg.append("g").selectAll("path").data(som.features).join("path").attr("class", "land-som-edge").attr("d", path);
      svg.append("g").selectAll("path").data(som.features).join("path").attr("class", "land-som").attr("d", path);
      [["Ethiopia", "Itoobiya", [42.2, 7.6]], ["Kenya", "Kenya", [40.4, 1.6]], ["Gulf of Aden", "Gacanka Cadmeed", [47.5, 12.4]], ["Indian Ocean", "Badweynta Hindiya", [49.3, 3.6]]].forEach(([en, so, ll]) => {
        const [px, py] = proj(ll); if (px > 0 && px < W && py > 0 && py < Ht) svg.append("text").attr("class", "map-ctx").attr("x", px).attr("y", py).text(H.lang === "so" ? so : en);
      });
      const rs = d3.scaleSqrt().domain([0, d3.max(places, (p) => p.items.length)]).range([0, W < 600 ? 26 : 38]);
      const g = svg.append("g");
      const nodes = g.selectAll("g").data(places.slice().reverse()).join("g").attr("class", "place").attr("tabindex", 0)
        .attr("transform", (p) => `translate(${proj(p.ll)})`).style("--sc", (p) => col(domSector(p.items)));
      nodes.append("circle").attr("class", "halo").attr("r", (p) => rs(p.items.length) + 5);
      nodes.append("circle").attr("class", "bub").attr("r", H.reduced ? (p) => rs(p.items.length) : 0)
        .transition().delay((p, i) => i * 40).duration(600).ease(d3.easeBackOut).attr("r", (p) => rs(p.items.length));
      // Labels: biggest first, skip any that would collide with a bubble or an earlier label.
      const boxes = places.map((p) => { const [px, py] = proj(p.ll), rr = rs(p.items.length); return [px - rr, py - rr, px + rr, py + rr]; });
      const hit = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
      const placed = [];
      places.forEach((p, i) => {
        const [px, py] = proj(p.ll), rr = rs(p.items.length), label = `${pname(H, p)} ${p.items.length}`, w = label.length * 6.6 + 4;
        const cands = [[px + rr + 5, py - 8, "start"], [px - rr - 5, py - 8, "end"], [px - w / 2, py + rr + 3, "middle"]];
        for (const [lx, ly, anc] of cands) {
          const x0 = anc === "start" ? lx : anc === "end" ? lx - w : lx, box = [x0, ly, x0 + w, ly + 15];
          if (x0 < 2 || x0 + w > W - 2) continue;
          if (placed.some((b) => hit(b, box)) || boxes.some((b, j) => j !== i && hit(b, box))) continue;
          placed.push(box);
          g.append("text").attr("class", "place-lbl").attr("text-anchor", anc).attr("x", anc === "middle" ? px : lx).attr("y", ly + 11).text(label);
          break;
        }
      });
      const pick = (p) => { nodes.classed("sel", (q) => q === p); panelList(panel, H, pname(H, p), H.t("viz.entriesN", { n: p.items.length }), p.items); };
      nodes.on("mouseenter", function (ev, p) { const [px, py] = proj(p.ll), k = stage.clientWidth / W; tip.show(`<div class="vtip-t">${H.esc(pname(H, p))}</div><div class="vtip-k">${H.t("viz.entriesN", { n: p.items.length })} · ${H.esc(H.sec(domSector(p.items), "short"))}</div>`, px * k, (py - rs(p.items.length)) * k - 10); })
        .on("mouseleave", () => tip.hide()).on("click", (ev, p) => pick(p))
        .on("keydown", (ev, p) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); pick(p); } });
      panelRank(panel, H, H.t("viz.map.rank"), H.t("viz.map.rankSub"), places, pick);
    }

    function drawNet() {
      stage.innerHTML = ""; const tip = tipFor(stage);
      const list = tally(ms, PARTNERS).filter((p) => p.items.length >= 2).sort((a, b) => (a.g === b.g ? b.items.length - a.items.length : a.g < b.g ? -1 : 1));
      const W = Math.max(300, stage.clientWidth), Ht = W < 600 ? W * 1.05 : Math.min(620, W * .9);
      const cx = W / 2, cy = Ht / 2, R = Math.min(W, Ht) / 2 - (W < 600 ? 62 : 96);
      const svg = d3.select(stage).append("svg").attr("viewBox", `0 0 ${W} ${Ht}`).attr("class", "net-svg").attr("role", "img").attr("aria-label", H.t("viz.tab.net"));
      const n = list.length, gap = 0.5;  // gap between countries and institutions
      const nc = list.filter((p) => p.g === "c").length;
      const total = n + gap * 2;
      list.forEach((p, i) => { const slot = i + (i >= nc ? gap : 0) + .5; p.a = -Math.PI / 2 + slot / total * Math.PI * 2; p.x = cx + R * Math.cos(p.a); p.y = cy + R * Math.sin(p.a); p.s = domSector(p.items); });
      const rs = d3.scaleSqrt().domain([0, d3.max(list, (p) => p.items.length)]).range([3, W < 600 ? 15 : 22]);
      const ws = d3.scaleLinear().domain([1, d3.max(list, (p) => p.items.length)]).range([1, W < 600 ? 6 : 10]);
      svg.append("circle").attr("class", "net-ring").attr("cx", cx).attr("cy", cy).attr("r", R);
      const links = svg.append("g").selectAll("path").data(list).join("path").attr("class", "net-link").style("--sc", (p) => col(p.s))
        .attr("stroke-width", (p) => ws(p.items.length))
        .attr("d", (p) => { const mx = cx + (p.x - cx) * .5 + Math.sin(p.a) * 30, my = cy + (p.y - cy) * .5 - Math.cos(p.a) * 30; return `M${cx},${cy} Q${mx},${my} ${p.x},${p.y}`; });
      if (!H.reduced) links.each(function () { const L0 = this.getTotalLength(); d3.select(this).attr("stroke-dasharray", `${L0} ${L0}`).attr("stroke-dashoffset", L0).transition().delay(Math.random() * 400).duration(900).attr("stroke-dashoffset", 0).on("end", function () { d3.select(this).attr("stroke-dasharray", null); }); });
      svg.append("circle").attr("class", "net-core").attr("cx", cx).attr("cy", cy).attr("r", W < 600 ? 26 : 36);
      svg.append("text").attr("class", "net-core-t").attr("x", cx).attr("y", cy + 4).text(H.lang === "so" ? "Soomaaliya" : "Somalia");
      const nodes = svg.append("g").selectAll("g").data(list).join("g").attr("class", "net-node").attr("tabindex", 0).style("--sc", (p) => col(p.s))
        .attr("transform", (p) => `translate(${p.x},${p.y})`);
      nodes.append("circle").attr("r", (p) => rs(p.items.length));
      nodes.append("text").attr("class", "net-lbl")
        .attr("x", (p) => Math.cos(p.a) * (rs(p.items.length) + 6)).attr("y", (p) => Math.sin(p.a) * (rs(p.items.length) + 6) + 4)
        .attr("text-anchor", (p) => Math.abs(Math.cos(p.a)) < .2 ? "middle" : Math.cos(p.a) > 0 ? "start" : "end")
        .text((p) => pname(H, p));
      // group labels
      const focus = (p) => { links.classed("dim", (q) => p && q !== p); nodes.classed("dim", (q) => p && q !== p); };
      const pick = (p) => { nodes.classed("sel", (q) => q === p); panelList(panel, H, pname(H, p), H.t("viz.entriesN", { n: p.items.length }), p.items); };
      nodes.on("mouseenter", (ev, p) => { focus(p); const k = stage.clientWidth / W; tip.show(`<div class="vtip-t">${H.esc(pname(H, p))}</div><div class="vtip-k">${H.t("viz.entriesN", { n: p.items.length })} · ${H.t("viz.mostly", { s: H.sec(p.s, "short") })}</div>`, p.x * k, (p.y - rs(p.items.length)) * k - 10); })
        .on("mouseleave", () => { focus(null); tip.hide(); }).on("click", (ev, p) => pick(p))
        .on("keydown", (ev, p) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); pick(p); } });
      panelRank(panel, H, H.t("viz.net.rank"), H.t("viz.net.rankSub"), list.slice().sort((a, b) => b.items.length - a.items.length), pick);
    }
    drawMap();
  }

  /* =========================================================
     3. INDICATOR EXPLORER: one large animated chart, events overlaid.
     ========================================================= */
  const EVENT_KEYS = {
    "domestic-revenue": /revenue|tax|customs|budget/i,
    "external-debt": /HIPC|debt|Paris Club/i,
    "budget-size": /budget/i,
    "gdp-growth": /IMF|ECF|drought|growth/i,
    "gdp-nominal": /IMF|HIPC/i,
    "inflation": /inflation|currency|central bank|shilling/i,
    "current-account": /trade|export|remittance/i,
    "external-grants": /budget support|aid cut|grant/i,
    "people-in-need": /drought|famine|flood|IPC|aid cut|humanitarian/i,
    "ipc3-plus": /drought|famine|IPC|aid cut/i,
    "livestock-exports": /livestock|export|Saudi/i,
    "population": /census|population|ID/i,
    "remittances-mobile-money": /mobile money|remittance/i
  };
  function explorer(el, inds, ms, H, startId) {
    const list = inds.filter((i) => i.series.some((p) => p.value != null));
    let cur = list.find((i) => i.id === startId) || list.find((i) => i.headline) || list[0];
    const latest = (ind) => ind.series.filter((p) => !p.projection && p.value != null).sort((a, b) => a.year - b.year).pop();
    el.innerHTML = `<div class="xp">
      <div class="xp-list" role="tablist">${list.map((i) => { const l = latest(i); return `<button role="tab" data-id="${H.esc(i.id)}" style="--sc:${col(i.sector || "economy")}"><span class="xp-n">${H.esc(H.L(i, "name"))}</span><span class="xp-v">${l ? H.esc(H.fmtNum(+l.value, i.unit)) : "—"}<small>${l ? l.year : ""}</small></span></button>`; }).join("")}</div>
      <div class="xp-main"><div class="xp-head"></div><div class="xp-chart"><svg></svg></div><div class="xp-foot"></div></div></div>`;
    const chartEl = el.querySelector(".xp-chart"), tip = tipFor(chartEl);
    const W = Math.max(300, chartEl.clientWidth), narrow = W < 600, Ht = narrow ? 260 : 340;
    const m = { l: narrow ? 40 : 56, r: 12, t: 34, b: 28 };
    const svg = d3.select(chartEl.querySelector("svg")).attr("viewBox", `0 0 ${W} ${Ht}`);
    svg.append("defs").append("pattern").attr("id", "xhatch").attr("width", 6).attr("height", 6).attr("patternUnits", "userSpaceOnUse").attr("patternTransform", "rotate(45)")
      .append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 6).attr("class", "xh-line");
    const gGrid = svg.append("g"), gBars = svg.append("g"), gZero = svg.append("line").attr("class", "xp-zero"), gX = svg.append("g").attr("class", "xp-x"), gEv = svg.append("g"), gVal = svg.append("g");
    const x = d3.scaleBand().range([m.l, W - m.r]).padding(.28), y = d3.scaleLinear().range([Ht - m.b, m.t]);

    function draw(ind, first) {
      cur = ind;
      el.querySelectorAll(".xp-list button").forEach((b) => b.setAttribute("aria-selected", b.dataset.id === ind.id));
      const s = ind.series.filter((p) => p.value != null).slice().sort((a, b) => a.year - b.year);
      const l = latest(ind);
      el.querySelector(".xp-head").innerHTML = `<div class="kicker">${H.esc(H.sec(ind.sector || "economy", "short"))}${ind.unit ? " · " + H.esc(ind.unit) : ""}</div>
        <h3>${H.esc(H.L(ind, "name"))}</h3><p>${H.esc(H.L(ind, "description"))}</p>
        ${l ? `<div class="xp-big"><b data-count="${+l.value}" data-unit="${H.esc(ind.unit || "")}">${H.esc(H.fmtNum(+l.value, ind.unit))}</b><span>${H.t("viz.latest", { y: l.year })}</span></div>` : ""}`;
      x.domain(s.map((p) => p.year));
      const vals = s.map((p) => +p.value);
      y.domain([Math.min(0, d3.min(vals)), Math.max(0, d3.max(vals))]).nice(5);
      const T = first || H.reduced ? 0 : 650;
      const tr = svg.transition().duration(T).ease(d3.easeCubicInOut);
      gGrid.transition(tr).call(d3.axisLeft(y).ticks(5).tickSize(-(W - m.l - m.r)).tickFormat((v) => d3.format("~s")(v)).tickPadding(6)).attr("transform", `translate(${m.l},0)`);
      gGrid.attr("class", "xp-grid");
      gZero.transition(tr).attr("x1", m.l).attr("x2", W - m.r).attr("y1", y(0)).attr("y2", y(0));
      gX.attr("transform", `translate(0,${Ht - m.b + 6})`).transition(tr).call(d3.axisBottom(x).tickSize(0).tickFormat((v) => narrow && s.length > 6 ? `'${String(v).slice(2)}` : v));
      const bars = gBars.selectAll("rect").data(s, (p) => p.year);
      bars.exit().transition(tr).attr("y", y(0)).attr("height", 0).remove();
      bars.enter().append("rect").attr("x", (p) => x(p.year)).attr("width", x.bandwidth()).attr("y", y(0)).attr("height", 0)
        .merge(bars)
        .attr("class", (p) => `xp-bar ${p.projection ? "proj" : ""}`)
        .on("mouseenter", function (ev, p) {
          const k = chartEl.clientWidth / W;
          tip.show(`<div class="vtip-t">${p.year}${p.projection ? ` · ${H.t("chart.proj")}` : ""}: ${H.esc(H.fmtNum(+p.value, ind.unit))}</div><div class="vtip-k">${H.esc(p.source || "")}</div>`, (x(p.year) + x.bandwidth() / 2) * k, Math.min(y(p.value), y(0)) * k - 10);
        })
        .on("mouseleave", () => tip.hide())
        .transition(tr).delay((p, i) => first && !H.reduced ? i * 70 : 0).duration(first && !H.reduced ? 600 : T)
        .attr("x", (p) => x(p.year)).attr("width", x.bandwidth())
        .attr("y", (p) => Math.min(y(p.value), y(0))).attr("height", (p) => Math.max(1, Math.abs(y(p.value) - y(0))));
      // value labels on first and last actual + last projection
      const lab = s.filter((p, i) => i === 0 || i === s.length - 1 || p === l);
      gVal.selectAll("text").data(lab, (p) => p.year).join("text").attr("class", "xp-val").attr("text-anchor", "middle")
        .text((p) => H.fmtNum(+p.value, ind.unit)).transition(tr)
        .attr("x", (p) => x(p.year) + x.bandwidth() / 2).attr("y", (p) => p.value >= 0 ? y(p.value) - 6 : y(p.value) + 14);
      // events
      const re = EVENT_KEYS[ind.id];
      const y0 = s[0].year, y1 = s[s.length - 1].year;
      const evs = re ? ms.filter((mm) => re.test(text(mm)) && +mm.date.slice(0, 4) >= y0 && +mm.date.slice(0, 4) <= y1 && (mm.sector === (ind.sector || "economy") || mm.sector === "economy" || mm.sector === "social")) : [];
      // Years can be non-consecutive (e.g. 2018, 2023, 2025), so place events by interpolating between bar centres.
      const yrs = s.map((p) => p.year), cx = d3.scaleLinear().domain(yrs.length > 1 ? yrs : [yrs[0] - 1, yrs[0] + 1]).range(yrs.length > 1 ? yrs.map((v) => x(v) + x.bandwidth() / 2) : [m.l, W - m.r]).clamp(true);
      const evx = (mm) => cx(+mm.date.slice(0, 4) + ((+mm.date.slice(5, 7) || 6) - .5) / 12 - .5);
      gEv.selectAll("g").data(evs, (mm) => mm.id).join(
        (en) => { const g = en.append("g").attr("class", "xp-ev").style("--sc", (mm) => col(mm.sector)); g.append("line"); g.append("path").attr("d", "M0,-5 L5,0 L0,5 L-5,0Z"); return g; })
        .attr("transform", (mm) => `translate(${evx(mm)},${m.t - 16})`)
        .each(function () { d3.select(this).select("line").attr("y1", 5).attr("y2", Ht - m.b - m.t + 16); })
        .on("mouseenter", function (ev, mm) { d3.select(this).classed("on", true); tip.show(tipHTML(H, mm), evx(mm) * chartEl.clientWidth / W, (m.t - 22) * chartEl.clientWidth / W); })
        .on("mouseleave", function () { d3.select(this).classed("on", false); tip.hide(); })
        .on("click", (ev, mm) => H.open(mm, evs));
      const srcs = [...new Map(s.filter((p) => p.source).map((p) => [p.source, p.url])).entries()];
      el.querySelector(".xp-foot").innerHTML = `${evs.length ? `<span class="xp-evkey"><i></i>${H.t("viz.events", { n: evs.length })}</span>` : ""}
        ${s.some((p) => p.projection) ? `<span class="legend-proj"><i></i>${H.t("chart.projLegend")}</span>` : ""}
        <span>${H.t("chart.source")} ${srcs.slice(0, 3).map(([nm, u]) => u ? `<a href="${H.esc(u)}" target="_blank" rel="noopener">${H.esc(nm)}</a>` : H.esc(nm)).join("; ")}${srcs.length > 3 ? ` +${srcs.length - 3}` : ""}</span>`;
      H.countUp && H.countUp(el.querySelector(".xp-big b"));
    }
    el.querySelectorAll(".xp-list button").forEach((b) => b.addEventListener("click", () => draw(list.find((i) => i.id === b.dataset.id))));
    draw(cur, true);
  }

  window.Viz = { pulse, where, explorer, PLACES, PARTNERS };
})();
