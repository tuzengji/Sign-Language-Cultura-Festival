"""Run isolated local API checks; never writes to production or historical data."""
import json, os, socket, subprocess, tempfile, time, urllib.request, urllib.error, uuid
from pathlib import Path
root=Path(__file__).resolve().parents[1]
with socket.socket() as sock:
 sock.bind(('127.0.0.1',0));port=sock.getsockname()[1]
base=f'http://127.0.0.1:{port}/'
def request(path,body=None):
 req=urllib.request.Request(base+path,data=None if body is None else json.dumps(body).encode(),headers={'Content-Type':'application/json'})
 try:
  with urllib.request.urlopen(req) as r:return r.status,r.read()
 except urllib.error.HTTPError as e:return e.code,e.read()
with tempfile.TemporaryDirectory() as data:
 env=dict(os.environ,HOST='127.0.0.1',PORT=str(port),DATA_DIR=data,SEED='off')
 process=subprocess.Popen(['node',str(root/'server/server.mjs')],env=env,stdout=subprocess.DEVNULL)
 try:
  for _ in range(100):
   try:
    assert json.loads(request('api/health')[1])['users']==0;break
   except OSError:time.sleep(.05)
  else:raise RuntimeError('Test server did not start')
  uid=str(uuid.uuid4())
  assert request('api/users',dict(uid=uid,nickname='上线核验',mbti='INFP'))[0]==200
  assert request('api/outfits',dict(uid=uid,nickname='上线核验',t=1,b=1,s=1,mbti='INFP'))[0]==200
  status,body=request('api/messages',dict(uid=uid,body='本地验收留言'));assert status==200
  mid=json.loads(body)['id'];assert request(f'api/messages/{mid}/flower',dict(uid=uid))[0]==200
  assert json.loads(request(f'api/messages/{mid}/flower',dict(uid=uid))[1])['alreadyGiven']
  for path in ['server/server.mjs','server/data/users.jsonl','README.md','.git/config','assets/../server/server.mjs']:
   assert request(path)[0]==404,path
  assert request('assets/characters/start.png')[0]==200
  assert request('game.js')[0]==200
  print('Isolated API: registration, outfit, message, idempotent flower and private-file isolation passed.')
 finally:
  process.terminate();process.wait(timeout=5)
