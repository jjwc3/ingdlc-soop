chrome.runtime.onMessage.addListener(async (message, sender) => {
  if (message.action === 'INGDLC_SIDE') {
    if (sender.tab?.id) {
      await chrome.sidePanel.open({ tabId: sender.tab.id });
    }
  }
});