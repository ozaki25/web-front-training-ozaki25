# プロパティベーステスト — 例ではなく性質を書くテスト

## 今日のゴール

- 具体例を並べる例示ベースのほかに、性質を書くプロパティベースというテストの系統があると知る
- プロパティは「どんな入力でも成り立つ規則」で、ツールがランダムな入力で反例を探すと知る
- 見つかった反例は最小の形まで削られて報告される（shrinking）と知る

## 例示ベースのテストが確かめられる範囲

単体テストは、ふつうこう書きます。

```ts
// テスト対象: 数値の配列を昇順に並べ替えて返す
export function sortNumbers(numbers: number[]): number[] {
  return [...numbers].sort();
}
```

```ts
import { test, expect } from "vitest";
import { sortNumbers } from "./sortNumbers";

test("バラバラの配列が昇順に並ぶ", () => {
  expect(sortNumbers([3, 1, 2])).toEqual([1, 2, 3]);
});

test("空の配列はそのまま", () => {
  expect(sortNumbers([])).toEqual([]);
});
```

「この入力ならこの出力」という具体例を 1 つずつ並べる書き方です。これを**例示ベース**のテストと呼びます。同値分割（同じ扱いの入力を仲間に分けて代表を試す）や境界値（境目の値を狙う）といった技法も、突き詰めれば「どの具体例を選ぶか」を上手にやる方法です。

例示ベースには構造上の限界があります。**書いた例の範囲しか確かめられない**ことです。どの例を書くかを決めるのは人間なので、人間が思いつかなかった入力は、一度も試されないまま残ります。

実は上の `sortNumbers` にはバグがあります。それでもこの 2 本はどちらも成功します。このあとプロパティベースで捕まえます。

## 性質を書くという別の系統

具体例をひとつずつ増やす代わりに、**どんな入力でも成り立つはずの規則**をひとつ書く方法があります。この規則を**プロパティ（性質）**と呼び、この書き方を**プロパティベーステスト**と呼びます。

ソートなら、入力が何であれ、こんな規則が成り立つはずです。

- 結果は昇順に並んでいる
- 結果の長さは入力と同じ
- 結果に含まれる値の顔ぶれは入力と変わらない

「[3, 1, 2] を入れたら [1, 2, 3]」という個別の対応ではなく、入力全体にわたる規則として仕様を書くわけです。

ただし「どんな入力でも」を人間が手で試すことはできません。そこはツールに任せます。

## ツールがランダムな入力で反例を探す

プロパティベーステストのツールは、ランダムな入力を大量に自動生成して、性質が破れる入力を探します。この「性質が破れる入力」を**反例**と呼びます。元祖は Haskell の QuickCheck というライブラリで、いまでは多くの言語に移植されています。JS/TS では **fast-check** が定番です。

```ts
import fc from "fast-check";
import { test, expect } from "vitest";
import { sortNumbers } from "./sortNumbers";

test("どんな配列でもソート結果は昇順", () => {
  fc.assert(
    fc.property(fc.array(fc.integer()), (numbers) => {
      const sorted = sortNumbers(numbers);
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i - 1]).toBeLessThanOrEqual(sorted[i]);
      }
    })
  );
});
```

- `fc.array(fc.integer())`: 「整数の配列」という入力の作り方の指定。ここからランダムな配列が生成される
- `fc.property(...)`: 生成された入力を受け取り、性質が成り立つか確かめる関数を渡す
- `fc.assert(...)`: 生成と検証を繰り返し（既定では 100 回）、一度でも破れたらテストを失敗させる

このテストを実行すると失敗します。`sortNumbers` の中の `sort()` は、比較関数を渡さないと**要素を文字列に変換して辞書順で比べる**からです。`[3, 1, 2]` のような 1 桁の例では正しく見えますが、`[2, 10]` を入れると「"10" は "2" より小さい」と判定されて `[10, 2]` が返ります。桁数の違う数を混ぜた例を人間が思いつかなくても、ランダム生成は当たり前のように混ぜてきます。

修正は比較関数を渡すだけです。

```ts
export function sortNumbers(numbers: number[]): number[] {
  return [...numbers].sort((a, b) => a - b);
}
```

## 見つけた反例を最小化する

ランダム生成で最初に見つかる反例は、大きな数が何十個も並んだ読みにくい配列だったりします。ツールはそこで止まりません。**失敗が再現する範囲で反例を削っていき、できるだけ小さな形にしてから報告します**。この処理を **shrinking**（反例の最小化）と呼びます。さきほどのバグなら、桁数の違う数が 1 つずつ入った短い配列のあたりまで削られます。

