import type { Chart } from 'chart.js';
import {
	type ClusterTypeValue,
  type DataPoint,
  type Paper, 
  ClusterType
}from './validator';
import { getKNearest } from './data';
import type { LegendBundle } from './legend';
import { querySearchChart } from './chart';
/*
export function map_color(point:DataPoint): string {
	const pos = new Date(point.paper_publish_date).getFullYear();
	const color_list = [
		'rgba(0, 122, 204, 0.8)', 'rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)',
		'rgba(255, 206, 86, 0.8)', 'rgba(75, 192, 192, 0.8)', 'rgba(153, 102, 255, 0.8)',
		'rgba(255, 159, 64, 0.8)', 'rgba(201, 203, 207, 0.8)',
	]
	return color_list[pos % color_list.length];
}

export function map_color_based_on_abstract(point:DataPoint, paper2cluster:Map<string, string>): string {
	// #NOTE paper2clusterはfetchMappingAbstractCluster()によって得られる。（重めの関数なので一回だけ呼び出したい。）
	// #TODO cluster名 から colorへどう対応させるか？（paper2clusterは、point.paper_titleを「その論文が属している要約上のクラスタ」名に対応づける写像）
	// #TODO colorへ写像した後は、それに基づいてグラフの点群可視化 + 凡例作る
	const cluster_name = paper2cluster.get(point.paper_title)
	if (cluster_name == undefined) { throw Error("cluster_name == undefined"); }
	
	const color_list = [
		'rgba(0, 122, 204, 0.8)', 'rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)',
		'rgba(255, 206, 86, 0.8)', 'rgba(75, 192, 192, 0.8)', 'rgba(153, 102, 255, 0.8)',
		'rgba(255, 159, 64, 0.8)', 'rgba(201, 203, 207, 0.8)',
	]
}
*/
export function buildLayout(): {
  canvas: HTMLCanvasElement;
  canvasContainer: HTMLDivElement;
  sideMenu: HTMLDivElement;
  searchInput: HTMLInputElement;
  typeSelect: HTMLSelectElement;
  verSelect: HTMLSelectElement;
} {
  const app = document.getElementById('app')!;
  const canvasContainer = document.createElement('div');
  canvasContainer.id = 'canvas-container';
  const canvas = document.createElement('canvas');
  canvas.id = 'plot-canvas';
  
  canvasContainer.appendChild(canvas);

  const proposedLink = document.createElement('a');
  proposedLink.id = 'proposed-link'
  proposedLink.href = './explain.html';
  proposedLink.textContent = 'Entertainment Design Catalog (Proposed by 関西学院大学)';
  proposedLink.target = '_blank';
  const legendContainer = document.createElement('div');
  legendContainer.id = 'legend-container';

  // canvasコンテナにリンクを追加
  canvasContainer.appendChild(proposedLink);
  canvasContainer.appendChild(legendContainer)

  const sideMenu = document.createElement('div');
  sideMenu.id = 'side-menu';

  // --- UI Controls ---
  const controlsContainer = document.createElement('div');
  controlsContainer.id = 'controls-container';
  

  // 分類基準のドロップダウンボックス
  const typeLabel = document.createElement('label');
  typeLabel.textContent = '分類基準: ';
  const typeSelect = document.createElement('select');
  const type2displayname: Record<ClusterTypeValue, string> = {
	"abstract": "要約",
	"title": "EDC",
	"full": "EDC+アプローチ"
  }
  Object.values(ClusterType).forEach(value => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = type2displayname[value];
    typeSelect.appendChild(option);
  });
  typeLabel.appendChild(typeSelect);
  controlsContainer.appendChild(typeLabel);

  // クラスター数のドロップダウンボックス
  const clusterNLabel = document.createElement('label');
  clusterNLabel.textContent = 'クラスター数: ';
  const clusterNSelect = document.createElement('select');
  ['32', '64'].forEach(value => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    clusterNSelect.appendChild(option);
  });
  clusterNLabel.appendChild(clusterNSelect);
  controlsContainer.appendChild(clusterNLabel);

  // --- Search Box ---
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.id = 'search-box';
  searchInput.placeholder = 'タイトルや要旨で検索 (AND検索)';

  // --- Details ---
  const detailsContainer = document.createElement('div');
  detailsContainer.id = 'details-container';

  sideMenu.appendChild(controlsContainer);
  sideMenu.appendChild(searchInput);
  sideMenu.appendChild(detailsContainer);

  app.appendChild(canvasContainer);
  app.appendChild(sideMenu);
  return { canvas, canvasContainer, sideMenu, searchInput, typeSelect, verSelect: clusterNSelect };
}

