# 色のアクセシビリティ — 自分の見え方が全員の見え方ではない

## 今日のゴール

- 目が色を感じる仕組み（3 種の錐体）を知る
- P 型・D 型・T 型で混同する色が違う理由を知る
- 色覚の多様性が珍しくない事実を知る

## 色の見え方は 1 つではない

アプリケーション開発では、コントラスト比の確認や「色だけで情報を伝えない」といったアクセシビリティ対応をします。ただ、ルールとして守るだけでは不十分です。**画面の向こうにいる人が、自分とは違う見え方をしている**かもしれない。その状況を具体的に知っていれば、対応の意味が分かるし、ルールにない場面でも自分で判断できます。

画面の色には意味を持たせることが多いですが（赤はエラー、緑は成功など）、その色が全員に同じように見えている保証はありません。なぜ人によって見え方が違うのか、光と目の仕組みから説明します。

## 色は光の波長で決まる

光は波長によって色が変わります。人間の目が感じ取れる範囲（**可視光線**）は約 380nm〜780nm で、短い方が青紫、長い方が赤です。

<figure class="c45-fig">
<svg class="c45-visible" viewBox="0 0 640 112" role="img" aria-label="可視光線の波長と色の対応。380nmが紫、450nmが青、520nmが緑、580nmが黄、620nmが橙、700nmが赤">
  <rect width="640" height="112" fill="#f8fafc" rx="6"/>
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
  <g font-family="sans-serif" font-size="15" fill="#1e293b" text-anchor="middle">
    <text x="40" y="22">紫</text>
    <text x="124" y="22">青</text>
    <text x="236" y="22">緑</text>
    <text x="320" y="22">黄</text>
    <text x="404" y="22">橙</text>
    <text x="600" y="22">赤</text>
  </g>
  <rect x="40" y="30" width="560" height="30" rx="4" fill="url(#c45-vis-grad)"/>
  <g font-family="sans-serif" font-size="15" fill="#1e293b" text-anchor="middle">
    <text x="40" y="78">380</text>
    <text x="124" y="78">450</text>
    <text x="236" y="78">520</text>
    <text x="320" y="78">580</text>
    <text x="404" y="78">620</text>
    <text x="600" y="78">700</text>
    <text x="320" y="98" fill="#1e293b" font-size="15">波長 (nm)</text>
  </g>
</svg>
</figure>

物体の色はどの波長を反射するかで決まります。リンゴが赤く見えるのは、赤の波長を反射して他を吸収するためです。

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
  <text x="40" y="98" font-family="sans-serif" font-size="15" fill="#92400e" font-weight="700">光</text>
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
  <g font-family="sans-serif" font-size="15" fill="#1e293b">
    <line x1="170" y1="80" x2="182" y2="112" stroke="#94a3b8" stroke-width="1"/>
    <text x="170" y="74" text-anchor="middle">角膜</text>
    <line x1="210" y1="76" x2="210" y2="106" stroke="#94a3b8" stroke-width="1"/>
    <text x="210" y="70" text-anchor="middle">水晶体</text>
    <text x="305" y="144" text-anchor="middle" fill="#1e293b" font-size="15">硝子体</text>
    <line x1="460" y1="90" x2="422" y2="132" stroke="#94a3b8" stroke-width="1"/>
    <text x="478" y="82" text-anchor="middle" font-size="15" fill="#1e293b" font-weight="700">網膜</text>
    <text x="478" y="102" text-anchor="middle" font-size="15" fill="#1e293b">（錐体・桿体）</text>
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
  <text x="130" y="24" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="700" fill="#1e293b">桿体（かんたい）</text>
  <rect x="100" y="38" width="60" height="50" rx="6" fill="#94a3b8" stroke="#475569" stroke-width="1.5"/>
  <text x="130" y="68" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#ffffff" font-weight="700">1 種類</text>
  <text x="130" y="110" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e293b">暗い場所で働く</text>
  <text x="130" y="128" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e293b" font-weight="700">→ 明暗だけ</text>
  <text x="130" y="148" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e293b">色は分からない</text>
  <!-- 錐体 -->
  <text x="390" y="24" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="700" fill="#1e293b">錐体（すいたい）</text>
  <rect x="300" y="38" width="50" height="50" rx="6" fill="#d62728" stroke="#991b1b" stroke-width="1.5"/>
  <text x="325" y="68" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#ffffff" font-weight="700">L</text>
  <rect x="365" y="38" width="50" height="50" rx="6" fill="#2ca02c" stroke="#166534" stroke-width="1.5"/>
  <text x="390" y="68" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#ffffff" font-weight="700">M</text>
  <rect x="430" y="38" width="50" height="50" rx="6" fill="#1f6fd6" stroke="#1e3a8a" stroke-width="1.5"/>
  <text x="455" y="68" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#ffffff" font-weight="700">S</text>
  <text x="390" y="110" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e293b">明るい場所で働く</text>
  <text x="390" y="128" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e293b" font-weight="700">→ 差を取って色を識別</text>
  <text x="390" y="148" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e293b">3 種類あるから引き算できる</text>
