# Address identity reliability — 17 October 2026

## Verified defect

Five fresh server API runs for `61 new street wes` selected the ArcGIS suggestion for Balgowlah Heights and confirmed the official `61 NEW ST WEST, BALGOWLAH HEIGHTS NSW 2093`, address ID `72720191`, cadid `102197818`. Each direct nonspatial official lookup exhausted its 1,200 ms deadline before geocoding and the spatial official lookup began. A warm repeat reused successful geocoder/spatial responses but still waited another 1,200 ms for the failed direct strategy. This is an address retrieval scheduling/cache defect, not evidence that the official address is absent.

Live layer metadata reports indexes on `objectid` and `shape`, with no advertised index on the civic-number/street/postcode filter. Increasing the direct deadline to 2,500 ms in a temporary in-memory source experiment caused all five direct lookups to time out again and increased the observed identity latency. That experiment was discarded; it does not justify extending the deadline.

Metadata also reports `streetnumber1`, `streetnumber2` and `streetsuffix`; it does **not** report `streetnumbersuffix1` or `streetnumbersuffix2`. An initial hypothesis based on a synthetic split-number fixture was withdrawn before delivery. No suffix-field additions or numeric-only candidate change should be inferred from that fixture.

## Actual live measurements

Recorded at 10:40–10:41 UTC on 17 October 2026. The real server implementation ran with a curl-backed fetch transport through the configured environment proxy, preserving HTTP methods, production deadline timers, retries and response caching. Native Node fetch separately failed after 9,704 ms with `Upstream request timed out`; it did not produce a confirmed identity sample. These are transport-specific engineering measurements, not browser or CI latency claims.

Each cold sample used a newly loaded API instance. Quantiles use nearest rank; with five samples p95 equals the maximum. All five samples in each experiment confirmed the expected stable address and parcel IDs. The warm sample is separate and is not included in cold quantiles.

| Sample | Baseline suggest ms | Baseline identity ms | Baseline total ms | Experimental 2,500 ms identity ms |
| --- | ---: | ---: | ---: | ---: |
| 1 | 330.9 | 2908.4 | 3239.7 | 4073.6 |
| 2 | 342.2 | 2650.6 | 2993.1 | 3489.9 |
| 3 | 357.2 | 2511.0 | 2868.2 | 3226.2 |
| 4 | 337.0 | 2162.0 | 2499.0 | 3861.0 |
| 5 | 164.7 | 2443.8 | 2608.5 | 2978.7 |
| p50 | 337.0 | 2511.0 | 2868.2 | 3489.9 |
| p95 | 357.2 | 2908.4 | 3239.7 | 4073.6 |

Baseline warm repeat: suggestion 0.1 ms; identity 1,204.7 ms; one redundant direct upstream request. Experimental warm repeat: identity 2,508.8 ms. These sequential samples experience changing source latency and do not isolate every cause of timing differences. They do show the full direct budget was wasted before fallback in every observed cold sample and the warm repeats.

Raw current-session diagnostics are `/tmp/sitepivot-address-live-results.json` and `/tmp/sitepivot-address-live-2500-results.json`; they are temporary, not durable repository artifacts. The measured sample values needed to assess this report are retained above.

## Required behavior and regression evidence

`node --test qa/address-identity-recovery.cjs` initially produced three expected failures and one passing safeguard:

- Repeating the exact confirmed fallback identity made four upstream requests cumulatively instead of retaining the first three.
- While the direct request remained held, the geocoder and strict spatial fallback had not started.
- The incomplete/ambiguous direct-evidence test could not establish an already completed fallback, because no overlap existed.
- Caller mutation isolation and changed-unit rejection already passed and remain safeguards.

The intended correction is a short positive memo for the complete verified identity keyed by the exact selected text, requested text and magic key, with isolated result objects; and bounded overlapping fallback after a slow direct request. The direct lookup must still settle before fallback is accepted. Incomplete or ambiguous direct evidence must veto the result even if the spatial fallback has already succeeded. Fast successful direct lookups must continue to avoid geocoding. No error or unverified identity may become a positive memo entry.

After root implemented the exact positive memo and 350 ms delayed fallback, `node --test qa/address-identity-recovery.cjs` passed all four tests. The mutation test additionally requires a dated authoritative source check and the identical `checkedAt` value on memo reuse. The focused address/direction/P0/dedup and nine existing property-performance tests also passed during investigation before the new recovery behavior was implemented; broader final integration validation belongs to the root task.

## Current implementation live check

At 10:49 UTC, the same live transport, source query and five-fresh-instance/one-warm procedure exercised the corrected server implementation. The 1,200 ms direct budget remained unchanged; the geocoder and strict spatial fallback now overlapped the slow direct request. Four cold attempts confirmed the same stable official IDs. One spatial official request exhausted its existing 6,000 ms deadline and remained a failure.

