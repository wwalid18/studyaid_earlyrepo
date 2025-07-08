import React, { useRef, useState } from 'react';
import './AuthPage.css';

function setAccessTokenCookie(token: string) {
  chrome.cookies.set({
    url: "http://localhost:3000",
    name: "access_token",
    value: token,
    path: "/"
  });
}
// Uncomment and use this for logout if needed
// function removeAccessTokenCookie() {
//   chrome.cookies.remove({
//     url: "http://localhost:3000",
//     name: "access_token"
//   });
// }

// Eye icon SVGs
const EyeIcon = ({ open }: { open: boolean }) => open ? (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="8" ry="5" /><circle cx="12" cy="12" r="2.5" /><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" opacity=".2"/></svg>
) : (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="8" ry="5" /><path d="M3 3l18 18" stroke="#b0b3c7" strokeWidth="2"/><circle cx="12" cy="12" r="2.5" /><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" opacity=".2"/></svg>
);

const Login = ({ onRouteChange }: { onRouteChange?: (route: string) => void }) => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const email = emailRef.current?.value || '';
    const password = passwordRef.current?.value || '';
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (response.status === 200) {
        const data = await response.json();
        const accessToken = data.access_token;
        // Check if chrome.storage.local is available (extension context)
        if (chrome && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ access_token: accessToken }, () => {
            setAccessTokenCookie(accessToken);
            // Reload the active tab after login
            chrome.tabs && chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              if (tabs[0]?.id) chrome.tabs.reload(tabs[0].id);
            });
            if (onRouteChange) onRouteChange('highlights');
          });
        } else {
          // Fallback for non-extension environments (e.g., web dev server)
          setAccessTokenCookie(accessToken);
          if (onRouteChange) onRouteChange('highlights');
        }
      } else {
        const err = await response.json().catch(() => ({}));
        setError(err?.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header center-header">
        <img src="/studyaid-icon.png" alt="StudyAid Logo" className="studyaid-icon" />
        <h2 className="center-title">Get Started With<br />StudyAid AI</h2>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input ref={emailRef} type="email" placeholder="Email" className="auth-input" />
        <div style={{ position: 'relative' }}>
          <input
            ref={passwordRef}
            type={showPw ? 'text' : 'password'}
            placeholder="Password"
            className="auth-input pr-10"
          />
          <button
            type="button"
            aria-label={showPw ? 'Hide password' : 'Show password'}
            onClick={() => setShowPw(v => !v)}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 0, margin: 0, color: '#b0b3c7', cursor: 'pointer' }}
            tabIndex={0}
          >
            <EyeIcon open={showPw} />
          </button>
        </div>
        <div className="auth-links">
          <span className="auth-link" onClick={() => onRouteChange && onRouteChange('forgot')}>forgot password?</span>
        </div>
        <button type="submit" className="auth-btn gradient-btn" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
        {error && <div style={{ color: '#ff6b6b', marginTop: 8, textAlign: 'center', fontSize: '0.98rem' }}>{error}</div>}
      </form>
      <div className="auth-footer">
        <span>New to StudyAid ?</span>
        <button className="auth-btn secondary-btn" onClick={() => onRouteChange && onRouteChange('signup')}>Create account</button>
      </div>
    </div>
  );
};

export default Login; 