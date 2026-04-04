# Day 14: HTTP とネットワーク基礎

## 今日のゴール

- HTTP の基本的な仕組み（リクエストとレスポンス）を理解する
- HTTP メソッド（GET / POST / PUT / DELETE）の使い分けを知る
- ステータスコードの意味を理解する
- REST の基本概念を知る

## HTTP とは

Day 13 で `fetch` を使ってサーバーからデータを取得しました。このとき、ブラウザとサーバーの間で使われていた通信の取り決め（プロトコル）が **HTTP（HyperText Transfer Protocol）** です。

HTTP は「**リクエスト（要求）**とレスポンス（応答）」のやり取りで成り立っています。

```
ブラウザ（クライアント）              サーバー
    │                                │
    │── HTTPリクエスト ──────────────→│
    │   「このデータをください」       │
    │                                │
    │←──────────── HTTPレスポンス ──│
    │   「はい、どうぞ」              │
    │                                │
```

Web ページを表示するとき、ブラウザは裏側で多数の HTTP リクエストを送っています。HTML ファイル、CSS ファイル、画像、JavaScript ファイル — それぞれが個別の HTTP リクエストで取得されます。

## HTTP リクエストの構造

HTTP リクエストは主に以下の部分で構成されます。

```
GET /users HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer xxxxx
```

| 部分 | 説明 |
|------|------|
| メソッド | 何をしたいか（GET, POST, PUT, DELETE など） |
| パス | どのリソースに対してか（`/users`） |
| ヘッダー | 付加情報（認証情報、受け入れるデータ形式など） |
| ボディ | 送信するデータ（POST/PUT で使う） |

## HTTP メソッド

HTTP メソッドは「このリクエストで何をしたいか」を表します。

| メソッド | 用途 | 例 |
|---------|------|-----|
| **GET** | データの取得 | ユーザー一覧を取得する |
| **POST** | データの作成 | 新しいユーザーを登録する |
| **PUT** | データの全体更新 | ユーザー情報を丸ごと更新する |
| **PATCH** | データの部分更新 | ユーザーのメールアドレスだけ更新する |
| **DELETE** | データの削除 | ユーザーを削除する |

### fetch での使い分け

```javascript
// GET（デフォルト）
const response = await fetch("https://api.example.com/users");

// POST
const response = await fetch("https://api.example.com/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "山田太郎", email: "yamada@example.com" }),
});

// PUT
const response = await fetch("https://api.example.com/users/1", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "山田太郎", email: "new@example.com" }),
});

// DELETE
const response = await fetch("https://api.example.com/users/1", {
  method: "DELETE",
});
```

## HTTP レスポンスの構造

```
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 256

{"id": 1, "name": "山田太郎", "email": "yamada@example.com"}
```

| 部分 | 説明 |
|------|------|
| ステータスコード | 処理結果を数字で表す（200, 404, 500 など） |
| ヘッダー | 付加情報（データ形式、サイズなど） |
| ボディ | レスポンスデータ（JSON、HTML など） |

## ステータスコード

ステータスコードは 3 桁の数字で、最初の 1 桁でカテゴリが決まります。

### 2xx — 成功

| コード | 意味 |
|--------|------|
| **200** OK | リクエスト成功 |
| **201** Created | リソースの作成に成功（POST の成功時によく使う） |
| **204** No Content | 成功したがレスポンスボディなし（DELETE の成功時によく使う） |

### 3xx — リダイレクト

| コード | 意味 |
|--------|------|
| **301** Moved Permanently | URL が恒久的に変更された |
| **302** Found | URL が一時的に変更された |
| **304** Not Modified | キャッシュがそのまま使える |

### 4xx — クライアントエラー（リクエスト側の問題）

| コード | 意味 |
|--------|------|
| **400** Bad Request | リクエストの形式が不正 |
| **401** Unauthorized | 認証が必要（ログインしていない） |
| **403** Forbidden | アクセス権限がない |
| **404** Not Found | リソースが見つからない |
| **422** Unprocessable Entity | リクエストの形式は正しいがデータに問題がある |

### 5xx — サーバーエラー（サーバー側の問題）

| コード | 意味 |
|--------|------|
| **500** Internal Server Error | サーバー内部エラー |
| **502** Bad Gateway | 中間サーバーが不正なレスポンスを受け取った |
| **503** Service Unavailable | サーバーが一時的に利用不可（メンテナンス中など） |

### fetch でステータスコードを扱う

