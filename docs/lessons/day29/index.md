# useOptimistic と Transition

## 今日のゴール

- 楽観的 UI 更新という考え方を知る
- `useOptimistic` の使い方を知る
- `useTransition` で優先度の低い更新を遅延させる方法を知る

## 楽観的 UI 更新とは

Day 28 でフォーム送信を学びました。API にデータを送信して結果を待つ間、ユーザーは「送信中...」と表示されて待つことになります。

しかし、SNS の「いいね」ボタンを思い浮かべてみます。ボタンを押した瞬間にいいね数が増え、裏で API 通信が行われます。失敗した場合だけ元に戻します。

このように、サーバーの応答を待たずに UI を先に更新するパターンを**楽観的 UI 更新**（optimistic update）と呼びます。「たいてい成功するだろう」と楽観的に先に結果を見せることから、この名前が付いています。

## useOptimistic

React 19 の `useOptimistic` は、楽観的 UI 更新を簡単に実装する Hook です。

```tsx
import { useState, useOptimistic } from "react";

interface Message {
  id: number;
  text: string;
  sending?: boolean;
}

function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "こんにちは" },
    { id: 2, text: "元気ですか？" },
  ]);

  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (currentMessages, newMessage: string) => [
      ...currentMessages,
      { id: Date.now(), text: newMessage, sending: true },
    ]
  );

  async function sendAction(formData: FormData) {
    const text = formData.get("message") as string;

    // 楽観的に UI を更新（即座に表示される）
    addOptimisticMessage(text);

    // サーバーに送信（時間がかかる）
    const response = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const newMessage = await response.json();

    // サーバーの応答で正式な state を更新
    setMessages((prev) => [...prev, newMessage]);
  }

  return (
    <div>
      <ul>
        {optimisticMessages.map((msg) => (
          <li key={msg.id}>
            {msg.text}
            {msg.sending && <span aria-label="送信中"> (送信中...)</span>}
          </li>
        ))}
      </ul>
      <form action={sendAction}>
        <label htmlFor="chat-message">メッセージ</label>
        <input id="chat-message" name="message" type="text" />
        <button type="submit">送信</button>
      </form>
    </div>
  );
}
```

`useOptimistic` は2つの値を返します。

| 値 | 説明 |
|---|------|
| `optimisticMessages` | 楽観的な値を含む現在の状態 |
| `addOptimisticMessage` | 楽観的な値を追加する関数 |

引数は以下の通りです。

- 第1引数: 実際の state（`messages`）
- 第2引数: 楽観的な値を作る関数

仕組みを整理すると:

1. ユーザーが送信 → `addOptimisticMessage` で即座に UI に表示
2. サーバーに送信中の間、楽観的な値が表示される
3. サーバーから応答が来たら `setMessages` で正式な state を更新
4. 正式な state が更新されると、楽観的な値は自動的に消え、正式なデータに置き換わる

## いいねボタンの例

よりシンプルな例です。

```tsx
import { useOptimistic } from "react";

interface LikeButtonProps {
  initialCount: number;
  liked: boolean;
  onToggle: () => Promise<void>;
}

function LikeButton({ initialCount, liked, onToggle }: LikeButtonProps) {
  const [optimisticLiked, setOptimisticLiked] = useOptimistic(liked);

  async function toggleAction() {
    setOptimisticLiked(!optimisticLiked);
    await onToggle();
  }

  return (
    <form action={toggleAction}>
      <button type="submit">
        {optimisticLiked ? "❤️" : "🤍"}{" "}
        {initialCount + (optimisticLiked && !liked ? 1 : 0)}
      </button>
    </form>
  );
}
```

ボタンを押した瞬間にハートの色が変わり、API 通信の結果を待ちません。

> **第2引数の省略について**: Chat の例では `useOptimistic(messages, updateFn)` と第2引数に更新関数を渡しましたが、LikeButton の例では `useOptimistic(liked)` と省略しています。第2引数（更新関数）を省略すると、`setOptimisticLiked` に渡した値がそのまま楽観的な状態になります。単純な値の上書きで済む場合は省略形が簡潔です。

