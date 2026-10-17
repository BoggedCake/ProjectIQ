# Independent NSW spatial, address and renovation review — 17 October 2026

Reviewed the uncommitted working tree on `sitepivot-concept`, HEAD/base `485432cae73dc86cb0577f36c89c43272b347e55`. Scope: runtime changes, permanent regressions, captured official fixtures, reports and the added live CI gate. The reviewer changed only this report; no commit, push or deployment was performed.

## Recommendation

**GO for local review/handoff. NO-GO for a public release at this checkpoint.** No remaining material runtime defect was established after the corrections below. The root's final full regression and security runs passed. This is a bounded code and local evidence assessment, not certification of NSW-wide statutory coverage or project pricing.

Public release still requires the explicitly requested founder approval and resolution or explicit disposition of the WebKit acceptance gap. Native production-fetch access is now verified for the two explicit founder properties and the broader server smoke gate, as recorded below. The new GitHub Actions live gate has not been executed against this unpublished candidate. Independently verified current renovation QS prices remain unavailable; the cost model correctly describes its additions as internal working allowances.

## Findings reproduced and corrected

1. **Known instrument conflicts (P1).** A covering quantitative feature from a different LEP previously returned `mapped`, `spatiallyVerified: true`, and `requiresReview: false` despite a conflicting supplied zoning instrument. A 300 m² lot control from the different LEP could reach `mappedSubdivision()`. The resolver now quarantines the conflict; both transports pass known zoning context into FSR, height and lot resolution; subdivision checks provenance. The permanent spatial suite verifies the veto and adapter propagation. GFA already had a separate instrument check; the original finding did not establish a GFA bypass.
2. **Unresolved controls presented as absence (P2).** Null height/lot values caused the consumer summary to show “Not mapped” for unresolved geometry, split controls and conflicts. The summary now uses the evidence label; detailed statuses consider review and mapping uncertainty. The permanent UI regression checks Passport and report presentation.
3. **Direct Pages identity crash (P2).** The new direct/memo branch initially left `geo` absent. A valid exact official formatted address with missing optional structured locality/postcode then threw while reading `geo.attributes`. This was independently reproduced. The corrected code normalizes the fallback object, and the new browser regression covers both first resolution and exact cached reuse. An extracted-function VM dependency failure introduced by provenance lookup was also corrected; it was a test integration issue, not an additional browser runtime defect.

## Mapping policy assessment

The latest user instruction distinguishes microscopic mapping gaps from material conflicts. The implementation retains the measured gap/contact, limits the default mapping threshold to `min(0.01 m², parcel area × 0.00001)`, permits tightening, marks uncertainty explicitly, and displays affected controls as Indicative. It does not claim that the threshold is a statutory exemption or independently verified source accuracy.

The Nield geographic and independently captured projected fixtures retain approximately 0.0005375 m² of uncovered source area. Their agreement supports treating this as source boundary precision rather than merely JavaScript floating-point error. Larger gaps, conflicting instruments, statutory modifications and substantive different-control overlap remain review cases. Hazard/protection logic is unchanged.

Independent production-model replay of the captured New Street parcel returned 0.45:1, retaining the neighbouring 1:1 polygon's **0.0015251245 m²** contact and a supported capacity fraction of **0.99999782355**. At the captured projected parcel area, automatic GFA was **315.3325144 m²**; the neighbouring contact did not inflate capacity. The independently captured adjoining commercial parcel returned its own 1:1, retaining **0.0033110311 m²** of neighbouring 0.45 contact. These are mapped measurements, not survey boundaries or approval findings.

## Independent verification

After the final direct Pages correction, the reviewer ran:

```sh
node --test qa/browser-identity-recovery.cjs qa/parcel-controls-regression.cjs qa/quantitative-control-ui.cjs qa/renovation-scope-calibration.cjs qa/renovation-scope-ui.cjs qa/address-identity-recovery.cjs
```

**48 tests passed; zero failed, skipped or cancelled** on the final focused rerun. This included direct/cached optional-field identity recovery, incomplete-evidence vetoes, instrument conflicts, actual source fixtures, mapping uncertainty, measured capacity, renovation quantities, GST accounting, founder-confirmed baseline arithmetic and mixed-project scope reset. It also included the added residential E1/E2/MU1/B1/B2/B4 boundary/split cases and both missing-geometry cache recovery cases. Output was captured in `/tmp/independent-nsw-review-tests.log` (temporary).

