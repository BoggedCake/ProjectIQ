'use strict';
const assert=require('node:assert/strict'),E=require('../commercial-engine');
// Supported planning + explicit synthetic exemption evidence isolate arithmetic, not live eligibility.
const supported={eligibility:{readyForFeasibility:true},contributions:{status:'verified-exemption',source:'Regression fixture: council exemption assessment',reason:'Synthetic confirmed exemption solely for arithmetic reconciliation'}};
const input={area:440,quality:'premium',configuration:'two-storey-basement',projectType:'duplex',dwellingCount:2,region:'NSW'};
const c=E.deliveredCost(input);
assert.ok(Array.isArray(c.components),'actual cost components must be available');
for(const band of ['low','mid','high'])assert.equal(c.components.reduce((sum,line)=>sum+line[band],0),c[band]);
assert.equal(c.configurationDetails.aboveGroundLevels,2);assert.equal(c.configurationDetails.basementLevels,1);
assert.equal(c.areaBreakdown.aboveGround+c.areaBreakdown.basement,440);
assert.equal(E.deliveredCost({...input,area:880}).areaBreakdown.basement,880/3);
const taller=E.deliveredCost({...input,configuration:'three-level-basement'});
assert.equal(taller.configurationDetails.aboveGroundLevels,3);assert.equal(taller.configurationDetails.totalLevels,4);assert.equal(taller.liftCount,2);assert.ok(taller.mid>c.mid);
assert.ok(c.constructionMid<c.mid,'hard works must exclude consultants, fees and contingency');
assert.ok(c.siteUnknowns.includes('Ground conditions and groundwater'));
assert.equal(E.deliveredCost({...input,land:10000000,prestige:true}).mid,c.mid);
const f=E.feasibility({...supported,cost:c,land:1000000,products:[{count:2,value:3000000}],extras:{professional:1e6,approvals:1e6,contingency:1e6,externalWorks:1e6,demolition:70000},interestRate:0,financeEstablishment:0,holding:0,sellingPct:0,marketing:0,legal:0,taxPct:0});
assert.equal(f.total,1000000+c.mid+70000);assert.deepEqual(Object.keys(f.lines),['demolition','authorityContributions']);
assert.equal(E.deliveryComposition(c).reduce((s,l)=>s+l.amount,0),c.mid);
assert.equal(E.deliveredCost({...input,basementArea:500}).status,'review');assert.equal(E.deliveredCost({...input,quality:'garbage'}).status,'review');
assert.equal(E.deliveredCost({...input,projectType:'apartment'}).status,'review');
const custom=E.deliveredCost({area:440,configuration:'custom',customRate:6800});assert.equal(custom.mid,2992000);assert.equal(custom.components.length,1);
for(const quality of ['volume','standard','custom','premium','prestige','luxury','luxury-development'])for(const configuration of ['two-storey','two-storey-basement','three-level-basement']){
 const x=E.deliveredCost({...input,quality,configuration}),lines=Object.fromEntries(x.components.map(l=>[l.key,l]));
 for(const band of ['low','mid','high']){
  assert.equal(x.components.reduce((sum,l)=>sum+l[band],0),x[band]);
  const hard=x.components.filter(l=>!['professional','approvals','contingency','gst'].includes(l.key)).reduce((sum,l)=>sum+l[band],0);
  assert.equal(lines.gst[band],Math.round((hard+lines.professional[band]+lines.contingency[band])*.1));
 }
 assert.ok(x.low<x.mid&&x.mid<x.high);
}
assert.equal(E.deliveredCost({...input,region:'Northern Beaches'}).mid,c.mid);
assert.equal(E.deliveredCost({...input,region:'Newcastle'}).status,'review');
assert.ok(E.deliveredCost({...input,quality:'volume'}).mid<E.deliveredCost({...input,quality:'custom'}).mid);
assert.ok(E.deliveredCost({...input,quality:'prestige'}).mid>E.deliveredCost({...input,quality:'premium'}).mid);
const expanded=E.deliveredCost({...input,area:660,basementArea:220});assert.ok(expanded.mid>E.deliveredCost({...input,area:440,configuration:'two-storey'}).mid);
console.log('PASS decomposed cost arithmetic, independent configuration, exclusions, GST and invalid-input checks');
