type ContentType = "youtube" | "article"

function cleanText(value: string, limit = 20000) { return value.replace(/\s+/g, " ").trim().slice(0, limit) }

function getVideoId(url: URL) {
  if (url.hostname === "youtu.be") return url.pathname.slice(1).split("/")[0]
  return url.searchParams.get("v") || ""
}

function getVisibleTranscript() {
  const cues = Array.from(document.querySelectorAll("ytd-transcript-segment-renderer, .ytd-transcript-segment-renderer"))
  return cleanText(cues.map(cue => cue.textContent || "").join(" "))
}

function getStudyContent() {
  const currentUrl = new URL(window.location.href)
  const isYouTube = /(^|\.)youtube\.com$|(^|\.)youtu\.be$/.test(currentUrl.hostname) && Boolean(getVideoId(currentUrl))
  const title = cleanText(document.querySelector('meta[property="og:title"]')?.getAttribute("content") || document.querySelector("h1")?.textContent || document.title || currentUrl.href, 300)
  if (isYouTube) {
    const videoId = getVideoId(currentUrl)
    const transcript = getVisibleTranscript()
    const description = document.querySelector('meta[name="description"]')?.getAttribute("content") || ""
    return { url: `https://www.youtube.com/watch?v=${videoId}`, title, text: cleanText(`${title}. ${description}. ${transcript}`), transcript, contentType: "youtube" as ContentType, isVideo: true }
  }
  return { url: currentUrl.href, title, text: cleanText(document.body?.innerText || ""), transcript: "", contentType: "article" as ContentType, isVideo: false }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "GET_STUDY_CONTENT" || message?.type === "GET_PAGE_TEXT") {
    sendResponse(getStudyContent())
    return true
  }
})
