# Day 7: CSS Grid

## 今日のゴール

- CSS Grid の基本的な仕組みを理解する
- `grid-template-columns` / `grid-template-rows` でグリッドを定義できる
- `fr` 単位の意味と使い方を知る
- Flexbox と Grid をどう使い分けるか説明できる

## CSS Grid とは

Day 6 で学んだ Flexbox は「1 方向（横または縦）」のレイアウトが得意でした。CSS Grid は**2 方向（横と縦の両方）**を同時に制御できるレイアウトモデルです。

Flexbox が「1 列のアイテムをどう並べるか」なら、Grid は「格子状のマス目にアイテムをどう配置するか」です。

## 基本的な使い方

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CSS Grid の練習</title>
    <style>
      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }

      body {
        font-family: sans-serif;
        padding: 20px;
      }

      .grid-container {
        display: grid;
        grid-template-columns: 200px 200px 200px;
        gap: 12px;
        padding: 16px;
        background-color: #f0f0f0;
        border: 2px solid #ccc;
      }

      .grid-item {
        padding: 24px;
        background-color: #34a853;
        color: white;
        border-radius: 4px;
        font-weight: bold;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <h1>CSS Grid の基本</h1>
    <div class="grid-container">
      <div class="grid-item">1</div>
      <div class="grid-item">2</div>
      <div class="grid-item">3</div>
      <div class="grid-item">4</div>
      <div class="grid-item">5</div>
      <div class="grid-item">6</div>
    </div>
  </body>
</html>
```

`grid-template-columns: 200px 200px 200px` で「200px の列を 3 つ」定義しています。6 つのアイテムが 3 列 × 2 行に自動的に配置されます。

## fr 単位 — 余白を分配する

`fr`（fraction = 分数）は、利用可能な余白を比率で分配する単位です。

```css
.grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;  /* 3等分 */
  gap: 12px;
}
```

比率を変えることもできます。

```css
/* 左のサイドバーが1、メインが3の比率 */
grid-template-columns: 1fr 3fr;

/* 固定幅とfrの組み合わせ */
grid-template-columns: 250px 1fr;  /* サイドバー250px固定、残りがメイン */
```

`fr` のメリットは、画面幅が変わっても自動的に比率を保ってくれることです。

## repeat() — 同じ指定の繰り返し

同じ幅の列を複数作るなら `repeat()` が便利です。

```css
/* 以下の2つは同じ意味 */
grid-template-columns: 1fr 1fr 1fr 1fr;
grid-template-columns: repeat(4, 1fr);   /* 1fr を4回繰り返す */
```

## grid-template-rows — 行の高さ

列と同じように、行の高さも指定できます。

```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 100px 200px;  /* 1行目100px、2行目200px */
  gap: 12px;
}
```

行の高さを指定しない場合は、中身の高さに応じて自動的に決まります。

## アイテムの配置を指定する

Grid ではアイテムが占めるエリアを明示的に指定できます。配置の指定には**グリッドライン（線）**の番号を使います。列が 3 つの場合、グリッドラインは左端から右端まで 4 本あります。

```
ライン:  1     2     3     4
         |  列1 |  列2 |  列3 |
```

`grid-column: 1 / 4` は「ライン 1 からライン 4 まで = 3 列分」という意味です。

```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto auto auto;
  gap: 12px;
}

.header {
  grid-column: 1 / 4;  /* 1列目から4列目の線まで = 3列分 */
}

.sidebar {
  grid-column: 1 / 2;  /* 1列目 */
  grid-row: 2 / 4;     /* 2行目から4行目の線まで = 2行分 */
}

.main {
  grid-column: 2 / 4;  /* 2列目から3列目 */
}

