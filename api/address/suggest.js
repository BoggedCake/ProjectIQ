'use strict';
const {suggestAddress}=require('../_lib/sitepivot');
module.exports=async(req,res)=>{res.setHeader('Cache-Control','s-maxage=60, stale-while-revalidate=300');try{const q=String(req.query?.q||'').trim();if(q.length<3)return res.status(400).json({error:'q must be at least 3 characters'});const out=await suggestAddress(q);res.status(200).json(out)}catch(e){res.status(502).json({error:e.message||'Address provider failed'})}};
