(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.DJCore=api;})(typeof window==='object'?window:this,function(){
  'use strict';
  const byId=(data,id)=>data?.tracks.find(t=>t.id===id)||null;
  function recommend(data,{quadrant=0,pose='',likes=[]}={}){
    const special=pose==='evh-tapping'?['panama','jump','top-gun']:pose==='kamehameha'?['chala']:pose==='dj'?['september']:[];
    const score=t=>(special.includes(t.id)?100-special.indexOf(t.id):0)+(t.quadrant===quadrant?12:0)+t.tags.filter(v=>likes.includes(v)).length*6;
    return data.tracks.map((t,i)=>({t,i,score:score(t)})).sort((a,b)=>b.score-a.score||a.i-b.i).map(item=>item.t);
  }
  function filter(data,{quadrant='',query=''}={}){const q=String(query).trim().toLocaleLowerCase('ja-JP');return data.tracks.filter(t=>(quadrant===''||t.quadrant===Number(quadrant))&&(!q||[t.title,t.artist,...t.tags].join(' ').toLocaleLowerCase('ja-JP').includes(q)));}
  const youtube=t=>'https://www.youtube.com/watch?v='+encodeURIComponent(t.youtube_id);
  const spotify=t=>'https://open.spotify.com/search/'+encodeURIComponent(t.title+' '+t.artist);
  const embed=t=>'https://www.youtube-nocookie.com/embed/'+encodeURIComponent(t.youtube_id)+'?rel=0';
  const playlistURL=tracks=>'https://www.youtube.com/watch_videos?'+new URLSearchParams({video_ids:tracks.map(t=>t.youtube_id).join(',')});
  return Object.freeze({byId,recommend,filter,youtube,spotify,embed,playlistURL});
});
