# Day 8: レスポンシブデザインと CSS の課題

## 今日のゴール

- レスポンシブデザインの考え方と必要性を理解する
- メディアクエリの書き方を知る
- モバイルファーストの設計手法を理解する
- コンテナクエリで「コンポーネント単位のレスポンシブ」を知る
- CSS のグローバルスコープ問題を体感し、後の学習（CSS Modules や Tailwind CSS）への橋渡しとする

## レスポンシブデザインとは

スマートフォン、タブレット、PC — 画面サイズはさまざまです。**レスポンシブデザイン**は、1 つの HTML で画面サイズに応じてレイアウトを変える設計手法です。

デバイスごとに別の HTML を作るのではなく、CSS で表示を切り替えます。

## ビューポートの設定

Day 1 で書いた以下の meta タグを覚えていますか？

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

**ビューポート**は「ブラウザの表示領域」のことです。この meta タグがないと、スマートフォンのブラウザは PC 向けの幅（通常 980px）を想定してページを表示し、全体を縮小して見せようとします。結果、文字が極端に小さくなります。

`width=device-width` は「ビューポートの幅をデバイスの画面幅に合わせる」という意味です。レスポンシブデザインには必須の設定です。

## メディアクエリ

画面幅に応じて CSS を切り替える仕組みが**メディアクエリ**です。

```css
/* 基本のスタイル（すべての画面サイズに適用） */
.container {
  padding: 16px;
}

/* 画面幅が 768px 以上のとき */
@media (min-width: 768px) {
  .container {
    padding: 24px;
    max-width: 720px;
    margin: 0 auto;
  }
}

/* 画面幅が 1024px 以上のとき */
@media (min-width: 1024px) {
  .container {
    max-width: 960px;
  }
}
```

`@media (min-width: 768px)` は「画面幅が 768px 以上の場合に、中の CSS を適用する」という意味です。この境界値を**ブレークポイント**と呼びます。

## モバイルファースト

上の例では小さい画面のスタイルを基本にし、`min-width` で大きい画面のスタイルを追加しています。この設計手法を**モバイルファースト**と呼びます。

```css
/* ❌ デスクトップファースト（max-width で小さい画面を対応） */
.nav-links {
  display: flex;
  gap: 24px;
}
@media (max-width: 767px) {
  .nav-links {
    flex-direction: column;
    gap: 8px;
  }
}

/* ✅ モバイルファースト（min-width で大きい画面を対応） */
.nav-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
@media (min-width: 768px) {
  .nav-links {
    flex-direction: row;
    gap: 24px;
  }
}
```

モバイルファーストが推奨される理由:

1. **スマートフォンのユーザーが多い**: 多くの Web サイトでモバイルからのアクセスが半数以上
2. **小さい画面から設計する方が楽**: 小さい画面のシンプルなレイアウトを基本にして、大きい画面で余白を活用する方が自然
3. **パフォーマンス**: 小さい画面のデバイスは処理能力も低いことが多い。基本スタイルをシンプルにしておくことで、読み込みが軽くなる

## 実際に書いてみよう

Day 7 で学んだ Grid と組み合わせて、レスポンシブなページを作ってみましょう。

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>レスポンシブデザイン</title>
    <style>
      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }

      body {
        font-family: sans-serif;
        margin: 0;
        line-height: 1.8;
        color: #333;
      }

      .header {
        background-color: #1a1a2e;
        color: white;
        padding: 16px;
      }

      .header-inner {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .nav-links {
        display: flex;
        flex-direction: column;
        gap: 4px;
        list-style: none;
        padding: 0;
        margin: 8px 0 0;
      }

      .nav-links a {
        color: #ccc;
        text-decoration: none;
      }

      .main-content {
        padding: 16px;
      }

      .card-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .card {
        padding: 24px;
        border: 1px solid #ddd;
        border-radius: 8px;
      }

      .card h2 {
        margin-top: 0;
      }

      /* タブレット以上 */
      @media (min-width: 768px) {
        .nav-links {
          flex-direction: row;
          gap: 24px;
          margin: 0;
        }

        .main-content {
          max-width: 960px;
          margin: 0 auto;
          padding: 24px;
        }

        .card-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      /* デスクトップ */
      @media (min-width: 1024px) {
        .card-grid {
          grid-template-columns: repeat(3, 1fr);
        }
      }
    </style>
  </head>
  <body>
    <header class="header">
      <div class="header-inner">
        <strong>MySite</strong>
        <nav aria-label="メインナビゲーション">
          <ul class="nav-links">
            <li><a href="/">ホーム</a></li>
            <li><a href="/about">概要</a></li>
            <li><a href="/contact">お問い合わせ</a></li>
          </ul>
        </nav>
      </div>
    </header>

    <main class="main-content">
      <h1>サービス一覧</h1>

      <!-- <article> は独立したコンテンツのまとまりを表すセマンティックタグです。
           ブログ記事やニュースなど、それ単体で意味をなすコンテンツに使います。 -->
      <div class="card-grid">
        <article class="card">
          <h2>Web 開発</h2>
          <p>モダンな技術スタックで Web アプリケーションを開発します。</p>
        </article>
        <article class="card">
          <h2>UI デザイン</h2>
          <p>ユーザーにとって使いやすいインターフェースを設計します。</p>
        </article>
        <article class="card">
          <h2>コンサルティング</h2>
          <p>技術選定やアーキテクチャの相談に対応します。</p>
        </article>
      </div>
    </main>
  </body>
</html>
```

ブラウザの幅を変えてみてください。

- **狭い画面**: ナビリンクが縦並び、カードが 1 列
- **768px 以上**: ナビリンクが横並び、カードが 2 列
- **1024px 以上**: カードが 3 列

DevTools で画面幅を変えるには、DevTools を開いた状態で左上のデバイスアイコン（Toggle device toolbar）をクリックします。

## ユーザー設定に応じたスタイル

メディアクエリは画面幅だけでなく、**ユーザーの環境設定**も検知できます。

```css
/* ダークモードが有効なユーザー向け */
@media (prefers-color-scheme: dark) {
  body {
    background-color: #1a1a2e;
    color: #e0e0e0;
  }
}

/* アニメーションを減らしたいユーザー向け */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition-duration: 0.01ms !important;
  }
}
```

`prefers-color-scheme` は OS やブラウザのダークモード設定を、`prefers-reduced-motion` は「視差効果を減らす」設定を検知します。特に `prefers-reduced-motion` はアクセシビリティの観点で重要です。前庭障害のある方にとって、画面上の動きは体調不良の原因になることがあります。

## コンテナクエリ — コンポーネントに合わせたレスポンシブ

メディアクエリは**ビューポート（画面全体）**の幅で切り替えます。しかし、同じカードコンポーネントがサイドバーにもメインエリアにも使われる場合、画面幅だけでは適切なスタイルを選べません。

```
画面幅 1200px のとき:
┌──────────────────────────────────┐
│ メインエリア（広い）  │サイドバー │
│ → カード横並びが良い  │（狭い）  │
│                      │→ カード  │
│                      │ 縦並びが │
│                      │ 良い    │
└──────────────────────────────────┘

