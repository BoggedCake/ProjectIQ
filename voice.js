(function(root,f){if(typeof module==='object'&&module.exports)module.exports=f();else root.SitePivotVoice=f()})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const femaleNames=/Karen|Natasha|Samantha|Serena|Sonia|Libby|Moira|Tessa|Martha|Catherine|Google UK English Female/i;
function rankedVoices(voices,preferences=[]){const score=v=>{const n=v.name||'',l=(v.lang||'').toLowerCase();return (/natural|neural|premium|enhanced/i.test(n)?1000:0)+(femaleNames.test(n)||/female/i.test(n)?200:0)+(preferences.some(p=>n.toLowerCase().includes(String(p).toLowerCase()))?250:0)+(l==='en-gb'?40:l==='en-au'?30:l.startsWith('en')?10:0)};return [...(voices||[])].filter(v=>/^en(?:-|$)/i.test(v.lang||'')).sort((a,b)=>score(b)-score(a))}
function preferredVoice(voices,preferences){return rankedVoices(voices,preferences)[0]||null}
function speechText(text){return String(text||'').replace(/https?:\/\/\S+/g,'').replace(/(?:sources?|provider|confidence(?: code)?|evidence[- ]state|rate[- ]card(?: ID)?|internal ID|property ID|conversation ID|updated|checked|last verified)\s*:[^\n.!?]*(?:[.!?]|$)/gi,'').replace(/\b(?:Verified|Indicative|Needs Review|Unavailable)\b/gi,'').replace(/\b\d{4}-\d{2}-\d{2}(?:T\S+)?\b/g,'').replace(/\b\d{1,2}[\/-]\d{1,2}[\/-]\d{4}\b/g,'').replace(/\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b/gi,'').replace(/\b\d+(?:\.\d+)?%\s*confidence/gi,'').replace(/\b([\d.]+)\s*m\b/g,'$1 metres').replace(/([\d.]+):1/g,'$1 to 1').replace(/\s+/g,' ').replace(/^[\s.,;:]+/,'').replace(/(\d)\.(\d)/g,'$1~decimal~$2').match(/[^.!?]+(?:[.!?]|$)/g)?.map(s=>s.trim()).filter(s=>/[\w]/.test(s)).slice(0,3).join(' ').replace(/~decimal~/g,'.').trim()||''}
function createPlayer(o={}){
 let epoch=0,controller=null,audio=null,url=null,utterance=null,speaking=false,pending=false,needsActivation=false,playbackFailed=false,retryText='',startupTimer=null,voicesTimer=null,voicesListener=null,mediaTimer=null;
 const diagnostics={activeProvider:'unavailable',mode:null,voice:null,locale:null,outputSupport:!!(o.synth&&o.Utterance||o.server&&o.Audio),voiceCatalogueCount:0,voiceCatalogueNames:[],events:[],lastPlaybackError:null,serverRequestStatus:'idle',serverHTTP:null,audioMime:null,audioPlayResult:null,userActivated:false};
 const timer=(fn,ms)=>{const t=setTimeout(fn,ms);t?.unref?.();return t};
 function record(event,detail={}){Object.assign(diagnostics,detail);diagnostics.events.push({event,at:Date.now(),...detail});if(diagnostics.events.length>80)diagnostics.events.shift()}
 function state(s,p=false){speaking=s;pending=p;o.onState?.(s)}
 function catalogue(){let voices=[];try{voices=o.synth?.getVoices?.()||[]}catch(e){record('voice_catalogue_error',{lastPlaybackError:e.message})}diagnostics.voiceCatalogueCount=voices.length;diagnostics.voiceCatalogueNames=voices.map(v=>v.name);return rankedVoices(voices,o.voicePreferences)}
 function clearVoiceWait(){clearTimeout(voicesTimer);voicesTimer=null;if(voicesListener)o.synth?.removeEventListener?.('voiceschanged',voicesListener);voicesListener=null}
 function releaseAudio(){clearTimeout(mediaTimer);mediaTimer=null;if(audio){audio.onended=audio.onerror=audio.onplaying=null;try{audio.pause();audio.removeAttribute?.('src');audio.load?.()}catch{}audio=null}if(url){o.URL?.revokeObjectURL(url);url=null}}
 function stop(){epoch++;controller?.abort();controller=null;clearTimeout(startupTimer);startupTimer=null;clearVoiceWait();utterance=null;releaseAudio();try{o.synth?.cancel()}catch{}retryText='';needsActivation=false;playbackFailed=false;record('cancelled');state(false)}
 function failure(error){playbackFailed=true;clearTimeout(startupTimer);utterance=null;diagnostics.activeProvider='unavailable';needsActivation=!!(o.synth&&o.Utterance);record('playback_failed',{lastPlaybackError:String(error)});state(false)}
 function browser(text,id,{gesture=false}={}){
  if(id!==epoch)return;
  if(!o.synth||!o.Utterance){failure('Speech output is unavailable in this browser.');return}
  retryText=text;let voices=catalogue();let attempt=0;
  function start(){if(id!==epoch)return;clearVoiceWait();voices=catalogue();const selected=voices[attempt]||null,u=new o.Utterance(text);utterance=u;const live=()=>id===epoch&&utterance===u;let started=false;
   if(selected){u.voice=selected;u.lang=selected.lang}else u.lang='en-GB';u.rate=.94;u.pitch=1;u.volume=1;
   diagnostics.voice=selected?.name||'System default';diagnostics.locale=u.lang;record('utterance_requested',{utteranceRequested:true,utteranceStarted:false,utteranceEnded:false,utteranceError:null,startupTimeout:false});
   const retryOrFail=error=>{if(!live())return;clearTimeout(startupTimer);utterance=null;record('utterance_failure',{utteranceError:error,lastPlaybackError:error});try{o.synth.cancel()}catch{}if(!started&&attempt===0&&voices.length>1&&!/not-allowed|permission|denied/i.test(error)){attempt++;start()}else failure(error)};
   u.onstart=()=>{if(!live())return;started=true;clearTimeout(startupTimer);needsActivation=false;diagnostics.activeProvider='browser_tts';diagnostics.mode='browser';record('utterance_started',{utteranceStarted:true,lastPlaybackError:null});state(true)};
   u.onend=()=>{if(!live())return;if(!started){retryOrFail('Speech ended before playback started.');return}clearTimeout(startupTimer);utterance=null;retryText='';record('utterance_ended',{utteranceEnded:true});state(false)};
   u.onerror=e=>retryOrFail(e?.error||'Speech playback failed.');
   state(false,true);startupTimer=timer(()=>{if(!live()||started)return;record('startup_timeout',{startupTimeout:true});retryOrFail('Speech did not start. Tap to enable audio.')},o.startupMs||2500);
   try{if(o.synth.paused)o.synth.resume?.();o.synth.speak(u)}catch(e){retryOrFail(e?.message||'Speech could not start.')}
  }
  // A direct gesture must reach speak synchronously, even before the catalogue is ready.
  if(voices.length||gesture){start();return}
  state(false,true);voicesListener=()=>{if(id===epoch&&catalogue().length)start()};o.synth.addEventListener?.('voiceschanged',voicesListener);voicesTimer=timer(start,o.voicesWaitMs||700);
 }
 function unlock(){stop();record('user_activation',{userActivated:true});if(o.synth&&o.Utterance)browser('Voice replies are on.',epoch,{gesture:true});else void speak('Voice replies are on.')}
 function retry(){const text=retryText||'Voice replies are on.';stop();record('user_activation',{userActivated:true});if(o.synth&&o.Utterance)browser(text,epoch,{gesture:true});else void speak(text)}
 async function speak(raw){stop();const id=epoch,text=speechText(raw);if(!text)return;retryText=text;
  if(o.server&&o.fetch&&o.Audio&&o.URL){controller=new AbortController();const requestController=controller;let requestTimer,mediaStarted=false,rejectMediaError,fellBack=false;const fallbackOnce=error=>{if(id!==epoch||fellBack)return;fellBack=true;record('server_fallback',{serverRequestStatus:'failed',lastPlaybackError:error?.message||'Voice service unavailable.',audioPlayResult:audio?'rejected':diagnostics.audioPlayResult});releaseAudio();browser(text,id)};state(false,true);record('server_request',{serverRequestStatus:'pending',serverHTTP:null,audioPlayResult:null});
   try{
    const r=await Promise.race([o.fetch(o.endpoint||'/api/voice/speak',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text}),signal:requestController.signal}),new Promise((_,reject)=>{requestTimer=timer(()=>{requestController.abort();reject(Error('Voice request timed out.'))},o.requestMs||8000)})]);
    if(id!==epoch)return;record('server_response',{serverHTTP:r.status||null});if(!r.ok)throw Error('Voice service returned '+(r.status||'an error'));
    const b=await Promise.race([r.blob(),new Promise((_,reject)=>{clearTimeout(requestTimer);requestTimer=timer(()=>{requestController.abort();reject(Error('Audio download timed out.'))},o.requestMs||8000)})]);if(id!==epoch)return;
    const type=b.type||r.headers?.get?.('Content-Type')||'';record('audio_received',{audioMime:type});if(!/^audio\/(mpeg|mp3|wav|ogg|mp4|x-wav)(?:;|$)/i.test(type)||!b.size)throw Error('Invalid audio response.');
    clearTimeout(requestTimer);url=o.URL.createObjectURL(b);audio=new o.Audio(url);const current=audio;current.muted=false;current.volume=1;current.setAttribute?.('playsinline','');
    current.onended=()=>{if(id!==epoch||audio!==current)return;retryText='';record('audio_ended');releaseAudio();state(false)};
    const mediaError=new Promise((_,reject)=>{rejectMediaError=reject});
    current.onerror=()=>{if(id!==epoch||audio!==current)return;const error=Error('Media playback error.');record('audio_error',{lastPlaybackError:error.message});if(mediaStarted)fallbackOnce(error);else rejectMediaError(error)};
    await Promise.race([current.play(),mediaError,new Promise((_,reject)=>{mediaTimer=timer(()=>reject(Error('Audio playback did not start.')),o.startupMs||2500)})]);
    if(id!==epoch||audio!==current)return;mediaStarted=true;clearTimeout(mediaTimer);needsActivation=false;diagnostics.activeProvider='server_tts';diagnostics.mode='server';diagnostics.voice=r.headers?.get?.('X-SitePivot-Voice')||'Configured voice';record('audio_started',{serverRequestStatus:'success',audioPlayResult:'started',lastPlaybackError:null});state(true);return;
   }catch(e){fallbackOnce(e);return}
   finally{clearTimeout(requestTimer);if(id===epoch)controller=null}
  }browser(text,id)
 }
 return{stop,speak,unlock,retry,diagnostics,get speaking(){return speaking},get pending(){return pending},get needsActivation(){return needsActivation},get needsRetry(){return playbackFailed&&!!retryText},get playbackError(){return playbackFailed?diagnostics.lastPlaybackError:null},get activeUtterance(){return utterance}};
}
return{preferredVoice,speechText,createPlayer};});
