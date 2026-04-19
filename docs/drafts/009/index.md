# オブジェクトと配列

## 今日のゴール

- オブジェクトと配列の基本を知る
- 配列メソッド（`map` / `filter` / `find` / `reduce`）の使い方を知る
- スプレッド構文と分割代入の仕組みを知る

## オブジェクト — 関連するデータをまとめる

**オブジェクト**は、複数の値を「名前（キー）」と「値（バリュー）」のペアでまとめるデータ構造です。

```javascript
const user = {
  name: "山田太郎",
  age: 25,
  isStudent: false,
};

console.log(user.name);     // "山田太郎"（ドット記法）
console.log(user["age"]);   // 25（ブラケット記法）
```

### プロパティの追加・更新

```javascript
const user = {
  name: "山田太郎",
  age: 25,
};

user.email = "yamada@example.com";  // 追加
user.age = 26;                       // 更新

console.log(user);
// { name: "山田太郎", age: 26, email: "yamada@example.com" }
```

> `const` で宣言していても、オブジェクトのプロパティは変更できます。`const` が禁止するのは変数への「再代入」であって、オブジェクトの中身の変更ではありません。

### メソッド — オブジェクトの中の関数

オブジェクトのプロパティとして関数を持たせることもできます。

```javascript
const calculator = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
};

console.log(calculator.add(5, 3));       // 8
console.log(calculator.subtract(10, 4)); // 6
```

## 配列 — 順序のあるデータの集合

**配列**は、複数の値を順序付きで格納するデータ構造です。

```javascript
const fruits = ["りんご", "みかん", "バナナ"];

console.log(fruits[0]);      // "りんご"（インデックスは 0 から始まる）
console.log(fruits[1]);      // "みかん"
console.log(fruits.length);  // 3（要素の数）
```

### 基本的な操作

```javascript
const fruits = ["りんご", "みかん"];

fruits.push("バナナ");        // 末尾に追加
console.log(fruits);          // ["りんご", "みかん", "バナナ"]

fruits.pop();                 // 末尾を削除
console.log(fruits);          // ["りんご", "みかん"]

console.log(fruits.includes("りんご"));  // true（含まれているか）
console.log(fruits.indexOf("みかん"));   // 1（何番目にあるか）
```

## 配列メソッド — データを変換・抽出する

ここからが重要です。React では配列のデータを画面に表示する場面が非常に多く、以下のメソッドは毎日のように使います。

### map — 各要素を変換して新しい配列を作る

```javascript
const numbers = [1, 2, 3, 4, 5];

const doubled = numbers.map((num) => num * 2);
console.log(doubled);  // [2, 4, 6, 8, 10]

// 元の配列は変わらない
console.log(numbers);  // [1, 2, 3, 4, 5]
```

`map` は各要素に対してコールバック関数を実行し、その戻り値を集めた**新しい配列**を返します。元の配列を変更しません。

実用例: ユーザーの名前だけを取り出す

```javascript
const users = [
  { name: "山田", age: 25 },
  { name: "佐藤", age: 30 },
  { name: "鈴木", age: 22 },
];

const names = users.map((user) => user.name);
console.log(names);  // ["山田", "佐藤", "鈴木"]
```

### filter — 条件に合う要素だけを抽出する

```javascript
const numbers = [1, 2, 3, 4, 5, 6, 7, 8];

const even = numbers.filter((num) => num % 2 === 0);
console.log(even);  // [2, 4, 6, 8]
```

コールバック関数が `true` を返した要素だけを集めた新しい配列を返します。

実用例: 成人のユーザーだけを抽出する

```javascript
const users = [
  { name: "山田", age: 25 },
  { name: "佐藤", age: 16 },
  { name: "鈴木", age: 30 },
];

const adults = users.filter((user) => user.age >= 18);
console.log(adults);
// [{ name: "山田", age: 25 }, { name: "鈴木", age: 30 }]
```

### find — 条件に合う最初の 1 つを取得する

```javascript
const users = [
  { id: 1, name: "山田" },
  { id: 2, name: "佐藤" },
  { id: 3, name: "鈴木" },
];

const user = users.find((u) => u.id === 2);
console.log(user);  // { id: 2, name: "佐藤" }
```

`filter` が条件に合う「すべて」を配列で返すのに対し、`find` は条件に合う「最初の 1 つ」をそのまま返します。見つからなければ `undefined` が返ります。

