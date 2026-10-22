const {readFileSync} = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const context = vm.createContext({window:{},document:{},crypto:{},console});
vm.runInContext(readFileSync(path.join(root,'cat-studio.js'),'utf8'),context);
vm.runInContext(readFileSync(path.join(root,'app.js'),'utf8').replace(/init\(\);\s*$/, ''),context);
context.csv = readFileSync(path.join(root,'dist/ieneko-100.csv'),'utf8');
vm.runInContext('cats=parseCSV(csv);connectChoiceAnchors();',context);
const studio=context.window.CatStudio;
const quests=vm.runInContext('QUESTS',context);
const as = values=>values.map(choice=>({choice}));
const base=as([0,0,0,0,0]);
const a=studio.derive(base,quests,{x:2,y:2});
// Changing one answer changes only its authored visual trait at a fixed quadrant.
for(let i=0;i<5;i++) {
 const next=as([0,0,0,0,0]); next[i].choice=1;
 const b=studio.derive(next,quests,{x:2,y:2});
 assert.notEqual(a.values[i],b.values[i]);
 for(let j=0;j<5;j++) if(i!==j) assert.equal(a.values[j],b.values[j]);
 assert.notEqual(studio.svg(a),studio.svg(b));
}
const quadrants=[[2,2],[8,2],[2,8],[8,8]].map(([x,y])=>studio.derive(base,quests,{x,y}));
for(const part of ['fur','dark','eye','ink']) assert.equal(new Set(quadrants.map(a=>a.theme[part])).size,4);
assert.equal(new Set(quadrants.map(a=>a.iris)).size,4);
const art=new Set(),results=new Map();
for(let n=0;n<243;n++) {
 let k=n; const choices=Array.from({length:5},()=>{const c=k%3;k=Math.floor(k/3);return c;});
 const answers=as(choices),look=studio.derive(answers,quests);
 art.add(studio.svg(look).replace(/aria-label="[^"]*"/, ""));
 assert(!studio.svg(look).includes('undefined'));
 results.set(look.theme.key,(results.get(look.theme.key)||0)+1);
 context.answerJSON=JSON.stringify(answers);
 const cat=vm.runInContext('state.answers=JSON.parse(answerJSON);chooseCat()',context);
 assert(cat && cat.no>=1 && cat.no<=100);
}
assert.equal(art.size,243);
for(const answers of [[],as([-1,-1,-1,-1,-1]),as([0,-1,1])]) {
 const look=studio.derive(answers,quests);
 assert(Number.isFinite(look.point.x));assert(!studio.svg(look).includes('undefined'));
}
assert.match(studio.svg(a,{clock:true}),/clock-minute/);
assert.match(studio.svg(a,{clock:true}),/studio-tail/);
console.log('PASS: independent traits, 4 palettes, 243 unique cats, nearest-cat results, skipped/partial answers, clock layers');
console.log('Completed-answer palette distribution:',Object.fromEntries(results));
