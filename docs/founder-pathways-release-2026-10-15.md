# Owner/buyer pathways and founder-feedback repair — 15 October 2026

Starting remote: `15841e620f0b86b01b5c3f19a9185e7bb27cb040`. Latest actual branch fetched and merged without reset or discarded work. Five founder screenshots IMG_2923–2927 were recovered and visually reviewed. Existing authority, P0 report, financial/premium code, evidence adapters and failed Actions were reviewed before implementation. Existing testing URL: https://boggedcake.github.io/ProjectIQ/.

## Implemented

- Explicit Owner/Buyer choice before address entry; retained in session, conversation project context, assessment, downloaded data, printed report and local saved project. Buyer cannot sell the unowned subject through Compare Alternatives, including stale conversation/comparison state.
- Buyer acquisition contract extends the existing finance/feasibility engine: purchase price, deposit subset, purchase cash, acquisition loan/rate, dated ordinary NSW duty, legal/due diligence/other expenses, settlement lead-in. Purchase cash plus loan must equal price. Missing acquisition essentials withhold financial output even in provisional mode. Purchase price/costs enter economic expenditure once; owner land remains opportunity cost. No loan principal/deposit expense duplication. Independent land borrowing and cash-funded works supported.
- Owner debt-free and confirmed-debt scenarios remain supported. Cash available is distinct from land equity. Buyer improvement funding uses the post-settlement acquisition mortgage as its baseline, separate works terms/rate, and separately entered cash after acquisition; no pre-existing owner equity assumed. Full acquisition interest during works is included once in total purchase/project expenditure. No claim of loan approval.
- Native select change and input both update configuration. Descriptions state total and above-ground/basement levels explicitly. Initial 420/440 m² values were starter assumptions, not parcel-derived geometry. Starter area now keeps its disclosed assumed floorplate as levels change; a user-entered total is retained and redistributed. Basement and garage space are counted once. Internal residential area and statutory planning GFA remain unconfirmed until design evidence exists. The screenshot's “3 levels” correctly meant basement + two above; this is now explicit.
- Property type display uses polished labels without changing canonical data. Existing evidence badges/provenance remain intact.
- Browser-only save/reopen: up to ten projects, property/parcel/planning/source timestamps, role, scope/financial inputs, conversation and user-supplied professional notes. Save verifies readback and handles failure. Reopen clears cached assessment; live saved planning is gated pending recheck. Reassessment retains notes without promoting them to planning consent. Legacy browser saves can be reopened, with unconfirmed ownership requiring selection. No document uploads, new account/database or cross-device guarantee.
- Optional licensed market-v1 profile adapter validates exact address/unit and lot/plan, stable ID, source/date, individual evidence states and distinct land/internal/building areas. Explicit estimate/listing/land-value kinds cannot enter sold arrays. No provider activated or credentials introduced.

## Research and financial evidence

See [source and licensing review](property-data-source-review-2026-10-15.md), [finance contract and worked case](owner-buyer-finance-2026-10-15.md), and [historical QA diagnosis](qa-investigation-2026-10-15.md).

No reviewed scraper qualified for activation. Source-code licences do not establish underlying data reuse rights. Official free NSW sales information is non-commercial; commercial use requires a PSI licence. Bulk land values are separate, not improved property market values, and access requires confirmation. Existing comparable-sale modelling remains available behind the licensed gateway; no new lawful comparable feed is connected, so real-property market ranges remain unavailable when evidence is inadequate. Manual values remain available and labelled assumptions.

The deterministic $3.5m site/$2m construction/$8m GRV comparison uses explicit illustrative rates, not live lender pricing. Debt-free owner: $5.55m economic cost, $2.45m profit, $1.05m new cash. Owner with $1.5m confirmed debt: $5.7m economic cost, $2.3m profit, $1.2m new cash. Buyer with $1.05m purchase cash including $350k deposit, $2.45m acquisition loan, $189k acquisition costs: $5.935m economic cost, $2.065m profit, $2.485m conservative peak cash. Construction assumptions identical. Owner cash return includes realization of already-held land; economic return on total equity is separately labelled.

## Validation at implementation checkpoint

Fail-first ownership UI, acquisition finance and exact-match market-profile regressions were observed before fixes. Six UI groups, buyer/owner finance reconciliations, nine profile groups, range diagnosis, existing unit suites, security and founder asset packaging pass locally after integration. Independent review found and triggered repairs for buyer sale comparison and independent acquisition/cash-works funding. Full `npm test` passed the chained unit suites then stopped at browser launch because Playwright executables are absent. Browser installer returned truncated/non-ZIP downloads; no local Chromium/WebKit pass is claimed. Earlier interim failures (cache-tag assertion and async test missing the new ownership choice) were repaired without weakening financial/identity assertions.

Eight labelled owner/buyer fixture browser journeys are added to existing CI and deployed QA, covering 390/1280px Chromium/WebKit, native selectors, input retention, lifts/pools, profit ledgers, report parity and save/reopen. Fixture results do not establish live planning evidence or physical iPhone audio. Final Actions, deployment byte parity and live results will be appended after release verification.

