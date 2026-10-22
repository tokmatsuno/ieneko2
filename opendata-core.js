/* Anonymous response aggregation shared with the collection service. */
var OpenDataCore=(function(){
  const SCHEMA='ieneko-opendata-1.0',K=5,TEAM='2026年度東京大学シビックテックデザイン学講座Team 1';
  function normalizeWeights(value){if(value===null)return null;if(!Array.isArray(value)||value.length!==3||value.some(v=>typeof v!=='number'||!Number.isFinite(v)||v<0||v>1.000001))throw Error('回答の配分が正しくありません。');const sum=value.reduce((a,b)=>a+b,0);if(sum<.999||sum>1.001)throw Error('回答の配分は合計100%にしてください。');return value.map(v=>v/sum);}
  function grid(lat,lon){if(!Number.isFinite(lat)||!Number.isFinite(lon)||lat<20||lat>46||lon<122||lon>154)throw Error('地図上で日本国内の活動地域を選んでください。');return{lat:Math.round((Math.floor(lat*100)/100+.005)*1000)/1000,lon:Math.round((Math.floor(lon*100)/100+.005)*1000)/1000};}
  function record(input,anchors,now=new Date()){
    if(input?.consent!=='aggregate-ccby-v1')throw Error('公開集計への同意を確認してください。');
    if(!/^[a-zA-Z0-9_-]{12,80}$/.test(input.id||''))throw Error('記録IDが正しくありません。');
    if(!Array.isArray(input.weights)||input.weights.length!==5)throw Error('5つの問いの回答が必要です。');
    const weights=input.weights.map(normalizeWeights),points=weights.map((w,i)=>w?{x:w.reduce((v,n,k)=>v+n*anchors[i][k][0],0),y:w.reduce((v,n,k)=>v+n*anchors[i][k][1],0)}:null).filter(Boolean);
    const x=points.length?points.reduce((v,p)=>v+p.x,0)/points.length:5,y=points.length?points.reduce((v,p)=>v+p.y,0)/points.length:5;
    const region=String(input.region||'').trim(),event=String(input.event||'').trim();
    if(region&&!/^[ぁ-んァ-ヶ一-龯々ヶー]{1,23}[市区町村]$/u.test(region))throw Error('地域名は市区町村名までにしてください（番地・氏名は入力しません）。');
    if(!/^[a-zA-Z0-9_-]{0,32}$/.test(event))throw Error('イベントIDは半角英数字・ハイフン・下線で32文字以内です。');
    const cell=input.grid===null||input.grid===undefined?null:grid(Number(input.grid.lat),Number(input.grid.lon));
    const supports=Array.isArray(input.supports)?[...new Set(input.supports.filter(v=>Number.isInteger(v)&&v>=0&&v<3))]:[];
    return{id:input.id,month:new Date(now.getTime()+9*3600000).toISOString().slice(0,7),region,event,x,y,weights,grid:cell,supports,consent:'aggregate-ccby-v1',test:input.test===true};
  }
  function aggregate(records,min=K){
    const bins=new Map();
    for(const r of records){if(r.test)continue;const zx=Math.min(4,Math.max(0,Math.floor(r.x/2))),zy=Math.min(4,Math.max(0,Math.floor(r.y/2))),key=JSON.stringify([r.month,r.event,r.region,r.grid?.lat??null,r.grid?.lon??null,zx,zy]);
      if(!bins.has(key))bins.set(key,{month:r.month,event:r.event,region:r.region,lat:r.grid?.lat??null,lon:r.grid?.lon??null,zone_x:zx,zone_y:zy,n:0,mean_x:0,mean_y:0,weight_sums:Array.from({length:5},()=>[0,0,0]),question_n:[0,0,0,0,0],support_counts:[0,0,0],support_n:0});
      const b=bins.get(key);b.n++;b.mean_x+=r.x;b.mean_y+=r.y;
      r.weights.forEach((w,i)=>{if(w){b.question_n[i]++;w.forEach((v,j)=>b.weight_sums[i][j]+=v);}});
      if(r.supports.length)b.support_n++;r.supports.forEach(i=>b.support_counts[i]++);
    }
    return [...bins.values()].filter(b=>b.n>=min).map(b=>({...b,mean_x:b.mean_x/b.n,mean_y:b.mean_y/b.n,weights:b.weight_sums.map((w,i)=>b.question_n[i]?w.map(v=>v/b.question_n[i]):null),weight_sums:undefined}));
  }
  function validateGroups(groups){
    if(!Array.isArray(groups)||groups.length>5000)throw Error('集計データの形式が正しくありません。');
    return groups.map(g=>{if(!g||!Number.isInteger(g.n)||g.n<K||!Number.isFinite(g.mean_x)||!Number.isFinite(g.mean_y)||g.mean_x<0||g.mean_x>10||g.mean_y<0||g.mean_y>10||!/^\d{4}-\d{2}$/.test(g.month)||!Array.isArray(g.weights)||g.weights.length!==5)throw Error('公開基準を満たさない集計データです。');
      const cell=g.lat===null||g.lat===undefined?null:grid(Number(g.lat),Number(g.lon));
      const weights=g.weights.map(normalizeWeights),qn=g.question_n,support=g.support_counts;
      if(!Array.isArray(qn)||qn.length!==5||qn.some(n=>!Number.isInteger(n)||n<0||n>g.n)||!Array.isArray(support)||support.length!==3||support.some(n=>!Number.isInteger(n)||n<0||n>g.n)||!Number.isInteger(g.support_n)||g.support_n<0||g.support_n>g.n||support.some(n=>n>g.support_n))throw Error('集計件数が正しくありません。');
      return{month:g.month,event:String(g.event||'').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,32),region:String(g.region||'').replace(/[^ぁ-んァ-ヶ一-龯々ヶー]/gu,'').slice(0,24),lat:cell?.lat??null,lon:cell?.lon??null,zone_x:Math.min(4,Math.max(0,Math.floor(g.mean_x/2))),zone_y:Math.min(4,Math.max(0,Math.floor(g.mean_y/2))),n:g.n,mean_x:g.mean_x,mean_y:g.mean_y,weights,question_n:qn,support_counts:support,support_n:g.support_n};
    });
  }
  function envelope(groups,kind='responses'){return{schema:SCHEMA,data_kind:kind,license:'CC-BY-4.0',attribution:TEAM,minimum_group_size:K,coordinate_system:'Authored X/Y 0..10; geographic points are self-selected 0.01-degree cell centers, WGS84',groups};}
  function geojson(groups,kind="responses"){groups=validateGroups(groups);return{type:'FeatureCollection',...envelope([],kind),groups:undefined,features:groups.map(g=>({type:'Feature',geometry:g.lat===null?null:{type:'Point',coordinates:[g.lon,g.lat]},properties:{...g,lat:undefined,lon:undefined,weights:JSON.stringify(g.weights),question_n:JSON.stringify(g.question_n),support_counts:JSON.stringify(g.support_counts)}}))};}
  const columns=['schema','data_kind','month','event','region','lat','lon','zone_x','zone_y','n','mean_x','mean_y',...Array.from({length:5},(_,i)=>['a','b','c'].map(s=>`q${i+1}_${s}`)).flat(),...Array.from({length:5},(_,i)=>`q${i+1}_n`),'matatabi_n','churu_n','tower_n','support_n','license','attribution'];
  function csv(groups,kind="responses"){groups=validateGroups(groups);const cell=v=>{let s=String(v??'');if(/^[=+@-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};return '\uFEFF'+[columns.join(','),...groups.map(g=>[SCHEMA,kind,g.month,g.event,g.region,g.lat,g.lon,g.zone_x,g.zone_y,g.n,g.mean_x,g.mean_y,...g.weights.flatMap(w=>w||['','','']),...g.question_n,...g.support_counts,g.support_n,'CC-BY-4.0',TEAM].map(cell).join(','))].join('\r\n');}
  return{SCHEMA,K,TEAM,record,grid,aggregate,validateGroups,envelope,geojson,csv,columns};
})();
