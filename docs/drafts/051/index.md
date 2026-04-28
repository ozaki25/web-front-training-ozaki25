# なぜスタイルが効かない？ — カスケード・詳細度・継承・@layer

## 今日のゴール

- ブラウザがどの CSS 宣言を採用するかは **カスケード** というルールで決まっていることを知る
- **詳細度（specificity）** の数え方と、`!important` を避けたい理由を説明できるようになる
- `@layer`（CSS Cascade Layers）や DevTools で「どこから来たスタイルか」を追えるようになる

## 「なんで赤くならないの？」はみんな通る道

AI に作ってもらった画面を開くと、ボタンの色が想定と違う。慌てて CSS を書く。

```css
.btn {
  color: red;
}
```

なのに赤くならない。仕方なく `!important` を付ける。それでも効かない箇所が出てきて、コードベース全体が `!important` だらけになる── 初心者が CSS で最初にぶつかる壁です。

これは「CSS が壊れている」わけではありません。ブラウザは **同じ要素に対して複数ある宣言のうち、どれを勝たせるか** をきちんとルールで決めています。そのルールが **カスケード（cascade、滝のように上から流れてくる意味）** です。カスケードを知らないまま `!important` を重ねるのは、交通ルールを知らずにクラクションだけ鳴らし続けているのと同じ。ルールを知れば、静かに勝てます。

## 柱1: カスケードの流れ — 何がどの順で比較されるか

ブラウザが「このボタンの `color` は何色？」を決めるとき、競合する宣言を次の順で比較します。上から順にふるいにかけ、**勝負がつかなければ下の基準に進む** という流れです。

```mermaid
flowchart TD
  A[候補の宣言を全部集める] --> B[1.発生源+important<br/>ブラウザ標準/ユーザー/作者]
  B --> C[2.カスケードレイヤー<br/>@layer の順序]
  C --> D[3.詳細度<br/>インライン/ID/クラス/要素]
  D --> E[4.ソース順<br/>あとに書いたほうが勝つ]
  E --> F[採用される1つの宣言]
```

**発生源（origin）** は「誰が書いた CSS か」です。ブラウザ標準のスタイル（User Agent）、ユーザー設定、サイト作者の CSS、の 3 つがあり、通常は作者 CSS が一番強い。ただし `!important` が付くとこの順序が **逆転** し、ユーザーの `!important` が最強になります。アクセシビリティのために、読み手が作者より強いスタイルを当てられる設計になっているわけです。

**カスケードレイヤー** は後述の `@layer` で意図的に作る優先度のグループです。

**詳細度** は次の柱で詳しく見ます。

**ソース順** は、ここまで全部同点だったときの最終決着。あとに書いたほうが勝ちます。「同じセレクタを 2 回書いて、後ろの宣言が反映される」のはこの仕組みです。

困ったら DevTools の Elements パネル → **Styles タブ**。打ち消し線が引かれた宣言は「負けた宣言」、残っている宣言が「勝った宣言」です。さらに **Computed タブ** を開けば、最終的に採用された値と、その出所のファイル・行番号が出てきます。「なぜこの色？」の答えはほぼここで見つかります。

## 柱2: 詳細度 — セレクタに点数がつく

詳細度は **セレクタの具体性** を表す点数で、4 つのスロット `(a, b, c, d)` で数えます。大きいほうが勝ち、上位スロットが違えば下位は見ません（`(1, 0, 0, 0)` は `(0, 99, 99, 99)` に勝つ）。

| スロット | 何を数えるか | 例 |
|---|---|---|
| a | インラインスタイル（`style="..."`） | `<p style="color:red">` |
| b | ID セレクタ | `#main` |
| c | クラス・属性・擬似クラス | `.btn`, `[type="text"]`, `:hover` |
| d | 要素・擬似要素 | `p`, `::before` |

例を並べてみます。

```css
p              { color: gray;  } /* (0,0,0,1) */
.note          { color: blue;  } /* (0,0,1,0) */
article p      { color: green; } /* (0,0,0,2) */
.content .note { color: orange;} /* (0,0,2,0) */
#sidebar .note { color: purple;} /* (0,1,1,0)  ← 最強 */
```

