const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict'),root=path.resolve(__dirname,'..');
const c=vm.createContext({window:{},document:{},console});for(const n of ['quests.js','journey-model.js','cat-studio.js'])vm.runInContext(fs.readFileSync(path.join(root,n),'utf8'),c);
const model=c.window.JourneyModel,studio=c.window.CatStudio,quests=c.window.IENEKO_QUESTS;
const local=value=>Array.from(value),percent=value=>local(model.percentages(value));
let edited=model.adjustWeights([1,1,1],0,60,0);
assert.deepEqual(percent(edited),[60,20,20]);
edited=model.adjustWeights(edited,1,25,0);
assert.deepEqual(percent(edited),[60,25,15],'second edit preserves the first amount');
edited=model.adjustWeights(edited,2,10,0);
assert.deepEqual(percent(edited),[60,30,10],'third edit preserves the first amount');
assert.deepEqual(percent(model.adjustWeights(edited,1,90,0)),[60,40,0],'limit to the remaining share');
assert.deepEqual(percent(model.adjustWeights(edited,0,80,2)),[80,10,10],'switch the kept answer');
assert.deepEqual(percent(model.adjustWeights([1,0,0],0,50,0)),[50,25,25],'moving 100% back distributes the rest');
assert.deepEqual(percent(model.adjustWeights([1,0,0],1,30,0)),[100,0,0],'a kept 100% leaves no remaining share');
assert.deepEqual(percent([1,1,1]),[33.4,33.3,33.3],'displayed tenths total 100%');
assert.deepEqual(percent(model.adjustWeights([.6,.3,.1],2,20)),[53.3,26.7,20],'released keep restores proportional distribution');
for(let keep=0;keep<3;keep++)for(let index=0;index<3;index++)for(const target of [0,.1,12.3,33.3,66.7,99.9,100]){
 const original=[.123,.456,.421],result=local(model.adjustWeights(original,index,target,keep)),units=result.map(v=>Math.round(v*1000));
 assert.equal(units.reduce((a,b)=>a+b,0),1000);assert(units.every(v=>v>=0&&v<=1000));
 if(keep!==index)assert.equal(units[keep],Math.round(original[keep]*1000));
 else assert.equal(units[index],Math.round(target*10));
}
assert.equal(model.adjustWeights([1,1,1],1,NaN),null);
console.log('PASS: sequential percentage edits keep the first value, allow switching/releasing it, handle all slider orders and 0/100% limits, and display exact tenths.');
const cats=model.parse(fs.readFileSync(path.join(root,'dist/ieneko-100.csv'),'utf8')).map(r=>({no:+r.No,name:r['猫ネーム'],x:+r.X,y:+r.Y}));model.connect(quests,cats);
const pure=Array.from({length:5},()=>({choice:0})),mix=pure.map(a=>({...a}));mix[0]=model.normalize([.45,.55,0]);mix[1]=model.normalize([0,.4,.6]);mix[2]=model.normalize([.3,.2,.5]);mix[3]=model.normalize([.4,.4,.2]);mix[4]=model.normalize([.2,.3,.5]);
const a=studio.derive(mix,quests),point=model.point(mix,quests);assert.equal(a.point.x,point.x);assert.equal(a.point.y,point.y);assert(a.blend.active);assert(!a.values.join().includes('undefined'));assert(studio.sources[a.finalPose]);
const one=model.point([model.normalize([1,0,0])],[quests[0]]),two=model.point([model.normalize([0,1,0])],[quests[0]]),mid=model.point([model.normalize([.5,.5,0])],[quests[0]]);assert.equal(mid.x,(one.x+two.x)/2);assert.equal(mid.y,(one.y+two.y)/2);
const ids=new Set();for(let i=0;i<=100;i++){const answers=pure.map(x=>({...x}));answers[0]=model.normalize([i/100,1-i/100,0]);const look=studio.derive(answers,quests);ids.add(look.signature);assert(Number.isFinite(look.point.x));assert(model.weights(answers[0]).reduce((v,n)=>v+n,0)>0.9999999);}
assert.equal(ids.size,101);
const left=structuredClone(mix),right=structuredClone(mix);left[0]=model.normalize([.5,.5,0]);right[0]=model.normalize([.501,.499,0]);const al=studio.derive(left,quests),ar=studio.derive(right,quests);
const samples=[];for(let y=.1;y<.95;y+=.1)for(let x=.1;x<.95;x+=.1){const l=studio.coatWeights(x,y,al,'hello',120),r=studio.coatWeights(x,y,ar,'hello',120);assert(l.every(n=>n>=-1e-9&&n<=1.000001));assert(Math.abs(l.reduce((v,n)=>v+n,0)-1)<1e-8);samples.push(l.reduce((v,n,i)=>v+Math.abs(n-r[i]),0));}assert(Math.max(...samples)<.3);
for(const family of [0,1,2])for(const pattern of [0,1,2]){const answers=[family,pattern,1,1,1].map(choice=>({choice})),p=studio.derive(answers,quests);assert(!p.blend.active);assert.equal(p.signature,answers.map(a=>a.choice+1).join(''));}
assert(model.describe(mix[0],quests[0]).includes('%'));assert(model.barsSVG(mix).includes('割合'));assert.equal(model.normalize({choice:-1}).choice,-1);
const colourMix=studio.derive([model.normalize([.6,.2,.2])],quests),dominant=[0,0,0];let distinct=0,total=0;
for(let y=.1;y<.95;y+=.02)for(let x=.2;x<.85;x+=.02){const w=studio.coatWeights(x,y,colourMix,'hello',120),max=Math.max(...w);dominant[w.indexOf(max)]++;if(max>.9)distinct++;total++;}
assert(dominant.every(n=>n>20),'mixed answers retain distinct white, black and ginger patches');assert(distinct/total>.7,'most fur uses a distinct pigment instead of uniform gray');
const skippedFirst=studio.derive([{choice:-1},{choice:2}],quests);assert.equal(skippedFirst.family,2);assert.equal(skippedFirst.choices[0],-1);
const referenceNames=new Set(cats.map(cat=>{const before=JSON.stringify(cat),look=studio.referenceAppearance(cat);assert.equal(JSON.stringify(cat),before);assert.equal(look.point.x,cat.x);assert.equal(look.point.y,cat.y);return look.name;}));assert.equal(referenceNames.size,9);
console.log('PASS: exact weighted anchor midpoints, 101 distinct positions/art signatures, stable intermediate pigments, old pure-answer behavior, skipped answers and non-diagnostic distribution chart.');
console.log('PASS: distinct pigment patches for 60/20/20 answers, fur after a skipped first question, and 9 reference coats without source-coordinate changes.');
