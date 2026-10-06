'use strict';
const {planningFor}=require('../_lib/sitepivot');
module.exports=async(req,res)=>{res.setHeader('Cache-Control','s-maxage=900, stale-while-revalidate=86400');try{const body=req.method==='POST'?req.body:req.query;const property=typeof body==='string'?JSON.parse(body):body;if(!property?.point||!property?.lga)return res.status(400).json({error:'point and lga are required'});const out=await planningFor(property);res.status(200).json(out)}catch(e){res.status(502).json({error:e.message||'Planning lookup failed'})}};
