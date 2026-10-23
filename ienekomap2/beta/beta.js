(function(){
 'use strict';
 const $=s=>document.querySelector(s),core=BetaDataCore,model=JourneyModel,studio=CatStudio,initial=window.IENEKO_BETA_DATA,sheet=window.IENEKO_BETA_SHEET,towns=initial.towns;
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const raw=model.parse(window.IENEKO_CAT_CSV),cats=raw.map(r=>({no:+r.No,name:r['猫ネーム'],x:+r.X,y:+r.Y,matatabi:r['改善策'],churu:r['チュール'],tower:r['キャットタワー'],source:r['出典']})),quests=model.connect(window.IENEKO_QUESTS,cats);
 const tools=['またたび / 遊びのツール','ちゅーる / おやつ・きっかけ','キャットタワー / 環境'],supportFields=['support_matatabi','support_churu','support_tower'];
 const quadNames=['まちで、みんなと','まちで、自分らしく','おうちで、だれかと','おうちで、気ままに'],quadColors=['#61805c','#bc9852','#687fa0','#b7765d'];
 let records=core.validate(initial.records,towns),selectedTown='hiyoshi',homeTown='hiyoshi',selectedSample='',galleryPage=0,tablePage=0,fullDesign=false,source='bundle',geoMap=null,geoLayers=null,paintToken=0,dialogToken=0,loading=false;
 let plans={};try{plans=JSON.parse(localStorage.getItem('ieneko-beta-plans-v1')||'{}');}catch{}
 const byTown=id=>records.filter(r=>r.town_id===id),stats=id=>core.summary(byTown(id)),town=id=>towns.find(t=>t.id===id),sheetURL=t=>sheet.url+'/edit#gid='+sheet.sheets[t.sheet];
 function download(content,name,type='text/csv;charset=utf-8'){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([content],{type}));a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);}
 function saveCSV(rows,name){download(core.csv(rows),name);$('#downloadStatus').textContent=`${source==='sheets'?'共有シートから読み込んだ':'同梱した初期版の'}仮想回答${rows.length}件をCSVに保存しました。`;
 }
 function render(){
  $('#totalCount').textContent=records.length;$('#downloadAll').textContent=`全${records.length}件のCSVをダウンロード ↓`;
  $('#townTabs').innerHTML=towns.map(t=>`<button data-town="${t.id}" style="--town-color:${t.color}" aria-pressed="${selectedTown===t.id}"><i aria-hidden="true"></i>${esc(t.short)}<small>${byTown(t.id).length}件</small></button>`).join('');
  renderTown();renderGeo();renderDesign();renderCases();renderGallery();renderTable();renderDownloads();
 }
 function renderTown(){
  const t=town(selectedTown),s=stats(t.id),ref=model.nearest(s,cats);
  $('#townPanel').innerHTML=`<p class="eyebrow">${esc(t.short)} / 仮想のまち</p><h3>${esc(t.name)}</h3><p class="place">${esc(t.prefecture)} ${esc(t.municipality)}</p><p class="count"><b>${s.n}</b> 匹の仮想回答</p><img class="town-art" id="townCat" src="${esc(studio.sourceFor('hello'))}" alt="${esc(t.name)}の平均配分から描く猫"><div class="mini-chart" role="img" aria-label="4象限の件数 ${s.quadrants.join('、')}">${s.quadrants.map((n,i)=>`<span style="width:${s.n?n/s.n*100:0}%;background:${quadColors[i]}">${n>1?n:''}</span>`).join('')}</div><div class="quad-legend">${quadNames.map((name,i)=>`<span><i style="background:${quadColors[i]}"></i>${name} ${s.quadrants[i]}件</span>`).join('')}</div><h4>参加したくなる、入口の希望</h4>${tools.map((name,i)=>`<div class="support-row"><span>${name.split(' / ')[0]}</span><div class="support-track"><i style="width:${s.n?s.supports[i]/s.n*100:0}%"></i></div><b>${s.supports[i]}件</b></div>`).join('')}<p class="small">仮想回答${s.n}件が分母。複数選択。住民の実際の希望や施策効果ではありません。</p><div class="links"><button class="text-button" data-download-town="${t.id}">このまちのCSV ↓</button><a href="${esc(sheetURL(t))}" target="_blank" rel="noopener">このまちのシート ↗</a></div><p class="small">近い基準猫：${esc(ref.name)}。元CSVの設計値を使用。</p>`;
  const active=t.id,look=studio.derive(s.weights.map(w=>model.normalize(w)),quests,{x:s.x,y:s.y});studio.render(look,look.finalPose,300).then(src=>{if(selectedTown===active&&$('#townCat'))$('#townCat').src=src;}).catch(()=>{});
 }
 function createGeo(){
  if(!window.L){$('#geoMap').innerHTML='<p class="small">地理の地図を読み込めませんでした。上のまち選択と「90匹の分布」、CSVは利用できます。</p>';return;}
  geoMap=L.map('geoMap',{scrollWheelZoom:false}).setView([36.5,137.5],5);
  L.tileLayer(window.IENEKO_CONFIG?.mapTileUrl||'https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:17,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(geoMap);
  geoLayers=L.layerGroup().addTo(geoMap);geoMap.fitBounds(towns.map(t=>[t.lat,t.lon]),{padding:[48,55],maxZoom:6});geoMap.on('zoomend',renderGeo);
 }
 function renderGeo(){if(!geoMap)return;geoLayers.clearLayers();const home=town(homeTown);
  const clustered=geoMap.getZoom()<=6,kanto=towns.filter(t=>['hiyoshi','asakusa','komachi'].includes(t.id));
  for(const t of towns){if(t.id!==homeTown)L.polyline([[home.lat,home.lon],[t.lat,t.lon]],{color:'#63795b',weight:1,dashArray:'5,7',opacity:.45,interactive:false}).addTo(geoLayers);
   if(clustered&&kanto.includes(t))continue;
   const icon=L.divIcon({className:'town-pin',html:`<div style="--town-color:${t.color}"><b>${byTown(t.id).length}</b><span>${esc(t.short)}（仮想）</span></div>`,iconSize:[100,68],iconAnchor:[50,23]});
   L.marker([t.lat,t.lon],{icon,title:t.name,alt:t.name}).addTo(geoLayers).on('click',()=>selectTown(t.id));
  }
  if(clustered){const n=kanto.reduce((sum,t)=>sum+byTown(t.id).length,0),icon=L.divIcon({className:'town-pin',html:`<div style="--town-color:#47775e"><b>${n}</b><span>日吉・浅草・小町（仮想）</span></div>`,iconSize:[100,68],iconAnchor:[50,23]});L.marker([35.53,139.66],{icon,title:'関東3まちの仮想回答。押して拡大',alt:'関東3まちの仮想回答'+n+'件。押して拡大'}).addTo(geoLayers).on('click',()=>geoMap.fitBounds(kanto.map(t=>[t.lat,t.lon]),{padding:[60,60],maxZoom:10}));}
 }
 function renderDesign(){
  const min=fullDesign?0:4,max=fullDesign?10:8,px=v=>60+(v-min)/(max-min)*720,py=v=>440-(v-min)/(max-min)*380;
  let cells='';for(let x=min;x<max;x++)for(let y=min;y<max;y++){const q=(y>=5?2:0)+(x>=5?1:0);cells+=`<rect x="${px(x)}" y="${py(y+1)}" width="${720/(max-min)}" height="${380/(max-min)}" fill="${quadColors[q]}" opacity=".13"/>`;}
  const ticks=Array.from({length:max-min+1},(_,i)=>min+i),dots=records.map(r=>{const t=town(r.town_id);return`<g role="button" tabindex="0" data-sample="${esc(r.sample_id)}" aria-label="${esc(t.short+' '+r.reference_cat_name+' '+r.sample_id)}"><circle cx="${px(+r.x)}" cy="${py(+r.y)}" r="${r.sample_id===selectedSample?10:6.5}" fill="${t.color}" stroke="${r.town_id===selectedTown?'#fffdf4':t.color}" stroke-width="1.5" opacity="${r.town_id===selectedTown?1:.4}"/><title>${esc(t.name)} ${esc(r.reference_cat_name)} X${r.x} Y${r.y}</title></g>`;}).join('');
  $('#designMap').innerHTML=`<svg viewBox="0 0 840 510" role="img" aria-label="仮想回答${records.length}件の設計座標。色はまち、各丸が1件。">${cells}${ticks.map(v=>`<path d="M${px(v)} 60V440M60 ${py(v)}H780" stroke="#a9b9a155"/><text x="${px(v)}" y="461" text-anchor="middle" font-size="11" fill="#63745a">${v}</text><text x="45" y="${py(v)+4}" text-anchor="end" font-size="11" fill="#63745a">${v}</text>`).join('')}<path d="M${px(5)} 60V440M60 ${py(5)}H780" stroke="#8a9b7c" stroke-dasharray="5,5"/>${dots}<text x="60" y="30" font-size="12" fill="#63745a">Y：安心できる内側 ↑</text><text x="780" y="490" text-anchor="end" font-size="12" fill="#63745a">X：自分で選ぶ側 →</text><text x="60" y="490" font-size="11" fill="#63745a">${fullDesign?'0〜10の全体図':'回答のある範囲を拡大'} / ${records.length}件</text></svg>`;
  $('#zoomDesign').textContent=fullDesign?'回答のある範囲へ拡大':'座標全体（0〜10）を見る';
 }
 function selectTown(id){selectedTown=id;render();const t=town(id);geoMap?.setView([t.lat,t.lon],10);}
 function renderCases(){
  const home=town(homeTown),base=stats(homeTown),filter=$('#toolFilter').value;
  $('#comparisonSummary').innerHTML=towns.map(t=>{const s=stats(t.id);return`<div style="--town-color:${t.color}"><b>${esc(t.short)}${t.id===homeTown?' / 起点':''}</b><small>仮想 ${s.n}件</small><div class="mini-chart">${s.quadrants.map((n,i)=>`<span style="width:${s.n?n/s.n*100:0}%;background:${quadColors[i]}"></span>`).join('')}</div><small>遊び${s.supports[0]} / おやつ${s.supports[1]} / 環境${s.supports[2]}</small></div>`;}).join('');
  const ordered=towns.filter(t=>t.id!==homeTown&&(filter===''||t.case_tool===+filter)).map(t=>({t,s:stats(t.id),distance:core.distance(base,stats(t.id))})).sort((a,b)=>a.distance-b.distance||a.t.id.localeCompare(b.t.id));
  $('#caseCards').innerHTML=ordered.length?ordered.map(({t,s})=>{const selected=(plans[homeTown]||[]).includes(t.id),adapt=t.adapt.replaceAll('日吉',home.short);return`<article class="case-card" style="--town-color:${t.color}"><p class="case-town">${esc(t.short)} / ${esc(t.name)}</p><span class="tag">${tools[t.case_tool]}</span><h3>${esc(t.case_title)}</h3><p>${esc(t.case_idea)}</p><p class="basis">仮想${s.n}件のうち${s.supports[t.case_tool]}件が、この入口を選択。希望をもとにした検討案で、効果は未検証です。</p><p class="adapt"><b>${esc(home.short)}へ持ち帰るなら</b><br>${esc(adapt)}</p><details><summary>元データの猫からも考える</summary><p>${esc(model.nearest(s,cats)[['matatabi','churu','tower'][t.case_tool]])}</p><p class="small">参照：${esc(model.nearest(s,cats).name)}。元CSVの提案を地域の検討案に翻案しています。</p></details><button class="${selected?'ghost':'primary'}" data-plan="${t.id}" aria-pressed="${selected}">${selected?'✓ 検討メモに追加済み':'この案を'+esc(home.short)+'で検討 ＋'}</button></article>`;}).join(''):'<p class="small">この入口の仮想案は、起点以外のまちにはまだありません。ほかの入口も見てみてください。</p>';
  const selected=(plans[homeTown]||[]).map(town).filter(Boolean);$('#planList').innerHTML=selected.length?'<ul>'+selected.map(t=>`<li>${esc(t.short)}から「${esc(t.case_title)}」</li>`).join('')+'</ul>':'<p>気になる案の「この案を検討」を押すと、ここへ集まります。</p>';$('#exportPlan').disabled=!selected.length;
 }
 function renderGallery(){
  const filtered=records.filter(r=>!$('#catTown').value||r.town_id===$('#catTown').value),max=Math.max(0,Math.ceil(filtered.length/6)-1);galleryPage=Math.min(galleryPage,max);const current=filtered.slice(galleryPage*6,galleryPage*6+6),token=++paintToken;
  $('#catPageStatus').textContent=`仮想${filtered.length}匹中 ${filtered.length?galleryPage*6+1:0}〜${Math.min(filtered.length,galleryPage*6+6)}匹 / 1匹がCSVの1行です。`;
  $('#catGallery').innerHTML=current.map((r,i)=>`<article class="cat-card"><img data-cat-art="${i}" src="${esc(studio.sourceFor('hello'))}" alt="仮想回答から描いた${esc(r.reference_cat_name)}"><small>${esc(town(r.town_id).short)} / 仮想</small><b>${esc(r.reference_cat_name)}</b><small>${esc(r.sample_id)}</small><button data-sample="${esc(r.sample_id)}">配分とCSVを見る ↗</button></article>`).join('');
  current.forEach((r,i)=>{const look=studio.derive(core.weights(r).map(w=>model.normalize(w)),quests,{x:+r.x,y:+r.y});studio.render(look,look.finalPose,240).then(src=>{const img=$(`[data-cat-art="${i}"]`);if(img&&token===paintToken)img.src=src;}).catch(()=>{});});
  $('#previousCats').disabled=galleryPage===0;$('#nextCats').disabled=galleryPage>=max;
 }
 function showCat(id){
  const r=records.find(r=>r.sample_id===id);if(!r)return;selectedSample=id;renderDesign();const t=town(r.town_id),token=++dialogToken,answers=core.weights(r).map(w=>model.normalize(w));
  $('#catDialogBody').innerHTML=`<p class="eyebrow">ONE CAT, ONE ROW / 仮想回答</p><h2 id="catDialogTitle">${esc(r.reference_cat_name)}</h2><p>${esc(t.name)} / ${esc(r.sample_id)}</p><img id="detailCat" src="${esc(studio.sourceFor('hello'))}" alt="仮想回答の猫"><p>設計座標 X ${Number(r.x).toFixed(3)} / Y ${Number(r.y).toFixed(3)}</p>${model.barsSVG(answers)}<p>A・B・Cは各問の答えの割合です。能力や性格の点数ではありません。</p><button class="primary" data-download-sample="${esc(r.sample_id)}">この仮想回答1件をCSVで保存 ↓</button><p class="small">data_kind=synthetic_beta / CC BY 4.0</p>`;
  $('#catDialog').showModal();const look=studio.derive(answers,quests,{x:+r.x,y:+r.y});studio.render(look,look.finalPose,420).then(src=>{if(token===dialogToken&&$('#detailCat'))$('#detailCat').src=src;}).catch(()=>{});
 }
 function renderDownloads(){
  $('#openWorkbook').href=sheet.url;
  $('#townDownloads').innerHTML=towns.map(t=>`<div><b>${esc(t.short)}</b><small>${esc(t.name)}<br>仮想回答 ${byTown(t.id).length}件</small><button data-download-town="${t.id}">このまちのCSV ↓</button><a href="${esc(sheetURL(t))}" target="_blank" rel="noopener">このまちのシート ↗</a></div>`).join('');
  $('#csvAPI').value=MapDataClient.endpoint({mode:'beta-csv'}).href;$('#jsonAPI').href=MapDataClient.endpoint({mode:'beta'}).href;
 }
 function renderTable(){
  const start=tablePage*20,current=records.slice(start,start+20);$('#tableCaption').textContent=`仮想回答${records.length}件の ${start+1}〜${start+current.length}行 / ${source==='sheets'?'共有シートから取得':'同梱の初期版'}`;
  $('#recordTable').innerHTML=current.map(r=>`<tr><td><button data-sample="${esc(r.sample_id)}">${esc(r.sample_id)}</button></td><td>${esc(town(r.town_id).short)}（仮想）</td><td>${esc(r.reference_cat_name)}</td><td>${Number(r.x).toFixed(3)}</td><td>${Number(r.y).toFixed(3)}</td><td>${core.weights(r)[0].map(v=>+(v*100).toFixed(1)+'%').join(' / ')}</td></tr>`).join('');$('#moreRows').textContent=(start+20>=records.length?'最初の20行へ戻る':'次の20行を見る');
 }
 async function loadShared(){
  if(loading)return;loading=true;$('#refreshData').disabled=true;$('#syncStatus').textContent='共有シートを確認中。表示中のデータはそのまま使えます。';
  try{const data=await MapDataClient.get({mode:'beta'});if(data.schema!==core.SCHEMA||data.data_kind!==core.KIND||data.source!=='google_sheets')throw Error('beta_source_invalid');const next=core.validate(data.records,towns);if(!next.length)throw Error('beta_empty');records=next;source='sheets';tablePage=0;render();$('#syncStatus').classList.add('live');$('#syncStatus').textContent=`Googleシートから仮想${records.length}件を取得 / 5つのまちとCSVを同期`;}
  catch{source='bundle';records=core.validate(initial.records,towns);tablePage=0;render();$('#syncStatus').classList.remove('live');$('#syncStatus').textContent=`同梱した初期${records.length}件を表示（共有シートとの接続は未確認）。CSVは初期データとして保存できます。`;}
  finally{loading=false;$('#refreshData').disabled=false;}
 }
 $('#homeTown').innerHTML=towns.map(t=>`<option value="${t.id}">${esc(t.short+' / '+t.name)}</option>`).join('');$('#catTown').insertAdjacentHTML('beforeend',towns.map(t=>`<option value="${t.id}">${esc(t.short+' / '+t.name)}</option>`).join(''));
 $('#townSources').innerHTML=towns.map(t=>`<div><a href="${esc(t.source)}" target="_blank" rel="noopener">${esc(t.name.replace('（仮想）',''))} ↗</a><small>${esc(t.source_label)}</small></div>`).join('');
 $('#appVersion').textContent='ver'+window.IENEKO_RELEASE.version;$('#teamCredit').textContent=window.IENEKO_RELEASE.team;
 document.addEventListener('click',e=>{const t=e.target.closest('[data-town]');if(t)selectTown(t.dataset.town);const cat=e.target.closest('[data-sample]');if(cat)showCat(cat.dataset.sample);const csv=e.target.closest('[data-download-town]');if(csv)saveCSV(byTown(csv.dataset.downloadTown),`ieneko-${csv.dataset.downloadTown}-synthetic.csv`);const single=e.target.closest('[data-download-sample]');if(single)saveCSV(records.filter(r=>r.sample_id===single.dataset.downloadSample),'ieneko-'+single.dataset.downloadSample+'.csv');const plan=e.target.closest('[data-plan]');if(plan){const prior=plans[homeTown]||[];plans[homeTown]=prior.includes(plan.dataset.plan)?prior.filter(id=>id!==plan.dataset.plan):[...prior,plan.dataset.plan];try{localStorage.setItem('ieneko-beta-plans-v1',JSON.stringify(plans));}catch{}renderCases();}});
 $('#designMap').addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){const cat=e.target.closest('[data-sample]');if(cat){e.preventDefault();showCat(cat.dataset.sample);}}});
 $('#geoTab').addEventListener('click',()=>{$('#geoTab').setAttribute('aria-pressed','true');$('#designTab').setAttribute('aria-pressed','false');$('#geoMap').hidden=false;$('#designView').hidden=true;geoMap?.invalidateSize();});
 $('#designTab').addEventListener('click',()=>{$('#geoTab').setAttribute('aria-pressed','false');$('#designTab').setAttribute('aria-pressed','true');$('#geoMap').hidden=true;$('#designView').hidden=false;});
 $('#zoomDesign').addEventListener('click',()=>{fullDesign=!fullDesign;renderDesign();});$('#homeTown').addEventListener('change',()=>{homeTown=$('#homeTown').value;renderCases();renderGeo();});$('#toolFilter').addEventListener('change',renderCases);
 $('#showAllTowns').addEventListener('click',()=>{$('#geoTab').setAttribute('aria-pressed','true');$('#designTab').setAttribute('aria-pressed','false');$('#geoMap').hidden=false;$('#designView').hidden=true;geoMap?.invalidateSize();geoMap?.fitBounds(towns.map(t=>[t.lat,t.lon]),{padding:[48,55],maxZoom:6});});
 $('#catTown').addEventListener('change',()=>{galleryPage=0;renderGallery();});$('#previousCats').addEventListener('click',()=>{galleryPage--;renderGallery();});$('#nextCats').addEventListener('click',()=>{galleryPage++;renderGallery();});$('#moreRows').addEventListener('click',()=>{tablePage=(tablePage+1)*20>=records.length?0:tablePage+1;renderTable();});
 $('#downloadAll').addEventListener('click',()=>saveCSV(records,'ieneko-five-towns-synthetic.csv'));$('#refreshData').addEventListener('click',loadShared);$('#closeCatDialog').addEventListener('click',()=>$('#catDialog').close());
 $('#exportPlan').addEventListener('click',()=>{const head=['data_kind','plan_status','home_town','from_town','case_title','tool','synthetic_response_n','selected_support_n','idea'],rows=(plans[homeTown]||[]).map(town).filter(Boolean).map(t=>[core.KIND,'local_draft',town(homeTown).name,t.name,t.case_title,tools[t.case_tool],stats(t.id).n,stats(t.id).supports[t.case_tool],t.case_idea]),csv='\uFEFF'+[head,...rows].map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n')+'\r\n';download(csv,'ieneko-'+homeTown+'-draft-ideas.csv');$('#planStatus').textContent=`${rows.length}件の仮想案を検討用CSVに保存しました。`;});
 createGeo();render();loadShared();
})();
