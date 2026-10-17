'use strict';
// Synthetic copy of founder-observed controls; not a live planning verification.
const assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM,VirtualConsole}=require('jsdom');
let failed=0;
function setup(saved,date='2026-10-17T00:00:00Z'){return new JSDOM(fs.readFileSync('index.html','utf8'),{url:'https://boggedcake.github.io/ProjectIQ/?fixtures=1',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){
 const NativeDate=w.Date;w.Date=class extends NativeDate{constructor(...args){super(...(args.length?args:[date]))}static now(){return NativeDate.parse(date)}};
 w.scrollTo=()=>{};if(saved)w.localStorage.setItem('sitepivotProjects',saved);
 for(const m of ['address-evidence','response-evidence','property-evidence','zoning-evidence','fsr-evidence','planning-intelligence','contributions-evidence','commercial-engine','comparison-engine','conversation','voice'])w.eval(fs.readFileSync(m+'.js','utf8'));
}})}
function buyer(dom){const a=dom.window.SitePivot,p=JSON.parse(JSON.stringify(a.FIXTURES[0]));
 Object.assign(p,{id:'qa-hope-buyer',address:'43 Hope Street, Seaforth NSW 2092',suburb:'Seaforth',lga:'Northern Beaches Council',area:575.3,frontage:15.5});
 p.planning={...p.planning,zone:'R1 General Residential',instrument:'Manly Local Environmental Plan 2013',splitZone:false,fsr:'0.5:1',height:'8.5 m',minLot:'300 m²'};
 a.app.ownershipRole='buyer';a.selectProperty(p);a.app.goal='develop';a.app.devType='duplex';
 Object.assign(a.app.scope,{gfa:630,gfaSource:'user',configuration:'two-storey-basement',dwellings:2,salePerDwelling:4000000,acquisition:{purchasePrice:3200000}});a.show('scope');return a;
}
function test(name,fn,date){const dom=setup(undefined,date);try{fn(dom);console.log('PASS '+name)}catch(e){failed++;console.error('FAIL '+name+'\n'+e.stack)}finally{dom.window.close()}}
test('buyer next-day source freshness never suppresses a disclosed supported-plan working scenario',dom=>{
 const a=buyer(dom),f=a.computeAssessment().feas;
 assert.notEqual(f.status,'review','A supported published-plan provisional basis should recover the buyer scenario after its review date, without claiming current statutory verification: '+f.reason);
 assert.equal(f.decisionReady,false);assert.equal(f.ownershipRole,'buyer');assert.equal(f.grv,8000000);assert.equal(f.site,3200000);
 assert.ok(f.contributions.amount>0);assert.equal(f.contributions.decisionReady,false);
 assert.match(f.contributions.evidence.missingInputs.join(' '),/Last-reviewed plan basis as of 2026-10-16.*current 2026-10-17/);
 for(const k of ['delivery','finance','selling','total','breakEvenRevenue'])assert.ok(Number.isFinite(f[k])&&f[k]>0,k);
 for(const k of ['profit','profitOnGrv','profitOnCost'])assert.ok(Number.isFinite(f[k]),k);
 assert.ok(f.acquisition.stampDuty>0);assert.ok(f.acquisition.acquisitionCosts>f.acquisition.stampDuty);
 assert.equal(f.cashFunding.purchaseCash,640000);assert.equal(f.financeSchedule.acquisitionBorrowing,2560000);
 assert.ok(f.cashFunding.peakCashRequirement>f.cashFunding.purchaseCash);
 assert.ok(f.financeSchedule.rows.some(r=>r.constructionDraw>0));
 assert.ok(Math.abs(f.costReconciliation.reduce((sum,r)=>sum+r.amount,0)-f.total)<.01,'Every economic cost counted once');
 for(const k of ['low','mid','high'])assert.ok(Number.isFinite(f.costScenarios[k].profit),k);
 a.show('assessment');const text=dom.window.document.querySelector('#consumerResult').textContent;
 assert.match(text,/conditional|provisional/i);assert.match(text,/break.even/i);assert.match(text,/NSW.*duty|transfer duty/i);assert.match(text,/Lower cost/);assert.match(text,/Higher cost/);
 assert.match(text,/Last-reviewed plan basis as of 2026-10-16/);
 a.show('report');const report=dom.window.document.querySelector('#reportContent').textContent;assert.match(report,/Considering purchase/);assert.match(report,/Lower cost/);assert.match(report,/unverified|unassessed/i);
});
test('explicitly disabled provisional scenario remains disabled across save and reopen',dom=>{
 const a=buyer(dom);a.app.scope.provisional=false;assert.equal(a.computeAssessment().feas.status,'review');a.saveLocal();
 const fresh=setup(dom.window.localStorage.getItem('sitepivotProjects'));try{const b=fresh.window.SitePivot;b.reopenProject(a.app.projectId);assert.equal(b.app.scope.provisional,false);assert.equal(b.app.scope.acquisition.purchasePrice,3200000);assert.equal(b.computeAssessment().feas.status,'review')}finally{fresh.window.close()}
});
test('a long-expired snapshot cannot silently determine buyer profit',dom=>{
 const a=buyer(dom);a.app.scope.acquisition.contractDate='2026-10-17';const f=a.computeAssessment().feas;assert.equal(f.status,'review');assert.equal(f.contributions?.amount??null,null);assert.equal(f.profit,undefined);
},'2027-01-17T00:00:00Z');
test('unknown framework stays incomplete and provides a direct allowance action',dom=>{
 const a=buyer(dom);a.app.property.lga='Unknown Council';a.app.property.suburb='Unknown';const f=a.computeAssessment().feas;
 assert.equal(f.status,'review');assert.equal(f.contributions.amount,null);assert.equal(f.profit,undefined);assert.equal(f.availableSubtotal.complete,false);
 a.show('assessment');const box=dom.window.document.querySelector('#workingFeasibility');assert.match(box.textContent,/incomplete/i);
 assert.ok(box.querySelector('input,button,a[href]'),'Incomplete result needs an actionable editable allowance or return-to-assumptions control');
 box.querySelector('button').click();assert.equal(a.app.view,'scope');assert.equal(dom.window.document.querySelector('#feasibilityAdvanced').open,true);assert.equal(dom.window.document.activeElement.id,'feas-provisionalContributions');
});
test('excluded s7.11 and mixed frameworks never inherit the reviewed s7.12 proxy',dom=>{
 const a=buyer(dom);
 for(const p of [{lga:'Northern Beaches Council',suburb:'Dee Why'},{lga:'Northern Beaches Council',suburb:'Warriewood'},{lga:'Northern Beaches Council',suburb:'Seaforth',contributionCatchment:{verified:true,name:'Frenchs Forest Town Centre',source:'Synthetic plan map'}},{lga:'Willoughby City Council',suburb:'Willoughby',contributionCatchment:null}]){
  Object.assign(a.app.property,{contributionCatchment:null},p);const f=a.computeAssessment().feas;assert.equal(f.status,'review',p.suburb);assert.equal(f.contributions.amount,null,p.suburb);assert.equal(f.profit,undefined);
 }
});
test('explicit provisional contribution allowance restores unknown-framework buyer without manufacturing verification',dom=>{
 const a=buyer(dom);a.app.property.lga='Unknown Council';Object.assign(a.app.scope,{provisional:true,provisionalContributions:55000,otherAuthorityCosts:20000});const f=a.computeAssessment().feas;
 assert.notEqual(f.status,'review',f.reason);assert.equal(f.contributions.amount,55000);assert.equal(f.decisionReady,false);assert.equal(f.otherAuthorityCosts,20000);
});
test('legacy manual buyer funding and explicit custom rates are not overwritten',dom=>{
 const a=buyer(dom);a.app.scope.acquisition={purchasePrice:3200000,deposit:320000,cashContribution:900000,loanAmount:2300000,annualRate:.081};a.app.scope.interestRate=.103;
 const x=a.acquisitionInput();assert.equal(x.fundingMode,'manual');assert.equal(x.cashContribution,900000);assert.equal(x.loanAmount,2300000);assert.equal(x.annualRate,.081);
 a.saveLocal();a.reopenProject(a.app.projectId);assert.equal(a.app.scope.interestRate,.103);assert.equal(a.acquisitionInput().loanAmount,2300000);
});
process.exitCode=failed?1:0;
