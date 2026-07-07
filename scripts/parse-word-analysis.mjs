// data/z_odds.txt と data/cluster-*.txt を解析し、
// public/json/ec2026si/word-clusters.json と word-details.json を生成する。
import { readFileSync, writeFileSync, readdirSync, copyFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DATA_DIR = resolve(ROOT, "data");
const OUT_DIR = resolve(ROOT, "public/json/ec2026si");

function parseZOdds(text) {
  const lines = text.split("\n");
  const clusters = [];
  let current = null;
  const headerRe = /^C\s*(\d+)\s{2,}(.+?)\s{2,}\(n=(\d+)\)\s*$/;
  const facetRe = /^\s{4}(grasp|response|approach|context)\s+(.*)$/;

  for (const line of lines) {
    const h = line.match(headerRe);
    if (h) {
      current = {
        id: Number(h[1]),
        name: h[2].trim(),
        n: Number(h[3]),
        facets: { grasp: [], response: [], approach: [], context: [] },
      };
      clusters.push(current);
      continue;
    }
    const f = line.match(facetRe);
    if (f && current) {
      const facet = f[1];
      const content = f[2].trim();
      current.facets[facet] = parseWordList(content);
    }
  }
  return clusters;
}

function parseWordList(content) {
  if (content === "" || content === "—") return [];
  const items = content.split(/(?<=\))\s{2,}(?=\S)/);
  const out = [];
  const wordRe = /^(.+?)\(z=([\d.]+),n=(\d+)\)$/;
  for (const item of items) {
    const m = item.trim().match(wordRe);
    if (m) out.push({ word: m[1], z: Number(m[2]), n: Number(m[3]) });
  }
  return out;
}

function normalizePaperId(raw) {
  return raw.split(/::|\s\(/)[0];
}

function parseSentenceLines(block) {
  const out = [];
  const re = /^\s*\[([^\]]+)\]\s+(.*)$/gm;
  let m;
  while ((m = re.exec(block))) {
    out.push({ paperId: normalizePaperId(m[1]), text: m[2].trim() });
  }
  return out;
}

function parseTopWords(block) {
  // 例: "状態(p=0.4822,n=5)  必要(p=0.4567,n=4)"
  const line = block
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.length > 0 && l !== "(該当なし)" && !l.startsWith("---"));
  if (!line) return [];
  const items = line.split(/(?<=\))\s{2,}(?=\S)/);
  const wordRe = /^(.+?)\(p=(-?[\d.]+),n=(\d+)\)$/;
  const out = [];
  for (const item of items) {
    const m = item.trim().match(wordRe);
    if (m) out.push({ word: m[1], p: Number(m[2]), n: Number(m[3]) });
  }
  return out;
}

function parseUsageBlock(block) {
  // block はヘッダ行 (--- 単語 ... ---) と (該当なし) or 語一覧行を含む全体
  const topWords = parseTopWords(block);
  const usages = [];
  const usageRe = /──\s*「(.+?)」の用法\s*\(\d+\s*文\)\s*──([\s\S]*?)(?=(?:──\s*「)|$)/g;
  let m;
  while ((m = usageRe.exec(block))) {
    usages.push({ word: m[1], sentences: parseSentenceLines(m[2]) });
  }
  return { topWords, usages };
}

function parseClusterFile(text) {
  const sectionRe =
    /#{10,}\s*\n\s*C(\d+):\s*(.+?)\s*\/\s*response\s*∋\s*「(.+?)」\s*\n\s*\|R\|\s*=\s*(\d+)\s*論文\s*\|C\\R\|\s*=\s*(\d+)\s*論文\s*\n#{10,}/g;

  const headers = [];
  let m;
  while ((m = sectionRe.exec(text))) {
    headers.push({
      index: m.index,
      end: m.index + m[0].length,
      clusterId: Number(m[1]),
      clusterName: m[2].trim(),
      word: m[3],
      rCount: Number(m[4]),
      restCount: Number(m[5]),
    });
  }

  const entries = [];
  for (let i = 0; i < headers.length; i++) {
    const h = headers[i];
    const bodyEnd = i + 1 < headers.length ? headers[i + 1].index : text.length;
    const body = text.slice(h.end, bodyEnd);

    const facetBlocks = {};
    const facetRe = /={5,}\s*\n\s*\[(response|grasp|approach)\]\s*\n={5,}\n([\s\S]*?)(?=(?:={5,}\s*\n\s*\[)|$)/g;
    let fm;
    while ((fm = facetRe.exec(body))) {
      facetBlocks[fm[1]] = fm[2];
    }

    entries.push({
      clusterId: h.clusterId,
      clusterName: h.clusterName,
      word: h.word,
      rCount: h.rCount,
      restCount: h.restCount,
      response: facetBlocks.response ? parseSentenceLines(facetBlocks.response) : [],
      grasp: facetBlocks.grasp ? parseUsageBlock(facetBlocks.grasp) : { topWords: [], usages: [] },
      approach: facetBlocks.approach ? parseUsageBlock(facetBlocks.approach) : { topWords: [], usages: [] },
    });
  }
  return entries;
}

function main() {
  const zOddsText = readFileSync(resolve(DATA_DIR, "z_odds.txt"), "utf-8");
  const clusters = parseZOdds(zOddsText);

  const details = {};
  const files = readdirSync(DATA_DIR).filter((f) => /^cluster-\d+\.txt$/.test(f));
  for (const file of files) {
    const text = readFileSync(resolve(DATA_DIR, file), "utf-8");
    const entries = parseClusterFile(text);
    for (const entry of entries) {
      const key = `${entry.clusterId}::${entry.word}`;
      details[key] = entry;
    }
  }

  writeFileSync(
    resolve(OUT_DIR, "word-clusters.json"),
    JSON.stringify(clusters, null, 2),
    "utf-8"
  );
  writeFileSync(
    resolve(OUT_DIR, "word-details.json"),
    JSON.stringify(details, null, 2),
    "utf-8"
  );

  copyFileSync(
    resolve(DATA_DIR, "ec-paper-metadata.json"),
    resolve(OUT_DIR, "paper-metadata.json")
  );

  const responseWordCount = clusters.reduce((a, c) => a + c.facets.response.length, 0);
  console.log(`clusters: ${clusters.length}, response words: ${responseWordCount}, detail entries: ${Object.keys(details).length}`);
}

main();
