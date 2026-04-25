# ジェネリクスと型の絞り込み

## 今日のゴール

- `<T>` は「型の変数」であることを知る
- ユーティリティ型（Partial, Pick, Omit）で既存の型から新しい型を作れることを知る
- 型の絞り込み（narrowing）の仕組みを知る

## `<T>` は型の変数

AI が生成した TypeScript のコードを読んでいると、`<T>` や `<Props>` のような山括弧を見かけることがあります。

```typescript
function first<T>(items: T[]): T | undefined {
  return items[0];
}
```

この `T` は**型パラメータ**と呼ばれるもので、いわば「型の変数」です。普通の変数が値を入れる箱であるように、型パラメータは型を入れる箱です。関数を呼ぶときに、中に入る型が決まります。

```typescript
const num = first([1, 2, 3]);       // T = number → 戻り値は number | undefined
const str = first(["a", "b", "c"]); // T = string → 戻り値は string | undefined
```

TypeScript は引数から `T` に入る型を自動で推論します。`first([1, 2, 3])` なら配列の中身が `number` なので `T = number` です。

この仕組みを**ジェネリクス**（generics）と呼びます。「型に依存しない汎用的な処理」を型安全に書けるようにするための仕組みです。

### 実はもう見ている — `Array<string>` と `Promise<Response>`

ジェネリクスは特別な構文に見えますが、日常的に触れている型にもすでに使われています。

```typescript
const names: Array<string> = ["Alice", "Bob"];
const res: Promise<Response> = fetch("/api/data");
```

`Array<string>` は「`string` の配列」、`Promise<Response>` は「`Response` を返す Promise」です。`<>` の中に具体的な型を渡すことで、汎用的な型を特定の型に絞っています。

`string[]` という書き方は `Array<string>` の省略形です。どちらも同じ意味ですが、ジェネリクスの仕組みが見えやすいのは `Array<string>` の方です。

### ジェネリクスがないとどうなるか

ジェネリクスを使わずに同じことをしようとすると、2 つの選択肢があります。どちらにも問題があります。

```typescript
// 方法 1: any を使う → 型安全でなくなる
function firstAny(items: any[]): any {
  return items[0];
}
const value = firstAny([1, 2, 3]); // any 型 → 型チェックが効かない
value.toUpperCase(); // エラーにならない！（実行時にクラッシュ）
```

```typescript
// 方法 2: 型ごとに関数を作る → 冗長
function firstNumber(items: number[]): number | undefined {
  return items[0];
}
function firstString(items: string[]): string | undefined {
  return items[0];
}
// 型が増えるたびに同じ関数を量産する...
```

ジェネリクスは「型安全」と「汎用性」を両立する仕組みです。

## 自分でジェネリクスを作る

AI が書いたコードを読むだけでなく、ジェネリクスがどう作られるかを知っておくと理解が深まります。

### 型に制約を付ける

型パラメータには `extends` で制約を付けられます。「何でもよい」ではなく「この条件を満たす型だけ受け付ける」という指定です。

```typescript
function logLength<T extends { length: number }>(item: T): void {
  console.log(item.length);
}

logLength("hello");    // OK: string は length を持つ
logLength([1, 2, 3]);  // OK: 配列は length を持つ
logLength(123);        // エラー！ number は length を持たない
```

`T extends { length: number }` は「`T` は `length` プロパティ（`number` 型）を持つ型でなければならない」という制約です。

### API レスポンスの型を作る

実際の開発でよく見るパターンです。API から返ってくるデータの「外側の構造」は共通で、「中身のデータ」だけが違うという場面を考えます。

```typescript
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

type UserResponse = ApiResponse<User>;
// { data: User; status: number; message: string; }

type ProductListResponse = ApiResponse<Product[]>;
// { data: Product[]; status: number; message: string; }
```

`ApiResponse<T>` という「型の枠」を 1 つ定義しておけば、中身を差し替えるだけで何種類でもレスポンス型を作れます。

## ユーティリティ型 — 既存の型から新しい型を作る

TypeScript には、既存の型を変換する便利な組み込み型が用意されています。これを**ユーティリティ型**と呼びます。ジェネリクスの仕組みで作られており、`<>` の中に変換したい型を渡して使います。

### Partial\<T\> — すべてのプロパティを省略可能に

```typescript
interface User {
  name: string;
  age: number;
  email: string;
}

type PartialUser = Partial<User>;
// { name?: string; age?: number; email?: string; }
```

すべてのプロパティに `?` が付いた型になります。「一部だけ更新したい」という場面で便利です。

```typescript
function updateUser(id: number, changes: Partial<User>): void {
  console.log(`ユーザー ${id} を更新:`, changes);
}

updateUser(1, { name: "新しい名前" });            // OK: name だけ
updateUser(1, { age: 26, email: "new@example.com" }); // OK: age と email だけ
```

### Required\<T\> — すべてのプロパティを必須に

`Partial` の逆です。省略可能なプロパティも必須にします。

```typescript
interface Config {
  apiUrl?: string;
  timeout?: number;
}

type RequiredConfig = Required<Config>;
// { apiUrl: string; timeout: number; }
```

### Pick\<T, K\> — 特定のプロパティだけ抽出

```typescript
interface User {
  id: number;
  name: string;
  age: number;
  email: string;
}

type UserContact = Pick<User, "name" | "email">;
// { name: string; email: string; }
```

元の型から必要なプロパティだけを選んで新しい型を作ります。

### Omit\<T, K\> — 特定のプロパティを除外

`Pick` の逆です。指定したプロパティを除いた型を作ります。

```typescript
// 新規作成時は id がまだないので除外する
type NewUser = Omit<User, "id">;
// { name: string; age: number; email: string; }
```

