# JavaScript の実行環境 — 同じ言語が複数の場所で動く

## 今日のゴール

- JavaScript は 1 つの言語だが、動く場所が複数あることを知る
- ブラウザと Node.js で使えるものが違うことを知る
- ブラウザにだけある DOM という仕組みがあることを知る

## ブラウザとサーバー、どちらでも動く言語

Web はブラウザとサーバーの 2 つの世界で成り立っています。HTML や CSS はブラウザだけで使われますが、JavaScript はブラウザでもサーバーでも動きます。

```mermaid
flowchart LR
  subgraph server["サーバー側"]
    N["Node.js"]
  end
  subgraph client["ブラウザ側"]
    B["JavaScript"]
  end
  JS["JavaScript（言語）"] --> N
  JS --> B
```

ブラウザで動く JavaScript と、サーバーで動く JavaScript。同じ言語ですが、動く場所が違います。サーバー側で JavaScript を動かす代表的な環境が Node.js です。他にも Deno や Bun といった環境があります。

`npm run dev` をターミナルで実行すると、そこで動いているのは Node.js です。ブラウザで画面を見ているとき、そこで動いているのはブラウザの JavaScript です。1 つのプロジェクトの中で、2 つの場所が同時に動いています。

## 共通の部分と、環境ごとの部分

JavaScript には ECMAScript と呼ばれる共通の土台があります。変数の宣言、関数、条件分岐といった基本的な文法はこの土台に含まれていて、どの環境でも同じように動きます。

ただし、環境ごとに「追加で使えるもの」が違います。

| 機能 | ブラウザ | Node.js |
|------|---------|--------|
| 変数、関数、条件分岐 | 使える | 使える |
| `document`（HTML の操作） | 使える | **ない** |
| `window`（画面の情報） | 使える | **ない** |
| `fetch`（データの取得） | 使える | 使える |
| `fs`（ファイルの読み書き） | **ない** | 使える |

ブラウザには画面があるので、画面を操作する機能（`document`、`window`）が用意されています。Node.js にはファイルシステムがあるので、ファイルを読み書きする機能（`fs`）が用意されています。それぞれの環境に合ったものが追加されている、というだけのことです。

```mermaid
flowchart LR
  subgraph common["共通の土台"]
    A["変数・関数"]
    B["条件分岐・ループ"]
  end
  subgraph browser["ブラウザだけ"]
    D["document"]
    E["window"]
  end
  subgraph node["Node.js だけ"]
    F["fs"]
    G["process"]
  end
```

## ブラウザにだけある DOM

ブラウザ固有の機能のうち、最も重要なのが DOM（Document Object Model）です。

ブラウザは HTML を読み込むと、タグの構造をツリー状のデータに変換します。`<html>` の中に `<body>` があり、その中に `<h1>` や `<button>` がある、という入れ子の関係がそのままツリーになります。このツリーが DOM です。

```mermaid
flowchart TB
  doc["document"]
  doc --> html["html"]
  html --> head["head"]
  html --> body["body"]
  body --> h1["h1"]
  body --> p["p"]
  body --> button["button"]
```

JavaScript からこの DOM を操作すると、画面に表示されている内容を書き換えたり、要素を追加・削除したりできます。たとえばボタンのテキストを「送信」から「送信済み」に変えたり、エラーメッセージを画面に追加したりといったことです。

この DOM は画面を持つブラウザにだけ存在します。Node.js には画面がないので DOM がなく、`document` を使おうとするとエラーになります。

React はこの DOM 操作の仕組みを大きく変えました。その話はまた別の機会に。

## まとめ

- JavaScript は 1 つの言語ですが、ブラウザや Node.js など動く場所が複数あります
- 変数や関数など共通の土台（ECMAScript）はどの環境でも同じです
- ブラウザには画面を操作する DOM があり、Node.js にはファイル操作の `fs` があります。環境ごとに追加されている機能が違います
- `npm run dev` は Node.js、ブラウザの画面はブラウザの JS。1 つのプロジェクトで 2 つの環境が動いています
