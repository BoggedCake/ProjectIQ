# SitePivot complete voice repair — 9 October 2026

This section records local preparation on the 4c1506e baseline. The older 8 October deployment record below is historical; this repair has not been pushed, deployed or merged.

## Root causes and repair

Voice history was traced through f647614, f459b4e and 6800d44. The original speech formatter retained only three sentences; subsequent activation repairs preserved that truncation. All browser versions sent an entire response as one utterance. The formatter expanded `m` before recognising `m²`, producing “metres²”, and never expanded `m2`, `sqm`, numbers or planning abbreviations. The most recent voice ranking and default locale explicitly favoured British English.

The formatter now preserves the complete consumer response, strips existing provenance metadata, and normalizes a separate speech copy. Examples: `600 m²` → “six hundred square metres”; `440 m2` → “four hundred and forty square metres”; `120 sqm` → “one hundred and twenty square metres”; `FSR 0.6:1` → “floor space ratio zero point six to one”; `8.5 m` → “eight point five metres”. NSW/LGA/DA/CDC expand to their full spoken names. Percentages, numeric ranges and dollar amounts also expand. The displayed answer remains unchanged by this module.

Browser and server playback use a sequential queue that preserves paragraph boundaries and groups complete sentences up to 220 characters per chunk by default (configurable between 80 and 1200). Only a sentence longer than the limit is split at word boundaries. The normalized speech copy retains paragraph separation. Each completion advances exactly one chunk. Cancellation, navigation integration calling `stop()`, superseding replies and stale callbacks invalidate the entire old queue. Retry retains the current and remaining chunks; a service failure after earlier chunks completed falls back for the remaining answer. Existing activation, startup timeout, request timeout, media validation and recoverable browser fallback remain.

## Exact voice configuration

Browser locale defaults to `en-AU`. Australian English receives the highest locale preference, recognised female voices receive a preference, and natural/neural/enhanced/premium voices receive a quality preference. Examples already handled by the catalogue include Karen Enhanced and Natasha Neural; availability and actual acoustic quality depend on the device. Playback rate is 0.94, pitch 1 and volume 1. This selection cannot guarantee one identical voice on iOS, or prove a named voice is neural.

The existing optional server gateway remains opt-in: `SITEPIVOT_TTS_ENDPOINT` is an authenticated HTTPS gateway, `SITEPIVOT_TTS_VOICE` is the gateway's actual voice identifier, `SITEPIVOT_TTS_TOKEN` remains a required server-only credential. `SITEPIVOT_TTS_LOCALE` defaults to `en-AU`. The gateway receives `{text, voice, locale, format:"mp3", style:"warm, calm, professional"}`. Responses expose `X-SitePivot-Voice` and `X-SitePivot-Locale`; cache keys include locale. No vendor, account, purchased subscription or production voice ID was introduced, and no real provider call was made. Browser synthesis remains the working fallback when the server is absent or fails.

## Recommended optional named provider

For an explicitly approved future provider setup, the recommended candidate to audition is **Azure Speech `en-AU-NatashaNeural`**, locale `en-AU`. Microsoft's current language-support documentation identifies it as female Australian English. This is a named neural candidate, not an active provider in this repair, and no audition or subjective “calm” quality result is claimed. Its documented style column does not list a “calm” style; a gateway should use ordinary narration and controlled SSML prosody rather than invent an unsupported style. The existing `warm, calm, professional` gateway string is a desired instruction, not a verified Azure capability.

Sources verified on 9 October 2026: [Microsoft language and voice support](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support) and [Microsoft text-to-speech REST API](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/rest-text-to-speech). The REST API requires credentials (a Speech resource key or bearer token), SSML XML and an output format header. SitePivot's existing generic gateway sends JSON with a gateway bearer token, so setting its endpoint directly to Azure's REST endpoint would be incompatible. A server-only gateway must translate JSON into correctly escaped SSML and Azure authentication/output headers, return audio, and handle credential rotation before activation. `SITEPIVOT_TTS_VOICE=en-AU-NatashaNeural` and `SITEPIVOT_TTS_LOCALE=en-AU` would then identify the approved gateway voice.

Creating or funding a provider resource, adding credentials and activating/deploying that gateway require separate user approval. None was performed or committed here. The browser fallback remains operational; setting `en-AU` or selecting a similarly named browser voice cannot guarantee the same Azure voice on every iPhone.

## Local validation

RED was observed for the complete-response normalization regression: `600 m²` returned `600 metres²` and only the first three sentences survived. The added server locale contract also failed before implementation. A sentence-boundary regression then reproduced a chunk split inside the second short sentence; the updated chunker passes whole-sentence, paragraph and overlong-sentence cases before replay/cancellation checks. Adapter, 17 lifecycle checks, UI, server and the new complete-response checks pass. The latter cover browser and server sequential delivery, content equality, stale/superseding cancellation, retry after a completed chunk and service failure after a completed chunk.

