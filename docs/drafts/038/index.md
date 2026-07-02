# キャッシュの新モデル — 隠れていた判断を自分で決める

## 今日のゴール

- 従来モデルの「暗黙の判定」と「ページ単位」が何を困らせていたか分かる
- 新モデルが開発者に渡す 4 つの判断を知る
- その判断を表す語彙（use cache / cacheLife / cacheTag / Suspense）を読める

::: info このレッスンの前提（新モデル）
ここで扱うのは `next.config.ts` に `cacheComponents: true` を書いて有効にする新モデルです（有効化は任意）。従来モデルのキャッシュを先に知っていると対比しやすくなります。
:::

## 従来モデルで困っていたこと

従来モデルのキャッシュには、実務で繰り返しぶつかる困りごとがあります。

### 判断が暗黙

従来モデルでは、ページを静的にするか動的にするかを **Next.js が条件から推定**していました。`fetch` のオプション、`cookies()` の有無、キャッシュ指定の有無などを見て「このページは静的化できる／できない」を Next.js が判定します。

この判定はコードに書いてありません。だから起きるのが：

- 「キャッシュしたつもりがない `fetch` が、なぜか結果を返し続ける」
- 「何もしていないのに、ページが勝手に動的になった」

原因を調べると、**Next.js がどう判定したかを推測する作業**になります。バージョンで既定が変わることもあり、「前は動いていたのに」が起きやすい構造でした。

### 判断がページ単位

もう 1 つ困るのは、**レンダリング方式がページに 1 つしか選べない**ことです。

商品ページを例にします。

- ヘッダーや商品説明：誰が見ても同じ。めったに変わらない
- 在庫数：今この瞬間の値がほしい

従来モデルでは、在庫数のためにキャッシュ指定なしの `fetch` が 1 本あるだけで、**ページ全体が動的になってしまいます**。ヘッダーも商品説明も毎回作り直され、1 つの動的な部分のためにページ全体の速さを諦めることになります。

## 新モデルが変えたこと

新モデルは、この 2 つをひっくり返します。

- **暗黙 → 明示**：Next.js が推定するのではなく、開発者が `"use cache"` と書いたものだけがキャッシュされる。書かなければキャッシュされない
- **ページ単位 → コンポーネント単位**：1 枚のページの中で、部品ごとに「キャッシュする／しない」を分けられる。静的な部分と動的な部分を同じページに同居させられる

従来モデルで知っていることが、新モデルの何に置き換わるかを並べると次のとおりです。

| 観点 | 従来モデル（false） | 新モデル（true） |
|------|-------------------|----------------|
| 静的/動的の判定 | Next.js が暗黙に推定 | `"use cache"` で明示（書かなければキャッシュしない） |
| キャッシュの書き方 | `fetch` オプション・`unstable_cache`・自動静的化 | `"use cache"` に統一 |
| 鮮度 | `fetch` の `next.revalidate` | `cacheLife` |
| タグ付け | `fetch` の `next.tags` | `cacheTag` |
| 動的にする部分 | 1 つでもあるとページ全体が動的 | `<Suspense>` で部分ごとに |

無効化の呼び出し（`revalidateTag` / `revalidatePath`）は両モデルで共通です。変わるのは「取得側でどう宣言するか」で、消し方は変わりません。

## 開発者が下す 4 つの判断

この「明示」と「コンポーネント単位」の結果として、新モデルでは非同期データを扱うたびに 4 つの判断を自分で下します。従来は Next.js が暗黙にやっていた判断を、自分で決める形です。

### 1. この結果はキャッシュしてよいか

関数やコンポーネントの先頭に `"use cache"` を書くと、その結果がキャッシュされます。書かなければキャッシュされません。

```ts
import { cacheLife } from "next/cache";

export async function getProducts() {
  "use cache"; // ← この結果は使い回してよい、という判断
  cacheLife("hours");

  const res = await fetch("https://api.example.com/products");
  if (!res.ok) throw new Error("取得に失敗しました");
  return res.json();
}
```

`"use cache"` は `"use client"` や `"use server"` と同じ形のディレクティブ（先頭に書く目印）です。関数に書けば**戻り値**が、コンポーネントに書けば**描画結果**がキャッシュされます。

従来は取得手段ごとに書き方が分かれていましたが（`fetch` のオプション、`unstable_cache`、自動静的化）、この 1 つに統一されました。

### 2. どれくらい新鮮であるべきか

`cacheLife()` で鮮度を宣言します。

| データの例 | 宣言 |
|-----------|------|
| 株価・在庫数 | `cacheLife("seconds")` |
| ニュース一覧 | `cacheLife("minutes")` |
| 商品カタログ | `cacheLife("hours")` |
| ブログ記事 | `cacheLife("days")` |
| 会社概要・利用規約 | `cacheLife("max")` |

ミリ秒ではなく**業務の言葉**で書きます。「在庫は秒単位で正確であってほしい」「会社概要は日単位でいい」が、そのままコードになります。

### 3. 変わったとき誰が消すか

`cacheTag` でタグを付けておき、データを変えた側から消します。

