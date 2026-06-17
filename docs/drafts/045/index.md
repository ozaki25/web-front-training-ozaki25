# 色のアクセシビリティ — 自分の見え方が全員の見え方ではない

## 今日のゴール

- 目が色を感じる仕組み（3 種の錐体）を知る
- P 型・D 型・T 型で混同する色が違う理由を知る
- 色覚の多様性が珍しくない事実を知る

## 色の見え方は 1 つではない

赤いエラーメッセージ、緑の成功バッジ。画面の色には意味を持たせることが多いですが、その色が全員に同じように見えている保証はありません。

特定の色の組み合わせが区別しにくい**色覚多様性**は、日本では男性の約 5%（20 人に 1 人）にみられます。学校の 1 クラスに 1 人いる計算で、まったく珍しくありません。

なぜ人によって見え方が違うのか。それを理解するには、光と目の仕組みを少しだけ知る必要があります。

## 色は光の波長で決まる

光は波長によって色が変わります。人間の目が感じ取れる範囲（**可視光線**）は約 380nm〜780nm で、短い方が青紫、長い方が赤です。

<figure class="c45-fig">
<svg class="c45-visible" viewBox="0 0 640 90" role="img" aria-label="可視光線の波長と色の対応。380nmが紫、450nmが青、520nmが緑、580nmが黄、620nmが橙、700nmが赤">
  <rect width="640" height="90" fill="#f8fafc" rx="6"/>
  <defs>
    <linearGradient id="c45-vis-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#7b00ff"/>
      <stop offset="15%" stop-color="#0044ff"/>
      <stop offset="35%" stop-color="#00ccaa"/>
      <stop offset="50%" stop-color="#44dd00"/>
      <stop offset="65%" stop-color="#ffdd00"/>
      <stop offset="80%" stop-color="#ff8800"/>
      <stop offset="100%" stop-color="#ff0000"/>
    </linearGradient>
  </defs>
  <rect x="40" y="14" width="560" height="30" rx="4" fill="url(#c45-vis-grad)"/>
  <g font-family="sans-serif" font-size="11" fill="#1e293b" text-anchor="middle">
    <text x="40" y="62">380</text>
    <text x="124" y="62">450</text>
    <text x="236" y="62">520</text>
    <text x="320" y="62">580</text>
    <text x="404" y="62">620</text>
    <text x="600" y="62">700</text>
    <text x="320" y="82" fill="#64748b" font-size="12">波長 (nm)</text>
  </g>
  <g font-family="sans-serif" font-size="10" fill="#1e293b" text-anchor="middle">
    <text x="40" y="10">紫</text>
    <text x="124" y="10">青</text>
    <text x="236" y="10">緑</text>
    <text x="320" y="10">黄</text>
    <text x="404" y="10">橙</text>
    <text x="600" y="10">赤</text>
  </g>
</svg>
</figure>

虹の色順と同じです。リンゴが赤く見えるのは、赤の波長を反射して他を吸収しているからです。

## 目が光を色に変える仕組み

光は目の表面（角膜）から入り、水晶体でピントを合わされ、奥の**網膜**に像を結びます。

