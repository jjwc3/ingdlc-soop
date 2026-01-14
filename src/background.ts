chrome.runtime.onMessage.addListener(async (message, sender) => {
  if (message.action === 'INGDLC_SIDE') {
    if (sender.tab?.id) {
      await chrome.sidePanel.open({ tabId: sender.tab.id });
    }
  }
  if (message.action === 'INGDLC_DOWNLOAD_FILE') {
    await chrome.downloads.download({
      url: message.payload.url,
      filename: message.payload.filename,
      saveAs: false
    });
  }
  if (message.action === 'INGDLC_FOCUS_INPUT') {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]?.id) {
        console.log(tabs[0])
        await chrome.tabs.sendMessage(tabs[0].id, message);
      }
    });
  }
});