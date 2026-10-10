# Duplex and planning coordination repair — 10 October 2026

## Scope and baseline

Continued `sitepivot-concept` from GitHub head `e3c228e556235c001619735cbbb5e170efa3cc0c`. Prior residential repairs and security preparation remain intact. The existing approved founder-testing destination remains https://boggedcake.github.io/ProjectIQ/. No main merge, visibility change, subscription, hosting change or commercial launch.

## Root causes and repairs

1. Manly R1 had no reviewed permission rule, so an unresolved CDC/LMR check erased a separate consent opportunity. The shared engine now independently reports land-use permission, ordinary DA, CDC and subdivision. Reviewed Manly R1 dual-occupancy permission allows labelled preliminary costing while design and site checks remain unresolved. Full decision-ready feasibility still needs property/proposal/date-bound complete evidence.
2. Raw `Intersects` responses were treated as actual mixed zoning. Shared polygon intersection measures whole-parcel coverage, retains every source polygon and classifies adjacent contact, minor boundary uncertainty, genuine split zoning, incomplete geometry and service failure. Nield's tiny RE1 overlap remains a boundary question, not an erased polygon or confirmed mixed-zone development footprint.
3. First/intersecting LEP selection could import an adjacent instrument. Browser/server use the measured primary zone's instrument only for single-zone/boundary-review results. Compound or conflicting instruments cannot inherit Manly permission.
4. Road frontage was not sufficient to establish CDC width. Surveyed building-line width and independently verified secondary-road parking access are distinct evidence fields. Ordinary 15 m / limited 12 m CDC tests do not decide a separate DA. Stacked dwelling arrangements retain their different Codes division.
5. The financial gate previously had only blocked or fully assessed outcomes. Explicit conditional scenarios now require a supported consent opportunity and remain labelled non-decision-ready on scope, conversation, cost, feasibility, results and report. Unknown contribution liability still withholds project totals. Failed ordinary duplex pathways remain blocked. No automatic selling prompt or per-dwelling value-minus-whole-project comparison.
6. Independent review found browser dependency order, instrument conflict and hidden single-property value movement defects. All three were corrected with regressions before completion.

## Verified source captures

| Property | Parcel | Indicative GIS area | Instrument / mapped controls | Repaired outcome |
| --- | --- | ---: | --- | --- |
| 9 Violet Street, Balgowlah | 34 DP9598; cadid 102196866 | 596.8 m² | R1 Manly LEP 2013; FSR 0.5:1; subdivision min 300 m²; height 8.5 m | Conditional DA opportunity; CDC width/exclusions/design unresolved |
| 3 Nield Avenue, Balgowlah | 2 DP228402; cadid 102198152 | 605.9 m² | Dominant R1 Manly; FSR 0.5:1; subdivision min 300 m² | Conditional DA opportunity within R1; tiny retained RE1 boundary overlap needs confirmation; no confirmed CDC approval |
| 16 Eileen Street, North Balgowlah | 61 DP11915; cadid 102174177 | 471.4 m² | R2 Warringah LEP; mapped subdivision min 600 m²; completed FSR query empty | Ordinary duplex 800 m² standard fails; unverified LMR does not authorise feasibility |

Violet's indicative road frontage is 13 m and Nield's 15.9 m. Neither equals surveyed building-line width. Ordinary mapped FSR indicates approximately 298.4 / 303.0 m² statutory floor area respectively, not necessarily total constructed area. Selected build area is a working quantity until compliant design is established.

Raw official address/cadastre/planning responses and request timestamps are retained in `qa/fixtures/zoning-evidence`. Legal clauses, URLs, effective-date limits and missing evidence are documented in `duplex-pathway-evidence-2026-10-10.md`; geometry method and limitations in `evidence/2026-10-10-duplex-parcel-zoning.md`.

## Verification record

