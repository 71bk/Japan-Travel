// utils.js
export function getDetailPage(category){
  if (category === '景點') return 'spot.html';
  if (category === '美食') return 'food.html';
  if (category === '慶典') return 'festival.html';
  return 'detail.html';
}

export function detailUrl({ region, category, name }){
  const q = new URLSearchParams({ region, category, name }).toString();
  return `${getDetailPage(category)}?${q}`;
}
