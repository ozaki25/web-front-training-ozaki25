# タッチターゲット — 見た目の大きさと押しやすさは別物

## 今日のゴール

- 見た目のサイズと押せる範囲が別物だと知る
- タッチターゲットのサイズの目安を知る
- padding で押せる範囲を広げる定番の手を知る

## 押したいボタンの隣が反応する

スマホで小さい「×」を押そうとして、隣のボタンが反応してしまった。通知を消すつもりが詳細画面が開いた。誰にでもある経験です。

このとき悪いのは指ではありません。**的が小さすぎる**のです。画面上で実際にタップに反応する領域を**タッチターゲット**と呼びます。誤タップの多くは、このタッチターゲットが指に対して小さすぎることで起きます。

アイコンだけの小さなボタンが並ぶ画面は、AI に作らせたアプリでもよくある形です。見た目のデザインとしては整っていても、指で押す的として十分かどうかは別の話です。今日はこの「見た目と押しやすさのずれ」を仕組みから見ます。

## 見た目のサイズと当たり判定は別物

タップに反応するのは、アイコンの絵の部分ではなく、**クリックできる要素のボックス全体**です。`<button>` なら、その button 要素が画面上に占める領域がそのまま当たり判定になります。

つまり、アイコンの大きさとタッチターゲットの大きさは独立しています。

| アイコンの見た目 | button 要素の領域 | 押しやすさ |
|----------------|-----------------|-----------|
| 16px | 16×16px | 押しにくい |
| 16px | 44×44px | 押しやすい |

アイコン自体は 16px の小ささでも、button の領域がその周りに広がっていれば問題ありません。逆に、アイコンが大きめに見えても、button の領域がアイコンぴったりのサイズだと押しにくいままです。

指先がスクリーンに触れる面はペン先よりずっと広く、狙った点から数ミリずれるのがふつうです。マウスカーソルの先端で狙う PC と違い、スマホでは「多少ずれても当たる」大きさが要ります。

## 目安になるサイズ

Web アクセシビリティのガイドラインである WCAG（Web Content Accessibility Guidelines）には、タッチターゲットのサイズに関する達成基準があります。WCAG 2.2 で追加された達成基準 2.5.8 では、押せる要素の的を **24×24 CSS ピクセル以上**にすることが目安として示されています。周囲に十分な間隔がある場合などの例外もありますが、「24px を下回る的は要注意」と覚えておけば十分です。

実務ではもっと余裕を持たせることが多く、Apple のデザインガイドラインは 44×44 ポイント、Google のマテリアルデザインは 48×48dp を推奨しています。数値の細部を暗記する必要はありません。**迷ったら 44px 前後を確保する**、という感覚を持っておくと判断に使えます。

## 誤タップが起きやすい条件

的の小ささに加えて、状況によっても誤タップは起きやすくなります。

- ボタン同士の間隔が狭い（削除と保存が隣接している、など）
- 画面の端に近い（持ち方によっては親指が届きにくく、無理な角度で押すことになる）
- 片手操作で親指を伸ばした先にある
- 電車の中など、揺れる環境で操作している

そして、押しやすさの影響がとくに大きい人たちがいます。高齢の人、手指の震えがある人、小さい画面の端末を使っている人にとって、小さい的は「押しにくい」ではなく「押せない」になりえます。押しやすい的は誰にとっても操作を速く確実にするので、特定の誰かのための配慮というより、全員の使い勝手の底上げです。

## padding で当たり判定を広げる

対策の定番は、**アイコンのサイズと押せる領域を分けて考える**ことです。アイコンは小さいまま、button 要素の `padding` で当たり判定だけを広げます。

まず押しにくい書き方です。

```html
<!-- ❌ アイコンの大きさがそのまま当たり判定になっている -->
<button type="button" class="close-button" aria-label="閉じる">
  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
    <path d="M2 2 L14 14 M14 2 L2 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
  </svg>
</button>

<style>
  .close-button {
    width: 16px;
    height: 16px;
    padding: 0;
    border: none;
    background: none;
  }
</style>
```

タッチターゲットは 16×16px しかありません。これを padding で広げます。

```html
<!-- ✅ アイコンは 16px のまま、padding で 44×44px に広げる -->
<button type="button" class="close-button" aria-label="閉じる">
  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
    <path d="M2 2 L14 14 M14 2 L2 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
  </svg>
</button>

<style>
  .close-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 14px; /* 16 + 14 * 2 = 44px */
    border: none;
    background: none;
    cursor: pointer;
  }
</style>
```

