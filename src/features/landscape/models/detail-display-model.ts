import { ISSUE, type IssueValue } from "../adapters";
import type { PointCloudPoint } from "./view-model";

export interface DetailDisplayModel {
  toTypeLabel: (rawType: string) => string;
  buildSummaryRows: (point: PointCloudPoint) => Array<{ label: string; value: string }>;
  buildContextItems: (point: PointCloudPoint) => string[];
  buildApproachText: (point: PointCloudPoint) => string | undefined;
}

function splitBySlash(text: string): string[] {
  return text
    .split(/\s*\/\s*/g)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

const fourStageModel: DetailDisplayModel = {
  toTypeLabel: (rawType: string) => {
    const map: Record<string, string> = {
      perception: "知覚",
      cognition: "認知",
      emotion: "情動",
      motivation: "動機づけ",
    };
    return map[rawType] ?? rawType;
  },
  buildSummaryRows: (point) => [
    { label: "内容", value: point.edcTitle || point.paperTitle },
  ],
  buildContextItems: (point) => (point.edcContext ? [point.edcContext] : []),
  buildApproachText: (point) => point.edcEffect || undefined,
};

const situationResponseModel: DetailDisplayModel = {
  toTypeLabel: (rawType: string) => {
    const map: Record<string, string> = {
      grasp: "状況理解",
      response: "反応",
    };
    return map[rawType] ?? rawType;
  },
  buildSummaryRows: (point) => [
    { label: "状況理解", value: point.edcTitle || point.paperTitle },
    { label: "反応", value: point.edcEffect || "" },
  ].filter((row) => row.value.length > 0),
  buildContextItems: (point) => splitBySlash(point.edcContext),
  buildApproachText: () => undefined,
};

export function resolveDetailDisplayModel(issue: IssueValue): DetailDisplayModel {
  if (issue === ISSUE.EC2026SI) {
    return situationResponseModel;
  }
  return fourStageModel;
}
