# Duplex cost recalibration — 9 October 2026

Version `duplex-cost-2026-10-09-v2`. This is an early working estimate informed by published building comparators, not a measured QS estimate, tender, or exact published duplex rate. No source establishes the model's complete combination of finish, basement, access, fees and contingency allowances.

## Evidence and limits

| Primary publisher | Publication / reference date | Verified evidence | Model use and limitation |
|---|---|---|---|
| [BMT Quantity Surveyors](https://prod.bmtqs.com.au/construction-cost-table) | 2026 page, accessed 9 Oct 2026; page does not give a precise rate update date | Sydney GFA, ex GST. Four-bedroom unique-design two-level brick veneer: $3,167 / $3,579 / $4,154 per m²; full brick: $3,500 / $4,018 / $4,387. Executive residence: $4,645 / $5,947 / $8,318. Includes preliminaries, builder profit/overheads. | Primary numeric building comparator. These are house typologies, not duplex tariffs. Own working duplex bands below account for design/spec uncertainty. Townhouse rates include common property, so they were not copied and then charged common works again. |
| [RLB Riders Digest Australia 2026](https://www.rlb.com/oceania/insight/rlb-riders-digest-australia-2026/) and [Sydney PDF](https://www.rlb.com/wp-content/uploads/sites/1/2026/01/2026-RLB-Rider-Digest_Sydney_Digital_2.pdf) | 23 Jan 2026 release | Publisher confirms 2026 building-type/region cost intelligence. Both public Sydney PDF routes returned 403 to retrieval. | Specific tables, pricing base date, GST basis and exclusions could not be independently checked here. Secondary summaries were located but their RLB numbers were **not** used as verified primary calibration. Follow-up: licensed/public-access QS review of the actual Sydney table. |
| [ABS Producer Price Indexes](https://www.abs.gov.au/statistics/economy/price-indexes-and-inflation/producer-price-indexes-australia/jun-2026) | June quarter 2026, released 31 Jul 2026; latest on 9 Oct, next release 30 Oct | House construction output: Australia +2.0% quarter / +5.9% year, NSW +2.0% / +4.8%; other residential NSW +1.1% / +3.4%. | Trend context. Output price indexes are not site-specific dollar rates. Do not multiply the current BMT 2026 comparator by the annual growth again. |
| [Turner & Townsend GCMI 2026 ANZ](https://publications.turnerandtownsend.com/global-construction-market-intelligence-2026/australia-and-new-zealand) | 2026, accessed 9 Oct | Capacity constraints, labour/material competition, and diverging local procurement markets. Linked public Sydney trade data covers commercial job sizes. | Supports explicit risk range and local review. Commercial excavation/lift rates do not price a small residential duplex. No conversion of commercial lift or bulk excavation into a residential lump sum. |
| [Cotality public Cordell CCCI](https://www.cotality.com/au/press-releases/construction-costs-rebound-to-steady-growth) | Released 22 Jul 2026, June-quarter reference | National +1.0% quarter / +2.8% year; NSW +1.1% quarter. | Public index context only. No access to licensed Cordell estimator line items and none reproduced. Its index scope differs from ABS output price index; they are not added together. |
| [Rawlinsons Handbook 2026](https://www.rawlhouse.com.au/publications/2026-australian-construction-handbook) | 2026 Edition 44 | Publisher/product availability verified. | Licensed cost tables not accessible in this session. No rates attributed to Rawlinsons or proprietary scraping used. |
| [HIA Trades Report release](https://hia.com.au/our-industry/newsroom/economic-research-and-forecasting/2026/07/tradie-shortages-remain-entrenched-despite-housing-market-uncertainty) | 28 Jul 2026, June-quarter reference | Trades availability index -0.59, Sydney -0.51; national trades prices increased 5.1% in first half 2026. | Labour risk context, not a published duplex $/m² rate. |

## Working assumptions

Only a two-dwelling Sydney duplex is calibrated. `NSW` retains legacy compatibility but represents a **Sydney reference**, not a statewide regional index. Northern Beaches, Greater Sydney, North Shore, Eastern Suburbs, Inner West and Western Sydney share the Sydney reference with factor 1; their property prices do not uplift construction. Other locations or project types return review unless an explicit user/QS delivered custom rate is supplied. Land price, sale price and suburb prestige never multiply costs or select luxury finishes.

Base hard rates ex GST, per above-ground constructed m²: volume-builder $2,300 / $2,700 / $3,200; standard custom (`standard` / `custom`) $3,100 / $3,550 / $4,100; premium $3,700 / $4,400 / $5,200; prestige architectural $4,000 / $5,000 / $6,200; luxury development (`luxury` / `luxury-development`) $4,800 / $6,100 / $8,000. Volume assumes repeatable shelf design and basic finish; prestige is an explicit design/spec class, never inferred from postcode. These independently chosen low/mid/high **working scenario assumptions** are informed by the BMT comparators. They are not confidence percentiles and mid is not mechanically the mean of endpoints. Builder preliminaries, overhead and profit are included once. Premium assumes quality modern finishes; luxury assumes bespoke joinery, higher fixture/façade specification and larger design uncertainty.

- 2 levels: 2 above ground, no basement; ordinary stairs, no lift.
- 3 levels with basement: 1 basement + 2 above ground; ordinary stairs, lift only if explicitly selected.
- 4 levels with basement: 1 basement + 3 above ground; structural/scaffolding/vertical-services allowance $200 / $350 / $600 per above-ground m², plus one residential lift per dwelling by default ($45,000 / $65,000 / $90,000 each ex GST). Lift count can explicitly be 0–2. These are model assumptions, not requirements or published lift tariffs.

Basement garage shell working rates: $2,600 / $3,400 / $4,600 per basement m² ex GST. Include ordinary excavation/spoil, support/shoring, concrete shell, drainage/waterproofing and garage finish. Exceptional rock, groundwater, contamination and neighbouring support are excluded and require geotechnical/builder pricing. No basement rate is charged on the above-ground floor area and no second generic basement multiplier is added.

**Area basis:** input is total constructed floor area across both dwellings, including basement, garage and covered areas. In the absence of a measured basement split, equal floor plates are assumed: basement = total area / total levels. This is conspicuously returned as an assumption. A fixed 440 m² basement scheme replaces some premium habitable area with lower-finish garage area, so it may cost less than a 440 m² scheme with all area above ground. To compare equal habitable area, keep above-ground area unchanged and add the basement; the model then increases cost. Floor count does not invent extra area.

Project-wide ex GST ordinary external works $40k / $70k / $110k; unconfirmed ground allowance $0 / $25k / $80k; access/logistics $0 / $15k / $45k. All are explicit and separate from the building/basement shell. The ground allowance covers ordinary uncertainty, not a purported rock/water solution. Low scenarios assume uncomplicated conditions, not knowledge that site risks are absent. Allowance overrides require ordered low/mid/high arrays. No generic hard-site multiplier duplicates those lines.

Design/consultants = 7% / 9% / 12% of hard works. Gross approvals/reports $12k / $20k / $35k; statutory/report split still needs verification. Construction contingency = 7% / 10% / 15% of hard works once, excluding fees, land, finance and GST. GST 10% is added once to hard works, consultants and contingency; approvals are already a gross allowance. All component values round once to dollars then sum exactly. Estimated GST treatment is a budgeting convention; net development GST/tax requires accountant input.

Demolition, land, authority contributions, major services upgrades, pool, loose furnishings, exceptional conditions, finance/holding/selling/marketing/legal and project GST/tax adjustment remain excluded from delivered cost. Feasibility adds allowed excluded lines only; it cannot add consultant, approval, external or contingency amounts already in delivery. A custom delivered rate is a single explicit user/QS line, so the model does not invent a component breakdown.

## Old versus revised QA

Every legacy configuration/specification below uses the same generic 440 total constructed m² / two-dwelling reference, no address-specific override. Values include the delivered model allowances and construction GST, exclude land and commercial costs. The old model was a flat delivered rate with an invented percentage breakdown; the revised breakdown is the actual arithmetic used.
| Finish | Configuration (total levels) | Old low / mid / high | Revised low / mid / high | Revised mid / m² |
|---|---|---|---|---|
| standard | 2 levels — 2 above ground, no basement | $2,112,000 / $2,464,000 / $2,860,000 | $1,772,616 / $2,208,648 / $2,883,483 | $5,020 |
| standard | 3 levels — basement + 2 above ground | $2,464,000 / $2,992,000 / $3,652,000 | $1,680,656 / $2,179,850 / $2,985,930 | $4,954 |
| standard | 4 levels — basement + 3 above ground | $2,552,000 / $3,124,000 / $3,828,000 | $1,899,270 / $2,508,409 / $3,488,384 | $5,701 |
| premium | 2 levels — 2 above ground, no basement | $2,640,000 / $2,992,000 / $3,520,000 | $2,103,672 / $2,698,214 / $3,559,631 | $6,132 |
| premium | 3 levels — basement + 2 above ground | $2,992,000 / $3,520,000 / $4,312,000 | $1,901,360 / $2,506,228 / $3,436,695 | $5,696 |
| premium | 4 levels — basement + 3 above ground | $3,080,000 / $3,652,000 / $4,488,000 | $2,147,562 / $2,875,584 / $3,995,495 | $6,535 |
| luxury | 2 levels — 2 above ground, no basement | $4,048,000 / $4,620,000 / $5,192,000 | $2,710,608 / $3,677,346 / $5,280,735 | $8,358 |
| luxury | 3 levels — basement + 2 above ground | $4,400,000 / $5,148,000 / $5,984,000 | $2,305,983 / $3,158,982 / $4,584,098 | $7,180 |
| luxury | 4 levels — basement + 3 above ground | $4,488,000 / $5,280,000 / $6,160,000 | $2,602,764 / $3,609,933 / $5,286,323 | $8,204 |
106 Delmar Parade screenshot diagnostic: $5.148m / 440 = $11,700/m². That precisely matches the old **luxury** + basement midpoint ($10,500 + $1,200), rather than premium ($6,800 + $1,200 = $8,000). This numerical match suggests a possible specification-label or saved-state mismatch, but the screenshot's exact running version and internal state are unknown; it does not establish the cause. The screenshot low $4.4m/high $5.984m also match old luxury basement bands $10,000/$13,600. Revised premium basement working estimate is $1,901,360 / $2,506,228 / $3,436,695; it assumes ~146.7 m² basement within total 440. No local land prestige inference or address hardcode is used. Measured habitable/basement areas, lift choice, ground, access and finish schedule can materially change it.

## Verification

`node qa/cost-recalibration.cjs` was run before implementation and failed on absence of actual components; after implementation it passes. It checks each configuration and finish, actual component sum, GST once, separate hard-versus-delivered values, area conservation, above-ground level count, distinct 4-level structure/lifts, excluded-cost double counting, no land prestige multiplier, unknown site flags, review on invalid inputs/other typologies, and explicit custom-rate treatment. `qa/commercial-regression.cjs` cost tests and `qa/intake-component-regression.cjs` component reconciliation also pass. Finite/specified band arithmetic does not establish market accuracy; production calibration still needs QS review and real tender evidence.

## Additional specification classes (440 m²)

| Explicit specification | Configuration | Low / mid / high |
|---|---|---|
| volume | 2 levels — 2 above ground, no basement | $1,331,208 / $1,719,082 / $2,330,271 |
| volume | 3 levels — basement + 2 above ground | $1,386,384 / $1,853,473 / $2,617,122 |
| volume | 4 levels — basement + 3 above ground | $1,568,214 / $2,141,235 / $3,073,475 |
| custom | 2 levels — 2 above ground, no basement | $1,772,616 / $2,208,648 / $2,883,483 |
| custom | 3 levels — basement + 2 above ground | $1,680,656 / $2,179,850 / $2,985,930 |
| custom | 4 levels — basement + 3 above ground | $1,899,270 / $2,508,409 / $3,488,384 |
| prestige | 2 levels — 2 above ground, no basement | $2,269,200 / $3,043,790 / $4,174,311 |
| prestige | 3 levels — basement + 2 above ground | $2,011,712 / $2,736,612 / $3,846,482 |
| prestige | 4 levels — basement + 3 above ground | $2,271,708 / $3,134,766 / $4,456,505 |
| luxury-development | 2 levels — 2 above ground, no basement | $2,710,608 / $3,677,346 / $5,280,735 |
| luxury-development | 3 levels — basement + 2 above ground | $2,305,983 / $3,158,982 / $4,584,098 |
| luxury-development | 4 levels — basement + 3 above ground | $2,602,764 / $3,609,933 / $5,286,323 |

New classes have no old selectable equivalent; no fictitious old rate is imputed. Legacy standard and luxury map to standard custom and luxury development respectively.

## Delivered-cost component reconciliation (premium, midpoint)

All values below apply to the generic 440 m²/two-dwelling calibration case. Site, ground and access allowances are editable separately under building/site assumptions; overrides replace the existing lines.

| Component | 2 levels | 3 levels with basement | 4 levels with basement |
|---|---:|---:|---:|
| Above-ground building | $1,936,000 | $1,290,667 | $1,452,000 |
| Additional structural complexity | $0 | $0 | $115,500 |
| Basement excavation and shell | $0 | $498,667 | $374,000 |
| Residential lift allowance | $0 | $0 | $130,000 |
| External works and ordinary connections | $70,000 | $70,000 | $70,000 |
| Unconfirmed ordinary ground allowance | $25,000 | $25,000 | $25,000 |
| Access and logistics allowance | $15,000 | $15,000 | $15,000 |
| Design and consultants | $184,140 | $170,940 | $196,335 |
| Approvals and reports | $20,000 | $20,000 | $20,000 |
| Construction contingency | $204,600 | $189,933 | $218,150 |
| GST allowance | $243,474 | $226,021 | $259,599 |
| **Delivered total** | $2,698,214 | $2,506,228 | $2,875,584 |
