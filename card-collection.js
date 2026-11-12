(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CardCollection=api;})(typeof window==='object'?window:this,function(){
  'use strict';
  const KEY='ieneko2-digital-collection-v1',LIMIT=24;
  function valid(item){return item&&typeof item==='object'&&/^IENEKO-\d{3}-[A-Z0-9]+$/.test(String(item.code||''));}
  function load(storage){try{const rows=JSON.parse(storage.getItem(KEY)||'[]');return Array.isArray(rows)?rows.filter(valid).slice(0,LIMIT):[];}catch{return [];}}
  function save(storage,card,now=new Date().toISOString()){
    const item={code:card.collectibleCode,catNo:Number(card.catNo),type:String(card.type||'').slice(0,32),pose:String(card.pose||'').slice(0,40),shareURL:String(card.shareURL||''),savedAt:now};
    const rows=[item,...load(storage).filter(row=>row.code!==item.code)].slice(0,LIMIT);storage.setItem(KEY,JSON.stringify(rows));return rows;
  }
  function remove(storage,code){const rows=load(storage).filter(row=>row.code!==code);storage.setItem(KEY,JSON.stringify(rows));return rows;}
  function has(storage,code){return load(storage).some(row=>row.code===code);}
  return Object.freeze({KEY,LIMIT,load,save,remove,has});
});
