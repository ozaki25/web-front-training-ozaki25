# Day X: a と button — クリックできる要素の正しい選び方

## 今日のゴール

- 「ページ遷移は a、アクションは button」という使い分けの原則を知る
- div に onclick を付けることの問題点を知る
- button の type 属性のデフォルト値（submit）を知る

## 「クリックできる」と「正しくインタラクティブ」は違う

Web ページには「クリックして何かが起きる要素」がたくさんあります。リンク、ボタン、メニュー項目、タブ ── これらは見た目は似ていますが、HTML のタグとしては大きく 2 種類に分かれます。

| 操作 | 使うタグ | 例 |
|------|---------|-----|
| 別のページに移動する | `<a>` | リンク、ナビゲーション |
| その場でアクションを実行する | `<button>` | フォーム送信、モーダルを開く、カートに追加 |

原則はシンプルです。**ページ遷移は `<a>`、アクションは `<button>`** です。

## div onclick がなぜダメなのか

JavaScript を使えば、`<div>` にクリックイベントを付けて「ボタンっぽいもの」を作ることができます。

```html
<!-- ❌ div にクリックイベントを付けた「ボタンもどき」 -->
<div class="btn" onclick="doSomething()">保存する</div>
```

CSS でボタンらしい見た目にすれば、マウスでクリックすれば動きます。しかし、これには深刻な問題が 3 つあります。

### 1. キーボードで操作できない

Web を使うすべての人がマウスを使うわけではありません。手に障害がある方、一時的に腕を怪我している方、あるいは単にキーボード操作を好む方もいます。

`<button>` や `<a>` は、**Tab キーでフォーカスでき、Enter キーや Space キーで操作できます**。これはブラウザが自動的に提供する機能です。

`<div>` にはこの機能がありません。

| 操作 | `<button>` | `<div onclick>` |
|------|-----------|-----------------|
| Tab キーでフォーカス | できる | **できない** |
| Enter / Space で実行 | できる | **できない** |
| マウスクリック | できる | できる |

### 2. スクリーンリーダーが認識しない

スクリーンリーダーは `<button>` を見つけると「保存する、ボタン」のように読み上げます。ユーザーはそれがクリックできる要素だとわかります。

`<div>` は「保存する」とだけ読み上げられます。それがボタンなのか、ただのテキストなのか、ユーザーには判断できません。

### 3. div をボタンにしようとすると大量のコードが必要

「じゃあ div にアクセシビリティ対応を足せばいいのでは？」と思うかもしれません。やってみましょう。

```html
<!-- div を無理やりボタンにする場合に必要な対応 -->
<div
  class="btn"
  role="button"
  tabindex="0"
  onclick="doSomething()"
  onkeydown="if(event.key === 'Enter' || event.key === ' ') { event.preventDefault(); doSomething(); }"
  aria-label="保存する"
>
  保存する
</div>
```

- `role="button"` — スクリーンリーダーに「これはボタンです」と伝える
- `tabindex="0"` — Tab キーでフォーカスできるようにする
- `onkeydown` — Enter キーと Space キーでも動くようにする
- `aria-label` — アクセシビリティ用のラベルを付ける

これだけ書いても、`<button>` タグが標準で提供する機能の一部にすぎません。`<button>` なら1行で済むことを、わざわざ再発明しているのです。

```html
<!-- button ならこれだけ -->
<button type="button" onclick="doSomething()">保存する</button>
```

**正しいタグを選ぶだけで、アクセシビリティの大部分が自動的に確保されます。**

## a タグの正しい使い方

`<a>`（anchor）タグはリンク、つまり **別の場所に移動するため** の要素です。

```html
<!-- ✅ 別のページに移動する -->
<a href="/about">会社概要</a>

<!-- ✅ ページ内の特定の場所に移動する -->
<a href="#contact">お問い合わせセクションへ</a>

<!-- ✅ 外部サイトに移動する -->
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
  外部サイト
</a>
```

### href のない a タグは使わない

```html
<!-- ❌ href がない a タグ -->
<a onclick="doSomething()">クリック</a>

<!-- ❌ href="#" で遷移を無効化している -->
<a href="#" onclick="doSomething(); return false;">クリック</a>
```

`<a>` タグは `href` 属性があってはじめてリンクとして機能します。`href` がない `<a>` は、スクリーンリーダーにリンクとして認識されず、Tab キーでフォーカスもできません。

「見た目はリンクだけど、クリックで何かアクションを実行したい」という場合は、**`<button>` を使って、CSS でリンクのような見た目にする**のが正しいアプローチです。

