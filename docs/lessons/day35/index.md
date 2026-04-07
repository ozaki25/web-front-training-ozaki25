# Day 35: データ取得（Server Components）

## 今日のゴール

- Server Components でのデータ取得の仕組みを理解する
- async コンポーネントの書き方を知る
- `"use cache"` ディレクティブによるキャッシュ戦略を理解する

## Server Components でのデータ取得

Day 33 で学んだように、Server Components はサーバーで実行されます。つまり、**コンポーネントの中で直接 `fetch` を呼んでデータを取得できます**。

```tsx
// src/app/posts/page.tsx（Server Component）
export default async function PostsPage() {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts");
  const posts = await res.json();

  return (
    <main>
      <h1>記事一覧</h1>
      <ul>
        {posts.slice(0, 10).map((post: { id: number; title: string }) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </main>
  );
}
```

注目してほしい点があります。

- **`async` が付いている** — コンポーネント関数が非同期（async）になっている
- **`await fetch()`** — コンポーネント内で直接 `await` を使っている
- **`useEffect` は使わない** — Day 28 で学んだ `useEffect` でのデータ取得とは根本的に異なる

### なぜ Server Components での fetch が優れているのか

Day 28 で学んだ Client Component でのデータ取得と比較してみましょう。

**Client Component の場合（従来の方法）**:

1. ブラウザが空の HTML を受け取る
2. JavaScript をダウンロード・実行
3. コンポーネントがマウントされ `useEffect` が走る
4. ブラウザから API に fetch リクエスト
5. レスポンスを受けて画面を更新

**Server Component の場合**:

1. サーバーで fetch してデータ取得
2. データを含んだ HTML をブラウザに送る
3. ブラウザに表示

Server Component では、データが含まれた状態でページが表示されます。ユーザーはローディング画面を見ることなく、すぐにコンテンツを読めます。また、サーバーから API サーバーへの通信は、ブラウザからの通信より高速なことが多いです（同じデータセンター内にある場合など）。

## データ取得のパターン

### 複数のデータを並列で取得する

ページに複数のデータが必要な場合、`Promise.all` で並列に取得します。

```tsx
export default async function DashboardPage() {
  // 並列にリクエストを送る（1つずつ待たない）
  const [postsRes, usersRes] = await Promise.all([
    fetch("https://jsonplaceholder.typicode.com/posts"),
    fetch("https://jsonplaceholder.typicode.com/users"),
  ]);

  const posts = await postsRes.json();
  const users = await usersRes.json();

  return (
    <main>
      <h1>ダッシュボード</h1>
      <section>
        <h2>最新の投稿</h2>
        <ul>
          {posts.slice(0, 5).map((post: { id: number; title: string }) => (
            <li key={post.id}>{post.title}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2>ユーザー一覧</h2>
        <ul>
          {users.slice(0, 5).map((user: { id: number; name: string }) => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
```

`Promise.all` を使わず順番に `await` すると、1 つ目の fetch が終わるまで 2 つ目が始まりません。これを**ウォーターフォール**と呼び、パフォーマンスが悪くなります。

### データ取得をコンポーネントに分ける

データを必要とするコンポーネントごとに fetch を行う設計も有効です。

```tsx
// src/app/dashboard/page.tsx
import { Suspense } from "react";
import RecentPosts from "./recent-posts";
import UserStats from "./user-stats";

export default function DashboardPage() {
  return (
    <main>
      <h1>ダッシュボード</h1>
      <Suspense fallback={<p role="status">投稿を読み込み中...</p>}>
        <RecentPosts />
      </Suspense>
      <Suspense fallback={<p role="status">統計を読み込み中...</p>}>
        <UserStats />
      </Suspense>
    </main>
  );
}
```

```tsx
// src/app/dashboard/recent-posts.tsx
export default async function RecentPosts() {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts");
  const posts = await res.json();

  return (
    <section>
      <h2>最新の投稿</h2>
      <ul>
        {posts.slice(0, 5).map((post: { id: number; title: string }) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </section>
  );
}
```

各コンポーネントを `<Suspense>` で包むことで、データ取得が速く終わったコンポーネントから順に表示されます。遅いデータがあっても、ページ全体が待たされることはありません。

