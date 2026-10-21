// Source records checked against the linked primary publisher/repository on 2026-10-22.
// These studies inform the design, but do not validate this app or the 100 cat types.
const RESEARCH = {
  community: {
    concept: "地域参加の入口と、橋渡し役",
    authors: "山下真里佳・山本雄大・西堀泰英",
    year: 2024,
    title:
      "地域コミュニティ活性化と新たな担い手確保のプロセス：既往研究のレビューを基に",
    publication: "日本都市計画学会関西支部研究発表会講演概要集 22, pp.97-100",
    url: "https://www.jstage.jst.go.jp/article/cpijkansai/22/0/22_97/_article/-char/ja/",
    doi: "10.11361/cpijkansai.22.0_97",
    finding:
      "既往研究のレビューから、地域活動への関心や愛着、役員の役割の明文化、若い世代や仲介者の関与を、担い手確保のプロセスとして検討しています。",
    application:
      "「知り合いと行く」「まず見学する」など、関わり始める入口を問いにしました。",
    limit:
      "研究レビューの知見です。このゲームの選択肢や、各猫への割り当てを実証した研究ではありません。",
    kind: "研究レビュー",
    corrected: true,
  },
  organization: {
    concept: "役割と参加方法の設計",
    authors: "佐伯亮太",
    year: 2024,
    title:
      "組織体制と構成員の選出方法から見る地域運営組織の担い手の現状について：兵庫県養父市の全自治協調査の結果から",
    publication: "都市計画論文集 59(3), pp.683-689",
    url: "https://www.jstage.jst.go.jp/article/journalcpij/59/3/59_10011/_article/-char/ja",
    doi: "10.11361/journalcpij.59.683",
    finding:
      "養父市の18自治協の調査を通じ、組織体制や構成員の選出方法の課題と、参画方法を更新する必要性を検討しています。",
    application:
      "短時間の役割、非同期の意見、参加と役員就任の分離を、作品内の提案として扱います。",
    limit:
      "特定地域の調査です。全国の住民や、本人の参加傾向を一律に説明するものではありません。",
    kind: "地域調査",
    corrected: true,
  },
  autonomy: {
    concept: "自分で選べること",
    authors: "Richard M. Ryan & Edward L. Deci",
    year: 2000,
    title:
      "Self-Determination Theory and the Facilitation of Intrinsic Motivation, Social Development, and Well-Being",
    publication: "American Psychologist 55(1), pp.68-78",
    url: "https://selfdeterminationtheory.org/SDT/documents/2000_RyanDeci_SDT.pdf",
    doi: "10.1037/0003-066X.55.1.68",
    finding:
      "自己決定理論は、自律性・有能感・関係性の欲求と、それを支える社会的環境を、動機づけの観点から論じています。",
    application:
      "答えの保留、やり直し、読み上げ、共有参加の選択を用意しました。",
    limit:
      "これらの操作で本アプリの利用意欲や地域参加が向上するかは、別途検証が必要です。",
    kind: "理論・研究レビュー",
  },
  ties: {
    concept: "いつもの輪を越える、ゆるいつながり",
    authors: "Mark S. Granovetter",
    year: 1973,
    title: "The Strength of Weak Ties",
    publication: "American Journal of Sociology 78(6), pp.1360-1380",
    url: "https://www.journals.uchicago.edu/doi/10.1086/225469",
    doi: "10.1086/225469",
    finding:
      "弱い紐帯が、異なる集団の間の情報や関係の橋渡しに果たす役割を論じた研究です。",
    application:
      "親友になることだけを目標にせず、挨拶や案内役との接点も、まちへの入口にしています。",
    limit:
      "すべての弱いつながりが有益とは限りません。猫のタイプを判定する尺度としては使いません。",
    kind: "社会学研究",
  },
  commons: {
    concept: "みんなの場所を、みんなで育てる",
    authors: "Elinor Ostrom",
    year: 1990,
    title:
      "Governing the Commons: The Evolution of Institutions for Collective Action",
    publication: "Cambridge University Press",
    url: "https://doi.org/10.1017/CBO9780511807763",
    doi: "10.1017/CBO9780511807763",
    finding:
      "共有資源の管理について、利用者によるルールや制度の条件を事例に基づいて検討しています。",
    application:
      "空き地や町の共用部を題材に、関わる人がルールや役割を選ぶ場面へ翻案しました。",
    limit:
      "自然資源等の共有資源の研究を、まちの対話へ応用した設計です。作品内の解決案の効果を直接保証しません。",
    kind: "制度・事例研究",
  },
  efficacy: {
    concept: "近隣の信頼と、協力する意志",
    authors: "Robert J. Sampson, Stephen W. Raudenbush & Felton Earls",
    year: 1997,
    title:
      "Neighborhoods and Violent Crime: A Multilevel Study of Collective Efficacy",
    publication: "Science 277(5328), pp.918-924",
    url: "https://dash.harvard.edu/entities/publication/73120378-bd4a-6bd4-e053-0100007fdf3b",
    doi: "10.1126/science.277.5328.918",
    finding:
      "シカゴの近隣調査で、社会的な結束と共通の利益のために介入する意志を合わせた集合的効力感と、暴力の少なさとの関連を報告しています。",
    application:
      "ひとりで全てを引き受けず、声をかけ合って課題に取り組む場面の背景にしています。",
    limit:
      "観察研究の関連であり、本アプリによる防犯効果や因果関係を示すものではありません。",
    kind: "近隣調査",
  },
};

const SOURCE_CORRECTIONS = {
  "cpijkansai/22/0/22_97": "community",
  "journalcpij/59/3/59_10011": "organization",
};