</svg>
</figure>

色を見分けるのは錐体の仕事です。錐体には 3 種類あり、それぞれ反応する波長が違います。

| 錐体 | 反応する波長 | 別名 |
|------|------------|------|
| L 錐体 | 長い波長（赤〜黄） | 赤錐体 |
| M 錐体 | 中間の波長（緑） | 緑錐体 |
| S 錐体 | 短い波長（青） | 青錐体 |

L / M / S はそれぞれ Long / Medium / Short の頭文字です。

各錐体がどの波長にどれだけ反応するかを示したのが、次の感度曲線です。

<figure class="c45-fig">
<svg class="c45-spectrum" viewBox="0 0 760 320" role="img" aria-label="3種類の錐体の感度曲線。S錐体は短波長（青）、M錐体は中波長（緑）、L錐体は長波長（赤〜黄）にピークをもつ">
  <rect width="760" height="320" fill="#f8fafc"/>
  <text x="380" y="28" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="700" fill="#1e293b">3 種の錐体の感度曲線</text>
  <line x1="70" y1="270" x2="720" y2="270" stroke="#475569" stroke-width="1.5"/>
  <line x1="70" y1="50" x2="70" y2="270" stroke="#475569" stroke-width="1.5"/>
  <text x="38" y="160" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e293b" transform="rotate(-90 38 160)">感度</text>
  <g font-family="sans-serif" font-size="15" fill="#1e293b" text-anchor="middle">
    <line x1="114" y1="270" x2="114" y2="276" stroke="#475569"/><text x="114" y="290">400</text>
    <line x1="310" y1="270" x2="310" y2="276" stroke="#475569"/><text x="310" y="290">500</text>
    <line x1="506" y1="270" x2="506" y2="276" stroke="#475569"/><text x="506" y="290">600</text>
    <line x1="700" y1="270" x2="700" y2="276" stroke="#475569"/><text x="700" y="290">700</text>
    <text x="390" y="310" font-size="15" fill="#1e293b">波長 (nm)</text>
  </g>
  <path d="M70,270 C105,270 125,75 152,70 C179,75 220,270 275,270 Z" fill="#1f6fd6" fill-opacity="0.18" stroke="#1f6fd6" stroke-width="2.5"/>
  <path d="M240,270 C305,268 350,68 385,64 C424,68 495,268 570,270 Z" fill="#2ca02c" fill-opacity="0.18" stroke="#2ca02c" stroke-width="2.5"/>
  <path d="M285,270 C360,268 415,66 445,62 C483,66 570,268 665,270 Z" fill="#d62728" fill-opacity="0.16" stroke="#d62728" stroke-width="2.5"/>
  <g font-family="sans-serif" font-size="15" font-weight="700">
    <text x="152" y="58" text-anchor="middle" fill="#1f6fd6">S 錐体</text>
    <text x="370" y="52" text-anchor="middle" fill="#2ca02c">M 錐体</text>
    <text x="472" y="50" text-anchor="middle" fill="#d62728">L 錐体</text>
  </g>
</svg>
</figure>

## 脳が色を判別する仕組み

錐体が 3 種類ある理由は、桿体と比べると分かります。

桿体は 1 種類しかないので、光の強さ（明暗）は分かっても、何色かは分かりません。色を判別するには、異なる波長に反応する複数のセンサーが必要で、脳がそれらの信号の**差**を取ることで色を識別しています。

錐体は 3 種類あるので、脳は信号を**足し引き**して 2 つの色チャンネルを作れます。

