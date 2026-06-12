# カスタムフック — use で始まる関数の正体

## 今日のゴール

- カスタムフックが「hook を中で使う、ただの関数」だと知る
- 共有されるのはロジックで、state は呼び出しごとに独立だと知る
- 「use 始まり」「トップレベルで呼ぶ」のルールの理由を知る

## AI のコードに出てくる、見慣れない use〜

React の標準の hook は `useState` や `useEffect` など限られた数しかありません。ところが AI の書くコードには、見慣れない use〜 が登場します。

```tsx
function SearchPage() {
  const windowSize = useWindowSize();      // 標準には無い
  const debouncedQuery = useDebounce(query, 300); // これも無い
  ...
}
```

これらは**カスタムフック**。ライブラリ由来のこともありますが、多くはそのプロジェクト内で**自作された関数**です。「フック」という名前から特別な仕組みに見えますが、正体は驚くほど普通です。

## 正体は「hook を中で使う、ただの関数」

ウィンドウの幅を表示するコンポーネントを考えます。素直に書くと、state と購読のロジックがコンポーネントに直接書かれます。

```tsx
import { useEffect, useState } from "react";

function Header() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    onResize(); // まず現在の幅を反映
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return <p>幅: {width}px</p>;
}
```

このロジックを別の画面でも使いたくなったとき、コピペする代わりに**関数として切り出します**。

```tsx
// use-window-width.ts
import { useEffect, useState } from "react";

export function useWindowWidth() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return width;
}
```

```tsx
// 使う側は 1 行になる
import { useWindowWidth } from "./use-window-width";

function Header() {
  const width = useWindowWidth();
  return <p>幅: {width}px</p>;
}
```

やったことは「コードを関数に切り出す」だけです。`export function useWindowWidth()` に特別な宣言は何もありません。**中で `useState` や `useEffect` を使う関数を、use 始まりの名前で作る。それがカスタムフックのすべて**です。

切り出した結果、2 つの良いことが起きています。

- **使う側が読みやすい**: 「ウィンドウ幅を使う」という意図だけが残り、購読や後片付けの詳細が消える
- **再利用できる**: どのコンポーネントからも 1 行で使える

## 重要な性質 — state は呼び出しごとに独立

カスタムフックで共有されるのは**ロジック（手順）であって、state（値）ではありません**。

```tsx
function PageA() {
  const width = useWindowWidth(); // PageA 専用の state
}

function PageB() {
  const width = useWindowWidth(); // PageB 専用の、別の state
}
```

`useWindowWidth` を 2 か所で呼ぶと、中の `useState` も 2 セット作られます。それぞれの呼び出しが独立した state を持ち、互いに影響しません。

「カスタムフックにすれば state を共有できる」は典型的な誤解です（AI も時々この誤解を前提にしたコードを書きます）。コンポーネントをまたいで**同じ値**を共有したいなら、それは Context やストアの仕事です。カスタムフックが配るのは「同じ作り方」であって「同じ値」ではありません。

## 2 つのルールの理由

カスタムフックには守るべきルールが 2 つあります。どちらも「決まりだから」ではなく、仕組み上の理由があります。

### ルール 1: 名前は use で始める

React 本体は関数名を見ていませんが、開発ツール（ESLint の React プラグイン）が **「use 始まりの関数 = hook」とみなしてルール違反を検査**します。use 始まりにしておくことで、「if の中で hook を呼んでいる」のような間違いを自動検出してもらえます。名前は人間とツールへの目印です。

### ルール 2: トップレベルで呼ぶ

hook は、if 文やループの中で呼んではいけません。

```tsx
function Profile({ isAdmin }: { isAdmin: boolean }) {
  if (isAdmin) {
    const [log, setLog] = useState<string[]>([]); // ❌ 条件の中で hook
  }
  ...
}
```

理由は React の内部構造にあります。React は各コンポーネントの hook を**呼ばれた順番**で管理しています。「1 番目の useState はこの state、2 番目はこれ」という具合です。条件分岐で呼ばれたり呼ばれなかったりすると、**再レンダリングで順番がズレて、別の hook の state を取り違えます**。毎回同じ順番で全部呼ばれることが、仕組みの前提なのです。

カスタムフックも中で hook を呼ぶので、同じルールに従います。

## どこまで切り出すか

何でもカスタムフックにすればよいわけではありません。切り出す価値があるのは、次のどちらかです。

- **複数の場所で使う**ロジック（重複の解消）
- 1 か所でも、**コンポーネントの見通しを悪くしている**まとまったロジック（フォームの検証一式など）

逆に、`useState` 1 つを包んだだけのカスタムフックは、間接層が増えるだけで益がありません。AI が見せかけの整理のために薄いカスタムフックを量産してきたら、「これは切り出す価値があるか」で間引く目を持ってください。

## まとめ

- カスタムフック = hook を中で使う、use 始まりのただの関数
- 共有されるのはロジック。state は呼び出しごとに独立（値の共有は Context やストアの仕事）
- use 始まりはツールの検査のため。トップレベル縛りは「呼ばれる順番」で管理されているため
- 切り出す基準は「複数で使う」か「見通しが悪い」か
