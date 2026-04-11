# Day 17: TypeScript の基本

## 今日のゴール

- TypeScript がなぜ必要かを知る
- 型注釈の書き方を知る
- プリミティブ型、配列、オブジェクトの型の使い方を知る
- 型推論の仕組みを知る

## なぜ型が必要なのか

Day 9〜16 で JavaScript を学びました。JavaScript は自由度が高い言語ですが、その自由さがバグの原因になることがあります。

```javascript
function greet(name) {
  return "こんにちは、" + name + "さん！";
}

// 意図しない使い方をしてもエラーにならない
greet(42);        // "こんにちは、42さん！"
greet(undefined); // "こんにちは、undefinedさん！"
```

`greet` は名前（文字列）を受け取る関数ですが、数値や `undefined` を渡してもエラーになりません。実行して初めて「あれ、おかしい」と気づきます。

TypeScript（タイプスクリプト）は、JavaScript に**型（type）**の仕組みを追加した言語です。「この変数には文字列しか入らない」「この関数は数値を返す」といったルールをコードに書くことで、実行する前にミスを見つけられます。

```typescript
function greet(name: string): string {
  return "こんにちは、" + name + "さん！";
}

greet(42); // エラー！ number は string に代入できません
```

このエラーは、コードを実行する前（エディタ上やビルド時）に表示されます。これが TypeScript の最大のメリットです。

## TypeScript の仕組み

TypeScript のコードはそのままブラウザでは動きません。TypeScript のコンパイラ（tsc）が `.ts` ファイルを `.js` ファイルに変換（トランスパイル）します。

```
greeting.ts → TypeScript コンパイラ → greeting.js
```

この変換の過程で型のチェックが行われます。型に問題があればエラーを報告し、問題がなければ型の情報を取り除いた JavaScript を出力します。つまり、型は開発時の安全ネットであり、実行時には存在しません。

> **ポイント**: Next.js のプロジェクトでは TypeScript のセットアップが最初から組み込まれているので、自分で設定する必要はほとんどありません。

## 型注釈の基本

型注釈（type annotation）は、変数名の後ろに `: 型名` と書きます。

```typescript
const message: string = "こんにちは";
const count: number = 42;
const isActive: boolean = true;
```

## プリミティブ型

JavaScript のプリミティブ値に対応する型があります。

| 型 | 説明 | 例 |
|------|------|------|
| `string` | 文字列 | `"hello"`, `'world'` |
| `number` | 数値（整数・小数の区別なし） | `42`, `3.14` |
| `boolean` | 真偽値 | `true`, `false` |
| `null` | null | `null` |
| `undefined` | undefined | `undefined` |

```typescript
const userName: string = "田中";
const age: number = 25;
const isStudent: boolean = false;
const nothing: null = null;
const notDefined: undefined = undefined;
```

> **注意**: `String`（大文字）と `string`（小文字）は別物です。TypeScript では小文字の `string` を使います。`String` はラッパーオブジェクトの型で、通常は使いません。

## 配列の型

配列の型は `型名[]` と書きます。

```typescript
const numbers: number[] = [1, 2, 3];
const names: string[] = ["田中", "佐藤", "鈴木"];
const flags: boolean[] = [true, false, true];
```

配列に宣言と異なる型の値を入れようとするとエラーになります。

```typescript
const numbers: number[] = [1, 2, 3];
numbers.push("四"); // エラー！ string は number に代入できません
```

Day 11 で学んだ配列メソッドも型安全に使えます。

```typescript
const prices: number[] = [100, 200, 300];

// map の結果も number[] と推論される
const doubled = prices.map((price) => price * 2);

// filter の結果も number[] と推論される
const expensive = prices.filter((price) => price > 150);
```

## オブジェクトの型

オブジェクトの型は、プロパティ名と型のペアで記述します。

```typescript
const user: { name: string; age: number } = {
  name: "田中",
  age: 25,
};
```

定義にないプロパティにアクセスしたり、型の異なる値を代入しようとするとエラーになります。

```typescript
user.email; // エラー！ プロパティ 'email' は存在しません
user.age = "二十五"; // エラー！ string は number に代入できません
```

## 関数の型

関数では、引数と戻り値に型注釈を付けます。

```typescript
function add(a: number, b: number): number {
  return a + b;
}

const result = add(1, 2); // result は number 型
```

アロー関数も同じです。

```typescript
const multiply = (a: number, b: number): number => {
  return a * b;
};
```

何も返さない関数の戻り値は `void` です。

```typescript
function log(message: string): void {
  console.log(message);
  // return 文がない = 何も返さない
}
```

## 型推論

ここまで毎回 `: 型名` を書いてきましたが、実は TypeScript は多くの場面で型を自動的に推論してくれます。

```typescript
// 型注釈なしでも、TypeScript は右辺の値から型を推論する
const message = "こんにちは"; // string と推論
const count = 42;             // number と推論
const isActive = true;        // boolean と推論

// 関数の戻り値も推論される
function add(a: number, b: number) {
  return a + b; // 戻り値は number と推論
}
```

型推論が働くので、すべてに型注釈を書く必要はありません。では、いつ書くべきでしょうか？

**型注釈を書くべき場面:**

- 関数の引数（推論できないため必須）
- 推論結果が意図と異なる場合
- コードの意図を明示したい場合

**省略してよい場面:**

- 変数の初期値から明らかな場合（`const x = 42`）
- 関数の戻り値が明白な場合

```typescript
// 引数には型注釈が必須（推論できない）
function greet(name: string) {
  // 戻り値は return 文から string と推論されるので省略可能
  return `こんにちは、${name}さん！`;
}

// 初期値から推論されるので型注釈は省略可能
const greeting = greet("田中");
```

> **ポイント**: 型推論に頼れる場面では頼り、必要な場面だけ型注釈を書く。これが TypeScript の自然な使い方です。冗長な型注釈は読みにくさの原因になります。

## any 型 ― 使わないことが大切

`any` は「なんでも OK」という型です。TypeScript の型チェックを完全に無効にします。

```typescript
let value: any = "hello";
value = 42;        // エラーなし
value = true;      // エラーなし
value.foo.bar.baz; // エラーなし（実行時にクラッシュする）
```

`any` を使うと TypeScript を使う意味がなくなります。「型がわからないから `any`」としたくなる場面では、後日学ぶユニオン型やジェネリクスで解決できることがほとんどです。

## まとめ

- TypeScript は JavaScript に型を追加した言語で、実行前にバグを見つけられる
- プリミティブ型（`string`, `number`, `boolean`, `null`, `undefined`）が基本
- 配列は `型名[]`、オブジェクトは `{ プロパティ名: 型 }` で型を書く
- 関数の引数には型注釈が必須、戻り値や変数は型推論に頼ってよい
- `any` は型チェックを無効にするので使わない

**次のレッスン**: [Day 18: 型の応用](/lessons/day18/)
