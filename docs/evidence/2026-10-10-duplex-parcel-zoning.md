# Whole-parcel zoning evidence — 10 October 2026

Fresh official NSW address, cadastral and planning captures are retained in `qa/fixtures/zoning-evidence/{violet,nield,eileen}.json`. Each request records its full query URL, UTC check time and raw response. No advertised land-area assumption or founder-supplied planning ratio overrides these source responses.

| Official address | Matched parcel | Indicative mapped area | Parcel zoning | Mapped FSR | Mapped subdivision minimum |
| --- | --- | ---: | --- | --- | --- |
| 9 VIOLET ST, BALGOWLAH NSW 2093 | cadid 102196866, lot 34 DP9598 | 596.8016 m² | R1, Manly LEP 2013 | 0.5:1 | 300 m² |
| 3 NIELD AV, BALGOWLAH NSW 2093 | cadid 102198152, lot 2 DP228402 | 605.9145 m² | Dominant R1, Manly LEP 2013; RE1 boundary uncertainty retained | 0.5:1 | 300 m² |
| 16 EILEEN ST, NORTH BALGOWLAH NSW 2093 | cadid 102174177, lot 61 DP11915 | 471.3665 m² | R2, Warringah LEP 2011 | No mapped FSR returned from completed full-parcel query | 600 m² |

Mapped subdivision minimum is a separate control from dual-occupancy eligibility or permission. GIS area is not registered survey area. The cadastral `planlotarea` attributes are null. Web Mercator service `Shape__Area` values are not treated as ground area.

## Nield false mixed-zoning diagnosis

An ArcGIS `Intersects` query returns both RE1 and R1 for the validated Nield parcel. Counting distinct zone codes previously produced a split-zone finding without measuring affected land. The RE1 polygon intersection measures approximately **0.000172478 m²**, a **0.0000284657%** parcel fraction. R1 covers approximately **605.9143541 m²**, or **99.9999715343%**. This is a tiny cadastral/planning polygon-edge mismatch, not evidence of a material mixed-zone development footprint.

The resolver returns `boundary-review`, retains both original polygons and measured areas, identifies dominant R1, and sets `requiresReview: true` and `splitZone: false`. It does not erase RE1, declare a legal zoning boundary or confirm CDC eligibility. Survey/planning confirmation remains necessary before relying on the exact boundary or proposed footprint. Genuine significant intersections in multiple zones return `split-zone` and `footprintRequired: true`.

## Shared browser/server contract

`zoning-evidence.js` exposes CommonJS and `window.SitePivotZoning`. Browser and server both request zone polygon geometry at WKID 4283 and call the same resolver. Historical council names do not remove spatially intersecting primary EPI polygons.

`planning.zoningEvidence` contains `state`, `primaryZone`, `zoneAreas`, `requiresReview`, `splitZone`, `footprintRequired`, `parcelAreaSqm`, `toleranceSqm`, `reason` and `provenance`. Each zone-area row retains its source geometry and attributes, code, label, instrument, indicative intersection area, parcel fraction and classification. Provenance records source endpoint, check time, parcel versus address-point scope and calculation method.

The boundary-review threshold is **max(2 m², 0.5% of parcel area)**. This is a conservative screening uncertainty threshold, not a statutory exemption or a mechanism for deleting a real zone. Any positive measured minor zone intersection remains boundary-review; exact zero-area boundary contact is adjacent. An unresolved polygon, CRS mismatch, crossing zone boundaries within the parcel, incomplete query, overlapping coverage or material uncovered parcel cannot confirm a single zone. Point-only results never establish whole-parcel zoning.

Intersection calculations project geographic coordinates onto the same local ellipsoid tangent scale used by property area evidence. Vertical slab integration handles concave rings, holes and separate islands using even/odd polygon interiors. It integrates between vertex and boundary-crossing events without external dependencies. Mapped linear polygons only: unsupported curves and invalid geometry remain review-required. Large-area geographic projection accuracy and legally surveyed boundaries are outside this property screening method.

## Verification

`node qa/residential-zoning-regression.cjs` passes synthetic adjacent-contact, tiny overlap, real split, unknown geometry, missing coverage, overlapping coverage, CRS mismatch, unsupported curve, invalid crossing, hole and concavity cases. It tests browser/CommonJS calculation parity, exact current browser spatial functions and server retrieval against all three official capture fixtures, including polygon-return query parameters, 0.5:1 ratios and 300/600 m² mapping. `node qa/residential-fsr-regression.cjs` also passes.

### Instrument selection review

Browser and server now choose `primaryZone.instrument` only for measured `single-zone` or `boundary-review` states. Other states retain a composite of all source EPI names, or null when none exist; they do not select the first intersecting LEP as the property's applicable instrument. All source instrument names remain in `epiNames` and zone-area rows.

A regression based on a copied Nield capture assigns the tiny RE1 feature a different LEP and leaves its response order first. Before the fix, the browser selected a composite and the server selected the first LEP; both could contaminate parcel rule selection. After the fix, both return dominant R1's Manly LEP while retaining the other source instrument in evidence. An adversarial full-overlap variant remains geometry-unresolved and returns both instruments; duplicate same-zone coverage also remains unresolved. These adversarial copies are generated inside the test, not written into the raw official captures.
