# Day 5: HTML だけで作れる UI — dialog, popover, details

## 今日のゴール

- モーダルダイアログ、折りたたみ、ポップオーバーに専用の HTML 要素があることを知る
- これらの HTML 要素がアクセシビリティやキーボード操作を自動で処理してくれることを知る
- 新しい HTML 機能を使うときの判断基準（Baseline）を知る

## よく見る UI パーツには専用の HTML 要素がある

普段使っている Web サイトで、こんな UI を見たことがあるはずです:

- 確認画面やログインフォームが画面の上に重なって表示される**モーダルダイアログ**
- FAQ ページなどの、クリックすると開閉する**折りたたみ**
- ボタンを押すとヘルプやメニューが浮き上がる**ポップオーバー**

こうした UI には専用の HTML 要素が用意されています。専用要素を使うとキーボード操作やスクリーンリーダー対応が自動で付いてくるため、JavaScript でゼロから作るより少ないコードで、品質の高い UI が作れます。

AI にこうした UI を頼むと、専用要素を使わずに JavaScript ベースで返ってくることがあります。HTML の要素名を知っていれば、「`<dialog>` を使って」のように的確に指示できます。

## 新しい HTML 機能と Baseline

HTML には今も新しい要素や属性が追加されています。ただし、すべてのブラウザですぐに使えるとは限りません。

その判断基準になるのが **Baseline** です。Chrome・Safari・Firefox・Edge の対応状況をもとに、3 段階で分類されています。

| ステータス | 意味 |
|-----------|------|
| **Limited availability** | 一部のブラウザでしか使えない。本番投入には慎重に |
| **Newly available** | 主要ブラウザすべてで対応して 30 ヶ月未満。基本的に本番で使える |
| **Widely available** | 主要ブラウザすべてで対応して 30 ヶ月以上。安心して使える |

