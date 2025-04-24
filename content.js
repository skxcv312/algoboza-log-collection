// main 실행 진입점

// 공통 로직 실행
initViewTracker(); // 체류시간, 스크롤 범위

// saveLogToLocalStorage();  // 저장

// 분기점
const url = new URL(location.href);
let hostname = url.hostname; // 현재 페이지의 호스트 이름 (예: www.musinsa.com)
let pathName = url.pathname; // 현재 페이지의 경로 (예: /products/12345)
console.log("host name", hostname);
if (hostname.includes("musinsa")) {
  // 무신사
  console.log("무신사");

  // 카테고리 페이지 (예: /category/002022)
  if (pathName.includes("category")) {
    console.log("> 카테고리 페이지");
    MusinsaCategoryHandler.init();
  }

  // 상품 페이지 (예: /products/123456)
  else if (pathName.includes("products")) {
    console.log("> 상품 페이지");
    MusinsaProductHandler.init();
  }

  // 검색 결과 페이지 (예: /search/goods?keyword=청바지)
  else if (pathName.includes("search")) {
    console.log("> 검색 페이지");
    MusinsaSearchHandler.init();
  }

  // 장바구니 페이지 (예: /orders/cart)
  else if (pathName.includes("cart")) {
    console.log("> 장바구니");
    MusinsaCartHandler.init();
  }
} else if (hostname.includes("coupang")) {
} else if (hostname.includes("naver")) {
}