<figure class="c45-fig">
<svg class="c45-eye" viewBox="0 0 600 280" role="img" aria-label="目の断面図。光が角膜から入り、水晶体を通って網膜に届く。網膜に錐体と桿体がある">
  <rect width="600" height="280" fill="#f8fafc" rx="8"/>
  <!-- 光の矢印 -->
  <g stroke="#d97706" stroke-width="2">
    <line x1="30" y1="110" x2="148" y2="132"/>
    <line x1="30" y1="170" x2="148" y2="148"/>
  </g>
  <text x="40" y="98" font-family="sans-serif" font-size="13" fill="#92400e" font-weight="700">光</text>
  <!-- 眼球 -->
  <circle cx="300" cy="140" r="120" fill="#eff6ff" stroke="#475569" stroke-width="2"/>
  <!-- 網膜（後ろ半分を強調） -->
  <path d="M300,20 A120 120 0 0 1 300,260" fill="none" stroke="#ec4899" stroke-width="5" stroke-opacity="0.6"/>
  <!-- 角膜 -->
  <path d="M180,110 A50 50 0 0 0 180,170" fill="#dbeafe" stroke="#475569" stroke-width="2"/>
  <!-- 虹彩 -->
  <line x1="188" y1="102" x2="200" y2="122" stroke="#475569" stroke-width="4"/>
  <line x1="188" y1="178" x2="200" y2="158" stroke="#475569" stroke-width="4"/>
  <!-- 水晶体 -->
  <ellipse cx="210" cy="140" rx="16" ry="32" fill="#bfdbfe" stroke="#2563eb" stroke-width="2"/>
  <!-- 黄斑 -->
  <circle cx="418" cy="140" r="7" fill="#eab308"/>
  <!-- 視神経 -->
  <path d="M415,165 C445,200 460,220 480,235" fill="none" stroke="#a78bfa" stroke-width="6" stroke-linecap="round"/>
  <!-- ラベル -->
  <g font-family="sans-serif" font-size="12" fill="#1e293b">
    <line x1="170" y1="80" x2="182" y2="112" stroke="#94a3b8" stroke-width="1"/>
    <text x="170" y="74" text-anchor="middle">角膜</text>
    <line x1="210" y1="76" x2="210" y2="106" stroke="#94a3b8" stroke-width="1"/>
    <text x="210" y="70" text-anchor="middle">水晶体</text>
    <text x="305" y="144" text-anchor="middle" fill="#64748b" font-size="11">硝子体</text>
    <line x1="460" y1="90" x2="422" y2="132" stroke="#94a3b8" stroke-width="1"/>
    <text x="478" y="84" text-anchor="middle" font-size="13" fill="#1e293b" font-weight="700">網膜</text>
    <text x="478" y="100" text-anchor="middle" font-size="11" fill="#64748b">（錐体・桿体）</text>
    <line x1="510" y1="245" x2="478" y2="233" stroke="#94a3b8" stroke-width="1"/>
    <text x="540" y="250" text-anchor="middle" fill="#7c3aed">視神経 → 脳へ</text>
  </g>
</svg>
</figure>

網膜には 2 種類の感光細胞があります。

- **錐体**（すいたい）: 明るい場所で働き、**色を識別**する
- **桿体**（かんたい）: 暗い場所で働き、**明暗だけ**を感じる

色を見分けるのは錐体の仕事です。錐体には 3 種類あり、それぞれ反応する波長が違います。

| 錐体 | 反応する波長 | 別名 |
|------|------------|------|
| L 錐体 | 長い波長（赤〜黄） | 赤錐体 |
| M 錐体 | 中間の波長（緑） | 緑錐体 |
| S 錐体 | 短い波長（青） | 青錐体 |

各錐体がどの波長にどれだけ反応するかを描いたのが、次の感度曲線です。

<figure class="c45-fig">
<svg class="c45-spectrum" viewBox="0 0 760 320" role="img" aria-label="3種類の錐体の感度曲線。S錐体は短波長（青）、M錐体は中波長（緑）、L錐体は長波長（赤〜黄）にピークをもつ">
  <rect width="760" height="320" fill="#f8fafc"/>
  <text x="380" y="28" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="700" fill="#1e293b">3 種の錐体の感度曲線</text>
  <line x1="70" y1="270" x2="720" y2="270" stroke="#475569" stroke-width="1.5"/>
  <line x1="70" y1="50" x2="70" y2="270" stroke="#475569" stroke-width="1.5"/>
  <text x="38" y="160" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#64748b" transform="rotate(-90 38 160)">感度</text>
  <g font-family="sans-serif" font-size="11" fill="#1e293b" text-anchor="middle">
    <line x1="114" y1="270" x2="114" y2="276" stroke="#475569"/><text x="114" y="290">400</text>
    <line x1="310" y1="270" x2="310" y2="276" stroke="#475569"/><text x="310" y="290">500</text>
    <line x1="506" y1="270" x2="506" y2="276" stroke="#475569"/><text x="506" y="290">600</text>
    <line x1="700" y1="270" x2="700" y2="276" stroke="#475569"/><text x="700" y="290">700</text>
    <text x="390" y="310" font-size="12" fill="#64748b">波長 (nm)</text>
  </g>
  <path d="M70,270 C105,270 125,75 152,70 C179,75 220,270 275,270 Z" fill="#1f6fd6" fill-opacity="0.18" stroke="#1f6fd6" stroke-width="2.5"/>
  <path d="M240,270 C305,268 350,68 385,64 C424,68 495,268 570,270 Z" fill="#2ca02c" fill-opacity="0.18" stroke="#2ca02c" stroke-width="2.5"/>
  <path d="M285,270 C360,268 415,66 445,62 C483,66 570,268 665,270 Z" fill="#d62728" fill-opacity="0.16" stroke="#d62728" stroke-width="2.5"/>
  <g font-family="sans-serif" font-size="13" font-weight="700">
    <text x="152" y="58" text-anchor="middle" fill="#1f6fd6">S 錐体</text>
    <text x="370" y="52" text-anchor="middle" fill="#2ca02c">M 錐体</text>
    <text x="472" y="50" text-anchor="middle" fill="#d62728">L 錐体</text>
  </g>
