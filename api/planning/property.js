'use strict';
const {planningFor}=require('../_lib/sitepivot');
module.exports=async(req,res)=>{
  // Only validated upstream responses are cached, briefly and with source
  // timestamps. Never let a CDN retain a partial/error planning snapshot.
  res.setHeader('Cache-Control','no-store');
  if(req.method==='OPTIONS')return res.status(204).end();
  if(!['GET','POST'].includes(req.method))return res.status(405).json({error:'Method not allowed'});
  try{
    const body=req.method==='POST'?req.body:req.query;
    const property=typeof body==='string'?JSON.parse(body):body;
    const x=Number(property?.point?.x),y=Number(property?.point?.y),lga=String(property?.lga||'').trim();
    if(!Number.isFinite(x)||!Number.isFinite(y)||!lga)return res.status(400).json({error:'valid point and lga are required'});
    if(x < 140 || x > 154 || y < -38.5 || y > -27)return res.status(400).json({error:'point must be within NSW bounds'});
    if(lga.length>160)return res.status(400).json({error:'lga is too long'});
    const safeProperty={...property,point:{...property.point,x,y},lga};
    if(req.headers?.accept?.includes('application/x-ndjson')){
      res.setHeader('Content-Type','application/x-ndjson; charset=utf-8');
      res.setHeader('X-Accel-Buffering','no');
      const publish=event=>{if(!res.destroyed&&!res.writableEnded)res.write(JSON.stringify(event)+'\n')};
      try{const out=await planningFor(safeProperty,{onProgress:publish});publish({phase:'complete',...out});}
      catch(e){publish({phase:'error',error:e?.message||'Planning lookup failed'});}
      return res.end();
    }
    const out=await planningFor(safeProperty);
    return res.status(200).json(out);
  }catch(e){
    if(e instanceof SyntaxError)return res.status(400).json({error:'invalid JSON body'});
    return res.status(502).json({error:e?.message||'Planning lookup failed'});
  }
};
