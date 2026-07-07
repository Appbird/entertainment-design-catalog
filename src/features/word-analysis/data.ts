import type { ClusterWordStats, PaperMetadataMap, WordDetailMap } from "./types";

export async function fetchClusterWordStats(): Promise<ClusterWordStats[]> {
  const res = await fetch("/json/ec2026si/word-clusters.json");
  return res.json();
}

export async function fetchWordDetails(): Promise<WordDetailMap> {
  const res = await fetch("/json/ec2026si/word-details.json");
  return res.json();
}

export async function fetchPaperMetadata(): Promise<PaperMetadataMap> {
  const res = await fetch("/json/ec2026si/paper-metadata.json");
  return res.json();
}
