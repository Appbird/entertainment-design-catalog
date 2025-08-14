import { isDataPoint, isPaper_wo_filestem, isClusterData,ClusterType, type DataPoint, type Paper, type ClusterData, type ClusterTypeValue } from "./validator";
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


export async function fetchBundleJson(): Promise<Paper[]> {
	console.log(BASE_PATH);
	const response = await fetch(`${BASE_PATH}/json/bundle.json`);
	if (!response.ok) { throw new Error(`Failed to fetch: ${response.statusText}`); }
	const json = await response.json();
	const papers:Paper[] = []
	for (const [key, value] of Object.entries(json)) {
		if (!isPaper_wo_filestem(value)) { throw new Error(`Invalid paper data format at key: ${key}`); }
		const paper:Paper = { ...value, file_stem: key };
		papers.push(paper);
	}
	return papers;
}

export async function fetchClusterJson(type: ClusterTypeValue=ClusterType.ABSTRACT,ver: number=32): Promise<ClusterData[]> {
	const rescls = await fetch(`${BASE_PATH}/json/umap_${type}_clusters-${ver}.json`);
	if (!rescls.ok) { throw new Error(`Failed to fetch: ${rescls.statusText}`); }
	const clsjson = await rescls.json();
	const clusters:ClusterData[] = []
	for (const [key, value] of Object.entries(clsjson)) {
		if (!isClusterData(value)) { throw new Error(`Invalid cluster data format at key: ${key}`); }
		const cluster: ClusterData = {
			...value
		}
		clusters.push(cluster);
	}
	return clusters;
}

export async function fetchDataPoints(type: ClusterTypeValue=ClusterType.ABSTRACT): Promise<DataPoint[]> {
	const response = await fetch(`${BASE_PATH}/json/umap_${type}_edctag.json`);
	if (!response.ok) {
		throw new Error(`Failed to fetch: ${response.statusText}`);
	}
	const json = await response.json();
	if (!Array.isArray(json)) { throw new Error("Invalid JSON format"); }
	if (!json.every(e => isDataPoint(e))) { throw new Error("Invalid paper data format"); }
	return json;
}

export async function fetchMappingAbstractCluster(): Promise<Map<String, String>> {
	const abstract_clusters = await fetchClusterJson();
	const mapping: Map<String, String> = new Map();
	for (const abstract_cluster of abstract_clusters) {
		for (const member of abstract_cluster.members) {
			mapping.set(member.filestem, abstract_cluster.name); 
		}
	}
	return mapping;
}
