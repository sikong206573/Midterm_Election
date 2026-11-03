const $=id=>document.getElementById(id);
const ns='http://www.w3.org/2000/svg';
const codes={'01':'AL','02':'AK','04':'AZ','05':'AR','06':'CA','08':'CO','09':'CT','10':'DE','11':'DC','12':'FL','13':'GA','15':'HI','16':'ID','17':'IL','18':'IN','19':'IA','20':'KS','21':'KY','22':'LA','23':'ME','24':'MD','25':'MA','26':'MI','27':'MN','28':'MS','29':'MO','30':'MT','31':'NE','32':'NV','33':'NH','34':'NJ','35':'NM','36':'NY','37':'NC','38':'ND','39':'OH','40':'OK','41':'OR','42':'PA','44':'RI','45':'SC','46':'SD','47':'TN','48':'TX','49':'UT','50':'VT','51':'VA','53':'WA','54':'WV','55':'WI','56':'WY'};
let office='senate', selected='',pinned=false,roster=[],results=new Map(),names={},paths=new Map(),portraits={},busy=false,lastSuccess=null;
const party=p=>/^(Democratic|Democrat|D|DFL)$/i.test(p)?'dem':/^(Republican|R)$/i.test(p)?'rep':'other';
const colors={dem:'#5793f5',rep:'#f06d78',other:'#aa87cf'};
const safeURL=s=>{try{const u=new URL(s);return u.protocol==='https:'?u.href:''}catch{return ''}};
const fmt=n=>new Intl.NumberFormat('en-US').format(n);
const time=s=>s?new Date(s).toLocaleString('zh-CN',{timeZone:'America/New_York',hour12:false})+' ET':'来源未提供';
const text=(tag,value,cls)=>{const e=document.createElement(tag);e.textContent=value;if(cls)e.className=cls;return e};
const votes=c=>Number.isFinite(Number(c.votes))&&Number(c.votes)>=0?Number(c.votes):0;
function summarize(r){const cs=[...(r?.candidates||[])].sort((a,b)=>votes(b)-votes(a));const total=cs.reduce((s,c)=>s+votes(c),0);return {cs,total,winner:cs.find(c=>c.winner===true),leader:total&&votes(cs[0])!==votes(cs[1]||{})?cs[0]:null,margin:total?(votes(cs[0]||{})-votes(cs[1]||{}))/total:0}}
const stateRaces=state=>roster.filter(r=>r.office===office&&r.state===state);
function render(){let d=0,r=0,o=0,p=0,loaded=0;
 for(const meta of roster.filter(r=>r.office===office)){const race=results.get(meta.id);if(!race)continue;loaded++;const w=summarize(race).winner;if(w){const x=party(w.party);if(x==='dem')d++;else if(x==='rep')r++;else o++}else p++}
 $('dem').textContent=d;$('rep').textContent=r;$('other').textContent=o;$('pending').textContent=`${loaded} / ${p}`;
 for(const [state,path] of paths){const metas=stateRaces(state),rs=metas.map(m=>results.get(m.id)).filter(Boolean);let fill='#303e50',stroke='#536278',dash='',opacity=1;
  if(rs.length){const sums=rs.map(summarize),allWon=rs.length===metas.length&&sums.every(s=>s.winner);stroke=allWon?'#64d8b0':'#e2ba70';dash=allWon?'':'3 2';
   const leaders=sums.map(s=>s.winner||s.leader);if(leaders.every(Boolean)&&leaders.every(c=>party(c.party)===party(leaders[0].party))){fill=colors[party(leaders[0].party)];opacity=.48+Math.min(.52,Math.max(...sums.map(s=>s.margin))*1.8)}else if(sums.some(s=>s.total))fill=colors.other;
  }else if(!metas.length){opacity=.45}
  path.setAttribute('fill',fill);path.setAttribute('fill-opacity',opacity);path.setAttribute('stroke',stroke);path.setAttribute('stroke-width',rs.length?1.7:1);path.setAttribute('stroke-dasharray',dash);path.classList.toggle('selected',state===selected);
  path.setAttribute('aria-label',`${names[state]}：${!metas.length?'未收录该类型选举':!rs.length?'等待数据':rs.every(r=>summarize(r).winner)?'已宣布胜选':'仍未决出'}`);
 } if(selected)detail(selected);
}
function detail(state){const host=$('detail');host.replaceChildren(text('h3',names[state]||state,'state-title'),text('div',`${state} · ${office==='senate'?'美国参议院':'州长选举'}`,'sub'));$('state').value=state;
 const metas=stateRaces(state);if(!metas.length){host.append(text('p','当前名单未收录该州此类选举。','sub'));return}
 for(const meta of metas){const box=text('section','','race');box.append(text('h3',meta.name));host.append(box);const race=results.get(meta.id);if(!race){box.append(text('p','正在读取本场数据；尚无可验证票数。','sub'));continue}
  const {cs,total,winner}=summarize(race);box.append(text('span',winner?'✓ civicAPI 已宣布胜选':total?'◌ 正在计票 · 尚未宣布胜选':'◌ 等待票数 · 尚未宣布胜选','badge'+(winner?' won':'')));
  for(const c of cs){const row=text('div','','candidate'),avatar=text('div','暂无头像','avatar');const rec=portraits[String(c.candidate_id)];const url=safeURL(rec?.url||c.photo_url||c.image_url||'');if(url){avatar.textContent='';const img=document.createElement('img');img.src=url;img.alt=c.name+' 的头像';img.loading='lazy';img.referrerPolicy='no-referrer';img.onerror=()=>avatar.replaceChildren(document.createTextNode('暂无头像'));avatar.append(img);if(rec?.source)avatar.title='头像来源：'+rec.source}
   const who=text('div','');who.append(text('b',c.name+(c.winner===true?' ✓':'')),text('small',c.party));const percent=total?votes(c)/total*100:null;const bar=text('div','','bar'),line=text('i','');line.style.width=(percent||0)+'%';line.style.background=colors[party(c.party)];bar.append(line);who.append(bar);const num=text('div',percent===null?'—':percent.toFixed(1)+'%','share');num.append(text('small',total?fmt(votes(c))+' 票':'等待开票'));row.append(avatar,who,num);box.append(row);
  }
  box.append(text('p',`已报票数 ${fmt(total)} · 报告率 ${Number.isFinite(race.percent_reporting)?race.percent_reporting+'%':'未提供'}`,'sub'),text('p',`来源更新：${time(race.last_updated)}\n本场读取：${time(race.retrieved_at)}`,'source-time'));
  const a=text('a','查看来源 ↗','sub');a.href='https://civicapi.org/api/v2/race/'+meta.id+'?light=true';a.target='_blank';a.rel='noopener';box.append(a);
 }
}
async function json(url){const response=await fetch(url,{signal:AbortSignal.timeout(20000),cache:'no-store'});if(!response.ok)throw new Error('HTTP '+response.status);return response.json()}
function validate(r,m){return r.test_data===false&&r.country==='US'&&r.province===m.state&&r.election_date?.startsWith('2026-11-03')&&Array.isArray(r.candidates)}
async function refresh(){if(busy)return;busy=true;$('refresh').disabled=true;const batch=roster.filter(r=>r.office===office);let ok=0,fail=0;let next=0;
 await Promise.all(Array.from({length:5},async()=>{while(next<batch.length){const m=batch[next++];try{const r=await json('https://civicapi.org/api/v2/race/'+m.id+'?light=true');if(!validate(r,m))throw Error('Invalid or test data');results.set(m.id,{...r,...m,retrieved_at:new Date().toISOString()});ok++}catch{fail++}}}));
 if(ok)lastSuccess=new Date();$('led').style.color=fail?'#e2ba70':'#64d8b0';$('connection').textContent=fail?'部分数据延迟':'数据源已连接';$('updated').textContent='最近读取：'+time(lastSuccess);$('notice').textContent=fail?`${fail} 场更新失败或被排除；保留上次已验证数据，请查看各场读取时间。`:'每 60 秒读取当前选举类型。已宣布胜选不等于官方认证。';busy=false;$('refresh').disabled=false;render();}
