/* Authoritative identity is component equality, never a relevance score. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.SitePivotAddress=factory()})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const types={ST:'STREET',STREET:'STREET',RD:'ROAD',ROAD:'ROAD',AVE:'AVENUE',AV:'AVENUE',AVENUE:'AVENUE',PDE:'PARADE',PARADE:'PARADE',DR:'DRIVE',DRIVE:'DRIVE',PL:'PLACE',PLACE:'PLACE',CT:'COURT',COURT:'COURT',CRES:'CRESCENT',CR:'CRESCENT',CRESCENT:'CRESCENT',HWY:'HIGHWAY',HIGHWAY:'HIGHWAY',TCE:'TERRACE',TERRACE:'TERRACE',LN:'LANE',LANE:'LANE',CL:'CLOSE',CLOSE:'CLOSE',CCT:'CIRCUIT',CIRCUIT:'CIRCUIT',WAY:'WAY',ESP:'ESPLANADE',ESPLANADE:'ESPLANADE',GR:'GROVE',GRV:'GROVE',GROVE:'GROVE',RISE:'RISE',WALK:'WALK',BVD:'BOULEVARD',BLVD:'BOULEVARD',BOULEVARD:'BOULEVARD',MEWS:'MEWS',SQ:'SQUARE',SQUARE:'SQUARE',PROM:'PROMENADE',PROMENADE:'PROMENADE'};
const validId=id=>typeof id==='number'?Number.isFinite(id):typeof id==='string'&&id.trim()!=='';
const hasId=a=>{const ids=[a.ap_gurasid,a.objectid].filter(id=>id!==undefined&&id!==null);return ids.length>0&&ids.every(validId)};
const norm=s=>String(s??'').toUpperCase().replace(/NEW SOUTH WALES/g,'NSW').replace(/\bAUSTRALIA\b|\bAUS\b/g,' ').replace(/[,.]/g,' ').replace(/\s+/g,' ').trim();
function parse(input,hint){
 let raw=norm(input),body=raw,unit='';
 // ArcGIS suggestions explicitly separate locality, city and state with commas.
 // Only use that hierarchy when the state/postcode suffix and both named
 // segments are unambiguous; unstructured extra words remain contradictions.
 const segments=String(input??'').split(',').map(norm);
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
 return{raw,number,unit,street:at>=0?words.slice(0,at).join(' '):'',type:at>=0?types[words[at]]:'',locality:at>=0?words.slice(at+1).join(' '):'',postcode};
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
 set('street',a.streetname);if(a.streettype||a.streettypedescription)p.type=types[norm(a.streettype||a.streettypedescription)]||norm(a.streettype||a.streettypedescription);set('locality',a.localityname);set('postcode',a.postcode);set('unit',a.complexunitidentifier);return p;
}
function compare(q,p){
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
function select(input,features){const matches=features.filter(f=>match(input,f.attributes||{}).matched);if(matches.length!==1)return{status:'unresolved',reason:matches.length?'Authoritative address identity is ambiguous; confirmation required.':'No authoritative address identity matches the distinguishing components.',candidates:matches};const f=matches[0],a=f.attributes||{};if(!hasId(a))return{status:'unresolved',reason:'Authoritative address stable identifier is missing.',candidates:matches};return{status:'confirmed-address',feature:f,candidates:matches,sourceIds:{objectid:a.objectid??null,ap_gurasid:a.ap_gurasid??null,ss_addressstringoid:a.ss_addressstringoid??null,ss_principaladdresssiteoid:a.ss_principaladdresssiteoid??null,ss_propid:a.ss_propid??null,prop_gurasid:a.prop_gurasid??null,ss_sppropid:a.ss_sppropid??null,lot_cadid:a.lot_cadid??null}}}
return{parse,components,match,select};
});
