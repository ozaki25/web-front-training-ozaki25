# カードごとにレイアウトを切り替えたい — コンテナクエリ

## 今日のゴール

- メディアクエリでは「画面幅」しか見られず、「コンポーネントがどこに置かれたか」で分岐できないことを理解する
- コンテナクエリなら親要素の幅に応じてレイアウトを切り替えられる、という発想を手に入れる
- `container-type` / `@container` / `cqi` といった基本ワードを自分の言葉で説明できるようになる

## 「同じカードなのに、置く場所で崩れる」問題

AI に作ってもらった Next.js アプリを触っていると、こんな場面がないでしょうか。

- ユーザーカードをメインの広い領域に置くと、アイコンと名前が横並びで収まっている
- 同じカードをサイドバーの狭い領域に移すと、画像がはみ出して崩れる
- 仕方なく「サイドバー用カード」と「メイン用カード」を別々に作ってしまう

これはメディアクエリ（CSS で画面サイズによってスタイルを切り替える仕組み）が抱える根本的な制約から来ています。

```css
/* メディアクエリは「ビューポート幅」しか見られない */
@media (min-width: 600px) {
  .user-card {
    flex-direction: row;
  }
}
```

`@media` は常にブラウザウィンドウ全体の幅を基準にします。画面が広くてもカードが置かれた領域が狭ければ崩れるし、画面が狭くても領域が十分広ければ縦並びになってしまう。**「コンポーネントは自分が置かれた場所のサイズを知らない」** のが問題です。

この問題を解決するのが **コンテナクエリ** です。親要素（コンテナ）の幅を基準にスタイルを切り替えられるので、カードはどこに置かれても「自分の周り」に合わせて見た目を変えられます。2023 年に主要ブラウザすべてで Baseline 入り、今は安心して本番で使えます。

```mermaid
flowchart LR
  A[ビューポート幅] -->|@media| B[画面全体で一律に切り替え]
  C[親要素の幅] -->|@container| D[置かれた場所ごとに切り替え]
```

今日はこの仕組みを 3 つの柱で押さえます。

1. **コンテナを宣言する** (`container-type`)
2. **`@container` で親の幅に問い合わせる**
3. **`cqi` などコンテナ相対単位で長さも追従させる**

## 柱1: コンテナを宣言する

コンテナクエリを使う最初のステップは、「この要素を基準にしますよ」と宣言することです。`container-type` プロパティでコンテナ化します。

```css
.card-slot {
  container-type: inline-size;
  container-name: card;
}
```

- `container-type: inline-size` — 横方向（インライン方向）のサイズをクエリ対象にする。ほとんどの用途でこれを選べば OK
- `container-name: card` — 複数のコンテナがネストしたときに指し示す名前。省略も可能

ショートハンドで 1 行にまとめることもできます。

```css
.card-slot {
  container: card / inline-size;
}
```

**注意: `container-type` を指定すると「containment」が有効になる**

コンテナ化した要素は「中身の高さや幅が外に影響しない」という隔離状態になります。つまり、子要素の高さが親を押し広げなくなったり、幅を `width: auto` に頼っている子が期待通りにならなかったりします。

コンテナ化は「このコンポーネントは独立したレイアウト単位です」と宣言する操作だと考えるとしっくりきます。迷ったら **カードの外側のラッパー div** にだけかけ、カード本体にはかけないのが無難です。

## 柱2: `@container` で問い合わせる

コンテナを宣言したら、そのコンテナの幅に応じてスタイルを切り替えます。書き方は `@media` とほぼ同じで、`@media` が `@container` に変わるだけです。

```html
<article class="user-card">
  <img src="/avatar.png" alt="" />
  <div class="user-card__body">
    <h3>山田 太郎</h3>
    <p>フロントエンドエンジニア</p>
  </div>
</article>
```

