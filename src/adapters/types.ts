import type { ClusterData, ClusterTypeValue, DataPoint, Paper } from "../validator";

export const ISSUE = {
  EC2025: "ec2025",
  EC2026SI: "ec2026si",
} as const;

export type IssueValue = (typeof ISSUE)[keyof typeof ISSUE];

export interface IssueDataAdapter {
  issue: IssueValue;
  buildBundleUrl: (basePath: string) => string;
  buildClusterUrl: (basePath: string, type: ClusterTypeValue, ver: number) => string;
  buildDataPointsUrl: (basePath: string, type: ClusterTypeValue, ver: number) => string;
  parseBundleJson: (json: unknown) => Paper[];
  parseClusterJson: (json: unknown) => ClusterData[];
  parseDataPointsJson: (json: unknown) => DataPoint[];
  fetchBundleJson?: (basePath: string) => Promise<Paper[]>;
  fetchClusterJson?: (basePath: string, type: ClusterTypeValue, ver: number) => Promise<ClusterData[]>;
  fetchDataPointsJson?: (basePath: string, type: ClusterTypeValue, ver: number) => Promise<DataPoint[]>;
}
