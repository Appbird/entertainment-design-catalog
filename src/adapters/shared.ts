import {
  isClusterData,
  isDataPoint,
  isPaper_wo_filestem,
  type ClusterData,
  type DataPoint,
  type Paper,
} from "../validator";

export function parseStandardBundleJson(json: unknown): Paper[] {
  if (typeof json !== "object" || json === null || Array.isArray(json)) {
    throw new Error("Invalid bundle JSON format");
  }

  const papers: Paper[] = [];
  for (const [key, value] of Object.entries(json)) {
    if (!isPaper_wo_filestem(value)) {
      throw new Error(`Invalid paper data format at key: ${key}`);
    }
    papers.push({ ...value, file_stem: key });
  }
  return papers;
}

export function parseStandardClusterJson(json: unknown): ClusterData[] {
  if (typeof json !== "object" || json === null || Array.isArray(json)) {
    throw new Error("Invalid cluster JSON format");
  }

  const clusters: ClusterData[] = [];
  for (const [key, value] of Object.entries(json)) {
    if (!isClusterData(value)) {
      throw new Error(`Invalid cluster data format at key: ${key}`);
    }
    clusters.push({ ...value });
  }
  return clusters;
}

export function parseStandardDataPointsJson(json: unknown): DataPoint[] {
  if (!Array.isArray(json)) {
    throw new Error("Invalid data points JSON format");
  }
  if (!json.every((entry) => isDataPoint(entry))) {
    throw new Error("Invalid data point format");
  }
  return json;
}
