# Day 7: CSS ボックスモデルとレイアウト

## 今日のゴール

- すべての HTML 要素が「ボックス（箱）」であることを知る
- margin、padding、border の違いを知る
- `box-sizing: border-box` の意味と使い方を知る
- `display` プロパティによる表示の違いを知る

## ボックスモデル — すべては「箱」

ブラウザは HTML のすべての要素を「四角い箱（ボックス）」として扱います。これを**ボックスモデル**と呼びます。Day 6 で CSS の基本を学びましたが、レイアウトを理解するにはこのボックスモデルの理解が不可欠です。

ボックスは内側から順に、4 つの領域で構成されます。

```
┌─────────────────────────── margin（外側の余白）
│ ┌───────────────────────── border（境界線）
│ │ ┌─────────────────────── padding（内側の余白）
│ │ │ ┌───────────────────── content（中身）
│ │ │ │                   │
│ │ │ │   テキストや画像   │
│ │ │ │                   │
│ │ │ └───────────────────┘
│ │ └─────────────────────┘
│ └───────────────────────┘
└─────────────────────────┘
```

| 領域 | 役割 |
|------|------|
| content | テキストや画像など、要素の中身 |
| padding | content と border の間の余白。背景色が適用される |
| border | 要素の境界線 |
| margin | 要素の外側の余白。他の要素との間隔を作る |

## ボックスモデルの例

以下のコードで実際のボックスモデルの振る舞いを確認できます。

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ボックスモデルの練習</title>
    <style>
      .box {
        width: 300px;
        padding: 20px;
        border: 3px solid darkblue;
        margin: 16px;
        background-color: #e8f0fe;
      }
    </style>
  </head>
  <body>
    <div class="box">
      <p>このボックスの幅は何ピクセルでしょう？</p>
    </div>
  </body>
</html>
```

ブラウザの開発者ツール（DevTools）を使うと、各領域のサイズを視覚的に確認できます。要素を右クリック →「検証」で開き、「Computed」タブや要素のボックスモデル図で content・padding・border・margin の値が表示されます。

### 実際の幅はいくつ？

`width: 300px` と書きましたが、実際にこのボックスが画面上で占める幅はいくつでしょうか？

デフォルトでは `width` は **content の幅だけ** を指定します。

```
実際の幅 = content(300px) + padding左(20px) + padding右(20px) + border左(3px) + border右(3px)
         = 346px
```

300px と指定したのに 346px になる。これは直感に反しますよね。

## box-sizing: border-box — 直感的なサイズ指定

この問題を解決するのが `box-sizing: border-box` です。

```css
.box {
  box-sizing: border-box;
  width: 300px;
  padding: 20px;
  border: 3px solid darkblue;
}
```

`border-box` を指定すると、`width: 300px` は **padding と border を含めた幅** になります。content の幅は自動的に `300 - 20*2 - 3*2 = 254px` に調整されます。

こちらの方がずっと直感的なので、実務では全要素に `border-box` を適用するのが一般的です。

```css
/* リセットとして最初に書くことが多い */
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

`*` は「すべての要素」を意味するセレクタです。この 1 行を入れておけば、全要素で border-box が有効になります。

## margin と padding の使い分け

- **padding**: 要素の内側の余白。背景色の中に含まれる。「箱の中に余白を作る」
- **margin**: 要素の外側の余白。背景色の外。「箱と箱の間に間隔を作る」

```css
.card {
  background-color: #f5f5f5;
  padding: 24px;   /* 中のテキストが端にくっつかないように */
  margin: 16px 0;  /* 上下にカード同士の間隔を空ける */
  border: 1px solid #ddd;
}
```

### margin: auto で中央寄せ

ブロック要素に `width` を指定し、左右の margin を `auto` にすると、**水平方向の中央寄せ**ができます。

```css
.container {
  width: 800px;        /* 幅を指定 */
  margin: 0 auto;      /* 上下 0、左右 auto → 中央寄せ */
}
```

