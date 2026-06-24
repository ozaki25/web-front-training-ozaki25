# 技術バージョンリファレンス

レッスン作成時に参照する、各技術の最新バージョンと API の記録。
**レッスン作成・修正のたびに、該当する技術の公式ドキュメントまたは Web 検索で最新情報を確認し、このファイルを更新すること。**

> 最終確認日: 2026-04-05

## フレームワーク・ライブラリ

| 技術 | バージョン | 主な変更点・注意事項 |
|------|-----------|---------------------|
| Next.js | 16.2 | App Router。`middleware.ts` → `proxy.ts`（export 関数名も `proxy`）。Node.js ランタイム（Edge ではない）。`cacheComponents: true` で "use cache" 有効化（`dynamicIO` は廃止）。`create-next-app` は `tailwind.config.ts` を生成しない。**Turbopack が dev / build の既定**（`--turbopack` フラグ不要）。**`next lint` は削除**（ESLint / Biome を直接実行。scripts は `"lint": "eslint"` 形式）。16.1 で Node.js 最低版を 20.9.0 に引き上げ（18 は非サポート）。16.2 で Server Fast Refresh 既定化・Link に `transitionTypes` prop 追加 |
| React | 19.2 系 | form actions, useActionState, useFormStatus, useOptimistic, use() API（useContext の代替）。forwardRef 非推奨（ref を通常の prop として渡せる）。19.2（2025/10）で useEffectEvent・`<Activity>`・View Transitions 対応・Suspense の一括表示が追加。RSC のセキュリティ修正が 19.x パッチで継続提供（19.0.1 / 19.1.2 / 19.2.1 等）。**React 20 は未リリース**（2026/06 時点。一部ブログの「React 20」記事は誤情報） |
| React Compiler | 1.0 | React 19 に自動バンドルされない。`npm install -D babel-plugin-react-compiler`。Next.js では `next.config.ts` に `reactCompiler: true` を追加 |
| TypeScript | 6 系（安定）/ 7 ベータ | satisfies 演算子、as const、const type parameters。**TypeScript 7 = Go 製ネイティブコンパイラ（tsgo）がベータ公開中**（2026/06 時点。約10倍高速・構文や型の書き方は不変）。6 系は移行ブリッジの位置づけ。「TS7 安定版リリース済み」と主張するブログは誤情報 |
| Tailwind CSS | 4.3 | CSS ファースト設定。`@import "tailwindcss"`、`@theme` ブロック。`tailwind.config.js/ts` は不要。`@tailwindcss/postcss` を使用。4.1 でテキストシャドウ・マスク、4.2 で webpack プラグイン・論理プロパティ、4.3 が現行安定版 |
| Vitest | 最新安定版 | Jest 互換 API。`vitest.config.ts` で設定 |
| Testing Library | 最新安定版 | `@testing-library/react`, `@testing-library/user-event` |
| Auth.js (NextAuth) | **v5（安定版）** | `auth()` 関数に統合（getServerSession 等を置換）。環境変数は `AUTH_*` プレフィックス。**プロジェクトは Better Auth 社に移管済みで同社が維持**。新規選定の主候補は Auth.js / Better Auth / Clerk |
| TanStack Query | v5 | `useQuery({ queryKey, queryFn })`。`isPending`（v4 の `isLoading` から改名）。戻り値は判別可能ユニオン |
| Playwright | 最新安定版 | `getByRole` / `getByLabel` などロールベースのロケータが推奨。`expect(...).toBeVisible()` で自動待機 |
| MSW | v2 | `http.get(...)` + `HttpResponse.json(...)`（v1 の `rest.get` / `res(ctx.json())` から API 刷新） |
| Zod | **4** | `z.object` / `safeParse`。メール等の形式検証はトップレベル関数に昇格（`z.email()`、`z.url()`、`z.uuidv4()` 等）。`z.string().email()` の形は**非推奨**（次のメジャーで削除予定）。クライアントとサーバーでスキーマ共有が定番 |
| Zustand | v5 | `create<T>((set) => ...)`。セレクタで購読粒度を制御 |

## Next.js の主要 API 変更（従来 → 現在）

| 従来 | 現在（Next.js 16） | 備考 |
|------|-------------------|------|
| `middleware.ts` / `export function middleware` | `proxy.ts` / `export function proxy` | Node.js ランタイムで動作 |
| `experimental.dynamicIO` | `cacheComponents: true` | experimental ではなくなった |
| `unstable_cache` | `"use cache"` ディレクティブ | ファイル/コンポーネント/関数レベルで適用可能 |
| `fetch` の `next.revalidate` | `cacheLife()` / `cacheTag()` | "use cache" と組み合わせて使用 |
| `useContext(Ctx)` | `use(Ctx)` も可 | React 19 の新 API。条件分岐内でも使える |
| `React.memo` / `useMemo` / `useCallback` | React Compiler で自動化 | 手動での使用は基本不要に |
| `forwardRef` | ref を通常の prop として受け取り | React 19 で非推奨 |

## キャッシュ系レッスンのモデル方針（決定事項）

Next.js 16 のキャッシュには2つのモデルがある。

- **従来モデル**（`cacheComponents: false`、現状の既定）: `fetch` のオプション（`revalidate` / `force-cache` / `tags`）、`unstable_cache`、4キャッシュ（Request Memoization / Data Cache / Full Route Cache / Router Cache）。Next.js 15 で `fetch` の既定が `no-store` に変更済み
- **新モデル**（`cacheComponents: true`、opt-in）: `"use cache"` / `cacheLife` / `cacheTag`。今後の本流だが現状は opt-in

**研修のキャッシュ詳細レッスン（データキャッシュ / Full Route Cache / Router Cache / Request Memoization）は従来モデルで書く。** 配属先の方針（cacheComponents 無効）に合わせるため。新モデル（`"use cache"`）を扱う場合は別レッスンとして切り出す。

この方針は意図的なもの。従来モデルのレッスンを「新モデルに直す」修正をしないこと。Day 15（概要レッスン）が新モデルに触れているが、詳細レッスンとは役割が別。

## 確認手順

レッスンで技術を扱う際は、以下の手順で最新情報を確認する:

1. **公式ドキュメントを確認**: Context7 MCP または Web 検索で公式ドキュメントの最新版を参照
2. **このファイルと照合**: 記載内容と矛盾がないか確認。矛盾があればこのファイルを更新
3. **コード例を検証**: API 名、インポートパス、設定方法が最新であることを確認
4. **他レッスンとの整合性**: 同じ技術を扱う他の Day と情報が一致しているか確認
