# Day 12: DOM 操作

## 今日のゴール

- DOM（Document Object Model）が何かを知る
- JavaScript で HTML 要素を取得・作成・変更・削除する方法を知る
- イベントリスナーでユーザー操作に反応する仕組みを知る
- DOM 操作の煩雑さを知り、React のような宣言的 UI が求められる背景を知る

## DOM とは

**DOM（Document Object Model）**は、ブラウザが HTML を読み込んだ後に作る「HTML のツリー構造のデータ」です。

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

このツリーの各要素を**ノード**と呼びます。JavaScript は DOM を通じて HTML の要素にアクセスし、内容を変更したり、新しい要素を追加したりできます。

## 要素の取得

### querySelector — CSS セレクタで取得

```javascript
// 最初に見つかった 1 つを取得
const title = document.querySelector("h1");
const card = document.querySelector(".card");
const header = document.querySelector("#site-header");
```

### querySelectorAll — 複数の要素を取得

```javascript
// 条件に合うすべての要素を取得（NodeList が返る）
const items = document.querySelectorAll("li");
items.forEach((item) => {
  console.log(item.textContent);
});
```

> `getElementById` や `getElementsByClassName` という古い API もありますが、`querySelector` / `querySelectorAll` を使えば CSS セレクタの知識がそのまま使えるので、こちらが推奨です。

## 要素の変更

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DOM 操作の練習</title>
    <style>
      .highlight {
        background-color: yellow;
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <h1 id="title">元のタイトル</h1>
    <p id="message">元のメッセージ</p>

    <script>
      const title = document.querySelector("#title");
      const message = document.querySelector("#message");

      // テキストの変更
      title.textContent = "変更後のタイトル";

      // HTML の変更（タグを含む）
      message.innerHTML = "<strong>太字の</strong>メッセージ";

      // スタイルの変更
      title.style.color = "darkblue";

      // クラスの追加
      message.classList.add("highlight");
    </script>
  </body>
</html>
```

| メソッド / プロパティ | 用途 |
|----------------------|------|
| `textContent` | テキストの取得・設定 |
| `innerHTML` | HTML を含むコンテンツの取得・設定 |
| `style.xxx` | インラインスタイルの変更 |
| `classList.add()` | クラスの追加 |
| `classList.remove()` | クラスの削除 |
| `classList.toggle()` | クラスの切り替え（あれば削除、なければ追加） |
| `setAttribute()` | 属性の設定 |

> **セキュリティの注意**: `innerHTML` はユーザーが入力した文字列をそのまま入れると、悪意あるスクリプトが実行される危険（XSS 攻撃）があります。ユーザー入力を表示する場合は `textContent` を使います。

## 要素の作成と追加

```javascript
// 新しい要素を作成
const newItem = document.createElement("li");
newItem.textContent = "新しい項目";

// 既存の要素に追加
const list = document.querySelector("ul");
list.appendChild(newItem);
```

以下は、リストに項目を追加するページの完成形のコードです。

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ToDo リスト</title>
    <style>
      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }
      body {
        font-family: sans-serif;
        max-width: 500px;
        margin: 0 auto;
        padding: 20px;
      }
      .input-area {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
      }
      .input-area input {
        flex: 1;
        padding: 8px;
        font-size: 16px;
      }
      .input-area button {
        padding: 8px 16px;
        font-size: 16px;
      }
      .todo-list {
        list-style: none;
        padding: 0;
      }
      .todo-list li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px;
        border-bottom: 1px solid #eee;
      }
      .visually-hidden {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    </style>
  </head>
  <body>
    <h1>ToDo リスト</h1>

    <div class="input-area">
      <label for="todo-input" class="visually-hidden">やること</label>
      <input type="text" id="todo-input" placeholder="やることを入力" />
      <button type="button" id="add-button">追加</button>
    </div>

    <ul class="todo-list" id="todo-list" aria-label="タスク一覧"></ul>

    <script>
      const input = document.querySelector("#todo-input");
      const addButton = document.querySelector("#add-button");
      const todoList = document.querySelector("#todo-list");

      function addTodo() {
        const text = input.value.trim();
        if (text === "") return;

        // li 要素を作成
        const li = document.createElement("li");

        // テキスト部分
        const span = document.createElement("span");
        span.textContent = text;

        // 削除ボタン
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "削除";
        deleteButton.setAttribute("aria-label", `${text} を削除`);
        deleteButton.addEventListener("click", () => {
          li.remove();
        });

        li.appendChild(span);
        li.appendChild(deleteButton);
        todoList.appendChild(li);

        input.value = "";
        input.focus();
      }

      addButton.addEventListener("click", addTodo);

      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          addTodo();
        }
      });
    </script>
  </body>
</html>
```

コードにはアクセシビリティのポイントがいくつかあります。

- `<label>` を入力欄に紐付けています（視覚的に隠す場合も label は必要です）
- `<ul>` に `aria-label` を付けて、リストの用途を伝えています
- 削除ボタンに `aria-label` を付けて、「何を」削除するのかを伝えています

## イベントリスナー

**イベント**は、ユーザーの操作（クリック、キー入力、スクロールなど）やブラウザの動作（ページ読み込み完了など）のことです。`addEventListener` でイベントに反応する処理を登録します。

```javascript
const button = document.querySelector("#my-button");

button.addEventListener("click", (event) => {
  console.log("ボタンがクリックされました");
  console.log(event.target);  // クリックされた要素
});
```

### よく使うイベント

| イベント名 | タイミング |
|-----------|-----------|
| `click` | クリック |
| `input` | 入力欄の値が変わったとき |
| `change` | 入力欄からフォーカスが外れて値が確定したとき |
| `keydown` | キーが押されたとき |
| `submit` | フォームが送信されたとき |
| `focus` / `blur` | フォーカスされた / 外れた |

## DOM 操作の煩雑さを考える

先ほどの ToDo リストのコードを振り返ります。やっていることは「テキストをリストに追加する」「削除ボタンで消す」というシンプルな機能です。しかし:

1. `document.createElement` で要素を作る
2. `textContent` でテキストを設定する
3. `addEventListener` でイベントを登録する
4. `appendChild` で DOM に追加する
5. `remove()` で DOM から削除する

**「データ（ToDo のリスト）」と「画面の状態（DOM）」を手動で同期**しなければなりません。

もし ToDo に「完了状態」を追加したら？フィルター機能を追加したら？並び替え機能は？ — 機能が増えるたびに DOM 操作のコードは急激に複雑になります。

この問題を解決するのが、React のような**宣言的 UI ライブラリ**です。React では「データがこうなっていたら、画面はこう表示される」というルールだけを書き、DOM の操作は React が自動的に行います。

DOM 操作の煩雑さを知っておくことで、後で React を学ぶときに「なぜ React が必要なのか」が実感として理解できるはずです。

## まとめ

- DOM はブラウザが HTML から作るツリー構造のデータ
- `querySelector` / `querySelectorAll` で要素を取得する
- `textContent`、`classList`、`style` などで要素を変更する
- `createElement` + `appendChild` で要素を作成・追加、`remove()` で削除する
- `addEventListener` でユーザー操作に反応する
- DOM 操作は「データと画面の手動同期」が必要で、規模が大きくなると煩雑になる
- この煩雑さが React のような宣言的 UI ライブラリが生まれた理由

**次のレッスン**: [Day 13: 非同期処理](/lessons/day13/)
