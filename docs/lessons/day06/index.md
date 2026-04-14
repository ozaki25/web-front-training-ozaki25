# Day 6: CSS の基本と適用方法

## 今日のゴール

- CSS の役割と基本的な書き方を知る
- セレクタ、プロパティ、値の関係を知る
- CSS を適用する 3 つの方法（インライン・style タグ・外部ファイル）の違いを知る
- カスケードと詳細度の仕組みを知る

## CSS とは

CSS（Cascading Style Sheets）は、HTML の**見た目**を指定するための言語です。

Day 1 で「HTML はページの構造と意味を記述するもの」と学びました。見出しを大きくしたい、背景色を変えたい、レイアウトを整えたい — こうした**見た目の制御はすべて CSS の仕事**です。HTML と CSS は「構造」と「見た目」で役割を分担しています。

## CSS の基本的な書き方

```css
セレクタ {
  プロパティ: 値;
}
```

具体例で見てみましょう。

```css
h1 {
  color: darkblue;
  font-size: 32px;
}
```

| 用語 | 説明 | 例 |
|------|------|-----|
| セレクタ | どの要素にスタイルを適用するか | `h1` |
| プロパティ | 何を変えるか | `color`, `font-size` |
| 値 | どう変えるか | `darkblue`, `32px` |

`{ }` の中に「プロパティ: 値;」のペアを書きます。セミコロン（`;`）で各指定を区切ります。

## CSS を適用する 3 つの方法

### 方法 1: インラインスタイル（HTML 要素に直接書く）

```html
<p style="color: red; font-size: 18px;">赤い文字の段落です。</p>
```

HTML タグの `style` 属性に直接 CSS を書く方法です。

- **メリット**: すぐに試せる
- **デメリット**: HTML と CSS が混在して読みにくい。同じスタイルを複数の要素に適用したいとき、コピペが必要になる

### 方法 2: `<style>` タグ（HTML ファイル内に書く）

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CSS の練習</title>
    <style>
      h1 {
        color: darkblue;
      }
      p {
        color: gray;
        line-height: 1.8;
      }
    </style>
  </head>
  <body>
    <h1>見出し</h1>
    <p>段落のテキストです。</p>
  </body>
</html>
```

`<head>` 内に `<style>` タグを書き、その中に CSS を書きます。

- **メリット**: セレクタを使って複数の要素にまとめてスタイルを適用できる
- **デメリット**: CSS が HTML ファイルの中にあるため、他のページでスタイルを再利用できない

### 方法 3: 外部 CSS ファイル（推奨）

CSS を別ファイルに書き、HTML から読み込みます。

**style.css:**
```css
body {
  font-family: sans-serif;
  line-height: 1.8;
  color: #333;
}

h1 {
  color: darkblue;
  border-bottom: 2px solid darkblue;
  padding-bottom: 8px;
}

p {
  margin-bottom: 16px;
}
```

**index.html:**
```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CSS の練習</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <h1>外部 CSS を使ったページ</h1>
    <p>スタイルは style.css ファイルで管理しています。</p>
    <p>HTML と CSS が分離されて読みやすくなりました。</p>
  </body>
</html>
```

`<link>` タグで CSS ファイルを読み込みます。`rel="stylesheet"` は「このファイルはスタイルシートです」という意味です。

- **メリット**: HTML と CSS が完全に分離される。複数のページで同じ CSS を共有できる
- **デメリット**: ファイルが増える（とはいえ、これが実務での標準）

> **実務では方法 3（外部ファイル）が基本です。** インラインスタイルは後述する「詳細度」が最も高いため、意図せずスタイルの上書きが難しくなるという問題もあります。

## セレクタの種類

CSS で「どの要素にスタイルを適用するか」を指定するのがセレクタです。

### 要素セレクタ

タグ名で指定します。そのタグすべてに適用されます。

```css
p {
  color: #333;
}
```

### クラスセレクタ

HTML 要素に `class` 属性を付け、`.クラス名` で指定します。最も頻繁に使います。

```html
<p class="highlight">強調された段落</p>
<p>通常の段落</p>
```

```css
.highlight {
  background-color: yellow;
  font-weight: bold;
}
```

1 つの要素に複数のクラスを付けることもできます。

```html
<p class="highlight large">強調されて大きい段落</p>
```

### ID セレクタ

`id` 属性で指定します。`#` を使います。ID はページ内で一意（1 つだけ）でなければなりません。

```html
<header id="site-header">...</header>
```

