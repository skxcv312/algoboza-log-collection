const NaverPlaceLogger = (() => {
    let previousUrl = '';

    function createPageLog(type) {
        return {
            type,
            url: window.location.href,
            timestamp: new Date().toISOString(),
            title: document.title,
            placeName: null,
            placeCategory: null,
            placeAddress: null,
            placePhone: null,
            searchKeyword: null,
        };
    }

    function extractSearchKeyword() {
        const match = decodeURIComponent(window.location.href).match(/search\/([^/?]+)/);
        if (match) {
            const keyword = match[1];
            const searchLog = createPageLog('naver_place_search');
            searchLog.searchKeyword = keyword;
            console.log('🔍 검색 로그:', searchLog);
        }
    }

    function extractPlaceInfoWithPolling(timeout = 5000, interval = 300) {
        const start = Date.now();
        const timer = setInterval(() => {
            const nameEl = document.querySelector('.GHAhO');
            const categoryEl = document.querySelector('.lnJFt');
            const addressEl = document.querySelector('.LDgIH');
            const phoneEl = document.querySelector('.xlx7Q');

            if (nameEl && categoryEl && addressEl && phoneEl) {
                clearInterval(timer);
                const placeLog = {
                    type: 'naver_place_detail',
                    url: window.location.href,
                    timestamp: new Date().toISOString(),
                    title: document.title,
                    placeName: nameEl.innerText.trim(),
                    placeCategory: categoryEl.innerText.trim(),
                    placeAddress: addressEl.innerText.trim(),
                    placePhone: phoneEl.innerText.trim()
                };
                console.log('📍 장소 상세 로그:', placeLog);
            } else {
                const elapsed = Date.now() - start;
                if (elapsed >= timeout) {
                    clearInterval(timer);
                    console.warn('❌ 장소 정보 추출 실패: 시간 초과');
                } else {
                    console.log('⏳ 장소 정보 로딩 중...');
                }
            }
        }, interval);
    }

    function observeUrlChange() {
        const observer = new MutationObserver(() => {
            const currentUrl = window.location.href;
            if (currentUrl !== previousUrl) {
                previousUrl = currentUrl;

                if (currentUrl.includes('/place/')) {
                    extractPlaceInfoWithPolling();
                } else if (currentUrl.includes('/search/')) {
                    extractSearchKeyword();
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }

    function init() {
        previousUrl = window.location.href;
        observeUrlChange();

        setTimeout(() => {
            if (window.location.href.includes('/place/')) {
                extractPlaceInfoWithPolling();
            } else if (window.location.href.includes('/search/')) {
                extractSearchKeyword();
            }
        }, 1500);
    }

    return { init };
})();

window.NaverPlaceLogger = NaverPlaceLogger;
NaverPlaceLogger.init();
