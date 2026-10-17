# NSW spatial controls, address reliability and scope calibration implementation plan

> For agentic workers: use executing-plans for the spatial/integration work and independent-domain agents for address diagnosis and cost research. Tests precede fixes. Do not commit or push this task.

**Goal:** Resolve quantitative planning controls from actual parcel polygon coverage; preserve authoritative identity and eligibility safeguards; replace opaque renovation allowances with explicit adjustable scope.
**Architecture:** Reuse the bounded zoning overlay for quantitative controls, retaining all raw features and measured intersections. Authoritative adapters must supply complete geometry. No neighbouring control becomes capacity merely by touching a parcel. Attribute-only legacy evidence remains explicitly non-spatial; current live calculation requires spatial support. Hazard/protection overlays retain their independent conservative rules.
**Tech stack:** Existing CommonJS/browser UMD JavaScript, Node24, jsdom, Playwright; no paid sources or new GIS dependencies.
**Spec:** User-supplied request, `/workspace/attachments/15a6f00e-b3cb-4e79-89de-0c9e8676f7b0/Pasted text.txt`.

## Global constraints
- Existing sitepivot-concept checkout, reconciled base485432cae73dc86cb0577f36c89c43272b347e55; preserve prior performance, finance and planning-proof safeguards.
- No main merge, commercial launch, paid services, unverified push or Pages update without founder approval.
- No invented current statutory or QS evidence; missing live access/inputs are explicit blockers.
- No automatic averaging or favourable-control selection. Small hazard/heritage overlaps are never discarded.

## Review focus
- Tiny quantitative neighbour contact and microscopic source boundary gaps: retain both, disclose bounded mapping uncertainty, exclude unsupported area from capacity; significant gaps remain reviewable.
- Duplicate/cross-instrument overlap cannot inflate covered area or GFA.
- Compatible CRS transformations must preserve geometry topology; unsupported datum transforms fail closed.
- Slow direct authoritative lookup cannot hide ambiguous/incomplete evidence behind a faster fallback.
- Internal renovation allowances are not licensed QS quotations; GST, project risk and structural work must not be double counted.

## Task1: parcel-aware quantitative controls (root)
Files: zoning-evidence.js, property-evidence.js, fsr-evidence.js, api/_lib/sitepivot.js, index.html; new qa/parcel-controls-regression.cjs, real-source fixture, live spatial gate; existing spatial/FSR integration fixtures where geometry is now mandatory.
- [x] Capture current parcel/zone/FSR/height/lot raw geometries, identifiers, source metadata and timestamps for New Street West and independently selected adjoining parcel.
- [x] RED: real New Street must not return1:1/0.45:1; tiny-contact audit remains. Add split, overlap, gap, provisions, mixed-CRS, hole/multipart, invalid/incomplete and hazard regressions.
- [x] Expose bounded overlay measurements. Add same-datum CRS normalization with metric working coordinates; refuse unsupported datum assumptions.
- [x] General resolver returns state/value/areas/records/provenance/precision policy for FSR, height and lot. Preserve legacy attribute parsing but mark it non-spatial; fresh live controls require geometry.
- [x] Boundary-contact classification requires near-total supported coverage, no positive significant area, no cross-instrument contradiction and no special provision; use strict conservative precision floor, document accuracy guidance limitations. Zoning remains reviewable; hazard logic unchanged.
- [x] Retrieve geometry for all quantitative primary layers in parallel; core/final/browser contracts must agree. Passport explains one supported control or measured split areas; GFA consumes only supported control evidence.
- [x] GREEN: new spatial suite, existing FSR/zoning/area/eligibility/progressive/performance suites.

## Task2: authoritative address reliability (agent research, root API integration)
Files: api/_lib/sitepivot.js, index.html if browser integration required; qa/address-identity-recovery.cjs and docs/address-reliability-2026-10-17.md.
- [x] Verify current source schema; do not add nonexistent suffix fields based on synthetic tests.
- [x] RED: exact repeated lookup must reuse complete prior verified identity without another known-failing direct query. Test immutable cached proof and identity isolation.
- [x] Bound positive resolved-identity cache by exact original selection and original source timestamps. Optional delayed hedge overlaps known slow direct lookup but must await/veto incomplete or ambiguous direct responses before acceptance.
- [x] Measure genuine finite cold/warm New Street and existing identifiable West Street cases, report p50/p95 methodology, transport and limits; do not infer unavailable target addresses.

## Task3: scope-led renovation calibration (agent model, root UI)
Files: commercial-engine.js, index.html; qa/renovation-scope-calibration.cjs, docs/renovation-calibration-2026-10-17.md.
- [x] RED: quantities/structural scope/GST/project ledger/dedup/unsupported reconstruction.
- [x] Reproduce candidate213600 renovation and exact132m² extension/108m² storey arithmetic; distinguish reconstructed inputs from founder-observed configuration.
- [x] Preserve addition/development rate bands; expose internal scope allowances and editable quantities, rather than inventing QS prices or applying a universal uplift.
- [x] Treat existing bands as opaque GST+ordinary contingency inclusive; do not invent a10%embedded contingency rebasing. Incremental allowances must identify scope not already included. Government fees have separate GST treatment.
- [x] UI persists quantities/assumptions, labels scope classes and exclusions, retains mixed-work finance. GREEN relevant renovation/finance/UI suites.

## Task4: validation and independent release assessment
- [x] Integrate permanent suites into npm/CI; run targeted and full unit/integration/browser/finance/security checks.
- [x] Capture live spatial/address source results via approved network; native Node transport limitations stay explicit. GitHub Actions live checks require future approved candidate publication, not an unapproved push.
- [x] Fresh independent whole-diff review; verify no source/finance/performance work lost. Record blockers and GO/NO-GO with exact HEAD and changes. Leave uncommitted for founder review.

## Execution ledger
- Reconciled remote:485432cae73dc86cb0577f36c89c43272b347e55, no newer changes, clean start.
- Current official curl NSW access succeeds; raw New Street projected parcel and four control layers captured17October2026. Native Node access was restored with supported NODE_USE_ENV_PROXY=1; two explicit live controls and broader server QA passed with documented review outcomes.
- Public cost-provider requests currently403; no claimed fresh2026QS quotes. Founder supplied exact scopes; all three baseline amounts are preserved and tested.

- Latest user steering: numerical/mapping microgaps must not automatically become material planning conflicts. Independent Nield EPSG28356 capture confirms0.00053745m² source mismatch; bounded10ppm/0.01m² policy is disclosed as internal engineering tolerance, not NSW statutory accuracy. Uncertain area never increases capacity.
- Final full npm test and security exited0;48new focused tests and31existing progressive/performance safeguards pass. Chromium fixture and live founder journeys pass; WebKit cannot launch because host libraries are missing and root installation authentication is unavailable.
- Final local and remote commit remain485432cae73dc86cb0577f36c89c43272b347e55; all new work remains uncommitted. See complete report and independent review for exact gates and unresolved limitations.