```css
#site-header {
  background-color: navy;
  color: white;
}
```

> ID セレクタは詳細度が高すぎるため、スタイル指定にはクラスセレクタを使うのが一般的です。ID は Day 2 で学んだページ内リンクのターゲットなどに使います。

### 子孫セレクタ

スペースで区切ると「中にある要素」を指定できます。

```css
/* nav の中にある a 要素 */
nav a {
  color: white;
  text-decoration: none;
}
```

## カスケード — 同じ要素に複数のスタイルが当たったら？

CSS の「C」は Cascading（カスケーディング = 滝のように流れ落ちる）です。複数のスタイルが同じ要素に適用された場合、**どれが優先されるか**のルールがあります。

```html
<p class="highlight" style="color: green;">この文字は何色？</p>
```

```css
p {
  color: black;
}
.highlight {
  color: red;
}
```

この場合、テキストは**緑色**になります。なぜでしょうか？

## 詳細度（Specificity）

同じ要素に複数のスタイルが適用されたとき、**詳細度**が高い方が優先されます。

詳細度の順番（高い → 低い）:

1. **インラインスタイル**（`style` 属性）— 最も強い
2. **ID セレクタ**（`#id`）
3. **クラスセレクタ**（`.class`）
4. **要素セレクタ**（`p`, `h1` など）

先ほどの例では、インラインスタイル（`style="color: green;"`）が最も詳細度が高いため緑色になります。

```css
p { color: black; }           /* 要素セレクタ: 詳細度 低 */
.highlight { color: red; }    /* クラスセレクタ: 詳細度 中 */
/* style="color: green;"         インライン: 詳細度 高 → これが勝つ */
```

### 同じ詳細度なら後に書いた方が勝つ

```css
p {
  color: blue;
}
p {
  color: red;  /* こちらが後なので、こちらが適用される */
}
```

> 詳細度の仕組みは最初は複雑に感じますが、「クラスセレクタを基本にする」「インラインスタイルと ID セレクタはできるだけ使わない」というルールを守れば、ほとんど困ることはありません。

> **`!important` について**: CSS には `color: red !important;` のように、詳細度を無視して強制適用する `!important` という仕組みがあります。ネットの記事やコードで見かけることがありますが、使うと詳細度の仕組みが壊れてスタイルの管理が困難になるため、**自分のコードでは使わない**と覚えてください。

## 完成形のコード

外部 CSS ファイルを使って Day 1 の自己紹介ページにスタイルを当てると、以下のようになります。

**style.css:**
```css
body {
  font-family: sans-serif;
  line-height: 1.8;
  color: #333;
  max-width: 700px;
  margin: 0 auto;
  padding: 20px;
}

header {
  border-bottom: 2px solid #333;
  padding-bottom: 16px;
  margin-bottom: 24px;
}

h1 {
  color: #1a1a2e;
}

h2 {
  color: #16213e;
  margin-top: 32px;
}

ul {
  padding-left: 20px;
}

footer {
  margin-top: 40px;
  padding-top: 16px;
  border-top: 1px solid #ccc;
  color: #888;
  font-size: 14px;
}
```

**index.html:**
```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>自己紹介 - 山田太郎</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <header>
      <h1>山田太郎</h1>
      <p>東京都在住のエンジニアです。</p>
    </header>

    <main>
      <section>
        <h2>自己紹介</h2>
        <p>Web 開発に興味があり、日々勉強しています。</p>
      </section>

      <section>
        <h2>趣味</h2>
        <ul>
          <li>読書</li>
          <li>ランニング</li>
          <li>プログラミング</li>
        </ul>
      </section>
    </main>

    <footer>
      <p>© 2026 山田太郎</p>
    </footer>
  </body>
</html>
```

ブラウザで開くと、素の HTML に比べてずいぶん読みやすくなります。CSS のプロパティの値を変えれば、色やサイズを自由に調整できます。

## まとめ

- CSS は HTML の見た目を指定する言語。HTML（構造）と CSS（見た目）は分離するのが基本
- CSS は「セレクタ { プロパティ: 値; }」の形で書く
- 適用方法は 3 つ: インライン、`<style>` タグ、外部ファイル。**実務では外部ファイルが基本**
- セレクタはクラスセレクタ（`.class`）を中心に使う
- 同じ要素に複数のスタイルが当たったら、詳細度の高い方が勝つ
- インラインスタイル > ID セレクタ > クラスセレクタ > 要素セレクタ の順
