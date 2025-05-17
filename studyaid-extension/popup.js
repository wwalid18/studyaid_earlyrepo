document.addEventListener('DOMContentLoaded', () => {
  const selectedTextEl = document.getElementById('selected-text');
  const saveButton = document.getElementById('save-highlight');
  const highlightsList = document.getElementById('highlights-list');
  const exportButton = document.createElement('button');
  exportButton.id = 'export-highlights';
  exportButton.textContent = 'Export Highlights';
  exportButton.style.marginBottom = '10px';
  exportButton.style.background = '#28a745';
  exportButton.style.color = 'white';
  exportButton.style.border = 'none';
  exportButton.style.padding = '5px 10px';
  exportButton.style.cursor = 'pointer';
  exportButton.style.borderRadius = '3px';
  exportButton.addEventListener('click', exportHighlights);
  document.querySelector('.current-selection').insertBefore(exportButton, saveButton);

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
      let highlights = result.highlights || [];
      highlightsList.innerHTML = '';
      if (highlights.length === 0) {
        highlightsList.innerHTML = '<p>No highlights saved.</p>';
        return;
      }

      const indexedHighlights = highlights.map((highlight, idx) => ({ ...highlight, originalIndex: idx }));
      indexedHighlights.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      indexedHighlights.forEach((highlight, sortedIndex) => {
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

        const barDiv = document.createElement('div');
        barDiv.className = 'highlight-bar';
        barDiv.innerHTML = `
          <div class="highlight-meta">
            <a href="${highlight.url}" target="_blank">${highlight.url}</a>
            <br>
            <span>Saved: ${savedDateTime}</span>
          </div>
          <button class="delete-highlight" data-index="${highlight.originalIndex}">X</button>
        `;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'highlight-content';

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

        contentDiv.appendChild(textDiv);
        div.appendChild(barDiv);
        div.appendChild(contentDiv);
        highlightsList.appendChild(div);
      });

      document.querySelectorAll('.highlight').forEach((highlightDiv) => {
        if (highlightDiv.dataset.isTruncated === 'true') {
          highlightDiv.addEventListener('click', (e) => {
            const textDiv = highlightDiv.querySelector('.highlight-text');
            if (!textDiv.classList.contains('full')) {
              textDiv.classList.add('full');
              highlightDiv.style.backgroundColor = '#e6f3ff';
            } else {
              textDiv.classList.remove('full');
              highlightDiv.style.backgroundColor = '#f9f9f9';
            }
            e.stopPropagation();
          });
        }
      });

      document.querySelectorAll('.delete-highlight').forEach((button) => {
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          const index = parseInt(button.dataset.index);
          chrome.storage.local.get(['highlights'], (result) => {
            let highlights = result.highlights || [];
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

  async function exportHighlights() {
    chrome.storage.local.get(['highlights'], (result) => {
      const highlights = result.highlights || [];
      if (highlights.length === 0) {
        alert('No highlights to export!');
        return;
      }

      const dataToSend = highlights.map(h => ({
        url: h.url,
        text: h.text,
        timestamp: h.timestamp
      }));

      console.log('Sending data to backend:', dataToSend);

      fetch('http://localhost:5000/api/highlights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Highlights exported successfully:', data);
        alert('Highlights exported to backend!');
      })
      .catch(error => {
        console.error('Error exporting highlights:', error.message);
        alert(`Failed to export highlights: ${error.message}. Check the console for details.`);
      });
    });
  }

  updateSelectedText();
  setInterval(updateSelectedText, 500);
  renderHighlights();
});