/* Interface strings. English (en) and Somali (so).
   Content translations live in data/*.json as `<field>_so`. See i18n/TRANSLATION-GUIDE.md.
   {name} placeholders are filled in by t(key, {name: value}). */
window.I18N = {
  en: {
    "brand": "Somalia Progress Tracker",
    "brand.sub": "2022 – present · source-cited",
    "mast.latest": "Latest entry {date}", "mast.edition": "Public record · English edition",
    "home.record": "The record so far", "home.latestIn": "Latest:", "home.read": "Read the record",
    "term.h": "The mandate in time",
    "term.sub": "The four-year term under the 2012 provisional constitution, and the one-year extension Parliament voted in March 2026, which the opposition and several federal member states dispute.",
    "term.term": "Four-year term · May 2022 – May 2026", "term.ext": "Extension voted March 2026 · disputed", "term.today": "Today",
    "term.rug": "Each tick is one documented milestone, coloured by sector.",
    "viz.click": "Click to read the entry", "viz.sectors": "Sectors", "viz.play": "Play the record", "viz.stop": "Stop", "viz.reset": "Show all years",
    "viz.pulse.aria": "{n} milestones plotted by date in five sector lanes", "viz.brush": "Drag across the strip to zoom into a period",
    "viz.termEnd": "Original term ends · 15 May 2026", "viz.count": "{n} milestones so far",
    "viz.pulse.h": "The record, live", "viz.pulse.sub": "Every milestone since May 2022 is a dot. Filled dots are verified, open dots are single-source reports. Hover to preview, click to read, filter by sector, or press play.",
    "viz.tab.map": "Where it happened", "viz.tab.net": "Who Somalia dealt with",
    "viz.where.h": "Places and partners", "viz.where.sub": "Places and partners named in the record. Pick a bubble or a row to see the entries behind it.",
    "viz.where.note": "Counts come from places and partners named in each entry's text, so one entry can count for several. Somaliland is shown within Somalia's internationally recognised borders.",
    "viz.entriesN": "{n} entries", "viz.mostly": "mostly {s}", "viz.map.rank": "Most-mentioned places", "viz.map.rankSub": "Ranked by entries",
    "viz.net.rank": "Most-mentioned partners", "viz.net.rankSub": "Countries and institutions", "viz.net.c": "Countries", "viz.net.i": "Institutions",
    "viz.xp.h": "The numbers behind the story", "viz.xp.sub": "Pick an indicator. Diamonds mark related milestones; hover or click them to see what was happening.",
    "viz.latest": "latest actual · {y}", "viz.events": "{n} related milestones",
    "dr.close": "Close", "dr.prev": "Newer", "dr.next": "Older", "dr.of": "{a} of {b}", "dr.sector": "Open sector", "dr.related": "Related entries",
    "q.btn": "Search", "q.ph": "Search the record: places, people, institutions…", "q.ms": "Milestones", "q.fc": "Fact-checks", "q.ind": "Indicators", "q.none": "Nothing found.", "q.hint": "↑↓ to move · Enter to open · Esc to close",
    "game.h": "Make your call", "game.sub": "Read the claim and decide before you see the evidence.", "game.reveal": "Show the verdict", "game.you": "You said {v}.", "game.right": "Spot on.", "game.close": "Close, but the evidence says otherwise.", "game.wrong": "The evidence says otherwise.",
    "game.score": "You've called {a} of {b} · {c} matched the verdict", "game.mode": "Test yourself", "game.all": "Show all verdicts", "game.next": "Try another claim", "game.reset": "Start again",
    "lang.switch": "Af-Soomaali",
    "lang.note": "",
    "footer.text": "Every entry links to its original source. Corrections are welcome: see <a href=\"#/about\">Method &amp; corrections</a>.",
    "foot.meta": "{ms} milestones · {fc} fact-checks · {src} sources",
    "foot.latest": " · latest entry {date}",
    "loading": "Loading…",

    "nav.home": "Overview", "nav.timeline": "Timeline", "nav.politics": "Politics", "nav.economy": "Economy",
    "nav.security": "Security", "nav.diplomacy": "Diplomacy", "nav.social": "Social", "nav.data": "Data",
    "nav.factcheck": "Fact Check", "nav.sources": "Sources", "nav.about": "Method",
    "rv.unpub": "{n} local change(s) not yet on the public site.", "rv.uptodate": "The public site is up to date with this computer.", "rv.publish": "Publish now", "rv.pubok": "Sent to GitHub; the public site updates in about a minute.", "rv.pubfail": "Saved here, but sending to GitHub failed. Use Publish now to retry.", "rv.pubheld": "Not published, because the checker found problems.",
    "nav.wire": "Live wire", "nav.review": "Review", "title.wire": "Live wire", "title.review": "Review", "wire.h": "Live wire", "wire.live": "Live · updates on its own", "wire.sub": "The latest Somalia headlines from news outlets, the UN and the government, as they are published.", "wire.lead": "Headlines about Somalia from trusted outlets, collected automatically every 15 minutes. When several outlets report the same story, they are grouped together.", "wire.note": "These are unverified headlines, linked to the original reports. A story joins the tracker's timeline and charts only after an editor has checked it.", "wire.updated": "Updated {t}", "wire.more": "All headlines →", "wire.all": "All", "wire.empty": "No headlines match these filters.", "wire.none": "The wire has not been fetched yet. Run node scripts/fetch_wire.js, or start the local server.", "wire.also": "Also reported by", "wire.official": "Official", "wire.opinion": "Opinion", "wire.so": "Somali", "wire.today": "Today", "wire.yesterday": "Yesterday", "wire.justnow": "just now", "wire.ago.m": "{n} min ago", "wire.ago.h": "{n} h ago", "wire.ago.d": "{n} d ago", "wire.new": "{n} new headlines · show", "wire.new1": "1 new headline · show", "wire.lang": "Language", "wire.lang.all": "All languages", "wire.source": "Outlet", "wire.source.all": "All outlets", "wire.perday": "Stories per day, last three weeks", "wire.perday.sub": "Coloured by sector. Click a day to jump to it.", "wire.feeds": "Feeds: {n} of {m} working", "wire.down": "not responding", "wire.feedn": "{n} recent items", "wire.feeds.note": "Outlets that only publish on social media or block automated readers are not included. Sectors are assigned automatically from keywords and can be wrong.", "rv.h": "Editor review", "rv.lead": "Entries drafted automatically from the live wire. Nothing here is on the site until you approve it. Approving adds it to the data files and runs the checker.", "rv.off": "Review works only when the site is run with the local server (node scripts/serve.js).", "rv.none": "Nothing waiting for review.", "rv.update": "Update to existing entry", "rv.kind.milestone": "New milestone", "rv.kind.factcheck": "New fact-check", "rv.kind.update": "Update", "rv.drafted": "Drafted {d}", "rv.note": "Note from the drafter:", "rv.wire": "From the wire:", "rv.reason": "Note for the log (optional)", "rv.approve": "Approve and add", "rv.reject": "Reject", "rv.working": "Saving…", "rv.approved": "Added. Checker: {v}", "rv.rejected": "Rejected and logged.", "rv.error": "Could not save: {e}",

    "sec.politics": "Politics & Governance", "sec.politics.short": "Politics", "sec.politics.desc": "Elections, constitution, laws, federalism and institutions.",
    "sec.economy": "Economy & Development", "sec.economy.short": "Economy", "sec.economy.desc": "Debt relief, revenue, trade, banking, resources and infrastructure.",
    "sec.security": "Security", "sec.security.short": "Security", "sec.security.desc": "Counter-terrorism, territory, security-sector reform and partners.",
    "sec.diplomacy": "Peace & Diplomacy", "sec.diplomacy.short": "Diplomacy", "sec.diplomacy.desc": "Regional integration, multilateral seats, bilateral ties and mediation.",
    "sec.social": "Social Development", "sec.social.short": "Social", "sec.social.desc": "Education, health, humanitarian response, IDs and social protection.",

    "v.false": "False", "v.misleading": "Misleading", "v.partly-true": "Partly true", "v.true": "True", "v.unproven": "Unproven",

    "ms.verified": "Verified", "ms.reported": "Reported",
    "ms.verified.tip": "Official primary source or 2+ independent sources", "ms.reported.tip": "Single credible media source",
    "ms.why": "Why it matters:", "ms.context": "Context:", "ms.ctxsrc": "Context & sources", "ms.sources": "Sources",
    "ms.count": "{n} milestones", "ms.count1": "1 milestone",
    "badge.machine": "Machine translation", "badge.machine.tip": "Machine-assisted translation, awaiting review",
    "badge.enonly": "English only", "badge.enonly.tip": "Not yet translated into Somali",
    "src.type.government": "government", "src.type.international": "international", "src.type.media": "media", "src.type.ngo": "research", "src.type.factcheck": "fact-check", "src.type.source": "source",

    "chart.aria": "{name} by year", "chart.proj": "projection", "chart.projLegend": "Projection",
    "chart.source": "Source:", "chart.more": "+{n} more in table", "chart.show": "Show table", "chart.hide": "Hide table",
    "chart.year": "Year", "chart.value": "Value", "chart.src": "Source", "chart.projShort": "(proj.)",

    "home.eyebrow": "Federal Republic of Somalia · May 2022 – present",
    "home.h1": "What has changed in Somalia since 2022, with every claim backed by a source.",
    "home.lead": "A running public record of the political, economic, security, diplomatic and social milestones of the current administration. Each entry links to government records and independent reporting. False claims are tested against the official and independent figures.",
    "home.cta.timeline": "Explore the timeline", "home.cta.fc": "Fact-check desk", "home.cta.data": "Key data",
    "home.stat.ms": "Documented milestones", "home.stat.ms.sub": "{p}% verified by an official primary source or 2+ independent sources",
    "home.stat.fc": "Claims fact-checked", "home.stat.fc.sub": "{n} rated false or misleading",
    "home.stat.ind": "Tracked indicators", "home.stat.ind.sub": "IMF, World Bank, Ministry of Finance, UN",
    "home.stat.days": "Days since 15 May 2022", "home.stat.days.sub": "Presidential election by Parliament",
    "home.sectors": "Five sectors", "home.sectors.sub": "Browse the record by area of government activity.", "home.milestones": "milestones",
    "home.key": "Key numbers", "home.key.sub": "Headline indicators from IMF, World Bank and government data. Hatched bars are projections.", "home.key.all": "All indicators →",
    "home.latest": "Latest milestones", "home.latest.sub": "The most recent additions to the record.", "home.latest.all": "Full timeline →", "home.latest.none": "No milestones loaded yet.",
    "home.fc": "From the fact-check desk", "home.fc.sub": "Viral claims tested against official figures and independent evidence.", "home.fc.all": "All fact-checks →",

    "f.search": "Search milestones, places, institutions…", "f.search.aria": "Search", "f.allYears": "All years", "f.year": "Year",
    "f.allCats": "All categories", "f.cat": "Category", "f.anyVer": "Any verification", "f.verOnly": "Verified only", "f.ver": "Verification",
    "f.count": "{a} of {b} milestones", "f.none": "No milestones match these filters.",

    "tl.h1": "Timeline of milestones",
    "tl.lead": "Everything in the record, newest first. Filter by sector, year or keyword. Open “Sources” on any entry to see the original documents and reporting.",

    "sector.tag": "Sector", "sector.count": "{n} documented milestones since May 2022.",
    "sector.ind": "Indicators", "sector.ms": "Milestones", "sector.fc": "Related fact-checks",

    "data.h1": "Data & indicators",
    "data.lead": "Year-by-year figures from the IMF, World Bank, Ministry of Finance, UN agencies and others. Hover a bar for the value and source, or open the table view. Hatched bars are projections, not results.",
    "data.none": "No indicators loaded yet.",

    "fc.h1": "Fact-check desk",
    "fc.lead": "Claims about Somalia that spread widely, tested against official government figures and independent evidence from the IMF, World Bank, UN and credible media. Verdicts follow the evidence, including when an official claim is overstated.",
    "fc.all": "All", "fc.none": "No fact-checks yet.",
    "fc.where": "Where it circulated", "fc.finding": "What the evidence shows", "fc.official": "Official figures", "fc.indep": "Independent evidence",
    "fc.tip": "<b>Seen a suspicious claim?</b> Send the link or screenshot to the editorial team (see <a href=\"#/about\">Method</a>). We check it against primary documents before publishing a verdict.",

    "src.h1": "Source directory",
    "src.lead": "Where the record comes from. Official sources give the government's position and figures. Independent and international sources are used to corroborate them. The notes describe each source's known perspective.",
    "src.g.government": "Government & official", "src.g.international": "International institutions", "src.g.media": "Independent Somali & international media",
    "src.g.ngo": "Research & civil society", "src.g.factcheck": "Fact-checkers",
    "src.lang": "Language:", "src.note": "Note:", "src.none": "No sources loaded yet.",
    "lang.so": "Somali", "lang.en": "English", "lang.ar": "Arabic",

    "nf.h1": "Page not found", "nf.back": "Back to overview",
    "about.loadErr": "Note: these data files failed to load:",
    "title.home": "Overview", "title.timeline": "Timeline", "title.data": "Data", "title.factcheck": "Fact Check", "title.sources": "Sources", "title.about": "Method",

    "about.html": `<div class="page-head"><h1>Method, standards &amp; corrections</h1>
      <p>A record is only useful if people trust it. These are the rules every entry follows.</p></div>
      <h2>What we record</h2>
      <p>Milestones from the start of the current administration (President Hassan Sheikh Mohamud's election on 15 May 2022) to the present, in five sectors: politics &amp; governance, economy, security, peace &amp; diplomacy, and social development.</p>
      <h2>Verification levels</h2>
      <ul>
        <li><b>Verified:</b> confirmed by an official primary document (a law, a decree, an IMF or UN release), or by two or more independent credible outlets.</li>
        <li><b>Reported:</b> carried by one credible outlet and not yet independently confirmed. It is upgraded when corroborated.</li>
      </ul>
      <h2>Balance and context</h2>
      <p>The platform documents achievements, but it does not hide setbacks or disputes. Where opposition groups, federal member states or independent analysts contest a milestone, the <i>Context</i> note says so. This is what lets the record answer critics: claims are backed by sources, not assertion.</p>
      <h2>Fact-check verdicts</h2>
      <ul>
        <li><b>False:</b> contradicted by the evidence.</li>
        <li><b>Misleading:</b> contains some fact but creates a wrong impression, for example missing context or an old video reused.</li>
        <li><b>Partly true:</b> some elements are accurate and others are not.</li>
        <li><b>True:</b> supported by the evidence.</li>
        <li><b>Unproven:</b> not enough reliable evidence either way.</li>
      </ul>
      <p>Each fact-check sets out both the government's official figures and the independent evidence (IMF, World Bank, UN, credible media). The verdict follows the evidence, including when an official claim is overstated.</p>
      <h2>Languages</h2>
      <p>The platform is published in English and Somali. Somali translations are machine-assisted and marked as such until a native-speaking editor has reviewed them. Where the two versions differ, the English text is authoritative.</p>
      <h2>Corrections</h2>
      <p>If you find an error, send the entry's link and the correcting source to the editorial team. Corrections are made openly. A corrected entry keeps a note of what changed.</p>
      <div class="callout"><b>For editors:</b> content lives in <code>data/*.json</code>. See <code>README.md</code> and <code>data/SCHEMA.md</code> for how to add a milestone, indicator, fact-check or source, and run <code>python3 scripts/validate.py</code> before publishing.</div>`
  },

  so: {
    "brand": "Diiwaanka Horumarka Soomaaliya",
    "brand.sub": "2022 – hadda · ilo la hubo",
    "mast.latest": "Qodobkii ugu dambeeyay {date}", "mast.edition": "Diiwaan dadweyne · daabacaadda Af-Soomaaliga",
    "home.record": "Diiwaanka ilaa hadda", "home.latestIn": "Ugu dambeeyay:", "home.read": "Akhri diiwaanka",
    "term.h": "Muddada xilka iyo waqtiga",
    "term.sub": "Muddada afarta sano ah ee dastuurka ku-meel-gaarka ah ee 2012, iyo kordhinta hal sano ah ee Baarlamaanku codeeyay Maarso 2026, taas oo mucaaradka iyo dhowr dowlad goboleed ay ku muransan yihiin.",
    "term.term": "Muddada afarta sano · May 2022 – May 2026", "term.ext": "Kordhinta la codeeyay Maarso 2026 · lagu muransan yahay", "term.today": "Maanta",
    "term.rug": "Xariiq kastaa waa hal horumar oo la diiwaangeliyay, midabkiisuna waa qaybta uu ka tirsan yahay.",
    "viz.click": "Guji si aad u akhriso", "viz.sectors": "Qaybaha", "viz.play": "Daar diiwaanka", "viz.stop": "Jooji", "viz.reset": "Muuji dhammaan sannadaha",
    "viz.pulse.aria": "{n} horumar oo taariikh ahaan loogu kala dhigay shan qaybood", "viz.brush": "Jiid xariijinta si aad u weyneyso muddo",
    "viz.termEnd": "Dhammaadka muddadii asalka · 15 May 2026", "viz.count": "{n} horumar ilaa hadda",
    "viz.pulse.h": "Diiwaanka oo nool", "viz.pulse.sub": "Horumar kasta tan iyo May 2022 waa dhibic. Dhibcaha buuxa waa la xaqiijiyay, kuwa banaan waa warbixin hal il ah. Dul mar si aad u aragto, guji si aad u akhriso, ku shaandhee qayb, ama daar.",
    "viz.tab.map": "Halka ay ka dhacday", "viz.tab.net": "Cidda Soomaaliya la macaamishay",
    "viz.where.h": "Meelaha iyo saaxiibada", "viz.where.sub": "Meelaha iyo saaxiibada lagu xusay diiwaanka. Dooro goobo ama saf si aad u aragto qodobbada ka dambeeya.",
    "viz.where.note": "Tirooyinku waxay ka yimaadaan meelaha iyo saaxiibada lagu magacaabay qoraalka qodob kasta, sidaas darteed hal qodob wuxuu u tirsami karaa dhowr. Somaliland waxaa lagu muujiyay xuduudaha caalamiga ah ee Soomaaliya.",
    "viz.entriesN": "{n} qodob", "viz.mostly": "inta badan {s}", "viz.map.rank": "Meelaha ugu badan ee la xusay", "viz.map.rankSub": "Lagu kala horreysiiyay qodobbada",
    "viz.net.rank": "Saaxiibada ugu badan ee la xusay", "viz.net.rankSub": "Dalal iyo hay'ado", "viz.net.c": "Dalal", "viz.net.i": "Hay'ado",
    "viz.xp.h": "Tirooyinka ka dambeeya sheekada", "viz.xp.sub": "Dooro tilmaame. Dheemanku waxay calaamadeeyaan horumarro la xiriira; dul mar ama guji si aad u aragto waxa dhacayay.",
    "viz.latest": "xogtii ugu dambeysay · {y}", "viz.events": "{n} horumar oo la xiriira",
    "dr.close": "Xir", "dr.prev": "Ka cusub", "dr.next": "Ka duug ah", "dr.of": "{a} ka mid ah {b}", "dr.sector": "Fur qaybta", "dr.related": "Qodobbo la xiriira",
    "q.btn": "Raadi", "q.ph": "Ka raadi diiwaanka: meelo, dad, hay'ado…", "q.ms": "Horumarrada", "q.fc": "Xaqiijinnada", "q.ind": "Tilmaamayaasha", "q.none": "Waxba lama helin.", "q.hint": "↑↓ si aad u dhaqaaqdo · Enter si aad u furto · Esc si aad u xirto",
    "game.h": "Go'aankaaga sheeg", "game.sub": "Akhri sheegashada oo go'aanso ka hor intaadan arkin caddeynta.", "game.reveal": "Muuji go'aanka", "game.you": "Waxaad tidhi {v}.", "game.right": "Waa sax.", "game.close": "Waad u dhowdahay, laakiin caddeyntu si kale ayay leedahay.", "game.wrong": "Caddeyntu si kale ayay leedahay.",
    "game.score": "Waxaad go'aamisay {a} ka mid ah {b} · {c} ayaa la mid ahaa go'aanka", "game.mode": "Is tijaabi", "game.all": "Muuji dhammaan go'aannada", "game.next": "Isku day sheegasho kale", "game.reset": "Dib u bilow",
    "lang.switch": "English",
    "lang.note": "Turjumaadda Af-Soomaaliga waxaa lagu diyaariyay caawimaad mashiin, waxayna sugaysaa dib-u-eegis tifaftire. Haddii ay kala duwanaadaan, qoraalka Ingiriisiga ayaa la raacayaa.",
    "footer.text": "Qodob kasta wuxuu ku xiran yahay isha asalka ah. Sixitaannada waa la soo dhaweynayaa: eeg <a href=\"#/about\">Habka &amp; sixitaannada</a>.",
    "foot.meta": "{ms} horumar · {fc} xaqiijin · {src} il",
    "foot.latest": " · qodobkii ugu dambeeyay {date}",
    "loading": "Waa la soo rarayaa…",

    "nav.home": "Guudmar", "nav.timeline": "Taariikhda", "nav.politics": "Siyaasadda", "nav.economy": "Dhaqaalaha",
    "nav.security": "Amniga", "nav.diplomacy": "Diblomaasiyadda", "nav.social": "Bulshada", "nav.data": "Xogta",
    "nav.factcheck": "Xaqiijin", "nav.sources": "Ilaha", "nav.about": "Habka",
    "rv.unpub": "{n} isbeddel maxalli ah oo aan weli ku jirin bogga dadweynaha.", "rv.uptodate": "Bogga dadweynuhu wuu la mid yahay kombiyuutarkan.", "rv.publish": "Hadda daabac", "rv.pubok": "Waxaa loo diray GitHub; bogga dadweynuhu wuxuu cusboonaanayaa qiyaastii daqiiqad kadib.", "rv.pubfail": "Halkan waa lagu kaydiyay, laakiin u dirista GitHub way fashilantay. Isticmaal Hadda daabac si aad mar kale isku daydo.", "rv.pubheld": "Lama daabicin, sababtoo ah hubiyuhu wuxuu helay dhibaatooyin.",
    "nav.wire": "Wararka tooska ah", "nav.review": "Dib-u-eegis", "title.wire": "Wararka tooska ah", "title.review": "Dib-u-eegis", "wire.h": "Wararka tooska ah", "wire.live": "Toos · si iskiis ah ayuu u cusboonaadaa", "wire.sub": "Cinwaannadii ugu dambeeyay ee Soomaaliya ee warbaahinta, QM iyo dowladda, markii la daabaco.", "wire.lead": "Cinwaannada ku saabsan Soomaaliya ee laga soo ururiyo ilo la isku halleyn karo, si toos ah 15-kii daqiiqoba mar. Marka dhowr ilood ay isla sheekada soo tebiyaan, waa la isku geeyaa.", "wire.note": "Kuwani waa cinwaanno aan la xaqiijin, oo ku xiran warbixinnada asalka ah. Sheeko waxay ku biiraysaa taariikhda iyo jaantusyada raad-raaca kaliya marka tifaftire hubiyo.", "wire.updated": "La cusboonaysiiyay {t}", "wire.more": "Dhammaan cinwaannada →", "wire.all": "Dhammaan", "wire.empty": "Ma jiraan cinwaanno la mid ah shaandhooyinkan.", "wire.none": "Wararka weli lama soo qaadin. Ku shaqaysii node scripts/fetch_wire.js, ama bilow server-ka maxalliga ah.", "wire.also": "Waxaa kale oo sheegay", "wire.official": "Rasmi", "wire.opinion": "Aragti", "wire.so": "Soomaali", "wire.today": "Maanta", "wire.yesterday": "Shalay", "wire.justnow": "hadda", "wire.ago.m": "{n} daqiiqo kahor", "wire.ago.h": "{n} saac kahor", "wire.ago.d": "{n} maalmood kahor", "wire.new": "{n} cinwaan oo cusub · muuji", "wire.new1": "1 cinwaan oo cusub · muuji", "wire.lang": "Luqadda", "wire.lang.all": "Dhammaan luqadaha", "wire.source": "Ilaha", "wire.source.all": "Dhammaan ilaha", "wire.perday": "Sheekooyinka maalintii, saddexdii toddobaad ee la soo dhaafay", "wire.perday.sub": "Midabku waa qaybta. Guji maalin si aad ugu boodo.", "wire.feeds": "Ilaha: {n} ka mid ah {m} ayaa shaqaynaya", "wire.down": "ma jawaabayo", "wire.feedn": "{n} qodob oo dhowaan ah", "wire.feeds.note": "Ilaha ku daabaca baraha bulshada oo keliya ama xannibaya akhristayaasha tooska ah laguma darin. Qaybaha si toos ah ayaa loogu qoondeeyaa ereyo-furayaal, wayna khaldami karaan.", "rv.h": "Dib-u-eegista tifaftiraha", "rv.lead": "Qoraallo si toos ah looga diyaariyay wararka tooska ah. Waxba halkan kuma jiraan bogga ilaa aad ansixiso.", "rv.off": "Dib-u-eegistu waxay shaqaysaa kaliya marka bogga lagu socodsiiyo server-ka maxalliga ah (node scripts/serve.js).", "rv.none": "Wax dib-u-eegis sugaya ma jiraan.", "rv.update": "Cusboonaysiin qoraal jira", "rv.kind.milestone": "Horumar cusub", "rv.kind.factcheck": "Xaqiijin cusub", "rv.kind.update": "Cusboonaysiin", "rv.drafted": "La diyaariyay {d}", "rv.note": "Qoraal ka yimid diyaariyaha:", "rv.wire": "Wararka:", "rv.reason": "Qoraal diiwaanka (ikhtiyaari)", "rv.approve": "Ansixi oo ku dar", "rv.reject": "Diid", "rv.working": "Waa la kaydinayaa…", "rv.approved": "Waa lagu daray. Hubiye: {v}", "rv.rejected": "Waa la diiday waana la diiwaangeliyay.", "rv.error": "Lama kaydin karo: {e}",

    "sec.politics": "Siyaasadda & Maamulka", "sec.politics.short": "Siyaasadda", "sec.politics.desc": "Doorashooyinka, dastuurka, sharciyada, federaalka iyo hay'adaha.",
    "sec.economy": "Dhaqaalaha & Horumarinta", "sec.economy.short": "Dhaqaalaha", "sec.economy.desc": "Cafinta deynta, dakhliga, ganacsiga, bangiyada, khayraadka iyo kaabayaasha.",
    "sec.security": "Amniga", "sec.security.short": "Amniga", "sec.security.desc": "La dagaallanka argagixisada, dhulka, dib-u-habaynta amniga iyo saaxiibada caalamiga ah.",
    "sec.diplomacy": "Nabadda & Diblomaasiyadda", "sec.diplomacy.short": "Diblomaasiyadda", "sec.diplomacy.desc": "Is-dhexgalka gobolka, kuraasta caalamiga ah, xiriirka laba dal iyo dhexdhexaadinta.",
    "sec.social": "Horumarinta Bulshada", "sec.social.short": "Bulshada", "sec.social.desc": "Waxbarashada, caafimaadka, gargaarka bini'aadannimo, aqoonsiga iyo badbaadada bulshada.",

    "v.false": "Been", "v.misleading": "Marin-habaabin", "v.partly-true": "Qayb ahaan run", "v.true": "Run", "v.unproven": "Aan la xaqiijin",

    "ms.verified": "La xaqiijiyay", "ms.reported": "La soo wariyay",
    "ms.verified.tip": "Il rasmi ah oo asal ah ama laba il oo madax-bannaan ama ka badan", "ms.reported.tip": "Hal il warbaahineed oo la isku halleyn karo",
    "ms.why": "Muhiimadda:", "ms.context": "Macluumaad dheeraad ah:", "ms.ctxsrc": "Macluumaad dheeraad ah & ilaha", "ms.sources": "Ilaha",
    "ms.count": "{n} horumar", "ms.count1": "1 horumar",
    "badge.machine": "Turjumaad mashiin", "badge.machine.tip": "Turjumaad mashiin lagu caawiyay, sugaysa dib-u-eegis",
    "badge.enonly": "Ingiriisi kaliya", "badge.enonly.tip": "Weli lama turjumin",
    "src.type.government": "dowladda", "src.type.international": "caalami", "src.type.media": "warbaahin", "src.type.ngo": "cilmi-baaris", "src.type.factcheck": "xaqiijin", "src.type.source": "il",

    "chart.aria": "{name} sannad walba", "chart.proj": "saadaal", "chart.projLegend": "Saadaal",
    "chart.source": "Isha:", "chart.more": "+{n} kale shaxda ku jira", "chart.show": "Muuji shaxda", "chart.hide": "Qari shaxda",
    "chart.year": "Sannad", "chart.value": "Qiime", "chart.src": "Isha", "chart.projShort": "(saadaal)",

    "home.eyebrow": "Jamhuuriyadda Federaalka Soomaaliya · May 2022 – hadda",
    "home.h1": "Waxa Soomaaliya ka isbeddelay tan iyo 2022, xog kasta oo la socota il la hubo.",
    "home.lead": "Diiwaan dadweyne oo joogto ah oo ka kooban horumarka siyaasadda, dhaqaalaha, amniga, diblomaasiyadda iyo bulshada ee xukuumadda hadda jirta. Qodob kasta wuxuu ku xiran yahay diiwaannada dowladda iyo warbixinno madax-bannaan. Sheegashooyinka beenta ah waxaa lagu hubiyaa tirooyinka rasmiga ah iyo kuwa madax-bannaan.",
    "home.cta.timeline": "Daawo taariikhda", "home.cta.fc": "Miiska xaqiijinta", "home.cta.data": "Xogta muhiimka ah",
    "home.stat.ms": "Horumarro la diiwaangeliyay", "home.stat.ms.sub": "{p}% waxaa xaqiijiyay il rasmi ah ama laba il oo madax-bannaan",
    "home.stat.fc": "Sheegashooyin la hubiyay", "home.stat.fc.sub": "{n} waxaa lagu qiimeeyay been ama marin-habaabin",
    "home.stat.ind": "Tilmaamayaal la raacayo", "home.stat.ind.sub": "IMF, Bangiga Adduunka, Wasaaradda Maaliyadda, QM",
    "home.stat.days": "Maalmood tan iyo 15 May 2022", "home.stat.days.sub": "Doorashadii Madaxweynaha ee Baarlamaanka",
    "home.sectors": "Shan qaybood", "home.sectors.sub": "Ku baadh diiwaanka qaybaha hawlaha dowladda.", "home.milestones": "horumar",
    "home.key": "Tirooyinka muhiimka ah", "home.key.sub": "Tilmaamayaasha ugu muhiimsan ee IMF, Bangiga Adduunka iyo xogta dowladda. Tiirarka xariiqan waa saadaal.", "home.key.all": "Dhammaan tilmaamayaasha →",
    "home.latest": "Horumarradii ugu dambeeyay", "home.latest.sub": "Waxyaabihii ugu dambeeyay ee lagu daray diiwaanka.", "home.latest.all": "Taariikhda oo dhan →", "home.latest.none": "Weli lama soo rarin horumar.",
    "home.fc": "Miiska xaqiijinta", "home.fc.sub": "Sheegashooyin faafay oo lagu hubiyay tirooyinka rasmiga ah iyo caddeymo madax-bannaan.", "home.fc.all": "Dhammaan xaqiijinnada →",

    "f.search": "Raadi horumar, meelo, hay'ado…", "f.search.aria": "Raadi", "f.allYears": "Dhammaan sannadaha", "f.year": "Sannad",
    "f.allCats": "Dhammaan qaybaha", "f.cat": "Qayb", "f.anyVer": "Xaqiijin kasta", "f.verOnly": "Kaliya kuwa la xaqiijiyay", "f.ver": "Xaqiijin",
    "f.count": "{a} ka mid ah {b} horumar", "f.none": "Ma jiro horumar ku habboon shaandhooyinkan.",

    "tl.h1": "Taariikhda horumarka",
    "tl.lead": "Wax kasta oo diiwaanka ku jira, kuwa ugu cusub marka hore. Ku shaandhee qayb, sannad ama eray. Fur “Ilaha” qodob kasta si aad u aragto dukumentiyada asalka ah iyo warbixinnada.",

    "sector.tag": "Qayb", "sector.count": "{n} horumar oo la diiwaangeliyay tan iyo May 2022.",
    "sector.ind": "Tilmaamayaasha", "sector.ms": "Horumarrada", "sector.fc": "Xaqiijinno la xiriira",

    "data.h1": "Xogta & tilmaamayaasha",
    "data.lead": "Tirooyin sannad walba ah oo ka yimid IMF, Bangiga Adduunka, Wasaaradda Maaliyadda, hay'adaha QM iyo kuwo kale. Dul mar tiir si aad u aragto qiimaha iyo isha, ama fur shaxda. Tiirarka xariiqan waa saadaal, ma aha natiijooyin.",
    "data.none": "Weli lama soo rarin tilmaamayaal.",

    "fc.h1": "Miiska xaqiijinta xaqiiqda",
    "fc.lead": "Sheegashooyin ku saabsan Soomaaliya oo si weyn u faafay, oo lagu hubiyay tirooyinka rasmiga ah ee dowladda iyo caddeymo madax-bannaan oo ka yimid IMF, Bangiga Adduunka, QM iyo warbaahin la isku halleyn karo. Go'aannadu waxay raacaan caddeynta, xitaa marka sheegasho rasmi ah la buunbuuniyo.",
    "fc.all": "Dhammaan", "fc.none": "Weli ma jiraan xaqiijinno.",
    "fc.where": "Halka ay ku faaftay", "fc.finding": "Waxa caddeyntu muujinayso", "fc.official": "Tirooyinka rasmiga ah", "fc.indep": "Caddeyn madax-bannaan",
    "fc.tip": "<b>Ma aragtay sheegasho shaki leh?</b> U dir xiriirka ama sawirka kooxda tifaftirka (eeg <a href=\"#/about\">Habka</a>). Waxaan ku hubinaa dukumentiyada asalka ah ka hor intaynaan go'aan daabicin.",

    "src.h1": "Tusaha ilaha",
    "src.lead": "Halka uu diiwaanku ka yimaado. Ilaha rasmiga ah waxay bixiyaan mowqifka iyo tirooyinka dowladda. Ilaha madax-bannaan iyo kuwa caalamiga ah waxaa loo isticmaalaa in lagu xaqiijiyo. Qoraallada hoose waxay sharxayaan aragtida la og yahay ee il kasta.",
    "src.g.government": "Dowladda & hay'adaha rasmiga ah", "src.g.international": "Hay'adaha caalamiga ah", "src.g.media": "Warbaahinta madax-bannaan ee Soomaaliyeed & caalamiga ah",
    "src.g.ngo": "Cilmi-baarista & bulshada rayidka", "src.g.factcheck": "Xaqiijiyayaasha xaqiiqda",
    "src.lang": "Luqadda:", "src.note": "Fiiro gaar ah:", "src.none": "Weli lama soo rarin ilo.",
    "lang.so": "Af-Soomaali", "lang.en": "Ingiriisi", "lang.ar": "Carabi",

    "nf.h1": "Bogga lama helin", "nf.back": "Ku noqo guudmarka",
    "about.loadErr": "Fiiro gaar ah: faylashan xogta lama soo rarin:",
    "title.home": "Guudmar", "title.timeline": "Taariikhda", "title.data": "Xogta", "title.factcheck": "Xaqiijin", "title.sources": "Ilaha", "title.about": "Habka",

    "about.html": `<div class="page-head"><h1>Habka, heerarka &amp; sixitaannada</h1>
      <p>Diiwaanku wuxuu faa'iido leeyahay oo keliya marka dadku aaminaan. Kuwani waa xeerarka uu raaco qodob kasta.</p></div>
      <h2>Waxa aan diiwaangelinno</h2>
      <p>Horumarrada laga soo bilaabo xilligii ay xukuumadda hadda jirta bilaabatay (doorashadii Madaxweyne Xasan Sheekh Maxamuud ee 15 May 2022) ilaa hadda, shan qaybood: siyaasadda &amp; maamulka, dhaqaalaha, amniga, nabadda &amp; diblomaasiyadda, iyo horumarinta bulshada.</p>
      <h2>Heerarka xaqiijinta</h2>
      <ul>
        <li><b>La xaqiijiyay:</b> waxaa xaqiijiyay dukumenti rasmi ah oo asal ah (sharci, digreeto, war-saxaafadeed IMF ama QM), ama laba warbaahin oo madax-bannaan oo la isku halleyn karo ama ka badan.</li>
        <li><b>La soo wariyay:</b> waxaa daabacay hal warbaahin oo la isku halleyn karo, weli si madax-bannaan looma xaqiijin. Waa la cusboonaysiiyaa marka la xaqiijiyo.</li>
      </ul>
      <h2>Dheelitirka iyo macluumaadka dheeraadka ah</h2>
      <p>Madashu waxay diiwaangelisaa guulaha, laakiin ma qariso dib-u-dhacyada ama khilaafaadka. Marka kooxaha mucaaradka, dowlad goboleedyada ama falanqeeyayaal madax-bannaan ay ku murmaan horumar, qoraalka <i>Macluumaad dheeraad ah</i> ayaa sidaas sheegaya. Taasi waa waxa u suurtagelisa diiwaanka inuu ka jawaabo dhaleeceeyayaasha: sheegashooyinka waxaa taageera ilo, ma aha hadal keliya.</p>
      <h2>Go'aannada xaqiijinta</h2>
      <ul>
        <li><b>Been:</b> caddeyntu way ka hor imanaysaa.</li>
        <li><b>Marin-habaabin:</b> waxay leedahay xoogaa xaqiiqo ah laakiin waxay abuurtaa fikrad khaldan, tusaale ahaan macluumaad maqan ama muuqaal hore oo dib loo isticmaalay.</li>
        <li><b>Qayb ahaan run:</b> qaybo ka mid ah waa sax, qaybo kalena maaha.</li>
        <li><b>Run:</b> caddeyntu way taageertaa.</li>
        <li><b>Aan la xaqiijin:</b> ma jirto caddeyn ku filan oo la isku halleyn karo.</li>
      </ul>
      <p>Xaqiijin kasta waxay soo bandhigtaa tirooyinka rasmiga ah ee dowladda iyo caddeynta madax-bannaan (IMF, Bangiga Adduunka, QM, warbaahin la isku halleyn karo). Go'aanku wuxuu raacaa caddeynta, xitaa marka sheegasho rasmi ah la buunbuuniyo.</p>
      <h2>Luqadaha</h2>
      <p>Madasha waxaa lagu daabacaa Ingiriisi iyo Af-Soomaali. Turjumaadda Af-Soomaaliga waxaa lagu diyaariyay caawimaad mashiin, waxaana lagu calaamadeeyaa sidaas ilaa uu tifaftire af-Soomaaliga ku hadla dib u eego. Haddii labada nooc kala duwanaadaan, qoraalka Ingiriisiga ayaa la raacayaa.</p>
      <h2>Sixitaannada</h2>
      <p>Haddii aad hesho qalad, u dir kooxda tifaftirka xiriirka qodobka iyo isha saxda ah. Sixitaannada si furan ayaa loo sameeyaa, qodobka la saxayna wuxuu hayaa qoraal muujinaya waxa isbeddelay.</p>
      <div class="callout"><b>Tifaftirayaasha:</b> xogtu waxay ku jirtaa <code>data/*.json</code>. Eeg <code>README.md</code>, <code>data/SCHEMA.md</code> iyo <code>i18n/TRANSLATION-GUIDE.md</code>. Ka hor daabacaadda, orod <code>python3 scripts/validate.py</code>.</div>`
  }
};
window.I18N.so.MONTHS = ["Jan", "Feb", "Mar", "Abr", "May", "Jun", "Lul", "Ogo", "Seb", "Okt", "Nof", "Dis"];
window.I18N.so.MONTHS_LONG = ["Janaayo", "Febraayo", "Maarso", "Abriil", "May", "Juun", "Luulyo", "Ogoosto", "Sebtembar", "Oktoobar", "Nofembar", "Diseembar"];
window.I18N.en.MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
window.I18N.en.MONTHS_LONG = window.I18N.en.MONTHS;
