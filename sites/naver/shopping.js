/**
 * 네이버 쇼핑 로그 추적기 (불필요 항목 제거 버전)
 */

const NaverShoppingHandler = (() => {
    let PageLog = createShoppingLog();

    function createShoppingLog() {
        return {
            type: "naver_shopping",
            url: window.location.href,
            timestamp: getLocalTime(),
            title: document.title,
            searchText: null, // 값이 정상적으로 안 들어오면 제거 가능
        };
    }

    function extractSearchInfo() {
        const searchInput = document.querySelector('#nx_query') || document.querySelector('#searchInput');
        if (searchInput) {
            PageLog.searchText = searchInput.value.trim();
            console.log('검색어:', PageLog.searchText);
        }
    }

    function handleClickActions(rawTarget) {
        const linkElement = rawTarget.closest('a');
        if (linkElement) {
            const text = linkElement.innerText.trim();
            if (text) {
                const log = {
                    timestamp: getLocalTime(),
                    action: '링크 클릭: ' + text
                };
                sendToServer({ ...PageLog, click: log });
            }
        }

        const productElement = rawTarget.closest('.product_item, .product_card');
        if (productElement) {
            const productName = productElement.querySelector('.product_name, .product_title')?.innerText.trim();
            if (productName) {
                const log = {
                    timestamp: getLocalTime(),
                    action: '상품 클릭: ' + productName
                };
                sendToServer({ ...PageLog, click: log });
            }
        }
    }

    function pageLoad() {
        setTimeout(() => {
            extractSearchInfo();
            console.log('네이버 쇼핑 로그:', PageLog);
        }, 1500);
    }

    function click() {
        document.addEventListener('click', (e) => {
            handleClickActions(e.target);
        });
    }

    function init() {
        pageLoad();
        click();

        watchUrlChange((newUrl) => {
            PageLog = createShoppingLog();
            pageLoad();
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
