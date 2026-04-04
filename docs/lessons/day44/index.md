# Day 44: アクセシビリティとテスト

## 今日のゴール

- axe を使ったアクセシビリティの自動テストを書けるようになる
- eslint-plugin-jsx-a11y でコーディング時にアクセシビリティ問題を検出する
- 自動チェックでカバーできる範囲とできない範囲を理解する

## 自動テストでアクセシビリティを守る

Day 43 でアクセシビリティの基本を学びました。しかし、すべてのルールを常に覚えて手動で確認するのは現実的ではありません。自動テストと静的解析を組み合わせて、アクセシビリティの問題を早期に検出しましょう。

## axe によるアクセシビリティテスト

**axe**（アクス）は、Deque Systems が開発したアクセシビリティテストエンジンです。HTML をスキャンして、WCAG のルールに違反している箇所を検出します。

### セットアップ

```bash
npm install -D vitest-axe
```

Vitest のセットアップファイルに追加します。

```ts
// vitest.setup.ts
import "@testing-library/jest-dom/vitest";
import "vitest-axe/extend-expect";
```

### 基本的なテスト

```tsx
// src/components/article-card.test.tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "vitest-axe";

function ArticleCard() {
  return (
    <article>
      <h2>記事タイトル</h2>
      <p>記事の説明文がここに入ります。</p>
      <a href="/blog/article-1">続きを読む</a>
    </article>
  );
}

describe("ArticleCard", () => {
  it("アクセシビリティ違反がない", async () => {
    const { container } = render(<ArticleCard />);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
```

`toHaveNoViolations()` は、axe が検出した違反が 0 件であることを確認します。

### 違反が検出される例

実際に違反がどう報告されるか見てみましょう。

```tsx
// ❌ アクセシビリティ違反があるコンポーネント
function BadCard() {
  return (
    <div>
      <img src="/photo.jpg" />  {/* alt がない */}
      <div onClick={() => {}}>クリック</div>  {/* div をボタンとして使用 */}
    </div>
  );
}
```

テストを実行すると、以下のような違反が報告されます。

```
Expected the HTML found at $('img') to have no violations:
- image-alt: Images must have alternate text
  Impact: critical

Expected the HTML found at $('div') to have no violations:  
- interactive element is not focusable
  Impact: serious
```

### 既存プロジェクトへの段階的な導入

すでに多くの違反があるプロジェクトでは、一度にすべて修正するのは困難です。特定のルールだけを対象にすることもできます。

```tsx
it("画像にalt属性がある", async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container, {
    rules: {
      "image-alt": { enabled: true },
      // 他のルールは無効化
    },
  });

  expect(results).toHaveNoViolations();
});
```

## eslint-plugin-jsx-a11y

**eslint-plugin-jsx-a11y** は、JSX のコードを書いている段階でアクセシビリティの問題を指摘してくれる ESLint プラグインです。テストを実行する前、コーディング中に問題を見つけられます。

### セットアップ

```bash
npm install -D eslint-plugin-jsx-a11y
```

ESLint の設定に追加します。

```js
// eslint.config.mjs
import jsxA11y from "eslint-plugin-jsx-a11y";

export default [
  // ... 既存の設定
  jsxA11y.flatConfigs.recommended,
];
```

### 検出される問題の例

```tsx
// ❌ eslint-plugin-jsx-a11y が警告する例

// alt 属性がない画像
<img src="/photo.jpg" />
// → jsx-a11y/alt-text: img elements must have an alt prop

// onClick があるのに role がない div
<div onClick={handleClick}>クリック</div>
// → jsx-a11y/click-events-have-key-events
// → jsx-a11y/no-static-element-interactions

// 空のリンク
<a href="#">リンク</a>
// → jsx-a11y/anchor-is-valid

// autoFocus の使用
<input autoFocus />
// → jsx-a11y/no-autofocus
```

```tsx
// ✅ 修正後

<img src="/photo.jpg" alt="森の風景写真" />

<button onClick={handleClick} type="button">クリック</button>

<a href="/about">About</a>

<input />  {/* autoFocus は削除、フォーカス管理は別の方法で */}
```

## Testing Library と アクセシビリティ

Day 42 で学んだ Testing Library の `getByRole` は、実はアクセシビリティのテストにもなっています。

```tsx
// この検索が成功すること自体が、
// アクセシビリティが正しいことの証明

// ボタンにアクセシブルな名前がある
screen.getByRole("button", { name: "送信" });

// 見出しが正しく使われている
screen.getByRole("heading", { name: "記事タイトル" });

// フォームにラベルがある
screen.getByLabelText("メールアドレス");

// ナビゲーションにラベルがある
screen.getByRole("navigation", { name: "メインナビゲーション" });
```

`getByRole` で要素が見つからないということは、スクリーンリーダーもその要素を適切に認識できないということです。

## 自動チェックの限界

ここが今日最も重要なポイントです。**自動チェックでカバーできるのは、アクセシビリティの問題全体の約 30〜40% と言われています**。

### 自動でカバーできるもの

| チェック項目 | ツール |
|------------|-------|
| 画像に alt がある | axe, ESLint |
| フォームに label がある | axe, ESLint |
| 色のコントラスト比が十分 | axe |
| 見出しレベルが連続している | axe |
| ARIA 属性が正しい構文 | axe, ESLint |
| フォーカス可能な要素がある | axe |
| lang 属性が設定されている | axe |

### 自動ではカバーできないもの

| チェック項目 | なぜ自動で検出できないか |
|------------|---------------------|
| alt テキストが適切な内容か | 「画像」と書かれていても、機械には妥当性が判断できない |
| Tab 順序が論理的か | 正しい順序は文脈に依存する |
| モーダルのフォーカストラップ | 操作シナリオのテストが必要 |
| 読み上げ内容が理解可能か | 人間が聞いて判断する必要がある |
| キーボード操作が直感的か | ユーザーの期待と合っているかは主観的 |
| 動画に字幕があるか | コンテンツの中身は機械では判断困難 |

### だから両方が必要

```
自動テスト（axe, ESLint） → 明確なルール違反を検出
       +
手動テスト（スクリーンリーダー、キーボード操作） → 体験の質を検証
```

自動テストは「最低限の品質」を保証するセーフティネットです。その上で、定期的にスクリーンリーダーやキーボードだけでの操作テストを行うことが理想です。

## 実践的なテスト戦略

プロジェクトに導入する際の推奨アプローチです。

```
1. eslint-plugin-jsx-a11y を導入（コーディング時にリアルタイム検出）
     ↓
2. 主要コンポーネントに axe テストを追加（CI で自動実行）
     ↓
3. 新規コンポーネントには getByRole ベースのテストを書く
     ↓
4. 定期的にスクリーンリーダーで手動テスト
```

すべてを一度に完璧にする必要はありません。まず自動チェックで基盤を作り、徐々に手動テストも組み合わせていきましょう。

## まとめ

- axe はレンダリングされた HTML をスキャンして WCAG 違反を検出する
- eslint-plugin-jsx-a11y はコーディング中にアクセシビリティ問題を指摘する
- Testing Library の `getByRole` は、暗黙的にアクセシビリティのテストにもなっている
- 自動チェックでカバーできるのはアクセシビリティ問題の約 30〜40%
- 自動テストは最低限の品質を保証するセーフティネット。手動テストと組み合わせて初めて十分になる
