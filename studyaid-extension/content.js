let currentSelection = '';

function updateSelection() {
  const selection = window.getSelection();
  currentSelection = selection.toString().trim();
  console.log('Text selected (main window):', currentSelection);

  document.querySelectorAll('iframe').forEach(iframe => {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      const iframeSelection = iframeDoc.getSelection();
      if (iframeSelection.toString().trim()) {
        currentSelection = iframeSelection.toString().trim();
        console.log('Text selected (iframe):', currentSelection);
      }
    } catch (e) {
      console.log('Cannot access iframe:', e);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateSelection(); // Initial update on page load
});

document.addEventListener('selectionchange', () => {
  updateSelection();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSelection') {
    console.log('Sending selection to popup:', currentSelection);
    sendResponse({ selectedText: currentSelection });
  } else if (request.action === 'clearSelection') {
    currentSelection = '';
    console.log('Selection cleared');
    sendResponse({ success: true });
  }
  return true; // Keep the message channel open for async responses
});