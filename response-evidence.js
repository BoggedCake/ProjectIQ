/* Complete collection validation shared by browser and server. No transport or retries. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.SitePivotResponse=factory()})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const validId=id=>typeof id==='number'?Number.isFinite(id):typeof id==='string'&&id.trim()!=='';
// Official NBC layer metadata read 2026-10-15; exact source field names/types.
// Layer 126 uses LGA_NAME; flood uses Risk; acid layers use CLASS/ASS_CLASS/Tag.
const councilSchemas={126:{LGA_NAME:'string'},13:{Description:'string'},14:{H_ID:'string',H_NAME:'string',H_TYPE:'string'},43:{H_ID:'string',H_NAME:'string',H_TYPE:'string'},44:{H_ID:'string',H_NAME:'string',H_TYPE:'string'},91:{H_ID:'string',H_NAME:'string',H_TYPE:'string'},103:{Tag:'string'},158:{Risk:'string'},159:{Risk:'string'},160:{Risk:'string'},161:{Risk:'string'},16:{CLASS:'integer'},45:{ASS_CLASS:'string'},92:{Tag:'string'},100:{Tag:'string'}};
function councilOptions(id,limit=100){return{arcgisQuery:true,limit,nonemptyAttributes:true,idField:'OBJECTID',attributeTypes:councilSchemas[id]||{},record: a=>!!councilSchemas[id]&&Number.isSafeInteger(a.OBJECTID)&&a.OBJECTID>=0&&(Number(id)!==126||a.LGA_NAME.trim().toUpperCase().replace(/\s+COUNCIL$/,'')==='NORTHERN BEACHES')};}

const semanticScalar=v=>validId(v)&&String(v).trim()!=='-9999';
function semanticAttributes(a,keys){const value=keys.map(k=>a[k]).find(v=>v!==undefined&&v!==null&&v!==''&&String(v)!=='-9999'&&Number(v)!==-9999);return semanticScalar(value);}
function roadOptions(limit=100){return{arcgisQuery:true,limit,idField:'cadid',record:a=>Object.prototype.hasOwnProperty.call(a,'roadnamelabel')&&(a.roadnamelabel===null||typeof a.roadnamelabel==='string'),geometry:g=>Array.isArray(g?.rings)&&g.rings.length>0};}
function validate(response,options={}){
 const field=options.field||'features',fail=reason=>({complete:false,state:'unresolved',reason,records:[]});
 if(!response||typeof response!=='object'||Array.isArray(response)||response.error||!Array.isArray(response[field]))return fail('Malformed authoritative '+field+' response.');
 if(response.exceededTransferLimit===true||response.hasMore===true||response.nextPage||response.nextPageToken||response.nextRecord||response.nextStart>0)return fail('Authoritative result truncated or pagination unfinished.');
 if(response.hasMore!==undefined&&typeof response.hasMore!=='boolean')return fail('Malformed pagination metadata.');
 if(response.exceededTransferLimit!==undefined&&typeof response.exceededTransferLimit!=='boolean')return fail('Malformed transfer-limit metadata.');
 for(const k of ['resultOffset','nextStart'])if(response[k]!==undefined&&(!Number.isSafeInteger(response[k])||response[k]<0))return fail('Malformed pagination offset metadata.');
 const rows=response[field];
 if(response.resultOffset>0)return fail('Authoritative response omits earlier pagination records.');
 for(const k of ['totalCount','numberMatched','totalFeatures'])if(response[k]!==undefined&&(!Number.isSafeInteger(response[k])||response[k]!==rows.length))return fail('Authoritative pagination count does not match returned records.');
 // ArcGIS query omits exceededTransferLimit for a final page. This provider
 // contract is explicit at adapters; a cap-sized page without a flag remains unknown.
 const documentedFinal=options.arcgisQuery===true&&(!Number.isFinite(options.limit)||rows.length<options.limit);
 if(response.exceededTransferLimit!==false&&!documentedFinal&&!options.completeCollection)return fail('Authoritative response completeness is unknown.');
 const ids=new Set();
 for(const r of rows){
  if(!r||typeof r!=='object'||Array.isArray(r))return fail('Malformed authoritative record.');
  if(field==='features'||field==='results'){
   if(!r.attributes||typeof r.attributes!=='object'||Array.isArray(r.attributes))return fail('Missing authoritative feature attributes.');
   if(options.nonemptyAttributes&&!Object.keys(r.attributes).length)return fail('Empty authoritative feature attributes.');
   if(options.requiredFields?.some(k=>r.attributes[k]===undefined||r.attributes[k]===null||String(r.attributes[k]).trim()===''))return fail('Missing required authoritative attributes.');
   if(options.attributeTypes&&Object.entries(options.attributeTypes).some(([k,type])=>type==='integer'?!Number.isSafeInteger(r.attributes[k]):typeof r.attributes[k]!=='string'||!r.attributes[k].trim()))return fail('Malformed required authoritative attribute types.');
   if(options.record&&!options.record(r.attributes))return fail('Unsupported authoritative record schema.');
   if(options.geometry&&!options.geometry(r.geometry))return fail('Missing or invalid required source geometry.');
   if(options.idField){const id=r.attributes[options.idField];if(!validId(id)||ids.has(String(id).trim()))return fail('Missing or duplicate authoritative source identifier.');ids.add(String(id).trim())}
  }
 }
 return{complete:true,state:rows.length?'complete-positive':'complete-empty',reason:null,records:rows};
}
function requireComplete(response,options){const result=validate(response,options);if(!result.complete){const e=new Error((options?.label?options.label+': ':'')+result.reason);e.code='incomplete';throw e}return result.records}
function queryOptions(url,limit){
 const options={arcgisQuery:true,limit:Number(limit)};
 // Require the fields consumed by trigger text before LGA filtering and cache
 // admission; an unrelated row must never turn into an empty mapped result.
 const trigger=/\/Planning\/EPI_Primary_Planning_Layers\/MapServer\/(?:0|3|6)\/query(?:[?#]|$)/.test(url)||/\/Planning\/Protection\/MapServer\/(?:1|7|10|11|12)\/query(?:[?#]|$)/.test(url)||/\/Planning\/Hazard\/MapServer\/(?:1|2)\/query(?:[?#]|$)/.test(url);
 if(trigger)options.record=a=>semanticAttributes(a,['LAY_CLASS','SYM_CODE','H_NAME','H_ID']);
 if(/\/Planning\/EPI_Primary_Planning_Layers\/MapServer\/2\/query(?:[?#]|$)/.test(url))options.record=a=>{const code=a.SYM_CODE??a.ZONE??a.ZONE_CODE;return typeof code==='string'&&semanticScalar(code)&&typeof a.EPI_NAME==='string'&&semanticScalar(a.EPI_NAME)};
 if(/\/NSW_BushFire_Prone_Land\/FeatureServer\/0\/query(?:[?#]|$)/.test(url))options.record=a=>typeof a.d_category==='string'&&semanticScalar(a.d_category);
 if(/NBC_PWM_LEPs/.test(url)){const layer=String(url).match(/MapServer\/(\d+)\/query(?:[?#]|$)/);Object.assign(options,councilOptions(layer?.[1],Number(limit)))}
 if(/NSW_Address_Point_Formatted/.test(url)){options.requiredFields=['formattedaddress'];options.geometry=g=>Number.isFinite(g?.x)&&Number.isFinite(g?.y);options.idField='objectid'}
 if(/NSW_Land_Parcel_Property_Theme.*\/8\/query/.test(url)){options.requiredFields=['lotnumber','planlabel'];options.idField='cadid';options.geometry=g=>Array.isArray(g?.rings)&&g.rings.length>0}
 if(/NSW_Land_Parcel_Property_Theme.*\/5\/query/.test(url))Object.assign(options,roadOptions(Number(limit)))
 return options;
}
return{validate,requireComplete,queryOptions,councilOptions,roadOptions,validId};
});
