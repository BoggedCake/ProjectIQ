# SitePivot property and conversation repair — 9 October 2026

## 1. Executive summary

The existing SitePivot architecture and founder Pages workflow remain in place. This pass replaces unsupported geometry/frontage inference with shared source-aware measurements, introduces a bounded planning applicability evaluator, retains the active property and proposal through follow-ups, repairs multi-segment voice transcripts, and adds an actionable keeping-versus-selling comparison. Unknown inputs remain unknown.

The baseline was `9381d80e2ffb3a21ca76034f686784f22d36d33c`. Earlier founder cost, add-level, speech completion, official NSW duty and duplex configuration repairs were preserved. Main has not been merged or changed. No service purchased, licence accepted, credential exposed or external communication sent.

## 2. Property accuracy findings

Official address, Lot119/DP12764 and property913020 records identify one associated Fishbourne parcel. The official plan-area attribute is null. The previous spherical geometry calculation reproduces610.49m²; an ellipsoid local-scale calculation gives608.92m². Neither establishes the registered survey area. The founder screenshot reports847m², which is retained as explicitly reported evidence and a discrepancy requiring title/survey reconciliation; it does not overwrite mapped geometry.

The old83.4m frontage result came from near-parallel parcel edges beside road centrelines, including edges not sharing a road boundary. Official RoadCorridor polygons now give separate mapped contacts: Fishbourne10.5m, Orara39.8m, unnamed corner5.4m. These are indicative mapped contacts, not surveyed frontage or width at the building line. Curved geometry and missing corridors are withheld for survey review.

Shared validation handles known CRS, holes, nested islands, multipolygons, duplicate/aligned-overlapping rings and address/parcel identity. Ambiguous multiple parcels are withheld rather than summed. Full multi-parcel ownership/title aggregation remains unresolved. See [primary reconciliation](fishbourne-property-accuracy.md) and `qa/fixtures/property-evidence/` for exact queries and retrieval dates.

## 3. Planning logic improvements

`planning-intelligence.js` separates land-use consent, ordinary duplex area standards, ordinary subdivision, LMR non-refusal standards, dual-occupancy subdivision and CDC. It keeps raw control clause/instrument provenance. A mapped600m² subdivision control cannot become a duplex minimum.

For current WarringahR2 ordinary assessment, the reviewed benchmark is at least800m². A472.6m² representative case fails that standard without being falsely called prohibited. LMR450m²/12m and subdivision225m² benchmarks require supplied evidence of the legal walking catchment and complete exclusions; town-centre proximity and a negative single exclusion layer do not establish applicability. Standards do not grant R1/R3/R4 permission. CDC retains its independently applicable local parent-lot minimum and separate certifier/design checks. Central Coast attached550 versus detached700 remains distinct where that reviewed LEP provision applies.

Savings are scoped to the Warringah amendment. Historical/future assessments and unreviewed provisions require refresh. Granny flats, single-home rebuilds and ordinary subdivision remain separate assessments. No approval probability or guaranteed eligibility is generated. Full current statutes returned403 during research; official council/NSW guidance and scoped indexed provisions support this bounded release, which is not a comprehensive legal review. See [source research and limitations](../planning-source-research.md).

## 4. Conversational intelligence

Typed and voice input share the same interpreter and property session. Proposal, title type and attached/detached configuration persist through meaningful follow-ups. A rejected duplex followed by kitchen renovation clears the old proposal; negated selling disables move interest. An attached/detached follow-up reassesses the retained proposal rather than emitting an empty message.

The interface places the property-specific answer before generic pathway text. A failed ordinary standard leads with planning checks; scenario pricing remains an explicit secondary option and does not establish permission. The consumer can compare keeping and selling within the existing journey. The original472.6m² and Central Coast screenshot addresses were absent, so these have not been presented as recovered live-address tests.

## 5. Voice improvements

