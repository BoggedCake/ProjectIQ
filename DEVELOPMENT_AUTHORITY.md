# SitePivot development authority and deployment separation

Chris Lewis's standing authorisation, effective 9 October 2026, permits routine investigation, implementation, supporting files, testing, regression repair, commits and pushes to `BoggedCake/ProjectIQ` branch `sitepivot-concept`. Repeat these steps until acceptance criteria are satisfied; do not request approval for every development step.

Canonical policy: [SITEPIVOT — FOUNDER AUTHORITY & APPROVAL GUARDRAILS](https://app.notion.com/p/3f4c5050096e80d885dadafc60623acc).

Production publication/deployment, merges to `main`, expenditure and commercial commitments, external email/marketing/customer communications, destructive or irreversible operations, security-sensitive changes and production-credential changes still require explicit founder approval. Authentication and repository protections must never be bypassed.

## Current separation status

**Not yet configured or verified.** Prior `sitepivot-concept` pushes triggered GitHub's implicit Pages build-and-deployment workflow. No repair push is permitted until the repository's real Pages/deployment protections are inspected, safely configured and verified. The browser is currently signed out and the connected repository tools cannot manage Pages/environment settings.

The approved configuration must stop public deployment on development pushes. Suitable repository controls include required founder review on the actual `github-pages` deployment environment, with bypass disabled, or a Pages Actions source with explicitly controlled production publication. Confirm the selected source and actual deploy job use the protected environment; configuration text or a workflow reference alone does not prove protection. Never approve or dispatch a public deployment merely to test the gate.

## Staging preview

`sitepivot-preview.yml` packages only the four public client files plus instructions into a downloadable GitHub Actions artifact named `sitepivot-STAGING-<sha>`. It has read-only repository permissions and no Pages deployment action, hosting API, server environment or production credentials. It is separate from the public website, with a visible STAGING banner and distinct page title. It is not a hosted preview URL. It becomes remotely available only after a safe development push and successful artifact workflow.

To prepare it locally: `node qa/build-staging-preview.cjs`. Extract/download the resulting directory, run `python3 -m http.server 8080` from it, and open `http://localhost:8080/?fixtures=1` for labelled fixture testing. No saved property session data is copied into the package.

## Normal process

Investigate → Implement → Test → Commit → Push to development branch → Report results.

Stop only for the consequential-action boundary or unavailable credentials/permissions. A push remains blocked if it would publish the public website without explicit deployment approval. After any approved separation change, verify the protection and public-site state before pushing, then verify the remote commit and that no production deployment completed.
