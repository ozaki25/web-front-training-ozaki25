# 色のアクセシビリティ — 自分の見え方が全員の見え方ではない

フロントエンドの開発では、色に関するアクセシビリティ対応を求められることがあります。コントラスト比を確認する、色だけで情報を伝えない、といった対応です。ただ「ルールだから守る」ではなく、**その色を受け取る人がどんな状況にあるかを知っておくこと**が、本質的によいサービスを届けることに繋がります。このレッスンでは、色覚の仕組みそのものを理解します。

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
<svg class="c45-visible" viewBox="0 0 640 105" role="img" aria-label="可視光線の波長と色の対応。380nmが紫、450nmが青、520nmが緑、580nmが黄、620nmが橙、700nmが赤">
  <rect width="640" height="105" fill="#f8fafc" rx="6"/>
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
  <g font-family="sans-serif" font-size="10" fill="#1e293b" text-anchor="middle">
    <text x="40" y="22">紫</text>
    <text x="124" y="22">青</text>
    <text x="236" y="22">緑</text>
    <text x="320" y="22">黄</text>
    <text x="404" y="22">橙</text>
    <text x="600" y="22">赤</text>
  </g>
  <rect x="40" y="30" width="560" height="30" rx="4" fill="url(#c45-vis-grad)"/>
  <g font-family="sans-serif" font-size="11" fill="#1e293b" text-anchor="middle">
    <text x="40" y="78">380</text>
    <text x="124" y="78">450</text>
    <text x="236" y="78">520</text>
    <text x="320" y="78">580</text>
    <text x="404" y="78">620</text>
    <text x="600" y="78">700</text>
    <text x="320" y="98" fill="#64748b" font-size="12">波長 (nm)</text>
  </g>
</svg>
</figure>

虹の色順と同じです。リンゴが赤く見えるのは、赤の波長を反射して他を吸収しているからです。

## 目が光を色に変える仕組み

光は目の表面（角膜）から入り、水晶体がピントを合わせ、奥の**網膜**に像を結びます。

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

<figure class="c45-fig">
<svg class="c45-cells" viewBox="0 0 520 160" role="img" aria-label="桿体は1種類で明暗だけ、錐体は3種類で色を識別する対比図">
  <rect width="520" height="160" fill="#f8fafc" rx="8"/>
  <!-- 桿体 -->
  <text x="130" y="24" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#1e293b">桿体（かんたい）</text>
  <rect x="100" y="38" width="60" height="50" rx="6" fill="#94a3b8" stroke="#475569" stroke-width="1.5"/>
  <text x="130" y="68" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#ffffff" font-weight="700">1 種類</text>
  <text x="130" y="110" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">暗い場所で働く</text>
  <text x="130" y="128" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#1e293b" font-weight="700">→ 明暗だけ</text>
  <text x="130" y="148" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#64748b">色は分からない</text>
  <!-- 錐体 -->
  <text x="390" y="24" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#1e293b">錐体（すいたい）</text>
  <rect x="300" y="38" width="50" height="50" rx="6" fill="#d62728" stroke="#991b1b" stroke-width="1.5"/>
  <text x="325" y="68" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#ffffff" font-weight="700">L</text>
  <rect x="365" y="38" width="50" height="50" rx="6" fill="#2ca02c" stroke="#166534" stroke-width="1.5"/>
  <text x="390" y="68" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#ffffff" font-weight="700">M</text>
  <rect x="430" y="38" width="50" height="50" rx="6" fill="#1f6fd6" stroke="#1e3a8a" stroke-width="1.5"/>
  <text x="455" y="68" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#ffffff" font-weight="700">S</text>
  <text x="390" y="110" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">明るい場所で働く</text>
  <text x="390" y="128" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#1e293b" font-weight="700">→ 差を取って色を識別</text>
  <text x="390" y="148" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#64748b">3 種類あるから引き算できる</text>
</svg>
</figure>

色を見分けるのは錐体の仕事です。錐体には 3 種類あり、それぞれ反応する波長が違います。

| 錐体 | 反応する波長 | 別名 |
|------|------------|------|
| L 錐体 | 長い波長（赤〜黄） | 赤錐体 |
| M 錐体 | 中間の波長（緑） | 緑錐体 |
| S 錐体 | 短い波長（青） | 青錐体 |

