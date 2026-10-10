# Residential FSR evidence repair — 10 October 2026

The checked endpoint is the NSW EPI Primary Planning Layers, Floor Space Ratio polygon layer (MapServer/1):
https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/EPI_Primary_Planning_Layers/MapServer/1?f=pjson

The live service answered metadata and queries on 10 October 2026. This investigation does **not** establish a statewide upstream outage. The application previously reduced FSR retrieval to a string or null, losing the distinction between completed absence, query failure and unresolved parcel. Its generic LGA filter could discard spatially applicable primary EPI polygons carrying historical council names. The repaired primary-layer lookup relies on polygon intersection rather than current-council string equality. Other council-specific service checks retain their existing filters.

Metadata confirms `esriGeometryPolygon`, geographic reference WKID4283, numeric double field `FSR`, and instrument `EPI_NAME`. The prose description still mentions `LEP_Name`, which is absent from the actual field schema. `MAX_FSR` remains a compatibility alias, not a verified field on this layer. `LAY_CLASS` is commonly a renderer interval such as `1-1.09`, not an exact statutory ratio. `SYM_CODE` is a renderer code and must never become an FSR. Provenance comes from `EPI_NAME`, `LEGIS_REF_CLAUSE`, source URL and retrieval timestamp. `CURRENCY_DATE`, `PUBLISHED_DATE`, `COMMENCED_DATE`, `AMENDMENT`, `PCO_REF_KEY` remain in the raw records; an amendment string alone does not prove an FSR bonus or exception.

## Evidence contract

`fsr-evidence.js` exports CommonJS and browser global `SitePivotFSR`. `resolve({records,error,parcelResolved,queryComplete,instrument,source,checkedAt,modified,modificationReason,clause,stateOverride})` accepts ArcGIS features or attribute rows. It returns `state`, `label`, `value`, numeric `values`, attribute `records`, `provenance`, `reason`, `requiresReview`, `queryComplete` and `parcelResolved`.

| State | Evidence required |
| --- | --- |
| mapped | Complete resolved-parcel query, one exact numeric ratio and one instrument |
| unmapped | Explicit `parcelResolved:true`, `queryComplete:true`, no error and empty records |
| service-failure | Error, incomplete query, malformed response or transfer truncation |
| parcel-unresolved | Parcel boundary unresolved; point hits may be retained as records but do not certify a parcel-wide control |
| multiple | Different ratios or instruments intersect the parcel |
| modified | Caller supplies a verified modification marker, or mapped rows lack an exact ratio / carry site-specific legislative references |

Only `stateOverride:'modified'` is honored; overrides cannot turn failed or point-only retrieval into unmapped. Mapped/multiple/modified numeric values remain displayed as ratios; failed and unresolved states have no resolved value. `requiresReview` is false only for the simple mapped state. Unmapped means no polygon returned from this particular source; it does not mean no planning control, unrestricted floor area, approval or an exemption from DCP/SEPP/site provisions.

The server returns this object as `planning.fsrEvidence` and retains `planning.fsr` for compatibility. ArcGIS error payloads already reject through `fetchJson`. `spatial` now rejects missing feature arrays and `exceededTransferLimit:true` rather than treating them as a completed absence.

## Official captures

Dated raw source responses are in `qa/fixtures/fsr-evidence`. Mapped object-specific queries return complete single feature records, including geometry and all attributes:

| Scope | Instrument | OBJECTID | FSR |
| --- | --- | --- | --- |
| Northern Beaches | Manly LEP2013 | 163653 | 1:1 |
| Central Coast | Central Coast LEP2022 | 268767 | 2:1 |
| Sydney metro | North Sydney LEP2013 | 637 | 1:1 |
| Greater Sydney | Parramatta LEP2023 | 221028 | 2:1 |
| Regional NSW | Orange LEP2011 | 2307 | 1.5:1 |

These are real mapped control examples, **not claims about a specific residential address**. Broad exploratory queries with resultRecordCount1 reported transfer truncation, so the checked fixtures query the returned OBJECTID directly. No invented unmapped regional fixtures are used.

The authoritative address service returned **16 EILEEN ST, NORTH BALGOWLAH NSW2093**, Northern Beaches, standard lot, `61//DP11915`, `lot_cadid102174177`, propertyID911436; point151.24921799154842,-33.787135366738404. The cadastre query for that cadid returned one associated polygon and the same lot/plan identity. Its planlotarea is null. The existing geographic polygon calculation gives **471.3665m² indicative GIS area**, which corroborates a rounded471.4 without introducing an address-specific area override. Raw Shape__Area684.163 is a projected service attribute and must not be substituted for the geographic calculation or presented as surveyed area.

The **whole parcel polygon** query to FSR layer1 successfully returned an empty features array (saved as `eileen-fsr.json`), so the source state is unmapped. Live whole-parcel queries to layer2,4,5 returned Warringah LEP2011, R2 Low Density Residential, ordinary subdivision Lot Size600m² (Clause4.1), and height8.5m (Clause4.3). Neither FSR0.5 nor another ratio may be fabricated for this address. The applicable LEP/DCP and proposal-specific standards still require independent interpretation. The layer's council attribute is already NORTHERN BEACHES at this site; historical-LGA filtering is a general retrieval defect, not the demonstrated reason for Eileen's empty FSR result.

## Verification

`node qa/residential-fsr-regression.cjs` covers browser/CommonJS parity, official mapped captures across five scopes, the official Eileen completed parcel absence and geographic area, unknown/failed/malformed/truncated retrieval, current versus legacy council names, ambiguous ratios, zero, sentinel and nonnumeric renderer values, and explicit modification state.

The full `npm test` run reached and passed property/planning/conversation tests, then stopped at the shared cost test `qa/cost-recalibration.cjs:16` (expected3576228, actualundefined). That failure is outside this FSR change and must be resolved/rechecked by the integration owner before claiming a passing full suite.

## Address-specific mapped acceptance captures

Independent official address → unique associated cadastral parcel → point and whole-parcel FSR lookups on 10 October 2026 establish two real mapped examples. The combined fixtures retain each query URL, response and UTC retrieval timestamp, rather than treating an arbitrary control polygon as a representative property.

| Official address | Associated parcel | Cadid | FSR | LEP / clause | FSR OBJECTID |
| --- | --- | --- | --- | --- | --- |
| 1 WARATAH ST, BALGOWLAH NSW 2093 | 54//DP9860 | 102195050 | 0.6:1 | Manly LEP2013 / Clause4.4 | 163719 |
| 57 GRIFFITHS ST, FAIRLIGHT NSW 2094 | 32//DP1729 | 102195437 | 0.6:1 | Manly LEP2013 / Clause4.4 | 163947 |

`waratah-balgowlah-property.json` and `griffiths-fairlight-property.json` each include `address`, `parcel`, `pointFsr` and `parcelFsr` dated response envelopes. All four lookups completed without ArcGIS error or transfer truncation, returned unique address/parcel records with matching cadastral identity, and both spatial FSR checks returned the same exact0.6 control. The production resolver returns `mapped`, `0.6:1`, Manly LEP2013 and Clause4.4 for the full-parcel captures. These examples support live acceptance of mapped FSR in Balgowlah and nearby Fairlight; they do not establish comprehensive statewide address coverage. The five regional control-object fixtures remain bounded parsing/provenance coverage, not address-specific validation.

An exact query for streetnumber1 / SYDNEY / BALGOWLAH returned no unique official address for the suggested 1 Sydney Road address; no property facts were inferred for it.
