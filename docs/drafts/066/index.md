# CSS 変数 — 同じ値を何度も書かないための仕組み

## 今日のゴール

- CSS にも変数があることを知る
- CSS 変数（カスタムプロパティ）の書き方と使い方を知る
- デザイントークンという考え方を知る

## 同じ色を何度も書いている

CSS を書いていると、同じ値が繰り返し出てきます。

```css
.header {
  background-color: #064e3b;
  border-bottom: 2px solid #064e3b;
}
.button {
  background-color: #064e3b;
  color: #ffffff;
}
.link {
  color: #064e3b;
}
```

`#064e3b` が 4 回登場しています。このブランドカラーを変更したくなったら、4 箇所すべてを書き換える必要があります。ファイルが増えれば、書き換え漏れが起きます。

プログラミング言語なら変数を使って 1 箇所にまとめるところです。実は CSS にも変数の仕組みがあります。

## CSS 変数（カスタムプロパティ）

CSS 変数は `--` で始まる名前を付けて定義し、`var()` で参照します。

```css
:root {
  --color-primary: #064e3b;
}

.header {
  background-color: var(--color-primary);
  border-bottom: 2px solid var(--color-primary);
}
.button {
  background-color: var(--color-primary);
  color: #ffffff;
}
.link {
  color: var(--color-primary);
}
```

`:root` は HTML 文書全体を指すセレクタです。ここで定義した変数は、ページ内のどこからでも参照できます。

ブランドカラーを変えたくなったら、`--color-primary` の値を 1 箇所変えるだけです。

## 色だけではない

CSS 変数に入れられるのは色だけではありません。

```css
:root {
  --color-primary: #064e3b;
  --color-text: #292524;
  --color-text-muted: #57534e;
  --color-bg: #ffffff;

  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;

  --radius: 8px;

  --font-body: system-ui, -apple-system, sans-serif;
}

.card {
  background-color: var(--color-bg);
  color: var(--color-text);
  padding: var(--spacing-md);
  border-radius: var(--radius);
  font-family: var(--font-body);
}
```

色、余白、角丸、フォント。サイト全体で統一したい値はすべて変数にできます。

## デザイントークン — 変数を設計の単位にする

サイト全体の色・余白・フォントなどを変数として一元管理する考え方を**デザイントークン**と呼びます。

```css
:root {
  /* 色 */
  --color-primary: #064e3b;
  --color-primary-dark: #022c22;
  --color-text: #292524;
  --color-text-muted: #57534e;
  --color-bg: #ffffff;
  --color-border: #e7e5e4;

  /* 余白 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
}
```

デザイントークンがあると:

- **一貫性が保てる**: 「微妙に違う色」「微妙に違う余白」が増えない
- **変更が楽になる**: ブランドカラーの変更が 1 箇所で済む
- **チームで共有できる**: デザイナーとエンジニアが同じ名前で値を指す

Tailwind CSS はまさにこの考え方を徹底したフレームワークです。`text-sm`、`p-4`、`bg-white` といったクラスは、あらかじめ定義されたデザイントークンの集合です。Tailwind v4 では `@theme` ブロックで CSS 変数としてトークンを定義します。

```css
@import "tailwindcss";

@theme {
  --color-brand: #064e3b;
  --font-display: "Inter", sans-serif;
}
```

## ダークモード対応

CSS 変数はダークモード対応とも相性がいいです。変数の値だけ切り替えれば、参照している箇所がすべて変わります。

```css
:root {
  --color-text: #292524;
  --color-bg: #ffffff;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-text: #f5f5f4;
    --color-bg: #1b1b1f;
  }
}

body {
  color: var(--color-text);
  background-color: var(--color-bg);
}
```

`body` のスタイルは 1 つしか書いていません。メディアクエリで変数の値だけを差し替えることで、ライトモードとダークモードの両方に対応できます。

## まとめ

- CSS にも変数があります。`--名前: 値` で定義し、`var(--名前)` で参照します
- 色、余白、フォントなど、サイト全体で統一したい値を 1 箇所にまとめられます
- この変数を設計の単位として一元管理する考え方がデザイントークンです
- Tailwind CSS のユーティリティクラスは、デザイントークンの考え方を徹底したものです
- CSS 変数はダークモード対応にも使えます。変数の値だけ切り替えれば参照先がすべて変わります
