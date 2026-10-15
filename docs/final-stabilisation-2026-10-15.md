# Final stabilisation — 15 October 2026

Starting remote: `8dec89f56ff24074f5c0fcee5260fc05193f45a8`. No subsequent remote changes existed on fetch. Existing owner/buyer, finance, eligibility, storage, security and founder deployment architecture retained.

## Focused changes

- Identity matching remains exact. Complete official responses can now explain an unproven range relationship separately from an unmatched address or ambiguous identity. No range is accepted as an alias or parcel. Browser shows Needs Review and retry; API returns422 with structured review rather than falsely classifying an authoritative refusal as an upstream502. Failures are not cached.
- Server/live QA accept only documented Gosford49 and Katoomba2 range refusals with typed, complete, timestamped NSW source evidence and nonempty related candidates. They record confirmed, needs-review and failed counts separately; planning is explicitly not assessed for an unconfirmed property. Empty, truncated, unrelated, timed-out or newly mismatched cases still fail. Actual identity and planning successes are never inflated by review cases.
- Existing market-v1 adapter now validates calendar dates, deduplicates transaction IDs, normalizes property IDs, preserves separate field sources/dates/confidence, flags profiles older than180days for review, exposes subject-matched history and separately identified provider improved-property estimates. A provider estimate requires its own matching property ID and exact matched subject profile. Invalid top-level envelopes remain review. Current listings remain separate; no land value, purchase price or completed GRV substitution.
- Sold rows require explicit verified, full-interest, arm's-length transaction evidence, a property ID and current source check before being eligible for valuation. Legacy rows remain review/context, not valuation inputs. Unknown accommodation/areas remain null. Invalid dates, prices and negative attributes cannot become facts.
- Comparable model requires at least two independent recent properties, sufficient subject/comparable attributes and no materially conflicting price spread. Sales over365days are excluded. Range uses similarity and observed price dispersion, explicitly not a statistical confidence interval. Unknown condition lowers confidence. These are disclosed conservative modelling policies, not empirically calibrated valuation accuracy claims. Synthetic tests do not establish live market values. Manual working values remain available.
- Detail tables show unavailable accommodation and sale dates clearly instead of raw nulls.

No provider was activated. Domain/Pricefinder credentials, written consumer-display/analysis/storage rights, supported fields and refresh/retention conditions are needed for integration. Prior source/licensing research remains authoritative for this checkpoint; broad repository discovery was not repeated. Commercial NSW PSI and land-value access remain separate dependencies. No new lawful no-cost full profile/comparable source was established.

## Verification and accounting

Added fail-first regressions for identity review classification, QA outcomes, malformed dates, duplicate transactions/properties, per-field provenance/freshness, exact historical/AVM identity and conservative valuations. Independent reviewer found wrong-property AVM attachment and whitespace-ID duplication; both were reproduced, corrected and independently rechecked.

Existing $3.5m site/$2m construction/$8m completed-value owner/buyer arithmetic is unchanged. The [automatic-duty reconciliation](evidence/owner-buyer-financial-2026-10-15.json) remains: owner with$1.5m debt total$5.7m/profit$2.3m/peak new cash$1.2m; buyer total$5,928,787/profit$2,071,213/peak cash$2,478,787. Buyer deposit$350k is within$1.05m purchase cash; loan$2.45m. Rates and zero ancillary allowances in that synthetic accounting test are explicit assumptions, not a bankable feasibility.

Local full `npm test` completes unit suites and then is blocked at Playwright launch by absent browser executables. Remote CI Chromium/WebKit are the required browser evidence; no local or physical-iPhone success is claimed. Final Actions and real-source outcomes are reported in the handover after deployment.

Founder site: https://boggedcake.github.io/ProjectIQ/. Save/reopen remains local to the browser/device, with saved planning requiring refresh. No cross-device storage, document upload, paid API, hosting/visibility change, commercial launch or merge to main.

First CI exposed an outdated P0 browser readiness assertion: complete wrong/ambiguous identities now settle as needs-review, while incomplete/truncated transport remains unavailable. Its exact expected status and category were updated; original refusal, null property, landing, retry and overflow assertions are retained. This is a test-contract migration, not relaxed identity matching.


## Final release verification

Verified application/QA commit: `f3b3c570b13d5519f99ea88ebc823ccd23d9160e`. Final outcomes:

| Check | Result | Run |
| --- | --- | --- |
| Consumer regression | PASS, including eight Owner/Buyer, four financial and four premium browser cases;433 explicit PASS log entries,0 FAIL entries (not an assertion count) | [38732532763](https://github.com/BoggedCake/ProjectIQ/actions/runs/38732532763) |
| Live deployed QA | PASS;11-asset byte parity, real founder journeys, Chromium/WebKit conversation/voice, residential, DA/CDC and financial checks | [38732532756](https://github.com/BoggedCake/ProjectIQ/actions/runs/38732532756) |
| Server data QA | PASS WITH NEEDS REVIEW:10 confirmed identities,2 evidenced range refusals;6 planning contract/scenario checks passed,2 withheld | [38732532789](https://github.com/BoggedCake/ProjectIQ/actions/runs/38732532789) |
| Security preparation | PASS | [38732532787](https://github.com/BoggedCake/ProjectIQ/actions/runs/38732532787) |
| Pages deployment | PASS | [38732532532](https://github.com/BoggedCake/ProjectIQ/actions/runs/38732532532) |

The final server sample's suggestion p95/max was270ms across12requests, not a statewide performance claim. [Captured authoritative review evidence](evidence/identity-range-review-2026-10-15.json) retains the actual source identifiers and parcel relationships: Gosford49–51 has administration records for1/DP251476 and1/DP564021, plus a tower record; Katoomba2–6 has1/DP705910. Neither proves the bare-number alias. Dixon84/2–8 remains exact-unit identified but parcel attributes incomplete and planning scope address-point only; missing area/whole-parcel eligibility is not invented.

Earlier release7a's live run [38730657793](https://github.com/BoggedCake/ProjectIQ/actions/runs/38730657793) failed one390px founder journey and oneWebKit390Fairlight text journey. Both logged HTTP200suggestions/candidates followed by a5001ms NSW Address Point timeout and a correctly settled unavailable frontend. These failed checks are retained, not turned into successful identities. Final pass does not establish permanent upstream reliability. The earlier P0 readiness failures and their exact status-contract correction remain documented above.

Final local unit run passed (344 explicit PASS lines, async completion and existing Node groups); security, syntax, whitespace and11-asset packaging passed. Local full npmtest remains blocked only at browser launch because Playwright executables are absent; remote browser suites supply the actual engine evidence. Independent review rechecked estimate identity, normalized property IDs, unknown-condition confidence and settled review lifecycle without a remaining scoped blocker.

Interactive final-site verification also exercised both range refusals, recovery to Fairlight32/DP1729/R1/FSR0.6, Buyer kitchen funding with automatic duty$173,787, and save/reload/reopen/reassessment. Purchase$3.5m, deposit$350k within cash$1.05m, loan$2.45m and entered8% rate were retained. User-supplied professional notes survived; saved planning required refresh. Accommodation inputs in that journey were explicitly synthetic/user-confirmed, not retrieved property facts. Physical iPhone audio remains unverified. No live market feed, actual lender quote or formal market valuation is supplied.
