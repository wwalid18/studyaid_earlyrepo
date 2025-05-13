document.addEventListener('DOMContentLoaded', () => {
  const selectedTextEl = document.getElementById('selected-text');
  const saveButton = document.getElementById('save-highlight');
  const highlightsList = document.getElementById('highlights-list');

  function getSelection() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getSelection' }, (response) => {
          resolve(response?.selectedText || '');
        });
      });
    });
  }

  async function updateSelectedText() {
    let selectedText = await getSelection();
    if (!selectedText) {
      setTimeout(async () => {
        selectedText = await getSelection();
        selectedTextEl.textContent = selectedText || 'No text selected.';
        saveButton.disabled = !selectedText;
      }, 100);
    } else {
      selectedTextEl.textContent = selectedText || 'No text selected.';
      saveButton.disabled = !selectedText;
    }
    console.log('Popup received selection:', selectedText);
  }

  saveButton.addEventListener('click', () => {
    getSelection().then((text) => {
      if (text) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const pageUrl = tabs[0].url;
          const timestamp = new Date().toISOString();
          
          chrome.storage.local.get(['highlights'], (result) => {
            const highlights = result.highlights || [];
            const isDuplicate = highlights.some(h => h.text === text && h.url === pageUrl);
            
            if (isDuplicate) {
              alert('This highlight is already saved!');
              return;
            }

            highlights.push({ text, url: pageUrl, timestamp });
            chrome.storage.local.set({ highlights }, () => {
              console.log('Highlight saved:', text);
              renderHighlights();
              selectedTextEl.textContent = 'No text selected.';
              saveButton.disabled = true;

              chrome.tabs.sendMessage(tabs[0].id, { action: 'clearSelection' });
            });
          });
        });
      }
    });
  });

  function renderHighlights() {
    chrome.storage.local.get(['highlights'], (result) => {
      const highlights = result.highlights || [];
      highlightsList.innerHTML = '';
      if (highlights.length === 0) {
        highlightsList.innerHTML = '<p>No highlights saved.</p>';
        return;
      }
      highlights.forEach((highlight, index) => {
        const div = document.createElement('div');
        div.className = 'highlight';
        const savedDateTime = new Date(highlight.timestamp).toLocaleString('en-US', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        });

        const textDiv = document.createElement('div');
        textDiv.className = 'highlight-text';
        textDiv.textContent = highlight.text;

        // Check if the text exceeds two lines (simplified check)
        const lines = highlight.text.split('\n');
        const needsToggle = lines.length > 2 || highlight.text.length > 100; // Adjust length threshold as needed
        if (needsToggle) {
          const ellipsisSpan = document.createElement('span');
          ellipsisSpan.className = 'toggle-ellipsis';
          ellipsisSpan.textContent = '...';
          textDiv.appendChild(ellipsisSpan);

          ellipsisSpan.addEventListener('click', () => {
            if (textDiv.classList.contains('full')) {
              textDiv.classList.remove('full');
              ellipsisSpan.textContent = '...';
            } else {
              textDiv.classList.add('full');
              ellipsisSpan.textContent = ' Collapse';
            }
          });
        }

        div.appendChild(textDiv);
        div.innerHTML += `
          <div class="highlight-meta">
            From: <a href="${highlight.url}" target="_blank">${highlight.url}</a><br>
            Saved Date & Time: ${savedDateTime}
          </div>
          <button class="delete-highlight" data-index="${index}">X</button>
        `;
        highlightsList.appendChild(div);
      });

      document.querySelectorAll('.delete-highlight').forEach((button) => {
        button.addEventListener('click', () => {
          const index = parseInt(button.dataset.index);
          chrome.storage.local.get(['highlights'], (result) => {
            const highlights = result.highlights || [];
            highlights.splice(index, 1);
            chrome.storage.local.set({ highlights }, () => {
              console.log('Highlight deleted at index:', index);
              renderHighlights();
            });
          });
        });
      });
    });
  }

  updateSelectedText();
  setInterval(updateSelectedText, 500);
  renderHighlights();
});