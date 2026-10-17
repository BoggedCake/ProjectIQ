'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),A=require('../address-evidence'),R=require('../response-evidence'),Z=require('../zoning-evidence'),{councilEvidence,REGISTRY}=require('../api/_lib/council');
const query='12 EXAMPLE STREET MANLY NSW 2095',geometry={rings:[[[0,0],[10,0],[10,10],[0,10],[0,0]]],spatialReference:{wkid:28356}},property={lga:'NORTHERN BEACHES',point:{x:151,y:-33}};
const collection=features=>({features,exceededTransferLimit:false}),row=attributes=>({attributes}),address=id=>({...row({objectid:id,formattedaddress:query}),geometry:{x:151,y:-33}});
const attrs=id=>id===126?{OBJECTID:1,LGA_NAME:'NORTHERN BEACHES'}:id>=158?{OBJECTID:1,Risk:'High risk precinct'}:id===16?{OBJECTID:1,CLASS:1}:id===45?{OBJECTID:1,ASS_CLASS:'1'}:{OBJECTID:1,Tag:'1'};
const ids=[126,158,159,160,161,16,45,92,100],url=id=>REGISTRY['NORTHERN BEACHES'].base+'/'+id+'/query';
test('R1 malformed council coverage cannot establish mapped clear',async()=>{
 for(const attributes of [{garbage:true},{objectid:1},{OBJECTID:1},{OBJECTID:{},LGA_NAME:'NORTHERN BEACHES'},{OBJECTID:1,LGA_NAME:false}]){
  const e=await councilEvidence(property,geometry,async(base,id)=>collection(id===126?[row(attributes)]:[]));for(const k of ['flood','acid']){assert.equal(e[k].failed,true,JSON.stringify(attributes));assert.equal(e[k].complete,false);assert.equal(e[k].state,'council-service-unavailable');}
 }
});
test('R1 each layer schema and duplicate collection fails closed consistently with cache admission',async()=>{
 for(const id of ids){
  const good=attrs(id),field=Object.keys(good)[1];
  for(const features of [[row({garbage:true})],[row({OBJECTID:1})],[row({...good,[field]:{}})],[row(good),row(good)],[row({...good,OBJECTID:'   '})]]){
   assert.equal(R.validate(collection(features),R.queryOptions(url(id),100)).complete,false,'cache layer '+id);
   const e=await councilEvidence(property,geometry,async(base,layer)=>collection(layer===id?features:layer===126?[row(attrs(126))]:[]));assert.equal(e[id===126||id>=158?'flood':'acid'].failed,true,'adapter layer '+id);
  }
  assert.equal(R.validate(collection([row(good)]),R.queryOptions(url(id),100)).complete,true,'verified schema layer '+id);
 }
 const e=await councilEvidence(property,geometry,async(base,id)=>collection(id===126?[row(attrs(id))]:[]));assert.equal(e.flood.state,'council-mapping-clear');assert.equal(e.acid.state,'council-mapping-clear');
 const positive=await councilEvidence(property,geometry,async(base,id)=>collection([row(attrs(id))]));assert.equal(positive.flood.state,'council-mapping-affected');assert.equal(positive.acid.state,'council-mapping-affected');
});
test('R2 common Australian canonical street types and explicit abbreviations preserve exact identity',()=>{
 for(const [full,alias] of [['GROVE','GR'],['RISE','RISE'],['WALK','WALK'],['BOULEVARD','BVD'],['MEWS','MEWS'],['SQUARE','SQ'],['PROMENADE','PROM']]){
  const label=`12 EXAMPLE ${full} MANLY NSW 2095`,a={objectid:1,formattedaddress:label,streetnumber1:'12',streetname:'EXAMPLE',streettype:full,localityname:'MANLY',postcode:'2095'};
  assert.equal(A.match(label,a).matched,true,full);assert.equal(A.match(`12 EXAMPLE ${alias} MANLY NSW 2095`,a).matched,true,alias);
  assert.equal(A.match(`12 OTHER ${alias} MANLY NSW 2095`,a).matched,false);assert.equal(A.match(`12 EXAMPLE ROAD MANLY NSW 2095`,a).matched,false);
 }
 assert.equal(A.match('12 EXAMPLE BOULEV MANLY NSW 2095',{formattedaddress:'12 EXAMPLE BOULEVARD MANLY NSW 2095'}).matched,false,'unlisted fuzzy type rejected');
});
test('R3 malformed scalar identifiers cannot establish address or complete collections',()=>{
 for(const id of [{},[],false,true,'  ',NaN,Infinity,-Infinity]){
  assert.equal(A.select(query,[address(id)]).status,'unresolved',String(id));assert.equal(R.validate(collection([address(id)]),{idField:'objectid'}).complete,false,String(id));
 }
 for(const id of [0,1,'1','{GUID-123}','abc']){assert.equal(A.select(query,[address(id)]).status,'confirmed-address');assert.equal(R.validate(collection([address(id)]),{idField:'objectid'}).complete,true);}
 assert.equal(R.validate(collection([address(' x '),address('x')]),{idField:'objectid'}).complete,false,'trimmed duplicate IDs');
});
test('malformed offsets cannot establish completed empty evidence',()=>{
 for(const key of ['resultOffset','nextStart'])for(const v of ['invalid','0',{},true,-1,0.5,Infinity,NaN])assert.equal(R.validate({...collection([]),[key]:v}).complete,false,key+' '+String(v));
 assert.equal(R.validate({...collection([]),resultOffset:0,nextStart:0}).complete,true);
});
test('malformed zone code or instrument never establishes completed controlling evidence',()=>{
 for(const attributes of [{SYM_CODE:false,ZONE:'R1',EPI_NAME:'LEP'},{SYM_CODE:0,ZONE:'R1',EPI_NAME:'LEP'},{SYM_CODE:{},EPI_NAME:'LEP'},{SYM_CODE:123,EPI_NAME:'LEP'},{SYM_CODE:true,EPI_NAME:'LEP'},{SYM_CODE:' ',EPI_NAME:'LEP'},{SYM_CODE:'R1',EPI_NAME:{}},{SYM_CODE:'R1',EPI_NAME:123},{SYM_CODE:'R1',EPI_NAME:false},{SYM_CODE:'R1',EPI_NAME:' '},{SYM_CODE:'R1'}]){
  const r=Z.resolve({parcelGeometry:geometry,records:[{attributes,geometry}]});assert.equal(r.requiresReview,true,JSON.stringify(attributes));assert.notEqual(r.state,'single-zone');assert.equal(r.primaryZone,null);
 }
});

