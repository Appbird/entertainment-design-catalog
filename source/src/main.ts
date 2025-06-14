import './style.css';
import { fetchBundleJson, fetchClusterJson, fetchDataPoints, fetchMappingAbstractCluster } from './data.ts';
import { createScatterChart } from './chart.ts';
import {
  buildLayout,
  searchChart,
  setupClickHandler,
  setupSearchHandler,
  updateLegend,
} from './ui.ts';
import type { Chart } from 'chart.js';
import type {ClusterTypeValue, DataPoint} from './validator.ts'
import { LegendBundle } from './legend.ts';

let chartInstance: Chart | null = null;

async function loadChart(
  appElements: {
    canvas: HTMLCanvasElement;
    canvasContainer: HTMLDivElement;
    sideMenu: HTMLDivElement;
    searchInput: HTMLInputElement;
  },
  type: ClusterTypeValue,
  ver: number
) {
  if (chartInstance) {
    chartInstance.destroy();
  }

  const { canvas, canvasContainer, sideMenu, searchInput } = appElements;

  // Show a loading message
  const detailsContainer = sideMenu.querySelector<HTMLDivElement>('#details-container');
  if (detailsContainer) detailsContainer.innerHTML = '<p>データをロード中...</p>';

  // Fetch all necessary data
  const papers = await fetchBundleJson();
  const dataPoints = await fetchDataPoints(type);
  const clusterBoxes = await fetchClusterJson(type, ver);
  const abst_map = await fetchMappingAbstractCluster();
  const legend = new LegendBundle<DataPoint,String>(
      "種類別",
      dataPoints,
      d => abst_map.get(d.filestem) || "その他"
  )
  /**
   *  new LegendBundle<DataPoint,String>(
        "年代別",
        dataPoints,
        d => new Date(d.paper_publish_date).getFullYear()
      )
   * */
  const mapped_colors = legend.getDataColors(dataPoints);

  // Clear loading message
  if (detailsContainer) detailsContainer.innerHTML = '';

  // Create a new chart
  chartInstance = createScatterChart(canvas.getContext('2d')!, dataPoints, mapped_colors, clusterBoxes);

  // (Re)setup handlers
  setupClickHandler(canvas, chartInstance, dataPoints, papers, sideMenu);
  setupSearchHandler(searchInput, chartInstance, dataPoints, legend);
  searchChart(searchInput, chartInstance, dataPoints, legend);
  // Update the legend
  updateLegend(canvasContainer, legend);
}

async function init(): Promise<void> {
  // Build the initial layout and get references to UI elements
  const { canvas, canvasContainer, sideMenu, searchInput, typeSelect, verSelect } = buildLayout();

  const appElements = { canvas, canvasContainer, sideMenu, searchInput };

  // Handler to call when a selection changes
  const handleDataChange = async () => {
    const selectedType = typeSelect.value as ClusterTypeValue;
    const selectedVer = parseInt(verSelect.value, 10);
    await loadChart(appElements, selectedType, selectedVer);
  };

  // Attach event listeners to dropdowns
  typeSelect.addEventListener('change', handleDataChange);
  verSelect.addEventListener('change', handleDataChange);

  // Initial data load
  await handleDataChange();
}

document.addEventListener('DOMContentLoaded', init);