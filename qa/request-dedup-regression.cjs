'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),{createRequire}=require('node:module');
const filename=path.resolve(__dirname,'../api/_lib/sitepivot.js');
let calls=0;
const box={module:{exports:{}},require:createRequire(filename),fetch:async()=>{calls++;await new Promise(r=>setTimeout(r,80));return{ok:true,json:async()=>({features:[],exceededTransferLimit:false})}},AbortController,URLSearchParams,Buffer,setTimeout,clearTimeout,Date,Math};
vm.runInNewContext(fs.readFileSync(filename,'utf8')+'\nmodule.exports.qa={fetchJson};',box);
(async()=>{
 const request=()=>box.module.exports.qa.fetchJson('https://test/query',{params:{where:'1=1',resultRecordCount:10},timeout:1000});
 const start=Date.now();const [a,b]=await Promise.all([request(),request()]);const coldMs=Date.now()-start;
 assert.equal(calls,1,'identical concurrent evidence requests share one upstream operation');assert.equal(a,b);
 const warmStart=Date.now();await request();assert.equal(calls,1);console.log(JSON.stringify({coldMs,warmMs:Date.now()-warmStart,upstreamCalls:calls}));
 const controller=new AbortController();const cancelled=box.module.exports.qa.fetchJson('https://test/query',{params:{where:'2=2'},signal:controller.signal,timeout:1000});controller.abort();await assert.rejects(cancelled,/cancelled/);
 console.log('PASS dedup and independent caller cancellation');
})().catch(e=>{console.error(e);process.exitCode=1});
