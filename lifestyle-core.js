(function(root,factory){
  const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LifestyleCore=api;
})(typeof window==='object'?window:this,function(){
  'use strict';
  // These activities are authored discussion prompts, not findings of the surveys.
  const INTERESTS=[
    {id:'gardening',label:'花・庭いじり',icon:'🌱',play:'持ち寄り鉢で、小さな花壇づくり',detail:'好きな花や育て方を持ち寄る。水やりだけの役割も用意。',snack:'花を眺める、お茶の休憩',space:'道具の貸出と、ひとりでも手入れできる鉢の置き場'},
    {id:'cooking',label:'料理・お菓子',icon:'🍪',play:'一品レシピの交換会',detail:'料理を作らず、レシピを見るだけでも参加できる。',snack:'少量の試食と、持参のおやつ',space:'材料・アレルギー表示、調理しない役割、持ち帰れるレシピ'},
    {id:'instrument',label:'楽器を弾く',icon:'🎸',play:'一曲だけの、まちかどセッション',detail:'演奏・手拍子・聴くだけの席を選べる。',snack:'一曲のあとに、お茶を一杯',space:'音量と終了時刻を先に案内。聴くだけの席も用意'},
    {id:'music',label:'音楽を聴く',icon:'🎧',play:'好きな一曲を持ち寄る時間',detail:'曲名だけをカードに書く参加もできる。',snack:'音楽と一緒に、おやつの時間',space:'静かな席と、感想を話さなくてよい席を用意'},
    {id:'reading',label:'本を読む',icon:'📖',play:'一冊持ち寄り、小さな本棚',detail:'おすすめの一行を添える。紹介せず読むだけでもよい。',snack:'読書の合間の、静かなお茶',space:'会話不要の読書席と、本の返却方法を案内'},
    {id:'photography',label:'写真を撮る',icon:'📷',play:'まちの好きな景色を、一枚ずつ',detail:'写真だけの持ち寄りも歓迎。人の写り込みと掲載許可を確認。',snack:'写真を眺める、おやつの卓',space:'短い散歩コースと、歩かず写真を見る席を用意'},
    {id:'gaming',label:'ゲーム',icon:'🎮',play:'一回遊んで交代、ゲームの卓',detail:'操作説明の時間と、見て楽しむ席をつくる。',snack:'交代時間に、おやつでひと休み',space:'勝敗で役割を決めず、初心者の時間と見学席を用意'},
    {id:'crafts',label:'手芸・編み物',icon:'🧶',play:'ひと目から始める、手しごと卓',detail:'材料を少しずつ持ち寄る。途中でやめても作品を持ち帰れる。',snack:'手を休めて、お茶とおやつ',space:'道具の貸出と、会話せず作業できる席を用意'},
    {id:'diy',label:'日曜大工',icon:'🔨',play:'小さな看板をつくる時間',detail:'絵・文字・道具の準備など、作業を小さく分ける。',snack:'作業の区切りに、おやつ休憩',space:'作業の安全確認と、工具を使わない役割を用意'},
    {id:'shogi',label:'将棋',icon:'☖',play:'一局だけの、まちの縁台',detail:'観戦・駒の動かし方・対局の入口を分ける。',snack:'対局の合間に、お茶を一杯',space:'初めての人向けの卓と、観戦だけの席を用意'},
    {id:'manga',label:'マンガ',icon:'💬',play:'好きな一冊を持ち寄る本棚',detail:'話さず読むだけでも参加できる。貸借のルールを先に決める。',snack:'読書休憩の、おやつコーナー',space:'静かに読む席と、おすすめを書けるカードを用意'},
    {id:'camping',label:'キャンプ',icon:'⛺',play:'近くの広場で、道具を見せ合う',detail:'宿泊せず、道具の紹介だけで試す。会場の利用ルールを確認。',snack:'火を使わない、おやつの持ち寄り',space:'道具不要の見学席と、日帰りの時間割を用意'}
  ];
  const RELATIONS=[
    {id:'greeting',label:'挨拶くらいがいい',short:'挨拶だけでも',rule:'名前や連絡先の交換を求めず、立ち寄り・退出は自由に。'},
    {id:'chat',label:'世間話を楽しみたい',short:'気が向いたら会話も',rule:'話しても、話さず過ごしてもよい小さな席をつくる。'},
    {id:'events',label:'行事に参加するくらい',short:'その日だけの参加で',rule:'その日の役割と終了時刻を明示し、継続参加を条件にしない。'},
    {id:'mutual',label:'困った時は助け合いたい',short:'できる役割を持ち寄って',rule:'できること・頼みたいことを任意で出し、断れる約束も決める。'},
    {id:'none',label:'地域での付き合いは必要ない',short:'今回は眺めるだけで',rule:'参加や連絡先の登録を求めない。案内だけを持ち帰れるように。'}
  ];
  const PRIORITIES=[
    {id:'hobby_fulfilment',label:'好きなことを楽しむ',detail:'成果物より、本人が楽しめる時間を大切にする。'},
    {id:'companions',label:'一緒に楽しめる仲間',detail:'同じ趣味の小さな卓をつくり、会話への参加も任意にする。'},
    {id:'opportunity',label:'参加しやすい機会・条件',detail:'所要時間・費用・見学可否を、申し込み前に知らせる。'}
  ];
  function record(data,key){return data.records.find(r=>r.key===key);}
  function normalize(options={}){
    return {interest:INTERESTS.some(r=>r.id===options.interest)?options.interest:'',
      relation:RELATIONS.some(r=>r.id===options.relation)?options.relation:'',
      priority:PRIORITIES.some(r=>r.id===options.priority)?options.priority:''};
  }
  function propose(options,data){
    const chosen=normalize(options),interest=INTERESTS.find(r=>r.id===chosen.interest),relation=RELATIONS.find(r=>r.id===chosen.relation),priority=PRIORITIES.find(r=>r.id===chosen.priority);
    if(!interest||!relation||!priority)return {ready:false,chosen};
    const rest=relation.id==='none';
    return {ready:true,chosen,interest,relation,priority,
      status:'authored_proposal_unverified',
      title:rest?'今日は、案内を眺めるだけ。':interest.play,
      tools:[
        {id:'matatabi',label:'またたび / 遊びのツール',title:rest?'参加せず、好きな情報を見る':interest.play,text:rest?'作品やレシピなど、見たい情報だけを持ち帰る。':interest.detail},
        {id:'churu',label:'ちゅーる / おやつ',title:rest?'おやつの案内も、受け取りは任意':interest.snack,text:'飲食は任意。材料やアレルギー、持ち込みのルールを先に案内する。'},
        {id:'tower',label:'キャットタワー / 環境',title:relation.short,text:relation.rule+' '+(rest?'':interest.space+'。 ')+priority.detail}
      ],
      references:[record(data,interest.id),record(data,relation.id),record(data,priority.id)]};
  }
  return Object.freeze({INTERESTS,RELATIONS,PRIORITIES,normalize,propose,record});
});
