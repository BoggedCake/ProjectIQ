# SitePivot NSW spatial, address and cost report — 17 October 2026

**GO for local code review and controlled GitHub validation handoff. NO-GO for public founder-site release at this checkpoint.** Full local regression, security and Chromium checks pass, including actual authoritative founder properties. WebKit lacks host libraries; candidate GitHub Actions and deployed-site validation have not run. Founder approval remains required before pushing/publishing this work. No commit, push, merge, paid service or deployment occurred.

## Repository and scope

Branch `sitepivot-concept`; local HEAD and freshly verified remote HEAD both **485432cae73dc86cb0577f36c89c43272b347e55**. The existing committed performance/planning-safeguard/browser work remains the base. New work is uncommitted. Fetch initially left the old remote-tracking ref unchanged; an explicit branch-to-tracking fetch reconciled it. `git diff --check` passes. No dependency versions or lockfile were changed.

## Root causes and resulting behavior

1. Quantitative planning adapters requested attributes without polygon geometry and joined returned values, so touching neighbouring FSR polygons appeared as `1:1 / 0.45:1`. FSR, height and lot controls now use complete parcel intersections, grouped polygon union, actual coverage, source instruments/provisions and bounded geometry validation. One supported control has a clear value; genuine splits/conflicts have measured separate evidence and no automatic numeric entitlement. All source records, IDs, geometries and timestamps survive the audit.
2. A direct official address lookup exhausted1200ms before fallback, including warm repeats. Complete exact-selection identities now have isolated bounded positive caching with original source times. A350ms delayed hedge overlaps geocoding/strict official spatial matching with a slow direct lookup. Direct incomplete/ambiguous evidence still vetoes fallback. Fast direct results avoid geocoding. Errors never become positive identity proof.
3. Fixed renovation packages ignored glazing/shared-finish/opening quantities and relocations; a blanket structural multiplier obscured scope. Editable quantities, extra project allowances, access, GST and incremental contingency now have an explicit ledger and scope classification. Major reconstruction needs project-specific pricing. Ordinary packages and addition/development baselines remain; no arbitrary universal cost uplift or invented QS rate was applied.

Independent review also reproduced and corrected cross-layer instrument mismatch, unresolved height/lot shown as mapped absence, and optional structured-address-field crashes. Final retry tests prevent missing requested control geometry from poisoning positive caches. A browser-console404 was traced to the default favicon request and removed with an explicit empty icon; assertions were retained.

## Verified official parcel and statutory evidence

Current official captures are retained with complete query URLs, retrieval timestamps, source currency fields and raw geometry in `qa/fixtures/parcel-controls/`.

- **61New Street West, Balgowlah Heights2093:** official address72720191; cadid102197818; Lot15 SectionB DP2044 (`15/B/DP2044`). FSR OBJECTID163928, Manly LEP2013 clause4.4, **0.45:1**. Adjacent commercial FSR OBJECTID163847, **1:1**, intersects only **0.0015251245m²** in the independently captured EPSG28356 geometry. Residential FSR covers700.7389209955m² of the700.7404461200m² projected parcel. The contact remains visible and is excluded from automatic capacity. It does not convey commercial rights.
- Zoning OBJECTID810963 isR2; adjacent OBJECTID751700 isE1. The approximately0.001872m² E1 contact remains boundary-review evidence. Height OBJECTID230996 gives8.5m, clause4.3; lot-size OBJECTID302300 gives500m², clause4.1. These mapped controls do not establish a building envelope, development consent or satisfaction of every eligibility requirement.
- **Actual independently queried adjoining commercial parcel:** cadid102197812, LotA DP306858 (`A//DP306858`),360.1840m², sharing15.43036m of mapped boundary. Its own FSR163847 covers360.1807m² and resolves **1:1**; E1 zoning covers approximately99.99915%. Its small0.45/R2 contacts are retained. No street address, common ownership or combined-site entitlement was inferred.
- A separate native-fetch live gate confirmed both founder properties with complete planning retrieval: New Street **0.45:1/R2** and59West Street **0.5:1/R1**. West Street's exact official address9909469/cadid100107014 identifies `13/2/DP2072`.

