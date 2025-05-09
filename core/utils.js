/**
 *  여러가지 다양한 함수를 모아둠.
 * 전역 함수로 등록하여 모든 js 파일에서 들여다 볼 수 있다.
 */

// 클릭된 테그의 상위 테그 확인
function logParentHierarchy(element, maxLevel = 5) {
  let parent = element.parentElement;
  let level = 0;
  while (parent && level < maxLevel) {
    console.log(`[UP ${level}]`, parent.tagName, parent.className || "");
    parent = parent.parentElement;
    level++;
  }
}
window.logParentHierarchy = logParentHierarchy;

// 현재 시간 얻기
function getLocalTime() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000; // UTC 밀리초
  const kstDate = new Date(utc + 9 * 60 * 60000); // KST = UTC+9

  const yyyy = kstDate.getFullYear();
  const MM = String(kstDate.getMonth() + 1).padStart(2, "0");
  const dd = String(kstDate.getDate()).padStart(2, "0");
  const HH = String(kstDate.getHours()).padStart(2, "0");
  const mm = String(kstDate.getMinutes()).padStart(2, "0");
  const ss = String(kstDate.getSeconds()).padStart(2, "0");

  return kstDate;
}
window.getLocalTime = getLocalTime;

// 서버로 보내기
// function sendToServer(log) {
//   const userEmail = "a@a.com";
//   log.timestamp = getLocalTime?.();
//   log.view = getViewTracking?.();
//   log.userEmail = userEmail;
//   console.log("[LOG]", log);
//   saveLogToLocalStorage(log); // 서버로 보내기전 로컬스토리지에 log 저장
//   // content.js -> background.js로 메시지 보내기
//   chrome.runtime.sendMessage({ type: "SEND_LOG", data: log });
// }
// window.sendToServer = sendToServer;
function sendToServer(log) {
  const userEmail = "a@a.com";
  log.timestamp = getLocalTime?.();
  log.view = getViewTracking?.();
  log.userEmail = userEmail;
  console.log("[LOG]", log);
  chrome.runtime.sendMessage({ type: "SAVE_LOG", data: log });
  // try {
  //   chrome.runtime.sendMessage({ type: "SEND_LOG", data: log });
  // } catch (err) {
  //   console.warn("Extension 메시지 전송 실패:", err.message);
  // }
}

// 버튼인지 확인
function extractButtonAction(rawTarget) {
  const btn = rawTarget.closest("button, label");
  if (!btn) return null;
  // 우선 순위: visible text → aria-label → title → data-button-name
  return (
    btn.innerText?.trim() ||
    btn.textContent?.trim() ||
    btn.getAttribute("aria-label")?.trim() ||
    btn.getAttribute("title")?.trim() ||
    btn.dataset.buttonName?.trim() || // data-button-name
    null
  );
}
window.extractButtonAction = extractButtonAction;
