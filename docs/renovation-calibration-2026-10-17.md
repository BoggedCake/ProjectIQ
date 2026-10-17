# Residential scope calibration — 17 October 2026

Baseline: `485432cae73dc86cb0577f36c89c43272b347e55`, existing `sitepivot-concept` checkout. This report distinguishes founder-confirmed screenshot scenarios, model arithmetic and independently verified market evidence. The founder confirmed the exact scope and amounts during this task. No project-specific builder/QS quote was supplied.

## Founder-confirmed baseline reproduction and diagnosis

The reported extension $1,319,095 is reproduced exactly by **59 West Street, Balgowlah: 132 m², premium, normal complexity, region factor 1, no secondary renovation**: 132 × $7,750/m² × (1 + 10% professional + 2% approvals + 4.5% external + 10% contingency) + $25,000 demolition. Low/high are $1,110,370/$1,527,820. The reported additional-level $1,190,752 is reproduced exactly by **57 Griffiths Street, Fairlight: 108 m² with the same specification/complexity/region and no secondary renovation**: 108 × $8,400/m² × (1 + 12% professional + 2% approvals + 4.5% external + 10% contingency) + $25,000 demolition. Low/high are $1,024,216/$1,357,288. The founder subsequently confirmed the extension rooms: bedroom14 + master suite30 + bathroom10 + kitchen/living40 + second living30 + laundry8 = 132 m²; additional-level quantities: two bedrooms28 + master suite30 + two bathrooms20 + living30 = 108 m². These are application room allowances confirmed by the founder, not a measured design, planning assessment or quote. Their arithmetic does not establish excessive pricing.

The founder confirmed the premium eight-component $213,600 renovation scope: kitchen, **two** bathrooms, open-plan opening, living/dining, flooring elsewhere, windows/doors, office and laundry; normal complexity, region factor 1. Replacement/layout extent is inferred because both give this amount; the screenshot did not directly show extent. Mid lines: $48,000 + $67,200 + $26,400 + $12,000 + $14,400 + $18,000 + $9,600 + $18,000 = $213,600; low/high $124,800/$362,400. Although arithmetic alone had allowed multiple combinations, the founder has now confirmed this exact component selection and amounts; there is no need to infer an alternative outdoor scope.

The baseline renovation model uses fixed room packages; only bathroom/room counts are adjustable. It ignores glazing quantity, opening quantity and plumbing relocations. Layout and replacement produce the same allowance; structural extent adds 25% to almost every room without specifying the structural work. Ordinary GST/contingency are buried in line labels, while project preliminaries, site access/conditions and professional/approval scope are not reconciled. Whole-home shared finishes correctly suppress overlapping flooring/painting/electrical/living/office selections; ordinary room services already include local plumbing and electrical and must not be charged twice.

Extension/additional-level pricing lives in an unrelated inline prototype in `index.html`, not `renovationCost`. Its GST basis is unconfirmed. Premium addition rates should not be indiscriminately cut to make a scenario look affordable. Construction scope and professional/site costs require inclusion reconciliation first. Development cost/finance calibration is a separate model and is preserved.

## Evidence and public access

Fresh HTTP checks on 17 October 2026 used ordinary HTTPS with Python urllib and curl. All following destinations returned **proxy CONNECT tunnel 403 Forbidden**; no publication body was retrieved. This is an environment access result, not proof a publisher denied a public reader, and not a successful 2026 refresh.

| Source | URL | Evidence usable here |
| --- | --- | --- |
| BMT public construction table | https://www.bmtqs.com.au/construction-cost-table and https://prod.bmtqs.com.au/construction-cost-table | Repository's 12 October report records Sydney 2026 executive residence comparators $4,645/$5,947/$8,318 ex GST, distinct finish classes with preliminaries/overheads/profit included. Secondary session evidence only; no fresh verification. Whole-building GFA comparators do not price an internal renovation or establish quantiles. |
| RLB Sydney Riders Digest 2026 | https://www.rlb.com/wp-content/uploads/sites/1/2026/01/2026-RLB-Rider-Digest_Sydney_Digital_2.pdf | Existing provenance records a 2026 publication but no independently retrieved numeric table. No RLB numeric rate used. |
| ABS June 2026 PPI | https://www.abs.gov.au/statistics/economy/price-indexes-and-inflation/producer-price-indexes-australia/jun-2026 | Existing notes record NSW house output +2% quarter/+4.8% year. An index is trend context, not a renovation tariff; no extra escalation added to 2026 rates. |
| Rawlinsons 2026 handbook | https://www.rawlhouse.com.au/publications/2026-australian-construction-handbook | Edition provenance only. Licensed rate tables unavailable; no proprietary rates reproduced or inferred. |
| CPP QS Sydney 2026 guide | https://www.cppqs.com.au/post/cost-to-build-a-house-in-sydney-a-2026-guide | Existing notes identify premium duplex $4,500–$6,500/m² in a paragraph labelled 2025, GST unspecified. Not a renovation quote or verified 2026 rate. |

