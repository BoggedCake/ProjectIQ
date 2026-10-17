'use strict';
// Synthetic deferred transport tests ordering, not live service availability.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
assert.doesNotMatch(html.match(/<style>([\s\S]*?)<\/style>/)[1],/const frontageWork|requestedText:item/,'Runtime code must not enter CSS');
const complete=html.slice(html.indexOf('async function completeLiveProperty('),html.indexOf('async function retryPlanningEvidence('));
assert.match(complete,/const frontageWork=/,'Frontage publisher is defined in the property completion scope');
async function run(aborted=false){
 let release;const secondary=new Promise(r=>release=r),controller=new AbortController();
 if(aborted)controller.abort();
 const seen=[],core=new Set([1,2,4,5]),at='2026-10-16T00:00:00Z';
 const records=[];records.sourceCheck={checkedAt:at};
 const box={LIVE:{primary:'primary',protection:'protection',hazard:'hazard',bushfire:'bushfire',controls:'controls',sepp:'sepp',local:'local'},LIVE_LAYER:{fsr:1,zone:2,lot:4,height:5},
 spatialLayer:async(base,id)=>base==='primary'&&core.has(id)?records:secondary,
 identifyPoint:()=>secondary,pullCouncilEvidence:()=>secondary,
 Z:{resolve:()=>({state:'single-zone',primaryZone:{code:'R1',label:'General Residential',instrument:'Synthetic LEP'}})},F:{resolve:()=>({value:'0.6:1'}),resolveControl:()=>({value:null,requiresReview:true})},P:{overlayEvidence:()=>({})},
 epiNames:()=>[],uniq:a=>[...new Set(a)],formatZone:()=>'',formatHeight:()=> '8.5 m',formatLot:()=> '250 m²',triggerText:()=>'',planNames:()=>[],rowLabels:()=>[],attrs:x=>x.attributes||{},Date,Promise,performance};
 vm.runInNewContext(html.slice(html.indexOf('async function pullPlanning('),html.indexOf('function parseTitleFromLots(')),box);
 const work=box.pullPlanning({x:151,y:-33},{geometry:{rings:[]}},'SYNTHETIC',controller.signal,x=>seen.push(x));
 // Drain promise jobs: readiness must not depend on a timer or the withheld overlays.
 for(let i=0;i<12;i++)await Promise.resolve();
 try{if(aborted)assert.equal(seen.length,0,'Cancelled property never publishes core evidence');else{
  assert.equal(seen.length,1,'Core controls publish while supplementary requests remain pending');
  assert.equal(seen[0].zone,'R1 · General Residential');assert.equal(seen[0].fsr,'0.6:1');
  assert.equal(seen[0].loading,true,'Incomplete controls cannot establish feasibility');assert.equal(seen[0].coreReady,true);
  assert.equal(seen[0].sourceChecks.zone.status,'complete');assert.equal(seen[0].sourceChecks.flood.status,'loading');
 }}finally{release(records);await work;}
}
(async()=>{await run();await run(true);console.log('PASS core planning publishes before overlays and cancellation prevents stale publication')})().catch(e=>{console.error(e);process.exitCode=1});
