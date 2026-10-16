'use strict';
const assert=require('node:assert/strict');
const A=require('../address-evidence');
// Live NSW Address Point record checked 16 October 2026, not a geocoder alias.
const official={objectid:2509688,ap_gurasid:72720191,lot_cadid:102197818,cadastralidentifier:'15/B/DP2044',formattedaddress:'61 NEW ST WEST, BALGOWLAH HEIGHTS NSW 2093',streetnumber1:'61',streetname:'NEW',streettype:'ST',streetsuffix:'WEST',localityname:'BALGOWLAH HEIGHTS',postcode:2093};
const selected='61 New Street, Balgowlah Heights, Sydney, New South Wales, 2093, AUS';
// Removing direction preservation in selectionQuery must fail these real
// identity assertions. A suffix-free suggestion alone must still be rejected.
for(const input of ['61 new street wes','61 New Street West','61 New St W','61 New Street West Balgowlah Heights NSW 2093']){
 const query=A.selectionQuery(input,selected);
 assert.equal(A.select(query,[{attributes:official}]).status,'confirmed-address','typed direction survives selected suggestion: '+input);
 assert.equal(A.match(query,{...official,streetsuffix:'EAST',formattedaddress:'61 NEW ST EAST, BALGOWLAH HEIGHTS NSW 2093'}).matched,false,'opposite direction remains rejected');
 assert.equal(A.match(query,{...official,localityname:'AUBURN',postcode:2144,formattedaddress:'61 NEW ST WEST, AUBURN NSW 2144'}).matched,false,'unrelated locality remains rejected');
}
assert.equal(A.match(selected,official).matched,false,'no blind missing-direction alias');
assert.equal(A.match(A.selectionQuery('Unit 2/61 New Street wes',selected),official).matched,false,'unit cannot disappear');
assert.equal(A.match(A.selectionQuery('61 New Street wes','61 New Street East, Balgowlah Heights, Sydney, NSW, 2093, AUS'),official).matched,false,'opposite selected direction requires review');
assert.equal(A.selectionQuery('12 Example St West','12 Example St, West Pennant Hills, Sydney, NSW, 2125, AUS'),'12 Example St, West Pennant Hills, Sydney, NSW, 2125, AUS','partial locality is not made a street direction');
assert.equal(A.selectionQuery('12 Example St wes','12 Example St, West Pennant Hills, Sydney, NSW, 2125, AUS'),'12 Example St, West Pennant Hills, Sydney, NSW, 2125, AUS','directional locality prefix is not reinterpreted as a road suffix');
assert.equal(A.select(A.selectionQuery('61 new street wes',selected),[{attributes:official},{attributes:{...official,objectid:2,ap_gurasid:2}}]).status,'unresolved','duplicate official matches require review');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),{createRequire}=require('node:module');
const filename=path.resolve(__dirname,'../api/_lib/sitepivot.js');
const box={module:{exports:{}},require:createRequire(filename),fetch:async(url)=>({ok:true,json:async()=>String(url).includes('findAddressCandidates')?{candidates:[{address:selected,location:{x:151.25769,y:-33.8009}}]}:{features:[{attributes:official,geometry:{x:151.25768994729742,y:-33.800900284016116}}],exceededTransferLimit:false}}),AbortController,URLSearchParams,Buffer,setTimeout,clearTimeout,Date,Math};
vm.runInNewContext(fs.readFileSync(filename,'utf8'),box);
(async()=>{
 const result=await box.module.exports.resolveProperty({text:selected,requestedText:'61 new street wes',magicKey:'chosen-suggestion'});
 assert.equal(result.property.addressId,72720191,'server preserves raw partial intent before official validation');
 assert.equal(result.property.cadid,102197818);
 assert.equal(result.property.cadastralIdentifier,'15/B/DP2044');
 await assert.rejects(box.module.exports.resolveProperty({text:selected}),/identity/,'suffix-free text alone cannot establish identity');
 console.log('PASS partial/full direction intent, official identity, ambiguity and contradiction safeguards');
})().catch(e=>{console.error(e);process.exitCode=1});