```css
/* カードの外側のラッパーをコンテナにする */
.card-slot {
  container-type: inline-size;
}

/* デフォルト（狭い）は縦並び */
.user-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.user-card img {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

/* コンテナが 400px 以上になったら横並びにする */
@container (min-width: 400px) {
  .user-card {
    flex-direction: row;
    align-items: center;
  }

  .user-card img {
    width: 80px;
    height: 80px;
  }
}
```

ポイントは `@container` の条件が **「ビューポートではなくコンテナの幅」** を見ていることです。画面がどれだけ広かろうが、`.card-slot` が 300px しかなければ縦並びのままになります。

`alt=""` は装飾目的の画像であることを示します。アバター画像のように「名前の隣に置かれた飾り」は、スクリーンリーダーで二重読みにならないよう空文字にします。名前という情報が隣にあることが前提です。

### React コンポーネントと相性が良い理由

React や Next.js のコンポーネントを書くとき、「自分がどこに配置されるか」をコンポーネント側は知りません。親がサイドバーなのかメインなのかは、呼び出し側の事情です。

コンテナクエリを使うと、コンポーネントは **「自分が置かれた枠の幅」に応じて自律的にレイアウトを変える** ので、配置場所ごとに別コンポーネントを作る必要がなくなります。これは「再利用可能な部品を組み合わせる」という React の思想と素直に合います。

## 柱3: コンテナ相対単位でフォントも追従する

レイアウトだけでなく、フォントサイズや余白も「コンテナの大きさに合わせて」変えたい場面があります。そのためにコンテナ相対単位という長さの指定方法があります。

- `cqw` — コンテナ幅の 1%
- `cqh` — コンテナ高さの 1%
- `cqi` — コンテナのインラインサイズ（主に横幅）の 1%
- `cqb` — コンテナのブロックサイズ（主に縦幅）の 1%

`vw`（ビューポート幅の 1%）のコンテナ版だと思うと理解しやすいです。

```css
.card-slot {
  container-type: inline-size;
}

.user-card h3 {
  /* コンテナ幅の 5%、ただし最低 16px、最大 24px */
  font-size: clamp(1rem, 5cqi, 1.5rem);
}
```

`clamp()` は「最小値・推奨値・最大値」を指定する CSS 関数です。これと `cqi` を組み合わせると、**カードが大きい場所では文字も大きく、小さい場所では読みやすい大きさに収まる** という挙動になります。

### アクセシビリティ面でのうれしさ

ユーザーがブラウザの文字サイズを大きくしたとき、固定ピクセルで作られたレイアウトはすぐ崩れます。コンテナクエリと相対単位の組み合わせなら、**コンテナ自体が文字サイズに応じて膨らみ、その膨らんだサイズに応じてレイアウトが変わる** ので、「文字を拡大したら変な位置で折り返した」という事故が起きにくくなります。

画面幅だけを見るメディアクエリでは気づけなかった、「個々の部品の読みやすさ」に目が向くのが本質的な違いです。

## デモ: 同じカードを狭い枠と広い枠に入れる

下のデモは、**まったく同じ HTML・まったく同じ CSS クラス** のカードを、200px の枠と枠いっぱいに広がる領域に入れたものです。カードに当てているスタイルは 1 セットだけで、分岐しているのは `@container (min-width: 400px)` のみ。置かれた場所の幅だけでレイアウトが切り替わります。

<style>
.cq-demo-slot { container-type: inline-size; }
.cq-demo-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: white;
  color: #1e293b;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}
