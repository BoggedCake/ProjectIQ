// Synthetic lifecycle states, not NSW source availability evidence.
import assert from 'node:assert/strict';
import {waitForIdentity} from './live-readiness.mjs';
const page=status=>({evaluate:async fn=>{global.window={SitePivot:{app:{view:'landing',dataState:{identity:{status,deadlineMs:100}},property:null},requestDiagnostics:[]}};return fn()},waitForFunction:async fn=>{if(!fn())throw Error('readiness did not settle')},locator:()=>({waitFor:async()=>{}})});
await assert.rejects(waitForIdentity(page('needs-review')),/identity requires review/i);
await assert.rejects(waitForIdentity(page('unavailable')),/identity unavailable/i);
await assert.rejects(waitForIdentity(page('loading')),/lifecycle did not settle/i);
delete global.window;
console.log('PASS live readiness treats review as a settled refusal, not a stuck frontend');
