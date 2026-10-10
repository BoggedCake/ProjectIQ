/* Shared browser/server arithmetic. Values are indicative versioned assumptions, not quotes. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./property-evidence.js'));else root.SitePivotCommercial=factory(root.PropertyEvidence)})(typeof globalThis!=='undefined'?globalThis:this,function(Spatial){'use strict';
const VERSION='duplex-cost-2026-10-09-v2',ROOMS={bedroom:14,masterSuite:30,bathroom:10,living:30,kitchenLiving:40,office:10,garage:36,upperLevel:100,other:0,laundry:8};
const numeric=n=>n!==null&&n!==''&&n!==undefined&&Number.isFinite(+n),positive=n=>numeric(n)&&+n>0;
// Working duplex assumptions, not published QS duplex tariffs. Base rates exclude GST,
// site/external works, consultants, approvals and contingency; include builder margin/preliminaries.
const COST_SOURCES=[
 {id:'bmt-2026',name:'BMT Quantity Surveyors construction cost table 2026',url:'https://prod.bmtqs.com.au/construction-cost-table',accessed:'2026-10-09',scope:'Sydney GFA building comparators, ex GST; preliminaries, builder profit/overheads included. Not exact duplex rates.',use:'Primary comparator for base hard costs; no automatic index uplift.'},
 {id:'abs-jun26',name:'ABS Producer Price Indexes Australia June 2026',url:'https://www.abs.gov.au/statistics/economy/price-indexes-and-inflation/producer-price-indexes-australia/jun-2026',scope:'NSW house output +2.0% quarter, +4.8% year; price movement, not a dollar rate.',use:'Trend/context only, not added again to 2026 rates.'},
 {id:'rlb-2026',name:'RLB Riders Digest Sydney 2026',url:'https://www.rlb.com/wp-content/uploads/sites/1/2026/01/2026-RLB-Rider-Digest_Sydney_Digital_2.pdf',scope:'2026 publication confirmed; public PDF retrieval returned 403. Numeric tables not independently verified.',use:'Publication provenance only; no reproduced rate used.'},
 {id:'tt-2026',name:'Turner & Townsend Global Construction Market Intelligence 2026 Australia and New Zealand',url:'https://publications.turnerandtownsend.com/global-construction-market-intelligence-2026/australia-and-new-zealand',scope:'Regional capacity and procurement context; commercial trade data do not price a small duplex.',use:'Risk context only.'},
 {id:'cordell-jun26',name:'Cotality public Cordell CCCI June 2026 release',url:'https://www.cotality.com/au/press-releases/construction-costs-rebound-to-steady-growth',published:'2026-07-22',scope:'National construction index +1.0% quarter/+2.8% year; NSW +1.1% quarter. Public index, no licensed line-item access.',use:'Trend context only; no licensed Cordell rates used.'},
 {id:'rawlinsons-2026',name:'Rawlinsons 2026 publications',url:'https://www.rawlhouse.com.au/publications/2026-australian-construction-handbook',scope:'Edition availability verified; licensed rate data not available in this session.',use:'Not used for numeric calibration; no proprietary rate reproduction.'},
 {id:'hia-jun26',name:'HIA Trades Report June quarter 2026 release',url:'https://hia.com.au/our-industry/newsroom/economic-research-and-forecasting/2026/07/tradie-shortages-remain-entrenched-despite-housing-market-uncertainty',scope:'Residential trades availability index -0.59; ongoing shortages.',use:'Risk context only.'}
];
const COST_CONFIGS={
 'two-storey':{label:'2 levels — 2 above ground, no basement',aboveGroundLevels:2,basementLevels:0,totalLevels:2,structuralRate:[0,0,0],defaultLiftsPerDwelling:0},
 'two-storey-basement':{label:'3 levels — basement + 2 above ground',aboveGroundLevels:2,basementLevels:1,totalLevels:3,structuralRate:[0,0,0],defaultLiftsPerDwelling:0},
 'three-level-basement':{label:'4 levels — basement + 3 above ground',aboveGroundLevels:3,basementLevels:1,totalLevels:4,structuralRate:[200,350,600],defaultLiftsPerDwelling:1}
};
const COST_BANDS={volume:[2300,2700,3200],standard:[3100,3550,4100],custom:[3100,3550,4100],premium:[3700,4400,5200],prestige:[4000,5000,6200],luxury:[4800,6100,8000],'luxury-development':[4800,6100,8000]};
const COST_SPECIFICATIONS={volume:'Volume-builder duplex: repeatable shelf design and basic specification',standard:'Standard custom duplex: unique design, economical fixtures',custom:'Standard custom duplex: unique design, economical fixtures',premium:'Premium custom duplex: quality modern finishes and envelope',prestige:'Prestige architectural duplex: complex envelope, higher joinery and fixture specification',luxury:'Luxury development: bespoke design and top-end fitout','luxury-development':'Luxury development: bespoke design and top-end fitout'};
const COST_EXCLUSIONS=['land','demolition','authorityContributions','finance','holding','selling','marketing','legal','taxSensitivity','exceptionalGround','contamination','pool','looseFurniture','serviceUpgrades'];
function rateCard(input={}){
 const {quality='premium',configuration='two-storey',region='NSW',customRate,projectType='duplex'}=input;
 const review=reason=>({status:'review',reason,version:VERSION,quality,configuration,region});
 if(configuration==='custom'){
  if(!positive(customRate))return review('A custom configuration needs an explicit QS/builder delivered rate.');
  return{status:'indicative',quality,configuration,region,projectType,rateLow:+customRate,rateMid:+customRate,rateHigh:+customRate,includedCosts:['construction','professional','approvals','externalWorks','contingency'],excludedCosts:COST_EXCLUSIONS,version:VERSION,custom:true,taxBasis:'User delivered rate assumed GST inclusive; confirm its inclusions.',note:'Explicit user/QS delivered rate. No additional soft costs or contingency added.'};
 }
 if(projectType!=='duplex')return review('This rate card is calibrated for a two-dwelling duplex. Other development types need project-specific QS rates.');
 if(!COST_BANDS[quality])return review('Confirm the selected construction and finish specification.');
 if(!COST_CONFIGS[configuration])return review('Confirm the number of above-ground and basement levels.');
 if(!/^(NSW|Sydney|Greater Sydney|Northern Beaches|Sydney Northern Beaches|North Shore|Eastern Suburbs|Inner West|Western Sydney)$/i.test(String(region)))return review('The public comparator is Sydney. Confirm a local QS/builder rate for this region.');
 const config=COST_CONFIGS[configuration],base=COST_BANDS[quality],basement=[2600,3400,4600];
 // Reconcile against supplied area, or a disclosed reference only when no area is given.
 // Actual delivery uses quantity and fixed allowance lines, never a reference rate multiplier.
 const card={status:'indicative',quality,configuration,configurationDetails:{...config},region,projectType,specification:COST_SPECIFICATIONS[quality],locationReference:'Sydney',locationFactor:1,locationAssumption:String(region).toUpperCase()==='NSW'?'Sydney reference within NSW; regional site/location not confirmed':'Sydney metropolitan reference; no suburb prestige uplift',baseHardRates:{low:base[0],mid:base[1],high:base[2]},basementHardRates:{low:basement[0],mid:basement[1],high:basement[2]},includedCosts:['construction','professional','approvals','externalWorks','contingency'],excludedCosts:COST_EXCLUSIONS,version:VERSION,asOf:'2026-10-09',sources:COST_SOURCES,rateBasis:positive(input.area)?'Actual delivered total divided by supplied total constructed area; fixed allowances vary effective rates.':'Delivered reference rate at 440 m² total constructed area, two dwellings; actual costs recomputed for supplied quantities.',taxBasis:'GST 10% added once to hard works, consultants and construction contingency; approval allowance assumed gross statutory/report fees. Separate project GST/tax adjustment required.',note:'Working duplex estimate informed by public QS building comparators, not a quote or published duplex tariff. Total area includes basement; land value and suburb prestige do not select finish. Ordinary site and access allowances are explicit; exceptional conditions are excluded.'};
 const referenceArea=positive(input.area)?+input.area:440;
 const cost=deliveredCost({...input,area:referenceArea,rateCard:card});
 if(cost.status==='review')return{...card,status:'review',reason:cost.reason};
 return{...card,rateLow:cost.low/referenceArea,rateMid:cost.mid/referenceArea,rateHigh:cost.high/referenceArea};
}
function deliveredCost(input={}){
 const r=input.rateCard||rateCard(input),review=reason=>({...r,status:'review',low:null,mid:null,high:null,reason});
 if(r.status==='review'||!positive(input.area))return review(r.reason||'Confirm total constructed area, including basement across both dwellings.');
 const area=+input.area;
 if(r.custom){const components=[{key:'userDelivered',label:'User/QS delivered cost',low:area*r.rateLow,mid:area*r.rateMid,high:area*r.rateHigh,source:'Explicit user/QS delivered-rate assumption',basis:'GST-inclusive delivered rate; no extra allowances'}];return{...r,area,low:components[0].low,mid:components[0].mid,high:components[0].high,components,constructionLow:null,constructionMid:null,constructionHigh:null,professionalPct:0,approvalsPct:0,externalPct:0,contingencyPct:0,demolition:0,complexity:1,siteUnknowns:['Confirm custom-rate inclusions and site risks']};}
 const config=r.configurationDetails,dwellings=input.dwellingCount??2;
 if(!Number.isInteger(+dwellings)||+dwellings!==2)return review('Confirm two dwellings; this duplex model does not price larger schemes.');
 const basementArea=input.basementArea??(config.basementLevels?area/config.totalLevels:0);
 if(!numeric(basementArea)||+basementArea<0||+basementArea>=area||(!config.basementLevels&&+basementArea!==0)||(config.basementLevels&&+basementArea===0))return review('Confirm basement area within the total constructed area.');
 const above=area-basementArea,liftCount=input.liftCount??config.defaultLiftsPerDwelling*dwellings;
 if(!Number.isInteger(+liftCount)||+liftCount<0||+liftCount>2)return review('Confirm zero, one or two residential lifts.');
 const components=[],bands=['low','mid','high'];
 const add=(key,label,values,basis)=>{const line={key,label,source:'ProjectIQ working allowance; QS/builder confirmation required',basis};bands.forEach((k,j)=>line[k]=Math.round(values[j]));components.push(line);return line;};
 add('aboveGround','Above-ground building',bands.map(k=>above*r.baseHardRates[k]),above+' m² × finish-specific hard rate, ex GST');
 add('structure','Additional structural complexity',config.structuralRate.map(v=>v*above),'Three above-ground levels: additional structure, scaffolding and vertical services; no duplicate floor area');
 add('basement','Basement excavation and shell',bands.map(k=>basementArea*r.basementHardRates[k]),basementArea+' m² basement: ordinary excavation/spoil, shoring, concrete shell, drainage/waterproofing and garage finish; exceptional rock/water excluded');
 add('lifts','Residential lift allowance',[45000,65000,90000].map(v=>v*liftCount),liftCount+' residential lifts incl ordinary installation/shaft works; working assumption, not a commercial lift tariff');
 const allowances={externalWorks:[40000,70000,110000],groundAllowance:[0,25000,80000],accessAllowance:[0,15000,45000]};
 for(const[key,values]of Object.entries(allowances)){
  const override=input[key];if(override!=null&&(!Array.isArray(override)||override.length!==3||override.some(v=>!numeric(v)||+v<0)||+override[0]>+override[1]||+override[1]>+override[2]))return review('Confirm ordered low/mid/high nonnegative site allowances.');
  add(key,{externalWorks:'External works and ordinary connections',groundAllowance:'Unconfirmed ordinary ground allowance',accessAllowance:'Access and logistics allowance'}[key],override||values,key==='externalWorks'?'Project-wide landscaping, driveway, drainage and ordinary connections outside building; excludes authority contributions/major service upgrades':'Explicit project-wide allowance, ex GST; no automatic suburb or slope multiplier');
 }
 const hard=bands.map(k=>components.reduce((sum,l)=>sum+l[k],0));
 add('professional','Design and consultants',hard.map((v,j)=>v*[.07,.09,.12][j]),'7% / 9% / 12% of hard works, ex GST');
 add('approvals','Approvals and reports',[12000,20000,35000],'Gross project-wide allowance; statutory/report mix to verify, excludes contributions');
 add('contingency','Construction contingency',hard.map((v,j)=>v*[.07,.1,.15][j]),'7% / 10% / 15% of hard works once; excludes land, fees, finance and GST');
 add('gst','GST allowance',bands.map((k,j)=>(hard[j]+components.find(l=>l.key==='professional')[k]+components.find(l=>l.key==='contingency')[k])*.1),'10% of hard works, consultants and contingency once; approval allowance already gross');
 const totals=bands.map(k=>components.reduce((sum,l)=>sum+l[k],0)),unknowns=['Ground conditions and groundwater','Rock, contamination and spoil disposal','Access and neighbouring support requirements','Major service upgrades and authority contributions'];
 return{...r,area,areaBreakdown:{aboveGround:above,basement:+basementArea,source:input.basementArea==null&&config.basementLevels?'Assumed equal floor plates; replace with measured area split':'User total/split'},dwellingCount:+dwellings,liftCount:+liftCount,low:totals[0],mid:totals[1],high:totals[2],rateLow:totals[0]/area,rateMid:totals[1]/area,rateHigh:totals[2]/area,constructionLow:hard[0],constructionMid:hard[1],constructionHigh:hard[2],components,professionalPct:0,approvalsPct:0,externalPct:0,contingencyPct:0,demolition:0,complexity:1,siteUnknowns:unknowns,assumptions:['Both dwellings included in total constructed area','Sydney comparator; ordinary conditions assumed pending geotechnical, survey and builder review','Basement shell includes excavation; no second basement uplift','No pool, exceptional rock/water, demolition or contributions included','4 levels assumes one lift per dwelling; 3 levels assumes stairs unless lifts explicitly selected','No future escalation automatically added; reprice at tender']};
}
const FINANCE_ASSUMPTION={version:'development-finance-2026-10-10-v1',asOf:'2026-10-10',interestRate:.095,label:'Illustrative development finance assumption, not a lender quote',source:'https://www.crowdproperty.com.au/developers/development-finance',sourceContext:'Public lender terms: rates from 8.50%, establishment fees from 1.65% including GST, terms up to 24 months, milestone drawdowns. The working 9.5% assumption is not that advertised minimum or an offered rate.'};
const CONTRIBUTION_PLAN={id:'northern-beaches-s7.12-2024',source:'https://www.northernbeaches.nsw.gov.au/media/65178',asOf:'2026-10-10',commenced:'2024-10-19',exclusions:['Warriewood Valley Release Area','Frenchs Forest Town Centre','Dee Why Town Centre']};
// A verified plan needs parcel-specific applicability and a statutory cost basis.
// Allowances remain explicitly provisional; missing evidence never means zero.
function assessContributions(i={}){
 const unknown=reason=>({status:'unknown',amount:null,method:null,decisionReady:false,reason,asOf:'2026-10-10'});
 if(!i||typeof i!=='object'||Array.isArray(i))return unknown('Confirm the applicable local contributions plan or provide an explicit allowance.');
 if(i.section711Applies===true&&i.method==='s7.12'||i.section712Applies===true&&i.method==='s7.11'||Array.isArray(i.methods)&&i.methods.includes('s7.11')&&i.methods.includes('s7.12'))return unknown('Section 7.11 and section 7.12 are alternatives for the same development; verify the applicable plan.');
 if(i.status==='not-applicable')return i.source&&i.reason?{...i,amount:0,decisionReady:true,label:'Contribution not applicable — verified scope',asOf:'2026-10-10'}:unknown('A not-applicable assessment needs its source and parcel-specific reason.');
 if(i.status==='verified-exemption')return i.source&&i.reason?{...i,amount:0,decisionReady:true,label:'Verified contribution exemption',asOf:'2026-10-10'}:unknown('An exemption needs its source and parcel-specific reason.');
 if(['user-allowance','provisional'].includes(i.status))return numeric(i.amount)&&+i.amount>=0?{...i,amount:+i.amount,decisionReady:false,label:i.status==='user-allowance'?'Explicit user contribution allowance — unverified':'Provisional contribution allowance — verify plan and indexation',asOf:'2026-10-10'}:unknown('Supply a nonnegative contribution allowance.');
 if(i.status!=='verified-plan'||i.planApplicable!==true||!i.source||!['s7.11','s7.12'].includes(i.method))return unknown('Contribution plan, parcel applicability, exemption and statutory calculation basis remain unverified.');
 let amount=i.amount,rate=i.rate;
 if(i.method==='s7.12'&&i.planId===CONTRIBUTION_PLAN.id){
  if(!numeric(i.approvedDevelopmentCost)||+i.approvedDevelopmentCost<0)return unknown('Confirm the section 208 cost summary basis; delivered construction cost is not automatically the statutory basis.');
  const cost=+i.approvedDevelopmentCost;rate=cost<=100000?0:cost<=200000?.005:.01;
  amount=cost*rate;
 }else if(i.method==='s7.12'&&amount==null&&numeric(i.approvedDevelopmentCost)&&+i.approvedDevelopmentCost>=0&&numeric(rate)&&+rate>=0&&+rate<=1)amount=+i.approvedDevelopmentCost*+rate;
 if(!numeric(amount)||+amount<0)return unknown('Confirm the applicable plan amount and credits/indexation; no generic per-dwelling levy is assumed.');
 if(i.indexationFactor!=null&&(!positive(i.indexationFactor)))return unknown('Confirm a positive plan indexation factor.');
 amount=+amount*(i.indexationFactor??1);
 return{...i,amount,rate:rate??null,decisionReady:true,label:'Verified '+i.method+' plan assessment',asOf:'2026-10-10',note:'Verify indexation at payment and other distinct infrastructure charges; section 7.11 and 7.12 are not added together.'};
}
function financeSchedule(i={}){
 const review=reason=>({status:'review',reason,version:FINANCE_ASSUMPTION.version});
 const land=i.land??0,delivery=i.delivery??0,landDebt=i.landDebt??(i.landDebtRatio!=null?land*i.landDebtRatio:0),ratio=i.constructionBorrowingRatio??.7,rate=i.interestRate??FINANCE_ASSUMPTION.interestRate;
 const timing={preconstructionMonths:i.preconstructionMonths??3,constructionMonths:i.constructionMonths??12,settlementMonths:i.settlementMonths??3,delayMonths:i.delayMonths??0};
 if([land,delivery,landDebt].some(v=>!numeric(v)||+v<0))return review('Confirm nonnegative land value, delivery spend and explicit outstanding land debt.');
 if([ratio,rate,i.landDebtRatio??0].some(v=>!numeric(v)||+v<0||+v>1))return review('Confirm borrowing ratios and annual interest rate between zero and one.');
 if(Object.values(timing).some(v=>!Number.isInteger(+v)||+v<0||+v>600)||+timing.constructionMonths<1)return review('Confirm whole months for preconstruction, construction, settlement and delay; construction must be at least one month.');
 Object.keys(timing).forEach(k=>timing[k]=+timing[k]);
 const months=Object.values(timing).reduce((a,b)=>a+b,0);if(months>600)return review('Confirm total project duration of 600 months or less.');
 if(i.capitaliseInterest!=null&&typeof i.capitaliseInterest!=='boolean')return review('Confirm whether interest is capitalised or paid monthly.');
 const capitalise=i.capitaliseInterest??true,fee=i.financeEstablishment??20000;
 if(!numeric(fee)||+fee<0)return review('Confirm a nonnegative establishment fee paid from equity.');
 const raw=i.drawWeights??Array.from({length:timing.constructionMonths},()=>1);
 if(!Array.isArray(raw)||raw.length!==timing.constructionMonths||raw.some(v=>!numeric(v)||+v<0)||!raw.some(v=>+v>0))return review('Draw weights must match build months and contain nonnegative milestone weights with a positive sum.');
 const sum=raw.reduce((a,b)=>a+ +b,0),weights=raw.map(v=>+v/sum),principal=+delivery* +ratio;
 const calculate=(annualRate,extraDelay=0)=>{
  let balance=+landDebt,interest=0,peakDebt=balance,repayment=0,cumulativeDraw=0;
  const rows=[],n=months+extraDelay;
  for(let month=1;month<=n;month++){
   const buildIndex=month-timing.preconstructionMonths-1,building=buildIndex>=0&&buildIndex<timing.constructionMonths;
   const phase=month<=timing.preconstructionMonths?'preconstruction':building?'construction':month<=timing.preconstructionMonths+timing.constructionMonths+timing.delayMonths+extraDelay?'delay':'settlement';
   const openingDebt=balance,spend=building?+delivery*weights[buildIndex]:0,draw=spend* +ratio;
   cumulativeDraw+=draw;
   // Mid-month milestone draw convention; opening balance accrues for full month.
   const monthlyInterest=(openingDebt+draw/2)*annualRate/12;
   interest+=monthlyInterest;balance+=draw+(capitalise?monthlyInterest:0);peakDebt=Math.max(peakDebt,balance);
   const debtBeforeRepayment=balance,settlementRepayment=month===n?balance:0;
   if(settlementRepayment){repayment=settlementRepayment;balance=0;}
   rows.push({month,phase,openingDebt,constructionSpend:spend,constructionDraw:draw,cumulativeConstructionDraw:cumulativeDraw,equityContribution:spend-draw+(capitalise?0:monthlyInterest)+(month===1?+fee:0),establishmentFee:month===1?+fee:0,interest:monthlyInterest,capitalisedInterest:capitalise?monthlyInterest:0,cashInterest:capitalise?0:monthlyInterest,debtBeforeRepayment,settlementRepayment,closingDebt:balance});
  }
  return{rows,interest,financeCost:interest+ +fee,peakDebt,repaymentAtSettlement:repayment};
 };
 const result=calculate(+rate),summary=x=>({interest:x.interest,financeCost:x.financeCost,repaymentAtSettlement:x.repaymentAtSettlement});
 return{status:'indicative',...result,version:FINANCE_ASSUMPTION.version,assumption:{...FINANCE_ASSUMPTION,label:i.interestRate!=null?'User annual development finance rate — confirm terms':FINANCE_ASSUMPTION.label},interestRate:+rate,landDebt:+landDebt,landEquity:+land- +landDebt,constructionBorrowing:principal,constructionEquity:+delivery-principal,financeEstablishment:+fee,capitaliseInterest:capitalise,holdingMonths:months,timing,drawWeights:weights,constructionBorrowingRatio:+ratio,sensitivities:{rateMinus2:summary(calculate(Math.max(0,+rate-.02))),ratePlus2:summary(calculate(Math.min(1,+rate+.02))),delayPlus3:summary(calculate(+rate,3)),delayPlus6:summary(calculate(+rate,6))},warnings:months>24?['Project exceeds the cited lender’s advertised maximum 24-month term; refinance/extension not priced.']:[],note:'Land equity is retained-property opportunity value; explicit land debt is outstanding at start. Delivery is drawn progressively in normalised milestone weights with mid-month interest. Establishment fees are paid from equity, never counted as principal. Debt principal is repaid at final settlement and is not a second project cost. Monthly cash interest is paid from equity when not capitalised. Borrowing ratio and timing are illustrative funding assumptions, not lender approval; ancillary project costs are equity funded.'};
}
function feasibility(i={}){
 const review=reason=>({status:'review',decisionReady:false,reason});
 const preliminary=i.preliminary===true&&i.eligibility?.readyForPreliminaryCosting===true&&!['prohibited','mandatory-standard-not-met'].includes(i.eligibility?.category);
 if(i.eligibility?.readyForFeasibility!==true&&i.exploratory!==true&&!preliminary)return review('Planning eligibility must support a conditional preliminary scenario or full feasibility; unsupported proposals remain withheld.');
 const bounded={holdingMonths:[0,600],interestRate:[0,1],landDebtRatio:[0,1],constructionDrawdown:[0,1],sellingPct:[0,1],taxPct:[0,1],targetProfitOnCost:[0,10],financeEstablishment:[0,Infinity],holding:[0,Infinity],marketing:[0,Infinity],legal:[0,Infinity]};
 for(const[k,[lo,hi]]of Object.entries(bounded))if(i[k]!=null&&(!numeric(i[k])||+i[k]<lo||+i[k]>hi))return review('Confirm valid finance, timing and commercial cost assumptions.');
 if(!positive(i.land)||!positive(i.cost?.mid)||!Array.isArray(i.products)||!i.products.length||i.products.some(p=>!positive(p.value)||!Number.isInteger(+p.count)||+p.count<1))return review('Confirm land/current-property value, delivered cost and sold evidence or explicit user assumptions for each finished product.');
 const contributionInput=i.contributions??(i.extras&&Object.prototype.hasOwnProperty.call(i.extras,'authorityContributions')?{status:'user-allowance',amount:i.extras.authorityContributions}:{}),contributions=assessContributions(contributionInput);
 if(contributions.amount===null)return{...review('Contributions are unresolved: '+contributions.reason),contributions};
 const grv=i.products.reduce((a,p)=>a+ +p.value* +p.count,0),land=+i.land,delivery=+i.cost.mid,lines={};
 for(const[key,val]of Object.entries(i.extras||{}))if(key!=='authorityContributions'&&['demolition','professional','approvals','externalWorks','contingency'].includes(key)&&(i.cost.excludedCosts||[]).includes(key)){
  if(!numeric(val)||+val<0)return review('Confirm nonnegative excluded-cost allowances.');lines[key]=+val;
 }
 lines.authorityContributions=contributions.amount;
 const extras=Object.values(lines).reduce((a,b)=>a+b,0);
 // holdingMonths remains a supported explicit total; otherwise use phase durations.
 const financeInput={...i,land,delivery,settlementMonths:i.settlementMonths??(i.holdingMonths!=null?+i.holdingMonths-(i.preconstructionMonths??3)-(i.constructionMonths??12)-(i.delayMonths??0):3)};
 const schedule=financeSchedule(financeInput);if(schedule.status==='review')return review(schedule.reason);
 const finance=schedule.interest,establishment=schedule.financeEstablishment,holding=+(i.holding??15000),selling=grv*(i.sellingPct??.025),marketing=+(i.marketing??10000),legal=+(i.legal??30000),taxSensitivity=grv*(i.taxPct??.04),target=+(i.targetProfitOnCost??.2);
 const other=delivery+extras+establishment+holding+selling+marketing+legal+taxSensitivity,total=land+other+finance,profit=grv-total;
 // Interest is affine in land where a debt ratio is supplied, fixed otherwise.
 const zero=financeSchedule({...financeInput,land:0,landDebt:0,landDebtRatio:0}).interest;
 const landInterestFactor=i.landDebt==null&&i.landDebtRatio!=null?(finance-zero)/land:0;
 const fixedFinance=landInterestFactor?zero:finance,residual=(grv/(1+target)-other-fixedFinance)/(1+landInterestFactor);
 const exploratory=i.exploratory===true,decisionReady=!exploratory&&!preliminary&&contributions.decisionReady;
 return{status:exploratory?'exploratory':preliminary?'conditional':'indicative',scenarioMode:preliminary?'conditional':exploratory?'exploratory':'supported',decisionReady,costVersion:i.cost.version,deliveryBand:'mid',ignoredIncludedExtras:Object.keys(i.extras||{}).filter(key=>(i.cost.includedCosts||[]).includes(key)),grv,site:land,delivery,lines,contributions,finance,financeSchedule:schedule,financeEstablishment:establishment,holding,selling,marketing,legal,taxSensitivity,total,profit,margin:profit,profitOnCost:profit/total,profitOnGrv:profit/grv,marginPct:profit/grv,residualLandValue:residual,holdingMonths:schedule.holdingMonths,interestRate:schedule.interestRate,targetProfitOnCost:target,assumptions:{landDebt:schedule.landDebt,landEquity:schedule.landEquity,constructionBorrowingRatio:schedule.constructionBorrowingRatio,capitaliseInterest:schedule.capitaliseInterest,contributionStatus:contributions.status},sensitivities:Object.fromEntries(Object.entries(schedule.sensitivities).map(([k,v])=>[k,{...v,total:total-finance+v.interest,profit:grv-total+finance-v.interest}])),note:(preliminary?'Conditional preliminary scenario for a supported consent investigation; not development approval or an established achievable design. Outstanding planning and design requirements must be resolved. ':'')+(exploratory?'Exploratory scenario; planning eligibility is not established. ':'')+(contributions.decisionReady?'':'Contribution amount is an explicit unverified allowance; decision readiness is withheld. ')+'Monthly progressive development finance, not a lender quote. Debt principal is not double-counted as a cost. Residual assumes retained existing land without acquisition duty, fixed delivery and other costs, stated target profit on cost and unchanged explicit debt (or stated debt ratio). Separate net GST/tax adjustment and professional review required.'};
}
function roomArea(rooms={},override){if(positive(override))return{area:+override,version:'rooms-2026-10-06-v1',source:'User area override',needsConfirmation:false};let area=0;for(const[k,v]of Object.entries(rooms))area+=(ROOMS[k]||0)*Math.max(0,+v||0);return{area:area||null,version:'rooms-2026-10-06-v1',source:'Room allowances including circulation within each allowance',needsConfirmation:!area||!!rooms.other}}
const DUTY_SOURCE='https://www.revenue.nsw.gov.au/taxes-duties-levies-royalties/transfer-duty/understanding-transfer-duty/calculate-transfer-duty';
const DUTY_VERSIONS=[
 {version:'NSW-2025-26',from:'2025-07-01',until:'2026-07-01',thresholds:[17000,37000,99000,372000,1240000],bases:[0,212,512,1597,11152,50212],rates:[.0125,.015,.0175,.035,.045,.055],premiumThreshold:3721000,premiumBase:186667,source:DUTY_SOURCE+'/past-thresholds-and-rates',sourceDate:'2026-06-26'},
 {version:'NSW-2026-27',from:'2026-07-01',until:'2027-07-01',thresholds:[18000,38000,103000,387000,1290000],bases:[0,225,525,1662,11602,52237],rates:[.0125,.015,.0175,.035,.045,.055],premiumThreshold:3870000,premiumBase:194137,source:DUTY_SOURCE,sourceDate:'2026-10-06'}
];
function nswTransferDuty({value,marketValue,contractDate=new Date().toLocaleDateString('en-CA',{timeZone:'Australia/Sydney'}),residential=true,landOverTwoHectares=false,mixedUse=false}={}){
 const review=reason=>({status:'review',duty:null,reason});
 if(!numeric(value)||+value<0||(marketValue!=null&&(!numeric(marketValue)||+marketValue<0)))return review('Confirm the purchase price and dutiable market value.');
 if(typeof contractDate!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(contractDate)||!Number.isFinite(Date.parse(contractDate))||new Date(contractDate).toISOString().slice(0,10)!==contractDate)return review('Confirm a valid contract date.');
 const v=DUTY_VERSIONS.find(v=>contractDate>=v.from&&contractDate<v.until);if(!v)return review('Transfer-duty rules for this contract date need verification.');
 const amount=Math.max(+value,marketValue==null?0:+marketValue);
 if((landOverTwoHectares||mixedUse)&&residential&&amount>v.premiumThreshold)return review('Premium duty needs professional apportionment for this property.');
 let band=0;while(band<v.thresholds.length&&amount>v.thresholds[band])band++;
 // Statutory schedule charges every $100 or part; discard cents in duty payable.
 const duty=residential&&amount>v.premiumThreshold?v.premiumBase+Math.ceil((amount-v.premiumThreshold)/100)*7:Math.max(20,v.bases[band]+Math.ceil((amount-(band?v.thresholds[band-1]:0))/100)*v.rates[band]*100);
 return{status:'indicative',duty:Math.floor(duty),dutiableValue:amount,version:v.version,contractDate,source:v.source,sourceDate:v.sourceDate,premium:residential&&amount>v.premiumThreshold,assumptions:'Ordinary transfer; no concessions, exemptions or foreign surcharge assumed.'};
}
function moveComparison(i={}){
 if(!i.enabled)return null;
 if(!positive(i.sale)||!positive(i.purchase))return{status:'review',reason:'Confirm expected sale value and replacement purchase price.'};
 i={...i,sale:+i.sale,purchase:+i.purchase};
 const costs={sellingPct:i.sellingPct??.025,marketing:i.marketing??10000,saleLegal:i.saleLegal??(i.legal==null?2000:i.legal*.4),discharge:i.discharge??0,purchaseLegal:i.purchaseLegal??(i.legal==null?3000:i.legal*.6),searches:i.searches??500,moving:i.moving??5000,finance:i.finance??0};
 if(Object.entries(costs).some(([k,v])=>!numeric(v)||+v<0||(k==='sellingPct'&&+v>1)))return{status:'review',reason:'Confirm valid non-negative changeover allowances and selling fee.'};
 const dutyResult=i.duty==null?nswTransferDuty({value:i.purchase,marketValue:i.purchaseMarketValue,contractDate:i.contractDate,residential:i.residential,landOverTwoHectares:i.landOverTwoHectares,mixedUse:i.mixedUse}):numeric(i.duty)&&+i.duty>=0?{status:'indicative',duty:+i.duty,version:'user-confirmed-duty'}:{status:'review'};
 if(dutyResult.status==='review')return{status:'review',reason:dutyResult.reason||'Confirm applicable transfer duty.'};
 for(const key of Object.keys(costs))costs[key]=+costs[key];
 const selling=Math.round(i.sale*costs.sellingPct),sellingLines=[{label:'Selling agent cost',amount:selling},{label:'Marketing',amount:costs.marketing},{label:'Sale conveyancing / legal',amount:costs.saleLegal},{label:'Mortgage discharge / settlement',amount:costs.discharge}],buyingLines=[{label:'NSW transfer duty',amount:dutyResult.duty},{label:'Purchase conveyancing / legal',amount:costs.purchaseLegal},{label:'Property searches / settlement',amount:costs.searches},{label:'Moving allowance',amount:costs.moving},{label:'Finance / refinance allowance',amount:costs.finance}];
 const sellingCosts=sellingLines.reduce((s,x)=>s+x.amount,0),purchaseCosts=buyingLines.reduce((s,x)=>s+x.amount,0),net=i.sale-sellingCosts,totalChangeoverCost=sellingCosts+purchaseCosts,change=i.purchase+purchaseCosts-net;
 return{status:'indicative',sale:i.sale,target:i.purchase,selling,net,duty:dutyResult.duty,dutyResult,sellingLines,buyingLines,sellingCosts,purchaseCosts,totalChangeoverCost,additionalCapitalRequired:Math.max(0,change),releasedCapital:Math.max(0,-change),change,other:totalChangeoverCost-selling-dutyResult.duty,assumptions:costs,note:'Working allowances; sale proceeds are before repayment of existing mortgage principal. Additional capital is the purchase-minus-sale gap plus transaction costs, not a borrowing approval.'};
}
function parseMoney(v){const s=String(v??'').replace(/[$,\s]/g,'');return /^\d+$/.test(s)?+s:null}
function formatMoney(v){return numeric(v)?new Intl.NumberFormat('en-AU',{style:'currency',currency:'AUD',maximumFractionDigits:0}).format(+v):''}
function frontage(g,roads=[],primaryRoad=''){return Spatial?Spatial.frontage(g,roads,primaryRoad):{status:'review',primary:null,secondary:[],reason:'Road corridor boundary evidence is required.'}}
// One normalized profile for typed intake, speech transcripts and structured providers.
const RENOVATION_LABELS={kitchen:'Kitchen',bathroom:'Bathroom',living:'Living / dining',openplan:'Open up the floorplan',laundry:'Laundry',flooring:'Flooring / finishes',windows:'Windows / doors',office:'Home office / internal room conversion',outdoor:'Outdoor / alfresco',wholehome:'Whole-home renovation',other:'Other'};
function normalizeIntent(p={}){return{goal:p.goal||'unsure',intentCategory:p.intentCategory||null,rebuildIntent:!!p.rebuildIntent,workLocations:p.workLocations||{},rooms:p.rooms||{},desiredRooms:p.desiredRooms||[],renovationAreas:p.renovationAreas||[],extraBedrooms:p.extraBedrooms??null,extraBathrooms:p.extraBathrooms??null,moreLivingSpace:p.moreLivingSpace??null,renovationExtent:p.renovationExtent||null,additionalLevel:p.additionalLevel??null,developmentIntent:p.developmentIntent??null,developmentType:p.developmentType||null,dwellingCount:p.dwellingCount??null,basementPreference:p.basementPreference||'none',quality:p.quality||'premium',budget:p.budget??null,timeframe:p.timeframe||null,compareMove:!!p.compareMove,uncertainties:p.uncertainties||[]}}
function interpretIntent(text){
 const raw=String(text||'').toLowerCase().replace(/[’']/g,"'");
 // Exclude only the negated clause; keep independent positive requests.
 const t=raw.replace(/\b(?:do not|don't|not interested in|no|without|not)\s+(?:want\s+)?(?:to\s+)?(?:build\s+)?[^,.!?;]*?(?=[,.!?;]|\s+(?:but|however)\s+|\s+and\s+(?:(?:i|we)\s+)?(?:want|would like|will|add|build|renovate)|$)/g,' ');
 const p=normalizeIntent(),has=r=>r.test(t),counts={one:1,a:1,an:1,two:2,three:3,four:4,five:5,six:6};
 const count=r=>{const m=t.match(new RegExp('(?:\\b(\\d+|one|two|three|four|five|six)\\s+)?'+r,'i'));return m?Math.min(20,counts[m[1]]||+m[1]||1):0};
 const roomPatterns={bedroom:'bedrooms?',masterSuite:'master suite|main suite|master bedroom|main bedroom',bathroom:'bathrooms?|ensuite',living:'living(?: room| area)?|dining',kitchenLiving:'kitchen',office:'office|study',garage:'garage',laundry:'laundry',upperLevel:'full upper level|whole upstairs',other:'other room'};
 for(const[k,r]of Object.entries(roomPatterns)){const n=count(r);if(n)p.rooms[k]=n}
 const devCandidate=[['duplex',/duplex|dual occupancy/],['townhouse',/town\s*houses?|terraces/],['apartment',/apartments?|units/],['multisite',/neighbou?rs?|adjoining land|combine.*land/]].find(([,r])=>has(r));
 const existingHome=has(/(?:my|our|current|existing|the)\s+(?:apartment|duplex|townhouse)/)&&has(/renovat|improv|refresh|remodel|refurb/),newHomes=has(/(?:build|construct|create|develop)\s+(?:a\s+|an\s+|new\s+|some\s+)?(?:duplex|townhouses?|apartments?)|new (?:duplex|townhouses?|apartments?)/),dev=existingHome&&!newHomes?null:devCandidate;
 const storey=has(/another (?:level|floor|storey|story)|second (?:storey|story|floor)|upper (?:level|floor)|add.*(?:storey|story)/)||has(/upstairs/)&&(!has(/renovat|refurb|refresh|remodel/)||has(/(?:add|build|go|new|another|extra)[^,.!?;]*upstairs/));
 const multipleHomes=has(/(?:build|construct|create|put).*\b(?:two|2|three|3|multiple)\s+(?:homes|houses|dwellings)|dual[ -]?occupancy/),rebuild=has(/rebuild|knock.*down|demolish/);
 const extend=has(/\bextend|extension|\badd(?:ing)?\s+(?:an?\s+|\d+\s+|one\s+|two\s+|three\s+)?(?:extra\s+)?(?:bedroom|bathroom|room|garage)|\bextra (?:bedroom|bathroom|space)|additional (?:room|space)/);
 const renovate=has(/renovat|refurb|refresh|improv|remodel|open.?plan|open up|open (?:my|the|our|a) (?:kitchen|living)|knock.*wall|remove.*wall|internal.*(?:layout|convert)/);
 p.goal=dev||multipleHomes||has(/\bdevelop(?:ment)?\b|subdivid|subdivision/)?'develop':storey?'storey':extend?'extend':renovate||Object.keys(p.rooms).length?'reno':'unsure';
 p.developmentType=dev?.[0]||(multipleHomes&&has(/\b(?:two|2)\s+(?:homes|houses|dwellings)|dual[ -]?occupancy/)?'duplex':null);p.rebuildIntent=rebuild;p.intentCategory=p.goal==='develop'?(p.developmentType==='duplex'?'dual-occupancy':'development'):storey?'add-level':extend?'extension':rebuild?'rebuild':renovate?'internal-renovation':null;if(rebuild&&!multipleHomes&&!dev)p.goal='unsure';p.developmentIntent=p.goal==='develop'?true:null;p.additionalLevel=storey?true:null;
 const areaPatterns={kitchen:/kitchen/,bathroom:/bathroom|ensuite/,living:/living|dining/,openplan:/open.?plan|open up|open (?:my|the|our|a) (?:kitchen|living)|walls?|internal.*layout/,laundry:/laundry/,flooring:/flooring|finishes|carpet|tiles/,windows:/windows?|doors?/,office:/office|study|room conversion/,outdoor:/outdoor|alfresco|deck/,wholehome:/whole.?home|whole house/};
 const renovationText=p.goal==='reno'?t:(t.match(/(?:renovat\w*|refurb\w*|refresh\w*|remodel\w*|open up|open (?:my|the|our|a))[^,.!?;]*?(?=\s+and\s+(?:extend|add|build|construct)|[,.!?;]|$)/g)||[]).join(' ');
 p.renovationAreas=p.goal==='reno'||renovate?Object.entries(areaPatterns).filter(([,r])=>r.test(renovationText)).map(([k])=>k):[];
 if(p.renovationAreas.includes('flooring')&&p.renovationAreas.some(k=>['bathroom','kitchen','living','office','laundry'].includes(k))&&!has(/elsewhere|other rooms|throughout|whole (?:home|house)|(?:living|bedroom|hall).*floor|flooring (?:through|across|in other)/))p.renovationAreas=p.renovationAreas.filter(k=>k!=='flooring');
 const unsupported=t.match(/\b(?:pool|roof(?:ing)?|solar panels?|lift|fence|retaining wall|foundation|air conditioning|asbestos)\b/g)||[];if((p.goal==='reno'||renovate)&&unsupported.length){p.renovationAreas.push('other');p.uncertainties.push('Also requested: '+[...new Set(unsupported)].join(', ')+'. This needs a separate scope and price.')}
 if(p.goal!=='reno'&&renovationText){const addedText=t.replace(renovationText,' ');p.rooms={};for(const [k,rx] of Object.entries(roomPatterns)){const m=addedText.match(new RegExp('(?:\\b(\\d+|one|two|three|four|five|six)\\s+)?'+rx,'i'));if(m)p.rooms[k]=Math.min(20,counts[m[1]]||+m[1]||1)}}
 p.workLocations={};if(has(/downstairs/)){for(const [k,rx] of Object.entries(areaPatterns)){if(new RegExp('(?:renovat|refresh|remodel|replace|open)[^,.!?;]*'+rx.source+'[^,.!?;]*downstairs|downstairs[^,.!?;]*'+rx.source).test(t)&&p.renovationAreas.includes(k))p.workLocations[k]='downstairs'}if(p.workLocations.kitchen)delete p.rooms.kitchenLiving;}
 if(p.rooms.masterSuite&&has(/master bedroom|main bedroom/)){const otherBedrooms=t.replace(/(?:master|main) bedroom/g,' ').match(/(?:\b(\d+|one|two|three|four|five|six)\s+)?bedrooms?/);if(otherBedrooms)p.rooms.bedroom=Math.min(20,counts[otherBedrooms[1]]||+otherBedrooms[1]||1);else delete p.rooms.bedroom;if(p.rooms.bathroom&&!has(/(?:additional|extra|separate|another)\s+bathroom|(?:two|2|three|3)\s+bathrooms/))delete p.rooms.bathroom;}
 p.renovationExtent=has(/major structural/)?'structural':p.renovationAreas.includes('openplan')?'layout':has(/refresh|cosmetic|paint/)?'refresh':'replace';
 p.extraBedrooms=p.goal==='extend'||p.goal==='storey'?p.rooms.bedroom||null:null;p.extraBathrooms=p.goal==='extend'||p.goal==='storey'?p.rooms.bathroom||null:null;p.moreLivingSpace=has(/living.*(?:bigger|larger)|more living/)?true:null;
 p.basementPreference=has(/basement/)?'basement':'none';p.quality=has(/luxury|bespoke|high.end/)?'luxury':has(/standard|basic|budget finish/)?'standard':'premium';p.compareMove=has(/mov(?:e|ing)|sell|buy elsewhere|compare.*alternatives/);
 const money=t.match(/(?:budget\s*(?:of|is|around|about)?\s*|\$)(\d[\d,]*(?:\.\d+)?)\s*(million|thousand|m\b|k\b)?/);if(money)p.budget=Math.round(+money[1].replace(/,/g,'')*(/million|m\b/.test(money[2]||'')?1e6:/thousand|k\b/.test(money[2]||'')?1e3:1));
 const words=t.match(/budget\s+(one|two|three|four|five|six|seven|eight|nine)\s+hundred\s+thousand/);if(words)p.budget=({one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9}[words[1]])*100000;
 p.desiredRooms=Object.keys(p.rooms);if(p.goal==='develop'&&p.developmentType==='duplex')p.dwellingCount=2;
 if(p.compareMove)p.intentCategory=has(/compare|whether|or mov/)?'compare':'move';
 const footprintConstraint=/not extend|no extension|without extend|within (?:the )?existing footprint/.test(raw),mixed=(extend&&storey&&has(/whether|\bor\b|not sure/))||(extend&&!!dev)||(storey&&!!dev),unclear=mixed||footprintConstraint||unsupported.length;const confidence=unclear?.55:p.goal==='unsure'?.25:renovate||extend||storey||dev||multipleHomes||has(/\bdevelop(?:ment)?\b|subdivid|subdivision/)||p.compareMove?.9:.65;
 return{status:'confirmation',profile:p,confidence,clarification:unsupported.length?'Should we include '+[...new Set(unsupported)].join(' and ')+' as work that still needs a separate price?':footprintConstraint?'Are you converting space inside the existing home rather than extending it?':mixed?'Which direction would you like to test first: improving existing rooms, adding space, or building new homes?':confidence<.7?'Are you improving the existing rooms, adding space, or building additional homes?':null};
}
// Founder component assumptions: GST, ordinary installation, local services and 10% room contingency included.
// These are NOT verified quotes. Houzz AU 2023 median kitchen $30k/bath $19k is historical context only.
const RENO_VERSION='renovation-components-2026-10-07-v1';
const RENOVATION_COMPONENTS={
 kitchen:{label:'Kitchen',band:[25000,40000,65000],includes:['Cabinetry, benchtop, standard appliances','Room electrical/plumbing, finishes and installation']},
 bathroom:{label:'Bathroom',band:[18000,28000,45000],includes:['Fixtures, waterproofing, tiling','Room electrical/plumbing and installation']},
 openplan:{label:'Open-plan structural changes',band:[12000,22000,40000],includes:['One internal structural opening','Engineering allowance, beam and making good']},
 living:{label:'Living / dining refurbishment',band:[5000,10000,18000],includes:['Room painting, basic flooring and local electrical']},
 flooring:{label:'Flooring / finishes elsewhere',band:[7000,12000,22000],includes:['Shared dry-room flooring outside selected rooms']},
 joinery:{label:'Additional joinery',band:[5000,10000,20000],includes:['Joinery outside kitchen and bathroom']},
 painting:{label:'Painting elsewhere',band:[5000,9000,16000],includes:['Shared interior painting outside selected rooms']},
 electrical:{label:'Additional electrical work',band:[3000,6500,12000],includes:['Electrical upgrades outside selected rooms']},
 plumbing:{label:'Additional plumbing work',band:[3000,6000,12000],includes:['Plumbing upgrades outside selected rooms']},
 windows:{label:'Windows / doors',band:[7000,15000,28000],includes:['Small group of replacement windows or doors']},
 office:{label:'Office conversion',band:[4000,8000,14000],includes:['Existing-room finishes, lighting and desk joinery']},
 laundry:{label:'Laundry',band:[8000,15000,25000],includes:['Cabinetry, fixtures and local plumbing/electrical']},
 wholehome:{label:'Whole-home shared finishes',band:[30000,55000,95000],includes:['Shared dry-room finishes, flooring, painting and ordinary electrical','Excludes separately selected kitchen, bathroom and structural work']},
 outdoor:{label:'Outdoor / alfresco improvement',band:[10000,22000,40000],includes:['Modest existing outdoor area finishes and connection']}
};
function renovationCost({components=[],extent='replace',quality='premium',complexity='normal',region=1,counts={}}={}){
 const unique=[...new Set(components)],unknown=unique.some(k=>!RENOVATION_COMPONENTS[k]);const keys=unique.filter(k=>RENOVATION_COMPONENTS[k]&&!(unique.includes('wholehome')&&['flooring','painting','electrical','living','office'].includes(k)));
 if(!keys.length||unknown)return{status:'review',low:null,mid:null,high:null,reason:'Describe the additional work so a designer or builder can price it.',version:RENO_VERSION,components:[]};
 const qualityAdjustment={standard:1,premium:1.2,luxury:1.6}[quality]||1.2,complexityAdjustment={simple:.95,normal:1,hard:1.2}[complexity]||1,regionAdjustment=positive(region)?+region:1;
 const lines=keys.map(k=>{const c=RENOVATION_COMPONENTS[k],extentAdjustment=k==='openplan'?1:extent==='refresh'?.55:extent==='structural'?1.25:1,n=Math.max(1,Math.min(20,+counts[k]||1)),factor=qualityAdjustment*complexityAdjustment*regionAdjustment*extentAdjustment*n;return{key:k,label:c.label,low:Math.round(c.band[0]*factor),mid:Math.round(c.band[1]*factor),high:Math.round(c.band[2]*factor),count:n,qualityAdjustment,complexityAdjustment,regionAdjustment,extentAdjustment,version:RENO_VERSION,inclusions:[...c.includes,'GST and ordinary room contingency'],exclusions:['Extensions or additional levels','Major service relocation, hazardous materials or exceptional structure','Unselected rooms, furnishings and temporary accommodation']}});
 return{status:'indicative',low:lines.reduce((n,c)=>n+c.low,0),mid:lines.reduce((n,c)=>n+c.mid,0),high:lines.reduce((n,c)=>n+c.high,0),components:lines,version:RENO_VERSION,qualityAdjustment,complexityAdjustment,regionAdjustment,note:'Selected room allowances include ordinary installation, services, GST and room contingency. These working estimates need a measured scope and builder pricing; exceptional work is excluded.'};
}
function deliveryComposition(cost){if(!positive(cost?.mid))return[];if(!Array.isArray(cost.components))return[{label:'Delivered total — breakdown unavailable',amount:cost.mid,share:1,version:cost.version||VERSION,source:'No measured component breakdown supplied'}];return cost.components.filter(l=>l.mid>0).map(l=>({...l,amount:l.mid,share:l.mid/cost.mid,version:cost.version||VERSION,source:l.source||'Actual working cost component; included once in delivered total'}))}

return{COST_CONFIGS,nswTransferDuty,DUTY_VERSIONS,interpretIntent,normalizeIntent,RENOVATION_LABELS,RENOVATION_COMPONENTS,renovationCost,deliveryComposition,rateCard,deliveredCost,feasibility,financeSchedule,assessContributions,FINANCE_ASSUMPTION,CONTRIBUTION_PLAN,roomArea,ROOMS,moveComparison,parseMoney,formatMoney,frontage};});
