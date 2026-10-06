'use strict';
const {chromium}=require('playwright');
const http=require('node:http');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'));
const server=http.createServer((req,res)=>{if(req.url.split('?')[0]==='/commercial-engine.js'){res.setHeader('Content-Type','application/javascript');res.end(fs.readFileSync(require('node:path').join(__dirname,'../commercial-engine.js')));return}res.setHeader('Content-Type','text/html');res.end(html)});
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
  if(await page.locator('[data-room="bedroom"]').count())await page.locator('[data-room="bedroom"]').check();await page.locator('#runAssessment').click();await page.locator('#view-assessment.active').waitFor();
  assert.ok(await page.locator('#consumerResult').isVisible());await page.locator('#assessmentDetail > summary').click();assert.ok(await page.locator('#assessmentTabs').isVisible());
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

 await test('structured early voice intake confirms rooms then completes the entire journey',async()=>{
  const p=await browser.newPage();p.errors=[];p.on('pageerror',e=>p.errors.push(e.message));
  await p.addInitScript(()=>{window.SpeechRecognition=class{start(){this.onstart?.();const r=[{transcript:'An extra bedroom and bathroom, budget eight hundred thousand'}];r.isFinal=true;this.onresult?.({resultIndex:0,results:[r]});this.onend?.()}stop(){}abort(){}}});
  await p.route('**/api/intent/extract',r=>r.fulfill({json:{status:'confirmation',profile:{goal:'extend',rooms:{bedroom:1,bathroom:1},budget:800000,quality:'premium',basementPreference:'none',compareMove:false,uncertainties:['planning']}}}));
  await p.goto(base+'/?fixtures=1');await fixture(p);await p.locator('#intentMic').click();assert.match(await p.locator('#intentInput').inputValue(),/extra bedroom/);await p.locator('#interpretIntent').click();await p.locator('#confirmIntent').waitFor();assert.match(await p.locator('#intentConfirmation').innerText(),/It sounds like you want/);await p.locator('#confirmIntent').click();assert.equal(await p.evaluate(()=>SitePivot.app.scope.area),24);assert.equal(await p.locator('#scopeBudget').inputValue(),'$800,000');await report(p);await p.close();
 });
 await test('optional move comparison and currency editing complete report and reset',async()=>{
  const p=await open();await fixture(p);await p.locator('#passportPathways [data-goal="reno"]').click();assert.equal(await p.locator('#targetPurchase').count(),0);await p.locator('[data-room="bedroom"]').check();await p.locator('#compareMove').check();await p.locator('#targetPurchase').fill('2500000');await p.locator('#scopeBudget').fill('1250000');assert.equal(await p.locator('#scopeBudget').inputValue(),'$1,250,000');await p.locator('#scopeBudget').press('Home');await p.locator('#scopeBudget').press('ArrowRight');await p.locator('#scopeBudget').press('Delete');assert.equal(await p.locator('#scopeBudget').inputValue(),'$250,000');assert.equal(await p.evaluate(()=>SitePivot.app.scope.budget),250000);await p.locator('#runAssessment').click();assert.match(await p.locator('#consumerResult').innerText(),/Approximate extra capital required to move/);await p.locator('#toRoadmap').click();await p.locator('#toReport').click();await p.locator('#restartBtn').click();assert.equal(await p.evaluate(()=>SitePivot.app.scope.moveEnabled),false);await p.close();
 });
 for(const [config,mid]of [['two-storey',2992000],['two-storey-basement',3520000],['three-level-basement',3652000]])await test('full delivered development journey '+config,async()=>{
  const p=await open();await fixture(p);await p.locator('#passportPathways [data-goal="develop"]').click();await p.locator('#developGrid [data-dev="duplex"]').click();await p.locator('#scopeConfiguration').selectOption(config);assert.equal(await p.evaluate(()=>SitePivot.projectCost().mid),mid);await report(p);await p.close();
 });
 await test('custom configuration never presents a fabricated construction cost',async()=>{
  const p=await open();await fixture(p);await p.locator('#passportPathways [data-goal="develop"]').click();await p.locator('#developGrid [data-dev="duplex"]').click();await p.locator('#scopeConfiguration').selectOption('custom');assert.equal(await p.evaluate(()=>SitePivot.projectCost().status),'review');await p.locator('#customRate').fill('6800');assert.equal(await p.evaluate(()=>SitePivot.projectCost().mid),2992000);await report(p);await p.close();
 });
 await test('unavailable structured interpretation preserves manual journey without invented intent',async()=>{
  const p=await open();await p.route('**/api/intent/extract',r=>r.fulfill({json:{status:'review',profile:null,reason:'Automatic interpretation is not connected yet.'}}));await fixture(p);await p.locator('#intentInput').fill('Do not build a duplex. Maybe an office.');await p.locator('#interpretIntent').click();await p.locator('#intentGoal').waitFor();assert.doesNotMatch(await p.locator('#intentConfirmation').innerText(),/It sounds like you want/);await p.locator('#intentGoal').selectOption('extend');await p.locator('#confirmIntent').click();assert.equal(await p.evaluate(()=>SitePivot.app.goal),'extend');await report(p);await p.close();
 });
 await browser.close();server.close();
 fs.writeFileSync(process.env.QA_OUTPUT||'/tmp/sitepivot-journey-results.json',JSON.stringify({base,results,pass:results.every(r=>r.pass)},null,2));
 if(results.some(r=>!r.pass))process.exitCode=1;
}
main().catch(e=>{console.error(e);server.close();process.exitCode=1});
