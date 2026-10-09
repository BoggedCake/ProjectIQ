# SitePivot development authority and deployment separation

Chris Lewis's standing authorisation, effective 9 October 2026, permits routine investigation, implementation, supporting files, testing, regression repair, commits and pushes to `BoggedCake/ProjectIQ` branch `sitepivot-concept`. Repeat these steps until acceptance criteria are satisfied; do not request approval for every development step.

Canonical policy: [SITEPIVOT — FOUNDER AUTHORITY & APPROVAL GUARDRAILS](https://app.notion.com/p/3f4c5050096e80d885dadafc60623acc).

Production publication/deployment, merges to `main`, expenditure and commercial commitments, external email/marketing/customer communications, destructive or irreversible operations, security-sensitive changes and production-credential changes still require explicit founder approval. Authentication and repository protections must never be bypassed.

## Current separation status

**No safe development-branch push is currently verified.** The existing GitHub connector shows that prior `sitepivot-concept` pushes automatically triggered GitHub's implicit Pages build-and-deployment workflow. The remote head remains `4c1506e3c5f9656e1e68c299919debba8ba16ab1`.

Use only the existing GitHub connector and repository permissions. The GitHub browser sign-in process has been stopped. At this stage, do not request new browser authentication, repository permissions or production access, create deployment environments, or change GitHub Pages settings. Do not push if it would publish the public site. Preserve all completed commits and report the deployment coupling as the specific blocker without requesting broader access. Routine internal implementation, tests, supporting files and local commits remain authorised.

## Staging preview

`sitepivot-preview.yml` packages only the four public client files plus instructions into a downloadable GitHub Actions artifact named `sitepivot-STAGING-<sha>`. It has read-only repository permissions and no Pages deployment action, hosting API, server environment or production credentials. It is separate from the public website, with a visible STAGING banner and distinct page title. It is not a hosted preview URL. It becomes remotely available only after a safe development push and successful artifact workflow.

To prepare it locally: `node qa/build-staging-preview.cjs`. Extract/download the resulting directory, run `python3 -m http.server 8080` from it, and open `http://localhost:8080/?fixtures=1` for labelled fixture testing. No saved property session data is copied into the package.

## Normal process

Investigate → Implement → Test → Commit → Push to development branch → Report results.

Stop only for the consequential-action boundary or unavailable credentials/permissions. A push remains blocked if it would publish the public website without explicit deployment approval. If a safe no-deployment push can be verified using the access and configuration already available, push to `sitepivot-concept` only and verify the remote commit. Otherwise preserve the work and report the specific blocker.
