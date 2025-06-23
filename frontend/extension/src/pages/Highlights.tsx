import { useEffect, useState } from 'react';
import './AuthPage.css';

interface Highlight {
  text: string;
  url: string;
  date: string;
}

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

const Highlights = () => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [selection, setSelection] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    chrome.storage.local.get({ highlights: [] }, (result) => {
      setHighlights(result.highlights);
    });

    // Get the current selection from the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.scripting.executeScript(
          {
            target: { tabId: tabs[0].id },
            func: () => window.getSelection()?.toString() || ''
          },
          (results) => {
            if (results && results[0] && results[0].result) {
              setSelection(results[0].result.trim() || null);
            }
          }
        );
      }
    });
  }, []);

  const handleSaveHighlight = () => {
    if (!selection) return;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id && tabs[0]?.url) {
        const newHighlight = {
          text: selection,
          url: tabs[0].url,
          date: new Date().toISOString(),
        };
        chrome.storage.local.get({ highlights: [] }, (result) => {
          const highlights = result.highlights;
          highlights.unshift(newHighlight);
          chrome.storage.local.set({ highlights }, () => {
            setHighlights([newHighlight, ...highlights]);
            setSelection(null);
          });
        });
      }
    });
  };

  const truncate = (text: string, max = 60) =>
    text.length > max ? text.slice(0, max) : text;

  return (
    <div className="auth-container highlights-container">
      <img src="/studyaid-icon.png" alt="StudyAid Logo" className="studyaid-icon" />
      <div className="highlights-header">
        <div>
          <div className="highlights-username">Username</div>
          <div className="highlights-email">name@gmail.com</div>
        </div>
        <div className="highlights-icons">
          <span className="icon">⚙️</span>
        </div>
      </div>
      {selection && (
        <button className="auth-btn gradient-btn export-btn" style={{ marginBottom: 16 }} onClick={handleSaveHighlight}>
          Save Highlight
        </button>
      )}
      <div className="highlights-list">
        {highlights.length === 0 && <div style={{ color: '#b0b3c7', textAlign: 'center' }}>No highlights yet.</div>}
        {highlights.map((h, i) => (
          <div className="highlight-item" key={i}>
            <div className="highlight-text" style={{ cursor: 'pointer' }} onClick={() => setExpanded(expanded === i ? null : i)}>
              {expanded === i ? h.text : truncate(h.text)}
              {h.text.length > 60 && (
                <span style={{ color: '#7f5fff', marginLeft: 4, cursor: 'pointer' }}>
                  {expanded === i ? ' (less)' : ' ...'}
                </span>
              )}
            </div>
            <div className="highlight-meta">
              <span className="highlight-url">{getDomain(h.url)}</span>
              <span className="highlight-date">{new Date(h.date).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
      <button className="auth-btn gradient-btn export-btn">Export Highlights</button>
    </div>
  );
};

export default Highlights; 