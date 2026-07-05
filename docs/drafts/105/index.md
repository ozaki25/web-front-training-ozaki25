# 状態遷移テスト — 画面の「状態」と移り変わりを漏らさない

## 今日のゴール

- 画面が複数の状態を移り変わることを知る
- 状態そのものと、状態から状態への遷移の両方を試すと知る
- 忘れがちな状態（空・エラー）と戻る遷移（再試行）に気づく

## 成功だけ試していないか

一覧画面のテストというと、まず思いつくのは「データが表示される」という成功のケースです。でも実際の画面には、成功のほかに読み込み中・0 件（空）・エラーといった状態があり、それぞれ見た目が違います。成功のケースだけ確かめて安心していると、エラー時に画面が真っ白、0 件のときに「該当なし」が出ない、といったバグは平気で残ります。

## 状態と遷移の両方を試す

画面や機能を「状態」と「状態から状態への移り変わり（遷移）」で捉え、その両方を試すのが**状態遷移テスト**です。遷移は、何かのイベント（データの取得完了、通信の失敗、再試行ボタンの押下など）をきっかけに起こります。状態と遷移を描いたこの図を状態遷移図と呼びます。データ取得の画面なら、こうなります。

<svg viewBox="0 0 520 240" role="img" aria-label="データ取得画面の状態遷移図。初期から読み込み中へ進み、読み込み中から成功・空（0件）・エラーの 3 つに分かれる。エラーからは再試行で読み込み中に戻る。遷移は表示・成功・0件・失敗・再試行というイベントで起こる。状態の箱と遷移の矢印の両方がテスト対象。" style="width:100%;height:auto;max-width:520px;display:block;margin:16px auto;">
  <defs>
    <marker id="d105-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#64748b"/></marker>
  </defs>
  <rect x="0" y="0" width="520" height="240" rx="10" fill="#f8fafc"/>

  <rect x="20" y="92" width="84" height="40" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="62" y="116" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#1e293b">初期</text>

  <rect x="150" y="92" width="110" height="40" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="205" y="116" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#1e293b">読み込み中</text>

  <rect x="330" y="24" width="160" height="40" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="410" y="48" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#1e293b">成功（データあり）</text>

  <rect x="330" y="92" width="160" height="40" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="410" y="116" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#1e293b">空（0 件）</text>

  <rect x="330" y="160" width="160" height="40" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="410" y="184" text-anchor="middle" font-family="sans-serif" font-size="12.5" font-weight="700" fill="#1e293b">エラー</text>

  <line x1="104" y1="112" x2="148" y2="112" stroke="#64748b" stroke-width="2" marker-end="url(#d105-arrow)"/>
  <text x="126" y="107" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#475569">表示</text>
  <line x1="262" y1="106" x2="328" y2="52" stroke="#64748b" stroke-width="2" marker-end="url(#d105-arrow)"/>
  <text x="302" y="72" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#475569">成功</text>
  <line x1="262" y1="112" x2="328" y2="112" stroke="#64748b" stroke-width="2" marker-end="url(#d105-arrow)"/>
  <text x="296" y="107" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#475569">0 件</text>
  <line x1="262" y1="118" x2="328" y2="172" stroke="#64748b" stroke-width="2" marker-end="url(#d105-arrow)"/>
  <text x="302" y="152" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#475569">失敗</text>

  <path d="M338,200 C300,232 205,232 205,134" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="5 3" marker-end="url(#d105-arrow)"/>
  <text x="268" y="226" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#475569">再試行</text>
</svg>

試すのは、状態そのもの（各状態で見た目が正しいか）と、遷移（イベントで次の状態へ正しく動くか）です。図の箱の 1 つ 1 つ（状態）、矢印の 1 本 1 本（イベントによる遷移）が、そのままテスト項目になります。すべての状態とすべての遷移を通すことを目安にします。

## 忘れがちな状態と遷移

漏れる場所は、だいたい決まっています。

- **空（0 件）の状態**: データが 0 件のときの見た目。成功と一緒くたにされて忘れられがち
- **エラーの状態**: 通信が失敗したときの見た目。ハッピーパスしか見ないと丸ごと抜ける
- **エラーからの再試行**: エラーから再試行して読み込み中に戻る流れ。行きだけ試して、戻りを忘れる

エラーや 0 件の状態は本物のサーバーでは再現しにくいですが、通信を偽装する仕組み（モック）を使えば自在に作り出せます。だから「再現できないから」は、これらを試さない理由になりません。

## AI への指示と、テストの確認

- **指示**: 「成功だけでなく、読み込み中・0 件・エラー、そしてエラーからの再試行もテストして」と、状態を列挙して渡す
- **確認**: できたテストに「空」「エラー」のケースがあるか、状態の図と突き合わせる。成功だけなら、図の残りの箱と矢印がまるごと穴

画面を作るときも読むときも、「この画面はどんな状態を持つか」を数える。状態の絵が描ければ、テストすべき項目はその絵の上に見えています。

## まとめ

- 画面は状態を移り変わるので、状態と遷移の両方を試す
- 忘れがちなのは、空・エラーの状態と、エラーからの再試行
- 図の箱と矢印が、そのままテスト項目になる
- AI には状態を列挙して指示し、できたテストを状態の図と突き合わせる
