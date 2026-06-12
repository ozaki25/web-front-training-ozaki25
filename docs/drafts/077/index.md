# モダン CSS — JS の仕事が CSS に移っている

## 今日のゴール

- `:has()`・コンテナクエリ・CSS ネストの 3 機能を知る
- JavaScript で書いていた制御が CSS で済む場面が増えていると知る
- 「それ、CSS でできるよ」と気づけるようになる

## CSS の進化は止まっていない

「CSS は見た目の言語で、たいして変わらない」と思われがちですが、ここ数年で**CSS にできることが劇的に増えて**います。以前は JavaScript でしか実現できなかった制御が、CSS の宣言だけで書けるようになりました。

今日はその中から、**実務で遭遇する可能性が高い 3 つ**に絞って紹介します。

## `:has()` — 親が子を見て変わる

CSS には長年、「**親が子の状態を見てスタイルを変える方法**」がありませんでした。子が親に影響する方向が CSS の構文に無かったのです。

`:has()` がこれを解決しました。

```css
/* 中にチェック済みの input がある label は背景を変える */
label:has(input:checked) {
  background-color: #dbeafe;
}
```

「**〜を持っている要素**」にスタイルを当てられます。

実用例:

```css
/* 中にエラーメッセージがあるフォームグループは枠を赤にする */
.form-group:has([aria-invalid="true"]) {
  border-color: #dc2626;
}

/* 画像がある記事カードだけレイアウトを変える */
.card:has(img) {
  grid-template-columns: 200px 1fr;
}
```

以前なら JavaScript で「この中に checked な input があるか」を判定して className を切り替えていた処理が、CSS の 1 行で済みます。

### 触って確かめる

下のカードのチェックボックスを入れてみてください。**親であるカード全体**の枠と背景が変わります。JavaScript はゼロ、`:has()` の CSS だけです。

<div class="c77-demo">
  <label class="c77-card">
    <input type="checkbox" class="c77-check" />
    このカードを選択する
  </label>
  <label class="c77-card">
    <input type="checkbox" class="c77-check" />
    こちらも選択できる
  </label>
</div>

## コンテナクエリ — 画面幅ではなく親の幅で変わる

レスポンシブデザインでは `@media (min-width: 768px)` で**画面全体の幅**に応じてスタイルを変えてきました。しかし同じカードコンポーネントをサイドバーとメインエリアに配置すると、画面幅は同じなのに**配置場所の幅が違う**。`@media` では使い分けられません。

**コンテナクエリ**は、画面ではなく**親要素の幅**に応じてスタイルを変えます。

```css
.card-wrapper {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 120px 1fr;
  }
}
```

親の幅が 400px 以上なら横並び、未満なら縦積み。**同じコンポーネントが配置場所に応じて自動で形を変える**。これまで JavaScript で親の幅を計測して className を切り替えていた処理が不要になります。

Tailwind CSS 4 では `@container` に対応する `@sm:` のようなプレフィックスも使えます。

## CSS ネスト — セレクタの入れ子が標準に

Sass（CSS の拡張言語）でおなじみだった**セレクタの入れ子**が、素の CSS で書けるようになりました。

```css
/* 従来: 同じ親を何度も書く */
.card { padding: 16px; }
.card .title { font-size: 18px; }
.card .title:hover { color: blue; }
```

```css
/* ネスト: 構造がそのまま見える */
.card {
  padding: 16px;

  .title {
    font-size: 18px;

    &:hover {
      color: blue;
    }
  }
}
```

同じ結果ですが、**ネストで書くと構造の親子関係がインデントに表れる**ので、読みやすさが上がります。`&` は親セレクタ自身を指す記号で、`:hover` や `::before` と組み合わせるのに使います。

Tailwind CSS を主軸にしていると CSS を直接書く場面は少ないですが、ライブラリのスタイルを上書きする場面やグローバル CSS で活きます。

## 「JavaScript でやっていたこと」との境界の変化

3 つの機能に共通するのは、「JavaScript の仕事が CSS に移っている」という流れです。

| やりたいこと | 以前の方法 | 現在の CSS |
|------------|-----------|-----------|
| 子の状態で親のスタイルを変える | JS で親の className を切り替え | `:has()` |
| 配置場所の幅でレイアウトを変える | JS で幅を計測して className を切り替え | `@container` |
| セレクタを構造的に書く | Sass が必要 | 標準の CSS ネスト |

CSS で済むなら、JavaScript のバンドルサイズが減り、レンダリングのパフォーマンスも良くなります（CSS はブラウザのネイティブ処理で、JavaScript よりずっと速い）。

AI がこれらの場面で JavaScript を使ったコードを出してきたら、「**それ、CSS でできるよ**」と提案する余地があります。

## まとめ

- `:has()` は「〜を持つ親」にスタイルを当てる。子の状態で親が変わる
- コンテナクエリは画面幅でなく親の幅でスタイルを変える。配置場所に自動適応
- CSS ネストは素の CSS でセレクタの入れ子が書ける。構造が見やすくなる
- JavaScript でやっていた制御が CSS に移る流れ。CSS で済むなら速くて軽い

<style>
.c77-demo {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px;
  margin: 1.2em 0;
  background: #f8fafc;
}
.c77-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 18px;
  border: 2px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  color: #1e293b;
  font-size: 14px;
  cursor: pointer;
}
.c77-card:has(.c77-check:checked) {
  border-color: #2563eb;
  background: #dbeafe;
  font-weight: 700;
}
.c77-check:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
</style>
