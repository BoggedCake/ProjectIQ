'use strict';
const R=require('../../response-evidence');
const G=require('../../property-evidence');
const REGISTRY={'NORTHERN BEACHES':{base:'https://maps.northernbeaches.nsw.gov.au/arcgis/rest/services/NBC_PWM_LEPs/MapServer',coverage:126,flood:[158,159,160,161],acid:[16,45,92,100],version:'official-service-2026-10-06'}};
async function councilEvidence(property,geometry,query){
 const entry=REGISTRY[String(property.lga||'').toUpperCase()],manual={state:'manual-review-required',reason:'No validated council adapter for this LGA.'};if(!entry)return{flood:{...manual},acid:{...manual}};
 // Only a validated full parcel may establish a whole-parcel mapped clear.
 try{if(!(G.geometryArea(geometry).areaSqm>0))geometry=null}catch{geometry=null}
 const geom=geometry||property.point,type=geometry?'esriGeometryPolygon':'esriGeometryPoint',params={where:'1=1',geometry:JSON.stringify(geom),geometryType:type,inSR:4283,spatialRel:'esriSpatialRelIntersects',returnGeometry:'false',outFields:'*',resultRecordCount:100};
 const valid=(j,id)=>R.requireComplete(j,R.councilOptions(id,100));let coverage=false,coverageFailed=false;
 try{coverage=valid(await query(entry.base,entry.coverage,params,3500),entry.coverage).length>0}catch{coverageFailed=true}
 async function hazard(ids){
  const settled=await Promise.allSettled(ids.map(async id=>valid(await query(entry.base,id,params,3500),id)));
  const features=settled.flatMap(x=>x.status==='fulfilled'?x.value:[]),failed=coverageFailed||settled.some(x=>x.status==='rejected');
  return{state:failed?'council-service-unavailable':features.length?'council-mapping-affected':!coverage||!geometry?'manual-review-required':'council-mapping-clear',source:entry.base,layerIds:ids,version:entry.version,checkedAt:new Date().toISOString(),spatialScope:geometry?'parcel':'address-point',features:features.map(f=>f.attributes),failed,complete:!failed,reason:failed?'One or more official council queries were unavailable, malformed or incomplete.':!coverage?'Council coverage needs confirmation.':!geometry?'Full parcel boundaries need confirmation.':'Official mapped checks completed; absence of overlap does not replace a flood certificate or survey.'};
 }
 const[flood,acid]=await Promise.all([hazard(entry.flood),hazard(entry.acid)]);return{flood,acid};
}
module.exports={REGISTRY,councilEvidence};
