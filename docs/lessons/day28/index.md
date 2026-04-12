# Day 28: カスタム Hooks とコンポーネント設計

## 今日のゴール

- カスタム Hook でロジックを再利用する方法を知る
- コンポーネントを適切に分割するという考え方を知る
- 合成（Composition）パターンを知る

## カスタム Hook とは

Day 23〜27 で `useState`, `useEffect`, `useTransition` などの組み込み Hook を学びました。これらを組み合わせて独自の Hook を作れます。それがカスタム Hook です。

カスタム Hook は `use` で始まる関数で、中で他の Hook を呼び出します。

### なぜカスタム Hook が必要か

同じロジックを複数のコンポーネントで使いたい場面を考えます。

```tsx
// UserProfile コンポーネント
function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // ...
}

// Settings コンポーネント（同じデータ取得ロジック）
function Settings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // ...
}
```

データ取得のロジックが重複しています。これをカスタム Hook に抽出できます。

## カスタム Hook の作り方

```tsx
import { useState, useEffect } from "react";

function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, loading, error };
}
```

Day 19 で学んだジェネリクスを使い、どんな型のデータにも対応できるようにしています。`cancelled` フラグは、コンポーネントがアンマウントされた後に state を更新しないためのクリーンアップです。

使う側はこうなります。

```tsx
interface User {
  id: number;
  name: string;
}

function UserProfile() {
  const { data: user, loading, error } = useFetch<User>("/api/user");

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p role="alert">エラー: {error}</p>;
  if (!user) return null;

  return <h1>{user.name}</h1>;
}

interface Settings {
  theme: string;
  language: string;
}

function SettingsPage() {
  const { data: settings, loading, error } = useFetch<Settings>("/api/settings");

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p role="alert">エラー: {error}</p>;
  if (!settings) return null;

  return <p>テーマ: {settings.theme}</p>;
}
```

ロジックは `useFetch` に集約され、各コンポーネントは表示に集中できます。

### もう1つの例: useLocalStorage

ローカルストレージとの同期もよくカスタム Hook にします。

```tsx
import { useState } from "react";

function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue; // SSR対応
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  function updateValue(newValue: T) {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  }

  return [value, updateValue] as const;
}
```

`useState` の初期値に関数を渡しています。これは**遅延初期化**と呼ばれ、`localStorage` の読み取りのような重い処理を初回レンダリング時だけ実行するための書き方です。

> **Next.js での注意**: Server Components や SSR 時には `window` オブジェクトが存在しないため、`typeof window === "undefined"` のチェックが必要です。

```tsx
function ThemeSwitcher() {
  const [theme, setTheme] = useLocalStorage("theme", "light");

  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      現在のテーマ: {theme}
    </button>
  );
}
```

## カスタム Hook のルール

1. **名前は `use` で始める**: React が Hook として認識するために必要
2. **トップレベルで呼び出す**: `if` やループの中では使えない（組み込み Hook と同じルール）
3. **Hook の中で Hook を使える**: カスタム Hook の中で `useState` や別のカスタム Hook を呼べる

## コンポーネント分割の考え方

カスタム Hook がロジックの再利用なら、コンポーネント分割は UI の構造化です。

### いつ分割するか

- **繰り返し使う UI**: ボタン、カード、入力フィールドなど
- **独立した責務**: ヘッダー、サイドバー、フォームなど
- **state が局所的**: 特定の state がコンポーネントの一部でしか使われないとき
- **見通しが悪くなったとき**: 1つのコンポーネントが長くなりすぎたら分割のサイン

### 分割の例

```tsx
// 分割前: 1つのコンポーネントにすべてが入っている
function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  // 100行以上のコード...

  return (
    <main>
      {/* ヘッダー、フォーム、フィルター、リスト、フッター... */}
    </main>
  );
}
```

```tsx
// 分割後: 責務ごとにコンポーネントを分ける
function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  return (
    <main>
      <h1>やることリスト</h1>
      <TodoForm onAdd={(title) => setTodos([...todos, { id: Date.now(), title, completed: false }])} />
      <TodoFilter current={filter} onChange={setFilter} />
      <TodoList todos={filteredTodos} />
    </main>
  );
}
```

各コンポーネントは自分の役割だけに集中し、全体の見通しがよくなります。

## 合成（Composition）パターン

React のコンポーネント設計で最も重要なパターンが**合成**です。Day 22 で学んだ `children` を使い、コンポーネントを「入れ物」として設計します。

### レイアウトコンポーネント

```tsx
interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
}

function PageLayout({ title, children }: PageLayoutProps) {
  return (
    <div className="page">
      <header>
        <h1>{title}</h1>
      </header>
      <main>{children}</main>
      <footer>
        <p>&copy; 2026 My App</p>
      </footer>
    </div>
  );
}

// 使う側が中身を決める
function AboutPage() {
  return (
    <PageLayout title="About">
      <p>このアプリについて...</p>
    </PageLayout>
  );
}

function ContactPage() {
  return (
    <PageLayout title="Contact">
      <ContactForm />
    </PageLayout>
  );
}
```

### 特殊化（Specialization）

汎用的なコンポーネントを作り、特定の用途に特殊化するパターンです。

```tsx
interface ButtonProps {
  variant: "primary" | "danger" | "ghost";
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}

function Button({ variant, children, onClick, type = "button" }: ButtonProps) {
  return (
    <button type={type} className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}

// 特殊化: 削除ボタン
function DeleteButton({ onDelete }: { onDelete: () => void }) {
  return (
    <Button variant="danger" onClick={onDelete}>
      削除
    </Button>
  );
}

// 特殊化: 送信ボタン
function SubmitButton() {
  return (
    <Button variant="primary" type="submit">
      送信
    </Button>
  );
}
```

### slots パターン

`children` 以外にも、複数の「差し込み口」を持つコンポーネントを作れます。

```tsx
interface DialogProps {
  title: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
}

function Dialog({ title, children, footer }: DialogProps) {
  return (
    <div role="dialog" aria-labelledby="dialog-title" className="dialog">
      <h2 id="dialog-title" className="dialog-title">{title}</h2>
      <div className="dialog-body">{children}</div>
      <div className="dialog-footer">{footer}</div>
    </div>
  );
}

// 使う側
<Dialog
  title="確認"
  footer={
    <>
      <Button variant="ghost" onClick={onCancel}>キャンセル</Button>
      <Button variant="danger" onClick={onDelete}>削除する</Button>
    </>
  }
>
  <p>本当に削除しますか？この操作は取り消せません。</p>
</Dialog>
```

`role="dialog"` と `aria-labelledby` で、ダイアログがスクリーンリーダーに正しく認識されるようにしています。

## まとめ

- カスタム Hook は `use` で始まる関数で、ロジックを再利用できる仕組み
- データ取得、ローカルストレージ連携など、共通のロジックをカスタム Hook に抽出する
- コンポーネントは責務ごとに分割し、見通しをよくする
- 合成パターン（children、slots）でコンポーネントを柔軟に組み合わせる
- 汎用コンポーネントを特殊化して再利用する

**次のレッスン**: [Day 29: Context と状態管理パターン](/lessons/day29/)
