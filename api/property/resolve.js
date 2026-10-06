'use strict';
const {resolveProperty}=require('../_lib/sitepivot');
module.exports=async(req,res)=>{res.setHeader('Cache-Control','s-maxage=300, stale-while-revalidate=3600');try{const text=String(req.query?.text||'').trim(),magicKey=req.query?.magicKey?String(req.query.magicKey):null;if(!text)return res.status(400).json({error:'text is required'});const out=await resolveProperty({text,magicKey});res.status(200).json(out)}catch(e){res.status(502).json({error:e.message||'Property resolution failed'})}};
