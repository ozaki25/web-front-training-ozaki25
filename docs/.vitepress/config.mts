import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Web Front-end Training",
  description: "Web フロントエンド研修コンテンツ",
  lang: "ja",
  themeConfig: {
    nav: [{ text: "ホーム", link: "/" }],
    sidebar: {
      "/lessons/": [],
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
});
