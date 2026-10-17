'use strict';
const R=require('../../response-evidence');
const G=require('../../property-evidence');
const Z=require('../../zoning-evidence');
const REGISTRY={'NORTHERN BEACHES':{base:'https://maps.northernbeaches.nsw.gov.au/arcgis/rest/services/NBC_PWM_LEPs/MapServer',coverage:126,flood:[158,159,160,161],acid:[16,45,92,100],heritage:[13,14,43,44,91,103],version:'official-service-2026-10-15'}};
// Field names verified against the official service metadata, 15 October 2026.
const HERITAGE_SCHEMAS={13:{Description:'string'},14:{H_ID:'string',H_NAME:'string',H_TYPE:'string'},43:{H_ID:'string',H_NAME:'string',H_TYPE:'string'},44:{H_ID:'string',H_NAME:'string',H_TYPE:'string'},91:{H_ID:'string',H_NAME:'string',H_TYPE:'string'},103:{Tag:'string'}};
function councilOptions(id){return HERITAGE_SCHEMAS[id]?{arcgisQuery:true,limit:100,idField:'OBJECTID',attributeTypes:HERITAGE_SCHEMAS[id],record:a=>Number.isSafeInteger(a.OBJECTID)&&a.OBJECTID>=0}:R.councilOptions(id,100)}
function heritageIntersection(parcel,feature){
 let area=null;try{if(parcel&&feature?.rings)area=Z.intersectionArea(parcel,{...feature,spatialReference:feature.spatialReference||parcel.spatialReference})}catch{}
 return{intersectionAreaSqm:area,relationship:area===null?'intersection-unmeasured':area<=0.01?'boundary-overlap-review':'parcel-intersection',reason:area!==null&&area<=0.01?'Boundary-scale map overlap; this does not establish that the dwelling is a heritage item.':'A mapped intersection requires item identification and parcel extent review.'};
}
async function councilEvidence(property,geometry,query){
 const entry=REGISTRY[String(property.lga||'').toUpperCase().replace(/\s+COUNCIL$/,'')],manual={state:'manual-review-required',complete:false,reason:'No validated council adapter for this LGA.'};if(!entry)return{flood:{...manual},acid:{...manual},heritage:{...manual}};
 // Only a validated full parcel may establish a whole-parcel mapped negative.
 try{if(!(G.geometryArea(geometry).areaSqm>0))geometry=null}catch{geometry=null}
 const geom=geometry||property.point,type=geometry?'esriGeometryPolygon':'esriGeometryPoint',params={where:'1=1',geometry:JSON.stringify(geom),geometryType:type,inSR:geometry?.spatialReference?.wkid||4283,spatialRel:'esriSpatialRelIntersects',returnGeometry:'false',outFields:'*',resultRecordCount:100};
 const valid=(j,id)=>R.requireComplete(j,councilOptions(id));let coverage=false,coverageFailed=false;
 // ArcGIS Within means input geometry is wholly inside the returned LGA. A
 // boundary intersection alone cannot demonstrate complete adapter coverage.
 const coverageWork=(async()=>{try{coverage=valid(await query(entry.base,entry.coverage,{...params,spatialRel:'esriSpatialRelWithin'},3500),entry.coverage).length>0}catch{coverageFailed=true}})();
 async function hazard(ids){
  const settled=await Promise.allSettled(ids.map(async id=>{const checkedAt=new Date().toISOString(),j=await query(entry.base,id,{...params,returnGeometry:HERITAGE_SCHEMAS[id]?'true':'false',outSR:params.inSR},3500);return {id,checkedAt,features:valid(j,id)}}));
  await coverageWork; // A mapped negative still requires completed whole-parcel coverage.
  const records=settled.flatMap(x=>x.status==='fulfilled'?x.value.features.map(f=>({layerId:x.value.id,attributes:f.attributes,...(HERITAGE_SCHEMAS[x.value.id]?heritageIntersection(geometry,f.geometry):{})})):[]),failed=coverageFailed||settled.some(x=>x.status==='rejected');
  const layerChecks=settled.map((x,i)=>x.status==='fulfilled'?{layerId:ids[i],status:'complete',checkedAt:x.value.checkedAt,count:x.value.features.length}:{layerId:ids[i],status:'unavailable',checkedAt:null});
  return{state:failed?'council-service-unavailable':records.length?'council-mapping-affected':!coverage||!geometry?'manual-review-required':'council-mapping-clear',source:entry.base,layerIds:ids,layerChecks,version:entry.version,checkedAt:new Date().toISOString(),effectiveFrom:null,amendmentStatus:'unknown',spatialScope:geometry?'parcel':'address-point',coverage:{layerId:entry.coverage,status:coverageFailed?'unavailable':coverage?'whole-input-covered':'unconfirmed',spatialRelationship:'within'},features:records.map(f=>f.attributes),records,failed,complete:!failed,adjoiningReview:'not-assessed',reason:failed?'One or more official council queries were unavailable, malformed or incomplete.':!coverage?'Whole-parcel council coverage needs confirmation.':!geometry?'Full parcel boundaries need confirmation.':'Official mapped checks completed for the parcel; absence of overlap does not replace a planning certificate, flood certificate, heritage assessment or survey.'};
 }
 const[flood,acid,heritage]=await Promise.all([hazard(entry.flood),hazard(entry.acid),hazard(entry.heritage)]);return{flood,acid,heritage};
}
module.exports={REGISTRY,HERITAGE_SCHEMAS,councilOptions,councilEvidence};