```html
<!-- ✅ アクションを実行する要素は button -->
<button type="button" class="link-style" onclick="doSomething()">
  クリック
</button>
```

```css
/* button をリンクのような見た目にする */
.link-style {
  background: none;
  border: none;
  color: blue;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
  font: inherit;
}
```

## button の type 属性 — デフォルトは submit

`<button>` タグには `type` 属性があります。ここに重要な落とし穴があります。

| type | 動作 |
|------|------|
| `submit` | フォームを送信する（**デフォルト**） |
| `button` | 何もしない（JavaScript で制御する） |
| `reset` | フォームの入力値をリセットする |

**`type` を省略すると `submit` になります。** これがフォームの中で予期しない送信を引き起こすことがあります。

```html
<form action="/search" method="get">
  <label for="keyword">検索</label>
  <input type="text" id="keyword" name="q" />

  <!-- ❌ type を省略すると submit になる -->
  <!-- このボタンを押すとフォームが送信されてしまう -->
  <button onclick="toggleFilter()">フィルターを表示</button>

  <button type="submit">検索する</button>
</form>
```

この例では「フィルターを表示」ボタンを押しただけなのに、フォームが送信されてしまいます。`type` が省略されているため `submit` として動作するからです。

```html
<form action="/search" method="get">
  <label for="keyword">検索</label>
  <input type="text" id="keyword" name="q" />

  <!-- ✅ type="button" を明示する -->
  <button type="button" onclick="toggleFilter()">フィルターを表示</button>

  <button type="submit">検索する</button>
</form>
```

**フォーム送信が目的でない button には、必ず `type="button"` を付ける。** これは習慣にしておくとバグを防げます。

## Next.js の Link コンポーネント

Next.js でページ遷移をするとき、`<a>` タグの代わりに `Link` コンポーネントを使います。

```tsx
import Link from "next/link";

function Navigation() {
  return (
    <nav>
      <ul>
        <li>
          <Link href="/">ホーム</Link>
        </li>
        <li>
          <Link href="/about">会社概要</Link>
        </li>
      </ul>
    </nav>
  );
}
```

`Link` は内部的に `<a>` タグをレンダリングします。つまり、ブラウザが受け取る HTML は通常の `<a href="/about">会社概要</a>` です。`Link` が追加で行っているのは、**ページ遷移を高速化する仕組み**（クライアントサイドナビゲーション）です。

ここで大事なのは、**Next.js の `Link` を使っていても、HTML としては `<a>` タグだという点**です。セマンティクスの観点では、リンクの原則がそのまま当てはまります。「ページ遷移は `Link`（= `<a>`）、アクションは `<button>`」という使い分けは Next.js でも変わりません。

## eslint-plugin-jsx-a11y — 間違いを自動で検出する

ここまで見てきた「div onclick」や「href のない a」のような問題を、コードを書く時点で自動的に指摘してくれるツールがあります。**eslint-plugin-jsx-a11y** です。

**ESLint** はコードの問題を自動検出するツールで、**jsx-a11y**（JSX accessibility の略）はそのアクセシビリティ用のプラグインです。

このプラグインを入れると、たとえば以下のようなコードを書いたときにエディタ上で警告が表示されます。

```tsx
// ⚠️ eslint-plugin-jsx-a11y が警告を出すコード例

// 警告: click イベントがあるのにキーボードイベントがない
<div onClick={handleClick}>保存する</div>

// 警告: href が無効な値
<a href="#">クリック</a>

// 警告: インタラクティブな要素には role が必要
<span onClick={handleClick}>閉じる</span>
```

AI にコードを生成してもらったときも、このプラグインが入っていればアクセシビリティの問題を自動で検出できます。「人間がすべてチェックする」のではなく、**ツールに任せられる部分はツールに任せる**のが現代の開発スタイルです。

## まとめ

- ページ遷移は `<a>`、アクションは `<button>` ── これが基本の使い分け
- `<div onclick>` はキーボードで操作できず、スクリーンリーダーにも認識されない。`<button>` なら 1 行で解決する
- `<a>` タグは `href` 属性があってはじめてリンクとして機能する。`href="#"` でアクションを実行するのは NG
- `<button>` の `type` はデフォルトが `submit`。フォーム内で送信目的でない button には `type="button"` を必ず付ける
- Next.js の `Link` は内部的に `<a>` タグを出力する。使い分けの原則は同じ
- eslint-plugin-jsx-a11y を使えば、これらの問題を自動で検出できる
