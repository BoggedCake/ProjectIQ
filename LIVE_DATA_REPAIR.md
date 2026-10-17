# SitePivot live property data repair

Date: 6 October 2026  
Branch: `sitepivot-concept`

## Root cause

The original prototype coupled autocomplete and property enrichment to slow statewide ArcGIS queries and then attempted many NSW Planning Portal / hazard / DCP spatial requests directly from a GitHub Pages browser.

Deployed Chromium QA reproduced the failure. Fast geocoder requests succeed, but a number of NSW planning endpoints intermittently fail from the browser with cross-origin / ORB blocking or timeouts. The same provider logic succeeds when executed server-side.

Therefore GitHub Pages is suitable for the static prototype UI but is not a reliable production host for statewide planning enrichment by itself.

## Repaired architecture

1. Fast address suggestions: ArcGIS World Geocoder, NSW/Australia address category only.
2. Authoritative property identity after selection: NSW Address Point Formatted.
3. Exact-number/unit-aware ranking prevents nearby-address substitution.
4. LGA is returned from the authoritative NSW property record.
5. Lot/DP/cadastre: NSW Land Parcel Property Theme.
6. Planning: parcel-polygon queries to NSW Planning Portal EPI Primary Planning Layers, Protection, Hazard, Development Control and related spatial services.
7. DCP identity is resolved dynamically by the property's LGA.
8. Browser UI uses SitePivot API routes when deployed on a serverless-capable host; direct browser calls remain only as a static GitHub Pages fallback.

Server routes:
- `/api/address/suggest`
- `/api/property/resolve`
- `/api/planning/property`

## Measured QA

Server-side NSW regression suite passed.

Autocomplete:
- median: 31 ms
- slowest of the 11-address matrix: 177 ms
- target: < 3,000 ms

Deployed GitHub Pages browser:
- first useful Fairlight suggestion: 795 ms including UI debounce/render
- exact-number regression passed for 1 and 9 Waratah Street, Balgowlah
- identity matrix passed across Northern Beaches, Sydney, Newcastle, Wollongong, Central Coast, Orange, Wagga Wagga, Dubbo Regional and Blue Mountains

Northern Beaches regression:
- 57 GRIFFITHS ST, FAIRLIGHT NSW 2094
- LGA: NORTHERN BEACHES
- Lot 32 / DP1729
- parcel area calculated from cadastral geometry: ~416.31 m²
- planning instrument: Manly Local Environmental Plan 2013
- zone: R1 General Residential
- FSR: 0.6:1
- height: 8.5 m
- minimum lot size: 250 m²
- DCP: Manly Development Control Plan 2013

Server-side planning also passed for tested Newcastle and Wollongong properties.

## Remaining review states

The planning engine deliberately leaves a source as Needs Review when the upstream check fails or where SitePivot has identified a DCP but has not encoded its clause-level rule.

In current server QA, SEPP identify and local-identify supplementary calls timed out for the tested planning cases while the principal LEP/EPI, zone and DCP lookups succeeded. These supplementary source failures must not invalidate the whole Property Passport.

Detailed council flood studies also remain a separate coverage problem from statewide EPI flood mapping.

## Deployment status

All code required for the reliable architecture is committed to `sitepivot-concept`.

GitHub Pages cannot execute the serverless `/api/*` routes. To founder-test the full reliable NSW workflow, deploy this branch to a serverless-capable host. The repository contains `vercel.json` and Vercel-compatible API routes.

After deployment, the browser automatically uses the SitePivot server API because the hostname is no longer `github.io`.

Do not merge to `main` until founder testing is complete.


## Post-prompt implementation audit

The full repair prompt was re-applied against the current branch rather than assuming the first repair was complete.

Additional defects found and fixed:

- Normalized planning failure-state contract now exposes `failedKeys` as well as `failedSources`, so a failed DCP / SEPP / local source is rendered as **Needs Review** rather than being mistaken for a clean “no record” result.
- Normalized state-policy output now exposes `sepp` as the browser Property Passport expects, while retaining `statePolicies`.
- Normalized EPI metadata now exposes both `epiNames` and `allEpiNames` for compatibility with the browser model.
- The NSW test matrix now uses a genuine strata/unit-formatted Sydney address: `84/2-8 Dixon Street, Sydney NSW 2000`.
- Server QA now records an explicit autocomplete p95 metric and uses p95 < 3,000 ms as the acceptance gate.
- Server QA now asserts the normalized planning contract so these UI/API naming regressions cannot silently return.

