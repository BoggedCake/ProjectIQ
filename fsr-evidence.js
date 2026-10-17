(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./zoning-evidence'));else root.SitePivotFSR=factory(root.SitePivotZoning)})(typeof globalThis!=='undefined'?globalThis:this,function(Z){
  'use strict';
  const uniq=a=>[...new Set(a.filter(v=>v!==null&&v!==undefined&&String(v).trim()!==''))];
  const attributes=r=>r&&r.attributes?r.attributes:r||{};
  function ratio(value){
    if(value===null||value===undefined||typeof value==='boolean')return null;
    const text=String(value).trim(),match=text.match(/^(\d+(?:\.\d+)?)\s*(?::\s*1)?$/);
    if(!match)return null;
    const n=Number(match[1]);return Number.isFinite(n)?n:null;
  }
  function legacyResolve(input){
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
    return {state,label:labels[state],value,values,records,provenance:{instrument:instruments.length===1?instruments[0]:o.instrument||null,instruments,clause:clauses.length?clauses.join(' / '):null,source:o.source||null,checkedAt:o.checkedAt||null},reason,requiresReview:true,spatiallyVerified:false,queryComplete:o.queryComplete===true,parcelResolved:o.parcelResolved===true};
  }
  const KINDS={fsr:{title:'FSR',keys:['FSR','MAX_FSR','LAY_CLASS'],unit:':1'},height:{title:'Height',keys:['MAX_B_H','MAX_HEIGHT','LAY_CLASS'],unit:' m'},lot:{title:'Minimum lot size',keys:['LOT_SIZE','MIN_LOT_SIZE','LAY_CLASS'],unit:' m²'}};
  function resolveControl(kind,input={}){
    const spec=KINDS[kind];if(!spec)throw new TypeError('Unknown quantitative control');
    const records=Array.isArray(input.records)?input.records:[],attrs=records.map(attributes),instruments=uniq(attrs.map(a=>a.EPI_NAME||a.LEP_Name||a.LEP_NAME)),clauses=uniq(attrs.map(a=>a.LEGIS_REF_CLAUSE||a.CLAUSE));
    const provenance={instrument:instruments.length===1?instruments[0]:input.instrument||null,instruments,clause:clauses.join(' / ')||null,source:input.source||null,checkedAt:input.checkedAt||null,method:'parcel-control-union-v1',crsTransforms:[]};
    const base={kind,state:'geometry-unresolved',value:null,label:spec.title+' — Needs Review',values:[],records:attrs,applicableRecords:[],controlAreas:[],controlGroups:[],provenance,requiresReview:true,spatiallyVerified:false,queryComplete:input.queryComplete===true,parcelResolved:input.parcelResolved===true};
    const fail=(state,reason)=>({...base,state,reason});
    if(input.error||input.queryComplete!==true)return fail('service-failure','The official '+spec.title+' source check did not complete.');
    if(input.parcelResolved!==true||!input.parcelGeometry)return fail('parcel-unresolved','One validated address-associated parcel polygon is required.');
    if(!Array.isArray(input.records))return fail('service-failure','Malformed source feature set.');
    if(!records.length)return fail('unmapped','No mapped '+spec.title+' control returned; absence is not a permission.');
    const number=a=>{for(const key of spec.keys){const v=ratio(a[key]);if(v!==null){if(kind==='fsr')return v;const unit=String(a.UNITS||'').trim().toLowerCase();if(kind==='height'&&unit&&!/^(m|metres?|meters?)$/.test(unit))return null;if(kind==='lot'&&/^(ha|hectares?)$/.test(unit))return Number((v*10000).toPrecision(12));if(kind==='lot'&&unit&&!/^(m²|m2|sqm|sq m|square metres?|square meters?)$/.test(unit))return null;return v;}}return null;};
    base.controlAreas=records.map((r,i)=>({attributes:attrs[i],geometry:r.geometry||null,numericValue:number(attrs[i]),instrument:attrs[i].EPI_NAME||attrs[i].LEP_Name||attrs[i].LEP_NAME||null,clause:attrs[i].LEGIS_REF_CLAUSE||attrs[i].CLAUSE||null,areaSqm:null,fraction:null,classification:'unmeasured'}));
    if(base.controlAreas.some(r=>r.numericValue===null||!r.instrument))return fail('geometry-unresolved','A numeric control, unit or controlling instrument is missing; source records retained.');
    const keys=base.controlAreas.map(r=>JSON.stringify([r.numericValue,r.instrument,r.clause])),measured=Z?.measureOverlay?.(input.parcelGeometry,base.controlAreas.map(r=>r.geometry),keys);
    if(!measured)return fail('geometry-unresolved','Validated compatible geometry and bounded complete overlay required; no geometry repaired.');
    const area=measured.parcelAreaSqm,numericEpsilonSqm=Math.max(.0001,area*1e-8);
    // Computational contact policy, NOT a statutory de minimis rule or source
    // accuracy claim. Capped at0.01m² and10ppm; no missing coverage is excused.
    // Callers can tighten, never enlarge, the default contact threshold.
    const toleranceSqm=Math.min(.01,area*1e-5,Number.isFinite(input.contactToleranceSqm)?Math.max(0,input.contactToleranceSqm):Infinity);
    Object.assign(base,{parcelAreaSqm:area,coveredAreaSqm:measured.coveredAreaSqm,uncoveredAreaSqm:measured.uncoveredAreaSqm,crossControlOverlapAreaSqm:measured.crossZoneOverlapAreaSqm,toleranceSqm,numericEpsilonSqm,precisionPolicy:'computational-contact-only; not survey accuracy or statutory exemption'});
    const sr=g=>Number(g?.spatialReference?.latestWkid||g?.spatialReference?.wkid),groups=new Map();
    base.controlAreas.forEach((r,i)=>{r.areaSqm=measured.featureAreas[i];r.fraction=r.areaSqm/area;r.classification=r.areaSqm<=1e-9?'adjacent':r.areaSqm<=toleranceSqm?'negligible-contact':'significant';if(sr(r.geometry)!==sr(input.parcelGeometry))provenance.crsTransforms.push({from:sr(r.geometry),to:sr(input.parcelGeometry),method:'same-datum projection conversion'});if(!groups.has(keys[i]))groups.set(keys[i],{numericValue:r.numericValue,instrument:r.instrument,clause:r.clause,areaSqm:measured.groupAreas.get(keys[i]),fraction:measured.groupAreas.get(keys[i])/area});});
    base.controlGroups=[...groups.values()].sort((a,b)=>b.areaSqm-a.areaSqm);base.values=uniq(base.controlGroups.filter(r=>r.areaSqm>1e-9).map(r=>r.numericValue));
    base.sameControlOverlapAreaSqm=Math.max(0,measured.featureAreas.reduce((s,a)=>s+a,0)-base.controlGroups.reduce((s,r)=>s+r.areaSqm,0));
    const positive=base.controlGroups.filter(r=>r.areaSqm>1e-9),significant=positive.filter(r=>r.areaSqm>toleranceSqm);
    if(input.modified||input.stateOverride==='modified'||base.controlAreas.some(r=>r.areaSqm>1e-9&&(r.attributes.LEGIS_REF_AREA||r.attributes.LEGIS_REF_VALUE)))return fail('modified','A site-specific mapped provision requires instrument review.');
    if(base.uncoveredAreaSqm>Math.max(numericEpsilonSqm,toleranceSqm))return fail('geometry-unresolved','Control union leaves uncovered parcel area; overlap does not fill gaps.');
    if(base.crossControlOverlapAreaSqm>numericEpsilonSqm)return fail('conflict','Different controls overlap within the parcel; no favourable value selected.');
    if(new Set(positive.map(r=>r.instrument)).size>1||new Set(positive.map(r=>r.clause)).size>1)return fail('conflict','Intersecting instruments or provisions differ, including minor contacts.');
    if(significant.length!==1)return fail('multiple','Measured parcel has multiple control areas; footprint and statutory treatment require review.');
    const primary=significant[0];if(input.instrument&&String(input.instrument).trim().toLowerCase()!==primary.instrument.trim().toLowerCase())return fail('conflict','Quantitative control conflicts with the known parcel zoning instrument; statutory override requires review.');
    base.mappingUncertainty=base.uncoveredAreaSqm>1e-9||positive.length>1;provenance.precisionPolicy={contactToleranceSqm:toleranceSqm,numericEpsilonSqm,maxUncoveredAreaSqm:toleranceSqm,excludesUncertainAreaFromCapacity:true,basis:'Conservative computational/mapping contact policy; not statutory boundary adjustment or source accuracy guarantee'};
    base.applicableRecords=base.controlAreas.filter(r=>r.numericValue===primary.numericValue&&r.instrument===primary.instrument&&r.clause===primary.clause&&r.areaSqm>1e-9).map(r=>r.attributes);
    return{...base,state:'mapped',value:primary.numericValue+spec.unit,label:primary.numericValue+spec.unit,numericValue:primary.numericValue,requiresReview:false,spatiallyVerified:true,capacityAreaFraction:Math.min(1,primary.fraction),reason:base.mappingUncertainty?'One supported control with microscopic mapping uncertainty retained. Uncertain area is excluded from automatic capacity; mapped boundary requires confirmation.':'One measured control covers the parcel; source geometry is indicative, not a survey.'};
  }
  function resolve(input={}){return Object.prototype.hasOwnProperty.call(input,'parcelGeometry')?resolveControl('fsr',input):legacyResolve(input);}
  return {resolve,resolveControl,ratio};
});
