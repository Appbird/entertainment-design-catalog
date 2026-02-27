import type { ClusterTypeOption } from "../adapters/issue-config";
import type { PointCloudPoint } from "../models/view-model";

export function buildLayout(options: {
  typeOptions: ClusterTypeOption[];
  clusterOptions: number[];
}): {
  canvas: HTMLCanvasElement;
  canvasContainer: HTMLDivElement;
  sideMenu: HTMLDivElement;
  searchInput: HTMLInputElement;
  typeSelect: HTMLSelectElement;
  verSelect: HTMLSelectElement;
  helpButton: HTMLButtonElement;
  yearFilterContainer: HTMLDivElement;
} {
  const app = document.getElementById("app")!;
  const canvasContainer = document.createElement("div");
  canvasContainer.id = "canvas-container";
  const canvas = document.createElement("canvas");
  canvas.id = "plot-canvas";

  canvasContainer.appendChild(canvas);

  const proposedLink = document.createElement("a");
  proposedLink.id = "proposed-link";
  proposedLink.href = "/index.html";
  proposedLink.textContent = "EDC Browser for EC Symposium (Proposed by 関西学院大学)";
  proposedLink.target = "_blank";
  const legendContainer = document.createElement("div");
  legendContainer.id = "legend-container";

  canvasContainer.appendChild(proposedLink);
  canvasContainer.appendChild(legendContainer);

  const sideMenu = document.createElement("div");
  sideMenu.id = "side-menu";

  const helpButton = document.createElement("button");
  helpButton.id = "help-button";
  helpButton.textContent = "？";
  sideMenu.appendChild(helpButton);

  const controlsContainer = document.createElement("div");
  controlsContainer.id = "controls-container";

  const typeLabel = document.createElement("label");
  typeLabel.textContent = "分類基準: ";
  const typeSelect = document.createElement("select");
  options.typeOptions.forEach((entry) => {
    const option = document.createElement("option");
    option.value = entry.value;
    option.textContent = entry.label;
    typeSelect.appendChild(option);
  });
  typeLabel.appendChild(typeSelect);
  controlsContainer.appendChild(typeLabel);

  const clusterNLabel = document.createElement("label");
  clusterNLabel.textContent = "クラスター数: ";
  const clusterNSelect = document.createElement("select");
  options.clusterOptions.forEach((clusterN) => {
    const value = String(clusterN);
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    clusterNSelect.appendChild(option);
  });
  if (options.clusterOptions.length > 0) {
    clusterNLabel.appendChild(clusterNSelect);
    controlsContainer.appendChild(clusterNLabel);
  } else {
    clusterNSelect.style.display = "none";
  }

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.id = "search-box";
  searchInput.placeholder = "タイトルや要旨で検索 (AND検索)";

  const yearFilterContainer = document.createElement("div");
  yearFilterContainer.id = "year-filter-container";

  const detailsContainer = document.createElement("div");
  detailsContainer.id = "details-container";

  sideMenu.appendChild(controlsContainer);
  sideMenu.appendChild(searchInput);
  sideMenu.appendChild(yearFilterContainer);
  sideMenu.appendChild(detailsContainer);

  app.appendChild(canvasContainer);
  app.appendChild(sideMenu);
  return { canvas, canvasContainer, sideMenu, searchInput, typeSelect, verSelect: clusterNSelect, helpButton, yearFilterContainer };
}

export function setupYearFilter(
  container: HTMLDivElement,
  allDataPoints: PointCloudPoint[],
  onFilterChange: (selectedYears: Set<number>) => void
): void {
  container.innerHTML = "";

  const uniqueYears = [...new Set(allDataPoints.map((p) => new Date(p.paperPublishDate).getFullYear()))].sort((a, b) => b - a);
  const selectedYears = new Set(uniqueYears);

  const title = document.createElement("h4");
  title.className = "filter-toggle";
  title.textContent = "▼ 年度で絞り込み";
  container.appendChild(title);

  const listContainer = document.createElement("div");
  listContainer.className = "filter-list-container";
  container.appendChild(listContainer);
  const checkboxes: HTMLInputElement[] = [];

  const actionContainer = document.createElement("div");
  actionContainer.style.display = "flex";
  actionContainer.style.gap = "0.5em";
  actionContainer.style.marginBottom = "0.75em";
  container.appendChild(actionContainer);

  const selectAllButton = document.createElement("button");
  selectAllButton.type = "button";
  selectAllButton.textContent = "全て選択";
  actionContainer.appendChild(selectAllButton);

  const clearAllButton = document.createElement("button");
  clearAllButton.type = "button";
  clearAllButton.textContent = "すべて解除";
  actionContainer.appendChild(clearAllButton);

  uniqueYears.forEach((year) => {
    const item = document.createElement("div");
    item.className = "filter-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `year-${year}`;
    checkbox.value = String(year);
    checkbox.checked = true;
    checkboxes.push(checkbox);

    const label = document.createElement("label");
    label.htmlFor = `year-${year}`;
    label.textContent = String(year);

    item.appendChild(checkbox);
    item.appendChild(label);
    listContainer.appendChild(item);

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        selectedYears.add(year);
      } else {
        selectedYears.delete(year);
      }
      onFilterChange(new Set(selectedYears));
    });
  });

  title.addEventListener("click", () => {
    const isHidden = listContainer.style.display === "none";
    listContainer.style.display = isHidden ? "grid" : "none";
    actionContainer.style.display = isHidden ? "flex" : "none";
    title.textContent = (isHidden ? "▼" : "▶") + " 年度で絞り込み";
  });

  selectAllButton.addEventListener("click", () => {
    selectedYears.clear();
    uniqueYears.forEach((year) => selectedYears.add(year));
    checkboxes.forEach((checkbox) => {
      checkbox.checked = true;
    });
    onFilterChange(new Set(selectedYears));
  });

  clearAllButton.addEventListener("click", () => {
    selectedYears.clear();
    checkboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });
    onFilterChange(new Set(selectedYears));
  });

  listContainer.style.display = "none";
  actionContainer.style.display = "none";
  title.textContent = "▶ 年度で絞り込み";

  onFilterChange(selectedYears);
}
