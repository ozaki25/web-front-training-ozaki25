import { h, ref, onMounted, computed } from "vue";
import DefaultTheme from "vitepress/theme";
import TwoslashFloatingVue from "@shikijs/vitepress-twoslash/client";
import "@shikijs/vitepress-twoslash/style.css";
import { enhanceAppWithTabs } from "vitepress-plugin-tabs/client";
import { inject } from "@vercel/analytics";
import { injectSpeedInsights } from "@vercel/speed-insights";
import type { EnhanceAppContext, Theme } from "vitepress";
import { useData } from "vitepress";
import Repl from "./components/Repl.vue";
import "./custom.css";

const collapsed = ref(false);

const SidebarCollapseBtn = {
  setup() {
    return () =>
      h(
        "button",
        {
          class: "sidebar-collapse-btn",
          onClick: () => {
            collapsed.value = true;
            document.documentElement.classList.add("sidebar-collapsed");
            localStorage.setItem("sidebar-collapsed", "true");
          },
          title: "サイドバーを閉じる",
          "aria-label": "サイドバーを閉じる",
        },
        "«",
      );
  },
};

const SidebarExpandBtn = {
  setup() {
    const { page } = useData();
    const hasSidebar = computed(() => {
      const path = page.value.relativePath;
      return path.startsWith("lessons/") || path.startsWith("drafts/");
    });
    onMounted(() => {
      const saved = localStorage.getItem("sidebar-collapsed");
      if (saved === "true") {
        collapsed.value = true;
        document.documentElement.classList.add("sidebar-collapsed");
      }
    });
    return () =>
      hasSidebar.value && collapsed.value
        ? h(
            "button",
            {
              class: "sidebar-expand-btn",
              onClick: () => {
                collapsed.value = false;
                document.documentElement.classList.remove("sidebar-collapsed");
                localStorage.setItem("sidebar-collapsed", "false");
              },
              title: "サイドバーを開く",
              "aria-label": "サイドバーを開く",
            },
            "»",
          )
        : null;
  },
};

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      "sidebar-nav-before": () => h(SidebarCollapseBtn),
      "layout-bottom": () => [h(Repl), h(SidebarExpandBtn)],
    });
  },
  enhanceApp({ app }: EnhanceAppContext) {
    app.use(TwoslashFloatingVue);
    enhanceAppWithTabs(app);
    if (typeof window !== "undefined") {
      try {
        inject();
        injectSpeedInsights();
      } catch {
        // analytics の失敗でサイト全体を壊さない
      }
    }
  },
} satisfies Theme;