Web Speech recognition remains en-AU. Recognition events now accumulate all final/interim segments instead of replacing earlier words with only the latest event. Raw text is retained. Narrow “jewel occupancy”/“dual occupation” corrections preserve ordinary names and street text, flag the correction for user review and use the same typed routing. Low confidence also requests transcript review. The historical origin of the reported “jewel” output cannot be proven without its original transcript/logs.

Existing sequential TTS, cancellation, Australian locale/voice preference, speech-only units/currency/acronyms and working fallback were retained. No new neural service or credential was activated. Browser voices vary by device; premium neural TTS and physical iPhone listening remain separate dependencies. Script URL versioning prevents the newly observed mixed old/new browser-cache runtime.

## 6. Compare Alternatives

`comparison-engine.js` reuses the existing official versioned NSW transfer-duty engine. Sale costs, purchase costs, inspections, mortgage payout/equity, finance, holding and future replacement work are separate quantities. Blank loan/finance/project allowances remain unknown rather than becoming free. Loan repayment changes the funding gap; it is not a second transaction cost. A known unsuitable pathway cannot be recommended merely because it is cheaper. Tax and borrowing capacity are not invented.

The existing assessment shows a compact changeover breakdown, known-cost comparison, missing inputs, replacement criteria and ordered appraisal/lender/broker/planning/settlement steps. Meaningful assumptions are editable, with whole-dollar display. No outbound referral or communication occurs.

## 7. Performance

The first successful CI live regional run measured median suggestions 41 ms, p95/max 245 ms, with planning retrieval 4482–5522 ms. The final runtime regional run passed 12 identity and eight semantic planning checks: median suggestions 48 ms, p95/max 580 ms. Earlier preserved baseline run measured median46ms and p95/max239ms; these are separate samples, not proof of a causal speed improvement. Local direct-fetch and environment-proxy attempts timed out and are retained in `2026-10-09-regional-live-probes.json`. Public source timing varies by environment.

Browser source requests have a short exact-query cache and explicit progress. A measured cold geocoder call took5.2s, exceeding the old3.5s identity budget; identity resolution now allows8.5s while suggestion responsiveness remains separately tested below3s. No invented latency claims or blanket all-NSW availability claim.

## 8. Regression and independent review

The final non-browser suite passed 202 checks (exit 0). Browser results and deployed verification are recorded below. Independent review reproduced four Important defects: stale rejected proposals, unsuitable replacement recommendations, blank configuration follow-ups and aligned polygon overlap. Each was covered by a failing regression and fixed. The reviewer also identified road-name/CRS propagation and downsizing inspection arithmetic, which were repaired.

Two local Playwright installation attempts failed with truncated0MiB archives. Full local `npm test` therefore reached the missing-browser-binary error; it was not reported as passed. The first connector release accidentally omitted the two new runtime modules and failed CI. The corrective commit included them, and the local/remote complete source-tree hashes were compared. Superseded CI runs were cancelled by branch concurrency. The final release verification below distinguishes local blocked browser installation from the successful CI browser environment.

## 9. Outstanding dependencies

Registered Fishbourne plan/survey and advertised-property scope; reliable complete LMR walking/exclusion evidence; comprehensive current LEP/SEPP/DCP provision ingestion and legal review; measured building-line width/access; multi-parcel title association; other-than-two subdivision lot-count capture; licensed live market/sold data where not already available; device-specific Australian voice quality and physical iPhone microphone/audio testing. These gaps do not become confirmed permission, prohibition, value or lending conclusions.

Live regional probes include institutional and strata properties as coverage/ambiguity cases. Gosford's44m² is the returned individual address-associated parcel, not proof of the whole council building site. Dixon's unresolved strata geometry uses address-point planning and withholds area. Split-zoned civic parcels remain unresolved for development. These cases demonstrate explicit limitations, not homeowner duplex approval.

## 10. GitHub and founder testing

