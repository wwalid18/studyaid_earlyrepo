import React, { useEffect, useRef, useState } from 'react';
import './AuthPage.css';

const ChangePassword = ({ onRouteChange }: { onRouteChange?: (route: string) => void }) => {
  const [token, setToken] = useState('');
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
        <input ref={passwordRef} type="password" placeholder="New Password" className="auth-input" />
        <input ref={confirmPasswordRef} type="password" placeholder="Confirm New Password" className="auth-input" />
        <button type="submit" className="auth-btn gradient-btn" disabled={loading}>{loading ? 'Changing...' : 'Change password'}</button>
        {error && <div style={{ color: '#ff6b6b', marginTop: 8, textAlign: 'center', fontSize: '0.98rem', background: 'rgba(255,107,107,0.08)', borderRadius: 6, padding: '4px 0' }}>{error}</div>}
        {success && <div style={{ color: '#7f5fff', marginTop: 8, textAlign: 'center', fontSize: '0.98rem', background: 'rgba(127,95,255,0.08)', borderRadius: 6, padding: '4px 0' }}>{success}</div>}
      </form>
    </div>
  );
};

export default ChangePassword; 