`<p class="note">` が `<aside id="sidebar" class="content">` の中にあれば、紫になります。ID が 1 つ入るだけで他を圧倒することがわかります。これが「ID セレクタを安易に使うな」と言われる理由です。一度使うと、後から上書きするために `#sidebar .note` と書くか `!important` を使うしかなくなる。

### `:is()` と `:where()` の違い

最近の CSS でよく出てくる `:is()` と `:where()` は、詳細度の扱いが違います。

```css
:is(h1, h2, h3) .title { /* 詳細度は引数の最大値を採用: (0,0,1,1) */ }
:where(h1, h2, h3) .title { /* 詳細度は必ず 0: (0,0,1,0) */ }
```

`:where()` は **詳細度を 0 にする** 特殊な括弧です。共通スタイルをまとめたいけれど、後から個別に上書きしやすくしたい、という時に重宝します。CSS ライブラリが `:where()` を多用しているのはこのためです。

## 柱3: 継承と `!important` ── 最後の手段をどう避けるか

### 継承（inheritance）

`color`、`font-family`、`line-height` のような文字系プロパティは、親要素の値が子へ **継承** されます。だから `body { color: #1e293b }` と書くだけでページ全体の文字色が決まる。一方 `margin`、`padding`、`border` などのボックス系は継承されません（されたら、全要素が親の枠をまとって大混乱するため）。

継承されたスタイルは詳細度比較の対象になりません。**直接その要素に当たった宣言があれば、継承値は負けます**。「親で `color:black` と決めたのに子のボタンが青い」のは、子側に何かしら直接ヒットするルール（ブラウザの User Agent CSS を含む）があるから。これも DevTools の Computed タブで「Inherited from …」として追えます。

### `!important` はなぜ最後の手段か

`!important` は付いたほうが勝ちます。ただし、誰かが `!important` を付けると、それを上書きするために **別の誰かも `!important` を付ける** 必要が出る。気づけば `!important` 同士の上書き合戦が始まり、コードベースは修羅場になります。

ではいつ使っていいのか。目安は「本当に例外的な 1 行」「自分より下の CSS（サードパーティなど）を上書きせざるを得ない時」「ユーザースタイル（アクセシビリティ設定）」の 3 つだけ。普段の開発では、まず **詳細度を下げる方向** を考えます。

### `@layer` でカスケードを設計する

2022 年から全主要ブラウザで使える **CSS Cascade Layers（`@layer`）** は、詳細度の戦争から抜け出す切り札です。レイヤーを宣言した順に優先度が決まり、**後のレイヤーが前のレイヤーに勝ちます**。レイヤー内の詳細度は、他レイヤーの詳細度より常に弱い。

```css
/* レイヤーを宣言（この順で優先度が低→高） */
@layer reset, base, components, utilities;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
}

@layer base {
  /* ID を使っても、components より弱い */
  #main { color: gray; }
}

@layer components {
  .btn { color: white; background: #2563eb; }
}

@layer utilities {
  /* 詳細度が低くても、components に勝つ */
  .text-red { color: red; }
}
```

`#main` という ID セレクタ（詳細度高め）を書いても、**後ろのレイヤーに属する `.text-red`（詳細度低め）が勝ちます**。レイヤーの順序が詳細度より先に評価されるからです。「順番に意味を持たせられる」のが `@layer` の価値。

配属先でよく使う **Tailwind CSS v4** も、内部で `@layer theme, base, components, utilities` の構造を使っています。自分のカスタム CSS を `@layer components` に置けば、Tailwind のユーティリティで自然に上書きできる、という設計になっています。v3 までの「カスタム CSS のほうが強すぎて Tailwind が効かない」という悩みは、これで解消方向に動きました。

## インタラクティブデモ — どれが勝つ？

同じ段落に 3 つの宣言を当てています。ブラウザで開くと、勝ったルールの色が反映されます。

