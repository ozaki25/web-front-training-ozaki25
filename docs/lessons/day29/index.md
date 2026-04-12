# Day 29: Context と状態管理パターン

## 今日のゴール

- props drilling の問題を知る
- `useContext` で離れたコンポーネント間でデータを共有する方法を知る
- Context の適切な使い方と使いすぎの弊害を知る
- 状態をどこに置くかの設計指針を知る

## props drilling 問題

Day 22 で学んだように、React のデータは親から子へ props として流れます。しかし、深くネストしたコンポーネントにデータを渡すとき、途中のコンポーネントが「バケツリレー」のように props を受け渡す必要があります。

```tsx
// App → Layout → Sidebar → UserInfo と props を渡す必要がある
function App() {
  const user = { name: "田中", role: "admin" };
  return <Layout user={user} />;
}

function Layout({ user }: { user: User }) {
  return (
    <div>
      <Sidebar user={user} />  {/* user を渡すだけ */}
      <main>コンテンツ</main>
    </div>
  );
}

function Sidebar({ user }: { user: User }) {
  return (
    <aside>
      <UserInfo user={user} />  {/* user を渡すだけ */}
    </aside>
  );
}

function UserInfo({ user }: { user: User }) {
  return <p>{user.name}さん（{user.role}）</p>;
}
```

`Layout` と `Sidebar` は `user` を使わないのに、子に渡すためだけに props を受け取っています。これが **props drilling**（プロップス掘削）です。

props drilling の問題点:

- 途中のコンポーネントが不要な props を持つ
- props の追加・削除時に中間のコンポーネントもすべて変更が必要
- コンポーネントの再利用性が下がる

## Context の基本

Context は、コンポーネントツリーを飛び越えてデータを共有する仕組みです。

### Step 1: Context を作成する

```tsx
import { createContext } from "react";

interface User {
  name: string;
  role: "admin" | "editor" | "viewer";
}

const UserContext = createContext<User | null>(null);
```

`createContext` の引数は初期値（Provider で囲まれていないときの値）です。

### Step 2: Provider でデータを提供する

```tsx
function App() {
  const user: User = { name: "田中", role: "admin" };

  return (
    <UserContext.Provider value={user}>
      <Layout />
    </UserContext.Provider>
  );
}
```

`Provider` の `value` に渡したデータが、子孫コンポーネントから参照可能になります。

### Step 3: useContext でデータを取得する

```tsx
import { useContext } from "react";

function UserInfo() {
  const user = useContext(UserContext);

  if (!user) return null;

  return <p>{user.name}さん（{user.role}）</p>;
}
```

もう `Layout` や `Sidebar` で `user` を受け渡す必要はありません。

> **React 19 の `use()` API**: React 19 では `use(ThemeContext)` のように `use()` を使って Context を読み取ることもできます。`useContext` との違いは、`use()` は `if` 文や `for` 文の中でも呼び出せる点です。将来的には `use()` が推奨される方向ですが、現時点ではどちらも使えます。

```tsx
function Layout() {
  return (
    <div>
      <Sidebar />
      <main>コンテンツ</main>
    </div>
  );
}

function Sidebar() {
  return (
    <aside>
      <UserInfo />
    </aside>
  );
}
```

## カスタム Hook で Context を使いやすくする

Day 28 で学んだカスタム Hook を使い、Context の利用をさらにシンプルにできます。

```tsx
import { createContext, useContext } from "react";

interface User {
  name: string;
  role: "admin" | "editor" | "viewer";
}

const UserContext = createContext<User | null>(null);

// カスタム Hook: null チェックを一箇所にまとめる
function useUser(): User {
  const user = useContext(UserContext);
  if (!user) {
    throw new Error("useUser は UserProvider の中で使ってください");
  }
  return user;
}

// Provider コンポーネント
function UserProvider({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}
```

使う側は非常にシンプルになります。

