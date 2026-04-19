# 非同期処理

## 今日のゴール

- 同期処理と非同期処理の違いを知る
- コールバック、Promise、async/await の 3 つの書き方を知る
- `fetch` API でデータを取得する方法を知る
- なぜ非同期処理が Web 開発で重要なのかを知る

## 同期処理と非同期処理

### 同期処理 — 順番に 1 つずつ

Day 11〜11 で書いてきた JavaScript のコードは、上から順に 1 行ずつ実行されていました。これが**同期処理**です。

```javascript
console.log("1番目");
console.log("2番目");
console.log("3番目");
// 必ず 1 → 2 → 3 の順に表示される
```

### 非同期処理 — 待っている間に次へ進む

Web 開発では「時間がかかる処理」がたくさんあります。

- サーバーからデータを取得する（ネットワーク通信）
- ファイルを読み込む
- タイマーで一定時間待つ

これらの処理で「完了するまで何もできない」のでは、画面が固まってしまいます。**非同期処理**は、時間がかかる処理の完了を待たずに次の処理に進み、完了したら結果を受け取る仕組みです。

```javascript
console.log("1番目");

setTimeout(() => {
  console.log("2番目（1秒後）");
}, 1000);

console.log("3番目");

// 表示順: "1番目" → "3番目" → "2番目（1秒後）"
```

`setTimeout` は指定したミリ秒後に関数を実行する非同期処理です。1 秒待つ間に「3番目」が先に実行されています。

## コールバック — 昔のやり方

初期の JavaScript では、非同期処理の結果を「コールバック関数」で受け取っていました。

```javascript
function fetchData(callback) {
  setTimeout(() => {
    callback("データを取得しました");
  }, 1000);
}

fetchData((result) => {
  console.log(result);  // 1秒後に "データを取得しました"
});
```

### コールバック地獄

非同期処理を連続して行うと、コールバックが入れ子になって読みにくくなります。

```javascript
fetchUser(userId, (user) => {
  fetchPosts(user.id, (posts) => {
    fetchComments(posts[0].id, (comments) => {
      console.log(comments);
      // さらにネストが深くなる...
    });
  });
});
```

これを**コールバック地獄（callback hell）** と呼びます。この問題を解決するために Promise が生まれました。

## Promise — 非同期処理を扱うオブジェクト

**Promise**（プロミス = 約束）は、「まだ結果が出ていないが、いずれ成功か失敗で結果が返る」ことを表すオブジェクトです。

```javascript
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    const success = true;
    if (success) {
      resolve("成功しました！");   // 成功時
    } else {
      reject("エラーが発生しました");  // 失敗時
    }
  }, 1000);
});
```

### then / catch で結果を受け取る

```javascript
promise
  .then((result) => {
    console.log(result);  // "成功しました！"
  })
  .catch((error) => {
    console.log(error);   // エラー時
  });
```

### Promise チェーン

Promise は `.then()` を連結できるので、コールバック地獄を解消できます。

```javascript
fetchUser(userId)
  .then((user) => fetchPosts(user.id))
  .then((posts) => fetchComments(posts[0].id))
  .then((comments) => {
    console.log(comments);
  })
  .catch((error) => {
    console.log("エラー:", error);
  });
```

ネストが深くならず、上から下に読めるようになりました。

## async / await — Promise をさらに読みやすく

**async/await** は Promise をまるで同期処理のように書ける構文です。ES2017 で追加されました。

```javascript
async function loadData() {
  try {
    const user = await fetchUser(userId);
    const posts = await fetchPosts(user.id);
    const comments = await fetchComments(posts[0].id);
    console.log(comments);
  } catch (error) {
    console.log("エラー:", error);
  }
}

loadData();
```

- `async` を関数の前に付けると、その関数は非同期関数になる
- `await` を Promise の前に付けると、その Promise が完了するまで待ってから次に進む
- `await` は `async` 関数の中でだけ使える
- エラーハンドリングは `try/catch` を使う（Day 18 で詳しく学びます）

