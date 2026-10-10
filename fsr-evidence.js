(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.SitePivotFSR=factory()})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const uniq=a=>[...new Set(a.filter(v=>v!==null&&v!==undefined&&String(v).trim()!==''))];
  const attributes=r=>r&&r.attributes?r.attributes:r||{};
  function ratio(value){
    if(value===null||value===undefined||typeof value==='boolean')return null;
    const text=String(value).trim(),match=text.match(/^(\d+(?:\.\d+)?)\s*(?::\s*1)?$/);
    if(!match)return null;
    const n=Number(match[1]);return Number.isFinite(n)?n:null;
  }
  function resolve(input){
    const o=input||{},records=Array.isArray(o.records)?o.records.map(attributes):[];
    const recordInstruments=uniq(records.map(a=>a.EPI_NAME||a.LEP_Name||a.LEP_NAME));
    const instruments=recordInstruments.length?recordInstruments:uniq([].concat(o.instrument||[]));
    const clauses=uniq(records.map(a=>a.LEGIS_REF_CLAUSE||a.CLAUSE).concat(o.clause||[]));
    const values=uniq(records.map(a=>{for(const key of ['FSR','MAX_FSR','LAY_CLASS']){const n=ratio(a[key]);if(n!==null)return n}return null}));
    let state,reason=null;
    if(o.error){state='service-failure';reason='The official FSR source check did not complete.'}
    else if(o.parcelResolved!==true){state='parcel-unresolved';reason='The parcel boundary has not been resolved; an address point cannot establish a parcel-wide absence.'}
    else if(o.queryComplete!==true){state='service-failure';reason='The official FSR query was incomplete.'}
    else if(o.modified||o.stateOverride==='modified'||records.some(a=>ratio(a.FSR)===null&&ratio(a.MAX_FSR)===null&&ratio(a.LAY_CLASS)===null)||records.some(a=>a.LEGIS_REF_AREA||a.LEGIS_REF_VALUE)){
      state='modified';reason=o.modificationReason||'A mapped or site-specific provision requires review of the instrument.';
    }
    else if(values.length>1||instruments.length>1){state='multiple';reason='Multiple mapped FSR controls intersect this parcel.'}
    else if(values.length===1)state='mapped';
    else{state='unmapped';reason='No mapped FSR polygon was returned for the resolved parcel. Check the applicable instrument and other development controls.'}
    const value=['mapped','multiple','modified'].includes(state)&&values.length?values.map(v=>v+':1').join(' / '):null;
    const labels={mapped:value,unmapped:'No mapped FSR control', 'service-failure':'FSR source unavailable — Needs Review','parcel-unresolved':'FSR parcel check unresolved — Needs Review',multiple:'Multiple mapped FSR controls — Needs Review',modified:'FSR subject to provisions — Needs Review'};
    return {state,label:labels[state],value,values,records,provenance:{instrument:instruments.length===1?instruments[0]:o.instrument||null,instruments,clause:clauses.length?clauses.join(' / '):null,source:o.source||null,checkedAt:o.checkedAt||null},reason,requiresReview:state!=='mapped',queryComplete:o.queryComplete===true,parcelResolved:o.parcelResolved===true};
  }
  return {resolve,ratio};
});