Projected MGA area700.7404m² and the geographic/local-ellipsoid calculation approximately700.8529m² use different measurement frames. Both remain indicative GIS area; no registered survey/plan area was asserted or substituted. Source currency dates can predate retrieval and are not rewritten as2026 legislative validation.

## Numerical and mapping precision

The founder correctly queried whether Nield's microscopic gap should constitute a material conflict. Independent current queries returned approximately **0.0005375240m²** uncovered in the geographic frame and **0.0005374545m²** in EPSG28356. Agreement shows a tiny source boundary mismatch, rather than simply JavaScript cancellation.

The quantitative resolver applies a configurable threshold capped at **min(0.01m², parcel area×0.00001)**; callers may tighten it. Microgaps/contacts remain measured, flagged `mappingUncertainty`, and displayed **Indicative**. Unsupported area is excluded from automatic capacity. This is a conservative engineering policy tested against actual/synthetic boundaries, **not** a claimed NSW statutory exemption, source accuracy specification or licence to move a boundary. Significant gaps, contradictory overlap, different instruments/provisions, unknown geometry and genuine splits still block unsupported capacity. Hazard/heritage logic is unchanged and does not use this tolerance.

The engine handles same-datum compatible geographic/projected conversions, holes, multipart geometry and unions without repairing invalid rings. Unsupported datum shifts, ambiguous multi-parcel/strata scope, curves and geometry exceeding the5000-vertex/4million edge-pair work budget remain review cases. No universal NSW cadastral coverage is claimed.

## Performance evidence

Controlled cold/warm replay uses identical captured payloads and transport latencies against approved HEAD versus this working tree. Values below are **elapsed milliseconds from start**, not live-service percentiles. Added geometry validation retains the initial-summary budget; the cold replay still issues42upstream calls and warm replay0. Runtime variation prevents attributing small changes to an optimisation.

| Mode | Milestone | Before ms | After ms |
| --- | --- | ---: | ---: |
| cold | autocomplete | 122.1 | 125.8 |
| cold | identity | 376.9 | 389.0 |
| cold | parcel | 680.0 | 691.6 |
| cold | core | 1124.8 | 1218.6 |
| cold | frontage | 1138.5 | 1222.4 |
| cold | complete | 2288.2 | 2306.5 |
| warm | autocomplete | 0.1 | 0.1 |
| warm | identity | 1.0 | 0.3 |
| warm | parcel | 1.2 | 0.4 |
| warm | core | 28.4 | 33.9 |
| warm | frontage | 28.4 | 33.9 |
| warm | complete | 28.7 | 34.8 |

Measured address live quantiles used fresh API instances, five cold attempts per set, nearest-rank quantiles; successful-only identity quantiles are explicitly separated from failed attempts. These experiments used actual HTTP through a curl-backed transport with existing deadlines/retries. They are not browser/CI measurements.

| Property / measure | Before | After |
| --- | ---: | ---: |
| New Street successful cold identity p50/p95 |2511.0 /2908.4ms (5successes)|1383.1 /2370.9ms (4successes)|
| New Street all-attempt autocomplete+identity p50/p95 |2868.2 /3239.7ms|2010.2 /7056.4ms, including one timeout|
| New Street positive warm identity |1204.7ms,1redundant request|0.2ms,0requests|
| West Street successful cold identity p50/p95 |2104.5 /2756.2ms|1774.4 /2592.6ms|
| West Street all-attempt total p50/p95 |2556.4 /7525.8ms|2116.8 /7221.4ms|
| West Street confirmed cold attempts |4/5|4/5|
| West Street separately primed positive warm identity |baseline repeated failed direct query1204.9ms|0.1ms,0requests|

A current West Street repeat immediately after a failed cold attempt required2342.5ms and two requests to recover; it was not a positive-cache hit. Cold measurements vary with upstream conditions; they do not establish improved availability or a causal NSW-wide percentile reduction.

One full current New Street curl-transport request delivered identity2106.0ms, parcel2907.0ms, core3792.3ms, frontage4068.5ms and final evidence8011.9ms. Thus the3second usable-core target was **not met in that live sample**, while the controlled target passed. The slowest supplementary SEPP identify took5029.9ms and did not withhold earlier information. Full native-fetch gate totals were8363.6ms/New Street and6951.3ms/West Street; those are individual observations, not percentile estimates.

