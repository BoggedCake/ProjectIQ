'use strict';
const {suggestAddress,resolveProperty,planningFor}=require('../api/_lib/sitepivot');
const addressHandler=require('../api/address/suggest');
const propertyHandler=require('../api/property/resolve');
const planningHandler=require('../api/planning/property');
// Capture only the public address fields needed to diagnose exact-unit failures.
const originalFetch=global.fetch;
let addressProbe=null;
global.fetch=async(...args)=>{
 const response=await originalFetch(...args);
 if(String(args[0]).includes('NSW_Address_Point_Formatted')){
  try{const j=await response.clone().json();addressProbe={exceededTransferLimit:j.exceededTransferLimit,rows:(j.features||[]).map(f=>({address:f.attributes.formattedaddress,number:f.attributes.streetnumber1,unit:f.attributes.complexunitidentifier}))}}catch(e){}
 }
 return response;
};

function fakeRes(){
  return{
    statusCode:200,body:null,ended:false,headers:{},
    setHeader(k,v){this.headers[k]=v;return this},
    status(n){this.statusCode=n;return this},
    json(v){this.body=v;this.ended=true;return this},
    end(){this.ended=true;return this}
  };
}
async function routeCase(handler,req){const res=fakeRes();await handler(req,res);return{status:res.statusCode,body:res.body,ended:res.ended}}


const cases=[
 '57 Griffiths Street Fairlight NSW 2094',
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

(async()=>{
const out={started:new Date().toISOString(),identity:[],planning:[],apiContract:{}};
out.apiContract.addressOptions=await routeCase(addressHandler,{method:'OPTIONS',query:{}});
out.apiContract.addressShort=await routeCase(addressHandler,{method:'GET',query:{q:'ab'}});
out.apiContract.propertyLong=await routeCase(propertyHandler,{method:'GET',query:{text:'x'.repeat(301)}});
out.apiContract.planningInvalid=await routeCase(planningHandler,{method:'POST',body:{point:{x:0,y:0},lga:'TEST'}});
out.apiContractPass=out.apiContract.addressOptions.status===204&&out.apiContract.addressShort.status===400&&out.apiContract.propertyLong.status===400&&out.apiContract.planningInvalid.status===400;

for(const q of cases){
 const t0=Date.now();
 try{
   const s=await suggestAddress(q);
   const suggestionMs=Date.now()-t0;
   if(!s.suggestions.length)throw new Error('no suggestions');
   const t1=Date.now();
   const r=await resolveProperty(s.suggestions[0]);
   out.identity.push({q,pass:suggestionMs<3000&&!!r.property.lga&&!!r.property.lot&&!!r.property.dp,suggestionMs,resolveMs:Date.now()-t1,address:r.property.address,lga:r.property.lga,lot:r.property.lot,dp:r.property.dp,property:r.property});
 }catch(e){out.identity.push({q,pass:false,error:e.message,addressProbe})}
}
const one=out.identity.find(x=>x.q.startsWith('1 Waratah')),nine=out.identity.find(x=>x.q.startsWith('9 Waratah'));
out.exactNumberRegression=!!one&&!!nine&&one.pass&&nine.pass&&/^1\s/i.test(one.address)&&/^9\s/i.test(nine.address)&&one.address!==nine.address;

for(const q of ['57 Griffiths Street Fairlight NSW 2094','290 King Street Newcastle NSW 2300','41 Burelli Street Wollongong NSW 2500']){
 const id=out.identity.find(x=>x.q===q);
 if(!id?.pass){out.planning.push({q,pass:false,error:'identity prerequisite failed'});continue}
 const t=Date.now();
 try{
   const p=await planningFor(id.property);
   const contractPass=Array.isArray(p.planning.failedKeys)&&Array.isArray(p.planning.failedSources)&&p.planning.failedKeys.every(k=>p.planning.failedSources.includes(k))&&Array.isArray(p.planning.sepp);
   out.planning.push({q,pass:!!p.planning.zone&&!!p.planning.instrument&&contractPass,contractPass,frontage:p.parcel.frontage,council:p.planning.councilEvidence,planningMs:Date.now()-t,lga:id.lga,zone:p.planning.zone,instrument:p.planning.instrument,dcp:p.planning.dcpPlans,sepp:p.planning.sepp,area:p.parcel.area,failedKeys:p.planning.failedKeys,errors:p.planning.liveErrors});
 }catch(e){out.planning.push({q,pass:false,error:e.message})}
}
const suggestions=out.identity.map(x=>x.suggestionMs).filter(Number.isFinite).sort((a,b)=>a-b);
const pct=(arr,p)=>arr.length?arr[Math.min(arr.length-1,Math.max(0,Math.ceil(arr.length*p)-1))]:null;
out.performance={maxSuggestionMs:suggestions.at(-1)||null,medianSuggestionMs:pct(suggestions,.5),p95SuggestionMs:pct(suggestions,.95)};
// Contract regression: failed planning sources must remain visible to the UI as Needs Review.
out.failureContractPass=out.planning.length>0&&out.planning.every(x=>x.contractPass===true);

out.pass=out.identity.every(x=>x.pass)&&out.exactNumberRegression&&out.planning.every(x=>x.pass)&&out.performance.p95SuggestionMs<3000&&out.failureContractPass&&out.apiContractPass;
console.log('SITEPIVOT_SERVER_QA_START');
console.log(JSON.stringify(out,null,2));
console.log('SITEPIVOT_SERVER_QA_END');
if(!out.pass)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
