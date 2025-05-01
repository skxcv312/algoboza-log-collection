const NaverCafeHandler = (() => {
    let PageLog = createCafeLog();

    function createCafeLog() {
        return {
            type: "naver_cafe",
            url: window.location.href,
            timestamp: getLocalTime(),
            title: null,
            searchText: null,
            cafeTitle: null,
            cafeName: null,
            postTitle: null,
            postContent: null,
            categories: [],
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
        // 네이버 검색 페이지에서 검색어 추출
        if (window.location.href.includes('search.naver.com')) {
            const searchInput = document.querySelector('#nx_query');
            if (searchInput) {
                PageLog.searchText = searchInput.value;
                console.log('검색어:', PageLog.searchText);
            }
        }
    }

    function extractCafeInfo() {
        const iframe = document.getElementById('cafe_main');
        if (!iframe) return;
    
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    
        const postTitleElem = iframeDoc.querySelector('.title_text');
        const postContentElem = iframeDoc.querySelector('.se-main-container, .ContentRenderer');
    
        if (postTitleElem) PageLog.postTitle = postTitleElem.innerText.trim();
    
        if (postContentElem) {
            let rawContent = postContentElem.innerText;
    
            // ✅ 불필요한 줄바꿈, 탭 제거 + 다중 공백 하나로 + 앞뒤 trim
            const cleanedContent = rawContent
                .replace(/\s+/g, ' ')  // 여러 공백/줄바꿈/탭 → 하나의 공백
                .trim();
    
            PageLog.postContent = cleanedContent;
        }
    }
    

    function handleClickActions(rawTarget) {
        // 클릭한 요소의 액션 추출
        const action = extractButtonAction(rawTarget);

        if (action) {
            const clickLog = createClickLog();
            clickLog.action = action;
            PageLog.clickTracking.push(clickLog);
        }

        // 링크 클릭 처리
        const linkElement = rawTarget.closest('a');
        if (linkElement) {
            const clickLog = createClickLog();
            clickLog.action = '링크 클릭: ' + (linkElement.innerText.trim() || linkElement.href);
            PageLog.clickTracking.push(clickLog);
        }
    }

    function pageLoad() {
        return new Promise((resolve) => {
            setTimeout(() => {
                extractSearchInfo();
                extractCafeInfo();
    
                // 빈 값 또는 비어있는 리스트를 제외한 로그 정리
                const filteredLog = JSON.parse(JSON.stringify(PageLog));
                Object.keys(filteredLog).forEach(key => {
                    if (
                        filteredLog[key] === null ||
                        (Array.isArray(filteredLog[key]) && filteredLog[key].length === 0)
                    ) {
                        delete filteredLog[key];
                    }
                });
    
                resolve(filteredLog);
            }, 2000);
        });
    }
    

    function click() {
        document.addEventListener('click', (e) => {
            const rawTarget = e.target;

            console.log('클릭한 요소:', rawTarget); // 디버깅용
            logParentHierarchy(rawTarget); // 디버깅용 - 상위 요소 계층 표시

            handleClickActions(rawTarget);
            sendToServer(PageLog);
        });
    }


    function init() {
        pageLoad().then(filteredLog => {
            console.log('네이버 카페 페이지 로그:', filteredLog);  // 초기 로딩 때만 출력
        });
        click();

        // URL 변경 감지
        watchUrlChange((newUrl) => {
            PageLog = createCafeLog();
            pageLoad();
            sendToServer(PageLog);
        });

        // 페이지 떠날 때 로그 전송
        window.addEventListener('beforeunload', () => {
            sendToServer(PageLog);
        });
    }
    return {
        init,
    };
})();

// 글로벌 스코프에 노출
window.NaverCafeHandler = NaverCafeHandler;
