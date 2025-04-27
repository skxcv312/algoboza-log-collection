/**
 * 기본 양식이 되는 파일
 */

const defaultHandler = (() => {
  // 초기화
  const PageLog = createLog();

  function extractInfo() {
    // 페이지의 메인 정보를 담는다.
  }

  function extractDetails() {
    // 여러 추가 정보를 담는다.
  }

  function handleClickActions(rawTarget) {
    // 클릭의 행동 분류
    // 테그 이름으로 분류한다.
    if (0) {
      // 분기점이 없으면 if-else 지워도 됨
    } else {
      action = extractButtonAction(rawTarget); // 나머지 모든 버튼을 가리킨다.
    }
    if (action) {
      const clickLog = createClickLog(); // 클릭 로그 생성
      clickLog.action = action; // log에 행동 저장
      PageLog.clickTracking.push(clickLog);
    }
  }

  function click() {
    document.addEventListener("click", (e) => {
      const rawTarget = e.target;

      console.log(rawTarget); // 디버깅용 - 클릭한 태그 보여줌
      logParentHierarchy(rawTarget); // 디버깅용 - 조상 태그까지 보여줌
      handleClickActions(rawTarget); // 클릭 핸들링
      sendToServer(PageLog); // 서버로 전송
    });
  }

  function pageLoad() {
    // 페이지 로드
    setTimeout(() => {
      // DOM 구성까지 사간을 기다림
      extractInfo();
      extractDetails();
    }, 2000);
  }
  function init() {
    //메인 진입점
    pageLoad();
    click();

    // url 변경 감지
    watchUrlChange(() => {
      pageLoad();
      sendToServer(PageLog); // 서버로 전송
    });
    // 탭 새로고침, 종료등 이벤트 발생시 실행
    window.addEventListener("beforeunload", () => {
      sendToServer(PageLog); // 서버로 전송
    });
  }

  // 외부에 노출
  return {
    init,
  };
})();
