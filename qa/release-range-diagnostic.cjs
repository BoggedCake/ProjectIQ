'use strict';
// Public formatted-address strings captured in Actions job 116216934671.
// IDs and coordinates below are synthetic. This regression does not assert that
// a bare number is an official alias or establish actual parcel relationships.
const assert=require('node:assert/strict');
const A=require('../address-evidence');
const cases=[
  ['49 Mann Street Gosford NSW 2250','COUNCIL ADMINISTRATION BLDG 49-51 MANN ST, GOSFORD NSW 2250','49-51 Mann Street Gosford NSW 2250'],
  ['2 Civic Place Katoomba NSW 2780','COUNCIL CHAMBERS 2-6 CIVIC PL, KATOOMBA NSW 2780','2-6 Civic Place Katoomba NSW 2780']
];
for(const [entered,formattedaddress,range] of cases){
  const [streetnumber1,streetnumber2]=range.match(/^(\d+)-(\d+)/).slice(1);
  const attributes={objectid:1,formattedaddress,streetnumber1,streetnumber2};
  assert.equal(A.match(range,{objectid:1,formattedaddress,streetnumber1}).matched,false,'Unconfirmed structured range endpoint stays unresolved');
  assert.equal(A.match(entered,attributes).matched,false,'Range cannot establish an unproven bare-number alias: '+entered);
  assert.equal(A.match(range,attributes).matched,true,'An exactly entered source range remains distinguishable');
  const rows=[1,2].map(objectid=>({attributes:{...attributes,objectid},geometry:{x:151,y:-33}}));
  const selected=A.select(range,rows);
  assert.notEqual(selected.status,'confirmed-address','Exact range text cannot silently select one of multiple source identities');
  assert.equal(selected.candidates.length,2,'Multiple exact identities remain available for review');
}
const dixon={formattedaddress:'84/2-8 DIXON ST, SYDNEY NSW 2000'};
assert.equal(A.match('84/2-8 Dixon Street Sydney NSW 2000',dixon).matched,true);
assert.equal(A.match('85/2-8 Dixon Street Sydney NSW 2000',dixon).matched,false,'Distinct strata units cannot be substituted');
console.log('PASS release range diagnosis: unproven aliases withheld, exact ranges preserved, multi-record review and exact Dixon unit retained');
