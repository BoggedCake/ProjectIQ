import { chromium } from 'playwright';

const URL='https://boggedcake.github.io/ProjectIQ/?qa='+Date.now();
const address='57 Griffiths Street, Fairlight NSW 2094';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage();
const consoleErrors=[];
const requestFailures=[];
page.on('console',m=>{ if(m.type()==='error') consoleErrors.push(m.text()); });
page.on('pageerror',e=>consoleErrors.push('PAGEERROR '+e.message));
page.on('requestfailed',r=>requestFailures.push({url:r.url(),error:r.failure()?.errorText||''}));

const result={url:URL,address,started:new Date().toISOString()};
try{
  const navStart=Date.now();
  await page.goto(URL,{waitUntil:'domcontentloaded',timeout:30000});
  result.navigationMs=Date.now()-navStart;
  await page.waitForSelector('#addressSearch',{timeout:10000});

  result.liveFetchHeaders=await page.evaluate(async()=>{
    const checks=[
      ['arcgisSuggest','https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?f=json&text=57%20Griffiths%20Street%20Fairlight%20NSW&countryCode=AUS&category=Address&returnCollections=false&maxSuggestions=5'],
      ['nswAddress','https://portal.spatial.nsw.gov.au/server/rest/services/Hosted/NSW_Address_Point_Formatted/FeatureServer/0/query?f=json&where=localityname%3D%27FAIRLIGHT%27%20AND%20streetnumber1%3D%2757%27%20AND%20streetname%3D%27GRIFFITHS%27&outFields=formattedaddress%2Clocalityname%2Clganame%2Ccadastralidentifier%2Cstreetnumber1%2Cstreetname%2Cstreettype%2Cpostcode&returnGeometry=true&outSR=4283&resultRecordCount=5']
    ];
    const out={};
    for(const [name,url] of checks){
      const t=performance.now();
      try{
        const r=await fetch(url,{mode:'cors'});
        const text=await r.text();
        out[name]={ok:r.ok,status:r.status,ms:Math.round(performance.now()-t),acao:r.headers.get('access-control-allow-origin'),body:text.slice(0,300)};
      }catch(e){out[name]={ok:false,ms:Math.round(performance.now()-t),error:String(e)}}
    }
    return out;
  });

  const input=page.locator('#addressSearch');
  const t0=Date.now();
  await input.fill('57 Griffiths Street Fairlight');
  try{
    await page.waitForSelector('#searchResults.open .searchResult',{timeout:3500});
    result.suggestionMs=Date.now()-t0;
    result.suggestions=await page.locator('#searchResults.open .searchResult').allTextContents();
    const exact=page.locator('#searchResults.open .searchResult').filter({hasText:'57 Griffiths'}).first();
    if(await exact.count()) await exact.click(); else await page.locator('#searchResults.open .searchResult').first().click();
    try{
      await page.waitForSelector('#view-property.active',{timeout:12000});
      result.propertyResolved=true;
      result.identity=await page.locator('#identityMetrics').innerText();
      await page.locator('#confirmProperty').click();
      await page.waitForSelector('#view-passport.active',{timeout:5000});
      const planStart=Date.now();
      try{await page.waitForFunction(()=>window.SitePivot?.app?.property?.planning?.loading===false,{timeout:9000});result.planningMs=Date.now()-planStart;}catch(e){result.planningTimeout=e.message;}
      result.passport=await page.locator('#planningFacts').innerText();
      result.zone=await page.evaluate(()=>window.SitePivot?.app?.property?.planning?.zone||null);
      result.lga=await page.evaluate(()=>window.SitePivot?.app?.property?.lga||null);
      result.lot=await page.evaluate(()=>window.SitePivot?.app?.property?.lot||null);
      result.dp=await page.evaluate(()=>window.SitePivot?.app?.property?.dp||null);
      result.area=await page.evaluate(()=>window.SitePivot?.app?.property?.area||null);
      result.dcp=await page.evaluate(()=>window.SitePivot?.app?.property?.planning?.dcpPlans||[]);
    }catch(e){result.propertyResolved=false;result.propertyError=e.message;result.searchBox=await page.locator('#searchResults').innerText().catch(()=>null);}
  }catch(e){
    result.suggestionMs=null;
    result.suggestionError=e.message;
    result.searchBox=await page.locator('#searchResults').innerText().catch(()=>null);
  }

  result.parcelProbe=await page.evaluate(async()=>{const url='https://portal.spatial.nsw.gov.au/server/rest/services/NSW_Land_Parcel_Property_Theme/FeatureServer/8/query?f=json&where='+encodeURIComponent("planlabel = 'DP1729' AND lotnumber = '32'")+'&outFields='+encodeURIComponent('cadid,lotnumber,planlabel,planlotarea,planlotareaunits,lotidstring,classsubtype')+'&returnGeometry=true&outSR=4283&resultRecordCount=5';const t=performance.now();try{const r=await fetch(url,{mode:'cors'});const j=await r.json();return{ok:r.ok,status:r.status,ms:Math.round(performance.now()-t),features:(j.features||[]).map(f=>({attributes:f.attributes,hasGeometry:!!f.geometry,rings:f.geometry?.rings?.length||0})),error:j.error||null}}catch(e){return{ok:false,ms:Math.round(performance.now()-t),error:String(e)}}});

  result.matrix=await page.evaluate(async()=>{
    const cases=[
      '1 Waratah Street Balgowlah NSW 2093',
      '9 Waratah Street Balgowlah NSW 2093',
      '84/2-8 Dixon Street Sydney NSW 2000',
      '290 King Street Newcastle NSW 2300',
      '41 Burelli Street Wollongong NSW 2500',
      '49 Mann Street Gosford NSW 2250',
      '135 Byng Street Orange NSW 2800',
      '243 Baylis Street Wagga Wagga NSW 2650',
      '3 Armstrong Crescent Dubbo NSW 2830',
      '2 Civic Place Katoomba NSW 2780'
    ];
    const out=[];
    for(const q of cases){
      const t=performance.now();
      try{
        const suggestions=await window.SitePivot.liveAddressSearch(q);
        const suggestMs=Math.round(performance.now()-t);
        if(!suggestions.length){out.push({q,pass:false,suggestMs,error:'no suggestions'});continue}
        const ti=performance.now();
        const r=await window.SitePivot.resolveLiveIdentity(suggestions[0]);
        const identityMs=Math.round(performance.now()-ti);
        out.push({q,pass:suggestMs<3000&&!!r.p.lga,suggestMs,identityMs,address:r.p.address,lga:r.p.lga,lot:r.p.lot,dp:r.p.dp});
      }catch(e){out.push({q,pass:false,error:String(e)})}
    }
    return out;
  });
  result.exactNumberRegression=(()=>{
    const one=result.matrix.find(x=>x.q.startsWith('1 Waratah'));
    const nine=result.matrix.find(x=>x.q.startsWith('9 Waratah'));
    return !!one&&!!nine&&one.pass&&nine.pass&&/^1\s/i.test(one.address)&&/^9\s/i.test(nine.address)&&one.address!==nine.address;
  })();

  result.browserPlanningArchitecture='GitHub Pages is static-only. Statewide planning enrichment is validated by the server data QA and must run through the deployed SitePivot API to avoid browser ORB/CORS failures.';

  result.consoleErrors=consoleErrors;
  result.requestFailures=requestFailures;
}catch(e){
  result.fatal=e.stack||String(e);
}
console.log('SITEPIVOT_LIVE_QA_START');
console.log(JSON.stringify(result,null,2));
console.log('SITEPIVOT_LIVE_QA_END');
await browser.close();

if(!result.suggestionMs || result.suggestionMs>3000 || !result.propertyResolved || !result.lga || !result.lot || !result.dp || !result.exactNumberRegression || result.matrix?.some(x=>!x.pass)) process.exitCode=1;
