const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const core=require('../lifestyle-core.js'),csvCore=require('../region-data-core.js'),root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8'),data=JSON.parse(read('lifestyle-data/data.json'));
assert.equal(data.datasets.length,3);assert.equal(data.records.length,35);assert.equal(data.files.length,6);
assert.equal(new Set(data.records.map(r=>r.key)).size,35);
for(const f of data.files){const raw=fs.readFileSync(path.join(root,'lifestyle-data/raw',f.name));assert.equal(raw.length,f.bytes);assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),f.sha256);}
const get=k=>core.record(data,k);
assert.equal(get('gardening').value,26);assert.equal(get('cooking').value,19);assert.equal(get('instrument').value,10.2);assert.equal(get('music').value,53.5);assert.equal(get('reading').value,31.6);assert.equal(get('volunteer_town').value,7.4);
assert.equal(get('music').source_locator,'A00400!V8;V11');assert.equal(get('companions').count,4430);assert.equal(get('hobby_fulfilment').count,5973);assert.equal(get('opportunity').count,1075);
for(const r of data.records){assert(r.source_url.startsWith('https://'));assert(r.source_locator);assert(r.population);assert(r.denominator);assert(Number.isFinite(r.value));assert(r.value>=0);if(r.unit==='percent')assert(r.value<=100);if(r.unit==='mean_0_10')assert(r.value<=10);}
for(const r of data.records.filter(r=>r.dataset_id==='sociallife2021')){assert.equal(r.year,2021);assert.equal(typeof r.denominator,'string');assert(r.population.includes('10歳以上'));}
const current=data.records.filter(r=>r.table.startsWith('問7')),desired=data.records.filter(r=>r.table.startsWith('問8'));
assert.equal(current.length,5);assert.equal(desired.length,6);for(const rows of [current,desired]){assert(Math.abs(rows.reduce((n,r)=>n+r.value,0)-100)<1e-9);assert(rows.every(r=>r.denominator===1732));}
assert.equal(get('greeting').value,21.4);assert.equal(get('missing').value,1.7);assert.equal(get('balance_mean').value,5.56);assert.equal(get('connection_mean').value,5.43);assert.equal(get('fun_mean').value,5.78);
for(const r of data.records.filter(r=>r.response_type==='multiple')){assert.equal(r.denominator,10632);assert(Math.abs(r.value-r.count/10632*100)<1e-10);}
assert(data.records.filter(r=>r.response_type==='multiple').reduce((n,r)=>n+r.value,0)>100,'Do not force multi-response values to sum to 100.');
const values=csvCore.parseCSV(read('lifestyle-data/ieneko-lifestyle-reference.csv'));assert.equal(values.length,35);for(const r of data.records){const csv=values.find(v=>v.key===r.key);assert.equal(+csv.value,r.value);assert.equal(csv.source_locator,r.source_locator);assert.equal(csv.unit,r.unit);}
const context=vm.createContext({window:{}});vm.runInContext(read('lifestyle-data.js'),context);assert.deepEqual(JSON.parse(JSON.stringify(context.window.IENEKO_LIFESTYLE_DATA)),data);
assert.equal(core.propose({},data).ready,false);assert.equal(core.propose({interest:'gardening',relation:'chat'},data).ready,false);assert.deepEqual(core.normalize({interest:'<script>',relation:'unknown',priority:null}),{interest:'',relation:'',priority:''});
const before=JSON.stringify(data),outputs=new Set();
for(const interest of core.INTERESTS)for(const relation of core.RELATIONS)for(const priority of core.PRIORITIES){const p=core.propose({interest:interest.id,relation:relation.id,priority:priority.id},data);assert(p.ready);assert.equal(p.tools.length,3);assert.equal(p.status,'authored_proposal_unverified');assert.equal(p.references.length,3);assert(p.references.every(Boolean));assert.equal(p.references[0].key,interest.id);assert.equal(p.references[1].key,relation.id);assert.equal(p.references[2].key,priority.id);assert(p.tools[2].text.includes(priority.detail));outputs.add(JSON.stringify(p.tools));if(relation.id==='none'){assert.equal(p.title,'今日は、案内を眺めるだけ。');assert(p.tools[0].text.includes('持ち帰る'));assert(p.tools[2].text.includes('参加や連絡先の登録を求めない'));}}
// The non-participation choice deliberately shares guidance across all hobbies.
assert.equal(outputs.size,147);assert.equal(JSON.stringify(data),before);
const ui=read('lifestyle-ui.js');assert(!/fetch\(|MapDataClient|localStorage|sendBeacon|XMLHttpRequest/.test(ui),'Exploration filters must not transmit or silently collect new answers.');
const beta=read('ienekomap2/beta/index.html');assert(beta.indexOf('id="lifestyle"')<beta.indexOf('id="regions"'));assert(beta.includes('<details id="regional-background"'));assert(beta.indexOf('option value="answers"')<beta.indexOf('option value="demographics"'));
console.log('PASS: 3 official datasets, 6 immutable files, 35 source-located values, exact CSV/JS round trips, units/denominators, and 180 selection combinations with no new data transmission.');
