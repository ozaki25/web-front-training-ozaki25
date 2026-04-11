# Day 30: React のレンダリング最適化

## 今日のゴール

- React のレンダリングの仕組みをもう一度整理する
- React Compiler による自動最適化を知る
- `memo`, `useMemo`, `useCallback` が不要になりつつある背景を知る
- React Profiler で実際のレンダリングを確認する方法を知る

## レンダリングの復習

Day 23 で学んだ再レンダリングの仕組みを整理しましょう。

React のレンダリングは3つのステップで行われます。

1. **トリガー**: state の更新、props の変更などでレンダリングが発生
2. **レンダー**: コンポーネント関数を呼び出し、仮想 DOM を作成
3. **コミット**: 前の仮想 DOM と比較し、差分を実際の DOM に反映

重要なのは、**レンダー**（コンポーネント関数の呼び出し）と **DOM の更新**は別のステップだということです。レンダーされても、差分がなければ DOM は更新されません。

### 再レンダリングが起きる条件

- そのコンポーネントの state が更新された
- 親コンポーネントが再レンダリングされた

特に2つ目が重要です。親が再レンダリングされると、子コンポーネントはすべて再レンダリングされます。

```tsx
function Parent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <p>カウント: {count}</p>
      <Child /> {/* count と無関係だが再レンダリングされる */}
    </div>
  );
}

function Child() {
  console.log("Child がレンダリングされました");
  return <p>子コンポーネント</p>;
}
```

`Child` は `count` を使っていないのに、`Parent` が再レンダリングされるたびに一緒にレンダリングされます。

## 従来の最適化手法

React 18 まで、この問題は手動で最適化する必要がありました。

### React.memo

`memo` でラップされたコンポーネントは、props が変化していなければ再レンダリングをスキップします。

```tsx
import { memo } from "react";

const Child = memo(function Child() {
  console.log("Child がレンダリングされました");
  return <p>子コンポーネント</p>;
});
```

### useMemo と useCallback

props にオブジェクトや関数を渡す場合、レンダリングのたびに新しい参照が作られるため、`memo` が効かなくなります。そこで `useMemo`（値のメモ化）と `useCallback`（関数のメモ化）が使われていました。

```tsx
import { useState, useMemo, useCallback, memo } from "react";

const ExpensiveList = memo(function ExpensiveList({
  items,
  onItemClick,
}: {
  items: string[];
  onItemClick: (item: string) => void;
}) {
  console.log("ExpensiveList がレンダリングされました");
  return (
    <ul>
      {items.map((item) => (
        <li key={item}>
          <button onClick={() => onItemClick(item)}>{item}</button>
        </li>
      ))}
    </ul>
  );
});

function App() {
  const [count, setCount] = useState(0);
  const [query, setQuery] = useState("");

  // useMemo: 依存する値が変わらない限り同じ参照を返す
  const filteredItems = useMemo(
    () => allItems.filter((item) => item.includes(query)),
    [query]
  );

  // useCallback: 依存する値が変わらない限り同じ関数参照を返す
  const handleItemClick = useCallback((item: string) => {
    console.log(`${item} がクリックされました`);
  }, []);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>カウント: {count}</button>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <ExpensiveList items={filteredItems} onItemClick={handleItemClick} />
    </div>
  );
}
```

`useMemo` と `useCallback` がないと、`count` が変わっただけでも `filteredItems` と `handleItemClick` の参照が新しくなり、`ExpensiveList` が再レンダリングされてしまいます。

### 従来の手法の問題

この最適化はうまく機能しますが、大きな問題がありました。

- **開発者が判断する必要がある**: どこに `memo` を使い、どこに `useMemo`/`useCallback` を使うか、開発者が常に考える必要がある
- **すべての場所に書かなければ意味がない**: `memo` でラップしても、1つの props に `useMemo`/`useCallback` を付け忘れると効果がない
- **コードが複雑になる**: 本来のロジックに加えて、最適化のためのコードが増える
- **不要な場所にも書きがち**: 実際にはパフォーマンス問題がない場所にも「念のため」と書いてしまう

## React Compiler

React 19 と合わせて **React Compiler** が公開されました。これは、レンダリングの最適化をコンパイラが自動で行う仕組みです。React Compiler は React 19 に自動で含まれるわけではなく、別途セットアップが必要です。

React Compiler v1.0 は 2025 年 10 月に安定版としてリリースされました。導入するには以下のようにインストールします。

```bash
npm install -D babel-plugin-react-compiler
```

Next.js で有効にするには、`next.config.ts` に設定を追加するだけです。

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
};

