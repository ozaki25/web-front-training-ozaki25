# テーマ候補リスト

25 スプリントの発散→収束→フィードバックサイクルで精緻化した候補。
既存レッスン（Day 01-22）・下書き（005, 006, 013, 015, 016）との重複なし。

> ステータス: 候補段階。内容・順序・数はいつでも変わりうる。

## ティア定義

| ティア | 基準 |
|--------|------|
| A（必須） | これがないと Next.js のコードが読めない / 配属初日に困る |
| B（重要） | 配属 1 ヶ月以内に「聞いたことがある」必要がある |
| C（有用） | 引き出しとしてあると便利だが、配属直後には不要 |

## Tier A（必須）— 16 テーマ

依存順に並べてある。上のものが下の前提になる。

| # | テーマ | 説明 | 前提 |
|---|--------|------|------|
| A1 | React コードを読むための JS 構文 | import/export、分割代入、スプレッド構文、テンプレートリテラル。React のほぼ全行に出てくる文法 | Day 13（JS実行環境）|
| A2 | 配列操作と JSX のリスト | map / filter / find。一覧描画と key の必要性 | A1 |
| A3 | JSX と props | 関数が UI を返す。props で親から子にデータを渡す。条件レンダリング（&&、三項演算子） | A1, A2 |
| A4 | useState と画面更新 | state 変更 → 再レンダリングの因果。Day 18（宣言的UI）の実践 | A3 |
| A5 | useEffect と副作用 | API 呼び出し・タイマー・クリーンアップ。依存配列。最も混乱する hook | A4, 下書き006（Promise） |
| A6 | JSON とデータ構造 | API レスポンスの読み方。parse / stringify。ネストしたオブジェクトへのアクセス | A1 |
| A7 | HTTP とステータスコード | GET / POST、200 / 404 / 500。fetch が何を送受信しているか | A6 |
| A8 | エラーの読み方とデバッグ | スタックトレース、エラーメッセージのどこを見るか。DevTools Console の使い方 | — |
| A9 | Tailwind CSS の読み方 | ユーティリティクラスとプロパティの対応。className の長い文字列を読めるようにする | Day 07-12（CSS基礎）|
| A10 | Git の基本 | add / commit / diff / log。変更を記録する仕組み | — |
| A11 | 環境変数 | NEXT_PUBLIC_ の意味。秘密情報をクライアントに漏らさない | — |
| A12 | Server Components と Client Components | "use client" の境界。なぜデフォルトがサーバーか。Day 15（届け方）の具体実装 | A3, A4, A11, 下書き013（ハイドレーション） |
| A13 | App Router のファイル規約 | page / layout / loading / error / not-found。ファイル名が URL と UI 骨格を決める | A12 |
| A14 | Server Components でのデータ取得 | async コンポーネントで fetch。エラーハンドリング。API Route なしの世界 | A7, A12 |
| A15 | Server Actions | "use server" でサーバー関数を定義。フォーム送信・データ変更を API なしで実行 | A14 |
| A16 | キャッシュ制御 | "use cache"、cacheLife / cacheTag、revalidate。Day 15 の概念の実践 | A14 |

## Tier B（重要）— 13 テーマ

| # | テーマ | 説明 | 前提 |
|---|--------|------|------|
| B1 | Context と use() | props バケツリレー問題の解決。React 19 の use() による読み取り | A4 |
| B2 | カスタムフック | ロジックを use〜 関数に切り出して再利用。hooks のルール | A5 |
| B3 | Suspense と loading/error | 読み込み中・エラーの UI を宣言的に定義。use() で Promise を読む。Error Boundary | A5, A13 |
| B4 | フォーム処理の全体像 | Server Actions + useActionState + バリデーション + エラー表示の一連フロー | A15, Day 03, Day 21 |
| B5 | イベントの仕組み | バブリング、e.preventDefault()、e.stopPropagation()。React の合成イベント | A3 |
| B6 | next/image と next/font | 画像最適化と CLS 防止。Day 6 の img の課題を Next.js が自動解決 | A12, Day 06 |
| B7 | メタデータと OGP | metadata export / generateMetadata。SNS シェア時の見え方。SEO の基本 | A13 |
| B8 | Cookie と認証の基礎 | セッション / JWT / OAuth。ログイン状態の持ち方。なぜ認証周りは慎重か | A7 |
| B9 | CORS | 別ドメイン API を呼べない理由。SC ではサーバー fetch で CORS 不要になる理由 | A7, A12 |
| B10 | ブランチと PR | なぜブランチを切るか → PR → レビュー → マージの流れ。LGTM / nit | A10 |
| B11 | ESLint と Prettier | lint エラーの意味と直し方。フォーマッターとリンターの違い | — |
| B12 | DevTools | Elements / Console / Network / Application。React DevTools | A8 |
| B13 | テストの考え方 | 何をどこまで。単体 / 結合 / E2E。テストピラミッド。Vitest + Testing Library | A4 |

## Tier C（有用）— 9 テーマ

| # | テーマ | 説明 |
|---|--------|------|
| C1 | useRef | 再レンダリングせずに値を保持。DOM 直接参照。React 19 で forwardRef 不要 |
| C2 | TypeScript の型を読む | ユニオン型、ジェネリクス、型の絞り込み。AI が書いた型定義の理解 |
| C3 | 動的ルートとルートグループ | [slug] / (group) / [...catchAll]。URL パラメータと構成整理 |
| C4 | Proxy（旧 Middleware） | リクエスト振り分け。認証チェック、リダイレクト |
| C5 | CI/CD とデプロイ | push → GitHub Actions → Vercel Preview → Production の流れ |
| C6 | Web Storage | localStorage / sessionStorage。テーマ切替の保存。SC では使えない制約 |
| C7 | XSS と CSRF | React が暗黙に守ってくれているセキュリティ。dangerouslySetInnerHTML の危険 |
| C8 | イベントループ | シングルスレッドなのに固まらない仕組み。非同期処理の根本概念 |
| C9 | スコープとクロージャ | 変数が見える範囲。stale closure（useEffect で古い値を参照するバグ）の原因 |

## 既存下書きとの統合

| 下書き | 位置づけ | 依存関係上の配置 |
|--------|---------|----------------|
| 005 関数とコールバック | A1 の前提 | A1 の直前 |
| 006 Promise と async/await | A5 の前提 | A4 と A5 の間 |
| 013 ハイドレーション | A12 の前提 | A11 と A12 の間 |
| 015 再レンダリングと手動メモ化 | A4 の発展 | A5 の直後 |
| 016 React Compiler | 015 の続き | 015 の直後 |

## 全体の推奨順序（公開済み Day 22 以降）

Day 22 までは公開済み。以下は Day 23 以降の候補順。

1. 下書き 005（関数とコールバック）
2. 下書き 006（Promise と async/await）
3. A1: JS 構文（import/export・分割代入・スプレッド）
4. A2: 配列操作と JSX のリスト
5. A3: JSX と props
6. A4: useState と画面更新
7. A5: useEffect と副作用
8. 下書き 015（再レンダリングと手動メモ化）
9. 下書き 016（React Compiler）
10. A6: JSON とデータ構造
11. A7: HTTP とステータスコード
12. A8: エラーの読み方
13. A9: Tailwind CSS の読み方
14. A10: Git の基本
15. A11: 環境変数
16. 下書き 013（ハイドレーション）
17. A12: Server Components と Client Components
18. A13: App Router のファイル規約
19. A14: SC でのデータ取得
20. A15: Server Actions
21. A16: キャッシュ制御
22-34. Tier B（B1〜B13）
35-43. Tier C（C1〜C9）
