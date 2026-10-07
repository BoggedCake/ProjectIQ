# SitePivot concept prototype

This branch is the founder-test concept build for SitePivot.

Open `index.html` in a browser, or configure GitHub Pages to publish this branch from the repository root.

The build is intentionally a lightweight static prototype. It demonstrates the complete consumer workflow and evidence/confidence architecture without pretending fixture planning or sales data is live.

See:
- `SITEPIVOT_QA.md`
- `STATEWIDE_DATA_COVERAGE.md`

Do not merge this branch into `main` until founder testing is complete.


## Unified conversation and natural voice

The Passport now has one Ask SitePivot conversation. Its normalized interpreter and validated action reducer live in conversation.js; property evidence and financial arithmetic remain in the existing deterministic layers. The same log and composer follow the project in a compact disclosure. Final voice transcripts use the same submit path as text.

Server deployments can configure SITEPIVOT_INTENT_ENDPOINT and SITEPIVOT_INTENT_TOKEN for the structured conversation-v1 contract (return {intent}, using the supplied normalized schema). Only validated intent fields become actions. Provider prose never becomes property evidence. Obvious requests work locally without credentials.

Premium voice requires a server deployment plus SITEPIVOT_TTS_ENDPOINT, SITEPIVOT_TTS_TOKEN and SITEPIVOT_TTS_VOICE. Select and audition a natural female English voice: prefer a high-quality Australian voice, otherwise a better British voice. The HTTPS gateway accepts POST {text, voice, format:"mp3", style} and returns audio/mpeg (audio/wav, audio/ogg and audio/mp4 are also accepted). Credentials stay server-side. The route has a seven-second timeout, two-megabyte response limit, a bounded one-hour in-memory cache, and disconnect cancellation. No premium provider is claimed to be live without those settings. GitHub Pages has no server runtime, so it uses the quality-ranked English browser voice.

The client cancels recognition, pending audio requests and active playback on property change/reset; starting a microphone stops playback. Speech uses short, metadata-free prose. Text never waits for audio. Developer diagnostics are available through SitePivot.voicePlayer.diagnostics and SitePivot.assistantState.selectedVoiceName.

Run npm test, npm run test:mobile, node qa/conversation-browser.cjs, npm run test:providers, npm run test:live and npm run test:deployed. CI installs Chromium and WebKit.
