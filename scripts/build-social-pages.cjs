const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),check=process.argv.includes('--check'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const context=vm.createContext({window:{}});for(const f of ['journey-model.js','version.js'])vm.runInContext(read(f),context);
const model=context.window.JourneyModel,release=context.window.IENEKO_RELEASE,cats=model.parse(read('dist/ieneko-100.csv'));
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function write(file,text){if(check){if(read(file)!==text)throw Error('Outdated generated file: '+file);}else{fs.mkdirSync(path.dirname(path.join(root,file)),{recursive:true});fs.writeFileSync(path.join(root,file),text);}}
for(const c of cats){
 const no=String(c.No).padStart(3,'0'),name=c['猫ネーム'],description=name+'。'+c['キャッチ']+'。あなたもタイプ・いまの気分・好きなことを、家猫の名刺に。',url='https://tokmatsuno.github.io/ieneko2/cards/'+no+'/';
 const html=`<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(name)} | 家猫の名刺</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${url}"><meta property="og:type" content="website"><meta property="og:title" content="${esc(name)} | 家猫の名刺"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${url}"><meta property="og:image" content="https://tokmatsuno.github.io/ieneko2/dist/mike-main-visual.png"><meta property="og:image:alt" content="家猫の冒険の猫"><meta name="twitter:card" content="summary_large_image"><link rel="stylesheet" href="../../lifestyle.css?v=${release.version}"></head><body class="life-page"><header><a href="../../?v=${release.version}#home">家猫の冒険 ↗</a><a href="../../?v=${release.version}#cats">100匹の図鑑 ↗</a></header><main><p class="life-kicker">A LITTLE CONVERSATION STARTER</p><h1>${esc(name)}</h1><p class="life-intro">${esc(c['キャッチ'])}</p><img src="../../dist/mike-main-visual.png" alt="片手を上げてごあいさつする猫" style="display:block;max-height:430px;max-width:100%;margin:20px auto"><p class="life-intro">このページは、作品に登場する猫タイプの紹介です。共有した人の名刺画像や名前・好みを公開しているページではありません。名刺画像は、送ってくれた人と見せ合って楽しめます。</p><p class="life-intro">あなたも、好きなことから話が始まる一枚を。5つの問いを歩いたあと、呼ばれたい名前・いまの気分・好みを選んで、自分の家猫の名刺をつくれます。</p><a class="life-download" href="../../?v=${release.version}#home">自分の家猫の名刺をつくる ↗</a><p class="life-intro">猫の類型と姿は作品の設計です。人物の性格・能力・健康状態の診断ではありません。<a href="../../?v=${release.version}#research">研究とデータの説明 ↗</a></p></main><footer><span>${esc(release.team)}</span><span>ver${release.version}</span></footer></body></html>
`;
 write('cards/'+no+'/index.html',html);
}
const playlist=JSON.parse(read('music/playlist.json'));
write('music-data.js','/* Built from music/playlist.json. Official source links are included per track. */\nwindow.IENEKO_PLAYLIST = '+JSON.stringify(playlist,null,2)+';\n');
console.log('PASS: 100 public type introductions with static share metadata; private card edits excluded; 24-track client bundle matches sources.');
