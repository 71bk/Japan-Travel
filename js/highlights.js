/* highlights.js — 本區精選：渲染到左側 .rail-list 內 (#rail-highlights)
   - 不建立 Tab/按鈕
   - 跟著 .rail-list 的收合一起收
   - 卡片可點擊，跳詳細頁（開新分頁）
*/

import { data as DATA } from "./data.js";
import { regionCategoryPhotos as PHOTOS } from "./detailView.js";
import { detailUrl } from "./utils.js";

function firstItem(arr){
  if (!Array.isArray(arr) || !arr.length) return null;
  const v = arr[0];
  return typeof v === "string" ? { 名稱:v, 說明:"" } : { 名稱: v.名稱 || v.name || "", 說明: v.說明 || v.desc || "" };
}
function findFestivalFirst(fes){
  if (!fes) return null;
  const months = Object.keys(fes).sort((a,b)=>+a-+b);
  for (const m of months){
    const arr = fes[m];
    if (Array.isArray(arr) && arr.length){
      const v = arr[0];
      return { 名稱: v.名稱 || v.name || "", 說明: v.說明 || v.desc || "" };
    }
  }
  return null;
}
function resolveThumb(region, category, name){
  const arr = PHOTOS?.[region]?.[category];
  if (Array.isArray(arr) && arr.length){
    const hit = name ? arr.find(p=>p.includes(name)) : null;
    return hit || arr[0];
  }
  const fallback = { 景點:"./image/placeholder/spot.jpg", 美食:"./image/placeholder/food.jpg", 慶典:"./image/placeholder/festival.jpg" };
  return fallback[category] || "./image/placeholder/blank.jpg";
}

export function renderRailHighlights(region){
  const slot = document.getElementById("rail-highlights");
  const list = slot?.querySelector("#rail-hl-list");
  if (!slot || !list || !region) return;

  const R = (DATA || {})[region] || {};
  const spot = firstItem(R.景點);
  const food = firstItem(R.美食);
  const fes  = findFestivalFirst(R.慶典);

  const mk = (cat, item) => {
    if (!item || !item.名稱) return "";
    const thumb = resolveThumb(region, cat, item.名稱);
    const kickerClass =
      cat === "景點" ? "rail-hl-kicker spot" :
      cat === "美食" ? "rail-hl-kicker food" : "rail-hl-kicker fes";
    const href = detailUrl({ region, category: cat, name: item.名稱 });

    return `
      <a class="rail-hl-card" href="${href}" target="_blank" rel="noopener">
        <img class="rail-hl-thumb" src="${thumb}" alt="${item.名稱}">
        <div class="rail-hl-meta">
          <div class="${kickerClass}">${cat}</div>
          <h6 class="rail-hl-title" title="${item.名稱}">${item.名稱}</h6>
        </div>
      </a>
    `;
  };

  // 排序：景點精選、美食精選、慶典精選
  list.innerHTML = [ mk("景點", spot), mk("美食", food), mk("慶典", fes) ].join("");
}

// 事件：切換地區就刷新精選（main01 已經 import 本檔，這裡自動掛上監聽）
document.addEventListener("region-selected", (e) => {
  const region = e.detail?.region;
  if (region) renderRailHighlights(region);
});

// 初始：若一開始就有 currentRegion
document.addEventListener("DOMContentLoaded", () => {
  const initRegion = window.currentRegion;
  if (initRegion) renderRailHighlights(initRegion);
});
