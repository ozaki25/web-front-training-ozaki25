# Day 5: HTML だけで作れる UI — dialog, popover, details

## 今日のゴール

- HTML が今も進化し続けている技術であることを知る
- `<dialog>`、`<details>`/`<summary>`、`popover` 属性の役割と利点を知る
- 「HTML で解決できることは HTML で解決する」という原則を知る

## HTML は「完成した技術」ではない

ここまでのレッスンで HTML の基本を学んできました。「HTML は昔からある技術だし、もう完成しているのでは？」と思うかもしれません。

実は HTML は今も進化し続けています。以前は JavaScript でゴリゴリ実装する必要があった UI パーツが、HTML の新しい要素や属性だけで実現できるようになってきています。

HTML で実現できるなら JavaScript を減らせます。そして、HTML ネイティブの要素は**アクセシビリティのサポートが最初から組み込まれている**ことが多いです。今日は 3 つの新しい機能を見ていきましょう。

## 使う前に: Baseline で対応状況を確認する

新しい HTML 機能を使うときに気になるのが「本番で使って大丈夫なのか」です。この判断を助けてくれる目安が **Baseline** です。

Baseline は Chrome / Safari / Firefox / Edge の主要ブラウザでの対応状況をもとに、3 段階で機能を分類します。

| ステータス | 意味 |
|-----------|------|
| **Limited availability** | 一部のブラウザでしか使えない。本番投入には慎重に |
| **Newly available** | 主要ブラウザすべてで使えるようになって **30 ヶ月未満**。基本的に本番で使える |
| **Widely available** | 主要ブラウザすべてで使えるようになって **30 ヶ月以上**。安心して使える目安 |

