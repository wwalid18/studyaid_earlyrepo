import React, { useEffect, useRef, useState } from 'react';
import './AuthPage.css';

// Eye icon SVGs
const EyeIcon = ({ open }: { open: boolean }) => open ? (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="8" ry="5" /><circle cx="12" cy="12" r="2.5" /><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" opacity=".2"/></svg>
) : (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="8" ry="5" /><path d="M3 3l18 18" stroke="#b0b3c7" strokeWidth="2"/><circle cx="12" cy="12" r="2.5" /><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" opacity=".2"/></svg>
);

const ChangePassword = ({ onRouteChange }: { onRouteChange?: (route: string) => void }) => {
  const [token, setToken] = useState('');
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  useEffect(() => {
    // Auto-fill token from localStorage for demo
    const t = localStorage.getItem('reset_token') || '';
    setToken(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const password = passwordRef.current?.value || '';
    const confirmPassword = confirmPasswordRef.current?.value || '';
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password })
      });
      if (response.status === 200) {
        // Clear token for demo
        localStorage.removeItem('reset_token');
        setSuccess('Password changed successfully! You can now log in.');
        setTimeout(() => {
          if (onRouteChange) onRouteChange('login');
        }, 1500);
      } else {
        const err = await response.json().catch(() => ({}));
        setError(err?.message || 'Reset failed. Please try again.');
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
      <h2 className="auth-title">Change your password</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div style={{ position: 'relative' }}>
          <input
            ref={passwordRef}
            type={showPw ? 'text' : 'password'}
            placeholder="New Password"
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
            placeholder="Confirm New Password"
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
        <button type="submit" className="auth-btn gradient-btn" disabled={loading}>{loading ? 'Changing...' : 'Change password'}</button>
        {error && <div style={{ color: '#ff6b6b', marginTop: 8, textAlign: 'center', fontSize: '0.98rem', background: 'rgba(255,107,107,0.08)', borderRadius: 6, padding: '4px 0' }}>{error}</div>}
        {success && <div style={{ color: '#7f5fff', marginTop: 8, textAlign: 'center', fontSize: '0.98rem', background: 'rgba(127,95,255,0.08)', borderRadius: 6, padding: '4px 0' }}>{success}</div>}
      </form>
    </div>
  );
};

export default ChangePassword; 