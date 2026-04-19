# 関数とスコープ

## 今日のゴール

- 関数の 3 つの書き方（関数宣言・関数式・アロー関数）を知る
- スコープ（変数の有効範囲）の仕組みを知る
- クロージャの基本的な概念を知る

## 関数とは

**関数**は、一連の処理をまとめて名前を付けたものです。同じ処理を何度も書く代わりに、関数として定義しておけば呼び出すだけで実行できます。

## 関数宣言

最も基本的な関数の定義方法です。

```javascript
function greet(name) {
  return `こんにちは、${name}さん！`;
}

const message = greet("山田");
console.log(message);  // "こんにちは、山田さん！"
```

- `function` キーワードで関数を定義
- `name` は**引数（ひきすう）** — 関数に渡すデータ
- `return` は**戻り値（もどりち）** — 関数が返すデータ

引数は複数取れます。

```javascript
function add(a, b) {
  return a + b;
}

console.log(add(3, 5));  // 8
```

### 引数のデフォルト値

```javascript
function greet(name = "ゲスト") {
  return `こんにちは、${name}さん！`;
}

console.log(greet("山田"));  // "こんにちは、山田さん！"
console.log(greet());        // "こんにちは、ゲストさん！"
```

引数が渡されなかった場合にデフォルト値が使われます。

## 関数式

関数を変数に代入する書き方です。

```javascript
const greet = function (name) {
  return `こんにちは、${name}さん！`;
};

console.log(greet("佐藤"));  // "こんにちは、佐藤さん！"
```

関数宣言との大きな違いは**巻き上げ**（hoisting）の挙動です。関数宣言は定義より前で呼び出せますが、関数式はできません。

```javascript
// 関数宣言 — 定義より前でも呼べる（巻き上げ）
console.log(hello());  // "Hello!"
function hello() {
  return "Hello!";
}

// 関数式 — 定義より前では呼べない
console.log(hi());  // ❌ エラー
const hi = function () {
  return "Hi!";
};
```

## アロー関数

ES2015（ES6）で追加された簡潔な書き方です。実務ではアロー関数が最も多く使われます。

```javascript
const greet = (name) => {
  return `こんにちは、${name}さん！`;
};
```

### 省略記法

**引数が 1 つなら `()` を省略できる:**

```javascript
const double = n => {
  return n * 2;
};
```

**処理が 1 行なら `{}` と `return` を省略できる:**

```javascript
const double = n => n * 2;

console.log(double(5));  // 10
```

**複数行の場合は `{}` と `return` が必要:**

```javascript
const describe = (name, age) => {
  const label = age >= 18 ? "成人" : "未成年";
  return `${name}さんは${label}です`;
};
```

### 3 つの書き方の比較

```javascript
// 関数宣言
function add1(a, b) {
  return a + b;
}

// 関数式
const add2 = function (a, b) {
  return a + b;
};

// アロー関数
const add3 = (a, b) => a + b;
```

どれも `add(3, 5)` で `8` が返ります。実務では**アロー関数が最もよく使われます**。特に、関数を引数として渡す場面（コールバック関数）で簡潔に書けるのが大きなメリットです。

## コールバック関数

関数を別の関数の引数として渡すことができます。これを**コールバック関数**と呼びます。

```javascript
const numbers = [1, 2, 3, 4, 5];

// forEach に関数を渡す
numbers.forEach((num) => {
  console.log(num * 2);
});
// 2, 4, 6, 8, 10
```

`forEach` は配列の各要素に対して渡された関数を実行します。ここでのアロー関数 `(num) => { ... }` がコールバック関数です。

Day 13 で学ぶ `map`、`filter` などの配列メソッドでも、コールバック関数を多用します。React でもイベント処理やデータ変換でコールバック関数は頻出なので、この考え方に慣れておきましょう。

## スコープ — 変数の有効範囲

**スコープ**とは、変数がアクセスできる範囲のことです。

### ブロックスコープ

`const` と `let` で宣言した変数は、`{}` の中でだけ有効です。

```javascript
if (true) {
  const message = "ブロックの中";
  console.log(message);  // ✅ "ブロックの中"
}

console.log(message);  // ❌ エラー: message is not defined
```

### 関数スコープ

関数の中で宣言した変数は、その関数の中でだけ有効です。

```javascript
function greet() {
  const name = "山田";
  console.log(name);  // ✅ "山田"
}

greet();
console.log(name);  // ❌ エラー: name is not defined
```

### グローバルスコープ

関数やブロックの外で宣言した変数は、どこからでもアクセスできます。

```javascript
const appName = "MyApp";  // グローバルスコープ

function showAppName() {
  console.log(appName);  // ✅ アクセスできる
}

showAppName();
```

> グローバル変数は便利ですが、どこからでも変更できてしまうため、大規模なプログラムではバグの原因になります。Day 10 で学んだ CSS のグローバルスコープ問題と同じ構図です。変数はできるだけ狭いスコープで宣言しましょう。

## スコープチェーン

内側のスコープから外側のスコープの変数にアクセスできます。

```javascript
const outer = "外側の変数";

function myFunction() {
  const inner = "内側の変数";
  console.log(outer);  // ✅ 外側の変数にアクセスできる
  console.log(inner);  // ✅ 自分のスコープの変数
}

myFunction();
console.log(inner);  // ❌ 内側の変数には外からアクセスできない
```

JavaScript は変数を探すとき、まず自分のスコープを見て、なければ 1 つ外のスコープ、その外……と**外側に向かって順に探していきます**。この仕組みをスコープチェーンと呼びます。

## クロージャ

スコープチェーンを利用した強力なパターンが**クロージャ**です。

```javascript
function createCounter() {
  let count = 0;  // この変数は createCounter の中に閉じ込められている

  return () => {
    count++;
    return count;
  };
}

const counter = createCounter();
console.log(counter());  // 1
console.log(counter());  // 2
console.log(counter());  // 3
```

`createCounter()` は関数を返します。返された関数は、`createCounter` の中の `count` 変数を「覚えて」います。

- `count` は `createCounter` の中でしかアクセスできない（外から直接変更できない）
- 返された関数だけが `count` を操作できる

これがクロージャです。**関数が、自分が定義されたスコープの変数を保持し続ける**仕組みです。

React の `useState` フック（後の Day で学びます）も、内部的にはクロージャの仕組みを使っています。今は「関数が外側の変数を覚えている」というイメージだけ掴んでおけば大丈夫です。

## まとめ

- 関数の書き方は 3 種類: 関数宣言、関数式、アロー関数。**実務ではアロー関数が主流**
- アロー関数は引数 1 つで `()` 省略可、1 行の処理で `{}` と `return` 省略可
- コールバック関数 = 関数を別の関数の引数として渡すパターン。React で頻出
- スコープは変数の有効範囲。`const` / `let` はブロックスコープ
- スコープチェーン: 内側から外側に向かって変数を探す
- クロージャ: 関数が定義時のスコープの変数を保持し続ける仕組み
