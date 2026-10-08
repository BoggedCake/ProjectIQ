# SitePivot voice reliability implementation plan

> Execute inline with superpowers:executing-plans, preserving the founder's autonomous execution instruction.

Goal: make failed audio detectable and recoverable on the current static build, preserving unified conversation.
Architecture: keep voice.js as the provider boundary; browser synthesis waits for voices, retains the utterance, observes start/end/error and retries once. The toggle activates browser speech synchronously, while explicit retry replays the pending reply from a new gesture. Server audio falls back after bounded request/playback failures.
Tech stack: vanilla JavaScript, Node 24, jsdom, Playwright Chromium/WebKit.
Spec: uploaded Pasted text(6).txt; baseline 862cb3127ddf42c1cddb0a34e32f18ddb28cb929.
Constraints: no main merge; no planning/commercial/controller redesign; no credentials in client; physical iPhone audibility cannot be claimed from emulation.
Review focus: delayed voice catalogue; never-starting utterance; late callbacks after reset; rejected or hanging media play; repeated toggles and interruption.

## Task 1 — playback lifecycle
Files: voice.js; qa/voice-reliability-regression.cjs; qa/voice-adapter-regression.cjs.
Interface: createPlayer(options) returns stop(), speak(text), unlock(), retry(), diagnostics, speaking, pending, needsActivation and activeUtterance.
- [x] Write and run failing tests for synchronous activation, observed start, timeout/retry, delayed voices, voice ranking, cancellation and server fallback.
- [x] Implement lifecycle and diagnostic events, preserving stop/speak compatibility.
- [x] Run focused voice tests and commit.

## Task 2 — consumer controls and server contract
Files: index.html; api/_lib/tts.js; api/voice/speak.js; qa/voice-ui-regression.cjs; qa/voice-server-regression.cjs.
Interface: use player.unlock() in toggle and retry() in one audio-enable action; add developer snapshot with conversation/property/recognition state.
- [x] Write and run failing UI/server tests for toggle, retry, metadata stripping, cancellation, validation and provider audio.
- [x] Implement direct gesture activation and truthful simple failure state; complete missing server validations.
- [x] Run focused tests and commit.

## Task 3 — acceptance
Files: qa/voice-browser.cjs; package.json; .github/workflows/sitepivot-journey.yml; VOICE_RELIABILITY_QA.md.
- [ ] Verify mock lifecycle in Chromium/WebKit, retaining original journeys.
- [ ] Run npm test, mobile, conversation and new voice browser tests; review diff.
- [ ] Record evidence, exact server configuration and founder checklist; commit/push only sitepivot-concept, verify CI/deployed source.

Execution ledger: baseline reconciled; 8 lifecycle failures and UI activation failure reproduced before implementation. Tasks 1–2 implemented and focused tests pass. Fresh review found duplicate media fallback and silent server-only failure; both RED→GREEN. Watchdog and interruption assertions strengthened. All original nonbrowser suites pass. Task 3 is blocked on browser availability and explicit publication approval; no main merge.
