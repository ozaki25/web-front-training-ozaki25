# Day 26: フォームと Actions

## 今日のゴール

- React 19 の form actions を理解する
- `useActionState` でフォームの状態を管理できるようになる
- `useFormStatus` で送信中の状態を表示できるようになる
- 従来の制御コンポーネントとの違いを知る

## 従来のフォーム処理

Day 23 で学んだ `useState` を使ったフォーム処理を振り返りましょう。

```tsx
import { useState } from "react";

function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      if (!response.ok) throw new Error("送信に失敗しました");
      // 成功処理
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <p role="alert">{error}</p>}
      <div>
        <label htmlFor="name">名前</label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label htmlFor="email">メール</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
        />
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "送信中..." : "送信"}
      </button>
    </form>
  );
}
```

動きますが、`useState` が4つもあり、`event.preventDefault()`、ローディング管理、エラー管理など、定型的なコードが多いです。React 19 ではこれをもっとシンプルに書けます。

## form actions

React 19 では `<form>` の `action` 属性に関数を渡せるようになりました。

```tsx
function SimpleForm() {
  async function submitAction(formData: FormData) {
    const name = formData.get("name") as string;
    console.log(`名前: ${name}`);
  }

  return (
    <form action={submitAction}>
      <label htmlFor="name">名前</label>
      <input id="name" name="name" type="text" />
      <button type="submit">送信</button>
    </form>
  );
}
```

HTML の `<form>` はもともと `action` 属性に URL を指定してデータを送信する仕組みでした（Day 3 を思い出してください）。React 19 ではこれを拡張し、URL の代わりに関数を渡せるようにしたのです。

`action` に渡した関数は、フォーム送信時に `FormData` オブジェクトを引数として受け取ります。`FormData` は `<input>` の `name` 属性を元にデータを収集します。`event.preventDefault()` も不要です。

## useActionState

`useActionState` は、form action の状態（結果やエラー）を管理する Hook です。

```tsx
import { useActionState } from "react";

interface FormState {
  message: string;
  errors?: {
    name?: string;
    email?: string;
  };
}

function ContactForm() {
  async function submitAction(
    prevState: FormState,
    formData: FormData
  ): Promise<FormState> {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    // バリデーション
    if (!name.trim()) {
      return { message: "", errors: { name: "名前を入力してください" } };
    }
    if (!email.includes("@")) {
      return { message: "", errors: { email: "有効なメールアドレスを入力してください" } };
    }

    // API 呼び出し
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    if (!response.ok) {
      return { message: "送信に失敗しました" };
    }

    return { message: "送信しました！" };
  }

  const [state, formAction, isPending] = useActionState(submitAction, {
    message: "",
  });

  return (
    <form action={formAction}>
      {state.message && <p role="status">{state.message}</p>}

      <div>
        <label htmlFor="contact-name">名前</label>
        <input id="contact-name" name="name" type="text" disabled={isPending} />
        {state.errors?.name && (
          <p role="alert">{state.errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="contact-email">メール</label>
        <input id="contact-email" name="email" type="email" disabled={isPending} />
        {state.errors?.email && (
          <p role="alert">{state.errors.email}</p>
        )}
      </div>

      <button type="submit" disabled={isPending}>
        {isPending ? "送信中..." : "送信"}
      </button>
    </form>
  );
}
```

`useActionState` は3つの値を返します。

| 値 | 説明 |
|---|------|
| `state` | アクションが返した最新の状態 |
| `formAction` | `<form>` の `action` に渡す関数 |
| `isPending` | アクションが実行中かどうか |

アクション関数は2つの引数を受け取ります。

- `prevState` — 前回の状態（初回は `useActionState` の第2引数）
- `formData` — フォームのデータ

従来の方法と比べて `useState` が不要になり、ローディングやエラーの管理が `useActionState` に集約されました。

## useFormStatus

`useFormStatus` は、**フォーム内の子コンポーネント**から送信中の状態を取得する Hook です。

```tsx
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? "送信中..." : "送信"}
    </button>
  );
}
```

`useFormStatus` は必ず `<form>` の子コンポーネントの中で使う必要があります。フォーム自身のコンポーネントでは使えません。

```tsx
function ContactForm() {
  async function submitAction(
    prevState: { message: string },
    formData: FormData
  ) {
    // 送信処理...
    await fetch("/api/contact", {
      method: "POST",
      body: formData,
    });
    return { message: "送信しました！" };
  }

  const [state, formAction] = useActionState(submitAction, { message: "" });

  return (
    <form action={formAction}>
      {state.message && <p role="status">{state.message}</p>}

      <div>
        <label htmlFor="msg-name">名前</label>
        <input id="msg-name" name="name" type="text" />
      </div>

      <div>
        <label htmlFor="msg-email">メール</label>
        <input id="msg-email" name="email" type="email" />
      </div>

      {/* SubmitButton は form の子コンポーネント */}
      <SubmitButton />
    </form>
  );
}
```

`useFormStatus` を使うメリットは、送信ボタンが独立したコンポーネントになり、再利用できることです。どのフォームに入れても、そのフォームの送信状態を自動的に取得します。

## 従来の方法と Actions の使い分け

| 観点 | 従来（useState + onSubmit） | Actions（useActionState） |
|------|---------------------------|--------------------------|
| 状態管理 | 複数の useState が必要 | useActionState に集約 |
| ローディング | 自分で管理 | isPending が自動 |
| プログレッシブエンハンスメント | JavaScript 必須 | JS なしでも動く可能性 |
| 入力中のバリデーション | 得意（onChange で即座に） | 送信時のバリデーション向き |

入力中にリアルタイムでバリデーションしたい場合は、従来の `useState` + `onChange` が適しています。送信時にまとめてバリデーションする場合は、Actions が簡潔に書けます。

実際のプロジェクトでは両方を組み合わせることもあります。

## まとめ

- React 19 の form actions で `<form action={関数}>` とすることで、フォーム送信をシンプルに処理できる
- `useActionState` で送信結果（成功/エラー）とローディング状態を一括管理できる
- `useFormStatus` は子コンポーネントから送信状態を取得する Hook
- 入力中のリアルタイムバリデーションには従来の `useState` + `onChange` が適する
- 送信時のバリデーションには Actions が簡潔

**次のレッスン**: [Day 27: useOptimistic と Transition](/lessons/day27/)
