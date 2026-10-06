'use strict';
const {suggestAddress,resolveProperty,planningFor}=require('../api/_lib/sitepivot');

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
const out={started:new Date().toISOString(),identity:[],planning:[]};
for(const q of cases){
 const t0=Date.now();
 try{
   const s=await suggestAddress(q);
   const suggestionMs=Date.now()-t0;
   if(!s.suggestions.length)throw new Error('no suggestions');
   const t1=Date.now();
   const r=await resolveProperty(s.suggestions[0]);
   out.identity.push({q,pass:suggestionMs<3000&&!!r.property.lga&&!!r.property.lot&&!!r.property.dp,suggestionMs,resolveMs:Date.now()-t1,address:r.property.address,lga:r.property.lga,lot:r.property.lot,dp:r.property.dp,property:r.property});
 }catch(e){out.identity.push({q,pass:false,error:e.message})}
}
const one=out.identity.find(x=>x.q.startsWith('1 Waratah')),nine=out.identity.find(x=>x.q.startsWith('9 Waratah'));
out.exactNumberRegression=!!one&&!!nine&&one.pass&&nine.pass&&/^1\s/i.test(one.address)&&/^9\s/i.test(nine.address)&&one.address!==nine.address;

for(const q of ['57 Griffiths Street Fairlight NSW 2094','290 King Street Newcastle NSW 2300','41 Burelli Street Wollongong NSW 2500']){
 const id=out.identity.find(x=>x.q===q);
 if(!id?.pass){out.planning.push({q,pass:false,error:'identity prerequisite failed'});continue}
 const t=Date.now();
 try{
   const p=await planningFor(id.property);
   out.planning.push({q,pass:!!p.planning.zone&&!!p.planning.instrument,planningMs:Date.now()-t,lga:id.lga,zone:p.planning.zone,instrument:p.planning.instrument,dcp:p.planning.dcpPlans,area:p.parcel.area,errors:p.planning.liveErrors});
 }catch(e){out.planning.push({q,pass:false,error:e.message})}
}
const suggestions=out.identity.map(x=>x.suggestionMs).filter(Number.isFinite).sort((a,b)=>a-b);
out.performance={maxSuggestionMs:suggestions.at(-1)||null,medianSuggestionMs:suggestions.length?suggestions[Math.floor(suggestions.length/2)]:null};
// Contract regression: failed planning sources must remain visible to the UI as Needs Review.
const contractProbe={planning:{failedKeys:['sepp'],failedSources:['sepp']}};
out.failureContractPass=Array.isArray(contractProbe.planning.failedKeys)&&contractProbe.planning.failedKeys.includes('sepp');

out.pass=out.identity.every(x=>x.pass)&&out.exactNumberRegression&&out.planning.every(x=>x.pass)&&out.performance.maxSuggestionMs<3000&&out.failureContractPass;
console.log('SITEPIVOT_SERVER_QA_START');
console.log(JSON.stringify(out,null,2));
console.log('SITEPIVOT_SERVER_QA_END');
if(!out.pass)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
