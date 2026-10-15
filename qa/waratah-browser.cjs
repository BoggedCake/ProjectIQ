'use strict';
// Permanent founder acceptance journey: real address, real source responses, no fixtures/routes.
// Founder scope and dollar inputs are user assumptions, never property facts.
const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.join(__dirname,'../qa-artifacts/waratah');
const server=process.env.SITEPIVOT_URL?null:require('./founder-server.cjs').createServer();
const near=(a,b,label)=>assert.ok(Number.isFinite(a)&&Math.abs(a-b)<.02,`${label}: ${a} != ${b}`);
const money=n=>new Intl.NumberFormat('en-AU',{style:'currency',currency:'AUD',maximumFractionDigits:0}).format(n);
const notes='Founder working scope: 420 m² above ground plus 210 m² basement; premium duplex, two lifts and two pools. Areas and sale values require professional verification.';
(async()=>{
 fs.mkdirSync(out,{recursive:true});if(server)await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const url=new URL(process.env.SITEPIVOT_URL||`http://127.0.0.1:${server.address().port}/`);url.searchParams.delete('fixtures');
 const results=[];
 for(const engine of [chromium,webkit]){
  let browser;try{browser=await engine.launch()}catch(e){console.error(`FAIL Waratah ${engine.name()} browser launch: ${e.message}`);for(const width of [390,1280])results.push({engine:engine.name(),width,pass:false,phase:'browser-launch',error:e.stack});continue}
  for(const width of [390,1280]){
   const page=await browser.newPage({viewport:{width,height:width<500?844:900},isMobile:width<500,hasTouch:width<500});page.setDefaultTimeout(45000);
   const label=`${engine.name()}-${width}`,errors=[],lookupAttempts=[];page.on('pageerror',e=>errors.push(e.message));
   const capture=name=>page.screenshot({path:path.join(out,`${label}-${name}.png`),fullPage:true});
   const snapshot=()=>page.evaluate(()=>({ownershipRole:SitePivot.app.ownershipRole,property:SitePivot.app.property,scope:SitePivot.app.scope,assessment:SitePivot.app.assessment,professionalFindings:SitePivot.app.professionalFindings}));
   async function reveal(selector){const el=page.locator(selector);await el.waitFor({state:'attached'});const parents=el.locator('xpath=ancestor::details');for(let i=await parents.count()-1;i>=0;i--){const d=parents.nth(i);if(!await d.evaluate(n=>n.open))await d.locator(':scope > summary').click()}return el}
   async function fill(id,value){const el=await reveal('#'+id);await el.fill(String(value));await el.blur()}
   async function select(id,value){await(await reveal('#'+id)).selectOption(value)}
   async function ready(){await page.waitForFunction(()=>{const p=SitePivot.app.property;return p&&!p.planning.loading&&!p.planning.savedSnapshot&&SitePivotPlanning.assess(p,{type:'duplex'}).readyForPreliminaryCosting===true},{},{timeout:90000})}
   function planning(p){
    assert.equal(p.live,true);assert.equal(!!p.generic,false);assert.match(p.address,/19\s+WARATAH.*BALGOWLAH/i);
    assert.equal(String(p.lot),'46');assert.equal(String(p.dp).replace(/\D/g,''),'9860');assert.ok(Math.abs(p.area-559.4)<.5,`cadastral area ${p.area}`);
    assert.match(p.planning.zone,/^R1\b/);assert.equal(p.planning.instrument,'Manly Local Environmental Plan 2013');assert.equal(p.planning.fsr,'0.6:1');assert.match(String(p.planning.height),/8\.5/);
    assert.equal(p.planning.fsrEvidence.state,'mapped');assert.ok(p.sourceMeta.checkedAt,'Source check timestamp retained');
    const heritage=p.planning.councilEvidence?.heritage;
    // When available, identify the mapped street-tree item and its tiny boundary overlap.
    // An unavailable council source remains unknown; never substitute a listed-house claim.
    if(heritage?.complete){const item=heritage.records.find(r=>JSON.stringify(r).includes('I27'));assert.ok(item,'Actual I27 heritage source record');assert.match(JSON.stringify(item),/street trees/i);assert.equal(item.relationship,'boundary-overlap-review');assert.ok(item.intersectionAreaSqm<=.01)}
    else assert.ok(heritage?.state&&!/clear|unaffected/.test(heritage.state),'Unavailable council mapping is disclosed');
   }
   function check(s){
    const {cost:c,feas:f}=s.assessment;assert.equal(s.ownershipRole,'buyer');assert.equal(s.scope.gfa,630);assert.equal(s.scope.gfaSource,'user');assert.equal(s.scope.configuration,'two-storey-basement');assert.equal(s.scope.dwellings,2);assert.equal(s.scope.quality,'premium');
    near(c.areaBreakdown.aboveGround,420,'Above ground');near(c.areaBreakdown.basement,210,'Basement');assert.equal(c.liftCount,2);assert.equal(c.poolCount,2);
    assert.ok(Number.isFinite(f.total),'Live evidence supports a conditional working result');assert.equal(f.decisionReady,false);assert.equal(f.exitStrategy,'sell');near(f.grv,10000000,'Two working sale values');near(f.site,3862000,'Purchase price');
    near(f.acquisition.deposit,772400,'20% purchase equity');near(f.acquisition.cashContribution,772400,'Purchase equity includes deposit');near(f.acquisition.loanAmount,3089600,'80% acquisition loan');near(f.acquisition.annualRate,.075,'Acquisition rate');near(f.acquisition.stampDuty,193697,'Automatic 2026/27 NSW duty');
    assert.equal(f.contributions.status,'provisional');assert.ok(f.contributions.amount>0,'Contributions cannot silently become zero');near(f.selling,220000,'2% commission plus 10% GST');
    near(f.financeSchedule.interestRate,.09,'Construction finance');near(f.financeSchedule.constructionBorrowing,f.eligibleConstruction,'Eligible construction funded');assert.ok(f.eligibleConstruction<c.mid,'Soft costs not borrowed as hard construction');
    const rows=f.financeSchedule.rows;near(rows.reduce((n,r)=>n+r.constructionDraw,0),f.financeSchedule.constructionBorrowing,'Progressive draw ledger');near(rows.reduce((n,r)=>n+r.interest,0),f.finance,'Interest ledger');assert.ok(rows.filter(r=>r.constructionDraw>0).length>1,'Multiple progressive draws');
    let acquisitionBalance=3089600;for(const r of rows.filter(r=>r.phase!=='acquisition')){const acquisitionInterest=acquisitionBalance*.075/12;near(r.acquisitionInterest,acquisitionInterest,'Monthly acquisition interest');near(r.interest,(r.openingDebt-acquisitionBalance+r.constructionDraw/2)*.09/12+acquisitionInterest,'Mid-month progressive construction interest');acquisitionBalance+=acquisitionInterest}
    near(f.total,f.costReconciliation.reduce((n,r)=>n+r.amount,0),'Project ledger');near(f.profit,f.grv-f.total,'Profit');near(f.profitOnCost,f.profit/f.total,'Profit on cost');near(f.profitOnGrv,f.profit/f.grv,'Margin');
    for(const band of ['low','mid','high']){near(c.components.reduce((n,r)=>n+r[band],0),c[band],`${band} construction ledger`);const b=f.costScenarios[band];near(b.profit,b.grv-b.total,`${band} profit`)}
    for(const key of ['pool','lifts'])assert.equal(c.components.filter(r=>r.key===key).length,1,`${key} counted once`);
    return f;
   }
   try{
    for(let attempt=1;attempt<=3;attempt++)try{
     await page.goto(url.href);assert.equal(await page.locator('#addressSearch').isDisabled(),true);await page.locator('[data-ownership="buyer"]').click();await page.locator('#addressSearch').fill('19 Waratah Street Balgowlah NSW 2093');
     await page.locator('[data-live-index]').filter({hasText:/19\s+WARATAH.*BALGOWLAH/i}).first().click();await page.locator('#view-property.active').waitFor();await page.locator('#confirmProperty').click();await page.locator('#saveDwellingProfile').waitFor();
     for(const [id,n]of [['confirmBeds',3],['confirmBaths',2],['confirmCars',1]])await fill(id,n);await page.locator('#saveDwellingProfile').click();await ready();planning((await snapshot()).property);lookupAttempts.push({attempt,pass:true});break;
    }catch(e){lookupAttempts.push({attempt,pass:false,error:e.message});await capture(`lookup-${attempt}`).catch(()=>{});if(attempt===3)throw e}
    const property=(await snapshot()).property;await capture('actual-property');
    await(await reveal('#passportPathways [data-goal="develop"]')).click();await page.locator('#developGrid [data-dev="duplex"]').click();await page.locator('#view-scope.active').waitFor();
    assert.equal(await page.locator('#acquisitionAdvanced').evaluate(n=>n.open),false,'Advanced acquisition starts collapsed');assert.equal(await page.locator('#acq-depositPct').inputValue(),'.2');
    // Only the purchase price is entered: no equity, loan or duty overrides.
    await fill('acq-purchasePrice',3862000);assert.equal(await page.locator('#acquisitionAdvanced').evaluate(n=>n.open),false);assert.match(await page.locator('#acquisitionSummary').innerText(),/772,400.*3,089,600/);
    assert.equal(await page.locator('#feas-landValue').count(),0);assert.equal(await page.locator('#feas-landDebt').count(),0);
    await select('scopeConfiguration','two-storey-basement');await fill('scopeGfa',630);await fill('scopeBasementArea',210);await fill('scopeDwellings',2);await select('scopeQuality','premium');await fill('feas-salePerDwelling',5000000);
    await select('scopeLiftChoice','2');await select('scopeLiftAllocation','both');await select('scopePoolConfiguration','per-dwelling');await fill('scopePoolLength',8);await fill('scopePoolWidth',4);await fill('scopePoolDepth',1.5);await select('scopePoolType','concrete');await(await reveal('#scopePoolHeating')).uncheck();
    await capture('founder-assumptions');await page.locator('#runAssessment').click();await page.locator('#view-assessment.active').waitFor();const original=await snapshot(),f=check(original);
    const text=await page.locator('#consumerResult').innerText();for(const n of [f.grv,f.total,f.profit])assert.ok(text.includes(money(n)),`Visible result ${money(n)}`);assert.match(text,/provisional|conditional/i);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');await capture('assessment');
    const ledger=await page.locator('#consumerResult #workingFeasibility').textContent();await page.locator('#toRoadmap').click();assert.equal(await page.locator('#roadmapList .roadStep').count(),4);const titles=await page.locator('#roadmapList .roadStep strong').allTextContents();assert.deepEqual(titles,['Planning and site verification','Concept design and construction pricing','Acquisition and financial feasibility','Due diligence and decision']);await capture('roadmap');
    await page.locator('#toReport').click();await page.locator('#view-report.active').waitFor();assert.equal(await page.locator('#reportContent #workingFeasibility').textContent(),ledger,'Assessment/report financial parity');assert.equal(await page.locator('#reportContent .suggestedSequence > li').count(),4);await capture('report');
    await fill('professionalFindings',notes);await(await reveal('#saveProjectNow')).click();assert.match(await page.locator('#projectSaveStatus').innerText(),/Saved and read back/);const saved=await snapshot();
    await page.reload();await(await reveal('[data-reopen-project]')).click();await page.locator('#view-passport.active').waitFor();const reopened=await snapshot();assert.deepEqual(reopened.scope,saved.scope);assert.equal(reopened.professionalFindings,notes);assert.equal(reopened.assessment,null);assert.equal(reopened.property.planning.savedSnapshot,true,'Live saved evidence requires recheck');assert.equal(reopened.property.planning._sourceUnavailable,true);
    await capture('reopened-snapshot');await page.locator('#retryPlanningEvidence').click();await ready();planning((await snapshot()).property);
    await(await reveal('#reassessProject')).click();await page.locator('#view-scope.active').waitFor();await ready();await page.locator('#runAssessment').click();const recalculated=check(await snapshot());near(recalculated.total,f.total,'Reopened total');near(recalculated.profit,f.profit,'Reopened profit');await capture('reopened-assessment');
    await page.locator('#editScope').click();await select('acq-exit','retain');await page.locator('#runAssessment').click();const hold=(await snapshot()).assessment.feas;assert.equal(hold.exitStrategy,'retain');for(const k of ['selling','marketing','saleLegal','saleSettlement','disposalCosts','taxSensitivity'])assert.equal(hold[k],0,`Retain ${k}`);assert.equal(hold.profit,null);assert.equal(hold.cashFunding.netSaleProceeds,null);assert.equal(hold.financeSchedule.repaymentAtSettlement,0);near(hold.holdModel.completedValue,10000000,'Hold completed value');assert.ok(hold.holdModel.debtAtCompletion>3089600);near(hold.holdModel.equityAtCompletion,10000000-hold.holdModel.debtAtCompletion,'Hold equity');assert.match(await page.locator('#consumerResult').innerText(),/Hold and refinance scenario/);await capture('retain');assert.deepEqual(errors,[]);
    const state={original,saved,reopened,recalculated,hold};fs.writeFileSync(path.join(out,`${label}-state.json`),JSON.stringify(state,null,2));results.push({engine:engine.name(),width,pass:true,actualProperty:true,property,lookupAttempts,assumptions:notes,assessment:f,hold});console.log(`PASS Waratah ${label}: real parcel, buyer price-only, founder scope, finance, roadmap/report, save/recheck and retain`);
   }catch(e){const state=await snapshot().catch(()=>null);fs.writeFileSync(path.join(out,`${label}-state.json`),JSON.stringify(state,null,2));results.push({engine:engine.name(),width,pass:false,actualProperty:true,error:e.stack,pageErrors:errors,lookupAttempts,state});console.error(`FAIL Waratah ${label}: ${e.stack}`);await capture('failure').catch(()=>{})}finally{await page.close()}
  }await browser.close();
 }fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));if(server)await new Promise(r=>server.close(r));if(results.some(r=>!r.pass))process.exitCode=1;
})().catch(e=>{console.error(e);if(server)server.close();process.exitCode=1});
