const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('app.js','utf8');const ctx=vm.createContext({document:{getElementById:()=>null},URL,Intl,Date});vm.runInContext(src.slice(0,src.indexOf('function render()')),ctx);
const s=x=>vm.runInContext(`summarize(${JSON.stringify(x)})`,ctx);
assert.equal(s({candidates:[{votes:0}]}).leader,null);
assert.equal(s({candidates:[{votes:50},{votes:50}]}).leader,null);
assert.equal(s({candidates:[{votes:60,name:'A'},{votes:30},{votes:10}]}).total,100);
assert.equal(s({candidates:[{votes:60,name:'A'},{votes:40,winner:true}]}).winner.winner,true);
assert.equal(s({candidates:[{votes:60},{votes:40}]}).winner,undefined);
assert.equal(s({candidates:[{votes:60},{votes:40}]}).margin,.2);
assert.equal(vm.runInContext("safeURL('javascript:alert(1)')",ctx),'');
const roster=JSON.parse(fs.readFileSync('data/roster.json'));
const snapshot=JSON.parse(fs.readFileSync('data/results.json'));
assert.equal(roster.filter(r=>r.office==='senate').length,35);assert.equal(roster.filter(r=>r.office==='governor').length,36);
assert.equal(new Set(roster.map(r=>r.id)).size,71);
assert.equal(snapshot.races.length,71);
for(const r of snapshot.races){assert.equal(r.test_data,false);assert.ok(r.election_date.startsWith('2026-11-03'));assert.ok(r.candidates.every(c=>Number.isFinite(c.votes)&&c.votes>=0))}
assert.equal(JSON.parse(fs.readFileSync('assets/map.json')).length,51);
console.log('PASS: map coverage, race coverage, vote totals, ties, race calls, zero votes, safe image URLs, live snapshot validation.');
