# Live data reliability and QA stabilisation — 13 October 2026

Baseline: 3c81da9b5f7e463f2d4850bf04e21ea3f607c83e, sitepivot-concept. Existing founder testing: https://boggedcake.github.io/ProjectIQ/.

## Recovered failures

Previous live run38241771835 recorded an aborted/timed-out Gosford49Mann Street government request and a Fairlight393px identity-view timeout. The earlier attempt had a Fairlight390px WebKit identity timeout; zoning failed once and resolved on later runs. These logs establish transient retrieval failures, not a permanently unavailable service or a wrong zoning fact. The old client aborted fetch after2.5seconds regardless of the larger operation budget, then spent the remainder on JSONP. It had no classified HTTP retry, transport cancellation on property changes or terminal identity readiness contract. Thus an upstream delay could become a frontend view timeout with little diagnostic evidence. There is no evidence that WebKit alone caused the government outage.

Two browser waits passed timeout options as the predicate argument, so intended readiness deadlines were not used. Conversation selected the first suggestion without requiring the requested address. Tests could confirm dwelling fields while planning was still rerendering. The previous manual double-click observation remains an observed timing issue, not a proven broken confirmation handler: existing and new state tests confirm profile and draft preservation. Tests now await planning completion before editing; the consumer may still confirm while planning loads.

## Repairs

Existing client/server request adapters remain in use. Read-only spatial operations retry recognized transient HTTP408/429/500/502/503/504 or transport failures at most3times, using exponential backoff and jitter within the original overall request deadline. Ordinary4xx, invalid ArcGIS queries, deliberate cancellation and unclassified errors are not retried. A slow valid fetch can use its original full budget; the fixed2.5second cutoff is removed. Hard deadlines cover fetch and response bodies. JSONP callbacks remain harmless after cancellation/timeouts; scripts are removed and deliberate cancellation cannot fall back or retry.

Property and suggestion operations own AbortControllers. Property switching/reset invalidates request sequences and cancels transports. Signal propagation covers geocoding, authoritative identity, parcels and planning layers. Old responses cannot replace a newer property. Fast suggestions retain their existing2800ms budget and280ms input debounce.

Client complete-response cache:120seconds, at most160entries, exact URL/query key including coordinates, parcel identifiers and layer. Server cache:120seconds,256entries and8MiB. No stale-while-revalidate, permanent storage or substitution from another parcel. Failed/malformed/truncated evidence and empty geocoder suggestions/candidates are not cached; complete empty spatial arrays are legitimate negative results. Cached evidence retains its actual source retrieval timestamp; per-control sourceChecks and zoning/FSR provenance carry it. Client cached responses are cloned so consumers cannot mutate evidence. Suggestion cache is bounded50entries/120seconds.

Identity readiness distinguishes loading/verified/unavailable and carries a bounded lifecycle deadline. Confirmed property details survive planning failures. The passport distinguishes loading, failed sources and completed mapped checks; it offers an explicit planning retry. Failed identity offers its own retry. Full planning refresh failure clears prior planning controls/evidence, so stale successful zoning cannot reopen preliminary financial gates. Confirmed homeowner profile and property/financial inputs are retained. Unknown controls remain unknown, not unmapped. An identified address with unresolved parcel geometry is explicitly partial, retains unknown site area/parcel-based FSR and offers retry; point-based checks are not labelled complete parcel analysis. Malformed HTTP200identify responses do not become a completed negative SEPP/local check.

Browser QA waits terminal application state before asserting views, selects the requested address and records redacted service/status/outcome/timing diagnostics. It preserves every factual, financial and performance assertion. External unavailable results remain failed live checks, separately identified from a frontend lifecycle that fails to settle. No repeated whole-test retry is introduced by this repair.

## Verification before deployment

Fail-first regressions reproduced transient HTTP failure, empty suggestion poisoning, missing cancellation, absent outage recovery and stale planning reopening feasibility. Independent review identified stale gating, malformed identify and server negative geocoder caching; all were fixed and rechecked. New request regressions cover hanging transports, cache isolation/source time, permanent failure/no retry, cancellation and bounded cache. Existing zoning fixture assertions remain unchanged; isolated VM fixtures were supplied the new cache/helper dependency rather than weakening assertions.

Local full unit/integration suite passed; security preparation and founder asset packaging passed. Full npm test reached browser launch after successful unit checks but could not launch because installed Chromium/WebKit binaries are absent from this executor. No local browser pass is claimed. Existing GitHub Actions install both browser engines and run the complete consumer/server/security and deployed real-property suites. Deployment/Actions results will be reported against the pushed commit.

No commercial/cost/mortgage/planning eligibility/voice feature redesign, main merge, hosting/visibility change, paid service or external communication. Permanent government service reliability and physical iPhone audio are not claimed.

## Deployed verification and follow-up

Checkpoint4b4e451: full consumer regression342PASS/no failures; server-data QA, security preparation and Pages succeeded. Exact deployed/source parity passed. Live smoke and full desktop/iPhone founder journeys passed, including Gosford. All actual31Seaview premium cases passed across Chromium/WebKit390/1280. Full live QA remained red: Eileen Chromium voice390/393 zoning/SEPP/local-identify requests timed out at3800ms, Eileen desktop residential checks had unavailable zoning, Nield Chromium desktop zoning was unavailable, and one Eileen WebKit mobile response described unavailable zoning as an instrument conflict. The outage classification was an application defect: the common planning evaluator now handles failed zoning before conflict checks, always withholding feasibility. Client/server do not infer an instrument from unrelated layers when zoning fails. Remaining real residential/duplex tests now include the same redacted source diagnostics without weakening factual assertions. No unchanged retry-until-green was performed; cancelled intermediate runs were superseded by code commits.

