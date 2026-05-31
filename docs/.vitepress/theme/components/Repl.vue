<template>
  <button
    v-show="!(isMobile && open)"
    class="repl-toggle"
    :aria-expanded="open"
    aria-controls="repl-panel"
    @click="open = !open"
  >
    {{ open ? "▼ REPL" : "▲ REPL" }}
  </button>
  <div
    v-show="open"
    id="repl-panel"
    class="repl-panel"
    :class="{
      'repl-panel--mobile': isMobile,
      'repl-panel--fullscreen': !isMobile && fullscreen,
      'repl-panel--code': isMobile && mobileView === 'code',
      'repl-panel--result': isMobile && mobileView === 'result',
    }"
    :style="
      !isMobile && !fullscreen ? { height: panelHeight + 'px' } : undefined
    "
    role="region"
    aria-label="コード実行パネル"
  >
    <div
      v-if="!isMobile && !fullscreen"
      class="repl-resizer"
      role="separator"
      aria-orientation="horizontal"
      @pointerdown="startResize"
    ></div>
    <div v-if="isMobile" class="repl-mobile-header">
      <div class="repl-views" role="tablist" aria-label="表示切り替え">
        <button
          role="tab"
          :aria-selected="mobileView === 'code'"
          :class="{ active: mobileView === 'code' }"
          @click="mobileView = 'code'"
        >
          コード
        </button>
        <button
          role="tab"
          :aria-selected="mobileView === 'result'"
          :class="{ active: mobileView === 'result' }"
          @click="mobileView = 'result'"
        >
          結果
        </button>
      </div>
      <button class="repl-close" aria-label="閉じる" @click="open = false">
        ✕
      </button>
    </div>
    <div class="repl-tabs">
      <button
        v-for="t in tabs"
        :key="t"
        :class="{ active: tab === t }"
        @click="tab = t"
      >
        {{ t }}
      </button>
      <div class="repl-tab-spacer"></div>
      <button
        class="repl-icon"
        aria-label="文字を小さく"
        title="文字を小さく"
        @click="setFontSize(fontSize - 1)"
      >
        A−
      </button>
      <button
        class="repl-icon"
        aria-label="文字を大きく"
        title="文字を大きく"
        @click="setFontSize(fontSize + 1)"
      >
        A+
      </button>
      <button
        class="repl-icon"
        :class="{ active: wrap }"
        :aria-pressed="wrap"
        aria-label="折り返し"
        title="折り返し"
        @click="wrap = !wrap"
      >
        ↵
      </button>
      <button
        v-if="!isMobile"
        class="repl-icon"
        :class="{ active: fullscreen }"
        :aria-pressed="fullscreen"
        :aria-label="fullscreen ? '通常表示に戻す' : '全画面表示'"
        :title="fullscreen ? '通常表示に戻す' : '全画面表示'"
        @click="fullscreen = !fullscreen"
      >
        ⛶
      </button>
      <button
        class="repl-icon"
        :aria-label="formatting ? '整形中' : '整形'"
        :title="formatting ? '整形中…' : '整形 (Prettier)'"
        :disabled="formatting"
        @click="format"
      >
        整形
      </button>
      <button class="repl-action repl-run" @click="run">
        {{ isMobile ? "▶ 実行" : "▶ 実行 (Ctrl+Enter)" }}
      </button>
      <button class="repl-action" @click="clear">クリア</button>
    </div>
    <div class="repl-body">
      <div
        ref="editorContainer"
        class="repl-editor"
        :style="!isMobile ? { flexGrow: editorRatio } : undefined"
      >
        <textarea
          v-show="!editorReady"
          v-model="code[tab]"
          class="repl-editor-fallback"
          spellcheck="false"
          :placeholder="placeholder"
          @keydown="onKeydown"
        ></textarea>
      </div>
      <div
        v-if="!isMobile"
        class="repl-body-resizer"
        role="separator"
        aria-orientation="vertical"
        aria-label="エディタとプレビューの幅を変更"
        @pointerdown="startBodyResize"
      ></div>
      <div
        class="repl-output"
        :style="!isMobile ? { flexGrow: 1 - editorRatio } : undefined"
      >
        <iframe
          ref="frame"
          class="repl-preview"
          :style="{ flexGrow: previewRatio }"
          sandbox="allow-scripts"
          title="プレビュー"
        ></iframe>
        <div
          class="repl-output-resizer"
          role="separator"
          aria-orientation="horizontal"
          aria-label="プレビューとコンソールの高さを変更"
          @pointerdown="startOutputResize"
        ></div>
        <div
          ref="consoleEl"
          class="repl-console"
          :style="{ flexGrow: 1 - previewRatio }"
          role="log"
          aria-label="コンソール出力"
        >
          <div
            v-for="(line, i) in logs"
            :key="i"
            class="repl-log"
            :class="`repl-log--${line.level}`"
          >
            {{ line.text }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  onMounted,
  onBeforeUnmount,
  watch,
  computed,
  nextTick,
} from "vue";
import { useData } from "vitepress";

