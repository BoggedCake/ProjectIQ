import importlib.util,subprocess,tempfile,json
from pathlib import Path
spec=importlib.util.spec_from_file_location('scanner',Path(__file__).resolve().parents[1]/'scripts/scan-secrets.py');scanner=importlib.util.module_from_spec(spec);spec.loader.exec_module(scanner)
with tempfile.TemporaryDirectory() as directory:
 root=Path(directory)
 def git(*args):return subprocess.check_output(['git','-C',directory,*args],stderr=subprocess.DEVNULL)
 git('init','-q');git('config','user.name','QA');git('config','user.email','qa@example.test')
 candidate='gh'+'p_'+'A'*36
 (root/'config.txt').write_text(candidate);git('add','.');git('commit','-qm','fixture')
 (root/'config.txt').write_text('removed');git('add','.');git('commit','-qm','remove fixture')
 result=scanner.scan(root);encoded=json.dumps(result)
 assert any(x['scope']=='history' and x['rule']=='github-token' for x in result['findings'])
 assert candidate not in encoded
 assert not scanner.scan(root,False)['findings']
 (root/candidate).write_text(candidate)
 run=subprocess.run(['python3',str(Path(scanner.__file__).resolve()),'--root',str(root),'--working-only'],capture_output=True,text=True)
 assert run.returncode==1
 assert candidate not in run.stdout+run.stderr
 assert scanner.rules(b'-----BEGIN '+b'PRIVATE KEY-----')==['private-key']
print('Secret scanner regression passed: historical detection and redaction')
