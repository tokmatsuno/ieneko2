(function(){
  'use strict';
  const data=window.IENEKO_PLAYLIST,core=window.DJCore,$=s=>document.querySelector(s),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let context=null,selected='',recommendations=[],paint=0;
  function row(t){return `<button type="button" data-dj-track="${t.id}" aria-pressed="${selected===t.id}"><span class="dj-track-icon" aria-hidden="true">♪</span><span><b>${esc(t.title)}</b><small>${esc(t.artist)}</small></span><span aria-hidden="true">↗</span></button>`;}
  function catalogue(){const list=core.filter(data,{quadrant:$('#djMood').value,query:$('#djSearch').value});$('#djTrackCount').textContent=`${list.length}曲 / 全${data.tracks.length}曲`;$('#djTracks').innerHTML=list.length?list.map(row).join(''):'<p>その曲は見つかりませんでした。別の言葉でも探せます。</p>';}
  function render(){
    const t=core.byId(data,selected);if(!t)return;
    $('#djNowTitle').textContent=t.title;$('#djNowArtist').textContent=t.artist;$('#djNowNote').textContent=t.note;$('#djSource').href=t.source_url;$('#djSource').textContent='配信元：'+t.channel+' ↗';$('#djYouTube').href=core.youtube(t);$('#djSpotify').href=core.spotify(t);$('#djPlaySet').href=core.playlistURL(recommendations.slice(0,6));$('#djSelectionList').innerHTML=recommendations.slice(0,6).map(row).join('');catalogue();
    $('#djFavorite').textContent=window.CardUI?.profile().favoriteTrack===t.id?'✓ カードに添えています / 外す':'この一曲を、カードの話題に ＋';
  }
  function select(id){if(!core.byId(data,id))return;if(id!==selected){selected=id;stop();}render();$('#djStatus').textContent='「'+core.byId(data,id).title+'」を選びました。聴くボタンから再生先を選べます。';}
  function update(next){const changed=!context||context.cat.no!==next.cat.no||context.look.finalPose!==next.look.finalPose;context=next;const p=window.CardUI?.profile()||{};recommendations=core.recommend(data,{quadrant:next.look.quadrant,pose:next.look.finalPose,likes:[...(p.likes||[]),p.customLike].filter(Boolean)});if(changed||!selected)selected=recommendations[0].id;render();const token=++paint;CatStudio.render(next.look,'dj',480).then(src=>{if(token===paint)$('#djCat').src=src;}).catch(()=>{});}
  function stop(){$('#djPlayer').replaceChildren();$('#djPlayer').hidden=true;$('#djStop').hidden=true;}
  function init(){
    $('#djPlaylistTotal').textContent=data.tracks.length+'曲から、きょうの一曲を。';
    $('#djIeneko').addEventListener('click',e=>{const button=e.target.closest('[data-dj-track]');if(button)select(button.dataset.djTrack);});
    $('#djMood').addEventListener('change',catalogue);$('#djSearch').addEventListener('input',catalogue);
    $('#djNext').addEventListener('click',()=>{const i=recommendations.findIndex(t=>t.id===selected);select(recommendations[(i+1)%recommendations.length].id);});
    $('#djFavorite').addEventListener('click',()=>{const remove=window.CardUI?.profile().favoriteTrack===selected;document.dispatchEvent(new CustomEvent('ieneko:favorite-track',{detail:{id:remove?'':selected}}));render();$('#djStatus').textContent=remove?'カードに添えていた曲を外しました。':'選んだ一曲を、家猫の名刺に添えました。';});
    $('#djListen').addEventListener('click',()=>{const t=core.byId(data,selected);if(!t)return;stop();const frame=document.createElement('iframe');frame.src=core.embed(t);frame.title=t.title+' / '+t.artist+' のYouTubeプレイヤー';frame.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';frame.referrerPolicy='strict-origin-when-cross-origin';frame.allowFullscreen=true;$('#djPlayer').append(frame);$('#djPlayer').hidden=false;$('#djStop').hidden=false;$('#djStatus').textContent='YouTubeのプレイヤーを開きました。再生ボタンを押して聴けます。';});
    $('#djStop').addEventListener('click',()=>{stop();$('#djStatus').textContent='プレイヤーを閉じました。';});
    document.addEventListener('ieneko:card-profile',()=>{if(context)update(context);});
    window.addEventListener('hashchange',()=>{if(!['#complete','#resultLifestyle','#djIeneko'].includes(location.hash))stop();});
  }
  window.DJUI={update,stop};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
