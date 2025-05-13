document.addEventListener('DOMContentLoaded', () => {
  const selectedTextEl = document.getElementById('selected-text');
  const saveButton = document.getElementById('save-highlight');
  const highlightsList = document.getElementById('highlights-list');

  function getSelection() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (chrome.runtime.lastError) {
          console.warn('getSelection failed (tab query):', chrome.runtime.lastError.message);
          resolve('');
          return;
        }
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getSelection' }, (response) => {
          if (chrome.runtime.lastError) {
            console.warn('getSelection failed:', chrome.runtime.lastError.message);
            resolve('');
          } else if (!response) {
            console.warn('No response from content script');
            resolve('');
          } else {
            resolve(response.selectedText || '');
          }
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
      }, 200);
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

              chrome.tabs.sendMessage(tabs[0].id, { action: 'clearSelection' }, () => {
                if (chrome.runtime.lastError) {
                  console.warn('clearSelection failed:', chrome.runtime.lastError.message);
                }
              });
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
        textDiv.dataset.fullText = highlight.text;
        textDiv.textContent = highlight.text;

        const tempDiv = document.createElement('div');
        tempDiv.style.display = '-webkit-box';
        tempDiv.style.webkitLineClamp = '2';
        tempDiv.style.webkitBoxOrient = 'vertical';
        tempDiv.style.overflow = 'hidden';
        tempDiv.style.visibility = 'hidden';
        tempDiv.style.position = 'absolute';
        tempDiv.textContent = highlight.text;
        document.body.appendChild(tempDiv);
        const needsToggle = tempDiv.scrollHeight > tempDiv.clientHeight;
        document.body.removeChild(tempDiv);

        if (needsToggle) {
          div.dataset.isTruncated = 'true';
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

      document.querySelectorAll('.highlight').forEach((highlightDiv) => {
        if (highlightDiv.dataset.isTruncated === 'true') {
          highlightDiv.addEventListener('click', (e) => {
            const textDiv = highlightDiv.querySelector('.highlight-text');
            if (!textDiv.classList.contains('full')) {
              textDiv.classList.add('full');
              highlightDiv.style.backgroundColor = '#e6f3ff'; // Visual feedback
            } else {
              textDiv.classList.remove('full');
              highlightDiv.style.backgroundColor = '#f9f9f9'; // Reset background
            }
            e.stopPropagation(); // Prevent event bubbling
          });
        }
      });

      document.querySelectorAll('.delete-highlight').forEach((button) => {
        button.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent frame click from triggering
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