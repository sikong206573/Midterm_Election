"""Resolve portraits through watch.vote's verified, seat-scoped directory."""
import json,pathlib,subprocess
root=pathlib.Path(__file__).resolve().parents[1]
races=json.loads((root/'data/results.json').read_text())['races']; people=[]
for r in races:
 for c in r['candidates']:people.append((c['candidate_id'],{'name':c['name'],'state':r['state'],'office':r['office']}))
out={}
for start in range(0,len(people),100):
 batch=people[start:start+100]
 p=subprocess.run(['curl','--fail','-sS','-L','--max-time','45','-H','Content-Type: application/json','--data-binary','@-','https://watch.vote/api/elections/2026/portraits'],input=json.dumps({'lookups':[x[1] for x in batch]}),text=True,capture_output=True,check=True)
 data=json.loads(p.stdout)
 for (cid,q),photo in zip(batch,data['portraits']):
  if photo and photo.get('name')==q['name'] and photo.get('imageUrl'):
   out[str(cid)]={'url':photo['imageUrl'],'source':photo.get('sourceUrl'),'attribution':photo.get('attribution'),'license':photo.get('license')}
(root/'data/portraits.json').write_text(json.dumps(out,ensure_ascii=False,separators=(',',':')))
print('Verified portraits:',len(out),'/',len(people))
