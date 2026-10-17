'use strict';
const {JSDOM,VirtualConsole}=require('jsdom');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const test=require('node:test');
function setup(goal='reno'){
 const dom=new JSDOM(fs.readFileSync('index.html','utf8'),{url:'https://boggedcake.github.io/ProjectIQ/?fixtures=1',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){w.scrollTo=()=>{};for(const f of ['address-evidence','response-evidence','property-evidence','zoning-evidence','fsr-evidence','planning-intelligence','contributions-evidence','commercial-engine','comparison-engine','conversation','voice'])w.eval(fs.readFileSync(f+'.js','utf8'));}});
 const a=dom.window.SitePivot,d=dom.window.document,w=dom.window;
 a.selectProperty(a.FIXTURES[0]);a.app.ownershipRole='owner';a.chooseGoal(goal);
 Object.assign(a.app.scope,{renovationAreas:['kitchen','bathroom','openplan','windows','flooring'],renovationExtent:'layout',renovationCounts:{bathroom:2},rooms:goal==='reno'?{}:{bedroom:2,bathroom:1},area:60});a.show('scope');
 return{dom,a,d,w};
}
function input(x,id,value,type='input'){
 const el=x.d.getElementById(id);assert.ok(el,'Missing editable scope control '+id);el.value=String(value);el.dispatchEvent(new x.w.Event(type,{bubbles:true}));return el;
}
for(const goal of ['reno','extend','storey'])test(goal+' exposes adjustable renovation quantities and project extras',()=>{
 const x=setup(goal);try{
  for(const id of ['rqty-windowDoorArea','rqty-finishArea','rqty-structuralOpenings','rqty-plumbingRelocations','rallow-preliminaries','rallow-consultants','rallow-approvals','rallow-demolition','rallow-conditions','renoAccess','renoContingency'])assert.ok(x.d.getElementById(id),goal+' missing '+id);
  const before=x.a.projectCost().mid;
  input(x,'rqty-windowDoorArea',24);input(x,'rqty-structuralOpenings',3);input(x,'rqty-plumbingRelocations',2);input(x,'rallow-consultants',3000);input(x,'renoAccess','restricted','change');input(x,'renoContingency',15);
  assert.equal(x.a.app.scope.renovationQuantities.windowDoorArea,24);
  assert.equal(x.a.app.scope.renovationQuantities.structuralOpenings,3);
  assert.equal(x.a.app.scope.renovationAllowances.consultants,3000);
  assert.equal(x.a.app.scope.renovationAccess,'restricted');
  assert.equal(x.a.app.scope.renovationContingencyPct,.15,'visible15% must pass0.15 into arithmetic');
  assert.ok(x.a.projectCost().mid>before,'selected renovation quantities must reach mixed-project pricing');
 }finally{x.dom.window.close();}
});
test('blank quantity restores the disclosed default without leaving a stale override',()=>{
 const x=setup();try{
  const before=x.a.projectCost().mid;input(x,'rqty-windowDoorArea',32);assert.ok(x.a.projectCost().mid>before);
  input(x,'rqty-windowDoorArea','');assert.equal(Object.hasOwn(x.a.app.scope.renovationQuantities,'windowDoorArea'),false);
  assert.equal(x.a.projectCost().mid,before);
 }finally{x.dom.window.close();}
});
test('saved renovation scope reopens with unchanged quantities and budget',()=>{
 const x=setup();try{
  input(x,'rqty-windowDoorArea',24);input(x,'rallow-demolition',15000);input(x,'renoContingency',12);
  const before=x.a.projectCost().mid;x.a.saveLocal();const id=x.a.app.projectId;
  x.a.app.scope.renovationQuantities={windowDoorArea:8};x.a.app.scope.renovationAllowances={};
  x.a.reopenProject(id);x.a.show('scope');
  assert.equal(x.a.app.scope.renovationQuantities.windowDoorArea,24);assert.equal(x.d.getElementById('rqty-windowDoorArea').value,'24');
  assert.equal(x.a.app.scope.renovationAllowances.demolition,15000);assert.equal(x.a.app.scope.renovationContingencyPct,.12);
  assert.equal(x.a.projectCost().mid,before);
 }finally{x.dom.window.close();}
});
test('changing project direction clears stale renovation extras',()=>{
 const x=setup();try{
  input(x,'rqty-windowDoorArea',24);input(x,'rallow-conditions',20000);input(x,'renoAccess','restricted','change');input(x,'renoContingency',15);
  x.a.chooseGoal('storey');
  assert.equal(x.a.app.scope.renovationQuantities?.windowDoorArea,undefined);
  assert.equal(x.a.app.scope.renovationAllowances?.conditions,undefined);
  assert.notEqual(x.a.app.scope.renovationAccess,'restricted');assert.ok(!x.a.app.scope.renovationContingencyPct);
 }finally{x.dom.window.close();}
});
test('cost report explains the scope class, tax basis and unverified exclusions',()=>{
 const x=setup();try{
  input(x,'rqty-windowDoorArea',24);x.a.computeAssessment();x.a.show('report');
  const audit=x.d.querySelector('#reportContent #renovationCostAudit');assert.ok(audit,'saved report needs the renovation cost audit');
  assert.match(audit.textContent,/structural/i);assert.match(audit.textContent,/GST/i);assert.match(audit.textContent,/unverified|confirm|not.*quote|internal/i);assert.match(audit.textContent,/24/);
 }finally{x.dom.window.close();}
});
test('newly confirmed intent clears prior measured renovation extras',()=>{
 const x=setup();try{
  input(x,'rqty-windowDoorArea',32);input(x,'rallow-conditions',20000);input(x,'renoAccess','restricted','change');input(x,'renoContingency',15);
  x.a.applyIntent(x.a.commercial.interpretIntent('I want to renovate the bathroom.').profile);
  assert.equal(x.a.app.scope.renovationQuantities?.windowDoorArea,undefined);
  assert.equal(x.a.app.scope.renovationAllowances?.conditions,undefined);
  assert.notEqual(x.a.app.scope.renovationAccess,'restricted');assert.ok(!x.a.app.scope.renovationContingencyPct);
  assert.equal(x.a.projectCost().mid,x.a.commercial.renovationCost({components:x.a.app.scope.renovationAreas,counts:x.a.app.scope.renovationCounts,extent:x.a.app.scope.renovationExtent,quality:x.a.app.scope.quality,complexity:x.a.app.scope.complexity,region:x.a.app.property.costRegion||1}).mid);
 }finally{x.dom.window.close();}
});
test('founder confirmed eight-component renovation preserves the 213600 baseline',()=>{
 const x=setup();try{
  x.a.app.property.costRegion=1;Object.assign(x.a.app.scope,{quality:'premium',complexity:'normal',renovationAreas:['kitchen','bathroom','living','openplan','laundry','flooring','windows','office'],renovationCounts:{bathroom:2},renovationExtent:'replace'});
  const c=x.a.projectCost();assert.equal(c.mid,213600);assert.equal(c.components.filter(l=>l.mid>0).length,8);
 }finally{x.dom.window.close();}
});
for(const [goal,address,rooms,area,total]of [
 ['extend','59 West Street, Balgowlah',{bedroom:1,masterSuite:1,bathroom:1,kitchenLiving:1,living:1,laundry:1},132,1319095],
 ['storey','57 Griffiths Street, Fairlight',{bedroom:2,masterSuite:1,bathroom:2,living:1},108,1190752]
])test('founder confirmed '+goal+' quantities preserve the '+total+' baseline',()=>{
 const x=setup(goal);try{
  // User-confirmed scenario quantities only. This fixture does not assert live identity/planning or a builder quote.
  Object.assign(x.a.app.property,{address,costRegion:1});
  Object.assign(x.a.app.scope,{quality:'premium',complexity:'normal',rooms,area:x.a.commercial.roomArea(rooms).area,renovationAreas:[],renovationCounts:{}});
  assert.equal(x.a.app.scope.area,area);assert.equal(Math.round(x.a.projectCost().mid),total);assert.ok(Math.abs(x.a.projectCost().mid-total)<.001,'currency arithmetic tolerance only');assert.equal(x.a.projectCost().secondaryCost,undefined);
 }finally{x.dom.window.close();}
});

test('mixed addition without structural intent cannot invent an opening',()=>{
 const x=setup('extend');try{
  x.a.app.scope.renovationAreas=['bathroom'];x.a.app.scope.renovationCounts={bathroom:1};delete x.a.app.scope.renovationExtent;
  const secondary=x.a.projectCost().secondaryCost;
  assert.equal(secondary.components.some(l=>l.key==='openplan'),false,'no opening was requested');
  assert.equal(secondary.mid,x.a.commercial.renovationCost({components:['bathroom'],quality:x.a.app.scope.quality,complexity:x.a.app.scope.complexity,region:x.a.app.property.costRegion||1}).mid);
 }finally{x.dom.window.close();}
});
test('project direction reset clears structural extent as well as measured extras',()=>{
 const x=setup();try{
  x.a.app.scope.renovationExtent='structural';x.a.chooseGoal('extend');
  assert.equal(x.a.app.scope.renovationExtent,undefined);
 }finally{x.dom.window.close();}
});