見た目のアイコンは 1px も変わっていません。変わったのは button 要素の領域だけです。padding は要素のボックスの一部なので、そこをタップしてもボタンとして反応します。デザインを崩さずに押しやすさだけを直せる、覚えておいて損のない手です。

アイコンだけのボタンには `aria-label` で名前を付けています。絵しか無いボタンは、スクリーンリーダーには「ボタン」としか読まれないためです。当たり判定の話とセットで、名前も付いているかを見る癖にしておくと一石二鳥です。

### 触って確かめる

破線の枠が、実際に押せる範囲です。2 つのボタンはアイコンの大きさこそ同じですが、当たり判定が違います。スマホで見ているなら、指でそれぞれタップしてみてください。

<div class="d133-demo">
  <div class="d133-row">
    <div class="d133-case">
      <p class="d133-case-label">アイコンのサイズのまま</p>
      <button type="button" class="d133-btn d133-small" aria-label="閉じる 当たり判定 16px" onclick="document.getElementById('d133-result').textContent='16px のボタンを押せました'">
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M2 2 L14 14 M14 2 L2 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
      </button>
    </div>
    <div class="d133-case">
      <p class="d133-case-label">padding で 44px に広げた</p>
      <button type="button" class="d133-btn d133-padded" aria-label="閉じる 当たり判定 44px" onclick="document.getElementById('d133-result').textContent='44px のボタンを押せました'">
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M2 2 L14 14 M14 2 L2 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
      </button>
    </div>
  </div>
  <p class="d133-result" id="d133-result" aria-live="polite"></p>
  <p class="d133-note">枠の内側ならアイコンの絵から外れていても反応します。左は絵そのものに当てないと反応しません。</p>
</div>

## ボタン同士の間隔

当たり判定を広げるのと並ぶもう 1 つの対策が、**間隔を空ける**ことです。的が多少小さくても、隣との間が空いていれば「狙いが外れて隣に当たる」事故は減ります。CSS なら `gap` や `margin` で確保できます。

とくに「削除」のような取り消しにくい操作のボタンは、他のボタンと隣接させないだけで事故の質が変わります。的の大きさと間隔、2 つで押しやすさを見るようにしてください。

## AI への指示の語彙

タッチターゲットという言葉を知っていると、指示とレビューの両方で使えます。

- 指示するとき: 「アイコンは 16px のまま、ボタンの当たり判定は padding で 44×44px 相当に広げて」「操作ボタン同士の間隔は 8px 以上空けて」
- でき上がった画面を見るとき: ブラウザの開発者ツールでボタンにカーソルを当てると、要素の実際のサイズが表示されます。見た目ではなく **button 要素のボックスが何 px か**を見ます

「もっと押しやすくして」では、アイコンだけが大きくなってデザインが崩れるかもしれません。「見た目はそのまま、当たり判定を広げて」と言い分けられるのが、今日の引き出しです。

## まとめ

- 押せる範囲はアイコンの絵ではなく、クリックできる要素のボックス全体で決まる
- 目安は 24×24px 以上で、実務では 44px 前後を確保することが多い
- アイコンは小さいまま padding で当たり判定を広げ、ボタン同士の間隔も空ける

<style>
.d133-demo {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px;
  margin: 1.2em 0;
  background: #f8fafc;
  color: #1e293b;
}
.d133-row {
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  align-items: flex-start;
}
.d133-case {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  min-width: 140px;
}
.d133-case-label {
  font-size: 13px;
  color: #475569;
  margin: 0;
}
.d133-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  background: #ffffff;
  color: #334155;
  cursor: pointer;
  outline: 2px dashed #f59e0b;
}
.d133-btn:hover {
  background: #e2e8f0;
}
.d133-btn:focus-visible {
  outline: 3px solid #2563eb;
  outline-offset: 2px;
}
.d133-btn svg {
  display: block;
}
.d133-small {
  padding: 0;
  width: 16px;
  height: 16px;
}
.d133-padded {
  padding: 14px;
}
.d133-result {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  min-height: 1.4em;
  margin: 14px 0 0;
}
.d133-note {
  font-size: 13px;
  color: #475569;
  margin: 6px 0 0;
}
</style>
