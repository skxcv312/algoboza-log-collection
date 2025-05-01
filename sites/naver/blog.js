const NaverBlogHandler = (() => {
    let PageLog = createBlogLog();

    function createBlogLog() {
        return {
            type: "naver_blog",
            url: window.location.href,
            timestamp: getLocalTime(),
            title: null,  // 네이버 블로그에서 제목을 추출
            searchText: null,
            blogTitle: null,  // 블로그 주인 작성 제목
            blogAuthor: null,
            blogContent: null,
            categories: [],
            tags: [],
            clickTracking: [],
        };
    }

    function createClickLog() {
        return {
            timestamp: getLocalTime(),
            action: null,
        };
    }

    // 네이버 블로그 주인이 작성한 제목 추출 함수
    function extractBlogTitle() {
        const titleElement = document.querySelector('head > title');
        if (titleElement) {
            return titleElement.innerText.trim();
        }

        const altTitleElement = document.querySelector('.se-module.se-text.se-title-text');
        if (altTitleElement) {
            return altTitleElement.innerText.trim();
        }

        return null;
    }

    // 검색어 추출 함수
    function extractSearchInfo() {
        if (window.location.href.includes('search.naver.com')) {
            const searchInput = document.querySelector('#nx_query');
            if (searchInput) {
                PageLog.searchText = searchInput.value;
            }
        }
    }

    // 블로그 페이지에서 정보 추출 함수
    function extractBlogInfo() {
        if (window.location.href.includes('blog.naver.com')) {
            PageLog.blogTitle = extractBlogTitle();

            const authorElement = document.querySelector('.nick') || document.querySelector('.blogId');
            if (authorElement) {
                PageLog.blogAuthor = authorElement.innerText.trim();
            }

            const contentElement = document.querySelector('.se-main-container') ||
                document.querySelector('.post-view') ||
                document.querySelector('#postViewArea');
            if (contentElement) {
                PageLog.blogContent = contentElement.innerText.trim().substring(0, 200) + '...';
            }

            const categoryElements = document.querySelectorAll('.category-name') ||
                document.querySelectorAll('.cate_list li a');
            if (categoryElements.length > 0) {
                PageLog.categories = Array.from(categoryElements)
                    .map(el => el.innerText.trim())
                    .filter(Boolean);
            }

            const tagElements = document.querySelectorAll('.item_tag') ||
                document.querySelectorAll('.tag_list li a');
            if (tagElements.length > 0) {
                PageLog.tags = Array.from(tagElements)
                    .map(el => el.innerText.trim().replace('#', ''))
                    .filter(Boolean);
            }
        }
    }

    // 클릭 추적 함수
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
    }

    // 페이지 로드 후 추출 함수
    function pageLoad() {
        setTimeout(() => {
            extractSearchInfo();
            extractBlogInfo();

            // 빈 값 또는 비어있는 리스트를 제외한 로그 출력
            const filteredLog = JSON.parse(JSON.stringify(PageLog)); // 깊은 복사

            Object.keys(filteredLog).forEach(key => {
                if (
                    filteredLog[key] === null || // null 값
                    (Array.isArray(filteredLog[key]) && filteredLog[key].length === 0) // 빈 배열
                ) {
                    delete filteredLog[key]; // 빈 값 또는 배열은 삭제
                }
            });

            console.log('네이버 블로그 페이지 로그:', filteredLog); // 필터링된 로그만 출력
        }, 2000);
    }

    // 클릭 이벤트 리스너
    function click() {
        document.addEventListener('click', (e) => {
            const rawTarget = e.target;
            handleClickActions(rawTarget);
            sendToServer(PageLog);
        });
    }

    // 초기화 함수
    function init() {
        pageLoad();
        click();

        // URL 변경 감지
        watchUrlChange((newUrl) => {
            PageLog = createBlogLog();
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
window.NaverBlogHandler = NaverBlogHandler;
