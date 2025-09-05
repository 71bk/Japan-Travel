// main.js (入口檔)
// 匯入四個模組，執行時就會自動跑各自的初始化
import "./data.js";
import "./info.js";
import "./map.js";
import "./slideshow.js";
import "./detailView.js";
import "./highlights.js";

// 主題表：每個地區對應主色與環境光
const REGION_THEMES = {
  "北海道":   { theme:"#3BA7D7", ambientFrom:"rgba(10,45,70,.60)"  },
  "東北":     { theme:"#2E86AB", ambientFrom:"rgba(10,35,60,.60)"  },
  "關東":     { theme:"#D94862", ambientFrom:"rgba(60,10,25,.60)"  },
  "中部":     { theme:"#0EA5E9", ambientFrom:"rgba(8,38,60,.60)"   },
  "近畿":     { theme:"#F59E0B", ambientFrom:"rgba(45,28,5,.60)"   },
  "中國":     { theme:"#16A34A", ambientFrom:"rgba(8,38,20,.60)"   },
  "四國":     { theme:"#7C3AED", ambientFrom:"rgba(25,10,45,.60)"  },
  "九州沖繩": { theme:"#EF4444", ambientFrom:"rgba(45,10,10,.60)"  },
};

function applyRegionTheme(region){
  const { theme, ambientFrom } = REGION_THEMES[region] || {};
  if (!theme) return;
  const root = document.documentElement;
  root.style.setProperty("--theme", theme);
  root.style.setProperty("--theme-weak", `${theme}1F`.replace("#","%23")); // 保底
  root.style.setProperty("--ambient-from", ambientFrom || "rgba(0,0,0,.55)");
}

// 已有：map.js 會派發 { type:'region-selected', detail:{region} }
document.addEventListener("region-selected", (e)=>{
  const region = e.detail?.region;
  if (region) applyRegionTheme(region);
});

// 預設若進來就有 currentRegion
document.addEventListener("DOMContentLoaded", ()=>{
  if (window.currentRegion) applyRegionTheme(window.currentRegion);
});
