# キャッシュの新モデル — 4 つのキャッシュがどう変わるか

## 今日のゴール

- 新モデルにしても、4 つのキャッシュのうち 2 つはそのままだと分かる
- 残る 2 つ（データと HTML の保存）が `"use cache"` にまとまると分かる
- 消し方（revalidate 系）は変わらないと分かる

::: info このレッスンの前提（新モデル）
`next.config.ts` に `cacheComponents: true` を書いて有効にする新モデルの話です（有効化は任意）。4 つのキャッシュ（Request Memoization / Data Cache / Full Route Cache / Router Cache）を知っている前提で、その差分だけを見ます。
:::

## 変わるのは 4 つのうち 2 つ

| キャッシュ | 置き場所 | 新モデルでどうなる |
|-----------|---------|------------------|
| Request Memoization | サーバー（1 リクエスト内） | 変わらない |
| Router Cache | ブラウザ | 変わらない |
| Data Cache | サーバー | `"use cache"` で明示的に保存する形に |
| Full Route Cache | サーバー | 自動の静的化がなくなり、`"use cache"` を付けた所だけ保存 |

つまり、変わるのは**サーバー側の 2 つ（Data Cache と Full Route Cache）の使い方**で、ブラウザ側と重複排除はそのままです。変わる 2 つも、やることは 1 つに集約されます。それが `"use cache"` です。

## 変わらない 2 つ

- **Request Memoization**: 1 回のレンダリング中に同じ取得をまとめる React 側の仕組み。モデルとは無関係で、そのまま働きます。
- **Router Cache**: ブラウザが画面遷移用に持つキャッシュ。これも新旧で同じです。

この 2 つは、これまで学んだとおりに考えて構いません。

## Data Cache — 「自動で保存」から「use cache で保存」へ

従来モデルでは、`fetch` のオプションで Data Cache を操作していました。鮮度もタグも `fetch` に書きます。

```ts
// 従来モデル
export async function getProducts() {
  const res = await fetch("https://api.example.com/products", {
    next: { revalidate: 3600, tags: ["products"] }, // 鮮度とタグを fetch に付ける
  });
  return res.json();
}
```

新モデルでは、`fetch` のオプションではなく、関数に `"use cache"` を付けて保存します。鮮度は `cacheLife`、タグは `cacheTag` に移ります。

```ts
// 新モデル
import { cacheLife, cacheTag } from "next/cache";

export async function getProducts() {
  "use cache"; // ← この結果を保存する、という宣言
  cacheLife("hours"); // 鮮度（従来の revalidate にあたる）
  cacheTag("products"); // タグ（従来の next.tags にあたる）

  const res = await fetch("https://api.example.com/products");
  return res.json();
}
```

変わったのは「どこに書くか」です。`fetch` の `next.revalidate` / `next.tags` や `unstable_cache` に散らばっていた指定が、`"use cache"` と `cacheLife` と `cacheTag` にまとまりました。

書く場所が変わっただけではありません。従来モデルは条件がそろえば自動で保存しましたが、新モデルは `"use cache"` を**書いたものだけ**を保存します。書かなければ保存されません。

`cacheLife` には、数字ではなく**プロファイル名**を渡します。`seconds` / `minutes` / `hours` / `days` / `max` といった名前は、それぞれ「どれくらい保つか」があらかじめ決められたプリセットです。数字を書かず、業務の感覚に近い名前で選びます。

| データの例 | 宣言 |
|-----------|------|
| 株価・為替レート | `cacheLife("seconds")` |
| 商品カタログ | `cacheLife("hours")` |
| ブログ記事 | `cacheLife("days")` |
| 会社概要・利用規約 | `cacheLife("max")` |

秒数できっちり決めたいときは `cacheLife({ stale, revalidate, expire })` のようにオブジェクトも渡せますが、まずは名前で選べば十分です。

## Full Route Cache — 「全ページ自動静的化」から「部品ごと」へ

従来モデルでは、ページが静的なら Next.js が自動で HTML を保存しました。これが Full Route Cache です。ただしページ単位で、1 か所でも動的な部分があるとページ全体が動的になり、保存されませんでした。

新モデルでは、この自動の静的化がなくなります。代わりに、保存したい部分に `"use cache"` を付け、動的な部分は `<Suspense>` で囲みます。**1 枚のページの中で、静的な部分と動的な部分が同居できます**。

```tsx
// 新モデル：商品説明は保存、在庫数は毎回取得
import { Suspense } from "react";

export default function ProductPage() {
  return (
    <main>
      <ProductDescription /> {/* "use cache" 付き → 保存してすぐ表示 */}
      <Suspense fallback={<p aria-busy="true">在庫を確認中…</p>}>
        <StockCount /> {/* キャッシュしない → アクセスごとに取得して後から表示 */}
      </Suspense>
    </main>
  );
}
```

`ProductDescription` の中で `"use cache"` を使えば、その部分は保存されます。`StockCount` は囲まないので毎回取得され、`<Suspense>` の仮表示が先に出ます。

従来モデルなら、在庫数を最新にするにはページを動的にするしかなく、商品説明まで毎回作り直していました。新モデルは、商品説明は保存したまま、在庫数だけを動的にできます。これが「ページ単位から部品単位へ」の中身です。

保存しない非同期データは、`<Suspense>` で囲むか `"use cache"` を付けるかの**どちらかが必須**です。どちらもないとビルドが通りません。従来モデルのように Next.js が勝手にどちらかへ倒すのではなく、開発者がその場で決めます。

## 消し方は変わらない

保存したものを作り直す API は、両モデルで同じです。

- `revalidateTag` … タグを起点に無効化
- `revalidatePath` … パスを起点に無効化
- `router.refresh` … ブラウザ側だけ取り直し

取得側で `next.tags` の代わりに `cacheTag` を使うようになっても、`revalidateTag("products", "max")` で消すことは変わりません。変わるのは「取得側でどう保存を宣言するか」だけで、消し方は**そのまま**です。

## まとめ

- 4 つのうち Request Memoization と Router Cache はそのまま
- Data Cache と Full Route Cache の役割は `"use cache"` にまとまる（自動から明示へ）
- 保存しない非同期データは `<Suspense>` か `"use cache"` で必ず囲む
- 消し方（revalidate 系）は両モデル共通
