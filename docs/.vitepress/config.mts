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
        nav: [
          { text: "ホーム", link: "/" },
          { text: "候補", link: "/drafts/005/" },
        ],
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
              ],
            },
          ],
          "/drafts/": [
            {
              text: "候補",
              items: [
                { text: "関数とコールバック", link: "/drafts/005/" },
                { text: "Promise と async/await", link: "/drafts/006/" },
                { text: "ハイドレーション", link: "/drafts/013/" },
                { text: "再レンダリングと手動メモ化", link: "/drafts/015/" },
                { text: "React Compiler", link: "/drafts/016/" },
                { text: "React コードを読むための JS 構文", link: "/drafts/017/" },
                { text: "配列操作と JSX のリスト", link: "/drafts/018/" },
                { text: "JSX と props", link: "/drafts/019/" },
                { text: "JSX の正体", link: "/drafts/020/" },
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
          globPatterns: ["**/*.{js,css,html,woff2,png,svg,ico,webp,json}"],
        },
      },
    }),
  ),
);
