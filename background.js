// 서버에 로그를 전송
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SEND_LOG") {
    handleLogMessage(message.data);
  }
});

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
    // const response = await fetch(BASE_URL + endpoint, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: payload,
    // });

    // console.log("[STATUS]", response.status); // Code 번호
    // if (!response.ok) {
    //   console.error("[handleLogMessage] 응답 실패", await response.text());
    // }
  } catch (err) {
    console.error("[handleLogMessage] 예외 발생", err);
  }
}
