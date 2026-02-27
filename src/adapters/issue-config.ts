import type { ClusterTypeValue } from "../validator";
import type { IssueValue } from "./types";
import { joinRuntimePath } from "../runtime-path";

export interface ClusterTypeOption {
  value: ClusterTypeValue;
  label: string;
}

export interface LegacySourceConfig {
  bundle: string;
  dataPointsPattern: string;
  clustersPattern: string;
}

export interface CacheV2SourceConfig {
  papers: string;
  features: string;
  pointsByMode: Record<string, string>;
  indexByMode: Record<string, string>;
  clustersByMode: Record<string, string>;
}

export interface IssueConfigEntry {
  adapterKind: "legacy" | "cache-v2";
  typeOptions: ClusterTypeOption[];
  clusterOptions: number[];
  legacy?: LegacySourceConfig;
  cacheV2?: CacheV2SourceConfig;
}

interface IssueConfigFile {
  issues: Record<string, IssueConfigEntry>;
}

const configCache = new Map<string, Promise<IssueConfigFile>>();

async function fetchIssueConfig(basePath: string): Promise<IssueConfigFile> {
  const configUrl = joinRuntimePath(basePath, "json/issue-data-config.json");
  let pending = configCache.get(configUrl);
  if (!pending) {
    pending = fetch(configUrl).then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch issue config: ${response.status} ${response.statusText}`);
      }
      return (await response.json()) as IssueConfigFile;
    });
    configCache.set(configUrl, pending);
  }
  return pending;
}

export async function loadIssueConfigEntry(basePath: string, issue: IssueValue): Promise<IssueConfigEntry> {
  const config = await fetchIssueConfig(basePath);
  const entry = config.issues[issue];
  if (!entry) {
    throw new Error(`Issue config not found for: ${issue}`);
  }
  return entry;
}
