import type { IssueDataAdapter } from "./types";
import type { ClusterTypeValue, DataPoint, Paper, PaperMetadata } from "../models/validator";
import {
  parseStandardBundleJson,
  parseStandardClusterJson,
  parseStandardDataPointsJson,
} from "./shared";
import { loadIssueConfigEntry } from "./issue-config";
import { joinRuntimePath } from "../runtime/runtime-path";

type Mode = "title" | "abstract" | "grasp" | "response";

interface Ec2026PaperEntry {
  paper_id: string;
  metadata: PaperMetadata;
}

interface Ec2026PapersJson {
  papers: Record<string, Ec2026PaperEntry>;
}

interface Ec2026Feature {
  feature_id: string;
  paper_id: string;
  feature_idx: number;
  title: string;
  type: string;
  context: string;
  effect: string;
}

interface Ec2026FeaturesJson {
  features: Ec2026Feature[];
}

interface Ec2026UmapPoint {
  point_id: string;
  x: number;
  y: number;
}

interface Ec2026UmapIndexEntry {
  point_id: string;
  feature_id: string;
  paper_id: string;
  feature_idx: number;
}

interface Ec2026Cluster {
  cluster_id: number;
  name: string;
  x_min: number;
  x_max: number;
  y_min: number;
  y_max: number;
}

interface Ec2026ClusterAssignment {
  point_id: string;
  cluster_id: number;
}

interface Ec2026ClustersJson {
  clusters: Ec2026Cluster[];
  assignments: Ec2026ClusterAssignment[];
}

const jsonCache = new Map<string, Promise<unknown>>();

async function fetchJsonCached<T>(url: string): Promise<T> {
  let pending = jsonCache.get(url);
  if (!pending) {
    pending = fetch(url).then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
      }
      try {
        return await response.json();
      } catch {
        throw new Error(`Invalid JSON response at ${url}`);
      }
    });
    jsonCache.set(url, pending);
  }
  return (await pending) as T;
}

function toMode(type: ClusterTypeValue): Mode {
  if (type === "title" || type === "abstract" || type === "grasp" || type === "response") {
    return type;
  }
  return "title";
}

function pickByMode(map: Record<string, string>, mode: Mode): string {
  const path = map[mode];
  if (!path) {
    throw new Error(`Path is not configured for mode: ${mode}`);
  }
  return path;
}

function pickByModeOrDefault(
  byMode: Record<string, string> | undefined,
  mode: Mode,
  defaultPath: string
): string {
  return byMode?.[mode] ?? defaultPath;
}

