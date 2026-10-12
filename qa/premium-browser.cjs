'use strict';
// Actual-property regression: never inject fixture evidence or intercept planning responses.
// Run against existing Pages with SITEPIVOT_URL=https://boggedcake.github.io/ProjectIQ/.
// Without SITEPIVOT_URL, the optional founder server exercises the same real public lookup.
const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.join(__dirname,'../qa-artifacts/premium');fs.mkdirSync(out,{recursive:true});
const deployed=!!process.env.SITEPIVOT_URL,server=deployed?null:require('./founder-server.cjs').createServer();
const address='31 Seaview Street Balgowlah NSW 2093';
const money=n=>new Intl.NumberFormat('en-AU',{style:'currency',currency:'AUD',maximumFractionDigits:0}).format(n);
const near=(actual,expected,label)=>assert.ok(Number.isFinite(actual)&&Math.abs(actual-expected)<.02,`${label}: ${actual} != ${expected}`);
(async()=>{
 if(server)await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const url=new URL(process.env.SITEPIVOT_URL||`http://127.0.0.1:${server.address().port}/`);url.searchParams.delete('fixtures');
 const results=[];
 for(const engine of [chromium,webkit]){
  let browser;try{browser=await engine.launch()}catch(e){results.push({engine:engine.name(),pass:false,error:e.stack});console.error(e.stack);continue}
  for(const width of [390,1280]){
   const page=await browser.newPage({viewport:{width,height:width<500?844:900},isMobile:width<500,hasTouch:width<500});
   page.setDefaultTimeout(45000);const errors=[],lookupAttempts=[];
   page.on('pageerror',e=>errors.push(e.message));
   const capture=name=>page.screenshot({path:path.join(out,`${engine.name()}-${width}-${name}.png`),fullPage:true});
   const snapshot=()=>page.evaluate(()=>({property:SitePivot.app.property,scope:SitePivot.app.scope,assessment:SitePivot.app.assessment}));
   async function reveal(id){const control=page.locator('#'+id);await control.waitFor({state:'attached'});const parents=control.locator('xpath=ancestor::details');for(let i=await parents.count()-1;i>=0;i--){const d=parents.nth(i);if(!await d.evaluate(el=>el.open))await d.locator(':scope > summary').click()}return control}
   async function fill(id,value){const el=await reveal(id);await el.fill(String(value));await el.blur()}
   async function select(id,value){await (await reveal(id)).selectOption(value)}
   async function say(text){await page.locator('#assistantInput').fill(text);await page.locator('#assistantSend').click();return page.locator('#assistantMessages .assistant').last().innerText()}
   async function resolveProperty(){
    for(let attempt=1;attempt<=3;attempt++){
     try{
      await page.goto(url.href);await page.locator('#addressSearch').fill(address);
      const result=page.locator('[data-live-index]').filter({hasText:/31.*SEAVIEW.*BALGOWLAH/i}).first();await result.click();
      await page.locator('#view-property.active').waitFor();await page.locator('#confirmProperty').click();await page.locator('#saveDwellingProfile').waitFor();
      for(const[id,n]of [['confirmBeds',3],['confirmBaths',2],['confirmCars',1]])await fill(id,n);
      await page.locator('#saveDwellingProfile').click();
      await page.waitForFunction(()=>{const p=SitePivot.app.property;if(!p||p.planning.loading)return false;const r=SitePivotPlanning.assess(p,{type:'duplex'});return r.readyForPreliminaryCosting===true},{},{timeout:90000});
      const p=(await snapshot()).property;
      assert.equal(p.live,true,'actual live lookup required');assert.equal(!!p.generic,false,'resolved parcel required');
      assert.match(p.address,/31.*SEAVIEW.*BALGOWLAH/i);assert.ok(Math.abs(p.area-672.4)<.5,`actual parcel area ${p.area}`);
      assert.match(p.planning.zone,/^R1\b/);assert.equal(p.planning.instrument,'Manly Local Environmental Plan 2013');
      assert.equal(p.planning.fsr,'0.5:1');assert.equal(p.planning.fsrEvidence.state,'mapped');assert.match(String(p.planning.height),/8\.5/);
      lookupAttempts.push({attempt,pass:true,sourceMeta:p.sourceMeta});return p;
     }catch(e){lookupAttempts.push({attempt,pass:false,error:e.message});await capture(`lookup-attempt-${attempt}`).catch(()=>{});if(attempt===3)throw e}
    }
   }
   function check(s){
    const {cost:c,feas:f}=s.assessment;assert.equal(c.status,'conditional');assert.equal(f.status,'provisional');assert.equal(f.scenarioMode,'conditional');assert.equal(f.decisionReady,false);
    assert.equal(s.scope.gfa,600);assert.equal(s.scope.dwellings,2);assert.equal(s.scope.quality,'premium');assert.equal(s.scope.configuration,'two-storey-basement');
    near(c.areaBreakdown.aboveGround,400,'above-ground constructed area');near(c.areaBreakdown.basement,200,'basement area');
    near(f.grv,14000000,'GRV');near(f.site,5350000,'working land opportunity cost');
    assert.ok(Array.isArray(c.components)&&c.components.length>3,'component cost ledger required');
    assert.equal(new Set(c.components.map(l=>l.key)).size,c.components.length,'no duplicate construction ledger keys');
    for(const band of ['low','mid','high'])near(c.components.reduce((sum,l)=>sum+l[band],0),c[band],`${band} delivered ledger`);
    near(f.costReconciliation.reduce((sum,l)=>sum+l.amount,0),f.total,'feasibility cost ledger');near(f.grv-f.total,f.profit,'development profit');
    near(f.profit/f.total,f.profitOnCost,'profit on total cost');near(f.profit/f.grv,f.profitOnGrv,'profit on revenue');
    const bands=f.costScenarios;assert.ok(bands,'three feasibility scenarios required');
    for(const band of ['low','mid','high']){const b=bands[band];assert.equal(b.status,'provisional');assert.equal(b.scenarioMode,'conditional');near(b.delivery,c[band],`${band} delivery`);near(b.grv,14000000,`${band} GRV`);near(b.grv-b.total,b.profit,`${band} profit`);near(b.profit/b.total,b.profitOnCost,`${band} return`);near(b.profit/b.grv,b.profitOnGrv,`${band} margin`)}
    assert.ok(c.low<c.mid&&c.mid<c.high,'ordered cost uncertainty');assert.ok(bands.low.total<bands.mid.total&&bands.mid.total<bands.high.total,'ordered total project cost');assert.ok(bands.low.profit>bands.mid.profit&&bands.mid.profit>bands.high.profit,'profits reverse cost order');near(bands.mid.total,f.total,'midpoint total');
    return s;
   }
   async function visibleSummary(container='#consumerResult'){
    const el=page.locator(container),text=await el.innerText();assert.match(text,/Working project feasibility/);assert.match(text,/conditional/i);assert.match(text,/profit/i);assert.match(text,/margin|revenue/i);assert.ok(text.includes('$14,000,000'),'visible GRV');
    const f=(await snapshot()).assessment.feas;for(const value of [f.total,f.profit])assert.ok(text.includes(money(value)),`visible financial result ${money(value)}`);
    const summary=el.locator('#workingFeasibility');assert.ok(await summary.isVisible(),'main summary visible without opening detailed feasibility');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow');return text;
   }
   try{
    const property=await resolveProperty();await capture('actual-property');
    const reply=await say('Could I build a duplex here?');assert.match(reply,/conditional DA opportunity/i);await page.locator('#confirmIntent').click();await page.locator('#view-scope.active').waitFor();
    const notice=await page.locator('#developmentPathwayNotice').innerText();assert.match(notice,/Conditional/);assert.match(notice,/0\.5:1/);assert.match(notice,/8\.5/);assert.match(notice,/statutory floor area/);
    await select('scopeConfiguration','two-storey-basement');await fill('scopeGfa',600);await fill('scopeDwellings',2);await select('scopeQuality','premium');await fill('scopeBasementArea',200);
    await fill('feas-landValue',5350000);await fill('feas-salePerDwelling',7000000);
    // Retain the initial founder reproduction before checking the repaired summary.
    await capture('initial-inputs');await page.locator('#runAssessment').click();await capture('initial-reproduction-baseline');
    fs.writeFileSync(path.join(out,`${engine.name()}-${width}-baseline.json`),JSON.stringify(await snapshot(),null,2));
    await page.locator('#editScope').click();
    assert.ok(await (await reveal('feas-provisional')).isChecked(),'visible provisional working assumptions default on');
    assert.equal(await (await reveal('feas-contributions')).inputValue(),'','contribution unresolved rather than silently entered');
    assert.equal(await (await reveal('feas-landDebt')).inputValue(),'','debt remains unconfirmed');
    assert.deepEqual(await (await reveal('scopeLiftChoice')).locator('option').evaluateAll(options=>options.map(o=>o.value)),['0','1','2','custom']);
    assert.deepEqual(await (await reveal('scopeLiftAllocation')).locator('option').evaluateAll(options=>options.map(o=>o.value)),['both','first','second','custom']);
    assert.deepEqual(await (await reveal('scopePoolConfiguration')).locator('option').evaluateAll(options=>options.map(o=>o.value)),['none','shared','per-dwelling','custom']);
    await select('scopeLiftChoice','custom');const custom=await reveal('scopeLiftCount');assert.equal(await custom.getAttribute('min'),'0');assert.equal(await custom.getAttribute('max'),'10');
    await select('scopeLiftChoice','0');await select('scopePoolConfiguration','none');await capture('actual-inputs');
    await page.locator('#runAssessment').click();let baseline=check(await snapshot());
    near(baseline.assessment.feas.contributions.amount,baseline.assessment.cost.mid*.01,'provisional 1% contribution');
    assert.equal(baseline.assessment.feas.contributions.status,'provisional');
    const baselineText=await visibleSummary();assert.match(baselineText,/provisional/i);assert.match(baselineText,/debt/i);await capture('assessment');
    await page.locator('#editScope').click();await fill('feas-landDebt',0);await select('feas-financeMode','debt');
    await select('scopeLiftChoice','2');await select('scopeLiftAllocation','both');await select('scopePoolConfiguration','per-dwelling');
    await fill('scopePoolLength',8);await fill('scopePoolWidth',4);await fill('scopePoolDepth',1.5);await select('scopePoolType','concrete');await (await reveal('scopePoolHeating')).uncheck();await capture('lifts-pools-inputs');
    await page.locator('#runAssessment').click();const optional=check(await snapshot());
    assert.equal(optional.assessment.cost.liftCount,2);assert.equal(optional.assessment.cost.poolCount,2);assert.ok(optional.assessment.cost.mid>baseline.assessment.cost.mid);
    for(const [key,values]of [['lifts',optional.assessment.cost.liftValues],['pool',optional.assessment.cost.poolValues]]){const lines=optional.assessment.cost.components.filter(l=>l.key===key);assert.equal(lines.length,1,`${key} included exactly once`);for(const [i,band]of ['low','mid','high'].entries())near(lines[0][band],values[i],`${key} ${band} allowance once`)}
    assert.equal(optional.assessment.feas.assumptions.landDebt,0,'explicit actual zero is supported');await visibleSummary();await capture('lifts-pools-assessment');
    // Rerendering must never add the same selected optional work a second time.
    await page.locator('#editScope').click();await page.locator('#runAssessment').click();near((await snapshot()).assessment.cost.mid,optional.assessment.cost.mid,'optional work included once');
    await page.locator('#editScope').click();await select('scopeLiftChoice','0');await select('scopePoolConfiguration','none');await page.locator('#runAssessment').click();
    const restored=check(await snapshot());assert.equal(restored.assessment.cost.liftCount,0);assert.equal(restored.assessment.cost.poolCount,0);near(restored.assessment.cost.mid,baseline.assessment.cost.mid,'removing optional work restores delivery');await visibleSummary();
    await page.locator('#editScope').click();await select('feas-financeMode','cash');await page.locator('#runAssessment').click();const cash=check(await snapshot());assert.equal(cash.assessment.feas.finance,0,'cash mode has no borrowing interest');assert.ok(cash.assessment.feas.profit>=restored.assessment.feas.profit);await capture('cash-assessment');
    const assessmentText=await visibleSummary();await page.locator('#toRoadmap').click();await page.locator('#toReport').click();await page.locator('#view-report.active').waitFor();const reportText=await visibleSummary('#reportContent');
    assert.equal(await page.locator('#reportContent #workingFeasibility').innerText(),await page.locator('#consumerResult #workingFeasibility').innerText(),'shared report/assessment summary');
    for(const term of ['0.5:1','8.5','Conditional'])assert.ok(reportText.includes(term),`report planning ${term}`);
    assert.deepEqual(errors,[]);await capture('report');
    results.push({engine:engine.name(),width,pass:true,deployed,actualProperty:true,property,lookupAttempts,baseline:baseline.assessment,cash:cash.assessment,assessmentText,reportText});console.log(`PASS premium ${engine.name()} ${width}: actual property, conditional planning, visible feasibility, ledgers, optional works and report`);
   }catch(e){results.push({engine:engine.name(),width,pass:false,deployed,actualProperty:true,error:e.stack,pageErrors:errors,lookupAttempts,state:await snapshot().catch(()=>null)});console.error(e.stack);await capture('failure').catch(()=>{})}finally{await page.close()}
  }
  await browser.close();
 }
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));if(server)server.close();process.exitCode=results.some(r=>!r.pass)?1:0;
})().catch(e=>{console.error(e);if(server)server.close();process.exitCode=1});
