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

const Highlights = ({
  onRouteChange: _onRouteChange,
  onLogout,
}: {
  onRouteChange?: (route: string) => void;
  onLogout?: () => void;
}) => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [selection, setSelection] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteIdx, setConfirmDeleteIdx] = useState<number | null>(null);

  useEffect(() => {
    chrome.storage.local.get({ highlights: [] }, (result) => {
      setHighlights(result.highlights);
    });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (
        tab?.id &&
        tab.url &&
        !tab.url.startsWith('chrome://') &&
        !tab.url.startsWith('chrome-extension://') &&
        !tab.url.startsWith('edge://')
      ) {
        chrome.scripting.executeScript(
          {
            target: { tabId: tab.id },
            func: () => window.getSelection()?.toString() || ''
          },
          (results) => {
            if (results && results[0] && results[0].result) {
              const sel = results[0].result.trim() || null;
              setSelection(sel);
              setShowModal(!!sel);
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
            setHighlights(highlights);
            setSelection(null);
            setShowModal(false);
          });
        });
      }
    });
  };

  const handleCancel = () => {
    setSelection(null);
    setShowModal(false);
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
          <button className="auth-btn secondary-btn" style={{padding:'0.3rem 1.2rem', fontSize:'0.95rem'}} onClick={onLogout}>Logout</button>
        </div>
      </div>
      {/* Modal for saving highlight */}
      {showModal && selection && (
        <div className="highlight-modal-overlay">
          <div className="highlight-modal">
            <button className="modal-close-btn" onClick={handleCancel} title="Cancel">×</button>
            <div className="modal-highlight-text">{selection}</div>
            <button className="auth-btn gradient-btn modal-save-btn" onClick={handleSaveHighlight}>
              Save Highlight
            </button>
          </div>
        </div>
      )}
      <div className="highlights-list" style={{ filter: showModal ? 'blur(2px)' : 'none' }}>
        {highlights.length === 0 && <div style={{ color: '#b0b3c7', textAlign: 'center' }}>No saved highlights yet.</div>}
        {highlights.map((h, i) => (
          <div className="highlight-item" key={i}>
            <button
              className="highlight-delete-btn"
              title="Delete highlight"
              onClick={() => setConfirmDeleteIdx(i)}
            >×</button>
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
            {/* Custom confirmation modal for delete */}
            {confirmDeleteIdx === i && (
              <div className="delete-confirm-modal">
                <div className="delete-confirm-content">
                  <span>Delete this highlight?</span>
                  <div className="delete-confirm-actions">
                    <button className="auth-btn gradient-btn" style={{padding:'0.3rem 1.2rem', fontSize:'0.95rem'}} onClick={() => {
                      const newHighlights = highlights.filter((_, idx) => idx !== i);
                      chrome.storage.local.set({ highlights: newHighlights }, () => {
                        setHighlights(newHighlights);
                        setConfirmDeleteIdx(null);
                      });
                    }}>Delete</button>
                    <button className="auth-btn secondary-btn" style={{padding:'0.3rem 1.2rem', fontSize:'0.95rem', marginLeft:'0.5rem'}} onClick={() => setConfirmDeleteIdx(null)}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <button className="auth-btn gradient-btn export-btn">Export Highlights</button>
    </div>
  );
};

export default Highlights; 