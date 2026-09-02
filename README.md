# Entertainment Design Catalog Site

このリポジトリは、EC2025 / EC2026SI の紹介ページと、EDC Browser（点群可視化）を Vite で配信するためのプロジェクトです。

## ディレクトリ構成

- `pages/`: HTMLエントリ（`ec2025.html`, `ec2026si.html`, `landscape.html`, `help.html`）
- `src/`: TypeScript実装（可視化、UI、アダプタ、データ正規化）
- `public/`: 静的資産（`json`, `image`, `prompts`, `css`）
- `docs/`: ビルド成果物（GitHub Pages配信用）


## 開発コマンド

```bash
npm install
npm run dev
npm run build
npm run preview
```

## ルーティングとページ

- `index.html`: `pages/ec2026si.html` へのリダイレクト
- `pages/ec2025.html`: EC2025紹介ページ
- `pages/ec2026si.html`: EC2026SI紹介ページ
- `pages/landscape.html`: EDC Browser本体（`src/main.ts` を起動）
- `pages/help.html`: 操作ヘルプ

### 分類基準（EDC Browser の「分類基準」セレクタ）

各コンテンツが実現したい体験記述を埋め込み、それらの類似度に基づき事例を配置します。

- **EDC**: 各論文から LLM で推測した「狙いたいユーザ体験」の記述
- **状況理解のみ**: ユーザ体験のうち状況理解（grasp）の記述のみ
- **反応のみ**: ユーザ体験のうち感情反応（response）の記述のみ
- **要約**: 論文に掲載されている abstract

（`状況理解のみ` / `反応のみ` は EC2026SI のみ。詳細は `public/prompts/*/extract_EDC.txt` を参照）

## データ設定（重要）

`public/json/issue-data-config.json` で、issueごとのデータ読み込み仕様を管理しています。

- 使用アダプタ種別（`adapterKind`）
- 分類基準UI（`typeOptions`）
- クラスタ数UI（`clusterOptions`）
- 実データJSONのパス（`legacy` / `cacheV2`）

この設定により、`ec2025` と `ec2026si` のフォーマット差分をコードに直書きせずに切り替えできます。

## Landscapeの詳細仕様

`landscape.html` の構成とデータ解決フローは、以下を参照してください。

- [LANDSCAPE.md](LANDSCAPE.md)
