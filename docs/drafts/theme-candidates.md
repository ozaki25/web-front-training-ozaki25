# テーマ候補リスト v2

作者（ozaki25）の公開発信履歴の調査を踏まえて再選定した候補。
既存レッスン（Day 01-22）・下書き（005, 006, 013, 015, 016）との重複なし。

> ステータス: 候補段階。内容・順序・数はいつでも変わりうる。

## 選定軸

v1 は「汎用研修カリキュラム」に寄りすぎて教材の声と合わなかった。v2 は 3 軸で選定する。

1. **仕組みから語れるか**: 「〜って何なの？」「〜ってどうなってるの？」と疑問形で掘れるテーマか。手順の説明しかできないテーマは弱い
2. **ペルソナが共感できるか**: AI 丸投げ経験者が「見たことある」「困ったことある」から入れるか
3. **作者の知見が深いか**: 発信履歴（Qiita 111記事、handson 10本超、勉強会参加）の蓄積がある領域か

この軸で、v1 の Git / PR 文化 / ESLint / アジャイル用語 / Issue 管理 / CI/CD などのプロセス系テーマは大幅に優先度を下げた（作者の発信履歴にほぼ無く、仕組み語りになりにくい）。

## 作者の関心マップ（調査結果の要約）

| 領域 | 根拠 |
|------|------|
| SPA/SSR/仮想DOM の仕組み | 代表記事「SPAってページ遷移するの？」、スライド「SPAでSSRする」「仮想DOM」（Day 15/19 で引用済み） |
| PWA / Web 標準 API | PWA Advent Calendar、Push/Notification API 記事、Web OTP・Portals 検証リポジトリ |
| アクセシビリティ | react-screen-reader-sample、A11y Tokyo Meetup 等への参加 |
| テスト自動化 | e2e-test-handson、Appium/Cypress 記事、JaSST 参加 |
| 状態管理 | 「Reactにおける状態管理」記事 |
| GraphQL / API | graphql-handson、Apollo 記事 |
| ビルド・コンパイル | 「JavaScriptの不思議な記法をBabelを通して解釈してみる」 |
| Web Vitals | web-vitals 検証、Day 6 で CWV 既出 |
| TypeScript | TSKaigi 2024-2026 連続参加 |
| AI コーディング | AI Coding Meetup 等参加、本教材のコンセプト自体 |
| デザイン | Designship 参加、color-coordination-training、UX 教材 |

## Tier S（作者の知見 × 仕組み語り × 共感の三拍子）— 10 テーマ

| # | テーマ | 仕組み語りの入口 | 作者の知見 |
|---|--------|----------------|-----------|
| S1 | SPA のページ遷移の正体 | リンクを押してもサーバーにリクエストが飛ばない。History API と `<Link>` の裏側 | 代表記事の現代版（App Router 文脈で書き直す価値が高い） |
| S2 | 状態管理の世代史 | useState のバケツリレーが辛い → Context → Redux → Zustand/Jotai。なぜ何世代も生まれたか | 状態管理記事。CSS スコープ史（Day 7）と同じ「歴史もの」フォーマット |
| S3 | JSX の正体 | `<div>` は HTML ではない。ビルドで関数呼び出しに変換される。Babel/SWC が何をしているか | Babel 記事。React Compiler（016）と同じ「ビルド時変換」の話で繋がる |
| S4 | Suspense と Streaming | ローディングスピナーだらけの画面はなぜ生まれるか。HTML が少しずつ届く仕組み | スライド「SPAでSSRする」の到達点。Day 15 の実践編 |
| S5 | Service Worker | オフラインでも動く Web アプリの心臓部。リクエストに割り込むプロキシ | PWA Advent Calendar 2 本。Day 8 の深掘り |
| S6 | スクリーンリーダーから見た Web | 自分のアプリは「読み上げ」られるとどう聞こえるか。セマンティクスが音になる | react-screen-reader-sample。全レッスンの a11y 方針の集大成 |
| S7 | E2E テストとテスト戦略 | 「動くか」を人間が毎回確かめるのは無理。ブラウザを自動操縦する仕組みと、どこまでやるか | e2e-test-handson、Appium/Cypress 記事、JaSST 参加 |
| S8 | REST と GraphQL | API の形はなぜ 2 派あるのか。取りすぎ・足りなすぎ問題 | graphql-handson、Apollo 記事 |
| S9 | Web Vitals の計測 | 「速い」を数字にする。LCP/CLS/INP を実際に測って改善する流れ | web-vitals 検証。Day 6 の発展 |
| S10 | AI コーディングとの付き合い方 | AI の成果物をどう評価するか。丸投げと使いこなしの境界 | 直近の関心。本教材のコンセプトのメタ回 |

