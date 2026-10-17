# Property intelligence correctness repair and master reconciliation

Starting branch: `sitepivot-concept`, `0d57229a5ab7d474fa0c9214d61e80d3b20ac03d` (reporting commit over application `28758a8c650523ab02719517f8318d9f43b32000`). Remote HEAD rechecked on resumption; no newer commits discarded. Existing founder-testing URL: https://boggedcake.github.io/ProjectIQ/.

## Research recovery and implementation reconciliation

The 13 October technical intelligence handover and 14 October address/planning deep investigation were recovered and read. Their source analysis, synthetic address/parcel/council reproductions, six-case GEOS comparison and original live-CI logs were available. Current repository source, reliability/premium reports, captured zoning fixtures, regression/workflow configuration and the canonical Notion founder authority were reconciled. Global discovery was not repeated. All findings below concern this implementation checkpoint; live and release outcomes are recorded separately.

| Finding | Starting state | Current disposition and acceptance |
|---|---|---|
| Wrong-street address can pass relevance threshold | Confirmed synthetic defect; not implemented remotely | Shared pure component validator in browser/server; wrong distinguishing components veto; ambiguity remains review; fail-first wrong-street production tests recorded |
| Summed zone intersections hide parcel gap | Confirmed synthetic defect | Shared union slab engine calculates group union, overall coverage, uncovered area and cross-zone overlap independently; original100/80 counterexample must remain unresolved |
| Truncated parcel or malformed council response becomes verified/clear | Confirmed synthetic defect | Shared response schema/completeness validator at adapter and cache boundaries; original malformed/truncated probes must remain unresolved; complete empty negatives retained |
| Source IDs/unit/range/multi-lot relationships lost | Partial implementation | Structured address IDs retained; unit/range contracts; multi-record/multi-lot scope retained as review, never silently first-lot or sum |
| Existing retries/caches/cancellation/input retention | Implemented and covered by existing deterministic regressions | Retained. Existing deadlines unchanged; failure/empty/incomplete remain distinct; no stale gate reopening |
| Intermittent Fairlight/Sydney/Gosford retrieval | External-dependency issue, not established incorrect zoning | Actual current live QA required; source timeouts remain failures with visible retry rather than fabricated facts |
| Full statewide local council/DCP/legal coverage | Partial; Northern Beaches council adapter and reviewed LEP branches | Explicit unknown/manual-review retained; no claim of complete legal eligibility coverage throughout NSW |
| Per-layer source/rule timestamps and historical snapshots | Partial source provenance and dated evaluator already exist | Preserve current dates/evidence gates. Full maintained historical legal corpus deferred pending authoritative text/version verification; no fabricated rules or automatic date extension |
| G-NAF candidate index/Pelias service | Research proposal, not implemented | Deferred: no measured benefit or data/import/operational benchmark justifying new infrastructure. Strict identity repair does not require a new geocoder |
| PostGIS infrastructure | Research proposal | Retain present architecture. Use GEOS as independent oracle; no paid/server/database migration |
| OpenFisca | Research pattern | Learn effective-date/trace design; no AGPL code transplant or Python service. Existing unknown gates retained |
| Dominant-zone external demo | Technically unsuitable/unlicensed for copying | Rejected: loses split zones; genericR-prefix classification unsuitable for NSW |
| Market licensing, neural voice, full real-device audio | Separate external/professional dependencies | Not activated or claimed complete in this property correctness release; existing adapters and browser fallback retained |

## Fail-first implementation evidence

Research and repair tests use synthetic authoritative payloads to expose unsafe code behaviour; they do not establish a particular actual NSW property was wrongly assessed.

- Address: baseline browser/server accepted same-number/postcode wrong-street candidate. New matcher requires consistent number/range/suffix, street/type, supplied locality/postcode and unit. Both structured fields and source label are checked. Stable identifiers and unique candidate sets remain separate from parcel/legal scope.
- Zoning: baseline returned `single-zone` for100m² parcel with80m² actual union. New overlay integrates union spans per zone+instrument, total union and gaps separately. Cross-instrument overlap is not merged. Existing conservative exact-duplicate review is retained. Small measurable gaps cause boundary review; large gaps remain unresolved.
- Completeness: baseline accepted one matching truncated parcel; malformed/truncated council hazards could establish clear. Expected collections/records/attributes/IDs/geometry, transfer flags, pagination markers/counts and provider-specific final-page convention are now validated. No unknown paginated result is represented as complete.

No dependency was added. The two small UMD modules are included in actual HTML order, local QA module loaders, static-server allowlists, founder asset packaging and deployed source-parity checks. Existing assertions were retained; isolated VM dependencies and fixtures are updated only to satisfy the real shared-module/API contract.

## Independent review checkpoint

