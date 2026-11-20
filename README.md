# Somalia Progress Tracker

A public, source-cited record of Somalia's development since May 2022, covering politics, the economy, security, peace and diplomacy, and social development. It also includes a fact-check desk that tests viral claims against official figures and independent evidence.

## How it is built

The platform is a static website with **no build step and no database**, so it is cheap to host and easy to maintain.

```
index.html            page shell and navigation
assets/styles.css     design, including light and dark mode
assets/app.js         rendering, filters, charts
assets/i18n.js        interface text in English and Somali
i18n/TRANSLATION-GUIDE.md   Somali style guide and glossary
data/                 ALL CONTENT LIVES HERE
  politics.json  economy.json  security.json  diplomacy.json  social.json   (milestones)
  indicators.json     yearly figures (charts)
  factchecks.json     fact-check desk
  sources.json        source directory
  SCHEMA.md           field-by-field format
scripts/validate.py   checks the data before you publish
```

## Run it locally

```bash
node scripts/serve.js        # or: python3 -m http.server 8427
```

Then open http://localhost:8427. Opening `index.html` directly from disk will not load the data, because browsers block local `fetch`.

## Add or update content

1. Open the right file in `data/` and copy an existing entry.
2. Edit the fields as described in `data/SCHEMA.md`. Every entry needs at least one source URL.
3. Run the validator:
   ```bash
   python3 scripts/validate.py
   ```
   ```bash
   python3 scripts/validate.py --links
   ```
   The second command also checks that every source link still loads.
4. Publish (see below).

### Editorial rules

- **Verified** means an official primary source (a law, decree, IMF, World Bank or UN document), or two or more independent outlets. Otherwise mark the entry **reported**.
- Use the `context` field for disputes or setbacks. Showing them openly is what makes the achievements credible.
- Fact-check verdicts follow the evidence. Always record both `official_position` and `independent_evidence`.

## Live wire and editor review
- **Live wire** (`#/wire`): headlines about Somalia from trusted outlets' RSS feeds, refreshed every 15 minutes by `scripts/fetch_wire.js` and re-read by open pages every minute. They are labelled unverified and never feed the timeline or charts.
- **Drafts**: a scheduled task (`somalia-tracker-live-drafts`, every 6 hours) researches significant wire stories and writes draft entries to `data/pending.json`.
- **Review** (`#/review`, only with `node scripts/serve.js`): approve or reject each draft. Approved drafts go into the data files and are logged in `updates/review-log.md`.
- Full rules: the second half of `UPDATE-PROCEDURE.md`. Hosting: `.github/workflows/wire.yml` is ready for GitHub Pages and never publishes `data/pending.json`.

## Monthly updates

A scheduled task runs on the 1st of every month at 8:00. It follows `UPDATE-PROCEDURE.md`:
- researches new milestones, indicator data and fact-checks since the last update;
- translates new entries into Somali;
- checks every link, then records the changes in `CHANGELOG.md`;
- writes an editor report to `updates/YYYY-MM.md`.

It changes local files only. **Review the report before you publish.** New entries carry an `"added"` date so they are easy to find.

## Languages (English and Somali)

Visitors switch languages with the **Af-Soomaali / English** button in the header. Their choice is remembered, and you can link straight to the Somali version with `?lang=so`.

- **Interface text** (menus, buttons, labels, the Method page) is in `assets/i18n.js`.
- **Content** is translated with `_so` fields next to the English ones, for example `title_so`. If a Somali field is missing, the site shows the English text with an "Ingiriisi kaliya" (English only) label.
- The current Somali content is **machine-assisted** (`"translation_so": "machine"`). It shows a "Turjumaad mashiin" label until a Somali-speaking editor reviews the entry and changes it to `"reviewed"`.
- `python3 scripts/validate.py` reports how many entries are translated and reviewed.

## Publishing

The public site is **https://phostine.github.io/somalia-tracker/**, hosted on GitHub Pages from the repository `Phostine/somalia-tracker`.
- **Live wire:** `.github/workflows/wire.yml` refreshes the headlines and redeploys every 15 minutes, even when this computer is off. GitHub may delay scheduled runs by a few minutes, and pauses them if the repository has no activity for 60 days.
- **Tracker changes:** start the local server (`node scripts/serve.js`) and open `http://localhost:8427/#/review`. Approving a draft adds it, runs the checker and, if the checker passes, pushes to GitHub, and the site updates about a minute later. For other local edits (for example after the monthly update), the Review page shows a **Publish now** button.
- **Never uploaded:** `data/pending.json`, `updates/` (editor reports and the review log) and `.claude/` (see `.gitignore`).

## Suggested next steps

- Native-speaker review of the Somali translations.
- A public tip and corrections form connected to an editor inbox.
