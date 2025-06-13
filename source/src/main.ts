import './style.css';
import { fetchBundleJson, fetchClusterJson, fetchDataPoints } from './data.ts';
import { createScatterChart } from './chart.ts';
import {
  buildLayout,
  map_color,
  setupClickHandler,
  setupSearchHandler,
  updateLegend,
} from './ui.ts';
import type { Chart } from 'chart.js';
import type {ClusterTypeValue} from './validator.ts'

let chartInstance: Chart | null = null;

async function loadChart(
  appElements: {
    canvas: HTMLCanvasElement;
    sideMenu: HTMLDivElement;
    searchInput: HTMLInputElement;
  },
  type: ClusterTypeValue,
  ver: number
) {
  if (chartInstance) {
    chartInstance.destroy();
  }

  const { canvas, sideMenu, searchInput } = appElements;

  // Show a loading message
  const detailsContainer = sideMenu.querySelector<HTMLDivElement>('#details-container');
  if (detailsContainer) detailsContainer.innerHTML = '<p>データをロード中...</p>';

  // Fetch all necessary data
  const papers = await fetchBundleJson();
  const dataPoints = await fetchDataPoints(type);
  const clusterBoxes = await fetchClusterJson(type, ver);
  const mapped_colors = dataPoints.map(map_color);

  // Clear loading message
  if (detailsContainer) detailsContainer.innerHTML = '';

  // Create a new chart
  chartInstance = createScatterChart(canvas.getContext('2d')!, dataPoints, mapped_colors, clusterBoxes);

  // (Re)setup handlers
  setupClickHandler(canvas, chartInstance, dataPoints, papers, sideMenu);
  setupSearchHandler(searchInput, chartInstance, dataPoints);

  // Update the legend
  updateLegend(sideMenu, dataPoints);
}

async function init(): Promise<void> {
  // Build the initial layout and get references to UI elements
  const { canvas, sideMenu, searchInput, typeSelect, verSelect } = buildLayout();

  const appElements = { canvas, sideMenu, searchInput };

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