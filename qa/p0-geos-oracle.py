import sys,json,subprocess,random
from pathlib import Path
# Optional independent oracle: python3 -m pip install shapely==2.2.0
# No Python dependency is added to the application runtime.
import shapely
from shapely.geometry import Polygon,MultiPoint,box
from shapely.ops import unary_union
rng=random.Random(14026);inputs=[];expected=[]
sr={'wkid':28356}
def geom(p):return {'rings':[list(p.exterior.coords)]+[list(r.coords) for r in p.interiors],'spatialReference':sr}
for i in range(120):
 p=box(0,0,10,10) if i%3 else Polygon([(0,0),(10,0),(10,10),(0,10)],holes=[[(3,3),(7,3),(7,7),(3,7)]])
 zs=[MultiPoint([(rng.uniform(-4,14),rng.uniform(-4,14)) for _ in range(5)]).convex_hull for j in range(4)]
 if i%4==0:zs[1]=zs[0]
 clips=[p.intersection(z) for z in zs];groups=[unary_union(clips[::2]),unary_union(clips[1::2])];u=unary_union(clips)
 inputs.append({'parcelGeometry':geom(p),'records':[{'attributes':{'SYM_CODE':'R'+str(j%2+1),'EPI_NAME':'Synthetic LEP'},'geometry':geom(z)} for j,z in enumerate(zs)]})
 expected.append([p.area,u.area,p.difference(u).area,groups[0].intersection(groups[1]).area])
js="const Z=require('./zoning-evidence');let s='';process.stdin.on('data',x=>s+=x);process.stdin.on('end',()=>console.log(JSON.stringify(JSON.parse(s).map(x=>{let r=Z.resolve(x);return [r.parcelAreaSqm,r.coveredAreaSqm,r.uncoveredAreaSqm,r.crossZoneOverlapAreaSqm]}))));"
actual=json.loads(subprocess.check_output(['node','-e',js],input=json.dumps(inputs).encode(),cwd=Path(__file__).resolve().parent.parent))
errors=[]
for i,(a,e) in enumerate(zip(actual,expected)):
 if any(v is None for v in a):raise AssertionError(('unresolved',i,a,e))
 err=max(abs(x-y) for x,y in zip(a,e));errors.append(err)
 if err>1e-6:raise AssertionError((i,a,e,err))
result={'scope':'Deterministic synthetic planar comparison; 120 convex polygon sets with cross-feature boundary events, duplicates, parcel holes and two zone groups. Not live NSW survey validation.','GEOS':shapely.geos_version_string,'shapely':shapely.__version__,'cases':len(inputs),'max_absolute_error_sqm':max(errors),'area_tolerance_sqm':1e-6,'pass':True}
print(json.dumps(result,indent=2))