The implementation's allowances are internal indicative estimates. Public-source references are comparators/context, not independent validation of each package, probability distribution or contracted scope. No paid data, subscription, external communication, commit, push or deployment is part of this change.

## Regression evidence

Before production edits, `node --test qa/renovation-scope-calibration.cjs` executed seven tests: **one passed, six failed** on ignored glazing/relocation/access quantities, missing structural classification/opening allowances, missing project/GST ledger, and unsupported reconstruction/invalid quantities. Existing whole-home trade overlap prevention passed. This is the recorded RED state; final verification and before/after ledgers will be added after implementation.

## Implemented scope contract and accounting

`renovationCost` now accepts optional `quantities` (`windowDoorArea`, `finishArea`, `structuralOpenings`, `plumbingRelocations`), `allowances` (`preliminaries`, `consultants`, `approvals`, `demolition`, `conditions`, `access`), `accessCondition`, and `contingencyPct`. Effective quantities, allowances, their user/default origin, scope classification and unresolved exclusions are returned for the editable UI. Invalid quantities/counts and reconstruction return review with no numeric budget. Layout/structural work requires at least one explicit working opening; a default one is disclosed when not measured. Cosmetic scope cannot discount a separately selected structural opening.

The original ordinary room bands remain **opaque gross packages**, with their existing GST and ordinary room contingency retained. No assumed embedded contingency percentage is removed; no artificial ex-GST rebase is performed. Their default mid prices remain credible working estimates, not independently verified rates. Additional plumbing reroutes use internal ex-GST per-relocation low/mid/high $1,500/$3,000/$6,000 × finish factor × region factor; ordinary in-room connections remain in the original package. Restricted access uses internal ex-GST $5,000/$10,000/$20,000, overridable by an explicit allowance. These new allowance values are **internal estimates, not copied external QS/supplier quotes**. Room installation and opening engineering/temporary support/local demolition/making good remain included once. Extra consultants and demolition explicitly cover additional work outside those packages. Structural extent removes the arbitrary blanket 25% room uplift; actual opening quantities replace it.

Additional project allowances default to zero and are visibly unverified exclusions; zero is never evidence that a designer, consent, extra setup or adverse-condition allowance is unnecessary. Additional contingency defaults to **zero**, applying only when entered, and only to incremental ex-GST items. GST 10% is added once to those extra taxable items and their additional contingency. Approval allowance means gross statutory fees; taxable reports/design belong in consultants. No second GST/contingency is applied to the original gross packages. Each range band reconciles exactly to its component ledger. Whole-home trade overlap protection remains.

### Before/after scenarios

The founder-confirmed ordinary eight-component scenario remains **$124,800 / $213,600 / $362,400** low/mid/high. No extra contingency or GST is added to its original room packages. The baseline extension **$1,319,095** and storey **$1,190,752** rates/arithmetic remain unchanged; they are distinct from this renovation scope model.

The following is a deliberately specified **synthetic additional-scope scenario**, additional to the founder's confirmed baseline, not an observed expanded scope or a priced design: same eight components/two bathrooms/premium/normal/region1, structural extent, three openings, 32 m² glazing, 150 m² shared finishes outside selected rooms, four plumbing reroutes, restricted access, plus explicit ex-GST preliminaries $8,000, design $6,000, extra demolition $15,000 and existing-condition allowance $20,000, gross statutory approvals $2,000, and user-entered 15% contingency **only on incremental ex-GST extras**. It returns **$262,418 / $422,451 / $698,117**, without indiscriminately inflating the room rates.

