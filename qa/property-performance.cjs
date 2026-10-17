'use strict';
// Replay captured official payloads through the real server pipeline with
// controlled transport latency. These timings are NOT live service timings.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const {createRequire}=require('node:module'),{execFileSync}=require('node:child_process');
const filename=path.resolve(__dirname,'../api/_lib/sitepivot.js');
const capture=require('./fixtures/zoning-evidence/nield.json');
const road=require('./fixtures/property-evidence/nield-roads-2026-10-15.json').response;
const fsr=capture.fsr.response;
const clone=x=>JSON.parse(JSON.stringify(x));
function loadApi(fetch,{revision,source}={}){
 const root=path.resolve(__dirname,'..'),loaded=new Map();
 const historicalRequire=file=>request=>{
  const local=createRequire(file),resolved=local.resolve(request);
  if(!revision||!resolved.startsWith(root+path.sep)||resolved.includes(path.sep+'node_modules'+path.sep))return local(request);
  if(loaded.has(resolved))return loaded.get(resolved).exports;
  const module={exports:{}};loaded.set(resolved,module);
  const code=execFileSync('git',['show',revision+':'+path.relative(root,resolved)],{encoding:'utf8'});
  if(resolved.endsWith('.json'))module.exports=JSON.parse(code);
  else vm.runInThisContext('(function(exports,require,module,__filename,__dirname){'+code+'\n})',{filename:resolved})(module.exports,historicalRequire(resolved),module,resolved,path.dirname(resolved));
  return module.exports;
 };
 const box={module:{exports:{}},require:revision?historicalRequire(filename):createRequire(filename),fetch,AbortController,URLSearchParams,Buffer,setTimeout,clearTimeout,Date,Math,console};
 vm.runInNewContext(source|| (revision?execFileSync('git',['show',revision+':api/_lib/sitepivot.js'],{encoding:'utf8'}):fs.readFileSync(filename,'utf8')),box,{filename});
 return box.module.exports;
}
function transport({delay=true,overrides={}}={}){
 const calls=[],address=capture.address.response.features[0],text=address.attributes.formattedaddress;
 const fetch=async(url,options={})=>{
  const endpoint=String(url).split('?')[0],query=new URLSearchParams(options.body||String(url).split('?')[1]||'');
  const id=Number(endpoint.match(/\/(\d+)\/query$/)?.[1]);let name,payload,ms;
  if(endpoint.endsWith('/suggest')){name='autocomplete';ms=120;payload={suggestions:[{text}]};}
  else if(endpoint.endsWith('/findAddressCandidates')){name='geocode';ms=450;payload={candidates:[{address:text,location:address.geometry}]};}
  else if(endpoint.includes('NSW_Address_Point_Formatted')){name='identity';ms=250;payload=capture.address.response;}
  else if(endpoint.includes('NSW_Land_Parcel_Property_Theme')&&id===8){name='parcel';ms=300;payload=capture.parcel.response;}
  else if(endpoint.includes('NSW_Land_Parcel_Property_Theme')&&id===5){name='frontage';ms=450;payload=road;}
  else if(endpoint.includes('EPI_Primary_Planning_Layers')&&[1,2,4,5].includes(id)){
   name=({1:'fsr',2:'zone',4:'lot',5:'height'})[id];ms=400;
   payload=id===2?capture.zone.response:id===1?fsr:(id===4?capture.lot.response:capture.height.response);
  }else{name='supplementary';ms=1600;payload=endpoint.endsWith('/identify')?{results:[]}:{features:[],exceededTransferLimit:false};}
  const row={name,endpoint,query:Object.fromEntries(query),started:performance.now()};calls.push(row);
  if(delay)await new Promise(r=>setTimeout(r,ms));
  let value=overrides[name]?await overrides[name]({payload:clone(payload),row,calls}):payload;
  row.completed=performance.now();return{ok:true,status:200,json:async()=>clone(value)};
 };
 return{fetch,calls,text,address};
}
async function benchmark(options={}){
 const t=transport(),api=loadApi(t.fetch,options),runs=[];
 for(const mode of ['cold','warm']){
  const start=performance.now(),before=t.calls.length,marks={};
  const s=await api.suggestAddress(t.text);marks.autocomplete=performance.now()-start;
  const r=await api.resolveProperty({...s.suggestions[0],requestedText:t.text});marks.identity=performance.now()-start;
  const result=await api.planningFor(r.property,{onProgress:event=>{marks[event.phase]??=performance.now()-start;}});
  marks.complete=performance.now()-start;
  // Legacy server delivery exposes every planning field only at completion.
  for(const phase of ['parcel','core','frontage'])marks[phase]??=marks.complete;
  runs.push({mode,ms:Object.fromEntries(Object.entries(marks).map(([k,v])=>[k,+v.toFixed(1)])),upstreamRequests:t.calls.length-before,area:result.parcel.area,frontage:result.parcel.frontage.primary?.metres??null,zone:result.planning.zone,fsr:result.planning.fsr,height:result.planning.height,failed:result.planning.failedKeys});
 }
 return{kind:'controlled-latency replay; not live',revision:options.revision||'working-tree',latencyMs:{autocomplete:120,geocoder:450,officialAddress:250,parcel:300,coreControl:400,road:450,supplementary:1600},runs};
}
async function benchmarkBrowser({revision}={}){
 const {JSDOM,VirtualConsole}=require('jsdom'),t=transport();
 const html=revision?execFileSync('git',['show',revision+':index.html'],{encoding:'utf8'}):fs.readFileSync('index.html','utf8');
 const dom=new JSDOM(html,{url:'https://boggedcake.github.io/ProjectIQ/',runScripts:'dangerously',virtualConsole:new VirtualConsole(),beforeParse(w){
  w.scrollTo=()=>{};w.fetch=t.fetch;
  for(const name of ['address-evidence','response-evidence','property-evidence','zoning-evidence','fsr-evidence','planning-intelligence','contributions-evidence','commercial-engine','comparison-engine','conversation','voice'])w.eval(fs.readFileSync(name+'.js','utf8'));
 }});
 try{
  const w=dom.window,append=w.document.head.appendChild.bind(w.document.head);
  w.document.head.appendChild=el=>{if(el.src?.includes('callback=')){const callback=new URL(el.src).searchParams.get('callback');t.fetch(el.src).then(r=>r.json()).then(j=>w[callback]?.(j),()=>el.onerror?.());return el;}return append(el);};
  const a=w.SitePivot,runs=[];
  for(const mode of ['cold','warm']){
   const start=performance.now(),before=t.calls.length,s=await a.liveAddressSearch(t.text),autocomplete=performance.now()-start;
   const identity=await a.resolveLiveIdentity({...s[0],requestedText:t.text});
   a.selectProperty(identity.p,true);await a.completeLiveProperty(identity.p,identity.official,identity.geo,identity.seq,identity.signal);
   const timing=a.app.property.sourceMeta.timing;
   runs.push({mode,ms:{autocomplete:+autocomplete.toFixed(1),identity:+(autocomplete+timing.identityMs).toFixed(1),parcel:+(autocomplete+timing.parcelSummaryMs).toFixed(1),core:+(autocomplete+timing.coreSummaryMs).toFixed(1),frontage:+(autocomplete+timing.identityMs+timing.frontageMs).toFixed(1),complete:+(performance.now()-start).toFixed(1)},upstreamRequests:t.calls.length-before,area:a.app.property.area,frontage:a.app.property.frontage,zone:a.app.property.planning.zone,fsr:a.app.property.planning.fsr,height:a.app.property.planning.height,failed:a.app.property.planning.failedKeys});
  }
  return{kind:'controlled-latency browser replay; not live',revision:revision||'working-tree',runs};
 }finally{dom.window.close();}
}
async function benchmarkLive({address=capture.address.response.features[0].attributes.formattedaddress}={}){
 const api=require('../api/_lib/sitepivot'),rows=[],originalFetch=global.fetch;
 global.fetch=async(url,options)=>{const start=performance.now(),row={service:String(url).split('?')[0]};rows.push(row);try{const r=await originalFetch(url,options);row.status=r.status;return r}catch(e){row.error=e.cause?.code||e.message;throw e}finally{row.ms=+(performance.now()-start).toFixed(1)}};
 const runs=[];
 try{
  for(const mode of ['cold','warm']){
   const start=performance.now(),before=rows.length,ms={};let stage='autocomplete';
   try{
    const s=await api.suggestAddress(address);ms.autocomplete=performance.now()-start;stage='identity';
    if(!s.suggestions.length)throw new Error('No suggestion returned; identity not attempted');
    const r=await api.resolveProperty({...s.suggestions[0],requestedText:address});ms.identity=performance.now()-start;stage='planning';
    const result=await api.planningFor(r.property,{onProgress:e=>{ms[e.phase]??=performance.now()-start}});ms.complete=performance.now()-start;
    const status=result.parcel.area!=null&&result.planning.zone&&result.planning.fsr&&result.planning.height?'measured':'incomplete';
    runs.push({mode,status,ms:Object.fromEntries(Object.entries(ms).map(([k,v])=>[k,+v.toFixed(1)])),upstreamRequests:rows.length-before,area:result.parcel.area,frontage:result.parcel.frontage.primary?.metres??null,zone:result.planning.zone,fsr:result.planning.fsr,height:result.planning.height,failed:result.planning.failedKeys});
   }catch(e){runs.push({mode,status:'blocked-or-failed',stage,error:e.message,elapsedMs:+(performance.now()-start).toFixed(1)});break;}
  }
 }finally{global.fetch=originalFetch;}
 return{kind:'live upstream measurement',address,runs,requests:rows};
}
module.exports={loadApi,transport,benchmark,benchmarkBrowser,benchmarkLive};
if(require.main===module)(process.argv.includes('--live')?benchmarkLive:process.argv.includes('--browser')?benchmarkBrowser:benchmark)({revision:process.argv.find(x=>x.startsWith('--revision='))?.slice('--revision='.length),address:process.argv.find(x=>x.startsWith('--address='))?.slice('--address='.length)}).then(r=>{console.log(JSON.stringify(r,null,2));if(r.runs.some(x=>['blocked-or-failed','incomplete'].includes(x.status)))process.exitCode=1;}).catch(e=>{console.error(e);process.exitCode=1});
