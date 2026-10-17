'use strict';
const assert=require('node:assert/strict'),V=require('../voice');
const cases=[
 ['Australian avenue and postcode','3 Nield Av, Balgowlah NSW 2093','three Nield Avenue, Balgowlah New South Wales two zero nine three'],
 ['leading zero postcode','12 Smith Rd, Darwin NT 0800','twelve Smith Road, Darwin Northern Territory zero eight zero zero'],
 ['Saint street name','7 St Johns St, St Kilda VIC 3182','seven St Johns Street, St Kilda Victoria three one eight two'],
 ['full state name postcode','8 Beach Dr, Perth Western Australia 6000','eight Beach Drive, Perth Western Australia six zero zero zero'],
 ['bare numbered street','3 Nield Av','three Nield Avenue'],
 ['address without commas','3 Nield Av Balgowlah NSW 2093','three Nield Avenue Balgowlah New South Wales two zero nine three'],
 ['unit address','2/18 Beach Cres, Hobart TAS 7000','two/eighteen Beach Crescent, Hobart Tasmania seven zero zero zero'],
 ['address sentence punctuation','3 Nield Av.','three Nield Avenue.'],
 ['abbreviation outside address','Dr Smith visits St Johns; Av is an abbreviation.','Dr Smith visits St Johns; Av is an abbreviation.'],
 ['ordinary numbers','The year is 2093 and the amount is 0800.','The year is two thousand and ninety three and the amount is eight hundred.'],
 ['bare residential zones','Zone R1 or R2.','Zone R one General Residential or R two Low Density Residential.'],
 ['full residential zone labels','R1 General Residential; R2 Low Density Residential.','R one General Residential; R two Low Density Residential.'],
 ['punctuated residential zone labels','R1 — General Residential; R2 (Low Density Residential).','R one — General Residential; R two (Low Density Residential).'],
 ['planning acronyms','LEP LMR FSR DCP CDC DA SEPP','L-E-P L-M-R F-S-R D-C-P C-D-C D-A S-E-P-P'],
 ['finance rates and amounts','Interest 9.5%. Holding $12,500. Borrowing AUD 1,200,000. Range 8–10%.','Interest nine point five percent. Holding twelve thousand five hundred dollars. Borrowing one million two hundred thousand dollars. Range eight to ten percent.'],
 ['dates and planning ratios','08/10/2026. FSR 0.6:1. Height 8.5 m.','F-S-R zero point six to one. Height eight point five metres.']
];
let failures=0;
for(const [name,input,expected] of cases){try{assert.equal(V.speechText(input),expected,name);assert.equal(V.normalizeTranscript(input).text,input,'display/transcript is unchanged')}catch(error){failures++;console.error(error.message)}}
if(failures)process.exitCode=1;
else console.log(`PASS ${cases.length} financial/address speech regressions with unchanged display/transcript text`);
