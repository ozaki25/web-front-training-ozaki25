# Day 35: テスト計画 — 限られた工数をどこにかけるか

## 今日のゴール

- 全部はテストできないので、限られた工数を配分すると知る
- 厚くする対象を「機能ごと（リスク）」と「層ごと（ピラミッド/トロフィー）」の 2 つで考えると知る
- AI が量産できる今、何を選ぶべきかを従来と対比して知る

## 全部はテストできない

「全部テストすれば安心」と思いたくなります。でも、あらゆる入力・あらゆる組み合わせを試すのは、そもそも不可能です。

入力欄が 1 つあるだけでも、あり得る入力は無限にあります（文字数・文字種・記号・空・超長文…）。組み合わせれば天文学的な数になり、現実的な時間では終わりません。

「**全数テストは不可能**」は、テストの原則のひとつです。だからプロも「全部」ではなく「どこに力を入れるか」を決めます。この**力のかけどころを決めるのがテスト計画**です。見方は 2 つあります。

- **機能で見る**: どの機能を厚く／薄くするか（リスク）
- **層で見る**: どの種類のテストをどの割合で持つか（ピラミッド/トロフィー）

## どの機能を厚くするか（リスク）

力の入れどころは、リスクで決めます。この進め方を**リスクベースドテスト**と呼びます。リスクの大きさ（リスクレベル）は、2 つの掛け合わせで決まります。

- **リスクの影響**: そこが壊れたときの痛手（決済が止まるのと、端の表示が少しずれるのとでは、重みが違う）
- **リスクの可能性**: そこが間違っている・壊れる確率の高さ（複雑な条件分岐や、最近変更した箇所は高い）

<svg viewBox="0 0 480 340" role="img" aria-label="リスクで濃淡を決めるマトリクス。縦軸が影響で上ほど痛手が大きい、横軸が起きやすさで右ほど間違えやすい。右上の影響大かつ起きやすいが最重点、左上の影響大かつ起きにくいはやる、右下の影響小かつ起きやすいはそこそこ、左下の影響小かつ起きにくいは後回し。" style="width:100%;height:auto;max-width:480px;display:block;margin:16px auto;">
  <rect x="0" y="0" width="480" height="340" rx="10" fill="#f8fafc"/>

  <text x="58" y="110" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">影響 大</text>
  <text x="58" y="224" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">影響 小</text>

  <rect x="118" y="50" width="150" height="110" rx="6" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="193" y="100" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#1e293b">やる</text>
  <text x="193" y="120" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#475569">影響大・起きにくい</text>

  <rect x="272" y="50" width="150" height="110" rx="6" fill="#e2e8f0" stroke="#1e293b" stroke-width="2.5"/>
  <text x="347" y="94" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#1e293b">最重点</text>
  <text x="347" y="113" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#475569">影響大・起きやすい</text>
  <text x="347" y="131" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#475569">決済・ログイン</text>

  <rect x="118" y="164" width="150" height="110" rx="6" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="193" y="214" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#1e293b">後回し</text>
  <text x="193" y="234" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#475569">影響小・起きにくい</text>

  <rect x="272" y="164" width="150" height="110" rx="6" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="347" y="214" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#1e293b">そこそこ</text>
  <text x="347" y="234" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#475569">影響小・起きやすい</text>

  <text x="193" y="292" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">起きにくい</text>
  <text x="347" y="292" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">起きやすい</text>

  <text x="270" y="320" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">影響（痛手）と起きやすさが高いほど、厚くテストする</text>
</svg>

この 2 軸の図を**リスクマトリクス**と呼びます（大小で見積もる定性的なやり方。数値で出すなら、リスクレベルは可能性と影響の掛け算です）。読み方はシンプルです。

- **右上（最重点）**: 決済・ログイン・複雑な割引ロジック。境界値や組み合わせまで厚く
- **左下**: めったに使わない画面の細部など。薄く、または今はやらない

### 厚くする所はコアドメインと重なる

この「影響が大きい所」は、**ドメイン駆動設計**でいう**コアドメイン**とよく重なります。事業のどの部分かを、2 つの軸で見分ける考え方です。

- **競合との差になるか**: 自分たちの強みか、どこにでもある機能か
- **ロジックが複雑か**: 作り込みが要るか、単純か

