const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const core=require('../card-identity.js'),collection=require('../card-collection.js'),dj=require('../dj-core.js'),data=require('../music/playlist.json');
class Element{
  constructor(){this.value='';this.textContent='';this.innerHTML='';this.dataset={};this.disabled=false;this.attrs={};this.listeners=new Map();this.style={setProperty(){}};this.inputs=[];}
  setAttribute(k,v){this.attrs[k]=v;}addEventListener(k,fn){this.listeners.set(k,fn);}querySelectorAll(){return this.inputs;}focus(){}select(){}remove(){}click(){this.clicked=true;}
  emit(name,event={}){return this.listeners.get(name)?.(event);}
}
const elements=new Map(),get=selector=>{if(!elements.has(selector))elements.set(selector,new Element());return elements.get(selector);};
const docEvents=new Map(),storage=new Map(),timers=new Map(),renders=[],downloads=[],shares=[];
let serial=0,shareMode='ok';
storage.set('ieneko2-card-profile-v1',JSON.stringify({nickname:'初めの猫',likes:['ギター']}));
const doc={readyState:'complete',querySelector:get,querySelectorAll:selector=>selector==='#cardLikeOptions input:checked'?get('#cardLikeOptions').inputs.filter(i=>i.checked):[],
 addEventListener:(name,fn)=>docEvents.set(name,fn),dispatchEvent:e=>docEvents.get(e.type)?.(e),body:{append(){}},createElement:()=>{const e=new Element();e.click=()=>downloads.push({name:e.download,url:e.href});return e;}};
const nav={canShare:()=>true,share:args=>{shares.push(args);return shareMode==='ok'?Promise.resolve():Promise.reject(Object.assign(new Error('cancelled'),{name:'AbortError'}));},clipboard:{writeText:async()=>{}}};
const context=vm.createContext({window:{CardIdentity:core,CardCollection:collection,DJCore:dj,IENEKO_PLAYLIST:data},document:doc,navigator:nav,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
 CatStudio:{render:async()=> 'data:image/png;base64,art'},CardRenderer:{render:(card,art,format)=>new Promise((resolve,reject)=>renders.push({card,art,format,resolve,reject}))},
 URL:{createObjectURL:blob=>'blob:'+blob.id,revokeObjectURL(){}},File:class{constructor(parts,name,options){this.parts=parts;this.name=name;this.type=options.type;}},
 CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}},setTimeout:(fn,ms)=>{const id=++serial;if(ms===180)timers.set(id,fn);return id;},clearTimeout:id=>timers.delete(id),console});
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../card-ui.js'),'utf8'),context);
const tick=async()=>{for(let n=0;n<8;n++)await Promise.resolve();};
const look={theme:{ink:'#123456',gold:'#bca876'},finalPose:'hello',signature:'12321'},next=name=>({cat:{no:64,name},look,answers:[{choice:0},{choice:0},{choice:0},{choice:1}]});
async function finishLast(id){await tick();const r=renders.at(-1);r.resolve({blob:{id},width:1080,height:1350});await tick();}
(async()=>{
 const ui=context.window.CardUI;
 ui.update(next('最初のタイプ'));await tick();assert.equal(get('#downloadCard').disabled,true);assert.equal(get('#shareCardLine').attrs['aria-disabled'],'true');
 get('#cardNickname').value='最新の猫';get('#cardStatusInput').value='のんびり見学';get('#cardCustomLike').value='朝のお茶';get('#cardLikeOptions').inputs=[{value:'読書',checked:true},{value:'おやつ',checked:false}];
 get('#cardEditor').emit('input');assert.equal(ui.profile().nickname,'最新の猫');assert.deepEqual(Array.from(ui.profile().likes),['読書']);assert.equal(storage.size,1,'Card editing writes only its dedicated local key.');
 for(const fn of [...timers.values()])fn();timers.clear();await tick();assert.equal(renders.length,2);
 renders[1].resolve({blob:{id:'latest'},width:1080,height:1350});await tick();assert.equal(get('#cardPreview').src,'blob:latest');assert.equal(get('#downloadCard').disabled,false);assert(get('#cardPreview').alt.includes('最新の猫'));
 renders[0].resolve({blob:{id:'stale'},width:1080,height:1350});await tick();assert.equal(get('#cardPreview').src,'blob:latest','A slow earlier paint must not replace the edited card.');
 await get('#shareCardImage').emit('click');assert.equal(shares.length,1);assert.equal(shares[0].files[0].parts[0].id,'latest');assert(shares[0].text.includes('最新の猫'));assert(!get('#cardShareStatus').textContent.includes('投稿しました'));
 shareMode='cancel';await get('#shareCardImage').emit('click');assert(get('#cardShareStatus').textContent.includes('キャンセル'));assert.equal(downloads.length,0,'Cancelling native share must not download unexpectedly.');
 nav.canShare=()=>false;await get('#shareCardImage').emit('click');assert.equal(downloads.length,1);assert.equal(downloads[0].url,'blob:latest');assert(get('#cardShareStatus').textContent.includes('画像を保存'));
 get('#downloadInstagram').emit('click');assert.equal(downloads.at(-1).name,'ieneko-instagram.png');assert.equal(downloads.at(-1).url,'blob:latest','Instagram must save exactly the same prepared card image.');
 get('#collectCard').emit('click');assert.equal(collection.load(context.localStorage).length,1);assert.equal(collection.load(context.localStorage)[0].code,'IENEKO-064-12321');
 assert(!elements.has('#cardFormat'));assert.equal(renders.length,2);
 get('#cardInvitation').value='小さな試食会';get('#cardContribution').value='写真で記録すること';get('#cardPlace').value='途中で帰ってもいい場所';get('#cardEditor').emit('input');assert.equal(ui.profile().invitation,'小さな試食会');assert.equal(ui.profile().contribution,'写真で記録すること');assert.equal(ui.profile().place,'途中で帰ってもいい場所');assert.equal(storage.size,2);assert(storage.has('ieneko2-card-profile-v1'));assert(storage.has(collection.KEY));
 doc.dispatchEvent(new context.CustomEvent('ieneko:favorite-track',{detail:{id:'panama'}}));await finishLast('song');assert.equal(ui.getCard().track.title,'Panama');
 doc.dispatchEvent(new context.CustomEvent('ieneko:favorite-track',{detail:{id:''}}));await finishLast('no-song');assert.equal(ui.getCard().track,null);
 console.log('PASS: profile edits read all selected hobbies, delayed renders cannot overwrite edits, prepared image files reach native share, cancellation stays unsent, unsupported share downloads, Instagram saves the same card, the format selector is removed, new card fields remain local, and selected songs can be removed.');
})().catch(e=>{console.error(e);process.exitCode=1;});
