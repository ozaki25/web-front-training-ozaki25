# URL の解剖 — ? と # は何が違うのか

## 今日のゴール

- URL の各部品の名前と役割を言えるようになる
- クエリパラメータ（?）とフラグメント（#）の決定的な違いを知る
- 「URL に状態を置く」という設計の発想を知る

## URL の部品と名前

URL は Web でいちばん目にする文字列です。それなのに、部品の名前を聞かれると意外と答えられません。

```
https://shop.example.com:443/products/123?sort=price&page=2#reviews
```

| 部品 | この URL では | 役割 |
|------|-------------|------|
| **スキーム** | `https` | 通信の方式。`https` なら暗号化された HTTP |
| **ホスト** | `shop.example.com` | どのサーバーか。DNS で IP アドレスに変換される |
| **ポート** | `:443` | サーバーの何番の窓口か。https の既定は 443 で、普段は省略される |
| **パス** | `/products/123` | サーバー内のどの資源か。App Router ではフォルダ構成がここに対応する |
| **クエリ** | `?sort=price&page=2` | `名前=値` を `&` で繋ぐ追加の指定 |
| **フラグメント** | `#reviews` | ページ**内**の位置 |

この中で開発に特に効くのが `?` と `#` です。見た目は似ていますが、性質はまったく違います。

### 触って確かめる

下の URL を自由に書き換えてみてください。ブラウザ標準の `new URL()` がリアルタイムに部品分解します。

<div class="c84-demo">
  <label class="c84-label" for="c84-input">URL を編集する</label>
  <input
    id="c84-input"
    class="c84-input"
    value="https://shop.example.com/products/123?sort=price&page=2#reviews"
    oninput="
      try {
        var u = new URL(this.value);
        document.getElementById('c84-scheme').textContent = u.protocol.replace(':', '');
        document.getElementById('c84-host').textContent = u.host;
        document.getElementById('c84-path').textContent = u.pathname;
        document.getElementById('c84-query').textContent = u.search || '（なし）';
        document.getElementById('c84-hash').textContent = u.hash || '（なし）';
      } catch (e) {
        document.getElementById('c84-scheme').textContent = '（URL として不正）';
        document.getElementById('c84-host').textContent = '—';
        document.getElementById('c84-path').textContent = '—';
        document.getElementById('c84-query').textContent = '—';
        document.getElementById('c84-hash').textContent = '—';
      }
    "
  />
  <dl class="c84-out" aria-live="polite">
    <dt>スキーム</dt><dd id="c84-scheme">https</dd>
    <dt>ホスト</dt><dd id="c84-host">shop.example.com</dd>
    <dt>パス</dt><dd id="c84-path">/products/123</dd>
    <dt>クエリ</dt><dd id="c84-query">?sort=price&page=2</dd>
    <dt>フラグメント</dt><dd id="c84-hash">#reviews</dd>
  </dl>
</div>

## ? — サーバーに届く追加の注文

**クエリパラメータ**（`?sort=price&page=2`）は、リクエストの一部として**サーバーに送られます**。「商品一覧を、価格順で、2 ページ目を」という追加の注文です。

Next.js では、この値がページに `searchParams` という名前で渡されます。サーバーはこの値を見て、返す内容を変えられます。

### エンコード — URL に書けない文字の変換

クエリの値に日本語や記号を入れると、見慣れない文字列になります。

```
?q=コーヒー豆  →  ?q=%E3%82%B3%E3%83%BC%E3%83%92%E3%83%BC%E8%B1%86
```

URL に使える文字は半角英数と一部の記号だけ、という決まりがあるため、それ以外は `%xx` 形式に変換（**URL エンコード**）されます。JavaScript では `encodeURIComponent()` がこの変換を行います。

気をつけたいのは、`&` や `=` を**値の中に**含めたい場合です（検索語が「A&B」など）。エンコードせずに文字列連結で組み立てると、**URL の区切り文字と区別がつかなくなり、値が壊れます**。

文字列連結で URL を組み立てているコードを見たら、「`URLSearchParams` か `encodeURIComponent` を使ってる？」が確認ポイントです。

```ts
// ✅ URLSearchParams に任せれば、エンコードは自動
const params = new URLSearchParams({ q: "A&B", page: "2" });
const url = `/search?${params}`; // /search?q=A%26B&page=2
```

## # — サーバーに届かないページ内の位置

**フラグメント**（`#reviews`）は、`?` と決定的に違う性質を持っています。**サーバーに送られません**。

`https://shop.example.com/products/123#reviews` にアクセスしたとき、サーバーに届くリクエストは `/products/123` まで。`#reviews` はブラウザの手元に残り、**ページの中の `id="reviews"` の要素まで自動スクロールする**ために使われます。

| | `?`（クエリ） | `#`（フラグメント） |
|---|-------------|------------------|
| サーバーに届くか | **届く** | **届かない** |
| 主な用途 | 検索条件・ページ番号・フィルタ | ページ内の位置（目次リンク） |
| 変えるとページ再取得が起きるか | 起きる（通常の遷移時） | **起きない** |

`#` を変えてもリロードが起きないこの性質は、ページ遷移を JavaScript だけで行う昔のサイトが、画面切り替えに `#` を使っていた理由でもあります。今は History API という、リロードなしで URL 全体を書き換えられる仕組みに置き換わっています。

## URL に状態を置くという設計

`?sort=price&page=2` をよく見ると、これは画面の状態です。並び順とページ番号という、useState（React で画面の状態を持つ仕組み）で持ってもよさそうな値が URL に入っています。

状態を URL に置くと、state には無い力が生まれます。

- **共有できる**: 「価格順の 2 ページ目」をそのまま URL でチームに送れる
- **リロードに耐える**: F5 を押しても同じ絞り込み結果に戻る
- **ブラウザバックが効く**: 「さっきの検索条件」に戻るボタンで戻れる

逆に useState だけで持った絞り込み状態は、リロードで消え、URL を共有しても伝わりません。

判断の目安はこうです。

| 状態 | 置き場所 |
|------|---------|
| 検索条件・フィルタ・ページ番号・タブの選択 | **URL（クエリ）** に置く価値が高い |
| 入力途中の文字・開閉中のメニュー | useState で十分 |

検索や絞り込みの実装は、意識しないと状態をすべて useState に置いた形になりがちです。「**この絞り込みは URL に乗せて、共有とリロードに耐えるように**」と一言指示できるのは、この違いを知っている人です。

## まとめ

- URL はスキーム・ホスト・パス・クエリ・フラグメントの部品でできている
- `?` はサーバーに届く追加の注文で、`#` はサーバーに届かないページ内の位置
- クエリの値のエンコードは URLSearchParams に任せる
- 共有・リロード・戻るに耐えさせたい状態は、useState ではなく URL に置く

<style>
.c84-demo {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px;
  margin: 1.2em 0;
  background: #f8fafc;
  color: #1e293b;
}
.c84-label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #475569;
  margin-bottom: 6px;
}
.c84-input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  font-size: 14px;
  font-family: monospace;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
  color: #1e293b;
}
.c84-input:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
.c84-out {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 16px;
  margin: 12px 0 0;
  font-size: 14px;
}
.c84-out dt {
  font-weight: 700;
  color: #475569;
}
.c84-out dd {
  margin: 0;
  font-family: monospace;
  color: #1e293b;
  word-break: break-all;
}
</style>
