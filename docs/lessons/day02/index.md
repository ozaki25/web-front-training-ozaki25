# Day 2: リンクと画像

## 今日のゴール

- `<a>` タグでリンクを作成できる
- `<img>` タグで画像を表示できる
- 相対パスと絶対パスの違いを理解する
- `alt` 属性がなぜ重要かを説明できる

## リンク — Web をつなぐ仕組み

Web の「Web（クモの巣）」という名前は、ページ同士がリンクでつながっている様子に由来します。リンクを作るのが `<a>`（anchor = 錨）タグです。

```html
<a href="https://example.com">Example サイトへ</a>
```

`href`（hypertext reference）属性にリンク先の URL を書きます。タグで囲んだテキストがクリックできるリンクになります。

### リンクのテキストは具体的に書く

```html
<!-- ❌ リンク先が何かわからない -->
<p>詳細は<a href="/about">こちら</a>をご覧ください。</p>

<!-- ✅ リンク先の内容がテキストからわかる -->
<p><a href="/about">会社概要ページ</a>をご覧ください。</p>
```

スクリーンリーダーを使っている人は、リンクだけを一覧で読み上げる機能をよく使います。「こちら」「ここ」ばかりだと、どのリンクがどこに行くのかわかりません。**リンクテキストだけで行き先がわかる**ように書きましょう。

### 新しいタブで開く

```html
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
  外部サイトを新しいタブで開く
</a>
```

`target="_blank"` を使うと新しいタブで開きます。この場合、セキュリティ上の理由から `rel="noopener noreferrer"` を必ず付けます。`noopener` は、開いた先のページが元のページを操作できないようにするための指定です。

### ページ内リンク

同じページ内の特定の場所に飛ぶこともできます。移動先の要素に `id` 属性を付け、`href` に `#` + その id を指定します。

```html
<a href="#contact">お問い合わせセクションへ</a>

<!-- ページのずっと下の方 -->
<section id="contact">
  <h2>お問い合わせ</h2>
  <p>メールでご連絡ください。</p>
</section>
```

## 画像

画像を表示するには `<img>` タグを使います。`<img>` は**空要素**（閉じタグがない要素）です。

```html
<img src="photo.jpg" alt="東京タワーの夜景" />
```

| 属性 | 役割 |
|------|------|
| `src` | 画像ファイルのパス（source の略） |
| `alt` | 画像の代替テキスト（alternative の略） |

### `alt` 属性はなぜ必要か

`alt` 属性は「画像が表示されないとき」や「画像を見られないとき」に使われます。

1. **スクリーンリーダー**: 視覚障害のある方がページを閲覧するとき、スクリーンリーダーは `alt` のテキストを読み上げます。`alt` がなければ画像の存在自体がわからず、情報が欠落します
2. **画像読み込み失敗時**: ネットワーク障害などで画像が表示されないとき、`alt` テキストが代わりに表示されます
3. **検索エンジン**: 検索エンジンは画像の内容を直接理解できないため、`alt` テキストを手がかりにします

### 良い `alt` テキストの書き方

```html
<!-- ❌ 意味がない alt -->
<img src="logo.png" alt="画像" />
<img src="photo.jpg" alt="写真" />

<!-- ✅ 画像の内容を具体的に説明 -->
<img src="logo.png" alt="株式会社サンプルのロゴ" />
<img src="photo.jpg" alt="桜が満開の上野公園" />

<!-- ✅ 装飾的な画像（情報を持たない）は alt を空にする -->
<img src="divider.png" alt="" />
```

装飾的な画像（区切り線の画像など）は `alt=""` と空にします。`alt` 属性自体を省略するのではなく、**空の値を明示的に指定**します。こうするとスクリーンリーダーはその画像を読み飛ばします。

### width と height を指定する

```html
<img src="photo.jpg" alt="桜が満開の上野公園" width="800" height="600" />
```

`width` と `height` を書いておくと、画像の読み込み前にブラウザがそのスペースを確保できます。これにより、読み込み中にページのレイアウトがガタッと動く現象（**レイアウトシフト**）を防げます。

## パスの指定方法

画像の `src` やリンクの `href` にはパス（ファイルの場所）を指定します。パスには 2 種類あります。

