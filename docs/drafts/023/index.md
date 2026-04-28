# useEffect — レンダリングの「外」で起きることを扱う

## 今日のゴール

- useEffect が何のためにあるかを知る
- 依存配列の仕組みを知る
- useEffect を使わなくていいケースを知る

## コンポーネントの仕事は JSX を返すこと

React のコンポーネントは関数です。その仕事は **state と props を受け取って JSX を返す**こと。これだけです。

```tsx
function Greeting({ name }: { name: string }) {
  return <p>こんにちは、{name}さん</p>;
}
```

しかし実際のアプリでは、JSX を返す以外のことが必要になる場面があります。

- ページが表示されたら**サーバーからデータを取得**したい
- state が変わったら**ドキュメントのタイトルを更新**したい
- コンポーネントが消えるとき**タイマーを止めたい**

これらはすべて「JSX を返す」こととは別の処理です。このような「レンダリングの外で起きること」を**副作用**（side effect）と呼びます。

`useEffect` は、この副作用をコンポーネントに組み込むための仕組みです。

## useEffect の基本

```tsx
import { useEffect, useState } from "react";

function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, [userId]);

  if (!user) return <p>読み込み中...</p>;
  return <p>{user.name}</p>;
}
```

`useEffect` は 2 つの引数を取ります。

1. **実行したい処理**（関数）
2. **依存配列**（いつ実行するかの条件）

## 依存配列 — いつ実行されるか

依存配列の内容によって、useEffect の実行タイミングが変わります。

```tsx
// userId が変わるたびに実行
useEffect(() => {
  // データを取得
}, [userId]);

// 初回のみ実行（空配列）
useEffect(() => {
  // 初期化処理
}, []);

// 毎回実行（依存配列なし。通常は使わない）
useEffect(() => {
  // 何かの処理
});
```

| 依存配列 | 実行タイミング |
|---------|--------------|
| `[userId]` | `userId` が変わったとき |
| `[]` | 初回レンダリング後の 1 回だけ |
| なし | 毎回のレンダリング後 |

依存配列は「この値が変わったら、処理をやり直してほしい」という宣言です。

## クリーンアップ — 後片付け

useEffect の関数から関数を返すと、**クリーンアップ**（後片付け）として扱われます。

```tsx
useEffect(() => {
  const timer = setInterval(() => {
    console.log("tick");
  }, 1000);

  // クリーンアップ: コンポーネントが消えるとき、またはやり直す前に実行
  return () => {
    clearInterval(timer);
  };
}, []);
```

タイマーやイベントリスナーを設定した場合、コンポーネントが消えるときに止めないとメモリリークになります。クリーンアップ関数でそれを防ぎます。

## useEffect を使わなくていいケース

useEffect は便利ですが、**使わなくて済むなら使わないほうがよい**場面があります。

### state から計算できる値

```tsx
// ❌ useEffect で派生 state を作る
const [items, setItems] = useState([]);
const [count, setCount] = useState(0);

useEffect(() => {
  setCount(items.length);
}, [items]);

// ✅ レンダリング中に計算する
const [items, setItems] = useState([]);
const count = items.length;
```

`count` は `items` から計算できます。わざわざ useEffect で state を同期させる必要はありません。普通の変数で十分です。

### イベントに応じた処理

```tsx
// ❌ useEffect でイベント応答
useEffect(() => {
  if (submitted) {
    navigate("/success");
  }
}, [submitted]);

// ✅ イベントハンドラで直接やる
const handleSubmit = () => {
  // 送信処理
  navigate("/success");
};
```

ボタンを押したら何かする、という処理は useEffect ではなくイベントハンドラに書きます。

## まとめ

- コンポーネントの仕事は JSX を返すこと。それ以外の処理（データ取得、タイマーなど）は**副作用**です
- `useEffect` は副作用をコンポーネントに組み込むための仕組みです
- **依存配列**で「いつ実行するか」を宣言します。`[userId]` なら userId が変わったとき、`[]` なら初回のみ
- クリーンアップ関数を返すことで、タイマーやリスナーの後片付けができます
- state から計算できる値やイベント応答には useEffect は不要です
