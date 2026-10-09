# Founder testing

Development branch: `sitepivot-development`. This repository and its branches are public source code. This branch is not the GitHub Pages publishing source. Do not push repairs to `sitepivot-concept`, which remains the public publishing branch.

## Run the repaired version on your computer

1. Download the development branch ZIP from https://github.com/BoggedCake/ProjectIQ/archive/refs/heads/sitepivot-development.zip and extract it, or clone that branch.
2. With Node.js 24 installed, open a terminal in the extracted folder and run `node qa/founder-server.cjs` (no npm install required for the preview).
3. Open http://127.0.0.1:8080/?fixtures=1 in Chrome or Safari. The amber LOCAL FOUNDER TEST banner identifies the development version. Stop with Ctrl+C.

The preview binds only to your computer. No public hosting, tunnel, account or paid service is created. It serves only the four public client files and the existing allowlisted API handlers; repository files and credentials are not served.

Fixture properties provide repeatable test data. Test “I want to add another level”, mixed upstairs/downstairs work, frontage and zoning questions, duplex configurations, cost bands and sell/buy changeover. Use browser responsive mode at 390 pixels to check mobile layouts. Actual iPhone microphone/voice quality needs a separate device test; automated playback tests do not establish audible voice quality.

Remove `?fixtures=1` to try live address/planning lookups through the existing API handlers. External public-data availability and any already configured provider credentials affect these results. Licensed market data and neural TTS are not newly activated; browser speech remains the fallback. Local fixture testing does not certify live Delmar parcel evidence.

## Normal development

Fix → Test → Commit → Push to `sitepivot-development` → Founder testing. Re-download the latest branch or pull it, restart the server, and refresh. Never merge into `main`, update the publishing branch or deploy production without explicit approval.

The development CI runs local tests and creates a labelled downloadable artifact only. No Pages action, Pages write permission, deployment environment or public hosting step is present. The existing live-site QA remains restricted to `sitepivot-concept`.
