const MusinsaProductHandler = (() => {
  // 초기화
  const PageLog = createProductLog();

  function extractInfo() {
    // 페이지의 메인 정보를 담는다.
    const priceEl = document.querySelector(
      'span[class*="text-title_18px_semi sc-1hw5bl8-7"]'
    );
    const nameEl = document.querySelector('div[class*="sc-1omefes-0"]');
    const categoryLinks = document.querySelectorAll("a[data-category-name]");
    const categoryNames = Array.from(categoryLinks).map(
      (el) => el.dataset.categoryName
    );

    if (priceEl && nameEl) {
      const priceText = priceEl.innerText.replace(/[^0-9]/g, ""); // 정규화
      const productName = nameEl.innerText.trim();
      PageLog.productName = productName;
      PageLog.price = Number(priceText);
      PageLog.category = categoryNames;
    }
  }

  function extractDetails() {
    // 여러 추가 정보를 담는다.
    document.querySelectorAll('div[class*="sc-2ll6b5-1"]').forEach((row) => {
      // 디테일을 담을 테그 선택
      const label = row.querySelector("dt")?.innerText.trim();
      const value = row.querySelector("dd")?.innerText.trim();
      if (label === "성별" || label === "시즌") {
        // 디테일중 성별과 시즌만 구분
        PageLog.details.push(value);
      }
    });
  }

  function detectLikeState() {
    //페이지 로드시 좋아요 상태를 담는다.
    const likeEL = document.querySelector("#root svg path");
    if (
      likeEL?.classList.contains("stroke-red") &&
      likeEL.classList.contains("fill-red")
    ) {
      PageLog.like = true;
    } else {
      PageLog.like = false;
    }
  }

  function handleLikeClick(rawTarget) {
    // 좋아요 상태 핸들링
    // 좋아요를 누르면 like : true로 변환
    const svgEl = rawTarget.closest("svg");
    const wrapperDiv = svgEl?.closest("div");
    const isLikeWrapper = wrapperDiv?.className.trim() === "inline-flex";

    if (svgEl && isLikeWrapper) {
      const pathEl = svgEl.querySelector("path");
      const classList = pathEl?.classList;

      if (classList?.contains("stroke-red") && classList.contains("fill-red")) {
        PageLog.like = false;
      } else if (
        classList?.contains("stroke-black") &&
        !classList.contains("fill-red")
      ) {
        PageLog.like = true;
      }
    }
  }

  function handleClickActions(rawTarget) {
    // 클릭의 행동 분류
    // 테그 이름으로 분류한다.
    if (rawTarget.closest('button[data-button-name="장바구니담기"]')) {
      action = "장바구니";
    } else if (rawTarget.closest('button[data-button-name="구매하기"]')) {
      action = "구매";
    } else if (rawTarget.closest('button[data-button-name="상품정보접기"]')) {
      action = "상품정보더보기";
    } else if (rawTarget.closest('div[data-button-id="select_optionvalue"]')) {
      action = `사이즈-${
        rawTarget.closest('div[data-button-id="select_optionvalue"]')
          .textContent
      }`;
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

      console.log(rawTarget); // 디버깅용 - 클릭한 테그 보여줌
      logParentHierarchy(rawTarget); // 디버깅용 - 조상 테그까지 보여줌

      // 여러 핸들린 조작
      handleLikeClick(rawTarget); // 좋아요 핸들링
      handleClickActions(rawTarget); // 클릭 핸들링

      // sendToServer(PageLog); // 서버로 전송
    });
  }

  function pageLoad() {
    // 페이지 로드
    setTimeout(() => {
      // DOM 구성까지 사간을 기다림
      extractInfo();
      extractDetails();
      detectLikeState();
    }, 2000);
  }

  //메인 진입점
  function init() {
    pageLoad(); // 페이지 로드
    click(); // 클릭 이벤트

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
