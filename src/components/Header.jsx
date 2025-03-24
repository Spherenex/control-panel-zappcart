import React from 'react';
import './Header.css';

const Header = ({ onPreviewClick, publishStatus, onPublish, isPreviewActive }) => {
  return (
    <header className="header">
      <div className="logo">Content Dashboard</div>
      <div className="header-actions">
        {publishStatus.message && (
          <div className={`notification ${publishStatus.type}`}>
            <span>{publishStatus.message}</span>
            {publishStatus.showButtons && (
              <div className="notification-actions">
                <button 
                  onClick={onPublish}
                  className="publish-btn"
                >
                  Publish Now
                </button>
                <button className="later-btn">Later</button>
              </div>
            )}
          </div>
        )}
        <button 
          className={`preview-btn ${isPreviewActive ? 'active' : ''}`} 
          onClick={onPreviewClick}
        >
          {isPreviewActive ? 'Back to Dashboard' : 'Preview Website'}
        </button>
      </div>
    </header>
  );
};

export default Header;