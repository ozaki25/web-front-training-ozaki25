# React Compiler — 手動メモ化からの解放

## 今日のゴール

- 再レンダリングで不要な再計算が起きる仕組みを知る
- useMemo / useCallback / React.memo による手動メモ化と、その負担を知る
- React Compiler がビルド時に自動メモ化する仕組みを知る

## 状態が変わると、コンポーネントは丸ごと再実行される

React は状態が変わるとコンポーネント関数を再実行して、新しい画面を組み立てます。

```tsx
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

`count` が変わると `App` が再実行されます。ここで問題になるのが `<HeavyList />`。`count` とは無関係なのに、`App` が再実行されるたびに一緒に再レンダリングされます。

これが**再レンダリングの連鎖**です。親が再実行されると、子も全部再実行される。子の中に重い処理があると、ボタンを押すたびにその処理が走ります。

## 不要な再計算の 3 パターン

再レンダリングで無駄が起きるのは、主に 3 つの場面です。

### 重い計算が毎回走る

```tsx
function ProductPage({ items }: { items: Product[] }) {
  // items が変わっていなくても、再レンダリングのたびに実行される
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

### 子コンポーネントが毎回再レンダリングされる

```tsx
function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>+1</button>
      {/* count と無関係なのに、毎回再レンダリングされる */}
      <ExpensiveChart data={chartData} />
    </div>
  );
}
```

### コールバック関数が毎回「別物」になる

```tsx
function SearchPage() {
  const [query, setQuery] = useState("");

  // 再レンダリングのたびに新しい関数が作られる
  const handleSearch = (text: string) => {
    fetch(`/api/search?q=${text}`);
  };

  return <SearchBox onSearch={handleSearch} />;
}
```

JavaScript では関数を作るたびに新しいオブジェクトが生まれます。`handleSearch` は毎回「別の関数」になるため、`SearchBox` は「props が変わった」と判断して再レンダリングされます。

## 手動メモ化 — useMemo / useCallback / React.memo

React はこれらの問題に対して、3 つのメモ化 API を用意していました。

| API | 用途 | やること |
|-----|------|---------|
| `useMemo` | 計算結果のキャッシュ | 依存配列が変わらなければ前回の値を返す |
| `useCallback` | 関数のキャッシュ | 依存配列が変わらなければ前回の関数を返す |
| `React.memo` | コンポーネントのキャッシュ | props が変わらなければ再レンダリングをスキップ |

先ほどの 3 パターンを手動メモ化で書き直すと、こうなります。

```tsx
import { useState, useMemo, useCallback, memo } from "react";

// パターン 2: コンポーネントをメモ化（props が同じなら再レンダリングしない）
const ExpensiveChart = memo(function ExpensiveChart({ data }: { data: number[] }) {
  return <canvas>{/* 重い描画処理 */}</canvas>;
});

function App() {
  const [count, setCount] = useState(0);
  const items: Product[] = [/* ... */];

  // パターン 1: 重い計算をキャッシュ
  const sorted = useMemo(
    () => items.toSorted((a, b) => a.price - b.price),
    [items],
  );

  // パターン 3: 関数をキャッシュ
  const handleSearch = useCallback(
    (text: string) => {
      fetch(`/api/search?q=${text}`);
    },
    [],
  );

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <ExpensiveChart data={chartData} />
      <SearchBox onSearch={handleSearch} />
    </div>
  );
}
```

動きますが、3 つの負担があります。

**依存配列のミス**

`useMemo` や `useCallback` の第 2 引数に渡す配列（依存配列）は、「この値が変わったら再計算する」という指定です。ここを書き間違えると、古いデータが表示され続けるバグになります。

```tsx
const sorted = useMemo(
  () => items.toSorted((a, b) => a.price - b.price),
  [], // バグ: items を入れ忘れ → items が変わっても再計算されない
);
```

**書き忘れ**

メモ化は「書かなくても動く」ので、忘れても気づきにくい。パフォーマンスが悪化して初めて発覚します。

**コードの複雑化**

メモ化が 1 箇所ならいいですが、コンポーネントの中に `useMemo` と `useCallback` が 5 個も 6 個も並ぶと、本来のロジックが読みづらくなります。

## React Compiler — ビルド時に自動でメモ化する

React Compiler はこの問題を根本から解決します。ビルド時にコードを解析して、必要なメモ化を自動で挿入するコンパイラです。

開発者はメモ化を意識せず、シンプルなコードを書くだけです。

```tsx
// 開発者が書くコード（メモ化なし、シンプル）
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

React Compiler がビルド時にこのコードを解析し、`sorted` の計算が自動でキャッシュされるように変換します。`useMemo` を書く必要はありません。

### 仕組み

React Compiler は Babel プラグイン（Next.js では SWC 経由）としてビルドパイプラインに組み込まれます。

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

### コンポーネントが純粋であることが前提

React Compiler は「同じ入力なら同じ結果を返す」(純粋である)ことを前提に最適化します。

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

Next.js では設定 1 行で有効にできます。

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
};

export default nextConfig;
```

段階的に導入したい場合は、アノテーションモードを使います。`"use memo"` ディレクティブを付けたコンポーネントだけがコンパイル対象になります。

```ts
// next.config.ts
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

## 既存の手動メモ化はどうなるか

React Compiler を有効にしたら、既存の `useMemo` / `useCallback` / `React.memo` はどうするか。

**そのまま残して問題ない**。コンパイラは既存のメモ化を認識するため、二重にメモ化されることはありません。新しいコードでは手動メモ化を書かなくてよいだけです。

## まとめ

- 再レンダリングの連鎖で不要な再計算が起きる。手動メモ化（`useMemo` / `useCallback` / `React.memo`）は負担が大きい
- React Compiler はビルド時にデータフローを解析し、必要なメモ化を自動で挿入する
- Next.js では `reactCompiler: true` の 1 行で有効化できる
