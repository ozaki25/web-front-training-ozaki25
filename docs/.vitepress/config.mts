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
                {
                  text: "Day 37: 同値分割と境界値",
                  link: "/lessons/day37/",
                },
                {
                  text: "Day 38: デシジョンテーブルと状態遷移テスト",
                  link: "/lessons/day38/",
                },
                {
                  text: "Day 39: WebAssembly",
                  link: "/lessons/day39/",
                },
                {
                  text: "Day 40: ホワイトボックステスト",
                  link: "/lessons/day40/",
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
                { text: "JavaScript の妙な挙動", link: "/drafts/112/" },
                { text: "IME変換中のEnter", link: "/drafts/115/" },
                { text: "debounce と throttle", link: "/drafts/129/" },
                { text: "ハッシュテーブル", link: "/drafts/137/" },
                { text: "truthy と falsy", link: "/drafts/146/" },
                { text: "コールスタック", link: "/drafts/151/" },
                { text: "配列とオブジェクト", link: "/drafts/152/" },
              ],
            },
            {
              text: "React の核",
              items: [
                { text: "JSX と props", link: "/drafts/019/" },
                { text: "JSX の仕組み", link: "/drafts/020/" },
                { text: "useState と画面更新", link: "/drafts/021/" },
                { text: "key の役割", link: "/drafts/022/" },
                { text: "useEffect と副作用", link: "/drafts/024/" },
                { text: "Context と use()", link: "/drafts/026/" },
                { text: "状態管理の世代史", link: "/drafts/027/" },
                { text: "カスタムフック", link: "/drafts/028/" },
                { text: "useRef", link: "/drafts/088/" },
                { text: "エラーバウンダリ", link: "/drafts/083/" },
                { text: "イベントの仕組み", link: "/drafts/030/" },
                { text: "データ取得ライブラリ", link: "/drafts/031/" },
                { text: "楽観的更新", link: "/drafts/116/" },
                { text: "競合状態", link: "/drafts/122/" },
                { text: "メモリリーク", link: "/drafts/130/" },
                { text: "純粋関数", link: "/drafts/145/" },
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
                { text: "Suspense と Streaming", link: "/drafts/039/" },
                { text: "SPA のページ遷移の仕組み", link: "/drafts/040/" },
                { text: "SPA と 404", link: "/drafts/124/" },
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
                { text: "共有キャッシュ事故", link: "/drafts/125/" },
                { text: "bfcache", link: "/drafts/126/" },
                { text: "Service Worker", link: "/drafts/079/" },
                { text: "Web Storage", link: "/drafts/096/" },
                { text: "View Transitions", link: "/drafts/100/" },
                { text: "REST と GraphQL", link: "/drafts/101/" },
                { text: "二重送信と冪等性", link: "/drafts/123/" },
                { text: "タイムアウトとリトライ", link: "/drafts/136/" },
              ],
            },
            {
              text: "CSS",
              items: [
                { text: "Tailwind CSS の仕組み", link: "/drafts/023/" },
                { text: "カスケードと詳細度", link: "/drafts/076/" },
                { text: "モダン CSS", link: "/drafts/077/" },
                { text: "ダークモードの仕組み", link: "/drafts/078/" },
                { text: "スタッキングコンテキスト", link: "/drafts/119/" },
              ],
            },
            {
              text: "アクセシビリティ",
              items: [
                { text: "スクリーンリーダーから見た Web", link: "/drafts/042/" },
                { text: "WAI-ARIA の仕組み", link: "/drafts/043/" },
                { text: "フォーカス管理", link: "/drafts/044/" },
                { text: "アクセシビリティ検査の原理", link: "/drafts/089/" },
                { text: "タッチターゲット", link: "/drafts/133/" },
                { text: "ズームとリフロー", link: "/drafts/142/" },
              ],
            },
            {
              text: "セキュリティ",
              items: [
                { text: "Same-Origin Policy", link: "/drafts/155/" },
                { text: "Open Redirect", link: "/drafts/156/" },
                { text: "Cookie と認証", link: "/drafts/051/" },
                { text: "CSRF と SameSite", link: "/drafts/052/" },
                { text: "OAuth と OIDC", link: "/drafts/053/" },
                { text: "パスキー", link: "/drafts/087/" },
                { text: "npm サプライチェーン", link: "/drafts/054/" },
                { text: "CSP", link: "/drafts/132/" },
                { text: "サードパーティスクリプトの信頼範囲", link: "/drafts/134/" },
                { text: "パスワードの保存", link: "/drafts/139/" },
                { text: "クリックジャッキング", link: "/drafts/143/" },
                { text: "JWTは誰でも読める", link: "/drafts/144/" },
                { text: "IDOR", link: "/drafts/148/" },
                { text: "SQL インジェクション", link: "/drafts/150/" },
              ],
            },
            {
              text: "テスト設計・計画",
              items: [
                { text: "そもそもテストとは何か", link: "/drafts/110/" },
                { text: "経験ベースのテスト技法", link: "/drafts/108/" },
              ],
            },
            {
              text: "テストの実装・ツール",
              items: [
                { text: "Testing Library", link: "/drafts/048/" },
                { text: "モックと MSW", link: "/drafts/090/" },
                { text: "E2E テスト", link: "/drafts/046/" },
                { text: "プロパティベーステスト", link: "/drafts/120/" },
                { text: "壊し方のカタログ", link: "/drafts/135/" },
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
                { text: "ソースマップ", link: "/drafts/118/" },
                { text: "N+1とウォーターフォール", link: "/drafts/131/" },
                { text: "計算量とO記法", link: "/drafts/140/" },
                { text: "フォントの遅延", link: "/drafts/149/" },
                { text: "巨大リストの仮想化", link: "/drafts/154/" },
              ],
            },
            {
              text: "型",
              items: [
                { text: "TypeScript の型を読む", link: "/drafts/069/" },
                { text: "構造的型付け", link: "/drafts/070/" },
                { text: "型は実行時に消える", link: "/drafts/071/" },
                { text: "strict の仕組み", link: "/drafts/099/" },
                { text: "as const と satisfies", link: "/drafts/121/" },
              ],
            },
            {
              text: "開発環境",
              items: [
                { text: "npm run の仕組み", link: "/drafts/062/" },
                { text: "HMR", link: "/drafts/063/" },
                { text: "ESM とバンドラー", link: "/drafts/081/" },
                { text: "ビルドとデプロイ", link: "/drafts/064/" },
                { text: "Git のデータモデル", link: "/drafts/080/" },
                { text: "DevTools", link: "/drafts/091/" },
                { text: "エラーの読み方", link: "/drafts/097/" },
              ],
            },
            {
              text: "インフラと本番環境",
              items: [
                { text: "ローカル・ステージング・本番", link: "/drafts/114/" },
                { text: "フィーチャーフラグ", link: "/drafts/117/" },
                { text: "結果整合性", link: "/drafts/127/" },
                { text: "コールドスタート", link: "/drafts/138/" },
                { text: "ロードバランサ", link: "/drafts/153/" },
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
                { text: "取り消せる設計", link: "/drafts/128/" },
                { text: "ローディングの見せ方", link: "/drafts/141/" },
                { text: "エンプティステート", link: "/drafts/147/" },
              ],
            },
            {
              text: "AI との協働",
              items: [
                { text: "AI コーディングとの付き合い方", link: "/drafts/055/" },
                { text: "MCP", link: "/drafts/056/" },
                { text: "コンテキストウィンドウ", link: "/drafts/057/" },
                { text: "AIとの協働モード（伴走と委託）", link: "/drafts/113/" },
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
          short_name: "WFT Draft",
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
