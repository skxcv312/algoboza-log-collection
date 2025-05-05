const CoupangProductHandler = (() => {
    const PageLog = createProductLog();
    let hasSentLog = false; // ✅ 중복 전송 방지 플래그

    function getCategory() {
        const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
        let breadcrumbArray = [];

        jsonLdScripts.forEach((script) => {
            try {
                const data = JSON.parse(script.innerText);
                if (data["@type"] === "BreadcrumbList" && Array.isArray(data.itemListElement)) {
                    breadcrumbArray = data.itemListElement.map((item) => ({ name: item.name }));
                }
            } catch (e) {
                console.error("JSON 파싱 실패:", e);
            }
        });
        return breadcrumbArray;
    }

    function extractInfo() {
        const priceEl = document.querySelector("span.total-price");
        const nameEl = document.querySelector("h1.prod-buy-header__title");
        const categoryNames = getCategory();

        if (priceEl && nameEl) {
            const priceText = priceEl.innerText.replace(/[^0-9]/g, "");
            const productName = nameEl.innerText.trim();

            PageLog.productName = productName;
            PageLog.price = Number(priceText);
            PageLog.category = categoryNames;
        }
    }

    function extractDetails() {
        const descriptionEls = document.querySelectorAll("div.prod-description");

        descriptionEls.forEach((el) => {
            let text = el.innerText.trim();
            if (text) {
                text = text.replace(/\n+/g, ' ');
                PageLog.details.push(text);
            }
        });
    }

    function detectLikeState() {
        const likeEl = document.querySelector("button.prod-favorite-btn");
        PageLog.like = likeEl?.classList.contains("on") ?? false;
    }

    function handleLikeClick(rawTarget) {
        const likeButton = rawTarget.closest("button.prod-favorite-btn");
        if (likeButton) {
            const isLiked = likeButton.classList.contains("prod-favorite-on");
            if (isLiked) {
                likeButton.classList.remove("prod-favorite-on");
                PageLog.like = false;
            } else {
                likeButton.classList.add("prod-favorite-on");
                PageLog.like = true;
            }
        }
    }

    function handleClickActions(rawTarget) {
        let action = null;

        if (rawTarget.closest("button.prod-cart-btn")) {
            action = "장바구니";
        } else if (rawTarget.closest("button.prod-buy-btn")) {
            action = "구매";
        } else if (rawTarget.closest("button.prod-favorite-btn")) {
            action = "좋아요";
        } else if (rawTarget.closest("div.prod-option__item")) {
            action = `옵션-${rawTarget.closest("div.prod-option__item").innerText.trim()}`;
        } else {
            action = extractButtonAction(rawTarget);
        }

        if (action) {
            const clickLog = createClickLog();
            clickLog.action = action;
            PageLog.clickTracking.push(clickLog);
        }
    }

    function click() {
        document.addEventListener("click", (e) => {
            const rawTarget = e.target;
            handleLikeClick(rawTarget);
            handleClickActions(rawTarget);
        });
    }

    function pageLoad() {
        setTimeout(() => {
            extractInfo();
            extractDetails();
            detectLikeState();
            // ❌ 여기서는 sendToServer를 호출하지 않음
        }, 2000);
    }
    
    window.addEventListener("beforeunload", () => {
        if (!hasSentLog && PageLog.productName && PageLog.price && PageLog.category.length > 0) {
            sendToServer(PageLog);
            hasSentLog = true;
        }
    });
    

    function init() {
        pageLoad(); // 최초 진입 시 한 번만 전송
        click();

        watchUrlChange(() => {
            hasSentLog = false; // ✅ 새 URL 진입 시 전송 허용
            PageLog.clickTracking = []; // 클릭 로그 초기화
            pageLoad(); // 다시 로드하고 조건 만족 시 1번 전송
        });

        window.addEventListener("beforeunload", () => {
            if (!hasSentLog && PageLog.productName && PageLog.price && PageLog.category.length > 0) {
                sendToServer(PageLog);
                hasSentLog = true;
            }
        });
    }

    return {
        init,
    };
})();
