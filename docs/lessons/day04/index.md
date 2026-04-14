# Day 4: カスタムフォーム UI — 見た目を変えてもアクセシビリティを保つ

## 今日のゴール

- デザイン上の要求でフォーム部品をカスタマイズする場面があることを知る
- ネイティブの input を捨てずに見た目だけ変えるアプローチを知る
- select やコンボボックスなど、自作が難しい部品があることを知る
- React Aria のようなヘッドレス UI ライブラリの役割を知る

## なぜカスタマイズが必要になるのか

ブラウザに標準で備わっているフォーム部品 — チェックボックス、ラジオボタン、セレクトボックスなど — は、そのまま使えば機能としては十分です。キーボード操作もできるし、スクリーンリーダー（画面を音声で読み上げるソフト）にも対応しています。

ただし、**見た目はブラウザとOSが決めている**ため、デザイナーが作ったデザインとは一致しないことがほとんどです。たとえば Windows の Chrome と macOS の Safari ではチェックボックスの見た目が違います。色やサイズも CSS では細かく制御できない部分があります。

実務のプロジェクトでは「デザインカンプ（完成イメージの図）どおりの見た目にする」という要件がほぼ確実にあるため、フォーム部品のカスタマイズは避けて通れない作業です。

ここで問題になるのが、**見た目をカスタマイズしようとするとアクセシビリティが壊れやすい**ということです。今日はこの問題と、その解決策を見ていきます。

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

### ファイル選択のカスタムUI

`<input type="file">` も見た目のカスタマイズが難しい要素です。よく使われる方法は:

```html
<label class="file-upload-button">
  <input type="file" class="sr-only" accept="image/*" />
  <span>画像をアップロード</span>
</label>
```

ネイティブのファイル選択ダイアログはそのまま使いつつ、トリガーとなるボタンの見た目だけを変えるアプローチです。

## Headless UI / Radix UI / React Aria

ここまで見てきたように、チェックボックスやラジオボタンは CSS で対応できますが、select やコンボボックスのように「ゼロから組む必要がある」部品も存在します。そこで登場するのが**ヘッドレス UI ライブラリ**です。

「ヘッドレス（headless）」とは「見た目（head）がない」という意味です。これらのライブラリは、**アクセシビリティとキーボード操作のロジックだけを提供し、見た目は開発者が自由に作る**という設計思想を持っています。

代表的なライブラリを紹介します:

| ライブラリ | 特徴 |
|-----------|------|
| **Headless UI** | Tailwind CSS チーム（Tailwind Labs）が開発。Tailwind CSS との相性が良い。React と Vue に対応 |
| **Radix UI** | 豊富なコンポーネント群。React 向け。スタイルなしの Primitives と、スタイル付きの Themes がある |
| **React Aria** | Adobe が開発。React のフック（hooks）として提供され、最も柔軟にカスタマイズ可能 |

たとえば React Aria の `useSelect` フックを使うと、こんな感じになります（雰囲気だけ掴んでください）:

```tsx
import { Button, Label, ListBox, ListBoxItem, Popover, Select, SelectValue } from "react-aria-components";

const plans = [
  { id: "basic", name: "ベーシック" },
  { id: "premium", name: "プレミアム" },
  { id: "enterprise", name: "エンタープライズ" },
];

function PlanSelect() {
  return (
    <Select defaultSelectedKey="basic">
      <Label className="text-sm font-medium text-gray-700">プラン</Label>
      <Button className="w-full rounded border p-2 text-left">
        <SelectValue />
      </Button>
      <Popover className="mt-1 rounded border bg-white shadow">
        <ListBox>
          {plans.map((plan) => (
            <ListBoxItem
              key={plan.id}
              id={plan.id}
              className="cursor-pointer p-2 hover:bg-blue-50"
            >
              {plan.name}
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
    </Select>
  );
}
```

開発者が書いているのは見た目（className）だけです。キーボード操作（上下キーで移動、Enter で選択、Escape で閉じる）、ARIA 属性の管理、フォーカス制御 — こうしたアクセシビリティに関わる複雑な処理は、すべてライブラリが裏側で面倒を見てくれます。

配属先のプロジェクトでは React Aria を使います。「見た目は CSS（Tailwind CSS）で自由に作り、振る舞いとアクセシビリティはライブラリに任せる」という分担を覚えておきましょう。

## まとめ

- ブラウザ標準のフォーム部品はデザイン要件に合わないことが多く、カスタマイズは実務でほぼ必須
- **基本方針はネイティブの input を残し、見た目だけを CSS で変えること。** `sr-only` で視覚的に隠し、`:checked` や `:focus-visible` で状態を反映する
- `<div>` でフォーム部品をゼロから作り直すと、キーボード操作・スクリーンリーダー対応・フォーム送信がすべて壊れる
- `<select>` やコンボボックスは CSS だけではカスタマイズできず、自作の難易度が非常に高い
- カスタマイザブル `<select>`（`appearance: base-select`）という標準化の動きがあり、将来的にはネイティブの `<select>` を自由にスタイリングできるようになる。ただし 2026 年 4 月時点では Chrome 系のみ対応で、本番投入には早い
- 現時点での現実解は、Headless UI / Radix UI / React Aria のようなヘッドレス UI ライブラリに頼ること。アクセシビリティのロジックを提供し、見た目だけ自分で作ればよい状態にしてくれる