| Mid component | Amount | Basis |
| --- | ---: | --- |
| Kitchen | $48,000 | Original gross room package |
| Two bathrooms | $67,200 | Original gross packages |
| Three structural openings | $79,200 | Original gross package × 3; engineering/support/local demolition/making good included |
| Living/dining | $12,000 | Original gross package |
| Shared flooring, 150 m² | $21,600 | Original 100 m² internal reference × 1.5; outside selected rooms |
| Glazing, 32 m² | $72,000 | Original 8 m² internal reference × 4 |
| Office | $9,600 | Original gross package |
| Laundry | $18,000 | Original gross package |
| Four additional plumbing relocations | $14,400 | Ex GST; 4 × $3,000 × 1.2 premium |
| Extra preliminaries | $8,000 | Explicit ex-GST input |
| Extra consultants | $6,000 | Explicit ex-GST input; no second opening-engineering allowance |
| Extra demolition | $15,000 | Explicit ex-GST input outside packaged work |
| Existing conditions | $20,000 | Explicit ex-GST input |
| Restricted access | $10,000 | Internal mid ex-GST allowance |
| Additional contingency | $11,010 | 15% × $73,400 incremental ex-GST scope |
| Gross statutory approvals | $2,000 | No additional GST |
| GST on incremental scope | $8,441 | 10% × ($73,400 + $11,010); no second tax on gross room packages |
| **Total** | **$422,451** | Exact sum |

## Spatial-capacity consumer safeguard

`developmentAreaModel` additionally rejects an FSR result explicitly marked `spatiallyVerified: false` or `requiresReview: true`. A supplied positive `capacityAreaFraction` no greater than one reduces the site area used for capacity (1,000 m² × 0.98 supported fraction × 0.5 FSR = 490 m²). Legacy synthetic arithmetic fixtures without these flags retain compatibility; this does not establish real-site proof. Invalid fractions fail closed. Development finance/rate bands are otherwise unchanged.

## Verification after implementation

The new permanent regression executes **10 tests, all passed**: seven original scope cases, spatial flag/fraction consumption, exact retained founder-confirmed gross baseline, and incremental contingency/statutory-fee GST reconciliation. Existing intake-component, decomposed duplex-cost, residential-finance, residential-FSR and FSR-area regressions also passed. An interim full `npm test` exited 1 during concurrent spatial integration: `qa/fsr-area-ui.cjs` failed three synthetic attribute-only FSR cases (mapped starter area, habitable-basement conflict, unrelated-overlay outage). The updated spatial adapter correctly marked that unmeasured fixture as `spatiallyVerified: false`; the consumer gate withheld capacity. Ownership, P0, reliability, premium and financial groups had passed; later groups were not reached because the npm command chains with `&&`. This is a fixture-migration/integration failure, not a passing full suite. Root owns spatial fixture migration, UI integration and the final settled whole-change run. No current independent 2026 renovation QS rate verification is claimed.

The additional UI suite `qa/renovation-scope-ui.cjs` was written before UI integration and executed **seven failures, zero passes**, all for the expected missing editable quantity controls. It exercises renovation/extension/additional-level inputs reaching cost arithmetic, blank override removal, save/reopen budget stability, stale extra clearing on project direction change, and the final report's scope/GST/exclusion audit. Root's subsequent UI implementation must make these cases pass without weakening the expected state/cost behavior.

The founder subsequently confirmed all three baseline scenarios. The UI regression now also asserts the exact eight-component $213,600 renovation, the six-room 132 m² extension at $1,319,095, and the confirmed room quantities (including repeated bedroom/bathroom counts) totalling 108 m² for the additional level at $1,190,752. Region factor1 and premium/normal scope are explicit arithmetic inputs; these UI fixtures do not claim live address/planning verification.

Additional regression evidence: after initial UI integration, all eight scope/persistence/intent checks passed. Exact founder baseline tests passed (currency comparison tolerates sub-cent floating arithmetic only). Two further regressions were added and failed as expected: mixed addition with no structural intent inherited the legacy `layout` fallback and priced an unsolicited opening; changing project direction cleared quantities but retained `renovationExtent: structural`. Root owns changing the mixed-work fallback to replacement and clearing that extent.

Final focused verification after root fixed those two causes: `node --test qa/renovation-scope-calibration.cjs qa/renovation-scope-ui.cjs` executed **23 tests, all passed**, with exit0. This includes all three founder-confirmed baselines, mixed-scope no-phantom-opening behavior, clear/reopen/intent state, once-only costs/tax, measured quantities and spatial capacity flags/fraction. This supersedes the expected RED counts for those focused cases; it does not supersede the root's separate final full-suite/release evidence.