| チャンネル | 計算 | 分かること |
|-----------|------|----------|
| **赤-緑** | L の信号 − M の信号 | 赤寄りか緑寄りか |
| **青-黄** | S の信号 − (L + M) の信号 | 青寄りか黄寄りか |
| **明暗** | L + M + S の合計 | 明るいか暗いか |

色相環で見ると、赤-緑チャンネルと青-黄チャンネルがどの色の区別を担当しているかが分かります。

<figure class="c45-fig">
<svg class="c45-simple-wheel" viewBox="0 0 420 420" role="img" aria-label="赤を上にした色相環。縦軸が赤-緑チャンネル、横軸が青-黄チャンネルに対応する">
  <rect width="420" height="420" fill="#f8fafc" rx="8"/>
  <!-- 軸線 中心(200, 190) -->
  <line x1="200" y1="55" x2="200" y2="325" stroke="#d4d4d8" stroke-width="2" stroke-dasharray="6 4"/>
  <line x1="65" y1="190" x2="335" y2="190" stroke="#d4d4d8" stroke-width="2" stroke-dasharray="6 4"/>
  <!-- 軸ラベル -->
  <text x="200" y="28" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#991b1b" font-weight="700">↕ 赤-緑 チャンネル（L − M）</text>
  <text x="200" y="370" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#1e40af" font-weight="700">← 青-黄 チャンネル（S −(L+M)）→</text>
  <!-- 8色: 赤=上, 橙=右上, 黄=右, 黄緑=右下, 緑=下, 青緑=左下, 青=左, 紫=左上 -->
  <!-- 中心(200, 190), r=115 -->
  <circle cx="200" cy="75" r="20" fill="#dc2626" stroke="#991b1b" stroke-width="1.5"/>
  <text x="200" y="55" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#1e293b" font-weight="700">赤</text>
  <circle cx="281" cy="109" r="20" fill="#f97316" stroke="#c2410c" stroke-width="1.5"/>
  <text x="308" y="102" font-family="sans-serif" font-size="13" fill="#1e293b" font-weight="700">橙</text>
  <circle cx="315" cy="190" r="20" fill="#eab308" stroke="#a16207" stroke-width="1.5"/>
  <text x="342" y="194" font-family="sans-serif" font-size="13" fill="#1e293b" font-weight="700">黄</text>
  <circle cx="281" cy="271" r="20" fill="#84cc16" stroke="#4d7c0f" stroke-width="1.5"/>
  <text x="308" y="280" font-family="sans-serif" font-size="13" fill="#1e293b" font-weight="700">黄緑</text>
  <circle cx="200" cy="305" r="20" fill="#16a34a" stroke="#166534" stroke-width="1.5"/>
  <text x="200" y="335" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#1e293b" font-weight="700">緑</text>
  <circle cx="119" cy="271" r="20" fill="#0d9488" stroke="#115e59" stroke-width="1.5"/>
  <text x="92" y="280" font-family="sans-serif" font-size="13" fill="#1e293b" font-weight="700" text-anchor="end">青緑</text>
  <circle cx="85" cy="190" r="20" fill="#2563eb" stroke="#1e3a8a" stroke-width="1.5"/>
  <text x="58" y="194" font-family="sans-serif" font-size="13" fill="#1e293b" font-weight="700" text-anchor="end">青</text>
  <circle cx="119" cy="109" r="20" fill="#7c3aed" stroke="#4c1d95" stroke-width="1.5"/>
  <text x="92" y="102" font-family="sans-serif" font-size="13" fill="#1e293b" font-weight="700" text-anchor="end">紫</text>
</svg>
</figure>

縦方向が赤-緑チャンネル、横方向が青-黄チャンネルです。P/D 型で赤-緑チャンネルが機能しなくなると、縦方向の色の違いが分からなくなります。

赤い光が来たときと緑の光が来たときで、信号がどう変わるか見てみます。

