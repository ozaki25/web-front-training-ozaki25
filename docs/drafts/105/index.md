# 状態遷移テスト — 画面の「状態」と移り変わりを漏らさない

## 今日のゴール

- 画面を「状態」と「遷移（イベントで起こる移り変わり）」で捉えると知る
- 状態遷移図と状態遷移表で、試す項目と「起きてはいけない遷移」を洗い出せると知る
- 「状態 → 有効な遷移 → 無効な遷移」で、どこまで試すかを決められると知る

## 成功だけ試していないか

一覧画面のテストで、まず思いつくのは「データが表示される」という成功のケースです。

でも実際の画面には、もっと状態があります。

- 読み込み中
- 0 件（空）
- エラー

成功だけ確かめて安心すると、こんなバグが平気で残ります。

- エラー時に画面が真っ白
- 0 件なのに「該当なし」が出ない

これらを体系立てて洗い出すのが**状態遷移テスト**です。

## 状態・遷移・イベント

使う言葉は 3 つです。

- **状態**: ある時点のありさま（初期・読み込み中・成功・空・エラー）
- **イベント**: 移り変わりのきっかけ（取得完了・通信失敗・ボタン押下）
- **遷移**: イベントで起こる、状態から状態への移り変わり

遷移を線でつないだ**状態遷移図**にすると、データ取得の画面はこうなります。

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

試すのは 2 つ。**状態**（各箱で見た目が正しいか）と、**遷移**（矢印どおりに動くか）です。箱の 1 つ 1 つ、矢印の 1 本 1 本が、そのままテスト項目になります。

## 状態遷移表で「起きてはいけない遷移」も出す

図は直感的ですが、「描かなかった線」は目に入りません。そこで、状態を行・イベントを列にした**状態遷移表**を作ります。

| 現在の状態 | 表示 | 成功 | 0 件 | 失敗 | 再試行 |
|---|:---:|:---:|:---:|:---:|:---:|
| 初期 | 読み込み中 | — | — | — | — |
| 読み込み中 | — | 成功 | 空 | エラー | — |
| 成功 | — | — | — | — | — |
| 空 | — | — | — | — | — |
| エラー | — | — | — | — | 読み込み中 |

読み方は 2 つです。

- **埋まったマス**: 有効な遷移（図の矢印と同じ）
- **空欄（—）**: 起きてはいけない**無効な遷移**

たとえば「読み込み中 × 再試行」は空欄です。これは「読み込み中に再試行ボタンが押せてはいけない（押せると二重取得になる）」という確認項目になります。図では見えなかった穴が、表だと見えます。

## どこまで試すか

全部試せれば理想ですが、現実は濃淡をつけます。弱いものから順に、こう厚くします。

| カバレッジ基準 | 通すもの | ひとこと |
|---|---|---|
| 全状態カバレッジ | すべての状態（箱） | 最低ライン。矢印は通り残る |
| 有効遷移カバレッジ | すべての有効な遷移（矢印） | もっとも一般的な目安 |
| 全遷移カバレッジ | 有効な遷移に加え、無効な遷移も確認 | 決済・ログインなど重要機能で |

まず箱を全部（全状態）、次に矢印を全部（有効遷移）、重要な機能は「起きてはいけない移り変わり」まで（全遷移）。

## 忘れがちな 4 つ

漏れる場所は、だいたい決まっています。

- **空（0 件）**: 成功と一緒くたにされて忘れられる
- **エラー**: ハッピーパスしか見ないと丸ごと抜ける
- **エラーからの再試行**: 行きだけ試して、戻りを忘れる
- **無効な遷移**: 二重送信・読み込み中の再操作など「起きてはいけない」動き

エラーや 0 件は本物のサーバーでは再現しにくいですが、通信を偽装する仕組み（モック）で自在に作れます。「再現できないから」は、試さない理由になりません。

## AI への指示とテストの確認

- **指示**: 「読み込み中・0 件・エラー・再試行をテストして。読み込み中に再試行できないことも」と、状態とイベントを列挙して渡す
- **確認**: できたテストを図・表と突き合わせる。埋まったマスが全部あるか、重要な空欄が試されているか

画面を作るときも読むときも、「どんな状態を持ち、どのイベントで移るか」を数える。図と表が描ければ、テスト項目はその上に見えています。

## まとめ

- 状態（箱）と遷移（矢印）の両方を試す
- 状態遷移表にすると、起きてはいけない無効な遷移も出せる
- どこまで試すかは「状態 → 有効な遷移 → 無効な遷移」の順で厚くする
- AI には状態とイベントを列挙して指示し、できたテストを図・表と照合する
