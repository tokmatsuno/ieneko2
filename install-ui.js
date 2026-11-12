(function(){
  'use strict';
  let promptEvent=null;const button=document.querySelector('#installIeneko'),status=document.querySelector('#installStatus');
  if(!button)return;
  const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  if(standalone){button.hidden=true;status.textContent='この端末では、家猫の冒険をホーム画面から開けます。';}
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();promptEvent=event;button.hidden=false;status.textContent='ホーム画面に追加すると、コレクションへ戻りやすくなります。';});
  button.addEventListener('click',async()=>{
    if(promptEvent){promptEvent.prompt();const choice=await promptEvent.userChoice;status.textContent=choice.outcome==='accepted'?'ホーム画面への追加を受け付けました。':'追加は行いませんでした。コレクションはこの端末に残ります。';promptEvent=null;return;}
    status.textContent=/iphone|ipad|ipod/i.test(navigator.userAgent)?'Safariの共有ボタンから「ホーム画面に追加」を選べます。':'ブラウザのメニューから「アプリをインストール」または「ホーム画面に追加」を選べます。';
  });
  if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js?v=2.22').catch(()=>{}),{once:true});
})();