```javascript
async function fetchUser(id) {
  const response = await fetch(`https://api.example.com/users/${id}`);

  if (response.status === 404) {
    console.log("ユーザーが見つかりません");
    return null;
  }

  if (!response.ok) {
    throw new Error(`HTTP エラー: ${response.status}`);
  }

  return await response.json();
}
```

## リクエストヘッダーとレスポンスヘッダー

ヘッダーはリクエストやレスポンスの「付加情報」です。

### よく使うリクエストヘッダー

| ヘッダー | 用途 | 例 |
|---------|------|-----|
| `Content-Type` | 送信するデータの形式 | `application/json` |
| `Accept` | 受け取りたいデータの形式 | `application/json` |
| `Authorization` | 認証情報 | `Bearer eyJhbGci...` |

### よく使うレスポンスヘッダー

| ヘッダー | 用途 | 例 |
|---------|------|-----|
| `Content-Type` | レスポンスデータの形式 | `application/json; charset=utf-8` |
| `Cache-Control` | キャッシュの制御 | `max-age=3600` |
| `Set-Cookie` | Cookie の設定 | `session=abc123` |

### DevTools で確認する

ブラウザの DevTools の「Network」タブで、実際の HTTP リクエストとレスポンスを確認できます。

1. DevTools を開く（F12）
2. 「Network」タブを選択
3. ページを更新する
4. 一覧に表示されるリクエストをクリックすると、ヘッダーやレスポンスの詳細が見られる

Day 13 のユーザー一覧ページを開いた状態で試してみてください。`jsonplaceholder.typicode.com/users` へのリクエストが見つかるはずです。

## JSON

**JSON（JavaScript Object Notation）** は、データのやり取りに使われる最も一般的なフォーマットです。

```json
{
  "name": "山田太郎",
  "age": 25,
  "isStudent": false,
  "hobbies": ["読書", "ランニング"],
  "address": {
    "city": "東京",
    "zip": "100-0001"
  }
}
```

JavaScript のオブジェクトとほぼ同じ見た目ですが、JSON には制約があります。

- キーは必ずダブルクォート（`"`）で囲む
- 末尾のカンマ（trailing comma）は不可
- コメントは書けない
- 値に関数は使えない

### JavaScript と JSON の変換

```javascript
// JavaScript オブジェクト → JSON 文字列
const user = { name: "山田", age: 25 };
const json = JSON.stringify(user);
console.log(json);  // '{"name":"山田","age":25}'

// JSON 文字列 → JavaScript オブジェクト
const parsed = JSON.parse(json);
console.log(parsed.name);  // "山田"
```

## REST の基本概念

**REST（Representational State Transfer）** は、Web API の設計スタイルです。「こう設計すると分かりやすい API になる」という考え方の集まりです。

### REST の基本ルール

1. **リソースを URL で表す**: `/users`（ユーザー一覧）、`/users/1`（ID が 1 のユーザー）
2. **HTTP メソッドで操作を表す**: GET（取得）、POST（作成）、PUT（更新）、DELETE（削除）
3. **ステートレス**: サーバーはリクエスト間の状態を保持しない。必要な情報は毎回リクエストに含める

### RESTful な API の例

| 操作 | メソッド | URL | 説明 |
|------|---------|-----|------|
| ユーザー一覧 | GET | `/users` | 全ユーザーを取得 |
| ユーザー詳細 | GET | `/users/1` | ID=1 のユーザーを取得 |
| ユーザー作成 | POST | `/users` | 新しいユーザーを作成 |
| ユーザー更新 | PUT | `/users/1` | ID=1 のユーザーを更新 |
| ユーザー削除 | DELETE | `/users/1` | ID=1 のユーザーを削除 |

URL が「何を」、メソッドが「どうするか」を表しています。この一貫した設計により、API の使い方が予測しやすくなります。

Next.js の Route Handlers（API エンドポイント）も、この REST の考え方に基づいて設計することが多いです。

## まとめ

- HTTP はリクエストとレスポンスのやり取り
- HTTP メソッド: GET（取得）、POST（作成）、PUT/PATCH（更新）、DELETE（削除）
- ステータスコード: 2xx（成功）、3xx（リダイレクト）、4xx（クライアントエラー）、5xx（サーバーエラー）
- ヘッダーはリクエスト/レスポンスの付加情報。DevTools の Network タブで確認できる
- JSON は Web API のデータ交換で最も使われるフォーマット
- REST は URL でリソースを、HTTP メソッドで操作を表す API 設計スタイル

**次のレッスン**: [Day 15: ES Modules](/lessons/day15/)
