// import React from 'react';
import './AuthPage.css';

const highlights = [
  { text: 'this paragraph is a highlighted and ...', url: 'www.example.com', date: '1 July 2023' },
  { text: 'this paragraph is a highlighted and ...', url: 'www.example.com', date: '1 July 2023' },
  { text: 'this paragraph is a highlighted and ...', url: 'www.example.com', date: '1 July 2023' },
  { text: 'this paragraph is a highlighted and ...', url: 'www.example.com', date: '1 July 2023' },
  { text: 'this paragraph is a highlighted and ...', url: 'www.example.com', date: '1 July 2023' },
];

const Highlights = () => {
  return (
    <div className="auth-container highlights-container">
      <img src="/studyaid-icon.png" alt="StudyAid Logo" className="studyaid-icon" />
      <div className="highlights-header">
        <div>
          <div className="highlights-username">Username</div>
          <div className="highlights-email">name@gmail.com</div>
        </div>
        <div className="highlights-icons">
          <span className="icon">⚙️</span>
        </div>
      </div>
      <div className="highlights-list">
        {highlights.map((h, i) => (
          <div className="highlight-item" key={i}>
            <div className="highlight-text">{h.text}</div>
            <div className="highlight-meta">
              <span className="highlight-url">{h.url}</span>
              <span className="highlight-date">{h.date}</span>
            </div>
          </div>
        ))}
      </div>
      <button className="auth-btn gradient-btn export-btn">Export Highlights</button>
    </div>
  );
};

export default Highlights; 