```tsx
function App() {
  const user: User = { name: "田中", role: "admin" };

  return (
    <UserProvider user={user}>
      <Layout />
    </UserProvider>
  );
}

function UserInfo() {
  const user = useUser(); // null チェック不要！
  return <p>{user.name}さん（{user.role}）</p>;
}
```

## Context で状態を管理する

ここまでの例は静的なデータの共有でした。`useState` と組み合わせると、状態の共有もできます。

```tsx
import { createContext, useContext, useState } from "react";

interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme は ThemeProvider の中で使ってください");
  }
  return context;
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

```tsx
function App() {
  return (
    <ThemeProvider>
      <Header />
      <main>
        <Content />
      </main>
    </ThemeProvider>
  );
}

function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header>
      <button onClick={toggleTheme}>
        {theme === "light" ? "🌙 ダークモード" : "☀️ ライトモード"}
      </button>
    </header>
  );
}

function Content() {
  const { theme } = useTheme();

  return (
    <div style={{ background: theme === "light" ? "#fff" : "#333", color: theme === "light" ? "#333" : "#fff" }}>
      <p>現在のテーマ: {theme}</p>
    </div>
  );
}
```

## Context の使いすぎに注意

Context は便利ですが、なんでも Context にするのは問題です。

### Context の更新は子孫全体に影響する

Provider の `value` が変わると、その Context を使っているすべてのコンポーネントが再レンダリングされます。

```tsx
// 問題: value が変わるたびに、UserContext を使うすべてのコンポーネントが再レンダリング
function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState(0);

  // theme が変わるだけで user を参照するコンポーネントも再レンダリングされる
  return (
    <AppContext.Provider value={{ user, theme, notifications, setUser, setTheme, setNotifications }}>
      {children}
    </AppContext.Provider>
  );
}
```

### 解決策: Context を分割する

```tsx
// 関心ごとに Context を分ける
function App() {
  return (
    <UserProvider>
      <ThemeProvider>
        <NotificationProvider>
          <Layout />
        </NotificationProvider>
      </ThemeProvider>
    </UserProvider>
  );
}
```

テーマが変わっても、User や Notification の Context を使うコンポーネントは影響を受けません。

## Context を使う前に考えること

Context が必要になる前に、まずこれらのアプローチを検討する価値があります。

### 1. コンポーネント合成で解決できないか

Day 28 の合成パターンを使えば、props drilling を避けられる場合があります。

```tsx
// props drilling に見えるが...
function Page() {
  const user = useUser();
  return <Layout sidebar={<UserInfo user={user} />} />;
}

function Layout({ sidebar }: { sidebar: React.ReactNode }) {
  return (
    <div>
      <aside>{sidebar}</aside>
      <main>コンテンツ</main>
    </div>
  );
}
```

`Layout` は `user` を知る必要がなく、`sidebar` として渡された JSX をそのまま表示するだけです。

### 2. state を持ち上げるだけで済まないか

2〜3階層の props 渡しなら、Context よりも明示的な props のほうがコードの追跡が容易です。

## 状態の設計指針

| 状態の性質 | 置く場所 |
|-----------|---------|
| 1つのコンポーネントだけで使う | そのコンポーネントの `useState` |
| 親子で共有する | 親の `useState` + props |
| 離れたコンポーネントで共有する | Context |
| アプリ全体で共有する | Context（テーマ、認証情報など） |
| サーバーから取得するデータ | Server Components で取得（Next.js, Day 35 で学ぶ） |

> **ポイント**: state は「必要な場所に、できるだけ近くに」置くのが原則です。最初から Context を使わず、props で不便になってから Context を検討するのが定石です。

## まとめ

- props drilling は途中のコンポーネントが不要な props を受け渡す問題
- `createContext` + `useContext` で、コンポーネントツリーを飛び越えてデータを共有できる
- カスタム Hook（`useUser` など）と Provider コンポーネントのセットで使うのが定番
- Context は関心ごとに分割し、不要な再レンダリングを避ける
- Context の前に、合成パターンや state の持ち上げで解決できないか考える

**次のレッスン**: [Day 30: React のレンダリング最適化](/lessons/day30/)
