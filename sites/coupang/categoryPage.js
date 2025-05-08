const CoupangCategoryHandler = (() => {
  // 페이지 로그 객체 생성 (카테고리 페이지 관련)
  const PageLog = createCategoryLog();
  var categoryId;

  // 카테고리 정보 추출 함수
  function getCategory() {
    // <script type="application/ld+json"> 태그를 찾는다

    const jsonLdScripts = document.querySelectorAll(
      'script[type="application/ld+json"]' // => 아마 처음에는 테그가 잘못 되었던걸로 보인다.
    );

    let breadcrumbArray = [];

    jsonLdScripts.forEach((script) => {
      try {
        const data = JSON.parse(script.innerText);

        if (
          data["@type"] === "BreadcrumbList" &&
          Array.isArray(data.itemListElement)
        ) {
          // itemListElement 배열을 저장
          breadcrumbArray = data.itemListElement
            .slice(2) // 카테고리중 2번째까지 삭제
            .map((item) => item.name);
        }
      } catch (e) {
        console.error("JSON 파싱 실패:", e);
      }
    });
    return breadcrumbArray; // breadcrumb가 없으면 빈 배열 반환
  }

  // 카테고리 상세 필터 정보 추출 함수
  function extractDetails() {
    // 쿠팡에서는 카테고리 필터 정보를 해당 필터 목록 영역에서 찾을 수 있음
    const filterEl = document.querySelectorAll(
      'li[class="search-option-item selected"]' // 쿠팡에서 필터 항목들을 담는 영역
    );
    console.log(filterEl);
    if (filterEl) {
      // 필터 항목들을 가져와서 텍스트를 배열로 저장
      PageLog.details = Array.from(filterEl)
        .filter((el) => !el.querySelector("#price0"))
        .map((el) => el.innerText.trim())
        .filter(Boolean); // 빈 값 제거
    }
  }

  // 카테고리 정보 추출
  function extractInfo(Url) {
    const url = new URL(Url);
    categoryId = url.pathname.split("/").pop(); // 카테고리 ID 추출 (URL에서 마지막 부분)

    // breadcrumb에서 카테고리 정보 추출하여 PageLog.category에 저장
    PageLog.category = getCategory();
  }

  // 클릭한 요소에 따른 행동을 분류하는 함수
  function handleClickActions(rawTarget) {
    let action;
    // 클릭한 요소가 버튼인지 여부와 버튼 액션을 추출
    action = extractButtonAction(rawTarget);
    if (action) {
      const clickLog = createClickLog();
      clickLog.action = action;
      PageLog.clickTracking.push(clickLog); // 클릭 액션 로그에 기록
    }
  }

  // 페이지 로드 시 정보 추출 (URL을 기반으로)
  function pageLoad(Url) {
    setTimeout(() => {
      extractInfo(Url); // URL에서 카테고리 정보 추출
      extractDetails(); // 카테고리 필터 정보 추출
    }, 2000); // DOM이 완전히 로드된 후 2초 대기
  }

  // 클릭 이벤트 핸들러 등록
  function click() {
    document.addEventListener("click", (e) => {
      const rawTarget = e.target;
      handleClickActions(rawTarget); // 클릭 액션 처리

      // sendToServer(PageLog); // 서버로 로그 전송
    });
  }

  // 초기화 함수
  function init() {
    pageLoad(window.location.href); // 페이지 로드 시 카테고리 정보 추출
    click(); // 클릭 추적 시작

    // URL이 변경되면 카테고리 정보를 다시 추출하여 서버로 전송
    watchUrlChange((newUrl) => {
      sendToServer(PageLog); // 기존 로그 전송
      pageLoad(newUrl); // 새로운 URL에 맞게 정보 추출
      PageLog.clickTracking = [];
    });

    // 페이지를 떠날 때 마지막 로그 전송
    window.addEventListener("beforeunload", () => {
      sendToServer(PageLog);
    });
  }

  // 외부에서 호출할 수 있게 init 반환
  return {
    init,
  };
})();
