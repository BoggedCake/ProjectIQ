'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {chromium,webkit}=require('playwright'),{createServer}=require('./founder-server.cjs');
const engine=process.env.QA_BROWSER==='webkit'?webkit:chromium;
const output=path.resolve(process.env.QA_ARTIFACTS||'qa-artifacts/mobile-navigation');
test(`${engine.name()} 390px view changes cancel old scrolling and preserve normal assessment/report clicks`,async()=>{
 const server=createServer();let browser,context;
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 try{
  browser=await engine.launch({headless:true});context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await context.tracing.start({screenshots:true,snapshots:true,sources:true});
  const page=await context.newPage();page.setDefaultTimeout(3000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/?fixtures=1`);
  await page.evaluate(()=>{const a=SitePivot;a.selectProperty(a.FIXTURES[2]);a.app.goal='reno';a.show('scope');});
  // Reproduce a view transition from a scrolled page, including a still-running
  // user scroll. CSS smooth scrolling must not carry old coordinates into it.
  const positions=[];
  for(const behavior of ['instant','smooth']){
   const result=await page.evaluate(behavior=>{
    SitePivot.show('scope');window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'});
    const before=scrollY;window.scrollTo({top:100,behavior});SitePivot.show('scope');
    return{before,after:scrollY};
   },behavior);
   positions.push(result);assert.ok(result.before>100,'fixture must start below the viewport');
   assert.equal(result.after,0,'view navigation must synchronously cancel prior scrolling and start at the top');
  }
  await page.locator('#runAssessment').click();assert.equal(await page.locator('#view-assessment.active').count(),1);
  await page.locator('#toRoadmap').click();assert.equal(await page.locator('#view-roadmap.active').count(),1);
  await page.locator('#toReport').click();assert.equal(await page.locator('#view-report.active').count(),1);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
  fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'positions.json'),JSON.stringify(positions,null,2));
  await page.screenshot({path:path.join(output,'report.png'),fullPage:true});await context.tracing.stop({path:path.join(output,'trace.zip')});
 }catch(e){
  fs.mkdirSync(output,{recursive:true});
  if(context){const page=context.pages()[0];if(page){await page.screenshot({path:path.join(output,'failure.png'),fullPage:true}).catch(()=>{});fs.writeFileSync(path.join(output,'failure-geometry.json'),JSON.stringify(await page.evaluate(()=>({scrollY,view:SitePivot.app.view,buttons:['runAssessment','toReport'].map(id=>{const r=document.getElementById(id).getBoundingClientRect();return{id,x:r.x,y:r.y,width:r.width,height:r.height};})})).catch(()=>({})),null,2));}await context.tracing.stop({path:path.join(output,'failure-trace.zip')}).catch(()=>{});}
  throw e;
 }finally{await context?.close();await browser?.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
});
