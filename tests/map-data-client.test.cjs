const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../map-data-client.js'),'utf8');
function client(fetch,reply={ok:true,service:'ienekomap2',ready:true}){
  let appended=0;const window={IENEKO_CONFIG:{openDataUrl:'https://example.test/exec'}},document={createElement:()=>({remove(){}}),head:{append(script){appended++;const callback=new URL(script.src).searchParams.get('callback');window[callback](reply);}}};
  const context=vm.createContext({window,document,fetch,URL,AbortController,setTimeout,clearTimeout,console});vm.runInContext(source,context);return{api:context.MapDataClient,window,appended:()=>appended};
}
(async()=>{
  let requests=0;const direct=client(async(url,options)=>{requests++;const u=new URL(url);assert.equal(u.searchParams.get('api'),'ieneko2');assert.equal(u.searchParams.get('mode'),'receipt');assert.equal(u.searchParams.get('id'),'verification-record');assert.equal(u.searchParams.has('callback'),false);assert.equal(options.credentials,'omit');return{ok:true,json:async()=>({ok:true,accepted:true,test:true})};});
  assert.equal((await direct.api.get({mode:'receipt',id:'verification-record'})).accepted,true);assert.equal(requests,1);assert.equal(direct.appended(),0);
  const fallback=client(async()=>{throw Error('network');});assert.equal((await fallback.api.get({mode:'health'})).ready,true);assert.equal(fallback.appended(),1);
  const denied=client(async()=>({ok:true,json:async()=>({ok:false,error:'collection_not_configured'})}));await assert.rejects(denied.api.get({mode:'health'}),/collection_not_configured/);assert.equal(denied.appended(),0);
  const invalid=client(async()=>({ok:true,json:async()=>[]}));await assert.rejects(invalid.api.get({mode:'aggregate'}),/応答形式/);
  const unconfigured=client(async()=>{throw Error('unexpected');});unconfigured.window.IENEKO_CONFIG.openDataUrl='';await assert.rejects(unconfigured.api.get({mode:'health'}),/未設定/);
  console.log('PASS: direct JSON reads and receipts without external scripts, JSONP fallback on transport failure, explicit server errors, invalid responses and missing configuration.');
})().catch(error=>{console.error(error);process.exitCode=1;});
