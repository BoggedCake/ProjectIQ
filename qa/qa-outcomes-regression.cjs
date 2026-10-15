'use strict';
const assert=require('node:assert/strict'),{identityOutcome}=require('./qa-outcomes.cjs');
const q='49 Mann Street Gosford NSW 2250',r={pass:false,code:'identity-unresolved',identityReview:{status:'needs-review',source:'NSW Address Point',category:'unproven-range',complete:true,checkedAt:'2026-10-15',candidates:[{number:'49-51'}]}};
assert.equal(identityOutcome(q,r).status,'needs-review');assert.equal(identityOutcome(q,{pass:true}).status,'confirmed');
for(const v of [{pass:false,error:'timeout'},{...r,code:'timeout'},{...r,identityReview:{...r.identityReview,complete:false}},{...r,identityReview:{...r.identityReview,candidates:[]}},{...r,identityReview:{...r.identityReview,category:'unmatched'}}])assert.equal(identityOutcome(q,v).accepted,false);
assert.equal(identityOutcome('49 Other Street Gosford NSW 2250',r).accepted,false);
console.log('PASS QA acceptance distinguishes evidenced review from outages, malformed data and new mismatches');
