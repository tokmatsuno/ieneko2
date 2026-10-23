const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),root=path.resolve(__dirname,'..');
const core=require('../beta-data-core.js'),read=n=>fs.readFileSync(path.join(root,n),'utf8'),ctx=vm.createContext({window:{}});
for(const f of ['quests.js','journey-model.js'])vm.runInContext(read(f),ctx);
const model=ctx.window.JourneyModel,cats=model.parse(read('dist/ieneko-100.csv')).map(r=>({no:+r.No,name:r['猫ネーム'],x:+r.X,y:+r.Y})),quests=model.connect(ctx.window.IENEKO_QUESTS,cats),towns=JSON.parse(read('ienekomap2/beta/towns.json'));
let seed=214202610;const rand=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};
const records=[];
const paths=Array.from({length:243},(_,n)=>{const choices=Array.from({length:5},(_,q)=>Math.floor(n/3**q)%3),p=model.point(choices,quests);return{choices,...p,quadrant:(p.y>=5?2:0)+(p.x>=5?1:0)};});
const outside=paths.filter(p=>p.quadrant===1),together=paths.filter(p=>p.quadrant===2).sort((a,b)=>a.x-b.x).slice(0,7),profiles=[[2,4],[5,3],[1,8],[1,3],[6,2]];
for(const [ti,town]of towns.entries())for(let i=0;i<18;i++){
 const scenario=i<profiles[ti][0]?outside[0]:i<profiles[ti][0]+profiles[ti][1]?together[(i+ti)%together.length]:null;
 const answers=Array.from({length:5},(_,q)=>{if(scenario){const remainder=i<profiles[ti][0]?1+(i%3):10+(i%3)*5;return model.normalize([0,1,2].map(k=>k===scenario.choices[q]?1000-2*remainder:remainder));}const values=town.bias.map((v,k)=>(.1+rand())*(v+.15+(i%4===k?.6:0)));return model.normalize(model.percentages(values));});
 const point=model.point(answers,quests),ref=model.nearest(point,cats),r={schema:core.SCHEMA,data_kind:core.KIND,sample_id:`beta214-${town.id}-${String(i+1).padStart(3,'0')}`,town_id:town.id,town_name:town.name,prefecture:town.prefecture,municipality:town.municipality,x:+point.x.toFixed(6),y:+point.y.toFixed(6),quadrant:(point.y>=5?2:0)+(point.x>=5?1:0),reference_cat_no:ref.no,reference_cat_name:ref.name};
 answers.forEach((a,q)=>a.weights.forEach((v,k)=>r[`q${q+1}_${['a','b','c'][k]}`]=+v.toFixed(3)));
 ['support_matatabi','support_churu','support_tower'].forEach((k,j)=>r[k]=Number(j===(i+ti)%3||rand()<(.18+town.bias[j]*.35)));
 r.license='CC BY 4.0';r.attribution=core.TEAM;records.push(r);
}
core.validate(records,towns);
const dataset={schema:core.SCHEMA,data_kind:core.KIND,title:'突撃隣の家猫ごはん 家猫MAPベータ版',generated_on:'2026-10-23',note:'5つの実在する町内会等の名称を借りた仮想データ。回答・施策案は合成で、実際の住民回答・参加・活動実績を表さない。',license:'CC BY 4.0',attribution:core.TEAM,towns:towns.map(({bias,...t})=>t),records};
const outputs={'ienekomap2/beta/data.json':JSON.stringify(dataset,null,2)+'\n','ienekomap2/beta/data.js':'window.IENEKO_BETA_DATA = '+JSON.stringify(dataset)+';\n','ienekomap2/beta/data/ieneko-five-towns-synthetic.csv':core.csv(records)};
for(const t of towns)outputs[`ienekomap2/beta/data/${t.id}-synthetic.csv`]=core.csv(records.filter(r=>r.town_id===t.id));
for(const [file,content]of Object.entries(outputs)){if(process.argv.includes('--check')){if(read(file)!==content)throw Error('Regenerate '+file);}else{fs.mkdirSync(path.dirname(path.join(root,file)),{recursive:true});fs.writeFileSync(path.join(root,file),content);}}
console.log(`PASS: ${records.length} explicitly synthetic records, ${towns.length} towns, ${records.length/towns.length} per town; CSV anchors preserved.`);
