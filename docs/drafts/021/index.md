# state とイベント処理

## 今日のゴール

- useState で状態を管理する方法を知る
- イベントハンドラーの書き方を知る
- 再レンダリングの仕組みを知る
- state の不変性がなぜ重要かを知る

## state とは

Day 24 で学んだ props は、親から渡されるデータでした。では、コンポーネント自身が「今何回クリックされたか」「入力フォームに何が入力されているか」といった変化する情報を持つにはどうすればよいでしょうか。

これを実現するのが **state**（ステート、状態）です。state はコンポーネントが自分で管理する値で、変更すると React が画面を自動的に更新します。

## useState

React で state を使うには `useState` Hook（フック）を呼び出します。

```tsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        +1
      </button>
    </div>
  );
}
```

`useState(0)` は配列を返します。

- `count` — 現在の state の値（初期値は `0`）
- `setCount` — state を更新する関数

`setCount` を呼ぶと state が更新され、React がコンポーネントを再実行（**再レンダリング**）して画面が更新されます。

> **Hook（フック）とは**: `use` で始まる関数を Hook と呼びます。React の機能（state、副作用など）をコンポーネントで使えるようにする仕組みです。Hook はコンポーネントのトップレベルで呼び出す必要があり、`if` の中やループの中では使えません。

## イベントハンドラー

Day 14 で学んだ `addEventListener` の React 版がイベントハンドラーです。JSX 属性として `on` + イベント名で指定します。

```tsx
function App() {
  function handleClick() {
    console.log("クリックされました");
  }

  return <button onClick={handleClick}>クリック</button>;
}
```

`onClick={handleClick}` に注目です。`handleClick()` と括弧を付けると関数がその場で実行されてしまいます。括弧なしで関数の参照を渡すのがポイントです。

### TypeScript でのイベント型

Day 22 で DOM イベントの型を学びました。React では独自のイベント型を使います。

```tsx
function SearchForm() {
  const [query, setQuery] = useState("");

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log(`検索: ${query}`);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="search">検索</label>
      <input
        id="search"
        type="text"
        value={query}
        onChange={handleChange}
      />
      <button type="submit">検索する</button>
    </form>
  );
}
```

よく使うイベント型をまとめます。

| JSX 属性 | イベント型 |
|----------|-----------|
| `onClick` | `React.MouseEvent<HTMLButtonElement>` |
| `onChange` | `React.ChangeEvent<HTMLInputElement>` |
| `onSubmit` | `React.FormEvent<HTMLFormElement>` |
| `onKeyDown` | `React.KeyboardEvent<HTMLInputElement>` |
| `onFocus` | `React.FocusEvent<HTMLInputElement>` |

## 再レンダリングの仕組み

`useState` の更新関数（`setCount` など）を呼ぶと何が起きるか、順を追って見ていきます。

```tsx
function Counter() {
  console.log("Counter がレンダリングされました");
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}
```

1. 初回レンダリング: `count` は `0`、画面に「カウント: 0」が表示される
2. ボタンをクリック: `setCount(1)` が呼ばれる
3. React が `Counter` 関数を再度呼び出す（再レンダリング）
4. 今度は `count` が `1` になっている
5. 新しい仮想 DOM と前の仮想 DOM を比較し、差分だけ実際の DOM に反映する

コンソールを見ると、クリックするたびに「Counter がレンダリングされました」と表示されるのが確認できます。

### state は「次のレンダリング」で反映される

重要な注意点があります。`setCount` を呼んでも、**その時点の `count` は変わりません**。

```tsx
function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
    console.log(count); // まだ 0 のまま！
    // 次のレンダリングで count が 1 になる
  }

  return <button onClick={handleClick}>カウント: {count}</button>;
}
```

`setCount` は「次のレンダリングで使う値」を予約するだけです。現在の関数実行中の `count` は変わりません。これを **state のスナップショット** と呼びます。

## state の不変性

state を更新するときは、**既存の値を直接変更せず、新しい値を作って渡す**のがルールです。

### プリミティブ値の場合

数値や文字列はそもそも直接変更できないので、自然に正しく書けます。

```tsx
setCount(count + 1);       // OK: 新しい数値を渡している
setName("新しい名前");      // OK: 新しい文字列を渡している
```

### 配列の場合

配列を state にしている場合、`push` や `splice` で直接変更してはいけません。

```tsx
function TodoApp() {
  const [todos, setTodos] = useState<string[]>(["買い物", "掃除"]);

  function addTodo() {
    // NG: 既存の配列を直接変更している
    // todos.push("新しいタスク");
    // setTodos(todos);

    // OK: スプレッド構文で新しい配列を作る
    setTodos([...todos, "新しいタスク"]);
  }

  function removeTodo(index: number) {
    // OK: filter で新しい配列を作る
    setTodos(todos.filter((_, i) => i !== index));
  }

  return (
    <div>
      <ul>
        {todos.map((todo, index) => (
          <li key={index}>
            {todo}
            <button onClick={() => removeTodo(index)}>削除</button>
          </li>
        ))}
      </ul>
      <button onClick={addTodo}>追加</button>
    </div>
  );
}
```

### オブジェクトの場合

オブジェクトも同様に、スプレッド構文で新しいオブジェクトを作ります。

```tsx
const [form, setForm] = useState({ name: "", email: "" });

// NG: 直接変更
// form.name = "新しい名前";
// setForm(form);

// OK: スプレッド構文で新しいオブジェクトを作る
setForm({ ...form, name: "新しい名前" });
```

### なぜ不変性が重要なのか

React は state が更新されたかどうかを**参照の比較**（`===`）で判断します。

```javascript
const arr = [1, 2, 3];
arr.push(4);       // 同じ配列オブジェクトを変更
arr === arr;       // true → React は「変化なし」と判断

const newArr = [...arr, 4]; // 新しい配列を作成
arr === newArr;    // false → React は「変化あり」と判断 → 再レンダリング
```

既存のオブジェクトを直接変更しても、参照が同じなので React は変化を検知できません。新しいオブジェクトを作ることで、React が変化を正しく検知し、画面を更新できるのです。

## 複数の state

1つのコンポーネントで複数の `useState` を使えます。例えば、メールアドレス・パスワード・パスワード表示切り替えをそれぞれ別の state として管理できます。

```tsx
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [isVisible, setIsVisible] = useState(false);
```

関連する値は1つのオブジェクトにまとめる場合と、個別の `useState` に分ける場合があります。一緒に更新されることが多い値はまとめ、独立して変化する値は分けるのが一般的です。

## まとめ

- `useState` でコンポーネント自身の状態を管理できる
- state が更新されると React がコンポーネントを再レンダリングする
- `setCount` は即座に値を変えるのではなく、次のレンダリングで反映される
- state は不変性を守る（既存の値を変更せず、新しい値を作る）
- React は参照の比較で変化を検知するので、新しいオブジェクトや配列を作ることが重要