<figure class="c45-fig">
<svg class="c45-signal" viewBox="0 0 560 320" role="img" aria-label="赤い光と緑の光で錐体の信号と引き算の結果がどう変わるかの対比図。通常はL-Mの差が大きいが、P型ではLが弱く差が消える">
  <rect width="560" height="320" fill="#f8fafc" rx="8"/>
  <!-- 通常・赤い光 -->
  <text x="95" y="22" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="700" fill="#1e293b">通常 × 赤い光</text>
  <!-- バー -->
  <rect x="40" y="60" width="30" height="100" rx="3" fill="#d62728" opacity="0.8"/>
  <text x="55" y="175" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e293b">L</text>
  <text x="55" y="55" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#991b1b" font-weight="700">強</text>
  <rect x="80" y="120" width="30" height="40" rx="3" fill="#2ca02c" opacity="0.8"/>
  <text x="95" y="175" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e293b">M</text>
  <text x="95" y="115" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#166534" font-weight="700">弱</text>
  <rect x="120" y="135" width="30" height="25" rx="3" fill="#1f6fd6" opacity="0.8"/>
  <text x="135" y="175" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e293b">S</text>
  <!-- 結果 -->
  <text x="95" y="200" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e293b">L − M = <tspan font-weight="700" fill="#dc2626">大きい差</tspan></text>
  <text x="95" y="218" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e293b" font-weight="700">→「赤」と判別</text>

  <!-- 通常・緑の光 -->
  <text x="275" y="22" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="700" fill="#1e293b">通常 × 緑の光</text>
  <rect x="220" y="120" width="30" height="40" rx="3" fill="#d62728" opacity="0.8"/>
  <text x="235" y="175" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e293b">L</text>
  <text x="235" y="115" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#991b1b" font-weight="700">弱</text>
  <rect x="260" y="60" width="30" height="100" rx="3" fill="#2ca02c" opacity="0.8"/>
  <text x="275" y="175" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e293b">M</text>
  <text x="275" y="55" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#166534" font-weight="700">強</text>
  <rect x="300" y="130" width="30" height="30" rx="3" fill="#1f6fd6" opacity="0.8"/>
  <text x="315" y="175" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e293b">S</text>
  <!-- 結果 -->
  <text x="275" y="200" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e293b">L − M = <tspan font-weight="700" fill="#16a34a">大きい差（逆向き）</tspan></text>
  <text x="275" y="218" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e293b" font-weight="700">→「緑」と判別</text>

  <!-- P型・赤い光 -->
  <text x="460" y="22" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="700" fill="#1e293b">P 型 × 赤い光</text>
  <rect x="405" y="120" width="30" height="40" rx="3" fill="#d62728" opacity="0.3"/>
  <text x="420" y="175" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#94a3b8">L</text>
  <text x="420" y="115" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#94a3b8">弱い</text>
  <rect x="445" y="120" width="30" height="40" rx="3" fill="#2ca02c" opacity="0.8"/>
  <text x="460" y="175" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e293b">M</text>
  <rect x="485" y="135" width="30" height="25" rx="3" fill="#1f6fd6" opacity="0.8"/>
  <text x="500" y="175" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e293b">S</text>
  <!-- 結果 -->
  <text x="460" y="200" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e293b">L − M = <tspan font-weight="700" fill="#ef4444">差がない</tspan></text>
  <text x="460" y="218" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#ef4444" font-weight="700">→ 赤か緑か分からない</text>

  <!-- 下部説明 -->
  <text x="280" y="260" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e293b" font-weight="700">通常は L と M の棒の高さが違うから差が取れる</text>
  <text x="280" y="280" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#b91c1c" font-weight="700">P 型は L が弱いから棒が揃い、差が消える</text>
  <text x="280" y="298" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e293b">D 型は M が弱い場合で、同じく差が消える</text>
</svg>
</figure>

通常は L と M の信号に差があるので「赤か緑か」を判別できます。L 錐体が弱いと両方の信号が同じくらいになり、差が取れません。結果として赤と緑の区別がつかなくなります。M 錐体が弱い場合も同様です。

暗い場所で色が分かりにくくなるのも同じ原理です。錐体の感度が落ちて桿体に切り替わると、信号が 1 種類になり、引き算ができなくなります。

## 彩度が低いほど混同しやすい

色には色相（何色か）だけでなく、**彩度**（どれだけ鮮やかか）と**明度**（どれだけ明るいか）があります。彩度が高いと鮮やかで、彩度がゼロになるとグレー（無彩色）になります。

前のセクションで、P/D 型では赤-緑の差が取れなくなると説明しました。この「差が取れない」影響は、鮮やかな色より**くすんだ色の方が大きくなります**。

