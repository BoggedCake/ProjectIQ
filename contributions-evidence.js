(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.ContributionsEvidence=root.SitePivotContributions=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
// Reviewed public framework snapshot. No indexed s7.11 tariffs, HPC tariffs or property-specific prices.
const CHECKED='2026-10-16';
const SOURCES={
 northernBeaches:{name:'Northern Beaches Section 7.12 Contributions Plan 2024',url:'https://www.northernbeaches.nsw.gov.au/media/65178',effectiveFrom:'2024-10-19',checkedAt:CHECKED,sections:'2.4–2.8, 4.1–4.4, 6.1–6.5'},
 northernBeachesRegister:{name:'Council current development contributions plans',url:'https://www.northernbeaches.nsw.gov.au/planning-and-development/building-and-renovations/development-contributions',checkedAt:CHECKED},
 kiama:{name:'Kiama Section 7.12 Contributions Plan, June 2024 review',url:'https://www.kiama.nsw.gov.au/files/sharedassets/public/v/2/plans/plans-of-management/24-68883-section-7.12-contribution-plan-2024-final-document-pdf.pdf',effectiveFrom:'2024-06-28',checkedAt:CHECKED,sections:'3, 7–14, 22–24'},
 willoughby:{name:'Willoughby Local Infrastructure Contributions Plan 2019 — mixed framework',url:'https://www.willoughby.nsw.gov.au/Development/Plan/Development-Contributions',effectiveFrom:'2019-07-04',checkedAt:CHECKED},
 regulation:{name:'NSW Planning Portal — sections 208/209 statutory cost and levy guidance',url:'https://www.planningportal.nsw.gov.au/local-infrastructure-contributions/making-7-12-contributions-plan',checkedAt:CHECKED},
 hpc:{name:'NSW Housing and Productivity Contribution',url:'https://www.planningportal.nsw.gov.au/development-and-assessment/contributions/housing-and-productivity-contribution',checkedAt:CHECKED}
};
const EXCLUSIONS=['land','retained-building repairs','marketing and finance/interest','legal work','project management','building insurance','fittings/furnishings subject to expansion or intensification exception','stock inventory','statutory taxes/charges other than GST','disability access measures','energy/water efficiency measures','affordable housing costs','heritage adaptive reuse costs'];
const number=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0;
const date=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v?v:null;
function statutoryBase(input){
 const supplied=input.statutoryCostOfDevelopment;
 if(supplied&&number(supplied.amount))return {...supplied,exclusions:EXCLUSIONS,verified:supplied.verified===true&&supplied.exclusionsReviewed===true&&supplied.gstIncluded===true&&!!supplied.source};
 const components=input.cost?.components;
 if(!Array.isArray(components))return {amount:null,verified:false,source:null,exclusions:EXCLUSIONS};
 // Explicit cost-plan working proxy only: the mixed fee/contingency lines cannot establish a statutory determination.
 const included=new Set(['aboveGround','structure','basement','basementFitout','lifts','pool','externalWorks','groundAllowance','accessAllowance','professional','contingency','demolition']);
 const items=components.filter(c=>included.has(c.key)&&number(c.mid));
 return {amount:items.length?Math.round(items.reduce((sum,c)=>sum+c.mid,0)*1.1):null,verified:false,gstIncluded:true,source:'Working construction components plus 10% GST; provisional s208 proxy',includedComponents:items.map(c=>c.key),excludedComponents:components.filter(c=>!included.has(c.key)).map(c=>c.key),exclusions:EXCLUSIONS,note:'Consultants and contingency are provisional; mixed approvals, land, finance, selling and taxes excluded. Confirm demolition, subdivision, statutory exclusions and GST with the accepted cost report.'};
}
function assess(input){
 const i=input||{},p=i.property||{},project=i.project||{},council=String(p.council||p.lga||'').toLowerCase(),day=date(i.assessmentDate),base=statutoryBase(i),missing=[],reasons=[];
 const out={status:'requires-assessment',label:'Contribution requires assessment',amount:null,framework:null,rate:null,decisionReady:false,statutoryCostBase:base,missingInputs:missing,reasons,sources:[SOURCES.regulation],source:SOURCES.regulation.url,checkedAt:CHECKED,otherCharges:[{name:'Housing and Productivity Contribution',status:'requires-assessment',amount:null,source:SOURCES.hpc.url},{name:'Utility/headworks and other authority charges',status:'requires-assessment',amount:null}],indexation:{status:'not-applied',note:'Base-date levy only. Existing consent/payment requires indexed Council assessment.'}};
 const explicit=i.provisionalAllowance;
 const finish=()=>{
  if(out.amount===null&&explicit?.accepted===true&&number(explicit.amount)&&explicit.amount>0&&explicit.source){out.amount=explicit.amount;out.status='provisional';out.label='Explicit provisional contribution allowance';out.source=explicit.source;out.provisionalAllowance={...explicit,editable:true};}
  out.reason=reasons.join(' ');return out;
 };
 if(!day||day>CHECKED){missing.push('Current plan/source review for assessment date');reasons.push('Assessment date is missing, invalid or beyond the verified framework snapshot.');return finish();}
 let plan;
 if(/northern beaches/.test(council)){plan=SOURCES.northernBeaches;out.sources.push(plan,SOURCES.northernBeachesRegister);}
 else if(/kiama/.test(council)){plan=SOURCES.kiama;out.sources.push(plan);}
 else if(/willoughby/.test(council)){out.sources.push(SOURCES.willoughby);missing.push('Applicable s7.11/s7.12 development class, catchment, demand and indexed rates');reasons.push('Willoughby has a mixed s7.11/s7.12 framework; no blanket 1% levy is assumed.');return finish();}
 else {missing.push('Applicable council contributions plan and catchment');reasons.push('No verified contributions framework is configured for this council.');return finish();}
 out.source=plan.url;out.plan=plan;out.framework='section-7.12';
 const original=date(project.originalConsentDate||project.consentDate);
 if(day<plan.effectiveFrom||(original&&original<plan.effectiveFrom)||project.modification===true){missing.push('Original consent contribution condition and saved plan');reasons.push('Earlier determinations and modifications retain the applicable original plan; current plan cannot replace a saved condition.');return finish();}
 const catchment=p.contributionCatchment||{};
 if(plan===SOURCES.northernBeaches){
  const location=String(catchment.name||p.contributionArea||'').toLowerCase();
  if(/dee why|warriewood|frenchs forest/.test(location)){out.framework='section-7.11';missing.push('Site-specific s7.11 demand, credits, indexed rates and consent condition');reasons.push('Excluded Northern Beaches catchment requires its own s7.11 plan assessment.');return finish();}
  if(!catchment.verified&&/^(dee why|warriewood|frenchs forest)$/i.test(String(p.suburb||''))){missing.push('Plan-map boundary check');reasons.push('Suburb overlaps or may overlap an excluded contributions catchment.');return finish();}
  if(catchment.verified!==true||!catchment.source)missing.push('Parcel-based exclusion-catchment verification');
 }
 if(i.section711?.applicable===true||project.section711Imposed===true){out.framework='section-7.11';missing.push('Verified s7.11 assessment and current indexed condition amount');reasons.push('A section 7.11 condition prevents a section 7.12 levy on the same consent; no duplicate levy added.');return finish();}
 if(project.priorSubdivision711Paid===true&&project.additionalDemandVerified!==true){missing.push('Demand beyond the previously levied subdivision');reasons.push('Prior subdivision s7.11 payment requires a verified additional-demand review before a s7.12 levy.');return finish();}
 if(!project.type)missing.push('Development type and scope');
 if(!/^(DA|CDC)$/i.test(project.consentPath||project.pathway||''))missing.push('DA/CDC consent pathway');
 if(!original&&project.isNewApplication!==true)missing.push('New application or original consent/determination date');
 if(project.exemptionsReviewed!==true)missing.push('Plan exemptions and Ministerial Directions review');
 if(project.creditsReviewed!==true)missing.push('Council-approved credits, works-in-kind or planning agreement review');
 if(project.priorContributionsReviewed!==true)missing.push('Prior subdivision contributions and consent conditions review');
 if(!number(base.amount)){missing.push('Section 208 statutory development cost');reasons.push('Delivered project total is not a statutory development cost.');return finish();}
 if(base.verified!==true)missing.push('Council-accepted s208 cost report including GST and statutory exclusions');
 if(base.amount<=100000&&missing.length){reasons.push('Unverified cost/exemption evidence cannot establish a nil contribution.');return finish();}
 if(project.exemptionClaimed===true||project.creditClaimed===true||project.planningAgreement===true){missing.push('Council determination of exemption, credit or agreement');reasons.push('Claimed relief cannot be deducted without its approved basis.');return finish();}
 out.rate=base.amount<=100000?0:base.amount<=200000?.005:.01;
 out.amount=Math.round(base.amount*out.rate*100)/100;
 out.status=missing.length?'provisional':'assessed';out.label=missing.length?'Provisional s7.12 contribution allowance':'Assessed base s7.12 levy';out.decisionReady=!missing.length;
 if(missing.length)out.provisionalAllowance={amount:out.amount,rate:out.rate,editable:true,source:plan.url,basis:'Published plan rate × working statutory cost; unresolved applicability and cost checks remain explicit.'};
 reasons.push('Published plan rate applies to the whole statutory development cost, not net profit or land value. No s7.11 charge is added.');
 if(out.status==='provisional')reasons.push('Working allowance requires confirmation; it is not a Council contribution condition or indexed payment quote.');
 return finish();
}
return {assess,statutoryBase,SOURCES,CHECKED};
});
