import "./style.css";
import { fetchPaperMetadata, fetchWordDetails } from "./data";
import type { FacetUsage, PaperMetadataMap, Sentence, WordDetail } from "./types";
import { wordDetailKey } from "./types";

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function boldWord(escapedText: string, rawWord: string): string {
  if (!rawWord) return escapedText;
  const re = new RegExp(escapeRegExp(escapeHtml(rawWord)), "g");
  return escapedText.replace(re, (m) => `<strong>${m}</strong>`);
}

function renderPaperRef(paperId: string, paperMeta: PaperMetadataMap): string {
  const meta = paperMeta[paperId];
  if (!meta) {
    return `<span class="paper-ref">${escapeHtml(paperId)}</span>`;
  }
  return `<a class="paper-ref" href="${escapeHtml(meta.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(meta.title)}（${escapeHtml(meta.year)}）</a>`;
}

function renderSentenceList(sentences: Sentence[], highlightWord: string, paperMeta: PaperMetadataMap): string {
  if (sentences.length === 0) {
    return `<p class="word-detail-empty">該当する記述はありません。</p>`;
  }
  const items = sentences
    .map((s) => {
      const text = boldWord(escapeHtml(s.text), highlightWord);
      return `<li>${text}<div class="paper-ref-line">${renderPaperRef(s.paperId, paperMeta)}</div></li>`;
    })
    .join("");
  return `<ul class="sentence-list">${items}</ul>`;
}

function renderHighlightBox(words: { word: string; stat?: string }[]): string {
  if (words.length === 0) return "";
  const chips = words
    .map((w) => {
      const stat = w.stat ? `<span class="word-chip__stat">${w.stat}</span>` : "";
      return `<span class="word-chip"><span class="word-chip__term">${escapeHtml(w.word)}</span>${stat}</span>`;
    })
    .join("");
  return `<div class="word-highlight-box"><div class="word-chip-list">${chips}</div></div>`;
}

function renderFacetUsage(facet: FacetUsage, paperMeta: PaperMetadataMap): string {
  const box = renderHighlightBox(
    facet.topWords.map((w) => ({ word: w.word, stat: `p=${w.p.toFixed(4)} n=${w.n}` }))
  );
  if (facet.usages.length === 0) {
    return `${box}<p class="word-detail-empty">有意な上位語は見つかりませんでした。</p>`;
  }
  const groups = facet.usages
    .map((u) => {
      return `
        <div class="usage-group">
          <div class="usage-group__title">「${escapeHtml(u.word)}」の用法</div>
          ${renderSentenceList(u.sentences, u.word, paperMeta)}
        </div>`;
    })
    .join("");
  return `${box}${groups}`;
}

function renderDetail(d: WordDetail, paperMeta: PaperMetadataMap): string {
  return `
    <a class="word-detail-back" href="./ec2026si.html">&larr; EC2026特集号ページに戻る</a>
    <div class="word-detail-header">
      <p class="word-detail-header__cluster">C${d.clusterId}　${escapeHtml(d.clusterName)}</p>
      <span class="word-detail-header__word">「${escapeHtml(d.word)}」</span>
      <span class="word-detail-header__stat">反応の記述に${d.rCount}論文（クラスタ内${d.rCount + d.restCount}論文中）で出現</span>
    </div>

    <div class="word-detail-section">
      <h3>該当する「反応」の記述</h3>
      ${renderHighlightBox([{ word: d.word }])}
      ${renderSentenceList(d.response, d.word, paperMeta)}
    </div>

    <div class="word-detail-section">
      <h3>「アプローチ」の観点での用法</h3>
      ${renderFacetUsage(d.approach, paperMeta)}
    </div>

    <div class="word-detail-section">
      <h3>「状況理解」の観点での用法</h3>
      ${renderFacetUsage(d.grasp, paperMeta)}
    </div>`;
}

async function main() {
  const root = document.getElementById("word-detail-root");
  if (!root) return;

  const params = new URLSearchParams(location.search);
  const clusterId = Number(params.get("cluster"));
  const word = params.get("word") ?? "";

  if (!Number.isFinite(clusterId) || !word) {
    root.innerHTML = `<p class="u-subtle">語が指定されていません。<a href="./ec2026si.html">EC2026特集号ページに戻る</a></p>`;
    return;
  }

  root.innerHTML = `<p class="u-subtle">読み込み中...</p>`;
  try {
    const [details, paperMeta] = await Promise.all([fetchWordDetails(), fetchPaperMetadata()]);
    const entry = details[wordDetailKey(clusterId, word)];
    if (!entry) {
      root.innerHTML = `<p class="u-subtle">該当するデータが見つかりませんでした。<a href="./ec2026si.html">EC2026特集号ページに戻る</a></p>`;
      return;
    }
    document.title = `「${entry.word}」(C${entry.clusterId} ${entry.clusterName}) | EC2026特集号`;
    root.innerHTML = renderDetail(entry, paperMeta);
  } catch (e) {
    console.error(e);
    root.innerHTML = `<p class="u-subtle">データの読み込みに失敗しました。</p>`;
  }
}

main();
