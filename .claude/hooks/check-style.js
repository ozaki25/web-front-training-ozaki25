// レッスンの「型」の欠陥を機械検出する lint。
// CLAUDE.md の執筆方針のうち、機械で拾える再発しやすいものを対象にする:
//   1) まとめ / 今日のゴール の項目が複文（「。」で 2 文に割れている）
//   2) 見出し（# 行）に詩的・文学的な語（正体・裏側・世界 など）
//   3) 本文に全角記号 ＝ ＋（「A は B」「A に B を足す」と言葉で書く）
//   4) 足場フレーズ（「今日は〜見ていきます」「結論から言うと」など）
// 使い方: node .claude/hooks/check-style.js docs/drafts/107/index.md [...]
//         省略時は docs/drafts と docs/lessons の全 index.md を対象にする。
// 検出は「候補」。引用の格言・概念語など正当なものは人が判断して除外する。
const fs = require("fs");
const path = require("path");

const POETIC = ["正体", "裏側", "命を吹き込む", "鍵", "秘密", "魔法", "旅", "世界", "扉", "真実"];
const SCAFFOLD = ["結論から言うと", "まず全体像", "を見ていきます", "という地図", "大きく2つ", "大きく3つ"];

function collectTargets(args) {
  if (args.length) return args;
  const dirs = ["docs/drafts", "docs/lessons"];
  const out = [];
  for (const d of dirs) {
    if (!fs.existsSync(d)) continue;
    for (const name of fs.readdirSync(d)) {
      const f = path.join(d, name, "index.md");
      if (fs.existsSync(f)) out.push(f);
    }
  }
  return out.sort();
}

function scan(file) {
  const lines = fs.readFileSync(file, "utf8").split("\n");
  let inCode = false;
  let section = "";
  const hits = [];
  lines.forEach((line, i) => {
    const t = line.trim();
    if (t.startsWith("```")) { inCode = !inCode; return; }
    if (inCode) return;
    if (t.startsWith("## ")) section = t.replace(/^##\s*/, "");
    const noCode = line.replace(/`[^`]*`/g, "");

    if ((section.includes("ゴール") || section.includes("まとめ")) && t.startsWith("- ")) {
      const body = t.replace(/^- /, "");
      const dots = (body.match(/。/g) || []).length;
      const endsClean = body.endsWith("。") || body.endsWith("）") || body.endsWith(")");
      if (dots >= 2 || (dots === 1 && !endsClean)) {
        hits.push(`  [複文] ${i + 1}: ${body.slice(0, 60)}`);
      }
    }
    if (t.startsWith("#")) {
      for (const w of POETIC) if (t.includes(w)) hits.push(`  [詩的見出し:${w}] ${i + 1}: ${t.slice(0, 60)}`);
    }
    if (/[＝＋]/.test(noCode)) hits.push(`  [全角記号] ${i + 1}: ${t.slice(0, 60)}`);
    for (const s of SCAFFOLD) if (t.includes(s)) hits.push(`  [足場:${s}] ${i + 1}: ${t.slice(0, 60)}`);
  });
  return hits;
}

const targets = collectTargets(process.argv.slice(2));
let total = 0;
for (const f of targets) {
  const hits = scan(f);
  if (hits.length) {
    total += hits.length;
    console.log(f);
    console.log(hits.join("\n"));
  }
}
if (total) {
  console.log(`\n候補 ${total} 件（引用の格言・概念語・事実は人が判断して除外する）`);
  process.exit(1);
}
process.exit(0);
