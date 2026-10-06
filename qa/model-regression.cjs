'use strict';
const {JSDOM,VirtualConsole}=require('jsdom');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
let failures=0;
function test(name,fn){const errors=[],console=new VirtualConsole();console.on('jsdomError',e=>errors.push(e.message));const dom=new JSDOM(fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),{url:'https://boggedcake.github.io/ProjectIQ/?fixtures=1',runScripts:'dangerously',virtualConsole:console,beforeParse(w){w.scrollTo=()=>{}}});try{fn(dom.window.SitePivot,dom.window.document);assert.deepEqual(errors,[]);process.stdout.write('PASS '+name+'\n')}catch(e){failures++;process.stderr.write('FAIL '+name+': '+e.message+'\n')}finally{dom.window.close()}}
test('startup completes and property confirmation advances', (api,d)=>{api.selectProperty(api.FIXTURES[2]);d.getElementById('confirmProperty').click();assert.equal(api.app.view,'passport')});
test('all existing evidence and calculation invariants pass',api=>{const r=api.runSelfTests();assert.equal(r.failed,0,JSON.stringify(r.results.filter(x=>!x.pass)))});
test('feasibility chat uses the computed dollar margin and percentage',api=>{
 api.selectProperty(api.FIXTURES[0]);api.app.goal='develop';api.app.devType='duplex';const a=api.computeAssessment();assert.notEqual(a.feas.status,'review');
 const reply=api.assistantAnswer('What is the profit margin?');const money=new Intl.NumberFormat('en-AU',{style:'currency',currency:'AUD',maximumFractionDigits:0}).format(a.feas.margin);const pct=new Intl.NumberFormat('en-AU',{maximumFractionDigits:1}).format(a.feas.marginPct*100);
 assert.ok(reply.includes(money),reply);assert.ok(reply.includes(pct+'%'),reply);
});
test('spoken and consumer summaries preserve unknown and failed flood evidence',api=>{
 api.selectProperty(api.FIXTURES[0]);api.app.property.planning.flood=null;api.app.property.planning.failedKeys=['flood'];
 assert.match(api.assistantSpeechAnswer('Is there flooding?',''),/check|available/i);
 assert.doesNotMatch(api.assistantSpeechAnswer('Is there flooding?',''),/No mapped/);
 api.app.property.planning.failedKeys=[];
 assert.doesNotMatch(api.assistantSpeechAnswer('Is there flooding?',''),/No mapped/);
});
test('missing planning controls display uncertainty instead of not mapped',api=>{
 api.selectProperty(api.FIXTURES[0]);Object.assign(api.app.property.planning,{loading:false,height:null,fsr:null,minLot:null,failedKeys:['height','fsr','lot']});
 const s=api.consumerPropertySummary(api.app.property);for(const v of [s.height,s.fsr,s.minLot])assert.match(v,/check|available/i);
});
test('identity does not label missing dwelling data as verified',(api,d)=>{
 const p=JSON.parse(JSON.stringify(api.FIXTURES[0]));Object.assign(p,{live:true,beds:null,baths:null,parking:null,frontage:null});api.selectProperty(p);
 const fact=[...d.querySelectorAll('#identityFacts .fact')].find(x=>x.querySelector('.factName').textContent==='Bedrooms');assert.equal(fact.querySelector('.verified'),null);
});
test('speech removes evidence labels, ISO dates and source metadata',api=>{
 api.selectProperty(api.FIXTURES[0]);const spoken=api.assistantSpeechAnswer('Tell me the evidence','Value (Indicative). Verified. Evidence state: Unavailable. Source: NSW. Checked 2026-10-06.');assert.doesNotMatch(spoken,/Indicative|Verified|Unavailable|Source:|2026-10-06/i);
});
test('negative hazard results do not create bushfire or flood consultant recommendations',api=>{
 api.selectProperty(api.FIXTURES[0]);api.app.goal='reno';Object.assign(api.app.property.planning,{bushfire:'No NSW bush fire prone land overlap',flood:'No mapped flood planning overlap'});const a=api.computeAssessment();assert.ok(!a.risks.some(r=>/Bushfire mapping is material|Flood controls may change/.test(r.title)));assert.notEqual(a.next.who,'Bushfire consultant');
});
test('report keeps technical policies behind progressive disclosure',(api,d)=>{
 api.selectProperty(api.FIXTURES[0]);api.app.property.planning.instrument='Manly Local Environmental Plan 2013 / State Environmental Planning Policy (Housing) 2021';api.app.goal='reno';api.computeAssessment();api.show('report');
 const details=d.querySelector('#reportContent details');assert.ok(details,'Report must retain evidence in a closed detail section');assert.equal(details.open,false);assert.match(details.textContent,/State Environmental Planning Policy/);
});
test('address-point planning retains controls while flagging parcel verification',api=>{
 api.selectProperty(api.FIXTURES[0]);api.app.goal='develop';api.app.devType='duplex';api.app.property.planning.spatialScope='address-point';const a=api.computeAssessment();assert.ok(a.risks.some(r=>/Parcel boundaries/.test(r.title)));assert.ok(api.app.property.planning.zone);
});
process.exitCode=failures?1:0;
