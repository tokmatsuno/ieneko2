(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CardIdentity=api;})(typeof window==='object'?window:this,function(){
  'use strict';
  const BASE='https://tokmatsuno.github.io/ieneko2/';
  const FORMATS={portrait:{width:1080,height:1350,label:'名刺カード / 縦'},square:{width:1080,height:1080,label:'正方形'},story:{width:1080,height:1920,label:'ストーリー'}};
  const HOBBIES=['ギター','音楽','読書','写真','料理','おやつ','庭いじり','手芸','ゲーム','マンガ','映画','スポーツ','散歩','キャンプ','昼寝','ドライブ'];
  const clean=(v,max)=>Array.from(String(v??'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim()).slice(0,max).join('');
  function profile(value={}){if(!value||typeof value!=='object')value={};return {nickname:clean(value.nickname,16),status:clean(value.status,24),likes:Array.isArray(value.likes)?[...new Set(value.likes.filter(v=>HOBBIES.includes(v)))].slice(0,3):[],customLike:clean(value.customLike,16),question:clean(value.question,36),favoriteTrack:clean(value.favoriteTrack,40)};}
  function representative(answer){const raw=Array.isArray(answer)?answer:answer?.weights;if(raw&&raw.length===3){const top=Math.max(...raw);return top>0?raw.indexOf(top):-1;}return Number.isInteger(answer?.choice)?answer.choice:-1;}
  function create({cat,look,answers=[],saved={},track=null}){
    const p=profile(saved),first=representative(answers[0]),fourth=representative(answers[3]);
    const status=p.status||['顔見知りとなら、話したい','小さく関わってみたい','まずは、見ていたい'][first]||'今日は、自分のペースで';
    const explicit=[...p.likes,p.customLike].filter(Boolean).slice(0,4);
    const fallback=[['顔見知りと一緒','短いお手伝い','見学から'][first],['交代できる役割','今日だけの役割','家からアイデア'][fourth]].filter(Boolean);
    const likes=explicit.length?explicit:fallback.length?fallback:['自分のペース'];
    const has=pattern=>likes.some(v=>pattern.test(v));
    const question=p.question||(track?'この一曲、知ってる？':has(/ギター|音楽/)?'最近よく聴く一曲、教えて？':has(/料理|おやつ/)?'おすすめのおやつ、教えて？':has(/読書|マンガ/)?'最近よかった一冊、教えて？':'いまハマっていること、教えて？');
    const no=Math.max(1,Math.min(100,Math.trunc(Number(cat.no)||1)));
    return {nickname:p.nickname||'はじめまして。',hasNickname:Boolean(p.nickname),type:clean(cat.name,32),status,likes,likesLabel:explicit.length?'好きなこと':'好きな関わり方',question,track:track?{title:clean(track.title,80),artist:clean(track.artist,80)}:null,theme:look.theme,pose:look.finalPose,shareURL:BASE+'cards/'+String(no).padStart(3,'0')+'/',qrURL:BASE,kind:'authored_conversation_card'};
  }
  function caption(card){return [card.hasNickname?card.nickname+'です。':'今日の家猫の名刺。','タイプ：'+card.type,'いまのステータス：'+card.status,card.likesLabel+'：'+card.likes.join('・'),card.track?'好きな一曲：'+card.track.title+' / '+card.track.artist:'',card.question,'#家猫の冒険 #家猫の名刺',card.shareURL].filter(Boolean).join('\n');}
  function shareLinks(card){return {line:'https://social-plugins.line.me/lineit/share?'+new URLSearchParams({url:card.shareURL,text:caption(card).replace('\n'+card.shareURL,'')}),facebook:'https://www.facebook.com/sharer/sharer.php?'+new URLSearchParams({u:card.shareURL})};}
  return Object.freeze({BASE,FORMATS,HOBBIES,clean,profile,create,caption,shareLinks});
});
