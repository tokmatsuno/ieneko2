const POSES = {
  hello: {
    src: "dist/mike-main-visual.png",
    name: "いっしょに、一歩。",
    alt: "片手を上げて誘う猫",
  },
  scared: {
    src: "dist/cat-scared.png",
    name: "ちょっと、どきどき。",
    alt: "耳を倒し、体を低くして様子を見る猫",
  },
  hungry: {
    src: "dist/cat-hungry.png",
    name: "ごはん、まだかにゃ？",
    alt: "空の器の前で、ごはんを待つ猫",
  },
  curious: {
    src: "dist/cat-curious.png",
    name: "これ、なんだろう。",
    alt: "小さな芽をのぞきこむ好奇心いっぱいの猫",
  },
  resting: {
    src: "dist/cat-resting.png",
    name: "ひと休みも、だいじ。",
    alt: "目を閉じ、安心して丸くなる猫",
  },
};

// Each authored answer refers to an existing CSV cat as a design anchor.
// Its x/y values are loaded verbatim from that row, not a validated scale.
const QUESTS = window.IENEKO_QUESTS;
const JourneyModel = window.JourneyModel;

const $ = (s) => document.querySelector(s);
const KID_TITLES = [
  "行ってみたいけど、ちょっとどきどき。",
  "いいにおい！まちの食堂へ、ようこそ。",
  "水たまりで、いつもの道が通れない。",
  "手つだいたい。でも、まいしゅうはむずかしい。",
  "あきちに、何があったらうれしい？",
];
const KID_ACTIONS = [
  [
    "知っている人に、まちの楽しみを一つ聞いてみよう。",
    "少しだけ、できるお手つだいを考えてみよう。",
    "気になるおまつりのおしらせを、見てみよう。",
  ],
  [
    "好きな食べものを、だれかと話してみよう。",
    "自分ができるお手つだいを、一つ考えてみよう。",
    "また行きたい場所を、一つおぼえておこう。",
  ],
  [
    "道のどこがこまるか、おとなといっしょに見てみよう。",
    "道をなおす人に、おとなといっしょに知らせよう。",
    "気づいたことを、おとなといっしょにメモしよう。",
  ],
  [
    "なかまと、じゅんばんにできることを考えよう。",
    "今日だけできる、小さなお手つだいを探そう。",
    "まちにあるとうれしいものを、おうちでかいてみよう。",
  ],
  [
    "近くにあるとうれしい場所を、だれかと話してみよう。",
    "一日だけの小さなあそび場を、紙にかいてみよう。",
    "まちのおしらせを、おとなといっしょに読んでみよう。",
  ],
];
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const config = window.IENEKO_CONFIG || {};
const STORAGE = "ieneko2-v3";
let cats = [],
  selectedChoice = null,
  feedbackOpen = false,
  selectedPlace = 0,
  activeScreen = "home";
let blendPaintTimer = null;
let blendKeeps = [false,false,false];
let presenceTimer = null,
  worldTimer = null,
  worldRequest = 0;
const state = {
  step: 0,
  answers: [],
  kids: false,
  playerId: "",
  optedIn: false,
  name: "たびねこ",
  cardPose: "",
};
const coords = [
  [12, 54.6],
  [35.5, 32.3],
  [49, 59],
  [70.5, 28.5],
  [87, 43],
];

