# 12 Fishbourne Road evidence reconciliation — 9 October 2026

The NSW authoritative address, lot and property records agree on the parcel identity. The discrepancy is in the areas asserted by different sources, not an established missing adjoining parcel.

| Evidence | Result |
| --- | --- |
| NSW Address Point Formatted, exact street number/name | 12 FISHBOURNE RD, ALLAMBIE HEIGHTS NSW 2100; cadastralidentifier `119//DP12764`; lot_cadid `102189568`; ss_propid `913020`; prop_gurasid `51302920` |
| NSW Lot layer 8, exact lot/plan | Lot 119, DP12764, cadid 102189568; planlotarea and units both null |
| NSW Property layer 12, propid 913020 | Exact address; gurasid 51302920; dissolveparcelcount 1; valnetlotcount 1; same shapeuuid as lot |
| Calculated mapped lot geometry | 608.92 m² with ellipsoid local tangent scale; previous spherical calculation reproduces 610.49 m² |
| Service Shape__Area | 883.517; service storage is Web Mercator. Its planar area is not a ground/registered area. It is not evidence of an 847 m² registered lot. |
| Founder-provided advertised listing screenshot IMG2858.jpeg | Reports 847 m². This listing assertion is reported evidence; its title/parcel scope and registered survey have not been independently inspected. |

The exact official address-to-cadastral and address-to-property association rules out blindly summing nearby intersecting parcels as a correction. No registered area can be selected from the official record because the plan area attribute is absent. The app preserves the mapped area as indicative and displays the reported listing discrepancy as Needs Review. It does not replace either measurement with 847 or imply that a survey has been checked.

Frontage previously used road centrelines within 25 m plus parallel parcel segments; opposite/front and back boundaries can both qualify. The replacement measures shared boundary with RoadCorridor polygon layer 5. This snapshot returns 10.5 m against FISHBOURNE RD, 39.8 m against ORARA RD and 5.4 m against an unnamed curved corner corridor. These are separate indicative mapped contacts, not an 83.4 m street frontage or an authoritative legal access measurement. A centreline without a road corridor produces Needs Review. Legal frontage/access and curved-boundary survey lengths still require confirmation.

Primary raw JSON is preserved in `qa/fixtures/property-evidence/`; each file includes the exact public source query and retrieval timestamp. No personal ownership information or credentials are included.

Sources:

- NSW Address Point Formatted: https://portal.spatial.nsw.gov.au/server/rest/services/Hosted/NSW_Address_Point_Formatted/FeatureServer/0
- NSW Lot: https://portal.spatial.nsw.gov.au/server/rest/services/NSW_Land_Parcel_Property_Theme/FeatureServer/8
- NSW Property: https://portal.spatial.nsw.gov.au/server/rest/services/NSW_Land_Parcel_Property_Theme/FeatureServer/12
- NSW RoadCorridor: https://portal.spatial.nsw.gov.au/server/rest/services/NSW_Land_Parcel_Property_Theme/FeatureServer/5
- Reported Domain listing: https://www.domain.com.au/12-fishbourne-road-allambie-heights-nsw-2100-2021227900

The dated discrepancy registry in `property-evidence.js` matches cadid **and** lot/plan. It records provenance as `reported`, never `verified`, and only triggers review; it never overrides geometry or spreads the conflict to another property. Additional adapters may pass `supplementaryAreas: [{areaSqm, source, url, cadid?, checkedAt?, verification?}]` to the generic evidence resolver.

Verification: `node qa/property-accuracy-regression.cjs` covers holes, nested islands, multipolygons, CRS ambiguity, self-intersection, identity mismatch, ambiguous parcel aggregation, registered-area units/conflict, centreline withholding, separated corridors, corner and battleaxe frontage, dated discrepancy isolation, and the saved official Fishbourne association.
