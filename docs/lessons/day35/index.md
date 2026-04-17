# Server Components と Client Components

## 今日のゴール

- Server Components と Client Components の違いを知る
- `"use client"` の意味と効果を知る
- どちらを使うべきかの判断基準を知る

## 2 種類のコンポーネント

Day 34 で `page.tsx` に `"use client"` が書かれていないことに触れました。Next.js の App Router では、コンポーネントはデフォルトで **Server Component**（サーバーコンポーネント）です。

ブラウザ側で動かしたいコンポーネントには、ファイルの先頭に `"use client"` と書きます。これが **Client Component**（クライアントコンポーネント）です。

```tsx
// Server Component（デフォルト）
// "use client" を書かないとサーバーで実行される
export default function ServerComp() {
  return <p>サーバーで実行されます</p>;
}
```

```tsx
"use client";

// Client Component
// ブラウザで実行される
export default function ClientComp() {
  return <p>ブラウザで実行されます</p>;
}
```

## Server Component とは

Server Component は**サーバー上でのみ実行される** React コンポーネントです。サーバーで HTML に変換されてからブラウザに送られます。

### Server Component のメリット

1. **JavaScript がブラウザに送られない** — コンポーネントのコードはサーバーで実行が完了するため、そのぶんブラウザがダウンロードする JavaScript が減る
2. **データベースや API に直接アクセスできる** — サーバーで動くので、データベースクエリやファイルシステムへのアクセスが可能
3. **機密情報を安全に扱える** — API キーなどの秘密の値がブラウザに漏れない

```tsx
// Server Component でデータベースに直接アクセスする例
import { db } from "@/lib/database";

export default async function UserList() {
  // この SQL はサーバーで実行される。ブラウザには結果の HTML だけ届く
  const users = await db.query("SELECT name FROM users");

  return (
    <ul>
      {users.map((user) => (
        <li key={user.name}>{user.name}</li>
      ))}
    </ul>
  );
}
```

この例ではデータベースクエリがブラウザに送られることは絶対にありません。ブラウザが受け取るのは、クエリの結果から生成された HTML だけです。

### Server Component の制約

サーバーで実行されるため、**ブラウザの機能は使えません**。

- `useState`、`useEffect` などの React Hooks が使えない
- `onClick`、`onChange` などのイベントハンドラが使えない
- `window`、`document` などのブラウザ API にアクセスできない

つまり、**ユーザーの操作に反応するインタラクティブな UI は作れません**。

## Client Component とは

ブラウザで動くコンポーネントです。従来の React コンポーネントと同じように、state やイベントハンドラを使えます。

```tsx
"use client";

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(count + 1)} type="button">
        +1
      </button>
    </div>
  );
}
```

`"use client"` はファイルの**一番上**に書きます。これは Next.js（正確には React）への宣言で、「このファイルとここから import されるモジュールはクライアントバンドルに含めてください」という意味です。

> **注意**: `"use client"` は「このコンポーネントはブラウザ**だけ**で動く」という意味ではありません。初回表示時にはサーバーで HTML としてプリレンダリングされることもあります。正確には「クライアントバンドルに含める（ブラウザに JavaScript を送る）」という指示です。

## 使い分けの判断基準

どちらを使うか迷ったときの判断基準です。

| やりたいこと | Server Component | Client Component |
|-------------|:---:|:---:|
| データベースやファイルに直接アクセス | ✅ | ❌ |
| 機密情報（API キーなど）を使う | ✅ | ❌ |
| `useState` / `useEffect` を使う | ❌ | ✅ |
| イベントハンドラ（onClick など）を使う | ❌ | ✅ |
| ブラウザ API（localStorage など）を使う | ❌ | ✅ |
| 静的な表示だけ（操作なし） | ✅ | △（可能だが不要） |

**基本方針: デフォルトは Server Component。インタラクティブな機能が必要な部分だけ Client Component にする。**

この方針には明確な理由があります。Server Component はブラウザに JavaScript を送らないため、ページの読み込みが速くなります。「必要なところだけ Client Component にする」ことで、パフォーマンスを最適に保てます。

## サーバーとクライアントの境界