`auto` は「利用可能な余白を自動で均等に分配する」という意味です。左右ともに `auto` なので、余った空間が左右均等に割り当てられ、結果として中央に配置されます。`max-width` と組み合わせるのが実務では一般的です。

```css
.container {
  max-width: 960px;    /* 960px より狭い画面では画面幅に合わせる */
  margin: 0 auto;
}
```

> **注意**: `margin: auto` による中央寄せは**水平方向**のみです。垂直方向の中央寄せは次の Day で学ぶ Flexbox を使います。

### ショートハンド（省略記法）

```css
/* 上下左右すべて同じ */
padding: 20px;

/* 上下 / 左右 */
padding: 10px 20px;

/* 上 / 左右 / 下 */
padding: 10px 20px 30px;

/* 上 / 右 / 下 / 左（時計回り） */
padding: 10px 20px 30px 40px;
```

margin も同じ書き方ができます。

### margin の相殺（マージンの折りたたみ）

隣り合うブロック要素の上下 margin は、重なり合って大きい方だけが適用されます。これを**マージンの相殺（margin collapsing）** と呼びます。

```css
.first {
  margin-bottom: 20px;
}
.second {
  margin-top: 30px;
}
/* 間隔は 20 + 30 = 50px ではなく、大きい方の 30px になる */
```

これは CSS を学ぶ上でよくあるハマりポイントです。「間隔が思った通りにならない」と感じたら、マージンの相殺を思い出してください。

## display プロパティ — 要素の表示方法

HTML の要素は、デフォルトの `display` の値によって 2 種類に大別されます。

### ブロック要素（`display: block`）

- 横幅いっぱいに広がる
- 前後に改行が入る（上下に積み重なる）
- 幅・高さを指定できる
- 例: `<div>`, `<p>`, `<h1>`〜`<h6>`, `<section>`, `<header>`

### インライン要素（`display: inline`）

- 中身の幅だけを占める
- 改行されず、横に並ぶ
- 幅・高さを指定できない
- 例: `<span>`, `<a>`, `<strong>`, `<em>`

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>display の違い</title>
    <style>
      .block-example {
        background-color: #e8f0fe;
        border: 1px solid #4285f4;
        padding: 8px;
        margin: 4px 0;
      }
      .inline-example {
        background-color: #fce8e6;
        border: 1px solid #ea4335;
        padding: 4px;
      }
    </style>
  </head>
  <body>
    <h1>display の違い</h1>

    <h2>ブロック要素</h2>
    <div class="block-example">div 1</div>
    <div class="block-example">div 2</div>
    <div class="block-example">div 3</div>

    <h2>インライン要素</h2>
    <p>
      テキストの中に<span class="inline-example">span 1</span>と
      <span class="inline-example">span 2</span>と
      <span class="inline-example">span 3</span>があります。
    </p>
  </body>
</html>
```

ブラウザで表示すると、ブロック要素は縦に積み重なり、インライン要素はテキストの流れの中に横に並びます。

### display: inline-block

ブロックとインラインの中間的な振る舞いをします。

- インライン要素のように横に並ぶ
- ブロック要素のように幅・高さを指定できる

```css
.badge {
  display: inline-block;
  padding: 4px 12px;
  background-color: #e8f0fe;
  border-radius: 12px;
  font-size: 14px;
}
```

### display: none

要素を完全に非表示にします。画面上にもスペースを取りません。

```css
.hidden {
  display: none;
}
```

> **アクセシビリティの注意**: `display: none` はスクリーンリーダーからも見えなくなります。視覚的に隠したいがスクリーンリーダーには読ませたい場合は、別の方法（`position: absolute` で画面外に飛ばすなど）を使います。

## まとめ

- HTML 要素はすべてボックス（箱）として描画される
- ボックスは content → padding → border → margin の 4 層構造
- `box-sizing: border-box` を使うと、width/height に padding と border が含まれて直感的
- padding は内側の余白、margin は外側の余白。用途が異なる
- 上下の margin は相殺される（大きい方だけが適用される）
- `display` の値でブロック（縦に並ぶ）とインライン（横に並ぶ）が決まる