## Renovation calibration and preserved founder costs

Founder-confirmed baselines pass permanent UI/model regressions:

- Eight premium/normal/region1 renovation components, two bathrooms: **$213600 midpoint**, unchanged; low/high$124800/$362400. Replacement/layout extent is inferred from arithmetic, because the screenshot did not independently show the dropdown.
-59West Street extension: **132m² →$1319095**, unchanged.
-57Griffiths Street additional level: **108m² →$1190752**, unchanged apart from normal floating-point currency representation.

Glazing area, shared finishes, structural openings and service relocations now change actual scope. Extra preliminaries, consultants, statutory approvals, demolition and adverse conditions are adjustable. Original gross packages retain their opaque included GST/ordinary room contingency; there is no invented rebase or second GST. Extra GST is charged once only on separately identified taxable extras, with entered extra contingency applying only to incremental ex-GST scope. Ordinary structural engineering, support, local demolition and making good are included in the opening package once. Major reconstruction is review-only.

A deliberately specified synthetic heavier scope produces$422451 midpoint instead of indiscriminately inflating the founder baseline; its complete quantities and reconciled ledger are in the calibration report. It is an internal scenario, not an observed founder selection or quote. Individual window specifications, condition assessment, engineering and actual trade sequencing still require measured project pricing.

Fresh BMT/RLB/Rawlinsons/ABS/industry-provider retrievals were blocked by proxy CONNECT403. Existing12October public building comparators are context only; licensed tables were not obtained or invented. **No fresh independently verified renovation QS tariff is claimed.** The credible additional-level baseline and development finance remain intact; the older addition model's GST basis still needs quote/inclusion confirmation.

## Final tests and earlier failures

- **Full `npm test`: PASS, exit0**, final log`/tmp/sitepivot-nsw-20261017/npm-test-release-candidate.log`. Includes ownership, address completeness/direction, reliability, premium/development, household finance, residential, property/planning, consumer/conversation/voice, mobile navigation and full journeys. Node test-runner sub-suites reported11+4+31+48+17+2passed, zero failed/skipped; other scripts use their own assertions rather than a unified test count.
- **48new focused tests PASS**, independently rerun: parcel-control, address recovery, direct Pages identity/retry, renovation model/UI and quantitative-control UI. **31existing planning-refresh/progressive/performance tests PASS** within the full suite. No skipped tests in either group.
- **Security PASS, exit0:** migration/packaging guard, API-origin/destination contracts and secret-scanner regression. **Server reliability PASS**; founder-server host/origin/file allowlist and icon regression PASS.
- **48additional Chromium cases PASS across13browser scripts:** P0identity8; founder repair4; ownership4; property intelligence3; conversation4; voice1; FSR/buyer4; captured duplex6; residential2; financial2; live premium2; live P0founder6; live Waratah buyer2. A temporary external harness selected system Chromium from the existing dual-engine loops; journey assertions were retained. WebKit was not relabelled as Chromium or counted as passed. Full npm also ran its ordinary Chromium journeys and390/393navigation coverage.
- **Native live parcel gate PASS,2/2**, after enabling the existing proxy using supported Node24 `NODE_USE_ENV_PROXY=1`. No substituted transport, TLS weakening or matching exception. Initial native calls without that setting timed out; those failed observations remain recorded.
- **Broader live server-data QA PASS-WITH-NEEDS-REVIEW, exit0:**11confirmed identities,2conservative official-range review outcomes,0failed identities;6confirmed planning cases and2withheld planning cases.49Mann/Gosford and2Civic/Katoomba were not substituted; Dixon Street strata parcel remains unresolved. API/failure contracts passed. Mixed-case p95 identity1886ms exceeds1500ms target; p95 suggestions490ms meets500ms target. This is not full planning/parcel verification for everycase.
- **WebKit UNAVAILABLE:** browserv2336 downloaded, but the attempted mobile test failed at launch due missingGTK4/Graphene/Harfbuzz-ICU/Manette/Hyphen/GLES libraries. `playwright install-deps webkit` could not authenticate asroot (`su: Authentication failure`); rootless apt could not access usable package indexes. One attempted WebKit test failed environmentally; remaining WebKit journeys were unrun. No WebKit pass is asserted.
- **Unpublished candidate GitHub Actions and deployed-site tests: NOT RUN.** Existing approved-commit server/consumer Actions passed, while its live run39017063633 failed; none is evidence for this new working tree.

