'use strict';
// Prepared boundary only. Live routes must explicitly integrate verified session
// authentication and an atomic, shared usage limiter before paid APIs are enabled.
function createRequestGuard({allowedOrigins=[],authenticate,consumeRateLimit,maxBodyBytes=32768}={}){
 const origins=new Set(allowedOrigins.map(value=>{const u=new URL(value);if(u.protocol!=='https:'||u.origin!==value)throw Error('Exact HTTPS origin required');return value}));
 if(!Number.isSafeInteger(maxBodyBytes)||maxBodyBytes<1)throw Error('Invalid body limit');
 return async(req,res)=>{
  res.setHeader('Cache-Control','private, no-store');res.setHeader('Vary','Origin');
  const reject=(status,error)=>{res.status(status).json({error});return null};
  const origin=req.headers?.origin;
  if(origin&&!origins.has(origin))return reject(403,'Origin not allowed');
  if(origin){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization')}
  if(req.method==='OPTIONS'){res.status(204).end();return null}
  if(req.method!=='POST')return reject(405,'Method not allowed');
  if(typeof authenticate!=='function'||typeof consumeRateLimit!=='function')return reject(503,'Protected API unavailable');
  let size;try{size=Buffer.byteLength(typeof req.body==='string'?req.body:JSON.stringify(req.body??{}),'utf8')}catch{return reject(400,'Invalid request')}
  if(size>maxBodyBytes)return reject(413,'Request too large');
  let subject;try{subject=await authenticate(req)}catch{return reject(503,'Authentication unavailable')}
  if(!subject||typeof subject.id!=='string'||!subject.id)return reject(401,'Authentication required');
  try{const allowed=await consumeRateLimit(subject.id);if(allowed!==true)return reject(429,'Usage limit reached')}catch{return reject(503,'Usage control unavailable')}
  return {id:subject.id};
 };
}
module.exports={createRequestGuard};
