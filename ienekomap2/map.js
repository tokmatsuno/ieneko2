(function(){
  'use strict';
  const $=s=>document.querySelector(s),model=window.JourneyModel,studio=window.CatStudio,core=OpenDataCore;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const raw=model.parse(window.IENEKO_CAT_CSV),cats=raw.map(r=>({no:Number(r.No),name:r['猫ネーム'],type:r['タイプ名'],catch:r['キャッチ'],x:Number(r.X),y:Number(r.Y),churu:r['チュール'],tower:r['キャットタワー'],matatabi:r['改善策'],risk:r['副作用'],source:r['出典'],url:r.URL}));
  const quests=model.connect(window.IENEKO_QUESTS,cats),anchors=quests.map(q=>q.answers.map(a=>[a.x,a.y]));
  const supportNames=['またたび','ちゅーる','キャットタワー'],supportNotes=['遊びのツール。つい試したくなる仕掛け','おやつ。小さな楽しみやうれしいきっかけ','環境。安心できる場所・時間・役割'],supportIcons=['🌿','🍪','🏡'];
  let own={answers:[]};try{own=JSON.parse(localStorage.getItem('ieneko2-v3')||'{}');}catch{}
  const ownAnswers=Array.isArray(own.answers)?own.answers.slice(0,5).map(a=>model.normalize(a)):[],canContribute=ownAnswers.length===5;
  const ownPoint=model.point(ownAnswers,quests),testMode=new URLSearchParams(location.search).get('test')==='1';
  const data={shared:[],sample:makeSamples(),imported:[]};let kind='shared',importedKind='imported',filtered=[],selectedGroup=null,zone={x:ownPoint.x,y:ownPoint.y},geoMap=null,geoLayer=null,collectionMap=null,cellLayer=null,selectedCell=null,artToken=0,sharedError='';
  function safeURL(value){try{const u=new URL(value);return['http:','https:'].includes(u.protocol)?u.href:'';}catch{return'';}}
  function download(content,name,type){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([content],{type}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
  function makeSamples(){
    const mixes=[[1,0,0],[0,1,0],[0,0,1],[.5,.5,0],[0,.4,.6],[.2,.6,.2]],records=[];
    for(let g=0;g<12;g++)for(let i=0;i<8;i++){
      const weights=Array.from({length:5},(_,q)=>mixes[(g+q)%mixes.length]);
      const input={id:`sample_record_${g}_${i}`,weights,grid:g<6?{lat:35.66+g*.012,lon:139.72+g*.014}:{lat:32.72+(g-6)*.013,lon:129.85+(g-6)*.013},region:g<6?'千代田区':'長崎市',event:g<6?'sample-tokyo':'sample-nagasaki',supports:i%4===0?[]:i%3===0?[0,2]:[g%3],consent:'aggregate-ccby-v1'};
      records.push(core.record(input,anchors,new Date(g%2?'2026-10-12T00:00:00Z':'2026-09-12T00:00:00Z')));
    }
    return core.aggregate(records);
  }
  function setOptions(){
    for(const [id,field,label]of [['#regionFilter','region','すべての地域'],['#eventFilter','event','すべてのイベント'],['#monthFilter','month','すべての月']]){const previous=$(id).value,values=[...new Set(data[kind].map(g=>g[field]).filter(Boolean))].sort();$(id).innerHTML=`<option value="">${label}</option>`+values.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');if(values.includes(previous))$(id).value=previous;}
  }
  function render(){
    filtered=data[kind].filter(g=>(!$('#regionFilter').value||g.region===$('#regionFilter').value)&&(!$('#eventFilter').value||g.event===$('#eventFilter').value)&&(!$('#monthFilter').value||g.month===$('#monthFilter').value));
    if(selectedGroup&&!filtered.includes(selectedGroup))selectedGroup=null;
    const n=filtered.reduce((v,g)=>v+g.n,0),cells=new Set(filtered.filter(g=>g.lat!==null).map(g=>g.lat+','+g.lon));
    $('#responseCount').innerHTML=`${n}<small>${(kind==='sample'||kind==='imported'&&importedKind==='sample')?'サンプル件':'件'}</small>`;$('#cellCount').innerHTML=`${cells.size}<small>メッシュ</small>`;
    const support=filtered.reduce((v,g)=>v.map((n,i)=>n+g.support_counts[i]),[0,0,0]);$('#leadingSupport').textContent=Math.max(...support)>0?supportNames[support.indexOf(Math.max(...support))]:'集計待ち';
    $('#dataBadge').className='badge'+((kind==='sample'||kind==='imported'&&importedKind==='sample')?' sample':'');$('#dataBadge').textContent=kind==='sample'?'架空のサンプル':kind==='imported'?(importedKind==='sample'?'読み込んだサンプル':'読み込んだ集計'):'共有の回答集計';
    $('#dataMessage').textContent=kind==='sample'?'使い方を試すための架空の回答です。実際の参加者の記録ではありません。保存するファイルにもsampleと明記します。':kind==='imported'?(importedKind==='sample'?'読み込んだサンプルです。実際の参加者の記録ではありません。':'読み込んだ公開集計を表示しています。共有先の記録は書き換えません。'):sharedError||(!data.shared.length?'公開基準を満たす集計はまだありません。5件以上まとまった地域・月・イベント・ゾーンから表示します。基準猫の地図や、サンプルは今すぐ試せます。':'同意を得た回答の公開集計です。参加者の自己選択による記録で、住民全体の分布ではありません。');
    renderDesign();renderZone();if(geoMap)renderGeo();
  }
  function renderDesign(){
    const px=x=>70+x*70,py=y=>480-y*44;
    const zones=[{x:70,y:40,color:'#e4e8f0',title:'おうちで、だれかと'},{x:420,y:40,color:'#eee2dc',title:'おうちで、気ままに'},{x:70,y:260,color:'#e1eadb',title:'まちで、みんなと'},{x:420,y:260,color:'#f3e4c9',title:'まちで、自分らしく'}];
    const bases=$('#showBase').checked?cats.map(c=>`<g data-base="${c.no}" tabindex="0" role="button" aria-label="基準猫 ${esc(c.name)}。X ${c.x} Y ${c.y}"><circle cx="${px(c.x)}" cy="${py(c.y)}" r="13" fill="#ffffff66"/><image href="${esc(studio.sourceFor('hello'))}" x="${px(c.x)-10}" y="${py(c.y)-16}" width="20" height="28" opacity=".58" pointer-events="none"/><title>${esc(c.name)}（基準データ）</title></g>`).join(''):'';
    const bubbles=filtered.map((g,i)=>{const r=13+Math.min(20,Math.sqrt(g.n)*2);return`<g data-group="${i}" tabindex="0" role="button" aria-label="${esc(g.region||'地域未選択')} ${g.n}件の回答集計"><circle cx="${px(g.mean_x)}" cy="${py(g.mean_y)}" r="${r}" fill="#bb914ad9" stroke="#fff9df" stroke-width="2"/><text x="${px(g.mean_x)}" y="${py(g.mean_y)+4}" text-anchor="middle" fill="#fffdf3" font-size="12" font-weight="700" pointer-events="none">${g.n}</text><title>${esc(g.region||'地域未選択')} ${g.n}件 / ${g.month}</title></g>`;}).join('');
    $('#designMap').innerHTML=`<svg id="zoneSVG" viewBox="0 0 840 560" role="img" aria-label="元の100匹と回答集計の分布。4象限の中を連続した座標で表示。">${zones.map(z=>`<rect x="${z.x}" y="${z.y}" width="350" height="220" fill="${z.color}"/><text x="${z.x+15}" y="${z.y+24}" fill="#5c7159" font-size="12">${z.title}</text>`).join('')}${Array.from({length:11},(_,i)=>`<path d="M${px(i)} 40V480M70 ${py(i)}H770" stroke="#a9bba044"/><text x="${px(i)}" y="500" text-anchor="middle" font-size="10" fill="#6e7e67">${i}</text><text x="54" y="${py(i)+4}" text-anchor="end" font-size="10" fill="#6e7e67">${i}</text>`).join('')}<path d="M420 40V480M70 260H770" stroke="#8a9e83" stroke-dasharray="5 5"/>${bases}${bubbles}<g class="zone-cross"><circle cx="${px(zone.x)}" cy="${py(zone.y)}" r="14" fill="none" stroke="#b66347" stroke-width="2"/><path d="M${px(zone.x)-20} ${py(zone.y)}h40M${px(zone.x)} ${py(zone.y)-20}v40" stroke="#b66347" stroke-width="1.5"/></g><text x="70" y="530" font-size="11" fill="#5c7159">← 公的支援・共同側</text><text x="770" y="530" text-anchor="end" font-size="11" fill="#5c7159">私的・自己完結側 →</text><text x="420" y="20" text-anchor="middle" font-size="10" fill="#5c7159">いえネコ側・安心できる内側 ↑</text><text x="420" y="553" text-anchor="middle" font-size="10" fill="#5c7159">↓ まち猫側・外との関わり</text></svg>`;
  }
  function nearest(){return cats.map(c=>({...c,d:(c.x-zone.x)**2+(c.y-zone.y)**2})).sort((a,b)=>a.d-b.d||a.no-b.no).slice(0,5);}
  function setZone(x,y,group=null){zone={x:Math.max(0,Math.min(10,x)),y:Math.max(0,Math.min(10,y))};selectedGroup=group;$('#zoneX').value=zone.x;$('#zoneY').value=zone.y;renderDesign();renderZone();}
  function renderZone(){
    const near=nearest(),c=near[0],group=selectedGroup,quad=studio.quadrants[(zone.y>=5?2:0)+(zone.x>=5?1:0)],groups=group?[group]:filtered.filter(g=>g.zone_x===Math.min(4,Math.floor(zone.x/2))&&g.zone_y===Math.min(4,Math.floor(zone.y/2))),n=groups.reduce((v,g)=>v+g.n,0),supportN=groups.reduce((v,g)=>v+g.support_n,0),support=groups.reduce((v,g)=>v.map((n,i)=>n+g.support_counts[i]),[0,0,0]);
    $('#zonePanel').innerHTML=`<p class="eyebrow">A DOOR FOR THIS ZONE</p><h3>${quad.title}</h3><div class="zone-art"><img id="zoneCat" src="${esc(studio.sourceFor(studio.poseFor(zone,c.no)))}" alt="このゾーンに近い基準猫のイメージ"></div><span class="zone-coordinate">X ${zone.x.toFixed(2)} / Y ${zone.y.toFixed(2)}</span><p>${group?`${esc(group.region||'地域未選択')} / ${esc(group.month)} / ${group.n}件の集計`:`このゾーンの公開回答：${n}件${kind==='sample'?'（サンプル）':''}`}</p><div class="zone-reference"><p>近い基準猫：No.${c.no} <a href="../?v=2.05&amp;cat=${c.no}#cats">${esc(c.name)} ↗</a></p><p class="count-note">${near.map(c=>`No.${c.no} ${esc(c.name)}`).join(' ・ ')}</p></div><div class="preference-bars">${supportN?support.map((v,i)=>`<div class="preference-bar"><span>${supportNames[i]}</span><i style="width:${Math.max(2,v/supportN*100)}%"></i><span>${Math.round(v/supportN*100)}%</span></div>`).join(''):'<p>入口の希望が集まると、遊び・おやつ・環境の比率を比較できます。</p>'}</div><p class="count-note">${supportN?`入口を1つ以上選んだ${supportN}件が分母。複数選択。効果測定ではありません。`:'下の提案は、近い基準猫の設計案から。回答者の性格や属性は推定しません。'}</p>`;
    const token=++artToken;if(group&&group.weights){const answers=group.weights.map(w=>w?model.normalize(w):{choice:-1}),look=studio.derive(answers,quests,zone);studio.render(look).then(src=>{if(token===artToken&&$('#zoneCat'))$('#zoneCat').src=src;}).catch(()=>{});}
    $('#supportPanel').innerHTML=['matatabi','churu','tower'].map((field,i)=>`<article class="support-card"><h3>${supportIcons[i]} ${supportNames[i]}</h3><small>${supportNotes[i]}</small><p>${esc(c[field]||'この基準猫には未登録です。')}</p><details><summary>根拠と、試すときの注意</summary><p>参照：No.${c.no} ${esc(c.name)}。元データの${['改善策','チュール','キャットタワー'][i]}です。</p><p>副作用・注意：${esc(c.risk||'元データには記載がありません。')}</p><p>出典：${esc(c.source)}</p>${safeURL(c.url)?`<a href="${esc(safeURL(c.url))}" target="_blank" rel="noopener">元データが参照する資料 ↗</a>`:''}<p>近傍の5匹を比較して、地域の人と小さく検証してください。各猫への適用は制作者の解釈です。</p></details></article>`).join('');
  }
  function createMap(id){
    if(!window.L){$('#'+id).innerHTML='<p class="notice">地図を読み込めませんでした。ネット接続を確認してください。参加の入口マップとCSVは利用できます。</p>';return null;}
    const map=L.map(id,{preferCanvas:true}).setView([36.2,138.2],5);
    L.tileLayer(window.IENEKO_CONFIG?.mapTileUrl||'https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:17,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);return map;
  }
  function renderGeo(){if(!geoMap)return;if(!geoLayer)geoLayer=L.layerGroup().addTo(geoMap);geoLayer.clearLayers();
    filtered.forEach((g,i)=>{if(g.lat===null)return;const marker=L.circleMarker([g.lat,g.lon],{radius:8+Math.min(18,Math.sqrt(g.n)),color:'#345d43',fillColor:'#c69d50',fillOpacity:.8,weight:2}).addTo(geoLayer);marker.bindPopup(`<b>${esc(g.region||'活動地域のメッシュ')}</b><br>${g.n}件 / ${esc(g.month)}<br>約1kmメッシュの中心<br><button data-geo-group="${i}">入口の提案を見る →</button>`);});
    const points=filtered.filter(g=>g.lat!==null).map(g=>[g.lat,g.lon]);if(points.length)geoMap.fitBounds(L.latLngBounds(points).pad(.4),{maxZoom:13});
  }
  function switchView(view){const on=view==='geo';$('#geoView').hidden=!on;$('#designView').hidden=on;document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));if(on){geoMap=geoMap||createMap('geoMap');if(geoMap){setTimeout(()=>geoMap.invalidateSize(),100);renderGeo();}}}
  function initCollectionMap(){if(collectionMap)return;collectionMap=createMap('collectionMap');if(!collectionMap)return;collectionMap.on('click',e=>{selectedCell=core.grid(e.latlng.lat,e.latlng.lng);if(cellLayer)cellLayer.remove();cellLayer=L.rectangle([[selectedCell.lat-.005,selectedCell.lon-.005],[selectedCell.lat+.005,selectedCell.lon+.005]],{color:'#335b43',fillColor:'#c8a75d',fillOpacity:.35}).addTo(collectionMap);$('#cellLabel').textContent=`選んだメッシュの中心：${selectedCell.lat.toFixed(3)}, ${selectedCell.lon.toFixed(3)}。クリック位置そのものは保存しません。`;});setTimeout(()=>collectionMap.invalidateSize(),100);}
  async function loadShared(){
    $('#refreshData').disabled=true;try{const response=await MapDataClient.get({mode:'aggregate'});if(response.schema!==core.SCHEMA||response.service!=='ienekomap2')throw Error('共有先の集計形式を確認できませんでした。');data.shared=core.validateGroups(response.groups);sharedError='';}catch(err){sharedError='共有集計を取得できませんでした。'+err.message+' サンプルや読み込んだ集計は利用できます。';}finally{$('#refreshData').disabled=false;if(kind==='shared'){setOptions();render();}}
  }
  async function checkService(){try{const health=await MapDataClient.get({mode:'health'});$('#serviceStatus').textContent=health.service==='ienekomap2'&&health.ready?'共有の受付に接続しています。保存の返答を確認してから完了を表示します。':'共有の受付は準備中です。この端末での保存とJSON出力は利用できます。';}catch{$('#serviceStatus').textContent='共有の受付は接続未確認です。この端末の記録を先に残し、保存できたかを確かめます。';}}
  function ownSummary(){
    $('#ownSummary').innerHTML=canContribute?'<p>5つの問いを歩いた、きょうの配分。</p>'+model.barsSVG(ownAnswers)+`<p class="small">設計座標 X ${ownPoint.x.toFixed(2)} / Y ${ownPoint.y.toFixed(2)}</p>`:'<p>まずは、猫と5つの問いを歩いてみよう。</p><a href="../?v=2.05#home">猫と、まちへ出る ↗</a>';
    $('#sendContribution').disabled=!canContribute;$('#downloadOwn').disabled=!canContribute;$('#testNotice').hidden=!testMode;
    $('#eventCode').value=(new URLSearchParams(location.search).get('event')||'').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,32);
  }
  $('#contributionForm').addEventListener('submit',async e=>{
    e.preventDefault();if(!canContribute||!$('#openConsent').checked)return;const button=$('#sendContribution');button.disabled=true;
    try{
      const supports=[...document.querySelectorAll('input[name=support]:checked')].map(i=>Number(i.value));
      const fields={weights:ownAnswers.map(a=>model.weights(a)),region:$('#areaName').value.trim(),event:$('#eventCode').value.trim(),grid:selectedCell,supports,consent:'aggregate-ccby-v1',test:testMode};
      const prior=MapDataClient.local().find(r=>r.test===testMode&&JSON.stringify([r.weights,r.region,r.event,r.grid,r.supports])===JSON.stringify([fields.weights,fields.region,fields.event,fields.grid,fields.supports]));
      const record=core.record({...fields,id:prior?.id||crypto.randomUUID()},anchors);
      MapDataClient.save({...record,synced:prior?.synced||false});$('#collectionStatus').textContent='この端末に保存しました。共有先への保存を確認しています…';
      const accepted=await MapDataClient.submit(record);MapDataClient.save(accepted);$('#collectionStatus').textContent=accepted.test?'検証用シートへの保存を確認しました。本番の公開集計には含めません。':'共有先への保存を確認しました。同じ地域・月・イベント・ゾーンに5件以上集まると、匿名の集計に反映します。';if(!accepted.test)await loadShared();
    }catch(err){$('#collectionStatus').textContent=err.message;}finally{button.disabled=!canContribute;}
  });
  $('#downloadOwn').addEventListener('click',()=>download(JSON.stringify({schema:'ieneko-own-answer-1.0',answers:ownAnswers,point:ownPoint,question_labels:model.labels},null,2),'ieneko-my-answers.json','application/json'));
  $('#pickArea').addEventListener('toggle',()=>{if($('#pickArea').open)initCollectionMap();});
  $('#clearCell').addEventListener('click',()=>{selectedCell=null;if(cellLayer){cellLayer.remove();cellLayer=null;}$('#cellLabel').textContent='地域のメッシュは未選択です。';});
  $('#dataSource').addEventListener('change',()=>{kind=$('#dataSource').value;selectedGroup=null;setOptions();render();});
  for(const id of ['#regionFilter','#eventFilter','#monthFilter'])$(id).addEventListener('change',render);
  $('#showBase').addEventListener('change',renderDesign);$('#refreshData').addEventListener('click',loadShared);
  document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.view)));
  for(const id of ['#zoneX','#zoneY'])$(id).addEventListener('input',()=>setZone(Number($('#zoneX').value),Number($('#zoneY').value)));
  function activateMapTarget(target){const base=target.closest('[data-base]'),group=target.closest('[data-group]');if(base){const c=cats.find(c=>c.no===Number(base.dataset.base));if(c)setZone(c.x,c.y);return true;}if(group){const g=filtered[Number(group.dataset.group)];if(g)setZone(g.mean_x,g.mean_y,g);return true;}return false;}
  $('#designMap').addEventListener('click',e=>{if(activateMapTarget(e.target))return;const svg=$('#zoneSVG'),p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const q=p.matrixTransform(svg.getScreenCTM().inverse());setZone((q.x-70)/70,(480-q.y)/44);});
  $('#designMap').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){if(activateMapTarget(e.target))e.preventDefault();}});
  $('#geoMap').addEventListener('click',e=>{const b=e.target.closest('[data-geo-group]');if(!b)return;const g=filtered[Number(b.dataset.geoGroup)];if(g){setZone(g.mean_x,g.mean_y,g);$('#zonePanel').scrollIntoView({block:'nearest',behavior:'smooth'});}});
  $('#exportCSV').addEventListener('click',()=>{download(core.csv(filtered,kind==='sample'?'sample':kind==='imported'?importedKind:'responses'),`ienekomap2-${kind}-aggregate.csv`,'text/csv;charset=utf-8');$('#exportStatus').textContent=`${filtered.length}集計行を保存しました。個々の回答や記録IDは含めません。`;});
  $('#exportGeoJSON').addEventListener('click',()=>{download(JSON.stringify(core.geojson(filtered,kind==='sample'?'sample':kind==='imported'?importedKind:'responses'),null,2),`ienekomap2-${kind}-aggregate.geojson`,'application/geo+json');$('#exportStatus').textContent='GeoJSONを保存しました。地理点はメッシュ中心で、位置を選んでいない集計はgeometry:nullです。';});
  $('#downloadBrief').addEventListener('click',()=>{const c=nearest()[0],n=filtered.filter(g=>g.zone_x===Math.min(4,Math.floor(zone.x/2))&&g.zone_y===Math.min(4,Math.floor(zone.y/2))).reduce((v,g)=>v+g.n,0);const text=`# 家猫MAP2 地域の小さな実験メモ\n\nデータ区分: ${kind}\nフィルター: 地域 ${$('#regionFilter').value||'全体'} / イベント ${$('#eventFilter').value||'全体'} / 月 ${$('#monthFilter').value||'全体'}\n選択ゾーン: X ${zone.x.toFixed(2)} / Y ${zone.y.toFixed(2)}\nこのゾーンの公開回答件数: ${n}\n参照猫: No.${c.no} ${c.name}\n\n## 試せる入口\n\nまたたび（遊びのツール）: ${c.matatabi}\n\nちゅーる（おやつ）: ${c.churu}\n\nキャットタワー（環境）: ${c.tower}\n\n注意: ${c.risk}\n\n出典: ${c.source}\n${safeURL(c.url)}\n\n## 実験の記録欄\n\nどこで・誰に声をかけるか:\n小さく試す期間・役割:\n参加したい人が選べること:\n反応をどう確認するか:\n見直す点:\n\n提案は元データに基づく仮説で、効果の実証ではありません。回答は自己選択サンプルです。人数や住民全体の分布は推定しません。\n\n${core.TEAM}\nhttps://tokmatsuno.github.io/ieneko2/ienekomap2/\n`;download(text,'ienekomap2-zone-brief.txt','text/plain;charset=utf-8');});
  $('#importData').addEventListener('change',async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>5*1024*1024)throw Error('5MB以下の集計ファイルを選んでください。');const text=await file.text();let groups;
    if(file.name.toLowerCase().endsWith('.csv')){const rows=model.parse(text);importedKind=rows.some(r=>r.data_kind==='sample')?'sample':'imported';if(rows.some(r=>r.schema!==core.SCHEMA))throw Error('家猫MAP2の公開集計CSVを選んでください。');groups=rows.map(r=>({month:r.month,event:r.event,region:r.region,lat:r.lat===''?null:Number(r.lat),lon:r.lon===''?null:Number(r.lon),n:Number(r.n),mean_x:Number(r.mean_x),mean_y:Number(r.mean_y),weights:Array.from({length:5},(_,i)=>r[`q${i+1}_a`]===''?null:['a','b','c'].map(s=>Number(r[`q${i+1}_${s}`]))),question_n:Array.from({length:5},(_,i)=>Number(r[`q${i+1}_n`])),support_counts:['matatabi_n','churu_n','tower_n'].map(k=>Number(r[k])),support_n:Number(r.support_n)}));}
    else{const json=JSON.parse(text);importedKind=json.data_kind==='sample'?'sample':'imported';if(json.schema!==core.SCHEMA)throw Error('家猫MAP2の公開集計JSONを選んでください。');groups=json.type==='FeatureCollection'?json.features.map(f=>({...f.properties,lat:f.geometry?.coordinates[1]??null,lon:f.geometry?.coordinates[0]??null,weights:JSON.parse(f.properties.weights),question_n:JSON.parse(f.properties.question_n),support_counts:JSON.parse(f.properties.support_counts)})):json.groups;}
    data.imported=core.validateGroups(groups);$('#dataSource option[value=imported]').disabled=false;$('#dataSource').value='imported';kind='imported';selectedGroup=null;setOptions();render();$('#exportStatus').textContent=`${data.imported.length}集計行を読み込みました。共有先には送っていません。`;
  }catch(err){$('#exportStatus').textContent=err.message;}finally{e.target.value='';}});
  const api=new URL(window.IENEKO_CONFIG.openDataUrl);api.searchParams.set('api','ieneko2');api.searchParams.set('mode','aggregate');$('#publicAPI').href=api.href;
  if(window.IENEKO_RELEASE){$('#mapVersion').textContent='ver'+window.IENEKO_RELEASE.version;$('#teamCredit').textContent=window.IENEKO_RELEASE.team;}
  $('#zoneX').value=zone.x;$('#zoneY').value=zone.y;ownSummary();setOptions();render();loadShared();checkService();
})();