MDN の各ページや [web.dev/baseline](https://web.dev/baseline) で確認できます。今日紹介する 3 つの機能はすべて主要ブラウザで使えます。

## dialog — モーダルダイアログ

> **Baseline: Widely available**

確認画面、ログインフォーム、設定パネルなど、画面の上に重なって表示され、閉じるまで背後を操作できなくする UI を**モーダルダイアログ**と呼びます。

まずはデモを試してみてください。背景が暗くなり、Escape キーや「キャンセル」で閉じられます:

<style>
.demo-dialog { border:1px solid #e2e8f0;border-radius:16px;padding:32px;max-width:480px;width:90vw;box-shadow:0 8px 30px rgba(0,0,0,0.12);color:#1e293b;background:white }
.demo-dialog::backdrop { background-color:rgba(0,0,0,0.5) }
.demo-dialog h3 { margin:0 0 12px;font-size:1.25em }
.demo-dialog p { margin:0 0 24px;color:#475569;font-size:1em;line-height:1.7 }
.demo-dialog-actions { display:flex;gap:12px;justify-content:flex-end }
.demo-dialog-actions button { padding:10px 24px;border-radius:8px;border:none;cursor:pointer;font-size:0.95em;font-weight:600 }
.demo-dialog-cancel { background:#f1f5f9;color:#475569 }
.demo-dialog-cancel:hover { background:#e2e8f0 }
.demo-dialog-confirm { background:#2563eb;color:white }
.demo-dialog-confirm:hover { background:#1d4ed8 }
</style>
<div style="padding:20px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;margin:16px 0;color:#1e293b">
<button type="button" onclick="document.getElementById('demo-modal').showModal()" style="padding:10px 20px;background:linear-gradient(135deg,#3b82f6,#2563eb);color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.95em;font-weight:600">ダイアログを開く</button>
</div>
<dialog id="demo-modal" class="demo-dialog">
<h3>プランを変更しますか？</h3>
<p>現在のプラン「ベーシック」から「プレミアム」に変更します。次回の請求から新しい料金が適用されます。</p>
<div class="demo-dialog-actions">
<button type="button" onclick="document.getElementById('demo-modal').close()" class="demo-dialog-cancel">キャンセル</button>
<button type="button" onclick="document.getElementById('demo-modal').close()" class="demo-dialog-confirm">変更する</button>
</div>
</dialog>

モーダルを JavaScript でゼロから作ろうとすると、考慮すべきことが多くなります:

- 背景を暗くするオーバーレイ
- 背後のスクロールを止める
- フォーカスをダイアログ内に閉じ込める（フォーカストラップ）
- Escape キーで閉じる
- スクリーンリーダーへの通知

`<dialog>` 要素の `showModal()` を使えば、これらがすべて自動で処理されます。

```html
<button id="open-btn" type="button">ダイアログを開く</button>

<dialog id="my-dialog">
  <h2>確認</h2>
  <p>この操作を実行しますか？</p>
  <div>
    <button type="button" onclick="this.closest('dialog').close()">キャンセル</button>
    <button type="button" onclick="this.closest('dialog').close()">実行する</button>
  </div>
</dialog>

<script>
  document.getElementById("open-btn").addEventListener("click", () => {
    document.getElementById("my-dialog").showModal();
  });
</script>
```

`showModal()` で開き、`close()` で閉じます。これだけで以下がすべて自動的に提供されます。

| 機能 | 動作 |
|------|------|
| 背景のオーバーレイ | `::backdrop` で CSS スタイルを適用できる |
| フォーカストラップ | Tab キーの移動がダイアログ内に閉じ込められる |
| Escape キーで閉じる | デフォルトで対応 |
| スクリーンリーダー | `role="dialog"` が自動付与される |
| 背後のスクロール防止 | モーダルが開いている間、背後はスクロールできない |

## details / summary — 折りたたみ

> **Baseline: Widely available**

FAQ ページなどでよく見る、クリックすると内容が展開されるアコーディオン UI です。

クリックして開閉してみてください:

<div style="padding:20px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;margin:16px 0;color:#1e293b">
<details style="border:1px solid #e2e8f0;border-radius:6px;margin-bottom:8px;background:white">
<summary style="padding:12px 16px;cursor:pointer;font-weight:600;font-size:0.95em;display:block;list-style-position:inside">Q. 返品はできますか？</summary>
<p style="padding:0 16px 12px;margin:0;color:#475569;font-size:0.9em">商品到着後7日以内であれば、未使用品に限り返品を承ります。返品をご希望の場合は、カスタマーサポートまでご連絡ください。</p>
</details>
<details style="border:1px solid #e2e8f0;border-radius:6px;margin-bottom:8px;background:white">
<summary style="padding:12px 16px;cursor:pointer;font-weight:600;font-size:0.95em;display:block;list-style-position:inside">Q. 送料はいくらですか？</summary>
<p style="padding:0 16px 12px;margin:0;color:#475569;font-size:0.9em">全国一律550円です。5,000円以上のお買い上げで送料無料になります。</p>
</details>
<details open style="border:1px solid #e2e8f0;border-radius:6px;background:white">
<summary style="padding:12px 16px;cursor:pointer;font-weight:600;font-size:0.95em;display:block;list-style-position:inside">Q. 支払い方法は何がありますか？</summary>
<p style="padding:0 16px 12px;margin:0;color:#475569;font-size:0.9em">クレジットカード、銀行振込、コンビニ払いに対応しています。</p>
</details>
</div>

JavaScript は一切不要です。ブラウザがキーボード操作やスクリーンリーダー対応もすべて処理します。

```html
<details>
  <summary>Q. 返品はできますか？</summary>
  <p>商品到着後7日以内であれば返品可能です。</p>
</details>
```

- `<details>` が折りたたみ領域全体
- `<summary>` がクリック可能な見出し
- `open` 属性を付けると最初から展開された状態になる

### name 属性で排他的アコーディオン

複数の `<details>` に同じ `name` 属性を付けると、1 つ開くと他が自動的に閉じる排他的なアコーディオンになります。JavaScript は不要です。

1 つ開くと、前に開いていたものが自動で閉じます:

<div style="padding:20px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;margin:16px 0;color:#1e293b">
<details name="demo-faq" style="border:1px solid #e2e8f0;border-radius:6px;margin-bottom:8px;background:white">
<summary style="padding:12px 16px;cursor:pointer;font-weight:600;font-size:0.95em;display:block;list-style-position:inside">Q. 返品はできますか？</summary>
<p style="padding:0 16px 12px;margin:0;color:#475569;font-size:0.9em">商品到着後7日以内であれば返品可能です。</p>
</details>
<details name="demo-faq" style="border:1px solid #e2e8f0;border-radius:6px;margin-bottom:8px;background:white">
<summary style="padding:12px 16px;cursor:pointer;font-weight:600;font-size:0.95em;display:block;list-style-position:inside">Q. 送料はいくらですか？</summary>
<p style="padding:0 16px 12px;margin:0;color:#475569;font-size:0.9em">全国一律550円です。</p>
</details>
<details name="demo-faq" style="border:1px solid #e2e8f0;border-radius:6px;background:white">
<summary style="padding:12px 16px;cursor:pointer;font-weight:600;font-size:0.95em;display:block;list-style-position:inside">Q. 支払い方法は？</summary>
<p style="padding:0 16px 12px;margin:0;color:#475569;font-size:0.9em">クレジットカード、銀行振込、コンビニ払いに対応しています。</p>
</details>
</div>

```html
<details name="faq">
  <summary>Q. 返品はできますか？</summary>
  <p>商品到着後7日以内であれば返品可能です。</p>
</details>

<details name="faq">
  <summary>Q. 送料はいくらですか？</summary>
  <p>全国一律550円です。</p>
</details>
```

同じ `name="faq"` を持つ `<details>` は、1 つを開くと他が自動的に閉じます。

## popover — ポップオーバー

> **Baseline: Newly available**（2024 年に主要ブラウザで対応）

ヘルプやメニューなど、ボタンを押すと浮き上がって表示される UI です。dialog と違い、背後の操作はブロックしません。

ボタンを押してみてください:

<style>
.demo-popover-content { padding:20px;border-radius:12px;border:1px solid #e2e8f0;box-shadow:0 8px 24px rgba(0,0,0,0.12);color:#1e293b;background:white;font-size:0.9em;max-width:280px;margin:auto }
</style>
<div style="padding:20px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;margin:16px 0;color:#1e293b">
<button popovertarget="demo-popover" type="button" style="padding:10px 20px;background:linear-gradient(135deg,#3b82f6,#2563eb);color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.95em;font-weight:600">💡 ヒント</button>
<div id="demo-popover" popover class="demo-popover-content">
<p style="margin:0 0 8px;font-weight:600">ヒント</p>
<p style="margin:0;color:#475569">ここにヒントの内容が表示されます。外側をクリックするか Escape キーで閉じます。</p>
</div>
</div>

```html
<button popovertarget="help-popup" type="button">ヘルプ</button>

<div id="help-popup" popover>
  <p>ここにヘルプの内容が表示されます。</p>
</div>
```

`popover` 属性を付けた要素は最初は非表示で、`popovertarget` で紐付けたボタンをクリックすると表示されます。

| 機能 | 説明 |
|------|------|
| **light dismiss** | 外側をクリックすると自動的に閉じる |
| **Escape キー** | Escape キーでも閉じる |
| **トップレイヤー** | `z-index` を気にせず常に最前面に表示される |
| **トグル動作** | ボタンを再度クリックすると閉じる |

### dialog と popover の使い分け

どちらも「浮き上がって表示される UI」ですが、用途が異なります。

| | dialog（showModal） | popover |
|------|---------------------|---------|
| 背後の操作 | ブロックする | ブロックしない |
| 閉じ方 | 明示的に閉じる操作が必要 | 外側クリックで閉じる |
| 用途 | 確認、ログイン、設定パネル | ツールチップ、メニュー、通知 |

「ユーザーに操作を求める」なら dialog、「補助的な情報を表示する」なら popover です。

## まとめ

- `<dialog>`: `showModal()` でモーダルダイアログが作れる。フォーカストラップ、Escape 対応、背景暗転が自動
- `<details>` / `<summary>`: JavaScript なしで折りたたみが作れる。`name` 属性で排他制御も可能
- `popover` 属性: ポップオーバーが作れる。外側クリックで閉じる、常に最前面に表示
- 新しい HTML 機能を使うときは **Baseline** で対応状況を確認する
- AI はこれらを使わず JavaScript ベースで実装することがある。要素名を知っていれば的確に指示できる
