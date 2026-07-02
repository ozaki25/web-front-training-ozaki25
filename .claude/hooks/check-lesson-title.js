// 公開レッスンの h1 が `# Day <番号>: テーマ — サブタイトル` の形式かを検査する。
// publish-lesson のタイトル更新（Day 番号の付与）が抜けると、公開済みレッスンの
// 見出しが不揃いになる。手順の記憶に頼らず、機械チェックで必ず気づけるようにする。
// 使い方: node .claude/hooks/check-lesson-title.js <ファイル> <Day番号>
// 例:     node .claude/hooks/check-lesson-title.js docs/lessons/day32/index.md 32
// 形式どおりなら exit 0、崩れていれば理由を出力して exit 1。
const fs = require("fs");

const [, , file, dayArg] = process.argv;
if (!file || dayArg === undefined) {
  console.log("usage: node check-lesson-title.js <file> <dayNumber>");
  process.exit(2);
}

// "06" や "6" のどちらで渡されても整数に正規化する（h1 の慣習はゼロ埋めしない）。
const day = parseInt(dayArg, 10);
if (Number.isNaN(day)) {
  console.log(`Day 番号が数値ではありません: ${dayArg}`);
  process.exit(2);
}

let firstLine;
try {
  firstLine = fs.readFileSync(file, "utf8").split("\n")[0].trim();
} catch (e) {
  console.log(`ファイルを読めません: ${file}`);
  process.exit(2);
}

// 期待する形式: "# Day <day>: <非空のタイトル>"
const expected = new RegExp(`^# Day ${day}: \\S`);
if (!expected.test(firstLine)) {
  console.log(
    `h1 が期待する形式ではありません。\n` +
      `  期待: # Day ${day}: <テーマ名> — <サブタイトル>\n` +
      `  実際: ${firstLine || "(空)"}\n` +
      `publish-lesson のステップ 3（タイトルの更新）で Day 番号を付与してください。`
  );
  process.exit(1);
}
process.exit(0);
