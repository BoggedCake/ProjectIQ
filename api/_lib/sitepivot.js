'use strict';

const {councilEvidence}=require('./council');
const A=require('../../address-evidence');
const R=require('../../response-evidence');
const {frontage,parcelEvidence}=require('../../property-evidence');
const FSR=require('../../fsr-evidence');
const Z=require('../../zoning-evidence');
const UPSTREAM={
  geocoder:'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer',
  address:'https://portal.spatial.nsw.gov.au/server/rest/services/Hosted/NSW_Address_Point_Formatted/FeatureServer/0',
  lga:'https://portal.spatial.nsw.gov.au/server/rest/services/Hosted/SPAP/FeatureServer/0',
  cadastre:'https://portal.spatial.nsw.gov.au/server/rest/services/NSW_Land_Parcel_Property_Theme/FeatureServer/8',
  primary:'https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/EPI_Primary_Planning_Layers/MapServer',
  protection:'https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/Protection/MapServer',
  hazard:'https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/Hazard/MapServer',
  bushfire:'https://portal.spatial.nsw.gov.au/server/rest/services/Hosted/NSW_BushFire_Prone_Land/FeatureServer',
  controls:'https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/ePlanning/Planning_Portal_Development_Control/MapServer',
  sepp:'https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/ePlanning/Planning_Portal_SEPP/MapServer',
  local:'https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/ePlanning/Planning_Portal_Local_Provisions/MapServer'
};

const LAYER={
  heritage:0,fsr:1,zone:2,reservation:3,lot:4,height:5,application:6,
  acid:1,riparian:7,biodiversity:10,wetlands:11,sensitive:12,
  flood:1,landslide:2,
  contribution:219,dcp:220,greenfield:222,localProvision:223,apu:225,keySites:226,urbanRelease:227,sic:218
};

