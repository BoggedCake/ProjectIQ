'use strict';
const {resolveProperty}=require('../_lib/sitepivot');
module.exports=async(req,res)=>{
  res.setHeader('Cache-Control','s-maxage=300, stale-while-revalidate=3600');
  if(req.method==='OPTIONS')return res.status(204).end();
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  try{
    const text=String(req.query?.text||'').trim();
    const magicKey=req.query?.magicKey?String(req.query.magicKey):null;
    if(!text)return res.status(400).json({error:'text is required'});
    if(text.length>300)return res.status(400).json({error:'text is too long'});
    if(magicKey&&magicKey.length>800)return res.status(400).json({error:'magicKey is too long'});
    const out=await resolveProperty({text,magicKey});
    return res.status(200).json(out);
  }catch(e){
    return res.status(502).json({error:e?.message||'Property resolution failed'});
  }
};