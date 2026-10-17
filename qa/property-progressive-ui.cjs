'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {JSDOM,VirtualConsole}=require('jsdom'),{transport}=require('./property-performance.cjs');
const html=fs.readFileSync('index.html','utf8');
const modules=['address-evidence','response-evidence','property-evidence','zoning-evidence','fsr-evidence','planning-intelligence','contributions-evidence','commercial-engine','comparison-engine','conversation','voice'];
function browser(fetch,url='http://localhost/'){
 return new JSDOM(html,{url,runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.scrollTo=()=>{};w.fetch=fetch;w.TextDecoder=TextDecoder;for(const name of modules)w.eval(fs.readFileSync(name+'.js','utf8'));}});
}
const tick=()=>new Promise(r=>setImmediate(r));
test('direct-browser authoritative resolution avoids locator for complete address',async()=>{
 const t=transport({delay:false}),dom=browser(t.fetch,'https://boggedcake.github.io/ProjectIQ/');
 try{const r=await dom.window.SitePivot.resolveLiveIdentity({text:t.text});assert.equal(r.p.identityStatus,'verified');assert.equal(t.calls.filter(c=>c.name==='geocode').length,0);}finally{dom.window.close();}
});
test('a successful empty API autocomplete does not duplicate its upstream search',async()=>{
 const calls=[],dom=browser(async url=>{calls.push(url);return{ok:true,json:async()=>({suggestions:[]})}});
 try{assert.equal((await dom.window.SitePivot.liveAddressSearch('no such property')).length,0);assert.equal(calls.length,1);}finally{dom.window.close();}
});
test('stream parser handles split UTF-8 and rejects an incomplete stream',async()=>{
 const code=html.slice(html.indexOf('async function apiJSON('),html.indexOf('const esc='));
 const encoded=new TextEncoder().encode(JSON.stringify({phase:'parcel',parcel:{label:'m²'}})+'\n'+JSON.stringify({phase:'complete',planning:{loading:false}})+'\n');
 const seen=[],box={API_BASE:'',fetch:async()=>new Response(new ReadableStream({start(c){for(const byte of encoded)c.enqueue(Uint8Array.of(byte));c.close()}}),{headers:{'content-type':'application/x-ndjson'}}),AbortController,setTimeout,clearTimeout,TextDecoder,abortable:p=>p};
 vm.runInNewContext(code,box);
 const result=await box.apiJSON('/api/planning/property',{onProgress:x=>seen.push(x)});
 assert.equal(seen[0]?.parcel.label,'m²');assert.equal(result.planning.loading,false);
 box.fetch=async()=>new Response(JSON.stringify({phase:'core',planning:{loading:true}})+'\n',{headers:{'content-type':'application/x-ndjson'}});
 await assert.rejects(box.apiJSON('/api/planning/property',{onProgress:()=>{}}),/incomplete/i);
});
test('server progress reaches the real UI and reset prevents late publication',async()=>{
 let stream;const body=new ReadableStream({start(c){stream=c}}),encoder=new TextEncoder();
 const dom=browser(async()=>new Response(body,{headers:{'content-type':'application/x-ndjson'}}));
 const send=x=>stream.enqueue(encoder.encode(JSON.stringify(x)+'\n'));
 try{
  const a=dom.window.SitePivot,p=JSON.parse(JSON.stringify(a.FIXTURES[0]));p.live=true;p.area=null;p.frontage=null;p.planning={loading:true};p.sourceMeta={serverApi:true,timing:{}};
  a.selectProperty(p);a.show('passport');const seq=a.app.enrichSeq;
  const work=a.completeLiveProperty(p,null,null,seq);
  send({phase:'parcel',timingMs:100,parcel:{area:600,identityEvidence:{status:'matched'},areaEvidence:{state:'gis-calculated',value:600},parcels:1}});
  for(let i=0;i<10;i++)await tick();
  assert.equal(a.app.property.area,600,'verified parcel is usable while overlays are still loading');
  send({phase:'core',timingMs:200,planning:{loading:true,coreReady:true,zone:'R1',fsr:'0.5:1',height:'8.5 m',sourceChecks:{flood:{status:'loading',checkedAt:null}},failedKeys:[]}});
  for(let i=0;i<10;i++)await tick();assert.equal(a.app.property.planning.zone,'R1');assert.equal(a.app.property.planning.loading,true);
  a.reset();send({phase:'complete',parcel:{area:999},planning:{loading:false,zone:'R2'}});stream.close();await work;
  assert.equal(a.app.property,null,'a superseded completion never restores the previous property');
 }finally{dom.window.close();try{stream.close()}catch{}}
});
test('a failed supplementary stream retains this request’s core and parcel, with pending sources unresolved',async()=>{
 const events=[{phase:'parcel',parcel:{area:600,identityEvidence:{status:'matched'},areaEvidence:{value:600},parcels:1}},{phase:'core',planning:{loading:true,coreReady:true,zone:'R1',fsr:'0.5:1',height:'8.5 m',sourceChecks:{zone:{status:'complete',checkedAt:new Date().toISOString()},fsr:{status:'complete',checkedAt:new Date().toISOString()},flood:{status:'loading',checkedAt:null}},failedKeys:[]}},{phase:'error',error:'Supplementary provider disconnected'}];
 const dom=browser(async()=>new Response(events.map(x=>JSON.stringify(x)).join('\n')+'\n',{headers:{'content-type':'application/x-ndjson'}}));
 try{
  const a=dom.window.SitePivot,p=JSON.parse(JSON.stringify(a.FIXTURES[0]));p.live=true;p.area=null;p.planning={loading:true};p.sourceMeta={serverApi:true,timing:{}};a.selectProperty(p);
  await a.completeLiveProperty(p,null,null,a.app.enrichSeq);
  assert.equal(a.app.property.area,600);assert.equal(a.app.property.identityEvidence.status,'matched');assert.equal(a.app.property.planning.zone,'R1');assert.equal(a.app.property.planning.loading,false);assert.ok(a.app.property.planning.failedKeys.includes('flood'));assert.equal(a.app.property.planning.sourceChecks.flood.checkedAt,null);
 }finally{dom.window.close();}
});
test('a refresh cut off after a new parcel cannot revive the previous core evidence',async()=>{
 const events=[{phase:'parcel',parcel:{area:650,identityEvidence:{status:'matched'},areaEvidence:{value:650},parcels:1}},{phase:'error',error:'Disconnected before fresh core'}];
 const dom=browser(async()=>new Response(events.map(x=>JSON.stringify(x)).join('\n')+'\n',{headers:{'content-type':'application/x-ndjson'}}));
 try{
  const a=dom.window.SitePivot,p=JSON.parse(JSON.stringify(a.FIXTURES[0]));p.live=true;p.sourceMeta={serverApi:true,timing:{}};p.planning={...p.planning,loading:true,coreReady:true,sourceChecks:{zone:{status:'complete',checkedAt:new Date().toISOString()},fsr:{status:'complete',checkedAt:new Date().toISOString()}}};a.selectProperty(p);
  await a.completeLiveProperty(p,null,null,a.app.enrichSeq);
  assert.equal(a.app.property.area,650);assert.equal(a.app.property.planning.sourceChecks.zone.status,'unavailable');assert.ok(a.app.property.planning.failedKeys.includes('zone'));assert.equal(a.app.property.planning.savedSnapshot,true);
 }finally{dom.window.close();}
});
