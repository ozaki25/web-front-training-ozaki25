# img タグの書き方 — アクセシビリティと Core Web Vitals

## 今日のゴール

- 画像の書き方はアクセシビリティと Core Web Vitals の両方に直結すると知る
- alt は画像の役割にあわせて書くことを知る
- Core Web Vitals（CWV）というユーザー体験の指標があることを知る
- `width` / `height` / `loading` の役割を知る

## 画像の書き方は 2 つの観点に直結する

Web ページで画像はよく使われますが、書き方によって体験が大きく変わる要素でもあります。特に次の 2 つの観点に影響します。

- **アクセシビリティ**: 画像を見られない人にも情報を届けられるか
- **Core Web Vitals**: ページの表示速度やレイアウトの安定性

## 観点1: アクセシビリティ — alt 属性

画像が見えない環境では、`alt` に書いたテキストが画像の代わりになります。

**alt は画像の見た目ではなく、ページ上の役割にあわせて書きます。**

同じ猫の写真でも:

<img src="https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=300&h=200&fit=crop" alt="ソファでくつろぐ猫" width="300" height="200" style="border-radius:8px;margin:8px 0" />

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

### 画像が CWV に大きく影響する

CWV の中でも、**LCP と CLS は画像に直結**します。

- **LCP**: ページの最大コンテンツは画像であることが多い。画像が大きい・読み込みが遅いと LCP が悪化
- **CLS**: 画像のサイズを指定していないと、読み込み時に下の文字やボタンが押し下げられる

**画像の属性を正しく書くだけで CWV が改善できる**ところがあります。

### width と height — レイアウトシフトを防ぐ

画像に `width` と `height` を指定していないと、読み込み中は場所がゼロになります。画像が読み込まれた瞬間に場所が生まれ、下の要素が押し下げられます。

これが **CLS（レイアウトシフト）** です。読んでいた文字が動いたり、押そうとしたボタンがずれたりする現象です。

```html
<!-- ❌ サイズ未指定 -->
<img src="photo.jpg" alt="風景写真" />

<!-- ✅ サイズ指定: 読み込み前から場所が確保される -->
<img src="photo.jpg" alt="風景写真" width="800" height="600" />
```

レスポンシブデザインでは画像の表示サイズが画面幅によって変わりますが、`width` と `height` を書いておけば大丈夫です。ブラウザは属性の値から縦横比を計算し、実際の表示サイズが変わっても正しい高さを予約してくれます。

```css
img {
  max-width: 100%;
  height: auto;
}
```

```html
<!-- 実サイズは 800x600 だが、画面幅に応じて縮小される。縦横比 4:3 は維持 -->
<img src="photo.jpg" alt="風景写真" width="800" height="600" />
```

CSS の `aspect-ratio` を使う方法もあります。

```css
img {
  width: 100%;
  aspect-ratio: 4 / 3;
}
```

**サイズ属性を書くだけで CLS を防げます。** ボタンを押して違いを体感してみてください:

<div style="display:flex;gap:16px;flex-wrap:wrap;margin:16px 0">
<div style="flex:1;min-width:240px;padding:16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;color:#1e293b">
<div style="font-weight:700;font-size:0.85em;color:#dc2626;margin-bottom:8px">❌ サイズ未指定</div>
<div id="demo-cls-bad">
<p style="margin:0 0 8px;font-size:0.9em">↓ この文章が押し下げられます</p>
</div>
<button type="button" onclick="var c=document.getElementById('demo-cls-bad');if(!c.querySelector('img')){var img=document.createElement('img');img.src='https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=300&h=200&fit=crop';img.alt='猫の写真';img.style.borderRadius='4px';img.style.display='block';img.style.maxWidth='100%';c.insertBefore(img,c.firstChild)}" style="padding:8px 16px;background:#2563eb;color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.85em;font-weight:600">画像を読み込む</button>
</div>
<div style="flex:1;min-width:240px;padding:16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;color:#1e293b">
<div style="font-weight:700;font-size:0.85em;color:#16a34a;margin-bottom:8px">✅ サイズ指定あり</div>
<div id="demo-cls-good">
<div style="width:100%;aspect-ratio:3/2;background:#e2e8f0;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:0.8em;color:#94a3b8" id="demo-cls-placeholder">画像の場所が確保されている</div>
<p style="margin:8px 0 0;font-size:0.9em">↓ この文章は動きません</p>
</div>
<button type="button" onclick="var p=document.getElementById('demo-cls-placeholder');if(p.tagName!=='IMG'){var img=document.createElement('img');img.src='https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=300&h=200&fit=crop';img.alt='猫の写真';img.width=300;img.height=200;img.style.borderRadius='4px';img.style.display='block';img.style.maxWidth='100%';img.style.height='auto';img.id='demo-cls-placeholder';p.parentNode.replaceChild(img,p)}" style="padding:8px 16px;background:#2563eb;color:white;border:none;border-radius:6px;cursor:pointer;font-size:0.85em;font-weight:600">画像を読み込む</button>
</div>
</div>

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
- `width` / `height` で CLS を防ぐ
- `loading="lazy"` で画面外の画像を遅延読み込み（ファーストビューには付けない）
