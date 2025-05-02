document.getElementById("downloadBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "DOWNLOAD_LOGS" });
});
