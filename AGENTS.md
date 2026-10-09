# SitePivot standing development authority

Read `DEVELOPMENT_AUTHORITY.md` and the linked canonical Notion Founder Authority page before SitePivot work. Chris Lewis permanently authorises routine bug investigation, implementation, supporting files, tests, regression repair, development workflow maintenance, documentation, commits and pushes to `sitepivot-concept`. Do not ask for approval at each routine step.

Normal process: Investigate → Implement → Test → Commit → Push to development branch → Report results. Stay within the existing SitePivot project and preserve prior implementation.

Do not merge into `main` or deploy/publish production without exact founder approval. Paid services/expenditure/commercial commitments, external communications, destructive/irreversible operations, security-sensitive changes and production-credential changes also require explicit approval. Never expose secrets or bypass authentication, repository security or production protections.

Before a development push, verify it cannot automatically publish the public website. The current deployment separation is **not yet configured or verified**; authenticated repository settings access is still required. A statement in this file is not a technical gate. If a push would deploy production, stop at that concrete boundary. Do not treat standing development authority as production deployment authority.

The staging artifact workflow builds a clearly labelled downloadable preview only; it does not deploy the public website. Stop only for consequential actions or unavailable credentials/permissions, and report the precise blocker without requesting approval already granted.