実際のアプリでは、Server Component と Client Component を組み合わせて使います。ここで重要なのが「境界」の考え方です。

### Server Component の中に Client Component を置ける

```tsx
// app/page.tsx（Server Component）
import Counter from "./counter";

export default function Page() {
  return (
    <main>
      <h1>ダッシュボード</h1>
      <p>ようこそ。今日の統計です。</p>
      {/* Server Component の中に Client Component を配置 */}
      <Counter />
    </main>
  );
}
```

```tsx
// app/counter.tsx（Client Component）
"use client";

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)} type="button">
      クリック数: {count}
    </button>
  );
}
```

ページ全体は Server Component ですが、インタラクティブな `Counter` の部分だけが Client Component です。`<h1>` や `<p>` の部分は JavaScript なしで HTML として送られます。

### Client Component の中から Server Component を直接 import できない

これはよくある間違いです。

```tsx
// ❌ これはうまくいかない
"use client";

import ServerComp from "./server-comp"; // Server Component を import

export default function ClientComp() {
  return (
    <div>
      <ServerComp />
    </div>
  );
}
```

`"use client"` を書いたファイルから import したモジュールは、すべてクライアントバンドルに含まれます。つまり、`ServerComp` は Server Component として動かなくなります。

### children パターンで解決する

Client Component の中に Server Component を配置したい場合は、`children`（または他の props）として渡します。

```tsx
// app/page.tsx（Server Component）
import ClientWrapper from "./client-wrapper";
import ServerContent from "./server-content";

export default function Page() {
  return (
    <ClientWrapper>
      <ServerContent />
    </ClientWrapper>
  );
}
```

```tsx
// app/client-wrapper.tsx（Client Component）
"use client";

import { useState } from "react";

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)} type="button">
        {isOpen ? "閉じる" : "開く"}
      </button>
      {isOpen && children}
    </div>
  );
}
```

```tsx
// app/server-content.tsx（Server Component）
export default function ServerContent() {
  // サーバーでのみ実行される処理が可能
  return <p>この部分は Server Component です</p>;
}
```

こうすると `ServerContent` は Server Component のままサーバーで実行され、その結果が `ClientWrapper` の `children` として渡されます。

## 実際の設計例

ブログ記事ページを例に、Server Component と Client Component の使い分けを見てみます。

```tsx
// app/blog/[slug]/page.tsx（Server Component）
import LikeButton from "./like-button";

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // サーバーで記事データを取得
  const res = await fetch(`https://api.example.com/posts/${slug}`);
  const post = await res.json();

  return (
    <article>
      <h1>{post.title}</h1>
      <time dateTime={post.publishedAt}>{post.publishedAt}</time>
      <div>{post.body}</div>
      {/* いいねボタンだけ Client Component */}
      <LikeButton postId={post.id} />
    </article>
  );
}
```

```tsx
// app/blog/[slug]/like-button.tsx（Client Component）
"use client";

import { useState } from "react";

export default function LikeButton({ postId }: { postId: string }) {
  const [liked, setLiked] = useState(false);

  return (
    <button
      onClick={() => setLiked(!liked)}
      aria-pressed={liked}
      type="button"
    >
      {liked ? "♥ いいね済み" : "♡ いいね"}
    </button>
  );
}
```

記事の本文（タイトル、日付、テキスト）は静的な表示なので Server Component で十分です。「いいね」ボタンはクリックに反応する必要があるので Client Component にしています。

> **アクセシビリティ**: `<button>` に `aria-pressed` を付けると、スクリーンリーダーがボタンの ON/OFF 状態を読み上げてくれます。トグル（切り替え）ボタンには必ず付けるのが望ましいです。

## まとめ

- Next.js のコンポーネントはデフォルトで Server Component（サーバーで実行）
- `"use client"` を書くと Client Component になり、ブラウザの JavaScript バンドルに含まれる
- Server Component はデータ取得や機密情報の扱いに強い。Client Component はインタラクションに使う
- 基本方針は「デフォルト Server Component、必要な部分だけ Client Component」
- Client Component から Server Component を直接 import できない。`children` パターンを使う
