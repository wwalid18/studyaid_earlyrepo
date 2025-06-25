import React, { useRef, useState } from 'react';
import './AuthPage.css';

const ForgotPassword = ({ onRouteChange }: { onRouteChange?: (route: string) => void }) => {
  const emailRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const email = emailRef.current?.value || '';
    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (response.status === 200) {
        const data = await response.json();
        // Store the token in localStorage for demo auto-fill
        localStorage.setItem('reset_token', data.token);
        if (onRouteChange) onRouteChange('changepassword');
      } else {
        const err = await response.json().catch(() => ({}));
        setError(err?.message || 'Request failed. Please try again.');
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
      <h2 className="auth-title">Enter your email</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input ref={emailRef} type="email" placeholder="Email" className="auth-input" />
        <button type="submit" className="auth-btn gradient-btn" disabled={loading}>{loading ? 'Sending...' : 'Continue'}</button>
        {error && <div style={{ color: '#ff6b6b', marginTop: 8, textAlign: 'center', fontSize: '0.98rem' }}>{error}</div>}
      </form>
    </div>
  );
};

export default ForgotPassword; 