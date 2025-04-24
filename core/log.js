const product = "product";
const category = "category";
const search = "search";
const click = "click";
const cart = "cart";
// 클릭 로그
function createClickLog() {
  return {
    type: click,
    timestamp: getLocalTime(),
    action: null,
    url: window.location.href,
  };
}
window.createClickLog = createClickLog;
//
function createProductLog() {
  return {
    userEmail: null,
    type: product,
    timestamp: null, // 정보 생성 시간
    url: new URL(window.location.href), // 현재 페이지의 전체 URL
    like: false, // 좋아요 여부 (true: 누름, false: 안 누름 또는 취소)
    productName: null, // 상품명
    price: null, // 상품 가격 (숫자형)
    category: [], // 상품 카테고리 목록 (문자열 배열)
    details: [], // 기타 속성 정보 (성별, 시즌 등 선택된 필드만)
    clickTracking: [], // 사용자 클릭 이벤트 로그 (각 클릭에 대한 세부 정보 배열)
    view: null, // 뷰 트래킹 정보 (체류 시간, 스크롤 등 페이지 상호작용 요약)
  };
}
window.createProductLog = createProductLog;

function createCategoryLog() {
  return {
    userEmail: null,
    type: category,
    category: [],
    clickTracking: [], // 사용자 클릭 이벤트 로그 (각 클릭에 대한 세부 정보 배열)
    timestamp: null, // 정보 생성 시간
    url: new URL(window.location.href), // 현재 페이지의 전체 URL
    details: [], // 기타 속성 정보 (성별, 시즌 등 선택된 필드만)
    view: null, // 뷰 트래킹 정보 (체류 시간, 스크롤 등 페이지 상호작용 요약)
  };
}
window.createCategoryLog = createCategoryLog;

function createSearchLog() {
  return {
    userEmail: null,
    type: search,
    searchText: null,
    details: [],
    view: null,
    clickTracking: [],
    timestamp: null,
    url: new URL(window.location.href), // 현재 페이지의 전체 URL
  };
}
window.createSearchLog = createSearchLog;

function createCarthLog() {
  return {
    userEmail: null,
    type: cart,
    cart: [],
    details: [],
    view: null,
    clickTracking: [],
    timestamp: null,
    url: new URL(window.location.href), // 현재 페이지의 전체 URL
  };
}
window.createCarthLog = createCarthLog;
