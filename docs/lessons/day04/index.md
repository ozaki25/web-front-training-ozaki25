# Day 4: カスタムフォーム UI — 見た目を変えてもアクセシビリティを保つ

## 今日のゴール

- デザイン上の要求でフォーム部品をカスタマイズする場面があることを知る
- ネイティブの input を捨てずに見た目だけ変えるアプローチを知る
- select やコンボボックスなど、自作が難しい部品があることを知る
- ヘッドレス UI ライブラリという解決策があることを知る

## なぜカスタマイズが必要になるのか

ブラウザに標準で備わっているフォーム部品 — チェックボックス、ラジオボタン、セレクトボックスなど — は、そのまま使えば機能としては十分です。キーボード操作もできるし、スクリーンリーダー（画面を音声で読み上げるソフト）にも対応しています。

ただし、**見た目はブラウザとOSが決めている**ため、デザイナーが作ったデザインとは一致しないことがほとんどです。たとえば Windows の Chrome と macOS の Safari ではチェックボックスの見た目が違います。色やサイズも CSS では細かく制御できない部分があります。

実務のプロジェクトでは「デザインカンプ（完成イメージの図）どおりの見た目にする」という要件がほぼ確実にあるため、フォーム部品のカスタマイズは避けて通れない作業です。

ここで問題になるのが、**見た目をカスタマイズしようとするとアクセシビリティが壊れやすい**ということです。今日はこの問題と、その解決策を見ていきます。

たとえば、チェックボックスとラジオボタンをカスタマイズするとこうなります。両方クリックして比べてみてください:

