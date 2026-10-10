'use strict';
// Build a downloadable founder preview only. Never calls a hosting/deployment API.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const target=path.resolve(process.argv[2]||'qa-artifacts/staging-preview');
fs.mkdirSync(target,{recursive:true});
const revision=cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
let html=fs.readFileSync('index.html','utf8');
html=html.replace(/<title>[^<]*<\/title>/,'<title>SitePivot — STAGING founder preview</title>');
html=html.replace(/<body([^>]*)>/,`<body$1><aside role="note" style="padding:12px 20px;background:#fff0b8;color:#312400;font:700 15px system-ui;text-align:center">SITEPIVOT STAGING — founder testing only. Not the public production website.<br><small>Revision ${revision.slice(0,12)}</small></aside>`);
if(!html.includes('SITEPIVOT STAGING'))throw Error('Staging label could not be inserted');
fs.writeFileSync(path.join(target,'index.html'),html);
for(const file of ['fsr-evidence.js','property-evidence.js','planning-intelligence.js','commercial-engine.js','comparison-engine.js','conversation.js','voice.js'])fs.copyFileSync(file,path.join(target,file));
fs.writeFileSync(path.join(target,'README.txt'),`SITEPIVOT STAGING — founder testing only\nRevision: ${revision}\n\nThis is a downloadable development preview, not a production deployment.\nNo server credentials, environment files, property sessions or private account data are packaged.\n\nTo test locally, extract this folder and run:\npython3 -m http.server 8080\nThen open http://localhost:8080/?fixtures=1 in your browser.\nFixtures are labelled test data. Browser voice availability depends on your device.\nServer-only providers are not included. Never approve production deployment just to obtain this preview.\n`);
console.log('Built labelled staging preview at '+target+' from '+revision);
