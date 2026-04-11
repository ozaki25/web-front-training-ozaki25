# Day 44: アクセシビリティ実践

## 今日のゴール

- WCAG の概要と重要性を知る
- セマンティック HTML の要点を振り返る
- aria 属性の使い方を知る
- キーボードナビゲーションの実装方法を知る

## アクセシビリティとは

**アクセシビリティ**（accessibility、略して a11y）とは、障害のある人も含めて、誰もが Web コンテンツを利用できるようにすることです。

これまでのレッスンで、`<nav>` の `aria-label` や `<button>` の `aria-pressed`、`role="alert"` など、アクセシビリティに関する要素を自然に使ってきました。今日はそれらを体系的に整理します。

### なぜ重要か

- **ユーザーの多様性** — 視覚障害、聴覚障害、運動障害、認知障害など、さまざまなユーザーがいる
- **一時的な障害** — 腕を骨折してマウスが使えない、明るい屋外でスマートフォンを見ているなど、誰でも一時的に障害を抱えることがある
- **法的要件** — 多くの国でアクセシビリティは法的に求められている
- **SEO** — 検索エンジンもスクリーンリーダーと同様に HTML の構造を読み取る

## WCAG の概要

**WCAG**（Web Content Accessibility Guidelines）は、W3C が策定した Web アクセシビリティの国際的なガイドラインです。4 つの原則に基づいています。

| 原則 | 説明 | 例 |
|------|------|-----|
| **知覚可能** | 情報を認識できること | 画像に alt テキストがある |
| **操作可能** | UI を操作できること | キーボードだけで操作できる |
| **理解可能** | 内容が理解できること | エラーメッセージが明確 |
| **堅牢** | 支援技術が解釈できること | セマンティックな HTML |

適合レベルは A（最低限）、AA（標準）、AAA（最高）の 3 段階があります。多くのプロジェクトでは **AA** を目指します。

## セマンティック HTML の総復習

Day 1〜3 で学んだセマンティック HTML は、アクセシビリティの基盤です。

### ランドマーク要素

```html
<header>サイトヘッダー</header>
<nav aria-label="メインナビゲーション">ナビゲーション</nav>
<main>メインコンテンツ</main>
<aside>サイドバー</aside>
<footer>フッター</footer>
```

スクリーンリーダーのユーザーは、これらのランドマークを使ってページ内を素早く移動できます。

### 見出しの階層

```html
<!-- ✅ 正しい: 階層が連続している -->
<h1>サイトタイトル</h1>
<h2>セクション</h2>
<h3>サブセクション</h3>

<!-- ❌ 間違い: h2 を飛ばしている -->
<h1>サイトタイトル</h1>
<h3>サブセクション</h3>
```

スクリーンリーダーのユーザーは見出しの一覧を表示してページの構造を把握します。見出しレベルを飛ばすと、構造が正しく伝わりません。

### フォーム要素

```tsx
{/* ✅ label と input が関連付けられている */}
<div>
  <label htmlFor="email">メールアドレス</label>
  <input type="email" id="email" name="email" required />
</div>

{/* ❌ label がない — スクリーンリーダーが何の入力欄かわからない */}
<div>
  <input type="email" placeholder="メールアドレス" />
</div>
```

`placeholder` は `label` の代わりにはなりません。入力を始めると `placeholder` は消えてしまいます。

### ボタンとリンクの使い分け

```tsx
{/* ✅ ページ遷移にはリンク */}
<a href="/about">About ページへ</a>

{/* ✅ アクション（操作）にはボタン */}
<button onClick={handleSubmit} type="button">送信</button>

{/* ❌ div をボタンのように使わない */}
<div onClick={handleSubmit}>送信</div>
```

`<button>` と `<a>` は、キーボード操作（Tab で移動、Enter で実行）やスクリーンリーダーの認識が自動的に行われます。`<div>` にはこれらの機能がありません。

## aria 属性

ARIA（Accessible Rich Internet Applications）属性は、HTML だけでは伝えきれない情報を補足するためのものです。

### 重要な原則: ARIA を使う前に

> **ネイティブ HTML で実現できるなら、ARIA は不要です。**

