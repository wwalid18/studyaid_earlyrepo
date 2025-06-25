export const login = async (email: string, password: string) => {
  const res = await fetch('http://localhost:5000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (data.token) {
    await chrome.storage.local.set({ token: data.token });
  }
  return data;
};
import { useState, useEffect } from 'react';
import { Router } from './router';

function syncCookieAndStorage() {
  if (chrome && chrome.cookies && chrome.storage && chrome.storage.local) {
    chrome.cookies.get({ url: 'http://localhost:3000', name: 'access_token' }, (cookie) => {
      if (cookie && cookie.value) {
        chrome.storage.local.set({ access_token: cookie.value });
      } else {
        chrome.storage.local.remove(['access_token']);
      }
    });
  }
}

function setupCookieLogoutSync() {
  if (chrome && chrome.cookies && chrome.storage && chrome.storage.local) {
    chrome.cookies.onChanged.addListener(function(changeInfo) {
      if (
        changeInfo.cookie.name === 'access_token' &&
        (changeInfo.cookie.domain === 'localhost' || changeInfo.cookie.domain === '127.0.0.1') &&
        changeInfo.removed
      ) {
        chrome.storage.local.remove(['access_token']);
      }
    });
  }
}

function App() {
  const [route, setRoute] = useState<'login' | 'signup' | 'highlights' | 'forgot' | 'changepassword'>('login');
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    setupCookieLogoutSync();
    syncCookieAndStorage();
    const interval = setInterval(syncCookieAndStorage, 2000);
    // On mount, check for token in chrome.storage.local
    if (chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['access_token'], (result) => {
        if (result.access_token) {
          setRoute('highlights');
        } else {
          setRoute('login');
        }
        setCheckingAuth(false);
      });
      // Listen for storage changes to update UI
      function handleStorageChange(
        changes: Record<string, chrome.storage.StorageChange>,
        area: string
      ) {
        if (area === 'local' && changes.access_token) {
          if (changes.access_token.newValue) {
            setRoute('highlights');
          } else {
            setRoute('login');
          }
        }
      }
      chrome.storage.onChanged.addListener(handleStorageChange);
      return () => {
        clearInterval(interval);
        chrome.storage.onChanged.removeListener(handleStorageChange);
      };
    } else {
      setRoute('login');
      setCheckingAuth(false);
      return () => clearInterval(interval);
    }
  }, []);

  const handleRouteChange = (nextRoute: string) => {
    if (nextRoute === 'login') setRoute('login');
    else if (nextRoute === 'signup') setRoute('signup');
    else if (nextRoute === 'highlights') setRoute('highlights');
    else if (nextRoute === 'forgot') setRoute('forgot');
    else if (nextRoute === 'changepassword') setRoute('changepassword');
  };

  const handleLogout = () => {
    if (chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.remove(['access_token'], () => {
        // Remove the cookie as well
        if (chrome.cookies) {
          chrome.cookies.remove({ url: 'http://localhost:3000', name: 'access_token' }, () => {
            // If the active tab is on /temp-logout, redirect to /login, else reload
            chrome.tabs && chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              const tab = tabs[0];
              if (tab?.id && tab.url && tab.url.startsWith('http://localhost:3000/temp-logout')) {
                chrome.tabs.update(tab.id, { url: 'http://localhost:3000/login' });
              } else if (tab?.id) {
                chrome.tabs.reload(tab.id);
              }
            });
            setRoute('login');
          });
        } else {
          setRoute('login');
        }
      });
    } else {
      setRoute('login');
    }
  };

  if (checkingAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner" style={{ width: 48, height: 48, border: '6px solid #eee', borderTop: '6px solid #7f5fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return <Router route={route} onRouteChange={handleRouteChange} onLogout={handleLogout} />;
}

export default App;