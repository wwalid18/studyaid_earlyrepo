import React from 'react';
import './AuthPage.css';

const Signup = ({ onRouteChange }: { onRouteChange?: (route: string) => void }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onRouteChange) onRouteChange('login');
  };
  return (
    <div className="auth-container">
      <img src="/studyaid-icon.png" alt="StudyAid Logo" className="studyaid-icon" />
      <h2 className="auth-title">Create your account</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input type="text" placeholder="Username" className="auth-input" />
        <input type="email" placeholder="Email" className="auth-input" />
        <input type="password" placeholder="Password" className="auth-input" />
        <input type="password" placeholder="Confirm Password" className="auth-input" />
        <button type="submit" className="auth-btn gradient-btn">Create account</button>
      </form>
    </div>
  );
};

export default Signup; 