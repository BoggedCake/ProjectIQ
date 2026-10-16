'use strict';
// Real source journeys. Financial inputs are founder assumptions, not property facts.
const {chromium,webkit}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.join(__dirname,'../qa-artifacts/p0-founder'),results=[];
const server=process.env.SITEPIVOT_URL?null:require('./founder-server.cjs').createServer();
const near=(a,b)=>assert.ok(Number.isFinite(a)&&Math.abs(a-b)<.02,`${a} != ${b}`);
(async()=>{
 fs.mkdirSync(out,{recursive:true});if(server)await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const url=process.env.SITEPIVOT_URL||`http://127.0.0.1:${server.address().port}/`;
 for(const engine of [chromium,webkit]){
  const browser=await engine.launch();
  for(const width of [390,1280])for(const addressCase of ['new-street','owner-waratah']){
   const label=`${engine.name()}-${width}-${addressCase}`,page=await browser.newPage({viewport:{width,height:width<500?844:900},isMobile:width<500,hasTouch:width<500});page.setDefaultTimeout(45000);
   const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));
   page.on('response',r=>{if(/spatial.nsw.gov.au|environment.nsw.gov.au|geocode.arcgis.com|northernbeaches.nsw.gov.au/.test(r.url()))requests.push({service:new URL(r.url()).hostname,status:r.status()})});
   const capture=stage=>page.screenshot({path:path.join(out,`${label}-${stage}.png`),fullPage:true});
   const snapshot=()=>page.evaluate(()=>({role:SitePivot.app.ownershipRole,property:SitePivot.app.property,scope:SitePivot.app.scope,assessment:SitePivot.app.assessment,dataState:SitePivot.app.dataState,liveStatus:SitePivot.app.liveStatus,requestDiagnostics:SitePivot.requestDiagnostics}));
   async function reveal(selector){const el=page.locator(selector);await el.waitFor({state:'attached'});const parents=el.locator('xpath=ancestor::details');for(let i=await parents.count()-1;i>=0;i--){const d=parents.nth(i);if(!await d.evaluate(n=>n.open))await d.locator(':scope > summary').click()}return el}
   async function fill(id,value){const el=await reveal('#'+id);await el.fill(String(value));await el.blur()}
   async function ready(){await page.waitForFunction(()=>SitePivot.app.property&&!SitePivot.app.property.planning.loading&&!SitePivot.app.property.planning.savedSnapshot,{},{timeout:45000})}
   try{
    await page.goto(url);await page.locator('[data-ownership="owner"]').click();
    const input=addressCase==='new-street'?'61 New Street West Balgowlah Heights NSW 2093':'19 Waratah Street Balgowlah NSW 2093',match=addressCase==='new-street'?/61\s+NEW.*BALGOWLAH HEIGHTS/i:/19\s+WARATAH.*BALGOWLAH/i;
    const started=Date.now();await page.locator('#addressSearch').fill(input);await page.locator('[data-live-index]').filter({hasText:match}).first().waitFor();const suggestionsMs=Date.now()-started;
    const selected=Date.now();await page.locator('[data-live-index]').filter({hasText:match}).first().click();await page.locator('#view-property.active').waitFor();const identityMs=Date.now()-selected;
    let p=(await snapshot()).property;assert.equal(p.live,true);assert.equal(!!p.generic,false);assert.match(p.address,match);
    if(addressCase==='new-street'){assert.match(p.address,/NEW ST WEST/);assert.equal(p.sourceMeta.addressSourceIds.ap_gurasid,72720191);assert.equal(p.sourceMeta.cadid,102197818);assert.equal(String(p.lot),'15');assert.equal(String(p.dp).replace(/\D/g,''),'2044')}
    await page.locator('#confirmProperty').click();for(const[id,n]of [['confirmBeds',3],['confirmBaths',2],['confirmCars',1]])await fill(id,n);await page.locator('#saveDwellingProfile').click();await ready();
    p=(await snapshot()).property;assert.equal(p.identityEvidence.status,'matched');assert.ok(p.area>0);if(p.sourceMeta.serverApi){assert.equal(p.propertyScopeStatus,'associated-parcel');assert.ok(p.parcelAssociations.some(x=>String(x.cadid)===String(p.sourceMeta.cadid)),'Server-verified parcel must retain the address-associated cadastral identity');}else assert.ok(p.parcelGeometry?.rings?.length);assert.ok(p.planning.zone,'Missing zoning remains a live acceptance failure, not invented evidence');
    const timing={suggestionsIncludingDebounceMs:suggestionsMs,selectionToIdentityMs:identityMs,selectionToAllEvidenceMs:Date.now()-selected,...p.sourceMeta.timing};
    if(addressCase==='new-street'){assert.deepEqual(errors,[]);await capture('passport');results.push({label,pass:true,property:p,timing,requests,sampleNote:'One observed journey, not p95. Warm source cache may already exist.'});console.log('PASS '+label+' exact official direction, parcel and planning');continue}
    assert.equal(String(p.lot),'46');assert.equal(p.planning.instrument,'Manly Local Environmental Plan 2013');assert.match(p.planning.zone,/^R1\b/);assert.equal(p.planning.fsr,'0.6:1');
    await(await reveal('#passportPathways [data-goal="develop"]')).click();await page.locator('#developGrid [data-dev="duplex"]').click();await page.locator('#scopeConfiguration').selectOption('two-storey-basement');
    for(const[id,n]of [['feas-landValue',3500000],['feas-salePerDwelling',4000000],['feas-landDebt',1500000]])await fill(id,n);
    assert.equal(await page.locator('#feasibilityAdvanced').evaluate(n=>n.open),false);assert.equal(await page.locator('#workingValues input[data-money]').evaluateAll(nodes=>nodes.filter(n=>!n.closest('details')).length),3);await capture('three-input-form');
    await page.locator('#runAssessment').click();let state=await snapshot(),f=state.assessment.feas,c=state.assessment.cost;assert.notEqual(f.status,'review',f.reason);assert.equal(f.acquisition,null);near(f.ownerFinancialPosition.currentEquity,2000000);near(f.grv,8000000);near(f.taxSensitivity,0);assert.equal(f.resultBasis,'pretax');
    assert.equal(f.costReconciliation.filter(x=>x.key==='landOpportunity').length,1);assert.equal(f.costReconciliation.some(x=>x.key==='acquisitionCosts'||x.key==='landPurchase'),false);near(f.costReconciliation.reduce((n,x)=>n+x.amount,0),f.total);near(f.profit,8000000-f.total);near(f.profitOnGrv,f.profit/8000000);near(f.profitOnCost,f.profit/f.total);near(c.areaBreakdown.aboveGround+c.areaBreakdown.basement,state.scope.gfa);
    near(f.ownerFinancialPosition.completionEquity,8000000-f.financeSchedule.debtAtCompletion);near(f.ownerFinancialPosition.equityCreated,f.profit);near(f.financeSchedule.rows.reduce((n,x)=>n+x.interest,0),f.finance);near(f.selling,176000);
    const primary=await page.locator('#consumerResult #workingFeasibility').innerText();assert.match(primary,/Is the development financially worthwhile/);assert.match(primary,/What could your financial position look like/);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await capture('owner-assessment');
    const ledger=await page.locator('#consumerResult #workingFeasibility').textContent();await page.locator('#toRoadmap').click();assert.equal(await page.locator('#roadmapList .roadStep').count(),4);await page.locator('#toReport').click();assert.equal(await page.locator('#reportContent #workingFeasibility').textContent(),ledger);
    await(await reveal('#saveProjectNow')).click();assert.match(await page.locator('#projectSaveStatus').innerText(),/Saved and read back/);const saved=(await snapshot()).scope;
    await page.reload();await(await reveal('[data-reopen-project]')).click();assert.deepEqual((await snapshot()).scope,saved);assert.equal((await snapshot()).property.planning.savedSnapshot,true);await page.locator('#retryPlanningEvidence').click();await ready();await(await reveal('#reassessProject')).click();await ready();await page.locator('#runAssessment').click();near((await snapshot()).assessment.feas.total,f.total);
    await page.locator('#editScope').click();await(await reveal('#feas-exit')).selectOption('retain');await page.locator('#runAssessment').click();const hold=(await snapshot()).assessment.feas;assert.equal(hold.selling,0);assert.equal(hold.profit,null);assert.equal(hold.ownerFinancialPosition.saleNetProceeds,null);near(hold.ownerFinancialPosition.equityCreated,hold.holdModel.unrealisedSurplus);await capture('retain');assert.deepEqual(errors,[]);
    results.push({label,pass:true,timing,scope:state.scope,assessment:f,hold,requests,sampleNote:'Founder money inputs; default displayed scope is a modelling assumption, not approved design.'});console.log('PASS '+label+' owner profit/equity/funding, report, saved inputs and retain');
   }catch(e){results.push({label,pass:false,error:e.stack,state:await snapshot().catch(()=>null),requests,errors});console.error('FAIL '+label+': '+e.stack);await capture('failure').catch(()=>{})}finally{await page.close()}
  }await browser.close();
 }
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));if(results.some(x=>!x.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{if(server)server.close()});
