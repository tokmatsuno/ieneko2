/* One explicitly consented cat per row. Never expose private collection records. */
var PublicCatData=(function(){
  const SCHEMA='ieneko-public-cats-1.0',CONSENT='public-cat-ccby-v1';
  const columns=['schema','data_kind','public_id','reference_cat_no','reference_cat_name','x','y','quadrant',...Array.from({length:5},(_,i)=>['a','b','c'].map(s=>`q${i+1}_${s}`)).flat(),'matatabi','churu','tower','license','attribution'];
  function project(records,references,verification=false){
    return records.filter(r=>r.consent===CONSENT&&Boolean(r.test)===verification&&r.public_id).map(r=>{
      const ref=references.map(c=>({...c,d:(c.x-r.x)**2+(c.y-r.y)**2})).sort((a,b)=>a.d-b.d||a.no-b.no)[0];
      return{public_id:r.public_id,reference_cat_no:ref.no,reference_cat_name:ref.name,x:r.x,y:r.y,quadrant:['grove','sun','moon','rose'][(r.y>=5?2:0)+(r.x>=5?1:0)],weights:r.weights,supports:r.supports};
    });
  }
  function validate(cats){
    if(!Array.isArray(cats)||cats.length>20000)throw Error('公開猫のデータ形式を確認できませんでした。');
    return cats.map(c=>{
      if(!c||!/^[a-zA-Z0-9_-]{12,80}$/.test(c.public_id)||!Number.isInteger(c.reference_cat_no)||c.reference_cat_no<1||c.reference_cat_no>100||!Number.isFinite(c.x)||!Number.isFinite(c.y)||c.x<0||c.x>10||c.y<0||c.y>10||!Array.isArray(c.weights)||c.weights.length!==5)throw Error('公開猫のデータ形式を確認できませんでした。');
      const weights=c.weights.map(w=>{if(w===null)return null;if(!Array.isArray(w)||w.length!==3||w.some(n=>typeof n!=='number'||!Number.isFinite(n)||n<0||n>1.000001)||Math.abs(w.reduce((a,b)=>a+b,0)-1)>.001)throw Error('公開猫の回答配分が正しくありません。');return w;});
      return{public_id:c.public_id,reference_cat_no:c.reference_cat_no,reference_cat_name:String(c.reference_cat_name||''),x:c.x,y:c.y,quadrant:['grove','sun','moon','rose'][(c.y>=5?2:0)+(c.x>=5?1:0)],weights,supports:[...new Set((c.supports||[]).filter(n=>Number.isInteger(n)&&n>=0&&n<3))]};
    });
  }
  function envelope(cats,verification=false){return{ok:true,service:'ienekomap2',schema:SCHEMA,data_kind:verification?'verification':'responses',license:'CC-BY-4.0',attribution:OpenDataCore.TEAM,cats:validate(cats)};}
  function csv(cats,verification=false){
    const cell=v=>{let s=String(v??'');if(/^[=+@-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};
    return '\uFEFF'+[columns.join(','),...validate(cats).map(c=>[SCHEMA,verification?'verification':'responses',c.public_id,c.reference_cat_no,c.reference_cat_name,c.x,c.y,c.quadrant,...c.weights.flatMap(w=>w||['','','']),...[0,1,2].map(n=>c.supports.includes(n)?1:0),'CC-BY-4.0',OpenDataCore.TEAM].map(cell).join(','))].join('\r\n');
  }
  return{SCHEMA,CONSENT,columns,project,validate,envelope,csv};
})();
