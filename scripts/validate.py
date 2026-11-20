#!/usr/bin/env python3
"""Validate the platform's data files before publishing.

Usage:
  python3 scripts/validate.py              # structure checks
  python3 scripts/validate.py --links      # also check every source URL responds
"""
import json, re, sys, pathlib, urllib.request, concurrent.futures

ROOT = pathlib.Path(__file__).resolve().parent.parent / "data"
SECTORS = {"politics", "economy", "security", "diplomacy", "social"}
SRC_TYPES = {"government", "international", "media", "ngo", "factcheck"}
VERDICTS = {"false", "misleading", "partly-true", "true", "unproven"}
DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
errors, warnings, urls = [], [], set()


def load(name):
    p = ROOT / name
    if not p.exists():
        warnings.append(f"{name}: missing")
        return []
    try:
        d = json.loads(p.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        errors.append(f"{name}: invalid JSON ({e})")
        return []
    if not isinstance(d, list):
        errors.append(f"{name}: top level must be an array")
        return []
    return d


def check_sources(where, sources, required=True):
    if required and not sources:
        errors.append(f"{where}: no sources")
    for s in sources or []:
        u = s.get("url", "")
        if not u.startswith(("http://", "https://")):
            errors.append(f"{where}: bad source url {u!r}")
        else:
            urls.add(u)
        if s.get("type") and s["type"] not in SRC_TYPES:
            warnings.append(f"{where}: unknown source type {s['type']!r}")


ids = set()
for f in ["politics.json", "economy.json", "security.json", "diplomacy.json", "social.json"]:
    for i, m in enumerate(load(f)):
        w = f"{f}[{i}] {m.get('id', '?')}"
        for k in ("id", "date", "sector", "title", "summary"):
            if not m.get(k):
                errors.append(f"{w}: missing {k}")
        if m.get("id") in ids:
            errors.append(f"{w}: duplicate id")
        ids.add(m.get("id"))
        if m.get("date") and not DATE.match(m["date"]):
            errors.append(f"{w}: date must be YYYY-MM-DD")
        if m.get("date", "") < "2022-01-01":
            warnings.append(f"{w}: date before 2022")
        if m.get("sector") not in SECTORS:
            errors.append(f"{w}: bad sector {m.get('sector')!r}")
        if m.get("added") and not DATE.match(m["added"]):
            errors.append(f"{w}: 'added' must be YYYY-MM-DD")
        if m.get("verification") not in ("verified", "reported"):
            warnings.append(f"{w}: verification should be 'verified' or 'reported'")
        check_sources(w, m.get("sources"))

for i, ind in enumerate(load("indicators.json")):
    w = f"indicators.json[{i}] {ind.get('id', '?')}"
    if not ind.get("series"):
        errors.append(f"{w}: empty series")
    for p in ind.get("series", []):
        if not isinstance(p.get("value"), (int, float)):
            errors.append(f"{w} {p.get('year')}: value must be a number")
        if not p.get("source"):
            warnings.append(f"{w} {p.get('year')}: no source")
        if p.get("url"):
            urls.add(p["url"])

for i, fc in enumerate(load("factchecks.json")):
    w = f"factchecks.json[{i}] {fc.get('id', '?')}"
    for k in ("id", "claim", "verdict", "finding"):
        if not fc.get(k):
            errors.append(f"{w}: missing {k}")
    if fc.get("verdict") not in VERDICTS:
        errors.append(f"{w}: bad verdict {fc.get('verdict')!r}")
    check_sources(w, fc.get("sources"))

for i, s in enumerate(load("sources.json")):
    if not s.get("name") or not s.get("url"):
        errors.append(f"sources.json[{i}]: needs name and url")

# Somali translation coverage
so_fields = {"milestone": ["title", "summary"], "factchecks.json": ["claim", "finding"]}
for f in ["politics.json", "economy.json", "security.json", "diplomacy.json", "social.json", "factchecks.json"]:
    data = load(f)
    need = so_fields["factchecks.json"] if f == "factchecks.json" else so_fields["milestone"]
    missing = [d.get("id", "?") for d in data if any(d.get(k) and not d.get(k + "_so") for k in need)]
    machine = sum(1 for d in data if d.get("translation_so") == "machine")
    reviewed = sum(1 for d in data if d.get("translation_so") == "reviewed")
    print(f"Somali {f:16} {len(data) - len(missing)}/{len(data)} translated · {reviewed} reviewed · {machine} machine")
    if missing:
        warnings.append(f"{f}: {len(missing)} entries lack Somali translation (e.g. {missing[0]})")

if "--links" in sys.argv:
    def probe(u):
        req = urllib.request.Request(u, method="GET", headers={"User-Agent": "Mozilla/5.0 (link-check)"})
        try:
            with urllib.request.urlopen(req, timeout=15) as r:
                return u, r.status
        except urllib.error.HTTPError as e:
            return u, e.code
        except Exception as e:
            return u, type(e).__name__
    print(f"Checking {len(urls)} URLs…")
    with concurrent.futures.ThreadPoolExecutor(16) as ex:
        for u, st in ex.map(probe, sorted(urls)):
            if not (isinstance(st, int) and (200 <= st < 400 or st in (401, 403, 429))):  # many sites block bots; treat as reachable
                warnings.append(f"link {st}: {u}")

for w in warnings:
    print("WARN ", w)
for e in errors:
    print("ERROR", e)
print(f"\n{len(ids)} milestones · {len(errors)} errors · {len(warnings)} warnings")
sys.exit(1 if errors else 0)
