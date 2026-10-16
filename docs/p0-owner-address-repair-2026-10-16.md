# P0 owner and address repair — 16 October 2026

Starting GitHub head: `8313c06b5cdaafd76fb4a623469d81a257c543a7`. Its consumer/live, server, security and Pages runs passed, but did not cover the newly reported direction-loss and owner-input defects. Preserve the existing founder-testing deployment; no main merge or infrastructure change.

## Address evidence and correction

Official NSW Address Point returned one exact record for 61 / NEW / BALGOWLAH HEIGHTS: `61 NEW ST WEST, BALGOWLAH HEIGHTS NSW 2093`, objectid `2509688`, ap_gurasid `72720191`, lot_cadid `102197818`, cadastral identifier `15/B/DP2044`. A separate cadastral query confirmed lot 15, DP2044, section B. Registered plan area was null; geometry area must retain its own calculated provenance.

Source: NSW Address Point Formatted FeatureServer/0 at https://portal.spatial.nsw.gov.au/server/rest/services/Hosted/NSW_Address_Point_Formatted/FeatureServer/0 . Retrieved 16 October 2026. The geocoder suggestion omitted WEST; no authoritative suffix-free alias was established. The old parser included WEST in locality and both adapters omitted `streetsuffix`. The shared matcher now treats direction separately, preserves a complete typed direction/unit contradiction through selection and requires official component agreement. Ordinary partial autocomplete input still uses the selected candidate. Opposite directions cannot silently replace the explicit request.

## Performance scope

Diagnostic actual-source measurements in this execution environment: exact official address request cold 15,271ms, cached warm 0ms; separate parcel query 9,795ms. These are individual samples, not p95. Normal production-budget API resolve attempts timed out (8,501ms; 7,271ms), so these diagnostics do not prove a repaired live consumer journey or the target latency.

Existing bounded timeout/retry and verified-response cache remain. Identical uncancelled server requests with the same budget now share in-flight work; caller-owned cancellation remains isolated. Synthetic concurrent transport regression changed two upstream requests to one (83ms artificial transport), not a live latency claim.

The Pages client previously waited for all secondary planning sources before publishing parcel/core controls and frontage. It now publishes the confirmed parcel, then core zone/height/FSR/lot controls, and frontage independently. Supplementary checks remain loading, never clear/verified by omission; planning eligibility stays withheld until the full source phase resolves. Sequence, property identity and cancellation guards reject stale publication. Source timestamps and timing fields are retained.

## Owner inputs and financial reconciliation

Three primary owner money inputs: current improved-property market value; completed-home value; outstanding mortgage. All secondary development finance/living/contribution/tax controls are under one closed Advanced assumptions section. Optional different home values retain saved grouped products; market context and reports use the same product sum. Buyer acquisition is separate.

Current equity for the mandatory reference is $3,500,000 − $1,500,000 = $2,000,000. Economic cost counts current property opportunity value once, not the mortgage principal. Progressive interest is an economic expense once; capitalisation increases the debt balance but is not another expense. The new owner position ledger separates debt, completed equity, net sale proceeds, new cash invested and equity created. Sale disposal costs are deducted either from receipts or from cash invested, not twice. Retain has no disposal receipts/commission or realised profit. Full-period existing-debt interest is included; a do-nothing interest counterfactual is not modelled.

The old automatic 4% revenue tax sensitivity is removed. Missing project GST and income-tax treatment remain unresolved, not verified zero. The base result is before project GST adjustments and income tax; construction budgets retain included GST and no input credits are assumed. Explicit saved tax sensitivities are preserved separately, never claimed as statutory liabilities. New-residential GST, enterprise/registration, margin scheme, credits and income tax require accountant review: https://www.ato.gov.au/businesses-and-organisations/gst-excise-and-indirect-taxes/gst/in-detail/your-industry/property/gst-and-residential-property .

### Original reported $8,199,866 — limits of reconstruction

The supplied totals reconcile arithmetically: $8,000,000 − $8,199,866 = −$199,866; margin −2.498325%; return on cost approximately −2.4374%. Incremental economic expenditure implied by a $3.5m property opportunity value is $4,699,866. No saved scope, area, finish, lift/pool, duration, contribution or loan schedule accompanied this latest report, so its component ledger cannot be independently reconstructed. Do not tune quantities to force this total.

If (not verified) that run contained the former 4% sensitivity, $320,000 of its total was that assumption: removing only it gives pretax cost $7,879,866 and pretax profit $120,134. This is conditional arithmetic, not the verified corrected founder result. If peak cash $1,291,720 equals new cash invested with no refundable bond, the reported totals imply completion debt $4,908,146 and receipts after debt $3,091,854. Again these are algebraic implications, not a reconstructed lender schedule.

### Independently checked synthetic ledger

`qa/owner-financial-position.cjs` deliberately uses synthetic scope, not a property valuation or planning consent: $3.5m current property, $1.5m debt, $2m delivered build, $8m GRV, 50% construction borrowing, 10% interest, 12-month construction, no other phases, cash-paid interest, an explicitly synthetic contribution exemption. Interest = $150,000 existing debt + $50,000 progressive construction. Disposal = $176,000 commission including GST + $10,000 marketing + $3,000 legal + $500 settlement + $1,500 other = $191,000. Total = $5,891,000; pretax profit = $2,109,000. Completion debt $2.5m; completed equity $5.5m; net proceeds after debt/disposal $5.309m. Deduct $1.2m non-disposal new cash and $2m starting equity: the same $2.109m economic gain. Capitalised interest, zero debt, retain, explicit tax and refundable-bond variants have separate assertions.

## Release gate

Focused new regressions must run alongside the existing suites. Local browser launch is unavailable because Playwright executables are not installed; do not equate unit results with Chromium/WebKit acceptance. Existing GitHub Actions install browsers, compare deployed assets and run real property journeys. Final release status, browser measurements and any external-only failures must be reported from those runs, not inferred here.
