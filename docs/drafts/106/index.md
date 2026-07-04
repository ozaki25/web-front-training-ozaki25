# テスト計画 — どこまでテストするか

## 今日のゴール

- 全部はテストできない（網羅は不可能）と知る
- リスク（影響と起きやすさ）でテストの濃淡をつけると知る
- 「どうなったら十分か」という止めどきの考え方を知る

## 「全部テストして」は無理

AI は無限にテストを生成できます。「全部テストして」と言えば、いくらでも出てきます。でも、あらゆる入力・あらゆる組み合わせを試すのは、そもそも不可能です。

入力欄が 1 つあるだけでも、あり得る入力は無限にあります（文字数、文字種、記号、空、超長文…）。組み合わせれば天文学的な数になり、現実的な時間では終わりません。「全数テストは不可能」はテストの原則のひとつで、プロも「全部」ではなく「どこに力を入れるか」を決めています。この力の配りどころを決めるのがテスト計画です。

## リスクで濃淡をつける

力の入れどころは、リスクで決めます。この進め方をリスクベースドテストと呼びます。リスクの大きさ（リスクレベル）は、2 つの掛け合わせで決まります。

- **リスクの影響**: そこが壊れたときの痛手（決済が止まるのと、端の表示が少しずれるのとでは、重みが違う）
- **リスクの可能性**: そこが間違っている・壊れる確率の高さ（起きやすさ。複雑な条件分岐や、最近変更した箇所は高い）

両方が高いところを厚く、両方が低いところは薄く、あるいは省きます。

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

図の右上、影響も起きやすさも高いところが最重点です。決済・ログイン・複雑な割引ロジックがここで、境界値や組み合わせまで厚くテストします。逆に左下、影響も起きやすさも低いところ（めったに使わない画面の細かい表示など）は、薄くてよいか、今はやらない判断もできます。

## 止めどき — 100% を目指さない

「どこまでやれば十分か」を決める基準を、終了基準（テストをやめてよい条件）と呼びます。これも計画の一部です。目指すのは 100% ではありません（カバレッジが 100% でもバグは残ります）。十分かどうかは、たとえばこんな状態を目安にします。

- クリティカルパス（事業が止まる動線）が通る
- 重要な境界値が押さえてある
- 最近変更した箇所が守られている

価値の高い順に埋めていき、追加の 1 本で減らせるリスクが小さくなったら、そこが**止めどき**です。時間は有限なので、費用対効果が落ちてきたら、その先は別の機能のテストに時間を回すほうが、全体の安心は増えます。

## AI への頼み方と査読

- **指示**: 「全部」ではなく「決済まわりは境界値まで厚く、表示の細部は薄く」と、リスクで濃淡を伝える
- **査読**: AI が出したテストの山が、リスクの高いところに集中しているかを見る。低リスクに大量で高リスクが手薄なら、並べ替える

本数を減らす判断も、りっぱなテスト計画です。「多い」は「良い」ではありません。

## まとめ

- 全部はテストできないから、力の入れどころに濃淡をつける
- 濃淡はリスク（影響と起きやすさ）で決める
- 100% でなく「重要なリスクが守れたら十分」が止めどき
- AI には「どこを厚く」を指示し、テストの山はリスクで取捨する
