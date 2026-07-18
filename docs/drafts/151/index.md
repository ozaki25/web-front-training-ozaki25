# コールスタック — 関数の呼び出し履歴が積み上がって溢れる仕組み

## 今日のゴール

- コールスタックが「呼び出し元に戻るための記録の積み重ね」だと知る
- 「Maximum call stack size exceeded」が記録の積みすぎで起きると知る
- 再帰関数を見たら終了条件を確認する視点を持つ

## Maximum call stack size exceeded というエラー

Web アプリを触っていて、画面が固まったあとにこんな赤い文字が出た経験があるかもしれません。

```
RangeError: Maximum call stack size exceeded
```

| ブラウザ | エラーの文言 |
|---------|------------|
| Chrome / Safari | `Maximum call stack size exceeded`（コールスタックの最大サイズを超えました） |
| Firefox | `InternalError: too much recursion`（再帰が多すぎる） |

エラー文に出てくる **コールスタック（call stack）** が何かを知ると、このエラーの意味がそのまま読めるようになります。JavaScript が関数を動かす、いちばん土台の仕組みの話です。

## 関数が呼ばれるたびに積まれる記録

```js
function makeGreeting(name) {
  return `こんにちは、${name}さん`;
}

function greet(name) {
  const message = makeGreeting(name); // ここで makeGreeting を呼ぶ
  console.log(message);               // makeGreeting から戻ってきたら実行する
}

greet("田中");
```

`greet` の実行中に `makeGreeting` が呼ばれます。このとき JavaScript は、「`makeGreeting` が終わったら `greet` のこの行に戻って続きを実行する」という戻り先を覚えておく必要があります。

この戻り先の記録を、JavaScript は積み重ねて管理します。

- 関数が呼ばれると、記録を 1 つ上に積む（**プッシュ**）
- 関数が `return` などで終わると、一番上の記録を取り除いて戻り先の続きへ進む（**ポップ**）

> **コールスタック**（call stack）: この積み重ね全体のこと

- スタック（stack）は「積み重ね」という意味
- 最後に積んだものを最初に取り出す構造を **LIFO**（Last In First Out）と呼ぶ
- 重ねた皿の山と同じで、出し入れできるのは常に一番上だけ

```mermaid
flowchart LR
  subgraph P1["greet を呼ぶ"]
    direction TB
    a1["greet"]
  end
  subgraph P2["makeGreeting を呼ぶ"]
    direction TB
    b2["makeGreeting"] --- b1["greet"]
  end
  subgraph P3["return で戻る"]
    direction TB
    c1["greet"]
  end
  P1 --> P2 --> P3
```

呼び出しが深くなるほど記録は高く積み上がり、関数が戻るたびに 1 段ずつ低くなります。プログラムが順調に動いている間、コールスタックは積んでは崩しを繰り返しています。

## 終了条件のない再帰で起きるスタックの溢れ

自分自身を呼ぶ関数を **再帰関数** と呼びます。配列の合計を再帰で書いてみます。

```js
// 終了条件を書き忘れた再帰
function sum(numbers) {
  const [first, ...rest] = numbers;
  return first + sum(rest); // rest が空になっても、さらに sum を呼んでしまう
}

sum([1, 2, 3]);
// RangeError: Maximum call stack size exceeded
```

呼び出しを追うと、止まらなくなる様子が見えます。

1. `sum([1, 2, 3])` は中で `sum([2, 3])` を呼ぶ
2. それが `sum([3])` を呼び、さらに `sum([])` を呼ぶ
3. 本来はここで止まるべきだが、この `sum` は空配列を渡されてもまた `sum([])` を呼ぶ
4. 呼び出しがいつまでも終わらないので、戻り先の記録は積まれる一方で、1 つもポップされない

コールスタックの置き場所には上限があります。積まれた記録が上限に達した瞬間、JavaScript は「Maximum call stack size exceeded」を投げて処理を止めます。

> **スタックオーバーフロー**（スタックの溢れ）: 積まれた記録がコールスタックの上限に達すること。止まらない処理がメモリを食い尽くす前に、安全装置が働いたと読める

```mermaid
flowchart LR
  subgraph R1["1 回目"]
    direction TB
    r1["sum"]
  end
  subgraph R2["2 回目"]
    direction TB
    r2b["sum"] --- r2a["sum"]
  end
  subgraph R3["3 回目"]
    direction TB
    r3c["sum"] --- r3b["sum"] --- r3a["sum"]
  end
  subgraph R4["やがて上限に"]
    direction TB
    r4["RangeError"]
  end
  R1 --> R2 --> R3 --> R4
  style r4 fill:#fee2e2,color:#1e293b,stroke:#ef4444
```

直し方は、これ以上は自分を呼ばない条件、つまり **終了条件** を最初に書くことです。

```js
// 終了条件のある再帰
function sum(numbers) {
  if (numbers.length === 0) return 0; // 終了条件: 空になったら止まる
  const [first, ...rest] = numbers;
  return first + sum(rest);
}

sum([1, 2, 3]); // 6
```

`sum([])` に到達した瞬間に `return 0` で戻り始め、積まれていた記録が上から順にポップされて、最後に 6 が返ります。

再帰関数を読むときに見るのは 2 点です。

- 終了条件があるか
- 必ずそこに到達するか

この 2 点は、人が書いた再帰でも AI が書いた再帰でも同じように確かめられます。AI に書かせるときに「終了条件を必ず入れて」と一言添えるのも有効です。

## スタックトレースとのつながり

エラー画面で `at ...` が何十行も並ぶ一覧を **スタックトレース** と呼びます。あれはエラーが起きた瞬間のコールスタックの中身を、上から順にそのまま印刷したものです。

```
RangeError: Maximum call stack size exceeded
    at sum (cart.js:3:18)
    at sum (cart.js:3:18)
    at sum (cart.js:3:18)
    at sum (cart.js:3:18)
    ...
```

- **一番上**: エラーが起きたまさにその場所（最後にプッシュされた記録）
- **下に行くほど**: 呼び出し元に遡り、一番下が最初の呼び出し
- **上が最新、下が起点という並び**: コールスタックの積み重ねをそのまま映しているから

そして上の例のように **同じ関数名がずらりと並んでいたら**、再帰が止まらなくなっているサインです。犯人の関数名まで書いてあるので、このエラーは原因特定が比較的やさしい部類に入ります。

## ループでなく再帰を使う場面

合計を求めるだけなら `for` ループでも書けますし、ループなら溢れる心配もありません。それでも再帰が使われるのは、**ネストした（入れ子の）データを辿る処理** と相性がいいからです。

- フォルダの中にフォルダがあるディレクトリ構造
- カテゴリの下にサブカテゴリが続くメニュー
- コンポーネントの中にコンポーネントがある画面

深さが何段あるか事前に分からない構造は、「自分と同じ処理を一段深いところにも適用する」という再帰の形で書くと素直に収まります。

React も同じです。

- React の公式ドキュメントは、コンポーネントの描画を再帰的な処理だと説明している
- JSX で `<Layout><Page /></Layout>` のようにいくらでもネストできるのは、React がコンポーネントの木を再帰的に辿って描画しているから

## まとめ

- コールスタックは戻り先の記録の積み重ねで、呼び出しで積み、終了で取り除く（LIFO）
- 終了条件のない再帰は記録が積まれる一方になり、上限に達すると Maximum call stack size exceeded が出る
- スタックトレースはコールスタックの写しで、同じ関数名の連続は再帰の暴走のサイン