The actual Chromium and WebKit browser regressions now both pass, including mobile activation, reply, blocked audio recovery, interruption, reset, delayed catalogues, startup timeouts and complete sequential speech queue equality. Chrome for Testing is the matching 151.0.7922.34 shell; WebKit is 26.5 (revision 2336). These browser flows use mocked synthesis/media boundaries and do not establish real device audibility.

Initial browser recovery hit absent engines and invalid CDN ZIP responses. The matching Chrome shell was recovered from the direct Google Chrome-for-Testing artifact URL; WebKit downloaded from the Microsoft mirror. System dependency installation failed on `setgroups`/`setegid`, so 30 packages were downloaded and unpacked under `/tmp/projectiq-browser-libs`, with library symlinks added only inside the local WebKit browser cache. Browser runs use `PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1` and `LD_LIBRARY_PATH=/tmp/projectiq-browser-libs/root/usr/lib/x86_64-linux-gnu:/tmp/projectiq-browser-libs/root/lib/x86_64-linux-gnu`: validation otherwise incorrectly treats the user-level GLES library as absent because it consults system `ldconfig`. Real browser processes load the unpacked libraries successfully. No production dependency, configuration or account was changed by environment recovery.

Physical audible iPhone verification is unavailable; real Safari audibility and catalogue choice remain a device check.

The first full `npm test` run passed every voice suite and stopped on commercial-regression’s mixed renovation/extension clarification assertion; that integration issue was subsequently resolved. The voice worker’s later integrated rerun passed the commercial checks and reached the browser journeys, where a legacy assertion still expected British `Microsoft Sonia Natural` instead of the correctly selected Australian `Microsoft Natasha Natural`. The same run also found the shared journey’s old construction-cost expectation (`2992000` versus the calibrated `2698214`). Both legacy expectations were reported to the root integration owner. The run finished with exit 1 because of those two shared journey assertions. These are the voice worker’s observed runs; the root owner records the final integrated repository result.

---

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

The full consumer CI run at `d6332c0edd182f4428a03341d994af92b2fed2cf` passes with 174 PASS entries and zero FAIL entries, including the original regressions and the new lifecycle/UI/server suites. Chromium and WebKit both pass the dedicated mobile voice activation, reply, blocked audio retry, interruption, reset, delayed catalogue and startup-timeout cases. Consumer evidence: https://github.com/BoggedCake/ProjectIQ/actions/runs/37710012910 . Server data QA also passes: https://github.com/BoggedCake/ProjectIQ/actions/runs/37710012974 . The final lifecycle matrix has 17 cases, including delayed voices, synchronous activation, retained utterance, actual start/end, errors, startup timeout, voice retry, cancellation, stale callbacks, metadata, HTTP/CORS/MIME/play rejection/hanging request/playback, late playback, combined media error + rejected play, and unavailable browser fallback.

The server route tests cover credential validation, bad JSON, empty/oversized speech, OPTIONS, configured mocked provider, bearer-token contract, audio MIME and allowed origins. The original cache/cancellation/provider suite remains intact.

Fresh independent review identified the duplicate fallback and server-only failure UI gaps. Each was reproduced by a failing test and fixed. Review observations about watchdogs, later media-error status and interruption assertions were also corrected. No review findings are deferred.

Local npm test reaches the browser stage after all nonbrowser checks pass, then fails because Chromium is absent. Attempted Playwright installation receives an invalid archive from the restricted network. Chromium/WebKit tests are wired into the existing CI workflow and have now passed there for this revision.

The founder explicitly authorised publication on 8 October 2026. The repaired implementation was published as `6800d4410d5a3dc80791038d65958f134befe71d` to `BoggedCake/ProjectIQ` branch `sitepivot-concept`. GitHub Pages deployment, the full consumer checks and server data QA have passed. Deployed index.html and voice.js match the tested implementation. Main remains untouched at `2e7f85d1c935ce0d0f5253b05471211c817e3e62`. An earlier supplemental live-site QA attempt timed out during Ubuntu browser dependency installation and was retried. Its matrix then exposed an existing assertion that assumed height evidence could never be unavailable. A local reproduction showed the valid Unknown/needs-checking response could fail that assertion. The test now requires the actual mapped value when supplied and a clear uncertainty statement when absent, retaining both safety conditions and logging context on failure. Final live QA passes: https://github.com/BoggedCake/ProjectIQ/actions/runs/37710012905 . The deployed smoke check, full desktop/mobile founder journeys and all 16 Seaforth/Fairlight text/voice conversation scenarios pass across Chromium/WebKit. No application changes were needed for this assertion correction.

IOS/WEBKIT CODE PATH: PASS — AUTOMATED PLAYBACK EVENTS; NOT PHYSICAL AUDIBILITY
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

A separate direct cloud-browser attempt reached the deployed landing page, but its live NSW address request timed out with a Government data request timed out diagnostic. It did not reach the property or audio controls; this is recorded as an external live-data check limitation, not a passed founder journey. The final server data matrix and all deployed founder/conversation journeys passed independently afterwards. No planning logic was altered for this observation.
