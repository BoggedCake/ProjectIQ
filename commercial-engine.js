/* Shared browser/server arithmetic. Values are indicative versioned assumptions, not quotes. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./property-evidence.js'));else root.SitePivotCommercial=factory(root.PropertyEvidence)})(typeof globalThis!=='undefined'?globalThis:this,function(Spatial){'use strict';
const VERSION='duplex-cost-2026-10-12-v3',ROOMS={bedroom:14,masterSuite:30,bathroom:10,living:30,kitchenLiving:40,office:10,garage:36,upperLevel:100,other:0,laundry:8};
const numeric=n=>n!==null&&n!==''&&n!==undefined&&Number.isFinite(+n),positive=n=>numeric(n)&&+n>0;
// Working duplex assumptions, not published QS duplex tariffs. Base rates exclude GST,
// site/external works, consultants, approvals and contingency; include builder margin/preliminaries.
const COST_SOURCES=[
 {id:'cpp-premium-context',name:'CPP QS Sydney residential cost guidance',url:'https://www.cppqs.com.au/post/cost-to-build-a-house-in-sydney-a-2026-guide',accessed:'2026-10-12',scope:'Premium duplex discussion gives $4500–6500/m² in a paragraph labelled 2025; GST basis unstated. Not a verified 2026 probability distribution.',use:'Premium $4500/m² working central assumption; not a quoted or verified project rate. ±8% finish-specific hard-cost uncertainty is an explicit modelling assumption.'},
 {id:'direct-lifts-context',name:'Direct Lifts public home-lift prices',url:'https://directlifts.com.au/home-lift-prices-in-australia/',accessed:'2026-10-12',scope:'Supplier starting prices exclude GST; scope and integration vary.',use:'Context for explicit $55000 / $65000 / $80000 ordinary lift allowances ex GST; project integration unverified.'},
 {id:'pool-concrete-context',name:'Scape Pools Sydney public FAQs',url:'https://scapepools.com.au/faqs/',accessed:'2026-10-12',scope:'Concrete pools start at $60000 ex GST; starting price is not a project quote or upper bound.',use:'Context only. Editable pool component allowances are model assumptions, ex GST, not copied supplier component prices.'},
 {id:'pool-fibreglass-context',name:'Summertime public fibreglass pool cost guide',url:'https://www.summertime.com.au/hub/how-much-do-fibreglass-pools-cost',accessed:'2026-10-12',scope:'Published 11 August 2026; indicative 7 × 3 m installed range $57000–70000 excludes surrounds, fencing and landscaping; GST basis unstated.',use:'Context only; model dimensions and separate scope components require builder confirmation, with explicit working ex-GST basis.'},
 {id:'bmt-2026',name:'BMT Quantity Surveyors construction cost table 2026',url:'https://prod.bmtqs.com.au/construction-cost-table',accessed:'2026-10-12',scope:'Sydney executive residence comparators 4645 / 5947 / 8318 represent distinct finish classes, not probability quantiles. Sydney GFA building comparators, ex GST; preliminaries, builder profit/overheads included. Not exact duplex rates.',use:'Primary comparator for base hard costs; no automatic index uplift.'},
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
 'three-level-basement':{label:'4 levels — basement + 3 above ground',aboveGroundLevels:3,basementLevels:1,totalLevels:4,structuralRate:[200,350,600],defaultLiftsPerDwelling:0}
};
// Area is not yield: mapped statutory GFA and costed constructed quantities are separate.
// No additional above-ground exclusions or planning concessions are inferred here.
function developmentAreaModel(input={}){
 const configuration=input.configuration==='custom'?input.buildingConfiguration:input.configuration||'two-storey',config=COST_CONFIGS[configuration],warnings=[];
 const warn=(code,message)=>warnings.push({code,message});
 const share=input.workingGfaShare??.9,evidence=input.fsrEvidence;
 const ratio=value=>{if(typeof value==='boolean'||value==null)return null;const m=String(value).trim().match(/^(\d+(?:\.\d+)?)\s*(?::\s*1)?$/);return m&&Number.isFinite(+m[1])?+m[1]:null;};
 const evidenceRatio=ratio(evidence?.value),suppliedRatio=ratio(input.fsr);
 const instrumentMatches=!input.instrument||String(evidence?.provenance?.instrument||'').trim().toLowerCase()===String(input.instrument).trim().toLowerCase();
 const verified=evidence?.state==='mapped'&&evidence.spatiallyVerified!==false&&evidence.requiresReview!==true&&(evidence.capacityAreaFraction==null||positive(evidence.capacityAreaFraction)&&+evidence.capacityAreaFraction<=1)&&evidence.parcelResolved===true&&evidence.queryComplete===true&&instrumentMatches&&evidenceRatio!==null&&(input.fsr==null||suppliedRatio===evidenceRatio);
 const capacity=verified&&positive(input.siteArea)?+input.siteArea*evidenceRatio*(evidence.capacityAreaFraction==null?1:+evidence.capacityAreaFraction):null;
 const manual=['manual','user'].includes(input.areaSource),manualBasement=manual||['manual','user'].includes(input.basementAreaSource);
 let above=null,basement=null,total=null;
 const assumptions=['A working area scenario only, not a measured design, approved yield or confirmation of FSR, height, setbacks, landscape, parking or subdivision compliance.',`${share*100}% of verified mapped FSR capacity is the explicit starter working share; this is a modelling assumption, not a statutory entitlement.`, 'All above-ground constructed area is conservatively treated as counted GFA; no extra excluded above-ground area is invented.','Starter basement footprint equals one average above-ground floorplate; excavation, ramp, setbacks and actual basement definition need design review.'];
 const invalid=!config||!positive(input.siteArea)||!numeric(share)||+share<=0||+share>1||['totalConstructedArea','basementConstructedArea'].some(k=>input[k]!=null&&(!numeric(input[k])||+input[k]<0));
 if(invalid)warn('invalid-area-input','Confirm site area, building configuration, a working GFA share greater than zero and no more than one, and nonnegative area quantities.');
 if(!verified)warn('fsr-unverified','Mapped FSR capacity is unknown or unresolved; any retained constructed area is an unverified working assumption, not a verified planning envelope.');
 if(!invalid){
  if(!manual&&capacity!==null){above=capacity* +share;basement=manualBasement&&input.basementConstructedArea!=null?+input.basementConstructedArea:config.basementLevels?above/config.aboveGroundLevels*config.basementLevels:0;total=above+basement;}
  else if(positive(input.totalConstructedArea)){
   total=+input.totalConstructedArea;
   basement=input.basementConstructedArea!=null?+input.basementConstructedArea:config.basementLevels?total/config.totalLevels*config.basementLevels:0;
   above=total-basement;
   if(input.basementConstructedArea==null&&config.basementLevels)warn('basement-area-assumption','Basement area is an unmeasured level-share allowance; confirm its separate constructed quantity.');
  }else warn('area-required','Confirm constructed quantities; no verified FSR is available to derive a starter area.');
  if(total!==null&&(basement>=total||above<=0))warn('invalid-area-input','Basement area must be less than total constructed area, leaving positive above-ground constructed area.');
  if(basement>0&&!config.basementLevels||basement===0&&config.basementLevels)warn('configuration-conflict','Your entered areas are retained, but basement quantity conflicts with the selected building levels.');
 }
 const use=input.basementUse||'unknown',hasBasement=basement>0,conditional=['parking','storage'].includes(use);
 const classification=!hasBasement?'none':use==='habitable'?'counted':conditional?'potential-exclusion':'needs-review';
 const basementStatutoryGfa={classification,use,countedArea:!hasBasement?0:use==='habitable'?basement:null,potentiallyExcludedArea:hasBasement&&conditional?basement:0,requiresReview:hasBasement&&use!=='habitable',basis:use==='parking'?'Only qualifying car parking meeting consent-authority requirements (including access) may be excluded; excess parking and other uses require assessment.':use==='storage'?'Storage must actually be in a qualifying basement and meet the applicable GFA definition; naming a space storage does not establish exclusion.':use==='habitable'?'Habitable basement constructed area is conservatively counted in statutory GFA.':'Actual basement definition, measured area and use classification require designer/planner review.'};
 if(basementStatutoryGfa.requiresReview)warn('basement-gfa-review',basementStatutoryGfa.basis);
 const estimated=above===null?null:basementStatutoryGfa.countedArea===null?null:above+basementStatutoryGfa.countedArea;
 const conservative=total;
 if(capacity!==null&&above!==null&&(above>capacity+1e-8||estimated!==null&&estimated>capacity+1e-8))warn('fsr-conflict','Entered or selected counted areas exceed verified mapped FSR capacity; your quantities are retained for comparison, not presented as compliant yield.');
 else if(capacity!==null&&conservative!==null&&conservative>capacity+1e-8&&basementStatutoryGfa.requiresReview)warn('fsr-exclusion-dependent','If the basement is counted, the scenario exceeds mapped FSR capacity; any exclusion depends on actual qualifying use and a measured statutory area schedule.');
 const conflict=warnings.some(w=>['invalid-area-input','configuration-conflict','fsr-conflict','area-required'].includes(w.code));
 return{status:conflict?'review':capacity===null?'assumption':'indicative',decisionReady:false,version:'fsr-area-2026-10-16-v1',configuration,configurationDetails:config?{...config}:null,areaSource:manual?'user':'starter',fsrVerified:verified,statutoryGfaCapacity:capacity,aboveGroundConstructedArea:above,basementConstructedArea:basement,totalConstructedArea:total,aboveGroundFloorplate:above===null||!config?null:above/config.aboveGroundLevels,workingGfaShare:+share,basementStatutoryGfa,estimatedStatutoryGfa:estimated,estimatedStatutoryGfaConservative:conservative,warnings,assumptions};
}
const COST_BANDS={volume:[2300,2700,3200],standard:[3100,3550,4100],custom:[3100,3550,4100],premium:[3700,4500,5200],prestige:[4000,5000,6200],luxury:[4800,6100,8000],'luxury-development':[4800,6100,8000]};
const COST_SPECIFICATIONS={volume:'Volume-builder duplex: repeatable shelf design and basic specification',standard:'Standard custom duplex: unique design, economical fixtures',custom:'Standard custom duplex: unique design, economical fixtures',premium:'Premium custom duplex: quality modern finishes and envelope',prestige:'Prestige architectural duplex: complex envelope, higher joinery and fixture specification',luxury:'Luxury development: bespoke design and top-end fitout','luxury-development':'Luxury development: bespoke design and top-end fitout'};
const COST_EXCLUSIONS=['land','demolition','authorityContributions','finance','holding','selling','marketing','legal','taxSensitivity','exceptionalGround','contamination','pool','looseFurniture','serviceUpgrades'];
function siteAllowances(input={}){return{externalWorks:[60000,70000,85000],groundAllowance:input.groundCondition==='difficult'?[60000,90000,130000]:input.groundCondition==='ordinary'?[15000,25000,40000]:[0,25000,80000],accessAllowance:input.accessCondition==='restricted'?[35000,50000,70000]:input.accessCondition==='ordinary'?[10000,15000,25000]:[0,15000,45000]};}
function rateCard(input={}){
 const {quality='premium',configuration='two-storey',region='NSW',customRate,projectType='duplex'}=input;
 const review=reason=>({status:'review',reason,version:VERSION,quality,configuration,region});
 if(configuration==='custom'||customRate!=null){
  if(!positive(customRate))return review('A custom configuration needs an explicit QS/builder delivered rate.');
  return{status:'indicative',quality,configuration,region,projectType,rateLow:+customRate,rateMid:+customRate,rateHigh:+customRate,includedCosts:['construction','professional','approvals','externalWorks','contingency'],excludedCosts:COST_EXCLUSIONS,version:VERSION,custom:true,taxBasis:'User delivered rate assumed GST inclusive; confirm its inclusions.',note:'Explicit user/QS delivered rate. No additional soft costs or contingency added.'};
 }
 if(projectType!=='duplex')return review('This rate card is calibrated for a two-dwelling duplex. Other development types need project-specific QS rates.');
 if(!COST_BANDS[quality])return review('Confirm the selected construction and finish specification.');
 if(!COST_CONFIGS[configuration])return review('Confirm the number of above-ground and basement levels.');
 if(!/^(NSW|Sydney|Greater Sydney|Northern Beaches|Sydney Northern Beaches|North Shore|Eastern Suburbs|Inner West|Western Sydney)$/i.test(String(region)))return review('The public comparator is Sydney. Confirm a local QS/builder rate for this region.');
 const config=COST_CONFIGS[configuration],selected=COST_BANDS[quality],base=[selected[1]*.92,selected[1],selected[1]*1.08],basement=input.groundCondition==='ordinary'?[3100,3400,3800]:[2600,3400,4600];
 // Reconcile against supplied area, or a disclosed reference only when no area is given.
 // Actual delivery uses quantity and fixed allowance lines, never a reference rate multiplier.
 const card={status:'indicative',quality,configuration,configurationDetails:{...config},region,projectType,specification:COST_SPECIFICATIONS[quality],locationReference:'Sydney',locationFactor:1,locationAssumption:String(region).toUpperCase()==='NSW'?'Sydney reference within NSW; regional site/location not confirmed':'Sydney metropolitan reference; no suburb prestige uplift',baseHardRates:{low:base[0],mid:base[1],high:base[2]},basementHardRates:{low:basement[0],mid:basement[1],high:basement[2]},includedCosts:['construction','professional','approvals','externalWorks','contingency'],excludedCosts:COST_EXCLUSIONS,version:VERSION,asOf:'2026-10-12',sources:COST_SOURCES,rateBasis:positive(input.area)?'Actual delivered total divided by supplied total constructed area; fixed allowances vary effective rates.':'Delivered reference rate at 440 m² total constructed area, two dwellings; actual costs recomputed for supplied quantities.',taxBasis:'GST 10% added once to hard works, consultants and construction contingency; approval allowance assumed gross statutory/report fees. Separate project GST/tax adjustment required.',note:'Working duplex estimate informed by public QS building comparators, not a quote or published duplex tariff. Total area includes basement; land value and suburb prestige do not select finish. Ordinary site and access allowances are explicit; exceptional conditions are excluded.'};
 const referenceArea=positive(input.area)?+input.area:440;
 const cost=deliveredCost({...input,area:referenceArea,rateCard:card});
 if(cost.status==='review')return{...card,status:'review',reason:cost.reason};
 return{...card,rateLow:cost.low/referenceArea,rateMid:cost.mid/referenceArea,rateHigh:cost.high/referenceArea};
}
// Optional works are explicit ex-GST allowances, never inferred from the level count.
function optionalWorks(input,dwellings=2){
 const triple=(v,fallback)=>v==null?fallback:Array.isArray(v)?v.map(Number):[+v,+v,+v];
 const valid=a=>Array.isArray(a)&&a.length===3&&a.every(v=>numeric(v)&&v>=0)&&a[0]<=a[1]&&a[1]<=a[2];
 const liftCount=+(input.liftCount??0);
 if(!Number.isInteger(liftCount)||liftCount<0||liftCount>10)return{reason:'Confirm a residential lift quantity from zero to ten.'};
 const allocations=input.liftAllocations;
 if(allocations!=null&&(!Array.isArray(allocations)||allocations.length!==dwellings||allocations.some(v=>!Number.isInteger(+v)||+v<0)||allocations.reduce((sum,v)=>sum+ +v,0)!==liftCount))return{reason:'Lift allocations must match the dwelling count and total lift quantity.'};
 const liftUnit=triple(input.liftAllowance,[55000,65000,80000]);if(!valid(liftUnit))return{reason:'Confirm ordered nonnegative lift allowances, ex GST.'};
 const pool=input.pool??{configuration:'none'},configuration=pool.configuration??'none';
 if(!['none','shared','per-dwelling','custom'].includes(configuration))return{reason:'Confirm pool configuration.'};
 const poolCount=configuration==='none'?0:configuration==='shared'?1:configuration==='per-dwelling'?dwellings:+pool.quantity;
 if(!Number.isInteger(poolCount)||poolCount<0||poolCount>10)return{reason:'Confirm pool quantity from zero to ten.'};
 const dimensions={length:+(pool.length??8),width:+(pool.width??4),depth:+(pool.depth??1.5)},type=pool.type??'concrete';
 if(poolCount&&(!['concrete','fibreglass'].includes(type)||Object.values(dimensions).some(v=>!positive(v))))return{reason:'Confirm positive pool dimensions and concrete or fibreglass pool type.'};
 const scale=dimensions.length*dimensions.width/32;
 const defaults={shell:(type==='fibreglass'?[30000,35000,42000]:[42000,50000,60000]).map(v=>v*scale),excavation:[7000,10000,15000].map(v=>v*scale*dimensions.depth/1.5),equipment:[4000,5000,7000],safety:[5000,7000,10000],finishes:[6000,8000,12000].map(v=>v*scale),heating:pool.heating?[2000,3000,5000]:[0,0,0],landscaping:[3000,5000,8000],designApprovals:[3000,4000,6000]},poolComponents=[];
 for(const[key,values]of Object.entries(defaults)){const a=triple(key==='heating'&&!pool.heating?0:pool.allowances?.[key],values);if(!valid(a))return{reason:'Confirm ordered nonnegative pool component allowances, ex GST.'};poolComponents.push({key,low:a[0]*poolCount,mid:a[1]*poolCount,high:a[2]*poolCount});}
 return{liftCount,liftAllocations:allocations??null,liftValues:liftUnit.map(v=>v*liftCount),poolCount,poolComponents,poolValues:['low','mid','high'].map(k=>poolComponents.reduce((sum,c)=>sum+c[k],0)),poolAssumptions:{configuration,...dimensions,type,heating:!!pool.heating,taxBasis:'All component allowances ex GST; GST applied once in delivered total',status:'provisional'}};
}
function deliveredCost(input={}){
 const r=input.rateCard||rateCard(input),review=reason=>({...r,status:'review',low:null,mid:null,high:null,reason});
 if(r.status==='review'||!positive(input.area))return review(r.reason||'Confirm total constructed area, including basement across both dwellings.');
 const area=+input.area;
 const optional=optionalWorks(input);if(optional.reason)return review(optional.reason);
 if(r.custom){
  const bands=['low','mid','high'],components=[{key:'userDelivered',label:'User/QS delivered cost',low:area*r.rateLow,mid:area*r.rateMid,high:area*r.rateHigh,source:'Explicit user/QS delivered-rate assumption',basis:'GST-inclusive delivered rate; inclusion overrides retained'}];
  for(const[key,values,included]of [['lifts',optional.liftValues,input.customIncludesLifts],['pool',optional.poolValues,input.customIncludesPool]])if(!included&&values.some(v=>v>0))components.push({key,label:key+' explicit allowance including GST',low:values[0]*1.1,mid:values[1]*1.1,high:values[2]*1.1,basis:'Ex-GST optional allowance plus GST once'});
  const totals=bands.map(k=>components.reduce((sum,l)=>sum+l[k],0)),includedCosts=[...r.includedCosts,...(input.customIncludesLifts||optional.liftCount?['lifts']:[]),...(input.customIncludesPool||optional.poolCount?['pool']:[])];
  return{...r,...optional,area,low:totals[0],mid:totals[1],high:totals[2],components,includedCosts,excludedCosts:r.excludedCosts.filter(k=>!includedCosts.includes(k)),constructionLow:null,constructionMid:null,constructionHigh:null,professionalPct:0,approvalsPct:0,externalPct:0,contingencyPct:0,demolition:0,complexity:1,siteUnknowns:['Confirm custom-rate inclusions and site risks']};
 }
 const config=r.configurationDetails,dwellings=input.dwellingCount??2;
 if(!Number.isInteger(+dwellings)||+dwellings!==2)return review('Confirm two dwellings; this duplex model does not price larger schemes.');
 const basementArea=input.basementArea??(config.basementLevels?area/config.totalLevels:0);
 if(!numeric(basementArea)||+basementArea<0||+basementArea>=area||(!config.basementLevels&&+basementArea!==0)||(config.basementLevels&&+basementArea===0))return review('Confirm basement area within the total constructed area.');
 const above=area-basementArea,liftCount=optional.liftCount;
 for(const key of ['aboveGroundRate','basementRate'])if(input[key]!=null&&!positive(input[key]))return review('Confirm positive above-ground and basement ex-GST rates.');
 const choices={designComplexity:['simple','standard','complex'],structureComplexity:['standard','complex'],accessCondition:['unknown','ordinary','restricted'],groundCondition:['unknown','ordinary','difficult'],basementFinish:['parking','habitable']};
 for(const[key,values]of Object.entries(choices))if(input[key]!=null&&!values.includes(input[key]))return review('Confirm design, structure, access and ground scope selections.');
 const components=[],bands=['low','mid','high'];
 const add=(key,label,values,basis)=>{const line={key,label,source:'ProjectIQ working allowance; QS/builder confirmation required',basis};bands.forEach((k,j)=>line[k]=Math.round(values[j]));components.push(line);return line;};
 add('aboveGround','Above-ground building',bands.map(k=>above*(input.aboveGroundRate??r.baseHardRates[k])),above+' m² × finish-specific hard rate, ex GST');
 add('structure','Additional structural complexity',config.structuralRate.map(v=>v*above+(input.structureComplexity==='complex'?above*250:0)),'Configuration level allowance for additional structure/scaffolding/vertical services, plus separately selected complex engineering allowance; no duplicate floor area');
 add('basement','Basement excavation and shell',bands.map(k=>basementArea*(input.basementRate??r.basementHardRates[k])),basementArea+' m² basement: ordinary excavation/spoil, shoring, concrete shell, drainage/waterproofing and garage finish; exceptional rock/water excluded');
 add('basementFitout','Additional habitable basement fitout',[200,400,600].map(v=>input.basementFinish==='habitable'?v*basementArea:0),'Selected habitable finish upgrade to the parking shell only; no duplicate basement area or above-ground rate. Working allowance pending full habitable-room compliance review');
 add('lifts','Residential lift allowance',optional.liftValues,liftCount+' residential lifts incl ordinary installation/shaft works; working assumption, not a commercial lift tariff');
 add('pool','Pool works — provisional components',optional.poolValues,optional.poolCount+' pools; shell including ordinary waterproofing (finish separate), excavation, equipment, safety, finishes, selected heating, associated landscaping and design/approval, ex GST');
 const allowances=siteAllowances(input);
 for(const[key,values]of Object.entries(allowances)){
  const override=input[key];if(override!=null&&(!Array.isArray(override)||override.length!==3||override.some(v=>!numeric(v)||+v<0)||+override[0]>+override[1]||+override[1]>+override[2]))return review('Confirm ordered low/mid/high nonnegative site allowances.');
  add(key,{externalWorks:'External works and ordinary connections',groundAllowance:'Unconfirmed ordinary ground allowance',accessAllowance:'Access and logistics allowance'}[key],override||values,key==='externalWorks'?'General dwelling/site landscaping, driveway, drainage and ordinary connections outside building; pool surrounds landscaping separately included only in pool scope; excludes authority contributions/major service upgrades':'Explicit project-wide allowance, ex GST; no automatic suburb or slope multiplier');
 }
 const hard=bands.map(k=>components.reduce((sum,l)=>sum+l[k],0));
 add('professional','Design and consultants',hard.map((v,j)=>(v-optional.poolValues[j])*(input.designComplexity==='complex'?[.1,.12,.14]:input.designComplexity==='simple'?[.065,.075,.09]:[.08,.09,.105])[j]),'Selected design scope percentage of building and site hard works ex GST; pool design/approval included separately in pool components');
 add('approvals','Building approvals and reports',[16000,20000,26000],'Gross building approval/report allowance; pool design/approval separately included in selected pool scope; statutory/report mix to verify, excludes contributions');
 add('contingency','Construction contingency',hard.map((v,j)=>v*[.08,.1,.12][j]),'8% / 10% / 12% working uncertainty allowance of selected hard scope once; excludes land, fees, finance and GST');
 add('gst','GST allowance',bands.map((k,j)=>(hard[j]+components.find(l=>l.key==='professional')[k]+components.find(l=>l.key==='contingency')[k])*.1),'10% of hard works, consultants and contingency once; approval allowance already gross');
 const totals=bands.map(k=>components.reduce((sum,l)=>sum+l[k],0)),unknowns=['Ground conditions and groundwater','Rock, contamination and spoil disposal','Access and neighbouring support requirements','Major service upgrades and authority contributions'];
 return{...r,...optional,includedCosts:[...r.includedCosts,'lifts',...(optional.poolCount?['pool']:[])],excludedCosts:r.excludedCosts.filter(k=>k!=='pool'||!optional.poolCount),scopeAssumptions:{designComplexity:input.designComplexity??'standard',structureComplexity:input.structureComplexity??'standard',accessCondition:input.accessCondition??'unknown',groundCondition:input.groundCondition??'unknown',basementFinish:input.basementFinish??'parking',distribution:'Low/base/high working cost uncertainty conditional on selected finish and scope; ±8% building rate and disclosed scope allowances are modelling assumptions, not verified statistical quantiles. Unknown ground/access retain wider allowances; exceptional rock/water excluded'},area,areaBreakdown:{aboveGround:above,basement:+basementArea,source:input.basementArea==null&&config.basementLevels?'Assumed equal floor plates; replace with measured area split':'User total/split'},dwellingCount:+dwellings,liftCount:+liftCount,low:totals[0],mid:totals[1],high:totals[2],rateLow:totals[0]/area,rateMid:totals[1]/area,rateHigh:totals[2]/area,constructionLow:hard[0],constructionMid:hard[1],constructionHigh:hard[2],components,professionalPct:0,approvalsPct:0,externalPct:0,contingencyPct:0,demolition:0,complexity:1,siteUnknowns:unknowns,assumptions:['Both dwellings included in total constructed area','Sydney comparator; ground/access remain unverified unless explicitly selected. No exceptional rock/water included; geotechnical, survey and builder review required','Basement shell includes excavation; no second basement uplift','Selected pools included once; exceptional rock/water, demolition and contributions excluded','Lifts only included when explicitly selected; no configuration infers a lift','No future escalation automatically added; reprice at tender']};
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
// Buyer acquisition amounts are explicit scenario inputs, never inferred credit approval.
function acquisitionScenario(i={}){
 const ownershipRole=i.ownershipRole??'owner';
 if(!['owner','buyer'].includes(ownershipRole))return{status:'review',reason:'Confirm owner or buyer ownership role.'};
 if(ownershipRole==='owner')return{status:'indicative',ownershipRole};
 const a=i.acquisition,keys=['purchasePrice','deposit','cashContribution','loanAmount','stampDuty','legal','dueDiligence','otherCosts','annualRate','settlementMonths'];
 if(!a||keys.some(k=>!['number','string'].includes(typeof a[k])||!numeric(a[k])||+a[k]<0))return{status:'review',reason:'Buyer acquisition needs explicit purchase price, deposit, purchase cash contribution (including deposit), loan amount, duty, legal, due diligence, other costs, annual rate and settlement months. Unknown amounts are not zero.'};
 const v=Object.fromEntries(keys.map(k=>[k,+a[k]]));
 if(v.purchasePrice<=0||v.deposit>v.purchasePrice||v.deposit>v.cashContribution||Math.abs(v.cashContribution+v.loanAmount-v.purchasePrice)>.01||v.annualRate>1||!Number.isInteger(v.settlementMonths)||v.settlementMonths>600)return{status:'review',reason:'Deposit must fit within purchase cash and price; cash including deposit plus acquisition loan must equal purchase price. Confirm rate and whole settlement months.'};
 return{status:'indicative',ownershipRole,...v,acquisitionCosts:v.stampDuty+v.legal+v.dueDiligence+v.otherCosts,loanApproval:'unverified scenario only',cashContributionIncludesDeposit:true};
}
function financeSchedule(i={}){
 const review=reason=>({status:'review',reason,version:FINANCE_ASSUMPTION.version});
 const acquisition=acquisitionScenario(i);if(acquisition.status==='review')return review(acquisition.reason);
 const buyer=acquisition.ownershipRole==='buyer',lead=buyer?acquisition.settlementMonths:0;
 const land=buyer?acquisition.purchasePrice:i.land??0,delivery=i.delivery??0,landDebt=buyer?acquisition.loanAmount:i.landDebt??(i.landDebtRatio!=null?land*i.landDebtRatio:0),ratio=i.constructionBorrowingRatio??.7,rate=i.interestRate??FINANCE_ASSUMPTION.interestRate;
 const timing={preconstructionMonths:i.preconstructionMonths??3,constructionMonths:i.constructionMonths??12,settlementMonths:i.settlementMonths??3,delayMonths:i.delayMonths??0};
 if([land,delivery,landDebt].some(v=>!numeric(v)||+v<0))return review('Confirm nonnegative land value, delivery spend and explicit outstanding land debt.');
 if([ratio,rate,i.landDebtRatio??0].some(v=>!numeric(v)||+v<0||+v>1))return review('Confirm borrowing ratios and annual interest rate between zero and one.');
 if(Object.values(timing).some(v=>!Number.isInteger(+v)||+v<0||+v>600)||+timing.constructionMonths<1)return review('Confirm whole months for preconstruction, construction, settlement and delay; construction must be at least one month.');
 Object.keys(timing).forEach(k=>timing[k]=+timing[k]);
 const months=Object.values(timing).reduce((a,b)=>a+b,0);if(months+lead>600)return review('Confirm total project duration of 600 months or less.');
 if(i.capitaliseInterest!=null&&typeof i.capitaliseInterest!=='boolean')return review('Confirm whether interest is capitalised or paid monthly.');
 const capitalise=i.capitaliseInterest??true,fee=i.financeEstablishment??20000;
 if(!numeric(fee)||+fee<0)return review('Confirm a nonnegative establishment fee paid from equity.');
 const raw=i.drawWeights??Array.from({length:timing.constructionMonths},()=>1);
 if(!Array.isArray(raw)||raw.length!==timing.constructionMonths||raw.some(v=>!numeric(v)||+v<0)||!raw.some(v=>+v>0))return review('Draw weights must match build months and contain nonnegative milestone weights with a positive sum.');
 const eligible=i.eligibleConstruction??delivery;
 if(!numeric(eligible)||+eligible<0||+eligible>+delivery)return review('Eligible construction must be between zero and delivered spend, excluding consultant, approval, contingency and finance costs.');
 const sum=raw.reduce((a,b)=>a+ +b,0),weights=raw.map(v=>+v/sum),principal=+eligible* +ratio;
 const calculate=(annualRate,extraDelay=0)=>{
  let balance=+landDebt,interest=0,peakDebt=balance,repayment=0,cumulativeDraw=0,acquisitionBalance=buyer?+landDebt:0,acquisitionInterest=0;
  const rows=[],n=months+extraDelay;
  if(buyer)for(let m=1;m<=lead;m++)rows.push({month:m,phase:'acquisition',openingDebt:0,constructionSpend:0,constructionDraw:0,cumulativeConstructionDraw:0,acquisitionDraw:m===lead?acquisition.loanAmount:0,equityContribution:(m===1?acquisition.deposit:0)+(m===lead?acquisition.cashContribution-acquisition.deposit+acquisition.acquisitionCosts:0),establishmentFee:0,interest:0,acquisitionInterest:0,capitalisedInterest:0,cashInterest:0,debtBeforeRepayment:m===lead?balance:0,settlementRepayment:0,closingDebt:m===lead?balance:0});
  for(let month=1;month<=n;month++){
   const buildIndex=month-timing.preconstructionMonths-1,building=buildIndex>=0&&buildIndex<timing.constructionMonths;
   const phase=month<=timing.preconstructionMonths?'preconstruction':building?'construction':month<=timing.preconstructionMonths+timing.constructionMonths+timing.delayMonths+extraDelay?'delay':'settlement';
   const openingDebt=balance,spend=building?+delivery*weights[buildIndex]:0,draw=building?principal*weights[buildIndex]:0;
   cumulativeDraw+=draw;
   // Mid-month milestone draw convention; opening balance accrues for full month.
   const acquisitionMonthly=buyer?acquisitionBalance*Math.max(0,Math.min(1,acquisition.annualRate+annualRate- +rate))/12:0;
   const monthlyInterest=(openingDebt-acquisitionBalance+draw/2)*annualRate/12+acquisitionMonthly;
   acquisitionInterest+=acquisitionMonthly;if(capitalise)acquisitionBalance+=acquisitionMonthly;
   interest+=monthlyInterest;balance+=draw+(capitalise?monthlyInterest:0);peakDebt=Math.max(peakDebt,balance);
   const debtBeforeRepayment=balance,settlementRepayment=month===n&&i.exitStrategy!=='retain'?balance:0;
   if(settlementRepayment){repayment=settlementRepayment;balance=0;}
   rows.push({month:month+lead,phase,openingDebt,constructionSpend:spend,constructionDraw:draw,cumulativeConstructionDraw:cumulativeDraw,equityContribution:spend-draw+(capitalise?0:monthlyInterest)+(month===1?+fee+(buyer&&!lead?acquisition.cashContribution+acquisition.acquisitionCosts:0):0),acquisitionDraw:buyer&&!lead&&month===1?acquisition.loanAmount:0,acquisitionInterest:acquisitionMonthly,establishmentFee:month===1?+fee:0,interest:monthlyInterest,capitalisedInterest:capitalise?monthlyInterest:0,cashInterest:capitalise?0:monthlyInterest,debtBeforeRepayment,settlementRepayment,closingDebt:balance});
  }
  return{rows,interest,acquisitionInterest,financeCost:interest+ +fee,peakDebt,debtAtCompletion:rows.at(-1)?.debtBeforeRepayment??0,repaymentAtSettlement:repayment};
 };
 const result=calculate(+rate),summary=x=>({interest:x.interest,financeCost:x.financeCost,debtAtCompletion:x.debtAtCompletion,repaymentAtSettlement:x.repaymentAtSettlement});
 return{status:'indicative',...result,ownershipRole:acquisition.ownershipRole,acquisition:buyer?acquisition:null,acquisitionBorrowing:buyer?acquisition.loanAmount:0,version:FINANCE_ASSUMPTION.version,assumption:{...FINANCE_ASSUMPTION,interestRate:+rate,label:i.interestRate!=null?'User annual development finance rate — confirm terms':FINANCE_ASSUMPTION.label},interestRate:+rate,landDebt:+landDebt,landEquity:+land- +landDebt,eligibleConstruction:+eligible,constructionBorrowing:principal,constructionEquity:+delivery-principal,financeEstablishment:+fee,capitaliseInterest:capitalise,holdingMonths:months+lead,timing,drawWeights:weights,constructionBorrowingRatio:+ratio,sensitivities:{rateMinus2:summary(calculate(Math.max(0,+rate-.02))),ratePlus1:summary(calculate(Math.min(1,+rate+.01))),ratePlus2:summary(calculate(Math.min(1,+rate+.02))),delayPlus3:summary(calculate(+rate,3)),delayPlus6:summary(calculate(+rate,6))},warnings:months>24?['Project exceeds the cited lender’s advertised maximum 24-month term; refinance/extension not priced.']:[],note:(buyer?'Buyer purchase equity is purchase price less the explicit acquisition loan; deposit is part of purchase cash. Acquisition lead-in months precede the project; the loan draws at land settlement and accrues from the next month. Acquisition interest uses its separate rate; rate sensitivities shift both rates equally. ':'')+'Land equity is retained-property opportunity value for owners; explicit land debt is outstanding at start. Delivery is drawn progressively in normalised milestone weights with mid-month interest. Establishment fees are paid from equity, never counted as principal. Debt principal is repaid on sale, remains outstanding when retaining, and is not a second project cost. Monthly cash interest is paid from equity when not capitalised. Borrowing ratio and timing are illustrative funding assumptions, not lender approval; ancillary project costs are equity funded.'};
}
// Residential input/output contract: amounts AUD; rates decimal annual; whole-month timing.
// projectCost is delivery spend only. Accommodation, bond and refinance fees are equity funded.
// Contributions consume named sources separately; emergencyReserve applies only to savings.
// Output rows show actual debt, interest and repayments; projectInterest is incremental versus
// the same existing mortgage without project funding. Projections run from today's opening debt.
function residentialFinance(i={}){
 const review=reason=>({status:'review',reason,decisionReady:false});
 const val=(k,d=0)=>i[k]==null?d:+i[k];
 const keys=['projectCost','existingBalance','savings','savingsContribution','emergencyReserve','offsetBalance','offsetContribution','redrawAvailable','redrawContribution','monthlyRent','weeklyRent','monthlyRates','monthlyInsurance','monthlyUtilities','monthlyHolding','movingCost','storageMonthly','bond','refinanceFees'];
 if(keys.some(k=>i[k]!=null&&(!numeric(i[k])||+i[k]<0)))return review('Enter nonnegative finance, cash and accommodation amounts.');
 const projectCost=val('projectCost'),existing=val('existingBalance'),rate=val('annualRate',.0615),existingRate=val('existingRate',rate),term=val('termYears',30),existingTerm=val('existingTermYears',val('existingRemainingTermYears',term)),ioMonths=val('ioMonths',24);
 if([rate,existingRate,val('refinanceRate',rate)].some(x=>!Number.isFinite(x)||x<0||x>1)||!Number.isInteger(term*12)||term<1||term>50||!Number.isInteger(existingTerm*12)||existingTerm<1||existingTerm>50)return review('Confirm annual rates from zero to one and a loan term from 1 to 50 years.');
 const timing={preconstructionMonths:val('preconstructionMonths'),constructionMonths:val('constructionMonths',12),delayMonths:val('delayMonths'),accommodationMonths:val('accommodationMonths')};
 if(Object.values(timing).some(x=>!Number.isInteger(x)||x<0||x>600)||timing.constructionMonths<1||timing.preconstructionMonths+timing.constructionMonths+timing.delayMonths>600)return review('Confirm whole project months, with at least one construction month and no more than 600 project months.');
 const type=i.repaymentType||'pi',newType=i.newRepaymentType||type,newIO=val('newIOMonths',ioMonths),mode=i.fundingMode||'loan',borrowingType=i.borrowingType||'construction';if(!['mortgage','construction'].includes(borrowingType)||!['pi','io'].includes(type)||!['pi','io'].includes(newType)||!['cash','loan','hybrid'].includes(mode)||type==='io'&&(!Number.isInteger(ioMonths)||ioMonths<0||ioMonths>=existingTerm*12)||newType==='io'&&(!Number.isInteger(newIO)||newIO<0||newIO>=term*12))return review('Confirm cash, loan or hybrid funding, repayment type and an interest-only period shorter than the loan term.');
 if(i.refinance!=null&&typeof i.refinance!=='boolean')return review('Confirm whether the existing mortgage is refinanced.');
 if(['propertyValue','completedValue'].some(k=>i[k]!=null&&(!numeric(i[k])||+i[k]<0))||i.growthRate!=null&&(!numeric(i.growthRate)||+i.growthRate<=-1||+i.growthRate>1))return review('Confirm a nonnegative property value and a valid explicit growth assumption.');
 const savings=val('savings'),reserve=val('emergencyReserve'),cash=val('savingsContribution'),offset=val('offsetBalance'),offsetUsed=val('offsetContribution'),redraw=val('redrawContribution');
 if(cash>Math.max(0,savings-reserve)||offsetUsed>offset||redraw>val('redrawAvailable'))return review('Contributions exceed savings after reserve, offset balance or user stated redraw availability.');
 if(cash+offsetUsed+redraw>projectCost)return review('Funding contributions exceed the delivery spend.');
 const borrowing=projectCost-cash-offsetUsed-redraw;if(mode==='cash'&&(borrowing>0||redraw>0))return review('Cash funding requires the delivery spend to be fully covered by savings and offset withdrawals.');
 const weights=i.drawWeights??Array.from({length:timing.constructionMonths},()=>1);
 if(!Array.isArray(weights)||weights.length!==timing.constructionMonths||weights.some(x=>!numeric(x)||+x<0)||!weights.some(x=>+x>0))return review('Draw weights must match construction months and have a positive total.');
 const sum=weights.reduce((s,x)=>s+ +x,0),drawWeights=weights.map(x=>+x/sum),fees=val('refinanceFees');
 const monthlyRent=i.monthlyRent==null?val('weeklyRent')*52/12:val('monthlyRent'),monthlyHolding=val('monthlyRates')+val('monthlyInsurance')+val('monthlyUtilities')+val('monthlyHolding'),holdingCost=monthlyHolding*(timing.preconstructionMonths+timing.constructionMonths+timing.delayMonths);
 const rent=timing.accommodationMonths*(monthlyRent+val('storageMonthly'))+val('movingCost'),bond=val('bond');
 const payment=(p,r,n)=>p<=0?0:r===0?p/n:p*(r/12)/(1-Math.pow(1+r/12,-n));
 const calculate=(uplift=0,delay=0)=>{
  const r=rate+uplift,er=(i.refinance?val('refinanceRate',rate):existingRate)+uplift,finish=timing.preconstructionMonths+timing.constructionMonths+timing.delayMonths+delay;
  const existingPayment=type==='io'?Math.max(0,existing+redraw-offset+offsetUsed)*er/12:payment(existing+redraw,er,existingTerm*12),newPayment=newType==='io'?borrowing*r/12:payment(borrowing,r,term*12);
  let eb=existing+redraw,nb=0,baseline=existing,interest=0,baseInterest=0,projectInterest=0,newProjectInterest=0,existingInterestChange=0,offsetInterestLost=0,totalPayments=0,incrementalDebtPayments=0;const rows=[],projections={};
  const baselinePayment=type==='io'?Math.max(0,existing-offset)*existingRate/12:payment(existing,existingRate,existingTerm*12),months=Math.max(120,finish+1,type==='io'?ioMonths+1:0,newType==='io'?(borrowingType==='mortgage'?newIO:finish+newIO)+1:0);
  for(let month=1;month<=months;month++){
   const index=month-timing.preconstructionMonths-1,draw=borrowingType==='mortgage'?(month===1?borrowing:0):(index>=0&&index<timing.constructionMonths?borrowing*drawWeights[index]:0);
   const openingExistingBalance=eb;
   const ei=Math.max(0,eb-(offset-offsetUsed))*er/12,bi=Math.max(0,baseline-offset)*existingRate/12,ni=(nb+draw/(borrowingType==='mortgage'?1:2))*r/12;
   const isIO=type==='io'&&month<=ioMonths;
   const ep=isIO?ei:Math.min(eb+ei,type==='io'?payment(eb,er,Math.max(1,existingTerm*12-month+1)):existingPayment);
   const bp=isIO?bi:Math.min(baseline+bi,type==='io'?payment(baseline,existingRate,Math.max(1,existingTerm*12-month+1)):baselinePayment);
   // Construction facility pays interest monthly; amortisation begins after completion/delay.
   const elapsed=borrowingType==='mortgage'?month:Math.max(0,month-finish),postIO=newType==='io'&&elapsed<=newIO;
   const np=(borrowingType==='construction'&&month<=finish)||postIO?ni:Math.min(nb+draw+ni,newType==='io'?payment(nb+draw,r,Math.max(1,term*12-elapsed+1)):newPayment);
   eb=Math.max(0,eb+ei-ep);baseline=Math.max(0,baseline+bi-bp);nb=Math.max(0,nb+draw+ni-np);
   interest+=ei+ni;baseInterest+=bi;totalPayments+=ep+np;
   if(month<=finish){incrementalDebtPayments+=ep+np-bp;projectInterest+=ei+ni-bi;newProjectInterest+=ni;existingInterestChange+=ei-bi;offsetInterestLost+=Math.min(offsetUsed,Math.max(0,openingExistingBalance-(offset-offsetUsed)))*er/12;}
   rows.push({month,phase:month<=timing.preconstructionMonths?'preconstruction':index>=0&&index<timing.constructionMonths?'construction':month<=finish?'delay':'occupied',newDraw:draw,existingInterest:ei,newInterest:ni,existingRepayment:ep,newRepayment:np,baselineRepayment:bp,existingBalance:eb,newBalance:nb,totalBalance:eb+nb,interest:ei+ni,cumulativeInterest:interest});
   if([12,60,120].includes(month)){
    const years=month/12,initial=month>=finish?(i.completedValue??i.propertyValue):i.propertyValue,propertyValue=initial==null?null:+initial*Math.pow(1+(i.growthRate==null?0:+i.growthRate),years);
    projections[years]={years,balance:eb+nb,existingBalance:eb,newBalance:nb,interest,repayments:totalPayments,propertyValue,equity:propertyValue==null?null:propertyValue-eb-nb,growthAssumed:i.growthRate!=null};
   }
  }
  const currentMonthlyRepayment=type==='io'?Math.max(0,existing-offset)*existingRate/12:payment(existing,existingRate,existingTerm*12);
  const occupied=rows[finish],scheduledMonthly={existing:occupied.existingRepayment,new:occupied.newRepayment,total:occupied.existingRepayment+occupied.newRepayment},reversion=rows[Math.max(finish,type==='io'?ioMonths:0,newType==='io'?(borrowingType==='mortgage'?newIO:finish+newIO):0)];
  return{rows,projections,incrementalDebtPayments,currentMonthlyRepayment,incrementalMonthlyRepayment:scheduledMonthly.total-currentMonthlyRepayment,projectInterest,newProjectInterest,existingInterestChange,refinanceInterestSavings:Math.max(0,-existingInterestChange),offsetInterestLost,monthlyRepayment:scheduledMonthly,postIOMonthlyRepayment:type==='io'||newType==='io'?{existing:reversion.existingRepayment,new:reversion.newRepayment,total:reversion.existingRepayment+reversion.newRepayment,month:reversion.month}:null,projectMonths:finish,existingAnnualRate:er,annualRate:r};
 };
 const result=calculate(),additionalCashRequired=Math.max(0,rent+holdingCost+fees+bond+result.incrementalDebtPayments),remainingAccessibleCash=Math.max(0,savings-cash-reserve)+offset-offsetUsed,brief=(x,extraDelay=0)=>({holdingCost:holdingCost+monthlyHolding*extraDelay,accommodationCost:rent+(timing.accommodationMonths>0?extraDelay*(monthlyRent+val('storageMonthly')):0),monthlyRepayment:x.monthlyRepayment,currentMonthlyRepayment:x.currentMonthlyRepayment,incrementalMonthlyRepayment:x.incrementalMonthlyRepayment,projectInterest:x.projectInterest,incrementalDebtPayments:x.incrementalDebtPayments,additionalCashRequired:Math.max(0,rent+holdingCost+monthlyHolding*extraDelay+fees+bond+x.incrementalDebtPayments+(timing.accommodationMonths>0?extraDelay*(monthlyRent+val('storageMonthly')):0)),refinanceInterestSavings:x.refinanceInterestSavings,incrementalProjectCost:projectCost+rent+holdingCost+monthlyHolding*extraDelay+fees+x.projectInterest+(timing.accommodationMonths>0?extraDelay*(monthlyRent+val('storageMonthly')):0),projectMonths:x.projectMonths,projections:x.projections});
 return{status:'indicative',decisionReady:false,version:'residential-finance-2026-10-10-v1',...result,projectCost,accommodationCost:rent,holdingCost,monthlyHolding,monthlyRent,refundableBond:bond,refinanceFees:fees,financeCost:result.projectInterest+fees,incrementalProjectCost:projectCost+rent+holdingCost+fees+result.projectInterest,projectCashRequirement:projectCost+rent+holdingCost+fees+result.incrementalDebtPayments+bond,additionalCashRequired,cashShortfall:Math.max(0,additionalCashRequired-remainingAccessibleCash),funding:{mode,savingsContribution:cash,offsetContribution:offsetUsed,redrawContribution:redraw,newBorrowing:borrowing,existingBalanceAfterRedraw:existing+redraw,remainingSavings:savings-cash,emergencyReserve:reserve,remainingOffset:offset-offsetUsed},timing,drawWeights,borrowingType,sensitivities:{ratePlus1:brief(calculate(.01)),ratePlus2:brief(calculate(.02)),delayPlus3:brief(calculate(0,3),3)},assumptions:{annualRate:rate,rateLabel:i.annualRate==null?'RBA August 2026 new owner-occupier principal-and-interest housing lending benchmark 6.15%; workbook updated 8 October, checked 10 October 2026; not a construction rate or lender quote':'User entered annual rate',termYears:term,existingTermYears:existingTerm,existingRateLabel:i.existingRate==null?'Benchmark placeholder; replace with actual existing mortgage rate':'User entered existing mortgage rate',repaymentType:type,ioMonths,newRepaymentType:newType,newIOMonths:newIO,benchmark:{rate:.0615,period:'August 2026',published:'2026-10-08',checked:'2026-10-10',source:'https://www.rba.gov.au/statistics/interest-rates/',scope:'New owner-occupier principal-and-interest housing loans, mixed fixed/variable; reference only, not an offered construction-loan rate',series:'FLRHOFP'},holdingExpenses:{monthlyRates:val('monthlyRates'),monthlyInsurance:val('monthlyInsurance'),monthlyUtilities:val('monthlyUtilities'),monthlyOther:val('monthlyHolding'),basis:'User monthly household holding allowances; omitted amounts default to zero and are unverified'},rentBasis:i.monthlyRent!=null?'Explicit monthly rent':i.weeklyRent!=null?'Weekly rent multiplied by 52/12':'Rent omitted; zero unverified allowance',interestCapitalised:false,drawConvention:borrowingType==='mortgage'?'Full loan drawn at month one; repayments commence immediately':'Mid-month weighted draws; interest paid monthly; construction loan amortises after project completion',growthRate:i.growthRate??null},note:'Indicative household mortgage arithmetic, not credit approval or confirmation of redraw availability. Redraw is additional existing debt; offset withdrawals reduce interest savings. Existing principal is not a project cost. Cash requirements include the change in actual mortgage repayments against the original loan, including principal repaid during works; economic expenditure includes interest only. Project interest is the signed change against the original mortgage rate and offset; negative values represent interest savings, also reported separately. Savings reserve, offset and redraw are separate sources. Bond is refundable cash required, excluded from economic cost. Accommodation, household holding allowances and refinance fees are paid from cash; household holding is added once over preconstruction, construction and delay. Omitted holding amounts are zero unverified allowances. Growth appears only from an explicit user assumption; property values are user estimates. Interest-only loans revert to principal and interest; lender terms, daily offset treatment require confirmation.'};
}

function feasibility(i={}){
 const availableLines=[...(numeric(i.land)&&+i.land>=0?[{key:'landOpportunity',amount:+i.land}]:[]),...(positive(i.cost?.mid)?[{key:'delivery',amount:+i.cost.mid}]:[])];
 const review=reason=>({status:'review',decisionReady:false,reason,availableSubtotal:{amount:availableLines.reduce((sum,l)=>sum+l.amount,0),lines:availableLines,label:'Known economic subtotal only — incomplete, excludes unresolved contributions and other project costs',complete:false}});
 const provisional=i.provisional===true,provisionalAssumptions=[];
 const explicitExit=i.exitStrategy!=null,retain=i.exitStrategy==='retain';
 if(explicitExit&&!['sell','retain'].includes(i.exitStrategy))return review('Confirm Sell or Retain exit strategy.');
 if(['prohibited','mandatory-standard-not-met'].includes(i.eligibility?.category))return review('Unsupported or prohibited planning proposals remain withheld.');
 const preliminary=i.preliminary===true&&i.eligibility?.readyForPreliminaryCosting===true&&!['prohibited','mandatory-standard-not-met'].includes(i.eligibility?.category);
 if(i.eligibility?.readyForFeasibility!==true&&(!i.exploratory||provisional)&&!preliminary)return review('Planning eligibility must support a conditional preliminary scenario or full feasibility; unsupported proposals remain withheld.');
 const acquisition=acquisitionScenario(i);if(acquisition.status==='review')return review(acquisition.reason);
 const buyer=acquisition.ownershipRole==='buyer';
 if(buyer)i={...i,land:acquisition.purchasePrice,landDebt:acquisition.loanAmount,landDebtRatio:undefined};
 const bounded={holdingMonths:[0,600],interestRate:[0,1],landDebtRatio:[0,1],constructionDrawdown:[0,1],sellingPct:[0,1],commissionPct:[0,1],commissionGstRate:[0,1],saleLegal:[0,Infinity],saleSettlement:[0,Infinity],disposalCosts:[0,Infinity],eligibleConstruction:[0,Infinity],taxPct:[0,1],targetProfitOnCost:[0,10],financeEstablishment:[0,Infinity],financeExitFee:[0,Infinity],otherAuthorityCosts:[0,Infinity],holding:[0,Infinity],accommodation:[0,Infinity],refundableBond:[0,Infinity],marketing:[0,Infinity],legal:[0,Infinity]};
 for(const[k,[lo,hi]]of Object.entries(bounded))if(i[k]!=null&&(!numeric(i[k])||+i[k]<lo||+i[k]>hi))return review('Confirm valid finance, timing and commercial cost assumptions.');
 if(!positive(i.land)||!positive(i.cost?.mid)||!Array.isArray(i.products)||!i.products.length||i.products.some(p=>!positive(p.value)||!Number.isInteger(+p.count)||+p.count<1))return review('Confirm land/current-property value, delivered cost and sold evidence or explicit user assumptions for each finished product.');
 let contributionInput=i.contributions??(i.extras&&Object.prototype.hasOwnProperty.call(i.extras,'authorityContributions')?{status:'user-allowance',amount:i.extras.authorityContributions}:{});
 let contributions=assessContributions(contributionInput);
 if(provisional&&contributions.amount===null&&numeric(i.provisionalContributionAmount)&&+i.provisionalContributionAmount>=0){contributions=assessContributions({status:'provisional',amount:+i.provisionalContributionAmount,source:'Explicit provisional scenario allowance — unverified, not a statutory calculation'});}
 if(provisional&&!contributions.decisionReady&&contributions.amount!==null)provisionalAssumptions.push('Contribution allowance $'+contributions.amount+' is unverified, not a statutory assessment; replace with applicable plan and parcel evidence.');
 if(contributions.amount===null)return{...review('Contributions are unresolved: '+contributions.reason),contributions};
 const grv=i.products.reduce((a,p)=>a+ +p.value* +p.count,0),land=+i.land,delivery=+i.cost.mid,lines={};
 for(const[key,val]of Object.entries(i.extras||{}))if(key!=='authorityContributions'&&['demolition','professional','approvals','externalWorks','contingency'].includes(key)&&(i.cost.excludedCosts||[]).includes(key)){
  if(!numeric(val)||+val<0)return review('Confirm nonnegative excluded-cost allowances.');lines[key]=+val;
 }
 lines.authorityContributions=contributions.amount;
 const extras=Object.values(lines).reduce((a,b)=>a+b,0);
 // holdingMonths remains a supported explicit total; otherwise use phase durations.
 if(i.financeMode!=null&&!['cash','debt'].includes(i.financeMode))return review('Confirm cash or debt funding mode.');
 if(i.landDebt!=null&&(!['number','string'].includes(typeof i.landDebt)||!numeric(i.landDebt)||+i.landDebt<0))return review('Confirm valid nonnegative existing land debt; an invalid entry cannot be replaced with provisional zero.');
 const debtUnknown=i.landDebt==null&&i.landDebtRatio==null;
 if(debtUnknown&&!provisional&&i.exploratory!==true)return review('Existing land debt is unresolved. Confirm zero or an outstanding balance, or explicitly enable a provisional scenario.');
 if((provisional||i.exploratory===true)&&debtUnknown)provisionalAssumptions.push('Unknown existing land debt modelled provisionally as $0 for sensitivity only; this is not confirmed zero debt.');
 let eligibleConstruction=delivery;
 if(explicitExit){
  const poolDesign=i.cost.poolComponents?.find(l=>l.key==='designApprovals')?.mid??0;
  eligibleConstruction=i.eligibleConstruction??(numeric(i.cost.constructionMid)?Math.max(0,+i.cost.constructionMid-poolDesign)*1.1:null);
  if(eligibleConstruction==null&&i.financeMode!=='cash'&&(i.constructionBorrowingRatio??.7)>0)return review('Confirm measured eligible construction before borrowing against a bundled delivered estimate.');
  eligibleConstruction??=0;
 }
 const financeInput={...i,land,delivery,eligibleConstruction,...((provisional||i.exploratory===true)&&debtUnknown?{landDebt:0}:{}),...(i.financeMode==='cash'?{constructionBorrowingRatio:0,financeEstablishment:0}:{}),settlementMonths:i.settlementMonths??(i.holdingMonths!=null?+i.holdingMonths-(i.preconstructionMonths??3)-(i.constructionMonths??12)-(i.delayMonths??0):3)};
 const schedule=financeSchedule(financeInput);if(schedule.status==='review')return review(schedule.reason);
 const otherAuthorityUnknown=explicitExit&&i.otherAuthorityCosts==null,otherAuthorityCosts=+(i.otherAuthorityCosts??0),financeExitFee=+(i.financeExitFee??0);
 if(otherAuthorityUnknown)provisionalAssumptions.push('Other authority costs unresolved: HPC and utility/headworks charges are excluded unless separately assessed and entered. The $0 budget placeholder is not a verified zero or exemption.');
 if(explicitExit)provisionalAssumptions.push('Finance exit / discharge fee $'+financeExitFee+' is an editable illustrative allowance funded from equity; confirm facility terms, including any refinance on retention.');
 const cents=value=>Math.round((value+Number.EPSILON)*100)/100;
 const commission=retain?0:cents(grv*(i.commissionPct??.02)),commissionGST=retain?0:cents(commission*(i.commissionGstRate??.1));
 const finance=schedule.interest,establishment=schedule.financeEstablishment,holding=+(i.holding??15000),accommodation=+(i.accommodation??0),refundableBond=+(i.refundableBond??0),selling=retain?0:explicitExit?cents(commission+commissionGST):grv*(i.sellingPct??.025),marketing=retain?0:+(i.marketing??10000),legal=+(i.legal??(explicitExit?0:30000)),saleLegal=explicitExit&&!retain?+(i.saleLegal??3000):0,saleSettlement=explicitExit&&!retain?+(i.saleSettlement??0):0,disposalCosts=explicitExit&&!retain?+(i.disposalCosts??0):0,taxSensitivity=retain?0:grv*(i.taxPct??0),target=+(i.targetProfitOnCost??.2);
 if(provisional&&buyer)provisionalAssumptions.push('Buyer purchase cash $'+acquisition.cashContribution+' includes deposit $'+acquisition.deposit+'; acquisition costs $'+acquisition.acquisitionCosts+' extra; acquisition loan $'+acquisition.loanAmount+' at '+acquisition.annualRate*100+'% is unapproved scenario funding. Land settlement '+acquisition.settlementMonths+' months after contract precedes project phases.');
 if(provisional)provisionalAssumptions.push(
  (buyer?'Acquired site purchase price $':'Retained site opportunity value $')+land+(buyer?' is a cash acquisition counted once; GRV $':' is an economic cost, not a cash purchase; GRV $')+grv+' is the supplied product-value scenario, not an independent valuation.',
  'Construction borrowing '+(schedule.constructionBorrowingRatio*100)+'%; existing land debt $'+schedule.landDebt+'; annual interest '+(schedule.interestRate*100)+'%; establishment $'+establishment+'; '+(schedule.capitaliseInterest?'capitalised':'cash-paid')+' interest. Funding is a scenario, not lender approval.',
  'Timing: '+schedule.timing.preconstructionMonths+' months preconstruction, '+schedule.timing.constructionMonths+' construction, '+schedule.timing.delayMonths+' delay and '+schedule.timing.settlementMonths+' settlement; staged draws use the returned monthly schedule.',
  'Holding $'+holding+'; accommodation $'+accommodation+'; refundable bond $'+refundableBond+' is cash only; selling $'+selling+' (commission GST included once); marketing $'+marketing+'; project legal $'+legal+'; sale legal $'+saleLegal+'; sale settlement $'+saleSettlement+'; other disposal $'+disposalCosts+'.',
  (i.taxPct!=null?'Explicit tax sensitivity '+((retain?0:+i.taxPct)*100)+'% of gross revenue ($'+taxSensitivity+'), not a computed GST or income-tax liability.':'Pretax scenario: project GST and income tax are unresolved and excluded, not verified zero.')+' Delivery already includes its GST allowance.',
  'Delivered '+(i._costScenario?'cost sensitivity':'base cost')+' $'+delivery+'; low/base/high are working uncertainty scenarios conditional on selected finish and scope, not verified statistical quantiles or quotes.'
 );
 const costReconciliation=[{key:buyer?'landPurchase':'landOpportunity',label:buyer?'Site purchase price (deposit included)':'Retained land/current-property opportunity value',amount:land},...(buyer?[{key:'acquisitionCosts',label:'Acquisition duty, legal, due diligence and other costs',amount:acquisition.acquisitionCosts}]:[]),{key:'delivery',label:'Delivered construction (GST allowance included once)',amount:delivery},...Object.entries(lines).map(([key,amount])=>({key,label:key,amount})),{key:'interest',label:'Progressive finance interest (principal excluded)',amount:finance},{key:'establishment',label:'Finance establishment',amount:establishment},{key:'financeExitFee',label:'Finance exit / discharge fee (equity funded; principal excluded)',amount:financeExitFee},{key:'otherAuthorityCosts',label:'Other authority / HPC / utility headworks allowance',amount:otherAuthorityCosts},{key:'holding',label:'Holding costs',amount:holding},{key:'accommodation',label:'Temporary accommodation and moving/storage (bond excluded)',amount:accommodation},{key:'selling',label:'Selling costs',amount:selling},{key:'marketing',label:'Marketing',amount:marketing},{key:'legal',label:'Legal',amount:legal},{key:'saleLegal',label:'Sale conveyancing / legal',amount:saleLegal},{key:'saleSettlement',label:'Sale settlement / discharge',amount:saleSettlement},{key:'disposalCosts',label:'Other disposal expenses',amount:disposalCosts},{key:'taxSensitivity',label:i.taxPct!=null?'Explicit user tax sensitivity (not calculated tax)':'Unresolved project tax excluded — pretax scenario',amount:taxSensitivity}];
 const other=(buyer?acquisition.acquisitionCosts:0)+delivery+extras+establishment+financeExitFee+otherAuthorityCosts+holding+accommodation+selling+marketing+legal+saleLegal+saleSettlement+disposalCosts+taxSensitivity,total=land+other+finance,profit=grv-total;
 // Interest is affine in land where a debt ratio is supplied, fixed otherwise.
 const zero=financeSchedule({...financeInput,land:0,landDebt:0,landDebtRatio:0}).interest;
 const landInterestFactor=i.landDebt==null&&i.landDebtRatio!=null?(finance-zero)/land:0;
 const fixedFinance=landInterestFactor?zero:finance,residual=(grv/(1+target)-other-fixedFinance)/(1+landInterestFactor);
 const exploratory=i.exploratory===true,decisionReady=!exploratory&&!preliminary&&contributions.decisionReady&&!otherAuthorityUnknown;
 const result={status:provisional?'provisional':exploratory?'exploratory':preliminary?'conditional':'indicative',provisionalAssumptions,scenarioMode:preliminary?'conditional':exploratory?'exploratory':'supported',decisionReady:decisionReady&&!provisional,costVersion:i.cost.version,deliveryBand:'mid',ignoredIncludedExtras:Object.keys(i.extras||{}).filter(key=>(i.cost.includedCosts||[]).includes(key)),grv,site:land,delivery,lines,contributions,finance,financeSchedule:schedule,financeEstablishment:establishment,holding,accommodation,refundableBond,cashRequirement:other+finance+refundableBond,selling,marketing,legal,taxSensitivity,resultBasis:i.taxPct!=null&&!retain?'explicit-tax-sensitivity':'pretax',pretaxTotal:total-taxSensitivity,pretaxProfit:retain?null:profit+taxSensitivity,taxAssumptions:{status:i.taxPct!=null?'user-sensitivity':'unresolved',gstStatus:'unresolved',incomeTaxStatus:'unresolved',method:i.taxPct!=null?'Explicit user gross-revenue sensitivity allowance; not a calculated GST or income-tax liability':'Pretax: project GST and income tax not calculated; excluded amounts are not verified zero',rate:i.taxPct!=null?(retain?0:+i.taxPct):null,deliveryGST:'Already included in delivered estimate; no second 10% charge',professionalReviewRequired:true},costReconciliation,landOpportunityCost:land,incrementalCashCost:other+finance,total,profit,margin:profit,profitOnCost:profit/total,profitOnGrv:profit/grv,marginPct:profit/grv,residualLandValue:buyer?null:residual,holdingMonths:schedule.holdingMonths,interestRate:schedule.interestRate,targetProfitOnCost:target,assumptions:{landDebt:schedule.landDebt,landEquity:schedule.landEquity,constructionBorrowingRatio:schedule.constructionBorrowingRatio,capitaliseInterest:schedule.capitaliseInterest,contributionStatus:contributions.status},sensitivities:Object.fromEntries(Object.entries(schedule.sensitivities).map(([k,v])=>[k,{...v,total:total-finance+v.interest,profit:grv-total+finance-v.interest}])),note:(preliminary?'Conditional preliminary scenario for a supported consent investigation; not development approval or an established achievable design. Outstanding planning and design requirements must be resolved. ':'')+(exploratory?'Exploratory scenario; planning eligibility is not established. ':'')+(contributions.decisionReady?'':'Contribution amount is an explicit unverified allowance; decision readiness is withheld. ')+'Monthly progressive development finance, not a lender quote. Debt principal is not double-counted as a cost. Explicit temporary accommodation is included once; refundable bond is cash required and excluded from profit. Residual assumes retained existing land without acquisition duty, fixed delivery and other costs, stated target profit on cost and unchanged explicit debt (or stated debt ratio). Separate net GST/tax adjustment and professional review required.'};
 // Conservative peak: all non-delivery costs are equity funded before sale; no presale receipts assumed.
 const ancillaryCash=extras+financeExitFee+otherAuthorityCosts+holding+accommodation+selling+marketing+legal+saleLegal+saleSettlement+disposalCosts+taxSensitivity;
 const purchaseCash=buyer?acquisition.cashContribution:0,acquisitionCosts=buyer?acquisition.acquisitionCosts:0;
 const cashInterest=schedule.capitaliseInterest?0:finance,constructionCash=schedule.constructionEquity;
 const cashEquityRequired=purchaseCash+acquisitionCosts+constructionCash+ancillaryCash+establishment+cashInterest;
 const peakCashRequirement=cashEquityRequired+refundableBond,netSaleProceeds=grv-schedule.repaymentAtSettlement;
 const firstProject=schedule.rows.find(r=>r.phase!=='acquisition');
 if(firstProject&&i.ownershipRole!=null){firstProject.ancillaryCash=ancillaryCash;firstProject.refundableBond=refundableBond;firstProject.equityContribution+=ancillaryCash+refundableBond;}
 let cashUsed=0;for(const row of schedule.rows){cashUsed+=row.equityContribution;row.cumulativeCashRequired=cashUsed;}
 result.otherAuthorityCosts=otherAuthorityCosts;result.otherAuthorityCostsStatus=otherAuthorityUnknown?'unresolved':'user-allowance';result.financeExitFee=financeExitFee;
 result.exitStrategy=i.exitStrategy??'sell';result.revenueBasis=retain?'Completed property valuation, unrealised; no sale receipts':'Gross sale proceeds; commission includes GST once; project GST and income tax unresolved';
 result.eligibleConstruction=eligibleConstruction;result.eligibleConstructionBasis=explicitExit?'Measured hard building and site works plus associated GST once; excludes consultants, approvals, contingency and finance; pool design/approval excluded':'Legacy delivered-spend borrowing basis';result.saleLegal=saleLegal;result.saleSettlement=saleSettlement;result.disposalCosts=disposalCosts;
 result.sellingBreakdown={commission:explicitExit?commission:selling,commissionGST:explicitExit?commissionGST:0,total:selling,commissionPct:explicitExit?(i.commissionPct??.02):null,gstRate:explicitExit?(i.commissionGstRate??.1):null,basis:explicitExit?'Commission ex GST plus GST once; other disposal amounts assumed GST inclusive':'Legacy sellingPct is gross selling cost; no extra GST'};
 const variableSelling=explicitExit?(i.commissionPct??.02)*(1+(i.commissionGstRate??.1)):(i.sellingPct??.025),variableCosts=variableSelling+(i.taxPct??0);
 result.breakEvenRevenue=retain||variableCosts>=1?null:(total-selling-taxSensitivity)/(1-variableCosts);result.totalEquityRequired=cashEquityRequired+(buyer?0:schedule.landEquity);
 result.holdModel=retain?{completedValue:grv,debtAtCompletion:schedule.debtAtCompletion,equityAtCompletion:grv-schedule.debtAtCompletion,unrealisedSurplus:profit,totalProjectCost:total,basis:'Indicative completed value less outstanding debt; valuation surplus is unrealised. Rental income, ongoing holding and refinance terms are unmodelled.'}:null;
 result.ownershipRole=acquisition.ownershipRole;result.acquisition=buyer?acquisition:null;
 result.economicTotal=total;result.cashProjectCost=other+finance+(buyer?land:0);
 if(buyer){result.landOpportunityCost=0;result.incrementalCashCost=result.cashProjectCost;result.cashRequirement=result.cashProjectCost+refundableBond;result.note=result.note.replace('Residual assumes retained existing land without acquisition duty, fixed delivery and other costs, stated target profit on cost and unchanged explicit debt (or stated debt ratio). ','');result.note+=' Buyer acquisition price includes deposit; acquisition duty and fees are additional once. Acquisition debt starts at land settlement, before preconstruction; its separate rate applies throughout the project. Buyer residual land value is withheld: acquisition duty and funding must be repriced for another purchase price.';}
 if(i.ownershipRole!=null)result.cashRequirement=peakCashRequirement;
 result.cashFunding={purchaseCash,depositCash:buyer?acquisition.deposit:0,settlementCash:buyer?purchaseCash-acquisition.deposit+acquisitionCosts:0,acquisitionCosts,constructionCash,ancillaryCash,cashInterest,establishmentCash:establishment,cashEquityRequired,refundableBond,peakCashRequirement,netSaleProceeds,cashSurplusAfterReturnOfEquity:netSaleProceeds-cashEquityRequired,returnOnCashEquity:cashEquityRequired>0?(netSaleProceeds-cashEquityRequired)/cashEquityRequired:null,returnOnTotalEquity:schedule.landEquity+cashEquityRequired>0?profit/(buyer?cashEquityRequired:schedule.landEquity+cashEquityRequired):null,basis:'Scenario funding, not loan approval. Purchase cash includes deposit. All ancillary allowances conservatively funded before sale; bond refundable and excluded from returns. Owner cash return includes realisation of retained land; use economic profit for development performance.'};
 // Owner position is a second ledger, not extra economic expenditure. Sale costs are
 // already equity funded above, so deduct them from receipts OR cash invested, not both.
 if(!buyer){
  const disposalCash=selling+marketing+saleLegal+saleSettlement+disposalCosts;
  const saleReceiptsAfterDebt=retain?null:grv-schedule.repaymentAtSettlement;
  const saleNetProceeds=retain?null:saleReceiptsAfterDebt-disposalCash;
  const nonDisposalCashInvested=cashEquityRequired-disposalCash;
  const completionEquity=grv-schedule.debtAtCompletion;
  result.ownerFinancialPosition={exitStrategy:result.exitStrategy,currentPropertyValue:land,currentDebt:schedule.landDebt,currentEquity:schedule.landEquity,completionDebt:schedule.debtAtCompletion,completionEquity,saleReceiptsAfterDebt,saleNetProceeds,disposalCash,nonDisposalCashInvested,cashEquityRequired,peakCashRequirement,refundableBond,equityCreated:retain?completionEquity-schedule.landEquity-cashEquityRequired:saleNetProceeds-nonDisposalCashInvested-schedule.landEquity,equityCreatedBasis:retain?'Unrealised completed-value surplus after new cash invested':'Sale net proceeds less non-disposal cash invested and starting equity',resultBasis:result.resultBasis,interestBasis:'Interest includes existing land debt over the full project period and progressive new borrowing once, including capitalised interest. A do-nothing mortgage-interest counterfactual is not modelled; this is not incremental interest versus keeping the current home.',basis:'Current value is counted once as an opportunity cost, not a cash purchase. Debt principal affects equity and settlement, not economic profit. Sale net proceeds deduct debt and disposal costs; those disposal costs are excluded from non-disposal cash invested. Refundable bond affects peak funding only; project GST and income tax remain unresolved.'};
 }
 if(retain){for(const key of ['profit','margin','profitOnCost','profitOnGrv','marginPct','residualLandValue'])result[key]=null;for(const key of ['netSaleProceeds','cashSurplusAfterReturnOfEquity','returnOnCashEquity','returnOnTotalEquity'])result.cashFunding[key]=null;for(const sensitivity of Object.values(result.sensitivities)){sensitivity.unrealisedSurplus=sensitivity.profit;sensitivity.equityAtCompletion=grv-sensitivity.debtAtCompletion;sensitivity.profit=null;}result.note+=' Retain has no sale receipts or disposal costs; debt remains outstanding at completion and value surplus is unrealised.';}
 // Re-run shared arithmetic so revenue-linked commission/tax and progressive funding respond together.
 if(!i._sensitivity){
  const brief=x=>({grv:x.grv,delivery:x.delivery,finance:x.finance,selling:x.selling,taxSensitivity:x.taxSensitivity,total:x.total,profit:x.profit,profitOnCost:x.profitOnCost,profitOnGrv:x.profitOnGrv,breakEvenRevenue:x.breakEvenRevenue,holdModel:x.holdModel,cashEquityRequired:x.cashFunding?.cashEquityRequired});
  for(const[direction,factor]of [['Minus10',.9],['Plus10',1.1]])result.sensitivities[(retain?'completedValue':'salePrice')+direction]=brief(feasibility({...i,_costScenario:true,_sensitivity:true,products:i.products.map(p=>({...p,value:+p.value*factor}))}));
  result.sensitivities.constructionCostPlus10=brief(feasibility({...i,_costScenario:true,_sensitivity:true,eligibleConstruction:eligibleConstruction*1.1,cost:{...i.cost,mid:delivery*1.1}}));
 }
 if(!i._costScenario){result.costScenarios={};for(const band of ['low','mid','high'])if(positive(i.cost[band])){const scenario=feasibility({...i,_costScenario:true,cost:{...i.cost,mid:+i.cost[band],constructionMid:i.cost['construction'+band[0].toUpperCase()+band.slice(1)],poolComponents:i.cost.poolComponents?.map(l=>({...l,mid:l[band]}))}});result.costScenarios[band]={...scenario,deliveryBand:band};}}
 return result;
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
const RENO_VERSION='renovation-scope-2026-10-17-v2';
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
function renovationCost({components=[],extent='replace',quality='premium',complexity='normal',region=1,counts={},quantities={},allowances={},accessCondition='ordinary',contingencyPct=0}={}){
 const review=reason=>({status:'review',decisionReady:false,low:null,mid:null,high:null,reason,version:RENO_VERSION,components:[]});
 const validNumber=n=>typeof n!=='boolean'&&numeric(n)&&+n>=0;
 if(extent==='reconstruction')return review('Substantial reconstruction needs a measured structural scope and project-specific QS/builder estimate; room packages do not price rebuilding.');
 if(!['replace','refresh','layout','structural'].includes(extent)||!['standard','premium','luxury'].includes(quality)||!['simple','normal','hard'].includes(complexity)||!positive(region))return review('Confirm renovation extent, finish, complexity and regional working factor.');
 if(!['ordinary','restricted','unknown'].includes(accessCondition)||!validNumber(contingencyPct)||+contingencyPct>1)return review('Confirm site access and incremental contingency from zero to 100%.');
 const limits={windowDoorArea:1000,finishArea:10000,structuralOpenings:20,plumbingRelocations:50};
 for(const [k,v]of Object.entries(quantities))if(!(k in limits)||!validNumber(v)||+v>limits[k]||(['structuralOpenings','plumbingRelocations'].includes(k)&&!Number.isInteger(+v)))return review('Confirm nonnegative measured quantities; openings and service relocations must be whole numbers.');
 for(const [k,v]of Object.entries(counts))if(!validNumber(v)||!Number.isInteger(+v)||+v<1||+v>20)return review('Confirm each selected room count from one to twenty.');
 const allowanceKeys=['preliminaries','consultants','approvals','demolition','conditions','access'];
 for(const [k,v]of Object.entries(allowances))if(!allowanceKeys.includes(k)||!validNumber(v))return review('Confirm nonnegative additional project allowances.');
 const unique=[...new Set(components)];
 if(!unique.length||unique.some(k=>!RENOVATION_COMPONENTS[k]))return review('Describe the additional work so a designer or builder can price it.');
 const structural=unique.includes('openplan')||['layout','structural'].includes(extent)||+quantities.structuralOpenings>0;
 const effective={windowDoorArea:quantities.windowDoorArea??8,finishArea:quantities.finishArea??100,structuralOpenings:quantities.structuralOpenings??(structural?counts.openplan??1:0),plumbingRelocations:quantities.plumbingRelocations??0};
 if(structural&&effective.structuralOpenings===0||unique.includes('windows')&&effective.windowDoorArea===0||unique.some(k=>['flooring','painting','wholehome'].includes(k))&&effective.finishArea===0)return review('Selected structural, glazing or shared-finish work needs a positive quantity.');
 if(structural&&!unique.includes('openplan'))unique.push('openplan');
 const keys=unique.filter(k=>!(unique.includes('wholehome')&&['flooring','painting','electrical','living','office'].includes(k)));
 const qualityAdjustment={standard:1,premium:1.2,luxury:1.6}[quality],complexityAdjustment={simple:.95,normal:1,hard:1.2}[complexity],regionAdjustment=+region;
 const exclusions=['Extensions or additional levels','Major service upgrades, hazardous materials, exceptional structure or ground conditions unless explicitly allowed','Unselected rooms, loose furnishings, accommodation and household finance'];
 const lines=keys.map(k=>{
  const c=RENOVATION_COMPONENTS[k],extentAdjustment=k==='openplan'?1:extent==='refresh'?.55:1;
  const n=k==='openplan'?effective.structuralOpenings:counts[k]??1;
  const quantityFactor=k==='windows'?effective.windowDoorArea/8:['flooring','painting','wholehome'].includes(k)?effective.finishArea/100:1;
  const factor=qualityAdjustment*complexityAdjustment*regionAdjustment*extentAdjustment*n*quantityFactor;
  const inclusions=[...c.includes,'GST and ordinary room contingency included; embedded amounts not separately verified'];
  if(k==='openplan')inclusions.push('Ordinary beam installation, temporary support, local demolition and making good; ordinary opening engineering included once');
  return{key:k,label:c.label,low:Math.round(c.band[0]*factor),mid:Math.round(c.band[1]*factor),high:Math.round(c.band[2]*factor),count:n,quantity:k==='windows'?effective.windowDoorArea:['flooring','painting','wholehome'].includes(k)?effective.finishArea:n,unit:k==='windows'||['flooring','painting','wholehome'].includes(k)?'m²':'package',quantityFactor,qualityAdjustment,complexityAdjustment,regionAdjustment,extentAdjustment,version:RENO_VERSION,taxBasis:'gst-inclusive',source:'Internal legacy room allowance; not a QS or builder quote',inclusions,exclusions:[...exclusions]};
 });
 const add=(key,label,values,inclusions,taxBasis='ex-gst',extra={})=>lines.push({key,label,low:Math.round(values[0]),mid:Math.round(values[1]),high:Math.round(values[2]),version:RENO_VERSION,taxBasis,source:'Internal incremental working allowance; not an external quote',inclusions,exclusions:[...exclusions],...extra});
 if(effective.plumbingRelocations){const factor=effective.plumbingRelocations*qualityAdjustment*regionAdjustment;add('plumbingRelocations','Additional plumbing relocations',[1500,3000,6000].map(v=>v*factor),['Rerouting beyond ordinary in-room fixture connections; excludes authority/main-service upgrades'],'ex-gst',{count:effective.plumbingRelocations,unit:'relocation'});}
 for(const [key,label,included]of [
  ['preliminaries','Additional project preliminaries','Extra project setup, supervision and sequencing beyond ordinary room execution'],
  ['consultants','Additional design / consultants','Additional measured design/documentation; excludes engineering already included in structural opening packages'],
  ['demolition','Additional demolition / making good','Work outside room strip-out and structural-opening demolition already included'],
  ['conditions','Additional site / existing-condition allowance','Explicit allowance for separately identified conditions; omitted amount remains unverified']
 ]){const amount=+(allowances[key]??0);add(key,label,[amount,amount,amount],[included]);}
 const access=allowances.access!=null?[+allowances.access,+allowances.access,+allowances.access]:accessCondition==='restricted'?[5000,10000,20000]:[0,0,0];
 add('access','Additional restricted-access allowance',access,['Extra logistics / handling beyond ordinary room access; conditions require confirmation']);
 const incremental=['low','mid','high'].map(b=>lines.filter(l=>l.taxBasis==='ex-gst').reduce((n,l)=>n+l[b],0));
 add('contingency','Additional contingency on incremental scope',incremental.map(v=>v* +contingencyPct),['Explicit additional risk allowance on incremental ex-GST items only; no second contingency on room packages']);
 const approvals=+(allowances.approvals??0);add('approvals','Additional statutory / approval fees',[approvals,approvals,approvals],['Explicit gross government-fee allowance; taxable consultant/report fees belong in consultants'],'gross-statutory');
 const taxable=['low','mid','high'].map(b=>lines.filter(l=>l.taxBasis==='ex-gst').reduce((n,l)=>n+l[b],0));
 add('gst','GST on incremental taxable allowances',taxable.map(v=>v*.1),['GST 10% added once to incremental ex-GST items; room-package GST is already included'],'gst');
 const warnings=['Legacy room packages include ordinary GST and room contingency, but their embedded split is unverified; no artificial rebasing or second allowance is applied.','Zero additional preliminaries, consultants, approvals, demolition or conditions means no separately priced extra; it does not verify those costs are unnecessary.','Glazing default 8 m² per selected package and shared-finish default 100 m² are internal unmeasured reference quantities; confirm actual scope.','Flooring/painting shared quantities exclude selected room finishes. Ordinary room services and structural-opening engineering/support/demo/making good must not be charged again as extras.'];
 if(accessCondition==='unknown')warnings.push('Site access remains unknown; no restricted-access amount has been assumed.');
 return{status:'indicative',decisionReady:false,scenarioClass:structural?'structural':extent==='refresh'?'cosmetic':'replacement',low:lines.reduce((n,l)=>n+l.low,0),mid:lines.reduce((n,l)=>n+l.mid,0),high:lines.reduce((n,l)=>n+l.high,0),components:lines,version:RENO_VERSION,qualityAdjustment,complexityAdjustment,regionAdjustment,quantities:effective,allowances:{...Object.fromEntries(allowanceKeys.map(k=>[k,+(allowances[k]??(k==='access'?access[1]:0))]))},accessCondition,contingencyPct:+contingencyPct,warnings,assumptions:{basis:'Internal scope estimates; no project-specific builder/QS quote or freshly verified 2026 renovation tariff',quantityInputs:Object.fromEntries(Object.keys(effective).map(k=>[k,quantities[k]!=null?'user':'unmeasured working default'])),gst:'Opaque room-package GST retained; 10% applied once only to incremental ex-GST items; statutory fees treated gross',contingency:'Ordinary room contingency remains included but undisaggregated; additional contingency defaults to zero and applies only to incremental scope'},note:'Scope-led internal estimate, not a complete measured project budget or external quote. Ordinary room packages are retained; added quantities and separately identified project scope are priced once. Confirm all zero exclusions, structure, services, access, fees and conditions with a designer/QS/builder.'};
}
function deliveryComposition(cost){if(!positive(cost?.mid))return[];if(!Array.isArray(cost.components))return[{label:'Delivered total — breakdown unavailable',amount:cost.mid,share:1,version:cost.version||VERSION,source:'No measured component breakdown supplied'}];return cost.components.filter(l=>l.mid>0).map(l=>({...l,amount:l.mid,share:l.mid/cost.mid,version:cost.version||VERSION,source:l.source||'Actual working cost component; included once in delivered total'}))}

return{acquisitionScenario,COST_CONFIGS,developmentAreaModel,siteAllowances,nswTransferDuty,DUTY_VERSIONS,interpretIntent,normalizeIntent,RENOVATION_LABELS,RENOVATION_COMPONENTS,renovationCost,deliveryComposition,rateCard,deliveredCost,feasibility,financeSchedule,residentialFinance,assessContributions,FINANCE_ASSUMPTION,CONTRIBUTION_PLAN,roomArea,ROOMS,moveComparison,parseMoney,formatMoney,frontage};});
