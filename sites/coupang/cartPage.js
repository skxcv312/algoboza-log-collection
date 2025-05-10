const CoupangCartHandler = (() => {
    // 초기화: 장바구니 페이지 로그 객체 생성
    const PageLog = createCarthLog();

    // 할인 가격 추출 함수
    function getDiscountPrice(el) {
        // 할인된 가격이 들어 있는 <span> 요소를 선택 (쿠팡의 할인 가격 요소로 변경)
        const salePriceEl = el.querySelector(
            'span[class="cart-item__sale-price"]' // 쿠팡의 할인 가격 요소로 바꿈
        );
        if (!salePriceEl) return 0;

        // 숫자들이 분리되어 있지 않다면 바로 값을 추출
        const priceText = salePriceEl.innerText.replace(/[^0-9]/g, "");
        const discountedPrice = parseInt(priceText, 10);
        return isNaN(discountedPrice) ? 0 : discountedPrice;
    }

    function extractInfo() {
        const rows = document.querySelectorAll('#cartTable-sku tr');
    
        rows.forEach((row) => {
            try {
                const nameEl = row.querySelector('td.product-box .product-name-part a span');
                const priceEl = row.querySelector('div.unit-total-sale-price');
                const deliveryEl = row.querySelector('div.delivery-date-line span.arrive-date');
    
                if (!nameEl || !priceEl) return; // 상품 행이 아닌 경우 무시
    
                const productDetails = {
                    name: nameEl?.innerText.trim() || "상품명 없음",
                    discountPrice: priceEl ? parseInt(priceEl.innerText.replace(/[^0-9]/g, ""), 10) : 0,
                    delivery: deliveryEl?.innerText.trim() || "배송 정보 없음",
                };
    
                PageLog.cart.push(productDetails);
            } catch (e) {
                console.warn("상품 정보 파싱 중 오류 발생", e);
            }
        });
    
        console.log("장바구니 추출 결과:", PageLog.cart);
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
