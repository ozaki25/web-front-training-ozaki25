# JavaScript の実行環境 — 同じ言語が複数の場所で動く

## 今日のゴール

- JavaScript は 1 つの言語だが、動く場所が複数あることを知る
- ブラウザと Node.js で使えるものが違うことを知る
- ブラウザにだけある DOM という仕組みがあることを知る

## ブラウザとサーバー、どちらでも動く言語

Web はブラウザとサーバーの 2 つの世界で成り立っています。HTML や CSS はブラウザだけで使われますが、JavaScript はブラウザでもサーバーでも動きます。

```mermaid
flowchart TB
  JS["JavaScript（言語）"]
  JS --> client
  JS --> server
  subgraph client["ブラウザ側"]
    Chrome["Chrome"]
    Safari["Safari"]
    Firefox["Firefox"]
  end
  subgraph server["サーバー側"]
    Node["Node.js"]
    Deno["Deno"]
    Bun["Bun"]
  end
```

| 環境 | 何をするもの |
|------|------------|
| **ブラウザ**（Chrome, Safari, Firefox） | ユーザーの端末で画面を表示する |
| **Node.js** | ブラウザの外で JavaScript を動かす。サーバー処理やコマンドラインツールに使われる |
| **Deno / Bun** | Node.js と同じくサーバー側の環境。仕組みが少しずつ異なる |

同じ JavaScript という言語を使っていますが、動く場所が違います。

## 共通の部分と、環境ごとの部分

JavaScript には ECMAScript と呼ばれる共通の土台があります。変数の宣言、関数、条件分岐といった基本的な文法はこの土台に含まれていて、どの環境でも同じように動きます。

ただし、環境ごとに「追加で使えるもの」が違います。

| 機能 | ブラウザ | Node.js | なぜ違う？ |
|------|:-------:|:-------:|----------|
| 変数、関数、条件分岐 | ✓ | ✓ | 共通の土台（ECMAScript） |
| `document`（HTML の操作） | ✓ | ✗ | ブラウザには画面がある |
| `window`（画面の情報） | ✓ | ✗ | ブラウザには画面がある |
| `fetch`（データの取得） | ✓ | ✓ | どちらもネットワークを使える |
| `fs`（ファイルの読み書き） | ✗ | ✓ | サーバーにはファイルシステムがある |

::: tip 考え方
環境ごとに違う機能があるのは、それぞれの環境にあるものが違うからです。ブラウザには画面がある → 画面を操作する機能がある。サーバーにはファイルシステムがある → ファイルを操作する機能がある。
:::

### 同じカテゴリの環境でも違いがある

「ブラウザかサーバーか」だけでなく、同じカテゴリ内でも差があります。

| 比較 | 何が違う | 例 |
|------|---------|---|
| Chrome vs Safari | 対応する機能が異なる | 新しい CSS や Web API が Chrome にはあるが Safari にはまだない |
| Node.js vs Deno | モジュールやパッケージ管理の仕組みが異なる | `require` vs `import` のデフォルト |

「どのブラウザが対応しているか」を確認するのは Web 開発ではよくある作業です。JavaScript の世界では「どこで動くか」が常に重要な情報です。

## ブラウザにだけある DOM

ブラウザ固有の機能のうち、最も重要なのが DOM（Document Object Model）です。

ブラウザは HTML を読み込むと、タグの入れ子構造をそのままツリー状のデータに変換します。このツリーが DOM です。

```mermaid
flowchart TB
  doc["document"]
  doc --> html["html"]
  html --> head["head"]
  html --> body["body"]
  body --> h1["h1\n見出し"]
  body --> p["p\n段落"]
  body --> button["button\nボタン"]
```

| DOM でできること | 例 |
|----------------|---|
| 要素のテキストを書き換える | 「送信」→「送信済み」 |
| 要素を追加する | エラーメッセージを画面に表示 |
| 要素を削除する | ローディング表示を消す |
| 見た目を変える | ボタンの色を変える |

::: info DOM はブラウザだけ
Node.js には画面がないので DOM がありません。`document` を使おうとすると `document is not defined` というエラーになります。
:::

React はこの DOM 操作の仕組みを大きく変えました。その話はまた別の機会に。

## まとめ

```mermaid
flowchart LR
  subgraph common["共通の土台（ECMAScript）"]
    A["変数・関数・条件分岐"]
  end
  subgraph browser["ブラウザだけ"]
    D["DOM / window"]
  end
  subgraph node["Node.js だけ"]
    F["fs / process"]
  end
```

- JavaScript は 1 つの言語ですが、ブラウザや Node.js など動く場所が複数あります
- 共通の土台（ECMAScript）はどの環境でも同じ。環境ごとに追加されている機能が違います
- ブラウザには画面を操作する DOM があり、Node.js にはファイル操作の `fs` があります
- 同じブラウザ同士（Chrome と Safari）でも、同じサーバー環境同士（Node.js と Deno）でも差があります。「どこで動くか」は常に重要です