## "use cache" ディレクティブ

データ取得の結果をキャッシュ（一時的に保存して再利用）したい場合があります。最新の Next.js では、`"use cache"` ディレクティブを使ってキャッシュを制御します。

`"use cache"` を使うには、`next.config.ts` で `cacheComponents: true` を設定する必要があります。

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
};

export default nextConfig;
```

```tsx
// src/app/posts/page.tsx
"use cache";

export default async function PostsPage() {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts");
  const posts = await res.json();

  return (
    <main>
      <h1>記事一覧</h1>
      <ul>
        {posts.slice(0, 10).map((post: { id: number; title: string }) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </main>
  );
}
```

`"use cache"` をファイルの先頭に書くと、そのコンポーネントの**レンダリング結果がキャッシュされます**。同じページへのリクエストが来たとき、キャッシュがあれば fetch を再実行せずにキャッシュされた結果を返します。

### 関数単位のキャッシュ

コンポーネント全体ではなく、データ取得関数だけをキャッシュすることもできます。

```tsx
async function getPosts() {
  "use cache";
  const res = await fetch("https://jsonplaceholder.typicode.com/posts");
  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <main>
      <h1>記事一覧</h1>
      <ul>
        {posts.slice(0, 10).map((post: { id: number; title: string }) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </main>
  );
}
```

関数の先頭に `"use cache"` を書くと、その関数の戻り値がキャッシュされます。同じ引数で呼ばれた場合はキャッシュが返されます。

### キャッシュの有効期限

`cacheLife` を使って、キャッシュの有効期限を設定できます。

```tsx
import { cacheLife } from "next/cache";

async function getPosts() {
  "use cache";
  cacheLife("hours"); // 数時間キャッシュ
  const res = await fetch("https://jsonplaceholder.typicode.com/posts");
  return res.json();
}
```

`cacheLife` にはプリセット値を指定できます。

| プリセット | 意味 |
|-----------|------|
| `"seconds"` | 数秒間 |
| `"minutes"` | 数分間 |
| `"hours"` | 数時間 |
| `"days"` | 数日間 |
| `"weeks"` | 数週間 |
| `"max"` | 最大限長く |

## キャッシュ戦略の考え方

キャッシュを使うかどうかは、データの性質で判断します。

| データの特徴 | キャッシュ戦略 |
|-------------|-------------|
| ほぼ変わらない（会社概要など） | `cacheLife("max")` で長期キャッシュ |
| 定期的に更新（ブログ記事一覧） | `cacheLife("hours")` で適度にキャッシュ |
| リアルタイム性が必要（在庫数など） | キャッシュしない |
| ユーザーごとに異なる（マイページ） | キャッシュしないか、ユーザー単位でキャッシュ |

キャッシュの基本は「変更頻度が低いデータは長くキャッシュし、変更頻度が高いデータはキャッシュしないか短くする」です。

## エラーハンドリング

データ取得は失敗する可能性があります。適切にエラーを処理しましょう。

```tsx
export default async function PostsPage() {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts");

  if (!res.ok) {
    // エラーを throw すると、最も近い error.tsx が表示される
    throw new Error("記事の取得に失敗しました");
  }

  const posts = await res.json();

  return (
    <main>
      <h1>記事一覧</h1>
      <ul>
        {posts.slice(0, 10).map((post: { id: number; title: string }) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </main>
  );
}
```

Day 34 で学んだ `error.tsx` がここで活きます。エラーを `throw` すると、Next.js が自動的に `error.tsx` を表示してくれます。

## まとめ

- Server Components では `async` コンポーネント内で直接 `fetch` できる
- `useEffect` による Client 側のデータ取得と違い、データが含まれた HTML が最初から送られる
- 複数のデータ取得は `Promise.all` で並列化し、ウォーターフォールを避ける
- `"use cache"` ディレクティブでレンダリング結果やデータ取得結果をキャッシュできる
- `cacheLife` でキャッシュの有効期限を制御する
- データの変更頻度に応じてキャッシュ戦略を選択する

**次のレッスン**: [Day 36: Route Handlers](/lessons/day36/)
