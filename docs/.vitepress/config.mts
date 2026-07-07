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
        sidebar: {
          "/lessons/": [
            {
              text: "Web の基礎",
              items: [
                { text: "Day 1: Web の仕組み", link: "/lessons/day01/" },
                { text: "Day 2: セマンティック HTML", link: "/lessons/day02/" },
                { text: "Day 3: フォーム", link: "/lessons/day03/" },
                { text: "Day 4: カスタムフォーム UI", link: "/lessons/day04/" },
                {
                  text: "Day 5: HTML だけで作れる UI",
                  link: "/lessons/day05/",
                },
                {
                  text: "Day 6: img タグの書き方",
                  link: "/lessons/day06/",
                },
                {
                  text: "Day 7: CSS の適用範囲",
                  link: "/lessons/day07/",
                },
                {
                  text: "Day 8: PWA と Web API",
                  link: "/lessons/day08/",
                },
                {
                  text: "Day 9: CSS の余白設計",
                  link: "/lessons/day09/",
                },
                {
                  text: "Day 10: CSS のレイアウト",
                  link: "/lessons/day10/",
                },
                {
                  text: "Day 11: レスポンシブデザイン",
                  link: "/lessons/day11/",
                },
                {
                  text: "Day 12: CSS アニメーション",
                  link: "/lessons/day12/",
                },
                {
                  text: "Day 13: JavaScript の実行環境",
                  link: "/lessons/day13/",
                },
                {
                  text: "Day 14: 動的型付けと TypeScript",
                  link: "/lessons/day14/",
                },
                {
                  text: "Day 15: Web ページの届け方",
                  link: "/lessons/day15/",
                },
                {
                  text: "Day 16: 参照とイミュータビリティ",
                  link: "/lessons/day16/",
                },
                {
                  text: "Day 17: パッケージとバージョン",
                  link: "/lessons/day17/",
                },
                {
                  text: "Day 18: 宣言的 UI",
                  link: "/lessons/day18/",
                },
                {
                  text: "Day 19: 仮想 DOM",
                  link: "/lessons/day19/",
                },
                {
                  text: "Day 20: デザイントークン",
                  link: "/lessons/day20/",
                },
                {
                  text: "Day 21: 制御と非制御コンポーネント",
                  link: "/lessons/day21/",
                },
                {
                  text: "Day 22: 文字数カウントの罠",
                  link: "/lessons/day22/",
                },
                {
                  text: "Day 23: 再レンダリングと手動メモ化",
                  link: "/lessons/day23/",
                },
                {
                  text: "Day 24: React Compiler",
                  link: "/lessons/day24/",
                },
                {
                  text: "Day 25: ツールがコードを読む仕組み",
                  link: "/lessons/day25/",
                },
                {
                  text: "Day 26: 色のアクセシビリティ",
                  link: "/lessons/day26/",
                },
                {
                  text: "Day 27: XSS",
                  link: "/lessons/day27/",
                },
                {
                  text: "Day 28: キャッシュの全体像",
                  link: "/lessons/day28/",
                },
                {
                  text: "Day 29: Request Memoization",
                  link: "/lessons/day29/",
                },
                {
                  text: "Day 30: データキャッシュ",
                  link: "/lessons/day30/",
                },
                {
                  text: "Day 31: Full Route Cache",
                  link: "/lessons/day31/",
                },
                {
                  text: "Day 32: Router Cache",
                  link: "/lessons/day32/",
                },
                {
                  text: "Day 33: revalidate の使い分け",
                  link: "/lessons/day33/",
                },
                {
                  text: "Day 34: キャッシュの新モデル",
                  link: "/lessons/day34/",
                },
                {
                  text: "Day 35: テスト計画",
                  link: "/lessons/day35/",
                },
                {
                  text: "Day 36: テスト設計技法の分類",
                  link: "/lessons/day36/",
                },
              ],
            },
          ],
        },
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
          globPatterns: ["**/*.{js,css,woff2,png,svg,ico,webp,json}"],
          navigateFallback: null,
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.mode === "navigate",
              handler: "NetworkFirst",
              options: {
                cacheName: "wft-html",
                networkTimeoutSeconds: 5,
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      },
    }),
  ),
);
