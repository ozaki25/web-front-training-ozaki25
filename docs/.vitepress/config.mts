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
          text: "レッスン（公開済み / PR 確定）",
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
          ],
        },
        {
          text: "レッスン（未確定）",
          collapsed: true,
          items: [
            { text: "CSS の基本と適用方法", link: "/lessons/day06/" },
            {
              text: "CSS ボックスモデルとレイアウト",
              link: "/lessons/day07/",
            },
            { text: "Flexbox", link: "/lessons/day08/" },
            { text: "CSS Grid", link: "/lessons/day09/" },
            {
              text: "レスポンシブデザインと CSS の課題",
              link: "/lessons/day10/",
            },
            { text: "JavaScript の基本文法", link: "/lessons/day11/" },
            { text: "関数とスコープ", link: "/lessons/day12/" },
            { text: "オブジェクトと配列", link: "/lessons/day13/" },
            { text: "DOM 操作", link: "/lessons/day14/" },
            { text: "非同期処理", link: "/lessons/day15/" },
            {
              text: "HTTP とネットワーク基礎",
              link: "/lessons/day16/",
            },
            { text: "ES Modules", link: "/lessons/day17/" },
            {
              text: "エラーハンドリングとデバッグ",
              link: "/lessons/day18/",
            },
            { text: "TypeScript の基本", link: "/lessons/day19/" },
            { text: "型の応用", link: "/lessons/day20/" },
            {
              text: "ジェネリクスとユーティリティ型",
              link: "/lessons/day21/",
            },
            { text: "TypeScript 応用", link: "/lessons/day22/" },
            { text: "React の概要と JSX", link: "/lessons/day23/" },
            {
              text: "コンポーネントと props",
              link: "/lessons/day24/",
            },
            {
              text: "state とイベント処理",
              link: "/lessons/day25/",
            },
            {
              text: "条件分岐とリストレンダリング",
              link: "/lessons/day26/",
            },
            {
              text: "useEffect とライフサイクル",
              link: "/lessons/day27/",
            },
            { text: "フォームと Actions", link: "/lessons/day28/" },
            {
              text: "useOptimistic と Transition",
              link: "/lessons/day29/",
            },
            {
              text: "カスタム Hooks とコンポーネント設計",
              link: "/lessons/day30/",
            },
            {
              text: "Context と状態管理パターン",
              link: "/lessons/day31/",
            },
            {
              text: "React のレンダリング最適化",
              link: "/lessons/day32/",
            },
            {
              text: "SPA・CSR・SSR — レンダリング戦略",
              link: "/lessons/day33/",
            },
            {
              text: "Next.js の概要とプロジェクト構成",
              link: "/lessons/day34/",
            },
            {
              text: "Server Components と Client Components",
              link: "/lessons/day35/",
            },
            {
              text: "レイアウトとページ",
              link: "/lessons/day36/",
            },
            {
              text: "データ取得（Server Components）",
              link: "/lessons/day37/",
            },
            { text: "Route Handlers", link: "/lessons/day38/" },
            { text: "Server Actions", link: "/lessons/day39/" },
            {
              text: "動的ルーティングとミドルウェア",
              link: "/lessons/day40/",
            },
            { text: "メタデータと SEO", link: "/lessons/day41/" },
            {
              text: "画像・フォント最適化",
              link: "/lessons/day42/",
            },
            { text: "Tailwind CSS", link: "/lessons/day43/" },
            {
              text: "テスト基礎（Vitest）",
              link: "/lessons/day44/",
            },
            {
              text: "コンポーネントテスト",
              link: "/lessons/day45/",
            },
            {
              text: "アクセシビリティ実践",
              link: "/lessons/day46/",
            },
            {
              text: "アクセシビリティとテスト",
              link: "/lessons/day47/",
            },
            {
              text: "Web パフォーマンス基礎",
              link: "/lessons/day48/",
            },
            {
              text: "Web パフォーマンス応用",
              link: "/lessons/day49/",
            },
            { text: "認証の基礎", link: "/lessons/day50/" },
            { text: "Web セキュリティ", link: "/lessons/day51/" },
            {
              text: "コンポーネント設計パターン",
              link: "/lessons/day52/",
            },
            {
              text: "アーキテクチャ総まとめ",
              link: "/lessons/day53/",
            },
            { text: "01: セマンティック HTML → Day 2", link: "/html-candidates/01/" },
            { text: "02: 見出しレベルの設計（Day 2 と重複）", link: "/html-candidates/02/" },
            { text: "03: a と button（却下）", link: "/html-candidates/03/" },
            { text: "04: フォーム → Day 3", link: "/html-candidates/04/" },
            { text: "05: ネスティングルール（却下）", link: "/html-candidates/05/" },
            { text: "06: alt 属性 → Day 6 に統合", link: "/html-candidates/06/" },
            { text: "07: HTML の基本構造（Day 1 と重複）", link: "/html-candidates/07/" },
            { text: "08: head の中身（却下）", link: "/html-candidates/08/" },
            { text: "09: パースと DOM ツリー（却下）", link: "/html-candidates/09/" },
            { text: "10: テーブル（却下）", link: "/html-candidates/10/" },
            { text: "11: HTML だけで作れる UI → Day 5", link: "/html-candidates/11/" },
            { text: "12: AI の HTML をレビュー（却下）", link: "/html-candidates/12/" },
            {
              text: "13: カスタムフォーム UI → Day 4",
              link: "/html-candidates/13/",
            },
            {
              text: "14: img タグの書き方 → Day 6",
              link: "/html-candidates/14/",
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
