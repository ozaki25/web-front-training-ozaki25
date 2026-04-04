# Day 42: コンポーネントテスト

## 今日のゴール

- Testing Library の考え方を理解する
- React コンポーネントのテストを書けるようになる
- ユーザー操作のシミュレーション方法を知る

## Testing Library の考え方

Day 41 では純粋な関数のテストを学びました。今日は React コンポーネントのテストです。

React コンポーネントのテストには **Testing Library** を使います。Testing Library の最も重要な哲学は次のものです。

> **「ソフトウェアの使われ方に近いテストを書くほど、テストの信頼性は高まる」**

つまり、コンポーネントの内部実装（state の値、メソッド名など）ではなく、**ユーザーが見るもの・操作するもの**をテストします。

- ❌ 「state の値が `true` になっている」をテストする
- ✅ 「ボタンをクリックしたらテキストが表示される」をテストする

## セットアップ

Testing Library を導入します。

```bash
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Vitest の設定にセットアップファイルを追加します。

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@": "./src",
    },
  },
});
```

```ts
// vitest.setup.ts
import "@testing-library/jest-dom/vitest";
```

これで `toBeInTheDocument()` などの便利なマッチャーが使えるようになります。

## 最初のコンポーネントテスト

シンプルなコンポーネントから始めましょう。

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

  it("挨拶メッセージを表示する", () => {
    render(<Greeting name="花子" />);

    expect(screen.getByText("今日も良い一日を。")).toBeInTheDocument();
  });
});
```

### テストの流れ

1. **`render`** — コンポーネントを仮想的な DOM にレンダリングする
2. **`screen`** — レンダリングされた画面を操作するためのオブジェクト
3. **`getByText`** — テキストで要素を検索する
4. **`toBeInTheDocument`** — その要素が DOM に存在することを確認する

## 要素の検索方法

Testing Library は、ユーザーの視点で要素を検索する方法を提供しています。

### 推奨される検索（優先度順）

```tsx
// 1. getByRole — ロール（役割）で検索（最も推奨）
screen.getByRole("button", { name: "送信" });
screen.getByRole("heading", { name: "タイトル" });
screen.getByRole("textbox", { name: "メールアドレス" });

// 2. getByLabelText — ラベルで検索（フォーム要素に推奨）
screen.getByLabelText("メールアドレス");

// 3. getByPlaceholderText — プレースホルダーで検索
screen.getByPlaceholderText("メールアドレスを入力");

// 4. getByText — テキストで検索
screen.getByText("送信しました");

// 5. getByDisplayValue — 入力値で検索
screen.getByDisplayValue("test@example.com");

// 6. getByAltText — alt テキストで検索（画像）
screen.getByAltText("ユーザーのプロフィール写真");

// 7. getByTestId — data-testid で検索（最終手段）
screen.getByTestId("custom-element");
```

`getByRole` が最も推奨されるのは、**スクリーンリーダーがコンテンツを認識する方法と同じ**だからです。`getByRole` でテストが書けるということは、アクセシビリティが適切に実装されていることの証明にもなります。

### get / query / find の違い

```tsx
// getBy — 要素が見つからないとエラーを投げる（存在するはずの要素に使う）
screen.getByText("必ず存在する要素");

// queryBy — 要素が見つからないと null を返す（存在しないことの確認に使う）
expect(screen.queryByText("まだ表示されない要素")).not.toBeInTheDocument();

// findBy — 要素が見つかるまで待つ（非同期で表示される要素に使う）
const element = await screen.findByText("読み込み後に表示される要素");
```

## ユーザー操作のシミュレーション

### userEvent のセットアップ

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
```

