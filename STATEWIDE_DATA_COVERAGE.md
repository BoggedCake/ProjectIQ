# SitePivot NSW planning and market evidence coverage

The prototype uses an evidence-registry architecture rather than claiming blanket NSW planning completeness.

## Statewide / reusable source families

| Input | Intended production source | Prototype state |
|---|---|---|
| Address / property / parcel identity | NSW authoritative address + cadastral services | Fixture adapter / Needs Review fallback |
| Zoning | NSW Planning Portal EPI spatial services | Fixture adapter |
| Floor space ratio | NSW Planning Portal EPI spatial services | Fixture adapter |
| Height of buildings | NSW Planning Portal EPI spatial services | Fixture adapter |
| Minimum lot size | NSW Planning Portal EPI spatial services | Fixture adapter |
| Heritage | NSW Planning Portal EPI spatial services | Fixture adapter |
| Flood | EPI + council flood studies / mapping | Fixture + review trigger |
| Bushfire prone land | NSW Government / council-certified mapping | Fixture + review trigger |
| Acid sulfate / biodiversity / wetlands / riparian / coastal / hazards | NSW spatial datasets + instruments | Fixture + source registry |
| SEPP applicability | NSW legislation + Planning Portal | Rule-adapter contract |
| Council DCP / local policy | Individual councils | Coverage matrix + Needs Review |
| DA history | NSW Online DA Data API | Adapter-ready |
| CDC history | NSW Planning Portal CDC data | Adapter-ready |
| Sold-property evidence | Licensed sales-data provider | Explicit test fixtures |
| Current competing listings | realestate.com.au connector | Available in ChatGPT environment; not callable by static browser |
| Construction rates | Future QS / licensed rate-card provider | Versioned prototype rates |

## Coverage principle

A NSW address can enter SitePivot even when some planning controls cannot yet be machine verified. Unsupported or unresolved controls must remain **Needs Review** or **Unavailable** rather than being replaced by permissive defaults.

Parcel-level production analysis should use full parcel geometry so split zoning and partial overlays are not reduced to a point/centroid result.

## Current fixture matrix

Northern Beaches, Sydney CBD strata, Western Sydney heritage, Newcastle flood, Wollongong, Central Coast, Blue Mountains bushfire, Orange, Wagga Wagga, Dubbo, Mudgee split-zone / multi-parcel, Kiama steep site and Broken Hill / remote-market states.
