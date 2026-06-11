# React Compiler — 手動メモ化からの解放

## 今日のゴール

- 再レンダリングで不要な再計算が起きる仕組みを知る
- useMemo / useCallback / React.memo による手動メモ化と、その負担を知る
- React Compiler がビルド時に自動メモ化する仕組みを知る

## AI が書いたコードに並ぶ useMemo と useCallback

AI に React のコードを書かせると、こんなコードが返ってくることがあります。

```tsx
import { useState, useMemo, useCallback } from "react";

type Product = { id: number; name: string; price: number };

function ProductPage({ items }: { items: Product[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => items.filter(item => item.name.includes(query)),
    [items, query],
  );

  const handleReset = useCallback(() => setQuery(""), []);

  return (
    <>
      <input
        aria-label="商品名で絞り込み"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <button onClick={handleReset}>クリア</button>
      <ul>
        {filtered.map(item => (
          <li key={item.id}>{item.name}: ¥{item.price}</li>
        ))}
      </ul>
    </>
  );
}
```

`useMemo` や `useCallback` が何をしているのかよくわからないまま、「AI が書いたからそのまま」にしていないでしょうか。これらはすべて**メモ化**（前回の計算結果を覚えておき、同じ入力なら再計算をスキップすること）のための API です。

なぜメモ化が必要なのか。React の再レンダリングの仕組みに理由があります。

## 再レンダリングの連鎖

React のコンポーネントの実体は関数です。React は状態（state）が変わるとコンポーネント関数を再実行して、新しい画面を組み立てます。この再実行を**再レンダリング**と呼びます。

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

`count` が変わると `App` が再レンダリングされます。問題は `<HeavyList />`。`count` とは無関係なのに、親である `App` が再レンダリングされるたびに一緒に再レンダリングされます。

親が再レンダリングされると、子も全部再レンダリングされる。これが**再レンダリングの連鎖**です。

なお、React には「画面の変わった部分だけを最小限更新する」仕組みがあるため、最終的な画面の書き換え自体は軽く済みます。それでも、コンポーネント関数の再実行と「どこが変わったか」の計算にはコストがかかります。コンポーネントが多く、中の処理が重いほど、この無駄は積み上がります。

## 不要な再計算の 2 つの場面

再レンダリングの連鎖で無駄が起きる代表的な場面は 2 つです。

### 重い計算の繰り返し

```tsx
import { useState } from "react";

type Product = { id: number; name: string; price: number };

function ProductPage({ items }: { items: Product[] }) {
  const [query, setQuery] = useState("");

  // query が変わるだけで、items のソートも毎回やり直しになる
  const sorted = items.toSorted((a, b) => a.price - b.price);

  return (
    <>
      <input
        aria-label="商品名で絞り込み"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <ul>
        {sorted.map(item => (
          <li key={item.id}>{item.name}: ¥{item.price}</li>
        ))}
      </ul>
    </>
  );
}
```

入力欄に 1 文字打つたびに `query` が変わって再レンダリングされ、変わっていない `items` のソートまで毎回実行されます。商品が数千件あれば、1 文字打つたびに数千件のソートです。

### 無関係な子コンポーネントの再レンダリング

先ほどの `App` の例がこれです。`count` が変わっただけなのに、無関係な `<HeavyList />` まで再レンダリングされます。

## 手動メモ化の 3 つの API

React はこの無駄を抑えるために、3 つのメモ化 API を用意していました。

| API | 用途 | やること |
|-----|------|---------|
| `useMemo` | 計算結果のキャッシュ | 依存配列が変わらなければ前回の値を返す |
| `useCallback` | 関数のキャッシュ | 依存配列が変わらなければ前回の関数を返す |
| `React.memo` | コンポーネントのキャッシュ | props が変わらなければ再レンダリングをスキップ |

### useMemo: 重い計算をキャッシュ

第 2 引数の配列（**依存配列**）に「この値が変わったら再計算する」という条件を指定します。

```tsx
import { useState, useMemo } from "react";

type Product = { id: number; name: string; price: number };

function ProductPage({ items }: { items: Product[] }) {
  const [query, setQuery] = useState("");

  // items が変わったときだけソートし直す。query の変化では再計算しない
  const sorted = useMemo(
    () => items.toSorted((a, b) => a.price - b.price),
    [items],
  );

  return (
    <>
      <input
        aria-label="商品名で絞り込み"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <ul>
        {sorted.map(item => (
          <li key={item.id}>{item.name}: ¥{item.price}</li>
        ))}
      </ul>
    </>
  );
}
```

### React.memo: 子の再レンダリングをスキップ

コンポーネントを `memo` で包むと、親が再レンダリングされても「props（親から渡される値）が前回と同じなら、自分の再レンダリングをスキップする」ようになります。

```tsx
import { useState, memo } from "react";

// props の items が前回と同じなら再レンダリングしない
const HeavyList = memo(function HeavyList({ items }: { items: string[] }) {
  return (
    <ul>
      {items.map(item => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
});

function App({ items }: { items: string[] }) {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <p>{count}</p>
      <HeavyList items={items} />
    </div>
  );
}
```

