// レッスンの「型」の欠陥を機械検出する lint。
// CLAUDE.md の執筆方針のうち、機械で拾える再発しやすいものを対象にする:
//   1) まとめ / 今日のゴール の項目が複文（「。」で 2 文に割れている）
//   2) 見出し（# 行）に詩的・文学的な語（正体・裏側・世界 など）
//   3) 本文に全角記号 ＝ ＋（「A は B」「A に B を足す」と言葉で書く）
//   4) 足場フレーズ（「今日は〜見ていきます」「結論から言うと」など）
//   5) 短い見出し（## 以降）に読点「、」や全角丸括弧「（）」（中身を表す名詞句にする）
//   6) 「〜たら（結果）」「〜てはいけない（理由）」型の装飾的な括弧（文に溶かす）
// 使い方: node .claude/hooks/check-style.js docs/drafts/107/index.md [...]
//         省略時は docs/drafts と docs/lessons の全 index.md を対象にする。
// 検出は「候補」。引用の格言・概念語など正当なものは人が判断して除外する。
const fs = require("fs");
const path = require("path");

// 「鍵」「秘密」は技術用語（秘密鍵・公開鍵など）で正当に使うため、比喩の常套句「〜の鍵/〜の秘密」だけを検出する。
const POETIC = ["正体", "裏側", "命を吹き込む", "の鍵", "の秘密", "魔法", "旅", "世界", "扉", "真実"];
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
      // AI が付けがちな抽象・比喩の見出し（「〜を読む目」「〜という発想」「AI 時代」「思想」など）
      const AIFEEL = [/(読む|見る|決める|養う|磨く|見抜く)目/, /という発想/, /AI\s*時代/, /思想/, /本質/, /の世界/, /旅[へに]/];
      for (const re of AIFEEL) if (re.test(t)) hits.push(`  [AI感の見出し] ${i + 1}: ${t.slice(0, 60)}`);
      // 短い見出し（## 以降）に読点・全角丸括弧は不要。中身を表す名詞句にする（h1 タイトルの — 区切りは対象外）。
      if (/^#{2,}\s/.test(t) && /[、（）]/.test(t)) hits.push(`  [見出しに読点/括弧] ${i + 1}: ${t.slice(0, 60)}`);
    }
    if (/[＝＋]/.test(noCode)) hits.push(`  [全角記号] ${i + 1}: ${t.slice(0, 60)}`);
    for (const s of SCAFFOLD) if (t.includes(s)) hits.push(`  [足場:${s}] ${i + 1}: ${t.slice(0, 60)}`);
    // 装飾的な括弧の疑い: 「〜たら（結果）」「〜てはいけない（理由）」のように、
    // 条件・禁止の直後の括弧に結果・理由を詰め込む型（文に溶かすべき）。用語の短いグロスとは別物。
    if (/(たら|ては(いけない|ならない))（[^）]{4,}）/.test(noCode)) {
      hits.push(`  [装飾的な括弧の疑い] ${i + 1}: ${t.slice(0, 60)}`);
    }
    // 未観測の AI 出力を前提にした書き方の疑い（「AIに頼むと〜が出る/抜ける」「AIが書く/出す/偏る」）。
    // 指示（「AIに〜と指示できる」）は対象外。候補なので人が判断する。
    if (/AI\s*に[^。]{0,20}頼むと(?!き)[^。]{0,30}(出|書|生成|試|抜|作|なる)/.test(noCode) || /AI\s*(の|が|は)[^。]{0,40}(書いて|書く|生成|出てき|出します|抜け|抜か|偏|外す|網羅)/.test(noCode)) {
      hits.push(`  [AI出力前提の疑い] ${i + 1}: ${t.slice(0, 60)}`);
    }
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
