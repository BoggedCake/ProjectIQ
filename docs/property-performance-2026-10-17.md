# NSW address and planning retrieval performance — 17 October 2026

Base: `282a110becfe61bb3d7890e377664f5039e96ff1`, branch `sitepivot-concept`. Changes are scoped to property retrieval and its regression coverage.

## Method and limits

These are cumulative, single-run timings in milliseconds from calling autocomplete, excluding typing debounce and human selection time. The harness runs the actual server pipeline and the public-site browser pipeline (JSDOM) against captured Nield address, parcel, road, zoning, FSR, lot and height responses. Autocomplete/geocoder responses and supplementary empty responses are synthetic. Transport latency is controlled: autocomplete 120 ms, geocoder 450 ms, address register 250 ms, parcel 300 ms, each core control 400 ms, road 450 ms and each supplementary/council query 1,600 ms. Geometry validation, identity matching, area/frontage calculation and rendering still execute. These are reproducible scheduling benchmarks, not live upstream latency claims or production percentiles.

Before/after use identical inputs and latency settings. `--revision` loads historical server dependencies as well as its entry point. The legacy server had no partial-delivery events; parcel/core/frontage delivery is therefore its full-response time.

| Delivered milestone | Server before | Server after | Public-site browser before | Public-site browser after |
|---|---:|---:|---:|---:|
| Autocomplete | 122.2 | 122.5 | 124.7 | 125.4 |
| Authoritative identity | 828.7 | 383.3 | 836.7 | 389.4 |
| Associated parcel and land area | 4392.4 | 690.8 | 1138.7 | 692.4 |
| Core zoning, FSR, height and minimum lot | 4392.4 | 1146.5 | 1575.7 | 1130.4 |
| Indicative frontage | 4392.4 | 1151.3 | 1605.7 | 1157.4 |
| Complete supplementary planning | 4392.4 | 2300.8 | 4452.0 | 2403.7 |

Cold upstream requests: server 43 → 42; browser 45 → 44. Warm requests: zero in every run. Warm completion: server 30.7 → 30.0 ms; browser 111.2 → 114.6 ms. Warm CPU/render overhead varies; no warm latency improvement is claimed.

All replay runs retained 605.9145265334953 m² mapped land area, 15.9 m indicative frontage, R1 General Residential, 0.5:1 FSR and 8.5 m height. These captured controls do not establish current permission or a measured survey.

## Confirmed waits and changes

1. Identity always waited for ArcGIS candidate geocoding before querying the authoritative NSW register. A selective postcode/civic-number/street-name lookup now tries the register first with a 1.2-second budget. Both transports still use the same complete-response validation and exact component/label/identifier matching. Incomplete or ambiguous fast results fail closed; bounded misses retain geocoder-assisted authoritative resolution. Units, ranges, directions and source aliases are not approximated.
2. The server waited for every supplementary source before returning anything. Existing planning jobs now optionally publish parcel/land area, core controls and frontage as NDJSON milestones through the same endpoint; no stage refetches the parcel or controls. Existing JSON callers remain compatible. Partial controls stay loading and cannot establish eligibility.
3. Council hazards waited for a coverage query despite having independent inputs. Both server and browser start them concurrently. Hazard results still await and validate whole-parcel coverage before any mapped-negative conclusion.
4. A successful empty API autocomplete response previously triggered the same search directly upstream. It now returns the empty result; actual API failures retain direct fallback.
5. Planning HTTP responses use no-store, preventing CDN caching of partial/error snapshots. Existing bounded two-minute complete upstream caches, original source timestamps, cancellation checks, incomplete-response rejection and deadline-bound transient retries remain in use.
6. Client stream parsing handles chunked UTF-8, cancellation, an explicit final event and interrupted responses. New request frames mark retained controls as snapshots until rechecked. Current-request partial evidence survives a supplementary failure; previous-request evidence cannot be revived by an interrupted refresh. Pending/failed sources remain unresolved.

## Repeatable commands

