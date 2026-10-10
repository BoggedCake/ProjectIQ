'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const file=require.resolve('../fsr-evidence');
const F=require(file),source='https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/EPI_Primary_Planning_Layers/MapServer/1';
const common={parcelResolved:true,queryComplete:true,source,checkedAt:'2026-10-10T00:00:00Z'};
const resolve=o=>F.resolve({...common,...o});
// Attribute excerpts retrieved from official layer 1 on 10 October 2026.
const fixtures=[
 ['Northern Beaches',163653,'Manly Local Environmental Plan 2013','NORTHERN BEACHES',1,'1-1.09'],
 ['Central Coast',268767,'Central Coast Local Environmental Plan 2022','CENTRAL COAST',2,'2-2.49'],
 ['Sydney metro',637,'North Sydney Local Environmental Plan 2013','NORTH SYDNEY',1,'1-1.09'],
 ['Greater Sydney',221028,'Parramatta Local Environmental Plan 2023','CITY OF PARRAMATTA',2,'2-2.49'],
 ['Regional',2307,'Orange Local Environmental Plan 2011','ORANGE',1.5,'1.5-1.99']
];
for(const [region,OBJECTID,EPI_NAME,LGA_NAME,FSR,LAY_CLASS] of fixtures){const r=resolve({records:[{attributes:{OBJECTID,EPI_NAME,LGA_NAME,FSR,LAY_CLASS,LEGIS_REF_CLAUSE:'Clause 4.4'}}]});assert.equal(r.state,'mapped',region);assert.equal(r.value,FSR+':1');assert.equal(r.provenance.instrument,EPI_NAME);assert.equal(r.provenance.clause,'Clause 4.4')}
for(const name of ['manly','central-coast','north-sydney','parramatta','orange']){
 const fixture=require('./fixtures/fsr-evidence/'+name+'.json');assert.ok(fixture.response.features.length);assert.notEqual(fixture.response.exceededTransferLimit,true);
 assert.equal(F.resolve({...common,records:fixture.response.features,checkedAt:fixture.retrievedAt,source:fixture.source}).state,'mapped');
}
const eileenParcel=require('./fixtures/fsr-evidence/eileen-parcel.json'),eileenFsr=require('./fixtures/fsr-evidence/eileen-fsr.json');
assert.equal(eileenParcel.response.features[0].attributes.lotidstring,'61//DP11915');
const G=require('../property-evidence');const area=G.geometryArea({...eileenParcel.response.features[0].geometry,spatialReference:eileenParcel.response.spatialReference});assert.ok(Math.abs(area.areaSqm-471.3665)<.1);assert.equal(area.status,'indicative');
assert.equal(F.resolve({...common,records:eileenFsr.response.features,source:eileenFsr.source,checkedAt:eileenFsr.retrievedAt,instrument:'Warringah Local Environmental Plan 2011'}).state,'unmapped');
assert.equal(resolve({records:[]}).state,'unmapped');
assert.equal(resolve({records:[],error:'HTTP 503'}).state,'service-failure');
assert.equal(resolve({records:[],queryComplete:false}).state,'service-failure');
assert.equal(resolve({records:[],parcelResolved:false}).state,'parcel-unresolved');
assert.equal(resolve({records:[{FSR:.5},{FSR:.6}]}).state,'multiple');
assert.equal(resolve({records:[{FSR:.5},{FSR:.5}]}).state,'mapped');
assert.equal(resolve({records:[{FSR:.5}],modified:true,modificationReason:'Site-specific provision'}).state,'modified');
assert.equal(resolve({records:[{FSR:null,LAY_CLASS:'0.5-0.54'}]}).state,'modified');
assert.equal(resolve({records:[{FSR:0}]}).value,'0:1');
assert.equal(resolve({records:[{FSR:-9999,LAY_CLASS:'D'}]}).value,null);
assert.equal(resolve({records:[],error:'error',stateOverride:'unmapped'}).state,'service-failure');
assert.equal(resolve({records:[],parcelResolved:false,stateOverride:'unmapped'}).state,'parcel-unresolved');
assert.equal(F.resolve({records:[]}).state,'parcel-unresolved');
const browser={};vm.runInNewContext(fs.readFileSync(file,'utf8'),browser);assert.equal(browser.SitePivotFSR.resolve({...common,records:[{FSR:.5}]}).value,'0.5:1');
console.log('PASS residential FSR evidence states, official regional attribute fixtures and browser/CommonJS contract');
(async()=>{
 const prior=global.fetch,api=require('../api/_lib/sitepivot');
 try{
  for(const scenario of ['legacy','empty','truncated','arcgis-error','malformed','parcel-unresolved']){
   const cadid=70000+['legacy','empty','truncated','arcgis-error','malformed','parcel-unresolved'].indexOf(scenario);
   global.fetch=async(url,options)=>{
    const u=String(url);let body={features:[]};
    if(u.includes('/FeatureServer/8/query'))body=scenario==='parcel-unresolved'?{features:[]}:{features:[{attributes:{cadid,lotnumber:'1',planlabel:'DP1'},geometry:{rings:[[[151+cadid/1e6,-33],[151.001+cadid/1e6,-33],[151.001+cadid/1e6,-33.001],[151+cadid/1e6,-33.001],[151+cadid/1e6,-33]]]}}]};
    if(u.includes('/EPI_Primary_Planning_Layers/MapServer/1/query')){
     assert.equal(new URLSearchParams(options.body).get('where'),'1=1');
     body=scenario==='arcgis-error'?{error:{code:400,message:'Invalid query'}}:scenario==='malformed'?{}:scenario==='empty'?{features:[]}:{features:[{attributes:{FSR:.5,EPI_NAME:'Manly Local Environmental Plan 2013',LGA_NAME:'MANLY',LEGIS_REF_CLAUSE:'Clause 4.4'}}],exceededTransferLimit:scenario==='truncated'};
    }
    return {ok:true,json:async()=>body};
   };
   const result=await api.planningFor({point:{x:151+cadid*.00000001,y:-33},cadid,lga:'NORTHERN BEACHES',lot:'1',dp:'DP1'});
   assert.equal(result.planning.fsrEvidence.state,{legacy:'mapped',empty:'unmapped',truncated:'service-failure','arcgis-error':'service-failure',malformed:'service-failure','parcel-unresolved':'parcel-unresolved'}[scenario],scenario);
   if(scenario==='legacy')assert.equal(result.planning.fsr,'0.5:1');
  }
  console.log('PASS server FSR spatial applicability, truncation, ArcGIS errors and unresolved parcel handling');
 }finally{global.fetch=prior}
})().catch(e=>{console.error(e);process.exitCode=1});

assert.equal(resolve({records:[{FSR:.6,EPI_NAME:'Manly Local Environmental Plan 2013'}],instrument:'Manly LEP / unrelated overlay policy'}).state,'mapped');
