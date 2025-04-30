/**
 * 네이버 블로그 페이지 로그 추적기
 * - 검색어 추적
 * - 블로그 제목 및 내용 추적
 * - 작성자, 카테고리, 태그 추적
 */

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
        // 페이지의 <h3> 태그에서 제목 추출 (주로 블로그 제목이 위치한 곳)
        const titleElement = document.querySelector('head > title');
        if (titleElement) {
            return titleElement.innerText.trim();  // 블로그 주인 작성 제목
        }

        // 대체 선택자로 추가
        const altTitleElement = document.querySelector('.se-module.se-text.se-title-text');
        if (altTitleElement) {
            return altTitleElement.innerText.trim();  // 대체 제목
        }

        return null;
    }

    // 검색어 추출 함수
    function extractSearchInfo() {
        if (window.location.href.includes('search.naver.com')) {
            const searchInput = document.querySelector('#nx_query');
            if (searchInput) {
                PageLog.searchText = searchInput.value;
                console.log('검색어:', PageLog.searchText);
            }
        }
    }

    // 블로그 페이지에서 정보 추출 함수
    function extractBlogInfo() {
        if (window.location.href.includes('blog.naver.com')) {
            // 블로그 제목 추출 (블로그 주인이 작성한 제목)
            PageLog.blogTitle = extractBlogTitle();

            // 블로그 작성자
            const authorElement = document.querySelector('.nick') || document.querySelector('.blogId');
            if (authorElement) {
                PageLog.blogAuthor = authorElement.innerText.trim();
            }

            // 블로그 내용 (간략하게 첫 부분만)
            const contentElement = document.querySelector('.se-main-container') ||
                document.querySelector('.post-view') ||
                document.querySelector('#postViewArea');
            if (contentElement) {
                // 내용의 첫 200자만 저장
                PageLog.blogContent = contentElement.innerText.trim().substring(0, 200) + '...';
            }

            // 카테고리 추출
            const categoryElements = document.querySelectorAll('.category-name') ||
                document.querySelectorAll('.cate_list li a');
            if (categoryElements.length > 0) {
                PageLog.categories = Array.from(categoryElements)
                    .map(el => el.innerText.trim())
                    .filter(Boolean);
            }

            // 태그 추출
            const tagElements = document.querySelectorAll('.item_tag') ||
                document.querySelectorAll('.tag_list li a');
            if (tagElements.length > 0) {
                PageLog.tags = Array.from(tagElements)
                    .map(el => el.innerText.trim().replace('#', ''))
                    .filter(Boolean);
            }

            console.log('블로그 정보:', PageLog);
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
            console.log('네이버 블로그 페이지 로그:', PageLog);
        }, 2000); // DOM 렌더링 후 정보 추출을 위한 딜레이
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
