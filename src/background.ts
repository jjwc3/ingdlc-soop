// background.ts
chrome.runtime.onMessage.addListener(async (message, sender) => {
  if (message.action === 'OPEN_SIDE_PANEL') {
    // sender.tab.id는 메시지를 보낸 현재 탭의 ID입니다.
    if (sender.tab?.id) {
      await chrome.sidePanel.open({ tabId: sender.tab.id });
    }
  }
});