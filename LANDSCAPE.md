# LANDSCAPE.md

`pages/landscape.html` は EDC Browser のエントリです。実処理は `src/main.ts` から始まります。

## 起動フロー

1. URLクエリ `?issue=...` を解釈（`src/adapters/index.ts`）
2. `issue-data-config.json` を読んで UI 選択肢を構築（分類基準・クラスタ数）
3. 選択中モードで点群・クラスタ・凡例をロード
4. Chart.js で描画し、検索・年度フィルタ・クリック詳細を有効化

## 主な責務分離

- 点群ロード: `fetchPointCloud`（`src/data.ts`）
- クラスタ枠ロード: `fetchClusterOverlays`（`src/data.ts`）
- 詳細表示モデル化: `buildDetailViewModel`（`src/data.ts`）
- 表示ルール選択: `resolveDetailDisplayModel`（`src/detail-display-model.ts`）

## アダプタと設定

issueごとの挙動は `public/json/issue-data-config.json` で管理します。

- `adapterKind: "legacy"`: `umap_{type}_edctag-{ver}.json` 形式
- `adapterKind: "cache-v2"`: `*_points / *_index / *_clusters` 形式

アダプタ実装:

- `src/adapters/ec2025.ts`
- `src/adapters/ec2026si.ts`

`src/adapters/index.ts` で `adapterKind` を解決してアダプタを選びます。

## URLとパス解決

`landscape.html` は `pages/` 配下にあるため、JSON参照は `../json/...` が基準になります。  
この差分は `src/runtime-path.ts` で吸収しています。

## 変更時のチェックポイント

1. 新issueを追加する場合:
   - `issue-data-config.json` に設定追加
   - 必要なら新アダプタを `src/adapters/` に追加
2. UIに出す分類基準やクラスタ数を変える場合:
   - まず `issue-data-config.json` を更新
3. データ形式が変わる場合:
   - 変換ロジックはアダプタ内だけ修正する

