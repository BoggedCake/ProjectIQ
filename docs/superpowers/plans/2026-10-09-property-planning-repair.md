# Property accuracy and planning intelligence repair plan

> Execution: systematic debugging, test-driven implementation and separate spatial/legal investigations; integrate and independently review before connector push. The founder brief in Pasted text(8).txt is the binding specification.

Baseline: GitHub sitepivot-concept 9381d80e2ffb3a21ca76034f686784f22d36d33c. Local history preserves earlier repairs; source tree matches this baseline. No reset, main merge or new hosting. Existing Pages founder-test updates authorised.

## Task 1 — diagnose and repair spatial evidence
Read NSW address/cadastre/road records for Fishbourne; preserve source payloads and retrieval date. Reproduce wrong area/frontage. Write RED geometry, identity, source-conflict and road-boundary tests. Implement shared property-evidence.js and use it in both existing adapters. Do not use centreline proximity as road frontage. Legal plan area, mapped GIS and advertised figures keep separate evidence states; unresolved conflicts cannot be Verified. GREEN spatial suite and existing parcel/API regressions.

## Task 2 — planning applicability
Retrieve official current instruments, clauses, commencement dates and map provenance. Write RED tests separating land-use consent, duplex area, ordinary subdivision, dual-occ subdivision and CDC. Implement planning-intelligence.js with scoped, versioned provision registry and explicit applicability gaps. A DCP cannot create a land-use prohibition. LMR walking catchments and exclusions must be resolved, never assumed from LGA. Mapped minimum lot size must retain its clause/purpose. GREEN planning regression and grounded-answer suite.

## Task 3 — conversation and voice
Write RED tests for subdivide/two homes, secondary dwelling, rebuild, retained follow-ups and blocked duplex replies. Feed property/evidence/history/decision into both typed and voice interpretation. Explain structured planning checks before pathway promotions; avoid generic summaries and redundant introductions. Preserve raw voice transcripts; accumulate final segments correctly and only resolve high-confidence domain homophones in a narrow phrase context. GREEN unit and browser parity tests.

## Task 4 — comparisons and consumer interface
Write RED loan/equity, replacement project and unknown finance tests. Build comparison-engine.js reusing versioned duty and cost arithmetic. Compact keeping-vs-selling action with editable meaningful inputs, clear assumptions and actionable sequencing, no outbound referral. Remove nested mobile conversation scroll and oversize frontage heading. GREEN comparison and mobile journeys.

## Task 5 — evidence and whole journey verification
Recheck real addresses across Northern Beaches, Central Coast, inner Sydney, Greater Sydney and regional NSW. Store sourced results and precise gaps, not HTTP-only passes. Profile suggestions/cached replies and progress behaviour. Run npm test and Chromium/WebKit desktop/mobile flows. Independent review for false certainty, geospatial errors, precedence, voice, double count and mobile obstruction. Fix material findings with RED→GREEN tests. Commit/push through connector to concept; verify deployed source byte equality and deployed flows. Report exact SHA/URL plus all remaining externally blocked data/device checks.

## Shared interfaces and decisions
- PropertyEvidence.parcelEvidence returns geometry, areaEvidence, identityEvidence; PropertyEvidence.frontage keeps primary.metres/secondary compatibility.
- SitePivotPlanning.assess consumes property evidence and resolved planning instrument/map provenance; answer consumes structured results, never generic model legal knowledge.
- SitePivotComparison.evaluate consumes working user values and existing cost/duty model, never creates market or borrowing inputs.
- Ruling: unknown evidence remains unknown even where this prevents a positive answer. The failure cost of assuming permission is materially worse than asking for the exact missing check.

## Progress
Diagnosis: founder screenshots recovered and inspected. 472.6 m² property address and Central Coast address are absent from screenshots; do not claim a substituted property is the original. Fishbourne listing advertises847 while independent historic profiles report609; neither overrides official lot evidence. Frontage algorithm currently adds parallel front/rear edges close to centreline. Existing planning responses have no operative provision evaluator and call generic duplex 'worth exploring'.

Implementation / review checkpoint: shared spatial, planning, conversation, transcript and comparison modules integrated. Independent review found stale rejected proposal, unsuitable replacement recommendation, blank configuration followup and aligned polygon overlap; each reproduced RED then fixed GREEN. Nonbrowser full suite passes (199 PASS lines). Browser installation twice failed with truncated 0 MiB ZIP; CI retains full browser checks and must pass before claiming browser acceptance. Five local direct-fetch regional probes timed out; environment proxy probe follows, source failures retained.
Ruling: unresolved LMR walking catchments and full exclusions stay review; current legal registry is bounded, not complete all-NSW development permission coverage. Cost if wrong: no automatic approval claim, but manual planning review remains necessary.
Ruling: blocked ordinary duplex retains an optional scenario-cost action after the planning-first action; costs are exploratory and do not establish permission.
Deferred minor: subdivision lot-count extraction remains two-lot default; user requests for other counts require a clearer input.
