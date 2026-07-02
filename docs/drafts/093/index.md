# 動的ルート — URL の一部が変数になる仕組み

## 今日のゴール

- `[id]` フォルダが「URL の変数化」だと知る
- params で値を受け取る流れを知る
- 事前生成（generateStaticParams)と 404 の扱いを知る

## 商品が 1 万件あっても、page.tsx は 1 つ

EC サイトの商品ページの URL は `/products/1`、`/products/2`、…と商品の数だけあります。1 万商品あったら、page.tsx を 1 万個作るのでしょうか。

もちろん作りません。App Router では、**フォルダ名を角括弧で囲む**と、その部分が「何でも受け取る変数」になります。

```
app/
└─ products/
   └─ [id]/          ← この部分が変数になる
      └─ page.tsx    ← 1 つのファイルが全商品ページを担当
```

| アクセスされた URL | page.tsx が受け取る値 |
|------------------|---------------------|
| `/products/1` | `id = "1"` |
| `/products/42` | `id = "42"` |
| `/products/abc` | `id = "abc"`（**文字列なら何でも**入る） |

これが**動的ルート**（dynamic route）です。「URL の構造は同じで、一部だけ違う」ページ群を、1 つのファイルで捌きます。

## params — 変数を受け取る

`[id]` に入った値は、page が props の `params` として受け取ります。Next.js 16 では Promise なので await が必要です。

```tsx
// app/products/[id]/page.tsx
type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: Props) {
  const { id } = await params;

  const res = await fetch(`https://api.example.com/products/${id}`);
  if (!res.ok) throw new Error("商品の取得に失敗しました");
  const product = await res.json();

  return (
    <article>
      <h1>{product.name}</h1>
      <p>¥{product.price.toLocaleString()}</p>
    </article>
  );
}
```

注意点が 1 つ。**params の値は常に文字列**です。`/products/42` の `id` は数値の `42` ではなく文字列の `"42"`。数値として使うなら自分で変換し、変換できない値（`/products/abc`）が来る可能性も考えます。URL は**ユーザーが自由に書き換えられる入力**だからです。

## 存在しない id への備え — notFound()

`/products/99999` のような存在しない商品にアクセスされたら、エラー画面ではなく **404**（見つかりません）を返すのが正しい応答です。

```tsx
import { notFound } from "next/navigation";

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const res = await fetch(`https://api.example.com/products/${id}`);

  if (res.status === 404) {
    notFound(); // not-found.tsx の表示に切り替わる
  }

  const product = await res.json();
  // ...
}
```

`notFound()` を呼ぶと、同じフォルダ（または上位）の `not-found.tsx` が表示されます。「データが無い」はエラー（500 系）ではなく「見つからない」（404）として扱う。検索エンジンへの伝わり方も変わる、地味に大事な区別です。

## 事前生成 — generateStaticParams

動的ルートは標準では「アクセスされたときに作る」動きですが、「**id の一覧は前もって分かっている**」場合があります。ブログの全記事、定番商品など。

`generateStaticParams` を export すると、**ビルド時にその一覧分のページを先に作って**おけます。

```tsx
// ビルド時に全商品の id を列挙して、ページを事前生成する
export async function generateStaticParams() {
  const products = await fetchAllProducts();

  return products.map((product) => ({
    id: String(product.id),
  }));
}
```

事前生成されたページは静的ファイルとして CDN から即配信されるので、アクセス時生成より速くなります。「よくアクセスされる id は事前生成、ロングテールはアクセス時生成」という混合もできます。

## 変数の形いろいろ

角括弧には基本形の他に、2 つの変種があります。名前だけ知っておけば、AI の生成したフォルダ構成が読めます。

| 書き方 | 意味 | 例 |
|--------|------|---|
| `[id]` | 1 区切り分の変数 | `/products/42` |
| `[...slug]` | **複数区切りをまとめて**受け取る | `/docs/guide/setup/install` → `slug = ["guide", "setup", "install"]` |
| `[[...slug]]` | 上に加えて**区切りゼロ（/docs だけ）でも**マッチ | ドキュメントサイトのルートと配下を 1 ファイルで |

## AI のコードを見るポイント

1. **params を await しているか**: Next.js 16 では Promise。await の無い古い形を出してきたら直す
2. **id の検証があるか**: 文字列前提・存在しない id への `notFound()` があるか。「URL はユーザー入力」の意識
3. **一覧が既知なら generateStaticParams を検討したか**: 「この id 一覧はビルド時に分かる？」が速度改善の問い

## まとめ

- `[id]` フォルダで URL の一部が変数になる。1 ファイルで無数のページを捌く
- params は Promise（await）で、値は常に文字列。ユーザー入力として検証する
- 無いものはエラーでなく notFound()。404 と 500 は別物
- 一覧が既知なら generateStaticParams で事前生成して CDN 配信
