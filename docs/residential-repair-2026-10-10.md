# Residential intelligence repair — 10 October 2026

Baseline: sitepivot-concept `47f95143447d610c71720f1e7dd2a3087c371e23`. Existing branch history, public founder-testing destination and migration/security preparation preserved. No main merge, settings/visibility change, new hosting, purchase or external communication.

## Root causes and repairs

| Founder defect | Cause | Repair |
| --- | --- | --- |
| Failed duplex continues into feasibility | Planning returned a standard result but commercial/UI modules checked financial inputs only | Shared eligibility with six categories; gate construction budgets, completed-development values, feasibility and recommendations. Property/proposal/date-bound supported evidence required, including resolved exclusions and design envelope. Failed standard is distinct from prohibition; alternative LMR applicability remains unresolved without evidence. |
| Missing FSR looks unmapped | Point/failed/empty results conflated; legacy council labels could discard valid intersecting polygons; map classes accepted as ratios | Shared server/browser FSR evidence resolver. Parcel/full-query proof required for absence. Explicit error, unresolved, multiple and modification states. Primary spatial intersections retain controls regardless of historical council label. Truncation/malformed services fail closed. Control instrument/clause/source/retrieval date retained. |
| Council contributions silently zero | Default zero allowance, no scheme assessment | Structured contribution assessment: verified plan/exemption, explicit allowance/provisional or unknown. Unknown liability withholds financial totals. s7.11 and s7.12 are alternatives. Plan scope, statutory cost basis, credits and indexation must be supplied. |
| Understated holding finance | Fixed 70% site debt and 50% construction draw over the entire programme | Monthly land balance and staged construction draws, separate preconstruction/build/settlement/delay phases, optional capitalised interest, explicit fees, sensitivities and funding reconciliation. Land debt must be entered in the consumer flow, including zero if debt-free. |
| Overlapping capital labels | Transaction expenses, purchase-minus-sale gap, mortgage and project costs mixed | Separate transaction expenses, available equity, replacement expenditure, equity applied and additional funding. Mortgage payout deficit included in funding, never project expenditure. Missing inputs remain unknown. |
| Irrelevant selling prompts | Every project proposal exposed selling action and failed-area response suggested moving | Selling comparison appears on explicit interest. Unsupported project costs and values are cleared when moving is selected; other-options answer first describes independent home-improvement checks. |
| Acronyms pronounced as words | Missing/expanded acronym speech rules | Shared speech-only L-E-P, L-M-R, F-S-R, D-C-P, C-D-C, D-A, S-E-P-P. Display and full expressions preserved. |
| Specific address example | Hard-coded founder example placeholder | Neutral address placeholder; autocomplete and keyboard selection retained. |

## Evidence and model limitations

See [planning evidence](residential-planning-evidence.md), [FSR evidence](residential-fsr-evidence.md) and [finance/contributions evidence](residential-finance-evidence.md).

Official Eileen address/cadastre association: lot61 DP11915, cadid102174177. GIS geographic polygon area471.3665m² is indicative, not a registered survey. R2 Warringah LEP2011; ordinary duplex800m² under reviewed clause4.1B; mapped subdivision600m² is a separate clause4.1 control. Full parcel FSR query returns no mapped polygon. Walking catchment/exclusions/variation or savings applicability are not established and are never assumed.

1 Waratah Street, Balgowlah is independently resolved to lot54 DP9860, with point and whole-parcel FSR0.6:1 under Manly LEP2013 clause4.4. The old prototype fixture address/ratio is not evidence for the live property. Dated official captures include these parcels, Fairlight and five FSR control polygons: Manly, Central Coast, North Sydney, Parramatta and Orange. Regional fixtures validate actual control attributes; they do not prove every address/council works or establish comprehensive NSW coverage.

The Northern Beaches2024 s7.12 public plan supplies nil/0.5%/1% bands on the whole eligible statutory cost basis. Its special-plan exclusions, exemption and indexation rules require assessment; no automatic council liability or default zero is invented. Other local s7.11 schedules and state infrastructure applicability require specific evidence.

Development finance9.5% is a dated, editable illustrative modelling assumption informed by a primary public lender minimum8.5%; it is not an average, current lender offer or approval. Default construction funding70% and phase3/12/3 months are editable assumptions. Existing land debt is not inferred from property value. Principal repayment is not a project cost, establishment fees are separate, delivered building soft costs/contingency remain included once. No paid services introduced.

The live founder journey additionally reproduced a profile-confirmation control being replaced by background rendering. The form now keeps its DOM controls while the same property still needs confirmation, preserving edits and clicks. Follow-up regressions cover verified contribution non-applicability and outstanding land debt exceeding current land value without treating lender approval as known.

The deployed moving-only journey identified unset optional home-purchase allowances obscuring the funding total. These now display editable, disclosed zero exclusions, while replacement development costs remain unknown. Moving-only scope/assessment starts with selling, purchase and funding, without a rejected duplex or room-selection baseline. For a $2m sale, $2.5m purchase and $800k mortgage, working transaction expenses $190,787 and equity $1,137,500 reconcile to $1,490,787 additional funding. A successfully completed unmapped FSR result no longer generates a contradictory missing-data warning.