const { isDark } = useData();

const STORAGE_KEY = "wft-repl-v1";
const tabs = ["HTML", "CSS", "JS", "TS"] as const;
type Tab = (typeof tabs)[number];

const open = ref(false);
const tab = ref<Tab>("JS");
const panelHeight = ref(380);
const previewRatio = ref(0.6);
const editorRatio = ref(0.5);
const fontSize = ref(13);
const wrap = ref(false);
const fullscreen = ref(false);
const isMobile = ref(false);
const mobileView = ref<"code" | "result">("code");
const editorReady = ref(false);
const code = reactive<Record<Tab, string>>({
  HTML: "",
  CSS: "",
  JS: "",
  TS: "",
});
const editorContainer = ref<HTMLElement | null>(null);
const frame = ref<HTMLIFrameElement | null>(null);
const consoleEl = ref<HTMLElement | null>(null);
const logs = ref<{ level: string; text: string }[]>([]);

watch(
  () => logs.value.length,
  () => {
    nextTick(() => {
      if (consoleEl.value) consoleEl.value.scrollTop = consoleEl.value.scrollHeight;
    });
  },
);

let mql: MediaQueryList | null = null;
function onMql(e: MediaQueryListEvent | MediaQueryList) {
  isMobile.value = e.matches;
}

const placeholder = computed(() => {
  switch (tab.value) {
    case "HTML":
      return "<h1>Hello</h1>";
    case "CSS":
      return "h1 { color: tomato; }";
    case "JS":
      return "console.log('hello')";
    case "TS":
      return "const greet = (name: string) => `hi, ${name}`;\nconsole.log(greet('world'))";
  }
  return "";
});

// --- CodeMirror lazy setup ---
const formatting = ref(false);

type CMRefs = {
  EditorView: any;
  view: any;
  langCompartment: any;
  wrapCompartment: any;
  fontCompartment: any;
  themeCompartment: any;
  lintCompartment: any;
  getLang: (t: Tab) => any;
  fontTheme: (size: number) => any;
  oneDark: any;
  buildLint: (t: Tab) => any;
};
let cm: CMRefs | null = null;
let updatingDoc = false;
let editorLoading = false;

