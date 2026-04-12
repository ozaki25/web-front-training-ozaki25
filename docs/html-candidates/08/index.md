# Day 8: head の中身 — ユーザーには見えないがブラウザと検索エンジンが読む情報

## 今日のゴール

- `<head>` に書く主要なメタ情報の種類と役割を知る
- OGP（SNS シェア時のカード表示）の仕組みを知る
- Next.js の Metadata API がこれらを自動管理することを知る

## head は「見えないけど重要な情報」の置き場所

Day 7 で `<head>` には `charset`、`viewport`、`title` を書くと学びました。しかし `<head>` に書けるメタ情報はまだまだあります。検索結果の見え方、SNS でシェアしたときのカード表示、ブラウザのタブに表示されるアイコン — これらはすべて `<head>` の中身で決まります。

今日は `<head>` に書く主要な情報を見ていきましょう。

## title — 検索結果とブラウザタブの顔

Day 7 でも触れましたが、`<title>` は最も重要なメタ情報の1つです。

```html
<title>Web フロントエンド入門 | サンプルサイト</title>
```

`<title>` が表示される場面:

1. **ブラウザのタブ** — 複数のタブを開いているとき、ここでページを区別する
2. **検索結果のタイトル** — Google などの検索結果で青いリンクとして表示される
3. **ブックマーク名** — ページをブックマークしたときのデフォルトの名前

SEO（Search Engine Optimization = 検索エンジン最適化）の観点からも、ページの内容を端的に表す `<title>` を付けることが重要です。

## meta description — 検索結果のスニペット

```html
<meta name="description" content="HTML/CSS の基礎から Next.js まで、Web フロントエンドの知識を15分のレッスンで学べるサイトです。" />
```

**description（説明文）**は、検索結果でタイトルの下に表示される短い説明文（スニペット）に使われます。

```
検索結果の表示イメージ:
┌────────────────────────────────────────────┐
│ Web フロントエンド入門 | サンプルサイト          │ ← title
│ https://example.com                         │ ← URL
│ HTML/CSS の基礎から Next.js まで、Web フロント  │ ← description
│ エンドの知識を15分のレッスンで学べるサイトです。  │
└────────────────────────────────────────────┘
```

`description` がない場合、検索エンジンはページの本文から自動的に抜粋しますが、意図しない文章が表示されることがあります。自分で書いたほうが検索結果の見え方をコントロールできます。

## OGP — SNS でシェアしたときの見え方

SNS で URL をシェアすると、タイトルと画像がカードとして表示されますよね。あの表示を制御しているのが **OGP（Open Graph Protocol）** です。

```html
<head>
  <meta property="og:title" content="Web フロントエンド入門" />
  <meta property="og:description" content="HTML/CSS の基礎から Next.js まで学べるサイト" />
  <meta property="og:image" content="https://example.com/images/ogp.png" />
  <meta property="og:url" content="https://example.com/" />
  <meta property="og:type" content="website" />
</head>
```

| プロパティ | 役割 |
|-----------|------|
| `og:title` | カードに表示されるタイトル |
| `og:description` | カードに表示される説明文 |
| `og:image` | カードに表示される画像。1200x630px が推奨 |
| `og:url` | ページの正規 URL |
| `og:type` | コンテンツの種類。`website`、`article` など |

### X（旧 Twitter）専用のメタタグ

X は OGP に加えて独自のメタタグにも対応しています。

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Web フロントエンド入門" />
<meta name="twitter:description" content="HTML/CSS の基礎から Next.js まで学べるサイト" />
<meta name="twitter:image" content="https://example.com/images/ogp.png" />
```

`twitter:card` の値で表示形式が変わります。`summary` は小さいカード、`summary_large_image` は大きな画像付きカードになります。

## favicon — タブのアイコン

ブラウザのタブに表示される小さなアイコンが **favicon（ファビコン = favorite icon）** です。

```html
<link rel="icon" href="/favicon.ico" />
```

favicon がないと、ブラウザのタブにはデフォルトのアイコン（または何も表示されない）になります。小さなアイコンですが、複数タブを開いているときにサイトを識別するための大事な要素です。

最近では `.ico` 形式だけでなく SVG 形式も使われます。

```html
<!-- SVG 形式の favicon -->
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />

