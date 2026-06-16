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
                {
                  text: "Day 23: 再レンダリングと手動メモ化",
                  link: "/lessons/day23/",
                },
                {
                  text: "Day 24: React Compiler",
                  link: "/lessons/day24/",
                },
              ],
            },
          ],
          "/drafts/": [
            {
              text: "JS の基礎",
              items: [
                { text: "関数とコールバック", link: "/drafts/005/" },
                { text: "Promise", link: "/drafts/006/" },
                { text: "async/await", link: "/drafts/086/" },
                { text: "React コードを読むための JS 構文", link: "/drafts/017/" },
                { text: "配列操作と JSX のリスト", link: "/drafts/018/" },
                { text: "イベントループ", link: "/drafts/029/" },
                { text: "スコープとクロージャ", link: "/drafts/025/" },
                { text: "日付とタイムゾーンの罠", link: "/drafts/085/" },
                { text: "URL の解剖", link: "/drafts/084/" },
                { text: "JSON", link: "/drafts/103/" },
              ],
            },
            {
              text: "React の核",
              items: [
                { text: "JSX と props", link: "/drafts/019/" },
                { text: "JSX の正体", link: "/drafts/020/" },
                { text: "useState と画面更新", link: "/drafts/021/" },
                { text: "key の正体", link: "/drafts/022/" },
                { text: "useEffect と副作用", link: "/drafts/024/" },
                { text: "再レンダリングと手動メモ化", link: "/drafts/015/" },
                { text: "React Compiler", link: "/drafts/016/" },
                { text: "Context と use()", link: "/drafts/026/" },
                { text: "状態管理の世代史", link: "/drafts/027/" },
                { text: "カスタムフック", link: "/drafts/028/" },
                { text: "useRef", link: "/drafts/088/" },
                { text: "エラーバウンダリ", link: "/drafts/083/" },
                { text: "イベントの仕組み", link: "/drafts/030/" },
                { text: "データ取得ライブラリ", link: "/drafts/031/" },
              ],
            },
            {
              text: "Next.js / App Router",
              items: [
                { text: "ハイドレーション", link: "/drafts/013/" },
                { text: "Server / Client Components", link: "/drafts/033/" },
                { text: "App Router のファイル規約", link: "/drafts/034/" },
                { text: "SC でのデータ取得", link: "/drafts/035/" },
                { text: "動的ルート", link: "/drafts/093/" },
                { text: "Server Actions とフォーム", link: "/drafts/037/" },
                { text: "フォームバリデーション", link: "/drafts/095/" },
                { text: "キャッシュ制御", link: "/drafts/038/" },
                { text: "Suspense と Streaming", link: "/drafts/039/" },
                { text: "SPA のページ遷移の正体", link: "/drafts/040/" },
                { text: "proxy.ts", link: "/drafts/092/" },
                { text: "環境変数", link: "/drafts/065/" },
                { text: "metadata と OGP", link: "/drafts/094/" },
              ],
            },
            {
              text: "Web 標準と通信",
              items: [
                { text: "HTTP とステータスコード", link: "/drafts/032/" },
                { text: "CORS", link: "/drafts/036/" },
                { text: "WebSocket と SSE", link: "/drafts/041/" },
                { text: "HTTP キャッシュと CDN", link: "/drafts/060/" },
                { text: "Service Worker", link: "/drafts/079/" },
                { text: "Web Storage", link: "/drafts/096/" },
                { text: "View Transitions", link: "/drafts/100/" },
                { text: "REST と GraphQL", link: "/drafts/101/" },
              ],
            },
            {
              text: "CSS",
              items: [
                { text: "Tailwind CSS の仕組み", link: "/drafts/023/" },
                { text: "カスケードと詳細度", link: "/drafts/076/" },
                { text: "モダン CSS", link: "/drafts/077/" },
                { text: "ダークモードの仕組み", link: "/drafts/078/" },
              ],
            },
            {
              text: "アクセシビリティ",
              items: [
                { text: "スクリーンリーダーから見た Web", link: "/drafts/042/" },
                { text: "WAI-ARIA の正体", link: "/drafts/043/" },
                { text: "フォーカス管理", link: "/drafts/044/" },
                { text: "色のアクセシビリティ", link: "/drafts/045/" },
                { text: "アクセシビリティ検査の原理", link: "/drafts/089/" },
              ],
            },
            {
              text: "セキュリティ",
              items: [
                { text: "XSS", link: "/drafts/050/" },
                { text: "Cookie と認証", link: "/drafts/051/" },
                { text: "CSRF と SameSite", link: "/drafts/052/" },
                { text: "OAuth と OIDC", link: "/drafts/053/" },
                { text: "パスキー", link: "/drafts/087/" },
                { text: "npm サプライチェーン", link: "/drafts/054/" },
              ],
            },
            {
              text: "テスト",
              items: [
                { text: "E2E テスト", link: "/drafts/046/" },
                { text: "テストを読む目", link: "/drafts/047/" },
                { text: "Testing Library", link: "/drafts/048/" },
                { text: "テストのコスト構造", link: "/drafts/049/" },
                { text: "モックと MSW", link: "/drafts/090/" },
              ],
            },
            {
              text: "パフォーマンスと観測",
              items: [
                { text: "Web Vitals", link: "/drafts/058/" },
                { text: "バンドルサイズ", link: "/drafts/059/" },
                { text: "next/image と next/font", link: "/drafts/061/" },
                { text: "レンダリングパイプライン", link: "/drafts/102/" },
                { text: "フロントエンドの可観測性", link: "/drafts/082/" },
              ],
            },
            {
              text: "型",
              items: [
                { text: "TypeScript の型を読む", link: "/drafts/069/" },
                { text: "構造的型付け", link: "/drafts/070/" },
                { text: "型は実行時に消える", link: "/drafts/071/" },
                { text: "strict の仕組み", link: "/drafts/099/" },
              ],
            },
            {
              text: "開発環境",
              items: [
                { text: "npm run の正体", link: "/drafts/062/" },
                { text: "HMR", link: "/drafts/063/" },
                { text: "ESM とバンドラー", link: "/drafts/081/" },
                { text: "ビルドとデプロイ", link: "/drafts/064/" },
                { text: "Git のデータモデル", link: "/drafts/080/" },
                { text: "DevTools", link: "/drafts/091/" },
                { text: "エラーの読み方", link: "/drafts/097/" },
                { text: "ツールがコードを読む仕組み", link: "/drafts/098/" },
              ],
            },
            {
              text: "設計とコードの読み書き",
              items: [
                { text: "コンポーネントの責務分割", link: "/drafts/066/" },
                { text: "命名という設計", link: "/drafts/067/" },
                { text: "コロケーション", link: "/drafts/068/" },
              ],
            },
            {
              text: "UX・デザイン",
              items: [
                { text: "ダークパターン", link: "/drafts/072/" },
                { text: "UI デザインの法則", link: "/drafts/073/" },
                { text: "OOUI", link: "/drafts/074/" },
                { text: "デザインシステムの実装", link: "/drafts/075/" },
              ],
            },
            {
              text: "AI との協働",
              items: [
                { text: "AI コーディングとの付き合い方", link: "/drafts/055/" },
                { text: "MCP", link: "/drafts/056/" },
                { text: "コンテキストウィンドウ", link: "/drafts/057/" },
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
