# Day 4: カスタムフォーム UI — 見た目を変えてもアクセシビリティを保つ

## 今日のゴール

- フォーム部品の見た目をカスタマイズする場面があることを知る
- 見た目だけ変えても、裏で壊れていることがあると知る
- 部品によってカスタマイズの方法が違うことを知る

## フォーム部品の見た目はカスタマイズできる

チェックボックスやラジオボタンなどのフォーム部品は、ブラウザや OS によって見た目が異なります。プロジェクトのデザインに合わせるために、見た目のカスタマイズが求められることがあります。

どのくらい違うのか、デモで見比べてみてください:

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

どちらもクリックで切り替わりますが、見た目の印象はまったく違います。ただし、見た目を変えるのは簡単ではありません。やり方を間違えると、見た目は変わっても裏側で壊れてしまうことがあります。

## 見た目は動いていても、ちゃんと動いているとは限らない

HTML 標準のフォーム部品（`<input type="checkbox">` など）には、見た目以上にたくさんの機能が組み込まれています。カスタマイズの方法によっては、これらの機能が失われてしまうことがあります。

| 機能 | HTML 標準の部品 | 見た目だけ作ったもの |
|------|:---:|:---:|
| クリックで切り替え | 動く | 動くこともある |
| キーボード（Space キー）で切り替え | 動く | 動かない |
| Tab キーでフォーカス移動 | 動く | 動かない |
| スクリーンリーダーの読み上げ | 読む | 読まない |
| `<form>` 送信で値が送られる | 送られる | 送られない |
| ブラウザの自動入力 | 対応 | 非対応 |

クリックで動いているように見えても、キーボードでは操作できない、フォームで送信されない、といった問題が隠れていることがあります。AI が生成したコードでも、こうした品質の差は起こりえます。

**見た目を変えても、HTML 標準の機能を壊さないこと**が大切です。

## やり方は部品によって違う

ここからは、具体的なカスタマイズの方法を見ていきます。部品によってやり方や難易度が大きく異なります。

### CSS だけでいけるもの: checkbox / radio / file

checkbox や radio は、**HTML 標準の `<input>` を残したまま、見た目だけ CSS で差し替える**ことができます。

やり方:

1. 本物の `<input>` を目に見えないように隠す
2. 隣に置いた要素で好きな見た目を作る
3. ユーザーの操作は裏の `<input>` が受け取る

`<input>` が裏にいるので、キーボード操作もフォーム送信もスクリーンリーダーもそのまま動きます。

```html
<label class="custom-checkbox">
  <!-- 本物の input。sr-only で視覚的に隠す -->
  <input type="checkbox" class="sr-only" name="agree" />
  <!-- 見た目用の要素 -->
  <span class="checkbox-visual"></span>
  利用規約に同意する
</label>
```

```css
/* 視覚的に隠すが、スクリーンリーダーからはアクセスできる */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}

/* チェックされたら隣の要素の見た目を変える */
.sr-only:checked + .checkbox-visual {
  background-color: #2563eb;
  border-color: #2563eb;
}

/* キーボード操作時のフォーカスリング */
.sr-only:focus-visible + .checkbox-visual {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
```

ポイント:

- **`sr-only`**: `display: none` だとスクリーンリーダーからも消える。`sr-only` なら「見えないがアクセスできる」状態になる（Tailwind CSS にも同名のクラスあり）
- **`:checked`**: チェック状態に応じて CSS だけで見た目が切り替わる
- **`:focus-visible`**: Tab 移動時にフォーカスの位置が見えるようにする

同じ考え方で、いろいろな UI をカスタマイズできます。

#### カード型のラジオボタン

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

#### ファイル選択

`<input type="file">` も同じです。ボタンの見た目だけ変えて、ファイル選択ダイアログ自体はそのまま使います。

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

### CSS だけでは無理なもの: select

`<select>` のドロップダウン部分は OS のネイティブ UI として描画されるため、CSS ではほぼカスタマイズできません。

<div style="padding:20px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;margin:16px 0;color:#1e293b">
<label for="demo-native-select" style="display:block;font-size:0.9em;font-weight:600;margin-bottom:6px">プランを選択</label>
<select id="demo-native-select" style="padding:8px 12px;border:2px solid #cbd5e1;border-radius:6px;font-size:0.95em;min-width:200px;background:white;color:#1e293b">
<option value="basic">ベーシック</option>
<option value="premium">プレミアム</option>
<option value="enterprise">エンタープライズ</option>
</select>
<div style="margin-top:8px;font-size:0.8em;color:#64748b">↑ ボタン部分はスタイリングできるが、ドロップダウン（選択肢リスト）はブラウザ任せ</div>
</div>

select をカスタマイズしたいとき、現在は 2 つの選択肢があります。

#### カスタマイザブル `<select>` — 標準化中の新しい仕組み

> **2026 年 4 月時点では Chrome 系ブラウザのみ対応。本番投入には早い段階です**

この問題を解決するために、**カスタマイザブル `<select>`** という新しい仕組みが標準化されつつあります。

- CSS で `appearance: base-select` を指定するだけ
- ドロップダウンも選択肢もすべてスタイリングできる
- `<select>` のまま。キーボード操作もフォーム送信もそのまま

Chrome 系ブラウザならデモで確認できます（Safari / Firefox では通常の `<select>` として表示されます）:

<style>
.demo-base-select select { appearance:base-select;padding:10px 16px;border:2px solid #6366f1;border-radius:10px;font-size:0.95em;min-width:260px;background:linear-gradient(135deg,#fafafe,#f0f0ff);color:#1e293b;cursor:pointer;font-weight:500;box-shadow:0 2px 6px rgba(99,102,241,0.15) }
.demo-base-select select:hover { border-color:#4f46e5;box-shadow:0 2px 8px rgba(99,102,241,0.25) }
.demo-base-select select::picker(select) { border:none;border-radius:12px;padding:6px;box-shadow:0 8px 24px rgba(0,0,0,0.15);background:white }
.demo-base-select option { padding:10px 14px;border-radius:8px;font-size:0.95em;transition:background-color 0.1s }
.demo-base-select option:hover { background-color:#eef2ff }
.demo-base-select option:checked { font-weight:600;background-color:#e0e7ff;color:#4338ca }
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

将来的にはこれが標準的な方法になりそうですが、まだすべてのブラウザでは使えません。

#### ヘッドレス UI ライブラリ — 現時点の解決策

すべてのブラウザで select をカスタマイズするには、**ヘッドレス UI ライブラリ**を使います。

「ヘッドレス」= 見た目がない。役割分担はこうです:

- **ライブラリ**: キーボード操作、ARIA 属性の管理、フォーカス制御
- **開発者**: 見た目（CSS）

React Aria（Adobe 製）などを使えば、スタイリングだけに集中できます。

**振る舞いはライブラリ、見た目は自分。** この分担を覚えておきましょう。

## まとめ

- フォーム部品の見た目はブラウザと OS が決める。デザインに合わせるカスタマイズは実務で必須
- 見た目が動いていても、キーボード操作やスクリーンリーダー対応が壊れていることがある
- checkbox / radio / file は **CSS だけ**でカスタマイズできる。HTML 標準の `<input>` を残して見た目だけ被せる
- select は CSS だけでは無理。**カスタマイザブル `<select>`**（標準化中）か**ヘッドレス UI ライブラリ**を使う

**次のレッスン**: [Day 5: HTML だけで作れる UI — dialog, popover, details](/lessons/day05/)
