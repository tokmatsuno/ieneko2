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
let pointCases=0;
for(let a=0;a<=10;a++)for(let b=0;b<=10;b++)for(let c=0;c<=10;c++){
  const points=[a,b,c],result=input.score(points);
  assert.equal(result.ok,a+b+c>0);
  if(!result.ok)continue;
  pointCases++;
  assert.deepEqual(plain(result.points),points);
  assert.deepEqual(plain(model.percentages(result.answer)),plain(model.percentages(points)));
  assert.deepEqual(plain(input.savedPoints(points,result.answer)),points);
  assert.equal(Math.round(result.answer.weights.reduce((sum,v)=>sum+v,0)*1000),1000);
  assert.deepEqual(points,[a,b,c],'The input adapter must not change any raw point');
}
for(const values of [[11,0,0],[-1,5,5],[1.5,3,7],['10',0,0],[NaN,2,3],null,[1,2]])assert.equal(input.score(values).ok,false);
assert.deepEqual(plain(model.percentages(input.score([10,10,10]).answer)),[33.4,33.3,33.3]);
assert.deepEqual(plain(model.percentages(input.score([10,5,0]).answer)),[66.7,33.3,0]);
assert.equal(input.savedPoints([10,5,0],model.normalize([.2,.3,.5])),null,'Stale points must not replace saved weights');
const legacy=model.normalize([.002,.198,.8]),before=JSON.stringify(legacy);
assert.deepEqual(plain(input.suggestPoints(legacy)),[0,2,10]);
assert.equal(JSON.stringify(legacy),before,'Legacy suggestions must not mutate the original answer');
assert.deepEqual(plain(input.suggestPoints({choice:-1})),[0,0,0]);
const pawAnswers=[[10,5,0],[2,8,7],[0,1,10],[10,10,10],[7,3,9]].map(v=>input.score(v).answer);
const pawWeights=pawAnswers.map(a=>model.weights(a));
const pawRecord=vm.runInContext('OpenDataCore',context).record({id:'paw-input-verification',weights:pawWeights,region:'',event:'',grid:null,supports:[1],consent:'public-cat-ccby-v1',test:true},anchors,new Date('2026-11-01T00:00:00Z'));
const pawPoint=model.point(pawAnswers,quests);
assert(Math.abs(pawRecord.x-pawPoint.x)<.001);assert(Math.abs(pawRecord.y-pawPoint.y)<.001);
assert.deepEqual(plain(pawRecord.weights),plain(pawWeights));
const finalGraph=model.barsSVG(pawAnswers,true);
for(const text of ['A 66.7%','B 33.3%','C 0%','A 33.4%','C 47.4%'])assert(finalGraph.includes(text),'Final percentages must be text, visible without a hover tooltip');
console.log(`PASS: ${pointCases} nonzero paw combinations, zero/invalid rejection, exact final percentages, raw-point preservation, legacy weights and GAS coordinate compatibility.`);
console.log('PASS: raw 100/100/100 normalizes to exact 100%, integers/decimals/full-width input, invalid/zero totals rejected, and normalized answers retain existing saved weights and coordinate mapping.');