```ts
import { cacheLife, cacheTag } from "next/cache";

export async function getProducts() {
  "use cache";
  cacheLife("hours");
  cacheTag("products"); // タグを付ける
  // ...
}
```

消す関数は 2 つあります。

| 関数 | 動き | 場面 |
|------|------|------|
| `updateTag("products")` | すぐ消し、新しい結果を待つ | 管理画面で編集 → 自分にすぐ反映 |
| `revalidateTag("products", "max")` | 古い結果を返しつつ裏で作り直す | 不特定多数が見るページ |

`updateTag` は、フォーム送信などを処理する Server Action（サーバー側で動く関数）の中だけで使えます。

取得側にタグを付けたのに、更新側で消し忘れるパターンはよくあります。「このデータ、更新したら**誰がキャッシュを消すの？**」がレビューの一言になります。

### 4. キャッシュしない部分は、待つ間に何を見せるか

キャッシュしない非同期データ（在庫数など）は、`<Suspense>` で囲んで「待っている間の仮表示」を宣言します。

```tsx
import { Suspense } from "react";

export default function ProductPage() {
  return (
    <main>
      <ProductDescription /> {/* use cache で静的化 → すぐ表示 */}
      <Suspense fallback={<p>在庫を確認中…</p>}>
        <StockCount /> {/* キャッシュしない → 後から届く */}
      </Suspense>
    </main>
  );
}
```

これが「ページ単位 → コンポーネント単位」の具体です。同じページの中で、静的な土台はすぐ返し、動的な部分だけ後から流します。

新モデルでは、非同期データは `"use cache"` で**キャッシュする**か、`<Suspense>` で**後から流す**かの**どちらかを必ず宣言**します。どちらも書かないとビルドが通りません。Next.js が暗黙に決めるのではなく、ここでも判断は開発者の手元にあります。

## 4 つの判断の全体像

<svg viewBox="0 0 600 320" role="img" aria-label="非同期データを扱うときの判断フロー。キャッシュしてよいなら use cache を付け、鮮度を cacheLife、誰が消すかを cacheTag で決める。キャッシュしないなら Suspense で囲んで待つ間の表示を決める。" style="width:100%;height:auto;max-width:600px;display:block;margin:16px auto;">
  <defs>
    <marker id="d038-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker>
  </defs>
  <rect x="0" y="0" width="600" height="320" rx="10" fill="#f8fafc"/>

  <rect x="215" y="16" width="170" height="38" rx="8" fill="#e2e8f0" stroke="#94a3b8"/>
  <text x="300" y="40" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#1e293b">非同期データを扱う</text>

  <line x1="300" y1="54" x2="300" y2="70" stroke="#64748b" stroke-width="2" marker-end="url(#d038-arrow)"/>

  <polygon points="300,72 380,110 300,148 220,110" fill="#fef9c3" stroke="#eab308" stroke-width="1.5"/>
  <text x="300" y="106" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#1e293b">キャッシュ</text>
  <text x="300" y="122" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#1e293b">してよい？</text>

  <line x1="248" y1="137" x2="152" y2="174" stroke="#64748b" stroke-width="2" marker-end="url(#d038-arrow)"/>
  <text x="182" y="150" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">はい</text>
  <line x1="352" y1="137" x2="458" y2="174" stroke="#64748b" stroke-width="2" marker-end="url(#d038-arrow)"/>
  <text x="418" y="150" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">いいえ</text>

  <rect x="55" y="176" width="190" height="42" rx="8" fill="#dcfce7" stroke="#22c55e"/>
  <text x="150" y="202" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#1e293b">"use cache" でキャッシュ</text>

  <line x1="110" y1="218" x2="92" y2="252" stroke="#64748b" stroke-width="2" marker-end="url(#d038-arrow)"/>
  <line x1="190" y1="218" x2="212" y2="252" stroke="#64748b" stroke-width="2" marker-end="url(#d038-arrow)"/>

  <rect x="20" y="254" width="140" height="48" rx="8" fill="#dcfce7" stroke="#22c55e"/>
  <text x="90" y="276" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#1e293b">cacheLife</text>
  <text x="90" y="292" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">鮮度</text>

  <rect x="172" y="254" width="150" height="48" rx="8" fill="#dcfce7" stroke="#22c55e"/>
  <text x="247" y="276" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#1e293b">cacheTag</text>
  <text x="247" y="292" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">誰が消す</text>

  <rect x="370" y="176" width="210" height="48" rx="8" fill="#dbeafe" stroke="#3b82f6"/>
  <text x="475" y="198" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#1e293b">Suspense で後から流す</text>
  <text x="475" y="214" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">待つ間の表示</text>
</svg>

## まとめ

- 従来モデルは判断が暗黙かつページ単位 → 「なぜキャッシュされた」「全体が動的になる」が起きる
- 新モデルは判断を明示的に、コンポーネント単位で開発者に渡す
- 渡される判断は 4 つ：キャッシュするか / 鮮度 / 誰が消すか / 待つ間に何を見せるか
