# 疑似クラス — :hover の先にある :has() という革命

## 今日のゴール

- 疑似クラスが「要素の状態」に応じてスタイルを変える仕組みだと知る
- `:hover`, `:focus-visible`, `:first-child` などの基本を知る
- `:has()` で「親が子の状態に応じて変わる」ことができるようになったと知る

## 要素の「状態」に応じたスタイル

CSS では、要素の**現在の状態**に応じてスタイルを変えることができます。マウスが乗っている、フォーカスされている、最初の子要素である、など。

この「状態」を指定するのが**疑似クラス**です。セレクタの後ろに `:` を付けて書きます。

```css
a:hover {
  color: red;
}
```

「`<a>` 要素にマウスが乗っているとき、文字色を赤にする」という意味です。

## よく使う疑似クラス

### `:hover` — マウスが乗っている

```css
.button:hover {
  background-color: #14532d;
}
```

### `:focus-visible` — キーボード操作でフォーカスが当たっている

```css
.button:focus-visible {
  outline: 2px solid #064e3b;
  outline-offset: 2px;
}
```

`:focus` はマウスクリック時にも反応しますが、`:focus-visible` はキーボード操作（Tab キーなど）のときだけ反応します。キーボードユーザーにフォーカス位置を示しつつ、マウスユーザーには余計なアウトラインを出さない、アクセシビリティに配慮した疑似クラスです。

### `:first-child`, `:last-child` — 最初/最後の子要素

```css
li:first-child {
  font-weight: bold;
}

li:last-child {
  border-bottom: none;
}
```

### `:disabled` — 無効化されたフォーム要素

```css
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

## CSS は「子」しか選べなかった

ここまでの疑似クラスは、すべて**自分自身の状態**に応じてスタイルを変えています。では、こんな場面はどうでしょう。

「チェックボックスがチェックされたら、**カード全体**の背景色を変えたい」

```html
<div class="card">
  <label>
    <input type="checkbox" /> 選択する
  </label>
  <p>カードの内容</p>
</div>
```

従来の CSS では、これは**不可能**でした。CSS のセレクタは「親 → 子」の方向にしか辿れません。チェックボックス（子）の状態に応じてカード（親）のスタイルを変える「子 → 親」の方向は、CSS だけでは実現できなかったのです。

この制約を突破したのが `:has()` です。

## `:has()` — 親が子の状態を見る

`:has()` は「特定の子要素を**持っている**要素」を選ぶ疑似クラスです。

```css
.card:has(input:checked) {
  background-color: #ecfdf5;
  border-color: #064e3b;
}
```

「チェックされた input を**持っている** `.card`」という意味です。チェックボックスの状態に応じて、カード全体の見た目が変わります。

```mermaid
flowchart TB
  subgraph 従来["従来の CSS"]
    direction TB
    P1["親 .card"] -->|"親 → 子は選べる"| C1["子 input"]
    C1 -.->|"子 → 親は選べない ✗"| P1
  end
  subgraph has["`:has()` あり"]
    direction TB
    P2["親 .card:has(input:checked)"] -->|"子の状態で\n親を選べる ✓"| C2["子 input:checked"]
  end
```

### `:has()` の他の使い方

```css
/* 画像を含む記事だけ余白を広げる */
article:has(img) {
  padding: 24px;
}

/* エラーメッセージを含むフォームグループを赤枠にする */
.form-group:has(.error) {
  border-color: red;
}

/* 空の一覧に「データがありません」を表示 */
.list:has(li) + .empty-message {
  display: none;
}
```

`:has()` は CSS の長年の制約を解消した画期的な疑似クラスです。2026 年 4 月時点で、すべての主要ブラウザが対応しています。

## まとめ

- 疑似クラスは要素の「状態」に応じてスタイルを変える仕組みです
- `:hover` はマウスオーバー、`:focus-visible` はキーボードフォーカス、`:disabled` は無効状態に対応します
- CSS は長い間「親 → 子」の方向にしかセレクタが辿れませんでした
- `:has()` で「子の状態に応じて親のスタイルを変える」ことが可能になりました。CSS のセレクタの歴史的な転換点です
