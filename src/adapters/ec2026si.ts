import type { IssueDataAdapter } from "./types";
import {
  parseStandardBundleJson,
  parseStandardClusterJson,
  parseStandardDataPointsJson,
} from "./shared";

export const ec2026siAdapter: IssueDataAdapter = {
  issue: "ec2026si",
  buildBundleUrl: (basePath) => `${basePath}/json/ec2026si/bundle.json`,
  buildClusterUrl: (basePath, type, ver) => `${basePath}/json/ec2026si/umap_${type}_clusters-${ver}.json`,
  buildDataPointsUrl: (basePath, type, ver) => `${basePath}/json/ec2026si/umap_${type}_edctag-${ver}.json`,
  parseBundleJson: parseStandardBundleJson,
  parseClusterJson: parseStandardClusterJson,
  parseDataPointsJson: parseStandardDataPointsJson,
};
