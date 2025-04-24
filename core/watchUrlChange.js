/**
 * url 변경 감지를 한다.
 *
 */

function watchUrlChange(onUrlChange) {
  let previousUrl = location.href;
  // DOM 변경 감지로 URL 변경 탐지
  const observer = new MutationObserver(() => {
    if (location.href !== previousUrl) {
      previousUrl = location.href;
      console.log("URL 변경됨:", location.href);
      onUrlChange?.(location.href); //콜백함수 등록
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // history.pushState/replaceState 후킹
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function (...args) {
    originalPushState.apply(this, args);
    if (location.href !== previousUrl) {
      previousUrl = location.href;
      console.log("URL 변경됨 (pushState):", location.href);
    }
  };

  history.replaceState = function (...args) {
    originalReplaceState.apply(this, args);
    if (location.href !== previousUrl) {
      previousUrl = location.href;
      console.log("URL 변경됨 (replaceState):", location.href);
    }
  };
}
window.watchUrlChange = watchUrlChange;
