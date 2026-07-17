# AbortController — リクエストを途中でやめる

## 今日のゴール

- fetch したリクエストは途中で中断できると知る
- 入力のたびに古いリクエストを捨てる使い方を知る
- タイムアウトや競合状態の対策に使えると知る

## 送ったリクエストは取り消せる

一度送った fetch は、返事をただ待つしかない、わけではありません。**AbortController** を使うと、途中で「もういらない」と中断できます。

```js
const controller = new AbortController();
fetch("/search?q=猫", { signal: controller.signal });

controller.abort(); // このリクエストを中断する
```

`controller.signal` を fetch に渡しておき、`abort()` を呼ぶと、そのリクエストは打ち切られます。

## 古い結果が後から来る問題

検索ボックスに「ねこ」と打つと、「ね」と「ねこ」で 2 回リクエストが飛ぶことがあります。もし「ね」の結果が「ねこ」より後に返ると、画面には古い「ね」の結果が残ってしまいます。

これが競合状態です。新しい入力のたびに前のリクエストを `abort()` すれば、古い結果は届かず、この取り違えを防げます。

```js
let controller;

function search(q) {
  controller?.abort(); // 前の検索を中断する
  controller = new AbortController();
  fetch(`/search?q=${q}`, { signal: controller.signal });
}
```

## タイムアウトにも使える

一定時間で返ってこないリクエストを諦めるのにも使えます。`AbortSignal.timeout()` を渡すと、指定した時間で自動的に中断されます。

```js
// 5 秒で諦める
fetch("/slow", { signal: AbortSignal.timeout(5000) });
```

## まとめ

- fetch は AbortController の signal で途中中断できる
- 入力のたびに前を abort すると、古い結果の取り違えを防げる
- AbortSignal.timeout で時間切れの中断もできる
