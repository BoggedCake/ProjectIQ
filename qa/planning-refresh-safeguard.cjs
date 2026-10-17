'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {JSDOM,VirtualConsole}=require('jsdom');
const html=fs.readFileSync('index.html','utf8');
const modules=['address-evidence','response-evidence','property-evidence','zoning-evidence','fsr-evidence','planning-intelligence','contributions-evidence','commercial-engine','comparison-engine','conversation','voice'];
const at=new Date().toISOString(),proposal={type:'duplex',attached:true,assessmentDate:'2026-10-17'};
function browser(fetch){return new JSDOM(html,{url:'http://localhost/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.scrollTo=()=>{};w.fetch=fetch;w.TextDecoder=TextDecoder;for(const name of modules)w.eval(fs.readFileSync(name+'.js','utf8'));}});}
const fixtures=new WeakMap();
function supported(a){
 const p=JSON.parse(JSON.stringify(a.FIXTURES[0]));
 Object.assign(p,{live:true,area:600,areaEvidence:{status:'indicative',value:600},identityEvidence:{status:'matched'},sourceMeta:{serverApi:true,timing:{}}});
 p.planning={loading:false,zone:'R1',instrument:'Manly Local Environmental Plan 2013',fsr:'0.5:1',height:'8.5 m',checkedAt:at,sourceChecks:Object.fromEntries(['fsr','zone','lot','height','heritage','reservation','application','acid','riparian','biodiversity','wetlands','sensitive','flood','landslide','contribution','dcp','greenfield','localProvision','apu','keySites','urbanRelease','sic','bushfire','sepp','localIdentify'].map(k=>[k,{status:'complete',checkedAt:at}])),failedKeys:[]};
 p.planning.pathwayEvidence={address:p.address,lot:p.lot,dp:p.dp,area:p.area,zone:'R1',instrument:p.planning.instrument,proposalType:'duplex',attached:true,assessedAt:'2026-10-17',source:'Synthetic dated planner report',status:'supported',pathway:'da',permissionConfirmed:true,mandatoryRequirementsSatisfied:true,exclusionsCleared:true,designEnvelopeConfirmed:true,remainingChecks:[]};
 fixtures.set(p,JSON.parse(JSON.stringify(p.planning)));return p;
}
function core(p){return{phase:'core',planning:{loading:true,coreReady:true,zone:'R1',instrument:(fixtures.get(p)||p.planning).instrument,fsr:'0.5:1',height:'8.5 m',sourceChecks:{zone:{status:'complete',checkedAt:at},fsr:{status:'complete',checkedAt:at},height:{status:'complete',checkedAt:at},lot:{status:'complete',checkedAt:at},flood:{status:'loading',checkedAt:null},heritage:{status:'loading',checkedAt:null},dcp:{status:'loading',checkedAt:null}},failedKeys:[]}};}
const parcel={phase:'parcel',parcel:{area:600,identityEvidence:{status:'matched'},areaEvidence:{status:'indicative',value:600},parcels:1}};
function response(events){return new Response(events.map(x=>JSON.stringify(x)).join('\n')+'\n',{headers:{'content-type':'application/x-ndjson'}});}
test('prior supported project → fresh core → supplementary failure never revives historical eligibility',async()=>{
 let events;const dom=browser(async()=>response(events));
 try{
  const a=dom.window.SitePivot,p=supported(a);
  assert.equal(a.planning.assess(p,proposal).readyForFeasibility,true,'reproduction starts with a supported property-specific assessment');
  events=[parcel,core(p),{phase:'error',error:'Supplementary provider disconnected'}];
  a.selectProperty(p);await a.completeLiveProperty(p,null,null,a.app.enrichSeq);
  const current=a.app.property,r=a.planning.assess(current,proposal);
  assert.ok(current.planning.failedKeys.includes('flood'));
  assert.equal(current.planning._sourceUnavailable,true);
  assert.equal(r.readyForFeasibility,false,'historical supported proof must not establish current feasibility after interrupted refresh');
  assert.notEqual(r.eligibility.category,'requirements-satisfied');
  assert.equal(r.readyForPreliminaryCosting,true,'verified Manly R1 core still allows explicitly conditional DA costing');
  assert.match(a.planning.answer(r),/conditional.*preliminary/s);
  const history=current.planning.history.at(-1);
  assert.equal(history.status,'historical');
  assert.equal(history.planning.pathwayEvidence.source,'Synthetic dated planner report');
  assert.equal(history.planning.pathwayEvidence.status,'supported');
  assert.equal(history.planning.checkedAt,at);
  assert.equal(current.planning.pathwayEvidence,undefined);
 }finally{dom.window.close();}
});
function complete(p,requestId,{proof=true,...changes}={}){
 const planning=JSON.parse(JSON.stringify(fixtures.get(p)||p.planning));
 for(const c of Object.values(planning.sourceChecks))Object.assign(c,{status:'complete',checkedAt:new Date().toISOString()});
 if(proof)planning.pathwayEvidence.validatedForRequest=requestId;else delete planning.pathwayEvidence;
 return{phase:'complete',parcel:parcel.parcel,planning:{...planning,...changes,loading:false}};
}
test('fresh complete evidence supports readiness only with current request and matching assessment validation',async()=>{
 let p,mode='current';const dom=browser(async(url,options)=>{
  const id=JSON.parse(options.body).assessmentRequestId,event=complete(p,mode==='current'?id:'previous-request');
  return response([parcel,core(p),event]);
 });
 try{
  const a=dom.window.SitePivot;p=supported(a);a.selectProperty(p);
  const original=JSON.parse(JSON.stringify(p));
  await a.completeLiveProperty(p,null,null,a.app.enrichSeq);
  assert.equal(a.planning.assess(a.app.property,proposal).readyForFeasibility,true);
  assert.equal(a.planning.assess(a.app.property,{...proposal,attached:false}).readyForFeasibility,false);
  mode='old';p=original;
  await a.retryPlanningEvidence();
  assert.equal(a.planning.assess(a.app.property,proposal).readyForFeasibility,false,'old validation cannot become current merely because retrieval completed');
 }finally{dom.window.close();}
});
test('failed refresh → retry → full recovery does not automatically resurrect earlier proof',async()=>{
 let p,attempt=0;const dom=browser(async(url,options)=>{const id=JSON.parse(options.body).assessmentRequestId;return response(++attempt===1?[parcel,core(p),{phase:'error',error:'disconnected'}]:[parcel,core(p),complete(p,id,{proof:false})]);});
 try{
  const a=dom.window.SitePivot;p=supported(a);const original=JSON.parse(JSON.stringify(p));a.selectProperty(p);
  await a.completeLiveProperty(p,null,null,a.app.enrichSeq);p=original;
  await a.retryPlanningEvidence();
  const current=a.app.property,r=a.planning.assess(current,proposal);
  assert.equal(attempt,2);assert.equal(current.planning.sourceChecks.flood.status,'complete');assert.equal(current.planning._sourceUnavailable,undefined);
  assert.equal(r.readyForFeasibility,false);assert.equal(r.readyForPreliminaryCosting,true);
  assert.equal(current.planning.history[0].planning.pathwayEvidence.status,'supported');
  assert.equal(current.planning.pathwayEvidence,undefined);
 }finally{dom.window.close();}
});
test('partial, stale and failed current evidence block decisive proof while core allows conditional costing',()=>{
 const P=require('../planning-intelligence');
 for(const changes of [{_sourceUnavailable:true},{failedKeys:['flood']},{sourceChecks:{heritage:{status:'unavailable',checkedAt:null}}},{sourceChecks:{dcp:{status:'loading',checkedAt:null}}},{sourceChecks:{flood:{status:'complete',checkedAt:'2026-01-01T00:00:00Z'}}},{councilEvidence:{flood:{failed:true,complete:false}}},{councilEvidence:{flood:{complete:true,checkedAt:'2026-01-01T00:00:00Z'}}},{councilEvidence:{heritage:{complete:true,checkedAt:new Date().toISOString(),layerChecks:[{status:'unavailable',checkedAt:null}]}}}]){
  const dom=browser(async()=>{});
  try{const p=supported(dom.window.SitePivot);Object.assign(p.planning,changes);const r=P.assess(p,proposal);assert.equal(r.readyForFeasibility,false,JSON.stringify(changes));assert.notEqual(r.eligibility.category,'requirements-satisfied');assert.equal(r.readyForPreliminaryCosting,true);}finally{dom.window.close();}
 }
});
test('saved-project reopening retains dated history but requires revalidation and recovers on retry',async()=>{
 let p;const dom=browser(async(url,options)=>response([parcel,core(p),complete(p,JSON.parse(options.body).assessmentRequestId)]));
 try{
  const a=dom.window.SitePivot;p=supported(a);a.selectProperty(p);a.saveLocal();const id=a.app.projectId;a.reset();a.reopenProject(id);
  assert.equal(a.planning.assess(a.app.property,proposal).readyForFeasibility,false);
  assert.equal(a.planning.assess(a.app.property,proposal).readyForPreliminaryCosting,false);
  assert.equal(a.app.property.planning.history[0].planning.checkedAt,at);
  a.show('passport');assert.match(dom.window.document.getElementById('planningHistory').textContent,/Historical.*Synthetic dated planner report.*supported/s);
  await a.retryPlanningEvidence();
  assert.equal(a.planning.assess(a.app.property,proposal).readyForFeasibility,true);
 }finally{dom.window.close();}
});
test('changed property, parcel, or proposal cannot inherit proof from a completed assessment',()=>{
 const dom=browser(async()=>{});
 try{
  const a=dom.window.SitePivot,p=supported(a);p.planning.evidenceContext={requestId:'verified-1',propertyKey:a.planning.evidenceIdentity(p),parcelValidated:true,status:'complete'};p.planning.pathwayEvidence.validatedForRequest='verified-1';
  assert.equal(a.planning.assess(p,proposal).readyForFeasibility,true);
  for(const changes of [{address:'Different address'},{lot:'999'},{dp:'DP999'},{sourceMeta:{cadid:'999'}},{area:601}])assert.equal(a.planning.assess({...p,...changes},proposal).readyForFeasibility,false,JSON.stringify(changes));
 }finally{dom.window.close();}
});
test('current prohibition wins over historical support and current support is not suppressed by historical prohibition',async()=>{
 let p,prohibited=true;const dom=browser(async(url,options)=>{
  const id=JSON.parse(options.body).assessmentRequestId,event=complete(p,id);
  if(prohibited){event.planning.landUseEvidence={...event.planning.pathwayEvidence,status:'prohibited',stateOverridesChecked:true};delete event.planning.pathwayEvidence;}
  return response([parcel,core(p),event]);
 });
 try{
  const a=dom.window.SitePivot;p=supported(a);const original=JSON.parse(JSON.stringify(p));a.selectProperty(p);await a.completeLiveProperty(p,null,null,a.app.enrichSeq);
  let r=a.planning.assess(a.app.property,proposal);assert.equal(r.eligibility.category,'prohibited');assert.equal(r.readyForPreliminaryCosting,false);
  p=original;prohibited=false;await a.retryPlanningEvidence();r=a.planning.assess(a.app.property,proposal);
  assert.equal(r.readyForFeasibility,true);assert.equal(a.app.property.planning.history.at(-1).planning.landUseEvidence.status,'prohibited');
 }finally{dom.window.close();}
});
const tick=()=>new Promise(r=>setImmediate(r));
test('superseded same-property stream cannot overwrite newer verified results',async()=>{
 let controller,attempt=0,p;const encoder=new TextEncoder();const dom=browser(async(url,options)=>++attempt===1?new Response(new ReadableStream({start(c){controller=c;}}),{headers:{'content-type':'application/x-ndjson'}}):response([parcel,core(p),complete(p,JSON.parse(options.body).assessmentRequestId)]));
 try{
  const a=dom.window.SitePivot;p=supported(a);const original=JSON.parse(JSON.stringify(p));a.selectProperty(p);
  const old=a.completeLiveProperty(p,null,null,a.app.enrichSeq);for(let i=0;i<4;i++)await tick();
  p=original;await a.completeLiveProperty(JSON.parse(JSON.stringify(p)),null,null,a.app.enrichSeq);
  assert.equal(a.planning.assess(a.app.property,proposal).readyForFeasibility,true);
  controller.enqueue(encoder.encode(JSON.stringify({...core(p),planning:{...core(p).planning,zone:'RE1'}})+'\n'+JSON.stringify({phase:'error',error:'old failure'})+'\n'));controller.close();await old;
  assert.equal(a.app.property.planning.zone,'R1');assert.equal(a.planning.assess(a.app.property,proposal).readyForFeasibility,true);
 }finally{dom.window.close();}
});
test('identity changed in place during retrieval prevents any late parcel or core publication',async()=>{
 let controller;const encoder=new TextEncoder(),dom=browser(async()=>new Response(new ReadableStream({start(c){controller=c;}}),{headers:{'content-type':'application/x-ndjson'}}));
 try{
  const a=dom.window.SitePivot,p=supported(a);a.selectProperty(p);const old=a.completeLiveProperty(p,null,null,a.app.enrichSeq);for(let i=0;i<4;i++)await tick();a.app.property.lot='NEW';
  controller.enqueue(encoder.encode([parcel,core(p),complete(p,'1')].map(x=>JSON.stringify(x)).join('\n')+'\n'));controller.close();await old;
  assert.equal(a.app.property.lot,'NEW');assert.equal(a.app.property.planning.coreReady,false);
 }finally{dom.window.close();}
});
test('partial events and a duplicate completion after a verified completion cannot replace it',async()=>{
 let p;const dom=browser(async(url,options)=>{const event=complete(p,JSON.parse(options.body).assessmentRequestId);return response([parcel,event,{...core(p),planning:{...core(p).planning,zone:'RE1',pathwayEvidence:p.planning.pathwayEvidence}},{phase:'complete',planning:{zone:'RE1'}},{phase:'error',error:'late supplementary failure'}]);});
 try{
  const a=dom.window.SitePivot;p=supported(a);a.selectProperty(p);await a.completeLiveProperty(p,null,null,a.app.enrichSeq);
  assert.equal(a.app.property.planning.zone,'R1');assert.equal(a.planning.assess(a.app.property,proposal).readyForFeasibility,true);
 }finally{dom.window.close();}
});
test('missing current parcel or required checks cannot be repaired by a successful completion label',async()=>{
 let p,mode='missing-check';const dom=browser(async(url,options)=>{const event=complete(p,JSON.parse(options.body).assessmentRequestId);if(mode==='missing-check')delete event.planning.sourceChecks.heritage;else event.parcel={};return response([event]);});
 try{
  const a=dom.window.SitePivot;p=supported(a);a.selectProperty(p);await a.completeLiveProperty(p,null,null,a.app.enrichSeq);
  assert.equal(a.planning.assess(a.app.property,proposal).readyForFeasibility,false);assert.equal(a.app.property.planning.evidenceContext.status,'incomplete');
  mode='missing-parcel';p=supported(a);await a.completeLiveProperty(p,null,null,a.app.enrichSeq);
  assert.equal(a.planning.assess(a.app.property,proposal).readyForFeasibility,false);assert.equal(a.planning.assess(a.app.property,proposal).readyForPreliminaryCosting,false);
 }finally{dom.window.close();}
});
test('stale or undated zoning cannot support even preliminary permission-based costs',()=>{
 const dom=browser(async()=>{});
 try{const a=dom.window.SitePivot;for(const checkedAt of ['2026-01-01T00:00:00Z',null,'invalid']){const p=supported(a);p.planning.sourceChecks.zone={status:'complete',checkedAt};const r=a.planning.assess(p,proposal);assert.equal(r.readyForFeasibility,false);assert.equal(r.readyForPreliminaryCosting,false);}}
 finally{dom.window.close();}
});
test('a matching current prohibition is never silenced by an unrelated source failure',async()=>{
 let p;const dom=browser(async(url,options)=>{const event=complete(p,JSON.parse(options.body).assessmentRequestId);event.planning.landUseEvidence={...event.planning.pathwayEvidence,status:'prohibited',stateOverridesChecked:true};delete event.planning.pathwayEvidence;event.planning.sourceChecks.flood={status:'unavailable',checkedAt:null};event.planning.failedKeys=['flood'];return response([parcel,event]);});
 try{const a=dom.window.SitePivot;p=supported(a);a.selectProperty(p);await a.completeLiveProperty(p,null,null,a.app.enrichSeq);const r=a.planning.assess(a.app.property,proposal);assert.equal(r.readyForFeasibility,false);assert.equal(r.readyForPreliminaryCosting,false,'current contrary evidence blocks even conditional costing');assert.equal(r.eligibility.category,'prohibited');}
 finally{dom.window.close();}
});
test('historical prohibition remains a costing conflict until current contrary evidence validates recovery',async()=>{
 let p,mode='failure';const dom=browser(async(url,options)=>mode==='failure'?response([parcel,core(p),{phase:'error',error:'disconnected'}]):response([parcel,complete(p,JSON.parse(options.body).assessmentRequestId)]));
 try{
  const a=dom.window.SitePivot;p=supported(a);const fresh=JSON.parse(JSON.stringify(p));p.planning.landUseEvidence={...p.planning.pathwayEvidence,status:'prohibited',stateOverridesChecked:true};delete p.planning.pathwayEvidence;a.selectProperty(p);
  await a.completeLiveProperty(p,null,null,a.app.enrichSeq);let r=a.planning.assess(a.app.property,proposal);assert.equal(r.readyForPreliminaryCosting,false,'unresolved known historical prohibition must not disappear');assert.notEqual(r.eligibility.category,'prohibited','historical prohibition is not promoted to current verified status');assert.match(r.gaps.join(' '),/historical.*prohibition/i);
  p=fresh;mode='recovered';await a.retryPlanningEvidence();r=a.planning.assess(a.app.property,proposal);assert.equal(r.readyForFeasibility,true);
 }finally{dom.window.close();}
});
test('a final parcel conflict revokes the earlier partial parcel match',async()=>{
 let p;const dom=browser(async(url,options)=>{const event=complete(p,JSON.parse(options.body).assessmentRequestId);event.parcel={identityEvidence:{status:'review',reason:'Current parcel conflicts with cadastral association'}};return response([parcel,core(p),event]);});
 try{const a=dom.window.SitePivot;p=supported(a);a.selectProperty(p);await a.completeLiveProperty(p,null,null,a.app.enrichSeq);const r=a.planning.assess(a.app.property,proposal);assert.equal(r.readyForFeasibility,false);assert.equal(r.readyForPreliminaryCosting,false);assert.equal(a.app.property.planning.evidenceContext.parcelValidated,false);}
 finally{dom.window.close();}
});
