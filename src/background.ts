let vodAvailable = false;
let vodTitle = "";
let vodURL = "";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'INGDLC_SIDE' && sender.tab?.id) {
    chrome.sidePanel.open({tabId: sender.tab.id}).catch((err) => console.error(err))
  }
  if (message.action === 'INGDLC_DOWNLOAD_FILE') {
    chrome.downloads.download({
      url: message.payload.url,
      filename: message.payload.filename,
      saveAs: false
    }).catch((err) => console.error(err))
  }
  if (message.action === "INGDLC_OS") {
    chrome.runtime.getPlatformInfo((info) => {
      sendResponse(info.os);
    })
    return true;
  }
  if (message.action === "INGDLC_DOWNLOAD_VOD") {
    vodAvailable = true;
    vodURL = message.payload.vodURL;
    vodTitle = message.payload.vodTitle;
    if (sender.tab?.id) {
      chrome.sidePanel.open({tabId: sender.tab.id}).catch(e => console.error(e));
    }
    setTimeout(() => {
      vodAvailable = false;
    }, 3000);
  }
  if (message.action === "INGDLC_SIDE_DL_REQ") {
    if (vodAvailable) {
      sendResponse({url: vodURL, title: vodTitle});
      vodAvailable = false;
    }
  }
});


chrome.webRequest.onCompleted.addListener(
    (details) => {
      if (details.url.includes("sooplive") && details.url.includes(".smil/manifest.m3u8")) {
        chrome.tabs.sendMessage(details.tabId, {action: "INGDLC_VOD", url: details.url}).catch(() => {
        })
      }
      return undefined;
    },
    {
      urls: [
        "https://*.sooplive.com/*"
      ],
      types: ["xmlhttprequest", "ping"]
    }
);
