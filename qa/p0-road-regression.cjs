'use strict';
const assert=require('node:assert/strict'),R=require('../response-evidence'),G=require('../property-evidence');
const capture=require('./fixtures/property-evidence/nield-roads-2026-10-15.json'),parcel=require('./fixtures/zoning-evidence/nield.json').parcel.response;
const rows=R.requireComplete(capture.response,R.queryOptions(capture.source,100));
assert.ok(rows.some(f=>f.attributes.roadnamelabel===null),'Captured authoritative unnamed corridors retained');
const geometry={...parcel.features[0].geometry,spatialReference:parcel.spatialReference};
const frontage=G.frontage(geometry,rows.map(f=>({id:String(f.attributes.cadid),name:f.attributes.roadnamelabel||'',geometry:{...f.geometry,spatialReference:capture.response.spatialReference}})),'NIELD');
assert.equal(frontage.status,'indicative');assert.match(frontage.primary.road,/NIELD/);assert.ok(Math.abs(frontage.primary.metres-15.9)<.2,JSON.stringify(frontage));
for(const value of [undefined,{},false,1]){const j=structuredClone(capture.response);if(value===undefined)delete j.features[0].attributes.roadnamelabel;else j.features[0].attributes.roadnamelabel=value;assert.equal(R.validate(j,R.queryOptions(capture.source,100)).complete,false)}
for(const flag of ['exceededTransferLimit','hasMore']){const j=structuredClone(capture.response);j[flag]=true;assert.equal(R.validate(j,R.queryOptions(capture.source,100)).complete,false)}
console.log('PASS captured Nield nullable road schema preserves 15.9m indicative frontage without accepting malformed or incomplete collections');
