# Study Task Manager

大学生・大学院生向けのローカル完結型タスク管理ツール。
研究の進捗・締切・集中時間（ポモドーロ）を 1 つのダッシュボードで管理できます。

- **技術**: Next.js 14 (App Router) / TypeScript / Tailwind CSS / Zustand / date-fns
- **保存先**: ブラウザの localStorage（ログイン・サーバ不要）

## 機能
- ダッシュボード（今日のタスク・直近の締切・研究進捗・集中時間サマリ）
- タスク管理（締切・優先度・状態・プロジェクト紐付け、フィルタ／ソート）
- 研究・進捗（プロジェクトをマイルストーンに分解＋研究ログ）
- カレンダー（月表示で締切・マイルストーンを一覧）
- ポモドーロ（集中／休憩タイマー＋集中時間の統計）
- 設定（ポモドーロ時間、データの JSON エクスポート／インポート）

## セットアップ
```bash
npm install
npm run dev
# http://localhost:3000 を開く
```

本番ビルドの確認:
```bash
npm run build
```

## 注意（このフォルダは OneDrive 配下）
OneDrive 同期フォルダ内では `npm install` 時に
ファイルロック（EPERM）や大容量ダウンロードの中断（ECONNRESET）が
起きやすいことが確認されています。うまくいかない場合は:

1. **プロジェクトを OneDrive 外へ移動**（例: `C:\dev\task-manager`）するのが最も確実。
   - もしくは OneDrive の設定で `node_modules` を同期対象から除外。
2. ネットワークが原因（ECONNRESET）の場合:
   - 別回線（スマホのテザリング等）を試す
   - アンチウイルス／ファイアウォールの一時停止やホワイトリスト登録
   - 社内ネットワークならプロキシ設定（`npm config set proxy ...`）
   - `npm install --maxsockets=1`（同時接続を減らす）
   - `.npmrc` に再試行設定済み（`fetch-retries=5` 等）
```