| Cold sample | Suggest ms | Identity ms | Total ms | Result |
| --- | ---: | ---: | ---: | --- |
| 1 | 385.4 | 2370.9 | 2756.6 | Confirmed expected address/parcel |
| 2 | 358.3 | unavailable: timeout | 7056.4 | Spatial official request timed out at 6000.3 ms |
| 3 | 340.6 | 1383.1 | 1723.7 | Confirmed expected address/parcel |
| 4 | 170.0 | 1201.5 | 1371.5 | Confirmed expected address/parcel |
| 5 | 188.9 | 1821.3 | 2010.2 | Confirmed expected address/parcel |

Successful-only identity latency (n=4, nearest rank): p50 **1,383.1 ms**, p95 **2,370.9 ms**. Across **all five attempts**, including the failure, total elapsed p50 was **2,010.2 ms**, p95 **7,056.4 ms**. Successful-only percentiles are not availability metrics and must not hide the timeout or be presented as an all-attempt p95.

The warm repeat after cold sample 1 took **0.2 ms identity / 0.3 ms total**, issued **zero HTTP requests**, and retained the selected official identity. The earlier baseline warm repeat took 1,204.7 ms and issued a redundant failed direct request. This verifies the memo eliminates that repeated work; the small sequential cold samples do not prove a causal percentile improvement or NSW-wide reliability. Current raw diagnostics: `/tmp/sitepivot-address-live-hedge-results.json` (temporary).

A separate single end-to-end check began at **10:50:17.463 UTC**, resolving the full New Street West address and then calling `planningFor()` with the same curl proxy transport. Identity completed in **2,106.0 ms**, retaining authoritative source `checkedAt` **10:50:19.563 UTC**. Progressive parcel/core/frontage events arrived at **2,907.0 / 3,792.3 / 4,068.5 ms** from the start; final completion took **8,011.9 ms**. Final planning had no failed keys and returned R2 Low Density Residential, FSR **0.45:1**, Manly Local Environmental Plan 2013. Parcel geometry resolved; its **700.8529 m²** area remained explicitly indicative/GIS-calculated, with no registered plan area asserted. The parcel query took **796.9 ms**; the longest supplementary request, SEPP identify, took **5,029.9 ms**. This verifies the actual property-to-planning transport path for one request, not a full-planning latency distribution or a separate geometry-transport comparison. Diagnostic: `/tmp/sitepivot-address-live-planning-result.json` (temporary).

## Existing CI and limits

