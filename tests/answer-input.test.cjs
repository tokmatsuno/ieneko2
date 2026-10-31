const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),context=vm.createContext({window:{}});
for(const file of ['journey-model.js','answer-input.js','quests.js','opendata-core.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);
const model=context.window.JourneyModel,input=context.window.AnswerInput,plain=value=>JSON.parse(JSON.stringify(value));
const cases=[
  [['100','100','100'],[33.4,33.3,33.3]],
  [['100','100','0'],[50,50,0]],
  [['100','50','0'],[66.7,33.3,0]],
  [['２０','３０','５０'],[20,30,50]],
  [['0.5','1.5','3'],[10,30,60]],
  [['','50',''],[0,100,0]],
];
for(const [values,expected]of cases){
  const result=input.parse(values);assert(result.ok);assert.deepEqual(plain(result.percentages),expected);
  const saved=model.normalize(result.percentages);assert.deepEqual(plain(model.percentages(saved)),expected);
  assert.equal(Math.round(saved.weights.reduce((sum,value)=>sum+value,0)*1000),1000);
}
for(const values of [['0','0','0'],['','',''],['-1','30','70'],['101','0','0'],['1e2','0','0'],['NaN','0','0'],['Infinity','0','0'],['3cats','0','0'],['1','2']])assert.equal(input.parse(values).ok,false);
assert.deepEqual(plain(input.fromWeights([1,1,1])),[33.4,33.3,33.3]);
assert.deepEqual(plain(input.fromWeights([.6,.3,.1])),[60,30,10]);
for(const weights of [[.002,.198,.8],[.3334,.3333,.3333],[0,0,1]]){
  const displayed=input.fromWeights(weights);
  assert.deepEqual(plain(input.parse(displayed).percentages),plain(model.percentages(weights)));
}
const cats=model.parse(fs.readFileSync(path.join(root,'dist/ieneko-100.csv'),'utf8')).map(row=>({no:+row.No,name:row['猫ネーム'],x:+row.X,y:+row.Y}));
const quests=model.connect(context.window.IENEKO_QUESTS,cats),anchors=quests.map(q=>q.answers.map(a=>[a.x,a.y]));
const inputs=[['100','100','100'],['100','50','0'],['10','20','70'],['0','100','100'],['50','0','100']];
const answers=inputs.map(values=>model.normalize(input.parse(values).percentages)),weights=answers.map(answer=>model.weights(answer));
const record=vm.runInContext('OpenDataCore',context).record({id:'numeric-input-verification',weights,region:'',event:'',grid:null,supports:[1],consent:'public-cat-ccby-v1',test:true},anchors,new Date('2026-11-01T00:00:00Z'));
const point=model.point(answers,quests);assert(Math.abs(record.x-point.x)<.001);assert(Math.abs(record.y-point.y)<.001);
assert.deepEqual(plain(record.weights),plain(weights));assert.equal(record.test,true);
console.log('PASS: raw 100/100/100 normalizes to exact 100%, integers/decimals/full-width input, invalid/zero totals rejected, and normalized answers retain existing saved weights and coordinate mapping.');
