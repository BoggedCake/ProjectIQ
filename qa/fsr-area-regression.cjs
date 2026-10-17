'use strict';
const assert=require('node:assert/strict');
const E=require('../commercial-engine');
const mapped={state:'mapped',value:'0.5:1',parcelResolved:true,queryComplete:true,provenance:{instrument:'Manly Local Environmental Plan 2013'}};
const base={siteArea:575.3,fsr:'0.5:1',fsrEvidence:mapped,areaSource:'starter',basementUse:'parking'};
const near=(actual,want)=>assert.ok(Math.abs(actual-want)<1e-8,`${actual} should equal ${want}`);
// Catches reintroducing site-coverage × all levels as if constructed area were statutory GFA.
assert.equal(typeof E.developmentAreaModel,'function','Shared engine must expose the FSR-aware area model');
for(const [configuration,above,basement,total,plate] of [
 ['two-storey',258.885,0,258.885,129.4425],
 ['two-storey-basement',258.885,129.4425,388.3275,129.4425],
 ['three-level-basement',258.885,86.295,345.18,86.295]
]){
 const m=E.developmentAreaModel({...base,configuration});
 near(m.statutoryGfaCapacity,287.65);near(m.aboveGroundConstructedArea,above);
 near(m.basementConstructedArea,basement);near(m.totalConstructedArea,total);near(m.aboveGroundFloorplate,plate);
 assert.equal(m.workingGfaShare,.9);assert.equal(m.decisionReady,false);
 assert.ok(m.aboveGroundConstructedArea<=m.statutoryGfaCapacity);
 if(basement){assert.equal(m.basementStatutoryGfa.classification,'potential-exclusion');assert.equal(m.basementStatutoryGfa.countedArea,null);near(m.basementStatutoryGfa.potentiallyExcludedArea,basement);assert.equal(m.basementStatutoryGfa.requiresReview,true);}
}
// Explicit quantities survive configuration changes, including incompatible no-basement selection.
for(const configuration of Object.keys(E.COST_CONFIGS)){
 const m=E.developmentAreaModel({...base,configuration,areaSource:'user',totalConstructedArea:630,basementConstructedArea:210});
 near(m.totalConstructedArea,630);near(m.basementConstructedArea,210);near(m.aboveGroundConstructedArea,420);
 assert.ok(m.warnings.some(w=>w.code==='fsr-conflict'));assert.equal(m.status,'review');
 if(configuration==='two-storey')assert.ok(m.warnings.some(w=>w.code==='configuration-conflict'));
}
// No mapped evidence or failed/ambiguous spatial check must not become a numeric statutory envelope.
for(const fsrEvidence of [undefined,{...mapped,state:'unmapped'},{...mapped,state:'service-failure'},{...mapped,state:'multiple'},{...mapped,parcelResolved:false},{...mapped,queryComplete:false},{...mapped,provenance:{instrument:'Unrelated LEP'}}]){
 const m=E.developmentAreaModel({...base,instrument:'Manly Local Environmental Plan 2013',configuration:'two-storey-basement',fsrEvidence,totalConstructedArea:630,basementConstructedArea:210});
 assert.equal(m.statutoryGfaCapacity,null);near(m.totalConstructedArea,630);near(m.basementConstructedArea,210);assert.equal(m.status,'assumption');
}
const unknown=E.developmentAreaModel({...base,fsrEvidence:undefined,configuration:'two-storey'});
assert.equal(unknown.totalConstructedArea,null);assert.equal(unknown.statutoryGfaCapacity,null);
// Naming a room storage/garage never proves exclusion; unknown/mixed are conservatively counted.
for(const use of ['parking','storage','habitable','mixed','unknown']){
 const m=E.developmentAreaModel({...base,configuration:'two-storey-basement',areaSource:'manual',totalConstructedArea:350,basementConstructedArea:100,basementUse:use});
 near(m.estimatedStatutoryGfaConservative,350);
 if(use==='habitable'){assert.equal(m.basementStatutoryGfa.classification,'counted');near(m.basementStatutoryGfa.countedArea,100);near(m.estimatedStatutoryGfa,350);assert.ok(m.warnings.some(w=>w.code==='fsr-conflict'));}
 else {assert.equal(m.estimatedStatutoryGfa,null);assert.equal(m.basementStatutoryGfa.requiresReview,true);assert.ok(m.warnings.some(w=>w.code==='basement-gfa-review'));}
}
// User basement entries are retained even while other quantities remain starter-derived.
const edited=E.developmentAreaModel({...base,configuration:'three-level-basement',basementConstructedArea:150,basementAreaSource:'user'});
near(edited.basementConstructedArea,150);near(edited.totalConstructedArea,408.885);
const custom=E.developmentAreaModel({...base,configuration:'custom',buildingConfiguration:'three-level-basement'});
near(custom.aboveGroundFloorplate,86.295);
for(const invalid of [{siteArea:0},{workingGfaShare:1.2},{totalConstructedArea:100,basementConstructedArea:120,areaSource:'user'}])assert.equal(E.developmentAreaModel({...base,configuration:'two-storey-basement',...invalid}).status,'review');
// Actual cost consumers keep basement quantity separate and charge it only once.
const areas=E.developmentAreaModel({...base,configuration:'two-storey-basement'});
const cost=E.deliveredCost({area:areas.totalConstructedArea,basementArea:areas.basementConstructedArea,configuration:'two-storey-basement',quality:'premium',region:'NSW'});
assert.notEqual(cost.status,'review');near(cost.areaBreakdown.aboveGround,258.885);near(cost.areaBreakdown.basement,129.4425);
assert.equal(cost.components.find(c=>c.key==='aboveGround').mid,1164983);assert.equal(cost.components.find(c=>c.key==='basement').mid,440105);
console.log('PASS FSR-aware statutory/constructed areas, levels, user preservation, evidence gates, basement classification and real cost integration');