type TsEnv = {
  languageService: any;
  updateFile: (name: string, text: string) => void;
  __ts: any;
};
let tsEnvPromise: Promise<TsEnv> | null = null;
function getTsEnv(): Promise<TsEnv> {
  if (tsEnvPromise) return tsEnvPromise;
  const p = (async () => {
    const ts = (await import("typescript")).default;
    const compilerOptions: any = {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      strict: true,
      allowJs: true,
      checkJs: false,
      noEmit: true,
      lib: ["esnext"],
    };
    const domStub = `/dom-stub.d.ts`;
    const domStubText = `
declare var console: { log(...args: any[]): void; error(...args: any[]): void; warn(...args: any[]): void; info(...args: any[]): void; dir(...args: any[]): void; table(...args: any[]): void; };
declare var setTimeout: (fn: (...args: any[]) => void, ms?: number) => number;
declare var setInterval: (fn: (...args: any[]) => void, ms?: number) => number;
declare var clearTimeout: (id: number) => void;
declare var clearInterval: (id: number) => void;
declare var alert: (msg?: any) => void;
declare var prompt: (msg?: string, defaultVal?: string) => string | null;
declare function fetch(url: string | URL, init?: any): Promise<Response>;
interface Response { ok: boolean; status: number; json(): Promise<any>; text(): Promise<string>; }
declare var document: any;
declare var window: any;
declare var globalThis: any;
`;
    const libNames = [
      "lib.es5.d.ts", "lib.es2015.d.ts", "lib.es2016.d.ts",
      "lib.es2017.d.ts", "lib.es2018.d.ts", "lib.es2019.d.ts",
      "lib.es2020.d.ts", "lib.es2021.d.ts", "lib.es2022.d.ts",
      "lib.es2023.d.ts", "lib.es2024.d.ts", "lib.esnext.d.ts",
      "lib.es2015.collection.d.ts", "lib.es2015.core.d.ts",
      "lib.es2015.generator.d.ts", "lib.es2015.iterable.d.ts",
      "lib.es2015.promise.d.ts", "lib.es2015.proxy.d.ts",
      "lib.es2015.reflect.d.ts", "lib.es2015.symbol.d.ts",
      "lib.es2015.symbol.wellknown.d.ts",
      "lib.es2017.object.d.ts", "lib.es2017.string.d.ts",
      "lib.es2018.asyncgenerator.d.ts", "lib.es2018.asynciterable.d.ts",
      "lib.es2018.promise.d.ts",
      "lib.es2019.array.d.ts", "lib.es2019.object.d.ts",
      "lib.es2019.string.d.ts", "lib.es2019.symbol.d.ts",
      "lib.es2020.bigint.d.ts", "lib.es2020.promise.d.ts",
      "lib.es2020.string.d.ts", "lib.es2020.symbol.wellknown.d.ts",
      "lib.es2021.promise.d.ts", "lib.es2021.string.d.ts",
      "lib.es2021.weakref.d.ts",
      "lib.es2022.array.d.ts", "lib.es2022.error.d.ts",
      "lib.es2022.object.d.ts", "lib.es2022.string.d.ts",
      "lib.es2023.array.d.ts", "lib.es2023.collection.d.ts",
      "lib.decorators.d.ts", "lib.decorators.legacy.d.ts",
    ];
    const cdnTsVersion = "5.9.3";
    const cdn = `https://cdn.jsdelivr.net/npm/typescript@${cdnTsVersion}/lib/`;
    const storage = typeof localStorage !== "undefined" ? localStorage : null;
    const cacheKey = `ts-lib-${cdnTsVersion}`;
    let libFiles: Record<string, string> = {};
    const cached = storage?.getItem(cacheKey);
    if (cached) {
      try { libFiles = JSON.parse(cached); } catch {}
    }
    if (!Object.keys(libFiles).length) {
      const results = await Promise.allSettled(
        libNames.map(async (name) => {
          const res = await fetch(cdn + name);
          if (!res.ok) return;
          libFiles["/" + name] = await res.text();
        }),
      );
      if (Object.keys(libFiles).length > 0) {
        try { storage?.setItem(cacheKey, JSON.stringify(libFiles)); } catch {}
      }
    }
    libFiles[domStub] = domStubText;
    const files: Record<string, { text: string; version: number }> = {
      [domStub]: { text: domStubText, version: 0 },
      "/repl.ts": { text: "", version: 0 },
      "/repl.js": { text: "", version: 0 },
    };
    const hasLibs = Object.keys(libFiles).length > 1;
    const opts = hasLibs ? compilerOptions : { ...compilerOptions, lib: undefined, noLib: true };
    const host: any = {
      getScriptFileNames: () => Object.keys(files),
      getScriptVersion: (name: string) => String(files[name]?.version ?? 0),
      getScriptSnapshot: (name: string) => {
        const f = files[name];
        if (f) return ts.ScriptSnapshot.fromString(f.text);
        if (libFiles[name]) return ts.ScriptSnapshot.fromString(libFiles[name]);
        return undefined;
      },
      getCurrentDirectory: () => "/",
      getCompilationSettings: () => opts,
      getDefaultLibFileName: () => hasLibs ? "/lib.es5.d.ts" : "",
      fileExists: (name: string) => name in files || name in libFiles,
      readFile: (name: string) => files[name]?.text ?? libFiles[name],
    };
    const languageService = ts.createLanguageService(host);
    return {
      languageService,
      updateFile: (name: string, text: string) => {
        if (files[name]) {
          files[name].text = text;
          files[name].version++;
        }
      },
      __ts: ts,
    };
  })();
  // 失敗時はキャッシュを破棄して次回再試行できるようにする
  p.catch(() => {
    if (tsEnvPromise === p) tsEnvPromise = null;
  });
  tsEnvPromise = p;
  return p;
}

