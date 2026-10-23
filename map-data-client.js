/* Readable receipts are required before reporting that shared storage succeeded. */
var MapDataClient=(function(){
  const KEY='ieneko-map2-records-v1';
  function local(){try{return JSON.parse(localStorage.getItem(KEY)||'[]').filter(r=>r&&typeof r.id==='string').slice(-200);}catch{return[];}}
  function save(record){const rows=local().filter(r=>r.id!==record.id);rows.push(record);localStorage.setItem(KEY,JSON.stringify(rows.slice(-200)));}
  function url(){return window.IENEKO_CONFIG?.openDataUrl||'';}
  function endpoint(params){const u=new URL(url());u.searchParams.set('api','ieneko2');Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,v));return u;}
  async function json(params){
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
    try{const response=await fetch(endpoint(params).href,{mode:'cors',credentials:'omit',cache:'no-store',signal:controller.signal});if(!response.ok)throw Error('共有先の応答を確認できませんでした。');return await response.json();}
    finally{clearTimeout(timer);}
  }
  async function get(params){
    if(!url())throw Error('共有先が未設定です。');
    let data;try{data=await json(params);}catch{data=await jsonp(params);}
    if(!data||typeof data!=='object'||Array.isArray(data))throw Error('共有先の応答形式を確認できませんでした。');
    if(data.ok===false)throw Error(data.error||'共有先を確認できませんでした。');
    return data;
  }
  function jsonp(params){
    return new Promise((resolve,reject)=>{
      if(!url()){reject(Error('共有先が未設定です。'));return;}
      const callback='ienekoMap2_'+Math.random().toString(36).slice(2),script=document.createElement('script');
      const u=endpoint(params);u.searchParams.set('callback',callback);
      const clean=()=>{clearTimeout(timer);script.remove();delete window[callback];};
      window[callback]=data=>{clean();if(data?.ok===false)reject(Error(data.error||'共有先を確認できませんでした。'));else resolve(data);};
      const timer=setTimeout(()=>{clean();reject(Error('共有先の応答を確認できませんでした。'));},20000);
      script.onerror=()=>{clean();reject(Error('共有先につながりませんでした。'));};script.src=u.href;document.head.append(script);
    });
  }
  async function submit(record){
    const health=await get({mode:'health'});if(health.service!=='ienekomap2'||!health.ready)throw Error('共有先の準備ができていません。この端末の記録は残っています。');
    try{await fetch(url(),{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({...record,api:'ieneko2'})});}
    catch{throw Error('共有先へ送信できませんでした。この端末には回答が残っています。通信環境を確認し、もう一度保存してください。');}
    for(let i=0;i<3;i++){const receipt=await get({mode:'receipt',id:record.id});if(receipt.accepted)return{...record,synced:true,test:receipt.test};if(i<2)await new Promise(r=>setTimeout(r,700));}
    throw Error('共有先への保存を確認できませんでした。この端末には残しています。');
  }
  function signature(fields){return JSON.stringify([fields.weights?.map(w=>w?.map(n=>Number(n.toFixed(12)))??null),String(fields.region||'').trim(),String(fields.event||'').trim(),fields.grid||null,[...new Set(fields.supports||[])].sort(),fields.test===true]);}
  function previous(fields){return local().find(r=>signature(r)===signature(fields));}
  async function contribute(fields,anchors){
    const prior=previous(fields),record=OpenDataCore.record({...fields,id:prior?.id||crypto.randomUUID()},anchors);
    save({...record,synced:prior?.synced||false});
    const accepted=await submit(record);save({...accepted,confirmedAt:Date.now()});return accepted;
  }
  return{local,save,get,submit,contribute,previous};
})();