```tsx
{/* ❌ ARIA 不要 — button 要素がすでに role="button" を持っている */}
<button role="button">送信</button>

{/* ✅ これだけで十分 */}
<button>送信</button>
```

ARIA は、ネイティブ HTML では表現できないケースで使います。

### よく使う aria 属性

#### aria-label — 見えないラベル

```tsx
{/* アイコンだけのボタンにラベルを付ける */}
<button aria-label="メニューを開く" type="button">
  ☰
</button>

{/* 閉じるボタン */}
<button aria-label="ダイアログを閉じる" type="button">
  ×
</button>
```

#### aria-describedby — 補足説明

```tsx
<div>
  <label htmlFor="password">パスワード</label>
  <input
    type="password"
    id="password"
    aria-describedby="password-hint"
  />
  <p id="password-hint">8文字以上で、英数字を含めてください</p>
</div>
```

`aria-describedby` で関連付けると、スクリーンリーダーが入力欄にフォーカスしたとき「パスワード、8文字以上で英数字を含めてください」と読み上げます。

#### aria-expanded — 展開状態

```tsx
"use client";

import { useState } from "react";

export default function Accordion({ title, children }: {
  title: string;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        type="button"
      >
        {title}
      </button>
      {isOpen && <div role="region">{children}</div>}
    </div>
  );
}
```

#### aria-live — 動的な変化の通知

```tsx
{/* ポライト: 現在の読み上げが終わった後に通知 */}
<div aria-live="polite">
  {message && <p>{message}</p>}
</div>

{/* アサーティブ: 即座に通知（重要なエラーなど） */}
<div aria-live="assertive">
  {error && <p>{error}</p>}
</div>
```

`aria-live` を付けた要素の中身が変わると、スクリーンリーダーが変更を読み上げます。

#### aria-hidden — スクリーンリーダーから隠す

```tsx
{/* 装飾的なアイコンはスクリーンリーダーに読ませない */}
<button type="button">
  <span aria-hidden="true">🗑️</span>
  削除
</button>
```

## キーボードナビゲーション

すべての操作がキーボードだけで完結できることが重要です。

### 基本のキー操作

| キー | 操作 |
|------|------|
| Tab | 次のフォーカス可能な要素に移動 |
| Shift + Tab | 前のフォーカス可能な要素に移動 |
| Enter | リンクやボタンを実行 |
| Space | ボタンを実行、チェックボックスを切り替え |
| Escape | モーダルやドロップダウンを閉じる |
| 矢印キー | ラジオボタンやタブの切り替え |

### フォーカス管理

```tsx
"use client";

import { useRef, useEffect } from "react";

export default function Modal({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      // モーダルが開いたら閉じるボタンにフォーカス
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="ダイアログ"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div>
        {children}
        <button ref={closeButtonRef} onClick={onClose} type="button">
          閉じる
        </button>
      </div>
    </div>
  );
}
```

モーダルを開いたとき、フォーカスをモーダル内に移動させ、Escape キーで閉じられるようにするのが基本パターンです。

## スクリーンリーダー体験

実際にスクリーンリーダーを使ってみると、アクセシビリティの重要性を肌で感じられます。

### 確認する方法

- **macOS**: VoiceOver（`Cmd + F5` で起動）
- **Windows**: NVDA（無料でダウンロード可能）またはナレーター（`Win + Ctrl + Enter`）
- **Chrome**: [Screen Reader 拡張機能](https://chrome.google.com/webstore/detail/screen-reader/)

VoiceOver を起動してページを Tab キーで操作すると、「何のボタンかわからない」「見出しが見つからない」といった体験から、セマンティック HTML や aria 属性の重要性が実感できます。

## まとめ

- アクセシビリティは特別な対応ではなく、すべてのユーザーが使えるようにする基本
- WCAG は Web アクセシビリティの国際ガイドライン。通常は AA レベルを目指す
- セマンティック HTML（ランドマーク、見出し階層、label）がアクセシビリティの基盤
- ARIA はネイティブ HTML で足りない情報を補足するもの。使いすぎに注意
- キーボードだけですべての操作ができることが重要
- スクリーンリーダーを実際に試すと、自分のコードの改善点が見えてくる

**次のレッスン**: [Day 45: アクセシビリティとテスト](/lessons/day45/)