### クリック操作

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
      <button onClick={() => setCount(0)} type="button">
        リセット
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
  it("初期値は0", () => {
    render(<Counter />);

    expect(screen.getByText("カウント: 0")).toBeInTheDocument();
  });

  it("ボタンをクリックするとカウントが増える", async () => {
    const user = userEvent.setup();
    render(<Counter />);

    await user.click(screen.getByRole("button", { name: "増やす" }));

    expect(screen.getByText("カウント: 1")).toBeInTheDocument();
  });

  it("リセットボタンでカウントが0に戻る", async () => {
    const user = userEvent.setup();
    render(<Counter />);

    await user.click(screen.getByRole("button", { name: "増やす" }));
    await user.click(screen.getByRole("button", { name: "増やす" }));
    await user.click(screen.getByRole("button", { name: "リセット" }));

    expect(screen.getByText("カウント: 0")).toBeInTheDocument();
  });
});
```

`userEvent.setup()` で作成した `user` オブジェクトを使って操作をシミュレートします。`user.click` は `await` が必要です。

### テキスト入力

```tsx
// src/components/search-form.tsx
"use client";

import { useState } from "react";

type Props = {
  onSearch: (query: string) => void;
};

export default function SearchForm({ onSearch }: Props) {
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="search">検索</label>
      <input
        type="text"
        id="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="キーワードを入力"
      />
      <button type="submit">検索する</button>
    </form>
  );
}
```

```tsx
// src/components/search-form.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchForm from "./search-form";

describe("SearchForm", () => {
  it("検索キーワードを入力して送信できる", async () => {
    const mockOnSearch = vi.fn();
    const user = userEvent.setup();
    render(<SearchForm onSearch={mockOnSearch} />);

    await user.type(screen.getByLabelText("検索"), "Next.js");
    await user.click(screen.getByRole("button", { name: "検索する" }));

    expect(mockOnSearch).toHaveBeenCalledWith("Next.js");
  });

  it("空のクエリでは送信されない", async () => {
    const mockOnSearch = vi.fn();
    const user = userEvent.setup();
    render(<SearchForm onSearch={mockOnSearch} />);

    await user.click(screen.getByRole("button", { name: "検索する" }));

    expect(mockOnSearch).not.toHaveBeenCalled();
  });
});
```

`vi.fn()` は**モック関数**です。関数が呼ばれたかどうか、どんな引数で呼ばれたかを記録してくれます。コールバック関数のテストに便利です。

## 条件付き表示のテスト

```tsx
// src/components/alert.tsx
type Props = {
  type: "success" | "error";
  message: string;
  onClose?: () => void;
};

export default function Alert({ type, message, onClose }: Props) {
  return (
    <div role="alert" className={type === "error" ? "alert-error" : "alert-success"}>
      <p>{message}</p>
      {onClose && (
        <button onClick={onClose} type="button" aria-label="閉じる">
          ×
        </button>
      )}
    </div>
  );
}
```

```tsx
// src/components/alert.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Alert from "./alert";

describe("Alert", () => {
  it("メッセージを表示する", () => {
    render(<Alert type="success" message="保存しました" />);

    expect(screen.getByText("保存しました")).toBeInTheDocument();
  });

  it("role=alert が設定されている", () => {
    render(<Alert type="error" message="エラーが発生しました" />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("onClose が渡された場合は閉じるボタンが表示される", () => {
    render(<Alert type="success" message="OK" onClose={() => {}} />);

    expect(screen.getByRole("button", { name: "閉じる" })).toBeInTheDocument();
  });

  it("onClose が渡されない場合は閉じるボタンが表示されない", () => {
    render(<Alert type="success" message="OK" />);

    expect(screen.queryByRole("button", { name: "閉じる" })).not.toBeInTheDocument();
  });

  it("閉じるボタンをクリックすると onClose が呼ばれる", async () => {
    const mockOnClose = vi.fn();
    const user = userEvent.setup();
    render(<Alert type="success" message="OK" onClose={mockOnClose} />);

    await user.click(screen.getByRole("button", { name: "閉じる" }));

    expect(mockOnClose).toHaveBeenCalledOnce();
  });
});
```

## まとめ

- Testing Library は「ユーザーの使い方に近いテスト」を書くための道具
- `render` でコンポーネントを描画し、`screen` で要素を検索する
- `getByRole` が最も推奨される検索方法で、アクセシビリティの確認にもなる
- `userEvent` でクリックやテキスト入力をシミュレートする
- `vi.fn()` でモック関数を作り、コールバックの呼び出しを検証する
- 要素が存在しないことの確認には `queryBy` を使う
