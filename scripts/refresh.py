"""Refresh verified race IDs. Reject test data; retain previous records on failure."""
import concurrent.futures, datetime, json, pathlib, subprocess
ROOT=pathlib.Path(__file__).resolve().parents[1]
def fetch(url):
    p=subprocess.run(['curl','--fail','--silent','--show-error','--location','--retry','2','--max-time','30',url],capture_output=True,check=True)
    return json.loads(p.stdout)
def main():
    target=ROOT/'data/results.json'
    old=json.loads(target.read_text()) if target.exists() else {'races':[]}
    prior={str(r['id']):r for r in old['races']}
    roster=json.loads((ROOT/'data/roster.json').read_text())
    def one(meta):
        try:
            r=fetch(f"https://civicapi.org/api/v2/race/{meta['id']}?light=true")
            if r.get('test_data') is not False: raise ValueError('Unverified or test feed')
            if r.get('country')!='US' or r.get('province')!=meta['state'] or not r.get('election_date','').startswith('2026-11-03'): raise ValueError('Wrong race')
            if not isinstance(r.get('candidates'),list): raise ValueError('No candidate list')
            return {**r,**meta,'retrieved_at':datetime.datetime.now(datetime.timezone.utc).isoformat()}
        except Exception as e:
            print('Unavailable',meta['id'],str(e)[:100])
            return prior.get(str(meta['id']))
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool: races=[r for r in pool.map(one,roster) if r]
    if not races: raise SystemExit('No verified results available')
    target.write_text(json.dumps({'saved_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'races':races},ensure_ascii=False,separators=(',',':')))
    print('Saved',len(races),'of',len(roster),'races')
if __name__=='__main__': main()
