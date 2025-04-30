/**
 * 네이버 쇼핑 페이지 로그 추적기 (간결 버전)
 * - 검색어 추적
 * - 필터 및 상품 정보 추적
 */

const NaverShoppingHandler = (() => {
    let PageLog = createShoppingLog();

    function createShoppingLog() {
        return {
            type: "naver_shopping",
            url: window.location.href,
            timestamp: getLocalTime(),
            title: document.title,
            searchText: null,
            productName: null,
            productPrice: null,
            filters: [],
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
        if (window.location.href.includes('search.naver.com') || window.location.href.includes('search.shopping.naver.com')) {
            const searchInput = document.querySelector('#nx_query') || document.querySelector('#searchInput');
            if (searchInput) {
                PageLog.searchText = searchInput.value;
                console.log('검색어:', PageLog.searchText);
            }
        }
    }

    function extractShoppingInfo() {
        const url = window.location.href;

        // 검색 결과 페이지 필터 추출
        if (url.includes('search.shopping.naver.com')) {
            const filterEls = document.querySelectorAll('.filter_area .filter_item, .filter_opt_area .opt_item');
            if (filterEls.length > 0) {
                PageLog.filters = Array.from(filterEls)
                    .map(el => el.innerText.trim())
                    .filter(Boolean);
            }
        }

        // 상품 상세 페이지
        const isDetailPage = /\/products\/\d+/.test(window.location.pathname) || /\/catalog\/\d+/.test(window.location.pathname);
        if (isDetailPage) {
            const nameEl = document.querySelector('.product_title, .top_summary_title, h2.product_name');
            PageLog.productName = nameEl?.innerText.trim() || null;

            const priceEl = document.querySelector('.product_price, .price_num, .lowest_price');
            PageLog.productPrice = priceEl?.innerText.trim() || null;
        }
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

        const productElement = rawTarget.closest('.product_item, .product_card');
        if (productElement) {
            const productName = productElement.querySelector('.product_name, .product_title')?.innerText || '상품 항목';
            const clickLog = createClickLog();
            clickLog.action = '상품 클릭: ' + productName;
            PageLog.clickTracking.push(clickLog);
        }
    }

    function pageLoad() {
        setTimeout(() => {
            extractSearchInfo();
            extractShoppingInfo();
            console.log('네이버 쇼핑 페이지 로그:', PageLog);
        }, 2000);
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
            PageLog = createShoppingLog();
            pageLoad();
            sendToServer(PageLog);
        });

        window.addEventListener('beforeunload', () => {
            sendToServer(PageLog);
        });
    }

    return {
        init,
    };
})();

window.NaverShoppingHandler = NaverShoppingHandler;
