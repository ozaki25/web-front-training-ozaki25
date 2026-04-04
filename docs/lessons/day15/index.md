# Day 15: ES Modules

## 今日のゴール

- なぜモジュールが必要なのかを理解する
- `import` / `export` の書き方を知る
- モジュールスコープによる名前空間の分離を理解する
- デフォルトエクスポートと名前付きエクスポートの違いを知る

## なぜモジュールが必要なのか

Day 8 で CSS のグローバルスコープ問題を体感しました。JavaScript にも同様の問題があります。

### モジュールがなかった時代

以前の JavaScript では、複数のファイルを `<script>` タグで読み込むと、すべてが同じグローバルスコープを共有していました。

```html
<script src="utils.js"></script>
<script src="auth.js"></script>
<script src="app.js"></script>
```

**utils.js:**
```javascript
var formatDate = function (date) {
  return date.toLocaleDateString("ja-JP");
};
```

**auth.js:**
```javascript
// うっかり同じ名前の関数を定義してしまう
var formatDate = function (date) {
  return date.toISOString();
};
```

`utils.js` の `formatDate` が `auth.js` で上書きされてしまいます。ファイルを分けていてもグローバルスコープは 1 つなので、名前の衝突が起きるのです。

プロジェクトが大きくなるほど、この問題は深刻になります。「どの変数がどこで定義されているのか」が追えなくなり、1 つの変更が予期しない場所に影響するようになります。

## ES Modules — JavaScript の公式モジュールシステム

**ES Modules**（ESM）は、ES2015（ES6）で導入された JavaScript の公式なモジュールシステムです。ファイルごとに独立したスコープを持ち、明示的に `export` したものだけが外部から利用可能になります。

### 基本的な使い方

**math.js:**
```javascript
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;
export const multiply = (a, b) => a * b;
```

**app.js:**
```javascript
import { add, subtract } from "./math.js";

console.log(add(3, 5));       // 8
console.log(subtract(10, 4)); // 6
```

- `export` — この変数/関数を外部に公開する
- `import { ... } from "パス"` — 他のファイルから公開されたものを取り込む

### HTML での使い方

ES Modules を使うには、`<script>` タグに `type="module"` を指定します。

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ES Modules の練習</title>
  </head>
  <body>
    <h1>ES Modules</h1>
    <p id="result"></p>

    <script type="module">
      import { add } from "./math.js";

      document.querySelector("#result").textContent = `3 + 5 = ${add(3, 5)}`;
    </script>
  </body>
</html>
```

> **注意**: ES Modules はファイルプロトコル（`file://`）では動作しません。ローカルで試すにはサーバーが必要です。VS Code の Live Server 拡張機能や、`npx serve` コマンドで簡易サーバーを立てて確認してください。

## モジュールスコープ

ES Modules の各ファイルは独立したスコープを持ちます。`export` していない変数は外部からアクセスできません。

**utils.js:**
```javascript
// この変数はモジュール内部だけで使われる（外から見えない）
const SECRET_KEY = "abc123";

// この関数だけを公開する
export const encrypt = (text) => {
  // SECRET_KEY を使った処理...
  return `encrypted: ${text}`;
};
```

**app.js:**
```javascript
import { encrypt } from "./utils.js";

console.log(encrypt("hello"));  // ✅ "encrypted: hello"
console.log(SECRET_KEY);         // ❌ エラー: SECRET_KEY は定義されていない
```

これがモジュールスコープです。公開する範囲を自分で制御できるので、名前の衝突を心配する必要がなくなります。

## 名前付きエクスポートとデフォルトエクスポート

### 名前付きエクスポート（Named Export）

1 つのファイルから複数の値をエクスポートできます。

```javascript
// エクスポート側
export const PI = 3.14159;
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;

// インポート側 — 名前を指定して取り込む
import { PI, add } from "./math.js";
```

### デフォルトエクスポート（Default Export）

1 つのファイルに 1 つだけ、デフォルトのエクスポートを設定できます。

```javascript
// エクスポート側
const Calculator = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
};

export default Calculator;

// インポート側 — 任意の名前で取り込める（{} 不要）
import Calculator from "./calculator.js";
import Calc from "./calculator.js";  // 別の名前でもOK
```

### 使い分けの目安

| 種類 | 使う場面 | 例 |
|------|---------|-----|
| 名前付きエクスポート | ユーティリティ関数、定数など、複数の値を公開したい | `export const formatDate = ...` |
| デフォルトエクスポート | ファイルの主役となる 1 つの値 | `export default function App() { ... }` |

React のコンポーネントファイルでは、コンポーネント本体をデフォルトエクスポート、型定義やユーティリティ関数を名前付きエクスポートにするパターンがよく見られます。

## 名前の変更（エイリアス）

インポート時に名前を変えることもできます。

```javascript
import { add as sum, subtract as minus } from "./math.js";

console.log(sum(3, 5));    // 8
console.log(minus(10, 4)); // 6
```

異なるモジュールから同じ名前のものをインポートするとき、エイリアスで衝突を避けられます。

## まとめてインポート

```javascript
import * as math from "./math.js";

console.log(math.add(3, 5));
console.log(math.subtract(10, 4));
console.log(math.PI);
```

`* as 名前` ですべてのエクスポートをオブジェクトとしてまとめて受け取れます。

## モジュールがもたらすメリット

1. **名前空間の分離**: 各ファイルが独立したスコープを持つので、名前の衝突が起きない
2. **依存関係の明示**: `import` を見ればそのファイルが何に依存しているかがわかる
3. **再利用性**: `export` した関数は、別のプロジェクトからもインポートできる
4. **ツールとの連携**: バンドラー（Webpack、Vite など）がモジュールの依存関係を解析し、最適化（使われていないコードの削除など）を行える

Next.js のプロジェクトでは、すべてのファイルが ES Modules として扱われます。`import` / `export` は毎日書くことになるので、この書き方に慣れておきましょう。

## まとめ

- モジュールがない時代は、すべての JavaScript がグローバルスコープを共有し、名前の衝突が問題だった
- ES Modules はファイルごとに独立したスコープを持つ
- `export` で公開、`import` で取り込む
- 名前付きエクスポート（`export const ...`）は複数の値を、デフォルトエクスポート（`export default ...`）は 1 つの主要な値を公開する
- モジュールにより、名前空間の分離・依存関係の明示・ツールによる最適化が可能になる
- Next.js ではすべてのファイルが ES Modules。`import` / `export` は毎日使う