## Boundaries and remaining dependencies

No main merge, hosting/visibility change, commercial launch, paid API/service, external communication or licence acceptance. Physical iPhone microphone/audio remains a founder-device check. Saved browser data can be cleared or unavailable and is not encrypted account storage. Professional documents and durable cross-device storage are deferred. Licensed property/comparable data and actual lender/QS/planning evidence require separate access/verification, not invented defaults. Gosford 49 versus official 49–51 and Katoomba 2 versus 2–6 remain unproven identities; exact units/ranges are not relaxed to make QA green. Government spatial failures remain explicit, never “unmapped” or permission.

## First deployed verification and corrections

Code release `01083c40f502d10d60283f287005c9085c7a52cd` deployed successfully; security passed. Actual browser buyer journey resolved Fairlight to 32/DP1729, 415.2m², R1, Manly LEP context and FSR 0.6:1. Three bedrooms/two bathrooms/one car were explicit QA user assumptions, not sourced facts. A $3.5m purchase, $350k deposit within $1.05m purchase cash, $2.45m loan at an illustrative entered 8% produced automatic ordinary NSW duty $173,787 and buyer improvement repayments; browser save/readback/reload/reopen retained financial inputs, role and professional notes. Saved live planning is now explicitly a snapshot requiring refresh, not a claimed government outage; every planning evidence badge is review until fresh verification.