<style>
.demo-compare-sr-only { position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0 }
.demo-compare-cb { display:inline-flex;align-items:center;gap:10px;cursor:pointer;font-size:0.95em;padding:4px 8px;border-radius:6px;transition:background-color 0.15s }
.demo-compare-cb:hover { background-color:#f1f5f9 }
.demo-compare-cb-visual { display:inline-block;width:24px;height:24px;border:2px solid #cbd5e1;border-radius:6px;background:white;transition:all 0.2s;position:relative;flex-shrink:0;box-shadow:0 1px 2px rgba(0,0,0,0.05) }
.demo-compare-sr-only:checked + .demo-compare-cb-visual { background:linear-gradient(135deg,#3b82f6,#2563eb);border-color:#2563eb;box-shadow:0 1px 3px rgba(37,99,235,0.3) }
.demo-compare-sr-only:checked + .demo-compare-cb-visual::after { content:'';position:absolute;top:3px;left:7px;width:6px;height:11px;border:solid white;border-width:0 2.5px 2.5px 0;transform:rotate(45deg) }
.demo-compare-radio { display:inline-flex;align-items:center;gap:10px;cursor:pointer;font-size:0.95em;padding:4px 8px;border-radius:6px;transition:background-color 0.15s }
.demo-compare-radio:hover { background-color:#f1f5f9 }
.demo-compare-radio-visual { display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border:2px solid #cbd5e1;border-radius:50%;background:white;transition:all 0.2s;flex-shrink:0;box-shadow:0 1px 2px rgba(0,0,0,0.05) }
.demo-compare-radio-visual::after { content:'';width:12px;height:12px;border-radius:50%;background:transparent;transition:all 0.2s;transform:scale(0) }
.demo-compare-sr-only:checked + .demo-compare-radio-visual { border-color:#2563eb;box-shadow:0 1px 3px rgba(37,99,235,0.3) }
.demo-compare-sr-only:checked + .demo-compare-radio-visual::after { background:linear-gradient(135deg,#3b82f6,#2563eb);transform:scale(1) }
</style>
<div style="display:flex;gap:48px;padding:24px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;flex-wrap:wrap;margin:16px 0;color:#1e293b">
<div>
<div style="font-weight:700;margin-bottom:12px;color:#64748b;font-size:0.85em;text-transform:uppercase;letter-spacing:0.05em">ブラウザ標準</div>
<div style="display:flex;flex-direction:column;gap:8px">
<label style="display:flex;align-items:center;gap:6px;font-size:0.95em"><input type="checkbox" checked> 利用規約に同意する</label>
<label style="display:flex;align-items:center;gap:6px;font-size:0.95em"><input type="checkbox"> メルマガを受け取る</label>
</div>
<div style="margin-top:16px;display:flex;flex-direction:column;gap:8px">
<label style="display:flex;align-items:center;gap:6px;font-size:0.95em"><input type="radio" name="demo-native-r" checked> ベーシック</label>
<label style="display:flex;align-items:center;gap:6px;font-size:0.95em"><input type="radio" name="demo-native-r"> プレミアム</label>
</div>
</div>
<div>
<div style="font-weight:700;margin-bottom:12px;color:#64748b;font-size:0.85em;text-transform:uppercase;letter-spacing:0.05em">カスタマイズ後</div>
<div style="display:flex;flex-direction:column;gap:8px">
<label class="demo-compare-cb"><input type="checkbox" class="demo-compare-sr-only" checked><span class="demo-compare-cb-visual"></span> 利用規約に同意する</label>
<label class="demo-compare-cb"><input type="checkbox" class="demo-compare-sr-only"><span class="demo-compare-cb-visual"></span> メルマガを受け取る</label>
</div>
<div style="margin-top:16px;display:flex;flex-direction:column;gap:8px">
<label class="demo-compare-radio"><input type="radio" name="demo-custom-r" class="demo-compare-sr-only" checked><span class="demo-compare-radio-visual"></span> ベーシック</label>
<label class="demo-compare-radio"><input type="radio" name="demo-custom-r" class="demo-compare-sr-only"><span class="demo-compare-radio-visual"></span> プレミアム</label>
</div>
</div>
</div>

左はブラウザが OS に合わせて描画したデフォルトの見た目で、右がデザインに合わせてカスタマイズしたものです。どちらもクリックで切り替わりますが、見た目の印象がまったく違います。

## 基本方針: ネイティブの input を捨てない

カスタマイズの王道は、**ネイティブの input 要素は残したまま、見た目だけを差し替える**というアプローチです。

仕組みはこうです:

1. 本物の `<input>` を**視覚的に隠す**（`display: none` ではなく、スクリーンリーダーからはアクセスできる方法で隠す）
2. 隣に置いた別の要素（`<span>` や `<label>` など）で見た目を作る
3. CSS の `:checked` 擬似クラスを使い、チェック状態に応じて見た目を切り替える

こうすれば、ブラウザから見れば普通の `<input>` なので、キーボード操作もフォーム送信もスクリーンリーダーもすべてそのまま動きます。

### ラジオボタン・チェックボックスのカスタマイズ例

以下はチェックボックスの見た目をカスタマイズする例です。

```html
<label class="custom-checkbox">
  <input type="checkbox" class="sr-only" name="agree" />
  <span class="checkbox-visual" aria-hidden="true"></span>
  利用規約に同意する
</label>
```

```css
/* スクリーンリーダー向けに視覚的に隠す（display: none とは違い、支援技術からは読める） */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.custom-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

/* カスタムの見た目 */
.checkbox-visual {
  width: 20px;
  height: 20px;
  border: 2px solid #6b7280;
  border-radius: 4px;
  background: white;
  transition: background-color 0.15s, border-color 0.15s;
}

/* input がチェックされたら隣の .checkbox-visual の見た目を変える */
.sr-only:checked + .checkbox-visual {
  background-color: #2563eb;
  border-color: #2563eb;
}

/* フォーカスが当たったときのスタイル（キーボード操作の視覚的フィードバック） */
.sr-only:focus-visible + .checkbox-visual {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
```

実際に動くデモです。クリックして切り替えてみてください:

<style>
.demo-sr-only { position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0 }
.demo-cb-label { display:inline-flex;align-items:center;gap:8px;cursor:pointer;font-size:0.95em;user-select:none }
.demo-cb-visual { display:inline-block;width:20px;height:20px;border:2px solid #94a3b8;border-radius:4px;background:white;transition:background-color 0.15s,border-color 0.15s;position:relative }
.demo-sr-only:checked + .demo-cb-visual { background-color:#2563eb;border-color:#2563eb }
.demo-sr-only:checked + .demo-cb-visual::after { content:'';position:absolute;top:2px;left:6px;width:5px;height:10px;border:solid white;border-width:0 2.5px 2.5px 0;transform:rotate(45deg) }
.demo-sr-only:focus-visible + .demo-cb-visual { outline:2px solid #2563eb;outline-offset:2px }
</style>
<div style="padding:20px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;margin:16px 0;display:flex;flex-direction:column;gap:10px;color:#1e293b">
<label class="demo-cb-label"><input type="checkbox" class="demo-sr-only" checked><span class="demo-cb-visual"></span> 利用規約に同意する</label>
<label class="demo-cb-label"><input type="checkbox" class="demo-sr-only"><span class="demo-cb-visual"></span> メルマガを受け取る</label>
<label class="demo-cb-label"><input type="checkbox" class="demo-sr-only"><span class="demo-cb-visual"></span> お知らせを受け取る</label>
</div>

ポイントは以下の 3 つです:

- **`<input>` は消さず、`sr-only` で視覚的に隠している** — `display: none` や `visibility: hidden` で隠すとスクリーンリーダーからも消えてしまいます。`sr-only`（Tailwind CSS にも同名のクラスがあります）は「目には見えないがスクリーンリーダーからはアクセスできる」隠し方です
- **`:checked` 擬似クラスで状態を反映** — ユーザーがクリックやキー操作でチェックすると、CSS だけで見た目が切り替わります
- **`:focus-visible` でフォーカスリングを表示** — キーボード操作で Tab キーを使って移動したとき、どの要素にフォーカスがあるか目に見えるようにしています

ラジオボタンも同じ考え方で、`border-radius: 50%` にして丸くするだけです。

## div で作り直すのはアンチパターン

「見た目を自由にしたいなら、`<div>` と JavaScript でゼロから作ればいいのでは？」と思うかもしれません。しかし、これは**アンチパターン**（やってはいけないパターン）です。

たとえば、こんなコードを書いたとします:

```html
<!-- ❌ div でチェックボックスを「自作」した例 -->
<div class="fake-checkbox" onclick="toggle()">
  <div class="checkmark">✓</div>
</div>
<span>利用規約に同意する</span>
```

見た目はチェックボックスに見えるかもしれませんが、以下のすべてが壊れます:

| 機能 | ネイティブ input | div 自作 |
|------|:---:|:---:|
| クリックで切り替え | 動く | 自前で実装が必要 |
| キーボード（Space キー）で切り替え | 動く | 動かない |
| Tab キーでフォーカス移動 | 動く | 動かない |
| スクリーンリーダーが「チェックボックス」と読み上げ | 読む | 読まない |
| `<form>` 送信で値が送られる | 送られる | 送られない |
| ブラウザの自動入力 | 対応 | 非対応 |

`role="checkbox"` や `tabindex="0"` 、`aria-checked` 、キーボードイベント処理...と、1 つずつ自前で実装すれば理論上は再現できます。しかし、完璧に再現するのは非常に難しく、しかもブラウザがタダで提供してくれる機能をわざわざ作り直しているだけです。

**ネイティブの要素を使い、見た目だけ CSS で変える。** これが基本方針です。

## select とコンボボックスは別格

チェックボックスやラジオボタンは「隠して見た目を被せる」方法でうまくいきます。ところが、**`<select>`（ドロップダウン）は話が別**です。

`<select>` のドロップダウン部分（選択肢のリスト）は、ブラウザが OS のネイティブ UI を使って描画しています。この部分は CSS ではほぼカスタマイズできません。色を変える、アイコンを付ける、検索機能を追加する — こうしたことをやろうとすると、結局 `<div>` でゼロから組み立てることになります。

さらに厄介なのが**コンボボックス**（テキスト入力 + ドロップダウンを組み合わせた UI）です。WAI-ARIA（Web Accessibility Initiative - Accessible Rich Internet Applications、Web のアクセシビリティ仕様）の Combobox パターンで求められる振る舞いは膨大です:

- テキスト入力で選択肢をフィルタリング
- 上下キーで選択肢を移動、Enter で確定
- `aria-expanded`、`aria-activedescendant`、`role="listbox"` などの ARIA 属性の管理
- Escape キーで閉じる
- 選択肢がない場合のメッセージ

これを自力で正しく実装するのは、経験豊富なエンジニアでも大変です。select やコンボボックスは「素朴なカスタマイズ」が通用しない、難易度の高い部品だと覚えておきましょう。

標準の `<select>` がどんな見た目か確認してみてください。CSS でスタイリングしても、ドロップダウン部分はブラウザ任せです:

<div style="padding:20px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;margin:16px 0;color:#1e293b">
<label for="demo-native-select" style="display:block;font-size:0.9em;font-weight:600;margin-bottom:6px">プランを選択</label>
<select id="demo-native-select" style="padding:8px 12px;border:2px solid #cbd5e1;border-radius:6px;font-size:0.95em;min-width:200px;background:white;color:#1e293b">
<option value="basic">ベーシック</option>
<option value="premium">プレミアム</option>
<option value="enterprise">エンタープライズ</option>
</select>
<div style="margin-top:8px;font-size:0.8em;color:#64748b">↑ ボタン部分はある程度スタイリングできるが、ドロップダウン（選択肢リスト）はブラウザ任せ</div>
</div>

## カスタマイザブル `<select>` — これからの解決策

> **Baseline: Limited availability** — 2026 年 4 月時点では Chrome 系ブラウザのみ対応。本番投入には早い

`<select>` のスタイリング問題を**標準の仕組みで根本的に解決しよう**という動きが進んでいます。**カスタマイザブル `<select>`**（customizable select）と呼ばれる機能で、CSS の `appearance: base-select` を指定するだけで、閉じている状態も開いている状態も、選択肢ひとつひとつまで自由にスタイリングできるようになります。

```html
<label for="plan">プラン</label>
<select id="plan" name="plan">
  <button>
    <selectedcontent></selectedcontent>
  </button>
  <option value="basic">ベーシック</option>
  <option value="premium">プレミアム</option>
  <option value="enterprise">エンタープライズ</option>
</select>
```

```css
select {
  appearance: base-select;
}

/* 閉じているときのボタン部分 */
select::picker(select) {
  /* ドロップダウン全体のスタイル */
}

/* 選択肢ひとつひとつ */
option {
  /* アイコンや余白を自由に */
}
```

ポイントはこうです:

- **ネイティブの `<select>` のまま使える**: キーボード操作、フォーム送信、スクリーンリーダー対応はすべて維持される
- **`<selectedcontent>`** で選択中の値の見た目をカスタマイズできる
- **`<option>` にアイコンや画像を入れられる**: 従来の `<select>` では不可能だったリッチな選択肢が作れる
- **ドロップダウンを開いた状態も CSS で制御できる**: 背景色、影、アニメーションなどが自由

Chrome 系ブラウザで見ている方は、以下のデモで実際に動作を確認できます（Safari / Firefox では通常の `<select>` として表示されます）:

<style>
.demo-base-select select { appearance:base-select;padding:8px 12px;border:2px solid #cbd5e1;border-radius:6px;font-size:0.95em;min-width:220px;background:white;color:#1e293b;cursor:pointer }
.demo-base-select select::picker(select) { border:1px solid #e2e8f0;border-radius:8px;padding:4px;box-shadow:0 4px 12px rgba(0,0,0,0.1) }
.demo-base-select option { padding:8px 12px;border-radius:4px }
.demo-base-select option:hover { background-color:#eff6ff }
.demo-base-select option:checked { font-weight:600;background-color:#dbeafe }
</style>
<div class="demo-base-select" style="padding:20px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;margin:16px 0;color:#1e293b">
<label for="demo-custom-select" style="display:block;font-size:0.9em;font-weight:600;margin-bottom:6px">プランを選択</label>
<select id="demo-custom-select">
<option value="basic">🟢 ベーシック — 月額 980 円</option>
<option value="premium">🔵 プレミアム — 月額 1,980 円</option>
<option value="enterprise">🟣 エンタープライズ — 月額 4,980 円</option>
</select>
<div style="margin-top:8px;font-size:0.8em;color:#64748b">↑ Chrome 系ブラウザでは、ドロップダウンもスタイリングされて表示される</div>
</div>

ただし、2026 年 4 月時点では Chrome 系ブラウザのみの対応で、Safari / Firefox はまだ実装中です。Baseline は Limited availability の段階なので、**現時点では本番で使うには早い**というのが正直なところです。

## 現時点での現実解

カスタマイザブル `<select>` は将来の解決策ですが、今日のプロジェクトでは使えません。現時点で select やコンボボックスをカスタマイズするなら、次のどちらかが現実解になります。

1. **ヘッドレス UI ライブラリを使う**（後述）
2. **見た目で妥協して標準の `<select>` を使う**

「いずれネイティブで解決される方向に標準化が進んでいる」ことは頭に入れつつ、今のプロジェクトではライブラリに頼る、という判断ができるようになっておきましょう。

## 画像選択などの特殊な UI

フォーム部品のカスタマイズは、ラジオボタンやチェックボックスだけではありません。実務ではこんな UI もよく見かけます:

### カード型のラジオボタン

プランを選ぶ画面で、カード全体がラジオボタンになっている UI です。

```html
<fieldset>
  <legend>プランを選択してください</legend>

  <label class="plan-card">
    <input type="radio" name="plan" value="basic" class="sr-only" />
    <div class="plan-card-content">
      <strong>ベーシック</strong>
      <p>月額 980 円</p>
    </div>
  </label>

  <label class="plan-card">
    <input type="radio" name="plan" value="premium" class="sr-only" />
    <div class="plan-card-content">
      <strong>プレミアム</strong>
      <p>月額 1,980 円</p>
    </div>
  </label>
</fieldset>
```

仕組みは先ほどのチェックボックスと同じです。`<input type="radio">` を視覚的に隠し、`<label>` で囲んだカード全体をクリック可能にしています。`<fieldset>` と `<legend>` でグループ名（「プランを選択してください」）をスクリーンリーダーに伝えています。

実際に動くデモです。カードをクリックして切り替えてみてください:

<style>
.demo-card-radio input { position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0 }
.demo-card-radio label { display:block;padding:16px 20px;border:2px solid #e2e8f0;border-radius:8px;cursor:pointer;transition:border-color 0.15s,box-shadow 0.15s;background:white;color:#1e293b }
.demo-card-radio label:hover { border-color:#93c5fd }
.demo-card-radio input:checked + label { border-color:#2563eb;box-shadow:0 0 0 1px #2563eb }
.demo-card-radio input:focus-visible + label { outline:2px solid #2563eb;outline-offset:2px }
</style>
<fieldset class="demo-card-radio" style="border:none;padding:0;margin:16px 0">
<legend style="font-weight:700;margin-bottom:12px;font-size:0.95em;color:var(--vp-c-text-1)">プランを選択してください</legend>
<div style="display:flex;gap:12px;flex-wrap:wrap">
<div style="flex:1;min-width:140px"><input type="radio" name="demo-plan-card" id="demo-plan-basic" value="basic" checked><label for="demo-plan-basic"><strong>ベーシック</strong><br><span style="color:#64748b;font-size:0.9em">月額 980 円</span></label></div>
<div style="flex:1;min-width:140px"><input type="radio" name="demo-plan-card" id="demo-plan-premium" value="premium"><label for="demo-plan-premium"><strong>プレミアム</strong><br><span style="color:#64748b;font-size:0.9em">月額 1,980 円</span></label></div>
<div style="flex:1;min-width:140px"><input type="radio" name="demo-plan-card" id="demo-plan-enterprise" value="enterprise"><label for="demo-plan-enterprise"><strong>エンタープライズ</strong><br><span style="color:#64748b;font-size:0.9em">月額 4,980 円</span></label></div>
</div>
</fieldset>

### ファイル選択のカスタムUI

`<input type="file">` も見た目のカスタマイズが難しい要素です。よく使われる方法は:

```html
<label class="file-upload-button">
  <input type="file" class="sr-only" accept="image/*" />
  <span>画像をアップロード</span>
</label>
```

ネイティブのファイル選択ダイアログはそのまま使いつつ、トリガーとなるボタンの見た目だけを変えるアプローチです。

<style>
.demo-file-sr-only { position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0 }
.demo-file-button { display:inline-flex;align-items:center;gap:8px;padding:10px 20px;background:linear-gradient(135deg,#3b82f6,#2563eb);color:white;border-radius:8px;cursor:pointer;font-size:0.95em;font-weight:600;transition:opacity 0.15s;box-shadow:0 1px 3px rgba(37,99,235,0.3) }
.demo-file-button:hover { opacity:0.9 }
</style>
<div style="display:flex;gap:32px;align-items:start;flex-wrap:wrap;padding:20px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;margin:16px 0;color:#1e293b">
<div>
<div style="font-size:0.8em;color:#64748b;margin-bottom:6px">ブラウザ標準</div>
<input type="file" accept="image/*">
</div>
<div>
<div style="font-size:0.8em;color:#64748b;margin-bottom:6px">カスタマイズ後</div>
<label class="demo-file-button"><input type="file" class="demo-file-sr-only" accept="image/*"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> 画像をアップロード</label>
</div>
</div>

## ヘッドレス UI ライブラリ

ここまで見てきたように、チェックボックスやラジオボタンは CSS で対応できますが、select やコンボボックスのように「ゼロから組む必要がある」部品も存在します。そこで登場するのが**ヘッドレス UI ライブラリ**です。

「ヘッドレス（headless）」とは「見た目（head）がない」という意味です。**アクセシビリティとキーボード操作のロジックだけを提供し、見た目は開発者が自由に作る**という設計思想を持ったライブラリの総称です。たとえば React Aria（Adobe が開発）のようなライブラリがあります。

こうしたライブラリを使うと、select のような複雑な部品でも、開発者はスタイリングに集中できます。キーボード操作（上下キーで移動、Enter で選択、Escape で閉じる）、ARIA 属性の管理、フォーカス制御 — こうしたアクセシビリティに関わる複雑な処理は、すべてライブラリが裏側で面倒を見てくれます。

「見た目は CSS で自由に作り、振る舞いとアクセシビリティはライブラリに任せる」という分担を覚えておきましょう。

## まとめ

- ブラウザ標準のフォーム部品はデザイン要件に合わないことが多く、カスタマイズは実務でほぼ必須
- **基本方針はネイティブの input を残し、見た目だけを CSS で変えること。** `sr-only` で視覚的に隠し、`:checked` や `:focus-visible` で状態を反映する
- `<div>` でフォーム部品をゼロから作り直すと、キーボード操作・スクリーンリーダー対応・フォーム送信がすべて壊れる
- `<select>` やコンボボックスは CSS だけではカスタマイズできず、自作の難易度が非常に高い
- カスタマイザブル `<select>`（`appearance: base-select`）という標準化の動きがあり、将来的にはネイティブの `<select>` を自由にスタイリングできるようになる。ただし 2026 年 4 月時点では Chrome 系のみ対応で、本番投入には早い
- 現時点での現実解は、React Aria のようなヘッドレス UI ライブラリに頼ること。アクセシビリティのロジックを提供し、見た目だけ自分で作ればよい状態にしてくれる
