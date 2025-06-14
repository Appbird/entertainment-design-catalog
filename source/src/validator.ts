/**
 * Paper metadata and keyword point model
 */
export interface DesignTag {
	title: string;
	type: string;
	context: string;
	effect: string;
}

export interface PaperMetadata {
	title: string;
	authors: string[];
	identifier: string;
	publish_date: string;
	conference: string;
	abstract: string;
}

export interface Paper {
	file_stem: string;
	"design-tags": DesignTag[];
	metadata: PaperMetadata;
}
export interface DataPoint {
	filestem: string;
	tag_idx: number;
	paper_title: string;
	paper_id: string;
	paper_abstract: string;
	paper_publish_date: string;
	edc_title: string;
	edc_context: string;
	edc_effect: string;
	edc_type: string;
	x: number;
	y: number;
}

export const ClusterType = {
	ABSTRACT: 'abstract',
	TITLE: 'title',
	FULL: 'full',
} as const

export type ClusterTypeValue = typeof ClusterType[keyof typeof ClusterType];

export interface ClusterMember{
	filestem: string;
	tag_idx: number;
}

export interface ClusterData {
	name: string;
	members: ClusterMember[];
	x_min: number;
    x_max: number;
    y_min: number;
    y_max: number;
}

export function isClusterData(obj: any): obj is ClusterData {
	return (
		typeof obj === "object" &&
		obj !== null &&
		typeof obj.name === 'string' &&
		Array.isArray(obj['members']) &&
		typeof obj.x_min === 'number' &&
		typeof obj.x_max === 'number' &&
		typeof obj.y_min === 'number' &&
		typeof obj.y_max === 'number'
	);
}

/** Validate if an object is a valid DataPoint */
export function isDataPoint(obj: any): obj is DataPoint {
	return (
		typeof obj === "object" &&
		obj !== null &&
		typeof obj.filestem === "string" &&
		typeof obj.tag_idx === "number" &&
		typeof obj.paper_title === "string" &&
		typeof obj.paper_id === "string" &&
		typeof obj.paper_abstract === "string" &&
		typeof obj.paper_publish_date === "string" &&
		typeof obj.edc_title === "string" &&
		typeof obj.edc_context === "string" &&
		typeof obj.edc_effect === "string" &&
		typeof obj.edc_type === "string" &&
		typeof obj.x === "number" &&
		typeof obj.y === "number"
	);
}

/** Validate if an object is a valid PaperMetadata */
export function isPaperMetadata(obj: any): obj is PaperMetadata {
	return (
		typeof obj === "object" &&
		obj !== null &&
		typeof obj.title === "string" &&
		Array.isArray(obj.authors) &&
		obj.authors.every((a: any) => typeof a === "string") &&
		typeof obj.identifier === "string" &&
		typeof obj.publish_date === "string" &&
		typeof obj.conference === "string" &&
		typeof obj.abstract === "string"
	);
}

/** Validate if an object is a valid DesignTag */
export function isDesignTag(obj: any): obj is DesignTag {
	return (
		typeof obj === "object" &&
		obj !== null &&
		typeof obj.title === "string" &&
		typeof obj.type === "string" &&
		typeof obj.context === "string" &&
		typeof obj.effect === "string"
	);
}

/** Validate if an object is a valid Paper */
// Paper型からfilestemプロパティだけを除いた型
export type PaperWithoutFilestem = Omit<Paper, "file_stem">;

export function isPaper_wo_filestem(obj: any): obj is PaperWithoutFilestem {
	return (
		typeof obj === "object" &&
		obj !== null &&
		Array.isArray(obj["design-tags"]) &&
		obj["design-tags"].every(isDesignTag) &&
		isPaperMetadata(obj.metadata)
	);
}