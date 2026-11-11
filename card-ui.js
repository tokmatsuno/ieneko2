(function(){
  'use strict';
  const core=window.CardIdentity,key='ieneko2-card-profile-v1',$=s=>document.querySelector(s),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let saved={};try{saved=core.profile(JSON.parse(localStorage.getItem(key)||'{}'));}catch{saved=core.profile();}
  let current=null,card=null,format='portrait',revision=0,cache=null,url='',timer=null;
  const status=text=>$('#cardShareStatus').textContent=text;
  function persist(){try{localStorage.setItem(key,JSON.stringify(saved));}catch{status('このタブでは編集できます。端末への保存はできませんでした。');}}
  function fillEditor(){
    for(const [name,id] of [['nickname','cardNickname'],['status','cardStatusInput'],['customLike','cardCustomLike'],['question','cardQuestion']])$('#'+id).value=saved[name]||'';
    $('#cardLikeOptions').innerHTML=core.HOBBIES.map(name=>`<label><input type="checkbox" value="${esc(name)}" ${saved.likes.includes(name)?'checked':''}><span>${esc(name)}</span></label>`).join('');
  }
  function model(){const track=saved.favoriteTrack&&window.DJCore?.byId(window.IENEKO_PLAYLIST,saved.favoriteTrack);return core.create({...current,saved,track});}
  function lock(){for(const id of ['shareCardImage','downloadCard','downloadInstagram','copyCardCaption'])$('#'+id).disabled=true;for(const id of ['shareCardLine','shareCardFacebook'])$('#'+id).setAttribute('aria-disabled','true');}
  function invalidate(){revision++;cache=null;lock();$('#cardPreview').dataset.ready='pending';}
  async function prepare(){
    if(!current)return;const token=++revision;cache=null;lock();$('#cardPreview').dataset.ready='pending';$('#cardBuildStatus').textContent='名刺カードを仕上げています…';
    card=model();const links=core.shareLinks(card);$('#shareCardLine').href=links.line;$('#shareCardFacebook').href=links.facebook;$('#shareCaption').value=core.caption(card);
    $('#cardIdentitySummary').textContent=[card.nickname.replace(/。$/,''),'タイプ：'+card.type,'いまのステータス：'+card.status,card.likesLabel+'：'+card.likes.join('・'),card.question].join('。');
    try{
      const art=await CatStudio.render(current.look,current.look.finalPose),result=await CardRenderer.render(card,art,format);if(token!==revision)return;
      cache={...result,art,card,format};const prior=url;url=URL.createObjectURL(result.blob);$('#cardPreview').src=url;$('#cardPreview').alt=$('#cardIdentitySummary').textContent;$('#cardPreview').dataset.ready='true';if(prior)URL.revokeObjectURL(prior);
      $('#finishedCard').style.setProperty('--card-ink',current.look.theme.ink);$('#finishedCard').style.setProperty('--card-gold',current.look.theme.gold);$('#cardBuildStatus').textContent='この画像を、そのまま保存・共有できます。';for(const id of ['shareCardImage','downloadCard','downloadInstagram','copyCardCaption'])$('#'+id).disabled=false;for(const id of ['shareCardLine','shareCardFacebook'])$('#'+id).setAttribute('aria-disabled','false');
    }catch{if(token===revision){$('#cardPreview').dataset.ready='error';$('#cardBuildStatus').textContent='カード画像を仕上げられませんでした。もう一度お試しください。';}}
  }
  function update(next){current=next;prepare();}
  function fileOf(value){return new File([value.blob],'ieneko-meishi-'+value.format+'.png',{type:'image/png'});}
  function saveBlob(blob,name){const link=document.createElement('a'),objectURL=URL.createObjectURL(blob);link.href=objectURL;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(objectURL),10000);}
  function download(){if(!cache)return;saveBlob(cache.blob,'ieneko-meishi-'+format+'.png');status('名刺画像を保存しました。画像と紹介文を一緒に使えます。');}
  async function instagram(){if(!cache)return;const captured=cache,token=revision;try{let result=captured;if(format!=='portrait')result=await CardRenderer.render(captured.card,captured.art,'portrait');if(token!==revision){status('内容が変わりました。更新したカードから、もう一度保存してください。');return;}saveBlob(result.blob,'ieneko-instagram-portrait.png');status('Instagram向けの縦画像を保存しました。Instagramで写真として選び、下の紹介文を添えて投稿できます。');}catch{status('画像を保存できませんでした。もう一度お試しください。');}}
  async function share(){
    if(!cache)return;const captured=cache,file=fileOf(captured);
    if(!navigator.share||!navigator.canShare?.({files:[file]})){download();status('この環境では画像の直接共有に対応していないため、画像を保存しました。LINEやSNSでこの画像を選んでください。');return;}
    try{await navigator.share({files:[file],title:captured.card.type+' / 家猫の名刺',text:core.caption(captured.card)});status('共有メニューを閉じました。送信や投稿の結果は、共有先のアプリで確認してください。');}
    catch(error){status(error.name==='AbortError'?'共有をキャンセルしました。カードはそのまま残っています。':'共有メニューを開けませんでした。「画像を保存」から共有できます。');}
  }
  async function copy(){const text=$('#shareCaption').value;try{await navigator.clipboard.writeText(text);status('紹介文をコピーしました。画像と一緒に貼り付けられます。');}catch{$('#shareCaption').focus();$('#shareCaption').select();status('下の紹介文を選択しました。コピーしてお使いください。');}}
  function edit(){saved=core.profile({...saved,nickname:$('#cardNickname').value,status:$('#cardStatusInput').value,customLike:$('#cardCustomLike').value,question:$('#cardQuestion').value,likes:[...document.querySelectorAll('#cardLikeOptions input:checked')].map(i=>i.value)});persist();invalidate();clearTimeout(timer);timer=setTimeout(()=>{prepare();document.dispatchEvent(new CustomEvent('ieneko:card-profile',{detail:{likes:[saved.customLike,...saved.likes].filter(Boolean)}}));},180);}
  function init(){
    fillEditor();$('#cardEditor').addEventListener('input',edit);$('#cardLikeOptions').addEventListener('change',e=>{if($('#cardLikeOptions').querySelectorAll('input:checked').length>3){e.target.checked=false;status('好みは3つまで選べます。');}edit();});
    $('#cardFormat').addEventListener('change',e=>{format=core.FORMATS[e.target.value]?e.target.value:'portrait';invalidate();prepare();});
    $('#cardProfileReset').addEventListener('click',()=>{saved=core.profile();persist();fillEditor();invalidate();prepare();document.dispatchEvent(new CustomEvent('ieneko:card-profile',{detail:{likes:[]}}));});
    $('#downloadCard').addEventListener('click',download);$('#downloadInstagram').addEventListener('click',instagram);$('#shareCardImage').addEventListener('click',share);$('#copyCardCaption').addEventListener('click',copy);$('#retryCard').addEventListener('click',prepare);
    for(const [selector,text] of [['#shareCardLine','LINEの共有画面を開きます。名刺画像を送りたい場合は「画像を共有」からLINEを選んでください。'],['#shareCardFacebook','Facebookでは猫タイプの紹介リンクを共有します。編集した名刺画像は「画像を保存」から投稿に添えられます。']])$(selector).addEventListener('click',e=>{if(!cache){e.preventDefault();status('最新のカードを仕上げています。少し待ってから共有できます。');}else status(text);});
    document.addEventListener('ieneko:favorite-track',e=>{saved.favoriteTrack=core.clean(e.detail.id,40);persist();prepare();status(saved.favoriteTrack?'選んだ一曲を、カードの会話のきっかけに添えました。':'カードに添えていた曲を外しました。');});
  }
  window.CardUI={update,profile:()=>core.profile(saved),getCard:()=>card};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
