# React Compiler — 手動メモ化からの解放

## 今日のゴール

- 再レンダリングで不要な再計算が起きる仕組みを知る
- useMemo / useCallback / React.memo による手動メモ化と、その負担を知る
- React Compiler がビルド時に自動メモ化する仕組みを知る

## AI が書いたコードに並ぶ useMemo と useCallback

AI に React のコードを書かせると、こんなコードが返ってくることがあります。

```tsx
import { useState, useMemo, useCallback } from "react";

function ProductPage({ items }: { items: Product[] }) {
  const [sortKey, setSortKey] = useState<"price" | "name">("price");

  const sorted = useMemo(
    () => items.toSorted((a, b) => a.price - b.price),
    [items],
  );

  const handleClick = useCallback(() => {
    setSortKey("name");
  }, []);

  return (
    <ul>
      {sorted.map(item => (
        <li key={item.id}>{item.name}: ¥{item.price}</li>
      ))}
    </ul>
  );
}
```

`useMemo` や `useCallback` が何をしているのかよくわからないまま、「AI が書いたからそのまま」にしていないでしょうか。これらはすべて**メモ化**（前回の計算結果を覚えておき、同じ入力なら再計算をスキップすること）のための API です。

なぜメモ化が必要なのか。それは React の再レンダリングの仕組みに理由があります。

## 再レンダリングの連鎖

React は状態が変わるとコンポーネント関数を再実行して、新しい画面を組み立てます。

```tsx
import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <p>{count}</p>
      <HeavyList />
    </div>
  );
}
```

`count` が変わると `App` が再実行されます。問題は `<HeavyList />`。`count` とは無関係なのに、親である `App` が再実行されるたびに一緒に再レンダリングされます。

親が再実行されると、子も全部再実行される。子の中に重い処理があると、ボタンを押すたびにその処理が走ります。

## 不要な再計算の 3 パターン

再レンダリングで無駄が起きる代表的な場面を 3 つ見ておきます。

### 重い計算の繰り返し

```tsx
import { useState } from "react";

function ProductPage({ items }: { items: Product[] }) {
  const [query, setQuery] = useState("");

  // query が変わるたびに items のソートも再実行される（items は変わっていないのに）
  const sorted = items.toSorted((a, b) => a.price - b.price);

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <ul>
        {sorted.map(item => (
          <li key={item.id}>{item.name}: ¥{item.price}</li>
        ))}
      </ul>
    </>
  );
}
```

`query` が変わるだけで `items` のソートが毎回走ります。

### 無関係な子コンポーネントの再レンダリング

前のセクションの `App` の例がまさにこれです。`count` が変わっただけなのに `<HeavyList />` まで再レンダリングされます。

### コールバック関数の再生成

```tsx
import { useState } from "react";

function SearchPage() {
  const [query, setQuery] = useState("");

  const handleSearch = (text: string) => {
    fetch(`/api/search?q=${text}`);
  };

  return <SearchBox onSearch={handleSearch} />;
}
```

JavaScript では関数を作るたびに新しいオブジェクトが生まれます。`handleSearch` は再レンダリングのたびに「別の関数」になるため、`SearchBox` は「props が変わった」と判断して再レンダリングされます。

## 手動メモ化の 3 つの API

React はこれらの問題に対して、3 つのメモ化 API を用意していました。

| API | 用途 | やること |
|-----|------|---------|
| `useMemo` | 計算結果のキャッシュ | 依存配列が変わらなければ前回の値を返す |
| `useCallback` | 関数のキャッシュ | 依存配列が変わらなければ前回の関数を返す |
| `React.memo` | コンポーネントのキャッシュ | props が変わらなければ再レンダリングをスキップ |

3 パターンそれぞれに対応するメモ化はこうなります。

```tsx
import { useMemo, useCallback, memo } from "react";

// パターン 1: 重い計算をキャッシュ（items が変わったときだけ再計算）
const sorted = useMemo(
  () => items.toSorted((a, b) => a.price - b.price),
  [items],
);

// パターン 2: コンポーネントをメモ化（props が同じなら再レンダリングしない）
const HeavyList = memo(function HeavyList({ data }: { data: Item[] }) {
  return <ul>{/* ... */}</ul>;
});

// パターン 3: 関数をキャッシュ（毎回新しい関数を作らない）
const handleSearch = useCallback(
  (text: string) => {
    fetch(`/api/search?q=${text}`);
  },
  [],
);
```

### 手動メモ化の負担

