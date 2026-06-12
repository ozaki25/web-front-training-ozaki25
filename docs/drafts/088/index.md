# useRef — 宣言的 UI の「非常口」

## 今日のゴール

- useRef の 2 つの用途（DOM への参照・再レンダリングしないメモ）を知る
- state と ref の使い分けの基準を知る
- 「ref は非常口。乱用は設計の黄信号」という感覚を持つ

## 宣言的 UI で書けない操作がある

React の基本は「状態を書き換えれば、画面は React が更新してくれる」という宣言的なスタイルです。DOM を直接操作するコード（`document.querySelector` など）は、原則書きません。

ところが、**宣言的に書けない操作**が一部だけ存在します。

- 入力欄に**フォーカスを当てる**
- 特定の位置まで**スクロールする**
- 動画を**再生・停止する**

これらは「状態」ではなく「**その瞬間に 1 回だけ実行する命令**」です。「フォーカスが当たっている状態」を宣言し続けるのは不自然で、「今、当てろ」と言うしかない。こうした命令のために、React は公式の非常口を用意しています。それが **useRef** です。

## 用途 1 — DOM 要素への参照

`useRef` で作った入れ物を JSX の `ref` 属性に渡すと、**描画後にその DOM 要素が入れ物に入ります**。

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

`inputRef.current` に本物の DOM 要素（`<input>`）が入っていて、`focus()` のようなブラウザの命令を直接呼べます。**React の管理する世界から、一瞬だけ DOM の世界に手を伸ばす窓**です。

モーダルを開いたときに最初の入力欄にフォーカスを移す、エラーが出た項目までスクロールする。アクセシビリティのためのフォーカス管理は、この用途の代表例です。

## 用途 2 — 再レンダリングを起こさないメモ

`useRef` にはもう 1 つの顔があります。**値を保持するが、変えても再レンダリングが起きない**入れ物としての使い方です。

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

`timerId` は「stop のときに使いたいから覚えておきたい」だけの値です。画面には一切表示されません。これを `useState` に入れると、**画面に関係ない値の変更で再レンダリングが走る**無駄が生まれます。ref なら、覚えておけるが再レンダリングは起きない。

| | useState | useRef |
|---|---------|--------|
| 変えると再レンダリング | **する** | しない |
| 画面に表示する値 | こちら | 不向き（変えても画面が変わらない） |
| 向いている値 | 表示・条件分岐に使う値 | タイマー ID、前回値、DOM 参照 |

使い分けの基準は 1 つだけです。**その値は画面に影響するか？** 影響するなら state、しないなら ref。

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

ref の変更は再レンダリングを起こさないので、**画面と値がズレたまま**になります。表示したい値は state に。ref を読み書きしてよいのは、イベントハンドラと useEffect の中です。

### DOM 直接操作で「表示」を変えない

```tsx
// ❌ React の知らないところで画面を書き換えている
inputRef.current!.value = "リセット";
```

React は自分が描いた画面の状態を把握して差分更新しています。ref 経由で**表示内容**を直接書き換えると、React の認識と実際の画面がズレて、次の再レンダリングで上書きされたり、入力値が迷子になったりします。値の変更は state で宣言的に。ref で呼んでいいのは `focus()` や `scrollIntoView()` のような、**React が管理していない命令**だけです。

## AI のコードを見るポイント

AI は ref を正しく使うことが多いですが、たまに「state で書けるものを ref で書く」「その逆」が混ざります。見るポイントは 2 つです。

1. **ref の値が JSX に表示されていないか**: 表示されているなら state にすべき値
2. **DOM 操作で表示を変えていないか**: `.value =` や `.innerHTML =` を見たら、state での書き直しを指示する

そして設計の感覚として、**ref だらけのコンポーネントは黄信号**です。宣言的に書けるものまで命令で書いている可能性が高く、「これは state で表現できない？」という問いがリファクタリングの入口になります。非常口は、非常時だけ使うから安全なのです。

## まとめ

- useRef の用途は 2 つ: DOM への窓と、再レンダリングしないメモ
- 使い分けは「画面に影響するか」。影響するなら state、しないなら ref
- レンダリング中の読み書きと、DOM 直接操作での表示変更は禁じ手
- ref だらけは設計の黄信号。非常口は非常時だけ
