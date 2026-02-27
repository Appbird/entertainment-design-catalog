import type { DetailViewModel } from "../models/view-model";

export function updateSideMenu(
  sideMenu: HTMLDivElement,
  clicked: DetailViewModel,
  neighbors: Array<{ detail: DetailViewModel; dist: number; idx: number }>
): void {
  const detailsContainer = sideMenu.querySelector<HTMLDivElement>("#details-container");
  if (!detailsContainer) return;
  detailsContainer.innerHTML = "";

  const edcTitleEl = document.createElement("h2");
  edcTitleEl.textContent = clicked.title;
  edcTitleEl.style.fontWeight = "bold";
  detailsContainer.appendChild(edcTitleEl);

  const fromEl = document.createElement("p");
  const edcTypeText = document.createElement("span");
  edcTypeText.textContent = clicked.typeLabel;
  edcTypeText.className = "u-bold";
  fromEl.appendChild(edcTypeText);
  const fromText = document.createTextNode(" from ");
  const linkEl = document.createElement("a");
  linkEl.href = clicked.paperUrl;
  linkEl.target = "_blank";
  linkEl.textContent = clicked.paperTitle;
  fromEl.appendChild(fromText);
  fromEl.appendChild(linkEl);
  detailsContainer.appendChild(fromEl);

  if (clicked.summaryRows.length > 0) {
    const summarySection = document.createElement("section");
    summarySection.innerHTML = `<h3 class="edc-header">要点</h3>`;
    const summaryList = document.createElement("ul");
    clicked.summaryRows.forEach((row) => {
      const li = document.createElement("li");
      li.innerHTML = `<span class="u-bold">${row.label}:</span> ${row.value}`;
      summaryList.appendChild(li);
    });
    summarySection.appendChild(summaryList);
    detailsContainer.appendChild(summarySection);
  }

  if (clicked.contextItems.length > 0) {
    const contextEl = document.createElement("section");
    contextEl.innerHTML = `<h3 class="edc-header">文脈</h3>`;
    const contextList = document.createElement("ul");
    clicked.contextItems.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      contextList.appendChild(li);
    });
    contextEl.appendChild(contextList);
    detailsContainer.appendChild(contextEl);
  }

  if (clicked.paperAbstract) {
    const abstractEl = document.createElement("section");
    abstractEl.innerHTML = `<h3 class="edc-header">Abstract</h3> <p>${clicked.paperAbstract}</p>`;
    detailsContainer.appendChild(abstractEl);
  }

  if (clicked.approachText) {
    const effectEl = document.createElement("section");
    effectEl.innerHTML = `<h3 class="edc-header">アプローチ</h3> <p>${clicked.approachText}</p>`;
    detailsContainer.appendChild(effectEl);
  }

  const separator = document.createElement("hr");
  detailsContainer.appendChild(separator);

  const neighborsTitle = document.createElement("h3");
  neighborsTitle.textContent = "関連するArchetype";
  detailsContainer.appendChild(neighborsTitle);

  neighbors.forEach((neighbor, i) => {
    const neighborEl = document.createElement("div");
    neighborEl.classList.add("c-neighbor-item");
    const pEl = document.createElement("p");
    let innerText = "";
    if (neighbor.detail.title == neighbor.detail.paperTitle) {
      innerText = `<span class="u-strong">${neighbor.detail.paperTitle}</span>`;
    } else {
      innerText = `<span class="u-strong">${neighbor.detail.title}</span><br>from <a href="${neighbor.detail.paperUrl}" target="_blank">${neighbor.detail.paperTitle}</a>`;
    }

    pEl.innerHTML = `${i + 1}: ` + innerText;
    neighborEl.appendChild(pEl);
    detailsContainer.appendChild(neighborEl);
  });
}
