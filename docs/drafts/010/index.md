# Storybook 駆動開発 — 画面からではなく部品から作る

## 今日のゴール

- 画面から作る進め方の限界を知る
- 部品から作る（Storybook 駆動）という順序の逆転を知る
- 「Story が書きにくい部品は設計が悪い」というシグナルを知る

## 動かして確認するのが、地味に大変

AI に画面を作ってもらうと、たいてい「ページ」単位でコードが返ってきます。商品一覧ページ、注文確認ページ、といった単位です。

その中のボタン 1 つの見た目を直したいとします。確認するには、こうなります。

- アプリを起動する
- ログインする
- 何度か画面を遷移して、そのボタンがある画面まで行く
- やっと確認できる

直すたびにこれを繰り返します。さらに厄介なのが<strong>状態</strong>です。ボタンには複数の状態があります。

| 状態 | 画面で再現するには |
|------|------------------|
| 通常 | そのまま |
| 押せない（disabled） | 特定の条件を満たす操作が必要 |
| 読み込み中（loading） | 通信が遅い状況をわざと作る |
| エラー | サーバーをわざと失敗させる |

「読み込み中の見た目」を確認するために通信をわざと遅くする、といった手間が毎回かかります。すべての状態を画面上で再現するのは、現実的ではありません。

## 部品から作る — 順序を逆にする

この問題を解決するのが、画面ではなく<strong>部品（コンポーネント）から作る</strong>という発想です。そのための道具が <strong>Storybook</strong> です。

Storybook は、部品を 1 つだけ、アプリから切り離して表示できる場所です。部品の各状態を <strong>Story</strong>（その部品の「ある状態の見本」）として書いて並べます。

```tsx
// Button.stories.tsx
import { Button } from "./Button";

export default { component: Button };

export const 通常 = { args: { label: "送信" } };
export const 押せない = { args: { label: "送信", disabled: true } };
export const 読み込み中 = { args: { label: "送信", loading: true } };
```

これを Storybook で開くと、3 つの状態が一覧で並びます。画面を操作して辿り着く必要も、通信を遅くする必要もありません。

```mermaid
flowchart LR
  A["部品を作る"] --> B["Story で全状態を確認"]
  B --> C["画面に組み込む"]
```

先に部品を単体で完成させ、画面に組み込むのは最後。これが <strong>Storybook 駆動開発</strong>です。「画面 → 部品」だった順序を「部品 → 画面」に逆転させます。

## 副産物として、設計が良くなる

Storybook 駆動には、もう一つ大きな効果があります。<strong>部品の設計が自然と良くなる</strong>ことです。

部品を単体で表示するには、アプリから切り離せる必要があります。逆に言うと、切り離せない部品は Story が書けません。

たとえば、部品の中で直接 API を叩いていたらどうなるでしょうか。

```tsx
// Story にしづらい部品: 中で勝手に通信している
function UserCard() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetch("/api/user").then((r) => r.json()).then(setUser);
  }, []);
  return <div>{user?.name}</div>;
}
```

これを Storybook で表示しようとすると、`/api/user` への通信が必要になり、単体で見せられません。

データを<strong>外から受け取る</strong>形にすると、Story が書けるようになります。

```tsx
// Story にしやすい部品: データは props で受け取る
function UserCard({ user }: { user: { name: string } }) {
  return <div>{user.name}</div>;
}
```

こうすれば、Story から好きなデータを渡して各状態を表示できます。

ここに法則があります。

- <strong>Story が書きやすい部品 = アプリから切り離せる = 良い設計</strong>
- <strong>Story が書きにくい部品 = 何かに依存しすぎている = 見直すサイン</strong>

Storybook は単なる確認ツールではなく、設計の良し悪しを映す鏡にもなります。

## まとめ

- 画面から作ると、部品の確認に毎回画面を辿る必要があり、全状態の再現も大変
- <strong>Storybook</strong> は部品を単体で表示する場所。状態ごとに <strong>Story</strong> を並べて一覧で確認できる
- 部品から作り、画面への組み込みを最後にするのが <strong>Storybook 駆動開発</strong>
- Story が書きにくい部品は依存しすぎのサイン。Storybook は設計の鏡にもなる
- AI に「全状態の Story を作って」と頼めば、部品の挙動を一覧でレビューできる
