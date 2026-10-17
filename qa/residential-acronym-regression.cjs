'use strict';
const assert=require('node:assert/strict'),V=require('../voice');
(async()=>{
const acronyms=['LEP','LMR','FSR','DCP','CDC','DA','SEPP'];
const raw='LEP, LMR, FSR, DCP, CDC, DA and SEPP. Local Environmental Plan and complying development certificate. Height 8.5 m; FSR 0.6:1. $1,200,000.';
const expected=V.speechText(raw);
for(const acronym of acronyms)assert.equal(V.speechText(acronym),acronym.split('').join('-'));
assert.match(expected,/Local Environmental Plan and complying development certificate/);
assert.match(expected,/eight point five metres/);
assert.match(expected,/F-S-R zero point six to one/);
assert.match(expected,/one million two hundred thousand dollars/);
assert.match(raw,/LEP, LMR, FSR, DCP, CDC, DA and SEPP/,'display text remains raw');
assert.equal(V.speechText('LEPland CDA DAWN'),'LEPland CDA DAWN','only standalone acronyms are spelled');
const local=[];
const browser=V.createPlayer({chunkSize:80,synth:{cancel(){},getVoices:()=>[{name:'Karen',lang:'en-AU'}],speak:u=>local.push(u)},Utterance:class{constructor(text){this.text=text}}});
await browser.speak(raw);
while(browser.activeUtterance){const u=browser.activeUtterance;u.onstart();u.onend()}
assert.equal(local.map(u=>u.text).join(' '),expected);
browser.stop();
const requests=[],audios=[];
const server=V.createPlayer({server:true,chunkSize:80,fetch:async(_url,o)=>{requests.push(JSON.parse(o.body).text);return{ok:true,status:200,blob:async()=>new Blob(['audio'],{type:'audio/mpeg'}),headers:{get:()=>null}}},Audio:class{constructor(){audios.push(this)}play(){return Promise.resolve()}pause(){}},URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}}});
await server.speak(raw);
for(let i=0;i<audios.length;i++){audios[i].onended();await new Promise(r=>setImmediate(r))}
assert.equal(requests.join(' '),expected);
server.stop();
console.log('PASS all seven planning acronyms are spoken as letters, with identical browser/server text and unchanged display phrases');
})().catch(e=>{console.error(e);process.exitCode=1});