<svg viewBox="0 0 540 260" role="img" aria-label="プロパティベーステストの流れ。入力をランダムに生成し、性質を確かめる。成り立てば次の入力でループし、破れたら反例を削って最小化し、最小の反例を報告する。" style="width:100%;height:auto;max-width:540px;display:block;margin:16px auto;">
  <defs>
    <marker id="d120-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker>
  </defs>
  <rect x="0" y="0" width="540" height="260" rx="10" fill="#f8fafc"/>

  <rect x="24" y="64" width="140" height="48" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="94" y="86" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#1e293b">入力を生成</text>
  <text x="94" y="103" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">ランダムに何度も</text>

  <line x1="164" y1="88" x2="216" y2="88" stroke="#64748b" stroke-width="2" marker-end="url(#d120-arrow)"/>

  <rect x="220" y="64" width="150" height="48" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="295" y="92" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#1e293b">性質を確かめる</text>

  <path d="M295,64 C295,26 94,26 94,64" fill="none" stroke="#64748b" stroke-width="2" marker-end="url(#d120-arrow)"/>
  <text x="194" y="34" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">成り立てば次の入力</text>

  <line x1="295" y1="112" x2="295" y2="156" stroke="#64748b" stroke-width="2" marker-end="url(#d120-arrow)"/>
  <text x="332" y="138" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">破れたら</text>

  <rect x="220" y="160" width="150" height="48" rx="8" fill="#e2e8f0" stroke="#1e293b" stroke-width="2.5"/>
  <text x="295" y="182" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#1e293b">反例を削る</text>
  <text x="295" y="199" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">最小化（shrinking）</text>

  <line x1="370" y1="184" x2="418" y2="184" stroke="#64748b" stroke-width="2" marker-end="url(#d120-arrow)"/>

  <rect x="422" y="160" width="100" height="48" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="472" y="182" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#1e293b">最小の反例</text>
  <text x="472" y="199" text-anchor="middle" font-family="sans-serif" font-size="10.5" fill="#475569">を報告</text>

  <text x="270" y="242" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">性質が破れたら、失敗が再現する範囲で反例を小さく削ってから報告する</text>
</svg>

つまり最終的な報告は「ランダムで何か壊れました」ではなく、「**この小さな具体例で失敗します**」です。人間が手で書いた失敗例と同じ感覚でデバッグに入れます。見つかった反例を例示ベースのテストとして書き足しておけば、同じバグの再発も防げます。

## 例示ベースとの使い分け

どちらが上位という関係ではなく、得意な相手が違います。

| | 例示ベース | プロパティベース |
|---|---|---|
| 書くもの | 入力と期待する出力の具体例 | どんな入力でも成り立つ規則 |
| 入力を選ぶのは | 人間 | ツールがランダムに生成 |
| 得意なこと | 仕様の境目や既知の重要ケースの固定 | 思いつかない入力での規則の検証 |

- **仕様の境目は例示で**: 「3000 円ちょうどで送料無料」のような業務の大事な値は、境界値としてピンポイントの例で固定する。ランダム生成がちょうど 3000 を引き当てる保証はない
- **入力全体の規則はプロパティで**: 往復や不変条件のような、入力を選ばない規則を任せる

### プロパティの定番パターン

- **往復（ラウンドトリップ）**: エンコードしてデコードすると元に戻る。`decode(encode(x))` が `x` に一致する。シリアライズ・パース・変換の関数で使える
- **不変条件**: 処理の前後で変わらないものを確かめる。ソートしても長さは変わらない、フィルタの結果は元の一部
- **別実装との一致**: 遅くても確実に正しい素朴な実装を用意し、結果が一致するか比べる

## 向いている対象と難しさ

向いているのは、変換・エンコード・パース・ソート・日付計算のような、**入出力に規則がある純粋な関数**です。フロントエンドでも、フォーム入力の正規化やクエリ文字列の組み立てなど、この形のロジックは意外とあります。逆に UI コンポーネントそのものには向きません。「どんな入力でも成り立つ規則」を言葉にしにくいからです。

難しさは、**良いプロパティを見つけること自体が設計**だという点です。ありがちな失敗は、期待値を出すためにテストの中で対象と同じロジックをもう一度書いてしまうことです。それでは同じ勘違いを両側に写すだけで、何も確かめられません。出力そのものではなく「出力が満たす規則」を探すのがコツです。

## AI への指示とテストの確認

- **指示**: 「この変換関数はプロパティベースでもテストして。fast-check で往復が成り立つことを確かめて」と、系統とプロパティを名指しで頼める
- **確認**: プロパティの中身が対象ロジックの再実装になっていないか、仕様の境目を固定する例示のテストが残っているか

例示ベースだけのテスト一式を見たとき、「往復や不変条件をプロパティで足せないか」という問い方ができるようになります。

## まとめ

- 例示ベースは書いた例しか確かめられず、プロパティベースはどんな入力でも成り立つ規則を確かめる
- fast-check はランダムな入力で性質を検証し、破れたら反例を最小化して小さな具体例で報告する
- 境目は例示で固定し、往復や不変条件のような規則はプロパティに任せて併用する
