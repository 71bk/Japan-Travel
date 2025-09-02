// =====================
// Region-based Focus + Zoom for SVG Japan Map
// =====================

// ----- Data (region-level) -----
const data = {
  "北海道": { 景點: ["札幌時計台", "小樽運河", "富良野花田"], 美食: ["成吉思汗烤肉", "海鮮丼", "味噌拉麵"], 慶典: { 2:["札幌雪祭"], 6:["YOSAKOI索朗祭"], 8:["富良野花田祭"] } },
  "東北":   { 景點: ["松島灣", "十和田湖", "角館武家屋敷"], 美食: ["牛舌燒", "稻庭烏龍麵"], 慶典: { 8:["青森睡魔祭","秋田竿燈祭","仙台七夕祭"] } },
  "關東":   { 景點: ["東京晴空塔", "淺草寺", "日光東照宮"], 美食: ["壽司", "雷門人形燒"], 慶典: { 7:["隅田川花火大會"], 6:["鎌倉紫陽花祭"] } },
  "中部":   { 景點: ["富士山", "白川鄉", "金澤兼六園"], 美食: ["味噌煮烏龍", "飛驒牛"], 慶典: { 8:["長岡花火大會"] } },
  "近畿":   { 景點: ["京都清水寺", "大阪城", "奈良東大寺"], 美食: ["章魚燒", "抹茶甜點"], 慶典: { 7:["祇園祭"], 8:["京都五山送火","天神祭"] } },
  "中國":   { 景點: ["嚴島神社", "鳥取沙丘"], 美食: ["廣島燒", "牡蠣料理"], 慶典: { 8:["宮島水中花火"] } },
  "四國":   { 景點: ["道後溫泉", "鳴門漩渦"], 美食: ["讚岐烏龍麵"], 慶典: { 8:["阿波舞"] } },
  "九州沖繩": { 景點: ["沖繩美麗海水族館", "熊本城"], 美食: ["沖繩麵", "豚骨拉麵"], 慶典: { 8:["那霸大綱挽"] } }
};

// ----- Prefecture -> Region map -----
const regionMap = {
  "JP-01": "北海道",
  "JP-02": "東北", "JP-03": "東北", "JP-04": "東北", "JP-05": "東北", "JP-06": "東北", "JP-07": "東北",
  "JP-08": "關東", "JP-09": "關東", "JP-10": "關東", "JP-11": "關東", "JP-12": "關東", "JP-13": "關東", "JP-14": "關東",
  "JP-15": "中部", "JP-16": "中部", "JP-17": "中部", "JP-18": "中部", "JP-19": "中部", "JP-20": "中部", "JP-21": "中部", "JP-22": "中部", "JP-23": "中部",
  "JP-24": "近畿", "JP-25": "近畿", "JP-26": "近畿", "JP-27": "近畿", "JP-28": "近畿", "JP-29": "近畿", "JP-30": "近畿",
  "JP-31": "中國", "JP-32": "中國", "JP-33": "中國", "JP-34": "中國", "JP-35": "中國",
  "JP-36": "四國", "JP-37": "四國", "JP-38": "四國", "JP-39": "四國",
  "JP-40": "九州沖繩", "JP-41": "九州沖繩", "JP-42": "九州沖繩", "JP-43": "九州沖繩", "JP-44": "九州沖繩", "JP-45": "九州沖繩", "JP-46": "九州沖繩", "JP-47": "九州沖繩"
};

// ----- Build Region -> [Prefecture IDs] index -----
function buildRegionIndex() {
  const regionIndex = {};
  Object.entries(regionMap).forEach(([prefId, region]) => {
    if (!regionIndex[region]) regionIndex[region] = [];
    regionIndex[region].push(prefId);
  });
  return regionIndex;
}
const regionIndex = buildRegionIndex();

// ----- References -----
const svg = document.querySelector("svg");
const defaultViewBox = svg.getAttribute("viewBox") || "0 0 437.33 516.01";
const infoEl = document.getElementById("info-container");
const nameEl = document.getElementById("region-name");
const spotsEl = document.getElementById("spots");
const festivalsEl = document.getElementById("festivals");
const monthSelect = document.getElementById("month-select");
const allPaths = Array.from(document.querySelectorAll("svg path"));
let selectedMonth = new Date().getMonth() + 1;

// ----- Helpers -----
function updateFestival(region) {
  const list = data[region]?.慶典?.[selectedMonth];
  festivalsEl.innerText = list ? list.join("、") : "本月無特別慶典";
}

