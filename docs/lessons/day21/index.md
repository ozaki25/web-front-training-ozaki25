# Day 21: ジェネリクスとユーティリティ型

## 今日のゴール

- ジェネリクスの基本と使いどころを知る
- 実用的なユーティリティ型（Partial, Required, Pick, Omit, Record）の使い方を知る

## ジェネリクスとは

Day 13 で学んだ配列メソッド `map` を振り返ります。`map` は配列の要素を変換する関数です。

```typescript
const numbers = [1, 2, 3];
const strings = numbers.map((n) => String(n)); // string[]
```

`numbers` は `number[]`、`strings` は `string[]` です。`map` は `number` の配列にも `string` の配列にも使えます。こういった「型に依存しない汎用的な処理」を実現するのがジェネリクス（generics）です。

## ジェネリクスの基本

ジェネリクスは「型を引数として受け取る仕組み」です。`<T>` のように山括弧で型パラメータを宣言します。

```typescript
// T は「何かの型」を表すプレースホルダー
function first<T>(items: T[]): T | undefined {
  return items[0];
}

// 使うときに T が具体的な型に置き換わる
const num = first([1, 2, 3]);       // T = number → number | undefined
const str = first(["a", "b", "c"]); // T = string → string | undefined
```

`first` 関数は「配列の最初の要素を返す」というロジックです。配列の要素が何型であっても同じロジックが使えるので、ジェネリクスで型を抽象化しています。

型パラメータ名は慣例として `T`（Type）、`U`、`V` や、`K`（Key）、`V`（Value）がよく使われます。

## ジェネリクスなしだとどうなるか

ジェネリクスを使わないで同じことをしようとすると、問題が起きます。

```typescript
// any を使う → 型安全でない
function firstAny(items: any[]): any {
  return items[0];
}

const value = firstAny([1, 2, 3]); // any 型 → 型チェックが効かない
value.toUpperCase(); // エラーにならない！（実行時にクラッシュ）
```

```typescript
// 型ごとに関数を作る → 冗長
function firstNumber(items: number[]): number | undefined {
  return items[0];
}
function firstString(items: string[]): string | undefined {
  return items[0];
}
```

ジェネリクスは「型安全かつ汎用的」を両立する仕組みです。

## 型パラメータに制約を付ける

型パラメータには `extends` で制約を付けられます。

```typescript
// T は { length: number } を持つ型に限定
function logLength<T extends { length: number }>(item: T): void {
  console.log(item.length);
}

logLength("hello");    // OK: string は length を持つ
logLength([1, 2, 3]);  // OK: 配列は length を持つ
logLength(123);        // エラー！ number は length を持たない
```

## ジェネリクスの実用例

実際の開発でよく見るパターンをいくつか紹介します。

### API レスポンスのラッパー

```typescript
// どんなデータでも包める汎用的な型
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

interface User {
  id: number;
  name: string;
}

interface Product {
  id: number;
  title: string;
  price: number;
}

// 使うときに T を指定
type UserResponse = ApiResponse<User>;
type ProductListResponse = ApiResponse<Product[]>;
```

### キーと値のペア

```typescript
function toEntries<K extends string, V>(
  obj: Record<K, V>
): [K, V][] {
  return Object.entries(obj) as [K, V][];
}
```

> **`as` について**: `as [K, V][]` は**型アサーション**と呼ばれる構文で、「この値はこの型である」と TypeScript に明示的に伝えます。`Object.entries` の戻り値は `[string, V][]` ですが、実際にはキーが `K` 型であるとわかっているので `as` で型を指定しています。型アサーションは型チェックをすり抜けるため、本当にその型であると確信がある場合にだけ使います。Day 22 で学ぶ narrowing（型の絞り込み）で安全に型を判別できる場合は、そちらを優先します。

> **ポイント**: ジェネリクスは「同じロジックを異なる型で使い回す」ときに使います。すべてをジェネリクスにする必要はありません。具体的な型で十分な場面では具体的な型を使います。

## ユーティリティ型

TypeScript には、既存の型を変換する便利な組み込み型が用意されています。これをユーティリティ型と呼びます。

### Partial\<T\> ― すべてのプロパティを省略可能に

```typescript
interface User {
  name: string;
  age: number;
  email: string;
}

// すべてのプロパティが省略可能になる
type PartialUser = Partial<User>;
// { name?: string; age?: number; email?: string; }

// ユーザー情報の部分更新に便利
function updateUser(id: number, changes: Partial<User>): void {
  // name だけ、age だけ、など部分的な更新を受け付ける
  console.log(`ユーザー ${id} を更新:`, changes);
}

updateUser(1, { name: "新しい名前" });       // OK
updateUser(1, { age: 26, email: "new@ex.com" }); // OK
```

### Required\<T\> ― すべてのプロパティを必須に

`Partial` の逆で、Optional なプロパティも必須にします。

```typescript
interface Config {
  apiUrl?: string;
  timeout?: number;
  retries?: number;
}

// すべてのプロパティが必須になる
type RequiredConfig = Required<Config>;
// { apiUrl: string; timeout: number; retries: number; }
```

### Pick\<T, K\> ― 特定のプロパティだけ抽出

```typescript
interface User {
  id: number;
  name: string;
  age: number;
  email: string;
}

// name と email だけ抽出
type UserContact = Pick<User, "name" | "email">;
// { name: string; email: string; }
```

### Omit\<T, K\> ― 特定のプロパティを除外

`Pick` の逆です。

```typescript
interface User {
  id: number;
  name: string;
  age: number;
  email: string;
}

// id を除外（新規作成時に id はまだない、という場面で便利）
type NewUser = Omit<User, "id">;
// { name: string; age: number; email: string; }
```

### Record\<K, V\> ― キーと値の型を指定したオブジェクト

```typescript
// string のキーに number の値を持つオブジェクト
type ScoreMap = Record<string, number>;

const scores: ScoreMap = {
  math: 90,
  english: 85,
  science: 92,
};
```

リテラル型と組み合わせると、キーを限定できます。

```typescript
type Subject = "math" | "english" | "science";
type ScoreMap = Record<Subject, number>;

const scores: ScoreMap = {
  math: 90,
  english: 85,
  science: 92,
  // history: 80, // エラー！ "history" は Subject に含まれない
};
```

## ユーティリティ型の組み合わせ

ユーティリティ型は組み合わせて使うこともできます。

```typescript
interface User {
  id: number;
  name: string;
  age: number;
  email: string;
}

// id 以外のプロパティを部分的に更新できる型
type UserUpdate = Partial<Omit<User, "id">>;
// { name?: string; age?: number; email?: string; }

function updateUser(id: number, changes: UserUpdate): void {
  console.log(`ユーザー ${id} を更新:`, changes);
}

updateUser(1, { name: "佐藤" }); // OK
```

## まとめ

- ジェネリクスは「型を引数として受け取る」仕組みで、型安全かつ汎用的なコードを書ける
- `extends` で型パラメータに制約を付けられる
- `Partial<T>` は全プロパティを省略可能に、`Required<T>` は全プロパティを必須にする
- `Pick<T, K>` で特定プロパティを抽出、`Omit<T, K>` で特定プロパティを除外
- `Record<K, V>` でキーと値の型を指定したオブジェクトを定義できる
- ユーティリティ型は組み合わせて使える

**次のレッスン**: [Day 22: TypeScript 応用](/lessons/day22/)
