# img タグの書き方 — アクセシビリティと Core Web Vitals

## 今日のゴール

- 画像の書き方はアクセシビリティと Core Web Vitals の両方に直結すると知る
- alt は画像の役割にあわせて書くことを知る
- Core Web Vitals（CWV）というユーザー体験の指標があることを知る
- 画像が届く前に場所を確定させれば CLS を防げることを知る
- `loading="lazy"` の使いどころを知る

## 画像の書き方は 2 つの観点に直結する

Web ページで画像はよく使われますが、書き方によって体験が大きく変わる要素でもあります。特に次の 2 つの観点に影響します。

- **アクセシビリティ**: 画像を見られない人にも情報を届けられるか
- **Core Web Vitals**: ページの表示速度やレイアウトの安定性

## 観点1: アクセシビリティ — alt 属性

画像が見えない環境では、`alt` に書いたテキストが画像の代わりになります。

**alt は画像の見た目ではなく、ページ上の役割にあわせて書きます。**

同じ猫の写真でも、役割が違えば alt の内容は変わります。

<img src="https://images.unsplash.com/photo-1774162621182-f7d3a10c88e4?w=300&q=80&fm=jpg&fit=crop" alt="ソファでくつろぐ猫" width="300" height="200" style="border-radius:8px;margin:8px 0" />

- 猫カフェの紹介 → `alt="ソファでくつろぐ猫"`
- 「猫カフェを探す」ボタン → `alt="猫カフェを探す"`
- 背景装飾 → `alt=""`

