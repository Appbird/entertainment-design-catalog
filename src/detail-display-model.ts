import { ISSUE, type IssueValue } from "./adapters";

export interface DetailDisplayModel {
  toTypeLabel: (rawType: string) => string;
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
};

const situationResponseModel: DetailDisplayModel = {
  toTypeLabel: (rawType: string) => {
    const map: Record<string, string> = {
      grasp: "状況理解",
      response: "反応",
    };
    return map[rawType] ?? rawType;
  },
};

export function resolveDetailDisplayModel(issue: IssueValue): DetailDisplayModel {
  if (issue === ISSUE.EC2026SI) {
    return situationResponseModel;
  }
  return fourStageModel;
}