### reduce — 配列を 1 つの値にまとめる

```javascript
const numbers = [1, 2, 3, 4, 5];

const sum = numbers.reduce((accumulator, current) => {
  return accumulator + current;
}, 0);

console.log(sum);  // 15
```

- `accumulator` — 累積された値（前回の戻り値）
- `current` — 現在処理している要素
- `0` — accumulator の初期値

処理の流れ:

```
初期値: 0
1回目: 0 + 1 = 1
2回目: 1 + 2 = 3
3回目: 3 + 3 = 6
4回目: 6 + 4 = 10
5回目: 10 + 5 = 15
```

`reduce` は強力ですが複雑なので、合計や集計など「配列を 1 つの値にまとめる」場面で使います。

### メソッドチェーン

これらのメソッドは連結（チェーン）できます。

```javascript
const users = [
  { name: "山田", age: 25 },
  { name: "佐藤", age: 16 },
  { name: "鈴木", age: 30 },
  { name: "田中", age: 14 },
];

// 成人だけを抽出し、名前だけの配列に変換する
const adultNames = users
  .filter((user) => user.age >= 18)
  .map((user) => user.name);

console.log(adultNames);  // ["山田", "鈴木"]
```

## スプレッド構文 — 配列やオブジェクトを展開する

`...`（ドット 3 つ）で配列やオブジェクトの中身を展開できます。

### 配列のスプレッド

```javascript
const fruits = ["りんご", "みかん"];
const moreFruits = [...fruits, "バナナ", "ぶどう"];
console.log(moreFruits);  // ["りんご", "みかん", "バナナ", "ぶどう"]

// 配列のコピー
const copy = [...fruits];
```

### オブジェクトのスプレッド

```javascript
const user = { name: "山田", age: 25 };

// プロパティを追加した新しいオブジェクトを作る
const updatedUser = { ...user, email: "yamada@example.com" };
console.log(updatedUser);
// { name: "山田", age: 25, email: "yamada@example.com" }

// プロパティを上書きした新しいオブジェクトを作る
const olderUser = { ...user, age: 26 };
console.log(olderUser);  // { name: "山田", age: 26 }

// 元のオブジェクトは変わらない
console.log(user);  // { name: "山田", age: 25 }
```

スプレッド構文が重要な理由は、**元のデータを変更せずに新しいデータを作る**からです。React では「状態（state）を直接変更せず、新しい値を作って更新する」というルールがあり、スプレッド構文はその中心的なツールになります。

## 分割代入 — 値を個別の変数に取り出す

### オブジェクトの分割代入

```javascript
const user = { name: "山田", age: 25, email: "yamada@example.com" };

// 通常のアクセス
const name = user.name;
const age = user.age;

// 分割代入（同じことを簡潔に書ける）
const { name, age, email } = user;
console.log(name);   // "山田"
console.log(age);    // 25
console.log(email);  // "yamada@example.com"
```

### 配列の分割代入

```javascript
const colors = ["赤", "青", "緑"];

const [first, second, third] = colors;
console.log(first);   // "赤"
console.log(second);  // "青"
```

### 関数の引数での分割代入

分割代入なし:

```javascript
const greet = (user) => {
  return `${user.name}さん（${user.age}歳）`;
};

const user = { name: "山田", age: 25 };
console.log(greet(user));  // "山田さん（25歳）"
```

分割代入あり（引数で直接プロパティを取り出す）:

```javascript
const greetUser = ({ name, age }) => {
  return `${name}さん（${age}歳）`;
};

const user = { name: "山田", age: 25 };
console.log(greetUser(user));  // "山田さん（25歳）"
```

React のコンポーネントでは、props（コンポーネントに渡されるデータ）を分割代入で受け取るのが標準的な書き方です。

## まとめ

- オブジェクトはキーと値のペア。関連するデータをまとめる
- 配列は順序付きのデータの集合。インデックスは 0 から始まる
- `map` — 変換、`filter` — 抽出、`find` — 検索、`reduce` — 集約。React で毎日使う
- これらのメソッドは元の配列を変更せず、新しい配列を返す
- スプレッド構文（`...`）で配列やオブジェクトを展開し、元を変更せずに新しい値を作る
- 分割代入でオブジェクトや配列の値を個別の変数に簡潔に取り出せる