<svg viewBox="0 0 480 340" role="img" aria-label="コアドメインを見分ける2軸の図。縦軸が業務ロジックの複雑さで上ほど複雑、横軸が競合との差別化で右ほど差になる。右上の複雑かつ差になる所がコアドメインで最も手厚く見る。左上の複雑だが差にならない所は汎用で既製品や外部サービスに任せる。下段の単純な所は支援で、軽く作るか AI に任せる。" style="width:100%;height:auto;max-width:480px;display:block;margin:16px auto;">
  <rect x="0" y="0" width="480" height="340" rx="10" fill="#f8fafc"/>

  <text x="56" y="108" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">複雑</text>
  <text x="56" y="222" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">単純</text>

  <rect x="118" y="50" width="150" height="110" rx="6" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="193" y="96" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#1e293b">汎用（一般）</text>
  <text x="193" y="116" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#475569">既製品・外部サービス</text>

  <rect x="272" y="50" width="150" height="110" rx="6" fill="#e2e8f0" stroke="#1e293b" stroke-width="2.5"/>
  <text x="347" y="90" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#1e293b">コアドメイン（中核）</text>
  <text x="347" y="110" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#475569">最も手厚く</text>
  <text x="347" y="127" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#475569">人が伴走して見る</text>

  <rect x="118" y="164" width="150" height="110" rx="6" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="193" y="214" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#1e293b">支援（補完）</text>
  <text x="193" y="234" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#475569">軽く作る</text>

  <rect x="272" y="164" width="150" height="110" rx="6" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="347" y="214" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#1e293b">支援（補完）</text>
  <text x="347" y="234" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#475569">AI に任せる</text>

  <text x="193" y="292" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">差にならない</text>
  <text x="347" y="292" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">競合との差になる</text>

  <text x="270" y="320" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">複雑さ × 競合との差。右上の中核を最も手厚く見る</text>
</svg>

この見方で、機能は 3 種類に分かれます。

- **コアドメイン（中核）**: 複雑で、競合との差になる中心。決済・料金計算・独自の推薦など。壊れると事業が止まり、他社から買うこともできない。**最も手厚くテスト・レビューする**
- **汎用（一般）**: 複雑だが差にはならない、どこでも同じ部分。認証やメール配信など。**自分で作り込まず、既製品や外部サービスに任せる**
- **支援（補完）**: 単純で差にもならない部分。管理画面の一覧など。**軽く作る**

AI で開発する今、この 3 分類はそのまま「どこを人が手厚く見るか」の判断に効きます。中核は人が伴走して厚く見る、汎用は買う、支援は AI に任せる。つまり手厚くテスト・レビューする先を選ぶことは、自分たちの価値の中心（コアドメイン）を見極める作業でもあります。

## どの層を厚くするか

もう 1 つの軸は「テストの層」です。テストには粒度の違う層があり、コストと確信の強さが違います。

| 層 | 確かめるもの | 例 |
|----|------------|---|
| **静的解析** | 実行せずに分かる間違い | TypeScript の型チェック、ESLint |
| **ユニット** | 関数・部品単体の正しさ | 送料計算の関数、ボタン単体 |
| **結合（インテグレーション）** | 部品を組み合わせた振る舞い | フォーム一式が「入力 → 送信 → 結果表示」まで動く |
| **E2E** | 本物のブラウザで端から端まで | ログインして購入できる |

下の層ほど**速くて安くて、原因の特定が簡単**。上の層ほど**本物に近くて確信が強いが、遅くて壊れやすい**。では、それぞれを何割ずつ持つべきか。この配分には、形の名前が付いています。

### テストピラミッド（古典）

古典的な答えが**テストピラミッド**です。JSTQB でも、テストの粒度と自動化・工数配分を示すモデルとして扱われています。

<svg viewBox="0 0 460 240" role="img" aria-label="テストピラミッドの図。三角形の 3 層で、幅が本数の目安。下ほど幅が広い。下からユニット（たくさん）、結合（ほどほど）、頂点が E2E（少なく）。下の層ほど安く速く、多く持つ。" style="width:100%;height:auto;max-width:460px;display:block;margin:16px auto;">
  <rect x="0" y="0" width="460" height="240" rx="10" fill="#f8fafc"/>
  <polygon points="180,36 280,36 312,92 148,92" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="230" y="70" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#1e293b">E2E（少なく）</text>
  <polygon points="148,96 312,96 344,152 116,152" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="230" y="130" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#1e293b">結合（ほどほど）</text>
  <polygon points="116,156 344,156 376,212 84,212" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="230" y="190" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#1e293b">ユニット（たくさん）</text>
  <text x="230" y="230" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">幅は本数の目安（下ほど安く速く、多く持つ）</text>
</svg>

**安くて速い層を土台にたくさん、高くて遅い層は頂点に少しだけ**。E2E の三重苦（遅い・壊れやすい・原因が遠い）を踏まえれば、自然な結論です。サーバーサイドの世界では、いまもこれが基本形です。レイヤーの数や名前は文脈で変わります（ユニット／サービス／UI と分けることもある）。

### テストトロフィー（フロントエンド）

React のようなコンポーネントベースのフロントエンドでは、ピラミッドを変形させた**テストトロフィー**という配分が広く支持されています（Kent C. Dodds が提唱）。トロフィー（優勝カップ）の形に 4 層を当てはめたものです。

