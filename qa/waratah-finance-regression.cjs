'use strict';
const assert=require('node:assert/strict'),E=require('../commercial-engine.js');
const near=(a,b)=>assert.ok(Math.abs(a-b)<.01,`${a} != ${b}`);
const cost=E.deliveredCost({area:600,basementArea:200,quality:'premium',configuration:'two-storey-basement'});
const acquisition={purchasePrice:3862000,deposit:386200,cashContribution:1158600,loanAmount:2703400,stampDuty:193697,legal:3000,dueDiligence:2000,otherCosts:0,annualRate:.075,settlementMonths:2};
const base={eligibility:{readyForFeasibility:true},ownershipRole:'buyer',acquisition,cost,products:[{count:2,value:5000000}],contributions:{status:'user-allowance',amount:35000},exitStrategy:'sell',interestRate:.09,constructionBorrowingRatio:1,taxPct:0,marketing:10000,saleLegal:4000,saleSettlement:1000,disposalCosts:2000};
const sell=E.feasibility(base);assert.equal(sell.selling,220000);near(sell.sellingBreakdown.commission,200000);near(sell.sellingBreakdown.commissionGST,20000);
near(sell.financeSchedule.constructionBorrowing,cost.constructionMid*1.1);assert.ok(sell.financeSchedule.constructionBorrowing<cost.mid);
near(sell.total,sell.costReconciliation.reduce((n,l)=>n+l.amount,0));near(sell.cashFunding.netSaleProceeds-sell.cashFunding.cashEquityRequired,sell.profit);
near(sell.financeSchedule.rows.reduce((n,r)=>n+r.constructionDraw,0),sell.financeSchedule.constructionBorrowing);assert.ok(Object.keys(sell.sensitivities).length>=3);
near(sell.breakEvenRevenue,(sell.total-sell.selling)/(1-.022));near(sell.profitOnCost,sell.profit/sell.total);near(sell.profitOnGrv,sell.profit/10000000);
const hold=E.feasibility({...base,exitStrategy:'retain'});assert.equal(hold.selling,0);assert.equal(hold.marketing,0);assert.equal(hold.saleLegal,0);assert.equal(hold.taxSensitivity,0);assert.equal(hold.profit,null);assert.equal(hold.cashFunding.netSaleProceeds,null);assert.equal(hold.cashFunding.cashSurplusAfterReturnOfEquity,null);assert.equal(hold.financeSchedule.repaymentAtSettlement,0);near(hold.holdModel.completedValue,10000000);near(hold.holdModel.equityAtCompletion,10000000-hold.holdModel.debtAtCompletion);assert.ok(hold.holdModel.debtAtCompletion>2703400);
for(const scenario of Object.values(sell.costScenarios)){near(scenario.financeSchedule.constructionBorrowing,scenario.eligibleConstruction);near(scenario.total,scenario.costReconciliation.reduce((n,l)=>n+l.amount,0))}
assert.equal(E.feasibility({...base,contributions:{}}).status,'review');assert.equal(E.feasibility({...base,eligibility:{category:'prohibited'}}).status,'review');
near(E.feasibility({...base,exitStrategy:undefined,sellingPct:.025}).selling,250000);
const missingBreakdown=E.feasibility({...base,cost:{mid:2000000}});assert.equal(missingBreakdown.status,'review');
const lower=E.feasibility({...base,interestRate:.07,acquisition:{...acquisition,annualRate:.055}}),delayed=E.feasibility({...base,delayMonths:3});assert.ok(lower.finance<sell.finance);assert.ok(delayed.finance>sell.finance);assert.equal(sell.financeSchedule.assumption.interestRate,.09);
near(sell.financeSchedule.sensitivities.delayPlus3.interest,delayed.finance);


const taxed=E.feasibility({...base,taxPct:.04});assert.ok(taxed.sensitivities.ratePlus1.interest>taxed.finance);
const down=taxed.sensitivities.salePriceMinus10,up=taxed.sensitivities.salePricePlus10;assert.equal(down.grv,9000000);assert.equal(up.grv,11000000);assert.equal(down.selling,198000);assert.equal(down.taxSensitivity,360000);near(down.profit,down.grv-down.total);near(down.breakEvenRevenue,taxed.breakEvenRevenue);assert.ok(taxed.sensitivities.constructionCostPlus10.finance>taxed.finance);near(taxed.sensitivities.constructionCostPlus10.delivery,cost.mid*1.1);
for(const v of Object.values(hold.sensitivities)){assert.equal(v.profit,null)}assert.equal(hold.sensitivities.completedValueMinus10.holdModel.completedValue,9000000);

assert.equal(sell.sellingBreakdown.total,sell.sellingBreakdown.commission+sell.sellingBreakdown.commissionGST);


const extras=E.feasibility({...base,otherAuthorityCosts:42000,financeExitFee:9000});near(extras.total,sell.total+51000);near(extras.cashFunding.ancillaryCash,sell.cashFunding.ancillaryCash+51000);near(extras.financeSchedule.constructionBorrowing,sell.financeSchedule.constructionBorrowing);near(extras.total,extras.costReconciliation.reduce((n,l)=>n+l.amount,0));assert.equal(extras.costReconciliation.filter(l=>l.key==='otherAuthorityCosts').length,1);assert.equal(extras.costReconciliation.filter(l=>l.key==='financeExitFee').length,1);
const verifiedBase={...base,contributions:{status:'verified-exemption',source:'Synthetic arithmetic fixture',reason:'Explicit fixture exemption'}};const unresolved=E.feasibility(verifiedBase);assert.equal(unresolved.decisionReady,false);assert.ok(unresolved.provisionalAssumptions.some(s=>/other authority.*unresolved/i.test(s)));assert.equal(E.feasibility({...verifiedBase,otherAuthorityCosts:0}).decisionReady,true);
assert.equal(E.feasibility({...base,otherAuthorityCosts:-1}).status,'review');assert.equal(E.feasibility({...base,financeExitFee:-1}).status,'review');

console.log('PASS Waratah sell/retain, commission GST, progressive funding, sensitivities and distinct authority / finance fees');
