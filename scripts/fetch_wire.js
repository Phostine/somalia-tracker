#!/usr/bin/env node
/* Live wire fetcher: pulls headlines from trusted outlets' RSS feeds into data/wire.json.
   No dependencies. Run by hand (`node scripts/fetch_wire.js`), by the local server every 15 minutes,
   or by a scheduled job on a host. It copies only headlines, a short excerpt and the link back to the
   outlet: wire items are unverified and never become tracker entries without an editor's approval. */
"use strict";
const fs = require("fs"), path = require("path");

const OUT = path.join(__dirname, "..", "data", "wire.json");
const KEEP_DAYS = 21, MAX_ITEMS = 500, EXCERPT = 280;

// focus: "somalia" keeps every item; "filter" keeps only items that mention Somalia.
const FEEDS = [
  { id: "villasomalia", name: "Villa Somalia", url: "https://villasomalia.gov.so/feed/", type: "official", lang: "en", focus: "somalia" },
  { id: "hiiraan", name: "Hiiraan Online", url: "https://www.hiiraan.com/news.xml", type: "media", lang: "en", focus: "somalia" },
  { id: "somaliguardian", name: "Somali Guardian", url: "https://www.somaliguardian.com/feed/", type: "media", lang: "en", focus: "somalia" },
  { id: "dawan", name: "Dawan Africa", url: "https://www.dawan.africa/rss.xml", type: "media", lang: "en", focus: "filter" },
  { id: "wardheer", name: "WardheerNews", url: "https://wardheernews.com/feed/", type: "media", lang: "en", focus: "filter" },
  { id: "bbcsomali", name: "BBC Somali", url: "https://feeds.bbci.co.uk/somali/rss.xml", type: "media", lang: "so", focus: "filter" },
  { id: "bbcafrica", name: "BBC News Africa", url: "https://feeds.bbci.co.uk/news/world/africa/rss.xml", type: "media", lang: "en", focus: "filter" },
  { id: "aljazeera", name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", type: "media", lang: "en", focus: "filter" },
  { id: "africanews", name: "Africanews", url: "https://www.africanews.com/feed/rss", type: "media", lang: "en", focus: "filter" },
  { id: "eastleigh", name: "Eastleigh Voice", url: "https://eastleighvoice.co.ke/feed", type: "media", lang: "en", focus: "filter" },
  { id: "unnews", name: "UN News", url: "https://news.un.org/feed/subscribe/en/news/region/africa/feed/rss.xml", type: "un", lang: "en", focus: "filter" },
  // ReliefWeb (Somalia updates) refuses automated readers (HTTP 406), so it is not fetched; check it by hand.
  { id: "crisisgroup", name: "Crisis Group", url: "https://www.crisisgroup.org/rss.xml", type: "research", lang: "en", focus: "filter" }
];

const OPINION = /\/(op\d*|opinion|opinions|op-ed|analysis|commentary|blog)\/|\bopinion:/i;
const SOMALIA = /somali|soomaali|mogadish|muqdisho|al-?shabaab|puntland|jubaland|somaliland|hirshabelle|galmudug|baidoa|kismayo|garowe|hargeisa|aussom|amisom|hassan sheikh/i;

// First matching sector wins; order matters (security before politics, etc.).
const SECTORS = [
  ["security", /al-?shabaab|shabaab|air ?strikes?|\bstrikes?\b|attack|bomb|explosion|militant|troops|\barmy\b|soldier|danab|aussom|amisom|africom|\bnisa\b|\bisis\b|pira(cy|tes?)|killed|clash|offensive|ciidam|weerar|qarax|dagaal|askar/i],
  ["social", /flood|drought|famine|hunger|\bipc\b|humanitarian|cholera|measles|health|school|education|displac|\bidps?\b|refugee|women|girls|children|unicef|ocha|\bwfp\b|aid workers|fatahaad|abaar|gaajo|caafimaad|waxbarasho|barakac/i],
  ["diplomacy", /ambassador|embassy|\buae\b|emirat|ethiopia|kenya|egypt|turk|qatar|saudi|united states|washington|china|\beu\b|european union|security council|\bigad\b|african union|diplomat|envoy|summit|bilateral|treaty|recogni|safiir|dibadda|xiriirka/i],
  ["economy", /budget|revenue|\bimf\b|world bank|\bdebt\b|econom|\btax|\btrade\b|\bports?\b|investment|\boil\b|\bgas\b|\bbank|currency|shilling|inflation|remittance|export|livestock|telecom|dhaqaale|miisaaniyad|canshuur|ganacsi|deyn/i],
  ["politics", /election|vote|parliament|president|prime minister|cabinet|minister|opposition|constitution|court|federal|dialogue|talks|mandate|doorasho|baarlamaan|madaxweyne|mucaarad|dastuur|maxkamad/i]
];

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…", rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”", ndash: "–", mdash: "—" };
function decode(s) {
  return String(s || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e) => e[0] === "#" ? String.fromCodePoint(parseInt(e.slice(e[1].toLowerCase() === "x" ? 2 : 1), e[1].toLowerCase() === "x" ? 16 : 10)) : (ENT[e.toLowerCase()] ?? m));
}
const strip = (s) => decode(decode(s).replace(/<[^>]+>/g, " ")).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
function tag(block, name) {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  return m ? m[1] : "";
}
function parse(xml) {
  const items = [];
  const re = /<(item|entry)[\s>][\s\S]*?<\/\1>/gi;
  let m;
  while ((m = re.exec(xml))) {
    const b = m[0];
    let link = strip(tag(b, "link"));
    if (!link) { const h = b.match(/<link[^>]*href="([^"]+)"/i); link = h ? h[1] : ""; }
    if (!/^https?:\/\//.test(link)) { const g = strip(tag(b, "guid")); if (/^https?:\/\//.test(g)) link = g; }
    const when = strip(tag(b, "pubDate") || tag(b, "dc:date") || tag(b, "published") || tag(b, "updated"));
    items.push({ title: strip(tag(b, "title")), link, date: when, summary: strip(tag(b, "description") || tag(b, "summary") || tag(b, "content")) });
  }
  return items;
}
const norm = (u) => u.replace(/^http:/, "https:").replace(/[?#].*$/, "").replace(/\/$/, "");
const words = (s) => new Set(s.toLowerCase().replace(/[^a-z0-9À-ɏ ]/g, " ").split(/\s+/).filter((w) => w.length > 3));
function similar(a, b) {
  const A = words(a), B = words(b); if (!A.size || !B.size) return 0;
  let n = 0; A.forEach((w) => B.has(w) && n++);
  return n / Math.min(A.size, B.size);
}
function sectorOf(text) { for (const [k, re] of SECTORS) if (re.test(text)) return k; return "politics"; }
const idOf = (s) => require("crypto").createHash("sha1").update(s).digest("hex").slice(0, 12);

async function fetchFeed(f) {
  const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), 20000);
  try {
    const r = await fetch(f.url, { signal: ctl.signal, redirect: "follow", headers: { "User-Agent": "Mozilla/5.0 (compatible; SomaliaTrackerWire/1.0)", Accept: "application/rss+xml, application/xml, text/xml, */*" } });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return parse(await r.text());
  } finally { clearTimeout(tm); }
}

async function run({ quiet = false } = {}) {
  let prev = { items: [] };
  try { prev = JSON.parse(fs.readFileSync(OUT, "utf8")); } catch (e) {}
  const byUrl = new Map((prev.items || []).map((i) => [norm(i.url), i]));
  const now = Date.now(), cutoff = now - KEEP_DAYS * 864e5;
  const report = [];
  let added = 0;

  const results = await Promise.allSettled(FEEDS.map(fetchFeed));
  results.forEach((res, i) => {
    const f = FEEDS[i];
    if (res.status !== "fulfilled") { report.push({ id: f.id, name: f.name, ok: false, error: String(res.reason?.message || res.reason) }); return; }
    let kept = 0;
    for (const it of res.value) {
      if (!it.title || it.title.split(/\s+/).length < 4 || !/^https?:\/\//.test(it.link)) continue;
      const text = `${it.title} ${it.summary}`;
      if (f.focus === "filter" && !SOMALIA.test(text)) continue;
      const t = Date.parse(it.date);
      const iso = isNaN(t) ? new Date(now).toISOString() : new Date(Math.min(t, now)).toISOString();
      if (Date.parse(iso) < cutoff) continue;
      kept++;
      const key = norm(it.link);
      if (byUrl.has(key)) continue;
      const summary = it.summary.length > EXCERPT ? it.summary.slice(0, EXCERPT).replace(/\s+\S*$/, "") + "…" : it.summary;
      byUrl.set(key, { id: idOf(key), title: it.title, url: it.link, source: f.id, date: iso, summary, sector: sectorOf(text), lang: f.lang, ...(OPINION.test(it.link + " " + it.title) ? { opinion: true } : {}), seen: new Date(now).toISOString() });
      added++;
    }
    report.push({ id: f.id, name: f.name, ok: true, count: kept });
  });

  let items = [...byUrl.values()].filter((i) => Date.parse(i.date) >= cutoff).sort((a, b) => b.date.localeCompare(a.date)).slice(0, MAX_ITEMS);

  // Cluster the same story told by different outlets within 48 hours, so readers see corroboration.
  items.forEach((i) => { delete i.story; });
  items.forEach((a, ai) => {
    if (a.story) return;
    a.story = a.id;
    for (let bi = ai + 1; bi < items.length; bi++) {
      const b = items[bi];
      if (b.story || b.source === a.source || b.lang !== a.lang) continue;
      if (Math.abs(Date.parse(a.date) - Date.parse(b.date)) > 48 * 3600e3) continue;
      if (similar(a.title, b.title) >= 0.5) b.story = a.id;
    }
  });

  const out = {
    updated: new Date(now).toISOString(),
    note: "Unverified headlines from the outlets listed. Each item links to the original report. Not part of the reviewed tracker.",
    feeds: FEEDS.map(({ id, name, url, type, lang }) => ({ id, name, url, type, lang, ...(report.find((r) => r.id === id) || {}) })),
    items
  };
  fs.writeFileSync(OUT + ".tmp", JSON.stringify(out, null, 1));
  fs.renameSync(OUT + ".tmp", OUT);
  if (!quiet) {
    console.log(`wire: ${items.length} items (${added} new) from ${report.filter((r) => r.ok).length}/${FEEDS.length} feeds`);
    report.filter((r) => !r.ok).forEach((r) => console.log(`  ! ${r.name}: ${r.error}`));
  }
  return { added, total: items.length };
}

module.exports = { run, FEEDS };
if (require.main === module) run().catch((e) => { console.error(e); process.exit(1); });