各錐体がどの波長にどれだけ反応するかを示したのが、次の感度曲線です。

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

## 脳が色を判別する仕組み

色を知るには、なぜ錐体が 3 種類も必要なのか。桿体と比べると分かります。

桿体は **1 種類**しかありません。光が来たら「強い／弱い」を返すだけ。信号が 1 つだと、明るいか暗いかは分かっても、**何色かは分かりません**。色を知るには、異なる波長に反応する複数のセンサーの**差**が要ります。

錐体は 3 種類あるので、脳はその信号を**足し引き**して色を判別できます。

| チャンネル | 計算 | 分かること |
|-----------|------|----------|
| **赤-緑** | L の信号 − M の信号 | 赤寄りか緑寄りか |
| **青-黄** | S の信号 − (L + M) の信号 | 青寄りか黄寄りか |
| **明暗** | L + M + S の合計 | 明るいか暗いか |

赤い光が来たときと緑の光が来たときで、信号がどう変わるか見てみます。

<figure class="c45-fig">
<svg class="c45-signal" viewBox="0 0 560 320" role="img" aria-label="赤い光と緑の光で錐体の信号と引き算の結果がどう変わるかの対比図。通常はL-Mの差が大きいが、P型ではLが弱く差が消える">
  <rect width="560" height="320" fill="#f8fafc" rx="8"/>
  <!-- 通常・赤い光 -->
  <text x="95" y="22" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#1e293b">通常 × 赤い光</text>
  <!-- バー -->
  <rect x="40" y="60" width="30" height="100" rx="3" fill="#d62728" opacity="0.8"/>
  <text x="55" y="175" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#1e293b">L</text>
  <text x="55" y="55" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#991b1b" font-weight="700">強</text>
  <rect x="80" y="120" width="30" height="40" rx="3" fill="#2ca02c" opacity="0.8"/>
  <text x="95" y="175" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#1e293b">M</text>
  <text x="95" y="115" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#166534" font-weight="700">弱</text>
  <rect x="120" y="135" width="30" height="25" rx="3" fill="#1f6fd6" opacity="0.8"/>
  <text x="135" y="175" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#1e293b">S</text>
  <!-- 結果 -->
  <text x="95" y="200" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#1e293b">L − M = <tspan font-weight="700" fill="#dc2626">大きい差</tspan></text>
  <text x="95" y="218" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#1e293b" font-weight="700">→「赤」と判別</text>

  <!-- 通常・緑の光 -->
  <text x="275" y="22" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#1e293b">通常 × 緑の光</text>
  <rect x="220" y="120" width="30" height="40" rx="3" fill="#d62728" opacity="0.8"/>
  <text x="235" y="175" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#1e293b">L</text>
  <text x="235" y="115" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#991b1b" font-weight="700">弱</text>
  <rect x="260" y="60" width="30" height="100" rx="3" fill="#2ca02c" opacity="0.8"/>
  <text x="275" y="175" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#1e293b">M</text>
  <text x="275" y="55" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#166534" font-weight="700">強</text>
  <rect x="300" y="130" width="30" height="30" rx="3" fill="#1f6fd6" opacity="0.8"/>
  <text x="315" y="175" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#1e293b">S</text>
  <!-- 結果 -->
  <text x="275" y="200" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#1e293b">L − M = <tspan font-weight="700" fill="#16a34a">大きい差（逆向き）</tspan></text>
  <text x="275" y="218" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#1e293b" font-weight="700">→「緑」と判別</text>

  <!-- P型・赤い光 -->
  <text x="460" y="22" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#1e293b">P 型 × 赤い光</text>
  <rect x="405" y="120" width="30" height="40" rx="3" fill="#d62728" opacity="0.3"/>
  <text x="420" y="175" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#94a3b8">L</text>
  <text x="420" y="115" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#94a3b8">弱い</text>
  <rect x="445" y="120" width="30" height="40" rx="3" fill="#2ca02c" opacity="0.8"/>
  <text x="460" y="175" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#1e293b">M</text>
  <rect x="485" y="135" width="30" height="25" rx="3" fill="#1f6fd6" opacity="0.8"/>
  <text x="500" y="175" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#1e293b">S</text>
  <!-- 結果 -->
  <text x="460" y="200" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#1e293b">L − M = <tspan font-weight="700" fill="#ef4444">差がない</tspan></text>
  <text x="460" y="218" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#ef4444" font-weight="700">→ 赤か緑か分からない</text>

  <!-- 下部説明 -->
  <text x="280" y="260" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#1e293b" font-weight="700">通常は L と M の棒の高さが違うから差が取れる</text>
  <text x="280" y="280" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#b91c1c" font-weight="700">P 型は L が弱いから棒が揃い、差が消える</text>
  <text x="280" y="305" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#64748b">D 型は M が弱い場合で、同じく差が消える</text>