export function updateLegend<L>(canvas: HTMLDivElement, legend: LegendBundle<DataPoint,L>): void {
  const legendContainer = canvas.querySelector<HTMLDivElement>('#legend-container');
  if (!legendContainer) return;

  legendContainer.innerHTML = ''; // 以前の凡例をクリア

  // --- トグル機能を持つタイトルを作成 ---
  const legendTitle = document.createElement('h4');
  legendTitle.classList.add("legend-toggle");
  const indicator = document.createElement('span');
  indicator.textContent = '▼ '; // 初期状態は開いている
  legendTitle.appendChild(indicator);

  const titleText = document.createTextNode(`凡例 (${legend.name})`);
  legendTitle.appendChild(titleText);

  // --- 凡例の項目をラップするコンテナ ---
  const itemsWrapper = document.createElement('div');
  itemsWrapper.id = 'legend-items-wrapper'; // 初期状態は表示

  legend.getAllLabels().forEach(label => {
    const item = document.createElement('div');

    const colorSwatch = document.createElement('span');
	colorSwatch.classList.add("color-swatch");
	colorSwatch.style.backgroundColor = legend.getLabelColor(label);

    const labelText = document.createElement('span');
    labelText.textContent = String(label);

    item.appendChild(colorSwatch);
    item.appendChild(labelText);
    itemsWrapper.appendChild(item); // 項目をラッパーに追加
  });

  const separator = document.createElement('hr');
  
  itemsWrapper.appendChild(separator); // 区切り線もラッパーに追加

  // --- DOMに要素を追加 ---
  legendContainer.appendChild(legendTitle);
  legendContainer.appendChild(itemsWrapper);

  // --- クリックイベントの追加 ---
  legendTitle.addEventListener('click', () => {
    const isHidden = itemsWrapper.style.display === 'none';
    itemsWrapper.style.display = isHidden ? 'block' : 'none';
	// たたむと右に寄っちゃうのを修正
	legendTitle.style.paddingRight = isHidden ? '0em' : '5.375em';
    indicator.textContent = isHidden ? '▼ ' : '▶ ';
  });
}
/*
function upperFirstLetter(str: string): string {
  if (str.length === 0) {
    return "";
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}
*/
function toIPSJ_URL(paper_id:string) {
	return `https://ipsj.ixsq.nii.ac.jp/records/${paper_id}`;
}