First CI failures were retained and diagnosed: consumer run [38694300588](https://github.com/BoggedCake/ProjectIQ/actions/runs/38694300588) failed two fixed-440-area journey assertions, all eight founder-repair fixed-area cases, and all eight ownership cases at a hidden saved-status text assertion. Known 440m² fixture helpers now explicitly mark user area; original $2,544,625/$2,748,611 assertions remain unchanged. The ownership test opens the saved-project details before asserting the same visible warning. All ownership financial/area/report/input/save checks before that warning passed on both engines. These are test-contract corrections, not cost arithmetic changes or relaxed assertions. Subsequent financial suites originally chained after this failing command were skipped and require fresh verification.

Live run [38694300541](https://github.com/BoggedCake/ProjectIQ/actions/runs/38694300541) also failed these fixture checks, the regional matrix’s unproven Gosford/Katoomba address relationships, and one 390px founder address request: suggestion/candidate returned HTTP200, NSW authoritative address request timed out at5000ms. Real residential, distinct DA/CDC, property-planning and conversation/voice steps passed. Server run [38694300596](https://github.com/BoggedCake/ProjectIQ/actions/runs/38694300596) failed only the same two unproven range identities and their planning prerequisites (10/12 identity,6/8 planning). No identity assertion was relaxed.

Follow-up also clarifies buyer improvement titles, defaults improvement exit to retain/occupy, distinguishes total acquisition/project expenditure from works-only expenditure, preserves source snapshot dates, and treats missing comparable attributes as uncertainty rather than zero. Incomplete essential comparable attributes now withhold a market range rather than claiming high confidence. This remains a working appraisal method without a connected lawful live comparable feed. In the deterministic finance case the $180,000 duty line is an explicit fixture override; it is not the automatic statutory duty for $3.5m.

Final persistence safety check: at the ten-project browser limit, a new save is now refused with a clear message rather than silently evicting an older project. Existing projects can still be updated. Reopening also invalidates pending address-suggestion sequence IDs in addition to cancelling transports. A fail-first storage-limit regression proves previously saved records remain unchanged. This does not establish encrypted or cross-device persistence.

Privacy regression: the new acquisition form state is not copied into optional structured-intent requests. Buyer/owner context is retained, while purchase cash and acquisition borrowing remain in the local financial model; a fail-first request-body regression verifies this boundary. No lender/broker submission or new provider is activated. Existing message/context behaviour of the optional conversation service is unchanged.


## Final application release and independently checked results

Tested and deployed application commit: `6b68f938c12c78634a769fd48bbbeb3364b36c40` on `sitepivot-concept`. The following evidence is for that exact code, not a prior deployment. Documentation-only follow-up does not change application assets.

| Check | Final result | Evidence |
| --- | --- | --- |
| Consumer regression | **PASS**; 416 explicit PASS log lines, zero FAIL lines (not a claim of 416 distinct tests) | [38696718695](https://github.com/BoggedCake/ProjectIQ/actions/runs/38696718695) |
| Security preparation | **PASS** | [38696718762](https://github.com/BoggedCake/ProjectIQ/actions/runs/38696718762) |
| GitHub Pages | **PASS**; deployed parity step checked all 11 application assets against commit | [38696717406](https://github.com/BoggedCake/ProjectIQ/actions/runs/38696717406), live QA wait/parity step |
| Live QA | **FAIL overall** only at regional address smoke; every other test step passed | [38696718702](https://github.com/BoggedCake/ProjectIQ/actions/runs/38696718702) |
| Server-data QA | **FAIL overall**: 10/12 identity and 6/8 planning; same two identity prerequisites unresolved | [38696718800](https://github.com/BoggedCake/ProjectIQ/actions/runs/38696718800) |
| Local unit/security/package | **PASS**; unit log 327 explicit PASS lines, zero FAIL, async completion, plus Node test groups | `npm run test:unit`, `npm run test:security`, `npm run build:founder` |
| Local browser execution | **BLOCKED** by absent executables and truncated browser installer downloads | Superseded for browser verification by successful remote Chromium/WebKit runs; not claimed locally successful |

Final deployed browser results include 16 P0 identity cases; eight founder repair cases; full desktop/iPhone-sized text and voice journeys; property/planning comparisons; real residential addresses; distinct Violet/Nield/Eileen DA/CDC cases; eight Owner/Buyer cases (390/1280px, Chromium/WebKit); four financial cases; and four actual Seaview premium cases. Consumer and deployed financial runs verify native level selection, manual-area preservation, lifts/pools, profit ledgers, reports and save/reopen. Browser voice lifecycle verification uses automation, not physical iPhone audio.

The remaining smoke/server failures are exact `49 Mann Street Gosford` versus authoritative `49–51` records, and `2 Civic Place Katoomba` versus `2–6`. A relationship cannot be asserted without distinguishing authoritative evidence. They remain blocked rather than being silently substituted. Dixon unit 84/2–8 identifies to lot52/SP68567, but missing required authoritative parcel attributes leave parcel-derived measurements unknown. Newcastle retained a SEPP timeout in this server run. Fairlight returned planning without errors in the final server run. One otherwise successful deployed text/voice journey recorded a failed request, so no universal claim that external services never fail is made.

### Required same-project Owner/Buyer reconciliation

A second deterministic check uses automatic dated ordinary NSW duty **$173,787** for a $3.5m purchase, rather than the earlier $180,000 explicit fixture override. The official 2026/27 rule was independently checked against Revenue NSW. Full machine-readable assumptions/results: [financial evidence](evidence/owner-buyer-financial-2026-10-15.json).

| Same $3.5m site, $2m construction, $8m completed value | Owner, confirmed $1.5m debt | Buyer, $2.45m acquisition loan |
| --- | ---: | ---: |
| Purchase cash, including deposit | $0 | $1,050,000 |
| Acquisition expenses | $0 | $182,787 |
| Construction borrowing | $1,000,000 | $1,000,000 |
| Finance expense | $200,000 | $246,000 |
| Economic total development cost | $5,700,000 | $5,928,787 |
| Estimated scenario profit | $2,300,000 | $2,071,213 |
| Profit on revenue | 28.75% | 25.89% |
| Return on total development cost | 40.35% | 34.93% |
| Conservative peak new cash | $1,200,000 | $2,478,787 |
| Return on total equity committed | 71.88% | 83.56% |

Buyer deposit $350,000 is part of purchase cash, not an extra expense. Owner retained land equity $2m is separate from new cash; buyer purchase equity is $1.05m. Borrowed principal is funding, not an expense. Rates (10% development, 8% acquisition) and zero ancillary lines in this accounting fixture are explicit illustrative inputs, not lender quotes or verified exemptions. This table tests arithmetic, not bankable project viability. Owner cash-only return would include realization of pre-existing land and is therefore not comparable to buyer cash return; the UI uses the separately labelled total-equity measure for owner economic comparison. Rates/periods and acquisition costs explain the differing results while construction is identical.

The RBA page was also checked: the latest available August2026 new owner-occupier P&I benchmark remained6.15%. That category is not represented as a verified development/construction loan rate. Existing dated rate/duty code required no replacement.

### Actual interactive founder website check

Manual browser interaction on the final code resolved Fairlight, followed the Buyer kitchen-renovation journey, edited acquisition price/cash/loan/rate, calculated repayments, saved a user-supplied professional note, reloaded, reopened and reassessed. Price $3.5m, deposit $350k, cash $1.05m and loan $2.45m remained intact. Current-property sale actions were absent for the unowned subject. Saved planning was visibly a dated snapshot requiring refresh. The view distinguished works-only expenditure from acquisition plus project expenditure. This supplements CI rather than replacing its desktop/mobile assertions.

### Founder acceptance and remaining scope

Open https://boggedcake.github.io/ProjectIQ/ and reload once. Choose Owner or Buyer before entering the address. Test the same property under each role, confirm acquisition versus retained-land treatment, change the building arrangement, manually enter an area and confirm it stays fixed, then save/reopen and add findings for reassessment. Use actual personal assumptions only if comfortable storing them in this browser. Saving is local to this browser/device; clearing browser data loses it, and ten existing projects are not silently evicted. Physical iPhone speech/audio and comfortable real-device interaction remain founder checks.

Research adapters are integration-ready, not active property enrichment. No verified live bedrooms, internal floor area, comparable sales or current market valuation has been invented. Licensed data rights/access, resolved regional address-range relationships, missing parcel attributes, professional planning/QS/lender evidence, document upload and cross-device persistence remain dependencies. No paid service, production launch, main merge, repository visibility or hosting change occurred.
