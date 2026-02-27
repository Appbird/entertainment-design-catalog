import type { IssueDataAdapter } from "./types";
import {
  parseStandardBundleJson,
  parseStandardClusterJson,
  parseStandardDataPointsJson,
} from "./shared";

export const ec2025Adapter: IssueDataAdapter = {
  issue: "ec2025",
  buildBundleUrl: (basePath) => `${basePath}/json/ec2025/bundle.json`,
  buildClusterUrl: (basePath, type, ver) => `${basePath}/json/ec2025/umap_${type}_clusters-${ver}.json`,
  buildDataPointsUrl: (basePath, type, ver) => `${basePath}/json/ec2025/umap_${type}_edctag-${ver}.json`,
  parseBundleJson: parseStandardBundleJson,
  parseClusterJson: parseStandardClusterJson,
  parseDataPointsJson: parseStandardDataPointsJson,
};
