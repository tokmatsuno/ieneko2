/* Shared contract for the explicitly synthetic five-town beta dataset. */
(function(root){
  'use strict';
  const SCHEMA='ieneko-five-towns-beta-1',KIND='synthetic_beta',TEAM='2026年度東京大学シビックテックデザイン学講座Team 1';
  const FIELDS=['schema','data_kind','sample_id','town_id','town_name','prefecture','municipality','x','y','quadrant','reference_cat_no','reference_cat_name',...Array.from({length:5},(_,q)=>['a','b','c'].map(k=>`q${q+1}_${k}`)).flat(),'support_matatabi','support_churu','support_tower','license','attribution'];
  function csv(records){return '\uFEFF'+[FIELDS,...records.map(r=>FIELDS.map(k=>r[k]??''))].map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n')+'\r\n';}
  function validate(records,towns){
    if(!Array.isArray(records))throw Error('beta_records_missing');
    const ids=new Set();
    return records.map(r=>{
      const town=towns.find(t=>t.id===r.town_id);
      if(!town||r.schema!==SCHEMA||r.data_kind!==KIND||r.town_name!==town.name||!/^beta214-[a-z]+-\d{3}$/.test(r.sample_id)||ids.has(r.sample_id))throw Error('beta_identity_invalid');
      ids.add(r.sample_id);
      for(let q=1;q<=5;q++){const w=['a','b','c'].map(k=>Number(r[`q${q}_${k}`]));if(w.some(v=>!Number.isFinite(v)||v<0||v>1)||Math.abs(w.reduce((a,b)=>a+b,0)-1)>1e-8)throw Error('beta_weights_invalid');}
      if(!['x','y'].every(k=>Number.isFinite(Number(r[k]))&&Number(r[k])>=0&&Number(r[k])<=10)||![0,1,2,3].includes(Number(r.quadrant)))throw Error('beta_point_invalid');
      if(!['support_matatabi','support_churu','support_tower'].every(k=>[0,1].includes(Number(r[k])))||r.license!=='CC BY 4.0'||r.attribution!==TEAM)throw Error('beta_metadata_invalid');
      return Object.fromEntries(FIELDS.map(k=>[k,r[k]]));
    });
  }
  function weights(r){return Array.from({length:5},(_,q)=>['a','b','c'].map(k=>Number(r[`q${q+1}_${k}`])));}
  function summary(records){
    const n=records.length,quadrants=[0,0,0,0],supports=[0,0,0],means=Array.from({length:5},()=>[0,0,0]);let x=0,y=0;
    records.forEach(r=>{quadrants[+r.quadrant]++;x+=+r.x;y+=+r.y;['support_matatabi','support_churu','support_tower'].forEach((k,i)=>supports[i]+=+r[k]);weights(r).forEach((w,q)=>w.forEach((v,k)=>means[q][k]+=v));});
    return{n,quadrants,supports,x:n?x/n:5,y:n?y/n:5,weights:means.map(w=>w.map(v=>n?v/n:0))};
  }
  function distance(a,b){return Math.sqrt(a.weights.reduce((sum,w,q)=>sum+w.reduce((v,n,k)=>v+(n-b.weights[q][k])**2,0),0)/15);}
  const api={SCHEMA,KIND,TEAM,FIELDS,csv,validate,weights,summary,distance};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.BetaDataCore=api;
})(typeof globalThis!=='undefined'?globalThis:this);