**コールバック → Promise → async/await と、書き方は進化してきましたが、やっていることは同じ「非同期処理」です。** 現在の実務では async/await が主流です。

## fetch API — サーバーからデータを取得する

**`fetch`** はブラウザに組み込まれた、HTTP リクエスト（サーバーとの通信）を行うための API です。Promise を返します。

### 基本的な使い方

```javascript
async function loadUsers() {
  const response = await fetch("https://jsonplaceholder.typicode.com/users");
  const users = await response.json();
  console.log(users);
}

loadUsers();
```

処理の流れ:

1. `fetch(URL)` — サーバーにリクエストを送り、レスポンスの Promise を返す
2. `await response.json()` — レスポンスの本文を JSON として解析する（これも非同期）

### 完成形のコード

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>fetch API の練習</title>
    <style>
      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }
      body {
        font-family: sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .user-card {
        padding: 16px;
        border: 1px solid #ddd;
        border-radius: 8px;
        margin-bottom: 12px;
      }
      .user-card h2 {
        margin: 0 0 8px;
        font-size: 18px;
      }
      .user-card p {
        margin: 4px 0;
        color: #666;
      }
      .loading {
        color: #888;
      }
      .error {
        color: #d32f2f;
      }
    </style>
  </head>
  <body>
    <h1>ユーザー一覧</h1>
    <div id="user-list" aria-live="polite">
      <p class="loading">読み込み中...</p>
    </div>

    <script>
      async function loadUsers() {
        const container = document.querySelector("#user-list");

        try {
          const response = await fetch(
            "https://jsonplaceholder.typicode.com/users"
          );

          if (!response.ok) {
            throw new Error(`HTTP エラー: ${response.status}`);
          }

          const users = await response.json();

          // コンテナの中身をクリア
          container.innerHTML = "";

          users.forEach((user) => {
            const card = document.createElement("article");
            card.className = "user-card";
            card.innerHTML = `
              <h2>${user.name}</h2>
              <p>${user.email}</p>
              <p>${user.company.name}</p>
            `;
            container.appendChild(card);
          });
        } catch (error) {
          container.innerHTML = `<p class="error">データの取得に失敗しました: ${error.message}</p>`;
        }
      }

      loadUsers();
    </script>
  </body>
</html>
```

このコードにはいくつかのポイントがあります。

- **`response.ok`** のチェック — `fetch` はネットワークエラー以外ではエラーを投げません。404 や 500 のレスポンスもエラーにならないため、`response.ok` で成功かどうかを確認する必要があります
- **`aria-live="polite"`** — この属性を付けた要素の内容が変わると、スクリーンリーダーがその変更を読み上げます。「読み込み中」から「ユーザー一覧」に変わったことが伝わります
- **エラーハンドリング** — ネットワーク通信は失敗する可能性があるので、必ず `try/catch` でエラーを処理します

### POST リクエスト（データの送信）

データを取得するだけでなく、サーバーにデータを送ることもできます。

```javascript
async function createUser(userData) {
  const response = await fetch("https://jsonplaceholder.typicode.com/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const newUser = await response.json();
  console.log("作成されたユーザー:", newUser);
}

createUser({
  name: "山田太郎",
  email: "yamada@example.com",
});
```

- `method: "POST"` — GET（取得）の代わりに POST（作成）を指定
- `headers` — リクエストの付加情報。`Content-Type` で送信データの形式を伝える
- `body` — 送信するデータ。`JSON.stringify` でオブジェクトを JSON 文字列に変換する

HTTP メソッドやヘッダーについては Day 16 で詳しく学びます。

## まとめ

- 非同期処理は「時間がかかる処理の完了を待たずに次へ進む」仕組み
- コールバック → Promise → async/await と進化した。**現在は async/await が主流**
- `fetch` でサーバーと通信する。`fetch` は Promise を返す
- `response.ok` でレスポンスの成否を確認する。`fetch` は HTTP エラーを自動で throw しない
- ネットワーク通信は失敗する可能性があるので、必ずエラーハンドリングする
- `aria-live` を使うと、動的に変わるコンテンツの変更をスクリーンリーダーに伝えられる