Public GitHub Actions HTML showed [server QA 39017063639](https://github.com/BoggedCake/ProjectIQ/actions/runs/39017063639) and [consumer QA 39017063631](https://github.com/BoggedCake/ProjectIQ/actions/runs/39017063631) completed successfully for commit `485432cae73dc86cb0577f36c89c43272b347e55`. [Live QA 39017063633](https://github.com/BoggedCake/ProjectIQ/actions/runs/39017063633) changed from in progress to **Failure** during this investigation; its failure cause and sample metrics were not available from the run summary alone. It must not be reported as passing or silently omitted.

The founder subsequently identified the distinct West Street case as **59 West Street, Balgowlah**; its independent results are below. These finite property samples establish neither NSW-wide address coverage nor permanent source availability. No whole thirteen-case live suite was rerun here.

## Founder case: 59 West Street, Balgowlah

At **10:54–10:55 UTC**, five cold autocomplete-to-identity attempts and one immediate warm repeat ran against the current API, followed by the same procedure loading baseline revision `485432cae73dc86cb0577f36c89c43272b347e55`. Both used actual live HTTP through the same curl proxy transport, complete requested text `59 West Street Balgowlah NSW 2093`, and newly loaded API instances for cold attempts. Every successful resolution strictly confirmed **59 WEST ST, BALGOWLAH NSW 2093**, official address ID **9909469**, cadastral parcel **100107014**, identifier **13/2/DP2072**. This is a separate address from 61 New Street West.

| Cold sample | Current identity ms | Current total ms | Baseline identity ms | Baseline total ms |
| --- | ---: | ---: | ---: | ---: |
| 1 | unavailable: timeout | 7221.4 | 1973.0 | 2284.0 |
| 2 | 2592.6 | 2910.8 | unavailable: timeout | 7525.8 |
| 3 | 1694.7 | 2054.2 | 2756.2 | 2940.0 |
| 4 | 1835.8 | 2116.8 | 2104.5 | 2290.4 |
| 5 | 1774.4 | 2032.0 | 2343.5 | 2556.4 |

Each five-cold set confirmed **4/5**, retaining its spatial official request timeout as a failure. Current successful-only identity p50/p95 (n=4, nearest rank) were **1,774.4 / 2,592.6 ms**; baseline **2,104.5 / 2,756.2 ms**. Across **all five attempts**, current total p50/p95 were **2,116.8 / 7,221.4 ms**; baseline **2,556.4 / 7,525.8 ms**. Suggestion p50/p95 across all five were current **318.0 / 400.0 ms**, baseline **185.7 / 310.3 ms**. Sequential live samples vary; these differences do not isolate a causal speed improvement or demonstrate an availability improvement.

The current set's immediate repeat followed a failed first cold attempt, so it was a recovery attempt, **not** a positive-cache measurement: identity **2,342.5 ms**, two official requests, successful strict confirmation. Baseline's repeat followed a successful cold attempt and still took **1,204.9 ms** with one redundant direct request. A separately labelled current positive-cache check then primed the same exact selection successfully in **2,010.0 ms** and repeated it in **0.1 ms**, **zero HTTP requests**, preserving authoritative `checkedAt` **2026-10-17T10:55:35.543Z** exactly. That extra priming request is excluded from both five-cold distributions.

Temporary diagnostics: `/tmp/sitepivot-west-street-live-results.json`, `/tmp/sitepivot-west-street-baseline-results.json`, and `/tmp/sitepivot-west-positive-warm.json`. No address matching rule was weakened and neither timeout was replaced by another address.

## Independently verified adjoining commercial parcel

At **10:52 UTC**, a bounded current-source check queried cadastral parcels intersecting or within 5 m of the subject's EPSG:28356 parcel polygon. Six parcels returned. A separate exact-cadid query then independently confirmed neighbouring parcel **102197812**, cadastral identifier **A//DP306858** (lot A, DP306858), alongside separate official FSR and zoning queries using that neighbour's actual polygon. All raw responses, complete source URLs and individual retrieval timestamps are retained in `qa/fixtures/parcel-controls/adjoining-commercial.json`; no address was inferred.

The neighbour shares an exact mapped cadastral boundary segment of **15.43036 m** with subject cadid **102197818**, **15/B/DP2044**. Its measured parcel area is **360.1840 m²**. Official Manly LEP 2013 FSR polygon OBJECTID **163847** covers **360.1807 m²**, approximately **99.99908%**, and resolves to mapped **1:1 FSR**. The neighbouring 0.45 polygon's **0.00331 m²** contact is retained as negligible map-boundary contact. The independent zoning capture identifies **E1 Local Centre** polygon OBJECTID **751700** across approximately **99.99915%**; a **0.00305 m²** R2 contact remains explicitly under boundary review. These small cartographic contacts do not establish a substantive split development control or a surveyed boundary.

A direct production-model verification asserted the exact independent cadid, mapped `1:1` FSR, E1 primary zoning, an actual shared segment longer than 15 m, and absent inferred street address. The subject remains its separately verified cadastral parcel with mapped **0.45:1 FSR**. Commercial controls on lot A do not transfer to the subject, and this check establishes neither common ownership nor any combined-site entitlement.

## Final native-fetch environment correction and broader live gate

At11:07UTC the production native Node24 fetch path was retested with the supported `NODE_USE_ENV_PROXY=1` setting. This uses the existing configured HTTPS proxy and normal TLS verification; it does not replace fetch with curl, alter identity matching or bypass the proxy. `node qa/live-parcel-controls.cjs` then exited0: **two live properties passed**, complete planning source queries, exact authoritative IDs and parcel matches. New Street returned0.45:1/R2 in8363.6ms total;59West Street returned0.5:1/R1 in6951.3ms total. These are individual full-retrieval samples, not new p50/p95 distributions. Original unconfigured native-fetch timeouts above remain part of the observed history.

With the same setting, `node qa/serverless-smoke.cjs` exited0, reporting **pass-with-needs-review**:11confirmed identities,2identity review outcomes,0transport/identity failures,6confirmed planning cases and2withheld planning cases.49Mann Street/Gosford and2Civic Place/Katoomba returned official address ranges that were conservatively withheld; no nearby property was substituted. The Dixon Street unit's address confirmed but its parcel remained unresolved. Its partial planning is not a verified parcel result. The suite's p95 identity1886ms remains above its1500ms engineering target; p95 suggestions490ms met its500ms target. These are a mixed-property sample, not repeated cold quantiles for either founder address.

Native live output is in ignored `qa-artifacts/nsw-spatial/live-controls.json`; full server QA output was captured at `/tmp/sitepivot-nsw-20261017/server-data-live-proxy.log`. The additive onboarding environment-variable draft was saved successfully for `NODE_USE_ENV_PROXY=1`, with publication required. Per-command runtime behavior is verified; a newly published/restored environment is not asserted.
