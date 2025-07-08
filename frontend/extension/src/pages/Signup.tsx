import React, { useRef, useState } from 'react';
import './AuthPage.css';

// Eye icon SVGs
const EyeIcon = ({ open }: { open: boolean }) => open ? (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="8" ry="5" /><circle cx="12" cy="12" r="2.5" /><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" opacity=".2"/></svg>
) : (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="8" ry="5" /><path d="M3 3l18 18" stroke="#b0b3c7" strokeWidth="2"/><circle cx="12" cy="12" r="2.5" /><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" opacity=".2"/></svg>
);

const Signup = ({ onRouteChange }: { onRouteChange?: (route: string) => void }) => {
  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const username = usernameRef.current?.value || '';
    const email = emailRef.current?.value || '';
    const password = passwordRef.current?.value || '';
    const confirmPassword = confirmPasswordRef.current?.value || '';
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      if (response.status === 201) {
        if (onRouteChange) onRouteChange('login');
      } else {
        const err = await response.json().catch(() => ({}));
        setError(err?.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <img src="/studyaid-icon.png" alt="StudyAid Logo" className="studyaid-icon" />
      <h2 className="auth-title">Create your account</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input ref={usernameRef} type="text" placeholder="Username" className="auth-input" />
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
        <div style={{ position: 'relative' }}>
          <input
            ref={confirmPasswordRef}
            type={showPw2 ? 'text' : 'password'}
            placeholder="Confirm Password"
            className="auth-input pr-10"
          />
          <button
            type="button"
            aria-label={showPw2 ? 'Hide password' : 'Show password'}
            onClick={() => setShowPw2(v => !v)}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 0, margin: 0, color: '#b0b3c7', cursor: 'pointer' }}
            tabIndex={0}
          >
            <EyeIcon open={showPw2} />
          </button>
        </div>
        <button type="submit" className="auth-btn gradient-btn" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
        {error && <div style={{ color: '#ff6b6b', marginTop: 8, textAlign: 'center', fontSize: '0.98rem' }}>{error}</div>}
      </form>
    </div>
  );
};

export default Signup; 