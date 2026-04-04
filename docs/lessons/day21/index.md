# Day 21: React の概要と JSX

## 今日のゴール

- React が何を解決するライブラリかを理解する
- JSX の仕組みを知る
- コンポーネントの基本的な書き方を覚える

## React が解決する問題

Day 12 で DOM 操作を学んだとき、要素の作成や更新が煩雑だったことを思い出してください。

```javascript
// Day 12 で書いたような DOM 操作
const list = document.querySelector("#todo-list");
const li = document.createElement("li");
li.textContent = "新しいタスク";
list.appendChild(li);
```

数行のコードでも、「要素を取得 → 要素を作成 → 内容を設定 → 追加」という手順を毎回書く必要がありました。アプリが大きくなると、「どの要素がどの状態に対応しているのか」を追いかけるのが困難になります。

React は、この問題を**宣言的 UI**（declarative UI）というアプローチで解決します。

### 命令的 UI vs 宣言的 UI

**命令的（Imperative）**: 「まずこの要素を取得して、次にこの要素を作って、これを追加して...」と手順を書く。

```javascript
// 命令的: 手順を1つずつ指示する
const counter = document.querySelector("#counter");
const button = document.querySelector("#increment");
let count = 0;
button.addEventListener("click", () => {
  count++;
  counter.textContent = `カウント: ${count}`;
});
```

**宣言的（Declarative）**: 「このデータのとき、UI はこう見えるべき」と結果を書く。

```tsx
// 宣言的: 状態に対応する UI を記述する
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      カウント: {count}
    </button>
  );
}
```

宣言的 UI では、状態（`count`）が変わったら React が自動的に画面を更新してくれます。開発者は「状態がこうなったら UI はこう」と書くだけで、DOM 操作を自分で行う必要がありません。

## React の仕組み ― 仮想 DOM

React はなぜ DOM 操作を自動化できるのでしょうか。その仕組みが**仮想 DOM**（Virtual DOM）です。

1. コンポーネントの状態が変わる
2. React がコンポーネントを再実行し、新しい仮想 DOM（JavaScript オブジェクトのツリー）を作る
3. 前の仮想 DOM と比較し、差分（変わった部分だけ）を特定する
4. 実際の DOM に最小限の変更を適用する

開発者が「状態に対応する UI の形」を記述するだけで、React が裏で差分計算と DOM 更新を効率的に行ってくれます。

## JSX とは

React のコードに出てくる HTML のような記法が **JSX**（JavaScript XML）です。

```tsx
const element = <h1>こんにちは、世界！</h1>;
```

これは HTML ではありません。JavaScript の中に書かれた JSX です。ビルド時に通常の JavaScript の関数呼び出しに変換されます。

```javascript
// JSX がビルド時に変換された結果（イメージ）
const element = React.createElement("h1", null, "こんにちは、世界！");
```

`React.createElement` は JavaScript のオブジェクト（仮想 DOM のノード）を返します。このオブジェクトを元に React が実際の DOM を構築します。

### JSX のルール

JSX にはいくつかのルールがあります。

**1. 必ず1つのルート要素で囲む**

```tsx
// エラー！ 複数のルート要素は書けない
return (
  <h1>タイトル</h1>
  <p>本文</p>
);

// OK: div で囲む
return (
  <div>
    <h1>タイトル</h1>
    <p>本文</p>
  </div>
);

// OK: Fragment（余分な DOM 要素を作らない）
return (
  <>
    <h1>タイトル</h1>
    <p>本文</p>
  </>
);
```

`<>...</>` は **Fragment** と呼ばれ、余計な `<div>` を追加せずに複数の要素をまとめられます。

**2. JavaScript の式を `{}` で埋め込める**

```tsx
const name = "田中";
const element = <h1>こんにちは、{name}さん！</h1>;
```

`{}` の中には JavaScript の式（値を返すもの）を書けます。

```tsx
const price = 1000;
const element = (
  <p>
    税込価格: {(price * 1.1).toLocaleString()}円
  </p>
);
```

**3. HTML と異なる属性名がある**

JSX は JavaScript なので、JavaScript の予約語と衝突する属性名が変更されています。

| HTML | JSX |
|------|-----|
| `class` | `className` |
| `for` | `htmlFor` |

```tsx
<label htmlFor="email" className="form-label">
  メールアドレス
</label>
<input id="email" type="email" />
```

**4. すべてのタグを閉じる**

HTML では `<img>` や `<input>` を閉じなくても動きますが、JSX ではすべてのタグを閉じる必要があります。

```tsx
// OK
<img src="photo.jpg" alt="写真" />
<input type="text" />
<br />
```

## コンポーネントの基本

React のコンポーネントは、JSX を返す JavaScript の関数です。

```tsx
function Greeting() {
  return <h1>こんにちは！</h1>;
}
```

コンポーネント名は**必ず大文字で始めます**。小文字だと HTML タグと見分けがつきません。

```tsx
// コンポーネントとして認識される
<Greeting />

// HTML の greeting タグ（存在しない）として解釈される
<greeting />
```

コンポーネントは他のコンポーネントの中で使えます。

```tsx
function Greeting() {
  return <h1>こんにちは！</h1>;
}

function App() {
  return (
    <main>
      <Greeting />
      <p>React の学習を始めましょう。</p>
    </main>
  );
}
```

`App` コンポーネントの中で `Greeting` コンポーネントを使っています。こうやってコンポーネントを組み合わせて画面を構築するのが React の基本的な考え方です。

## TypeScript でのコンポーネント

Day 17〜20 で学んだ TypeScript を使って、コンポーネントを型安全に書けます。ファイルの拡張子は `.tsx`（TypeScript + JSX）を使います。

```tsx
// App.tsx
function App(): React.JSX.Element {
  const title: string = "React 入門";

  return (
    <main>
      <h1>{title}</h1>
      <p>React 19 で学ぶモダン UI 開発</p>
    </main>
  );
}
```

戻り値の型 `React.JSX.Element` は省略しても推論されるので、通常は書きません。

```tsx
// 実際にはこう書くことが多い
function App() {
  return (
    <main>
      <h1>React 入門</h1>
    </main>
  );
}
```

## React が画面に表示するまでの流れ

React アプリケーションのエントリーポイントは、通常このようになっています。

```tsx
import { createRoot } from "react-dom/client";
import App from "./App";

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
```

1. HTML に `<div id="root"></div>` という空の要素がある
2. `createRoot` でその要素を React のルートとして指定する
3. `render` でルートコンポーネント（`App`）を描画する
4. React が `App` を実行し、返された JSX から仮想 DOM を作り、実際の DOM に反映する

> **ポイント**: Next.js ではこのセットアップは自動で行われるので、自分で書く必要はありません。ただし、裏でこの仕組みが動いていることを知っておくと理解が深まります。

## まとめ

- React は宣言的 UI で DOM 操作の煩雑さを解決する。「状態 → UI」の対応を書くだけ
- 仮想 DOM で差分を検出し、最小限の DOM 更新を行う
- JSX は JavaScript の中に書く HTML 風の記法で、ビルド時に JavaScript に変換される
- コンポーネントは JSX を返す関数。名前は大文字で始める
- コンポーネントを組み合わせて画面を構築するのが React の基本パターン

**次のレッスン**: [Day 22: コンポーネントと props](/lessons/day22/)
