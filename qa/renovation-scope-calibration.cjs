'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const E=require('../commercial-engine');
// These tests exercise scope arithmetic, not fabricated builder quotes or a founder scope
// that was never supplied. Public-source access and rate assumptions are documented separately.
const base={components:['kitchen','bathroom','living','openplan','laundry','flooring','windows','outdoor'],quality:'premium',extent:'layout'};
const cost=overrides=>E.renovationCost({...base,...overrides});
test('window and door quantities change the installed allowance',()=>{
 const a=cost({quantities:{windowDoorArea:8}}),b=cost({quantities:{windowDoorArea:16}});
 assert.ok(b.mid>a.mid,'double measured glazing quantity must increase budget');
});
test('a structural scope prices openings even without an openplan checkbox',()=>{
 const a=cost({components:['kitchen','bathroom'],extent:'replace'});
 const b=cost({components:['kitchen','bathroom'],extent:'structural',quantities:{structuralOpenings:2}});
 assert.equal(b.scenarioClass,'structural');
 assert.equal(b.components.find(x=>x.key==='openplan').count,2);
 assert.ok(b.mid>a.mid);
});
test('project lines reconcile and apply GST once',()=>{
 const c=cost({quantities:{plumbingRelocations:2},allowances:{consultants:3000,approvals:1000}});
 for(const band of ['low','mid','high']){
  assert.equal(c[band],c.components.reduce((n,l)=>n+l[band],0));
  const tax=c.components.find(x=>x.key==='gst');assert.ok(tax,'GST is visible');
  const taxable=c.components.filter(x=>x.taxBasis==='ex-gst').reduce((n,l)=>n+l[band],0);
  assert.equal(tax[band],Math.round(taxable*.1));
 }
 for(const key of ['preliminaries','consultants','contingency','approvals'])assert.ok(c.components.find(x=>x.key===key));
});
test('whole-home shared finishes never duplicate selected shared-room trades',()=>{
 const a=cost({components:['wholehome','kitchen','bathroom']}),b=cost({components:['wholehome','kitchen','bathroom','flooring','painting','electrical','living','office']});
 assert.equal(a.mid,b.mid);
});
test('relocations and restricted access add once outside ordinary room services',()=>{
 const a=cost(),b=cost({quantities:{plumbingRelocations:2},accessCondition:'restricted'});
 assert.ok(b.mid>a.mid);assert.equal(b.components.find(x=>x.key==='plumbingRelocations').count,2);
 assert.ok(b.components.find(x=>x.key==='access').mid>0);
});
test('reconstruction and invalid quantities do not become ordinary room budgets',()=>{
 assert.equal(cost({extent:'reconstruction'}).status,'review');
 assert.equal(cost({quantities:{windowDoorArea:-1}}).status,'review');
 assert.equal(cost({counts:{bathroom:0}}).status,'review');
});
test('cosmetic scope does not discount a specified load-bearing opening',()=>{
 const a=cost({components:['openplan'],extent:'refresh'}),b=cost({components:['openplan'],extent:'replace'});
 assert.equal(a.components.find(x=>x.key==='openplan').mid,b.components.find(x=>x.key==='openplan').mid);
 assert.equal(a.scenarioClass,'structural');
});

test('mapped area capacity rejects explicit spatial review and respects measured support',()=>{
 const proof={state:'mapped',parcelResolved:true,queryComplete:true,value:.5,provenance:{instrument:'Test LEP'}};
 const input={siteArea:1000,fsr:.5,instrument:'Test LEP',configuration:'two-storey',fsrEvidence:proof};
 assert.equal(E.developmentAreaModel({...input,fsrEvidence:{...proof,spatiallyVerified:false}}).fsrVerified,false);
 assert.equal(E.developmentAreaModel({...input,fsrEvidence:{...proof,requiresReview:true}}).fsrVerified,false);
 assert.equal(E.developmentAreaModel({...input,fsrEvidence:{...proof,spatiallyVerified:true,capacityAreaFraction:.98}}).statutoryGfaCapacity,490);
 assert.equal(E.developmentAreaModel(input).statutoryGfaCapacity,500);
});
test('ordinary reconstructed candidate retains its credible gross budget',()=>{
 const c=E.renovationCost({components:['kitchen','bathroom','openplan','living','flooring','windows','office','laundry'],counts:{bathroom:2},quality:'premium',extent:'layout'});
 assert.deepEqual([c.low,c.mid,c.high],[124800,213600,362400]);
 assert.equal(c.components.find(x=>x.key==='contingency').mid,0);
 assert.equal(c.components.find(x=>x.key==='gst').mid,0,'room-package GST cannot be added a second time');
});
test('scope growth prices extras once and statutory fees never receive GST',()=>{
 const a=cost({allowances:{consultants:10000},contingencyPct:0});
 const b=cost({allowances:{consultants:10000,approvals:1000},contingencyPct:0});
 assert.equal(b.mid-a.mid,1000);
 assert.equal(a.components.find(x=>x.key==='gst').mid,1000);
 const c=cost({allowances:{consultants:10000},contingencyPct:.1});
 assert.equal(c.mid-a.mid,1100,'10% extra contingency plus its GST, never extra contingency on room packages');
});
