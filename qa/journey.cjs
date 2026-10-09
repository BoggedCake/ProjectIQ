'use strict';
const {chromium}=require('playwright');
const http=require('node:http');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'));
const server=http.createServer((req,res)=>{if(['/property-evidence.js','/planning-intelligence.js','/commercial-engine.js','/comparison-engine.js','/conversation.js','/voice.js'].includes(req.url.split('?')[0])){res.setHeader('Content-Type','application/javascript');res.end(fs.readFileSync(require('node:path').join(__dirname,'..'+req.url.split('?')[0])));return}res.setHeader('Content-Type','text/html');res.end(html)});
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
  await page.locator('#view-passport.active').waitFor({timeout:2000});await page.locator('#manualDirections').evaluate(el=>el.open=true);
 }
 async function report(page){
  if(await page.locator('#view-unsure.active').count())await page.locator('#unsureRecommend').click();
  await page.locator('#view-scope.active').waitFor();
  if(await page.locator('[data-renovation="kitchen"]').count())await page.locator('[data-renovation="kitchen"]').check();if(await page.locator('[data-room="bedroom"]').count())await page.locator('[data-room="bedroom"]').check();await page.locator('#runAssessment').click();await page.locator('#view-assessment.active').waitFor();
  assert.ok(await page.locator('#consumerResult').isVisible());await page.locator('#assessmentDetail > summary').click();assert.equal(await page.locator('#assessmentTabs').isVisible(),false);for(const id of ['planning','cost','market','compare','risks'])assert.ok(await page.locator('#tab-'+id).isVisible());const priced=await page.evaluate(()=>({goal:SitePivot.app.goal,type:SitePivot.app.devType,cost:SitePivot.app.assessment.cost}));if(priced.goal==='develop'&&['townhouse','apartment','multisite'].includes(priced.type)){assert.equal(priced.cost.status,'review');assert.match(priced.cost.reason,/project-specific QS rates/)}else assert.ok(priced.cost.mid>0);
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
  assert.equal(await p.locator('.assistantMessage.user').count(),3);
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
  await p.route('**/api/voice/speak',r=>r.fulfill({status:503,json:{error:'Audio not available'}}));await p.goto(base+'/?fixtures=1');await fixture(p);
  await p.locator('#assistantMic').click();await p.locator('.assistantMessage.user').waitFor();
  await p.waitForFunction(()=>window.__spoken.length===1);const spoken=await p.evaluate(()=>window.__spoken);assert.equal(spoken.length,1);assert.equal(spoken[0].voice,'Microsoft Natasha Natural');assert.doesNotMatch(spoken[0].text,/Verified|Source:|Evidence state|\d{4}/i);
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
  await p.route('**/api/conversation/respond',r=>r.fulfill({json:{status:'confirmation',profile:{goal:'extend',rooms:{bedroom:1,bathroom:1},budget:800000,quality:'premium',basementPreference:'none',compareMove:false,uncertainties:['planning']}}}));
  await p.goto(base+'/?fixtures=1');await fixture(p);await p.locator('#assistantMic').click();await p.locator('#confirmIntent').waitFor();await p.locator('#confirmIntent').waitFor();assert.match(await p.locator('#assistantMessages').innerText(),/I’ll explore|Got it|additional space/);await p.locator('#confirmIntent').click();assert.equal(await p.evaluate(()=>SitePivot.app.scope.area),24);assert.equal(await p.locator('#scopeBudget').inputValue(),'$800,000');await report(p);await p.close();
 });
 await test('optional move comparison and currency editing complete report and reset',async()=>{
  const p=await open();await fixture(p);await p.locator('#passportPathways [data-goal="reno"]').click();assert.equal(await p.locator('#targetPurchase').count(),0);await p.locator('[data-renovation="kitchen"]').check();await p.locator('#compareMove').check();await p.locator('#targetPurchase').fill('2500000');await p.locator('#scopeBudget').fill('1250000');assert.equal(await p.locator('#scopeBudget').inputValue(),'$1,250,000');await p.locator('#scopeBudget').press('Home');await p.locator('#scopeBudget').press('ArrowRight');await p.locator('#scopeBudget').press('Delete');assert.equal(await p.locator('#scopeBudget').inputValue(),'$250,000');assert.equal(await p.evaluate(()=>SitePivot.app.scope.budget),250000);await p.locator('#runAssessment').click();assert.match(await p.locator('#consumerResult').innerText(),/Additional capital required/);await p.locator('#toRoadmap').click();await p.locator('#toReport').click();await p.locator('#restartBtn').click();assert.equal(await p.evaluate(()=>SitePivot.app.scope.moveEnabled),false);await p.close();
 });
 for(const [config,mid]of [['two-storey',2698214],['two-storey-basement',2506228],['three-level-basement',2875584]])await test('full delivered development journey '+config,async()=>{
  const p=await open();await fixture(p);await p.locator('#passportPathways [data-goal="develop"]').click();await p.locator('#developGrid [data-dev="duplex"]').click();await p.locator('#scopeConfiguration').selectOption(config);assert.equal(await p.evaluate(()=>SitePivot.projectCost().mid),mid);await report(p);await p.close();
 });
 await test('custom configuration never presents a fabricated construction cost',async()=>{
  const p=await open();await fixture(p);await p.locator('#passportPathways [data-goal="develop"]').click();await p.locator('#developGrid [data-dev="duplex"]').click();await p.locator('details').filter({has:p.locator('#useCustomRate')}).evaluate(el=>el.open=true);await p.locator('#useCustomRate').check();assert.equal(await p.evaluate(()=>SitePivot.projectCost().status),'review');await p.locator('#customRate').fill('6800');assert.equal(await p.evaluate(()=>SitePivot.projectCost().mid),2992000);await report(p);await p.close();
 });
 await test('unavailable structured interpretation preserves manual journey without invented intent',async()=>{
  const p=await open();await p.route('**/api/conversation/respond',r=>r.fulfill({json:{status:'review',profile:null,reason:'Automatic interpretation is not connected yet.'}}));await fixture(p);await p.locator('#assistantInput').fill('Do not build a duplex. Maybe an office.');await p.locator('#assistantSend').click();await p.waitForFunction(()=>SitePivot.assistantState.lastResult?.clarification);assert.doesNotMatch(await p.locator('#assistantMessages').innerText(),/not connected|provider|API/);assert.equal(await p.evaluate(()=>SitePivot.assistantState.lastResult.intent.primaryPathway),'reno');assert.equal(await p.evaluate(()=>SitePivot.app.goal),null);await p.locator('#assistantInput').fill('Extend with an extra bedroom');await p.locator('#assistantSend').click();await p.locator('#confirmIntent').click();assert.equal(await p.evaluate(()=>SitePivot.app.goal),'extend');await report(p);await p.close();
 });
 const renoSentence='I’m thinking about renovating my current property. I want to open up the kitchen, make the living area bigger and renovate my bathroom.';
 for(const mode of ['text','voice'])await test('founder renovation '+mode+' intake to report and reset',async()=>{
  const p=await browser.newPage();p.errors=[];p.on('pageerror',e=>p.errors.push(e.message));
  if(mode==='voice')await p.addInitScript(text=>{window.SpeechRecognition=class{start(){const r=[{transcript:text}];r.isFinal=true;this.onstart?.();this.onresult?.({resultIndex:0,results:[r]});this.onend?.()}stop(){}abort(){}}},renoSentence);
  await p.goto(base+'/?fixtures=1');await fixture(p);
  if(mode==='voice')await p.locator('#assistantMic').click();else await p.locator('#assistantInput').fill(renoSentence);
  await p.locator('#assistantSend').click();await p.locator('#confirmIntent').waitFor();assert.equal(await p.evaluate(()=>SitePivot.app.goal),'reno');await p.locator('#confirmIntent').click();
  for(const k of ['kitchen','living','bathroom','openplan'])assert.equal(await p.locator('[data-renovation="'+k+'"]').isChecked(),true);
  for(const k of ['bedroom','masterSuite','upperLevel','garage'])assert.equal(await p.locator('[data-room="'+k+'"]').count(),0);
  assert.equal(await p.locator('#scopeArea').count(),0);await report(p);assert.match(await p.locator('#reportContent').innerText(),/Structural engineer/);await p.locator('#restartBtn').click();assert.equal(await p.locator('#assistantInput').inputValue(),'');assert.equal(await p.evaluate(()=>SitePivot.app.confirmedIntent),null);await p.close();
 });
 await test('manual intent edits re-interpret components and allow different direction',async()=>{
  const p=await open();await fixture(p);await p.locator('#assistantInput').fill(renoSentence);await p.locator('#assistantSend').click();await p.locator('#editIntent').click();await p.locator('#assistantInput').fill('Extend with two bedrooms and a bathroom, budget $600,000');await p.locator('#assistantSend').click();assert.equal(await p.evaluate(()=>SitePivot.app.goal),'extend');await p.locator('#confirmIntent').click();assert.equal(await p.locator('#scopeBudget').inputValue(),'$600,000');assert.equal(await p.locator('#roomCount-bedroom').inputValue(),'2');assert.equal(await p.evaluate(()=>SitePivot.app.scope.area),38);await report(p);await p.close();
 });
 await test('working site and per-home values drive complete feasibility, gate and report',async()=>{
  const p=await open();await fixture(p);await p.locator('#passportPathways [data-goal="develop"]').click();assert.equal(await p.locator('#developGrid [data-dev]').count(),5);await p.locator('#developGrid [data-dev="duplex"]').click();assert.ok(await p.locator('#feas-landValue').isVisible());await p.locator('#feas-landValue').fill('4000000');await p.locator('#feas-salePerDwelling').fill('4000000');await p.locator('#runAssessment').click();let f=await p.evaluate(()=>SitePivot.app.assessment.feas);assert.equal(f.delivery,2698214);assert.equal(f.grv,8000000);assert.equal(f.profit,8000000-f.total);assert.equal(f.profitOnCost,f.profit/f.total);assert.equal(f.profitOnGrv,f.profit/8000000);assert.equal(f.lines.professional,undefined);assert.match(await p.locator('#consumerResult').innerText(),/Your working assumption/);assert.equal(await p.locator('#assessmentDetail').getAttribute('open'),null);await p.locator('#reduceScope').click();await p.locator('#scopeGfa').fill('400');await p.locator('#runAssessment').click();assert.equal(await p.evaluate(()=>SitePivot.app.assessment.cost.mid),2467830);await p.locator('#compareAlternatives').click();assert.ok(await p.locator('#targetPurchase').isVisible());await p.locator('#runAssessment').click();await p.locator('#toRoadmap').click();await p.locator('#toReport').click();assert.match(await p.locator('#reportContent').innerText(),/\$8,000,000/);assert.deepEqual(p.errors,[]);await p.close();
 });
 for(const viewport of [{width:390,height:844},{width:393,height:852}])await test('single scroll renovation and development assessment at '+viewport.width,async()=>{
  const p=await open({viewport,isMobile:true,hasTouch:true});await fixture(p);await p.locator('#assistantInput').fill(renoSentence);await p.locator('#assistantSend').click();await p.locator('#confirmIntent').click();await p.locator('#runAssessment').click();assert.ok(await p.locator('#consumerResult').isVisible());assert.equal(await p.locator('#assessmentDetail').getAttribute('open'),null);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.equal(await p.locator('#consumerResult .checkItem').count()<=3,true);assert.doesNotMatch(await p.locator('#consumerResult').innerText(),/fixture|provider|static browser|not connected|externalWorks|authorityContributions|taxSensitivity|Not available/);await p.locator('#toRoadmap').click();await p.locator('#toReport').click();assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.close();
 });

 await test('late structured intake cannot overwrite a manually chosen pathway',async()=>{
  const p=await open();await fixture(p);let release,started;const waiting=new Promise(r=>started=r);await p.route('**/api/conversation/respond',async route=>{started();await new Promise(r=>release=r);await route.fulfill({json:{intent:{primaryPathway:'develop',confidence:.9}}})});await p.locator('#assistantInput').fill('Something nicer somehow');await p.locator('#assistantSend').click();await waiting;await p.locator('#passportPathways [data-goal="extend"]').click();release();await p.waitForTimeout(100);assert.equal(await p.evaluate(()=>SitePivot.app.goal),'extend');assert.equal(await p.evaluate(()=>SitePivot.app.intent),null);await report(p);await p.close();
 });
 await browser.close();server.close();
 fs.writeFileSync(process.env.QA_OUTPUT||'/tmp/sitepivot-journey-results.json',JSON.stringify({base,results,pass:results.every(r=>r.pass)},null,2));
 if(results.some(r=>!r.pass))process.exitCode=1;
}
main().catch(e=>{console.error(e);server.close();process.exitCode=1});
