/**
 * 페이지의 체류시간, 스크롤 등 실시간으로 트랙킹 한다.
 */

// 전역 상태 변수
let visibleStart = null;
let totalVisibleTime = 0;

let lastY = 0;
// 전역 로그 객체
let ViewLog = {
  start_time: 0, // 페이지 들어간 시간
  dwell_time: 0, // 총 체류 시간 (초)
  total_scroll: 0, // 총 스크롤 거리 (px)
};

// 스크롤 추적 함수
function scrollTracking() {
  function updateScrollData() {
    const nowY = window.scrollY;
    ViewLog.total_scroll += Math.abs(nowY - lastY) / 100;
    lastY = nowY;
  }

  // 최초 1회 실행 (로드 시 스크롤 상태 반영)
  updateScrollData();
  window.addEventListener("scroll", updateScrollData);
}

// 초기화 및 체류시간 트래킹 시작
function initViewTracker() {
  // 초기화
  // ViewLog.max_scroll = 0;
  ViewLog.dwell_time = 0;
  ViewLog.total_scroll = 0;
  ViewLog.start_time = getLocalTime();
  visibleStart = null;
  totalVisibleTime = 0;
  lastY = 0;

  scrollTracking(); // 스크롤 추적 시작

  if (document.visibilityState === "visible") {
    visibleStart = Date.now();
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      if (visibleStart !== null) {
        totalVisibleTime += Date.now() - visibleStart;
        visibleStart = null;
        // console.log("[VIEW LOG - 탭 벗어남]", ViewLog);
      }
    } else if (document.visibilityState === "visible") {
      visibleStart = Date.now();
    }
  });
}

// 현재 상태를 반환
function getViewTracking() {
  const now = Date.now();
  const liveTime = visibleStart ? now - visibleStart : 0;

  ViewLog.dwell_time = Math.floor((totalVisibleTime + liveTime) / 1000);
  return ViewLog;
}

// 외부 호출 가능하도록 등록
window.getViewTracking = getViewTracking;
window.scrollTracking = scrollTracking;
window.initViewTracker = initViewTracker;
