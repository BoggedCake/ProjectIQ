'use strict';
const {chromium}=require('playwright');
const http=require('node:http');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'));
const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end(html)});
const results=[];
async function main(){
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true});
 const base=process.env.SITEPIVOT_URL||`http://127.0.0.1:${server.address().port}`;
 async function test(name,fn){try{await fn();results.push({name,pass:true});console.log('PASS '+name)}catch(e){results.push({name,pass:false,error:e.stack});console.error('FAIL '+name+': '+e.message)}}
 async function open(options={}){
  const page=await browser.newPage(options);page.setDefaultTimeout(3000);page.errors=[];page.failures=[];
  page.on('pageerror',e=>page.errors.push(e.message));page.on('requestfailed',r=>page.failures.push(r.url()));
  await page.goto(base+'/?fixtures=1');return page;
 }
 async function fixture(page){
  await page.locator('[data-sample="'+await page.evaluate(()=>SitePivot.FIXTURES[2].id)+'"]').click();
  await page.locator('#confirmProperty').click();
  await page.locator('#view-passport.active').waitFor({timeout:2000});
 }
 async function report(page){
  if(await page.locator('#view-unsure.active').count())await page.locator('#unsureRecommend').click();
  await page.locator('#view-scope.active').waitFor();
  await page.locator('#runAssessment').click();await page.locator('#view-assessment.active').waitFor();
  assert.ok(await page.locator('#assessmentContent').count()||await page.locator('#assessmentTabs').isVisible());
  for(const t of await page.locator('#assessmentTabs [data-tab]').all())if(await t.isVisible()){await t.click();assert.ok(await page.locator('#tab-'+await t.getAttribute('data-tab')+'.active').isVisible())}
  await page.locator('#toRoadmap').click();await page.locator('#view-roadmap.active').waitFor();
  assert.ok((await page.locator('#roadmapList').innerText()).length>20);
  await page.locator('#toReport').click();await page.locator('#view-report.active').waitFor();
  assert.ok((await page.locator('#reportContent').innerText()).length>100);
  assert.deepEqual(page.errors,[]);
 }
 await test('startup binds property confirmation, navigation and all prompt chips',async()=>{
  const p=await open();assert.deepEqual(p.errors,[]);await fixture(p);
  for(const chip of await p.locator('[data-assistant-prompt]').all()){await chip.click()}
  assert.equal(await p.locator('.assistantMessage.user').count(),4);
  await p.getByRole('button',{name:'Start over',exact:true}).click();assert.ok(await p.locator('#view-landing').isVisible());await p.close();
 });
 for(const goal of ['reno','extend','storey','unsure'])await test('complete homeowner journey '+goal,async()=>{
  const p=await open();await fixture(p);const before=await p.evaluate(()=>JSON.stringify(SitePivot.app.property.planning));
  await p.locator('#passportPathways [data-goal="'+goal+'"]').press('Enter');await report(p);
  assert.equal(await p.evaluate(()=>JSON.stringify(SitePivot.app.property.planning)),before);await p.close();
 });
 for(const dev of ['duplex','townhouse','apartment','multisite','unsure'])await test('complete development journey '+dev,async()=>{
  const p=await open();await fixture(p);await p.locator('#passportPathways [data-goal="develop"]').click();
  await p.locator('#developGrid [data-dev="'+dev+'"]').click();await report(p);await p.close();
 });
 await test('existing calculation, evidence and identity self-tests',async()=>{
  const p=await open();const r=await p.evaluate(()=>SitePivot.runSelfTests());assert.equal(r.failed,0,JSON.stringify(r.results.filter(x=>!x.pass)));await p.close();
 });
 await test('address search, exact selection, dwelling confirmation and disclosure',async()=>{
  const p=await browser.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/api/address/suggest?*',r=>r.fulfill({json:{suggestions:[{text:'57 Griffiths Street, Fairlight NSW 2094',magicKey:'test-only'}]}}));
  await p.route('**/api/property/resolve?*',r=>r.fulfill({json:{property:{addressId:'qa-57',address:'57 GRIFFITHS ST, FAIRLIGHT NSW 2094',lga:'NORTHERN BEACHES',lot:'32',dp:'DP1729',point:{x:151.27,y:-33.79}}}}));
  await p.route('**/api/planning/property',r=>r.fulfill({json:{parcel:{lot:'32',dp:'DP1729',area:416.3,parcels:1},planning:{zone:'R1 General Residential',height:'8.5 m',fsr:'0.6:1',minLot:'250 m²',instrument:'Manly Local Environmental Plan 2013',dcpPlans:['Manly Development Control Plan 2013'],flood:'Needs Review',failedKeys:['flood'],liveErrors:['flood unavailable']}}}));
  await p.goto(base);await p.locator('#addressSearch').fill('57 Griffiths Street Fairlight');
  await p.locator('#searchResults [role="option"]').waitFor({timeout:3000});
  await p.locator('#addressSearch').press('ArrowDown');await p.locator('#addressSearch').press('Enter');
  await p.locator('#view-property.active').waitFor();await p.locator('#confirmProperty').click();
  await p.locator('#view-passport.active').waitFor({timeout:2000});
  assert.equal(await p.locator('#confirmBeds').inputValue(),'');assert.equal(await p.locator('#confirmBaths').inputValue(),'');assert.equal(await p.locator('#confirmCars').inputValue(),'');
  await p.locator('#confirmBeds').fill('3');await p.locator('#confirmBaths').fill('2');await p.locator('#confirmCars').fill('1');await p.locator('#saveDwellingProfile').click();
  assert.match(await p.locator('#dwellingSummary').innerText(),/3 Bed.*2 Bath.*1 Car/);
  assert.equal(await p.evaluate(()=>SitePivot.app.property.dwellingProfile.source),'User confirmed');
  assert.equal(await p.locator('#planningDetails').getAttribute('open'),null);
  await p.locator('#planningDetails summary').click();assert.ok(await p.locator('#planningFacts').isVisible());
  assert.equal(await p.locator('#passportMetrics .consumerMetric').count(),4);
  await p.locator('#assistantInput').fill('What is the zoning?');await p.locator('#assistantSend').click();assert.match(await p.locator('#assistantMessages').innerText(),/R1/);
  await p.locator('#changeProperty').click();assert.equal(await p.evaluate(()=>SitePivot.app.property),null);assert.equal(await p.locator('#assistantMessages .user').count(),0);
  assert.deepEqual(errors,[]);await p.close();
 });
 await test('voice transcript, female voice preference and clean spoken response',async()=>{
  const p=await browser.newPage();await p.addInitScript(()=>{
   window.__spoken=[];
   const voices=[{name:'Australian Male',lang:'en-AU'},{name:'Microsoft Sonia Natural',lang:'en-GB'},{name:'Microsoft Natasha Natural',lang:'en-AU'}];
   Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>voices,addEventListener(){},cancel(){},speak(u){window.__spoken.push({text:u.text,voice:u.voice?.name,lang:u.lang})}},configurable:true});
   window.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};
   window.SpeechRecognition=class{start(){this.onstart?.();const result=[{transcript:'What is the zoning?'}];result.isFinal=true;this.onresult?.({resultIndex:0,results:[result]});this.onend?.()}stop(){this.onend?.()}abort(){this.onend?.()}};
  });
  await p.goto(base+'/?fixtures=1');await fixture(p);
  await p.locator('#assistantMic').click();assert.equal(await p.locator('#assistantInput').inputValue(),'What is the zoning?');await p.locator('#assistantSend').click();
  const spoken=await p.evaluate(()=>window.__spoken);assert.equal(spoken.length,1);assert.equal(spoken[0].voice,'Microsoft Natasha Natural');assert.doesNotMatch(spoken[0].text,/Verified|Source:|Evidence state|\d{4}/i);
  await p.getByRole('button',{name:'Start over',exact:true}).click();await fixture(p);assert.equal(await p.locator('#assistantVoiceReply').getAttribute('aria-pressed'),'false');await p.close();
 });
 await test('mobile touch can finish development journey without overflow',async()=>{
  const p=await open({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await fixture(p);
  await p.locator('#passportPathways [data-goal="develop"]').tap();await p.locator('#developGrid [data-dev="duplex"]').tap();await report(p);
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.close();
 });
 await browser.close();server.close();
 fs.writeFileSync(process.env.QA_OUTPUT||'/tmp/sitepivot-journey-results.json',JSON.stringify({base,results,pass:results.every(r=>r.pass)},null,2));
 if(results.some(r=>!r.pass))process.exitCode=1;
}
main().catch(e=>{console.error(e);server.close();process.exitCode=1});
