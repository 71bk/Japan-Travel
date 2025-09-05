// info.js
import { data } from "./data.js";

let infoEl, nameEl, spotsEl, festivalsEl, foodsEl, monthSelect;

// ---- 全域狀態 ----
let selectedMonth = new Date().getMonth() + 1; // 1~12：預設當月
let currentRegion = null;
let monthSelectBound = false; // 確保只綁一次 change 事件
const REGION_ICONS = {
  "北海道": "./image/icon/P_shiretoko.svg",
  "東北": "./image/icon/P_tohoku.svg",
  "關東": "./image/icon/P_kanto.svg",
  "中部": "./image/icon/P_chubu.svg",
  "近畿": "./image/icon/P_kinki.svg",
  "中國": "./image/icon/P_chugoku.svg",
  "四國": "./image/icon/P_shikoku.svg",
  "九州沖繩": "./image/icon/P_kyushu.svg"
};

// ---- 小工具：把資料正規化為 { 名稱, 說明 } ----
const normalizeItem = (it) =>
  typeof it === "string" ? { 名稱: it, 說明: "" } : (it || { 名稱: "", 說明: "" });

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
 * 依目前 region 配置月份下拉選單：
 * - 第一次初始化建立 1~12 月
 * - 將沒有資料的月份設為 disabled（用「字串鍵」檢查）
 * - 不自動 fallback，保留使用者選擇
 */
function setupMonthSelect(region) {
  const monthMap = (data[region] && data[region].慶典) || {};

  if (!monthSelect) return;

  // 第一次初始化下拉（建立 1~12 月）
  if (!monthSelect.dataset.initialised) {
    monthSelect.innerHTML = Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      return `<option value="${m}">${m}月</option>`;
    }).join("");
    monthSelect.dataset.initialised = "1";
  }

  // 依據當前 region，啟用/停用沒有資料的月份
Array.from(monthSelect.options).forEach((opt) => {
  const m = Number(opt.value);
  const key = String(m);
  const has = Array.isArray(monthMap[key]) && monthMap[key].length > 0;
  opt.disabled = false;              // ★ 不禁用
  opt.dataset.hasData = has ? "1" : "0"; // ★（可選）用來上樣式
});
  // 不再強制 fallback，保持使用者選擇
  monthSelect.value = String(selectedMonth);

  // 監聽只綁一次：使用者手動選月 → 更新 selectedMonth 並重渲染
  if (!monthSelectBound) {
    monthSelect.addEventListener("change", () => {
      selectedMonth = Number(monthSelect.value);
      renderFestivals(currentRegion); // 只更新慶典區
    });
    monthSelectBound = true;
  }
}

/**
 * 慶典渲染：尊重 selectedMonth，不在此改動使用者選擇
 * 支援字串/物件兩種格式（都會正規化）
 */
function renderFestivals(region) {
  if (!festivalsEl) return;
  const monthMap = (data[region] && data[region].慶典) || {};

  // 用「字串鍵」取出該月資料；無資料就顯示「本月無特別慶典」
  const raw = Array.isArray(monthMap[String(selectedMonth)]) ? monthMap[String(selectedMonth)] : [];
  const list = raw.map(normalizeItem);

  festivalsEl.innerHTML = `
    <div class="cards">
      ${
        list.length
          ? list.map(f => `
              <div class="media-card">
                <div class="media-text">
                  <h5>${f.名稱}</h5>
                  ${f.說明 ? `<p>${f.說明}</p>` : ""}
                </div>
              </div>
            `).join("")
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

  currentRegion = region;

  // 顯示面板與標題
  infoEl.style.display = "block";
  if (nameEl) {
  const icon = REGION_ICONS[region] 
    ? `<img src="${REGION_ICONS[region]}" alt="${region} icon" class="region-icon">` 
    : "";
  nameEl.innerHTML = ` ${icon}${region}`;
}

  // 1) 景點
  const spots = (data[region].景點 || []).map(normalizeItem);
  spotsEl.innerHTML = `
    <h4>景點 🗼</h4>
    <div class="cards">
      ${spots.map(spot => `
        <div class="media-card">
          <div class="media-text">
            <h5 class="intoduseName">${spot.名稱}</h5>
            ${spot.說明 ? `<p>${spot.說明}</p>` : ""}
          </div>
        </div>`).join("")}
    </div>
  `;

  // 2) 美食
  const foods = (data[region].美食 || []).map(normalizeItem);
  foodsEl.innerHTML = `
    <h4>美食 🍜</h4>
    <div class="cards">
      ${foods.map(food => `
        <div class="media-card">
          <div class="media-text">
            <h5 class="intoduseName">${food.名稱}</h5>
            ${food.說明 ? `<p>${food.說明}</p>` : ""}
          </div>
        </div>`).join("")}
    </div>
  `;

  // 3) 慶典（依月份）
  setupMonthSelect(region); // 配置月份下拉（含禁用/預設，不 fallback）
  renderFestivals(region);  // 渲染當前月份資料
}
