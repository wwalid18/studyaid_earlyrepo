chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const selection = window.getSelection().toString();
        if (!selection) return;
  
        chrome.storage.local.get({ highlights: [] }, (result) => {
          const newHighlight = {
            text: selection,
            url: window.location.href
          };
          const updated = [newHighlight, ...result.highlights];
          chrome.storage.local.set({ highlights: updated.slice(0, 100) });
        });
      }
    });
  });
  