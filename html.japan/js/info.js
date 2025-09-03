// info.js
import { data } from "./data.js";

let infoEl, nameEl, spotsEl, festivalsEl, foodsEl, monthSelect;
// 預設為目前月份（1~12）
let selectedMonth = new Date().getMonth() + 1;

// 取得 DOM 參照
document.addEventListener("DOMContentLoaded", () => {
  infoEl = document.getElementById("info-container");
  nameEl = document.getElementById("region-name");
  spotsEl = document.getElementById("spots");
  foodsEl = document.getElementById("foods");
  festivalsEl = document.getElementById("festivals");
  monthSelect = document.getElementById("month-select");
});

/**
 * 依 selectedMonth 渲染慶典卡片
 */
function renderFestivals(region) {
  if (!festivalsEl) return;

  const list = data[region]?.慶典?.[selectedMonth] || [];
  festivalsEl.innerHTML = `
    <h4>慶典 🎉</h4>
    <div class="cards">
      ${list.length > 0
      ? list
        .map(
          (f) => `
          <div class="media-card">
            <div class="media-text">
              <h5>${f}</h5>
            </div>
          </div>`
        )
        .join("")
      : `<p>本月無特別慶典</p>`
    }
    </div>
  `;
}

/**
 * 主要渲染：固定順序「景點 → 美食 → 慶典」
 */
export function showRegionInfo(region) {
  if (!region || !data[region]) return;
  if (!infoEl || !spotsEl || !foodsEl || !festivalsEl) return;

  // 顯示面板與標題
  infoEl.style.display = "block";
  nameEl && (nameEl.innerText = region);

  // 1) 景點
  const spots = data[region].景點 || [];
  spotsEl.innerHTML = `
    <h4>景點 🗼</h4>
    <div class="cards">
      ${spots
      .map(
        (spot) => `
        <div class="media-card">
          <div class="media-text">
            <h5>${spot}</h5>
          </div>
        </div>`
      )
      .join("")}
    </div>
  `;

  // 2) 美食
  const foods = data[region].美食 || [];
  foodsEl.innerHTML = `
    <h4>美食 🍜</h4>
    <div class="cards">
      ${foods
      .map(
        (food) => `
        <div class="media-card">
          <div class="media-text">
            <h5>${food}</h5>
            <p>${food} 的特色或說明</p>
          </div>
        </div>`
      )
      .join("")}
    </div>
  `;

  // 3) 慶典（依月份）
  renderFestivals(region);

  // 月份選擇器（切換時重渲染慶典區）
  if (monthSelect) {
    // 若 HTML 預設有 selected，仍以目前 selectedMonth 為準
    monthSelect.value = String(selectedMonth);
    monthSelect.onchange = () => {
      const v = parseInt(monthSelect.value, 10);
      if (!Number.isNaN(v) && v >= 1 && v <= 12) {
        selectedMonth = v;
      }
      // 只需更新慶典區塊即可（景點、美食不受月份影響）
      renderFestivals(region);
    };
  }
}
