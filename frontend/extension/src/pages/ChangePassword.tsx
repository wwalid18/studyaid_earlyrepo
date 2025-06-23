// ... existing code ...
// Remove: import React from 'react';
// ... existing code ...

const ChangePassword = () => {
  return (
    <div className="auth-container">
      <img src="/studyaid-icon.png" alt="StudyAid Logo" className="studyaid-icon" />
      <h2 className="auth-title">Change your password</h2>
      <form className="auth-form">
        <input type="password" placeholder="New Password" className="auth-input" />
        <input type="password" placeholder="Confirm New Password" className="auth-input" />
        <button type="submit" className="auth-btn gradient-btn">Change password</button>
      </form>
    </div>
  );
};

export default ChangePassword; 