async function formatCode(source: string, lang: Tab): Promise<string> {
  const prettier = await import("prettier/standalone");
  if (lang === "JS") {
    const [babel, estree] = await Promise.all([
      import("prettier/plugins/babel"),
      import("prettier/plugins/estree"),
    ]);
    return prettier.format(source, {
      parser: "babel",
      plugins: [babel as any, estree as any],
    });
  }
  if (lang === "TS") {
    const [typescriptPlugin, estree] = await Promise.all([
      import("prettier/plugins/typescript"),
      import("prettier/plugins/estree"),
    ]);
    return prettier.format(source, {
      parser: "typescript",
      plugins: [typescriptPlugin as any, estree as any],
    });
  }
  if (lang === "HTML") {
    const htmlPlugin = await import("prettier/plugins/html");
    return prettier.format(source, {
      parser: "html",
      plugins: [htmlPlugin as any],
    });
  }
  if (lang === "CSS") {
    const postcssPlugin = await import("prettier/plugins/postcss");
    return prettier.format(source, {
      parser: "css",
      plugins: [postcssPlugin as any],
    });
  }
  return source;
}

async function format() {
  if (formatting.value) return;
  const current = code[tab.value];
  if (!current.trim()) return;
  formatting.value = true;
  try {
    const formatted = await formatCode(current, tab.value);
    code[tab.value] = formatted.replace(/\n$/, "");
    if (cm) setCmDoc(code[tab.value]);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logs.value.push({ level: "error", text: "整形に失敗: " + msg });
    if (isMobile.value) mobileView.value = "result";
  } finally {
    formatting.value = false;
  }
}

async function ensureEditor() {
  if (cm || editorLoading || !editorContainer.value) return;
  editorLoading = true;
  try {
    const [
      { EditorView, basicSetup },
      { EditorState, Compartment },
      { keymap },
      { javascript },
      { html },
      cssMod,
      { oneDark },
      lintMod,
    ] = await Promise.all([
      import("codemirror"),
      import("@codemirror/state"),
      import("@codemirror/view"),
      import("@codemirror/lang-javascript"),
      import("@codemirror/lang-html"),
      import("@codemirror/lang-css"),
      import("@codemirror/theme-one-dark"),
      import("@codemirror/lint"),
    ]);
    const cssLang = (cssMod as any).css;
    const { linter, lintGutter } = lintMod as any;

    const getLang = (t: Tab) => {
      if (t === "HTML") return html();
      if (t === "CSS") return cssLang();
      if (t === "TS") return javascript({ typescript: true });
      return javascript();
    };
    const fontTheme = (size: number) =>
      EditorView.theme({
        "&": { fontSize: size + "px", backgroundColor: "transparent" },
        ".cm-scroller": {
          fontFamily:
            "var(--vp-font-family-mono, ui-monospace, SFMono-Regular, monospace)",
          lineHeight: "1.5",
        },
        ".cm-content": { padding: "8px 0", caretColor: "var(--vp-c-text-1)" },
        ".cm-gutters": {
          backgroundColor: "var(--vp-c-bg-soft)",
          color: "var(--vp-c-text-3)",
          border: "none",
        },
        ".cm-activeLine": { backgroundColor: "transparent" },
        ".cm-activeLineGutter": { backgroundColor: "var(--vp-c-bg-alt)" },
        ".cm-selectionBackground": {
          backgroundColor: "var(--vp-c-brand-soft) !important",
        },
        ".cm-lintRange-error": {
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='3'%3E%3Cpath d='m0 3 l2 -2 l1 0 l2 2 l1 0' stroke='%23d11' fill='none' stroke-width='.7'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat-x",
          backgroundPosition: "bottom",
          paddingBottom: "0.7px",
        },
        ".cm-lintRange-warning": {
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='3'%3E%3Cpath d='m0 3 l2 -2 l1 0 l2 2 l1 0' stroke='%23e90' fill='none' stroke-width='.7'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat-x",
          backgroundPosition: "bottom",
          paddingBottom: "0.7px",
        },
        ".cm-diagnostic-error": {
          borderLeft: "3px solid #d11",
          padding: "4px 8px",
          marginLeft: "0",
        },
        ".cm-diagnostic-warning": {
          borderLeft: "3px solid #e90",
          padding: "4px 8px",
          marginLeft: "0",
        },
      });

    const tsLinter = async (view: any) => {
      if (tab.value !== "JS" && tab.value !== "TS") return [];
      const text = view.state.doc.toString();
      if (!text.trim()) return [];
      try {
        const env = await getTsEnv();
        const isTS = tab.value === "TS";
        const fname = isTS ? "/repl.ts" : "/repl.js";
        env.updateFile(fname, text);
        const ls = env.languageService;
        const syntactic = ls.getSyntacticDiagnostics(fname);
        const semantic = ls.getSemanticDiagnostics(fname);
        const diags = [...syntactic, ...semantic];
        const ts = env.__ts;
        const results = diags
          .filter((d: any) => typeof d.start === "number")
          .map((d: any) => ({
            from: d.start,
            to: d.start + (d.length || 1),
            severity:
              d.category === ts.DiagnosticCategory.Error
                ? "error"
                : d.category === ts.DiagnosticCategory.Warning
                  ? "warning"
                  : "info",
            message: ts.flattenDiagnosticMessageText(d.messageText, "\n"),
          }));
        return results;
      } catch {
        return [];
      }
    };
    // tsLinter は tab.value を参照するので関数自体は使い回せるが、Compartment 経由で
    // reconfigure すると lint がリセットされて即時に再評価される。タブ切替時にそれを利用する。
    const buildLint = (_t: Tab) => linter(tsLinter, { delay: 500 });

    const langCompartment = new Compartment();
    const wrapCompartment = new Compartment();
    const fontCompartment = new Compartment();
    const themeCompartment = new Compartment();
    const lintCompartment = new Compartment();

    const state = EditorState.create({
      doc: code[tab.value],
      extensions: [
        basicSetup,
        lintGutter(),
        langCompartment.of(getLang(tab.value)),
        wrapCompartment.of(wrap.value ? EditorView.lineWrapping : []),
        fontCompartment.of(fontTheme(fontSize.value)),
        themeCompartment.of(isDark.value ? oneDark : []),
        lintCompartment.of(buildLint(tab.value)),
        keymap.of([
          {
            key: "Mod-Enter",
            run: () => {
              run();
              return true;
            },
          },
        ]),
        EditorView.updateListener.of((u: any) => {
          if (u.docChanged && !updatingDoc) {
            code[tab.value] = u.state.doc.toString();
          }
        }),
      ],
    });

    const view = new EditorView({ state, parent: editorContainer.value });
    // remove any stale CM instances left over from earlier mounts
    Array.from(editorContainer.value.querySelectorAll(".cm-editor")).forEach(
      (el) => {
        if (el !== view.dom) el.remove();
      },
    );
    cm = {
      EditorView,
      view,
      langCompartment,
      wrapCompartment,
      fontCompartment,
      themeCompartment,
      lintCompartment,
      getLang,
      fontTheme,
      oneDark,
      buildLint,
    };
    editorReady.value = true;
  } finally {
    editorLoading = false;
  }
}

