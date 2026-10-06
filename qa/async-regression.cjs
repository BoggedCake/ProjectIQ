'use strict';
const {JSDOM,VirtualConsole}=require('jsdom'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const tick=()=>new Promise(r=>setImmediate(r));
async function until(fn){for(let i=0;i<100;i++){if(fn())return;await tick()}throw Error('Test event did not arrive')}
const response=j=>({ok:true,json:async()=>j});
let failures=0;const opened=[];
async function test(name,fn){try{await fn();console.log('PASS '+name)}catch(e){failures++;console.error('FAIL '+name+': '+e.message)}finally{for(const w of opened.splice(0))w.window.close()}}
function dom(fetch,url='http://localhost/'){const w=new JSDOM(html,{url,runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.scrollTo=()=>{};w.fetch=fetch;w.AbortController=AbortController}});opened.push(w);return w}
(async()=>{
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
  let release;const w=dom(()=>new Promise(r=>release=r)),api=w.window.SitePivot,d=w.window.document;
  const p=JSON.parse(JSON.stringify(api.FIXTURES[0]));Object.assign(p,{live:true,beds:null,baths:null,parking:null,dwellingProfile:null,sourceMeta:{serverApi:true,timing:{}}});Object.assign(p.planning,{loading:true,height:null,fsr:null});
  api.selectProperty(p);d.getElementById('confirmProperty').click();const pending=api.completeLiveProperty(p,null,null,api.app.enrichSeq);await until(()=>release);
  if(stage==='passport')d.getElementById('confirmBeds').value='4';
  else{d.querySelector('#passportPathways [data-goal="reno"]').click();d.getElementById('runAssessment').click();d.getElementById('toRoadmap').click();d.getElementById('toReport').click();assert.ok(api.app.assessment.risks.some(r=>/height is not confirmed/.test(r.title)))}
  release(response({parcel:{area:531},planning:{height:'8.5 m',fsr:'0.5:1',zone:'R2',liveErrors:[],failedKeys:[]}}));await pending;
  if(stage==='passport')assert.equal(d.getElementById('confirmBeds').value,'4');
  else assert.ok(!api.app.assessment.risks.some(r=>/height is not confirmed/.test(r.title)));
 });
 process.exitCode=failures?1:0;
})();
