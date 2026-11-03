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
assert.equal(roster.filter(r=>r.office==='house').length,435);
assert.equal(new Set(roster.filter(r=>r.office==='house').map(r=>r.state)).size,50);
assert.equal(new Set(roster.map(r=>r.id)).size,506);
assert.equal(new Set(roster.filter(r=>r.office==='house').map(r=>r.district)).size,435);
assert.ok(snapshot.races.length>=71);
assert.equal(new Set(snapshot.races.map(r=>r.id)).size,snapshot.races.length);
for(const r of snapshot.races){assert.equal(r.test_data,false);assert.ok(r.election_date.startsWith('2026-11-03'));assert.ok(r.candidates.every(c=>Number.isFinite(c.votes)&&c.votes>=0))}
assert.equal(JSON.parse(fs.readFileSync('assets/map.json')).length,51);
console.log('PASS: map coverage, race coverage, vote totals, ties, race calls, zero votes, safe image URLs, live snapshot validation.');

vm.runInContext(`
 const testMetas=[{id:1},{id:2}];
 const testRecords=new Map([[1,{candidates:[{party:'Democratic',votes:80,winner:true},{party:'Republican',votes:20}]}],[2,{candidates:[{party:'Republican',votes:90},{party:'Democratic',votes:10}]}]]);
 const testSum=stateSummary(testMetas,testRecords);
`,ctx);
assert.equal(vm.runInContext('testSum.leader',ctx),'rep');
assert.equal(vm.runInContext('testSum.total',ctx),200);
assert.equal(vm.runInContext('testSum.called',ctx),false);
assert.equal(vm.runInContext('stateSummary(testMetas,new Map()).complete',ctx),false);
assert.equal(vm.runInContext('stateStatus([],stateSummary([],new Map()))',ctx),'无此类选举');
assert.equal(vm.runInContext("stateStatus([{id:3}],stateSummary([{id:3}],new Map([[3,{candidates:[{votes:0}]}]])))",ctx),'等待开票');
assert.equal(vm.runInContext("failures.add(1);stateStatus(testMetas,testSum)",ctx),'连接失败 / 数据延迟');
console.log('PASS: 435 unique districts, 50 states, party aggregation, incomplete counts, partial calls and status distinctions.');
