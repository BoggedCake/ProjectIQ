/* Parcel/zone overlay shared by browser and server; mapped evidence is not a survey. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./property-evidence'));else root.SitePivotZoning=factory(root.PropertyEvidence);})(typeof globalThis!=='undefined'?globalThis:this,function(G){
'use strict';
const EPS=1e-9;
const rings=g=>g?.rings||(g?.type==='Polygon'?g.coordinates:g?.type==='MultiPolygon'?g.coordinates.flat():null);
const wkid=g=>Number(g?.spatialReference?.latestWkid||g?.spatialReference?.wkid);
function intersectionArea(parcel,zone){
 const pr=rings(parcel),zr=rings(zone),sr=wkid(parcel);if(!pr?.length||!zr?.length||sr!==wkid(zone)||!sr||G.geometryArea(parcel).areaSqm===null)return null;
 if(parcel.curveRings||zone.curveRings)return null;
 const origin=pr[0][0];let lon=origin[0],lat=origin[1];const merc=[3857,102100,102113].includes(sr),geo=[4283,4326,7844].includes(sr);if(merc){lon=lon/6378137*180/Math.PI;lat=(2*Math.atan(Math.exp(lat/6378137))-Math.PI/2)*180/Math.PI;}
 const rad=lat*Math.PI/180,e2=.00669437999014,n=6378137/Math.sqrt(1-e2*Math.sin(rad)**2),m=6378137*(1-e2)/(1-e2*Math.sin(rad)**2)**1.5;
 const xy=p=>{let[x,y]=p;if(merc){x=x/6378137*180/Math.PI;y=(2*Math.atan(Math.exp(y/6378137))-Math.PI/2)*180/Math.PI;}return geo||merc?[(x-lon)*Math.PI/180*n*Math.cos(rad),(y-lat)*Math.PI/180*m]:[x-origin[0],y-origin[1]];};
 if([...pr,...zr].some(r=>!Array.isArray(r)||r.length<4||r[0][0]!==r.at(-1)[0]||r[0][1]!==r.at(-1)[1]||r.some(p=>!Array.isArray(p)||!Number.isFinite(p[0])||!Number.isFinite(p[1]))))return null;
 const p=pr.map(r=>r.map(xy)),z=zr.map(r=>r.map(xy)),xs=p.flat().map(v=>v[0]),lo=Math.min(...xs),hi=Math.max(...xs);
 const edges=rs=>rs.flatMap(r=>r.slice(0,-1).map((a,i)=>[a,r[i+1]])).filter(([a,b])=>Math.max(a[0],b[0])>=lo-EPS&&Math.min(a[0],b[0])<=hi+EPS);
 const pe=edges(p),ze=edges(z),all=[...pe,...ze],breaks=[lo,hi];
 const ys=p.flat().map(v=>v[1]),bottom=Math.min(...ys),top=Math.max(...ys);
 // Invalid crossing zone boundaries within the parcel cannot establish coverage.
 const local=ze.filter(([a,b])=>Math.max(a[1],b[1])>=bottom&&Math.min(a[1],b[1])<=top);
 for(let i=0;i<local.length;i++)for(let j=i+1;j<local.length;j++){const[a,b]=local[i],[c,d]=local[j],ux=b[0]-a[0],uy=b[1]-a[1],vx=d[0]-c[0],vy=d[1]-c[1],det=ux*vy-uy*vx;if(Math.abs(det)<EPS)continue;const dx=c[0]-a[0],dy=c[1]-a[1],t=(dx*vy-dy*vx)/det,u=(dx*uy-dy*ux)/det;if(t>EPS&&t<1-EPS&&u>EPS&&u<1-EPS)return null;}
 for(const[a,b]of all)for(const q of[a,b])if(q[0]>lo&&q[0]<hi)breaks.push(q[0]);
 // Every boundary crossing is a slope-change event. Integrate even/odd interior
 // intervals across each vertical slab, handling concavity, holes and islands.
 for(const[a,b]of pe)for(const[c,d]of ze){const ux=b[0]-a[0],uy=b[1]-a[1],vx=d[0]-c[0],vy=d[1]-c[1],det=ux*vy-uy*vx;if(Math.abs(det)<EPS)continue;const dx=c[0]-a[0],dy=c[1]-a[1],t=(dx*vy-dy*vx)/det,u=(dx*uy-dy*ux)/det;if(t>=0&&t<=1&&u>=0&&u<=1){const x=a[0]+t*ux;if(x>lo&&x<hi)breaks.push(x);}}
 const spans=(es,x)=>{const ys=[];for(const[a,b]of es)if((a[0]<=x&&b[0]>x)||(b[0]<=x&&a[0]>x))ys.push(a[1]+(x-a[0])*(b[1]-a[1])/(b[0]-a[0]));ys.sort((a,b)=>a-b);if(ys.length%2)return null;const out=[];for(let i=0;i<ys.length;i+=2)out.push([ys[i],ys[i+1]]);return out;};
 const length=x=>{const a=spans(pe,x),b=spans(ze,x);if(!a||!b)return null;let s=0;for(const u of a)for(const v of b)s+=Math.max(0,Math.min(u[1],v[1])-Math.max(u[0],v[0]));return s;};
 breaks.sort((a,b)=>a-b);let area=0;for(let i=1;i<breaks.length;i++){const w=breaks[i]-breaks[i-1];if(w<=EPS)continue;const a=length(breaks[i-1]+w*.25),b=length(breaks[i-1]+w*.75);if(a===null||b===null)return null;area+=w*(a+b)/2;}return area;
}
function resolve({records=[],parcelGeometry=null,queryComplete=true,error=null,source=null,checkedAt=null}={}){
 const provenance={source,checkedAt,scope:parcelGeometry?'parcel':'address-point',method:'polygon-even-odd-slab-v1'},base={state:'geometry-unresolved',primaryZone:null,splitZone:false,requiresReview:true,footprintRequired:false,zoneAreas:[],provenance};
 const fields=f=>{const a=f.attributes||f,code=a.SYM_CODE||a.ZONE||a.ZONE_CODE||null,label=a.LAY_CLASS||a.ZONE_NAME||code;return{code,label,instrument:a.EPI_NAME||null,attributes:a,geometry:f.geometry||null,areaSqm:null,fraction:null,classification:'unmeasured'};};base.zoneAreas=records.map(fields);
 if(error||!queryComplete)return{...base,state:'service-failure',reason:error||'Zone feature set is incomplete.'};
 if(!parcelGeometry)return{...base,state:'point-only',reason:'Address-point zones do not establish whole-parcel coverage.'};
 const area=G.geometryArea(parcelGeometry).areaSqm;if(!area)return{...base,reason:'Validated parcel polygon is required.'};
 if(!records.length)return{...base,state:'unmapped',reason:'No mapped parcel zone returned.'};
 const toleranceSqm=Math.max(2,area*.005);base.toleranceSqm=toleranceSqm;base.parcelAreaSqm=area;
 for(const r of base.zoneAreas){r.areaSqm=intersectionArea(parcelGeometry,r.geometry);if(r.areaSqm===null)return{...base,reason:'Zone intersection could not be measured; all source features retained.'};r.fraction=r.areaSqm/area;r.classification=r.areaSqm<=EPS?'adjacent':r.areaSqm<=toleranceSqm?'boundary-overlap':'significant';}
 const groups=new Map();for(const r of base.zoneAreas){if(!r.code)return{...base,reason:'Zone code unavailable.'};const key=r.code+'|'+r.instrument;if(!groups.has(key))groups.set(key,{code:r.code,label:r.label,instrument:r.instrument,areaSqm:0,fraction:0});groups.get(key).areaSqm+=r.areaSqm;groups.get(key).fraction+=r.fraction;}
 const sorted=[...groups.values()].sort((a,b)=>b.areaSqm-a.areaSqm);base.primaryZone=sorted[0];const significant=sorted.filter(r=>r.areaSqm>toleranceSqm),sum=sorted.reduce((s,r)=>s+r.areaSqm,0),small=sorted.some(r=>r.areaSqm>EPS&&r.areaSqm<=toleranceSqm);
 if(sum>area+toleranceSqm||sum<area-toleranceSqm)return{...base,reason:'Zone polygons overlap or leave parcel coverage incomplete.'};
 if(significant.length>1)return{...base,state:'split-zone',splitZone:true,footprintRequired:true,reason:'Multiple significant parcel zone areas; permitted-zone building footprint requires verification.'};
 if(significant.length!==1)return{...base,reason:'No significant parcel zone established.'};
 if(small)return{...base,state:'boundary-review',reason:'Minor mapped zone intersection retained as boundary uncertainty; confirm the boundary and proposed footprint.'};
 return{...base,state:'single-zone',requiresReview:false,reason:'One measured zone covers the parcel; boundary-only adjacent features retained.'};
}
return{resolve,intersectionArea};
});
