document.getElementById("downloadBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "DOWNLOAD_LOGS" });
});

document.addEventListener("DOMContentLoaded", function () {
  const emailInput = document.getElementById("emailInput");
  const saveEmailBtn = document.getElementById("saveEmailBtn");
  const statusMessage = document.getElementById("statusMessage");

  // 이메일 저장 버튼 클릭 이벤트
  saveEmailBtn.addEventListener("click", function () {
    const email = emailInput.value.trim();
    if (email) {
      chrome.storage.local.set({ userEmail: email }, function () {
        statusMessage.textContent = "이메일이 저장되었습니다!";
        setTimeout(() => (statusMessage.textContent = ""), 2000);
      });
    } else {
      statusMessage.textContent = "이메일을 입력해주세요.";
    }
  });

  // 기존에 저장된 이메일 불러오기
  chrome.storage.local.get("userEmail", function (result) {
    if (result.userEmail) {
      emailInput.value = result.userEmail;
      statusMessage.textContent = "현재 저장된 이메일: " + result.userEmail;
    }
  });
});
