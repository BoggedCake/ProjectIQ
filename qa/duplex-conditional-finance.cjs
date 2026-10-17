'use strict';
const assert=require('node:assert/strict'),E=require('../commercial-engine');
const input={land:2000000,cost:E.deliveredCost({area:300,projectType:'duplex'}),products:[{count:2,value:2500000}],landDebt:800000,contributions:{status:'user-allowance',amount:25000}};
const opportunity={category:'unresolved',readyForFeasibility:false,readyForPreliminaryCosting:true,preliminaryPathway:'DA',reason:'Permitted with consent; detailed design remains to be assessed.'};
const result=E.feasibility({...input,eligibility:opportunity,preliminary:true});
assert.equal(result.status,'conditional','A verified preliminary DA opportunity can be modelled conditionally');
assert.equal(result.decisionReady,false);
assert.match(result.note,/Conditional.*not.*approval/i);
assert.ok(result.total>input.land+input.cost.mid);
for(const eligibility of [undefined,{readyForPreliminaryCosting:false},{...opportunity,category:'prohibited'},{...opportunity,category:'mandatory-standard-not-met'}]){
 const r=E.feasibility({...input,eligibility,preliminary:true});assert.equal(r.status,'review');assert.equal(r.total,undefined);
}
assert.equal(E.feasibility({...input,eligibility:opportunity}).status,'review','No implicit financial scenario');
assert.equal(E.feasibility({...input,eligibility:opportunity,preliminary:true,contributions:undefined}).status,'review','Unknown contributions cannot manufacture complete totals');
console.log('PASS conditional preliminary finance needs supported opportunity and explicit mode, never grants approval or ignores unknown costs');
