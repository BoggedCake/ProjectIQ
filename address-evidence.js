/* Authoritative identity is component equality, never a relevance score. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.SitePivotAddress=factory()})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const types={ST:'STREET',STREET:'STREET',RD:'ROAD',ROAD:'ROAD',AVE:'AVENUE',AV:'AVENUE',AVENUE:'AVENUE',PDE:'PARADE',PARADE:'PARADE',DR:'DRIVE',DRIVE:'DRIVE',PL:'PLACE',PLACE:'PLACE',CT:'COURT',COURT:'COURT',CRES:'CRESCENT',CR:'CRESCENT',CRESCENT:'CRESCENT',HWY:'HIGHWAY',HIGHWAY:'HIGHWAY',TCE:'TERRACE',TERRACE:'TERRACE',LN:'LANE',LANE:'LANE',CL:'CLOSE',CLOSE:'CLOSE',CCT:'CIRCUIT',CIRCUIT:'CIRCUIT',WAY:'WAY',ESP:'ESPLANADE',ESPLANADE:'ESPLANADE',GR:'GROVE',GRV:'GROVE',GROVE:'GROVE',RISE:'RISE',WALK:'WALK',BVD:'BOULEVARD',BLVD:'BOULEVARD',BOULEVARD:'BOULEVARD',MEWS:'MEWS',SQ:'SQUARE',SQUARE:'SQUARE',PROM:'PROMENADE',PROMENADE:'PROMENADE'};
const validId=id=>typeof id==='number'?Number.isFinite(id):typeof id==='string'&&id.trim()!=='';
const hasId=a=>{const ids=[a.ap_gurasid,a.objectid].filter(id=>id!==undefined&&id!==null);return ids.length>0&&ids.every(validId)};
const norm=s=>String(s??'').toUpperCase().replace(/NEW SOUTH WALES/g,'NSW').replace(/\bAUSTRALIA\b|\bAUS\b/g,' ').replace(/[,.]/g,' ').replace(/\s+/g,' ').trim();
const directions={N:'NORTH',NORTH:'NORTH',S:'SOUTH',SOUTH:'SOUTH',E:'EAST',EAST:'EAST',W:'WEST',WEST:'WEST',NE:'NORTH EAST','NORTH EAST':'NORTH EAST',NW:'NORTH WEST','NORTH WEST':'NORTH WEST',SE:'SOUTH EAST','SOUTH EAST':'SOUTH EAST',SW:'SOUTH WEST','SOUTH WEST':'SOUTH WEST'};
function parse(input,hint){
 let raw=norm(input),body=raw,unit='';
 // ArcGIS suggestions explicitly separate locality, city and state with commas.
 // Only use that hierarchy when the state/postcode suffix and both named
 // segments are unambiguous; unstructured extra words remain contradictions.
 const segments=String(input??'').replace(/,\s*(?:AUS|AUSTRALIA)\s*$/i,'').split(',').map(norm);
 if((segments.length===4||segments.length===5)&&/^[A-Z][A-Z '-]*$/.test(segments[1])&&/^[A-Z][A-Z '-]*$/.test(segments[2])&&/^NSW \d{4}$/.test(segments.slice(3).join(' ')))body=[segments[0],segments[1],...segments.slice(3)].join(' ');

 const u=body.match(/^(?:(?:UNIT|APARTMENT|APT|FLAT)\s*)?([A-Z0-9-]+)\s*\/\s*/)||body.match(/\b(?:UNIT|APARTMENT|APT|FLAT)\s+([A-Z0-9-]+)\s*\/?\s*/);
 if(u){unit=u[1];body=body.replace(u[0],'').trim()}
 const num=body.match(/^(\d+[A-Z]?(?:\s*-\s*\d+[A-Z]?)?)\s+/),number=num?num[1].replace(/\s/g,''):'';if(num)body=body.slice(num[0].length);
 const postcode=(body.match(/\b(\d{4})\s*$/)||[])[1]||'';body=body.replace(/\bNSW\b/g,' ').replace(/\b\d{4}\s*$/,'').trim();
 const words=body.split(/\s+/);let at=-1;
 // Match an exact structured street/type boundary when type words are also
 // part of a street name or locality. Other components still veto separately.
 const street=typeof hint?.streetname==='string'?norm(hint.streetname):'',type=types[norm(hint?.streettype||hint?.streettypedescription)];
 if(street&&type)for(let i=1;i<words.length;i++)if(words.slice(0,i).join(' ')===street&&types[words[i]]===type){at=i;break}
 if(at<0)for(let i=1;i<words.length;i++)if(types[words[i]]){at=i;break}
 let locality=at>=0?words.slice(at+1).join(' '):'',suffix='';
 // NSW stores a street direction separately from the locality. Use the
 // authoritative locality boundary, never strip WEST from West Pennant Hills.
 const officialLocality=norm(hint?.localityname);
 if(officialLocality&&locality.endsWith(' '+officialLocality)){
  const direction=locality.slice(0,-officialLocality.length).trim();
  if(directions[direction]){suffix=directions[direction];locality=officialLocality}
 }
 return{raw,number,unit,street:at>=0?words.slice(0,at).join(' '):'',type:at>=0?types[words[at]]:'',suffix,locality,postcode};
}
function sourceLabel(a){
 const text=norm(a.formattedaddress),p=parse(a.formattedaddress,a);
 if(p.number||!hasId(a))return p;
 // A source building name may precede the civic number. Drop only a bounded,
 // nonnumeric prefix when the authoritative structured number confirms it.
 const prefix=text.match(/^([A-Z][A-Z '&()-]{0,79})\s+(\d+[A-Z]?(?:\s*-\s*\d+[A-Z]?)?)\s+/);
 if(!prefix)return p;
 const start=norm(a.streetnumber1)+norm(a.streetnumbersuffix1),end=norm(a.streetnumber2)+norm(a.streetnumbersuffix2),expected=start+(end&&end!==start?'-'+end:'');
 const label=parse(text.slice(prefix[1].length).trim(),a);return start&&label.number===expected?label:p;
}
function components(a){const p=sourceLabel(a);const set=(key,value)=>{if(value!==undefined&&value!==null&&String(value).trim())p[key]=norm(value)};
 if(a.streetnumber1!==undefined&&a.streetnumber1!==null&&String(a.streetnumber1).trim()){const n=norm(a.streetnumber1)+(norm(a.streetnumbersuffix1)||'');const end=norm(a.streetnumber2)+(norm(a.streetnumbersuffix2)||'');p.number=n+(end&&end!==n?'-'+end:'');if(!a.streetnumbersuffix1&&!end&&p.raw){const displayed=parse(p.raw,a).number;if(displayed.startsWith(n+'-')||(displayed.startsWith(n)&&displayed.length===n.length+1&&/^[A-Z]$/.test(displayed.slice(-1))))p.number=displayed}}
 set('street',a.streetname);if(a.streettype||a.streettypedescription)p.type=types[norm(a.streettype||a.streettypedescription)]||norm(a.streettype||a.streettypedescription);if(a.streetsuffix)p.suffix=directions[norm(a.streetsuffix)]||norm(a.streetsuffix);set('locality',a.localityname);set('postcode',a.postcode);set('unit',a.complexunitidentifier);return p;
}
function compare(q,p){
 if(q.suffix!==p.suffix)return{matched:false,reason:'Contradictory or missing address street direction.'};
 for(const key of ['number','street','type'])if(!q[key]||!p[key])return{matched:false,reason:'Address '+key+' is unresolved.'};
 for(const key of ['number','street','type','locality','postcode','unit']){if(q[key]&&p[key]!==q[key]||key==='unit'&&p[key]&&!q[key])return{matched:false,reason:'Contradictory or missing address '+key+'.'}}
 if(!q.locality&&!q.postcode)return{matched:false,reason:'Address locality or postcode is required.'};return{matched:true,reason:null};
}
function match(input,a){const q=parse(input,a),p=components(a),display=sourceLabel(a);
 // An exact unit can use a building's principal start number while the source
 // labels the building as a range. The authoritative structured start and unit
 // must both confirm this relationship; it never applies to unqualified sites.
 if(q.unit&&q.unit===norm(a.complexunitidentifier)&&q.number===norm(a.streetnumber1)&&!q.number.includes('-')&&display.number.startsWith(q.number+'-')&&hasId(a))q.number=display.number;
 const result=compare(q,p),label=compare(q,display);if(result.matched&&label.matched)return result;
 const id=a.ap_gurasid??a.objectid;
 for(const alias of a.authoritativeAliases||[])if(alias.source==='NSW Address Point'&&hasId(a)&&String(alias.addressId)===String(id)&&compare(q,parse(alias.formattedaddress)).matched)return{matched:true,reason:'Authoritative address alias.',aliasSource:alias.source};
 return result.matched?label:result;
}
function review(input,features,ambiguous){
 const q=parse(input),related=features.filter(f=>{const a=f.attributes||{},p=components(a);return hasId(a)&&p.number.includes('-')&&p.number.split('-')[0]===q.number&&!q.unit&&['street','type','locality','postcode'].every(k=>q[k]&&q[k]===p[k]);}).map(f=>{const a=f.attributes,p=components(a);return{address:a.formattedaddress,number:p.number,objectid:a.objectid??null,addressId:a.ap_gurasid??null,cadastralIdentifier:a.cadastralidentifier??null};});
 return{status:'needs-review',source:'NSW Address Point',category:ambiguous?'ambiguous':related.length?'unproven-range':'unmatched',candidates:related.slice(0,10),reason:related.length?'The official address is a range. Its relationship to the entered address and parcel needs confirmation; no property was selected.':'An exact authoritative property identity has not been established.'};
}
function select(input,features){const matches=features.filter(f=>match(input,f.attributes||{}).matched);if(matches.length!==1)return{status:'unresolved',reason:matches.length?'Authoritative address identity is ambiguous; confirmation required.':'No authoritative address identity matches the distinguishing components.',candidates:matches,review:review(input,features,matches.length>0)};const f=matches[0],a=f.attributes||{};if(!hasId(a))return{status:'unresolved',reason:'Authoritative address stable identifier is missing.',candidates:matches};return{status:'confirmed-address',feature:f,candidates:matches,sourceIds:{objectid:a.objectid??null,ap_gurasid:a.ap_gurasid??null,ss_addressstringoid:a.ss_addressstringoid??null,ss_principaladdresssiteoid:a.ss_principaladdresssiteoid??null,ss_propid:a.ss_propid??null,prop_gurasid:a.prop_gurasid??null,ss_sppropid:a.ss_sppropid??null,lot_cadid:a.lot_cadid??null}}}
function selectionQuery(input,selected){
 const q=parse(input),s=parse(selected);
 // Unit contradictions must reach authoritative validation, not disappear
 // when a geocoder suggestion is selected.
 if(q.unit!==s.unit)return String(input||selected);
 const same=['number','street','type'].every(k=>q[k]&&q[k]===s[k]);
 if(same&&(!q.postcode||q.postcode===s.postcode)){
  const split=locality=>{for(const direction of Object.keys(directions).sort((a,b)=>b.length-a.length))if(locality.startsWith(direction+' '))return{direction:directions[direction],locality:locality.slice(direction.length+1)};return{direction:'',locality};};
  const a=split(q.locality),b=split(s.locality);
  if(a.direction&&b.direction&&a.direction!==b.direction&&a.locality===b.locality)return String(input);
 }
 if(same&&s.locality&&q.locality.endsWith(' '+s.locality)&&(!q.postcode||q.postcode===s.postcode)){
  const extra=q.locality.slice(0,-s.locality.length).trim();
  if(directions[extra])return String(input);
 }
 return String(selected||input||'');
}
return{parse,components,match,select,selectionQuery};
});
