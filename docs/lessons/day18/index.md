# Day 18: 宣言的 UI — なぜ画面の書き換えを自分で書かないのか

## 今日のゴール

- 命令的（どうやって）と宣言的（何を）の違いを知る
- 命令的に画面を作ると、操作の履歴を追わないと今の表示が分からなくなることを知る
- React が「状態を見れば画面が分かる」仕組みでそれを解決していることを知る

## 文字を書き換える命令がないのに、画面が変わる

次は、ボタンを押すと数字が 1 ずつ増えるカウンターを React で書いたものです。

```tsx
import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

ボタンを押すと画面の数字が増えます。しかし、よく見ると不思議です。`setCount(count + 1)` で `count` という値を変えているだけで、「ボタンの文字を書き換えろ」という命令はどこにもありません。それなのに、画面の表示は更新されます。

なぜでしょうか。この「自分で書き換えていないのに画面が変わる」という性質こそ、<strong>宣言的 UI</strong>と呼ばれる考え方の核心です。

## 命令的 — 操作の積み重ねで画面を作る

React を使わない素の JavaScript では、画面を自分で書き換えます。

```html
<p id="output">こんにちは</p>

<script>
const el = document.querySelector("#output");
el.textContent = "おはよう";
</script>
```

`el.textContent = "おはよう"` で、画面の文字を直接書き換えています。このように「画面のどの要素を、どう変えるか」を手順として書くやり方を<strong>命令的</strong>（imperative）と呼びます。

単純なうちは問題ありません。しかし、操作が増えると厄介なことが起きます。

## 命令的の限界 — 今の画面が何を表示しているか分からない

次のコードを見てください。`#output` には今、何が表示されていますか？

```html
<p id="output">こんにちは</p>

<script>
const el = document.querySelector("#output");

el.textContent = "おはよう";
el.textContent = el.textContent + "ございます";
el.style.color = "red";
el.textContent = "こんばんは";
el.style.color = "";
</script>
```

答えは「こんばんは」（色なし）です。しかしそれを知るには、上から順に操作を追いかけるしかありません。5 行の操作でこれです。実際のアプリでは、クリック、タイマー、データ取得など、さまざまなタイミングで画面が書き換えられます。

```html
<p id="output">こんにちは</p>
<button id="btn-a">A</button>
<button id="btn-b">B</button>

<script>
const el = document.querySelector("#output");

document.querySelector("#btn-a").addEventListener("click", () => {
  el.textContent = "ボタン A が押された";
});

document.querySelector("#btn-b").addEventListener("click", () => {
  el.textContent = "ボタン B が押された";
  el.style.color = "blue";
});

setTimeout(() => {
  el.textContent = "3秒経ちました";
  el.style.color = "";
}, 3000);
</script>
```

ユーザーがボタン A → ボタン B → 3 秒待つ、の順に操作したら「3秒経ちました」（色なし）。ボタン B → 3 秒 → ボタン A なら「ボタン A が押された」（色なし）。**操作の履歴によって画面が変わり、コードのどこか 1 か所を見ても今の表示は分かりません。**

これが命令的の本質的なつらさです。画面の状態が「これまでの操作の積み重ね」としてしか存在しないため、コードが増えるほど「今この画面はどうなっているか」の把握が難しくなります。

## 宣言的 — 状態を見れば画面が分かる

React の発想は逆です。<strong>「この状態のとき、画面はこう」</strong>という対応を 1 か所に書きます。

```tsx
import { useState } from "react";

export default function App() {
  const [message, setMessage] = useState("こんにちは");
  const [color, setColor] = useState("");

  return (
    <div>
      <p style={{ color: color || undefined }}>{message}</p>
      <button onClick={() => setMessage("ボタン A が押された")}>A</button>
      <button onClick={() => { setMessage("ボタン B が押された"); setColor("blue"); }}>B</button>
    </div>
  );
}
```

`message` が `"ボタン A が押された"` で `color` が `""` なら、画面は「ボタン A が押された」（色なし）。状態を見るだけで画面が何を表示しているか分かります。操作の履歴を追う必要がありません。

状態を変えれば React が画面を作り直します。開発者は「どうやって書き換えるか」ではなく「何を表示するか」だけを書きます。このスタイルを<strong>宣言的</strong>（declarative）と呼びます。

| | 命令的（素の JS） | 宣言的（React） |
|---|---|---|
| 画面の作り方 | 操作を積み重ねる | 状態と見た目の対応を書く |
| 今の表示を知るには | 操作の履歴を追う | 状態を見る |
| 状態が変わったら | 自分で DOM を書き換える | React が画面を作り直す |

## 「作り直す」のに速いのはなぜか

「状態が変わるたびに画面を作り直す」と聞くと、毎回画面全体を描き直して遅いのでは、と思うかもしれません。

実際には、React は画面を丸ごと描き直しているわけではありません。新しく宣言された画面と、前の画面を比べ、<strong>実際に変わった部分だけ</strong>を本物の画面（DOM）に反映します。カウンターの数字だけが変わったなら、書き換わるのはその数字だけです。だから「作り直す」書き方でも速く動きます。

## まとめ

- <strong>命令的</strong>は操作の積み重ねで画面を作る。履歴を追わないと今の表示が分からない
- <strong>宣言的 UI</strong> は「この状態のとき画面はこう」だけを書く。状態を見れば画面が分かる
- React は変わった部分だけ更新するので、作り直す書き方でも速い