## Verification status

All unit/integration regression suites, security preparation regressions, working-tree secret scan and static package checks passed before push. Independent review found and resolved stale/loading/split-zone proof acceptance, incomplete proof, proposal identity mismatch, hidden unsupported completed values, moving state persistence and negative-equity funding omissions.

Local Playwright download failed; Chromium/WebKit executable installation is unavailable locally. Browser acceptance is performed through existing GitHub Actions. New residential browser checks test390px mobile and1280px desktop in Chromium and WebKit, actual Eileen address selection and Balgowlah mapped FSR on the deployed founder website, with screenshots/results retained in Actions artifacts. Final Actions results are recorded below. Browser engines do not establish physical iPhone audio pronunciation.

Full legislation content retrieval returned403 in this environment; official current indexed provision text and council/Department guidance were refreshed. This limitation and unresolved legal/site conditions remain in the evidence register.


## Changed components

- Planning/conversation/consumer integration: planning-intelligence.js, conversation.js and index.html.
- Spatial evidence: new fsr-evidence.js and api/_lib/sitepivot.js, with dated official fixtures.
- Cost/finance/contributions: commercial-engine.js; comparison-engine.js for equity and funding.
- Voice: voice.js shared speech normalisation; address input remains in index.html.
- Regression integration: package.json, existing qa suites, seven new residential unit/integration suites and residential-browser.cjs.
- Existing Actions QA workflows and explicit static-asset allowlists updated for the new module. Publishing source, repository visibility and security-preparation protections unchanged.

Moving-only next steps use sale appraisal, lender funding, conveyancing and inspections (or replacement-site planning), with appropriate action labels. An unselected project has no numerical building cost, including hidden detailed views. An unsupported development assessment offers planning next steps/another project and does not automatically expose a selling comparison.

## Verification register

Verified code commit: **91321b216ab17b6b6471f46d0132875a88a98705**. Retrieved the completed run statuses and actual consumer/live job logs on 10 October 2026 after resuming. All required steps executed successfully; none of the final browser checks was skipped or cancelled.