- **鮮やかな赤**は、赤と緑の区別はつかなくても「何か色味がある」とは感じられることがあります
- **ピンク**（くすんだ赤）は、もともとグレーに近い色です。色味の手がかりが少ないので、区別がつかなければ**そのままグレーに見えます**

つまり、彩度が低い色ほどグレーとの混同が起きやすくなります。鮮やかな色同士の混同だけでなく、くすんだ色がグレーに吸収される混同もある、ということです。

## 色相環で見る混同のルール

ここまでの仕組みを色相環で整理します。色相環の外側は鮮やかな色、中央は無彩色（グレー）です。

<figure class="c45-fig">
<svg class="c45-ellipse" viewBox="0 0 1060 500" role="img" aria-label="通常の色相環（正円）、P/D型（縦長楕円）、T型（横長楕円）の比較図">
  <rect width="1060" height="500" fill="#f8fafc" rx="8"/>

  <!-- ===== 通常（正円） ===== -->
  <!-- 中心(160, 240), r=100 -->
  <text x="160" y="30" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="700" fill="#1e293b">通常</text>
  <text x="160" y="50" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e293b">2 軸とも機能</text>

  <circle cx="160" cy="240" r="115" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="6 4"/>
  <circle cx="160" cy="240" r="8" fill="#a1a1aa" stroke="#71717a" stroke-width="1.5"/>

  <circle cx="160" cy="140" r="17" fill="#eab308" stroke="#a16207" stroke-width="1.5"/>
  <text x="160" y="117" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e293b" font-weight="700">黄</text>
  <circle cx="231" cy="169" r="17" fill="#84cc16" stroke="#4d7c0f" stroke-width="1.5"/>
  <text x="258" y="160" font-family="sans-serif" font-size="15" fill="#1e293b" font-weight="700">黄緑</text>
  <circle cx="260" cy="240" r="17" fill="#16a34a" stroke="#166534" stroke-width="1.5"/>
  <text x="287" y="244" font-family="sans-serif" font-size="15" fill="#1e293b" font-weight="700">緑</text>
  <circle cx="231" cy="311" r="17" fill="#2563eb" stroke="#1e3a8a" stroke-width="1.5"/>
  <text x="258" y="320" font-family="sans-serif" font-size="15" fill="#1e293b" font-weight="700">青</text>
  <circle cx="160" cy="340" r="17" fill="#6d28d9" stroke="#4c1d95" stroke-width="1.5"/>
  <text x="160" y="370" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e293b" font-weight="700">青紫</text>
  <circle cx="89" cy="311" r="17" fill="#db2777" stroke="#831843" stroke-width="1.5"/>
  <text x="62" y="320" font-family="sans-serif" font-size="15" fill="#1e293b" font-weight="700" text-anchor="end">赤紫</text>
  <circle cx="60" cy="240" r="17" fill="#dc2626" stroke="#991b1b" stroke-width="1.5"/>
  <text x="33" y="244" font-family="sans-serif" font-size="15" fill="#1e293b" font-weight="700" text-anchor="end">赤</text>
  <circle cx="89" cy="169" r="17" fill="#f97316" stroke="#c2410c" stroke-width="1.5"/>
  <text x="62" y="160" font-family="sans-serif" font-size="15" fill="#1e293b" font-weight="700" text-anchor="end">橙</text>

  <line x1="80" y1="240" x2="240" y2="240" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="5 4"/>
  <line x1="108" y1="169" x2="212" y2="169" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="5 4"/>
  <text x="160" y="400" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e293b">赤と緑が向かい合う</text>
  <text x="160" y="416" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e293b">（同じ高さ）</text>

  <!-- ===== P/D型（縦長楕円） ===== -->
  <!-- 中心(440, 240) -->
  <text x="440" y="30" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="700" fill="#1e293b">P 型 / D 型</text>
  <text x="440" y="50" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#dc2626">赤-緑 が潰れて中央に近づく</text>

  <ellipse cx="440" cy="240" rx="65" ry="118" fill="none" stroke="#fca5a5" stroke-width="1.5" stroke-dasharray="6 4"/>
  <line x1="440" y1="130" x2="440" y2="350" stroke="#d4d4d8" stroke-width="3" stroke-opacity="0.7"/>
  <circle cx="440" cy="240" r="8" fill="#a1a1aa" stroke="#71717a" stroke-width="1.5"/>

  <circle cx="440" cy="140" r="17" fill="#eab308" stroke="#a16207" stroke-width="1.5"/>
  <text x="440" y="117" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e293b" font-weight="700">黄</text>
  <circle cx="467" cy="169" r="17" fill="#84cc16" stroke="#4d7c0f" stroke-width="1.5"/>
  <text x="495" y="160" font-family="sans-serif" font-size="15" fill="#1e293b" font-weight="700">黄緑</text>
  <circle cx="475" cy="240" r="17" fill="#6b8a5a" stroke="#52634a" stroke-width="1.5"/>
  <text x="503" y="228" font-family="sans-serif" font-size="15" fill="#1e293b" font-weight="700">緑→灰</text>
  <circle cx="467" cy="311" r="17" fill="#2563eb" stroke="#1e3a8a" stroke-width="1.5"/>
  <text x="495" y="320" font-family="sans-serif" font-size="15" fill="#1e293b" font-weight="700">青</text>
  <circle cx="440" cy="340" r="17" fill="#6d28d9" stroke="#4c1d95" stroke-width="1.5"/>
  <text x="440" y="370" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e293b" font-weight="700">青紫</text>
  <circle cx="413" cy="311" r="17" fill="#9a4070" stroke="#831843" stroke-width="1.5"/>
  <text x="385" y="320" font-family="sans-serif" font-size="15" fill="#1e293b" font-weight="700" text-anchor="end">赤紫</text>
  <circle cx="405" cy="240" r="17" fill="#2a1010" stroke="#7f1d1d" stroke-width="1.5"/>
  <text x="377" y="236" font-family="sans-serif" font-size="15" fill="#991b1b" font-weight="700" text-anchor="end">赤→黒</text>
  <circle cx="413" cy="169" r="17" fill="#8a7a5a" stroke="#6b6040" stroke-width="1.5"/>
  <text x="385" y="160" font-family="sans-serif" font-size="15" fill="#1e293b" font-weight="700" text-anchor="end">橙→灰</text>

  <line x1="410" y1="240" x2="470" y2="240" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="5 3"/>
  <line x1="418" y1="169" x2="462" y2="169" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="5 3"/>
  <text x="520" y="258" font-family="sans-serif" font-size="15" fill="#991b1b" font-weight="700">← 区別できない</text>

  <text x="440" y="400" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#991b1b" font-weight="700">赤と緑が中央に寄り</text>
  <text x="440" y="416" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#991b1b" font-weight="700">どちらも灰〜黒に近づく</text>

  <!-- ===== T型（横長楕円） ===== -->
  <!-- 中心(810, 240), rx=140, ry=80 で縦にも余裕を持たせる -->
  <text x="810" y="30" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="700" fill="#1e293b">T 型</text>
  <text x="810" y="50" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#2563eb">青-黄 が潰れて中央に近づく</text>

  <ellipse cx="810" cy="240" rx="160" ry="95" fill="none" stroke="#93c5fd" stroke-width="1.5" stroke-dasharray="6 4"/>
  <line x1="660" y1="240" x2="960" y2="240" stroke="#d4d4d8" stroke-width="3" stroke-opacity="0.7"/>
  <circle cx="810" cy="240" r="8" fill="#a1a1aa" stroke="#71717a" stroke-width="1.5"/>

  <circle cx="810" cy="160" r="17" fill="#b8a860" stroke="#8a7a40" stroke-width="1.5"/>
  <text x="810" y="135" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e293b" font-weight="700">黄→灰</text>
  <circle cx="910" cy="183" r="17" fill="#84cc16" stroke="#4d7c0f" stroke-width="1.5"/>
  <text x="910" y="160" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e293b" font-weight="700">黄緑</text>
  <circle cx="950" cy="240" r="17" fill="#16a34a" stroke="#166534" stroke-width="1.5"/>
  <text x="980" y="244" font-family="sans-serif" font-size="15" fill="#1e293b" font-weight="700">緑</text>
  <circle cx="910" cy="297" r="17" fill="#5a6a9a" stroke="#3a4a7a" stroke-width="1.5"/>
  <text x="910" y="326" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e293b" font-weight="700">青→灰</text>
  <circle cx="810" cy="315" r="17" fill="#7a5a8a" stroke="#5a3a6a" stroke-width="1.5"/>
  <text x="810" y="345" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e293b" font-weight="700">青紫→灰</text>
  <circle cx="710" cy="295" r="17" fill="#db2777" stroke="#831843" stroke-width="1.5"/>
  <text x="710" y="326" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e293b" font-weight="700">赤紫</text>
  <circle cx="670" cy="240" r="17" fill="#dc2626" stroke="#991b1b" stroke-width="1.5"/>
  <text x="640" y="244" font-family="sans-serif" font-size="15" fill="#1e293b" font-weight="700" text-anchor="end">赤</text>
  <circle cx="710" cy="185" r="17" fill="#f97316" stroke="#c2410c" stroke-width="1.5"/>
  <text x="710" y="162" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e293b" font-weight="700">橙</text>

  <line x1="810" y1="170" x2="810" y2="310" stroke="#3b82f6" stroke-width="2.5" stroke-dasharray="5 3"/>
  <line x1="910" y1="190" x2="910" y2="290" stroke="#3b82f6" stroke-width="2.5" stroke-dasharray="5 3"/>
  <text x="810" y="355" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#2563eb" font-weight="700">↕ 上下の色が区別できない</text>

  <text x="810" y="400" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e40af" font-weight="700">黄と青紫が中央に寄り</text>
  <text x="810" y="416" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e40af" font-weight="700">どちらも灰に近づく</text>

  <!-- 下部共通説明 -->
  <line x1="30" y1="440" x2="1030" y2="440" stroke="#e2e8f0" stroke-width="1"/>
  <text x="530" y="465" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e293b" font-weight="700">色相環の中央は無彩色（グレー）。潰れた方向の色は中央に吸い寄せられ、彩度が落ちる</text>
  <text x="530" y="487" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#1e293b">P 型では L 錐体が弱いため赤い光の明るさ自体が落ち、赤は黒に近づく</text>
