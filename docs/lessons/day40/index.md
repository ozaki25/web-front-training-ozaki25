# Day 40: Tailwind CSS

## 今日のゴール

- ユーティリティファーストの考え方を理解する
- Tailwind CSS v4 の CSS ファーストな設定方法を知る
- レスポンシブデザインとダークモードの実装方法を理解する

## ユーティリティファースト CSS とは

Day 4〜6 で CSS の基礎を学びました。従来の CSS では、クラス名を考えてスタイルを書くのが一般的でした。

```css
/* 従来の CSS */
.card {
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #1a202c;
}
```

```html
<div class="card">
  <h2 class="card-title">タイトル</h2>
</div>
```

Tailwind CSS は、これとは異なる**ユーティリティファースト**というアプローチを取ります。1 つのクラスが 1 つの CSS プロパティに対応する小さなクラス（ユーティリティクラス）を組み合わせてスタイリングします。

```html
<div class="p-4 rounded-lg bg-white shadow-sm">
  <h2 class="text-xl font-bold text-gray-900">タイトル</h2>
</div>
```

| ユーティリティクラス | 対応する CSS |
|-------------------|------------|
| `p-4` | `padding: 1rem` |
| `rounded-lg` | `border-radius: 0.5rem` |
| `bg-white` | `background-color: white` |
| `shadow-sm` | `box-shadow: 0 1px 3px ...` |
| `text-xl` | `font-size: 1.25rem` |
| `font-bold` | `font-weight: bold` |
| `text-gray-900` | `color: #111827` |

### なぜユーティリティファーストなのか

最初は「クラス名が多くて読みにくい」と感じるかもしれません。しかし、実際のプロジェクトでは大きなメリットがあります。

1. **クラス名を考えなくていい** — `.card-wrapper-inner-title` のような命名に悩む時間がなくなる
2. **CSS ファイルが肥大化しない** — 同じユーティリティクラスが再利用されるため、CSS の総量が増えない
3. **HTML を見ればスタイルがわかる** — CSS ファイルを行き来する必要がない
4. **スタイルの衝突が起きない** — Day 6 で学んだ CSS のグローバルスコープ問題が発生しない

## Tailwind CSS v4 のセットアップ

Tailwind CSS v4 は、従来の JavaScript 設定ファイル（`tailwind.config.js`）ではなく、**CSS ファイルで設定する**というアプローチに変わりました。これを「CSS ファースト」と呼びます。

### Next.js プロジェクトでのセットアップ

`create-next-app` で Tailwind CSS を選択した場合、すでにセットアップ済みです。手動で設定する場合は以下のようになります。

```css
/* src/app/globals.css */
@import "tailwindcss";
```

これだけで Tailwind CSS が使えるようになります。v3 以前の `@tailwind base;` `@tailwind components;` `@tailwind utilities;` という 3 行は不要になりました。

### @theme ブロックでカスタマイズ

プロジェクト固有の色やフォントを定義するには、`@theme` ブロックを使います。

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
  --color-primary-dark: #1d4ed8;
  --color-secondary: #10b981;
  --font-sans: "Noto Sans JP", sans-serif;
  --breakpoint-xs: 475px;
}
```

`@theme` で定義した値は、ユーティリティクラスとして自動的に使えるようになります。

```html
<!-- --color-primary が bg-primary として使える -->
<button class="bg-primary text-white font-sans">ボタン</button>
```

従来の `tailwind.config.js` で `theme.extend` に書いていた内容が、CSS で完結するようになりました。

## よく使うユーティリティクラス

### レイアウト

```html
<!-- Flexbox -->
<div class="flex items-center justify-between gap-4">
  <span>左</span>
  <span>右</span>
</div>

<!-- Grid -->
<div class="grid grid-cols-3 gap-4">
  <div>1</div>
  <div>2</div>
  <div>3</div>
</div>
```

### スペーシング

```html
<!-- padding -->
<div class="p-4">全方向に 1rem</div>
<div class="px-4 py-2">横 1rem、縦 0.5rem</div>

