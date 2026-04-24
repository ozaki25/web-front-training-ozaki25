# レスポンシブデザイン — 画面幅でスタイルが変わる仕組み

## 今日のゴール

- 同じ HTML でも画面幅によって見た目を変えられることを知る
- メディアクエリの仕組みを知る
- モバイルファーストという考え方を知る

## 同じページなのにスマホと PC で見た目が違う

Web サイトをスマホで開いたときと PC で開いたとき、レイアウトが違うことがあります。スマホでは 1 列、PC では 3 列のカード一覧。ナビゲーションがスマホではハンバーガーメニューになる。

これは別々の HTML を用意しているわけではありません。**同じ HTML に対して、画面幅に応じて異なる CSS を適用している**だけです。この考え方を**レスポンシブデザイン**と呼びます。

## メディアクエリ — 「画面幅が〇〇以上のとき」

CSS には `@media` という仕組みがあります。「この条件を満たすときだけ、このスタイルを適用する」というルールを書けます。

```css
.card-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (min-width: 768px) {
  .card-list {
    flex-direction: row;
    flex-wrap: wrap;
  }
}
```

この CSS は次のように動きます。

- **画面幅が 768px 未満**（スマホ）: カードは縦に 1 列で並ぶ
- **画面幅が 768px 以上**（タブレット・PC）: カードは横に並び、折り返す

`@media (min-width: 768px)` が**メディアクエリ**です。「画面幅が 768px 以上のとき」という条件を表しています。

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>レスポンシブの例</title>
    <style>
      .card-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
        list-style: none;
        padding: 0;
      }
      .card {
        padding: 16px;
        background-color: #e8f0fe;
        border: 1px solid #93c5fd;
        border-radius: 8px;
      }
      @media (min-width: 768px) {
        .card-list {
          flex-direction: row;
          flex-wrap: wrap;
        }
        .card {
          width: calc(33.333% - 11px);
        }
      }
    </style>
  </head>
  <body>
    <ul class="card-list" aria-label="お知らせ一覧">
      <li class="card">カード 1</li>
      <li class="card">カード 2</li>
      <li class="card">カード 3</li>
    </ul>
  </body>
</html>
```

ブラウザの幅を狭くしたり広くしたりすると、レイアウトが切り替わるのが確認できます。

## モバイルファースト — 狭い画面を先に書く

メディアクエリの書き方には 2 つの方向があります。

- `min-width`: 「〇〇px **以上**のとき」 → 狭い画面のスタイルがベース
- `max-width`: 「〇〇px **以下**のとき」 → 広い画面のスタイルがベース

現在の主流は `min-width` を使う**モバイルファースト**です。

```css
/* ベース: スマホ向け（狭い画面） */
.nav {
  flex-direction: column;
}

/* 768px 以上: タブレット・PC 向け */
@media (min-width: 768px) {
  .nav {
    flex-direction: row;
  }
}
```

モバイルファーストが主流な理由は、スマホで見る人が多いこと、そして**狭い画面のレイアウトのほうがシンプル**だからです。シンプルなスタイルをベースに、画面が広くなるにつれて装飾や列数を足していくほうが、CSS が複雑になりにくいです。

## ブレークポイント — 切り替えの境界

メディアクエリで指定する幅の値を**ブレークポイント**と呼びます。よく使われる値は以下のとおりです。

| ブレークポイント | 対象 |
|----------------|------|
| 640px | スマホ（横向き） |
| 768px | タブレット |
| 1024px | ノート PC |
| 1280px | デスクトップ |

これは Tailwind CSS のデフォルトのブレークポイントと同じです。値を覚える必要はありません。「こういう切り替え地点がある」と知っておくだけで十分です。

| Tailwind のクラス | 対応するメディアクエリ |
|------------------|---------------------|
| `sm:` | `@media (min-width: 640px)` |
| `md:` | `@media (min-width: 768px)` |
| `lg:` | `@media (min-width: 1024px)` |
| `xl:` | `@media (min-width: 1280px)` |

## viewport メタタグ

レスポンシブデザインを正しく動かすために、HTML の `<head>` に必ず入れる 1 行があります。

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

これがないと、スマホのブラウザは「このページは PC 向けだ」と判断して、画面を縮小して表示します。メディアクエリも意図どおりに動きません。

HTML を書くとき、この 1 行が抜けていたらレスポンシブは機能しません。

## まとめ

- 同じ HTML に対して、画面幅に応じて異なるスタイルを当てるのがレスポンシブデザインです
- `@media (min-width: 768px) { ... }` のようなメディアクエリで条件を書きます
- 狭い画面を先に書いて広い画面で足す「モバイルファースト」が現在の主流です
- Tailwind の `md:` `lg:` はメディアクエリのショートカットです
- `<meta name="viewport" ...>` がないとレスポンシブは動きません
