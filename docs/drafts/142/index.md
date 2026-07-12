# ズームとリフロー — 文字を 200% にしても壊れないか

## 今日のゴール

- 拡大にはページズームと文字サイズ変更の 2 種類があると知る
- 拡大しても折り返して読める状態を指すリフローを知る
- 固定 px を `max-width` や `rem` に置き換える定番の対策を知る

## 文字を大きくしたら崩れるサイト

スマホの文字をかなり大きくして使っている人は、身近にいるはずです。家族のスマホをのぞいたら文字が巨大だった、という経験がある人も多いでしょう。自分でも、細かい文字のページを指でつまんで広げたことはあるはずです。

ところが、拡大した途端に崩れるサイトがあります。横にスクロールしないと文の続きが読めない。ボタンが重なって押せない。文字の後半が切れて見えない。

弱視の人や高齢の人にとって、拡大は「あれば便利」ではなく「ないと読めない」機能です。つまり拡大に耐えない画面は、その人たちには読めない画面です。今日は、なぜ壊れるのか、どう作れば壊れないのかを仕組みから見ます。

## ズームと文字サイズ変更

ひとくちに拡大と言っても、ブラウザには 2 種類の機能があります。

| 方法 | 操作 | 大きくなるもの |
|------|------|--------------|
| ページズーム | `Ctrl` と `+`（Mac は `Cmd` と `+`）、ピンチ操作 | 文字・画像・余白などページ全体 |
| 文字サイズ変更 | ブラウザ設定のフォントサイズ | 文字だけ |

ページズームで 200% にすると、画面に横に並べられる量は実質半分になります。幅 1200px のディスプレイで見ていても、レイアウト上は 600px の画面で見ているのと同じです。つまり「拡大に耐える」は「狭い画面に耐える」とほぼ同じ問題です。

文字サイズ変更のほうは、画像や余白はそのままで文字だけが育ちます。文字を入れている箱が育たないと、あふれたり切れたりします。こちらの対策はあとで出てくる `rem` が担当します。

## リフローという考え方

画面幅に対して中身が多すぎるとき、要素を折り返して縦に並べ直すことを**リフロー**と呼びます。

紙の新聞は幅が固定なので、拡大コピーすると紙からはみ出します。一方、うまく作られた Web ページは、幅が足りなくなったら 3 列を 2 列に、2 列を 1 列に組み替えて、**縦スクロールだけで読み進められる形**に流れ直します。これがリフローです。

リフローが働いていれば、200% に拡大しても読み方は変わりません。上から下へスクロールするだけです。壊れているページでは、1 行読むごとに右へスクロールして左へ戻る、という操作を強いられます。

Web アクセシビリティのガイドラインである WCAG（Web Content Accessibility Guidelines）にも、文字を 200% まで拡大しても内容や機能が失われないことを求める基準（1.4.4 リサイズテキスト）や、狭い画面幅でも一方向のスクロールだけで読めることを求める基準（1.4.10 リフロー）があります。数値の細部より、「200% で壊れないか」という確かめ方を覚えておけば十分です。

## 固定幅が壊れる仕組み

リフローを止めてしまう代表が、px の固定幅です。

```css
/* ❌ 画面が 800px より狭くなっても幅を譲らない */
.article {
  width: 800px;
}
```

`width: 800px` の要素は、画面が 600px 相当になっても 800px のままです。幅を譲らないので、画面からはみ出すか、隣の要素に重なります。ページのどこか 1 か所にこれがあるだけで、ページ全体に横スクロールが発生します。

さらに悪い手当てが、はみ出しを `overflow: hidden` で隠すことです。

```css
/* ❌ はみ出しを隠すと、はみ出た文字ごと読めなくなる */
.article {
  width: 800px;
  overflow: hidden;
}
```

横スクロールバーは消えますが、はみ出た部分の文字も一緒に消えます。見た目の崩れは直ったように見えて、「読めない」という本当の問題はむしろ悪化しています。

### 触って確かめる

スライダーで枠の幅を狭めてみてください。枠が狭くなるのは、ページズームで拡大したのと同じ状況です。上のカードは幅を px で固定していて、下のカードは `max-width` で指定しています。

<div class="d142-demo">
  <div class="d142-controls">
    <label class="d142-label" for="d142-range">画面の幅</label>
    <input type="range" id="d142-range" min="220" max="480" value="480" step="10" oninput="document.getElementById('d142-stage').style.width = this.value + 'px'; document.getElementById('d142-width').textContent = this.value + 'px'" />
    <span class="d142-width" id="d142-width">480px</span>
  </div>
  <div class="d142-stage" id="d142-stage">
    <div class="d142-card d142-fixed">
      <p class="d142-card-title">width: 360px のカード</p>
      <p class="d142-card-body">画面が狭くなっても幅を譲らず、枠の外へはみ出します。</p>
    </div>
    <div class="d142-card d142-fluid">
      <p class="d142-card-title">max-width: 360px のカード</p>
      <p class="d142-card-body">画面が狭くなったら文字を折り返して、枠の中に収まり続けます。</p>
    </div>
  </div>
  <p class="d142-note">破線の枠が画面の端のつもりです。固定幅のカードだけが枠を突き破り、実際のページなら横スクロールや重なりになります。</p>
