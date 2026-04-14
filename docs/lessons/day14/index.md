# Day 14: DOM 操作

## 今日のゴール

- DOM（Document Object Model）が何かを知る
- JavaScript で HTML 要素を取得・変更・追加できることを知る
- DOM 操作の煩雑さを知り、React のような宣言的 UI が求められる背景を知る

## DOM とは

**DOM**（Document Object Model）は、ブラウザが HTML を読み込んだ後に作る「HTML のツリー構造のデータ」です。

```html
<html>
  <body>
    <h1>タイトル</h1>
    <p>本文</p>
  </body>
</html>
```

ブラウザはこの HTML を読み込むと、内部に以下のようなツリー構造を作ります。

```
html
└── body
    ├── h1
    │   └── "タイトル"
    └── p
        └── "本文"
```

このツリーの各点を**ノード**（node = 節）と呼びます。JavaScript は DOM を通じて HTML の要素にアクセスし、内容を変更したり、新しい要素を追加したりできます。

## DOM 操作の基本

### 要素の取得

JavaScript で DOM を操作するには、まず対象の要素を取得します。

```javascript
// CSS セレクタで要素を取得する
const title = document.querySelector("h1");       // 最初の1つ
const items = document.querySelectorAll("li");     // 条件に合う全て
```

`querySelector` は最初に見つかった1つ、`querySelectorAll` は条件に合うすべての要素を返します。Day 6-7 で学んだ CSS セレクタの書き方がそのまま使えます。

### 要素の変更

取得した要素のテキストやスタイルを変更できます。

```javascript
const title = document.querySelector("#title");

// テキストの変更
title.textContent = "変更後のタイトル";

// スタイルの変更
title.style.color = "darkblue";

// クラスの追加・削除
title.classList.add("highlight");
```

> **セキュリティの注意**: `innerHTML` というプロパティを使うと HTML を直接書き換えられますが、ユーザー入力を含む場合はクロスサイトスクリプティング（XSS = 悪意あるスクリプトを注入する攻撃）の危険があります。テキストの表示には `textContent` を使います。

### 要素の作成と追加

新しい要素を作って DOM に追加することもできます。

```javascript
const newItem = document.createElement("li");
newItem.textContent = "新しい項目";

const list = document.querySelector("ul");
list.appendChild(newItem);
```

### イベントリスナー

ユーザーの操作（クリック、キー入力など）に反応する処理を登録できます。

```javascript
const button = document.querySelector("#my-button");
button.addEventListener("click", () => {
  console.log("クリックされました");
});
```

## DOM 操作はなぜ煩雑なのか

ここまでの API を組み合わせると、たとえば「ボタンを押すとカウントが増える」だけのシンプルな機能でも、こうなります。

```javascript
// データ
let count = 0;

// DOM 要素の取得
const countDisplay = document.querySelector("#count");
const incrementButton = document.querySelector("#increment");

// イベントの登録
incrementButton.addEventListener("click", () => {
  // データの更新
  count += 1;
  // 画面の更新（手動で同期）
  countDisplay.textContent = `カウント: ${count}`;
});
```

シンプルに見えるかもしれません。しかし、ここにはある構造的な問題が潜んでいます。

**「データ」と「画面（DOM）」を自分で同期しなければならない**ということです。

カウンターなら `textContent` を1箇所更新するだけですが、実際のアプリケーションでは:

- ToDo リストの追加・削除・完了状態の切り替え
- フィルターや並び替えの反映
- フォームのバリデーション結果の表示
- 複数の箇所に同じデータを表示

これらすべてで「データが変わったら、画面のどこをどう更新するか」を手動で書く必要があります。1つの状態変更が画面の複数箇所に影響する場合、更新漏れやタイミングのバグが頻発します。

## 宣言的 UI という解決策

この問題を解決するのが、React のような**宣言的 UI ライブラリ**です。

先ほどのカウンターを React で書くと、考え方がまったく変わります。

```jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
```

ここには `querySelector` も `textContent =` もありません。React では「データ（`count`）がこの値のとき、画面はこう表示される」というルールだけを書きます。データが変わったら、画面のどこを更新すべきかは React が自動的に判断します。

| | 命令的 UI（DOM 操作） | 宣言的 UI（React） |
|---|---|---|
| 考え方 | 「この要素のテキストをこう変えろ」 | 「データがこうなら画面はこう」 |
| DOM の更新 | 開発者が手動で行う | ライブラリが自動で行う |
| 状態と画面の同期 | 自分で管理 | フレームワークが保証 |
| 規模が大きくなると | 更新漏れ・バグが増える | 複雑さが増えにくい |

DOM 操作の存在と、その煩雑さを知っておくことが重要です。Day 23 以降で学ぶ React は、まさにこの問題を解決するために作られました。

## まとめ

- DOM はブラウザが HTML から作るツリー構造のデータ
- JavaScript で DOM を操作して画面を変更できる（`querySelector`、`textContent`、`createElement` など）
- DOM 操作は「データと画面の手動同期」が必要で、規模が大きくなると煩雑になる
- この煩雑さが React のような宣言的 UI ライブラリが生まれた理由

**次のレッスン**: [Day 15: 非同期処理](/lessons/day15/)
