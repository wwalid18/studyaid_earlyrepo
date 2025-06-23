import React from 'react';
import './AuthPage.css';

const Login = ({ onRouteChange }: { onRouteChange?: (route: string) => void }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onRouteChange) onRouteChange('highlights');
  };
  return (
    <div className="auth-container">
      <div className="auth-header center-header">
        <img src="/studyaid-icon.png" alt="StudyAid Logo" className="studyaid-icon" />
        <h2 className="center-title">Get Started With<br />StudyAid AI</h2>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" className="auth-input" />
        <input type="password" placeholder="Password" className="auth-input" />
        <div className="auth-links">
          <span className="auth-link" onClick={() => onRouteChange && onRouteChange('forgot')}>forgot password?</span>
        </div>
        <button type="submit" className="auth-btn gradient-btn">Sign in</button>
      </form>
      <div className="auth-footer">
        <span>New to StudyAid ?</span>
        <button className="auth-btn secondary-btn" onClick={() => onRouteChange && onRouteChange('signup')}>Create account</button>
      </div>
    </div>
  );
};

export default Login; 