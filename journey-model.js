/* Shared answer geometry. These are authored design coordinates, not a validated scale. */
(function(){
  const labels=['安心できる入口','小さな役割','気づきの伝え方','続けやすい関わり','場所の使い方'];
  function weights(value){
    if(Array.isArray(value)){
      if(value.length!==3||value.some(v=>typeof v!=='number'||!Number.isFinite(v)||v<0))return null;
      const sum=value.reduce((a,b)=>a+b,0);return sum>0?value.map(v=>v/sum):null;
    }
    if(value&&Array.isArray(value.weights))return weights(value.weights);
    const choice=typeof value==='number'?value:value?.choice;
    return Number.isInteger(choice)&&choice>=0&&choice<3?[0,1,2].map(i=>i===choice?1:0):null;
  }
  function normalize(value){const w=weights(value);return w?{choice:w.indexOf(Math.max(...w)),weights:w}:{choice:-1};}
  // Use tenths of a percent so the displayed allocation also totals exactly 100%.
  function mixUnits(value){
    const raw=(weights(value)||[1/3,1/3,1/3]).map(v=>v*1000),units=raw.map(Math.floor);
    const order=[0,1,2].sort((a,b)=>(raw[b]-units[b])-(raw[a]-units[a])||a-b);
    for(let n=1000-units.reduce((a,b)=>a+b,0),i=0;i<n;i++)units[order[i%3]]++;
    return units;
  }
  function percentages(value){return mixUnits(value).map(v=>v/10);}
  function adjustWeights(value,index,percent,keeps=[]){
    if(!Number.isInteger(index)||index<0||index>2||!Number.isFinite(percent))return null;
    const units=mixUnits(value),requested=Math.max(0,Math.min(1000,Math.round(percent*10)));
    const held=Array.isArray(keeps)?[0,1,2].map(i=>Boolean(keeps[i])):[0,1,2].map(i=>i===keeps);
    const others=[0,1,2].filter(i=>i!==index),free=others.filter(i=>!held[i]);
    // An explicit edit can revise its own kept amount; other kept amounts stay put.
    if(held.every(Boolean)||!free.length)return units.map(v=>v/1000);
    const fixed=others.filter(i=>held[i]).reduce((sum,i)=>sum+units[i],0);
    units[index]=Math.min(requested,1000-fixed);
    const remaining=1000-fixed-units[index],total=free.reduce((sum,i)=>sum+units[i],0);
    units[free[0]]=free.length===1?remaining:Math.round(remaining*(total?units[free[0]]/total:0.5));
    if(free.length===2)units[free[1]]=remaining-units[free[0]];
    return units.map(v=>v/1000);
  }
  function mixed(value){const w=weights(value);return Boolean(w&&Math.max(...w)<1-1e-8);}
  function point(answers,quests){
    const points=answers.map((a,i)=>{const w=weights(a);return w&&quests[i]?{x:w.reduce((v,n,k)=>v+n*quests[i].answers[k].x,0),y:w.reduce((v,n,k)=>v+n*quests[i].answers[k].y,0)}:null;}).filter(Boolean);
    return points.length?{x:points.reduce((v,p)=>v+p.x,0)/points.length,y:points.reduce((v,p)=>v+p.y,0)/points.length}:{x:5,y:5};
  }
  function describe(answer,quest,kids=false){const w=weights(answer);if(!w)return '今は決めずに進んだ';return w.map((n,i)=>n>.0005?`${kids?quest.answers[i].kid:quest.answers[i].label}${mixed(w)?` ${+(n*100).toFixed(1)}%`:''}`:'').filter(Boolean).join(' ＋ ');}
  function nearest(p,cats){return cats.reduce((best,c)=>{const d=(c.x-p.x)**2+(c.y-p.y)**2;return!best||d<best.d-1e-9||Math.abs(d-best.d)<1e-9&&c.no<best.cat.no?{cat:c,d}:best;},null)?.cat;}
  function parse(text){
    const rows=[];let row=[],cell='',quoted=false;
    for(let i=0;i<text.length;i++){const c=text[i];if(quoted&&c==='"'&&text[i+1]==='"'){cell+='"';i++;}else if(c==='"')quoted=!quoted;else if(c===','&&!quoted){row.push(cell);cell='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(v=>v.trim()))rows.push(row);row=[];cell='';}else cell+=c;}
    if(cell||row.length){row.push(cell);rows.push(row);}const head=(rows.shift()||[]).map(h=>h.replace(/^\uFEFF/,'').trim());
    return rows.map(r=>Object.fromEntries(head.map((h,i)=>[h,r[i]||''])));
  }
  function connect(quests,cats){quests.forEach(q=>q.answers.forEach(a=>{const c=cats.find(c=>c.no===a.anchorNo);if(!c)throw Error('missing_anchor');a.x=c.x;a.y=c.y;a.anchorName=c.name;}));return quests;}
  function scores(answers){return labels.map((label,i)=>{const w=weights(answers[i]);return{label,values:w?w.map(v=>v*100):null};});}
  function barsSVG(answers){
    const colors=['#47775e','#c69c4e','#bb755e'];
    return `<svg viewBox="0 0 360 160" role="img" aria-label="5つの問いでA・B・Cを選んだ割合。能力や性格の点数ではありません。">${labels.map((label,i)=>{const w=weights(answers[i]);let x=48;return `<text x="6" y="${24+i*23}" fill="currentColor" font-size="10">問${i+1}</text>${w?w.map((n,k)=>{const r=`<rect x="${x}" y="${13+i*23}" width="${n*290}" height="16" fill="${colors[k]}"><title>${label} ${['A','B','C'][k]} ${+(n*100).toFixed(1)}%</title></rect>`;x+=n*290;return r;}).join(''):`<text x="48" y="${24+i*23}" font-size="10" fill="currentColor">保留</text>`}`;}).join('')}${colors.map((c,i)=>`<rect x="${72+i*90}" y="141" width="10" height="10" fill="${c}"/><text x="${88+i*90}" y="150" font-size="10" fill="currentColor">答え${['A','B','C'][i]}</text>`).join('')}</svg>`;
  }
  window.JourneyModel={weights,normalize,percentages,adjustWeights,mixed,point,describe,nearest,parse,connect,scores,barsSVG,labels};
})();
