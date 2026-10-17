'use strict';
// Synthetic planning controls exercise the interactive rendered journey. Real
// parcel identity and planning evidence remain the separate deployed live gate.
const {chromium,webkit}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const supported=require('./fixtures/supported-pathway.cjs');
const folder=path.join(__dirname,'../qa-artifacts/fsr-buyer');fs.mkdirSync(folder,{recursive:true});
const server=process.env.SITEPIVOT_URL?null:require('./founder-server.cjs').createServer();
const near=(a,b)=>assert.ok(Math.abs(a-b)<.01,`${a} ≠ ${b}`);
(async()=>{
 if(server)await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=process.env.SITEPIVOT_URL||`http://127.0.0.1:${server.address().port}/`,results=[];
 for(const engine of [chromium,webkit]){
  const browser=await engine.launch();
  for(const width of [390,1280])for(const role of ['owner','buyer']){
   const label=`${engine.name()}-${width}-${role}`,page=await browser.newPage({viewport:{width,height:width===390?844:900},isMobile:width===390,hasTouch:width===390});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   try{
    await page.goto(base+'?fixtures=1');
    const fixture=supported(JSON.parse(JSON.stringify(await page.evaluate(()=>SitePivot.FIXTURES[0]))));
    fixture.address='43 Hope Street, Seaforth NSW 2092 [synthetic scenario]';fixture.area=575.3;fixture.lga='Northern Beaches Council';fixture.suburb='Seaforth';fixture.planning.fsr='0.5:1';fixture.planning.pathwayEvidence.address=fixture.address;fixture.planning.pathwayEvidence.area=575.3;
    await page.evaluate(({fixture,role})=>{const a=SitePivot,p=fixture;p.planning.fsrEvidence=SitePivotFSR.resolve({records:[{attributes:{FSR:.5,EPI_NAME:p.planning.instrument},geometry:{rings:[[[0,0],[20,0],[20,30],[0,30],[0,0]]],spatialReference:{wkid:28356}}}],parcelGeometry:{rings:[[[0,0],[20,0],[20,30],[0,30],[0,0]]],spatialReference:{wkid:28356}},parcelResolved:true,queryComplete:true,source:'Synthetic FSR regression',checkedAt:'2026-10-17T00:00:00Z'});a.app.ownershipRole=role;a.selectProperty(p);a.app.goal='develop';a.app.devType='duplex';a.show('scope')},{fixture,role});
    assert.equal(await page.locator('#scopeGfa').getAttribute('value'),'258.9');near(await page.evaluate(()=>SitePivot.app.scope.gfa),258.885);
    assert.match(await page.locator('#areaPlanningSummary').innerText(),/287.7/);
    await page.locator('#scopeConfiguration').selectOption('two-storey-basement');
    let first=await page.evaluate(()=>SitePivot.projectCost());near(first.areaBreakdown.aboveGround,258.885);near(first.areaBreakdown.basement,129.4425);
    await page.locator('#scopeConfiguration').selectOption('three-level-basement');
    let next=await page.evaluate(()=>SitePivot.projectCost());near(next.areaBreakdown.aboveGround,258.885);near(next.areaBreakdown.basement,86.295);assert.notEqual(next.mid,first.mid);
    await page.locator('#scopeConfiguration').selectOption('two-storey-basement');
    if(role==='buyer'){
     await page.locator('#acq-purchasePrice').fill('3200000');await page.locator('#feas-salePerDwelling').fill('4000000');
    }else{
     for(const [id,v] of [['feas-landValue','3500000'],['feas-salePerDwelling','4000000'],['feas-landDebt','1500000']])await page.locator('#'+id).fill(v);
    }
    await page.locator('#runAssessment').click();const state=await page.evaluate(()=>({feas:SitePivot.app.assessment.feas,cost:SitePivot.app.assessment.cost,scope:SitePivot.app.scope}));
    assert.notEqual(state.feas.status,'review',state.feas.reason);assert.equal(state.feas.decisionReady,false);near(state.feas.grv,8000000);
    near(state.cost.areaBreakdown.aboveGround,258.885);near(state.cost.areaBreakdown.basement,129.4425);
    assert.ok(state.feas.contributions.amount>0);assert.equal(state.feas.contributions.decisionReady,false);
    const rendered=await page.locator('#consumerResult').innerText();assert.match(rendered,/Mapped statutory GFA capacity/);assert.match(rendered,/Basement constructed area/);assert.match(rendered,/development profit|economic surplus/i);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'No horizontal overflow');
    await page.screenshot({path:path.join(folder,label+'-assessment.png'),fullPage:true});
    await page.locator('#toRoadmap').click();await page.locator('#toReport').click();assert.match(await page.locator('#reportContent').innerText(),/Mapped statutory GFA capacity/);
    assert.deepEqual(errors,[]);results.push({label,pass:true,totalConstructedArea:state.scope.gfa,aboveGround:state.cost.areaBreakdown.aboveGround,basement:state.cost.areaBreakdown.basement,contributions:state.feas.contributions.amount,profit:state.feas.profit});console.log('PASS '+label+' mapped FSR, distinct basement cost, conditional feasibility and report');
   }catch(e){results.push({label,pass:false,error:e.stack,errors});console.error('FAIL '+label+' '+e.stack);await page.screenshot({path:path.join(folder,label+'-failure.png'),fullPage:true}).catch(()=>{})}finally{await page.close()}
  }await browser.close();
 }
 fs.writeFileSync(path.join(folder,'results.json'),JSON.stringify(results,null,2));if(results.some(r=>!r.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{if(server)server.close()});
