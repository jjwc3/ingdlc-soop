chrome.runtime.onMessage.addListener(async (message, sender) => {
  if (message.action === 'INGDLC_SIDE' && sender.tab?.id) {
      await chrome.sidePanel.open({ tabId: sender.tab.id });
  }
  if (message.action === 'INGDLC_DOWNLOAD_FILE') {
    await chrome.downloads.download({
      url: message.payload.url,
      filename: message.payload.filename,
      saveAs: false
    });
  }
});