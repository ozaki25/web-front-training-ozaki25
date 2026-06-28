# フォーカス管理 — マウスを使わずに、あなたのアプリは操作できるか

## 今日のゴール

- フォーカスが「キー入力の現在地」だと知る
- outline を消してはいけない理由と :focus-visible を知る
- モーダルを開いたときのフォーカスの作法を知る

## Tab キーだけで使ってみる

マウスやタッチを使わずに Web を操作している人は、想像より多くいます。

- 運動機能の制約でポインタ操作が難しい人
- スクリーンリーダーのユーザー（操作は基本的にキーボード）
- 一時的に片手がふさがっている人、キーボード操作を好むパワーユーザー

キーボード操作の基本は **Tab で次へ、Shift + Tab で前へ、Enter / Space で実行**。試しに自分のアプリを Tab だけで触ると、たいてい何かが起きます。「いまどこにいるか分からない」「目的のボタンに着けない」「モーダルの外に出てしまう」。今日はこの 3 つを順に潰します。

## フォーカス — キー入力の現在地

**フォーカス**とは、「いまキーボードの入力を受け取る要素」のことです。画面に 1 つだけ存在する、キー入力の現在地です。

`<button>`、`<a href>`、`<input>` などの操作できる要素は、**生まれつきフォーカス可能**です。Tab を押すと、フォーカスはこれらの要素を **DOM の順番**（HTML に書かれた順）で移動します。

ここでも `div` ボタンの問題が顔を出します。`<div onClick={...}>` はフォーカス可能ではないので、**Tab でたどり着く方法がそもそも無い**。キーボードの世界では、その機能は存在しないのと同じです。

### 触って確かめる

下の枠内の最初のボタンをクリックしてから、**Tab キー**を押して進んでみてください（戻るは Shift + Tab）。

<div class="c44-demo">
  <button type="button" class="c44-item">1. ボタン</button>
  <a href="#c44-skip" class="c44-item c44-link">2. リンク</a>
  <input type="text" class="c44-item" aria-label="3. 入力欄" placeholder="3. 入力欄" />
  <div class="c44-item c44-fake" onclick="this.textContent='押せたけど、Tab では来られない…'">div 製ボタン</div>
  <button type="button" class="c44-item" id="c44-skip">4. ボタン</button>
  <p class="c44-note">フォーカスリング（青い枠）が 1 → 2 → 3 → 4 と移動し、<strong>div 製ボタンは飛ばされます</strong>。マウスでは押せるのに、キーボードでは存在しない部品です。</p>
</div>

## 「いまどこ？」を消さない — outline の話

フォーカスの現在地は、要素を囲む光る枠（**フォーカスリング**）で表示されます。ブラウザ標準では `outline` という CSS で描かれています。

そして Web 界の悪しき伝統が、これです。

```css
/* ❌ 見た目がうるさいから、という理由で広く行われてきた */
button:focus {
  outline: none;
}
```

リングを消すと、キーボードユーザーは**自分の現在地を見失います**。画面のどこかにフォーカスはあるのに、それがどこか分からない。マウスのカーソルが透明になった状態を想像してください。

「マウスクリックでもリングが出るのが嫌だ」が消したくなる動機でしたが、現在は CSS 側に解決があります。

```css
/* ✅ キーボード操作のときだけリングを出す */
button:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
```

`:focus-visible` は「**キーボード操作などでフォーカスが当たったときだけ**」効く擬似クラスです。マウスクリックではリングを出さず、Tab 移動では出す。「うるさい」と「迷子」を両立で解決できます。AI の書いた CSS に `outline: none` があったら、`:focus-visible` への置き換えを指示してください。

## 順番の制御 — tabindex の 3 つの値

Tab の巡回順や対象は、`tabindex` 属性で調整できます。値は実質 3 種類です。

| 値 | 意味 | 使いどころ |
|----|------|-----------|
| `tabindex="0"` | フォーカス可能にする（順番は DOM 順のまま） | フォーカス不能な要素をどうしても対象にしたいとき |
| `tabindex="-1"` | Tab の巡回からは外すが、JavaScript からはフォーカスを移せる | 「移動先」として使う（後述のモーダルなど） |
| `tabindex="1"` 以上 | 巡回の順番を強制的に変える | **使わない（禁じ手）** |

正の値は「DOM 順より優先」という強い効果で、ページ全体の巡回順を狂わせます。順番を変えたいなら、`tabindex` ではなく **HTML の順番のほうを直す**のが正解です。

## モーダルの作法 — 開いたら中へ、閉じたら元へ

フォーカス管理がいちばん問われるのがモーダル（ダイアログ）です。やるべきことは 3 つあります。

1. **開いたら、フォーカスをモーダルの中へ移す**（移さないと、ユーザーの現在地は開いた後も背景に残ったまま）
2. **Tab がモーダルの外に出ないようにする**（フォーカストラップ。背景は操作できないのに現在地だけ出ていくのを防ぐ）
3. **閉じたら、開く前にいた場所（開いたボタン）へ戻す**（ユーザーを置き去りにしない）

幸い、HTML 標準の `<dialog>` 要素を `showModal()` で開けば、**1 と 2 は自動で面倒を見てくれます**。

```tsx
"use client";

import { useRef } from "react";

export function DeleteConfirm() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button onClick={() => dialogRef.current?.showModal()}>削除する</button>
      <dialog ref={dialogRef} aria-labelledby="delete-title">
        <h2 id="delete-title">本当に削除しますか？</h2>
        <button onClick={() => dialogRef.current?.close()}>キャンセル</button>
      </dialog>
    </>
  );
}
```

AI が `div` を重ねた自作モーダルを生成してきたら、3 つの作法が実装されているかを見るより先に、「**`<dialog>` で作り直せない？**」と聞くのが近道です。ネイティブの HTML 要素を使えば、必要な振る舞いがタダで付いてくるからです。

## SPA 特有の置き去り問題

もう 1 つ、SPA ならではの罠があります。ページ「遷移」しても実際は画面の書き換えなので、**フォーカスが消えた要素の上に取り残されたり、ページ先頭に戻らなかったり**します。読み上げ環境では「ページが変わったのに何も起きていない」ように感じられる原因になります。

Next.js はこのあたりをフレームワーク側でかなり面倒見てくれますが、「SPA の遷移ではフォーカスの行き先も誰かが決めている」と知っておくと、挙動がおかしいときに原因へたどり着けます。

## まとめ

- フォーカスはキー入力の現在地。Tab で DOM 順に巡回する
- `outline: none` は現在地の喪失。消すなら `:focus-visible` で出し分ける
- `tabindex` は 0 と -1 だけ使う。正の値は禁じ手
- モーダルは「開いたら中へ・外に出さない・閉じたら元へ」。`<dialog>` なら大半が自動

<style>
.c44-demo {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px;
  margin: 1.2em 0;
  background: #f8fafc;
  color: #1e293b;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}
.c44-item {
  padding: 8px 14px;
  font-size: 14px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
  color: #1e293b;
}
.c44-demo button.c44-item { cursor: pointer; }
.c44-demo button.c44-item:hover { background: #f1f5f9; }
.c44-link { text-decoration: underline; color: #1d4ed8; }
.c44-fake {
  background: #fef3c7;
  border-color: #f59e0b;
  cursor: pointer;
  user-select: none;
}
.c44-demo .c44-item:focus-visible {
  outline: 3px solid #2563eb;
  outline-offset: 2px;
}
.c44-note {
  flex-basis: 100%;
  font-size: 13px;
  color: #475569;
  margin: 6px 0 0;
}
</style>
