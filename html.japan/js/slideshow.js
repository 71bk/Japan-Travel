// slideshow.js
// ====================
// 投影片功能模組
// ====================

// 當前投影片索引（從 1 開始）
let slideIndex = 1;
// 自動播放的計時器
let autoplayTimer = null;

// 區域 -> 圖片清單對照表
// （路徑建議相對於 index.html，例如 ./image/...）
const regionPhotos = {
  "關東": [
    "./image/pic/關東/東京塔.jpg",
    "./image/pic/關東/淺草寺.jpg",
    "./image/pic/關東/晴空塔.jpg"
  ],
  "北海道": [
    "./image/pic/北海道/札幌時計台.jpg",
    "./image/pic/北海道/小樽運河.jpg",
    "./image/pic/北海道/富良野花田.jpg"
  ],

   "東北": [
    "./image/pic/東北/松島灣.jpg",
    "./image/pic/東北/十和田湖.jpg",
    "./image/pic/東北/角館武家屋敷.jpg"
  ],

   "中部": [
    "./image/pic/中部/富士山.jpg",
    "./image/pic/中部/白川鄉.jpg",
    "./image/pic/中部/金澤兼六園.jpg"
  ],
  
     "九州沖繩": [
    "./image/pic/九州沖繩/熊本城.jpg",
    "./image/pic/九州沖繩/沖繩美麗海水族館.jpg",
    "./image/pic/中部/金澤兼六園.jpg"
  ],
    "近畿": [
    "./image/pic/近畿/伏見稻荷大社.jpg",
    "./image/pic/九州沖繩/沖繩美麗海水族館.jpg",
    "./image/pic/中部/金澤兼六園.jpg"
  ],




  // TODO: 其他區域依需要再補上
};

// ====================
// 載入某個區域的投影片
// ====================
export function loadSlideshowFor(regionName) {
  const el = document.querySelector(".slideshow-container"); // 投影片容器
  const dotRow = document.querySelector(".dot-row");         // 底部點點導航
  const imgs = regionPhotos[regionName] || [];               // 該區域的圖片陣列

  // 產生投影片區塊 + 上一張/下一張按鈕
  el.innerHTML =
    imgs
      .map(
        src => `
        <div class="mySlides fade">
        <img src="${src}" alt="${regionName} 圖片">
        <div class="caption">${src.split("/").pop().replace(".jpg", "")}</div>
        </div>`
      )
      .join("") +
    `
      <a class="prev">&#10094;</a>
      <a class="next">&#10095;</a>
    `;

  // 產生對應數量的點點導航
  dotRow.innerHTML = imgs
    .map((_, i) => `<span class="dot" data-index="${i + 1}"></span>`)
    .join("");

  // 初始狀態：顯示第一張
  slideIndex = 1;
  showSlides(slideIndex);
  startAutoplay();

  // 綁定事件監聽器（按鈕與點點）
  el.querySelector(".prev").addEventListener("click", () => plusSlides(-1));
  el.querySelector(".next").addEventListener("click", () => plusSlides(1));
  dotRow.querySelectorAll(".dot").forEach(dot => {
    dot.addEventListener("click", () =>
      currentSlide(parseInt(dot.dataset.index, 10))
    );
  });
}

// ====================
// 投影片控制函式
// ====================

// 下一張 / 上一張
function plusSlides(n) {
  showSlides((slideIndex += n));
}

// 切換到指定編號的投影片
function currentSlide(n) {
  showSlides((slideIndex = n));
}

// 顯示第 n 張投影片
function showSlides(n) {
  const slides = document.getElementsByClassName("mySlides");
  const dots = document.getElementsByClassName("dot");
  if (!slides.length) return;

  // 循環控制
  if (n > slides.length) slideIndex = 1;
  if (n < 1) slideIndex = slides.length;

  // 隱藏所有投影片
  for (let s of slides) s.style.display = "none";
  // 移除所有點點的 active 樣式
  for (let d of dots) d.classList.remove("active");

  // 顯示當前投影片
  slides[slideIndex - 1].style.display = "block";
  // 高亮當前點點
  if (dots[slideIndex - 1]) dots[slideIndex - 1].classList.add("active");
}

// ====================
// 自動播放控制
// ====================

// 啟動自動播放（預設每 3 秒換一張）
function startAutoplay(interval = 4000) {
  stopAutoplay(); // 先確保沒有重複的計時器
  autoplayTimer = setInterval(() => plusSlides(1), interval);
}

// 停止自動播放
function stopAutoplay() {
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
}

// ====================
// 使用者互動事件
// ====================

// 等 DOM 載入後才綁定 hover 事件
document.addEventListener("DOMContentLoaded", () => {
  const slideshowContainer = document.querySelector(".slideshow-container");
  if (slideshowContainer) {
    // 滑鼠移入：暫停播放
    slideshowContainer.addEventListener("mouseenter", stopAutoplay);
    // 滑鼠移出：繼續播放
    slideshowContainer.addEventListener("mouseleave", () => startAutoplay());
  }
});

// 分頁切換可見性事件(可節省資源)
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopAutoplay(); // 背景狀態 → 停止播放
  else startAutoplay();                // 回到前景 → 繼續播放
});
