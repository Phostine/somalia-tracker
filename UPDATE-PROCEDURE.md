# Monthly update procedure

The automated monthly update follows this procedure, and an editor can follow it by hand too. Edit this file to change what the update does. The scheduled task reads it fresh on every run.

**Project folder:** `/Users/mwenge/Documents/Somalia-27`
**Start of the period:** the `Coverage through:` date in the newest section of `CHANGELOG.md`. If there is none, use the newest milestone date in the data.

## Golden rules
1. **Never invent anything.** Every new entry needs real source URLs that you actually found and opened, or at least saw in search results. No made-up dates, figures or quotes.
2. **Never delete or rewrite existing English text,** except to fix a factual error. Note every such fix in the changelog with its source.
3. **Balance:** record achievements and also setbacks or disputes. Use `context` for criticism. Fact-check verdicts follow the evidence, even when the evidence goes against an official claim.
4. **Nothing is published automatically.** The update changes local files only. An editor reviews the monthly report before uploading the site.
5. Follow `data/SCHEMA.md` exactly. Mark every new or changed entry with `"added": "<today YYYY-MM-DD>"` so editors can find it.

## Steps
1. **Find the period.** Read `CHANGELOG.md` and find the `Coverage through:` date in the newest section. The period runs from that date to today.
2. **Research new milestones** in all five sectors: politics, economy, security, diplomacy and social. Aim for the 3–10 most significant events per sector in the period, and skip minor ones.
   - Official sources: villasomalia.gov.so, opm.gov.so, mof.gov.so, sonna.so, mfa.gov.so, the Central Bank of Somalia, the electoral commission (NIEC).
   - Independent sources: Reuters, AP, AFP, BBC (including BBC Somali), Al Jazeera, Hiiraan Online, Garowe Online, Somali Guardian, Horn Observer, UN (press.un.org, OCHA), the AU, the IMF, the World Bank, Crisis Group.
   - Before adding, check existing ids and titles so you don't create duplicates.
   - `"verification": "verified"` requires an official primary source or 2+ independent sources. Otherwise use `"reported"`.
3. **Follow up open stories.** Update `context` on existing entries when a story has moved on: court rulings, election dates, offensives, IMF reviews.
4. **Indicators.** Check for new data in `data/indicators.json`:
   - the IMF World Economic Outlook (April and October), IMF programme reviews, and the World Bank Somalia Economic Update;
   - Ministry of Finance budget and revenue reports, OCHA and IPC figures.
   Add new years, replace projections with actual figures once they are published, and give every value its own `source` and `url`.
5. **Fact-checks.** Look for viral or misleading claims about Somalia from the period. Good places to look: AFP Fact Check, PesaCheck, Africa Check, BBC Verify, government rebuttals, and claims spreading on social media. Add 1–5 well-sourced fact-checks to `data/factchecks.json`, with both `official_position` and `independent_evidence`.
6. **Somali translation.** For every new or changed entry, add the `_so` fields as set out in `i18n/TRANSLATION-GUIDE.md`, using its glossary and the terms in `i18n/REVIEW-NOTES.md`. Set `"translation_so": "machine"`. If you change English text that already has a translation, update the `_so` text too and set `translation_so` back to `"machine"`.
7. **Validate.** Run `python3 scripts/validate.py --links`.
   - Fix every ERROR.
   - For dead links (404), find a replacement URL for the same story. If there is none, remove that source. If that leaves a "verified" entry with only one non-official source, downgrade it to "reported".
8. **Changelog.** Add a section at the top of `CHANGELOG.md`, below the title:
   `## <today YYYY-MM-DD>`, then a line `Coverage through: <today YYYY-MM-DD>`, then counts and lists of added and updated milestones, indicators and fact-checks, plus fixed links.
9. **Editor report.** Write `updates/<YYYY-MM>.md` with:
   - a summary of the month;
   - every new entry (id and title);
   - items that need editor judgement: sensitive political claims, conflicting figures, single-source items;
   - the validator output summary;
   - anything you could not verify.

## Scope limits
Web search quotas are limited, so prioritise the most significant events. Leave a note in the report rather than adding weakly sourced entries.

---

# Live wire and drafting between monthly updates

## Live wire (automatic, unreviewed)
- `scripts/fetch_wire.js` reads the outlets' RSS feeds and writes `data/wire.json`: headline, short excerpt, link, outlet, time and a sector guessed from keywords. It keeps 21 days of items.
- The local server (`node scripts/serve.js`) runs it every 15 minutes. On a host, a scheduled job runs `node scripts/fetch_wire.js` (see `.github/workflows/wire.yml`).
- The site re-reads `data/wire.json` every minute and labels it as unverified headlines. Wire items never appear in the timeline, charts, map or counts.
- To add or remove an outlet, edit the `FEEDS` list in `scripts/fetch_wire.js`. Use only outlets that publish an RSS feed and allow automated readers.

## Drafting (automatic) and approval (editor)
A scheduled task runs several times a day:
1. Run `node scripts/fetch_wire.js`, then read `data/wire.json`, `data/pending.json` and the tracker data.
2. Pick the wire stories since the last run that are significant enough for the tracker (same bar as step 2 of the monthly procedure). Skip stories already in the tracker or already in `data/pending.json`.
3. Research each one: open the original reports and look for official or other independent confirmation. Golden rules 1–3 and 5 apply in full.
4. Write each draft into `data/pending.json`. **Never edit the sector files, `factchecks.json` or `indicators.json` directly.** Draft shapes:
   - new milestone: `{"id": "<draft id>", "kind": "milestone", "drafted": "<YYYY-MM-DD HH:MM>", "wire_refs": ["<wire item ids>"], "editor_note": "<what to check>", "entry": { <full milestone per data/SCHEMA.md, with _so fields and "translation_so": "machine"> }}`
   - new fact-check: the same with `"kind": "factcheck"` and a full fact-check as `entry`.
   - follow-up to an existing milestone: `{"id": "...", "kind": "update", "target": "<milestone id>", "append_context": "<English sentence(s)>", "append_context_so": "<Somali>", "add_sources": [ ... ], "drafted": "...", "wire_refs": [...], "editor_note": "..."}`
5. An editor opens `#/review` on the local server and approves or rejects each draft. Approval writes it into the data files with `"added"` set to that day, runs the checker, and logs it in `updates/review-log.md`. Rejection only logs it.
6. The monthly update still runs as above. It reads `updates/review-log.md` to list what was approved during the month.