const cache=new Map();
const now=()=>Date.now();
const unique=a=>[...new Set((a||[]).filter(v=>v!==undefined&&v!==null&&String(v).trim()!=='').map(v=>String(v).trim()))];
const attrs=f=>f&&f.attributes?f.attributes:{};
const meaningful=v=>v!==undefined&&v!==null&&v!==''&&String(v)!=='-9999'&&Number(v)!==-9999;
const first=(o,keys)=>{for(const k of keys){if(o&&meaningful(o[k]))return o[k]}return null};
const safe=s=>String(s||'').replace(/'/g,"''");
const normaliseLga=s=>String(s||'').toUpperCase().replace(/^THE COUNCIL OF\s+/,'').replace(/^CITY OF\s+/,'').replace(/\s+CITY COUNCIL$/,'').replace(/\s+COUNCIL$/,'').replace(/\s+SHIRE$/,'').replace(/[^A-Z0-9]+/g,' ').trim();
const sameLga=(row,lga)=>{const x=normaliseLga(row?.LGA_NAME??row?.lga_name??row?.lganame??row?.COUNCIL_NAME??row?.councilnam??row?.council);const y=normaliseLga(lga);return !x||!y||x===y||x.includes(y)||y.includes(x)};

const CACHE_TTL=120000,CACHE_MAX_ENTRIES=256,CACHE_MAX_BYTES=8*1024*1024;
const sourceChecks=new WeakMap();
const retryStatuses=new Set([408,429,500,502,503,504]);
const networkCodes=new Set(['ECONNRESET','ECONNREFUSED','ETIMEDOUT','EAI_AGAIN','ENETUNREACH','UND_ERR_CONNECT_TIMEOUT','UND_ERR_HEADERS_TIMEOUT','UND_ERR_SOCKET']);
function upstreamError(message,kind,status){const e=new Error(message);e.kind=kind;if(status!==undefined)e.status=status;return e}
function retryable(e){
  if(e?.name==='AbortError'||e?.kind==='cancelled')return false;
  if(e?.kind==='timeout')return true;
  if(e?.kind==='http'||e?.kind==='arcgis')return retryStatuses.has(e.status);
  return networkCodes.has(e?.code)||networkCodes.has(e?.cause?.code)||(e?.name==='TypeError'&&/^fetch failed$/i.test(e.message));
}
function cachePut(key,value,fetchedAt,url,params={}){
  // Only complete successful responses can support a repeated evidence check.
  if(!value||typeof value!=='object'||value.exceededTransferLimit||!['features','results','suggestions','candidates'].some(k=>Array.isArray(value[k])))return;
  const endpoint=String(url).split('?')[0].split('/').pop(),field={query:'features',identify:'results',suggest:'suggestions',findAddressCandidates:'candidates'}[endpoint];
  if(field&&!Array.isArray(value[field]))return;
  if(field==='results'&&!R.validate(value,{field:'results',completeCollection:true}).complete)return;
  if(field==='features'&&!R.validate(value,R.queryOptions(url,params.resultRecordCount)).complete)return;
  // Empty address matches are not authoritative negative spatial evidence.
  if((field==='suggestions'||field==='candidates')&&!value[field].length)return;
  const bytes=Buffer.byteLength(key)+Buffer.byteLength(JSON.stringify(value));
  if(bytes>CACHE_MAX_BYTES)return;
  const time=now();for(const [k,v] of cache)if(v.exp<=time)cache.delete(k);
  cache.delete(key);let total=bytes;for(const v of cache.values())total+=v.bytes;
  while(cache.size>=CACHE_MAX_ENTRIES||total>CACHE_MAX_BYTES){const oldest=cache.keys().next().value;total-=cache.get(oldest).bytes;cache.delete(oldest)}
  cache.set(key,{exp:fetchedAt+CACHE_TTL,fetchedAt,bytes,value});
}
async function fetchJson(url,{method='GET',params={},timeout=6000,signal:callerSignal}={}){
  if(callerSignal?.aborted)throw upstreamError('Upstream request cancelled','cancelled');
  const key=method+':'+url+':'+JSON.stringify(params),hit=cache.get(key);
  if(hit&&hit.exp>now()){sourceChecks.set(hit.value,{checkedAt:new Date(hit.fetchedAt).toISOString(),cached:true});return hit.value}
  if(hit)cache.delete(key);
  const deadline=now()+Math.max(0,timeout),attempts=3;
  let lastError;
  for(let attempt=0;attempt<attempts;attempt++){
    const remaining=deadline-now();if(remaining<=0)throw upstreamError('Upstream request timed out','timeout');
    const controller=new AbortController();let timer,cancel;
    const stopped=new Promise((_,reject)=>{
      timer=setTimeout(()=>{reject(upstreamError('Upstream request timed out','timeout'));controller.abort()},remaining);
      cancel=()=>{reject(upstreamError('Upstream request cancelled','cancelled'));controller.abort()};
      callerSignal?.addEventListener('abort',cancel,{once:true});if(callerSignal?.aborted)cancel();
    });
    try{
      const request=(async()=>{
        const q=new URLSearchParams({...params,f:'json'}).toString();
        const res=method==='POST'?await fetch(url,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded;charset=UTF-8',accept:'application/json'},body:q,signal:controller.signal}):await fetch(url+(url.includes('?')?'&':'?')+q,{headers:{accept:'application/json'},signal:controller.signal});
        if(!res.ok)throw upstreamError('HTTP '+res.status,'http',res.status);
        const data=await res.json();
        if(data?.error)throw upstreamError(data.error.message||'ArcGIS error','arcgis',Number(data.error.code));
        return data;
      })();
      const data=await Promise.race([request,stopped]),fetchedAt=now();
      if(fetchedAt>=deadline)throw upstreamError('Upstream request timed out','timeout');
      if(data&&typeof data==='object')sourceChecks.set(data,{checkedAt:new Date(fetchedAt).toISOString(),cached:false});
      cachePut(key,data,fetchedAt,url,params);return data;
    }catch(e){lastError=e;if(!retryable(e)||attempt===attempts-1)throw e}
    finally{clearTimeout(timer);callerSignal?.removeEventListener('abort',cancel)}
    const delay=Math.floor(100*2**attempt*(.75+Math.random()*.5));
    if(deadline-now()<=delay)throw lastError;
    await new Promise((resolve,reject)=>{
      const t=setTimeout(()=>{callerSignal?.removeEventListener('abort',cancelWait);resolve()},delay);
      const cancelWait=()=>{clearTimeout(t);callerSignal?.removeEventListener('abort',cancelWait);reject(upstreamError('Upstream request cancelled','cancelled'))};
      callerSignal?.addEventListener('abort',cancelWait,{once:true});if(callerSignal?.aborted)cancelWait();
    });
  }
  throw lastError;
}
async function arcQuery(base,id,params={},timeout=6000){
  return fetchJson(base+'/'+id+'/query',{method:'POST',params,timeout});
}
function parsedAddress(s){return A.parse(s)}
function addressScore(a,input){return A.match(input,a).matched?100:-Infinity}
async function suggestAddress(q){
  const t=now();
  const j=await fetchJson(UPSTREAM.geocoder+'/suggest',{params:{text:q,countryCode:'AUS',category:'Address',maxSuggestions:10,returnCollections:'false'},timeout:2800});
  const suggestions=(j.suggestions||[]).filter(x=>x?.text&&/New South Wales|\bNSW\b/i.test(x.text)).slice(0,10).map(x=>({text:x.text,magicKey:x.magicKey||null}));
  return {suggestions,timingMs:now()-t,provider:'ArcGIS World Geocoder'};
}
async function geocode(item){
  const j=await fetchJson(UPSTREAM.geocoder+'/findAddressCandidates',{params:{SingleLine:item.text||'',magicKey:item.magicKey||'',countryCode:'AUS',category:'Address',maxLocations:3,outFields:'Match_addr,Addr_type,City,Region,Postal',forStorage:'false',outSR:4283},timeout:8500});
  const list=j.candidates||[];
  const hit=list.find(x=>x?.location&&/New South Wales|\bNSW\b/i.test(String(x.address||'')+' '+String(x.attributes?.Region||'')))||list[0];
  if(!hit?.location)throw new Error('Address coordinates could not be resolved');
  return hit;
}
async function authoritativeAddress(candidate,input){
  const q=parsedAddress(input),where=q.unit?"complexunitidentifier = '"+safe(q.unit)+"' AND streetnumber1 = '"+safe(q.number.split('-')[0])+"'":'1=1';
  const j=await arcQuery(UPSTREAM.address.replace('/0',''),0,{
    where,geometry:JSON.stringify(candidate.location),geometryType:'esriGeometryPoint',inSR:4283,spatialRel:'esriSpatialRelIntersects',
    distance:100,units:'esriSRUnit_Meter',
    outFields:'objectid,formattedaddress,localityname,lganame,cadastralidentifier,pl_ptlotsecpn,streetnumber1,streetnumber2,streetname,streettype,streettypedescription,postcode,complexunitidentifier,complexlevelnumber,ss_addresspointtype,ss_classsubtype,ss_principaladdresstype,ss_addressstringoid,ss_principaladdresssiteoid,ss_propid,ss_sppropid,lot_cadid,ap_gurasid,prop_gurasid',
    returnGeometry:'true',outSR:4283,resultRecordCount:100
  },6000);
  const rows=R.requireComplete(j,{arcgisQuery:true,limit:100,requiredFields:['formattedaddress'],geometry:g=>Number.isFinite(g?.x)&&Number.isFinite(g?.y)});
  const identity=A.select(input,rows);if(identity.status!=='confirmed-address')throw new Error(identity.reason);
  return {...identity.feature,identityEvidence:{status:identity.status,complete:true,sourceIds:identity.sourceIds}};
}
function titleFromIdentifier(a){
  const cid=String(a.cadastralidentifier||a.pl_ptlotsecpn||'').trim();
  const m=cid.match(/^([^/]*)\/[^/]*\/(.+)$/);
  const strata=!!a.complexunitidentifier||/STRATA|UNIT/i.test(String(a.ss_addresspointtype||'')+' '+String(a.ss_classsubtype||''));
  return {lot:m?.[1]||cid||null,dp:m?.[2]||null,title:strata?'Strata / cadastral':'Torrens / cadastral'};
}
async function resolveProperty(item){
  const t=now();
  const candidate=await geocode(item);
  const official=await authoritativeAddress(candidate,item.text||'');
  const a=attrs(official),title=titleFromIdentifier(a);
  return {
    property:{
      address:a.formattedaddress||candidate.address||item.text,
      suburb:a.localityname||candidate.attributes?.City||null,
      postcode:String(a.postcode||candidate.attributes?.Postal||''),
      lga:a.lganame||null,
      point:official.geometry||candidate.location,
      addressId:a.ap_gurasid??a.objectid??null,identityEvidence:official.identityEvidence,addressComponents:{streetnumber1:a.streetnumber1??null,streetnumber2:a.streetnumber2??null,streetname:a.streetname??null,streettype:a.streettype??null,complexunitidentifier:a.complexunitidentifier??null},
      cadastralIdentifier:a.cadastralidentifier||a.pl_ptlotsecpn||null,
      cadid:a.lot_cadid||null,
      propertyId:a.ss_propid||null,propertyGurasid:a.prop_gurasid||null,streetName:[a.streetname,a.streettype].filter(Boolean).join(' '),
      lot:title.lot,dp:title.dp,title:title.title,
      strata:title.title.startsWith('Strata'),
      unit:a.complexunitidentifier||null,
      level:a.complexlevelnumber||null
    },
    timingMs:now()-t,
    providers:['ArcGIS World Geocoder','NSW Address Point Formatted']
  };
}
async function parcelFor(property){
  const fields='cadid,lotnumber,planlabel,planlotarea,planlotareaunits,lotidstring,classsubtype';
  let fs=[];
  if(property.cadid!==null&&property.cadid!==undefined&&String(property.cadid)!==''&&Number.isFinite(+property.cadid)){
    const j=await arcQuery(UPSTREAM.cadastre.replace('/8',''),8,{where:'cadid = '+Number(property.cadid),outFields:fields,returnGeometry:'true',outSR:4283,resultRecordCount:20},5000);
    fs=R.requireComplete(j,{arcgisQuery:true,limit:20,idField:'cadid',requiredFields:['lotnumber','planlabel'],geometry:g=>Array.isArray(g?.rings)&&g.rings.length>0}).map(f=>({...f,geometry:{...f.geometry,spatialReference:f.geometry.spatialReference||j.spatialReference||{wkid:4283}}}));
  }
  if(!fs.length&&property.cadastralIdentifier){
    const cid=safe(property.cadastralIdentifier);
    let j=await arcQuery(UPSTREAM.cadastre.replace('/8',''),8,{where:"lotidstring = '"+cid+"'",outFields:fields,returnGeometry:'true',outSR:4283,resultRecordCount:20},5000);
    fs=R.requireComplete(j,{arcgisQuery:true,limit:20,idField:'cadid',requiredFields:['lotnumber','planlabel'],geometry:g=>Array.isArray(g?.rings)&&g.rings.length>0}).map(f=>({...f,geometry:{...f.geometry,spatialReference:f.geometry.spatialReference||j.spatialReference||{wkid:4283}}}));
    if(!fs.length){
      const m=String(property.cadastralIdentifier).match(/^([^/]*)\/[^/]*\/(.+)$/);
      if(m){
        j=await arcQuery(UPSTREAM.cadastre.replace('/8',''),8,{where:"lotnumber = '"+safe(m[1])+"' AND planlabel = '"+safe(m[2])+"'",outFields:fields,returnGeometry:'true',outSR:4283,resultRecordCount:20},5000);
        fs=R.requireComplete(j,{arcgisQuery:true,limit:20,idField:'cadid',requiredFields:['lotnumber','planlabel'],geometry:g=>Array.isArray(g?.rings)&&g.rings.length>0}).map(f=>({...f,geometry:{...f.geometry,spatialReference:f.geometry.spatialReference||j.spatialReference||{wkid:4283}}}));
      }
    }
  }
  if(!fs.length&&property.point){
    const j=await arcQuery(UPSTREAM.cadastre.replace('/8',''),8,{where:'1=1',geometry:property.point.x+','+property.point.y,geometryType:'esriGeometryPoint',inSR:4283,spatialRel:'esriSpatialRelIntersects',outFields:fields,returnGeometry:'true',outSR:4283,resultRecordCount:20},5000);
    fs=R.requireComplete(j,{arcgisQuery:true,limit:20,idField:'cadid',requiredFields:['lotnumber','planlabel'],geometry:g=>Array.isArray(g?.rings)&&g.rings.length>0}).map(f=>({...f,geometry:{...f.geometry,spatialReference:f.geometry.spatialReference||j.spatialReference||{wkid:4283}}}));
  }
  return parcelEvidence(fs,property,{spatialReference:{wkid:4283},supplementaryAreas:property.supplementaryAreas||[]});
}
async function spatial(base,id,geom,type,lga,fields='*',timeout=6000){
  const j=await arcQuery(base,id,{where:'1=1',geometry:JSON.stringify(geom),geometryType:type,inSR:4283,spatialRel:'esriSpatialRelIntersects',outFields:fields,returnGeometry:base===UPSTREAM.primary&&id===LAYER.zone?'true':'false',outSR:4283,resultRecordCount:50},timeout);
  R.requireComplete(j,R.queryOptions(base+'/'+id+'/query',50));
  // Primary EPI polygons already establish spatial applicability. Legacy council
  // names must not remove an intersecting LEP control following amalgamations.
  let fs=j.features.map(f=>f.geometry?{...f,geometry:{...f.geometry,spatialReference:f.geometry.spatialReference||j.spatialReference||{wkid:4283}}}:f);if(lga&&base!==UPSTREAM.primary)fs=fs.filter(f=>sameLga(attrs(f),lga));sourceChecks.set(fs,sourceChecks.get(j));return fs;
}
async function identify(base,point,timeout=6000){
  const d=.015,x=+point.x,y=+point.y;
  return fetchJson(base+'/identify',{method:'POST',params:{geometry:JSON.stringify(point),geometryType:'esriGeometryPoint',sr:4283,layers:'all',tolerance:1,mapExtent:[x-d,y-d,x+d,y+d].join(','),imageDisplay:'900,700,96',returnGeometry:'false'},timeout}).then(j=>{const results=R.requireComplete(j,{field:'results',completeCollection:true,label:'Official identify'});sourceChecks.set(results,sourceChecks.get(j));return results});
}
function rowLabels(fs,keys=['LAY_CLASS','SYM_CODE','H_NAME','H_ID']){return unique((fs||[]).map(f=>first(attrs(f),keys)))}
function formatZone(fs){return unique(fs.map(f=>{const a=attrs(f);return [first(a,['SYM_CODE','ZONE','ZONE_CODE']),first(a,['LAY_CLASS','ZONE_NAME'])].filter(Boolean).join(' · ')||null})).join(' / ')||null}
function formatHeight(fs){return unique(fs.map(f=>{const a=attrs(f),v=first(a,['MAX_B_H','MAX_HEIGHT','LAY_CLASS']),u=first(a,['UNITS']);if(v===null)return null;return /^\d+(\.\d+)?$/.test(String(v))?String(v)+' '+(u||'m'):String(v)})).join(' / ')||null}
function formatLot(fs){return unique(fs.map(f=>{const a=attrs(f),v=first(a,['LOT_SIZE','MIN_LOT_SIZE','LAY_CLASS']),u=first(a,['UNITS']);if(v===null)return null;return /^\d+(\.\d+)?$/.test(String(v))?new Intl.NumberFormat('en-AU').format(+v)+' '+(u||'m²'):String(v)})).join(' / ')||null}
function trigger(fs,empty){const x=rowLabels(fs);return x.length?x.join(' / '):empty}
function plans(fs){return unique(fs.map(f=>first(attrs(f),['PLAN_NAME','NAME','LAY_CLASS'])))}
function epiNames(groups){return unique(groups.flatMap(fs=>(fs||[]).map(f=>attrs(f).EPI_NAME).filter(Boolean)))}

async function planningFor(property){
  const t=now();let parcel,parcelError=null;
  try{parcel=await parcelFor(property)}catch(e){parcelError=e.message||String(e);parcel={lot:property.lot,dp:property.dp,area:null,parcels:null,geometry:null}}
  const geom=parcel.geometry||property.point,type=parcel.geometry?'esriGeometryPolygon':'esriGeometryPoint',lga=property.lga;
  if(!geom)throw new Error('No parcel geometry or property point available');
  const jobs={
    heritage:spatial(UPSTREAM.primary,LAYER.heritage,geom,type,lga),
    fsr:spatial(UPSTREAM.primary,LAYER.fsr,geom,type,lga),
    zone:spatial(UPSTREAM.primary,LAYER.zone,geom,type,lga),
    reservation:spatial(UPSTREAM.primary,LAYER.reservation,geom,type,lga),
    lot:spatial(UPSTREAM.primary,LAYER.lot,geom,type,lga),
    height:spatial(UPSTREAM.primary,LAYER.height,geom,type,lga),
    application:spatial(UPSTREAM.primary,LAYER.application,geom,type,lga),
    acid:spatial(UPSTREAM.protection,LAYER.acid,geom,type,lga),
    riparian:spatial(UPSTREAM.protection,LAYER.riparian,geom,type,lga),
    biodiversity:spatial(UPSTREAM.protection,LAYER.biodiversity,geom,type,lga),
    wetlands:spatial(UPSTREAM.protection,LAYER.wetlands,geom,type,lga),
    sensitive:spatial(UPSTREAM.protection,LAYER.sensitive,geom,type,lga),
    flood:spatial(UPSTREAM.hazard,LAYER.flood,geom,type,lga),
    landslide:spatial(UPSTREAM.hazard,LAYER.landslide,geom,type,lga),
    bushfire:spatial(UPSTREAM.bushfire,0,geom,type,null,'d_category,d_guidelin,startdate,lastupdate'),
    dcp:spatial(UPSTREAM.controls,LAYER.dcp,property.point,'esriGeometryPoint',lga,'LGA_NAME,COUNCIL_NAME,PLAN_NAME,PLAN_TYPE,PUBLISHED_DATE,COMMENCED_DATE,REPEALED_DATE,AMENDMENT,FILE_NAME'),
    contribution:spatial(UPSTREAM.controls,LAYER.contribution,property.point,'esriGeometryPoint',lga,'LGA_NAME,COUNCIL_NAME,PLAN_NAME,PLAN_TYPE,PUBLISHED_DATE,COMMENCED_DATE,REPEALED_DATE,AMENDMENT,FILE_NAME'),
    localProvision:spatial(UPSTREAM.controls,LAYER.localProvision,geom,type,lga),
    apu:spatial(UPSTREAM.controls,LAYER.apu,geom,type,lga),
    keySites:spatial(UPSTREAM.controls,LAYER.keySites,geom,type,lga),
    urbanRelease:spatial(UPSTREAM.controls,LAYER.urbanRelease,geom,type,lga),
    sepp:identify(UPSTREAM.sepp,property.point),
    localIdentify:identify(UPSTREAM.local,property.point)
  };
  const councilPromise=councilEvidence(property,parcel.geometry,arcQuery);
  const frontagePromise=parcel.geometry?arcQuery(UPSTREAM.cadastre.replace('/8',''),5,{where:'1=1',geometry:JSON.stringify(parcel.geometry),geometryType:'esriGeometryPolygon',inSR:4283,spatialRel:'esriSpatialRelIntersects',outFields:'*',returnGeometry:'true',outSR:4283,resultRecordCount:100},3500).then(j=>frontage(parcel.geometry,R.requireComplete(j,{arcgisQuery:true,limit:100,idField:'cadid',requiredFields:['roadnamelabel'],geometry:g=>Array.isArray(g?.rings)&&g.rings.length>0}).map(f=>({id:String(f.attributes?.roadnameoid||f.attributes?.objectid||''),name:f.attributes?.roadnamelabel||'',geometry:{...f.geometry,spatialReference:f.geometry?.spatialReference||j.spatialReference||{wkid:4283}}})),property.streetName||'')).catch(()=>({status:'review',reason:'Official road geometry unavailable.'})):Promise.resolve({status:'review',reason:'Parcel geometry unavailable.'});
  const keys=Object.keys(jobs),settled=await Promise.allSettled(Object.values(jobs)),data={},errors=parcelError?['parcel: '+parcelError]:[],failed=parcelError?['parcel']:[];
  settled.forEach((r,i)=>{const k=keys[i];if(r.status==='fulfilled')data[k]=r.value;else{data[k]=[];failed.push(k);errors.push(k+': '+(r.reason?.message||'failed'))}});
  const missing=(k,label)=>failed.includes(k)?'Source check did not complete — Needs Review':label;
  const epis=epiNames([data.zone,data.fsr,data.height,data.lot,data.heritage,data.reservation,data.application,data.acid,data.riparian,data.biodiversity,data.wetlands,data.sensitive,data.flood,data.landslide]);
  const zoningEvidence=Z.resolve({records:data.zone,parcelGeometry:parcel.geometry,queryComplete:!failed.includes('zone'),error:failed.includes('zone')?'Official zoning retrieval failed':null,source:UPSTREAM.primary+'/2',checkedAt:sourceChecks.get(data.zone)?.checkedAt||null});
  const localInstrument=failed.includes('zone')?null:['single-zone','boundary-review'].includes(zoningEvidence.state)?zoningEvidence.primaryZone?.instrument||null:epis.join(' / ')||null;
  const statePolicies=unique([
    ...epis.filter(x=>/^State Environmental Planning Policy/i.test(x)),
    ...(data.sepp||[]).map(r=>r.attributes?.EPI_NAME||r.attributes?.['EPI Name']||r.layerName).filter(Boolean)
  ]);
  const [council,frontageEvidence]=await Promise.all([councilPromise,frontagePromise]);
  const fsrEvidence=FSR.resolve({records:data.fsr,error:failed.includes('fsr')?'Official FSR retrieval failed':null,parcelResolved:!!parcel.geometry,queryComplete:!failed.includes('fsr'),instrument:localInstrument,source:UPSTREAM.primary+'/1',checkedAt:sourceChecks.get(data.fsr)?.checkedAt||null});
  return {
    parcel:{associations:(parcel.features||[]).map(f=>({cadid:f.attributes?.cadid??null,lot:f.attributes?.lotnumber??null,dp:f.attributes?.planlabel??null,cadastralIdentifier:f.attributes?.lotidstring??null})),frontage:frontageEvidence,lot:parcel.lot,dp:parcel.dp,area:parcel.area,parcels:parcel.parcels,geometryResolved:!!parcel.geometry,identityEvidence:parcel.identityEvidence||null,areaEvidence:parcel.areaEvidence||null,status:parcel.status||'review'},
    planning:{
      controls:Object.fromEntries(['zone','lot','height','fsr','heritage','application'].map(k=>[k,(data[k]||[]).map(f=>attrs(f))])),
      controlSources:{zone:UPSTREAM.primary+'/2',lot:UPSTREAM.primary+'/4',height:UPSTREAM.primary+'/5',fsr:UPSTREAM.primary+'/1',heritage:UPSTREAM.primary+'/0',application:UPSTREAM.primary+'/6'},
      councilEvidence:council,spatialScope:parcel.geometry?'parcel':'address-point',
      instrument:localInstrument,allEpiNames:epis,epiNames:epis,statePolicies,sepp:statePolicies,
      zone:failed.includes('zone')?null:['single-zone','boundary-review'].includes(zoningEvidence.state)&&zoningEvidence.primaryZone?[zoningEvidence.primaryZone.code,zoningEvidence.primaryZone.label].filter(Boolean).join(' · '):formatZone(data.zone),zoningEvidence,
      fsr:fsrEvidence.value,fsrEvidence,
      height:failed.includes('height')?null:formatHeight(data.height),
      minLot:failed.includes('lot')?null:formatLot(data.lot),
      heritage:data.heritage.length?trigger(data.heritage):missing('heritage','No mapped EPI heritage overlap returned'),
      flood:data.flood.length?trigger(data.flood):missing('flood','No mapped EPI flood overlap returned — council flood mapping still requires checking'),
      bushfire:data.bushfire.length?unique(data.bushfire.map(f=>attrs(f).d_category).filter(Boolean)).join(' / '):missing('bushfire','No NSW bush fire prone land overlap returned'),
      acid:data.acid.length?trigger(data.acid):missing('acid','No mapped acid sulfate soil overlap returned'),
      biodiversity:data.biodiversity.length?trigger(data.biodiversity):missing('biodiversity','No mapped terrestrial biodiversity overlap returned'),
      riparian:data.riparian.length?trigger(data.riparian):missing('riparian','No mapped riparian/watercourse overlap returned'),
      wetlands:data.wetlands.length?trigger(data.wetlands):missing('wetlands','No mapped wetlands overlap returned'),
      sensitive:data.sensitive.length?trigger(data.sensitive):missing('sensitive','No mapped environmentally sensitive land overlap returned'),
      landslide:data.landslide.length?trigger(data.landslide):missing('landslide','No mapped landslide-risk overlap returned'),
      reservation:data.reservation.length?trigger(data.reservation):missing('reservation','No mapped land-reservation/acquisition overlap returned'),
      application:data.application.length?trigger(data.application):missing('application','No special land-application overlay returned'),
      dcpPlans:failed.includes('dcp')?[]:plans(data.dcp),
      contributionPlans:failed.includes('contribution')?[]:plans(data.contribution),
      localProvisions:failed.includes('localProvision')?[]:rowLabels(data.localProvision),
      additionalPermittedUses:failed.includes('apu')?[]:rowLabels(data.apu),
      keySites:failed.includes('keySites')?[]:rowLabels(data.keySites),
      urbanRelease:failed.includes('urbanRelease')?[]:rowLabels(data.urbanRelease),
      localTriggers:failed.includes('localIdentify')?[]:unique((data.localIdentify||[]).map(r=>[r.layerName,r.attributes?.LAY_CLASS||r.attributes?.Class].filter(Boolean).join(' · '))),
      splitZone:zoningEvidence.splitZone,
      liveErrors:errors,failedKeys:failed,failedSources:failed,sourceChecks:Object.fromEntries(keys.map(k=>[k,failed.includes(k)?{status:'failed',checkedAt:null,cached:false}:{status:'complete',...sourceChecks.get(data[k])}])),checkedAt:new Date().toISOString()
    },
    timingMs:now()-t,
    providers:['NSW Land Parcel Property Theme','NSW Planning Portal EPI Primary Planning Layers','NSW Planning Portal Protection/Hazard','NSW Bush Fire Prone Land','NSW Planning Portal Development Control']
  };
}

module.exports={UPSTREAM,LAYER,suggestAddress,resolveProperty,planningFor};
