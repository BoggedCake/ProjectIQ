'use strict';
const assert=require('node:assert/strict'),E=require('../commercial-engine.js');
const base={eligibility:{readyForFeasibility:true},land:3500000,cost:{mid:2000000,low:1800000,high:2200000,excludedCosts:[],includedCosts:[]},products:[{count:2,value:4000000}],contributions:{status:'user-allowance',amount:0},landDebt:0,interestRate:.1,constructionBorrowingRatio:.5,preconstructionMonths:0,constructionMonths:12,settlementMonths:0,capitaliseInterest:false,financeEstablishment:0,holding:0,sellingPct:0,marketing:0,legal:0,taxPct:0};
const acquisition={purchasePrice:3500000,deposit:350000,cashContribution:1050000,loanAmount:2450000,stampDuty:180000,legal:4000,dueDiligence:3000,otherCosts:2000,annualRate:.08,settlementMonths:2};
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
const owner=E.feasibility({...base,ownershipRole:'owner'}),buyer=E.feasibility({...base,ownershipRole:'buyer',acquisition});
assert.equal(buyer.ownershipRole,'buyer','explicit buyer must branch rather than inherit owner opportunity equity');
near(owner.total,5550000);near(buyer.finance,246000);near(buyer.total,5935000);near(buyer.profit,2065000);
near(buyer.financeSchedule.landEquity,1050000);near(buyer.financeSchedule.acquisitionBorrowing,2450000);
near(buyer.cashFunding.depositCash,350000);near(buyer.cashFunding.settlementCash,889000);near(buyer.cashFunding.peakCashRequirement,2485000);
near(buyer.cashFunding.cashEquityRequired,2485000);near(buyer.cashFunding.netSaleProceeds,4550000);near(buyer.cashFunding.returnOnCashEquity,2065000/2485000);
near(buyer.incrementalCashCost,5935000);near(buyer.total,buyer.costReconciliation.reduce((s,l)=>s+l.amount,0));
assert.equal(buyer.costReconciliation.filter(l=>l.key==='landPurchase').length,1);assert.equal(buyer.costReconciliation.some(l=>/deposit|principal/i.test(l.key)),false);
assert.equal(buyer.financeSchedule.rows.length,14);assert.equal(buyer.financeSchedule.rows[0].phase,'acquisition');near(buyer.financeSchedule.rows[0].interest,0);
near(buyer.financeSchedule.rows.reduce((s,r)=>s+r.equityContribution,0),buyer.cashFunding.peakCashRequirement);
near(buyer.financeSchedule.rows.reduce((s,r)=>s+r.settlementRepayment,0),3450000);
for(const bad of [{},{...acquisition,deposit:3500001},{...acquisition,cashContribution:700000},{...acquisition,annualRate:undefined},{...acquisition,otherCosts:undefined},{...acquisition,loanAmount:-1}])assert.equal(E.feasibility({...base,ownershipRole:'buyer',acquisition:bad}).status,'review');
assert.equal(E.feasibility({...base,ownershipRole:'buyer',provisional:true}).status,'review');
assert.equal(E.feasibility({...base,ownershipRole:'buyer',acquisition,eligibility:{category:'prohibited'}}).status,'review');
const cash=E.feasibility({...base,ownershipRole:'buyer',acquisition:{...acquisition,cashContribution:3500000,loanAmount:0},constructionBorrowingRatio:0});near(cash.finance,0);near(cash.cashFunding.peakCashRequirement,5689000);
const cap=E.feasibility({...base,ownershipRole:'buyer',acquisition,capitaliseInterest:true});assert.ok(cap.finance>buyer.finance);near(cap.cashFunding.peakCashRequirement,2239000);near(cap.cashFunding.netSaleProceeds-cap.cashFunding.cashEquityRequired,cap.profit);
const legacy=E.feasibility(base);near(legacy.total,owner.total);near(legacy.cashRequirement,2050000);near(owner.cashFunding.peakCashRequirement,1050000);
for(const band of ['low','mid','high']){const f=buyer.costScenarios[band];near(f.total,f.costReconciliation.reduce((s,l)=>s+l.amount,0));near(f.cashFunding.netSaleProceeds-f.cashFunding.cashEquityRequired,f.profit);}
// Missing role preserves historical schedule cash lines as well as economic results.
const oldCash=E.feasibility({...base,holding:15000});near(oldCash.financeSchedule.rows.reduce((s,r)=>s+r.equityContribution,0),1050000);
const roleCash=E.feasibility({...base,ownershipRole:'owner',holding:15000});near(roleCash.financeSchedule.rows.reduce((s,r)=>s+r.equityContribution,0),1065000);
near(buyer.cashRequirement,buyer.cashFunding.peakCashRequirement);near(owner.cashRequirement,owner.cashFunding.peakCashRequirement);
assert.equal(E.feasibility({...base,ownershipRole:'buyer',acquisition:{...acquisition,otherCosts:true}}).status,'review');

// Cash-funded works do not erase or reject the independently financed land acquisition.
const cashWorks=E.feasibility({...base,ownershipRole:'buyer',acquisition,financeMode:'cash',financeEstablishment:9999});
assert.notEqual(cashWorks.status,'review','cash-funded construction permits an explicit acquisition loan');
near(cashWorks.financeSchedule.constructionBorrowing,0);near(cashWorks.financeEstablishment,0);
near(cashWorks.financeSchedule.acquisitionBorrowing,2450000);near(cashWorks.financeSchedule.landDebt,2450000);
near(cashWorks.finance,196000);near(cashWorks.financeSchedule.acquisitionInterest,196000);
near(cashWorks.financeSchedule.repaymentAtSettlement,2450000);near(cashWorks.cashFunding.peakCashRequirement,3435000);
near(cashWorks.cashFunding.netSaleProceeds-cashWorks.cashFunding.cashEquityRequired,cashWorks.profit);
const fullyCash=E.feasibility({...base,ownershipRole:'buyer',acquisition:{...acquisition,cashContribution:3500000,loanAmount:0},financeMode:'cash'});
near(fullyCash.finance,0);near(fullyCash.financeSchedule.repaymentAtSettlement,0);
near(fullyCash.financeSchedule.constructionBorrowing,0);near(fullyCash.financeSchedule.acquisitionBorrowing,0);
near(fullyCash.cashFunding.peakCashRequirement,5689000);

console.log('PASS ownership financial branching, acquisition validation, timing, capitalisation and cash/economic reconciliation');

const indebtedOwner=E.feasibility({...base,ownershipRole:'owner',landDebt:1500000});near(indebtedOwner.finance,200000);near(indebtedOwner.profit,2300000);near(indebtedOwner.financeSchedule.landEquity,2000000);near(indebtedOwner.cashFunding.peakCashRequirement,1200000);near(indebtedOwner.cashFunding.purchaseCash,0);console.log('PASS owner confirmed existing debt changes interest and new cash, not construction quantities or acquisition outlay');