function setCmDoc(text: string) {
  if (!cm) return;
  updatingDoc = true;
  cm.view.dispatch({
    changes: { from: 0, to: cm.view.state.doc.length, insert: text },
  });
  updatingDoc = false;
}

watch(tab, async (next) => {
  if (!cm) return;
  setCmDoc(code[next]);
  cm.view.dispatch({
    effects: [
      cm.langCompartment.reconfigure(cm.getLang(next)),
      cm.lintCompartment.reconfigure(cm.buildLint(next)),
    ],
  });
});

watch(wrap, (v) => {
  if (!cm) return;
  cm.view.dispatch({
    effects: cm.wrapCompartment.reconfigure(
      v ? cm.EditorView.lineWrapping : [],
    ),
  });
});

watch(fontSize, (v) => {
  if (!cm) return;
  cm.view.dispatch({
    effects: cm.fontCompartment.reconfigure(cm.fontTheme(v)),
  });
});

watch(isDark, (dark) => {
  if (!cm) return;
  cm.view.dispatch({
    effects: cm.themeCompartment.reconfigure(dark ? cm.oneDark : []),
  });
});

watch(open, async (v) => {
  if (v) {
    await nextTick();
    ensureEditor();
  }
});

function setFontSize(v: number) {
  fontSize.value = Math.max(11, Math.min(22, v));
}

