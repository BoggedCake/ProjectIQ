# SitePivot consumer consolidation — final QA

Implementation tested: `5f982ded0315b9a9495714f633f366ff52ebb744` on `sitepivot-concept`.
Date: 7 October 2026. Baseline: `15f750fe2fa87c58ce4add5f817414b7af27bffd`.
The final documentation commit changes no application or test code. Main remains `2e7f85d1c935ce0d0f5253b05471211c817e3e62`.

## Final verification

| Gate | Evidence | Result |
|---|---|---|
| Model, commercial, intake, UI, provider contracts, async and full Chromium suite; WebKit mobile journeys | [Consumer run](https://github.com/BoggedCake/ProjectIQ/actions/runs/37552873066) — 121 PASS checks, exit 0 | Pass |
| Real deployed address/property/planning smoke and full founder journeys | [Live run](https://github.com/BoggedCake/ProjectIQ/actions/runs/37552873139) — 17 founder checks, no application page errors, no failed requests in final run | Pass |
| Official NSW identity, cadastral, planning, frontage, council and failure contracts | [Provider run](https://github.com/BoggedCake/ProjectIQ/actions/runs/37552873129) — 11 address identities, 3 planning contracts, API validation and honest failure states | Pass |
| Pages build and deployment | [Deployment](https://github.com/BoggedCake/ProjectIQ/actions/runs/37552873099); deployed HTML and commercial engine match tested source | Pass |
| Independent review | Five Important findings reproduced with RED tests, fixed and re-reviewed; no remaining Critical/Important finding in scoped fixes | Pass |
| Actual cloud browser | Final real Fairlight address → Passport → confirmed 3/2/1 → exact renovation intake → scope → assessment → roadmap/report; return navigation → duplex → working values → full feasibility → roadmap/report | Pass |

## Founder acceptance results

57 Griffiths Street, Fairlight NSW 2094 resolves to lot 32 / DP1729, Northern Beaches, approximately 416.3 m². Mapped frontage is indicative, approximately 12.4 m, with an additional road-facing boundary; a survey remains authoritative. Bedrooms, bathrooms and parking stay unknown until supplied or explicitly confirmed.

Exact typed and controlled voice transcript:
> I’m thinking about renovating my current property. I want to open up the kitchen, make the living area bigger and renovate my bathroom.

Both produce Improve my home with kitchen, bathroom, living/dining and open-plan internal changes. No additional bedroom, master suite, upper-level or garage questions appear. Optional budget stays blank unless supplied. At premium finish and ordinary complexity the versioned component assumptions give $72,000–$201,600, working midpoint $120,000: kitchen $48,000, bathroom $33,600, living refurbishment $12,000 and open-plan structural work $26,400. These are indicative founder allowances, not verified quotes. The next step is structural advice and a priceable scope; value is not invented from cost.

Duplex → 2 storey → 440 m² → premium delivered midpoint $6,800/m² gives exactly **$2,992,000**. Consultants, approvals, included site works and construction contingency are not added again. The illustrative delivered-cost composition sums to that same amount.

With explicit working site value $4,000,000 and working completed value $4,000,000 per home: two homes give $8,000,000 GRV. Under the displayed finance/exclusion assumptions, total development cost is $8,111,755, profit is -$111,755, profit on cost and GRV round to -1.4%, and residual land value at the configured target profit is $2,653,853. Council costs are visibly unpriced, so this remains preliminary. Values entered by the user remain **Your working assumption**, never Verified.

## Protected consumer journeys

All five original directions and all five development types complete scope, assessment, next steps and report. The four building arrangements remain separate from development type; custom arrangements require an explicit delivered rate. Relevant extension/upstairs rooms generate area estimates, with adjustment secondary. Unsure routes to relevant questions rather than fabricated renovation pricing.

One primary result scroll shows project, cost, value, development feasibility where relevant, up to three material checks and next action. Evidence and assumptions remain behind one secondary control; all retained planning/cost/market/comparison/check sections are accessible. Both 390×844 and 393×852 pass Chromium and WebKit full journeys without horizontal overflow, including opened evidence sections.

Regression protection covers manual intent edits, text/voice equivalence, female Australian/British natural voice preference, clean spoken text, chat, change property, start over, voice reset, late intent/property/planning responses, dwelling drafts, confidence states, delivered arithmetic, user value inputs and full feasibility.

Review fixes protect mixed and negated directions, existing apartment renovations, room-specific finishes, direction changes, unknown costs and explicitly unpriced work. A configured AI provider cannot silently discard known unpriced work. A late government JSONP response now reaches a harmless retired callback until page unload instead of causing ReferenceError. Every discovered implementation bug received a practical RED → GREEN regression.

## External dependencies and practical limits

GitHub Pages is static and cannot execute the server-side AI or licensed-market routes. Deterministic intake and explicit financial working assumptions keep the founder journey useful. Structured-provider integration is tested with contract responses; a live licensed market/AI provider is not claimed to be configured. Voice transcripts, lifecycle, preference and synthesis payloads are tested through controlled browser speech APIs; microphone hardware, recognition availability and installed voices remain device/browser dependent.

Official planning services can time out or reject cross-origin browser requests. Server QA preserves failed layers as unknown; it does not convert missing flood or other evidence into a cleared constraint. The final deployed run had no failed requests, while earlier runs exposed intermittent upstream ORB failures and the now-fixed late callback error. Northern Beaches server QA returned council flood mapping clear and acid sulfate Class 5; the static consumer browser requests council confirmation where that check is unavailable.

Cost components, area allowances and feasibility assumptions stay versioned. This pass did not alter the authoritative planning/cadastral architecture, merge main, replace missing market evidence with examples, or treat preliminary financial outputs as professional advice.