test('selected comma-delimited address preserves locality before city hierarchy',()=>{
 for(const locality of ['Fairlight','North Balgowlah']){
  const a={objectid:1,formattedaddress:`57 GRIFFITHS STREET ${locality.toUpperCase()} NSW 2094`,streetnumber1:'57',streetname:'GRIFFITHS',streettype:'STREET',localityname:locality,postcode:'2094'};
  assert.equal(A.match(`57 Griffiths Street, ${locality}, Sydney, New South Wales, 2094`,a).matched,true);
  assert.equal(A.match(`57 Griffiths Street, ${locality}, Sydney, NSW 2094`,a).matched,true);
  assert.equal(A.match(`57 Griffiths Street ${locality} Sydney NSW 2094`,a).matched,false,'unstructured city suffix is not guessed away');
  assert.equal(A.match('57 Griffiths Street, Manly, Sydney, NSW, 2094',a).matched,false,'different locality veto remains');
 }
});
test('authoritative building-name prefix requires stable ID and structured number confirmation',()=>{
 const q='290 King Street Newcastle NSW 2300',a={objectid:1,formattedaddress:'TOWN HALL 290 KING ST, NEWCASTLE NSW 2300',streetnumber1:'290',streetname:'KING',streettype:'STREET',localityname:'NEWCASTLE',postcode:'2300'};
 assert.equal(A.match(q,a).matched,true);
 for(const change of [{objectid:null},{streetnumber1:'291'},{formattedaddress:'TOWN HALL 290 OTHER ST, NEWCASTLE NSW 2300'},{formattedaddress:'TOWN HALL 290 KING ST, MANLY NSW 2300'}])assert.equal(A.match(q,{...a,...change}).matched,false,JSON.stringify(change));
 assert.equal(A.match('290 King Street Newcastle NSW 2300',{...a,formattedaddress:'TOWN HALL 290 KING ST, NEWCASTLE NSW 2301'}).matched,false,'prefix cannot hide postcode contradiction');
});
test('structured source disambiguates street names and localities containing street type words',()=>{
 for(const [street,type,locality] of [['PINE GROVE','ROAD','MANLY'],['PINE','ROAD','FOREST GROVE'],['PINE WALK','GROVE','FOREST GROVE']]){
  const s=`12 ${street} ${type} ${locality} NSW 2095`,a={objectid:1,formattedaddress:s,streetnumber1:'12',streetname:street,streettype:type,localityname:locality,postcode:'2095'};
  assert.equal(A.match(s,a).matched,true,s);assert.equal(A.match(s.replace('12 ','13 '),a).matched,false);assert.equal(A.match(s.replace('2095','2094'),a).matched,false);
  assert.equal(A.match(s.replace(street,'OTHER'),a).matched,false);assert.equal(A.match(s,{...a,formattedaddress:s.replace(street,'OTHER')}).matched,false);
 }
});
test('invalid or unsupported council parcel geometry cannot establish mapped clear',async()=>{
 for(const g of [{rings:[]},{rings:geometry.rings},{...geometry,spatialReference:{wkid:999999}},{rings:[[[0,0],[10,10],[0,10],[10,0],[0,0]]],spatialReference:{wkid:28356}}]){
  const e=await councilEvidence(property,g,async(base,id)=>collection(id===126?[row(attrs(id))]:[]));for(const k of ['flood','acid']){assert.equal(e[k].state,'manual-review-required');assert.equal(e[k].spatialScope,'address-point');}
 }
});

test('live ArcGIS trailing country segment preserves locality hierarchy without relaxing identity',()=>{
 const f=require('./fixtures/property-evidence/fishbourne-address.json').response.features[0];
 for(const country of ['AUS','Australia']){
  assert.equal(A.match('12 Fishbourne Road, Allambie Heights, Sydney, New South Wales, 2100, '+country,f.attributes).matched,true);
  assert.equal(A.match('12 Fishbourne Road, Manly, Sydney, New South Wales, 2100, '+country,f.attributes).matched,false);
 }
});