onMounted(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.code && typeof parsed.code === "object") {
        for (const t of tabs) {
          if (typeof parsed.code[t] === "string") code[t] = parsed.code[t];
        }
      }
      open.value = isMobile.value ? false : !!parsed.open;
      if (Number.isFinite(parsed.panelHeight))
        panelHeight.value = parsed.panelHeight;
      if (Number.isFinite(parsed.previewRatio)) {
        previewRatio.value = Math.max(0.1, Math.min(0.9, parsed.previewRatio));
      }
      if (Number.isFinite(parsed.editorRatio)) {
        editorRatio.value = Math.max(0.15, Math.min(0.85, parsed.editorRatio));
      }
      if (Number.isFinite(parsed.fontSize)) {
        fontSize.value = Math.max(11, Math.min(22, parsed.fontSize));
      }
      if (typeof parsed.wrap === "boolean") wrap.value = parsed.wrap;
      if (typeof parsed.fullscreen === "boolean")
        fullscreen.value = parsed.fullscreen;
      if (parsed.tab && tabs.includes(parsed.tab)) tab.value = parsed.tab;
    }
  } catch {
    // ignore
  }
  window.addEventListener("message", onMessage);
  window.addEventListener("beforeunload", saveNow);
  mql = window.matchMedia("(max-width: 720px)");
  onMql(mql);
  mql.addEventListener("change", onMql);
  if (open.value) {
    nextTick(() => ensureEditor());
  }
});

onBeforeUnmount(() => {
  saveNow();
  window.removeEventListener("message", onMessage);
  window.removeEventListener("beforeunload", saveNow);
  mql?.removeEventListener("change", onMql);
  cm?.view.destroy();
  cm = null;
  editorLoading = false;
});

let saveTimer: ReturnType<typeof setTimeout> | null = null;
function saveNow() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        code: { ...code },
        open: open.value,
        panelHeight: panelHeight.value,
        previewRatio: previewRatio.value,
        editorRatio: editorRatio.value,
        fontSize: fontSize.value,
        wrap: wrap.value,
        fullscreen: fullscreen.value,
        tab: tab.value,
      }),
    );
  } catch {
    // ignore quota errors
  }
}
function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, 400);
}
watch(
  [
    code,
    open,
    panelHeight,
    previewRatio,
    editorRatio,
    fontSize,
    wrap,
    fullscreen,
    tab,
  ],
  scheduleSave,
  { deep: true },
);

function onMessage(e: MessageEvent) {
  if (!e.data || e.data.type !== "wft-repl-log") return;
  logs.value.push({ level: e.data.level, text: e.data.text });
  if (logs.value.length > 200) logs.value.splice(0, logs.value.length - 200);
}

async function transpileTS(src: string): Promise<string> {
  const { transform } = await import("sucrase");
  const hasJSX = /<[A-Z]|<[a-z]+[\s>]/.test(src) || src.includes("React");
  const hasImports = /\bimport\s/.test(src);
  const transforms: string[] = ["typescript"];
  if (hasJSX) transforms.push("jsx");
  if (hasImports) transforms.push("imports");
  return transform(src, {
    transforms: transforms as any,
    jsxRuntime: "automatic",
    production: true,
  }).code;
}

function escapeForStyle(s: string) {
  return s.replace(/<\/style/gi, "<\\/style");
}
function escapeForScript(s: string) {
  return s.replace(/<\/script/gi, "<\\/script");
}

