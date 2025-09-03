// ./js/detailView.js
import { showRegionInfo } from "./info.js";
import { loadSlideshowForCategory } from "./slideshow.js";

// 三個分類（預設：景點）
const CATEGORIES = ["景點", "美食", "慶典"];
const CATEGORY_ICONS = { "景點": "📍", "美食": "🍜", "慶典": "🎎" };

let current = { region: null, category: "景點" };

/**（可選）區域 x 類別 → 圖片清單
 * 若沒有對應的類別圖片，會自動退回用區域的預設輪播（slideshow.js 既有）。
 * 路徑請依你的專案調整或之後慢慢補。
 */
const regionCategoryPhotos = {
  "北海道": {
    "景點": [
      "./image/pic/北海道/札幌時計台.jpg",
      "./image/pic/北海道/小樽運河.jpg",
      "./image/pic/北海道/富良野花田.jpg"
    ],
    "美食": [],
    "慶典": []
  }
  // 其他區域可依需要再補
};

function ensureCategoryRail() {
  const info = document.getElementById("info-container");
  if (!info) return;
  if (document.getElementById("category-rail")) return;

  const rail = document.createElement("aside");
  rail.id = "category-rail";
  rail.className = "category-rail";

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "rail-toggle";
  toggle.setAttribute("aria-expanded", "true");
  toggle.setAttribute("aria-controls", "category-rail-list");
  toggle.textContent = "☰";

  const list = document.createElement("div");
  list.id = "category-rail-list";
  list.className = "rail-list";
  list.innerHTML = CATEGORIES.map(c => `
    <button class="tab${c === current.category ? " active" : ""}" data-cat="${c}">
      <span class="icon" aria-hidden="true">${CATEGORY_ICONS[c] || "•"}</span>
      <span class="label">${c}</span>
    </button>
  `).join("");

  // 事件：切換分類
  list.addEventListener("click", (e) => {
    const btn = e.target.closest(".tab");
    if (!btn) return;
    setCategory(btn.dataset.cat);
  });

  // 事件：展開/收合（往下）
  toggle.addEventListener("click", () => {
    const collapsing = !rail.classList.contains("collapsed");
    if (collapsing) {
      // 收合
      rail.classList.add("collapsed");
      list.style.maxHeight = "0px";
      localStorage.setItem("categoryRailCollapsed", "1");
      toggle.setAttribute("aria-expanded", "false");
    } else {
      // 展開
      rail.classList.remove("collapsed");
      // 先清空 maxHeight 以便量自然高度
      list.style.maxHeight = "";
      const h = list.scrollHeight;
      list.style.maxHeight = h + "px";
      localStorage.setItem("categoryRailCollapsed", "0");
      toggle.setAttribute("aria-expanded", "true");
    }
  });

  // 插入到 .section 內，放在 .region-layout 前
  const regionLayout = info.querySelector(".region-layout");
  info.querySelector(".section")?.insertBefore(rail, regionLayout);

  rail.appendChild(toggle);
  rail.appendChild(list);

  // 插入 DOM 後再初始化高度（避免 scrollHeight 量到 0）
  requestAnimationFrame(() => {
    const isCollapsed = localStorage.getItem("categoryRailCollapsed") === "1";
    rail.classList.toggle("collapsed", isCollapsed);
    if (isCollapsed) {
      list.style.maxHeight = "0px";
      toggle.setAttribute("aria-expanded", "false");
    } else {
      list.style.maxHeight = list.scrollHeight + "px";
      toggle.setAttribute("aria-expanded", "true");
    }
  });

  // 視窗改變時，展開狀態下重算高度
  window.addEventListener("resize", () => {
    if (!rail.classList.contains("collapsed")) {
      list.style.maxHeight = "";
      list.style.maxHeight = list.scrollHeight + "px";
    }
  });
}

function setCategory(cat) {
  current.category = cat;

  // 左欄 active 樣式
  document.querySelectorAll("#category-rail .tab").forEach(btn => {
    const active = btn.dataset.cat === cat;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", String(active));
  });

  // 顯示/隱藏對應 info 區塊
  const spots = document.getElementById("spots");
  const foods = document.getElementById("foods");
  const festivalWrap = document.querySelector(".section.festival");
  if (spots) spots.style.display = (cat === "景點") ? "block" : "none";
  if (foods) foods.style.display = (cat === "美食") ? "block" : "none";
  if (festivalWrap) festivalWrap.style.display = (cat === "慶典") ? "block" : "none";

  // 同步切換該分類的輪播（若無類別圖，會 fallback 至區域預設）
  if (current.region) {
    loadSlideshowForCategory(current.region, current.category, regionCategoryPhotos);
  }
}

function enterDetail(region) {
  if (!region) return;
  current.region = region;
  showRegionInfo(region);
  ensureCategoryRail();
  setCategory("景點");
}

// 從地圖點選區域後進入詳情
document.addEventListener("region-selected", (e) => {
  enterDetail(e.detail?.region);
});

// 初始保證 rail 存在（頁面載入時）
document.addEventListener("DOMContentLoaded", ensureCategoryRail);

export { enterDetail, setCategory };
