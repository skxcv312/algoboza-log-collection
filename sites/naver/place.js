const NaverPlaceLogger = (() => {
    let previousUrl = '';
    let logs = [];

    function createPageLog(type) {
        return {
            type,
            url: window.location.href,
            timestamp: new Date().toISOString(),
            title: document.title,
            placeName: null,
            placeCategory: null,
            placeAddress: null,
            placePhone: null,
            searchKeyword: null,
        };
    }

    // 로그를 localStorage에 저장하는 함수
    function sendToServer(log) {
        // 로그 배열에 추가
        logs.push(log);
        
        // localStorage에 저장
        try {
            const existingLogs = JSON.parse(localStorage.getItem('logs') || '[]');
            existingLogs.push(log);
            localStorage.setItem('logs', JSON.stringify(existingLogs));
            console.log('💾 로그 저장됨:', log);
        } catch (error) {
            console.error('로그 저장 실패:', error);
        }
    }

    function extractSearchKeyword() {
        const match = decodeURIComponent(window.location.href).match(/search\/([^/?]+)/);
        if (match) {
            const keyword = match[1];
            const searchLog = createPageLog('naver_place_search');
            searchLog.searchKeyword = keyword;
            console.log('🔍 검색 로그:', searchLog);
            sendToServer(searchLog); // 로그 저장
        }
    }

    // 네이버 플레이스 API 호출을 위한 함수
    async function fetchPlaceInfo(placeId) {
        try {
            // 1. API URL 구성
            const apiUrl = `https://map.naver.com/v5/api/sites/summary/${placeId}?lang=ko`;
            
            console.log(`🌐 API 요청: ${apiUrl}`);
            
            // 2. API 호출
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Referer': 'https://map.naver.com/'
                }
            });
            
            // 3. 응답 확인
            if (!response.ok) {
                throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
            }
            
            // 4. JSON 데이터 파싱
            const data = await response.json();
            console.log('📊 API 응답 데이터:', data);
            
            return data;
        } catch (error) {
            console.error('API 호출 실패:', error);
            return null;
        }
    }

    // 대체 API 호출 함수 (첫 번째 API가 실패할 경우)
    async function fetchPlaceInfoAlternative(placeId) {
        try {
            // 1. 대체 API URL 구성
            const apiUrl = `https://map.naver.com/v5/api/sites/detail/${placeId}?lang=ko`;
            
            console.log(`🌐 대체 API 요청: ${apiUrl}`);
            
            // 2. API 호출
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Referer': 'https://map.naver.com/'
                }
            });
            
            // 3. 응답 확인
            if (!response.ok) {
                throw new Error(`대체 API 요청 실패: ${response.status} ${response.statusText}`);
            }
            
            // 4. JSON 데이터 파싱
            const data = await response.json();
            console.log('📊 대체 API 응답 데이터:', data);
            
            return data;
        } catch (error) {
            console.error('대체 API 호출 실패:', error);
            return null;
        }
    }

    // 새로운 API 기반 장소 정보 추출 함수
    async function extractPlaceInfo() {
        try {
            // 1. URL에서 장소 ID 추출
            const placeId = window.location.href.match(/place\/([^?/]+)/)?.[1];
            if (!placeId) {
                console.warn('장소 ID를 찾을 수 없습니다.');
                return;
            }
            
            // 2. 기본 로그 생성
            const placeLog = createPageLog('naver_place_detail');
            placeLog.placeId = placeId;
            
            console.log('네이버 플레이스 API를 통해 정보 추출 시도 중...');
            
            // 3. API 호출
            let apiData = await fetchPlaceInfo(placeId);
            
            // 4. 첫 번째 API가 실패하면 대체 API 시도
            if (!apiData) {
                console.log('첫 번째 API 실패, 대체 API 시도...');
                apiData = await fetchPlaceInfoAlternative(placeId);
            }
            
            // 5. API 데이터에서 정보 추출
            if (apiData) {
                // 장소명 추출
                if (apiData.name) {
                    placeLog.placeName = apiData.name;
                    console.log('API에서 이름 찾음:', placeLog.placeName);
                }
                
                // 카테고리 정보 찾기
                if (apiData.category && apiData.category.name) {
                    placeLog.placeCategory = apiData.category.name;
                    console.log('API에서 카테고리 찾음:', placeLog.placeCategory);
                } else if (apiData.categoryName) {
                    placeLog.placeCategory = apiData.categoryName;
                    console.log('API에서 카테고리 찾음:', placeLog.placeCategory);
                }
                
                // 주소 정보 찾기
                if (apiData.address) {
                    placeLog.placeAddress = apiData.address;
                    console.log('API에서 주소 찾음:', placeLog.placeAddress);
                } else if (apiData.fullAddress) {
                    placeLog.placeAddress = apiData.fullAddress;
                    console.log('API에서 주소 찾음:', placeLog.placeAddress);
                }
                
                // 전화번호 정보 찾기
                if (apiData.phone) {
                    placeLog.placePhone = apiData.phone;
                    console.log('API에서 전화번호 찾음:', placeLog.placePhone);
                } else if (apiData.phoneNumber) {
                    placeLog.placePhone = apiData.phoneNumber;
                    console.log('API에서 전화번호 찾음:', placeLog.placePhone);
                }
            } else {
                console.log('API 호출 실패, DOM에서 정보 추출 시도...');
                // 6. API 호출이 실패한 경우, 기존 DOM 추출 방식으로 대체
                extractPlaceInfoFromDOM(placeLog);
            }
            
            // 7. 결과 기록
            console.log('📍 장소 상세 로그:', placeLog);
            sendToServer(placeLog); // 로그 저장
        } catch (error) {
            console.error('장소 정보 추출 실패:', error);
        }
    }

    // DOM에서 정보를 추출하는 백업 함수 (API 실패 시 사용)
    function extractPlaceInfoFromDOM(placeLog) {
        try {
            // 1. 장소명 추출 (제목)
            let nameElement = document.querySelector('#_title > div > span.PI7f0');
            if (nameElement) {
                placeLog.placeName = nameElement.textContent.trim();
                console.log('이름 찾음 (DOM):', placeLog.placeName);
            }
            
            // 2. 카테고리 정보 찾기
            let categoryElement = document.querySelector('#_title > div > span.lnJFt');
            if (categoryElement) {
                placeLog.placeCategory = categoryElement.textContent.trim();
                console.log('카테고리 찾음 (DOM):', placeLog.placeCategory);
            }
            
            // 3. 주소 정보 찾기
            let addressElement = document.querySelector('#app-root > div > div > div > div:nth-child(5) > div > div:nth-child(2) > div.place_section_content > div > div.O8qbU.tQY7D > div > a > span.LDgIH');
            if (addressElement) {
                placeLog.placeAddress = addressElement.textContent.trim();
                console.log('주소 찾음 (DOM):', placeLog.placeAddress);
            }
            
            // 4. 전화번호 정보 찾기
            let phoneElement = document.querySelector('#app-root > div > div > div > div:nth-child(5) > div > div:nth-child(2) > div.place_section_content > div > div.O8qbU.nbXkr > div > span.xlx7Q');
            if (phoneElement) {
                placeLog.placePhone = phoneElement.textContent.trim();
                console.log('전화번호 찾음 (DOM):', placeLog.placePhone);
            }
            
            // 5. 대체 선택자 시도
            if (!placeLog.placeName) {
                const titleElement = document.querySelector('.place_section_content .place_main_content .place_details h2, .place_section h2.place_name, h2.place_name');
                if (titleElement) {
                    placeLog.placeName = titleElement.textContent.trim();
                    console.log('이름 찾음 (대체 선택자):', placeLog.placeName);
                } else {
                    // 제목에서 추출 시도
                    const titleMatch = document.title.match(/^(.+?)(?:\s*[:|]\s*네이버|$)/);
                    if (titleMatch) {
                        placeLog.placeName = titleMatch[1].trim();
                        console.log('이름 찾음 (타이틀):', placeLog.placeName);
                    }
                }
            }
            
            if (!placeLog.placeCategory) {
                const catElement = document.querySelector('.place_section_content .place_main_content .place_details .category, .place_section .category');
                if (catElement) {
                    placeLog.placeCategory = catElement.textContent.trim();
                    console.log('카테고리 찾음 (대체 선택자):', placeLog.placeCategory);
                }
            }
            
            if (!placeLog.placeAddress) {
                const addrElement = document.querySelector('.place_section_content .place_main_content .place_details .address, .place_section .address');
                if (addrElement) {
                    placeLog.placeAddress = addrElement.textContent.trim();
                    console.log('주소 찾음 (대체 선택자):', placeLog.placeAddress);
                }
            }
            
            if (!placeLog.placePhone) {
                const phoneElement = document.querySelector('.place_section_content .place_main_content .place_details .phone, .place_section .phone');
                if (phoneElement) {
                    placeLog.placePhone = phoneElement.textContent.trim();
                    console.log('전화번호 찾음 (대체 선택자):', placeLog.placePhone);
                }
            }
            
            // 6. 메타 데이터 및 JSON 추출 시도
            if (!placeLog.placeCategory || !placeLog.placeAddress) {
                const metaDescription = document.querySelector('meta[name="description"]')?.content;
                if (metaDescription) {
                    console.log('메타 설명에서 정보 추출 시도:', metaDescription);
                    
                    // 카테고리 추출 시도
                    if (!placeLog.placeCategory) {
                        const categoryMatch = metaDescription.match(/(?:분류|카테고리)[:\s]*([^,\|]+)/i);
                        if (categoryMatch) {
                            placeLog.placeCategory = categoryMatch[1].trim();
                            console.log('메타에서 카테고리 찾음:', placeLog.placeCategory);
                        }
                    }
                    
                    // 주소 추출 시도
                    if (!placeLog.placeAddress) {
                        const addressMatch = metaDescription.match(/(?:주소)[:\s]*([^,\|]+)/i);
                        if (addressMatch) {
                            placeLog.placeAddress = addressMatch[1].trim();
                            console.log('메타에서 주소 찾음:', placeLog.placeAddress);
                        }
                    }
                }
            }
            
            // 7. 전체 HTML에서 JSON 데이터 찾기
            const htmlContent = document.documentElement.innerHTML;
            
            // 아직 정보가 부족하면 JSON 데이터 찾기
            if (!placeLog.placeCategory || !placeLog.placeAddress || !placeLog.placePhone) {
                // AJAX 데이터나 페이지 내 JSON 찾기
                const jsonPattern = new RegExp(`"id"\\s*:\\s*["']?${placeLog.placeId}["']?[^}]+?}`, 'g');
                const matches = htmlContent.match(jsonPattern);
                
                if (matches) {
                    console.log('JSON 데이터 패턴 찾음:', matches.length + '개');
                    
                    matches.forEach(match => {
                        try {
                            // JSON 형식으로 만들기
                            const jsonText = '{' + match + '}';
                            const data = JSON.parse(jsonText);
                            
                            if (data.category && !placeLog.placeCategory) {
                                placeLog.placeCategory = data.category;
                            }
                            if (data.address && !placeLog.placeAddress) {
                                placeLog.placeAddress = data.address;
                            }
                            if (data.phone && !placeLog.placePhone) {
                                placeLog.placePhone = data.phone;
                            }
                        } catch (e) {
                            // JSON 파싱 오류는 무시
                        }
                    });
                }
            }
        } catch (error) {
            console.error('DOM에서 장소 정보 추출 실패:', error);
        }
    }

    function observeUrlChange() {
        const observer = new MutationObserver(() => {
            const currentUrl = window.location.href;
            if (currentUrl !== previousUrl) {
                previousUrl = currentUrl;
                console.log('URL 변경 감지:', currentUrl);

                if (currentUrl.includes('/place/')) {
                    setTimeout(extractPlaceInfo, 1000); // 페이지 로드 시간 고려
                } else if (currentUrl.includes('/search/')) {
                    extractSearchKeyword();
                }
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
        
        // pushState, replaceState 이벤트도 감지 (SPA 페이지용)
        const originalPushState = history.pushState;
        history.pushState = function() {
            originalPushState.apply(this, arguments);
            setTimeout(checkUrlChange, 500);
        };
        
        const originalReplaceState = history.replaceState;
        history.replaceState = function() {
            originalReplaceState.apply(this, arguments);
            setTimeout(checkUrlChange, 500);
        };
        
        window.addEventListener('popstate', () => {
            setTimeout(checkUrlChange, 500);
        });
    }
    
    function checkUrlChange() {
        const currentUrl = window.location.href;
        if (currentUrl !== previousUrl) {
            previousUrl = currentUrl;
            console.log('URL 변경 감지 (이벤트):', currentUrl);
            
            if (currentUrl.includes('/place/')) {
                setTimeout(extractPlaceInfo, 1000);
            } else if (currentUrl.includes('/search/')) {
                extractSearchKeyword();
            }
        }
    }

    // JSON 파일로 로그 다운로드 기능
    function downloadLogs() {
        try {
            const storedLogs = JSON.parse(localStorage.getItem('logs') || '[]');
            if (storedLogs.length === 0) {
                alert('다운로드할 로그가 없습니다.');
                return;
            }
            
            const dataStr = JSON.stringify(storedLogs, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `naver_place_logs_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            
            console.log('로그 다운로드 완료:', storedLogs.length + '개 항목');
        } catch (error) {
            console.error('로그 다운로드 실패:', error);
        }
    }
    
    // 로그 정보 출력 함수
    function printAllLogs() {
        try {
            const storedLogs = JSON.parse(localStorage.getItem('logs') || '[]');
            console.table(storedLogs);
            return storedLogs.length + '개의 로그가 콘솔에 출력되었습니다.';
        } catch (error) {
            console.error('로그 출력 실패:', error);
            return '로그 출력에 실패했습니다.';
        }
    }

    function init() {
        previousUrl = window.location.href;
        console.log('네이버 플레이스 로거 초기화 중...');
        observeUrlChange();
        
        // 다운로드 버튼 추가
        setTimeout(addDownloadButton, 1500);

        // 현재 페이지 확인
        setTimeout(() => {
            if (window.location.href.includes('/place/')) {
                console.log('장소 페이지 감지, 정보 추출 시작...');
                extractPlaceInfo();
            } else if (window.location.href.includes('/search/')) {
                console.log('검색 페이지 감지, 키워드 추출 시작...');
                extractSearchKeyword();
            }
        }, 1500);
    }

    return { 
        init,
        downloadLogs,  // 로그 다운로드 함수 외부에서도 사용 가능하게
        getLogs: () => JSON.parse(localStorage.getItem('logs') || '[]'),  // 로그 확인용
        printAllLogs,  // 로그 콘솔 출력 함수
        clearLogs: () => {
            localStorage.removeItem('logs');
            logs = [];
            console.log('모든 로그가 삭제되었습니다.');
            
            // 버튼 업데이트
            const btnUpdate = document.getElementById('naver-logger-download-btn');
            if (btnUpdate) {
                btnUpdate.textContent = '📥 로그 다운로드 (0개)';
            }
            
            return '모든 로그가 삭제되었습니다.';
        }
    };
})();

// 전역 객체에 할당
window.NaverPlaceLogger = NaverPlaceLogger;

// 초기화 실행
NaverPlaceLogger.init();

// 실행 메시지
console.log('네이버 플레이스 API 로거가 시작되었습니다. 우측 하단의 버튼으로 로그를 다운로드할 수 있습니다.');