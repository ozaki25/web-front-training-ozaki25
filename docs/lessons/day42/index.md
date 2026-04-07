# Day 42: テスト基礎（Vitest）

## 今日のゴール

- なぜテストを書くのか理解する
- Vitest のセットアップと基本的な使い方を知る
- 単体テストの書き方を身につける

## なぜテストを書くのか

「動いているコードにテストは必要なのか？」と思うかもしれません。テストを書く理由を具体的に見てみましょう。

1. **変更に自信が持てる** — コードを修正したとき、既存の機能が壊れていないことをテストが保証してくれる
2. **バグの再発を防げる** — バグを見つけたらテストを書くことで、同じバグが二度と起きないようにできる
3. **コードの仕様書になる** — テストを読めば「この関数はどう動くべきか」がわかる
4. **リファクタリングしやすくなる** — テストがあれば、コードの内部構造を安心して変更できる

AI でコードを生成する場面が増えた今、テストはさらに重要になっています。AI が生成したコードが正しく動くかを検証する手段がテストだからです。

## Vitest とは

Vitest は、JavaScript/TypeScript のテストフレームワークです。以前は Jest がデファクトスタンダードでしたが、Vitest は Vite をベースにしており、高速でモダンな開発体験を提供します。

### Vitest の特徴

- **高速** — Vite のホットモジュールリプレースメント（HMR）を活用し、ファイル変更時に関連テストだけを再実行
- **ESM ネイティブ** — `import`/`export` をそのまま使える
- **TypeScript 対応** — 設定なしで TypeScript が使える
- **Jest 互換の API** — Jest と同じ `describe`、`it`、`expect` が使える

## セットアップ

Next.js プロジェクトに Vitest を導入します。

```bash
npm install -D vitest @vitejs/plugin-react
```

