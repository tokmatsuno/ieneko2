const {readFileSync}=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=readFileSync(path.join(__dirname,'../gas/migration-proxy.js'),'utf8');
let target='https://script.google.com/macros/s/verified_target/exec',calls=[],status=200,body='{"ok":true,"public_id":"unchanged-public-id"}',contentType='application/json';
const context=vm.createContext({PropertiesService:{getScriptProperties:()=>({getProperty:()=>target})},UrlFetchApp:{fetch:(url,options)=>{calls.push({url,options});return{getResponseCode:()=>status,getContentText:()=>body,getHeaders:()=>({'Content-Type':contentType})};}},ContentService:{MimeType:{JSON:'json',CSV:'csv',JAVASCRIPT:'js'},createTextOutput:text=>({text,setMimeType(mime){this.mime=mime;return this;},downloadAsFile(filename){this.filename=filename;return this;}})}});
vm.runInContext(source,context);
const payload=JSON.stringify({api:'ieneko2',id:'same-record-id',consent:'public-cat-ccby-v1',test:true,region:'横浜市'});
let result=context.migrationProxy_({postData:{type:'text/plain',contents:payload}},'post');
assert.equal(result.text,body);assert.equal(result.mime,'json');assert.equal(calls.at(-1).options.payload,payload);assert.equal(calls.at(-1).options.contentType,'text/plain');
context.migrationProxy_({postData:{type:'text/plain',contents:payload}},'post');assert.equal(calls.at(-1).options.payload,calls.at(-2).options.payload);
context.migrationProxy_({queryString:'api=ieneko2&mode=receipt&id=same-record-id',parameter:{api:'ieneko2',mode:'receipt',id:'same-record-id'}},'get');assert(calls.at(-1).url.endsWith('?api=ieneko2&mode=receipt&id=same-record-id'));
context.migrationProxy_({parameters:{what:['cats'],tag:['遊び','おやつ']}},'get');assert(calls.at(-1).url.includes('what=cats&tag='+encodeURIComponent('遊び')+'&tag='+encodeURIComponent('おやつ')));
body='public_id,data_kind\nunchanged-public-id,responses\n';contentType='text/csv; charset=utf-8';result=context.migrationProxy_({parameter:{api:'ieneko2',mode:'csv'}},'get');assert.equal(result.text,body);assert.equal(result.filename,'ieneko-cats.csv');assert.equal(result.mime,'csv');
result=context.migrationProxy_({parameter:{api:'ieneko2',mode:'csv',proof:'1'}},'get');assert.equal(result.filename,'ieneko-cats-verification.csv');
result=context.migrationProxy_({parameter:{api:'ieneko2',mode:'beta-csv'}},'get');assert.equal(result.filename,'ieneko-five-towns-synthetic.csv');
contentType='application/javascript';body='validCallback({"ok":true});';result=context.migrationProxy_({parameter:{api:'ieneko2',callback:'validCallback'}},'get');assert.equal(result.text,body);assert.equal(result.mime,'js');
status=503;result=context.migrationProxy_({},'get');assert.equal(JSON.parse(result.text).ok,false);assert.equal(JSON.parse(result.text).error,'migration_upstream_http_503');
for(const invalid of ['', 'https://example.com/exec','https://script.google.com/macros/s/id/exec?redirect=other']){target=invalid;const before=calls.length;result=context.migrationProxy_({},'post');assert.equal(calls.length,before);assert.equal(JSON.parse(result.text).error,'migration_target_not_configured');}
console.log('PASS: former URL preserves request IDs, retries, legacy queries, public/verification CSV and JSONP; upstream failures and unconfigured targets cannot report success.');
