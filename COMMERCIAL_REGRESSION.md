# SitePivot commercial journey verification — 6 October 2026

Implementation commit: `3a371686428a7bd9754290db92fa2fccc324c1bf`, branch `sitepivot-concept`. Main was not merged or updated.

The existing history, founder regression record and current application were reviewed before this pass. The attached commercial brief supplied the approved changes; the address/cadastral/planning/confidence architecture remains in place.

## Confirmation issue

The startup binding fix is present: the assistant prompt collection uses `$$('[data-assistant-prompt]')`, so binding proceeds to `confirmProperty`. “Yes, use this property” reached the Property Passport in automated Chromium and direct deployed browser testing for 57 Griffiths Street, Fairlight and 9 Waratah Street, Balgowlah.

## Implementation and protection

- Delivered development rate cards explicitly store low/mid/high, inclusions, exclusions, configuration, region, quality and version. Premium two-storey 440 m² × $6,800/m² produces $2,992,000 before excluded commercial costs. Homeowner costing remains separate. Basement configurations have specific rates; Custom requires an explicit rate.
- Feasibility models product GRV, land opportunity cost, excluded costs, staged finance/duration, finance establishment, holding, sales/marketing/legal, net tax sensitivity, total cost, profit on cost/sales and residual land value. Included fees/contingency are not added twice. Invalid finance inputs stay review.
- Licensed market and structured AI intent adapters are server-only, validated, timeout bounded and honest when unavailable. Listing asking prices remain separate from sold evidence; no live request falls back to fixture values. Provider labels are escaped.
- Early text/voice intent is followed by editable confirmation and manual fallback. Room allowances are versioned and area overrides are secondary. Moving comparison is opt-in. Currency fields format whole-dollar amounts while preserving numeric state and logical cursor position.
- Cadastral road-facing boundary derivation returns indicative primary/secondary frontage and removes shared parcel edges. Official Northern Beaches flood/acid GIS adapters preserve affected/clear/unavailable/manual states and provenance. Council clear results cannot suppress a mapped state flood warning.
- Assessment and report present five simple consumer sections, with technical controls behind disclosure. Late planning preserves user-confirmed dwelling data, drafts, resolved market evidence and assessment consistency. Reset guards reject stale identity, market and speech events.

## Fresh verification

| Run | Result | Evidence |
| --- | --- | --- |
| Consumer regression | 80/80 named cases; 21 actual Chromium journey scenarios, plus the existing 63 invariant checks | [CI run](https://github.com/BoggedCake/ProjectIQ/actions/runs/37444457527) |
| Exact deployed assets and live consumer/provider QA | Passed; consoleErrors and requestFailures empty | [CI run](https://github.com/BoggedCake/ProjectIQ/actions/runs/37444457620) |
| Live server data QA | Passed: 11 addresses, exact street-number/unit protection, three planning cases, route/failure contracts | [CI run](https://github.com/BoggedCake/ProjectIQ/actions/runs/37444457539) |
| Local non-browser regression | All 59 named commercial/provider/consumer/model/async cases passed | Five production-code test scripts in `qa/` |
| Direct deployed browser | Fairlight search → confirmation → Passport → user-confirmed dwelling → intake fallback → extension rooms → formatted budget → optional move → assessment and all detail tabs → roadmap → five-section report → typed chat with voice replies enabled → change property → fresh Balgowlah Passport → start over | Saved browser report proof; no application console errors |

Chromium journey scenarios cover all five homeowner buttons (development leads to its choices), every development button, scope/assessment/all tabs/report, mobile navigation, voice adapter input/output, natural female voice preference, metadata-free speech, reset, structured intake confirmation, provider-unavailable fallback, moving/currency editing and all four construction configurations. Every previous test remains; details are opened where disclosure is now required.

The local environment could not install Chromium because the browser download was truncated. The full `npm test` command ran successfully with installed Chromium in CI. Local model/provider/DOM/async tests ran against the same production files.

Official Northern Beaches server testing on the Fairlight parcel returned flood `council-mapping-clear`, acid `council-mapping-affected` (Class 5), and indicative frontage 12.4 m primary plus 33.7 m secondary. Newcastle/Wollongong retain manual council review because their adapters have not been validated. Source failures remain explicit.

## Genuine external blockers

The entire production founder journey is **not certified complete**. The following cannot be represented as working live integrations:

1. The published GitHub Pages host is static. It cannot execute `/api/*`. Deploy this existing branch on a serverless host supporting its `api/` routes (the repository includes `vercel.json`), or configure the existing API base integration. No server deployment connection or credentials were available for this pass. Browser planning continues to preserve partial/failed-source states.
2. Connect a licensed sold/listing data gateway with consumer display rights using server-only `SITEPIVOT_MARKET_ENDPOINT` and `SITEPIVOT_MARKET_TOKEN`. It receives `{version:'market-v1',property}` and returns the four normalized evidence collections. Sold rows require stable ID, source, positive price and dated sale provenance. Asking prices do not generate valuation ranges.
3. Connect a real structured AI gateway using server-only `SITEPIVOT_INTENT_ENDPOINT` and `SITEPIVOT_INTENT_TOKEN`. It receives the versioned schema, instruction and text and returns `{profile,confidence}`. Contract and UI tests use explicitly controlled provider responses; this does not prove live AI interpretation.
4. Actual microphone input returned permission denied in the cloud browser. Automated recognition/synthesis adapters passed, and the live voice-reply UI was exercised, but actual acoustic capture/playback and subjective voice quality require a microphone-enabled device.

After these integrations are configured, rerun `npm test`, `npm run test:providers`, and `npm run test:live` against the actual API-backed deployment and perform real spoken input/output. Provider integration changes are subject to the same complete affected-journey regression requirement.
