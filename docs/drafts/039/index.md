# Tailwind CSS — h1 が大きくならない理由から始まる設計思想

## 今日のゴール

- Tailwind の Preflight がデフォルトスタイルを消す仕組みを知る
- ユーティリティファーストの設計思想を知る
- Tailwind v4 の設定方法を知る

## h1 が大きくならない

Tailwind CSS を導入したプロジェクトで `<h1>` を書くと、普通のテキストと同じ大きさで表示されます。

```html
<h1>見出し</h1>
<p>段落</p>
```

どちらも同じサイズ、同じ太さ。`<h1>` は本来ブラウザのデフォルトスタイルで大きく太く表示されるはずです。

これは Tailwind の **Preflight** という仕組みが原因です。Tailwind は `@import "tailwindcss"` を書いた時点で、**ブラウザのデフォルトスタイルをすべてリセット**します。

- `<h1>` 〜 `<h6>` のフォントサイズと太字を解除
- `<ul>`, `<ol>` のリストマーカーを非表示
- `<a>` の色と下線を解除
- すべての `margin` と `padding` を 0 にリセット
- `box-sizing: border-box` を全要素に適用

「まっさらな状態」からスタートして、**すべてのスタイルをクラスで明示的に指定する**。これが Tailwind の設計思想です。

## ユーティリティクラスで見た目を作る

Tailwind では、1 つのクラスが 1 つの CSS プロパティに対応します。

```html
<h1 class="text-2xl font-bold">見出し</h1>
<p class="text-base text-gray-600">段落</p>
```

| クラス | CSS |
|--------|-----|
| `text-2xl` | `font-size: 1.5rem` |
| `font-bold` | `font-weight: 700` |
| `text-base` | `font-size: 1rem` |
| `text-gray-600` | `color: #4b5563` |

`<h1>` に `text-2xl font-bold` を付けて初めて見出しらしい見た目になります。「HTML のタグが見た目を決める」のではなく「クラスが見た目を決める」のです。

## なぜこの設計が選ばれるのか

一見面倒に思えますが、大きなプロジェクトではメリットがあります。

**CSS ファイルが肥大化しない**: 従来の CSS は `.card-title`, `.card-body`, `.card-footer` のようなクラスを作るたびに CSS が増えます。Tailwind は既存のユーティリティクラスを再利用するので、プロジェクトが大きくなっても CSS のサイズはほとんど増えません。

**クラス名を考えなくていい**: `.card-title-wrapper-inner` のような命名に悩む必要がありません。

**HTML を見ればスタイルがわかる**: CSS ファイルを行き来しなくても、HTML を見るだけでどんな見た目か把握できます。

## Tailwind v4 の設定

Tailwind CSS v4 では、設定を **CSS ファイルの中**に書きます。

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --color-brand: #064e3b;
  --font-display: "Inter", sans-serif;
  --spacing-18: 4.5rem;
}
```

`@theme` ブロックで CSS 変数としてトークンを定義すると、`bg-brand`, `font-display`, `spacing-18` といったユーティリティクラスが自動で使えるようになります。

従来の `tailwind.config.js`（JavaScript の設定ファイル）は不要になりました。CSS の中で完結する **CSS ファースト**な設計に変わっています。

## レスポンシブとダークモード

Tailwind にはメディアクエリのショートカットが組み込まれています。

```html
<div class="flex flex-col md:flex-row">
  <!-- スマホ: 縦並び、768px 以上: 横並び -->
</div>

<div class="bg-white dark:bg-gray-900">
  <!-- ライト: 白背景、ダーク: 濃い背景 -->
</div>
```

`md:` は `@media (min-width: 768px)`、`dark:` は `@media (prefers-color-scheme: dark)` に対応します。クラスにプレフィックスを付けるだけで条件付きスタイルが書けます。

## まとめ

- Tailwind の Preflight はブラウザのデフォルトスタイルをすべてリセットします。`<h1>` が大きくならないのはこのためです
- すべてのスタイルをユーティリティクラスで明示的に指定するのが Tailwind の設計思想です
- CSS ファイルの肥大化を防ぎ、クラス名の命名に悩まず、HTML を見るだけでスタイルがわかるメリットがあります
- v4 では `@theme` で CSS 変数としてトークンを定義する CSS ファーストな設定に変わりました
- `md:`, `dark:` などのプレフィックスで、レスポンシブやダークモード対応が書けます
