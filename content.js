// main 실행 진입점

// 공통 로직 실행
initViewTracker(); // 체류시간, 스크롤 범위

// saveLogToLocalStorage();  // 저장

// 분기점
const url = new URL(location.href);
let hostname = url.hostname; // 현재 페이지의 호스트 이름 (예: www.musinsa.com)
let pathName = url.pathname; // 현재 페이지의 경로 (예: /products/12345)

console.log("host name", hostname);

function injectScript(file) {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL(file);
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);
}

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
  // 쿠팡
  console.log("쿠팡");

  // 카테고리 페이지 (예: /category/002022)
  // 실제 카테고리 url을 보면
  // https://www.coupang.com/np/categories/486249
  // 이런식이기 때문에 category가 아닌 categories로 적어야 분기가 된다.
  if (pathName.includes("categories")) {
    console.log("> 카테고리 페이지");
    CoupangCategoryHandler.init();
  }

  // 상품 페이지 (예: /products/123456)
  else if (pathName.includes("products")) {
    console.log("> 상품 페이지");
    CoupangProductHandler.init();
  }

  // 검색 결과 페이지 (예: /search/goods?keyword=청바지)
  else if (pathName.includes("search")) {
    console.log("> 검색 페이지");
    CoupangSearchHandler.init();
  }

  // 장바구니 페이지 (예: /orders/cart)
  else if (pathName.includes("cart")) {
    console.log("> 장바구니");
    CoupangCartHandler.init();
  }
}

// 네이버
else if (hostname.includes("naver")) {
  console.log("네이버");

  // 네이버 블로그
  if (hostname.includes("blog.naver.com")) {
    console.log("> 블로그 페이지");
    injectScript("blog.js");
    setTimeout(() => {
      if (window.NaverBlogHandler) NaverBlogHandler.init();
    }, 1000);
  }

  // 네이버 카페
  else if (hostname.includes("cafe.naver.com")) {
    console.log("> 카페 페이지");
    injectScript("cafe.js");
    setTimeout(() => {
      if (window.NaverCafeHandler) NaverCafeHandler.init();
    }, 1000);
  }

  // 네이버 쇼핑
  else if (hostname.includes("shopping.naver.com")) {
    console.log("> 쇼핑 페이지");
    injectScript("shopping.js");
    setTimeout(() => {
      if (window.NaverShoppingHandler) NaverShoppingHandler.init();
    }, 1000);
  }

  // 네이버 지도/플레이스
  else if (
    hostname.includes("map.naver.com") ||
    hostname.includes("place.naver.com")
  ) {
    console.log("> 지도/플레이스 페이지");
    NaverPlaceHandler.init();
  }

  // ✅ 네이버 검색
  else if (hostname.includes("searchLogPage")) {
    console.log("> 네이버 검색 페이지");
    injectScript("searchLogPage.js");
    setTimeout(() => {
      if (window.NaverSearchHandler) {
        NaverSearchHandler.init();
      }
    }, 1000);
  }
}
