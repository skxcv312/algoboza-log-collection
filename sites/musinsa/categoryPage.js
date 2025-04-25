const MusinsaCategoryHandler = (() => {
  const PageLog = createCategoryLog();
  var categoryId;

  function getCategory(categoryEl) {
    if (categoryEl) {
      const categoryName = categoryEl.getAttribute("data-category-name");
      return categoryName.split("|");
    }
  }

  function extractDetails() {
    const filterEl = document.querySelectorAll(
      'div[data-section-name="delete_filter_list"]'
    );
    if (filterEl) {
      PageLog.details = Array.from(filterEl)
        .map((el) => el.innerText.trim())
        .filter(Boolean);
    }
  }

  function extractInfo(Url) {
    const url = new URL(Url);
    categoryId = url.pathname.split("/").pop(); // 상품 코드만 분리 "002022"
    const categoryEl = document.querySelector(
      `span[data-category-id="${categoryId}"]`
    );
    if (categoryEl) {
      PageLog.category = getCategory(categoryEl);
    }
  }

  function handleClickActions(rawTarget) {
    action = extractButtonAction(rawTarget);
    if (action) {
      const clickLog = createClickLog();
      clickLog.action = action;
      PageLog.clickTracking.push(clickLog);
    }
  }

  function pageLoad(Url) {
    setTimeout(() => {
      extractInfo(Url);
      extractDetails();
    }, 2000); // 렌더링 이후 감지
  }

  function click() {
    document.addEventListener("click", (e) => {
      const rawTarget = e.target;
      handleClickActions(rawTarget);

      //   sendToServer(PageLog);
    });
  }
  // 진입점
  function init() {
    pageLoad(window.location.href);
    click();

    watchUrlChange((newUrl) => {
      sendToServer(PageLog);
      pageLoad(newUrl);
    });

    window.addEventListener("beforeunload", () => {
      sendToServer(PageLog);
    });
  }

  return {
    init,
  };
})();
