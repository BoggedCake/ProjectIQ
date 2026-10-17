'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const source=fs.readFileSync('index.html','utf8');
const declaration=source.match(/const API_BASE=.*?;/)[0];
for(const url of ['https://boggedcake.github.io/ProjectIQ/?apiBase=https://evil.test','https://founder.test/?apiBase=https://evil.test','http://localhost:3000/?apiBase=http://evil.test']){
 const context={location:new URL(url),URLSearchParams};assert.equal(vm.runInNewContext(declaration+'API_BASE',context),'');
}
console.log('API destination regression passed: query cannot redirect property data');