/** Update side menu with paper info and neighbors */
export function updateSideMenu(
  sideMenu: HTMLDivElement,
  clicked: DataPoint,
  neighbors: Array<{ point: DataPoint; dist: number; idx: number; paper: Paper }>
): void {
  const detailsContainer = sideMenu.querySelector<HTMLDivElement>('#details-container');
  if (!detailsContainer) return;
  detailsContainer.innerHTML = ''; // Clear only the details section


  const edcTitleEl = document.createElement('h2');
  edcTitleEl.textContent = clicked.edc_title;
  edcTitleEl.style.fontWeight = 'bold';
  detailsContainer.appendChild(edcTitleEl);

  // URL掲示部
  const fromEl = document.createElement('p');
  const edc_type_translator:Record<string, string> = {
	"perception": "知覚", "cognition": "認知", "emotion": "情動", "motivation": "動機付け"
  }
  const edc_type_text = document.createElement('span');
  edc_type_text.textContent = (clicked.edc_type !== "") ? edc_type_translator[clicked.edc_type] : "paper";
  edc_type_text.className = 'u-bold';
  fromEl.appendChild(edc_type_text);
  const fromText = document.createTextNode(" from ");
  const linkEl = document.createElement('a');
  linkEl.href = toIPSJ_URL(clicked.paper_id);
  linkEl.target = '_blank';
  linkEl.textContent = clicked.paper_title;
  fromEl.appendChild(fromText);
  fromEl.appendChild(linkEl);
  detailsContainer.appendChild(fromEl);

  if (clicked.edc_type !== ''){
	const contextEl = document.createElement('section');
	contextEl.innerHTML = `<h3 class="edc-header">文脈</h3> <p>${clicked.edc_context}</p>`;
	detailsContainer.appendChild(contextEl);
    const effectEl = document.createElement('section');
    effectEl.innerHTML = `<h3 class="edc-header">アプローチ</h3> <p>${clicked.edc_effect}</p>`;
    detailsContainer.appendChild(effectEl);
  }

  const separator = document.createElement('hr');
  detailsContainer.appendChild(separator);

  const neighborsTitle = document.createElement('h3');
  neighborsTitle.textContent = `関連するArchetype`;
  detailsContainer.appendChild(neighborsTitle);

  neighbors.forEach((neighbor, i) => {
    const neighborEl = document.createElement('div');
	neighborEl.classList.add("c-neighbor-item");
    const pEl = document.createElement('p');
    var innerText = "";
    if (neighbor.point.edc_title == ''){
      innerText = `<span class="u-strong">${neighbor.point.paper_title}</span>`
    }else{
      innerText = `<span class="u-strong">${neighbor.point.edc_title}</span><br>from <a href="${toIPSJ_URL(neighbor.point.paper_id)}" target="_blank">${neighbor.point.paper_title}</a>`
    }
	
    pEl.innerHTML = `${i + 1}: `+innerText;
    neighborEl.appendChild(pEl);
    detailsContainer.appendChild(neighborEl);
  });
}

/** Setup click handler to show paper and neighbor info */
export function setupClickHandler(
  canvas: HTMLCanvasElement,
  chart: Chart,
  allDataPoints: DataPoint[],
  allPapers: Paper[],
  sideMenu: HTMLDivElement
): void {
  canvas.addEventListener('click', evt => {
    const active = chart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, false);
    if (!active.length) return;

    // Get paper_id from the clicked point's data
    const clickedChartPoint = chart.data.datasets[0].data[active[0].index] as any;
    const clickedPaperId = clickedChartPoint.paper_id;
    const clickedEDCTitle = clickedChartPoint.edc_title;

    // Find the full data point from the original complete list
    const clicked = allDataPoints.find(p => (p.paper_id === clickedPaperId) && (p.edc_title === '' || (p.edc_title == clickedEDCTitle)));
    if (!clicked) return;

    const knn = getKNearest(allDataPoints, clicked, 5);
    const neighbors = knn.map(k => ({ ...k, paper: allPapers.find(p => p.file_stem === k.point.filestem)! }));

    updateSideMenu(sideMenu, clicked, neighbors);
  });
}

/** Setup search handler to filter data points */
export function setupSearchHandler<L>(
  searchInput: HTMLInputElement,
  chart: Chart,
  allDataPoints: DataPoint[],
  legend: LegendBundle<DataPoint,L>
): void {
  searchInput.addEventListener('input', (event) => {
    const target = event.target as HTMLInputElement;
    searchChart(target, chart, allDataPoints, legend);
  })
}

export function searchChart<L>(
  searchInput: HTMLInputElement,
  chart: Chart,
  allDataPoints: DataPoint[],
  legend: LegendBundle<DataPoint,L>
): void {
  const query = searchInput.value.toLowerCase().trim();
  querySearchChart(
    chart, allDataPoints, legend, query
  )
}