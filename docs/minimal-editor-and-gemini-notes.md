# 最小編集機能の構成案と Firebase/Gemini キーの整理

## 前提

今回の編集機能は次の 2 つだけに絞る想定です。

- ノード追加
- エッジ追加

ノードのリッチテキスト編集、HTML 埋め込み、画像添付、任意スクリプトは入れません。この前提なら、セキュリティは「重装備」ではなく「事故を起こしにくいデータ構造」に寄せるのが合理的です。

## 推奨構成

- フロント
  - `Next.js` で公開画面と管理画面を同居
  - 樹形図 UI は `React Flow` 系のグラフ UI を使うと実装が早い
- 認証
  - Firebase Auth の Google ログイン
  - 必要なら社内ドメイン制限
- 保存先
  - Firestore
- 更新経路
  - 追加操作は `/api/graph/add-node`
  - 追加操作は `/api/graph/add-edge`
  - Firestore へは API からだけ書く

## これで十分な理由

編集操作が追加だけなら、更新パターンがかなり限定されます。なので、クライアントから自由形 JSON を丸ごと保存させる必要がありません。

代わりに、サーバー側で受けるコマンドを固定します。

- `addNode(parentId, nodeType, label, note)`
- `addEdge(sourceId, targetId, edgeType)`

この方式にすると、入力面が小さくなるので、XSS も不正データもかなり抑えやすくなります。

## データモデル

### nodes

```json
{
  "id": "n_20260309_001",
  "treeId": "marubou-001",
  "type": "why",
  "label": "入側材の曲がりが規格外だった",
  "note": "測定タイミングが遅れた",
  "createdBy": "uid123",
  "createdAt": "server timestamp"
}
```

### edges

```json
{
  "id": "e_20260309_001",
  "treeId": "marubou-001",
  "source": "n_root",
  "target": "n_20260309_001",
  "type": "why-link",
  "createdBy": "uid123",
  "createdAt": "server timestamp"
}
```

## サーバー側で必ずやる検証

### `addNode`

- `label` は plain text のみ
- `label` 上限は 120 文字
- `note` 上限は 1000 文字
- `type` は enum のみ
- `treeId` が既存であること

### `addEdge`

- `source` と `target` が同じでないこと
- 両方のノードが同じ `treeId` に属すること
- 同一エッジの重複を禁止すること
- 木として扱うなら `target` の親は 1 つまでにすること
- 木として扱うなら循環を禁止すること

## インジェクション耐性はどこまで必要か

機密情報が薄いなら、過剰防御までは不要です。ただし、公開アプリなので最低限はやった方がいいです。

### 最低限やるべき 4 点

1. ユーザー入力は全部 `plain text` で保存する
2. React では `{text}` で描画し、`dangerouslySetInnerHTML` を使わない
3. サーバー側で文字数と enum を検証する
4. Firestore へクライアントから直接書かせない

これだけで、典型的な XSS はかなり潰せます。

### やらなくてよいもの

このスコープなら、最初から次は不要です。

- WAF 前提の大掛かりな対策
- リッチテキスト sanitizer 導入
- HTML sanitize ライブラリ導入
- Markdown レンダラ導入

逆に、これらを入れると実装が増える割に、攻撃面が広がります。

## Firebase API key と Gemini API key の整理

ここは誤解しやすいですが、2026-03-09 時点の Firebase 公式 FAQ では次の整理です。

- Firebase の Web アプリ設定に入る `Firebase API key` は、Firebase 関連 API 用の識別子であり、秘密鍵ではない
- ただし、それを `Gemini API key` として使ってはいけない
- `Gemini Developer API` を Firebase の Web 用 API key の allowlist に追加してはいけない

つまり、「Firebase API key がそのまま Gemini API の認証キーになってよい」という理解は誤りです。

Firebase 公式 FAQ は、`Can I use my "Firebase API key" as my Gemini API key?` への答えとして明確に `No` としています。また、Firebase AI Logic を使うなら Gemini API key は Firebase の proxy service 側で保持され、アプリコードへ埋め込まれないと説明しています。