function parseCSV(text) {
  const rows = [];
  let row = [],
    cell = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted && c === '"' && text[i + 1] === '"') {
      cell += '"';
      i++;
    } else if (c === '"') quoted = !quoted;
    else if (c === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some((v) => v.trim())) rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const headers = (rows.shift() || []).map((h) =>
    h.replace(/^\uFEFF/, "").trim(),
  );
  return rows
    .map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i] || ""])))
    .map((r) => ({
      raw: r,
      no: Number(r.No),
      name: r["猫ネーム"],
      domain: r["領域"],
      type: r["タイプ名"],
      catch: r["キャッチ"],
      x: Number(r.X),
      y: Number(r.Y),
      source: r["出典"],
      url: r.URL,
      evidence: r["根拠区分"],
      summary: r["根拠要約"],
      level: r["根拠レベル"],
      reason: r["座標根拠"],
      action: r["改善策"],
      risk: r["副作用"],
      source2: r["出典2"],
      url2: r.URL2,
    }));
}
function checkedCatData(text) {
  const data = parseCSV(text);
  if (
    data.length !== 100 || new Set(data.map(c => c.no)).size !== 100 ||
    data.some(c => !Number.isInteger(c.no) || c.no < 1 || c.no > 100 ||
      !c.name || Object.keys(c.raw).length !== 20 ||
      !Number.isFinite(c.x) || !Number.isFinite(c.y))
  ) throw new Error("invalid_data");
  return data;
}
async function loadCatData() {
  // Classic script data also works when the HTML is opened directly from disk.
  if (typeof window.IENEKO_CAT_CSV === "string")
    return checkedCatData(window.IENEKO_CAT_CSV);
  const response = await fetch("dist/ieneko-100.csv");
  if (!response.ok) throw new Error("csv");
  return checkedCatData(await response.text());
}
function persist() {
  try {
    localStorage.setItem(STORAGE, JSON.stringify(state));
  } catch {}
  updateResume();
}
function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE) || "{}");
    state.cardPose = CatStudio.sources[saved.cardPose] ? saved.cardPose : "";
    state.kids = Boolean(saved.kids);
    state.optedIn = Boolean(saved.optedIn);
    state.name = String(saved.name || "たびねこ").slice(0, 16);
    if (Array.isArray(saved.answers)) {
      for (let i = 0; i < Math.min(5, saved.answers.length); i++) {
        const a = saved.answers[i];
        if (!a || !Number.isInteger(a.choice) || a.choice < -1 || a.choice > 2)
          break;
        state.answers.push(JourneyModel.normalize(a));
      }
    }
    state.step = Math.max(
      0,
      Math.min(state.answers.length, Number(saved.step) || 0, 4),
    );
    state.playerId = typeof saved.playerId === "string" ? saved.playerId : "";
  } catch {}
  if (!state.playerId)
    state.playerId =
      crypto.randomUUID?.() ||
      `cat${Date.now()}${Math.random().toString(36).slice(2)}`;
  persist();
}
function updateResume() {
  if ($("#resumeJourney")) {
    $("#resumeJourney").hidden = !state.answers.length;
    $("#resumeJourney").textContent =
      state.answers.length === 5
        ? "前の家猫カードを見る →"
        : "前のつづきから →";
  }
}
function navigate(id) {
  if (location.hash === `#${id}`) showScreen(id);
  else location.hash = id;
}
function showScreen(id) {
  if (
    !["home", "journey", "complete", "world", "cats", "research"].includes(id)
  )
    id = "home";
  if (id === "complete" && state.answers.length < 5) id = "journey";
  if (id === "journey") renderQuestion();
  if (id === "complete") renderComplete();
  if (summoning && id !== "journey") {
    summoning = false; clearTimeout(summonTimer); $("#summonDialog").close();
  }
  activeScreen = id;
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.toggle("hidden", s.id !== id));
  document
    .querySelectorAll(".topbar nav a")
    .forEach((a) =>
      a.setAttribute("aria-current", a.hash === `#${id}` ? "page" : "false"),
    );
  if (worldTimer) clearInterval(worldTimer);
  worldTimer = null;
  if (id === "world") {
    renderTown();
    renderAtlas();
    refreshWorld();
    worldTimer = setInterval(refreshWorld, 60000);
  }
  if (id === "cats") renderCats($("#catSearch").value);
  if (id === "home" && state.answers.length) setPose(".hero-cat","hello");
  document.title = {
    home: "家猫クエスト | あなたのペースで、まちとつながる。",
    journey: `第${state.step + 1}地点 | 家猫クエスト`,
    complete: "今日の家猫カード | 家猫クエスト",
    world: "みんなの世界 | 家猫クエスト",
    cats: "100匹の家猫図鑑 | 家猫クエスト",
    research: "研究とデータ | 家猫クエスト",
  }[id];
  window.scrollTo({ top: 0, behavior: "instant" });
  const heading = $(`#${id} h1`);
  if (heading) {
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }
}
function startJourney() {
  state.step = 0;
  state.answers = [];
  state.cardPose = "";
  feedbackOpen = false;
  $("#journey").classList.remove("is-feedback");
  persist();
  navigate("journey");
  setupPresence();
}
function visitQuestion(index) {
  state.step = Math.min(state.answers.length, Math.max(0, index), 4);
  feedbackOpen = false;
  persist();
  navigate("journey");
}
function currentAnswer(i = state.step) {
  const index = state.answers[i]?.choice;
  return Number.isInteger(index) && index >= 0
    ? QUESTS[i].answers[index]
    : null;
}
function journeyPoint() {return JourneyModel.point(state.answers, QUESTS);}
function chooseCat() {
  const p = journeyPoint();
  return cats.reduce((best, c) => {
    const d = (c.x - p.x) ** 2 + (c.y - p.y) ** 2;
    return !best ||
      d < best.d - 1e-9 ||
      (Math.abs(d - best.d) < 1e-9 && c.no < best.cat.no)
      ? { cat: c, d }
      : best;
  }, null)?.cat;
}
function connectChoiceAnchors() {
  QUESTS.forEach((q) =>
    q.answers.forEach((a) => {
      const anchor = cats.find((c) => c.no === a.anchorNo);
      if (!anchor) throw new Error("missing_design_anchor");
      a.x = anchor.x;
      a.y = anchor.y;
      a.anchorName = anchor.name;
    }),
  );
}
function currentPose() {
  return state.answers.length
    ? currentAnswer(state.answers.length - 1)?.pose || "resting"
    : "hello";
}
function appearance(preview) {
  const answers = state.answers.slice();
  if (preview !== undefined) answers[state.step] = JourneyModel.normalize(preview);
  return CatStudio.derive(answers, QUESTS);
}
function cardAppearance() {return state.cardPose ? CatStudio.withPose(appearance(),state.cardPose) : appearance();}
function setPose(selector, key, look = appearance()) {
  const img = $(selector);
  const pose = selector === "#finishedCatImage" ? look.finalPose : look.choices.filter(c=>c>=0).length>=3 ? look.finalPose : key === "scared" ? "bristling" : key;
  document.body.dataset.atelier = look.theme.key;
  const token = String(Number(img.dataset.paintToken || 0) + 1);
  img.dataset.paintToken = token;
  if(!img.src.startsWith('data:image/'))img.src = CatStudio.sourceFor(pose);
  img.dataset.paintState='pending';
  const painted = CatStudio.render(look, pose);
  img.painting = painted;
  painted.then(src => {if (img.dataset.paintToken === token){img.src = src;img.dataset.paintState='ready';}}).catch(() => {if(img.dataset.paintToken===token)img.dataset.paintState='error';});
  img.alt = `${CatStudio.poseNames[pose] || "猫時計"}。${CatStudio.valuesText(look)}`;
  img.dataset.pose = pose;
}
function renderRecipe(look, changed = -1) {
  $("#catRecipe").innerHTML = `<div class="cat-recipe-title"><span>きみの猫のつくりかた</span><b>${esc(look.theme.name)}</b></div><div class="recipe-parts">${look.values.map((v,i)=>`<span class="${look.choices[i] < 0 || look.choices[i] === undefined ? "pending" : ""} ${i===changed?"changed":""}">${i+1}. ${esc(v)}</span>`).join("")}</div><small class="recipe-note">この問いは「${look.labels[state.step]}」に。原画の毛並みを保って色を変えます。</small>`;
}
let summonTimer = null, summoning = false;
function finishSummon() {
  if (!summoning) return;
  summoning = false;
  clearTimeout(summonTimer);
  $("#summonDialog").close();
  if (activeScreen === "journey") navigate("complete");
}
function summonCat() {
  if (summoning) return;
  summoning = true;
  const clockSource = "dist/cat-clock-retro-ver2.03.png";
  $("#summonArt").innerHTML = `<svg class="retro-clock-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1536" role="img" aria-label="写真のような光沢のある黒い猫時計。大きな白い目の瞳、振り子の尻尾、時計の針が動きます。"><defs><clipPath id="retroTailClip"><rect x="440" y="990" width="150" height="546"/></clipPath><mask id="retroBodyMask"><rect width="1024" height="1536" fill="white"/><rect x="440" y="990" width="150" height="546" fill="black"/></mask><radialGradient id="retroPupil"><stop stop-color="#161b1b"/><stop offset="1" stop-color="#020303"/></radialGradient></defs><g class="retro-clock-tail"><image href="${clockSource}" width="1024" height="1536" clip-path="url(#retroTailClip)"/></g><image href="${clockSource}" width="1024" height="1536" mask="url(#retroBodyMask)"/><g class="retro-clock-pupils" fill="url(#retroPupil)"><path d="M405 199C426 228 426 278 405 309C383 278 384 228 405 199Z"/><path d="M621 199C642 228 642 278 621 309C599 278 600 228 621 199Z"/><ellipse cx="399" cy="231" rx="3" ry="12" fill="#fff" opacity=".38"/><ellipse cx="615" cy="231" rx="3" ry="12" fill="#fff" opacity=".38"/></g><g class="retro-clock-hour"><path d="M513 759V663" stroke="#172c24" stroke-width="16" stroke-linecap="round"/><path d="M513 749V674" stroke="#bca46d" stroke-width="3" stroke-linecap="round"/></g><g class="retro-clock-minute"><path d="M513 759V615" stroke="#172c24" stroke-width="10" stroke-linecap="round"/><path d="M513 749V628" stroke="#bca46d" stroke-width="2" stroke-linecap="round"/></g><circle cx="513" cy="759" r="16" fill="#a88945"/><circle cx="513" cy="759" r="9" fill="#e6d29c"/></svg>`;
  $("#summonDialog").showModal();
  summonTimer = setTimeout(finishSummon, 3000);
}
function renderQuestion() {
  const q = QUESTS[state.step];
  selectedChoice = null;
  blendKeeps = [false,false,false];
  clearTimeout(blendPaintTimer);
  feedbackOpen = false;
  $("#journey").classList.remove("is-feedback");
  document.title = `第${state.step + 1}地点 | 家猫クエスト`;
  $("#stepCount").textContent = `0${state.step + 1} / 05`;
  $("#chapterNumber").textContent = String(state.step+1).padStart(2,'0');
  $("#chapterPlace").textContent = q.place;
  $("#chapterTheme").textContent = JourneyModel.labels[state.step];
  $("#chapterBanner").setAttribute('aria-label',`CHAPTER ${state.step+1} / 5 ${q.place}`);
  $("#placeName").textContent = q.place;
  $("#sceneWeather").textContent = q.weather;
  $("#sceneTopic").textContent = q.topic;
  $("#sceneTitle").textContent = q.scene;
  $("#catBubble").textContent = q.bubble;
  $("#companionMood").textContent = POSES[q.pose].name;
  setPose("#companionImage", q.pose);
  renderRecipe(appearance());
  $(".scene-panel").dataset.scene = state.step;
  $("#questionTitle").textContent = state.kids
    ? KID_TITLES[state.step]
    : q.title;
  $("#questionBody").textContent = state.kids ? q.kid : q.body;
  $("#choiceView").classList.remove("hidden");
  $("#feedbackView").classList.add("hidden");
  $("#questionEvidence").open = false;
  $("#answerList").innerHTML = q.answers
    .map(
      (a, i) =>
        `<div class="answer-card" data-answer="${i}">
          <button class="answer-button" data-choice="${i}" aria-pressed="false"><span class="answer-symbol">${["✳", "↗", "☾"][i]}</span><span class="answer-copy"><b><span class="answer-letter">${["A","B","C"][i]}</span> ${esc(state.kids ? a.kid : a.label)}</b><small>${esc(state.kids ? ["いっしょなら、あんしん。", "まずは、小さくためそう。", "自分のペースで、いいんだよ。"][i] : a.note)}</small></span><span class="answer-check" aria-hidden="true">○</span></button>
          <div class="answer-mix-heading"><label class="answer-mix-label" for="blendInput${i}"><span>${["A","B","C"][i]}の割合</span><output id="blendValue${i}" for="blendInput${i}"></output></label><button type="button" id="blendKeep${i}" class="blend-keep" data-blend-keep="${i}" aria-pressed="false">キープする</button></div>
          <input id="blendInput${i}" type="range" min="0" max="100" step="0.1" data-blend="${i}" aria-label="${esc(state.kids?a.kid:a.label)}の割合" aria-describedby="blendHelp blendAdjustmentNote blendHint${i}">
          <div class="mix-endpoints" aria-hidden="true"><span>0%</span><span id="blendMax${i}">100%</span></div>
          <p id="blendHint${i}" class="blend-hint"></p>
        </div>`,
    )
    .join("");
  const oldWeights = JourneyModel.weights(state.answers[state.step]) || [1/3,1/3,1/3];
  renderBlendValues(oldWeights);
  $("#confirmAnswer").disabled = true;
  $("#confirmAnswer").textContent = "割合を動かすか、答えを押してね";
  $("#previousQuestion").hidden = state.step === 0;
  $("#storyMap").innerHTML = QUESTS.map(
    (s, i) =>
      `<button class="route-stop ${i === state.step ? "current" : ""} ${state.answers[i] ? "visited" : ""}" data-visit="${i}" ${i > state.answers.length ? "disabled" : ""} ${i === state.step ? 'aria-current="step"' : ""}><i>${state.answers[i] ? "✓" : String(i + 1).padStart(2, "0")}</i><span>${s.place}</span></button>`,
  ).join("");
}
function previewChoice(index) {
  clearTimeout(blendPaintTimer);
  blendKeeps = [false,false,false];
  selectedChoice = index;
  document.querySelectorAll(".answer-button").forEach((b, i) => {
    b.removeAttribute("data-mixed");
    b.setAttribute("aria-pressed", String(i === index));
    b.querySelector(".answer-check").textContent = i === index ? "✓" : "○";
  });
  renderBlendValues(JourneyModel.weights(index));
  $("#confirmAnswer").disabled = false;
  $("#confirmAnswer").textContent = "この一歩にする →";
  const a = QUESTS[state.step].answers[index];
  const look = appearance(index);
  setPose("#companionImage", a.pose, look);
  renderRecipe(look, state.step);
  $("#catBubble").textContent = a.reaction;
  $("#companionMood").textContent = POSES[a.pose].name;
}
function renderBlendValues(w){
  const p=JourneyModel.percentages(w),held=[0,1,2].filter(i=>blendKeeps[i]),allKept=held.length===3;
  document.querySelectorAll('[data-blend]').forEach((input,i)=>{
    const otherHeld=held.filter(k=>k!==i),fixed=otherHeld.reduce((sum,k)=>sum+Math.round(p[k]*10),0);
    const label=`${p[i]}%`,blocked=allKept||otherHeld.length===2,max=blocked?100:(1000-fixed)/10;
    input.max=max;input.value=p[i];input.setAttribute('aria-valuetext',label);
    input.disabled=blocked;
    $("#blendValue"+i).textContent=label;
    input.style.setProperty('--mix-fill',`${max?p[i]/max*100:0}%`);
    $("#blendMax"+i).textContent=`${max}%`;
    const keep=$("#blendKeep"+i),kept=blendKeeps[i];
    keep.setAttribute('aria-pressed',String(kept));
    keep.innerHTML=kept?'<span aria-hidden="true">✓</span> キープ中':'<span aria-hidden="true">＋</span> キープする';
    keep.setAttribute('aria-label',`${['A','B','C'][i]}の割合を${kept?'キープ解除':'キープ'}`);
    input.closest('.answer-card').classList.toggle('is-kept',kept);
    $("#blendHint"+i).textContent=allKept?'この割合でキープしています。':blocked?'残りの割合を自動調整します。':kept?'ほかを動かしてもキープ。ここは手直しできます。':'つまみを動かして、気持ちを調整。';
  });
  $("#blendSummary").textContent=['A','B','C'].map((v,i)=>`${v} ${p[i]}%`).join(' ・ ')+'　合計100%';
  const names=held.map(i=>['A','B','C'][i]).join('・');
  $("#blendAdjustmentNote").textContent=allKept?'3つともキープ中。この配分で進めます。1つ外すと、その答えを自動調整に戻せます。':held.length===2?`${names}をキープ。${names}のつまみで手直しすると、残り1つが自動調整されます。`:held.length===1?`${names}をキープ。ほかの2つを手直しできます。`:'まず1つを調整。残りは自動で分けます。';
  $("#keepAllBlend").disabled=allKept;
  $("#keepAllBlend").setAttribute('aria-pressed',String(allKept));
  $("#keepAllBlend").textContent=allKept?'✓ 3つともキープ中':'✓ 3つともキープ';
  $("#releaseAllBlend").disabled=!held.length;
}
function previewBlend(values) {
  const answer = JourneyModel.normalize(JourneyModel.percentages(values)), w = answer.weights;
  if(!w)return;
  selectedChoice = answer;
  const percentages=JourneyModel.percentages(w);
  document.querySelectorAll('.answer-button').forEach((b,i)=>{b.setAttribute('aria-pressed','false');b.dataset.mixed='true';b.querySelector('.answer-check').textContent=`${percentages[i]}%`;});
  renderBlendValues(w);
  $("#confirmAnswer").disabled=false;
  $("#confirmAnswer").textContent='この配分で、一歩進む →';
  const look=appearance(answer);renderRecipe(look,state.step);
  $("#catBubble").textContent='どっちの気持ちも、あるにゃ。';
  clearTimeout(blendPaintTimer);
  blendPaintTimer=setTimeout(()=>setPose('#companionImage',QUESTS[state.step].answers[answer.choice].pose,look),160);
}
function confirmAnswer(value, record = true) {
  if (feedbackOpen) return;
  clearTimeout(blendPaintTimer);
  const answer=JourneyModel.normalize(value),index=answer.choice,q=QUESTS[state.step],a=index>=0?q.answers[index]:null;
  state.answers[state.step] = answer;
  if (record) state.cardPose = "";
  persist();
  feedbackOpen = true;
  $("#journey").classList.add("is-feedback");
  $("#choiceView").classList.add("hidden");
  $("#feedbackView").classList.remove("hidden");
  $("#feedbackTitle").textContent = state.kids ? "きょうの小さな一歩" : "今日の小さな一歩";
  $("#feedbackCount").textContent = `0${state.step + 1} / 05`;
  $("#feedbackReaction").textContent = a
    ? a.reaction
    : "「まだ決めなくても、いいにゃ。」";
  $("#feedbackText").textContent = a
    ? state.kids
      ? [
          "猫は、少しほっとしたみたい。だれかといっしょの一歩も、いいね。",
          "猫は、目をきらきらさせています。小さくためすと、何が見つかるかな。",
          "猫は、のんびりひと休み。あせらなくていい。今日の気持ちを、大切にしよう。",
        ][index]
      : a.feedback
    : "猫はひと休みして、次の場所へ。答えを保留することも、自分のペースを大切にする選択です。";
  if(JourneyModel.mixed(answer)){
    $("#feedbackReaction").textContent='「あいだの気持ちも、きみの答え。」';
    $("#feedbackText").textContent=JourneyModel.describe(answer,q,state.kids)+' という配分でした。気になる一歩を、ひとつから試してみよう。';
  }
  $("#feedbackAction").textContent = a
    ? state.kids
      ? KID_ACTIONS[state.step][index]
      : a.action
    : "今日、気になったことをひとつだけ覚えておく。";
  $("#blendFeedback").innerHTML=JourneyModel.mixed(answer)?'<span>もうひとつの気持ちから</span>'+answer.weights.map((w,i)=>i!==index&&w>.05?`<p>${Math.round(w*100)}%：${esc(state.kids?KID_ACTIONS[state.step][i]:q.answers[i].action)}</p>`:'').join(''):'';
  $("#questionEvidenceBody").innerHTML =
    `<p class="research-application">${esc(q.why)}</p>${a ? `<p class="quiet-note">選択肢の参照猫：<button class="text-link" data-cat="${a.anchorNo}">No.${a.anchorNo} ${esc(a.anchorName)} ↗</button>。その猫の設計座標 X ${a.x} / Y ${a.y} を使います。選択肢との対応は制作者の解釈です。</p>` : ""}${q.refs.map((key) => sourceCard(key, true)).join("")}<p class="quiet-note">問い・選択肢・反応は本作品の創作です。研究がこの回答を正解と認定したものではありません。</p>`;
  if(JourneyModel.mixed(answer)){
    const p=JourneyModel.point([answer],[q]);
    $("#questionEvidenceBody .quiet-note")?.remove();
    $("#questionEvidenceBody").insertAdjacentHTML('afterbegin',`<p class="quiet-note">各参照猫の設計座標を回答の配分で加重平均：X ${p.x.toFixed(3)} / Y ${p.y.toFixed(3)}。${esc(JourneyModel.describe(answer,q))}</p><p class="quiet-note">${q.answers.map((a,i)=>answer.weights[i]>0?`${['A','B','C'][i]}：<button class="text-link" data-cat="${a.anchorNo}">No.${a.anchorNo} ${esc(a.anchorName)} ↗</button>（X ${a.x} / Y ${a.y}）`:'').filter(Boolean).join('、')}。選択肢との対応は制作者の解釈です。</p>`);
  }
  $("#nextQuestion").textContent =
    state.step === 4 ? "わたしの猫を、呼んでみる ✦" : "次の足あとを、つけにいく →";
  setPose("#companionImage", a?.pose || "resting");
  renderRecipe(appearance(), state.step);
  $("#catBubble").textContent = a?.reaction || "ここで、ひと休み。";
  $("#companionMood").textContent = POSES[a?.pose || "resting"].name;
  $("#feedbackTitle").focus({ preventScroll: true });
  $(".journey-layout").scrollIntoView({ block: "start", behavior: "instant" });
  if (record && state.optedIn)
    sendEvent({
      event: "answer",
      step: state.step + 1,
      place: q.place,
      trait: a?.key || "",
      catNo: chooseCat()?.no || 1,
    });
}
function nextQuestion() {
  if (!feedbackOpen) return;
  feedbackOpen = false;
  if (state.step === 4) {
    summonCat();
    if (state.optedIn)
      sendEvent({
        event: "complete",
        step: 5,
        place: QUESTS[4].place,
        catNo: chooseCat()?.no || 1,
      });
  } else {
    state.step++;
    persist();
    renderQuestion();
    $("#questionTitle").focus({ preventScroll: true });
  }
  setupPresence();
}
function sourceCard(key, compact = false) {
  const s = RESEARCH[key];
  return `<article class="source-card ${compact ? "compact" : ""}"><span class="source-tag">${esc(s.kind)} · ${s.year}</span><h3>${esc(s.concept)}</h3><p>${esc(s.finding)}</p>${compact ? "" : `<div class="source-application"><b>作品への反映</b><p>${esc(s.application)}</p><small>${esc(s.limit)}</small></div>`}<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.authors)} (${s.year})<br><b>${esc(s.title)}</b> ↗</a>${compact ? "" : `<small>${esc(s.publication)}<br>DOI: ${esc(s.doi)}</small>`}</article>`;
}
function renderResearch() {
  $("#researchList").innerHTML = Object.keys(RESEARCH)
    .map((k) => sourceCard(k))
    .join("");
  const withURL = cats.filter((c) => safeURL(c.url)).length;
  const corrected = cats.filter(
    (c) => correctedSource(c.url) || correctedSource(c.url2),
  ).length;
  $("#dataStats").innerHTML =
    `<span><b>${cats.length}</b>匹の元データ</span><span><b>${withURL}</b>件に出典URL</span><span><b>${corrected}</b>匹に照合済み書誌を適用</span><span><b>6</b>件の設計参照文献</span>`;
}
function correctedSource(url) {
  const key = Object.keys(SOURCE_CORRECTIONS).find((part) =>
    String(url).includes(part),
  );
  return key ? RESEARCH[SOURCE_CORRECTIONS[key]] : null;
}
function safeURL(url) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:" ? u.href : "";
  } catch {
    return "";
  }
}
function sourceLink(label, url) {
  const u = safeURL(url);
  return u
    ? `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(label || u)} ↗</a>`
    : `<span>${esc(label || "記載なし")}</span>`;
}
function catPose(c) {return CatStudio.poseFor(c,c.no);}
function paintReferenceImages(root=document,matchResult=false){
  root.querySelectorAll('img[data-reference-cat]').forEach(img=>{
    const c=cats.find(c=>c.no===Number(img.dataset.referenceCat));if(!c)return;
    const own=matchResult&&state.answers.length===5&&chooseCat()?.no===c.no,look=own?cardAppearance():CatStudio.referenceAppearance(c),pose=own?look.finalPose:catPose(c);img.alt=look.name+'。'+CatStudio.poseNames[pose];
    const painting=own?CatStudio.render(look,pose,500):CatStudio.renderReference(c,pose);
    painting.then(src=>{if(img.isConnected)img.src=src;}).catch(()=>{});
  });
}
function catDetail(c, full = false) {
  const source = correctedSource(c.url),
    source2 = correctedSource(c.url2);
  return `<div class="detail-cat-visual"><img data-reference-cat="${c.no}" src="${CatStudio.sourceFor(catPose(c))}" alt="${esc(CatStudio.poseNames[catPose(c)])}"><span>NO. ${String(c.no).padStart(3, "0")}</span></div><p class="eyebrow">${esc(c.domain)}</p><h2 ${full ? 'id="catDialogTitle"' : ""}>${esc(c.name)}</h2><p class="cat-catch">${esc(c.catch)}</p><div class="coordinate-chip">X ${c.x.toFixed(1)} / Y ${c.y.toFixed(1)} <span>設計座標</span></div>${
    full
      ? `<p class="detail-note">猫の名前やタイプは元CSVの創作類型です。あなたの属性・性格・健康状態を意味しません。イラストのポーズは本作品の演出です。</p><h3>この猫が考える「参加の入口」</h3><p>${esc(c.action)}</p><h3>配慮したいこと</h3><p>${esc(c.risk)}</p><h3>根拠と参照先</h3><p>${esc(source ? source.finding : c.summary)}</p><div class="citation-box"><span>${source ? "リンク先の正式書誌を照合済み" : "元CSVに記載された出典（個別精査前を含む）"}</span>${sourceLink(source ? `${source.authors} (${source.year}) ${source.title}` : c.source, c.url)}${c.source2 ? sourceLink(source2 ? `${source2.authors} (${source2.year}) ${source2.title}` : c.source2, c.url2) : ""}<small>元CSVの根拠区分：${esc(c.evidence)}<br>元CSVの根拠レベル表記：${esc(c.level)}<br>この表記はアプリによる再認定ではありません。</small></div><h3>座標はどう置かれた？</h3><p>${esc(c.reason)}</p><details><summary>元CSVの全項目を見る</summary><dl class="raw-fields">${Object.entries(
          c.raw,
        )
          .map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v || "記載なし")}</dd>`)
          .join("")}</dl></details>`
      : `<p class="detail-note">${esc((c.action || c.summary).slice(0, 110))}${(c.action || c.summary).length > 110 ? "…" : ""}</p><button class="text-link" data-cat="${c.no}">根拠と、小さな入口を読む ↗</button>`
  }`;
}
function openCat(no) {
  const c = cats.find((c) => c.no === Number(no));
  if (!c) return;
  $("#catDialogBody").innerHTML = catDetail(c, true);
  paintReferenceImages($("#catDialogBody"),true);
  if (state.answers.length === 5 && chooseCat()?.no === c.no) {
    const p = journeyPoint();
    $("#catDialogBody").insertAdjacentHTML(
      "afterbegin",
      `<div class="takeaway"><span>この猫が選ばれた理由</span><p>回答の平均座標 X ${p.x.toFixed(2)} / Y ${p.y.toFixed(2)} に、元CSVの100匹で最も近い猫です。猫の座標は X ${c.x.toFixed(1)} / Y ${c.y.toFixed(1)}。同距離なら番号順で選びます。対応づけは作品の設計です。</p></div>`,
    );
  }
  $("#catDialog").showModal();
}
function renderCats(query = "") {
  const q = query.trim().toLowerCase(),
    list = cats.filter((c) =>
      `${c.name} ${c.type} ${c.domain} ${c.evidence} ${c.source}`
        .toLowerCase()
        .includes(q),
    );
  $("#catCount").textContent = `${list.length} / ${cats.length}匹`;
  $("#catNoResults").hidden = !!list.length;
  $("#catGallery").innerHTML = list
    .map(
      (c) =>
        `<button class="cat-tile" data-cat="${c.no}"><span class="cat-tile-top">NO. ${String(c.no).padStart(3, "0")}<span>↗</span></span><div class="cat-avatar"><img loading="lazy" data-reference-cat="${c.no}" src="${CatStudio.sourceFor(catPose(c))}" alt=""></div><span class="cat-domain">${esc(c.domain)}</span><b>${esc(c.name)}</b><small>${esc(c.catch)}</small><span class="cat-source-tag">根拠をひらく ＋</span></button>`,
    )
    .join("");
  paintReferenceImages($("#catGallery"));
}
function renderComplete() {
  const c = chooseCat();
  if (!c) return;
  renderAnswerSaveState();
  const p = journeyPoint(), look = cardAppearance(), pose = look.finalPose;
  $("#finishedNo").textContent = `NO. ${String(c.no).padStart(3, "0")}`;
  setPose("#finishedCatImage", pose, look);
  const card = $("#finishedCard");
  card.dataset.theme = look.theme.key;
  card.style.setProperty("--card-ink", look.theme.ink);
  card.style.setProperty("--card-light", look.theme.light);
  card.style.setProperty("--card-gold", look.theme.gold);
  $("#cardEdition").textContent = `ATELIER / ${look.signature}`;
  $("#cardSeal").textContent = ["✿", "✦", "☾"][look.choices[4]] || "✦";
  $("#cardTraits").innerHTML = look.values.map((v,i)=>`<span>${look.labels[i]} <b>${esc(v)}</b></span>`).join("");
  $("#cardRoute").innerHTML = state.answers.map((a,i)=>`${i?"<i></i>":""}<span>${a.choice<0?"·":JourneyModel.mixed(a)?"◒":["✿","✦","☾"][a.choice]}</span>`).join("") + '<i></i>🐾';
  $("#appearanceExplanation").textContent = `回答の平均座標を中心 (5,5) で4つに分け、${look.theme.name}の色合いに。1問目は白・黒・茶の毛色、2問目は単色・ぶち・三毛などの模様、3問目は模様の位置、4問目は模様の広さ、5問目は瞳と左右の模様に反映します。表情とポーズは初めに象限と5つの回答の組み合わせで選びます。今回の組み合わせ：${look.values.join("、")}。`;

  $("#cardMixChart").innerHTML=JourneyModel.barsSVG(state.answers);
  $("#resultGraph").innerHTML=JourneyModel.barsSVG(state.answers);
  $("#finishedName").textContent = c.name;
  $("#finishedCatch").textContent = state.kids
    ? "今日のえらび方から出会った、あなたの相棒。"
    : c.catch;
  $("#finishedMood").textContent = `${look.name} · ${look.theme.name}`;
  $("#finishedDate").textContent = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  $("#resultTitle").textContent = "持ち帰るのは、ひとつの可能性。";
  $("#resultText").textContent = state.kids
    ? "今日の気分も、明日の気分も、ちがっていい。また別のえらび方で歩くと、ちがう猫に出会えるかも。"
    : "近いのは、今日の選び方と、この猫の設計座標。あなたを決めつける結果ではありません。背景の出典を読みながら、次に試したい関わり方をひとつ探してみて。";
  $("#resultCoordinate").innerHTML =
    `あなたの選択の平均 <b>X ${p.x.toFixed(2)} / Y ${p.y.toFixed(2)}</b><span>近い猫の座標 X ${c.x.toFixed(1)} / Y ${c.y.toFixed(1)} · 数値は作品内の設計値</span>`;
  $("#journeyJournal").innerHTML =
    `<div class="section-heading"><div><p class="eyebrow">YOUR FIVE LITTLE STEPS</p><h2>歩いた道と、問いの背景。</h2></div></div><div class="journal-grid">${state.answers
      .map((a, i) => {
        const q = QUESTS[i],
          choice = a.choice >= 0 ? q.answers[a.choice] : null;
        return `<article><span>0${i + 1} · ${q.place}</span><h3>${esc(JourneyModel.describe(a,q,state.kids))}</h3><p>${esc(choice?.action || "保留した問いは、あとで考えても大丈夫。")}</p><small>${choice ? `回答の設計座標 X ${JourneyModel.point([a],[q]).x.toFixed(2)} / Y ${JourneyModel.point([a],[q]).y.toFixed(2)}` : "座標の平均には含めていません"}</small><a href="#research">背景：${RESEARCH[q.refs[0]].concept} ↗</a><button data-visit="${i}" class="text-link">ここから選び直す →</button></article>`;
      })
      .join("")}</div>`;
  $("#joinStatus").textContent = gasEndpoint()
    ? state.optedIn
      ? "共有参加がオンです。"
      : "共有参加はオフです。"
    : "ニックネームと物語の地点の共有は準備中です。回答の保存は、上の猫の公開ボタンから利用できます。";
}
async function downloadCard() {
  const button = $("#downloadCard"),
    c = chooseCat();
  if (!c) return;
  button.disabled = true;
  button.textContent = "カードを描いています…";
  try {
    const img = $("#finishedCatImage");
    if (img.painting) img.src = await img.painting;
    await img.decode();
    const canvas = document.createElement("canvas"),
      ctx = canvas.getContext("2d");
    canvas.width = 1080;
    canvas.height = 1710;
    const look = cardAppearance(), t = look.theme;
    ctx.fillStyle = t.ink;
    ctx.fillRect(0,0,1080,1710);
    const gloss = ctx.createLinearGradient(0,0,1080,1710);
    gloss.addColorStop(0,"#ffffff15"); gloss.addColorStop(.48,"#ffffff00"); gloss.addColorStop(.52,"#fff2bd16"); gloss.addColorStop(1,"#ffffff00");
    ctx.fillStyle=gloss;ctx.fillRect(0,0,1080,1710);
    ctx.strokeStyle=t.gold; ctx.lineWidth=2;
    ctx.strokeRect(22,22,1036,1666);ctx.strokeRect(35,35,1010,1640);
    ctx.fillStyle=t.gold;ctx.font="500 26px sans-serif";
    ctx.fillText("✦ 家猫クエスト / CAT ATELIER",70,94);
    ctx.textAlign="right";ctx.font="500 25px monospace";ctx.fillText(`NO. ${String(c.no).padStart(3,"0")}`,1010,94);ctx.textAlign="left";
    ctx.fillStyle=t.light;ctx.beginPath();ctx.ellipse(540,420,350,300,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=t.gold;ctx.lineWidth=3;ctx.stroke();
    const scale=Math.min(780/img.naturalWidth,670/img.naturalHeight),w=img.naturalWidth*scale,h=img.naturalHeight*scale;
    ctx.drawImage(img,540-w/2,420-h/2,w,h);
    ctx.fillStyle="#fcf4e3";ctx.beginPath();ctx.roundRect(65,745,950,428,25);ctx.fill();
    ctx.fillStyle=t.ink;ctx.font="500 22px sans-serif";ctx.fillText("TODAY’S COMPANION",105,800);
    let size=62;
    while(size>26){ctx.font=`800 ${size}px sans-serif`;if(ctx.measureText(c.name).width<=865)break;size-=2;}
    ctx.fillText(c.name,105,887);
    ctx.font="500 26px sans-serif";ctx.fillText(t.name,105,940);
    ctx.strokeStyle="#d6c39f";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(105,973);ctx.lineTo(975,973);ctx.stroke();
    ctx.font="500 23px sans-serif";
    look.values.forEach((v,i)=>ctx.fillText(`${look.labels[i]}：${v}`,105+(i%2)*435,1025+Math.floor(i/2)*45,420));
    ctx.fillStyle="#fcf4e3";ctx.beginPath();ctx.roundRect(65,1195,950,340,22);ctx.fill();
    ctx.fillStyle=t.ink;ctx.font="600 24px sans-serif";ctx.fillText("5つの問い、きょうの配分。",105,1242);
    const mixColors=['#47775e','#c69c4e','#bb755e'];
    state.answers.forEach((answer,i)=>{const weights=JourneyModel.weights(answer),y=1272+i*40;ctx.fillStyle=t.ink;ctx.font="500 20px sans-serif";ctx.fillText(`問${i+1}`,105,y+19);let x=175;if(weights)weights.forEach((w,k)=>{ctx.fillStyle=mixColors[k];ctx.fillRect(x,y,w*790,25);x+=w*790;});else ctx.fillText('保留',175,y+19);});
    ctx.fillStyle=t.ink;ctx.font="400 16px sans-serif";ctx.fillText('緑=A  黄=B  茶=C：各問の答えの配分。能力や性格の点数ではありません。',105,1510);
    ctx.fillStyle=t.gold;ctx.font="500 22px monospace";ctx.fillText(`ATELIER ${look.signature} / ver${window.IENEKO_RELEASE.version} / ${$("#finishedDate").textContent}`,75,1590);
    ctx.fillStyle="#fff5df";ctx.font="400 19px sans-serif";ctx.fillText("あなたのペースで、まちとつながる。",75,1630);
    ctx.font="400 15px sans-serif";ctx.fillText("色と姿は作品の演出です。性格や属性の診断ではありません。",75,1665);
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (!blob) throw new Error("canvas");
    const url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = `ieneko-ver${window.IENEKO_RELEASE.version}-card-${String(c.no).padStart(3, "0")}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    toast("家猫カードを保存しました。");
  } catch {
    toast("画像を読み込めませんでした。少し待って、もう一度保存してください。");
  } finally {
    button.disabled = false;
    button.textContent = "家猫カードを保存する ↓";
  }
}
let poseGroup = 0;
function renderPoseGallery(group = poseGroup) {
  poseGroup = Math.max(0, Math.min(3, Number(group)));
  const look = cardAppearance(), section = CatStudio.quadrants[poseGroup];
  $("#poseGroups").innerHTML = CatStudio.quadrants.map((q,i)=>`<button data-pose-group="${i}" aria-pressed="${i===poseGroup}">${esc(q.title)}</button>`).join("");
  $("#poseGroupNote").textContent = section.note;
  $("#poseGallery").innerHTML = section.poses.map(key=>`<button class="pose-tile ${key===look.finalPose?'selected':''}" data-card-pose="${key}" aria-pressed="${key===look.finalPose}"><img loading="lazy" data-preview-pose="${key}" src="${CatStudio.sourceFor(key)}" alt="${esc(CatStudio.poseNames[key])}"><b>${esc(CatStudio.poseNames[key])}</b><small>この一日をカードにする ↗</small></button>`).join("");
  $("#poseGallery").querySelectorAll('img').forEach(img=>CatStudio.render(look,img.dataset.previewPose,320).then(src=>{if(img.isConnected)img.src=src;}).catch(()=>{}));
}
function openPoseGallery() {renderPoseGallery(appearance().quadrant);$("#poseDialog").showModal();}
function setCardPose(key) {
  state.cardPose = CatStudio.sources[key] ? key : "";
  persist(); $("#poseDialog").close(); renderComplete();
  toast(state.cardPose ? "あなたの毛並みで、今日の一枚を変えました。" : "回答から選ばれたポーズに戻しました。");
}
function renderRelease() {
  const release = window.IENEKO_RELEASE;
  $("#appVersion").textContent = `ver${release.version}`;
  $("#teamCredit").textContent = release.team;
  $("#cardVersion").textContent = `ver${release.version}`;
}
function renderTown() {
  $("#townStops").innerHTML = QUESTS.map(
    (q, i) =>
      `<button class="town-stop ${selectedPlace === i ? "selected" : ""} ${state.answers[i] ? "visited" : ""}" data-place="${i}" style="left:${coords[i][0]}%;top:${coords[i][1]}%" aria-label="${q.place}の詳細" aria-pressed="${selectedPlace === i}"><span class="stop-icon">${q.icon}</span><b>${q.place}</b>${state.answers[i] ? "<small>✓ あなたの足あと</small>" : ""}</button>`,
  ).join("");
  $("#localTrailCount").textContent =
    `この端末の足あと ${state.answers.length} / 5`;
  renderPlaceDetail(selectedPlace);
  renderMarkers([]);
}
function renderPlaceDetail(index) {
  selectedPlace = index;
  const q = QUESTS[index],
    done = state.answers[index],
    a = currentAnswer(index);
  $("#placeDetail").innerHTML =
    `<span class="eyebrow">PLACE 0${index + 1} / ${q.topic}</span><div class="place-cat"><img id="placeCatImage" src="${POSES[q.pose].src}" alt="${POSES[q.pose].alt}"></div><h2>${q.place}</h2><p>${q.title}</p><div class="place-note"><b>${done ? "この端末に残った足あと" : "この場所で出会う問い"}</b><p>${esc(done ? JourneyModel.describe(done,q,state.kids) : q.scene)}</p></div><button class="button small primary" data-visit="${Math.min(index, state.answers.length, 4)}">${done ? "この問いを選び直す" : index > state.answers.length ? "ここへ向かって歩く" : "この問いに出会う"} →</button><a href="#research" class="text-link">背景：${RESEARCH[q.refs[0]].concept} ↗</a>`;
  if(state.answers.length)setPose('#placeCatImage',q.pose);
  document.querySelectorAll(".town-stop").forEach((b) => {
    const on = Number(b.dataset.place) === index;
    b.classList.toggle("selected", on);
    b.setAttribute("aria-pressed", String(on));
  });
}
function renderMarkers(players) {
  const selfIndex = Math.min(state.step, 4),
    markers = [];
  if (state.answers.length)
    markers.push(
      `<div class="local-cat-marker" style="left:${coords[selfIndex][0]}%;top:${coords[selfIndex][1] - 12}%"><img id="worldCatImage" src="${POSES[currentPose()].src}" alt="この端末の猫の現在地"><span>あなた</span></div>`,
    );
  const grouped = [[], [], [], [], []];
  players.forEach((p) =>
    grouped[Math.max(0, Math.min(4, Math.round(Number(p.step) || 1) - 1))].push(
      p,
    ),
  );
  grouped.forEach((list, loc) => {
    if (!list.length) return;
    markers.push(
      `<button class="shared-marker" data-place="${loc}" style="left:${coords[loc][0] + 6}%;top:${coords[loc][1] - 11}%" aria-label="${QUESTS[loc].place}に共有参加者${list.length}匹"><span>🐾 ${list.length}</span></button>`,
    );
  });
  $("#playerMarkers").innerHTML = markers.join("");
  if(state.answers.length)setPose('#worldCatImage',currentPose());
}
function renderAtlas() {
  $("#atlasPoints").innerHTML = cats
    .map((c) => {
      const same = cats.filter((a) => a.x === c.x && a.y === c.y),
        index = same.findIndex((a) => a.no === c.no);
      const dx =
          same.length > 1
            ? Math.cos((index * 2 * Math.PI) / same.length) * 8
            : 0,
        dy =
          same.length > 1
            ? Math.sin((index * 2 * Math.PI) / same.length) * 8
            : 0;
      return `<button class="atlas-dot" data-atlas="${c.no}" style="left:calc(${c.x * 10}% + ${dx}px);bottom:calc(${c.y * 10}% + ${dy}px);--dot:${c.y >= 7 ? "#ae7156" : c.x < 5 ? "#417c6c" : "#c49849"}" aria-label="${esc(c.name)}。X ${c.x}、Y ${c.y}" title="${esc(c.name)}"><span>${String(c.no).padStart(2, "0")}</span></button>`;
    })
    .join("");
  $("#atlasCount").textContent = `${cats.length}匹`;
  const c = chooseCat() || cats[0];
  if (c){$("#atlasDetail").innerHTML = catDetail(c);paintReferenceImages($("#atlasDetail"));}
  const p = journeyPoint();
  if (state.answers.length) {
    const you = document.createElement("span");
    you.className = "atlas-you";
    you.style.left = `${p.x * 10}%`;
    you.style.bottom = `${p.y * 10}%`;
    you.textContent = "あなたの選択";
    $("#atlasPoints").append(you);
  }
}
function setAtlas(on) {
  $("#townView").classList.toggle("hidden", on);
  $("#atlasView").classList.toggle("hidden", !on);
  $("#townTab").classList.toggle("active", !on);
  $("#atlasTab").classList.toggle("active", on);
  $("#townTab").setAttribute("aria-pressed", String(!on));
  $("#atlasTab").setAttribute("aria-pressed", String(on));
}
let answerSaving = false;
function answerCollectionFields() {
  return {
    weights: state.answers.map(a => JourneyModel.weights(a)),
    region: $("#answerRegion").value.trim(),
    event: $("#answerEvent").value.trim(),
    grid: null,
    supports: [...document.querySelectorAll('input[name="answerSupport"]:checked')].map(i => Number(i.value)),
    consent: "public-cat-ccby-v1",
    test: new URLSearchParams(location.search).get("test") === "1",
  };
}
function renderAnswerSaveState() {
  if (answerSaving) return;
  const fields = answerCollectionFields(), prior = MapDataClient.previous(fields);
  $("#answerTestNotice").hidden = !fields.test;
  $("#saveAnswerData").disabled = state.answers.length !== 5 || !$("#answerConsent").checked;
  $("#saveAnswerData").textContent = prior?.published ? "公開済みの猫を確認する ↻" : "この猫をオープンデータにする ↗";
  $("#answerSaveStatus").dataset.state = prior?.synced ? "saved" : "unsaved";
  $("#answerSaveStatus").textContent = prior?.synced
    ? `前回、${fields.test ? "検証用の" : ""}保存と公開CSVへの反映を確認しました。公開番号：${prior.public_id}`
    : prior ? "この端末に回答が残っています。共有先への保存をもう一度確認してください。" : "まだ共有先には保存していません。";
}
async function saveAnswerData(e) {
  e.preventDefault();
  if (answerSaving || state.answers.length !== 5 || !$("#answerConsent").checked) return;
  const fields = answerCollectionFields(), controls = [...$("#answerCollection").elements];
  answerSaving = true;
  controls.forEach(input => { input.disabled = true; });
  $("#saveAnswerData").textContent = "保存を確認しています…";
  $("#answerSaveStatus").dataset.state = "pending";
  $("#answerSaveStatus").textContent = "Googleスプレッドシートへの保存と、公開CSVへの反映を確認しています…";
  try {
    const accepted = await MapDataClient.contribute(fields, QUESTS.map(q => q.answers.map(a => [a.x, a.y])));
    $("#answerSaveStatus").dataset.state = "saved";
    $("#answerSaveStatus").textContent = (accepted.test
      ? "検証用シートへの保存と、検証用CSVへの反映を確認しました。"
      : "Googleスプレッドシートへの保存と、公開CSVへの反映を確認しました。この猫がCSVの1行になりました。") + ` 公開番号：${accepted.public_id}`;
    $("#saveAnswerData").textContent = "公開済みの猫を確認する ↻";
    $("#answerPublishedCSV").hidden=false;
  } catch (error) {
    $("#answerSaveStatus").dataset.state = "error";
    $("#answerSaveStatus").textContent = error.message;
    $("#saveAnswerData").textContent = "同じ回答をもう一度保存する ↻";
  } finally {
    answerSaving = false;
    controls.forEach(input => { input.disabled = false; });
    $("#saveAnswerData").disabled = !$("#answerConsent").checked;
    if (JSON.stringify(fields) !== JSON.stringify(answerCollectionFields())) renderAnswerSaveState();
  }
}
function gasEndpoint() {
  return String(config.gasUrl || "").trim();
}
function sendEvent(payload) {
  if (!gasEndpoint()) return;
  fetch(gasEndpoint(), {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    keepalive: true,
    body: JSON.stringify({
      ...payload,
      playerId: state.playerId,
      name: state.name,
      step: payload.step || Math.min(5, state.step + 1),
      catNo: payload.catNo || chooseCat()?.no || 1,
    }),
  }).catch(() => {});
}
function loadWorld() {
  return new Promise((resolve) => {
    const cb = `ienekoMap_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      script = document.createElement("script");
    let settled = false;
    const finish = (data) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      delete window[cb];
      script.remove();
      resolve(data);
    };
    const timer = setTimeout(() => finish(null), 8000);
    window[cb] = (data) => finish(Array.isArray(data) ? data : null);
    script.onerror = () => finish(null);
    script.src = `${gasEndpoint()}?mode=map&callback=${cb}&_=${Date.now()}`;
    document.body.append(script);
  });
}
async function refreshWorld() {
  const request = ++worldRequest;
  $("#worldStatus").textContent = gasEndpoint()
    ? "共有された足あとを確認中"
    : "この端末の足あとを表示中";
  const players = gasEndpoint() ? await loadWorld() : [];
  if (request !== worldRequest) return;
  const list = Array.isArray(players) ? players : [];
  $("#worldCount").textContent = players === null ? "?" : String(list.length);
  $("#worldEmptyNote").textContent =
    players === null
      ? "共有の足あとを取得できませんでした。更新して再確認できます。"
      : gasEndpoint()
        ? "直近4分以内に共有された、物語上の地点です。"
        : "共有接続は準備中です。いまは、この端末で歩いた道を楽しめます。";
  if (gasEndpoint())
    $("#worldStatus").textContent =
      players === null ? "共有接続を確認できません" : "共有された冒険者の地点";
  $("#playerList").innerHTML = list.length
    ? list
        .slice(0, 30)
        .map(
          (p) =>
            `<div class="player-row"><span>🐾</span><div><b>${esc(String(p.name || "たびねこ").slice(0, 16))}</b><small>${esc(String(p.place || "冒険中").slice(0, 40))}</small></div><span>NO. ${esc(String(p.catNo || 1).slice(0, 3))}</span></div>`,
        )
        .join("")
    : '<p class="empty-state">まだ、共有された足あとはありません。<br>架空の参加者は表示していません。</p>';
  renderMarkers(list);
}
function setupPresence() {
  if (presenceTimer) clearInterval(presenceTimer);
  presenceTimer = null;
  if (!state.optedIn || !gasEndpoint()) return;
  const send = () =>
    sendEvent({
      event: "presence",
      step: state.step + 1,
      place: QUESTS[state.step].place,
    });
  send();
  presenceTimer = setInterval(send, 45000);
}
function setJoin(on) {
  state.optedIn = on;
  persist();
  $(".join-box").classList.toggle("is-enabled", on);
  if (!on) sendEvent({ event: "leave", step: state.step + 1 });
  $("#joinStatus").textContent = gasEndpoint()
    ? on
      ? "共有をオンにしました。反映はマップ更新後に確認できます。"
      : "共有はオフです。"
    : "共有機能は接続準備中です。いまはこの端末に足あとを残します。";
  setupPresence();
}
function toast(text) {
  $("#toast").textContent = text;
  $("#toast").classList.remove("hidden");
  setTimeout(() => $("#toast").classList.add("hidden"), 4500);
}
function setKids() {
  document.body.classList.toggle("kids-on", state.kids);
  $("#kidsMode").setAttribute("aria-pressed", String(state.kids));
  $("#kidsMode").innerHTML = `<span>Kids</span> ${state.kids ? "ON" : "OFF"}`;
}

async function init() {
  $("#startJourney").disabled = true;
  $("#resumeJourney").disabled = true;
  loadState();
  renderRelease();
  setKids();
  try {
    cats = await loadCatData();
    connectChoiceAnchors();
  } catch {
    $("#dataStatus").textContent = "家猫データを読み込めませんでした。";
    $("#dataStatus").dataset.state = "error";
    $("#startError").hidden = false;
    $("#retryLoad").addEventListener("click", () => location.reload(), {once: true});
    return;
  }
  renderResearch();
  $("#answerEvent").value = (new URLSearchParams(location.search).get("event") || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32);
  document.querySelectorAll('a[href^="ienekomap2/"]').forEach(link => {
    const url = new URL(link.getAttribute("href"), location.href);
    url.searchParams.set("v", window.IENEKO_RELEASE.version);
    if (new URLSearchParams(location.search).get("test") === "1") url.searchParams.set("test", "1");
    if ($("#answerEvent").value) url.searchParams.set("event", $("#answerEvent").value);
    link.href = url.href;
  });
  $("#answerCollection").addEventListener("submit", saveAnswerData);
  $("#answerCollection").addEventListener("change", renderAnswerSaveState);
  $("#answerCollection").addEventListener("input", renderAnswerSaveState);
  $("#playerName").value = state.name;
  $("#joinWorld").checked = state.optedIn;
  $(".join-box").classList.toggle("is-enabled", state.optedIn);
  $("#startJourney").addEventListener("click", startJourney);
  $("#again").addEventListener("click", startJourney);
  $("#resumeJourney").addEventListener("click", () =>
    navigate(state.answers.length === 5 ? "complete" : "journey"),
  );
  $("#kidsMode").addEventListener("click", () => {
    state.kids = !state.kids;
    persist();
    setKids();
    if (activeScreen === "journey") {
      const wasFeedback = feedbackOpen;
      renderQuestion();
      if (wasFeedback)
        confirmAnswer(state.answers[state.step] ?? -1, false);
    }
    if (activeScreen === "complete") renderComplete();
    if (activeScreen === "world") renderPlaceDetail(selectedPlace);
  });
  $("#answerList").addEventListener("click", (e) => {
    const b = e.target.closest("[data-choice]");
    if (b) previewChoice(Number(b.dataset.choice));
  });
  $("#blendSliders").addEventListener("input",e=>{
    const input=e.target.closest('[data-blend]');if(!input||input.disabled)return;
    const i=Number(input.dataset.blend),value=selectedChoice??state.answers[state.step];
    if(!blendKeeps.some(Boolean))blendKeeps[i]=true;
    previewBlend(JourneyModel.adjustWeights(value,i,Number(input.value),blendKeeps));
  });
  $("#blendSliders").addEventListener("click",e=>{
    const button=e.target.closest('[data-blend-keep]');if(!button)return;
    const i=Number(button.dataset.blendKeep);
    blendKeeps[i]=!blendKeeps[i];
    previewBlend(JourneyModel.weights(selectedChoice??state.answers[state.step])||[1/3,1/3,1/3]);
  });
  $("#keepAllBlend").addEventListener("click",()=>{blendKeeps=[true,true,true];previewBlend(JourneyModel.weights(selectedChoice??state.answers[state.step])||[1/3,1/3,1/3]);});
  $("#releaseAllBlend").addEventListener("click",()=>{blendKeeps=[false,false,false];previewBlend(JourneyModel.weights(selectedChoice??state.answers[state.step])||[1/3,1/3,1/3]);});
  $("#blendPresets").addEventListener("click",e=>{const b=e.target.closest('[data-mid],[data-equal]');if(!b)return;blendKeeps=[false,false,false];if(b.hasAttribute('data-equal')){previewBlend([1,1,1]);return;}const [a,c]=b.dataset.mid.split(',').map(Number);previewBlend([0,1,2].map(i=>(i===a||i===c)?0.5:0));});
  $("#confirmAnswer").addEventListener("click", () => {
    if (selectedChoice !== null) confirmAnswer(selectedChoice);
  });
  $("#skipQuestion").addEventListener("click", () => confirmAnswer(-1));
  $("#nextQuestion").addEventListener("click", nextQuestion);
  $("#changeAnswer").addEventListener("click", () => {
    renderQuestion();
    $("#questionTitle").focus();
  });
  $("#previousQuestion").addEventListener("click", () =>
    visitQuestion(state.step - 1),
  );
  document.addEventListener("click", (e) => {
    const group = e.target.closest("[data-pose-group]");
    if (group) renderPoseGallery(group.dataset.poseGroup);
    const pose = e.target.closest("[data-card-pose]");
    if (pose) setCardPose(pose.dataset.cardPose);
    const cat = e.target.closest("[data-cat]");
    if (cat) openCat(cat.dataset.cat);
    const visit = e.target.closest("[data-visit]");
    if (visit) visitQuestion(Number(visit.dataset.visit));
    const place = e.target.closest("[data-place]");
    if (place) renderPlaceDetail(Number(place.dataset.place));
    const dot = e.target.closest("[data-atlas]");
    if (dot) {
      const c = cats.find((c) => c.no === Number(dot.dataset.atlas));
      if (c){$("#atlasDetail").innerHTML = catDetail(c);paintReferenceImages($("#atlasDetail"));}
      document
        .querySelectorAll(".atlas-dot")
        .forEach((d) => d.classList.toggle("selected", d === dot));
    }
  });
  $("#catSearch").addEventListener("input", (e) => renderCats(e.target.value));
  $("#closeCatDialog").addEventListener("click", () => $("#catDialog").close());
  $("#catDialog").addEventListener("click", (e) => {
    if (e.target === $("#catDialog")) {
      const r = e.target.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        e.target.close();
    }
  });
  $("#readQuestion").addEventListener("click", () => {
    if (!("speechSynthesis" in window)) {
      toast("このブラウザーでは読み上げを利用できません。");
      return;
    }
    const q = QUESTS[state.step],
      u = new SpeechSynthesisUtterance(
        (state.kids ? q.kid : q.body) +
          "。" +
          q.answers.map((a) => (state.kids ? a.kid : a.label)).join("。"),
      );
    u.lang = "ja-JP";
    u.rate = state.kids ? 0.85 : 0.95;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  });
  $("#downloadCard").addEventListener("click", downloadCard);
  $("#morePoses").addEventListener("click", openPoseGallery);
  $("#closePoseDialog").addEventListener("click", () => $("#poseDialog").close());
  $("#automaticPose").addEventListener("click", () => setCardPose(""));
  $("#skipSummon").addEventListener("click", finishSummon);
  $("#summonDialog").addEventListener("cancel", (e) => {e.preventDefault(); finishSummon();});
  $("#summonDialog").addEventListener("close", () => {if(summoning) finishSummon();});
  $("#resultEvidence").addEventListener("click", () =>
    openCat(chooseCat()?.no),
  );
  $("#townTab").addEventListener("click", () => setAtlas(false));
  $("#atlasTab").addEventListener("click", () => setAtlas(true));
  $("#refreshWorld").addEventListener("click", refreshWorld);
  $("#joinWorld").addEventListener("change", (e) => setJoin(e.target.checked));
  $("#joinButton").addEventListener("click", () => {
    state.name =
      $("#playerName")
        .value.replace(/[<>@`\\]/g, "")
        .trim()
        .slice(0, 16) || "たびねこ";
    persist();
    if (!state.optedIn) {
      $("#joinStatus").textContent =
        "共有する場合は、上のチェックをオンにしてください。";
      return;
    }
    setupPresence();
    $("#joinStatus").textContent = gasEndpoint()
      ? "共有の更新を送りました。マップを更新して確認できます。"
      : "共有接続は準備中です。ニックネームはこの端末に保存しました。";
  });
  window.addEventListener("hashchange", () =>
    showScreen(location.hash.slice(1)),
  );
  window.addEventListener("pagehide", () => {
    if (state.optedIn) sendEvent({ event: "leave", step: state.step + 1 });
  });
  showScreen(location.hash.slice(1) || "home");
  setupPresence();
  const requestedCat=Number(new URLSearchParams(location.search).get("cat"));
  if(activeScreen==="cats"&&Number.isInteger(requestedCat)&&requestedCat>=1&&requestedCat<=100)openCat(requestedCat);
  $("#startJourney").disabled = false;
  $("#resumeJourney").disabled = false;
  $("#dataStatus").textContent = "100匹の準備ができました。";
  $("#dataStatus").dataset.state = "ready";
}
init();
