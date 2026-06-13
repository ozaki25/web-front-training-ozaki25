# strict の仕組み — TypeScript はどこまで守ってくれるのか

## 今日のゴール

- tsconfig.json が「TypeScript の厳しさの調整盤」だと知る
- strict が何を守ってくれるか、代表例で知る
- パスエイリアス（@/）の正体を知る

## 触らないのに、効いているファイル

Next.js のプロジェクトには `tsconfig.json` というファイルが最初からあります。ほとんどの人は中身を触りませんが、**TypeScript の働き方はすべてこのファイルが決めています**。

全部を理解する必要はありません。読めると得をする項目は、実質 2 つです。**strict** と **paths**。

## strict — 厳しさの親スイッチ

`tsconfig.json` の中で最も重要な 1 行がこれです。

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

`strict: true` は、TypeScript の**厳格チェック群をまとめて有効にする親スイッチ**です。Next.js のテンプレートでは最初から有効になっています。

「厳しい」と聞くと面倒に感じますが、実際に守ってくれるものを見ると、印象が変わります。

### 守り 1: null / undefined の見落とし

strict の中で最も働き者なのが `strictNullChecks` です。

```ts
type User = { id: number; name: string };

function findUser(id: number): User | undefined {
  return users.find((u) => u.id === id); // 見つからなければ undefined
}

const user = findUser(42);
console.log(user.name);
//          ~~~~ ❌ strict: 'user' is possibly 'undefined'
```

「**見つからないかもしれない**」値をそのまま使おうとすると、**実行する前に**エラーになります。実行時エラーの王様「undefined のプロパティを読んだ」を、書いた瞬間に検出してくれる。strict を切ると、このチェックが丸ごと消えます。

```ts
// strict ならこう書くことを強制される（= バグが構造的に減る）
if (user) {
  console.log(user.name); // ここでは User だと確定している
}
```

### 守り 2: 暗黙の any

`any` は「型チェックを放棄する」特別な型です。strict（の中の `noImplicitAny`）は、**意図せず any になる**ことを禁止します。

```ts
// ❌ strict: 引数 item の型が暗黙の any になっている
function getPrice(item) {
  return item.price;
}

// ✅ 型を書くことを求められる
function getPrice(item: { price: number }) {
  return item.price;
}
```

any が紛れ込むと、その値に関するチェックはすべて素通りになります（タイポも、無いプロパティへのアクセスも、エラーになりません）。strict は「チェックの空白地帯を作らせない」ためのルールです。

### strict を切りたくなったら

エラーが大量に出ると「`strict: false` にすれば消えるのでは」という誘惑が生まれ、AI も「とりあえず動かす」ためにそれを提案することがあります。

これは**火災報知器ごと取り外す**対応です。エラーが消えるのは問題が解決したからではなく、検出をやめたからです。個々のエラーを直すか、どうしても暫定対応が要る箇所だけ限定的に逃げる（その行だけの例外コメント）のが筋で、**親スイッチには触らない**が原則です。

## paths — 「@/」の正体

import 文でよく見るこの書き方も、tsconfig が作っています。

```ts
import { Button } from "@/components/button";
```

`@/` は npm のパッケージではなく、**パスエイリアス**（パスの別名）です。tsconfig にこう書いてあります。

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

「`@/` で始まる import は `./src/` のことだと思って解決して」という定義です。これが無いと、深い階層のファイルからの import が `../../../components/button` のような**相対パスの遡り地獄**になります。エイリアスなら、どこから import しても同じ書き方で済みます。

「`@/lib/utils` が見つからないというエラーが出た」ときに見る場所は、この `paths` 設定です。エイリアスとプロジェクトの定義が食い違っている事故は珍しくありません。

## その他は「触る時が来たら」でいい

tsconfig には数十のオプションがありますが、`target`（どの世代の JavaScript に変換するか)や `moduleResolution`（import の解決方式）などは、**フレームワークのテンプレートが適切に設定済み**です。エラーメッセージに導かれてピンポイントで調べれば足ります。

覚えておくべき全体像は 1 つです。**tsconfig は「TypeScript がどれだけ守ってくれるか」の契約書で、strict: true はその契約の品質保証**。プロジェクトを引き継いだら、まず strict が有効かを見る。それだけで、そのコードベースの型の信頼度の見当が付きます。

## まとめ

- tsconfig.json は TypeScript の働き方の調整盤。読むべきは strict と paths
- strict は null チェックと暗黙 any 禁止の親スイッチ。実行前にバグを検出する網
- エラーが多くても strict: false にしない。報知器ごと外す対応になる
- `@/` は paths が定義するエイリアス。「見つからない」はここを見る