function showRegionInfo(region) {
  if (!region || !data[region]) return;
  infoEl.style.display = "block";
  nameEl.innerText = region;
  spotsEl.innerHTML = `
    <strong>景點：</strong>${data[region].景點.join("、")}<br/>
    <strong>美食：</strong>${data[region].美食.join("、")}
  `;
  updateFestival(region);
  monthSelect.value = selectedMonth;
  monthSelect.onchange = () => {
    selectedMonth = parseInt(monthSelect.value, 10);
    updateFestival(region);
  };
}

// Union bbox for all paths within a region
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

function zoomToBox(box, padding=20) {
  if (!box) return;
  const viewBox = [
    box.x - padding,
    box.y - padding,
    box.width + padding * 2,
    box.height + padding * 2
  ].join(" ");
  svg.setAttribute("viewBox", viewBox);
}

function resetView() {
  svg.setAttribute("viewBox", defaultViewBox);
  allPaths.forEach(p => p.classList.remove("focus","dimmed"));
}

// Focus styling: highlight region paths, dim others
function focusRegion(region) {
  const ids = new Set(regionIndex[region] || []);
  allPaths.forEach(p => {
    p.classList.toggle("focus", ids.has(p.id));
    p.classList.toggle("dimmed", !ids.has(p.id));
  });
}

// ----- Click handling: any prefecture -> operate on its region -----
allPaths.forEach(path => {
  path.addEventListener("click", () => {
    const region = regionMap[path.id];
    if (!region) return;
    // visual
    focusRegion(region);
    const box = getRegionBBox(region);
    zoomToBox(box, 24);
    // info
    showRegionInfo(region);
    // mobile scroll
    if (window.innerWidth <= 768) {
      infoEl.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// ----- Reset button (optional) -----
const resetBtn = document.getElementById("reset-btn");
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    resetView();
    infoEl.style.display = "none";
  });
}

let slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
  showSlides(slideIndex += n);
}
function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  const slides = document.getElementsByClassName("mySlides");
  const dots = document.getElementsByClassName("dot");
  if (n > slides.length) slideIndex = 1;
  if (n < 1) slideIndex = slides.length;
  for (let slide of slides) slide.style.display = "none";
  for (let dot of dots) dot.classList.remove("active");
  slides[slideIndex-1].style.display = "block";
  dots[slideIndex-1].classList.add("active");
}

// 區域照片域照片


// 每個區域對應的照片
const regionPhotos = {
  "關東": [
    "../html.japan/image/pic/關東/富士山.jpg",
    "../html.japan/image/pic/關東/淺草寺.jpg",
    "../html.japan/image/pic/關東/東京晴空塔.jpg"
  ],
  "北海道": [
    "../html.japan/image/pic/北海道/札幌時計台.jpg",
    "../html.japan/image/pic/北海道/小樽運河.jpg"
  ]
  // 其他區域再補上
};

// 初始化顯示某區的圖片
function loadSlideshowFor(regionName) {
  const el = document.querySelector('.slideshow-container');
  const dotRow = document.querySelector('.dot-row');
  const imgs = regionPhotos[regionName] || [];

  // 產生投影片
  el.innerHTML = imgs.map(src => `
    <div class="mySlides fade"><img src="${src}" alt="${regionName} 圖片"></div>
  `).join('') + `
    <a class="prev" onclick="plusSlides(-1)">&#10094;</a>
    <a class="next" onclick="plusSlides(1)">&#10095;</a>
  `;

  // 產生圓點
  dotRow.innerHTML = imgs.map((_, i) =>
    `<span class="dot" onclick="currentSlide(${i+1})"></span>`
  ).join('');

  // 重設索引並啟動
  slideIndex = 1;
  showSlides(slideIndex);
  startAutoplay();
}

// 左右切換
function plusSlides(n) { showSlides(slideIndex += n); }
// 點圓點
function currentSlide(n) { showSlides(slideIndex = n); }

// 顯示目前這張
function showSlides(n) {
  const slides = document.getElementsByClassName("mySlides");
  const dots = document.getElementsByClassName("dot");
  if (!slides.length) return;

  if (n > slides.length) slideIndex = 1;
  if (n < 1) slideIndex = slides.length;

  for (let s of slides) s.style.display = "none";
  for (let d of dots) d.classList.remove("active");

  slides[slideIndex-1].style.display = "block";
  if (dots[slideIndex-1]) dots[slideIndex-1].classList.add("active");
}

// 自動輪播
function startAutoplay(interval = 3000) {
  stopAutoplay();
  autoplayTimer = setInterval(() => plusSlides(1), interval);
}
function stopAutoplay() {
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
}

// 滑鼠移入暫停 / 移出繼續
const slideshowContainer = document.querySelector('.slideshow-container');
slideshowContainer?.addEventListener('mouseenter', stopAutoplay);
slideshowContainer?.addEventListener('mouseleave', startAutoplay);

// 分頁不可見時暫停
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopAutoplay(); else startAutoplay();
});

