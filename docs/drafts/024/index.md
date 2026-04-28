# フォームと Server Actions — フォーム送信の仕組みが変わった

## 今日のゴール

- React 19 のフォーム処理（form actions）の仕組みを知る
- useActionState でフォームの状態を管理する方法を知る
- useOptimistic で即座に UI を更新する考え方を知る

## フォーム送信の歴史

Web のフォーム送信は、時代とともに仕組みが変わってきました。

HTML だけの時代は、`<form action="/submit" method="post">` で送信し、ページ全体がリロードされていました。React の時代になると、`onSubmit` で `event.preventDefault()` して `fetch` で送信し、state で結果を管理する方法が主流になりました。

React 19 では、さらにシンプルな方法が使えるようになりました。`<form>` の `action` 属性に関数を渡す**form actions**です。

## form actions — action に関数を渡す

```tsx
function ContactForm() {
  async function submitForm(formData: FormData) {
    "use server";
    const name = formData.get("name");
    const message = formData.get("message");
    await saveMessage(name, message);
  }

  return (
    <form action={submitForm}>
      <input name="name" placeholder="名前" required />
      <textarea name="message" placeholder="メッセージ" required />
      <button type="submit">送信</button>
    </form>
  );
}
```

`action={submitForm}` で、フォーム送信時に `submitForm` 関数が呼ばれます。`FormData` にフォームの値が入ってきます。

`"use server"` は、この関数がサーバーで実行されることを示す指示です（Next.js の Server Actions）。ブラウザから直接データベースにアクセスするのではなく、サーバーを経由して安全に処理します。

## useActionState — フォームの状態を管理する

フォーム送信の結果（成功・エラー・送信中）を管理するために `useActionState` を使います。

```tsx
import { useActionState } from "react";

function ContactForm() {
  async function submitForm(prevState: string | null, formData: FormData) {
    "use server";
    const name = formData.get("name");
    if (!name) return "名前を入力してください";
    await saveMessage(formData);
    return null;
  }

  const [error, formAction, isPending] = useActionState(submitForm, null);

  return (
    <form action={formAction}>
      {error && <p role="alert">{error}</p>}
      <input name="name" placeholder="名前" required />
      <button type="submit" disabled={isPending}>
        {isPending ? "送信中..." : "送信"}
      </button>
    </form>
  );
}
```

`useActionState` は 3 つの値を返します。

| 値 | 意味 |
|------|------|
| `error` | 前回のアクションの戻り値（エラーメッセージなど） |
| `formAction` | `<form action>` に渡す関数 |
| `isPending` | 送信中かどうか |

`isPending` でボタンを無効にしたり、「送信中...」と表示したりできます。

## useOptimistic — 結果を待たずに画面を更新する

「いいね」ボタンを押したとき、サーバーの応答を待ってから画面を更新すると、一瞬遅れて反応します。ユーザーにとっては「押したのに反応がない」と感じる瞬間です。

`useOptimistic` は、**サーバーの応答を待たずに、画面を先に更新する**仕組みです。

```tsx
import { useOptimistic } from "react";

function LikeButton({ initialCount }: { initialCount: number }) {
  const [optimisticCount, addOptimistic] = useOptimistic(
    initialCount,
    (current, _action) => current + 1
  );

  async function handleLike() {
    addOptimistic(null);
    await fetch("/api/like", { method: "POST" });
  }

  return (
    <form action={handleLike}>
      <button type="submit">♥ {optimisticCount}</button>
    </form>
  );
}
```

ボタンを押した瞬間に数字が増えます。サーバーへのリクエストはバックグラウンドで進みます。もしリクエストが失敗したら、React が自動的に元の値に戻します。

「先に成功を見せて、失敗したら戻す」。この楽観的（optimistic）な更新が、レスポンスの速い UI を作るパターンです。

## まとめ

- React 19 の form actions では、`<form action={関数}>` でフォーム送信を処理します
- `"use server"` を付けた関数は Next.js のサーバーで実行されます
- `useActionState` でフォームの状態（エラー、送信中）を管理します
- `useOptimistic` でサーバーの応答を待たずに画面を先に更新できます。失敗時は自動で戻ります
