'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const FILES=['index.html','zoning-evidence.js','fsr-evidence.js','commercial-engine.js','planning-intelligence.js','property-evidence.js','comparison-engine.js','conversation.js','voice.js'];
function build({root=path.resolve(__dirname,'..'),files=FILES,revision}={}){
 root=fs.realpathSync(root);
 const directory=path.join(root,'qa-artifacts','migration-public');
 const parent=path.dirname(directory);
 // No traversal through output symlinks, and never package directory trees.
 for(const target of [parent,directory])if(fs.existsSync(target)&&fs.lstatSync(target).isSymbolicLink())throw Error('Output symlink forbidden');
 const entries=files.map(name=>{
  if(!/^[a-zA-Z0-9][a-zA-Z0-9._-]*\.(html|js|css|png|svg|ico)$/.test(name))throw Error('Invalid static asset');
  const source=path.join(root,name);if(!fs.lstatSync(source).isFile()||fs.lstatSync(source).isSymbolicLink())throw Error('Regular static asset required');
  const content=fs.readFileSync(source);return {name,content,sha256:crypto.createHash('sha256').update(content).digest('hex')};
 });
 if(!revision||!/^[a-zA-Z0-9._-]{1,80}$/.test(revision))throw Error('Explicit revision required');
 fs.mkdirSync(parent,{recursive:true});
 const temporary=fs.mkdtempSync(path.join(parent,'migration-build-'));
 try{for(const entry of entries)fs.writeFileSync(path.join(temporary,entry.name),entry.content);
 fs.writeFileSync(path.join(temporary,'build-info.json'),JSON.stringify({revision,assets:entries.map(({name,sha256})=>({name,sha256}))},null,2)+'\n');
 fs.rmSync(directory,{recursive:true,force:true});fs.renameSync(temporary,directory);
 }finally{fs.rmSync(temporary,{recursive:true,force:true})}
 return {directory,assets:entries.map(x=>x.name)};
}
if(require.main===module){const revision=require('node:child_process').execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();console.log(JSON.stringify(build({revision})))}
module.exports={build,FILES};
