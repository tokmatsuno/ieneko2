const {readFileSync}=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),context=vm.createContext({window:{},document:{},crypto:{},console});
vm.runInContext(readFileSync(path.join(root,'cat-studio.js'),'utf8'),context);
vm.runInContext(readFileSync(path.join(root,'app.js'),'utf8').replace(/init\(\);\s*$/,''),context);
context.csv=readFileSync(path.join(root,'dist/ieneko-100.csv'),'utf8');vm.runInContext('cats=parseCSV(csv);connectChoiceAnchors();',context);
const studio=context.window.CatStudio,quests=vm.runInContext('QUESTS',context),as=values=>values.map(choice=>({choice})),look=values=>studio.derive(as(values),quests);
const names=new Set();for(let family=0;family<3;family++)for(let pattern=0;pattern<3;pattern++)names.add(look([family,pattern,0,0,0]).name);
assert.equal(names.size,9);for(const name of ['白猫','黒猫','茶猫','三毛猫'])assert(names.has(name));
const fields=values=>{const a=look(values),out=[];for(let y=0;y<1;y+=.04)for(let x=0;x<1;x+=.04)out.push(studio.coatWeights(x,y,a,'hello',120).map(v=>v.toFixed(3)).join(','));return out.join('|');};
assert.notEqual(fields([0,2,0,0,0]),fields([0,2,1,0,0]));
assert.notEqual(fields([0,2,0,0,0]),fields([0,2,0,2,0]));
assert.notEqual(fields([0,2,0,0,0]),fields([0,2,0,0,1]));
const source=new Uint8ClampedArray(4*8*4),samples=[[0,[90,85,80,254]],[1,[247,234,205,254]],[2,[220,140,145,254]],[3,[12,11,10,254]],[4,[250,245,235,254]],[5,[90,85,80,0]],[6,[220,170,30,254]]];
for(const [n,p]of samples)source.set(p,n*4);
const white=source.slice(),black=source.slice(),ginger=source.slice(),unchanged=source.slice();
studio.recolor(white,4,8,look([0,0,0,0,1]),'hello');studio.recolor(black,4,8,look([1,0,0,0,1]),'hello');studio.recolor(ginger,4,8,look([2,0,0,0,1]),'hello');studio.recolor(unchanged,4,8,look([]),'hello');
assert(white[0]>black[0]+100);assert(ginger[0]>ginger[2]+40);assert(black[4]<source[4]-100);assert.notDeepEqual([...white.slice(24,27)],[...source.slice(24,27)]);assert.deepEqual([...unchanged],[...source]);
for(const rendered of [white,black,ginger]){for(const n of [2,3,5])assert.deepEqual([...rendered.slice(n*4,n*4+4)],[...source.slice(n*4,n*4+4)]);for(let i=3;i<source.length;i+=4)assert.equal(rendered[i],source[i]);}
const ids=new Set();for(let n=0;n<243;n++){let k=n;const choices=Array.from({length:5},()=>{const c=k%3;k=Math.floor(k/3);return c;}),a=look(choices);ids.add(a.signature);assert(studio.sources[a.finalPose]);assert(!a.values.join('').includes('undefined'));context.answerJSON=JSON.stringify(as(choices));const cat=vm.runInContext('state.answers=JSON.parse(answerJSON);chooseCat()',context);assert(cat&&cat.no>=1&&cat.no<=100);}
assert.equal(ids.size,243);for(const values of [[],[-1,-1,-1,-1,-1],[0,-1,1]]){const a=look(values);assert(Number.isFinite(a.point.x));assert(studio.sources[a.finalPose]);}
assert.equal(Object.values(studio.sources).length,14);assert(Object.values(studio.sources).every(src=>src.endsWith('.png')));
console.log('PASS: 9 coat types including white/black/ginger/calico; route changes pattern placement, area and asymmetry; 243 routes; original style and 14 poses; actual pigment changes; preserved skin/ink/alpha; skipped answers.');

const allPoses=new Set(studio.quadrants.flatMap(q=>q.poses));
for(const key of Object.keys(studio.sources)){assert(allPoses.has(key));assert(studio.poseNames[key]);assert(readFileSync(path.join(root,studio.sources[key])).length>1000);}
for(const [i,point] of [[0,{x:2,y:2}],[1,{x:8,y:2}],[2,{x:2,y:8}],[3,{x:8,y:8}]]){const observed=new Set();for(let seed=0;seed<243;seed++){const pose=studio.poseFor(point,seed);assert(studio.quadrants[i].poses.includes(pose));observed.add(pose);}assert.equal(observed.size,studio.quadrants[i].poses.length);}
const auto=look([0,2,1,0,2]),car=studio.withPose(auto,'sports-car');assert.equal(car.finalPose,'sports-car');assert.equal(auto.name,car.name);assert.equal(auto.signature,car.signature);assert.deepEqual(auto.point,car.point);for(const n of [0,1,2,4])assert.equal(car.values[n],auto.values[n]);assert.equal(studio.withPose(auto,'invalid'),auto);
assert(studio.protectedProp(.5,.8,'sports-car'));assert(!studio.protectedProp(.6,.2,'sports-car'));assert(studio.protectedProp(.5,.9,'scooter'));assert(studio.protectedProp(.5,.6,'reading'));
vm.runInContext(readFileSync(path.join(root,'version.js'),'utf8'),context);const release=context.window.IENEKO_RELEASE;const html=readFileSync(path.join(root,'index.html'),'utf8'),changelog=readFileSync(path.join(root,'CHANGELOG.md'),'utf8');assert.match(release.version,/^\d+\.\d{2}$/);assert(html.includes('id="appVersion">ver'+release.version));assert(html.includes(release.team));assert(changelog.includes('## ver'+release.version));assert(html.includes('version.js?v='+release.version));
console.log('PASS: 14 available scenes, 4 quadrant pools, deterministic pose choices, photo overrides preserve all answer traits and coordinates, prop protection, footer and release version consistency.');
