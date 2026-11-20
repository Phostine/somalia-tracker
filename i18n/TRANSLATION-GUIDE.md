# Somali translation guide (for translators & agents)

Translations are stored as extra fields with a `_so` suffix next to the English field. The English field is never changed.

| File(s) | Fields to add |
|---|---|
| politics/economy/security/diplomacy/social.json | `title_so`, `summary_so`, `impact_so`, `context_so` (only if `context` exists), `subcategory_so` |
| factchecks.json | `claim_so`, `circulated_by_so`, `finding_so`, `official_position_so`, `independent_evidence_so` (only where English exists) |
| indicators.json | `name_so`, `description_so` |
| sources.json | `description_so`, `reliability_notes_so` |

Every translated entry also gets `"translation_so": "machine"` (machine-assisted, awaiting native review).
A reviewer who has checked an entry changes it to `"translation_so": "reviewed"`.

## Style
- Standard written Somali (af-Soomaali), as used by BBC Somali / VOA Somali / SONNA. Neutral, formal news register.
- Keep proper names as commonly written in Somali: Xasan Sheekh Maxamuud, Xamsa Cabdi Barre, Muqdisho, Puntland, Jubbaland, Galmudug, Hirshabeelle, Koonfur Galbeed, Banaadir, Soomaaliland, Kismaayo, Baydhabo, Beledweyne, Gaalkacyo, Garoowe, Al-Shabaab.
- Keep numbers, dates and currency figures exactly as in English (e.g. "$4.5 bilyan", "15 May 2022" → "15 May 2022"). Months: Janaayo, Febraayo, Maarso, Abriil, May, Juun, Luulyo, Ogoosto, Sebtembar, Oktoobar, Nofembar, Diseembar.
- Keep acronyms (IMF, EAC, UNSC, AUSSOM, ATMIS, HIPC, NCC, NIRA, JSP) and explain on first use where natural.

## Glossary
| English | Somali |
|---|---|
| Federal Government of Somalia | Dowladda Federaalka Soomaaliya |
| Federal Member State(s) | Dowlad Goboleed(ka) Xubinta ka ah Federaalka / Dowlad Goboleedyada |
| President / Prime Minister | Madaxweyne / Ra'iisul Wasaare |
| Parliament / House of the People / Upper House | Baarlamaanka / Golaha Shacabka / Aqalka Sare |
| Constitution / constitutional amendment | Dastuur / wax ka beddelka dastuurka |
| National Consultative Council (NCC) | Golaha Wadatashiga Qaranka |
| Electoral commission | Guddiga Doorashooyinka |
| one person, one vote | qof iyo cod |
| Supreme Court | Maxkamadda Sare |
| opposition | mucaaradka |
| debt relief | cafinta deynta |
| domestic revenue | dakhliga gudaha |
| budget | miisaaniyad |
| inflation | sicir-barar |
| GDP growth | korriinka wax soo saarka guud (GDP) |
| Central Bank of Somalia | Bankiga Dhexe ee Soomaaliya |
| arms embargo | cunaqabateynta hubka |
| Somali National Army (SNA) | Ciidanka Xoogga Dalka Soomaaliyeed |
| counter-terrorism | la dagaallanka argagixisada |
| liberated / recaptured | la xoreeyay / dib loo qabsaday |
| East African Community | Bulshada Bariga Afrika (EAC) |
| UN Security Council | Golaha Ammaanka ee Qaramada Midoobay |
| African Union | Midowga Afrika |
| memorandum of understanding (MoU) | heshiis is-afgarad |
| humanitarian aid | gargaar bini'aadannimo |
| drought / floods / famine | abaar / fatahaad / macluul |
| internally displaced persons (IDPs) | barakacayaasha gudaha |
| fact-check | xaqiijin xaqiiqo |
| false / misleading / partly true / true / unproven | been / marin-habaabin / qayb ahaan run / run / aan la xaqiijin |
