// ./js/detailView.js
import { showRegionInfo } from "./info.js";
import { loadSlideshowForCategory } from "./slideshow.js";
import { detailUrl } from "./utils.js";

// 三個分類（預設：景點）
const CATEGORIES = ["景點", "美食", "慶典"];
const CATEGORY_ICONS = { "景點": "📍", "美食": "🍜", "慶典": "🎎" };

let current = { region: null, category: "景點" };

/**（可選）區域 x 類別 → 圖片清單
 * 若沒有對應的類別圖片，會自動退回用區域的預設輪播（slideshow.js 既有）。
 * 路徑請依你的專案調整或之後慢慢補。
 */
export const regionCategoryPhotos = {
  "北海道": {
    "景點": [
      "./image/pic/北海道/札幌時計台.jpg",
      "./image/pic/北海道/小樽運河.jpg",
      "./image/pic/北海道/富良野花田.jpg",
      "./image/pic/北海道/旭川動物園.jpg",
      "./image/pic/北海道/知床五湖.jpg"
    ],
    "美食": [
      "./image/pic/北海道/成吉思汗烤肉.jpg",
      "./image/pic/北海道/海鮮丼.jpg",
      "./image/pic/北海道/函館鹽拉麵.jpg"
    ],
    "慶典": [
      "./image/pic/北海道/札幌雪祭.jpg",
      "./image/pic/北海道/YOSAKOI索朗祭.jpg",
      "./image/pic/北海道/富良野花田祭.jpg"
    ]
  },
  "東北": {
    景點: [
      "./image/pic/東北/松島灣.jpg",
      "./image/pic/東北/十和田湖.jpg",
      "./image/pic/東北/角館武家屋敷.jpg",
      "./image/pic/東北/猊鼻渓.jpg",
      "./image/pic/東北/銀山溫泉.jpg"
    ],
    美食: [
      "./image/pic/東北/牛舌燒.jpg",
      "./image/pic/東北/稻庭烏龍麵.jpg"
    ],
    慶典: [
      "./image/pic/東北/青森睡魔祭.jpg",
      "./image/pic/東北/秋田竿燈祭.jpg",
      "./image/pic/東北/仙台七夕祭.jpg"
    ]
  },
  "關東": {
    景點: [
      "./image/pic/關東/晴空塔.jpg",
      "./image/pic/關東/淺草寺.jpg",
      "./image/pic/關東/東京塔.jpg",
      "./image/pic/關東/日光東照宮.jpg",
      "./image/pic/關東/鎌倉大佛.jpg"
    ],
    美食: [
      "./image/pic/關東/壽司.jpg",
      "./image/pic/關東/雷門人形燒.jpg"
    ],
    慶典: [
      "./image/pic/關東/鎌倉紫陽花祭.jpg",
      "./image/pic/關東/隅田川花火大會.jpg"
    ]
  },
  "中部": {
    景點: [
      "./image/pic/中部/富士山.jpg",
      "./image/pic/中部/白川鄉.jpg",
      "./image/pic/中部/金澤兼六園.jpg",
      "./image/pic/中部/立山黑部阿爾卑斯路線.jpg",
      "./image/pic/中部/黑部水壩.jpg"
    ],
    美食: [
      "./image/pic/中部/味噌煮烏龍.jpg",
      "./image/pic/中部/飛驒牛.jpg"
    ],
    慶典: [
      "./image/pic/中部/長岡花火大會.jpg"
    ]
  },
  "近畿": {
    景點: [
      "./image/pic/近畿/京都清水寺.jpg",
      "./image/pic/近畿/大阪城.jpg",
      "./image/pic/近畿/奈良東大寺.jpg",
      "./image/pic/近畿/伏見稻荷大社.jpg",
      "./image/pic/近畿/姬路城.jpg"
    ],
    美食: [
      "./image/pic/近畿/章魚燒.jpg",
      "./image/pic/近畿/宇治抹茶甜點.jpg"
    ],
    慶典: [
      "./image/pic/近畿/祇園祭.jpg",
      "./image/pic/近畿/京都五山送火.jpg",
      "./image/pic/近畿/天神祭.jpg"
    ]
  },
  "中國": {
    景點: [
      "./image/pic/中國/嚴島神社.jpg",
      "./image/pic/中國/鳥取沙丘.jpg",
      "./image/pic/中國/倉敷美觀地區.jpg",
      "./image/pic/中國/錦帶橋.jpg"
    ],
    美食: [
      "./image/pic/中國/廣島燒.jpg",
      "./image/pic/中國/[廿日市宮島町] 牡蠣林.jpg"
    ],
    慶典: [
      "./image/pic/中國/宮島水中花火.jpg"
    ]
  },
  "四國": {
    景點: [
      "./image/pic/四國/道後溫泉.jpg",
      "./image/pic/四國/鳴門漩渦.jpg",
      "./image/pic/四國/祖谷葛橋.jpg",
      "./image/pic/四國/草間彌生・南瓜.jpg"
    ],
    美食: [
      "./image/pic/四國/讚岐烏龍麵.jpg"
    ],
    慶典: [
      "./image/pic/四國/阿波舞.jpg"
    ]
  },
  "九州沖繩": {
    景點: [
      "./image/pic/九州沖繩/沖繩美麗海水族館.jpg",
      "./image/pic/九州沖繩/熊本城.jpg",
      "./image/pic/九州沖繩/高千穗峽.jpg",
      "./image/pic/九州沖繩/櫻島火山.jpg"
    ],
    美食: [
      "./image/pic/九州沖繩/沖繩麵.jpg",
      "./image/pic/九州沖繩/豚骨拉麵.jpg"
    ],
    慶典: [
      "./image/pic/九州沖繩/那霸大綱挽.jpg"
    ]
  }

};

