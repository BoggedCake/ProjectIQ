# SitePivot voice reliability — 8 October 2026

Baseline: `862cb3127ddf42c1cddb0a34e32f18ddb28cb929` on `sitepivot-concept`.
Scope: voice provider, playback controls, voice diagnostics and related regressions. The conversation, planning, commercial, pathway and evidence engines are unchanged. Main has not been merged or modified.

## Failure investigation

The baseline GitHub Pages path sets SERVER_API=false unless an explicit apiBase is configured. Its voice output is therefore browser speech synthesis, not premium server TTS. No missing same-origin /api route is required on that static path.

The old toggle only changed a boolean. It did not request speech during the tap. The first actual utterance was requested later from the recognition-end/assistant-response path. WebKit's iOS speech implementation applies a user-gesture restriction to speech start: https://bugs.webkit.org/show_bug.cgi?id=223473 and https://github.com/WebKit/WebKit/blob/main/Source/WebCore/Modules/speech/SpeechSynthesis.cpp. This is a concrete activation gap in the affected path, consistent with the founder's no-sound report. The exact physical-device trigger cannot be proved without that device's diagnostics.

Independent of activation, a no-start test proved the old player marked speaking immediately after speak(), lacked onstart/timeout detection, selected before voice enumeration, and held no application-level reference to the active utterance. A queued utterance could silently remain in that state indefinitely. Eight new lifecycle tests initially failed against the baseline, and the UI activation test also failed before repair.

## Implementation

- Voice replies ON synchronously requests one short browser confirmation directly from the user gesture. It uses a system default if enumeration has not finished yet, preserving the gesture. Later replies wait up to 700 ms for voiceschanged/catalogue readiness.
- The utterance is retained until end/error/cancel. Speaking begins only after onstart; pending audio displays Preparing voice. Browser startup has a 2.5-second deadline, one retry using the next available English voice, and an explicit Enable audio action if both attempts fail. Permission errors surface immediately. Retry replays the failed reply directly from the tap.
- Natural/enhanced English voices rank ahead of ordinary voices; recognised female names are preferred, then British over Australian at equivalent quality. There is no assumption that any named voice exists or that a name guarantees audibility.
- Server request/download and media play are bounded. HTTP/CORS/bad MIME/rejected play/hanging play failures fall back to browser synthesis. One guarded failure path prevents media errors and promise rejection from queuing duplicate replies. When browser fallback is unavailable, the consumer still sees the failure and one retry action.
- Stop, new reply, Speak, reset and property changes invalidate older callbacks, abort requests, pause/release audio and revoke object URLs. Hiding the page also cancels audio and detaches recognition before aborting it.
- Speech strips URLs, evidence labels, dates, metadata fields and internal IDs, preserves planning decimals and limits replies to three natural sentences. Display responses remain unchanged.
- Developer snapshot: `SitePivot.voiceDiagnostics()`. It includes support, activeProvider (`server_tts`, `browser_tts`, `unavailable`), chosen name/locale, catalogue, lifecycle events, server HTTP/MIME/play result, error, synthesis flags, page visibility, recognition and property/conversation IDs. Event history is bounded and does not contain spoken property text. Consumer screens contain no provider terminology.

## Verification and limits

The original nonbrowser suites and the new lifecycle/UI/server suites pass. The final lifecycle matrix has 17 cases, including delayed voices, synchronous activation, retained utterance, actual start/end, errors, startup timeout, voice retry, cancellation, stale callbacks, metadata, HTTP/CORS/MIME/play rejection/hanging request/playback, late playback, combined media error + rejected play, and unavailable browser fallback.

The server route tests cover credential validation, bad JSON, empty/oversized speech, OPTIONS, configured mocked provider, bearer-token contract, audio MIME and allowed origins. The original cache/cancellation/provider suite remains intact.

Fresh independent review identified the duplicate fallback and server-only failure UI gaps. Each was reproduced by a failing test and fixed. Review observations about watchdogs, later media-error status and interruption assertions were also corrected. No review findings are deferred.

Local npm test reaches the browser stage after all nonbrowser checks pass, then fails because Chromium is absent. Attempted Playwright installation receives an invalid archive from the restricted network. Chromium/WebKit test scripts are supplied and wired into the existing CI workflow; they have not passed for this revision yet.

The founder explicitly authorised publication on 8 October 2026. The repaired implementation was published as `6800d4410d5a3dc80791038d65958f134befe71d` to `BoggedCake/ProjectIQ` branch `sitepivot-concept`. GitHub Pages deployment and consumer/server/live CI checks are running; their terminal results remain pending at this documentation revision. Main remains untouched.

IOS/WEBKIT CODE PATH: NOT YET VERIFIED IN BROWSER — CI REQUIRED
REAL IPHONE AUDIBILITY: FOUNDER VERIFICATION REQUIRED
PREMIUM SERVER TTS: NOT CONFIGURED — BROWSER FALLBACK ACTIVE

The browser fallback above describes the implementation's selected provider, not proof of sound on physical hardware.

## Premium server configuration

A server runtime and authenticated HTTPS TTS gateway account are required. The gateway must accept POST `{text, voice, format:"mp3", style:"warm, calm, professional"}` and return valid audio/mpeg, audio/wav, audio/ogg or audio/mp4.

Required server-only environment variables:
- SITEPIVOT_TTS_ENDPOINT: gateway HTTPS speech URL.
- SITEPIVOT_TTS_TOKEN: provider/gateway bearer credential.
- SITEPIVOT_TTS_VOICE: actual auditioned natural female English voice ID; British first, then Australian, with quality ahead of accent.
- SITEPIVOT_TTS_ALLOWED_ORIGINS: `https://boggedcake.github.io` for a separately hosted gateway called from the founder site.

Use the existing `apiBase` deployment setting only when the server is deployed and reachable. Raw vendor APIs may require a server adapter to this contract. No production account or voice identifier is assumed. Secrets never go into index.html, client scripts, browser storage or Git. Provider credentials are absent in this Work environment; mocked provider success is not live TTS.

## Founder checklist after publication and CI

1. Open https://boggedcake.github.io/ProjectIQ/ in iPhone Safari and reload the updated build. Confirm media volume is audible.
2. Select 40 Hope Street, Seaforth NSW 2092 and confirm the dwelling details. Turn Voice replies ON. Hear “Voice replies are on.” If it cannot start, confirm a clear Enable audio action appears; tap it once.
3. Tap Speak and ask “Am I able to put a duplex on my property?” Confirm recognised text appears in the same conversation, an evidence-based concise answer is audible, no labels/URLs/internal IDs are read, and only one reply plays.
4. Ask “What is my height limit?” Confirm property context and pathway remain intact and the spoken answer is audible.
5. While SitePivot speaks, tap Speak. Confirm the reply stops immediately and listening begins. Start over while audio is pending/playing; confirm all audio stops and no old reply returns.
6. Repeat with 57 Griffiths Street, Fairlight NSW 2094: “I want to open up the kitchen and living area and renovate the bathroom.” Confirm the same conversation selects the expected renovation scope and speaks a concise reply.
7. Toggle replies OFF during speech, then ON. Confirm cancellation and a single confirmation. Change property while speaking and confirm old audio/callbacks do not leak into the next conversation.
8. If sound still fails, capture `SitePivot.voiceDiagnostics()` from Safari's developer console after reproducing it. A start event alone cannot prove speaker audibility; mark this checklist passed only after hearing the actual device.
