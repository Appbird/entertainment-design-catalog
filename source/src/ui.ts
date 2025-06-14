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

  const reservedLink = document.createElement('a');
  reservedLink.id = 'reserved-link'
  reservedLink.href = './index.html';
  reservedLink.textContent = 'Entertainment Design Catalog (Reserved by 関西学院大学)';
  reservedLink.target = '_blank';
  reservedLink.addEventListener('mouseover', () => {
    reservedLink.style.opacity = '1';
  });
  reservedLink.addEventListener('mouseout', () => {
    reservedLink.style.opacity = '0.4';
  });
  const legendContainer = document.createElement('div');
  legendContainer.id = 'legend-container';

  // canvasコンテナにリンクを追加
  canvasContainer.appendChild(reservedLink);
  canvasContainer.appendChild(legendContainer)

  const sideMenu = document.createElement('div');
  sideMenu.id = 'side-menu';

  // --- UI Controls ---
  const controlsContainer = document.createElement('div');
  controlsContainer.id = 'controls-container';
  controlsContainer.style.paddingBottom = '16px';
  controlsContainer.style.borderBottom = '1px solid #ccc';

  // 分類基準のドロップダウンボックス
  const typeLabel = document.createElement('label');
  typeLabel.textContent = '分類基準: ';
  typeLabel.style.display = 'block';
  const typeSelect = document.createElement('select');
  const type2displayname: Record<ClusterTypeValue, string> = {
	"abstract": "論文要約",
	"title": "Archetypeのタイトルのみ",
	"full": "Archetypeの全体"
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
  const verLabel = document.createElement('label');
  verLabel.textContent = 'クラスター数: ';
  verLabel.style.display = 'block';
  verLabel.style.marginTop = '8px';
  const verSelect = document.createElement('select');
  ['32', '64'].forEach(value => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    verSelect.appendChild(option);
  });
  verLabel.appendChild(verSelect);
  controlsContainer.appendChild(verLabel);

  // --- Search Box ---
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.id = 'search-box';
  searchInput.placeholder = 'タイトルや要旨で検索 (AND検索)';
  searchInput.style.width = '100%';
  searchInput.style.padding = '8px';
  searchInput.style.boxSizing = 'border-box';
  searchInput.style.marginTop = '16px';

  // --- Details ---
  const detailsContainer = document.createElement('div');
  detailsContainer.id = 'details-container';

  sideMenu.appendChild(controlsContainer);
  sideMenu.appendChild(searchInput);
  sideMenu.appendChild(detailsContainer);

  app.appendChild(canvasContainer);
  app.appendChild(sideMenu);
  return { canvas, canvasContainer, sideMenu, searchInput, typeSelect, verSelect };
}

