import type { Chart } from "chart.js";
import { querySearchChart } from "../chart/scatter-chart";
import { getKNearest } from "../data/knn";
import type { LegendBundle } from "../legend/legend-bundle";
import type { DetailViewModel, PointCloudPoint } from "../models/view-model";
import { updateSideMenu } from "./detail-panel";

export function setupClickHandler(
  canvas: HTMLCanvasElement,
  chart: Chart,
  allDataPoints: PointCloudPoint[],
  sideMenu: HTMLDivElement,
  toDetailViewModel: (point: PointCloudPoint) => DetailViewModel
): void {
  canvas.addEventListener("click", (evt) => {
    const active = chart.getElementsAtEventForMode(evt, "nearest", { intersect: true }, false);
    if (!active.length) return;

    const clickedChartPoint = chart.data.datasets[0].data[active[0].index] as any;
    const clickedPointId = clickedChartPoint.point_id;

    const clicked = allDataPoints.find((p) => p.pointId === clickedPointId);
    if (!clicked) return;

    const knn = getKNearest(allDataPoints, clicked, 5);
    const neighbors = knn.map((k) => ({ ...k, detail: toDetailViewModel(k.point) }));

    updateSideMenu(sideMenu, toDetailViewModel(clicked), neighbors);
  });
}

export function setupSearchHandler<L>(
  searchInput: HTMLInputElement,
  chart: Chart,
  allDataPoints: PointCloudPoint[],
  legend: LegendBundle<PointCloudPoint, L>
): void {
  searchInput.addEventListener("input", (event) => {
    const target = event.target as HTMLInputElement;
    searchChart(target, chart, allDataPoints, legend);
  });
}

export function searchChart<L>(
  searchInput: HTMLInputElement,
  chart: Chart,
  allDataPoints: PointCloudPoint[],
  legend: LegendBundle<PointCloudPoint, L>
): void {
  const query = searchInput.value.toLowerCase().trim();
  querySearchChart(chart, allDataPoints, legend, query);
}
