import { ec2025Adapter } from "./ec2025";
import { ec2026siAdapter } from "./ec2026si";
import { ISSUE, type IssueDataAdapter, type IssueValue } from "./types";

const adapterRegistry: Record<IssueValue, IssueDataAdapter> = {
  [ISSUE.EC2025]: ec2025Adapter,
  [ISSUE.EC2026SI]: ec2026siAdapter,
};

export function resolveIssueFromSearch(search: string): IssueValue {
  const params = new URLSearchParams(search);
  const issue = params.get("issue");
  if (issue === ISSUE.EC2025 || issue === ISSUE.EC2026SI) {
    return issue;
  }
  return ISSUE.EC2025;
}

export function getAdapter(issue: IssueValue): IssueDataAdapter {
  return adapterRegistry[issue];
}

export { ISSUE, type IssueValue };