何を書くべきか迷ったときは W3C の [alt ディシジョンツリー](https://www.w3.org/WAI/tutorials/images/decision-tree/ja) が参考になります。

### alt 属性は必ず書く

`alt` 属性自体を書き忘れると、スクリーンリーダーはファイル名（「image_001.jpg」など）を読み上げてしまいます。装飾画像でも `alt=""` と書いて、意図的に空であることを示しましょう。

### AI で alt を生成するとき

AI に画像を渡して alt を生成させることもできます。ただし同じ画像でも役割によって適切な alt は変わるので、画像だけでなくページの文脈や用途もあわせて伝えましょう。

## 観点2: Core Web Vitals — 表示速度とレイアウトの安定性

**Core Web Vitals**（コア ウェブ バイタルズ、以下 CWV）は、Google が定めた **ユーザー体験を数値で測るための指標**です。Google 検索の順位にも影響するため、Web サイトの品質として重視されています。

CWV には 3 つの指標があります。

| 指標 | 意味 | 何が測られるか |
|------|------|------|
| **LCP**（Largest Contentful Paint） | 最大コンテンツ描画 | ページで一番大きな要素（画像や見出しなど）が表示されるまでの時間 |
| **CLS**（Cumulative Layout Shift） | 累積レイアウトシフト | ページ読み込み中に要素がどれだけ飛ぶか |
| **INP**（Interaction to Next Paint） | 応答性 | ユーザーの操作に対する画面の反応の速さ |

遅い（LCP）、動く（CLS）、反応しない（INP）— どれもユーザーがストレスを感じる要因です。

CWV の中でも **LCP と CLS は画像に直結** します。画像はページの最大コンテンツになりやすく（LCP）、サイズ未指定だと読み込み時にレイアウトが動きます（CLS）。**画像の属性を正しく書くだけで CWV が改善できる** ところがあります。

### width と height — レイアウトシフトを防ぐ

サイズ未指定だと、読み込み前の画像の場所はゼロです。画像が届いた瞬間に場所が生まれ、下にあるコンテンツが押し下げられます。読んでいた文章が動いたり、押そうとしたボタンがずれたりする現象 — これが **CLS（レイアウトシフト）** です。

<div style="display:flex;gap:16px;flex-wrap:wrap;margin:16px 0">
<div style="flex:1;min-width:240px;padding:16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;color:#1e293b">
<div style="font-weight:700;font-size:0.85em;color:#dc2626;margin-bottom:8px">❌ サイズ未指定</div>
<img src="https://images.unsplash.com/photo-1774162621182-f7d3a10c88e4?w=300&q=80&fm=jpg&fit=crop" alt="ソファでくつろぐ猫" style="border-radius:4px;display:block;max-width:100%" />
<p style="margin:8px 0 0;font-size:0.9em">この文章は画像読み込み後に押し下げられる</p>
</div>
<div style="flex:1;min-width:240px;padding:16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;color:#1e293b">
<div style="font-weight:700;font-size:0.85em;color:#16a34a;margin-bottom:8px">✅ サイズ指定あり</div>
<img src="https://images.unsplash.com/photo-1774162621182-f7d3a10c88e4?w=300&q=80&fm=jpg&fit=crop" alt="ソファでくつろぐ猫" width="300" height="200" style="border-radius:4px;display:block;max-width:100%;height:auto" />
<p style="margin:8px 0 0;font-size:0.9em">この文章は最初から正しい位置にある</p>
</div>
</div>

防ぐ原則は **「画像が届く前に場所を確定させる」** こと。書き方は「どう表示したいか」で決まります。

#### 固定サイズで表示したい

表示したい幅と高さをそのまま書きます。

```html
<img src="photo.jpg" alt="風景写真" width="300" height="200" />
```

#### 画面幅に合わせて縮めたい

次の定番 CSS と `width` / `height` 属性をセットで使うと、画像が画面幅に合わせて縮み、縦横比を保ったまま CLS も防げます。

```css
img {
  max-width: 100%;
  height: auto;
}
```

この CSS があると、`width` と `height` の値は **縦横比の情報** として使われます。実画像と同じ縦横比の値を書けば、表示幅が縮んでも比率が保たれるので CLS は起きません。

```html
<!-- 実画像 1600×1200（4:3）-->
<img src="photo.jpg" alt="風景写真" width="800" height="600" />
```

#### 表示枠の比率を揃えたい

CMS やユーザー投稿など、実画像のサイズが毎回違うケースです。属性に値を書けないので、代わりに **「表示枠として決めた比率」** を CSS で固定します。画像はその枠に合わせて切り抜かれます。

```css
.card-image {
  width: 100%;
  aspect-ratio: 16 / 9;   /* 表示枠の比率 */
  object-fit: cover;      /* 実画像を切り抜いて枠に収める */
}
```

どの場合でも、画像が届く前に場所（または比率）が確定しているので CLS は起きません。

### loading — 画面外の画像は遅延読み込み

`loading="lazy"` を指定すると、画像が画面に近づいたときに初めて読み込まれます。

```html
<img src="photo.jpg" alt="..." loading="lazy" width="800" height="600" />
```

ただし、**ファーストビュー（スクロールせずに見える範囲）の画像には付けないのが鉄則**です。ファーストビューの画像は LCP の対象になることが多く、遅延読み込みすると逆に遅くなります。

```html
<!-- ❌ ファーストビューに lazy -->
<img src="hero.jpg" alt="..." loading="lazy" width="1200" height="600" />

<!-- ✅ ファーストビューは eager（または指定なし） -->
<img src="hero.jpg" alt="..." loading="eager" width="1200" height="600" />
```

## まとめ

- 画像の書き方は**アクセシビリティ**と**Core Web Vitals**の両方に直結する
- `alt` は画像の役割にあわせて書く。装飾画像は `alt=""`。迷ったら [alt ディシジョンツリー](https://www.w3.org/WAI/tutorials/images/decision-tree/ja)
- **Core Web Vitals** は Google がユーザー体験を数値化した 3 指標（LCP / CLS / INP）
- 画像が届く前に場所を確定させて CLS を防ぐ（`width` / `height` または CSS `aspect-ratio`）
- `loading="lazy"` で画面外の画像を遅延読み込み（ファーストビューには付けない）
