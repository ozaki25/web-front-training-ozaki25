# AbortController — リクエストを途中でやめる

## 今日のゴール

- fetch は signal を通して途中で中断できると知る
- 自分で中断したときに出る AbortError は握りつぶすのが定番と知る
- タイムアウトや複数まとめての中断にも使えると知る

## リクエストの中断と AbortError

一度送った fetch は、返事をただ待つしかないわけではありません。**AbortController** を使うと、途中で「もういらない」と中断できます。

```js
const controller = new AbortController();
fetch("/search?q=猫", { signal: controller.signal });

controller.abort(); // このリクエストを中断する
```

`controller.signal` は、その中断を fetch に伝えるためのスイッチのような値です。fetch はこの signal を見張っていて、`abort()` が呼ばれた瞬間に通信を打ち切り、Promise を `AbortError` というエラーで失敗させます。

この `AbortError` は「自分で中断したから起きた、想定内のエラー」です。通信の失敗と同じ扱いで画面にエラーを出すと不自然なので、`AbortError` だけは無視するのが定番です。

```js
try {
  const res = await fetch("/search?q=猫", { signal: controller.signal });
  const data = await res.json();
} catch (e) {
  if (e.name === "AbortError") return; // 自分で中断した分は無視する
  throw e; // それ以外は本物のエラー
}
```

## 古い結果の取り違えと一括中断

検索ボックスに「ねこ」と打つと、「ね」と「ねこ」で 2 回リクエストが飛ぶことがあります。もし「ね」の結果が「ねこ」より後に返ると、画面には古い「ね」の結果が残ってしまいます。

これが競合状態です。新しい入力のたびに前のリクエストを `abort()` すれば、古い結果は届かなくなり、この取り違えを防げます。

```js
let controller;

function search(q) {
  controller?.abort(); // 前の検索を中断する
  controller = new AbortController();
  fetch(`/search?q=${q}`, { signal: controller.signal });
}
```

1 つの signal は、いくつもの fetch に同時に渡せます。関連する複数のリクエストを 1 つの controller にまとめておけば、`abort()` 一回で全部まとめて中断できます。

```js
const controller = new AbortController();
const { signal } = controller;

Promise.all([
  fetch("/user", { signal }),
  fetch("/posts", { signal }),
  fetch("/comments", { signal }),
]);

controller.abort(); // 3 つとも同時に中断される
```

## React のクリーンアップとタイムアウト

React では、画面から消えたコンポーネントにあとから結果が返ると、無駄な更新や警告のもとになります。`useEffect` の後片付け（クリーンアップ）で `abort()` を呼べば、表示が消えた時点で通信も止められます。

```jsx
useEffect(() => {
  const controller = new AbortController();

  fetch("/data", { signal: controller.signal })
    .then((res) => res.json())
    .then(setData)
    .catch((e) => {
      if (e.name !== "AbortError") throw e;
    });

  return () => controller.abort(); // 画面から消えるときに中断する
}, []);
```

時間切れの中断には `AbortSignal.timeout()` が使えます。指定したミリ秒を過ぎると自動で中断し、このときは `AbortError` ではなく `TimeoutError` で失敗します。

```js
// 5 秒で諦める
fetch("/slow", { signal: AbortSignal.timeout(5000) });
```

手動の中断とタイムアウトを両立したいときは、`AbortSignal.any()` で複数の signal を 1 つにまとめられます。渡した signal のどれか 1 つでも中断されれば、その fetch も中断されます。

```js
const controller = new AbortController();

fetch("/data", {
  // ユーザーの中断か 10 秒の時間切れか、どちらでも止まる
  signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]),
});
```

## まとめ

- fetch は signal を通して途中で中断できる
- 自分で中断した AbortError は握りつぶすのが定番
- 入力のたびに前を abort すると古い結果の取り違えを防げる
- AbortSignal.timeout や any で時間切れや一括中断もできる
