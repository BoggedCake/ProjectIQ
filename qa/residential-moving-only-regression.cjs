'use strict';
const {JSDOM,VirtualConsole}=require('jsdom'),fs=require('node:fs'),assert=require('node:assert/strict');
const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const d=new JSDOM(fs.readFileSync('index.html','utf8'),{url:'http://localhost/?fixtures=1',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.scrollTo=()=>{};for(const m of ['fsr-evidence','property-evidence','planning-intelligence','commercial-engine','comparison-engine','conversation','voice'])w.eval(fs.readFileSync(m+'.js','utf8'))}});
try{
const a=d.window.SitePivot,doc=d.window.document;a.selectProperty(a.FIXTURES[0]);a.app.goal='unsure';Object.assign(a.app.scope,{moveEnabled:true,area:null,moveSale:2000000,targetPurchase:2500000,moveLoanBalance:800000,moveContractDate:'2026-10-10'});delete a.app.scope.moveFinance;delete a.app.scope.moveHolding;delete a.app.scope.replacementProjectCost;
a.show('scope');assert.equal(doc.querySelectorAll('[data-room]').length,0);assert.equal(doc.querySelector('#scopeQuality'),null);assert.equal(doc.querySelector('#keepFinance'),null);assert.equal(doc.querySelector('#moveFinance').value,'$0');assert.match(doc.querySelector('#moveFields').textContent,/Zero is a working assumption/);
let r=a.computeAssessment().comparison;assert.equal(r.transactionCosts,190787);assert.equal(r.availableEquity,1137500);assert.equal(r.replacementExpenditure,2628287);assert.equal(r.capitalNeededAfterLoan,1490787);assert.equal(r.costs.keepProjectCost,null);assert.equal(r.recommendation.pathway,'verify');
a.show('assessment');const text=doc.querySelector('#consumerResult').textContent;assert.match(text,/1,490,787/);assert.doesNotMatch(text,/Likely cost|Confirm your project scope|Selected work|Working midpoint/);
a.show('scope');const replacement=doc.querySelector('#replacementType');replacement.value='site';replacement.dispatchEvent(new d.window.Event('change'));assert.equal(doc.querySelector('#moveFinance').value,'');r=a.computeAssessment().comparison;assert.equal(r.capitalNeededAfterLoan,null);assert.equal(r.replacementExpenditure,null);
replacement.value='home';doc.querySelector('#replacementType').value='home';doc.querySelector('#replacementType').dispatchEvent(new d.window.Event('change'));Object.assign(a.app.scope,{moveFinance:12000,moveHolding:4000,replacementProjectCost:100000});r=a.computeAssessment().comparison;assert.equal(r.capitalNeededAfterLoan,1606787);assert.equal(r.costs.keepProjectCost,null);
delete a.app.scope.moveLoanBalance;assert.equal(a.computeAssessment().comparison.capitalNeededAfterLoan,null);
assert.deepEqual(errors,[]);console.log('PASS moving-only home funding reconciles with disclosed editable optional allowances; site costs and missing principal stay unknown');
}finally{d.window.close()}