<!-- Apple デバイス用のアイコン -->
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

## canonical — 重複ページの正規 URL

同じ内容のページが複数の URL で存在する場合があります。たとえば:

- `https://example.com/products`
- `https://example.com/products?sort=price`
- `https://example.com/products?page=1`

検索エンジンはこれらを別のページとして認識する可能性があります。**canonical（カノニカル = 正規の）** を指定すると、「このページの本来の URL はこれですよ」と検索エンジンに伝えられます。

```html
<link rel="canonical" href="https://example.com/products" />
```

これにより、検索エンジンは複数の URL の評価を 1 つに統合し、検索結果で正しいページが表示されるようになります。

## CSS と JavaScript の読み込み

`<head>` には CSS ファイルや JavaScript ファイルの読み込み指定も書きます。これは Day 1 や Day 4 ですでに見たものです。

```html
<head>
  <!-- CSS ファイルの読み込み -->
  <link rel="stylesheet" href="/styles/main.css" />

  <!-- JavaScript ファイルの読み込み（defer で HTML パース後に実行） -->
  <script src="/scripts/main.js" defer></script>
</head>
```

`<script>` に `defer` を付けると、HTML のパース（解析）を止めずにスクリプトをダウンロードし、パースが終わった後に実行します。これについては Day 9 で詳しく学びます。

## 完全な head の例

ここまでの内容をまとめると、実際のページの `<head>` はこのようになります。

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <!-- 文字エンコーディング（最初に書く） -->
    <meta charset="UTF-8" />
    
    <!-- ビューポート設定 -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- ページタイトル -->
    <title>Web フロントエンド入門 | サンプルサイト</title>
    
    <!-- 検索結果の説明文 -->
    <meta name="description" content="HTML/CSS の基礎から Next.js まで、15分で学べるレッスン集" />
    
    <!-- 正規 URL -->
    <link rel="canonical" href="https://example.com/" />
    
    <!-- OGP -->
    <meta property="og:title" content="Web フロントエンド入門" />
    <meta property="og:description" content="HTML/CSS の基礎から Next.js まで学べるサイト" />
    <meta property="og:image" content="https://example.com/images/ogp.png" />
    <meta property="og:url" content="https://example.com/" />
    <meta property="og:type" content="website" />
    
    <!-- X（旧 Twitter）カード -->
    <meta name="twitter:card" content="summary_large_image" />
    
    <!-- favicon -->
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    
    <!-- CSS -->
    <link rel="stylesheet" href="/styles/main.css" />
  </head>
  <body>
    <!-- 画面に表示する内容 -->
  </body>
</html>
```

タグが多いですが、一度テンプレートを作ってしまえば、ページごとに `title`、`description`、OGP の値を変えるだけです。

## Next.js の Metadata API

Next.js（App Router）では、`<head>` の中身を手書きする代わりに **Metadata API** で管理できます。

```tsx
// app/page.tsx（Next.js の例）
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Web フロントエンド入門",
  description: "HTML/CSS の基礎から Next.js まで学べるサイト",
  openGraph: {
    title: "Web フロントエンド入門",
    description: "HTML/CSS の基礎から Next.js まで学べるサイト",
    images: ["/images/ogp.png"],
  },
};

export default function Page() {
  return <main>{/* ページの内容 */}</main>;
}
```

JavaScript のオブジェクトとして書くだけで、Next.js が適切な `<meta>` タグを自動生成してくれます。ただし、今日学んだ「何のためのタグか」を知らなければ、Metadata API の設定項目が何を意味するのかわかりません。素の HTML を知っていることが、フレームワークを使いこなす土台になります。

Metadata API の詳細は Next.js のレッスン（Day 39）で改めて扱います。

## まとめ

- `<title>` は検索結果のタイトルとブラウザのタブに表示される。ページごとに具体的に書く
- `<meta name="description">` は検索結果のスニペットに使われる
- OGP（`og:title`、`og:image` など）は SNS でシェアしたときのカード表示を制御する
- favicon はブラウザタブのアイコン。小さいが、サイトの識別に役立つ
- `<link rel="canonical">` で重複ページの正規 URL を検索エンジンに伝える
- Next.js の Metadata API はこれらを JavaScript オブジェクトで管理できるが、素の HTML の知識が土台になる
