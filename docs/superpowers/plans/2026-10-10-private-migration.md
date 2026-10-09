# Private migration preparation implementation plan

> For agentic workers: execute inline with executing-plans; one independent whole-change review before push.

Goal: prepare a non-destructive private-source and protected-hosting migration without changing repository visibility, publishing a replacement site, activating accounts or spending money.

Architecture: retain the current Pages journey until an approved replacement is independently verified. Prepare an allowlisted static build, reusable fail-closed API guard, redacted history scanner and security CI. Existing client intelligence stays explicitly classified as exposed until a server-mediated UI conversion is completed; a private repository alone is insufficient.

Tech stack: existing Node 24/CommonJS, Python standard library, GitHub Actions, existing optional Vercel serverless adapters. No new runtime dependency.

Spec: uploaded Pasted text(20261009-220802).txt, sections 1–14.

## Constraints and review focus
- Preserve sitepivot-concept, complete history, residential repairs and existing HTTPS founder site; no main merge or reset.
- Visibility, hosting/access changes, tester invitations, credentials and expenditure await the single founder checkpoint.
- Missing authentication or global usage control must fail closed in the prepared protected guard.
- Forged Origin is not authentication; client query strings cannot select arbitrary external API destinations.
- Static build must exclude server sources, QA, documents, secrets and maps, and reject symlink escapes.
- Scanning must never print candidate credential values, including on failure; inspect full reachable Git history.
- Unknown GitHub/Vercel plans and active deployment state must be reported as unknown, not inferred from vercel.json.

## Task 1: baseline, exposure and hosting evidence
- [x] Reconcile latest connector head and historical development ancestry; inspect workflows and public deployments.
- [x] Audit frontend/server boundary, credentials, CORS, provider calls, diagnostics and documents.
- [x] Verify official Pages/Vercel eligibility, protection and costs; record inaccessible account settings.

## Task 2: safe preparation and security regressions
Files: scripts/scan-secrets.py; scripts/build-founder-assets.cjs; api/_lib/request-security.js; qa/migration-security.cjs; qa/secret-scanner-regression.py; deployment/vercel-protected.template.json; .github/workflows/sitepivot-security.yml; package.json; index.html; qa/api-origin-regression.cjs.
- [x] Write failing tests for blocked unauthenticated calls, wrong origins, body limits, limiter failures, redacted scans and static build exclusion/symlinks.
- [x] Implement reusable guard with injected authentication/global rate limiter, allowlisted static build and disabled deployment template; do not attach guard to live routes yet.
- [x] Reject arbitrary apiBase origins; prepare no cross-origin server target until approved.
- [ ] Run security suites, full-history scan and npm dependency audit; run existing unit/browser regressions.

## Task 3: review, commit and founder checkpoint
- [ ] Independent review, material findings RED→GREEN, full regression results.
- [ ] Push safe preparation through connector; verify Pages source and desktop/mobile CI.
- [ ] Deliver severity register, conditional architecture, tester access/revocation, pipeline/rollback and one concrete approval checkpoint.

## Ledger
Baseline: 4dea7874efe5314300c1c4399c006e9096d70669. Public repo, main 2e7f85d1c935ce0d0f5253b05471211c817e3e62; sitepivot-development 1242a5c is an ancestor of concept. Clean local tree; local merge history preserves all connector commits.
Ruling: no Vercel account tools, CLI or linked local project were available. Repository deployment/status evidence contains only Pages; active Vercel deployment and billing remain unknown. Do not guess a URL or configure hosting.
Ruling: reusable security guard is preparation only, not live route authentication; activation requires verified hosting/authentication/global limiter. Current founder access remains unchanged.

Review: independent reviewer found filename disclosure in scanner; CLI regression reproduced failure, SHA256 file identifiers fixed it, suite passed. Python caches ignored. Unit suite: 202 passes. Local browser binaries absent and download blocked; use existing GitHub Actions for full browser verification.
