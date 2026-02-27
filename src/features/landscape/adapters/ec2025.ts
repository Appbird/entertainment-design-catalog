import type { IssueDataAdapter } from "./types";
import type { ClusterData, ClusterTypeValue, DataPoint, Paper } from "../models/validator";
import {
  parseStandardBundleJson,
  parseStandardClusterJson,
  parseStandardDataPointsJson,
} from "./shared";
import { loadIssueConfigEntry } from "./issue-config";
import { joinRuntimePath } from "../runtime/runtime-path";

function applyPattern(pattern: string, type: ClusterTypeValue, ver: number): string {
  return pattern.replace("{type}", type).replace("{ver}", String(ver));
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as T;
}

export const ec2025Adapter: IssueDataAdapter = {
  issue: "ec2025",
  buildBundleUrl: () => "",
  buildClusterUrl: () => "",
  buildDataPointsUrl: () => "",
  parseBundleJson: parseStandardBundleJson,
  parseClusterJson: parseStandardClusterJson,
  parseDataPointsJson: parseStandardDataPointsJson,
  fetchBundleJson: async (basePath): Promise<Paper[]> => {
    const config = await loadIssueConfigEntry(basePath, "ec2025");
    if (!config.legacy) {
      throw new Error("Legacy config is missing for ec2025");
    }
    const json = await fetchJson<unknown>(joinRuntimePath(basePath, config.legacy.bundle));
    return parseStandardBundleJson(json);
  },
  fetchDataPointsJson: async (basePath, type, ver): Promise<DataPoint[]> => {
    const config = await loadIssueConfigEntry(basePath, "ec2025");
    if (!config.legacy) {
      throw new Error("Legacy config is missing for ec2025");
    }
    const path = applyPattern(config.legacy.dataPointsPattern, type, ver);
    const json = await fetchJson<unknown>(joinRuntimePath(basePath, path));
    return parseStandardDataPointsJson(json);
  },
  fetchClusterJson: async (basePath, type, ver): Promise<ClusterData[]> => {
    const config = await loadIssueConfigEntry(basePath, "ec2025");
    if (!config.legacy) {
      throw new Error("Legacy config is missing for ec2025");
    }
    const path = applyPattern(config.legacy.clustersPattern, type, ver);
    const json = await fetchJson<unknown>(joinRuntimePath(basePath, path));
    return parseStandardClusterJson(json);
  },
};
