const MusinsaSearchHandler = (() => {
  const PageLog = createSearchLog();

  function extractDetails() {
    const filterEl = document.querySelectorAll(
      'div[data-section-name="delete_filter_list"]'
    );
    if (filterEl.length > 0) {
      const details = Array.from(filterEl)
        .map((el) => el.innerText.trim())
        .filter(Boolean);
      PageLog.details = details;
    }
  }

  function extractInfo() {
    const searchEl = document.querySelector('div[data-button-name="검색창"]');
    const searchText = searchEl?.innerText || null;

    PageLog.searchText = searchText;
  }

  function handleClickActions(rawTarget) {
    action = extractButtonAction(rawTarget);
    if (action) {
      const clickLog = createClickLog();
      clickLog.action = action;
      PageLog.clickTracking.push(clickLog);
    }
  }

  function PageLoad() {
    setTimeout(() => {
      extractInfo();
      extractDetails();
    }, 2000); // 렌더링 이후 감지를 위해 딜레이
  }

  function click() {
    window.addEventListener("click", (e) => {
      const rawTarget = e.target;
      handleClickActions(rawTarget);

      //   sendToServer(PageLog);
    });
  }

  function init() {
    PageLoad();
    click();

    watchUrlChange((newUrl) => {
      PageLoad(newUrl);
      sendToServer(PageLog);
    });

    window.addEventListener("beforeunload", () => {
      sendToServer(PageLog);
    });
  }

  return {
    init,
  };
})();
