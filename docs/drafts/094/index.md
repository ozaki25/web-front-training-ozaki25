# metadata と OGP — シェアしたときのカードはどこから来るのか

## 今日のゴール

- リンクを貼ると出る「カード」の正体（OGP）を知る
- Next.js の Metadata API でタイトルや OGP を宣言する方法を知る
- 動的ページのメタデータ（generateMetadata）を知る

## URL を貼っただけなのに、画像とタイトルが出る

SNS やチャットに URL を貼ると、タイトル・説明文・画像のついた**カード**が自動で展開されます。あれは誰が作っているのでしょうか。

種明かし: カードの材料は、**そのページの HTML の `<head>` に書かれています**。SNS のサーバーが URL の HTML を取得し、`<head>` の中の決められたタグを読んで、カードを組み立てています。

```html
<head>
  <title>挽きたてコーヒー豆 | My Shop</title>
  <meta name="description" content="自家焙煎のコーヒー豆を全国にお届け" />
  <meta property="og:title" content="挽きたてコーヒー豆" />
  <meta property="og:description" content="自家焙煎のコーヒー豆を全国にお届け" />
  <meta property="og:image" content="https://shop.example.com/og/coffee.png" />
</head>
```

`og:` で始まるタグの規格が **OGP**（Open Graph Protocol）です。カードが出ない・画像が変、という現象はすべて「この `<head>` に何が書いてあるか」の問題に帰着します。

## Next.js では「オブジェクトを export する」だけ

`<head>` のタグを直接書く代わりに、Next.js では **Metadata API** を使います。page や layout から `metadata` というオブジェクトを export すると、Next.js が `<head>` を生成してくれます。

```tsx
// app/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Shop — 自家焙煎コーヒーの通販",
  description: "自家焙煎のコーヒー豆を全国にお届けします",
  openGraph: {
    title: "My Shop",
    description: "自家焙煎のコーヒー豆を全国にお届けします",
    images: ["/og/top.png"],
  },
};

export default function HomePage() {
  return <main>...</main>;
}
```

layout に書けば配下ページの既定値になり、page に書けば上書きされます。layout の重ね合わせと同じ「枠と個別」の関係です。

タイトルには便利なテンプレート機能があります。

```tsx
// app/layout.tsx — 全ページ共通の型を決める
export const metadata: Metadata = {
  title: {
    template: "%s | My Shop", // 各ページは %s の部分だけ書けばよい
    default: "My Shop",
  },
};
```

```tsx
// app/products/page.tsx
export const metadata: Metadata = {
  title: "商品一覧", // → 「商品一覧 | My Shop」になる
};
```

## 動的ページは generateMetadata

商品詳細のような動的ルートでは、タイトルも OGP 画像も**商品ごとに変わります**。固定オブジェクトでは書けないので、**関数版**の `generateMetadata` を使います。

```tsx
// app/products/[id]/page.tsx
import type { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProduct(id); // データを取ってメタデータを組み立てる

  return {
    title: product.name,
    description: product.summary,
    openGraph: {
      images: [product.ogImageUrl],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  // ...
}
```

「商品 A の URL を SNS に貼ると、商品 A の名前と画像のカードが出る」は、この関数が商品ごとのメタデータを生成しているからです。

## なぜサーバー側で出すことが大事か

ここで効いてくるのが、**カードを読みに来るのは人間ではなくプログラム（SNS のクローラー）**だという事実です。

クローラーの多くは、JavaScript を実行せずに**最初に返ってきた HTML だけ**を読みます。ブラウザでの表示後に JavaScript でタイトルを書き換えても、クローラーには見えません。**メタデータは、サーバーが返す最初の HTML に焼き込まれている必要がある**。Server Components ベースの Next.js の Metadata API は、まさにそうなるよう設計されています。

検索エンジンに対しても同じ構図で、`title` と `description` は検索結果の見え方（クリック率）に直結します。メタデータは「おまけ」ではなく、**ページの玄関の看板**です。

## 確認の仕方

書いたメタデータが正しく出ているかは、推測ではなく確認できます。

- ページのソース表示（右クリック → ページのソースを表示）で `<head>` 内のタグを直接見る
- 各 SNS の**カードプレビュー用デバッガ**（シェアデバッガ等の名前で提供されている）に URL を入れる
- 一度シェアされたカードは SNS 側にキャッシュされるので、「直したのに変わらない」はキャッシュの再取得が必要なサイン

## AI のコードを見るポイント

1. **metadata の export があるか**: AI はページ本体に集中して、メタデータを丸ごと忘れることがある。「各ページに title と description、OGP も」と明示的に頼む
2. **動的ページが固定 metadata になっていないか**: 商品ページ全部が同じタイトルでは、シェアも検索も台無し。generateMetadata へ
3. **og:image が絶対 URL か**: OGP の画像は完全な URL（https:// から）でないと拾われないクローラーが多い

## まとめ

- シェアのカードは `<head>` の OGP タグから作られる。読みに来るのはクローラー
- Next.js は metadata オブジェクトの export で宣言。layout が既定、page が上書き
- 動的ページは generateMetadata でデータからメタデータを生成する
- クローラーは JS を実行しない。サーバーが返す HTML に焼き込まれていることが必須