Local `npm run test:unit` completed exit 0; focused duplex suites, actual HTML module-order geometry, captured parcel-to-pathway propagation, `npm run test:security`, founder nine-asset build and diff checks passed. Independent read-only review verified conditional report wording and no profit recommendation.

Initial failures were reproduced, including missing Manly DA progression, instrument conflicts and cache-token harness expectation. Server QA initially rejected valid reviewed Manly permission and matched split-zone prose rather than structured state; synthetic financial fixtures carried contradictory live zoning after replacing their LEP. These harness defects were repaired without weakening real planning gates. A local live server check timed out on all government requests in this restricted environment; GitHub-hosted live server QA subsequently passed. Corrections passed their targeted regressions. The browser fixture initially used the geometry measurement object as a scalar and omitted the zone code; both fixture defects were corrected in `c611eed250bb770a2e2bb95d56938678f6588a81`. Deployed/browser workflow results are recorded below after execution; they are not inferred from local unit tests.

## DA / CDC / subdivision matrix

| Case | Permission | DA | CDC | Subdivision |
| --- | --- | --- | --- | --- |
| Violet | Reviewed R1 dual occupancy with consent | Conditional preliminary investigation; no reviewed LEP parent-lot duplex area minimum | Mapped area exceeds 400 m²; 13 m road frontage is not building-line survey width; exclusions/design unknown | Ordinary two lots at mapped 300 m² each exceed current 596.8 m² total; exceptions/title layout require separate review |
| Nield | Reviewed R1 permission within the retained R1 footprint assumption | Conditional investigation; minor boundary uncertainty retained | Mapped area exceeds 400 m²; 15.9 m road frontage is not survey width; boundary/exclusions/design and actual certificate outstanding | 605.9 m² alone does not establish two legal lots, access or titles |
| Eileen | Potential state-policy consent permission subject to exclusions | Ordinary 800 m² standard fails; LMR/variation unresolved | Ordinary resolved parent-lot area minimum fails; LMR does not automatically authorise CDC | Mapped subdivision minimum 600 m² is distinct; no subdivision right inferred |

## Founder test sequence

Open the existing founder URL and refresh once. Search each full address, confirm the property and use an illustrative dwelling profile. Ask “Could I build a duplex here?” followed by “Could I use complying development CDC here?” Violet and Nield should offer **Explore duplex costs**, with different boundary/frontage responses. Review mapped height/FSR, choose construction quantities and enter explicit value, land-debt and contribution assumptions. Figures must stay conditional until project-specific verification. Eileen must offer planning review and no ordinary-duplex budget. Change project to verify prior development state clears. Explicit selling questions retain the existing compact comparison workflow.

## Remaining evidence limits

- No authoritative Nield CDC certificate and approved plans were obtained. Founder-reported current construction is a lead, not proof of current CDC eligibility or a transferable approval.
- Current full legislation retrieval returned 403 in the research environment. Official indexed/historical clauses and council corroboration establish a bounded preliminary interpretation. Date-specific current text must be checked before professional reliance; no proposed amendment is assumed enacted.
- Actual DCP density/layout, survey, title restrictions, hazards, parking, exclusions and approval conditions remain project-specific checks. No unsupported LMR catchment is inferred from proximity.
- GIS screening tolerance is not a legal zoning boundary exemption. Genuine split zones remain blocked pending footprint assessment. Representative regression coverage is not comprehensive NSW legal validation.
- Conditional figures require explicit finance/value/contribution assumptions and do not establish approval, valuation, lender terms or an achievable profit. Physical iPhone audio remains unverified; browser automation is not hardware listening evidence.

## Files and review scope