async function run() {
  logs.value = [];
  let js = code.JS || "";
  if (code.TS.trim()) {
    try {
      js += "\n;" + (await transpileTS(code.TS));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      logs.value.push({ level: "error", text: "TS compile error: " + msg });
      return;
    }
  }
  const safeCss = escapeForStyle(code.CSS || "");
  const safeJs = escapeForScript(js);
  const targetOrigin = JSON.stringify(location.origin);
  const hasJSX = /<[A-Z]|<[a-z]+[\s>]/.test(code.TS) || /\bReact\b|\buseState\b|\bimport\b.*['"]react/.test(code.TS);
  // ソースから大文字始まりのコンポーネント名を抽出（最後に定義されたものを優先）
  const compNames: string[] = [];
  const compRe = /(?:function|const|class)\s+([A-Z]\w*)/g;
  let m: RegExpExecArray | null;
  while ((m = compRe.exec(code.TS))) compNames.push(m[1]);
  const renderCandidates = JSON.stringify([...compNames].reverse());
  const reactScripts = hasJSX
    ? `<script src="https://cdn.jsdelivr.net/npm/react@19/umd/react.production.min.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@19/umd/react-dom.production.min.js"><\/script>
<script>
var jsxRuntime = { jsx: function(t,p,k){return React.createElement(t,p)}, jsxs: function(t,p,k){return React.createElement(t,p)}, Fragment: React.Fragment };
<\/script>`
    : "";
  const autoRender = hasJSX
    ? `\ntry {
  var _default = (typeof exports !== 'undefined' && exports.default) ? exports.default : null;
  if (!_default) {
    var _names = ${renderCandidates};
    for (var i=0;i<_names.length;i++) { try { var _c = eval(_names[i]); if (typeof _c === 'function') { _default = _c; break; } } catch(e){} }
  }
  if (_default) {
    var _root = document.getElementById('root') || document.body.appendChild(document.createElement('div'));
    _root.id = 'root';
    ReactDOM.createRoot(_root).render(React.createElement(_default));
  }
} catch(e) { console.error(e.message); }`
    : "";
  const jsxImportShim = hasJSX
    ? `var _require = function(m) {
  if (m === 'react') return React;
  if (m === 'react-dom/client') return ReactDOM;
  if (m === 'react/jsx-runtime') return jsxRuntime;
  throw new Error('Module not found: ' + m);
};
var require = _require;
var exports = {};
var module = { exports: exports };
`
    : "";
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>${safeCss}</style>${reactScripts}</head>
<body>${code.HTML}
<script>
(function(){
  var TARGET = ${targetOrigin};
  function fmt(a){try{return typeof a==='string'?a:JSON.stringify(a,null,2)}catch{return String(a)}}
  function send(level, args){parent.postMessage({type:'wft-repl-log',level,text:args.map(fmt).join(' ')}, TARGET)}
  ['log','info','warn','error'].forEach(function(l){
    var orig=console[l].bind(console);
    console[l]=function(){send(l,[].slice.call(arguments));orig.apply(null,arguments)}
  });
  window.addEventListener('error',function(e){send('error',[e.message])});
  window.addEventListener('unhandledrejection',function(e){send('error',['Unhandled: '+(e.reason&&e.reason.message||e.reason)])});
})();
${jsxImportShim}${safeJs}${autoRender}
<\/script>
</body></html>`;
  if (frame.value) frame.value.srcdoc = html;
  if (isMobile.value) mobileView.value = "result";
}

function clear() {
  code.HTML = "";
  code.CSS = "";
  code.JS = "";
  code.TS = "";
  logs.value = [];
  if (frame.value) frame.value.srcdoc = "";
  if (cm) setCmDoc("");
}

function onKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    run();
  }
}

function startBodyResize(e: PointerEvent) {
  e.preventDefault();
  const resizer = e.currentTarget as HTMLElement;
  resizer.setPointerCapture(e.pointerId);
  const container = resizer.parentElement;
  if (!container) return;
  function move(ev: PointerEvent) {
    const rect = container!.getBoundingClientRect();
    const ratio = (ev.clientX - rect.left) / rect.width;
    editorRatio.value = Math.max(0.15, Math.min(0.85, ratio));
  }
  function up() {
    resizer.removeEventListener("pointermove", move);
    resizer.removeEventListener("pointerup", up);
  }
  resizer.addEventListener("pointermove", move);
  resizer.addEventListener("pointerup", up);
}

function startOutputResize(e: PointerEvent) {
  e.preventDefault();
  const resizer = e.currentTarget as HTMLElement;
  resizer.setPointerCapture(e.pointerId);
  const container = resizer.parentElement;
  if (!container) return;
  function move(ev: PointerEvent) {
    const rect = container!.getBoundingClientRect();
    const ratio = (ev.clientY - rect.top) / rect.height;
    previewRatio.value = Math.max(0.1, Math.min(0.9, ratio));
  }
  function up() {
    resizer.removeEventListener("pointermove", move);
    resizer.removeEventListener("pointerup", up);
  }
  resizer.addEventListener("pointermove", move);
  resizer.addEventListener("pointerup", up);
}

function startResize(e: PointerEvent) {
  e.preventDefault();
  const resizer = e.currentTarget as HTMLElement;
  resizer.setPointerCapture(e.pointerId);
  const startY = e.clientY;
  const startH = panelHeight.value;
  function move(ev: PointerEvent) {
    const next = startH + (startY - ev.clientY);
    panelHeight.value = Math.max(220, Math.min(window.innerHeight - 80, next));
  }
  function up() {
    resizer.removeEventListener("pointermove", move);
    resizer.removeEventListener("pointerup", up);
  }
  resizer.addEventListener("pointermove", move);
  resizer.addEventListener("pointerup", up);
}
</script>

<style scoped>
.repl-toggle {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 1000;
  padding: 8px 14px;
  background: var(--vp-c-brand-1, #064e3b);
  color: white;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
}
.repl-toggle:hover {
  filter: brightness(1.1);
}
.repl-panel {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border-top: 1px solid var(--vp-c-divider);
  display: flex;
  flex-direction: column;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.12);
}
.repl-panel--fullscreen,
.repl-panel--mobile {
  height: 100dvh !important;
  top: 0;
  border-top: none;
}
.repl-resizer {
  position: relative;
  height: 1px;
  cursor: ns-resize;
  background: var(--vp-c-divider);
  flex-shrink: 0;
  touch-action: none;
}
.repl-resizer::before {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: -4px;
  bottom: -4px;
}
.repl-resizer:hover {
  background: var(--vp-c-brand-1);
}
.repl-mobile-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}
.repl-views {
  display: flex;
  gap: 4px;
  flex: 1;
}
.repl-views button {
  flex: 1;
  padding: 10px 12px;
  background: transparent;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  color: var(--vp-c-text-2);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.repl-views button.active {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: white;
}
.repl-close {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--vp-c-text-1);
  font-size: 18px;
  cursor: pointer;
}
.repl-close:active {
  background: var(--vp-c-bg-alt);
}
.repl-tabs {
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  flex-shrink: 0;
  gap: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.repl-tabs button {
  padding: 8px 14px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 13px;
  color: var(--vp-c-text-2);
  border-bottom: 2px solid transparent;
}
.repl-tabs > button.active:not(.repl-icon) {
  color: var(--vp-c-brand-1);
  border-bottom-color: var(--vp-c-brand-1);
}
.repl-tab-spacer {
  flex: 1;
}
.repl-icon {
  font-size: 13px !important;
  padding: 8px 10px !important;
  min-width: 36px;
  color: var(--vp-c-text-2);
}
.repl-icon.active {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-alt);
}
.repl-tabs .repl-action {
  font-size: 12px;
}
.repl-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}
.repl-editor {
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
  display: flex;
  background: var(--vp-c-bg);
}
.repl-editor :deep(.cm-editor) {
  height: 100%;
  width: 100%;
  outline: none;
}
.repl-editor :deep(.cm-scroller) {
  font-family: var(--vp-font-family-mono, ui-monospace, monospace);
}
.repl-editor-fallback {
  flex: 1;
  border: none;
  resize: none;
  padding: 12px;
  font-family: var(
    --vp-font-family-mono,
    ui-monospace,
    SFMono-Regular,
    monospace
  );
  font-size: 13px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  outline: none;
  line-height: 1.5;
  tab-size: 2;
}
.repl-body-resizer {
  position: relative;
  width: 1px;
  cursor: ew-resize;
  background: var(--vp-c-divider);
  flex-shrink: 0;
  touch-action: none;
}
.repl-body-resizer::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: -4px;
  right: -4px;
}
.repl-body-resizer:hover {
  background: var(--vp-c-brand-1);
}
.repl-output {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.repl-preview {
  flex: 1 1 0;
  border: none;
  background: white;
  min-height: 0;
}
.repl-output-resizer {
  position: relative;
  height: 1px;
  cursor: ns-resize;
  background: var(--vp-c-divider);
  flex-shrink: 0;
  touch-action: none;
}
.repl-output-resizer::before {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: -4px;
  bottom: -4px;
}
.repl-output-resizer:hover {
  background: var(--vp-c-brand-1);
}
.repl-console {
  flex: 1 1 0;
  overflow: auto;
  padding: 8px 12px;
  font-family: var(--vp-font-family-mono, ui-monospace, monospace);
  font-size: 12px;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  min-height: 0;
}
.repl-log {
  white-space: pre-wrap;
  word-break: break-word;
  padding: 2px 0;
}
.repl-log--error {
  color: #dc2626;
}
.repl-log--warn {
  color: #d97706;
}

.repl-panel--code .repl-output,
.repl-panel--result .repl-tabs,
.repl-panel--result .repl-editor {
  display: none !important;
}

@media (max-width: 720px) {
  .repl-tabs button {
    padding: 12px 14px;
    font-size: 14px;
  }
  .repl-tabs .repl-action {
    font-size: 14px;
    padding: 12px 14px;
  }
  .repl-icon {
    min-width: 44px;
    padding: 12px 8px !important;
  }
  .repl-body {
    flex-direction: column;
  }
  .repl-output {
    flex: 1 1 0 !important;
  }
  .repl-output-resizer,
  .repl-resizer {
    height: 1px;
  }
  .repl-output-resizer::before,
  .repl-resizer::before {
    top: -8px;
    bottom: -8px;
  }
}
</style>
