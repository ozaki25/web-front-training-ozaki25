# useEffect とライフサイクル

## 今日のゴール

- 副作用（side effect）とは何かを知る
- `useEffect` の基本的な使い方を知る
- 依存配列とクリーンアップの仕組みを知る
- `useEffect` の適切な使い方と避けるべきパターンを知る

## 副作用とは

Day 25 で学んだように、React のコンポーネントは「state と props を受け取って JSX を返す関数」です。この「JSX を返す」以外の処理を**副作用**（side effect）と呼びます。

代表的な副作用:

- 外部 API からデータを取得する
- ドキュメントのタイトルを変更する
- タイマーを設定する
- イベントリスナーを登録する
- ローカルストレージにデータを保存する

これらの処理は「画面を描画する」こととは別の仕事なので、レンダリングとは別のタイミングで実行する必要があります。

## useEffect の基本

`useEffect` は副作用をレンダリングとは別に実行するための Hook です。

```tsx
import { useState, useEffect } from "react";

function PageTitle() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // レンダリング後に実行される
    document.title = `${count}回クリックしました`;
  });

  return (
    <button onClick={() => setCount(count + 1)}>
      クリック: {count}
    </button>
  );
}
```

`useEffect` に渡した関数は、コンポーネントのレンダリングが完了した**後**に実行されます。

## 依存配列

上の例では、`useEffect` は毎回のレンダリング後に実行されます。しかし、「特定の値が変わったときだけ実行したい」場合が大半です。第2引数に**依存配列**を渡すことで制御できます。

### 特定の値が変わったときだけ実行

```tsx
useEffect(() => {
  document.title = `${count}回クリックしました`;
}, [count]); // count が変わったときだけ実行
```

依存配列に `[count]` を指定すると、`count` が変化したレンダリングの後だけ関数が実行されます。

### マウント時のみ実行

空の配列 `[]` を渡すと、コンポーネントが画面に追加されたとき（マウント時）に1回だけ実行されます。

```tsx
function UserProfile() {
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    // コンポーネントの初回表示時に API からデータを取得
    fetch("https://api.example.com/user/1")
      .then((response) => response.json())
      .then((data) => setUser(data));
  }, []); // 空の依存配列 → マウント時に1回だけ

  if (!user) {
    return <p>読み込み中...</p>;
  }

  return <p>ようこそ、{user.name}さん！</p>;
}
```

### 依存配列なし

依存配列を省略すると、毎回のレンダリング後に実行されます。これが必要な場面はほとんどありません。

```tsx
// 毎回実行される（通常は避ける）
useEffect(() => {
  console.log("レンダリングされました");
});
```

## クリーンアップ

副作用の中には、コンポーネントが画面から消える（アンマウントされる）ときに後片付けが必要なものがあります。例えば、イベントリスナーやタイマーです。

`useEffect` の関数から**クリーンアップ関数**を返すことで、後片付けができます。

```tsx
function WindowSize() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }

    // イベントリスナーを登録
    window.addEventListener("resize", handleResize);

    // クリーンアップ: コンポーネントが消えるときにリスナーを解除
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []); // マウント時に登録、アンマウント時に解除

  return <p>ウィンドウ幅: {width}px</p>;
}
```

クリーンアップが必要な理由は、コンポーネントが消えた後もイベントリスナーが残り続けると、存在しないコンポーネントの state を更新しようとしてメモリリークや意図しない動作を引き起こすためです。

### タイマーのクリーンアップ

```tsx
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    // クリーンアップ: タイマーを停止
    return () => clearInterval(id);
  }, []);

  return <p>経過時間: {seconds}秒</p>;
}
```

`setSeconds((prev) => prev + 1)` のように関数を渡す形式を使っています。これは**更新関数**と呼ばれ、最新の state 値を確実に参照できます。`setSeconds(seconds + 1)` と書くと、クロージャに閉じ込められた `seconds`（常に `0`）を参照してしまいます。

## useEffect の実行タイミング

依存配列の値が変わったとき、クリーンアップ関数は新しい Effect が実行される**前**に呼ばれます。

```tsx
function ChatRoom({ roomId }: { roomId: string }) {
  useEffect(() => {
    console.log(`${roomId} に接続`);

    return () => {
      console.log(`${roomId} から切断`);
    };
  }, [roomId]);

  return <p>チャットルーム: {roomId}</p>;
}
```

`roomId` が `"general"` から `"random"` に変わると:

1. `"general から切断"` （古い Effect のクリーンアップ）
2. `"random に接続"` （新しい Effect の実行）

## useEffect を使うべきでない場面

`useEffect` は強力ですが、使いすぎると問題になります。以下は `useEffect` を使わなくてよいパターンです。

### レンダリング中に計算できるもの

```tsx
// NG: useEffect で計算している
function FilteredList({ items, query }: { items: string[]; query: string }) {
  const [filtered, setFiltered] = useState(items);

  useEffect(() => {
    setFiltered(items.filter((item) => item.includes(query)));
  }, [items, query]);

  return <ul>{filtered.map((item) => <li key={item}>{item}</li>)}</ul>;
}

// OK: レンダリング中に直接計算する
function FilteredList({ items, query }: { items: string[]; query: string }) {
  const filtered = items.filter((item) => item.includes(query));

  return <ul>{filtered.map((item) => <li key={item}>{item}</li>)}</ul>;
}
```

props や state から計算できる値は、`useEffect` を使わずにレンダリング中に直接計算しましょう。無駄な state と再レンダリングを避けられます。

### イベントに応じた処理

```tsx
// NG: query が変わるたびに useEffect で検索 API を呼んでいる
useEffect(() => {
  if (query) {
    fetch(`/api/search?q=${query}`)
      .then((res) => res.json())
      .then((data) => setResults(data));
  }
}, [query]); // 入力のたびに API 呼び出しが走ってしまう

// OK: フォーム送信時にイベントハンドラーで処理する
function handleSubmit(event: React.FormEvent) {
  event.preventDefault();
  fetch(`/api/search?q=${query}`)
    .then((res) => res.json())
    .then((data) => setResults(data));
}
```

「ユーザーのアクションに応じた処理」はイベントハンドラーに書くべきです。`useEffect` は「表示されたときに何かする」場面で使います。

## まとめ

- `useEffect` はレンダリング後に副作用を実行する Hook
- 依存配列で実行タイミングを制御する: `[value]` で値の変化時、`[]` でマウント時のみ
- クリーンアップ関数でイベントリスナーやタイマーの後片付けをする
- props や state から計算できる値には `useEffect` を使わない
- ユーザーアクションへの応答はイベントハンドラーに書く
