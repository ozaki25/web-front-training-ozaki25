# Testing Library — テストは画面の「どこ」を見ているのか

## 今日のゴール

- コンポーネントのテストが「ユーザーに見えるもの」で書かれる理由を知る
- クエリの優先順位（getByRole が最上位）の意味を知る
- data-testid が「最後の手段」とされる理由を知る

## コンポーネントのテストに出てくる謎の単語

React コンポーネントのテストは、決まってこんなコードになります。

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { test, expect } from "vitest";
import { Counter } from "./Counter";

test("ボタンを押すとカウントが増える", async () => {
  const user = userEvent.setup();
  render(<Counter />);

  await user.click(screen.getByRole("button", { name: "+1" }));

  expect(screen.getByText("1 回押された")).toBeInTheDocument();
});
```

`render` でコンポーネントを描画し、`screen.getByRole(...)` で探してクリックし、画面の文字を確かめる。これは **Testing Library** という定番ライブラリの書き方です。

注目すべきは、このテストが**一度もコンポーネントの中身に触れていない**ことです。state の値も、ハンドラ関数も、クラス名も登場しません。これは手抜きではなく、明確な思想です。

## 思想 — 実装ではなく、振る舞いをテストする

Testing Library の設計原則は 1 行に要約されています。

> **テストがソフトウェアの「使われ方」に似ているほど、テストは信頼できる。**

コンポーネントには 2 つの顔があります。

| | 例 | ユーザーに見えるか |
|---|---|---|
| **実装の詳細** | state 名（`count`）、関数名（`handleClick`）、クラス名 | 見えない |
| **振る舞い** | 「+1 というボタンがある」「押すと表示が 1 になる」 | **見える** |

仮に実装の詳細（state の値など）をテストしたとすると、何が起きるか。

- `count` を `clickCount` にリネームしただけで、**動作は何も変わらないのにテストが赤**になる
- 逆に、表示部分を壊しても state さえ正しければ**緑のまま**になり得る

つまり実装詳細のテストは、**直してもいない時に鳴り、壊れた時に鳴らない**火災報知器です。ユーザーに見えるものだけでテストを書けば、「リファクタリングでは鳴らず、ユーザーに見える破壊でだけ鳴る」報知器になります。

## クエリの優先順位 — getByRole が最上位の理由

Testing Library には要素の探し方（クエリ）が複数あり、**公式が優先順位を明示**しています。

| 優先度 | クエリ | 探し方 |
|--------|--------|--------|
| 1 | `getByRole` | 役割と名前（「ログインという名前のボタン」） |
| 2 | `getByLabelText` | フォームのラベル |
| 3 | `getByText` | 表示テキスト |
| … | … | … |
| 最後 | `getByTestId` | テスト用に埋め込んだ `data-testid` 属性 |

`getByRole` が最上位なのは偶然ではありません。これは**アクセシビリティツリー**（ブラウザが支援技術のために作る、名前・役割・状態の木）から探すクエリです。つまり、

- `getByRole("button", { name: "+1" })` で**見つかる** = スクリーンリーダーのユーザーにも「+1、ボタン」として**存在している**
- `div` + onClick の偽ボタンや、ラベルの無い入力欄は、このクエリで**見つけられない**

テストの書きやすさと、支援技術への対応が、**同じ 1 本の木**で決まっているわけです。「getByRole で取れないから data-testid を貼る」は、アクセシビリティの問題をテスト属性で隠す行為になりがちです。

<svg viewBox="0 0 520 262" role="img" aria-label="HTML から作られる 1 本のアクセシビリティツリー（役割・名前・状態）を、スクリーンリーダーと getByRole が共有する図。同じ木を支援技術とテストの両方が使う。" style="width:100%;height:auto;max-width:520px;display:block;margin:16px auto;">
  <defs>
    <marker id="d048-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker>
  </defs>
  <rect x="0" y="0" width="520" height="262" rx="10" fill="#f8fafc"/>

  <rect x="190" y="18" width="140" height="40" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="260" y="42" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#1e293b">HTML（画面の要素）</text>

  <line x1="260" y1="58" x2="260" y2="84" stroke="#64748b" stroke-width="2" marker-end="url(#d048-arrow)"/>

  <rect x="158" y="88" width="204" height="52" rx="8" fill="#e2e8f0" stroke="#475569" stroke-width="2.5"/>
  <text x="260" y="110" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#1e293b">アクセシビリティツリー</text>
  <text x="260" y="128" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">役割・名前・状態の木</text>

  <line x1="215" y1="140" x2="150" y2="180" stroke="#64748b" stroke-width="2" marker-end="url(#d048-arrow)"/>
  <line x1="305" y1="140" x2="370" y2="180" stroke="#64748b" stroke-width="2" marker-end="url(#d048-arrow)"/>

  <rect x="40" y="184" width="200" height="52" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="140" y="206" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#1e293b">スクリーンリーダー</text>
  <text x="140" y="224" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">読み上げる</text>

  <rect x="280" y="184" width="200" height="52" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="380" y="206" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#1e293b">getByRole</text>
  <text x="380" y="224" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">テストが要素を探す</text>

  <text x="260" y="254" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">同じ 1 本の木を、支援技術とテストが共有する</text>
</svg>

### data-testid が最後の手段である理由

`data-testid` は HTML に**テスト専用の目印**を埋め込む方法です。確実に取れますが、ユーザーには見えも聞こえもしない属性なので、「ユーザーの使われ方に似せる」という思想から最も遠い。**役割でもラベルでもテキストでも取れないときの非常口**という位置づけです。

テストが `data-testid` だらけになっていることがあります。動きはしますが、「**それ、getByRole で取れない？**」と問い直すと、テストが思想に沿った形に直り、ついでに HTML の a11y 不備（ラベル欠け、偽ボタン）が見つかることもよくあります。

## userEvent — 操作も本物に似せる

探し方だけでなく、操作も「ユーザーらしさ」を重視します。`userEvent.click` は、単にクリックイベントを 1 発撃つのではなく、**ホバー → ポインタを押す → 離す**という実際の操作に近いイベント列を再現します。キーボード入力 `userEvent.type` も 1 文字ずつのキーイベントを発生させます。

「ユーザーにできない操作でテストを通さない」。disabled なボタンは `userEvent.click` では押せませんが、内部関数を直接呼べば「押せて」しまいます。テストが嘘をつかないために、入口を人間と同じに揃えるのです。

## まとめ

- Testing Library の思想は「使われ方に似せるほどテストは信頼できる」
- 実装詳細のテストは、リネームで鳴り、本当の破壊で黙る
- getByRole はアクセシビリティツリーから探すので、a11y とテストが同じ木で決まる
- data-testid は非常口で、合言葉は「getByRole で取れない？」
