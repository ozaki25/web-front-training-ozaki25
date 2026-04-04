# Day 49: コンポーネント設計パターン

## 今日のゴール

- 代表的なコンポーネント設計パターンを理解する
- Presentational / Container パターンの考え方を知る
- Compound Components パターンを使えるようになる
- Render Props と Hooks の使い分けを理解する

## なぜ設計パターンを学ぶのか

Day 21〜30 で React の基礎を、Day 31〜40 で Next.js の機能を学びました。小さなコンポーネントは直感的に書けるようになったと思います。

しかし、実際のプロジェクトではコンポーネントが増え、複雑になっていきます。「この state はどこに置くべきか」「このロジックはどう共有するか」「このコンポーネントを再利用可能にするにはどうするか」という判断が必要になります。

設計パターンは、こうした問題に対する先人の解決策です。パターンを知っておくと、チーム内の設計議論に参加しやすくなります。

## Presentational / Container パターン

コンポーネントを「見た目」と「ロジック」に分離するパターンです。

### Presentational Component（見た目担当）

```tsx
// src/components/user-profile-view.tsx
type Props = {
  name: string;
  email: string;
  avatarUrl: string;
  onLogout: () => void;
};

export default function UserProfileView({
  name,
  email,
  avatarUrl,
  onLogout,
}: Props) {
  return (
    <div className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm">
      <img
        src={avatarUrl}
        alt={`${name}のアバター`}
        className="h-12 w-12 rounded-full"
      />
      <div>
        <p className="font-bold text-gray-900">{name}</p>
        <p className="text-sm text-gray-600">{email}</p>
      </div>
      <button
        onClick={onLogout}
        type="button"
        className="ml-auto text-sm text-gray-500 hover:text-gray-700"
      >
        ログアウト
      </button>
    </div>
  );
}
```

特徴:
- **Props だけで完結** — 自分で state を持たず、データや関数はすべて props で受け取る
- **再利用しやすい** — データの取得元に依存しない
- **テストしやすい** — props を渡すだけでテストできる

### Container Component（ロジック担当）

```tsx
// src/components/user-profile.tsx
import { auth, signOut } from "@/auth";
import UserProfileView from "./user-profile-view";

export default async function UserProfile() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return (
    <UserProfileView
      name={session.user.name ?? "名無し"}
      email={session.user.email ?? ""}
      avatarUrl={session.user.image ?? "/default-avatar.png"}
      onLogout={async () => {
        "use server";
        await signOut();
      }}
    />
  );
}
```

特徴:
- **データ取得やロジックを担当** — API 呼び出し、認証チェックなど
- **見た目のコードがない**（または最小限） — 表示は Presentational に委譲

### Server Components 時代の Presentational / Container

Next.js の App Router では、この分離がさらに自然になりました。

- **Server Component** = Container の役割（データ取得、ビジネスロジック）
- **Client Component** = Presentational の役割（インタラクション、表示）

Day 32 で学んだ「デフォルト Server Component、必要な部分だけ Client Component」の方針は、まさにこのパターンの実践です。

## Compound Components パターン

**Compound Components**（複合コンポーネント）は、複数のコンポーネントが協調して動くパターンです。HTML の `<select>` と `<option>` の関係に似ています。

```html
<!-- HTML の select と option も Compound Components の一種 -->
<select>
  <option value="a">オプション A</option>
  <option value="b">オプション B</option>
</select>
```

### Tabs コンポーネントの例

タブ UI を Compound Components で実装してみましょう。

```tsx
// src/components/tabs.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

// タブの状態を共有するための Context
type TabsContextType = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

const TabsContext = createContext<TabsContextType | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs コンポーネントの中で使ってください");
  }
  return context;
}

// 親コンポーネント
function Tabs({
  defaultTab,
  children,
}: {
  defaultTab: string;
  children: ReactNode;
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
}

// タブリスト
function TabList({ children }: { children: ReactNode }) {
  return (
    <div role="tablist" className="flex gap-1 border-b border-gray-200">
      {children}
    </div>
  );
}

// 個々のタブ
function Tab({ value, children }: { value: string; children: ReactNode }) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      role="tab"
      type="button"
      aria-selected={isActive}
      onClick={() => setActiveTab(value)}
      className={`px-4 py-2 ${
        isActive
          ? "border-b-2 border-blue-500 font-bold text-blue-600"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      {children}
    </button>
  );
}