<svg viewBox="0 0 460 400" role="img" aria-label="テストトロフィーの図。トロフィーの形で、幅が本数の目安。上の小さな口が E2E（少なく）、いちばん太い胴が結合（いちばん厚く、取っ手つき）、脚の上がユニット（ほどほど）、台座が静的解析（土台・全部に効く）。結合が最も厚い。" style="width:100%;height:auto;max-width:460px;display:block;margin:16px auto;">
  <rect x="0" y="0" width="460" height="400" rx="10" fill="#f8fafc"/>
  <path d="M92,150 C46,152 46,214 104,214" fill="none" stroke="#94a3b8" stroke-width="9"/>
  <path d="M368,150 C414,152 414,214 356,214" fill="none" stroke="#94a3b8" stroke-width="9"/>
  <rect x="163" y="96" width="134" height="36" rx="6" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="230" y="120" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#1e293b">E2E（少なく）</text>
  <rect x="78" y="136" width="304" height="66" rx="10" fill="#e2e8f0" stroke="#1e293b" stroke-width="2.5"/>
  <text x="230" y="175" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="#1e293b">結合（いちばん厚く）</text>
  <rect x="146" y="206" width="168" height="44" rx="6" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="230" y="233" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#1e293b">ユニット（ほどほど）</text>
  <rect x="205" y="250" width="50" height="28" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
  <rect x="120" y="278" width="220" height="42" rx="6" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="230" y="305" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#1e293b">静的解析（土台・全部に効く）</text>
  <text x="230" y="352" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">幅は本数の目安。結合がいちばん厚いのがトロフィー型</text>
</svg>

ピラミッドとの違いは 2 つです。

- **最厚は「結合」**: フロントエンドのバグの多くは、部品単体でなく**配線**で起きる。「入力してボタンを押したら結果が出る」の組み合わせを確かめる結合テストが、ユーザー価値に近い割に E2E より速くて安定。コストパフォーマンスの最良点
- **土台は「静的解析」**: TypeScript と ESLint は、テストを 1 本も書かなくても全コードを常時チェックする。最安の層として土台に数える

### 崩れた配分（アンチパターン）

配分が崩れた状態にも、名前が付いています。

- **逆ピラミッド（アイスクリームコーン）**: E2E ばかり大量。実行に時間がかかり、毎日どれかが flaky に倒れ、誰も結果を信じなくなる
- **砂時計**: ユニットと E2E はあるのに中間が無い。部品は正しいのに配線のバグが E2E まで素通りし、原因の特定に時間が溶ける

形は絶対のルールではなく目安です。大事なのは「安く速い層を厚く、遅く壊れやすい層は薄く」という重心です。

## AI がテストを量産できる今、何を選ぶか

ここが従来といちばん変わったところです。

従来（人が手で書いた時代）は、**テストを書くコスト自体が高い**のが最大の制約でした。だから「いかに少ない本数で広く守るか」が主眼で、高コストな E2E を頂点に少しだけ置くピラミッドが理にかなっていました。

AI がテストを量産できる今、その**生産コストはほぼ消えました**。でも、それで制約が無くなったわけではありません。制約が移っただけです。

| | 従来 | AI が量産できる今 |
|---|---|---|
| 主な制約 | テストを書くコスト | 遅さ・壊れやすさ（flaky）・保守・信頼 |
| 主眼 | いかに少なく書くか | どの層に、どんな質のテストを置くか |
| 人の仕事 | テストを書くこと | 配分と質を決め、取捨すること |

「遅い・壊れやすい・信じられない」テストは、**誰が書いても負債**です。AI が 100 本の E2E を一瞬で生んでも、それが毎日 flaky に倒れるなら価値はマイナスになります。だから選び方はこうなります。

- **静的解析・型**: タダで常時効く。AI と関係なく、まず土台を固める
- **結合**: ユーザー価値に近く、E2E より速く安定。**AI に量産させる主戦場**
- **E2E**: 遅く壊れやすいのは量産できても変わらない。クリティカルパスに絞る
- **ユニット**: 複雑な計算ロジックなど、単体で固めたい所に絞る

量産できる時代だからこそ、「何本書いたか」ではなく「**どの層に・どんな質を置くか**」を決める判断が、人の仕事として残ります。

## どこまでやるか（止めどき）

テストには入口と出口の基準があります。

- **開始基準**: テストを始める前提（環境が整う・スモークテストが通る、など）
- **終了基準**: テストをやめてよい条件

止めどきは、この終了基準の話です。目指すのは 100% ではありません（カバレッジが 100% でもバグは残ります）。十分かどうかは、たとえばこんな状態を目安にします。

- クリティカルパス（事業が止まる動線）が通る
- 重要な境界値が押さえてある
- 最近変更した箇所が守られている

価値の高い順に埋めていき、追加の 1 本で減らせるリスクが小さくなったら、そこが**止めどき**です。

時間は有限です。費用対効果が落ちてきたら、その先は別の機能のテストに時間を回すほうが、全体の安心は増えます。

## まとめ

- 全部はテストできないので、限られた工数を配分する
- 厚くする対象は 2 つの見方、機能ごと（リスク）と層ごと（ピラミッド/トロフィー）
- AI が量産できる今、制約は「作る量」から「遅さ・壊れやすさ・信頼」へ移り、選ぶのが人の仕事
- 止めどきは終了基準で決め、100% は目指さない
