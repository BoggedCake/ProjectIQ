/* Parcel/zone overlay shared by browser and server; mapped evidence is not a survey. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./property-evidence'));else root.SitePivotZoning=factory(root.PropertyEvidence);})(typeof globalThis!=='undefined'?globalThis:this,function(G){
'use strict';
const EPS=1e-9;
const rings=g=>g?.rings||(g?.type==='Polygon'?g.coordinates:g?.type==='MultiPolygon'&&Array.isArray(g.coordinates)&&g.coordinates.every(Array.isArray)?g.coordinates.flat():null);
const wkid=g=>Number(g?.spatialReference?.latestWkid||g?.spatialReference?.wkid);
function validatedArea(g){try{return G.geometryArea(g).areaSqm;}catch{return null;}}
// Topology calculations use a parcel-origin metric frame and a 1e-9 metre
// coordinate epsilon. Mapping uncertainty (2 m² or 0.5%) is a separate tolerance.
// No source rings are repaired. A bounded overlay fails closed on excessive work.
function overlay(parcel,zones,groupKeys=[]){
 const pr=rings(parcel),sr=wkid(parcel);if(!Array.isArray(pr)||!pr.length)return null;
 const normalized=zones.map(g=>wkid(g)===sr?g:G.transformGeometry?.(g,sr));
 const geometries=[parcel,...normalized],raw=geometries.map(rings);
 if(raw.some(rs=>!Array.isArray(rs)||!rs.length||rs.some(r=>!Array.isArray(r)))||raw.reduce((n,rs)=>n+rs.reduce((m,r)=>m+r.length,0),0)>5000)return null;
 if(geometries.some(g=>wkid(g)!==sr||g?.curveRings||validatedArea(g)===null))return null;
 const origin=pr[0][0];let lon=origin[0],lat=origin[1];const merc=[3857,102100,102113].includes(sr),geo=[4283,4326,7844].includes(sr);
 if(merc){lon=lon/6378137*180/Math.PI;lat=(2*Math.atan(Math.exp(lat/6378137))-Math.PI/2)*180/Math.PI;}
 const rad=lat*Math.PI/180,e2=.00669437999014,n=6378137/Math.sqrt(1-e2*Math.sin(rad)**2),m=6378137*(1-e2)/(1-e2*Math.sin(rad)**2)**1.5;
 const xy=p=>{let[x,y]=p;if(merc){x=x/6378137*180/Math.PI;y=(2*Math.atan(Math.exp(y/6378137))-Math.PI/2)*180/Math.PI;}return geo||merc?[(x-lon)*Math.PI/180*n*Math.cos(rad),(y-lat)*Math.PI/180*m]:[x-origin[0],y-origin[1]];};
 const polygons=raw.map(rs=>rs.map(r=>r.map(xy)));
 if(polygons.some(rs=>rs.some(r=>r.some(p=>!p.every(Number.isFinite)))))return null;
 // Reject non-simple ring touches/retracing affecting the parcel extent.
 // Remote source-ring touches are retained unchanged; they do not establish
 // certainty about remote topology. Shared edges of adjacent islands are allowed.
 const sitePoints=polygons[0].flat(),bounds=[Math.min(...sitePoints.map(p=>p[0])),Math.min(...sitePoints.map(p=>p[1])),Math.max(...sitePoints.map(p=>p[0])),Math.max(...sitePoints.map(p=>p[1]))],local=(a,b)=>Math.max(a[0],b[0])>=bounds[0]-EPS&&Math.min(a[0],b[0])<=bounds[2]+EPS&&Math.max(a[1],b[1])>=bounds[1]-EPS&&Math.min(a[1],b[1])<=bounds[3]+EPS;
 const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 const on=(p,a,b)=>Math.abs(cross(a,b,p))<=EPS&&p[0]>=Math.min(a[0],b[0])-EPS&&p[0]<=Math.max(a[0],b[0])+EPS&&p[1]>=Math.min(a[1],b[1])-EPS&&p[1]<=Math.max(a[1],b[1])+EPS;
 for(const rs of polygons)for(const r of rs)for(let i=0;i<r.length-1;i++){
  const a=r[i],b=r[i+1];if(Math.hypot(b[0]-a[0],b[1]-a[1])<=EPS)return null;
  for(let j=i+2;j<r.length-1;j++){if(i===0&&j===r.length-2)continue;const c=r[j],d=r[j+1];if(local(a,b)&&local(c,d)&&(on(a,c,d)||on(b,c,d)||on(c,a,b)||on(d,a,b)))return null;}
 }
 const xs=polygons[0].flat().map(v=>v[0]),lo=Math.min(...xs),hi=Math.max(...xs);
 const edges=rs=>rs.flatMap(r=>r.slice(0,-1).map((a,i)=>[a,r[i+1]])).filter(([a,b])=>Math.max(a[0],b[0])>=lo-EPS&&Math.min(a[0],b[0])<=hi+EPS);
 const sets=polygons.map(edges),all=sets.flat(),breaks=[lo,hi];if(all.length*all.length>4000000)return null;
 for(const[a,b]of all)for(const q of[a,b])if(q[0]>lo&&q[0]<hi)breaks.push(q[0]);
 // Include crossings between every feature, not merely parcel/feature pairs:
 // the endpoints of union spans change slope at feature/feature crossings too.
 for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){
  const[a,b]=all[i],[c,d]=all[j],ux=b[0]-a[0],uy=b[1]-a[1],vx=d[0]-c[0],vy=d[1]-c[1],det=ux*vy-uy*vx;if(Math.abs(det)<EPS)continue;
  const dx=c[0]-a[0],dy=c[1]-a[1],t=(dx*vy-dy*vx)/det,u=(dx*uy-dy*ux)/det;if(t>=0&&t<=1&&u>=0&&u<=1){const x=a[0]+t*ux;if(x>lo&&x<hi)breaks.push(x);}
 }
 const spans=(es,x)=>{const ys=[];for(const[a,b]of es)if((a[0]<=x&&b[0]>x)||(b[0]<=x&&a[0]>x))ys.push(a[1]+(x-a[0])*(b[1]-a[1])/(b[0]-a[0]));ys.sort((a,b)=>a-b);if(ys.length%2)return null;const out=[];for(let i=0;i<ys.length;i+=2)if(ys[i+1]>ys[i])out.push([ys[i],ys[i+1]]);return out;};
 const clip=(a,b)=>a.flatMap(u=>b.map(v=>[Math.max(u[0],v[0]),Math.min(u[1],v[1])]).filter(v=>v[1]>v[0]));
 const union=ss=>{const sorted=ss.flat().sort((a,b)=>a[0]-b[0]),out=[];for(const v of sorted){const last=out.at(-1);if(last&&v[0]<=last[1])last[1]=Math.max(last[1],v[1]);else out.push([...v]);}return out;};
 const length=ss=>ss.reduce((s,v)=>s+v[1]-v[0],0),keys=[...new Set(groupKeys.length?groupKeys:zones.map((_,i)=>String(i)))],assigned=groupKeys.length?groupKeys:zones.map((_,i)=>String(i));
 const measure=x=>{
  const site=spans(sets[0],x),zs=sets.slice(1).map(es=>spans(es,x));if(!site||zs.some(z=>!z))return null;
  const clips=zs.map(z=>clip(site,z)),groupSpans=keys.map(k=>union(clips.filter((_,i)=>assigned[i]===k))),covered=length(union(groupSpans));
  // Measure the area covered by at least two distinct code/instrument groups.
  // Same-group duplicates cannot cancel uncovered area or count as cross-zone conflict.
  const events=groupSpans.flatMap(ss=>ss.flatMap(([a,b])=>[[a,1],[b,-1]])).sort((a,b)=>a[0]-b[0]);let count=0,last=0,overlap=0;
  for(const[y,delta]of events){if(count>1)overlap+=y-last;count+=delta;last=y;}
  return[length(site),covered,overlap,...clips.map(length),...groupSpans.map(length)];
 };
 breaks.sort((a,b)=>a-b);const totals=Array(3+zones.length+keys.length).fill(0);
 for(let i=1;i<breaks.length;i++){const w=breaks[i]-breaks[i-1];if(w<=EPS)continue;const a=measure(breaks[i-1]+w*.25),b=measure(breaks[i-1]+w*.75);if(!a||!b)return null;for(let j=0;j<totals.length;j++)totals[j]+=w*(a[j]+b[j])/2;}
 if(totals.some(v=>!Number.isFinite(v)))return null;
 return{parcelAreaSqm:totals[0],coveredAreaSqm:totals[1],uncoveredAreaSqm:Math.max(0,totals[0]-totals[1]),crossZoneOverlapAreaSqm:totals[2],featureAreas:totals.slice(3,3+zones.length),groupAreas:new Map(keys.map((k,i)=>[k,totals[3+zones.length+i]]))};
}
function intersectionArea(parcel,zone){return overlay(parcel,[zone])?.coveredAreaSqm??null;}
function resolve({records=[],parcelGeometry=null,queryComplete=true,error=null,source=null,checkedAt=null}={}){
 const provenance={source,checkedAt,scope:parcelGeometry?'parcel':'address-point',method:'polygon-union-slab-v2'},base={state:'geometry-unresolved',primaryZone:null,splitZone:false,requiresReview:true,footprintRequired:false,zoneAreas:[],provenance};
 const fields=f=>{const a=f?.attributes||f||{},code=a.SYM_CODE??a.ZONE??a.ZONE_CODE??null,label=a.LAY_CLASS||a.ZONE_NAME||code;return{code,label,instrument:a.EPI_NAME||null,attributes:a,geometry:f?.geometry||null,areaSqm:null,fraction:null,classification:'unmeasured'};};if(!Array.isArray(records))return{...base,state:'service-failure',reason:'Zone feature set is malformed.'};base.zoneAreas=records.map(fields);
 if(error||!queryComplete)return{...base,state:'service-failure',reason:error||'Zone feature set is incomplete.'};
 if(!parcelGeometry)return{...base,state:'point-only',reason:'Address-point zones do not establish whole-parcel coverage.'};
 const area=validatedArea(parcelGeometry);if(!area)return{...base,reason:'Validated parcel polygon is required.'};
 if(!records.length)return{...base,state:'unmapped',reason:'No mapped parcel zone returned.'};
 if(base.zoneAreas.some(r=>typeof r.code!=='string'||!r.code.trim()||typeof r.instrument!=='string'||!r.instrument.trim()))return{...base,reason:'Zone code or controlling instrument metadata is missing or malformed; all source features retained.'};
 const groupKeys=base.zoneAreas.map(r=>JSON.stringify([r.code,r.instrument])),measured=overlay(parcelGeometry,base.zoneAreas.map(r=>r.geometry),groupKeys);
 if(!measured)return{...base,reason:'Zone intersection could not be measured from validated compatible linear geometries within the overlay work budget; all source features retained.'};
 const toleranceSqm=Math.max(2,measured.parcelAreaSqm*.005);Object.assign(base,{toleranceSqm,parcelAreaSqm:measured.parcelAreaSqm,coveredAreaSqm:measured.coveredAreaSqm,uncoveredAreaSqm:measured.uncoveredAreaSqm,crossZoneOverlapAreaSqm:measured.crossZoneOverlapAreaSqm});
 const groups=new Map();for(let i=0;i<base.zoneAreas.length;i++){
  const r=base.zoneAreas[i];r.areaSqm=measured.featureAreas[i];r.fraction=r.areaSqm/base.parcelAreaSqm;r.classification=r.areaSqm<=EPS?'adjacent':r.areaSqm<=toleranceSqm?'boundary-overlap':'significant';
  if(!r.code)return{...base,reason:'Zone code unavailable.'};const key=groupKeys[i];if(!groups.has(key)){const a=measured.groupAreas.get(key);groups.set(key,{code:r.code,label:r.label,instrument:r.instrument,areaSqm:a,fraction:a/base.parcelAreaSqm});}
 }
 const sorted=[...groups.values()].sort((a,b)=>b.areaSqm-a.areaSqm);base.primaryZone=sorted[0];base.zoneGroups=sorted;
 const significant=sorted.filter(r=>r.areaSqm>toleranceSqm),small=sorted.some(r=>r.areaSqm>EPS&&r.areaSqm<=toleranceSqm);
 base.sameZoneOverlapAreaSqm=Math.max(0,measured.featureAreas.reduce((s,a)=>s+a,0)-sorted.reduce((s,r)=>s+r.areaSqm,0));
 if(base.uncoveredAreaSqm>toleranceSqm)return{...base,reason:'Zone union leaves parcel coverage incomplete; overlapping areas do not compensate for gaps.'};
 if(base.crossZoneOverlapAreaSqm>toleranceSqm)return{...base,reason:'Significant zone or controlling-instrument overlap requires verification.'};
 // Preserve existing conservative duplicate/overlap review while measuring the
 // actual union. Source ambiguity remains reviewable even when coverage is full.
 if(base.sameZoneOverlapAreaSqm>toleranceSqm)return{...base,reason:'Duplicate or overlapping same-zone source polygons require review; union coverage retained.'};
 if(significant.length>1)return{...base,state:'split-zone',splitZone:true,footprintRequired:true,reason:'Multiple significant parcel zone areas; permitted-zone building footprint requires verification.'};
 if(significant.length!==1)return{...base,reason:'No significant parcel zone established.'};
 if(base.uncoveredAreaSqm>Math.max(1e-6,base.parcelAreaSqm*1e-10))return{...base,state:'boundary-review',reason:'Minor uncovered mapped parcel area requires boundary confirmation; union gap retained.'};
 if(small)return{...base,state:'boundary-review',reason:'Minor mapped zone intersection retained as boundary uncertainty; confirm the boundary and proposed footprint.'};
 return{...base,state:'single-zone',requiresReview:false,reason:'One measured zone covers the parcel; boundary-only adjacent features retained.'};
}
return{resolve,intersectionArea,measureOverlay:overlay};
});