.cq-demo-avatar {
  width: 100%;
  aspect-ratio: 1 / 1;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 6px;
  flex-shrink: 0;
}
.cq-demo-title { margin: 0; font-size: 14px; color: #1e293b; }
.cq-demo-sub { margin: 4px 0 0; font-size: 12px; color: #475569; }
@container (min-width: 400px) {
  .cq-demo-card { flex-direction: row; align-items: center; gap: 16px; padding: 16px; }
  .cq-demo-avatar { width: 80px; height: 80px; aspect-ratio: auto; }
  .cq-demo-title { font-size: 18px; }
  .cq-demo-sub { font-size: 14px; }
}
</style>

<div style="display:flex;gap:16px;flex-wrap:wrap;background:#f8fafc;color:#1e293b;padding:16px;border-radius:8px;border:1px solid #e2e8f0;">
  <div style="background:white;color:#1e293b;padding:12px;border-radius:8px;border:1px solid #cbd5e1;">
    <p style="margin:0 0 8px;font-size:12px;color:#475569;">枠の幅: 200px（サイドバー想定）</p>
    <div class="cq-demo-slot" style="width:200px;">
      <article class="cq-demo-card">
        <div class="cq-demo-avatar" aria-hidden="true"></div>
        <div>
          <h4 class="cq-demo-title">山田 太郎</h4>
          <p class="cq-demo-sub">フロントエンドエンジニア</p>
        </div>
      </article>
    </div>
  </div>

  <div style="background:white;color:#1e293b;padding:12px;border-radius:8px;border:1px solid #cbd5e1;flex:1;min-width:280px;">
    <p style="margin:0 0 8px;font-size:12px;color:#475569;">枠の幅: 残り全部（メイン想定。ブラウザ幅を変えると切り替わる瞬間が見えます）</p>
    <div class="cq-demo-slot" style="width:100%;">
      <article class="cq-demo-card">
        <div class="cq-demo-avatar" aria-hidden="true"></div>
        <div>
          <h4 class="cq-demo-title">山田 太郎</h4>
          <p class="cq-demo-sub">フロントエンドエンジニア</p>
        </div>
      </article>
    </div>
  </div>
</div>

狭い側は 400px に届かないので縦並び、広い側は横並びになります。ブラウザ幅を縮めて右側の枠が 400px を下回ると、**右側だけ** が縦並びに切り替わるのが観察できます。メディアクエリでは両方が同時に切り替わってしまうので、この挙動はコンテナクエリでしか実現できません。

## Tailwind CSS での書き方

配属先で使う Tailwind CSS v4 には、コンテナクエリが **標準機能として組み込まれています**（以前は `@tailwindcss/container-queries` プラグインが必要でしたが、v4 からコアに入りました）。

```tsx
export function UserCard() {
  return (
    <div className="@container">
      <article className="flex flex-col gap-3 @md:flex-row @md:items-center">
        <img
          src="/avatar.png"
          alt=""
          className="w-full @md:w-20 @md:h-20 rounded-lg"
        />
        <div>
          <h3 className="font-bold">山田 太郎</h3>
          <p className="text-sm text-slate-600">フロントエンドエンジニア</p>
        </div>
      </article>
    </div>
  );
}
```

- `@container` — この要素をコンテナにする
- `@md:flex-row` — コンテナが `md`（既定で 28rem = 448px）以上になったら `flex-row` を当てる

`md:` だけだと画面幅基準ですが、頭に `@` を付けるとコンテナ基準に切り替わる、というシンプルな設計です。コンポーネントを書くときは「このカードが置かれる枠は何 px になりうるか」で考えるクセをつけるとレイアウトが安定します。

## まとめ

- メディアクエリはビューポート幅しか見られず、「コンポーネントが置かれた場所」では分岐できない
- コンテナクエリは `container-type: inline-size` で親要素をコンテナ化し、`@container (min-width: ...)` で親の幅に応じて切り替えられる
- `cqi` などのコンテナ相対単位を使えば、レイアウトだけでなく文字サイズも親のサイズに連動する
- コンポーネントが「自分の置かれた枠」を基準に自律的に変わるので、React や Tailwind と自然に組み合わせられる

今日はこれだけ覚えれば OK。**「画面幅で悩み始めたら、親の幅で解決できないか」** と問い直せるようになれば、カードを別コンポーネントに分けずに済む場面が一気に増えます。
