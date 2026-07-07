import "./style.css";
import { fetchClusterWordStats } from "./data";
import type { ClusterWordStats, WordStat } from "./types";

function renderChipList(words: WordStat[], clusterId: number, linkable: boolean): string {
  if (words.length === 0) {
    return `<span class="word-table__empty">—</span>`;
  }
  const chips = words
    .map((w) => {
      const stat = `<span class="word-chip__stat">z=${w.z.toFixed(2)} n=${w.n}</span>`;
      const term = `<span class="word-chip__term">${escapeHtml(w.word)}</span>`;
      if (linkable) {
        const href = `./ec2026si-word.html?cluster=${clusterId}&word=${encodeURIComponent(w.word)}`;
        return `<a class="word-chip word-chip--link" href="${href}">${term}${stat}</a>`;
      }
      return `<span class="word-chip">${term}${stat}</span>`;
    })
    .join("");
  return `<div class="word-chip-list">${chips}</div>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function renderTable(clusters: ClusterWordStats[]): string {
  const rows = clusters
    .map((c) => {
      return `
        <tr>
          <td class="word-table__cluster">
            <span class="word-table__cid">C${c.id}</span>
            <span class="word-table__cname">${escapeHtml(c.name)}</span>
            <span class="word-table__cn">n=${c.n}</span>
          </td>
          <td>${renderChipList(c.facets.response, c.id, true)}</td>
          <td>${renderChipList(c.facets.grasp, c.id, false)}</td>
        </tr>`;
    })
    .join("");

  return `
    <p class="word-legend">語をクリックすると、該当する記述と「状況理解」「アプローチ」の観点での用法を確認できます。</p>
    <div class="word-table-wrap">
      <table class="word-table">
        <thead>
          <tr>
            <th>クラスタ</th>
            <th>反応（response）の特徴語</th>
            <th>状況理解（grasp）の特徴語</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

async function main() {
  const root = document.getElementById("word-analysis-root");
  if (!root) return;
  root.innerHTML = `<p class="u-subtle">読み込み中...</p>`;
  try {
    const clusters = await fetchClusterWordStats();
    root.innerHTML = renderTable(clusters);
  } catch (e) {
    console.error(e);
    root.innerHTML = `<p class="u-subtle">データの読み込みに失敗しました。</p>`;
  }
}

main();
