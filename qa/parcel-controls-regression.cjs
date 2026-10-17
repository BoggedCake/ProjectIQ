'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const F=require('../fsr-evidence'),Z=require('../zoning-evidence'),G=require('../property-evidence'),E=require('../commercial-engine');
const sr={wkid:28356},rect=(x0,y0,x1,y1)=>({rings:[[[x0,y0],[x1,y0],[x1,y1],[x0,y1],[x0,y0]]],spatialReference:sr}),parcel=rect(0,0,20,35);
const feature=(value,geometry,extra={})=>({attributes:{OBJECTID:value===.45?1:2,FSR:value,EPI_NAME:'Synthetic LEP',LEGIS_REF_CLAUSE:'Clause 4.4',...extra},geometry});
const resolve=(records,changes={})=>F.resolve({records,parcelGeometry:parcel,parcelResolved:true,queryComplete:true,source:'official-test',checkedAt:new Date().toISOString(),...changes});
test('current official New Street parcel has0.45FSR; adjoining1FSR is retained as negligible measured contact',()=>{
 const c=require('./fixtures/parcel-controls/new-street-west.json'),j=c.parcel.response,p={...j.features[0].geometry,spatialReference:j.spatialReference};
 assert.equal(j.features[0].attributes.cadid,102197818);assert.equal(j.features[0].attributes.lotidstring,'15/B/DP2044');
 const rows=c.fsr.response.features.map(f=>({...f,geometry:{...f.geometry,spatialReference:c.fsr.response.spatialReference}}));
 const r=resolve(rows,{parcelGeometry:p,instrument:'Manly Local Environmental Plan 2013',source:c.fsr.url,checkedAt:c.fsr.checkedAt});
 assert.equal(r.value,'0.45:1');assert.equal(r.state,'mapped');assert.equal(r.spatiallyVerified,true);
 assert.ok(Math.abs(r.parcelAreaSqm-700.740446)<.001);assert.equal(r.records.length,2);
 const neighbour=r.controlAreas.find(x=>x.attributes.OBJECTID===163847);assert.ok(neighbour.areaSqm>0&&neighbour.areaSqm<.01);assert.equal(neighbour.classification,'negligible-contact');assert.ok(neighbour.geometry);assert.ok(neighbour.attributes.CURRENCY_DATE);
 assert.equal(r.applicableRecords.length,1);assert.equal(r.applicableRecords[0].OBJECTID,163928);
});
test('true splitFSR has measured separate areas, no joined numeric entitlement or automatic GFA',()=>{
 const r=resolve([feature(.45,rect(0,0,10,35)),feature(1,rect(10,0,20,35))]);
 assert.equal(r.state,'multiple');assert.equal(r.value,null);assert.equal(r.requiresReview,true);assert.equal(r.controlGroups.length,2);
 assert.deepEqual(r.controlGroups.map(x=>x.areaSqm),[350,350]);
 assert.equal(E.developmentAreaModel({siteArea:700,fsrEvidence:r,configuration:'two-storey',areaSource:'starter'}).statutoryGfaCapacity,null);
});
test('adjacent boundary is retained; uncertain gap and overlapping contradictory controls fail closed',()=>{
 let r=resolve([feature(.45,parcel),feature(1,rect(20,0,40,35))]);assert.equal(r.value,'0.45:1');assert.equal(r.controlAreas[1].classification,'adjacent');
 for(const rows of [[feature(.45,rect(0,0,19.999,35))],[feature(.45,parcel),feature(1,rect(10,0,30,35))]]){r=resolve(rows);assert.equal(r.value,null);assert.equal(r.requiresReview,true);assert.ok(r.uncoveredAreaSqm>0||r.crossControlOverlapAreaSqm>0);}
});
test('tiny contact cannot hide a different instrument, a statutory modification or a significant narrow strip',()=>{
 for(const rows of [[feature(.45,rect(0,0,19.999999,35)),feature(1,rect(19.999999,0,30,35),{EPI_NAME:'Other LEP'})],[feature(.45,parcel,{LEGIS_REF_AREA:'Area A'})],[feature(.45,rect(0,0,19.99,35)),feature(1,rect(19.99,0,30,35))]]){const r=resolve(rows);assert.equal(r.value,null);assert.equal(r.requiresReview,true);}
});
test('same-control duplicate union never doubles capacity; raw duplicate audit survives',()=>{
 const r=resolve([feature(.45,parcel),feature(.45,parcel,{OBJECTID:3})]);assert.equal(r.value,'0.45:1');assert.equal(r.coveredAreaSqm,700);assert.equal(r.records.length,2);assert.equal(r.sameControlOverlapAreaSqm,700);
});
test('missing geometry, point-only or incomplete response never establishes a parcel control',()=>{
 for(const c of [{records:[feature(.45,null)]},{parcelGeometry:null},{queryComplete:false},{error:'timeout'}]){const r=resolve([feature(.45,parcel)],c);assert.equal(r.value,null);assert.equal(r.requiresReview,true);}
});
test('height and minimumlot resolve with the same measured-control rules and unit normalization',()=>{
 const base={parcelGeometry:parcel,parcelResolved:true,queryComplete:true};
 const height=F.resolveControl('height',{...base,records:[feature(.45,parcel,{MAX_B_H:8.5,UNITS:'m'})]});assert.equal(height.value,'8.5 m');
 const lot=F.resolveControl('lot',{...base,records:[feature(.45,parcel,{LOT_SIZE:.07,UNITS:'ha',LEGIS_REF_CLAUSE:'Clause 4.1'})]});assert.equal(lot.value,'700 m²');
});
test('holes and multipart controls retain measured union; invalid topology is not repaired',()=>{
 const hole={...parcel,rings:[...parcel.rings,...rect(5,5,10,10).rings]};let r=resolve([feature(.45,hole)]);assert.equal(r.value,null);assert.equal(r.uncoveredAreaSqm,25);
 const multi={...parcel,rings:[...rect(0,0,10,35).rings,...rect(10,0,20,35).rings]};r=resolve([feature(.45,multi)]);assert.equal(r.value,'0.45:1');
 const bow={...parcel,rings:[[[0,0],[20,35],[0,35],[20,0],[0,0]]]};assert.equal(resolve([feature(.45,bow)]).value,null);
});
test('compatible same-datum CRS conversion preserves geometry; unsupported datum assumptions stay unresolved',()=>{
 const geographic={rings:[[[151,-33],[151.0002,-33],[151.0002,-33.0003],[151,-33.0003],[151,-33]]],spatialReference:{wkid:4283}};
 const projected=G.transformGeometry(geographic,28356);assert.ok(projected);
 const roundtrip=G.transformGeometry(projected,4283);assert.ok(Math.abs(roundtrip.rings[0][0][0]-151)<1e-7);assert.ok(Math.abs(roundtrip.rings[0][0][1]+33)<1e-7);
 const r=resolve([feature(.45,projected)],{parcelGeometry:geographic});assert.equal(r.value,'0.45:1');assert.ok(r.provenance.crsTransforms.length);
 assert.equal(G.transformGeometry(geographic,7844),null,'GDA94 to GDA2020 requires an explicit authoritative datum transformation');
});
test('microscopic source boundary uncertainty is retained without becoming a material conflict or extra capacity',()=>{
 const c=require('./fixtures/zoning-evidence/nield.json'),j=c.parcel.response,p={...j.features[0].geometry,spatialReference:j.spatialReference},rows=c.fsr.response.features.map(r=>({...r,geometry:{...r.geometry,spatialReference:c.fsr.response.spatialReference}}));
 const input={records:rows,parcelGeometry:p,parcelResolved:true,queryComplete:true};
 const r=F.resolve(input);assert.equal(r.value,'0.5:1');assert.equal(r.mappingUncertainty,true);assert.ok(r.uncoveredAreaSqm>0&&r.uncoveredAreaSqm<.001);assert.ok(r.capacityAreaFraction<1);assert.ok(r.provenance.precisionPolicy);
 assert.equal(F.resolve({...input,contactToleranceSqm:0}).value,null,'threshold can be tightened for stricter review');
});
test('known zoning instrument conflicts quarantine quantitative controls and subdivision proof',()=>{
 const P=require('../planning-intelligence');for(const kind of ['fsr','height','lot']){
 const r=F.resolveControl(kind,{records:[feature(.45,parcel,{EPI_NAME:'Neighbour Local Environmental Plan 2020',LEGIS_REF_CLAUSE:'4.1',LOT_SIZE:300,MAX_B_H:8.5,UNITS:kind==='lot'?'m²':'m'})],parcelGeometry:parcel,parcelResolved:true,queryComplete:true,instrument:'Subject Local Environmental Plan 2013'});
 assert.equal(r.value,null);assert.equal(r.state,'conflict');assert.equal(P.mappedSubdivision({instrument:'Subject Local Environmental Plan 2013',lotEvidence:r}),null);}
});
test('independent adjoining commercial parcel keeps its own1FSR, never transferred to the residential subject',()=>{
 const c=require('./fixtures/parcel-controls/adjoining-commercial.json'),j=c.parcel.response,p={...j.features[0].geometry,spatialReference:j.spatialReference};
 assert.equal(j.features[0].attributes.cadid,102197812);assert.equal(c.neighbour.address,null);assert.ok(c.analysis.sharedCadastralBoundaryMetres>15);
 const r=resolve(c.fsr.response.features.map(f=>({...f,geometry:{...f.geometry,spatialReference:c.fsr.response.spatialReference}})),{parcelGeometry:p});assert.equal(r.value,'1:1');assert.ok(r.controlAreas.some(x=>x.numericValue===.45&&x.classification==='negligible-contact'));
});
test('independent NSW projected response confirms microscopic Nield source mismatch across working frames',()=>{
 const c=require('./fixtures/parcel-controls/nield-precision.json'),j=c.parcel.response,p={...j.features[0].geometry,spatialReference:j.spatialReference},r=resolve(c.fsr.response.features.map(f=>({...f,geometry:{...f.geometry,spatialReference:c.fsr.response.spatialReference}})),{parcelGeometry:p});assert.equal(r.value,'0.5:1');assert.ok(r.uncoveredAreaSqm>.0005&&r.uncoveredAreaSqm<.0006);assert.equal(r.mappingUncertainty,true);
 // This is source-boundary uncertainty, not a licence to bridge a real gap.
 const near=resolve([feature(.45,rect(0,0,19.9999,35))]);assert.equal(near.value,'0.45:1');assert.ok(near.capacityAreaFraction<1);assert.equal(near.mappingUncertainty,true);
 const significant=resolve([feature(.45,rect(0,0,19.9997,35))]);assert.equal(significant.value,null);assert.ok(significant.uncoveredAreaSqm>significant.toleranceSqm);
});
test('real server and direct-browser adapters carry known zoning instrument into every quantitative resolver',async()=>{
 const {loadApi,transport}=require('./property-performance.cjs'),fs=require('node:fs'),vm=require('node:vm'),G=require('../property-evidence'),R=require('../response-evidence'),P=require('../planning-intelligence');
 for(const kind of ['fsr','height','lot']){
 const t=transport({delay:false,overrides:{[kind]:({payload})=>({...payload,features:payload.features.map(f=>({...f,attributes:{...f.attributes,EPI_NAME:'Conflicting Local Environmental Plan 2020'}}))})}}),api=loadApi(t.fetch),identity=await api.resolveProperty({text:t.text}),server=await api.planningFor(identity.property);
 assert.equal(server.planning[kind==='fsr'?'fsrEvidence':kind==='lot'?'lotEvidence':'heightEvidence'].state,'conflict');
 const page=fs.readFileSync('index.html','utf8'),box={F,Z,G,P,SitePivotResponse:R,LIVE:{...api.UPSTREAM},LIVE_LAYER:api.LAYER,spatialCache:new Map(),attrs:r=>r.attributes||{},uniq:a=>[...new Set(a.filter(v=>v!=null&&v!==''))],sameLga:()=>true,firstVal:(a,keys)=>keys.map(k=>a[k]).find(v=>v!=null),arcJSON:async(url,q)=>{const r=await t.fetch(url,{body:new URLSearchParams(q).toString()});return r.json()}};
 vm.createContext(box);vm.runInContext(page.slice(page.indexOf('async function spatialLayer('),page.indexOf('function parseTitleFromLots(')),box);const c=require('./fixtures/zoning-evidence/nield.json'),j=c.parcel.response,browser=await box.pullPlanning(identity.property.point,{geometry:{...j.features[0].geometry,spatialReference:j.spatialReference}},identity.property.lga);
 assert.equal(browser[kind==='fsr'?'fsrEvidence':kind==='lot'?'lotEvidence':'heightEvidence'].state,'conflict');
 }
});
test('residential boundaries retain E1/E2/MU1 and legacy business zones without borrowing neighbouring quantitative rights',()=>{
 for(const code of ['E1','E2','MU1','B1','B2','B4']){
 const zone=(code,g)=>({attributes:{SYM_CODE:code,EPI_NAME:'Synthetic LEP'},geometry:g});
 const contact=Z.resolve({parcelGeometry:parcel,records:[zone('R2',rect(0,0,19.99999,35)),zone(code,rect(19.99999,0,30,35))]});assert.equal(contact.primaryZone.code,'R2');assert.equal(contact.state,'boundary-review');assert.equal(contact.requiresReview,true);assert.ok(contact.zoneAreas.some(r=>r.code===code&&r.areaSqm>0));
 const split=Z.resolve({parcelGeometry:parcel,records:[zone('R2',rect(0,0,10,35)),zone(code,rect(10,0,30,35))]});assert.equal(split.state,'split-zone');assert.equal(split.footprintRequired,true);
 }
});
test('missing requested quantitative geometry cannot poison a subsequent server retry',async()=>{
 const {loadApi,transport}=require('./property-performance.cjs');let count=0;const t=transport({delay:false,overrides:{fsr:({payload})=>{if(++count===1)for(const f of payload.features)delete f.geometry;return payload}}}),api=loadApi(t.fetch),p=(await api.resolveProperty({text:t.text})).property;
 const first=await api.planningFor(p);assert.equal(first.planning.fsr,null);const retry=await api.planningFor(p);assert.equal(retry.planning.fsr,'0.5:1');assert.equal(count,2);
});
