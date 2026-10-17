'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadApi,transport,benchmark}=require('./property-performance.cjs');
const tick=()=>new Promise(r=>setImmediate(r));
test('complete NSW address resolves with strict official matching before geocoding',async()=>{
 const t=transport({delay:false}),api=loadApi(t.fetch);
 const result=await api.resolveProperty({text:t.text});
 assert.equal(result.property.addressId,t.address.attributes.ap_gurasid);
 assert.equal(t.calls.filter(c=>c.name==='geocode').length,0,'a complete official address must not wait for a redundant locator');
 assert.equal(t.calls.filter(c=>c.name==='identity').length,1);
});
test('fast lookup cannot confirm wrong, duplicate, truncated or missing-ID identities',async()=>{
 for(const mutate of [p=>{p.features[0].attributes.formattedaddress='3 WRONG ST MANLY NSW 2093';return p},p=>{p.features.push(structuredClone(p.features[0]));return p},p=>({...p,exceededTransferLimit:true}),p=>{delete p.features[0].attributes.objectid;delete p.features[0].attributes.ap_gurasid;return p}]){
  const t=transport({delay:false,overrides:{identity:({payload})=>mutate(payload)}}),api=loadApi(t.fetch);
  await assert.rejects(api.resolveProperty({text:t.text}),/identity|address|complete|identifier|ambiguous|truncated/i);
 }
});
test('empty direct match retains the geocoder-assisted authoritative fallback',async()=>{
 const t=transport({delay:false,overrides:{identity:({payload,row})=>row.query.geometry?payload:{features:[],exceededTransferLimit:false}}}),api=loadApi(t.fetch);
 assert.equal((await api.resolveProperty({text:t.text})).property.addressId,t.address.attributes.ap_gurasid);
 assert.equal(t.calls.filter(c=>c.name==='geocode').length,1);
});
test('incomplete or ambiguous direct evidence cannot be hidden by a narrower fallback',async()=>{
 for(const corrupt of [p=>({...p,exceededTransferLimit:true}),p=>({...p,features:[...p.features,{...p.features[0],attributes:{...p.features[0].attributes,objectid:999,ap_gurasid:999}}]})]){
  const t=transport({delay:false,overrides:{identity:({payload,row})=>row.query.geometry?payload:corrupt(payload)}}),api=loadApi(t.fetch);
  await assert.rejects(api.resolveProperty({text:t.text}),/ambiguous|truncated/i);
 }
});
test('parcel, core controls and frontage publish while supplementary evidence is pending',async()=>{
 let release;const held=new Promise(r=>release=r),seen=[];
 const t=transport({delay:false,overrides:{supplementary:async({payload})=>{await held;return payload}}}),api=loadApi(t.fetch);
 const r=await api.resolveProperty({text:t.text});
 const pending=api.planningFor(r.property,{onProgress:event=>seen.push(event)});
 try{
  for(let i=0;i<15;i++)await tick();
  assert.ok(seen.some(x=>x.phase==='parcel'&&x.parcel.area>0),'associated parcel and area publish without overlays');
  const core=seen.find(x=>x.phase==='core');assert.ok(core,'core controls publish before overlays');
  assert.equal(core.planning.loading,true);assert.equal(core.planning.coreReady,true);
  assert.equal(core.planning.sourceChecks.flood.status,'loading');
  assert.equal(core.planning.fsrEvidence.queryComplete,true);
  assert.ok(seen.some(x=>x.phase==='frontage'&&x.parcel.frontage.primary?.metres>0));
 }finally{release();await pending;}
 assert.equal(t.calls.filter(x=>x.name==='parcel').length,1,'progress never refetches the parcel');
 for(const name of ['fsr','zone','height','lot'])assert.equal(t.calls.filter(x=>x.name===name).length,1,'core is not refetched on completion');
});
test('council hazard retrieval overlaps coverage without claiming a mapped negative early',async()=>{
 const {councilEvidence}=require('../api/_lib/council');
 let release;const coverage=new Promise(r=>release=r),calls=[];
 const work=councilEvidence({lga:'Northern Beaches',point:{x:151,y:-33}},null,async(base,id)=>{calls.push(id);if(id===126){await coverage;return{features:[],exceededTransferLimit:false}}return{features:[],exceededTransferLimit:false}});
 try{await tick();assert.ok(calls.some(id=>id!==126),'independent hazards must start while coverage is pending');}finally{release();}
 const result=await work;assert.notEqual(result.flood.state,'council-mapping-clear');assert.equal(result.flood.coverage.status,'unconfirmed');
});
test('failed core retrieval stays unresolved in both partial and final evidence',async()=>{
 const t=transport({delay:false,overrides:{fsr:()=>({features:[],exceededTransferLimit:true})}}),api=loadApi(t.fetch),seen=[];
 const r=await api.resolveProperty({text:t.text}),out=await api.planningFor(r.property,{onProgress:e=>seen.push(e)});
 for(const planning of [seen.find(x=>x.phase==='core').planning,out.planning]){
  assert.equal(planning.fsrEvidence.queryComplete,false);assert.equal(planning.fsr,null);assert.ok(planning.failedKeys.includes('fsr'));assert.equal(planning.sourceChecks.fsr.checkedAt,null);
 }
});
test('final streamed and JSON FSR provenance agree when the LEP arrives from a supplementary layer',async()=>{
 const t=transport({delay:false,overrides:{zone:()=>({features:[],exceededTransferLimit:false}),fsr:()=>({features:[],exceededTransferLimit:false}),supplementary:({payload,row})=>row.endpoint.endsWith('EPI_Primary_Planning_Layers/MapServer/0/query')?{features:[{attributes:{LAY_CLASS:'Heritage',EPI_NAME:'Manly Local Environmental Plan 2013'}}],exceededTransferLimit:false}:payload}}),api=loadApi(t.fetch);
 const r=await api.resolveProperty({text:t.text}),json=await api.planningFor(r.property),streamed=await api.planningFor(r.property,{onProgress:()=>{}});
 assert.equal(streamed.planning.instrument,'Manly Local Environmental Plan 2013');
 assert.equal(streamed.planning.fsrEvidence.provenance.instrument,json.planning.fsrEvidence.provenance.instrument);
});
test('controlled cold initial summary stays under three seconds; warm requests reuse evidence',async()=>{
 const result=await benchmark();const [cold,warm]=result.runs;
 assert.ok(cold.ms.core<3000,JSON.stringify(cold));assert.ok(cold.ms.core<cold.ms.complete);
 assert.equal(warm.upstreamRequests,0);assert.equal(cold.frontage,15.9);assert.equal(cold.fsr,'0.5:1');assert.equal(cold.failed.length,0);
});
