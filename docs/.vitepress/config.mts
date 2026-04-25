import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";
import { withPwa } from "@vite-pwa/vitepress";
import { transformerTwoslash } from "@shikijs/vitepress-twoslash";
import { tabsMarkdownPlugin } from "vitepress-plugin-tabs";

export default withPwa(
  withMermaid(
    defineConfig({
      title: "Web Front-end Training",
      description: "Web フロントエンド研修コンテンツ",
      lang: "ja",
      head: [
        ["meta", { name: "theme-color", content: "#064e3b" }],
      ],
      markdown: {
        codeTransformers: [transformerTwoslash()],
        config(md) {
          md.use(tabsMarkdownPlugin);
        },
      },
      vue: {
        template: {
          compilerOptions: {
            isCustomElement: (tag) => tag === "selectedcontent",
          },
        },
      },
      themeConfig: {
        nav: [{ text: "ホーム", link: "/" }],
        sidebar: [
          {
            text: "ガイド",
            items: [{ text: "はじめに", link: "/introduction/" }],
          },
          {
            text: "公開済み",
            items: [
              { text: "Day 1: Web の仕組み", link: "/lessons/day01/" },
              { text: "Day 2: セマンティック HTML", link: "/lessons/day02/" },
              { text: "Day 3: フォーム", link: "/lessons/day03/" },
              { text: "Day 4: カスタムフォーム UI", link: "/lessons/day04/" },
              { text: "Day 5: 専用の HTML 要素で作れる UI", link: "/lessons/day05/" },
              { text: "Day 6: img タグの書き方", link: "/lessons/day06/" },
              { text: "Day 7: CSS の適用範囲", link: "/lessons/day07/" },
            ],
          },
          {
            text: "候補",
            collapsed: true,
            items: [
              { text: "CSS の基本と適用方法", link: "/drafts/002/" },
              { text: "CSS ボックスモデル", link: "/drafts/003/" },
              { text: "CSS レイアウト（flex と grid）", link: "/drafts/004/" },
              { text: "レスポンシブデザイン", link: "/drafts/006/" },
              { text: "JavaScript の役割", link: "/drafts/007/" },
              { text: "関数とスコープ", link: "/drafts/008/" },
              { text: "オブジェクトと配列", link: "/drafts/009/" },
              { text: "DOM 操作", link: "/drafts/010/" },
              { text: "fetch と非同期処理", link: "/drafts/011/" },
              { text: "HTTP とネットワーク基礎", link: "/drafts/012/" },
              { text: "モジュール（import/export）", link: "/drafts/013/" },
              { text: "エラーハンドリングとデバッグ", link: "/drafts/014/" },
              { text: "TypeScript の基本", link: "/drafts/015/" },
              { text: "型の応用", link: "/drafts/016/" },
              { text: "ジェネリクスとユーティリティ型", link: "/drafts/017/" },
              { text: "TypeScript 応用", link: "/drafts/018/" },
              { text: "React の概要と JSX", link: "/drafts/019/" },
              { text: "コンポーネントと props", link: "/drafts/020/" },
              { text: "state とイベント処理", link: "/drafts/021/" },
              { text: "条件分岐とリストレンダリング", link: "/drafts/022/" },
              { text: "useEffect とライフサイクル", link: "/drafts/023/" },
              { text: "フォームと Actions", link: "/drafts/024/" },
              { text: "useOptimistic と Transition", link: "/drafts/025/" },
              { text: "カスタム Hooks とコンポーネント設計", link: "/drafts/026/" },
              { text: "Context と状態管理パターン", link: "/drafts/027/" },
              { text: "React のレンダリング最適化", link: "/drafts/028/" },
              { text: "SPA・CSR・SSR", link: "/drafts/029/" },
              { text: "Next.js の概要とプロジェクト構成", link: "/drafts/030/" },
              { text: "Server Components と Client Components", link: "/drafts/031/" },
              { text: "レイアウトとページ", link: "/drafts/032/" },
              { text: "データ取得（Server Components）", link: "/drafts/033/" },
              { text: "Route Handlers", link: "/drafts/034/" },
              { text: "Server Actions", link: "/drafts/035/" },
              { text: "動的ルーティングとミドルウェア", link: "/drafts/036/" },
              { text: "メタデータと SEO", link: "/drafts/037/" },
              { text: "画像・フォント最適化", link: "/drafts/038/" },
              { text: "Tailwind CSS", link: "/drafts/039/" },
              { text: "テスト基礎（Vitest）", link: "/drafts/040/" },
              { text: "コンポーネントテスト", link: "/drafts/041/" },
              { text: "アクセシビリティ実践", link: "/drafts/042/" },
              { text: "アクセシビリティとテスト", link: "/drafts/043/" },
              { text: "Web パフォーマンス基礎", link: "/drafts/044/" },
              { text: "Web パフォーマンス応用", link: "/drafts/045/" },
              { text: "認証の基礎", link: "/drafts/046/" },
              { text: "Web セキュリティ", link: "/drafts/047/" },
              { text: "コンポーネント設計パターン", link: "/drafts/048/" },
              { text: "アーキテクチャ総まとめ", link: "/drafts/049/" },
              { text: "横に並べたい", link: "/drafts/050/" },
              { text: "なぜスタイルが効かない？", link: "/drafts/051/" },
              { text: "画面幅で見た目を変えたい", link: "/drafts/052/" },
              { text: "余白がおかしい", link: "/drafts/053/" },
              { text: "要素を好きな位置に置きたい", link: "/drafts/055/" },
              { text: "見た目を動かしたい", link: "/drafts/056/" },
              { text: "グリッド状に並べたい", link: "/drafts/057/" },
              { text: "カードごとにレイアウトを切り替えたい", link: "/drafts/058/" },
              { text: "中央寄せしたい", link: "/drafts/059/" },
              { text: "ダークモード対応したい", link: "/drafts/060/" },
              { text: "hover と focus で見た目を変えたい", link: "/drafts/061/" },
              { text: "レイアウトが突然はみ出す", link: "/drafts/062/" },
              { text: "スクロールで要素を固定したい", link: "/drafts/063/" },
              { text: "同じ値を何度も書きたくない", link: "/drafts/064/" },
              { text: "CSS の余白設計", link: "/drafts/065/" },
              { text: "ダークモードの仕組み", link: "/drafts/066/" },
              { text: "JSON", link: "/drafts/067/" },
            ],
          },
        ],
        outline: {
          label: "目次",
        },
        docFooter: {
          prev: "前のレッスン",
          next: "次のレッスン",
        },
        search: {
          provider: "local",
          options: {
            translations: {
              button: { buttonText: "検索" },
              modal: {
                noResultsText: "見つかりませんでした",
                resetButtonTitle: "リセット",
              },
            },
          },
        },
      },
      pwa: {
        registerType: "autoUpdate",
        manifest: {
          name: "Web Front-end Training",
          short_name: "WFT",
          description: "Web フロントエンド研修コンテンツ",
          theme_color: "#064e3b",
          background_color: "#ffffff",
          lang: "ja",
          display: "standalone",
          start_url: "/",
          icons: [
            { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
            { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
            { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
            {
              src: "maskable-icon-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          globPatterns: ["**/*.{js,css,html,woff2,png,svg,ico,webp,json}"],
        },
      },
    }),
  ),
);
