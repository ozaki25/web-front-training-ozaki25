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

変わったのは「どこに書くか」です。`fetch` に散らばっていた指定が、次のように移ります。

| 従来モデル（`fetch` に書く） | 新モデル（関数に書く） |
|--------------------------|--------------------|
| `next: { revalidate: 3600 }` | `cacheLife("hours")` |
| `next: { tags: ["products"] }` | `cacheTag("products")` |
| `unstable_cache` でラップ | `"use cache"` を先頭に書く |
| 条件がそろえば自動で保存 | `"use cache"` を書いたときだけ保存 |

書く場所が変わっただけではありません。従来モデルは条件がそろえば自動で保存しましたが、新モデルは `"use cache"` を**書いたものだけ**を保存します。書かなければ保存されません。

`cacheLife` には、数字ではなく**プロファイル名**を渡します。名前ごとに「どれくらいの間隔で作り直すか」があらかじめ決まっているので、業務の感覚に近い名前を選ぶだけです。中身の秒数はこうなっています。

| プロファイル | 作り直す間隔 | 期限 | 向いているデータ |
|------------|------------|------|----------------|
| `cacheLife("seconds")` | 1 秒 | 1 分 | 株価・為替レート |
| `cacheLife("minutes")` | 1 分 | 1 時間 | ニュース一覧 |
| `cacheLife("hours")` | 1 時間 | 1 日 | 商品カタログ |
| `cacheLife("days")` | 1 日 | 1 週間 | ブログ記事 |
| `cacheLife("max")` | 30 日 | 1 年 | 会社概要・利用規約 |

「作り直す間隔」はサーバーが裏で作り直す頻度、「期限」はそれを過ぎたら必ず作り直す上限です（どのプロファイルも、クライアントが再確認なしに使える時間は 5 分です）。

プリセットに合わないときは、名前の代わりに秒のオブジェクトを渡して細かく決められます。

```ts
import { cacheLife } from "next/cache";

cacheLife({
  stale: 60, // クライアントが再確認なしに使える時間（秒）
  revalidate: 600, // サーバーが裏で作り直す間隔（秒）
  expire: 3600, // これを過ぎたら必ず作り直す上限（秒）
});
```

まずは名前で選び、既定に合わないときだけオブジェクトを使えば十分です。

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

この `<Suspense>` が必須になることが、従来との一番大きな違いです。同じ「動的なデータがある」状況で、扱いがこう変わります。

- 従来モデル: 動的なデータがあると、ページ全体が動的になるだけでした。`<Suspense>` は任意で、なくてもエラーになりません。
- 新モデル: 静的な土台を先に作り、動的な部分だけを後から流します。だから動的な部分は `<Suspense>` で「ここは後から届く」と印を付ける必要があり、印がないと土台を作れずビルドが通りません。

`<Suspense>` は、静的な土台に動的な穴を開けるための目印だと考えると分かりやすいです。保存しない非同期データは、`<Suspense>` で囲むか `"use cache"` を付けるかの**どちらかが必須**で、従来のように Next.js が自動でどちらかへ倒すことはありません。

この裏返しとして、従来モデルで「このページは毎回最新に」とページ本体に書いていた `connection()`（動的化させる合図）は、新モデルでは要らなくなります。キャッシュしなければその部分は自動で動的になるので、`<Suspense>` で囲むだけで済みます。

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
