# Day 42: 画像・フォント最適化

## 今日のゴール

- `next/image` が画像をどう最適化するかを知る
- `next/font` でフォントを最適化する方法を知る
- Core Web Vitals との関係を知る

## なぜ最適化が必要か

Web ページの表示速度は、ユーザー体験に直結します。表示が遅いとユーザーは離脱し、検索順位にも影響します。そして、ページの表示を遅くする最大の原因の 1 つが**画像**です。

一般的な Web ページのデータ量の 50% 以上を画像が占めていると言われています。そしてフォント（Web フォント）も、読み込み方を誤るとテキストが一瞬見えなくなるなどの問題を引き起こします。

Next.js はこれらを自動的に最適化する仕組みを組み込みで提供しています。

## next/image — 画像の最適化

### HTML の img タグの問題

まず、普通の `<img>` タグにはどんな問題があるかを見てみます。

```html
<!-- ❌ 問題のあるコード -->
<img src="/photo.jpg" />
```

このコードには複数の問題があります。

1. **画像サイズが最適化されない** — スマートフォンの小さな画面にも 4000px の画像がそのまま送られる
2. **フォーマットが最適化されない** — WebP や AVIF など効率的なフォーマットに変換されない
3. **レイアウトシフトが起きる** — 画像が読み込まれると突然レイアウトがガタッとずれる
4. **遅延読み込みがない** — 画面外の画像もすべて一度に読み込まれる
5. **alt がない** — スクリーンリーダーが画像の内容を伝えられない

### next/image の使い方

Next.js の `<Image>` コンポーネントは、これらの問題をすべて解決します。

```tsx
import Image from "next/image";

export default function ProfilePage() {
  return (
    <main>
      <h1>プロフィール</h1>
      <Image
        src="/profile.jpg"
        alt="山田太郎のプロフィール写真"
        width={300}
        height={300}
      />
    </main>
  );
}
```

### next/image が裏でやっていること

1. **自動フォーマット変換** — ブラウザが対応していれば WebP や AVIF に変換して配信する。JPEG より大幅にファイルサイズが小さくなる
2. **自動リサイズ** — デバイスの画面サイズに合わせて適切なサイズの画像を生成・配信する
3. **レイアウトシフト防止** — `width` と `height` を指定することで、画像の読み込み前からスペースが確保される
4. **遅延読み込み（lazy loading）** — 画面内に入るまで画像を読み込まない（デフォルトで有効）
5. **キャッシュ** — 一度変換した画像はキャッシュされ、次のリクエストから高速に配信される

### レスポンシブ画像

画面幅に合わせて画像サイズを変えたい場合は `fill` を使います。

```tsx
import Image from "next/image";

export default function HeroSection() {
  return (
    <div style={{ position: "relative", width: "100%", height: "400px" }}>
      <Image
        src="/hero.jpg"
        alt="緑豊かな森の風景"
        fill
        style={{ objectFit: "cover" }}
        priority  // ファーストビューの画像には priority を付ける
      />
    </div>
  );
}
```

- **`fill`** — 親要素いっぱいに画像を広げる（親要素に `position: relative` が必要）
- **`priority`** — ファーストビュー（最初に見える領域）の画像に付ける。遅延読み込みを無効にして即座に読み込む
- **`objectFit: "cover"`** — 画像のアスペクト比を保ちつつ、コンテナいっぱいに表示する

### sizes プロパティ

`fill` を使うとき、`sizes` を指定するとブラウザが最適なサイズの画像を選択できます。

```tsx
<Image
  src="/hero.jpg"
  alt="ヒーローイメージ"
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

これは「画面幅 768px 以下では画面幅いっぱい、1200px 以下では半分、それ以上では 3 分の 1」という意味です。ブラウザはこの情報を元に、最適なサイズの画像だけをダウンロードします。

### 外部画像の許可設定

セキュリティ上の理由から、`next/image` はデフォルトで外部サイトの画像を最適化しません。外部画像を使う場合は、`next.config.ts` の `images.remotePatterns` で許可するドメインを明示的に指定します。

```ts
// next.config.ts の images 設定（抜粋）
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "images.example.com",
    },
  ],
}
```

これは「どのドメインの画像をサーバーで処理してよいか」を宣言するものです。許可していないドメインの画像を `<Image>` に渡すとビルドエラーになります。悪意のある外部画像を処理させる攻撃を防ぐための仕組みです。

## next/font — フォントの最適化

### Web フォントの問題

Web フォントを使うと、以下の問題が起きることがあります。

- **FOUT（Flash of Unstyled Text）** — フォント読み込み前にシステムフォントで表示され、読み込み後にフォントが切り替わる（テキストがちらつく）
- **FOIT（Flash of Invisible Text）** — フォント読み込みまでテキストが非表示になる
- **外部リクエスト** — Google Fonts などの外部サーバーへのリクエストが発生し、プライバシーやパフォーマンスに影響する

### next/font の使い方

`next/font` はこれらの問題を解決します。

```tsx
// src/app/layout.tsx
import { Noto_Sans_JP } from "next/font/google";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={notoSansJP.className}>
      <body>{children}</body>
    </html>
  );
}
```

### next/font が裏でやっていること

1. **ビルド時にフォントをダウンロード** — Google Fonts への外部リクエストが本番では発生しない
2. **セルフホスティング** — フォントファイルを自サーバーから配信する
3. **CSS の `size-adjust`** — フォント読み込み前後でレイアウトがずれないよう、自動でサイズ調整する
4. **サブセット化** — 必要な文字だけを含むフォントファイルを生成し、ファイルサイズを削減

### ローカルフォントの使用

プロジェクト内にフォントファイルを持っている場合は `next/font/local` を使います。

```tsx
import localFont from "next/font/local";

const myFont = localFont({
  src: "./fonts/MyFont.woff2",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={myFont.className}>
      <body>{children}</body>
    </html>
  );
}
```

## Core Web Vitals との関係

**Core Web Vitals** は Google が定めた Web ページの品質指標です。Day 48 で詳しく学びますが、画像・フォントの最適化と特に関係が深い指標を紹介します。

### LCP（Largest Contentful Paint）

ページ内の最も大きなコンテンツ（多くの場合は画像）が表示されるまでの時間です。

- `next/image` の自動フォーマット変換とリサイズで画像のファイルサイズが減り、LCP が改善する
- ファーストビューの画像に `priority` を付けると即座に読み込まれ、LCP が改善する

### CLS（Cumulative Layout Shift）

ページ読み込み中にレイアウトがどれだけずれるかの指標です。

- `next/image` の `width`/`height` 指定でスペースが事前に確保され、CLS が改善する
- `next/font` の `size-adjust` でフォント切り替え時のずれが防止され、CLS が改善する

## まとめ

- `next/image` は自動フォーマット変換、リサイズ、遅延読み込み、レイアウトシフト防止を行う
- ファーストビューの画像には `priority` を付けて即座に読み込む
- `next/font` はフォントをビルド時にダウンロードし、セルフホスティングとサイズ調整を自動で行う
- これらの最適化は Core Web Vitals（特に LCP と CLS）の改善に直結する
- 画像には必ず適切な `alt` テキストを設定する
