# ダークモードの仕組み — なぜ色を直書きしないのか

## 今日のゴール

- `prefers-color-scheme` でユーザーの設定を読み取る仕組みを知る
- CSS 変数でモードごとの色を切り替える方法を知る
- 「色の直書き」が壊れる構造的な理由を知る

## ダークモードは「見た目の好み」ではない

最近のアプリにはダークモードが当たり前にあります。「黒い画面のほうがかっこいい」という好みの問題に見えますが、実際にはもっと切実な理由があります。

- **眩しさの軽減**: 暗い環境で白い画面は目に痛い
- **バッテリー節約**: 有機 EL ディスプレイでは黒いピクセルは発光しないので電力を消費しない
- **視覚障害への配慮**: 光過敏の人にとって白背景は物理的に辛い

OS レベルでダークモードを設定しているユーザーは、すべてのアプリに「暗い表示」を期待しています。Web アプリもこの期待に応える必要があります。

## `prefers-color-scheme` — OS の設定を読む

ブラウザはユーザーの OS 設定を読み取り、CSS に伝える仕組みを持っています。

```css
/* ライトモード（既定） */
body {
  background: #ffffff;
  color: #1e293b;
}

/* ダークモードの場合 */
@media (prefers-color-scheme: dark) {
  body {
    background: #0f172a;
    color: #e2e8f0;
  }
}
```

`@media (prefers-color-scheme: dark)` は「**ユーザーの OS がダークモードなら、この CSS を適用する**」というメディアクエリです。JavaScript は一切不要で、CSS だけで切り替わります。

## 色を直書きすると壊れる理由

ダークモード対応していないアプリで何が起きるかを見てみます。

```css
.card {
  background: white;  /* ライトモードでは問題ない */
  color: #333333;     /* 暗い文字 */
}
```

OS がダークモードのとき、ブラウザやフレームワーク（VitePress など）は `body` の背景を暗くすることがあります。すると `.card` の `background: white` はそのまま白で、まわりだけ暗い。あるいは `body` の `color` が白に変わったのに `.card` の中は `#333333` のまま。**一部だけ明るい、一部だけ暗い、ちぐはぐな画面**になります。

色を直書き（ハードコード）すると、モードの切り替えに**追従できない部品が残る**。これが壊れる構造的な理由です。

## CSS 変数で解決する — 色に名前を付ける

解決策は、色を**直書きせず、名前（CSS 変数）で参照する**ことです。

```css
:root {
  --color-bg: #ffffff;
  --color-text: #1e293b;
  --color-border: #e2e8f0;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0f172a;
    --color-text: #e2e8f0;
    --color-border: #334155;
  }
}
```

```css
.card {
  background: var(--color-bg);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}
```

`.card` は `white` ではなく `var(--color-bg)` を見ています。モードが変わると `:root` の変数定義だけが切り替わり、**参照している全部品が自動で追従**します。

これはデザイントークンの考え方そのものです。「色をトークンとして名前で管理すると、一括変更が効く」という利点が、ダークモード対応では必需品になります。

### 触って確かめる

**このサイトの右上にあるテーマ切り替え**を押してみてください。下の見本は色を直書きせず CSS 変数だけを参照しているので、変数の定義が切り替わると一斉に追従します。

<div class="c78-demo">
  <p class="c78-swatch">背景は var(--c78-bg)、文字は var(--c78-text)</p>
  <p class="c78-swatch">この枠線は var(--c78-border)</p>
</div>

（このサイトの切り替えはクラス方式です。OS の設定に追従させたい場合に使うのが、本文の `prefers-color-scheme` 方式です）

## Tailwind CSS のダークモード

Tailwind では `dark:` プレフィックスでダークモード用のスタイルを書きます。

```tsx
<div className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
  コンテンツ
</div>
```

内部的には `@media (prefers-color-scheme: dark)` と同じ仕組みです。Tailwind のカラーパレット自体がトークンの役割を果たしているため、`bg-white` / `dark:bg-gray-900` のように対応を明示できます。

## コントラストの再確認

ダークモード対応で見落としがちなのが、**コントラスト比の再確認**です。

ライトモードで 4.5:1 をクリアしていた色の組み合わせが、ダークモードでは背景色が変わることで**不合格になる**ことがあります。「背景が白に灰色テキスト」は合格でも、「背景が濃紺に同じ灰色テキスト」では読めません。**モードごとにコントラストは別物として測り直す**必要があります。

## AI のコードを見るポイント

1. **色がハードコードされていないか**: `background: white` や `color: #333` を見たら、CSS 変数やトークン経由になっているか確認
2. **ダーク用の対応があるか**: `dark:` プレフィックスや `@media (prefers-color-scheme: dark)` が書かれているか
3. **明るい背景のコンテナに `color` が明示されているか**: ダークモードで `color` が白に切り替わったとき、白背景上のテキストが白で見えなくなる事故を防ぐ

3 つ目は、この教材の VitePress でも実際に起きた問題です。明るい背景（`background: #f8fafc`）を持つデモに `color` を指定し忘れたため、ダークモードでテキストが消えました。

## まとめ

- ダークモードは好みの問題ではなく、眩しさ・バッテリー・視覚障害への対応
- `prefers-color-scheme: dark` で OS の設定を CSS が読み取る。JS 不要
- 色の直書きはモード切り替えに追従できず壊れる。CSS 変数（トークン）で名前管理する
- モードが変わればコントラストは別物。ダークモード用に測り直す

<style>
.c78-demo {
  --c78-bg: #ffffff;
  --c78-text: #1e293b;
  --c78-border: #94a3b8;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px;
  margin: 1.2em 0;
  background: #f8fafc;
}
.dark .c78-demo {
  --c78-bg: #0f172a;
  --c78-text: #e2e8f0;
  --c78-border: #475569;
  background: #1e293b;
  border-color: #334155;
}
.c78-swatch {
  background: var(--c78-bg);
  color: var(--c78-text);
  border: 2px solid var(--c78-border);
  border-radius: 8px;
  padding: 12px 16px;
  margin: 8px 0;
  font-size: 14px;
}
</style>
