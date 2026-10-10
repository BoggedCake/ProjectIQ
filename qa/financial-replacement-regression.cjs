'use strict';
const assert=require('node:assert/strict'),Q=require('../comparison-engine');
// Removing the ready-home exclusion policy must make the founder arithmetic fail.
const founder={replacementType:'home',goal:'storey',sale:2700000,purchase:3300000,contractDate:'2026-10-10',sellingPct:.025,marketing:10000,saleLegal:2000,discharge:500,loanBalance:1900000,purchaseLegal:3000,searches:500,moving:5000,buildingPest:1000,keepProjectCost:900000,keepFinance:20000,keepHolding:10000};
const r=Q.evaluate(founder);
assert.equal(r.changeover.sellingCosts,80000);
assert.equal(r.changeover.duty,162787);
assert.equal(r.changeover.purchaseCosts,171287);
assert.equal(r.transactionCosts,252287);
assert.equal(r.availableEquity,720000);
assert.equal(r.replacementExpenditure,3472287,'an ordinary home purchase is available without future project allowances');
assert.equal(r.replacementFunding,2752287);
assert.equal(r.capitalNeededAfterLoan,2752287);
assert.equal(r.totalProjectExpenditure,3552287);
assert.deepEqual(r.assumptions.excludedCosts,['finance','holding','futureProjectCost']);
assert.match(r.assumptions.replacementScope,/excluded|not included/i);
assert.deepEqual(r.assumptions.providedCosts,['loanBalance','buildingPest','keepProjectCost','keepFinance','keepHolding']);
assert.equal(r.unknowns.includes('Replacement project finance costs'),false);
assert.match(r.assumptions.funding,/not .*borrowing approval/i);
for(const key of ['finance','holding','futureProjectCost']){
 for(const omitted of [undefined,null,''])assert.equal(Q.evaluate({...founder,[key]:omitted}).replacementExpenditure,3472287,key);
 for(const invalid of [-1,'invalid',Infinity])assert.equal(Q.evaluate({...founder,[key]:invalid}).status,'review',key);
 const supplied=Q.evaluate({...founder,[key]:1234});
 assert.equal(supplied.replacementExpenditure,3473521,key);
 assert.equal(supplied.replacementFunding,2753521,key);
 assert.equal(supplied.costs[key],1234,key);
 assert.equal(supplied.assumptions.excludedCosts.includes(key),false,key);
 assert.equal(supplied.assumptions.providedCosts.includes(key),true,key);
}
const suppliedAll=Q.evaluate({...founder,finance:12000,holding:4000,futureProjectCost:100000});
assert.equal(suppliedAll.replacementExpenditure,3588287);
assert.deepEqual(suppliedAll.assumptions.excludedCosts,[]);
for(const replacementType of ['site',undefined]){
 const unknown=Q.evaluate({...founder,replacementType});
 assert.equal(unknown.replacementExpenditure,null);
 assert.equal(unknown.replacementFunding,null);
 assert.equal(unknown.costs.finance,null);
 assert.equal(unknown.costs.holding,null);
 assert.equal(unknown.costs.futureProjectCost,null);
 assert.equal(unknown.comparisonComplete,false);
}
const missingDebt=Q.evaluate({...founder,loanBalance:undefined});
assert.equal(missingDebt.replacementExpenditure,3472287);
assert.equal(missingDebt.replacementFunding,null);
assert.equal(missingDebt.equityApplied,null);
assert.equal(missingDebt.capitalNeededAfterLoan,null);
const missingInspection=Q.evaluate({...founder,buildingPest:undefined});
assert.equal(missingInspection.transactionCosts,null);
assert.equal(missingInspection.replacementExpenditure,null);
const unsupported=Q.evaluate({...founder,keepGoalFit:true,replacementGoalFit:false,eligibility:{status:'prohibited',readyForFeasibility:false}});
assert.equal(unsupported.recommendation.pathway,'verify');
assert.equal(unsupported.keepBaselineAvailable,false);
assert.equal(unsupported.costs.keepTotalCost,null);
assert.equal(unsupported.replacementFunding,2752287);
console.log('PASS ready-home replacement costs, excluded optional allowances, preserved inputs and unknown funding guards');

const saving=Q.evaluate({...founder,keepFinance:-10000,keepFinanceIsModelledNet:true});assert.equal(saving.status,"indicative");assert.equal(saving.costs.keepTotalCost,900000);assert.equal(Q.evaluate({...founder,keepFinance:-10000}).status,"review");
