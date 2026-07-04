// Markdown の ** が太字として描画されるかを実際にレンダリングして検査する。
// markdown-it は全角約物（（）「」など）に隣接した ** を強調として開閉しないため、
// 正規表現では取りこぼす崩れがある。レンダリング後に ** が残った行を報告する。
// 使い方（どちらも可）:
//   cat docs/drafts/XXX/index.md | node .claude/hooks/check-bold.js
//   node .claude/hooks/check-bold.js docs/drafts/XXX/index.md [別のファイル...]
// 崩れがあれば該当行を出力し exit 1。
const MarkdownIt = require("markdown-it");
const md = new MarkdownIt();

function scan(src, prefix) {
  const lines = src.split("\n");
  let inCode = false;
  const bad = [];
  lines.forEach((line, i) => {
    const t = line.trim();
    if (t.startsWith("```")) {
      inCode = !inCode;
      return;
    }
    if (inCode || !line.includes("**")) return;
    if (md.renderInline(line).includes("**")) {
      bad.push(`${prefix}${i + 1}: ${t.slice(0, 80)}`);
    }
  });
  return bad;
}

function report(bad) {
  if (bad.length) {
    console.log(bad.join("\n"));
    process.exit(1);
  }
  process.exit(0);
}

const files = process.argv.slice(2);
if (files.length) {
  // ファイルパスを引数で渡した場合。標準入力待ちで無言通過する事故を防ぐ。
  const fs = require("fs");
  let bad = [];
  for (const f of files) {
    bad = bad.concat(scan(fs.readFileSync(f, "utf8"), files.length > 1 ? `${f}:` : ""));
  }
  report(bad);
} else {
  let src = "";
  process.stdin.on("data", (d) => (src += d));
  process.stdin.on("end", () => report(scan(src, "")));
}
