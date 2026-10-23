const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
let csvBad=false,exposeCat=true,record=null,posts=0;const store=new Map();
const ctx=vm.createContext({window:{IENEKO_CONFIG:{openDataUrl:'https://example.test/exec'}},URL,AbortController,setTimeout,clearTimeout,crypto:{randomUUID:()=> 'private-client-record'},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},fetch:async(url,options)=>{
  if(options.method==='POST'){posts++;record=JSON.parse(options.body);return{};}
  const p=new URL(url).searchParams,cat=record?{public_id:'separate-public-cat',reference_cat_no:1,reference_cat_name:'テスト猫',x:5,y:5,weights:record.weights,supports:record.supports}:null;
  if(p.get('mode')==='csv'){assert.equal(p.get('public_id'),cat.public_id);assert.equal(p.get('proof'),'1');return{ok:true,text:async()=>csvBad?'broken csv':ctx.PublicCatData.csv([cat],true)};}
  return{ok:true,json:async()=>p.get('mode')==='health'?{ok:true,service:'ienekomap2',ready:true,public_cat_schema:ctx.PublicCatData.SCHEMA}:p.get('mode')==='receipt'?{ok:true,accepted:true,published:true,test:true,public_id:cat.public_id}:{schema:ctx.PublicCatData.SCHEMA,data_kind:'verification',cats:exposeCat?[cat]:[]}};
}});
for(const name of ['opendata-core.js','public-cat-data.js','map-data-client.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',name),'utf8'),ctx);
const fields={weights:Array.from({length:5},()=>[0,1,0]),region:'',event:'',grid:null,supports:[1],consent:'public-cat-ccby-v1',test:true},anchors=Array.from({length:5},()=>[[1,1],[5,5],[9,9]]),api=ctx.MapDataClient;
(async()=>{
  let result=await api.contribute(fields,anchors);assert.equal(result.published,true);assert.equal(result.public_id,'separate-public-cat');assert.equal(result.synced,true);
  csvBad=true;await assert.rejects(api.contribute(fields,anchors),/公開CSVの内容/);
  csvBad=false;exposeCat=false;await assert.rejects(api.contribute(fields,anchors),/公開CSVへの反映/);
  exposeCat=true;result=await api.contribute(fields,anchors);assert.equal(result.id,'private-client-record');assert.equal(posts,4);
  assert.equal(api.previous({...fields,consent:'aggregate-ccby-v1'}),undefined,'A previous aggregate consent cannot publish an individual cat');
  console.log('PASS: save completion requires both public JSON and exact public CSV; mismatched CSV or unpublished cat fails; same ID retained on retry; consent scopes separated.');
})().catch(error=>{console.error(error);process.exitCode=1;});