<!-- margin -->
<div class="m-4">全方向に 1rem</div>
<div class="mt-8">上に 2rem</div>
```

数値の対応: `1` = 0.25rem、`2` = 0.5rem、`4` = 1rem、`8` = 2rem、`16` = 4rem

### テキスト

```html
<p class="text-sm text-gray-600">小さめのグレー文字</p>
<p class="text-2xl font-bold text-gray-900">大きい太字</p>
<p class="text-center leading-relaxed">中央揃えでゆったり行間</p>
```

### 背景・ボーダー

```html
<div class="bg-gray-100 border border-gray-300 rounded-lg">
  角丸のカード
</div>
```

## レスポンシブデザイン

Tailwind では、ブレークポイント（画面幅の区切り）のプレフィックスを付けるだけでレスポンシブデザインが実現できます。

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div class="p-4 bg-white rounded-lg shadow-sm">カード 1</div>
  <div class="p-4 bg-white rounded-lg shadow-sm">カード 2</div>
  <div class="p-4 bg-white rounded-lg shadow-sm">カード 3</div>
</div>
```

| プレフィックス | 画面幅 | 意味 |
|-------------|-------|------|
| なし | 0px〜 | モバイル（デフォルト） |
| `sm:` | 640px〜 | 小型タブレット |
| `md:` | 768px〜 | タブレット |
| `lg:` | 1024px〜 | デスクトップ |
| `xl:` | 1280px〜 | 大画面 |
| `2xl:` | 1536px〜 | 超大画面 |

Tailwind は**モバイルファースト**です。プレフィックスなしのスタイルがモバイル用で、`md:` や `lg:` でより大きい画面のスタイルを上書きしていきます。

上の例では、スマートフォンでは 1 列、タブレットでは 2 列、デスクトップでは 3 列のグリッドになります。

## ダークモード

Tailwind では `dark:` プレフィックスでダークモード用のスタイルを指定します。

```html
<div class="bg-white dark:bg-gray-900">
  <h1 class="text-gray-900 dark:text-white">タイトル</h1>
  <p class="text-gray-600 dark:text-gray-300">本文テキスト</p>
</div>
```

ダークモードは、ユーザーの OS 設定に従います（`prefers-color-scheme: dark`）。

### 完全なカードコンポーネント例

ここまでの内容を組み合わせた実践的な例です。

```tsx
// src/app/components/article-card.tsx
import Image from "next/image";
import Link from "next/link";

type Props = {
  title: string;
  excerpt: string;
  image: string;
  href: string;
};

export default function ArticleCard({ title, excerpt, image, href }: Props) {
  return (
    <article class="rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div class="relative h-48 w-full">
        <Image
          src={image}
          alt=""
          fill
          class="rounded-t-lg object-cover"
        />
      </div>
      <div class="p-4">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white">
          <Link href={href} class="hover:underline">
            {title}
          </Link>
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
          {excerpt}
        </p>
      </div>
    </article>
  );
}
```

> **注意**: React/Next.js の JSX では `class` ではなく `className` を使います。上記は説明のために `class` で記載していますが、実際のコードでは `className` に置き換えてください。

```tsx
// 実際の JSX では className を使う
<article className="rounded-lg border border-gray-200 bg-white shadow-sm">
```

## hover・focus などの状態

ユーザーの操作状態に応じたスタイルも、プレフィックスで指定できます。

```html
<button
  class="rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:bg-blue-700"
>
  ボタン
</button>
```

| プレフィックス | 状態 |
|-------------|------|
| `hover:` | マウスを乗せたとき |
| `focus:` | フォーカスしたとき |
| `active:` | クリック中 |
| `disabled:` | 無効状態 |
| `first:` | 最初の子要素 |
| `last:` | 最後の子要素 |

> **アクセシビリティ**: `focus:ring` による視覚的なフォーカスインジケーターは、キーボード操作のユーザーにとって非常に重要です。フォーカススタイルは必ず設定しましょう。

## まとめ

- Tailwind CSS はユーティリティファーストのアプローチで、クラス名の命名やスタイルの衝突から解放される
- v4 では `@import "tailwindcss"` だけで使い始められ、`@theme` ブロックでカスタマイズする
- レスポンシブデザインは `md:`、`lg:` などのプレフィックスで、モバイルファーストに実装する
- ダークモードは `dark:` プレフィックスで対応する
- `hover:`、`focus:` などの状態プレフィックスで、インタラクション時のスタイルを指定する
