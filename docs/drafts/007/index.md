# JavaScript の基本文法

## 今日のゴール

- JavaScript の役割を知る
- 変数（`const` / `let`）の使い分けを知る
- 基本的なデータ型を知る
- 条件分岐（`if`）とループ（`for`）の書き方を知る

## JavaScript とは

Day 1〜8 で HTML（構造）と CSS（見た目）を学びました。ここからは 3 つ目の柱である **JavaScript**（ジャバスクリプト）を学んでいきます。

JavaScript は Web ページに**動き**を与える言語です。ボタンをクリックしたら何かが起こる、データを取得して表示する、入力内容をチェックする — こうしたインタラクティブな動作はすべて JavaScript の役割です。

> Java と JavaScript は名前が似ていますが、まったく別の言語です。歴史的な事情で似た名前になっただけで、関係はありません。

## JavaScript を書く場所

HTML ファイルに `<script>` タグを書いて、その中に JavaScript を記述します。

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>JavaScript の練習</title>
  </head>
  <body>
    <h1>JavaScript の練習</h1>
    <p id="output"></p>

    <script>
      document.getElementById("output").textContent = "JavaScript が動いています！";
    </script>
  </body>
</html>
```

ブラウザで開くと、段落に「JavaScript が動いています！」と表示されます。

`<script>` タグは `<body>` の末尾に置くのが一般的です。HTML の読み込みが終わってから JavaScript が実行されるようにするためです。

### console.log で確認する

開発中は `console.log()` を使ってブラウザの開発者ツール（DevTools）のコンソールに値を出力します。

```html
<script>
  console.log("こんにちは");
  console.log(1 + 2);
  console.log("これは" + "文字列の結合");
</script>
```

ブラウザで F12 キー（または右クリック →「検証」）で DevTools を開き、「Console」タブを見ると出力が確認できます。

## 変数 — 値に名前を付ける

**変数**は、値（データ）に名前を付けて保存しておく仕組みです。

### const — 再代入しない変数（基本はこちら）

```javascript
const name = "山田太郎";
const age = 25;
const isStudent = true;

console.log(name);  // "山田太郎"
console.log(age);   // 25
```

`const` で宣言した変数には、あとから別の値を入れ直す（再代入する）ことができません。

```javascript
const name = "山田太郎";
name = "佐藤花子";  // ❌ エラーになる
```

### let — 再代入する変数

値を後から変える必要がある場合は `let` を使います。

```javascript
let count = 0;
count = 1;      // ✅ 再代入できる
count = count + 1;
console.log(count);  // 2
```

### var は使わない

古い JavaScript には `var` という変数宣言もありますが、スコープ（有効範囲）の挙動が直感的でない問題があるため、現在は使いません。**`const` を基本にし、再代入が必要なときだけ `let` を使う**のがルールです。

## データ型

JavaScript の値にはいくつかの**型**（データの種類）があります。

```javascript
// 文字列（string）— ダブルクォートまたはシングルクォートで囲む
const greeting = "こんにちは";
const name = 'JavaScript';

// 数値（number）— 整数も小数もすべて number
const age = 25;
const price = 1980.5;

// 真偽値（boolean）— true（真）または false（偽）
const isLoggedIn = true;
const isEmpty = false;

// null — 「値がない」を意図的に表す
const data = null;

// undefined — まだ値が設定されていない
let result;
console.log(result);  // undefined
```

### テンプレートリテラル

バッククォート（`` ` ``）で囲むと、文字列の中に変数を埋め込めます。

```javascript
const name = "山田太郎";
const age = 25;

// 文字列結合（読みにくい）
console.log("私は" + name + "で、" + age + "歳です。");

// テンプレートリテラル（読みやすい）
console.log(`私は${name}で、${age}歳です。`);
```

`${}` の中に変数や式を書きます。実務ではテンプレートリテラルが主流です。

### typeof — 型を調べる

```javascript
console.log(typeof "hello");    // "string"
console.log(typeof 42);         // "number"
console.log(typeof true);       // "boolean"
console.log(typeof undefined);  // "undefined"
console.log(typeof null);       // "object" ← 歴史的なバグ。本当は null
```

## 演算子

### 算術演算子

```javascript
console.log(10 + 3);   // 13（加算）
console.log(10 - 3);   // 7（減算）
console.log(10 * 3);   // 30（乗算）
console.log(10 / 3);   // 3.333...（除算）
console.log(10 % 3);   // 1（余り）
```

### 比較演算子

```javascript
console.log(5 === 5);     // true（厳密等価）
console.log(5 === "5");   // false（型が違う）
console.log(5 !== 3);     // true（厳密不等価）
console.log(5 > 3);       // true
console.log(5 >= 5);      // true
console.log(5 < 3);       // false
```

> **`===`（厳密等価）と `==`（等価）の違い**: `==` は型変換を行ってから比較するため、`5 == "5"` が `true` になるなど予想外の結果を生みます。**常に `===` を使うのが基本です。**

### 論理演算子

```javascript
console.log(true && true);    // true（AND: 両方 true なら true）
console.log(true && false);   // false
console.log(true || false);   // true（OR: どちらか true なら true）
console.log(!true);           // false（NOT: 反転）
```

## 条件分岐

### if 文

```javascript
const age = 20;

if (age >= 18) {
  console.log("成人です");
} else {
  console.log("未成年です");
}
```

### else if で複数の条件

```javascript
const score = 75;

if (score >= 90) {
  console.log("優秀");
} else if (score >= 70) {
  console.log("良好");
} else if (score >= 50) {
  console.log("合格");
} else {
  console.log("不合格");
}
```

### 三項演算子

簡単な条件分岐は 1 行で書けます。

```javascript
const age = 20;
const label = age >= 18 ? "成人" : "未成年";
console.log(label);  // "成人"
```

`条件 ? trueの場合の値 : falseの場合の値` という書き方です。React で頻繁に使うパターンです。

## ループ

### for 文

```javascript
for (let i = 0; i < 5; i++) {
  console.log(`${i}回目のループ`);
}
// 0回目のループ
// 1回目のループ
// ...
// 4回目のループ
```

`for (初期化; 条件; 更新)` の 3 つの部分で構成されます。

- `let i = 0` — カウンター変数を 0 で初期化
- `i < 5` — この条件が true の間ループを続ける
- `i++` — 毎回のループ後に i を 1 増やす（`i = i + 1` と同じ）

### for...of 文

配列（Day 13 で詳しく学びます）の各要素を順に処理するときに使います。

```javascript
const fruits = ["りんご", "みかん", "バナナ"];

for (const fruit of fruits) {
  console.log(fruit);
}
// りんご
// みかん
// バナナ
```

`for...of` は配列の各要素を直接変数に入れてくれるので、インデックスを気にする必要がありません。

## まとめ

- JavaScript は Web ページに動きを与える言語
- 変数は `const`（基本）と `let`（再代入が必要な場合のみ）を使う。`var` は使わない
- データ型: 文字列（`string`）、数値（`number`）、真偽値（`boolean`）、`null`、`undefined`
- テンプレートリテラル（`` `${変数}` ``）で文字列に変数を埋め込める
- 比較は必ず `===`（厳密等価）を使う
- 条件分岐は `if` / `else if` / `else`。三項演算子は React で頻出
- ループは `for` と `for...of` を使い分ける
