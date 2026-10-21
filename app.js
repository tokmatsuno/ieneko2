const QUESTS = [
  { place: 'ひだまり広場', icon: '☀', title: '知らない道で、猫が立ち止まった。', body: 'いつもと違う道の先で、小さな猫が地図を見つめています。急いでいるようにも、少し迷っているようにも見えます。', kid: 'はじめての道で、ちいさな猫が地図を見ているよ。こまっているのかな？', answers: [
    { key: 'kind', text: 'まず声をかけて、どこへ行きたいか聞く', kid: '「どうしたの？」と、やさしく声をかける' },
    { key: 'brave', text: '自分から地図をのぞき、いっしょに歩き出す', kid: '「いっしょに行こう！」と先に歩き出す' },
    { key: 'wise', text: '道しるべを見比べて、行き先を探す', kid: '道しるべを見て、行き先を考える' }
  ] },
  { place: '毛糸の森', icon: '✿', title: '森の小道が、毛糸でふさがれている。', body: '木々のあいだに長い毛糸がからまり、向こうから「手伝って」と声がします。道をほどくには、いくつか方法がありそうです。', kid: '森の道が、けいとでいっぱい。むこうから「たすけて」と声がするよ。', answers: [
    { key: 'kind', text: '声の主が安心できるよう、そばへ行く', kid: 'こまっている子のそばへ行く' },
    { key: 'brave', text: 'からまった毛糸をたどって、道を切りひらく', kid: 'けいとの道をたどって進む' },
    { key: 'wise', text: '毛糸の始まりを探して、順番にほどく', kid: 'けいとのはじまりを見つけて、ほどく' }
  ] },
  { place: 'しずくの庭', icon: '⌁', title: '水たまりの向こうで、友だちが待っている。', body: '雨あがりの庭に大きな水たまり。渡れずにいる友だちがこちらを見ています。足もとには丸い石と、長い枝が落ちています。', kid: '大きな水たまりのむこうで、ともだちが待っているよ。丸い石と枝があるね。', answers: [
    { key: 'kind', text: '友だちのところまで戻り、いっしょに渡る', kid: 'ともだちをむかえに行って、いっしょに渡る' },
    { key: 'brave', text: '先に渡って、向こうから手を差し出す', kid: '先に渡って「ここだよ」と手をふる' },
    { key: 'wise', text: '石と枝を並べて、安全な道をつくる', kid: '石と枝で、渡る道をつくる' }
  ] },
  { place: '月あかり坂', icon: '☾', title: '坂の上から、ふしぎな音が聞こえる。', body: '暗くなる前に、坂の上を確かめたい。風で木の葉が揺れています。音の正体を知る方法を選んでください。', kid: '坂の上から、ふしぎな音がするよ。風で木の葉もゆれているね。', answers: [
    { key: 'kind', text: '近くの仲間に声をかけて、いっしょに確かめる', kid: 'なかまをさそって、いっしょに行く' },
    { key: 'brave', text: '音のする方へ、自分の足で進んでみる', kid: '音のするほうへ、自分で進んでみる' },
    { key: 'wise', text: '風の向きと音の間隔を観察する', kid: '風と音をよく見て、考えてみる' }
  ] },
  { place: '鈴の城下町', icon: '♜', title: '町の時計台が、止まってしまった。', body: '待ち合わせの鈴が鳴らず、町のみんなが困っています。時計台の前には、修理道具と町の人たちが集まっています。', kid: '町の時計が止まっちゃった。みんなが困っているよ。どうする？', answers: [
    { key: 'kind', text: '困っている人に声をかけ、役割を分ける', kid: 'みんなに声をかけて、できることを分ける' },
    { key: 'brave', text: '時計台にのぼり、まず動かせるか試す', kid: '時計台にのぼって、まずやってみる' },
    { key: 'wise', text: '道具を調べて、止まった理由を見つける', kid: '道具を見て、止まった理由を考える' }
  ] }
];

const TRAITS = { kind: { name: 'よりそう力', hue: 8, rank: 'つながりをつくる旅人' }, brave: { name: '踏み出す力', hue: 24, rank: '一歩をひらく旅人' }, wise: { name: '見つける力', hue: 42, rank: 'ひらめきを届ける旅人' } };
const CAT_NAMES = ['ミケ','スズ','コハク','つむぎ','あんず','よつば','まる','しらたま'];
const config = window.IENEKO_CONFIG || {};
const state = { step: 0, stats: { kind: 0, brave: 0, wise: 0 }, answers: [], kids: true, cat: null, playerId: '', optedIn: false };
let cats = [];
let activeScreen = 'home';
let presenceTimer = null;
const $ = (s, root = document) => root.querySelector(s);

