import type { LegendBundle } from "../legend/legend-bundle";
import type { PointCloudPoint } from "../models/view-model";

export function updateLegend<L>(canvas: HTMLDivElement, legend: LegendBundle<PointCloudPoint, L>): void {
  const legendContainer = canvas.querySelector<HTMLDivElement>("#legend-container");
  if (!legendContainer) return;

  legendContainer.innerHTML = "";

  const legendTitle = document.createElement("h4");
  legendTitle.classList.add("legend-toggle");
  const indicator = document.createElement("span");
  indicator.textContent = "▼ ";
  legendTitle.appendChild(indicator);

  const titleText = document.createTextNode(`凡例 (${legend.name})`);
  legendTitle.appendChild(titleText);

  const itemsWrapper = document.createElement("div");
  itemsWrapper.id = "legend-items-wrapper";

  legend.getAllLabels().forEach((label) => {
    const item = document.createElement("div");

    const colorSwatch = document.createElement("span");
    colorSwatch.classList.add("color-swatch");
    colorSwatch.style.backgroundColor = legend.getLabelColor(label);

    const labelText = document.createElement("span");
    labelText.textContent = String(label);

    item.appendChild(colorSwatch);
    item.appendChild(labelText);
    itemsWrapper.appendChild(item);
  });

  const separator = document.createElement("hr");
  itemsWrapper.appendChild(separator);

  legendContainer.appendChild(legendTitle);
  legendContainer.appendChild(itemsWrapper);

  legendTitle.addEventListener("click", () => {
    const isHidden = itemsWrapper.style.display === "none";
    itemsWrapper.style.display = isHidden ? "block" : "none";
    legendTitle.style.paddingRight = isHidden ? "0em" : "5.375em";
    indicator.textContent = isHidden ? "▼ " : "▶ ";
  });
}
