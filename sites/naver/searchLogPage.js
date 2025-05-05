(function () {
    // 네이버 검색 결과 페이지인지 확인 (예: https://search.naver.com/search.naver?query=...)
    const currentUrl = window.location.href;

    if (!currentUrl.includes('search.naver.com/search.naver')) {
        return; // 네이버 검색 결과 페이지가 아니면 종료
    }

    // URL에서 query 파라미터 추출
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('query') || 'unknown';

    // 기본 로그 정보 구성
    const logData = {
        type: 'search',
        searchQuery: query,
        timestamp: new Date().toISOString(),
        url: currentUrl,
        referrer: document.referrer || 'direct',
        userAgent: navigator.userAgent,
    };

    // 로그 출력 (디버깅용)
    console.log('Search Log:', logData);

    // 서버로 로그 전송 (예시)
    // sendToServer(logData); // 여기에 서버로 보내는 로직 추가
})();