Initial independent review executed P0, property/captured-zoning and reliability checks, then found additional malformed council coverage attributes, unsupported common street types and nonprimitive IDs. All were corrected and independently re-reviewed: 14/14 scoped review groups passed, with no remaining scoped blocker. Additional fail-first checks cover locality/city hierarchy, source building-name prefixes, street names containing type words, invalid council geometry and malformed primary/trigger labels before cache admission. Original review and fail-first evidence are retained in the engineering evidence bundle.

## Geometry limits and interpretation

The engine validates supported matching CRS, linear polygon rings and parcel-local topology; invalid/unsupported or over-budget geometry remains review. It uses the existing local metric projection approximation for geographic/WebMercator coordinates, not a survey. Work is bounded (5,000 source vertices/2,000 relevant edges). Provenance method is `polygon-union-slab-v2`.

The independent GEOS3.14.1/Shapely2.2.0 differential run covered120 deterministic convex-polygon sets with holes, duplicates and multiple groups; maximum observed numeric error was5.684341886080802e-14m² in these synthetic projected cases. This is not a statewide spatial accuracy percentage or deployed PostGIS performance benchmark.

## Release verification

Local frozen-source verification: `npm run test:unit` exited 0 (303 explicit PASS lines plus 15 Node test groups; these are reporting units, not a claimed total of individual assertions). `npm run test:security` exited 0 (3 checks), `npm run build:founder` packaged 11 assets, syntax and whitespace checks passed. The 120-case independent GEOS run passed; result is in `docs/evidence/p0-geos-differential-2026-10-15.json`. Local logs are retained in `docs/evidence/p0-local-unit-2026-10-15.log` and `p0-local-security-2026-10-15.log`.

Local real-provider server QA failed: 0/12 identity cases and 0/8 planning cases passed in this executor. Most requests timed out; returned Newcastle/Orange building-name records exposed a parsing limitation now covered by the repair. This does not establish a statewide government outage. Baseline deployed UI independently resolved 57 Griffiths Street, Fairlight to lot 32/DP1729 and 415.2m², demonstrating the distinction between executor transport and browser access. That baseline observation is not a new-release pass.

Local browser execution is blocked by absent Playwright browser binaries. Chromium/WebKit desktop/mobile checks are configured in CI, including 16 new synthetic identity UI cases, clearly separated from real-source suites. Final remote workflow, per-address, deployment and founder outcomes remain pending at this implementation checkpoint.

## Remaining limits and next investigation

Retain exact range/unit rejection when official evidence does not establish the entered address; do not relax to improve pass counts. Confirm Gosford 49 versus any official 49–51 record using an authoritative relationship before treating them as equivalent. Prioritise source-stage latency and recovery evidence for Fairlight/Dixon/Gosford, then dated authoritative planning-text snapshots and stratified NSW parcel fixtures. Full historical rules, statewide DCP coverage, real-device microphone/audio and survey-grade geometry remain outside this repair's demonstrated coverage.

## Founder acceptance steps

1. Open the existing founder URL in a fresh desktop session and mobile Safari. Select each address from suggestions; check the confirmed property before continuing.
2. Eileen Street: ordinary duplex restriction must remain enforced; no unsupported feasibility. Nield Avenue: review parcel/source evidence and separate conditional DA/CDC pathways.
3. Seaview Street: retain premium construction, lift/pool, finance, holding cost and profitability calculations. Use the existing labelled financial regression fixtures to distinguish deterministic arithmetic from live data.
4. Fairlight, 49 Mann Street Gosford and 84/2–8 Dixon Street Sydney: record exact address, parcel, zone, source timestamps and visible retry/unavailable state. Missing evidence must never become permission or a prohibition.
5. Start over during a pending lookup, retry a failed lookup, and change property. Old responses must not replace the new property. Voice/text, renovation, extension, comparison and sell/buy journeys must remain available.


### Live integration correction after first deployment

The first remote run at `be9263686556` passed security, Pages byte parity and the 16 synthetic P0 Chromium/WebKit cases, but real-source QA exposed an application parsing defect. Actual ArcGIS Northern Beaches suggestions end with a sixth `, AUS` segment; the hierarchy parser rejected the otherwise exact official address. A fail-first captured Fishbourne fixture test and actual Fairlight response reproduce it. Only an explicit terminal country segment is stripped before the existing hierarchy checks. Independent review passed 11 review cases and separate wrong-component/country probes; the source matcher remains strict. Browser synthetic payloads now include this actual country suffix, and asset version tags are advanced to avoid retaining the first deployment's module.

Initial remote server results: 6/12 identity and 4/8 planning cases passed. Dixon resolved in 659 ms with a 57 ms suggestion and returned SP5; parcel attributes and SEPP failures remained visible. Newcastle/Orange/Wollongong building-name matching succeeded. The country correction requires fresh remote verification. Unqualified Gosford/Katoomba range relationships remain unresolved, not successful property matches.

