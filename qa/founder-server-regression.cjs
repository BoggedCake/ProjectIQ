'use strict';
const assert=require('node:assert/strict'),{createServer}=require('./founder-server.cjs');
const server=createServer();
server.listen(0,'127.0.0.1',async()=>{try{
 const base='http://127.0.0.1:'+server.address().port;
 let r=await fetch(base+'/?fixtures=1');assert.match(await r.text(),/SITEPIVOT LOCAL FOUNDER TEST/);
 for(const f of ['AGENTS.md','.git/config','api/_lib/provider.js'])assert.equal((await fetch(base+'/'+f)).status,404);
 assert.equal((await fetch(base+'/',{headers:{Origin:'https://example.com'}})).status,403);
 assert.equal(await new Promise((resolve,reject)=>{const req=require('node:http').get(base+'/',{headers:{Host:'example.com'}},res=>{res.resume();resolve(res.statusCode)});req.on('error',reject)}),403);
 r=await fetch(base+'/api/conversation/respond',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:'I want to add another level.',context:{}})});
 assert.equal(r.status,200);const d=await r.json();assert.equal(d.intent.intentCategory,'add-level');assert.equal(d.intent.primaryPathway,'storey');
 console.log('PASS founder server banner, file allowlist, host/origin protection and real conversation API');
 }catch(e){console.error(e);process.exitCode=1}finally{server.close()}
});
