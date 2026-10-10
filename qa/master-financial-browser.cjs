'use strict';
const {chromium,webkit}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),out=path.join(root,'qa-artifacts/financial');fs.mkdirSync(out,{recursive:true});
// Both local and deployed runs intentionally use labelled regression property fixtures.
// This exercises deployed UI arithmetic, not live property evidence or lender approval.
const deployed=!!process.env.SITEPIVOT_URL,server=deployed?null:require('./founder-server.cjs').createServer();
const monthly=(principal,rate,years)=>principal*(rate/12)/(1-Math.pow(1+rate/12,-years*12));
const near=(actual,expected,label)=>assert.ok(Number.isFinite(actual)&&Math.abs(actual-expected)<.01,`${label}: ${actual} != ${expected}`);
(async()=>{
 if(server)await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const url=new URL(process.env.SITEPIVOT_URL||`http://127.0.0.1:${server.address().port}/`);url.searchParams.set('fixtures','1');
 const results=[];
 for(const engine of [chromium,webkit]){
  let browser;
  try{browser=await engine.launch()}catch(e){results.push({engine:engine.name(),pass:false,error:e.stack});console.error(e.stack);continue}
  for(const width of [390,1280]){
   const page=await browser.newPage({viewport:{width,height:width<500?844:900},isMobile:width<500,hasTouch:width<500}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(30000);
   const capture=async name=>page.screenshot({path:path.join(out,`${engine.name()}-${width}-${name}.png`),fullPage:true});
   const fill=async(id,value)=>{await page.locator('#'+id).fill(String(value));await page.locator('#'+id).blur()};
   const snapshot=()=>page.evaluate(()=>({goal:SitePivot.app.goal,scope:SitePivot.app.scope,assessment:SitePivot.app.assessment}));
   const open=async selector=>{const details=page.locator(selector);if(!await details.evaluate(el=>el.open))await details.locator(':scope > summary').click()};
   const checkChangeover=s=>{
    const c=s.assessment.comparison;
    assert.equal(c.status,'indicative');assert.equal(c.transactionCosts,252287);assert.equal(c.availableEquity,720000);
    assert.equal(c.replacementExpenditure,3472287);assert.equal(c.replacementFunding,2752287);assert.equal(c.capitalNeededAfterLoan,2752287);
    assert.equal(c.changeover.duty,162787);assert.equal(c.changeover.sellingCosts,80000);
   };
   const checkFacts=s=>{assert.equal(s.scope.moveSale,2700000);assert.equal(s.scope.targetPurchase,3300000);assert.equal(s.scope.moveLoanBalance,1900000);assert.equal(s.scope.moveContractDate,'2026-10-10');assert.equal(s.scope.residentialFunding.existingBalance,1900000);assert.equal(s.scope.residentialFunding.existingTermYears,25);assert.equal(s.scope.residentialFunding.termYears,30);assert.equal(s.scope.residentialFunding.monthlyRent,4000);assert.equal(s.scope.residentialFunding.accommodationMonths,12)};
   try{
    await page.goto(url.href);
    assert.match(await page.locator('#fixtureTools').innerText(),/QA test fixtures/);
    await page.locator('[data-sample="fairlight"]').click();await page.locator('#confirmProperty').click();
    assert.equal(await page.evaluate(()=>!!SitePivot.app.property.live),false);
    await page.locator('#assistantInput').fill('I want to add another level.');await page.locator('#assistantSend').click();
    await page.locator('#confirmIntent').click();await page.locator('#view-scope.active').waitFor();
    assert.equal((await snapshot()).goal,'storey');
    await page.locator('[data-room="bedroom"]').check();await fill('roomCount-bedroom',2);
    await page.locator('[data-room="bathroom"]').check();await fill('roomCount-bathroom',1);
    await page.locator('#compareMove').check();
    await fill('moveSale',2700000);await fill('targetPurchase',3300000);await fill('moveLoanBalance',1900000);
    await open('#moveFields details');await fill('moveContractDate','2026-10-10');
    // Confirm all founder transaction allowances through their actual editable inputs.
    for(const [id,value]of Object.entries({moveMarketing:10000,moveSaleLegal:2000,moveDischarge:500,movePurchaseLegal:3000,moveSearches:500,movingCosts:5000,moveBuildingPest:1000,moveSellingPct:2.5}))await fill(id,value);
    for(const id of ['moveFinance','moveHolding','replacementProjectCost'])assert.equal(await page.locator('#'+id).inputValue(),'$0');
    await open('#residentialFunding');
    for(const [id,value]of Object.entries({'res-existingBalance':1900000,'res-existingRate':6.15,'res-annualRate':6.15,'res-existingTermYears':25,'res-termYears':30,'res-monthlyRent':4000,'res-accommodationMonths':12,'res-constructionMonths':12}))await fill(id,value);
    await capture('entered-regression-fixture');await page.locator('#runAssessment').click();
    let state=await snapshot();checkChangeover(state);checkFacts(state);
    const f=state.assessment.residentialFinance,r=state.assessment.replacementFinance;
    assert.equal(f.status,'indicative');assert.equal(r.status,'indicative');assert.ok(state.assessment.cost.mid>0);
    near(f.currentMonthlyRepayment,monthly(1900000,.0615,25),'current 25-year repayment');
    near(f.monthlyRepayment.total,monthly(1900000,.0615,25)+monthly(f.funding.newBorrowing,.0615,30),'split loan monthly repayment');
    near(r.monthlyRepayment.total,monthly(2752287,.0615,30),'replacement 30-year repayment');
    assert.equal(f.accommodationCost,48000);assert.ok(f.financeCost>0);near(state.assessment.comparison.costs.keepFinance,f.financeCost,'comparison uses shared finance');near(state.assessment.comparison.costs.keepHolding,f.holdingCost+f.accommodationCost,'comparison uses shared living costs');assert.equal(state.assessment.comparison.comparisonComplete,true);
    near(f.incrementalProjectCost,state.assessment.cost.mid+48000+f.financeCost,'works expenditure includes accommodation and finance once');
    for(const year of [1,5,10]){assert.ok(Number.isFinite(f.projections[year].balance));assert.ok(Number.isFinite(r.projections[year].interest))}
    const text=await page.locator('#consumerResult').innerText();for(const value of ['$252,287','$720,000','$3,472,287','$2,752,287','$48,000'])assert.ok(text.includes(value),value);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal mobile overflow');await capture('assessment');
    // Edit a supplied allowance, rerender, and verify it changes only the expected totals.
    await page.locator('#editScope').click();await open('#moveFields details');await fill('moveMarketing',11000);await page.locator('#runAssessment').click();
    state=await snapshot();assert.equal(state.assessment.comparison.transactionCosts,253287);assert.equal(state.assessment.comparison.availableEquity,719000);assert.equal(state.assessment.comparison.replacementExpenditure,3472287);assert.equal(state.assessment.comparison.replacementFunding,2753287);
    await page.locator('#editScope').click();await open('#moveFields details');await fill('moveMarketing',10000);
    await open('#residentialFunding');assert.equal(await page.locator('#res-existingTermYears').inputValue(),'25');assert.equal(await page.locator('#res-termYears').inputValue(),'30');assert.equal(await page.locator('#res-monthlyRent').inputValue(),'$4,000');
    assert.equal(await page.locator('#moveSale').inputValue(),'$2,700,000');assert.equal(await page.locator('#moveLoanBalance').inputValue(),'$1,900,000');assert.equal(await page.locator('#roomCount-bedroom').inputValue(),'2');
    await page.locator('#runAssessment').click();checkChangeover(await snapshot());await page.locator('#toRoadmap').click();await page.locator('#toReport').click();await page.locator('#view-report.active').waitFor();
    const report=await page.locator('#reportContent').innerText();for(const value of ['$252,287','$720,000','$3,472,287','$2,752,287','$48,000'])assert.ok(report.includes(value),'report '+value);checkFacts(await snapshot());await capture('report');
    // Change objectives using navigation and the direction card, retaining entered financial facts.
    await page.locator('#view-report [data-back="roadmap"]').click();await page.locator('#view-roadmap [data-back="assessment"]').click();await page.locator('#editScope').click();await page.locator('#scopeBack').click();await page.locator('#view-goal.active [data-goal="reno"]').click();
    state=await snapshot();assert.equal(state.goal,'reno');assert.deepEqual(state.scope.rooms,{});assert.deepEqual(state.scope.renovationAreas,[]);assert.equal(state.scope.area,null);assert.equal(state.scope.moveEnabled,undefined);checkFacts(state);
    await page.locator('#compareMove').check();await open('#residentialFunding');assert.equal(await page.locator('#moveSale').inputValue(),'$2,700,000');assert.equal(await page.locator('#res-existingBalance').inputValue(),'$1,900,000');
    await page.locator('#runAssessment').click();state=await snapshot();checkChangeover(state);assert.equal(state.assessment.cost.mid,null,'cleared renovation scope must not inherit upstairs cost');assert.deepEqual(errors,[]);await capture('objective-changed');
    results.push({engine:engine.name(),width,pass:true,deployed,fixture:true,fixtureLabel:'Fairlight regression fixture; not live property evidence',transactionCosts:252287,availableEquity:720000,replacementExpenditure:3472287,replacementFunding:2752287,currentMonthlyRepayment:f.currentMonthlyRepayment,worksMonthlyRepayment:f.monthlyRepayment.total,replacementMonthlyRepayment:r.monthlyRepayment.total,accommodationCost:f.accommodationCost});
    console.log(`PASS financial ${engine.name()} ${width}: labelled regression fixture UI, entered values, repayments, edit, report and objective change`);
   }catch(e){results.push({engine:engine.name(),width,pass:false,deployed,fixture:true,error:e.stack,pageErrors:errors});console.error(e.stack);await capture('failure').catch(()=>{})}finally{await page.close()}
  }
  await browser.close();
 }
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));if(server)server.close();process.exitCode=results.some(r=>!r.pass)?1:0;
})().catch(e=>{console.error(e);if(server)server.close();process.exitCode=1});
