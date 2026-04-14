# Day 4: カスタムフォーム UI — 見た目を変えてもアクセシビリティを保つ

## 今日のゴール

- デザイン上の要求でフォーム部品をカスタマイズする場面があることを知る
- ネイティブの input を捨てずに見た目だけ変えるアプローチを知る
- select やコンボボックスなど、自作が難しい部品があることを知る
- ヘッドレス UI ライブラリという解決策があることを知る

## なぜカスタマイズが必要になるのか

フォーム部品を実務のプロジェクトでそのまま使えるか？ 答えは「見た目が合わない」です。

**フォーム部品の見た目はブラウザと OS が決めます。** デザインとは合わないことがほとんどです。実務では「デザイン通りの見た目にする」要件がほぼ確実にあります。

ただし、**見た目を変えるとアクセシビリティが壊れやすい**。これが今日のテーマです。

まずはデモで見比べてみてください:

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

どちらもクリックで切り替わりますが、見た目の印象がまったく違います。

## 基本方針: ネイティブの input を捨てない

**ネイティブの input を残したまま、見た目だけ差し替える**のが王道です。

やり方:

1. 本物の `<input>` を目に見えないように隠す
2. 隣に置いた要素で好きな見た目を作る
3. クリックやキー操作は裏の `<input>` が受け取る

`<input>` が裏にいるので、キーボード操作もフォーム送信もそのまま動きます。

注意点が 2 つ:

- **隠し方**: `display: none` だとスクリーンリーダー（画面読み上げソフト）からも消える。`sr-only` なら「見えないがアクセスできる」状態になる（Tailwind CSS にも同名のクラスあり）
- **フォーカスリング**: Tab 移動時にどこにフォーカスがあるか見える状態を維持する。上のデモで Tab を押すと青い枠線が出るのがそれ

ラジオボタンやカード型 UI、ファイル選択ボタンなども同じ考え方です。

## div で作り直すのはアンチパターン

`<div>` と JavaScript でゼロから作ればいいのでは？ **アンチパターン**です。

`<div>` で見た目だけ作ると、以下がすべて壊れます:

| 機能 | ネイティブ input | div 自作 |
|------|:---:|:---:|
| クリックで切り替え | 動く | 自前で実装が必要 |
| キーボード（Space キー）で切り替え | 動く | 動かない |
| Tab キーでフォーカス移動 | 動く | 動かない |
| スクリーンリーダーが「チェックボックス」と読み上げ | 読む | 読まない |
| `<form>` 送信で値が送られる | 送られる | 送られない |
| ブラウザの自動入力 | 対応 | 非対応 |

ブラウザが無料で提供してくれる機能を、わざわざ作り直しているだけです。自前で完璧に再現するのは非常に困難です。

**ネイティブの要素を使い、見た目だけ CSS で変える。** これが鉄則です。

## select とコンボボックスは別格

チェックボックスやラジオボタンは「隠して被せる」でうまくいきます。**`<select>` は話が別**です。

ドロップダウン部分は OS のネイティブ UI です。CSS ではほぼカスタマイズできません。

**コンボボックス**（テキスト入力 + ドロップダウン）はさらに厄介です。求められる振る舞いが多すぎます:

- キーボード操作（上下キーで移動、Enter で選択、Escape で閉じる）
- ARIA 属性の管理
- フォーカス制御

経験豊富なエンジニアでも自力実装は大変です。

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

select のカスタマイズ問題を根本的に解決する**カスタマイザブル `<select>`** が標準化中です。

- CSS で `appearance: base-select` を指定するだけ
- ドロップダウンも選択肢もすべてスタイリングできる
- ネイティブの `<select>` のまま。キーボード操作もフォーム送信もそのまま

Chrome 系ブラウザならデモで確認できます（Safari / Firefox では通常の `<select>`）:

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

ただし 2026 年 4 月時点では Chrome 系のみ対応。**本番投入にはまだ早い**段階です。

## 現時点での現実解

カスタマイザブル `<select>` はまだ本番では使えません。現実解は 2 つ:

- **ヘッドレス UI ライブラリを使う**（後述）
- **見た目で妥協して標準の `<select>` を使う**

「いずれネイティブで解決される」と知りつつ、今はライブラリに頼る。この判断ができれば OK です。

## 応用例

「input を隠して見た目を被せる」はいろいろな UI に応用できます。

### カード型のラジオボタン

`<input type="radio">` を隠して、カード全体をクリック可能にした例です。

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

### ファイル選択

`<input type="file">` もボタンの見た目だけ変えられます。ファイル選択ダイアログ自体はネイティブのままです。

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

select のように CSS だけでは対応できない部品もあります。そこで使うのが**ヘッドレス UI ライブラリ**です。

「ヘッドレス」= 見た目がない。役割分担はこうです:

- **ライブラリ**: キーボード操作、ARIA 属性の管理、フォーカス制御
- **開発者**: 見た目（CSS）

React Aria（Adobe 製）などを使えば、スタイリングだけに集中できます。

**振る舞いはライブラリ、見た目は自分。** この分担を覚えておきましょう。

## まとめ

- フォーム部品のカスタマイズは実務でほぼ必須
- **ネイティブの input を残し、見た目だけ CSS で変える**のが鉄則
- `<div>` でゼロから作ると、キーボード操作・スクリーンリーダー・フォーム送信がすべて壊れる
- `<select>` やコンボボックスは CSS だけでは無理。自作の難易度も非常に高い
- カスタマイザブル `<select>` が標準化中だが、まだ Chrome 系のみ
- 現時点では React Aria のようなヘッドレス UI ライブラリが現実解

**次のレッスン**: [Day 5: HTML だけで作れる UI — dialog, popover, details](/lessons/day05/)