## Implementation register and rollback

| Priority / status | Files and implementation | Purpose / acceptance / regression risk |
|---|---|---|
| P0 implemented, local and remote synthetic tests pass | `address-evidence.js`: `parse`, `components`, `match`, `select`; `api/_lib/sitepivot.js`: `authoritativeAddress`, `resolveProperty`; `index.html`: `authoritativeAddressForCandidate` and API identity gate | Exact distinguishing components and primitive source IDs, one authoritative candidate, preserved units/ranges and locality hierarchy. Never compensate a wrong street with numeric similarity. Risk: false rejection of unsupported official address forms; captured-source and browser/server parity tests required. |
| P0 implemented, 120-case independent oracle pass | `zoning-evidence.js`: `overlay`, `resolve` | Union coverage, uncovered gaps and overlap reported independently, grouped by code and instrument. Invalid CRS/topology/work budgets stay review. Acceptance: original overlapping 60+40 areas cannot conceal the 20m² union gap; split and small-boundary states persist. Risk: complex geometry is deliberately withheld, not silently approximated as a single zone. |
| P0 implemented, schema/failure/cache regressions pass | `response-evidence.js`: completeness and semantic validators; server/client parcel adapters; `api/_lib/council.js` layer schemas; `property-evidence.js` | Truncation, malformed records, unusable labels and uncertain pagination cannot enter successful cache or establish mapped clear. Complete empty checks remain valid. Multi-record relationships are retained as unresolved scope. Risk: upstream schema change reduces availability; source metadata and explicit errors permit diagnosis. |
| P1 partial, external evidence still needed | Existing identity/planning transports and `qa/serverless-smoke.cjs` | Fairlight/Dixon identity now succeeds remotely; multiple planning endpoints still exceed existing budgets. Preserve retry, cancellation, valid caches and visible unknown states. Do not increase every timeout or add another provider without stage-level evidence. |
| P1 deferred | Gosford/Katoomba range-address relationship | Require authoritative alias/relationship and parcel linkage, then an explicit confirmation path if multiple records remain. No first-record or proximity substitution. Add captured full source records and real mobile acceptance before claiming resolution. |
| P1 partial / requires maintained authoritative content | `planning-intelligence.js`, council adapters and dated rules | Current jurisdiction/date gates retained. Full NSW DCP, historical amendment/commencement corpus and source-conflict resolution are not complete. No automatic legal-date rollover. |
| Retained | Financial, conversation, voice, premium/minimal consumer UI and existing deployment | No new paid provider, database, runtime package or interaction redesign. Existing regression suites remain the acceptance gate. |

Rollback is a normal forward commit reverting the repair commit(s) on `sitepivot-concept`, followed by the same asset-parity and browser checks; do not reset or force-push. Keep new modules loaded with their consumers as one release unit. Prefer a narrow correction over reverting safety gates: the historical baseline contains independently reproduced unsafe acceptance cases. No data migration or infrastructure rollback is required.

Reproduce local checks with Node24 and `npm ci`: `npm run test:unit`, `npm run test:security`, `npm run build:founder`. With installed Playwright Chromium/WebKit, run `node qa/p0-browser.cjs` (16 synthetic cases), `npm test` and the existing browser suites. Use `SITEPIVOT_URL=https://boggedcake.github.io/ProjectIQ/ node qa/p0-browser.cjs` for deployed assets with synthetic provider responses. Real-source verification is separately `node qa/serverless-smoke.cjs` and `node qa/live-smoke.mjs`. Optional independent geometry verification: install Shapely2.2.0 in an isolated research environment and run `python qa/p0-geos-oracle.py`; it is not a product dependency.

### Final pre-CI review checkpoint

Live Chrome Fairlight testing confirmed 32/DP1729, 415.2m², R1, 8.5m and 0.6:1; the partial-source warning/retry retained the confirmed property. Live Eileen testing resolved 61/DP11915 and R2 but parcel-level evidence was unavailable; no duplex costing was generated. It exposed misleading wording that missing primary instrument evidence was a conflict. The evaluator now distinguishes two present conflicting instruments from an absent instrument, with explicit unknown gates for both single-zone and boundary-review inputs. Independent review caught and closed a possible conditional-costing reopening during development; that intermediate local change was not deployed. Final review passed 22 planning cases and the existing duplex pathway suite, including valid boundary exceptions and conflict vetoes.

The final local subprocess completed all of `test:unit` in 68.13 seconds, exit0, 303 explicit PASS lines and 15 Node test groups, including `ASYNC_SUITE_COMPLETED`. Security (3 checks), build (11 assets), syntax and whitespace checks passed. The browser journey's API mock now supplies the authoritative source-ID/complete/component fields required by the repaired API contract; no behavioural assertion was relaxed. Browser execution remains a remote CI gate.