.footer {
  grid-column: 1 / 4;  /* 3列分 */
}
```

## grid-template-areas — 名前でレイアウト

より直感的な方法として、エリアに名前を付けてレイアウトを定義できます。

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Grid レイアウト</title>
    <style>
      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }

      body {
        font-family: sans-serif;
        margin: 0;
      }

      .page {
        display: grid;
        grid-template-areas:
          "header  header"
          "sidebar main"
          "footer  footer";
        grid-template-columns: 250px 1fr;
        grid-template-rows: auto 1fr auto;
        min-height: 100vh;
        gap: 0;
      }

      .page-header {
        grid-area: header;
        background-color: #1a1a2e;
        color: white;
        padding: 16px 24px;
      }

      .page-sidebar {
        grid-area: sidebar;
        background-color: #f5f5f5;
        padding: 24px;
      }

      .page-main {
        grid-area: main;
        padding: 24px;
      }

      .page-footer {
        grid-area: footer;
        background-color: #333;
        color: white;
        padding: 16px 24px;
      }
    </style>
  </head>
  <body>
    <div class="page">
      <header class="page-header">
        <h1>サイト名</h1>
      </header>

      <nav class="page-sidebar" aria-label="サイドナビゲーション">
        <h2>メニュー</h2>
        <ul>
          <li><a href="/">ホーム</a></li>
          <li><a href="/about">概要</a></li>
          <li><a href="/contact">お問い合わせ</a></li>
        </ul>
      </nav>

      <main class="page-main">
        <h2>メインコンテンツ</h2>
        <p>ここにページの主要な内容が入ります。</p>
      </main>

      <footer class="page-footer">
        <p>© 2026 サンプルサイト</p>
      </footer>
    </div>
  </body>
</html>
```

`grid-template-areas` の文字列がそのままレイアウトの視覚的な表現になっています。コードを見ただけでレイアウトがわかるのが大きなメリットです。

## auto-fill と auto-fit — レスポンシブなグリッド

画面幅に応じて列数を自動的に変えたい場合に使います。ここで新しい関数 `minmax()` が登場します。

### minmax() — サイズの範囲を指定する

`minmax(最小値, 最大値)` は、トラック（列や行）のサイズに「最小ここまで、最大ここまで」という範囲を与える関数です。たとえば `minmax(300px, 1fr)` は「300px より小さくはならないが、余白があれば 1fr 分まで広がる」という意味になります。

### auto-fill で列数を自動化する

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
```

- `minmax(300px, 1fr)` — 各列は最小 300px、余白があれば均等に広がる
- `auto-fill` — コンテナに入るだけ列を作る

この 1 行で「最小 300px のカードを隙間なく敷き詰め、画面幅に応じて列数が変わる」というレスポンシブなレイアウトが実現できます。メディアクエリ（Day 8 で学びます）を使わなくても柔軟なレイアウトが作れます。

### auto-fill と auto-fit の違い

`auto-fill` と似たキーワードに `auto-fit` があります。アイテムが十分にある場合は同じ結果になりますが、**アイテムが少なくて余白が生まれる場合**に違いが出ます。

- **`auto-fill`** — アイテムがなくても空のトラック（列）を確保する。余った列はスペースとして残る
- **`auto-fit`** — 空のトラックを 0 幅に折りたたむ。その分、既存のアイテムが `1fr` で広がりスペースを埋める

アイテム数が不定で「少ないときは幅いっぱいに広げたい」なら `auto-fit`、「常に同じ列幅を保ちたい」なら `auto-fill` が適しています。

## Flexbox と Grid の使い分け

| 比較ポイント | Flexbox | Grid |
|-------------|---------|------|
| 方向 | 1 方向（横 or 縦） | 2 方向（横と縦を同時に） |
| 得意な場面 | ナビバー、ボタン群、横並び | ページ全体のレイアウト、カードグリッド |
| アイテムの配置 | 中身に応じて柔軟に | グリッド線に沿って正確に |
| 使い分けの目安 | 「1 列に並べたい」 | 「行と列で整列させたい」 |

**どちらか一方しか使えないわけではありません。** 実務ではページ全体を Grid で組み、ナビバーやカード内部は Flexbox で組む、というように併用するのが普通です。

## まとめ

- `display: grid` で CSS Grid を有効にする
- `grid-template-columns` で列の幅、`grid-template-rows` で行の高さを定義する
- `fr` 単位で余白を比率で分配できる
- `repeat()` で同じ指定を繰り返せる
- `grid-template-areas` で名前を使った直感的なレイアウト定義ができる
- `auto-fill` + `minmax()` でレスポンシブなグリッドが作れる
- Flexbox は 1 方向、Grid は 2 方向。場面に応じて使い分け、併用もする

**次のレッスン**: [Day 8: レスポンシブデザインと CSS の課題](/lessons/day08/)
