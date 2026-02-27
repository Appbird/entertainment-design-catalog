# Embedding/Clustering Cache 型仕様

この資料は、`result/embeddings-cache` 配下に出力されるキャッシュJSONの現行フォーマットを定義します。
外部ソフトウェア連携では、以下の JSON Schema を参照してください。

## 対象ファイルとスキーマ

- `<stem>.json` -> `docs/cache-schemas/papers.schema.json`
- `<stem>.features.json` -> `docs/cache-schemas/features.schema.json`
- `<stem>.embeddings.json` -> `docs/cache-schemas/embeddings.schema.json`
- `<stem>_umap_<mode>_points.json` -> `docs/cache-schemas/umap-points.schema.json`
- `<stem>_umap_<mode>_index.json` -> `docs/cache-schemas/umap-index.schema.json`
- `<stem>_umap_<mode>_<cluster-suffix>_clusters.json` -> `docs/cache-schemas/umap-clusters.schema.json`

`<mode>` は `title` または `abstract`。

`<cluster-suffix>` は以下。

- 自動クラスタ数: `<method>-auto`（例: `gmm-auto`）
- 固定クラスタ数: `<method>-k<n_clusters>`（例: `gmm-k32`）

`<method>` は `gmm` または `kmeans`。

## 主要ID規約

- `paper_id`: 論文単位ID（例: `IPSJ-EC2013007`）
- `feature_id`: `<paper_id>::<feature_idx>`（例: `IPSJ-EC2013007::0`）
- `point_id`: `<feature_id>::<mode>`（例: `IPSJ-EC2013007::0::title`）

## 現行フォーマット上の注意

- ベクトル次元はモデル依存です（現行データ例は 3072 次元）。
- クラスタ結果は必ずトップレベルに `clusters` と `assignments` を持ちます。
- 現行実装で生成される `clusters[*]` には `naming` が含まれます（命名根拠）。
- `papers[*].edc` は EDC バージョン依存の可変構造です（`edc-version` と組み合わせて解釈）。

## 参照実装

- キャッシュ生成: `src/core/embeddings_service.py:prepare_embedding_cache`
- UMAP/クラスタ生成: `src/core/embeddings_service.py:visualize_embeddings`
- 元データ集約: `src/core/collect_service.py:collect_edc_assets`

