// map.js
// 匯入資料和功能
import { regionMap, buildRegionIndex } from "./data.js"; // 區域資料 & 對照表
import { showRegionInfo } from "./info.js";              // 顯示區域資訊面板
import { loadSlideshowFor } from "./slideshow.js";       // 載入對應區域投影片

document.addEventListener("DOMContentLoaded", () => {
  // ========== 抓取 SVG 與初始狀態 ==========
  const svg = document.querySelector("svg"); // 整張地圖
  if (!svg) return;
  const defaultViewBox = svg.getAttribute("viewBox") || "0 0 437.33 516.01";
  const allPaths = Array.from(document.querySelectorAll("svg path")); // 所有縣市 <path>
  const regionIndex = buildRegionIndex(); // { 區域: [縣市id, ...] }

  // ====== 狀態：滑過與選取的區域 ======
  let hoveredRegion = null;
  let selectedRegion = null;

  // ========== 計算指定區域的外框 (bounding box) ==========
  function getRegionBBox(region) {
    const ids = regionIndex[region] || [];
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const b = el.getBBox();
      minX = Math.min(minX, b.x);
      minY = Math.min(minY, b.y);
      maxX = Math.max(maxX, b.x + b.width);
      maxY = Math.max(maxY, b.y + b.height);
    });
    if (minX === Infinity) return null;
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }

  // ========== 視角縮放到指定外框 ==========
  function zoomToBox(box, padding = 20) {
    if (!box) return;
    const viewBox = [
      box.x - padding,
      box.y - padding,
      box.width + padding * 2,
      box.height + padding * 2
    ].join(" ");
    svg.setAttribute("viewBox", viewBox);
  }

  // ========== 重置視角，並清除樣式 ==========
  function resetView() {
    svg.setAttribute("viewBox", defaultViewBox);
    allPaths.forEach(p => p.classList.remove("focus", "dimmed", "hover", "hover-dim"));
    hoveredRegion = null;
    selectedRegion = null;
  }

  // ========== 聚焦某個區域（高亮 + 其他變暗） ==========
  function focusRegion(region) {
    const ids = new Set(regionIndex[region] || []);
    allPaths.forEach(p => {
      p.classList.toggle("focus", ids.has(p.id));
      p.classList.toggle("dimmed", !ids.has(p.id));
      // 清掉 hover 類別，避免狀態混雜
      if (ids.has(p.id)) p.classList.remove("hover");
      else p.classList.remove("hover-dim");
    });
  }

  // ====== Hover 視覺（以「區域」為單位） ======
  function applyRegionHover(region) {
    if (!region || region === hoveredRegion) return;
    hoveredRegion = region;
    const ids = new Set(regionIndex[region] || []);
    allPaths.forEach(p => {
      p.classList.toggle("hover", ids.has(p.id));
      p.classList.toggle("hover-dim", !ids.has(p.id));
    });
  }
  function clearRegionHover() {
    hoveredRegion = null;
    allPaths.forEach(p => p.classList.remove("hover", "hover-dim"));
  }

  // ====== 建立「區域熱區」圖層 ======
  // 提示：把 path 的 pointer 事件關閉，讓互動只經由熱區處理
  allPaths.forEach(p => { p.style.pointerEvents = "none"; });

  const regionHotLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
  regionHotLayer.setAttribute("data-layer", "region-hotzones");
  // 確保熱區在最上層（append 在最後）
  svg.appendChild(regionHotLayer);

  Object.keys(regionIndex).forEach(region => {
    const box = getRegionBBox(region);
    if (!box) return;

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", box.x);
    rect.setAttribute("y", box.y);
    rect.setAttribute("width", box.width);
    rect.setAttribute("height", box.height);
    // 注意：fill 需為透明色而不是 'none'，才能接收滑鼠事件
    rect.setAttribute("fill", "#ffffff");
    rect.setAttribute("fill-opacity", "0");
    rect.style.cursor = "pointer";

    // Hover（只有未選取狀態才顯示 hover 效果）
    rect.addEventListener("pointerenter", () => {
      if (selectedRegion) return;
      applyRegionHover(region);
    });
    rect.addEventListener("pointerleave", () => {
      if (selectedRegion) return;
      clearRegionHover();
    });

    // Click：以區域為單位的選取 + 縮放 + 面板
    rect.addEventListener("click", () => {
      // 重點：縮小地圖 + 展開 Info 面板
      document.querySelector(".map-container")?.classList.add("shrinked");
      document.getElementById("info-container")?.classList.add("expanded");

      // 聚焦地圖與更新內容
      focusRegion(region);
      zoomToBox(getRegionBBox(region));
      showRegionInfo(region);
      loadSlideshowFor(region);
    });

    // 可選：加入 aria-label 讓輔助工具更友善
    rect.setAttribute("role", "button");
    rect.setAttribute("tabindex", "0");
    rect.setAttribute("aria-label", `選擇區域：${region}`);
    rect.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        rect.dispatchEvent(new Event("click"));
      }
    });

    regionHotLayer.appendChild(rect);
  });

  // ========== 綁定重置按鈕 ==========
  const resetBtn = document.getElementById("reset-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      document.querySelector(".map-container")?.classList.remove("shrinked");
      document.getElementById("info-container")?.classList.remove("expanded");
      resetView(); // 回復原始視角
      const infoEl = document.getElementById("info-container");
      if (infoEl) infoEl.style.display = "none"; // 隱藏資訊面板
    });
  }
});
