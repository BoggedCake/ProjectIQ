# SitePivot founder repair report — 9 October 2026

Prepared locally on `BoggedCake/ProjectIQ`, branch `sitepivot-concept`. No push, publication, deployment, paid account activation, commercial commitment, external communication or merge to main occurred. The changes are ready for founder review, with physical iPhone audibility and independent QS market validation still outstanding. Automated browser playback events establish sequence and completion, not acoustic quality.

## 1. Branch and authority reviewed

Starting/latest fetched branch HEAD: `4c1506e3c5f9656e1e68c299919debba8ba16ab1`. The remote branch matched this hash before edits. Implementation revision: `d94e456908e239aa8a3b74382009b4afc7ec44d6`.

Reviewed complete repository history, latest founder changes, unified conversation and structured provider routing, pathway orchestration, browser/server TTS adapters, commercial/versioned costs, sell/buy comparison and development feasibility. All five founder screenshots were recovered and inspected. Reviewed the canonical [SITEPIVOT — FOUNDER AUTHORITY & APPROVAL GUARDRAILS](https://app.notion.com/p/3f4c5050096e80d885dadafc60623acc) under ProjectIQ HQ. Chris Lewis remains final authority. This report describes local preparation, not a changed live site.

## 2. Files and components changed

- `conversation.js`, `api/_lib/intent.js`: semantic intent metadata, property context and provider/local routing authority.
- `commercial-engine.js`: intent extraction, versioned layered duplex costs, arithmetic reconciliation, official NSW duty, changeover costs and feasibility inclusion guards.
- `index.html`: unified conversation replies, secondary works pricing, property identity answer, clear configurations, editable building/site assumptions and compact changeover output.
- `voice.js`, `api/_lib/tts.js`, `api/voice/speak.js`: speech normalization, complete sequential delivery and Australian locale contracts.
- `package.json`, new and updated `qa/*` regression suites.
- `COST_RECALIBRATION.md`, `VOICE_RELIABILITY_QA.md`, implementation plan, and `docs/superpowers/plans/delmar-calibration-2026-10-09.json`: evidence, assumptions and complete arithmetic audit.

## 3. Intent-routing root causes

The exact simple founder sentence already routes to vertical addition at the fetched baseline; the current code did not reproduce that exact screenshot failure. Related normal-language variants and mixed work did expose failures: renovation terms displaced a clear primary addition, room extraction lost master-suite relationships, negation was overbroad, an existing upstairs room was confused with new upstairs construction, and a configured structured provider could override clear local intent. Configuration terminology also inverted total-level versus above-ground-level assumptions. Fixes address these reproducible cases rather than asserting an unproven on-device cause.

The interpreter now returns primary intent, secondary works, property questions, features, constraints, semantic taxonomy, confidence and relevant work locations. Clear full-sentence intent at confidence ≥0.8 is authoritative over conflicting provider output. Existing-room renovation and negated works remain distinct. Questions about frontage, zoning, feasibility and cost preserve the active project and loaded property. Genuine alternatives or uncertainty can still ask a useful clarification.

## 4. Before/after examples

| Sentence | Repaired interpretation / response |
|---|---|
| I want to add another level. | `ADD_LEVEL` → storey pathway, directly explores upstairs space. No redundant renovate/extend clarification. |
| Can I put another storey on my house? / I want to build upstairs. | Vertical addition; keeps the resolved property. |
| I want another bedroom upstairs and a bathroom. | Vertical addition; bedroom and bathroom features. |
| Add another level with a master bedroom and bathroom and open up the kitchen downstairs. | Vertical addition; master suite counted once; downstairs kitchen/open-plan work retained, described and priced separately once. |
| Renovate the existing upstairs bathroom. | Internal renovation; does not invent a new upper floor. |
| I don't want to extend; I want to build upstairs. | Negated extension discarded; positive vertical addition retained. |
| Extend the back of my house. | Extension / enlargement. |
| Open my kitchen and living room. / Renovate my bathroom. | Internal renovation with the correct selected components. |
| Could a duplex work here? / Knock this down and build two homes. | Duplex / dual occupancy, with evidence-aware feasibility rather than an approval promise. |
| What is my frontage? / What zoning is this property? | Answers loaded facts, or identifies missing frontage/zoning evidence; retains the project. |
| What might a duplex cost? | Cost question within duplex conversation; preserves building configuration. |
| I don't know what I should do but I need more space. | Genuinely unclear direction; asks the decision-changing clarification. |

The taxonomy additionally distinguishes rebuild, broader multi-dwelling development, sell/buy, compare alternatives, factual property, planning and feasibility questions. This is a tested structured semantic interpreter with context/provider integration; it is not a claim to understand every possible sentence.

## 5–7. Voice architecture, selection and approval

Current static-site fallback is browser Web Speech using device voices. The existing optional authenticated server TTS gateway remains available; server request/media failures fall back for the unspoken remainder. No OpenAI/Azure paid service is active or newly subscribed.

Default locale is `en-AU`; female Australian voices rank first where available, with quality preferences for natural/neural/enhanced catalogue entries. Browser tests select Karen or Microsoft Natasha Natural from their controlled catalogues. Playback rate is 0.94, pitch 1, volume 1. The exact real-device voice depends on its catalogue; there is no guaranteed premium Australian female voice on every iPhone. No real person is imitated.

Recommended optional voice to audition: Azure Speech **`en-AU-NatashaNeural`**, female Australian English, identified in [Microsoft's official catalogue](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support). It is not activated. A founder-approved Speech resource/credentials, compatible server-only JSON-to-SSML gateway, audition and deployment would be needed. The existing generic JSON gateway cannot point directly at Azure's SSML REST API. No unsupported Azure “calm” style is assumed. See `VOICE_RELIABILITY_QA.md` for exact contracts and sources.

## 8–9. Truncation and speech normalization

The historical speech formatter discarded everything after the first three sentences. Playback also sent long browser responses as a single utterance. Unit expansion processed `m` before `m²`, leaving “metres²”.

Speech now uses a separate full-response representation. `m²`, `m2`, `sqm` → square metres; numbers expand into words, including “600 m²” → “six hundred square metres” and “440 m²” → “four hundred and forty square metres”. FSR, ratios, percentages, dollar amounts, ranges, metre planning controls, NSW, LGA, DA and CDC expand appropriately. Display text remains unchanged. Existing provenance labels/URLs/internal metadata are excluded from speech.

Logical paragraphs and whole sentences queue sequentially, normally up to 220 characters. Only overlong sentences split at word boundaries. Later chunks advance on completion without overlap or silent three-sentence truncation. Cancellation, navigation, new replies, reset, stale events and property changes invalidate previous playback. Retry retains the current/remainder; server fallback preserves later chunks. Browser startup failure is surfaced with an activation/retry action. Tests require content equality through the final sentence after the 600 m² phrase.

## 10. Duplex configuration

| Primary consumer choice | Above ground | Basement | Different cost assumptions |
|---|---:|---:|---|
| 2 levels | 2 | 0 | Above-ground finish rate; no basement or default lift. |
| 3 levels with basement | 2 | 1 | Separate basement shell/excavation area; stairs default, optional lift. |
| 4 levels with basement | 3 | 1 | Basement shell, additional structure/scaffolding/services and one lift per home by default. |

Only these three normal choices appear. Custom delivered QS/builder rates are behind an advanced choice. Measured basement area and lift counts are editable. Total 440 m² includes basement once; an assumed equal floor-plate split is disclosed and replaceable. This is constructed area, not a claim about planning FSR.

## 11–12. Sources and revised cost methodology

Primary sources investigated: BMT Quantity Surveyors 2026 Sydney building comparators; RLB Riders Digest 2026; ABS June 2026 PPI; Turner & Townsend 2026 ANZ intelligence; public Cotality/Cordell June-quarter index; Rawlinsons Handbook 2026 availability; HIA June-quarter trades evidence. Source dates, geographies, meaning, access limitations and exact links are recorded in `COST_RECALIBRATION.md`.

BMT supplies the verified numeric comparator, not an exact published duplex tariff. RLB's Sydney PDF retrieval returned 403; its numeric table could not be independently verified. Rawlinsons/Cordell licensed estimator rates were unavailable and were neither scraped nor reproduced. ABS/Cordell growth rates are context and were not compounded again into current 2026 rates. Further QS validation is needed before treating these working assumptions as market-calibrated production pricing.

The model sums actual quantities and explicit allowances: finish-specific above-ground base construction; separate basement area × shell rate; configuration structure and lifts; site/external/access allowances; consultants; approvals; construction contingency; GST once. Sydney/Northern Beaches use the same metropolitan reference factor 1, with no automatic land-price/prestige uplift. Regional NSW or other development typologies require a local/project-specific QS rate rather than fabricated geography factors. Volume, standard custom, premium, prestige architectural and luxury development are explicit specification choices.

Low/mid/high use distinct working scenario rates, allowances and uncertainty assumptions; midpoint is not automatically the arithmetic mean of endpoints. They are not statistical confidence percentiles. Source/version/date, region, specification, configuration, measured/assumed area split and component bases are retained internally. Site/access allowance overrides replace existing lines and are editable in the existing advanced building/site panel. Exceptional conditions require separate expert pricing; a generic site multiplier does not pretend to solve rock/groundwater risk.

## 13. 106 Delmar Parade calibration comparison

440 total constructed m², two homes, Northern Beaches reference, premium specification:

| Configuration | Old premium low / mid / high | Revised premium low / mid / high |
|---|---|---|
| 2 levels | $2,640,000 / $2,992,000 / $3,520,000 | $2,103,672 / $2,698,214 / $3,559,631 |
| 3 levels with basement | $2,992,000 / $3,520,000 / $4,312,000 | $1,901,360 / $2,506,228 / $3,436,695 |
| 4 levels with basement | $3,080,000 / $3,652,000 / $4,488,000 | $2,147,562 / $2,875,584 / $3,995,495 |

The founder screenshot's $4.4m / $5.148m / $5.984m and $11,700/m² exactly match the old **luxury** basement band, not its premium band. This suggests a possible label/saved-state/version mismatch, whose precise cause remains unestablished. The revised comparable luxury basement case is $2,305,983 / $3,158,982 / $4,584,098.

The change comes from documented hard-cost comparators, area-specific basement pricing, explicit fees/allowances/GST and removal of the old blanket delivered tariff. At fixed total area, the 3-level premium case can be cheaper than all-above-ground 2 levels because some premium habitable area is replaced by lower-finish garage shell. Holding habitable area constant and adding basement instead raises cost. Do not read the fixed-440 comparison as “basements are always cheaper”. No Delmar-specific price is hard-coded. All 21 specification/configuration cases and each component are stored in the calibration JSON; source and midpoint component tables are in `COST_RECALIBRATION.md`.

## 14. Double-count audit

Revised model component totals reconcile exactly. Building preliminaries/overheads/margin are in base hard rates once; basement ordinary excavation is in the shell once; consultants, approvals, external works and contingency are explicit delivery lines once; construction GST is added once to its disclosed bases. Feasibility cannot re-add these included categories. Demolition, authority contributions, land, finance, holding, selling/marketing/legal and project tax sensitivity remain distinct additional development costs.

A custom all-in rate has one user/QS line and does not invent a second component allocation. Construction GST budgeting and separate development tax sensitivity are different concepts; final net project GST/tax must be reconciled by an accountant. Mixed addition/existing-home works are priced separately once, with master-suite rooms not duplicated.

## 15–16. Changeover and NSW transfer duty

Sale proceeds = sale price less agent, marketing, sale legal and discharge/settlement allowances. Existing mortgage principal is not inferred; displayed net proceeds are before mortgage payout. Buy costs = purchase price plus duty, purchase legal, searches/settlement, moving and any explicit finance allowance. Total changeover expense = all selling and buying transaction expenses. Additional capital = max(0, purchase price − sale price + transaction expenses). Downsizing shows capital released separately. This compares property equity changes, not a promised cash/loan approval amount.

Assumptions are editable whole-dollar working values. One compact visible breakdown includes sell current home, net proceeds, buy next home, duty, total changeover expense and additional capital; details do not require competing tabs.

Official [Revenue NSW transfer duty](https://www.revenue.nsw.gov.au/taxes-duties-levies-royalties/transfer-duty/understanding-transfer-duty/calculate-transfer-duty) rules are effective-date aware: `NSW-2025-26` and `NSW-2026-27`. Contract date selects the version. 2026/27 ordinary thresholds: $18,000 / $38,000 / $103,000 / $387,000 / $1,290,000; marginal rates $1.25 / $1.50 / $1.75 / $3.50 / $4.50 / $5.50 per $100 or part, with official cumulative bases. Premium residential threshold $3,870,000, base $194,137 plus $7 per $100 or part above it. Minimum $20; duty returned in whole dollars. Dutiable value uses the greater supplied purchase/market value. No concession, foreign surcharge or exemption is inferred. Mixed-use/large-land premium apportionment and dates outside supported versions return review. For $3.5m purchase on 9 Oct 2026: $173,787 duty.

## 17–18. Regression evidence and mobile/WebKit

Final local command evidence (9 October 2026):

| Command | Result |
|---|---|
| `npm test` | Exit 0; 199 PASS entries, zero FAIL entries; final reviewed code. |
| `npm run test:voice` | Exit 0; 23 PASS entries, including both Chromium and WebKit. |
| `npm run test:mobile` | Exit 0; four full WebKit journeys at 390/393 pixels. |
| `node qa/conversation-browser.cjs` | Exit 0; eight unified text/voice/context/reset flows across Chromium/WebKit. |
| `node qa/founder-repair-browser.cjs` | Exit 0; six focused flows across Chromium/WebKit at 375/390/430 pixels. |
| `git diff --check` | Exit 0. |

The focused arithmetic and UI tests were also rerun after the final review fix. PASS-entry counts describe the log, not an inflated count of independent end-to-end journeys.

Natural-language tests cover the 13 required sentences plus mixed works, negation, existing upstairs renovations, master-suite extraction, provider conflicts, property context, configuration persistence and actions. Arithmetic tests cover ordered allowance overrides, actual component sums, low/mid/high, area conservation, custom rates, unsupported regions/types and included-cost rejection. Duty tests cover thresholds, every-$100 rounding, premium, dates, invalid inputs and numeric-string assumptions. Voice tests cover browser/server complete queues, sentence/paragraph boundaries, retry/fallback, cancellation, superseding events and normalization.

Real browser processes run Chromium 151.0.7922.34 and WebKit 26.5, including 375/390/430-pixel touch viewports. The six focused founder flows verify addition, mixed scope/price, resolved property with missing zoning, speech past 600 square metres, three distinct configurations, compact changeover, report completion, no page exceptions and no horizontal overflow. Broader mobile journeys run at 390/393 pixels. WebKit is an automated Safari-code-path check, not a physical iOS device; browser/media speech boundaries are mocked. Physical speaker output, real voice catalogue quality and subjective Australian delivery remain unverified.

Initial RED tests exposed normalization/truncation, missing cost components and editable site propagation. Independent review exposed mixed-work pricing omission, negation/location propagation, configuration mapping, numeric-string allowances/prices, negative downsizing presentation and duty $100 rounding; fixes and regression tests followed. The final focused review additionally reproduced numeric-string purchase-price concatenation in additional capital. Sale/purchase inputs are now normalized, with a RED→GREEN regression matching numeric and string results exactly. Integration initially failed on obsolete British-voice and old-tariff expected values; these expectations were updated to the selected Australian voice and independently calculated new model. No failed run is represented as a passed run.

## 19. Screenshots

Focused tests save full-page PNGs under `qa-artifacts/founder-repair/`. Delivered 390-pixel WebKit images: [conversation](sandbox:/workspace/scratch/321a8aeeaf5a/ProjectIQ/qa-artifacts/founder-repair/webkit-390-conversation.png), [duplex scope](sandbox:/workspace/scratch/321a8aeeaf5a/ProjectIQ/qa-artifacts/founder-repair/webkit-390-duplex-scope.png), [assessment/changeover](sandbox:/workspace/scratch/321a8aeeaf5a/ProjectIQ/qa-artifacts/founder-repair/webkit-390-cost-changeover.png). They use clearly marked fixture property evidence; they do not claim a live parcel verification of Delmar. The numeric calibration separately uses the Delmar test quantities. Screenshot capture returns to the page top so the sticky header is positioned correctly. Controls and cost/decision outputs remain legible without horizontal overflow.

## 20. Remaining limitations

- Actual iPhone Safari acoustic audibility, completion and subjective voice quality need founder device testing; neural server voice is not configured.
- This local revision is not deployed. Live planning/address/provider services were not revalidated as part of these fixture-based repaired journeys.
- The duplex cost model is a transparent working scenario, not a measured QS estimate; RLB exact table and licensed data remain unavailable. Regional NSW, broader developments, exceptional site conditions and measured basement splits require project-specific evidence.
- Existing renovation/addition prototype rates were retained rather than falsely attributing them to the new duplex research.
- Existing mortgage balances, borrowing capacity, exemptions/concessions and tax circumstances are not inferred. Feasibility authority contributions may remain unpriced; a potential surplus is not final profitability or planning approval.
- Physical browser chrome/keyboard behavior and real mobile speech-recognition availability vary by device beyond automated touch/WebKit checks.

## 21. Founder decisions before further action

Separate exact founder approval is needed for pushing/publishing/deploying this prepared revision, any paid provider resource or credentials/activation, licensed data purchase/terms and consequential production actions. A physical iPhone audition and QS review are verification steps still needed before calling the entire acoustic/market calibration acceptance complete. Nothing was merged to main and no commercial commitment was made.

## Changed-file inventory

- `COST_RECALIBRATION.md`
- `VOICE_RELIABILITY_QA.md`
- `api/_lib/intent.js`
- `api/_lib/tts.js`
- `api/voice/speak.js`
- `commercial-engine.js`
- `conversation.js`
- `docs/superpowers/plans/2026-10-09-founder-repair.md`
- `docs/superpowers/plans/delmar-calibration-2026-10-09.json`
- `index.html`
- `package.json`
- `qa/changeover-regression.cjs`
- `qa/commercial-regression.cjs`
- `qa/consumer-commercial.cjs`
- `qa/conversation-founder-api-regression.cjs`
- `qa/conversation-founder-regression.cjs`
- `qa/cost-recalibration.cjs`
- `qa/founder-repair-browser.cjs`
- `qa/founder-ui-regression.cjs`
- `qa/intake-component-regression.cjs`
- `qa/intake-ui-regression.cjs`
- `qa/journey.cjs`
- `qa/mobile-journey.cjs`
- `qa/voice-adapter-regression.cjs`
- `qa/voice-browser.cjs`
- `qa/voice-complete-regression.cjs`
- `qa/voice-reliability-regression.cjs`
- `qa/voice-server-regression.cjs`
- `qa/voice-ui-regression.cjs`
- `voice.js`
- `FOUNDER_REPAIR_REPORT.md` (this report).
