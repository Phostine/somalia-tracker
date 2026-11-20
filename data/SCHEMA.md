# Data schema (Somalia Progress Tracker)

Every data file is JSON. Dates are ISO `YYYY-MM-DD` (use `YYYY-MM-01` if only the month is known and set `"date_precision": "month"`).

## Milestone (files: politics.json, economy.json, security.json, diplomacy.json, social.json)
```json
{
  "id": "eco-2023-12-hipc-completion",
  "date": "2023-12-13",
  "date_precision": "day",
  "sector": "economy",
  "subcategory": "Debt relief",
  "title": "Somalia reaches HIPC Completion Point",
  "summary": "2-4 sentences, factual, neutral wording.",
  "impact": "1-2 sentences on why it matters, with numbers where possible.",
  "context": "Optional: caveats, criticism or contested aspects (keeps the platform credible).",
  "tags": ["IMF", "World Bank", "debt"],
  "sources": [
    {"name": "IMF press release", "url": "https://...", "type": "international", "date": "2023-12-13"}
  ],
  "verification": "verified"
}
```
- `sector`: politics | economy | security | diplomacy | social
- source `type`: government | international | media | ngo
- `added` (optional): date the entry was added or last changed by an update, `YYYY-MM-DD`; editors use it to find new items
- `verification`: "verified" (2+ independent sources, or an official primary source) | "reported" (single credible media source)

## Indicator (file: indicators.json)
```json
{"id": "gdp-growth", "name": "Real GDP growth", "unit": "%", "sector": "economy",
 "description": "...", "series": [{"year": 2022, "value": 2.4, "source": "World Bank", "url": "https://..."}]}
```

## Fact-check (file: factchecks.json)
```json
{
  "id": "fc-2024-...",
  "date": "2024-05-01",
  "claim": "The exact claim as it circulated",
  "circulated_by": "Where/how it spread (platform, outlet type) — do not defame private individuals",
  "verdict": "false | misleading | partly-true | true | unproven",
  "finding": "What the evidence actually shows, with figures.",
  "official_position": "What the government / agency says, with figure, if any",
  "independent_evidence": "What IMF/WB/UN/independent media say",
  "sector": "economy",
  "sources": [ {"name": "...", "url": "...", "type": "government"} ]
}
```
Verdicts follow the evidence — if a government claim is itself inaccurate, say so.

## Source directory (file: sources.json)
```json
{"name": "Somali National News Agency (SONNA)", "url": "https://sonna.so", "type": "government",
 "language": ["so","en"], "description": "...", "reliability_notes": "..."}
```

## Somali translations (all files)
Add a `_so` field next to any text field: `title_so`, `summary_so`, `impact_so`, `context_so`, `subcategory_so`; fact-checks use `claim_so`, `circulated_by_so`, `finding_so`, `official_position_so`, `independent_evidence_so`; indicators use `name_so`, `description_so`; sources use `description_so`, `reliability_notes_so`.
Set `"translation_so": "machine"` or `"reviewed"`. The English field is the authoritative text. See `i18n/TRANSLATION-GUIDE.md`.
