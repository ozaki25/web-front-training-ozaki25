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
  })
);
