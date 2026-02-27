import { ClusterType, type DataPoint, type Paper, type ClusterData, type ClusterTypeValue } from "./validator";
import { getAdapter, ISSUE, type IssueValue } from "./adapters";
const BASE_PATH = import.meta.env.BASE_URL;

/** Compute k nearest neighbors excluding the same keyword point */
export function getKNearest(
  points: DataPoint[],
  target: DataPoint,
  k: number
): Array<{ point: DataPoint; dist: number; idx: number }> {
  return points
    .map((p, i) => ({ point: p, dist: Math.hypot(p.x - target.x, p.y - target.y), idx: i }))
    .filter(item => item.dist > 0)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, k);
}


export async function fetchBundleJson(issue: IssueValue = ISSUE.EC2025): Promise<Paper[]> {
	const adapter = getAdapter(issue);
	const response = await fetch(adapter.buildBundleUrl(BASE_PATH));
	if (!response.ok) { throw new Error(`Failed to fetch: ${response.statusText}`); }
	const json = await response.json();
	return adapter.parseBundleJson(json);
}

export async function fetchClusterJson(
	type: ClusterTypeValue = ClusterType.ABSTRACT,
	ver: number = 32,
	issue: IssueValue = ISSUE.EC2025
): Promise<ClusterData[]> {
	const adapter = getAdapter(issue);
	const rescls = await fetch(adapter.buildClusterUrl(BASE_PATH, type, ver));
	if (!rescls.ok) { throw new Error(`Failed to fetch: ${rescls.statusText}`); }
	const clsjson = await rescls.json();
	return adapter.parseClusterJson(clsjson);
}

export async function fetchDataPoints(
	type: ClusterTypeValue = ClusterType.ABSTRACT,
	ver: number = 32,
	issue: IssueValue = ISSUE.EC2025
): Promise<DataPoint[]> {
	const adapter = getAdapter(issue);
	const response = await fetch(adapter.buildDataPointsUrl(BASE_PATH, type, ver));
	if (!response.ok) {
		throw new Error(`Failed to fetch: ${response.statusText}`);
	}
	const json = await response.json();
	return adapter.parseDataPointsJson(json);
}

export async function fetchMappingAbstractCluster(issue: IssueValue = ISSUE.EC2025): Promise<Map<string, string>> {
	const abstract_clusters = await fetchClusterJson(ClusterType.ABSTRACT, 32, issue);
	const mapping: Map<string, string> = new Map();
	for (const abstract_cluster of abstract_clusters) {
		for (const member of abstract_cluster.members) {
			mapping.set(member.filestem, abstract_cluster.name); 
		}
	}
	return mapping;
}