これで `count` が変わっても `HeavyList` は再レンダリングされなくなります。

### useCallback: React.memo を関数で壊さないため

`React.memo` には落とし穴があります。props に関数を渡すと、メモ化が効かなくなるのです。

```tsx
function App({ items }: { items: string[] }) {
  const [count, setCount] = useState(0);

  // 再レンダリングのたびに「新しい関数」が作られる
  const handleSelect = (id: string) => {
    console.log(id);
  };

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <HeavyList items={items} onSelect={handleSelect} />
    </div>
  );
}
```

（`HeavyList` は先ほどの `memo` 版に、`onSelect` という関数の props を追加したものとします）

JavaScript では、関数は作るたびに別のオブジェクトになります。中身が同じでも `前回の handleSelect === 今回の handleSelect` は `false` です。`React.memo` は props を前回と比較して判断するので、「props が変わった」と見なされ、メモ化が無効になります。

これを防ぐのが `useCallback` です。依存配列が変わらない限り、前回と同じ関数を返し続けます。

```tsx
const handleSelect = useCallback((id: string) => {
  console.log(id);
}, []);
```

つまり `useCallback` は単体で再レンダリングを減らすものではなく、**`React.memo` とセットで初めて効果が出ます**。この関係を知らずに `useCallback` だけ書いても、何も速くなりません。

### 手動メモ化の負担

ここまでで気づいたと思いますが、手動メモ化は考えることが多すぎます。

- **依存配列のミス**: 入れ忘れると古いデータが表示され続けるバグになる

```tsx
const sorted = useMemo(
  () => items.toSorted((a, b) => a.price - b.price),
  [], // バグ: items を入れ忘れ。items が変わっても再計算されない
);
```

- **書き忘れ**: メモ化は「書かなくても動く」ので、忘れても気づきにくい。遅くなって初めて発覚する
- **組み合わせの理解**: `useCallback` は `React.memo` とセットでないと無意味、のような関係を正しく押さえる必要がある
- **コードの複雑化**: `useMemo` と `useCallback` が 5 個も 6 個も並ぶと、本来のロジックが埋もれる

実は冒頭の AI のコードの `useCallback` も、渡す先がただの `<button>` 要素なので効いていません。AI はそれっぽくメモ化を書きますが、正しく効いているとは限らない。それを見抜くにも、この組み合わせの知識が必要です。

## React Compiler による自動メモ化

React Compiler はこの負担を根本から解決します。ビルド時にコードを解析して、必要なメモ化を自動で挿入するコンパイラです。

開発者はメモ化を意識せず、シンプルなコードを書くだけです。

```tsx
type Product = { id: number; name: string; price: number };

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

手動では「ここをメモ化すべきか」「memo と useCallback の組み合わせは正しいか」を開発者が判断していましたが、コンパイラはコード全体のデータフローを見て機械的に判断します。漏れもなく、依存配列のミスも起きません。

### 純粋なコンポーネントであることが前提

React Compiler は、コンポーネントが**純粋**（同じ入力なら同じ結果を返す）であることを前提に最適化します。

```tsx
// ✅ 純粋: 同じ name なら同じ結果
function Greeting({ name }: { name: string }) {
  return <h1>こんにちは、{name}さん</h1>;
}
```

```tsx
// ❌ 不純: レンダリングのたびに結果が変わる
let callCount = 0;
function Greeting({ name }: { name: string }) {
  callCount++; // レンダリング中に外部の変数を変更している
  return <h1>こんにちは、{name}さん（{callCount}回目）</h1>;
}
```

この「純粋であること」のルールに違反していると検出されたコンポーネントは、コンパイラが自動でスキップし、残りのコンポーネントは正常にコンパイルされます。違反が 1 つあってもコンパイル全体は止まりません。

### Next.js での有効化

Next.js では、プラグインをインストールして設定を 1 行追加すれば有効になります。

```bash
npm install -D babel-plugin-react-compiler
```

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
};

export default nextConfig;
```

段階的に導入したい場合は、アノテーションモードを使います。先頭に `"use memo"` という目印（ディレクティブ）を書いたファイルだけがコンパイル対象になります。

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

React Compiler を有効にするとき、既存の手動メモ化はどう扱われるか。

- 既存の `useMemo` / `useCallback` / `React.memo` はそのまま残してよい
- コンパイラが既存のメモ化を認識するため、二重に無駄なメモ化が走ることはない
- 新しく書くコードでは手動メモ化が不要になる、というだけ

## まとめ

- 再レンダリングの連鎖による不要な再計算を、手動メモ化（`useMemo` / `useCallback` / `React.memo`）で防いできた
- React Compiler はビルド時にデータフローを解析し、必要なメモ化を自動で挿入する
- Next.js ではプラグイン追加と `reactCompiler: true` で有効化できる
