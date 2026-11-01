/* Shared definitions for national statistics and reusable local open data. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.RegionDataCore=api;})(typeof window!=='undefined'?window:globalThis,function(){
 'use strict';
 const METRICS=['population','under15','working_age','over65','households','general_households','single_households','libraries','community_centres'];
 const MODES={demographics:'人口・世帯構成',population:'人口規模',facilities:'図書館・公民館の整備状況'};
 const TOWN_CODES={hiyoshi:'14100',asakusa:'13106',komachi:'14204',maruyama:'01100',daimyo:'40130'};
 function code(value){const s=String(value??'').trim().replace(/^R/,'');return /^\d{6}$/.test(s)?s.slice(0,5):/^\d{5}$/.test(s)?s:'';}
 function safeURL(value){try{const u=new URL(String(value));return ['https:','http:'].includes(u.protocol)?u.href:'';}catch{return '';}}
 function ratio(n,d){return Number.isFinite(n)&&Number.isFinite(d)&&d>0?n/d:null;}
 function profiles(dataset){
  if(dataset.schema!=='ieneko-regions-1.0')throw Error('地域データの形式が違います。');
  const seen=new Set();return dataset.rows.map(row=>{
   const p=Object.fromEntries(dataset.columns.map((key,i)=>[key,row[i]]));
   if(!code(p.code)||seen.has(p.code)||!p.name||!p.prefecture)throw Error('地域コードを確認してください。');seen.add(p.code);
   for(const key of METRICS)if(!Number.isFinite(p[key])||p[key]<0)throw Error('統計値を確認してください。');
   const known=p.under15+p.working_age+p.over65;
   p.age_known=known;p.under15_pct=ratio(p.under15*100,known);p.working_age_pct=ratio(p.working_age*100,known);p.over65_pct=ratio(p.over65*100,known);
   p.single_pct=ratio(p.single_households*100,p.general_households);p.libraries_per10k=ratio(p.libraries*10000,p.population);p.centres_per10k=ratio(p.community_centres*10000,p.population);
   return p;
  });
 }
 function distance(a,b,mode){
  if(mode==='population')return a.population>0&&b.population>0?Math.abs(Math.log2(a.population/b.population)):null;
  const keys=mode==='facilities'?['libraries_per10k','centres_per10k']:['under15_pct','working_age_pct','over65_pct','single_pct'];
  return keys.every(k=>Number.isFinite(a[k])&&Number.isFinite(b[k]))?Math.sqrt(keys.reduce((sum,k)=>sum+(a[k]-b[k])**2,0)/keys.length):null;
 }
 function rank(base,items,mode='demographics',cross=true){return items.filter(p=>p.code!==base.code&&(!cross||p.prefecture!==base.prefecture)).map(profile=>({profile,distance:distance(base,profile,mode)})).filter(p=>p.distance!==null).sort((a,b)=>a.distance-b.distance||a.profile.code.localeCompare(b.profile.code));}
 function parseCSV(text){
  const rows=[];let row=[],cell='',quoted=false;const s=String(text).replace(/^\uFEFF/,'');
  for(let i=0;i<s.length;i++){const c=s[i];if(c==='"'){if(quoted&&s[i+1]==='"'){cell+='"';i++;}else if(!quoted&&cell!=='')throw Error('CSVの引用符を確認してください。');else quoted=!quoted;}
   else if(!quoted&&c===','){row.push(cell);cell='';}else if(!quoted&&(c==='\n'||c==='\r')){if(c==='\r'&&s[i+1]==='\n')i++;row.push(cell);if(row.some(v=>v!==''))rows.push(row);row=[];cell='';}else cell+=c;}
  if(quoted)throw Error('CSVの引用符が閉じていません。');row.push(cell);if(row.some(v=>v!==''))rows.push(row);
  if(rows.length<2)throw Error('項目名とデータ行が必要です。');const headers=rows.shift().map(h=>h.trim());
  if(new Set(headers).size!==headers.length)throw Error('CSVの項目名が重複しています。');
  return rows.map((r,i)=>{if(r.length!==headers.length)throw Error(`${i+2}行目の列数が違います。`);return Object.fromEntries(headers.map((k,j)=>[k,r[j]]));});
 }
 function csv(rows,fields){const cell=v=>{let s=v==null?'':String(v);if(typeof v==='string'&&/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};return '\uFEFF'+[fields,...rows.map(row=>fields.map(k=>row[k]??''))].map(row=>row.map(cell).join(',')).join('\r\n')+'\r\n';}
 function value(row,names){for(const name of names)if(String(row[name]??'').trim()!=='')return String(row[name]).trim();return '';}
 function date(value){const s=String(value||'').replaceAll('/','-');if(!/^\d{4}-\d{2}-\d{2}$/.test(s)||!Number.isFinite(Date.parse(s))||new Date(s).toISOString().slice(0,10)!==s)throw Error('日付はYYYY-MM-DD形式で指定してください。');return s;}
 function category(name){return /図書館|図書室/.test(name)?'library':/体育|運動|スポーツ|球場|プール|庭球|競技/.test(name)?'sports':/公民館|市民センター|市民会館|コミュニティ|集会/.test(name)?'community':/美術|博物|文化|劇場|ホール/.test(name)?'culture':'other';}
 function importPlaces(text,meta,knownCodes){
  if(!safeURL(meta.source_url)||!meta.title?.trim()||!meta.license?.trim())throw Error('出典URL・データ名・利用条件を入力してください。');date(meta.updated);
  const rows=parseCSV(text);if(rows.length>5000)throw Error('1回に追加できるのは5,000行までです。');const seen=new Set();
  return rows.map((row,i)=>{
   const municipal=code(value(row,['municipality_code','全国地方公共団体コード','都道府県コード又は市区町村コード','localgov_code']));
   const name=value(row,['name','名称','イベント名']),url=value(row,['url','URL','関連リンク']);
   if(!name||!knownCodes.has(municipal))throw Error(`${i+2}行目の名称か市区町村コードを確認してください。政令市は市全体のコードを使います。`);
   if(url&&!safeURL(url))throw Error(`${i+2}行目のURLを確認してください。`);
   const kind=meta.kind==='event'?'event':'facility',id=value(row,['id','ID','NO'])||String(i+1),key=[kind,municipal,id].join(':');if(seen.has(key))throw Error(`${i+2}行目のIDが重複しています。`);seen.add(key);
   const latRaw=value(row,['lat','緯度','latitude']),lonRaw=value(row,['lon','経度','longitude']);let lat=null,lon=null;
   if(latRaw||lonRaw){lat=Number(latRaw);lon=Number(lonRaw);if(!latRaw||!lonRaw||!Number.isFinite(lat)||!Number.isFinite(lon)||lat<20||lat>46||lon<122||lon>154)throw Error(`${i+2}行目の緯度・経度を確認してください。`);}
   const start=kind==='event'?date(value(row,['start_date','開始日','開催日'])):'',end=kind==='event'?(value(row,['end_date','終了日'])?date(value(row,['end_date','終了日'])):start):'';
   if(end<start)throw Error(`${i+2}行目の終了日が開始日より前です。`);
   return {kind,id:key,municipality_code:municipal,name,address:value(row,['address','所在地_連結表記','住所','所在地','開催場所']),lat,lon,url:safeURL(url),category:kind==='event'?'event':category(name),category_basis:'名称による分類',hours:value(row,['hours','利用可能時間特記事項','開園時間']),food:value(row,['food','飲食可否']),start_date:start,end_date:end,source_id:meta.id||'local-import',source_title:meta.title.trim(),source_url:safeURL(meta.source_url),source_updated:meta.updated,license:meta.license.trim(),attribution:meta.attribution||meta.title.trim(),data_kind:'open_data_local_import'};
  });
 }
 function placesFor(rows,municipality,tool){return rows.filter(r=>r.municipality_code===municipality&&(tool===''||tool==='matatabi'&&['sports','culture','event'].includes(r.category)||tool==='churu'&&/^(可|可能|1|true|○|〇|可\(.*\))$/i.test(r.food)||tool==='tower'&&['library','community'].includes(r.category)));}
 function uniquePlaces(rows){return [...new Map(rows.map(row=>[[row.kind,row.municipality_code,row.name,row.address,row.start_date||''].join('|'),row])).values()];}
 const PLACE_FIELDS=['data_kind','kind','id','municipality_code','name','address','lat','lon','category','category_basis','hours','food','start_date','end_date','url','source_title','source_url','source_updated','source_updated_label','license','attribution'];
 const LOG_FIELDS=['data_kind','id','municipality_code','municipality','status','date','tool','place_name','activity','participants','observation','source_url','license','attribution'];
 function implementation(input,knownCodes){
  if(input.license&&!['CC-BY-4.0','CC BY 4.0'].includes(input.license))throw Error('持ち寄り記録はCC BY 4.0のCSVを選んでください。利用条件は自動で変更しません。');
  if(!knownCodes.has(code(input.municipality_code))||!['planned','completed'].includes(input.status)||!['matatabi','churu','tower'].includes(input.tool))throw Error('地域・状況・入口を確認してください。');
  date(input.date);if(!input.activity?.trim()||input.activity.length>180||String(input.observation||'').length>500)throw Error('取り組み名は180字、結果メモは500字以内で入力してください。');
  const n=input.participants===''||input.participants==null?null:Number(input.participants);if(n!==null&&(!Number.isInteger(n)||n<0||n>1000000))throw Error('参加延べ人数は0以上の整数で入力してください。');
  if(input.status==='planned'&&n!==null)throw Error('検討中の案には、参加実績を入力できません。');
  if(input.source_url&&!safeURL(input.source_url))throw Error('記録の出典URLを確認してください。');
  return {...Object.fromEntries(LOG_FIELDS.map(k=>[k,String(input[k]??'')])),data_kind:'implementation_record',municipality_code:code(input.municipality_code),participants:n,source_url:safeURL(input.source_url),license:'CC-BY-4.0'};
 }
 return {METRICS,MODES,TOWN_CODES,code,safeURL,ratio,profiles,distance,rank,parseCSV,csv,date,category,importPlaces,placesFor,uniquePlaces,implementation,PLACE_FIELDS,LOG_FIELDS};
});
