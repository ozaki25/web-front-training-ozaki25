# Day 45: コンポーネントテスト

## 今日のゴール

- Testing Library の考え方を知る
- React コンポーネントのテストがどんなものかを知る
- 要素の検索方法と get / query / find の違いを知る

## Testing Library の考え方

Day 44 では純粋な関数のテストを見ました。今日は React コンポーネントのテストです。

React コンポーネントのテストには **Testing Library** を使います。Testing Library の最も重要な哲学は次のものです。

> **「ソフトウェアの使われ方に近いテストを書くほど、テストの信頼性は高まる」**

つまり、コンポーネントの内部実装（state の値、メソッド名など）ではなく、**ユーザーが見るもの・操作するもの**をテストします。

- ❌ 「state の値が `true` になっている」をテストする
- ✅ 「ボタンをクリックしたらテキストが表示される」をテストする

この考え方は、テストが壊れにくくなるという利点があります。内部実装をテストすると、リファクタリングのたびにテストも書き直しになりますが、ユーザーの見た目が変わらなければテストもそのまま通ります。

## コンポーネントテストの導入

Testing Library を使うには `@testing-library/react`、`@testing-library/jest-dom`、`@testing-library/user-event` をインストールし、Day 44 で作った Vitest のセットアップファイルで `jest-dom` のマッチャーを読み込みます。これで `toBeInTheDocument()` のようなマッチャーが使えるようになります。

## コンポーネントテストの流れ

シンプルなコンポーネントで、テストの基本的な流れを見ます。

```tsx
// src/components/greeting.tsx
type Props = {
  name: string;
};

export default function Greeting({ name }: Props) {
  return (
    <div>
      <h1>こんにちは、{name}さん！</h1>
      <p>今日も良い一日を。</p>
    </div>
  );
}
```

```tsx
// src/components/greeting.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Greeting from "./greeting";

describe("Greeting", () => {
  it("名前を表示する", () => {
    render(<Greeting name="太郎" />);

    expect(screen.getByText("こんにちは、太郎さん！")).toBeInTheDocument();
  });
});
```

コンポーネントテストの流れは3ステップです。

1. **`render`** — コンポーネントを仮想的な DOM（ブラウザが管理するページの構造）にレンダリングする
2. **`screen`** で要素を検索する（`getByText`、`getByRole` など）
3. **`expect`** で検証する（`toBeInTheDocument()` など）

## 要素の検索方法

Testing Library は、ユーザーの視点で要素を検索する方法を提供しています。

### 推奨される検索（優先度順）

```tsx
// 1. getByRole — ロール（役割）で検索（最も推奨）
screen.getByRole("button", { name: "送信" });
screen.getByRole("heading", { name: "タイトル" });

// 2. getByLabelText — ラベルで検索（フォーム要素に推奨）
screen.getByLabelText("メールアドレス");

// 3. getByText — テキストで検索
screen.getByText("送信しました");

// 4. getByTestId — data-testid で検索（最終手段）
screen.getByTestId("custom-element");
```

`getByRole` が最も推奨されるのは、**スクリーンリーダーがコンテンツを認識する方法と同じ**だからです。`getByRole` でテストが書けるということは、アクセシビリティが適切に実装されている証明にもなります。

### get / query / find の違い

| プレフィックス | 見つからない場合 | 用途 |
|-------------|--------------|------|
| `getBy` | エラーを投げる | 存在するはずの要素 |
| `queryBy` | `null` を返す | 存在しないことの確認 |
| `findBy` | 見つかるまで待つ（非同期） | 非同期で表示される要素 |

```tsx
// 要素が存在する → getBy
expect(screen.getByText("表示されている")).toBeInTheDocument();

// 要素が存在しない → queryBy
expect(screen.queryByText("まだない")).not.toBeInTheDocument();

// 非同期で表示される → findBy
const element = await screen.findByText("読み込み後に表示");
```

## ユーザー操作のシミュレーション

`userEvent` を使うと、クリックやテキスト入力といったユーザー操作をシミュレートできます。

```tsx
// src/components/counter.tsx
"use client";

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(count + 1)} type="button">
        増やす
      </button>
    </div>
  );
}
```

```tsx
// src/components/counter.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Counter from "./counter";

describe("Counter", () => {
  it("ボタンをクリックするとカウントが増える", async () => {
    const user = userEvent.setup();
    render(<Counter />);

    await user.click(screen.getByRole("button", { name: "増やす" }));

    expect(screen.getByText("カウント: 1")).toBeInTheDocument();
  });
});
```

`userEvent.setup()` で作成した `user` オブジェクトで操作をシミュレートします。`user.click` や `user.type` は `await` が必要です。

より複雑なテスト（フォーム送信やコールバックの検証）では、`vi.fn()` でモック関数（呼び出しを記録するダミー関数）を使います。

## まとめ

- Testing Library は「ユーザーの使い方に近いテスト」を書くための道具
- `render` でコンポーネントを描画し、`screen` で要素を検索する
- `getByRole` が最も推奨される検索方法で、アクセシビリティの確認にもなる
- `getBy`（存在する要素）、`queryBy`（不在確認）、`findBy`（非同期待ち）を使い分ける
- `userEvent` でクリックなどのユーザー操作をシミュレートできる
