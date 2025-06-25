import React, { useRef, useState } from 'react';
import './AuthPage.css';

const Signup = ({ onRouteChange }: { onRouteChange?: (route: string) => void }) => {
  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
        <input ref={passwordRef} type="password" placeholder="Password" className="auth-input" />
        <input ref={confirmPasswordRef} type="password" placeholder="Confirm Password" className="auth-input" />
        <button type="submit" className="auth-btn gradient-btn" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
        {error && <div style={{ color: '#ff6b6b', marginTop: 8, textAlign: 'center', fontSize: '0.98rem' }}>{error}</div>}
      </form>
    </div>
  );
};

export default Signup; 