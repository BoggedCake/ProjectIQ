'use strict';
const {gateway}=require('./provider');
const Address=require('../../address-evidence');
const requirement='A licensed server-side NSW market-data feed with permitted consumer display rights: dated sold prices, stable property/listing IDs, address/location, dwelling attributes, sale provenance, completed-product comparables and current listing asking prices. Configure SITEPIVOT_MARKET_ENDPOINT and SITEPIVOT_MARKET_TOKEN; asking prices never drive sold-value ranges. Property profiles additionally require exact structured address/unit and subject parcel scope, stable provider ID, source and source date. Access, storage and consumer display rights must be confirmed before activation.';
function empty(reason){return{status:'review',reason,requirement,propertyProfile:null,currentListings:[],soldComparables:[],currentPropertyEstimateEvidence:[],completedProductComparables:[]}}
function rows(v,sold){return(Array.isArray(v)?v:[]).filter(x=>x&&typeof x.id==='string'&&typeof x.source==='string'&&Number.isFinite(x.price)&&x.price>0&&(!sold||((!Object.hasOwn(x,'evidenceKind')||x.evidenceKind==='sold')&&/^\d{4}-\d{2}-\d{2}$/.test(x.soldDate||'')&&Number.isFinite(Date.parse(x.soldDate))&&Date.parse(x.soldDate)<=Date.now()))).slice(0,100).map(x=>({id:x.id,source:x.source,label:String(x.label||x.address||x.id),price:x.price,type:typeof x.type==='string'?x.type:null,beds:Number.isFinite(x.beds)?x.beds:null,baths:Number.isFinite(x.baths)?x.baths:null,land:Number.isFinite(x.land)?x.land:null,internal:Number.isFinite(x.internal)?x.internal:null,distance:Number.isFinite(x.distance)?x.distance:null,quality:x.quality||null,days:sold?Math.max(0,(Date.now()-Date.parse(x.soldDate))/86400000):null,soldDate:x.soldDate||null,evidenceKind:sold?'sold':'listing',url:typeof x.url==='string'&&/^https:\/\//.test(x.url)?x.url:null}))}
const scalar=v=>typeof v==='string'&&v.trim()!==''||typeof v==='number'&&Number.isFinite(v);
const text=v=>typeof v==='string'&&v.trim()!=='';
const same=(a,b)=>scalar(a)&&scalar(b)&&String(a).trim().toUpperCase()===String(b).trim().toUpperCase();
const statuses=new Set(['verified','indicative','user-supplied','unavailable','needs-review']);
const fieldRules={beds:v=>Number.isInteger(v)&&v>=0,baths:v=>Number.isFinite(v)&&v>=0,parking:v=>Number.isInteger(v)&&v>=0,propertyType:text,landAreaSqm:v=>Number.isFinite(v)&&v>0,internalAreaSqm:v=>Number.isFinite(v)&&v>0,buildingAreaSqm:v=>Number.isFinite(v)&&v>0};
// Optional market-v1 propertyProfile is evidence only, never a cadastral override.
// Gateway shape: {id,source,sourceDate,address:{formattedaddress,streetnumber1,
// streetname,streettype,localityname,postcode,complexunitidentifier},
// parcel:{lot,dp,cadid?},fields:{beds:{value,status},...fieldRules keys}}.
// The supplied subject must independently identify the same lot/plan scope.
function propertyProfile(p,subject){
 if(!p||typeof p!=='object'||!scalar(p.id)||!text(p.source)||typeof p.sourceDate!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(p.sourceDate))return null;
 const stamp=Date.parse(p.sourceDate);if(!Number.isFinite(stamp)||stamp>Date.now()||new Date(stamp).toISOString().slice(0,10)!==p.sourceDate)return null;
 const a=p.address;if(!a||!['formattedaddress','streetnumber1','streetname','streettype','localityname','postcode'].every(k=>scalar(a[k])))return null;
 if(a.complexunitidentifier!==undefined&&a.complexunitidentifier!==null&&a.complexunitidentifier!==''&&!scalar(a.complexunitidentifier))return null;
 // Do not trust provider-supplied aliases or match scores as identity evidence.
 const address=Object.fromEntries(['formattedaddress','streetnumber1','streetnumbersuffix1','streetnumber2','streetnumbersuffix2','streetname','streettype','localityname','postcode','complexunitidentifier'].filter(k=>a[k]!==undefined&&a[k]!==null).map(k=>[k,a[k]]));
 if(!Address.match(subject?.address,address).matched)return null;
 const parcel=p.parcel,target=subject?.parcel||subject;
 if(!parcel||!same(parcel.lot,target?.lot)||!same(parcel.dp,target?.dp))return null;
 if((parcel.cadid!==undefined||target.cadid!==undefined)&&!same(parcel.cadid,target.cadid))return null;
 const fields={};for(const [key,valid]of Object.entries(fieldRules)){const f=p.fields?.[key],available=f&&valid(f.value)&&f.status!=='unavailable';fields[key]={value:available?f.value:null,status:available?(statuses.has(f.status)?f.status:'needs-review'):'unavailable',source:p.source,sourceDate:p.sourceDate}}
 return{status:'matched',id:p.id,source:p.source,sourceDate:p.sourceDate,address,parcel:{lot:parcel.lot,dp:parcel.dp,cadid:parcel.cadid??null},fields};
}
async function marketEvidence(property,options={}){const endpoint=Object.hasOwn(options,'endpoint')?options.endpoint:process.env.SITEPIVOT_MARKET_ENDPOINT;if(!endpoint)return empty('Production market data is not connected.');try{const j=await gateway(endpoint,options.token||process.env.SITEPIVOT_MARKET_TOKEN,{version:'market-v1',property},options.fetch);return{status:'available',requirement,propertyProfile:propertyProfile(j.propertyProfile,property),currentListings:rows(j.currentListings,false),soldComparables:rows(j.soldComparables,true),currentPropertyEstimateEvidence:rows(j.currentPropertyEstimateEvidence,true),completedProductComparables:rows(j.completedProductComparables,true),checkedAt:new Date().toISOString()}}catch{return empty('Market provider did not complete. No substitute values were used.')}}
module.exports={marketEvidence,rows,propertyProfile};
