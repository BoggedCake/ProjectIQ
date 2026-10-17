'use strict';
// Live authoritative acceptance gate. No mock transport, address override or
// captured response can satisfy this check. Service outages are failures.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const api=require('../api/_lib/sitepivot');
(async()=>{
 const results=[],startedAt=new Date().toISOString();
 try{
  for(const [text,addressId,cadid]of [['61 New Street West, Balgowlah Heights NSW 2093',72720191,102197818],['59 West Street, Balgowlah NSW 2093',9909469,100107014]]){
   const start=performance.now(),identity=await api.resolveProperty({text});assert.equal(Number(identity.property.addressId),addressId);assert.equal(Number(identity.property.cadid),cadid);assert.equal(identity.property.identityEvidence.complete,true);
   const result=await api.planningFor(identity.property);assert.equal(result.parcel.identityEvidence.status,'matched');assert.deepEqual(result.planning.failedKeys,[]);
   if(cadid===102197818){const e=result.planning.fsrEvidence;assert.equal(e.value,'0.45:1');assert.equal(e.spatiallyVerified,true);assert.ok(e.controlAreas.some(r=>r.numericValue===1&&r.classification==='negligible-contact'));assert.equal(result.planning.zoningEvidence.primaryZone.code,'R2');}
   results.push({text,pass:true,addressId,cadid,elapsedMs:performance.now()-start,sourceCheckedAt:identity.property.identityEvidence.checkedAt,fsr:result.planning.fsrEvidence,zoning:result.planning.zoningEvidence});
  }
 }catch(e){results.push({pass:false,error:e.message});process.exitCode=1;}
 const output={startedAt,finishedAt:new Date().toISOString(),transport:'native production fetch; no test substitution',results},dir=path.resolve('qa-artifacts/nsw-spatial');fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'live-controls.json'),JSON.stringify(output,null,2));console.log(JSON.stringify(output,null,2));
})();
