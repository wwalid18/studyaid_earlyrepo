(() => {
  const selection = window.getSelection()?.toString();
  if (selection) {
    chrome.runtime.sendMessage({
      type: 'SAVE_HIGHLIGHT',
      text: selection,
      url: window.location.href,
      date: new Date().toISOString(),
    });
  }
})(); 