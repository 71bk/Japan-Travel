// bar.js

// 顯示導覽列
export function showBar(regionName = "") {
  const topBar = document.getElementById("top-bar");
  const regionTitle = document.getElementById("region-title");

  if (topBar) {
    topBar.classList.remove("hidden");
  }

  if (regionTitle && regionName) {
    regionTitle.textContent = regionName;
  }
}

// 隱藏導覽列
export function hideBar() {
  const topBar = document.getElementById("top-bar");
  if (topBar) {
    topBar.classList.add("hidden");
  }
}