### 絶対パス

完全な URL を指定します。外部サイトのリソースを参照するときに使います。

```html
<img src="https://example.com/images/photo.jpg" alt="サンプル画像" />
<a href="https://example.com">外部サイト</a>
```

### 相対パス

現在のファイルの場所を基準にした指定です。同じサイト内のファイルを参照するときに使います。

以下のようなフォルダ構成を想定します。

```
my-site/
├── index.html
├── about.html
├── images/
│   ├── logo.png
│   └── photo.jpg
└── pages/
    └── contact.html
```

`index.html` から見た場合:

```html
<!-- 同じフォルダの別ファイル -->
<a href="about.html">会社概要</a>

<!-- サブフォルダのファイル -->
<img src="images/logo.png" alt="ロゴ" />

<!-- サブフォルダの中のファイル -->
<a href="pages/contact.html">お問い合わせ</a>
```

`pages/contact.html` から見た場合:

```html
<!-- 親フォルダに戻る（../ は「1つ上のフォルダ」の意味） -->
<a href="../index.html">トップへ戻る</a>

<!-- 親フォルダの中の images フォルダ -->
<img src="../images/logo.png" alt="ロゴ" />
```

### ルート相対パス

`/` から始めると、サイトのルート（最上位）からのパスになります。どのページから参照しても同じパスで書けるので便利です。

```html
<img src="/images/logo.png" alt="ロゴ" />
```

> **注意**: ルート相対パスはサーバー上でのみ動作します。ファイルをダブルクリックで開いている場合は使えません。

## 実際に書いてみよう

Day 1 で作った自己紹介ページを拡張しましょう。同じフォルダに `images` フォルダを作り、適当な画像ファイルを置いてください（手元に画像がなければ、この手順は読むだけで OK です）。

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>自己紹介 - 山田太郎</title>
  </head>
  <body>
    <header>
      <h1>山田太郎</h1>
      <p>東京都在住のエンジニアです。</p>
    </header>

    <nav>
      <ul>
        <li><a href="#about">自己紹介</a></li>
        <li><a href="#hobby">趣味</a></li>
        <li><a href="#links">リンク集</a></li>
      </ul>
    </nav>

    <main>
      <section id="about">
        <h2>自己紹介</h2>
        <img
          src="images/profile.jpg"
          alt="山田太郎のプロフィール写真"
          width="200"
          height="200"
        />
        <p>Web 開発に興味があり、日々勉強しています。</p>
      </section>

      <section id="hobby">
        <h2>趣味</h2>
        <ul>
          <li>読書</li>
          <li>ランニング</li>
          <li>プログラミング</li>
        </ul>
      </section>

      <section id="links">
        <h2>リンク集</h2>
        <ul>
          <li>
            <a href="https://developer.mozilla.org/ja/" target="_blank" rel="noopener noreferrer">
              MDN Web Docs — Web 技術の公式リファレンス
            </a>
          </li>
          <li>
            <a href="https://web.dev/" target="_blank" rel="noopener noreferrer">
              web.dev — Google による Web 開発ガイド
            </a>
          </li>
        </ul>
      </section>
    </main>

    <footer>
      <p>© 2026 山田太郎</p>
    </footer>
  </body>
</html>
```

Day 1 から追加されたポイントを確認しましょう。

- **`<nav>`** タグ — ナビゲーション（ページ内の主要なリンク群）を表すセマンティックタグです。スクリーンリーダーは「ナビゲーション」としてユーザーに伝えます
- **ページ内リンク** — `href="#about"` で `id="about"` の場所に飛びます
- **画像** — `alt` と `width`/`height` を適切に指定しています
- **外部リンク** — `target="_blank"` と `rel="noopener noreferrer"` をセットで使っています

## まとめ

- `<a href="URL">テキスト</a>` でリンクを作る。リンクテキストは具体的に書く
- `<img src="パス" alt="説明" />` で画像を表示する。`alt` は必須
- パスには絶対パス・相対パス・ルート相対パスの 3 種類がある
- `alt` 属性はアクセシビリティ・画像読み込み失敗時・SEO のすべてに関わる重要な属性
- `<nav>` はナビゲーションを表すセマンティックタグ
