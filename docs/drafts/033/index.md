# データ取得 — Server Component の中で await が書ける

## 今日のゴール

- Server Component が async 関数になれることを知る
- コンポーネントの中で直接 fetch できることを知る
- クライアントでの fetch との違いを知る

## コンポーネントが async 関数になれる

React 単体では、コンポーネントの中で直接 `await` は書けませんでした。データを取得するには `useEffect` の中で `fetch` して、`useState` で結果を管理する必要がありました。

```tsx
// React 単体（Client Component）での書き方
"use client";
import { useEffect, useState } from "react";

export default function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

Next.js の Server Component では、これがこう書けます。

```tsx
// Server Component での書き方
export default async function UserList() {
  const res = await fetch("https://api.example.com/users");
  const users = await res.json();

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

`async function` として定義して、中で `await fetch` するだけです。`useEffect` も `useState` も不要。ローディング状態の管理も要りません（`loading.tsx` が自動で表示されます）。

## サーバーで fetch するメリット

Server Component の `fetch` はサーバー上で実行されます。これには 3 つのメリットがあります。

### 1. API キーがブラウザに漏れない

```tsx
// Server Component — API キーはサーバーにだけある
export default async function Weather() {
  const res = await fetch(
    `https://api.weather.com/data?key=${process.env.WEATHER_API_KEY}`
  );
  const data = await res.json();
  return <p>今日の天気: {data.weather}</p>;
}
```

`process.env.WEATHER_API_KEY` はサーバーの環境変数です。ブラウザには HTML だけが送られるので、API キーが漏れません。

### 2. データベースに直接アクセスできる

```tsx
// Server Component — DB に直接クエリ
import { db } from "@/lib/db";

export default async function UserList() {
  const users = await db.user.findMany();
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

サーバーで実行されるので、データベースに直接アクセスできます。API エンドポイントを作る必要がありません。

### 3. ブラウザ → サーバー → 外部 API の往復が減る

Client Component の場合:
```
ブラウザ → サーバー（HTML取得） → ブラウザ → サーバー（API） → ブラウザ
```

Server Component の場合:
```
ブラウザ → サーバー（fetch + HTML生成） → ブラウザ
```

サーバーが外部 API にアクセスして HTML を生成してから返すので、ブラウザとサーバーの往復が減り、表示が速くなります。

## Client Component でデータを取る場面

Server Component で取るのが基本ですが、Client Component でデータを取る場面もあります。

- **ユーザーの操作に応じてデータを取る**（検索、フィルタリング、無限スクロール）
- **リアルタイムで更新したい**（チャット、通知）

```tsx
"use client";

export default function SearchResults({ query }: { query: string }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetch(`/api/search?q=${query}`)
      .then((res) => res.json())
      .then((data) => setResults(data));
  }, [query]);

  return <ul>{results.map(/* ... */)}</ul>;
}
```

ユーザーが検索キーワードを変えるたびにデータを取り直す場合は、Client Component で `useEffect` + `fetch` を使います。

## まとめ

- Server Component は `async function` にして、中で `await fetch` が直接書けます
- `useEffect` + `useState` のパターンが不要になり、コードがシンプルになります
- サーバーで fetch するので、API キーが漏れない、DB に直接アクセスできる、往復が減って速いというメリットがあります
- ユーザー操作に応じたデータ取得（検索、リアルタイム更新）は Client Component で行います
