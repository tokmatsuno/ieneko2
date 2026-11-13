(function(){
  'use strict';
  const data=window.IENEKO_LIFESTYLE_DATA,core=window.LifestyleCore;
  if(!data||!core)return;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const source=id=>data.datasets.find(d=>d.id===id);
  const number=r=>r.unit==='mean_0_10'?Number(r.value).toFixed(2):Number(r.value).toFixed(1);
  function reference(r){
    const d=source(r.dataset_id),mean=r.unit==='mean_0_10';
    const definition=r.dataset_id==='sociallife2021'?'過去1年間に実施した人の割合。好きな人の割合ではありません。':r.dataset_id==='society2025'?'原典の選択肢への全国の回答割合です。':'現在の満足・不満に影響する項目として挙げた人の割合（複数回答）。';
    return `<article class="life-reference"><p class="life-kicker">${esc(d.publisher)} / ${r.year}年</p><h4>${esc(r.label.replace(/^[１２３４５６７８９０]+．/,''))}</h4><b>${number(r)}<small>${mean?' / 10点':'%'}</small></b><div class="life-reference-bar" aria-hidden="true"><i style="width:${mean?r.value*10:r.value}%"></i></div><p>${mean?'満足度の平均（0〜10点）。':definition}</p><small>${esc(r.population)}${typeof r.denominator==='number'?' / n='+r.denominator.toLocaleString('ja-JP'):''}</small><a href="${esc(d.url)}" target="_blank" rel="noopener">${esc(r.table)}の出典 ↗</a></article>`;
  }
  function mountWidget(host,index){
    const base=host.dataset.lifeBase||'',id='life-'+index;
    host.classList.add('life-panel');
    host.innerHTML=`<div class="life-heading"><div><p class="life-kicker">好きなこと × 心地よい関わり方 × OPEN DATA</p><h2>好きから、まちへの入口を。</h2><p>趣味も、人との距離感も、ひとりずつ違う。<br>3つの公開調査を参考に、自治会・町内会で試す案を探してみよう。</p></div><img src="${base}dist/mike-main-visual.png" alt="前足を上げて迎える三毛猫" loading="lazy"></div>
    <p class="life-privacy">ここで選ぶのは、提案を探すための条件です。診断の回答には追加せず、外部にも送信しません。</p>
    <div class="life-picker">
      <fieldset><legend><span>01</span>どんなことが気になる？</legend><div class="life-interest-grid">${core.INTERESTS.map(i=>`<label class="life-interest"><input type="radio" name="${id}-interest" value="${i.id}"><span><i aria-hidden="true">${i.icon}</i>${esc(i.label)}</span></label>`).join('')}</div></fieldset>
      <div class="life-select-grid"><label for="${id}-relation"><span>02</span>近所との、心地よい距離<select id="${id}-relation" data-life-relation><option value="">選んでください</option>${core.RELATIONS.map(i=>`<option value="${i.id}">${esc(i.label)}</option>`).join('')}</select></label><label for="${id}-priority"><span>03</span>この時間で大切にしたいこと<select id="${id}-priority" data-life-priority><option value="">選んでください</option>${core.PRIORITIES.map(i=>`<option value="${i.id}">${esc(i.label)}</option>`).join('')}</select></label></div>
    </div>
    <p class="life-status" role="status" aria-live="polite">3つの条件を選ぶと、遊び・おやつ・環境の案が現れます。</p>
    <div data-life-result hidden><div class="life-result-heading"><p class="life-kicker">うちのまちで、小さく試すなら</p><h3 data-life-title></h3><p>制作者による検討案です。調査が効果を実証した施策ではありません。</p></div><div class="life-tools" data-life-tools></div><details class="life-evidence"><summary>この案で参照した、3つの調査の数字を見る</summary><p>別々の調査の全国集計です。数値を掛け合わせたり、特定の町内会や家猫タイプの割合に置き換えたりしません。</p><div class="life-references" data-life-references></div><p>「近所との距離」「大切にしたいこと」は、原典を参考に制作者が言い換えた選択肢です。原典の調査をそのまま再実施するものではありません。</p></details></div>
    <div class="life-foot"><a href="${base}lifestyle-data/?v=2.23">使った3つのデータセット・利用条件 ↗</a><a href="${base}lifestyle-data/ieneko-lifestyle-reference.csv" download>参照データのCSVをダウンロード ↓</a><button type="button" data-life-reset>条件を選び直す</button></div>`;
    const update=()=>{
      const proposal=core.propose({interest:host.querySelector('input[type=radio]:checked')?.value,relation:host.querySelector('[data-life-relation]').value,priority:host.querySelector('[data-life-priority]').value},data);
      host.querySelector('[data-life-result]').hidden=!proposal.ready;
      if(!proposal.ready){host.querySelector('.life-status').textContent='3つの条件を選ぶと、遊び・おやつ・環境の案が現れます。';return;}
      host.querySelector('.life-status').textContent=`${proposal.interest.label}・${proposal.relation.label}・${proposal.priority.label}から、検討案を表示しました。`;
      host.querySelector('[data-life-title]').textContent=proposal.title;
      host.querySelector('[data-life-tools]').innerHTML=proposal.tools.map((t,i)=>`<article class="life-tool life-tool-${i}"><span aria-hidden="true">${['🌿','🍪','🏡'][i]}</span><p class="life-kicker">${esc(t.label)}</p><h4>${esc(t.title)}</h4><p>${esc(t.text)}</p></article>`).join('');
      host.querySelector('[data-life-references]').innerHTML=proposal.references.map(reference).join('');
    };
    host.addEventListener('change',update);
    host.querySelector('[data-life-reset]').addEventListener('click',()=>{host.querySelectorAll('input').forEach(i=>i.checked=false);host.querySelectorAll('select').forEach(i=>i.value='');update();host.querySelector('input').focus();});
  }
  function mountSources(host){
    const base=host.dataset.lifeBase||'';
    host.innerHTML=`<div class="life-source-heading"><p class="life-kicker">3つの公式調査を、アプリの中へ</p><h2>使ったデータセット</h2><p>公開済みの集計表を取得し、取り込んだ35項目を出典付きCSVに整理しました。個票は使用していません。</p><a class="life-download" href="${base}lifestyle-data/ieneko-lifestyle-reference.csv" download>参照した35項目のCSVをダウンロード ↓</a></div><div class="life-source-grid">${data.datasets.map((d,i)=>`<article class="life-source-card"><p class="life-kicker">DATASET 0${i+1} / ${esc(d.publisher)}</p><h3><a href="${esc(d.url)}" target="_blank" rel="noopener">${esc(d.title)}</a></h3><p class="life-source-use">${esc(d.use)}</p><dl><dt>採用した表</dt><dd>${esc(d.tables)}</dd><dt>調査の対象・範囲</dt><dd>${esc(d.scope)}</dd><dt>数字を読むときに</dt><dd>${esc(d.limitations)}</dd><dt>利用条件</dt><dd><a href="${esc(d.license_url)}" target="_blank" rel="noopener">${esc(d.license)}</a></dd></dl><p class="life-attribution">${esc(d.attribution)}。項目の抽出・表示用の丸め・CSV化を実施。</p><a href="${esc(d.url)}" target="_blank" rel="noopener">提供元の調査ページ ↗</a><details><summary>採用した元ファイル</summary><ul>${d.files.map(f=>`<li><a href="${esc(f.url)}" target="_blank" rel="noopener">提供元：${esc(f.name)} ↗</a><br><a href="${base}lifestyle-data/raw/${esc(f.name)}" download>取得時の元ファイルをダウンロード ↓</a></li>`).join('')}</ul></details></article>`).join('')}</div><div class="life-method-note"><h3>数字が示すことと、提案したこと</h3><p>調査の実施率・回答割合・満足度平均は別の指標です。CSVは単位、分母、調査年、出典ファイル、セル位置を1行ずつ持ちます。35項目は全設問の網羅ではなく、この機能で使う抜粋です。</p><p>遊び・おやつ・環境の具体案はTeam 1の設計です。どの案が参加を増やすかは未検証。全国集計から個人の内面や町内会の特徴を推定しません。5つのまちの仮想90件に、これらの趣味や価値観を後付けしていません。</p><p>新しい条件選択は提案の絞り込み専用です。既存の5問の回答・公開同意・GAS保存・猫CSVの項目は維持しています。</p><div class="life-foot"><a href="${base}lifestyle-data/data-dictionary.json" target="_blank">CSVの項目説明 ↗</a><a href="${base}lifestyle-data/sources.json" target="_blank">出典と加工の記録 ↗</a><a href="${base}lifestyle-data/data.json" target="_blank">参照値と元ファイルの照合情報（JSON）↗</a></div></div>`;
  }
  function mountValues(host){
    host.innerHTML=`<details class="life-value-details"><summary>取り込んだ35項目を一覧で確認する</summary><div class="life-value-scroll"><table><caption>公式集計の抜粋。単位と分母は項目ごとに異なります。</caption><thead><tr><th>調査年・表</th><th>項目</th><th>値・単位</th><th>分母・対象</th><th>出典の位置</th></tr></thead><tbody>${data.records.map(r=>`<tr><td>${r.year} / ${esc(r.table)}</td><td>${esc(r.label)}</td><td>${number(r)}${r.unit==='percent'?'%':' / 10点'}</td><td>${esc(r.denominator)}<br>${esc(r.population)}</td><td>${esc(r.source_locator)}</td></tr>`).join('')}</tbody></table></div></details>`;
  }
  function init(){document.querySelectorAll('[data-lifestyle-widget]').forEach(mountWidget);document.querySelectorAll('[data-lifestyle-sources]').forEach(mountSources);document.querySelectorAll('[data-lifestyle-values]').forEach(mountValues);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
