import { useEffect, useState } from 'react';
import './AuthPage.css';
import { getAccessToken } from '../storage';

interface Highlight {
  text: string;
  url: string;
  date: string;
}

interface UserInfo {
  username: string;
  email: string;
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
  const [user, setUser] = useState<UserInfo | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

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

  useEffect(() => {
    // Fetch user info
    setUserLoading(true);
    setUserError(null);
    getAccessToken().then(token => {
      if (!token) {
        setUserError('No access token');
        setUserLoading(false);
        return;
      }
      fetch('http://localhost:5000/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(async res => {
          if (!res.ok) throw new Error('Failed to fetch user info');
          const data = await res.json();
          setUser({ username: data.username, email: data.email });
        })
        .catch(() => {
          setUserError('Could not load user info');
        })
        .finally(() => setUserLoading(false));
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

  // Export highlights to backend one by one
  const handleExportHighlights = async () => {
    setExporting(true);
    setExportError(null);
    setExportSuccess(null);
    const highlightsToExport = [...highlights];
    if (highlightsToExport.length === 0) {
      setExporting(false);
      setExportError('No highlights to export.');
      return;
    }
    const token = await getAccessToken();
    if (!token) {
      setExporting(false);
      setExportError('Not authenticated. Please log in.');
      return;
    }
    let failed = false;
    for (const h of highlightsToExport) {
      try {
        const res = await fetch('http://localhost:5000/api/highlights', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            url: h.url,
            text: h.text,
            timestamp: h.date,
          }),
        });
        if (!res.ok) {
          failed = true;
          const err = await res.json().catch(() => ({}));
          setExportError(err?.message || 'Failed to export some highlights.');
          break;
        }
      } catch (err) {
        failed = true;
        setExportError('Network error while exporting.');
        break;
      }
    }
    if (!failed) {
      // Remove all highlights from storage
      chrome.storage.local.set({ highlights: [] }, () => {
        setHighlights([]);
        setExportSuccess('All highlights exported successfully!');
      });
    }
    setExporting(false);
  };

  // Handler for logo click: open settings page in web app
  const handleLogoClick = () => {
    const url = 'http://localhost:3000/settings';
    if (chrome && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url });
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="auth-container highlights-container">
      <img src="/studyaid-icon.png" alt="StudyAid Logo" className="studyaid-icon" onClick={handleLogoClick} style={{ cursor: 'pointer' }} />
      <div className="highlights-header">
        <div>
          {userLoading ? (
            <div style={{ color: '#b0b3c7', fontSize: '1.1rem', minHeight: 40 }}>Loading...</div>
          ) : userError ? (
            <div style={{ color: '#ff6b6b', fontSize: '1.1rem', minHeight: 40 }}>{userError}</div>
          ) : user ? (
            <>
              <div className="highlights-username">{user.username}</div>
              <div className="highlights-email">{user.email}</div>
            </>
          ) : null}
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
      {exportError && <div style={{ color: '#ff6b6b', marginBottom: 8, textAlign: 'center', fontSize: '0.98rem' }}>{exportError}</div>}
      {exportSuccess && <div style={{ color: '#7f5fff', marginBottom: 8, textAlign: 'center', fontSize: '0.98rem' }}>{exportSuccess}</div>}
      <button className="auth-btn gradient-btn export-btn" onClick={handleExportHighlights} disabled={exporting || highlights.length === 0}>
        {exporting ? 'Exporting...' : 'Export Highlights'}
      </button>
    </div>
  );
};

export default Highlights; 