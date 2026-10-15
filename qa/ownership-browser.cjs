'use strict';
// Labelled fixture UI/financial journeys only. No live property acceptance claim.
const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const supported=require('./fixtures/supported-pathway.cjs');
const out=path.join(__dirname,'../qa-artifacts/ownership');
const server=process.env.SITEPIVOT_URL?null:require('./founder-server.cjs').createServer();
const near=(a,b,label)=>assert.ok(Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<.02,`${label}: ${a} != ${b}`);
const acquisition={purchasePrice:3500000,deposit:350000,cashContribution:1050000,loanAmount:2450000,annualRate:.08,legal:4000,dueDiligence:3000,otherCosts:2000};
const notes='Synthetic QA professional finding, 15 October 2026: investigate design and DA; no consent or lender approval established.';
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 if(server)await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const url=new URL(process.env.SITEPIVOT_URL||`http://127.0.0.1:${server.address().port}/`);url.searchParams.set('fixtures','1');
 const results=[];
 for(const engine of [chromium,webkit]){
  let browser;
  try{browser=await engine.launch()}catch(e){results.push({engine:engine.name(),pass:false,phase:'browser-launch',error:e.stack});console.error(e.stack);continue}
  for(const width of [390,1280])for(const role of ['owner','buyer']){
   const page=await browser.newPage({viewport:{width,height:width<500?844:900},isMobile:width<500,hasTouch:width<500});page.setDefaultTimeout(30000);
   const errors=[],consoleErrors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
   const label=`${engine.name()}-${width}-${role}`,capture=name=>page.screenshot({path:path.join(out,`${label}-${name}.png`),fullPage:true});
   const snapshot=()=>page.evaluate(()=>({ownershipRole:SitePivot.app.ownershipRole,scope:SitePivot.app.scope,property:SitePivot.app.property,assessment:SitePivot.app.assessment,professionalFindings:SitePivot.app.professionalFindings}));
   async function reveal(selector){const el=page.locator(selector);await el.waitFor({state:'attached'});const parents=el.locator('xpath=ancestor::details');for(let i=await parents.count()-1;i>=0;i--){const d=parents.nth(i);if(!await d.evaluate(n=>n.open))await d.locator(':scope > summary').click()}return el}
   async function fill(id,value){const el=await reveal('#'+id);await el.fill(String(value));await el.blur()}
   async function select(id,value){await(await reveal('#'+id)).selectOption(value)}
   async function overflow(){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'No horizontal overflow')}
   async function roleInputs(){
    const s=await snapshot();assert.equal(s.ownershipRole,role);assert.equal(s.scope.gfa,600);assert.equal(s.scope.gfaSource,'user');assert.equal(s.scope.configuration,'three-level-basement');
    assert.equal(s.scope.salePerDwelling,4000000);assert.equal(s.scope.contributions,30000);
    assert.equal(await page.locator('#scopeGfa').inputValue(),'600');
    if(role==='buyer'){
     for(const [key,value]of Object.entries(acquisition))near(s.scope.acquisition[key],value,'Retained acquisition '+key);
     assert.equal(await page.locator('#feas-landValue').count(),0);assert.equal(await page.locator('#feas-landDebt').count(),0);
     assert.doesNotMatch(await page.locator('#scopeFields').innerText(),/Working current property \/ land value|Existing land mortgage \/ debt/);
    }else{assert.equal(s.scope.landValue,3500000);assert.equal(s.scope.landDebt,1000000);assert.equal(await page.locator('#acquisitionInputs').count(),0)}
   }
   function check(s){
    const {cost:c,feas:f}=s.assessment;assert.ok(c.mid>0,'Cost must be available');assert.ok(Number.isFinite(f.total)&&f.total>0,'Financial result must be available');
    assert.equal(f.ownershipRole,role);assert.equal(f.decisionReady,false,'Synthetic working scenario must not become a final investment decision');
    near(f.grv,8000000,'Two-home GRV');near(f.site,3500000,'Role-specific site amount');near(f.total,f.costReconciliation.reduce((n,l)=>n+l.amount,0),'Economic cost ledger');near(f.profit,f.grv-f.total,'Economic profit');
    assert.equal(c.liftCount,2);assert.equal(c.poolCount,2);near(c.areaBreakdown.basement,150,'Automatic four-level basement split');
    for(const band of ['low','mid','high'])near(c.components.reduce((n,l)=>n+l[band],0),c[band],band+' delivered ledger');
    for(const key of ['lifts','pool'])assert.equal(c.components.filter(l=>l.key===key).length,1,key+' allowance counted once');
    assert.equal(f.costReconciliation.filter(l=>l.key===(role==='buyer'?'landPurchase':'landOpportunity')).length,1);
    assert.equal(f.costReconciliation.some(l=>/deposit|principal/i.test(l.key)),false,'Deposit/principal are not added as project expenses');
    near(f.financeSchedule.rows.reduce((n,r)=>n+r.equityContribution,0),f.cashFunding.peakCashRequirement,'Cash funding ledger');
    if(role==='buyer'){
     for(const [key,value]of Object.entries(acquisition))near(f.acquisition[key],value,'Buyer assessment '+key);
     near(f.cashFunding.depositCash,350000,'Deposit included in purchase cash');near(f.cashFunding.purchaseCash,1050000,'Purchase cash');near(f.financeSchedule.acquisitionBorrowing,2450000,'Acquisition borrowing');
     near(f.cashFunding.settlementCash,700000+f.acquisition.acquisitionCosts,'Settlement excludes already counted deposit');
     assert.equal(f.costReconciliation.some(l=>l.key==='landOpportunity'),false);near(f.landOpportunityCost,0,'No retained owner land opportunity cost');
    }else{assert.equal(f.acquisition,null);near(f.assumptions.landDebt,1000000,'Owner existing debt');assert.equal(f.costReconciliation.some(l=>l.key==='landPurchase'||l.key==='acquisitionCosts'),false)}
    return f;
   }
   try{
    await page.goto(url.href);assert.equal(await page.locator('#addressSearch').isDisabled(),true);assert.equal(await page.locator('#addressContinue').isDisabled(),true);
    await page.locator(`[data-ownership="${role}"]`).click();assert.equal(await page.locator('#addressSearch').isEnabled(),true);assert.equal(await page.locator(`[data-ownership="${role}"]`).getAttribute('aria-pressed'),'true');
    assert.match(await page.locator('#fixtureTools').innerText(),/QA test fixtures/);
    await page.locator('[data-sample="fairlight"]').click();await page.locator('#confirmProperty').click();await page.locator('#view-passport.active').waitFor();
    const fixture=await page.evaluate(()=>SitePivot.app.property);assert.equal(!!fixture.live,false,'Labelled fixture, never a live identity');
    // Seed only the existing explicit synthetic planning fixture; financial inputs
    // and all navigation below use real controls.
    const seeded=supported(JSON.parse(JSON.stringify(fixture)));
    await page.evaluate(planning=>{SitePivot.app.property.planning=planning},seeded.planning);
    await(await reveal('#passportPathways [data-goal="develop"]')).click();await page.locator('#developGrid [data-dev="duplex"]').click();await page.locator('#view-scope.active').waitFor();
    const starter=Number(await page.locator('#scopeGfa').inputValue());await select('scopeConfiguration','two-storey-basement');
    assert.match(await page.locator('#configurationHint').innerText(),/3 total levels/);near(Number(await page.locator('#scopeGfa').inputValue()),starter*1.5,'Starter floor area follows levels');
    await fill('scopeGfa',600);await select('scopeConfiguration','three-level-basement');assert.equal(await page.locator('#scopeGfa').inputValue(),'600');assert.match(await page.locator('#configurationHint').innerText(),/4 total levels/);
    await fill('scopeDwellings',2);await select('scopeQuality','premium');await fill('feas-salePerDwelling',4000000);await fill('feas-contributions',30000);
    if(role==='buyer')for(const [key,value]of Object.entries(acquisition))await fill('acq-'+key,key==='annualRate'?value*100:value);
    else{await fill('feas-landValue',3500000);await fill('feas-landDebt',1000000)}
    await select('scopeLiftChoice','2');await select('scopePoolConfiguration','per-dwelling');await fill('scopePoolLength',8);await fill('scopePoolWidth',4);await fill('scopePoolDepth',1.5);
    await roleInputs();await overflow();await capture('inputs');await page.locator('#runAssessment').click();await page.locator('#view-assessment.active').waitFor();
    const original=await snapshot(),f=check(original);assert.match(await page.locator('#consumerResult').innerText(),/Working project feasibility/);
    if(role==='buyer'){assert.match(await page.locator('#consumerResult').innerText(),/Buyer acquisition and project funding/);assert.doesNotMatch(await page.locator('#consumerResult').innerText(),/Retained land\/current-property opportunity value|Owner project funding/)}
    await overflow();await capture('assessment');
    await page.locator('#editScope').click();await roleInputs();await page.locator('#runAssessment').click();near(check(await snapshot()).total,f.total,'Edit and rerender preserve total');
    const assessmentLedger=await page.locator('#consumerResult #workingFeasibility').textContent();
    await page.locator('#toRoadmap').click();await page.locator('#toReport').click();await page.locator('#view-report.active').waitFor();
    assert.equal(await page.locator('#reportContent #workingFeasibility').textContent(),assessmentLedger,'Complete report and assessment financial ledger parity');
    const beforeSave=await snapshot();assert.deepEqual(beforeSave.scope,original.scope,'Financial inputs preserved through report');await overflow();await capture('report');
    await fill('professionalFindings',notes);await(await reveal('#saveProjectNow')).click();assert.match(await page.locator('#projectSaveStatus').innerText(),/Saved and read back/);
    await page.reload();assert.equal(await page.locator('#addressSearch').isDisabled(),true);await(await reveal('[data-reopen-project]')).click();await page.locator('#view-passport.active').waitFor();
    const reopened=await snapshot();assert.equal(reopened.ownershipRole,role);assert.deepEqual(reopened.scope,beforeSave.scope);assert.equal(reopened.professionalFindings,notes);assert.equal(reopened.assessment,null,'Saved assessment must be recomputed');
    assert.deepEqual(reopened.property.planning,beforeSave.property.planning,'Synthetic source/provision evidence retained');assert.equal(reopened.property.lot,fixture.lot);assert.equal(reopened.property.dp,fixture.dp);
    await reveal('#projectSaveStatus');assert.match(await page.locator('#projectSaveStatus').innerText(),/recheck current planning evidence.*user supplied/i);
    await(await reveal('#reassessProject')).click();await page.locator('#view-scope.active').waitFor();await roleInputs();assert.equal(await page.locator('#professionalFindings').inputValue(),notes);
    await page.locator('#runAssessment').click();const recalculated=check(await snapshot());near(recalculated.total,f.total,'Saved/reopened calculation');near(recalculated.profit,f.profit,'Saved/reopened profit');
    await overflow();assert.deepEqual(errors,[],'No uncaught browser errors');assert.deepEqual(consoleErrors,[],'No console errors');await capture('reopened-assessment');
    results.push({engine:engine.name(),width,role,pass:true,fixtureOnly:true,syntheticPlanning:true,financialInputs:original.scope,assessment:original.assessment,reopened:recalculated});console.log(`PASS ownership ${label}: labelled fixture, role finance, native levels, lift/pool, report and save/reopen`);
   }catch(e){results.push({engine:engine.name(),width,role,pass:false,fixtureOnly:true,error:e.stack,pageErrors:errors,consoleErrors,state:await snapshot().catch(()=>null)});console.error(`FAIL ownership ${label}: ${e.stack}`);await capture('failure').catch(()=>{})}
   finally{await page.close()}
  }
  await browser.close();
 }
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));if(server)await new Promise(r=>server.close(r));if(results.some(x=>!x.pass))process.exitCode=1;
})().catch(e=>{console.error(e);if(server)server.close();process.exitCode=1});
