const {readFileSync}=require('node:fs');
const vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const csv=readFileSync(path.join(root,'dist/ieneko-100.csv'),'utf8');
const app=readFileSync(path.join(root,'app.js'),'utf8').replace(/init\(\);\s*$/,'');
function makeContext(fetch){
  const context=vm.createContext({window:{},document:{},crypto:{},console,fetch,location:{protocol:'file:'}});
  vm.runInContext(readFileSync(path.join(root,'quests.js'),'utf8'),context);vm.runInContext(readFileSync(path.join(root,'journey-model.js'),'utf8'),context);vm.runInContext(app,context);
  return context;
}
(async()=>{
  let networkCalls=0;
  const local=makeContext(async()=>{networkCalls++;throw new Error('local file fetch is blocked');});
  vm.runInContext(readFileSync(path.join(root,'cat-data.js'),'utf8'),local);
  assert.equal(local.window.IENEKO_CAT_CSV,csv);
  const cats=await local.loadCatData();
  assert.equal(networkCalls,0);
  assert.equal(cats.length,100);
  assert.equal(new Set(cats.map(c=>c.no)).size,100);
  assert(cats.every(c=>Object.keys(c.raw).length===20&&c.name&&Number.isFinite(c.x)&&Number.isFinite(c.y)));
  local.data=cats;
  vm.runInContext('cats=data;connectChoiceAnchors();',local);
  assert(vm.runInContext('QUESTS.every(q=>q.answers.every(a=>a.anchorName&&Number.isFinite(a.x)&&Number.isFinite(a.y)))',local));

  let fallbackCalls=0;
  const fallback=makeContext(async url=>{assert.equal(url,'dist/ieneko-100.csv');fallbackCalls++;return{ok:true,text:async()=>csv};});
  assert.equal((await fallback.loadCatData()).length,100);
  assert.equal(fallbackCalls,1);
  const missing=makeContext(async()=>({ok:false}));
  await assert.rejects(missing.loadCatData(),/csv/);
  const denied=makeContext(async()=>{throw new Error('network blocked');});
  await assert.rejects(denied.loadCatData(),/network blocked/);
  const invalid=makeContext(async()=>{throw new Error('should not fetch invalid bundled data');});
  invalid.window.IENEKO_CAT_CSV=csv.split('\n').slice(0,3).join('\n');
  await assert.rejects(invalid.loadCatData(),/invalid_data/);
  const duplicate=csv.replace(/^2,/m,'1,');
  invalid.window.IENEKO_CAT_CSV=duplicate;
  await assert.rejects(invalid.loadCatData(),/invalid_data/);
  console.log('PASS: exact 100-cat/20-field bundle; local-file data loading without fetch; all question anchors; HTTP fallback; missing, blocked, incomplete and duplicate data rejected.');
})().catch(error=>{console.error(error);process.exitCode=1;});
