# Day 24: React Compiler — 手動メモ化からの解放

## 今日のゴール

- 手動メモ化（useMemo / useCallback / React.memo）の負担を知る
- React Compiler がビルド時に自動でメモ化する仕組みを知る
- Next.js での有効化方法を知る

## 手動メモ化という負担

React は状態が変わるとコンポーネント関数を再実行（再レンダリング）し、親が再レンダリングされると子も連鎖して再レンダリングされます。そのままでは無駄な再計算が起きるため、開発者は**メモ化**（前回の結果を覚えておき、同じ入力なら再計算をスキップすること）を手で書いてきました。

```tsx
import { useState, useMemo, useCallback } from "react";

type Product = { id: number; name: string; price: number };

function ProductPage({ items }: { items: Product[] }) {
  const [query, setQuery] = useState("");

  // items が変わったときだけソートし直す
  const sorted = useMemo(
    () => items.toSorted((a, b) => a.price - b.price),
    [items],
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
        {sorted.map(item => (
          <li key={item.id}>{item.name}: ¥{item.price}</li>
        ))}
      </ul>
    </>
  );
}
```

この手動メモ化には、考えることが多すぎるという問題があります。

- **依存配列のミス**: `useMemo` の第 2 引数に入れ忘れると、古いデータが表示され続けるバグになる
- **書き忘れ**: 書かなくても動くので、遅くなって初めて発覚する
- **組み合わせの理解**: `useCallback` は `React.memo`（props が前回と同じなら子の再レンダリングをスキップする API）と組み合わせて初めて効く、のような関係を正しく押さえる必要がある
- **コードの複雑化**: `useMemo` と `useCallback` が 5 個も 6 個も並ぶと、本来のロジックが埋もれる

実は先ほどのコード例の `useCallback` も、渡す先がただの `<button>` 要素なので効いていません。手動メモ化を正しく書き続けるのは、それくらい間違えやすい作業です。

「どこをメモ化すべきか」を人間が判断し続けるのは無理がある。これを解決するのが React Compiler です。

## React Compiler による自動メモ化

React Compiler は、ビルド時にコードを解析して必要なメモ化を自動で挿入するコンパイラです。

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

手動では「ここをメモ化すべきか」「組み合わせは正しいか」を開発者が判断していましたが、コンパイラはコード全体のデータフローを見て機械的に判断します。漏れもなく、依存配列のミスも起きません。

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

## Next.js での有効化

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

段階的に導入したい場合は、設定を `{ compilationMode: "annotation" }` にすると、関数の先頭に `"use memo"` という目印（ディレクティブ）を書いたコンポーネントだけがコンパイル対象になります。

### 既存コードとの互換性

- 既存の `useMemo` / `useCallback` / `React.memo` はそのまま残してよい
- コンパイラが既存のメモ化を認識するため、二重に無駄なメモ化が走ることはない
- 新しく書くコードでは手動メモ化が不要になる、というだけ

## まとめ

- React Compiler はビルド時にデータフローを解析し、必要なメモ化を自動で挿入する
- 純粋なコンポーネントが前提。違反は検出されてスキップされる
- Next.js ではプラグイン追加と `reactCompiler: true` で有効化できる
