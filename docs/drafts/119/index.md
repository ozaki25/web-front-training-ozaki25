# スタッキングコンテキスト — z-index を 9999 にしても前に出ない仕組み

## 今日のゴール

- z-index が同じスタッキングコンテキストの中でしか比較されないことを知る
- `transform` や `opacity` が副作用でスタッキングコンテキストを作ることを知る
- モーダルが隠れたら、数値ではなく区切りの場所を疑う直し方を知る

## 9999 にしても隠れたまま

前面に出したい要素には z-index を大きくする、と覚えている人は多いはずです。モーダルには `z-index: 9999`。ところが実際の画面では、その 9999 のモーダルが `z-index: 10` のヘッダーの**後ろに隠れる**ことが普通に起きます。99999 に増やしても変わりません。

z-index は「大きいほど前」という単純なルールではないからです。正確にはこうです。

> z-index の比較が行われるのは、**同じスタッキングコンテキストの中だけ**

この「スタッキングコンテキスト」という区切りを知らないまま数値だけ増やしても、モーダルは永遠に出てきません。

## z-index の基本

先に基本のおさらいです。z-index は要素の重なり順を指定するプロパティで、`position` が `static` 以外の要素と、flex・grid コンテナの直接の子に効きます。数値が大きいほど手前。ここまでは覚えているとおりです。

問題は「**誰と誰の間で**数値を比べるのか」。ここに条件があります。

## スタッキングコンテキストは重なり順を計算するグループ

**スタッキングコンテキスト**（stacking context）は、重なり順をまとめて計算するグループです。ある要素がスタッキングコンテキストを作ると、その子孫の z-index は**そのグループの中だけ**で比較されます。相撲でいえば、同じ土俵に立っている力士同士しか勝負できません。

グループの外の要素との勝負は、**グループを作った親同士の重なり順で決まります**。中の z-index がいくつでも、外には影響しません。

- 親 A がスタッキングコンテキストを作り、`z-index: 1`
  - 子 a に `z-index: 9999`
- 親 B がスタッキングコンテキストを作り、`z-index: 2`
  - 子 b に `z-index: 1`

子 a と子 b の重なりは、a の 9999 と b の 1 の比較では**なく**、親 A の 1 と親 B の 2 の比較で決まります。章番号にたとえると a は 1.9999、b は 2.1 で、先頭の桁で決着がつくので b が前です。

覚えておく一言はこれです。

> **子は、親のスタッキングコンテキストの外に出られない。** 親が負ければ、中で何番でも一緒に負ける

## スタッキングコンテキストができる代表的な条件

やっかいなのは、作った覚えがなくてもスタッキングコンテキストができていることです。代表的な条件を挙げます（これがすべてではありません）。

| 分類 | 条件 |
|------|------|
| 意図して作る | `static` 以外の `position` に `auto` 以外の `z-index` を組み合わせる |
| 意図して作る | `isolation: isolate` を指定する |
| 副作用でできる | `opacity` が 1 未満 |
| 副作用でできる | `transform`・`filter`・`perspective` が `none` 以外 |
| 副作用でできる | `will-change` にそれらのプロパティを指定 |
| 指定だけでできる | `position: fixed` または `position: sticky` |
| 指定だけでできる | flex・grid の子に `auto` 以外の `z-index` |

肝は「副作用でできる」の行です。`transform` はホバーで少し動かすため、`opacity` は半透明にするために付けます。その**見た目のための指定が、本人の知らないところで重なり順の区切りを作っている**のが、スタッキングコンテキスト事故の火種です。

## 親の transform に子が閉じ込められる

典型的な事故を見ます。カードの中にドロップダウンメニューがあり、ページには sticky なヘッダーがある構成です。

```html
<div class="card">
  <button type="button" aria-expanded="true">メニュー</button>
  <ul class="dropdown" role="menu">
    <li role="menuitem">編集</li>
    <li role="menuitem">削除</li>
  </ul>
</div>
<header class="site-header">サイトヘッダー</header>
```

```css
.card {
  /* ホバーで浮かせる演出のための指定 */
  transform: translateY(0);
  transition: transform 0.2s;
}
.card:hover {
  transform: translateY(-4px);
}
.dropdown {
  position: absolute;
  z-index: 9999; /* 最前面のつもり */
}
.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
}
```

`.card` の `transform` がスタッキングコンテキストを作ります。これで `.dropdown` の 9999 は**カードの中だけの順位**になります。外との勝負は「カード対ヘッダー」で行われ、z-index を持たないカードは 10 のヘッダーに負けます。結果、9999 のドロップダウンがヘッダーの下にもぐります。

実物で確かめてください。2 つの違いは親の `transform` だけです。