</svg>
</figure>

P/D 型では左右の色が中央のグレー軸に吸い寄せられます。橙と緑はどちらもグレーに近づくので似た色に見え、赤はさらに明度が下がって黒に近づきます。ピンクと灰の混同が起きるのも、ピンク（薄い赤）が中央のグレーに吸収されるからです。T 型では上下が潰れ、黄が白に、青が灰に近づきます。

## P 型・D 型・T 型

ここまでの仕組みに名前を付けたのが、色覚タイプの分類です。

| タイプ | 弱い錐体 | 潰れるチャンネル | 区別しにくい色 | 割合（日本の男性） |
|--------|---------|----------------|--------------|------------------|
| **P 型**（1 型） | L 錐体（赤） | 赤-緑 | 赤と緑、赤と茶 | 約 1.5% |
| **D 型**（2 型） | M 錐体（緑） | 赤-緑 | 赤と緑、緑と茶 | 約 3.5% |
| **T 型**（3 型） | S 錐体（青） | 青-黄 | 青と緑、黄と白 | まれ |

D 型が最も多く、P 型と合わせた赤緑系が大半を占めます。色覚多様性は日本の男性の約 5%（20 人に 1 人）にみられます。

## 赤緑系が多い理由と、よくある誤解

感度曲線を見ると、L 錐体と M 錐体はピークが近く、担当する波長の範囲が大きく重なっています。この 2 つの錐体は似た波長に反応するので、どちらか一方が弱くなると赤〜緑の区別に使える手がかりが失われます。