Direct live Fairlight identified its authoritative address,415.2m² parcel, R1,FSR0.6:1 and preserved home entries; the retry recovered height8.5m after an unavailable check. Gosford resolved the official council-administration49–51Mann Street identity and Central Coast planning; it is an address-service regression, not a residential feasibility example. Direct Eileen withheld ordinary duplex costs and did not offer an irrelevant selling continuation. A batched cloud confirmation click needed repeating; inputs remained intact. Automated single-click confirmation checks passed. Physical-device confirmation/audio remains a founder acceptance check; no unproven handler change is claimed.

The repeated3800ms zoning/identify expiry, contrasted with successful existing6000ms server QA, justified aligning only the large zoning-geometry and identify requests with that existing six-second budget. Other planning queries keep3800ms and suggestions2800ms. Parcel plus parallel planning still fits the existing20second readiness deadline; no browser assertion deadline was raised. A deterministic4.2second zoning response failed under the old budget and passes under the bounded six-second budget. Unknown zoning cannot be rescued by previously supported pathway evidence: an explicit unavailable context disables both financial and preliminary gates. Independent review and fail-first regression verified that safeguard.

A final recovery regression exposed client negative candidate caching and wrong-shape query caching. Both now use endpoint-specific response validation: nonempty geocoder arrays, identify results arrays and query features arrays. Empty spatial features remain legitimate, while failed identity and malformed evidence can be requested again immediately.

## Final code checkpoint and acceptance evidence

Tested application code: `28758a8c650523ab02719517f8318d9f43b32000`. Earlier repair commits: `490a061e3ab474a30628107b6c2dd2db3e76261f`, `4b4e451a4d047cc0c7ff3ab37c8624be462e12e3`, `ab7834a893451fe2f365a8d3ba3a859c1fe9663e`. Subsequent reporting-only commits do not change these tested application assets.

| Check | Final result | Evidence |
|---|---|---|
| Local unit/integration | Exit0;266PASS log results | Full suite, including fail-first outage, cancellation, cache recovery and eligibility regressions |
| Consumer regression | Success;347PASS, no failures | https://github.com/BoggedCake/ProjectIQ/actions/runs/38323399377 |
| Server data QA | Success | https://github.com/BoggedCake/ProjectIQ/actions/runs/38323399425 |
| Security preparation | Success | https://github.com/BoggedCake/ProjectIQ/actions/runs/38323399369 |
| Pages deployment | Success | https://github.com/BoggedCake/ProjectIQ/actions/runs/38323400148 |
| Deployed live QA | Failure: two source/transport timeout checks remain unresolved | https://github.com/BoggedCake/ProjectIQ/actions/runs/38323399424 |

The final live workflow verified exact parity of all nine deployed HTML/JavaScript assets with this code checkpoint. All16Eileen/Fairlight text/voice conversation cases passed, including both Chromium/WebKit at390/393px. All4actual residential cases passed; all12Violet/Nield/Eileen DA/CDC cases passed; all4Seaview premium cases passed at390/1280px. Financial fixtures, input retention, report parity, lifts/pools and arithmetic remain verified. No factual assertion was weakened. Intermediate cancelled runs were superseded by code changes; the red4b run remains recorded above.

The two unresolved checks are:

1. Smoke regional matrix: `84/2-8 Dixon Street Sydney NSW2000` returned a government-data timeout. Other regional cases, including49Mann Street Gosford, passed.
2. One390px Fairlight founder journey: geocoder suggestion and candidate requests succeeded, then the NSW Address Point query did not complete within5000ms. Diagnostics recorded status:null, outcome:timeout, elapsed:5001ms. The app reached terminal identity-unavailable state, with a retry action, rather than remaining stuck waiting for the property view. Other Fairlight viewports and every Fairlight Chromium/WebKit conversation case passed.

These establish unavailable live source/transport responses within the bounded deadline. They do not establish that the government service was globally down or distinguish provider internals from network/browser transport. No source fact or successful assessment was invented to make those checks pass. Full live QA is explicitly **not wholly green**. No unchanged retry-until-green was used. Recovering a source needs the visible retry action; current source availability remains an external dependency.

Actual final-release desktop interaction confirmed the revised planning-module cache tag, Fairlight identity/415.2m² parcel/R1/height8.5m/FSR0.6:1, retained3bed/2bath/1car inputs and single-click confirmation after checking the entered fields. Earlier batched cloud clicks are not evidence of a verified handler repair. Physical iPhone interaction/audio remains a founder check, distinct from automated WebKit tests.

Open the existing testing URL, refresh, select the exact address suggestion and confirm the property. Confirm home details, then ask the project question. If a source is unavailable, use Retry property check or Retry planning checks; missing essential evidence will continue withholding development feasibility. Eileen must not receive an achievable ordinary-duplex feasibility; Seaview conditional working scenarios retain the existing visible provisional assumptions. Gosford is a retrieval fixture for a council administration address, not a residential feasibility example.

No merge to main, repository/hosting change, paid service, credential change, commercial launch or external communication. Main remained `2e7f85d1c935ce0d0f5253b05471211c817e3e62` at final verification. No further founder permission is needed for completed routine repairs; physical-device acceptance and live-source availability remain outstanding.
