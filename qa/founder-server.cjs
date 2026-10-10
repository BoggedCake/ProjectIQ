'use strict';
// Local founder testing only: no hosting, tunnel or deployment.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
const routes={
 '/api/address/suggest':'address/suggest', '/api/property/resolve':'property/resolve',
 '/api/planning/property':'planning/property', '/api/conversation/respond':'conversation/respond',
 '/api/intent/extract':'intent/extract', '/api/market/property':'market/property', '/api/voice/speak':'voice/speak'
};
function createServer(){
 let revision='sitepivot-development';try{revision=cp.execFileSync('git',['rev-parse','--short=12','HEAD'],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim()}catch{}
 return http.createServer(async(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  const host=req.headers.host||'';
  if(!/^(127\.0\.0\.1|localhost):\d+$/.test(host)){res.writeHead(403);return res.end('Local founder testing only')}
  if(req.headers.origin&&!['http://'+host].includes(req.headers.origin)){res.writeHead(403);return res.end('Origin not allowed')}
  const url=new URL(req.url,'http://'+host);
  const route=routes[url.pathname];
  if(route){
   req.query=Object.fromEntries(url.searchParams);
   res.status=code=>{res.statusCode=code;return res};
   res.json=value=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(value));return res};
   res.send=value=>{res.end(value);return res};
   try{
    let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>65536){res.status(413).json({error:'Request too large'});return}}
    if(body)req.body=JSON.parse(body);
    await require(path.join(root,'api',route+'.js'))(req,res);
   }catch{if(!res.writableEnded)res.status(500).json({error:'Local request failed'})}
   return;
  }
  const file=url.pathname==='/'?'index.html':url.pathname.slice(1);
  if(!['index.html','fsr-evidence.js','property-evidence.js','planning-intelligence.js','commercial-engine.js','comparison-engine.js','conversation.js','voice.js'].includes(file)||req.method!=='GET'){res.writeHead(404);return res.end('Not found')}
  let content=fs.readFileSync(path.join(root,file));
  if(file==='index.html')content=content.toString().replace(/<title>[^<]*<\/title>/,'<title>SitePivot — LOCAL FOUNDER TEST</title>').replace(/<body([^>]*)>/,`<body$1><aside role="note" style="padding:12px 20px;background:#fff0b8;color:#312400;font:700 15px system-ui;text-align:center">SITEPIVOT LOCAL FOUNDER TEST — ${revision}<br><small>Development version. Not the public website.</small></aside>`);
  res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript; charset=utf-8':'text/html; charset=utf-8');res.end(content);
 });
}
module.exports={createServer};
if(require.main===module){const server=createServer();server.listen(Number(process.env.SITEPIVOT_TEST_PORT||8080),'127.0.0.1',()=>console.log('Founder testing: http://127.0.0.1:'+server.address().port+'/?fixtures=1\nBound to this computer only. Ctrl+C stops the preview.'))}
