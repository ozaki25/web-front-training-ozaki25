# 色のアクセシビリティ — 自分の見え方が全員の見え方ではない

## 今日のゴール

- 色覚の仕組み（3 種の錐体）と P 型・D 型・T 型の違いを知る
- コントラスト比と「4.5 : 1」の基準を知る
- 「色だけで伝えない」という設計原則を知る

## 色の見え方は 1 つではない

赤いエラーメッセージ、緑の成功バッジ、青いリンク。画面の色には意味を持たせることが多いですが、その色が**全員に同じように見えている保証はありません**。

特定の色の組み合わせが区別しにくい**色覚多様性**は、日本では男性の約 5%（20 人に 1 人）、女性の約 0.2% にみられます。学校の 1 クラスに 1 人いる計算で、まったく珍しくありません。

なぜ人によって見え方が違うのか。それを知るには、目が色を感じる仕組みを少しだけ知る必要があります。

## 3 種の錐体と色覚タイプ

人間の目には色を感じる細胞（**錐体**）が 3 種類あります。

| 錐体 | 反応する光 | 別名 |
|------|-----------|------|
| L 錐体 | 長い波長（赤寄り） | 赤錐体 |
| M 錐体 | 中間の波長（緑寄り） | 緑錐体 |
| S 錐体 | 短い波長（青寄り） | 青錐体 |

この 3 つの信号の組み合わせで、脳が「色」を作ります。各錐体がどの波長に反応するかを描いたのが、次の感度曲線です。

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

3 種のうちどれかが弱い、あるいは欠けていると、特定の色の区別がつきにくくなります。これが色覚多様性です。

| タイプ | 弱い錐体 | 区別しにくい色 | 割合（日本の男性） |
|--------|---------|--------------|------------------|
| **P 型**（1 型） | L 錐体（赤） | 赤と緑、赤と茶 | 約 1.5% |
| **D 型**（2 型） | M 錐体（緑） | 赤と緑、緑と茶 | 約 3.5% |
| **T 型**（3 型） | S 錐体（青） | 青と緑、黄と白 | まれ |

**D 型が最も多く**、P 型と合わせた「赤緑系」が大半を占めます。「色覚異常 = 赤と緑が分からない」とよく言われますが、正確には赤と緑が**似た色に見える**状態です。赤が見えないわけではありません。

## 実際にどう見えるか

「赤がエラー、緑が成功」という定番の配色が、P 型・D 型にはどう見えるか。近似的なシミュレーションで比べてみます。

<figure class="c45-fig">
<svg class="c45-sim" viewBox="0 0 520 200" role="img" aria-label="通常・P型・D型での赤と緑の見え方の比較。P型・D型では赤と緑がほぼ同じ色に見える">
  <rect width="520" height="200" fill="#f8fafc" rx="8"/>
  <!-- 通常 -->
  <text x="90" y="28" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#1e293b">通常</text>
  <rect x="30" y="40" width="50" height="40" rx="6" fill="#dc2626"/>
  <text x="55" y="65" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#ffffff">エラー</text>
  <rect x="100" y="40" width="50" height="40" rx="6" fill="#16a34a"/>
  <text x="125" y="65" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#ffffff">成功</text>
  <rect x="30" y="95" width="120" height="14" rx="3" fill="#dc2626"/>
  <rect x="30" y="115" width="120" height="14" rx="3" fill="#16a34a"/>
  <rect x="30" y="135" width="120" height="14" rx="3" fill="#2563eb"/>
  <text x="90" y="170" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#64748b">色の区別がはっきり付く</text>
  <!-- P型 -->
  <text x="270" y="28" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#1e293b">P 型（近似）</text>
  <rect x="210" y="40" width="50" height="40" rx="6" fill="#8b7a2e"/>
  <text x="235" y="65" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#ffffff">エラー</text>
  <rect x="280" y="40" width="50" height="40" rx="6" fill="#8b8432"/>
  <text x="305" y="65" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#ffffff">成功</text>
  <rect x="210" y="95" width="120" height="14" rx="3" fill="#8b7a2e"/>
  <rect x="210" y="115" width="120" height="14" rx="3" fill="#8b8432"/>
  <rect x="210" y="135" width="120" height="14" rx="3" fill="#1a4dbf"/>
  <text x="270" y="170" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#b91c1c" font-weight="700">赤と緑がほぼ同じ色</text>
  <!-- D型 -->
  <text x="450" y="28" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#1e293b">D 型（近似）</text>
  <rect x="390" y="40" width="50" height="40" rx="6" fill="#a08420"/>
  <text x="415" y="65" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#ffffff">エラー</text>
  <rect x="460" y="40" width="50" height="40" rx="6" fill="#8a8a22"/>
  <text x="485" y="65" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#ffffff">成功</text>
  <rect x="390" y="95" width="120" height="14" rx="3" fill="#a08420"/>
  <rect x="390" y="115" width="120" height="14" rx="3" fill="#8a8a22"/>
  <rect x="390" y="135" width="120" height="14" rx="3" fill="#1240b0"/>
  <text x="450" y="170" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#b91c1c" font-weight="700">赤と緑がほぼ同じ色</text>
