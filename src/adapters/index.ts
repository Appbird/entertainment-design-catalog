import { ec2025Adapter } from "./ec2025";
import { ec2026siAdapter } from "./ec2026si";
import { ISSUE, type IssueDataAdapter, type IssueValue } from "./types";
import { loadIssueConfigEntry } from "./issue-config";

const issueFallbackRegistry: Record<IssueValue, IssueDataAdapter> = {
  [ISSUE.EC2025]: ec2025Adapter,
  [ISSUE.EC2026SI]: ec2026siAdapter,
};

const adapterKindRegistry: Record<string, IssueDataAdapter> = {
  legacy: ec2025Adapter,
  "cache-v2": ec2026siAdapter,
};

export function resolveIssueFromSearch(search: string): IssueValue {
  const params = new URLSearchParams(search);
  const issue = params.get("issue");
  if (issue === ISSUE.EC2025 || issue === ISSUE.EC2026SI) {
    return issue;
  }
  return ISSUE.EC2025;
}

export function getAdapter(issue: IssueValue): IssueDataAdapter {
  return issueFallbackRegistry[issue];
}

export async function resolveAdapter(basePath: string, issue: IssueValue): Promise<IssueDataAdapter> {
  const config = await loadIssueConfigEntry(basePath, issue);
  const adapter = adapterKindRegistry[config.adapterKind];
  if (!adapter) {
    return issueFallbackRegistry[issue];
  }
  return adapter;
}

export async function getIssueUiOptions(basePath: string, issue: IssueValue): Promise<{
  typeOptions: Array<{ value: "title" | "full" | "abstract"; label: string }>;
  clusterOptions: number[];
}> {
  const config = await loadIssueConfigEntry(basePath, issue);
  return {
    typeOptions: config.typeOptions,
    clusterOptions: config.clusterOptions,
  };
}

export { ISSUE, type IssueValue };
