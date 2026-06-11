# 再レンダリングと手動メモ化 — useMemo / useCallback / React.memo

## 今日のゴール

- 再レンダリングの連鎖で不要な再計算が起きる仕組みを知る
- useMemo / useCallback / React.memo の役割の違いを知る
- useCallback は React.memo とセットで効くという関係を知る

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

頼んでいないのに、`useMemo` や `useCallback` が当たり前のように差し込まれてきます。これらはすべて**メモ化**（前回の計算結果を覚えておき、同じ入力なら再計算をスキップすること）のための API です。AI が勝手に入れてくるくらい React では定番の道具ですが、何をしているのか説明できる人は意外と少ないものです。

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
      {/* HeavyList は重い処理をする一覧コンポーネントとする */}
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

React はこの無駄を抑えるために、3 つのメモ化 API を用意しています。表の中の **props** は、親から子コンポーネントに渡される値のことです。

| API | 用途 | やること |
|-----|------|---------|
| `useMemo` | 計算結果のキャッシュ | 依存配列が変わらなければ前回の値を返す |
| `useCallback` | 関数のキャッシュ | 依存配列が変わらなければ前回の関数を返す |
| `React.memo` | コンポーネントのキャッシュ | props が変わらなければ再レンダリングをスキップ |

### useMemo: 重い計算をキャッシュ

第 2 引数の配列（**依存配列**）に「この値が変わったら再計算する」という条件を指定します。先ほどのソートの例なら、こう変わります。

```tsx
// items が変わったときだけソートし直す。query の変化では再計算しない
const sorted = useMemo(
  () => items.toSorted((a, b) => a.price - b.price),
  [items],
);
```

これで入力欄に文字を打っても、ソートは再実行されなくなります。

### React.memo: 子の再レンダリングをスキップ

コンポーネントを `memo` で包むと、親が再レンダリングされても「props が前回と同じなら、自分の再レンダリングをスキップする」ようになります。

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

## AI のコードを見る目

冒頭の AI のコードに戻ります。`handleReset` の `useCallback`、効いているでしょうか。

渡す先はただの `<button>` 要素で、`memo` されたコンポーネントではありません。つまりこの `useCallback` は**効いていません**。AI はそれっぽくメモ化を書きますが、正しく効いているとは限らない。それを見抜けるのが、今日の知識です。

AI のコードにメモ化が出てきたら、この 3 つを疑ってみてください。

- **依存配列は正しいか**: 入れ忘れがあると、古いデータが表示され続けるバグになる
- **必要な場所に入っているか**: メモ化は書かなくても動くので、抜けていても見た目ではわからない
- **組み合わせは正しいか**: `useCallback` は `React.memo` とセットでないと無意味

完璧なメモ化を自分で書ける必要はありません。「これ、効いてる？」と疑える目があるだけで、AI への指示も成果物の見方も変わります。

## まとめ

- 親の再レンダリングは子に連鎖し、不要な再計算を生む
- `useMemo` は計算、`useCallback` は関数、`React.memo` はコンポーネントのキャッシュ
- `useCallback` は `React.memo` とセットで初めて効く
