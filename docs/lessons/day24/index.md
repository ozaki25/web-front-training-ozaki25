# Day 24: 条件分岐とリストレンダリング

## 今日のゴール

- JSX の中で条件に応じて表示を切り替える方法を知る
- `map` で配列をリスト表示する方法を知る
- `key` の役割と仕組みを知る

## 条件付きレンダリング

アプリケーションでは「ログインしていたら名前を表示」「エラーがあればエラーメッセージを表示」のように、条件に応じて表示を変えたい場面が頻繁にあります。

### if 文で分岐

最もシンプルな方法は、`return` の前に `if` 文を使うことです。

```tsx
interface StatusProps {
  isLoggedIn: boolean;
}

function Status({ isLoggedIn }: StatusProps) {
  if (isLoggedIn) {
    return <p>ようこそ！</p>;
  }
  return <p>ログインしてください。</p>;
}
```

### 三項演算子

JSX の `{}` の中で三項演算子を使えば、インラインで分岐できます。

```tsx
function Status({ isLoggedIn }: StatusProps) {
  return (
    <p>{isLoggedIn ? "ようこそ！" : "ログインしてください。"}</p>
  );
}
```

要素ごと切り替えることもできます。

```tsx
function AuthButton({ isLoggedIn }: StatusProps) {
  return (
    <div>
      {isLoggedIn ? (
        <button>ログアウト</button>
      ) : (
        <button>ログイン</button>
      )}
    </div>
  );
}
```

### && 演算子（短絡評価）

「条件を満たすときだけ表示、満たさないときは何も表示しない」場合は `&&` が便利です。

```tsx
interface NotificationProps {
  count: number;
}

function Notification({ count }: NotificationProps) {
  return (
    <div>
      {count > 0 && (
        <span className="badge">
          {count}件の通知があります
        </span>
      )}
    </div>
  );
}
```

`count > 0` が `true` のときだけ `<span>` が描画されます。`false` のときは何も描画されません。

> **注意**: `&&` の左側に数値を直接書くと意図しない表示になることがあります。`{0 && <span>...</span>}` は `0` が画面に表示されてしまいます。数値の場合は `{count > 0 && ...}` のように必ず比較式にする必要があります。

### 何も表示しないとき

条件によって何も表示したくない場合は `null` を返します。

```tsx
interface ErrorMessageProps {
  error: string | null;
}

function ErrorMessage({ error }: ErrorMessageProps) {
  if (!error) {
    return null; // 何も描画しない
  }
  return <p role="alert">{error}</p>;
}
```

`role="alert"` はスクリーンリーダーに「これは重要なメッセージです」と伝えるための属性です。エラーメッセージが動的に表示されたとき、支援技術がユーザーに通知できます。

## リストレンダリング

配列のデータをリスト表示するには、Day 11 で学んだ `map` メソッドを使います。

```tsx
function FruitList() {
  const fruits = ["りんご", "みかん", "バナナ"];

  return (
    <ul>
      {fruits.map((fruit) => (
        <li key={fruit}>{fruit}</li>
      ))}
    </ul>
  );
}
```

`map` で配列の各要素を JSX に変換しています。Day 11 で `map` を学んだときは値を変換していましたが、ここでは値を JSX 要素に変換しているのがポイントです。

### オブジェクトの配列

実際のアプリでは、オブジェクトの配列を表示することがほとんどです。

```tsx
interface User {
  id: number;
  name: string;
  department: string;
}

function UserList() {
  const users: User[] = [
    { id: 1, name: "田中太郎", department: "開発部" },
    { id: 2, name: "佐藤花子", department: "デザイン部" },
    { id: 3, name: "鈴木一郎", department: "開発部" },
  ];

  return (
    <table>
      <thead>
        <tr>
          <th scope="col">名前</th>
          <th scope="col">部署</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.department}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

Day 3 で学んだテーブルのセマンティクスを活かし、`<thead>`, `<tbody>`, `scope` 属性をきちんと使っています。

## key の役割

リストの各要素に `key` を付けているのに気づいたでしょうか。これは React の仕組み上、必須です。

### key がないとどうなるか

```tsx
// key がないと警告が出る
{fruits.map((fruit) => (
  <li>{fruit}</li>  // Warning: Each child in a list should have a unique "key" prop.
))}
```

### key が必要な理由

React は仮想 DOM の差分を計算するとき、リストの要素を「どの要素が追加/削除/移動されたか」判断する必要があります。`key` はそのための目印です。

例えば、リストの先頭に要素を追加する場合を考えます。

```
変更前: [B, C]
変更後: [A, B, C]
```

**key がない場合**: React はインデックスで比較します。
- 0番目: B → A に変更（更新）
- 1番目: C → B に変更（更新）
- 2番目: なし → C を追加

3つの操作が必要です。

**key がある場合**: React は key で要素を追跡します。
- key="B": そのまま
- key="C": そのまま
- key="A": 新しく追加

1つの操作で済みます。さらに、B と C の内部の state も保持されます。

### key のルール

1. **兄弟要素の間で一意であること**（全体で一意である必要はない）
2. **安定した値であること**（レンダリングのたびに変わらない）

```tsx
// 良い例: id を key にする
{users.map((user) => (
  <UserCard key={user.id} user={user} />
))}

// 悪い例: インデックスを key にする
{users.map((user, index) => (
  <UserCard key={index} user={user} />  // 並び替えや削除で問題が起きる
))}

// 悪い例: ランダムな値を key にする
{users.map((user) => (
  <UserCard key={Math.random()} user={user} />  // 毎回再作成される
))}
```

> **ポイント**: データに `id` がある場合は `id` を使うのが基本です。`id` がなく、リストが固定で並び替えや削除がない場合に限り、インデックスを key にしても問題ありません。

## 条件分岐とリストの組み合わせ

実際のアプリでは、条件分岐とリストを組み合わせることが多いです。

```tsx
interface Task {
  id: number;
  title: string;
  completed: boolean;
}

interface TaskListProps {
  tasks: Task[];
  filter: "all" | "active" | "completed";
}

function TaskList({ tasks, filter }: TaskListProps) {
  const filteredTasks = tasks.filter((task) => {
    switch (filter) {
      case "active":
        return !task.completed;
      case "completed":
        return task.completed;
      default:
        return true;
    }
  });

  if (filteredTasks.length === 0) {
    return <p>タスクがありません。</p>;
  }

  return (
    <ul>
      {filteredTasks.map((task) => (
        <li key={task.id}>
          <span
            style={{
              textDecoration: task.completed ? "line-through" : "none",
            }}
          >
            {task.title}
          </span>
          {task.completed && <span aria-label="完了済み"> ✓</span>}
        </li>
      ))}
    </ul>
  );
}
```

Day 11 で学んだ `filter` メソッドで配列を絞り込み、Day 20 の `switch` で条件を分岐しています。これまで学んだ知識がつながっていることを感じてもらえるでしょうか。

## まとめ

- 条件付きレンダリングには `if` 文、三項演算子、`&&` を使い分ける
- `&&` で数値を直接使うと `0` が表示されるので比較式にする
- `map` で配列を JSX に変換してリスト表示する
- `key` は React がリストの差分を効率的に計算するために必要
- `key` にはデータの `id` を使い、インデックスやランダム値は避ける

**次のレッスン**: [Day 25: useEffect とライフサイクル](/lessons/day25/)