async function init(){const [map,rs]=await Promise.all([json('assets/map.json'),json('data/roster.json')]);roster=rs;const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','-65 0 1045 630');svg.setAttribute('role','group');svg.setAttribute('aria-label','美国50州和华盛顿特区');
 for(const g of map){const state=codes[g.id];if(!state)continue;names[state]=g.name;const path=document.createElementNS(ns,'path');path.setAttribute('d',g.path);path.setAttribute('tabindex','0');path.setAttribute('role','button');const title=document.createElementNS(ns,'title');title.textContent=g.name;path.append(title);path.addEventListener('pointerenter',()=>{if(!pinned){selected=state;render()}});const select=()=>{selected=state;pinned=true;render()};path.addEventListener('click',select);path.addEventListener('focus',()=>{if(!pinned){selected=state;render()}});path.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();select()}if(e.key==='Escape'){pinned=false;selected='';render()}});svg.append(path);paths.set(state,path)}$('map').append(svg);
 for(const state of Object.keys(names).sort((a,b)=>names[a].localeCompare(names[b]))){const o=text('option',`${state} · ${names[state]}`);o.value=state;$('state').append(o)}
 try{const seed=await json('data/results.json');for(const r of seed.races){const m=roster.find(x=>x.id===r.id);if(m&&validate(r,m))results.set(r.id,r)}$('connection').textContent='已载入保存的数据';$('updated').textContent='快照保存：'+time(seed.saved_at)}catch{$('notice').textContent='无本地快照，正在获取实时数据。'}
 try{portraits=await json('data/portraits.json')}catch{}
 render();refresh();setInterval(()=>{if(!document.hidden)refresh()},60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
}
$('refresh').onclick=refresh;$('state').onchange=e=>{selected=e.target.value;pinned=true;render()};document.querySelectorAll('[data-office]').forEach(b=>b.onclick=()=>{if(busy)return;office=b.dataset.office;pinned=false;document.querySelectorAll('[data-office]').forEach(x=>x.classList.toggle('active',x===b));render();refresh()});
init().catch(e=>{$('connection').textContent='页面数据加载失败';$('notice').textContent='请检查网络后重新加载。'+e.message});
