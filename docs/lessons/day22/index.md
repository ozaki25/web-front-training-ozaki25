# Day 22: TypeScript 応用

## 今日のゴール

- 型の絞り込み（narrowing）の仕組みを知る
- discriminated union で安全に型を判別する方法を知る
- `satisfies` 演算子と `as const` の使いどころを知る
- 型安全なイベントハンドリングの書き方を知る

## 型の絞り込み（Narrowing）

Day 20 でユニオン型を学びました。ユニオン型の値を使うとき、TypeScript は条件分岐を読み取って型を自動的に絞り込みます。この仕組みを**ナローイング**と呼びます。

### typeof による絞り込み

```typescript
function format(value: string | number): string {
  if (typeof value === "string") {
    // ここでは value は string
    return value.toUpperCase();
  }
  // ここでは value は number（string の可能性が排除された）
  return value.toFixed(2);
}
```

TypeScript のコンパイラは `if (typeof value === "string")` を見て、ブロック内では `value` が `string` であることを理解します。これは TypeScript の重要な機能で、**制御フロー分析**（control flow analysis）と呼ばれます。

### truthiness による絞り込み

`null` や `undefined` の可能性がある値は、真偽チェックで絞り込めます。

```typescript
function printName(name: string | null): void {
  if (name) {
    // ここでは name は string（null と空文字列が排除された）
    console.log(name.toUpperCase());
  } else {
    console.log("名前が設定されていません");
  }
}
```

### in 演算子による絞り込み

オブジェクトが特定のプロパティを持つかで絞り込めます。

```typescript
interface Dog {
  bark(): void;
}

interface Cat {
  meow(): void;
}

function makeSound(animal: Dog | Cat): void {
  if ("bark" in animal) {
    // ここでは animal は Dog
    animal.bark();
  } else {
    // ここでは animal は Cat
    animal.meow();
  }
}
```

## Discriminated Union

Day 20 の最後で予告した **discriminated union**（判別可能なユニオン）を詳しく見ていきます。共通のプロパティ（**判別プロパティ**）を使って型を安全に判別するパターンです。

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

`status` プロパティの値がリテラル型になっているので、`switch` で安全に分岐できます。

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

### 網羅性チェック

discriminated union の大きなメリットは、**すべてのケースを処理しているか**をコンパイラがチェックできることです。

```typescript
// 後から新しい状態を追加した場合
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
      // never 型を使って網羅性をチェック
      const _exhaustive: never = state;
      // RetryingState が処理されていないのでエラーになる
      return _exhaustive;
    }
  }
}
```

`never` 型は「ありえない値」を表す型です。すべてのケースを処理していれば `default` に到達する型は `never` になりますが、処理漏れがあるとエラーになります。

## as const

`as const` は、値をリテラル型として固定するアサーション（型の断言）です。

```typescript
// as const なし
const colors = ["red", "green", "blue"];
// 型: string[]

// as const あり
const colors = ["red", "green", "blue"] as const;
// 型: readonly ["red", "green", "blue"]
```

`as const` をつけると、配列の要素がリテラル型になり、配列自体が `readonly`（変更不可）になります。

オブジェクトにも使えます。

```typescript
const config = {
  apiUrl: "https://api.example.com",
  maxRetries: 3,
} as const;
// 型: { readonly apiUrl: "https://api.example.com"; readonly maxRetries: 3; }

config.apiUrl = "other"; // エラー！ readonly
```

### as const の実用的な使い方

定数の集合を定義するときに便利です。

```typescript
const STATUS = {
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
} as const;

// オブジェクトの値からユニオン型を作る
type Status = (typeof STATUS)[keyof typeof STATUS];
// "loading" | "success" | "error"
```

## satisfies 演算子

`satisfies` は TypeScript 4.9 で追加された演算子です。「この値はこの型を満たしている」ことを検証しつつ、推論された型を保持します。

通常の型注釈との違いを見てみます。

```typescript
type Colors = Record<string, string | string[]>;

// 型注釈を使う場合
const palette: Colors = {
  red: "#ff0000",
  green: "#00ff00",
  blue: ["#0000ff", "#0000cc"],
};

// red は string | string[] になってしまう
palette.red.toUpperCase(); // エラー！ string[] かもしれない
```

```typescript
type Colors = Record<string, string | string[]>;

// satisfies を使う場合
const palette = {
  red: "#ff0000",
  green: "#00ff00",
  blue: ["#0000ff", "#0000cc"],
} satisfies Colors;

// red は string と推論される（具体的な型が保持される）
palette.red.toUpperCase(); // OK!

// blue は string[] と推論される
palette.blue.map((c) => c.toUpperCase()); // OK!

// Colors 型を満たしているかもチェックされる
const invalid = {
  red: 123, // エラー！ number は string | string[] に代入できない
} satisfies Colors;
```

`satisfies` は「型の検証はしたいが、推論された具体的な型を失いたくない」場面で使います。

## 型安全なイベントハンドリング

Phase 4 で React を学ぶ準備として、DOM イベントの型について見ておきます。Day 14 で学んだイベントリスナーを TypeScript で書くとこうなります。

```typescript
const button = document.querySelector("button");

// button は HTMLButtonElement | null（要素が見つからない可能性がある）
if (button) {
  button.addEventListener("click", (event: MouseEvent) => {
    console.log(`クリック座標: (${event.clientX}, ${event.clientY})`);
  });
}
```

イベントの種類ごとに型が異なります。

| イベント | 型 |
|---------|-----|
| click, mousedown | `MouseEvent` |
| keydown, keyup | `KeyboardEvent` |
| submit | `SubmitEvent` |
| input, change | `Event` |
| focus, blur | `FocusEvent` |

### 型アサーション（as）

TypeScript には、開発者が「この値はこの型である」と明示的に伝える**型アサーション**（`as`）という構文があります。

TypeScript の型推論では判断しきれない場面で使います。

```typescript
const input = event.target as HTMLInputElement;
```

型アサーションは型チェックをすり抜けるため、**本当にその型であると確信がある場合にだけ**使います。このレッスンで学んだ narrowing（型の絞り込み）で安全に型を判別できる場合は、そちらを優先します。

```typescript
const input = document.querySelector("input");

if (input) {
  input.addEventListener("input", (event: Event) => {
    // event.target は EventTarget | null なので型アサーションが必要
    const target = event.target as HTMLInputElement;
    console.log(target.value);
  });
}
```

フォームの例も見てみます。

```typescript
const form = document.querySelector("form");

if (form) {
  form.addEventListener("submit", (event: SubmitEvent) => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = formData.get("name"); // FormDataEntryValue | null
    if (typeof name === "string") {
      console.log(`名前: ${name}`);
    }
  });
}
```

> **ポイント**: React ではこれらの DOM イベント型を直接使わず、`React.MouseEvent` や `React.ChangeEvent<HTMLInputElement>` のようなラッパー型を使います。Phase 4 で詳しく学びます。

## まとめ

- TypeScript は `typeof`、真偽チェック、`in` 演算子などから型を自動的に絞り込む（narrowing）
- discriminated union は共通のリテラル型プロパティで型を判別するパターン。`never` 型で網羅性もチェックできる
- `as const` はリテラル型として固定し、定数の集合からユニオン型を作るのに便利
- `satisfies` は型の検証をしつつ、推論された具体的な型を保持する
- DOM イベントにも型があり、TypeScript で安全に扱える

**次のレッスン**: [Day 23: React の概要と JSX](/lessons/day23/)
