const CoupangSearchHandler = (() => {
  // 페이지 로깅 객체 생성: 검색 페이지의 로그 정보를 기록할 객체
  const PageLog = createSearchLog();

  // 필터링 정보 추출 함수
  function extractDetails() {
    // 검색 결과 페이지에서 필터링 항목들을 선택 (검색 필터 리스트 항목들)
    const filterEl = document.querySelectorAll("ul.search-filter-list li a");

    // 필터링 항목이 하나라도 있으면, 그 정보를 추출
    if (filterEl.length > 0) {
      // 필터링 항목들의 텍스트를 배열로 변환하고, 빈 값은 제외
      const details = Array.from(filterEl)
        .map((el) => el.innerText.trim()) // 항목의 텍스트 내용 추출
        .filter(Boolean); // 빈 문자열 제거
      PageLog.details = details; // PageLog 객체에 필터링 정보 저장
    }
  }

  // 검색창에서 입력된 텍스트 추출 함수
  function extractInfo() {
    // 쿠팡 검색창을 선택 (input[name="q"] 형태로 선택)
    const searchInputEl = document.querySelector('input[name="q"]');

    // 검색창에서 입력된 텍스트를 추출하고, 입력값이 없으면 null 반환
    const searchText = searchInputEl?.value || null;

    // 추출된 검색 텍스트를 PageLog 객체에 저장
    PageLog.searchText = searchText;
  }

  // 클릭 이벤트에 대한 행동 처리 함수
  function handleClickActions(rawTarget) {
    // 클릭한 버튼 또는 요소에 대한 액션을 추출 (extractButtonAction 함수 사용)
    const action = extractButtonAction(rawTarget);

    // 액션이 있으면, 클릭 로그를 생성하고 저장
    if (action) {
      const clickLog = createClickLog(); // 클릭 로그 객체 생성
      clickLog.action = action; // 액션을 로그에 저장
      PageLog.clickTracking.push(clickLog); // 클릭 로그 배열에 추가
    }
  }

  // 페이지 로드 시 필요한 정보 추출을 위한 함수
  function PageLoad() {
    setTimeout(() => {
      // 페이지가 렌더링된 후 2초 뒤에 정보 추출 시작
      extractInfo(); // 검색창의 텍스트 정보 추출
      extractDetails(); // 필터링 항목 정보 추출
    }, 2000); // 2초 후 정보 추출
  }

  // 클릭 이벤트 리스너 등록 함수
  function click() {
    window.addEventListener("click", (e) => {
      const rawTarget = e.target; // 클릭된 요소를 가져옴
      handleClickActions(rawTarget); // 클릭된 요소에 대한 액션 처리
      sendToServer(PageLog); // 처리된 로그를 서버로 전송
    });
  }

  // 초기화 함수
  function init() {
    PageLoad(); // 페이지 로드 시 정보 추출 시작
    click(); // 클릭 이벤트 추적 시작

    // URL이 변경될 때마다 정보 추출 및 로그 전송
    watchUrlChange((newUrl) => {
      PageLoad(newUrl); // 새로운 URL에 대한 정보 추출
      sendToServer(PageLog); // 로그 서버로 전송
      PageLog.clickTracking = [];
    });

    // 페이지를 떠날 때 마지막 로그를 서버로 전송
    window.addEventListener("beforeunload", () => {
      sendToServer(PageLog); // 페이지 종료 전에 로그 전송
    });
  }

  // 외부에서 init 함수를 호출할 수 있게 반환
  return {
    init, // 초기화 함수 반환
  };
})();
