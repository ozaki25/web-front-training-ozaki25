# as const と satisfies — 型を広げず、具体的なまま保つ

## 今日のゴール

- リテラル型が `string` などの広い型に推論される「型の拡大」を知る
- `as const` が値をリテラル型のまま読み取り専用に固定する仕組みを知る
- `satisfies` が型への適合チェックと具体的な型推論を両立させることを知る

## 値は正しいのに出る型エラー

TypeScript では、値はどう見ても合っているのに型エラーになることがあります。

```tsx
type Variant = "primary" | "danger";

function Button({ variant, label }: { variant: Variant; label: string }) {
  return <button type="button" className={variant}>{label}</button>;
}

const submitButton = { variant: "primary", label: "送信する" };

function Page() {
  return <Button variant={submitButton.variant} label={submitButton.label} />;
  //             ^^^^^^^ エラー: Type 'string' is not assignable to type 'Variant'.
}
```

`submitButton.variant` の値は `"primary"` そのものです。それなのに「`string` は `Variant` に代入できない」と怒られます。

原因は値ではなく型にあります。TypeScript は `submitButton.variant` の型を `"primary"` ではなく `string` と推論しているのです。

## 型の拡大 — リテラル型が広い型に推論される

`"primary"` のような具体的な値そのものを表す型を**リテラル型**と呼びます。TypeScript は、あとで書き換えられる場所に置かれたリテラル値を、リテラル型ではなく広い型（`"primary"` なら `string`、`1` なら `number`）で推論します。これを**型の拡大**（widening）と呼びます。

| 書き方 | 推論される型 |
|------|------------|
| `const color = "red"` | `"red"` |
| `let color = "red"` | `string` |
| `const obj = { color: "red" }` | `{ color: string }` |
| `const colors = ["red", "blue"]` | `string[]` |

`const` で宣言した変数は再代入できないので、リテラル型 `"red"` のまま保たれます。一方 `let` はあとで `color = "blue"` と書き換えられるため、TypeScript は「別の文字列が入るかもしれない」と考えて `string` に広げます。

見落としやすいのが 3 行目です。**オブジェクト自体を `const` で宣言しても、プロパティは広がります**。`const obj` は `obj` への再代入を禁止するだけで、`obj.color = "blue"` という書き換えは禁止しないからです。冒頭の `submitButton.variant` が `string` になったのはこのためです。

型の拡大自体は理にかなった挙動です。書き換えられる場所の型を `"red"` に固定してしまうと、`color = "blue"` という普通の代入がすべてエラーになってしまいます。困るのは、書き換えるつもりのない定数まで広がってしまう場合です。

## as const — リテラル型のまま固定する

書き換えるつもりがないなら、それを TypeScript に伝えれば広がりません。その構文が **as const** です。

```tsx
const submitButton = { variant: "primary", label: "送信する" } as const;
// 型: { readonly variant: "primary"; readonly label: "送信する" }

function Page() {
  return <Button variant={submitButton.variant} label={submitButton.label} />;
  // OK: variant の型は "primary" なので Variant に代入できる
}
```

`as const` を付けると、その値は「これ以上変わらない定数」として扱われます。

- プロパティがリテラル型のまま保たれる（`"primary"` が `string` に広がらない）
- すべてのプロパティが `readonly` になり、書き換えようとするとエラーになる
- ネストしたオブジェクトや配列にも再帰的に効く

書き換えを禁止しているからこそ、リテラル型のまま固定しても矛盾が起きません。

なお、`const submitButton: { variant: Variant; label: string } = ...` と型注釈を書いても冒頭のエラーは解決できます。ただ、値をそのまま定数として固定したいだけなら、型を別に書かずに済む `as const` のほうが簡潔です。

### 配列からユニオン型を導出する

`as const` は配列にもよく使われます。配列に付けると、要素の型と並び順まで固定した読み取り専用のタプルになります。

```tsx
const SIZES = ["sm", "md", "lg"] as const;
// 型: readonly ["sm", "md", "lg"]

type Size = (typeof SIZES)[number];
// 型: "sm" | "md" | "lg"
```

`typeof SIZES` は値 `SIZES` の型を取り出す構文で、`[number]` は「その配列の要素の型」を意味します。`as const` がないと `SIZES` は `string[]` に広がるため、導出される型もただの `string` になってしまいます。「選択肢の一覧を値として持ち、そこからユニオン型を作る」という形は、実際のコードで頻繁に登場します。