### 組み合わせて使う

ユーティリティ型は組み合わせることで、より的確な型を作れます。

```typescript
// id 以外のプロパティを部分的に更新できる型
type UserUpdate = Partial<Omit<User, "id">>;
// { name?: string; age?: number; email?: string; }
```

`Omit<User, "id">` で `id` を除き、`Partial<>` で残りを省略可能にしています。「id は変えられないが、他の項目は好きなものだけ更新できる」という意図がそのまま型になります。

```mermaid
flowchart LR
  A["User\nid, name, age, email"] -->|"Omit&lt;User, 'id'&gt;"| B["name, age, email"]
  B -->|"Partial&lt;...&gt;"| C["name?, age?, email?"]
```

## 型の絞り込み（narrowing）

TypeScript にはユニオン型という「複数の型のどれか」を表す仕組みがあります。

```typescript
let value: string | number;
```

この `value` は `string` かもしれないし `number` かもしれません。そのままでは `string` 専用のメソッドも `number` 専用のメソッドも呼べません。

```typescript
function format(value: string | number): string {
  return value.toUpperCase(); // エラー！ number には toUpperCase がない
}
```

そこで `if` 文を使って型を確定させます。TypeScript は条件分岐を読み取って、ブロック内の型を自動的に絞り込みます。この仕組みを**ナローイング**（narrowing）と呼びます。

### typeof による絞り込み

`typeof` 演算子で値の型を判定できます。

```typescript
function format(value: string | number): string {
  if (typeof value === "string") {
    // ここでは value は string 型
    return value.toUpperCase();
  }
  // ここでは value は number 型（string の可能性が排除された）
  return value.toFixed(2);
}
```

TypeScript のコンパイラは `if (typeof value === "string")` を見て、そのブロック内では `value` が `string` であることを理解します。`else` 側では `string` の可能性が排除されるので `number` と確定します。これを**制御フロー分析**（control flow analysis）と呼びます。

### in 演算子による絞り込み

オブジェクトが特定のプロパティを持つかどうかで型を絞り込めます。

```typescript
interface Dog {
  bark(): void;
}

interface Cat {
  meow(): void;
}

function makeSound(animal: Dog | Cat): void {
  if ("bark" in animal) {
    // ここでは animal は Dog 型
    animal.bark();
  } else {
    // ここでは animal は Cat 型
    animal.meow();
  }
}
```

### null チェックによる絞り込み

`null` や `undefined` の可能性がある値は、真偽チェックで絞り込めます。

```typescript
function greet(name: string | null): string {
  if (name) {
    // ここでは name は string 型
    return `こんにちは、${name}さん`;
  }
  return "こんにちは";
}
```

### Discriminated Union — 共通プロパティで型を判別する

複数の型が共通のプロパティ（リテラル型）を持つとき、そのプロパティの値で型を安全に判別できます。このパターンを **discriminated union**（判別可能なユニオン）と呼びます。

```typescript
interface LoadingState {
  status: "loading";
}

interface SuccessState {
  status: "success";
  data: string[];
}

interface ErrorState {
  status: "error";
  message: string;
}

type State = LoadingState | SuccessState | ErrorState;
```

`status` プロパティの値がそれぞれ異なるリテラル型になっています。`switch` で分岐すると、各 `case` の中で型が確定します。

```typescript
function render(state: State): string {
  switch (state.status) {
    case "loading":
      return "読み込み中...";
    case "success":
      // ここでは state は SuccessState → data にアクセスできる
      return `${state.data.length}件のデータ`;
    case "error":
      // ここでは state は ErrorState → message にアクセスできる
      return `エラー: ${state.message}`;
  }
}
```

このパターンは API のレスポンス状態の管理でよく使われます。「読み込み中」「成功」「エラー」を 1 つの型で表現しつつ、各状態に固有のデータへ安全にアクセスできます。

### 網羅性チェック

discriminated union の大きなメリットは、すべてのケースを処理しているかをコンパイラがチェックできることです。

```typescript
// 後から新しい状態を追加したとする
interface RetryingState {
  status: "retrying";
  attempt: number;
}

type State = LoadingState | SuccessState | ErrorState | RetryingState;

function render(state: State): string {
  switch (state.status) {
    case "loading":
      return "読み込み中...";
    case "success":
      return `${state.data.length}件のデータ`;
    case "error":
      return `エラー: ${state.message}`;
    // "retrying" のケースがない！
    default: {
      const _exhaustive: never = state;
      // RetryingState が処理されていないのでコンパイルエラーになる
      return _exhaustive;
    }
  }
}
```

`never` 型は「ありえない値」を表す型です。すべてのケースを処理していれば `default` に到達する型は `never` になりますが、処理漏れがあると `never` に代入できない型が残るのでエラーになります。新しい状態を追加したときに処理漏れを機械的に検出できる仕組みです。

## まとめ

- `<T>` は「型の変数」。`Array<string>` も `Promise<Response>` も同じジェネリクスの仕組み
- ジェネリクスは「型安全」と「汎用性」を両立する。`any` を使わなくて済む
- ユーティリティ型で既存の型を変換できる
  - `Partial<T>` は全プロパティを省略可能に、`Required<T>` は全プロパティを必須に
  - `Pick<T, K>` で特定プロパティを抽出、`Omit<T, K>` で特定プロパティを除外
  - 組み合わせて `Partial<Omit<User, "id">>` のような型も作れる
- 型の絞り込み（narrowing）は `typeof`、`in`、null チェックなどで型を確定する仕組み
- discriminated union は共通のリテラル型プロパティで型を判別するパターン。`never` 型で網羅性もチェックできる