## 何が公開側で見えるのか

### 見えてよいもの

- Firebase の Web 設定に含まれる `apiKey`
- `authDomain`
- `projectId`
- `appId`

これらは Firebase 公式でも「秘密として扱うものではない」とされています。

### 見えてはいけないもの

- Gemini Developer API の生 key
- service account key
- Admin SDK 用秘密情報
- FCM legacy server key

## クロールされて API を取られることへの考え方

### Firebase の Web API key について

クロールで拾われても、それ自体で Firestore や Storage の権限が奪われるわけではありません。Firebase 公式も、Firebase API keys are not secret と案内しています。

ただし、公開鍵だから完全放置でよいわけではありません。少なくとも以下はやるべきです。

- API restrictions を見直す
- 不要 API を allowlist から外す
- 認証に password を使うなら `identitytoolkit` の quota を締める

### Gemini について

危ないのは、Gemini の生 key をフロントへ置いた場合です。その場合、クロールや DevTools から抜かれて使い回されます。

なので対策は単純です。

1. 生の Gemini key をブラウザへ出さない
2. 使うなら Firebase AI Logic を通す
3. 可能なら App Check を有効化する
4. Firebase AI Logic API の per-user rate limit を下げる

Firebase 公式では、Firebase AI Logic API の per-user rate limit はデフォルト `100 RPM per user` です。公開用途なら、この値は高めです。

## どの AI 接続方法がよいか

### 1. 一番安全で簡単

AI を使わない。

今回の主目的が樹形図編集なら、まずは AI 機能なしで出すのが一番素直です。

### 2. クライアントから Gemini を使いたい

`Firebase AI Logic + App Check` を使う。

この場合、Gemini Developer API key は Firebase の proxy service 側にあり、クライアントには出ません。Firebase 公式でも、この用途では App Check を早い段階で有効化することを強く推奨しています。

### 3. さらに統制したい

サーバー側で `Genkit` か通常のバックエンド経由で Gemini を呼ぶ。

この場合は、AI 呼び出しを完全にサーバー側へ閉じ込められるので、コスト制御、監査、レート制限、入力フィルタを実装しやすいです。

## 今回のおすすめ

今回の用途なら、次の順で進めるのが妥当です。

1. まずは AI なしで、ノード追加とエッジ追加だけの編集 UI を作る
2. データは plain text only にする
3. 保存 API は 2 本に固定する
4. 公開版と下書きを分ける
5. AI を後で足すなら、直 Gemini ではなく `Firebase AI Logic + App Check` か server-side `Genkit` にする

## 参考にした公式情報

- Firebase API keys は秘密情報ではないが、Firebase 関連 API のみに使うべき: [Learn about using and managing API keys for Firebase](https://firebase.google.com/docs/projects/api-keys)
- Firebase Security Checklist でも Firebase API keys are not secret と明記: [Firebase security checklist](https://firebase.google.com/support/guides/security-checklist)
- Firebase AI Logic の proxy service は Gemini API key をサーバー側に保持する: [Gemini API using Firebase AI Logic](https://firebase.google.com/docs/ai-logic)
- Firebase AI Logic FAQ は Firebase API key を Gemini API key に使うべきではないと明記: [FAQ and troubleshooting](https://firebase.google.com/docs/ai-logic/faq-and-troubleshooting)
- Firebase AI Logic は App Check による保護を推奨: [Implement Firebase App Check to protect APIs from unauthorized clients](https://firebase.google.com/docs/ai-logic/app-check)
- Firebase AI Logic API は per-user rate limit を調整でき、デフォルトは 100 RPM per user: [Rate limits and quotas](https://firebase.google.com/docs/ai-logic/quotas)
- カスタム API も App Check token を検証して保護できる: [Protect custom backend resources with App Check in web apps](https://firebase.google.com/docs/app-check/web/custom-resource)

## 補足

「Firebase API key がクロールされるか」を心配するより、「Gemini の生 key をフロントに置かない」「書き込みを API 経由に固定する」の 2 点を守る方が重要です。
