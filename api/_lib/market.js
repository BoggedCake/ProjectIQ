'use strict';
const {gateway}=require('./provider');
const Address=require('../../address-evidence');
const requirement='A licensed server-side NSW market-data feed with permitted consumer display rights: dated sold prices, stable property/listing IDs, address/location, dwelling attributes, sale provenance, completed-product comparables and current listing asking prices. Configure SITEPIVOT_MARKET_ENDPOINT and SITEPIVOT_MARKET_TOKEN; asking prices never drive sold-value ranges. Property profiles additionally require exact structured address/unit and subject parcel scope, stable provider ID, source and source date. Access, storage and consumer display rights must be confirmed before activation.';
const validDate=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(Date.parse(v)).toISOString().slice(0,10)===v&&Date.parse(v)<=Date.now();
const freshness=date=>!validDate(date)?'unavailable':(Date.now()-Date.parse(date))/86400000>180?'stale':'current';
function empty(reason){return{status:'review',reason,requirement,propertyProfile:null,historicalTransactions:[],providerMarketEstimate:null,currentListings:[],soldComparables:[],currentPropertyEstimateEvidence:[],completedProductComparables:[],availability:{propertyProfile:'unavailable',historicalTransactions:'unavailable',providerMarketEstimate:'unavailable',currentListings:'unavailable',soldComparables:'unavailable'}}}
function rows(v,sold){
 const seen=new Set();return(Array.isArray(v)?v:[]).filter(x=>{
  if(!x||typeof x.id!=='string'||!x.id.trim()||typeof x.source!=='string'||!x.source.trim()||!Number.isFinite(x.price)||x.price<=0)return false;
  if(sold&&((Object.hasOwn(x,'evidenceKind')&&x.evidenceKind!=='sold')||!validDate(x.soldDate)))return false;
  const key=JSON.stringify([x.source.trim(),x.id.trim()]);if(seen.has(key))return false;seen.add(key);return true;
 }).slice(0,100).map(x=>({id:x.id.trim(),propertyId:typeof x.propertyId==='string'&&x.propertyId.trim()?x.propertyId.trim():null,source:x.source.trim(),sourceDate:validDate(x.sourceDate)?x.sourceDate:null,freshness:freshness(x.sourceDate),status:x.status==='verified'?'verified':'needs-review',label:String(x.label||x.address||x.id),address:typeof x.address==='string'?x.address:null,price:x.price,type:typeof x.type==='string'?x.type:null,beds:Number.isInteger(x.beds)&&x.beds>=0?x.beds:null,baths:Number.isFinite(x.baths)&&x.baths>=0?x.baths:null,parking:Number.isInteger(x.parking)&&x.parking>=0?x.parking:null,land:Number.isFinite(x.land)&&x.land>0?x.land:null,internal:Number.isFinite(x.internal)&&x.internal>0?x.internal:null,building:Number.isFinite(x.building)&&x.building>0?x.building:null,distance:Number.isFinite(x.distance)&&x.distance>=0?x.distance:null,quality:typeof x.quality==='string'?x.quality:null,days:sold?(Date.now()-Date.parse(x.soldDate))/86400000:null,soldDate:sold?x.soldDate:null,evidenceKind:sold?'sold':'listing',interestPercent:Number.isFinite(x.interestPercent)?x.interestPercent:null,transactionType:typeof x.transactionType==='string'?x.transactionType:null,eligibleForValuation:!!(sold&&x.evidenceKind==='sold'&&x.status==='verified'&&x.interestPercent===100&&x.transactionType==='arm-length'&&typeof x.propertyId==='string'&&x.propertyId.trim()&&freshness(x.sourceDate)==='current'),url:typeof x.url==='string'&&/^https:\/\//.test(x.url)?x.url:null}));
}
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
 const fields={};for(const [key,valid]of Object.entries(fieldRules)){
  const f=p.fields?.[key],date=f&&Object.hasOwn(f,'sourceDate')?f.sourceDate:p.sourceDate,source=text(f?.source)?f.source:p.source,age=freshness(date),available=f&&valid(f.value)&&f.status!=='unavailable'&&validDate(date);
  fields[key]={value:available?f.value:null,status:available?(age==='stale'?'needs-review':statuses.has(f.status)?f.status:'needs-review'):'unavailable',source,sourceDate:validDate(date)?date:null,freshness:age,confidence:['low','medium','high'].includes(f?.confidence)?f.confidence:null};
 }
 return{status:'matched',id:p.id,source:p.source,sourceDate:p.sourceDate,address,parcel:{lot:parcel.lot,dp:parcel.dp,cadid:parcel.cadid??null},fields};
}
function marketEstimate(v,profile){
 if(!profile||!v||typeof v.propertyId!=='string'||v.propertyId.trim()!==String(profile.id).trim()||v.valueType!=='improved-property-market-value'||!text(v.source)||freshness(v.sourceDate)!=='current'||!['low','medium','high'].includes(v.confidence)||![v.low,v.mid,v.high].every(n=>Number.isFinite(n)&&n>0)||v.low>v.mid||v.mid>v.high)return null;
 return{status:'indicative',valueType:v.valueType,low:v.low,mid:v.mid,high:v.high,source:v.source,sourceDate:v.sourceDate,confidence:v.confidence,assumptions:(Array.isArray(v.assumptions)?v.assumptions:[]).filter(text).slice(0,20),propertyId:profile.id,note:'Provider indicative appraisal, not a formal valuation. Not substituted for purchase price, land value or completed GRV.'};
}
async function marketEvidence(property,options={}){
 const endpoint=Object.hasOwn(options,'endpoint')?options.endpoint:process.env.SITEPIVOT_MARKET_ENDPOINT;if(!endpoint)return empty('Production market data is not connected.');
 try{
  const j=await gateway(endpoint,options.token||process.env.SITEPIVOT_MARKET_TOKEN,{version:'market-v1',property},options.fetch);if(!j||typeof j!=='object'||Array.isArray(j))return empty('Market provider returned an invalid evidence envelope.');
  const profile=propertyProfile(j.propertyProfile,property),result={status:'available',requirement,propertyProfile:profile,currentListings:rows(j.currentListings,false),soldComparables:rows(j.soldComparables,true),currentPropertyEstimateEvidence:rows(j.currentPropertyEstimateEvidence,true),completedProductComparables:rows(j.completedProductComparables,true),historicalTransactions:profile?rows(j.historicalTransactions,true).filter(x=>x.propertyId===String(profile.id)&&x.address&&Address.match(x.address,profile.address).matched):[],providerMarketEstimate:marketEstimate(j.providerMarketEstimate,profile),checkedAt:new Date().toISOString()};
  result.availability=Object.fromEntries(['propertyProfile','historicalTransactions','providerMarketEstimate','currentListings','soldComparables'].map(k=>[k,Array.isArray(result[k])?(result[k].length?'available':'unavailable'):result[k]?'available':'unavailable']));return result;
 }catch{return empty('Market provider did not complete. No substitute values were used.')}
}
module.exports={marketEvidence,rows,propertyProfile,marketEstimate};
