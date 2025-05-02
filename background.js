// 서버에 로그를 전송
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const log = message.data;
  console.log(log);

  if (message.type === "SEND_LOG") {
    handleLogMessage(log);
  }
  if (message.type === "SAVE_LOG") {
    saveLogToLocalStorage(log);
  }
  if (message.type === "DOWNLOAD_LOGS") {
    downloadLogsFromStorage();
  }
});

// 다운로드
function downloadLogsFromStorage() {
  chrome.storage.local.get("logs", (result) => {
    const logs = result.logs || [];
    const jsonString = JSON.stringify(logs, null, 2);

    const blob = new Blob([jsonString], { type: "application/json" });
    const reader = new FileReader();

    reader.onload = function () {
      const base64Data = reader.result.split(",")[1];
      const url = `data:application/json;base64,${base64Data}`;

      chrome.downloads.download(
        {
          url: url,
          filename: `logs_${Date.now()}.json`,
          saveAs: true,
        },
        (downloadId) => {
          if (chrome.runtime.lastError) {
            console.error("다운로드 실패:", chrome.runtime.lastError.message);
          } else {
            console.log("다운로드 성공:", downloadId);
          }
        }
      );
    };

    reader.readAsDataURL(blob);
  });
}

async function handleLogMessage(log) {
  if (!log || typeof log !== "object" || !log.type) {
    console.warn("[handleLogMessage] 유효하지 않은 로그 객체입니다.", log);
    return;
  }

  try {
    const BASE_URL = "http://localhost:8080";
    const endpoint = `/api/collection/log/${log.type}`;
    const payload = JSON.stringify(log);

    console.log("[LOG-TYPE]", log.type);
    console.log("[LOG]", log);
    // console.log("[URL]", BASE_URL + endpoint);
    console.log("[EXTENSION ORIGIN]", location.origin);

    // 일단 서버로 로그 보내기는 주석처리
    const response = await fetch(BASE_URL + endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
    });

    console.log("[STATUS]", response.status); // Code 번호
    if (!response.ok) {
      console.error("[handleLogMessage] 응답 실패", await response.text());
    }
  } catch (err) {
    console.error("[handleLogMessage] 예외 발생", err);
  }
}

// 로컬 스토리지에 로그 저장
async function saveLogToLocalStorage(log) {
  chrome.storage.local.get(["logs"], (result) => {
    const logs = result.logs || [];
    logs.push(log);
    chrome.storage.local.set({ logs }, () => {
      console.log("로그 저장 완료", logs);
    });
  });
}