## useTransition

画面の更新の中には、緊急度の異なるものがあります。

- テキスト入力への反映 → 即座に反映しないと不自然
- 検索結果の絞り込み → 少し遅れても許容できる

`useTransition` は、「緊急度の低い更新」をマークして、緊急度の高い更新を優先させる Hook です。

```tsx
import { useState, useTransition } from "react";

function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;

    // 入力欄の更新は即座に（緊急）
    setQuery(value);

    // 検索結果の更新は遅延可能（非緊急）
    startTransition(() => {
      const filtered = allItems.filter((item) =>
        item.toLowerCase().includes(value.toLowerCase())
      );
      setResults(filtered);
    });
  }

  return (
    <div>
      <label htmlFor="search">検索</label>
      <input id="search" value={query} onChange={handleChange} />
      {isPending && <p>検索中...</p>}
      <ul>
        {results.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

const allItems = Array.from({ length: 10000 }, (_, i) => `アイテム ${i + 1}`);
```

`useTransition` は2つの値を返します。

| 値 | 説明 |
|---|------|
| `isPending` | トランジションが実行中かどうか |
| `startTransition` | 非緊急な更新をラップする関数 |

### 何が起きているか

1. ユーザーが入力 → `setQuery` が即座に実行され、入力欄が更新される
2. 同時に `startTransition` 内の `setResults` もスケジュールされる
3. React は `setQuery` の更新を優先し、画面を更新する
4. 余裕ができたら `setResults` の更新を処理する
5. 処理中に新しい入力があれば、古いトランジションは中断され、新しいもので上書きされる

これにより、1万件のリストをフィルタリングしていても入力欄がカクつきません。

## useTransition と useOptimistic の違い

| Hook | 目的 | 主な用途 |
|------|------|---------|
| `useOptimistic` | サーバー応答前に UI を先に更新する | いいね、メッセージ送信 |
| `useTransition` | 非緊急な更新を遅延させる | 検索フィルタ、タブ切り替え |

`useOptimistic` は「結果を先に見せる」、`useTransition` は「重い処理を後回しにする」という違いがあります。

## タブ切り替えの例

`useTransition` の典型的な使用例をもう1つ紹介します。

```tsx
import { useState, useTransition } from "react";

function TabContainer() {
  const [tab, setTab] = useState<"about" | "posts" | "contact">("about");
  const [isPending, startTransition] = useTransition();

  function handleTabChange(nextTab: "about" | "posts" | "contact") {
    startTransition(() => {
      setTab(nextTab);
    });
  }

  return (
    <div>
      <nav role="tablist" aria-label="プロフィール">
        <button
          role="tab"
          aria-selected={tab === "about"}
          onClick={() => handleTabChange("about")}
        >
          概要
        </button>
        <button
          role="tab"
          aria-selected={tab === "posts"}
          onClick={() => handleTabChange("posts")}
        >
          投稿
        </button>
        <button
          role="tab"
          aria-selected={tab === "contact"}
          onClick={() => handleTabChange("contact")}
        >
          連絡先
        </button>
      </nav>

      <div
        role="tabpanel"
        style={{ opacity: isPending ? 0.7 : 1 }}
      >
        {tab === "about" && <AboutTab />}
        {tab === "posts" && <PostsTab />}
        {tab === "contact" && <ContactTab />}
      </div>
    </div>
  );
}
```

タブ切り替え時に重い描画があっても、`startTransition` でラップすることで、ユーザーのクリック操作が遅延なく処理されます。`isPending` を使って切り替え中のタブパネルを半透明にし、ユーザーに「切り替え中」であることを視覚的に伝えています。

`role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected` を使って、タブ UI がスクリーンリーダーでも正しく読み上げられるようにしています。

## まとめ

- 楽観的 UI 更新は、サーバー応答を待たずに UI を先に更新するパターン
- `useOptimistic` は楽観的な値を一時的に表示し、正式な state が更新されたら自動で置き換わる
- `useTransition` は緊急度の低い更新をマークし、緊急な更新（入力反映など）を優先させる
- `isPending` でトランジション中の状態をユーザーに伝えられる
