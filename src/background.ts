chrome.runtime.onMessage.addListener(async (message, sender) => {
	if (message.action === 'INGDLC_SIDE' && sender.tab?.id) {
		await chrome.sidePanel.open({tabId: sender.tab.id});
	}
	if (message.action === 'INGDLC_DOWNLOAD_FILE') {
		await chrome.downloads.download({
			url: message.payload.url,
			filename: message.payload.filename,
			saveAs: false
		});
	}
});


chrome.webRequest.onCompleted.addListener(
	(details) => {
		if (details.url.includes("sooplive.co.kr") && details.url.includes(".smil/manifest.m3u8")) {
			chrome.tabs.sendMessage(details.tabId, {action: "INGDLC_VOD", url: details.url}).catch(() => {
			})
		}
		return undefined;
	},
	{
		urls: ["<all_urls>"],
		types: ["xmlhttprequest", "ping"]
	}
);
