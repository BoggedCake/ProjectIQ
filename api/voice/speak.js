'use strict';
const {synthesize}=require('../_lib/tts');
module.exports=async(req,res)=>{
 res.setHeader('Cache-Control','no-store');
 const origin=req.headers?.origin,allowed=(process.env.SITEPIVOT_TTS_ALLOWED_ORIGINS||'').split(',').map(s=>s.trim()).filter(Boolean);
 res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type');
 if(origin&&allowed.length&&!allowed.includes(origin))return res.status(403).json({error:'Origin not allowed'});
 if(origin&&allowed.includes(origin)){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Access-Control-Expose-Headers','X-SitePivot-Voice, X-SitePivot-Locale')}
 if(req.method==='OPTIONS')return res.status(204).end();
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 let b;try{b=typeof req.body==='string'?JSON.parse(req.body):req.body}catch{return res.status(400).json({error:'Invalid speech request'})}
 if(typeof b?.text!=='string'||!b.text.trim()||b.text.length>1500)return res.status(400).json({error:'Invalid speech request'});
 const controller=new AbortController();req.on?.('aborted',()=>controller.abort());res.on?.('close',()=>{if(!res.writableEnded)controller.abort()});
 try{const a=await synthesize(b.text,{signal:controller.signal});res.setHeader('Content-Type',a.type);res.setHeader('X-SitePivot-Voice',a.voice);res.setHeader('X-SitePivot-Locale',a.locale);return res.status(200).send(a.buffer)}catch{return res.status(503).json({error:'Audio is not available right now'})}
};