MDN の各ページや [web.dev/baseline](https://web.dev/baseline) で確認できます。今日紹介する 3 つはすべて主要ブラウザで動くので、本番で使えます。

| 機能 | Baseline |
|------|----------|
| `<dialog>` | Widely available |
| `<details>` / `<summary>` | Widely available |
| `popover` 属性 | Newly available |

## dialog 要素 — HTML だけでモーダルが作れる

> **Baseline: Widely available** — 2022 年に主要ブラウザすべてで対応済み

**モーダルダイアログ**（modal dialog）とは、画面の上に重なって表示され、閉じるまで背後のコンテンツを操作できなくするUI パーツです。「本当に削除しますか？」のような確認ダイアログや、ログインフォームのポップアップでよく使われます。

### モーダルを JavaScript で自作すると大変

モーダルを JavaScript で自作する場合、以下をすべて自分で実装する必要があります。

- 背景を暗くするオーバーレイの表示
- 背後のコンテンツのスクロールを止める
- フォーカスをモーダル内に閉じ込める（**フォーカストラップ**）
- Escape キーで閉じる
- スクリーンリーダーに「ダイアログが開いた」と伝える

これを正しく実装するのは難しく、特にフォーカストラップとアクセシビリティ対応は見落としがちです。

### dialog 要素なら自動で対応

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>dialog 要素のデモ</title>
    <style>
      dialog {
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 24px;
        max-width: 400px;
      }

      dialog::backdrop {
        background-color: rgba(0, 0, 0, 0.5);
      }
    </style>
  </head>
  <body>
    <h1>dialog 要素のデモ</h1>
    <button id="open-btn" type="button">ダイアログを開く</button>

    <dialog id="my-dialog">
      <h2>確認</h2>
      <p>この操作を実行しますか？</p>
      <form method="dialog">
        <button type="submit" value="cancel">キャンセル</button>
        <button type="submit" value="confirm">実行する</button>
      </form>
    </dialog>

    <script>
      const dialog = document.getElementById("my-dialog");
      const openBtn = document.getElementById("open-btn");

      openBtn.addEventListener("click", () => {
        dialog.showModal(); // モーダルとして開く
      });
    </script>
  </body>
</html>
```

`dialog.showModal()` を呼ぶだけで、以下がすべて**自動的に**提供されます。

| 機能 | 動作 |
|------|------|
| 背景のオーバーレイ | `::backdrop` 擬似要素で CSS スタイルを適用できる |
| フォーカストラップ | Tab キーでの移動がダイアログ内に閉じ込められる |
| Escape キーで閉じる | デフォルトで Escape キーに対応 |
| アクセシビリティ | スクリーンリーダーに `role="dialog"` が自動付与される |
| 背後のスクロール防止 | モーダルが開いている間、背後はスクロールできない |

`<form method="dialog">` 内のボタンを押すとダイアログが自動的に閉じます。`value` 属性の値が `dialog.returnValue` で取得でき、どのボタンが押されたかを判別できます。

実際に試してみてください。背景が暗くなり、Escape キーや「キャンセル」で閉じられます:

<style>
.demo-dialog { border:1px solid #e2e8f0;border-radius:12px;padding:24px;max-width:360px;box-shadow:0 8px 30px rgba(0,0,0,0.12);color:#1e293b }
.demo-dialog::backdrop { background-color:rgba(0,0,0,0.5) }
.demo-dialog h3 { margin:0 0 8px;font-size:1.1em }
.demo-dialog p { margin:0 0 16px;color:#475569;font-size:0.95em }
.demo-dialog-actions { display:flex;gap:8px;justify-content:flex-end }
.demo-dialog-actions button { padding:8px 16px;border-radius:6px;border:none;cursor:pointer;font-size:0.9em;font-weight:600 }
.demo-dialog-cancel { background:#f1f5f9;color:#475569 }
.demo-dialog-cancel:hover { background:#e2e8f0 }
.demo-dialog-confirm { background:#2563eb;color:white }
.demo-dialog-confirm:hover { background:#1d4ed8 }
</style>
<div style="padding:20px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;margin:16px 0">
<button type="button" onclick="document.getElementById('demo-modal').showModal()" style="padding:10px 20px;background:linear-gradient(135deg,#3b82f6,#2563eb);color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.95em;font-weight:600">ダイアログを開く</button>
</div>
<dialog id="demo-modal" class="demo-dialog">
<h3>確認</h3>
<p>この操作を実行しますか？</p>
<form method="dialog" class="demo-dialog-actions">
<button type="submit" value="cancel" class="demo-dialog-cancel">キャンセル</button>
<button type="submit" value="confirm" class="demo-dialog-confirm">実行する</button>
</form>
</dialog>

## details / summary — JS 不要のアコーディオン

> **Baseline: Widely available** — 主要ブラウザで古くから対応済み

**アコーディオン**（折りたたみ）は、クリックすると内容が展開される UI パーツです。FAQ ページなどでよく見かけます。

```html
<details>
  <summary>Q. 返品はできますか？</summary>
  <p>商品到着後7日以内であれば、未使用品に限り返品を承ります。返品をご希望の場合は、カスタマーサポートまでご連絡ください。</p>
</details>

<details>
  <summary>Q. 送料はいくらですか？</summary>
  <p>全国一律550円です。5,000円以上のお買い上げで送料無料になります。</p>
</details>

<details open>
  <summary>Q. 支払い方法は何がありますか？</summary>
  <p>クレジットカード、銀行振込、コンビニ払いに対応しています。</p>
</details>
```

- `<details>` が折りたたみ領域全体
- `<summary>` がクリック可能な見出し部分
- `<summary>` の外にある内容が、折りたたまれる本文
- `open` 属性を付けると、最初から展開された状態で表示される

JavaScript は一切不要です。ブラウザが展開/折りたたみの動作、キーボード操作（Enter キー / Space キー）、スクリーンリーダーへの状態通知（「折りたたまれています」/「展開されています」）をすべて処理します。

クリックして開閉してみてください:

<div style="padding:20px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;margin:16px 0;color:#1e293b">
<details style="border:1px solid #e2e8f0;border-radius:6px;margin-bottom:8px">
<summary style="padding:12px 16px;cursor:pointer;font-weight:600;font-size:0.95em">Q. 返品はできますか？</summary>
<p style="padding:0 16px 12px;margin:0;color:#475569;font-size:0.9em">商品到着後7日以内であれば、未使用品に限り返品を承ります。返品をご希望の場合は、カスタマーサポートまでご連絡ください。</p>
</details>
<details style="border:1px solid #e2e8f0;border-radius:6px;margin-bottom:8px">
<summary style="padding:12px 16px;cursor:pointer;font-weight:600;font-size:0.95em">Q. 送料はいくらですか？</summary>
<p style="padding:0 16px 12px;margin:0;color:#475569;font-size:0.9em">全国一律550円です。5,000円以上のお買い上げで送料無料になります。</p>
</details>
<details open style="border:1px solid #e2e8f0;border-radius:6px">
<summary style="padding:12px 16px;cursor:pointer;font-weight:600;font-size:0.95em">Q. 支払い方法は何がありますか？</summary>
<p style="padding:0 16px 12px;margin:0;color:#475569;font-size:0.9em">クレジットカード、銀行振込、コンビニ払いに対応しています。</p>
</details>
</div>

### name 属性でアコーディオングループを作る

複数の `<details>` に同じ `name` 属性を付けると、排他的なアコーディオン（1つ開くと他が閉じる）を実現できます。

```html
<details name="faq">
  <summary>Q. 返品はできますか？</summary>
  <p>商品到着後7日以内であれば返品可能です。</p>
</details>

<details name="faq">
  <summary>Q. 送料はいくらですか？</summary>
  <p>全国一律550円です。</p>
</details>

<details name="faq">
  <summary>Q. 支払い方法は？</summary>
  <p>クレジットカード、銀行振込、コンビニ払いに対応しています。</p>
</details>
```

同じ `name="faq"` を持つ `<details>` は、1つを開くと他が自動的に閉じます。JavaScript は不要です。

実際に試すと違いがわかります。1つ開くと、前に開いていたものが自動で閉じます:

<div style="padding:20px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;margin:16px 0;color:#1e293b">
<details name="demo-faq" style="border:1px solid #e2e8f0;border-radius:6px;margin-bottom:8px">
<summary style="padding:12px 16px;cursor:pointer;font-weight:600;font-size:0.95em">Q. 返品はできますか？</summary>
<p style="padding:0 16px 12px;margin:0;color:#475569;font-size:0.9em">商品到着後7日以内であれば返品可能です。</p>
</details>
<details name="demo-faq" style="border:1px solid #e2e8f0;border-radius:6px;margin-bottom:8px">
<summary style="padding:12px 16px;cursor:pointer;font-weight:600;font-size:0.95em">Q. 送料はいくらですか？</summary>
<p style="padding:0 16px 12px;margin:0;color:#475569;font-size:0.9em">全国一律550円です。</p>
</details>
<details name="demo-faq" style="border:1px solid #e2e8f0;border-radius:6px">
<summary style="padding:12px 16px;cursor:pointer;font-weight:600;font-size:0.95em">Q. 支払い方法は？</summary>
<p style="padding:0 16px 12px;margin:0;color:#475569;font-size:0.9em">クレジットカード、銀行振込、コンビニ払いに対応しています。</p>
</details>
</div>

## popover 属性 — ツールチップやドロップダウンの基盤

> **Baseline: Newly available** — 2024 年 4 月に主要ブラウザすべてで対応済み

**ポップオーバー**（popover）は、ボタンを押すと浮き上がって表示される UI パーツです。ツールチップ、ドロップダウンメニュー、通知パネルなどに使われます。

```html
<button popovertarget="help-popup" type="button">
  ヘルプ
</button>

<div id="help-popup" popover>
  <p>ここにヘルプの内容が表示されます。</p>
  <p>外側をクリックすると閉じます。</p>
</div>
```

`popover` 属性を付けた要素は、最初は非表示です。`popovertarget` 属性で紐付けたボタンをクリックすると表示されます。

ボタンを押してみてください。外側をクリックするか Escape キーで閉じます:

<style>
.demo-popover-content { padding:16px;border-radius:8px;border:1px solid #e2e8f0;box-shadow:0 4px 12px rgba(0,0,0,0.1);color:#1e293b;font-size:0.9em;max-width:280px }
</style>
<div style="padding:20px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;margin:16px 0">
<button popovertarget="demo-popover" type="button" style="padding:10px 20px;background:linear-gradient(135deg,#3b82f6,#2563eb);color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.95em;font-weight:600">ヘルプを表示</button>
<div id="demo-popover" popover class="demo-popover-content">
<p style="margin:0 0 8px;font-weight:600">ヘルプ</p>
<p style="margin:0;color:#475569">ここにヘルプの内容が表示されます。外側をクリックするか Escape キーで閉じます。</p>
</div>
</div>

### popover の便利な機能

| 機能 | 説明 |
|------|------|
| **light dismiss** | ポップオーバーの外側をクリックすると自動的に閉じる |
| **Escape キー** | Escape キーでも閉じる |
| **トップレイヤー** | `z-index` を気にせず、常に最前面に表示される |
| **トグル動作** | ボタンを再度クリックすると閉じる |

### dialog と popover の使い分け

似ているようで用途が異なります。

| 特徴 | dialog（showModal） | popover |
|------|---------------------|---------|
| 背後の操作 | ブロックする | ブロックしない |
| 閉じ方 | 明示的に閉じる操作が必要 | 外側クリックで閉じる（light dismiss） |
| 用途 | 確認ダイアログ、フォーム入力 | ツールチップ、メニュー、通知 |

`<dialog>` は「ユーザーに回答を求める」場面、`popover` は「補助的な情報を表示する」場面で使います。

## 「AI に指示するとき」の違い

ここまで学んだ要素を知っているかどうかで、AI への指示の精度が変わります。

```
❌ 知らない場合の指示:
「ポップアップで確認画面を出してください」
→ AI は div + JavaScript で独自実装するかもしれない

✅ 知っている場合の指示:
「dialog 要素の showModal() で確認ダイアログを実装してください」
→ AI はアクセシビリティが自動で付く正しい実装を返す
```

```
❌ 知らない場合の指示:
「FAQ をクリックで開閉できるようにしてください」
→ AI は JavaScript でアコーディオンを自作するかもしれない

✅ 知っている場合の指示:
「details/summary で FAQ のアコーディオンを作ってください」
→ AI は JS 不要でアクセシブルな実装を返す
```

HTML の新しい要素を知っていると、AI に対して「より良い選択肢」を指示できます。結果として、コード量が減り、アクセシビリティも向上します。

## まとめ

- HTML は完成した技術ではなく、今も新しい要素や属性が追加されている
- `<dialog>` 要素の `showModal()` でモーダルダイアログが作れる。フォーカストラップ、Escape キー対応、アクセシビリティが自動で付く
- `<details>` / `<summary>` でアコーディオンが JavaScript なしで実現できる。`name` 属性で排他的アコーディオンも可能
- `popover` 属性でツールチップやドロップダウンの基盤が作れる。light dismiss やトップレイヤー表示が自動で付く
- HTML で解決できることは HTML で解決する。コードが減り、アクセシビリティが向上する
- これらの要素を知っていれば、AI への指示がより的確になり、結果の品質が上がる
- 新しい機能を使うときは Baseline を確認する。今日紹介した 3 つはすべて主要ブラウザで使える

**次のレッスン**: [Day 6: CSS の基本と適用方法](/lessons/day06/)
