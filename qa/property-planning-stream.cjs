'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {transport}=require('./property-performance.cjs'),{createServer}=require('./founder-server.cjs');
test('real planning route streams safe milestones and retains the legacy JSON contract',async()=>{
 let release;const held=new Promise(r=>release=r),t=transport({delay:false,overrides:{supplementary:async({payload})=>{await held;return payload}}});
 const realFetch=global.fetch,server=createServer();global.fetch=t.fetch;
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 try{
  const api=require('../api/_lib/sitepivot'),identity=await api.resolveProperty({text:t.text});
  const url='http://127.0.0.1:'+server.address().port+'/api/planning/property',request={method:'POST',headers:{'Content-Type':'application/json',Accept:'application/x-ndjson'},body:JSON.stringify(identity.property),signal:AbortSignal.timeout(3000)};
  const response=await realFetch(url,request);assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/application\/x-ndjson/);assert.equal(response.headers.get('cache-control'),'no-store');
  const reader=response.body.getReader(),decoder=new TextDecoder(),events=[];let buffer='';
  async function read(){const {value,done}=await reader.read();buffer+=done?decoder.decode():decoder.decode(value,{stream:true});let n;while((n=buffer.indexOf('\n'))>=0){events.push(JSON.parse(buffer.slice(0,n)));buffer=buffer.slice(n+1)}return done;}
  while(!events.some(x=>x.phase==='core'))assert.equal(await read(),false);
  const parcel=events.find(x=>x.phase==='parcel'),core=events.find(x=>x.phase==='core');
  assert.equal(parcel.parcel.identityEvidence.status,'matched');assert.ok(parcel.parcel.area>0);
  assert.equal(core.planning.loading,true);assert.equal(core.planning.sourceChecks.flood.status,'loading');assert.ok(core.planning.fsr);
  assert.ok(!events.some(x=>x.phase==='complete'),'no final claim while supplements are pending');
  release();while(!await read()){}
  assert.ok(events.some(x=>x.phase==='frontage'));assert.equal(events.at(-1).phase,'complete');assert.deepEqual(events.at(-1).planning.failedKeys,[]);
  const count=t.calls.length;
  const legacy=await realFetch(url,{...request,headers:{'Content-Type':'application/json',Accept:'application/json'},signal:AbortSignal.timeout(3000)}),json=await legacy.json();
  assert.equal(json.phase,undefined);assert.equal(json.parcel.area,parcel.parcel.area);assert.equal(json.planning.zone,core.planning.zone);assert.equal(t.calls.length,count,'warm complete requests reuse validated upstream responses');
  assert.equal(t.calls.filter(c=>c.name==='parcel').length,1);
 }finally{release();global.fetch=realFetch;server.closeAllConnections();await new Promise(r=>server.close(r));}
});