</svg>
<figcaption class="c45-cap">シミュレーションは近似です。実際の見え方は個人差があります。</figcaption>
</figure>

Chrome DevTools で自分の画面をシミュレーションすることもできます。

1. DevTools を開く → Rendering パネル（`Ctrl+Shift+P` で「rendering」と検索）
2. 「Emulate vision deficiencies」から Protanopia（P 型）、Deuteranopia（D 型）、Tritanopia（T 型）を選択

## コントラスト比 — 読みやすさの物差し

色覚タイプに関係なく、全員に影響するのが**明るさの差**です。白い背景に薄いグレーの文字は、条件が悪ければ誰にとっても読めません。

文字色と背景色の明るさの差は、**コントラスト比**という数値で表せます。「白と白」が 1 : 1、「白と黒」が最大の 21 : 1 です。

Web のアクセシビリティ基準（WCAG）は、具体的な合格ラインを引いています。

| 対象 | 合格ライン（AA） |
|------|----------------|
| 通常サイズの文字 | **4.5 : 1 以上** |
| 大きい文字（約 24px 以上など） | 3 : 1 以上 |
| アイコンや入力欄の枠線など | 3 : 1 以上 |

AI に UI を作らせると、補足テキストがたいてい薄いグレーになります。たとえば `#cccccc` × 白背景は約 **1.6 : 1** で大幅な不合格。`#767676` あたりでようやく 4.5 : 1 に届きます。

実物で見比べてみてください。

<div class="c45-demo">
  <p class="c45-sample c45-bad">コントラスト比 1.6 : 1（#cccccc）— 不合格</p>
  <p class="c45-sample c45-edge">コントラスト比 4.5 : 1（#767676）— AA 合格ライン上</p>
  <p class="c45-sample c45-good">コントラスト比 14.6 : 1（#1e293b）— 余裕の合格</p>
</div>

「この色、読みにくくない？」は感想ではなく**数値の確認**で決着できます。AI に直させるときも「もっと濃く」ではなく「**コントラスト比 4.5 : 1 以上にして**」と言えば一発で伝わります。

## 色だけで伝えない

色覚タイプとコントラスト比を踏まえると、設計原則は 1 つです。

> **色は補助。情報そのものは、色以外の手段でも伝える。**

| 色だけ | 色 + 別の手段 |
|-------|-------------|
| エラーの入力欄を赤枠にする | 赤枠 + **エラーメッセージのテキスト** + アイコン |
| 必須項目を赤いアスタリスクだけで示す | 「必須」という**文字**のラベル |
| グラフの系列を色だけで分ける | 色 + **線種や形**（実線 / 破線、丸 / 四角） |
| 「緑のボタンを押してください」 | 「**［保存］ボタン**を押してください」と名前で呼ぶ |

```tsx
// ✅ 色（赤）はあくまで強調。情報はテキストとアイコンが運ぶ
<p role="alert" className="text-red-700">
  <span aria-hidden="true">⚠ </span>
  メールアドレスの形式が正しくありません
</p>
```

色覚の話だけではありません。読み上げ環境には色が見えず、白黒印刷では色が消え、強い日差しでは画面が白飛びします。「色以外でも伝わるか」は、あらゆる条件への保険です。

## 確認の道具

| 道具 | 何ができるか |
|------|------------|
| **DevTools のコントラスト表示** | 文字色の色見本をクリックするとコントラスト比と合否が表示される |
| **DevTools の色覚シミュレーション** | P 型・D 型・T 型の見え方をリアルタイムで再現 |
| **Lighthouse** | ページ全体のアクセシビリティをスコアで評価。コントラスト不足も検出 |
| **axe DevTools** | 要素単位で問題を指摘。色以外のアクセシビリティ問題も検出 |

どれも無料で、ブラウザの中で完結します。

## まとめ

- 色覚には P 型・D 型・T 型があり、特定の色の組み合わせが区別しにくい。D 型が最多
- コントラスト比は読みやすさの物差し。通常文字は 4.5 : 1 以上（WCAG AA）
- 色は補助。情報は色以外の手段（テキスト・アイコン・形）でも伝える

<style>
.c45-fig { margin: 16px 0; text-align: center; }
.c45-spectrum { width: 100%; max-width: 700px; height: auto; }
.c45-sim { width: 100%; max-width: 540px; height: auto; }
.c45-cap { font-size: 13px; color: #475569; margin-top: 8px; text-align: left; }
.c45-demo {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px;
  margin: 1.2em 0;
  background: #ffffff;
}
.c45-sample {
  margin: 8px 0;
  font-size: 15px;
  background: #ffffff;
}
.c45-bad { color: #cccccc; }
.c45-edge { color: #767676; }
.c45-good { color: #1e293b; }
</style>
