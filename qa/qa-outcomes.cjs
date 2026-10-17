'use strict';
// Only documented, explicitly reviewed cases accept a conservative refusal.
// Transport failures, incomplete responses, empty sources and new mismatches fail.
const expectedRangeReview=new Set(['49 Mann Street Gosford NSW 2250','2 Civic Place Katoomba NSW 2780']);
function identityOutcome(q,result){
 if(result.pass)return{status:'confirmed',accepted:true};
 const r=result.identityReview;
 if(expectedRangeReview.has(q)&&result.code==='identity-unresolved'&&r?.status==='needs-review'&&r.source==='NSW Address Point'&&r.category==='unproven-range'&&r.complete===true&&r.checkedAt&&r.candidates?.length)return{status:'needs-review',accepted:true,reason:r.reason};
 return{status:'failed',accepted:false};
}
module.exports={identityOutcome};
