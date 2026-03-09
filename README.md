# cta_story

`docs/` の設計メモをベースに、まずローカルで動かせる最小実装を用意したリポジトリです。

## 実装済みスコープ

- 公開ビュー: `/` で `published` を表示
- 管理画面: `/admin` で `draft` 編集
- Task Diagram: 複数の root `task_step` を作成し、開始ルートを選択可能
- 編集操作: ノード追加 / 未接続ノードの接続（エッジ追加）
- CTA ノード種別: `task_step` / `cognitive_demand` / `cue_signal` / `expert_strategy` / `novice_error`
- データモデル: `parentId` ベースの単一 JSON
- 保存先:
  - Firebase 設定あり: Firestore (`trees/{treeId}/versions/{draft|published}`)
  - Firebase 設定なし: `localStorage` (mock mode)

## ディレクトリ

- `src/pages`: 公開画面と管理画面
- `src/components`: UI コンポーネント
- `src/lib`: Firebase 初期化、保存レイヤ、ツリー操作ロジック
- `src/hooks`: 認証フック
- `src/types`: 型定義
- `docs`: 設計資料

## ローカル起動

1. 依存をインストール

```bash
npm install
```

2. 環境変数を作成

```bash
cp .env.example .env
```

3. 起動

```bash
npm run dev
```

起動後:

- 公開: `http://localhost:5173/`
- 管理: `http://localhost:5173/admin`

Firebase 値が空の場合は自動で mock mode になり、`localStorage` 保存で動作します。

## Firebase を使う場合

`.env` に以下を設定します。

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`

加えて、編集者ユーザーへ Firebase Auth Custom Claim の `editor: true` を付与してください。
`firestore.rules` はその前提で `draft` の read/write を許可しています。

## ドキュメント

- [Firebase App Hosting 構成案](./docs/firebase-app-hosting-xss-plan.md)
- [最小編集機能メモ](./docs/minimal-editor-and-gemini-notes.md)
- [UI 設計書 (HTML)](./docs/tree-editor-design.html)
- [Firestore Rules](./firestore.rules)
