# TypeScript の型を読む — ユニオン・ジェネリクス・絞り込み

## 今日のゴール

- ユニオン型（`A | B`）で「どちらか」を表現できることを知る
- ジェネリクス（`Array<T>`）が「中身の型を後で決める」仕組みだと知る
- 型の絞り込み（narrowing）で TypeScript が安心する理由を知る

## TypeScript のコードに出てくる記号

TypeScript で書かれたコードには、`: string` や `number` 以外にも独特な記号が頻出します。

```tsx
type Result = { status: "ok"; data: string } | { status: "error"; message: string };

function useData<T>(url: string): Promise<T> {
  return fetch(url).then((res) => res.json());
}
```

`|` や `<T>` が何を意味しているのか。これらは TypeScript の型システムの中で最も使われる構文です。1 つずつ読み解いていきます。

## ユニオン型 — 「これかあれか」

**ユニオン型**は、`|`（パイプ）で複数の型をつなぎ、「そのどれかである」を表現します。

```tsx
type Status = "loading" | "success" | "error";

function StatusBadge({ status }: { status: Status }) {
  return <span>{status}</span>;
}
```

`Status` は `"loading"` か `"success"` か `"error"` のどれかだけを受け付けます。ただの `string` ではなく、**許される値を列挙**しているのです。

文字列だけでなく、型の組み合わせにも使えます。

```tsx
type Id = string | number;

function formatId(id: Id): string {
  // id は string か number のどちらか
  return `ID: ${id}`;
}
```

ユニオン型が効果を発揮するのは、「ありえない値を渡してしまう」ミスを防ぐ場面です。

```tsx
type Color = "red" | "blue" | "green";

function setTheme(color: Color) { /* ... */ }

setTheme("red");    // OK
setTheme("yellow"); // エラー: "yellow" は Color に含まれない
```

エディタがリアルタイムで弾いてくれるので、スペルミスや未定義の値に実行前に気づけます。

## ジェネリクス — 中身の型を後から決める

配列の型を見てみます。

```tsx
const names: string[] = ["田中", "鈴木"];
const ages: number[] = [25, 30];
```

`string[]` は「文字列の配列」、`number[]` は「数値の配列」です。これは実は次の書き方の省略形です。

```tsx
const names: Array<string> = ["田中", "鈴木"];
const ages: Array<number> = [25, 30];
```

`Array<string>` の `<string>` が**ジェネリクス**です。`Array` という「箱」に対して、「中身は `string`」と後から指定しています。

### なぜ便利なのか

ジェネリクスが無いと、配列の中身ごとに別の型を作る必要があります。

```tsx
// ジェネリクスなしの世界（想像）
type StringArray = { /* 文字列専用の配列... */ };
type NumberArray = { /* 数値専用の配列... */ };
```

ジェネリクスがあれば、`Array<T>` という 1 つの定義で、あらゆる中身に対応できます。`T` は「ここに型が入りますよ」という**穴**（型パラメータ）です。

### よく見る形

コードで頻出するジェネリクスの形をまとめます。

| 記法 | 意味 |
|------|------|
| `Array<string>` | 文字列の配列 |
| `Promise<User>` | User を返す非同期処理 |
| `Record<string, number>` | キーが文字列、値が数値のオブジェクト |
| `Map<string, User>` | キーが文字列、値が User のマップ |
| `useState<number>(0)` | number 型の state |

自分で型を定義するときにも使えます。

```tsx
type ApiResponse<T> = {
  status: number;
  data: T;
};

// User を返す API レスポンス
type UserResponse = ApiResponse<User>;

// 商品リストを返す API レスポンス
type ProductListResponse = ApiResponse<Product[]>;
```

「レスポンスの構造は同じだけど、中身のデータが違う」を 1 つの型で表現できます。ジェネリクスを見たら「中身の型を差し替えられる入れ物」と読んでください。

## 型の絞り込み — narrowing

ユニオン型の変数をそのまま使おうとすると、TypeScript は警告を出します。

```tsx
function double(value: string | number) {
  return value * 2;
  //     ^^^^^ エラー: string を掛け算できない
}
```