プロジェクトルートに `vitest.config.ts` を作成します。

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",  // ブラウザ環境をシミュレート
    globals: true,          // describe, it, expect をインポート不要にする
  },
  resolve: {
    alias: {
      "@": "./src",
    },
  },
});
```

`package.json` にテスト実行コマンドを追加します。

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

- `npm test` — ウォッチモード（ファイル変更を監視して自動でテスト再実行）
- `npm run test:run` — 一回だけテストを実行して終了

## 最初のテスト

まず、テスト対象となるシンプルな関数を作ります。

```ts
// src/lib/math.ts
export function add(a: number, b: number): number {
  return a + b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
```

テストファイルを作成します。テストファイルは慣例として `.test.ts` という拡張子にします。

```ts
// src/lib/math.test.ts
import { describe, it, expect } from "vitest";
import { add, multiply, clamp } from "./math";

describe("add", () => {
  it("2つの数値を足し算する", () => {
    expect(add(1, 2)).toBe(3);
  });

  it("負の数を扱える", () => {
    expect(add(-1, -2)).toBe(-3);
  });

  it("0を足しても変わらない", () => {
    expect(add(5, 0)).toBe(5);
  });
});

describe("multiply", () => {
  it("2つの数値を掛け算する", () => {
    expect(multiply(3, 4)).toBe(12);
  });

  it("0を掛けると0になる", () => {
    expect(multiply(5, 0)).toBe(0);
  });
});

describe("clamp", () => {
  it("最小値より小さい場合は最小値を返す", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it("最大値より大きい場合は最大値を返す", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it("範囲内の場合はそのまま返す", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });
});
```

テストを実行してみましょう。

```bash
npm test
```

### テストの構造

テストには 3 つの基本要素があります。

- **`describe`** — テストをグループ化する。関数名やコンポーネント名を渡すことが多い
- **`it`**（または `test`）— 個々のテストケース。「何をテストするか」を日本語で書く
- **`expect`** — 期待する結果を検証する。**アサーション**（assertion）と呼ぶ

## よく使うアサーション

`expect` に続けてさまざまなマッチャー（matcher）を使えます。

```ts
import { describe, it, expect } from "vitest";

describe("マッチャーの例", () => {
  // 等値チェック
  it("toBe: 厳密等価（===）", () => {
    expect(1 + 1).toBe(2);
  });

  it("toEqual: オブジェクトの中身を比較", () => {
    expect({ name: "太郎" }).toEqual({ name: "太郎" });
  });

  // 真偽チェック
  it("toBeTruthy / toBeFalsy", () => {
    expect("hello").toBeTruthy();
    expect("").toBeFalsy();
    expect(null).toBeFalsy();
  });

  // 数値チェック
  it("toBeGreaterThan / toBeLessThan", () => {
    expect(10).toBeGreaterThan(5);
    expect(3).toBeLessThan(10);
  });

  // 文字列チェック
  it("toContain: 部分一致", () => {
    expect("Hello World").toContain("World");
  });

  // 配列チェック
  it("toContain: 配列に含まれる", () => {
    expect([1, 2, 3]).toContain(2);
  });

  it("toHaveLength: 配列の長さ", () => {
    expect([1, 2, 3]).toHaveLength(3);
  });

  // エラーチェック
  it("toThrow: エラーが投げられる", () => {
    const throwError = () => {
      throw new Error("エラー！");
    };
    expect(throwError).toThrow("エラー！");
  });
});
```

`toBe` と `toEqual` の違いは重要です。`toBe` は参照の一致（`===`）で比較するため、オブジェクトや配列の比較には `toEqual` を使います。

## 実践的なテスト例

もう少し現実的な関数をテストしてみましょう。

```ts
// src/lib/format.ts
export function formatPrice(price: number): string {
  return `¥${price.toLocaleString("ja-JP")}`;
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + "...";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}
```

```ts
// src/lib/format.test.ts
import { describe, it, expect } from "vitest";
import { formatPrice, truncate, slugify } from "./format";

describe("formatPrice", () => {
  it("3桁区切りで円表示する", () => {
    expect(formatPrice(1000)).toBe("¥1,000");
    expect(formatPrice(1234567)).toBe("¥1,234,567");
  });

  it("0円を表示できる", () => {
    expect(formatPrice(0)).toBe("¥0");
  });
});

describe("truncate", () => {
  it("最大長を超えた場合は省略する", () => {
    expect(truncate("こんにちは世界", 5)).toBe("こんにちは...");
  });

  it("最大長以下の場合はそのまま返す", () => {
    expect(truncate("短い", 10)).toBe("短い");
  });

  it("ちょうど最大長の場合はそのまま返す", () => {
    expect(truncate("12345", 5)).toBe("12345");
  });
});

describe("slugify", () => {
  it("スペースをハイフンに変換する", () => {
    expect(slugify("hello world")).toBe("hello-world");
  });

  it("大文字を小文字にする", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("特殊文字を除去する", () => {
    expect(slugify("hello! world?")).toBe("hello-world");
  });
});
```

## テストの書き方のコツ

### AAA パターン

テストは **Arrange（準備）→ Act（実行）→ Assert（検証）** の 3 ステップで書くとわかりやすくなります。

```ts
it("ユーザー名が空の場合はエラーを返す", () => {
  // Arrange（準備）
  const emptyName = "";

  // Act（実行）
  const result = validateUserName(emptyName);

  // Assert（検証）
  expect(result).toEqual({ valid: false, error: "名前は必須です" });
});
```

### テスト名は「何が」「どうなるか」を書く

```ts
// ✅ よいテスト名
it("価格が0未満の場合はエラーを投げる", () => {});
it("メールアドレスに@が含まれない場合はfalseを返す", () => {});

// ❌ 悪いテスト名
it("テスト1", () => {});
it("正常系", () => {});
```

テスト名を読むだけで、テスト対象の仕様がわかるようにしましょう。

## まとめ

- テストはコードの品質を保ち、変更に自信を持つための仕組み
- Vitest は高速で TypeScript 対応のテストフレームワーク
- `describe` でグループ化、`it` でテストケース、`expect` でアサーション
- `toBe` は厳密等価、`toEqual` はオブジェクトの中身を比較
- テスト名は「何がどうなるか」を明確に書く

**次のレッスン**: [Day 43: コンポーネントテスト](/lessons/day43/)