</svg>
</figure>

通常は L と M の信号に差があるから「赤か緑か」が分かります。P 型では L 錐体が弱いので信号が揃ってしまい、差が出ない。差が出なければ赤も緑も同じに見えます。

暗い場所で色が分かりにくくなるのも同じ原理です。錐体の感度が落ちて桿体に切り替わると、信号が 1 種類になり、引き算ができなくなります。

## P 型・D 型・T 型

3 種の錐体のうちどれかが弱い、あるいは欠けていると、対応するチャンネルが機能しなくなります。

| タイプ | 弱い錐体 | 区別しにくい色 | 割合（日本の男性） |
|--------|---------|--------------|------------------|
| **P 型**（1 型） | L 錐体（赤） | 赤と緑、赤と茶 | 約 1.5% |
| **D 型**（2 型） | M 錐体（緑） | 赤と緑、緑と茶 | 約 3.5% |
| **T 型**（3 型） | S 錐体（青） | 青と緑、黄と白 | まれ |

表だけではどの色同士が混同するかイメージしにくいので、色相環で見てみます。

黄を上にして色相環を置くと、上下が「青-黄」チャンネル、左右が「赤-緑」チャンネルに対応します。P 型・D 型は赤-緑チャンネルが機能しないので、**左右の同じ高さにある色が似て見えます**。

