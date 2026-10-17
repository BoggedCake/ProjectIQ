'use strict';
async function gateway(endpoint,token,payload,fetcher=fetch){const u=new URL(endpoint);if(u.protocol!=='https:'||u.username||u.password)throw Error('Provider endpoint must use HTTPS');const r=await fetcher(u.toString(),{method:'POST',redirect:'error',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(payload),signal:AbortSignal.timeout(6000)});if(!r.ok)throw Error('Provider response failed');return r.json()}
module.exports={gateway};
