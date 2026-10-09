# SitePivot development authority

Read DEVELOPMENT_AUTHORITY.md and FOUNDER_TESTING.md. Routine SitePivot fixes, tests, commits and pushes to sitepivot-development are authorised. Follow Fix → Test → Commit → Push to safe development branch → Founder testing.

The repository and all branches are public source code. sitepivot-concept remains the public Pages source; do not push repairs there. The Pages build log checks out sitepivot-concept at repository root. Development workflows have contents: read only and no publishing steps. Before pushing, recheck workflow triggers and publishing dependencies; never bypass protections or expose secrets.

Do not merge main or publish production without Chris Lewis’s explicit approval. Expenditure, commercial commitments, outbound communications, irreversible operations and security-sensitive production changes also require approval. Use existing connector permissions; do not request broader access or browser authentication for routine development. The loopback founder server is the verified local testing method; do not call a branch private or claim an authenticated hosted preview exists.
