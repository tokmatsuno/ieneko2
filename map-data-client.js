/* Readable receipts are required before reporting that shared storage succeeded. */
var MapDataClient=(function(){
  const KEY='ieneko-map2-records-v1';
  function local(){try{return JSON.parse(localStorage.getItem(KEY)||'[]').filter(r=>r&&typeof r.id==='string').slice(-200);}catch{return[];}}
  function save(record){const rows=local().filter(r=>r.id!==record.id);rows.push(record);localStorage.setItem(KEY,JSON.stringify(rows.slice(-200)));}
  function url(){return window.IENEKO_CONFIG?.openDataUrl||'';}
  function get(params){
    return new Promise((resolve,reject)=>{
      if(!url()){reject(Error('共有先が未設定です。'));return;}
      const callback='ienekoMap2_'+Math.random().toString(36).slice(2),script=document.createElement('script');
      const u=new URL(url());u.searchParams.set('api','ieneko2');Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,v));u.searchParams.set('callback',callback);
      const clean=()=>{clearTimeout(timer);script.remove();delete window[callback];};
      window[callback]=data=>{clean();if(data?.ok===false)reject(Error(data.error||'共有先を確認できませんでした。'));else resolve(data);};
      const timer=setTimeout(()=>{clean();reject(Error('共有先の応答を確認できませんでした。'));},20000);
      script.onerror=()=>{clean();reject(Error('共有先につながりませんでした。'));};script.src=u.href;document.head.append(script);
    });
  }
  async function submit(record){
    const health=await get({mode:'health'});if(health.service!=='ienekomap2'||!health.ready)throw Error('共有先の準備ができていません。この端末の記録は残っています。');
    await fetch(url(),{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({...record,api:'ieneko2'})});
    for(let i=0;i<3;i++){const receipt=await get({mode:'receipt',id:record.id});if(receipt.accepted)return{...record,synced:true,test:receipt.test};if(i<2)await new Promise(r=>setTimeout(r,700));}
    throw Error('共有先への保存を確認できませんでした。この端末には残しています。');
  }
  return{local,save,get,submit};
})();
