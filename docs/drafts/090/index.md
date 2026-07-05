# モックと MSW — ネットワークだけ偽物にする

## 今日のゴール

- テストで「本物の API」を使えない理由を知る
- モックの層の違い（関数を差し替える vs 通信を横取りする）を知る
- MSW が「ネットワークの境界」で偽装する利点を知る

## テストと API の悪い関係

コンポーネントのテストで、うっかり**本物の API にリクエストを飛ばしてしまう**ことがあります。一見動きますが、これが諸悪の根源になります。

- **遅い**: テストのたびに本物の通信。数百本のテストで数分の差になる
- **不安定**: API サーバーが落ちていたらテストも落ちる。テストの失敗が「コードのバグ」か「サーバーの機嫌」か分からなくなる
- **再現できない**: 「0 件のとき」「サーバーエラーのとき」を試したいのに、本物のサーバーは都合よくエラーを返してくれない
- **危険**: テストが本物のデータを書き換えたら大惨事

そこで、**本物の代わりに偽物の応答を返す**仕掛けを使います。これを**モック**（mock = 模造品）と呼びます。

## どの層で偽物にするか

モックには「どこを差し替えるか」の選択肢があり、層によって性質が変わります。

<svg viewBox="0 0 640 220" role="img" aria-label="モックの層を示す図。自分のコード（コンポーネント→fetchUsers 関数→fetch）の先に、ネットワーク境界を越えて本物のサーバーがある。関数モックは fetchUsers の手前で差し替えるので、その先は実行されない。MSW はネットワーク境界で横取りするので、自分のコードは全部実行される。" style="width:100%;height:auto;max-width:640px;display:block;margin:16px auto;">
  <defs>
    <marker id="d090-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker>
  </defs>
  <rect x="0" y="0" width="640" height="220" rx="10" fill="#f8fafc"/>

  <text x="215" y="26" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#64748b">自分のコード</text>
  <text x="545" y="26" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#64748b">外の世界</text>

  <rect x="20" y="66" width="110" height="46" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="75" y="94" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#1e293b">コンポーネント</text>
  <rect x="160" y="66" width="120" height="46" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="220" y="94" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#1e293b">fetchUsers 関数</text>
  <rect x="310" y="66" width="90" height="46" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="355" y="94" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#1e293b">fetch</text>
  <rect x="470" y="66" width="150" height="46" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="545" y="94" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#1e293b">本物のサーバー</text>

  <line x1="130" y1="89" x2="158" y2="89" stroke="#64748b" stroke-width="2" marker-end="url(#d090-arrow)"/>
  <line x1="280" y1="89" x2="308" y2="89" stroke="#64748b" stroke-width="2" marker-end="url(#d090-arrow)"/>
  <line x1="400" y1="89" x2="468" y2="89" stroke="#64748b" stroke-width="2" marker-end="url(#d090-arrow)"/>
  <text x="434" y="46" text-anchor="middle" font-family="sans-serif" font-size="9.5" fill="#64748b">ネットワーク境界</text>

  <line x1="145" y1="54" x2="145" y2="124" stroke="#1e293b" stroke-width="2" stroke-dasharray="5 3"/>
  <text x="145" y="146" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#1e293b">関数モック</text>
  <text x="145" y="162" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#475569">ここから先は動かない</text>

  <line x1="434" y1="54" x2="434" y2="124" stroke="#1e293b" stroke-width="2" stroke-dasharray="5 3"/>
  <text x="434" y="146" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#1e293b">MSW</text>
  <text x="434" y="162" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#475569">手前は全部動く</text>
</svg>

### 1. 関数ごと差し替える

`fetchUsers` という関数自体を、テスト中だけ偽物に入れ替える方法です（Vitest の `vi.mock` など）。

```ts
import { vi } from "vitest";

vi.mock("./api", () => ({
  fetchUsers: vi.fn().mockResolvedValue([{ id: 1, name: "田中" }]),
}));
```

手軽ですが、弱点があります。**本物の `fetchUsers` の中身が一切実行されない**ことです。URL の組み立て、`res.ok` のチェック、JSON の変換。そこにバグがあっても、関数ごと差し替えているので**素通り**します。テストしたい対象の一部を、テストの都合で無効化してしまっているのです。

### 2. ネットワークの境界で横取りする（MSW）

**MSW**（Mock Service Worker）は、差し替える場所を**ネットワークの出入り口**まで下げます。アプリのコードは 1 行も変えず、「このURL へのリクエストが来たら、この応答を返す」と宣言します。

```ts
// テスト用のハンドラ定義
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/users", () => {
    return HttpResponse.json([
      { id: 1, name: "田中" },
      { id: 2, name: "鈴木" },
    ]);
  }),
];
```

アプリ側の `fetchUsers` は**本物のまま全部実行されます**。fetch も呼ばれ、`res.ok` も通り、JSON 変換も走る。偽物なのは「ネットワークの向こうから返ってくる応答」だけ。

| | 関数モック | MSW |
|---|-----------|-----|
| 差し替える場所 | 自分のコードの途中 | ネットワークの境界 |
| 自分のコードの実行範囲 | 差し替えた先は実行されない | **全部実行される** |
| テストの信頼度 | 低め（一部を無効化している） | 高め（本物に近い動き） |
| アプリのコード変更 | import の構造に依存 | **一切不要** |

「**自分の書いたコードは全部動かし、外の世界だけ偽物にする**」。これが MSW の思想で、Testing Library の「使われ方に似せるほど信頼できる」という原則のネットワーク版と言えます。

## エラーや 0 件を自在に再現する

MSW の真価は、**本物のサーバーでは再現しにくい状況を自在に作れる**ことです。

```ts
// このテストのときだけ、サーバーエラーを返す
server.use(
  http.get("/api/users", () => {
    return new HttpResponse(null, { status: 500 });
  }),
);
```

```ts
// 0 件の応答
http.get("/api/users", () => HttpResponse.json([]));
```

「サーバーエラーのときにエラーメッセージが出るか」「0 件のときに空状態の画面が出るか」。境界値のテストで重要なこれらのケースが、ハンドラの差し替えだけで確実に再現できます。

さらに MSW はテスト以外でも使えます。**開発中のブラウザでも同じハンドラを動かせる**ので、「API がまだできていないのに画面を作る」「エラー画面のデザインを確認する」といった場面で、バックエンドを待たずに開発を進められます。

## AI のテストコードを見るポイント

1. **本物の API を叩いていないか**: テストが外部 URL に依存していたら、モックの導入を指示する
2. **何でも `vi.mock` していないか**: 自分のコード（URL 組み立てや res.ok チェック）まで無効化しているなら、「MSW でネットワーク境界だけモックして」と言い換える
3. **正常系だけになっていないか**: 500 と 0 件のハンドラを足すよう頼む。モックの価値は「意地悪な日を自由に作れる」ことにある

## まとめ

- 本物の API に依存するテストは遅く、不安定で、異常系を再現できない
- 関数モックは手軽だが自分のコードまで無効化し、MSW はネットワーク境界だけ偽装する
- 自分のコードは全部動かし外の世界だけ偽物にするのが、信頼できるテストの形
- MSW は 500 や 0 件を自在に再現でき、開発中のブラウザでも使える
