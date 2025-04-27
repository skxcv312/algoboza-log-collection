const CoupangProductHandler = (() => {
    // 초기화
    const PageLog = createProductLog();

    function extractInfo() {
        // 페이지의 메인 정보를 담는다.
        const priceEl = document.querySelector('span.total-price'); // 가격
        const nameEl = document.querySelector('h1.prod-buy-header__title'); // 상품명
        const categoryLinks = document.querySelectorAll('.breadcrumb li a'); // 카테고리 경로
        const categoryNames = Array.from(categoryLinks).map((el) => el.innerText.trim()); // 카테고리 이름만 추출
    
        if (priceEl && nameEl) {
            const priceText = priceEl.innerText.replace(/[^0-9]/g, ""); // 가격 숫자만 추출
            const productName = nameEl.innerText.trim(); // 상품명 추출
    
            PageLog.productName = productName;
            PageLog.price = Number(priceText);
            PageLog.category = categoryNames;
        }
    }
    

    function extractDetails() {
        // 여러 추가 정보를 담는다.
        const descriptionEls = document.querySelectorAll('div.prod-description');  // 모든 디테일을 선택
        
        // 각 디테일을 순회하며 텍스트를 로그에 저장
        descriptionEls.forEach((descriptionEl) => {
            const descriptionText = descriptionEl.innerText.trim();
            if (descriptionText) {
                PageLog.details.push(descriptionText); // 디테일이 있을 경우 로그에 추가
            }
        });
    }
    
    

    function detectLikeState() {
        // 페이지 로드시 좋아요 상태를 담는다.
        const likeEl = document.querySelector('button.prod-favorite-btn');
        if (likeEl?.classList.contains('on')) {
            PageLog.like = true;
        } else {
            PageLog.like = false;
        }
    }
    

    function handleLikeClick(rawTarget) {
        // 좋아요 상태 핸들링 (쿠팡 버전)
        const likeButton = rawTarget.closest('button.prod-favorite-btn');
        if (likeButton) {
            // 좋아요 상태 토글: 현재 상태를 반전시킴
            const isLiked = likeButton.classList.contains('prod-favorite-on');
    
            if (isLiked) {
                // 이미 좋아요 눌린 상태 ➔ 좋아요 해제
                likeButton.classList.remove('prod-favorite-on');
                PageLog.like = false; // 로그에 해제 상태 기록
            } else {
                // 아직 안 눌린 상태 ➔ 좋아요 추가
                likeButton.classList.add('prod-favorite-on');
                PageLog.like = true; // 로그에 좋아요 상태 기록
            }
        }
    }
    

    function handleClickActions(rawTarget) {
        let action = null; // action 변수 선언
    
        if (rawTarget.closest('button.prod-cart-btn')) {
            action = "장바구니";
        } else if (rawTarget.closest('button.prod-buy-btn')) {
            action = "구매";
        } else if (rawTarget.closest('button.prod-favorite-btn')) {
            action = "좋아요";
        } else if (rawTarget.closest('div.prod-option__item')) {
            action = `옵션-${rawTarget.closest('div.prod-option__item').innerText.trim()}`;
        } else {
            action = extractButtonAction(rawTarget); // 기타 클릭
        }
    
        if (action) {
            const clickLog = createClickLog(); // 클릭 로그 생성
            clickLog.action = action; // 행동 기록
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

            sendToServer(PageLog); // 서버로 전송
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
