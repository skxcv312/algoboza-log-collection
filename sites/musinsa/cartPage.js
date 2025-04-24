const MusinsaCartHandler = (() => {
  // 초기화
  const PageLog = createCarthLog();

  function getDiscountPrice(el) {
    const salePriceEl = el.querySelector(
      'span[class="cart-goods__sale-price__price rolling-number"]'
    );
    if (!salePriceEl) return 0;

    const digitEls = salePriceEl.querySelectorAll(".rolling-unit-wrapper");
    const price = Array.from(digitEls)
      .map((el) => el.getAttribute("data-from"))
      .filter((d) => d && !d.includes(","))
      .join("");
    const discountedPrice = parseInt(price, 10);
    return isNaN(discountedPrice) ? 0 : discountedPrice;
  }

  function extractInfo() {
    // 페이지의 메인 정보를 담는다.
    const cartGoodsEl = document.querySelectorAll(
      'div[class="cart-goods__info"]'
    );
    cartGoodsEl.forEach((el) => {
      goods = el.querySelector('div[class="cart-goods__name gtm-select-item"]');
      const productDetails = {
        id: goods.getAttribute("data-item-id"),
        name: goods.getAttribute("data-item-name"),
        price: parseInt(goods.getAttribute("data-price")),
        discountPrice: getDiscountPrice(el),
        quantity: parseInt(goods.getAttribute("data-quantity")),
        category: goods.getAttribute("data-item-category")?.split("|") || [],
        brand: goods.getAttribute("data-item-brand"),
        season: goods.getAttribute("data-item-season")?.split("|") || [],
      };

      PageLog.cart.push(productDetails);
    });
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
      //   sendToServer(PageLog); // 서버로 전송
    });
  }

  function pageLoad() {
    // 페이지 로드
    setTimeout(() => {
      // DOM 구성까지 사간을 기다림
      extractInfo();
    }, 2000);
  }

  function init() {
    //메인 진입점
    click();
    pageLoad();

    window.addEventListener("beforeunload", () => {
      sendToServer(PageLog);
    });

    watchUrlChange(() => {
      pageLoad();
      sendToServer(PageLog);
    });
  }

  // 외부에 노출
  return {
    init,
  };
})();