## Tier A（ペルソナ必須の React/Next.js 基礎）— 12 テーマ

作者も React 教材を 8 年作り続けている領域。v1 から維持しつつ、プロセス系を除外して絞った。

| # | テーマ | 説明 |
|---|--------|------|
| A1 | React コードを読むための JS 構文 | import/export、分割代入、スプレッド。React のほぼ全行に出る文法 |
| A2 | 配列操作と JSX のリスト | map / filter / find。一覧描画と key |
| A3 | JSX と props | 関数が UI を返す。条件レンダリング（&&、三項演算子）含む |
| A4 | useState と画面更新 | state 変更 → 再レンダリング。Day 18 の実践 |
| A5 | useEffect と副作用 | クリーンアップ、依存配列。最も混乱する hook |
| A6 | Context と use() | props バケツリレーの解決。S2（状態管理史）の前提 |
| A7 | カスタムフック | ロジックの切り出しと再利用。「use〜」の意味 |
| A8 | Server Components と Client Components | "use client" の境界。なぜデフォルトがサーバーか |
| A9 | App Router のファイル規約 | page / layout / loading / error。ファイル名が UI 骨格を決める |
| A10 | Server Components でのデータ取得 | async コンポーネント。API Route なしで fetch |
| A11 | Server Actions とフォーム | "use server"、useActionState。Day 3 → Day 21 → ここの三部作 |
| A12 | キャッシュ制御 | "use cache"、cacheLife / cacheTag。Day 15 の概念の実践 |

## Tier B（仕組み系の補強）— 8 テーマ

| # | テーマ | 説明 |
|---|--------|------|
| B1 | イベントの仕組み | バブリング、preventDefault。React の合成イベントの土台 |
| B2 | HTTP とステータスコード | fetch が何を送受信しているか。キャッシュヘッダーまで |
| B3 | Cookie と認証 | セッション / JWT。ログイン状態の持ち方の仕組み |
| B4 | CORS | なぜ別ドメインの API を呼べないか。SC でサーバー fetch なら不要な理由 |
| B5 | イベントループ | シングルスレッドなのに固まらない仕組み。Promise（006）の根本 |
| B6 | スコープとクロージャ | stale closure。useEffect で古い値を参照するバグの原因 |
| B7 | next/image と next/font | Day 6 の課題を Next.js が自動解決する仕組み |
| B8 | TypeScript の型を読む | ユニオン、ジェネリクス、絞り込み。TSKaigi 関心と接続 |

## Tier C（プロセス系・選択的に）— v1 から降格

Git、PR とレビュー、ESLint/Prettier、CI/CD とデプロイ、DevTools、環境変数、エラーの読み方、JSON、メタデータ/OGP、Web Storage、XSS/CSRF、useRef、動的ルート、Proxy。

必要性は否定しないが、作者の発信スタイル（仕組み語り）に乗りにくいものが多い。
扱う場合は「仕組みから語れる形」に再構成できたものだけ昇格させる。
（例: 「エラーの読み方」→ スタックトレースの仕組みから語るなら成立しうる）

## 公開順序の考え方

厳密な順序は publish 時に決める。大きな流れ:

1. **JS 基礎の補完**（下書き 005, 006 → A1, A2）
2. **React の核**（A3 → A4 → A5 → 下書き 015, 016 → A6, A7）
3. **仕組みの深掘りを混ぜる**（S1, S3, B1, B5, B6 を React 基礎の合間に）
4. **Next.js 実践**（下書き 013 → A8〜A12 → S4）
5. **広がり**（S5〜S10, B2〜B4, B7, B8）

単調にならないよう、React 基礎の連続の合間に S 系（歴史もの・仕組みもの）を挟んで緩急をつける。
