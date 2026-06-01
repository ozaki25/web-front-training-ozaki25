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

const SidebarToggle = {
  setup() {
    const collapsed = ref(false);
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
    function toggle() {
      collapsed.value = !collapsed.value;
      document.documentElement.classList.toggle("sidebar-collapsed", collapsed.value);
      localStorage.setItem("sidebar-collapsed", String(collapsed.value));
    }
    return () =>
      hasSidebar.value
        ? h(
            "button",
            {
              class: "sidebar-toggle",
              onClick: toggle,
              title: collapsed.value ? "サイドバーを表示" : "サイドバーを非表示",
              "aria-label": collapsed.value
                ? "サイドバーを表示"
                : "サイドバーを非表示",
            },
            collapsed.value ? "☰" : "✕",
          )
        : null;
  },
};

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      "nav-bar-content-after": () => h(SidebarToggle),
      "layout-bottom": () => h(Repl),
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