The root confirmed the final release-candidate `npm test` and `test:security` processes both exited 0 after the final cache/icon changes. The reviewer inspected the completed journey output in `/tmp/sitepivot-nsw-20261017/npm-test-release-candidate.log` and passing migration, API-origin and scanner output in `/tmp/sitepivot-nsw-20261017/security-release-candidate.log`. The reviewer did not duplicate these full commands; their process exit confirmation comes from the root.

The final cache delta was also inspected: server and browser caches refuse quantitative responses that omit requested polygon rings, allowing a subsequent explicit retry to retrieve complete geometry. Both permanent recovery tests passed independently in the focused run. The explicit empty favicon data link was reviewed as a contained HTML correction for the browser's unrelated `/favicon.ico` 404; its founder-server assertion was inspected. The root reported its targeted founder-server, Chromium ownership and voice checks passing; the reviewer did not rerun those browser suites.

The reviewer subsequently inspected `qa-artifacts/nsw-spatial/live-controls.json` and `/tmp/sitepivot-nsw-20261017/live-controls-env-proxy.log` from the root's successful native run:

```sh
NODE_USE_ENV_PROXY=1 node qa/live-parcel-controls.cjs
```

The production fetch implementation was used, without substituted transport or disabled TLS verification. Node 24's supported environment-proxy setting resolved the earlier native connectivity prerequisite. The root reported exit 0, and the inspected artifact records two passes between **11:07:35.342 and 11:07:50.657 UTC**:

| Actual live property | Address ID / cadid | FSR / primary zone | End-to-end elapsed |
| --- | --- | --- | ---: |
| 61 New Street West, Balgowlah Heights NSW 2093 | 72720191 / 102197818 | 0.45:1 / R2 | 8,363.6 ms |
| 59 West Street, Balgowlah NSW 2093 | 9909469 / 100107014 | 0.5:1 / R1 | 6,951.3 ms |

The inspected gate requires matched parcel identity and empty planning `failedKeys`; both cases reached their passing result. These are single actual end-to-end measurements, not identity-only latency percentiles or NSW-wide availability evidence. The reviewer inspected the evidence rather than rerunning the live requests. A reusable environment draft with the proxy variable was saved by the root but still requires publication; the successful command verifies this current process, not a newly published environment snapshot.

The later native-proxy server smoke result in `/tmp/sitepivot-nsw-20261017/server-data-live-proxy.log` reports `pass-with-needs-review`: **11 confirmed identities, two range-review identities, zero failed identities; six confirmed planning results and two withheld planning results**. The Dixon unit's parcel remains unresolved rather than being invented. Identity p95 was **1,886 ms**, exceeding the **1,500 ms** engineering target; a passing availability gate does not satisfy that performance target.

The reviewer also inspected native-proxy Chromium output for premium journeys (**2/2**), P0 founder journeys (**6/6**) and Waratah buyer journeys (**2/2**), plus the final ownership and voice rerun logs. The root reports 48 Chromium cases across 13 scripts passing overall. These are system-Chromium results, not WebKit or deployed-candidate evidence. The earlier aggregate Chromium JSON contains historical ownership/voice failures; the final per-script rerun logs supersede those entries.

## Limits and remaining gates

- Current-source curl-backed captures and finite address measurements are documented in the companion address report. Earlier native production-fetch attempts timed out; the later supported proxy configuration passed the actual native gate for New Street West and West Street and the broader server smoke gate with explicit review outcomes. The 1,500 ms identity p95 target remains unmet in the observed broader sample. No fresh candidate GitHub Actions result, complete statewide live suite, or deployed journey is asserted here.
- WebKit downloaded, but the observed mobile navigation run could not launch because required host libraries were missing. Root and rootless dependency installation attempts did not resolve that environment prerequisite. This is unavailable browser evidence, not a passed mobile test.
- Renovation arithmetic and the preservation of the confirmed $213,600 / $1,319,095 / $1,190,752 scenarios are tested. Fresh licensed/public 2026 QS rate verification was unavailable. Added quantities and allowances improve scope transparency; they do not establish a quote, a measured design or the GST basis of the unchanged addition model.
- Multi-parcel/strata ambiguity, unsupported datum transformations, excessive geometry complexity and unresolved statutory overrides remain bounded review cases. No claim of universal NSW property coverage is made.
