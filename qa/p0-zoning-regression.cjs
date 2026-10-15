'use strict';
// Public behavior fixtures. Planar expected areas independently checked with GEOS.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),Z=require('../zoning-evidence'),G=require('../property-evidence');
const rect=(x,y,w,h)=>[[x,y],[x+w,y],[x+w,y+h],[x,y+h],[x,y]],geom=(rs,wkid=28356)=>({rings:rs,spatialReference:{wkid}}),parcel=geom([rect(0,0,10,10)]),row=(g,code='R1',instrument='Synthetic LEP')=>({attributes:{SYM_CODE:code,EPI_NAME:instrument},geometry:g});
const browser={PropertyEvidence:G};vm.createContext(browser);vm.runInContext(fs.readFileSync(require.resolve('../zoning-evidence'),'utf8'),browser);
const cases=[
 ['complete',parcel,[row(parcel)],'single-zone',100,0],
 ['overlap-hides-gap',parcel,[row(geom([rect(0,0,6,10)])),row(geom([rect(4,0,4,10)]))],'geometry-unresolved',80,20],
 ['exact-duplicates-retain-review',parcel,[row(parcel),row(parcel)],'geometry-unresolved',100,0],
 ['split',parcel,[row(geom([rect(0,0,5,10)])),row(geom([rect(5,0,5,10)]),'R2')],'split-zone',100,0],
 ['parcel-hole',geom([rect(0,0,10,10),rect(3,3,4,4)]),[row(parcel)],'single-zone',84,0],
 ['adjacent',parcel,[row(parcel),row(geom([rect(10,0,5,10)]),'RE1')],'single-zone',100,0],
 ['minor-sliver',parcel,[row(geom([rect(0,0,9.9,10)])),row(geom([rect(9.9,0,.1,10)]),'RE1')],'boundary-review',100,0],
 ['invalid-zone',parcel,[row(geom([[[0,0],[10,10],[0,10],[10,0],[0,0]]]))],'geometry-unresolved'],
 ['invalid-parcel',geom([[[0,0],[10,10],[0,10],[10,0],[0,0]]]),[row(parcel)],'geometry-unresolved'],
 ['missing-crs',parcel,[row({rings:[rect(0,0,10,10)]})],'geometry-unresolved'],
 ['unsupported-zone-crs',parcel,[row(geom([rect(0,0,10,10)],999999))],'geometry-unresolved'],
 ['mismatched-crs',parcel,[row(geom([rect(0,0,10,10)],7856))],'geometry-unresolved'],
 ['multipart', {type:'MultiPolygon',coordinates:[[rect(0,0,4,10)],[rect(6,0,4,10)]],spatialReference:{wkid:28356}},[row(parcel)],'single-zone',80,0],
 ['concave',geom([[[0,0],[10,0],[10,4],[4,4],[4,10],[0,10],[0,0]]]),[row(parcel)],'single-zone',64,0],
 ['different-instrument-overlap',parcel,[row(parcel),row(parcel,'R1','Other LEP')],'geometry-unresolved',100,0],
 ['cross-zone-overlap-hides-gap',parcel,[row(geom([rect(0,0,6,10)])),row(geom([rect(4,0,4,10)]),'R2')],'geometry-unresolved',80,20],
 ['self-touching-zone',parcel,[row(geom([[[0,0],[10,0],[10,10],[5,5],[0,10],[5,5],[0,0]]]))],'geometry-unresolved'],
 ['crossing-feature-boundaries',parcel,[row(geom([[[0,0],[10,0],[0,10],[0,0]]])),row(geom([[[0,0],[10,10],[10,0],[0,0]]]))],'geometry-unresolved',75,25],
 ['minor-uncovered-gap',parcel,[row(geom([rect(0,0,9.9,10)]))],'boundary-review',99,1],
 ['zone-hole-gap',parcel,[row(geom([rect(0,0,10,10),rect(3,3,4,4)]))],'geometry-unresolved',84,16]
];
let failed=0;for(const[name,p,records,state,covered,gap]of cases){try{const input={parcelGeometry:p,records,source:'synthetic',checkedAt:'2026-10-14'},r=Z.resolve(input);assert.equal(r.state,state);if(covered!==undefined){assert.ok(Math.abs(r.coveredAreaSqm-covered)<1e-6,`covered ${r.coveredAreaSqm} != ${covered}`);assert.ok(Math.abs(r.uncoveredAreaSqm-gap)<1e-6,`gap ${r.uncoveredAreaSqm} != ${gap}`);}if(state!=='single-zone')assert.equal(r.requiresReview,true);assert.deepEqual(JSON.parse(JSON.stringify(browser.SitePivotZoning.resolve(input))),JSON.parse(JSON.stringify(r)),'browser/server exact result parity');assert.equal(r.zoneAreas.length,records.length);console.log('PASS',name);}catch(e){failed++;console.error('FAIL',name,e.message);}}
for(const queryComplete of [false]){const r=Z.resolve({parcelGeometry:parcel,records:[row(parcel)],queryComplete});assert.equal(r.state,'service-failure');assert.equal(r.requiresReview,true);console.log('PASS incomplete-query');}
// Geographic/WebMercator are ground-scaled together, never raw degree/metre sums.
for(const wkid of [4283,4326,7844,3857,102100,102113,7856]){const p=wkid<10000&&[4283,4326,7844].includes(wkid)?geom([rect(151,-34,.0001,.0001)],wkid):geom([rect(0,0,10,10)],wkid),r=Z.resolve({parcelGeometry:p,records:[row(p)]});try{assert.equal(r.state,'single-zone');assert.ok(Math.abs(r.coveredAreaSqm-r.parcelAreaSqm)<1e-6);console.log('PASS supported-crs',wkid);}catch(e){failed++;console.error('FAIL supported-crs',wkid,e.message);}}
for(const records of [null,{},[null]]){try{const r=Z.resolve({parcelGeometry:parcel,records});assert.equal(r.requiresReview,true);assert.notEqual(r.state,'single-zone');console.log('PASS malformed-records');}catch(e){failed++;console.error('FAIL malformed-records',e.message);}}
if(failed)process.exitCode=1;console.log(`P0 zoning: ${failed} failed`);
