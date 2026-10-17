'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadApi,transport}=require('./property-performance.cjs');

test('a confirmed cached fallback does not repeat the failed direct lookup',async()=>{
 const t=transport({delay:false}),requests=[];
 const api=loadApi(async(url,options)=>{
  const query=new URLSearchParams(options?.body||'');
  requests.push(String(url));
  // Reproduce the live direct timeout without a wall-clock wait. A
  // nonretryable source error is enough to expose the same cache boundary.
  if(String(url).includes('NSW_Address_Point_Formatted')&&!query.has('geometry'))return{ok:false,status:403};
  return t.fetch(url,options);
 });
 const first=await api.resolveProperty({text:t.text});
 const before=requests.length;
 const second=await api.resolveProperty({text:t.text});
 assert.equal(second.property.addressId,first.property.addressId);
 assert.equal(requests.length,before,'warm identity must reuse complete successful fallback evidence before retrying the failed direct strategy');
});

test('slow direct lookup overlaps fallback but waits for direct settlement',async()=>{
 const t=transport({delay:false});let release,settled=false;
 const pendingDirect=new Promise(r=>release=r),events=[];
 const api=loadApi(async(url,options)=>{
  const query=new URLSearchParams(options?.body||'');
  if(String(url).includes('NSW_Address_Point_Formatted')&&!query.has('geometry')){events.push('direct');await pendingDirect;return{ok:false,status:403};}
  if(String(url).includes('findAddressCandidates'))events.push('geocode');
  if(String(url).includes('NSW_Address_Point_Formatted'))events.push('spatial');
  return t.fetch(url,options);
 });
 const resolution=api.resolveProperty({text:t.text}).then(r=>{settled=true;return r});
 try{
  await new Promise(r=>setTimeout(r,450));
  assert.ok(events.includes('geocode'),'geocoder starts while slow direct lookup remains pending');
  assert.ok(events.includes('spatial'),'strict spatial official lookup overlaps slow direct lookup');
  assert.equal(settled,false,'fallback cannot hide unsettled direct evidence');
 }finally{release();}
 assert.equal((await resolution).property.addressId,t.address.attributes.ap_gurasid);
});

test('completed fallback cannot hide incomplete or ambiguous direct evidence',async()=>{
 for(const invalid of ['incomplete','ambiguous']){
  const t=transport({delay:false});let release;
  const pendingDirect=new Promise(r=>release=r),events=[];
  const api=loadApi(async(url,options)=>{
   const query=new URLSearchParams(options?.body||'');
   if(String(url).includes('NSW_Address_Point_Formatted')&&!query.has('geometry')){
    await pendingDirect;
    const row=structuredClone(t.address);
    return{ok:true,json:async()=>invalid==='incomplete'?{features:[row],exceededTransferLimit:true}:{features:[row,{...row,attributes:{...row.attributes,objectid:999,ap_gurasid:999}}],exceededTransferLimit:false}};
   }
   if(String(url).includes('NSW_Address_Point_Formatted'))events.push('fallback');
   return t.fetch(url,options);
  });
  const resolution=api.resolveProperty({text:t.text});
  // Attach immediately so a rejected resolution never becomes unhandled.
  const rejected=assert.rejects(resolution,invalid==='incomplete'?/truncated|complete/i:/ambiguous/i);
  try{await new Promise(r=>setTimeout(r,450));assert.ok(events.includes('fallback'),'test establishes a completed fallback before the direct veto');}finally{release();await rejected;}
 }
});

test('positive identity memo is isolated from caller mutation and different exact input',async()=>{
 const t=transport({delay:false}),api=loadApi(t.fetch);
 const first=await api.resolveProperty({text:t.text,magicKey:'selected-a'});
 const expected=first.property.address,checkedAt=first.property.identityEvidence.checkedAt;
 assert.ok(Number.isFinite(Date.parse(checkedAt)),'source fetch establishes a dated authoritative identity');
 first.property.address='CALLER MUTATION';first.property.identityEvidence.sourceIds.ap_gurasid=-1;
 await new Promise(r=>setTimeout(r,5));
 const repeated=await api.resolveProperty({text:t.text,magicKey:'selected-a'});
 assert.equal(repeated.property.address,expected,'memo stores an isolated identity snapshot');
 assert.equal(repeated.property.identityEvidence.sourceIds.ap_gurasid,t.address.attributes.ap_gurasid);
 assert.equal(repeated.property.identityEvidence.checkedAt,checkedAt,'memo reuse preserves source time instead of refreshing provenance');
 await assert.rejects(api.resolveProperty({text:t.text,magicKey:'selected-a',requestedText:'Unit 9/'+t.text}),/identity|address/i,'a changed distinguishing input cannot hit the prior identity memo');
});
