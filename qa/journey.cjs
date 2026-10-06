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
  const page=await browser.newPage(options);page.errors=[];page.failures=[];
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
  for(const t of await page.locator('#assessmentTabs [data-tab]').all())await t.click();
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
 await browser.close();server.close();
 fs.writeFileSync(process.env.QA_OUTPUT||'/tmp/sitepivot-journey-results.json',JSON.stringify({base,results,pass:results.every(r=>r.pass)},null,2));
 if(results.some(r=>!r.pass))process.exitCode=1;
}
main().catch(e=>{console.error(e);server.close();process.exitCode=1});
