const NaverPlaceHandler = (() => {
  var pageLog; // 페이지 로그
  var pathParts; //url 정보

  function createPageLog() {
    return {
      type: "naver_place",
      url: window.location.href,
      timestamp: null,
      searchText: null,
      placeDtails: null,
    };
  }

  // 네이버 플레이스 API 호출을 위한 함수
  async function fetchPlaceInfo(placeName) {
    // background.js로 요청
    return chrome.runtime.sendMessage({
      type: "NAVER_PLACE_SEARCH",
      query: placeName,
    });
  }
  function splitCategory(category) {
    return category.split(">");
  }

  function getSearchText() {
    // "search"가 있는 인덱스를 찾고, 그 다음 segment를 검색어로 사용
    const searchIndex = pathParts.indexOf("search");
    if (searchIndex !== -1 && pathParts.length > searchIndex + 1) {
      const keyword = decodeURIComponent(pathParts[searchIndex + 1]);
      return keyword;
    }

    return null; // 찾을 수 없을 경우
  }

  async function getPlaceDetails() {
    if (!pathParts.includes("place")) {
      return null;
    }

    const pl = {
      name: null,
      category: null,
      address: null,
    };
    // URL에서 장소 이름 추출
    const title = document.title;
    const placeName = title.replace(/ - 네이버 지도$/, "").trim();
    // API 호출
    let apiData = await fetchPlaceInfo(placeName);

    // API 데이터에서 정보 추출
    if (apiData.items.length === 0) {
      console.log("정보 없음");
      return null;
    }
    detail = apiData.items.pop();
    pl.name = placeName;
    pl.address = detail.address;
    pl.category = splitCategory(detail.category);

    return pl;
  }

  // 새로운 API 기반 장소 정보 추출 함수
  async function extractPlaceInfo() {
    try {
      // 검색어 추출
      pageLog.searchText = getSearchText();
      pageLog.placeDtails = await getPlaceDetails();
    } catch (error) {
      console.error("장소 정보 추출 실패:", error);
    }
  }
  function pageLoad() {
    pathParts = window.location.pathname.split("/");
    pageLog = createPageLog();
    // 페이지 로드
    setTimeout(() => {
      // DOM 구성까지 사간을 기다림
      extractPlaceInfo();
    }, 2000);
  }

  function init() {
    //메인 진입점
    pageLoad();

    // url 변경 감지
    watchUrlChange(() => {
      sendToServer(pageLog); // 서버로 전송
      pageLoad();
    });
    // 탭 새로고침, 종료등 이벤트 발생시 실행
    window.addEventListener("beforeunload", () => {
      sendToServer(pageLog); // 서버로 전송
    });
  }

  return {
    init,
  };
})();