### 型アサーションの as との違い

`as const` は `as User` のような**型アサーション**と同じ `as` を使いますが、性質はまったく違います。

| | `as User` | `as const` |
|---|---|---|
| 何をするか | 型チェックを上書きして黙らせる | 推論のしかたを「固定」に切り替える |
| 実際と違う型を付けられるか | 付けられる（危険） | 付けられない |

`as const` は値を偽りません。実際の値から導けるリテラル型を保つだけなので、安全に使えます。

## satisfies — 適合を確認しつつ推論を保つ

型の拡大とは別に、**型注釈が具体的な情報を消してしまう**問題もあります。

```tsx
type Theme = Record<string, string>;

const theme: Theme = {
  primary: "#3b82f6",
  danger: "#ef4444",
};

theme.primary; // OK
theme.prmary;  // これも通ってしまう（タイポなのに）
```

`: Theme` と注釈を付けた時点で、`theme` の型は `Theme` そのもの、つまり「文字列キーなら何でもある」になります。キーが `primary` と `danger` の 2 つだけ、という情報は失われ、存在しないキーへのアクセスも型エラーになりません。

注釈を外せばキーの情報は残りますが、今度は「`Theme` の形に合っているか」を誰もチェックしてくれません。値に数値を混ぜても気づけないままです。

この 2 つを両立させるのが **satisfies** です。

```tsx
const theme = {
  primary: "#3b82f6",
  danger: "#ef4444",
} satisfies Theme;

theme.prmary;  // エラー: Property 'prmary' does not exist
theme.primary; // OK。キーの情報が保たれている
```

`satisfies Theme` は「この値が `Theme` を満たすか」をその場でチェックします。満たさなければエラーです。

```tsx
const theme = {
  primary: "#3b82f6",
  danger: 0xef4444, // エラー: number は string に代入できない
} satisfies Theme;
```

チェックに通ったあとの `theme` の型は `Theme` ではなく、**推論された具体的な型のまま**です。「`Theme` に適合することは確認済み、でもキーは `primary` と `danger` の 2 つだけ」という両方の情報を持てます。

### 値の型の具体性も保たれる

保たれるのはキーだけではありません。値ごとの具体的な型も残ります。

```tsx
type Color = string | number[];

const palette = {
  red: [255, 0, 0],
  green: "#00ff00",
} satisfies Record<string, Color>;

palette.green.toUpperCase(); // OK: green は string と推論されている
palette.red.map((n) => n / 255); // OK: red は number[] と推論されている
```

もし `: Record<string, Color>` と注釈で書いていたら、`palette.green` の型は `string | number[]` になり、`toUpperCase()` を呼ぶには絞り込みが必要でした。`satisfies` なら「`green` は `string`」という推論結果がそのまま使えます。

## 型注釈と as と satisfies の整理

同じ場所に書ける 3 つの構文を並べると、役割の違いがはっきりします。

| 書き方 | 適合チェック | 変数の型 |
|------|------------|---------|
| `const x: Theme = {...}` | する | `Theme` に置き換わる |
| `const x = {...} as Theme` | しない（上書き） | `Theme` に置き換わる |
| `const x = {...} satisfies Theme` | する | 推論された具体的な型のまま |

`as const` はこの表とは軸が別で、「型の拡大を止めて readonly にする」役割です。両方欲しい場面では `{...} as const satisfies Theme` のように併用もできます。

## AI のコードの評価と指示

実際のコードでは、設定オブジェクトに付いた `as const` や `satisfies` が当たり前に登場します。役割を知っていれば「なんとなく付いているおまじない」ではなく、意図を読み取れます。

修正を指示するときの語彙にもなります。「この配列は `as const` にして、そこからユニオン型を導出して」「型注釈だと具体的なキーの情報が消えるから、`satisfies` に変えて」のように、型の情報をどう保つかを具体的に指定できます。

## まとめ

- 書き換えられる場所ではリテラル型が広い型に推論される（型の拡大）
- `as const` はリテラル型のまま読み取り専用に固定し、配列からのユニオン型導出にも使う
- `satisfies` は型への適合を確認しつつ、推論された具体的な型を保つ
