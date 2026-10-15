'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),{createRequire}=require('node:module'),R=require('../response-evidence');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),filename=path.join(__dirname,'../api/_lib/sitepivot.js');
const primary='https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/EPI_Primary_Planning_Layers/MapServer',protection='https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/Protection/MapServer',hazard='https://mapprod3.environment.nsw.gov.au/arcgis/rest/services/Planning/Hazard/MapServer',bushfire='https://portal.spatial.nsw.gov.au/server/rest/services/Hosted/NSW_BushFire_Prone_Land/FeatureServer';
const layers=[[primary,0],[primary,3],[primary,6],...[1,7,10,11,12].map(i=>[protection,i]),[hazard,1],[hazard,2],[bushfire,0]],payload=attributes=>({features:attributes===null?[]:[{attributes}],exceededTransferLimit:false});
function browser(j){const box={SitePivotResponse:R,arcJSON:async()=>j,LIVE:{primary},LIVE_LAYER:{zone:2},attrs:f=>f.attributes,sameLga:()=>false,spatialCache:new Map()};vm.runInNewContext(html.slice(html.indexOf('async function spatialLayer('),html.indexOf('async function identifyPoint(')),box);return box;}
function server(j){const box={module:{exports:{}},require:createRequire(filename),fetch:async()=>({ok:true,json:async()=>typeof j==='function'?j():j}),AbortController,URLSearchParams,Buffer,setTimeout,clearTimeout,Date,Math};vm.runInNewContext(fs.readFileSync(filename,'utf8')+'\nmodule.exports.qa={spatial,fetchJson};',box);return box.module.exports.qa;}
test('trigger layers reject unusable semantics before filtering and successful cache admission',async()=>{
 for(const[base,id]of layers){const url=base+'/'+id+'/query';
  for(const a of [{garbage:true},{LAY_CLASS:{}},{SYM_CODE:false},{H_NAME:'  '},{H_ID:[]},{d_category:{}}]){
   assert.equal(R.validate(payload(a),R.queryOptions(url,50)).complete,false,url);
   await assert.rejects(browser(payload(a)).spatialLayer(base,id,{x:151,y:-33},'esriGeometryPoint','OTHER'),/semantic|attribute|schema/i);
   await assert.rejects(server(payload(a)).spatial(base,id,{x:151,y:-33},'esriGeometryPoint','OTHER'),/semantic|attribute|schema/i);
  }
  for(const a of [null,base===bushfire?{d_category:'Vegetation Category 1'}:{LAY_CLASS:'Mapped trigger'}]){
   assert.equal(R.validate(payload(a),R.queryOptions(url,50)).complete,true,url);
   assert.equal((await browser(payload(a)).spatialLayer(base,id,{x:151,y:-33},'esriGeometryPoint',null)).length,a===null?0:1);
   assert.equal((await server(payload(a)).spatial(base,id,{x:151,y:-33},'esriGeometryPoint',null)).length,a===null?0:1);
  }
 }
});
test('trigger semantic contract preserves consumed string/numeric labels',()=>{
 assert.equal(R.validate(payload({LAY_CLASS:'',SYM_CODE:-9999,H_ID:12}),R.queryOptions(primary+'/0/query',50)).complete,true,'skip unconsumed blank/sentinel fallbacks');
 assert.equal(R.validate(payload({LAY_CLASS:{},H_ID:12}),R.queryOptions(primary+'/0/query',50)).complete,false,'malformed first consumed label cannot be hidden by a later ID');
 for(const key of ['LAY_CLASS','SYM_CODE','H_NAME','H_ID'])for(const value of ['Mapped',12,0])assert.equal(R.validate(payload({[key]:value}),R.queryOptions(primary+'/0/query',50)).complete,true,key);
});

test('malformed positive trigger response does not poison retry cache',async()=>{
 for(const [base,id] of layers){let calls=0;const api=server(()=>{calls++;return calls===1?payload({garbage:true}):payload(null)}),url=base+'/'+id+'/query';
  await api.fetchJson(url,{params:{resultRecordCount:50}});await api.fetchJson(url,{params:{resultRecordCount:50}});assert.equal(calls,2,url);
 }
});
test('malformed zone metadata cannot enter successful cache; later valid retry recovers',async()=>{
 for(const attributes of [{SYM_CODE:{},EPI_NAME:'LEP'},{SYM_CODE:'R1',EPI_NAME:{}},{SYM_CODE:'R1'}]){
  const url=primary+'/2/query';assert.equal(R.validate(payload(attributes),R.queryOptions(url,50)).complete,false);
  let calls=0;const api=server(()=>{calls++;return calls===1?payload(attributes):payload({SYM_CODE:'R1',EPI_NAME:'LEP'})});await api.fetchJson(url,{params:{resultRecordCount:50}});await api.fetchJson(url,{params:{resultRecordCount:50}});assert.equal(calls,2);
 }
 for(const key of ['SYM_CODE','ZONE','ZONE_CODE'])assert.equal(R.validate(payload({[key]:'R1',EPI_NAME:'LEP'}),R.queryOptions(primary+'/2/query',50)).complete,true,'valid point-scope metadata need not include geometry');
 assert.equal(R.validate(payload(null),R.queryOptions(primary+'/2/query',50)).complete,true);
});
