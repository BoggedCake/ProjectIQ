# SitePivot live property data repair

Date: 6 October 2026  
Branch: `sitepivot-concept`

## Root cause

The original prototype coupled autocomplete and property enrichment to slow statewide ArcGIS queries and then attempted many NSW Planning Portal / hazard / DCP spatial requests directly from a GitHub Pages browser.

Deployed Chromium QA reproduced the failure. Fast geocoder requests succeed, but a number of NSW planning endpoints intermittently fail from the browser with cross-origin / ORB blocking or timeouts. The same provider logic succeeds when executed server-side.

Therefore GitHub Pages is suitable for the static prototype UI but is not a reliable production host for statewide planning enrichment by itself.

## Repaired architecture

1. Fast address suggestions: ArcGIS World Geocoder, NSW/Australia address category only.
2. Authoritative property identity after selection: NSW Address Point Formatted.
3. Exact-number/unit-aware ranking prevents nearby-address substitution.
4. LGA is returned from the authoritative NSW property record.
5. Lot/DP/cadastre: NSW Land Parcel Property Theme.
6. Planning: parcel-polygon queries to NSW Planning Portal EPI Primary Planning Layers, Protection, Hazard, Development Control and related spatial services.
7. DCP identity is resolved dynamically by the property's LGA.
8. Browser UI uses SitePivot API routes when deployed on a serverless-capable host; direct browser calls remain only as a static GitHub Pages fallback.

Server routes:
- `/api/address/suggest`
- `/api/property/resolve`
- `/api/planning/property`

## Measured QA

Server-side NSW regression suite passed.

Autocomplete:
- median: 31 ms
- slowest of the 11-address matrix: 177 ms
- target: < 3,000 ms

Deployed GitHub Pages browser:
- first useful Fairlight suggestion: 795 ms including UI debounce/render
- exact-number regression passed for 1 and 9 Waratah Street, Balgowlah
- identity matrix passed across Northern Beaches, Sydney, Newcastle, Wollongong, Central Coast, Orange, Wagga Wagga, Dubbo Regional and Blue Mountains

Northern Beaches regression:
- 57 GRIFFITHS ST, FAIRLIGHT NSW 2094
- LGA: NORTHERN BEACHES
- Lot 32 / DP1729
- parcel area calculated from cadastral geometry: ~416.31 m²
- planning instrument: Manly Local Environmental Plan 2013
- zone: R1 General Residential
- FSR: 0.6:1
- height: 8.5 m
- minimum lot size: 250 m²
- DCP: Manly Development Control Plan 2013

Server-side planning also passed for tested Newcastle and Wollongong properties.

## Remaining review states

The planning engine deliberately leaves a source as Needs Review when the upstream check fails or where SitePivot has identified a DCP but has not encoded its clause-level rule.

In current server QA, SEPP identify and local-identify supplementary calls timed out for the tested planning cases while the principal LEP/EPI, zone and DCP lookups succeeded. These supplementary source failures must not invalidate the whole Property Passport.

Detailed council flood studies also remain a separate coverage problem from statewide EPI flood mapping.

## Deployment status

All code required for the reliable architecture is committed to `sitepivot-concept`.

GitHub Pages cannot execute the serverless `/api/*` routes. To founder-test the full reliable NSW workflow, deploy this branch to a serverless-capable host. The repository contains `vercel.json` and Vercel-compatible API routes.

After deployment, the browser automatically uses the SitePivot server API because the hostname is no longer `github.io`.

Do not merge to `main` until founder testing is complete.
