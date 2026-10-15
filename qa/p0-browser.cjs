'use strict';
// Synthetic provider payloads exercise the real browser UI; live-source suites
// remain separate and must not treat these cases as NSW factual verification.
const {chromium,webkit}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),out=path.join(root,'qa-artifacts/p0');fs.mkdirSync(out,{recursive:true});
const deployed=process.env.SITEPIVOT_URL,base=deployed||'https://boggedcake.github.io/ProjectIQ/',query='12 Example Street, Manly, Sydney, New South Wales, 2095, AUS';
const feature={attributes:{objectid:12,ap_gurasid:'synthetic-address-12',formattedaddress:'12 EXAMPLE ST, MANLY NSW 2095',streetnumber1:'12',streetname:'EXAMPLE',streettype:'STREET',localityname:'MANLY',postcode:'2095',lganame:'NORTHERN BEACHES',cadastralidentifier:'1//DP1'},geometry:{x:151.28,y:-33.8}};
const cases=[['exact',{features:[feature],exceededTransferLimit:false},true],['wrong-street',{features:[{...feature,attributes:{...feature.attributes,formattedaddress:'12 OTHER RD, MANLY NSW 2095',streetname:'OTHER',streettype:'ROAD'}}],exceededTransferLimit:false},false],['truncated',{features:[feature],exceededTransferLimit:true},false],['ambiguous',{features:[feature,{...feature,attributes:{...feature.attributes,objectid:13,ap_gurasid:'synthetic-address-13'}}],exceededTransferLimit:false},false]];
const results=[];
(async()=>{
 for(const engine of [chromium,webkit]){
  const browser=await engine.launch();
  try{for(const width of [390,1280])for(const[name,payload,accepted]of cases){
   const page=await browser.newPage({viewport:{width,height:width<500?844:900},isMobile:width<500,hasTouch:width<500}),errors=[];page.on('pageerror',e=>errors.push(e.message));
   try{
    if(!deployed)await page.route('https://boggedcake.github.io/ProjectIQ/**',route=>{const filename=new URL(route.request().url()).pathname.replace('/ProjectIQ/','')||'index.html';if(!/^[\w.-]+$/.test(filename)||!fs.existsSync(path.join(root,filename)))return route.fulfill({status:404,body:''});return route.fulfill({contentType:filename.endsWith('.js')?'application/javascript':'text/html',body:fs.readFileSync(path.join(root,filename),'utf8')})});
    await page.route(/https:\/\/(?:geocode\.arcgis\.com|portal\.spatial\.nsw\.gov\.au|mapprod3\.environment\.nsw\.gov\.au|maps\.six\.nsw\.gov\.au)\//,route=>{
     const u=new URL(route.request().url()),cb=u.searchParams.get('callback');let j;
     if(u.pathname.endsWith('/suggest'))j={suggestions:[{text:query,magicKey:'synthetic-p0'}]};
     else if(u.pathname.endsWith('/findAddressCandidates'))j={candidates:[{address:query,location:feature.geometry,attributes:{Region:'New South Wales'}}]};
     else if(u.pathname.includes('NSW_Address_Point_Formatted'))j=payload;
     else if(u.pathname.endsWith('/identify'))j={results:[],exceededTransferLimit:false};
     else j={features:[],exceededTransferLimit:false};
     return route.fulfill({contentType:cb?'application/javascript':'application/json',body:cb?cb+'('+JSON.stringify(j)+');':JSON.stringify(j)});
    });
    await page.goto(base,{waitUntil:'domcontentloaded'});await page.locator('#addressSearch').fill('12 Example Street Manly');await page.locator('[data-live-index]').first().click();
    await page.waitForFunction(()=>['verified','unavailable'].includes(SitePivot.app.dataState.identity?.status),{},{timeout:10000});
    const state=await page.evaluate(()=>({identity:SitePivot.app.dataState.identity.status,address:SitePivot.app.property?.address||null,view:SitePivot.app.view}));
    assert.equal(state.identity,accepted?'verified':'unavailable');if(accepted){assert.equal(state.address,feature.attributes.formattedaddress);assert.equal(await page.locator('#confirmProperty').isVisible(),true)}else{assert.equal(state.address,null);assert.equal(state.view,'landing');assert.match(await page.locator('#searchResults').innerText(),/retry|try again|address|identity|truncat|ambiguous/i)}
    assert.deepEqual(errors,[]);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));results.push({engine:engine.name(),width,case:name,scope:'synthetic browser provider contract',pass:true,...state});
   }catch(e){results.push({engine:engine.name(),width,case:name,pass:false,error:e.stack});await page.screenshot({path:path.join(out,engine.name()+'-'+width+'-'+name+'.png')}).catch(()=>{})}finally{await page.close()}
  }}finally{await browser.close()}
 }
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));console.log('P0_BROWSER '+results.filter(r=>r.pass).length+' passed, '+results.filter(r=>!r.pass).length+' failed');if(results.some(r=>!r.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
