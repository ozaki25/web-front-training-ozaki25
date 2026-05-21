<template>
  <button
    class="repl-toggle"
    :aria-expanded="open"
    aria-controls="repl-panel"
    @click="open = !open"
  >
    {{ open ? '▼ REPL' : '▲ REPL' }}
  </button>
  <div
    v-show="open"
    id="repl-panel"
    class="repl-panel"
    :style="{ height: panelHeight + 'px' }"
    role="region"
    aria-label="コード実行パネル"
  >
    <div
      class="repl-resizer"
      role="separator"
      aria-orientation="horizontal"
      @pointerdown="startResize"
    ></div>
    <div class="repl-tabs">
      <button
        v-for="t in tabs"
        :key="t"
        :class="{ active: tab === t }"
        @click="tab = t"
      >
        {{ t }}
      </button>
      <button class="repl-action repl-run" @click="run">▶ 実行 (Ctrl+Enter)</button>
      <button class="repl-action" @click="clear">クリア</button>
    </div>
    <div class="repl-body">
      <textarea
        v-model="code[tab]"
        class="repl-editor"
        :style="{ flexGrow: editorRatio }"
        spellcheck="false"
        :placeholder="placeholder"
        @keydown="onKeydown"
      ></textarea>
      <div
        class="repl-body-resizer"
        role="separator"
        aria-orientation="vertical"
        aria-label="エディタとプレビューの幅を変更"
        @pointerdown="startBodyResize"
      ></div>
      <div class="repl-output" :style="{ flexGrow: 1 - editorRatio }">
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
          >{{ line.text }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, watch, computed } from "vue";

const STORAGE_KEY = "wft-repl-v1";
const tabs = ["HTML", "CSS", "JS", "TS"] as const;
type Tab = (typeof tabs)[number];

const open = ref(false);
const tab = ref<Tab>("JS");
const panelHeight = ref(380);
const previewRatio = ref(0.6);
const editorRatio = ref(0.5);
const outputEl = ref<HTMLElement | null>(null);
const code = reactive<Record<Tab, string>>({
  HTML: "",
  CSS: "",
  JS: "",
  TS: "",
});
const frame = ref<HTMLIFrameElement | null>(null);
const logs = ref<{ level: string; text: string }[]>([]);

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

onMounted(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(code, parsed.code || {});
      open.value = !!parsed.open;
      panelHeight.value = parsed.panelHeight || 380;
      if (typeof parsed.previewRatio === "number") {
        previewRatio.value = Math.max(0.1, Math.min(0.9, parsed.previewRatio));
      }
      if (typeof parsed.editorRatio === "number") {
        editorRatio.value = Math.max(0.15, Math.min(0.85, parsed.editorRatio));
      }
    }
  } catch {
    // ignore
  }
  window.addEventListener("message", onMessage);
});

onBeforeUnmount(() => {
  window.removeEventListener("message", onMessage);
});

watch(
  [code, open, panelHeight, previewRatio, editorRatio],
  () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          code: { ...code },
          open: open.value,
          panelHeight: panelHeight.value,
          previewRatio: previewRatio.value,
          editorRatio: editorRatio.value,
        }),
      );
    } catch {
      // ignore quota errors
    }
  },
  { deep: true },
);

function onMessage(e: MessageEvent) {
  if (!e.data || e.data.type !== "wft-repl-log") return;
  logs.value.push({ level: e.data.level, text: e.data.text });
  if (logs.value.length > 200) logs.value.splice(0, logs.value.length - 200);
}

async function transpileTS(src: string): Promise<string> {
  const { transform } = await import("sucrase");
  return transform(src, { transforms: ["typescript"] }).code;
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
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>${code.CSS}</style></head>
<body>${code.HTML}
<script>
(function(){
  function fmt(a){try{return typeof a==='string'?a:JSON.stringify(a,null,2)}catch{return String(a)}}
  function send(level, args){parent.postMessage({type:'wft-repl-log',level,text:args.map(fmt).join(' ')},'*')}
  ['log','info','warn','error'].forEach(function(l){
    var orig=console[l].bind(console);
    console[l]=function(){send(l,[].slice.call(arguments));orig.apply(null,arguments)}
  });
  window.addEventListener('error',function(e){send('error',[e.message])});
  window.addEventListener('unhandledrejection',function(e){send('error',['Unhandled: '+(e.reason&&e.reason.message||e.reason)])});
})();
try {
${js}
} catch (e) { console.error(e.message || String(e)) }
<\/script>
</body></html>`;
  if (frame.value) frame.value.srcdoc = html;
}

function clear() {
  code.HTML = "";
  code.CSS = "";
  code.JS = "";
  code.TS = "";
  logs.value = [];
  if (frame.value) frame.value.srcdoc = "";
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
  const container = resizer.parentElement;
  if (!container) return;
  function move(ev: PointerEvent) {
    const rect = container!.getBoundingClientRect();
    const ratio = (ev.clientX - rect.left) / rect.width;
    editorRatio.value = Math.max(0.15, Math.min(0.85, ratio));
  }
  function up() {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
  }
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
}

function startOutputResize(e: PointerEvent) {
  e.preventDefault();
  const resizer = e.currentTarget as HTMLElement;
  const container = resizer.parentElement;
  if (!container) return;
  function move(ev: PointerEvent) {
    const rect = container!.getBoundingClientRect();
    const ratio = (ev.clientY - rect.top) / rect.height;
    previewRatio.value = Math.max(0.1, Math.min(0.9, ratio));
  }
  function up() {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
  }
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
}

function startResize(e: PointerEvent) {
  e.preventDefault();
  const startY = e.clientY;
  const startH = panelHeight.value;
  function move(ev: PointerEvent) {
    const next = startH + (startY - ev.clientY);
    panelHeight.value = Math.max(220, Math.min(window.innerHeight - 80, next));
  }
  function up() {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
  }
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
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
.repl-resizer {
  position: relative;
  height: 1px;
  cursor: ns-resize;
  background: var(--vp-c-divider);
  flex-shrink: 0;
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
.repl-tabs {
  display: flex;
  align-items: stretch;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  flex-shrink: 0;
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
.repl-tabs button.active {
  color: var(--vp-c-brand-1);
  border-bottom-color: var(--vp-c-brand-1);
}
.repl-tabs .repl-action {
  font-size: 12px;
}
.repl-tabs .repl-run {
  margin-left: auto;
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
  border: none;
  resize: none;
  padding: 12px;
  font-family: var(--vp-font-family-mono, ui-monospace, SFMono-Regular, monospace);
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
@media (max-width: 720px) {
  .repl-body {
    flex-direction: column;
  }
  .repl-body-resizer {
    display: none;
  }
  .repl-editor,
  .repl-output {
    flex: 1 1 0 !important;
  }
}
</style>
