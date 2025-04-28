const MusinsaCartHandler = (() => {
  // 초기화: 장바구니 페이지 로그 객체 생성
  const PageLog = createCarthLog();

  // 할인 가격 추출 함수
  function getDiscountPrice(el) {
    // 할인된 가격이 들어 있는 <span> 요소를 선택
    const salePriceEl = el.querySelector(
      'span[class="cart-goods__sale-price__price rolling-number"]'
    );
    if (!salePriceEl) return 0;

    // 숫자들이 rolling-number 구조로 분리되어 있어서 각 숫자를 추출
    const digitEls = salePriceEl.querySelectorAll(".rolling-unit-wrapper");
    const price = Array.from(digitEls)
      .map((el) => el.getAttribute("data-from"))
      .filter((d) => d && !d.includes(",")) // 쉼표 제외
      .join("");
    const discountedPrice = parseInt(price, 10);
    return isNaN(discountedPrice) ? 0 : discountedPrice;
  }

  // 장바구니 상품 정보 추출 함수
  function extractInfo() {
    // 장바구니 내 각 상품 정보가 들어 있는 박스
    const cartGoodsEl = document.querySelectorAll(
      'div[class="cart-goods__info"]'
    );

    cartGoodsEl.forEach((el) => {
      // 상품명을 포함하는 영역
      const goods = el.querySelector(
        'div[class="cart-goods__name gtm-select-item"]'
      );

      const productDetails = {
        // 상품 고유 ID
        id: goods.getAttribute("data-item-id"),
        // 상품 이름
        name: goods.getAttribute("data-item-name"),
        // 정상가
        price: parseInt(goods.getAttribute("data-price")),
        // 할인된 가격 (함수로 추출)
        discountPrice: getDiscountPrice(el),
        // 수량
        quantity: parseInt(goods.getAttribute("data-quantity")),
        // 카테고리 정보 (ex. 상의|티셔츠 등)
        category: goods.getAttribute("data-item-category")?.split("|") || [],
        // 브랜드명
        brand: goods.getAttribute("data-item-brand"),
        // 시즌 정보 (ex. S/S|2024 등)
        season: goods.getAttribute("data-item-season")?.split("|") || [],
      };

      // 페이지 로그에 상품 정보를 추가
      PageLog.cart.push(productDetails);
    });
  }

  // 필요시 추가적인 정보 추출용 함수 (현재 비어 있음)
  function extractDetails() {}

  // 클릭한 요소에 따라 어떤 행동인지 분류하는 함수
  function handleClickActions(rawTarget) {
    let action;

    // 태그 이름이나 class 등에 따라 분기 가능 (여기선 생략)
    if (0) {
      // 조건 없음
    } else {
      // 클릭한 버튼의 액션 이름 추출 (ex. '구매하기', '삭제하기' 등)
      action = extractButtonAction(rawTarget);
    }

    // 행동이 있다면 클릭 로그로 저장
    if (action) {
      const clickLog = createClickLog();
      clickLog.action = action;
      PageLog.clickTracking.push(clickLog);
    }
  }

  // 클릭 이벤트 핸들러 등록
  function click() {
    document.addEventListener("click", (e) => {
      const rawTarget = e.target;

      console.log(rawTarget); // 클릭한 요소 디버깅
      logParentHierarchy(rawTarget); // 클릭 요소의 부모 트리 디버깅
      handleClickActions(rawTarget); // 행동 추출 및 기록
      // sendToServer(PageLog); // 서버로 로그 전송
    });
  }

  // 페이지 로드 시 정보 추출
  function pageLoad() {
    // DOM이 다 그려질 때까지 2초 대기
    setTimeout(() => {
      extractInfo(); // 상품 정보 수집
    }, 2000);
  }

  // 초기화 함수
  function init() {
    click(); // 클릭 추적 시작
    pageLoad(); // 장바구니 상품 추출

    // 페이지를 떠날 때 마지막 로그 전송
    window.addEventListener("beforeunload", () => {
      sendToServer(PageLog);
    });

    // SPA에서 URL이 바뀌면 다시 정보 추출
    watchUrlChange(() => {
      pageLoad();
      sendToServer(PageLog);
      PageLog.clickTracking = [];
    });
  }

  // 외부에서 호출할 수 있게 init 반환
  return {
    init,
  };
})();
