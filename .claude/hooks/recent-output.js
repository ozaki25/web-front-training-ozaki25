#!/usr/bin/env node
// 直近の assistant 出力を、保存済みトランスクリプト(.jsonl)から取り出す。
// Claude Code (web) の長尺セッションで直近履歴が画面に描画されない問題の回避策。
// 記憶からの再生成ではなく、ディスクの実データを読むので一字一句そのまま。
//
// 使い方:
//   node .claude/hooks/recent-output.js                直近20件の索引（先頭のみ）
//   node .claude/hooks/recent-output.js --n 30         索引の件数を変える
//   node .claude/hooks/recent-output.js --last         最新1件の全文
//   node .claude/hooks/recent-output.js --match "冒頭の文言"  一致した出力の全文（安定した指定）
//   node .claude/hooks/recent-output.js --full 3       索引の3番の全文（新規発言が増えると番号はずれる）
//
// トランスクリプトは /root/.claude/projects/*/*.jsonl の中で最終更新が最新のものを自動選択する。

const fs = require("fs");
const path = require("path");
const readline = require("readline");

function findTranscript() {
  const root = "/root/.claude/projects";
  if (!fs.existsSync(root)) return null;
  let newest = null;
  for (const slug of fs.readdirSync(root)) {
    const d = path.join(root, slug);
    let st;
    try { st = fs.statSync(d); } catch { continue; }
    if (!st.isDirectory()) continue;
    for (const name of fs.readdirSync(d)) {
      if (!name.endsWith(".jsonl")) continue;
      const p = path.join(d, name);
      const m = fs.statSync(p).mtimeMs;
      if (!newest || m > newest.m) newest = { p, m };
    }
  }
  return newest && newest.p;
}

async function collect(file) {
  const rl = readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity });
  const out = [];
  for await (const line of rl) {
    if (!line.trim()) continue;
    let o;
    try { o = JSON.parse(line); } catch { continue; }
    const m = o.message || o;
    if (!(o.type === "assistant" || m.role === "assistant") || !m.content) continue;
    const text = Array.isArray(m.content)
      ? m.content.filter((c) => c && c.type === "text").map((c) => c.text).join("")
      : (typeof m.content === "string" ? m.content : "");
    if (text.trim()) out.push({ ts: o.timestamp || "", text });
  }
  return out;
}

(async () => {
  const args = process.argv.slice(2);
  const get = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : null; };

  const file = findTranscript();
  if (!file) { console.error("トランスクリプトが見つかりません"); process.exit(1); }
  const all = await collect(file);
  if (!all.length) { console.error("assistant 出力が見つかりません"); process.exit(1); }

  if (args.includes("--last")) { console.log(all[all.length - 1].text); return; }

  const match = get("--match");
  if (match) {
    // 冒頭一致を優先（引用で同じ文言を含む後発の発言を誤って拾わないため）。
    // 冒頭一致が無ければ部分一致にフォールバック。いずれも一致の最新を返す。
    let hits = all.filter((a) => a.text.startsWith(match));
    if (!hits.length) hits = all.filter((a) => a.text.includes(match));
    if (!hits.length) { console.error("一致なし: " + match); process.exit(1); }
    console.log(hits[hits.length - 1].text);
    return;
  }

  const n = parseInt(get("--n") || "20", 10);
  const window = all.slice(-n);

  const full = get("--full");
  if (full) {
    const idx = parseInt(full, 10) - 1;
    if (idx < 0 || idx >= window.length) { console.error("範囲外（1〜" + window.length + "）"); process.exit(1); }
    console.log(window[idx].text);
    return;
  }

  // 索引（先頭のみ）
  window.forEach((a, i) => {
    const head = a.text.replace(/\s+/g, " ").slice(0, 60);
    console.log(`[${i + 1}] ${a.ts}  (${a.text.length}字)  ${head}`);
  });
})();