<div class="d119-demo">
  <div class="d119-case">
    <p class="d119-case-title">親に transform あり</p>
    <div class="d119-stage">
      <div class="d119-parent d119-has-tf">
        <span>親カード transform あり</span>
        <div class="d119-pop">子 z-index: 9999</div>
      </div>
      <div class="d119-header">ヘッダー z-index: 10</div>
    </div>
    <p class="d119-result">9999 の子が 10 の後ろに隠れる</p>
  </div>
  <div class="d119-case">
    <p class="d119-case-title">親に transform なし</p>
    <div class="d119-stage">
      <div class="d119-parent">
        <span>親カード transform なし</span>
        <div class="d119-pop">子 z-index: 9999</div>
      </div>
      <div class="d119-header">ヘッダー z-index: 10</div>
    </div>
    <p class="d119-result">9999 の子が前に出る</p>
  </div>
</div>

モーダルでもドロップダウンでもツールチップでも、構図は同じです。「z-index を上げたのに隠れる」ときは、たいてい**祖先の誰かがスタッキングコンテキストを作って**います。

## 直すのは数値ではなく場所

隠れたときの対処は、数値を増やすことではありません。**どこで区切られているかを探して、区切りの影響を受けない場所に出す**ことです。

### 区切りを作っている祖先を探す

開発者ツールの Elements パネルで、隠れている要素から祖先を 1 つずつ上に辿り、`transform`・`opacity`・`filter`・`will-change` を探します。ホバー演出やアニメーションのために付けた指定が見つかることが多いはずです。

### モーダルを DOM の上位に置く

モーダルのような全画面級の UI は、カードの中ではなく `body` 直下に置くのが定石です。祖先が減れば、閉じ込められる可能性も減ります。React にはまさにこのための `createPortal` という API があり、コンポーネントツリー上の親子関係はそのままに、実際の DOM だけを `body` 直下などに描画できます。

### トップレイヤーに乗せる

`<dialog>` 要素を `showModal()` で開いた場合と、`popover` 属性で表示した場合は、**トップレイヤー**という特別な層に乗ります。トップレイヤーはすべてのスタッキングコンテキストより手前に描画されるので、z-index の競争そのものから抜けられます。モーダルやツールチップを新しく作るなら、まずこの標準機能が使えないかを考えるのが近道です。

### isolation で意図的に区切る

`isolation: isolate` は、副作用なしでスタッキングコンテキストだけを作るプロパティです。コンポーネントの内部で使った z-index を外に漏らしたくないとき、ルート要素に付けて「この中の順位争いはこの中で完結」と宣言できます。事故の原因になってきた区切りを、今度は意図して守りに使う方法です。

## AI への指示の語彙

この仕組みを知っていると、直しの指示が変わります。モーダルが隠れたとき「z-index を上げて」ではなく、こう言えます。

> モーダルの祖先に `transform` か `opacity` があってスタッキングコンテキストに閉じ込められていないか確認して。閉じ込められているなら、`createPortal` で `body` 直下に出すか、`<dialog>` の `showModal()` に置き換えて

数値の上げ合いは別の場所で同じ事故を再発させますが、区切りを直す指示なら根本から直ります。

## まとめ

- z-index の比較は同じスタッキングコンテキストの中だけで、外との勝負は親同士で決まる
- `transform` や `opacity` は見た目のための指定でも副作用でスタッキングコンテキストを作る
- 隠れたら数値を上げず、祖先の区切りを探して `createPortal` や `<dialog>` で外に出す

<style>
.d119-demo {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin: 1.2em 0;
}
.d119-case {
  flex: 1 1 260px;
  min-width: 0;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px;
  background: #f8fafc;
  color: #1e293b;
}
.d119-case-title {
  font-weight: 700;
  font-size: 14px;
  margin: 0 0 8px;
}
.d119-stage {
  position: relative;
  height: 120px;
}
.d119-parent {
  position: absolute;
  top: 0;
  left: 0;
  width: 72%;
  height: 78px;
  background: #ffffff;
  border: 1px dashed #94a3b8;
  border-radius: 8px;
  padding: 8px;
  font-size: 12px;
  color: #475569;
}
.d119-has-tf {
  transform: translateX(0);
}
.d119-pop {
  position: absolute;
  top: 30px;
  left: 14px;
  z-index: 9999;
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #f59e0b;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}
.d119-header {
  position: absolute;
  top: 46px;
  left: 0;
  right: 0;
  z-index: 10;
  background: #3730a3;
  color: #ffffff;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 700;
}
.d119-result {
  margin: 8px 0 0;
  font-size: 12px;
  color: #475569;
}
</style>