動きますが、3 つの負担があります。

**依存配列のミス**

`useMemo` や `useCallback` の第 2 引数（依存配列）は、「この値が変わったら再計算する」という指定です。ここを書き間違えると、古いデータが表示され続けるバグになります。

```tsx
const sorted = useMemo(
  () => items.toSorted((a, b) => a.price - b.price),
  [], // バグ: items を入れ忘れ → items が変わっても再計算されない
);
```

**書き忘れ**

メモ化は「書かなくても動く」ので、忘れても気づきにくい。パフォーマンスが悪化して初めて発覚します。

**コードの複雑化**

1 箇所ならいいですが、コンポーネントの中に `useMemo` と `useCallback` が 5 個も 6 個も並ぶと、本来のロジックが埋もれます。

## React Compiler による自動メモ化

React Compiler はこの問題を根本から解決します。ビルド時にコードを解析して、必要なメモ化を自動で挿入するコンパイラです。

開発者はメモ化を意識せず、シンプルなコードを書くだけです。

```tsx
function ProductPage({ items }: { items: Product[] }) {
  const sorted = items.toSorted((a, b) => a.price - b.price);

  return (
    <ul>
      {sorted.map(item => (
        <li key={item.id}>{item.name}: ¥{item.price}</li>
      ))}
    </ul>
  );
}
```

`useMemo` はどこにもありません。React Compiler がビルド時にこのコードを解析し、`sorted` の計算が自動でキャッシュされるように変換します。

### 動作の仕組み

React のコード（`.tsx` ファイル）は、ブラウザで動く JavaScript に変換されてから配信されます。React Compiler はこの変換のタイミングで、メモ化が必要な箇所を見つけて自動で挿入します。

```mermaid
graph LR
  A["ソースコード<br>（メモ化なし）"] --> B["React Compiler<br>（ビルド時に解析）"]
  B --> C["変換後のコード<br>（メモ化が挿入済み）"]
  C --> D["ブラウザで実行"]
```

コンパイラは 3 つのステップで動きます。

1. **解析**: コンポーネントの中で、どの値がどの入力（props / state）に依存しているかを追跡する
2. **分類**: 値を「毎回変わる」「特定の入力が変わったときだけ変わる」「絶対に変わらない」に分ける
3. **挿入**: 必要な箇所にだけメモ化のコードを挿入する

手動では「ここをメモ化すべきか」を開発者が判断していましたが、コンパイラはコード全体のデータフローを見て機械的に判断します。漏れもなく、依存配列のミスも起きません。

### 純粋なコンポーネントであることが前提

React Compiler は「同じ入力なら同じ結果を返す」（純粋である）ことを前提に最適化します。

```tsx
// ✅ 純粋 — 同じ name なら同じ結果
function Greeting({ name }: { name: string }) {
  return <h1>こんにちは、{name}さん</h1>;
}

// ❌ 不純 — レンダリングのたびに結果が変わる
let callCount = 0;
function Greeting({ name }: { name: string }) {
  callCount++; // レンダー中に外部の変数を変更している
  return <h1>こんにちは、{name}さん（{callCount}回目）</h1>;
}
```

ルールに違反したコンポーネントがあっても、コンパイラはそのコンポーネントだけをスキップし、残りは正常にコンパイルします。アプリ全体が壊れることはありません。

### Next.js での有効化

Next.js では `next.config.ts` に 1 行追加するだけで有効にできます。

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
};

export default nextConfig;
```

段階的に導入したい場合は、アノテーションモードを使います。`"use memo"` ディレクティブを書いたコンポーネントだけがコンパイル対象になります。

```ts
const nextConfig: NextConfig = {
  reactCompiler: {
    compilationMode: "annotation",
  },
};
```

```tsx
"use memo";

export default function Dashboard() {
  // このコンポーネントだけがコンパイル対象
}
```

### 既存コードとの互換性

React Compiler を有効にしても、既存の `useMemo` / `useCallback` / `React.memo` はそのまま残して問題ありません。コンパイラは既存のメモ化を認識するため、二重にメモ化されることはありません。新しいコードでは手動メモ化を書かなくてよいだけです。

## まとめ

- 再レンダリングの連鎖で不要な再計算が起きる。手動メモ化（`useMemo` / `useCallback` / `React.memo`）は負担が大きい
- React Compiler はビルド時にデータフローを解析し、必要なメモ化を自動で挿入する
- Next.js では `reactCompiler: true` の 1 行で有効化できる
