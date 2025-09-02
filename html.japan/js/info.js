// info.js
import { data } from "./data.js";

let infoEl, nameEl, spotsEl, festivalsEl, monthSelect;
let selectedMonth = new Date().getMonth() + 1;

document.addEventListener("DOMContentLoaded", () => {
  infoEl = document.getElementById("info-container");
  nameEl = document.getElementById("region-name");
  spotsEl = document.getElementById("spots");
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
  <strong>景點：</strong>
  <span class="spot-text">${data[region].景點.join("、")}</span><br/>
  <strong>美食：</strong>
  <span class="spot-text">${data[region].美食.join("、")}</span>
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
