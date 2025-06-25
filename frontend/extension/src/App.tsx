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

function App() {
  const [route, setRoute] = useState<'login' | 'signup' | 'highlights' | 'forgot' | 'changepassword'>('login');
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
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
    } else {
      setRoute('login');
      setCheckingAuth(false);
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
        setRoute('login');
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