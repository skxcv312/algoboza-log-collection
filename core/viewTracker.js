/**
 * 페이지의 체류시간, 스크롤 등 실시간으로 트랙킹 한다.
 */

// 전역 상태 변수
let lastY = 0;
let viewStartTime = Date.now();
let hiddenStartTime = null;
let lastActivityTime = Date.now();
let inActivityTime = 0; // 마지막 활동시간 기록
const sec = 1000;
const INACTIVITY_LIMIT = 60 * sec; // 60초

// 전역 로그 객체
let ViewLog = {
  start_time: 0, // 페이지 들어간 시간
  dwell_time: 0, // 총 체류 시간 (초)
  total_scroll: 0, // 총 스크롤 거리 (px)
};

// 현재 활동중인지 확인
function isActivity() {
  const now_time = Date.now();
  // 마지막 활동 이후 경과한 시간(초)
  const inActivityDuration = now_time - lastActivityTime;

  // 만약 비활동 시간이 60초 이상이면, 그만큼 체류시간에서 차감
  if (inActivityDuration >= INACTIVITY_LIMIT) {
    inActivityTime += inActivityDuration;
  }
  lastActivityTime = now_time;
}

// 스크롤 추적 함수
function scrollTracking() {
  function updateScrollData() {
    isActivity();
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
  lastY = 0;
  hiddenStartTime = null;

  scrollTracking(); // 스크롤 추적 시작

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      hiddenStartTime = Date.now();
    } else if (document.visibilityState === "visible") {
      inActivityTime += Date.now() - hiddenStartTime;
      hiddenStartTime = null;
    }
  });
}

// 현재 상태를 반환
function getViewTracking() {
  const viewEndTime = Date.now();

  if (hiddenStartTime !== null) {
    inActivityTime += viewEndTime - hiddenStartTime;
    hiddenStartTime = null;
  }
  console.log(inActivityTime);

  const liveTime = viewEndTime - viewStartTime;
  console.log(liveTime);
  // 기본 체류시간 계산
  let dwellTime = Math.floor((liveTime - inActivityTime) / sec);

  ViewLog.dwell_time = Math.max(dwellTime, 0); // 음수면 0을 반환
  return ViewLog;
}

// 외부 호출 가능하도록 등록
window.getViewTracking = getViewTracking;
window.scrollTracking = scrollTracking;
window.initViewTracker = initViewTracker;