export function updateLegend<L>(canvas: HTMLDivElement, legend: LegendBundle<DataPoint,L>): void {
  const legendContainer = canvas.querySelector<HTMLDivElement>('#legend-container');
  if (!legendContainer) return;

  legendContainer.innerHTML = ''; // 以前の凡例をクリア

  // --- スタイルをここに適用 ---
  legendContainer.style.backgroundColor = '#1a1a1a'; // 少し柔らかい黒
  legendContainer.style.color = 'white';
  //legendContainer.style.padding = '10px 15px';
  legendContainer.style.borderRadius = '1%';
  //legendContainer.style.marginTop = '16px';
  legendContainer.style.maxHeight = '50vh'; // 最大の高さをビューポートの50%に
  legendContainer.style.overflowY = 'auto'; // コンテンツがはみ出たらスクロール
  legendContainer.style.boxSizing = 'border-box';


  // --- トグル機能を持つタイトルを作成 ---
  const legendTitle = document.createElement('h4');
  legendTitle.style.margin = '0 0 8px 0'; // マージン調整
  legendTitle.style.cursor = 'pointer'; // クリック可能であることを示すカーソル
  legendTitle.style.userSelect = 'none'; // テキスト選択を無効化
  legendTitle.style.position = 'sticky'; // スクロール時にタイトルを固定
  legendTitle.style.top = '0';
  legendTitle.style.backgroundColor = '#1a1a1a'; // 背景色を同じにして文字が透けないようにする
  legendTitle.style.padding = '0.1em 0.1em'; // 上下の余白

  const indicator = document.createElement('span');
  indicator.textContent = '▼ '; // 初期状態は開いている
  legendTitle.appendChild(indicator);

  const titleText = document.createTextNode(`凡例 (${legend.name})`);
  legendTitle.appendChild(titleText);

  // --- 凡例の項目をラップするコンテナ ---
  const itemsWrapper = document.createElement('div');
  itemsWrapper.style.display = 'block'; // 初期状態は表示

  legend.getAllLabels().forEach(label => {
    const item = document.createElement('div');
    item.style.display = 'flex';
    item.style.alignItems = 'center';
    item.style.marginBottom = '0.1em';

    const colorSwatch = document.createElement('span');
    colorSwatch.style.display = 'inline-block';
    colorSwatch.style.width = '12px';
    colorSwatch.style.height = '12px';
    colorSwatch.style.marginRight = '8px';
    colorSwatch.style.borderRadius = '3px';
    colorSwatch.style.backgroundColor = legend.getLabelColor(label);
    colorSwatch.style.border = '1px solid #555'; // 暗い背景でも見やすいように枠線を追加

    const labelText = document.createElement('span');
    labelText.textContent = String(label);

    item.appendChild(colorSwatch);
    item.appendChild(labelText);
    itemsWrapper.appendChild(item); // 項目をラッパーに追加
  });

  const separator = document.createElement('hr');
  separator.style.borderColor = '#444'; // 区切り線の色を調整
  itemsWrapper.appendChild(separator); // 区切り線もラッパーに追加

  // --- DOMに要素を追加 ---
  legendContainer.appendChild(legendTitle);
  legendContainer.appendChild(itemsWrapper);

  // --- クリックイベントの追加 ---
  legendTitle.addEventListener('click', () => {
    const isHidden = itemsWrapper.style.display === 'none';
    itemsWrapper.style.display = isHidden ? 'block' : 'none';
	// たたむと右に寄っちゃうのを修正
	legendTitle.style.paddingRight = isHidden ? '0em' : '10.625em';
    indicator.textContent = isHidden ? '▼ ' : '▶ ';
  });
}

function upperFirstLetter(str: string): string {
  if (str.length === 0) {
    return "";
  }

  return str.charAt(0).toUpperCase() + str.slice(1);
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
  // ... (rest of the function is the same, but appends to detailsContainer)
  edcTitleEl.textContent = clicked.edc_title;
  edcTitleEl.style.fontWeight = 'bold';
  detailsContainer.appendChild(edcTitleEl);

  const fromEl = document.createElement('p');
  // ... and so on for the rest of the elements
  const fromText = document.createTextNode('from ');
  const linkEl = document.createElement('a');
  linkEl.href = `https://ipsj.ixsq.nii.ac.jp/records/${clicked.paper_id}`;
  linkEl.target = '_blank';
  linkEl.textContent = clicked.paper_title;
  fromEl.appendChild(fromText);
  fromEl.appendChild(linkEl);
  detailsContainer.appendChild(fromEl);

  if (clicked.edc_type !== ''){
    const effectEl = document.createElement('p');
    effectEl.innerHTML = `<strong>${upperFirstLetter(clicked.edc_type)}</strong><br> ${clicked.edc_effect}`;
    detailsContainer.appendChild(effectEl);
    const contextEl = document.createElement('p');
    contextEl.innerHTML = `Context<br> ${clicked.edc_context}`;
    detailsContainer.appendChild(contextEl);
  }

  const separator = document.createElement('hr');
  detailsContainer.appendChild(separator);

  const neighborsTitle = document.createElement('h3');
  neighborsTitle.textContent = `近傍の論文 (Neighbors)`;
  neighborsTitle.style.marginTop = '20px';
  detailsContainer.appendChild(neighborsTitle);

  neighbors.forEach((neighbor, i) => {
    const neighborEl = document.createElement('div');
    neighborEl.style.border = '1px solid #eee';
    neighborEl.style.padding = '10px';
    neighborEl.style.marginBottom = '10px';
    neighborEl.style.borderRadius = '4px';
    const pEl = document.createElement('p');
    pEl.style.margin = '0';
    var innerText = "";
    if (neighbor.point.edc_title == ''){
      innerText = `<strong>${neighbor.point.paper_title}</strong>`
    }else{
      innerText = `<strong>${neighbor.point.edc_title}</strong> (from ${neighbor.point.paper_title})`
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