export default nextConfig;
```

### React Compiler がすること

React Compiler は、ビルド時にコンポーネントのコードを解析し、必要な場所に自動的にメモ化を挿入します。

```tsx
// 開発者が書くコード（最適化を気にしなくてよい）
function App() {
  const [count, setCount] = useState(0);
  const [query, setQuery] = useState("");

  const filteredItems = allItems.filter((item) => item.includes(query));

  function handleItemClick(item: string) {
    console.log(`${item} がクリックされました`);
  }

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>カウント: {count}</button>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <ExpensiveList items={filteredItems} onItemClick={handleItemClick} />
    </div>
  );
}
```

`memo`, `useMemo`, `useCallback` を一切使っていませんが、React Compiler が自動的に最適化します。開発者はビジネスロジックに集中できます。

### React Compiler が機能する条件

React Compiler は、コンポーネントが **React のルール** に従っていることを前提としています。

- **state の不変性を守る**（Day 23 で学んだ）
- **副作用をレンダリング中に実行しない**
- **props を変更しない**

これらのルールは Day 23〜25 ですでに学んだことです。正しく React を書いていれば、React Compiler の恩恵を自動的に受けられます。

## memo/useMemo/useCallback はもう不要？

React Compiler がある環境では、ほとんどの場面で手動のメモ化は不要です。ただし、以下のケースではまだ有用な場合があります。

- React Compiler がまだ導入されていないプロジェクト
- Compiler が最適化できない特殊なパターン

新しいプロジェクトでは React Compiler を前提に、`memo`/`useMemo`/`useCallback` なしでコードを書き始めるのがよいでしょう。パフォーマンスの問題が実際に発生した場合に、Profiler で計測してから対処します。

## React Profiler で確認する

パフォーマンスの問題は推測ではなく計測で判断します。React DevTools の Profiler を使いましょう。

### React DevTools のインストール

ブラウザの拡張機能として React DevTools をインストールします。Chrome、Firefox、Edge で利用可能です。

### Profiler の使い方

1. React DevTools を開き、「Profiler」タブを選択
2. 「Record」ボタンをクリックして記録を開始
3. アプリケーションを操作する
4. 「Stop」ボタンをクリックして記録を停止
5. 各コンポーネントのレンダリング時間と回数が表示される

Profiler では以下の情報が確認できます。

- **Flamegraph**: 各コンポーネントのレンダリング時間を視覚化
- **Ranked**: レンダリング時間が長い順にソート
- **Timeline**: 時系列でのレンダリング推移

### 何を見るべきか

- **レンダリング時間が長いコンポーネント**: 1回のレンダリングに 16ms 以上かかると、60fps を下回る可能性がある
- **不要な再レンダリング**: 灰色で表示されるコンポーネントは再レンダリングをスキップしたもの。色付きのコンポーネントが多すぎないか確認
- **頻繁にレンダリングされるコンポーネント**: 入力のたびにアプリ全体がレンダリングされていないか

### コードで計測する

コンポーネントに `<Profiler>` を使って、レンダリングをコードから計測することもできます。

```tsx
import { Profiler } from "react";

function onRender(
  id: string,
  phase: "mount" | "update" | "nested-update",
  actualDuration: number
) {
  console.log(`${id} の ${phase}: ${actualDuration.toFixed(2)}ms`);
}

function App() {
  return (
    <Profiler id="App" onRender={onRender}>
      <MainContent />
    </Profiler>
  );
}
```

## パフォーマンス最適化の原則

1. **まず正しく書く**: React のルールに従い、読みやすいコードを書く
2. **計測する**: 体感で遅いと感じたら Profiler で計測する
3. **ボトルネックを特定する**: 全体ではなく、遅い部分を特定する
4. **対処する**: state の配置を見直す、コンポーネントを分割する、必要なら `memo` を使う

やってはいけないこと:

- 計測せずに「なんとなく」最適化する
- すべてのコンポーネントに `memo` を付ける
- レンダリング回数だけを気にする（レンダリングは高速なので、回数よりも時間が重要）

## まとめ

- 親が再レンダリングされると子もすべて再レンダリングされる
- 従来は `memo`/`useMemo`/`useCallback` で手動最適化が必要だった
- React Compiler がビルド時に自動でメモ化を挿入するため、手動の最適化はほぼ不要になった
- React Compiler は React のルール（不変性、副作用の分離）に従ったコードを前提とする
- パフォーマンスの問題は推測ではなく、React Profiler で計測して判断する

**次のレッスン**: [Day 31: SPA・CSR・SSR — レンダリング戦略を理解する](/lessons/day31/)
