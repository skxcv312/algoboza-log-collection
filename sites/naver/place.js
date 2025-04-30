/**
 * 네이버 플레이스(지도/장소) 페이지 로그 추적기
 */

const NaverPlaceHandler = (() => {
    let PageLog = createPlaceLog();

    function createPlaceLog() {
        return {
            type: "naver_place",
            url: window.location.href,
            timestamp: getLocalTime(),
            title: document.title,
            searchText: null,
            placeName: null,
            placeCategory: null,
            placeAddress: null,
            placeRating: null,
            placeDetails: {},
            clickTracking: [],
        };
    }

    function createClickLog() {
        return {
            timestamp: getLocalTime(),
            action: null,
        };
    }

    function extractSearchInfo() {
        const queryMatch = decodeURIComponent(window.location.href.match(/search\/([^/?#]+)/)?.[1] || '');
        if (queryMatch) {
            PageLog.searchText = queryMatch;
            console.log('지도 검색어:', PageLog.searchText);
        }
    }

    function extractPlaceInfo() {
        // 상호명
        const nameEl = document.querySelector('.GHAhO');
        if (nameEl) {
            PageLog.placeName = nameEl.innerText.trim();
        }

        // 카테고리
        const categoryEl = document.querySelector('.lnJFt');
        if (categoryEl) {
            PageLog.placeCategory = categoryEl.innerText.trim();
        }

        // 주소
        const addrEl = document.querySelector('[data-tab="location"] .LDgIH') || document.querySelector('.LDgIH');
        if (addrEl) {
            PageLog.placeAddress = addrEl.innerText.trim();
        }

        // 전화번호
        const phoneEl = document.querySelector('[data-tab="info"] .xlx7Q') || document.querySelector('.xlx7Q');
        if (phoneEl) {
            PageLog.placeDetails["전화번호"] = phoneEl.innerText.trim();
        }

        // 부가 정보 (ex. 영업시간, 휴무일 등)
        const detailLabels = document.querySelectorAll('.YzBgS');
        const detailValues = document.querySelectorAll('.qo7A2');

        detailLabels.forEach((labelEl, idx) => {
            const key = labelEl.innerText.trim().replace(/[:：]$/, '');
            const val = detailValues[idx]?.innerText.trim();
            if (key && val) {
                PageLog.placeDetails[key] = val;
            }
        });

        console.log("장소 정보:", PageLog);
    }

    function waitAndExtractPlaceInfo() {
        const observer = new MutationObserver(() => {
            const nameEl = document.querySelector('.GHAhO');
            if (nameEl) {
                observer.disconnect();
                extractPlaceInfo();
                console.log("네이버 장소 페이지 로그:", PageLog);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    function handleClickActions(rawTarget) {
        const action = extractButtonAction(rawTarget);
    
        if (action) {
            const clickLog = createClickLog();
            clickLog.action = action;
            PageLog.clickTracking.push(clickLog);
        }
    
        const linkElement = rawTarget.closest('a');
        if (linkElement) {
            const clickLog = createClickLog();
            clickLog.action = '링크 클릭: ' + (linkElement.innerText.trim() || linkElement.href);
            PageLog.clickTracking.push(clickLog);
        }
    
        const markerElement = rawTarget.closest('.marker') || rawTarget.closest('.Marker');
        if (markerElement) {
            const clickLog = createClickLog();
            clickLog.action = '장소 마커 클릭';
            PageLog.clickTracking.push(clickLog);
        }
    
        // ✅ [추가] 장소 제목을 클릭했을 때 바로 추출
        const isPlaceTitle = rawTarget.closest('a')?.querySelector('span.GHAhO');
        if (isPlaceTitle) {
            setTimeout(() => {
                extractPlaceInfo();         // 페이지에 뜨는 정보를 바로 추출
                console.log('클릭 시 즉시 추출된 장소 정보:', PageLog);
                sendToServer(PageLog);      // 서버에 전송
            }, 300); // DOM 렌더링 시간 약간 보장
        }
    }
    
    function pageLoad() {
        extractSearchInfo();
        waitAndExtractPlaceInfo();
    }

    function click() {
        document.addEventListener('click', (e) => {
            const rawTarget = e.target;
            console.log('클릭한 요소:', rawTarget);
            logParentHierarchy(rawTarget);

            handleClickActions(rawTarget);
            sendToServer(PageLog);
        });
    }

    function init() {
        pageLoad();
        click();

        watchUrlChange((newUrl) => {
            PageLog = createPlaceLog();
            pageLoad();
            sendToServer(PageLog);
        });

        window.addEventListener('beforeunload', () => {
            sendToServer(PageLog);
        });
    }

    return { init };
})();

window.NaverPlaceHandler = NaverPlaceHandler;