<figure class="c45-fig">
<svg class="c45-wheel" viewBox="0 0 480 520" role="img" aria-label="P型・D型で混同しやすい色を色相環で示した図。黄を上にして、左右の同じ高さにある色が区別しにくい">
  <rect width="480" height="520" fill="#f8fafc" rx="8"/>
  <text x="240" y="28" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="700" fill="#1e293b">P 型・D 型で混同しやすい色</text>
  <text x="240" y="48" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#64748b">黄を上にして、左右の同じ高さにある色が区別しにくい</text>
  <circle cx="240" cy="130" r="22" fill="#eab308" stroke="#a16207" stroke-width="1.5"/>
  <text x="240" y="135" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#1e293b" font-weight="700">黄</text>
  <circle cx="305" cy="147" r="22" fill="#84cc16" stroke="#4d7c0f" stroke-width="1.5"/>
  <text x="305" y="152" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#1e293b" font-weight="700">黄緑</text>
  <circle cx="353" cy="195" r="22" fill="#16a34a" stroke="#166534" stroke-width="1.5"/>
  <text x="353" y="200" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#ffffff" font-weight="700">緑</text>
  <circle cx="370" cy="260" r="22" fill="#0d9488" stroke="#115e59" stroke-width="1.5"/>
  <text x="370" y="265" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#ffffff" font-weight="700">青緑</text>
  <circle cx="353" cy="325" r="22" fill="#2563eb" stroke="#1e3a8a" stroke-width="1.5"/>
  <text x="353" y="330" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#ffffff" font-weight="700">青</text>
  <circle cx="305" cy="373" r="22" fill="#7c3aed" stroke="#4c1d95" stroke-width="1.5"/>
  <text x="305" y="378" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#ffffff" font-weight="700">青紫</text>
  <circle cx="240" cy="390" r="22" fill="#9333ea" stroke="#581c87" stroke-width="1.5"/>
  <text x="240" y="395" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#ffffff" font-weight="700">紫</text>
  <circle cx="175" cy="373" r="22" fill="#db2777" stroke="#831843" stroke-width="1.5"/>
  <text x="175" y="378" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#ffffff" font-weight="700">赤紫</text>
  <circle cx="127" cy="325" r="22" fill="#dc2626" stroke="#991b1b" stroke-width="1.5"/>
  <text x="127" y="330" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#ffffff" font-weight="700">赤</text>
  <circle cx="110" cy="260" r="22" fill="#ea580c" stroke="#9a3412" stroke-width="1.5"/>
  <text x="110" y="265" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#ffffff" font-weight="700">赤橙</text>
  <circle cx="127" cy="195" r="22" fill="#f97316" stroke="#c2410c" stroke-width="1.5"/>
  <text x="127" y="200" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#ffffff" font-weight="700">橙</text>
  <circle cx="175" cy="147" r="22" fill="#facc15" stroke="#a16207" stroke-width="1.5"/>
  <text x="175" y="152" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#1e293b" font-weight="700">黄橙</text>
  <!-- 混同色線 -->
  <line x1="149" y1="195" x2="331" y2="195" stroke="#1e293b" stroke-width="2" stroke-dasharray="6 3"/>
  <line x1="132" y1="260" x2="348" y2="260" stroke="#1e293b" stroke-width="2" stroke-dasharray="6 3"/>
  <line x1="149" y1="325" x2="331" y2="325" stroke="#1e293b" stroke-width="2" stroke-dasharray="6 3"/>
  <line x1="197" y1="373" x2="283" y2="373" stroke="#1e293b" stroke-width="2" stroke-dasharray="6 3"/>
  <line x1="197" y1="147" x2="283" y2="147" stroke="#1e293b" stroke-width="2" stroke-dasharray="6 3"/>
  <text x="445" y="197" font-family="sans-serif" font-size="10" fill="#b91c1c" font-weight="700">混同</text>
  <text x="445" y="262" font-family="sans-serif" font-size="10" fill="#b91c1c" font-weight="700">混同</text>
  <text x="445" y="327" font-family="sans-serif" font-size="10" fill="#b91c1c" font-weight="700">混同</text>
  <text x="240" y="90" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#64748b">▲ 区別できる方向</text>
  <text x="240" y="436" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#64748b">▼ 区別できる方向</text>
  <text x="240" y="460" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#1e293b" font-weight="700">破線で結ばれた左右の色が似て見える</text>
  <text x="240" y="480" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#64748b">上下（黄↔紫）方向の色の違いは区別できる</text>
  <text x="240" y="500" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#64748b">T 型はこれを 90° 回転した方向（上下）が混同する</text>
</svg>
</figure>

## 赤緑系が多い理由と、よくある誤解

感度曲線の形がその答えです。L 錐体と M 錐体はピークが近く、担当する波長の範囲が大きく重なっています。どちらか一方が弱くなると、赤〜緑の区別に使える手がかりが失われます。

P 型（L 錐体が弱い）と D 型（M 錐体が弱い）で混同する色が似ているのも同じ理由です。ただし完全に同じではなく、P 型は赤が暗く見える傾向があります。L 錐体は赤寄りの波長を担当しているので、それが弱いと赤い光の明るさ自体が落ちるためです。

よくある誤解ですが、P 型・D 型の人に「色が見えない」わけではありません。赤と緑が**似た色に見える**状態です。信号の赤と青は問題なく区別できます。すべての錐体が機能しない 1 色覚（色が明暗だけに見える状態）は非常にまれです。

## まとめ

- 目には 3 種の錐体（L / M / S）があり、信号の組み合わせで色を知覚する
- L と M のピークが近いため、どちらかが弱い P 型・D 型（赤緑系）が多い
- 色覚の多様性は男性の約 5%。仕組みを知っておくと、色だけに頼らない設計の理由が分かる

<style>
.c45-fig { margin: 16px 0; text-align: center; }
.c45-visible { width: 100%; max-width: 600px; height: auto; }
.c45-cells { width: 100%; max-width: 520px; height: auto; }
.c45-eye { width: 100%; max-width: 560px; height: auto; }
.c45-signal { width: 100%; max-width: 560px; height: auto; }
.c45-wheel { width: 100%; max-width: 480px; height: auto; }
.c45-spectrum { width: 100%; max-width: 700px; height: auto; }
</style>
