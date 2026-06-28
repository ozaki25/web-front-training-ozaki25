// Markdown の ** が太字として描画されるかを実際にレンダリングして検査する。
// markdown-it は全角約物（（）「」など）に隣接した ** を強調として開閉しないため、
// 正規表現では取りこぼす崩れがある。レンダリング後に ** が残った行を報告する。
// 使い方: 対象 Markdown を標準入力に渡す。崩れがあれば該当行を出力し exit 1。
const MarkdownIt = require("markdown-it");
const md = new MarkdownIt();

let src = "";
process.stdin.on("data", (d) => (src += d));
process.stdin.on("end", () => {
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
      bad.push(`${i + 1}: ${t.slice(0, 80)}`);
    }
  });
  if (bad.length) {
    console.log(bad.join("\n"));
    process.exit(1);
  }
  process.exit(0);
});
