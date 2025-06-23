chrome.action.onClicked.addListener((tab) => {
  if (
    tab.url &&
    !tab.url.startsWith('chrome://') &&
    !tab.url.startsWith('chrome-extension://')
  ) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['contentScript.js']
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SAVE_HIGHLIGHT') {
    chrome.storage.local.get({ highlights: [] }, (result) => {
      const highlights = result.highlights;
      highlights.unshift({
        text: message.text,
        url: message.url,
        date: message.date
      });
      chrome.storage.local.set({ highlights });
    });
  }
}); 