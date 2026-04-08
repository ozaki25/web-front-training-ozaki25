# Day 6: Flexbox

## 今日のゴール

- Flexbox の基本的な仕組み（主軸と交差軸）を理解する
- `justify-content` と `align-items` で要素を配置できる
- 実用的なレイアウトパターンを Flexbox で作れる

## Flexbox とは

Day 5 で学んだ `display: block` や `display: inline` では、要素を横に並べたり、中央に配置したりするのは意外と面倒です。**Flexbox**（フレックスボックス）は、1 方向（横または縦）の要素の配置を簡単に制御できるレイアウトモデルです。

```css
.container {
  display: flex;
}
```

`display: flex` を指定した要素が**フレックスコンテナ**、その直接の子要素が**フレックスアイテム**になります。

## 主軸と交差軸

Flexbox を理解するカギは「2 つの軸」です。

```
主軸（main axis）→ デフォルトは横方向
┌──────────────────────────────┐
│ [アイテム1] [アイテム2] [アイテム3]  │ ← 交差軸（cross axis）
│                                │   デフォルトは縦方向
└──────────────────────────────┘
```

- **主軸（main axis）**: アイテムが並ぶ方向。デフォルトは横（左→右）
- **交差軸（cross axis）**: 主軸と直角の方向。デフォルトは縦

### flex-direction で主軸を変える

```css
.container { display: flex; flex-direction: row; }          /* デフォルト: 横方向 */
.container { display: flex; flex-direction: column; }       /* 縦方向 */
.container { display: flex; flex-direction: row-reverse; }  /* 横方向（逆順） */
```

