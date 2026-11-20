/* Somalia Progress Tracker — static single-page app.
   All content lives in /data/*.json (see data/SCHEMA.md). Interface strings live in assets/i18n.js.
   Somali content uses `<field>_so` next to the English field, falling back to English when missing. */
(() => {
  "use strict";

  const SECTOR_KEYS = ["politics", "economy", "security", "diplomacy", "social"];
  const VERDICT_ICONS = {
    "false": '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6m0-6-6 6"/>',
    "misleading": '<path d="M12 3 2 20h20z"/><path d="M12 10v4m0 3v.5"/>',
    "partly-true": '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>',
    "true": '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    "unproven": '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7m0 3v.5"/>'
  };
  const TERM_START = "2022-05-15";

  const state = { milestones: [], indicators: [], factchecks: [], sources: [], errors: [] };
  const app = document.getElementById("app");

  // ---------- language ----------
  let lang = "en";
  try { const q = new URLSearchParams(location.search).get("lang"); lang = q || localStorage.getItem("lang") || (navigator.language || "").startsWith("so") && "so" || "en"; } catch (e) {}
  if (!window.I18N[lang]) lang = "en";
  const t = (key, vars) => {
    let s = window.I18N[lang][key] ?? window.I18N.en[key] ?? key;
    if (vars) s = s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
    return s;
  };
  // Localized content field: obj.field_so in Somali (if present), else obj.field.
  const L = (obj, field) => (lang === "so" && obj?.[field + "_so"]) || obj?.[field] || "";
  const isTranslated = (obj, field) => lang !== "so" || !obj?.[field] || !!obj[field + "_so"];
  function langBadge(obj, field = "title") {
    if (lang !== "so") return "";
    if (!isTranslated(obj, field)) return `<span class="badge-lang" title="${esc(t("badge.enonly.tip"))}">${t("badge.enonly")}</span>`;
    if (obj.translation_so === "machine") return `<span class="badge-lang" title="${esc(t("badge.machine.tip"))}">${t("badge.machine")}</span>`;
    return "";
  }
  const sec = (k, part = "") => t(`sec.${k}${part ? "." + part : ""}`);

  // ---------- utilities ----------
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const svgIcon = (paths, size = 18) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  const safeUrl = (u) => /^https?:\/\//i.test(u || "") ? u : "#";
  function fmtDate(d, precision) {
    if (!d) return "";
    const [y, m, day] = d.split("-").map(Number);
    const months = lang === "so" ? window.I18N.so.MONTHS_LONG : window.I18N.en.MONTHS;
    if (precision === "year" || !m) return String(y);
    if (precision === "month" || !day) return `${months[m - 1]} ${y}`;
    return `${day} ${months[m - 1]} ${y}`;
  }
  function fmtNum(v, unit) {
    if (v == null || isNaN(v)) return "—";
    const s = Math.abs(v) >= 100 ? v.toLocaleString("en-US", { maximumFractionDigits: 0 }) : v.toLocaleString("en-US", { maximumFractionDigits: 1 });
    if (!unit) return s;
    if (unit === "%") return s + "%";
    const usd = unit.match(/^US\$\s*(bn|billion|m|million)?\s*(.*)$/i);
    if (usd) {
      const mag = { billion: "bn", million: "m" }[(usd[1] || "").toLowerCase()] || usd[1] || "";
      return "$" + s + mag + (usd[2] ? " " + usd[2] : "");
    }
    if (/^% /.test(unit)) return s + unit;
    return s + " " + unit;
  }
  const sectorStyle = (s) => `--sc: var(--c-${SECTOR_KEYS.includes(s) ? s : "politics"})`;
  const byDateDesc = (a, b) => (b.date || "").localeCompare(a.date || "");
  const debounce = (fn, ms = 150) => { let tm; return (...a) => { clearTimeout(tm); tm = setTimeout(() => fn(...a), ms); }; };

  // ---------- data ----------
  async function loadJSON(path) {
    try {
      const r = await fetch(path, { cache: "no-cache" });
      if (!r.ok) throw new Error(r.status);
      const d = await r.json();
      return Array.isArray(d) ? d : [];
    } catch (e) {
      state.errors.push(path);
      return [];
    }
  }
  async function loadAll() {
    const [ms, ind, fc, src] = await Promise.all([
      Promise.all(SECTOR_KEYS.map((f) => loadJSON(`data/${f}.json`))),
      loadJSON("data/indicators.json"),
      loadJSON("data/factchecks.json"),
      loadJSON("data/sources.json")
    ]);
    const seen = new Set();
    state.milestones = ms.flat().filter((m) => m && m.date && m.title && !(m.id && seen.has(m.id)) && (seen.add(m.id), true)).sort(byDateDesc);
    state.indicators = ind.filter((i) => i && Array.isArray(i.series) && i.series.length);
    state.factchecks = fc.filter((f) => f && f.claim).sort(byDateDesc);
    state.sources = src.filter((s) => s && s.name);
  }

  // ---------- components ----------
  function sourceList(sources) {
    if (!sources?.length) return "";
    return `<ul class="src-list">${sources.map((s) => `<li><span class="stype">${esc(t("src.type." + (s.type || "source")))}</span><a href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener">${esc(s.name || s.url)}</a>${s.date ? ` <span class="muted">· ${esc(fmtDate(s.date))}</span>` : ""}</li>`).join("")}</ul>`;
  }
  function milestoneCard(m) {
    const verified = m.verification === "verified";
    const ctx = L(m, "context");
    return `<article class="ms" style="${sectorStyle(m.sector)}" id="${esc(m.id)}">
      <div class="ms-date"><time datetime="${esc(m.date)}">${esc(fmtDate(m.date, m.date_precision))}</time></div>
      <div class="ms-body">
      <div class="ms-meta">
        <span class="tag"><span class="dot"></span>${esc(sec(m.sector, "short"))}</span>
        ${m.subcategory ? `<span>${esc(L(m, "subcategory"))}</span>` : ""}
        <span class="badge-v ${verified ? "verified" : ""}" title="${esc(t(verified ? "ms.verified.tip" : "ms.reported.tip"))}">${verified ? svgIcon('<path d="m5 12 4 4 10-10"/>', 12) + t("ms.verified") : t("ms.reported")}</span>
        ${langBadge(m)}
      </div>
      <h3>${esc(L(m, "title"))}</h3>
      <p>${esc(L(m, "summary"))}</p>
      ${m.impact ? `<p class="impact"><b>${t("ms.why")}</b> ${esc(L(m, "impact"))}</p>` : ""}
      <details>
        <summary>${t(ctx ? "ms.ctxsrc" : "ms.sources")} (${(m.sources || []).length})</summary>
        ${ctx ? `<div class="context"><b>${t("ms.context")}</b> ${esc(ctx)}</div>` : ""}
        ${sourceList(m.sources)}
      </details>
      </div>
    </article>`;
  }
  function timelineHTML(list) {
    if (!list.length) return `<div class="empty">${t("f.none")}</div>`;
    const groups = {};
    list.forEach((m) => { const y = m.date.slice(0, 4); (groups[y] ||= []).push(m); });
    return `<div class="timeline">${Object.keys(groups).sort().reverse().map((y) => `
      <div class="year-group"><div class="year-label"><b>${y}</b><span>${groups[y].length === 1 ? t("ms.count1") : t("ms.count", { n: groups[y].length })}</span></div>
      <div class="tl-list">${groups[y].map(milestoneCard).join("")}</div></div>`).join("")}</div>`;
  }

  // Bar chart for a yearly series (discrete years → bars). Projections are hatched.
  let chartSeq = 0;
  function barChart(ind) {
    const id = `ch${++chartSeq}`;
    const s = ind.series.filter((p) => p.value != null && !isNaN(p.value)).sort((a, b) => a.year - b.year);
    if (!s.length) return "";
    const W = 520, H = 190, pl = 44, pr = 8, pt = 12, pb = 24;
    const vals = s.map((p) => +p.value);
    let min = Math.min(0, ...vals), max = Math.max(0, ...vals);
    if (max === min) max = min + 1;
    const step = niceStep((max - min) / 4);
    max = Math.ceil(max / step) * step; min = Math.floor(min / step) * step;
    const y = (v) => pt + (H - pt - pb) * (1 - (v - min) / (max - min));
    const bw = (W - pl - pr) / s.length;
    const barW = Math.min(36, bw * 0.62);
    let grid = "";
    for (let v = min; v <= max + 1e-9; v += step) {
      grid += `<line class="grid" x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}"/><text class="axis" x="${pl - 6}" y="${y(v) + 4}" text-anchor="end">${esc(shortNum(v))}</text>`;
    }
    const cols = s.map((p, i) => {
      const cx = pl + bw * i + bw / 2;
      const v = +p.value, y0 = y(0), y1 = y(v);
      const top = Math.min(y0, y1), h = Math.max(1, Math.abs(y1 - y0));
      const r = Math.min(4, barW / 2, h);
      const x0 = cx - barW / 2, x1 = cx + barW / 2;
      const path = v >= 0
        ? `M${x0},${y0} V${top + r} Q${x0},${top} ${x0 + r},${top} H${x1 - r} Q${x1},${top} ${x1},${top + r} V${y0} Z`
        : `M${x0},${y0} V${top + h - r} Q${x0},${top + h} ${x0 + r},${top + h} H${x1 - r} Q${x1},${top + h} ${x1},${top + h - r} V${y0} Z`;
      const tip = `${p.year}${p.projection ? ` (${t("chart.proj")})` : ""}: ${fmtNum(v, ind.unit)} · ${p.source || ""}`;
      return `<g class="col" data-tip="${esc(tip)}" data-x="${cx}" data-y="${top}">
        <path class="bar ${p.projection ? "proj" : ""}" d="${path}" ${p.projection ? 'stroke="var(--chart-bar)" stroke-width="1"' : ""}/>
        <rect class="hit" x="${pl + bw * i}" y="${pt}" width="${bw}" height="${H - pt}"/>
        <text class="axis" x="${cx}" y="${H - 6}" text-anchor="middle">${p.year}</text></g>`;
    }).join("");
    return `<div class="chart" id="${id}">
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t("chart.aria", { name: L(ind, "name") }))}">
        <defs><pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="transparent"/><line x1="0" y1="0" x2="0" y2="5" stroke="var(--chart-bar)" stroke-width="2.2"/></pattern></defs>
        ${grid}<line x1="${pl}" x2="${W - pr}" y1="${y(0)}" y2="${y(0)}" stroke="var(--muted)" stroke-width="1"/>${cols}
      </svg><div class="tooltip" role="status"></div></div>`;
  }
  function niceStep(raw) {
    const p = Math.pow(10, Math.floor(Math.log10(raw || 1)));
    const n = raw / p;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
  }
  function shortNum(v) {
    const a = Math.abs(v);
    if (a >= 1e6) return (v / 1e6).toFixed(a % 1e6 ? 1 : 0) + "M";
    if (a >= 1e4) return (v / 1e3).toFixed(0) + "k";
    return Number.isInteger(v) ? v.toLocaleString("en-US") : v.toFixed(1);
  }
  function bindCharts(root) {
    root.querySelectorAll(".chart").forEach((c) => {
      const tip = c.querySelector(".tooltip"), svg = c.querySelector("svg");
      c.querySelectorAll("g.col").forEach((g) => {
        g.addEventListener("mouseenter", () => {
          const sc = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
          tip.textContent = g.dataset.tip;
          tip.style.left = `${g.dataset.x * sc}px`;
          tip.style.top = `${g.dataset.y * sc}px`;
          tip.classList.add("on");
        });
        g.addEventListener("mouseleave", () => tip.classList.remove("on"));
      });
    });
    root.querySelectorAll("[data-toggle-table]").forEach((b) => b.addEventListener("click", () => {
      const tb = document.getElementById(b.dataset.toggleTable);
      tb.hidden = !tb.hidden;
      b.textContent = t(tb.hidden ? "chart.show" : "chart.hide");
    }));
  }
  function latestActual(ind) {
    const s = ind.series.filter((p) => !p.projection && p.value != null).sort((a, b) => a.year - b.year);
    return s[s.length - 1];
  }
  function indicatorCard(ind) {
    const last = latestActual(ind);
    const hasProj = ind.series.some((p) => p.projection);
    const tid = `t-${esc(ind.id)}`;
    const srcs = [...new Map(ind.series.filter((p) => p.source).map((p) => [p.source, p.url])).entries()];
    return `<div class="card ind-card">
      <div class="ind-head"><div><h3>${esc(L(ind, "name"))}</h3><div class="desc">${esc(L(ind, "description"))}${ind.unit ? ` <span class="muted">(${esc(ind.unit)})</span>` : ""} ${langBadge(ind, "name")}</div></div>
      ${last ? `<div class="ind-latest"><b>${esc(fmtNum(+last.value, ind.unit))}</b><span>${last.year}</span></div>` : ""}</div>
      ${barChart(ind)}
      <div class="ind-foot"><span>${t("chart.source")} ${srcs.slice(0, 2).map(([n, u]) => u ? `<a href="${esc(safeUrl(u))}" target="_blank" rel="noopener">${esc(n)}</a>` : esc(n)).join("; ")}${srcs.length > 2 ? ` <span class="muted">${t("chart.more", { n: srcs.length - 2 })}</span>` : ""}</span>
        <span>${hasProj ? `<span class="legend-proj"><i></i>${t("chart.projLegend")}</span> · ` : ""}<button class="linkbtn" data-toggle-table="${tid}">${t("chart.show")}</button></span></div>
      <table class="data" id="${tid}" hidden><thead><tr><th>${t("chart.year")}</th><th>${t("chart.value")}</th><th>${t("chart.src")}</th></tr></thead><tbody>
        ${ind.series.slice().sort((a, b) => a.year - b.year).map((p) => `<tr><td>${p.year}${p.projection ? " " + t("chart.projShort") : ""}</td><td class="n">${esc(fmtNum(+p.value, ind.unit))}</td><td>${p.url ? `<a href="${esc(safeUrl(p.url))}" target="_blank" rel="noopener">${esc(p.source)}</a>` : esc(p.source || "")}</td></tr>`).join("")}
      </tbody></table></div>`;
  }
  // ---------- fact-check game ----------
  const VERDICTS = ["true", "partly-true", "misleading", "false", "unproven"];
  const SCALE = ["true", "partly-true", "misleading", "false"];
  let picks = {}; try { picks = JSON.parse(localStorage.getItem("fcPicks") || "{}") || {}; } catch (e) {}
  let gameOn = true; try { gameOn = localStorage.getItem("fcGame") !== "off"; } catch (e) {}
  const savePicks = () => { try { localStorage.setItem("fcPicks", JSON.stringify(picks)); } catch (e) {} };
  function gameScore() {
    const called = state.factchecks.filter((f) => picks[f.id] && picks[f.id] !== "_seen");
    return t("game.score", { a: called.length, b: state.factchecks.length, c: called.filter((f) => picks[f.id] === f.verdict).length });
  }
  function factcheckCard(f, game = false) {
    const key = VERDICT_ICONS[f.verdict] ? f.verdict : "unproven";
    const hidden = game && !picks[f.id];
    const row = (label, field) => f[field] ? `<div><dt>${t(label)}</dt><dd>${esc(L(f, field))}</dd></div>` : "";
    const cmp = row("fc.official", "official_position") + row("fc.indep", "independent_evidence");
    const pick = picks[f.id];
    let result = "";
    if (game && pick && pick !== "_seen") {
      const d = Math.abs(SCALE.indexOf(pick) - SCALE.indexOf(key));
      const ok = pick === key, close = !ok && SCALE.includes(pick) && SCALE.includes(key) && d === 1;
      result = `<div class="verdict-line ${ok ? "ok" : close ? "near" : "miss"}">${t("game.you", { v: t("v." + pick) })} <b>${t(ok ? "game.right" : close ? "game.close" : "game.wrong")}</b></div>`;
    }
    return `<article class="fc v-${key} ${hidden ? "hidden-v" : ""}" id="${esc(f.id)}" data-fcid="${esc(f.id)}">
      <div class="fc-side">${hidden ? `<span class="stamp stamp-q">?</span>` : `<span class="stamp">${svgIcon(VERDICT_ICONS[key], 14)}${t("v." + key)}</span>`}
        ${f.date ? `<time datetime="${esc(f.date)}">${esc(fmtDate(f.date, f.date_precision))}</time>` : ""}
        ${SECTOR_KEYS.includes(f.sector) ? `<span class="tag" style="${sectorStyle(f.sector)}"><span class="dot"></span>${sec(f.sector, "short")}</span>` : ""}
        ${langBadge(f, "claim")}</div>
      <div class="fc-body">
        <p class="claim">${esc(L(f, "claim"))}</p>
        ${f.circulated_by ? `<div class="where"><b>${t("fc.where")}</b>${esc(L(f, "circulated_by"))}</div>` : ""}
        ${hidden ? `<div class="guess"><div class="guess-q">${t("game.sub")}</div>
          <div class="guess-opts">${VERDICTS.map((v) => `<button class="gopt v-${v}" data-fc="${esc(f.id)}" data-v="${v}"><span class="dot"></span>${t("v." + v)}</button>`).join("")}</div>
          <button class="linkbtn" data-reveal="${esc(f.id)}">${t("game.reveal")}</button></div>` : `${result}
        ${f.finding ? `<div class="finding"><b>${t("fc.finding")}</b>${esc(L(f, "finding"))}</div>` : ""}
        ${cmp ? `<dl class="compare">${cmp}</dl>` : ""}
        <details><summary>${t("ms.sources")} (${(f.sources || []).length})</summary>${sourceList(f.sources)}</details>`}
      </div>
    </article>`;
  }
  function bindGame(root) {
    root.addEventListener("click", (e) => {
      if (e.target.closest("[data-next]")) {
        const box = document.getElementById("homeGame"), curId = box?.querySelector("[data-fcid]")?.dataset.fcid;
        const pool = state.factchecks.filter((f) => !picks[f.id] && f.id !== curId);
        const nx = pool[0] || state.factchecks[(state.factchecks.findIndex((f) => f.id === curId) + 1) % state.factchecks.length];
        if (box && nx) { box.innerHTML = factcheckCard(nx, true); box.firstElementChild.classList.add("swap"); }
        return;
      }
      const b = e.target.closest("[data-fc],[data-reveal]");
      if (!b) return;
      const id = b.dataset.fc || b.dataset.reveal;
      picks[id] = b.dataset.v || "_seen"; savePicks();
      const card = root.querySelector(`[data-fcid="${CSS.escape(id)}"]`), f = state.factchecks.find((x) => x.id === id);
      if (card && f) { card.outerHTML = factcheckCard(f, true); root.querySelector(`[data-fcid="${CSS.escape(id)}"]`)?.classList.add("just"); }
      document.querySelectorAll(".game-score").forEach((s) => { s.textContent = gameScore(); });
    });
  }

  // ---------- motion helpers ----------
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function countUp(el) {
    if (!el || el.dataset.count == null) return;
    const to = +el.dataset.count, unit = el.dataset.unit || "", plain = el.dataset.plain != null;
    const fmt = (v) => plain ? Math.round(v).toLocaleString("en-US") : fmtNum(Math.abs(to) < 100 && !Number.isInteger(to) ? Math.round(v * 10) / 10 : Math.round(v), unit);
    if (reduced) { el.textContent = fmt(to); return; }
    const t0 = performance.now(), dur = 1100;
    const step = (now) => { const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(to * e); if (k < 1) requestAnimationFrame(step); else el.textContent = fmt(to); };
    requestAnimationFrame(step);
  }
  let io;
  function observeReveal(root) {
    if (reduced || !("IntersectionObserver" in window)) { root.querySelectorAll(".reveal").forEach((n) => n.classList.add("in")); root.querySelectorAll("[data-count]").forEach(countUp); return; }
    io?.disconnect();
    io = new IntersectionObserver((ents) => ents.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("in"); en.target.querySelectorAll("[data-count]").forEach(countUp);
      io.unobserve(en.target);
    }), { rootMargin: "0px 0px -8% 0px" });
    root.querySelectorAll(".reveal").forEach((n) => io.observe(n));
  }

  // ---------- interactive visualisations ----------
  const helpers = () => ({ t, L, sec, esc, fmtDate, fmtNum, open: openDrawer, SECTORS: SECTOR_KEYS, lang, reduced, countUp });
  function initViz(root = app) {
    if (!window.Viz || !window.d3) return;
    const H = helpers();
    root.querySelectorAll("[data-viz]").forEach((el) => {
      const kind = el.dataset.viz, s = el.dataset.sector;
      try {
        if (kind === "pulse") window.Viz.pulse(el, s ? state.milestones.filter((m) => m.sector === s) : state.milestones, H);
        if (kind === "where") window.Viz.where(el, state.milestones, H);
        if (kind === "explorer") window.Viz.explorer(el, s ? state.indicators.filter((i) => (i.sector || "economy") === s) : state.indicators, state.milestones, H, el.dataset.start);
      } catch (e) { console.error(kind, e); }
    });
  }
  let lastW = innerWidth;
  window.addEventListener("resize", debounce(() => { if (Math.abs(innerWidth - lastW) > 40) { lastW = innerWidth; initViz(); } }, 250));

  // ---------- detail drawer ----------
  let drawer, drawerList = [], drawerIdx = 0, drawerReturn = null;
  function related(m) {
    const tags = new Set(m.tags || []);
    return state.milestones.filter((x) => x !== m).map((x) => [x, (x.tags || []).filter((g) => tags.has(g)).length + (x.subcategory === m.subcategory ? .5 : 0)])
      .filter(([, n]) => n >= 1).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([x]) => x);
  }
  function openDrawer(m, list) {
    drawerList = list && list.includes(m) ? list : state.milestones;
    drawerIdx = drawerList.indexOf(m);
    if (!drawer) {
      drawer = document.createElement("div"); drawer.className = "drawer";
      document.body.appendChild(drawer);
      drawer.addEventListener("click", (e) => {
        if (e.target.closest("[data-close]")) return closeDrawer();
        const nav = e.target.closest("[data-nav]"); if (nav) return showDrawer(drawerIdx + +nav.dataset.nav);
        const rel = e.target.closest("[data-rel]"); if (rel) { const x = state.milestones.find((y) => y.id === rel.dataset.rel); if (x) { drawerList = state.milestones; showDrawer(state.milestones.indexOf(x)); } }
        if (e.target.closest("a[href^='#/']")) closeDrawer();
      });
      document.addEventListener("keydown", (e) => {
        if (!drawer.classList.contains("open")) return;
        if (e.key === "Escape") closeDrawer();
        if (e.key === "ArrowLeft") showDrawer(drawerIdx - 1);
        if (e.key === "ArrowRight") showDrawer(drawerIdx + 1);
      });
    }
    if (!drawer.classList.contains("open")) drawerReturn = document.activeElement;
    showDrawer(drawerIdx);
    requestAnimationFrame(() => { drawer.classList.add("open"); drawer.querySelector(".drawer-panel").focus(); });
    document.body.classList.add("no-scroll");
  }
  function showDrawer(i) {
    if (i < 0 || i >= drawerList.length) return;
    drawerIdx = i; const m = drawerList[i];
    drawer.innerHTML = `<div class="drawer-scrim" data-close></div>
      <aside class="drawer-panel" role="dialog" aria-modal="true" aria-label="${esc(L(m, "title"))}" tabindex="-1" style="${sectorStyle(m.sector)}">
        <div class="drawer-bar">
          <button class="tool-btn" data-nav="-1" ${i === 0 ? "disabled" : ""}>← ${t("dr.prev")}</button>
          <span class="drawer-pos">${t("dr.of", { a: i + 1, b: drawerList.length })}</span>
          <button class="tool-btn" data-nav="1" ${i === drawerList.length - 1 ? "disabled" : ""}>${t("dr.next")} →</button>
          <button class="tool-btn drawer-x" data-close aria-label="${esc(t("dr.close"))}">✕</button>
        </div>
        <div class="drawer-body">
          <div class="drawer-band"></div>
          ${milestoneCard(m).replace("<details>", "<details open>")}
          ${(() => { const r = related(m); return r.length ? `<div class="drawer-rel"><div class="kicker">${t("dr.related")}</div>${r.map((x) => `<button data-rel="${esc(x.id)}" style="${sectorStyle(x.sector)}"><span class="sq"></span><span><time>${esc(fmtDate(x.date, x.date_precision))}</time>${esc(L(x, "title"))}</span></button>`).join("")}</div>` : ""; })()}
          <a class="more" href="#/sector/${esc(m.sector)}">${t("dr.sector")}: ${esc(sec(m.sector, "short"))} →</a>
        </div>
      </aside>`;
    if (drawer.classList.contains("open")) drawer.querySelector(".drawer-panel").focus();
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove("open"); document.body.classList.remove("no-scroll");
    drawerReturn?.focus?.();
  }

  // ---------- search palette (/, Ctrl/Cmd+K) ----------
  let pal;
  function openSearch() {
    if (!pal) {
      pal = document.createElement("div"); pal.className = "palette"; document.body.appendChild(pal);
      pal.addEventListener("click", (e) => { if (e.target === pal) closeSearch(); });
    }
    pal.innerHTML = `<div class="pal-box" role="dialog" aria-modal="true" aria-label="${esc(t("q.btn"))}">
      <div class="pal-in"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      <input type="search" placeholder="${esc(t("q.ph"))}" aria-label="${esc(t("q.btn"))}" autocomplete="off"><kbd>Esc</kbd></div>
      <div class="pal-res" role="listbox"></div><div class="pal-hint">${t("q.hint")}</div></div>`;
    pal.classList.add("open"); document.body.classList.add("no-scroll");
    const input = pal.querySelector("input"), res = pal.querySelector(".pal-res");
    let items = [], sel = 0;
    const hay = (o, fields) => fields.map((f) => [o[f], o[f + "_so"]].join(" ")).join(" ").toLowerCase() + " " + (o.tags || []).join(" ").toLowerCase();
    function run() {
      const q = input.value.trim().toLowerCase();
      const words = q.split(/\s+/).filter(Boolean);
      const match = (s) => words.every((w) => s.includes(w));
      const msR = words.length ? state.milestones.filter((m) => match(hay(m, ["title", "summary", "context", "subcategory"]))).sort((a, b) => (+match(L(b, "title").toLowerCase()) - +match(L(a, "title").toLowerCase())) || b.date.localeCompare(a.date)).slice(0, 7) : state.milestones.slice(0, 5);
      const fcR = words.length ? state.factchecks.filter((f) => match(hay(f, ["claim", "finding"]))).slice(0, 3) : [];
      const inR = words.length ? state.indicators.filter((i) => match(hay(i, ["name", "description"]))).slice(0, 3) : [];
      items = [...msR.map((m) => ({ k: "m", o: m })), ...fcR.map((f) => ({ k: "f", o: f })), ...inR.map((i) => ({ k: "i", o: i }))];
      sel = 0;
      const group = (k, label) => { const g = items.filter((x) => x.k === k); return g.length ? `<div class="pal-g">${label}</div>${g.map((x) => { const n = items.indexOf(x), o = x.o;
        const title = k === "m" ? L(o, "title") : k === "f" ? L(o, "claim") : L(o, "name");
        const meta = k === "m" ? `${fmtDate(o.date, o.date_precision)} · ${sec(o.sector, "short")}` : k === "f" ? t("v." + o.verdict) : (o.unit || "");
        return `<button class="pal-item" role="option" data-n="${n}" style="${sectorStyle(o.sector || "economy")}"><span class="sq"></span><span class="pal-t">${esc(title)}</span><span class="pal-m">${esc(meta)}</span></button>`; }).join("")}` : ""; };
      res.innerHTML = items.length ? group("m", t("q.ms")) + group("f", t("q.fc")) + group("i", t("q.ind")) : `<div class="pal-none">${t("q.none")}</div>`;
      mark();
    }
    function mark() { res.querySelectorAll(".pal-item").forEach((b) => { const on = +b.dataset.n === sel; b.classList.toggle("on", on); b.setAttribute("aria-selected", on); if (on) b.scrollIntoView({ block: "nearest" }); }); }
    function go(n) {
      const x = items[n]; if (!x) return; closeSearch();
      if (x.k === "m") openDrawer(x.o, items.filter((y) => y.k === "m").map((y) => y.o));
      if (x.k === "f") { pendingScroll = x.o.id; location.hash === "#/factcheck" ? route(true) : (location.hash = "#/factcheck"); }
      if (x.k === "i") { pendingInd = x.o.id; location.hash === "#/data" ? route() : (location.hash = "#/data"); }
    }
    input.addEventListener("input", debounce(run, 80));
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(items.length - 1, sel + 1); mark(); }
      if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(0, sel - 1); mark(); }
      if (e.key === "Enter") { e.preventDefault(); go(sel); }
      if (e.key === "Escape") closeSearch();
    });
    res.addEventListener("click", (e) => { const b = e.target.closest(".pal-item"); if (b) go(+b.dataset.n); });
    run(); input.focus(); setTimeout(() => input.focus(), 30);
  }
  function closeSearch() { pal?.classList.remove("open"); document.body.classList.remove("no-scroll"); }
  let pendingScroll = null, pendingInd = null;
  document.addEventListener("keydown", (e) => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName);
    if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) { e.preventDefault(); openSearch(); }
  });

  // ---------- views ----------
  function viewHome() {
    const ms = state.milestones;
    const verified = ms.filter((m) => m.verification === "verified").length;
    const countBy = (s) => ms.filter((m) => m.sector === s).length;
    const days = Math.floor((Date.now() - new Date(TERM_START)) / 864e5);
    const stat = (num, lbl, sub) => `<div class="hstat"><b data-count="${num}" data-plain>0</b><span class="lbl">${lbl}</span><span class="sub">${sub}</span></div>`;
    const more = (href, key) => `<a class="more" href="${href}">${t(key)}</a>`;
    const fcPick = state.factchecks.find((f) => !picks[f.id]) || state.factchecks[0];
    return `<section class="hero-live">
      <div class="wrap">
        <div class="hero-top">
          <div><div class="kicker">${t("home.eyebrow")}</div><h1>${t("home.h1")}</h1></div>
          <div class="hero-side"><p class="lead">${t("home.lead")}</p>
            <div class="cta"><button class="btn btn-flag" id="heroSearch"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>${t("q.btn")} <kbd>/</kbd></button>${more("#/timeline", "home.cta.timeline")}${more("#/factcheck", "home.cta.fc")}</div></div>
        </div>
        <div class="hero-stats reveal">
          ${stat(ms.length, t("home.stat.ms"), t("home.stat.ms.sub", { p: ms.length ? Math.round(verified / ms.length * 100) : 0 }))}
          ${stat(state.factchecks.length, t("home.stat.fc"), t("home.stat.fc.sub", { n: state.factchecks.filter((f) => ["false", "misleading"].includes(f.verdict)).length }))}
          ${stat(state.indicators.length, t("home.stat.ind"), t("home.stat.ind.sub"))}
          ${stat(days, t("home.stat.days"), t("home.stat.days.sub"))}
        </div>
        <div class="pulse-head"><h2>${t("viz.pulse.h")}</h2><p>${t("viz.pulse.sub")}</p></div>
        <div class="viz-pulse" data-viz="pulse"></div>
      </div>
    </section>
    <div class="wrap">
      ${wireHome()}
      ${termBand(ms)}

      <section class="block reveal">
        <div class="section-head"><div><h2>${t("viz.where.h")}</h2><p>${t("viz.where.sub")}</p></div></div>
        <div class="viz-where" data-viz="where"></div>
      </section>

      ${state.indicators.length ? `<section class="block reveal">
        <div class="section-head"><div><h2>${t("viz.xp.h")}</h2><p>${t("viz.xp.sub")}</p></div>${more("#/data", "home.key.all")}</div>
        <div class="viz-xp" data-viz="explorer"></div>
      </section>` : ""}

      ${fcPick ? `<section class="block reveal game-block">
        <div class="section-head"><div><h2>${t("game.h")}</h2><p>${t("home.fc.sub")}</p></div><div class="game-meta"><span class="game-score">${gameScore()}</span>${more("#/factcheck", "home.fc.all")}</div></div>
        <div class="fc-grid" id="homeGame">${factcheckCard(fcPick, true)}</div>
        <button class="pbtn game-next" data-next>${t("game.next")} →</button>
      </section>` : ""}

      <section class="block reveal">
        <div class="section-head"><div><h2>${t("home.sectors")}</h2><p>${t("home.sectors.sub")}</p></div></div>
        <ol class="sector-index">${SECTOR_KEYS.map((k, i) => {
          const last = ms.find((m) => m.sector === k);
          return `<li><a style="${sectorStyle(k)}" href="#/sector/${k}">
            <span class="no">0${i + 1}</span>
            <span class="name"><span class="sq"></span>${sec(k)}</span>
            <span class="desc">${sec(k, "desc")}</span>
            <span class="count"><span data-count="${countBy(k)}" data-plain>0</span><small>${t("home.milestones")}</small></span>
            <span class="latest">${last ? `<b>${t("home.latestIn")} ${esc(fmtDate(last.date, last.date_precision))}</b>${esc(L(last, "title"))}` : ""}</span></a></li>`;
        }).join("")}</ol>
      </section>

      <section class="block">
        <div class="section-head"><div><h2>${t("home.latest")}</h2><p>${t("home.latest.sub")}</p></div>${more("#/timeline", "home.latest.all")}</div>
        ${ms.length ? `<div class="tl-list">${ms.slice(0, 4).map(milestoneCard).join("")}</div>` : `<div class="empty">${t("home.latest.none")}</div>`}
      </section>
    </div>`;
  }

  // The mandate band: May 2022 → May 2027, with the disputed extension hatched and every milestone as a tick.
  function termBand(ms) {
    const T0 = Date.parse(TERM_START), T1 = Date.parse("2026-05-15"), T2 = Date.parse("2027-05-15");
    const pct = (d) => Math.max(0, Math.min(100, ((typeof d === "number" ? d : Date.parse(d)) - T0) / (T2 - T0) * 100));
    const now = pct(Date.now());
    const ticks = ms.filter((m) => Date.parse(m.date) >= T0).map((m) =>
      `<i style="${sectorStyle(m.sector)};left:${pct(m.date).toFixed(2)}%" title="${esc(fmtDate(m.date, m.date_precision) + " · " + L(m, "title"))}"></i>`).join("");
    const years = [2023, 2024, 2025, 2026, 2027].map((y) => `<span style="left:${pct(`${y}-01-01`).toFixed(2)}%">${y}</span>`).join("");
    return `<section class="term">
      <div class="term-head"><h2>${t("term.h")}</h2><p>${t("term.sub")}</p></div>
      <div class="band">
        <div class="rug">${ticks}</div>
        <div class="bar-track"><div class="bar-term" style="width:${pct(T1).toFixed(2)}%"></div><div class="bar-ext" style="flex:1"></div></div>
        <div class="today ${now > 80 ? "flip" : ""}" style="left:${now.toFixed(2)}%"><span>${t("term.today")} · ${esc(fmtDate(new Date().toISOString().slice(0, 10)))}</span></div>
      </div>
      <div class="band-axis">${years}</div>
      <div class="band-legend">
        <span><i class="bar-term"></i>${t("term.term")}</span>
        <span><i class="bar-ext"></i>${t("term.ext")}</span>
        <span class="muted">${t("term.rug")}</span>
      </div>
    </section>`;
  }

  function filterUI({ withSector = true, subcats = [] } = {}) {
    const years = [...new Set(state.milestones.map((m) => m.date.slice(0, 4)))].sort();
    return `<div class="filters" role="search">
      <input type="search" id="fq" placeholder="${esc(t("f.search"))}" aria-label="${esc(t("f.search.aria"))}">
      ${withSector ? `<div class="chips" id="fsec">${SECTOR_KEYS.map((k) => `<button class="chip" style="${sectorStyle(k)}" data-v="${k}" aria-pressed="false"><span class="dot"></span>${sec(k, "short")}</button>`).join("")}</div>` : ""}
      <select id="fyear" aria-label="${esc(t("f.year"))}"><option value="">${t("f.allYears")}</option>${years.map((y) => `<option>${y}</option>`).join("")}</select>
      ${subcats.length ? `<select id="fsub" aria-label="${esc(t("f.cat"))}"><option value="">${t("f.allCats")}</option>${subcats.map(([en, label]) => `<option value="${esc(en)}">${esc(label)}</option>`).join("")}</select>` : ""}
      <select id="fver" aria-label="${esc(t("f.ver"))}"><option value="">${t("f.anyVer")}</option><option value="verified">${t("f.verOnly")}</option></select>
      <span class="result-count" id="fcount"></span>
    </div>`;
  }
  function bindFilters(base, out) {
    const q = document.getElementById("fq"), yr = document.getElementById("fyear"), ver = document.getElementById("fver"),
          sub = document.getElementById("fsub"), secBox = document.getElementById("fsec"), count = document.getElementById("fcount");
    const active = new Set();
    if (secBox) secBox.querySelectorAll(".chip").forEach((c) => {
      c.addEventListener("click", () => { active.has(c.dataset.v) ? active.delete(c.dataset.v) : active.add(c.dataset.v); c.setAttribute("aria-pressed", active.has(c.dataset.v)); run(); });
    });
    function run() {
      const term = q.value.trim().toLowerCase();
      const list = base.filter((m) =>
        (!active.size || active.has(m.sector)) &&
        (!yr.value || m.date.startsWith(yr.value)) &&
        (!ver.value || m.verification === ver.value) &&
        (!sub || !sub.value || m.subcategory === sub.value) &&
        (!term || [m.title, m.summary, m.impact, m.context, m.subcategory, m.title_so, m.summary_so, m.impact_so, m.context_so, m.subcategory_so, ...(m.tags || [])].join(" ").toLowerCase().includes(term)));
      out.innerHTML = timelineHTML(list);
      count.textContent = t("f.count", { a: list.length, b: base.length });
    }
    q.addEventListener("input", debounce(run));
    [yr, ver, sub].forEach((el) => el && el.addEventListener("change", run));
    run();
  }

  const viewTimeline = () => `<div class="wrap"><div class="page-head"><h1>${t("tl.h1")}</h1><p>${t("tl.lead")}</p></div>
    <div class="viz-pulse viz-pulse-page" data-viz="pulse"></div>${filterUI()}<div id="tlOut"></div></div>`;

  function viewSector(key) {
    if (!SECTOR_KEYS.includes(key)) return viewNotFound();
    const list = state.milestones.filter((m) => m.sector === key);
    const subMap = new Map();
    list.forEach((m) => m.subcategory && !subMap.has(m.subcategory) && subMap.set(m.subcategory, L(m, "subcategory")));
    const subcats = [...subMap.entries()].sort((a, b) => a[1].localeCompare(b[1]));
    const inds = state.indicators.filter((i) => i.sector === key);
    const fcs = state.factchecks.filter((f) => f.sector === key);
    const counts = subcats.map(([en, label]) => [label, list.filter((m) => m.subcategory === en).length]).sort((a, b) => b[1] - a[1]);
    return `<div class="wrap" style="${sectorStyle(key)}">
      <div class="page-head sector-head"><div class="kicker"><span class="sq"></span>${t("sector.tag")} 0${SECTOR_KEYS.indexOf(key) + 1} / 05</div>
        <h1>${sec(key)}</h1><p>${sec(key, "desc")} ${t("sector.count", { n: list.length })}</p>
        ${counts.length ? `<div class="tally">${counts.map(([c, n]) => `<span>${esc(c)}<b>${n}</b></span>`).join("")}</div>` : ""}
      </div>
      ${inds.length ? `<section class="block reveal" style="padding-top:8px"><div class="section-head"><h2>${t("sector.ind")}</h2></div><div class="viz-xp" data-viz="explorer" data-sector="${key}"></div></section>` : ""}
      <section class="block"><div class="section-head"><h2>${t("sector.ms")}</h2></div>
        ${filterUI({ withSector: false, subcats })}<div id="tlOut"></div></section>
      ${fcs.length ? `<section class="block"><div class="section-head"><h2>${t("sector.fc")}</h2></div><div class="fc-grid">${fcs.map((f) => factcheckCard(f, gameOn)).join("")}</div></section>` : ""}
    </div>`;
  }

  function viewData() {
    const groups = SECTOR_KEYS.map((k) => [k, state.indicators.filter((i) => (i.sector || "economy") === k)]).filter(([, l]) => l.length);
    const start = pendingInd; pendingInd = null;
    return `<div class="wrap"><div class="page-head"><h1>${t("data.h1")}</h1><p>${t("data.lead")}</p></div>
      ${state.indicators.length ? `<section class="block"><div class="viz-xp" data-viz="explorer" ${start ? `data-start="${esc(start)}"` : ""}></div></section>` : ""}
      ${groups.length ? groups.map(([k, l]) => `<section class="block reveal" style="padding-top:12px"><div class="section-head"><h2>${sec(k)}</h2></div><div class="ind-grid">${l.map(indicatorCard).join("")}</div></section>`).join("") : `<div class="empty">${t("data.none")}</div>`}
    </div>`;
  }

  function viewFactcheck() {
    const counts = Object.keys(VERDICT_ICONS).map((v) => [v, state.factchecks.filter((f) => f.verdict === v).length]).filter(([, n]) => n);
    return `<div class="wrap"><div class="page-head"><h1>${t("fc.h1")}</h1><p>${t("fc.lead")}</p>
      <div class="game-bar"><div class="seg" role="group"><button data-game="on" aria-pressed="${gameOn}">${t("game.mode")}</button><button data-game="off" aria-pressed="${!gameOn}">${t("game.all")}</button></div>
        <span class="game-score" ${gameOn ? "" : "hidden"}>${gameScore()}</span><button class="linkbtn" data-game="reset" ${gameOn ? "" : "hidden"}>${t("game.reset")}</button></div>
      <div class="chips" id="vchips"><button class="chip" data-v="" aria-pressed="true">${t("fc.all")} <b>${state.factchecks.length}</b></button>${counts.map(([v, n]) => `<button class="chip v-${v}" style="--sc: var(--vc)" data-v="${v}" aria-pressed="false"><span class="dot"></span>${t("v." + v)} <b>${n}</b></button>`).join("")}</div></div>
      <div class="fc-grid" id="fcOut">${state.factchecks.map((f) => factcheckCard(f, gameOn)).join("") || `<div class="empty">${t("fc.none")}</div>`}</div>
      <div class="callout" style="margin-top:28px">${t("fc.tip")}</div></div>`;
  }
  function bindFactcheck() {
    const box = document.getElementById("vchips"); if (!box) return;
    box.querySelectorAll(".chip").forEach((c) => c.addEventListener("click", () => {
      box.querySelectorAll(".chip").forEach((x) => x.setAttribute("aria-pressed", x === c));
      const v = c.dataset.v;
      document.getElementById("fcOut").innerHTML = state.factchecks.filter((f) => !v || f.verdict === v).map((f) => factcheckCard(f, gameOn)).join("");
    }));
    document.querySelectorAll("[data-game]").forEach((b) => b.addEventListener("click", () => {
      if (b.dataset.game === "reset") { picks = {}; savePicks(); }
      else { gameOn = b.dataset.game === "on"; try { localStorage.setItem("fcGame", gameOn ? "on" : "off"); } catch (e) {} }
      route(true);
    }));
  }

  function viewSources() {
    const order = ["government", "international", "media", "ngo", "factcheck"];
    const rank = (x) => { const i = order.indexOf(x); return i < 0 ? 99 : i; };
    const types = [...new Set(state.sources.map((s) => s.type || "media"))].sort((a, b) => rank(a) - rank(b));
    const langName = (c) => ({ so: t("lang.so"), en: t("lang.en"), ar: t("lang.ar") }[c] || c);
    return `<div class="wrap"><div class="page-head"><h1>${t("src.h1")}</h1><p>${t("src.lead")}</p></div>
      ${types.map((ty) => `<section class="block" style="padding-top:12px"><div class="section-head"><h2>${esc(t("src.g." + ty))}</h2></div>
        <div class="src-grid">${state.sources.filter((s) => (s.type || "media") === ty).map((s) => `<div class="card src-card">
          <h3>${esc(s.name)}</h3><a class="url" href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener">${esc((s.url || "").replace(/^https?:\/\//, "").replace(/\/$/, ""))}</a>
          ${s.language ? `<div class="muted small">${t("src.lang")} ${esc([].concat(s.language).map(langName).join(", "))}</div>` : ""}
          ${s.description ? `<p>${esc(L(s, "description"))}</p>` : ""}${s.reliability_notes ? `<div class="rel"><b>${t("src.note")}</b> ${esc(L(s, "reliability_notes"))}</div>` : ""}</div>`).join("")}</div></section>`).join("") || `<div class="empty">${t("src.none")}</div>`}
    </div>`;
  }

  const viewAbout = () => `<div class="wrap prose">${t("about.html")}
      ${state.errors.length ? `<p class="muted small">${t("about.loadErr")} ${state.errors.map(esc).join(", ")}</p>` : ""}</div>`;
  const viewNotFound = () => `<div class="wrap page-head"><h1>${t("nf.h1")}</h1><p><a href="#/">${t("nf.back")}</a></p></div>`;

  // ---------- chrome (static header/footer text) ----------
  function applyChrome() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
    let note = document.getElementById("langNote");
    if (lang === "so" && t("lang.note")) {
      if (!note) { note = document.createElement("div"); note.id = "langNote"; note.className = "lang-note"; document.querySelector(".navbar").after(note); }
      note.innerHTML = `<div class="wrap">${esc(t("lang.note"))}</div>`;
    } else if (note) note.remove();
    const latest = state.milestones[0]?.date;
    document.getElementById("mastLatest").textContent = latest ? t("mast.latest", { date: fmtDate(latest) }) : "";
    document.getElementById("footMeta").textContent =
      t("foot.meta", { ms: state.milestones.length, fc: state.factchecks.length, src: state.sources.length }) + (latest ? t("foot.latest", { date: fmtDate(latest) }) : "");
  }

  // ---------- live wire ----------
  // data/wire.json is refreshed by scripts/fetch_wire.js (local server every 15 min, or a host's scheduled job).
  // The page re-reads it every minute, so new headlines appear without a reload.
  const WIRE_POLL = 60e3;
  let wire = { items: [], feeds: [], updated: null }, wireFilter = { sector: "", lang: "", source: "" }, wireSeen = null, wireFresh = 0;
  try { wireSeen = localStorage.getItem("wireSeen"); } catch (e) {}
  async function loadWire() {
    try { const r = await fetch("data/wire.json?ts=" + Date.now(), { cache: "no-store" }); if (!r.ok) return null; const d = await r.json(); return d && Array.isArray(d.items) ? d : null; } catch (e) { return null; }
  }
  const feedOf = (id) => wire.feeds.find((f) => f.id === id) || { name: id };
  function ago(iso) {
    const s = Math.max(0, (Date.now() - Date.parse(iso)) / 1000);
    if (!iso || isNaN(s)) return "";
    if (s < 90) return t("wire.justnow");
    if (s < 3600) return t("wire.ago.m", { n: Math.round(s / 60) });
    if (s < 86400) return t("wire.ago.h", { n: Math.round(s / 3600) });
    return t("wire.ago.d", { n: Math.round(s / 86400) });
  }
  // One row per story; other outlets carrying the same story are listed under it.
  function wireStories(items) {
    const heads = [], by = {};
    items.forEach((i) => { const k = i.story || i.id; if (by[k]) by[k].also.push(i); else { by[k] = { ...i, also: [] }; heads.push(by[k]); } });
    return heads;
  }
  const localDay = (iso) => { const d = new Date(iso); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  function wireItem(s, compact) {
    const f = feedOf(s.source), fresh = wireSeen && s.seen > wireSeen;
    const seenSrc = new Set([s.source]), also = s.also.filter((a) => !seenSrc.has(a.source) && seenSrc.add(a.source));
    const flag = (k) => `<span class="wi-flag">${t(k)}</span>`;
    return `<li class="wi${fresh ? " fresh" : ""}" style="${sectorStyle(s.sector)}">
      <div class="wi-meta"><time datetime="${esc(s.date)}" title="${esc(new Date(s.date).toLocaleString())}">${ago(s.date)}</time><span class="wi-src">${esc(f.name)}</span>${f.type === "official" ? flag("wire.official") : ""}${s.opinion ? flag("wire.opinion") : ""}${s.lang === "so" ? flag("wire.so") : ""}<span class="tag"><span class="dot"></span>${esc(sec(s.sector, "short"))}</span></div>
      <a class="wi-title" href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener">${esc(s.title)}<span class="wi-ext" aria-hidden="true">↗</span></a>
      ${!compact && s.summary ? `<p>${esc(s.summary)}</p>` : ""}
      ${also.length ? `<div class="wi-also">${t("wire.also")} ${also.map((a) => `<a href="${esc(safeUrl(a.url))}" target="_blank" rel="noopener">${esc(feedOf(a.source).name)}</a>`).join(", ")}</div>` : ""}
    </li>`;
  }
  function wireHome() {
    if (!wire.items.length) return "";
    const st = wireStories(wire.items).slice(0, 6);
    return `<section class="block wire-home" id="wireHome">
      <div class="section-head"><div><h2 class="wire-h"><span class="live-dot" aria-hidden="true"></span>${t("wire.h")}</h2><p>${t("wire.sub")}</p></div>
        <div class="wire-meta"><span class="wire-upd" data-ago="${esc(wire.updated)}">${t("wire.updated", { t: ago(wire.updated) })}</span><a class="more" href="#/wire">${t("wire.more")}</a></div></div>
      <ol class="wire-list compact">${st.map((s) => wireItem(s, true)).join("")}</ol>
      <p class="wire-note">${t("wire.note")}</p></section>`;
  }
  const wireFiltered = () => wire.items.filter((i) => (!wireFilter.sector || i.sector === wireFilter.sector) && (!wireFilter.lang || i.lang === wireFilter.lang) && (!wireFilter.source || i.source === wireFilter.source));
  function wireListHTML() {
    const st = wireStories(wireFiltered());
    if (!st.length) return `<div class="empty">${t("wire.empty")}</div>`;
    const now = new Date(), tdy = localDay(now), yst = localDay(new Date(now - 864e5)), groups = {};
    st.forEach((s) => (groups[localDay(s.date)] ||= []).push(s));
    return Object.keys(groups).sort().reverse().map((d) => `<div class="wire-day"><h3>${d === tdy ? t("wire.today") : d === yst ? t("wire.yesterday") : esc(fmtDate(d))} <span>${groups[d].length}</span></h3>
      <ol class="wire-list">${groups[d].map((s) => wireItem(s)).join("")}</ol></div>`).join("");
  }
  function viewWire() {
    const cnt = (k) => wire.items.filter((i) => i.sector === k).length;
    const srcs = wire.feeds.filter((f) => wire.items.some((i) => i.source === f.id));
    const down = wire.feeds.filter((f) => f.ok === false);
    return `<div class="wrap"><div class="page-head"><div class="kicker wire-kicker"><span class="live-dot" aria-hidden="true"></span>${t("wire.live")}</div><h1>${t("wire.h")}</h1><p>${t("wire.lead")}</p></div>
      <div class="callout wire-callout">${t("wire.note")}</div>
      ${wire.items.length ? `<section class="block wire-chart-block"><div class="wire-chart-head"><b>${t("wire.perday")}</b><span class="muted">${t("wire.perday.sub")}</span></div><div class="wire-chart" id="wireChart"></div></section>` : ""}
      <div class="filters" id="wireFilters">
        <div class="chips"><button class="chip" data-ws="" aria-pressed="${!wireFilter.sector}">${t("wire.all")} <b>${wire.items.length}</b></button>${SECTOR_KEYS.map((k) => `<button class="chip" style="${sectorStyle(k)}" data-ws="${k}" aria-pressed="${wireFilter.sector === k}"><span class="dot"></span>${esc(sec(k, "short"))} <b>${cnt(k)}</b></button>`).join("")}</div>
        <select id="wireLang" aria-label="${esc(t("wire.lang"))}"><option value="">${t("wire.lang.all")}</option><option value="en" ${wireFilter.lang === "en" ? "selected" : ""}>English</option><option value="so" ${wireFilter.lang === "so" ? "selected" : ""}>Soomaali</option></select>
        <select id="wireSrc" aria-label="${esc(t("wire.source"))}"><option value="">${t("wire.source.all")}</option>${srcs.map((f) => `<option value="${esc(f.id)}" ${wireFilter.source === f.id ? "selected" : ""}>${esc(f.name)}</option>`).join("")}</select>
        <span class="wire-upd" data-ago="${esc(wire.updated)}">${wire.updated ? t("wire.updated", { t: ago(wire.updated) }) : ""}</span>
      </div>
      <button class="wire-newbar" id="wireNewBar" hidden></button>
      <div id="wireOut">${wire.items.length ? wireListHTML() : `<div class="empty">${t("wire.none")}</div>`}</div>
      <details class="wire-feeds"><summary>${t("wire.feeds", { n: wire.feeds.length - down.length, m: wire.feeds.length })}</summary>
        <ul>${wire.feeds.map((f) => `<li><span class="fdot ${f.ok === false ? "down" : "up"}"></span><a href="${esc(safeUrl(f.url))}" target="_blank" rel="noopener">${esc(f.name)}</a> <span class="muted">${f.ok === false ? t("wire.down") : t("wire.feedn", { n: f.count ?? 0 })}</span></li>`).join("")}</ul>
        <p class="muted">${t("wire.feeds.note")}</p></details>
    </div>`;
  }
  // Stacked bars: headlines per day over the last three weeks, by sector.
  function wireChart() {
    const el = document.getElementById("wireChart"); if (!el || !window.d3) return;
    const d3 = window.d3, days = [], end = new Date(); end.setHours(0, 0, 0, 0);
    for (let i = 20; i >= 0; i--) days.push(localDay(new Date(end - i * 864e5)));
    const rows = days.map((d) => { const r = { d }; SECTOR_KEYS.forEach((k) => r[k] = 0); return r; });
    const idx = Object.fromEntries(days.map((d, i) => [d, i]));
    wireStories(wire.items).forEach((s) => { const i = idx[localDay(s.date)]; if (i != null) rows[i][s.sector]++; });
    const W = el.clientWidth || 600, H = 130, m = { l: 26, r: 4, t: 8, b: 20 };
    const x = d3.scaleBand().domain(days).range([m.l, W - m.r]).padding(.18);
    const stack = d3.stack().keys(SECTOR_KEYS)(rows), max = d3.max(rows, (r) => SECTOR_KEYS.reduce((a, k) => a + r[k], 0)) || 1;
    const y = d3.scaleLinear().domain([0, max]).nice(3).range([H - m.b, m.t]);
    const svg = d3.select(el).html("").append("svg").attr("viewBox", `0 0 ${W} ${H}`).attr("width", W).attr("height", H).attr("role", "img").attr("aria-label", t("wire.perday"));
    svg.append("g").attr("class", "wc-grid").selectAll("line").data(y.ticks(3)).join("line").attr("x1", m.l).attr("x2", W - m.r).attr("y1", y).attr("y2", y);
    svg.append("g").attr("class", "wc-axis").selectAll("text").data(y.ticks(3)).join("text").attr("x", m.l - 6).attr("y", (v) => y(v) + 3).attr("text-anchor", "end").text((v) => v);
    svg.append("g").selectAll("g").data(stack).join("g").attr("fill", (s) => `var(--c-${s.key})`)
      .selectAll("rect").data((s) => s.map((v) => ({ v, k: s.key }))).join("rect")
      .attr("x", (p) => x(p.v.data.d)).attr("width", x.bandwidth()).attr("y", (p) => y(p.v[1])).attr("height", (p) => Math.max(0, y(p.v[0]) - y(p.v[1]) - (p.v[1] > p.v[0] ? 1.5 : 0)))
      .append("title").text((p) => `${fmtDate(p.v.data.d)} · ${sec(p.k, "short")}: ${p.v.data[p.k]}`);
    const lbl = days.filter((d, i) => i % 5 === 0 || i === days.length - 1);
    svg.append("g").attr("class", "wc-axis").selectAll("text").data(lbl).join("text").attr("x", (d) => x(d) + x.bandwidth() / 2).attr("y", H - 5).attr("text-anchor", "middle").text((d) => d === days[days.length - 1] ? t("wire.today") : fmtDate(d).replace(/ \d{4}$/, ""));
    // Clicking a day's bar column shows that day.
    svg.append("g").selectAll("rect").data(days).join("rect").attr("class", "wc-hit").attr("x", (d) => x(d) - x.step() * x.padding() / 2).attr("width", x.step()).attr("y", m.t).attr("height", H - m.t - m.b)
      .on("click", (e, d) => document.querySelector(`.wire-day h3[data-day="${d}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }
  function bindWire() {
    const box = document.getElementById("wireFilters"); if (!box) return;
    const redraw = () => { document.getElementById("wireOut").innerHTML = wireListHTML(); markDays(); };
    box.querySelectorAll("[data-ws]").forEach((c) => c.addEventListener("click", () => {
      wireFilter.sector = c.dataset.ws; box.querySelectorAll("[data-ws]").forEach((x) => x.setAttribute("aria-pressed", x === c)); redraw();
    }));
    document.getElementById("wireLang").addEventListener("change", (e) => { wireFilter.lang = e.target.value; redraw(); });
    document.getElementById("wireSrc").addEventListener("change", (e) => { wireFilter.source = e.target.value; redraw(); });
    document.getElementById("wireNewBar").addEventListener("click", (e) => { e.currentTarget.hidden = true; wireFresh = 0; route(true); });
    markDays(); wireChart(); markWireSeen();
  }
  function markDays() { document.querySelectorAll(".wire-day").forEach((g) => { const d = g.querySelector("time")?.getAttribute("datetime"); if (d) g.querySelector("h3").dataset.day = localDay(d); }); }
  // Items arriving after the reader's last visit are highlighted once; leaving the page marks them read.
  function markWireSeen() {
    const newest = wire.items.reduce((a, i) => (i.seen > a ? i.seen : a), "");
    setTimeout(() => { if (curPage() === "wire" && newest) { wireSeen = newest; try { localStorage.setItem("wireSeen", newest); } catch (e) {} updateWireBadge(); } }, 4000);
  }
  function updateWireBadge() {
    const b = document.getElementById("wireBadge"); if (!b) return;
    const n = wireSeen ? wireStories(wire.items.filter((i) => i.seen > wireSeen)).length : 0;
    b.textContent = n > 99 ? "99+" : n; b.hidden = !n;
  }
  const curPage = () => (location.hash.replace(/^#\/?/, "") || "").split(/[/?]/)[0];
  async function pollWire(first) {
    const d = await loadWire(); if (!d) return;
    const known = new Set(wire.items.map((i) => i.id));
    const fresh = first ? 0 : d.items.filter((i) => !known.has(i.id)).length;
    if (!first && d.updated === wire.updated) return refreshAgo();
    wire = d;
    updateWireBadge();
    const p = curPage();
    if (first) { if (p === "wire" || p === "") route(true); return; }
    if (p === "wire" && fresh) {
      wireFresh += fresh;
      const bar = document.getElementById("wireNewBar");
      if (bar) { bar.textContent = t(wireFresh === 1 ? "wire.new1" : "wire.new", { n: wireFresh }); bar.hidden = false; }
    } else if (p === "" && document.getElementById("wireHome")) {
      document.getElementById("wireHome").outerHTML = wireHome();
    }
    refreshAgo();
  }
  function refreshAgo() { document.querySelectorAll("[data-ago]").forEach((el) => { el.textContent = t("wire.updated", { t: ago(el.dataset.ago) }); }); }

  // ---------- editor review (local server only) ----------
  // scripts/serve.js exposes /api/status and /api/review. On a static host these do not exist, so the page stays hidden.
  let reviewOn = false, pending = [], gitState = null;
  async function loadReview() {
    if (!/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) return;
    try {
      const s = await fetch("/api/status", { cache: "no-store" }); if (!s.ok) return;
      const st = await s.json(); reviewOn = !!st.review; gitState = st.git || null;
      const r = await fetch("data/pending.json?ts=" + Date.now(), { cache: "no-store" }); pending = r.ok ? await r.json() : [];
    } catch (e) { reviewOn = false; }
    const a = document.getElementById("reviewLink");
    if (a) { a.hidden = !reviewOn; const b = a.querySelector("b"); b.textContent = pending.length; b.hidden = !pending.length; }
  }
  function draftCard(d) {
    const e = d.entry || {};
    let body;
    if (d.kind === "milestone") body = milestoneCard({ ...e, id: "draft-" + d.id });
    else if (d.kind === "factcheck") body = factcheckCard({ ...e, id: "draft-" + d.id }, false);
    else body = `<div class="callout"><b>${esc(t("rv.update"))}</b> <code>${esc(d.target)}</code><p>${esc(d.append_context || "")}</p>${sourceList(d.add_sources)}</div>`;
    const refs = (d.wire_refs || []).map((id) => wire.items.find((i) => i.id === id)).filter(Boolean);
    return `<article class="draft" data-id="${esc(d.id)}">
      <div class="draft-head"><span class="wi-flag">${esc(t("rv.kind." + d.kind))}</span><span class="muted">${t("rv.drafted", { d: esc(d.drafted || "") })}</span></div>
      ${body}
      ${d.editor_note ? `<div class="draft-note"><b>${t("rv.note")}</b> ${esc(d.editor_note)}</div>` : ""}
      ${refs.length ? `<div class="wi-also">${t("rv.wire")} ${refs.map((i) => `<a href="${esc(safeUrl(i.url))}" target="_blank" rel="noopener">${esc(feedOf(i.source).name)}</a>`).join(", ")}</div>` : ""}
      <div class="draft-actions"><input type="text" placeholder="${esc(t("rv.reason"))}" aria-label="${esc(t("rv.reason"))}"><button class="btn btn-flag" data-rv="approve">${t("rv.approve")}</button><button class="pbtn" data-rv="reject">${t("rv.reject")}</button></div>
      <div class="draft-msg" role="status"></div>
    </article>`;
  }
  function viewReview() {
    if (!reviewOn) return `<div class="wrap"><div class="page-head"><h1>${t("rv.h")}</h1><p>${t("rv.off")}</p></div></div>`;
    const pub = gitState?.remote ? `<div class="pub-bar"><span>${gitState.unpublished ? t("rv.unpub", { n: gitState.unpublished }) : t("rv.uptodate")}</span>${gitState.unpublished ? `<button class="pbtn" id="pubBtn">${t("rv.publish")}</button>` : ""}<span class="draft-msg" id="pubMsg" role="status"></span></div>` : "";
    return `<div class="wrap"><div class="page-head"><h1>${t("rv.h")}</h1><p>${t("rv.lead")}</p></div>${pub}
      <div id="rvOut">${pending.length ? pending.map(draftCard).join("") : `<div class="empty">${t("rv.none")}</div>`}</div></div>`;
  }
  function bindReview() {
    document.getElementById("pubBtn")?.addEventListener("click", async (e) => {
      const b = e.currentTarget, m = document.getElementById("pubMsg"); b.disabled = true; m.textContent = t("rv.working");
      try { const r = await fetch("/api/publish", { method: "POST" }); const j = await r.json(); if (!r.ok) throw new Error(j.error || r.status); m.textContent = t("rv.pubok"); await loadReview(); }
      catch (err) { m.textContent = t("rv.error", { e: err.message }); b.disabled = false; }
    });
    document.querySelectorAll(".draft [data-rv]").forEach((b) => b.addEventListener("click", async () => {
      const card = b.closest(".draft"), msg = card.querySelector(".draft-msg"), action = b.dataset.rv;
      card.querySelectorAll("button").forEach((x) => x.disabled = true); msg.textContent = t("rv.working");
      try {
        const r = await fetch("/api/review", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: card.dataset.id, action, note: card.querySelector("input").value }) });
        const j = await r.json(); if (!r.ok) throw new Error(j.error || r.status);
        msg.textContent = action === "approve" ? t("rv.approved", { v: j.validation?.summary || "" }) + " " + (j.published ? t(j.published.ok ? "rv.pubok" : "rv.pubfail") : gitState?.remote ? t("rv.pubheld") : "") : t("rv.rejected");
        card.classList.add("done", action);
        if (action === "approve") { await loadAll(); applyChrome(); }
        await loadReview();
      } catch (e) { msg.textContent = t("rv.error", { e: e.message }); card.querySelectorAll("button").forEach((x) => x.disabled = false); }
    }));
  }

  // ---------- router ----------
  function route(keepScroll) {
    const path = (location.hash.replace(/^#\/?/, "") || "").split("?")[0];
    const [p0, p1] = path.split("/");
    let html, after = () => {};
    switch (p0) {
      case "": html = viewHome(); break;
      case "timeline": html = viewTimeline(); after = () => bindFilters(state.milestones, document.getElementById("tlOut")); break;
      case "sector": html = viewSector(p1); after = () => SECTOR_KEYS.includes(p1) && bindFilters(state.milestones.filter((m) => m.sector === p1), document.getElementById("tlOut")); break;
      case "data": html = viewData(); break;
      case "factcheck": html = viewFactcheck(); after = bindFactcheck; break;
      case "sources": html = viewSources(); break;
      case "about": html = viewAbout(); break;
      case "wire": html = viewWire(); after = bindWire; break;
      case "review": html = viewReview(); after = bindReview; break;
      default: html = viewNotFound();
    }
    closeDrawer();
    app.innerHTML = html;
    after();
    bindCharts(app);
    applyChrome();
    initViz();
    observeReveal(app);
    document.getElementById("heroSearch")?.addEventListener("click", openSearch);
    if (pendingScroll) { const el = document.getElementById(pendingScroll); pendingScroll = null; if (el) { setTimeout(() => { el.scrollIntoView({ block: "center" }); el.classList.add("flash"); }, 50); keepScroll = true; } }
    document.querySelectorAll("nav.main a").forEach((a) => a.classList.toggle("active", a.dataset.route === (p1 ? `${p0}/${p1}` : p0 || "home")));
    document.getElementById("nav").classList.remove("open");
    if (keepScroll !== true) window.scrollTo(0, 0);
    const title = p0 === "sector" ? (SECTOR_KEYS.includes(p1) ? sec(p1, "short") : "") : t("title." + (p0 || "home"));
    document.title = `${title && !title.startsWith("title.") ? title + " · " : ""}${t("brand")}`;
  }

  bindGame(app);
  document.getElementById("searchBtn").addEventListener("click", openSearch);
  // Clicking a milestone headline opens it in the drawer, with the visible list for prev/next.
  app.addEventListener("click", (e) => {
    const h = e.target.closest(".ms h3"); if (!h) return;
    const card = h.closest(".ms"), box = card.closest("#tlOut") || card.parentElement;
    const list = [...box.querySelectorAll(".ms")].map((n) => state.milestones.find((m) => m.id === n.id)).filter(Boolean);
    const m = state.milestones.find((x) => x.id === card.id);
    if (m) openDrawer(m, list.length > 1 ? list : state.milestones);
  });
  document.getElementById("menuBtn").addEventListener("click", (e) => {
    const n = document.getElementById("nav"); n.classList.toggle("open");
    e.currentTarget.setAttribute("aria-expanded", n.classList.contains("open"));
  });
  document.getElementById("langBtn").addEventListener("click", () => {
    lang = lang === "so" ? "en" : "so";
    try { localStorage.setItem("lang", lang); } catch (e) {}
    try {
      const u = new URL(location.href);
      lang === "so" ? u.searchParams.set("lang", "so") : u.searchParams.delete("lang");
      history.replaceState(null, "", u);
    } catch (e) {}
    route(true);
  });
  try { const th = localStorage.getItem("theme"); if (th) document.documentElement.dataset.theme = th; } catch (e) {}
  document.getElementById("themeBtn").addEventListener("click", () => {
    const cur = document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = cur === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  applyChrome();
  window.addEventListener("hashchange", route);
  loadAll().then(route).then(() => { pollWire(true); loadReview().then(() => curPage() === "review" && route(true)); });
  setInterval(() => { if (!document.hidden) pollWire(false); }, WIRE_POLL);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) pollWire(false); });
})();