メディアクエリだと画面幅 1200px で一律に判断 → サイドバーのカードまで横並びに…
```

**コンテナクエリ**は、画面幅ではなく**親要素の幅**に応じてスタイルを切り替えます。

```css
/* ① 親要素をコンテナとして宣言する */
.card-wrapper {
  container-type: inline-size;
}

/* ② コンテナの幅が 400px 以上なら横並びにする */
@container (min-width: 400px) {
  .card {
    display: flex;
    gap: 16px;
  }
}
```

`container-type: inline-size` は「この要素の横幅をコンテナクエリの基準にする」という宣言です。`@container` は `@media` と同じ構文ですが、参照するのが**ビューポート**ではなく**直近のコンテナ祖先**です。

これにより、同じカードコンポーネントでも:

- メインエリア（幅 800px）に置けば → 横並び
- サイドバー（幅 300px）に置けば → 縦並び

と、**置かれた場所に応じて自動的にレイアウトが変わります**。

> **メディアクエリ vs コンテナクエリの使い分け**
> - ページ全体のレイアウト（ナビの折り返し、カラム数）→ メディアクエリ
> - 個々のコンポーネントの見た目 → コンテナクエリ
>
> 後のレッスンで学ぶ React のコンポーネントは再利用が前提なので、コンテナクエリとの相性が特に良いです。

## CSS のグローバルスコープ問題

ここまで CSS を書いてきて「便利だ」と感じた一方で、ある問題に気づいたかもしれません。**CSS はすべてがグローバル**です。

### 問題を体感してみる

以下のような 2 つのコンポーネントがあるとします。

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CSS のグローバルスコープ問題</title>
    <link rel="stylesheet" href="header.css" />
    <link rel="stylesheet" href="card.css" />
  </head>
  <body>
    <header>
      <h2 class="title">サイトヘッダー</h2>
    </header>
    <main>
      <div class="card">
        <h2 class="title">カードのタイトル</h2>
        <p>カードの内容です。</p>
      </div>
    </main>
  </body>
</html>
```

**header.css:**
```css
.title {
  color: white;
  font-size: 24px;
}
```

**card.css:**
```css
.title {
  color: #333;
  font-size: 18px;
}
```

両方とも `.title` というクラス名を使っています。CSS はファイルを分けても最終的にはすべてが 1 つのグローバルな空間で評価されるため、**後から読み込まれた方が勝ちます**。意図せずスタイルが上書きされてしまうのです。

### 小さなプロジェクトでは問題にならないが…

数ページのサイトなら、命名に気をつければ何とかなります。しかし、チームで開発する大規模なプロジェクトでは:

- 他の人が作ったコンポーネントと同じクラス名を使ってしまう
- ある場所のスタイル修正が、思いもよらない別の場所に影響する
- クラス名の衝突を避けるために名前がどんどん長くなる

こうした問題を解決するために、さまざまな仕組みが生まれました。

- **BEM 記法**: `.header__title` のように命名規則で衝突を防ぐ（人間の努力に依存）
- **CSS Modules**: ファイルごとにスコープを作り、クラス名を自動的にユニークにする
- **Tailwind CSS**: クラス名でスタイルを直接指定し、カスタムクラスの命名自体を避ける

これらは後のレッスン（React や Next.js を学ぶとき）で詳しく扱います。今日覚えておいてほしいのは、**「CSS はグローバルスコープで、これは大規模開発で問題になる」**ということです。この問題意識があるからこそ、CSS Modules や Tailwind CSS のような仕組みの価値がわかります。

## まとめ

- レスポンシブデザインは、1 つの HTML で画面サイズに応じて見た目を変える手法
- `<meta name="viewport">` はレスポンシブデザインの必須設定
- `@media (min-width: ...)` でブレークポイントごとにスタイルを切り替える
- モバイルファーストで設計する: 小さい画面を基本に、大きい画面のスタイルを `min-width` で追加
- `@container` でコンポーネントが置かれた場所に応じてスタイルを切り替えられる
- CSS はすべてがグローバルスコープ。大規模開発ではクラス名の衝突が深刻な問題になる
- この問題を解決するために CSS Modules や Tailwind CSS が存在する（後のレッスンで学ぶ）

**次のレッスン**: [Day 9: JavaScript の基本文法](/lessons/day09/)
