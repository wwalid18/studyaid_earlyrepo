import React from 'react';
import './AuthPage.css';

const ForgotPassword = ({ onRouteChange }: { onRouteChange?: (route: string) => void }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onRouteChange) onRouteChange('changepassword');
  };
  return (
    <div className="auth-container">
      <img src="/studyaid-icon.png" alt="StudyAid Logo" className="studyaid-icon" />
      <h2 className="auth-title">Enter your email</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" className="auth-input" />
        <button type="submit" className="auth-btn gradient-btn">Continue</button>
      </form>
    </div>
  );
};

export default ForgotPassword; 