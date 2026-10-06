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
    }catch(e){result.propertyResolved=false;result.propertyError=e.message;result.searchBox=await page.locator('#searchResults').innerText().catch(()=>null);}
  }catch(e){
    result.suggestionMs=null;
    result.suggestionError=e.message;
    result.searchBox=await page.locator('#searchResults').innerText().catch(()=>null);
  }
  result.consoleErrors=consoleErrors;
  result.requestFailures=requestFailures;
}catch(e){
  result.fatal=e.stack||String(e);
}
console.log('SITEPIVOT_LIVE_QA_START');
console.log(JSON.stringify(result,null,2));
console.log('SITEPIVOT_LIVE_QA_END');
await browser.close();

if(!result.suggestionMs || result.suggestionMs>3000 || !result.propertyResolved || !result.lga || !result.zone) process.exitCode=1;
