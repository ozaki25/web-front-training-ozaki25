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
              { text: "CSS ボックスモデル", link: "/drafts/003/" },
              { text: "CSS レイアウト", link: "/drafts/004/" },
              { text: "レスポンシブの仕組み", link: "/drafts/006/" },
              { text: "JavaScript の役割", link: "/drafts/007/" },
              { text: "アロー関数とスコープ", link: "/drafts/008/" },
              { text: "配列操作", link: "/drafts/009/" },
              { text: "DOM 操作", link: "/drafts/010/" },
              { text: "データを取りに行く", link: "/drafts/011/" },
              { text: "HTTP", link: "/drafts/012/" },
              { text: "モジュール", link: "/drafts/013/" },
              { text: "エラーメッセージの読み方", link: "/drafts/014/" },
              { text: "型とは何か", link: "/drafts/015/" },
              { text: "ジェネリクスと型の絞り込み", link: "/drafts/017/" },
              { text: "React が解決した問題", link: "/drafts/019/" },
              { text: "state", link: "/drafts/021/" },
              { text: "リストと条件分岐", link: "/drafts/022/" },
              { text: "useEffect", link: "/drafts/023/" },
              { text: "フォームと Server Actions", link: "/drafts/024/" },
              { text: "カスタム Hooks", link: "/drafts/026/" },
              { text: "Context", link: "/drafts/027/" },
              { text: "SPA・CSR・SSR", link: "/drafts/029/" },
              { text: "Next.js のプロジェクト構成", link: "/drafts/030/" },
              { text: "Server / Client Components", link: "/drafts/031/" },
              { text: "データ取得", link: "/drafts/033/" },
              { text: "Route Handlers と Server Actions", link: "/drafts/034/" },
              { text: "動的ルーティング", link: "/drafts/036/" },
              { text: "Tailwind CSS", link: "/drafts/039/" },
              { text: "テストの考え方", link: "/drafts/040/" },
              { text: "Web パフォーマンス", link: "/drafts/044/" },
              { text: "認証とセキュリティ", link: "/drafts/046/" },
              { text: "なぜスタイルが効かない？", link: "/drafts/051/" },
              { text: "要素を好きな位置に置きたい", link: "/drafts/055/" },
              { text: "見た目を動かしたい", link: "/drafts/056/" },
              { text: "疑似クラス", link: "/drafts/061/" },
              { text: "レイアウトが突然はみ出す", link: "/drafts/062/" },
              { text: "スクロールで要素を固定したい", link: "/drafts/063/" },
              { text: "CSS の余白設計", link: "/drafts/065/" },
              { text: "ダークモードの仕組み", link: "/drafts/066/" },
              { text: "JSON", link: "/drafts/067/" },
              { text: "番外編: ブラウザでここまでできる", link: "/drafts/068/" },
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
