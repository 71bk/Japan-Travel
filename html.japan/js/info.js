// info.js
import { data } from "./data.js";

let infoEl, nameEl, spotsEl, festivalsEl, foodsEl, monthSelect;
let selectedMonth = new Date().getMonth() + 1;

document.addEventListener("DOMContentLoaded", () => {
  infoEl = document.getElementById("info-container");
  nameEl = document.getElementById("region-name");
  spotsEl = document.getElementById("spots");
  foodsEl = document.getElementById("foods");
  festivalsEl = document.getElementById("festivals");
  monthSelect = document.getElementById("month-select");
});

export function updateFestival(region) {
  if (!festivalsEl) return;
  const list = data[region]?.慶典?.[selectedMonth];
  festivalsEl.innerText = list ? list.join("、") : "本月無特別慶典";
}

export function showRegionInfo(region) {
  if (!region || !data[region] || !infoEl) return;

  infoEl.style.display = "block";
  nameEl.innerText = region;
  spotsEl.innerHTML = `
  <h4>景點 🗼</h4>
    <div class="cards">
      ${data[region].景點.map(spot => `
        <div class="media-card">
          <div class="media-text">
            <h5>${spot}</h5>
          </div>
        </div>
      `).join("")}
    </div>
`;

foodsEl.innerHTML = `
    <h4>美食 🍜</h4>
    <div class="cards">
      ${data[region].美食.map(food => `
        <div class="media-card">
          <div class="media-text">
            <h5>${food}</h5>
            <p>${food} 的特色或說明</p>
          </div>
        </div>
      `).join("")}
    </div>
`;
  updateFestival(region);

  if (monthSelect) {
    monthSelect.value = selectedMonth;
    monthSelect.onchange = () => {
      selectedMonth = parseInt(monthSelect.value, 10);
      updateFestival(region);
    };
  }
}
