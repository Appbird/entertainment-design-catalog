import type { PointCloudPoint } from "../models/view-model";

/** Compute k nearest neighbors excluding the same keyword point */
export function getKNearest(
  points: PointCloudPoint[],
  target: PointCloudPoint,
  k: number
): Array<{ point: PointCloudPoint; dist: number; idx: number }> {
  return points
    .map((p, i) => ({ point: p, dist: Math.hypot(p.x - target.x, p.y - target.y), idx: i }))
    .filter((item) => item.dist > 0)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, k);
}
