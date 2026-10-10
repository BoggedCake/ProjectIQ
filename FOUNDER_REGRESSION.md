# SitePivot founder regression — 6 October 2026

Continued `BoggedCake/ProjectIQ` on `sitepivot-concept`; main was not merged or changed. Recovered the branch commit history, repository implementation/QA notes, prior SitePivot conversation decisions and approved consumer briefs before implementation. Preserved the current product structure and calculations.

## Reproduced startup failure

The starting head `5e186a4` had no working startup-binding fix. `bind()` called `$('[data-assistant-prompt]').forEach(...)`; `$` resolves an element by ID, so this threw on null before the property confirmation and navigation listeners were registered. The actual deployed browser stayed on property confirmation after clicking “Yes, use this property”. A test-only commit reproduced the failure before the selector was changed to `$$` (querySelectorAll).

## Regression protection

Run Node 24+, `npm ci`, `npx playwright install --with-deps chromium`, then `npm test`.

- `qa/model-regression.cjs`: 11 tests covering startup, the existing 63 evidence/calculation assertions, feasibility chat, unknown and failed evidence, dwelling provenance, speech cleanup, negative hazard results, report disclosure, parcel verification and document metadata.
- `qa/async-regression.cjs`: 11 tests covering reset races, late voice callbacks, browser/server unit identity, dense address responses, late planning/dwelling drafts, assessment refresh, normalized failed-source contracts, parcel failure isolation and full API outages.
- `qa/journey.cjs`: 14 actual Chromium UI scenarios. Four direct homeowner routes plus five development routes each run through scope, assessment tabs, roadmap and report. “Develop my property” is the fifth homeowner button and enters the development routes. Includes keyboard address selection, Use this property, dwelling confirmation, progressive disclosure, prompt chips, typed chat, simulated recognition/synthesis, change property, start over and mobile touch/no overflow. Fixtures/API mocks are explicit test boundaries, not live evidence.
- `npm run test:providers`: real handler and live NSW provider tests for 11 address identities across nine LGAs, exact street numbers/unit identity, three planning examples, input validation and failure contracts.
- `npm run test:live`: deployed Chromium smoke against the exact published HTML. Live Fairlight founder journey, all pathway buttons/development choices, statewide identity matrix, cadastral/planning evidence, chat, mobile layout, console and failed requests. Set `SITEPIVOT_URL` to a serverless deployment for API acceptance.

Each branch push runs all three workflows. The live workflow compares deployed HTML byte-for-byte with the checkout before testing; a stale shared build marker cannot pass that gate.

## Bugs repaired with regression coverage

- Startup selector stopped property confirmation and later navigation binding.
- Unit parsing/scoring confused the unit with the street number; a dense Sydney response returned only the first 100 addresses and omitted unit 84. Browser and server now narrow the authoritative query and retain exact matching.
- Reset and late speech/identity callbacks could affect the next property; resets invalidate requests and recognition callbacks.
- Late planning refresh could lose dwelling drafts or leave an assessment/report using stale evidence.
- Missing dwelling numbers/frontage could receive a misleading Verified label; user confirmations preserve their provenance.
- Failed planning requests could appear as Not mapped. Full outages retain unknown controls; parcel lookup failures preserve successful point-based planning checks and flag parcel boundary verification.
- Negative bushfire/flood results could generate false professional recommendations.
- Feasibility chat used an absent profit field and treated a dollar margin as a percentage.
- Speech could include evidence labels, dates and source metadata; speech cleanup removes these. Existing AU/GB female voice preference is retained and tested.
- Technical policy detail overwhelmed the report; primary controls stay visible, full evidence remains in a closed disclosure.
- Existing self-test assertions referenced obsolete wording/cadastre service names.
- A literal escaped newline in the head rendered above the header and displaced build metadata; metadata/DOM regression added.

## Verified results and acceptance limits

At implementation commit `ca61968356345108036a6acc70ba895a0e70d171`, all three workflows passed:

- [Consumer regression](https://github.com/BoggedCake/ProjectIQ/actions/runs/37434319258): 10 model tests, 11 asynchronous tests and 14 Chromium scenarios, including existing 63 invariants.
- [Live provider/handler QA](https://github.com/BoggedCake/ProjectIQ/actions/runs/37434319262): full address/planning matrix passed.
- [Deployed browser QA](https://github.com/BoggedCake/ProjectIQ/actions/runs/37434319312): founder report/reset, all pathways and ten additional identities passed; 795 ms initial suggestions, no JS console errors. Two aborted direct address fetches successfully fell back; recorded in the logs rather than hidden.

The final metadata-only markup repair adds the eleventh model test; check the newest workflow runs for that final commit. Local model/async tests and whitespace checks pass. Actual local Chromium installation was blocked by a truncated download; full browser automation ran successfully in GitHub Actions instead. The cloud browser separately confirmed the final code's address selection, Passport, confirmed dwelling details, assessment, risk panel, roadmap and simplified report.

Real audio acceptance remains blocked: the cloud browser returned microphone permission denied. The UI visibly retained typed chat. Automated recognition/synthesis adapters verify transcript flow, reset isolation, voice selection and cleaned speech; they do not establish microphone capture, audible output or subjective voice quality on a consumer device.

GitHub Pages serves static HTML and cannot run the existing `api/*` server routes. Real provider calls can still time out or be blocked by browser CORS/ORB; an earlier run failed on a Waratah address timeout before the final run recovered. Production acceptance requires deploying the existing `vercel.json` and API routes on a serverless host and rerunning the complete live suite there. No Vercel deployment capability/credential was available in this session. No source failures are treated as negative evidence, and no live bed/bath/car or market values are invented.