- `planning-intelligence.js`: evidence matrix, exact instrument checks, preliminary versus full readiness, separate CDC area/width, stacked route, property-specific responses.
- `zoning-evidence.js`: shared measured polygon coverage and retained boundary uncertainty.
- `api/_lib/sitepivot.js`, `index.html`: geometry retrieval and primary LEP propagation; shared eligibility throughout conversation, scope, costs, results and reports; map-control quantities and conditional labels; module order/cache repair; no development single-property value movement.
- `commercial-engine.js`: explicit conditional scenario gate; no change to build-rate arithmetic or duplicate cost allocation.
- New focused QA: `duplex-pathway-regression`, `residential-zoning-regression`, `duplex-conditional-finance`, `duplex-opportunity-ui`, `duplex-browser` and three official capture fixtures. Existing regression runtimes, synthetic proof fixtures, workflow steps and asset allowlists updated for the ninth public module.
- Evidence and this report live in the repository. Independent reviewer performed read-only logic, arithmetic/gate, report, source consistency and browser dependency checks; material findings were fixed and re-reviewed.

Manual live checks confirmed Violet's DA progression and separate 13 m road frontage, Nield's 15.9 m frontage and retained zoning-boundary question, and Eileen's 471.4 / 800 m² restriction with planning-review action and no ordinary-duplex costing. One first manual Violet profile click did not transition; after inspection the second did. Nield and Eileen confirmed on one click. Automated tests explicitly check profile continuity and browser journeys; no physical device result is inferred from the manual cloud browser.

## GitHub repair commits

- `f0d7e0ccecd25b3c7f4c5bd118937b7d23ce5666`: shared pathway / zoning / conditional scenario implementation and sourced regressions.
- `c611eed250bb770a2e2bb95d56938678f6588a81`: captured parcel propagation and browser fixture geometry.
- `ca90ca454c1d3b1fe9fe24cb1be2ec5cc022da21`: consistent synthetic proof / zoning fixtures and conditional consent smoke expectations.
- `09983b54bfcd056987b14ffae535c5a9b45c961e`: explicit CDC area pass versus survey-width gap and structured split-zone smoke check.
- `5828d89fe9dfe89c7a9e56e46edad229533f5b01`: cache versions for repaired modules. This is the functional code checkpoint for the final workflow runs.

Main was independently verified unchanged at `2e7f85d1c935ce0d0f5253b05471211c817e3e62`.

## Final GitHub and deployed acceptance

Functional checkpoint `5828d89fe9dfe89c7a9e56e46edad229533f5b01` passed all five workflows:

| Workflow | Run | Result |
| --- | --- | --- |
| Pages build and deployment | 38025816262 | Success |
| Security preparation | 38025816720 | Success |
| Live NSW server data QA | 38025816752 | Success |
| Consumer regression | 38025816660 | Success |
| Deployed live QA | 38025816603 | Success |

Consumer logs contain 306 PASS lines and no FAIL lines; these are log assertions/journeys, not 306 independently sourced planning assessments. All twelve focused captured-data duplex browser cases passed: three properties × Chromium/WebKit × 390/1280 px.

The deployed live workflow verified all nine asset bytes against the functional commit, then passed existing founder, conversation, voice, property intelligence, residential changeover/FSR and focused duplex journeys. All twelve focused duplex cases passed again using live official property resolution on the existing GitHub Pages site. Screenshots and raw browser result records are in the workflow artifact. Browser contexts reported no uncaught page errors or horizontal overflow in these cases. Both conditional scenarios kept `decisionReady:false`; Eileen generated no ordinary-duplex budget.

The final documentation commit changes this report only. Application assets remain byte-identical to the fully tested functional checkpoint. No final failed or skipped acceptance step remains. Earlier expected-red tests, outdated smoke/fixture failures and the locally blocked live network check are retained above; earlier runs superseded by follow-up commits were cancelled rather than represented as successes.

Open https://github.com/BoggedCake/ProjectIQ/actions/runs/38025816603 for deployed results/screenshots; consumer results are at https://github.com/BoggedCake/ProjectIQ/actions/runs/38025816660. Physical iPhone listening, registered survey/title evidence and actual development certification remain outside this verified browser result.
