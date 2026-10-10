'use strict';
const {JSDOM,VirtualConsole}=require('jsdom'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const tick=()=>new Promise(r=>setImmediate(r));
async function until(fn){for(let i=0;i<100;i++){if(fn())return;await tick()}throw Error('Test event did not arrive')}
const response=j=>({ok:true,json:async()=>j});
let failures=0;const opened=[];
async function test(name,fn){try{await fn();console.log('PASS '+name)}catch(e){failures++;console.error('FAIL '+name+': '+e.message)}finally{for(const w of opened.splice(0))w.window.close()}}
function dom(fetch,url='http://localhost/'){const w=new JSDOM(html,{url,runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){for(const f of ['fsr-evidence.js','property-evidence.js', 'planning-intelligence.js', 'commercial-engine.js', 'comparison-engine.js', 'conversation.js', 'voice.js'])w.eval(fs.readFileSync(path.join(__dirname,'..',f),'utf8'));w.scrollTo=()=>{};w.fetch=fetch;w.AbortController=AbortController}});opened.push(w);return w}
const suiteTimeout=setTimeout(()=>{console.error('FAIL async suite did not finish');process.exit(1)},30000);
(async()=>{
 await test('starting voice invalidates older pending conversational answer',async()=>{let release;const w=dom(()=>new Promise(r=>release=r)).window,a=w.SitePivot;a.selectProperty(a.FIXTURES[0]);a.show('passport');w.document.getElementById('assistantInput').value='Something nicer somehow';const pending=a.submitAssistant();await until(()=>release);w.SpeechRecognition=class{start(){this.onstart?.()}abort(){}stop(){}};a.startVoiceInput();release(response({intent:{primaryPathway:'develop',confidence:.95,questions:[]}}));await pending;assert.equal(a.app.goal,null);assert.equal(a.assistantState.messages.filter(m=>m.role==='assistant').length,1)});
 await test('synchronous recognition abort cannot submit old transcript to new property',async()=>{const w=dom(async()=>response({}),'https://boggedcake.github.io/ProjectIQ/').window,a=w.SitePivot;a.selectProperty(a.FIXTURES[0]);a.show('passport');w.SpeechRecognition=class{start(){this.onstart?.();const r=[{transcript:'Build a duplex'}];r.isFinal=true;this.onresult?.({results:[r],resultIndex:0})}abort(){this.onend?.()}stop(){}};a.startVoiceInput();a.selectProperty(a.FIXTURES[1]);assert.equal(a.app.goal,null);assert.equal(a.assistantState.messages.filter(m=>m.role==='user').length,0)});
 await test('retry after a recognition error cannot submit the previous transcript',async()=>{const w=dom(async()=>response({}),'https://boggedcake.github.io/ProjectIQ/').window,a=w.SitePivot;a.selectProperty(a.FIXTURES[0]);a.show('passport');let attempts=0;w.SpeechRecognition=class{start(){this.onstart?.();if(++attempts===1){const r=[{transcript:'Build a duplex'}];r.isFinal=true;this.onresult?.({results:[r],resultIndex:0});this.onerror?.({error:'network'});this.onend?.()}}stop(){this.onend?.()}abort(){}};a.startVoiceInput();a.startVoiceInput();a.stopVoiceInput();assert.equal(a.app.goal,null);assert.equal(a.assistantState.messages.filter(m=>m.role==='user').length,0)});
 await test('late intent cannot override a manual pathway',async()=>{let release;const w=dom(()=>new Promise(r=>release=r)).window,a=w.SitePivot;a.selectProperty(a.FIXTURES[0]);a.show('passport');w.document.getElementById('assistantInput').value='Something nicer somehow';const pending=a.interpretIntent();await until(()=>release);a.chooseGoal('extend');release(response({status:'confirmation',profile:{goal:'develop',quality:'premium',basementPreference:'none',rooms:{},compareMove:false}}));await pending;assert.equal(a.app.goal,'extend');assert.equal(a.app.intent,null)});
 await test('start over ignores a pending identity response',async()=>{
  let release;const w=dom(async url=>String(url).includes('/suggest')?response({suggestions:[{text:'57 Griffiths Street Fairlight NSW 2094'}]}):new Promise(r=>release=r));
  const d=w.window.document;d.getElementById('addressSearch').value='57 Griffiths Street Fairlight';d.getElementById('addressContinue').click();await until(()=>release);
  d.getElementById('restartBtn').click();release(response({property:{addressId:57,address:'57 Griffiths Street Fairlight NSW 2094',lga:'NORTHERN BEACHES',point:{x:151.27,y:-33.79}}}));
  await tick();await tick();assert.equal(w.window.SitePivot.app.view,'landing');assert.equal(w.window.SitePivot.app.property,null);w.window.close();
 });
 await test('late speech events cannot enter the next property conversation',async()=>{
  const w=dom();const api=w.window.SitePivot,d=w.window.document;let recognition;
  w.window.SpeechRecognition=class{constructor(){recognition=this}start(){this.onstart()}abort(){}stop(){}};
  api.selectProperty(api.FIXTURES[0]);d.getElementById('confirmProperty').click();d.getElementById('assistantMic').click();
  d.getElementById('restartBtn').click();api.selectProperty(api.FIXTURES[2]);d.getElementById('confirmProperty').click();
  const r=[{transcript:'Old property question'}];r.isFinal=true;recognition.onresult({results:[r],resultIndex:0});
  assert.equal(d.getElementById('assistantInput').value,'');w.window.close();
 });
 await test('browser unit lookup matches official street fields and trailing Unit syntax',async()=>{
  const w=dom(async url=>String(url).includes('findAddressCandidates')?response({candidates:[{address:'2 Dixon Street Unit 84 NSW',location:{x:151.20,y:-33.88},attributes:{Region:'New South Wales'}}]}):response({features:[{attributes:{objectid:84,formattedaddress:'UNIT 84 2-8 DIXON ST, SYDNEY NSW 2000',streetnumber1:'2',complexunitidentifier:'84',lganame:'SYDNEY',cadastralidentifier:'84//SP12345'},geometry:{x:151.20,y:-33.88}}]}),'https://boggedcake.github.io/ProjectIQ/');
  const r=await w.window.SitePivot.resolveLiveIdentity({text:'2 Dixon Street, Unit 84, Sydney, New South Wales, 2000'});assert.match(r.p.address,/UNIT 84/);assert.equal(r.p.propertyType,'apartment');w.window.close();
 });
 await test('server unit lookup agrees with the browser identity contract',async()=>{
  const prior=global.fetch;global.fetch=async url=>String(url).includes('findAddressCandidates')?response({candidates:[{address:'2 Dixon Street Unit 84 NSW',location:{x:151.20,y:-33.88},attributes:{Region:'New South Wales'}}]}):response({features:[{attributes:{objectid:84,formattedaddress:'UNIT 84 2-8 DIXON ST, SYDNEY NSW 2000',streetnumber1:'2',complexunitidentifier:'84',lganame:'SYDNEY',cadastralidentifier:'84//SP12345'},geometry:{x:151.20,y:-33.88}}]});
  try{const r=await require('../api/_lib/sitepivot').resolveProperty({text:'2 Dixon Street, Unit 84, Sydney, New South Wales, 2000',magicKey:'qa-unit'});assert.equal(r.property.unit,'84');assert.equal(r.property.strata,true)}finally{global.fetch=prior}
 });
 for(const side of ['browser','server'])await test(side+' narrows dense address responses to the requested unit',async()=>{
  const fetch=async(url,options={})=>{
   if(String(url).includes('findAddressCandidates'))return response({candidates:[{address:'2 Dixon Street Unit 84 NSW',location:{x:151.20,y:-33.88},attributes:{Region:'New South Wales'}}]});
   const where=options.body?new URLSearchParams(options.body).get('where'):new URL(String(url)).searchParams.get('where');
   const exact=/complexunitidentifier\s*=\s*'84'/.test(where)&&/streetnumber1\s*=\s*'2'/.test(where);
   return response({exceededTransferLimit:!exact,features:[{attributes:exact?{objectid:84,formattedaddress:'84/2-8 DIXON ST, SYDNEY NSW 2000',streetnumber1:'2',complexunitidentifier:'84',lganame:'SYDNEY',cadastralidentifier:'84//SP12345'}:{formattedaddress:'10 DIXON ST, SYDNEY NSW 2000',streetnumber1:'10',complexunitidentifier:null},geometry:{x:151.20,y:-33.88}}]});
  };
  if(side==='browser'){const w=dom(fetch,'https://boggedcake.github.io/ProjectIQ/');const r=await w.window.SitePivot.resolveLiveIdentity({text:'2 Dixon Street, Unit 84, Sydney NSW 2000'});assert.match(r.p.address,/84/)}
  else{const prior=global.fetch;global.fetch=fetch;delete require.cache[require.resolve('../api/_lib/sitepivot')];try{const r=await require('../api/_lib/sitepivot').resolveProperty({text:'2 Dixon Street, Unit 84, Sydney NSW 2000',magicKey:'qa-pagination'});assert.equal(r.property.unit,'84')}finally{global.fetch=prior}}
 });
 for(const stage of ['passport','report'])await test('late planning preserves '+(stage==='passport'?'dwelling draft':'assessment consistency'),async()=>{
  let release;const w=dom(url=>String(url).includes('/api/market/')?Promise.resolve(response({status:'review',soldComparables:[],completedProductComparables:[],currentListings:[]})):new Promise(r=>release=r)),api=w.window.SitePivot,d=w.window.document;
  const p=JSON.parse(JSON.stringify(api.FIXTURES[0]));Object.assign(p,{live:true,beds:null,baths:null,parking:null,dwellingProfile:null,sourceMeta:{serverApi:true,timing:{}}});Object.assign(p.planning,{loading:true,height:null,fsr:null});
  api.selectProperty(p);d.getElementById('confirmProperty').click();const pending=api.completeLiveProperty(p,null,null,api.app.enrichSeq);await until(()=>release);
  if(stage==='passport')d.getElementById('confirmBeds').value='4';
  else{d.querySelector('#passportPathways [data-goal="reno"]').click();d.getElementById('runAssessment').click();d.getElementById('toRoadmap').click();d.getElementById('toReport').click();assert.ok(api.app.assessment.risks.some(r=>/height is not confirmed/.test(r.title)))}
  release(response({parcel:{area:531},planning:{height:'8.5 m',fsr:'0.5:1',zone:'R2',liveErrors:[],failedKeys:[]}}));await pending;
  if(stage==='passport')assert.equal(d.getElementById('confirmBeds').value,'4');
  else assert.ok(!api.app.assessment.risks.some(r=>/height is not confirmed/.test(r.title)));
 });
 await test('late planning preserves resolved sold-market evidence',async()=>{
  let release;const sold={id:'sold-qa',label:'Real provider row',source:'QA provider',price:2100000,beds:4,baths:2,land:416,days:20,type:'house'};
  const w=dom(url=>String(url).includes('/api/market/')?Promise.resolve(response({status:'indicative',soldComparables:[sold],completedProductComparables:[sold],currentListings:[]})):new Promise(r=>release=r)),api=w.window.SitePivot;
  const p=JSON.parse(JSON.stringify(api.FIXTURES[0]));Object.assign(p,{live:true,sourceMeta:{serverApi:true,timing:{}}});p.planning.loading=true;
  api.selectProperty(p);const pending=api.completeLiveProperty(p,null,null,api.app.enrichSeq);await until(()=>release);api.chooseGoal('reno');await until(()=>api.app.property.marketEvidence);
  release(response({parcel:{area:416},planning:{height:'8.5 m',fsr:'0.5:1',liveErrors:[],failedKeys:[]}}));await pending;
  assert.equal(api.app.property.currentComps[0]?.id,'sold-qa');assert.equal(api.app.property.completed.reno[0]?.id,'sold-qa');assert.equal(api.app.property.marketEvidence.status,'indicative');
 });
 await test('provider failures survive the real normalized planning contract',async()=>{
  const prior=global.fetch;global.fetch=async()=>{throw Error('QA upstream failure')};delete require.cache[require.resolve('../api/_lib/sitepivot')];
  try{const r=await require('../api/_lib/sitepivot').planningFor({point:{x:151.22,y:-33.82},lga:'TEST',lot:'1',dp:'DP0'});assert.ok(r.planning.failedKeys.includes('zone'));assert.ok(r.planning.failedKeys.includes('sepp'));assert.deepEqual(r.planning.failedSources,r.planning.failedKeys);assert.equal(r.planning.zone,null);assert.ok(Array.isArray(r.planning.sepp));assert.deepEqual(r.planning.dcpPlans,[])}finally{global.fetch=prior}
 });
 await test('failed parcel lookup does not discard successful planning checks',async()=>{
  const prior=global.fetch;global.fetch=async url=>{if(String(url).includes('NSW_Land_Parcel_Property_Theme'))throw Error('QA parcel unavailable');return response({features:String(url).includes('EPI_Primary_Planning_Layers/MapServer/2/query')?[{attributes:{SYM_CODE:'R1',LAY_CLASS:'General Residential',EPI_NAME:'QA LEP'}}]:[],results:[]})};delete require.cache[require.resolve('../api/_lib/sitepivot')];
  try{const r=await require('../api/_lib/sitepivot').planningFor({point:{x:151.22,y:-33.82},lga:'TEST',lot:'1',dp:'DP0'});assert.match(r.planning.zone,/R1/);assert.ok(r.planning.failedKeys.includes('parcel'));assert.equal(r.planning.spatialScope,'address-point');assert.equal(r.parcel.geometryResolved,false)}finally{global.fetch=prior}
 });
 await test('API outage leaves consumer controls unknown rather than not mapped',async()=>{
  const w=dom(async()=>{throw Error('QA API outage')}),api=w.window.SitePivot,d=w.window.document;const p=JSON.parse(JSON.stringify(api.FIXTURES[0]));Object.assign(p,{live:true,sourceMeta:{serverApi:true,timing:{}}});Object.assign(p.planning,{loading:true,height:null,fsr:null,minLot:null});api.selectProperty(p);d.getElementById('confirmProperty').click();await api.completeLiveProperty(p,null,null,api.app.enrichSeq);
  const s=api.consumerPropertySummary(api.app.property);assert.match(s.height,/check|available/i);assert.match(s.fsr,/check|available/i);assert.match(s.minLot,/check|available/i);w.window.close();
 });

 await test('very late government JSONP cannot call a deleted callback',async()=>{
  const vm=require('node:vm'),timers=[],window={};let script,removed=false;
  const context={window,document:{createElement(){return script={remove(){removed=true}}},head:{appendChild(){}}},setTimeout(fn,ms){timers.push({fn,ms});return timers.length},clearTimeout(){},params:q=>new URLSearchParams(q).toString(),URLSearchParams,Date,Math,Error};
  const source=html.match(/^function arcJsonp[^\n]+/m)[0];vm.runInNewContext(source+';this.pending=arcJsonp("https://official.test/query",{},5).catch(e=>e.message)',context);
  const callback=new URL(script.src).searchParams.get('callback');timers.find(t=>t.ms===5).fn();assert.match(await context.pending,/timed out/);for(const t of timers.filter(t=>t.ms>5))t.fn();
  assert.ok(removed);assert.equal(typeof window[callback],'function');assert.doesNotThrow(()=>window[callback]({features:[{late:true}]}));assert.match(await context.pending,/timed out/);
 });
 clearTimeout(suiteTimeout);console.log('ASYNC_SUITE_COMPLETED');process.exitCode=failures?1:0;
})();
