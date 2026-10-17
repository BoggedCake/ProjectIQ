'use strict';
const fs=require('node:fs/promises'),path=require('node:path');

// A case owns every context it opens, including pages whose navigation fails.
// Keep diagnostics best-effort, but always close contexts before the next case.
async function withBrowserCase(browser,name,run,{outputDir}={}){
 const contexts=new Set(),logs=[];let failure;
 const session={async newPage(options={}){
  const context=await browser.newContext(options);contexts.add(context);
  if(outputDir)await context.tracing.start({screenshots:true,snapshots:true,sources:true});
  const page=await context.newPage();
  page.on('pageerror',e=>logs.push({type:'pageerror',message:e.message}));
  page.on('console',m=>{if(m.type()==='error')logs.push({type:'console',message:m.text()});});
  page.on('requestfailed',r=>logs.push({type:'requestfailed',url:r.url().split('?')[0],error:r.failure()?.errorText}));
  return page;
 }};
 try{return await run(session);}catch(e){failure=e;throw e;}
 finally{
  const cleaned=await Promise.allSettled([...contexts].map(async(context,index)=>{
   try{
    if(failure&&outputDir){
     const dir=path.join(outputDir,name.replace(/[^a-z0-9]+/gi,'-').toLowerCase(),String(index));await fs.mkdir(dir,{recursive:true});
     const geometry=[];
     for(const [i,page]of context.pages().entries()){
      await page.screenshot({path:path.join(dir,`page-${i}.png`),fullPage:true}).catch(()=>{});
      geometry.push(await page.evaluate(()=>({scrollY,viewport:{width:innerWidth,height:innerHeight},view:document.querySelector('.view.active')?.id,buttons:['runAssessment','toReport'].map(id=>{const el=document.getElementById(id);if(!el)return{id,missing:true};const r=el.getBoundingClientRect();return{id,x:r.x,y:r.y,width:r.width,height:r.height};})})).catch(()=>({unavailable:true})));
     }
     await fs.writeFile(path.join(dir,'diagnostics.json'),JSON.stringify({error:failure.stack,logs,geometry},null,2));
     await context.tracing.stop({path:path.join(dir,'trace.zip')});
    }else if(outputDir)await context.tracing.stop();
   }catch(e){if(!failure)throw e;console.warn('Browser failure diagnostics unavailable: '+e.message);}
   finally{await context.close();}
  }));
  const errors=cleaned.filter(r=>r.status==='rejected').map(r=>r.reason);
  if(errors.length&&!failure)throw new AggregateError(errors,'Browser case cleanup failed');
 }
}
module.exports={withBrowserCase};
