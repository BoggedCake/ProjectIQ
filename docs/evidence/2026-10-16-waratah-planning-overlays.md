# Waratah planning and overlay check

Checked 15 October 2026 UTC (16 October in Sydney). Live official spatial queries; indicative GIS evidence, not a planning certificate or survey.

## Exact property and mapped controls

NSW Address Point Formatted returned exactly one match for streetnumber1='19', streetname='WARATAH', localityname='BALGOWLAH': **19 WARATAH ST, BALGOWLAH NSW 2093**, objectid 220164, cadid 102195072, cadastral identifier **46//DP9860**, Northern Beaches Council. Cadastre returned one matching lot, Lot 46 DP9860. Calculated parcel area is **559.4312697 m²**; registered plan area fields are null. The service's Shape__Area is projected geometry metadata and must not replace the ground-area calculation.

Official EPI primary layers returned:

| Layer | Result | Metadata caveat |
| --- | --- | --- |
| 2 zoning | R1 General Residential; Manly Local Environmental Plan 2013 | Map Amendment No 2; mapped commencement 26 April 2023, currency 24 May 2024 |
| 1 FSR | 0.6:1; clause 4.4 | Map currency 5 August 2022 |
| 5 height | 8.5 m; clause 4.3 | Map currency 5 August 2022 |
| 4 minimum lot | 250 m²; clause 4.1 | Subdivision control, not duplex construction minimum; map currency 5 August 2022 |
| 0 heritage | I27 Street trees; Item – Landscape; clause 5.10 | Mapped commencement 19 April 2013; currency 21 August 2026 |

These are source-record map dates, not verification of the current consolidated legislation's last amendment.

## Council overlays and parcel relationship

Council layer 126 returned coverage for the entire input parcel using `esriSpatialRelWithin`; its actual LGA_NAME is **Northern Beaches Council**. Normalization must accept that suffix and reject different LGAs.

- Flood layers 158, 159, 160 and 161: complete queries returned no mapped overlap. This means a bounded mapping negative, not flood immunity or a flood certificate.
- Heritage layer 14: OBJECTID 157, I27 Street Trees, Item – Landscape. Exact geometry intersection measured approximately **0.000195678 m²**, a boundary-scale mapping overlap. This does **not** establish that the dwelling is listed. Retain the trigger and confirm the tree/item extent.
- Heritage conservation area layer 13: no overlap. Other council heritage layers 43, 44, 91 and 103: no overlap. No buffer/locality search was used; broader adjoining heritage assessment remains outstanding.
- Acid sulfate layer 16: Class 5. Other acid layers 45, 92 and 100: no overlap. Class 5 controls concern specified works and potential groundwater effects; the mapping is not a geotechnical finding.

## Statutory interpretation boundaries

The council identity is Northern Beaches Council; the returned applicable instrument remains **Manly Local Environmental Plan 2013**. Council's planning-controls page describes the Northern Beaches LEP as a draft (exhibition 20 July–30 August 2026), considered alongside existing controls rather than substituted as an enacted instrument. Current consolidated Manly legislation retrieval returned HTTP 403; current amendment currency and any unverified effective date remain unknown.

NSW Planning's official LMR summary gives dual occupancy non-refusal standards of 450 m², 12 m width, 0.65:1 FSR and 9.5 m height in eligible R1–R4 land **where dual occupancy is permitted**; R1–R3 subdivision standards are 225 m² / 6 m per resulting lot. A named suburb or proximity alone does not prove the legal 800 m walking catchment or clear exclusions. Those standards must not be presented as unconditional Waratah controls. Construction, subdivision and complying development remain separate assessments.

## Official sources and reproduction

- [NSW formatted address service](https://portal.spatial.nsw.gov.au/server/rest/services/Hosted/NSW_Address_Point_Formatted/FeatureServer/0): exact structured address `where` above, `outFields=*`, geometry in EPSG:4283.
- [NSW cadastre](https://portal.spatial.nsw.gov.au/server/rest/services/NSW_Land_Parcel_Property_Theme/FeatureServer/8): `where=cadid=102195072`, return geometry in EPSG:4283.
- [NSW EPI primary planning layers](https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/EPI_Primary_Planning_Layers/MapServer): layers 0,1,2,4,5; spatial intersects against the exact cadastral polygon, no distance/buffer.
- [Northern Beaches official map service](https://maps.northernbeaches.nsw.gov.au/arcgis/rest/services/NBC_PWM_LEPs/MapServer): layer IDs above; exact parcel intersects, with coverage queried using within.
- [Manly official map register](https://www.planningportal.nsw.gov.au/publications/environmental-planning-instruments/manly-local-environmental-plan-2013): zoning/key-sites digital maps; other map types retain in-force PDFs.
- [Manly LEP legislation](https://legislation.nsw.gov.au/view/html/inforce/current/epi-2013-0140): full-text currency unverified due HTTP 403.
- [Council planning controls](https://www.northernbeaches.nsw.gov.au/planning-and-development/planning-controls): draft Northern Beaches instrument status.
- [Official LMR standards](https://www.planning.nsw.gov.au/the-planning-system/housing/low-and-mid-rise-housing-policy/summary-of-key-provisions).
- [Council LMR implementation](https://www.northernbeaches.nsw.gov.au/planning-and-development/planning-future/planning-growth/housing/low-and-mid-rise-housing-policy): stages commenced 1 July 2024 and 28 February 2025; revised DCP controls commenced 15 September 2025.