</div>

## max-width と rem で組む対策

直し方は難しくありません。「800px ほしい」ではなく「**最大でも 800px、狭ければ画面に合わせる**」と書きます。

```css
/* ✅ 広い画面では 800px、狭い画面では画面に合わせて縮む */
.article {
  width: 100%;
  max-width: 800px;
}
```

これだけで、この要素は幅を譲れるようになり、リフローに参加できます。

文字サイズ変更への対策が `rem` です。`1rem` はルート要素（`html`）の文字サイズを基準にした単位で、多くの環境で初期値は 16px、そして**利用者がブラウザ設定で変えられます**。幅や余白を `rem` で書いておくと、利用者が文字を大きくしたとき、文字を入れる箱も同じ比率で育ちます。

```css
/* ✅ 文字サイズの設定に比例して、幅も余白も追従する */
.card {
  max-width: 40rem;
  padding: 1rem;
}
```

ひとつ注意があります。`html { font-size: 16px; }` のように基準値そのものを px で固定すると、利用者のフォント設定が効かなくなります。`rem` の土台であるルートの文字サイズは、px で上書きしないでください。

## user-scalable=no という禁じ手

スマホでの表示倍率は、HTML の `<meta name="viewport">` というタグで制御します。ここに `user-scalable=no` や `maximum-scale=1` を入れると、ピンチ操作での拡大そのものを無効化できてしまいます。

```html
<!-- ❌ 利用者の拡大操作を無効化してしまう -->
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
/>

<!-- ✅ 指定はここまでで十分 -->
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

かつては「ネイティブアプリらしい見た目を保つ」目的で広く使われた指定です。しかし拡大を必要とする人から、その手段ごと奪ってしまいます。最近はこの指定を無視するブラウザもありますが、無視される前提で残してよいものではありません。でき上がったコードにこの指定を見つけたら、外してください。

## 200% に拡大して確かめる

拡大に耐えるかどうかは、開発者ツールなしで今日から確かめられます。

- `Ctrl` と `+`（Mac は `Cmd` と `+`）でページを 200% まで拡大する
- 本文を読むのに横スクロールが必要になっていないか見る
- 文字が切れたり、要素が重なったりしていないか見る
- ブラウザ設定の文字サイズを「大」にして、レイアウトが追従するか見る

自分のアプリを 200% で開くと、固定幅の場所がどこか一目でわかります。デザインの好みではなく「読めるか読めないか」の確認なので、判断に迷いません。

## AI への指示の語彙

今日の内容は、そのまま指示の言葉になります。

- 「幅は px で固定せず、`width: 100%` と `max-width` で指定して」
- 「余白や幅の基準は `rem` にして。`html` の文字サイズは px で上書きしないで」
- 「viewport に `user-scalable=no` と `maximum-scale=1` を入れないで」

そして受け取った画面は、200% に拡大して横スクロールと文字切れを見ます。「もっと見やすくして」という曖昧な頼み方より、崩れる仕組みを踏まえた一言のほうが、確実に拡大に耐える画面へ近づきます。

## まとめ

- 拡大にはページズームと文字サイズ変更があり、どちらもレイアウトを揺さぶる
- 折り返して縦に並べ直せる作りなら、200% に拡大しても読める（リフロー）
- 幅は `max-width` と `%` と `rem` で指定し、`user-scalable=no` は使わない

<style>
.d142-demo {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px;
  margin: 1.2em 0;
  background: #f8fafc;
  color: #1e293b;
  overflow-x: auto;
}
.d142-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.d142-label {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}
.d142-controls input[type="range"] {
  flex: 1;
  min-width: 120px;
  max-width: 260px;
  accent-color: #2563eb;
}
.d142-width {
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  color: #475569;
  min-width: 3.5em;
}
.d142-stage {
  width: 480px;
  max-width: 100%;
  border: 2px dashed #94a3b8;
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.d142-card {
  border-radius: 6px;
  padding: 10px 12px;
  color: #1e293b;
}
.d142-fixed {
  width: 360px;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  flex-shrink: 0;
}
.d142-fluid {
  max-width: 360px;
  background: #dcfce7;
  border: 1px solid #22c55e;
}
.d142-card-title {
  font-size: 13px;
  font-weight: 700;
  margin: 0 0 4px;
}
.d142-card-body {
  font-size: 13px;
  margin: 0;
}
.d142-note {
  font-size: 13px;
  color: #475569;
  margin: 10px 0 0;
}
</style>
