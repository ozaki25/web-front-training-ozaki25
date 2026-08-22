# useRef — 宣言的 UI の非常口

## 今日のゴール

- useRef の 2 つの用途（DOM への参照・再レンダリングしないメモ）を知る
- state と ref の使い分けの基準を知る
- ref は非常口で、乱用は設計の黄信号という感覚を持つ

## 宣言的 UI で書けない操作がある

React の基本は「状態を書き換えれば、画面は React が更新してくれる」という宣言的なスタイルです。DOM を直接操作するコード（`document.querySelector` など）は、原則書きません。

ところが、**宣言的に書けない操作**が一部だけ存在します。

- 入力欄に**フォーカスを当てる**
- 特定の位置まで**スクロールする**
- 動画を**再生・停止する**

これらは「状態」ではなく、「**その瞬間に 1 回だけ実行する命令**」です。「フォーカスが当たっている状態」を宣言し続けるのは不自然で、「今、当てて」と命令するしかありません。

こうした命令のために React が用意している公式の非常口が **useRef** です。React の公式ドキュメントも、ref を「避難ハッチ（escape hatch）」、つまり宣言的なスタイルの外に出るための仕組みとして説明しています。

## DOM 要素への参照

`useRef` で作った入れ物を JSX の `ref` 属性に渡すと、**描画後にその DOM 要素が入れ物に入ります**。入れ物といっても特別なものではなく、`useRef(null)` が返すのは `{ current: null }` という形のただのオブジェクトです。

```tsx
"use client";

import { useRef } from "react";

export function SearchBox() {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <input ref={inputRef} aria-label="検索キーワード" />
      <button
        onClick={() => {
          inputRef.current?.focus(); // DOM の input に直接フォーカス命令
        }}
      >
        検索欄へ移動
      </button>
    </div>
  );
}
```

`inputRef.current` に本物の DOM 要素（`<input>`）が入っていて、`focus()` のようなブラウザの命令を直接呼べます。**React を経由せずに DOM を直接操作するための窓口**です。

モーダルを開いたときに最初の入力欄へフォーカスを移す、エラーが出た項目までスクロールするといった、アクセシビリティのためのフォーカス管理がこの用途の代表例です。

## 再レンダリングを起こさないメモ

`useRef` にはもう 1 つの用途があります。**値を保持するが、変えても再レンダリングが起きない**入れ物としての使い方です。

```tsx
"use client";

import { useRef, useState } from "react";

export function Stopwatch() {
  const [seconds, setSeconds] = useState(0);
  const timerId = useRef<number | null>(null); // タイマーの ID を保持したい

  const start = () => {
    if (timerId.current !== null) return; // 二重起動を防ぐ
    timerId.current = window.setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stop = () => {
    if (timerId.current !== null) {
      clearInterval(timerId.current);
      timerId.current = null;
    }
  };

  return (
    <div>
      <p>{seconds} 秒</p>
      <button onClick={start}>開始</button>
      <button onClick={stop}>停止</button>
    </div>
  );
}
```

`timerId` は「stop のときに使いたいから覚えておきたい」だけの値で、画面には一切表示されません。これを `useState` に入れると、**画面に関係ない値の変更で再レンダリングが走る**無駄が生まれます。

ふつうの変数（`let`）で覚えておけないのは、再レンダリングのたびにコンポーネントの関数が丸ごと実行し直され、中の変数も作り直されるからです。ref のオブジェクトは React が関数の外で保持していて、再レンダリングされても毎回同じものが返ってきます。

再レンダリングが起きない理由も単純です。state の更新関数は React に「画面を更新して」と伝えますが、`timerId.current = ...` はただのオブジェクトへの代入なので、React はそれが変わったことを知りようがありません。

| | ふつうの変数 | useState | useRef |
|---|------------|---------|--------|
| 再レンダリング後も値が残る | 残らない | 残る | 残る |
| 変えると再レンダリング | しない | **する** | しない |
| 向いている値 | その描画の中だけの計算 | 表示・条件分岐に使う値 | タイマー ID、前回値、DOM 参照 |

使い分けの基準は「**その値は画面に影響するか**」の 1 つだけです。影響するなら state、しないなら ref を使います。

## やってはいけない使い方

ref は強力なぶん、誤用すると React の前提を壊します。

### レンダリング中に読み書きしない

```tsx
function Counter() {
  const count = useRef(0);
  count.current++; // ❌ レンダリング中に書き換え
  return <p>{count.current} 回描画</p>; // ❌ 表示にも使っている
}
```

ref の変更は再レンダリングを起こさないので、**画面と値がズレたまま**になります。表示したい値は state に入れ、ref の読み書きはイベントハンドラや useEffect（描画後に実行される処理）の中で行います。

### DOM 直接操作で「表示」を変えない

```tsx
// ❌ React の知らないところで画面を書き換えている
if (inputRef.current) {
  inputRef.current.value = "リセット";
}
```

React は自分が描いた画面の状態を把握して、差分だけを更新しています。ref 経由で**表示内容**を直接書き換えると React の認識と実際の画面がズレて、次の再レンダリングで上書きされたり、入力値が迷子になったりします。

値の変更は state で宣言的に書きます。ref 経由で呼んでいいのは `focus()` や `scrollIntoView()` のような、**React が管理していない命令**だけです。

## ref だらけのコンポーネントは黄信号

useRef 自体は公式の道具ですが、ref が並んだコンポーネントは、宣言的に書けるものまで命令で書いているサインです。「この値は画面に影響するか」「state で表現できないか」という問いが、リファクタリングの入口になります。

コードに `.value =` や `.innerHTML =` での表示の書き換えを見つけたら、「表示の変更は state で書き直して」と AI に指示できます。

## まとめ

- useRef の用途は DOM への参照と、再レンダリングしないメモの 2 つ
- 使い分けは「画面に影響するか」で、影響するなら state、しないなら ref
- レンダリング中の読み書きと、DOM 直接操作での表示変更は禁じ手
- ref だらけは設計の黄信号で、非常口は非常時だけ