`value` は `string` かもしれないのに `* 2` しようとしている。TypeScript は「string の可能性を考慮していない」と怒るわけです。

解決するには、`if` で型を確認します。

```tsx
function double(value: string | number): number {
  if (typeof value === "string") {
    // ここでは value は string と確定
    return Number(value) * 2;
  }
  // ここでは value は number と確定
  return value * 2;
}
```

`typeof value === "string"` のチェックを通過した後、TypeScript は「この分岐の中では `value` は `string` に確定した」と判断します。else 側では残りの `number` に確定します。この仕組みを**型の絞り込み**（narrowing）と呼びます。

### 絞り込みの道具

TypeScript が絞り込みと認識する条件はいくつかあります。

| 条件 | 用途 | 例 |
|------|------|-----|
| `typeof x === "string"` | プリミティブ型の判定 | `string`, `number`, `boolean` |
| `"name" in x` | プロパティの有無 | オブジェクトの判別 |
| `x instanceof Date` | クラスの判定 | `Date`, `Error`, `RegExp` |
| `x === null` | null チェック | null を除外 |
| `Array.isArray(x)` | 配列かどうか | 配列とオブジェクトの判別 |

### 判別ユニオン — オブジェクトの分岐

ユニオン型がオブジェクトの場合、共通のプロパティで分岐するパターンがよく使われます。

```tsx
type Result =
  | { status: "ok"; data: string }
  | { status: "error"; message: string };

function showResult(result: Result) {
  if (result.status === "ok") {
    // ここでは result.data が使える
    console.log(result.data);
  } else {
    // ここでは result.message が使える
    console.log(result.message);
  }
}
```

`status` というプロパティが `"ok"` か `"error"` かで型が決まるので、TypeScript は `if` の中で**どちらの型か自動的に判断**できます。この共通プロパティを**判別プロパティ**（discriminant）、パターン全体を**判別ユニオン**（discriminated union）と呼びます。

API レスポンスの成功/失敗、データ取得ライブラリの状態管理など、実際のコードで頻繁に登場します。

```tsx
type QueryState<T> =
  | { status: "pending" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };

function renderQuery<T>(state: QueryState<T>) {
  switch (state.status) {
    case "pending":
      return <p>読み込み中...</p>;
    case "success":
      return <pre>{JSON.stringify(state.data)}</pre>;
    case "error":
      return <p role="alert">{state.error.message}</p>;
  }
}
```

`switch` で全ケースを書き分けると、関数の戻り値の型を明示している場合、新しいステータスを追加して `case` を書き忘れたときに「undefined が返りうる」というエラーとして検出されます。網羅漏れが型エラーになる、安全な書き方です。

## なぜ「絞り込み」が必要なのか

TypeScript は「型が確定していないまま操作する」のを許しません。ユニオン型の変数に対して、全ケースで使える操作しか許可しないのです。

```tsx
function format(value: string | number) {
  // toFixed は number にしかないメソッド
  value.toFixed(2); // エラー: string に toFixed は存在しない
}
```

これは TypeScript の「疑り深さ」であり、安全装置です。`if` で型を確認することは、TypeScript に「大丈夫、ここではこの型だと保証する」と伝える行為です。

プログラムの実行時にも型チェックは存在しません。TypeScript は実行前の静的解析で安全性を確認し、実行時には消えます。だからこそ「コードを書いている時点で」安全であることを証明する必要があり、その証明手段が絞り込みなのです。

## AI のコードに対して

TypeScript のコードには、ユニオン型やジェネリクスが当たり前に登場します。読めれば「この型は何を許容しているか」がわかるので、不適切な値を渡すバグに気づけます。

「この関数の引数を `string | number` ではなく `number` だけにして」「ジェネリクスで `Product` 型を入れて」のように、型に関する具体的な修正指示が出せるのも、記号の意味を知っている人の強みです。

## まとめ

- ユニオン型（`A | B`）は「どちらかである」を表し、許される値を制限できる
- ジェネリクス（`<T>`）は中身の型を後から差し替えられる仕組み
- 絞り込み（narrowing）は `if` で型を確定させ、TypeScript を安心させる手段
