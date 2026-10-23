# 家猫MAP2 収集サービス

`IenekoMap2.gs` は `opendata-core.js`、`public-cat-data.js`、元CSV由来の設問参照座標・基準猫、`map2-service.js` を `node scripts/build-map-service.cjs` でまとめた生成物です。元CSVや収集仕様を変更したら再生成し、`--check` で一致を確認します。

既存サービスへ追加する場合、従来の `doGet` と `doPost` の関数名だけを `legacyDoGet` と `legacyDoPost` に変更し、生成物を追加します。`api=ieneko2` の要求だけを新APIへ分岐し、従来の要求は元の関数へ渡します。既存プロジェクトのコード全文をこのリポジトリへ転載する必要はありません。新設する場合は、リポジトリの `Code.gs` と `IenekoMap2.gs` を同じプロジェクトへ登録します。

`setupIenekoMap2` を管理者が一度実行すると、専用の非公開スプレッドシートが作られます。IDは Script Properties の `IENEKO_MAP2_SHEET_ID` に保存されます。回答は `responses`、動作検証は `verification` の別タブへ入り、検証記録は公開集計から除外します。元の公開シートには新しい個別回答を入れません。管理者はこの保存先をリンク公開しないでください。

既存Webアプリの新バージョンとして更新し、公開URLを `config.js` の `openDataUrl` へ設定します。`gasUrl` は従来RPGの共有参加者・Discord通知用で別の設定です。現状空欄のままで、MAP2の回答をDiscordへ通知する機能はありません。

ver2.10から、5問を終えた結果画面の保存フォームも `openDataUrl` に接続しています。結果画面とMAP2の保存は同じクライアント処理を使用し、同じ内容の再送には同じ記録IDを使います。明示的な同意後に送信し、`receipt` が保存を確認してから完了を表示します。Googleスプレッドシートは1件から蓄積されます。公開CSVが0行であることと、非公開シートへの保存件数は同じではありません。

## API

- GET `?api=ieneko2&mode=health`: 受付の準備状態とバージョン。
- GET `?api=ieneko2&mode=cats`: `public-cat-ccby-v1` の公開同意を得た猫を1匹から公開。保存用IDと別の公開番号、基準猫・設計座標・回答配分・入口の選択だけを返す。
- GET `?api=ieneko2&mode=csv`: 同じ猫データをUTF-8 BOM付きCSV `ieneko-cats.csv` としてダウンロード。ログイン不要、保存済みデータから毎回生成。
- `cats` と `csv` は `public_id` で1匹に絞れる。`proof=1` は新たな個別公開同意がある検証用データだけを返す。本番と分離し、CSV内も `data_kind=verification` と明記。
- GET `?api=ieneko2&mode=aggregate`: 公開基準を満たした集計だけのJSON。
- GET `?api=ieneko2&mode=receipt&id=記録ID`: 保存済みかを返す。回答内容は返さない。
- GETに `callback` を指定すると、検証済みの関数名だけJSONPに対応。
- POST: text/plainのJSONで `api: "ieneko2"` と回答を送る。配分・任意の地域・イベント・粗いセル・入口の希望・同意値・ランダム記録IDを検証し、座標はサーバーで再計算。

ver2.11のブラウザーは、POST後のreceipt、公開JSON、公開CSVを読み返し、猫の1行が一致した場合だけ保存・公開の完了を表示します。同一IDの再送は重複追加しません。個別公開の同意と旧版の集計だけの同意を分け、旧同意のデータを猫単位で公開しません。匿名の公開受付なので、別IDによる重複やいたずらまで防ぐ本人認証ではありません。上限20,000行、同時書き込みはロックで直列化します。

`/ienekomap2/?test=1` は保存動作の検証用です。自分の端末に5問の回答を作り、同意して送ると `verification` だけに保存されます。本番公開集計に混ぜず、シート側も読み返して確認できます。実回答として架空のデータを投入しないでください。

猫CSVは新しい個別公開同意を得た1匹から公開し、保存用ID・氏名・日時・地域・イベント・緯度経度は含めません。定義は `ienekomap2/public-cats-dictionary.json`。地域別集計の公開単位は月・地域・イベント・0.01度セル・2座標単位の設計ゾーンで、5件未満のグループは非公開です。定義は `ienekomap2/data-dictionary.json`。どちらもCC BY 4.0、帰属名は `2026年度東京大学シビックテックデザイン学講座Team 1`。