P 型（L 錐体が弱い）と D 型（M 錐体が弱い）で混同する色が似ているのも同じ理由です。ただし完全に同じではなく、P 型には特有の影響があります。L 錐体は赤寄りの波長を担当しているので、それが弱いと赤い光の明るさ自体が落ちます。鮮やかな赤が暗く見えるだけでなく、茶（暗い橙）は彩度が低い上に明度も下がるため黒に近づきます。P 型で赤と黒、茶と黒が混同するのはこの仕組みです。

「色覚に特性がある人は色が見えない」と思われがちですが、そうではありません。赤と緑が**似た色に見える**状態であって、色のない世界に住んでいるわけではありません。信号の赤と青は問題なく区別できます。すべての錐体が機能せず色が明暗だけに見える状態（1 色覚）は非常にまれです。

## 仕組みを知っていると気づけること

コントラスト比のチェックや色覚シミュレーションといったツールは、問題を見つけるのに役立ちます。ただ、ツールを動かす前に「この配色は大丈夫か」と気づけるかどうかは、仕組みを知っているかどうかで変わります。

色相環の横線を思い出してください。以下のような組み合わせを画面上で見かけたら、赤-緑チャンネルで差が取れない人がいることを意識できるはずです。

<figure class="c45-fig">
<svg class="c45-caution" viewBox="0 0 520 250" role="img" aria-label="P型・D型で要注意の色の組み合わせ4つ。赤と緑、橙と黄緑（色相の混同）、赤と茶、ピンクと灰（彩度の混同）">
  <rect width="520" height="250" fill="#f8fafc" rx="8"/>
  <text x="260" y="28" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="700" fill="#1e293b">要注意の組み合わせ</text>
  <!-- 色相の混同 -->
  <text x="40" y="62" font-family="sans-serif" font-size="15" fill="#1e293b" font-weight="700">色相の混同</text>
  <circle cx="65" cy="85" r="18" fill="#dc2626" stroke="#991b1b" stroke-width="1.5"/>
  <circle cx="115" cy="85" r="18" fill="#16a34a" stroke="#166534" stroke-width="1.5"/>
  <text x="155" y="90" font-family="sans-serif" font-size="15" fill="#1e293b" font-weight="700">赤と緑</text>
  <circle cx="310" cy="85" r="18" fill="#f97316" stroke="#c2410c" stroke-width="1.5"/>
  <circle cx="360" cy="85" r="18" fill="#84cc16" stroke="#4d7c0f" stroke-width="1.5"/>
  <text x="400" y="90" font-family="sans-serif" font-size="15" fill="#1e293b" font-weight="700">橙と黄緑</text>
  <!-- 彩度の混同 -->
  <text x="40" y="132" font-family="sans-serif" font-size="15" fill="#1e293b" font-weight="700">彩度の混同</text>
  <circle cx="65" cy="155" r="18" fill="#dc2626" stroke="#991b1b" stroke-width="1.5"/>
  <circle cx="115" cy="155" r="18" fill="#78350f" stroke="#451a03" stroke-width="1.5"/>
  <text x="155" y="160" font-family="sans-serif" font-size="15" fill="#1e293b" font-weight="700">赤と茶</text>
  <circle cx="310" cy="155" r="18" fill="#f472b6" stroke="#db2777" stroke-width="1.5"/>
  <circle cx="360" cy="155" r="18" fill="#9ca3af" stroke="#6b7280" stroke-width="1.5"/>
  <text x="400" y="160" font-family="sans-serif" font-size="15" fill="#1e293b" font-weight="700">ピンクと灰</text>
  <!-- 注記 -->
  <text x="260" y="190" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#991b1b" font-weight="700">上段: 色相環で同じ高さの組み合わせ（色相の混同）</text>
  <text x="260" y="210" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#991b1b" font-weight="700">下段: 彩度が低いことで起きる混同</text>
