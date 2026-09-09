chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "GET_PAGE_TEXT") {
    const url = window.location.href
    const title = document.title || url
    let text = document.body ? document.body.innerText : ""
    text = text.replace(/\s+/g, " ").trim().slice(0, 20000)
    sendResponse({ url, title, text })
    return false
  }
})

export {}