Expected RED regressions were recorded before their fixes: original FSR contact, address scheduling/cache, renovation quantities, instrument/UI/optional-address issues, missing-geometry retry and favicon. Intermediate full-suite failures from synthetic attribute-only FSR fixtures, an extracted-function provenance dependency and an accidental completion timing reference were corrected and covered by subsequent passing checks. The original ownership console404 and premium live lookup failure passed after their diagnosed icon/proxy corrections. No timeout or force-click increase was used to hide defects.

## Environment and release gates

The supported proxy setting was verified per command and saved as an additive onboarding environment-variable draft. Saving returned`status:saved`, `requires_publish:true`; it does not publish an environment or verify a future restored machine. No existing network allowlist was replaced. System Chromium was used via a temporary runtime launch override. WebKit needs a suitably provisioned runner.

Before public founder testing: obtain founder approval for the exact reviewed candidate; separate validation from any branch push that could update Pages; run the same candidate through GitHub consumer Chromium+WebKit, server/live NSW and security workflows; inspect range/parcel NeedsReview outcomes rather than converting them to passes. The existing staging-preview workflow builds an artifact without deploying. Only after required checks and founder approval should the exact validated SHA update the founder-testing site, followed by deployed-build and real address/report checks. Do not merge main, activate paid services or assume a push is protected by CI before Pages updates.

**Final recommendation: GO for local review/controlled validation handoff; NO-GO for public release pending WebKit/candidate GitHub/deployed verification and explicit founder approval.** Registered survey/plan, site-specific statutory provisions, hazard/heritage certificates, design footprint and project QS/builder/lender verification remain professional requirements, not implied approvals from indicative modelling.

## Exact affected files

- `.github/workflows/sitepivot-server-qa.yml`
- `api/_lib/sitepivot.js`
- `commercial-engine.js`
- `conversation.js`
- `fsr-evidence.js`
- `index.html`
- `package.json`
- `planning-intelligence.js`
- `property-evidence.js`
- `qa/duplex-opportunity-ui.cjs`
- `qa/fixtures/zoning-evidence/eileen.json`
- `qa/fixtures/zoning-evidence/nield.json`
- `qa/fixtures/zoning-evidence/violet.json`
- `qa/founder-server-regression.cjs`
- `qa/founder-ui-regression.cjs`
- `qa/fsr-area-ui.cjs`
- `qa/fsr-buyer-browser.cjs`
- `qa/intake-ui-regression.cjs`
- `qa/progressive-planning-regression.cjs`
- `qa/property-planning-stream.cjs`
- `qa/residential-fsr-regression.cjs`
- `qa/residential-zoning-regression.cjs`
- `qa/waratah-ui-regression.cjs`
- `zoning-evidence.js`
- `docs/address-reliability-2026-10-17.md`
- `docs/independent-nsw-review-2026-10-17.md`
- `docs/nsw-spatial-address-cost-report-2026-10-17.md`
- `docs/renovation-calibration-2026-10-17.md`
- `docs/superpowers/plans/2026-10-17-nsw-spatial-address-cost.md`
- `qa/address-identity-recovery.cjs`
- `qa/browser-identity-recovery.cjs`
- `qa/fixtures/parcel-controls/adjoining-commercial.json`
- `qa/fixtures/parcel-controls/new-street-west.json`
- `qa/fixtures/parcel-controls/nield-precision.json`
- `qa/live-parcel-controls.cjs`
- `qa/parcel-controls-regression.cjs`
- `qa/quantitative-control-ui.cjs`
- `qa/renovation-scope-calibration.cjs`
- `qa/renovation-scope-ui.cjs`

Supporting reports: `docs/address-reliability-2026-10-17.md`, `docs/renovation-calibration-2026-10-17.md`, `docs/independent-nsw-review-2026-10-17.md`. Full captured statutory fixtures remain available; temporary test logs are not assumed to survive a new environment.
