# SitePivot unified conversation — 7 October 2026

Baseline: `752a91d400c0595fec338e06458065d35a7b2d69`.
Final tested implementation: `f5d6caadcd2f233cfa7336424f425790552beecf`.
Branch: `sitepivot-concept`. Main remains `2e7f85d1c935ce0d0f5253b05471211c817e3e62`.

## Product decisions

The separate intake card is removed. Ask SitePivot is one conversation, shown after essential dwelling details are confirmed. Its composer and log persist through Passport, Scope, Assessment, Roadmap and Report. Manual directions are secondary; later screens hold the same component in a compact disclosure.

conversation.js reuses the commercial interpreter and normalizes project intent plus property questions. A validated deterministic reducer accepts project actions. Property evidence and financial calculations remain authoritative; generated prose never changes evidence. Mixed duplex/planning messages record Duplex and answer resolved controls. Comparison requests retain room objectives. Budget, room-count, scope removal, basement negation, working values and navigation have regression protection.

Configured server interpretation uses the same normalized schema and action controller. Successful interpretations clear stale local clarification. Invalid or unavailable provider responses retain useful local interpretation. Obvious requests work without AI credentials.

Voice and text share the same submission path. voice.js prefers the server audio route on server deployments and otherwise uses quality-ranked English browser voices. Natural quality ranks above accent. Recognition, pending audio, playback and late callbacks cancel on property change/reset; starting recognition stops playback and invalidates an older pending assistant turn. Speech is concise and removes evidence labels, URLs, dates and metadata. Selected voice/mode remain developer diagnostics.

The TTS route keeps credentials server-side, validates HTTPS/audio type/size, supports timeout/disconnect cancellation, and uses a bounded one-hour cache. Text never waits for audio.

## Final regression evidence

Consumer run: https://github.com/BoggedCake/ProjectIQ/actions/runs/37595532413

**153 checks passed, zero failures**: model, commercial, intake, provider contracts, async/race tests, all homeowner/development pathways, full Chromium journeys, mobile WebKit, conversation/controller tests, voice adapters and both mobile viewport sizes.

Server data run: https://github.com/BoggedCake/ProjectIQ/actions/runs/37595532653

**11 identity cases and three planning cases passed**, plus exact-number matching, API validation and failed-provider uncertainty contracts (attempt 2). The initial attempt received NSW service query errors/timeouts; the unchanged suite passed on retry. No assertions were weakened.

Deployed run: https://github.com/BoggedCake/ProjectIQ/actions/runs/37595532445

**Deployed smoke, 17/17 original founder journeys and 16/16 unified conversation journeys passed** (attempt 3). The unified matrix covers Chromium and WebKit, 390 × 844 and 393 × 852, text and simulated voice, Seaforth and Fairlight, planning answers, assessment preservation, report and reset. The deployment gate compares HTML and all three shared browser scripts against tested source.

The first live attempt received missing planning responses; the second had one live identity-resolution timeout before the conversation. The final smoke had no console errors or failed requests. The final conversation matrix had no uncaught page errors; 15 cases recorded zero failed requests and one WebKit Seaforth text case recorded one while all journey/evidence assertions passed. The harness records the count for successful cases, so that request's URL was not retained in its log. This is a diagnostic limitation, not a claimed zero-network-error run. Prior complete matrices also passed with zero failed requests. External live-provider reliability remains distinguishable from application state correctness.

Existing assertions were preserved. Setup/selectors were adapted to the single conversation and secondary manual disclosure.

## Review and regression fixes

A fresh independent read-only review found assessment questions mutating scope, lost rooms after comparison, incomplete room-count/removal edits, basement negation, stale provider clarification, speech arriving during recognition, reset drawer leakage and API-base voice routing. All were corrected with focused regressions.

Additional tests protect stale audio timeouts, active audio overlap/cancellation, duplicate planning prose, validated navigation prerequisites and renovation-specific assessment prompts.

A final recognition-error scenario reproduced a stale transcript being submitted when the next microphone retry was stopped without new speech. Clearing the final-transcript flag at each recognition start fixes it; its async regression failed before the change and passed afterwards. There are no deferred review findings.

## Actual deployed browser acceptance

40 Hope Street, Seaforth: Yes, use this property advances. The combined duplex/planning request records Duplex, answers actual split zoning, 8.5 m height, 0.5:1 FSR, 300 m² minimum lot size and Manly DCP, then continues straight to scope. Split controls remain a material check; no approval is invented. Working site value and per-home value of $4,000,000 produce $8,000,000 GRV, $2,992,000 delivered cost and $8,111,755 total cost without duplicate soft costs.

57 Griffiths Street, Fairlight: the exact founder sentence selects Kitchen, Bathroom, Living/dining and Open-plan work, without irrelevant addition/development room choices. Component cost is $72,000–$201,600 with a $120,000 midpoint. A cost follow-up preserves assessment and scope. Renovation assessment prompts remain relevant to renovation. The same conversation follows the structural-engineer next step and report. Start over clears property and conversation.

## External configuration requirement

Structured AI and premium server TTS are **not claimed live** on current GitHub Pages hosting. They require a server runtime and gateway credentials.

- SITEPIVOT_INTENT_ENDPOINT / SITEPIVOT_INTENT_TOKEN configure structured interpretation.
- SITEPIVOT_TTS_ENDPOINT / SITEPIVOT_TTS_TOKEN / SITEPIVOT_TTS_VOICE configure premium audio.
- Select and audition a natural female English voice: prefer a high-quality Australian voice, otherwise a better British voice.

Interfaces, routes, validation, error handling, fallback, cancellation, cache and configuration documentation are implemented and tested. Deterministic conversation and browser voice remain functional without external credentials. Planning/provider failures retain uncertainty rather than becoming negative evidence.