</svg>
</figure>

色相が同じ高さにある「赤と緑」「橙と黄緑」は、色相環を思い出せば気づけます。一方「赤と茶」「ピンクと灰」は彩度の問題で、鮮やかさが失われた色がグレーや黒に近づくことで起きます。どちらの仕組みも知っておけば、ツールで測る前に「この配色は大丈夫か」と立ち止まれます。

## まとめ

- 目には 3 種の錐体（L / M / S）があり、脳が信号の差を取って色を判別する
- L と M のピークが近いため、どちらかが弱い P 型・D 型では赤〜緑が混同する
- 色相の混同（赤と緑）だけでなく、彩度が低い色の混同（ピンクと灰、赤と茶）にも注意

<style>
.c45-fig { margin: 16px 0; text-align: center; }
.c45-visible { width: 100%; max-width: 600px; height: auto; }
.c45-cells { width: 100%; max-width: 520px; height: auto; }
.c45-eye { width: 100%; max-width: 560px; height: auto; }
.c45-simple-wheel { width: 100%; max-width: 420px; height: auto; }
.c45-signal { width: 100%; max-width: 560px; height: auto; }
.c45-wheel { width: 100%; max-width: 480px; height: auto; }
.c45-ellipse { width: 100%; max-width: 1060px; height: auto; }
.c45-caution { width: 100%; max-width: 520px; height: auto; }
.c45-spectrum { width: 100%; max-width: 700px; height: auto; }
</style>