</svg>
</figure>

脳はこの 3 つの錐体からの信号の**組み合わせ**で色を作ります。赤い光が来ると L 錐体が強く反応し、緑の光なら M 錐体が強く反応する。3 つの信号の比率が「色」になります。

ここで感度曲線をもう一度見てください。**L 錐体と M 錐体のピークが非常に近い**ことに気づきます。S 錐体だけ離れた位置にある。この「近さ」が、色覚タイプごとの見え方の違いに直結します。

## P 型・D 型・T 型

3 種の錐体のうちどれかが弱い、あるいは欠けていると、特定の色が区別しにくくなります。

| タイプ | 弱い錐体 | 区別しにくい色 | 割合（日本の男性） |
|--------|---------|--------------|------------------|
| **P 型**（1 型） | L 錐体（赤） | 赤と緑、赤と茶 | 約 1.5% |
| **D 型**（2 型） | M 錐体（緑） | 赤と緑、緑と茶 | 約 3.5% |
| **T 型**（3 型） | S 錐体（青） | 青と緑、黄と白 | まれ |

### なぜ赤緑系（P 型・D 型）が多いか

感度曲線の形がその答えです。L 錐体と M 錐体はピークが近く、担当する波長の範囲が大きく重なっています。どちらか一方が弱くなると、重なっている領域の色（赤〜緑）を区別する手がかりが失われます。

P 型（L 錐体が弱い）と D 型（M 錐体が弱い）で混同する色が似ているのも、この重なりが理由です。ただし完全に同じではなく、P 型は赤が暗く見える傾向があります。L 錐体は赤寄りの波長を担当しているので、それが弱いと赤い光の明るさ自体が落ちるためです。

**D 型が最も多い**のは、L 錐体と M 錐体の遺伝子が X 染色体上で隣り合っていて、M 錐体の遺伝子に変異が起きやすいためです。男性は X 染色体が 1 本しかないので、変異があるとそのまま色覚に影響します。女性は X 染色体が 2 本あり、片方が正常なら補えるため、頻度が大幅に低くなります（男性 約 5% に対し、女性 約 0.2%）。

### なぜ T 型はまれか

S 錐体の遺伝子は X 染色体ではなく**7 番染色体**にあります。性別に関係なく 2 本あるため、片方に変異があっても補えます。L/M 錐体のような「X 染色体 1 本勝負」にならないので、T 型はどの性別でもまれです。

### 「色が分からない」のではない

よくある誤解ですが、P 型・D 型の人に「色が見えない」わけではありません。赤と緑が**似た色に見える**状態です。信号の赤と青は問題なく区別できます。3 つの錐体すべてが機能しない 1 色覚（色が明暗だけに見える状態）は非常にまれです。

## まとめ

- 目には 3 種の錐体（L / M / S）があり、信号の組み合わせで色を知覚する
- L と M のピークが近いため、どちらかが弱い P 型・D 型（赤緑系）が多い
- 色覚の多様性は男性の約 5%。仕組みを知っておくと、色だけに頼らない設計の理由が分かる

<style>
.c45-fig { margin: 16px 0; text-align: center; }
.c45-visible { width: 100%; max-width: 600px; height: auto; }
.c45-eye { width: 100%; max-width: 560px; height: auto; }
.c45-spectrum { width: 100%; max-width: 700px; height: auto; }
</style>
