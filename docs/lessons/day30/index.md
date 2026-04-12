# Day 30: React のレンダリング最適化

## 今日のゴール

- React のレンダリングの仕組みをもう一度整理する
- React Compiler による自動最適化を知る
- `memo`, `useMemo`, `useCallback` が不要になりつつある背景を知る
- React Profiler でレンダリングを計測できることを知る

## レンダリングの復習

Day 23 で学んだ再レンダリングの仕組みを整理します。

React のレンダリングは3つのステップで行われます。

1. **トリガー**: state の更新、props の変更などでレンダリングが発生
2. **レンダー**: コンポーネント関数を呼び出し、仮想 DOM を作成。前の仮想 DOM と比較して差分を計算する
3. **コミット**: 計算された差分を実際の DOM に反映

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

props にオブジェクトや関数を渡す場合、レンダリングのたびに新しい参照が作られるため、`memo` が効かなくなります。そこで `useMemo`（値のメモ化 = 前に計算した結果を覚えておいて再利用すること）と `useCallback`（関数のメモ化）が使われていました。

```tsx
// useMemo: 依存する値が変わらない限り同じ参照を返す
const filteredItems = useMemo(
  () => allItems.filter((item) => item.includes(query)),
  [query]
);

// useCallback: 依存する値が変わらない限り同じ関数参照を返す
const handleItemClick = useCallback((item: string) => {
  console.log(`${item} がクリックされました`);
}, []);
```

### 従来の手法の問題

この最適化はうまく機能しますが、大きな問題がありました。

- **開発者が判断する必要がある**: どこに `memo` を使い、どこに `useMemo`/`useCallback` を使うか、開発者が常に考える必要がある
- **すべての場所に書かなければ意味がない**: `memo` でラップしても、1つの props に `useMemo`/`useCallback` を付け忘れると効果がない
- **コードが複雑になる**: 本来のロジックに加えて、最適化のためのコードが増える

## React Compiler

React 19 の登場に合わせて開発が進められ、**React Compiler** の安定版が公開されました。レンダリングの最適化をコンパイラが自動で行う仕組みです。

### React Compiler がすること

React Compiler は、ビルド時にコンポーネントのコードを解析し、必要な場所に自動的にメモ化を挿入します。開発者は最適化を意識せずに、シンプルなコードを書くだけでよくなります。

```tsx
// 最適化を気にしなくてよい
function App() {
  const [count, setCount] = useState(0);
  const [query, setQuery] = useState("");

  // memo も useMemo も useCallback も不要
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

このコードには `memo`, `useMemo`, `useCallback` が一切ありませんが、React Compiler が自動的に最適化します。

Next.js では `next.config.ts` に `reactCompiler: true` を追加するだけで有効になります。

### React Compiler が機能する条件

React Compiler は、コンポーネントが **React のルール** に従っていることを前提としています。

- **state の不変性を守る**（Day 23 で学んだ）
- **副作用をレンダリング中に実行しない**
- **props を変更しない**

これらのルールは Day 23〜25 ですでに学んだことです。正しく React を書いていれば、React Compiler の恩恵を自動的に受けられます。

## パフォーマンスの計測

パフォーマンスの問題は推測ではなく計測で判断します。

### React Profiler

React DevTools のブラウザ拡張には **Profiler** タブがあります。Profiler を使うと、各コンポーネントのレンダリング時間と回数を可視化できます。

Profiler が提供する情報:

- **Flamegraph**（炎のような形のグラフ）: 各コンポーネントのレンダリング時間を視覚的に表示
- **Ranked**: レンダリング時間が長い順にソート
- **Timeline**: 時系列でのレンダリング推移

確認すべきポイント:

- **レンダリング時間が長いコンポーネント**: 1回に 16ms 以上かかると 60fps を下回る可能性がある
- **不要な再レンダリング**: 灰色（スキップ）のコンポーネントが少なすぎないか
- **頻繁なレンダリング**: 入力のたびにアプリ全体がレンダリングされていないか

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