These changes remain on `sitepivot-concept`; they have not been merged to `main`.


## Autonomous hardening pass — 6 October 2026

The full autonomous engineering prompt was executed against the current `sitepivot-concept` branch.

Additional defects and gaps found and repaired:

- Added a property-aware **Ask SitePivot** text assistant to the Property Passport.
- Added browser speech-recognition input where supported and speech-synthesis replies with explicit typed fallback.
- Voice/chat is scoped to the active SitePivot property and existing planning/assessment evidence; it does not bypass confidence states or manufacture missing controls.
- Conversation state resets when the property changes and is not included in saved prototype projects.
- Added microphone-denied, no-speech, unsupported-browser and TTS-failure states.
- Prevented duplicate rapid chat submissions and overlapping voice replies.
- QA fixture controls are now hidden from normal consumer mode and only exposed through explicit `?fixtures=1` mode.
- Added autocomplete ArrowUp/ArrowDown selection, Enter selection, Escape close, combobox/listbox ARIA state and active-result styling.
- Fixed an autocomplete race where an in-flight older request could render during the debounce window after newer user input.
- Added explicit API `OPTIONS` handling for cross-origin preflight and method validation.
- Added bounded input validation to address, property-resolution and planning endpoints.
- Added NSW coordinate-bound validation before planning spatial queries.
- Expanded `SitePivot.runLiveDiagnostics()` to report height, FSR, minimum lot size, DCP, SEPP, hazards, assistant text and voice capability.
- Expanded deployed browser QA to check assistant rendering, normal-mode fixture isolation, keyboard suggestion selection and a 390×844 mobile overflow test.
- Expanded server QA to cover API preflight and validation contracts.
- JavaScript syntax checks pass for the current browser bundle and server/API files; duplicate HTML IDs were not found.

### Current acceptance status

**PARTIAL / EXTERNAL DEPLOYMENT BLOCKER**

The branch contains the repaired serverless architecture and the strengthened QA suite, but the full reliable NSW planning workflow still requires a serverless-capable deployment. GitHub Pages remains static-only and cannot execute the repository's `/api/*` functions.

The next acceptance action is to deploy the current `sitepivot-concept` branch to Vercel (or an equivalent serverless host) and run the repository's live browser and server data QA against that deployed URL.

Do not call the overall product PASS until that deployed runtime test succeeds.


## Consumer simplification and voice UX pass

The consumer simplification brief was executed without removing the underlying NSW planning evidence.

Implemented:

- Added a separate `consumerPropertySummary()` presentation layer over the full planning evidence model.
- Default Property Passport now shows only dwelling/land summary, zoning, height, FSR, minimum lot size, a short “Worth knowing” section, homeowner pathways and Ask SitePivot.
- Full technical planning evidence remains available behind **View detailed planning information**.
- Raw statewide SEPP / planning-instrument lists no longer dominate the default homeowner view.
- Added normalized `dwellingProfile` with property type, bedrooms, bathrooms, parking, source, confidence and verification date.
- Where the current data sources do not provide reliable bedroom/bathroom/car configuration, SitePivot asks the homeowner to confirm them instead of inventing values.
- Fixed null dwelling fields incorrectly coercing to zero.
- Simplified homeowner pathway and development-option language.
- Passport pathway cards are now actual interactive controls wired directly to the correct next screen.
- Added an “I’m not sure” development choice.
- Added browser regression coverage for all five homeowner pathways and all five development choices.
- Added consumer relevance logic so negative environmental checks remain background evidence while material triggers and unresolved flood information are surfaced.
- Added ranked speech-synthesis voice selection favouring high-quality Australian/British female English voices where the browser provides them.
- Added separate display and spoken assistant responses so voice no longer reads evidence-state/source/date metadata.
- Spoken answers are shorter and more conversational.
- Added selected voice name to developer diagnostics.
- Browser bundle syntax passes and duplicate HTML IDs were not found after the refactor.

The external property/listing integration available in the current environment does not provide a reliable arbitrary-address property-profile lookup suitable for automatically filling bedrooms/bathrooms/parking for every SitePivot property. The user-confirmation fallback therefore remains the trustworthy default until a production property-data provider is connected.
