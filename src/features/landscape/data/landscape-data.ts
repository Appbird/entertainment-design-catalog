import { ClusterType, type DataPoint, type ClusterData, type ClusterTypeValue } from "../models/validator";
import { ISSUE, resolveAdapter, type IssueValue } from "../adapters";
import type { DetailDisplayModel } from "../models/detail-display-model";
import type { ClusterOverlay, DetailViewModel, PointCloudPoint } from "../models/view-model";
import { resolveRuntimeBasePath } from "../runtime/runtime-path";


async function fetchClusterJson(
	type: ClusterTypeValue = ClusterType.ABSTRACT,
	ver: number = 32,
	issue: IssueValue = ISSUE.EC2025
): Promise<ClusterData[]> {
	const basePath = resolveRuntimeBasePath();
	const adapter = await resolveAdapter(basePath, issue);
	if (adapter.fetchClusterJson) {
		return adapter.fetchClusterJson(basePath, type, ver);
	}
	const rescls = await fetch(adapter.buildClusterUrl(basePath, type, ver));
	if (!rescls.ok) { throw new Error(`Failed to fetch: ${rescls.statusText}`); }
	const clsjson = await rescls.json();
	return adapter.parseClusterJson(clsjson);
}

async function fetchDataPoints(
	type: ClusterTypeValue = ClusterType.ABSTRACT,
	ver: number = 32,
	issue: IssueValue = ISSUE.EC2025
): Promise<DataPoint[]> {
	const basePath = resolveRuntimeBasePath();
	const adapter = await resolveAdapter(basePath, issue);
	if (adapter.fetchDataPointsJson) {
		return adapter.fetchDataPointsJson(basePath, type, ver);
	}
	const response = await fetch(adapter.buildDataPointsUrl(basePath, type, ver));
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

export async function fetchPointCloud(
	type: ClusterTypeValue = ClusterType.ABSTRACT,
	ver: number = 32,
	issue: IssueValue = ISSUE.EC2025
): Promise<PointCloudPoint[]> {
	const points = await fetchDataPoints(type, ver, issue);
	return points.map((point) => ({
		pointId: `${point.filestem}::${point.tag_idx}`,
		filestem: point.filestem,
		tagIdx: point.tag_idx,
		x: point.x,
		y: point.y,
		paperId: point.paper_id,
		paperTitle: point.paper_title,
		paperAbstract: point.paper_abstract,
		paperPublishDate: point.paper_publish_date,
		edcTitle: point.edc_title,
		edcContext: point.edc_context,
		edcEffect: point.edc_effect,
		edcType: point.edc_type,
	}));
}

export async function fetchClusterOverlays(
	type: ClusterTypeValue = ClusterType.ABSTRACT,
	ver: number = 32,
	issue: IssueValue = ISSUE.EC2025
): Promise<ClusterOverlay[]> {
	const clusters = await fetchClusterJson(type, ver, issue);
	return clusters.map((cluster) => ({
		name: cluster.name,
		x_min: cluster.x_min,
		x_max: cluster.x_max,
		y_min: cluster.y_min,
		y_max: cluster.y_max,
	}));
}

function toIPSJ_URL(paperId: string): string {
	return `https://ipsj.ixsq.nii.ac.jp/records/${paperId}`;
}

export function buildDetailViewModel(
	point: PointCloudPoint,
	displayModel: DetailDisplayModel
): DetailViewModel {
	const rawLabel = point.edcType || "paper";
	return {
		title: point.edcTitle || point.paperTitle,
		typeLabel: displayModel.toTypeLabel(rawLabel),
		paperTitle: point.paperTitle,
		paperAbstract: point.paperAbstract,
		paperUrl: toIPSJ_URL(point.paperId),
		summaryRows: displayModel.buildSummaryRows(point),
		contextItems: displayModel.buildContextItems(point),
		approachText: displayModel.buildApproachText(point),
	};
}