export const ec2026siAdapter: IssueDataAdapter = {
  issue: "ec2026si",
  buildBundleUrl: () => "",
  buildClusterUrl: () => "",
  buildDataPointsUrl: () => "",
  parseBundleJson: parseStandardBundleJson,
  parseClusterJson: parseStandardClusterJson,
  parseDataPointsJson: parseStandardDataPointsJson,
  fetchBundleJson: async (basePath) => {
    const config = await loadIssueConfigEntry(basePath, "ec2026si");
    if (!config.cacheV2) {
      throw new Error("cacheV2 config is missing for ec2026si");
    }
    const papersUrl = joinRuntimePath(basePath, config.cacheV2.papers);
    const featuresUrl = joinRuntimePath(basePath, config.cacheV2.features);

    const [papersJson, featuresJson] = await Promise.all([
      fetchJsonCached<Ec2026PapersJson>(papersUrl),
      fetchJsonCached<Ec2026FeaturesJson>(featuresUrl),
    ]);

    const featuresByPaper = new Map<string, Ec2026Feature[]>();
    for (const feature of featuresJson.features) {
      const list = featuresByPaper.get(feature.paper_id) ?? [];
      list.push(feature);
      featuresByPaper.set(feature.paper_id, list);
    }

    const papers: Paper[] = [];
    for (const entry of Object.values(papersJson.papers)) {
      const features = featuresByPaper.get(entry.paper_id) ?? [];
      papers.push({
        file_stem: entry.paper_id,
        metadata: entry.metadata,
        "design-tags": features.map((feature) => ({
          title: feature.title ?? "",
          type: feature.type ?? "",
          context: feature.context ?? "",
          effect: feature.effect ?? "",
        })),
      });
    }
    return papers;
  },
  fetchDataPointsJson: async (basePath, type) => {
    const config = await loadIssueConfigEntry(basePath, "ec2026si");
    if (!config.cacheV2) {
      throw new Error("cacheV2 config is missing for ec2026si");
    }
    const mode = toMode(type);
    const papersUrl = joinRuntimePath(
      basePath,
      pickByModeOrDefault(config.cacheV2.papersByMode, mode, config.cacheV2.papers)
    );
    const featuresUrl = joinRuntimePath(
      basePath,
      pickByModeOrDefault(config.cacheV2.featuresByMode, mode, config.cacheV2.features)
    );
    const pointsUrl = joinRuntimePath(basePath, pickByMode(config.cacheV2.pointsByMode, mode));
    const indexUrl = joinRuntimePath(basePath, pickByMode(config.cacheV2.indexByMode, mode));

    const [papersJson, featuresJson, pointsJson, indexJson] = await Promise.all([
      fetchJsonCached<Ec2026PapersJson>(papersUrl),
      fetchJsonCached<Ec2026FeaturesJson>(featuresUrl),
      fetchJsonCached<Ec2026UmapPoint[]>(pointsUrl),
      fetchJsonCached<Ec2026UmapIndexEntry[]>(indexUrl),
    ]);

    const papersById = new Map<string, Ec2026PaperEntry>();
    for (const paper of Object.values(papersJson.papers)) {
      papersById.set(paper.paper_id, paper);
    }

    const featureById = new Map<string, Ec2026Feature>();
    for (const feature of featuresJson.features) {
      featureById.set(feature.feature_id, feature);
    }

    const indexByPointId = new Map<string, Ec2026UmapIndexEntry>();
    for (const entry of indexJson) {
      indexByPointId.set(entry.point_id, entry);
    }

    const dataPoints: DataPoint[] = [];
    for (const point of pointsJson) {
      const idx = indexByPointId.get(point.point_id);
      if (!idx) continue;
      const feature = featureById.get(idx.feature_id);
      const paper = papersById.get(idx.paper_id);
      if (!paper) continue;

      dataPoints.push({
        filestem: idx.paper_id,
        tag_idx: idx.feature_idx,
        paper_title: paper.metadata.title ?? "",
        paper_id: paper.metadata.identifier ?? idx.paper_id,
        paper_abstract: paper.metadata.abstract ?? "",
        paper_publish_date: paper.metadata.publish_date ?? "",
        edc_title: feature?.title ?? "",
        edc_context: feature?.context ?? "",
        edc_effect: feature?.effect ?? "",
        edc_type: feature?.type ?? "",
        x: point.x,
        y: point.y,
      });
    }

    return dataPoints;
  },
  fetchClusterJson: async (basePath, type) => {
    const config = await loadIssueConfigEntry(basePath, "ec2026si");
    if (!config.cacheV2) {
      throw new Error("cacheV2 config is missing for ec2026si");
    }
    const mode = toMode(type);
    const clustersUrl = joinRuntimePath(basePath, pickByMode(config.cacheV2.clustersByMode, mode));
    const indexUrl = joinRuntimePath(basePath, pickByMode(config.cacheV2.indexByMode, mode));

    const [clustersJson, indexJson] = await Promise.all([
      fetchJsonCached<Ec2026ClustersJson>(clustersUrl),
      fetchJsonCached<Ec2026UmapIndexEntry[]>(indexUrl),
    ]);

    const indexByPointId = new Map<string, Ec2026UmapIndexEntry>();
    for (const entry of indexJson) {
      indexByPointId.set(entry.point_id, entry);
    }

    const membersByClusterId = new Map<number, Array<{ filestem: string; tag_idx: number }>>();
    for (const assignment of clustersJson.assignments) {
      const idx = indexByPointId.get(assignment.point_id);
      if (!idx) continue;
      const members = membersByClusterId.get(assignment.cluster_id) ?? [];
      members.push({ filestem: idx.paper_id, tag_idx: idx.feature_idx });
      membersByClusterId.set(assignment.cluster_id, members);
    }

    return clustersJson.clusters.map((cluster) => ({
      name: cluster.name || `cluster-${cluster.cluster_id}`,
      x_min: cluster.x_min,
      x_max: cluster.x_max,
      y_min: cluster.y_min,
      y_max: cluster.y_max,
      members: membersByClusterId.get(cluster.cluster_id) ?? [],
    }));
  },
};