| Workflow | Run | Result |
| --- | --- | --- |
| Consumer regression | [38014782412](https://github.com/BoggedCake/ProjectIQ/actions/runs/38014782412) | Passed |
| Live deployed QA | [38014782440](https://github.com/BoggedCake/ProjectIQ/actions/runs/38014782440) | Passed |
| Server data QA | [38014782385](https://github.com/BoggedCake/ProjectIQ/actions/runs/38014782385) | Passed |
| Security preparation | [38014782382](https://github.com/BoggedCake/ProjectIQ/actions/runs/38014782382) | Passed |
| Pages build/deployment | [38014782340](https://github.com/BoggedCake/ProjectIQ/actions/runs/38014782340) | Passed |

- **32 unit/integration scripts**, with **211 PASS log entries**, followed by **28 existing homeowner/development journey checks**. These counts describe script/log outputs, not an inflated number of independent test assertions.
- Consumer browser: founder-repair **8** engine/viewport cases; residential sourced-dimensions **4**; property/scroll **6**; mobile WebKit **4**; unified typed/voice **8**; voice lifecycle **2**. All passed.
- Live browser: repaired-founder **8**; deployed full-founder **17**; typed/voice Seaforth/Fairlight **16**; property/scroll **6**; actual Eileen/Waratah residential **4**. All passed. Residential cases use Chromium and WebKit at **390px and 1280px**; additional suites cover **375, 393 and 430px** where listed in their logs.
- Live QA checked **all eight deployed application assets byte-for-byte against the tested branch head** before interacting with the site. HTTP success alone was not used as acceptance.
- Live residential checks selected the actual NSW addresses, confirmed indicative Eileen area/R2/Warringah controls, blocked unsupported duplex costs and completed value, checked relevant alternatives, reconciled explicit moving-only funding, then resolved Waratah's parcel and mapped **0.6:1 Manly LEP2013** evidence.
- Security regression, reachable-history/working-tree secret scan, dependency audit and eight-asset future deployment package check all passed. Existing security and private-migration preparation remains intact.
- [Consumer screenshots/results](https://github.com/BoggedCake/ProjectIQ/actions/runs/38014782412/artifacts/11655674950) and [live residential screenshots/evidence/results](https://github.com/BoggedCake/ProjectIQ/actions/runs/38014782440/artifacts/11655980365) are retained in Actions artifacts.

Additional direct deployed-browser acceptance on resume used the exact sequence: duplex question → other options → “I want to add another level to my existing house.” → “Would I be better off selling and buying somewhere else?” The add-level sentence selected that objective, and the explicit moving question activated comparison. Prior unsupported duplex assumptions were not recommended as an achievable baseline. Dwelling counts supplied for this test were illustrative user entries, not independently verified property facts.

One cloud-browser confirmation click during automatic scrolling did not advance; clicking the visibly stable button completed confirmation. The final Playwright residential journeys expressly assert one-click confirmation in both engines and widths and all passed. This observed cloud interaction is retained as a founder touch/scroll acceptance item, rather than claiming physical-device verification.

`main` remains **2e7f85d1c935ce0d0f5253b05471211c817e3e62**. No branch deletion, repository reset, visibility change, new hosting, subscription or commercial launch was performed.

Browser voice tests use Australian-English voice/recognition test doubles to validate normalised speech, queue completion, cancellation and conversation behaviour. Browser playback engines and mobile WebKit rendering do not establish physical iPhone audio quality or pronunciation. No new TTS subscription or credential was acquired.

Independent review checked property/proposal-bound eligibility, stale/loading/split-zone evidence, mandatory-check completeness, unsupported hidden values, contribution alternatives and false-zero risk, drawdown interest and principal reconciliation, mortgage shortfalls, moving scope/funding and mobile actions. Material issues found were fixed and regression-tested.

## Earlier failed and superseded checks

- Initial integration cost regression failed because newly mandatory eligibility was absent from old arithmetic fixtures; fixed with explicitly labelled exploratory/synthetic completed-pathway fixtures.
- Commit13814: consumer browser run failed seven fresh-project/configuration/finance cases because scope reset removed new-project quantities. Fresh editable defaults and explicit arithmetic-fixture inputs fixed this. Its live founder run failed eight fixture continuation checks after synthetic planning evidence was added without refreshing the pending conversation; a unique follow-up and matching proposal fields corrected the harness.
- Commit13cf: consumer residential harness stopped on require('./founder-server') (missing .cjs extension), so later suites were skipped. Corrected in1a1. The same setup error affected the next consumer run; it is retained in Actions history.
- Commit5a64: legacy conversation browser assertions expected unsupported duplex continuation. The live run passed eight Fairlight renovation journeys but failed eight Seaforth continuation assertions. The tests now assert the blocked pathway, then select an additional-level project to test end-to-end continuity without synthetic approval of the real site.
- Intermediate runs superseded by repair pushes were cancelled by the existing concurrency configuration. They are not reported as passes.
- Local Chromium/WebKit installation download failed. Existing GitHub Actions installed and ran the browser engines. No physical iPhone audio test was performed.
- Independent QA steps now continue after another test fails, only if the browser runtime (and deployed-byte parity for live checks) succeeded; the workflow remains failed if any check fails. Documentation-only commits do not rerun consumer browser suites.

## GitHub repair commits

| Commit | Change |
| --- | --- |
| 13814a8733365966cf9bc7c8651a0e7c106541f9 | Shared eligibility, FSR evidence, contributions, monthly finance, comparisons, speech and entry repairs |
| 13cf0d2bf58ae366fc961f95df3d96585f414989 | Fresh scope defaults, stable profile form and browser fixture inputs |
| efd251a72362018f5fec34a4c319f757ceff8f05 | Moving-only funding and verified-unmapped FSR warning distinction |
| 1a1bbd5689a45c58f7e8f2b42c466299807aa073 | No unselected project cost, FSR conversation provenance and browser module-path correction |
| 5a64b6f576b5bbd8333b19cc9941981c04d900e7 | Relevant moving next steps and action labels |
| e7a7fe7a850a6c6bfd05b40eca9307a4fdde34de | Eligibility-aware conversation browser acceptance and independent QA execution |
| 91321b216ab17b6b6471f46d0132875a88a98705 | Remove generic selling action from unsupported manual development assessment |

The report-only follow-up retains identical application files to the tested code commit. Existing founder-testing URL: https://boggedcake.github.io/ProjectIQ/ . Use Start over to begin a fresh property session, select16 Eileen Street, confirm actual dwelling details, ask about a duplex, then other options, then add another level, then explicitly ask about selling/buying. For mapped FSR use1 Waratah Street, Balgowlah.

## Remaining dependencies and bounded claims

- Eileen's legal walking catchment, state-policy exclusions, any variation/savings/alternative approval and survey/title measurements are not established. No achievable duplex feasibility is supplied for its unsupported ordinary route.
- The founder screenshot with missing FSR did not expose an address. The repaired mechanism is demonstrated with independently sourced Balgowlah/Fairlight parcels and five regional mapped-control fixtures, not claimed as exhaustive NSW address coverage.
- Contributions require applicable plan geography, statutory cost basis, exemptions/credits, current indexation and any state infrastructure assessment. Unverified liabilities stay unknown; user allowances remain assumptions.
- Finance9.5%,70% construction funding,3/12/3-month phases and fees/holding defaults are illustrative editable assumptions. Lender pricing, lending capacity/approval, tax treatment, valuation and project cash-flow advice remain external inputs.
- Full legislation retrieval limitations, council flood/DCP gaps and other failed planning sources remain recorded and visible; no missing control is replaced with a fabricated default.
- Neural TTS/provider or finance/data API procurement would require separate founder approval and credentials. No purchase, external message, main merge or infrastructure/visibility change occurred.
