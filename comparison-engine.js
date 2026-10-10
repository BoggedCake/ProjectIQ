/* Comparison arithmetic uses entered values; unknown finance and loan values stay unknown. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./commercial-engine.js'));else root.SitePivotComparison=factory(root.SitePivotCommercial)})(typeof globalThis!=='undefined'?globalThis:this,function(E){'use strict';
const labels={loanBalance:'Outstanding loan balance',buildingPest:'Building and pest inspection',finance:'Replacement project finance costs',holding:'Replacement project holding costs',futureProjectCost:'Replacement future project cost',keepProjectCost:'Current property project cost',keepFinance:'Current property project finance',keepHolding:'Current property holding / ownership costs'};
const money=n=>E.formatMoney(n),known=n=>n!==null&&n!==undefined&&n!=='';
function evaluate(input={}){
 const amounts={},unknowns=[],excludedCosts=[],keepBaselineAvailable=input.eligibility==null||input.eligibility.readyForFeasibility===true;
 const optionalHomeCosts=['finance','holding','futureProjectCost'];
 for(const [key,label]of Object.entries(labels)){
  const value=key==='keepProjectCost'&&!keepBaselineAvailable?null:input[key];if(!known(value)){
   // An existing home can be bought without undertaking a replacement project.
   // Explicitly disclose excluded project allowances; site development stays unknown.
   if(input.replacementType==='home'&&optionalHomeCosts.includes(key)){amounts[key]=0;excludedCosts.push(key);continue}
   amounts[key]=null;unknowns.push(label);continue
  }
  if(!Number.isFinite(+value)||+value<0)return{status:'review',reason:'Confirm a valid non-negative '+label.toLowerCase()+'.',unknowns};
  amounts[key]=+value;
 }
 // Keep finance outside transaction costs so each supplied allowance is added once.
 const changeover=E.moveComparison({...input,enabled:true,finance:0});
 if(changeover.status!=='indicative')return{...changeover,unknowns};
 const sum=keys=>keys.reduce((total,key)=>total+(amounts[key]??0),0);
 const completeSum=keys=>keys.every(key=>amounts[key]!==null)?sum(keys):null;
 const moveExtras=sum(['buildingPest','finance','holding','futureProjectCost']);
 const moveKnownCost=changeover.change+moveExtras,keepKnownCost=keepBaselineAvailable?sum(['keepProjectCost','keepFinance','keepHolding']):null;
 const comparisonKeys=['buildingPest','finance','holding','futureProjectCost','keepProjectCost','keepFinance','keepHolding'];
 const comparisonComplete=keepBaselineAvailable&&comparisonKeys.every(key=>amounts[key]!==null);
 const difference=keepKnownCost-moveKnownCost;
 const availableEquity=amounts.loanBalance===null?null:changeover.net-amounts.loanBalance;
 const mortgagePayoutShortfall=availableEquity===null?null:Math.max(0,-availableEquity);
 const requestedEquity=known(input.equityApplied)?+input.equityApplied:null;
 if(requestedEquity!==null&&(!Number.isFinite(requestedEquity)||requestedEquity<0||availableEquity!==null&&requestedEquity>Math.max(0,availableEquity)))return{status:'review',reason:'Confirm equity applied is non-negative and does not exceed available equity.',unknowns};
 const equityApplied=availableEquity===null?null:requestedEquity??Math.max(0,availableEquity);
 const transactionCosts=amounts.buildingPest===null?null:changeover.sellingCosts+changeover.purchaseCosts+amounts.buildingPest;
 const transactionCostsKnown=changeover.sellingCosts+changeover.purchaseCosts+(amounts.buildingPest??0);
 const replacementExtras=completeSum(['buildingPest','finance','holding','futureProjectCost']);
 const replacementExpenditure=replacementExtras===null?null:+input.purchase+changeover.purchaseCosts+replacementExtras;
 const totalProjectExpenditure=replacementExpenditure===null?null:changeover.sellingCosts+replacementExpenditure;
 const replacementFunding=replacementExpenditure===null||equityApplied===null?null:replacementExpenditure-equityApplied+mortgagePayoutShortfall;
 const fundingGap=replacementFunding;
 const netSaleEquity=availableEquity;
 let pathway='verify',summary='Complete the missing cost inputs before choosing whether to keep or sell.',reason='Unknown allowances are excluded from the known-cost subtotals, rather than treated as free.';
 if(!keepBaselineAvailable){summary='The current development has no verified achievable cost baseline. Review planning eligibility before comparing it with a replacement.';reason='Selling and buying costs can still be calculated, but an unverified current development cannot support a keep-or-sell recommendation.'}
 else if(input.keepGoalFit===true&&input.replacementGoalFit===false){pathway='keep';summary='Keep the current property: the replacement does not meet your stated goal.';reason='Goal suitability takes priority over a cheaper but unsuitable property.'}
 else if(input.keepGoalFit===false&&input.replacementGoalFit===true){pathway='sell-buy';summary='Explore selling and buying a replacement that meets your goal.';reason='The current property does not meet your goal; confirm the full costs and replacement evidence before proceeding.'}
 else if(comparisonComplete&&input.keepGoalFit===false&&input.replacementGoalFit===false){summary='Neither option meets your stated goal. Review the project or replacement criteria.';reason='A cost advantage alone does not make either option suitable.'}
 else if(input.replacementGoalFit===false){summary='The replacement does not meet your stated goal. Review the shortlist before comparing costs.';reason='An explicitly unsuitable replacement cannot be recommended on price.'}
 else if(input.keepGoalFit===false){summary='The current project does not meet your stated goal. Verify a suitable replacement and its full cost.';reason='The cheaper option must still meet your needs.'}
 else if(comparisonComplete&&difference>0){pathway='sell-buy';summary='Explore selling and buying: entered costs are '+money(difference)+' lower than keeping and carrying out the current project.';reason='This compares the purchase-minus-sale gap, transaction costs and entered project/holding/finance costs; confirm both options achieve your goal.'}
 else if(comparisonComplete&&difference<0){pathway='keep';summary='Keeping and carrying out the current project is '+money(-difference)+' cheaper on the entered costs.';reason='Confirm the current project is achievable and delivers the home or development outcome you need.'}
 else if(comparisonComplete){summary='The entered costs are equal; choose using goal suitability and timing.';reason='Neither pathway has a demonstrated cost advantage.'}
 const isSite=input.replacementType==='site';
 const replacementCriteria=isSite?[
  'Ask a planner to verify permissibility for '+(input.goal||'the intended development')+' on each shortlisted site, including dual occupancy and subdivision rights separately where relevant.',
  'Verify legal lot identity, area and surveyed frontage against the applicable lot size, frontage and subdivision controls.',
  'Review planning overlays, hazards, access, servicing, setbacks, height, floor space and the realistic CDC or DA route before exchange.'
 ]:[
  'Shortlist homes that meet your required bedrooms, bathrooms, parking, living space, location and accessibility.',
  'Check building condition, inspection findings and any planned alteration costs against the all-in budget.',
  'Ask a planner to verify any future extension, rebuilding or development proposal against the property controls and overlays.'
 ];
 for(const criterion of Array.isArray(input.replacementCriteria)?input.replacementCriteria:[])if(String(criterion).trim())replacementCriteria.push(String(criterion).trim());
 const nextSteps=[
  'Obtain a local agent appraisal and confirm selling fees and marketing costs.',
  'Get the outstanding loan payout and net equity figures from your lender.',
  'Ask a mortgage broker or lender to confirm borrowing capacity and finance costs.',
  'Set an all-in purchase budget including NSW transfer duty, legal fees, inspections, moving and any future project.',
  'Have a planner review each replacement property against your planning criteria before committing.',
  'Agree the buy / sell sequence, settlement timing and any bridging risk with your agent, conveyancer and lender.'
 ];
 return{status:'indicative',changeover,transactionGap:changeover.change,transactionCosts,transactionCostsKnown,availableEquity,mortgagePayoutShortfall,equityApplied,replacementExpenditure,totalProjectExpenditure,replacementFunding,netSaleEquity,keepBaselineAvailable,capitalNeededAfterLoan:fundingGap===null?null:Math.max(0,fundingGap),releasedEquityAfterPurchase:fundingGap===null?null:Math.max(0,-fundingGap),costs:{...amounts,transactionCost:transactionCosts,transactionCosts,transactionCostsKnown,moveKnownCost,keepKnownCost,keepTotalCost:keepBaselineAvailable?completeSum(['keepProjectCost','keepFinance','keepHolding']):null},unknowns,comparisonComplete,costAdvantage:comparisonComplete?difference:null,recommendation:{pathway,summary,reason},replacementCriteria,nextSteps,assumptions:{transactionAllowances:changeover.assumptions,providedCosts:Object.keys(labels).filter(key=>amounts[key]!==null&&!excludedCosts.includes(key)),excludedCosts,replacementScope:excludedCosts.length?'Existing home purchase: '+excludedCosts.map(key=>labels[key]).join(', ')+' excluded because no allowance was entered. Add an allowance if planned.':input.replacementType==='home'?'Existing home purchase including all entered replacement project allowances.':'Replacement site project allowances must be entered or verified; omitted values remain unknown.',costPeriod:'Compare both options over the same period and project scope.',tax:'Tax implications are unquantified; obtain advice for your circumstances.',funding:'Funding includes any existing mortgage payout shortfall separately from project expenditure. Equity and the capital gap are arithmetic only, not available cash or borrowing approval.',values:'Sale and purchase values are user inputs, not verified market appraisals.'}};
}
return{evaluate};});
