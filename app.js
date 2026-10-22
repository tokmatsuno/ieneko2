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
const QUESTS = [
  {
    place: "ひだまり広場",
    icon: "☀",
    topic: "安心と、はじめの接点",
    weather: "15:00 · 木もれ日",
    pose: "scared",
    bubble: "知らない猫ばかり…",
    scene: "輪のそとにも、居場所はある。",
    title: "楽しそう。でも、入るのはちょっと怖い。",
    body: "広場では、まちの小さなお祭りの準備中。猫は行ってみたいのに、植え込みの陰で立ち止まっています。「自分だったら」と考えると、どんな入口がうれしい？",
    kid: "ひろばで、おまつりのじゅんび中。知らない子ばかりで、猫はどきどき。どんな入り方なら、ほっとする？",
    refs: ["community", "ties"],
    why: "地域活動への関わり始めや、仲介者の役割を、安心できる入口の問いに翻案しました。",
    answers: [
      {
        label: "知っている人と、一緒に。",
        kid: "知っている子と、いっしょに行く",
        note: "顔見知りの案内があれば安心",
        key: "kind",
        anchorNo: 94,
        pose: "hello",
        reaction: "「いっしょなら、行けそう。」",
        feedback:
          "猫は植え込みから顔を出しました。知っている誰かが、いつもの場所と新しい場所をつないでくれることも。",
        action: "気になる地域の催しを、顔見知りにひとつ聞いてみる。",
      },
      {
        label: "10分だけ、お手伝い。",
        kid: "10分だけ、じゅんびを手つだう",
        note: "時間と役割が見えたら踏み出せる",
        key: "brave",
        anchorNo: 52,
        pose: "curious",
        reaction: "「10分なら、できるかも。」",
        feedback:
          "小さな役割が見つかって、猫は一歩。ずっと参加できなくても、その日の短い関わり方を選べます。",
        action: "「10分だけでもいいですか？」と聞ける活動をひとつ探す。",
      },
      {
        label: "まずは、端っこで見学。",
        kid: "まずは、はしっこから見てみる",
        note: "参加するかは、見てから決めたい",
        key: "wise",
        anchorNo: 72,
        pose: "resting",
        reaction: "「ここから見てても、いい？」",
        feedback:
          "猫は日陰に座って、しばらく見学。関心を持つことと、すぐに輪に入ることは別々でいいのです。",
        action: "気になる活動の案内を見て、見学できるか確かめる。",
      },
    ],
  },
  {
    place: "毛糸の森",
    icon: "✿",
    topic: "関心と、参加のきっかけ",
    weather: "15:20 · いいにおい",
    pose: "hungry",
    bubble: "おなか、ぐぅ…",
    scene: "「好き」から始まる関わり。",
    title: "おいしい匂いの先に、まちの食堂。",
    body: "森の入口に、一日だけのまちの食堂。猫は空っぽの器を抱えています。食べる人、手伝う人、立ち寄るだけの人。あなたなら、どんなふうに関わりたい？",
    kid: "森の食堂から、いいにおい。猫のおなかが、ぐう。食べるだけでも、お手つだいでもいいんだって。どうしたい？",
    refs: ["autonomy", "community"],
    why: "自分で関わり方を選べる設計を、参加の動機と地域活動の入口という観点から考えます。",
    answers: [
      {
        label: "食べながら、隣の人と話す。",
        kid: "となりの子と、おしゃべりしてみる",
        note: "同じテーブルから、ゆるくつながる",
        key: "kind",
        anchorNo: 94,
        pose: "hello",
        reaction: "「おすすめ、教えてにゃ。」",
        feedback:
          "猫は器を置いて、隣にちょこん。一緒に食べるという身近な関心が、言葉を交わすきっかけになるかもしれません。",
        action: "お店や食堂で、気になる一品について一言聞いてみる。",
      },
      {
        label: "自分の得意を、ひとつだけ。",
        kid: "おさらをならべるの、やってみる",
        note: "片付け、撮影、案内。できる形で",
        key: "brave",
        anchorNo: 100,
        pose: "curious",
        reaction: "「おさら運びなら、まかせて。」",
        feedback:
          "猫は自分で選んだ役割をひとつ。どれだけ手伝ったかを競わず、自分ができる形から考えます。",
        action: "自分にできる「ひとつだけのお手伝い」をメモする。",
      },
      {
        label: "今日は、食べて帰る。",
        kid: "今日は、おいしく食べて帰る",
        note: "楽しむだけの日があってもいい",
        key: "wise",
        anchorNo: 35,
        pose: "resting",
        reaction: "「今日は、ごちそうさまだけ。」",
        feedback:
          "猫は満足そうに一息。手伝わない選択も、自分で決めていい。次の関わり方は、次の自分に任せましょう。",
        action:
          "好きだった場所をひとつ覚えておく。次に行くかは、その日に決める。",
      },
    ],
  },
  {
    place: "しずくの庭",
    icon: "⌁",
    topic: "小さな協力と、共用の場所",
    weather: "15:40 · 雨あがり",
    pose: "curious",
    bubble: "この道、通りにくいにゃ",
    scene: "小さな「困った」が、まちの問い。",
    title: "水たまりで、いつもの道が遠回り。",
    body: "庭の入口に大きな水たまり。歩く人も、車いすの猫も、少し困っています。みんなが使う場所の「困った」に、どんな関わり方を選ぶ？",
    kid: "にわの道が、水たまりでいっぱい。車いすの猫も、こまっているよ。あなたなら、どうしたい？",
    refs: ["efficacy", "commons"],
    why: "近隣で協力する意志と、共用する場所を管理する仕組みを、身近な場面へ翻案しました。",
    answers: [
      {
        label: "困っている人の声を聞く。",
        kid: "「どこがこまる？」と聞いてみる",
        note: "自分の想像だけで決めずに",
        key: "kind",
        anchorNo: 60,
        pose: "hello",
        reaction: "「一緒に、考えていい？」",
        feedback:
          "猫はまず、困っている相手のほうへ。何が必要かを決めつけず、声を聞くところから始めました。",
        action: "身近な道で、誰がどんな点に困るかを一つ観察する。",
      },
      {
        label: "管理する人に、場所を伝える。",
        kid: "道をなおす人に、知らせる",
        note: "ひとりで直さず、担当とつなぐ",
        key: "brave",
        anchorNo: 82,
        pose: "curious",
        reaction: "「ここだよ、って伝えよう。」",
        feedback:
          "猫は危ない作業をせず、場所を伝えることにしました。共用の場所では、管理する人との連絡も関わりのひとつです。",
        action: "公園や道路の管理窓口を、自治体の公式サイトで調べる。",
      },
      {
        label: "まず記録して、あとで考える。",
        kid: "場所をおぼえて、あとで考える",
        note: "今すぐ動けなくても、気づきは残せる",
        key: "wise",
        anchorNo: 99,
        pose: "resting",
        reaction: "「気づいたこと、忘れないように。」",
        feedback:
          "猫は少し離れて、気づきをメモ。行動を急がず、時間のある日に考え直せる形で残しました。",
        action: "場所と困りごとを、個人が特定されない一行のメモにする。",
      },
    ],
  },
  {
    place: "月あかり坂",
    icon: "☾",
    topic: "役割の見えやすさと、余白",
    weather: "16:00 · 夕方の風",
    pose: "resting",
    bubble: "ずっとは、むずかしいにゃ",
    scene: "手を挙げる前に、知りたいこと。",
    title: "手伝いたい。でも、毎週は無理。",
    body: "坂道の花壇を育てる仲間を募集中。「入ったら、ずっと続けないとだめ？」と猫。仕事や学校、ひと休みも大切にしながら関わるなら？",
    kid: "坂の花だんで、なかまをぼしゅう中。でも、まいしゅうは行けない。どんなお手つだいが、できそう？",
    refs: ["organization", "autonomy"],
    why: "組織の参画方法を問い直す研究を背景に、時間と役割を限定できる選択肢を設計しました。",
    answers: [
      {
        label: "仲間と交代できる役割。",
        kid: "なかまと、じゅんばんにやる",
        note: "休むときに、代われる安心",
        key: "kind",
        anchorNo: 82,
        pose: "hello",
        reaction: "「交代なら、できる日があるよ。」",
        feedback:
          "猫は「休む日もある」と伝えました。続け方をひとりの頑張りだけに任せず、役割の分け方を考えます。",
        action: "活動の募集で、休める仕組みと担当範囲を確認する。",
      },
      {
        label: "今日だけの、水やり係。",
        kid: "今日だけ、水をあげる",
        note: "終わりの見える、単発の一歩",
        key: "brave",
        anchorNo: 100,
        pose: "curious",
        reaction: "「今日の一回、やってみる。」",
        feedback:
          "猫は小さなじょうろを手にしました。回数と終わりが見えると、自分の予定と相談しやすくなります。",
        action: "所要時間と完了条件が書かれた、単発の活動を探す。",
      },
      {
        label: "家から、アイデアを送る。",
        kid: "おうちから、いい考えを送る",
        note: "現地に行かない参加も選べる",
        key: "wise",
        anchorNo: 99,
        pose: "resting",
        reaction: "「おうちからでも、いいかにゃ？」",
        feedback:
          "猫は家から花のアイデアをひとつ。現地に行くことだけを参加の条件にしない、別の入口を考えました。",
        action:
          "地域の公式な意見募集や、オンラインの参加方法をひとつ見てみる。",
      },
    ],
  },
  {
    place: "鈴の城下町",
    icon: "♜",
    topic: "みんなで決める、次の一歩",
    weather: "16:20 · 鈴の音",
    pose: "hello",
    bubble: "このまち、どうしたい？",
    scene: "まちを育てるのは、いろんな声。",
    title: "空き地がひとつ。何があったら、うれしい？",
    body: "町の空き地の使い方を考える日。花壇、ベンチ、小さな催し。いろんな案があります。猫はあなたに、最初の一歩を聞いてきました。",
    kid: "まちの空き地に、何をつくろう？お花？ベンチ？小さなおまつり？みんなで決めるなら、どう始めたい？",
    refs: ["commons", "community"],
    why: "利用者が関わるルールづくりという考え方を、まちの小さな合意形成へ翻案しています。",
    answers: [
      {
        label: "まだ聞けていない声を集める。",
        kid: "まだ話していない子にも、聞く",
        note: "その場にいない人も思い浮かべる",
        key: "kind",
        anchorNo: 94,
        pose: "hello",
        reaction: "「来られない猫にも、聞いてみよう。」",
        feedback:
          "猫は集まった声だけで決めないことにしました。気持ちや生活が違う誰かにも、選べる場所を残したいから。",
        action: "近所にあると嬉しい場所を、身近な人と一つずつ話す。",
      },
      {
        label: "小さく試して、みんなで見直す。",
        kid: "一日だけ、ためしてみる",
        note: "最初から完成させなくても",
        key: "brave",
        anchorNo: 76,
        pose: "curious",
        reaction: "「一日だけなら、試せるね。」",
        feedback:
          "猫は小さな実験から始めることに。土地の管理者と相談して、使う人の声で見直す場を考えました。",
        action:
          "もし使えたら嬉しい場所を、所有者の許可が必要な企画メモとして描く。",
      },
      {
        label: "案内を読んで、自分の考えを一票。",
        kid: "おしらせを読んで、一つえらぶ",
        note: "対面の集まりが苦手でも",
        key: "wise",
        anchorNo: 99,
        pose: "resting",
        reaction: "「一票にも、私の気持ちがある。」",
        feedback:
          "猫は案内を読み、自分の考えを残しました。声の大きさや出席時間だけで、まちへの思いは決まりません。",
        action: "地域の計画や意見募集を、自治体の公式サイトで一つ読んでみる。",
      },
    ],
  },
];

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
        state.answers.push({ choice: a.choice });
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
function journeyPoint() {
  const choices = state.answers
    .map((a, i) => (a.choice >= 0 ? QUESTS[i].answers[a.choice] : null))
    .filter(Boolean);
  return choices.length
    ? {
        x: choices.reduce((v, a) => v + a.x, 0) / choices.length,
        y: choices.reduce((v, a) => v + a.y, 0) / choices.length,
      }
    : { x: 5, y: 5 };
}
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
  if (preview !== undefined) answers[state.step] = {choice: preview};
  return CatStudio.derive(answers, QUESTS);
}
function cardAppearance() {return state.cardPose ? CatStudio.withPose(appearance(),state.cardPose) : appearance();}
function setPose(selector, key, look = appearance()) {
  const img = $(selector);
  const pose = selector === "#finishedCatImage" ? look.finalPose : look.choices.filter(c=>c>=0).length>=3 ? look.finalPose : key === "scared" ? "bristling" : key;
  document.body.dataset.atelier = look.theme.key;
  const token = String(Number(img.dataset.paintToken || 0) + 1);
  img.dataset.paintToken = token;
  img.src = CatStudio.sourceFor(pose);
  const painted = CatStudio.render(look, pose);
  img.painting = painted;
  painted.then(src => {if (img.dataset.paintToken === token) img.src = src;}).catch(() => {});
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
  feedbackOpen = false;
  $("#journey").classList.remove("is-feedback");
  document.title = `第${state.step + 1}地点 | 家猫クエスト`;
  $("#stepCount").textContent = `0${state.step + 1} / 05`;
  $("#chapterLabel").textContent = `CHAPTER 0${state.step + 1}`;
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
        `<button class="answer-button" data-choice="${i}" aria-pressed="false"><span class="answer-symbol">${["✳", "↗", "☾"][i]}</span><span class="answer-copy"><b>${esc(state.kids ? a.kid : a.label)}</b><small>${esc(state.kids ? ["いっしょなら、あんしん。", "まずは、小さくためそう。", "自分のペースで、いいんだよ。"][i] : a.note)}</small></span><span class="answer-check" aria-hidden="true">○</span></button>`,
    )
    .join("");
  $("#confirmAnswer").disabled = true;
  $("#confirmAnswer").textContent = "気になる答えを選んでね";
  $("#previousQuestion").hidden = state.step === 0;
  $("#storyMap").innerHTML = QUESTS.map(
    (s, i) =>
      `<button class="route-stop ${i === state.step ? "current" : ""} ${state.answers[i] ? "visited" : ""}" data-visit="${i}" ${i > state.answers.length ? "disabled" : ""} ${i === state.step ? 'aria-current="step"' : ""}><i>${state.answers[i] ? "✓" : String(i + 1).padStart(2, "0")}</i><span>${s.place}</span></button>`,
  ).join("");
}
function previewChoice(index) {
  selectedChoice = index;
  document.querySelectorAll(".answer-button").forEach((b, i) => {
    b.setAttribute("aria-pressed", String(i === index));
    b.querySelector(".answer-check").textContent = i === index ? "✓" : "○";
  });
  $("#confirmAnswer").disabled = false;
  $("#confirmAnswer").textContent = "この一歩にする →";
  const a = QUESTS[state.step].answers[index];
  const look = appearance(index);
  setPose("#companionImage", a.pose, look);
  renderRecipe(look, state.step);
  $("#catBubble").textContent = a.reaction;
  $("#companionMood").textContent = POSES[a.pose].name;
}
function confirmAnswer(index, record = true) {
  if (feedbackOpen) return;
  const q = QUESTS[state.step],
    a = index >= 0 ? q.answers[index] : null;
  state.answers[state.step] = { choice: index };
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
  $("#feedbackAction").textContent = a
    ? state.kids
      ? KID_ACTIONS[state.step][index]
      : a.action
    : "今日、気になったことをひとつだけ覚えておく。";
  $("#questionEvidenceBody").innerHTML =
    `<p class="research-application">${esc(q.why)}</p>${a ? `<p class="quiet-note">選択肢の参照猫：<button class="text-link" data-cat="${a.anchorNo}">No.${a.anchorNo} ${esc(a.anchorName)} ↗</button>。その猫の設計座標 X ${a.x} / Y ${a.y} を使います。選択肢との対応は制作者の解釈です。</p>` : ""}${q.refs.map((key) => sourceCard(key, true)).join("")}<p class="quiet-note">問い・選択肢・反応は本作品の創作です。研究がこの回答を正解と認定したものではありません。</p>`;
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
function catDetail(c, full = false) {
  const source = correctedSource(c.url),
    source2 = correctedSource(c.url2);
  return `<div class="detail-cat-visual"><img src="${CatStudio.sourceFor(catPose(c))}" alt="${esc(CatStudio.poseNames[catPose(c)])}"><span>NO. ${String(c.no).padStart(3, "0")}</span></div><p class="eyebrow">${esc(c.domain)}</p><h2 ${full ? 'id="catDialogTitle"' : ""}>${esc(c.name)}</h2><p class="cat-catch">${esc(c.catch)}</p><div class="coordinate-chip">X ${c.x.toFixed(1)} / Y ${c.y.toFixed(1)} <span>設計座標</span></div>${
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
        `<button class="cat-tile" data-cat="${c.no}"><span class="cat-tile-top">NO. ${String(c.no).padStart(3, "0")}<span>↗</span></span><div class="cat-avatar"><img loading="lazy" src="${CatStudio.sourceFor(catPose(c))}" alt=""></div><span class="cat-domain">${esc(c.domain)}</span><b>${esc(c.name)}</b><small>${esc(c.catch)}</small><span class="cat-source-tag">根拠をひらく ＋</span></button>`,
    )
    .join("");
}
function renderComplete() {
  const c = chooseCat();
  if (!c) return;
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
  $("#cardRoute").innerHTML = state.answers.map((a,i)=>`${i?"<i></i>":""}<span>${a.choice<0?"·":["✿","✦","☾"][a.choice]}</span>`).join("") + '<i></i>🐾';
  $("#appearanceExplanation").textContent = `回答の平均座標を中心 (5,5) で4つに分け、${look.theme.name}の色合いに。1問目は白・黒・茶の毛色、2問目は単色・ぶち・三毛などの模様、3問目は模様の位置、4問目は模様の広さ、5問目は瞳と左右の模様に反映します。表情とポーズは初めに象限と5つの回答の組み合わせで選びます。今回の組み合わせ：${look.values.join("、")}。`;

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
        return `<article><span>0${i + 1} · ${q.place}</span><h3>${esc(choice ? (state.kids ? choice.kid : choice.label) : "今は決めずに進んだ")}</h3><p>${esc(choice?.action || "保留した問いは、あとで考えても大丈夫。")}</p><small>${choice ? `設計座標 X ${choice.x} / Y ${choice.y}` : "座標の平均には含めていません"}</small><a href="#research">背景：${RESEARCH[q.refs[0]].concept} ↗</a><button data-visit="${i}" class="text-link">ここから選び直す →</button></article>`;
      })
      .join("")}</div>`;
  $("#joinStatus").textContent = gasEndpoint()
    ? state.optedIn
      ? "共有参加がオンです。"
      : "共有参加はオフです。"
    : "いまはこの端末の足あとだけを表示します。共有機能は接続準備中です。";
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
    canvas.height = 1350;
    const look = cardAppearance(), t = look.theme;
    ctx.fillStyle = t.ink;
    ctx.fillRect(0,0,1080,1350);
    const gloss = ctx.createLinearGradient(0,0,1080,1350);
    gloss.addColorStop(0,"#ffffff15"); gloss.addColorStop(.48,"#ffffff00"); gloss.addColorStop(.52,"#fff2bd16"); gloss.addColorStop(1,"#ffffff00");
    ctx.fillStyle=gloss;ctx.fillRect(0,0,1080,1350);
    ctx.strokeStyle=t.gold; ctx.lineWidth=2;
    ctx.strokeRect(22,22,1036,1306);ctx.strokeRect(35,35,1010,1280);
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
    look.values.forEach((v,i)=>ctx.fillText(`${look.labels[i]}：${v}`,105+(i%2)*435,1025+Math.floor(i/2)*45));
    ctx.fillStyle=t.gold;ctx.font="500 22px monospace";ctx.fillText(`ATELIER ${look.signature} / ver${window.IENEKO_RELEASE.version} / ${$("#finishedDate").textContent}`,75,1230);
    ctx.fillStyle="#fff5df";ctx.font="400 19px sans-serif";ctx.fillText("あなたのペースで、まちとつながる。",75,1270);
    ctx.font="400 15px sans-serif";ctx.fillText("色と姿は作品の演出です。性格や属性の診断ではありません。",75,1300);
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
  $("#poseGallery").innerHTML = section.poses.map(key=>`<button class="pose-tile ${key===look.finalPose?'selected':''}" data-card-pose="${key}" aria-pressed="${key===look.finalPose}"><img loading="lazy" src="${CatStudio.sourceFor(key)}" alt="${esc(CatStudio.poseNames[key])}"><b>${esc(CatStudio.poseNames[key])}</b><small>この一日をカードにする ↗</small></button>`).join("");
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
    `<span class="eyebrow">PLACE 0${index + 1} / ${q.topic}</span><div class="place-cat"><img src="${POSES[q.pose].src}" alt="${POSES[q.pose].alt}"></div><h2>${q.place}</h2><p>${q.title}</p><div class="place-note"><b>${done ? "この端末に残った足あと" : "この場所で出会う問い"}</b><p>${esc(done ? (a ? (state.kids ? a.kid : a.label) : "今は決めずに進んだ") : q.scene)}</p></div><button class="button small primary" data-visit="${Math.min(index, state.answers.length, 4)}">${done ? "この問いを選び直す" : index > state.answers.length ? "ここへ向かって歩く" : "この問いに出会う"} →</button><a href="#research" class="text-link">背景：${RESEARCH[q.refs[0]].concept} ↗</a>`;
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
      `<div class="local-cat-marker" style="left:${coords[selfIndex][0]}%;top:${coords[selfIndex][1] - 12}%"><img src="${POSES[currentPose()].src}" alt="この端末の猫の現在地"><span>あなた</span></div>`,
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
  if (c) $("#atlasDetail").innerHTML = catDetail(c);
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
        confirmAnswer(state.answers[state.step]?.choice ?? -1, false);
    }
    if (activeScreen === "complete") renderComplete();
    if (activeScreen === "world") renderPlaceDetail(selectedPlace);
  });
  $("#answerList").addEventListener("click", (e) => {
    const b = e.target.closest("[data-choice]");
    if (b) previewChoice(Number(b.dataset.choice));
  });
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
      if (c) $("#atlasDetail").innerHTML = catDetail(c);
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
  $("#startJourney").disabled = false;
  $("#resumeJourney").disabled = false;
  $("#dataStatus").textContent = "100匹の準備ができました。";
  $("#dataStatus").dataset.state = "ready";
}
init();