<div style="border:1px solid #cbd5e1;border-radius:8px;padding:16px;background:#f8fafc;color:#1e293b">
  <style>
    .demo-cascade .msg { color: blue; }              /* (0,0,1,0) */
    .demo-cascade article .msg { color: green; }     /* (0,0,1,1) */
    .demo-cascade #win .msg { color: crimson; }      /* (0,1,1,0) ← 勝者 */
  </style>
  <div class="demo-cascade">
    <article id="win">
      <p class="msg" aria-label="カスケード勝者のサンプル文">このテキストは何色に見える？</p>
    </article>
  </div>
  <details style="margin-top:8px;background:white;color:#1e293b;padding:8px;border-radius:4px">
    <summary style="cursor:pointer">答えを見る</summary>
    <p style="margin:8px 0 0;color:#475569">
      正解: <strong style="color:crimson">crimson（赤）</strong>。
      <code>#win .msg</code> が詳細度 (0,1,1,0) で他を圧倒するため。
      ID を 1 つ入れるだけで、クラスをいくら重ねても勝てなくなります。
    </p>
  </details>
</div>

DevTools で要素を選択 → Styles タブを開くと、負けたルールに打ち消し線が引かれているのが見えます。自分の目で「ブラウザが選んだ理由」を確認するのが、一番早い学習法です。

## インタラクティブデモ — `@layer` だと結果が変わる

先ほどと同じ HTML 構造に、**`@layer` を使ったスタイル** を当ててみます。ID セレクタ（本来最強）と、クラス 1 つだけのセレクタ（本来弱い）を、それぞれ別のレイヤーに置いています。

<div style="border:1px solid #cbd5e1;border-radius:8px;padding:16px;background:#f8fafc;color:#1e293b">
  <style>
    @layer base-demo, utilities-demo;
    @layer base-demo {
      /* ID セレクタ（詳細度 (0,1,1,0)）でも base レイヤーにいるので弱い */
      .demo-layer #win2 .msg { color: crimson; }
    }
    @layer utilities-demo {
      /* クラス 1 つ（詳細度 (0,0,1,0)）でも utilities レイヤーにいるので勝つ */
      .demo-layer .msg { color: teal; }
    }
  </style>
  <div class="demo-layer">
    <article id="win2">
      <p class="msg" aria-label="レイヤー優先のサンプル文">このテキストは何色に見える？</p>
    </article>
  </div>
  <details style="margin-top:8px;background:white;color:#1e293b;padding:8px;border-radius:4px">
    <summary style="cursor:pointer">答えを見る</summary>
    <p style="margin:8px 0 0;color:#475569">
      正解: <strong style="color:teal">teal（青緑）</strong>。
      詳細度では <code>#win2 .msg</code> (0,1,1,0) が勝つはずなのに、
      <code>utilities-demo</code> レイヤーが <code>base-demo</code> レイヤーより後に宣言されているため、
      レイヤー順序のほうが先に評価されて <code>.msg</code> (0,0,1,0) が勝ちます。
      <strong>レイヤーは詳細度の上位ルール</strong>、と覚えておくと混乱しません。
    </p>
  </details>
</div>

先ほどの「ID が勝つ」デモと、この「レイヤーが勝つ」デモを見比べると、カスケードの中で **レイヤーが詳細度より先に評価されている** ことが体感できます。

## まとめ

- CSS が効かないときの答えは **カスケード** にある。優先度は「発生源 → レイヤー → 詳細度 → ソース順」で決まる
- 詳細度は `(インライン, ID, クラス, 要素)` の 4 スロット。上位スロットが違えば下位は無視される。`:where()` は詳細度を 0 にできる
- `!important` は上書き合戦を呼ぶ最後の手段。詳細度を下げる・`@layer` でレイヤー分けする、が現代の定石
- 困ったら DevTools の Styles / Computed タブ。打ち消し線と「Inherited from …」で、スタイルの出所はすべて追える

「赤くならない」はブラウザの気まぐれではなく、カスケードという透明なルールの結果です。ルールの存在を知っているだけで、`!important` に手が伸びる前にもう一度考えられるようになります。