## 実際に見てみよう

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Flexbox の練習</title>
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

      .container {
        display: flex;
        gap: 12px;
        padding: 16px;
        background-color: #f0f0f0;
        border: 2px solid #ccc;
      }

      .item {
        padding: 16px 24px;
        background-color: #4285f4;
        color: white;
        border-radius: 4px;
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <h1>Flexbox の基本</h1>
    <div class="container">
      <div class="item">1</div>
      <div class="item">2</div>
      <div class="item">3</div>
    </div>
  </body>
</html>
```

ブラウザで開くと、3 つのアイテムが横に並んでいるはずです。`display: flex` を 1 行書くだけで横並びになります。

**`gap`** はアイテム同士の間隔を指定するプロパティです。以前は margin で調整する必要がありましたが、`gap` なら簡潔に書けます。

## justify-content — 主軸方向の配置

主軸方向（デフォルトでは横方向）のアイテムの位置を制御します。

```css
.container {
  display: flex;
  justify-content: flex-start;   /* 左寄せ（デフォルト） */
}
```

| 値 | 動作 |
|-----|------|
| `flex-start` | 先頭に寄せる（デフォルト） |
| `flex-end` | 末尾に寄せる |
| `center` | 中央に寄せる |
| `space-between` | 最初と最後のアイテムを両端に配置し、残りを均等に配分 |
| `space-around` | 各アイテムの周囲に均等な余白 |
| `space-evenly` | すべての間隔が完全に均等 |

先ほどのコードの `.container` に `justify-content` の値をいろいろ変えて試してみてください。

## align-items — 交差軸方向の配置

交差軸方向（デフォルトでは縦方向）のアイテムの位置を制御します。

```css
.container {
  display: flex;
  align-items: center;  /* 縦方向の中央揃え */
  height: 200px;        /* 高さがないと効果がわからない */
}
```

| 値 | 動作 |
|-----|------|
| `stretch` | コンテナの高さいっぱいに伸ばす（デフォルト） |
| `flex-start` | 上に寄せる |
| `flex-end` | 下に寄せる |
| `center` | 中央に寄せる |
| `baseline` | テキストのベースラインに揃える |

## 完全な中央配置

以前の CSS では要素を完全に中央に配置するのは難しい問題でした。Flexbox なら 3 行で実現できます。

```css
.container {
  display: flex;
  justify-content: center;  /* 主軸（横）方向の中央 */
  align-items: center;      /* 交差軸（縦）方向の中央 */
  height: 100vh;            /* ビューポートの高さいっぱい */
}
```

## flex-wrap — 折り返し

デフォルトでは、アイテムは 1 行に収まるよう縮小されます。`flex-wrap: wrap` を指定すると、収まらないときに折り返します。

```css
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
```

## flex プロパティ — アイテムの伸縮

フレックスアイテムに `flex` プロパティを指定すると、余白をどう分配するかを制御できます。

```css
.item {
  flex: 1;  /* 余白を均等に分配 → すべて同じ幅になる */
}
```

`flex` は 3 つの値をまとめたショートハンドです。

| 値 | 意味 | 例 |
|-----|------|-----|
| `flex-grow` | 余白があるとき、どれだけ伸びるか（0 なら伸びない） | `1` |
| `flex-shrink` | スペースが足りないとき、どれだけ縮むか（0 なら縮まない） | `0` |
| `flex-basis` | 伸縮する前の基本サイズ | `250px` |

`flex: 1` は `flex: 1 1 0` の省略形で、「均等に伸び縮みし、基本サイズは 0」という意味です。これを理解すると、次のようなコードが読めるようになります。

```css
.sidebar {
  flex: 0 0 250px;  /* 伸びない・縮まない・幅250px固定 */
}
.main-content {
  flex: 1;           /* 残りの幅を占める */
}
```

## 実用パターン

ナビゲーションバー、カードの横並び、フッターの下端固定という 3 つの定番パターンを、1 つの完全なページにまとめました。

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Flexbox 実用パターン</title>
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

      /* --- ナビバー ---
         space-between でロゴとリンクを両端に配置 */
      .navbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 24px;
        background-color: #1a1a2e;
      }

      .logo {
        color: white;
        font-size: 20px;
        font-weight: bold;
        text-decoration: none;
      }

      .nav-links {
        display: flex;
        gap: 24px;
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .nav-links a {
        color: white;
        text-decoration: none;
      }

      /* --- スティッキーフッター ---
         ページ全体を column 方向の Flex にし、
         main に flex: 1 を指定してフッターを下端に押し出す */
      .page {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }

      .page-content {
        flex: 1;
        padding: 24px;
      }

      /* --- カードグリッド ---
         flex-wrap: wrap で折り返し、
         flex: 1 1 300px で最小 300px・均等に伸縮 */
      .card-container {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
      }

      .card {
        flex: 1 1 300px;
        padding: 24px;
        border: 1px solid #ddd;
        border-radius: 8px;
      }

      .card h2 {
        margin-top: 0;
      }

      .page-footer {
        padding: 16px 24px;
        background-color: #333;
        color: white;
      }
    </style>
  </head>
  <body>
    <div class="page">
      <nav class="navbar" aria-label="メインナビゲーション">
        <a href="/" class="logo">MySite</a>
        <ul class="nav-links">
          <li><a href="/about">会社概要</a></li>
          <li><a href="/services">サービス</a></li>
          <li><a href="/contact">お問い合わせ</a></li>
        </ul>
      </nav>

      <main class="page-content">
        <h1>サービス一覧</h1>
        <div class="card-container">
          <article class="card">
            <h2>Web 制作</h2>
            <p>レスポンシブ対応のサイトを制作します。</p>
          </article>
          <article class="card">
            <h2>アプリ開発</h2>
            <p>モバイル・デスクトップアプリを開発します。</p>
          </article>
          <article class="card">
            <h2>コンサルティング</h2>
            <p>技術選定や設計の相談に対応します。</p>
          </article>
        </div>
      </main>

      <footer class="page-footer">
        <p>&copy; 2026 MySite</p>
      </footer>
    </div>
  </body>
</html>
```

ポイントを整理します。

- **ナビバー**: `justify-content: space-between` でロゴとリンクを左右に配置し、`align-items: center` で縦方向を揃えています。`<nav>` タグに `aria-label` 属性を付けると、ページ内に複数のナビゲーションがある場合にスクリーンリーダーで区別できます
- **スティッキーフッター**: `.page` を `flex-direction: column` + `min-height: 100vh` にし、`.page-content` に `flex: 1` を指定します。メインコンテンツが残りの高さをすべて占めるので、フッターは常に画面の下端に押し出されます
- **カードグリッド**: `flex-wrap: wrap` と `flex: 1 1 300px` の組み合わせです。各カードは最小 300px を確保しつつ、余白があれば均等に伸びます。画面幅が狭くなると自動的に折り返します

## まとめ

- `display: flex` で Flexbox を有効にする。子要素が自動的に横に並ぶ
- 主軸（アイテムが並ぶ方向）と交差軸（それと直角の方向）の 2 軸で考える
- `justify-content` で主軸方向、`align-items` で交差軸方向の配置を制御する
- `gap` でアイテム間の間隔を指定する
- `flex-wrap: wrap` で折り返しを有効にする
- `flex: 1` で余白を均等に分配できる
- ナビバー、カードレイアウト、フッター固定など、実用的なパターンが簡単に実現できる

**次のレッスン**: [Day 7: CSS Grid](/lessons/day07/)
