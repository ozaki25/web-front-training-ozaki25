# コンポーネントの責務分割 — AI の 300 行をどう分けるか

## 今日のゴール

- 「1 ファイル 300 行」が何を困らせるのか言葉にできるようになる
- 「見た目」と「ロジック」で分ける基本パターンを知る
- 分割の判断に使える 2 つの問いを持つ

## 1 ファイル 300 行のコンポーネント

AI に「商品検索ページを作って」と頼むと、動くコードが 1 ファイルにまとまって返ってきます。

```tsx
export default function ProductSearchPage() {
  // 10 行の state 群
  // 30 行のデータ取得と加工
  // 15 行のイベントハンドラ
  // 20 行のフィルタロジック
  // 200 行の JSX（検索バー + フィルタ + 一覧 + ページネーション + 空表示）
  // ↑ 合計 275 行
}
```

動きます。でも、「検索バーの見た目を変えたい」とき、275 行のどこを見ればいいでしょうか。「フィルタのロジックにバグがある」とき、原因を探す範囲は？ **すべてが 1 つの関数に入っていると、あらゆる変更であらゆる行を気にする必要があります**。

分割とは、「**この変更は、この範囲だけ見ればいい**」という安心をつくる作業です。

## 最初の軸 — 見た目とロジックを分ける

いちばん汎用的な分割の軸は、**見た目**（UI）と**ロジック**（データの加工・取得・状態管理）の分離です。

### 分割前

```tsx
"use client";
import { useState } from "react";

export function ProductSearch() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  const filtered = products.filter((p) => p.name.includes(query));

  return (
    <div>
      <input
        aria-label="商品名で検索"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <p>{filtered.length} 件</p>
      <ul>
        {filtered.map((p) => (
          <li key={p.id}>
            <h3>{p.name}</h3>
            <p>¥{p.price.toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 分割後 — 見た目の部品を切り出す

```tsx
// product-card.tsx — 見た目だけを担当する部品
type ProductCardProps = { name: string; price: number };

export function ProductCard({ name, price }: ProductCardProps) {
  return (
    <li>
      <h3>{name}</h3>
      <p>¥{price.toLocaleString()}</p>
    </li>
  );
}
```

```tsx
// product-search.tsx — ロジック + 組み立て
"use client";
import { useState } from "react";
import { ProductCard } from "./product-card";

export function ProductSearch() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  const filtered = products.filter((p) => p.name.includes(query));

  return (
    <div>
      <input
        aria-label="商品名で検索"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <p>{filtered.length} 件</p>
      <ul>
        {filtered.map((p) => (
          <ProductCard key={p.id} name={p.name} price={p.price} />
        ))}
      </ul>
    </div>
  );
}
```

`ProductCard` はロジックを一切持たず、props を受けて表示するだけ。だから「カードの見た目を変えたい」ときは `product-card.tsx` だけ開けばよく、他の行を気にしなくて済みます。

ロジックが太くなったら、**カスタムフック**に切り出すのが次の一手です。`useProductSearch()` のような関数にすれば、検索 → フィルタ → 状態管理の流れを 1 か所にまとめつつ、コンポーネントは「呼んで表示するだけ」になります。

## 判断の 2 つの問い

「ここを分けるべきか」の判断は、2 つの問いで大抵決まります。

### 1. 別の場所でも使うか？

`ProductCard` が一覧ページにもお気に入りページにも出るなら、分割する価値があります。逆に、この場所でしか使わないなら、無理に分けると「部品の数が増えて全体像が追いにくい」デメリットが勝つこともあります。

### 2. 変わる理由が違うか？

商品カードの見た目を変える理由（デザインの刷新）と、検索ロジックを変える理由（検索アルゴリズムの改善）は**別の人が別のタイミングで**行います。変わる理由が違うものが 1 つのファイルにあると、一方を直すたびに他方を壊すリスクが生まれます。理由が違えば、分ける値打ちがあります。

## 分けすぎの害もある

AI に「コンポーネントを分割して」と頼むと、3 行のボタンまで別ファイルにすることがあります。

- 部品が細かすぎると、**1 つの機能を追うのにファイルを 10 個開く**ことになる
- 名前を付ける手間（`SubmitButtonWrapper` のような苦し紛れの命名）が増える
- ファイル間の依存が増え、1 つの変更で複数ファイルの修正が発生する

**3 行のコードを 3 ファイルに分けるのは、分割ではなく散乱**です。分割の効果（変更範囲の限定・再利用）が明確に感じられるときだけ分ける。感じられないなら、素直に 1 ファイルに書いたほうが読みやすいです。

## まとめ

- 分割は「この変更はこの範囲だけ見ればいい」という安心をつくる作業
- 最初の軸は見た目（UI 部品）とロジック（カスタムフック）の分離
- 「別の場所でも使うか」「変わる理由が違うか」の 2 つの問いで判断する
- 分けすぎは散乱で、効果が感じられないなら 1 ファイルのほうが読みやすい