// タブパネル
function TabPanel({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  const { activeTab } = useTabsContext();

  if (activeTab !== value) return null;

  return (
    <div role="tabpanel" className="p-4">
      {children}
    </div>
  );
}

// 名前空間としてエクスポート
Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;

export default Tabs;
```

### 使い方

```tsx
import Tabs from "@/components/tabs";

export default function SettingsPage() {
  return (
    <main>
      <h1>設定</h1>
      <Tabs defaultTab="profile">
        <Tabs.List>
          <Tabs.Tab value="profile">プロフィール</Tabs.Tab>
          <Tabs.Tab value="notifications">通知</Tabs.Tab>
          <Tabs.Tab value="security">セキュリティ</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="profile">
          <p>プロフィール設定の内容</p>
        </Tabs.Panel>
        <Tabs.Panel value="notifications">
          <p>通知設定の内容</p>
        </Tabs.Panel>
        <Tabs.Panel value="security">
          <p>セキュリティ設定の内容</p>
        </Tabs.Panel>
      </Tabs>
    </main>
  );
}
```

Compound Components の利点は以下のとおりです。

- **API が宣言的** — JSX の構造を見ればどんな UI か直感的にわかる
- **柔軟** — タブの順番や数を自由に変えられる
- **内部状態が隠蔽されている** — `activeTab` の管理を利用者が意識しなくていい

> **アクセシビリティ**: タブ UI には `role="tablist"`、`role="tab"`、`role="tabpanel"`、`aria-selected` を適切に設定しましょう。

## Render Props vs Custom Hooks

**Render Props** は、関数を props として渡して表示内容を委譲するパターンです。

```tsx
// Render Props パターン
type Props = {
  url: string;
  render: (data: unknown, isLoading: boolean) => ReactNode;
};

function DataFetcher({ url, render }: Props) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setIsLoading(false);
      });
  }, [url]);

  return <>{render(data, isLoading)}</>;
}

// 使い方
<DataFetcher
  url="/api/users"
  render={(data, isLoading) =>
    isLoading ? <p>読み込み中...</p> : <UserList users={data} />
  }
/>
```

しかし現在は、同じことを **Custom Hook** でよりシンプルに実現できます。

```tsx
// Custom Hook パターン（推奨）
function useDataFetcher(url: string) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setIsLoading(false);
      });
  }, [url]);

  return { data, isLoading };
}

// 使い方
function UserPage() {
  const { data, isLoading } = useDataFetcher("/api/users");

  if (isLoading) return <p>読み込み中...</p>;
  return <UserList users={data} />;
}
```

**基本方針: ロジックの共有には Custom Hook を使う。Render Props は特殊なケース（Compound Components の内部など）でのみ使う。**

## 実プロジェクトでの設計判断

「どのパターンを使うべきか」はケースバイケースです。判断の指針をまとめます。

| 状況 | 推奨パターン |
|------|-----------|
| データ取得とUIの分離 | Presentational / Container（Server / Client Component） |
| 関連するUI部品のセット | Compound Components |
| ロジックの共有 | Custom Hooks |
| 条件分岐が複雑な表示 | Compound Components or 単純な条件分岐 |

### オーバーエンジニアリングに注意

パターンを知ると、何でもパターンに当てはめたくなります。しかし、**シンプルなコンポーネントにパターンを適用すると、かえって複雑になります**。

```tsx
// ❌ やりすぎ: 単純なボタンに Compound Components は不要
<Button>
  <Button.Icon name="save" />
  <Button.Label>保存</Button.Label>
</Button>

// ✅ シンプルが十分
<Button icon="save">保存</Button>
```

パターンは「問題が発生してから適用する」くらいのタイミングが適切です。

## まとめ

- Presentational / Container はUIとロジックの分離。Server / Client Component の境界と自然に一致する
- Compound Components は関連するUI部品を協調させるパターン。タブやアコーディオンに適する
- ロジックの共有には Custom Hooks が最も適している
- パターンは問題解決のための道具。シンプルなケースに無理に適用しない