```sh
node qa/property-performance.cjs --revision=282a110becfe
node qa/property-performance.cjs
node qa/property-performance.cjs --browser --revision=282a110becfe
node qa/property-performance.cjs --browser
npm run test:property-performance
npm run test:unit
npm run test:security
npm test
```

The performance regressions are included in `test:p0`, and consequently in `npm test` and `npm run test:unit`. They exercise identity vetoes, direct misses, partial/final parity, progressive UI delivery, stale-refresh isolation, cancellation, council coverage, a three-second controlled core-delivery budget and zero-request warm reuse. The HTTP test exercises the actual local planning route, not a replacement handler.

For actual live measurements once egress is enabled:

```sh
NODE_USE_ENV_PROXY=1 node qa/property-performance.cjs --live
NODE_USE_ENV_PROXY=1 node qa/property-performance.cjs --live --address="43 Hope Street Seaforth NSW 2092"
```

Live benchmarking was blocked before and after implementation. Direct Node probes encountered DNS/transport failures, and HTTPS proxy probes returned CONNECT HTTP 403 for ArcGIS and NSW Spatial Services. No successful live autocomplete, identity or planning timings are claimed. Required custom domain additions were saved to the environment draft: `geocode.arcgis.com`, `portal.spatial.nsw.gov.au`, `mapprod3.environment.nsw.gov.au` and `maps.northernbeaches.nsw.gov.au`. Saving the draft does not apply it.

Remaining limits: missing/slow authoritative responses can still exceed the target; incomplete parcel association, split zoning, failed controls, uncertain road boundaries and council coverage remain review cases. The fast path cannot bypass those checks. Hosted progressive timing also depends on the deployment/proxy permitting streamed delivery. Paid providers were not enabled.

## Validation record

- `npm run test:unit`: passed, including all 16 new performance/safety cases and the existing ownership, P0, reliability, premium, financial, duplex/FSR, residential, property, conversation, voice and Waratah suites.
- `npm run test:security`: all migration, API-origin and secret-scanner checks passed.
- `node qa/founder-server-regression.cjs`: passed.
- `node qa/journey.cjs` with system Chromium: all 28 cases passed on the complete final rerun. A prior full run had 26 passes and two 3-second click timeouts (two-storey and two-storey-basement); both passed in isolation and the complete rerun. No assertions or timeouts were relaxed.
- The package's full `npm test` is exactly `test:unit` followed by `qa/journey.cjs`; both components passed as above. An initial ordinary `npm test` could not launch its bundled browser. Browser launch configuration was then supplied explicitly for system Chromium.
- Independent review found an FSR provenance mismatch between partial and final results. A failing parity test reproduced it; final FSR evidence now uses the final instrument. Final review found no remaining material issues in the refresh-safety delta.

Raw replay output is in the ignored `qa-artifacts/property-performance/` directory. The standard Playwright Chromium binary is absent in this cloud environment. Browser verification uses `/usr/bin/chromium` via a temporary launch-option override; assertions are unchanged. WebKit and deployed live journeys are not claimed as verified.

## Files changed

- `address-evidence.js` — shared selective register query builder; strict matching unchanged.
- `api/_lib/sitepivot.js` — bounded register fast path, planning milestones, retained final provenance.
- `api/_lib/council.js` — overlap coverage and hazard retrieval while retaining coverage checks.
- `api/planning/property.js` — optional NDJSON and no-store planning responses; JSON compatible.
- `index.html` — direct-browser fast path, autocomplete deduplication, progressive parser/UI, safe refresh frames, council scheduling and address asset cache version.
- `package.json` — permanent performance test command in the normal regression chain.
- `qa/founder-ui-regression.cjs` — assert the changed address asset version without invalidating unchanged modules.
- `qa/property-performance.cjs` — historical/current server and browser replay plus live measurement commands.
- `qa/property-performance-regression.cjs` — authoritative matching, performance, evidence and final-parity cases.
- `qa/property-planning-stream.cjs` — actual HTTP streaming/JSON contract and request reuse.
- `qa/property-progressive-ui.cjs` — rendered progression, parsing, cancellation and interrupted-refresh cases.
- `docs/property-performance-2026-10-17.md` — this report.
