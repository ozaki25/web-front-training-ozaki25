import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";
import { transformerTwoslash } from "@shikijs/vitepress-twoslash";
import { tabsMarkdownPlugin } from "vitepress-plugin-tabs";

export default withMermaid(
  defineConfig({
    title: "Web Front-end Training",
    description: "Web フロントエンド研修コンテンツ",
    lang: "ja",
    markdown: {
      codeTransformers: [transformerTwoslash()],
      config(md) {
        md.use(tabsMarkdownPlugin);
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
          text: "Phase 1: HTML/CSS の基礎",
          items: [
            { text: "Day 1: HTML の基本構造", link: "/lessons/day01/" },
            { text: "Day 2: セマンティック HTML", link: "/lessons/day02/" },
            { text: "Day 3: フォーム", link: "/lessons/day03/" },
            {
              text: "Day 4: カスタムフォーム UI",
              link: "/lessons/day04/",
            },
            {
              text: "Day 5: HTML だけで作れる UI",
              link: "/lessons/day05/",
            },
            { text: "Day 6: CSS の基本と適用方法", link: "/lessons/day06/" },
            {
              text: "Day 7: CSS ボックスモデルとレイアウト",
              link: "/lessons/day07/",
            },
            { text: "Day 8: Flexbox", link: "/lessons/day08/" },
            { text: "Day 9: CSS Grid", link: "/lessons/day09/" },
            {
              text: "Day 10: レスポンシブデザインと CSS の課題",
              link: "/lessons/day10/",
            },
          ],
        },
        {
          text: "Phase 2: JavaScript の基礎",
          items: [
            { text: "Day 11: JavaScript の基本文法", link: "/lessons/day11/" },
            { text: "Day 12: 関数とスコープ", link: "/lessons/day12/" },
            { text: "Day 13: オブジェクトと配列", link: "/lessons/day13/" },
            { text: "Day 14: DOM 操作", link: "/lessons/day14/" },
            { text: "Day 15: 非同期処理", link: "/lessons/day15/" },
            {
              text: "Day 16: HTTP とネットワーク基礎",
              link: "/lessons/day16/",
            },
            { text: "Day 17: ES Modules", link: "/lessons/day17/" },
            {
              text: "Day 18: エラーハンドリングとデバッグ",
              link: "/lessons/day18/",
            },
          ],
        },
        {
          text: "Phase 3: TypeScript",
          items: [
            { text: "Day 19: TypeScript の基本", link: "/lessons/day19/" },
            { text: "Day 20: 型の応用", link: "/lessons/day20/" },
            {
              text: "Day 21: ジェネリクスとユーティリティ型",
              link: "/lessons/day21/",
            },
            { text: "Day 22: TypeScript 応用", link: "/lessons/day22/" },
          ],
        },
        {
          text: "Phase 4: React の基礎",
          items: [
            { text: "Day 23: React の概要と JSX", link: "/lessons/day23/" },
            {
              text: "Day 24: コンポーネントと props",
              link: "/lessons/day24/",
            },
            {
              text: "Day 25: state とイベント処理",
              link: "/lessons/day25/",
            },
            {
              text: "Day 26: 条件分岐とリストレンダリング",
              link: "/lessons/day26/",
            },
            {
              text: "Day 27: useEffect とライフサイクル",
              link: "/lessons/day27/",
            },
            { text: "Day 28: フォームと Actions", link: "/lessons/day28/" },
            {
              text: "Day 29: useOptimistic と Transition",
              link: "/lessons/day29/",
            },
            {
              text: "Day 30: カスタム Hooks とコンポーネント設計",
              link: "/lessons/day30/",
            },
            {
              text: "Day 31: Context と状態管理パターン",
              link: "/lessons/day31/",
            },
            {
              text: "Day 32: React のレンダリング最適化",
              link: "/lessons/day32/",
            },
          ],
        },
        {
          text: "Phase 5: Next.js の基礎",
          items: [
            {
              text: "Day 33: SPA・CSR・SSR — レンダリング戦略",
              link: "/lessons/day33/",
            },
            {
              text: "Day 34: Next.js の概要とプロジェクト構成",
              link: "/lessons/day34/",
            },
            {
              text: "Day 35: Server Components と Client Components",
              link: "/lessons/day35/",
            },
            {
              text: "Day 36: レイアウトとページ",
              link: "/lessons/day36/",
            },
            {
              text: "Day 37: データ取得（Server Components）",
              link: "/lessons/day37/",
            },
            { text: "Day 38: Route Handlers", link: "/lessons/day38/" },
            { text: "Day 39: Server Actions", link: "/lessons/day39/" },
            {
              text: "Day 40: 動的ルーティングとミドルウェア",
              link: "/lessons/day40/",
            },
            { text: "Day 41: メタデータと SEO", link: "/lessons/day41/" },
            {
              text: "Day 42: 画像・フォント最適化",
              link: "/lessons/day42/",
            },
            { text: "Day 43: Tailwind CSS", link: "/lessons/day43/" },
          ],
        },
        {
          text: "Phase 6: 実践的なスキル",
          items: [
            {
              text: "Day 44: テスト基礎（Vitest）",
              link: "/lessons/day44/",
            },
            {
              text: "Day 45: コンポーネントテスト",
              link: "/lessons/day45/",
            },
            {
              text: "Day 46: アクセシビリティ実践",
              link: "/lessons/day46/",
            },
            {
              text: "Day 47: アクセシビリティとテスト",
              link: "/lessons/day47/",
            },
            {
              text: "Day 48: Web パフォーマンス基礎",
              link: "/lessons/day48/",
            },
            {
              text: "Day 49: Web パフォーマンス応用",
              link: "/lessons/day49/",
            },
            { text: "Day 50: 認証の基礎", link: "/lessons/day50/" },
            { text: "Day 51: Web セキュリティ", link: "/lessons/day51/" },
            {
              text: "Day 52: コンポーネント設計パターン",
              link: "/lessons/day52/",
            },
            {
              text: "Day 53: アーキテクチャ総まとめ",
              link: "/lessons/day53/",
            },
          ],
        },
        {
          text: "HTML LT 候補（レビュー用）",
          items: [
            { text: "01: セマンティック HTML", link: "/html-candidates/01/" },
            { text: "02: 見出しレベルの設計", link: "/html-candidates/02/" },
            { text: "03: a と button", link: "/html-candidates/03/" },
            { text: "04: フォーム", link: "/html-candidates/04/" },
            { text: "05: ネスティングルール", link: "/html-candidates/05/" },
            { text: "06: alt 属性", link: "/html-candidates/06/" },
            { text: "07: HTML の基本構造", link: "/html-candidates/07/" },
            { text: "08: head の中身", link: "/html-candidates/08/" },
            { text: "09: パースと DOM ツリー", link: "/html-candidates/09/" },
            { text: "10: テーブル", link: "/html-candidates/10/" },
            { text: "11: HTML だけで作れる UI", link: "/html-candidates/11/" },
            { text: "12: AI の HTML をレビュー", link: "/html-candidates/12/" },
            {
              text: "13: カスタムフォーム UI とアクセシビリティ",
              link: "/html-candidates/13/",
            },
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
  })
);
