chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_PAGE_TEXT") {
    const text = document.body.innerText;
    sendResponse({ text });
    return true; // Required for async response handling
  }
});