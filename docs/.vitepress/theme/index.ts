import DefaultTheme from "vitepress/theme";
import TwoslashFloatingVue from "@shikijs/vitepress-twoslash/client";
import "@shikijs/vitepress-twoslash/style.css";
import { enhanceAppWithTabs } from "vitepress-plugin-tabs/client";
import { inject } from "@vercel/analytics";
import { injectSpeedInsights } from "@vercel/speed-insights";
import type { EnhanceAppContext } from "vitepress";
import "./custom.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }: EnhanceAppContext) {
    app.use(TwoslashFloatingVue);
    enhanceAppWithTabs(app);
    if (typeof window !== "undefined") {
      inject();
      injectSpeedInsights();
    }
  },
};
