/**
 * 네이버 카페 페이지 로그 추적기
 * - 검색어 추적
 * - 카페 게시글 제목 및 내용 추적
 */

const NaverCafeHandler = (() => {
    const PageLog = createCafeLog();

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
        // 카페 페이지에서 정보 추출
        if (window.location.href.includes('cafe.naver.com')) {
            // 카페 이름
            const cafeNameElement = document.querySelector('#cafe-info h2') ||
                document.querySelector('.cafe-name');
            if (cafeNameElement) {
                PageLog.cafeName = cafeNameElement.innerText.trim();
            }

            // iframe 내부의 게시글 내용이 있는지 확인
            const cafeMainFrame = document.getElementById('cafe_main');
            if (cafeMainFrame) {
                try {
                    const frameDoc = cafeMainFrame.contentDocument || cafeMainFrame.contentWindow.document;

                    // 게시글 제목
                    const postTitleElement = frameDoc.querySelector('.article_header h3') ||
                        frameDoc.querySelector('.tit-box strong') ||
                        frameDoc.querySelector('.title_text');
                    if (postTitleElement) {
                        PageLog.postTitle = postTitleElement.innerText.trim();
                    }

                    // 게시글 내용 (간략하게 첫 부분만)
                    const postContentElement = frameDoc.querySelector('.article_viewer') ||
                        frameDoc.querySelector('.ContentRenderer') ||
                        frameDoc.querySelector('#tbody');
                    if (postContentElement) {
                        // 내용의 첫 200자만 저장
                        PageLog.postContent = postContentElement.innerText.trim().substring(0, 200) + '...';
                    }

                    // 카테고리 추출
                    const categoryElements = frameDoc.querySelectorAll('.article_category') ||
                        frameDoc.querySelectorAll('.cafe-menu-list li a');
                    if (categoryElements.length > 0) {
                        PageLog.categories = Array.from(categoryElements)
                            .map(el => el.innerText.trim())
                            .filter(Boolean);
                    }
                } catch (e) {
                    console.error('iframe 접근 오류:', e);
                }
            } else {
                // iframe 없는 경우 직접 DOM에서 추출 시도
                const postTitleElement = document.querySelector('.article_header h3') ||
                    document.querySelector('.tit-box strong');
                if (postTitleElement) {
                    PageLog.postTitle = postTitleElement.innerText.trim();
                }

                const postContentElement = document.querySelector('.article_viewer') ||
                    document.querySelector('.ContentRenderer');
                if (postContentElement) {
                    PageLog.postContent = postContentElement.innerText.trim().substring(0, 200) + '...';
                }
            }

            console.log('카페 정보:', PageLog);
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
        setTimeout(() => {
            extractSearchInfo();
            extractCafeInfo();
            console.log('네이버 카페 페이지 로그:', PageLog);
        }, 2000); // DOM 렌더링 후 정보 추출을 위한 딜레이
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
        pageLoad();
        click();

        // URL 변경 감지
        watchUrlChange((newUrl) => {
            // URL이 변경되면 새로운 페이지 로그 생성
            PageLog = createCafeLog();
            pageLoad(newUrl);
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