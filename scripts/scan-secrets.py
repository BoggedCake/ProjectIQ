#!/usr/bin/env python3
"""Dependency-free redacted signature scan; not a substitute for provider scanners.
Scans every reachable Git blob plus non-ignored working files. No candidate values
or matching lines are emitted. Generic entropy and encrypted archives are not covered.
"""
import argparse,hashlib,json,re,subprocess,sys
from pathlib import Path
PATTERNS={
 'private-key':re.compile(rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----'),
 'github-token':re.compile(rb'\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{40,})\b'),
 'aws-access-key':re.compile(rb'\b(?:AKIA|ASIA)[A-Z0-9]{16}\b'),
 'provider-token':re.compile(rb'\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{32,}\b'),
 'assigned-credential':re.compile(rb'''(?i)(?:api[_-]?key|access[_-]?token|client[_-]?secret|password)\s*[:=]\s*["']([A-Za-z0-9+/=_-]{24,})["']'''),
}
def rules(data):
 return [name for name,pattern in PATTERNS.items() if pattern.search(data)]
def scan(root,history=True):
 root=Path(root).resolve();findings=[];count=0
 def inspect(data,scope,identifier):
  nonlocal count
  count+=1
  for rule in rules(data):findings.append({'scope':scope,'object':identifier,'rule':rule})
 def git(*args):return subprocess.check_output(['git','-C',str(root),*args],stderr=subprocess.DEVNULL)
 if history:
  objects=[line.split(b' ',1)[0] for line in git('rev-list','--objects','--all').splitlines()]
  process=subprocess.Popen(['git','-C',str(root),'cat-file','--batch'],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL)
  try:
   for oid in objects:
    process.stdin.write(oid+b'\n');process.stdin.flush()
    header=process.stdout.readline().split()
    if len(header)!=3:raise RuntimeError('Git object read failed')
    size=int(header[2]);data=process.stdout.read(size);separator=process.stdout.read(1)
    if len(data)!=size or separator!=b'\n':raise RuntimeError('Incomplete Git object')
    if header[1]==b'blob':inspect(data,'history',oid.decode())
  finally:
   process.stdin.close();process.wait()
 for filename in git('ls-files','-z','--cached','--others','--exclude-standard').split(b'\0'):
  if not filename:continue
  name=filename.decode('utf8',errors='surrogateescape');file=root/name
  if file.is_symlink():continue
  if file.is_file():inspect(file.read_bytes(),'working',hashlib.sha256(filename).hexdigest())
 return {'scanned_blobs_and_files':count,'findings':findings,'limitations':['Signature scan only; no generic entropy or archive decoding; hosted scanning settings unavailable.']}
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--root',default='.');parser.add_argument('--working-only',action='store_true');args=parser.parse_args()
 try:
  result=scan(args.root,not args.working_only);print(json.dumps(result,indent=2));sys.exit(1 if result['findings'] else 0)
 except Exception:
  print(json.dumps({'error':'Secret scan failed; details withheld to prevent credential disclosure.'}));sys.exit(2)
