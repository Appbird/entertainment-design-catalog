import { buildDetailViewModel, fetchClusterOverlays, fetchMappingAbstractCluster, fetchPointCloud } from '../data/landscape-data';
import { resolveDetailDisplayModel } from '../models/detail-display-model';
import {
  createScatterChart,
  updateChartWithFilters,
  type FilterState
} from '../chart/scatter-chart';
import {
  buildLayout,
  setupYearFilter,
} from '../ui/layout';
import { setupClickHandler } from '../ui/interactions';
import { updateLegend } from '../ui/legend-panel';
import type {
  Chart
} from 'chart.js';
import type {ClusterTypeValue } from '../models/validator'
import { LegendBundle } from '../legend/legend-bundle';
import { getIssueUiOptions, resolveIssueFromSearch, type IssueValue } from '../adapters';
import type { PointCloudPoint } from '../models/view-model';
import { resolveRuntimeBasePath } from '../runtime/runtime-path';

let chartInstance: Chart | null = null;
const HELP_PAGE_URL = './help.html';

async function loadChart(
  appElements: {
    canvas: HTMLCanvasElement;
    canvasContainer: HTMLDivElement;
    sideMenu: HTMLDivElement;
    searchInput: HTMLInputElement;
    yearFilterContainer: HTMLDivElement;
  },
  type: ClusterTypeValue,
  ver: number,
  issue: IssueValue
) {
  if (chartInstance) {
    chartInstance.destroy();
  }

  const { canvas, canvasContainer, sideMenu, searchInput, yearFilterContainer } = appElements;

  const detailsContainer = sideMenu.querySelector<HTMLDivElement>('#details-container');
  if (detailsContainer) detailsContainer.innerHTML = '<p>データをロード中...</p>';

  const dataPoints = await fetchPointCloud(type, ver, issue);
  const clusterBoxes = await fetchClusterOverlays(type, ver, issue);
  const abst_map = await fetchMappingAbstractCluster(issue);
  const legend = new LegendBundle<PointCloudPoint, string>(
      "種類別",
      dataPoints,
      d => abst_map.get(d.filestem) || "その他"
  )
  const mapped_colors = legend.getDataColors(dataPoints);

  if (detailsContainer) detailsContainer.innerHTML = '';

  chartInstance = createScatterChart(canvas.getContext('2d')!, dataPoints, mapped_colors, clusterBoxes);

  const filterState: FilterState = {
    searchQuery: searchInput.value,
    selectedYears: new Set(),
  };

  const applyFilters = () => {
    if (!chartInstance) return;
    updateChartWithFilters(chartInstance, dataPoints, legend, filterState);
  };
  
  const detailDisplayModel = resolveDetailDisplayModel(issue);
  setupClickHandler(
    canvas,
    chartInstance,
    dataPoints,
    sideMenu,
    (point) => buildDetailViewModel(point, detailDisplayModel)
  );

  searchInput.addEventListener('input', () => {
    filterState.searchQuery = searchInput.value;
    applyFilters();
  });
  
  setupYearFilter(yearFilterContainer, dataPoints, (selectedYears) => {
    filterState.selectedYears = selectedYears;
    applyFilters();
  });

  updateLegend(canvasContainer, legend);
}

export async function initLandscapeApp(): Promise<void> {
  const issue = resolveIssueFromSearch(window.location.search);
  const basePath = resolveRuntimeBasePath();
  const uiOptions = await getIssueUiOptions(basePath, issue);
  const { canvas, canvasContainer, sideMenu, searchInput, typeSelect, verSelect, helpButton, yearFilterContainer } = buildLayout(uiOptions);

  helpButton.addEventListener('click', () => {
    window.open(HELP_PAGE_URL, '_blank');
  });

  const appElements = { canvas, canvasContainer, sideMenu, searchInput, yearFilterContainer };

  const handleDataChange = async () => {
    const selectedType = typeSelect.value as ClusterTypeValue;
    const selectedVer = uiOptions.clusterOptions.length > 0
      ? parseInt(verSelect.value, 10)
      : 0;
    await loadChart(appElements, selectedType, selectedVer, issue);
  };

  typeSelect.addEventListener('change', handleDataChange);
  if (uiOptions.clusterOptions.length > 0) {
    verSelect.addEventListener('change', handleDataChange);
  }

  await handleDataChange();
}
