/* Comparison arithmetic uses entered values; unknown finance and loan values stay unknown. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./commercial-engine.js'));else root.SitePivotComparison=factory(root.SitePivotCommercial)})(typeof globalThis!=='undefined'?globalThis:this,function(E){'use strict';
const labels={loanBalance:'Outstanding loan balance',buildingPest:'Building and pest inspection',finance:'Finance / refinance costs',holding:'Replacement holding / ownership costs',futureProjectCost:'Replacement future project cost',keepProjectCost:'Current property project cost',keepFinance:'Current property project finance',keepHolding:'Current property holding / ownership costs'};
const money=n=>E.formatMoney(n),known=n=>n!==null&&n!==undefined&&n!=='';
function evaluate(input={}){
 const amounts={},unknowns=[];
 for(const [key,label]of Object.entries(labels)){
  const value=input[key];if(!known(value)){amounts[key]=null;unknowns.push(label);continue}
  if(!Number.isFinite(+value)||+value<0)return{status:'review',reason:'Confirm a valid non-negative '+label.toLowerCase()+'.',unknowns};
  amounts[key]=+value;
 }
 // Keep finance outside transaction costs so each supplied allowance is added once.
 const changeover=E.moveComparison({...input,enabled:true,finance:0});
 if(changeover.status!=='indicative')return{...changeover,unknowns};
 const sum=keys=>keys.reduce((total,key)=>total+(amounts[key]??0),0);
 const moveExtras=sum(['buildingPest','finance','holding','futureProjectCost']);
 const moveKnownCost=changeover.change+moveExtras,keepKnownCost=sum(['keepProjectCost','keepFinance','keepHolding']);
 const comparisonKeys=['buildingPest','finance','holding','futureProjectCost','keepProjectCost','keepFinance','keepHolding'];
 const comparisonComplete=comparisonKeys.every(key=>amounts[key]!==null);
 const difference=keepKnownCost-moveKnownCost;
 const netSaleEquity=amounts.loanBalance===null?null:changeover.net-amounts.loanBalance;
 const fundingGap=netSaleEquity===null?null:input.purchase*1+changeover.purchaseCosts+moveExtras-netSaleEquity;
 let pathway='verify',summary='Complete the missing cost inputs before choosing whether to keep or sell.',reason='Unknown allowances are excluded from the known-cost subtotals, rather than treated as free.';
 if(input.keepGoalFit===true&&input.replacementGoalFit===false){pathway='keep';summary='Keep the current property: the replacement does not meet your stated goal.';reason='Goal suitability takes priority over a cheaper but unsuitable property.'}
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
 return{status:'indicative',changeover,transactionGap:changeover.change,netSaleEquity,capitalNeededAfterLoan:fundingGap===null?null:Math.max(0,fundingGap),releasedEquityAfterPurchase:fundingGap===null?null:Math.max(0,-fundingGap),costs:{...amounts,transactionCost:changeover.totalChangeoverCost,moveKnownCost,keepKnownCost},unknowns,comparisonComplete,costAdvantage:comparisonComplete?difference:null,recommendation:{pathway,summary,reason},replacementCriteria,nextSteps,assumptions:{transactionAllowances:changeover.assumptions,providedCosts:Object.keys(labels).filter(key=>amounts[key]!==null),costPeriod:'Compare both options over the same period and project scope.',tax:'Tax implications are unquantified; obtain advice for your circumstances.',funding:'Equity and the capital gap are arithmetic only, not available cash or borrowing approval.',values:'Sale and purchase values are user inputs, not verified market appraisals.'}};
}
return{evaluate};});
