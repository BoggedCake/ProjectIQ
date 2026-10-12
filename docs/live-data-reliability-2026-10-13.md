# Live data reliability and QA stabilisation — 13 October 2026

Baseline: 3c81da9b5f7e463f2d4850bf04e21ea3f607c83e, sitepivot-concept. Existing founder testing: https://boggedcake.github.io/ProjectIQ/.

## Recovered failures

Previous live run38241771835 recorded an aborted/timed-out Gosford49Mann Street government request and a Fairlight393px identity-view timeout. The earlier attempt had a Fairlight390px WebKit identity timeout; zoning failed once and resolved on later runs. These logs establish transient retrieval failures, not a permanently unavailable service or a wrong zoning fact. The old client aborted fetch after2.5seconds regardless of the larger operation budget, then spent the remainder on JSONP. It had no classified HTTP retry, transport cancellation on property changes or terminal identity readiness contract. Thus an upstream delay could become a frontend view timeout with little diagnostic evidence. There is no evidence that WebKit alone caused the government outage.

Two browser waits passed timeout options as the predicate argument, so intended readiness deadlines were not used. Conversation selected the first suggestion without requiring the requested address. Tests could confirm dwelling fields while planning was still rerendering. The previous manual double-click observation remains an observed timing issue, not a proven broken confirmation handler: existing and new state tests confirm profile and draft preservation. Tests now await planning completion before editing; the consumer may still confirm while planning loads.

## Repairs

Existing client/server request adapters remain in use. Read-only spatial operations retry recognized transient HTTP408/429/500/502/503/504 or transport failures at most3times, using exponential backoff and jitter within the original overall request deadline. Ordinary4xx, invalid ArcGIS queries, deliberate cancellation and unclassified errors are not retried. A slow valid fetch can use its original full budget; the fixed2.5second cutoff is removed. Hard deadlines cover fetch and response bodies. JSONP callbacks remain harmless after cancellation/timeouts; scripts are removed and deliberate cancellation cannot fall back or retry.

Property and suggestion operations own AbortControllers. Property switching/reset invalidates request sequences and cancels transports. Signal propagation covers geocoding, authoritative identity, parcels and planning layers. Old responses cannot replace a newer property. Fast suggestions retain their existing2800ms budget and280ms input debounce.

Client complete-response cache:120seconds, at most160entries, exact URL/query key including coordinates, parcel identifiers and layer. Server cache:120seconds,256entries and8MiB. No stale-while-revalidate, permanent storage or substitution from another parcel. Failed/malformed/truncated evidence and empty geocoder suggestions/candidates are not cached; complete empty spatial arrays are legitimate negative results. Cached evidence retains its actual source retrieval timestamp; per-control sourceChecks and zoning/FSR provenance carry it. Client cached responses are cloned so consumers cannot mutate evidence. Suggestion cache is bounded50entries/120seconds.

Identity readiness distinguishes loading/verified/unavailable and carries a bounded lifecycle deadline. Confirmed property details survive planning failures. The passport distinguishes loading, failed sources and completed mapped checks; it offers an explicit planning retry. Failed identity offers its own retry. Full planning refresh failure clears prior planning controls/evidence, so stale successful zoning cannot reopen preliminary financial gates. Confirmed homeowner profile and property/financial inputs are retained. Unknown controls remain unknown, not unmapped. Malformed HTTP200identify responses do not become a completed negative SEPP/local check.

Browser QA waits terminal application state before asserting views, selects the requested address and records redacted service/status/outcome/timing diagnostics. It preserves every factual, financial and performance assertion. External unavailable results remain failed live checks, separately identified from a frontend lifecycle that fails to settle. No repeated whole-test retry is introduced by this repair.

## Verification before deployment

Fail-first regressions reproduced transient HTTP failure, empty suggestion poisoning, missing cancellation, absent outage recovery and stale planning reopening feasibility. Independent review identified stale gating, malformed identify and server negative geocoder caching; all were fixed and rechecked. New request regressions cover hanging transports, cache isolation/source time, permanent failure/no retry, cancellation and bounded cache. Existing zoning fixture assertions remain unchanged; isolated VM fixtures were supplied the new cache/helper dependency rather than weakening assertions.

Local full unit/integration suite passed; security preparation and founder asset packaging passed. Full npm test reached browser launch after successful unit checks but could not launch because installed Chromium/WebKit binaries are absent from this executor. No local browser pass is claimed. Existing GitHub Actions install both browser engines and run the complete consumer/server/security and deployed real-property suites. Deployment/Actions results will be reported against the pushed commit.

No commercial/cost/mortgage/planning eligibility/voice feature redesign, main merge, hosting/visibility change, paid service or external communication. Permanent government service reliability and physical iPhone audio are not claimed.
