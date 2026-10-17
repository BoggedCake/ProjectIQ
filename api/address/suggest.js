'use strict';
const {suggestAddress}=require('../_lib/sitepivot');
module.exports=async(req,res)=>{
  res.setHeader('Cache-Control','s-maxage=60, stale-while-revalidate=300');
  if(req.method==='OPTIONS')return res.status(204).end();
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  try{
    const q=String(req.query?.q||'').trim();
    if(q.length<3)return res.status(400).json({error:'q must be at least 3 characters'});
    if(q.length>180)return res.status(400).json({error:'q is too long'});
    const out=await suggestAddress(q);
    return res.status(200).json(out);
  }catch(e){
    return res.status(502).json({error:e?.message||'Address provider failed'});
  }
};