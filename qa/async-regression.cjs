'use strict';
const {JSDOM,VirtualConsole}=require('jsdom'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const tick=()=>new Promise(r=>setImmediate(r));
async function until(fn){for(let i=0;i<100;i++){if(fn())return;await tick()}throw Error('Test event did not arrive')}
const response=j=>({ok:true,json:async()=>j});
let failures=0;
async function test(name,fn){try{await fn();console.log('PASS '+name)}catch(e){failures++;console.error('FAIL '+name+': '+e.message)}}
function dom(fetch,url='http://localhost/'){return new JSDOM(html,{url,runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.scrollTo=()=>{};w.fetch=fetch;w.AbortController=AbortController}})}
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
 process.exitCode=failures?1:0;
})();
