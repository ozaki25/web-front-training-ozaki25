# Day 18: 型の応用

## 今日のゴール

- ユニオン型とリテラル型で「取りうる値」を制限できるようになる
- 型エイリアスと interface でオブジェクトの型を定義できるようになる
- Optional と Readonly の使い方を覚える

## ユニオン型

Day 17 では1つの型だけを指定しました。しかし、実際の開発では「文字列または数値」のように複数の型を受け付けたい場面があります。

ユニオン型（union type）は `|`（パイプ）で型をつなぎます。

```typescript
// string または number を受け付ける
let id: string | number;

id = "abc";  // OK
id = 123;    // OK
id = true;   // エラー！ boolean は代入できません
```

関数の引数にも使えます。

```typescript
function printId(id: string | number): void {
  console.log(`ID: ${id}`);
}

printId("abc"); // OK
printId(123);   // OK
```

ユニオン型の値を使うときは注意が必要です。

```typescript
function printId(id: string | number): void {
  // id は string かもしれないし number かもしれない
  console.log(id.toUpperCase()); // エラー！ number には toUpperCase がない
}
```

`string` 固有のメソッドを使いたい場合は、`typeof` で型を確認します（これを**型の絞り込み**と呼びます。Day 20 で詳しく学びます）。

```typescript
function printId(id: string | number): void {
  if (typeof id === "string") {
    // このブロック内では id は string として扱われる
    console.log(id.toUpperCase());
  } else {
    // このブロック内では id は number として扱われる
    console.log(id.toFixed(2));
  }
}
```

## リテラル型

リテラル型は、特定の値だけを許可する型です。

```typescript
// "admin" という文字列だけを受け付ける型
let role: "admin";
role = "admin"; // OK
role = "user";  // エラー！
```

単独ではあまり使いませんが、ユニオン型と組み合わせると強力です。

```typescript
type Status = "loading" | "success" | "error";

function showMessage(status: Status): string {
  switch (status) {
    case "loading":
      return "読み込み中...";
    case "success":
      return "完了しました！";
    case "error":
      return "エラーが発生しました";
  }
}

showMessage("loading"); // OK
showMessage("pending"); // エラー！ "pending" は Status に含まれない
```

これにより、「ありえない値」を型レベルで排除できます。JavaScript だけなら `showMessage("pending")` と書いてもエラーにならず、実行時に初めて不具合に気づきますが、TypeScript なら書いた瞬間にわかります。

## 型エイリアス（type）

Day 17 ではオブジェクトの型を直接書きました。

```typescript
const user: { name: string; age: number } = { name: "田中", age: 25 };
```

同じ型を何度も使うなら、`type` キーワードで名前を付けられます。これを型エイリアス（type alias）と呼びます。

```typescript
type User = {
  name: string;
  age: number;
};

const user: User = { name: "田中", age: 25 };
const admin: User = { name: "佐藤", age: 30 };
```

型エイリアスはオブジェクトだけでなく、あらゆる型に名前を付けられます。

```typescript
type ID = string | number;
type Status = "loading" | "success" | "error";
```

## interface

オブジェクトの型を定義するもう1つの方法が `interface` です。

```typescript
interface User {
  name: string;
  age: number;
}

const user: User = { name: "田中", age: 25 };
```

`type` と `interface` はオブジェクトの型定義においてほぼ同じことができます。

### type と interface の違い

| 特徴 | `type` | `interface` |
|------|--------|-------------|
| オブジェクト型の定義 | できる | できる |
| ユニオン型の定義 | できる | できない |
| 拡張 | `&`（交差型） | `extends` |
| 同名の宣言マージ | できない | できる |

```typescript
// interface は extends で拡張できる
interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}

const dog: Dog = { name: "ポチ", breed: "柴犬" };
```

```typescript
// type は & で型を組み合わせる（交差型）
type Animal = {
  name: string;
};

type Dog = Animal & {
  breed: string;
};

const dog: Dog = { name: "ポチ", breed: "柴犬" };
```

> **実務でのルール**: プロジェクトによって「オブジェクトは interface で定義する」「すべて type で統一する」などルールが異なります。配属先のルールに従いましょう。Next.js の公式ドキュメントでは両方が使われています。

## Optional プロパティ

プロパティ名の後ろに `?` を付けると、そのプロパティは省略可能になります。

```typescript
interface User {
  name: string;
  age: number;
  email?: string; // 省略可能
}

// email がなくても OK
const user1: User = { name: "田中", age: 25 };

// email があっても OK
const user2: User = { name: "佐藤", age: 30, email: "sato@example.com" };
```

Optional なプロパティの型は自動的に `string | undefined` になります。使うときは `undefined` かもしれないことを考慮する必要があります。

```typescript
function printEmail(user: User): void {
  // user.email は string | undefined なので直接使えない
  if (user.email) {
    console.log(user.email.toUpperCase()); // OK: この中では string
  } else {
    console.log("メールアドレス未登録");
  }
}
```

## Readonly

プロパティを変更不可にするには `readonly` を付けます。

```typescript
interface Config {
  readonly apiUrl: string;
  readonly maxRetries: number;
}

const config: Config = {
  apiUrl: "https://api.example.com",
  maxRetries: 3,
};

config.apiUrl = "https://other.com"; // エラー！ readonly なので変更できない
```

`Readonly` ユーティリティ型を使うと、すべてのプロパティを一括で `readonly` にできます。

```typescript
interface User {
  name: string;
  age: number;
}

const frozenUser: Readonly<User> = { name: "田中", age: 25 };
frozenUser.name = "佐藤"; // エラー！
```

> **ポイント**: `readonly` はコンパイル時のチェックです。JavaScript に変換された後は制約がなくなります。それでもコードの意図を明示し、チーム内での誤った変更を防ぐのに役立ちます。

## 型の組み合わせの実例

ここまで学んだ型を組み合わせて、実際の開発で見かけるような型を定義してみましょう。

```typescript
// API レスポンスを表す型
type ApiResponse =
  | { status: "loading" }
  | { status: "success"; data: User[] }
  | { status: "error"; message: string };

interface User {
  id: number;
  name: string;
  email?: string;
  role: "admin" | "editor" | "viewer";
}

// 使用例
function handleResponse(response: ApiResponse): void {
  switch (response.status) {
    case "loading":
      console.log("読み込み中...");
      break;
    case "success":
      console.log(`${response.data.length}件のユーザーを取得`);
      break;
    case "error":
      console.log(`エラー: ${response.message}`);
      break;
  }
}
```

この `ApiResponse` のように、`status` の値によって持つプロパティが変わるパターンを **discriminated union**（判別可能なユニオン）と呼びます。Day 20 で詳しく学びます。

## まとめ

- ユニオン型（`A | B`）で「いずれかの型」を表現できる
- リテラル型とユニオン型を組み合わせると、取りうる値を厳密に制限できる
- `type` と `interface` でオブジェクトの型に名前を付けられる
- `?` で省略可能なプロパティ、`readonly` で変更不可なプロパティを定義できる
- 型を組み合わせることで、実際のデータ構造を正確に表現できる