Approved branch: `sitepivot-concept`. Existing testing URL: https://boggedcake.github.io/ProjectIQ/ . The canonical Notion Founder Authority page was re-read and already contains the current permanent development/testing authorisation.

Founder checks: resolve12FishbourneRoad; inspect the608.9/847 discrepancy; confirm dwelling details; ask about duplex and minimum size; switch to kitchen renovation; ask to add another level; compare keeping with selling using working sale/purchase/loan values. Labelled fixtures are available with `?fixtures=1`. No local server, ZIP or new hosting is required for founder testing.

## Release verification appendix

Verified runtime checkpoint: `9a0c67493df1cefcab0cf90b34ad1205214786ed`. GitHub consumer regression (37921784598), live QA (37921784423), server-data QA (37921784329), and Pages (37921784839) all completed successfully. These include Chromium/WebKit property journeys at 390, 430 and 1280 pixels, plus existing mobile/conversation/voice journeys. The final local non-browser suite passed 202 checks with exit 0.

Two further planning evidence regressions, semantic assertions to regional probes, and preservation of property-journey screenshots were added. This report does not imply physical iPhone audio verification.

Live UI additionally reproduced “Forget the duplex. I want to open my kitchen and living room.” retaining the rejected duplex. The exact sentence failed a new regression before repair. Dismissal clauses are now excluded from semantic project interpretation while the raw user message remains preserved; the replacement renovation clears the prior proposal. Runtime asset version 4 prevents mixed cached modules.

Live desktop acceptance on runtime `b836516aa261021d1c4f16a3fb6e55f5dc85324a`: actual Fishbourne address resolution and passport; 800 m² ordinary duplex benchmark with 600 m² mapped-control distinction; explicit duplex dismissal to kitchen/living; vertical addition with bedroom/bathroom; keeping-versus-selling assessment. With illustrative sale $2,000,000 / purchase $2,500,000 / loan $800,000, the interface showed duty $118,787, transaction costs $190,787, equity $1,137,500 and capital required after loan repayment $1,490,787. Desktop document width 1348 px within the 1363 px viewport. All seven deployed runtime files matched the local/GitHub source bytes.

A live profile-confirmation click required a second click in the cloud browser on two attempts; the eventual profile and conversation worked. This intermittent interaction is recorded as an unresolved usability observation, not hidden by CI success. Dedicated before/after mobile conversation latency measurements and physical iOS microphone/audio quality remain unverified.

Final code release: `b836516aa261021d1c4f16a3fb6e55f5dc85324a` on `sitepivot-concept`. All four final workflows completed successfully: Pages 37923226952; server-data 37923227542; consumer 37923227596; deployed live QA 37923227677. Full `npm test` and all subsequent consumer/browser steps passed in CI. The property-specific matrix passed all six Chromium/WebKit × 390/430/1280 px flows, including no horizontal overflow, document-level conversation scrolling, grounded planning follow-ups and compact changeover arithmetic. Existing founder tests also passed at 375 px. Voice lifecycle checks passed 17/17; browser checks exercised complete queued speech, interruption, reset, blocked-audio retry and delayed voice availability. These use browser test doubles and do not substitute for audible physical-device review.

Screenshots and JSON results are preserved in [consumer CI evidence](https://github.com/BoggedCake/ProjectIQ/actions/runs/37923227596). The desktop conversation screenshot uses the real Fishbourne property; the mobile planning screenshot uses explicitly labelled synthetic test dimensions, not the unidentified original founder property. The final documentation commit does not change application code; the preceding release SHA identifies the exact runtime tested above.

Main remains `2e7f85d1c935ce0d0f5253b05471211c817e3e62`. Existing founder-testing Pages was updated under standing authority. No commercial launch, main merge, new hosting, paid commitment, licence acceptance, authentication expansion or external communication occurred. Canonical Notion authority already matched the superseding rule when re-read, so no duplicate authority document was created.
