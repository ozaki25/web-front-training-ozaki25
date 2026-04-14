# Day 39: Server Actions

## 今日のゴール

- Server Actions の仕組みと `"use server"` の意味を知る
- フォーム送信でのデータ変更パターンを知る
- revalidation（キャッシュ再検証）の仕組みを知る
- Server Actions のセキュリティ上の注意点を知る

## Server Actions とは

Server Actions は、**クライアント（ブラウザ）からサーバーの関数を直接呼び出す仕組み**です。フォーム送信やボタンクリックで、サーバー上の関数を実行できます。

Day 38 で Route Handlers（API エンドポイント）を学びましたが、Server Actions を使うと、API エンドポイントを作らずにサーバーの処理を呼び出せます。

## 基本的な Server Action

`"use server"` を書くと、その関数が Server Action になります。

```tsx
// src/app/contact/page.tsx

async function submitContact(formData: FormData) {
  "use server";

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  // サーバーで実行される（データベース保存、メール送信など）
  console.log("お問い合わせ:", { name, email, message });
}

export default function ContactPage() {
  return (
    <main>
      <h1>お問い合わせ</h1>
      <form action={submitContact}>
        <div>
          <label htmlFor="name">お名前</label>
          <input type="text" id="name" name="name" required />
        </div>
        <div>
          <label htmlFor="email">メールアドレス</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div>
          <label htmlFor="message">メッセージ</label>
          <textarea id="message" name="message" required />
        </div>
        <button type="submit">送信</button>
      </form>
    </main>
  );
}
```

注目ポイントがいくつかあります。

- **`"use server"`** — 関数の先頭に書くと、その関数はサーバーでのみ実行される
- **`<form action={submitContact}>`** — HTML のフォームの `action` に関数を渡している
- **`FormData`** — ブラウザ標準のフォームデータオブジェクトを引数として受け取る

### 裏で何が起きているか

1. ユーザーがフォームを送信する
2. ブラウザが Next.js サーバーに POST リクエストを送る
3. サーバーが `submitContact` 関数を実行する
4. 結果に応じてページが更新される

重要なのは、**`submitContact` の中身（コード）はブラウザに送られない**ということです。ブラウザが送るのはフォームデータだけで、サーバー側の処理内容は完全にサーバーに留まります。

## Server Actions を別ファイルに分ける

Server Actions は別ファイルにまとめることもできます。ファイルの先頭に `"use server"` を書くと、そのファイル内のすべてのエクスポートされた関数が Server Action になります。

```ts
// src/app/actions.ts
"use server";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  // データベースに保存...
}

export async function deletePost(postId: string) {
  // データベースから削除...
}
```

こうして分離した Server Actions は、どのページからでも import して `<form action={createPost}>` のように使えます。

## Client Component からの呼び出し

Server Actions は Client Component からも呼び出せます。フォームの `action` だけでなく、イベントハンドラの中でも使えます。

```tsx
// src/app/actions.ts
"use server";

export async function addToCart(productId: string) {
  // カートに追加する処理（サーバーで実行）
  console.log("カートに追加:", productId);
}
```

```tsx
// src/app/products/add-to-cart-button.tsx
"use client";

import { addToCart } from "../actions";

export default function AddToCartButton({ productId }: { productId: string }) {
  async function handleClick() {
    await addToCart(productId);
    alert("カートに追加しました！");
  }

  return (
    <button onClick={handleClick} type="button">
      カートに追加
    </button>
  );
}
```

## Revalidation — キャッシュの再検証

データを変更したら、表示しているデータも最新にしたいですよね。これが **revalidation**（再検証）です。

### revalidatePath — パスを指定して再検証

```ts
"use server";

import { revalidatePath } from "next/cache";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  // データベースに保存...

  // /posts ページのキャッシュを無効化して再取得
  revalidatePath("/posts");
}
```

`revalidatePath("/posts")` を呼ぶと、`/posts` ページのキャッシュが無効になり、次のアクセス時に新しいデータで再レンダリングされます。

### revalidateTag — タグを指定して再検証

Day 37 で学んだ `fetch` にタグを付けておくと、そのタグ単位でキャッシュを無効化できます。

```tsx
// データ取得時にタグを付ける
async function getPosts() {
  "use cache";
  const res = await fetch("https://api.example.com/posts", {
    next: { tags: ["posts"] },
  });
  return res.json();
}
```

```ts
// Server Action でタグを指定して再検証
"use server";

import { revalidateTag } from "next/cache";

export async function createPost(formData: FormData) {
  // データベースに保存...

  // "posts" タグのキャッシュをすべて無効化
  revalidateTag("posts");
}
```

## フォーム送信中の状態管理

フォーム送信中にローディング状態を表示するには、`useActionState` を使います。

```tsx
"use client";

import { useActionState } from "react";
import { createPost } from "../actions";

export default function NewPostForm() {
  const [state, formAction, isPending] = useActionState(
    async (previousState: { message: string } | null, formData: FormData) => {
      await createPost(formData);
      return { message: "投稿を作成しました！" };
    },
    null
  );

  return (
    <form action={formAction}>
      <div>
        <label htmlFor="title">タイトル</label>
        <input type="text" id="title" name="title" required />
      </div>
      <div>
        <label htmlFor="content">本文</label>
        <textarea id="content" name="content" required />
      </div>
      <button type="submit" disabled={isPending}>
        {isPending ? "送信中..." : "投稿する"}
      </button>
      {state?.message && <p role="status">{state.message}</p>}
    </form>
  );
}
```

`isPending` が `true` の間、ボタンを無効化したりローディング表示を出したりできます。

## セキュリティの注意点

Server Actions は便利ですが、セキュリティ上の重要な注意点があります。

### 1. Server Actions は公開エンドポイント

Server Actions は HTTP の POST エンドポイントとして公開されます。つまり、**誰でもリクエストを送れます**。ブラウザの開発者ツールやコマンドラインから直接呼び出すことも可能です。

```ts
"use server";

export async function deletePost(postId: string) {
  // ❌ 危険: 認証チェックなしで削除している
  // await db.delete(postId);

  // ✅ 安全: 認証チェックを行う
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("認証が必要です");
  }

  const post = await db.findPost(postId);
  if (post.authorId !== user.id) {
    throw new Error("権限がありません");
  }

  await db.delete(postId);
}
```

### 2. 入力値は必ずバリデーションする

ブラウザ側の `required` 属性は回避できます。そのため、サーバー側でも必ず検証する必要があります。

```ts
"use server";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  // サーバー側でもバリデーション
  if (!title || title.length < 1 || title.length > 100) {
    throw new Error("タイトルは1〜100文字で入力してください");
  }
  if (!content || content.length < 1) {
    throw new Error("本文を入力してください");
  }

  // バリデーション通過後に保存
}
```

### 3. 引数に機密情報を渡さない

Server Actions の引数はネットワーク上を流れます。パスワードなどの機密情報を直接渡す場合は HTTPS が必須です（Next.js の本番環境では通常 HTTPS）。

## まとめ

- Server Actions は `"use server"` で宣言し、サーバーでのみ実行される関数
- フォームの `action` 属性に渡すことで、API を作らずにサーバー処理を呼び出せる
- `revalidatePath` / `revalidateTag` でデータ変更後にキャッシュを再検証できる
- `useActionState` で送信中の状態を管理できる
- Server Actions は公開エンドポイントなので、認証チェックとバリデーションは必須

**次のレッスン**: [Day 40: 動的ルーティングとミドルウェア](/lessons/day40/)