function parseCSV(text) {
  const rows = []; let row = []; let cell = ''; let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted && c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
    else if (c === '"') quoted = !quoted;
    else if (c === ',' && !quoted) { row.push(cell); cell = ''; }
    else if ((c === '\n' || c === '\r') && !quoted) { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); if (row.some(v => v.trim())) rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const headers = (rows.shift() || []).map(x => x.replace(/^\uFEFF/, '').trim());
  return rows.map(r => Object.fromEntries(headers.map((h, i) => [h, r[i] || '']))).map((r, i) => ({
    no: Number(r.No || r.no || i + 1), domain: r['領域'] || '', type: r['タイプ名'] || '', name: r['猫ネーム'] || `家猫 ${i + 1}`,
    catch: r['キャッチ'] || '', x: Number(r.X) || 5, y: Number(r.Y) || 5, source: r['出典'] || '', evidence: r['根拠区分'] || ''
  }));
}

function loadState() {
  try {
    const old = JSON.parse(localStorage.getItem('ieneko2-state') || '{}');
    if (Number.isInteger(old.step) && old.step > 0 && old.step < QUESTS.length) Object.assign(state, old);
    state.playerId = old.playerId || (crypto.randomUUID ? crypto.randomUUID() : `p${Date.now()}${Math.random().toString(36).slice(2)}`);
  } catch { state.playerId = `p${Date.now()}${Math.random().toString(36).slice(2)}`; }
  saveState();
}
function saveState() { localStorage.setItem('ieneko2-state', JSON.stringify(state)); }
function localScreen(id) {
  activeScreen = id;
  document.querySelectorAll('.screen').forEach(el => el.classList.toggle('hidden', el.id !== id));
  if (id === 'world') refreshWorld();
  if (id === 'cats') renderCats();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function selectedTrait() { return Object.keys(state.stats).sort((a,b) => state.stats[b] - state.stats[a] || ['kind','brave','wise'].indexOf(a)-['kind','brave','wise'].indexOf(b))[0]; }
function chooseCat() {
  if (!cats.length) return null;
  const x = 1 + (state.stats.brave / 10) * 9;
  const y = 1 + (state.stats.kind / 10) * 9;
  return [...cats].sort((a,b) => Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))[0];
}
function appearance(trait, step = state.step) {
  const value = state.stats[trait] || 0;
  const hue = (TRAITS[trait].hue + value * 5 + step * 3) % 360;
  const sat = 78 + ((state.stats.wise || 0) % 4) * 9;
  const brightness = 1 + (value % 3) * .025;
  const flip = (state.stats.kind + state.stats.brave + step) % 2 ? -1 : 1;
  const tilt = ((state.stats.wise % 3) - 1) * 1.5;
  return `hue-rotate(${hue}deg) saturate(${sat}%) brightness(${brightness})`;
}
function refreshCat() {
  const trait = selectedTrait();
  const cat = state.cat || chooseCat();
  const eyes = { kind: '#83b8a2', brave: '#bd8652', wise: '#83a9d1' };
  const expressions = { kind: '⌣', brave: '✦', wise: '？' };
  [$('.companion-image'), $('.finished-cat')].filter(Boolean).forEach(el => {
    el.style.setProperty('--iris', eyes[trait]);
    el.dataset.expression = expressions[trait];
    el.dataset.trait = trait;
  });
  const name = cat?.name || CAT_NAMES[0];
  ['#heroCatName','#companionName','#finishedName'].forEach(s => { const el=$(s); if(el) el.textContent=name; });
  ['#companionImage','#finishedCatImage'].forEach(s => { const el=$(s); if(el) { el.style.filter=appearance(trait); el.style.transform=`scaleX(${(state.stats.brave % 2) ? -1 : 1}) rotate(${(state.stats.wise % 3)-1}deg)`; } });
  const no = String(cat?.no || 1).padStart(2,'0');
  ['#companionNo','#finishedNo'].forEach(s => { const el=$(s); if(el) el.textContent=`NO. ${no}`; });
  const mood = state.stats.kind >= state.stats.brave && state.stats.kind >= state.stats.wise ? '目を細めて、あなたのそばへ。' : state.stats.brave >= state.stats.wise ? 'しっぽを立てて、先へ進む。' : '耳を立てて、道の先を見つめる。';
  if ($('#companionMood')) $('#companionMood').textContent = mood;
  $('#trait1').textContent=`よりそう ${state.stats.kind}`; $('#trait2').textContent=`踏み出す ${state.stats.brave}`; $('#trait3').textContent=`見つける ${state.stats.wise}`;
}
function renderStoryMap() {
  $('#storyMap').innerHTML=QUESTS.map((q,i)=>`<div class="story-stop ${i<state.step?'passed':''} ${i===state.step?'current':''}"><i>${i<state.step?'✓':q.icon}</i><span>${q.place.replace('の','')}</span></div>`).join('');
  $('#mapPosition').textContent=`地点 ${Math.min(state.step+1,5)} / 5`;
  document.querySelectorAll('.map-location').forEach((node,i)=>{ node.classList.toggle('active',i===Math.min(state.step,4)); node.classList.toggle('you',state.optedIn && i===state.step); });
}
function renderQuestion() {
  const q=QUESTS[state.step]; if(!q) return finishJourney();
  $('#chapterLabel').textContent=`第${state.step+1}地点`;
  $('#stepCount').textContent=`${state.step+1} / ${QUESTS.length}`;
  $('#progressFill').style.width=`${state.step/QUESTS.length*100}%`;
  $('#placeName').textContent=q.place;
  $('#questionTitle').textContent=q.title;
  $('#questionBody').textContent=state.kids?q.kid:q.body;
  $('#answerList').innerHTML=q.answers.map((a,i)=>`<button class="answer-button" data-trait="${a.key}"><span class="answer-key">${String.fromCharCode(65+i)}</span><span>${state.kids?a.kid:a.text}</span><span class="answer-arrow">↗</span></button>`).join('');
  document.querySelectorAll('.answer-button').forEach(btn=>btn.addEventListener('click',()=>selectAnswer(btn.dataset.trait)));
  renderStoryMap(); refreshCat();
}
function selectAnswer(trait) {
  state.stats[trait] += 2; state.answers.push(trait); state.step += 1; state.cat=chooseCat(); saveState();
  if(config.gasUrl && state.optedIn) sendEvent({event:'answer',step:state.step,place:QUESTS[state.step-1].place,trait,catNo:state.cat?.no||1});
  refreshCat();
  if(state.step >= QUESTS.length) finishJourney(); else renderQuestion();
}
function finishJourney() {
  state.cat=chooseCat(); saveState();
  const trait=selectedTrait(), selected=TRAITS[trait], cat=state.cat;
  localScreen('complete');
  $('#resultTitle').textContent=selected.rank;
  $('#resultText').textContent=`${selected.name}を使って、${cat?.name || '家猫'}が生まれました。${cat?.catch || 'あなたの歩みを映す家猫です。'}`;
  $('#finishedName').textContent=cat?.name || CAT_NAMES[0];
  $('#finishedType').textContent=cat?.type || selected.rank;
  $('#finishedTraits').innerHTML=Object.keys(TRAITS).map(k=>`<span>${TRAITS[k].name} ${state.stats[k]}</span>`).join('');
  $('#finishedDate').textContent=new Intl.DateTimeFormat('ja-JP',{dateStyle:'medium'}).format(new Date());
  refreshCat(); renderStoryMap();
  if(config.gasUrl && state.optedIn) sendEvent({event:'complete',step:5,place:QUESTS[4].place,trait,catNo:cat?.no||1});
}
function startJourney() { state.step=0; state.stats={kind:0,brave:0,wise:0}; state.answers=[]; state.cat=cats[0]||null; saveState(); localScreen('journey'); renderQuestion(); }
function drawCard() {
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d'); canvas.width=1080;canvas.height=1350;
  const trait=selectedTrait(), c=state.cat||chooseCat();
  const grad=ctx.createLinearGradient(0,0,1080,1350);grad.addColorStop(0,'#294562');grad.addColorStop(1,'#14243c');ctx.fillStyle=grad;ctx.fillRect(0,0,1080,1350);
  ctx.fillStyle='#f2d99f';ctx.beginPath();ctx.arc(540,515,340,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#203959';ctx.font='500 32px monospace';ctx.fillText('IENEKО QUEST II',80,95);ctx.fillText(`NO. ${String(c?.no||1).padStart(2,'0')}`,820,95);
  const img=$('#finishedCatImage'); if(img.complete) { ctx.save(); ctx.filter=appearance(trait); ctx.translate(1080,0);ctx.scale(-1,1);ctx.drawImage(img,180,170,720,700);ctx.restore(); }
  ctx.fillStyle=({kind:'#83b8a2',brave:'#bd8652',wise:'#83a9d1'})[trait];ctx.font='700 34px sans-serif';ctx.textAlign='center';ctx.fillText(({kind:'⌣',brave:'✦',wise:'？'})[trait],540,500);ctx.textAlign='left';
  ctx.fillStyle='#fffdf6';ctx.font='700 28px sans-serif';ctx.fillText('あなたの旅ねこ',85,930);
  ctx.font='900 66px sans-serif';ctx.fillText(c?.name||'家猫',85,1015);
  ctx.font='500 30px sans-serif';ctx.fillText(c?.type||TRAITS[trait].rank,85,1075);
  ctx.fillStyle='#ead4a7';ctx.font='700 24px sans-serif';ctx.fillText(Object.keys(TRAITS).map(k=>`${TRAITS[k].name} ${state.stats[k]}`).join('　'),85,1160);
  ctx.fillStyle='#ffffff75';ctx.fillRect(85,1210,910,1);ctx.fillStyle='#dbe1e7';ctx.font='500 22px sans-serif';ctx.fillText('答えに正解はありません。あなたの歩みの記録です。',85,1260);
  return canvas;
}
function downloadCard() { const a=document.createElement('a'); a.href=drawCard().toDataURL('image/png'); a.download=`ieneko-card-${String(state.cat?.no||1).padStart(3,'0')}.png`; a.click(); }
function renderCats(query='') {
  const q=query.trim().toLowerCase(); const list=cats.filter(c=>`${c.name} ${c.type} ${c.domain}`.toLowerCase().includes(q));
  $('#catCount').textContent=`${list.length} / 100匹`;
  $('#catGallery').innerHTML=list.map(c=>`<article class="cat-tile"><div class="cat-number">NO. ${String(c.no).padStart(3,'0')}</div><div class="cat-avatar"><img src="dist/mike-main-visual.png" alt="${c.name}" style="filter:hue-rotate(${(c.no*37)%360}deg) saturate(${80+(c.no%4)*12}%);transform:scaleX(${c.no%2?-1:1})"></div><b>${c.name}</b><small>${c.type}</small></article>`).join('');
}
function gasEndpoint() { return String(config.gasUrl||'').trim(); }
function sendEvent(payload) {
  const url=gasEndpoint(); if(!url) return;
  const body={...payload,playerId:state.playerId,name:($('#playerName')?.value||'たびねこ').trim().slice(0,16)||'たびねこ',step:payload.step||state.step,catNo:payload.catNo||state.cat?.no||1};
  fetch(url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body),keepalive:true}).catch(()=>{});
}
function loadWorld(callback) {
  const url=gasEndpoint(); if(!url) { callback([]);return; }
  const cb=`ienekoMap_${Date.now()}_${Math.floor(Math.random()*10000)}`;
  const timer=setTimeout(()=>{delete window[cb];callback(null);},8000);
  window[cb]=(data)=>{clearTimeout(timer);delete window[cb];callback(Array.isArray(data)?data:[]);};
  const script=document.createElement('script');script.src=`${url}?mode=map&callback=${cb}&_=${Date.now()}`;script.onerror=()=>{clearTimeout(timer);delete window[cb];callback(null);};document.body.appendChild(script);script.onload=()=>script.remove();
}
function refreshWorld() {
  if(!gasEndpoint()) { $('#worldStatus').innerHTML='<i></i>GAS連携は未設定';renderWorld([]);return; }
  $('#worldStatus').innerHTML='<i></i>世界の足あとを確認中';
  loadWorld(players=>{if(players===null){$('#worldStatus').innerHTML='<i></i>いまは世界とつながっていません';return;} $('#worldStatus').innerHTML='<i></i>世界とつながっています';renderWorld(players);});
}
function renderWorld(players) {
  $('#worldCount').textContent=players.length;
  $('#playerList').innerHTML=players.length?players.map(p=>`<div class="player-row"><span class="player-dot">🐾</span><span><b>${escapeHtml(p.name||'たびねこ')}</b><small>${escapeHtml(p.place||'冒険中')}</small></span><em>NO.${String(p.catNo||1).padStart(2,'0')}</em></div>`).join(''):'<p class="empty-state">世界はまだ静かです。あなたが最初の灯りになる？</p>';
  const g=$('#playerMarkers');g.replaceChildren();players.forEach((p,i)=>{const loc=Math.max(0,Math.min(4,Number(p.step||1)-1)),node=document.querySelector(`.map-location[data-loc="${loc}"]`);if(!node)return;const tr=node.getAttribute('transform').match(/translate\(([^ ]+) ([^)]+)\)/);const x=Number(tr[1])+((i%3)-1)*25,y=Number(tr[2])+Math.floor(i/3)*25;const group=document.createElementNS('http://www.w3.org/2000/svg','g');group.setAttribute('class',`player-marker ${p.playerId===state.playerId?'you':''}`);group.setAttribute('transform',`translate(${x} ${y-34})`);group.innerHTML=`<circle r="14"/><text y="5">🐾</text>`;g.appendChild(group);});
}
function escapeHtml(s) { return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function setWorldJoin(on) {
  state.optedIn=on;saveState();$('#joinWorld').checked=on;$('#joinBox')?.classList.toggle('is-enabled',on);$('.join-box').classList.toggle('is-enabled',on);
  if(on) { $('#joinStatus').textContent=gasEndpoint()?'参加を準備しています。名前はいつでも変更できます。':'GASの接続設定後に、マップへ参加できます。'; }
  else { sendEvent({event:'leave',step:state.step,place:QUESTS[Math.max(0,Math.min(4,state.step))].place});$('#joinStatus').textContent='マップ参加をオフにしました。'; }
}
function setupPresence() {
  if(presenceTimer) clearInterval(presenceTimer);
  if(!state.optedIn||!gasEndpoint()) return;
  const send=()=>sendEvent({event:'presence',step:Math.min(5,Math.max(1,state.step+1)),place:QUESTS[Math.max(0,Math.min(4,state.step))].place,catNo:state.cat?.no||1});
  send();presenceTimer=setInterval(send,45000);
}

async function init() {
  loadState();
  try { const r=await fetch('dist/ieneko-100.csv'); if(!r.ok) throw new Error('csv'); cats=parseCSV(await r.text()); }
  catch { cats=[]; }
  if(state.step>=QUESTS.length && state.answers.length>=QUESTS.length) { state.step=QUESTS.length;state.cat=chooseCat(); }
  $('#kidsMode').setAttribute('aria-pressed',String(state.kids));document.body.classList.toggle('kids-on',state.kids);$('#kidsMode').textContent=`Kids版　${state.kids?'ON':'OFF'}`;
  refreshCat(); renderQuestion();
  document.querySelectorAll('[data-screen]').forEach(b=>b.addEventListener('click',()=>localScreen(b.dataset.screen)));
  $('#startJourney').addEventListener('click',startJourney);$('#downloadCard').addEventListener('click',downloadCard);$('#again').addEventListener('click',startJourney);
  $('#kidsMode').addEventListener('click',()=>{state.kids=!state.kids;saveState();document.body.classList.toggle('kids-on',state.kids);$('#kidsMode').textContent=`Kids版　${state.kids?'ON':'OFF'}`;$('#kidsMode').setAttribute('aria-pressed',String(state.kids));if(activeScreen==='journey')renderQuestion();});
  $('#readQuestion').addEventListener('click',()=>{if(!('speechSynthesis'in window))return;const q=QUESTS[state.step];const u=new SpeechSynthesisUtterance(state.kids?q.kid:q.body);u.lang='ja-JP';u.rate=state.kids?.83:.96;speechSynthesis.cancel();speechSynthesis.speak(u);});
  $('#joinWorld').checked=state.optedIn;$('.join-box').classList.toggle('is-enabled',state.optedIn);$('#joinWorld').addEventListener('change',e=>{setWorldJoin(e.target.checked);setupPresence();});
  $('#joinButton').addEventListener('click',()=>{if(!state.optedIn)setWorldJoin(true);if(!gasEndpoint()){ $('#joinStatus').textContent='接続URLはREADMEの手順で設定します。';return;}sendEvent({event:'presence',step:Math.min(5,Math.max(1,state.step)),place:QUESTS[Math.max(0,Math.min(4,state.step))].place,catNo:state.cat?.no||1});$('#joinStatus').textContent='冒険者として世界に登場しました。';refreshWorld();setupPresence();});
  $('#refreshWorld').addEventListener('click',refreshWorld);$('#catSearch').addEventListener('input',e=>renderCats(e.target.value));
  window.addEventListener('beforeunload',()=>{if(state.optedIn)sendEvent({event:'leave',step:state.step,place:QUESTS[Math.max(0,Math.min(4,state.step))].place});});
  setupPresence();
  if(state.step>0 && state.step<QUESTS.length) { const resume=document.createElement('button');resume.className='button small ghost';resume.textContent='つづきから';resume.addEventListener('click',()=>{localScreen('journey');renderQuestion();});$('.hero-buttons').append(resume); }
}

init();