function ensureCategoryRail() {
  const info = document.getElementById("info-container");
  if (!info) return;

  const regionLayout = info.querySelector(".region-layout");
  if (!regionLayout) return;

  // 若已有 rail，直接搬進 .region-layout（避免重複建立）
  let rail = document.getElementById("category-rail");
  if (!rail) {
    rail = document.createElement("aside");
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
    if (!list.querySelector('#rail-highlights')) {
      list.insertAdjacentHTML('beforeend', `
    <section id="rail-highlights" class="rail-highlights" aria-hidden="false">
      <h5 class="hl-titlebar">本區精選</h5>
      <div class="rail-hl-list" id="rail-hl-list"></div>
    </section>
  `);
    }


    // 切換分類
    list.addEventListener("click", (e) => {
      // 1) 點到精選卡片（<a class="rail-hl-card">）→ 直接讓瀏覽器處理
      const card = e.target.closest("a.rail-hl-card");
      if (card) return;

      // 2) 點到分類 Tab（<button class="tab" data-cat>）→ 切換分類
      const btn = e.target.closest("button.tab[data-cat]");
      if (!btn) return;
      e.preventDefault();
      setCategory(btn.dataset.cat);
    });

    // 展開/收合
    toggle.addEventListener("click", () => {
      const collapsing = !rail.classList.contains("collapsed");
      const listEl = rail.querySelector(".rail-list");
      if (collapsing) {
        rail.classList.add("collapsed");
        listEl.style.maxHeight = "0px";
        localStorage.setItem("categoryRailCollapsed", "1");
        toggle.setAttribute("aria-expanded", "false");
      } else {
        rail.classList.remove("collapsed");
        listEl.style.maxHeight = "";
        listEl.style.maxHeight = listEl.scrollHeight + "px";
        localStorage.setItem("categoryRailCollapsed", "0");
        toggle.setAttribute("aria-expanded", "true");
      }
    });

    rail.appendChild(toggle);
    rail.appendChild(list);

    // 初始化高度
    requestAnimationFrame(() => {
      const listEl = rail.querySelector(".rail-list");
      const isCollapsed = localStorage.getItem("categoryRailCollapsed") === "1";
      rail.classList.toggle("collapsed", isCollapsed);
      if (isCollapsed) {
        listEl.style.maxHeight = "0px";
        rail.querySelector(".rail-toggle")?.setAttribute("aria-expanded", "false");
      } else {
        listEl.style.maxHeight = listEl.scrollHeight + "px";
        rail.querySelector(".rail-toggle")?.setAttribute("aria-expanded", "true");
      }
    });

    // 視窗改變時，展開狀態下重算高度
    window.addEventListener("resize", () => {
      if (!rail.classList.contains("collapsed")) {
        const listEl = rail.querySelector(".rail-list");
        listEl.style.maxHeight = "";
        listEl.style.maxHeight = listEl.scrollHeight + "px";
      }
    });
  }

  // ✅ 關鍵：把 rail 放到 .region-layout 裡，並排成左欄
  if (rail.parentElement !== regionLayout) {
    regionLayout.prepend(rail);
  }

  return rail;
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
